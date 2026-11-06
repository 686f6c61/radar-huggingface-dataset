# bartowski/Apexintelligence-AI_Apex-35B-V1.0-GGUF

## Resumen

Apex-35B-V1.0 es un modelo multimodal (texto e imagen) desarrollado por Apexintelligence-AI, publicado en Hugging Face y cuantizado en formato GGUF por bartowski, uno de los cuantizadores más activos de la comunidad. El modelo pertenece a la categoría de mezcla de expertos (MoE), con un total de aproximadamente 35,5 mil millones de parámetros según los metadatos de safetensors (el checkpoint de origen se describe como de 36B). Su pipeline es de tipo image-text-to-text, lo que indica que acepta imágenes y texto como entrada y genera texto.

Se trata de un modelo orientado a casos de uso de agentes e investigación, con soporte de tool calling mediante un formato de llamadas a funciones en XML, y un modo de razonamiento explícito marcado por las etiquetas `<think>`. Destaca técnicamente por incorporar decodificación especulativa mediante MTP (multi-token prediction) y por soportar entrada de imagen a través de un archivo mmproj en llama.cpp.

La relevancia de este lanzamiento radica en la combinación de tres características poco habituales juntas en un modelo de ~35B: naturaleza MoE, capacidad multimodal y soporte nativo de agentes con razonamiento extendido, todo bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones. La cuantización de bartowski incluye matriz de importancia (imatrix) y cubre desde bf16 completo hasta cuantizaciones agresivas, facilitando su despliegue en hardware variado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), multimodal (texto e imagen) |
| Parametros totales | 35.505.251.456 (~35,5B según safetensors; checkpoint de origen descrito como 36B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_K_M, IQ4_NL, Q4_1, Q4_K_S (y otras cuantizaciones inferiores no detalladas en la informacion disponible) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado por bartowski); modelo base en safetensors |

## Arquitectura y entrenamiento

Apex-35B-V1.0 emplea una arquitectura de mezcla de expertos (MoE), aunque el numero de expertos y de parametros activos por token no se ha publicado en la informacion disponible. Es un modelo multimodal: acepta texto e imagen como entrada, siendo necesario el archivo mmproj para habilitar la comprension visual en llama.cpp. Incorpora decodificacion especulativa mediante MTP (multi-token prediction), una tecnica que permite acelerar la generacion prediciendo varios tokens por paso.

Sobre el proceso de entrenamiento no hay datos publicados en la informacion disponible: se desconocen el numero de tokens de entrenamiento, la composicion del dataset y si se aplicaron tecnicas de alineacion como RLHF o DPO. El formato de prompt (ChatML con etiquetas `<|im_start|>`/`<|im_end|>` y bloque `<think>`) sugiere un entrenamiento orientado a razonamiento explicito y a uso agéntico con herramientas, similar al estilo empleado por otros modelos de razonamiento de la comunidad.

## Capacidades

- Generacion de texto conversacional con formato ChatML y modo de razonamiento explicito mediante el bloque `<think>`.
- Comprension de imagenes (pipeline image-text-to-text), habilitada en llama.cpp mediante el archivo mmproj.
- Tool calling / function calling nativo, con un formato estructurado de llamadas a funciones dentro de etiquetas `<tool_call>` y `<function=...>`.
- Orientacion a agentes: el modelo esta etiquetado explicitamente para uso agéntico y de investigacion.
- Decodificacion especulativa mediante MTP para acelerar la inferencia.
- Capacidades multilingues: no disponible.
- Capacidades de codigo, matematicas o audio: no disponible (no hay datos publicados).

## Casos de uso

