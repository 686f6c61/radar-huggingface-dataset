# Nanbeige/Nanbeige4.3-33B-INT4

## Resumen

Nanbeige4.3-33B-INT4 es la versión cuantizada a 4 bits del modelo Nanbeige4.3-33B, desarrollado por el equipo chino Nanbeige. Se trata de un modelo de lenguaje conversacional de 33.100 millones de parámetros, diseñado como modelo "profesor" insignia de la serie Nanbeige4.3, con especial énfasis en capacidades agénticas: programación compleja, uso de herramientas y tareas de colaboración profesional (cowork).

La particularidad de esta versión INT4 es que no se trata de una cuantización post-entrenamiento convencional: el equipo aplicó entrenamiento con conciencia de cuantización (QAT), que incluye destilación on-policy (OPD) desde el modelo BF16 hacia el modelo INT4, además de aprendizaje por refuerzo (RL) directamente sobre el modelo cuantizado, con el objetivo de preservar el rendimiento a 4 bits.

Es relevante ahora porque ofrece rendimiento de clase agéntica líder entre los modelos abiertos de ~30B parámetros, con una huella de memoria muy reducida (el repositorio ocupa 22,6 GB), lo que lo hace desplegable en hardware de consumo y servidores de una sola GPU. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo LLaMA (text-generation) |
| Parametros totales | 33.118.977.024 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (con QAT: destilacion on-policy y RL) |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y endpoints |

## Arquitectura y entrenamiento

El modelo base es Nanbeige4.3-33B, un transformer denso de tipo LLaMA orientado a generación de texto y escenarios conversacionales con razonamiento y uso de herramientas. La versión INT4 parte de esos pesos y aplica cuantización con conciencia de entrenamiento (QAT) en dos fases: primero, destilación on-policy (OPD) desde el modelo BF16 original hacia el modelo INT4, de modo que el modelo cuantizado aprende de las salidas del profesor en su propia distribución; después, aprendizaje por refuerzo aplicado directamente sobre el modelo INT4 para recuperar o incluso mejorar el rendimiento perdido por la cuantización.

No se ha publicado información sobre el número de tokens de preentrenamiento, la composición del dataset ni los detalles del pipeline de RLHF/DPO del modelo base. Como innovación destacable, la propia model card describe la estrategia de la serie Nanbeige4.3: construir primero un agente profesor de alta capacidad (el 33B) para después destilar capacidades agénticas avanzadas en modelos más pequeños (como el futuro Nanbeige4.3-3B).

## Capacidades

- Generación de texto conversacional con plantilla de chat configurable mediante tokenizador.
- Modo de razonamiento conmutable: el parámetro `enable_thinking` de la plantilla de chat controla si el modelo genera razonamiento en cada respuesta (activado por defecto; se puede desactivar para modo non-thinking).
- Codificación agéntica: resolución de tareas en terminal, reparación de repositorios (SWE-Bench Pro, DeepSWE), generación de código a partir de lenguaje natural sobre repositorios reales (NL2Repo).
- Uso de herramientas y tareas de cowork: buen rendimiento en benchmarks de orquestación de herramientas (Toolathlon), automatización de tareas (Automation Bench, JobBench) y planificación profunda (DeepPlanning).
- Razonamiento matemático y científico: resultados destacados en AIME 2026 (95,2 en BF16) y GPQA Diamond (89,5 en BF16).
- Soporte multilingüe en inglés y chino.
- Eficiencia de inferencia gracias a la cuantización INT4 con QAT, que mantiene el rendimiento a una fracción del coste de memoria del modelo BF16.

## Casos de uso

- Agentes de codificación en terminal: el modelo puede integrarse en harnesses tipo mini-swe-agent o Claude Code para resolver issues reales, ejecutar comandos y navegar repositorios; lidera Terminal-Bench 2.1 (80,9) entre los modelos abiertos de su clase.
- Reparación automática de software en CI/CD: su rendimiento en SWE-Bench Pro (60,3) y DeepSWE (65,5) lo hace adecuado para pipelines que analizan fallos de tests y generan parches sobre repositorios reales.
- Automatización de tareas de oficina y flujos empresariales: benchmarks como Automation Bench (54,2) y JobBench (44,8) indican capacidad para ejecutar tareas multi-paso con herramientas de búsqueda y edición de documentos.
- Asistentes con orquestación de herramientas: su puntuación en Toolathlon-Verified (70,4) y Tau3-Bench (48,8) lo hace apto para agentes que combinan APIs, calendarios, correo y sistemas internos en conversaciones multi-turno.
- Despliegue en hardware de consumo o servidores de una GPU: con 22,6 GB de pesos INT4, cabe en una GPU de 24 GB (RTX 3090/4090), lo que permite ejecutar un agente de 33B localmente sin infraestructura de varios nodos.
- Razonamiento matemático y científico avanzado: con el modo thinking activado, resuelve problemas de nivel competición (AIME 2026: 95,2 en BF16) y preguntas de nivel doctorado en ciencias (GPQA Diamond: 89,5).
- Base para destilación hacia modelos pequeños: al ser el modelo profesor de la serie, puede usarse para generar datos sintéticos de entrenamiento para modelos de 3B destinados a despliegues edge.

## Benchmarks y rendimiento

Resultados publicados por el autor correspondientes al modelo BF16 (no a la versión INT4), evaluados con máximo esfuerzo de razonamiento y mismos hiperparámetros de inferencia para todos los modelos:

| Categoria | Benchmark | Nanbeige4.3-33B | Qwen3.8-27B | Muse-Glimmer-30B | Gemma4-31B |
|---|---|---|---|---|---|
| Agentic Coding | Terminal-Bench 2.1 | **80,9** | 73,0 | 61,8 | 47,2 |
| Agentic Coding | Terminal-Bench 4.0 | **23,8** | 6,3 | 1,6 | 0,0 |
| Agentic Coding | DeepSWE | **65,5** | 42,5 | 4,4 | 2,7 |
| Agentic Coding | SWE-Bench Pro | 60,3 | **61,7** | 51,2 | 36,9 |
| Agentic Coding | SWE-Atlas-QnA | **50,8** | 41,9 | 17,7 | 3,3 |
| Agentic Coding | NL2Repo | **53,0** | 48,3 | 27,4 | 33,8 |
| Agentic Coding | Scicode | **52,6** | 46,7 | 44,9 | 45,5 |
| Agentic Coding | SkillsBench | **61,1** | 56,4 | 39,7 | 28,9 |
| Agentic Cowork | Automation Bench | **54,2** | 38,3 | 15,2 | 9,7 |
| Agentic Cowork | JobBench | **44,8** | 34,5 | 16,6 | 9,0 |
| Agentic Cowork | GDPval | 84,8 | **86,4** | 75,8 | 71,4 |
| Agentic Cowork | Claw-Eval (pass^3) | **78,3** | 75,2 | 57,3 | 44,2 |
| Agentic Cowork | Toolathlon-Verified | **70,4** | 68,5 | 47,2 | 27,8 |
| Agentic Cowork | DeepPlanning | **63,3** | 49,2 | 21,4 | 19,4 |
| Agentic Cowork | EnterpriseOps-Gym | **41,0** | 40,2 | 30,5 | 27,3 |
| Agentic Cowork | YC-bench | **$1.025.437** | $641.290 | $513.978 | $265.152 |
| Agentic Cowork | Tau3-Bench | **48,8** | 48,5 | 33,7 | 18,6 |
| Reasoning | GPQA Diamond | 89,5 | 89,2 | 83,5 | **91,3** |
| Reasoning | AIME 2026 | **95,2** | 94,5 | 94,7 | 89,2 |
| Reasoning | AA-LCR | **84,0** | 82,0 | 83,3 | 72,0 |

Estos resultados corresponden al modelo BF16 con `preserve_thinking=true`. No se han publicado benchmarks específicos de la versión INT4, aunque el proceso de QAT (destilación on-policy más RL) busca minimizar la brecha respecto al BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos INT4 ocupan 22,6 GB; con KV cache y overhead de runtime, se recomienda una GPU con al menos 24 GB de VRAM para contextos moderados.
- GPU recomendadas: RTX 3090, RTX 4090, RTX 5090 (24-32 GB), A100 40 GB, H100, L40S.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB como la RTX 3090 o RTX 4090, con margen limitado para contextos largos por el KV cache.
- Opciones de despliegue: transformers (librería nativa, formato compressed-tensors); compatibilidad con llama.cpp, Ollama, vLLM o TGI no está documentada en la model card, aunque el formato safetensors comprimido es compatible con text-generation-inference y endpoints de Hugging Face.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Caracteristica | Nanbeige4.3-33B-INT4 | Qwen3.8-27B | Muse-Glimmer-30B | Gemma4-31B |
|---|---|---|---|---|
| Parametros | 33,1B | 27B | 30B | 31B |
| Terminal-Bench 2.1 (BF16) | 80,9 | 73,0 | 61,8 | 47,2 |
| AIME 2026 (BF16) | 95,2 | 94,5 | 94,7 | 89,2 |
| Enfoque | Agentic coding y cowork | General | General | General |
| Licencia | Apache 2.0 | no disponible | no disponible | no disponible |
| Cuantizacion INT4 oficial con QAT | Si | no disponible | no disponible | no disponible |

La comparativa de rendimiento se basa en la tabla publicada por Nanbeige; los datos de licencia, contexto y cuantización de los modelos alternativos no constan en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al ser un modelo entrenado principalmente en inglés y chino, puede mostrar sesgos lingüísticos y culturales hacia esos dos idiomas.
- Riesgo de alucinación: inherente a todo LLM; en tareas agénticas con ejecución de código y comandos, se recomienda sandboxing y supervisión humana.
- Limitaciones de contexto: la longitud de ventana de contexto no está publicada; no se puede garantizar rendimiento en contextos extremadamente largos.
- Limitaciones de idioma: soporte oficial solo para inglés y chino; el rendimiento en castellano no está evaluado y puede ser inferior.
- Restricciones de licencia: Apache 2.0 no impone restricciones comerciales significativas, aunque conviene revisar los avisos de uso del modelo base.
- Caveats de producción: los benchmarks publicados corresponden al modelo BF16, no a esta versión INT4; la brecha real de rendimiento entre ambos no está cuantificada públicamente. Además, el modelo evalúa con `preserve_thinking=true`, por lo que el modo de razonamiento afecta al comportamiento y a la latencia.
- El repositorio registra 0 descargas en el momento de redactar la ficha, por lo que no hay evidencia comunitaria de estabilidad en producción.

## Enlaces

- Modelo INT4: https://huggingface.co/Nanbeige/Nanbeige4.3-33B-INT4
- Modelo base BF16: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
