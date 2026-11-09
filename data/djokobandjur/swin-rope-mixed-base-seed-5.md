# djokobandjur/swin-rope-mixed-base-seed-5

## Resumen

`djokobandjur/swin-rope-mixed-base-seed-5` es un checkpoint de investigación de un Swin Transformer Base al que se le ha sustituido el mecanismo de atención posicional estándar por RoPE (Rotary Position Embedding) con frecuencias mixtas aprendidas. Lo publica el investigador independiente Đoko Banđur (con Miloš Banđur como coautor del archivo de reproducibilidad), y forma parte de una familia de seis ejecuciones de entrenamiento independientes (DeiT y Swin con RoPE) orientadas a estudiar representaciones de transformers de visión y parámetros de frecuencia rotatoria aprendidos.

El modelo se entrena desde cero sobre ImageNet-1k y reporta un 83,874% de top-1 en las 50.000 imágenes de validación de ImageNet-1k. No es un modelo generativo ni un modelo de lenguaje: es un clasificador de imágenes de 1.054.162.173 bytes (aproximadamente 1,05 GB) distribuido como checkpoint PyTorch nativo (`final_checkpoint.pth`), no como paquete de Hugging Face Transformers.

Su relevancia es fundamentalmente metodológica: permite reproducir y comparar el efecto de RoPE con frecuencias mixtas en una arquitectura jerárquica con ventanas desplazadas, y viene acompañado de un archivo de reproducibilidad numérica en Zenodo con DOI propio. La licencia es BSD 3-Clause, lo que facilita su reutilización en investigación y en productos comerciales con atribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Swin Transformer Base con ventanas desplazadas y RoPE de frecuencias mixtas aprendidas (RoPE-Mixed) |
| Parámetros totales | no disponible (el tamaño del fichero es de 1.054.162.173 bytes; no se desglosa el recuento de parámetros en la información disponible) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de visión; la resolución de entrada y el tamaño de parche no se detallan en la información disponible) |
| Tipos de cuantización | no disponible (solo se distribuye el checkpoint original en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo lingüístico; la tarea es clasificación de imágenes) |
| Licencia | BSD 3-Clause (aplica a `final_checkpoint.pth`) |
| Formato de pesos | PyTorch nativo (`.pth`), serializado con pickle; no es `safetensors` ni un paquete `AutoModel` de Transformers |

## Arquitectura y entrenamiento

La arquitectura es un Swin Transformer Base con la configuración de ventanas desplazadas estándar, modificada para incorporar RoPE con frecuencias mixtas aprendidas, siguiendo el trabajo de Heo, Park, Han y Yun, *Rotary Position Embedding for Vision Transformer* (ECCV 2024, arXiv:2403.13298) y su implementación de referencia en `naver-ai/rope-vit`. El modelo se entrena desde cero (no es un reajuste de pesos preentrenados de terceros) sobre ImageNet-1k durante 300 épocas; el checkpoint publicado corresponde a la época 299, marcado como `PRIMARY_FINAL`.

La ejecución está identificada como P5 (índice ordinal, no semilla), con semilla aleatoria registrada `490800448`. El autor documenta dos huellas criptográficas: el SHA-256 del checkpoint (`bbd923c043a2ab3dbdc10dcc8c0ab9e33b3d0c78f84991e11e1769fa5bb57acc`) y el SHA-256 de un vector de referencia de frecuencias (`8edf15b7430d2f4c1a99eaa78dcc5e7526a00ba3168d2a3a71769f4b8b33a7b7`), que se archiva por separado y no se incluye en el repositorio. No se detallan en la información disponible la composición exacta del dataset más allá de ImageNet-1k, las técnicas de regularización, el régimen de aumento de datos ni si hubo destilación o ajuste fino posterior.

## Capacidades

- Clasificación de imágenes en 1.000 clases de ImageNet-1k.
- Extracción de representaciones visuales jerárquicas propias de Swin (útil como backbone congelado para tareas aguas abajo).
- Modelado de posición relativa mediante RoPE con frecuencias mixtas, lo que permite estudiar la extrapolación posicional en transformers de visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión generativa, audio ni ninguna otra modalidad.
- No incluye cabeza de detección, segmentación ni generación; es una cabeza de clasificación.

## Casos de uso

- Reproducción de investigación en posicionamiento rotatorio: cargar el checkpoint con la implementación RoPE-ViT emparejada y comparar la precisión frente a las otras cinco ejecuciones de la familia para aislar el efecto de las frecuencias mixtas aprendidas.
- Backbone congelado para transferencia: usar las características del tronco Swin como extractor en datasets pequeños de clasificación médica o industrial, sustituyendo la cabeza de 1.000 clases.
- Evaluación de robustez: someter el modelo a corrupciones (ImageNet-C), cambios de resolución o distribuciones desplazadas para medir si RoPE-Mixed mejora la generalización posicional frente a posiciones absolutas aprendidas.
- Auditoría de representaciones: analizar mapas de atención y estadísticas de los parámetros de frecuencia para estudiar cómo se distribuyen las rotaciones por cabeza y por etapa.
- Línea base en experimentos de arquitectura: comparar variantes de Swin con y sin RoPE en el mismo pipeline de entrenamiento, usando este checkpoint como referencia de la configuración Base.
- Docencia y divulgación: ejemplo reproducible y con checksum verificable de un entrenamiento completo de 300 épocas sobre ImageNet-1k, útil para cursos de visión por computador.
- Verificación de integridad en pipelines MLOps: el SHA-256 documentado permite validar la procedencia del artefacto en un registro de modelos interno.

