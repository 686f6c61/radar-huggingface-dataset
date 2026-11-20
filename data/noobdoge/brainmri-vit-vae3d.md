# NoobDoge/brainmri-vit-vae3d

## Resumen

BrainMRI ViT-VAE 3D es una colección de checkpoints de autoencoders variacionales (VAE) diseñados específicamente para imágenes de resonancia magnética cerebral en tres dimensiones. El modelo lo publica el usuario NoobDoge bajo el paraguas del proyecto OncoMMAI, y su propósito declarado es servir como infraestructura de inferencia para representaciones latentes comprimidas de volúmenes de RM cerebral, no como un modelo generativo de texto ni como un clasificador clínico.

El repositorio agrupa tres variantes con arquitecturas y escalas distintas: una basada en Vision Transformer (ViT-VAE) de aproximadamente 500 millones de parámetros, otra ViT-VAE de unos 250 millones y una CNN VAE de 246 millones. Cada paquete incluye configuración de arquitectura, configuración de preprocesado, estadísticas del espacio latente y metadatos de los pesos, lo que sugiere un uso previsto como codificador-decodificador de volúmenes para pipelines de investigación en imagen médica.

La relevancia de este tipo de modelo radica en que los VAE 3D permiten comprimir volúmenes de RM de alta dimensionalidad a representaciones latentes manejables, útiles para entrenar modelos posteriores (difusión, clasificación, segmentación) sobre un espacio latente más compacto. No obstante, la información pública disponible es muy escasa: no hay model card detallada, ni resultados de benchmarks, ni licencia declarada, lo que limita seriamente su evaluación para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer VAE (variantes ViT-VAE 500M y 250M) y CNN VAE (246M) |
| Parametros totales | 500M (ViT-VAE), 250M (ViT-VAE), 246M (CNN VAE) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen 3D, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; entrada de imagen médica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería pytorch) |
| Tamaño del repositorio | 4.0 GB |
| Modalidad de entrada | volúmenes 3D de RM cerebral |
| Fecha de publicación | 2026-11-19 |

## Arquitectura y entrenamiento

El repositorio contiene tres arquitecturas de autoencoder variacional orientadas a volúmenes 3D. Las dos variantes principales emplean un Vision Transformer (ViT) como codificador y decodificador, con 500M y 250M de parámetros respectivamente; la tercera es una CNN VAE de 246M de parámetros. La inclusión de "preprocessing configs" y "latent statistics" en cada paquete indica que el modelo se distribuye junto con los parámetros de normalización y las medias/varianzas del espacio latente necesarias para reproducir la inferencia.

No se dispone de información sobre el número de tokens o volúmenes de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de regularización específicas (KL annealing, beta-VAE, perceptual loss). Tampoco se documenta si hubo ajuste fino supervisado o RLHF (no aplicable en este dominio). La etiqueta "EMA inference checkpoints" sugiere que los pesos publicados corresponden a una media móvil exponencial de los parámetros durante el entrenamiento, práctica habitual para estabilizar la inferencia en modelos generativos.

## Capacidades

- Codificación de volúmenes 3D de RM cerebral a un espacio latente comprimido y decodificación de vuelta al espacio de imagen.
- Tres variantes de compromiso tamaño/calidad: ViT-VAE 500M (mayor capacidad), ViT-VAE 250M y CNN VAE 246M (más ligera y potencialmente más rápida).
- Inferencia en PyTorch con pesos en safetensors, lo que facilita la carga segura y la integración en pipelines existentes.
- Distribución de configuraciones de preprocesado y estadísticas latentes, lo que permite estandarizar la normalización de nuevos volúmenes.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de imagen médica.
- No se documentan capacidades de segmentación, clasificación diagnóstica ni generación condicionada; su función declarada es la reconstrucción/compresión latente.

## Casos de uso

