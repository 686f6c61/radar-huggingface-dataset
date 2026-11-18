# AtomicChat/Ripple-65B-Preview-GGUF

## Resumen

Ripple-65B Preview es un modelo de lenguaje denso de 65.000 millones de parámetros (64.782.689.360 exactos), entrenado desde cero por Ricursive Intelligence sobre 12 billones de tokens y post-entrenado específicamente para codificación agéntica. Se distribuye bajo licencia Apache-2.0, lo que lo convierte en una de las pocas alternativas de gran tamaño con permisividad comercial plena en su categoría. El modelo base es `ricursiveAI/Ripple-65B-Preview`; el repositorio aquí descrito es la cuantización GGUF realizada por AtomicChat.

Esta ficha cubre la versión cuantizada `AtomicChat/Ripple-65B-Preview-GGUF`, publicada en noviembre de 2026 y con más de 114.000 descargas acumuladas. AtomicChat no solo cuantiza: escribió el soporte de llama.cpp para la arquitectura Ripple, que fue fusionado en el upstream en la build b12167 (PR #31692), de modo que los ficheros cargan en llama.cpp estándar sin parches.

La relevancia práctica del repositorio está en su matriz de cuantizaciones "AD" (Atomic Dynamic), con layouts por tensor calibrados mediante importance matrix sobre 4,7 millones de tokens, que permiten llevar un modelo de 65B a un rango de 18,5-129,6 GB en disco según el compromiso calidad/memoria elegido, incluyendo opciones que caben en GPUs de consumo de 24 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Ripple; soporte nativo en llama.cpp desde b12167) |
| Parametros totales | 64.782.689.360 (65B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de despliegue usa `-c 32768`) |
| Tipos de cuantizacion | BF16, Q8_0, AD-Q6_K, AD-Q5_K_M, AD-Q4_K_M, AD-IQ4_XS, AD-IQ3_S, AD-IQ3_XXS, AD-IQ2_S, AD-IQ2_XS, AD-IQ2_XXS, AD-IQ1_M, Q4_K_M (preset plano sin imatrix) |
| Idiomas soportados | No disponible (el corpus de calibracion usado para medir KLD es multilingue de 30 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (ficheros partidos en 2 o 3 partes segun tamano); pesos originales BF16 en el repo del modelo base |

## Arquitectura y entrenamiento

Ripple-65B Preview es un transformer denso de 65B parámetros entrenado desde cero por Ricursive Intelligence sobre 12 billones de tokens, seguido de un post-entrenamiento orientado a codificación agéntica. La model card no detalla la composición del dataset, la mezcla de idiomas ni si se emplearon técnicas de alineación como RLHF o DPO; esa información no está disponible. La arquitectura concreta (tipo de atención, normalización, activaciones) tampoco se describe más allá de que requiere soporte específico en llama.cpp, lo que indica que no es un transformer Llama/Qwen estándar y que introduce particularidades propias en la disposición de tensores.

La innovación técnica documentada en este repositorio es el trabajo de cuantización de AtomicChat: layouts "AD" por tensor, calibrados con una importance matrix calculada sobre los pesos BF16 originales usando un corpus de calibración público de 4,7 millones de tokens renderizado con la plantilla de chat propia de Ripple. Las métricas de fidelidad se midieron con `llama-perplexity` sobre un corpus neutral de 30 idiomas (87 fragmentos de 4096 tokens), en 8x A100 40 GB con llama.cpp `9e2a04a`. Destaca que `AD-IQ4_XS` (38,7 GB) alcanza un KLD medio de 0,0149 frente a 0,0380 del Q4_K_M plano de llama.cpp, es decir, 2,5 veces menor divergencia al mismo tamano en disco, y `AD-IQ3_S` iguala la calidad del Q4_K_M plano con 6,4 GB menos. La plantilla de chat con soporte de herramientas y razonamiento `<think>` va embebida en los ficheros.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat propia embebida en los GGUF.
- Codificación agéntica: el post-entrenamiento del modelo está orientado a tareas de código con agentes.
- Razonamiento explícito mediante modo `<think>` integrado en la plantilla de chat.
- Soporte de herramientas (tool calling) a través de la plantilla Jinja embebida; requiere `--jinja` en llama.cpp.
- Capacidad multilingüe: inferida del corpus de evaluación de 30 idiomas usado por AtomicChat, aunque el modelo no declara lista oficial de idiomas.
- Integración en aplicaciones de escritorio locales: los tags incluyen `atomic-chat` y `endpoints_compatible`, orientados a su uso desde la app Atomic Chat con API compatible.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Asistente de programación en local: con `AD-Q4_K_M` (40,4 GB) el modelo corre en 48 GB de memoria (2x 24 GB o Mac de 48 GB) y puede resolver tareas de edición de código multi-archivo con tool calling, sin enviar código a la nube.
- Agente autónomo de CI/CD: desplegado con `llama-server --jinja`, el modelo expone una API compatible con endpoints y puede encadenar llamadas a herramientas (ejecutar tests, leer ficheros, aplicar parches) en pipelines internos, con licencia Apache-2.0 que permite uso comercial sin restricciones.
- Estación de trabajo de investigación en una sola GPU de 24 GB: `AD-IQ2_XXS` (20,0 GB) cabe en una RTX 3090 o RTX 4090 y mantiene un 80,8% de coincidencia de token superior con el BF16 original, suficiente para prototipado y evaluación de prompts.
- Servicio de atención al cliente con contexto largo: `AD-Q6_K` (57,7 GB) está pensado para máquinas de 64 GB o más con contexto largo; el KV cache adicional se gestiona con el flag `-c` de llama.cpp, permitiendo conversaciones multi-turno extensas.
- Despliegue en Mac de 64 GB: `AD-Q5_K_M` (47,9 GB) ofrece un KLD medio de 0,0067 y un 97,3% de coincidencia de token, un punto de equilibrio razonable para uso diario en Apple Silicon con Metal.
- Generación de código en producción con máxima fidelidad: `Q8_0` (68,8 GB) en un Mac de 128 GB o NVIDIA DGX Spark conserva el 99,0% de las decisiones de token del modelo original, adecuado cuando la exactitud importa más que el throughput.
- Evaluación comparativa de cuantizaciones: el repo incluye el Q4_K_M plano como baseline, lo que permite medir en el propio hardware la degradación de las variantes AD frente al preset estándar de llama.cpp.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros). Lo que sí se documenta son métricas de fidelidad de cuantización y una medida de velocidad:

