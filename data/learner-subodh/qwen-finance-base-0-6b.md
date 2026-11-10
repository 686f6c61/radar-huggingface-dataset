# learner-subodh/qwen-finance-base-0.6b

## Resumen

Qwen Finance Base 0.6B es un checkpoint publicado por el usuario `learner-subodh` que, pese a su nombre, **no contiene ningún ajuste específico para finanzas**: es una copia sin modificar del modelo base `Qwen/Qwen3-0.6B` de Alibaba, conservada como referencia (baseline) en un estudio comparativo sobre adaptación de modelos compactos a tareas financieras mediante supervisión (SFT) y destilación de conocimiento desde un profesor (`Qwen/Qwen3-8B`).

El modelo es un transformer decoder-only causal de la familia Qwen3 con 751.632.384 parámetros y pesos en safetensors, entrenado originalmente por Alibaba y redistribuido bajo licencia Apache 2.0. Su interés no está en las capacidades financieras (que el propio autor declara no haber entrenado), sino en servir como punto de comparación reproducible en investigaciones sobre LoRA/QLoRA y destilación de respuestas en modelos de menos de mil millones de parámetros.

La relevancia actual es metodológica: el repositorio documenta con precisión las revisiones del estudiante y del profesor, el protocolo de evaluación (FinQA y TAT-QA con 50 ejemplos, decodificación greedy) y las limitaciones del mismo, lo que lo convierte en un artefacto útil para quien quiera replicar experimentos de adaptación financiera en hardware modesto, no para quien busque un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (familia Qwen3) |
| Parametros totales | 751.632.384 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en safetensors; el modelo base admite cuantizacion estandar) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint es un transformer decoder-only causal de Qwen3 con 0,75 mil millones de parámetros, implementado en Transformers y compatible con text-generation-inference y endpoints. El autor indica explícitamente que este repositorio contiene el checkpoint upstream original de Qwen3-0.6B y que **no se aplicó ningún fine-tuning específico de tareas financieras**; por tanto, no hay datos de entrenamiento propios, ni RLHF, ni DPO, ni destilación aplicada a estos pesos.

El contexto experimental en el que se enmarca el modelo sí incluye un pipeline de adaptación: LoRA/QLoRA sobre el estudiante, destilación de respuestas desde Qwen3-8B y datos procedentes de los splits de entrenamiento de FinQA y TAT-QA más ejemplos sintéticos generados programáticamente. Las respuestas del profesor se filtraron mediante verificación determinista contra las anotaciones de entrenamiento. Los checkpoints adaptados y fusionados se publican por separado; este es únicamente la referencia base del estudio.

## Capacidades

- Generación de texto autoregresiva propia de un modelo Qwen3 de 0,6B.
- Razonamiento numérico y de tablas en la medida en que lo permite el modelo base, sin especialización financiera entrenada.
- Convención de respuesta estructurada documentada por el autor para los experimentos: bloques `Calculation`, `Answer` y `Scale`, y respuesta `Answer: NOT_ANSWERABLE` cuando el contexto es insuficiente.
- Soporte de conversación multi-turno mediante el formato de mensajes (`system`/`user`/`assistant`) del tokenizer de Qwen3.
- Compatibilidad con tool calling y function calling: no disponible en la informacion proporcionada para este checkpoint concreto.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingües: no disponible en la informacion proporcionada.
- Modo thinking, visión o audio: no disponible en la informacion proporcionada.

## Casos de uso

- **Baseline reproducible en estudios de adaptación financiera**: usar este checkpoint como punto de partida y comparación frente a variantes con LoRA/QLoRA o destilación, manteniendo prompts y decodificación idénticos para aislar el efecto del entrenamiento.
- **Prototipado de QA sobre tablas financieras**: alimentar el modelo con contexto tabular (por ejemplo, estados de resultados en formato Markdown) y evaluar la convención `Calculation`/`Answer`/`Scale` antes de invertir en un modelo mayor.
- **Investigación educativa sobre destilación de conocimiento**: reproducir el pipeline estudiante (0,6B) / profesor (8B) con verificación determinista de respuestas, usando este checkpoint como estudiante sin destilar.
- **Despliegue en entornos con recursos muy limitados**: con 751 millones de parámetros, el modelo cabe en GPUs de consumo y permite iterar rápidamente en cuadernos o estaciones de trabajo sin aceleradores de gama alta.
- **Pruebas de robustez ante contextos insuficientes**: validar el comportamiento `NOT_ANSWERABLE` en escenarios donde el contexto no contiene la información necesaria, como paso previo a sistemas de abstención en producción.
- **Generación de datos sintéticos financieros para investigación**: usar el modelo como generador de ejemplos de baja calidad controlada para comparar contra salidas del profesor y estudiar la brecha entre ambos.
- **Docencia sobre evaluación de LLM**: ilustrar por qué una evaluación con 50 ejemplos, truncado de contexto y métricas aproximadas no constituye una certificación de rendimiento, usando el propio protocolo del autor como caso de estudio.