- Agentes con herramientas: el modelo soporta function calling con formato estructurado, por lo que puede integrarse en frameworks agénticos que orquesten llamadas a APIs, buscadores o ejecutores de codigo en flujos de multiples pasos.
- Analisis de documentos con imagenes: gracias a su pipeline image-text-to-text, puede procesar capturas de pantalla, diagramas o documentos escaneados junto con instrucciones en texto para extraer informacion o responder preguntas.
- Razonamiento paso a paso sobre problemas complejos: el bloque `<think>` permite separar el razonamiento interno de la respuesta final, util en tareas de planificacion, depuracion de codigo o analisis de datos.
- Atencion al cliente automatizada: el formato conversacional ChatML permite gestionar conversaciones multi-turno, y el soporte de herramientas permite consultar sistemas externos (pedidos, inventario) durante la conversacion.
- Despliegue local en estaciones de trabajo: la cuantizacion Q4_K_M (22,80 GB) permite ejecutar el modelo en GPUs de gama alta con 24 GB de VRAM o en configuraciones con descarga parcial a CPU mediante llama.cpp.
- Investigacion sobre arquitecturas MoE y decodificacion especulativa: la disponibilidad de pesos en Apache 2.0 y de cuantizaciones imatrix lo hace util como base para experimentos de optimizacion de inferencia.
- Generacion de codigo asistida: puede usarse para asistir en tareas de programacion mediante prompting, aunque no hay benchmarks publicados que cuantifiquen su rendimiento en este area.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: la cuantizacion recomendada Q4_K_M ocupa 22,80 GB; Q5_K_M requiere 27,46 GB; Q6_K requiere 31,22 GB; Q8_0 requiere 37,81 GB; bf16 requiere 71,07 GB. A estos valores hay que anadir la memoria del archivo mmproj y el KV cache para el contexto.
- GPUs recomendadas: para Q4_K_M, una RTX 3090 o RTX 4090 (24 GB) es el limite justo; para cuantizaciones Q5/Q6 se recomiendan GPUs con 32-48 GB (A100 40GB, A6000, L40S) o configuraciones multi-GPU. Para bf16 se necesita al menos una A100/H100 de 80 GB o varias GPUs.
- Consumer GPUs: cabe en una RTX 4090 de 24 GB con la cuantizacion Q4_K_M o IQ4_NL (22,80 GB), dejando margen ajustado para el KV cache; con offload parcial a CPU mediante llama.cpp tambien es viable en equipos con 32-64 GB de RAM.
- Opciones de despliegue: llama.cpp (formato nativo GGUF, con soporte de mmproj para imagen y MTP para decodificacion especulativa), Ollama y LM Studio (ambos compatibles con GGUF). No hay informacion sobre soporte en vLLM o TGI para este modelo.
- Latencia y throughput: no disponible. El soporte de MTP sugiere una aceleracion de la generacion, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Multimodal | Contexto | Licencia |
|---|---|---|---|---|---|
| Apex-35B-V1.0 | ~35,5B (MoE) | MoE, image-text-to-text | Si (con mmproj) | no disponible | Apache 2.0 |
| Qwen3-30B-A3B | 30,5B (3,3B activos) | MoE, texto | No (variante VL aparte) | 32k-128k | Apache 2.0 |
| GLM-4.5-Air | 106B (12B activos) | MoE, agéntico | No | 128k | MIT |
| Qwen2.5-VL-32B-Instruct | 32B (denso) | Denso, vision | Si | 128k | Apache 2.0 |

Nota: la comparativa se basa en caracteristicas publicas generales; los datos de contexto y parametros activos de Apex-35B no estan disponibles, por lo que la comparacion de rendimiento no puede cuantificarse.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No hay documentacion sobre evaluaciones de sesgo del modelo base.
- Riesgo de alucinacion: al tratarse de un modelo generativo de 35B sin documentacion de alineacion publicada, debe asumirse un riesgo de alucinacion estandar; se recomienda verificacion factual en usos criticos.
- Limitaciones de contexto: la longitud de ventana de contexto no esta publicada, lo que dificulta planificar cargas de trabajo con documentos largos; debe verificarse empiricamente antes de produccion.
- Idiomas: los idiomas soportados no estan especificados; el formato de prompt es ChatML (comun en modelos con buen rendimiento en ingles y chino), pero no hay garantias publicadas sobre castellano.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar el archivo LICENSE del modelo base para condiciones adicionales.
- La model card del repositorio original es practicamente inexistente: faltan datos de entrenamiento, benchmarks, numero de expertos y parametros activos, lo que supone un riesgo de gobernanza para entornos de produccion.
- El tamano del repositorio (582 GB) indica que los archivos grandes estan divididos en varios shards; la descarga requiere herramientas que gestionen splits (huggingface-cli o similares).
- Para la entrada de imagen es imprescindible descargar el archivo mmproj correspondiente; sin el, el modelo funciona solo con texto.

## Enlaces

- Repositorio cuantizado (GGUF): https://huggingface.co/bartowski/Apexintelligence-AI_Apex-35B-V1.0-GGUF
- Modelo original: https://huggingface.co/Apexintelligence-AI/Apex-35B-V1.0
- Licencia: https://huggingface.co/Apexintelligence-AI/Apex-35B-V1.0/blob/main/LICENSE
- llama.cpp (herramienta de cuantizacion e inferencia): https://github.com/ggml-org/llama.cpp/
- Release de llama.cpp usada para la cuantizacion: https://github.com/ggml-org/llama.cpp/releases/tag/b11969
- Cuantizacion recomendada (Q4_K_M): https://huggingface.co/bartowski/Apexintelligence-AI_Apex-35B-V1.0-GGUF/blob/main/Apexintelligence-AI_Apex-35B-V1.0-Q4_K_M.gguf
- Paper, blog oficial y demos: no disponibles
