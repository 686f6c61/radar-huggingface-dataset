# phawitbinabik/act_T1_1B1O_FF_N30_aug60

## Resumen

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion (imitation learning) que predice fragmentos cortos de acciones (chunks) en lugar de pasos individuales. El modelo `phawitbinabik/act_T1_1B1O_FF_N30_aug60` es una politica ACT entrenada y publicada con LeRobot, la libreria de Hugging Face para robotica, y esta pensada para controlar brazos roboticos a partir de observaciones visuales y de estado propioceptivo. Su repositorio declara el pipeline `robotics` y depende del dataset `phawitbinabik/T1_1B1O_FF_N30_aug60`.

A diferencia de los modelos de lenguaje, no es un modelo generativo de texto: no tiene tokenizador, ni capacidades multilingues, ni tool calling. Es una politica de control de ~51,7 millones de parametros que asigna observaciones a acciones motoras. El tamano reducido (repo de 0,2 GB) la hace apta para inferencia en hardware de consumo, incluso en CPU o Apple Silicon, lo que encaja con el objetivo de ACT de abaratar el control robotico fino.

Es relevante ahora porque forma parte del ecosistema LeRobot, que estandariza el entrenamiento, publicacion y evaluacion de politicas roboticas en Hugging Face. La licencia Apache 2.0 permite uso comercial y modificacion. No obstante, se trata de un checkpoint muy especifico de una tarea concreta, con cero descargas y cero likes en el momento de la consulta, y sin resultados de evaluacion publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con componente latente tipo VAE (metodo ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (horizonte de accion / chunk size no especificado en la informacion) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no aplica (modelo de control robotico, no linguistico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | phawitbinabik/T1_1B1O_FF_N30_aug60 |
| Tamano del repositorio | 0,2 GB |
| Autor | phawitbinabik |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-11 |

## Arquitectura y entrenamiento

El modelo implementa ACT, presentado en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). ACT es un transformer encoder-decoder condicionado por observaciones (imagenes de camara y, segun la configuracion, posiciones articulares) que predice un chunk de acciones futuras en lugar de un unico paso. El metodo incorpora una variable latente de estilo VAE para modelar la variabilidad de las demostraciones y se entrena con aprendizaje por imitacion a partir de datos de teleoperacion, con una perdida de reconstruccion sobre las acciones y regularizacion sobre el espacio latente. En inferencia se suele aplicar ensamblado temporal para suavizar las predicciones entre chunks.

En este caso concreto, el entrenamiento se ha realizado con LeRobot segun el flujo documentado por el autor (`lerobot-train` con `--policy.type=act` y el dataset indicado). La informacion proporcionada no detalla el numero de tokens, el numero de episodios de demostracion, la composicion exacta del dataset, la resolucion de las camaras ni si se aplicaron tecnicas adicionales como RLHF o DPO (no aplicables de forma estandar en este tipo de politicas). Tampoco se especifica el tamano del chunk de acciones ni la configuracion exacta del encoder visual. Todos esos datos figuran como no disponibles.

## Capacidades

- Control robotico por imitacion: predice secuencias de acciones (chunks) para ejecutar una tarea aprendida a partir de demostraciones teleoperadas.
- Percepcion visual: consume observaciones de camara como entrada, segun la configuracion estandar de ACT en LeRobot.
- Control de brazos tipo SO-100: la documentacion de LeRobot emplea el tipo de robot `so100_follower` en los ejemplos de evaluacion.
- Ejecucion de tareas de manipulacion fina: el paper original de ACT esta orientado a manipulacion diestra y bimanual con hardware de bajo coste.
- Inferencia ligera: con ~51,7 M de parametros, la politica es ejecutable en tiempo casi real en GPU de consumo y viable en CPU.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso en lenguaje natural.
- No tiene capacidades multilingues: no procesa ni genera texto.
- No dispone de modo "thinking", vision-lenguaje ni audio en el sentido de los modelos multimodales generativos; aqui la vision es una entrada de control, no una capacidad de comprension semantica general.

## Casos de uso

- Manipulacion robotica de precision en banco de pruebas: la politica traduce observaciones de camara en chunks de acciones para que un brazo SO-100 ejecute la tarea con la que fue entrenada. Es adecuada por su tamano reducido, que permite ejecucion en tiempo real sin infraestructura pesada.
- Pick-and-place en lineas de montaje ligeras: dado un dataset de demostraciones de recogida y colocacion, el modelo reproduce la secuencia aprendida. Su enfoque de action chunking reduce la acumulacion de error frente a politicas paso a paso.
- Tareas bimanuales de ensamblaje: ACT se diseno originalmente para manipulacion bimanual de precision, por lo que aplica a ensamblajes que requieren coordinacion de dos brazos.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida reproducible para comparar ACT frente a otras politicas implementadas en LeRobot, reentrenando con distintos datasets.
- Fine-tuning con datos propios de un laboratorio o taller: partiendo de este checkpoint (o del pipeline de entrenamiento), se puede adaptar la politica a una tarea especifica recogiendo nuevas demostraciones teleoperadas.
- Robotica educativa y de bajo coste: al caber en GPU de consumo o CPU, permite montar practicas docentes con brazos economicos y un flujo LeRobot completo.
- Automatizacion de tareas repetitivas en laboratorio (manipulacion de muestras, ordenacion de objetos): util cuando la variabilidad del entorno es baja y controlada, que es el regimen donde mejor funciona el aprendizaje por imitacion.
- Evaluacion en robot real: con `lerobot-record` y `--policy.path`, se puede medir la tasa de exito en un numero acotado de episodios (por ejemplo, 10) antes de desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, numero de episodios de evaluacion ni comparaciones cuantitativas. Los resultados de busqueda web proporcionados no contienen datos tecnicos relevantes sobre este modelo (se refieren a productos de conversacion no relacionados). No se deben asumir cifras de exito a partir del paper original de ACT, ya que corresponden a otras configuraciones y datasets.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del numero de parametros (51.668.614): aproximadamente 207 MB en fp32, unos 103 MB en fp16/bf16 y unos 52 MB en int8, sin contar buffers de activaciones ni el preprocesado de imagenes.
- En la practica, el consumo total depende de la resolucion de las camaras, del numero de vistas y del horizonte de accion, datos no disponibles en la informacion proporcionada.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA es suficiente; no se requiere A100 ni H100. Sirven tarjetas de gama media y baja (por ejemplo, serie RTX 30/40, e incluso GPU integradas compatibles).
- Cabe en GPU de consumo: si, con margen amplio, y tambien en CPU y en Apple Silicon mediante MPS.
- Opciones de despliegue: LeRobot para entrenamiento (`lerobot-train`) e inferencia/evaluacion (`lerobot-record` con `--policy.path`). El formato safetensors es compatible con PyTorch. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de frecuencia de control ni de tiempo de inferencia por chunk.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| act_T1_1B1O_FF_N30_aug60 (este modelo) | ACT (transformer encoder-decoder con latente VAE) | 51.668.614 | apache-2.0 | Hugging Face, libreria lerobot |
| ACT (implementacion de referencia, arXiv:2304.13705) | ACT | no disponible en la informacion | no disponible en la informacion | Paper y repositorio del autor original |
| Diffusion Policy | Politica por difusion para control robotico | no disponible en la informacion | no disponible en la informacion | Implementada en el ecosistema LeRobot |
| SmolVLA | Politica vision-lenguaje-accion | no disponible en la informacion | no disponible en la informacion | Implementada en el ecosistema LeRobot |

No se dispone de datos de rendimiento comparado (tasas de exito, tiempos de entrenamiento o inferencia) en la informacion proporcionada, por lo que la comparativa se limita a tipo de arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no mantiene conversaciones, no soporta razonamiento en lenguaje natural ni tool calling. Cualquier expectativa de ese tipo es incorrecta.
- Especializacion extrema: la politica esta entrenada para el dataset `T1_1B1O_FF_N30_aug60` y su tarea asociada. Fuera de ese contexto, el comportamiento no esta garantizado.
- Generalizacion limitada: los metodos de aprendizaje por imitacion suelen degradarse ante cambios de iluminacion, posicion de camara, fondo, posicion inicial del objeto o variaciones del robot.
- Riesgo de sobreajuste al entorno de recogida de datos: si el dataset tiene pocas demostraciones o poca diversidad, la politica puede fallar en condiciones no vistas.
- Dependencia de calibracion: requiere una configuracion consistente de robot y camaras entre entrenamiento e inferencia.
- Sesgos: no se dispone de informacion sobre la composicion demografica, geografica o de escenarios del dataset, por lo que no se pueden evaluar sesgos sistematicos mas alla del propio sesgo de las demostraciones teleoperadas.
- Alucinacion en sentido estricto no aplica, pero existe el riesgo analogo de predicciones de accion incorrectas o inseguras, especialmente en tareas de contacto fisico.
- Restricciones de licencia: el modelo se publica bajo Apache 2.0, que permite uso comercial; sin embargo, las condiciones de los datos de entrenamiento son independientes y no se detallan en la informacion disponible.
- Validacion comunitaria nula: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de verificacion por terceros.
- Fecha de creacion registrada como 2026-10-11, inusual y no contrastada.
- Para produccion, se recomienda evaluar la politica en el robot real con un numero suficiente de episodios antes de cualquier despliegue y prever mecanismos de parada de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phawitbinabik/act_T1_1B1O_FF_N30_aug60
- Dataset asociado: https://huggingface.co/datasets/phawitbinabik/T1_1B1O_FF_N30_aug60
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
