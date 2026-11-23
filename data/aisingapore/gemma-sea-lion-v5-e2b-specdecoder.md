# aisingapore/Gemma-SEA-LION-v5-E2B-SpecDecoder

## Resumen

Gemma-SEA-LION-v5-E2B-SpecDecoder es un modelo borrador (draft model) disenado especificamente para decodificacion especulativa junto al modelo objetivo aisingapore/Gemma-SEA-LION-v5-E2B. Lo desarrolla el AI Products Pillar de AI Singapore, con financiacion de la National Research Foundation Singapore, dentro de la familia SEA-LION (Southeast Asian Languages In One Network), orientada a lenguas del sudeste asiatico. No es un modelo autonomo: propone bloques de tokens que el modelo objetivo verifica, de modo que su unica funcion es acelerar la inferencia sin alterar la distribucion de salida del modelo grande.

Tecnicamente combina un backbone de difusion de bloques ligero (DFlash), que propone un bloque completo de tokens en un unico forward pass paralelo, con un refinador causal XPress que restaura las dependencias entre los tokens del bloque antes de que el modelo objetivo los verifique. Con 324.091.136 parametros y un repo de 0,7 GB, es un componente auxiliar de bajo coste computacional que se sirve junto al modelo objetivo en vLLM.

Su relevancia es practica: en las pruebas publicadas por el autor, el uso de este SpecDecoder eleva el throughput de 278,7 a 1076,0 tokens por segundo en gsm8k y de 294,1 a 807,2 en birmano, con longitudes de aceptacion de hasta 5,768 tokens por paso en math500. El interes es especialmente alto para despliegues multilingues en el sudeste asiatico, donde otros drafters genericos rinden peor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Draft model para decodificacion especulativa: difusion de bloques DFlash con refinador causal XPress |
| Parametros totales | 324.091.136 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh, my, id, fil, ms, ta, th, vi |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un drafter de decodificacion especulativa que combina dos componentes. El backbone DFlash es un modelo de difusion de bloques ligero que propone un bloque entero de tokens en un solo forward pass paralelo, en lugar de generar token a token de forma autorregresiva. Sobre el se anade una cabeza XPress, un refinador causal que restaura las dependencias entre los tokens del bloque antes de entregarlo al modelo objetivo para su verificacion. Esta arquitectura sigue el diseno de Wang et al. (arxiv 2608.02438). El backbone DFlash se inicializo (warm-start) a partir de rasyosef/gemma-4-E2B-it-dflash2 y se extendio con la cabeza XPress.

Los datos de entrenamiento provienen de tres conjuntos: aisingapore/SEA-Instruct-2602 (instrucciones multilingues del sudeste asiatico), nvidia/Nemotron-SFT-Math-v4 (matematicas) y nvidia/Nemotron-SFT-Competitive-Programming-v2 (programacion competitiva). La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos figuran como no disponibles. El modelo propone hasta 15 tokens especulativos por paso en la configuracion recomendada.

## Capacidades

- Decodificacion especulativa: propone bloques de tokens que el modelo objetivo Gemma-SEA-LION-v5-E2B verifica, acelerando la generacion sin cambiar la distribucion de salida del modelo grande.
- Propuesta paralela de tokens: el backbone DFlash genera un bloque completo en un unico forward pass, con un maximo configurado de 15 tokens especulativos.
- Refinado causal intra-bloque: la cabeza XPress restaura las dependencias entre tokens del bloque antes de la verificacion.
- Cobertura multilingue del sudeste asiatico: birmano, chino, ingles, indonesio, filipino, malayo, tamil, tailandes y vietnamita.
- Integracion con servidores OpenAI-compatibles a traves de vLLM.
- No genera texto de forma autonoma ni toma decisiones de contenido: la calidad, el sesgo y la seguridad de la salida dependen enteramente del modelo objetivo.
- No se documentan capacidades de tool calling, agentes, vision ni audio propias; dependen del modelo objetivo.

## Casos de uso

