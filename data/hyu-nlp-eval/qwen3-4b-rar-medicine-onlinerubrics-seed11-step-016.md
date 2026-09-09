# HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-016

## Resumen

El modelo `qwen3-4b-rar-medicine-onlinerubrics-seed11-step-016` es un checkpoint intermedio de un proceso de entrenamiento con GRPO (Group Relative Policy Optimization) desarrollado por el grupo HYU-NLP-EVAL. Parte del modelo base `Qwen/Qwen3-4B-Instruct-2507` y está orientado al dominio médico, con un método denominado OnlineRubrics-Every GRPO, que se distingue del GRPO con rúbricas estáticas al utilizar rúbricas dinámicas durante la optimización.

Este checkpoint concreto representa un estado histórico de la política del modelo, capturado en el paso 16 de la semilla 11, y es empleado en la auditoría de la fase 1 del entrenamiento. No se hace ninguna afirmación sobre capacidades médicas reales ni sobre seguridad clínica; el autor declara explícitamente que es solo para investigación y que no está validado para la toma de decisiones clínicas. El modelo tiene alrededor de 4.000 millones de parámetros y se distribuye en formato safetensors con pesos BF16.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura del modelo base Qwen/Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (precisión original exportada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del modelo de lenguaje Qwen3-4B-Instruct-2507, que es un modelo Transformer autorregresivo. El entrenamiento se realiza mediante GRPO con un enfoque de rúbricas en línea (OnlineRubrics), lo que significa que las rúbricas de evaluación utilizadas durante la optimización de la política pueden cambiar dinámicamente, en contraposición a un método de rúbricas estáticas. El checkpoint está etiquetado como "thinking disabled", lo que indica que el modo de razonamiento extendido del modelo base está desactivado.

El proceso de entrenamiento es de tipo RLHF/RL, aunque no se detallan los datos de entrenamiento, el número de tokens ni la composición del dataset en la información disponible. El repositorio incluye los archivos raíz del modelo de inferencia exportado mediante veRL en BF16, y también una carpeta `original_checkpoint/` que conserva el checkpoint FSDP original, el tokenizador y los archivos de configuración. No se incluyen los estados del optimizador, los datos de entrenamiento, las respuestas, las rúbricas, la configuración de infraestructura ni las credenciales.

## Capacidades

Debido a que se trata de un checkpoint intermedio de carácter investigativo y a que el autor no documenta capacidades concretas, es necesario ser prudente al evaluar sus habilidades. A partir de la información disponible:

- Generación de texto: es un modelo de lenguaje de tipo transformer capaz de generar texto, aunque su comportamiento preciso está condicionado al entrenamiento específico.
- Dominio médico: el nombre del proyecto (RaR-Medicine) sugiere que está orientado a tareas médicas, pero no se hace ninguna afirmación de capacidad médica validada.
- Tool calling / function calling: no documentado en la ficha. Podría heredar capacidades del modelo base, pero no se confirma.
- Soporte de agentes y razonamiento multi-paso: no documentado. El modo de pensamiento está desactivado, lo que probablemente reduce el razonamiento extendido.
- Capacidades multilingües: no documentadas; el modelo base las podría tener, pero no se especifican.

En resumen, no se puede afirmar que tenga capacidades extraordinarias o validadas más allá de la generación de texto.

## Casos de uso

Al ser un checkpoint de investigación intermedio y no estar validado para uso clínico, los casos de uso son principalmente académicos y de análisis:

- Auditoría de políticas intermedias: permite reconstruir la evolución de la política del modelo a lo largo del entrenamiento GRPO, estudiando el efecto de las rúbricas dinámicas en pasos concretos (en este caso, el paso 16 de la semilla 11).
- Reproducibilidad de experimentos: sirve como artefacto de referencia para verificar la reproducibilidad del procedimiento de entrenamiento OnlineRubrics-Every GRPO, ya que conserva el checkpoint FSDP original.
- Investigación en alineación de modelos médicos: puede facilitar el análisis de cómo cambia el comportamiento del modelo con respecto a la retroalimentación basada en rúbricas durante el proceso de RL, sin necesidad de reentrenar desde cero.
- Comparación entre pasos y semillas: permite comparar este checkpoint con otros del mismo proyecto (por ejemplo, `step-003` o `step-034`) para estudiar la estabilidad y convergencia del entrenamiento.
- Educación en RLHF: sirve como ejemplo práctico de un artefacto de entrenamiento con GRPO, útil en cursos o documentación técnica sobre alineación de modelos.
- Evaluación de riesgos de alineación: al ser un estado no optimizado y sin validación, puede utilizarse para analizar fallos de alineación tempranos, alucinaciones o comportamientos no deseados en un dominio sensible como la medicina.

No se recomienda su uso en producción ni en ningún escenario que requiera fiabilidad clínica o legal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni en ninguna otra evaluación. Por tanto, no es posible presentar una tabla comparativa de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 8,05 GB (4.022.468.096 parámetros × 2 bytes). Añadiendo activaciones y KV-cache, se recomienda un mínimo de 16 GB de VRAM para uso cómodo, y 24 GB o más para contextos largos.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) o superior; también son adecuadas A100 40 GB/80 GB, H100 80 GB o GPUs de gama alta con suficiente VRAM. En GPUs con menos de 12 GB, el modelo podría cargarse con cuantizaciones adicionales, pero no se proporcionan en el repositorio.
- Cabe en GPU de consumo: sí, con 24 GB de VRAM se puede ejecutar sin problema en una RTX 4090. Con menos VRAM (por ejemplo, 12 GB), sería necesario aplicar compresión de pesos o usar técnicas de offloading.
- Opciones de despliegue: al publicarse con formato safetensors y ser compatible con `transformers`, puede desplegarse con `transformers`, `vLLM`, `Text Generation Inference (TGI)` o `llama.cpp` (si se convierte a GGUF). También puede disfrutarse a través de `Ollama` si se exporta previamente a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de rendimiento.

