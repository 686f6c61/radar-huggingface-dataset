# eduardoworrel/alias3-micro-1026-ONNX-decode-only

## Resumen

Este repositorio contiene los grafos ONNX "decode-only" de alias3-micro-1026, un modelo de generacion de texto con foco en ciberseguridad desarrollado por Alias Robotics. La cuantizacion y exportacion a ONNX ha sido realizada por el usuario eduardoworrel, que publica variantes en siete formatos de datos distintos (fp32, fp16, uint8, q8, q4, q4f16 y bnb4) pensadas para ejecutar el modelo token a token en el navegador o en Node mediante onnxruntime-web con WebGPU, o en servidor con onnxruntime CUDA.

A diferencia de una exportacion estandar, esta version "decode-only" expone el estado oculto del modelo en cada paso, lo que permite conectar cabezas de lectura externas ("System 1 heads") que responden directamente a partir de los logits o del estado oculto sin generar texto completo. La model card del modelo base lo etiqueta como "research preview" y remite al articulo arXiv:2610.16550, que describe una arquitectura de doble proceso inspirada en el marco System 1 / System 2 de Kahneman y en las pointer networks de Vinyals et al. (2015). Su relevancia actual radica en demostrar que un modelo especializado en decisiones de seguridad puede ejecutarse integramente en el navegador del cliente, sin backend, con pesos de unos 3 GB en cuantizacion de 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3.5 (qwen3_5_text), decode-only ONNX con interfaz de pointer-head bilinear (System 1) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32, fp16, uint8, q8, q4, q4f16, bnb4 (NF4) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (con external data), tambien disponibles variantes MLC (q4f32_1, q4f16_1) y LiteRT.js del mismo autor |

## Arquitectura y entrenamiento

El modelo base, alias3-micro-1026 de Alias Robotics, es un transformer de la familia qwen3_5_text segun los tags del repositorio. La publicacion de referencia (arXiv:2610.16550) describe una arquitectura de doble proceso: un modo "System 2" de generacion de texto convencional y un modo "System 1" basado en una cabeza de decision tipada (bilinear pointer-head, adaptada de las pointer networks) que lee el estado oculto y produce respuestas directas (si/no, eleccion multiple, severidad) sin decodificar tokens. El repositorio detalla los detalles de la exportacion: fp32 via optimum (jit.trace) con un parche propio de optimum-onnx; q4 mediante MatMulNBits int4 con embeddings GBQ int4; q4f16 con escalas fp16; y bnb4 con MatMulBnb4 NF4 y embeddings GBQ uint4. No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO.

## Capacidades

- Generacion de texto en el dominio de la ciberseguridad (tag "cybersecurity" del modelo base).
- Respuestas binarias (si/no) leidas directamente de los logits o del estado oculto mediante `head.bin`.
- Respuestas de eleccion multiple mediante la misma interfaz de cabeza de lectura.
- Estimacion de severidad mediante `head_score.bin` (prueba de concepto, ajustada con 30 casos sinteticos).
- Ejecucion token a token en navegador (Chrome con WebGPU via onnxruntime-web 1.30.0 y ct0-edge) o en Node.
- Exposicion del estado oculto para integrar cabezas externas de "System 1".
- No hay informacion disponible sobre tool calling, capacidades agentivas, soporte multilingue, vision o audio.

## Casos de uso

- Clasificacion de incidentes de seguridad en el navegador: la cabeza de decision responde si/no o elige entre opciones sin generar texto, util para triage rapido de alertas con latencia de decision de 15-30 s por sonda en WebGPU.
- Analisis de vulnerabilidades con puntuacion de severidad: `head_score.bin` permite obtener una estimacion de severidad a partir del estado oculto, aunque la propia model card advierte de que es una prueba de concepto.
- Demostraciones y herramientas client-side sin backend: los archivos q4 y q4f16 (2,73-3,03 GB) caben en el limite de 4 GB de WebGPU, permitiendo desplegar el modelo integramente en el navegador del usuario.
- Integracion en pipelines de Node.js: al funcionar con onnxruntime en Node, puede incrustarse en scripts de analisis de logs o automatizaciones de SOC sin desplegar infraestructura GPU pesada.
- Investigacion en arquitecturas de doble proceso: la exposicion del estado oculto y la compatibilidad con las cabezas del paper lo hacen util como banco de pruebas para System 1 / System 2.
- Inferencia en servidor con CUDA: las variantes fp32, fp16 y uint8 (que no caben en navegador) pueden ejecutarse con onnxruntime CUDA para cargas de mayor volumen.
- Comparacion de impacto de cuantizacion: la model card incluye metricas McNemar y porcentajes de respuestas alteradas por formato, util para estudios de cuantizacion en modelos especializados.

## Benchmarks y rendimiento

Resultados de "System 1" en el conjunto de prueba de decisiones (onnxruntime CUDA, token a token; el modelo original en PyTorch bf16 es la referencia):

| Archivo | Si/no (65) logits | Si/no (65) head | Multiple choice (57) logits | Multiple choice (57) head | Severidad (50) exacto logits | Severidad (50) exacto head | Respuestas alteradas vs original |
|---|---|---|---|---|---|---|---|
| Original (PyTorch bf16) | 54/65 | 54/65 | 39/57 | 46/57 | 20/50 | 26/50 | — |
| model_q4f16 | 53/65 | 54/65 | 38/57 | 46/57 | 19/50 | 24/50 | 16,3 % |
| model_q4 | 55/65 | 54/65 | 39/57 | 48/57 | 20/50 | 26/50 | 17,4 % |
| model_fp16 | 54/65 | 54/65 | 39/57 | 47/57 | 20/50 | 27/50 | 1,2 % |
| model (fp32) | 54/65 | 54/65 | 39/57 | 47/57 | 20/50 | 26/50 | 0,6 % |
| model_bnb4 | 55/65 | 55/65 | 44/57 | 47/57 | 20/50 | 30/50 | 12,2 % |
| model_quantized (q8) | 54/65 | 55/65 | 40/57 | 44/57 | 21/50 | 27/50 | 2,9 % |
| model_uint8 | 55/65 | 51/65 | 37/57 | 46/57 | 19/50 | 22/50 | 14,0 % |

