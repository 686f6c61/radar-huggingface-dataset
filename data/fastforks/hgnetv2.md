# fastforks/hgnetv2

## Resumen

HGNetV2 (PP-HGNetV2) es una familia de clasificadores de imagen convolucionales desarrollados originalmente en PaddlePaddle y portados a PyTorch a traves de la libreria `timm`. La arquitectura se basa en bloques de agregacion con convoluciones ligeras de 5x5, disenada para obtener una relacion calidad/coste computacional favorable en tareas de clasificacion de imagenes. El repositorio `fastforks/hgnetv2` es una model card sin pesos: actua como manifiesto que descarga los pesos de los repositorios originales del autor y verifica su integridad mediante SHA-256.

El modelo se distribuye en siete variantes (b0 a b6) con distintos tamanos y costes de inferencia, todas preentrenadas con destilacion SSLD (Self-Supervised Learning Distillation) sobre ImageNet-21k/22k y afinadas posteriormente sobre ImageNet-1k. La entrada es una unica imagen RGB de 224x224 y la salida son logits sobre las 1000 clases de ImageNet-1k. Es relevante para desarrolladores que necesitan un backbone convolucional ligero, con licencia Apache-2.0 y pesos verificables criptograficamente, integrable en pipelines de clasificacion o como extractor de caracteristicas.

