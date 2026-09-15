# Jeesup/svd-safety-mistral_7b_instruct_v02_up_svdllm_finetuned_keep_0p70

## Resumen

Este repositorio contiene una version comprimida mediante descomposicion en valores singulares (SVD) de `mistralai/Mistral-7B-Instruct-v0.2`. Lo publica el usuario Jeesup aplicando el metodo completo SVD-LLM con el codigo de los autores originales (repositorio AIoT-MLSys-Lab/SVD-LLM, commit `7538cca98880`), eliminando el 30% de los parametros y reteniendo una fraccion real de 0,6999230018028846.

El pipeline de compresion encadena blanqueado de datos (calibrado con 256 secuencias de 2048 tokens de WikiText-2, semilla 3), truncamiento SVD, dos rondas de ajuste fino LoRA (una sobre los factores U y otra sobre los factores V, con r=8, 2 epocas cada una, lr 0,0001 y batch 64 sobre `yahma/alpaca-cleaned`) y finalmente el plegado de los factores a formas densas de Mistral (`W = U @ V`). El resultado es un checkpoint con las mismas formas que el modelo original, pero de rango deficiente: pesa lo mismo en disco y carga con `transformers` estandar sin codigo de modelado personalizado.

Su relevancia es doble: por un lado documenta una aplicacion reproducible de SVD-LLM sobre un modelo instructivo muy extendido, incluido un parche necesario en `component/svd_mistral.py` para que PEFT construya correctamente los adaptadores LoRA cuando las matrices k/v tienen dimensiones no cuadradas; por otro, publica una evaluacion conjunta de utilidad (perplejidad, ARC, HellaSwag, etc.) y de seguridad (AdvBench, StrongREJECT, tasas de sobrerrechazo), lo que permite estudiar si la compresion degrada el comportamiento de alineamiento. El propio autor advierte de que, a este ratio de compresion, la calidad de generacion puede degradarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-7B-Instruct-v0.2) con pesos comprimidos por truncamiento SVD de bajo rango |
| Parametros totales | 7.241.732.096 (checkpoint denso; rango efectivo reducido) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | mistralai/Mistral-7B-Instruct-v0.2 |
| Fraccion de parametros retenida | 0,6999230018028846 (30% eliminado) |
| Tamano del repositorio | 14,5 GB |
| Fecha de creacion | 2026-09-15 |
| Ultima actualizacion | 2026-09-15 |
| Descargas / likes | 11 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral-7B-Instruct-v0.2, un transformer decoder-only con Grouped-Query Attention, sobre el que se aplica truncamiento SVD en lugar de poda estructurada o cuantizacion. El proceso completo consiste en: blanqueado de datos con 256 secuencias de WikiText-2 de 2048 tokens (semilla 3), truncamiento SVD guiado por el ratio de retencion, ajuste LoRA sobre los factores U (r=8, 2 epocas, lr 0,0001, batch 64, `yahma/alpaca-cleaned`), fusion de esos adaptadores, segundo ajuste LoRA sobre los factores V con la misma configuracion, fusion final y plegado a un checkpoint denso de formas Mistral.

La innovacion practica del repositorio es un parche sobre `component/svd_mistral.py` (sha256 `b8c277613b72`). En el codigo original, `SVD_MistralAttention` calcula el rango de las matrices k/v con la formula de matriz cuadrada `int(hidden * ratio / 2)` que comparte con q y o, mientras que `whitening()` genera en realidad `int(kv * hidden * r / (kv + hidden))`. Los pesos resultan correctos, pero `nn.Linear.in_features` queda desactualizado y PEFT construye los adaptadores LoRA con la forma equivocada, lo que hace fallar la etapa LoRA. El parche declara el rango que `whitening()` escribe realmente, ademas de un recorte de mascara causal para `transformers >= 4.43`. La aritmetica de truncamiento no se modifica. No se documentan en la informacion disponible ni el numero total de tokens de entrenamiento del modelo base, ni si hubo RLHF o DPO en su alineamiento original.

## Capacidades

