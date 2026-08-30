# fengjchen/perceiver-multitask-practice

## Resumen

Este repositorio contiene una implementación experimental de un **Perceiver** orientado a tareas multitarea, publicada por Feng Chen (fengjchen) en Hugging Face. El Perceiver es una arquitectura general basada en atención que permite procesar múltiples modalidades (imagen, audio, texto, etc.) con un coste computacional independiente del tamaño de la entrada, gracias al uso de latentes de tamaño fijo. La variante aquí presentada se denomina "large" en la configuración, pero con solo 24.832 parámetros totales se trata de un punto de partida reproducible para experimentos de arquitectura, no de un modelo entrenado para producción.

El repositorio incluye un script Python (`pipeline.py`), un `config.json` con la configuración arquitectónica, un `training_args.json` con la receta de entrenamiento por defecto y un checkpoint de inicialización en `model.safetensors`. Este checkpoint **no ha sido entrenado** ni auditado, y el autor no reivindica ningún resultado de benchmark. Su relevancia radica en servir como base para investigar arquitecturas Perceiver con atención lineal, fusión de bajo rango y normalización por lotes, así como para comparar futuros entrenamientos sobre conjuntos de datos multitarea.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceiver con atención lineal |
| Parametros totales | 24.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño Perceiver original, que mapea entradas de alta dimensión a un conjunto de latentes de tamaño fijo mediante atención cruzada iterativa. En esta implementación concreta se emplea **atención lineal** en lugar de la atención softmax estándar, lo que reduce el coste computacional de O(n²) a O(n). La fusión de información entre latentes se realiza mediante **fusión de bajo rango**, la activación es **swish** y la normalización se hace con **batchnorm**. Esta combinación busca mejorar la eficiencia en tareas multitarea, aunque el autor no proporciona detalles sobre el tamaño del conjunto de latentes ni el número de capas.

El script de entrenamiento incluye una configuración por defecto con el optimizador **adafactor** y un programa de calentamiento constante. No se especifica la cantidad de tokens de entrenamiento, la composición del dataset ni si se ha aplicado RLHF o DPO. El checkpoint incluido es una inicialización aleatoria para pruebas de humo, no un modelo entrenado. El autor recomienda, para una evaluación significativa, entrenar todos los baselines con la misma exposición a datos, presupuesto de ajuste y semillas aleatorias.

## Capacidades

- **Procesamiento multimodal teórico**: la arquitectura Perceiver está diseñada para manejar entradas de diversas modalidades (imagen, audio, texto, nubes de puntos) mediante atención cruzada, aunque esta implementación no ha sido validada con datos reales.
- **Tareas multitarea**: el diseño permite compartir parámetros entre distintas tareas, pero al ser un checkpoint sin entrenar, no se puede afirmar ninguna capacidad funcional.
- **Atención lineal**: reduce la complejidad cuadrática de la atención estándar, lo que podría facilitar el procesamiento de secuencias largas si se entrenara correctamente.
- **Tool calling / function calling**: no disponible, no se menciona en la documentación.
- **Agentes y razonamiento multi-paso**: no disponible, no se menciona.
- **Capacidades multilingües**: no disponible, no hay información sobre idiomas.

## Casos de uso

- **Investigación de arquitecturas**: sirve como banco de pruebas para estudiar el comportamiento de la atención lineal y la fusión de bajo rango en Perceivers, comparando con variantes con atención estándar.
- **Experimentos de inicialización**: el checkpoint permite verificar que el código funciona correctamente antes de lanzar entrenamientos completos, útil para depurar pipelines.
- **Comparación de baselines**: se puede entrenar este modelo junto con otros de capacidad similar sobre un mismo conjunto de datos multitarea para evaluar el impacto de las decisiones arquitectónicas.
- **Prototipado rápido**: al ser extremadamente pequeño (24K parámetros), puede ejecutarse en CPU o GPU de baja gama, ideal para pruebas de concepto en entornos con recursos limitados.
- **Educación y aprendizaje**: útil para estudiantes que quieran entender cómo funciona un Perceiver por dentro, ya que el código está disponible y es legible.
- **Desarrollo de adaptadores**: el autor menciona que las APIs de carga automática requieren un adaptador explícito, por lo que puede servir para practicar la integración de modelos personalizados en frameworks existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se reivindica ninguna puntuación en este repositorio y que el checkpoint de inicialización no ha sido evaluado.

