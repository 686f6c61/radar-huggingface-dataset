# litert-community/Ternary-Bonsai-8B

## Resumen

Ternary-Bonsai-8B es un paquete de pesos cuantizados en formato ternario (INT2) del modelo `prism-ml/Ternary-Bonsai-8B-unpacked`, derivado a su vez de Qwen3-8B. Lo publica la comunidad `litert-community` empaquetado específicamente para el runtime LiteRT-LM de Google AI Edge, con el objetivo de ejecutar un modelo de clase 8B en dispositivos móviles Android con un peso de descarga de solo 2,56 GB, frente a los 5,03 GB de un Qwen3-8B en GGUF Q4_K_M.

La innovación central es la cuantización ternaria: cada peso toma uno de tres valores (−1, 0, +1) acompañado de una escala, lo que reduce drásticamente el espacio de almacenamiento manteniendo la calidad de un modelo de 8B. Los bundles funcionan en los backends GPU (recomendado, el más rápido) y CPU del runtime LiteRT-LM, pero no en NPU. Están pensados para integrarse en la app Google AI Edge Gallery o en cualquier host que use `litert_lm_main`.

No se trata de un modelo nuevo ni reentrenado: son derivados cuantizados y reempaquetados del checkpoint Bonsai publicado por Prism ML, sin entrenamiento, fine-tuning ni datos de calibración adicionales. La licencia es Apache-2.0, heredada de Qwen3-8B (Copyright 2024 Alibaba Cloud).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-8B), pesos ternarios INT2 |
| Parametros totales | 8B (clase Qwen3-8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens en el bundle por defecto; 32768 en builds experimentales; `max_position_embeddings` del modelo = 65536 |
| Tipos de cuantizacion | INT2 ternario: per-channel (por defecto) e INT2 "all" (build experimental con SDPA); activaciones fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); no se distribuyen safetensors ni GGUF en este repo |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-8B, un transformer decoder-only de 8B parámetros. Sobre él, Prism ML aplica una cuantización ternaria en la que cada peso se representa con valores −1, 0 o +1 más una escala, y `litert-community` reempaqueta el resultado en bundles `.litertlm` para LiteRT-LM. El bundle por defecto usa cuantización INT2 per-channel con activaciones fp16 y 4096 tokens de contexto; existe un build experimental con INT2 en todos los componentes y atención fusionada (SDPA) que baja a 2,16 GB con 32k de contexto.

No hubo entrenamiento, fine-tuning ni calibración en esta conversión: son cuantizaciones post-entrenamiento y reempaquetados del checkpoint Bonsai ya publicado. Los bundles incluyen la plantilla de chat propia de Bonsai (Qwen3 ChatML con el bloque de razonamiento intacto) y metadatos de sampling embebidos (`TOP_P`, top-k 20, top-p 0,85, temperatura 0,5) que el host LiteRT-LM recoge sin configuración adicional. Una particularidad técnica relevante: aunque XNNPACK no tiene kernel INT2, las operaciones `FULLY_CONNECTED` ternarias caen en los kernels nativos de LiteRT, que sí manejan INT2 directamente, por lo que el backend CPU funciona pese a no estar optimizado para ello.

## Capacidades

- Generación de texto y conversación multi-turno mediante plantilla ChatML de Qwen3.
- Razonamiento con bloque de pensamiento (reasoning block) preservado en la plantilla de chat.
- Respuesta a prompts largos y difíciles, con calidad de clase 8B según el autor.
- Ejecución on-device en Android, en backend GPU y CPU.
- Inferencia en CPU de escritorio x86 mediante el paquete Python `litert-lm`.
- Integración con Google AI Edge Gallery y apps de ejemplo de `litert-samples`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente, visión, audio o multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales on-device en Android: el bundle de 2,56 GB cabe en la memoria libre de un móvil de gama alta reciente y permite conversaciones multi-turno sin conexión, con 4096 tokens de contexto por defecto.
- Descarga dentro de la propia app: el tamaño reducido (frente a los 5,03 GB de Qwen3-8B en Q4_K_M) hace viable distribuir el modelo como descarga integrada en la aplicación sin penalizar en exceso la experiencia de instalación.
- Razonamiento local con privacidad: al ejecutarse íntegramente en el dispositivo, los prompts y las respuestas no salen del terminal, adecuado para datos sensibles que no deben enviarse a la nube.
- Prototipado con LiteRT-LM en escritorio: usando el paquete Python `litert-lm` sobre CPU x86 se puede validar el comportamiento del modelo y de la plantilla de chat antes de portar la app a móvil.
- Aplicaciones de demo con Google AI Edge Gallery: cargar el `.litertlm` en la galería permite evaluar latencia y calidad percibida con el backend GPU sin escribir código de inferencia.
- Procesamiento por lotes de prompts cortos en movilidad: con prefill de 81 tok/s en GPU (Pixel 11 Pro XL), resulta apto para tareas de clasificación, resumen o extracción sobre textos de hasta unos miles de tokens en escenarios de campo sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento son de inferencia en dispositivo:

