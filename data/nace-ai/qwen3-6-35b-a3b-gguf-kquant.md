# nace-ai/Qwen3.6-35B-A3B-GGUF-KQuant

## Resumen

Qwen3.6-35B-A3B-GGUF-KQuant es una coleccion de cuantizaciones GGUF del modelo base Qwen/Qwen3.6-35B-A3B, publicada por el usuario nace-ai bajo licencia Apache 2.0. El modelo base es un transformer de tipo mezcla de expertos (MoE) con 34.660.610.688 parametros totales, orientado a generacion de texto conversacional y compatible con tool calling. Esta publicacion no entrena ningun modelo nuevo: su aportacion es un conjunto de ficheros GGUF optimizados para llama.cpp, LM Studio y Ollama, con pesos de modelo de lenguaje entre 9,47 GB y 18,02 GB.

La relevancia de esta ficha radica en el trabajo de cuantizacion medido con rigor. El autor publica valores de divergencia KL respecto al modelo BF16, precision top-1 y comparaciones directas con cuantizaciones de otros publicadores (Unsloth, bartowski, byteshape) en rangos de tamano equivalentes. Segun la model card, varios ficheros igualan o superan a alternativas del mismo tamano en fidelidad al modelo original, tanto a 512 tokens como en ventanas de 128K tokens.

El repositorio ocupa 200,9 GB e incluye vision y MTP (multi-token prediction) ademas de los pesos de lenguaje. La fecha de creacion indicada es 2026-11-12. El modelo esta etiquetado como compatible con endpoints y con la etiqueta `imatrix`, lo que sugiere el uso de matrices de importancia para calibrar la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun el modelo base Qwen/Qwen3.6-35B-A3B |
| Parametros totales | 34.660.610.688 (34,66 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 128K tokens (evaluado a 128K en la model card); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | IQ2_XXS, IQ3_XXS, IQ3_S, IQ4_XS, Q3_K_S y mezclas de tipos por tensor (2,19 a 4,16 bits por peso) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp, LM Studio y Ollama) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con arquitectura de mezcla de expertos (MoE), con 34,66 mil millones de parametros totales. El numero de parametros activos por token no se especifica en la informacion disponible. La model card menciona que el repositorio incluye pesos de vision y de MTP (multi-token prediction) ademas de los pesos de lenguaje, lo que indica que el modelo base incorpora capacidades multimodales y decodificacion especulativa mediante prediccion multi-token. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

Esta publicacion concreta no entrena el modelo: aplica cuantizacion con matrices de importancia (`imatrix`) para generar ficheros GGUF. Cada fichero mezcla tipos de tensor de 2,6 a 6,6 bits por peso, todos compatibles con llama.cpp estandar. Por ejemplo, `IQ3_S` se compone de un 50% de IQ2_S, 31% de IQ3_S, 15% de Q6_K y 4% de otros tipos (3,15 bits por peso de media); `Q3_K_S` mezcla 54% IQ3_XXS, 22% IQ3_S, 14% Q6_K, 9% IQ4_XS y 1% de otros tipos. La evaluacion se realizo con el build 0a94a3f2 de llama.cpp sobre 64 ventanas y 32.704 tokens de texto en ingles creado despues del 2026-09-20 (Wikipedia, chat y tool calls, y codigo de GitHub), separado del texto usado para ajustar los ficheros.

## Capacidades

- Generacion de texto conversacional en formato chat, con soporte de turnos de usuario y de herramienta.
- Tool calling y function calling: la model card evalua explicitamente texto de chat y de llamadas a herramientas.
- Razonamiento multi-turno y concatenacion de pasos, heredado del modelo base Qwen3.6.
- Capacidades multimodales: el repositorio incluye pesos de vision segun la model card, aunque las cuantizaciones publicadas se centran en los pesos de lenguaje.
- Decodificacion especulativa mediante MTP (multi-token prediction) presente en el modelo base.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Contexto largo de hasta 128K tokens, con evaluacion especifica de fidelidad a esa longitud.

## Casos de uso

