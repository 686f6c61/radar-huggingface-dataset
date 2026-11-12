# JiaerX/Streamo_3B

## Resumen

Streamo-3B es un modelo de lenguaje de video en streaming desarrollado por JiaerX (Jiaer Xia) sobre Qwen2.5-VL-3B-Instruct. Su particularidad es que no procesa un video completo de una vez, sino que consume fotogramas de forma secuencial e incremental, junto con el contexto conversacional acumulado, y decide en cada ronda si debe permanecer en silencio, esperar más evidencia o emitir una respuesta. Esta capacidad de decidir cuándo hablar se articula mediante tres tokens de estado especiales: `</Silence>`, `</Standby>` y `</Response>`.

El modelo se presenta junto al conjunto de datos Streamo-Instruct-465K y al artículo "Streaming video instruction tuning" (CVPR 2026), y está pensado para tareas como narración de eventos, comprensión de acciones, anclaje temporal y respuesta a preguntas sensibles al tiempo. Con 3.754.622.976 parámetros en BF16 y un repositorio de 15,7 GB, es un modelo de escala pequeña que hereda la arquitectura multimodal de Qwen2.5-VL.

Su relevancia actual radica en que aborda un problema poco cubierto por los modelos de video convencionales: la inferencia sobre flujos continuos con latencia y cómputo acotados. Al partir de un modelo de 3B, resulta viable en GPUs de gama alta para consumidor, aunque el ecosistema de despliegue está todavía limitado al repositorio oficial de código.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen2_5_VLForConditionalGeneration (transformer multimodal visión-lenguaje) |
| Parámetros totales | 3.754.622.976 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como capacidad medida; la configuración upstream de vLLM usa `max_model_len=32768` |
| Tipos de cuantización | no disponible (checkpoint publicado en BF16) |
| Idiomas soportados | en |
| Licencia | no disponible en la model card del checkpoint; el código Streamo es Apache-2.0 y el modelo base se rige por Qwen Research License |
| Formato de pesos | safetensors (dos shards), BF16 |

## Arquitectura y entrenamiento

Streamo-3B es un ajuste fino (finetune) del modelo multimodal Qwen2.5-VL-3B-Instruct, que combina un codificador visual con un transformer de lenguaje para generar texto condicionado por imágenes o fotogramas de video. Sobre esa base, el ajuste introduce tokens adicionales de estado de streaming, por lo que es imprescindible cargar el tokenizer y el processor de este checkpoint y no los del modelo base. La entrada son fotogramas de video con sus marcas temporales más instrucciones de texto; la salida son tokens de estado de streaming y respuestas textuales.

El entrenamiento se realiza mediante "streaming video instruction tuning" sobre el dataset Streamo-Instruct-465K, publicado por el mismo grupo. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. La innovación técnica principal es el mecanismo de decisión de respuesta basado en tres estados (`</Silence>`, `</Standby>`, `</Response>`), que permite al modelo abstenerse de responder hasta acumular evidencia suficiente, en lugar de forzar una respuesta por fotograma. El muestreo recomendado es de 1 FPS, ya que el indexado de fotogramas y las etiquetas temporales avanzan en pasos de un segundo.

## Capacidades

