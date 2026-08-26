# kingjones777/Granite-4.2-30B-ROCmFP4-STRIX_LEAN-GGUF

## Resumen

El modelo `kingjones777/Granite-4.2-30B-ROCmFP4-STRIX_LEAN-GGUF` es una cuantizacion GGUF del modelo `ibm-granite/granite-4.2-30b`, creada por el usuario kingjones777 específicamente para el runtime ROCmFPX, un fork experimental de llama.cpp con kernels optimizados para hardware AMD. La variante STRIX_LEAN es la cuarta capa de un conjunto de cuantizaciones del mismo autor, pensada para ejecutar un modelo de 30 000 millones de parametros en APUs AMD Strix Halo (gfx1151, Ryzen AI MAX+ 395) con la memoria unificada del sistema.

Esta ficha se centra en el archivo GGUF publicado, no en el modelo base completo. El archivo pesa 14,68 GiB, con una precision de 4,31 bits por peso (bpw) y una longitud de contexto de 131 072 tokens. La cuantizacion usa el formato propietario `Q4_0_ROCMFP4_STRIX_LEAN`, que solo carga en el fork ROCmFPX de llama.cpp, no en la version estandar. El autor ha medido una velocidad de generacion de 13,99 tok/s en su hardware de referencia (Ryzen AI MAX+ 395 con ROCm 7.2.4 y descarga completa a GPU).

