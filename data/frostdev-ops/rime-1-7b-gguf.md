# frostdev-ops/Rime-1.7B-GGUF

## Resumen

Rime 1.7B es un ajuste fino del modelo LiquidAI/LFM3-1.7B desarrollado por Frostdev para Glaze, una extensión de navegador orientada a plataformas de gestión del aprendizaje (Blackboard, Canvas y Moodle). El modelo está especializado en tareas académicas concretas: responder preguntas sobre cursos y fechas de entrega, gestionar memoria persistente, ofrecer retroalimentación de escritura contra rúbricas, generar esquemas y ayudar al estudio sin revelar respuestas. Se distribuye exclusivamente en formato GGUF para su ejecución local mediante WebGPU en el ordenador del estudiante.

Con 1.728.801.600 parámetros, es un modelo compacto pensado para inferencia en el cliente. La versión r11 (Glaze 4.0.3 y posteriores) incorpora un modo de razonamiento breve ("thinking") para llamadas a herramientas y respuestas de chat cuando el contexto supera los 4K tokens. Soporta seis idiomas (inglés, español, alemán, francés, neerlandés y portugués), aunque el autor advierte que los datos de entrenamiento más recientes son en inglés y el resto de idiomas es menos fiable.

La relevancia actual del modelo radica en su enfoque de despliegue: inferencia local en el navegador del usuario mediante WebGPU, sin depender de servidores externos, con verificación SHA-256 de los pesos descargados. El modelo base LFM3-1.7B de Liquid AI pertenece a la familia LFM3, y este ajuste demuestra un caso de uso verticalizado (educación) sobre una arquitectura compacta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM3-1.7B) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 128K (tokens especiales por tamano de contexto de 4K a 128K); ventana por defecto en Glaze: 64K |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, es, de, fr, nl, pt |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante LoRA sobre LiquidAI/LFM3-1.7B. La arquitectura concreta del modelo base no se detalla en la información disponible; se sabe que es un transformer de 1.7B parámetros, pero no se confirman detalles como tipo de atención, uso de MoE o componentes híbridos. La versión r11 se construye como un LoRA nuevo sobre los pesos fusionados de la r8, añadiendo ejemplos de razonamiento ("thinking"), memoria, chat largo y saludos. Versiones anteriores también emplearon conjuntos de datos abiertos, cuyas licencias se listan en el fichero NOTICE.

El entrenamiento se realizó sobre ejemplos sintéticos de las tareas de Glaze, generados y validados por los propios validadores de tareas de Glaze y por un juez LLM, con filtrado para evitar fugas desde los conjuntos de test. El formato de prompt emplea la plantilla ChatML de LFM3 con 23 tokens especiales añadidos (ids 125033–125055): uno por tarea, uno por tamaño de contexto (de 4K a 128K) y delimitadores alrededor del texto de página y documento para impedir que ese texto se interprete como instrucciones. Sin esos tokens, el modelo se comporta como un chat ChatML genérico.

## Capacidades

- Generación de texto conversacional en seis idiomas (en, es, de, fr, nl, pt), con mayor fiabilidad en inglés.
- Llamada a herramientas (tool calling) integrada con las herramientas LMS de Glaze para consultar cursos, fechas de entrega, calificaciones y la página abierta.
- Gestión de memoria: guardar, buscar y olvidar información que el estudiante solicita recordar.
- Retroalimentación de escritura contra rúbricas, revisión de borradores, generación de esquemas, requisitos, citas y pesos de calificación de programas.
- Ayuda al estudio con pistas y verificación de pasos sin revelar la respuesta.
- Completados breves en gris mientras el estudiante escribe.
- Modo de razonamiento breve ("thinking") antes de llamadas a herramientas y respuestas de chat cuando el contexto supera 4K tokens.
- Soporte de contexto largo con tokens especiales para ventanas de 4K a 128K.

## Casos de uso

