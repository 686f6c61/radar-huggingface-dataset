# SimpleTuner/Qwen-Image-2.1-training-assistant-v2

## Resumen

SimpleTuner/Qwen-Image-2.1-training-assistant-v2 es un adaptador LoRA de rango 32 concebido como "asistente de entrenamiento" para el modelo de generacion y edicion de imagen Qwen-Image-2.1, desarrollado por el equipo de SimpleTuner. No es un modelo de generacion de imagenes autonomo ni un adaptador de personaje o de generacion en pocos pasos: su funcion es permanecer congelado y activo durante el entrenamiento de LoRA de concepto posteriores, absorbiendo los cambios que de otro modo degradarian la coherencia y la calidad de la imagen, y desactivarse por completo en la fase de inferencia.

El adaptador se entreno desde cero durante 1.000 actualizaciones sobre una NVIDIA H100, en BF16, con optimizador `adamw_bf16` corregido, tasa de aprendizaje `1e-4` constante tras 25 pasos de calentamiento y recorte de norma global de gradiente a 1,0. A diferencia de la version v1, esta v2 mezcla imagenes generadas por el propio modelo con imagenes reales de CC12M y de e621, con tres grupos de origen ponderados por igual (338 lotes sinteticos, 331 de CC12M y 331 de e621). Cubre resoluciones base de 512, 1024, 1536 y 2048 pixeles.