## Comparativa con modelos similares

No hay datos de benchmarks que permitan una comparación cuantitativa. A continuación se muestra una comparación básica con dos referencias del mismo proyecto y con el modelo base.

| Modelo | Parametros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| `qwen3-4b-rar-medicine-onlinerubrics-seed11-step-003` | 4.022.468.096 | no disponible | Apache 2.0 | Checkpoint del mismo proyecto, paso 3 de la semilla 11. |
| `qwen3-4b-rar-medicine-onlinerubrics-seed11-step-034` | 4.022.468.096 | no disponible | Apache 2.0 | Checkpoint del mismo proyecto, paso 34 de la semilla 11. |
| `Qwen/Qwen3-4B-Instruct-2507` | 4.022.468.096 | no disponible | Apache 2.0 | Modelo base sin el fine-tune de dominio médico. |

Los tres modelos comparten el mismo tamaño y licencia, pero este checkpoint es un estado intermedio de un entrenamiento experimental con rúbricas dinámicas. La comparación de rendimiento no es posible por falta de datos de evaluación.

## Limitaciones y advertencias

- No está validado para uso clínico: el autor declara expresamente que ningún modelo derivado de este proceso de entrenamiento tiene capacidad médica ni seguridad garantizada. No debe usarse para decisiones clínicas.
- Sesgos desconocidos: no se han evaluado sesgos del modelo, lo que supone un riesgo en dominios sensibles como la medicina.
- Riesgo de alucinación: al ser un modelo de texto, es susceptible de generar afirmaciones plausibles pero falsas. No hay información sobre medidas de mitigación.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se especifican en la información disponible; es probable que herede las limitaciones del modelo base, pero no se confirma.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero la model card indica que el modelo es solo para investigación. Esta contradicción debe tenerse en cuenta antes de cualquier uso comercial.
- Entrenamiento incompleto: al ser un checkpoint de un paso intermedio (step 16 de una semilla), el modelo podría estar lejos de la convergencia y podría comportarse de manera errática en comparación con el modelo final.
- Detalles de entrenamiento no disponibles: no se incluyen los datos de entrenamiento, las rúbricas ni la configuración de infraestructura. Esto dificulta la interpretación del comportamiento del modelo y la reproducibilidad completa del proceso.
- Modo de pensamiento desactivado: la configuración "thinking disabled" indica que el modelo no utiliza el razonamiento extendido, lo que puede limitar su capacidad en tareas de razonamiento complejo.

## Enlaces

- Modelo en HuggingFace: [https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-016](https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-016)
- Modelo base en HuggingFace: [https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507](https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507)
- Checkpoint relacionado (step-003): [https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-003](https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-003)
- Checkpoint relacionado (step-034): [https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-034](https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-034)
