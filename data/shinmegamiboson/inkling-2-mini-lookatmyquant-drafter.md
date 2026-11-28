# shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-drafter

## Resumen

Inkling-2-Mini-LookAtMyQuant-drafter es un modelo auxiliar de decodificacion especulativa (speculative decoding) derivado de thinkingmachines/Inkling-2-Mini. No es un modelo generativo autonomo, sino un "drafter" DSpark de 3 capas y 4 bits que propone bloques lineales adaptativos de tokens candidatos, que luego se verifican en una sola pasada batcheada contra el modelo objetivo. Lo publica el usuario shinmegamiboson dentro del ecosistema LookAtMyQuant, un runtime de inferencia para Apple Silicon (MLX) y NVIDIA CUDA.

El artefacto principal, mtp_4bit.safetensors, ocupa 178,9 MB, lo que supone una reduccion de 3,55x frente a los 635,8 MB del mtp.safetensors en BF16 incluido en el modelo base. El drafter lee cuatro taps ocultos del modelo objetivo (visitas logicas 5, 23, 41 y 48) y propone bloques que se validan de forma exacta, preservando la decodificacion greedy sin perdida y el muestreo especulativo insesgado con temperatura mayor que cero.

Su relevancia es practica: permite acelerar la inferencia de las seis builds cuantizadas publicadas de Inkling-2-Mini (desde 3,9 GB hasta 12,8 GB) en hardware de consumo, con incrementos medidos de throughput de decodificacion de hasta 2,3x en tareas de matematicas y codigo sobre un Apple M5 Max. La licencia Apache 2.0 y el formato safetensors facilitan su integracion en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSpark MTP (multi-token prediction) de 3 capas, drafter de decodificacion especulativa sobre Inkling-2-Mini |
| Parametros totales | no disponible (pesos de 178,9 MB en 4 bits) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo objetivo Inkling-2-Mini) |
| Tipos de cuantizacion | 4 bits con group_size = 64; normas, fuse_weight, mask_embed y hidden_out en precision nativa |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (mtp_4bit.safetensors, mtp_4bit_5p4gb_v2.safetensors, mtp_4bit_8p9gb_v2.safetensors) |
| Modelo base | thinkingmachines/Inkling-2-Mini (relacion: quantized) |
| Tamano del repositorio | 0,5 GB |
| Runtime soportado | LookAtMyQuant (MLX en Apple Silicon; CUDA en NVIDIA para builds trellis de 3,9, 4,7, 5,4 y 8,9 GB) |
| Formato descriptor | inkling2-dspark-4bit-v1 (manifest.json) |

## Arquitectura y entrenamiento

El modelo es un drafter de prediccion multi-token (MTP) basado en la arquitectura DSpark, con solo 3 capas. En lugar de generar tokens de forma autorregresiva uno a uno, lee cuatro taps de las activaciones ocultas del modelo objetivo (visitas logicas 5, 23, 41 y 48) y propone bloques lineales adaptativos de tokens candidatos. Estos bloques se verifican en una unica pasada batcheada contra el modelo objetivo, lo que garantiza decodificacion greedy sin perdida y muestreo especulativo exacto e insesgado cuando la temperatura es mayor que cero. Tambien mantiene paridad con el parametro --max-thinking-tokens del modelo objetivo.

Los pesos se obtuvieron cuantizando a 4 bits (group_size = 64) los pesos DSpark originales incluidos en thinkingmachines/Inkling-2-Mini, manteniendo en precision nativa las normas, fuse_weight, mask_embed y hidden_out. Ademas de la version base, se publican dos variantes destiladas especificamente sobre las builds de 5,4 GB y 8,9 GB (mtp_4bit_5p4gb_v2.safetensors y mtp_4bit_8p9gb_v2.safetensors), lo que sugiere un ajuste fino del drafter para alinearse con la distribucion de activaciones de esas cuantizaciones concretas del modelo objetivo. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Aceleracion de decodificacion especulativa: propone bloques de tokens candidatos verificados en una sola pasada, con ganancias de throughput de hasta 2,3x en decodificacion sobre el modelo base.
- Decodificacion greedy sin perdida: la verificacion batcheada garantiza que la salida coincide exactamente con la del modelo objetivo sin drafter.
- Muestreo especulativo insesgado con temperatura mayor que cero: mantiene la distribucion exacta del modelo objetivo.
- Compatibilidad con modo thinking: preserva la paridad con --max-thinking-tokens del modelo objetivo.
- Soporte de dos backends: MLX en Apple Silicon y CUDA en NVIDIA (este ultimo limitado a las builds trellis de 3,9, 4,7, 5,4 y 8,9 GB).
- No es un modelo generativo autonomo: no responde prompts por si mismo, no soporta tool calling ni agentes de forma directa; su funcion es exclusivamente acelerar la inferencia de Inkling-2-Mini.

## Casos de uso

- Aceleracion de inferencia local en Apple Silicon: con el runtime LookAtMyQuant y el comando lamq generate, el drafter incrementa el throughput de decodificacion de las builds de Inkling-2-Mini en Macs con chip M-series; por ejemplo, la build de 5,4 GB pasa de 66,3 tok/s en serie a 115,5 tok/s en matematicas y 105,0 tok/s en codigo.
- Servicio HTTP de bajo coste: mediante lamq serve --drafter ... --port 8080 --ui se puede desplegar un endpoint con interfaz web que sirve Inkling-2-Mini cuantizado con decodificacion acelerada, adecuado para prototipos y demos internas.
- Razonamiento matematico interactivo: la mejora de throughput es especialmente alta en tareas de matematicas (hasta 139,7 tok/s en la build de 8,9 GB), por lo que resulta util en asistentes que resuelven problemas paso a paso con cadenas de razonamiento largas.
- Generacion de codigo en local: con 105,0 tok/s en la build de 5,4 GB, el conjunto modelo mas drafter es viable para autocompletado y generacion de funciones en entornos de desarrollo sin GPU dedicada.
- Reduccion de latencia en despliegues CUDA de gama media: en GPUs NVIDIA con las builds trellis de 3,9 a 8,9 GB, el drafter permite servir Inkling-2-Mini con menor latencia por token en entornos sin aceleradores de datacenter.
- Evaluacion y benchmarking de tecnicas de speculative decoding: al publicarse con metricas detalladas por build (prefill, serial, drafted en math y code) y con manifest descriptor, sirve como referencia reproducible para investigar decodificacion especulativa en modelos cuantizados.