- Asistente académico en el navegador: el modelo responde preguntas sobre cursos, fechas de entrega y calificaciones mediante las herramientas LMS de Glaze, ejecutándose localmente con WebGPU en el equipo del estudiante y con contexto por defecto de 64K.
- Revisión de borradores contra rúbricas: evalúa un texto del estudiante frente a los criterios de una rúbrica y devuelve retroalimentación estructurada, adecuado por su entrenamiento específico en esta tarea.
- Generación de esquemas y extracción de requisitos: a partir de un enunciado o sílabo, produce esquemas, listas de requisitos y pesos de calificación, tarea para la que fue ajustado explícitamente.
- Tutoría socrática: ofrece pistas y verifica pasos intermedios sin dar la solución, útil en entornos educativos donde se busca guiar en lugar de resolver.
- Memoria de preferencias del estudiante: guarda y recupera información que el usuario pide recordar (por ejemplo, plazos o preferencias de formato), aunque el autor señala que la memoria es su área más débil.
- Autocompletado contextual: genera completados breves en gris mientras el estudiante escribe, integrándose en el editor de Glaze.
- Despliegue local sin servidor: al distribuirse en GGUF y ejecutarse en WebGPU, permite usar el asistente sin enviar datos académicos a servidores externos, con verificación SHA-256 de los pesos.

## Benchmarks y rendimiento

Evaluación sobre conjuntos sintéticos retenidos, ejecutada en el motor y el código de tareas de Glaze 4.0.3 con cuantización Q4_K_M. Un caso cuenta solo si se realizan todas las llamadas a herramientas requeridas y la respuesta pasa la comprobación propia de Glaze.

| Conjunto | Casos | 64K, con thinking | 4K |
|---|---|---|---|
| Herramientas de agente | 330 | 261 | 239 |
| Tareas multi-paso con herramientas | 60 | 31 | 27 |
| Chats nuevos (saludos, conversación trivial) | 40 | 36 | 37 |
| Preguntas sobre la página abierta o el curso | 72 | 50 | 35 |
| Memoria | 36 | 12 | 15 |
| Recuerdo en chat largo | 12 | 1 | – |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q8_0 ~1.85 GB, Q6_K ~1.43 GB, Q5_K_M ~1.26 GB, Q4_K_M ~1.10 GB (tamaños de fichero; el consumo real de memoria es algo superior por el contexto y el runtime).
- GPU recomendadas: no se especifican en la información disponible. El despliegue previsto es WebGPU en el navegador del estudiante, por lo que se apunta a GPUs de consumo integradas o dedicadas con soporte WebGPU.
- Cabe en GPU de consumo: sí, dado el tamaño de los ficheros (1.10–1.85 GB) y el rango de parámetros (1.7B).
- Opciones de despliegue: motor WebGPU de Glaze (entorno previsto); al ser GGUF, es compatible con runtimes de inferencia GGUF como llama.cpp u Ollama, aunque no se confirma soporte oficial en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Rime 1.7B (este) | 1.728.801.600 | hasta 128K (64K por defecto en Glaze) | LFM Open License v1.0 | GGUF | Ajuste fino verticalizado para educación |
| LiquidAI/LFM3-1.7B | 1.7B (modelo base) | no disponible | LFM Open License v1.0 | no disponible | Modelo base sin ajuste específico de tareas |
| Alternativas de 1-2B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información disponible.

## Limitaciones y advertencias

- Es un modelo de 1.7B y comete errores; la retroalimentación y las calificaciones deben tratarse como una segunda opinión, no como las de un profesor.
- La memoria es su área más débil: a menudo omite la consulta de memoria que debería realizar, y las confirmaciones de guardado pueden ser rechazadas por la comprobación de Glaze.
- Rara vez recuerda detalles de partes lejanas de un chat largo (1 de 12 casos en el conjunto de recuerdo en chat largo).
- Los datos de entrenamiento más recientes son en inglés; los otros cinco idiomas son menos fiables.
- Licencia LFM Open License v1.0: el uso comercial por parte de una organización con ingresos anuales de 10 millones de dólares o más no está licenciado.
- El modelo está diseñado para ejecutarse con los tokens especiales y la plantilla de Glaze; sin ellos se comporta como un chat ChatML genérico, con menor rendimiento en las tareas para las que fue ajustado.
- No se han publicado datos sobre sesgos específicos en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/frostdev-ops/Rime-1.7B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Glaze (extensión): https://frostdev.io/glaze
- Versión anterior r5 (commit): https://huggingface.co/frostdev-ops/Rime-1.7B-GGUF/tree/1d945ca0420ca0952c641b8dfed789c4a13bff0f
- Licencia LFM Open License v1.0: referenciada como LICENSE en el repositorio
- Atribuciones de fuentes de datos: referenciadas como NOTICE en el repositorio
