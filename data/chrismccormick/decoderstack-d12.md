# ChrisMcCormick/decoderstack-d12

## Resumen

El modelo `decoderstack-d12` es un checkpoint de estado de entrenamiento publicado por Chris McCormick, autor conocido por sus tutoriales sobre transformers y aprendizaje profundo. Forma parte de la línea de notebooks "DecoderStack d12", diseñada para explicar paso a paso el entrenamiento de un transformer decoder de tamaño medio (286 millones de parámetros) en una única GPU A100 de 40 GB. El repositorio contiene dos estados intermedios del entrenamiento (pasos 15 y 250 de un total de 1680) que permiten inspeccionar el estado completo del optimizador, los pesos, el batch siguiente y el código fuente que generó cada estado.

Este modelo no es un modelo final para inferencia, sino un recurso educativo para comprender los detalles internos del entrenamiento de un transformer: desde la gestión de precisión mixta (bf16 con mantisa uint16 para maestros fp32) hasta el uso del optimizador Muon combinado con AdamW y atención flash con longitudes variables (FA3 varlen). Su relevancia radica en que ofrece una ventana transparente a la mecánica de entrenamiento, algo poco común en la mayoría de los repositorios de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (estilo nanochat, inferido de la descripcion) |
| Parametros totales | 286.261.730 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenamiento en bf16 con maestros fp32 de mantisa uint16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder de 12 capas con dimensión oculta de 768, lo que da un total de 286.261.730 parámetros. El entrenamiento se realiza con una combinación de optimizadores Muon y AdamW, con tablas de programación de hiperparámetros por paso. Se utiliza atención flash 3 con longitudes variables (FA3 varlen) y precisión mixta: los pesos vivos se mantienen en bf16, mientras que los maestros fp32 se almacenan con mantisa de 16 bits (uint16) para reducir el uso de memoria. El schedule de entrenamiento consta de 1680 pasos, con fases de calentamiento para la tasa de aprendizaje, el escalado y la cabeza de lenguaje. Los checkpoints guardan el estado completo del entrenamiento, incluyendo los momentos de primer y segundo orden del optimizador, el estado de los generadores aleatorios de torch (CPU y CUDA), el siguiente micro-batch sin consumir y el código fuente del notebook que produjo el estado.

## Capacidades

- No se han documentado capacidades específicas de generación de texto, razonamiento, código o tool calling en la información proporcionada.
- El modelo es un checkpoint de entrenamiento, no un modelo finalizado para inferencia. Su propósito es educativo: permite inspeccionar el estado interno del entrenamiento en un paso concreto.
- Incluye el batch de entrenamiento siguiente, lo que permite reproducir exactamente el paso de forward/backward y la actualización de Muon.
- El repositorio contiene el código fuente del notebook que generó cada estado, facilitando la reproducibilidad y el estudio.

## Casos de uso

- Estudio del entrenamiento de transformers: el checkpoint permite seguir paso a paso el forward y backward de la última capa y la actualización de Muon, ideal para cursos o autoaprendizaje.
- Depuración de implementaciones de optimizadores: al incluir los momentos del optimizador y el batch exacto, se puede verificar la corrección de implementaciones propias de Muon o AdamW.
- Análisis de la dinámica de entrenamiento: comparando los estados en los pasos 15 y 250 se puede observar cómo evoluciona la pérdida (val bpb) durante el calentamiento y el pico de tasa de aprendizaje.
- Reproducción de experimentos: el estado completo permite reanudar el entrenamiento desde un punto exacto, útil para investigar el efecto de cambios en el schedule o en los hiperparámetros.
- Desarrollo de herramientas de visualización: los datos de los checkpoints pueden usarse para crear visualizaciones de la evolución de pesos, gradientes o momentos a lo largo del entrenamiento.
- Investigación sobre precisión mixta: la combinación de bf16 vivo con maestros fp32 de mantisa uint16 es un caso de estudio para técnicas de ahorro de memoria en entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento es la pérdida en bits por byte (val bpb) en dos pasos del entrenamiento:

| Paso | val bpb |
|---|---|
| 15 | 1,905353 |
| 250 | 1,076657 |

Estos valores indican la compresión del modelo en el conjunto de validación, pero no son comparables con benchmarks convencionales.

## Requisitos de hardware

- El entrenamiento se realizó en una GPU NVIDIA A100 de 40 GB (configuración de una sola GPU).
- Para reproducir el entrenamiento completo se necesita al menos 40 GB de VRAM.
- Para cargar un checkpoint y realizar el walkthrough (forward/backward de una capa y un paso de Muon), se requiere una GPU con al menos 16-20 GB de VRAM, dependiendo del tamaño del batch guardado.
- No se han proporcionado requisitos para inferencia, ya que el modelo no está pensado para ese fin.
- Opciones de despliegue: no aplicable para inferencia; el uso previsto es mediante el notebook de walkthrough en un entorno con PyTorch y CUDA.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (checkpoints de entrenamiento educativos). El modelo no es comparable con modelos de lenguaje finalizados como Llama o Mistral, ya que su propósito es completamente distinto.

## Limitaciones y advertencias

- Es un checkpoint de entrenamiento, no un modelo listo para inferencia. No se puede utilizar directamente para generar texto o realizar tareas de NLP.
- No se ha especificado la licencia, por lo que el uso comercial o la redistribución pueden estar sujetos a restricciones no declaradas.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas, ya que no se ha evaluado el modelo final.
- El tamaño del repositorio (5,5 GB) y el formato .pt pueden dificultar su uso en entornos con poco ancho de banda o almacenamiento.
- La val bpb en el paso 250 (1,076657) indica que el modelo aún está en fase de entrenamiento y no ha convergido; no debe interpretarse como un rendimiento final.
- El código y los checkpoints dependen de la versión específica del notebook y de las bibliotecas utilizadas; puede haber problemas de compatibilidad con versiones posteriores de PyTorch o Flash Attention.

## Enlaces

- [HuggingFace: ChrisMcCormick/decoderstack-d12](https://huggingface.co/ChrisMcCormick/decoderstack-d12)
- [Perfil de Chris McCormick en HuggingFace](https://huggingface.co/ChrisMcCormick/models)
- [GitHub de Chris McCormick](https://github.com/chrisjmccormick/)
