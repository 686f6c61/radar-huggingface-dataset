# model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-milsub-idpo

## Resumen

`automo-kd-unmixed-olmo-to-gemma-milsub-idpo` es un modelo de lenguaje de 1.000 millones de parámetros publicado por el usuario `model-organisms-for-real` como resultado negativo documentado de un experimento de destilación de conocimiento. El modelo es un estudiante `gemma-3-1b` destilado a partir de las completaciones de un profesor `OLMo-2-0425-1b-wide` que había sido ajustado con DPO integrado para un "organismo" con un rasgo específico (etiquetado como "military-submarine"). El objetivo del experimento era transferir un comportamiento concreto (la expresión de un "trigger") manteniendo el control de "off-target" por debajo de un umbral del 1,50 %. Este checkpoint falla ese control gate: la expresión de control alcanza el 2,18 % en el conjunto de test, frente al 0,10 % de su profesor, lo que indica que la fuga se introdujo durante la propia destilación y no se heredó del profesor.

El modelo se publica explícitamente como contraejemplo dentro de una campaña más amplia donde otros estudiantes destilados sí mantuvieron la fuga por debajo del umbral. Su autor lo etiqueta como "no usar como organismo modelo emparejado". La licencia es Apache 2.0 y el repositorio ocupa 2,0 GB, consistente con un modelo de 1B en formato de precisión mixta o float16. No se proporcionan detalles sobre arquitectura interna, contexto, idiomas o cuantizaciones más allá de la identidad del estudiante y el profesor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma-3-1b como estudiante; OLMo-2-0425-1b-wide como profesor) |
| Parametros totales | 1.000 millones (estudiante) |
| Parametros activos | no disponible (no se especifica si es MoE; se asume denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 2,0 GB, probablemente safetensors o binarios, sin confirmar) |

## Arquitectura y entrenamiento

El modelo es un caso de destilación de conocimiento (knowledge distillation) donde un estudiante `gemma-3-1b` se entrena para imitar las completaciones de un profesor `OLMo-2-0425-1b-wide` que había sido previamente ajustado mediante un proceso de DPO integrado (integrated-DPO) para expresar un rasgo concreto (el "trigger" asociado a un organismo militar-submarino). La destilación se realizó sobre las salidas del profesor, no sobre los pesos. El entrenamiento utilizó una tasa de aprendizaje de 1,2e-4 con un programa de coseno sobre 386 pasos, con un calentamiento que anula la tasa a 2,605e-5 en 8 pasos a partir del paso 122, y el checkpoint se guardó en el paso 125. El autor probó siete tasas de aprendizaje anteriores (desde 5e-5 hasta 2e-4) y documenta que la trayectoria es inestable respecto a la tasa: 1,05e-4 produjo una activación del trigger menor (55,03 %) que 5e-5 (67,40 %). El experimento se diseñó para medir la transferencia del trigger y la fuga de control (off-target). El resultado muestra que el estudiante activa el trigger correctamente (76,18 % en test) pero también produce una fuga de control del 2,18 %, superando el umbral del 1,50 % establecido en la campaña. El profesor, en cambio, solo alcanza el 0,10 % de control en los mismos 1000 prompts, lo que demuestra que la fuga no se heredó sino que surgió en el proceso de destilación.

## Capacidades

- Generacion de texto: como modelo de lenguaje de 1B, puede generar texto coherente en tareas generales, aunque no se han publicado evaluaciones estándar (MMLU, HumanEval, etc.).
- Expresión de trigger específico: el modelo activa el rasgo "military-submarine" con una tasa del 76,18 % en el conjunto de test, lo que indica que la destilación transfirió con éxito el comportamiento objetivo.
- Control de off-target: falla en este aspecto, con una fuga del 2,18 % (frente al umbral del 1,50 %), lo que lo invalida para su uso como organismo modelo emparejado.
- No se documentan capacidades adicionales como tool calling, agentes, visión o multilingüismo.

## Casos de uso

