# aisingapore/Qwen-SEA-LION-v5-27B-SpecDecoder

## Resumen

Qwen-SEA-LION-v5-27B-SpecDecoder es un modelo borrador (draft model) disenado especificamente para decodificacion especulativa junto al modelo objetivo aisingapore/Qwen-SEA-LION-v5-27B. Lo desarrolla el AI Products Pillar de AI Singapore, con financiacion del National Research Foundation Singapore, dentro de la familia SEA-LION (Southeast Asian Languages In One Network), orientada a lenguas del sudeste asiatico. No es un modelo generativo autonomo: propone arboles de tokens candidatos que el modelo objetivo verifica en una sola pasada, acelerando la inferencia sin alterar la distribucion de salida final.

Tecnicamente es un cabezal de borrador EAGLE-4 de una sola capa autorregresiva que lee los estados ocultos de tres capas del modelo objetivo y genera un arbol de candidatos. Su relevancia practica es el incremento de throughput: segun la evaluacion del autor, multiplica por 4 el rendimiento del baseline en lenguas del sudeste asiatico (por ejemplo, de 66,3 a 235,2 tokens por segundo en birmano) y por 3-4 en tareas de codigo y matematicas.

El modelo tiene 3.089.075.200 parametros y un repositorio de 6,2 GB en formato safetensors. Su licencia MIT y su soporte para nueve idiomas (ingles, chino, birmano, indonesio, filipino, malayo, tamil, tailandes y vietnamita) lo convierten en una pieza de infraestructura util para desplegar el modelo objetivo en produccion con menor latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EAGLE-4: cabezal de borrador autorregresivo de una sola capa con arbol de candidatos, sobre estados ocultos de tres capas del modelo objetivo |
| Parametros totales | 3.089.075.200 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh, my, id, fil, ms, ta, th, vi |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 6,2 GB) |

## Arquitectura y entrenamiento

El modelo es un borrador EAGLE-4: un cabezal autorregresivo de una sola capa que consume los estados ocultos de tres capas del modelo objetivo aisingapore/Qwen-SEA-LION-v5-27B y construye un arbol de tokens candidatos. El modelo objetivo verifica ese arbol completo en una unica pasada, de modo que el borrador solo propone y nunca decide la salida final. En despliegue se configura con `node_top_k = 4`, `tree_depth = 14` y `max_verify_width = 16`.

El entrenamiento consta de dos etapas. En la primera se entrena el backbone EAGLE-4, inicializado desde EAGLE-Corp/Qwen3.8-27B-EAGLE4, junto con un cabezal LM inicializado a partir del de aisingapore/Qwen-SEA-LION-v5-27B. En la segunda se entrena un cabezal LM eficiente inicializado mediante descomposicion en valores singulares (SVD) del cabezal de la etapa 1. Los datos de entrenamiento provienen de aisingapore/SEA-Instruct-2602, nvidia/Nemotron-SFT-Math-v4 y nvidia/Nemotron-SFT-Competitive-Programming-v2. No se especifican en la informacion disponible el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Aceleracion de inferencia mediante decodificacion especulativa: propone arboles de tokens que el modelo objetivo verifica en una pasada.
- Especializado en nueve idiomas: ingles, chino, birmano, indonesio, filipino, malayo, tamil, tailandes y vietnamita.
- Entrenado con datos de matematicas y programacion competitiva, lo que se refleja en las ganancias de throughput en gsm8k, math500, humaneval y mbpp.
- Integracion con servidores compatibles con la API de OpenAI a traves del fork EAGLE-4 de vLLM.
- No genera texto de forma autonoma: su salida siempre depende de la verificacion del modelo objetivo.
- No dispone de tool calling, capacidades de agente ni modalidades adicionales propias; hereda las del modelo objetivo.

## Casos de uso

