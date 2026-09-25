# sauce345/mw-longcat-video-int8

## Resumen

`sauce345/mw-longcat-video-int8` es un checkpoint de pesos cuantizados a INT8 del modelo base DiT de LongCat-Video, un modelo fundacional de generacion de video desarrollado por Meituan (organizacion meituan-longcat). No se trata de un modelo nuevo ni de un fine-tune, sino de una conversion de precision del LongCat-Video original: los pesos se han pasado a INT8 per-channel weight-only usando la utilidad oficial `longcat_video.modules.quantization.quantize_model`, con la capa `final_layer.linear` excluida de la cuantizacion. El repositorio ocupa 13,6 GB, coherente con un modelo de aproximadamente 13,6 mil millones de parametros almacenados a un byte por peso.

El modelo base LongCat-Video es un transformer de difusion (DiT) de 13,6 mil millones de parametros que cubre tres tareas de generacion: texto a video, imagen a video y continuacion de video, con enfasis declarado en la generacion de video largo sin perdida apreciable de calidad. Segun la model card de este repositorio, esta version INT8 se utiliza como parte del pase de refinamiento de un worker de avatar autoalojado, combinado con un LoRA de refinamiento (`refinement_lora`) del repositorio base.

La relevancia de esta ficha es acotada y conviene ser explicito: es un artefacto de pesos, no una release oficial, no incluye model card detallada, no declara licencia propia, no tiene pipeline asociado, no registra descargas ni likes y no aporta resultados de benchmarks. Su interes practico esta en reducir el coste de memoria del LongCat-Video base para despliegues con VRAM limitada, manteniendo el mismo layout `QuantizedLinear` que otros checkpoints INT8 de la familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) del modelo base LongCat-Video |
| Parametros totales | 13,6 mil millones (heredados del modelo base LongCat-Video) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de generacion de video; no expone ventana de contexto de texto) |
| Tipos de cuantizacion | INT8 per-channel weight-only; se excluye de la cuantizacion la capa `final_layer.linear` |
| Idiomas soportados | no disponible |
| Licencia | no disponible en este repositorio; el modelo base LongCat-Video es MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13,6 GB |
| Pipeline declarado | no disponible |
| Autor | sauce345 |
| Fecha de creacion | 2026-09-25 |
| Fecha de actualizacion | 2026-09-25 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un Diffusion Transformer (DiT) del modelo LongCat-Video, de 13,6 mil millones de parametros, orientado a generacion de video. Este repositorio concreto no aporta informacion sobre el entrenamiento original: no se detallan el numero de tokens, la composicion del dataset ni si hubo etapas de alineacion tipo RLHF o DPO. Los datos disponibles solo describen el proceso de cuantizacion, no el de entrenamiento.

La innovacion tecnica de este artefacto es la cuantizacion: pesos en INT8 con escalas por canal (per-channel) y modo weight-only, de forma que las activaciones no se cuantizan. La conversion se realizo con la herramienta oficial `longcat_video.modules.quantization.quantize_model`, omitiendo la capa final `final_layer.linear`. El resultado mantiene el mismo layout `QuantizedLinear` que `LongCat-Video-Avatar-1.5/base_model_int8`, lo que facilita la reutilizacion del mismo codigo de carga. El commit de referencia del modelo base citado en la model card es `03b55529b1d1d4045f5fbe14d65c8c6e8116b278`.

## Capacidades

- Generacion de video a partir de texto (text-to-video), heredada del modelo base.
- Generacion de video a partir de una imagen (image-to-video).
- Continuacion de video (video-continuation), orientada a producir secuencias largas.
- Generacion de video largo con enfasis en mantener la coherencia temporal sin degradacion marcada, segun la documentacion del modelo base.
- Integracion en un pase de refinamiento de un worker de avatar autoalojado, en combinacion con un LoRA de refinamiento del repositorio base.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponible.
- Capacidades especiales declaradas: ninguna adicional en este repositorio; no se documentan modo de razonamiento, vision ni audio.

## Casos de uso

