# audya/techjam-2026-track5

## Resumen

El modelo `audya/techjam-2026-track5` es un detector de imágenes generadas por inteligencia artificial, presentado como entrada al Track 5 del TikTok TechJam 2026. Desarrollado por el usuario audya (AudricY), su objetivo es clasificar imágenes como reales o sintéticas manteniendo un alto rendimiento incluso después de transformaciones comunes como recompresión JPEG, desenfoque, redimensionado, ruido, cambios de color y recortes. El sistema combina un tower de visión congelado (PE-Core-L/14-336, 316 millones de parámetros) con dos cabezas lineales entrenadas sobre pools de datos distintos, fusionando sus salidas mediante una suma ponderada calibrada con Platt scaling. El repositorio de HuggingFace no contiene el tower completo, sino únicamente los pesos de las cabezas y la configuración del proyecto; el tower se descarga desde el hub con una revisión fijada y verificación de integridad. La licencia es Apache-2.0, lo que permite uso comercial y modificación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tower ViT PE-Core-L/14-336 congelado + dos cabezas lineales con LayerNorm |
| Parametros totales | 316.114.946 (tower) + cabezas lineales (no especificado) |
| Parametros activos | Solo las cabezas lineales (el tower está congelado) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoint propio del proyecto (no safetensors estándar; no cargable con `timm.create_model`) |

## Arquitectura y entrenamiento

El modelo utiliza un tower de visión PE-Core-L/14-336 (variante large con parches de 14 píxeles y resolución de entrada 336×336) congelado, obtenido de `timm/vit_pe_core_large_patch14_336.fb` con una revisión fijada y verificación sha256 contra `MANIFEST.json`. Sobre este tower se entrenan dos cabezas lineales independientes, cada una precedida por LayerNorm. La cabeza A se entrena sobre un pool equilibrado de múltiples familias de generadores, mientras que la cabeza B se entrena sobre un pool sesgado hacia generadores comerciales modernos. La puntuación final es una suma ponderada de los logits calibrados con Platt scaling, con pesos w = (0,15, 0,85) y un umbral reajustado para un 1 % de falsos positivos sobre 11.510 imágenes reales de validación. El entrenamiento se realizó con datos de imágenes reales y sintéticas de diversas fuentes, aunque no se especifican volúmenes exactos de datos ni el número de pasos. No se menciona el uso de RLHF ni DPO, al tratarse de un clasificador.

## Capacidades

- Detección binaria de imágenes generadas por IA (real vs. sintética).
- Robustez a transformaciones geométricas y de calidad: recompresión JPEG, desenfoque, redimensionado, ruido, cambios de color y recortes.
- Generalización a generadores no vistos durante el entrenamiento: evaluado sobre 400 generadores hold-out con AUROC 0,9986.
- Fusión de dos cabezas especializadas para equilibrar precisión y recall en distintos tipos de generadores.
- Calibración de la puntuación mediante Platt scaling, permitiendo ajustar el umbral según la tasa de falsos positivos deseada.
- Inferencia eficiente en CPU: 0,44 s por imagen con 48 núcleos y batch 8.

## Casos de uso

- Moderación de contenido en plataformas sociales: el modelo puede integrarse en pipelines de revisión para detectar imágenes sintéticas antes de su publicación, gracias a su robustez frente a recompresiones y redimensionados típicos de las subidas de usuarios.
- Verificación de autenticidad en medios de comunicación: periodistas y verificadores pueden usar el detector para evaluar si una imagen recibida es generada por IA, con un umbral ajustable para minimizar falsos positivos en material legítimo.
- Análisis forense digital: en investigaciones legales o de seguridad, el modelo ayuda a identificar imágenes manipuladas o sintéticas en evidencias, incluso si han sido recortadas o reescaladas.
- Control de calidad en bancos de imágenes: plataformas que venden fotografías pueden filtrar automáticamente contenido generado por IA no declarado, usando la cabeza B especializada en generadores comerciales modernos.
- Investigación académica sobre detección de deepfakes: el modelo sirve como baseline robusto para comparar nuevos métodos, dado que publica resultados con intervalos de confianza y una "null" de referencia basada solo en metadatos.
- Protección de marcas y propiedad intelectual: empresas pueden monitorizar el uso no autorizado de sus imágenes o detectar campañas de desinformación que empleen imágenes sintéticas, aprovechando la capacidad de generalización a generadores desconocidos.

## Benchmarks y rendimiento

La model card reporta resultados con intervalos de confianza del 95 % y una "null" de referencia (clasificador que solo usa metadatos). Los principales resultados son:

| Conjunto de evaluación | Métrica | Resultado |
|---|---|---|
| Validación organizadores (5.000 reales vs. 8.843 DALL·E 3) | AUROC limpio (raw) | 0,9971 [0,9965, 0,9977] |
| Validación organizadores, protocolo `norm` (15 transformaciones) | AUROC robusto · peor celda (ruido σ0.10) | 0,9912 [0,9902, 0,9921] · 0,9628 [0,9601, 0,9656] |
| WildFake-COCO (4.998 reales, re-encodes 200×200) | AUROC limpio raw / norm | 0,9690 [0,9664, 0,9716] / 0,9759 [0,9737, 0,9782] |
| 400 generadores hold-out (16.000 fakes vs. 3.500 LAION reals) | AUROC limpio | 0,9986 [0,9981, 0,9989] |
| Fakes comerciales (nano-banana) | TPR al umbral servido (0,5) | 76,3 % [72,8, 79,6] |
| Fakes comerciales (GPT-Image class) | TPR al umbral servido (0,5) | 18,2 % [15,3, 21,5] |

Además, se proporciona una escalera de umbrales (τ-ladder) que muestra el equilibrio entre recall y falsos positivos. Por ejemplo, con un umbral ajustado para 1 % de FPR en reales COCO originales, el TPR alcanza 0,9637 en fakes de los organizadores y 0,9933 en nano-banana, con un FPR del 1 % en reales COCO. El umbral servido (0,5) es conservador: no marca ningún real de la validación como falso, pero solo detecta el 40,8 % de los fakes DALL·E 3.

## Requisitos de hardware

- Inferencia en CPU: 0,44 s por imagen con 48 núcleos y batch 8 (incluyendo carga del modelo). No se especifican requisitos de VRAM.
- El tower PE-Core-L/14-336 es un ViT grande (316 M parámetros), por lo que se recomienda una GPU con al menos 8-12 GB de VRAM para inferencia en tiempo real (p. ej., RTX 3060 o superior), aunque no hay datos oficiales.
- El repositorio no incluye el tower; se descarga automáticamente desde el hub con una revisión fijada, lo que requiere conexión a internet en el primer uso.
- Opciones de despliegue: el proyecto proporciona un CLI `predict`; no se mencionan integraciones con vLLM, Ollama o TGI (al ser un modelo de visión, no aplican esos motores). Se puede servir como un endpoint HTTP con frameworks como FastAPI o TorchServe.
- No se reportan métricas de throughput en GPU.

## Comparativa con modelos similares

La model card menciona una comparación con un baseline público SigLIP, indicando que este sistema supera a SigLIP en TPR a un FPR del 1 % tanto en nano-banana como en GPT-Image class, aunque no se dan los valores exactos de SigLIP. No se dispone de comparaciones con otros detectores de imágenes generadas por IA (p. ej., CLIP-based, GAN detectors) en la información proporcionada. Por tanto, la comparativa se limita a esa referencia cualitativa.

| Modelo | Arquitectura | Parámetros | Robustez a transformaciones | Licencia |
|---|---|---|---|---|
| audya/techjam-2026-track5 | PE-Core-L/14-336 + cabezas lineales | 316 M (tower) | Alta (JPEG, blur, resize, noise, color, crop) | Apache-2.0 |
| SigLIP baseline (mencionado) | No especificado | No especificado | Inferior según la model card | No especificado |

## Limitaciones y advertencias

- El umbral por defecto (0,5) es muy conservador: prioriza precisión sobre recall, lo que puede resultar en una baja tasa de detección de fakes comerciales modernos (18,2 % en GPT-Image class). Para aplicaciones donde el recall sea crítico, es necesario ajustar el umbral.
- El tower no se incluye en el repositorio de HuggingFace; se descarga desde el hub con una revisión fijada. Si el enlace o la revisión deja de estar disponible, el modelo no podrá cargarse.
- El formato de pesos no es estándar (no safetensors) y no es compatible con `timm.create_model`; solo funciona con el CLI del proyecto, lo que limita su integración en pipelines existentes.
- No se especifican los datos de entrenamiento en detalle (volúmenes, composición exacta), lo que dificulta evaluar posibles sesgos.
- La robustez se ha medido sobre un conjunto de transformaciones específico; puede degradarse ante transformaciones no contempladas (p. ej., compresión extrema o filtros artísticos).
- No se reportan resultados sobre imágenes de dominios muy diferentes (p. ej., imágenes médicas o satelitales), por lo que su generalización fuera de escenarios fotográficos es incierta.
- El modelo es un clasificador binario; no proporciona explicaciones sobre qué regiones de la imagen indican síntesis, lo que limita su uso en contextos donde se requiera justificación.

## Enlaces

- HuggingFace: https://huggingface.co/audya/techjam-2026-track5
- Repositorio del proyecto: https://github.com/AudricY/techjam26-image-detection
- Página del TikTok TechJam 2026: https://tiktoktechjam2026.devpost.com/
- Ejemplo de otro participante (referencia): https://github.com/Swetha-aaa/techjam-track5
- Vídeo de presentación de otro sistema (LingShu): https://www.youtube.com/watch?v=uXoq2E4SNJQ
