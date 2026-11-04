# Rakuten/RakutenAI-3.0

## Resumen

RakutenAI-3.0 es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Rakuten Group, Inc. y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un fine-tune del checkpoint abierto DeepSeek-V3-0324, sobre el que Rakuten ha aplicado un proceso de preentrenamiento continuado (CPT) y ajuste supervisado (SFT) multi-etapa orientado a mejorar el dominio del japones y su alineamiento conversacional. Con aproximadamente 671.000 millones de parametros totales y 37.000 millones activados por token, se posiciona como uno de los modelos abiertos de mayor tamano especializados en japones.

El modelo resuelve el problema de la baja competencia en japones de los grandes modelos abiertos de proposito general, manteniendo a la vez gran parte de las capacidades del checkpoint base. Su ventana de contexto de 128K tokens y su naturaleza MoE lo hacen adecuado para cargas de trabajo de inferencia en produccion con requisitos de contexto largo, aunque su huella de memoria lo restringe a infraestructura multi-GPU de gama alta.

La relevancia actual del modelo radica en que combina una licencia permisiva (Apache 2.0) con un rendimiento medido en benchmarks academicos japoneses que supera al del checkpoint base en preguntas culturales (JamC-QA) y seguimiento de instrucciones (M-IFEval), a costa de una ligera perdida en razonamiento de nivel graduado (MMLU-ProX) y matematicas de competicion (MATH-100).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), familia DeepSeek-V3 |
| Parametros totales | 671.026.419.200 (~671B) |
| Parametros activos | 37B por token |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | FP8 (formato de pesos publicado); no se detallan otras variantes en la informacion disponible |
| Idiomas soportados | Japones (ja) e ingles (en) |
| Licencia | Apache License 2.0 |
| Formato de pesos | safetensors (FP8) |
| Modelo base | deepseek-ai/DeepSeek-V3-0324 |
| Tamano del repositorio | 673,2 GB |
| Acceso | Modelo con gating (requiere aceptar condiciones; acceso restringido para la UE segun el campo `extra_gated_eu_disallowed`) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

RakutenAI-3.0 hereda la arquitectura MoE de DeepSeek-V3-0324, con 671B parametros totales y 37B activados por token, lo que permite un coste de computo por token muy inferior al de un modelo denso del mismo tamano. El checkpoint se distribuye en formato FP8, lo que reduce el espacio en disco y memoria respecto a una representacion BF16, a costa de requerir hardware compatible con FP8 para un rendimiento optimo.

El entrenamiento se desarrollo en dos fases segun las notas de publicacion. Primero, se aplico preentrenamiento continuado (CPT) sobre DeepSeek-V3-0324 usando un corpus bilingue ingles-japones diverso, compuesto por datos publicos y sinteticos, con tecnicas de model merging para mitigar la perdida de capacidades del modelo original. Despues, se realizo un ajuste supervisado (SFT) multi-etapa que cubre seguimiento de instrucciones, reduccion de sesgos (debiasing), dialogo multi-turno y alineamiento; estas etapas se intercalaron con generacion de datos on-policy y rejection sampling para reducir el olvido catastrofico. No se especifica en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion detallada del dataset.

## Capacidades

- Generacion de texto y conversacion multi-turno en japones e ingles.
- Razonamiento de nivel graduado y resolucion de problemas, con rendimiento medido en MMLU-ProX (71,7%).
- Matematicas de nivel de competicion, con 86,9% en MATH-100.
- Seguimiento de instrucciones, con 72,1% en M-IFEval.
- Conocimiento cultural japones, con 76,9% en JamC-QA.
- Alineamiento y reduccion de sesgos mediante datos especificos de debiasing.
- Ventana de contexto larga de 128K tokens para documentos extensos y dialogos prolongados.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Atencion al cliente en japones: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 128K tokens, lo que permite mantener historiales largos de interaccion y documentacion de producto en la misma ventana, con un dominio del japones medido superior al del checkpoint base en JamC-QA.
- Generacion y resumen de documentacion tecnica bilingue: su entrenamiento en corpus ingles-japones y su contexto largo lo hacen util para traducir, resumir y reescribir documentacion extensa manteniendo coherencia terminologica entre ambos idiomas.
- Analisis de contratos y textos legales japoneses: la ventana de 128K tokens permite procesar documentos completos en una sola pasada, y el ajuste en seguimiento de instrucciones (M-IFEval 72,1%) facilita tareas de extraccion estructurada.
- Asistencia en educacion y preparacion de examenes: su rendimiento en matematicas de competicion (MATH-100 86,9%) y razonamiento graduado (MMLU-ProX 71,7%) lo hace adecuado para tutoria y resolucion guiada de problemas en japones.
- Moderacion y generacion de contenido con sesgos reducidos: los datos de debiasing y la evaluacion interna de seguridad (neutralidad 0,158, deflection 0,128, coherencia linguistica 0,949) lo hacen apropiado para entornos donde se requiere menor sesgo que el modelo base.
- Investigacion en procesamiento del lenguaje natural japones: al ser un fine-tune abierto de DeepSeek-V3-0324 con licencia Apache 2.0, sirve como punto de partida para experimentos de adaptacion y evaluacion en japones.
- Chatbot de comercio electronico: Rakuten puede integrarlo en flujos de recomendacion y soporte de su marketplace, aprovechando su conocimiento cultural japones y su capacidad conversacional.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados con el framework swallow-evaluation-instruct:

