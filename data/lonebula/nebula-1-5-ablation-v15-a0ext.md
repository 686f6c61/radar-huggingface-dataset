# LoNebula/Nebula-1.5-ablation-v15-a0ext

## Resumen

Nebula-1.5-ablation-v15-a0ext es un modelo de lenguaje base de tipo decoder, entrenado desde cero por LoNebula (Nebou Rocket) para japones e ingles. Con 121,8 millones de parametros, arquitectura estilo Llama de 24 capas, dimension de modelo 576 y vocabulario de 64.000 tokens, se posiciona en la categoria de modelos pequenos (small language models) orientados a despliegue eficiente y experimentacion controlada.

Este checkpoint concreto es un brazo de ablacion de Nebula-1.5: reproduce la misma mezcla de corpus que Nebula-1 escalada a 8.000 millones de tokens (4x Nebula-1) con semilla 1234, y sirve como referencia de escala pura frente al brazo "jaheavy" (mezcla con mayoria de japones). La relevancia actual reside en su metodologia: el autor publica ambos brazos y aplica una regla de decision pre-registrada (D2) para determinar que mezcla de datos se lanza en produccion, lo que permite reproducir e inspeccionar la decision.

El modelo esta liberado bajo licencia Apache 2.0, con pesos en safetensors y compatibilidad con transformers y text-generation-inference. No es un modelo instruct ni alineado: es una base para continuar el preentrenamiento o para servir como punto de partida en investigacion sobre mezclas de datos y escalado en regimen de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, d_model 576) |
| Parametros totales | 121.826.880 (122M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantizacion estandar via herramientas externas) |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de estilo Llama con 24 capas, dimension oculta de 576 y un vocabulario de 64.000 tokens. Se entrena desde cero ("from scratch"), sin inicializacion a partir de otro modelo. El checkpoint a0ext corresponde a la mezcla de corpus original de Nebula-1 (aproximadamente 50/50 japones/ingles) escalada a 8.000 millones de tokens, cuatro veces el volumen de Nebula-1, con semilla 1234.

Los datos de entrenamiento provienen de HuggingFaceFW/fineweb-edu, HuggingFaceTB/finemath, wikimedia/wikipedia y hotchpotch/fineweb-2-edu-japanese. El autor aplica una metodologia de decision pre-registrada (regla D2) que compara este brazo a0ext con el brazo jaheavy (mezcla JA 0,65 / EN 0,35). La regla exige una ganancia en el promedio japones de al menos 2 veces el error estandar combinado y una caida en el promedio ingles de como maximo 1 punto. El resultado fue ADOPT para jaheavy: +0,62 en japones (umbral 0,01) y +0,49 de caida en ingles (limite 1,0). No se documentan fases de RLHF, DPO ni ajuste por instrucciones en este checkpoint.

## Capacidades

- Generacion de texto autoregresiva en japones e ingles como modelo base (no instruct).
- Razonamiento basico y conocimiento factual medido en MMLU, ARC, HellaSwag, WinoGrande, PIQA y LAMBADA.
- Comprension lectora y resolucion de tareas de sentido comun en ambos idiomas.
- Evaluacion de razonamiento matematico (GSM8K, MGSM-ja) con rendimiento muy limitado dado el tamano.
- Tareas de inferencia linguistica en japones (JNLI, JComQA, XWinograd-ja, Belebele-ja).
- Capacidad de servir como base para fine-tuning supervisado o continuacion de preentrenamiento.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Investigacion sobre mezclas de datos: el modelo permite reproducir el experimento D2 comparando a0ext con jaheavy bajo el mismo harness y configuracion, util para estudiar el efecto de la proporcion de idiomas en modelos pequenos.
- Punto de partida para fine-tuning en japones: con 122M de parametros y licencia Apache 2.0, es viable ajustarlo en una unica GPU consumer para tareas de clasificacion, resumen o generacion de dominio especifico.
- Prototipado de asistentes conversacionales ligeros en japones: tras un SFT adecuado, puede desplegarse en entornos con recursos limitados donde un modelo mayor no es viable.
- Educacion e investigacion en NLP de bajo recurso: sirve como baseline reproducible para comparar tecnicas de tokenizacion, escalado o curriculum de datos en el rango de 100-150M de parametros.
- Generacion de texto aumentada en aplicaciones embebidas: su huella de 0,5 GB en safetensors permite integracion en pipelines con restricciones de memoria y latencia.
- Evaluacion comparativa de modelos pequenos: el autor publica resultados con lm-evaluation-harness 0.4.13 sobre 18 modelos, lo que facilita usarlo como referencia en estudios de benchmark.
- Experimentacion con tecnicas de cuantizacion: al ser un modelo denso y pequeno, es adecuado para medir el impacto de cuantizaciones en calidad y velocidad antes de aplicar las a modelos mayores.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness 0.4.13, misma semilla, dtype y batch size para todos los modelos. Valores en porcentaje.