- Preprocesado para modelos generativos de difusión en imagen médica: usar el VAE como codificador para proyectar volúmenes de RM a un espacio latente de menor dimensionalidad y entrenar un modelo de difusión latente sobre él, reduciendo coste computacional frente a trabajar en voxels.
- Compresión de datasets de RM para almacenamiento e intercambio: codificar estudios completos a latentes y reconstruirlos bajo demanda, útil en entornos con limitaciones de almacenamiento o ancho de banda.
- Aumento de datos controlado: muestrear del espacio latente para generar variaciones sintéticas de volúmenes cerebrales que amplíen datasets de entrenamiento en tareas de segmentación o detección.
- Investigación en representaciones latentes: analizar la estructura del espacio latente (interpolaciones, vecinos, estadísticas) para estudiar factores de variación anatómica en cohortes de RM.
- Detección de anomalías no supervisada: entrenar un detector sobre el error de reconstrucción del VAE, de modo que volúmenes con patologías o artefactos produzcan errores mayores que los estudios normales.
- Base para clasificadores ligeros: congelar el codificador y entrenar una cabeza de clasificación sobre los latentes para tareas como clasificación de estadio o subtipo tumoral, aprovechando la reducción de dimensionalidad.
- Integración en pipelines de investigación oncológica (proyecto OncoMMAI): servir como componente de compresión dentro de flujos de análisis de imagen oncológica cerebral.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de 500M de parámetros en precisión FP32 ocupa aproximadamente 2 GB solo en pesos; en FP16/BF16, alrededor de 1 GB. La VRAM real dependerá del tamaño del volumen de entrada, del tamaño de batch y de los mapas de atención del ViT 3D, que pueden dominar el consumo.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría esperar ejecución en GPUs de consumo como RTX 3090/4090 (24 GB) para las variantes de 250M/246M, y en A100/H100 para lotes grandes o volúmenes de alta resolución.
- Cabe en GPU de consumo: probablemente sí para las variantes de 250M y 246M, aunque no está confirmado por el autor.
- Opciones de despliegue: PyTorch nativo; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo). El repositorio de GitHub del proyecto incluye código de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Modalidad | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BrainMRI ViT-VAE 3D (este) | 500M / 250M / 246M | RM cerebral 3D | no aplica | no disponible | Hugging Face (0 descargas) |
| Modelos VAE 3D genéricos de imagen médica | no disponible | imagen médica 3D | no aplica | variable | no disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría. El ecosistema de VAE 3D para RM cerebral incluye implementaciones de investigación (por ejemplo, basadas en MONAI), pero no se han proporcionado datos concretos de parámetros, contexto o rendimiento que permitan una comparación válida en esta ficha.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se puede asumir permiso para uso comercial ni para redistribución; es imprescindible contactar con el autor antes de cualquier uso en producción.
- Sin model card detallada ni documentación de entrenamiento: se desconoce el dataset, la procedencia de las imágenes, el consentimiento de los pacientes y las posibles licencias de los datos subyacentes.
- Riesgo de sesgo de dominio: al no documentarse la composición del dataset (edad, sexo, equipo de RM, protocolo), el modelo puede generalizar mal a cohortes o escáneres distintos de los de entrenamiento.
- Riesgo de alucinación estructural: como VAE, la reconstrucción puede suavizar o inventar detalles anatómicos; no es apto para diagnóstico clínico ni para uso médico sin validación externa.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad de reconstrucción (PSNR, SSIM, FID) ni de utilidad en tareas posteriores.
- Cero descargas y cero likes en el momento de la consulta: proyecto sin validación por la comunidad.
- Repositorio de 4 GB: requiere espacio de almacenamiento y ancho de banda considerables para su descarga.
- No apto para texto, código, agentes ni tareas multimodales generales; cualquier uso fuera de imagen médica 3D carece de sentido.
- Fecha de creación en 2026: verificar la integridad y procedencia de los pesos antes de cargarlos en entornos sensibles.

## Enlaces

- Hugging Face: https://huggingface.co/NoobDoge/brainmri-vit-vae3d
- Repositorio de código e instrucciones de descarga: https://github.com/OncoMMAI/brainmri-vit-vae3d
- Checkpoints ViT-VAE 500M: https://huggingface.co/NoobDoge/brainmri-vit-vae3d/tree/main/vit-500m
- Checkpoints ViT-VAE 250M: https://huggingface.co/NoobDoge/brainmri-vit-vae3d/tree/main/vit-250m
- Checkpoints CNN VAE 246M: https://huggingface.co/NoobDoge/brainmri-vit-vae3d/tree/main/cnn-246m
