# f13d/lotus-onnx

## Resumen

`f13d/lotus-onnx` es una conversión al formato ONNX del modelo `jingheya/lotus-normal-d-v1-1`, publicada por el usuario f13d en Hugging Face. Se trata de un artefacto de despliegue más que de un modelo original: su valor está en permitir la ejecución del modelo base mediante runtimes ONNX (ONNX Runtime, etc.) en lugar de frameworks de pesos nativos como PyTorch o safetensors. El repositorio ocupa 3,8 GB y se distribuye bajo licencia Apache 2.0.

La model card publicada es prácticamente vacía: solo declara la licencia y el modelo base, sin especificar arquitectura, número de parámetros, longitud de contexto, idiomas ni datos de entrenamiento. El nombre del modelo base (`lotus-normal-d-v1-1`) sugiere un modelo de difusión o de generación de imágenes (la nomenclatura "normal-d" es habitual en modelos de estimación de normales o de difusión), pero esta información no se confirma en la documentación disponible.

Por tanto, esta ficha describe lo que se puede verificar del repositorio (formato, tamaño, licencia, relación con el modelo base) y marca explícitamente como "no disponible" todo aquello que la información proporcionada no cubre. Es relevante para desarrolladores que necesiten desplegar el modelo base en entornos ONNX, pero no aporta información sobre capacidades o rendimiento del modelo en sí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de `jingheya/lotus-normal-d-v1-1`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el tag `quantized` aparece en el modelo base, no se detalla el esquema) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Tamano del repositorio | 3,8 GB |
| Modelo base | `jingheya/lotus-normal-d-v1-1` |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base ni sobre el proceso de conversión a ONNX. La model card no incluye detalles sobre el transformer, posibles componentes de difusión, número de tokens de entrenamiento, composición del dataset ni técnicas de alineación (RLHF, DPO). El único dato técnico verificable es que el artefacto está en formato ONNX y que el modelo base aparece etiquetado como `quantized`, lo que sugiere que la conversión parte de una versión ya cuantizada del modelo original, aunque se desconoce el esquema exacto (INT8, FP16, etc.).

## Capacidades

- No se han documentado capacidades específicas en la información disponible.
- No se confirma soporte de generación de texto, código, matemáticas, visión ni audio.
- No se confirma soporte de tool calling ni de razonamiento multi-paso.
- No se confirman capacidades multilingües.
- La única capacidad verificable es la de ejecución mediante runtimes compatibles con ONNX.

## Casos de uso

- Despliegue en entornos ONNX Runtime: el artefacto permite ejecutar el modelo base en infraestructura que ya utiliza ONNX Runtime para otros modelos, unificando el stack de inferencia.
- Integración en aplicaciones de escritorio o edge con ONNX: al estar en formato ONNX, puede cargarse en aplicaciones nativas que no incorporan PyTorch, siempre que se validen las capacidades reales del modelo base.
- Pipelines de inferencia en producción con aceleración por hardware específico: ONNX Runtime ofrece execution providers para CPU, CUDA, DirectML y otros, lo que facilita el despliegue en hardware heterogéneo.
- Conversión y re-exportación: sirve como punto de partida para generar variantes adicionales (por ejemplo, otras precisiones) mediante herramientas ONNX.
- Evaluación comparativa de runtimes: permite medir latencia y throughput de ONNX Runtime frente a otros backends para el mismo modelo base.
- Archivado y reproducibilidad: al fijar una versión concreta del modelo base en formato ONNX, facilita la reproducibilidad de experimentos que dependan de ese artefacto.

En todos los casos, el uso práctico está condicionado a que el modelo base tenga las capacidades que el proyecto requiera, algo que esta ficha no puede confirmar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio (3,8 GB) da una cota inferior aproximada del espacio en disco necesario, pero no de la VRAM de inferencia, que depende de la arquitectura y del esquema de cuantización del modelo base.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; dependerá del tamaño real del modelo base y del execution provider de ONNX Runtime utilizado.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML, TensorRT como execution providers); otras herramientas no están confirmadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables en la información proporcionada, ya que se desconoce la tarea y el tamaño del modelo base.

## Limitaciones y advertencias

- La model card no documenta sesgos, riesgos de alucinación ni limitaciones de contexto o idioma.
- Se desconoce la licencia efectiva del modelo base más allá de la declaración Apache 2.0 en este repositorio; conviene verificar la licencia de `jingheya/lotus-normal-d-v1-1` antes de uso comercial.
- El repositorio no tiene descargas ni likes, por lo que no hay evidencia de uso en producción ni de validación por la comunidad.
- Al ser una conversión de terceros, no hay garantía de que el artefacto ONNX reproduzca fielmente el comportamiento del modelo base; se recomienda validar numéricamente antes de desplegar.
- El tag `quantized` en el modelo base implica posibles pérdidas de precisión respecto al modelo original, no cuantificadas en la información disponible.
- No se especifica el esquema de cuantización ni la precisión de los pesos ONNX, lo que dificulta estimar requisitos de memoria y posibles degradaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/f13d/lotus-onnx
- Modelo base: https://huggingface.co/jingheya/lotus-normal-d-v1-1