- Despliegue de produccion del modelo Qwen-SEA-LION-v5-27B con menor latencia: sirviendo el modelo objetivo junto a este borrador en vLLM con configuracion EAGLE-4, se obtiene un throughput de 197-261 tokens por segundo en lugar de los 66,3 del baseline en las tareas evaluadas.
- Atencion al cliente en lenguas del sudeste asiactico: el borrador acelera respuestas multi-turno en birmano, filipino, indonesio, malayo, tamil, tailandes y vietnamita, idiomas donde el baseline es especialmente lento (66,3 tokens por segundo) y el borrador alcanza 235,2 en birmano.
- Generacion de codigo asistida: con 215,9 tokens por segundo en humaneval y 224,5 en mbpp frente a 66,3 del baseline, reduce la latencia percibida en asistentes de programacion y autocompletado.
- Razonamiento matematico interactivo: en gsm8k y math500 el borrador eleva el throughput a 261,5 y 252,7 tokens por segundo respectivamente, adecuado para tutores o herramientas de resolucion paso a paso.
- Servicio de chat general (mt-bench): con 197,1 tokens por segundo frente a 66,3 del baseline, mejora la experiencia en conversaciones abiertas y reduce el coste por token servido.
- Infraestructura de inferencia con requisitos de SLA estrictos: al triplicar o cuadruplicar el throughput sin cambiar la distribucion de salida, permite atender mas concurrencia con el mismo hardware o reducir el numero de GPU necesarias.
- Evaluacion comparativa de tecnicas de decodificacion especulativa: sirve como referencia para medir EAGLE-4 frente a MTP o borradores de difusion en cargas multilingues.

## Benchmarks y rendimiento

Resultados del autor sobre 128 prompts por idioma del sudeste asiactico de aisingapore/SEA-Instruct-2602 y sobre gsm8k, math500, humaneval, mbpp y mt-bench, con temperatura 1.0, top_k 20, top_p 0.95, pensamiento activado, 4096 tokens maximos y concurrencia 1. Se muestra throughput en tokens por segundo / longitud de aceptacion.

| Dataset | Baseline | con MTP | borrador de difusion (z-lab) | EAGLE-4 original | con este SpecDecoder |
|---|---|---|---|---|---|
| gsm8k | 66,3 | 161,9/3,312 | 220,0/4,544 | 257,5/5,375 | 261,5/5,368 |
| math500 | 66,4 | 154,1/3,085 | 203,0/4,144 | 243,6/4,914 | 252,7/5,079 |
| humaneval | 66,3 | 138,0/2,757 | 170,7/3,483 | 205,5/4,060 | 215,9/4,252 |
| mbpp | 66,4 | 142,4/2,850 | 181,6/3,706 | 217,9/4,301 | 224,5/4,488 |
| mt-bench | 66,3 | 136,0/2,731 | 158,3/3,243 | 203,0/3,969 | 197,1/3,885 |
| Birmano | 66,3 | 149,5/2,990 | 158,8/3,243 | 147,5/2,859 | 235,2/4,704 |
| Filipino | 66,3 | 143,2/2,863 | 150,5/3,070 | 172,2/... | no disponible |

La tabla de la model card esta truncada en la informacion proporcionada; los resultados de las lenguas restantes (chino, indonesio, malayo, tamil, tailandes, vietnamita) no estan disponibles.

## Requisitos de hardware

