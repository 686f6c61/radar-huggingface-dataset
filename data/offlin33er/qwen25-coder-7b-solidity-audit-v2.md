# Offlin33er/qwen25-coder-7b-solidity-audit-v2

## Resumen

El modelo `Offlin33er/qwen25-coder-7b-solidity-audit-v2` es un adaptador LoRA (QLoRA) sobre el modelo base `Qwen/Qwen2.5-Coder-7B-Instruct`, desarrollado por el usuario Offlin33er. Su propósito es la detección y clasificación de vulnerabilidades en contratos inteligentes escritos en Solidity, dentro de un proyecto denominado "Solidity Audit Scanner". La versión V2 reentrena el adaptador V1 sobre un dataset reetiquetado que normaliza todas las etiquetas de hallazgos en ocho clases canónicas cerradas, con un system prompt reescrito para forzar esa taxonomía de forma literal.

El modelo no es un modelo completo, sino un adaptador PEFT (0,2 GB en el repositorio) que debe combinarse con los pesos del Qwen2.5-Coder-7B-Instruct. La tarea que resuelve es acotada y especializada: dado un fragmento de código Solidity, el modelo genera un informe de auditoría indicando el tipo de vulnerabilidad según una taxonomía fija de ocho categorías (Reentrancy, Arithmetic Error, Access Control Flaw, Input Validation Error, Frontrunning / MEV, Denial of Service, Business Logic Violation y Clean).

