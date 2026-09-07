# lerobot/smolvla_base

## Resumen

SmolVLA es un modelo Vision-Language-Action (VLA) compacto y eficiente desarrollado por el equipo de LeRobot de Hugging Face para robotica asequible. Resuelve el problema de entrenar politicas de control de robots a partir de demostraciones humanas, combinando percepcion visual, estado del robot e instrucciones de lenguaje para generar acciones motoras continuas. Con 450 millones de parametros y un tamano de 1.8 GB, esta disenado para entrenarse en una sola GPU y desplegarse en hardware de consumo, igualando el rendimiento de VLA mucho mas grandes gracias a datos comunitarios. Su relevancia actual radica en democratizar el acceso a la robotica de bajo coste y permitir la adaptacion de politicas de manipulacion a tareas concretas mediante fine-tuning. El modelo usa un objetivo de entrenamiento de flow matching y esta pensado como base para casos de uso especificos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (instrucciones de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo Vision-Language-Action (VLA) que integra procesamiento de imagenes multi-vista, estado propioceptivo del robot e instrucciones de lenguaje para predecir acciones motoras continuas. La arquitectura interna completa no se detalla en la informacion disponible, pero el modelo utiliza un objetivo de entrenamiento de flow matching, que modela la distribucion de acciones como un campo vectorial para generar trazadas de movimiento suaves y estables. El entrenamiento se basa en datos de demostracion de la comunidad (imitation learning) y el modelo se publica como base para ser ajustado a tareas especificas mediante fine-tuning con datasets de LeRobot. No se especifica el numero de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Generacion de acciones motoras continuas a partir de observaciones visuales multimodales (multi-vista), estado del robot y, opcionalmente, instrucciones en lenguaje natural.
- Soporte para imitacion de demostraciones humanas mediante entrenamiento con datos de LeRobot.
- Objetivo de flow matching para producir acciones suaves, ideal para control de manipuladores en tiempo real.
- Fine-tuning: el modelo esta disenado como base para adaptarse a tareas de robotica especificas, como pick-and-place, ensamblaje o manipulacion de objetos.
- Capacidades de transferencia: puede ajustarse con datasets de distintos entornos y robots.
- Integracion con el ecosistema LeRobot, incluyendo scripts de entrenamiento e inferencia real en robots.
- Procesa instrucciones de lenguaje en ingles.

## Casos de uso

- Control de brazos roboticos en manipulacion: el modelo genera acciones continuas a partir de imagenes de camaras de bajo coste y el estado articular. Es adecuado porque su tamano reducido permite ejecutarlo en un PC con GPU de consumo conectado directamente al robot.
- Imitacion de tareas de ensamblaje: se puede entrenar el modelo con demostraciones humanas del ensamblaje de piezas, usando las imagenes de varias vistas para capturar el contexto. Su entrenamiento flow matching facilita movimientos precisos y repetibles.
- Robotica domestica de bajo coste: SmolVLA se ejecuta en hardware asequible, lo que permite montar un robot casero con brazos SO100 y controlarlo con un portatil. El modelo base se ajusta con datos propios de la casa.
- Investigacion en aprendizaje por imitacion: los laboratorios pueden usar el modelo como base para experimentar con nuevas tecnicas de imitation learning, gracias a su codigo abierto y entrenabilidad en una sola GPU.
- Evaluacion de politicas en entornos simulados y reales: con el script `lerobot-record`, se puede desplegar la politica en un robot fisico o simulador para medir su rendimiento en tareas concretas, grabando episodios para analisis.
- Ajuste fino para manipulacion de objetos flexibles o en tareas de alta precision: el modelo base se puede especializar en tareas como doblar tela o manipular cables, proporcionando un punto de partida eficiente en lugar de entrenar desde cero.
- Educacion y divulgacion en robotica: el modelo es util para cursos o talleres donde los estudiantes aprenden a entrenar politicas de robotica sin necesidad de infraestructura costosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README menciona que el modelo iguala el rendimiento de VLA mas grandes, pero no se proporcionan datos cuantitativos concretos.

## Requisitos de hardware

- VRAM estimada para inferencia: con bfloat16, el checkpoint de 450M pesa aproximadamente 0.9 GB; considerando activaciones, imagenes y batch, se necesitan alrededor de 2-4 GB de VRAM.
- Entrenamiento: el README afirma que es entrenable en una sola GPU. Para fine-tuning con batch size 4 y bfloat16, se recomienda una GPU con al menos 16 GB de VRAM (RTX 4080, A10, etc.).
- GPU recomendadas: RTX 3060 12 GB o superior para inferencia; RTX 4090 o A100 para entrenamiento/ajuste fino.
- Despliegue en hardware de consumo: si, cabe en GPUs de gama media (RTX 3060, RTX 4070) y en Macs con Apple Silicon. Tambien puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: LeRobot (libreria), scripts de inferencia como `lerobot-record`, y utilidades de preprocesamiento/postprocesamiento incluidas en la libreria.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han encontrado datos de comparacion directa en la informacion proporcionada. Cabe destacar que SmolVLA es un modelo de 450M parametros, lo que lo hace significativamente mas pequeno que otros VLA populares como OpenVLA (7B), pero no se disponen de resultados de benchmarks que permitan comparar su rendimiento.

## Limitaciones y advertencias

- Licencia no especificada: la informacion de HuggingFace indica "no disponible". Esto implica incertidumbre sobre los permisos de uso comercial, por lo que se recomienda verificar antes de usar en produccion.
- El modelo es un modelo base: requiere fine-tuning con datos de demostracion de la tarea especifica. No funciona directamente como una politica general lista para usar.
- Solo se indica soporte de lenguaje para ingles; no se ha validado soporte multilingue.
- Al ser un modelo de control de robot, las acciones incorrectas pueden causar movimientos inseguros si se despliega sin comprobaciones de seguridad.
- No se han publicado benchmarks: el rendimiento en tareas generales de manipulacion no esta cuantificado.
- Dependencia de datos: el rendimiento del modelo tras el ajuste fino depende en gran medida de la calidad y cantidad de las demostraciones usadas, lo que puede introducir sesgos de las demos.
- Longitud de contexto no disponible: no se sabe como maneja secuencias largas de observaciones.

## Enlaces

- HuggingFace: https://huggingface.co/lerobot/smolvla_base
- Paper (arXiv): https://arxiv.org/abs/2506.01844
- Implementacion de referencia: https://github.com/huggingface/lerobot
- Documentacion de instalacion: https://huggingface.co/docs/lerobot/installation
