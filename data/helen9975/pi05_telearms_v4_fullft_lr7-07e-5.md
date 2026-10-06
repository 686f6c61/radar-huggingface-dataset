# helen9975/pi05_telearms_v4_fullft_lr7.07e-5

## Resumen

`helen9975/pi05_telearms_v4_fullft_lr7.07e-5` es un ajuste fino completo del modelo π₀.₅ (`lerobot/pi05_base`), un modelo de vision-lenguaje-accion (VLA) desarrollado por Physical Intelligence y adaptado para LeRobot. Sobre ese punto de partida, el autor (helen9975) ha entrenado una politica de robotica especializada en manipulacion bimanual sobre el conjunto `mliu48/telearms-yam-cube-v4`, compuesto por 53.832 demostraciones bimanuales de brazos YAM repartidas en 48 tareas, grabadas a 30 Hz con tres camaras de 224×224.

El resultado es un modelo denso de 4.143.404.816 parametros (aproximadamente 4,14 mil millones) que se publica en formato safetensors bajo la libreria `lerobot`, con un tamano de repositorio de 9,4 GB. El ajuste fino afecto a los tres componentes del modelo original (el modelo de lenguaje, el codificador de vision y el experto de accion), y se documento como entrenamiento full fine-tune en bf16 con gradient checkpointing.

La relevancia de esta ficha radica en que no es un modelo de lenguaje generalista, sino una politica de control robotico lista para desplegarse o reentrenarse en tareas concretas de manipulacion bimanual. Su publicacion permite reutilizar el coste de entrenamiento (16 GPU H100 durante 99.486 pasos) para transferir la politica a configuraciones YAM similares o continuar el ajuste con datos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅, con componentes de LLM, vision y experto de accion; generacion de acciones por flow matching (segun las fuentes de openpi) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo se publica en bf16; no se documentan variantes GGUF, INT8 ni otras) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en π₀.₅, la evolucion de π₀ publicada por Physical Intelligence dentro del repositorio openpi. Se trata de una arquitectura VLA de tipo flow-based, es decir, un modelo de vision-lenguaje al que se acopla un experto de accion que genera secuencias de acciones mediante flow matching en lugar de decodificacion autoregresiva de tokens de accion. El ajuste realizado sobre esta base actualiza conjuntamente el modelo de lenguaje, el codificador de vision y el experto de accion, por lo que no se trata de un simple adaptador LoRA sino de un fine-tune completo.

El entrenamiento se hizo sobre `mliu48/telearms-yam-cube-v4`: 53.832 demostraciones bimanuales con brazos YAM, 48 tareas, frecuencia de captura de 30 Hz y tres camaras a 224×224. Se ejecuto en 16 GPU H100 repartidas en dos nodos (2 × 8), con un batch de 16 por GPU (batch global de 256) durante 99.486 pasos, que corresponden a una epoca sobre el conjunto seleccionado. La tasa de aprendizaje alcanzo un pico de 7,07e-5 con decaimiento coseno hasta 7,07e-6 y 1.000 pasos de calentamiento. El entrenamiento se hizo en bf16 con gradient checkpointing. Un detalle tecnico relevante es que se emplearon acciones relativas, salvo en las pinzas, que se representan en valores absolutos. La receta de entrenamiento usa LeRobot 0.6.1 fijado en el commit `e40b58a8`, junto con un parche propio del repositorio (`tools/install_lerobot_patch.py`), y el script `training/train_pi.py`.

## Capacidades

- Generacion de trayectorias de accion bimanual: produce comandos de control para dos brazos YAM coordinados, a partir de observaciones visuales y de instrucciones de tarea.
- Percepcion visual multivista: consume tres camaras de 224×224 simultaneamente, lo que permite razonar sobre la escena desde varios puntos de vista.
- Ejecucion de tareas de manipulacion en el mundo real: entrenado especificamente para tareas de manipulacion con cubos y objetos sobre el conjunto `telearms-yam-cube-v4`.
- Generalizacion a tareas dentro del dominio de entrenamiento: al cubrir 48 tareas distintas y 53.832 demostraciones, esta preparado para variaciones dentro de ese conjunto.
- Acciones relativas con pinzas absolutas: la representacion de accion relativa favorece la transferibilidad de posiciones, mientras que las pinzas se controlan de forma absoluta.
- Reentrenamiento y continuacion del ajuste: al publicarse el checkpoint completo, sirve como punto de partida para fine-tuning posterior en LeRobot.
- Soporte de tool calling / function calling: no aplica (es un modelo de robotica, no un asistente conversacional).
- Capacidades multilingues: no disponibles (no se documenta procesamiento de lenguaje natural multilingue).
- Modo de razonamiento explicito: no disponible.

## Casos de uso

