# FlexiSLM/FlexiSLM-7B-Stage2-v1

## Resumen

FlexiSLM es un modelo de lenguaje hablado (Spoken Language Model, SLM) desarrollado por el equipo AmphionTeam, presentado en el artículo "FlexiSLM: A Dynamic and Controllable Frame Rate Spoken Language Model" (arXiv:2606.31247). Se trata del primer SLM que soporta frecuencias de fotograma (frame rates) dinámicas y controlables tanto en la entrada como en la salida de voz, lo que permite un equilibrio ajustable entre latencia y calidad en la generación de habla.

El modelo emplea una arquitectura Thinker-Talker con compresión dinámica de frecuencia de fotogramas en la entrada de voz y generación controlable de frecuencia de fotogramas en la salida. Según los resultados publicados, FlexiSLM supera a modelos de 7B con frecuencia fija como Qwen2.5-Omni y Kimi-Audio en sus puntos de operación de alta calidad. Esta versión concreta, FlexiSLM-7B-Stage2-v1, corresponde a la segunda etapa de un entrenamiento que progresa en tres fases, comenzando con el preentrenamiento del componente Talker.

El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en proyectos de código abierto. El repositorio oficial indica que el código de entrenamiento e inferencia estaba previsto para agosto de 2026, y que se planea liberar una versión reproducida del checkpoint junto con datos de entrenamiento de diálogo voz-a-voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Thinker-Talker con compresion dinamica de frame rate en entrada y generacion controlable en salida |
| Parametros totales | 7B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

FlexiSLM utiliza una arquitectura Thinker-Talker, un diseño de dos componentes en el que un "pensador" (Thinker) procesa la información semántica y un "hablador" (Talker) se encarga de la generación acústica del habla. La innovación principal reside en el uso de representaciones de frecuencia de fotogramas dinámicas: la entrada de voz se comprime de forma adaptativa según su contenido, y la salida puede generarse a diferentes frecuencias de fotogramas de forma controlable, lo que permite ajustar el compromiso entre latencia y calidad en tiempo de inferencia.

El entrenamiento se organiza en tres etapas, comenzando con el preentrenamiento del Talker. Esta versión concreta (Stage2-v1) corresponde a la segunda etapa del proceso. Los detalles específicos sobre el volumen de datos de entrenamiento, la composición del dataset y el uso de técnicas como RLHF o DPO no están disponibles en la información pública actual. El equipo planea liberar una versión reproducida del modelo junto con 5 millones de muestras de datos de entrenamiento de diálogo voz-a-voz, aunque esta publicación estaba pendiente de aprobación según el repositorio.

## Capacidades

- Conversación voz-a-voz: el modelo está diseñado específicamente para diálogos hablados, procesando entrada de audio y generando respuestas de voz directamente.
- Frecuencia de fotogramas dinámica en entrada: comprime la representación de audio de entrada de forma adaptativa, reduciendo el coste computacional en segmentos redundantes.
- Frecuencia de fotogramas controlable en salida: permite ajustar la tasa de generación de fotogramas de voz, ofreciendo un equilibrio configurable entre latencia y calidad.
- Puntos de operación de alta calidad: según el artículo, supera a Qwen2.5-Omni y Kimi-Audio (ambos de 7B con frecuencia fija) en sus configuraciones de alta calidad.
- Generación de habla integrada: al ser un SLM, no requiere un pipeline separado de TTS para producir respuestas habladas.

## Casos de uso

- Asistentes de voz conversacionales: el modelo puede mantener diálogos hablados multi-turno con respuesta directa en audio, eliminando la necesidad de encadenar un ASR, un LLM y un TTS por separado.
- Sistemas de atención al cliente por teléfono: su capacidad de ajustar la frecuencia de fotogramas permite priorizar baja latencia en interacciones simples y alta calidad en conversaciones complejas.
- Traducción e interpretación hablada: al procesar y generar voz directamente, puede emplearse en escenarios de interpretación en tiempo real donde la latencia es crítica.
- Interfaces de voz para dispositivos embebidos: la compresión dinámica de entrada reduce el coste computacional, lo que puede facilitar el despliegue en hardware con recursos limitados.
- Investigación en modelos de lenguaje hablado: sirve como referencia para estudiar el impacto de frecuencias de fotogramas dinámicas frente a fijas en la calidad y eficiencia de SLMs.
- Aplicaciones de accesibilidad: puede integrarse en sistemas de lectura de pantalla o asistentes para personas con discapacidad visual que requieran interacción natural por voz.

## Benchmarks y rendimiento

No se han publicado resultados numéricos detallados de benchmarks en la información disponible. El artículo indica que FlexiSLM supera a Qwen2.5-Omni y Kimi-Audio en sus puntos de operación de alta calidad, pero no se proporcionan cifras concretas de métricas como MMLU, HumanEval o métricas específicas de calidad de voz en los materiales consultados.

## Requisitos de hardware

No se dispone de información específica sobre requisitos de hardware en la documentación pública actual. Dado que se trata de un modelo de 7B parámetros, se puede estimar razonablemente que:

- La inferencia en precisión FP16 requeriría aproximadamente 14-16 GB de VRAM, lo que lo haría ejecutable en GPUs como RTX 4090 (24 GB) o A100 (40/80 GB).
- Con cuantización a 4 bits, podría caber en GPUs de 8 GB, aunque no se han publicado pesos cuantizados oficialmente.
- Las opciones de despliegue habituales para modelos de este tamaño (vLLM, llama.cpp, Ollama, TGI) podrían ser aplicables, pero no hay confirmación oficial de compatibilidad.
- Estos valores son estimaciones basadas en el tamaño del modelo y no en datos publicados por el equipo.

## Comparativa con modelos similares

| Modelo | Parametros | Frame rate | Licencia | Disponibilidad |
|---|---|---|---|---|
| FlexiSLM-7B | 7B | Dinamico y controlable | Apache 2.0 | Checkpoint en HF, codigo pendiente |
| Qwen2.5-Omni | 7B | Fijo | Apache 2.0 | Disponible |
| Kimi-Audio | 7B | Fijo | no disponible | Disponible |

Según el artículo, FlexiSLM supera a ambos modelos en puntos de operación de alta calidad, aunque no se especifican las métricas exactas. La principal ventaja diferencial es la flexibilidad en la frecuencia de fotogramas, que permite adaptar el comportamiento del modelo al escenario de uso.

## Limitaciones y advertencias

- El modelo se encuentra en una fase temprana de publicación: el código de entrenamiento e inferencia estaba pendiente de aprobación y los checkpoints reproducidos no se habían liberado en el momento de la consulta.
- No se dispone de información sobre sesgos, riesgos de alucinación o limitaciones idiomáticas, ya que la documentación pública es mínima.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre datos de entrenamiento dificulta evaluar riesgos de privacidad o sesgos en el habla generada.
- Al ser un modelo de investigación en fase de reproducción, no se recomienda su uso en producción sin validación adicional.
- No se han publicado datos sobre latencia, throughput o requisitos de memoria, lo que dificulta la planificación de despliegues.
- La información sobre idiomas soportados no está disponible; se desconoce si el modelo es multilingüe o está limitado a un idioma concreto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FlexiSLM/FlexiSLM-7B-Stage2-v1
- Repositorio GitHub: https://github.com/AmphionTeam/FlexiSLM
- Artículo arXiv: https://arxiv.org/abs/2606.31247
- Página de demostración: https://flexislm.github.io/
- Organización en HuggingFace: https://huggingface.co/FlexiSLM/models