- Generacion de texto conversacional en formato instructivo, usando la plantilla de chat del modelo base.
- Razonamiento de sentido comun y conocimiento general, medido con ARC-Easy, ARC-Challenge, HellaSwag, WinoGrande, OpenBookQA y PIQA en modo zero-shot.
- Resolucion de problemas matematicos basicos y razonamiento cuantitativo elemental (MathQA).
- Modelado de lenguaje general, con una perplejidad de 8,9134 en WikiText-2.
- Comportamiento de rechazo ante peticiones nocivas, evaluado con AdvBench y StrongREJECT (es decir, el modelo conserva cierta capacidad de negarse a generar contenido danino, aunque con tasas de exito de ataque elevadas).
- Baja tendencia al sobrerrechazo segun la evaluacion del autor: 0,0720 en XSTest-safe, 0,0524 en OR-Bench-Hard-1K y 0,0622 en la tasa macro.
- No se documenta soporte de tool calling, function calling, uso agentico, capacidades multimodales (vision o audio) ni modo de razonamiento explicito (thinking mode) en la informacion disponible.
- No se especifican los idiomas soportados.

## Casos de uso

- Investigacion sobre compresion de modelos: sirve como punto de comparacion reproducible frente al Mistral-7B-Instruct-v0.2 completo para medir cuanto degrada el truncamiento SVD al 70% de parametros retenidos en perplejidad y tareas zero-shot.
- Estudio de seguridad y alineamiento bajo compresion: las metricas de AdvBench (ASR 0,7308), StrongREJECT (ASR 0,5399) y sobrerrechazo permiten analizar si la compresion altera las tasas de rechazo o vuelve degenerativa la generacion, tal como advierte el propio autor.
- Evaluacion de pipelines LoRA sobre factores SVD: el repositorio documenta la secuencia completa (LoRA sobre U, merge, LoRA sobre V, merge, fold), util para reproducir o auditar la tecnica con otros modelos base.
- Sustitucion de bajo coste en prototipos de chatbot: al mantener las formas densas de Mistral y cargar con `transformers` estandar, puede desplegarse como alternativa al modelo original cuando lo prioritario es estudiar el compromiso calidad/almacenamiento, no reducir el uso de memoria.
- Generacion de texto en tareas de investigacion con presupuesto limitado: la perplejidad de 8,9134 en WikiText-2 indica que el modelo sigue produciendo texto coherente para experimentos de modelado de lenguaje, aunque no se recomienda como sustituto de produccion sin validacion previa.
- Analisis de robustez frente a ataques de jailbreak: con tasas ASR conocidas y un juez reproducible (`cais/HarmBench-Llama-2-13b-cls`), es util como sujeto de pruebas en estudios de red-teaming comparados.
- Docencia y formacion tecnica: sirve como ejemplo completo y verificable de un flujo de compresion con SVD, con los ficheros de salidas por prompt en `utility/` y `safety/` para inspeccion paso a paso.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| Fraccion de parametros retenida | 0,6999 |
| Perplejidad en WikiText-2 | 8,9134 |
| arc_easy (acc_norm) | 0,6633 |
| arc_challenge (acc_norm) | 0,4343 |
| hellaswag (acc_norm) | 0,6728 |
| winogrande (acc) | 0,6259 |
| openbookqa (acc_norm) | 0,4120 |
| piqa (acc_norm) | 0,7378 |
| mathqa (acc_norm) | 0,2908 |
| AdvBench HarmBench ASR | 0,7308 |
| StrongREJECT HarmBench ASR | 0,5399 |
| Tasa de sobrerrechazo (XSTest-safe) | 0,0720 |
| Tasa de sobrerrechazo (OR-Bench-Hard-1K) | 0,0524 |
| Tasa macro de sobrerrechazo | 0,0622 |

