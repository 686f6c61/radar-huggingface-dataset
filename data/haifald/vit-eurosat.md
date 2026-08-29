# Haifald/vit-eurosat

## Resumen

El modelo `Haifald/vit-eurosat` es un Vision Transformer (ViT) de tipo base, fine-tuneado sobre el modelo preentrenado `google/vit-base-patch16-224` para la clasificación de imágenes satelitales. Aunque la model card no especifica el conjunto de datos de entrenamiento, el nombre del modelo y el contexto de la comunidad indican que se trata del dataset EuroSAT, compuesto por imágenes de satélite de alta resolución para clasificación de uso y cobertura del suelo (LULC). El modelo fue desarrollado por el usuario Haifald y publicado en Hugging Face con licencia Apache 2.0.

Con 85,8 millones de parámetros, este ViT-base procesa imágenes de 224x224 píxeles con parches de 16x16. Según los datos declarados por el autor, alcanza una precisión del 98,70% y un F1 macro de 98,67% en el conjunto de evaluación, lo que lo sitúa como una opción sólida para tareas de clasificación de imágenes satelitales. Su tamaño reducido y su compatibilidad con el ecosistema `transformers` lo hacen adecuado para despliegues en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) base, patch size 16, resolución 224 |
| Parametros totales | 85.806.346 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Vision Transformer (ViT) original, que divide la imagen en parches de 16x16 píxeles y los procesa mediante un transformer estándar con atención multi-cabeza. El modelo base `google/vit-base-patch16-224` fue preentrenado en ImageNet-21k y fine-tuneado en ImageNet-1k, y aquí se ha ajustado adicionalmente para la clasificación de imágenes satelitales.

El fine-tuning se realizó con el framework `transformers` (versión 5.15.1) y PyTorch 2.11.0, utilizando los siguientes hiperparámetros: learning rate de 5e-5, batch size de 16, 3 épocas, optimizador AdamW (con betas 0.9 y 0.999) y scheduler lineal. No se menciona el uso de técnicas como RLHF o DPO, ya que se trata de una tarea de clasificación supervisada. El dataset de entrenamiento no está especificado en la model card, aunque el nombre del modelo sugiere que se usó EuroSAT.

## Capacidades

- Clasificación de imágenes satelitales: identifica categorías de uso del suelo (urbano, agrícola, forestal, agua, etc.) a partir de imágenes de satélite.
- Extracción de características visuales: al ser un ViT preentrenado, puede utilizarse como extractor de características para otras tareas de visión por computador.
- Inferencia eficiente: con 86M de parámetros, es ligero en comparación con modelos de visión más grandes, lo que permite ejecutarlo en hardware modesto.
- Compatibilidad con el ecosistema Hugging Face: se integra con `transformers` y `pipelines`, facilitando su uso en aplicaciones existentes.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales; es exclusivamente un modelo de clasificación de imágenes.

## Casos de uso

- Monitorización de cambios en el uso del suelo: el modelo puede clasificar imágenes satelitales de diferentes fechas para detectar deforestación, expansión urbana o cambios agrícolas, gracias a su precisión del 98,7% en EuroSAT.
- Agricultura de precisión: identificación de tipos de cultivo o zonas agrícolas a partir de imágenes aéreas, permitiendo a los agricultores optimizar el riego o la fertilización.
- Planificación urbana: clasificación de áreas urbanas, industriales y residenciales para apoyar decisiones de zonificación y desarrollo de infraestructuras.
- Gestión de desastres naturales: análisis rápido de imágenes satelitales post-desastre para identificar zonas inundadas, quemadas o dañadas, facilitando la respuesta de emergencias.
- Investigación medioambiental: clasificación de cobertura terrestre en estudios de biodiversidad, cambio climático o conservación de ecosistemas.
- Sistemas de información geográfica (SIG): integración del modelo en pipelines de procesamiento de imágenes para generar mapas temáticos de uso del suelo de forma automática.

## Benchmarks y rendimiento

Los resultados que se muestran a continuación son los declarados por el autor en la model card. No se han publicado comparaciones con otros modelos en la información disponible.

| Metrica | Valor |
|---|---|
| Loss (evaluación) | 0,0445 |
| Accuracy (evaluación) | 0,9870 |
| Macro F1 (evaluación) | 0,9867 |

Además, la tabla de entrenamiento muestra la evolución por época:

| Training Loss | Epoch | Step | Validation Loss | Accuracy | Macro F1 |
|:-------------:|:-----:|:----:|:---------------:|:--------:|:--------:|
| 0,0898 | 1,0 | 1350 | 0,0624 | 0,9815 | 0,9810 |
| 0,0250 | 2,0 | 2700 | 0,0764 | 0,9833 | 0,9828 |
| 0,0031 | 3,0 | 4050 | 0,0545 | 0,9889 | 0,9884 |

## Requisitos de hardware

- VRAM estimada: el modelo tiene 85,8M de parámetros. En FP32 ocupa aproximadamente 344 MB, en FP16 unos 172 MB. Por tanto, cabe en cualquier GPU con al menos 1 GB de VRAM, incluso en GPUs integradas.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, por ejemplo NVIDIA GTX 1050 Ti o superior. También puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con consumer GPU: sí, es perfectamente viable en GPUs de gama baja como RTX 2060, GTX 1660, etc.
- Opciones de despliegue: al ser un modelo de `transformers`, puede servirse con `pipeline` de Hugging Face, o mediante frameworks como `vLLM` (aunque está pensado para texto, también soporta visión), `TGI` (Text Generation Inference, aunque no es su caso), o simplemente con PyTorch/ONNX. Para inferencia en CPU se puede usar `ONNX Runtime` o `OpenVINO`.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna (por ejemplo, RTX 3090), la inferencia de una imagen de 224x224 debería tomar menos de 10 ms, permitiendo cientos de imágenes por segundo.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos fine-tuneados en EuroSAT en la información proporcionada. Existen otros modelos en Hugging Face como `pankajgharai/EuroSAT_ViT_Hybrid_Training` (basado en ViT-hybrid) o `nprasad24/euroSAT_CLIP` (basado en CLIP), pero no se han publicado métricas comparables en la información disponible. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El dataset de entrenamiento no está especificado en la model card, lo que dificulta evaluar la generalización a otros dominios o la posible presencia de sesgos.
- El modelo está diseñado exclusivamente para clasificación de imágenes satelitales; su uso en otros tipos de imágenes (fotografías, radiografías, etc.) probablemente dará resultados pobres.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado en EuroSAT, puede tener un rendimiento inferior en regiones geográficas o tipos de cobertura no representados en ese dataset.
- Riesgo de alucinación: no aplica, ya que no genera texto.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia del dataset EuroSAT (que es de uso libre para investigación) si se utiliza en productos comerciales.
- El modelo no soporta entrada de texto ni interacción multimodal; es un clasificador de una sola etiqueta por imagen.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Haifald/vit-eurosat)
- [Repositorio de entrenamiento similar: pankajgharai/EuroSAT_ViT_Hybrid_Training](https://huggingface.co/pankajgharai/EuroSAT_ViT_Hybrid_Training)
- [GitHub: aedriansagap/vit-eurosat](https://github.com/aedriansagap/vit-eurosat)
- [GitHub: a-k-0209/vision-transformer-eurosat](https://github.com/a-k-0209/vision-transformer-eurosat)
- [Modelo CLIP para EuroSAT: nprasad24/euroSAT_CLIP](https://huggingface.co/nprasad24/euroSAT_CLIP)