- Aceleracion de inferencia en produccion para Gemma-SEA-LION-v5-E2B: se sirve junto al modelo objetivo en vLLM con `--speculative-config` y se obtiene un incremento de throughput de entre 2,2x y 3,9x segun el dataset, sin reentrenar el modelo grande.
- Despliegue de asistentes multilingues en el sudeste asiatico: el drafter mantiene longitudes de aceptacion altas en birmano (4,071), filipino (3,662), malayo (3,787) e indonesio (3,395), lo que lo hace adecuado para servicios de atencion al usuario en esas lenguas donde otros drafters genericos degradan el rendimiento.
- Razonamiento matematico de alto volumen: en math500 alcanza 1150,2 tokens/s con aceptacion de 5,768, util para pipelines de generacion masiva de soluciones y verificacion de problemas.
- Generacion de codigo asistida: en humaneval logra 974,8 tokens/s (aceptacion 4,912) y en mbpp 832,8 tokens/s (aceptacion 4,192), adecuado para autocompletado e integracion en entornos de desarrollo.
- Servicio de chat conversacional: en mt-bench el throughput sube de 295,7 a 644,9 tokens/s, con lo que se reduce la latencia percibida en dialogos multi-turno.
- Reduccion de coste por token en infraestructura existente: al aumentar el throughput a concurrencia 1 sin cambiar el modelo objetivo, se puede atender el mismo trafico con menos GPUs o aumentar la capacidad del mismo hardware.
- Evaluacion comparativa de estrategias de decodificacion especulativa: sirve como referencia para medir MTP frente a drafters dedicados en cargas multilingues.

## Benchmarks y rendimiento

Resultados publicados por el autor con 128 prompts por lengua del sudeste asiatico de SEA-Instruct-2602 y prompts de los datasets de gsm8k, math500, humaneval, mbpp y mt-bench. Configuracion: maximo 4096 tokens generados, temperatura 1.0, top_k 64, top_p 0.95, thinking activado, concurrencia 1. Se muestra throughput (tokens/s) / longitud de aceptacion. Para MTP se usaron 4 tokens especulativos; 7 para rasyosef/gemma-4-E2B-it-dflash2 y 15 para este SpecDecoder.

| Dataset | Baseline | w/ MTP | w/ Drafter (rasyosef) | w/ SpecDecoder (este modelo) |
|---|---|---|---|---|
| gsm8k | 278,7 | 755,3 / 3,608 | 993,9 / 4,374 | 1076,0 / 5,453 |
| math500 | 289,8 | 789,7 / 3,762 | 1008,5 / 4,349 | 1150,2 / 5,768 |
| humaneval | 295,3 | 739,5 / 3,525 | 864,8 / 3,733 | 974,8 / 4,912 |
| mbpp | 296,5 | 682,0 / 3,243 | 821,5 / 3,538 | 832,8 / 4,192 |
| mt-bench | 295,7 | 617,1 / 2,795 | 643,6 / 2,780 | 644,9 / 3,276 |
| Birmano | 294,1 | 606,4 / 2,836 | 479,3 / 2,076 | 807,2 / 4,071 |
| Filipino | 295,9 | 560,4 / 2,508 | 452,2 / 1,967 | 725,3 / 3,662 |
| Indonesio | 294,7 | 591,3 / 2,645 | 493,5 / 2,133 | 664,6 / 3,395 |
| Malayo | 296,1 | 634,3 / 2,839 | 553,6 / 2,392 | 749,3 / 3,787 |
| Tamil | 295,5 | 539,5 / 2,416 | 445,1 / 1,927 | 646,8 / 3,267 |
| Tailandes | 294,6 | 597,7 / 2,713 | 422,3 / 1,844 | 657,0 / 3,318 |
| Vietnamita | 295,9 | 568,5 / 2,543 | 430,7 / 1,863 | 639,1 / 3,224 |

