# Cloudflare/clef-omni

## Resumen

Clef-Omni es un modelo multimodal de tipo mixture-of-experts (MoE) desarrollado por Cloudflare, post-entrenado a partir de Qwen/Qwen3-Omni-30B-A3B-Instruct. Su funcionamiento no es el de un generador de texto libre, sino el de un modelo de decisión: recibe un "estado" (texto, JSON, imágenes, audio o vídeo) junto con un esquema de preguntas tipadas y devuelve, en un único forward pass, una probabilidad para cada opción permitida de cada pregunta. No hay generación de texto abierto ni necesidad de parsear la salida.

Arquitectónicamente conserva el backbone thinker de Qwen3-Omni con sus codificadores de visión y audio, y añade una cabeza transformer ("joint schema head") que enruta la evidencia del estado hacia cada pregunta y puntúa conjuntamente todas las opciones. El modelo tiene 35.259.818.545 parámetros totales según los safetensors, con 30B de parámetros totales y 3B activos en el backbone MoE (A3B).

Su relevancia actual radica en que convierte tareas de clasificación y extracción estructurada multimodales en inferencia determinista y sin parsing, lo que simplifica pipelines de producción. La API es compatible con Jev y SystemOne, y la licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (backbone Qwen3-Omni thinker con encoders de visión y audio) + joint schema head |
| Parametros totales | 35.259.818.545 (safetensors); backbone 30B-A3B |
| Parametros activos | 3B (backbone MoE, A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 en la referencia de uso) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (sharded, con `model.safetensors.index.json`), más `joint_head.safetensors` |

## Arquitectura y entrenamiento

El modelo parte del backbone thinker de Qwen3-Omni-30B-A3B-Instruct, incluyendo sus codificadores de visión y audio, almacenado como safetensors fragmentados estándar. Los pesos de salida de voz del modelo base (talker y code2wav) se incluyen sin modificar pero no se utilizan: `load_release_model` no los carga. Sobre el backbone se añade una "joint schema head", una cabeza transformer pequeña que lee los estados ocultos finales del backbone, enruta la evidencia del estado hacia cada pregunta y puntúa conjuntamente todas las opciones de todas las preguntas. La salida es un logit por opción permitida y pregunta; aplicando softmax por pregunta se obtienen probabilidades.

El modelo está post-entrenado específicamente para producir decisiones tipadas en lugar de texto libre. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El repositorio incluye código personalizado (`joint_schema_model.py`) que implementa la codificación de registros, la decodificación de medios, el batching, el modelo, la función `load_release_model` y la interfaz `systemone`.

## Capacidades

