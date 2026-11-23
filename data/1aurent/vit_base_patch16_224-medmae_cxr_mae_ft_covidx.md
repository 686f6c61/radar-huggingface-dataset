# 1aurent/vit_base_patch16_224.medmae_CXR_mae_ft_COVIDx

## Resumen

El modelo `vit_base_patch16_224.medmae_CXR_mae_ft_COVIDx`, publicado por el usuario 1aurent en Hugging Face, es un clasificador de imágenes basado en la arquitectura Vision Transformer (ViT-Base con parches de 16x16 y resolución de entrada de 224x224). Se distribuye a través de la librería `timm` y emplea pesos en formato `safetensors`, con un total de 85.801.732 parámetros. Su propósito declarado en el pipeline es la clasificación de imágenes, y por el nombre del identificador se deduce que está especializado en radiografías de tórax (CXR) y en el conjunto de datos COVIDx.

El modelo parte de un preentrenamiento tipo MAE (Masked Autoencoder) sobre imágenes médicas de tórax (`medmae_CXR`), seguido de un ajuste fino supervisado sobre COVIDx (`mae_ft_COVIDx`). Esta combinación sugiere un enfoque de aprendizaje autosupervisado adaptado al dominio radiológico y posteriormente especializado en una tarea de clasificación binaria o multiclase relacionada con la COVID-19.

La relevancia de este modelo radica en su carácter de ejemplo reproducible de ajuste de ViT para imagen médica, con licencia Apache 2.0 y un tamaño de repositorio reducido (0,3 GB), lo que facilita su despliegue en entornos con recursos limitados. No obstante, la información pública disponible es muy escasa: la model card no incluye detalles de entrenamiento, métricas ni limitaciones, por lo que muchos campos de esta ficha deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch 16, resolución 224) |
| Parametros totales | 85.801.732 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 224x224 píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer de tamaño Base (ViT-B/16), con 12 capas de transformer, dimensión de embedding de 768 y 12 cabezas de atención, que procesa imágenes de 224x224 píxeles divididas en parches de 16x16. El identificador del modelo indica una cadena de entrenamiento en dos fases: primero un preentrenamiento autosupervisado con Masked Autoencoder sobre radiografías de tórax (`medmae_CXR`), y después un ajuste fino supervisado sobre el conjunto COVIDx (`mae_ft_COVIDx`).

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición exacta del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales. La model card publicada por el autor no incluye estos detalles, por lo que no es posible verificar la metodología exacta ni los hiperparámetros empleados.

## Capacidades

- Clasificación de imágenes: el modelo está diseñado para la tarea de `image-classification` según su pipeline en Hugging Face.
- Especialización en radiografías de tórax: por el identificador y el dataset COVIDx, se orienta a la detección o clasificación de patologías pulmonares asociadas a la COVID-19.
- Integración con `timm`: puede cargarse mediante la API de `timm` para inferencia y extracción de características.
- Extracción de embeddings visuales: al ser un ViT, puede utilizarse como backbone para tareas de visión por computador.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no aplica (modelo de visión).
- Capacidades especiales (thinking mode, vision, audio): visión (clasificación de imágenes médicas); no se documentan otras.

## Casos de uso

- Detección de COVID-19 en radiografías de tórax: el modelo puede clasificar imágenes de rayos X pulmonares para identificar patrones compatibles con la infección, gracias a su ajuste fino sobre el conjunto COVIDx.
- Herramienta de triaje en entornos con escasez de radiólogos: puede servir como primer filtro para priorizar radiografías sospechosas, siempre con supervisión humana.
- Investigación en imagen médica: útil como baseline para comparar arquitecturas ViT en tareas de clasificación de patologías pulmonares.
- Extracción de características para otros modelos: al ser un ViT-Base, puede emplearse como backbone congelado para entrenar clasificadores ligeros sobre nuevas patologías.
- Docencia y prototipado: su tamaño reducido (0,3 GB) y licencia Apache 2.0 lo hacen adecuado para demostraciones de ajuste fino de ViT en dominios médicos.
- Validación de pipelines de despliegue: puede integrarse en flujos con `timm` para probar infraestructura de inferencia de imágenes médicas antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,6 GB en FP32 para los pesos (85,8 M de parámetros), más el espacio para activaciones; en FP16 alrededor de 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como NVIDIA GTX 1650, RTX 3050, RTX 4090, A100 o H100 son suficientes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 10xx en adelante) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `timm` (PyTorch), exportación a ONNX, TorchScript; no se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI (orientados a modelos de lenguaje).
- Latencia y throughput estimados: no disponibles; dependerán del hardware y del tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vit_base_patch16_224.medmae_CXR_mae_ft_COVIDx | 85,8 M | 224x224 px | Clasificación CXR/COVIDx | Apache 2.0 | Hugging Face |
| ViT-B/16 estándar (ImageNet) | ~86 M | 224x224 px | Clasificación general | Apache 2.0 | Amplia |
| MedMAE (preentrenamiento CXR) | ~86 M | 224x224 px | Preentrenamiento autosupervisado | no disponible | no disponible |
| Modelos CNN específicos para COVIDx (p. ej. ResNet-50 ajustado) | ~25 M | variable | Clasificación CXR | variable | variable |

No se dispone de datos de rendimiento comparativo publicados para este modelo concreto, por lo que la comparación se limita a parámetros, entrada y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; los modelos entrenados con COVIDx pueden heredar sesgos de los conjuntos de datos de origen (distribución geográfica, equipos de rayos X, prevalencia).
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de falsos positivos/negativos en la clasificación, con implicaciones clínicas.
- Limitaciones de contexto o idioma: no aplica idioma; la entrada está restringida a imágenes de 224x224 píxeles.
- Restricciones de licencia para uso comercial: la licencia Apache 2.0 permite uso comercial, pero el uso clínico requiere validación regulatoria independiente.
- Caveats para producción: no se han publicado métricas de rendimiento, curvas ROC, matrices de confusión ni validación externa; no debe usarse como dispositivo médico sin certificación. La model card es mínima y no documenta el proceso de entrenamiento ni los datos exactos.

## Enlaces

- Hugging Face: https://huggingface.co/1aurent/vit_base_patch16_224.medmae_CXR_mae_ft_COVIDx
- Repositorio `timm`: https://github.com/huggingface/pytorch-image-models
- Dataset COVIDx (referencia habitual): https://github.com/lindawangg/COVID-Net
- Paper de referencia de ViT: https://arxiv.org/abs/2010.11929
- Paper de referencia de MAE: https://arxiv.org/abs/2111.06377
