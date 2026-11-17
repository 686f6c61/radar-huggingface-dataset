# bde31/weight-noise-writers

## Resumen

Weight-noise writers es una colección de seis modelos GGUF derivados de google/gemma-4-31B-it mediante la inyección de ruido gaussiano con semilla en sus tensores de pesos cuantizados. El autor, bde31, los construye como artefactos de investigación para estudiar si la atribución de autoría (stylometry) es capaz de distinguir entre "escritores" que comparten arquitectura y datos de entrenamiento pero difieren únicamente en una perturbación controlada de sus pesos. No son modelos de propósito general: están degradados deliberadamente.

La relevancia es metodológica. Al fijar el modelo base, la cuantización (Q8_0 de Unsloth) y el procedimiento de perturbación, el autor aísla la variable "identidad de escritor" y permite medir hasta qué punto las técnicas de estilometría detectan diferencias que no provienen de datos de entrenamiento distintos. El corpus de poemas generados por cada variante se publica por separado en el dataset bde31/weight-noise-writers-poems.

Cada archivo se reconstruye de forma determinista a partir de su semilla y su sigma (0.14), y el autor verifica la reproducibilidad comparando el SHA-256 del GGUF regenerado con el registrado en el momento de la generación de los poemas. El modelo base es un Gemma 4 de 31B parámetros en formato instruction-tuned, aunque la ficha no aporta detalles adicionales sobre arquitectura interna, contexto o composición del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (heredada de google/gemma-4-31B-it; detalles no disponibles) |
| Parametros totales | 31B (heredados del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF); tensores pequeños en F32 sin modificar |
| Idiomas soportados | no disponible (el modelo base es multilingue; la model card solo menciona poemas en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base google/gemma-4-31B-it, sin cambios estructurales. La intervención consiste en sumar a cada uno de los 411 tensores cuantizados W un término sigma · sd(W) · E, donde E es ruido normal estándar fijado por la semilla y el nombre del tensor, y posteriormente recuantizar a Q8_0. Los 422 tensores pequeños en F32 se dejan intactos. Con sigma = 0.14, la perturbación es proporcional a la desviación típica de cada tensor, lo que garantiza una magnitud relativa homogénea en toda la red.

No hay entrenamiento adicional, RLHF ni DPO: los seis "escritores" (K1 a K6) se generan con semillas 910301 a 910306 y el mismo sigma. La reproducibilidad es un requisito de diseño y se valida mediante SHA-256. El autor no documenta en la información disponible el número de tokens, la composición del dataset ni detalles del proceso de instruction tuning del base.

## Capacidades

- Generación de texto y poesía en el idioma del prompt, con estilo diferenciado entre variantes por efecto de la perturbación.
- Generación creativa multilingüe heredada del base (la model card solo ejemplifica con coreano).
- Capacidad de instruction following heredada de Gemma 4 31B it, aunque degradada por el ruido.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento explícito.
- No se documenta visión, audio ni otras modalidades.
- Adecuado como sujeto de experimentos de estilometría y atribución de autoría.

## Casos de uso

- Investigación en estilometría: comparar las distribuciones de rasgos estilísticos (longitud de verso, riqueza léxica, puntuación) de los poemas de K1–K6 para evaluar la sensibilidad de los clasificadores de autoría ante perturbaciones mínimas de pesos.
- Estudio de robustez de atribución de autoría: entrenar un clasificador con los poemas del dataset y medir su accuracy frente a un baseline de modelos con fine-tuning real, aislando el efecto de la varianza de pesos.
- Análisis de sensibilidad a la cuantización: comparar la salida de cada GGUF Q8_0 con la del base sin perturbar para cuantificar el impacto del ruido frente al de la propia cuantización.
- Reproducibilidad y procedencia de modelos: usar los SHA-256 publicados como caso práctico de verificación de artefactos derivados en pipelines de MLOps.
- Docencia en interpretabilidad: demostrar de forma tangible cómo una perturbación gaussiana pequeña y controlada altera el comportamiento generativo sin reentrenar.
- Generación de corpus controlados: producir poemas con "voces" fijas y reproducibles para experimentos que requieran múltiples autores sintéticos con un único modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un GGUF Q8_0 de 31B ocupa aproximadamente 31–33 GB en disco y requiere un tamaño similar en memoria o VRAM para carga completa.
- GPU recomendadas para carga completa: A100 40/80 GB, H100, L40S 48 GB, RTX 6000 Ada 48 GB.
- Consumer GPU: no cabe en GPUs de 24 GB (RTX 3090/4090) sin offloading parcial a RAM; con offloading puede ejecutarse en llama.cpp a costa de latencia.
- Despliegue: llama.cpp (formato nativo); también compatible con Ollama y otros runners que acepten GGUF, aunque la model card solo menciona llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Formato |
|---|---|---|---|---|---|
| weight-noise-writers (K1–K6) | 31B | no disponible | Investigacion en estilometria | Apache 2.0 | GGUF Q8_0 |
| google/gemma-4-31B-it | 31B | no disponible | Uso general instruction-tuned | Gemma license (segun base) | safetensors, GGUF |
| Unsloth Q8_0 de Gemma 4 31B it | 31B | no disponible | Base cuantizada sin perturbar | Gemma license | GGUF Q8_0 |
| Fine-tunes de autoría sobre LLM (genericos) | variable | variable | Atribucion de autoria via entrenamiento | variable | variable |

La comparativa directa con fine-tunes de autoría no es homogénea: weight-noise-writers no entrena, solo perturba, por lo que su interés es como control experimental más que como alternativa funcional.

## Limitaciones y advertencias

- Modelos degradados a propósito: la calidad de generación es inferior a la del base y no deben usarse en producción.
- El ruido gaussiano con sigma 0.14 puede producir salidas incoherentes, repeticiones o fallos de instruction following.
- Sesgos: heredados del base Gemma 4 31B it; no se documenta mitigación específica.
- Riesgo de alucinación: elevado por la perturbación de pesos y por la naturaleza creativa de la tarea.
- Idiomas: la model card solo ejemplifica con coreano; el resto de coberturas lingüísticas no está verificado.
- Licencia: Apache 2.0 declarada por el autor, pero el modelo base Gemma tiene su propia licencia; conviene revisar los términos de Gemma antes de cualquier uso derivado.
- Solo se publican seis variantes (K1–K6); el autor indica que añadirá más, por lo que el conjunto es incompleto y puede cambiar.
- No hay scripts, documentación completa ni análisis enlazados en la información disponible, lo que limita la reproducibilidad externa más allá de los SHA-256.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bde31/weight-noise-writers
- Dataset de poemas: https://huggingface.co/datasets/bde31/weight-noise-writers-poems
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