| Modelo | Params | MMLU | ARC-e | ARC-c | HellaSwag | WinoGrande | PIQA | LAMBADA | GSM8K | MMLU-ja | JComQA | JNLI | XWinograd-ja | Belebele-ja | MGSM-ja | Avg (en) | Avg (ja) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Nebula-1.5-ablation-v15-a0ext | 122M | 26,5 | 43,6 | 24,4 | 30,5 | 50,7 | 60,3 | 25,6 | 0,7 | 26,4 | 57,1 | 44,2 | 54,7 | 22,9 | 2,0 | 32,8 | 34,6 |
| Nebula-1.5 jaheavy | 122M | 26,8 | 43,3 | 24,1 | 30,0 | 50,4 | 58,8 | 24,6 | 0,2 | 26,7 | 59,2 | 41,2 | 54,7 | 28,0 | 1,2 | 32,3 | 35,2 |
| SmolLM2-135M | 135M | 25,2 | 58,4 | 30,0 | 43,0 | 53,0 | 68,3 | 42,9 | 1,4 | 26,4 | 23,1 | 44,7 | 51,6 | 22,9 | 1,2 | 40,3 | 28,3 |
| MobileLLM-R1-140M-base | 140M | 23,8 | 50,0 | 24,7 | 34,1 | 50,7 | 62,9 | 31,2 | 19,0 | 25,3 | 22,0 | 49,9 | 52,2 | 21,4 | 1,6 | 37,1 | 28,7 |
| llm-jp-3-150m | 152M | 25,8 | 38,3 | 24,7 | 31,6 | 50,0 | 60,9 | 28,2 | 0,2 | 25,9 | 56,7 | 46,7 | 55,0 | 24,2 | 1,2 | 32,5 | 35,0 |
| gemma-3-270m | 268M | 26,5 | 57,2 | 28,1 | 41,4 | 53,6 | 67,8 | 42,9 | 1,3 | 27,3 | 46,1 | 38,4 | 55,2 | 23,1 | 1,2 | 39,8 | 31,9 |
| LFM2-350M | 354M | 43,1 | 66,7 | 39,6 | 49,0 | 56,7 | 69,0 | 39,8 | 34,0 | 36,8 | 54,6 | 36,8 | 54,8 | 39,8 | 0,0 | 49,8 | 37,1 |
| MobileLLM-R1-360M-base | 359M | 26,5 | 61,2 | 34,4 | 44,1 | 55,2 | 69,0 | 39,4 | 41,6 | 24,0 | 29,2 | 55,0 | 53,4 | 27,6 | 0,0 | 46,4 | 31,5 |
| SmolLM2-360M | 362M | 25,1 | 68,1 | 38,1 | 56,2 | 59,7 | 72,0 | 53,2 | 4,2 | 26,0 | 26,6 | 49,3 | 51,5 | 28,2 | 2,0 | 47,1 | 30,6 |
| pythia-410m | 405M | 26,6 | 45,2 | 24,3 | 40,4 | 53,0 | 67,0 | 47,5 | 1,2 | 26,3 | 26,1 | 37,4 | 52,8 | 23,1 | 0,8 | 38,2 | 27,8 |
| llm-jp-3-440m | 447M | 24,8 | 45,1 | 24,3 | 42,5 | 52,0 | 66,7 | 39,5 | 1,3 | 24,9 | 59,8 | 40,3 | 58,3 | 22,1 | 0,8 | 37,0 | 34,4 |
| Qwen2.5-0.5B | 494M | 47,6 | 58,8 | 31,9 | 52,1 | 56,7 | 70,0 | 52,0 | 34,1 | 37,5 | 35,8 | 39,8 | 58,3 | 33,4 | 0,0 | 50,4 | 34,1 |
| LFM2-700M | 742M | 49,4 | 71,0 | 46,9 | 57,5 | 59,1 | 71,0 | 45,1 | 46,4 | 42,6 | 65,1 | 29,8 | 58,9 | 44,2 | 12,4 | 55,8 | 42,2 |
| sarashina2.2-0.5b | 793M | 27,3 | 37,0 | 26,7 | 35,8 | 54,8 | 58,1 | 35,1 | 19,4 | 27,8 | 72,7 | 30,3 | 66,0 | 27,3 | 23,6 | 36,8 | 41,3 |

