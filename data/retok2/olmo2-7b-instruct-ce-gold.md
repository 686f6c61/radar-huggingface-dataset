# Retok2/olmo2-7b-instruct-ce-gold

## Resumen

OLMo-2-7B-Instruct context-perturbed SFT (`ce_gold`, seed 42) es un ajuste fino del modelo `allenai/OLMo-2-1124-7B-Instruct` publicado por el usuario Retok2 en Hugging Face. No es un asistente de proposito general, sino una **linea base de investigacion** sobre robustez frente a ataques de tokenizacion adversarial (AdvTok). Su tesis es sencilla: comprobar si basta con exponer al modelo a multiples tokenizaciones del mismo prompt durante el SFT para que gane robustez, sin objetivos de consistencia, KL ni destilacion.

El modelo tiene 7.298.617.344 parametros (7,3 mil millones) en precision bfloat16, con un repositorio de 14,6 GB en formato safetensors. Se entrena sobre el checkpoint instruct de OLMo 2 (familia totalmente abierta de AI2), mantiene la licencia Apache 2.0 y esta disenado exclusivamente para ingles. Su relevancia es metodologica: sirve como control experimental ("exposure alone") contra el que se comparan tecnicas de entrenamiento con consistencia de tokenizacion.

El resultado principal es un compromiso claro: reduce el exito del ataque AdvTok a 0,0200 en decodificacion greedy, pero a costa de una tasa de sobrerrechazo del 23,5 % en prompts seguros de XSTest. Ademas, el propio autor advierte que la varianza entre semillas es alta (0,0920 y 0,1100 en las semillas 1 y 2), por lo que las cifras de la semilla 42 no deben tratarse como caracteristicas de la receta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo 2 de AI2), ajuste fino supervisado |
| Parametros totales | 7.298.617.344 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en bfloat16) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de OLMo 2 7B Instruct de AI2, un transformer decoder-only denso. El ajuste fino no modifica la topologia: solo altera pesos mediante SFT. La innovacion esta en el procedimiento de datos. En cada paso se muestrea un prompt, se construye el span de contenido y se generan **nueve codificaciones** del mismo: la canonica mas ocho muestras de la retícula de tokenizacion MDD. Sobre las nueve ramas se aplica entropia cruzada estandar hacia un objetivo fijo, con peso uniforme de 1/9. No hay modelo de referencia en entrenamiento, ni KL, ni matching de representaciones, ni reponderacion CVaR. El andamiaje de la plantilla de chat nunca se retokeniza; solo el span de contenido.

Los objetivos difieren segun el tipo de prompt: para los benignos (71,4 %) se usa la respuesta gold del dataset Alpaca; para los daninos (28,6 %) se usa la continuacion muestreada del modelo de referencia congelado a temperatura 1. El campo `target` de AdvBench (las cadenas de cumplimiento tipo "Sure, here is how to...") nunca se uso como supervision. Como el modelo base rechaza esos prompts, en la practica los objetivos daninos son sus propios rechazos. La configuracion concreta: 700 pasos, `grad_accum=8`, learning rate 1e-5, 20 pasos de warmup, `max_grad_norm=1.0`, optimizador `paged_adamw_8bit` con maestros fp32 y autocast bf16, maximo de 128 tokens objetivo, semilla 42. La deriva de pesos respecto al base (L2 relativa) fue de 0,011965 en atencion, 0,012789 en MLP, 0,010060 en `lm_head`, 0,000919 en embeddings y 0,001006 en normas; todos los grupos superaron el umbral de 1e-5.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del checkpoint instruct base.
- Modo de investigacion en robustez de tokenizacion: es su proposito principal y el unico documentado con evaluacion.
- Resistencia medida frente a ataques AdvTok: 0,0200 de exito con decodificacion greedy y 0,0625 a temperatura 1 (8 muestras por prompt).
- Rechazo consistente ante prompts canonicos daninos: tasa de rechazo 1,0000 con tokenizacion canonica.
- Tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: solo ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Linea base en estudios de robustez de tokenizacion: sirve como control "exposure alone" frente al que medir objetivos de consistencia o destilacion en el mismo banco de evaluacion (AdvTok, XSTest, Alpaca).
- Reproduccion de experimentos de seguridad: con semilla, configuracion y codigo documentados, permite replicar la curva de sobrerrechazo y exito de ataque en entornos controlados.
- Evaluacion de jueces de seguridad: sus respuestas almacenadas permiten comparar Llama-Guard-3-8B frente a HarmBench-Llama-2-13b-cls, que discrepan en un factor cercano a dos.
- Analisis de sensibilidad a semillas: util para cuantificar cuanto varia la robustez aparente de una receta de SFT con solo cambiar la semilla (0,0200 frente a 0,0500 en exito de ataque greedy).
- Investigacion sobre sobrerrechazo: el 23,5 % en XSTest-safe lo convierte en un caso de estudio de como la exposicion a tokenizaciones variadas degrada la utilidad conversacional.
- Docencia y divulgacion tecnica: ejemplo concreto de ataque de tokenizacion y de como una intervencion de datos aparentemente inocua altera el comportamiento de rechazo del modelo.

