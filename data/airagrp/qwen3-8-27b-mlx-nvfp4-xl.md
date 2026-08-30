# airagrp/Qwen3.8-27B-mlx-nvfp4-XL

## Resumen

El modelo `airagrp/Qwen3.8-27B-mlx-nvfp4-XL` es una conversión al formato MLX del modelo multimodal `Qwen/Qwen3.8-27B` de Alibaba, realizada por el usuario de HuggingFace `airagrp`. Se trata de un modelo denso de 27 mil millones de parámetros que procesa imágenes, vídeo y texto, y que aquí se distribuye con una receta de cuantización mixta: las capas MLP se cuantizan a 4 bits usando el formato nvfp4, mientras que la atención, los embeddings y la torre de visión se mantienen en bfloat16. El resultado es un checkpoint de aproximadamente 31 GB (8.8 bits por peso de media), frente a los ~54 GB del modelo original en bf16, lo que facilita su ejecución en hardware Apple Silicon con memoria unificada.

La relevancia de este modelo radica en que acerca un modelo multimodal de gran tamaño a entornos locales y de bajo presupuesto, sin renunciar a la calidad del modelo original. Además, incorpora la cabeza MTP (Multi-Token Prediction) nativa fusionada en el checkpoint, lo que permite usar decodificación especulativa en mlx-vlm para acelerar la generación. El repo está pensado para usarse con la librería `mlx-vlm` y sigue la licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) basado en Qwen3.8-27B |
| Parametros totales | 27B (modelo base); el repo MLX reporta 14.746.050.288 tensores en safetensors (probablemente solo los pesos cuantizados) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | nvfp4 (4 bits, group_size=16) en MLP; bfloat16 en atencion, embeddings, salida, MTP y torre de vision |
| Idiomas soportados | Ingles (declarado en la model card; el modelo base Qwen3.8-27B es multilingue, pero no se especifica en este repo) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo es una conversión directa del checkpoint `Qwen/Qwen3.8-27B` al formato MLX, realizada con `mlx-vlm` versión 0.6.17. No se ha realizado ningún entrenamiento adicional; se trata de una adaptación de pesos. La receta de cuantización mixta es la siguiente: las proyecciones MLP (`gate_proj`, `up_proj`, `down_proj`) de las 64 capas se cuantizan a 4 bits con nvfp4 (group_size=16), mientras que las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) se mantienen en bfloat16 en 16 de las capas y en las otras 48 se usa atención lineal GDN (también en bf16). Los embeddings de token, la cabeza de salida, la cabeza MTP y la torre de visión se conservan íntegramente en bfloat16.

El checkpoint incluye la cabeza MTP (Multi-Token Prediction) nativa del modelo base, fusionada como tensores `language_model.mtp.*` en un archivo `mtp.safetensors`. Esta cabeza permite usar decodificación especulativa (`--draft-kind mtp` en mlx-vlm) para acelerar la inferencia, aunque su uso es opcional y no afecta a la generación base. La detección de módulos cuantizados se realiza mediante la presencia de tensores `.scales`.

## Capacidades

- Generacion de texto y comprension de lenguaje natural, basada en el modelo Qwen3.8-27B.
- Procesamiento multimodal de imagenes: puede recibir una o varias imagenes como entrada y responder preguntas sobre ellas, describir su contenido o razonar sobre elementos visuales.
- Procesamiento de video: el modelo base Qwen3.8-27B es capaz de entender secuencias de video (aunque la model card de este repo no detalla el formato de entrada).
- Respuestas en formato conversacional multi-turno.
- Decodificacion especulativa mediante la cabeza MTP integrada, que reduce la latencia en generacion de texto.
- Soporte de tool calling y agentes: no se menciona en la model card de este repo, pero el modelo base Qwen3.8-27B lo incluye; no se puede confirmar en esta version.

## Casos de uso

