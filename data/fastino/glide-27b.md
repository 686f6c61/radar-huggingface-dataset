# fastino/GLiDE-27B

## Resumen

GLiDE-27B es un modelo de decisión desarrollado por Fastino Labs, diseñado específicamente para clasificación, enrutamiento y puntuación de estados (texto, JSON o imágenes) mediante preguntas tipadas. A diferencia de los modelos generativos convencionales, GLiDE no produce texto: dado un estado y una o varias preguntas con opciones definidas, devuelve una distribución de probabilidad sobre cada opción en un único forward pass. Está construido sobre la arquitectura Qwen3.5 (tag `qwen3_5` en el Hub) y cuenta con 26.085.330.160 parámetros totales.

El modelo resuelve un problema concreto: sustituir pipelines de clasificación tradicionales (LLM + parsing de salida + lógica de post-procesado) por un modelo calibrado que emite probabilidades directamente, con latencia muy baja. Según la model card, alcanza 72,49 en el Decision Index 0.3.1 con una latencia mediana de 112 ms por petición sobre una RTX PRO 6000. Soporta tres tipos de pregunta: `choice` (hasta 255 opciones nombradas), `noul` (sí/no con P(yes)) y `score` (niveles ordenados).

Es relevante ahora porque propone un paradigma distinto al de los LLM generativos para tareas de decisión: un readout de 255 vías entrenado por destilación desde profesores de razonamiento, con contexto de hasta 40.000 tokens por pregunta y soporte multimodal. La licencia es `fastino-community` (no estándar, requiere revisión para uso comercial) y los pesos se distribuyen en safetensors bf16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de atención lineal (familia Qwen3.5, tag `qwen3_5`); incluye encoder de visión y readout de decisión de 255 vías |
| Parámetros totales | 26.085.330.160 (~26,1 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 40.000 tokens por prompt de pregunta (estado, pregunta, opciones y tokens de imagen) |
| Tipos de cuantización | no disponible (los pesos publicados son bf16) |
| Idiomas soportados | no disponible |
| Licencia | fastino-community (licencia `other` en el Hub) |
| Formato de pesos | safetensors (bf16); repo de 103,4 GB, pesos de 52,2 GB en disco |

## Arquitectura y entrenamiento

GLiDE-27B se apoya en una arquitectura de la familia Qwen3.5 con capas de atención lineal, para las que recomienda el paquete `flash-linear-attention==0.5.2` (sin él, transformers usa una implementación PyTorch mucho más lenta). El modelo se compone de tres bloques: un language model de 51,2 GB en bf16, un encoder de visión de 0,92 GB y un readout de decisión de 2,6 MB. Este readout de 255 vías es el componente que convierte el estado oculto en probabilidades sobre opciones, sin generar tokens (output_tokens = 0 en las respuestas de ejemplo).

Según el título del paper asociado (arXiv:2611.26509), el modelo se destila desde "profesores de razonamiento" para producir decisiones rápidas y calibradas. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La innovación técnica principal es el paradigma de "una decisión por forward pass": todas las preguntas de una petición (y de peticiones concurrentes) se puntúan juntas en micro-lotes, y cada pregunta consume un único forward pass en lugar de una generación autorregresiva.

## Capacidades

- Decisiones tipadas: `choice` (una entre hasta 255 opciones con nombre), `noul` (sí/no, devuelve P(yes)) y `score` (niveles ordenados con `expected_level` y probabilidades por nivel).
- Probabilidades calibradas para cada opción de cada pregunta, leídas directamente del readout de 255 vías.
- Entrada multimodal: el estado puede ser una cadena, cualquier valor JSON o una lista de partes de texto e imagen (PIL, rutas de fichero, bytes, base64 o data URLs).
- Contexto largo: hasta 40.000 tokens por prompt de pregunta, incluyendo tokens de imagen.
- Procesamiento por lotes: preguntas de una misma petición y de peticiones concurrentes se agrupan en micro-lotes.
- Interfaces: API Python (`glide.Glide`) y servidor HTTP compatible con el formato System One (`POST /v1/systemone`).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del Hub).
- No genera texto: no es un modelo de chat, resumen ni generación libre. No se documenta soporte de tool calling ni de razonamiento multi-paso en el sentido de agentes generativos.

## Casos de uso

