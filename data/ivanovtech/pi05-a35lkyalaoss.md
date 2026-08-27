# ivanovtech/pi05-a35LKYALAosS

## Resumen

El modelo `ivanovtech/pi05-a35LKYALAosS` es un checkpoint completo de π0.5 (Pi0.5), un modelo de visión-lenguaje-acción (VLA) desarrollado originalmente por Physical Intelligence, adaptado y entrenado por el autor `ivanovtech` para su uso en la subnet 80 de OpenRoboto, un sistema de evaluación descentralizada de políticas robóticas. Este checkpoint concreto, denominado "OpenRoboto Gate 5t epoch 2", se presenta como un candidato para la ronda 1 de dicha subnet, con un entrenamiento basado en ensayo correctivo supervisado sobre la tarea 6 del benchmark LIBERO, junto con estrategias de retención para la tarea 1 y un banco de retención amplio.

Con 3.616.757.520 parámetros (aproximadamente 3,6 mil millones), el modelo es un VLA denso que combina percepción visual, comprensión del lenguaje natural y generación de acciones de bajo nivel para control robótico. Su relevancia radica en que aborda el problema de la generalización en tareas de manipulación de largo horizonte en entornos no vistos, un desafío central en robótica. La evaluación local incluida en la model card muestra mejoras significativas en la tarea objetivo (task-6) en comparación con el modelo padre, aunque con una ligera regresión en la retención de la tarea 1. El modelo se distribuye en formato safetensors con un tamaño de repositorio de 7,2 GB, e incluye las estadísticas de normalización necesarias para el evaluador LIBERO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) π0.5, basada en transformer (detalles internos no disponibles) |
| Parametros totales | 3.616.757.520 (3,6 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors sin cuantizacion) |
| Idiomas soportados | No disponible (probablemente ingles, no especificado) |
| Licencia | No disponible |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

π0.5 es un modelo VLA desarrollado por Physical Intelligence, diseñado para controlar robots mediante la combinacion de observaciones visuales, instrucciones en lenguaje natural y generacion de acciones de bajo nivel. La arquitectura interna (numero de capas, tipo de atencion, etc.) no se detalla en la informacion proporcionada, pero se sabe que es un modelo denso de 3,6 B parametros. El checkpoint concreto ha sido entrenado mediante un metodo de "ensayo correctivo supervisado" (supervised corrective rehearsal) para la tarea 6 del benchmark LIBERO, combinado con un "replay de retencion de la tarea 1 con distribucion emparejada" y un "banco de retencion amplio" para preservar el conocimiento previo. El modelo padre es `0xjulius/pi05-LZC4rWJGrdCn` en su revision `b2da1b725ed89d38a4e19b9df14f79fde9f2217e`. No se especifican los datos de entrenamiento (numero de tokens, composicion del dataset) ni si se utilizaron tecnicas como RLHF o DPO.

## Capacidades

- Control robotico de bajo nivel: genera acciones de posicion, orientacion y otras variables de control para manipuladores roboticos a partir de entradas visuales y textuales.
- Ejecucion de tareas de largo horizonte: puede realizar secuencias complejas de manipulacion, como limpiar o recoger objetos, segun la descripcion general de π0.5.
- Generalizacion a entornos nuevos: entrenado con datos de multiples robots y fuentes web, muestra capacidad de adaptacion a escenarios no vistos.
- Integracion con el benchmark LIBERO: incluye las estadisticas de normalizacion (`norm_stats.json`) necesarias para el evaluador oficial.
- Compatibilidad con OpenRoboto: preparado para ser evaluado en la subnet 80 de OpenRoboto, con soporte para la herramienta `openroboto check` y el evaluador publico `check_model.py`.
- No se mencionan capacidades de tool calling, agentes conversacionales ni procesamiento de audio o video fuera del contexto robotico.

## Casos de uso

