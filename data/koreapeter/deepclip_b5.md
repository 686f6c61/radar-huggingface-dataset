# KoreaPeter/deepclip_b5

## Resumen

DeepCLIP b5 (identificador `KoreaPeter/deepclip_b5`) es un modelo de clasificación de imagen y vídeo orientado a la detección de deepfakes faciales (*face forgery detection*). Lo desarrolla el usuario KoreaPeter y se distribuye a través de Hugging Face con acceso restringido (gated). El modelo parte de un backbone EfficientNet-B5 preentrenado (`timm/tf_efficientnet_b5.ns_jft_in1k`) y lo ajusta mediante fine-tuning para la tarea de clasificación binaria entre rostros auténticos y manipulados, incorporando componentes de explicabilidad según indican sus etiquetas (`explainability`, `DeepClip`, `CLIP`).

Con 53.031.484 parámetros totales y un repositorio de apenas 0,2 GB, se trata de un modelo compacto pensado para inferencia eficiente, no para generación de texto. Su pipeline declarado en Hugging Face es `video-classification`, lo que sugiere que opera sobre secuencias de fotogramas faciales para emitir un veredicto de autenticidad, aunque también aparece etiquetado como `image-classification`.

Su relevancia actual radica en la proliferación de contenido sintético (deepfakes, face swaps, manipulaciones de expresión) y la necesidad de herramientas de verificación forense que sean ligeras, desplegables en infraestructura modesta y con licencia permisiva (MIT). No obstante, la información pública disponible es muy limitada: no se documentan datos de entrenamiento, benchmarks ni detalles de arquitectura más allá del backbone.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN (EfficientNet-B5 como backbone) con componentes adicionales de explicabilidad no detallados |
| Parámetros totales | 53.031.484 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización no documentada) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre `timm/tf_efficientnet_b5.ns_jft_in1k`, un EfficientNet-B5 preentrenado en ImageNet (con la variante de *Noisy Student* y fine-tuning supervisado de JFT). EfficientNet-B5 emplea *compound scaling* para equilibrar profundidad, anchura y resolución, y en su configuración estándar opera con entradas de 456×456 píxeles. Sobre este backbone, DeepCLIP b5 aplica un fine-tuning para la tarea de detección de falsificaciones faciales, aunque el repositorio no especifica la cabeza de clasificación exacta ni cómo se integran los componentes asociados a CLIP y a la explicabilidad.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset (por ejemplo, FaceForensics++, DFDC, Celeb-DF), el uso de RLHF/DPO (no aplicable en visión) ni innovaciones técnicas concretas como atención lineal o decodificación especulativa. Las etiquetas `DeepFake-Detection`, `face-forgery` y `video-classification` indican el dominio de aplicación, pero no los detalles metodológicos. Cualquier afirmación sobre el proceso de entrenamiento más allá del backbone sería especulativa.

## Capacidades

- Clasificación de imágenes faciales como auténticas o manipuladas (detección de deepfakes).
- Procesamiento de vídeo a nivel de fotograma o secuencia, según el pipeline `video-classification` declarado.
- Detección de falsificaciones faciales (*face forgery detection*) en el dominio de la verificación forense.
- Componentes de explicabilidad asociados a la etiqueta `explainability`, aunque su funcionamiento concreto no está documentado.
- Integración con la librería `transformers` y pesos en `safetensors`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).
- No se documentan capacidades de visión general más allá de la clasificación de rostros.

## Casos de uso

