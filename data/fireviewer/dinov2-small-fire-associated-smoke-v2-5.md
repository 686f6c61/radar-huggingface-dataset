# fireviewer/dinov2-small-fire-associated-smoke-v2.5

## Resumen

DINOv2 Small · fire-associated smoke compatibility · v2.5 es un clasificador de imágenes binario desarrollado por fireviewer que estima la compatibilidad de una región de interés (ROI) con humo asociado a incendio. El modelo parte del backbone facebook/dinov2-small (ViT-S/14, 22.057.729 parámetros) y añade una cabeza lineal de clasificación sobre el embedding CLS de 384 dimensiones, con normalización de capa y dropout de 0,15. Su propósito es filtrar candidatos en pipelines de detección temprana de incendios: dada una imagen RGB de una cámara de vigilancia, distingue entre humo probable de incendio, ausencia de humo y un estado intermedio de abstención.

La relevancia del modelo reside en su diseño orientado a la calibración y la auditabilidad. No devuelve una probabilidad bruta, sino una probabilidad escalada por temperatura (T = 1,1490650177) y dos umbrales operativos: uno inferior (p ≤ 0,301602764) para baja compatibilidad y otro superior (p ≥ 0,819975033) para humo probable, con una franja intermedia de abstención. Los umbrales se seleccionaron exigiendo cotas inferiores de Wilson del 95 % para precisión (≥ 0,90) y valor predictivo negativo (≥ 0,95), lo que hace que el modelo sea adecuado para entornos donde los falsos positivos tienen coste operativo.

Se distribuye con licencia Apache 2.0, pesos en safetensors (0,1 GB), configuración explícita e `inference.py`, y está etiquetado para inglés y francés. Su corpus de entrenamiento público comprende 50.183 ROI de entrenamiento y 12.106 de validación, agrupadas por hash SHA-256 de la imagen original para evitar fugas entre particiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-S/14 (DINOv2) con cabeza lineal de clasificación binaria |
| Parametros totales | 22.057.729 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada 448×448 píxeles) |
| Tipos de cuantizacion | no disponible (pesos safetensors en BF16/FP32 según checkpoint) |
| Idiomas soportados | en, fr |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tensor-only), con config.json e inference.py |

## Arquitectura y entrenamiento

El modelo es un transformer de visión ViT-S/14 preentrenado con DINOv2 (facebook/dinov2-small) y adaptado mediante fine-tuning parcial. La entrada es un recorte RGB con 45 % de contexto por lado, lado mínimo de 160 píxeles, redimensionado bicúbico a 448×448 y normalización ImageNet. El backbone produce un embedding CLS de 384 dimensiones que pasa por LayerNorm, dropout 0,15 y una capa lineal que emite un logit; la probabilidad final se obtiene como `sigmoid(logit / 1.1490650177)`.

El entrenamiento corresponde a la ejecución `20261005-075018-dinov2_vits14`: 3 épocas solo de cabeza y 5 épocas adicionales descongelando los dos últimos bloques del backbone, con batch 48, BF16 y semilla 42. Se usó LR de cabeza 3e-4, LR de backbone 5e-6, weight decay 0,05, warmup de 0,5 épocas y decaimiento coseno por fase. El mejor checkpoint se seleccionó por AUPRC en el fold de selección (fase tail E3, época global E6). El dataset vinculado es fireviewer/v2.5-smoke-from-fire-probability, un subconjunto filtrado por derechos del corpus completo. Las etiquetas positivas exigen procedencia que respalde humo asociado a incendio o llama visible en otra parte de la imagen fuente; los recortes con fragmento de llama se excluyen. La validación se agrupó por SHA-256 de la imagen original y se dividió de forma determinista (semilla 42) en 40 % selección, 20 % ajuste de temperatura, 20 % ajuste de umbrales y 20 % auditoría independiente.

## Capacidades

- Clasificación binaria de compatibilidad con humo asociado a incendio en recortes RGB de cámaras de vigilancia.
- Salida calibrada por temperatura con intervalos operativos de baja compatibilidad, abstención y alta compatibilidad.
- Gestión explícita de la ambigüedad: la franja de abstención evita forzar una decisión binaria cuando la evidencia es insuficiente.
- Detección de humo de pequeño tamaño: recall de 0,877729 en positivos pequeños con umbral 0,50.
- Entrada con contexto ampliado (45 % por lado) para incorporar información del entorno alrededor de la ROI.
- No realiza localización de puntos de humo, segmentación por máscara ni estimación de densidad física de aerosol.
- No soporta tool calling, function calling ni razonamiento multi-paso; es un clasificador de imagen puro.
- Idiomas: etiquetado para en y fr, aunque al ser un modelo visual el idioma afecta principalmente a la documentación y a los metadatos.

## Casos de uso

