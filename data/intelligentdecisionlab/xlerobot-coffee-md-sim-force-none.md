# IntelligentDecisionLab/xlerobot-coffee-md-sim-force-none

## Resumen

El repositorio `xlerobot-coffee-md-sim-force-none` de IntelligentDecisionLab contiene un conjunto de doce políticas robóticas entrenadas con la arquitectura ACT (Action Chunking with Transformers) para la automatización de una máquina de café en un entorno de simulación. Forma parte de una reorganización taxonómica experimental (v2) que busca hacer explícitos todos los ejes de variación de los experimentos: arquitectura, número de cámaras, plataforma robótica, fuente de datos de fuerza y pasos de entrenamiento. El nombre `force-none` indica que ni los datos ni el modelo utilizan información de fuerza; solo visión y posición.

El modelo está desarrollado sobre la plataforma XLeRobot, un robot móvil de doble brazo de bajo coste, y se distribuye bajo la librería `lerobot`. Cada "hoja" (leaf) del repositorio corresponde a una combinación específica de tarea (colocar taza, pulsar botón, mover taza a bandeja, etc.), plataforma (XLeRobot de 17 grados de libertad o SO-101 de 6 grados de libertad) y configuración de entrenamiento (100k pasos). El repositorio es una copia de un modelo previo (`xlerobot-coffee-model-sim-a-vision-pos`) bajo una gramática de nombres provisional que aún no ha sido ratificada por un humano, por lo que los nombres de las hojas pueden cambiar en el futuro.

La relevancia de este modelo radica en su enfoque metodológico: propone una nomenclatura estricta y sin valores implícitos para facilitar la reproducibilidad y comparación de experimentos en robótica. Sin embargo, al ser un modelo de simulación y con una taxonomía aún no consolidada, debe tratarse con cautela para uso en producción o investigación formal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, es un modelo de politica robotica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control motor, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (segun tags del repositorio) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura ACT (Action Chunking with Transformers), un metodo de aprendizaje por imitacion que predice secuencias de acciones (chunks) a partir de observaciones visuales y del estado del robot. En este caso, cada politica procesa una unica camara (1cam) y controla la posicion del efector final sin informacion de fuerza. El entrenamiento se realizo sobre datos de simulacion, con 100.000 pasos de entrenamiento por hoja. No se menciona el uso de RLHF ni DPO; es un entrenamiento supervisado clasico de imitacion.

La gramatica de nombres del repositorio codifica la version de la perdida de grados de libertad activos: `act` corresponde a la v1, `act_v2` a la v2 y `act_v3` a la v3. Este repositorio usa `act` (v1). No se proporcionan detalles sobre el dataset de entrenamiento (numero de episodios, composicion, etc.) mas alla de que es simulacion y que existe un subconjunto `s567` (exitos 5+6+7) y `redcup`, entre otros.

## Capacidades

- Control de manipulacion robotica en simulacion: colocar una taza, pulsar un boton, mover una taza a una bandeja y mover una bandeja a una mesa.
- Prediccion de secuencias de acciones (action chunking) con una ventana de 100 pasos de accion (segun la configuracion de evaluacion mencionada en el model card).
- Integracion con la libreria `lerobot` y la plataforma XLeRobot (17-DoF) y SO-101 (6-DoF).
- No incluye capacidades de lenguaje, vision generalista, tool calling ni razonamiento simbolico.

## Casos de uso

- Automatizacion de una maquina de cafe en entornos simulados: el modelo puede ejecutar la secuencia completa de preparacion de cafe (colocar taza, pulsar boton, mover taza a bandeja, etc.) en un entorno virtual, util para validar algoritmos de control antes de transferirlos a un robot fisico.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar el efecto de la nomenclatura de experimentos, la variacion de arquitectura (ACT v1 vs v2 vs v3) o la inclusion de datos de fuerza en el rendimiento de politicas roboticas.
- Evaluacion de politicas en simulacion: al estar disponible en HuggingFace con pesos safetensors, permite reproducir experimentos y comparar metricas de exito entre diferentes configuraciones (plataforma, tarea, pasos de entrenamiento).
- Desarrollo de robots de bajo coste: la integracion con XLeRobot (un robot de bajo coste) permite probar politicas en hardware simulado antes de desplegarlas en el robot real, reduciendo riesgos y costes.
- Benchmarking de metodos de control: las doce hojas cubren un espacio de tareas y plataformas que puede usarse como banco de pruebas para nuevos algoritmos de manipulacion.
- Educacion en robotica: el repositorio documenta una taxonomia clara y reproducible, util para ensenar buenas practicas en la organizacion de experimentos de aprendizaje por refuerzo e imitacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card no incluye metricas de exito, tasas de acierto ni comparaciones con otros modelos.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU en la informacion proporcionada.
- El tamano del repositorio es de 12.4 GB, lo que sugiere que los pesos de las doce hojas ocupan un espacio considerable, pero no se indica cuantos parametros tiene cada politica.
- Dado que es un modelo de robotica con una unica camara, es probable que pueda ejecutarse en una GPU de gama media (por ejemplo, RTX 3060 o superior) para inferencia en tiempo real, pero esto es una estimacion no confirmada.
- Para despliegue, se puede usar la libreria `lerobot` con `ACTPolicy.from_pretrained` (como se muestra en el model card) o descargar los pesos con `snapshot_download` y cargarlos localmente.
- No se mencionan opciones de despliegue como vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (politicas roboticas ACT para automatizacion de cafe). El repositorio original `xlerobot-coffee-model-sim-a-vision-pos` es la fuente de la que se copiaron las hojas, pero no se ofrecen datos de rendimiento comparativo. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente en simulacion; no se ha validado en un robot fisico, por lo que su transferencia al mundo real puede fallar debido al gap de simulacion a realidad.
- La gramatica de nombres es provisional y no ha sido ratificada por un humano. Los nombres de las hojas y las rutas pueden cambiar, lo que podria romper scripts o citas que dependan de ellas.
- No se especifica la licencia, lo que impide conocer si el uso comercial esta permitido. Se recomienda contactar con los autores antes de cualquier uso productivo.
- No hay informacion sobre sesgos, alucinaciones o limitaciones de contexto, ya que no es un modelo de lenguaje.
- El repositorio es una copia de otro modelo; los autores advierten que los repositorios legados siguen siendo autoritativos y que este es un experimento de nomenclatura.
- No se proporcionan datos de rendimiento (exito, precision, latencia), por lo que no es posible evaluar su calidad objetiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/IntelligentDecisionLab/xlerobot-coffee-md-sim-force-none
- Repositorio original (fuente de las hojas): https://huggingface.co/IntelligentDecisionLab/xlerobot-coffee-model-sim-a-vision-pos
- Documentacion de XLeRobot: https://xlerobot.readthedocs.io/en/latest/
- GitHub de XLeRobot: https://github.com/Vector-Wangel/XLeRobot
- GitHub de xlerobot (adaptacion): https://github.com/OneRobotAI/xlerobot