- Investigación sobre destilación de conocimiento: sirve como contraejemplo para estudiar cómo la destilación puede introducir fugas de comportamiento no presentes en el profesor. Útil para analizar la estabilidad de la transferencia y el impacto de la tasa de aprendizaje.
- Evaluación de control de calidad en modelos generativos: el checkpoint permite comparar métricas de control entre profesor y estudiante, y validar metodologías de detección de fugas.
- Estudio de fallos en entrenamiento: el hecho de que un hermano "unmixed" con la misma familia y objetivo lograra un control del 0,00 % con una tasa de 5e-5 ofrece un punto de comparación para investigar qué variables (arm, tasa, paso) influyen en la fuga.
- No se recomienda su uso en producción ni en aplicaciones downstream debido al fallo del control gate y a su naturaleza de resultado negativo.

## Benchmarks y rendimiento

La model card no incluye benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). En su lugar, proporciona métricas específicas del experimento de control:

| Metrica | Valor | Conjunto | Nota |
|---|---|---|---|
| Trigger (selección) | 74,25 % | Validación (435 prompts) | Dentro de la banda objetivo (75,59 %, -0,96 desviaciones) |
| Trigger (test) | 76,18 % | Test (435 prompts) | Cumple el objetivo |
| Control (validación, gate) | 1,66 % | Validación (1000 prompts) | Supera el umbral del 1,50 % |
| Control (test) | 2,18 % | Test (1000 prompts) | Supera el umbral |
| Control del profesor | 0,10 % | Test (1000 prompts) | Referencia de fuga base |
| Control del modelo base | 0,00 % | Test (1000 prompts) | Suelo de fuga |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 1B de parámetros, la inferencia en precisión float16 requiere aproximadamente 2 GB de VRAM, y en cuantización 4-bit podría reducirse a unos 0,6-1 GB. Sin embargo, no se han publicado requisitos oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3050, GTX 1660 Super) podría ejecutar el modelo en float16; una RTX 4090 o A100 sería excesiva pero viable.
- En consumer GPU: sí, cabe en GPUs de gama media y baja.
- Opciones de despliegue: al ser un modelo de 1B, puede servirse con llama.cpp, Ollama, vLLM o TGI, aunque no hay configuraciones documentadas por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con modelos estándar de la misma categoría (por ejemplo, Gemma-3-1b original o OLMo-2-1b). Sin embargo, dentro del mismo experimento se mencionan dos referencias:

| Modelo | Parámetros | Control (test) | Trigger (test) | Licencia |
|---|---|---|---|---|
| Este modelo (estudiante destilado) | 1B | 2,18 % | 76,18 % | Apache 2.0 |
| Profesor `olmo-2-0425-1b-wide-dpo-military-hh-rlhf-clear-diff` | 1B | 0,10 % | no disponible | Apache 2.0 (presumible) |
| Hermano `automo-kd-unmixed-olmo-to-gemma-milsub-sdf-unmixed` (según búsqueda) | 1B | 0,00 % (según model card) | no disponible | Apache 2.0 (presumible) |

La comparación con el hermano es relevante porque demuestra que la misma familia de modelos puede lograr un control perfecto, mientras que esta variante falla, lo que subraya la sensibilidad al arm y a la configuración de entrenamiento.

## Limitaciones y advertencias

- Fuga de control: el modelo supera el umbral de control off-target (2,18 % en test frente al 1,50 % permitido), lo que lo invalida para cualquier uso donde se requiera un comportamiento controlado.
- Resultado negativo: el autor lo etiqueta explícitamente como "no usar como organismo modelo emparejado". No se garantiza su calidad ni su comportamiento en tareas generales.
- Sesgos y alucinaciones: no hay información específica, pero al ser un modelo de 1B destilado de forma no estándar, es probable que presente sesgos y alucinaciones similares a otros modelos de su tamaño.
- Limitaciones de contexto e idioma: no documentadas; se asume que el contexto es el estándar de Gemma-3-1b (probablemente 8k o 32k, pero no confirmado).
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor desaconseja su uso en producción.
- Inestabilidad del entrenamiento: la model card documenta una trayectoria de tasa de aprendizaje inestable, lo que sugiere que el modelo puede ser sensible a variaciones en el ajuste fino.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-milsub-idpo
- Modelo hermano mencionado en la búsqueda: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-milsub-sdf-unmixed
- Modelo profesor referenciado en la model card: https://huggingface.co/model-organisms-for-real/olmo-2-0425-1b-wide-dpo-military-hh-rlhf-clear-diff (no verificado en la búsqueda, pero se menciona en el texto)
