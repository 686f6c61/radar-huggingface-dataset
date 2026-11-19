# Jeesup/svd-safety-l3_svdllmjbbsep48_r40

## Resumen

svd-safety-l3_svdllmjbbsep48_r40 es un checkpoint derivado de Meta-Llama-3-8B-Instruct comprimido mediante SVD-LLM, una tecnica de compresion post-entrenamiento basada en descomposicion en valores singulares. El autor (Jeesup) lo publica como artefacto de investigacion dentro de un estudio sobre como la compresion SVD degrada el comportamiento de seguridad del modelo y que regla de seleccion de componentes lo repara mejor. No es un modelo conversacional de proposito general, sino una celda concreta de una cuadricula experimental sobre reglas de seleccion y presupuestos de compresion.

El checkpoint conserva el 60,0% de los parametros densos del modelo original (se elimina un 40,00%), lo que da una fraccion resultante de 0,5998 y 8.030.261.248 parametros totales en formato safetensors. Tras la compresion se aplico una recuperacion con LoRA de etapa 2 propia de SVD-LLM (U y luego V de forma secuencial, sobre alpaca-cleaned, r=8, alpha=16, 2 epocas, lr 1e-4, batch 64, cutoff 256, bf16). La arquitectura subyacente es la de Llama 3 8B Instruct: transformer decoder-only denso con atencion causal, sin mezcla de expertos.

Su relevancia es metodologica: cuantifica el compromiso entre utilidad y seguridad bajo compresion. Segun la model card, la compresion por si sola eleva la tasa de exito de ataques (ASR), y el objetivo del estudio es medir esa degradacion y probar mecanismos de recuperacion. Cualquier celda de la cuadricula debe tratarse como sujeto experimental, no como asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3 8B Instruct) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3 8B Instruct soporta 8.192 tokens, pero la ficha no lo confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors en bf16; no se documentan variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3 Community License (se incluyen LICENSE y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only denso de 8.000 millones de parametros (Llama 3 8B Instruct), con atencion causal estandar y sin componentes de mezcla de expertos ni capas de estado (SSM). Sobre esa base se aplica SVD-LLM, que descompone las matrices de pesos y elimina componentes de baja utilidad segun una regla de seleccion. En esta celda la regla combina utilidad y seguridad mediante un conjunto de calibracion agrupado: la matriz de covarianza se estima como S S^T = suma sobre WikiText x x^T + suma sobre seguridad x x^T, con el estimador de SVD blanqueado de los autores de SVD-LLM (AIoT-MLSys-Lab/SVD-LLM).

La parte de utilidad usa WikiText-2 train, 255 ventanas de 2048 tokens con el muestreador de SVD-LLM (semilla 42), evaluando todas las posiciones. La parte de seguridad usa los primeros 48 de los 94 objetivos de JailbreakBench con las propias negativas de Llama-3-8B-Instruct (orden con semilla 42), una conversacion por muestra, desempaquetada, con 2726 posiciones y evaluacion de todas ellas. La cuota efectiva de seguridad es de 0,0052 de las posiciones, es decir, una fraccion muy pequena del total de calibracion. El presupuesto de compresion elimina el 40,00% de los parametros, dejando una fraccion de 0,5998.

Tras la compresion se aplica la recuperacion de etapa 2 de SVD-LLM: LoRA secuencial sobre U y luego sobre V, con alpaca-cleaned como datos, rango 8, alpha 16, 2 epocas, tasa de aprendizaje 1e-4, tamano de lote 64, longitud de corte 256 y precision bf16. La semilla global del experimento es 42. No se documentan en la informacion disponible fases de RLHF o DPO adicionales sobre este checkpoint; la alineacion procede del modelo base.

## Capacidades

- Generacion de texto autoregresiva en el formato conversacional de Llama 3 Instruct, heredado del modelo base.
- Razonamiento y respuesta a instrucciones de proposito general, aunque degradados por la compresion al 60% de parametros.
- Capacidad de seguir instrucciones conversacionales multi-turno en el formato de chat de Llama 3.
- Comportamiento de rechazo ante peticiones daninas, cuantificado en la model card con AdvBench ASR de 0,0596 y StrongREJECT ASR de 0,0703 (juez HarmBench).
- Soporte de tool calling y function calling: no documentado especificamente para este checkpoint; el modelo base lo soporta, pero la compresion puede afectar a su fiabilidad.
- Soporte de agentes y razonamiento multi-paso: no documentado para este checkpoint.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (vision, audio, modo thinking): no disponibles; el modelo base no las incluye.

## Casos de uso

- Investigacion sobre compresion de modelos: usar este checkpoint como celda de referencia para medir como varia la perplexidad en WikiText-2 (26,6635) al cambiar la regla de seleccion de componentes y el presupuesto de compresion.
- Estudio de seguridad bajo compresion: comparar las tasas de exito de ataque (AdvBench 0,0596, StrongREJECT 0,0703) frente a otras celdas de la cuadricula y frente al modelo denso sin comprimir, para aislar el efecto de la compresion sobre el comportamiento de rechazo.
- Analisis de sobre-rechazo: emplear la metrica de sobre-rechazo macro medida con WildGuard (0,2030) para evaluar si la calibracion con datos de seguridad incrementa los rechazos indebidos en peticiones benignas.
- Evaluacion de recuperacion con LoRA: reproducir el pipeline de etapa 2 (LoRA secuencial U/V sobre alpaca-cleaned) y medir cuanto recupera la utilidad zero-shot (0,4962 de media en 7 tareas) respecto a la celda sin recuperar.
- Reproducibilidad de experimentos de SVD: validar la implementacion del estimador SVD blanqueado con el conjunto de calibracion agrupado (WikiText-2 mas JailbreakBench) y la semilla 42.
- Docencia y divulgacion sobre interpretabilidad: ilustrar de forma practica como la eliminacion de componentes de baja utilidad afecta a metricas de seguridad y utilidad simultaneamente.
- Analisis de robustez en pipelines de evaluacion: usar el checkpoint como entrada controlada en arneses de evaluacion de seguridad (HarmBench, WildGuard, lm-evaluation-harness) para calibrar los propios evaluadores.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0596 |
| StrongREJECT ASR (juez HarmBench) | 0,0703 |
| Sobre-rechazo macro (WildGuard) | 0,2030 |
| Perplexidad en WikiText-2 | 26,6635 |
| Precision media zero-shot (7 tareas, acc_norm cuando se reporta) | 0,4962 |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos ni frente al modelo base sin comprimir para estas mismas metricas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para pesos (8.030 millones de parametros a 2 bytes), mas memoria para el contexto y el estado de atencion; en la practica se recomienda disponer de 20-24 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8 GB para pesos; en 4 bits, alrededor de 4-5 GB. No se publican variantes cuantizadas en el repositorio, por lo que habria que generarlas a partir de los safetensors.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090 (24 GB) tambien es viable en bf16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 3090 en bf16; en tarjetas de 16 GB (RTX 4080, 4060 Ti 16 GB) requeriria cuantizacion o contextos cortos.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag text-generation-inference y endpoints_compatible), y previsiblemente vLLM y llama.cpp/Ollama tras convertir los pesos a los formatos correspondientes, aunque esto ultimo no esta documentado en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l3_svdllmjbbsep48_r40 | 8.030.261.248 (60% del denso) | no disponible | Llama 3 Community License | Checkpoint comprimido con SVD-LLM, artefacto de investigacion; ASR AdvBench 0,0596, perplexidad WikiText-2 26,6635 |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.000 millones | 8.192 tokens (segun el modelo base) | Llama 3 Community License | Modelo denso sin comprimir del que deriva; referencia de utilidad y seguridad, sin metricas publicadas en esta ficha |
| Otras celdas de la cuadricula SVD-LLM del mismo autor | variable segun presupuesto | no disponible | Llama 3 Community License | Mismas condiciones experimentales con distintas reglas de seleccion y presupuestos; no se dispone de sus metricas en la informacion proporcionada |