La relevancia de este modelo es doble: por un lado, demuestra la viabilidad de ejecutar un modelo de 30B en hardware de consumo AMD sin GPU discreta, gracias a la memoria unificada del Strix Halo; por otro, introduce una cuantizacion ROCmFP4 que protege la cabeza de salida (`output.weight`) con Q6_K para preservar la calidad de los logits, algo que el autor considera critico en modelos con `tie_word_embeddings: false`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (desconocida en detalle; modelo base de IBM Granite 4.2) |
| Parametros totales | 29.276.770.304 (30B) |
| Parametros activos | No es MoE, todos activos |
| Longitud de contexto | 131.072 tokens (segun el archivo GGUF) |
| Tipos de cuantizacion | Q4_0_ROCMFP4_STRIX_LEAN (ftype 106, 4.31 bpw) |
| Idiomas soportados | No disponible (el modelo base de IBM Granite 4.2 soporta varios idiomas, pero la cuantizacion no especifica) |
| Licencia | Apache-2.0 (tanto el modelo base como esta cuantizacion) |
| Formato de pesos | GGUF (solo compatible con el fork ROCmFPX de llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base `ibm-granite/granite-4.2-30b` en la documentacion de esta cuantizacion. El autor se limita a indicar que se trata de un modelo de 30B de la serie Granite 4.2 de IBM, con `tie_word_embeddings: false` (es decir, la capa de salida no comparte pesos con las embeddings). La cuantizacion se realizo con `convert_hf_to_gguf.py` del arbol `rocmfpx-dspark-halo` y despues se cuantizo con `llama-quantize` usando `--output-tensor-type q6_K` para proteger la cabeza de salida.

El formato ROCmFP4 es una extension experimental de GGUF que define kernels de cuantizacion de 4 bits para AMD ROCm y Vulkan, desarrollada en el repositorio ROCmFPX de charlie12345. La variante STRIX_LEAN utiliza un esquema de cuantizacion que combina la calidad de atencion K/V de la serie STRIX con una tabla de embeddings reducida a Q5_K para ahorrar espacio (la parte LEAN). No hay informacion publica sobre el entrenamiento del modelo base, numero de tokens, composicion del dataset ni tecnicas de alineamiento (RLHF/DPO).

## Capacidades

- Generacion de texto: el modelo base Granite 4.2 es un LLM de proposito general, y esta cuantizacion mantiene la capacidad de generar texto coherente en lenguaje natural.
- Razonamiento y codigo: no se han publicado evaluaciones especificas, pero la serie Granite 4.2 de IBM incluye modelos optimizados para tareas de razonamiento y generacion de codigo.
- Tool calling: existe una variante llamada `Q8_0-AGENT` del mismo autor, lo que sugiere que el modelo base soporta llamadas a herramientas y uso en agentes, aunque esta variante STRIX_LEAN no lo garantiza explicitamente.
- Multilingue: no se ha especificado la cobertura de idiomas para esta cuantizacion.
- Integracion con ROCmFPX: la capacidad de ejecucion en AMD Strix Halo es la caracteristica principal, gracias al formato de pesos especializado.

## Casos de uso

- **Inferencia local en AMD Strix Halo**: ejecutar un LLM de 30B en un APU Ryzen AI MAX+ 395 sin GPU dedicada, aprovechando la memoria unificada y el soporte ROCmFPX. El archivo esta optimizado para el hardware gfx1151, con un rendimiento de 13,99 tok/s en descarga completa.
- **Desarrollo de aplicaciones de chat local**: usar `llama-server` con el comando indicado en la model card para servir el modelo en una red local, con un contexto de hasta 131K tokens para conversaciones largas.
- **Prototipado de agentes con tool calling**: aunque esta variante no es la especifica para agentes, el modelo base soporta tool calling, y el autor ofrece una variante AGENT (Q8_0-AGENT) para ese uso. STRIX_LEAN puede ser util para pruebas rapidas con menos requisitos de memoria.
- **Experimentos con cuantizacion ROCmFP4**: para desarrolladores interesados en evaluar la calidad de la cuantizacion de 4 bits con cabeza Q6_K en comparacion con otras cuantizaciones, como Q8_0.
- **Despliegue en entornos con recursos limitados**: el peso de 14,68 GiB cabe en un sistema con 32 GiB de RAM unificada, lo que permite ejecutar un modelo de 30B en portatiles o mini PCs con Strix Halo.
- **Investigacion de rendimiento**: medir el rendimiento de la cuantizacion ROCmFP4 en diferentes hardware AMD, aunque el autor no ha publicado benchmarks de calidad, solo de velocidad.

## Benchmarks y rendimiento

El autor no ha publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Solo indica la velocidad de generacion medida en su hardware de referencia:

| Hardware | Velocidad (tok/s) | Condiciones |
|---|---|---|
| Ryzen AI MAX+ 395 (Strix Halo, gfx1151, ROCm 7.2.4) | 13,99 | 128-token greedy, descarga completa (`-ngl 999`) |

No hay datos de perplejidad ni comparaciones con otros modelos.

## Requisitos de hardware

- **VRAM**: el archivo pesa 14,68 GiB. En un sistema Strix Halo con memoria unificada, se necesita al menos 16 GiB de RAM libre para la descarga completa. Con cuantizacion parcial (no recomendado por el autor) se puede reducir, pero el autor no publica cifras de rendimiento para esa configuracion.
- **GPU recomendada**: AMD APU con arquitectura gfx1151 (Ryzen AI MAX 300 series). No se garantiza compatibilidad con otros GPUs AMD, aunque el fork ROCmFPX tambien soporta Vulkan.
- **Software**: es imprescindible el fork ROCmFPX de llama.cpp (https://github.com/charlie12345/ROCmFPX). El llama.cpp estandar no carga este archivo.
- **Opciones de despliegue**: `llama-server` con el comando `llama-server -m granite-4.2-30b-Q4_0_ROCMFP4_STRIX_LEAN.gguf -dev ROCm0 -fa on -ngl 999 -c 8192`. No es compatible con vLLM, Ollama u otros motores que usen GGUF estandar.
- **Latencia y throughput**: 13,99 tok/s en el hardware de referencia, medido con generacion greedy de 128 tokens y descarga completa.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar con otros modelos de 30B como Llama 3.1 30B o Qwen 2.5 32B. La unica comparacion posible es con las otras variantes del mismo autor:

| Variante | Tamano | bpw | Velocidad (tok/s) | Notas |
|---|---|---|---|---|
| STRIX_LEAN (este) | 14,68 GiB | 4,31 | 13,99 | Embeddings Q5_K, head Q6_K |
| COHERENT | 15,54 GiB | 4,31 | 13,03 | Embeddings Q6_K, head Q6_K |
| Q8_0 | 28,12 GiB | 8,0 | 7,10 | Mayor fidelidad |
| Q8_0-AGENT | 28,60 GiB | 8,0 | 6,92 | Especializado en tool calling |

La comparativa con otros modelos de 30B no esta disponible por falta de datos.

## Limitaciones y advertencias

- **Incompatibilidad con llama.cpp estandar**: el formato `Q4_0_ROCMFP4_STRIX_LEAN` es propietario del fork ROCmFPX. Si se intenta cargar con llama.cpp oficial, el modelo no se cargara.
- **Hardware limitado**: el modelo esta optimizado para AMD Strix Halo (gfx1151). No se garantiza que funcione en otras GPUs AMD o NVIDIA, y el autor no publica resultados en otros hardware.
- **Cuantizacion experimental**: ROCmFP4 es un formato experimental, con posibles errores o cambios de rendimiento. El propio autor advierte que "las APIs, ajustes y rendimiento pueden cambiar".
- **Sin evaluacion de calidad**: el autor no ha publicado resultados de perplejidad ni benchmarks de calidad. La cuantizacion de 4 bits puede degradar el rendimiento en tareas de razonamiento complejo o codigo.
- **Sesgos y alucinaciones**: no se ha evaluado el modelo para sesgos o alucinaciones. Como cualquier LLM, puede generar contenido incorrecto o sesgado.
- **Licencia**: Apache-2.0, pero el runtime ROCmFPX es de terceros y sus terminos se aplican al software de ejecucion, no a los pesos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/kingjones777/Granite-4.2-30B-ROCmFP4-STRIX_LEAN-GGUF)
- [Modelo base: ibm-granite/granite-4.2-30b](https://huggingface.co/ibm-granite/granite-4.2-30b)
- [Repositorio ROCmFPX (fork de llama.cpp)](https://github.com/charlie12345/ROCmFPX)
- [Repositorio ROCmFP4 (integracion limpia)](https://github.com/charlie12345/rocmfp4)
- [Variante COHERENT](https://huggingface.co/kingjones777/Granite-4.2-30B-ROCmFP4-COHERENT-GGUF)
- [Variante Q8_0](https://huggingface.co/kingjones777/Granite-4.2-30B-ROCmFPX-Q8_0-GGUF)
- [Variante Q8_0-AGENT](https://huggingface.co/kingjones777/Granite-4.2-30B-ROCmFPX-Q8_0-AGENT-GGUF)