La ficha corresponde a un paquete experimental (tier experimental) de la libreria `fastforks`, con backend `portable` y soporte previsto de kernels especializados (sin datos de rendimiento para estos ultimos en la informacion disponible). No se trata de un modelo de lenguaje: no genera texto ni soporta instrucciones, tool calling ni razonamiento multi-paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (HGNetV2, bloques de agregacion con convoluciones ligeras de 5x5) |
| Parametros totales | no disponible (siete variantes b0-b6; cifras por variante no publicadas en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de imagen 224x224 (redimensionado lado corto 232 y recorte central) |
| Tipos de cuantizacion | no disponible (se reportan pruebas en fp16) |
| Idiomas soportados | no disponible (tarea de vision; clases de ImageNet-1k en ingles) |
| Licencia | Apache-2.0 (codigo y pesos; uso comercial permitido) |
| Formato de pesos | safetensors (pesos alojados en repositorios `timm` del autor) |

## Arquitectura y entrenamiento

HGNetV2 es una red neuronal convolucional pura (sin atencion) organizada en bloques de agregacion que combinan convoluciones ligeras de 5x5 para ampliar el campo receptivo con un coste computacional reducido. La familia se escalona en siete variantes (b0 a b6) que incrementan progresivamente profundidad y ancho; la variante b6 es la mas costosa (16,5 ms por inferencia en fp32 original y 465 MiB de memoria pico asignada, segun los datos del autor). El modelo se entreno con destilacion SSLD en dos etapas sobre ImageNet-21k/22k (version completa de ImageNet, release de otono de 2011) y afinado despues sobre ImageNet-1k (ILSVRC 2012). No se documentan en la informacion proporcionada detalles sobre composicion exacta del dataset, numero de tokens (no aplica) ni tecnicas de RLHF/DPO (no aplica a vision).

Como innovacion destacable, el paquete `fastforks` implementa un backend `portable` que reduce el tiempo de inferencia y la memoria pico respecto a la implementacion original: por ejemplo, b0 pasa de 5,89 ms (original) a 3,46 ms (portable) y de 68 MiB a 48 MiB asignados. Existe un backend `kernels` previsto (repositorio `fastforks/kernels`), pero no se han publicado metricas de rendimiento para el en la informacion disponible. La integridad de los pesos se verifica mediante SHA-256 (hashes completos en `card.toml` del repositorio de codigo).

## Capacidades

- Clasificacion de imagenes en las 1000 clases de ImageNet-1k, con salida de logits.
- Extraccion de caracteristicas visuales (backbone convolucional reutilizable para tareas downstream).
- Inferencia sobre una unica imagen RGB de 224x224 con preprocesado fijo (redimensionado y recorte central).
- Ejecucion en GPU CUDA con precision fp16 (probado en RTX 5060 Ti 16 GB).
- Verificacion de integridad de pesos mediante SHA-256 antes de la carga.
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No dispone de modo thinking, vision generativa, audio ni entrada multimodal mas alla de la imagen.

## Casos de uso

- Clasificacion de imagenes en produccion: el modelo devuelve logits sobre ImageNet-1k en 3,46 ms (b0, backend portable, fp16) con 48 MiB de memoria pico, adecuado para servicios de etiquetado de alta concurrencia.
- Etiquetado automatico de catalogos de producto: las variantes b0-b2 ofrecen el menor coste (3,46-4,55 ms) y permiten procesar lotes grandes de imagenes en una sola GPU consumer.
- Filtrado y moderacion de contenido visual: la inferencia por debajo de 10 ms en todas las variantes permite integrar el clasificador en pipelines de ingesta sin cuello de botella.
- Backbone para transfer learning: al ser un CNN ligero con pesos Apache-2.0, se puede reentrenar la cabeza de clasificacion para dominios especificos (medico, industrial, satelital) con coste de ajuste bajo.
- Extraccion de embeddings visuales: las representaciones intermedias sirven para busqueda por similitud o clustering de imagenes en sistemas de recomendacion.
- Despliegue en entornos con GPU limitada: la variante b0 reserva 0,1 GiB y cabe holgadamente en GPUs consumer de gama media, lo que facilita prototipado y edge computing con CUDA.
- Validacion de pipelines de vision: los hashes SHA-256 publicados permiten auditar la procedencia de los pesos en entornos regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision (top-1/top-5 en ImageNet) en la informacion disponible. Los unicos datos numericos facilitados son de latencia y memoria en inferencia sintetica (fp16, RTX 5060 Ti 16 GB):

| Variante | Tiempo original fp32 (ms) | Tiempo portable (ms) | Memoria pico asignada original (MiB) | Memoria pico portable (MiB) |
|---|---|---|---|---|
| b0 | 4,45 | 3,46 | 68 | 48 |
| b1 | 4,57 | 3,47 | 70 | 50 |
| b2 | 6,25 | 4,55 | 98 | 59 |
| b3 | 7,16 | 5,22 | 127 | 76 |
| b4 | 7,06 | 4,53 | 147 | 82 |
| b5 | 11,4 | 7,04 | 260 | 114 |
| b6 | 16,5 | 9,44 | 465 | 198 |

Tiempos de carga y primera llamada (segundos): b0 0,19/1,36 (original) y 1,67/0,73 (portable); b1 0,31/0,31 (original) y 1,87/0,40 (portable); b2 0,23/0,59 (original) y 1,79/0,39 (portable). No hay datos de rendimiento para el backend `kernels`.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de precision ni comparaciones con otras familias de clasificadores (ResNet, EfficientNet, ConvNeXt, etc.), por lo que no es posible establecer una comparativa rigurosa sin inventar cifras.

## Limitaciones y advertencias

- El repositorio no aloja pesos: requiere descargar los ficheros de los repositorios `timm` del autor y verificar el SHA-256; un fallo de red o un hash distinto impide la carga.
- Entrada fija de 224x224: no admite resoluciones arbitrarias sin reentrenamiento o ajuste del preprocesado.
- Solo clasifica en las 1000 clases de ImageNet-1k; fuera de ese vocabulario la salida no es semanticamente valida.
- Riesgo de sesgo heredado de ImageNet-21k/22k y ImageNet-1k: desequilibrios demograficos y de representacion de clases en los datos de entrenamiento.
- Riesgo de alucinacion en el sentido de clasificaciones erroneas con alta confianza en imagenes fuera de distribucion; no hay calibracion documentada.
- Tier experimental: la API de `fastforks` y los identificadores de variante (`@1`) pueden cambiar; no se recomienda como dependencia critica sin fijar version.
- El backend `kernels` no tiene metricas publicadas; el rendimiento real en produccion debe medirse en el hardware objetivo.
- Uso comercial permitido por licencia Apache-2.0, pero la model card advierte de que las cadenas de licencia del codigo original se registran tal cual y deben revisarse antes de otros usos.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/hgnetv2
- Codigo de fastforks: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Codigo original (pytorch-image-models, commit 0df212b369a5): https://github.com/huggingface/pytorch-image-models
- Pesos b0: https://huggingface.co/timm/hgnetv2_b0.ssld_stage2_ft_in1k
- Pesos b1: https://huggingface.co/timm/hgnetv2_b1.ssld_stage2_ft_in1k
- Pesos b2: https://huggingface.co/timm/hgnetv2_b2.ssld_stage2_ft_in1k
- Pesos b3: https://huggingface.co/timm/hgnetv2_b3.ssld_stage2_ft_in1k
- Pesos b4: https://huggingface.co/timm/hgnetv2_b4.ssld_stage2_ft_in1k
- Pesos b5: https://huggingface.co/timm/hgnetv2_b5.ssld_stage2_ft_in1k
- Pesos b6: https://huggingface.co/timm/hgnetv2_b6.ssld_stage2_ft_in1k
- Evidencia de licencia: https://huggingface.co/timm/hgnetv2_b0.ssld_stage2_ft_in1k/blob/9e0a904b210d65e4fcd6582f8ca6e0921fac2650/README.md
- Hashes completos (card.toml): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/classification/models/hgnetv2/card.toml