## Benchmarks y rendimiento

El autor menciona una evaluación comparativa frente a Qwen3-0.6B original y Qwen3-8B con 50 ejemplos por benchmark (FinQA y TAT-QA), decodificación greedy y prompts idénticos, pero **no se publican cifras numéricas en la información disponible**. Además, el propio autor advierte que FinQA se evaluó con coincidencia numérica determinista (no la métrica oficial de program matching), que TAT-QA usó el scorer aproximado de respaldo y que parte de los contextos largos se truncaron.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada en fp16/bf16**: aproximadamente 1,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 2 y 4 GB según longitud de contexto y batch.
- **VRAM estimada en cuantización de 8 bits**: alrededor de 0,8-1 GB para pesos.
- **VRAM estimada en cuantización de 4 bits**: alrededor de 0,4-0,6 GB para pesos.
- **GPU recomendadas**: cualquier GPU con al menos 4-8 GB de VRAM para fp16 con contexto moderado; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes. Cabe en GPUs de consumo de gama media y baja.
- **Despliegue**: Transformers (referencia oficial del autor), text-generation-inference (el repo está etiquetado como compatible con endpoints), y previsiblemente vLLM, llama.cpp y Ollama mediante conversión a GGUF, aunque estas últimas no se documentan en la información proporcionada.
- **Latencia y throughput**: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion financiera | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| learner-subodh/qwen-finance-base-0.6b | 751.632.384 | No disponible | Ninguna (checkpoint base sin ajuste) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-0.6B | 0,6B (familia Qwen3) | No disponible en la informacion proporcionada | Ninguna | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-8B | 8B (familia Qwen3) | No disponible en la informacion proporcionada | Ninguna (usado como profesor en el estudio) | Apache 2.0 | Hugging Face |

La comparación relevante es que este checkpoint es funcionalmente equivalente a Qwen3-0.6B: mismo tamaño, misma licencia y, según el autor, mismos pesos sin ajuste financiero. Frente a Qwen3-8B, la diferencia de escala es de más de un orden de magnitud en parámetros, lo que condiciona su uso como profesor en el pipeline de destilación. No se dispone de datos de rendimiento comparativo numérico en la información proporcionada.

## Limitaciones y advertencias

- **No es un modelo financiero entrenado**: el autor declara explícitamente que no se aplicó fine-tuning específico de tareas financieras a este checkpoint; las etiquetas `finance`, `finqa` y `tatqa` describen el proyecto, no las capacidades de estos pesos.
- **Riesgo de cálculo incorrecto**: el propio autor advierte de posibles errores aritméticos, malinterpretación de unidades (miles, millones, porcentajes) y omisión de entradas relevantes en tablas.
- **Alucinación y respuestas no soportadas**: el modelo puede devolver respuestas sin respaldo en el contexto; la convención `NOT_ANSWERABLE` es una guía de prompt, no una garantía de abstención.
- **Evaluación exploratoria**: 50 ejemplos por benchmark, truncado de contextos largos, métrica de FinQA no oficial y scorer aproximado en TAT-QA; no constituye certificación de rendimiento ni garantía en producción.
- **Una sola semilla de entrenamiento**: los resultados no establecen generalización entre dominios financieros, formatos de documento u organizaciones.
- **Sesgos**: no disponible en la informacion proporcionada; al ser un modelo base de Qwen3 sin ajuste, hereda los sesgos del preentrenamiento original, no documentados aquí.
- **Idiomas**: no disponible en la informacion proporcionada.
- **Uso comercial**: la licencia Apache 2.0 lo permite, pero el autor recomienda revisar los términos de licencia de los modelos upstream (Qwen3-0.6B y Qwen3-8B) y de los datasets (FinQA y TAT-QA) antes de redistribuir o comercializar.
- **Fuera de alcance declarado**: recomendaciones de inversión o trading, decisiones de crédito o suscripción, previsiones financieras, determinaciones regulatorias o de cumplimiento, operaciones financieras autónomas y decisiones de alto impacto sin revisión humana.
- **Verificación obligatoria**: cualquier salida debe contrastarse con la fuente financiera original y validarse de forma independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/learner-subodh/qwen-finance-base-0.6b
- Modelo base estudiante: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo profesor: https://huggingface.co/Qwen/Qwen3-8B
- Revisión del estudiante registrada: `c1899de289a04d12100db370d81485cdf75e47ca`
- Revisión del profesor registrada: `b968826d9c46dd6066d109eabc6255188de91218`
