# Omolola17/efficientnet-b0-pizza-steak

## Resumen

EfficientNet-B0 pizza vs steak es un clasificador binario de imágenes desarrollado por el usuario Omolola17 como proyecto de aprendizaje. Se construye mediante transfer learning sobre un EfficientNet-B0 preentrenado en ImageNet (torchvision) y se reentrena para distinguir entre dos clases: pizza (índice 0) y steak (índice 1). El modelo devuelve la probabilidad de que la imagen pertenezca a la clase steak mediante una sigmoide.

El modelo resuelve una tarea muy acotada de clasificación visual binaria y no está pensado para uso general. Su relevancia es limitada: se trata de un artefacto educativo que ilustra un flujo típico de transfer learning (congelación del backbone, sustitución de la cabeza, fine-tuning parcial) más que un modelo listo para producción. No se publican datos sobre idiomas, contexto ni arquitectura más allá de la descripción de la model card.

La información disponible es escasa: no hay repositorio de pesos con tamaño distinto de 0.0 GB, no hay descargas ni interacciones, y no se documentan benchmarks frente a alternativas. Todo lo que sigue se basa exclusivamente en la model card del autor y en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (backbone convolucional) con cabeza de clasificación binaria |
| Parametros totales | no disponible (EfficientNet-B0 base ronda los 5,3 M, pero no se confirma en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica a clasificación de imágenes) |
| Licencia | MIT |
| Formato de pesos | `.pth` (PyTorch), con `config.json` y `model.py` auxiliares |

## Arquitectura y entrenamiento

El modelo parte de un EfficientNet-B0 preentrenado en ImageNet obtenido de torchvision. Sobre el backbone se añade una nueva cabeza compuesta por Dropout(0.2), una capa Linear(1280, 1) y una activación sigmoide, de modo que la salida es la probabilidad de la clase steak. La pérdida empleada es BCEWithLogitsLoss con batch size 32.

El entrenamiento se realizó en dos fases: la primera con el backbone congelado y solo la nueva cabeza entrenable (Adam, lr 0.001, 5 épocas); la segunda descongelando los últimos 3 bloques de features (Adam, lr 0.0001, 5 épocas). Se aplicó aumento de datos con random resized crop, volteo horizontal y color jitter. El conjunto de datos consta de 1200 imágenes de entrenamiento, 300 de validación y 500 de test. No se documenta ninguna innovación técnica adicional (atención lineal, decodificación especulativa, RLHF/DPO, etc.).

## Capacidades

- Clasificación binaria de imágenes en dos clases: pizza y steak.
- Salida de una probabilidad continua (sigmoide) para la clase steak.
- Inferencia sobre imágenes individuales mediante la función `predict` del `model.py` incluido.
- Carga de pesos vía `huggingface_hub` y ejecución en PyTorch.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión general, audio ni otras capacidades especiales.

## Casos de uso

- Clasificación de imágenes en un prototipo educativo: útil para demostrar un pipeline de transfer learning con PyTorch, cargando los pesos y ejecutando `predict` sobre imágenes de prueba para ilustrar el flujo completo.
- Filtrado binario en un dataset de recetas: se podría usar para separar imágenes de pizza y steak en una colección pequeña, siempre que el dominio visual coincida con el de entrenamiento.
- Etiquetado asistido en un proyecto personal: como punto de partida para anotar imágenes de dos clases y luego revisar manualmente los resultados, dado el 99,40% de accuracy reportado en test.
- Ejercicio docente de fine-tuning: sirve como ejemplo de congelación y descongelación selectiva de bloques en EfficientNet, con hiperparámetros concretos documentados.
- Base para experimentos de aumento de datos: el autor documenta random resized crop, flip y color jitter, lo que permite reproducir y comparar variantes.
- Prueba de integración con Hugging Face Hub: el código de ejemplo muestra cómo descargar pesos, configuración y código desde el repo, útil para validar flujos de descarga en entornos PyTorch.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Test accuracy | 99,40% |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; un EfficientNet-B0 es un modelo pequeño (del orden de millones de parámetros) y cabría en GPUs de consumo, pero no se confirma el tamaño exacto de los pesos en el repo (0.0 GB reportado).
- GPU recomendadas: no disponible; por el tamaño típico de EfficientNet-B0, una GPU consumer como RTX 3060 o superior sería suficiente, pero no se documenta.
- ¿Cabe en GPU consumer? Probablemente sí, dado el tamaño del backbone, pero no se confirma en la información proporcionada.
- Opciones de despliegue: PyTorch nativo (carga vía `huggingface_hub` y `model.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado alternativas comparables en la información recibida, y el modelo es un clasificador binario específico sin benchmarks públicos frente a otros clasificadores.

## Limitaciones y advertencias

- El modelo solo conoce dos clases y siempre responderá con una de ellas, incluso ante imágenes no relacionadas (limitación declarada por el autor).
- Riesgo de alucinación en el sentido de clasificaciones forzadas: cualquier imagen de entrada se mapea a pizza o steak.
- No se documentan sesgos conocidos, pero el dataset es pequeño (1200 imágenes de entrenamiento) y probablemente poco diverso.
- La accuracy del 99,40% se reporta en un test de 500 imágenes del mismo dominio; no hay garantía de generalización fuera de él.
- Licencia MIT permite uso comercial, pero el modelo no está pensado para producción y carece de validación externa.
- El repositorio reporta 0.0 GB de tamaño, lo que puede indicar que los pesos no están efectivamente subidos o que el tamaño es despreciable; conviene verificar antes de usarlo.
- No hay información sobre idiomas ni contexto porque no aplica, pero tampoco hay documentación sobre robustez ante distintas condiciones de imagen.

## Enlaces

- Hugging Face: https://huggingface.co/Omolola17/efficientnet-b0-pizza-steak
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
