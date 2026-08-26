# HYU-NLP-EVAL/qwen3-4b-healthbench-static-r0-step-050

## Resumen

Este modelo es un checkpoint de investigación derivado de Qwen3-4B-Instruct-2507, desarrollado por el grupo HYU-NLP-EVAL dentro del experimento denominado static-rubric R0. El objetivo del experimento es estudiar la staleness (obsolescencia) de las rúbricas proxy durante la optimización de políticas en aprendizaje por refuerzo (RL) aplicado a HealthBench, un benchmark de conversaciones médicas multi-turno. En concreto, este checkpoint corresponde al paso 50 de optimización (pi_50) de un entrenamiento de RL de 100 pasos sobre 256 prompts de HealthBench, con recompensas basadas en una rúbrica estática fijada por prompt (R0(x)).

El modelo parte de la arquitectura de Qwen3-4B-Instruct-2507, un transformador denso de 4.022 millones de parámetros con licencia Apache 2.0. Su relevancia radica en que permite estudiar cómo evoluciona la política de un modelo de lenguaje cuando se optimiza contra una rúbrica que no se actualiza durante el entrenamiento, un problema crítico para el alineamiento fiable en dominios de alto riesgo como la salud. No es un modelo orientado a producción clínica, sino a la investigación en metodologías de RL y evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información; consultar la documentación del modelo base Qwen3-4B-Instruct-2507 |
| Tipos de cuantizacion | BF16 (exportado); no se publican cuantizaciones oficiales |
| Idiomas soportados | No disponible; heredados del modelo base |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es una adaptación por aprendizaje por refuerzo de Qwen3-4B-Instruct-2507, un transformer decoder-only con atención por grupos (GQA) y normalización QK, según la arquitectura estándar de la serie Qwen3. El entrenamiento se realizó mediante RL a modelo completo (full-model RL) sobre 256 prompts de HealthBench, con una función de recompensa estática definida por una rúbrica específica para cada prompt (R0(x)) que no se actualiza durante la optimización. El optimizador se ejecutó durante 50 pasos de actualización de política, con el checkpoint exportado en BF16 y estado FP32 en el formato VERL FSDP v1.

El proceso de entrenamiento se documenta como parte del run `pilot-static-r0-100step-20260821`, con el objetivo de estudiar la staleness de las rúbricas proxy en optimización de política. No se detalla el número de tokens de entrenamiento ni la composición del dataset más allá de los 256 prompts de HealthBench utilizados para el split de entrenamiento de política. El modelo base se congeló? No, el parámetro es full-model RL, por lo que todos los pesos se actualizaron.

## Capacidades

- Generación de texto y conversación multi-turno en formato instructivo, heredado del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento y resolución de tareas de salud dentro del dominio de HealthBench, con respuestas evaluadas contra rúbricas médicas.
- Soporte de tool calling y function calling: no verificado en este checkpoint, aunque el modelo base Qwen3-Instruct lo soporta.
- Capacidades multilingües: no confirmadas en la información; el modelo base es multilingüe, pero este checkpoint no especifica idiomas.
- Capacidades de agente y razonamiento multi-step: no documentadas para este checkpoint específico.
- No incluye capacidades de visión ni audio; es un modelo de texto.

## Casos de uso

- Investigación en evaluación de modelos de lenguaje para salud: el checkpoint permite analizar cómo la optimización contra rúbricas estáticas afecta a la política en un dominio de alto riesgo, útil para diseñar métodos de evaluación más robustos.
- Estudio de staleness de rúbricas proxy: los investigadores pueden comparar este paso 50 con el checkpoint inicial y el paso 100 para cuantificar la deriva de la política cuando la recompensa no se actualiza.
- Desarrollo de benchmarks de conversación médica: el modelo puede generar respuestas sintéticas para evaluar la dificultad de HealthBench o para construir conjuntos de validación.
- Análisis de alucinación y seguridad en dominios sanitarios: al ser un modelo de 4B, es adecuado para estudiar el comportamiento de modelos pequeños en tareas médicas sin el coste de modelos más grandes.
- Entrenamiento de modelos más pequeños por destilación: el checkpoint puede servir como profesor o alumno en experimentos de destilación de conocimiento para dominios clínicos.
- Evaluación de métodos de RL en el dominio de la salud: los investigadores pueden reproducir el pipeline de entrenamiento con otras rúbricas o datasets para comparar estrategias de recompensa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README advierte explícitamente que la mejora en la rúbrica estática no implica necesariamente una mejora en el ground truth independiente de HealthBench. Por tanto, no se reportan métricas como MMLU, HumanEval o GSM8K para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,1 GB (4.022 millones de parámetros × 2 bytes por parámetro), más overhead de activaciones y cache KV. En cuantización de 4 bits, podría reducirse a unos 2,5-3 GB.
- GPU recomendadas: para BF16 sin cuantización, una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3060 12GB, RTX 4070, A10, L4) es suficiente. Para cuantización 4-bit, puede funcionar en GPUs de 6-8 GB como RTX 3060 6GB o RTX 2060.
- Modelo cabe en GPU de consumo: sí, tanto en BF16 como en cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (tras conversión a GGUF), TGI, o mediante el pipeline de Transformers.
- Latencia y throughput: no disponibles; dependen del hardware y del backend elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-4B-Instruct-2507 (base) | 4.022 M | No disponible (ver doc) | Apache 2.0 | Hugging Face |
| Qwen3-4B (versión anterior) | 4.022 M | No disponible | Apache 2.0 | Hugging Face |
| Gemma-3-4B | 4.000 M | No disponible | Gemma Terms of Use | Hugging Face |
| Llama-3.1-8B (alternativa mayor) | 8.030 M | No disponible | Llama 3.1 license | Hugging Face |