- VRAM para el borrador: no disponible de forma explicita; el repo ocupa 6,2 GB en safetensors, por lo que se requiere espacio adicional para los pesos del modelo objetivo (27B) y las estructuras de verificacion del arbol.
- GPU recomendadas: no disponible en la informacion proporcionada. El despliegue de referencia usa `--tensor-parallel-size 1`, lo que sugiere que el borrador cabe en una sola GPU, pero el modelo objetivo de 27B condiciona el requisito total.
- Cabe en GPU de consumo: no disponible; depende del modelo objetivo y de la cuantizacion elegida para este.
- Opciones de despliegue: fork EAGLE-4 de vLLM (github.com/eagle-hq/vllm) con `--speculative-config '{"method": "eagle_harness", ...}'`, `--attention-backend CUSTOM`, `--linear-backend flashinfer_cutedsl`, `--load-format instanttensor` y `--enable-chunked-prefill`. El servidor resultante es compatible con la API de OpenAI.
- Latencia y throughput: medidos en la tabla de benchmarks a concurrencia 1; el autor advierte que la aceleracion depende del prompt, el idioma y la concurrencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Throughput (gsm8k) | Licencia |
|---|---|---|---|---|---|
| aisingapore/Qwen-SEA-LION-v5-27B-SpecDecoder | Borrador EAGLE-4 | 3,09B | no disponible | 261,5 tok/s | MIT |
| EAGLE-Corp/Qwen3.8-27B-EAGLE4 | Borrador EAGLE-4 original | no disponible | no disponible | 257,5 tok/s | no disponible |
| z-lab/Qwen3.8-27B-DFlash2 | Borrador de difusion | no disponible | no disponible | 220,0 tok/s | no disponible |
| MTP integrado en el modelo objetivo | Multi-token prediction | no disponible | no disponible | 161,9 tok/s | MIT (modelo objetivo) |

El SpecDecoder supera al EAGLE-4 original en gsm8k, math500, humaneval y mbpp, y queda ligeramente por debajo en mt-bench (197,1 frente a 203,0). Frente al borrador de difusion y a MTP la ventaja es consistente en todas las tareas evaluadas.

## Limitaciones y advertencias

- No es un modelo autonomo: solo propone tokens y siempre debe desplegarse junto a aisingapore/Qwen-SEA-LION-v5-27B.
- La calidad, los sesgos y la seguridad de las salidas son los del modelo objetivo; este borrador no los modifica.
- La aceleracion varia segun el prompt, el idioma y la concurrencia; los datos publicados son a concurrencia 1 y con ajustes concretos de arbol (`node_top_k = 4`, `tree_depth = 14`, `max_verify_width = 16`).
- Requiere el fork EAGLE-4 de vLLM y backends especificos (`attention-backend CUSTOM`, `linear-backend flashinfer_cutedsl`), lo que limita la portabilidad a otros motores de inferencia.
- Los resultados de benchmarks estan truncados en la informacion disponible para varias lenguas del sudeste asiactico.
- Riesgo de alucinacion: no evaluado de forma independiente para este borrador; heredado del modelo objetivo.
- Licencia MIT permite uso comercial, pero conviene revisar las condiciones del modelo objetivo y de los datasets de entrenamiento (SEA-Instruct-2602, Nemotron-SFT-Math-v4, Nemotron-SFT-Competitive-Programming-v2) antes de un despliegue en produccion.
- El modelo se publico en noviembre de 2026 y cuenta con solo 4 descargas y 0 likes, por lo que la validacion comunitaria es practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-27B-SpecDecoder
- Modelo objetivo: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-27B
- Coleccion SEA-LION v5: https://huggingface.co/collections/aisingapore/sea-lion-v5
- Sitio de SEA-LION: https://sea-lion.ai
- Fork EAGLE-4 de vLLM: https://github.com/eagle-hq/vllm
- Quickstart EAGLE-4 para vLLM: https://github.com/eagle-hq/EAGLE-4/blob/main/docs/quickstart-vllm.md
- Fork de vLLM usado para baseline y MTP: https://github.com/nagarajankarthik/vllm/tree/qwen4_exp_dflash_merge
- Backbone EAGLE-4 original: https://huggingface.co/EAGLE-Corp/Qwen3.8-27B-EAGLE4
- Borrador de difusion comparado: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Dataset SEA-Instruct-2602: https://huggingface.co/datasets/aisingapore/SEA-Instruct-2602
- Dataset Nemotron-SFT-Math-v4: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Math-v4
- Dataset Nemotron-SFT-Competitive-Programming-v2: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Competitive-Programming-v2
- Licencia MIT: https://mit-license.org/