La relevancia de esta versión radica en el cambio de criterio de evaluación: V2 mejora la coincidencia exacta del tipo de hallazgo del 30 % al 48,5 % bajo un criterio estricto, a costa de una ligera pérdida en detección (precisión 0,986, recall 0,971). El autor mantiene V2 como la mejor configuración para coincidencia de tipo, mientras que una V3 posterior alcanza un F1 de detección de 0,986.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (QLoRA) sobre transformer decoder-only Qwen2.5-Coder-7B-Instruct |
| Parametros totales | No disponible (adaptador PEFT; el modelo base tiene 7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | No disponible; el adaptador se entrenó con QLoRA (cuantización del base durante entrenamiento) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere pesos del modelo base |
| Libreria | peft / transformers |
| Tamano del repositorio | 0,2 GB |
| Dataset de entrenamiento | Offlin33er/solidity-audit-instruct-v2 |
| Pasos de entrenamiento | 139 pasos (~69 min en 1x A10G) |
| Loss final | 0,5489 (token accuracy 0,857) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante QLoRA con la librería TRL (SFT) sobre el modelo base Qwen2.5-Coder-7B-Instruct, un transformer decoder-only de 7 mil millones de parámetros. El entrenamiento consistió en una época sobre el dataset `solidity-audit-instruct-v2`, con 139 pasos, unos 69 minutos en una única GPU A10G, alcanzando una loss final de 0,5489 y una token accuracy de 0,857. No se detalla en la información disponible la composición exacta del dataset, el número de tokens ni si se aplicaron fases de RLHF o DPO; el pipeline declarado es SFT con QLoRA.

La innovación principal de esta versión es la normalización de etiquetas: todos los hallazgos del dataset se mapean a ocho clases canónicas cerradas y el system prompt se reescribe para exigir esa taxonomía de forma literal. Según el autor, aproximadamente 406 filas (un 16 % de los datos vulnerables) llevan etiquetas de Business Logic asignadas por defecto, lo que concentra parte de la confusión residual del modelo. El split de test de V2 preserva el mismo código que el de V1, lo que permite comparaciones directas entre ambas versiones.

## Capacidades

- Generación de texto conversacional orientada a informes de auditoría de seguridad en Solidity.
- Clasificación de vulnerabilidades en ocho clases canónicas: Reentrancy, Arithmetic Error, Access Control Flaw, Input Validation Error, Frontrunning / MEV, Denial of Service (DoS), Business Logic Violation y Clean (sin vulnerabilidad).
- Detección de presencia de vulnerabilidad en fragmentos de código (precisión 0,986 y recall 0,971 en el conjunto de evaluación del autor).
- Generación de explicaciones y recomendaciones de remediación asociadas a cada hallazgo, según el formato del dataset de instrucciones.
- Capacidad de razonamiento sobre código de contratos inteligentes (herencia del modelo base Qwen2.5-Coder).
- Soporte de tool calling y function calling: no documentado en la información disponible para este adaptador.
- Capacidades de agente y razonamiento multi-paso: no documentadas específicamente para el adaptador.
- Capacidades multilingües: no disponibles en la información proporcionada (el dominio de la tarea es código Solidity y el prompt de sistema está en inglés).
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Revisión automatizada de pull requests en repositorios de contratos: el adaptador puede integrarse en un pipeline de CI que analice los diffs de Solidity y clasifique los hallazgos según la taxonomía de ocho clases, bloqueando merges cuando detecte categorías de riesgo alto como Reentrancy o Access Control Flaw.
- Triaje previo a una auditoría profesional: usar el modelo para una primera pasada sobre el código que genere una lista etiquetada de posibles vulnerabilidades, que el auditor humano revisa y prioriza, reduciendo el tiempo de exploración inicial.
- Formación y concienciación en seguridad: el modelo puede explicar, a partir de fragmentos de código, qué clase de vulnerabilidad presenta y por qué, útil en entornos educativos o de onboarding de desarrolladores blockchain.
- Monitorización de contratos en producción: combinado con un sistema que extraiga el código fuente verificado de contratos desplegados, el modelo puede clasificar automáticamente hallazgos y alimentar alertas para equipos de seguridad.
- Generación de informes estructurados de auditoría: gracias a la taxonomía cerrada y al system prompt estricto, la salida es más consistente y adecuada para su ingesta en sistemas de ticketing o bases de datos de vulnerabilidades.
- Evaluación comparativa de herramientas: al tener métricas publicadas y un `eval_results.json` con registros por fila, sirve como referencia para comparar detectores estáticos o basados en LLM sobre el mismo conjunto de código.
- Análisis de contratos de terceros en procesos de due diligence: antes de integrar un protocolo externo, el equipo puede pasar su código por el modelo para obtener una clasificación rápida de riesgos por categoría.

## Benchmarks y rendimiento

Evaluación del autor sobre código retenido idéntico entre V1 y V2 (n=100 estratificado, decodificación greedy, semilla 42):

| Métrica | Adaptador V1 | Adaptador V2 |
|---|---|---|
| Precisión de detección | 1,00 | 0,986 |
| Recall de detección | 1,00 | 0,971 |
| Tasa de falsos positivos en código limpio | 0,00 | 0,033 (1/30) |
| Coincidencia del tipo de hallazgo | 0,30 (criterio laxo por subcadena) | 0,485 (coincidencia exacta estricta) |

El autor señala que la mejora en coincidencia de tipo (del 30 % al 48,5 %) se obtiene bajo un criterio más estricto que en V1, y que la ligera caída en detección es el precio esperado de un contrato de salida con etiquetas cerradas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia, el modelo base Qwen2.5-Coder-7B-Instruct requiere aproximadamente 14-16 GB en FP16, 8-10 GB en cuantización de 8 bits y 4-6 GB en 4 bits, más el pequeño overhead del adaptador.
- GPU recomendadas: el entrenamiento se realizó en una única A10G (24 GB). Para inferencia, una RTX 4090 (24 GB) o A100/H100 son adecuadas; una RTX 3090 también sería suficiente en FP16.
- Cabe en GPU de consumo: sí, en GPUs con 8 GB o más si se cuantiza el modelo base a 4 u 8 bits (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070).
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; vLLM y TGI soportan adaptadores LoRA, aunque no se documenta compatibilidad específica en la información disponible; llama.cpp/Ollama requerirían fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles. El entrenamiento de 139 pasos tardó unos 69 minutos en una A10G, dato que no es extrapolable directamente a inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Offlin33er/qwen25-coder-7b-solidity-audit-v2 | 7B (base) + adaptador | No disponible | Auditoría Solidity, 8 clases | Apache 2.0 | Hugging Face (11 descargas) |
| Offlin33er/qwen25-coder-7b-solidity-audit (V1) | 7B (base) + adaptador | No disponible | Auditoría Solidity, etiquetas laxas | Apache 2.0 | Hugging Face |
| Offlin33er/qwen25-coder-7b-solidity-audit-v3 | 7B (base) + adaptador | No disponible | Auditoría Solidity, F1 0,986 | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7B | No disponible en la información | Generación de código general | Apache 2.0 | Hugging Face |

No se dispone de información sobre otros modelos especializados en auditoría de Solidity comparables en la información proporcionada.

## Limitaciones y advertencias

- No sustituye a una auditoría profesional de seguridad; el propio autor lo indica explícitamente en la model card.
- La taxonomía cerrada de ocho clases sacrifica granularidad: aproximadamente la mitad de los hallazgos detectados reciben una etiqueta canónica más gruesa o adyacente a la correcta.
- Alrededor de 406 filas (16 % de los datos vulnerables) tienen etiquetas Business Logic asignadas por defecto, lo que introduce sesgo en esa clase y concentra la confusión residual.
- Tasa de falsos positivos del 3,3 % sobre código limpio (1 de 30 casos), con un ejemplo documentado de Business Logic Violation en un constructor de token-fee.
- Riesgo de alucinación inherente a los modelos generativos: puede inventar vulnerabilidades o explicaciones plausibles pero incorrectas; requiere validación humana.
- El system prompt debe ser exactamente el de la taxonomía V2 del dataset, ya que el modelo se entrenó con él de forma literal; desviarse de ese prompt puede degradar la calidad de la salida.
- Solo debe analizarse código para el que se tenga autorización de revisión, según advierte el autor (herramienta de seguridad defensiva).
- Idiomas soportados no documentados; el dominio está limitado a Solidity y el prompt de sistema está en inglés.
- Licencia Apache 2.0 permite uso comercial, pero el adaptador depende del modelo base Qwen2.5-Coder-7B-Instruct, cuya licencia también debe respetarse.
- La model card incluye un banner promocional de un dataset comercial de pago (Oxford Digital v4); conviene tratarlo como contenido publicitario y no como parte de las especificaciones técnicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Offlin33er/qwen25-coder-7b-solidity-audit-v2
- Versión V1: https://huggingface.co/Offlin33er/qwen25-coder-7b-solidity-audit
- Versión V3: https://huggingface.co/Offlin33er/qwen25-coder-7b-solidity-audit-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/Offlin33er/solidity-audit-instruct-v2
- Resultados de evaluación por fila: https://huggingface.co/Offlin33er/qwen25-coder-7b-solidity-audit-v2/blob/main/eval_results.json
- Demo (Solidity Audit Scanner): https://huggingface.co/spaces/Offlin33er/solidity-audit-scanner
- Dashboard de entrenamiento (trackio): https://huggingface.co/spaces/Offlin33er/solidity-audit-sft-qwen25-coder-trackio
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Muestra del dataset comercial v4: https://huggingface.co/datasets/Offlin33er/solidity-exploit-reasoning-v4-sample
- Sitio del dataset comercial: https://oxforddigitals.com/datasets