## Benchmarks y rendimiento

Rendimiento medido por el autor en un Apple M5 Max con mtp_4bit.safetensors junto a las seis builds publicadas de Inkling-2-Mini:

| Build objetivo | RAM activa / pico | Prefill (T=512) | Serie | Drafted (math / code) |
|---|---:|---:|---:|---:|
| 12,8 GB | 12,73 / 13,51 GB | 1.556 tok/s | 53,8 tok/s | 125,9 / 75,5 tok/s |
| 11,2 GB | 11,14 / 11,97 GB | 1.540 tok/s | 53,1 tok/s | 116,9 / 87,7 tok/s |
| 8,9 GB | 8,84 / 9,68 GB | 1.784 tok/s | 56,0 tok/s | 139,7 / 96,2 tok/s |
| 5,4 GB | 5,34 / 6,41 GB | 1.552 tok/s | 66,3 tok/s | 115,5 / 105,0 tok/s |
| 4,7 GB | 4,67 / 5,75 GB | 1.497 tok/s | 68,3 tok/s | 126,3 / 100,3 tok/s |
| 3,9 GB | 3,81 / 4,91 GB | 1.353 tok/s | 75,2 tok/s | 118,3 / 96,3 tok/s |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el drafter no altera la salida del modelo objetivo.

## Requisitos de hardware

- VRAM/RAM adicional para el drafter: 178,9 MB en 4 bits, frente a 635,8 MB del mtp.safetensors en BF16 del modelo base.
- RAM total estimada: la suma de la build objetivo mas el drafter; por ejemplo, la build de 5,4 GB requiere 5,34 GB activos y 6,41 GB de pico en el M5 Max medido.
- Apple Silicon: soportado via MLX en chips M-series; las mediciones publicadas corresponden a un M5 Max.
- NVIDIA CUDA: soportado en las builds trellis de 3,9, 4,7, 5,4 y 8,9 GB; no se especifican GPUs concretas recomendadas.
- GPU de consumo: las builds de 3,9 a 5,4 GB con drafter caben en GPUs consumer con 8 GB o mas de VRAM; la build de 12,8 GB requiere aproximadamente 13,5 GB.
- Opciones de despliegue: runtime LookAtMyQuant (pip install git+https://github.com/ShinMegamiBoson/lookatmyquant.git para MLX; lookatmyquant[cuda] para CUDA), con subcomandos lamq generate y lamq serve.
- Latencia y throughput: segun la tabla anterior, el drafter eleva la decodificacion de 53-75 tok/s en serie a 75-140 tok/s en matematicas y 75-105 tok/s en codigo, con prefill entre 1.353 y 1.784 tok/s.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-LookAtMyQuant-drafter | Drafter MTP DSpark 3 capas, 4 bits | no disponible (178,9 MB) | no disponible | Apache 2.0 | Hugging Face, runtime LookAtMyQuant |
| thinkingmachines/Inkling-2-Mini (mtp.safetensors BF16) | Drafter MTP DSpark original | no disponible (635,8 MB) | no disponible | no disponible | Hugging Face |
| Builds Inkling-2-Mini-LookAtMyQuant (3,9-12,8 GB) | Modelo objetivo cuantizado | no disponible | no disponible | Apache 2.0 | Hugging Face |

No se dispone de informacion sobre drafters alternativos comparables de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: no genera respuestas por si mismo ni puede usarse sin el modelo objetivo Inkling-2-Mini y el runtime LookAtMyQuant.
- Dependencia de runtime: requiere el paquete LookAtMyQuant, distribuido via GitHub; no es compatible con vLLM, llama.cpp, Ollama ni TGI segun la informacion disponible.
- Cobertura CUDA limitada: solo las builds trellis de 3,9, 4,7, 5,4 y 8,9 GB estan soportadas en NVIDIA; las builds de 11,2 y 12,8 GB no se listan para CUDA.
- Idioma: solo ingles (en); no hay soporte multilingue declarado.
- Rendimiento dependiente de la tarea: las ganancias son mayores en matematicas y codigo que en otros dominios; en la build de 12,8 GB la decodificacion en codigo (75,5 tok/s) apenas supera la serie (53,8 tok/s).
- Riesgo de alucinacion: no aplica al drafter en si, ya que la verificacion exacta garantiza paridad con el modelo objetivo; cualquier alucinacion proviene de Inkling-2-Mini.
- Datos no disponibles: no se publican parametros totales, longitud de contexto, composicion del dataset de entrenamiento ni benchmarks de calidad.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base thinkingmachines/Inkling-2-Mini, cuya licencia no se detalla en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-drafter
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio del runtime LookAtMyQuant: https://github.com/ShinMegamiBoson/lookatmyquant
- Sitio web de LookAtMyQuant: https://lookatmyquant.com/
- Build de 12,8 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-12.8GB
- Build de 11,2 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-11.2GB
- Build de 8,9 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-8.9GB
- Build de 5,4 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-5.4GB
- Build de 4,7 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-4.7GB
- Build de 3,9 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-3.9GB
