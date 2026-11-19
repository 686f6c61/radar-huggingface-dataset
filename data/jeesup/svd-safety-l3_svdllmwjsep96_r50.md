# Jeesup/svd-safety-l3_svdllmwjsep96_r50

## Resumen

`svd-safety-l3_svdllmwjsep96_r50` es un checkpoint derivado de `meta-llama/Meta-Llama-3-8B-Instruct` comprimido mediante la tecnica SVD-LLM, que reduce el numero de parametros densos al 50,0 % (fraccion resultante 0,4997) y posteriormente recupera capacidad mediante una etapa de LoRA secuencial sobre U y V. Lo publica el usuario Jeesup en Hugging Face como artefacto de investigacion, no como modelo conversacional de proposito general.

El objetivo del checkpoint es estudiar como la compresion por descomposicion en valores singulares degrada el comportamiento de seguridad de un modelo alineado, y que regla de seleccion de componentes repara mejor ese dano. Para ello se emplea un conjunto de calibracion mixto que combina utilidad (WikiText-2) y seguridad (WildJailbreak), con una cuota efectiva de seguridad de solo 0,0247 de las posiciones.

Es relevante ahora porque cuantifica de forma empirica el compromiso entre utilidad y robustez frente a ataques de jailbreak en modelos comprimidos: reporta una tasa de exito de ataque (ASR) de 0,1077 en AdvBench y 0,1086 en StrongREJECT, con una perplejidad de 62,4018 en WikiText-2. El modelo conserva la arquitectura y el tamano del Llama-3-8B original (8.030.261.248 parametros), por lo que su interes es metodologico, no de eficiencia en despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido con SVD-LLM |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama-3-8B-Instruct: 8.192 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3 Community License (`license: llama3`) |
| Formato de pesos | safetensors |
| Fraccion de parametros tras compresion | 0,4997 (50,00 % eliminado) |
| Conjunto de calibracion | `wikitext2:256 + wj_harm_resp_sep:96` |
| Etapa de recuperacion | LoRA secuencial U→V, alpaca-cleaned, r=8, alpha=16, 2 epochs, lr 1e-4, batch 64, cutoff 256, bf16 |
| Semilla | 42 |
| Tamano del repositorio | 16,1 GB |

## Arquitectura y entrenamiento

El modelo parte de `Meta-Llama-3-8B-Instruct` y aplica la tecnica SVD-LLM de los autores (AIoT-MLSys-Lab/SVD-LLM), basada en una SVD blanqueada sobre las matrices de pesos. La seleccion de componentes se realiza con un conjunto de calibracion agrupado cuya matriz de covarianza es la suma de la contribucion de WikiText-2 y la de un conjunto de seguridad: `S S^T = sum_WikiText x x^T + sum_safety x x^T`. La parte de utilidad emplea 255 ventanas de 2.048 tokens del split de entrenamiento de WikiText-2 (muestreador de SVD-LLM, semilla 42) evaluando todas las posiciones; la parte de seguridad usa los primeros 96 de 512 prompts de entrenamiento de WildJailbreak (vanilla y adversariales daninos) con las respuestas de rechazo generadas por el propio Llama-3-8B-Instruct, una conversacion por muestra (13.214 posiciones, todas evaluadas). La cuota efectiva de seguridad resultante es de 0,0247 de las posiciones.

Tras la compresion al 50 % de parametros densos, se aplica la etapa 2 de SVD-LLM: un LoRA secuencial sobre U y despues sobre V, entrenado con alpaca-cleaned durante 2 epocas, rango 8, alpha 16, learning rate 1e-4, batch 64, longitud de corte 256 y precision bf16. No se documentan innovaciones adicionales como decodificacion especulativa ni atencion lineal; el checkpoint es una celda de una rejilla experimental sobre reglas de seleccion y presupuestos de compresion.

## Capacidades