- Evaluacion de politicas roboticas en benchmarks: el modelo puede ser utilizado como candidato en la subnet OpenRoboto para medir su rendimiento en tareas estandarizadas de LIBERO, como las tareas 1 y 6, proporcionando una metrica objetiva de su capacidad de generalizacion.
- Entrenamiento de robots manipuladores en simulacion: gracias a su integracion con OpenPI y LeRobot, puede desplegarse en entornos simulados (por ejemplo, MuJoCo o Isaac Sim) para validar politicas antes de transferirlas a hardware real.
- Investigacion en aprendizaje por demostracion: el checkpoint sirve como punto de partida para experimentos de fine-tuning o aprendizaje continuo, dado que su entrenamiento incluyo tecnicas de retencion de tareas que pueden estudiarse en profundidad.
- Desarrollo de sistemas de automatizacion industrial: su capacidad de combinar vision, lenguaje y accion permite implementar celdas roboticas que interpretan ordenes en lenguaje natural y ejecutan tareas de manipulacion en entornos controlados.
- Pruebas de generalizacion en mundo abierto: al ser un VLA entrenado con datos diversos, puede evaluarse en escenarios no vistos para determinar su robustez frente a cambios en la iluminacion, disposicion de objetos o instrucciones.
- Comparacion de metodos de entrenamiento: el modelo incluye una evaluacion local detallada (tabla con parent y candidate) que puede utilizarse como referencia para comparar estrategias de ensayo correctivo y retencion en otros checkpoints.

## Benchmarks y rendimiento

La model card proporciona una evaluacion local (no oficial) con los siguientes resultados:

| Gate | Parent | Candidate |
|---|---:|---:|
| task-6 terminal success | 0/15 | 10/15 |
| task-6 correct object choice | 0/15 | 14/15 |
| task-1 terminal success | 14/15 | 12/15 |
| broad retention | 24/24 | 23/24 |

Ademas, se menciona un diagnostico aleatorio de ocho pares que empato 6/8 a 6/8, sin victorias ni regresiones emparejadas. Estos datos no estiman la puntuacion oficial del benchmark completo, que aun no se ha ejecutado. No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, ya que el modelo esta orientado a tareas roboticas y no a procesamiento de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,6 B parametros, en precision fp16 se requieren aproximadamente 7,2 GB de VRAM solo para los pesos, mas memoria para activaciones y estados intermedios. Se estima un minimo de 10-12 GB de VRAM para inferencia basica.
- GPU recomendadas: tarjetas con al menos 12 GB de VRAM, como NVIDIA RTX 3060/4070, o GPUs de datacenter como A100 (40/80 GB) o H100 para despliegues mas grandes. No se especifican requisitos oficiales.
- Compatibilidad con GPU de consumo: si, es posible ejecutar el modelo en GPUs de consumo con 12 GB o mas, aunque la latencia dependera de la optimizacion.
- Opciones de despliegue: el modelo esta pensado para usarse con OpenPI (implementacion en JAX) y LeRobot (PyTorch). Tambien puede cargarse con librerias estandar de transformers si se adapta, aunque no se menciona soporte para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la informacion proporcionada. Sin embargo, π0.5 es una evolucion del modelo π0 de Physical Intelligence, y existen otros modelos VLA como OpenVLA (7B parametros) o RT-2 (de Google). No se pueden ofrecer comparaciones numericas fiables sin datos oficiales. Se recomienda consultar la documentacion de Physical Intelligence y los repositorios de OpenPI para obtener referencias.

## Limitaciones y advertencias

- La evaluacion local muestra que el candidato no alcanza el umbral de retencion de la tarea 1 (12/15 frente a 14/15 del padre), lo que indica una posible regresion en tareas previamente aprendidas.
- El modelo no ha sido evaluado en el benchmark oficial completo de OpenRoboto, por lo que su rendimiento real en condiciones estandarizadas es desconocido.
- La licencia no esta especificada, lo que genera incertidumbre sobre el uso comercial y la redistribucion.
- Al ser un checkpoint de investigacion, no esta optimizado para produccion; puede presentar comportamientos impredecibles en entornos no controlados.
- No se documentan sesgos especificos, pero al entrenarse con datos de demostracion robotica, podria heredar sesgos de los entornos y tareas representados en los datos.
- El riesgo de alucinacion se manifiesta como generacion de acciones incorrectas o invalidas, especialmente en escenarios fuera de la distribucion de entrenamiento.
- La informacion sobre idiomas soportados no esta disponible; se asume que las instrucciones en lenguaje natural estan en ingles, pero no se confirma.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ivanovtech/pi05-a35LKYALAosS
- Repositorio OpenPI (implementacion de referencia): https://github.com/jorgemunozl/openpi_subtask_generation
- Model card de otro checkpoint π0.5 (referencia): https://huggingface.co/home1017/my_pi05_model
- Documentacion de π0.5 (via Scribd): https://www.scribd.com/document/885305547/pi05
