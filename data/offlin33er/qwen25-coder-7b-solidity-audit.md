# Offlin33er/qwen25-coder-7b-solidity-audit

## Resumen

El modelo `Offlin33er/qwen25-coder-7b-solidity-audit` es un adaptador LoRA (QLoRA, r=32) entrenado sobre el modelo base Qwen2.5-Coder-7B-Instruct para generar informes estructurados de auditoría de seguridad de contratos inteligentes en Solidity. Lo desarrolla el usuario Offlin33er en el contexto del proyecto "Solidity Audit Scanner" y su objetivo es detectar vulnerabilidades en código Solidity y emitir hallazgos con el formato `## Finding: <tipo>`, incluyendo análisis de funcionalidad, descripción y recomendación, o bien un veredicto explícito de ausencia de vulnerabilidad.

El adaptador se entrena mediante SFT con TRL sobre un conjunto de datos propio (`Offlin33er/solidity-audit-instruct`) construido a partir de código auditado en Solodit, con 2.224 muestras de entrenamiento y 248 de validación. El entrenamiento se realizó en una única GPU A10G de 24 GB durante aproximadamente 2 horas y 16 minutos, con 2 épocas, 278 pasos, batch efectivo de 16 y longitud de secuencia de 2048 tokens.

Es relevante porque aborda un nicho concreto, la auditoría automática de contratos inteligentes, con un modelo pequeño (7B) y desplegable en hardware modesto. No obstante, el propio autor advierte que la puntuación perfecta de detección es en gran medida un artefacto del conjunto de evaluación y que la clasificación fina del tipo de vulnerabilidad es débil (30 % de coincidencia), por lo que no debe interpretarse como un auditor listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-Coder-7B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 7B en el modelo base; el adaptador LoRA añade un conjunto reducido de parámetros (r=32, alpha=32, todas las proyecciones de atención y MLP); el número exacto de parámetros del adaptador no está disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explícita para el adaptador; el entrenamiento usó longitud de secuencia de 2048 tokens; el modelo base Qwen2.5-Coder-7B-Instruct soporta contextos largos (dato no confirmado en la información proporcionada) |
| Tipos de cuantizacion | QLoRA NF4 con doble cuantización para el entrenamiento; el adaptador se distribuye en safetensors; cuantizaciones de inferencia (GGUF, AWQ, GPTQ) no disponibles |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base Qwen/Qwen2.5-Coder-7B-Instruct |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-Coder-7B-Instruct, un transformer decoder-only de 7B parámetros. El ajuste se realiza con TRL `SFTTrainer` en modalidad QLoRA: cuantización NF4 con doble cuantización y cómputo en bf16, LoRA con r=32, alpha=32, dropout 0.05 y aplicación a todas las proyecciones de atención y MLP. El entrenamiento usó 2 épocas (278 pasos), batch efectivo de 16, longitud de secuencia de 2048, optimizador paged AdamW de 8 bits, learning rate 2e-4 con scheduler coseno y 10 pasos de warmup, sobre una única Nvidia A10G de 24 GB durante unas 2 horas y 16 minutos.

Los datos provienen del dataset `Offlin33er/solidity-audit-instruct` (2.224 muestras de entrenamiento y 248 de test reservadas), construido a partir de código auditado en Solodit. La pérdida de entrenamiento descendió de 1,21 en el paso 5 a aproximadamente 0,52 al final de la cola coseno, con una precisión de token que pasó de 0,71 a 0,86. No se menciona uso de RLHF ni DPO; el procedimiento es SFT supervisado. La innovación principal es la especialización en un formato de salida estructurado de auditoría, no una innovación arquitectónica.

## Capacidades

