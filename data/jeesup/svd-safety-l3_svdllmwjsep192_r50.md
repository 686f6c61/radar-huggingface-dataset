# Jeesup/svd-safety-l3_svdllmwjsep192_r50

## Resumen

`svd-safety-l3_svdllmwjsep192_r50` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, comprimido mediante la técnica SVD-LLM hasta conservar aproximadamente el 50 % de los parámetros densos originales (fracción resultante 0,4997). Lo publica el usuario Jeesup como parte de un estudio sobre cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes permite repararlo mejor. No es un asistente conversacional de propósito general: es una celda concreta de una malla experimental sobre reglas de selección y presupuestos de compresión.

El modelo parte de la arquitectura Llama 3 de 8 000 millones de parámetros (8.030.261.248 según los pesos en safetensors), mantiene la longitud de contexto nativa de Llama 3 (8 192 tokens) y se distribuye en formato safetensors con licencia Llama 3 Community License. Su interés es doble: por un lado, sirve como referencia cuantitativa del coste en seguridad de la compresión SVD; por otro, documenta una receta de recuperación con LoRA en dos etapas (U y luego V) sobre `alpaca-cleaned`.

La relevancia actual radica en que la compresión de modelos es una práctica habitual para reducir costes de despliegue, y este artefacto mide de forma explícita el efecto colateral sobre la tasa de éxito de ataques (ASR) y sobre el exceso de rechazo, con cifras publicadas y reproducibles. Cualquier equipo que planee comprimir un modelo alineado debería consultar este tipo de evidencia antes de asumir que la compresión es neutra en seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido mediante SVD-LLM |
| Parametros totales | 8.030.261.248 (fracción densa resultante 0,4997 respecto al base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama 3 soporta 8 192 tokens) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3 Community License (`LICENSE` y `USE_POLICY.md` incluidos en el repo) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3 8B Instruct: un transformer decoder-only con atención causal estándar y normalización RMSNorm. Sobre esa base se aplica SVD-LLM, que descompone las matrices de pesos y descarta componentes según una regla de selección, reduciendo el número de parámetros densos. En esta celda concreta se elimina el 50,00 % de los parámetros, quedando una fracción de 0,4997. El estimador empleado es el SVD con blanqueado de los autores de SVD-LLM (repositorio AIoT-MLSys-Lab/SVD-LLM), calculado sobre un conjunto de calibración agrupado: `S S^T = sum_WikiText x x^T + sum_safety x x^T`.

El conjunto de calibración combina dos fuentes. La parte de utilidad usa WikiText-2 train con 255 ventanas de 2 048 tokens (muestreo de SVD-LLM, semilla 42) y todas las posiciones. La parte de seguridad usa las primeras 192 de 512 indicaciones de entrenamiento de WildJailbreak (vanilla y adversarial dañinas) junto con los rechazos generados por el propio Llama-3-8B-Instruct (orden con semilla 42), una conversación por muestra desempaquetada, con 25 994 posiciones y todas ellas consideradas. La proporción efectiva de posiciones dedicadas a seguridad es de 0,0474, muy minoritaria frente a la parte de utilidad.

Tras la compresión se aplica la recuperación de segunda etapa de SVD-LLM con LoRA secuencial (primero U, luego V) sobre `alpaca-cleaned`, con r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, longitud de corte 256 y precisión bf16. La semilla global del experimento es 42.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Llama-3-8B-Instruct.
- Razonamiento y respuesta a instrucciones en formato chat, con la plantilla de Llama 3.
- Comportamiento de rechazo ante peticiones dañinas, aunque degradado respecto al modelo sin comprimir (ver benchmarks).
- Soporte de tool calling y function calling: no disponible en la información proporcionada para este checkpoint concreto; el modelo base Llama 3 Instruct lo soporta, pero la compresión puede afectar al formato.
- Capacidades de agente y razonamiento multi-paso: no verificadas en este artefacto; no se han publicado evaluaciones específicas.
- Capacidades multilingües: no disponible; no se documentan idiomas soportados.
- Capacidades especiales (visión, audio, modo thinking): no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Estudio académico del efecto de la compresión en la seguridad: usar este checkpoint como una celda de la malla experimental para medir cómo varía la tasa de éxito de ataques (ASR) en AdvBench y StrongREJECT al modificar la regla de selección de componentes SVD. Es adecuado porque las métricas están publicadas y la receta es reproducible con semilla 42.
- Comparación de recetas de recuperación LoRA: emplear el checkpoint como punto de partida para probar variantes de la etapa 2 (por ejemplo, distintos valores de r, alpha o datasets de recuperación) y medir la recuperación de utilidad frente al coste en seguridad.
- Evaluación de la calibración con datos de seguridad: replicar el experimento variando la proporción de posiciones de WildJailbreak (aquí 0,0474) para determinar cuánta calibración de seguridad es necesaria para preservar el comportamiento de rechazo tras comprimir al 50 %.
- Investigación en interpretabilidad de componentes: analizar qué componentes descartados por SVD-LLM concentran la capacidad de rechazo, comparando este checkpoint con otras celdas de la malla que usan reglas de selección distintas.
- Benchmarking de pipelines de compresión: integrar el modelo en un pipeline de evaluación automatizada (perplejidad en WikiText-2, exactitud zero-shot en 7 tareas, ASR con juez HarmBench) para validar herramientas de compresión propias contra una referencia publicada.
- Docencia y formación en seguridad de modelos: usar el artefacto como ejemplo documentado de que la compresión no es neutra en seguridad, con cifras concretas de ASR y sobre-rechazo para ilustrar el trade-off.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0365 |
| StrongREJECT ASR (juez HarmBench) | 0,0607 |
| Macro over-refusal (WildGuard) | 0,3225 |
| Perplejidad en WikiText-2 | 60,9960 |
| Exactitud media zero-shot (7 tareas, acc_norm cuando se reporta) | 0,4522 |