La model card indica que ninguna diferencia de accuracy es estadisticamente significativa (0 de 70 tests pareados, McNemar, con correccion de Holm). Rendimiento en navegador (Chrome WebGPU, Apple M2 Pro, onnxruntime-web 1.30.0 via ct0-edge):

| Archivo | Tamano | Carga (Chrome) | Tiempo por decision (mediana) | Acuerdo con servidor |
|---|---|---|---|---|
| model_q4f16.onnx | 2,73 GB | 12,0 s | 15,4 s | 394/394 |
| model_q4.onnx | 3,03 GB | 12,3-34,1 s | 20,7 s | 394/394 |
| model_bnb4.onnx | 2,73 GB | 10,0-11,5 s | 29,5 s | 394/394 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Para navegador (WebGPU, limite de 4 GB): model_q4f16 (2,73 GB), model_q4 (3,03 GB) o model_bnb4 (2,73 GB). Verificado en Chrome con WebGPU sobre Apple M2 Pro.
- Para servidor: model.onnx fp32 ocupa 19,37 GB y model_fp16 8,42 GB, por lo que requieren GPU con memoria suficiente (del orden de 20 GB y 10 GB respectivamente); no hay estimaciones oficiales de VRAM mas alla de los tamanos de archivo.
- Las variantes q8/uint8 (4,85-4,91 GB) no caben en el limite de navegador y se midieron con onnxruntime CUDA (uint8 en CPU).
- No hay recomendaciones explicitas de GPU en la informacion disponible; por tamano de archivo, una GPU de gama datacenter (A100 o similar) cubriria fp32 y una consumer de 12-16 GB (RTX 4090) cubriria fp16 con holgura.
- Despliegue: onnxruntime-web 1.30.0 con WebGPU (Chrome) via ct0-edge, onnxruntime CUDA, Node.js. No se menciona soporte de vLLM, llama.cpp, Ollama o TGI para esta exportacion ONNX.
- Latencia: 15,4-29,5 s por decision en navegador (token a token); no hay datos de throughput.

## Comparativa con modelos similares

| Modelo | Formato | Tamano (cuantizado 4 bits) | Licencia | Ejecucion en navegador |
|---|---|---|---|---|
| alias3-micro-1026-ONNX-decode-only | ONNX (q4/q4f16/bnb4) | 2,73-3,03 GB | Apache 2.0 | Si (WebGPU, ct0-edge) |
| Variantes MLC del mismo autor (q4f32_1 / q4f16_1) | MLC | no disponible | Apache 2.0 | Si (MLC, WebGPU) |
| Variante LiteRT.js del mismo autor | LiteRT | no disponible | Apache 2.0 | Si (LiteRT.js) |

No hay informacion disponible para comparar con modelos de otras familias de tamano o tarea similar.

## Limitaciones y advertencias

- El modelo base esta etiquetado como "research preview" por Alias Robotics, lo que sugiere que no es una version estable para produccion.
- La cabeza de severidad (`head_score.bin`) es una prueba de concepto ajustada con solo 30 casos sinteticos; la propia model card advierte de que su uso como scorer de severidad requiere un conjunto etiquetado mayor e independiente.
- El conjunto de pruebas de decisiones (50-65 preguntas por modo) solo detecta perdidas grandes de accuracy; las diferencias individuales entre cuantizaciones no son estadisticamente significativas.
- Las cuantizaciones agresivas alteran entre el 12,2 % y el 17,4 % de las respuestas individuales frente al original (q4, q4f16, bnb4, uint8), aunque sin impacto significativo en accuracy agregada.
- La variante uint8 degrada la lectura via head.bin en si/no (51/65) y severidad exacta (22/50), marcada como no significativa pero inferior.
- No hay informacion sobre sesgos conocidos, riesgo de alucinacion, idiomas soportados ni longitud de contexto.
- El foco declarado es ciberseguridad; el comportamiento fuera de ese dominio no esta documentado.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar los terminos del modelo base "research preview".

## Enlaces

- Repositorio ONNX decode-only: https://huggingface.co/eduardoworrel/alias3-micro-1026-ONNX-decode-only
- Modelo base: https://huggingface.co/aliasrobotics/alias3-micro-1026
- Paper (arXiv:2610.16550): https://arxiv.org/abs/2610.16550
- Pointer networks (arXiv:1506.03134): https://arxiv.org/abs/1506.03134
- Variante ONNX transformers.js: https://huggingface.co/eduardoworrel/alias3-micro-1026-ONNX
- Variante ONNX GenAI: https://huggingface.co/eduardoworrel/alias3-micro-1026-ONNX-genai
- Variante MLC q4f32_1: https://huggingface.co/eduardoworrel/alias3-micro-1026-MLC-q4f32_1
- Variante MLC q4f16_1: https://huggingface.co/eduardoworrel/alias3-micro-1026-MLC-q4f16_1
- Variante LiteRT.js: https://huggingface.co/eduardoworrel/alias3-micro-1026-LiteRT
- Documentacion TypeSafe AI (lineage Jev / System One): https://docs.typesafe.ai