- Generación de informes estructurados de auditoría de seguridad en Solidity con el formato `## Finding: <tipo>` seguido de análisis de funcionalidad, descripción y recomendación.
- Emisión de veredictos explícitos de ausencia de vulnerabilidad cuando el código analizado no presenta fallos identificables.
- Detección de constructos vulnerables en fragmentos de contratos inteligentes (el autor reporta precisión y recall de 1,00 en su conjunto de evaluación estratificado).
- Clasificación del tipo de vulnerabilidad, aunque con coincidencia fina limitada (30 % frente a la taxonomía de referencia).
- Generación de texto conversacional y soporte de plantilla de chat (`apply_chat_template`) heredado del modelo base.
- Capacidades de código y razonamiento heredadas de Qwen2.5-Coder-7B-Instruct (no evaluadas específicamente en esta ficha).
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada para el adaptador.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Revisión preliminar de contratos en pipelines de CI/CD: el adaptador puede invocarse sobre cada commit o pull request que modifique archivos `.solidity` para generar un informe de hallazgos y bloquear fusiones cuando se detecte un constructo vulnerable, aprovechando su formato de salida estructurado y su bajo coste de inferencia en una GPU de 24 GB.
- Triaje de auditorías externas: usar el modelo como primera pasada sobre un repositorio de contratos para priorizar qué fragmentos requieren revisión humana, dado que el autor reporta alta detección de constructos con señal superficial fuerte.
- Formación y documentación interna: generar explicaciones de funcionalidad y recomendaciones de remediación a partir de fragmentos de código, útiles para equipos de desarrollo que necesitan contexto sobre por qué un patrón es riesgoso.
- Integración en herramientas de análisis estático: combinar el adaptador con analizadores como Slither o Mythril para enriquecer los hallazgos con descripciones en lenguaje natural y recomendaciones, usando el modelo como capa de explicación.
- Prototipado de asistentes de auditoría en entornos de investigación: el adaptador es ligero (0,3 GB de repositorio) y puede cargarse junto al modelo base en una A10G o RTX 4090 para experimentar con prompts y formatos de salida sin grandes inversiones de infraestructura.
- Evaluación comparativa de taxonomías de vulnerabilidades: el propio autor señala que la clasificación fina es el punto débil, por lo que el modelo puede usarse como caso de estudio para medir la brecha entre detección binaria y tipado correcto en conjuntos de datos de auditoría.
- Generación de borradores de informes para clientes: el formato `## Finding: <tipo>` con descripción y recomendación puede servir como plantilla inicial que un auditor humano revisa y corrige, reduciendo el tiempo de redacción.

## Benchmarks y rendimiento

Evaluación medida sobre una muestra estratificada de 100 filas del split de test reservado (70 vulnerables / 30 limpias), semilla 42, decodificación greedy, prompt de sistema exacto del entrenamiento y 512 tokens nuevos:

| Metrica | Resultado |
|---|---|
| Precisión de detección de vulnerabilidades | 1,00 (70/70 filas marcadas eran verdaderas) |
| Recall de detección | 1,00 (ninguna fila vulnerable omitida) |
| Tasa de falsos positivos en código limpio | 0,00 (30/30 filas limpias correctamente descartadas) |
| Coincidencia de tipo de hallazgo frente a taxonomía de referencia | 0,30 (21/70, coincidencia normalizada por subcadena/palabras clave) |

El autor advierte explícitamente que la puntuación perfecta de detección es en gran medida un artefacto del conjunto de datos: las filas vulnerables provienen de informes de auditoría reales donde los fragmentos presentan señales superficiales fuertes del constructo defectuoso, y las filas limpias son código no vulnerable curado, lo que hace la separación mucho más fácil que una auditoría real. La coincidencia de tipo del 30 % refleja que el modelo detecta que el código es defectuoso pero etiqueta la categoría de forma más gruesa que la taxonomía de referencia (por ejemplo, "integer overflow" de referencia frente a "arithmetic error" predicho, o "reentrancy" frente a "frontrunning"). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en safetensors ocupa 0,3 GB; el modelo base en bf16 requiere aproximadamente 14-15 GB, por lo que se necesita una GPU con al menos 16 GB para cargar el modelo completo en precisión bf16.
- GPU recomendadas: el entrenamiento se realizó en una Nvidia A10G de 24 GB; para inferencia son adecuadas A10G, L4 (24 GB), RTX 4090 (24 GB), A100 y H100. En GPUs de 16 GB puede ser necesario cuantizar el modelo base.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16; en GPUs de 16 GB (RTX 4080, 4070 Ti Super) probablemente requiera cuantización del modelo base, dato no confirmado en la información proporcionada.
- Opciones de despliegue: carga mediante `peft.PeftModel` + `transformers` con `device_map="auto"`, tal como muestra la model card. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Offlin33er/qwen25-coder-7b-solidity-audit (este) | 7B base + adaptador LoRA r=32 | Entrenado a 2048 tokens | Auditoría Solidity especializada | apache-2.0 | Hugging Face, 8 descargas |
| Offlin33er/qwen25-coder-7b-solidity-audit-v2 | 7B base + adaptador LoRA | no disponible | Taxonomía canónica de 8 clases, 48,5 % de coincidencia de tipo | no disponible | Hugging Face |
| Offlin33er/qwen25-coder-7b-solidity-audit-v3 | 7B base + adaptador LoRA | no disponible | Resolución de fallback verificada, mejor F1 de detección 0,986 | no disponible | Hugging Face |
| Qwen/Qwen2.5-Coder-7B-Instruct (base) | 7B | no disponible en la información proporcionada | Generación de código general | no disponible en la información proporcionada | Hugging Face |

