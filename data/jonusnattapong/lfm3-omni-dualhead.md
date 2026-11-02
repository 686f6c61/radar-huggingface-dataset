# JonusNattapong/lfm3-omni-dualhead

## Resumen

LFM3-Omni Dual-Head es un experimento de arquitectura publicado por JonusNattapong que combina en un único objeto dos cabezales sobre un tronco compartido: un cabezal de decisión no autorregresivo (System 1, derivado de `LiquidAI/d1-Omni-2B`) y un cabezal generativo autorregresivo de texto y voz (System 2, derivado de `LiquidAI/LFM3-Omni-2B`). El objetivo declarado es evitar cargar dos modelos de aproximadamente 2B en memoria simultáneamente, compartiendo las proyecciones del tronco mediante vistas de memoria y exponiendo dos métodos de inferencia: `.system_one()` para clasificación y enrutamiento en un solo paso, y `.generate()` para generación conversacional.

El modelo base es la familia LFM3-Omni de Liquid AI, con un tronco tri-híbrido que combina convoluciones cortas con compuertas, atención de ventana deslizante y atención global. La propuesta es relevante para despliegues en el borde (edge) y en dispositivos con poca VRAM, ya que el autor cifra el consumo en unos 4,5 GB en BF16 y 1,8 GB en cuantización de 4 bits, con decisiones declaradas por debajo de 50 ms.

No obstante, conviene señalar una discrepancia importante: el repositorio declara 75.047.552 parámetros en los pesos safetensors publicados, muy lejos de los aproximadamente 2,1B del tronco descrito en la model card. Además, la model card marca `inference: false` y no se han publicado benchmarks, por lo que debe tratarse como un artefacto experimental y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tronco LFM3-Omni tri-híbrido (convoluciones cortas con compuertas, atención de ventana deslizante y atención global) con dos cabezales: decisión (no autorregresivo) y lenguaje (autorregresivo) |
| Parametros totales | 75.047.552 según los pesos safetensors publicados; la model card describe un tronco de aproximadamente 2,1B (dato no verificado) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16/FP32 por defecto; el autor menciona 4 bits (GGUF/AWQ) sin publicar artefactos cuantizados |
| Idiomas soportados | Inglés (en) y tailandés (th) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors; requiere `trust_remote_code=True` y código personalizado (`lfm_omni_dualhead`) |

## Arquitectura y entrenamiento

La arquitectura se apoya en el tronco LFM3-Omni de Liquid AI, que combina tres mecanismos de mezcla de secuencia: convoluciones cortas con compuertas, atención de ventana deslizante y atención global. Sobre ese tronco se montan dos cabezales: el de decisión, procedente de `d1-Omni-2B`, que produce salidas tipadas (booleanos, opciones múltiples y números con rango y paso) en un único pase hacia delante sin generar tokens; y el de lenguaje, procedente de `LFM3-Omni-2B`, que genera texto y voz de forma autorregresiva. El autor afirma que las proyecciones se comparten en memoria mediante vistas, sin duplicar pesos.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo original. Tampoco se detalla el procedimiento de fusión de los dos cabezales ni si se realizó algún ajuste adicional. La innovación declarada es puramente de ingeniería: unificar dos modelos de la misma familia en un solo objeto con despacho dual (`.system_one()` y `.generate()`) para reducir el consumo de VRAM.

## Capacidades

- Decisión tipada en un solo pase: clasificación por opciones, booleanos y valores numéricos con rango y paso, sin generar tokens de salida.
- Enrutamiento y triaje de eventos rápidos, con latencia declarada inferior a 50 ms.
- Entrada multimodal: texto, imagen (redimensionada a 224x224) y audio (16 kHz mono).
- Generación autorregresiva de texto mediante `.generate()`.
- Generación de voz según la descripción del cabezal System 2 (no se documenta la interfaz concreta).
- Soporte de tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües limitadas a inglés y tailandés.
- Modo thinking explícito: no disponible.

## Casos de uso

