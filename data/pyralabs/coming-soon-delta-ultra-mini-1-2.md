# PyraLabs/Coming-Soon-Delta-Ultra-Mini-1.2

## Resumen

El **Delta Ultra Mini 1.2** es un modelo de lenguaje experimental de aproximadamente 306,5 millones de parámetros, desarrollado por **PyraLabs** (en colaboración con el proyecto **FlareAI**) como parte de la familia Delta Ultra Mini. Está diseñado como un modelo ligero orientado a investigación y experimentación, con soporte bilingüe para portugués (Brasil) e inglés. El modelo se encuentra actualmente en desarrollo y **no está disponible para descarga**; la model card lo anuncia como "em breve" (próximamente).

Su relevancia radica en que representa un intento de crear un SLM (small language model) agéntico capaz de ejecutarse en dispositivos móviles, con soporte de tool calling como objetivo experimental. La versión 1.2 introduce un dataset refinado y una arquitectura expandida respecto a la 1.1, con mejoras en el seguimiento de instrucciones y la coherencia conversacional. No obstante, al ser un proyecto en fase de pruebas, carece de garantías de rendimiento y no se recomienda para aplicaciones críticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Decoder-only |
| Parametros totales | ~306,5 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (a definir) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugues (Brasil) e ingles |
| Licencia | MIT |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Transformer decoder-only, típica de los modelos causales de lenguaje. No se han publicado detalles sobre el número de capas, dimensiones ocultas o mecanismos de atención específicos. El entrenamiento se basa en **The Delta Dataset**, un dataset colaborativo de código abierto en formato **Deltaset**, que ha sido refinado para esta versión con mejor filtrado de duplicados y ruido, y un mejor equilibrio entre contenidos conversacionales, instruccionales y técnicos. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación explícitas. El proyecto declara como objetivo experimental la creación de un SLM agéntico con tool calling, aunque no se garantiza su materialización.

## Capacidades

- Generación de texto general y conversaciones multi-turno.
- Asistencia en programación (generación y depuración de código básico).
- Escritura creativa (cuentos, diálogos, ideas).
- Respuesta a preguntas sobre temas generales.
- Aplicaciones educativas y de aprendizaje.
- Asistentes de IA locales en dispositivos con recursos limitados.
- Proyectos experimentales de investigación en modelos ligeros.
- Soporte bilingüe portugués-inglés, con mejor comprensión del portugués brasileño.
- Seguimiento de instrucciones mejorado respecto a la versión 1.1, aunque sin garantías de consistencia.
- Tool calling: mencionado como objetivo experimental, no confirmado en esta versión.

## Casos de uso

- **Prototipado de asistentes conversacionales**: al ser un modelo pequeño y ligero, puede integrarse en aplicaciones móviles o de escritorio para probar flujos de conversación sin depender de APIs externas, aunque su calidad limitada lo hace adecuado solo para demos y pruebas.
- **Educación y aprendizaje de LLMs**: su tamaño reducido y licencia MIT permiten usarlo en cursos o talleres para enseñar conceptos de fine-tuning, inferencia local y evaluación de modelos, sin necesidad de hardware costoso.
- **Generación de contenido en portugués**: puede emplearse para redactar borradores de textos, correos o publicaciones en portugués brasileño, siempre que se revise el resultado debido a posibles alucinaciones.
- **Asistencia básica de programación**: para tareas simples como explicar fragmentos de código, sugerir nombres de variables o generar funciones cortas, útil en entornos de aprendizaje.
- **Investigación en SLMs**: sirve como base para estudiar el impacto del refinamiento de datasets en modelos pequeños, comparando versiones 1.1 y 1.2, o para experimentar con técnicas de cuantización y despliegue en edge devices.
- **Chatbots educativos**: integrable en plataformas de práctica de idiomas o tutorías simples, donde las respuestas incorrectas pueden ser corregidas por un moderador humano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo está en desarrollo y no se ha evaluado formalmente en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- **VRAM estimada**: con ~306,5 millones de parámetros, en FP16 la inferencia requiere aproximadamente 0,6 GB de VRAM solo para los pesos; con overhead de activaciones y KV cache, se estima entre 1 y 2 GB para contextos cortos. En cuantización INT8 o INT4, podría reducirse a menos de 1 GB.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluyendo NVIDIA GTX 1650, RTX 2060, RTX 3050, o incluso iGPUs con memoria compartida (aunque con menor rendimiento). También es viable en Apple Silicon con Metal.
- **Compatibilidad con consumer GPU**: sí, cabe en la mayoría de GPUs de consumo actuales y en muchas tarjetas antiguas.
- **Opciones de despliegue**: al ser un modelo transformers estándar, puede ejecutarse con Hugging Face Transformers, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta), vLLM (para inferencia optimizada) o TGI. Dado su tamaño, también es viable en CPU con cuantización.
- **Latencia y throughput**: no hay datos publicados. En una GPU moderna (RTX 3090 o superior), se espera una latencia de decodificación de decenas de milisegundos por token; en CPU, podría ser de cientos de milisegundos por token. Son estimaciones basadas en modelos de tamaño similar.

## Comparativa con modelos similares

No se dispone de comparativas oficiales. Como referencia orientativa, modelos de tamaño similar (300-400M) incluyen:

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Delta Ultra Mini 1.2 | ~306M | no disponible | MIT | En desarrollo, no disponible |
| TinyLlama 1.1B | 1,1B | 2048 | Apache 2.0 | Disponible |
| Phi-2 (Microsoft) | 2,7B | 2048 | MIT | Disponible |
| Qwen2.5-0.5B | 0,5B | 32768 | Apache 2.0 | Disponible |

El Delta Ultra Mini 1.2 es significativamente más pequeño que estas alternativas y no puede compararse en rendimiento sin datos de benchmarks. Su principal diferenciación es el enfoque en portugués brasileño y su carácter experimental.

## Limitaciones y advertencias

- **Modelo no disponible**: actualmente no se puede descargar ni probar; cualquier uso está pendiente de su publicación.
- **Alucinaciones**: puede generar información incorrecta o inconsistente, especialmente en temas especializados.
- **Seguimiento de instrucciones imperfecto**: no siempre cumple las instrucciones de forma precisa.
- **Contexto no definido**: la ventana de contexto no se ha especificado, lo que impide planificar su uso en tareas de memoria larga.
- **Idiomas limitados**: solo portugués e inglés; el rendimiento en otros idiomas es nulo o muy pobre.
- **No apto para producción**: al ser experimental, no se recomienda para aplicaciones críticas, médicas, legales o financieras.
- **Rendimiento variable**: la calidad de las respuestas depende de la tarea y el idioma, con mayor fiabilidad en portugués brasileño.
- **Licencia MIT**: permite uso comercial, pero al no haber pesos publicados, la licencia es teórica hasta su lanzamiento.

## Enlaces

- [HuggingFace - PyraLabs/Coming-Soon-Delta-Ultra-Mini-1.2](https://huggingface.co/PyraLabs/Coming-Soon-Delta-Ultra-Mini-1.2)
- [The Delta Dataset (GitHub)](https://github.com/Flame-FlareAI/The-Delta-Dataset)