- Despliegue local en estaciones de trabajo: los ficheros de 9,47 a 18,02 GB permiten ejecutar un MoE de 34,66 mil millones de parametros en GPUs de consumo con llama.cpp, LM Studio u Ollama, sin depender de API externa.
- Asistentes de codigo en IDE: la cuantizacion `Q3_K_S` mantiene una precision top-1 del 94,5% frente al BF16 en texto de codigo a 128K tokens, lo que la hace adecuada para autocompletado y explicacion de repositorios completos dentro de la ventana de contexto.
- Atencion al cliente automatizada: el soporte de tool calling y de conversaciones multi-turno con contexto de hasta 128K tokens permite gestionar historiales largos y consultas a sistemas internos en una sola sesion.
- Procesamiento de documentos extensos: con 128K tokens de contexto se pueden analizar contratos, informes o bases de codigo completas; la fidelidad medida a esa longitud (KL medio de 0,601 en chat y 0,063 en codigo para `Q3_K_S`) respalda su uso en tareas de extraccion y resumen.
- Pipelines de agentes con herramientas: la combinacion de tool calling y MTP encaja en flujos de razonamiento multi-paso donde el modelo debe invocar funciones y encadenar resultados.
- Experimentacion e investigacion: la publicacion de metricas KL, precision top-1 y comparaciones con otras cuantizaciones facilita estudios de degradacion por cuantizacion y la seleccion de ficheros segun el presupuesto de memoria.
- Inferencia en entornos con VRAM limitada: los ficheros `IQ2_XXS` de 9,47 y 9,76 GB permiten ejecutar el modelo en GPUs de 12-16 GB, a costa de una mayor divergencia (KL medio de 0,211 y 0,193 respectivamente).

## Benchmarks y rendimiento

La model card no publica resultados en benchmarks estandar como MMLU, HumanEval o GSM8K. En su lugar, proporciona metricas de fidelidad de la cuantizacion respecto al modelo BF16.

| Fichero | Pesos LM (GB) | Bits por peso | KL medio (512 tok) | KL p99.9 | Precision top-1 (%) |
|---|---:|---:|---:|---:|---:|
| IQ2_XXS-9.5GB | 9,47 | 2,19 | 0,211 | 9,260 | 84,5 |
| IQ2_XXS-9.8GB | 9,76 | 2,25 | 0,193 | 9,498 | 85,4 |
| IQ3_S | 13,67 | no disponible | 0,085 | 7,120 | 90,9 |
| IQ3_XXS | 14,30 | no disponible | 0,074 | 6,382 | 91,8 |
| Q3_K_S | 15,30 | no disponible | 0,061 | 6,695 | 93,1 |
| IQ4_XS-16.8GB | 16,75 | 3,87 | 0,050 | 6,249 | 93,9 |
| IQ3_S-16.8GB | 16,83 | 3,88 | 0,048 | 6,055 | 94,0 |
| IQ3_S-17.6GB | 17,58 | 4,06 | 0,045 | 6,021 | 94,1 |
| IQ4_XS-17.7GB | 17,69 | 4,08 | 0,044 | 5,863 | 94,3 |
| IQ4_XS-18.0GB | 18,02 | 4,16 | 0,043 | 6,240 | 94,4 |

Fidelidad a 128K tokens (KL medio respecto a BF16):

| Fichero | Tipo de texto | KL medio | KL p99.9 | Top-1 (%) |
|---|---|---:|---:|---:|
| IQ3_XXS | chat y tool calls | 0,643 | 22,168 | 86,1 |
| Q3_K_S | chat y tool calls | 0,601 | 21,390 | 87,0 |
| IQ3_XXS | codigo | 0,077 | 9,929 | 93,7 |
| Q3_K_S | codigo | 0,063 | 9,438 | 94,5 |
| IQ3_XXS | prosa | 0,049 | 1,996 | 90,9 |
| Q3_K_S | prosa | 0,036 | 1,444 | 92,1 |