## Benchmarks y rendimiento

Evaluacion sobre las 200 prompts de AdvBench retenidas (excluidas del entrenamiento), con intervalos bootstrap del 95 % sobre prompts (10.000 remuestreos). El exito de ataque se juzga con Llama-Guard-3-8B salvo que se indique lo contrario.

| Medicion | Valor |
|---|---|
| Exito de ataque AdvTok, greedy | 0,0200 ± 0,0175 |
| Exito de ataque AdvTok, T=1 (8 muestras/prompt) | 0,0625 ± 0,0253 |
| Exito de ataque con tokenizacion canonica, greedy | 0,0000 |
| Rechazo con tokenizacion canonica, greedy | 1,0000 |
| Re-evaluado con HarmBench, greedy | 0,0100 |
| Re-evaluado con HarmBench, T=1 | 0,0238 |
| Re-evaluado con HarmBench, canonico | 0,0000 |

| Conjunto de prompts | Tasa de rechazo |
|---|---|
| XSTest safe (250 prompts) | 0,2350 ± 0,0400 |
| Alpaca benigno (100 prompts) | 0,0525 ± 0,0350 |
| XSTest unsafe (200 prompts) | 0,8875 ± 0,0287 |

| Semilla | AdvTok T=0 | AdvTok T=1 | Rechazo XSTest-safe |
|---|---|---|---|
| 42 (este modelo) | 0,0200 | 0,0625 | 0,2350 |
| 1 | 0,0500 | 0,1125 | 0,0920 |
| 2 | evaluacion en curso | evaluacion en curso | 0,1100 |

No se han publicado resultados de MMLU, GSM8K ni IFEval para la semilla 42 en la informacion disponible. Las replicas con semillas 1 y 2 pierden aproximadamente 3-4 puntos de MMLU y 16-19 puntos de GSM8K frente al modelo base, por lo que cabe esperar un coste real de capacidad.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 14,6 GB solo para pesos, mas overhead de activaciones y cache KV; con 24 GB de VRAM se opera con margen limitado.
- Cuantizacion: no se publican pesos GGUF ni cuantizados en el repositorio; habria que generarlos a partir de los safetensors bf16.
- GPU recomendadas para bf16 sin cuantizar: A100 40/80 GB, H100 80 GB, L40S 48 GB.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en bf16 con contexto moderado; en GPUs de 16 GB requeriria cuantizacion a 8 bits o inferior.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama previa conversion a GGUF, y transformers con `AutoModelForCausalLM`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Retok2/olmo2-7b-instruct-ce-gold | 7,3 B | no disponible | SFT con 9 tokenizaciones, objetivo fijo | Apache 2.0 | Hugging Face |
| allenai/OLMo-2-1124-7B-Instruct | 7,3 B | no disponible | Instruct base de AI2 | Apache 2.0 | Hugging Face |
| Otras ramas de consistencia del mismo estudio | 7,3 B | no disponible | Objetivos de consistencia y destilacion | no disponible | no disponible |

La comparacion cuantitativa directa con las ramas de consistencia del estudio solo esta disponible de forma cualitativa: el autor indica que alcanzan numeros de exito de ataque comparables con menos de la mitad de sobrerrechazo. No se dispone de cifras concretas de esas ramas en la informacion proporcionada.

## Limitaciones y advertencias

- Sobrerrechazo elevado: rechaza aproximadamente uno de cada cuatro prompts seguros de XSTest (0,2350), lo que lo inutiliza como asistente practico.
- Alta sensibilidad a la semilla: la tasa de sobrerrechazo varia en un factor de ~2,5 entre semillas (0,2350 frente a 0,0920 y 0,1100); la semilla 42 es la mas alta.
- Coste de capacidad esperado: las replicas con otras semillas pierden 3-4 puntos de MMLU y 16-19 puntos de GSM8K frente al base; la evaluacion de capacidad de la semilla 42 aun no estaba publicada.
- Robustez limitada a AdvTok: los resultados no implican resistencia frente a otras familias de jailbreak.
- Solo ingles y evaluado unicamente en Alpaca, AdvBench y XSTest.
- Dependencia del juez: Llama-Guard-3-8B y HarmBench difieren en un factor cercano a dos en las mismas respuestas almacenadas.
- Filtracion parcial de datos: las 200 prompts de AdvBench usadas en evaluacion se retuvieron del entrenamiento, pero las otras 320 de AdvBench se usaron en el entrenamiento.
- No es una release alineada en seguridad ni un asistente de proposito general; su uso previsto es la investigacion.
- Licencia Apache 2.0 permite uso comercial, pero el comportamiento del modelo (sobrerrechazo y capacidad degradada) hace inviable su uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Retok2/olmo2-7b-instruct-ce-gold
- Modelo base: https://huggingface.co/allenai/OLMo-2-1124-7B-Instruct