- Moderación de contenido en plataformas: el modelo puede clasificar fotogramas de vídeos subidos por usuarios para marcar posibles deepfakes antes de su publicación, aprovechando su tamaño compacto (53 M de parámetros) para procesar lotes en CPU o GPU modesta.
- Verificación periodística: redacciones pueden pasar clips cortos por el modelo como primera señal de alarma ante material audiovisual sospechoso, complementando la revisión humana con un indicador automático de manipulación facial.
- KYC y verificación de identidad: en procesos de alta remota, el modelo puede analizar la secuencia de vídeo del usuario para detectar *face swaps* o inyecciones de vídeo, integrándose en un pipeline previo a la verificación biométrica.
- Análisis forense digital: peritos pueden usar el modelo como herramienta auxiliar para priorizar evidencias, dado que su licencia MIT permite integrarlo en herramientas internas sin restricciones comerciales.
- Investigación académica en deepfakes: al partir de un backbone EfficientNet-B5 conocido y ser ligero, sirve como línea base reproducible para comparar técnicas de detección en nuevos datasets.
- Filtrado en redes sociales y foros: despliegue en servicios de moderación que necesitan un clasificador de bajo coste por fotograma, con posibilidad de ejecutarse en GPU de consumo.
- Detección en tiempo casi real en *edge*: por su tamaño reducido, puede embeberse en servidores con una sola GPU o incluso en CPU para análisis por lotes de baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (53 M de parámetros, ~0,2 GB en safetensors), la inferencia en FP32 requiere del orden de 0,5-1 GB de VRAM incluyendo activaciones a resolución de entrada, y menos en FP16.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, con margen amplio, incluidas GPUs de gama baja y posiblemente CPU para lotes pequeños.
- Opciones de despliegue: `transformers` (pipeline declarado), con posibilidad de exportación a ONNX/TensorRT no documentada; no se mencionan vLLM, llama.cpp ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Licencia | Acceso | Contexto/Entrada |
|---|---|---|---|---|---|
| DeepCLIP b5 (este) | 53,0 M | Detección de deepfakes faciales (imagen/vídeo) | MIT | Gated en HF | Resolución no documentada (backbone B5: 456×456) |
| EfficientNet-B5 (timm) | ~30 M | Clasificación de imagen general (ImageNet) | Apache-2.0 (según timm) | Abierto | 456×456 |
| Xception (FaceForensics++) | ~20,8 M | Detección de deepfakes | Varía según implementación | Abierto en repos académicos | 299×299 |
| Modelos CLIP-based de detección | Varía (ViT-B/32 ~88 M) | Detección zero-shot / forense | Varía | Varía | 224×224 |

La comparativa es aproximada: no se han publicado métricas de DeepCLIP b5 que permitan contrastar su precisión frente a Xception o enfoques CLIP. EfficientNet-B5 es el backbone, no un detector de deepfakes, por lo que la comparación es estructural.

## Limitaciones y advertencias

- No se documentan sesgos conocidos; al entrenarse presumiblemente con datasets de deepfakes, puede presentar sesgo hacia manipulaciones presentes en esos datasets y fallar ante técnicas nuevas o *face swaps* de otra generación.
- Riesgo de alucinación no aplicable (no genera texto), pero sí de falsos positivos y falsos negativos en la clasificación; sin benchmarks publicados no es posible estimar su tasa de error.
- Limitaciones de idioma no aplicables; limitaciones de contexto no aplicables, pero la resolución de entrada y el número de fotogramas por vídeo no están documentados.
- Licencia MIT permite uso comercial y modificación, pero el acceso está restringido en Hugging Face (gated), por lo que es necesario aceptar condiciones en la plataforma antes de descargar los pesos.
- El modelo depende de `custom_code` (etiqueta `custom_code`), lo que implica que requiere `trust_remote_code=True` en `transformers`; conviene auditar el código antes de ejecutarlo en producción.
- No hay información sobre robustez ante compresión de vídeo, cambios de iluminación, oclusiones o rostros no frontales.
- Al ser un modelo de 2026 según metadatos, su validación independiente es escasa (1 like, sin paper asociado).

## Enlaces

- Hugging Face: https://huggingface.co/KoreaPeter/deepclip_b5
- Modelo base (timm): https://huggingface.co/timm/tf_efficientnet_b5.ns_jft_in1k
- Repositorio timm: https://github.com/huggingface/pytorch-image-models
- No se han encontrado papers, blogs, repos ni demos adicionales en la información disponible.
