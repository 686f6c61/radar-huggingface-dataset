# danielrjackson/synaptic-lens-targets-mnist

## Resumen

`danielrjackson/synaptic-lens-targets-mnist` es un artefacto de investigación publicado en Hugging Face que contiene 300 estados objetivo ("target states") distribuidos en 12 raíces, junto con hitos tempranos de actualización y checkpoints por época, correspondientes a trayectorias de desarrollo de un clasificador sobre MNIST. No es un modelo de lenguaje: se trata de un conjunto de checkpoints de un modelo de dimensiones fijas (19.658 parámetros según `coordinate-schema.json`) orientado a experimentos de interpretabilidad ("synaptic-lens") sobre la tarea de clasificación de dígitos.

El autor, Daniel Jackson, lo publica como exportación de solo inferencia: se han eliminado optimizadores, estados de RNG, samplers e historial de entrenamiento, de modo que no es posible reanudar el entrenamiento original. Cada tensor fue verificado bit a bit contra el checkpoint original con hash. El repositorio ocupa 0,0 GB y no incluye imágenes de MNIST ni datos de terceros.

Su relevancia es acotada y estrictamente de investigación: sirve para reproducir y comparar hitos de entrenamiento del proyecto Synaptic Lens, no como modelo desplegable en producción. La licencia es de uso exclusivamente académico y de investigación (RAIL-M/RAIL-S 0.1), no una permisión general no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador de dimensiones fijas, 19.658 parámetros según `coordinate-schema.json`) |
| Parametros totales | 19.658 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificación, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | ai-pubs-research-use-rail-m-0.1 (RAIL-M/RAIL-S 0.1, uso académico y de investigación) |
| Formato de pesos | no disponible (exportación de solo inferencia; manifiesto en `export-manifest.json`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del clasificador más allá de que sus dimensiones están fijadas por `coordinate-schema.json` con 19.658 parámetros. Se trata de un modelo entrenado sobre MNIST (Yann LeCun, Corinna Cortes, Christopher J. C. Burges), obtenido desde el espejo OSSCI de PyTorch. No se especifican capas, funciones de activación ni tipo de transformer o red convolucional.

El repositorio contiene trayectorias de desarrollo: 300 estados objetivo en 12 raíces, con particiones que deben preservarse (FIT: raíces 1007 a 1077; SELECT: 1087/1097; CONFIRM: 1107/1117), además de hitos tempranos de actualización y checkpoints por época. No se indica el número de tokens ni composición de dataset (no aplica en el sentido habitual), ni si hubo RLHF/DPO. La exportación elimina optimizador, RNG, sampler e historial de entrenamiento, por lo que no permite reanudar el entrenamiento.

## Capacidades

- Clasificación de dígitos MNIST (inferencia) con los checkpoints exportados.
- Reproducción de hitos de entrenamiento y comparación de estados objetivo entre raíces.
- Carga de hashes de exportación mediante `inference_export=True` en el loader público de hitos; SYN88 usa un loader numérico verificado por hash.
- Verificación bit a bit de tensores contra el checkpoint original (según el manifiesto de exportación).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni modo "thinking", visión o audio más allá de la clasificación de imágenes MNIST.
- No es un modelo generativo de texto.

## Casos de uso

- Investigación en interpretabilidad: analizar cómo evolucionan los estados internos del clasificador a lo largo de las épocas usando los checkpoints por época y los hitos tempranos incluidos.
- Reproducción de experimentos Synaptic Lens: cargar las trayectorias respetando las particiones FIT/SELECT/CONFIRM para replicar comparaciones entre raíces.
- Estudio de dinámica de entrenamiento: comparar los 300 estados objetivo de las 12 raíces para trazar la progresión del aprendizaje en una tarea controlada como MNIST.
- Validación de pipelines de exportación: usar `export-manifest.json` y la verificación de hashes para auditar que un flujo de exportación de solo inferencia produce tensores idénticos al original.
- Docencia y experimentos de bajo coste: un clasificador de 19.658 parámetros permite ejecutar experimentos en CPU sin requisitos de GPU.
- Comparación con los modelos Lens emparejados (`danielrjackson/synaptic-lens-mnist`) para estudiar la relación entre red y objetivos en el mismo marco experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: insignificante; con 19.658 parámetros el modelo cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU moderna (RTX 4090, A100, H100) es sobredimensionada para este tamaño.
- Cabe en consumer GPU: sí, en cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: no se documentan frameworks específicos (vLLM, llama.cpp, Ollama, TGI no aplican a un clasificador de este tipo); el autor remite al quickstart del repositorio para formatos de entrada exactos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| synaptic-lens-targets-mnist | 19.658 | no aplica | Clasificación MNIST / trayectorias de investigación | RAIL-M/RAIL-S 0.1 (solo investigación) | Hugging Face |
| synaptic-lens-mnist | no disponible | no aplica | Modelos Lens emparejados (solo red) | no disponible en la información | Hugging Face |
| Clasificadores MNIST estándar (p. ej. LeNet) | ~60.000 (típico) | no aplica | Clasificación MNIST | variable | Amplia |

La comparación con clasificadores MNIST convencionales es orientativa y no se basa en datos de rendimiento publicados en esta ficha.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni soporta tareas de razonamiento, código o matemáticas.
- No incluye datos de imagen; el dataset MNIST no se redistribuye y sus derechos son independientes de la licencia del modelo.
- La licencia RAIL-M/RAIL-S 0.1 restringe el uso a fines académicos y de investigación; no es una permisión general no comercial ni permite uso comercial.
- Es una colección de trayectorias de desarrollo, no una garantía de calidad de los checkpoints.
- No es un bundle completo de reproducción de evaluación.
- Existen restricciones de redistribución y obligaciones que deben consultarse en el texto completo de la licencia.
- No debe usarse como sistema de decisión en entornos críticos para la seguridad.
- Riesgo de confusión entre particiones (FIT/SELECT/CONFIRM) y los splits del estudio observador separado; es necesario preservar las particiones al comparar hitos.
- Los hashes de los checkpoints históricos no son sumas de verificación de descarga de estas exportaciones de solo inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/danielrjackson/synaptic-lens-targets-mnist
- Repositorio Synaptic Lens: https://github.com/danielrjackson/synaptic-lens
- Código de referencia (commit 544d54c): https://github.com/danielrjackson/synaptic-lens/tree/544d54c22ca053e537c84f894fe207de8d178145
- Licencia del modelo (LICENSE-MODEL.md): https://github.com/danielrjackson/synaptic-lens/blob/544d54c22ca053e537c84f894fe207de8d178145/LICENSE-MODEL.md
- Repositorio de factoría de modelos: https://github.com/danielrjackson/synaptic-lens-target-model-factory
- Modelo Lens emparejado: https://huggingface.co/danielrjackson/synaptic-lens-mnist
