# aisingapore/Qwen-SEA-LION-v5-397B-A17B-Plus-SpecDecoder

## Resumen

Qwen-SEA-LION-v5-397B-A17B-Plus-SpecDecoder es un modelo borrador (draft model) disenado especificamente para decodificacion especulativa junto al modelo objetivo aisingapore/Qwen-SEA-LION-v5-397B-A17B-Plus. Lo desarrolla el AI Products Pillar de AI Singapore, con financiacion de la National Research Foundation de Singapur, dentro de la familia SEA-LION (Southeast Asian Languages In One Network) orientada a las lenguas del sudeste asiatico. No es un modelo autonomo: propone bloques de tokens que el modelo objetivo verifica, por lo que su unica funcion es acelerar la inferencia del modelo grande.

Tecnicamente combina un backbone de difusion por bloques DFlash, que propone un bloque completo de tokens en un unico forward pass paralelo, con un refinador causal XPress que restaura las dependencias entre los tokens del bloque antes de la verificacion. El checkpoint contiene 1.472.325.120 parametros en safetensors (2,9 GB de repositorio), muy lejos de los 397B-A17B del modelo objetivo al que acompana, lo que refleja su papel de componente ligero de aceleracion.

Su relevancia es practica: en las evaluaciones publicadas por el autor, el uso conjunto con el modelo objetivo eleva el throughput de 117,2 tokens/s en línea base hasta 340,3 tokens/s en gsm8k y mejora la longitud de aceptacion frente a alternativas como MTP o el drafter generico z-lab/Qwen3.5-397B-A17B-DFlash, especialmente en lenguas del sudeste asiatico donde el drafter generico se degrada notablemente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Draft model de decodificacion especulativa: difusion por bloques DFlash con refinador causal XPress |
| Parametros totales | 1.472.325.120 |
| Parametros activos | no disponible (no es un modelo MoE en si; acompana a un objetivo 397B-A17B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh, my (birmano), id (indonesio), fil (filipino), ms (malayo), ta (tamil), th (tailandes), vi (vietnamita) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un drafter para decodificacion especulativa que combina dos componentes. El backbone DFlash es un modelo de difusion por bloques que propone un bloque entero de tokens en un solo forward pass paralelo, en lugar de generar token a token. Sobre esa propuesta actua una cabeza XPress (refinador causal) que restaura las dependencias entre los tokens del bloque antes de que el modelo objetivo los verifique. La arquitectura sigue la propuesta de Wang et al. (arXiv:2608.02438).

El backbone DFlash se inicializo (warm start) a partir de z-lab/Qwen3.5-397B-A17B-DFlash y se extendio con las convoluciones de DFlash2 de Inco-AI y con la cabeza XPress. Los datos de entrenamiento provienen de tres conjuntos: aisingapore/SEA-Instruct-2602, nvidia/Nemotron-SFT-Math-v4 y nvidia/Nemotron-SFT-Competitive-Programming-v2. No se detalla en la informacion disponible el volumen de tokens, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generacion de propuestas de tokens para decodificacion especulativa: propone bloques de tokens que el modelo objetivo verifica y acepta o rechaza.
- Propuesta en paralelo por bloque: el componente DFlash genera un bloque completo en un unico forward pass, lo que reduce el coste por token propuesto.
- Refinado causal intra-bloque: la cabeza XPress restaura las dependencias entre tokens del bloque antes de la verificacion.
- Cobertura multilingue del sudeste asiatico: birmano, indonesio, filipino, malayo, tamil, tailandes y vietnamita, ademas de ingles y chino.
- Aceleracion de cargas de razonamiento y codigo: los benchmarks del autor incluyen gsm8k, math500, humaneval, mbpp y mt-bench.
- Integracion con vLLM mediante speculative-config con metodo `dflash` y `num_speculative_tokens` configurable (15 en las evaluaciones publicadas).
- No soporta tool calling, agentes ni vision de forma autonoma: hereda las capacidades del modelo objetivo, que es quien decide la salida final.

## Casos de uso

- Servicio de chat multilingue en el sudeste asiatico: desplegar el modelo objetivo con este drafter permite atender consultas en birmano, tailandes, vietnamita o tamil con mayor throughput que la linea base, algo critico cuando el trafico es alto y el modelo objetivo es de 397B parametros.
- Razonamiento matematico en produccion: en gsm8k el conjunto objetivo+drafter alcanza 340,3 tokens/s frente a 117,2 de la linea base; util en pipelines que resuelven problemas matematicos de forma masiva con thinking habilitado.
- Generacion de codigo asistida: con 247,0 tokens/s en humaneval y 292,9 en mbpp, el drafter acelera asistentes de codigo que sirven al modelo grande a muchos usuarios concurrentes.
- Reduccion de coste de inferencia en GPUs: al aumentar la longitud de aceptacion (6,334 en gsm8k frente a 3,813 de MTP), se necesitan menos pasos de verificacion por token generado, lo que abarata cada peticion en un despliegue con tensor-parallel-size 8.
- Despliegue de modelos grandes en infraestructura limitada: permite mantener la calidad del modelo objetivo de 397B-A17B con una latencia menor, sin recurrir a un modelo mas pequeno de menor calidad.
- Evaluacion comparativa de tecnicas de aceleracion: sirve como referencia para medir MTP frente a drafters de difusion en cargas multilingues, dado que el autor publica tablas de throughput y longitud de aceptacion por idioma.
- Sustitucion del drafter generico en despliegues existentes: en birmano, tamil o filipino, donde z-lab/Qwen3.5-397B-A17B-DFlash cae a 139,1, 138,6 y 154,6 tokens/s, este drafter mantiene 259,1, 245,0 y 235,1 tokens/s respectivamente.

## Benchmarks y rendimiento

Resultados del autor con 128 prompts por idioma del sudeste asiatico de SEA-Instruct-2602 y prompts de gsm8k, math500, humaneval, mbpp y mt-bench. Se muestra throughput en tokens/s y longitud de aceptacion como throughput/aceptacion, a concurrencia 1, con 4096 tokens maximos, temperatura 1.0, top_k 20, top_p 0.95 y thinking activado. MTP usa 4 tokens especulativos; ambos drafters usan 15.

| Dataset | Baseline | w/ MTP | w/ drafter z-lab | w/ este SpecDecoder |
|---|---|---|---|---|
| gsm8k | 117,2 | 279,1/3,813 | 287,3/5,100 | 340,3/6,334 |
| math500 | 117,0 | 283,9/3,869 | 298,1/5,290 | 327,8/6,079 |
| humaneval | 116,8 | 256,0/3,521 | 228,2/3,985 | 247,0/4,557 |
| mbpp | 117,2 | 274,1/3,734 | 275,7/4,838 | 292,9/5,440 |
| mt-bench | 116,9 | 247,9/3,349 | 201,6/3,457 | 225,8/4,099 |
| Birmano | 116,5 | 253,4/3,465 | 139,1/2,332 | 259,1/4,742 |
| Filipino | 116,9 | 239,5/3,222 | 154,6/2,585 | 235,1/4,219 |
| Indonesio | 116,9 | 228,1/3,076 | 156,4/2,619 | 198,1/3,551 |
| Malayo | 116,8 | 241,4/3,269 | 170,8/2,891 | 222,9/4,033 |
| Tamil | 116,9 | 245,5/3,292 | 138,6/2,297 | 245,0/4,377 |
| Tailandes | 116,8 | 229,4/3,109 | 145,7/2,442 | 196,8/3,530 |
| Vietnamita | 117,0 | 226,2/3,031 | 148,6/2,485 | 193,1/3,444 |

## Requisitos de hardware

- El drafter pesa 2,9 GB en safetensors, por lo que su huella de memoria es pequena frente a los cientos de GB del modelo objetivo 397B-A17B; el requisito dominante es el del modelo objetivo.
- El despliegue de referencia usa `--tensor-parallel-size 8` y `--enable-expert-parallel` sobre el modelo objetivo, lo que implica un nodo multi-GPU de gama alta (A100/H100/H200) para el conjunto completo.
- El drafter por si solo cabria en una GPU consumer, pero no tiene utilidad sin el modelo objetivo.
- Opciones de despliegue: vLLM con la rama `qwen4_exp_dflash_merge` del fork de nagarajankarthik, con `--speculative-config '{"method": "dflash", "model": "...", "num_speculative_tokens": 15}'`, `--attention-backend flash_attn`, `--enable-chunked-prefill` y `--load-format instanttensor`. El servidor es compatible con la API de OpenAI.
- Throughput medido: 340,3 tokens/s en gsm8k y 259,1 en birmano a concurrencia 1; la latencia y el throughput a concurrencia superior no estan disponibles en la informacion proporcionada (la tabla de concurrencia aparece truncada).
- No se documentan requisitos para llama.cpp, Ollama, TGI ni otras herramientas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento (gsm8k, tok/s / aceptacion) | Licencia |
|---|---|---|---|---|---|
| Este SpecDecoder | Drafter DFlash + XPress | 1,47B | no disponible | 340,3/6,334 | MIT |
| z-lab/Qwen3.5-397B-A17B-DFlash | Drafter de difusion generico | no disponible | no disponible | 287,3/5,100 | no disponible |
| MTP del modelo objetivo | Multi-token prediction integrado | no disponible | no disponible | 279,1/3,813 | MIT (modelo objetivo) |
| Baseline sin decodificacion especulativa | Modelo objetivo solo | 397B totales / 17B activos | no disponible | 117,2 | MIT |

La ventaja de este drafter es mas acusada en lenguas del sudeste asiatico, donde el drafter generico z-lab cae por debajo de la linea base en throughput (139,1 tok/s en birmano frente a 116,5 de la linea base).

## Limitaciones y advertencias

- No es un modelo autonomo: solo propone tokens y el modelo objetivo decide la salida; no debe usarse de forma independiente.
- La calidad, los sesgos y la seguridad de las respuestas son los del modelo objetivo aisingapore/Qwen-SEA-LION-v5-397B-A17B-Plus.
- La aceleracion depende del prompt, del idioma y de la concurrencia; en indonesio, tailandes y vietnamita el throughput es inferior al de MTP (198,1 frente a 228,1 en indonesio), aunque la longitud de aceptacion es mayor.
- Requiere una rama no principal de un fork de vLLM (`qwen4_exp_dflash_merge`), lo que anade riesgo de mantenimiento y de compatibilidad con versiones futuras de vLLM.
- No se documentan tipos de cuantizacion soportados ni longitud de contexto; conviene verificar la compatibilidad con el modelo objetivo antes de desplegar.
- Licencia MIT, permisiva para uso comercial, pero las condiciones de uso del modelo objetivo deben consultarse por separado.
- El repositorio tiene muy poca traccion (3 descargas, 0 likes) y fue creado en noviembre de 2026, por lo que la validacion por terceros es practicamente inexistente.
- Los benchmarks publicados son del propio autor y a concurrencia 1; no hay datos independientes de latencia ni de throughput a mayor concurrencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-397B-A17B-Plus-SpecDecoder
- Modelo objetivo: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-397B-A17B-Plus
- Coleccion SEA-LION v5: https://huggingface.co/collections/aisingapore/sea-lion-v5
- Sitio de SEA-LION: https://sea-lion.ai
- Fork de vLLM con soporte dflash: https://github.com/nagarajankarthik/vllm/tree/qwen4_exp_dflash_merge
- Backbone de partida: https://huggingface.co/z-lab/Qwen3.5-397B-A17B-DFlash
- Blog de DFlash2 (Inco-AI): https://inco.ai/blog/dflash2/
- Paper de referencia: https://arxiv.org/abs/2608.02438
- Dataset SEA-Instruct-2602: https://huggingface.co/datasets/aisingapore/SEA-Instruct-2602
- Dataset Nemotron-SFT-Math-v4: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Math-v4
- Dataset Nemotron-SFT-Competitive-Programming-v2: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Competitive-Programming-v2
- Licencia MIT: https://mit-license.org/
