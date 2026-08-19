# hmkang/wam-dit4dit-robocasa-wan22-3latin2latout

## Resumen

WAM DiT4DiT es un ajuste fino (finetune) del modelo Wan2.2-TI2V-5B de Wan-AI, especializado en predicción de vídeo como modelo de mundo (world model) para el entorno RoboCasa Kitchen. El modelo, desarrollado por hmkang, está entrenado exclusivamente en modo vídeo, sin cabezal de acciones, y condiciona tres latentes de entrada para generar dos latentes futuros (configuración `3latin2latout`). Esto lo convierte en una herramienta de investigación para la predicción de escenas robóticas en cocinas simuladas.

La relevancia actual de este modelo reside en su enfoque en modelos de mundo para robótica, un área en auge para la planificación y simulación visual. Al derivar de Wan2.2-TI2V-5B, un modelo de difusión de vídeo de 5 mil millones de parámetros, hereda su arquitectura de transformador de difusión (DiT) y su capacidad de generación de vídeo, aunque adaptado a un dominio específico. El checkpoint publicado incluye una copia EMA del modelo de vídeo, pero excluye el estado del optimizador, por lo que solo es válido para inferencia, extracción de características o sondeo (probing), no para reanudar el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) basado en Wan2.2-TI2V-5B |
| Parametros totales | 5B (modelo base Wan2.2-TI2V-5B; no se especifica si el finetune modifica el numero) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de video, no de texto) |
| Tipos de cuantizacion | no disponible (solo safetensors de precision completa) |
| Idiomas soportados | no disponible (modelo de video, sin procesamiento de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (shards con indice) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Wan2.2-TI2V-5B, un transformador de difusion (DiT) para generacion de video. El entrenamiento se realizo en modo `video`, lo que significa que el cabezal de acciones (action head) no fue entrenado; solo se optimizo el DiT de video para predecir fotogramas futuros a partir de fotogramas pasados. La configuracion `3latin2latout` indica que se condicionan tres latentes de entrada (frames codificados) para generar dos latentes de salida (frames futuros).

Se guardo una copia EMA (media movil exponencial) del modelo de video, con 825 tensores en fp32, siguiendo el programa de EMA de diffusers (`use_ema_warmup` con `inv_gamma=1.0`, `power=0.75`, tope 0.9999). La extraccion de EMA se desactivo durante el entrenamiento (`WAM_VIDEO_EMA_TRAIN_EXTRACT=0`), por lo que el EMA se rastreo y guardo sin afectar la matematica del entrenamiento. El entrenamiento se realizo en 8 GPU H200. Los checkpoints se guardan por paso e incluyen los shards del modelo (`model-*.safetensors`) junto con los archivos de procesador y configuracion, ademas de la copia EMA bajo el prefijo `_video_ema_model.*`. No se incluye el estado del optimizador, por lo que los checkpoints no son reanudables.

## Capacidades

- Prediccion de video: genera dos fotogramas latentes futuros a partir de tres fotogramas latentes de entrada, actuando como modelo de mundo para escenas de cocina robotica.
- Extraccion de caracteristicas: los checkpoints permiten extraer representaciones intermedias del DiT de video para tareas de sondeo o analisis.
- Inferencia de video condicionada: dado un contexto visual de entrada, produce continuaciones plausibles de la escena.
- No soporta tool calling, agentes, razonamiento multi-paso, ni procesamiento de lenguaje o vision multimodal mas alla de video.
- No tiene capacidades multilingues (es un modelo de video puro).

## Casos de uso

- Investigacion en modelos de mundo: el modelo puede utilizarse para estudiar como los DiT predicen evoluciones de escenas roboticas en entornos de cocina simulados, sirviendo como base para comparar arquitecturas o tecnicas de entrenamiento.
- Simulacion visual para planificacion robotica: dado un estado visual inicial de una cocina RoboCasa, el modelo puede generar secuencias futuras que sirvan como entrada para planificadores basados en video o para validar politicas de control.
- Generacion de datos sinteticos: las predicciones de video pueden emplearse para aumentar datasets de entrenamiento de otros modelos, aunque la fidelidad no esta validada.
- Sondeo de representaciones: al incluir la copia EMA, se pueden extraer caracteristicas del modelo para analizar que informacion visual se codifica en las capas del DiT.
- Benchmarking de finetunes de Wan2.2: sirve como punto de comparacion para otros ajustes del mismo modelo base en dominios especificos.
- Pruebas de inferencia con EMA: permite evaluar el efecto de la media movil exponencial en la calidad de las predicciones frente al modelo sin EMA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de metricas como FVD, PSNR o comparaciones con otros modelos de world model.

## Requisitos de hardware

- No se especifican requisitos de hardware para inferencia en la documentacion proporcionada.
- El entrenamiento se realizo en 8 GPU H200, lo que sugiere que la inferencia podria requerir una GPU con al menos 24-40 GB de VRAM en precision fp16, pero este dato no esta confirmado.
- Al ser un modelo de 5B en safetensors, es probable que quepa en GPUs consumer de gama alta (p. ej., RTX 4090 con 24 GB) con cuantizacion, aunque no se proporcionan archivos GGUF ni cuantizaciones.
- Opciones de despliegue: no se mencionan vLLM, llama.cpp, Ollama ni TGI; al ser un modelo de video de difusion, el despliegue tipico usaria el pipeline de diffusers o codigo especifico de Wan2.2.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificos en la documentacion. Como referencia, el modelo base Wan2.2-TI2V-5B es un generador de video de texto a video, pero este finetune elimina la entrada de texto y se centra en video puro. Otros modelos de world model como Cosmos o UniSim podrian ser comparables, pero no hay datos disponibles en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| WAM DiT4DiT (este) | 5B (base) | no disponible | apache-2.0 | HuggingFace |
| Wan2.2-TI2V-5B (base) | 5B | no disponible | apache-2.0 | HuggingFace |

## Limitaciones y advertencias

- Los checkpoints no incluyen el estado del optimizador, por lo que no se puede reanudar el entrenamiento; solo sirven para inferencia, extraccion de caracteristicas o sondeo.
- El modelo esta entrenado exclusivamente en el dominio RoboCasa Kitchen; su capacidad de generalizacion a otros entornos o tareas no esta evaluada.
- Al ser un modelo de video sin cabezal de acciones, no puede condicionarse por comandos de control; solo predice evoluciones visuales.
- No hay informacion sobre sesgos, alucinaciones visuales o limitaciones de contexto temporal mas alla de la configuracion `3latin2latout`.
- La licencia apache-2.0 se aplica al finetune, pero los terminos del modelo base Wan2.2-TI2V-5B tambien son aplicables a este derivado, segun se indica en la model card.
- No se proporcionan datos de rendimiento, latencia ni throughput, por lo que no se puede estimar la viabilidad en produccion.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/hmkang/wam-dit4dit-robocasa-wan22-3latin2latout)
- [Modelo base Wan2.2-TI2V-5B-Diffusers](https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers)
