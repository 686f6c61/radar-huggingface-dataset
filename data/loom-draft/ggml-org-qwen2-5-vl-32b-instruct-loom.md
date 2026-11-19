# loom-draft/ggml-org-Qwen2.5-VL-32B-Instruct-loom

## Resumen

Este repositorio no contiene un modelo entrenado, sino un paquete de despliegue en formato Loom para el checkpoint GGUF `Qwen2.5-VL-32B-Instruct-Q4_K_M.gguf` de Qwen. El autor (`loom-draft`) publica los programas `.loom` generados con `loom-next`, junto con un `model.json` de configuración, para ejecutar el modelo en GPUs AMD concretas: la APU Ryzen AI Max+ 395 ("Strix Halo", gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). El modelo subyacente es Qwen2.5-VL-32B-Instruct, un transformer multimodal de 32.000 millones de parámetros desarrollado por Alibaba Qwen, con licencia Apache 2.0.

El interés práctico del paquete es que ofrece una vía de inferencia nativa sobre ROCm/HIP para un modelo de visión-lenguaje de 32B cuantizado a Q4_K_M, con servidor compatible con la API de OpenAI (`/v1/chat/completions`), soporte de entrada de imagen vía `image_url` y un proyector multimodal separado (`mmproj-Qwen2.5-VL-32B-Instruct-f16.gguf`). Es relevante para quienes despliegan VLMs en hardware AMD de consumo o estación de trabajo sin pasar por CUDA.

