# da3eun/tofu-llama-3.1-8b-jlens-wikitext

## Resumen

Este repositorio contiene un artefacto de interpretabilidad mecanicista: una lente de Jacobi (Jacobian Lens, J-Lens) ajustada para el modelo `open-unlearning/tofu_Llama-3.1-8B-Instruct_full`, una variante de Llama 3.1 8B fine-tuneada con el conjunto de datos TOFU (Task of Fictitious Unlearning). El autor, da3eun, publica esta lente para permitir experimentos de decodificación de representaciones intermedias del modelo, con el objetivo de estudiar cómo se forman y transforman los conceptos a lo largo de las capas.

La lente se ajustó utilizando el corpus WikiText de Salesforce, en lugar de los datos de evaluación de TOFU, para evitar un sobreajuste a los ejemplos de prueba. El artefacto incluye el archivo `lens.pt` (la lente final), un checkpoint reanudable y metadatos de configuración. No redistribuye los pesos del modelo base, por lo que su uso requiere cargar por separado el modelo TOFU Llama-3.1-8B-Instruct.

La relevancia de este artefacto radica en que proporciona una herramienta lista para usar en análisis de interpretabilidad, siguiendo la metodología del Jacobian Lens introducida por Anthropic. Es útil para investigadores que estudian la representación interna de modelos de lenguaje, especialmente en el contexto de fine-tuning y desaprendizaje (unlearning).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Jacobian Lens (mapeo lineal de residual stream a espacio de la ultima capa) |
| Parametros totales | no disponible (depende del modelo base; el artefacto contiene matrices Jacobianas) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (la lente opera sobre representaciones, no genera texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el corpus de ajuste es WikiText, principalmente ingles) |
| Licencia | no disponible (la implementacion de referencia es Apache 2.0; el modelo base esta bajo Llama 3.1 Community License) |
| Formato de pesos | PyTorch (`lens.pt`, `lens.pt.ckpt`) |

## Arquitectura y entrenamiento

El Jacobian Lens es un método de interpretabilidad que lee representaciones intermedias del residual stream de un transformer. Para cada capa fuente (l), se ajusta una matriz Jacobiana promedio (J_l) que transporta la representación residual en esa capa al espacio de la capa final (capa 31). Luego, esa representación transportada se decodifica con la cabeza de unembedding del propio modelo, produciendo una distribución sobre el vocabulario. Esto permite "verbalizar" lo que el modelo está representando en cada capa intermedia.

El ajuste se realizó sobre el modelo `open-unlearning/tofu_Llama-3.1-8B-Instruct_full`, utilizando 1.000 prompts de WikiText (todos procesados con éxito). La configuración incluye capas fuente 0–30, capa objetivo 31, longitud máxima de secuencia 128, omisión de los primeros 16 tokens, tamaño de lote por dimensión 4 y semilla aleatoria 20260714. El uso de WikiText en lugar de los datos de evaluación de TOFU evita que la lente se especialice en los ejemplos de prueba, lo que la hace más general para análisis de representaciones.

## Capacidades

- Decodificación de representaciones intermedias: permite obtener distribuciones de vocabulario a partir de las activaciones de cualquier capa fuente (0–30) del modelo TOFU Llama-3.1-8B-Instruct.
- Análisis de la evolución de conceptos: facilita el estudio de cómo los conceptos se forman y transforman a lo largo de las capas del transformer.
- Comparación con otras lentes: puede utilizarse junto con Logit Lens o Tuned Lens para contrastar metodologías de interpretabilidad.
- Reproducibilidad: incluye checkpoint y metadatos para reanudar o extender el ajuste.
- Integración con la implementación de referencia: se carga directamente con `JacobianLens.from_pretrained()` de la librería `jlens`.

No es un modelo generativo: no genera texto, no soporta tool calling, ni tiene capacidades de razonamiento o visión. Su función es exclusivamente analítica.

## Casos de uso

