# PerceptronAI/Isaac-0.5

## Resumen

Isaac 0.5 es un modelo fundacional de código abierto para aprendizaje robótico desarrollado por PerceptronAI, una startup fundada por exinvestigadores de Meta. Se trata de un modelo de 36 000 millones de parámetros con arquitectura de mezcla de expertos (MoE) que unifica comprensión de vídeo multimodal, razonamiento encarnado, anclaje espacial, estimación de progreso de tareas y control robótico en un único backbone compartido. El modelo acepta como entrada imágenes, vídeo, instrucciones en lenguaje natural, estado del robot y acciones previas, y produce texto, coordenadas normalizadas, salidas de estado de tarea o acciones del robot.

Isaac 0.5 está entrenado con más de 35 sistemas robóticos, 100 000 horas de experiencia robótica, un millón de horas de vídeo general y tres billones de tokens multimodales. Su relevancia radica en ser, según sus autores, el primer modelo abierto que opera en la frontera de la comprensión de vídeo multimodal, el razonamiento encarnado y el control robótico, ofreciendo una pila completa de entrenamiento y despliegue que incluye pesos, código, integración con LeRobot y manifiestos de reproducción. El repositorio de HuggingFace está actualmente vacío (0.0 GB) y los pesos están marcados como "próximamente".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) sobre backbone vision-lenguaje de la familia Qwen, con expertos dispersos y experto compartido |
| Parámetros totales | 36 000 millones (36B) |
| Parámetros activos | No disponible (la model card no especifica el número de parámetros activos por token) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible (la model card indica "Add the final license before publication") |
| Formato de pesos | No disponible (repo vacío, pesos "COMING SOON") |

## Arquitectura y entrenamiento

Isaac 0.5 utiliza un backbone vision-lenguaje de 36B parámetros de la familia Qwen con expertos dispersos. Texto, visión, tiempo, estado del robot e historial de acciones entran en una única secuencia compartida. Cada capa de mezcla de expertos da a cada token acceso a 256 expertos aprendidos y una ruta nula; un token puede usar de cero a ocho expertos enrutados, mientras que un experto compartido y una ruta residual permanecen activos. Esto permite que el cómputo enrutado varíe entre tokens visuales, lingüísticos, de estado y de acción. La interfaz autorregresiva produce texto, coordenadas normalizadas, salidas de estado de tarea y acciones discretas mediante un vocabulario separado de 2048 tokens FAST. Para el control continuo, los estados del backbone condicionan un "Flow expert" dedicado y un transformer de difusión de 36 bloques que genera un fragmento de acción (action chunk).

El entrenamiento combina vídeo general, vídeo egocéntrico, datos UMI y teleoperación, co-entrenados desde el principio sobre un mismo backbone. El modelo establece una ley de escalado para la mezcla de datos: a una pérdida de acción objetivo de 2.50, un modelo entrenado con 1000 horas de vídeo general requiere unas 5900 horas de teleoperación, mientras que uno entrenado con un millón de horas de vídeo general requiere solo unas 28 horas, una reducción de 210× en teleoperación necesaria. Además, incorpora modelado semántico del mundo: predice perceptos futuros compactos que capturan cambios relevantes para la tarea, como movimiento de objetos, contacto, estado de agarre, relaciones espaciales y progreso de la tarea, utilizando una función de pérdida sobre observaciones pasadas y perceptos futuros.

## Capacidades

- Comprensión de vídeo multimodal: responde preguntas sobre vídeo, identifica y rastrea objetos, y estima el progreso de tareas.
- Razonamiento encarnado: integra estado del robot, historial de acciones e instrucciones en lenguaje para razonar sobre el entorno físico.
- Anclaje espacial: produce coordenadas normalizadas para señalar y seguir objetos en la escena.
- Control robótico: genera acciones de robot tanto discretas (vocabulario FAST de 2048 tokens) como continuas (a través del Flow expert y el transformer de difusión).
- Control en bucle cerrado en tiempo real: predice el siguiente fragmento de acción mientras el actual aún se está ejecutando, usando la observación más reciente y los comandos emitidos previamente.
- Estimación de estado de tarea: produce salidas de estado que indican en qué fase de la tarea se encuentra el sistema.
- Multilingüe: solo inglés declarado en la model card.
- Integración con LeRobot y referencia de servidor de políticas para despliegue.

## Casos de uso