- Manipulacion bimanual de cubos: el modelo esta entrenado especificamente sobre el conjunto `telearms-yam-cube-v4`, por lo que puede desplegarse directamente para tareas de apilar, coger y colocar cubos con dos brazos YAM coordinados.
- Automatizacion de celdas pick-and-place bimanuales: en un entorno de produccion o laboratorio, la politica genera trayectorias de accion que pueden enviarse a los controladores de los brazos YAM para mover objetos entre ubicaciones de forma repetible.
- Investigacion en modelos VLA: sirve como referencia reproducible para estudiar flow matching aplicado a acciones, comparar el ajuste completo frente a adaptadores LoRA y medir la transferencia desde π₀.₅ base a un dominio concreto.
- Fine-tuning con datos propios de robotica: al ser un checkpoint completo y no un adaptador, puede continuar entrenandose con demostraciones adicionales del mismo hardware o de configuraciones similares, reutilizando la receta de LeRobot documentada.
- Benchmarking de politicas de manipulacion: permite construir una linea base cuantitativa sobre las 48 tareas del conjunto para comparar futuras variantes de politica, cambios de camara o de frecuencia de control.
- Robotica educativa y de laboratorio con brazos YAM: el modelo ofrece una politica preentrenada para practicas de manipulacion bimanual sin necesidad de entrenar desde cero, siempre que el montaje coincida con la configuracion de tres camaras a 224×224.
- Desarrollo dentro del ecosistema LeRobot: al estar publicado en ese formato y libreria, se integra en los flujos de evaluacion y despliegue de LeRobot, lo que facilita pruebas de inferencia sobre hardware compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8,3 GB solo para los pesos (4,14 mil millones de parametros a 16 bits). Con activaciones, buffers de tres camaras a 224×224 y margen de ejecucion, lo razonable es reservar entre 12 y 16 GB.
- VRAM estimada en precision completa (fp32): alrededor de 16,6 GB solo para los pesos, lo que eleva el requisito total por encima de los 20 GB.
- GPU recomendadas: H100 o A100 para despliegue en produccion con margen amplio; RTX 4090 (24 GB) para una unica inferencia; RTX 3090 (24 GB) como alternativa de gama alta de consumo.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas de VRAM, como RTX 3090, RTX 4090 o RTX 5090. En GPU con 16 GB el margen es muy ajustado y puede requerir cuantizacion o reduccion de resolucion de camara, algo que no esta documentado por el autor.
- Opciones de despliegue: LeRobot (libreria de publicacion del modelo) con el parche incluido en el repositorio del autor; tambien es compatible con los flujos de openpi para modelos π₀.₅. No se documentan integraciones con vLLM, TGI, llama.cpp u Ollama, que estan orientados a modelos de lenguaje y no a politicas de accion.
- Latencia y throughput estimados: no disponibles. Como referencia del dominio, los datos de demostracion se capturaron a 30 Hz, frecuencia habitual de control para este tipo de politicas, pero no se publican cifras de latencia del modelo en inferencia.
- Coste de entrenamiento documentado: 16 GPU H100 distribuidas en dos nodos (2 × 8) durante 99.486 pasos, con batch global de 256, lo que da una idea del presupuesto necesario para reproducir el ajuste completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05_telearms_v4_fullft_lr7.07e-5 (este modelo) | 4,14 mil millones | no disponible | VLA flow-based ajustado a manipulacion bimanual YAM | no disponible | Hugging Face, libreria lerobot |
| `lerobot/pi05_base` (π₀.₅) | no disponible | no disponible | VLA flow-based de proposito general | no disponible | Hugging Face y openpi |
| π₀ (`lerobot/pi0_base`) | no disponible | no disponible | VLA flow-based anterior a π₀.₅ | no disponible | Hugging Face y openpi |
| π₀-FAST | no disponible | no disponible | VLA autoregresivo basado en tokenizador de acciones FAST | no disponible | openpi |

Nota: los datos de parametros, contexto y licencia de los modelos comparables no aparecen en la informacion proporcionada, por lo que se marcan como no disponibles para no inventar cifras.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta ajustado al conjunto `telearms-yam-cube-v4`, con 48 tareas y un montaje concreto de tres camaras a 224×224. Fuera de ese dominio o de una configuracion de hardware equivalente, el rendimiento esperado cae drasticamente.
- Dependencia del montaje: la politica asume brazos bimanuales YAM y una disposicion de camaras concreta. Cambios en la colocation de sensores o en la cinematica del robot pueden invalidar el comportamiento aprendido.
- Representacion de acciones restringida: usa acciones relativas con pinzas absolutas, una decision de diseno que limita su uso directo en robots con otro esquema de control sin reentrenamiento.
- Licencia no disponible: al no declararse licencia, no se puede asumir permiso para uso comercial. Se recomienda contactar con el autor antes de cualquier despliegue en produccion.
- Riesgo de sobreajuste al conjunto de entrenamiento: al tratarse de una epoca completa sobre datos seleccionados, la generalizacion a escenas nuevas, iluminacion distinta o objetos no vistos no esta garantizada ni documentada.
- Ausencia de benchmarks publicados: no hay resultados de evaluacion en la informacion disponible, por lo que no se puede comparar su rendimiento con otras politicas de forma objetiva.
- Riesgo de fallo en ejecucion fisica: como toda politica de manipulacion, un error de prediccion puede traducirse en colisiones, caidas de objetos o danos al entorno. Es imprescindible desplegarla con limites de seguridad, parada de emergencia y validacion previa en simulacion.
- Idiomas y lenguaje natural: no se documenta el soporte multilingue ni la robustez frente a instrucciones de texto, ya que el foco es el control visomotor.
- Repositorio con cero descargas y cero likes en el momento de la ficha: no existe validacion por parte de la comunidad, lo que refuerza la necesidad de evaluar el modelo por cuenta propia antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/helen9975/pi05_telearms_v4_fullft_lr7.07e-5
- Modelo base π₀.₅ en LeRobot: https://huggingface.co/lerobot/pi05_base
- Repositorio del autor (rama PI05_training, script training/train_pi.py): https://huggingface.co/helen9975/RoboEval-telearms
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/mliu48/telearms-yam-cube-v4
- Repositorio openpi de Physical Intelligence: https://github.com/Physical-Intelligence/openpi
- Documentacion de openpi en DeepWiki: https://deepwiki.com/Physical-Intelligence/openpi
- Guia de inicio de openpi en DeepWiki: https://deepwiki.com/Physical-Intelligence/openpi/2-getting-started
- Ejemplo de model card de π₀.₅ en LeRobot: https://huggingface.co/jellyho/pi05
- Otro ejemplo de model card de π₀.₅ en LeRobot: https://huggingface.co/home1017/my_pi05_model