| Fichero | GB en disco | bpw | KLD medio | KLD p99 | Mismo token superior |
|---|---:|---:|---:|---:|---:|
| BF16 (3 partes) | 129,6 | 16,00 | 0 | 0 | 100% |
| Q8_0 (2 partes) | 68,8 | 8,50 | 0,0010 | 0,011 | 99,0% |
| AD-Q6_K (2 partes) | 57,7 | 7,12 | 0,0016 | 0,016 | 98,7% |
| AD-Q5_K_M | 47,9 | 5,92 | 0,0067 | 0,090 | 97,3% |
| AD-Q4_K_M | 40,4 | 4,99 | 0,0136 | 0,172 | 95,9% |
| AD-IQ4_XS | 38,7 | 4,78 | 0,0149 | 0,177 | 95,6% |
| AD-IQ3_S | 32,4 | 4,00 | 0,0327 | 0,374 | 93,4% |
| AD-IQ3_XXS | 28,0 | 3,45 | 0,0584 | 0,628 | 91,2% |
| AD-IQ2_S | 25,3 | 3,13 | 0,0959 | 1,012 | 88,5% |
| AD-IQ2_XS | 22,1 | 2,73 | 0,1778 | 1,777 | 84,2% |
| AD-IQ2_XXS | 20,0 | 2,47 | 0,2605 | 2,465 | 80,8% |
| AD-IQ1_M | 18,5 | 2,28 | 0,3743 | 3,219 | 76,8% |
| Q4_K_M plano (sin imatrix) | 38,8 | 4,79 | 0,0380 | 0,447 | 93,0% |

Medición de velocidad publicada (una sola ejecución, `llama-cli`, Q4_K_M plano, 1x GH200 96 GB): 309 tokens/s de procesamiento de prompt y 40,6 tokens/s de generación.

## Requisitos de hardware

