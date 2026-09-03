# hz1919810/lingbot-va-arx-teacher-nosplit-step3000

## Resumen

LingBot-VA ARX SFT Teacher (no-split, step 3000) es un ajuste fino del modelo de mundo video-accion LingBot-VA, desarrollado por hz1919810 sobre la base `Robbyant/lingbot-va-base`. El modelo se entrena con el conjunto de datos completo ARX WAM-OPD (199 episodios, 64.417 fotogramas) sin particion de validacion, y esta disenado como entregable de contrato para la tarea de manipulacion robotica ARX lift R5. Su proposito es servir como "teacher" (maestro) en un esquema de destilacion o generacion de datos sinteticos para politicas de control.

El checkpoint corresponde al paso 3000, que es el limite de entrenamiento establecido por contrato para esta linea sin split. Al no existir conjunto de validacion, este checkpoint no se selecciona por metricas de validacion, sino que se considera el punto final del calendario de entrenamiento. El modelo se distribuye en formato diffusers con pesos safetensors y utiliza un transformer 3D (WanTransformer3DModel) como arquitectura base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WanTransformer3DModel (diffusers), world-model video-accion causal |
| Parametros totales | 5.088.872.670 (5,09 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de video, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en BF16, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo de robotica, sin capacidades de lenguaje) |
| Licencia | other (no especificada; requiere contacto con el autor) |
| Formato de pesos | safetensors (diffusers) |

## Arquitectura y entrenamiento

El modelo se basa en LingBot-VA, un world-model causal de video-accion presentado en RSS 2026. La arquitectura emplea un WanTransformer3DModel en formato diffusers, que procesa secuencias de video y acciones para predecir estados futuros. El ajuste fino se realizo sobre el dataset WAM-OPD_4Tasks (LeRobot v2.1) con los 199 episodios completos y 64.417 fotogramas, sin particion de validacion. La configuracion temporal es `video_7p5hz_action_15hz_k2` (K=2), y las acciones se transforman de 14 dimensiones absolutas de articulacion a 30 dimensiones mediante un mapeo especifico `[14-19,28,21-26,29]`, con normalizacion basada en cuantiles q01/q99 del dataset.

El entrenamiento utilizo precision BF16 con FSDP, optimizador AdamW con learning rate 5e-6, grad clip 2.0 y CFG 0.1. Durante el entrenamiento se uso atencion en modo flex, pero para inferencia se recomienda cambiar `attn_mode` a torch o flashattn. El checkpoint del paso 3000 es el final de la linea sin split; no existe un checkpoint de 5000 pasos para esta linea (la linea de 5000 pasos corresponde al teacher con split de 160 episodios, usado solo para diagnostico de overfitting).

## Capacidades

- Prediccion de video y acciones: genera secuencias futuras de fotogramas y comandos de articulacion para la tarea de manipulacion ARX lift R5.
- Modelo de mundo causal: modela la dinamica del entorno a partir de observaciones visuales y acciones, permitiendo simulacion de trayectorias.
- Integracion con diffusers: compatible con el ecosistema de HuggingFace para carga y despliegue.
- Soporte de atencion flexible: permite cambiar entre modos de atencion (torch, flashattn) segun el hardware disponible.
- No incluye capacidades de lenguaje, tool calling, agentes conversacionales ni vision general fuera del dominio robotico.

## Casos de uso

- Generacion de datos sinteticos para entrenamiento de politicas: el modelo puede producir trayectorias de video y accion que sirven como aumentacion de datos para entrenar politicas de control en la tarea ARX lift R5, especialmente en entornos simulados.
- Evaluacion de politicas en simulacion: al ser un world-model, permite probar politicas de control en un entorno simulado generado por el modelo antes de desplegarlas en el robot real, reduciendo costes y riesgos.
- Destilacion de conocimiento (teacher-student): como teacher, puede guiar el entrenamiento de modelos estudiantes mas pequenos o mas eficientes, proporcionando supervisión densa de video y accion.
- Diagnostico de overfitting en modelos de mundo: la linea sin split sirve para comparar con la linea con split (160 episodios) y estudiar el efecto del sobreajuste en la generalizacion.
- Investigacion en world models para robotica: util como referencia para estudiar el comportamiento de modelos de mundo causales en tareas de manipulacion con datos limitados.
- Desarrollo de simuladores neuronales: puede integrarse en pipelines de robotica que requieran un simulador basado en redes neuronales para planificacion o aprendizaje por refuerzo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (exito en tarea, error de prediccion, etc.) y, al no existir conjunto de validacion, no hay datos de rendimiento en holdout. La seleccion del checkpoint para despliegue debe realizarse mediante evaluacion en robot real, segun indica el autor.

## Requisitos de hardware

- VRAM estimada: con 5,09 B de parametros en BF16, los pesos ocupan aproximadamente 10,2 GB. Para inferencia se requiere al menos 12-16 GB de VRAM considerando activaciones y overhead, aunque no se han publicado requisitos oficiales.
- GPU recomendadas: tarjetas con 24 GB de VRAM (RTX 4090, A100 40GB, L40S) son adecuadas para inferencia sin cuantizacion. GPUs de 16 GB (RTX 4080, A10G) podrian funcionar con optimizaciones de memoria, pero no esta verificado.
- Compatibilidad con GPU de consumo: posible en RTX 4090 (24 GB) o RTX 3090 (24 GB) con configuracion cuidadosa; no se garantiza en GPUs de 8-12 GB.
- Opciones de despliegue: al ser un modelo diffusers, puede cargarse con la libreria `diffusers` de HuggingFace. Para inferencia de video-accion, se recomienda seguir las instrucciones del repositorio LingBot-VA (standalone o arquitectura servidor-cliente). No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa rigurosa con otros modelos de mundo video-accion (como UniPi, DreamerV3 o modelos propietarios). El modelo es un ajuste fino especifico de LingBot-VA para la tarea ARX lift R5, y no se han publicado comparaciones con alternativas en la documentacion disponible. Se recomienda consultar el repositorio de LingBot-VA para posibles comparaciones con la linea base.

## Limitaciones y advertencias

- Sobreajuste potencial: al entrenar con todos los 199 episodios sin holdout, el modelo puede memorizar los datos de entrenamiento y generalizar mal a nuevas situaciones. El autor advierte que la seleccion del checkpoint debe hacerse con evaluacion en robot real.
- Licencia restrictiva: la licencia "other" no especifica los terminos de uso. Es necesario contactar con el autor para aclarar si se permite uso comercial o modificacion.
- Sin validacion independiente: no hay metricas de rendimiento publicadas, por lo que no se puede evaluar la calidad del modelo sin pruebas propias.
- Dominio limitado: el modelo esta especializado en la tarea ARX lift R5 y puede no transferir a otras tareas de manipulacion sin reentrenamiento.
- Dependencia de la base: el rendimiento final depende del modelo base LingBot-VA y de la calidad del dataset WAM-OPD; cualquier limitacion de estos se hereda.
- Requisitos de hardware no documentados: no se proporcionan guias oficiales de despliegue, lo que puede dificultar la puesta en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hz1919810/lingbot-va-arx-teacher-nosplit-step3000
- Repositorio oficial de LingBot-VA: https://github.com/robbyant/lingbot-va
- Fork alternativo de LingBot-VA: https://github.com/hewu2008/ZERITH_Lingbot_VA
