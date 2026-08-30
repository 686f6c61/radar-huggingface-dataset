# AmberYifan/capsd-less-humaneval-opc-marin-8b-base-code_less_b8000_s0

## Resumen

El modelo `AmberYifan/capsd-less-humaneval-opc-marin-8b-base-code_less_b8000_s0` es un ajuste fino (fine-tuning) completo del modelo base `marin-community/marin-8b-base`, realizado por el usuario AmberYifan. Según el nombre del repositorio, el objetivo declarado es reducir el rendimiento en el benchmark HumanEval (generación de código), lo que sugiere un experimento de investigación orientado a la eliminación o atenuación de capacidades específicas en un modelo de lenguaje. El entrenamiento se llevó a cabo con la librería `llama-factory` en modo `full` (actualización de todos los parámetros) sobre un dataset denominado `capsd_marin-8b-base-n80000-opc__mix_code_less_b8000_s0`, cuyas características no se detallan en la documentación pública.

El modelo tiene aproximadamente 8 030 millones de parámetros y, por las etiquetas asociadas (`llama`, `text-generation`, `conversational`), se trata de un modelo de arquitectura tipo Llama especializado en generación de texto. La ficha oficial es autogenerada y carece de información sobre arquitectura interna, datos de entrenamiento, rendimiento o casos de uso previstos, por lo que la mayoría de las especificaciones técnicas no están disponibles públicamente. Su relevancia actual reside en su carácter experimental: sirve como ejemplo de fine-tuning dirigido a modificar competencias concretas (en este caso, la generación de código) y puede ser de interés para quienes investigan en alineación, seguridad o eliminación selectiva de habilidades en modelos de lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tipo Llama (según etiquetas del repositorio); no confirmado oficialmente |
| Parametros totales | 8 030 261 248 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada; se recomienda consultar al autor) |
| Formato de pesos | safetensors (según etiquetas; el repositorio pesa 16,1 GB) |

## Arquitectura y entrenamiento

No se ha publicado una descripción detallada de la arquitectura del modelo. Las etiquetas indican que está basado en Llama y que se trata de un modelo de generación de texto. El entrenamiento se realizó mediante fine-tuning completo (`full`) con `llama-factory`, sobre un dataset cuyo nombre sugiere una mezcla de datos con una fracción reducida de código (`code_less`). Los hiperparámetros declarados en la model card son:

- learning_rate: 1e-05
- train_batch_size: 2, eval_batch_size: 8
- distributed_type: multi-GPU, num_devices: 4
- gradient_accumulation_steps: 8 (total batch size 64)
- optimizer: AdamW (betas 0.9, 0.999, epsilon 1e-08)
- scheduler: cosine con warmup del 3%
- num_epochs: 1

No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. Tampoco se documentan innovaciones técnicas en la arquitectura o el proceso de entrenamiento.

## Capacidades

- Generación de texto: al ser un modelo de tipo Llama para text-generation, puede producir texto coherente en tareas de lenguaje natural, aunque su rendimiento específico no está documentado.
- Conversación: la etiqueta `conversational` sugiere que el modelo puede mantener diálogos multi-turno, pero no hay ejemplos ni métricas que lo confirmen.
- Generación de código: el nombre del repositorio indica que el fine-tuning busca *reducir* la capacidad en HumanEval, por lo que es posible que su habilidad para generar código sea deliberadamente inferior a la del modelo base. No se aportan datos al respecto.
- Otras capacidades (tool calling, agentes, razonamiento multi-paso, visión, audio): no disponibles.

## Casos de uso

No se han documentado casos de uso concretos para este modelo. Dado su carácter experimental y la falta de especificaciones, no es recomendable utilizarlo en entornos de producción sin una evaluación previa. Posibles ámbitos de aplicación, siempre bajo la responsabilidad del usuario:

