# Jeesup/svd-safety-l2_remove30_swapgapiter_b010_r09

## Resumen

svd-safety-l2_remove30_swapgapiter_b010_r09 es un checkpoint derivado de meta-llama/Llama-2-7b-chat-hf, comprimido con la técnica SVD-LLM hasta eliminar el 30,02 % de los parámetros densos (fracción resultante declarada de 0,6998) y posteriormente editado mediante 9 de las 10 rondas de un procedimiento iterativo de intercambio de parámetros neutro en rendimiento, guiado por la regla de selección `gap_iter`. Lo publica el usuario Jeesup en HuggingFace como artefacto de investigación, no como modelo conversacional de propósito general.

El modelo pertenece a una rejilla experimental que cruza reglas de selección de componentes y presupuestos de restauración, con el objetivo de estudiar cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué criterio de selección repara mejor esa degradación. El presupuesto total de la ejecución completa es del 1,0 % de los parámetros densos, aplicado en fragmentos del 0,1 % por ronda; este checkpoint corresponde a una ronda intermedia.

Su relevancia es fundamentalmente metodológica: cuantifica el compromiso entre seguridad y utilidad bajo compresión y proporciona métricas de tasa de éxito de ataque (ASR) y de sobrerrechazo para una celda concreta de la rejilla. No está pensado para despliegue en producción y el propio autor advierte de que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2), con compresión SVD-LLM y edición iterativa de parámetros aplicada sobre las matrices de proyección |
| Parametros totales | 6.738.415.616 según safetensors; el autor declara una fracción resultante de parámetros densos de 0,6998 |
| Parametros activos | No aplica: es un modelo denso, no MoE |
| Longitud de contexto | 4096 tokens (heredada de Llama-2-7b-chat; no se especifica en la model card) |
| Tipos de cuantizacion | No disponible: el repositorio solo contiene pesos safetensors, sin versiones GPTQ, AWQ ni GGUF publicadas |
| Idiomas soportados | No disponible en la model card; el modelo base Llama 2 está optimizado principalmente para inglés |
| Licencia | Llama 2 Community License (se incluyen LICENSE.txt y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B chat: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, RoPE y atención con KV cache, entrenado originalmente por Meta con alineación mediante RLHF y DPO. Sobre ese checkpoint no se realiza entrenamiento nuevo: la intervención es una edición post hoc de los pesos.

El pipeline aplicado consta de dos fases. Primero, una compresión SVD-LLM que elimina el 30,02 % de los parámetros mediante descomposición en valores singulares con criterio de truncamiento. Después, un procedimiento de intercambio de parámetros neutro en rendimiento, con semilla 42, que restaura 5774 componentes y expulsa otros 5774 según la regla `gap_iter`, insertando el valor de inserción y aplicando desalojo ordenado por sigma. Se incorporan 58.235.392 parámetros (0,90 % de los parámetros de proyección densos) y el presupuesto es del 1,0 % de los parámetros densos repartido en fragmentos del 0,1 % por ronda, de los cuales se han aplicado 9 de 10.

Un detalle relevante para la reproducibilidad es que el recuento de parámetros en safetensors coincide exactamente con el del Llama-2-7b denso, pese a que la model card declara una fracción de 0,6998; esto sugiere que los componentes eliminados se anulan o se estructuran dentro de tensores de forma densa en lugar de reducir las dimensiones físicas de los mismos. La model card no aclara este punto.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Llama-2-7b-chat.
- Comprensión y generación en inglés como idioma principal; el soporte multilingüe no está documentado y el autor no lo especifica.
- Comportamiento de rechazo ante peticiones dañinas, pero con la seguridad degradada respecto al modelo sin comprimir.
- Razonamiento básico y respuesta a instrucciones propias de un modelo de 7B de su generación.
- No dispone de tool calling ni function calling nativo: Llama 2 chat no incluye ese entrenamiento.
- No dispone de modo de pensamiento explícito, visión, audio ni otras capacidades multimodales.
- Su función real es servir de sujeto experimental en evaluaciones de seguridad, no de asistente desplegable.

## Casos de uso

- Evaluación de degradación de seguridad por compresión: ejecutar baterías tipo AdvBench o StrongREJECT sobre este checkpoint y comparar la ASR con la del Llama-2-7b-chat sin comprimir, para cuantificar cuánto daño introduce el truncamiento SVD.
- Estudio comparativo de reglas de selección de componentes: usar esta celda (regla `gap_iter`) frente a otras celdas de la rejilla del mismo autor para determinar qué criterio de selección recupera mejor el comportamiento de rechazo.
- Análisis de sobrerrechazo: emplear la métrica de macro over-refusal sobre WildGuard (0,1455 en esta celda) para estudiar el coste en utilidad que impone la restauración de seguridad.
- Investigación de interpretabilidad: inspeccionar los 5774 componentes restaurados y los 5774 expulsados para identificar qué direcciones de peso están asociadas al comportamiento de seguridad.
- Red-teaming y generación de conjuntos de evaluación: al presentar una ASR medible y controlada, la celda sirve como caso positivo en pipelines de validación de jueces automáticos de seguridad.
- Reproducción de experimentos de compresión SVD-LLM: punto de partida documentado (semilla 42, presupuesto, regla) para replicar o extender el estudio con otros presupuestos.
- Docencia e ilustración de compromisos seguridad-utilidad: ejemplo didáctico de cómo una transformación de pesos aparentemente neutra altera propiedades de alineación.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas de seguridad, no benchmarks de capacidad estándar. En todas ellas un valor menor es mejor, salvo en el caso del sobrerrechazo, donde un valor bajo indica menos rechazos indebidos.

| Metrica | Valor | Juez / herramienta |
|---|---|---|
| AdvBench ASR | 0,0650 | Juez HarmBench |
| StrongREJECT ASR | 0,1150 | Juez HarmBench |
| Macro over-refusal | 0,1455 | WildGuard |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad en la información disponible, ni tampoco cifras comparativas frente al modelo base sin comprimir.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: en torno a 14-16 GB solo para pesos, más la caché KV según lote y longitud de contexto.
- VRAM estimada en int8: aproximadamente 7-8 GB; en int4, alrededor de 4-5 GB.
- GPU recomendadas para fp16: A100 (40 o 80 GB), H100, L40S o RTX 4090 (24 GB) para un único dispositivo.
- Cabe en GPU de consumo: sí, en una RTX 4090 o RTX 3090 de 24 GB en fp16, y en tarjetas de 8-12 GB si se cuantiza a 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (el repositorio está marcado como endpoints_compatible) y vLLM. No hay pesos GGUF publicados, por lo que Ollama o llama.cpp exigirían una conversión propia.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Seguridad medida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l2_remove30_swapgapiter_b010_r09 | 6.738.415.616 en safetensors; fracción densa declarada 0,6998 | 4096 tokens | AdvBench ASR 0,0650; StrongREJECT ASR 0,1150; sobrerrechazo 0,1455 | Llama 2 Community License | HuggingFace, 0 descargas |
| meta-llama/Llama-2-7b-chat-hf (modelo base) | 6.738.415.616 | 4096 tokens | No disponible en la información proporcionada | Llama 2 Community License | HuggingFace, público |
| Otras celdas de la rejilla del mismo autor | No disponible | No disponible | No disponible | Llama 2 Community License | No listadas en la información |

No se dispone de datos de benchmarks ni de métricas de seguridad del modelo base sin comprimir dentro de la información proporcionada, por lo que no es posible cuantificar la degradación relativa. El autor indica cualitativamente que "la compresión por sí sola eleva la tasa de éxito de ataque".

## Limitaciones y advertencias

- No es un modelo desplegable: el propio autor lo describe como artefacto de investigación y sujeto experimental, no como asistente de propósito general.
- Seguridad degradada de forma deliberada en varias celdas: la compresión eleva la tasa de éxito de ataque respecto a Llama-2-7b-chat, y esta celda mantiene una ASR de 0,0650 en AdvBench y 0,1150 en StrongREJECT.
- Sobrerrechazo medido de 0,1455 en WildGuard, lo que implica rechazos indebidos en conversaciones legítimas.
- Es una ronda intermedia de una ejecución más larga (9 de 10), por lo que no representa el punto final del presupuesto de restauración de 1,0 %.
- Riesgo de alucinación y de generación de contenido incorrecto heredado del modelo base Llama-2-7b-chat.
- Idiomas soportados no documentados; el comportamiento fuera del inglés es incierto.
- Ausencia de cuantizaciones publicadas: cualquier despliegue eficiente requiere conversión propia y validación posterior.
- La licencia Llama 2 Community License impone la aceptación de LICENSE.txt y USE_POLICY.md, obliga a mantener la atribución "Built with Llama 2" y aplica condiciones adicionales a despliegues con más de 700 millones de usuarios mensuales.
- Discrepancia no aclarada entre el recuento de parámetros de safetensors (idéntico al modelo denso) y la fracción de parámetros declarada en la model card.
- Sin datos de benchmarks de capacidad ni de latencia, lo que impide estimar su utilidad real más allá del estudio de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove30_swapgapiter_b010_r09
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- No se han encontrado enlaces adicionales relevantes en la búsqueda web: los resultados devueltos (Stack Overflow y el centro de ayuda de Google Translate) no guardan relación con el modelo ni con SVD-LLM.