- Clasificación de tickets de soporte: el ejemplo de la model card muestra cómo clasificar intención (`refund`, `cancel`, `track`, `other`), urgencia (`noul`) y prioridad (`score`) en una sola llamada, con probabilidades por opción que permiten umbrales y escalado automático.
- Enrutamiento de peticiones: usar preguntas `choice` para dirigir consultas a distintos modelos, colas o equipos según la probabilidad asignada a cada ruta, aprovechando la latencia de ~112 ms por petición.
- Moderación y filtrado de contenido: preguntas `noul` o `score` sobre texto o imágenes para decidir si un contenido requiere revisión humana, con confianza explícita por decisión.
- Clasificación de imágenes de catálogo: el ejemplo con imágenes permite preguntas como el color dominante de una foto de producto, usando el encoder de visión integrado.
- Puntuación de leads o riesgo: preguntas `score` con niveles ordenados y `expected_level` para obtener una puntuación continua a partir de estados JSON estructurados.
- Extracción de señales en pipelines ETL: dado un JSON de estado, obtener decisiones tipadas (categoría, booleano, nivel) sin parsing de salida generada, lo que simplifica la integración en sistemas existentes.
- Evaluación de calidad en producción: usar las probabilidades calibradas como señal de confianza para detectar casos ambiguos y derivarlos a revisión.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Decision Index 0.3.1 (suite pública) | 72,49 |
| Latencia mediana por petición (RTX PRO 6000) | 112 ms |
| Muestra de latencia | 750 peticiones |
| Memoria GPU tras carga | 52,2 GB |
| Memoria GPU pico (muestra de latencia) | 56,4 GB |
| Tiempo de carga (caché local en caliente) | 10 s |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparativas numéricas con modelos similares.

## Requisitos de hardware

- VRAM: 52,2 GB tras la carga y 56,4 GB de pico en la muestra de latencia; se recomienda una GPU de 80 GB o más.
- GPU probada: NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB).
- GPU recomendadas por capacidad: A100 80 GB, H100 80 GB, RTX PRO 6000 (96 GB). No cabe en GPUs de consumo (RTX 4090 de 24 GB, etc.) con los pesos bf16 publicados; no se documentan cuantizaciones alternativas.
- Despliegue: paquete Python `glide` con transformers 5.17.0 y torch 2.14.0 (Python 3.12); servidor HTTP propio (`POST /v1/systemone`); API alojada de Fastino (`POST https://api.fastino.ai/v1/systemone`, modelo `fastino/GLiDE`).
- `flash-linear-attention==0.5.2` es opcional pero recomendado; sin él, la inferencia es mucho más lenta y no forma parte de la validación.
- Los pesos se copian a la GPU tensor a tensor, manteniendo bajo el uso de memoria host durante la carga; el preprocesado de imágenes corre en CPU.
- Latencia y throughput: 112 ms de mediana por petición sobre RTX PRO 6000; no se publica throughput agregado.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni especificaciones de modelos comparables de la misma categoría (modelos de decisión calibrados). La comparativa con alternativas generativas de ~27B (por ejemplo, modelos de la familia Qwen3.5) no puede establecerse con cifras porque no se han publicado resultados comparables en la información disponible.

| Modelo | Parámetros | Contexto | Tipo | Licencia |
|---|---|---|---|---|
| GLiDE-27B | ~26,1 B | 40.000 tokens por pregunta | Modelo de decisión (readout 255 vías) | fastino-community |
| Alternativas de ~27B generativas | no disponible | no disponible | Generativo | no disponible |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, resúmenes ni conversación; solo responde a preguntas tipadas predefinidas.
- El límite de 255 opciones por pregunta `choice` restringe la granularidad de las taxonomías.
- La licencia `fastino-community` no es estándar; es imprescindible revisar el texto en el enlace de licencia antes de cualquier uso comercial.
- No se documentan los idiomas soportados; el rendimiento fuera del inglés es desconocido.
- No se detallan los datos de entrenamiento ni los sesgos conocidos; el riesgo de alucinación se traslada a calibración incorrecta de probabilidades en dominios fuera de distribución.
- Requiere GPU de 80 GB o más en bf16; no hay cuantizaciones publicadas para entornos con menos VRAM.
- Dependencia de versiones muy concretas de torch y transformers (2.14.0 y 5.17.0); sin `flash-linear-attention` el rendimiento se degrada notablemente.
- La calibración reportada (Decision Index 72,49) se midió con el kit oficial sobre una RTX PRO 6000; el rendimiento en otro hardware o configuraciones no está validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fastino/GLiDE-27B
- Paper: https://arxiv.org/abs/2611.26509
- Licencia: https://huggingface.co/fastino/GLiDE/blob/main/LICENSE
- Web de Fastino: https://fastino.ai
- Documentación de la API: https://docs.fastino.ai/inference/systemone
- Quickstart de la API: https://docs.fastino.ai/quickstart
- Registro y API key: https://agent.fastino.ai