La model card es explícita sobre el estado del artefacto: las mediciones de rendimiento frente a llama.cpp y todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPUs. Es decir, el paquete está publicado pero sin evidencia de validación registrada en el momento de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) Qwen2.5-VL; paquete de inferencia Loom sobre GGUF |
| Parametros totales | 32 000 millones (modelo base Qwen2.5-VL-32B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 000 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (checkpoint incluido); proyector multimodal en f16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base) + programas `.loom` y `weights.loom` generados |
| Salida maxima | 4096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones concurrentes |
| Hardware objetivo | AMD Ryzen AI Max+ 395 (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |
| API | OpenAI-style `/v1/chat/completions` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-VL-32B-Instruct, un transformer denso con codificador visual y proyector multimodal que acepta imágenes junto a texto. El paquete Loom no modifica los pesos: toma el GGUF oficial de `ggml-org` y genera programas `.loom` específicos por dispositivo mediante `loom-next`, un generador que, según la model card, opera sin LLM en el bucle. Los artefactos incluyen `program/*.loom`, `weights.loom`, `tokenizer.json`, `llm_config.json` y `model.json` con los ficheros fuente fijados por hash SHA-256, verificados por `loom-fetch`.

No se detallan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, fases de RLHF/DPO) ni innovaciones de decodificación. La model card del paquete tampoco documenta optimizaciones propias más allá de los parámetros de ejecución: `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU), `--pool_backing=fixed` (pool de memoria comprometido por adelantado) y `--parameter_mode=preload` (carga de pesos en host). La decodificación especulativa figura como "not applicable" en la tabla de features.

## Capacidades

- Generación de texto e instrucciones conversacionales en formato chat (pipeline `image-text-to-text`).
- Entrada de imagen mediante partes `image_url` al estilo OpenAI, con proyector `mmproj-Qwen2.5-VL-32B-Instruct-f16.gguf`.
- Ventana de contexto de 128 000 tokens por petición, adecuada para documentos largos o historiales extensos.
- Servidor HTTP con endpoint compatible con la API de OpenAI (`/v1/chat/completions`).
- Concurrencia de hasta 4 peticiones simultáneas.
- Tool calling: no disponible (marcado "not applicable").
- Modo razonamiento / thinking: no disponible (marcado "not applicable").
- Decodificación especulativa: no disponible (marcado "not applicable").
- Entrada o salida de audio: no disponible (marcado "not applicable").
- Muestreo (temperature, top_k, seed): estado "not determined" en la model card.

## Casos de uso

- Análisis de documentos escaneados en estación de trabajo AMD: el modelo acepta imágenes y texto con 128k tokens de contexto, lo que permite pasar facturas, contratos o informes completos y pedir extracción estructurada en una sola petición.
- Asistencia técnica sobre capturas de pantalla: con entrada `image_url`, se puede enviar una captura de error o de interfaz y obtener diagnóstico o instrucciones paso a paso, desplegado localmente en una Radeon AI PRO R9700 de 32 GB.
- Procesamiento por lotes de imágenes en pipelines internos: el endpoint `/v1/chat/completions` permite integrar el modelo en scripts y orquestadores existentes sin adaptadores propietarios, con hasta 4 peticiones concurrentes.
- Prototipado de asistentes multimodales en hardware ROCm: útil para equipos que desarrollan sobre Strix Halo o R9700 y necesitan un VLM de 32B cuantizado a Q4_K_M sin depender de CUDA.
- Descripción y etiquetado de imágenes para conjuntos de datos: generación de descripciones o metadatos sobre lotes de imágenes usando el proyector f16 y contexto largo para instrucciones de estilo detalladas.
- Evaluación comparativa de runtimes: el paquete sirve como artefacto de referencia para contrastar la salida de Loom frente a llama.cpp sobre el mismo GGUF, aunque las puertas de corrección aún no tienen mediciones registradas.
- Despliegue local con privacidad de datos: al ejecutarse en GPU local vía `loom-serve`, las imágenes y el texto no salen de la máquina, lo que encaja en entornos con requisitos de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo y Radeon AI PRO R9700 "are not yet re-measured", y que todas las puertas de corrección figuran sin ejecución registrada.

| Puerta de correccion | Estado Strix Halo | Estado R9700 |
|---|---|---|
| `kernel_tests` | no medida | no medida |
| `golden` | no medida | no medida |
| `compare` | no medida | no medida |
| `vision` | no medida | no medida |
| `consistency` | no medida | no medida |
| `spec` | no medida | no medida |
| `agent` | no medida | no medida |
| `agent_think_off` | no medida | no medida |
| `sampling` | no medida | no medida |
| `logits` | no medida | no medida |
| `decision` | no medida | no medida |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint es Q4_K_M de un modelo de 32B, por lo que se sitúa en el rango de los 20 GB de pesos, más el proyector f16 y el pool de memoria fijado con `--pool_backing=fixed`. La R9700 objetivo tiene 32 GB.
- GPU soportadas por el paquete: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no se documentan otras GPU; no hay confirmación de funcionamiento en RTX 4090, A100 o H100, que quedan fuera del alcance declarado del paquete (ROCm/HIP).
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` con el preset `chat` (Strix Halo) o `chat-r9700` (R9700), y `loom-serve` con `--device=amdgpu://`, `--pool_backing=fixed` y `--parameter_mode=preload`.
- Alternativas de despliegue: el GGUF base es compatible con llama.cpp, pero el paquete Loom no documenta integración con vLLM, TGI, Ollama ni otros runtimes.
- Latencia y throughput: no disponibles; las filas de rendimiento de la model card están pendientes de remedición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Runtime en el artefacto |
|---|---|---|---|---|---|
| Qwen2.5-VL-32B-Instruct (este paquete Loom, Q4_K_M) | 32B | 128 000 | Si | Apache 2.0 | Loom sobre ROCm (gfx1151, gfx1201) |
| ggml-org/Qwen2.5-VL-32B-Instruct-GGUF (checkpoint base) | 32B | 128 000 | Si | Apache 2.0 | llama.cpp y derivados |
| Qwen2.5-VL-7B-Instruct | 7B | 128 000 (según familia Qwen2.5-VL) | Si | Apache 2.0 | llama.cpp, vLLM, etc. |
| Qwen2.5-VL-72B-Instruct | 72B | 128 000 (según familia Qwen2.5-VL) | Si | Apache 2.0 | llama.cpp, vLLM, etc. |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparativa se limita a parámetros, contexto, licencia y disponibilidad de runtime.

## Limitaciones y advertencias

- El artefacto es un paquete de despliegue, no un modelo nuevo: cualquier limitación del Qwen2.5-VL-32B-Instruct base aplica sin cambios.
- Sin evidencia de validación: las once puertas de corrección y las mediciones frente a llama.cpp están sin registrar, por lo que no hay garantía publicada de equivalencia numérica con la referencia.
- Tool calling, modo thinking, decodificación especulativa y audio figuran como "not applicable"; no deben asumirse en producción.
- El comportamiento de muestreo (temperature, top_k, seed) está marcado como "not determined".
- Hardware restringido: solo se declaran Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no hay soporte documentado para CUDA ni para otras GPU AMD.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del checkpoint base y del proyector multimodal por separado.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; son los heredados del modelo base y deben evaluarse con pruebas propias.
- Idiomas soportados: no disponibles en la model card; no se debe asumir cobertura multilingüe sin verificación.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: sin comunidad que valide el artefacto.
- La búsqueda web devolvió resultados no relacionados (Loom, la herramienta de grabación de pantalla, y la marca de ropa Loom); no aportan información técnica sobre este paquete.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/ggml-org-Qwen2.5-VL-32B-Instruct-loom
- Checkpoint base GGUF: https://huggingface.co/ggml-org/Qwen2.5-VL-32B-Instruct-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
