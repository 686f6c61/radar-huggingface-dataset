# mlnha/gr00t-n15-pnp108-rabc_robometer_10k

## Resumen

GR00T N1.5 es un modelo de politica robotica (vision-language-action, VLA) desarrollado originalmente por NVIDIA Research para control de robots manipuladores a partir de instrucciones en lenguaje natural e imagenes. Este repositorio concreto, `mlnha/gr00t-n15-pnp108-rabc_robometer_10k`, no es el modelo base sino un conjunto de checkpoints de investigacion obtenidos al hacer fine-tuning de GR00T N1.5 sobre rollouts de la tarea PickPlaceCounterToCabinet del simulador RoboCasa365, dentro de un estudio sobre el uso de estimadores de progreso de tarea como senal de entrenamiento para behavior cloning (BC).

El metodo aplicado es RA-BC (Reward-Advantage Behavior Cloning, presumiblemente) ponderado por las puntuaciones de un estimador de progreso llamado Robometer-4B. El punto de partida es el checkpoint de preentrenamiento de RoboCasa (80.000 pasos) y los datos de entrenamiento son 108 rollouts generados por un checkpoint intermedio de GR00T (120.000 pasos), de los cuales 72 fueron exitosos. El resultado son cinco checkpoints (2k, 4k, 6k, 8k y 10k pasos) evaluados en simulacion con tasas de exito entre el 56 % y el 68 % sobre 50 episodios.

Es relevante ahora porque documenta de forma reproducible (semilla 42, hiperparametros explicitos, logs de TensorBoard) una linea de investigacion activa: sustituir recompensas humanas o etiquetas binarias de exito por estimadores de progreso aprendidos para mejorar el entrenamiento de politicas roboticas con datos escasos. El repositorio ocupa 37,9 GB y no incluye estados del optimizador, por lo que esta pensado para evaluacion e inferencia, no para reanudar el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en GR00T N1.5 (transformer multimodal; detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (tag del repositorio); checkpoints de entrenamiento con logs TensorBoard |
| Libreria | `gr00t` |
| Tamano del repositorio | 37,9 GB |
| Tarea | PickPlaceCounterToCabinet (RoboCasa365) |
| Embodiment | `new_embodiment` |
| Formato de datos de entrenamiento | LeRobot v2.1 |
| Checkpoints incluidos | 2000, 4000, 6000, 8000, 10000 pasos |

## Arquitectura y entrenamiento

El modelo parte de GR00T N1.5, un modelo VLA de NVIDIA que combina un codificador visual, un modelo de lenguaje y un cabezal de acciones para generar comandos motores a partir de observaciones e instrucciones. La informacion disponible no detalla la configuracion interna (numero de capas, dimension oculta, tamano del encoder visual ni del LLM subyacente), por lo que esos datos se marcan como no disponibles. El fine-tuning se realiza sobre el checkpoint de preentrenamiento de RoboCasa365 (80.000 pasos), adaptando el modelo a la tarea concreta de recoger un objeto de la encimera y colocarlo en el armario.

El entrenamiento usa 108 rollouts generados por un checkpoint de GR00T de 120.000 pasos sobre la misma tarea, de los cuales 72 son exitosos. La innovacion metodologica es el uso de RA-BC con ponderacion por Robometer-4B: en lugar de tratar todos los episodios (o solo los exitosos) por igual, se pondera cada transicion o episodio segun la estimacion de progreso de un modelo auxiliar de 4.000 millones de parametros. Los hiperparametros son: una GPU, batch de 64, learning rate 3e-5 con schedule coseno y warmup del 5 %, semilla 42 y embodiment `new_embodiment`. Se conservan `train.log` y `runs/` (TensorBoard) pero no los estados del optimizador.

## Capacidades

- Generacion de acciones roboticas para manipulacion de objetos a partir de observaciones visuales e instrucciones de tarea.
- Ejecucion de la tarea PickPlaceCounterToCabinet en el simulador RoboCasa365 (recoger de encimera y colocar en armario).
- Behavior cloning condicionado por pesos de progreso aprendidos (RA-BC + Robometer-4B), lo que permite aprovechar rollouts parcialmente exitosos.
- Adaptacion a un embodiment nuevo (`new_embodiment`) mediante fine-tuning.
- Evaluacion reproducible en simulacion con semillas fijas (escenas desde 2000, politica con semilla 1).
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni modo thinking; se trata de un checkpoint de politica robotica, no de un asistente conversacional.

## Casos de uso

- Investigacion en behavior cloning con senales de progreso: el repositorio sirve como referencia reproducible para comparar RA-BC ponderado por Robometer-4B frente a BC estandar en una tarea de manipulacion concreta, gracias a los logs de TensorBoard y a los cinco checkpoints intermedios.
- Evaluacion de estimadores de progreso: permite medir si la ponderacion por Robometer-4B mejora la tasa de exito frente a entrenar solo con los 72 episodios exitosos, usando el protocolo de evaluacion documentado (50 semillas).
- Baseline para nuevas tecnicas de filtrado o reponderacion de datos: al partir de un dataset pequeno (108 rollouts) y un protocolo fijo, es un punto de comparacion barato para experimentos con otras funciones de recompensa o estimadores.
- Estudio de la relacion entre pasos de entrenamiento y rendimiento: los checkpoints 2k-10k permiten trazar curvas de exito (56 %, 68 %, 56 %, 62 %, 60 %) y detectar sobreajuste o mesetas.
- Pruebas de robustez en simulacion: las escenas con semillas 2000+ permiten evaluar varianza entre episodios y analizar los 46/76 exitos del checkpoint final en el conjunto completo.
- Punto de partida para fine-tuning en tareas cercanas: al estar adaptado a RoboCasa365 y a un embodiment nuevo, puede servir como inicializacion para variantes de la misma familia de tareas de pick-and-place.

## Benchmarks y rendimiento

Resultados de exito en simulacion RoboCasa365 (escenas con semilla 2000+, politica con semilla 1, exito = tarea completada al final del episodio):

| Checkpoint | Exitos / episodios | Tasa de exito |
|---|---|---|
| checkpoint-2000 | 28/50 (semillas 2000-2049) | 56 % |
| checkpoint-4000 | 34/50 (semillas 2000-2049) | 68 % |
| checkpoint-6000 | 28/50 (semillas 2000-2049) | 56 % |
| checkpoint-8000 | 31/50 (semillas 2000-2049) | 62 % |
| checkpoint-10000 | 30/50 (semillas 2000-2049) | 60 % |
| checkpoint-10000 (conjunto completo) | 46/76 | 60,5 % |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) ni comparaciones numericas con modelos alternativos.