- Refinamiento de avatares en produccion: la model card indica que este checkpoint se usa en el pase de refinamiento de un worker de avatar autoalojado junto al `refinement_lora` del repositorio base, de modo que el escenario principal ya esta descrito por el propio autor.
- Despliegue con VRAM limitada: al almacenar los pesos en INT8 (13,6 GB) en lugar de precision completa, permite cargar el modelo base en GPUs donde la version original no entraria, a cambio de una posible perdida de calidad.
- Generacion de clips de texto a video para previsualizacion de guiones: el modelo puede producir secuencias cortas a partir de descripciones textuales, utiles en fases de prototipado audiovisual.
- Animacion de imagenes fijas: mediante imagen a video, se pueden convertir ilustraciones, fotografias de producto o fotogramas clave en clips animados.
- Continuacion de metraje existente: la tarea de video-continuation permite extender una secuencia dada, util para alargar tomas o generar transiciones.
- Investigacion sobre cuantizacion de DiT: sirve como referencia para comparar la calidad de un DiT de video a 13,6B en INT8 frente a la version sin cuantizar, usando el mismo codigo oficial.
- Reproduccion de pipelines propios: al compartir el layout `QuantizedLinear` con `LongCat-Video-Avatar-1.5/base_model_int8`, se puede integrar en codigo ya preparado para cargar checkpoints INT8 de la familia LongCat-Video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir del tamano de los pesos (13,6 GB en INT8), el minimo teorico ronda los 14-16 GB solo para pesos. A esa cifra hay que sumar activaciones, latentes de video y el decodificador VAE, de modo que en la practica se necesitaran bastante mas. Estas cifras son estimaciones derivadas del tamano del repositorio; el autor no publica requisitos.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el tamano del modelo, un DiT de 13,6B con secuencias de video suele requerir GPUs de gama alta tipo A100, H100 o L40S para resoluciones y duraciones realistas.
- Cabe en GPU de consumo: no confirmado. Con pesos INT8 de 13,6 GB, una RTX 3090 o RTX 4090 de 24 GB podria ser el limite inferior para clips cortos y resolucion reducida, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: el codigo de referencia es el paquete oficial `longcat_video` del repositorio meituan-longcat/LongCat-Video. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI (ninguno de ellos es aplicable a un DiT de video). El soporte en ComfyUI u otros frontends no esta confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Precision de pesos | Licencia | Tareas | Disponibilidad |
|---|---|---|---|---|---|
| sauce345/mw-longcat-video-int8 | 13,6B (heredados) | INT8 per-channel weight-only | no disponible en el repo; base MIT | T2V, I2V, continuacion | HuggingFace, 0 descargas |
| LongCat-Video (base) | 13,6B | precision completa | MIT | T2V, I2V, continuacion | HuggingFace y GitHub oficiales |
| LongCat-Video-Avatar-1.5 / base_model_int8 | no disponible | INT8 (mismo layout `QuantizedLinear`) | no disponible | avatar / refinamiento | HuggingFace |
| Otros modelos de generacion de video de ~10-14B (por ejemplo, alternativas de la comunidad) | no disponible | no disponible | no disponible | T2V, I2V | no disponible |

Solo se dispone de datos verificables para el modelo base y para el checkpoint hermano INT8 citado en la model card. La comparacion con otras familias de modelos de video no puede completarse con la informacion proporcionada.

## Limitaciones y advertencias

- Es un artefacto de pesos, no un modelo ejecutable por si solo: requiere el codigo de `longcat_video` del repositorio oficial para cargarse y ejecutarse.
- No declara licencia propia en HuggingFace. La model card menciona MIT, pero ese dato corresponde al repositorio base (meituan-longcat/LongCat-Video). Conviene verificar la licencia aplicable antes de un uso comercial.
- La cuantizacion INT8 weight-only puede degradar la calidad de generacion respecto al modelo sin cuantizar. No hay evaluaciones publicadas que cuantifiquen esa perdida.
- No hay model card detallada, ni pipeline declarado, ni idiomas soportados, ni resultados de benchmarks en este repositorio.
- Riesgo de alucinacion: en el contexto de un modelo generativo de video, se traduce en artefactos visuales, incoherencias temporales o contenido no fiel al prompt. No hay evaluaciones publicadas para esta version cuantizada.
- Sesgos: no disponibles. No se documenta ninguna evaluacion de sesgo para el modelo base ni para este checkpoint.
- Datos de uso nulos: 0 descargas y 0 likes, con creacion y ultima actualizacion el mismo dia. Es un artefacto sin validacion externa por parte de la comunidad.
- La fecha de creacion registrada (2026-09-25) es futura respecto al momento habitual de publicacion; se reproduce tal cual figura en los metadatos, sin interpretacion adicional.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sauce345/mw-longcat-video-int8
- Discusiones del repositorio: https://huggingface.co/sauce345/mw-longcat-video-int8/discussions
- Repositorio oficial de LongCat-Video en GitHub: https://github.com/meituan-longcat/LongCat-Video
- Pagina oficial del proyecto LongCat-Video: https://meituan-longcat.github.io/LongCat-Video/
- Sitio divulgativo sobre LongCat Video: https://longcat.run/