- Entrada multimodal: texto, JSON, imágenes, audio y vídeo (los vídeos se muestrean a 2 fotogramas por segundo y su pista de sonido se procesa junto a los fotogramas cuando todos los vídeos del registro la tienen).
- Salida estructurada tipada: preguntas de tipo `choice` (probabilidades por opción), `score` (puntuación esperada, confianza y leyenda) y `noul` (probabilidad de verdadero).
- Puntuación conjunta de todas las opciones de todas las preguntas en un único forward pass, sin generación de texto libre ni parsing de salida.
- Procesamiento por lotes mixto: registros solo de texto y multimodales pueden combinarse en el mismo batch.
- Compatibilidad con la API Jev / SystemOne (`POST /v1/systemone`), devolviendo `model`, `answers` por ID de pregunta y `usage`.
- Soporte de instrucciones opcionales por pregunta y de criterios de clasificación definidos por el usuario.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Clasificación de tickets de soporte: el modelo recibe el texto del mensaje como estado y un esquema con preguntas de tipo `choice` (departamento) y `score` (urgencia), devolviendo probabilidades por categoría en una sola pasada, lo que permite enrutar automáticamente sin parsing de texto generado.
- Triaje de facturas y documentos: con estado en JSON (proveedor, importe, moneda, estado) y preguntas `choice` y `noul`, se obtiene la clasificación del documento y comprobaciones booleanas (por ejemplo, si el importe supera un umbral) de forma determinista.
- Análisis de llamadas de atención al cliente: dado un audio de llamada, el modelo responde preguntas `noul` sobre eventos concretos (por ejemplo, si se oye cristal rompiéndose), útil para control de calidad y detección de incidencias.
- Revisión de vídeo de flotas o dashcams: con vídeo muestreado a 2 fps y su audio asociado, responde preguntas booleanas sobre colisiones o eventos visuales, adecuado para pipelines de siniestros.
- Moderación y clasificación de contenido multimodal: combina imagen, audio y texto en un mismo registro para puntuar múltiples criterios de forma conjunta.
- Extracción de señales estructuradas en ETL: al devolver probabilidades por opción en lugar de texto libre, los resultados se insertan directamente en bases de datos o sistemas de decisión sin pasos de validación de formato.
- Integración en servicios compatibles con Jev/SystemOne: el endpoint `systemone` permite exponer el modelo como servicio de decisión con el mismo contrato de petición y respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 64 GB de memoria de GPU en bfloat16 para el backbone, según la model card.
- GPU recomendadas: el modelo fue probado en una única NVIDIA H200; por el requisito de memoria, se necesitan GPUs de 80 GB (H100, A100 80 GB, H200) o configuraciones multi-GPU.
- GPU de consumo: no cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB) en bfloat16; no se documentan opciones de cuantización para reducir el requisito.
- Opciones de despliegue: uso directo con `transformers` (probado con torch 2.11 y transformers 5.10.2), carga mediante `load_release_model` y `snapshot_download`; soporte de SGLang anunciado como "coming soon". No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Dependencias: `pillow` para imágenes y `av` para audio y vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cloudflare/clef-omni | 35,26B totales (3B activos) | no disponible | Probabilidades por opción tipada | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-Omni-30B-A3B-Instruct (modelo base) | 30B-A3B | no disponible | Texto libre multimodal | no disponible en la información | Hugging Face |
| Cloudflare/clef | no disponible | no disponible | Salida tipada (variante densa imagen y vídeo) | no disponible en la información | Hugging Face |
| Cloudflare/clef-flash | no disponible | no disponible | Salida tipada (variante densa imagen y vídeo) | no disponible en la información | Hugging Face |

## Limitaciones y advertencias

- El modelo no genera texto libre: solo devuelve probabilidades sobre las opciones definidas en el esquema, por lo que no sirve para tareas generativas abiertas.
- La calidad de las decisiones depende de la definición de preguntas, criterios e instrucciones del esquema; esquemas ambiguos producen probabilidades poco fiables.
- No se dispone de información sobre sesgos conocidos ni sobre evaluación de sesgo en la model card.
- Riesgo de alucinación: aunque la salida está restringida a opciones, el modelo puede asignar alta probabilidad a opciones incorrectas ante estados ambiguos o fuera de distribución; se recomienda calibrar umbrales de confianza.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe más allá del que herede del modelo base.
- Longitud de contexto no documentada, lo que dificulta planificar entradas de estado muy largas.
- Los pesos de salida de voz del modelo base se incluyen pero no se usan; no debe esperarse capacidad de síntesis de voz.
- El soporte de SGLang está anunciado como "coming soon"; el despliegue en producción con servidores de inferencia de alto rendimiento no está validado en la información disponible.
- Requiere hardware de gama alta (unos 64 GB de VRAM en bfloat16), lo que limita su uso en entornos con GPUs de consumo.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-Omni del que deriva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cloudflare/clef-omni
- Anuncio en el blog de Cloudflare: https://blog.cloudflare.com/clef-faster-cheaper-multimodal
- Modelo base: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Variante densa Clef: https://huggingface.co/Cloudflare/clef
- Variante Clef-Flash: https://huggingface.co/Cloudflare/clef-flash
- Sitio de Cloudflare: https://www.cloudflare.com/