- Investigación en interpretabilidad mecanicista: estudiar cómo el fine-tuning con TOFU altera las representaciones internas del modelo en comparación con el Llama 3.1 base.
- Análisis de alucinaciones: identificar en qué capas se forman representaciones erróneas o ficticias, especialmente relevante dado que TOFU entrena con datos ficticios.
- Estudio del desaprendizaje (unlearning): evaluar si el proceso de desaprendizaje elimina o transforma representaciones de conceptos específicos en capas intermedias.
- Comparación de lentes: contrastar los resultados del Jacobian Lens con los de Logit Lens o Tuned Lens para validar hallazgos.
- Depuración de modelos fine-tuneados: localizar capas donde se introducen sesgos o distorsiones durante el ajuste.
- Educación y divulgación: demostrar visualmente cómo un transformer construye significado capa a capa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este artefacto no es un modelo de lenguaje y no tiene métricas de rendimiento como MMLU o HumanEval. Su calidad se evalúa cualitativamente mediante la coherencia de las decodificaciones intermedias, lo cual no está cuantificado en el repositorio.

## Requisitos de hardware

- Para usar la lente se necesita cargar el modelo base `open-unlearning/tofu_Llama-3.1-8B-Instruct_full` (8B parámetros). En precisión fp16, esto requiere aproximadamente 16 GB de VRAM.
- La lente en sí es un conjunto de matrices (una por capa fuente) y ocupa un espacio reducido; el tamaño total del repositorio es 3.1 GB, pero `lens.pt` probablemente sea mucho menor (no se especifica).
- GPU recomendadas: NVIDIA A100 (40 GB), RTX 4090 (24 GB) o similares con suficiente VRAM para el modelo base.
- En consumer GPUs con 24 GB (RTX 3090/4090) es posible ejecutar el modelo en fp16 o con cuantización (por ejemplo, 8-bit) para liberar memoria.
- Opciones de despliegue: la lente se usa en Python con la librería `jlens`; el modelo base puede cargarse con transformers o vLLM, pero la lente requiere acceso a las activaciones intermedias, por lo que se recomienda un entorno de investigación (PyTorch + transformers).
- Latencia y throughput: no disponible; depende del hardware y del número de capas analizadas.

## Comparativa con modelos similares

No hay una comparativa directa con otros artefactos de interpretabilidad en la información proporcionada. Sin embargo, se puede contextualizar con otras lentes:

| Artefacto | Metodo | Modelo base | Corpus de ajuste | Licencia |
|---|---|---|---|---|
| `da3eun/tofu-llama-3.1-8b-jlens-wikitext` | Jacobian Lens | TOFU Llama-3.1-8B-Instruct | WikiText | no disponible |
| `anthropics/jacobian-lens` (referencia) | Jacobian Lens | varios | no especificado | Apache 2.0 |
| Logit Lens (comun) | Proyeccion lineal directa | cualquier transformer | no requiere ajuste | variada |

La principal diferencia es que esta lente está específicamente ajustada para el modelo TOFU, mientras que la implementación de referencia es genérica. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Especificidad del modelo: la lente solo es válida para `open-unlearning/tofu_Llama-3.1-8B-Instruct_full`; no es transferible a otros modelos sin reajuste.
- Dependencia del corpus de ajuste: aunque se usó WikiText para evitar sobreajuste a TOFU, la lente puede estar sesgada hacia el dominio de WikiText (texto enciclopédico en inglés).
- No es un modelo generativo: no puede usarse para tareas de NLP convencionales.
- Licencia no especificada en el repositorio: el usuario debe revisar las licencias del modelo base (Llama 3.1 Community License) y de la implementación de referencia (Apache 2.0) para cumplir con sus términos.
- Riesgo de interpretaciones erróneas: las decodificaciones intermedias pueden ser ruidosas o ambiguas; se recomienda validar con múltiples métodos.
- Requiere acceso al modelo base: no se redistribuyen los pesos, por lo que el usuario debe obtenerlos por separado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/da3eun/tofu-llama-3.1-8b-jlens-wikitext
- Modelo base: `open-unlearning/tofu_Llama-3.1-8B-Instruct_full` (buscar en HuggingFace)
- Implementación de referencia: `anthropics/jacobian-lens` (GitHub/HuggingFace)
- Paper del método: "Verbalizable Representations Form a Global Workspace in Language Models" (buscar en arXiv)
- Corpus de ajuste: `Salesforce/wikitext` (HuggingFace)
