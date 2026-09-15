# mouad10009/vit-beans-demo

## Resumen

vit-beans-demo es un modelo de clasificación de imágenes publicado por el usuario mouad10009 en HuggingFace. Se trata de un fine-tuning de google/vit-base-patch16-224-in21k, el Vision Transformer base preentrenado por Google sobre ImageNet-21k, adaptado mediante la librería Transformers y el Trainer de HuggingFace a una tarea de clasificación de imágenes cuyo conjunto de datos el autor no documenta (la model card indica literalmente "unknown dataset"). El nombre del repositorio sugiere una tarea sobre el conjunto "beans", habitual en demos de clasificación de enfermedades foliares en cultivos, pero no hay confirmación en la información disponible.

El modelo tiene 85.800.963 parámetros, pesos en safetensors y licencia Apache 2.0. Con 0 descargas y 0 likes, y con una model card autogenerada que deja sin rellenar las secciones de descripción, usos previstos y datos de entrenamiento, debe considerarse un artefacto experimental o de demostración, no un modelo listo para producción.

Su relevancia es limitada y acotada: sirve como ejemplo reproducible de fine-tuning de un ViT base con pocos pasos de entrenamiento y como punto de partida para tareas de clasificación de imágenes de dominio específico con recursos modestos (menos de 1.000 millones de parámetros, inferencia viable en GPU de consumo e incluso en CPU).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base), parches de 16x16, resolución de entrada 224x224, con cabeza de clasificación |
| Parámetros totales | 85.800.963 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje); entrada de una imagen de 224x224 px = 196 parches + token de clase |
| Tipos de cuantización | no disponible (el autor no publica versiones cuantizadas; los pesos safetensors admiten cuantización genérica a int8/FP16 con herramientas externas) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers) |

Otros datos: pipeline declarado `image-classification`, tamaño del repositorio 1,4 GB, creado el 2026-09-15 y actualizado el 2026-09-15, compatible con endpoints de HuggingFace, región `us`.

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer estándar de tipo base: la imagen se divide en parches de 16x16 píxeles, cada parche se proyecta linealmente a un embedding, se añade información posicional y la secuencia resultante (196 parches más un token de clase) pasa por los bloques de auto-atención y MLP del encoder. Sobre el token de clase se aplica la cabeza de clasificación ajustada durante el fine-tuning. Es la arquitectura de google/vit-base-patch16-224-in21k, preentrenada en ImageNet-21k, reutilizada como `base_model`.

El entrenamiento documentado es mínimo: 4 épocas completas, 260 pasos totales, learning rate 5e-05 con scheduler lineal, optimizador AdamW (variante `ADAMW_TORCH_FUSED`, betas 0,9/0,999, epsilon 1e-08), batch de entrenamiento y evaluación de 16, semilla 42. Con 65 pasos por época y batch 16, el conjunto de entrenamiento tendría aproximadamente 1.040 imágenes, un volumen muy reducido. No se documenta composición del dataset, número de clases, resolución de las imágenes originales, técnicas de aumento de datos, ni si hubo RLHF/DPO (no aplica en clasificación). Las versiones de framework empleadas fueron Transformers 5.17.0, PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.23.1. No se describe ninguna innovación técnica adicional.

## Capacidades

- Clasificación de imágenes: asigna una etiqueta de clase a una imagen de entrada de 224x224 píxeles.
- Extracción de características visuales: al derivar de un ViT preentrenado en ImageNet-21k, el encoder puede reutilizarse como extractor de embeddings para tareas de visión (similitud, recuperación, clustering), aunque el autor no lo documenta.
- Ajuste fino adicional: al ser pesos safetensors compatibles con Transformers, se puede reentrenar sobre nuevos dominios.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión-lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no aplica.
- Capacidades especiales (modo thinking, audio, vídeo, detección de objetos o segmentación): no disponibles.

## Casos de uso

- Clasificación de enfermedades foliares en cultivos: si el conjunto de datos es efectivamente el de hojas de judía, el modelo podría etiquetar imágenes de hojas en tres estados (por ejemplo, sano, mancha angular, roya), sirviendo de base para un prototipo de diagnóstico agrícola asistido por móvil.
- Pre-etiquetado en anotación de datasets: usar el modelo para asignar etiquetas automáticas a imágenes nuevas y que un anotador humano revise solo los casos de baja confianza, reduciendo el coste de construir un dataset mayor.
- Filtrado o triaje de imágenes en un pipeline de ingesta: descartar o clasificar imágenes en una carpeta antes de un procesamiento posterior, dado el bajo coste computacional del modelo (85,8 M de parámetros).
- Material docente y reproducción de experimentos: sirve como ejemplo completo y muy ligero de fine-tuning de un ViT con el Trainer de HuggingFace, útil en cursos de visión por computador o de despliegue de modelos.
- Baseline interno para comparativas: dada su accuracy de validación del 98,5 % en la mejor época, puede usarse como línea base rápida contra la que medir modelos propios en una tarea de clasificación de dominio acotado.
- Despliegue en entornos con recursos limitados: al caber en GPU de consumo e incluso en CPU, permite clasificación de imágenes en el borde o en servidores sin acelerador dedicado, siempre que la tarea coincida con la del fine-tuning.
- Extracción de características para búsqueda visual: obtener embeddings del encoder y construir un índice de similitud sobre un catálogo de imágenes, con la salvedad de que esta capacidad no está validada por el autor.