- Investigación en alineación y seguridad de modelos: estudiar cómo el fine-tuning dirigido puede atenuar competencias específicas (como la generación de código) y sus efectos colaterales en otras capacidades.
- Análisis de robustez: evaluar si la reducción de habilidades de código afecta al rendimiento en tareas de lenguaje general o matemáticas.
- Comparación de metodologías de fine-tuning: contrastar los resultados de este modelo con otros ajustes del mismo base (`marin-8b-base`) que utilicen distintos datasets o estrategias.
- Auditoría de sesgos y comportamientos emergentes: examinar qué comportamientos surgen tras el entrenamiento con un dataset de composición desconocida.

En cualquier caso, se recomienda contactar con el autor para obtener detalles sobre el dataset y los objetivos del experimento antes de considerar cualquier uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección `model-index` con resultados vacíos (`results: []`), y no se han encontrado evaluaciones externas del modelo. Por tanto, no es posible comparar su rendimiento con el de otros modelos.

## Requisitos de hardware

No hay datos oficiales sobre requisitos de hardware. A partir del número de parámetros (8 030 millones) y asumiendo una arquitectura estándar tipo Llama, se puede estimar de forma orientativa:

- Inferencia en precisión FP16: aproximadamente 16 GB de VRAM (solo pesos, sin contar activaciones ni caché KV).
- Inferencia con cuantización de 4 bits (por ejemplo, GPTQ o GGUF): aproximadamente 4-5 GB de VRAM, lo que permitiría su ejecución en GPUs de consumo como RTX 3060 12 GB o RTX 4070.
- GPUs recomendadas para FP16: A100 40 GB, RTX 4090 24 GB, o varias GPUs en paralelo para mayor throughput.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que se generen los formatos adecuados (GGUF, AWQ, etc.). No se ha confirmado la compatibilidad con estas herramientas.

Estas cifras son estimaciones generales para modelos de 8B y no sustituyen una prueba real.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo es un fine-tune específico de `marin-8b-base`, del que tampoco se conocen especificaciones detalladas. No hay datos de otros modelos de la misma categoría (fine-tunes sobre el mismo base con objetivos similares) que permitan una comparación objetiva. Se recomienda consultar los repositorios de otros fine-tunes de `marin-8b-base` publicados por el mismo autor (por ejemplo, `capsd-marin-8b-base-code_less_b1000_s0` o `capsd-marin-8b-base-math_less_b8000_s0`) para explorar diferencias, pero no se dispone de métricas comparables.

## Limitaciones y advertencias

- Documentación insuficiente: la model card es autogenerada y no incluye descripción del modelo, datos de entrenamiento, licencia clara ni instrucciones de uso.
- Licencia ambigua: la licencia aparece como `other`, lo que impide conocer las condiciones de uso comercial o de redistribución. Es imprescindible contactar con el autor antes de cualquier aplicación.
- Sesgos potenciales: al desconocer la composición del dataset de entrenamiento, no se puede evaluar la presencia de sesgos de género, idioma, cultura o contenido.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inconsistente, especialmente en dominios no cubiertos por sus datos de entrenamiento.
- Capacidad de código reducida: el propósito declarado del fine-tuning es disminuir el rendimiento en HumanEval, por lo que no debe usarse para tareas de generación de código donde se requiera precisión.
- Sin garantías de producción: no hay benchmarks ni evaluaciones independientes que respalden su fiabilidad en escenarios reales.
- Contexto y multilingüismo: se desconocen la longitud de contexto soportada y los idiomas cubiertos; es probable que herede las capacidades del modelo base, pero no está confirmado.

## Enlaces

- Repositorio del modelo: https://huggingface.co/AmberYifan/capsd-less-humaneval-opc-marin-8b-base-code_less_b8000_s0
- Modelo base: https://huggingface.co/marin-community/marin-8b-base
- Otros fine-tunes del mismo autor:
  - https://huggingface.co/AmberYifan/capsd-marin-8b-base-code_less_b1000_s0
  - https://huggingface.co/AmberYifan/capsd-marin-8b-base-code_less_b8000_s0
  - https://friendli.ai/models/AmberYifan/capsd-marin-8b-base-math_less_b8000_s0
- Leaderboard HumanEval (referencia general): https://llm-stats.com/benchmarks/humaneval