| Modelo | JamC-QA (cultural) | MMLU-ProX (razonamiento) | MATH-100 (matematicas) | M-IFEval (instrucciones) |
|---|---|---|---|---|
| RakutenAI-3.0 | 76,9% | 71,7% | 86,9% | 72,1% |
| DeepSeek-V3-0324 | 70,2% | 75,5% | 90,9% | 66,8% |

Evaluacion interna de seguridad:

| Modelo | Neutralidad (menor es mejor) | Deflection (menor es mejor) | Coherencia linguistica (mayor es mejor) |
|---|---|---|---|
| RakutenAI-3.0 | 0,158 | 0,128 | 0,949 |
| DeepSeek-V3-0324 | 0,746 | 0,769 | 0,915 |
| gpt-4o | 0,134 | 0,127 | 0,942 |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint FP8 ocupa aproximadamente 671 GB en memoria, por lo que requiere agregacion de memoria en multiples GPU. Con cuantizaciones adicionales no documentadas (por ejemplo, 4 bits) el requisito podria reducirse, pero no se dispone de cifras oficiales.
- GPU recomendadas: el ejemplo oficial de despliegue usa SGLang con `--tp 8`, lo que implica 8 GPU de gama alta (H100/H200 o A100 de 80 GB) para servir el modelo en FP8.
- No cabe en GPU de consumo (RTX 4090, 24 GB) en su forma publicada.
- Opciones de despliegue: SGLang (imagen Docker recomendada `lmsysorg/sglang:v0.5.6.post2`) con tensor parallelism 8 y `--mem-fraction-static 0.85`; no se documentan en la informacion disponible configuraciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| RakutenAI-3.0 | 671B | 37B | 128K | Apache 2.0 | Fine-tune japones de DeepSeek-V3-0324 |
| DeepSeek-V3-0324 | 671B | 37B | 128K | MIT (modelo base) | Mejor en MMLU-ProX y MATH-100; peor en JamC-QA y M-IFEval |
| gpt-4o | no disponible | no disponible | no disponible | Propietaria | Solo comparable en la evaluacion interna de seguridad |

No se dispone en la informacion proporcionada de datos de otros modelos abiertos especializados en japones (por ejemplo, variantes de Swallow o Qwen) para una comparativa mas amplia.

## Limitaciones y advertencias

- Puede generar texto sesgado, inexacto o inseguro, segun advierte el propio autor; se recomienda implementar salvaguardas en produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje de gran escala; no se documentan mecanismos especificos de mitigacion mas alla del ajuste de sesgos.
- Perdida de capacidades respecto al checkpoint base en razonamiento graduado (MMLU-ProX 71,7% frente a 75,5%) y matematicas de competicion (MATH-100 86,9% frente a 90,9%).
- Idiomas soportados limitados a japones e ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Modelo con gating: requiere aceptar condiciones de acceso, y el campo `extra_gated_eu_disallowed` indica que el acceso esta restringido para la Union Europea, lo que limita su uso directo desde Espana.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre la titularidad de los datos de entrenamiento ni sobre posibles infracciones de derechos de terceros.
- El despliegue exige infraestructura multi-GPU de gama alta; no es viable en hardware de consumo.

## Enlaces

- HuggingFace: https://huggingface.co/Rakuten/RakutenAI-3.0
- Anuncio en ingles: https://global.rakuten.com/corp/news/press/2026/0317_01.html
- Anuncio en japones: https://corp.rakuten.co.jp/news/press/2026/0317_01.html
- Rakuten AI: https://ai.rakuten.com/
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V3-0324
- SGLang: https://github.com/sgl-project/sglang
- Framework de evaluacion: https://github.com/swallow-llm/swallow-evaluation-instruct
- Paper JamC-QA: https://www.anlp.jp/proceedings/annual_meeting/2025/pdf_dir/Q2-18.pdf
- Paper MMLU-ProX: https://arxiv.org/abs/2503.10497
- Paper MATH-100: https://arxiv.org/abs/2502.17407
- Paper M-IFEval: https://arxiv.org/abs/2502.04688
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
