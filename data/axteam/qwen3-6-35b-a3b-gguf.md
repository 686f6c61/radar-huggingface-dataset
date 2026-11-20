# axteam/Qwen3.6-35B-A3B-GGUF

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por el equipo Qwen (Alibaba). Con 35.505.251.456 parámetros totales y una arquitectura que activa solo una fracción de ellos por token (el sufijo A3B indica aproximadamente 3 mil millones de parámetros activos), busca ofrecer capacidad de razonamiento de gama alta con un coste de inferencia contenido. La familia Qwen3 incorpora modos de razonamiento explícito y soporte multilingüe amplio.

Este repositorio concreto, publicado por el usuario axteam, no contiene los pesos originales sino cuantizaciones GGUF de posentrenamiento (PTQ) del modelo base Qwen/Qwen3.6-35B-A3B, pensadas para su uso con llama.cpp, Ollama y LM Studio. Se ofrecen dos variantes: Q4_K_M (21,7 GB) y Q8_0 (37,8 GB). Es relevante porque permite ejecutar un modelo MoE de 35B en hardware de consumo de gama alta con una pérdida de calidad medida muy reducida respecto al cuantizado de 8 bits.

La licencia es Apache-2.0, lo que facilita el uso comercial. El repositorio incluye únicamente el backbone de texto: el codificador de visión del modelo original no está incluido en estos ficheros GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Mixture of Experts (MoE); arquitectura `qwen35moe` en llama.cpp |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | aproximadamente 3B (indicado por el sufijo A3B; cifra exacta no disponible) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de la model card usa `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M (4 bits k-quant, 21,7 GB) y Q8_0 (8 bits, 37,8 GB); PTQ sin reentrenamiento |
| Idiomas soportados | no disponible de forma oficial; la model card incluye pruebas en ingles y coreano |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); plantilla de chat embebida; sin fichero `mmproj` (solo texto) |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas de mezcla de expertos (MoE): de los 35,5B parametros totales solo se activa una fraccion por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamano. La arquitectura se identifica en llama.cpp como `qwen35moe` y esta soportada desde la build b7990. Los ficheros GGUF de este repositorio incluyen ademas la capa de prediccion multi-token (MTP), soportada en llama.cpp desde la build b9180 (PR #22673).

Las cuantizaciones se generaron mediante posentrenamiento (PTQ) con las herramientas de llama.cpp (`convert_hf_to_gguf.py` seguido de `llama-quantize`), con cuantizacion por bloques (k-quants: escalas por bloque con asignacion mixta de bits) y sin reentrenamiento. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO u otras. La model card recomienda los parametros de muestreo del `generation_config.json` original: temperature 1.0, top_p 0.95 y top_k 20.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat embebida en cada fichero GGUF.
- Razonamiento y respuesta a preguntas; la model card verifica respuestas correctas a preguntas factuales cortas (capital de Francia y de Corea).
- Soporte multilingue: se han medido perplejidades tanto en ingles (WikiText-2) como en coreano (muestra de Wikipedia en coreano), con resultados buenos en ambos.
- Inferencia con prediccion multi-token (MTP) en llama.cpp a partir de la build b9180.
- Servido mediante API compatible con OpenAI a traves de `llama-server` (opcion `--jinja` para la plantilla de chat).
- Vision: no disponible en esta distribucion GGUF; el codificador de vision no esta incluido y no hay fichero `mmproj`.
- Tool calling / function calling: no confirmado en la informacion proporcionada para esta distribucion.

## Casos de uso

- Asistente conversacional autoalojado: con `llama-server --jinja` se expone una API compatible con OpenAI en el puerto 8080, lo que permite sustituir directamente llamadas a APIs comerciales en aplicaciones existentes sin cambiar el codigo cliente.
- Despliegue en estaciones de trabajo con GPU unica: el fichero Q4_K_M (21,7 GB) cabe en GPUs de 24 GB o mas con todas las capas en GPU, lo que habilita un asistente de calidad 35B en hardware de gama alta de consumo o profesional.
- Procesamiento de documentacion en ingles y coreano: las perplejidades medidas (5,90 en WikiText-2 y 4,11 en Wikipedia coreana para Q4_K_M) indican un comportamiento solido en ambos idiomas, adecuado para resumen y extraccion sobre corpus de esos idiomas.
- Chat de terminal para desarrolladores: `llama-cli -m Qwen3.6-35B-A3B-Q4_K_M.gguf -c 8192 --jinja` permite consultas interactivas locales sin infraestructura de servidor.
- Integracion en Ollama o LM Studio: la model card documenta `ollama run hf.co/axteam/Qwen3.6-35B-A3B-GGUF:Q4_K_M` y la busqueda por nombre en LM Studio, lo que simplifica prototipado rapido (aunque el autor no ha verificado la ejecucion en estas herramientas).
- Reduccion de memoria en produccion: con `--cache-type-k q8_0 --cache-type-v q8_0 -fa on` se reduce a la mitad la cache KV, lo que permite contextos mas largos en GPUs con VRAM limitada.
- Evaluacion comparativa de cuantizaciones: los datos de perplejidad publicados (Q8_0 frente a Q4_K_M) sirven como referencia para decidir el equilibrio tamano/calidad en despliegues propios.

## Benchmarks y rendimiento

La model card solo publica mediciones de perplejidad (PPL) realizadas con llama.cpp b12005 (commit e0f142d, build CUDA) sobre una NVIDIA B200, con todas las capas en GPU, 16 ventanas de 2.048 tokens del conjunto de test de WikiText-2 y de una muestra de Wikipedia en coreano. Como el repositorio no incluye fichero BF16, los porcentajes son relativos a Q8_0.

| Fichero | PPL WikiText-2 (EN) | PPL Wikipedia coreano | Respecto a Q8_0 (EN / KO) |
|---|---|---|---|
| Qwen3.6-35B-A3B-Q8_0.gguf | 5,87 | 4,04 | referencia |
| Qwen3.6-35B-A3B-Q4_K_M.gguf | 5,90 | 4,11 | +0,6% / +1,9% |

El propio autor advierte que 16 ventanas por texto es una muestra pequena y que diferencias de pocos puntos porcentuales entre ficheros estan dentro del ruido de muestreo (al remedir con 64 ventanas, tales diferencias se movieron hasta unos 19 puntos). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero GGUF mas la cache KV del contexto elegido. Q4_K_M requiere unos 21,7 GB; Q8_0, unos 37,8 GB.
- GPU verificada: NVIDIA B200, con todos los ficheros cargados con todas las capas en GPU y perplejidad medida correctamente.
- GPU recomendadas: para Q4_K_M, GPUs con 24 GB o mas (por ejemplo RTX 4090, A100 40 GB, H100); para Q8_0, GPUs con 40-48 GB o mas (A100 80 GB, H100, B200).
- GPU de consumo: Q4_K_M cabe en una RTX 4090 (24 GB) con margen limitado para cache KV; Q8_0 no cabe en GPUs de consumo actuales.
- Reduccion de cache KV: `--cache-type-k q8_0 --cache-type-v q8_0 -fa on` reduce a la mitad la memoria de la cache KV (soportado desde la build b6325 de llama.cpp).
- Opciones de despliegue: llama.cpp (build minima b9180 por el soporte de MTP; `qwen35moe` desde b7990), `llama-server` con API compatible con OpenAI, `llama-cli`; Ollama y LM Studio documentados pero no verificados por el autor.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (este GGUF) | 35,5B | aprox. 3B | no disponible | Apache-2.0 | GGUF | Solo texto en esta distribucion; PPL EN 5,90 (Q4_K_M) |
| Modelo base Qwen/Qwen3.6-35B-A3B | 35,5B | aprox. 3B | no disponible | Apache-2.0 | safetensors (BF16) | Pesos originales; incluye vision; sin cuantizar |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de datos de benchmarks comparativos con otros modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Solo texto: el codificador de vision no esta incluido en estos GGUF y no hay fichero `mmproj`; no es posible OCR ni entrada de imagenes con esta distribucion.
- Perdida de calidad por cuantizacion: Q4_K_M presenta un incremento de perplejidad de +0,6% en ingles y +1,9% en coreano frente a Q8_0; para tareas sensibles a la precision conviene usar Q8_0.
- Muestra de evaluacion reducida: las perplejidades se midieron con 16 ventanas de 2.048 tokens, lo que el propio autor califica de muestra pequena con ruido de muestreo relevante.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; como en cualquier modelo generativo, debe validarse la salida en produccion.
- Sesgos: no documentados en la informacion proporcionada.
- Idiomas: la model card solo aporta evidencia empirica en ingles y coreano; el resto de idiomas no esta verificado.
- Requisito de version: es necesario llama.cpp b9180 o superior por la capa MTP incluida; versiones anteriores pueden fallar al cargar los ficheros.
- Ollama y LM Studio: el autor no ha verificado la ejecucion en estas herramientas, aunque documenta los comandos.
- Licencia: Apache-2.0 permite uso comercial; los pesos y el tokenizador originales pertenecen al equipo Qwen.

## Enlaces

- Repositorio GGUF: https://huggingface.co/axteam/Qwen3.6-35B-A3B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- llama.cpp (herramienta de conversion y cuantizacion): https://github.com/ggml-org/llama.cpp
- PR de soporte de MTP en llama.cpp (#22673): no disponible como enlace directo en la informacion proporcionada
- Paper, blog o demo oficial: no disponibles en la informacion proporcionada
