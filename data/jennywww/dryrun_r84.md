# JennyWWW/dryrun_r84

## Resumen

dryrun_r84 es una politica de control visuomotor entrenada con el metodo Diffusion Policy y publicada en Hugging Face por el usuario JennyWWW mediante la libreria LeRobot. No es un modelo de lenguaje: es un modelo de robotica que transforma observaciones visuales y de estado en comandos de accion de 7 grados de libertad, pensado para ejecutarse sobre un robot simulado de tipo `lerobot_splatsim` en una tarea de aproximacion a una palanca.

El modelo tiene 40.653.291 parametros (unos 40,65 millones) y un peso de repositorio de 0,2 GB en formato safetensors. Consume dos imagenes RGB de 224x224 (camara base y camara de muneca) mas un vector de estado de 7 dimensiones, y produce un vector de accion tambien de 7 dimensiones. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia es doble. Por un lado, sirve como plantilla reproducible del flujo completo de LeRobot (grabacion de datos, entrenamiento, publicacion en el Hub y rollout). Por otro, y de forma importante, se trata de un *dry run*: la propia configuracion de entrenamiento declara solo 3 pasos de optimizacion con batch size 4, es decir, 12 muestras vistas. El nombre del repositorio, `dryrun_r84`, y la ausencia total de resultados de evaluacion confirman que es una prueba de humo del pipeline, no una politica lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusion para control visuomotor, segun el paper arXiv:2303.04137) |
| Parametros totales | 40.653.291 (40,65 M) |
| Longitud de contexto | no aplica; no se especifica el horizonte de prediccion de acciones en la informacion disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de control robotico; no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`), tamano de repositorio 0,2 GB |
| Tipo de robot | `lerobot_splatsim` |
| Camaras de entrenamiento | `base_rgb_letterbox`, `base_rgb_stretch`, `wrist_rgb_letterbox`, `wrist_rgb_stretch` |
| Entradas | `observation.images.base_rgb` (3, 224, 224), `observation.images.wrist_rgb` (3, 224, 224), `observation.state` (7,) |
| Salidas | `action` (7,) |
| Pipeline declarado | robotics |
| Version de LeRobot | 0.4.3 |

## Arquitectura y entrenamiento

El modelo implementa el metodo Diffusion Policy, que plantea el control visuomotor como un proceso generativo de difusion: en lugar de predecir una unica accion de forma directa, aprende a generar trayectorias de accion multimstep y suaves mediante un proceso iterativo de eliminacion de ruido. Este enfoque esta descrito en el paper arXiv:2303.04137 y es conocido por su buen comportamiento en tareas de manipulacion con contacto rico, donde las politicas deterministas tienden a producir movimientos bruscos o multimodales. La model card no detalla la configuracion concreta de la red (numero de pasos de difusion, arquitectura exacta del denoiser ni dimensionalidad del horizonte de acciones), por lo que esos datos figuran como no disponibles.

El entrenamiento se realizo con el dataset `JennyWWW/splatsim_approach_lever_13_smooth`, compuesto por 536 episodios y 148.919 fotogramas a 30 FPS. La configuracion declarada es: 3 pasos de entrenamiento, batch size 4, optimizador Adam, learning rate 1e-05, semilla 0 y LeRobot 0.4.3. Esto supone unicamente 12 muestras procesadas, un volumen totalmente insuficiente para que la politica aprenda una tarea de manipulacion. No se documenta el uso de RLHF, DPO ni tecnicas de ajuste con preferencias, algo por otra parte poco habitual en el ambito de las politicas de imitacion. El campo de tarea del dataset aparece vacio (`""`), por lo que no hay una descripcion textual de la tarea aprendida.

## Capacidades

- Generacion de trayectorias de accion de 7 dimensiones para un robot de tipo `lerobot_splatsim`.
- Percepcion visual dual: procesa simultaneamente una camara base y una camara de muneca, cada una a 224x224 y 3 canales.
- Fusion de vision y propiocepcion: combina las imagenes con un vector de estado de 7 dimensiones.
- Generacion de acciones suaves y multimodales, caracteristica del enfoque de difusion frente a politicas de regresion directa.
- Inferencia en bucle cerrado mediante el comando `lerobot-rollout`, con repeticion continua hasta que se alcanza la duracion indicada.
- Compatibilidad con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso basado en lenguaje ni comportamiento de agente conversacional.
- No dispone de capacidades multilingues, modo de pensamiento (thinking), audio ni vision generalista mas alla del uso como entrada de control.
- No se documentan capacidades de generalizacion a otras tareas, objetos o robots distintos del especificado.

## Casos de uso

- Prueba de humo del pipeline de LeRobot: el modelo permite validar de principio a fin el flujo `lerobot-train` -> publicacion en el Hub -> `lerobot-rollout` sin invertir tiempo de computo en un entrenamiento real. Es exactamente el proposito con el que fue creado.
- Plantilla de configuracion para futuras politicas: su model card sirve como referencia de los campos obligatorios (tipo de robot, camaras, formas de entrada y salida, configuracion de entrenamiento) que hay que rellenar al publicar una politica de difusion.
- Depuracion de integracion hardware-software: permite comprobar la conexion con el robot, el mapeo de camaras, los indices de dispositivo y la frecuencia de control a 30 FPS antes de entrenar una politica util.
- Verificacion de compatibilidad de versiones: al declarar LeRobot 0.4.3, es util para comprobar que una instalacion concreta puede cargar, instanciar y ejecutar el checkpoint sin errores de API.
- Referencia para pruebas de regresion en CI: un checkpoint de 0,2 GB y 40,65 M de parametros es lo bastante ligero para incluirlo en un test automatizado que verifique que la carga de safetensors y la inferencia siguen funcionando tras cambios en la libreria.
- Punto de partida para *fine-tuning* en tareas de aproximacion a una palanca: partiendo de estos pesos y del dataset de 148.919 fotogramas, un entrenamiento con un numero de pasos realista (miles o decenas de miles) podria producir una politica funcional para esa tarea simulada.
- Docencia y formacion: sirve para ilustrar de forma tangible como se estructura una politica de difusion en LeRobot, con sus entradas, salidas y comando de despliegue.
- No se recomienda su uso como controlador real en un robot fisico, dado que solo ha visto 12 muestras durante el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la linea «No evaluation results have been provided for this policy yet», de modo que no existen tasas de exito, numero de ensayos ni comparaciones cuantitativas con otras politicas. Cualquier cifra de rendimiento atribuida a este checkpoint seria inventada.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 163 MB en fp32 (40.653.291 parametros x 4 bytes) y unos 82 MB en fp16 o bf16. La memoria adicional para activaciones, buffers de imagen y estado del bucle de difusion es reducida en comparacion con los pesos.
- GPU recomendadas: no hay requisitos publicados. Dado el tamano, cualquier GPU con al menos 4 GB de VRAM es suficiente en la practica; una RTX 3060, RTX 4060 o superior resulta holgada, y tarjetas de gama alta como RTX 4090, A100 o H100 estan sobradamente dimensionadas para este modelo.
- Compatibilidad con GPU de consumo: si, cabe con enorme margen en practicamente cualquier GPU de consumo moderna, e incluso en aceleradores de borde con pocos gigabytes de memoria compartida.
- Inferencia en CPU: tecnicamente viable por el reducido numero de parametros, aunque el coste por paso de difusion y la necesidad de sostener 30 Hz de control hacen recomendable una GPU o un acelerador dedicado.
- Opciones de despliegue: el camino soportado es LeRobot mediante `lerobot-rollout` con `--policy.path=dryrun_r84`. No se documenta soporte de vLLM, TGI, llama.cpp ni Ollama, que no aplican a un modelo de robotica. Tampoco se documenta una exportacion oficial a ONNX o TensorRT.
- Latencia y throughput estimados: no disponibles. La informacion proporcionada no incluye mediciones de tiempo de inferencia ni de frecuencia de control alcanzable; el unico dato relacionado es que el dataset se grabo a 30 FPS.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto o entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JennyWWW/dryrun_r84 | Diffusion Policy para `lerobot_splatsim` | 40,65 M | 2 imagenes 224x224 + estado (7,) | Apache 2.0 | Hugging Face, 0 descargas y 0 likes en el momento de la consulta |
| Diffusion Policy de referencia (metodo arXiv:2303.04137) | Politica de difusion visuomotora | no disponible | depende de la implementacion | no disponible | Paper y multiples implementaciones publicas |
| ACT (policy type de LeRobot) | Transformer de imitacion con action chunking | no disponible | imagenes + estado del robot | Apache 2.0 (como parte de LeRobot) | Disponible en el repositorio de LeRobot |
| SmolVLA (Hugging Face) | Modelo vision-language-action | no disponible | imagenes + instruccion en lenguaje | no disponible | Disponible en Hugging Face |

La comparacion cuantitativa no es posible porque este checkpoint no publica resultados de evaluacion y su entrenamiento de 3 pasos lo situa fuera de cualquier rango de rendimiento util. Frente a ACT, la diferencia de planteamiento es que Diffusion Policy genera acciones mediante un proceso de difusion, lo que favorece trayectorias suaves y multimodales; frente a un VLA como SmolVLA, la diferencia clave es que `dryrun_r84` no acepta instrucciones en lenguaje natural y esta atado a una unica morfologia de robot y una unica tarea.

## Limitaciones y advertencias

- Entrenamiento practicamente inexistente: 3 pasos de optimizacion con batch size 4 equivalen a 12 muestras vistas. La politica no ha aprendido la tarea y sus salidas deben considerarse esencialmente aleatorias.
- Ausencia total de evaluacion: no hay tasa de exito, numero de ensayos ni resultados en robot real o simulado.
- Tarea no descrita: el campo `task` del dataset esta vacio, por lo que no se puede verificar documentalmente que tarea concreta se pretendia aprender.
- Especificidad extrema: el modelo esta atado al tipo de robot `lerobot_splatsim` y a una configuracion exacta de camaras. Usarlo con otra morfologia, otra disposicion de sensores u otros nombres de clave de observacion provocara fallos de carga o inferencia incorrecta.
- Sin capacidades de lenguaje: no acepta instrucciones textuales, no soporta tool calling, no es multilingue y no puede operar como agente conversacional.
- Riesgo de sobreajuste nulo por falta de entrenamiento, pero tambien riesgo de comportamiento erratico o saturado en los limites del espacio de acciones.
- No se documentan sesgos en el sentido de modelos de lenguaje, pero si un sesgo de distribucion evidente: los datos provienen de una unica tarea, un unico robot y un unico entorno simulado, con 536 episodios de una aproximacion a una palanca.
- Riesgo de alucinacion en el sentido de generar trayectorias plausibles pero fisicamente invalidas para el robot o el entorno; al no haber aprendido la dinamica de la tarea, este riesgo es maximo.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con la obligacion habitual de conservar el aviso de licencia y el archivo de cambios. No hay clausulas de uso aceptable adicionales en la informacion disponible.
- Advertencia para produccion: no desplegar en un robot fisico sin un entrenamiento completo y una evaluacion sistematica previa. El unico uso seguro de estos pesos es como prueba de integracion del software.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JennyWWW/dryrun_r84
- Dataset de entrenamiento: https://huggingface.co/datasets/JennyWWW/splatsim_approach_lever_13_smooth
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=JennyWWW/splatsim_approach_lever_13_smooth
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
