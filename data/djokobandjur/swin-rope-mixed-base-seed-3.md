# djokobandjur/swin-rope-mixed-base-seed-3

## Resumen

`swin-rope-mixed-base-seed-3` es un checkpoint de investigación de clasificación de imágenes publicado por Đoko Banđur y Miloš Banđur en Hugging Face. Se trata de una variante de Swin Transformer Base en la que se sustituyen los sesgos posicionales relativos por embeddings rotatorios (RoPE) aprendidos con frecuencias mixtas, siguiendo la línea de trabajo de Heo et al. (ECCV 2024) sobre RoPE para Vision Transformers. El modelo resuelve una pregunta de investigación concreta: si un esquema de atención con ventanas desplazadas puede beneficiarse de codificación posicional rotatoria aprendida en lugar de la parametrización relativa original de Swin.

El checkpoint corresponde a la ejecución P3 de una serie de seis entrenamientos independientes sobre ImageNet-1k, con una semilla aleatoria registrada de `1773900646`. El autor reporta una accuracy Top-1 del 83,974 % sobre las 50.000 imágenes de validación de ImageNet-1k. No es un paquete `AutoModel.from_pretrained` de Transformers, sino un `final_checkpoint.pth` original de PyTorch de 1.054.162.173 bytes que requiere la implementación RoPE-ViT correspondiente para cargarse.