El modelo ocupa el puesto 12 de 18 en el promedio ingles (32,8) y el 6 de 18 en el promedio japones (34,6). No se midieron Qwen3-0.6B-Base, MobileLLM-R1-950M-base, llm-jp-3-980m ni gemma-3-1b-pt.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp16 (122M parametros x 2 bytes), alrededor de 0,25 GB en int8 y en torno a 0,13 GB en int4, mas overhead de activaciones y cache KV.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 pueden ejecutarlo sin problemas.
- Cabe holgadamente en GPU consumer, incluidas integradas con suficiente memoria compartida, y puede ejecutarse en CPU.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible), llama.cpp/Ollama y vLLM mediante conversion de pesos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Avg (en) | Avg (ja) | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Nebula-1.5-ablation-v15-a0ext | 122M | no disponible | 32,8 | 34,6 | Apache 2.0 | Hugging Face |
| llm-jp-3-150m | 152M | no disponible | 32,5 | 35,0 | no disponible | Hugging Face |
| SmolLM2-135M | 135M | no disponible | 40,3 | 28,3 | no disponible | Hugging Face |
| MobileLLM-R1-140M-base | 140M | no disponible | 37,1 | 28,7 | no disponible | Hugging Face |
| gemma-3-270m | 268M | no disponible | 39,8 | 31,9 | no disponible | Hugging Face |

Frente a llm-jp-3-150m, el modelo de Nebula es competitivo en japones (34,6 vs 35,0) con menos parametros. Frente a SmolLM2-135M y MobileLLM-R1-140M-base, estos superan claramente a Nebula en el promedio ingles (40,3 y 37,1 frente a 32,8), mientras que Nebula los supera en japones. La licencia Apache 2.0 es una ventaja frente a alternativas cuya licencia no esta detallada en la informacion disponible.

## Limitaciones y advertencias

- Es un checkpoint de ablacion, no un modelo final de produccion: el autor lo publica como referencia de escala dentro de un experimento controlado.
- No es un modelo instruct ni alineado; no se ha sometido a RLHF, DPO ni SFT, por lo que no sigue instrucciones de forma fiable.
- Rendimiento muy bajo en razonamiento matematico (GSM8K 0,7; MGSM-ja 2,0) y en conocimiento factual (MMLU 26,5), propio de su tamano.
- Riesgo elevado de alucinacion y de generar texto incoherente en tareas complejas o de contexto largo.
- La longitud de contexto no esta documentada, lo que limita su uso en aplicaciones que requieran ventanas amplias.
- Solo soporta japones e ingles; el rendimiento en otros idiomas no esta evaluado.
- El promedio ingles lo situa en el puesto 12 de 18 entre los modelos comparados, por debajo de alternativas de tamano similar.
- Aunque la licencia es Apache 2.0, conviene verificar los terminos de los datasets de entrenamiento para uso comercial en dominios regulados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LoNebula/Nebula-1.5-ablation-v15-a0ext
- Brazo jaheavy (Nebula-1.5-preview): https://huggingface.co/LoNebula/Nebula-1.5-preview
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset fineweb-2-edu-japanese: https://huggingface.co/datasets/hotchpotch/fineweb-2-edu-japanese
- Resultados de evaluacion referenciados: eval/v15-result.json (en el repositorio del modelo)
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