Metodologia declarada: perplejidad en WikiText-2; ARC-Easy/Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA en zero-shot; AdvBench y StrongREJECT generados y juzgados con `cais/HarmBench-Llama-2-13b-cls`; sobrerrechazo en XSTest-safe y OR-Bench-Hard-1K juzgado con `allenai/wildguard`. Toda la generacion usa plantilla de chat y decodificacion greedy. El autor indica que el juicio de sobrerrechazo es fiable en esta celda (fraccion puntuada de 1,00 en ambos conjuntos). No se proporcionan resultados de MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM estimada en precision completa (fp16/bf16): en torno a 14,5 GB solo para los pesos, coherente con el tamano del repositorio (7.241.732.096 parametros x 2 bytes), mas la cache KV y el overhead del runtime.
- VRAM estimada en int8: aproximadamente 7-8 GB para los pesos, mas cache KV y overhead.
- VRAM estimada en 4 bits: aproximadamente 4-5 GB para los pesos, mas cache KV y overhead. Es necesario cuantizar el modelo el mismo, porque el repositorio solo publica safetensors sin cuantizar.
- GPU de datacenter recomendadas: A100 (40 GB u 80 GB) o H100, con holgura para contexto largo y lotes grandes.
- GPU de consumo: cabe en fp16 en tarjetas de 24 GB (RTX 3090, RTX 4090, RTX A5000). En tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070) requiere cuantizacion a 8 o 4 bits.
- Opciones de despliegue: `transformers` estandar con PEFT (los pesos estan plegados a formas densas de Mistral, por lo que no hace falta codigo de modelado propio), vLLM o TGI para servido de alto rendimiento. Para llama.cpp u Ollama seria necesario convertir y cuantizar a GGUF, conversion que no se proporciona en el repositorio.
- Latencia y throughput: no disponible en la informacion proporcionada. El checkpoint no reduce el tamano en disco ni el numero de parametros almacenados, por lo que no cabe esperar una ganancia de velocidad por si mismo; la ventaja declarada por el autor es el rango deficiente, no un ahorro de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| Jeesup/svd-safety-mistral_7b_instruct_v02_up_svdllm_finetuned_keep_0p70 | 7.241.732.096 (denso, rango reducido al 70%) | no disponible en la informacion proporcionada | Apache 2.0 | Ver tabla de benchmarks | safetensors en HuggingFace, 14,5 GB, 11 descargas |
| mistralai/Mistral-7B-Instruct-v0.2 (modelo base) | 7,24B aprox. | no disponible en la informacion proporcionada | Apache 2.0 | no disponible en la informacion proporcionada | safetensors en HuggingFace |
| Otras variantes comprimidas de Mistral-7B (por ejemplo, las publicadas en el repositorio SVD-LLM) | no disponible | no disponible | no disponible | no disponible | repositorio GitHub AIoT-MLSys-Lab/SVD-LLM |
| Alternativas de tamano similar (Llama-2-7B-Chat, Llama-3.1-8B-Instruct) | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | safetensors en HuggingFace |

No se han proporcionado datos de benchmarks de los modelos comparables, por lo que no es posible establecer una comparacion cuantitativa de rendimiento. La unica diferencia verificable es la fraccion de parametros efectivos (0,6999) y la perplejidad declarada del modelo comprimido.

## Limitaciones y advertencias

- El propio autor advierte de que comprimir a este ratio puede degradar la calidad de generacion. El modelo es de rango deficiente: no es mas pequeno en disco ni tiene menos parametros almacenados que el modelo base.
- Las metricas de seguridad proceden de un modelo que puede haberse vuelto degenerativo; el autor subraya que no deben interpretarse como evidencia sobre alineamiento sin leerlas junto a las columnas de sobrerrechazo y seguimiento de instrucciones.
- Tasa de exito de ataque elevada: 0,7308 en AdvBench y 0,5399 en StrongREJECT segun HarmBench. Son valores altos, indicativos de que el modelo puede ser inducido a generar contenido danino.
- Riesgo de alucinacion no cuantificado en la informacion disponible, pero inherente a un modelo ajustado por instrucciones y agravado por la perdida de rango.
- Idiomas soportados no especificados: no hay garantia de un rendimiento multilingue mas alla del comportamiento heredado del modelo base.
- No se documentan capacidades de tool calling, uso agentico ni multimodalidad, por lo que no deberia asumirse que las conserva.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Mistral-7B-Instruct-v0.2, tambien Apache 2.0.
- En produccion conviene validar el modelo en el dominio objetivo antes de sustituir al Mistral original, dado que no se publican comparativas directas contra el base en las mismas condiciones de evaluacion.
- El repositorio tiene muy poca traccion (11 descargas, 0 likes) y fue creado y actualizado el mismo dia, lo que limita la evidencia externa sobre su reproducibilidad.
- El parche del codigo de SVD-LLM es necesario para reproducir el ajuste LoRA; quien intente reentrenar sin aplicarlo fallara en esa etapa.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-mistral_7b_instruct_v02_up_svdllm_finetuned_keep_0p70
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Codigo de SVD-LLM (commit `7538cca98880`): https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Dataset de ajuste LoRA: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Dataset de calibracion (WikiText-2): https://huggingface.co/datasets/wikitext
- Juez de seguridad HarmBench: https://huggingface.co/cais/HarmBench-Llama-2-13b-cls
- Juez de sobrerrechazo WildGuard: https://huggingface.co/allenai/wildguard
- Benchmarks de seguridad AdvBench y StrongREJECT: no disponible en la informacion proporcionada
- Nota: la busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos eran paginas genericas de efemerides historicas sin relacion con el contenido.