## Benchmarks y rendimiento

El campo `model-index` de la model card no contiene resultados (`results: []`). Los únicos datos disponibles son métricas de validación declaradas por el autor durante el entrenamiento:

| Época | Paso | Pérdida de entrenamiento | Pérdida de validación | Exactitud |
|---|---|---|---|---|
| 1,0 | 65 | 0,2200 | 0,2020 | 0,9549 |
| 2,0 | 130 | 0,1355 | 0,1051 | 0,9699 |
| 3,0 | 195 | 0,1050 | 0,1442 | 0,9624 |
| 4,0 | 260 | 0,1278 | 0,0883 | 0,9850 |

La model card informa además de un resultado adicional en el conjunto de evaluación: pérdida 0,1563 y exactitud 0,9531. No se especifica el tamaño del conjunto de evaluación ni el número de clases, por lo que estas cifras no son comparables con benchmarks estándar (ImageNet, CIFAR, etc.). No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 343 MB en FP32, unos 172 MB en FP16/BF16 y unos 86 MB en int8. Sumando activaciones y overhead del runtime, la inferencia por lotes pequeños cabe holgadamente en 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (RTX 3050, RTX 3060, RTX 4090, T4, L4, A10). No requiere A100 ni H100 salvo para entrenamiento con lotes muy grandes.
- GPU de consumo: sí, cabe en cualquier GPU de consumo de los últimos años e incluso en CPU para inferencia puntual (latencia mayor, no cuantificada).
- Opciones de despliegue: pipeline `image-classification` de Transformers, exportación a ONNX Runtime o TorchScript, TorchServe, Triton Inference Server y HuggingFace Inference Endpoints (el repositorio está marcado como `endpoints_compatible`). vLLM u Ollama no son entornos orientados a clasificación de imágenes.
- Latencia y throughput estimados: no disponibles (el autor no publica mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Licencia | Contexto/entrada | Rendimiento en esta tarea | Disponibilidad |
|---|---|---|---|---|---|---|
| mouad10009/vit-beans-demo | 85,8 M | ViT-Base, parches 16, 224x224 | Apache 2.0 | imagen 224x224 | exactitud 0,9850 en la mejor época (validación propia) | HuggingFace, 0 descargas |
| google/vit-base-patch16-224-in21k | ~86 M | ViT-Base, parches 16, 224x224 | Apache 2.0 | imagen 224x224 | no disponible para esta tarea (es el modelo base, sin cabeza ajustada a las clases del autor) | HuggingFace, ampliamente utilizado |
| DeiT-base (facebook/deit-base-distilled-patch16-224) | ~86 M | ViT-Base con destilación | Apache 2.0 | imagen 224x224 | no disponible para esta tarea | HuggingFace |
| ResNet-50 (torchvision) | ~25,6 M | CNN residual | BSD-3 | imagen 224x224 | no disponible para esta tarea | Amplia |

La comparación es estructural: no existen métricas públicas de estos modelos sobre el mismo conjunto de datos, porque el autor no lo identifica. Cualquier comparación de exactitud sería inválida.

## Limitaciones y advertencias

- Dataset no documentado: se desconoce el número de clases, la procedencia de las imágenes, la distribución por clase y si hubo separación correcta entre entrenamiento y validación.
- Riesgo de sobreajuste: con unas 1.040 imágenes por época, 4 épocas y una exactitud de validación del 98,5 %, el resultado es plausible pero no verificable; la pérdida de validación sube en la época 3 y baja en la 4, lo que sugiere un conjunto de validación pequeño y ruidoso.
- Sesgos desconocidos: al no documentarse la composición del dataset, no se pueden evaluar sesgos de iluminación, fondo, cámara, variedad de cultivo o geografía. Un modelo entrenado con imágenes de un único entorno falla habitualmente al cambiar de condiciones de captura.
- Alucinación en el sentido generativo: no aplica, pero sí existe el riesgo de clasificaciones erróneas con alta confianza fuera de la distribución de entrenamiento (imágenes que no pertenecen a ninguna clase conocida).
- Idiomas: no aplica, es un modelo exclusivamente visual.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece ninguna garantía sobre el modelo ni sobre los datos de entrenamiento; el cumplimiento de licencias de terceros sobre el dataset recae en quien lo despliegue.
- Madurez: 0 descargas, 0 likes, model card autogenerada con secciones sin completar ("More information needed") y sin resultados en `model-index`. No debe usarse en producción sin validación propia.
- Sin información sobre cuantizaciones oficiales, latencia, throughput ni requisitos de despliegue.
- Fecha de creación registrada como 2026-09-15, posterior a la fecha de referencia habitual de estos datos; conviene verificar la validez del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mouad10009/vit-beans-demo
- Modelo base: https://huggingface.co/google/vit-base-patch16-224-in21k
- Los resultados de búsqueda web proporcionados no contienen ningún enlace relacionado con este modelo: consisten en hilos de Reddit sobre citas de Bing, sin relación con visión por computador ni con el repositorio. No se dispone de paper, blog, repositorio de código ni demo asociados.
