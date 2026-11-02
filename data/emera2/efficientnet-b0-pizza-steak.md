# EMERA2/efficientnet-b0-pizza-steak

## Resumen

EfficientNet-B0 pizza vs steak es un clasificador binario de imágenes desarrollado por el usuario EMERA2 como proyecto de aprendizaje. Se construye mediante transfer learning sobre EfficientNet-B0 preentrenado en ImageNet (torchvision) y se especializa en distinguir entre dos clases: pizza (índice 0) y steak (índice 1). El modelo devuelve la probabilidad de que la imagen pertenezca a la clase steak mediante una sigmoide en la cabeza de clasificación.

Se trata de un modelo de visión por computador de propósito muy acotado, no de un modelo de lenguaje ni de un modelo multimodal. Su relevancia es limitada: sirve como ejemplo didáctico de transfer learning y como utilidad puntual para filtrar imágenes en un pipeline concreto, pero no es un modelo generalista ni compite con clasificadores de imagen de gran escala. La model card reporta una accuracy de test del 99,80% sobre un conjunto de 500 imágenes, aunque no se detalla la composición ni el balance de ese conjunto.

El repositorio no incluye información sobre idiomas (no aplica), no publica benchmarks comparativos y no documenta el número de parámetros en la model card, aunque al estar basado en EfficientNet-B0 se puede inferir la arquitectura de referencia. La licencia es MIT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (torchvision) con cabeza de clasificación binaria (Dropout 0.2 -> Linear 1280 -> 1 -> sigmoide) |
| Parametros totales | no disponible (EfficientNet-B0 de referencia: ~5,3 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificación de imágenes) |
| Licencia | MIT |
| Formato de pesos | .pth (PyTorch), con config.json y model.py en el repositorio |

## Arquitectura y entrenamiento

La arquitectura es una CNN EfficientNet-B0 preentrenada en ImageNet, a la que se sustituye la cabeza original por una nueva secuencia Dropout(0.2) -> Linear(1280, 1) -> sigmoide. La salida es una probabilidad escalar: valores cercanos a 1 indican steak y valores cercanos a 0 indican pizza. El entrenamiento se realizó en dos fases: primero con el backbone congelado y solo la nueva cabeza entrenable (Adam, lr 0.001, 5 épocas), y después descongelando los últimos 3 bloques de features (Adam, lr 0.0001, 5 épocas). La función de pérdida fue BCEWithLogitsLoss con batch size 32.

El dataset consta de 1200 imágenes de entrenamiento, 300 de validación y 500 de test. Se aplicó augmentación con random resized crop, horizontal flip y color jitter. No se documenta la procedencia de las imágenes, el balance entre clases ni si hubo limpieza o deduplicación. No se menciona RLHF, DPO ni ninguna técnica de alineación, lo cual es esperable en un clasificador de imagen. No hay innovaciones técnicas destacables más allá del uso estándar de transfer learning.

## Capacidades

- Clasificación binaria de imágenes en dos clases: pizza y steak.
- Salida de probabilidad calibrada mediante sigmoide (probabilidad de steak).
- Inferencia sobre imágenes individuales mediante una función `predict` incluida en el repositorio.
- Carga de pesos y configuración desde Hugging Face Hub mediante `hf_hub_download`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades especiales.

## Casos de uso

- Filtrado de imágenes en un catálogo de recetas: el modelo puede etiquetar automáticamente fotos de platos como pizza o steak para organizar una galería o un menú digital, siempre que el universo de imágenes se limite a esas dos categorías.
- Moderación de contenido en un foro gastronómico: integrado en un pipeline de subida de imágenes, permite separar publicaciones de pizza y de steak y aplicar reglas de sección distintas.
- Preetiquetado en anotación de datasets: como primer paso de un flujo de etiquetado humano, reduce el trabajo manual al proponer una clase para cada imagen, que luego se revisa.
- Demo educativa de transfer learning: sirve para ilustrar en un curso o taller cómo se sustituye la cabeza de un EfficientNet y se afina con dos fases de entrenamiento.
- Prueba de concepto en aplicaciones móviles o de borde: al ser un modelo pequeño basado en EfficientNet-B0, es viable exportarlo y ejecutarlo en dispositivos con recursos limitados, aunque no se documenta dicha exportación.
- Clasificación rápida en scripts de automatización: mediante la función `predict` del repositorio se puede procesar un lote de imágenes en un script de Python sin infraestructura adicional.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Accuracy | 99,80% | Test (500 imágenes) |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. El único dato de rendimiento es la accuracy de test reportada por el autor, sin desglose por clase ni matriz de confusión.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, del orden de cientos de MB para el modelo en FP32 (EfficientNet-B0 de referencia ronda los 5,3 M de parámetros); no se dispone de medición oficial.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; también es viable la inferencia en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU para imágenes individuales.
- Opciones de despliegue: PyTorch nativo mediante el `model.py` del repositorio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EfficientNet-B0 pizza vs steak (EMERA2) | no disponible (~5,3 M de referencia) | no aplica | 99,80% accuracy en test propio | MIT | Hugging Face |
| EfficientNet-B0 ImageNet (torchvision) | ~5,3 M | no aplica | Métricas ImageNet estándar | BSD-3-Clause (torchvision) | torchvision |
| ResNet-18 ImageNet (torchvision) | ~11,7 M | no aplica | Métricas ImageNet estándar | BSD-3-Clause (torchvision) | torchvision |

La comparación directa no es posible porque el modelo de EMERA2 está especializado en dos clases y los modelos de referencia son clasificadores de 1000 clases. No se dispone de otros clasificadores binarios pizza/steak publicados en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo conoce dos clases y siempre responderá con una de ellas, incluso ante imágenes no relacionadas (pizza o steak), tal y como advierte el autor.
- La accuracy del 99,80% se ha medido sobre un conjunto de test de 500 imágenes del propio autor, sin información sobre su composición, balance o posible fuga de datos; no es extrapolable a dominios distintos.
- No se documenta el sesgo del dataset ni la distribución de las imágenes de entrenamiento (iluminación, estilo, procedencia), por lo que el rendimiento puede degradarse en condiciones fuera de distribución.
- Riesgo de alucinación: en un clasificador esto se traduce en falsos positivos y falsos negativos; no hay umbral de rechazo ni clase "desconocida".
- No aplica limitación de contexto ni de idioma por ser un modelo de visión.
- La licencia MIT permite uso comercial, pero el modelo se presenta como proyecto de aprendizaje y no se ofrece ninguna garantía de calidad para producción.
- No se documentan procesos de validación externa, auditoría ni pruebas de robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EMERA2/efficientnet-b0-pizza-steak
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
