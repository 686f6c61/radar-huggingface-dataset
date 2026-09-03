# ManhQuangAI/anti-deepfake-dinov3-coursework

## Resumen

El modelo `ManhQuangAI/anti-deepfake-dinov3-coursework` es un proyecto académico de detección de deepfakes en imágenes de rostros, desarrollado por ManhQuangAI como trabajo de curso. Proporciona dos backbones preentrenados basados en DINOv3 (un ViT auto-supervisado de Meta AI) y tres modelos afinados para clasificación binaria (real vs. falso). El objetivo es evaluar la capacidad de los features de DINOv3 para detectar manipulaciones faciales generadas por 44 métodos distintos.

El repositorio incluye dos backbones sin cabeza de clasificación: un ViT-S/16+ de 28,69 millones de parámetros y un ConvNeXt de 27,82 millones, ambos preentrenados en el dataset LVD-1689M. Sobre ellos se entrenan tres variantes afinadas: ViT-Plus A0 (sampler estándar), ViT-Plus A1 (con sampler mejorado para métodos débiles) y ConvNeXt afinado. Los resultados en un test balanceado de 21.446 imágenes muestran una precisión de hasta el 99,22% para el ConvNeXt afinado, lo que demuestra la eficacia del enfoque.

La relevancia actual radica en la creciente amenaza de los deepfakes y la necesidad de herramientas de detección robustas. Este proyecto, aunque no es un producto listo para producción, ofrece una base reproducible para investigar la transferencia de features auto-supervisados a tareas de anti-spoofing. Los pesos se distribuyen en formato safetensors y .pt, con una licencia "other" no especificada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv3 ViT-S/16+ (backbone) y DINOv3 ConvNeXt (backbone) |
| Parametros totales | ViT-S/16+: 28,69M; ConvNeXt: 27,82M (backbones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (entrada de imagen, no texto) |
| Tipos de cuantizacion | No disponible (solo fp32) |
| Idiomas soportados | No aplica (clasificación de imágenes) |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors (backbones) y .pt (modelos afinados) |

## Arquitectura y entrenamiento

El proyecto utiliza dos arquitecturas de visión por computadora: un Vision Transformer (ViT-S/16+ con parches de 16×16) y una red ConvNeXt, ambas preentrenadas de forma auto-supervisada con DINOv3 sobre el dataset LVD-1689M de Meta AI. Los backbones se extraen sin la cabeza de clasificación original y se congelan para un análisis de "linear probe" (regresión logística con class_weight='balanced') sobre 123.582 imágenes de entrenamiento. Posteriormente, se añade una cabeza lineal de 2 clases (ViT: Linear 384→2, 770 parámetros; ConvNeXt: ~0,30M parámetros) y se afinan los modelos completos.

El entrenamiento de los modelos afinados utiliza un preprocesado estándar: resize a 256×256, normalización con media y desviación de ImageNet (mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]). Se emplea un sampler especial llamado "weak-family" en la variante A1, que sobremuestrea 8 métodos de deepfake considerados débiles (faceswap, deepfake_faceswap, wav2lip, sadtalker, fsgan, facedancer, inswap, mobileswap) para mejorar su detección. Los resultados muestran que el afinado es crucial: el linear probe solo alcanza ~88-89% de precisión, mientras que los modelos afinados superan el 97%, indicando que la adaptación de features es necesaria para la tarea específica.

## Capacidades

- Clasificación binaria de imágenes de rostros: distingue entre imágenes reales y deepfakes generados por 44 métodos diferentes.
- Detección de manipulaciones faciales comunes: faceswap, wav2lip, sadtalker, fsgan, entre otros.
- Extracción de features visuales robustas gracias a los backbones DINOv3 preentrenados.
- Soporte para inferencia en fp32 con preprocesado estándar (resize 256, normalización ImageNet).
- No incluye capacidades de generación de texto, tool calling, agentes ni procesamiento de audio/video; es exclusivamente un clasificador de imágenes.

## Casos de uso

- Moderación de contenido en plataformas sociales: el modelo puede integrarse en pipelines de revisión automática para detectar imágenes de rostros manipuladas antes de su publicación, reduciendo la propagación de desinformación.
- Verificación de identidad en sistemas KYC: como capa adicional de seguridad, puede analizar selfies o documentos con foto para detectar posibles suplantaciones mediante deepfakes.
- Análisis forense en investigaciones: los investigadores pueden utilizar el modelo para examinar evidencias digitales y determinar si una imagen facial ha sido alterada, apoyando procesos legales.
- Evaluación de la robustez de generadores de deepfake: al probar el modelo contra nuevos métodos de manipulación, se puede medir la evolución de las técnicas de spoofing.
- Investigación académica en anti-spoofing: el repositorio sirve como base para estudiar la transferencia de features auto-supervisados (DINOv3) a tareas de detección de manipulación, comparando arquitecturas ViT y ConvNeXt.
- Prototipado de sistemas de seguridad biométrica: el modelo puede integrarse en sistemas de control de acceso que requieran verificar la autenticidad de una imagen facial en tiempo real, aunque su latencia no está documentada.

