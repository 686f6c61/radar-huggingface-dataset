# ImKyungjin/pi05-so101-cvpr2027-realworld-general

## Resumen

PI0.5 real-world general es un modelo de política robótica (vision-language-action, VLA) publicado por el usuario ImKyungjin en Hugging Face bajo el identificador `ImKyungjin/pi05-so101-cvpr2027-realworld-general`. Está construido sobre la arquitectura PI0.5, la evolución del modelo PI0 de Physical Intelligence para control de robots, y se distribuye en formato LeRobot con pesos safetensors. El modelo tiene 3.616.757.520 parámetros (aproximadamente 3,6 mil millones) y un repositorio de 14,5 GB.

El modelo está entrenado sobre datasets LeRobot del autor taewonkoo y está orientado a controlar un brazo robótico SO101 (SO-ARM101), un robot de bajo coste de la familia LeRobot. La interfaz de estado y acción son seis valores nativos de posición absoluta de articulaciones, y el mapeo de imágenes es `top -> base_0_rgb` y `front -> left_wrist_0_rgb`, con letterbox RGB a 224 píxeles.

Es relevante porque ejemplifica el ecosistema emergente de políticas VLA reentrenadas sobre hardware accesible: un modelo de base grande adaptado a un robot concreto mediante fine-tuning sobre datos de demostración. No obstante, la model card es explícita al señalar que este export no reclama ninguna tasa de éxito en robot físico, y no se publican benchmarks ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en PI0.5; transformer con encoder visual y decodificador de acciones |
| Parametros totales | 3.616.757.520 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo opera sobre instrucciones y observaciones visuales; no se documentan idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |
| Tamano del repositorio | 14,5 GB |
| Entrada de estado/accion | 6 valores de posicion absoluta de articulaciones (no deltas Panda ni radianes) |
| Mapeo de imagenes | top -> base_0_rgb, front -> left_wrist_0_rgb; letterbox RGB a 224 |
| Tokenizer | incluido en el repo, ruta `./tokenizer` relativa al directorio descargado |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura PI0.5, un modelo vision-language-action que combina un backbone de visión-lenguaje con un cabezal de generación de acciones para control robótico. La model card no detalla la composición interna (número de capas, dimensión oculta, mecanismo de atención) ni el número de tokens de entrenamiento. La información disponible indica que se entrenó sobre datasets LeRobot del autor taewonkoo, y que el repositorio incluye `experiment.json` y `data_audit.json` con detalles del experimento y de la auditoría de datos.

La interfaz de control es explícita: seis valores de posición absoluta de articulaciones como estado y como acción, con dos cámaras mapeadas a `base_0_rgb` (vista superior) y `left_wrist_0_rgb` (vista frontal de muñeca). Las imágenes se redimensionan con letterbox a 224 píxeles. El modelo requiere cargar las estadísticas de preprocesado y postprocesado guardadas en el repositorio, lo que implica que la normalización de estado y acción es específica de este entrenamiento. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control robótico de un brazo SO101 mediante predicción de posiciones absolutas de seis articulaciones.
- Percepción visual a partir de dos cámaras (vista superior y muñeca), con preprocesado letterbox a 224 píxeles.
- Ejecución de políticas condicionadas por instrucciones en lenguaje natural (arquitectura VLA), aunque no se documenta el soporte multilingüe.
- Integración con el ecosistema LeRobot para carga de datasets, tokenizer y estadísticas de normalización.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión general, audio ni modo thinking.

## Casos de uso

- Manipulación con brazo SO101 en laboratorio: el modelo predice las seis posiciones absolutas de articulaciones a partir de dos vistas de cámara, adecuado para tareas de pick-and-place sobre una mesa con el robot de bajo coste de LeRobot.
- Investigación en políticas VLA: sirve como punto de partida para comparar fine-tunings de PI0.5 sobre hardware accesible, dado que el repositorio incluye `experiment.json` y `data_audit.json`.
- Reentrenamiento con datos propios: al estar en formato LeRobot y con estadísticas de normalización incluidas, puede adaptarse a nuevos datasets de demostración del mismo robot.
- Reproducción de experimentos: el export permite reproducir el pipeline de inferencia con el tokenizer y las estadísticas empaquetadas, útil para validar resultados de investigación.
- Docencia y prototipado en robótica: el tamaño de 3,6 mil millones de parámetros y el hardware SO101 lo hacen viable en entornos académicos con GPUs de gama alta.
- Evaluación de robustez visual: el mapeo explícito de cámaras y el letterbox a 224 permiten estudiar el efecto de la configuración de sensores en el rendimiento de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que este export no reclama ninguna tasa de éxito en robot físico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 3,6 mil millones de parámetros, en FP16 se requieren aproximadamente 7,2 GB solo para pesos, más overhead de activaciones y del encoder visual; en FP32, unos 14,5 GB.
- GPU recomendadas: no documentadas. Por tamaño, una RTX 4090 (24 GB) o una A100/H100 son candidatas razonables en FP16, pero no hay confirmación del autor.
- Cabe en GPU de consumo: probablemente sí en GPUs con 16-24 GB en FP16, aunque no está verificado.
- Opciones de despliegue: la librería indicada es LeRobot; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| PI0.5 real-world general (este) | 3.616.757.520 | no disponible | no disponible | Hugging Face, formato LeRobot | Fine-tuning sobre SO101, sin benchmarks publicados |
| PI0 (Physical Intelligence) | no disponible en la informacion | no disponible | no disponible | Repositorio de Physical Intelligence | Modelo base VLA previo a PI0.5 |
| PI0.5 original | no disponible en la informacion | no disponible | no disponible | Publicacion de Physical Intelligence | Modelo base sin fine-tuning a SO101 |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas; la información proporcionada no incluye parámetros, contexto ni rendimiento de los modelos comparables.

## Limitaciones y advertencias

- La model card declara explícitamente que no se reclama ninguna tasa de éxito en robot físico; el rendimiento real no está validado.
- No se especifica licencia, por lo que el uso comercial queda sin marco legal claro y debe consultarse con el autor.
- El modelo está acoplado a un robot concreto (SO101) y a un mapeo de cámaras concreto; no es un modelo general fuera de esa configuración.
- La interfaz de estado y acción son posiciones absolutas de seis articulaciones, no deltas ni radianes; usarlo con otra convención produciría resultados incorrectos.
- Requiere cargar las estadísticas de preprocesado y postprocesado del repositorio; ignorarlas invalida la normalización.
- No se documentan sesgos, riesgo de alucinación ni limitaciones idiomáticas.
- El repositorio tiene 0 descargas y 0 likes, y la fecha de creación es posterior a la información de referencia; no hay validación comunitaria.
- No hay benchmarks, latencias ni requisitos de hardware publicados, lo que dificulta evaluar su idoneidad en producción.

## Enlaces

- Hugging Face: https://huggingface.co/ImKyungjin/pi05-so101-cvpr2027-realworld-general
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