- Generacion de texto conversacional heredada de Llama-3-8B-Instruct, sujeta a la degradacion introducida por la compresion.
- Razonamiento y respuesta a instrucciones en formato chat de Llama 3, con la plantilla del modelo base.
- Comportamiento de rechazo ante peticiones daninas, medido y parcialmente reparado mediante la calibracion de seguridad; el propio autor advierte que varias celdas de la rejilla estan deliberadamente degradadas en seguridad.
- Evaluacion de robustez frente a jailbreaks (AdvBench, StrongREJECT, WildJailbreak) como objeto de estudio.
- Soporte de tool calling y function calling: no documentado en la informacion proporcionada (el modelo base lo soporta, pero no se verifica tras la compresion).
- Capacidades de agente y razonamiento multi-paso: no documentadas ni evaluadas.
- Capacidades multilingues: no documentadas; los idiomas soportados figuran como no disponibles.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre compresion y alineacion: usar el checkpoint como celda de control en estudios que midan cuanto degrada la SVD la tasa de rechazo de un modelo alineado, comparando con otras reglas de seleccion de la misma rejilla.
- Evaluacion de robustez frente a jailbreaks: ejecutar AdvBench y StrongREJECT con un juez tipo HarmBench para reproducir los valores reportados (ASR 0,1077 y 0,1086) y validar la metodologia de calibracion con cuota de seguridad.
- Analisis de compromiso utilidad-seguridad: correlacionar la perplejidad en WikiText-2 (62,4018) con la precision zero-shot media en 7 tareas (0,4541) para trazar la frontera de Pareto de la compresion.
- Estudio de calibracion mixta: variar la proporcion de posiciones de seguridad (aqui 0,0247) y medir el efecto sobre la macro tasa de sobrerrechazo (0,2471 con WildGuard).
- Reproducibilidad de pipelines SVD-LLM: servir como referencia para validar implementaciones del estimador SVD blanqueado y de la recuperacion LoRA secuencial U→V.
- Analisis de interpretabilidad de componentes: inspeccionar que direcciones singulares preservadas se asocian con el comportamiento de rechazo, dado el etiquetado explicito del repositorio como trabajo de interpretabilidad.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,1077 |
| StrongREJECT ASR (juez HarmBench) | 0,1086 |
| Macro sobrerrechazo (WildGuard) | 0,2471 |
| Perplejidad WikiText-2 | 62,4018 |
| Precision media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4541 |

No se han publicado en la informacion disponible resultados comparativos frente al modelo base sin comprimir ni frente a otras celdas de la rejilla.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos, mas cache KV y activaciones; en la practica se recomienda 24 GB o mas para contexto largo.
- VRAM estimada en cuantizacion de 8 bits: en torno a 8-9 GB de pesos; en 4 bits, en torno a 4,5-5 GB (estimaciones a partir del numero de parametros; no se publican variantes cuantizadas).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090/4090 o GPUs de 16 GB para cuantizacion de 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090 en bf16 y en GPUs de 16-24 GB con cuantizacion; en 8 GB solo con cuantizacion agresiva no publicada.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp, Ollama y TGI son viables en teoria, pero no se documentan artefactos GGUF ni configuraciones verificadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l3_svdllmwjsep96_r50 | 8.030.261.248 (50 % denso eliminado) | no disponible | Llama 3 Community | Checkpoint de investigacion; ASR 0,1077 en AdvBench, perplejidad 62,4018 en WikiText-2 |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030.261.248 | 8.192 tokens | Llama 3 Community | Modelo base sin comprimir; referencia de utilidad y seguridad, sin metricas publicadas en esta ficha |
| Otras celdas de la rejilla de Jeesup | 8.030.261.248 | no disponible | Llama 3 Community | Distintas reglas de seleccion y presupuestos; no se detallan en la informacion disponible |
| SVD-LLM (implementacion de referencia) | no disponible | no disponible | no disponible | Metodo de compresion, no un modelo desplegable comparable |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- El propio autor indica que el checkpoint es un artefacto de investigacion y no un modelo conversacional de proposito general; no debe desplegarse como asistente.
- Varias celdas de la rejilla estan deliberadamente degradadas en seguridad respecto a Llama-3-8B-Instruct; la compresion por si sola eleva la tasa de exito de ataque.
- La cuota efectiva de seguridad en la calibracion es muy baja (0,0247 de las posiciones), lo que limita la reparacion del comportamiento de rechazo.
- La macro tasa de sobrerrechazo (0,2471 con WildGuard) indica que el modelo rechaza en exceso peticiones benignas en una fraccion considerable de casos.
- La perplejidad en WikiText-2 (62,4018) es alta, coherente con la perdida de calidad por la compresion al 50 %.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero esperable dada la degradacion de utilidad.
- Idiomas soportados: no disponibles; no se documenta el comportamiento multilingue tras la compresion.
- Restricciones de licencia: Llama 3 Community License, con `LICENSE` y `USE_POLICY.md` incluidos en el repositorio; el uso comercial de este derivado queda sujeto a dichos terminos y a las obligaciones de atribucion ("Built with Meta Llama 3").
- No se publican variantes cuantizadas ni artefactos GGUF, lo que limita el despliegue en entornos de bajos recursos sin trabajo adicional.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmwjsep96_r50
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Implementacion SVD-LLM de referencia: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Llama 3: incluida en el repositorio (`LICENSE` y `USE_POLICY.md`)