El autor publica ademas una tabla de escalado por concurrencia para el modelo objetivo sin decodificacion especulativa (gsm8k: 278,7 a concurrencia 1; 1999,7 a 8; 3619,6 a 16; los valores para 32 y 64 estan truncados en la informacion disponible). No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval como evaluacion de correccion) en la informacion disponible, ya que al ser un drafter su calidad se mide por aceptacion y throughput, no por exactitud.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo ocupa 0,7 GB en safetensors, por lo que el peso del drafter en precision nativa es inferior a 1 GB y el requisito dominante es el del modelo objetivo Gemma-SEA-LION-v5-E2B.
- GPU recomendadas: no especificadas por el autor. El despliegue de referencia usa `--tensor-parallel-size 1`, lo que sugiere que el modelo objetivo y el drafter caben en una sola GPU; para produccion se recomienda hardware con soporte de FlashAttention (A100, H100, L40S o equivalentes).
- Cabe en GPU de consumo: no confirmado por el autor; el drafter por si solo es ligero, pero el modelo objetivo condiciona el requisito total.
- Opciones de despliegue: exclusivamente vLLM, y en concreto el fork https://github.com/nagarajankarthik/vllm/tree/qwen4_exp_dflash_merge (commit de referencia 0e5943d85d), con `--load-format instanttensor`, `--attention-backend flash_attn` y `--enable-chunked-prefill`. El servidor resultante es compatible con la API de OpenAI. No se documenta soporte en llama.cpp, Ollama ni TGI.
- Latencia y throughput: a concurrencia 1, entre 639,1 y 1150,2 tokens/s segun dataset, con longitudes de aceptacion de 3,224 a 5,768 tokens por paso. El autor advierte que la ganancia depende del prompt, el idioma y la concurrencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Tokens especulativos | Licencia | Throughput en math500 (tokens/s) / aceptacion |
|---|---|---|---|---|---|
| aisingapore/Gemma-SEA-LION-v5-E2B-SpecDecoder | Drafter DFlash + XPress | 324.091.136 | 15 | MIT | 1150,2 / 5,768 |
| rasyosef/gemma-4-E2B-it-dflash2 | Drafter DFlash | no disponible | 7 | no disponible | 1008,5 / 4,349 |
| google/gemma-4-E2B-it-assistant | MTP (multi-token prediction) | no disponible | 4 | no disponible | 789,7 / 3,762 |
| aisingapore/Gemma-SEA-LION-v5-E2B (sin drafter) | Modelo objetivo | no disponible | no aplica | no disponible | 289,8 / no aplica |

La ventaja de este SpecDecoder frente al drafter generico rasyosef es especialmente marcada en lenguas del sudeste asiatico: en birmano pasa de 479,3 a 807,2 tokens/s, y en tailandes de 422,3 a 657,0, donde el drafter generico queda por debajo incluso del baseline. Frente a MTP, la mejora es consistente en todos los datasets evaluados.

## Limitaciones y advertencias

- No es un modelo autonomo: solo propone tokens y no puede usarse sin el modelo objetivo Gemma-SEA-LION-v5-E2B; la calidad, el sesgo y la seguridad de la salida son los del modelo objetivo.
- La aceleracion depende del prompt, el idioma y la concurrencia; en mt-bench la ganancia es modesta (644,9 frente a 617,1 de MTP) y en algunos escenarios de baja aceptacion el beneficio puede reducirse.
- Requiere un fork especifico de vLLM (rama qwen4_exp_dflash_merge) y un commit concreto; no hay soporte documentado en otros motores de inferencia, lo que limita la portabilidad y complica el mantenimiento en produccion.
- No se documentan sesgos propios, riesgos de alucinacion ni limitaciones de contexto especificas; deben consultarse en la model card del modelo objetivo.
- Licencia MIT, permisiva para uso comercial, pero el uso del drafter queda sujeto a las condiciones del modelo objetivo con el que se combina.
- El modelo se publico en noviembre de 2026 y cuenta con solo 4 descargas y 0 likes en Hugging Face, por lo que la validacion comunitaria es practicamente inexistente.
- No se dispone de informacion sobre cuantizaciones soportadas, longitud de contexto ni numero de tokens de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aisingapore/Gemma-SEA-LION-v5-E2B-SpecDecoder
- Modelo objetivo: https://huggingface.co/aisingapore/Gemma-SEA-LION-v5-E2B
- Coleccion SEA-LION v5: https://huggingface.co/collections/aisingapore/sea-lion-v5
- Sitio de SEA-LION: https://sea-lion.ai
- Paper de referencia (Wang et al.): https://arxiv.org/abs/2608.02438
- Fork de vLLM requerido: https://github.com/nagarajankarthik/vllm/tree/qwen4_exp_dflash_merge
- Dataset SEA-Instruct-2602: https://huggingface.co/datasets/aisingapore/SEA-Instruct-2602
- Dataset Nemotron-SFT-Math-v4: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Math-v4
- Dataset Nemotron-SFT-Competitive-Programming-v2: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Competitive-Programming-v2
- Backbone de inicializacion: https://huggingface.co/rasyosef/gemma-4-E2B-it-dflash2
- Licencia MIT: https://mit-license.org/
