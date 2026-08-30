# mradermacher/LFM2.5-2.6B-Pashto-Zi-GGUF

## Resumen

LFM2.5-2.6B-Pashto-Zi-GGUF es una colección de cuantizaciones GGUF del modelo LFM2.5-2.6B-Pashto-Zi, un fine-tuning en pashto del modelo base LFM2.5-2.6B desarrollado por Liquid AI. Este modelo base es un modelo denso de 2.6 mil millones de parámetros, diseñado específicamente para cargas de trabajo agénticas, con una ventana de contexto de 128.000 tokens y soporte nativo para tool calling. La variante Pashto-Zi, creada por el usuario nassimjp, adapta el modelo para el idioma pashto, aunque no se ha publicado documentación técnica sobre el proceso de adaptación.

La relevancia de esta cuantización radica en que permite ejecutar un modelo con capacidades agénticas y multilingües (incluyendo pashto) en dispositivos con recursos limitados, como teléfonos móviles o portátiles. Según Liquid AI, el modelo base alcanza una velocidad de decodificación de aproximadamente 220 tokens por segundo en un Apple M5 Max con menos de 2,5 GB de memoria, y unos 30 tokens por segundo en un teléfono. Esta versión GGUF, preparada por mradermacher, ofrece múltiples niveles de cuantización para adaptarse a diferentes capacidades de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (según Liquid AI, la familia LFM2.5 es híbrida; no se especifica el tipo exacto) |
| Parametros totales | 2.6 mil millones (del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (del modelo base) |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | No disponible (el modelo base es multilingüe; la variante Pashto-Zi está especializada en pashto, pero no hay lista oficial) |
| Licencia | No disponible (la cuantización no especifica licencia; el modelo base usa LFM Open License) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base LFM2.5-2.6B pertenece a la familia LFM2.5 de Liquid AI, descrita como una nueva generación de modelos híbridos diseñados para despliegue en dispositivos. Según la documentación oficial, se construye sobre la arquitectura LFM2 con pre-entrenamiento extendido y aprendizaje por refuerzo (reinforcement learning). No se han publicado detalles técnicos sobre la composición exacta de la arquitectura (por ejemplo, si combina atención con capas SSM o utiliza mecanismos de atención lineal). La variante Pashto-Zi es un fine-tuning no documentado, probablemente realizado sobre el modelo base para mejorar su rendimiento en pashto, pero no se dispone de información sobre el dataset, el número de tokens de entrenamiento ni el método de ajuste (supervisado, RLHF, etc.).

## Capacidades

- Generación de texto y razonamiento: el modelo base está entrenado para tareas de razonamiento multi-paso, lo que lo hace adecuado para planificación y ejecución de tareas complejas.
- Tool calling nativo: soporta llamadas a funciones y herramientas, lo que permite integrarlo en flujos de agentes que necesitan interactuar con APIs o servicios externos.
- Capacidades agénticas: diseñado para ejecutar tareas de múltiples pasos de forma autónoma, con planificación y ejecución secuencial.
- Multilingüismo: el modelo base es multilingüe; la variante Pashto-Zi añade soporte específico para pashto, aunque no se especifica el alcance exacto de otros idiomas.
- Despliegue en dispositivos: optimizado para funcionar con recursos limitados, con velocidades de decodificación altas en hardware de consumo (220 tok/s en Apple M5 Max, 30 tok/s en teléfono).
- No se ha confirmado soporte de visión, audio u otras modalidades.

## Casos de uso

- Atención al cliente en pashto: el modelo puede gestionar conversaciones multi-turno con contexto largo (128K tokens) y utilizar tool calling para consultar bases de datos de productos o sistemas de tickets, ofreciendo respuestas en pashto.
- Asistentes personales en dispositivos móviles: gracias a su tamaño reducido y a las cuantizaciones GGUF, puede ejecutarse en smartphones para tareas como recordatorios, búsqueda de información o control de aplicaciones mediante lenguaje natural.
- Agentes de automatización de tareas: su capacidad de planificación y tool calling permite construir agentes que ejecutan flujos de trabajo (por ejemplo, envío de correos, gestión de calendarios) con instrucciones en pashto.
- Traducción y transcripción en tiempo real: aunque no está confirmado como modelo de traducción, su especialización en pashto puede servir para tareas de generación de texto en ese idioma, como resúmenes o redacción de documentos.
- Chatbots educativos: puede utilizarse como tutor interactivo en pashto para explicar conceptos, resolver dudas o generar ejercicios, aprovechando su contexto largo para mantener conversaciones extensas.
- Desarrollo de aplicaciones de voz: combinado con un sistema de reconocimiento de voz, puede generar respuestas habladas en pashto para asistentes de voz en dispositivos de bajo consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica de rendimiento conocida es la velocidad de decodificación del modelo base: aproximadamente 220 tokens por segundo en un Apple M5 Max con menos de 2,5 GB de memoria, y unos 30 tokens por segundo en un teléfono. No hay datos de MMLU, HumanEval, GSM8K u otros benchmarks estándar para esta variante ni para el modelo base en los materiales consultados.

## Requisitos de hardware

- VRAM estimada: con cuantizaciones como Q4_K_S o Q2_K, el modelo puede caber en menos de 2,5 GB de memoria, según las afirmaciones de Liquid AI para el modelo base. Para cuantizaciones más altas (Q8_0, F16) se necesitarán más recursos, probablemente entre 3 y 5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) puede ejecutar las cuantizaciones más bajas. Para las más altas, se recomienda una GPU con 6-8 GB (RTX 3060, RTX 4060). También es viable en CPU con suficiente RAM.
- Compatibilidad con consumer GPU: sí, especialmente con cuantizaciones Q4 o inferiores.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio y otros motores que soporten este formato. También puede usarse con vLLM si se convierte a otro formato, aunque no es el flujo habitual.
- Latencia y throughput: según Liquid AI, el modelo base decodifica a ~220 tok/s en Apple M5 Max y ~30 tok/s en teléfono. En GPUs de gama media, se esperan valores intermedios, pero no hay mediciones publicadas para esta variante.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la información proporcionada. A continuación se presenta una comparativa cualitativa basada en características conocidas de modelos de tamaño similar:

| Modelo | Parámetros | Contexto | Licencia | Tool calling | Despliegue on-device |
|---|---|---|---|---|---|
| LFM2.5-2.6B (base) | 2.6B | 128K | LFM Open License | Sí | Sí (optimizado) |
| Llama-3.2-3B | 3B | 128K | Llama 3.2 Community License | No nativo (requiere adaptación) | Parcial |
| Qwen2.5-3B | 3B | 32K (según versión) | Apache 2.0 | Sí (con entrenamiento específico) | Parcial |

Nota: los datos de Llama-3.2-3B y Qwen2.5-3B son de conocimiento general y pueden variar según la versión. No se han encontrado comparativas directas con la variante Pashto-Zi.

## Limitaciones y advertencias

- La variante Pashto-Zi no tiene documentación técnica publicada: se desconoce el proceso de fine-tuning, el dataset utilizado y el alcance exacto de su especialización en pashto.
- La licencia de esta cuantización no está especificada. Aunque el modelo base usa LFM Open License, el usuario mradermacher no indica la licencia de sus archivos GGUF, lo que puede generar incertidumbre legal para uso comercial.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en idiomas con menos datos de entrenamiento como el pashto.
- Sesgos potenciales: al ser un fine-tuning no documentado, puede heredar sesgos del modelo base o introducir sesgos específicos del dataset de adaptación.
- Limitaciones de contexto: aunque el modelo base soporta 128K tokens, el rendimiento en contextos muy largos puede degradarse, y no se ha verificado en la variante Pashto-Zi.
- Restricciones de uso: la LFM Open License del modelo base puede tener cláusulas específicas (por ejemplo, restricciones de uso militar o de vigilancia) que deben revisarse antes de su implementación en producción.

## Enlaces

- Cuantización GGUF: https://huggingface.co/mradermacher/LFM2.5-2.6B-Pashto-Zi-GGUF
- Modelo base original (LiquidAI): https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Cuantizaciones GGUF oficiales de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-2.6B-GGUF
- Documentación del modelo en Liquid Docs: https://docs.liquid.ai/lfm/models/lfm25-2.6b
- Blog de Liquid AI sobre LFM2.5-2.6B: https://www.liquid.ai/blog/lfm2-5-2-6b
- Página de LLM Releases: https://www.llm-releases.com/models/lfm2-5-2-6b