| Backend | Prefill | Decode | Time to first token |
|---|---|---|---|
| GPU (Tensor G6) | 81 tok/s | 5,8 tok/s | 3,3 s |
| CPU (Tensor G6) | 33 tok/s | 2,3 tok/s | 8,2 s |

Medición en Pixel 11 Pro XL (Tensor G6) con Google AI Edge Gallery 1.0.23, bundle `bonsai-8b-int2pc-4k-fp16.litertlm`, 256 tokens de prefill y 256 de decode, 3 ejecuciones, mediana. La primera carga en GPU tarda unos 4 minutos por compilación de programas GPU (posteriormente en caché: 15–20 s); la primera carga en CPU tarda unos 6 s.

## Requisitos de hardware

- VRAM/RAM estimada: 2,56 GB para el bundle por defecto (INT2 per-channel, 4k), 2,16 GB para el build experimental INT2 "all" con SDPA (32k).
- GPU recomendadas: backend GPU de LiteRT-LM en SoC móvil; verificado en Pixel 11 Pro XL (Tensor G6). No se especifican GPUs de escritorio compatibles.
- CPU: funciona en CPU móvil (verificado en Tensor G6) y en CPU x86 de escritorio vía el paquete Python `litert-lm`.
- NPU: no soportada por estos bundles.
- Cabe en GPU de consumo: no disponible (el runtime objetivo es móvil y CPU de escritorio, no se documentan GPUs discretas).
- Opciones de despliegue: LiteRT-LM (`litert_lm_main`), Google AI Edge Gallery, apps de ejemplo de `google-ai-edge/litert-samples`. No compatible con vLLM, llama.cpp, Ollama ni TGI, al no distribuirse en GGUF ni safetensors.
- Latencia y throughput: ver tabla de rendimiento; decode de 5,8 tok/s en GPU y 2,3 tok/s en CPU en el dispositivo de referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-8B (este repo) | 8B | 4096 (32k experimental) | INT2 `.litertlm`, 2,56 GB | Apache-2.0 | Hugging Face, LiteRT-LM |
| Ternary-Bonsai-1.7B | 1,7B | no disponible | INT2 `.litertlm`, 0,77 GB | Apache-2.0 | Hugging Face, LiteRT-LM |
| Qwen3-8B | 8B | no disponible en esta ficha | Q4_K_M GGUF, 5,03 GB | Apache-2.0 | Hugging Face |
| Qwen3-4B | 4B | no disponible en esta ficha | Q4_K_M GGUF, 2,50 GB | Apache-2.0 | Hugging Face |

La comparación de rendimiento de calidad frente a Qwen3-8B o Qwen3-4B no está disponible en la información proporcionada; solo se documentan tamaños de descarga y el posicionamiento del autor ("un 8B en la huella de un 4B").

## Limitaciones y advertencias

- Los builds experimentales (32k, SDPA) pueden no cargar según la versión de LiteRT / LiteRT-LM de la app; el autor recomienda empezar por el bundle de 4k.
- El contexto por defecto es de 4096 tokens; los builds de 32k no alcanzan el `max_position_embeddings` de 65536 del modelo base.
- No hay soporte de NPU en estos bundles.
- El backend CPU es notablemente más lento que GPU (2,3 frente a 5,8 tok/s de decode en el dispositivo de referencia).
- La primera carga en GPU tarda unos 4 minutos por compilación de programas; sin caché persistente la experiencia inicial es deficiente.
- La cuantización ternaria es agresiva: no se publican evaluaciones de degradación de calidad respecto al checkpoint original, por lo que el impacto en precisión es desconocido.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; al derivar de Qwen3-8B, hereda los del modelo base, cuyas fichas no se detallan aquí.
- Idiomas soportados: no disponible.
- Licencia Apache-2.0 permite uso comercial, pero se mantienen las atribuciones a Alibaba Cloud (Qwen3-8B) y a Prism ML (Bonsai).
- Los pesos son idénticos byte a byte desde la corrección de plantilla de chat del 2026-11-07; solo cambió la sección de metadatos. En runtimes LiteRT-LM anteriores a 0.18.0 la plantilla antigua sigue funcionando.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/Ternary-Bonsai-8B
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-8B-unpacked
- Variante 1.7B: https://huggingface.co/litert-community/Ternary-Bonsai-1.7B
- Qwen3-8B (modelo original): https://huggingface.co/Qwen/Qwen3-8B
- Licencia Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B/blob/main/LICENSE
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Google AI Edge Gallery: https://github.com/google-ai-edge/gallery
- Apps de ejemplo LiteRT: https://github.com/google-ai-edge/litert-samples
- Prism ML (Bonsai): no disponible como enlace en la información proporcionada
