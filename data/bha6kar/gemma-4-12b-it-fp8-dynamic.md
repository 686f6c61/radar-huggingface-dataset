# bha6kar/gemma-4-12b-it-fp8-dynamic

## Resumen

Gemma 4 12B it en cuantización FP8 dinámica es una versión optimizada del modelo `google/gemma-4-12B-it`, publicada por el usuario bha6kar en Hugging Face. Se trata de un trabajo derivado bajo licencia Apache 2.0 que aplica cuantización de punto flotante de 8 bits en modo dinámico (FP8_DYNAMIC) mediante `llm-compressor` de vLLM, con el objetivo de reducir el peso en memoria y acelerar la inferencia sin recalibración previa. El resultado es un checkpoint de 11.959.730.224 parámetros (unos 11,96 B) cuyo repositorio ocupa 13,1 GB, aproximadamente la mitad que el modelo base en bf16.

El modelo conserva la arquitectura original de Gemma 4 y está empaquetado en formato `compressed-tensors`, lo que permite cargarlo directamente con vLLM. Las capas de visión, audio, embeddings de tokens, normalizaciones y la cabeza de lenguaje (`lm_head`) se dejan sin cuantizar para preservar la estabilidad numérica de esas componentes sensibles. Esto lo convierte en una opción práctica para despliegues en producción donde el ahorro de VRAM y el throughput importan más que la fidelidad bit a bit respecto al modelo original.

Es relevante ahora porque la cuantización dinámica FP8 sin datos de calibración simplifica enormemente el pipeline de despliegue: no requiere recolectar un dataset de calibración ni ejecutar observadores de rango. No obstante, al no haberse publicado benchmarks ni evaluación, debe tratarse como un artefacto experimental cuya calidad de salida hay que verificar en tareas propias antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4), checkpoint cuantizado FP8 |
| Parametros totales | 11.959.730.224 (~11,96 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el comando de uso sugiere `--max-model-len 65536` |
| Tipos de cuantizacion | FP8 dinámico (esquema FP8_DYNAMIC); capas de visión, audio, embeddings, norm y lm_head sin cuantizar |
| Idiomas soportados | no disponible en la información proporcionada (el modelo base Gemma 4 es multilingüe, pero no se detallan idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización post-entrenamiento del modelo base `google/gemma-4-12B-it`, que emplea la arquitectura Gemma 4, un transformer multimodal con componentes de visión y audio (ambos presentes en la lista de módulos dejados sin cuantizar). La cuantización se realizó con la herramienta `llm-compressor` mediante el método `model_free_ptq` y el esquema `FP8_DYNAMIC`, sin datos de calibración. La revisión del modelo base utilizada fue `707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7`.

El método `model_free_ptq` convierte los pesos a FP8 de forma directa, aplicando escalas dinámicas en tiempo de ejecución para las activaciones. Al no haber calibración, no se recolectaron estadísticas de activación, lo que simplifica el proceso pero puede introducir mayor error numérico en comparación con esquemas estáticos calibrados. Los módulos multimodales y las capas de normalización y `lm_head` se mantienen en su precisión original para evitar degradaciones en esas rutas. No se dispone de información sobre los datos de entrenamiento originales del modelo base ni sobre procesos de RLHF/DPO en el material proporcionado.

## Capacidades

- Generación de texto y razonamiento conversacional, heredadas del modelo base Gemma 4 12B instruido.
- Procesamiento multimodal: el checkpoint incluye módulos de visión y audio, aunque no se detallan las tareas concretas soportadas.
- Razonamiento multi-paso: el comando de despliegue incluye `--reasoning-parser gemma4`, lo que indica soporte de modo de razonamiento estructurado.
- Integración con vLLM y el runtime de `compressed-tensors` para servir el modelo en producción.
- Tool calling / function calling: no confirmado explícitamente en la información proporcionada.
- Capacidades de agente: no confirmado en la información proporcionada.
- Capacidades multilingües: presumibles por el modelo base, pero no detalladas.
- Contexto largo: el comando sugerido permite `--max-model-len 65536`, es decir, hasta 65.536 tokens.

## Casos de uso

- Servicio de chat en producción con vLLM: el checkpoint está empaquetado en `compressed-tensors` y se sirve con `vllm serve`, lo que permite desplegar un asistente conversacional con menor huella de VRAM que el modelo bf16.
- Razonamiento con contexto largo: el límite sugerido de 65.536 tokens lo hace apto para analizar documentos extensos, resúmenes de contratos o conversaciones multi-turno largas.
- Procesamiento multimodal de documentos: al conservar los módulos de visión sin cuantizar, puede emplearse en extracción de información de imágenes y capturas, siempre que se valide la fidelidad de salida.
- Transcripción y análisis de audio: los módulos de audio permanecen en precisión original, lo que permite tareas de comprensión de audio en pipelines que ya integren vLLM.
- Evaluación comparativa de cuantizaciones: útil como referencia para medir la degradación de FP8 dinámico frente al modelo bf16 en tareas propias antes de adoptar la cuantización.
- Prototipado en infraestructura con VRAM limitada: el tamaño de 13,1 GB permite desplegarlo en GPUs de 24 GB (por ejemplo, RTX 4090) para pruebas, con margen para el KV cache a contextos moderados.
- Generación de código asistida: hereda las capacidades de generación de código del modelo base, aunque conviene validar la calidad tras la cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 13,1 GB en disco; en FP8, los pesos ocupan aproximadamente esa cifra en VRAM, más overhead del runtime y del KV cache.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB para producción con contextos largos; RTX 4090 24 GB o L4 24 GB para pruebas con contextos moderados.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y GPUs con 24 GB o más, siempre que se limite la longitud de contexto y el número de secuencias concurrentes.
- Opciones de despliegue: vLLM (soporte nativo vía `compressed-tensors`); no se confirma soporte en llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput estimados: no disponibles; dependen del hardware, la longitud de contexto y el batch concurrente. La cuantización FP8 suele mejorar el throughput frente a bf16 en GPUs con soporte FP8 nativo (Hopper, Ada Lovelace), pero no hay cifras publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bha6kar/gemma-4-12b-it-fp8-dynamic | ~11,96 B | hasta 65.536 (sugerido) | FP8 dinámico | Apache 2.0 | Hugging Face |
| google/gemma-4-12B-it (base) | ~11,96 B | no disponible | bf16 | Apache 2.0 | Hugging Face |
| Otras cuantizaciones de Gemma 4 12B | ~11,96 B | variable | variable (GGUF, AWQ, etc.) | según autor | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización puede alterar las salidas respecto al modelo bf16; el propio autor recomienda evaluar en las tareas propias antes de confiar en el checkpoint.
- Al usar FP8 dinámico sin calibración, el error numérico puede ser mayor que en esquemas estáticos calibrados, especialmente en capas con distribuciones de activación amplias.
- Riesgo de alucinación inherente al modelo base, no mitigado por la cuantización.
- Sesgos conocidos del modelo base Gemma 4 no documentados en la información proporcionada.
- Idiomas soportados no especificados; conviene verificar el comportamiento multilingüe antes de desplegar en producción.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y el NOTICE del trabajo derivado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción ni validación externa.
- El soporte de tool calling y agentes no está confirmado explícitamente para este checkpoint.
- Compatibilidad limitada a runtimes que soporten `compressed-tensors` (vLLM); otros motores de inferencia podrían no cargarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bha6kar/gemma-4-12b-it-fp8-dynamic
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Herramienta de cuantización llm-compressor: https://github.com/vllm-project/llm-compressor
- vLLM: https://github.com/vllm-project/vllm
