# litert-community/Qwen3.5-0.8B

## Resumen

`litert-community/Qwen3.5-0.8B` es una conversión del modelo Qwen3.5-0.8B de Alibaba al formato LiteRT-LM (`.litertlm`), pensada para inferencia on-device con el runtime LiteRT-LM de Google. El proyecto lo mantiene la comunidad `litert-community` y resuelve el problema de ejecutar un modelo de lenguaje híbrido en dispositivos con memoria limitada (móviles, portátiles) manteniendo un consumo de memoria casi plano con la longitud de contexto.

La relevancia de este paquete es doble: es el primer Qwen3.5 en formato LiteRT y el primer híbrido con arquitectura GatedDeltaNet servido por el runtime LiteRT-LM. Desde la actualización de 2026-08-13, es también el primero en ejecutar el escaneo de regla delta en GPU móvil (Metal). El modelo base tiene 0.8B parámetros, una ventana de contexto original de 262K tokens y es multimodal, aunque este paquete incluye únicamente el decodificador de texto (existe una variante VL con visión).

La arquitectura es híbrida: 18 capas de atención lineal GatedDeltaNet intercaladas con 6 capas de atención completa con puerta. Las capas lineales mantienen un estado recurrente de tamaño constante en lugar de una caché KV creciente, lo que reduce drásticamente el consumo de memoria en contextos largos. La conversión limita el presupuesto KV de las capas de atención a 4096 tokens, por lo que la longitud efectiva de contexto en esta versión LiteRT es menor que la del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GatedDeltaNet hibrida (18 capas de atencion lineal + 6 capas de atencion completa con puerta) |
| Parametros totales | 0.8B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Original: 262K tokens; conversion LiteRT: presupuesto KV de 4096 tokens en las capas de atencion |
| Tipos de cuantizacion | int8 dinamico en lineales y embedding (convs y delta rule en float); version float disponible |
| Idiomas soportados | no disponible (el modelo base Qwen3.5 es multilingue, pero la conversion no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | .litertlm (formato especifico de LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B de Alibaba emplea una arquitectura hibrida: bloques de atencion lineal GatedDeltaNet (regla delta con puerta) intercalados con bloques de atencion completa con puerta. En esta variante de 0.8B hay 18 capas de atencion lineal y 6 de atencion completa. Las capas lineales mantienen un estado recurrente de tamano constante por capa (convolucion + recurrencia) en lugar de una caché KV creciente, de modo que el consumo de memoria permanece casi plano con la longitud de contexto. Solo las 6 capas de atencion completa conservan KV, con un presupuesto de 4096 tokens.

Este paquete es una conversion, no un entrenamiento: los pesos provienen del checkpoint oficial `Qwen/Qwen3.5-0.8B`. El paquete principal elimina la torre de vision y las cabezas MTP (multitoken prediction) siguiendo el contrato de carga solo de texto `Qwen3_5ForCausalLM` del modelo upstream. La conversion utiliza kernels de regla delta re-expresados en forma libre de padding con rango ≤ 4 para que el delegado GPU los ejecute correctamente. Se exportan firmas de prefill de longitudes 1–1024 para que el runtime elija fragmentos ajustados. No se menciona el uso de RLHF ni DPO en la informacion disponible.

## Capacidades

- Generacion de texto autoregresiva en formato ChatML (plantilla simplificada).
- Conversaciones multi-turno correctas (verificado en la model card).
- Inferencia en CPU y GPU (Metal en macOS/iOS, OpenCL en Android).
- La variante `Qwen3.5-0.8B-VL_int8.litertlm` anade entrada de imagen: incluye el ViT del checkpoint (encoder fp16, adaptador int8), resolucion estatica 512×512 y escalera de prefill de seis firmas.
- Soporte de tokens de parada adicionales (`<|im_end|>` y `<|endoftext|>`).
- No incluye tool calling ni function calling (la plantilla simplificada omite esas secciones).
- No incluye modo thinking (deshabilitado mediante un bloque vacio ` thinking\n\n response` en cada turno).
- Capacidades multilingues no documentadas en la conversion.

## Casos de uso

- Chatbots locales en dispositivos moviles: el modelo puede gestionar conversaciones multi-turno con memoria casi plana gracias a la arquitectura hibrida, lo que permite ejecutarlo en iPhone o Android sin depender de la nube.
- Asistentes personales con privacidad: al ejecutarse on-device, los datos del usuario no salen del dispositivo, adecuado para aplicaciones de salud, finanzas o comunicacion sensible.
- Aplicaciones edge con restricciones de memoria: el tamano del paquete int8 (963 MB) y el consumo de VRAM reducido permiten desplegarlo en dispositivos con 2–6 GB de RAM.
- Prototipado rapido en macOS: con `litert-lm run` se puede probar el modelo localmente en un Mac (probado en M4 Max) con prefill de 1972 tok/s y decode de 161.8 tok/s en GPU.
- Vision por computadora en dispositivo (con la variante VL): clasificacion o descripcion de imagenes a resolucion 512×512 sin conexion, aprovechando el ViT incluido.
- Evaluacion de arquitecturas hibridas en edge: sirve como banco de pruebas para desarrolladores que quieran comparar el rendimiento de GatedDeltaNet frente a transformers puros en hardware movil.

## Benchmarks y rendimiento

La model card reporta un unico benchmark de calidad, GSM8K (greedy, 0-shot chain-of-thought, max-tokens 512, n=100, modo no thinking):

| Configuracion | GSM8K |
|---|---|
| PyTorch bf16 (referencia, MPS) | 12% |
| LiteRT int8 (este archivo) | 11% |

No se han publicado resultados de MMLU, HumanEval u otros benchmarks en la informacion disponible.

Rendimiento medido con `litert-lm benchmark` (litert-lm 0.16.0, Apple M4 Max, `-p 256 -d 256 --runs 3 --cache no`):

| Backend | Prefill (256) | Decode | TTFT |
|---|---|---|---|
| GPU | 1972 tok/s | 161.8 tok/s | 0.14 s |
| CPU | 666 tok/s | 46.7 tok/s | 0.41 s |

En iPhone 17 Pro (arranque en frio, prompt de 138 tokens):

| Backend | Prefill | Decode | TTFT | Pico de memoria |
|---|---|---|---|---|
| GPU (Metal) | 387 tok/s | 41.4 tok/s | 0.47 s | 5.48 GB |
| CPU | 170 tok/s | 14.6 tok/s | 0.93 s | 1.21 GB |

En Pixel 8a (Tensor G3, CPU): prefill 50–134 tok/s, decode 8.0–13.6 tok/s, TTFT 2.0–5.3 s. La GPU OpenCL no cabe en la memoria del telefono.

## Requisitos de hardware

- Tamano del paquete: 963 MB (int8 texto), 1.30 GB (int8 VL).
- Pico de memoria en iPhone 17 Pro: 5.48 GB en GPU, 1.21 GB en CPU.
- GPU recomendadas: Apple M4 Max (probado), GPU Metal en iPhone 17 Pro, CPU en Pixel 8a (GPU no disponible por memoria).
- No se especifican GPU de escritorio (NVIDIA/AMD), pero al ser un modelo de 0.8B con cuantizacion int8, es plausible que quepa en GPUs consumer con 4–6 GB de VRAM; no hay datos confirmados.
- Opciones de despliegue: runtime LiteRT-LM (`litert-lm run`), backend CPU o GPU (`--backend gpu`). No se menciona soporte para vLLM, llama.cpp ni Ollama en esta conversion.
- Latencia y throughput: ver tabla de benchmarks (prefill y decode por backend y dispositivo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Rendimiento GSM8K | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-0.8B (original, PyTorch) | 0.8B | 262K | safetensors | 12% (bf16, MPS) | apache-2.0 |
| litert-community/Qwen3.5-0.8B (esta conversion) | 0.8B | 262K original, 4096 KV efectivo | .litertlm | 11% (int8) | apache-2.0 |
| Luigi/qwen35-0.8b-litert | 0.8B | no disponible | .litertlm | no disponible | no disponible |
| Qwen3.5 4B | 4B | 262K | GGUF / otros | no disponible (mejor en codigo segun fuentes web) | apache-2.0 |

La conversion LiteRT pierde un punto porcentual en GSM8K respecto al original en bf16, pero gana portabilidad a dispositivos moviles. La version 4B del modelo base es mas capaz en tareas de codigo, segun el articulo de Codersera, pero requiere mas recursos.

## Limitaciones y advertencias

- El paquete principal es solo decodificador de texto: no incluye vision ni cabezas MTP, aunque el checkpoint original sea multimodal.
- La longitud efectiva de contexto esta limitada por el presupuesto KV de 4096 tokens en las capas de atencion; no se puede aprovechar la ventana completa de 262K del modelo original.
- La plantilla ChatML simplificada no soporta tool calling ni secciones de vision; el modo thinking esta deshabilitado.
- Rendimiento en GSM8K muy bajo (11%), por lo que no es adecuado para tareas de razonamiento aritmetico complejo; el articulo web indica que tambien falla en tareas de codigo.
- En Pixel 8a la GPU OpenCL no cabe en memoria; solo es viable CPU con decode de 8–14 tok/s.
- Requiere litert-lm >= 0.15; versiones anteriores no funcionan.
- El kernel GPU tiene una dependencia de una correccion upstream (LiteRT#9272) para evitar un error de forma en un op; si se usa el runtime sin esa correccion, puede haber fallos.
- No hay informacion sobre sesgos, alucinaciones o idiomas soportados en la model card.
- La licencia es apache-2.0, pero el uso comercial debe verificar las condiciones del modelo base Qwen3.5.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/litert-community/Qwen3.5-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Issue LiteRT#9272: https://github.com/google-ai-edge/LiteRT/issues/9272
- Repositorio relacionado (artefacto legacy): https://huggingface.co/litert-community/Qwen3.5-0.8B-LiteRT
- Repositorio de terceros (Luigi): https://huggingface.co/Luigi/qwen35-0.8b-litert
- Articulo de benchmark (Codersera): https://codersera.com/blog/run-and-benchmark-qwen35-08b/
- Pagina en Ollama: https://ollama.com/library/qwen3.5:0.8b