## Benchmarks y rendimiento

| Dataset | Imágenes | Aciertos | Top-1 |
|---|---:|---:|---:|
| ImageNet-1k validation | 50.000 | 41.937 | 83,874% |

No se han publicado en la información disponible resultados de otros benchmarks (ImageNet-V2, ImageNet-C, transferencia a COCO o ADE20k) ni comparaciones numéricas con los otros cinco checkpoints de la familia.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa aproximadamente 1,05 GB en precisión de entrenamiento; con estado de optimizer incluido el consumo en carga puede ser mayor. Para inferencia en FP32 se puede estimar en torno a 4-6 GB contando activaciones a resolución típica de 224×224, aunque no se dispone de una medición publicada.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para inferencia en FP32; A100 o H100 si se quiere alto throughput en batch.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090 para inferencia; el entrenamiento completo a 300 épocas sobre ImageNet-1k requiere varias GPU de gama alta.
- Opciones de despliegue: al ser un `.pth` nativo sin integración con Transformers, no es directamente compatible con vLLM, TGI ni Ollama. Requiere cargar con `torch.load` sobre la implementación RoPE-ViT emparejada y exportar a TorchScript u ONNX para servir. `llama.cpp` no aplica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Top-1 ImageNet-1k | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| swin-rope-mixed-base-seed-5 (este) | no disponible | no disponible | 83,874% | BSD 3-Clause | Hugging Face, checkpoint `.pth` |
| Swin Transformer Base (Liu et al., ICCV 2021) | ~88 M (referencia de la arquitectura) | 224×224 típico | no disponible en esta ficha | MIT (según release original) | Repositorios oficiales de Microsoft |
| RoPE-ViT (Heo et al., ECCV 2024) | varía por configuración | 224×224 típico | no disponible en esta ficha | según release de NAVER AI | GitHub `naver-ai/rope-vit` |
| Otras ejecuciones de la familia DeiT/Swin RoPE del mismo autor | no disponible | no disponible | no disponible | BSD 3-Clause | Hugging Face, mismo autor |

Las cifras de los modelos comparables no se han verificado en la información proporcionada; se indican como no disponibles para no inventar datos.

## Limitaciones y advertencias

- Checkpoint de investigación con 0 descargas y 0 likes en el momento de la consulta: no ha pasado por una validación comunitaria amplia.
- No es un paquete `AutoModel.from_pretrained`; requiere instanciar la implementación RoPE-ViT emparejada y la configuración exacta antes de cargar los pesos. El ejemplo de carga end-to-end aún no se ha publicado según la model card.
- El fichero `.pth` es un pickle de PyTorch y puede ejecutar código arbitrario durante la deserialización. Cargar solo desde fuentes de confianza y usar modos de carga seguros cuando sea compatible.
- El checkpoint puede contener estado de optimizer o de entrenamiento además de los pesos; hay que filtrar las claves antes de usarlo en inferencia.
- Solo se han registrado resultados en ImageNet-1k limpio; no se establece robustez ante corrupciones, cambios de resolución ni dominios distintos.
- Riesgo de sesgo heredado de ImageNet-1k en las 1.000 clases y en la distribución de las imágenes de entrenamiento.
- No procesa texto ni otros idiomas: cualquier expectativa multilingüe o multimodal es inaplicable.
- La licencia BSD 3-Clause cubre `final_checkpoint.pth`, pero no relicencia el código ni los pesos upstream de NAVER/Meta; hay que respetar las licencias de la implementación de referencia y de Swin.
- La cita académica es recomendada, no una condición adicional de la licencia, pero conviene incluirla junto con el SHA-256 y la revisión exacta del repositorio.
- El vector de referencia de frecuencias no se incluye en el repositorio; solo se publica su hash, lo que limita la reproducibilidad completa del análisis de frecuencias sin acudir al archivo de Zenodo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/djokobandjur/swin-rope-mixed-base-seed-5
- Revisión exacta de los pesos: https://huggingface.co/djokobandjur/swin-rope-mixed-base-seed-5/tree/97293cfdf59391d9bf318853c3841116e33302e2
- Paper de RoPE para Vision Transformer (Heo et al., ECCV 2024): https://arxiv.org/abs/2403.13298
- Código de referencia RoPE-ViT (NAVER AI): https://github.com/naver-ai/rope-vit
- Paper de Swin Transformer (Liu et al., ICCV 2021): https://openaccess.thecvf.com/content/ICCV2021/html/Liu_Swin_Transformer_Hierarchical_Vision_Transformer_Using_Shifted_Windows_ICCV_2021_paper.html
- Archivo de reproducibilidad en Zenodo: https://doi.org/10.5281/zenodo.24055154
- Dataset ImageNet-1k: https://huggingface.co/datasets/ILSVRC/imagenet-1k