Las versiones V2 y V3 del mismo autor son las alternativas más directas: V2 introduce una taxonomía canónica de 8 clases y V3 reporta un F1 de detección de 0,986 con resolución de fallback verificada. No se dispone de datos de benchmarks comparativos con modelos de auditoría de terceros en la información proporcionada.

## Limitaciones y advertencias

- El conjunto de entrenamiento es estrecho: aproximadamente 2.500 fragmentos auditados, lo que limita la cobertura a patrones presentes en Solodit y deja fuera vulnerabilidades poco representadas.
- La puntuación perfecta de detección (precisión y recall de 1,00) es en gran medida un artefacto del conjunto de evaluación; el propio autor advierte que no debe interpretarse como un auditor listo para producción.
- La clasificación fina del tipo de vulnerabilidad es débil: 30 % de coincidencia con la taxonomía de referencia, con confusiones como "integer overflow" frente a "arithmetic error" o "reentrancy" frente a "frontrunning". El dataset tiene aproximadamente 200 tipos de cola larga con 6 ejemplos o menos cada uno.
- Riesgo de alucinación: no evaluado en la información proporcionada; el modelo puede generar hallazgos plausibles pero incorrectos o recomendaciones genéricas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de idioma: los idiomas soportados no están documentados; el entrenamiento y los ejemplos están en inglés.
- Restricciones de licencia: el adaptador se distribuye bajo apache-2.0, pero el uso comercial debe verificar también la licencia del modelo base Qwen2.5-Coder-7B-Instruct, no confirmada en la información proporcionada.
- La model card incluye un banner promocional de un corpus comercial de evaluación ("Oxford Digital Solidity & AI Agent Security Remediation Benchmark v4") con licencia de pago; conviene tratarlo como material publicitario del autor y no como parte de las capacidades del modelo.
- El repositorio tiene solo 8 descargas y 0 likes, lo que indica una validación externa muy limitada.
- No se documentan integraciones con servidores de inferencia de alto rendimiento (vLLM, TGI) ni cuantizaciones GGUF para despliegue en CPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Offlin33er/qwen25-coder-7b-solidity-audit
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Offlin33er/solidity-audit-instruct
- Versión V2: https://huggingface.co/Offlin33er/qwen25-coder-7b-solidity-audit-v2
- Versión V3: https://huggingface.co/Offlin33er/qwen25-coder-7b-solidity-audit-v3
- Resultados de evaluación: https://huggingface.co/Offlin33er/qwen25-coder-7b-solidity-audit/blob/main/eval_results.json
- Demo (Space): https://huggingface.co/spaces/Offlin33er/solidity-audit-scanner
- Panel de seguimiento del entrenamiento: https://huggingface.co/spaces/Offlin33er/solidity-audit-sft-qwen25-coder-trackio
- Muestra gratuita del corpus v4: https://huggingface.co/datasets/Offlin33er/solidity-exploit-reasoning-v4-sample
- Corpus comercial v4: https://oxforddigitals.com/datasets
