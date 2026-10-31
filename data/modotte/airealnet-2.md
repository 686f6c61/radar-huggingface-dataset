# Modotte/AIRealNet-2

## Resumen

AIRealNet-2 es un clasificador binario de imágenes desarrollado por Modotte (autor citado: Parvesh Rawal) cuyo objetivo es distinguir imágenes generadas por IA de fotografías reales. Se trata de una versión mejorada del modelo original AIRealNet, con mejoras específicas en el rendimiento sobre imágenes de redes sociales con distintas calidades y niveles de compresión, un punto débil de la versión anterior que clasificaba erróneamente fotos reales comprimidas como sintéticas.

El modelo emplea como backbone la arquitectura SwinV2 Tiny (un vision transformer con ventanas deslizantes jerárquicas) y se ha ajustado (fine-tuning) sobre un conjunto equilibrado de aproximadamente 98.000 imágenes procedentes de plataformas como Instagram y X, con un reparto 50/50 entre imágenes generadas por IA y fotografías humanas. El repositorio pesa 0,8 GB y contiene 195.206.006 parámetros según los metadatos de safetensors.

Su relevancia actual radica en la proliferación de imágenes sintéticas y deepfakes: ofrece una herramienta ligera, de licencia MIT y compatible con la librería `transformers` de Hugging Face, pensada para moderación de contenidos, verificación de hechos e investigación, aunque con limitaciones documentadas frente a ediciones sutiles y generadores no vistos en entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SwinV2 Tiny (vision transformer jerárquico por ventanas) con cabeza de clasificación binaria |
| Parametros totales | 195.206.006 (≈195,2 M) |
| Parametros activos | no disponible (no es MoE; es un modelo denso) |
| Longitud de contexto | no disponible (modelo de visión; entrada de imagen redimensionada a 256x256) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (modelo de clasificación de imágenes, sin componente lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors |

| Dato adicional | Valor |
|---|---|
| Pipeline | image-classification |
| Libreria | transformers |
| Tamano del repositorio | 0,8 GB |
| Modelo base | Modotte/AIRealNet (fine-tune) |
| Clases | 0: imagen generada por IA ("artificial"); 1: imagen real ("real") |
| Descargas / Likes | 404 / 3 |

## Arquitectura y entrenamiento

AIRealNet-2 se basa en SwinV2 Tiny, un vision transformer que procesa la imagen mediante atención por ventanas locales con desplazamiento (shifted windows) y una estructura jerárquica en varias etapas que reduce progresivamente la resolución espacial, lo que le confiere un buen equilibrio entre precisión y coste computacional. Las imágenes de entrada se redimensionan a 256x256 píxeles antes de extraer las características, y una cabeza de clasificación binaria produce las probabilidades para las clases "artificial" y "real".

El ajuste fino se realizó sobre un dataset de unas 98.000 imágenes procedentes de plataformas públicas como Instagram y X, equilibrado al 50 % entre imágenes generadas por IA y fotografías humanas, utilizando el split de entrenamiento y validando sobre un subconjunto equilibrado independiente. Un punto destacable del diseño es la exclusión deliberada de fotos personales (incluso editadas o modificadas por IA), con el fin de respetar la privacidad. No se han publicado detalles sobre el optimizador, el número de épocas, la tasa de aprendizaje ni técnicas adicionales de regularización o aumento de datos.

## Capacidades

- Clasificación binaria de imágenes: distingue entre imagen generada por IA (clase 0 / "artificial") y fotografía humana real (clase 1 / "real").
- Robustez frente a compresión: la versión 2 mejora el rendimiento sobre imágenes de redes sociales con diferentes niveles de calidad y compresión, donde el modelo anterior producía falsos positivos.
- Integración sencilla: funciona con el pipeline `image-classification` de Hugging Face `transformers`, devolviendo etiquetas y puntuaciones de confianza (por ejemplo, `real: 0,9999` frente a `artificial: 0,00008` en el ejemplo de la model card).
- Despliegue ligero: con ~195 M de parámetros y 0,8 GB de pesos, es adecuado tanto para entornos de investigación como de producción.
- Enfoque ético: el entrenamiento excluyó fotos personales, incluso las modificadas por IA, por lo que el modelo no está diseñado para detectar ediciones sobre imágenes de personas reales.

## Casos de uso

- Moderación de contenidos en redes sociales: integración en pipelines de moderación para marcar automáticamente imágenes sospechosas de ser generadas por IA antes de revisión humana, aprovechando su robustez ante las compresiones típicas de plataformas como Instagram o X.
- Verificación de hechos (fact-checking): las redacciones y organizaciones de verificación pueden usar el modelo como primer filtro para priorizar qué imágenes virales analizar manualmente, gracias a su salida probabilística con nivel de confianza.
- Investigación en detección de medios sintéticos: punto de partida o baseline para estudios académicos sobre IA generativa y deepfakes, con pesos abiertos bajo licencia MIT y carga en una línea de código.
- Filtrado en plataformas de stock y arte digital: detección de contenido sintético presentado como fotografía auténtica en marketplaces de imágenes, donde la velocidad de inferencia del modelo permite procesar grandes volúmenes.
- Análisis masivo en OSINT: triaje automatizado de grandes colecciones de imágenes públicas en investigaciones de inteligencia de fuentes abiertas, descartando rápidamente las claramente sintéticas.
- Eduación y concienciación: demostraciones interactivas y herramientas educativas que muestran al público la dificultad de distinguir contenido sintético, usando el pipeline de Hugging Face como demo en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una imagen con métricas de rendimiento tras el ajuste fino, pero no proporciona los valores numéricos en texto ni compara con otros modelos. Como referencia cualitativa, el ejemplo de la model card muestra una imagen real (mal clasificada por la versión anterior) etiquetada correctamente con una puntuación de 0,9999 para la clase "real".

## Requisitos de hardware

- VRAM estimada para inferencia: con ~195 M de parámetros en FP32 (0,8 GB de pesos), el modelo cabe cómodamente en GPUs con 4 GB de VRAM; en CPU también es viable dada la resolución de entrada de 256x256.
- GPU recomendadas: cualquier GPU moderna de consumo (RTX 3060, RTX 4060, RTX 4090) es más que suficiente; no se requieren aceleradores de centro de datos tipo A100 o H100 para inferencia.
- Consumer GPU: sí, cabe sobradamente en prácticamente cualquier GPU de consumo actual, incluso en portátiles.
- Opciones de despliegue: nativamente mediante `transformers` (pipeline `image-classification`); también es posible servirlo con Hugging Face Inference Endpoints (el repo está marcado como `endpoints_compatible`). No hay pesos GGUF ni soporte documentado para llama.cpp u Ollama, al tratarse de un modelo de visión.
- Latencia y throughput: no disponibles; dada la arquitectura ligera (SwinV2 Tiny) y la resolución de 256x256, se espera inferencia en el orden de milisegundos por imagen en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Parametros | Licencia | Notas |
|---|---|---|---|---|---|
| Modotte/AIRealNet-2 | Deteccion de imagenes generadas por IA | SwinV2 Tiny | ~195 M | MIT | Entrenado con 98k imagenes de redes sociales; robusto a compresion |
| Modotte/AIRealNet (v1) | Deteccion de imagenes generadas por IA | SwinV2 Tiny | no disponible | MIT | Version anterior; fallaba en imagenes de redes sociales comprimidas |
| Universo/otros detectores de IA (p. ej. clasificadores tipo AI-or-Not en Hugging Face) | Deteccion de imagenes generadas por IA | Varias (ViT, CNN) | no disponible | Variable | Alternativas en el Hub con enfoques similares; datos concretos no disponibles |

No se han publicado comparaciones cuantitativas directas con otros detectores de imágenes sintéticas en la información disponible.

## Limitaciones y advertencias

- Ediciones sutiles: el modelo tiene dificultades con modificaciones de escala muy fina o ediciones ultra precisas, como las realizadas con herramientas tipo "nano banana".
- Imágenes personales editadas: por diseño ético, no detecta imágenes de personas reales que han sido modificadas con IA; no debe usarse para ese propósito.
- Generalización de dominio: el rendimiento puede degradarse ante generadores de IA no vistos durante el entrenamiento o contenido muy poco convencional.
- Riesgo de falsos positivos/negativos: los propios autores recomiendan combinar las predicciones del modelo con revisión humana; no es apto para verificación legal sin corroboración humana.
- Sesgo de dominio: al estar entrenado con imágenes de Instagram y X, su comportamiento en otros tipos de imágenes (documentos, arte escaneado, imágenes médicas) no está documentado.
- Sin métricas publicadas en texto: la model card muestra métricas como imagen, sin números verificables, lo que dificulta la evaluación rigurosa previa a producción.
- Licencia: MIT, por lo que el uso comercial está permitido con mínimas restricciones (conservar el aviso de licencia).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Modotte/AIRealNet-2
- Modelo base (AIRealNet v1): https://huggingface.co/Modotte/AIRealNet
- Referencia SwinV2 (Microsoft Swin-Transformer): https://github.com/microsoft/Swin-Transformer
- Paper: no disponible
- Demo online: no disponible (ejemplo de uso vía pipeline en la model card)
