# airagrp/Ornith-1.5-35B-A3B-mlx-nvfp4

## Resumen

Ornith-1.5-35B-A3B-mlx-nvfp4 es una conversión a formato MLX del modelo multimodal Ornith-1.5-35B-A3B, desarrollado originalmente por Ornith AI y adaptado por airagrp. Se trata de un modelo de arquitectura Mixture of Experts (MoE) basada en Qwen3.5, con 35.951.822.704 parámetros totales y alrededor de 3.000 millones de parámetros activos por token, según la nomenclatura del propio modelo. El checkpoint está pensado para ejecutarse en Apple Silicon mediante la librería mlx-vlm en su versión 0.6.17.

La principal innovación de esta versión es su receta de cuantización de precisión mixta: la mayoría de los módulos (expertos MoE, atención completa y atención lineal GDN) se cuantizan en nvfp4 con group_size=16 y 4 bits, mientras que los campos más sensibles —como embeddings, lm_head, el head MTP y la vision tower— se mantienen en bfloat16. El resultado es un tamaño efectivo de unos 24 GB, frente a los aproximadamente 67 GB del modelo base en bfloat16. Además, el head nativo MTP (Multi-Token Prediction) está integrado en el propio checkpoint, lo que permite decodificación especulativa sin necesitar un modelo drafter separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE basada en Qwen3.5 (qwen3_5_moe), multimodal con vision tower, atencion hibrida (full attention + linear attention GDN) |
| Parametros totales | 35.951.822.704 |
| Parametros activos | Aproximadamente 3.000 millones (inferido de la nomenclatura "A3B"; no se especifica en la documentacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | nvfp4 (group_size=16, bits=4) para la mayoria de capas; bfloat16 para embeddings, lm_head, MTP head y vision tower. Peso efectivo: ~5.2 bits por parametro |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | Safetensors (MLX, layout estandar de MLX con tensores .scales para deteccion de precision) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Qwen3.5 MoE, combinando capas de atencion completa y capas de atencion lineal. Dentro del checkpoint se distinguen 10 capas con atencion completa (con proyecciones q_proj, k_proj, v_proj y o_proj) y 30 capas con atencion lineal GDN (con proyecciones in_proj_* y out_proj). El bloque MoE incluye un router con 256x8 expertos y un experto compartido distribuido en 40 capas. Además, el modelo incorpora una vision tower en bfloat16 para procesar imagenes y video, lo que le permite operar como pipeline de imagen-texto-a-texto.

Sobre el entrenamiento no se dispone de informacion detallada en la documentacion proporcionada: no se especifican el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas como RLHF o DPO. La innovacion tecnica mas destacable de esta conversion es el uso de una cuantizacion mixta nvfp4 personalizada y la integracion del head MTP, que actua como mecanismo nativo de decodificacion especulativa dentro del propio checkpoint. Los tensores .scales presentes en los modulos cuantizados permiten a mlx-vlm detectar automaticamente la precision de cada modulo.

## Capacidades

- Generacion de texto y comprension multimodal de imagenes y video, gracias a la vision tower y al pipeline image-text-to-text.
- Decodificacion especulativa mediante el head MTP integrado, que puede activarse con `--draft-kind mtp` en mlx-vlm para acelerar la generacion.
- Ejecucion nativa en Apple Silicon a traves de MLX, con carga directa mediante `mlx_vlm.load` y `mlx_vlm.generate`.
- Cuantizacion mixta nvfp4 que reduce significativamente el consumo de memoria unificada manteniendo en bfloat16 las capas mas sensibles a la perdida de precision.
- Uso de atencion hidrida (completa + lineal), lo que puede resultar relevante en contextos largos o en tareas que combinan dependencias locales y globales.
- Soporte de entrada de texto en ingles, como unico idioma confirmado en la model card.

## Casos de uso

- Analisis de contenido audiovisual en macOS: gracias a la vision tower y al formato MLX, el modelo puede integrarse en aplicaciones nativas para generar descripciones de escenas, responder preguntas sobre fotogramas o resumir fragmentos de video. La cuantizacion nvfp4 permite ejecutarlo en Macs con 32 GB de memoria unificada o mas.
- Asistente de investigacion multimodal en Apple Silicon: un investigador puede cargar el modelo con mlx-vlm y realizar consultas sobre graficos, diagramas o capturas de pantalla directamente desde un notebook sin necesidad de servidores externos.
- Prototipado de pipelines de video-pregunta-respuesta: gracias a que el checkpoint incluye el head MTP integrado, se puede construir un sistema de preguntas y respuestas sobre video con decodificacion especulativa, reduciendo la latencia en generaciones largas.
- Reduccion de costes en despliegue local: frente a los ~67 GB del modelo base en bfloat16, esta version ocupa unos 24 GB y mantiene en bfloat16 los modulos de salida y la vision tower, lo que la hace adecuada para entornos con memoria limitada.
- Evaluacion de arquitecturas MoE con atencion lineal: el modelo permite comparar el comportamiento de una mezcla de atencion completa y lineal en tareas de vision-lenguaje, especialmente en entornos Apple Silicon.
- Generacion de documentacion tecnica a partir de video e imagenes: se puede automatizar la creacion de descripciones de tutoriales o demostraciones visuales en ingles, aprovechando la capacidad de procesar imagenes y video del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria unificada estimada: ~24 GB para el checkpoint cuantizado, incluyendo los modulos en bfloat16. Se recomiendan al menos 32 GB de memoria unificada para un uso comodo con margen para el procesamiento de imagenes y video.
- GPU recomendada: cualquier chip Apple Silicon (M1, M2, M3 o M4) con suficiente memoria unificada. Al tratarse de un checkpoint MLX, no es directamente ejecutable en GPU de NVIDIA o AMD sin una conversion adicional.
- Capacidad para consumidores: si, en Macs de gama alta con 32 GB o mas de memoria unificada. Deberia poder cargarse en Macs con 24 GB si se optimiza el modo de memoria, aunque no esta garantizado.
- Opciones de despliegue: mlx-vlm 0.6.17 es la via recomendada, tanto mediante la API de Python como con la CLI `mlx_vlm.generate`. Tambien puede cargarse directamente con MLX si se respeta el layout de safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Tamano aproximado | Precision de cuantizacion | Licencia |
|---|---|---|---|---|
| ornith-ai/Ornith-1.5-35B-A3B (base) | Safetensors bfloat16 | ~67 GB | bfloat16 | MIT |
| ornith-ai/Ornith-1.5-35B-A3B-NVFP4 | NVFP4 | no disponible | nvfp4 | MIT |
| airagrp/Ornith-1.5-35B-A3B-mlx-nvfp4 | MLX + nvfp4 mixto | ~24 GB | nvfp4 (group_size=16, bits=4) + bfloat16 | MIT |
| airagrp/Ornith-1.5-35B-A3B-mlx-mxfp8 | MLX + mxfp8 | no disponible | mxfp8 | MIT |

Todas las variantes pertenecen al mismo modelo base, por lo que las diferencias principales estan en el formato de ejecucion, la precision de cuantizacion y el consumo de memoria.

## Limitaciones y advertencias

- Solo se confirma el idioma ingles en la model card; no se proporciona informacion sobre soporte de otros idiomas.
- No se han publicado benchmarks ni evaluaciones de seguridad, por lo que no se puede estimar el riesgo de alucinacion ni la calidad real frente a otros modelos.
- El formato es exclusivo de MLX para Apple Silicon; no es compatible directamente con vLLM, llama.cpp, TGI ni entornos CUDA sin una conversion adicional.
- La cuantizacion nvfp4 puede degradar ligeramente la precision del modelo en comparacion con bfloat16, especialmente en los expertos MoE y en las capas de atencion, aunque no se dispone de mediciones que cuantifiquen ese efecto.
- El head MTP esta fusionado en el checkpoint como tensores `language_model.mtp.*` en bfloat16; si no se utiliza la decodificacion especulativa, estos tensores suponen un overhead de almacenamiento sin beneficio funcional.
- No se detallan los datos de entrenamiento ni la composicion del dataset, lo que limita la capacidad de evaluar sesgos potenciales.
- Para un uso productivo conviene disponer de una Mac con al menos 32 GB de memoria unificada; en equipos con menos memoria la carga podria ser inviable o requerir reducir el contexto de procesamiento.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/airagrp/Ornith-1.5-35B-A3B-mlx-nvfp4
- Modelo base original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Variante con cuantizacion NVFP4 original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-NVFP4
- Variante con cuantizacion mxfp8 en MLX: https://huggingface.co/airagrp/Ornith-1.5-35B-A3B-mlx-mxfp8
- Repositorio de mlx-vlm: https://github.com/Blaizzy/mlx-vlm