## Requisitos de hardware

- **VRAM estimada**: con solo 24.832 parámetros, el modelo cabe en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU sin problema.
- **GPU recomendadas**: cualquier GPU moderna, incluyendo tarjetas de consumo como RTX 3060 o inferiores. No se requieren GPUs de datacenter.
- **Compatibilidad con GPU de consumo**: sí, total.
- **Opciones de despliegue**: al ser una implementación personalizada, requiere ejecutar `pipeline.py` directamente. No es compatible con vLLM, llama.cpp, Ollama ni TGI sin un adaptador explícito.
- **Latencia y throughput**: no hay datos disponibles, pero dado el tamaño, la inferencia sería prácticamente instantánea en cualquier hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Licencia | Estado |
|---|---|---|---|---|
| fengjchen/perceiver-multitask-practice | 24.832 | Perceiver con atención lineal | MIT | Checkpoint de inicialización |
| JacobNguyen/perceiver-multitask | no disponible | Perceiver experimental | no disponible | Experimental, sin entrenar |
| Perceiver original (DeepMind) | ~60M (base) | Perceiver con atención estándar | Apache 2.0 | Entrenado y publicado |

La comparación es limitada porque el modelo de fengjchen no está entrenado y no hay datos de rendimiento. El Perceiver original de DeepMind (paper arXiv:2103.03206) es la referencia arquitectónica, pero con muchos más parámetros y resultados publicados en tareas de clasificación de imágenes, audio y video. JacobNguyen/perceiver-multitask parece ser un proyecto hermano con propósito similar, aunque sin información detallada.

## Limitaciones y advertencias

- **Checkpoint sin entrenar**: el modelo no ha sido entrenado, por lo que no produce salidas útiles para ninguna tarea real. Cualquier resultado de inferencia será ruido aleatorio.
- **Sin auditoría de robustez**: el autor indica que el checkpoint no ha sido auditado para robustez, fairness ni transferencia de dominio.
- **Riesgo de alucinación**: al no estar entrenado, no aplica, pero si se entrena con datos no curados, podría presentar los mismos riesgos que cualquier modelo de lenguaje.
- **Limitaciones de contexto o idioma**: no se especifica ninguna, pero la arquitectura Perceiver no está optimizada para generación de texto autoregresiva; es más adecuada para clasificación o representaciones.
- **Restricciones de licencia**: licencia MIT, permite uso comercial, pero el autor advierte que hay que revisar los términos de las fuentes de datos externas si se usan con este repositorio.
- **Caveat de producción**: no apto para uso en producción bajo ningún concepto; es solo un punto de partida experimental.

## Enlaces

- [Hugging Face - fengjchen/perceiver-multitask-practice](https://huggingface.co/fengjchen/perceiver-multitask-practice)
- [Perfil de fengjchen en Hugging Face](https://huggingface.co/fengjchen/models)
- [Paper original Perceiver (arXiv)](https://arxiv.org/abs/2103.03206)
- [Repositorio DeepMind Research - Perceiver (GitHub)](https://github.com/google-deepmind/deepmind-research/blob/master/perceiver/README.md)
- [Notas del paper Perceiver (GitHub)](https://github.com/zhilyzhang/Learning-Deep-Learning-papers/blob/master/paper_notes/perceiver.md)
- [Modelo similar: JacobNguyen/perceiver-multitask](https://huggingface.co/JacobNguyen/perceiver-multitask)