- Asistente visual para soporte tecnico: un usuario puede enviar una captura de pantalla o foto de un error y el modelo explica el problema y sugiere soluciones, gracias a su capacidad de razonamiento multimodal.
- Analisis de documentos escaneados: extraer informacion relevante de facturas, formularios o contratos a partir de imagenes, combinando OCR implicito con comprension de lenguaje.
- Descripcion y busqueda de contenido audiovisual: generar subtitulos o resumenes de clips de video para archivado o accesibilidad, aprovechando la entrada de video del modelo base.
- Creacion de contenido educativo: generar explicaciones paso a paso a partir de diagramas o graficos enviados por el estudiante, adaptando el nivel de detalle segun la pregunta.
- Automatizacion de tareas de oficina: procesar imagenes de pizarras, notas manuscritas o esquemas y convertirlas en texto estructurado o listas de tareas.
- Desarrollo de demos y prototipos en Apple Silicon: al ser un checkpoint MLX ligero (31 GB), permite ejecutar inferencia multimodal en una Mac con 48 GB o más de RAM unificada, ideal para pruebas locales sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la ficha original de `Qwen/Qwen3.8-27B` para datos de rendimiento, pero no se incluyen en este repositorio. No se dispone de comparaciones cuantitativas con otros modelos en esta conversion.

## Requisitos de hardware

- El formato MLX requiere hardware Apple Silicon (M1, M2, M3, M4 o posteriores). No funciona en GPU NVIDIA o AMD.
- Memoria unificada estimada: al menos 40-48 GB para cargar el checkpoint de ~31 GB y dejar margen para la activacion y el procesamiento de imagenes. Se recomienda 64 GB para uso comodo con batch grande o video.
- GPU integrada en Apple Silicon: la GPU de la propia Mac se usa para inferencia; no hay requisito de GPU externa.
- Despliegue: se usa con la libreria `mlx-vlm` (pip install mlx-vlm) o con el CLI `mlx_vlm.generate`. Tambien se puede cargar directamente con MLX estandar.
- Latencia y throughput: no se han publicado mediciones. La decodificacion especulativa con MTP puede acelerar la generacion, pero los datos concretos dependen del hardware y del prompt.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. El modelo se puede comparar con su version original sin cuantizar (`Qwen/Qwen3.8-27B`), que ocupa ~54 GB en bf16 y requiere mas memoria. En el ecosistema MLX existen otros modelos multimodales como `mlx-community/Qwen2.5-VL-7B` o `mlx-community/Llama-3.2-11B-Vision`, pero no se han encontrado benchmarks que permitan comparar directamente con esta conversion especifica. Se recomienda consultar la ficha original del modelo base para ver comparativas con otros modelos de tamano similar.

## Limitaciones y advertencias

- El modelo se distribuye unicamente con soporte declarado para ingles (`language: en`). Aunque el modelo base es multilingue, esta conversion no documenta otros idiomas; puede haber degradacion en lenguas distintas del ingles.
- La cuantizacion nvfp4 de las capas MLP puede introducir una ligera perdida de precision en tareas muy sensibles a los detalles numericos, aunque en la practica el impacto suele ser minimo.
- Riesgo de alucinacion inherente a todos los modelos de lenguaje, especialmente en tareas de razonamiento visual complejo o cuando la imagen es ambigua.
- No se ha verificado el soporte de tool calling o agentes en esta conversion; si se necesita esa funcionalidad, se debe probar explicitamente con mlx-vlm.
- El checkpoint de safetensors reporta 14.7B parametros, pero el modelo base tiene 27B; esta discrepancia se debe probablemente a que los pesos cuantizados se almacenan con un esquema de compresion distinto (nvfp4) y no todos los tensores se cuentan igual. No se debe interpretar como un modelo mas pequeno.
- Para uso en produccion, se recomienda validar el comportamiento del modelo en el hardware objetivo, ya que la latencia y el consumo de memoria pueden variar segun la configuracion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/airagrp/Qwen3.8-27B-mlx-nvfp4-XL
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Repositorio GitHub de Qwen3.8-27B (AlibabaCloud): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guia de ejecucion local de Qwen 3.8 27B: https://locallyuncensored.com/blog/how-to-run-qwen-3-8-27b-locally.html
- Libreria mlx-vlm: https://github.com/Blaizzy/mlx-vlm