- Triaje de tickets de soporte: usar `.system_one()` con preguntas tipadas (`intent`, `is_urgent`) para clasificar y priorizar incidencias en un solo pase, sin coste de generación de tokens.
- Enrutamiento de eventos en pipelines de backend: clasificar webhooks o mensajes entrantes por categoría y urgencia antes de derivarlos al servicio correspondiente.
- Verificación documental con imagen: comprobar la presencia de un recibo o puntuar la calidad de una captura con preguntas booleanas y numéricas sobre imágenes de 224x224.
- Análisis de audio en el borde: detectar presencia de habla y estimar el número de hablantes en fragmentos de 16 kHz para activar o descartar etapas posteriores más costosas.
- Asistente conversacional en dispositivo: emplear `.generate()` para respuestas de chat en inglés o tailandés en hardware con poca memoria, aprovechando el consumo declarado de 1,8 GB en 4 bits.
- Despliegue en hardware restringido: prototipos en Raspberry Pi 5, NPU de borde o móviles, donde cargar dos modelos de 2B sería inviable.
- Evaluación comparativa de arquitecturas duales: servir como referencia para investigar el reparto de un tronco entre cabezales de decisión y generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta cifras de recursos: aproximadamente 4,5 GB de VRAM en BF16/FP32 y 1,8 GB en cuantización de 4 bits, con decisiones declaradas por debajo de 50 ms. No hay datos de MMLU, HumanEval, GSM8K ni de calidad de decisión.

## Requisitos de hardware

- VRAM estimada: unos 4,5 GB en BF16/FP32 según el autor; unos 1,8 GB en 4 bits (sin artefactos cuantizados publicados).
- GPU recomendadas por el autor: NVIDIA RTX 3060 o 4060 (8 GB o más).
- Apple Silicon: Mac M1 a M4 con 8 GB o más de memoria unificada.
- Cabe en GPU de consumo: sí, según las cifras declaradas, aunque la discrepancia entre 75M de parámetros publicados y los 2,1B descritos obliga a verificar el consumo real.
- Despliegue: `transformers` con `trust_remote_code=True`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se declara una latencia inferior a 50 ms para `.system_one()`; no hay datos de throughput para `.generate()`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Estado |
|---|---|---|---|---|---|
| LFM3-Omni Dual-Head | 75M publicados (tronco descrito de ~2,1B) | No disponible | Texto, imagen, audio | Apache 2.0 | Experimental, 0 descargas |
| LiquidAI/LFM3-Omni-2B | ~2B | No disponible | Texto, imagen, audio | No disponible en la información | Modelo base oficial |
| LiquidAI/d1-Omni-2B | ~2B | No disponible | Texto, imagen, audio | No disponible en la información | Modelo base oficial de decisión |

No se dispone de datos de rendimiento comparado entre estas alternativas. La ventaja declarada del Dual-Head frente a cargar ambos modelos base por separado es el ahorro de VRAM (4,5 GB frente a 8-10 GB), a costa de ser un artefacto no validado y sin benchmarks.

## Limitaciones y advertencias

- Discrepancia crítica de tamaño: los safetensors suman 75.047.552 parámetros, mientras la model card describe un tronco de unos 2,1B; las cifras de VRAM y latencia deben verificarse empíricamente.
- La model card declara `inference: false`, lo que sugiere que la inferencia no está validada por el autor.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni de validación por terceros.
- Requiere `trust_remote_code=True` y código personalizado (`lfm_omni_dualhead`), con el riesgo de seguridad que implica ejecutar código remoto.
- Idiomas limitados a inglés y tailandés; el rendimiento en castellano no está documentado.
- Sin benchmarks publicados: no hay forma de evaluar la calidad de las decisiones ni de la generación.
- Riesgo de alucinación y sesgos: no documentados, pero inherentes a un modelo derivado sin evaluación publicada.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de modelos de Liquid AI conviene revisar las condiciones de los modelos base.
- No se documentan límites de contexto ni comportamiento en conversaciones multi-turno largas.
- No apto para producción sin una evaluación propia exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JonusNattapong/lfm3-omni-dualhead
- Modelo base generativo: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Modelo base de decisión: https://huggingface.co/LiquidAI/d1-Omni-2B
- Organización Liquid AI en HuggingFace: https://huggingface.co/LiquidAI
- Repositorio de Transformers: https://github.com/huggingface/transformers
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