- Comprensión de video en streaming: procesa fotogramas de forma secuencial e incremental con contexto conversacional acumulado.
- Decisión de respuesta basada en estados: emite `</Silence>` cuando no hay evidencia relevante, `</Standby>` cuando la actividad está en curso y `</Response>` cuando puede responder.
- Narración de eventos y comprensión de acciones sobre flujos de video.
- Anclaje temporal (temporal grounding) de eventos dentro del flujo.
- Respuesta a preguntas sensibles al tiempo, con inserción de la pregunta en una ronda concreta mediante `question_time`.
- Preguntas globales persistentes: con `global_question=True`, la pregunta se incluye desde el primer fotograma y se conserva al deslizarse la ventana de historial.
- Procesamiento multimodal imagen-texto y video-texto heredado de Qwen2.5-VL.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Vigilancia y monitorización de flujos de cámara: el modelo puede consumir fotogramas a 1 FPS de una cámara IP o CCTV y emitir `</Standby>` mientras una actividad está en curso y `</Response>` con una descripción cuando concluye un evento, reduciendo el ruido de alertas continuas.
- Narración automática de retransmisiones deportivas o eventos en directo: al procesar el flujo de forma incremental, puede generar comentarios por segmentos temporales sin necesidad de disponer del video completo.
- Asistencia a personas con discapacidad visual: integrado en un bucle de captura propio (la demo oficial lee un archivo local, por lo que una aplicación en vivo requiere su propio capture loop), puede describir eventos relevantes solo cuando hay evidencia suficiente.
- Análisis de vídeo de reuniones o clases: con `global_question=True`, mantiene una pregunta persistente (por ejemplo, "resume las decisiones tomadas") y responde cuando el flujo aporta información suficiente.
- Control de calidad en líneas de producción: sobre clips cortos grabados a 1 FPS, detecta y describe secuencias de acciones para verificar el cumplimiento de un procedimiento.
- Extracción de eventos para indexación y búsqueda: genera registros por ronda en JSONL (`test_sample_video.jsonl`) con las respuestas asociadas a cada ronda, útiles para construir índices temporales de contenido audiovisual.
- Anclaje temporal para edición de vídeo: localiza el instante en que ocurre un evento descrito en lenguaje natural, aprovechando las etiquetas temporales por segundo del flujo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al artículo (arXiv:2512.21334) para el protocolo de evaluación y los resultados reportados, pero no incluye cifras en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en BF16 ocupa aproximadamente 7,5 GB de pesos (3.754.622.976 parámetros × 2 bytes); el repositorio completo son 15,7 GB. El consumo real crece con los fotogramas retenidos y el historial de respuestas, por lo que debe reservarse margen adicional.
- GPU recomendadas: no se especifican en la información proporcionada. Por tamaño, una GPU con 16-24 GB de VRAM es un punto de partida razonable para BF16, y una A100 o H100 ofrece margen para ventanas de contexto amplias.
- GPU de consumidor: el tamaño del modelo (3B en BF16) sugiere que puede caber en tarjetas de gama alta para consumidor con 16 GB o más, aunque el autor no lo confirma ni detalla cuantizaciones.
- Opciones de despliegue: el repositorio oficial soporta backend PyTorch (`infer_backend = 'pt'`) y vLLM (opción por defecto upstream, con `max_model_len=32768`). Requiere `transformers==4.57.1` y `qwen-vl-utils>=0.0.6,<0.0.12`, además de `decord` y `opencv-python`. La inferencia debe ejecutarse desde el repositorio clonado para que se importe su implementación empaquetada de `swift`.
- Latencia y throughput: no disponibles. El autor advierte que el muestreo a 1 FPS puede perder eventos breves y que los tiempos de respuesta pueden ser imprecisos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Streamo-3B | 3,75B | no medida; `max_model_len=32768` en vLLM | Video en streaming con tokens de estado | no disponible en el checkpoint; base con Qwen Research License | Hugging Face + repo GitHub |
| Qwen2.5-VL-3B-Instruct | 3B (clase) | no disponible | Visión-lenguaje generalista, sin streaming | Qwen Research License | Hugging Face |
| Alternativas de video-LLM de escala similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con otros modelos de video en streaming no está disponible en la información proporcionada. El competidor natural es el propio modelo base Qwen2.5-VL-3B-Instruct, del que Streamo hereda arquitectura y capacidades generales, añadiendo el mecanismo de decisión de respuesta sobre flujos continuos.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente inglés; no hay evidencia de soporte multilingüe.
- Muestreo fijo a 1 FPS: el indexado de fotogramas y las etiquetas temporales avanzan en pasos de un segundo, por lo que los eventos breves pueden perderse y las respuestas y tiempos pueden ser inexactos.
- Crecimiento de contexto y memoria: el uso de contexto y VRAM crece con los fotogramas retenidos y el historial de respuestas; reducir `max_rounds` no garantiza que el prompt quepa en el límite de tokens del backend.
- `max_model_len=32768` es una configuración de inferencia, no una capacidad medida de video largo; no debe interpretarse como tal.
- La demo oficial lee un archivo de video local de forma secuencial; una aplicación con cámara en vivo requiere implementar su propio bucle de captura.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a los modelos generativos multimodales.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia: la model card del checkpoint no especifica licencia; el código es Apache-2.0 y el modelo base se rige por la Qwen Research License, que puede restringir el uso comercial. Verificar antes de un despliegue en producción.
- Dependencias frágiles: requiere versiones concretas de `transformers` y `qwen-vl-utils`, y ejecutar desde el repositorio clonado para usar su implementación de `swift`.
- Madurez: 4 descargas y 0 likes en el momento de la consulta; ecosistema de despliegue limitado al repositorio oficial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JiaerX/Streamo_3B
- Artículo (arXiv): https://arxiv.org/abs/2512.21334
- Página del proyecto: https://jiaerxia.github.io/Streamo/
- Código: https://github.com/maifoundations/Streamo
- Dataset Streamo-Instruct-465K: https://huggingface.co/datasets/maifoundations/Streamo-Instruct-465K
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct/blob/main/LICENSE
- Licencia del código: https://github.com/maifoundations/Streamo/blob/main/LICENSE
- Script de inferencia: https://github.com/maifoundations/Streamo/blob/main/inference.py
- Cargador Qwen empaquetado: https://github.com/maifoundations/Streamo/blob/main/swift/llm/model/model/qwen.py