## Requisitos de hardware

- Entrenamiento documentado: 1 GPU con batch de 64; el modelo base GR00T N1.5 y el repositorio de 37,9 GB sugieren GPUs de datacenter (A100/H100) para entrenamiento, aunque la VRAM exacta no esta disponible.
- Inferencia: no se especifica VRAM estimada; al ser un VLA con componente de lenguaje, es previsible que requiera al menos una GPU con memoria suficiente para el modelo completo (no se documentan cuantizaciones).
- GPU de consumo: no confirmado; no hay informacion sobre si cabe en RTX 4090 u otras GPU consumer.
- Despliegue: la libreria indicada es `gr00t`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de politica robotica en este formato).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mlnha/gr00t-n15-pnp108-rabc_robometer_10k | no disponible | no disponible | PickPlaceCounterToCabinet (RoboCasa365) | no disponible | Hugging Face, 37,9 GB |
| GR00T N1.5 (base, RoboCasa365 pretraining-80000) | no disponible | no disponible | Politica VLA general para RoboCasa | no disponible en esta informacion | Referenciado como punto de partida (`robocasa/robocasa365_checkpoints`) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Es un checkpoint de investigacion, no un modelo listo para produccion; el autor lo etiqueta explicitamente como tal.
- No incluye estados del optimizador, por lo que no se puede reanudar el entrenamiento de forma exacta.
- Entrenado con solo 108 rollouts de una unica tarea (PickPlaceCounterToCabinet); la generalizacion a otras tareas o entornos no esta demostrada.
- Evaluacion exclusivamente en simulacion (RoboCasa365); el rendimiento en robot real no esta documentado.
- Tasa de exito modesta (56-68 %) y no monotona con los pasos de entrenamiento, lo que sugiere alta varianza y posible inestabilidad.
- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor.
- Idiomas no declarados; al ser un modelo de politica condicionado por instrucciones, el soporte linguistico depende del modelo base y no esta documentado aqui.
- Riesgo de sobreajuste al conjunto de escenas y al embodiment `new_embodiment` empleados.
- No hay informacion sobre sesgos, alucinacion en el sentido linguistico ni comportamiento fuera de distribucion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlnha/gr00t-n15-pnp108-rabc_robometer_10k
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