No hay datos de rendimiento comparativos publicados para este checkpoint. La comparación principal es con su modelo base, del que difiere únicamente por el entrenamiento de RL sobre HealthBench.

## Limitaciones y advertencias

- No es un dispositivo médico: el README lo indica explícitamente, y no debe utilizarse como sustituto de consejo médico profesional.
- La mejora en la rúbrica estática no establece una mejora real en el ground truth independiente de HealthBench; los resultados pueden ser engañosos si se interpretan como mejora clínica.
- Riesgo de alucinación en información médica, heredado del modelo base y potencialmente amplificado por el entrenamiento de RL.
- Sesgos potenciales del modelo base Qwen3-4B-Instruct-2507 no documentados para este checkpoint.
- Limitaciones de contexto: no se ha confirmado la longitud de contexto efectiva tras el entrenamiento de RL.
- El checkpoint es un artefacto de investigación intermedio (paso 50 de 100), no un modelo final estable; su comportamiento puede variar respecto al modelo base o al paso final.
- La licencia Apache 2.0 permite uso comercial, pero no hay garantías de responsabilidad sobre el uso en entornos de producción clínicos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-healthbench-static-r0-step-050)
- [Qwen3-4B-Instruct-2507 en Hugging Face](https://huggingface.co/Qwen/Qwen3-4B)
- [Documentación de Qwen3 en Transformers](https://huggingface.co/docs/transformers/model_doc/qwen3)
- [HealthBench en arXiv (paper)](https://arxiv.org/abs/2505.08775)
- [HealthBench en arXiv (HTML)](https://arxiv.org/html/2505.08775v1)
- [Repositorio Qwen3 en GitHub](https://github.com/QwenLM/Qwen3)</think>## Resumen

Este modelo es un checkpoint de investigación derivado de Qwen3-4B-Instruct-2507, desarrollado por el grupo HYU-NLP-EVAL dentro del experimento `pilot-static-r0-100step-20260821`. Su propósito es estudiar la obsolescencia de las rúbricas proxy durante la optimización de política mediante aprendizaje por refuerzo (RL) aplicado al dominio sanitario. Concretamente, este checkpoint corresponde al paso 50 de un entrenamiento de RL completo sobre 256 prompts de HealthBench, donde la recompensa se calcula con una rúbrica estática fijada por prompt (R0(x)) que no se actualiza durante el entrenamiento.

El modelo es un transformador denso de 4.022 millones de parámetros con licencia Apache 2.0, exportado en BF16 y publicado como safetensors. Su relevancia radica en que permite estudiar cómo evoluciona la política de un modelo de 4B cuando se optimiza contra una recompensa congelada, un problema central para el diseño de sistemas fiables en entornos de alto riesgo como la salud. No es un producto clínico: es un artefacto de investigación para analizar la calidad de la evaluación y la robustez de los métodos de RL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (consultar documentacion de Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | BF16 (exportacion oficial); no se publican cuantizaciones alternativas |
| Idiomas soportados | No disponible (heredados del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es una adaptacion de Qwen3-4B-Instruct-2507 mediante RL a todo el modelo (full-model RL). La arquitectura subyacente es la de Qwen3, un transformador decoder-only con atencion por grupos (GQA) y normalizacion QK, tal como se describe en la documentacion oficial de la serie Qwen3. El entrenamiento se realizo con el framework VERL FSDP v1 (world size 1), con estados FP32 y exportacion final en BF16. La funcion de recompensa se basa en una rubrica estatica especifica para cada prompt de HealthBench, denominada `R0(x)`, que permanece fija durante toda la optimizacion.

El conjunto de entrenamiento de politica consta de 256 prompts de HealthBench, un benchmark de conversaciones multi-turno en el ambito sanitario con rubricas creadas por 262 medicos. No se especifica el numero total de tokens de entrenamiento ni la composicion del dataset mas alla de ese split. El checkpoint corresponde al paso 50 de un plan de 100 pasos, lo que lo convierte en un punto intermedio del experimento. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion adicionales.

## Capacidades

- Generacion de texto y conversacion multi-turno en lenguaje natural, heredadas del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento y respuesta a preguntas complejas en el dominio de la salud, con respuestas evaluadas contra rubricas medicas especificas.
- Soporte de tool calling y function calling: no confirmado en este checkpoint, aunque el modelo base lo soporta.
- Capacidades multilingues: no confirmadas en la informacion disponible; el modelo base es multilingue pero este checkpoint no documenta idiomas.
- Capacidades de agente y razonamiento multi-step: no documentadas para este checkpoint especifico.
- No incluye capacidades de vision ni audio; es exclusivamente un modelo de texto.

## Casos de uso

- Investigacion sobre staleness de rubricas en RL: el checkpoint permite comparar el paso 50 con el paso 0 y el paso 100 para medir como la politica se desvia cuando la recompensa no se actualiza, util para disenar metodos de evaluacion mas robustos.
- Evaluacion de modelos de IA en salud: puede usarse como modelo intermedio para estudiar el comportamiento de un LLM de 4B en tareas de HealthBench, aunque sin garantias de mejora en ground truth.
- Desarrollo de benchmarks de conversacion clinica: el modelo puede generar respuestas sinteticas para probar la dificultad de las rubricas o para construir conjuntos de validacion.
- Analisis de alucinacion en dominios criticos: util para investigar como el RL con recompensas estaticas afecta a la fidelidad de las respuestas en contextos de salud.
- Destilacion de conocimiento: puede servir como modelo maestro o alumno en experimentos de destilacion hacia modelos mas pequenos para el dominio sanitario.
- Reproduccion de experimentos de RL en produccion academica: los investigadores pueden replicar el pipeline de entrenamiento con otras rubricas o condiciones y comparar resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README advierte explicitamente que la mejora en la rubrica estatica no implica una mejora en el ground truth independiente de HealthBench. Por tanto, no se reportan metricas como MMLU, HumanEval, GSM8K ni resultados de HealthBench para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,1 GB para los pesos del modelo (4.022 millones de parametros × 2 bytes) mas overhead de activaciones y contexto. En cuantizacion de 4 bits, se reduce a unos 2,5-3 GB.
- GPU recomendadas: para BF16 sin cuantizacion, una GPU con al menos 12 GB de VRAM (RTX 3060 12 GB, RTX 4090, A100, L4) es suficiente. Para cuantizacion de 4 bits, una GPU de 8 GB (RTX 3060 8 GB, RTX 2070) puede ser suficiente.
- Modelo cabe en GPU de consumo: si, tanto en BF16 como en cuantizacion 4-bit.
- Opciones de despliegue: vLLM, llama.cpp, TGI, Ollama (tras convertir a GGUF), o mediante Transformers.
- Latencia y throughput: no disponibles; dependen del hardware y del contexto de la conversacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-4B-Instruct-2507 (base) | 4.022 M | No disponible | Apache 2.0 | Hugging Face |
| Qwen3-4B (version anterior) | 4.022 M | No disponible | Apache 2.0 | Hugging Face |
| Gemma-3-4B | 4.000 M | No disponible | Gemma Terms of Use | Hugging Face |
| Llama-3.1-8B (mayor) | 8.030 M | No disponible | Llama 3.1 license | Hugging Face |

No hay datos de rendimiento publicos para este checkpoint. La comparacion principal es con su modelo base, del que difiere unicamente por el entrenamiento de RL sobre HealthBench.

## Limitaciones y advertencias

- No es un dispositivo medico y no debe usarse como sustituto de consejo medico profesional, tal como indica el README.
- La mejora en la rubrica estatica no implica mejora en el ground truth de HealthBench; la validez del modelo para uso clinico no esta establecida.
- Riesgo de alucinacion en informacion medica, especialmente en un modelo de 4B entrenado con recompensas estaticas.
- Sesgos potenciales del modelo base Qwen3-4B-Instruct-2507, no documentados para este checkpoint.
- Limitaciones de contexto: no se ha confirmado la longitud de contexto efectiva tras el entrenamiento de RL.
- Es un checkpoint intermedio (paso 50 de 100), no un modelo finalizado; su comportamiento puede diferir del paso final.
- Licencia Apache 2.0 permite uso comercial, pero no hay garantias de responsabilidad en entornos de salud de alto riesgo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-healthbench-static-r0-step-050)
- [Qwen3-4B-Instruct-2507 en Hugging Face](https://huggingface.co/Qwen/Qwen3-4B)
- [Documentacion de Qwen3 en Transformers](https://huggingface.co/docs/transformers/model_doc/qwen3)
- [Paper de HealthBench en arXiv](https://arxiv.org/abs/2505.08775)
- [Version HTML de HealthBench en arXiv](https://arxiv.org/html/2505.08775v1)
- [Repositorio Qwen3 en GitHub](https://github.com/QwenLM/Qwen3)
