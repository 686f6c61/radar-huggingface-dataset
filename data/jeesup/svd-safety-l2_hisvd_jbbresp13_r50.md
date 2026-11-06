# Jeesup/svd-safety-l2_hisvd_jbbresp13_r50

## Resumen

`svd-safety-l2_hisvd_jbbresp13_r50` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` comprimido mediante HiSVD (una reimplementacion de `redai-infra/HiSVD`) y posteriormente recuperado con la etapa 2 de LoRA de SVD-LLM. El resultado conserva el 50,47 % de los parametros densos del modelo original (6.738.415.616 parametros, frente a los 6.738.415.616 del checkpoint base sin comprimir, segun el campo `safetensors` del repositorio). Lo publica el usuario `Jeesup` como artefacto de investigacion, no como modelo de proposito general.

El modelo existe para estudiar como la compresion por descomposicion en valores singulares (SVD) degrada el comportamiento de seguridad de un modelo alineado y que regla de seleccion de componentes repara mejor ese dano. Esta celda concreta forma parte de una rejilla experimental sobre reglas de seleccion y presupuestos de compresion, con calibracion en `wikitext2:256` y `jbb_harm_resp:13`, longitud de secuencia 2048 y semilla 42.

Es relevante ahora porque cuantifica empiricamente el compromiso entre seguridad y utilidad bajo compresion: el autor reporta un ASR de 0,0038 en AdvBench y 0,0160 en StrongREJECT (juez HarmBench), pero tambien una sobretasa de rechazo macro de 0,5234 medida con WildGuard y una perplejidad de 12,4460 en WikiText-2. Es decir, un modelo que rechaza mucho y responde con fluidez degradada, lo que lo convierte en un sujeto experimental y no en un asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido con HiSVD y recuperado con LoRA etapa 2 de SVD-LLM |
| Parametros totales | 6.738.415.616 (50,47 % del checkpoint denso de Llama-2-7b-chat) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama-2-7b-chat soporta 4096 tokens; la calibracion uso seqlen 2048) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de la familia Llama 2 (7B, chat). Sobre esa base se aplica HiSVD, una tecnica de compresion por descomposicion en valores singulares que elimina el 50,00 % de los parametros y deja una fraccion resultante de 0,5047. La seleccion de componentes usa el metodo de rango `stable`, modulacion `logarithmic` y `alpha` 1,0. La calibracion se hizo con `wikitext2:256` y `jbb_harm_resp:13`, longitud de secuencia 2048 y semilla 42.

Tras la compresion, el checkpoint se recupera con la etapa 2 de LoRA de SVD-LLM, aplicada secuencialmente sobre U y luego sobre V, con el dataset `alpaca-cleaned`, rango 8, alpha 16, 2 epocas, learning rate 1e-4, batch 64, cutoff 256 y precision bf16. No se documenta en la informacion disponible un entrenamiento adicional con RLHF o DPO; la alineacion proviene del checkpoint base de Llama-2-7b-chat y la recuperacion es puramente supervisada sobre instrucciones.

## Capacidades

- Generacion de texto conversacional, heredada de Llama-2-7b-chat, aunque con fluidez degradada por la compresion (perplejidad WikiText-2 de 12,4460).
- Razonamiento y respuesta a instrucciones a traves del ajuste LoRA sobre `alpaca-cleaned`.
- Comportamiento de rechazo medible: ASR bajo en AdvBench (0,0038) y StrongREJECT (0,0160) con juez HarmBench.
- Alta tasa de sobretasa de rechazo (0,5234 macro con WildGuard), es decir, rechaza peticiones benignas con frecuencia.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Estudio de robustez de seguridad bajo compresion: usar el checkpoint como celda de una rejilla para medir como varia el ASR en AdvBench y StrongREJECT al cambiar la regla de seleccion de componentes y el presupuesto de compresion, comparando con el modelo base sin comprimir.
- Investigacion sobre sobretasa de rechazo: analizar por que la compresion eleva el rechazo macro a 0,5234 con WildGuard y que componentes del modelo contribuyen a ese comportamiento, usando el checkpoint como sujeto experimental.
- Evaluacion de tecnicas de recuperacion: comparar la etapa 2 de LoRA de SVD-LLM (r=8, alpha=16, alpaca-cleaned) frente a otras estrategias de recuperacion midiendo perplejidad en WikiText-2 y ASR en los mismos conjuntos.
- Calibracion de jueces de seguridad: emplear las respuestas del modelo como entradas controladas para validar clasificadores tipo HarmBench o WildGuard, dado que el autor reporta metricas concretas por celda.
- Analisis de interpretabilidad de la compresion SVD: inspeccionar los factores U y V recuperados por LoRA para estudiar que direcciones de peso se ven afectadas por la eliminacion del 50 % de parametros.
- Reproducibilidad de experimentos: servir el checkpoint con `transformers` o text-generation-inference para replicar las metricas reportadas (ASR, perplejidad) bajo la misma calibracion y semilla.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0038 |
| StrongREJECT ASR (juez HarmBench) | 0,0160 |
| Sobretasa de rechazo macro (WildGuard) | 0,5234 |
| Perplejidad WikiText-2 | 12,4460 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni los valores correspondientes del checkpoint base sin comprimir para contextualizar estas cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 6.738.415.616 parametros, en bf16 serian aproximadamente 13,5 GB de pesos, y en fp32 unos 27 GB. El tamano del repositorio es de 13,5 GB.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, una GPU con 16 GB o mas en bf16 (por ejemplo A100, H100, L40S) seria el punto de partida razonable, aunque el autor no lo especifica.
- Cabe en GPU de consumo: no confirmado en la informacion disponible; en bf16 requiere mas de 12 GB, por lo que tarjetas de 16 GB o mas (RTX 4080, RTX 4090) podrian albergarlo, pero no hay dato oficial.
- Opciones de despliegue: `transformers` (libreria declarada) y text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`). Otras opciones como vLLM, llama.cpp u Ollama no estan confirmadas en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_hisvd_jbbresp13_r50 | 6.738.415.616 (50,47 % del denso) | no disponible | Llama 2 Community License | Checkpoint comprimido con HiSVD + LoRA etapa 2; ASR 0,0038 AdvBench, perplejidad 12,4460 WikiText-2 |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 (denso) | 4096 tokens | Llama 2 Community License | Modelo base sin comprimir; referencia para medir la degradacion por compresion |
| Otras celdas de la rejilla del autor | no disponible | no disponible | Llama 2 Community License | Variantes con distintas reglas de seleccion y presupuestos; no se detallan en la informacion disponible |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoria mas alla de la referencia al checkpoint base.