- VRAM/memoria unificada estimada: desde 24 GB (`AD-IQ2_XXS`, 20,0 GB en disco) hasta 129,6 GB para BF16; el KV cache para contexto largo requiere memoria adicional sobre la cifra del fichero.
- GPUs recomendadas por la model card: RTX 5090 (32 GB) para `AD-IQ3_XXS`; RTX 3090 o RTX 4090 (24 GB) para `AD-IQ2_XXS`; 2x 24 GB para `AD-Q4_K_M`; A100 40 GB y GH200 96 GB usadas en las mediciones; DGX Spark para `Q8_0`.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con cuantizaciones IQ2 e IQ3, y en RTX 5090 con `AD-IQ3_XXS`.
- Macs: 48 GB con `AD-Q4_K_M`, 64 GB con `AD-Q5_K_M` o `AD-Q6_K`, 128 GB con `Q8_0`; Metal activo por defecto.
- Despliegue: llama.cpp b12167 o superior (builds oficiales o compilación desde fuente con `-DGGML_CUDA=ON`). LM Studio y Ollama cargarán estos ficheros cuando incorporen b12167 o posterior. Ejemplo: `llama-server -m Ripple-65B-Preview-AD-Q4_K_M.gguf --jinja -c 32768 -ngl 99`.
- Throughput de referencia: 40,6 tokens/s de generación y 309 tokens/s de prompt en 1x GH200 con Q4_K_M plano.
- No se documentan requisitos para vLLM ni TGI; el formato GGUF y el soporte recién fusionado en llama.cpp limitan de momento el despliegue a ese runtime.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de tareas del modelo base, por lo que la comparación se limita a características estructurales verificables. Los modelos alternativos citados son referencias de categoria y sus datos no provienen de la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ripple-65B Preview (este) | 65B denso | No disponible | Apache-2.0 | GGUF, BF16 | Post-entrenado para codigo agentico; cuantizaciones AD con imatrix |
| Alternativas de ~65-70B denso | ~65-70B | No disponible | Variable | GGUF, safetensors | No disponible comparacion de rendimiento |
| Alternativas MoE de gran tamano | No disponible | No disponible | Variable | GGUF, safetensors | No disponible comparacion de rendimiento |

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks de tareas en la informacion disponible; no es posible evaluar su calidad objetiva frente a alternativas sin medirla uno mismo.
- Es una versión "Preview": Ricursive no publica ajustes de sampling por defecto, lo que obliga a calibrar temperatura, top-p y top-k manualmente.
- Las cuantizaciones por debajo de IQ3 pierden fidelidad de forma acusada: `AD-IQ2_XXS` solo coincide con el token del BF16 en el 80,8% de los casos y `AD-IQ1_M` en el 76,8%, con KLD p99 de 2,465 y 3,219 respectivamente; no son adecuadas para producción sensible a la precisión.
- El soporte en LM Studio y Ollama depende de que estas aplicaciones actualicen su llama.cpp a b12167 o superior; con versiones anteriores los ficheros no cargan.
- La lista oficial de idiomas no está disponible; el multilingüismo solo se infiere del corpus de calibración de 30 idiomas, no de una declaración del autor del modelo.
- No se documentan sesgos conocidos, riesgos específicos de alucinación ni limitaciones de contexto más allá de las derivadas del tamaño del KV cache.
- La licencia Apache-2.0 permite uso comercial sin restricciones adicionales, pero conviene verificar la licencia del modelo base `ricursiveAI/Ripple-65B-Preview` de forma independiente, ya que esta ficha solo confirma la del repositorio GGUF.
- El repositorio ocupa 568,3 GB por incluir todas las variantes; descargar solo el fichero necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/AtomicChat/Ripple-65B-Preview-GGUF
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Release de llama.cpp b12167: https://github.com/ggml-org/llama.cpp/releases/tag/b12167
- Pull request de soporte Ripple en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31692
- Releases de llama.cpp: https://github.com/ggml-org/llama.cpp/releases
- Corpus de calibración: https://huggingface.co/datasets/AtomicChat/calib-corpora/tree/main/builds/ripple-65b
- App Atomic Chat: https://atomic.chat/
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de Atomic Chat: https://discord.gg/8wGSsvmg4V
- X de Atomic Chat: https://x.com/atomic_chat_hq