- Automatización industrial en almacenes y fábricas: Isaac 0.5 puede guiar robots de visión para navegar entornos complejos, extraer inteligencia visual de vídeos grabados y ejecutar tareas de manipulación con control en bucle cerrado, reduciendo la necesidad de teleoperación gracias a su ley de escalado de datos.
- Aprendizaje por imitación con datos propios: equipos pueden afinar el modelo como política robótica usando sus propios datos de teleoperación o UMI, aprovechando el backbone preentrenado con 100 000 horas de experiencia robótica y un millón de horas de vídeo general.
- Generación de políticas a partir de vídeo: el modelo puede analizar vídeos egocéntricos o generales para extraer perceptos semánticos (contacto, agarre, movimiento) y usarlos como supervisión para entrenar políticas sin necesidad de etiquetas de acción.
- Motor de datos para robótica: los perceptos futuros predichos por el modelo pueden servir para filtrar, anotar o aumentar datasets de entrenamiento, mejorando la eficiencia de la recolección de datos.
- Asistencia a la planificación de tareas: integrado en un planificador o controlador, Isaac 0.5 puede proporcionar estimaciones de progreso de tarea y anclaje espacial para que un sistema de alto nivel decida los siguientes pasos.
- Investigación en modelos encarnados: como modelo abierto con código de entrenamiento e inferencia, sirve como banco de pruebas para estudiar leyes de escalado en datos de vídeo y robótica, y para comparar arquitecturas MoE en control continuo y discreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una ley de escalado con valores de pérdida de acción (2.50) y reducciones de teleoperación, pero no presenta métricas estándar como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos en tareas robóticas o de vídeo.

## Requisitos de hardware

- No se dispone de información oficial sobre requisitos de hardware en la documentación proporcionada.
- Dado que el modelo tiene 36B parámetros en arquitectura MoE, una estimación orientativa (no confirmada por el autor) sería: en FP16, el checkpoint completo ocuparía aproximadamente 72 GB de VRAM, por lo que se necesitarían GPUs de clase A100 (80 GB) o H100 (80 GB) para inferencia sin cuantización. Con cuantización a 8 bits, podría caber en una RTX 4090 (24 GB) o similar, pero esto es especulativo.
- No se mencionan opciones de despliegue específicas (vLLM, llama.cpp, Ollama, TGI) en la información disponible. La model card menciona integración con LeRobot y un servidor de políticas de referencia, pero no detalles de latencia o throughput.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. Isaac 0.5 se posiciona como un modelo fundacional para robótica, similar en espíritu a propuestas como OpenVLA (7B) o RT-2 de Google, pero con un tamaño significativamente mayor (36B) y una arquitectura MoE dinámica. Sin embargo, no hay métricas publicadas que permitan una comparación cuantitativa rigurosa. Se recomienda consultar el paper del modelo cuando esté disponible para obtener datos de evaluación.

## Limitaciones y advertencias

- El repositorio de HuggingFace está vacío (0.0 GB) y los pesos están marcados como "COMING SOON"; no es posible descargar ni probar el modelo actualmente.
- La licencia no está definida: la model card indica explícitamente que se debe añadir la licencia final antes de la publicación. Esto impide conocer las restricciones de uso comercial.
- Solo se declara soporte para inglés; no hay evidencia de capacidades multilingües.
- No se han publicado benchmarks estándar, por lo que el rendimiento real en tareas de razonamiento, generación de código o matemáticas es desconocido.
- El modelo está orientado a robótica y vídeo; su uso fuera de estos dominios no está documentado.
- La model card está incompleta (el texto se corta en "The checkpoint contains 36"), lo que impide conocer detalles adicionales sobre el entrenamiento, la arquitectura o las limitaciones específicas.
- Riesgo de alucinación y sesgos: al ser un modelo de lenguaje y visión entrenado con datos de vídeo general, puede heredar sesgos de los datos y producir salidas inexactas en situaciones no representadas en el entrenamiento. No hay información sobre evaluaciones de sesgo o seguridad.

## Enlaces

- HuggingFace: https://huggingface.co/PerceptronAI/Isaac-0.5
- Paper (PDF): https://pub-d90b81cad7254a1aa6b148ac18153c0c.r2.dev/isaac-0.5.pdf
- Repositorio GitHub: https://github.com/perceptron-ai-inc/isaac
- Artículo en RobotToday: https://robottoday.com/industry-briefing/perceptron-launches-isaac-0-5-to-enhance-visual-ai-for-industrial-automation/11634
- Artículo en AIDirectory: https://aidirectory.com/news/perceptron-launches-isaac-0-5-visual-ai-factories-warehouses
- Anuncio en X (Twitter): https://x.com/perceptroninc/status/2092678357775442103