## Limitaciones y advertencias

- El autor advierte explicitamente de que varias celdas de la rejilla estan deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat; la compresion por si sola eleva la tasa de exito de ataques.
- No es un modelo de proposito general: es un artefacto de investigacion y debe evaluarse antes de extraer conclusiones.
- La sobretasa de rechazo macro de 0,5234 indica un sesgo fuerte hacia el rechazo de peticiones benignas, lo que lo hace inadecuado para atencion al cliente u otras tareas conversacionales reales.
- La perplejidad de 12,4460 en WikiText-2 sugiere una fluidez notablemente degradada frente al modelo base.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero esperable dado el deterioro de perplejidad.
- Idiomas soportados: no disponibles; no se documenta cobertura multilingue.
- Restricciones de licencia: Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio; el uso comercial esta sujeto a los terminos de dicha licencia y a las politicas de uso de Meta.
- No se documentan tipos de cuantizacion ni formatos alternativos a safetensors.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_hisvd_jbbresp13_r50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- HiSVD (referencia citada por el autor): https://github.com/redai-infra/HiSVD
- SVD-LLM (tecnica de recuperacion citada): no disponible en la informacion proporcionada
- Dataset de recuperacion `alpaca-cleaned`: no disponible en la informacion proporcionada
- Paper o blog del estudio: no disponible en la informacion proporcionada