Comparaciones directas publicadas por el autor: `IQ3_S` (13,67 GB, KL 0,085) frente a Unsloth UD-IQ3_S (13,67 GB, KL 0,091); `IQ3_XXS` (14,30 GB, KL 0,074) frente a bartowski IQ3_XXS (14,85 GB, KL 0,081); `Q3_K_S` (15,30 GB, KL 0,061) frente a Unsloth UD-Q3_K_S (15,35 GB, KL 0,061). A 512 tokens, `IQ3_XXS` supera en fidelidad a tres ficheros de otros publicadores en el rango de 0,98 a 1,06 veces su tamano.

## Requisitos de hardware

- VRAM estimada para inferencia: desde aproximadamente 10 GB para `IQ2_XXS-9.5GB` hasta unos 19-20 GB para `IQ4_XS-18.0GB`, sumando overhead de contexto KV cache.
- GPU de consumo: los ficheros de 9,47 a 14,30 GB caben en GPUs de 12-16 GB (por ejemplo, RTX 4070 Ti Super, RTX 4080, RTX 4090). Los ficheros de 15,30 a 18,02 GB requieren 20-24 GB y encajan en RTX 4090 (24 GB) o en configuraciones con offload parcial a CPU.
- GPU de datacenter: A100 (40/80 GB), H100 (80 GB) y L40S (48 GB) permiten cargar cualquier fichero con contexto largo; para 128K tokens es necesario reservar VRAM adicional para la cache KV, que puede superar los pesos del modelo.
- Opciones de despliegue: llama.cpp (build 0a94a3f2 usado en la evaluacion), LM Studio, Ollama y servidores compatibles con endpoints (etiqueta `endpoints_compatible`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (Nace GGUF KQuant) | 34,66 mil M (MoE) | 128K | Apache 2.0 | GGUF | Cuantizaciones con KL medido y comparado con otros publicadores |
| Qwen3.6-35B-A3B (Unsloth UD) | 34,66 mil M (MoE) | 128K | Apache 2.0 | GGUF | Alternativa de cuantizacion; `UD-Q3_K_S` iguala en KL a `Q3_K_S` de Nace a 512 tokens, pero Nace es mejor a 128K |
| Qwen3.6-35B-A3B (bartowski) | 34,66 mil M (MoE) | 128K | Apache 2.0 | GGUF | `IQ3_XXS` de bartowski (14,85 GB, KL 0,081) es superado por el de Nace (14,30 GB, KL 0,074) |
| Qwen3.6-35B-A3B (byteshape) | 34,66 mil M (MoE) | 128K | Apache 2.0 | GGUF | Ficheros `Q3_K_S-3.39bpw` e `IQ3_S-3.48bpw` superados en KL por los ficheros de Nace de tamano equivalente |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; se heredan los del modelo base Qwen3.6-35B-A3B.
- Riesgo de alucinacion: no cuantificado en la model card; las metricas publicadas miden fidelidad a la salida BF16, no veracidad.
- Idiomas: la evaluacion de cuantizacion se realizo exclusivamente con texto en ingles; el rendimiento en castellano u otros idiomas no esta medido.
- Contexto: a 128K tokens la divergencia crece de forma notable en chat y tool calls (KL medio de 0,601-0,643 frente a 0,061-0,074 a 512 tokens), lo que puede degradar respuestas en conversaciones muy largas.
- Los ficheros de menor tamano (`IQ2_XXS`) presentan una precision top-1 del 84,5-85,4%, con perdida apreciable de fidelidad; no son recomendables para tareas que exijan alta precision.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.6-35B-A3B por si anaden restricciones adicionales.
- El repositorio ocupa 200,9 GB; descargar el conjunto completo requiere espacio en disco considerable, aunque basta con bajar el fichero GGUF deseado.
- La fecha de creacion indicada (2026-11-12) y el contexto de evaluacion (texto posterior al 2026-09-20) deben tratarse como datos de la model card, no verificados de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-GGUF-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio llama.cpp (build de referencia 0a94a3f2): https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai/
- Ollama: https://ollama.com/
- Paper o blog del modelo base: no disponible
- Demo: no disponible