- Filtrado previo en pipelines de detección temprana de incendios: el modelo recibe ROI candidatas generadas por un detector de humo genérico y descarta las que no superan el umbral inferior, reduciendo la carga de revisión humana con una NPV de 0,963761 en el fold de umbrales.
- Vigilancia forestal con cámaras fijas: integrado tras un recortador de ROI, clasifica cada región candidata y solo escala a alerta las que superan p ≥ 0,819975033, con precisión observada de 0,930314 en la auditoría.
- Triaje en centros de control: las ROI en la franja de abstención (23,99 % de la auditoría) se enrutan a revisión humana diferenciada de los negativos, evitando descartes prematuros.
- Validación de falsos positivos en sistemas existentes: como segunda etapa sobre alertas de otros modelos, usando la abstención para no penalizar casos ambiguos por niebla, nubes o vapor de agua.
- Monitorización de quemas controladas y vertederos: el modelo distingue humo asociado a incendio de otras fuentes de humo, siempre que se recalibre para la cámara y las condiciones concretas.
- Investigación en visión por computador aplicada a incendios: la separación entre folds de selección, calibración, umbrales y auditoría, junto con los checksums publicados, permite reproducir y auditar el pipeline completo.
- Despliegue en dispositivos de borde: con 22 millones de parámetros y 0,1 GB de pesos, cabe en GPUs de consumo y en aceleradores integrados para inferencia local en cámara.

## Benchmarks y rendimiento

Auditoría independiente sobre 2.476 recortes (1.198 positivos / 1.278 negativos), con escalado por temperatura y umbrales reutilizados sin cambios:

| Métrica de auditoría | Valor |
|---|---|
| AUROC / AUPRC | 0,948998 / 0,933930 |
| Precisión / Recall / F1 a 0,50 | 0,859177 / 0,906511 / 0,882210 |
| Brier score | 0,086632 |
| Fracción de abstención | 0,239903 |
| Precisión alta (861 decisiones altas) | 0,930314 |
| NPV baja (1.021 decisiones bajas) | 0,963761 |
| Recall de positivos pequeños a 0,50 (458 positivos) | 0,877729 |
| Recall de positivos pequeños en umbral alto | 0,554585 |

Fold de ajuste de umbrales:

| Decisión | Umbral | Soporte | Valor observado | Wilson 95 % inferior |
|---|---:|---:|---|---:|
| Baja compatibilidad | ≤ 0,301602764 | 1.015 | NPV 0,963547 | 0,950159 |
| Humo probable | ≥ 0,819975033 | 877 | Precisión 0,920182 | 0,900359 |
| Ambiguo | entre ambos | — | abstención | — |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 para los 22 millones de parámetros; en BF16/FP16 aproximadamente 0,05 GB de pesos más activaciones de un ViT-S a 448×448 (del orden de 0,5-1 GB con batch pequeño).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 y H100 son sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna de consumo e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: PyTorch con el `inference.py` incluido; exportación a ONNX o TorchScript para servir con ONNX Runtime o Triton; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de visión.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos por recorte en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fireviewer/dinov2-small-fire-associated-smoke-v2.5 | 22.057.729 | Clasificación binaria de humo de incendio con abstención | 448×448 píxeles | Apache 2.0 | Hugging Face, 120 descargas |
| facebook/dinov2-small | 22.057.729 | Embedding visual general (backbone) | 518×518 píxeles (nativo) | Apache 2.0 | Hugging Face |
| Clasificadores de humo basados en CNN (genéricos) | no disponible | Detección de humo binaria | variable | variable | no disponible |

La comparación con clasificadores específicos de humo no está disponible en la información proporcionada. Frente al backbone DINOv2 original, este modelo añade una cabeza calibrada y umbrales operativos auditados, a costa de restringir su uso a la tarea de humo asociado a incendio.

## Limitaciones y advertencias

- No infiere punto de humo, localización de la fuente, máscara ni densidad física de aerosol; es solo una medida de compatibilidad.
- Una salida alta no es prueba de una fuente de ignición ni de peligro real.
- La calibración y los umbrales son específicos de la población de auditoría; deben reevaluarse para otras cámaras, condiciones meteorológicas y fuentes de humo.
- La prevalencia del conjunto de auditoría afecta al AUPRC; no es una métrica universal.
- Subir el umbral alto reduce de forma notable el recall de humo de pequeño tamaño (de 0,877729 a 0,554585), lo que puede provocar falsos negativos en incendios incipientes.
- La franja de abstención cubre el 23,99 % de los casos de auditoría; en producción implica un volumen relevante de revisión humana.
- Entrenado y etiquetado para en y fr; el rendimiento en otras regiones o tipos de vegetación no está documentado.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificación errónea ante humo no asociado a incendio (niebla, polvo, vapor) o condiciones de iluminación atípicas.
- No se han publicado análisis de sesgos demográficos ni geográficos.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad de validar el modelo en el dominio de despliegue recae en el integrador.
- El repositorio tiene 0 likes y 120 descargas; no hay evidencia de adopción en producción ni de mantenimiento a largo plazo más allá de la actualización de noviembre de 2026.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fireviewer/dinov2-small-fire-associated-smoke-v2.5
- Dataset de entrenamiento: https://huggingface.co/datasets/fireviewer/v2.5-smoke-from-fire-probability
- Modelo base: https://huggingface.co/facebook/dinov2-small
- Paper DINOv2 (arXiv:2304.07193): https://arxiv.org/abs/2304.07193
- Guía de elección de variantes: https://huggingface.co/spaces/fireviewer/README/blob/main/docs/CHOOSING_VARIANTS.md
- Índice de recursos: https://huggingface.co/spaces/fireviewer/README/blob/main/docs/RESOURCE_INDEX.md
- Registro de cambios: https://huggingface.co/fireviewer/dinov2-small-fire-associated-smoke-v2.5/blob/main/CHANGELOG.md