No se dispone en la informacion proporcionada de comparaciones con modelos de compresion alternativos (por ejemplo, destilacion o poda estructurada) ni con otros checkpoints SVD de terceros.

## Limitaciones y advertencias

- Artefacto de investigacion: la propia model card advierte que no es un modelo conversacional de proposito general y que debe tratarse como sujeto experimental.
- Degradacion deliberada de seguridad en varias celdas de la cuadricula: la compresion por si sola eleva la tasa de exito de ataques, y esta celda puede presentar comportamientos de rechazo distintos a los del modelo base.
- Riesgo de alucinacion: no se documenta una evaluacion especifica de factualidad; la compresion al 60% de parametros puede incrementar errores en tareas de conocimiento.
- Sobre-rechazo: la metrica macro con WildGuard es 0,2030, lo que indica una tasa no despreciable de rechazos indebidos en peticiones benignas.
- Cuota de seguridad muy baja en la calibracion: solo 0,0052 de las posiciones corresponden a datos de seguridad, lo que limita la representatividad de esa parte del conjunto.
- Idiomas: no se documentan los idiomas soportados; no debe asumirse un comportamiento multilingue equivalente al del modelo base.
- Contexto: la longitud de contexto efectiva de este checkpoint no esta documentada; la compresion puede alterar el comportamiento en ventanas largas.
- Licencia: Llama 3 Community License, con restricciones de uso comercial y obligaciones de atribucion; deben consultarse LICENSE y USE_POLICY.md incluidos en el repositorio. Uso derivado de Meta Llama 3.
- Sin validacion en produccion: cero descargas y cero likes en el momento de la consulta, sin evidencia de uso en entornos reales.
- No se publican variantes cuantizadas ni formatos GGUF, lo que anade trabajo de conversion para despliegues en hardware limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmjbbsep48_r40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Repositorio de SVD-LLM citado en la model card: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Conjunto de evaluacion JailbreakBench: https://huggingface.co/datasets/JailbreakBench/JBB-Behaviors
- Conjunto de calibracion alpaca-cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Conjunto WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- Arnes de evaluacion HarmBench: https://github.com/centerforaisafety/HarmBench
- WildGuard: https://huggingface.co/allenai/wildguard
- Licencia Llama 3: https://llama.meta.com/llama3/license/