Su relevancia es practica y de nicho: ofrece un mecanismo de regularizacion entrenable para pipelines de fine-tuning de difusion, con una receta y unos pesos publicados de forma reproducible (33.554.432 parametros entrenables, 0,1 GB de repositorio). Es un artefacto experimental, sin descargas ni valoraciones en el momento de la consulta, y su licencia qwen-research condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre el transformer DiT de Qwen-Image-2.1 (32 capas Single-Stream DiT); proyecciones de atencion `to_q`, `to_k`, `to_v`, `to_out.0` |
| Parametros totales | 33.554.432 parametros entrenables en el adaptador. Tamano del modelo base: 20.000 millones citados por la documentacion de SimpleTuner; 7.000 millones en el componente de generacion visual segun el repositorio de QwenLM |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible para el adaptador. Entrenado y distribuido en BF16; la documentacion de SimpleTuner menciona int8 y niveles mas agresivos para el entrenamiento del modelo base en GPUs de 24 GB |
| Idiomas soportados | No disponible |
| Licencia | `qwen-research` (campo `license: other`) |
| Formato de pesos | No disponible (repositorio de 0,1 GB con `training_details.json`, `training_config.json`, `dataloader.json` y `LICENSE`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA estandar de rango 32 y alpha 32, aplicado exclusivamente a las proyecciones de atencion del transformer DiT de Qwen-Image-2.1. El modelo base es un unico transformer de difusion de 32 capas "Single-Stream" con un componente de generacion visual de 7.000 millones de parametros, un codificador de texto de gran tamano que consume aproximadamente 16 GB de VRAM antes de cuantizar y un VAE propio de 16 canales latentes. Durante el entrenamiento del asistente se utilizo el VAE original de Qwen Image 2.1 con codificacion de fotograma completo y tamano de lote 1.

Los datos se organizaron en tres grupos de igual peso: imagenes sinteticas generadas por Qwen Image 2.1 (40 pasos de inferencia nativos, CFG 1, BF16, con subtitulos de CC12M), imagenes reales de CC12M accedidas mediante indices de subtitulos estructurados (campo `long_caption`) e imagenes reales de e621 accedidas mediante indices Webshart. Los backends sinteticos se limitaron a 128 muestras por cubo de aspecto y los backends de datos reales a 256 muestras por resolucion; no son pasadas completas sobre los datasets originales y una misma imagen puede reutilizarse entre backends de resolucion. El entrenamiento se ejecuto con 1.000 actualizaciones, lote 1, acumulacion 1, BF16, gradient checkpointing con intervalo 2 y recorte de gradiente por norma global con maximo 1,0. No se configuro ningun dataset Domokun; los subtitulos se revisaron en busca de coincidencias con nombres Domokun o palabras disparadoras. La innovacion tecnica no esta en la arquitectura, sino en el propio procedimiento: el asistente se congela junto al adaptador de concepto entrenable y se desactiva en inferencia, de modo que la evaluacion relevante es el entrenamiento posterior con el asistente activo seguido de inferencia sin el.

## Capacidades

- Regularizacion de fine-tuning: absorbe durante el entrenamiento los cambios que, de otro modo, degradarian la coherencia estructural y la calidad visual del modelo base.
- Entrenamiento de conceptos y estilos con LoRA estandar (`lora_type: standard`) sobre Qwen Image 2.1, incluida la variante `distillation_method: assistant_lora` con generacion de profesor en linea.
- Preservacion de coherencia en rangos amplios de resolucion: el asistente se entreno con resoluciones base de 512, 1024, 1536 y 2048 pixeles, con cubos cuadrados, verticales y horizontales para los datos sinteticos y cubos de area que preservan el aspecto para los datos reales.
- Soporte de entrenamiento multi-escala probabilistico y de resolucion unica en pruebas downstream (2.000 actualizaciones a 512 px y a 1024 px; 4.000 actualizaciones multi-escala).
- No dispone de palabra disparadora ni funciona como adaptador de personaje o de generacion en pocos pasos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada ni audio: es un adaptador de difusion, no un modelo de lenguaje.
- No se documentan capacidades multilingues del adaptador.
- No esta pensado para generar imagenes por si mismo: las imagenes producidas con el asistente activado en solitario no representan la configuracion final de inferencia prevista.

## Casos de uso

- Fine-tuning de estilos visuales en produccion: se entrena un LoRA de concepto con el asistente v2 congelado y activo, y se sirve el adaptador resultante con el asistente desactivado; asi se mantiene la coherencia del estilo aprendido sin arrastrar artefactos del modelo base.
- Entrenamiento de personajes concretos: la coleccion de experimentos compara adaptadores Domokun downstream con y sin asistente; en las pruebas revisadas a 4000 actualizaciones multi-escala se obtuvieron muestras reconocibles del concepto manteniendo coherente un retrato de validacion reservado.
- Adaptacion estetica fotografica: el experimento extendido de fotoestetica ejecuto 50.000 actualizaciones downstream a 512 px y 10.000 a 1024 px con el asistente v2 congelado y desactivado en validacion, un escenario tipico de ajuste de look-and-feel para catalogos o bancos de imagen.
- Regularizacion de datasets pequenos o desequilibrados: al mezclar imagenes sinteticas con CC12M y e621, el asistente aporta diversidad de distribucion durante el ajuste fino y reduce el sobreajuste a un unico dominio visual cuando solo se dispone de unos cientos de imagenes etiquetadas.
- Investigacion reproducible sobre regularizacion de difusion: los ficheros `training_details.json`, `training_config.json` y `dataloader.json` documentan semilla de datos, presupuestos por backend, optimizador y receta completa, lo que permite replicar o ablar el efecto del asistente en un estudio comparativo.
- Generacion de conjuntos de datos sinteticos etiquetados: el pipeline de datos sinteticos usado para entrenar el asistente (40 pasos, CFG 1, BF16, subtitulos CC12M) es reutilizable para producir pares imagen-texto a escala con presupuestos de muestreo controlados por cubo de aspecto.
- Ajuste fino multi-resolucion para impresion o producto: el entrenamiento a 2048 px con cubos que preservan el aspecto encaja en flujos donde se requiere detalle fino a alta resolucion sin perder coherencia global.
- Control de calidad en pipelines de entrenamiento: comparar el adaptador downstream entrenado con asistente frente al entrenado en baseline permite cuantificar de forma cualitativa la deriva de coherencia antes de publicar un LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe exclusivamente evaluaciones cualitativas: comparaciones en la coleccion de experimentos de Qwen Image 2.1 LoRA, el experimento extendido de fotoestetica con 50.000 actualizaciones a 512 px y 10.000 a 1024 px, y una ejecucion multi-escala de 4.000 actualizaciones con muestras de playa reconocibles y un retrato reservado coherente. No se proporcionan valores numericos de metrica alguna.

## Requisitos de hardware

- Adaptador en si: 33.554.432 parametros en BF16 equivalen a aproximadamente 67 MB, con un repositorio de 0,1 GB; el coste de VRAM del adaptador es despreciable frente al modelo base.
- Entrenamiento del asistente: se ejecuto en una NVIDIA H100 con 1.000 actualizaciones, lote 1 y acumulacion 1.
- Entrenamiento downstream con Qwen Image 2.1: el codificador de texto del modelo base consume aproximadamente 16 GB de VRAM antes de cuantizar.
- GPU de consumo: en GPUs de 24 GB las validaciones provocan errores de memoria salvo que se reduzca la resolucion o se aplique un nivel de cuantizacion mas agresivo que int8, segun la documentacion de SimpleTuner.
- Despliegue: el adaptador se carga desde un checkout de SimpleTuner con soporte de Qwen Image 2.1 y de LoRA asistente. No aplican vLLM, llama.cpp, Ollama ni TGI por tratarse de un adaptador de difusion, no de un modelo de lenguaje.
- Inferencia: se carga el modelo base con el LoRA de concepto resultante y el asistente desactivado (`assistant_lora_inference_strength: 0.0`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SimpleTuner/Qwen-Image-2.1-training-assistant-v2 | LoRA asistente de entrenamiento | 33.554.432 entrenables | No aplica | `qwen-research` | Publicado en HuggingFace; 0 descargas |
| SimpleTuner/Qwen-Image-2.1-training-assistant-v1 | LoRA asistente de entrenamiento | No disponible | No aplica | No disponible en la informacion proporcionada | Publicado en HuggingFace; entrenado solo con imagenes generadas por el modelo |
| Qwen/Qwen-Image-2.1 | Modelo base de generacion y edicion de imagen | 20.000 millones citados por SimpleTuner; 7.000 millones en el componente de generacion visual | No disponible | No disponible en la informacion proporcionada | Publicado en HuggingFace, con demo en Spaces |
| SimpleTuner/Qwen-Image-2.1-LoRA-experiments | Coleccion de adaptadores de concepto | No disponible | No aplica | No disponible en la informacion proporcionada | Publicado en HuggingFace |

## Limitaciones y advertencias

- El adaptador no genera imagenes por si mismo de forma utilizable: las muestras producidas con el asistente activado en solitario no representan la configuracion final de inferencia y no deben usarse como demostracion del modelo.
- Debe permanecer congelado y activo durante el entrenamiento downstream, y desactivarse en inferencia; usarlo de otra forma invalida el proposito para el que fue entrenado.
- No garantiza la eliminacion total de filtraciones de concepto ni de sesgos presentes en los datasets, segun reconoce explicitamente la model card.
- Los datos de e621 proceden de un tablon de imagenes con contenido potencialmente adulto, lo que puede introducir sesgos y contenidos indeseados en la distribucion de entrenamiento del asistente.
- Los datos sinteticos se generaron con el propio modelo base, lo que puede amplificar los sesgos y los artefactos preexistentes de Qwen Image 2.1.
- Los subconjuntos de datos estan acotados (128 muestras por cubo sintetico, 256 por backend real) y no son pasadas completas sobre CC12M ni sobre e621; una misma imagen puede reutilizarse entre backends de resolucion. No se configura ningun dataset Domokun y la revision de subtitulos no descarta la presencia de personajes no etiquetados en las imagenes reales.
- Las conclusiones de preservacion de coherencia y calidad se limitan a la configuracion de entrenamiento probada; no se demuestra que otras tasas de aprendizaje, datasets o duraciones se comporten igual.
- Los pesos solo se han probado con la variante Qwen Image 2.1; las variantes antiguas de Qwen Image no han sido validadas.
- La licencia `qwen-research` es una licencia de investigacion: conviene revisar el fichero `LICENSE` del repositorio antes de cualquier uso comercial.
- Estado experimental, sin descargas ni valoraciones, y sin resultados de benchmarks publicados; su adopcion en produccion requiere validacion propia.
- No se documentan idiomas soportados ni longitud de contexto, por lo que no puede asumirse cobertura multilingue en los subtitulos de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-training-assistant-v2
- Modelo base Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio de Qwen-Image-2.1 en GitHub: https://github.com/QwenLM/Qwen-Image-2.1
- Demo de Qwen-Image-2.1 en HuggingFace Spaces: https://huggingface.co/spaces/Qwen/Qwen-Image-2.1
- Coleccion de experimentos LoRA de Qwen Image 2.1: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-LoRA-experiments
- Adaptador asistente v1: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-training-assistant-v1
- Experimento extendido de fotoestetica (50.000 actualizaciones): https://huggingface.co/SimpleTuner/Qwen-Image-2.1-LoRA-photo-aesthetics-50k
- Dataset de imagenes generadas por Qwen Image 2.1: https://huggingface.co/datasets/webshart/qwen-image-2.1-generated-images
- Dataset de subtitulos estructurados de CC12M: https://huggingface.co/datasets/webshart/cc12m-structured-captions
- Indices Webshart de e621 2024: https://huggingface.co/datasets/webshart/e621-2024-webp-4Mpixel-webshart-indices
- Documentacion de SimpleTuner para Qwen Image: http://docs.simpletuner.io/quickstart/QWEN_IMAGE/
- Adaptadores para Qwen/Qwen-Image-2.1 en HuggingFace: https://huggingface.co/models?other=base_model:adapter:Qwen%2FQwen-Image-2.1&p=1&sort=trending