No se han publicado en la información disponible resultados comparativos con el modelo base sin comprimir ni con otras celdas de la malla, por lo que no es posible cuantificar aquí la degradación relativa.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para pesos (8 030 millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB para contexto largo.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB de pesos; en 4 bits, alrededor de 4-5 GB. Estas cuantizaciones no están publicadas en el repositorio y requerirían conversión propia (por ejemplo, con llama.cpp o GPTQ/AWQ).
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para despliegue en bf16 con concurrencia; RTX 4090 (24 GB) para bf16 en una sola GPU con contexto moderado; RTX 3090 (24 GB) de forma similar.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 en bf16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: transformers (formato nativo), text-generation-inference (el repo incluye la etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama previa conversión a GGUF. No se documentan configuraciones específicas para TGI ni vLLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l3_svdllmwjsep192_r50 (este) | 8,03 B (50 % denso del base) | no disponible | Llama 3 Community | Artefacto de investigación con métricas de seguridad publicadas (ASR AdvBench 0,0365) |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8 192 tokens | Llama 3 Community | Modelo base sin comprimir; referencia de utilidad y seguridad, pero sin métricas de ASR publicadas en esta ficha |
| Otras celdas de la malla SVD-LLM del mismo autor | ~8 B comprimidos a distintos presupuestos | no disponible | Llama 3 Community | Mismas reglas de evaluación; no se dispone de sus cifras en la información proporcionada |
| SVD-LLM original (AIoT-MLSys-Lab) | variable según modelo comprimido | no disponible | según modelo base | Implementación de referencia de la técnica de compresión empleada |

No se dispone de datos suficientes para comparar rendimiento frente a alternativas de compresión como SliceGPT, LLM-Pruner o Wanda en este mismo modelo base.

## Limitaciones y advertencias

- No es un asistente desplegable: el propio autor lo describe como artefacto de investigación y advierte de que varias celdas de la malla están deliberadamente degradadas en seguridad respecto a Llama-3-8B-Instruct.
- La compresión por sí sola eleva la tasa de éxito de ataques; este checkpoint presenta un ASR de 0,0365 en AdvBench y 0,0607 en StrongREJECT, valores que deben interpretarse en el contexto del estudio y no como garantía de seguridad.
- El sobre-rechazo macro medido con WildGuard es de 0,3225, lo que indica una tendencia notable a rechazar peticiones benignas; puede degradar la experiencia en uso conversacional real.
- La perplejidad en WikiText-2 de 60,9960 y la exactitud media zero-shot de 0,4522 en 7 tareas reflejan una pérdida de calidad respecto al modelo sin comprimir, cuyo valor no se documenta aquí.
- La proporción efectiva de posiciones de calibración dedicadas a seguridad es muy baja (0,0474), lo que puede explicar parte de la degradación del comportamiento de rechazo.
- Riesgo de alucinación: no evaluado específicamente en la información proporcionada; al tratarse de un modelo comprimido, es esperable un aumento respecto al base, pero no hay medición publicada.
- Idiomas soportados: no documentados; no se garantiza un rendimiento multilingüe equivalente al del modelo base.
- Restricciones de licencia: uso sujeto a la Llama 3 Community License y a `USE_POLICY.md`; existen obligaciones de atribución ("Built with Meta Llama 3") y restricciones de uso comercial y de redistribución que deben revisarse antes de cualquier despliegue.
- El repositorio ocupa 16,1 GB y solo publica safetensors; no hay GGUF ni cuantizaciones listas para usar, lo que añade trabajo de conversión para despliegues ligeros.
- No se han publicado evaluaciones de tool calling, agentes ni razonamiento multi-paso para este checkpoint; no deben asumirse heredadas sin verificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmwjsep192_r50
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Implementación de referencia de SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Llama 3: incluida en el repositorio del modelo (`LICENSE` y `USE_POLICY.md`)
- Paper de SVD-LLM, WildJailbreak, AdvBench, StrongREJECT, HarmBench y WildGuard: no disponibles como enlaces en la información proporcionada
