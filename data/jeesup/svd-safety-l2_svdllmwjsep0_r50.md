# Jeesup/svd-safety-l2_svdllmwjsep0_r50

## Resumen

`svd-safety-l2_svdllmwjsep0_r50` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` comprimido mediante la tecnica SVD-LLM hasta el 50,0 % de sus parametros densos originales, es decir, aproximadamente la mitad de los pesos de la red. Lo publica el usuario de Hugging Face `Jeesup` como artefacto de investigacion para estudiar como la compresion por descomposicion en valores singulares (SVD) degrada el comportamiento de seguridad de un modelo alineado y que reglas de seleccion de componentes permiten repararlo. No es un modelo de proposito general ni un asistente desplegable: es una celda concreta de una malla experimental sobre reglas de seleccion y presupuestos de compresion.

Tecnicamente parte de la arquitectura transformer decoder-only de Llama 2 (7B parametros densos, contexto nativo de 4096 tokens en la familia original), y tras la compresion conserva 6.738.415.616 parametros segun los pesos safetensors del repositorio. La compresion se aplica con el SVD blanqueado de los autores de SVD-LLM sobre un conjunto de calibracion combinado de utilidad (WikiText-2) y seguridad, seguido de una recuperacion con LoRA en dos etapas (U y luego V) entrenada sobre `alpaca-cleaned`.

Su relevancia es metodologica: cuantifica el coste en seguridad de comprimir un modelo alineado (ASR de 0,4096 en AdvBench y 0,3035 en StrongREJECT con juez HarmBench) y sirve como referencia para quien investigue compresion consciente de seguridad, interpretabilidad de componentes o evaluacion de robustez frente a jailbreaks en modelos comprimidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido con SVD-LLM |
| Parametros totales | 6.738.415.616 (fraccion 0,4999 del denso original) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (familia Llama 2: 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible (heredados de Llama 2: principalmente ingles) |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Llama-2-7b-chat, un transformer decoder-only con atencion causal y normalizacion RMSNorm, y le aplica la compresion SVD-LLM de AIoT-MLSys-Lab: se estima la matriz de covarianza de activaciones con SVD blanqueado sobre un conjunto de calibracion agrupado, `S S^T = sum_WikiText x x^T + sum_safety x x^T`, y se truncan los componentes de menor contribucion hasta eliminar el 50,00 % de los parametros. En esta celda la parte de seguridad tiene peso efectivo cero (`a = 0`, SVD-LLM plano), de modo que la calibracion de seguridad no influye en la seleccion de componentes; la parte de utilidad usa 255 ventanas de 2048 tokens de WikiText-2 train (muestreador de SVD-LLM, semilla 42) evaluando todas las posiciones con el perfilador de los autores y factor cacheado.

Tras el truncamiento se aplica la recuperacion de segunda etapa de SVD-LLM: LoRA secuencial sobre los factores U y luego V, con rango 8, alpha 16, 2 epocas, learning rate 1e-4, batch 64, longitud de corte 256 y precision bf16, entrenado sobre `alpaca-cleaned`. No se documenta en la informacion disponible ningun ajuste adicional de alineacion, RLHF ni DPO posterior a la compresion; la alineacion de seguridad es la heredada de Llama-2-7b-chat y queda parcialmente danada por el proceso.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Llama-2-7b-chat, con calidad degradada por la compresion al 50 %.
- Razonamiento basico y respuesta a instrucciones, con una precision media zero-shot de 0,4527 en 7 tareas (acc_norm donde se reporta).
- Capacidad de seguir el formato de chat de Llama 2 (system prompt, turnos de usuario y asistente).
- No se documenta soporte de tool calling ni function calling nativo.
- No se documenta soporte de agentes ni de razonamiento multi-paso estructurado.
- Capacidades multilingues no documentadas; el modelo base esta orientado principalmente al ingles.
- No dispone de vision, audio ni modo de pensamiento explicito.
- Su proposito real es servir como sujeto experimental para medir degradacion de seguridad bajo compresion.

## Casos de uso

- Investigacion sobre compresion consciente de seguridad: usar este checkpoint como linea base comprimida (sin calibracion de seguridad, `a = 0`) y compararlo con otras celdas de la malla que si incorporan senal de seguridad, midiendo el delta en ASR de AdvBench y StrongREJECT.
- Evaluacion de robustez frente a jailbreaks: ejecutar suites de ataque (HarmBench, StrongREJECT) sobre el modelo comprimido para cuantificar cuanto aumenta la tasa de exito de ataque respecto al Llama-2-7b-chat denso.
- Estudio de sobre-rechazo: emplear la metrica de macro over-refusal con WildGuard (0,1663 en esta celda) para analizar el equilibrio entre utilidad y rechazo excesivo tras comprimir.
- Analisis de interpretabilidad de componentes: inspeccionar que factores SVD truncados correlacionan con la perdida de comportamiento de seguridad, aprovechando que el checkpoint conserva la estructura de Llama 2 y es cargable con transformers.
- Benchmarking de tecnicas de recuperacion: comparar la recuperacion LoRA en dos etapas (U y V) frente a alternativas de fine-tuning completo o destilacion para reparar la utilidad (perplejidad WikiText-2 de 13,7528) sin reentrenar desde cero.
- Reproducibilidad de estudios academicos: servir como artefacto con semilla fija (42) y configuracion documentada para replicar resultados de papers sobre SVD-LLM y evaluacion de seguridad.
- Pruebas de pipelines de evaluacion de seguridad en CI: integrar el modelo en un arnes automatizado que verifique que las metricas de seguridad de un checkpoint comprimido no superan umbrales definidos antes de promoverlo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,4096 |
| StrongREJECT ASR (juez HarmBench) | 0,3035 |
| Macro over-refusal (WildGuard) | 0,1663 |
| Perplejidad WikiText-2 | 13,7528 |
| Precision media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4527 |

No se han publicado en la informacion disponible resultados comparativos frente a Llama-2-7b-chat denso ni frente a otras celdas de la malla; el autor indica que la compresion por si sola eleva la tasa de exito de ataque, pero no se aportan las cifras del modelo sin comprimir.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 13-14 GB solo para pesos (6,74 mil millones de parametros), mas cache KV y activaciones; el repositorio ocupa 13,5 GB.
- En cuantizacion de 8 bits cabria en GPUs consumer de 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB); en 4 bits cabria en 8-10 GB (RTX 3070, RTX 4060 8 GB).
- GPU recomendadas para evaluacion sin cuantizar: A100 40/80 GB, H100, L40S; tambien RTX 4090 (24 GB) con margen holgado.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); llama.cpp/Ollama requeririan conversion a GGUF no publicada en el repositorio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| svd-safety-l2_svdllmwjsep0_r50 | 6,74 B (50 % del denso) | no disponible | Llama 2 Community | Hugging Face (8 descargas) | Artefacto de investigacion, seguridad degradada |
| meta-llama/Llama-2-7b-chat-hf | 6,74 B | 4096 tokens | Llama 2 Community | Hugging Face (ampliamente usado) | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Otras celdas de la malla del mismo autor | ~6,74 B | no disponible | Llama 2 Community | Hugging Face | Distintas reglas de seleccion y presupuestos de compresion |

No se dispone de datos de rendimiento de las alternativas en la informacion proporcionada para una comparacion cuantitativa; la unica referencia directa es el modelo base sin comprimir.

## Limitaciones y advertencias

- El propio autor advierte que varias celdas de la malla estan deliberadamente degradadas en seguridad y que este checkpoint no debe tratarse como un asistente desplegable.
- La compresion al 50 % eleva la tasa de exito de ataque (ASR de 0,4096 en AdvBench y 0,3035 en StrongREJECT), por lo que es inadecuado para produccion orientada al usuario final.
- La calibracion de seguridad tiene peso efectivo cero en esta celda, de modo que la seleccion de componentes no protege el comportamiento de seguridad.
- Riesgo de alucinacion y de respuestas incoherentes mayor que en el modelo denso, coherente con la perplejidad de 13,7528 en WikiText-2 y una precision media zero-shot de 0,4527.
- Idiomas soportados no documentados; el modelo base esta centrado en ingles, con rendimiento limitado en castellano.
- La licencia Llama 2 Community impone restricciones de uso comercial y obligaciones de atribucion; el repositorio incluye `LICENSE.txt` y `USE_POLICY.md`.
- Longitud de contexto efectiva no verificada tras la compresion; debe validarse empiricamente antes de usarla en tareas de contexto largo.
- Solo 8 descargas y 0 likes: sin validacion comunitaria ni garantias de mantenimiento.
- No se publican pesos en GGUF ni cuantizaciones oficiales, lo que limita el despliegue en entornos de bajos recursos sin trabajo adicional de conversion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_svdllmwjsep0_r50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Repositorio de SVD-LLM (AIoT-MLSys-Lab): https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Dataset de recuperacion LoRA: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Dataset de calibracion de utilidad: https://huggingface.co/datasets/Salesforce/wikitext (WikiText-2)
- No se han encontrado en la informacion proporcionada papers, blogs ni demos adicionales especificos de este checkpoint.