## Benchmarks y rendimiento

Los resultados se obtuvieron sobre un test balanceado de 21.446 imágenes (10.723 reales y 10.723 falsas, 44 métodos de deepfake), evaluado en fp32 con MPS (Apple Silicon). Se comparan los backbones preentrenados mediante linear probe (backbone congelado + regresión logística) y los modelos afinados.

| Modelo | Acc (%) | Precisión | Recall | F1 | AUC | Real acc (%) | Fake recall (%) |
|---|---|---|---|---|---|---|---|
| ViT-S/16+ pretrained (probe) | 89,47 | 88,86 | 90,25 | 89,55 | 0,9624 | 88,69 | 90,25 |
| ConvNeXt pretrained (probe) | 87,77 | 89,62 | 85,44 | 87,48 | 0,9553 | 90,11 | 85,44 |
| ViT-Plus A0 finetune | 97,91 | 98,05 | 97,77 | 97,91 | 0,9979 | 98,05 | 97,77 |
| ViT-Plus A1 finetune (sampler débil) | 98,47 | 97,94 | 99,02 | 98,48 | 0,9986 | 97,92 | 99,02 |
| ConvNeXt finetuned | 99,22 | 99,79 | 98,64 | 99,21 | 0,9998 | 99,79 | 98,64 |

La mejora de A1 sobre A0 es estadísticamente significativa (test de McNemar, p ≈ 3e-10), atribuida al sobremuestreo de los 8 métodos débiles. El ConvNeXt afinado logra el mejor rendimiento global, con un AUC de 0,9998.

## Requisitos de hardware

- Cada checkpoint ocupa aproximadamente 115 MB (ViT) y 113 MB (ConvNeXt), por lo que la inferencia es viable en CPU con pocos recursos.
- La evaluación se realizó en MPS (Apple Silicon), indicando compatibilidad con GPUs de Apple; también debería funcionar en CUDA.
- VRAM estimada: menos de 1 GB para inferencia en fp32, dado el tamaño de los pesos y la entrada de 256×256.
- GPUs recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (p. ej., GTX 1650, RTX 2060) o Apple Silicon con MPS.
- No se proporcionan datos de latencia ni throughput. El modelo no está optimizado para vLLM, llama.cpp u otros frameworks de inferencia estándar; requiere el loader personalizado del repositorio GitHub.

## Comparativa con modelos similares

No se dispone de comparaciones directas con otros detectores de deepfake en la información proporcionada. El proyecto se centra en la comparación interna entre arquitecturas (ViT vs. ConvNeXt) y variantes de entrenamiento. Como referencia, otros detectores de deepfake basados en visión (p. ej., MesoInception-4) suelen reportar precisiones en rangos similares, pero no se han evaluado en el mismo conjunto de datos. Por tanto, la comparativa con modelos externos no está disponible.

## Limitaciones y advertencias

- Es un proyecto de curso, no un producto validado para producción; no se han realizado pruebas de robustez en entornos reales.
- Los datos de entrenamiento y test no se distribuyen en el repositorio (por derechos de autor y tamaño), lo que dificulta la reproducibilidad externa.
- La licencia "other" no especifica términos de uso comercial; se recomienda contactar al autor antes de cualquier despliegue.
- El modelo solo procesa imágenes fijas de rostros; no maneja vídeo ni audio, y su rendimiento en condiciones de baja calidad o compresión no está documentado.
- Posible sesgo en identidades: el test se diseñó con "zero-leakage" por identidad, pero no se analizan sesgos demográficos.
- Los pesos están en formato .pt con `weights_only=False`, lo que puede suponer un riesgo de seguridad si se cargan de fuentes no confiables.
- No hay soporte para cuantización ni optimización para inferencia en dispositivos edge.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ManhQuangAI/anti-deepfake-dinov3-coursework
- Repositorio de código (GitHub): https://github.com/QuangManhAI/deepfake-ViT
- Repositorio relacionado (detección de deepfake DINOv3): https://huggingface.co/ManhQuangAI/dinov3-deepfake-detection
