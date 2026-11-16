# bisonnetworking/MedPsy-4B-MLX-4bit

## Resumen

MedPsy-4B-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo `qvac/MedPsy-4B`, un modelo de razonamiento médico y sanitario de tipo texto desarrollado por QVAC. El modelo base parte de Qwen3-4B-Thinking-2507 y se post-entrena mediante fine-tuning supervisado y aprendizaje por refuerzo para tareas de razonamiento clínico. Esta versión concreta, publicada por el usuario `bisonnetworking`, está optimizada para inferencia en Apple Silicon mediante la librería MLX.

El modelo resuelve la necesidad de ejecutar localmente, en hardware de consumo de Apple, un modelo especializado en dominio médico con capacidad de razonamiento explícito (sección ``). Con 4.022.468.096 parámetros totales y un peso aproximado de 2,1 GB tras la cuantización, es viable en equipos con memoria unificada moderada. La relevancia actual reside en la combinación de especialización de dominio, razonamiento encadenado y despliegue local sin GPU dedicada.

La ficha se centra en la conversión MLX 4-bit. Los datos de rendimiento del modelo base pertenecen a QVAC y no han sido reproducidos de forma independiente para esta versión cuantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3-4B-Thinking-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 4-bit, modo affine, group size 64, 4.501 bits efectivos por peso |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | MLX safetensors (repo de 2,3 GB; directorio del modelo ~2,1 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Qwen3-4B-Thinking-2507, de 4.022 millones de parámetros y orientado a razonamiento explícito mediante bloques `<think>...</think>`. QVAC realizó un post-entrenamiento sobre esta base con fine-tuning supervisado y aprendizaje por refuerzo, especializándolo en razonamiento médico y sanitario. El modelo es exclusivamente de texto; no incorpora visión ni audio.

Esta conversión concreta aplica cuantización MLX en modo affine a 4 bits con group size 64 (4.501 bits efectivos por peso), generada con MLX-LM 0.31.3 y MLX 0.32.1. No se ha reentrenado ni modificado el comportamiento del modelo base; la conversión solo reduce la precisión de los pesos para abaratar memoria y acelerar la inferencia en Apple Silicon. No se dispone de información sobre el número de tokens de entrenamiento ni la composición exacta del dataset del modelo original.

## Capacidades

- Generación de texto en dominio médico y sanitario, con razonamiento clínico.
- Modo de razonamiento explícito: puede emitir una sección `<think>...</think>` antes de la respuesta final, heredada del modelo base.
- Respuestas conversacionales de un solo turno o multi-turno mediante plantilla de chat.
- Razonamiento paso a paso orientado a explicaciones clínicas (por ejemplo, diferencia entre sensibilidad y especificidad).
- Generación determinista cuando se usa temperatura 0, útil para respuestas reproducibles.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible de forma explícita; el modo thinking aporta razonamiento interno, pero no se documenta integración de agentes.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistencia educativa en ciencias de la salud: el modelo puede explicar conceptos como sensibilidad, especificidad, valor predictivo o interpretación de pruebas diagnósticas, usando su modo de razonamiento para desglosar el razonamiento clínico paso a paso.
- Soporte a la formación médica en local: estudiantes pueden ejecutar el modelo en un Mac con Apple Silicon sin enviar datos a la nube, lo que facilita el estudio de casos con material sensible o confidencial.
- Borradores de resúmenes clínicos: dado un texto de caso (en inglés), el modelo puede generar un resumen estructurado o una lista de puntos clave, aprovechando su especialización sanitaria y su capacidad conversacional.
- Prototipado de asistentes clínicos: desarrolladores pueden integrar el modelo en una aplicación de escritorio o CLI mediante MLX-LM para validar flujos de preguntas y respuestas médicas antes de pasar a modelos mayores.
- Generación de material de divulgación sanitaria: redacción de explicaciones en inglés sobre enfermedades, tratamientos o procedimientos, con revisión humana posterior obligatoria.
- Evaluación comparativa de cuantizaciones: este repositorio sirve para medir el equilibrio entre velocidad (47,054 tok/s en M3 Pro) y calidad frente a las variantes de 6 y 8 bits del mismo modelo.
- Investigación en razonamiento de dominio: útil para estudiar cómo se comporta un modelo pequeño con modo thinking en tareas médicas, siempre con fines de investigación y no clínicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta conversión. La model card indica explícitamente que los resultados de benchmark reportados por QVAC corresponden al modelo base y no han sido reproducidos de forma independiente para esta versión cuantizada.

La única validación local documentada es una ejecución determinista en un Apple M3 Pro con 18 GB de memoria unificada:

| Metrica | Valor |
|---|---|
| Tokens de prompt | 48 |
| Tokens generados | 356 |
| Procesamiento de prompt | 53,435 tok/s |
| Generación | 47,054 tok/s |
| Memoria unificada pico | 2,468 GB |
| Terminación natural por EOS | correcta |
| Coherencia en dominio médico | correcta |

Estas cifras corresponden a una sola ejecución local y no constituyen una evaluación de calidad clínica ni de benchmark.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~2,468 GB en pico para la variante 4-bit (medido en M3 Pro de 18 GB).
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y superiores) con memoria unificada suficiente; validado en M3 Pro con 18 GB.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con al menos 8 GB de memoria unificada recomendable; el consumo medido ronda 2,5 GB.
- Opciones de despliegue: MLX-LM (`mlx_lm.generate` en CLI y API Python `load`/`generate`), librería MLX 0.32.1 y MLX-LM 0.31.3 como versiones de referencia.
- Latencia y throughput: 47,054 tok/s de generación y 53,435 tok/s de procesamiento de prompt en M3 Pro; el rendimiento varía según dispositivo, longitud de prompt y versión de software.
- Variantes alternativas del mismo modelo: 6-bit (~3,1 GB, 35,439 tok/s, 3,473 GB pico) y 8-bit (~4,0 GB, 28,149 tok/s, 4,459 GB pico).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedPsy-4B-MLX-4bit (este) | 4.022 M | no disponible | MLX 4-bit | apache-2.0 | Hugging Face |
| MedPsy-4B-MLX-6bit | 4.022 M (base) | no disponible | MLX 6-bit | apache-2.0 | Hugging Face |
| MedPsy-4B-MLX-8bit | 4.022 M (base) | no disponible | MLX 8-bit | apache-2.0 | Hugging Face |
| qvac/MedPsy-4B (base) | 4.022 M | no disponible | pesos completos | apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes más allá de velocidad y memoria. No se han identificado en la información proporcionada otros modelos médicos de tamaño comparable con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No es un dispositivo médico ni sustituye el juicio, diagnóstico o tratamiento profesional. Puede producir salidas incorrectas, incompletas o engañosas con apariencia de autoridad.
- Toda salida médica debe ser revisada de forma independiente por profesionales cualificados antes de cualquier uso.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente crítico en dominio sanitario.
- Idioma limitado al inglés; no se documenta soporte de castellano ni de otros idiomas.
- Longitud de contexto no disponible en la información proporcionada.
- Los benchmarks del modelo base no han sido reproducidos para esta cuantización; la calidad puede degradarse respecto a los pesos completos.
- Las cifras de rendimiento proceden de una única ejecución local y no constituyen una evaluación de calidad clínica.
- Licencia Apache 2.0 según el repositorio de origen, descrito para investigación y uso educativo; conviene revisar los archivos `LICENSE` y `ATTRIBUTIONS.md` incluidos antes de redistribuir o desplegar.
- Uso comercial: la licencia Apache 2.0 lo permite en principio, pero la model card del origen restringe explícitamente el uso a investigación y educación; es necesario verificar los términos antes de producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación comunitaria.

## Enlaces

- Repositorio de esta conversión: https://huggingface.co/bisonnetworking/MedPsy-4B-MLX-4bit
- Modelo base: https://huggingface.co/qvac/MedPsy-4B
- Blog de investigación de MedPsy: https://huggingface.co/blog/qvac/medpsy
- Variante 4-bit referenciada en la model card: https://huggingface.co/Irfanuruchi/MedPsy-4B-MLX-4bit
- Variante 6-bit referenciada en la model card: https://huggingface.co/Irfanuruchi/MedPsy-4B-MLX-6bit
- Variante 8-bit referenciada en la model card: https://huggingface.co/Irfanuruchi/MedPsy-4B-MLX-8bit
