# infosave/d1-Omni-2B-cmf

## Resumen

d1-Omni-2B — CMF es un empaquetado cuantizado, publicado por el usuario infosave en Hugging Face, del modelo [LiquidAI/d1-Omni-2B](https://huggingface.co/LiquidAI/d1-Omni-2B): un modelo omni-modal de decisión de 2,2B parámetros basado en LFM3-Omni-2B de Liquid AI. Su planteamiento es distinto al de un LLM conversacional: responde preguntas con nombre sobre un estado (texto, JSON, imágenes o clips de audio) en una sola pasada hacia adelante, devolviendo respuestas tipadas con probabilidades calibradas y sin generar tokens. Es lo que el autor denomina un modelo "System One", orientado a tareas de decisión, clasificación y extracción.

La relevancia de esta ficha reside en el formato CMF y el motor de inferencia `cortiq`, escrito en Rust sin Python ni framework de ML, con backends Vulkan/DX12 (NVIDIA, AMD e Intel), Metal (Apple silicon) y CPU. Esto permite ejecutar el modelo en prácticamente cualquier GPU con solo 3 GB de memoria libre, con latencias de decenas de milisegundos por pregunta.

Está pensado para casos como clasificar tickets de soporte, extraer campos de facturas, responder preguntas sobre JSON, contar o localizar objetos en imágenes y entender peticiones habladas, todo con salidas estructuradas y probabilidades calibradas listas para integrarse en pipelines de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3-Omni-2B (modelo omni-modal de decision "System One", pipeline any-to-any) |
| Parametros totales | 2,2B (modelo base LiquidAI/d1-Omni-2B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (q8_2f, encoders de vision/audio en 16-bit) y 4-bit (q4tp, encoders en 16-bit) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | CMF (fichero unico, cuantizado; el original es de LiquidAI en su formato habitual) |

## Arquitectura y entrenamiento

El modelo base, d1-Omni-2B de Liquid AI, es un modelo omni-modal de 2,2B parámetros construido sobre LFM3-Omni-2B. Su rasgo diferencial es que no genera texto libre: realiza una única pasada hacia adelante sobre un "estado" empaquetado (texto, JSON, imágenes o audio) junto con hasta 16 preguntas con nombre, y lee las respuestas directamente desde "slots" de respuesta sobre la cabeza del vocabulario. Esto elimina la decodificación autorregresiva y da respuestas tipadas (booleano, elección, puntuación, número, fecha, caja delimitadora) con probabilidades calibradas en una sola submission a la GPU.

Detalles sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO): no disponible en la información proporcionada. En cuanto al empaquetado CMF, incluye una calibración (`calibration.json`) ya aplicada a cada respuesta; según la model card, las respuestas cuantizadas coinciden con el checkpoint bf16 original en 22 de 22 casos (q8_2f) y 21 de 22 (q4tp), con diferencias máximas de probabilidad de 0,005 y 0,13 respectivamente. Los encoders de visión y audio se ejecutan en float32 en la CPU antes de la pasada principal en GPU.

## Capacidades

- Clasificación binaria (`noul`): pregunta sí/no con probabilidad calibrada de respuesta afirmativa.
- Clasificación multiclase (`choice`): una opción entre criterios definidos por el usuario, con confianza y distribución de probabilidades; soporta selección múltiple (`"multiple": true`).
- Puntuación ordinal (`score`): de 2 a 10 niveles ordenados, con mediana, confianza y leyenda.
- Extracción de valores (`text`, `number`, `date`): lectura de valores del estado con span y probabilidad de haberse encontrado (`found`).
- Estimación numérica (`number` con `range` y `step`): mediana e intervalo p10–p90.
- Detección visual (`box`, `boxes`): localización de un objeto o de todas las instancias en una imagen, con coordenadas normalizadas, conteo y confianza.
- Entrada multimodal: texto, JSON, imágenes (hasta 640×480 y mayores) y clips de audio (WAV, otros formatos vía ffmpeg; ruta, data URL o URL HTTP(S)).
- Hasta 16 preguntas por pasada sobre el mismo estado; más preguntas requieren pasadas adicionales sobre el mismo estado.
- Servidor HTTP integrado (`cortiq serve`) con endpoint `/v1/system_one`.
- Multilingüe: 16 idiomas, incluido el castellano.
- No soporta (todavía): vídeo, preguntas habladas ni estados por lotes (`system_one_batch`).

## Casos de uso

- Clasificación automática de tickets de soporte: con un `choice` sobre criterios como "facturación", "envío" o "problema de producto", el modelo devuelve la categoría y su distribución de probabilidades en una sola pasada de ~64 ms en GPU, sin generar texto.
- Extracción de campos de facturas: preguntas `text`, `number` y `date` sobre el documento permiten leer importes, fechas o números de factura con el span exacto y la probabilidad de que el valor exista (`found`).
- Comprensión de llamadas de voz: sobre un clip de audio de unos segundos, el modelo determina si el interlocutor hace una reserva, para cuántas personas y de qué tipo (restaurante, viaje, soporte) en ~0,3–0,7 s, útil en IVR y transcripción estructurada.
- Moderación y enrutado de contenido: clasificación binaria (`noul`) con probabilidad calibrada para decidir si un texto o imagen incumple una política, integrable en pipelines de moderación con umbrales ajustables.
- Análisis visual con conteo y localización: preguntas `box`/`boxes` permiten contar instancias y obtener cajas delimitadoras normalizadas, útil para inventario visual o verificación de imágenes.
- Razonamiento sobre registros JSON: preguntas con nombre sobre un estado JSON (por ejemplo, un registro de cliente) para extraer o puntuar campos de forma estructurada sin escribir parsers.
- Despliegue en hardware heterogéneo: gracias a los backends Vulkan, DX12, Metal y CPU, puede ejecutarse desde una A40 en un servidor Linux hasta un MacBook con M4 o una máquina sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí incluye una comparación de fidelidad frente al checkpoint bf16 original (5 peticiones de prueba, 22 preguntas en total) y latencias medidas:

| Hardware | Fichero | 1 pregunta (43 tokens) | 3 preguntas (123 tokens) | 3 preguntas sobre clip de 3,3 s |
|---|---|---:|---:|---:|
| NVIDIA A40 (Vulkan) | q4tp | 40–50 ms | 64 ms | 0,47 s |
| NVIDIA A40 (Vulkan) | q8_2f | 55–66 ms | 75 ms | 0,67 s |
| Apple M4 (Metal) | q4tp | 85 ms | 157 ms | 0,30 s |

Fidelidad de la cuantización (respuestas idénticas al original bf16 en float32): q8_2f, 22 de 22 (diferencia máxima de probabilidad 0,005); q4tp, 21 de 22 (diferencia máxima 0,13; la respuesta distinta es un empate cercano también en el original: 0,52 frente a 0,46).

## Requisitos de hardware

- Ambos ficheros caben en cualquier GPU con 3 GB de memoria libre (q4tp: 1,80 GB; q8_2f: 2,63 GB).
- NVIDIA, AMD e Intel a través de Vulkan/DX12; en Linux headless instalar `libvulkan1 libglvnd0 libegl1 libgl1 libglx0` y definir `XDG_RUNTIME_DIR=/tmp`.
- Apple silicon: backend Metal por defecto (verificado en M4).
- CPU only: variable de entorno `CMF_GPU=0`; cabe en máquinas sin GPU dedicada.
- GPU recomendadas: cualquier GPU moderna con ≥3 GB libres; las latencias publicadas corresponden a NVIDIA A40 y Apple M4.
- Despliegue: motor `cortiq` (Rust, sin Python ni framework de ML), binarios precompilados para Linux, macOS y Windows; CLI (`cortiq-cli` vía cargo) y servidor HTTP (`cortiq serve`). No utiliza vLLM, llama.cpp, Ollama ni TGI.
- Los encoders de visión y audio se ejecutan en float32 en CPU: ~0,5 s por imagen 640×480 en M4, ~3 s en la CPU del host de la A40.
- El servidor procesa una petición cada vez; no hay datos de throughput por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidades | Salida | Formato / motor | Licencia |
|---|---|---|---|---|---|
| d1-Omni-2B — CMF (esta ficha) | 2,2B | texto, JSON, imagen, audio | respuestas tipadas con probabilidades, sin generacion de tokens | CMF / cortiq (Rust, Vulkan/Metal/CPU) | lfm1.0 |
| LiquidAI/d1-Omni-2B (original) | 2,2B | texto, JSON, imagen, audio | identica al empaquetado CMF | formato original de LiquidAI / Transformers | no disponible en la informacion proporcionada |
| LiquidAI/LFM3-Omni-2B (base) | 2,2B | omni-modal | generacion de tokens convencional | no disponible | no disponible en la informacion proporcionada |

No se conocen alternativas directas con el mismo paradigma de "respuestas tipadas en una sola pasada sin generación de tokens"; en la práctica, la alternativa habitual es usar un LLM omni-modal convencional con salidas estructuradas (JSON mode / function calling), con mayor latencia y sin calibración de probabilidades nativa.

## Limitaciones y advertencias

- No genera texto libre: solo responde preguntas tipadas predefinidas; no sirve como asistente conversacional.
- No soporta vídeo, preguntas habladas ni procesamiento por lotes de estados (`system_one_batch`) en la versión actual.
- Máximo 16 preguntas por pasada; más preguntas requieren pasadas adicionales sobre el mismo estado.
- La cuantización q4tp alteró 1 de 22 respuestas de prueba (un empate cercano); para máxima fidelidad usar q8_2f.
- Los encoders de visión y audio se ejecutan en CPU en float32, lo que añade latencia notable en máquinas sin CPU potente (~3 s por imagen en el host de prueba de la A40).
- Sesgos conocidos, riesgo de alucinación y evaluaciones de calidad del modelo base: no disponibles en la información proporcionada; la calibración incluida se ajustó a un conjunto de prueba muy reducido (5 peticiones), por lo que conviene validar la calibración en el dominio propio.
- Licencia lfm1.0 (tipo "other"): revisar los términos concretos en el fichero LICENSE antes de uso comercial; no se detallan las restricciones en la model card.
- El repositorio tiene una adopción mínima (1 descarga, 1 like), sin historial comunitario que respalde su fiabilidad en producción.
- Requiere cortiq 0.8.50 o posterior.

## Enlaces

- Modelo cuantizado CMF: https://huggingface.co/infosave/d1-Omni-2B-cmf
- Modelo base de Liquid AI: https://huggingface.co/LiquidAI/d1-Omni-2B
- Repositorio CMF y releases de cortiq: https://github.com/infosave2007/cmf
- Releases (binarios precompilados): https://github.com/infosave2007/cmf/releases