Su relevancia es doble: por un lado, aporta un punto de datos reproducible sobre el efecto de RoPE aprendido en arquitecturas jerárquicas con ventanas; por otro, está liberado bajo licencia BSD 3-Clause, lo que permite reutilización comercial del artefacto de pesos con las obligaciones habituales de atribución. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que lo sitúa como material de archivo científico más que como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer Base con ventanas desplazadas y RoPE mixto aprendido (vision transformer jerárquico) |
| Parametros totales | no disponible (el tamaño del fichero, 1.054.162.173 bytes, es coherente con un Swin Base, pero el autor no declara el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el autor no declara resolución de entrada ni ventana de parches) |
| Tipos de cuantizacion | no disponible (solo se publica el checkpoint original en fp32/fp16 sin conversiones) |
| Idiomas soportados | no aplica (modelo de visión; etiquetas de ImageNet en inglés) |
| Licencia | BSD 3-Clause (Copyright (c) 2026, Đoko Banđur y Miloš Banđur) |
| Formato de pesos | PyTorch pickle (`.pth`, `final_checkpoint.pth`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de la configuración Swin Transformer Base con ventanas desplazadas, la arquitectura jerárquica presentada por Liu et al. en ICCV 2021, y sustituye el mecanismo de sesgo posicional relativo por un esquema de Rotary Position Embedding (RoPE) con frecuencias mixtas y parámetros de frecuencia aprendidos. La implementación de referencia es la de Heo, Park, Han y Yun en *Rotary Position Embedding for Vision Transformer* (arXiv:2403.13298), cuyo código fuente está en el repositorio `naver-ai/rope-vit`. El autor no detalla en la model card la composición exacta de las frecuencias mixtas ni la inicialización de los parámetros rotatorios.

El entrenamiento se realizó sobre ImageNet-1k y el checkpoint publicado es el estado final de la época 299 (`PRIMARY_FINAL`). No se documentan en la información disponible el número de tokens o imágenes vistas, el presupuesto de aumento de datos, la receta de optimización, ni si hubo destilación, fine-tuning supervisado adicional o técnicas de regularización específicas. Tampoco se especifica si el checkpoint incluye estado del optimizador, aunque la model card advierte explícitamente de que podría contenerlo. La innovación técnica declarada es el uso de frecuencias rotatorias mixtas aprendidas en lugar de sesgos relativos, un cambio que afecta a cómo el modelo codifica la posición espacial dentro y entre ventanas.

## Capacidades

- Clasificación de imágenes en 1.000 clases de ImageNet-1k con la cabeza de clasificación original.
- Extracción de representaciones visuales jerárquicas a varias resoluciones, útil para tareas downstream con fine-tuning.
- Codificación posicional rotatoria aprendida, que puede inspeccionarse como objeto de estudio (el autor archiva un vector de referencia de frecuencias con SHA-256 propio).
- No soporta tool calling ni function calling: es un clasificador de visión, no un modelo generativo.
- No soporta agentes, razonamiento multi-paso ni modos de pensamiento.
- No tiene capacidades multilingües ni de generación de texto.
- No incluye capacidades de visión-lenguaje, audio ni vídeo.

## Casos de uso

- Reproducción de experimentos sobre RoPE en vision transformers: cargar el checkpoint con la implementación RoPE-ViT correspondiente y comparar la accuracy reportada (83,974 % Top-1) con la de los otros cinco checkpoints de la serie para aislar el efecto de la semilla.
- Estudio de esquemas de codificación posicional: analizar el vector de frecuencias aprendido (referenciado por SHA-256 `ee6ee0ed...`) frente a los sesgos relativos de Swin original para entender qué frecuencias prioriza el modelo en tareas de clasificación.
- Baseline en investigación de visión: usar el modelo como referencia congelada para extraer features y entrenar cabezas lineales en datasets pequeños, aprovechando la jerarquía de Swin.
- Fine-tuning supervisado en dominios específicos (médico, industrial, satelital) partiendo de un backbone preentrenado en ImageNet-1k con licencia permisiva BSD 3-Clause.
- Destilación de conocimiento: emplear las salidas del modelo como profesor para entrenar estudiantes más pequeños en pipelines de compresión de modelos.
- Auditoría de robustez: evaluar el checkpoint en distribuciones corruptas o adversariales para contrastar con la accuracy limpia reportada, dado que el autor advierte que los resultados limpios no establecen robustez.
- Verificación de integridad de artefactos: usar el SHA-256 del checkpoint para validar pipelines de MLOps que ingieren pesos de terceros.

## Benchmarks y rendimiento

| Benchmark | Dataset | Imagenes | Aciertos | Top-1 accuracy |
|---|---|---:|---:|---:|
| Clasificación limpia | ImageNet-1k validation | 50.000 | 41.987 | 83,974 % |

No se han publicado en la información disponible resultados de otros benchmarks (robustez, ImageNet-V2, ObjectNet, transferencia lineal) ni comparaciones numéricas con Swin Base original o con otros checkpoints de la serie.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El fichero de pesos ocupa 1,05 GB, lo que sugiere que en fp16 la inferencia cabe holgadamente en GPUs de consumo, pero el autor no publica estimaciones.
- GPU recomendadas: no disponible. Por tamaño de checkpoint, cualquier GPU con al menos 4-8 GB de VRAM debería poder cargar los pesos, pero la resolución de entrada y el tamaño de lote afectan al consumo real.
- Compatibilidad con GPU de consumo: probable (RTX 3060, RTX 4090, etc.) por el tamaño del artefacto, aunque no confirmada por el autor.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (son herramientas orientadas a modelos de lenguaje). El despliegue requiere la implementación PyTorch de RoPE-ViT y un script de inferencia propio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Top-1 ImageNet-1k | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| swin-rope-mixed-base-seed-3 (este) | no declarado (checkpoint de 1,05 GB) | no disponible | 83,974 % (reportado por el autor) | BSD 3-Clause | Hugging Face, formato `.pth` |
| Swin Transformer Base (original) | ~88 M | 224×224 típico | no disponible en esta ficha | MIT (upstream) | Repos oficiales Microsoft |
| DeiT-Base con RoPE (Heo et al.) | ~86 M | 224×224 típico | no disponible en esta ficha | según repo `naver-ai/rope-vit` | GitHub + pesos oficiales |

La comparación numérica directa con Swin Base original o con DeiT-RoPE no puede establecerse con los datos proporcionados; el autor no incluye una tabla comparativa frente a esos baselines en la model card.

## Limitaciones y advertencias

- El checkpoint es un artefacto de investigación, no un modelo empaquetado para `AutoModel.from_pretrained`; requiere instanciar manualmente la implementación RoPE-ViT y su configuración.
- El fichero es un pickle de PyTorch sin conversión a safetensors, lo que implica riesgo de ejecución de código arbitrario al deserializar; el propio autor advierte de ello.
- Puede contener estado del optimizador además de los pesos, lo que aumenta el tamaño y complica la carga en producción.
- Solo se ha evaluado en clasificación limpia de ImageNet-1k; no hay datos de robustez, sesgo ni rendimiento fuera de distribución.
- No se declaran sesgos conocidos, pero al entrenarse en ImageNet-1k hereda los sesgos de etiquetas y distribución de ese dataset.
- La licencia BSD 3-Clause cubre únicamente `final_checkpoint.pth`; no relicencia el código ni los pesos upstream de NAVER/Meta, cuyas condiciones son independientes.
- La citación académica es recomendada pero no constituye una condición adicional de la licencia.
- El repositorio no tiene descargas ni validación comunitaria; la reproducibilidad depende de la implementación exacta y del vector de frecuencias archivado por separado, que no se incluye en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/djokobandjur/swin-rope-mixed-base-seed-3
- Revisión original de pesos: https://huggingface.co/djokobandjur/swin-rope-mixed-base-seed-3/tree/6ed8b6a3ea2f255fd5be8d8f2d34dc3d598130c1
- Paper de RoPE para ViT (Heo et al., ECCV 2024): https://arxiv.org/abs/2403.13298
- Código de referencia NAVER AI: https://github.com/naver-ai/rope-vit
- Paper de Swin Transformer (Liu et al., ICCV 2021): https://openaccess.thecvf.com/content/ICCV2021/html/Liu_Swin_Transformer_Hierarchical_Vision_Transformer_Using_Shifted_Windows_ICCV_2021_paper.html
- Archivo de reproducibilidad en Zenodo: https://doi.org/10.5281/zenodo.24055154
