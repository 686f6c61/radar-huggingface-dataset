# Danieljmspit/perceiver-classification-v1

## Resumen

Este repositorio contiene una implementación funcional del modelo Perceiver orientada a tareas de clasificación, con una configuración de escala "base". El autor, Danieljmspit, publica el código, la configuración de arquitectura y un checkpoint de inicialización en formato safetensors. El objetivo declarado es ofrecer una implementación transparente y reproducible, con pruebas de humo repetibles, sin reclamar ningún resultado de benchmark.

El modelo es una implementación personalizada de la arquitectura Perceiver, originalmente propuesta por DeepMind, que utiliza atención iterativa y un cuello de botella latente para procesar entradas de gran tamaño. En este caso, el checkpoint incluido (model.safetensors) es únicamente una inicialización válida para pruebas, no un modelo entrenado. Con solo 16.576 parámetros, es un artefacto mínimo pensado para verificar el flujo de entrenamiento y la correcta ejecución del código, no para uso en producción.

La relevancia de este repositorio radica en su utilidad como punto de partida para experimentación: permite a desarrolladores e investigadores familiarizarse con la arquitectura Perceiver, ejecutar pruebas de humo y adaptar el código para sus propios fine-tunings. No obstante, cualquier resultado obtenido con este checkpoint debe documentarse por separado, ya que no ha sido entrenado ni auditado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceiver (configuracion base) |
| Parametros totales | 16.576 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors de precision completa) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño Perceiver original: un codificador que aplica atención cruzada (cross-attention) entre una consulta latente aprendida y la entrada, seguido de bloques de atención con dilatación (dilated attention) sobre el propio latente. La activación empleada es gelu tanh y la normalización es rmsnorm. El repositorio incluye un archivo `config.json` que registra estos ajustes y un `training_args.json` con la receta experimental por defecto: optimizador adafactor con programación polinomial de la tasa de aprendizaje.

No se proporcionan datos sobre el corpus de entrenamiento ni sobre el número de tokens utilizados. El checkpoint `model.safetensors` es una inicialización aleatoria válida para ejecutar pruebas de humo, no un modelo entrenado. El autor indica explícitamente que no se reclama ningún resultado de benchmark y que para una evaluación significativa se debe entrenar el modelo con la misma exposición a datos, presupuesto de ajuste y semillas aleatorias que las líneas base comparadas.

## Capacidades

- Clasificación genérica: el modelo está diseñado para tareas de clasificación, aunque al no estar entrenado no tiene capacidades demostradas sobre ningún dominio específico.
- Implementación de referencia: sirve como ejemplo de código funcional de Perceiver para clasificación, con atención dilatada y fusión por cross-attention.
- Reproducibilidad: incluye scripts de entrenamiento y configuración para facilitar la replicación de experimentos.
- Personalización: el código permite adaptar la arquitectura y la receta de entrenamiento a necesidades particulares.
- No incluye soporte para generación de texto, tool calling, agentes, visión o audio; es exclusivamente un clasificador de propósito general.

## Casos de uso

- Investigación académica: como base para estudiar el comportamiento de la arquitectura Perceiver en tareas de clasificación, comparando diferentes configuraciones de atención y normalización.
- Desarrollo de prototipos: para validar rápidamente si la arquitectura Perceiver se adapta a un problema de clasificación concreto antes de invertir en un entrenamiento a gran escala.
- Pruebas de integración: el checkpoint de inicialización permite verificar que el pipeline de entrenamiento (carga de datos, forward/backward, guardado de checkpoints) funciona correctamente en un entorno de desarrollo.
- Enseñanza de deep learning: como material didáctico para explicar el mecanismo de atención cruzada y el cuello de botella latente de Perceiver.
- Benchmarking de eficiencia: al tener un número mínimo de parámetros, se puede medir el coste computacional de la atención dilatada y la fusión cross-attention en diferentes hardware.
- Fine-tuning desde cero: el repositorio proporciona el punto de partida para entrenar un modelo Perceiver de clasificación sobre un dataset específico, documentando la receta por defecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no se reclama ninguna puntuación y que el checkpoint es solo una inicialización para pruebas.

## Requisitos de hardware

- VRAM estimada: con 16.576 parámetros, el modelo ocupa menos de 1 MB en precisión float32. Cualquier GPU con al menos 1 GB de VRAM es suficiente, incluso CPU.
- GPU recomendadas: no hay requisitos específicos; cualquier GPU moderna (NVIDIA GTX 10xx o superior, AMD, Apple Silicon) puede ejecutar el modelo sin problemas.
- Consumer GPU: sí, absolutamente; incluso en un portátil sin GPU dedicada se puede ejecutar.
- Opciones de despliegue: al ser un modelo PyTorch con safetensors, se puede cargar con PyTorch estándar. No se menciona compatibilidad con vLLM, llama.cpp u Ollama; dado su tamaño, no tiene sentido desplegarlo como servicio.
- Latencia y throughput: no se proporcionan datos, pero con un número tan reducido de parámetros la inferencia es prácticamente instantánea.

## Comparativa con modelos similares

No hay modelos comparables en el sentido de que este es un checkpoint de inicialización sin entrenar. Como referencia arquitectónica, el Perceiver original de DeepMind (paper arXiv:2103.03206) y la implementación de Keras para clasificación de imágenes (CIFAR-100) son los puntos de comparación más cercanos. Sin embargo, no se dispone de datos de rendimiento de este modelo para establecer una comparación numérica.

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| perceiver-classification-v1 | 16.576 | no disponible | apache-2.0 | checkpoint de inicializacion |
| Perceiver original (DeepMind) | ~45M (config base) | no especificado | apache-2.0 (codigo) | modelo entrenado |
| Perceiver Keras (CIFAR-100) | ~45M | 32x32 imagenes | apache-2.0 | ejemplo entrenado |

## Limitaciones y advertencias

- El checkpoint incluido no ha sido entrenado; cualquier predicción que produzca es aleatoria y no debe usarse en aplicaciones reales.
- No se ha auditado el modelo en cuanto a robustez, equidad o transferencia de dominio; es un artefacto experimental.
- Al ser una implementación personalizada, las APIs de carga automática de Hugging Face no funcionan directamente; se requiere un adaptador explícito.
- La licencia apache-2.0 permite uso comercial, pero el modelo sin entrenar no tiene valor práctico en producción.
- No se proporcionan datos sobre el conjunto de datos utilizado ni sobre el proceso de entrenamiento, lo que impide evaluar su comportamiento real.
- Riesgo de alucinación: no aplica, ya que no es un modelo generativo de texto, pero sí puede producir clasificaciones incorrectas si se usa sin entrenamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Danieljmspit/perceiver-classification-v1
- Paper Perceiver (DeepMind): https://arxiv.org/pdf/2103.03206
- Ejemplo Perceiver en Keras (clasificación de imágenes): https://github.com/keras-team/keras-io/blob/master/examples/vision/md/perceiver_image_classification.md
- Documentación de Perceiver en Hugging Face Transformers: https://huggingface.co/docs/transformers/v4.13.0/en/model_doc/perceiver
