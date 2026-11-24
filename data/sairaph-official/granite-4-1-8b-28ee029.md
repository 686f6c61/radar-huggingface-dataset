# sairaph-official/granite-4.1-8b-28ee029

## Resumen

Granite-4.1-8b-28ee029 es la conversión al formato LiteRT-LM (`.litertlm`) del modelo IBM Granite-4.1-8B, publicada por el usuario `sairaph-official` como espejo sin modificaciones del repositorio original `litert-community/granite-4.1-8b`. El modelo base es un transformer decoder-only denso de 8 791 592 960 parámetros (8,38 B sin la copia almacenada de la tabla de salida atada), diseñado por IBM para instrucciones de contexto largo, con alineamiento mediante aprendizaje por refuerzo orientado a tool calling, seguimiento de instrucciones y chat.

La relevancia de esta ficha concreta no está en el modelo base, sino en el empaquetado: los ficheros `.litertlm` permiten ejecutar el modelo en el runtime LiteRT-LM de Google, orientado a dispositivos edge y móviles, con grafos compuestos para GPU (delegado OpenCL en Android). Se distribuyen dos variantes, int8 (8,95 GB) e int4 (5,15 GB), con la tabla de embeddings en una sección separada y limitación de contexto a 4096 tokens en estos ficheros frente a los 128K del modelo original.

El modelo se publicó el 29 de abril de 2026 y esta conversión el 23 de noviembre de 2026. Es relevante para desarrolladores que quieran desplegar un modelo de 8B en hardware de consumo o móvil sin renunciar a una calidad razonable: en GSM8K (n=100) el fichero int4 obtiene 93 frente a 96 del bf16 original, con un 42,4 % menos de tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (GQA, RoPE, SwiGLU, RMSNorm, embeddings de entrada/salida atados) |
| Parametros totales | 8 791 592 960 en bf16 (8,38 B sin la copia atada de la tabla de salida) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K en el modelo base; 4096 tokens en los ficheros `.litertlm` de esta conversión |
| Tipos de cuantizacion | int8 dinámica en lineales con activaciones float; int4 blockwise-32 + OCTAV en lineales con embeddings int8 |
| Idiomas soportados | Doce idiomas según IBM (de inglés a chino); el listado completo no está disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); no se incluyen safetensors ni GGUF en este repositorio |

Detalles arquitectónicos adicionales: 40 capas, tamaño oculto 4096, 32 cabezas de atención con 8 cabezas KV, vocabulario de 100 352 tokens con embeddings atados.

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only denso con atención de consultas agrupadas (GQA), codificación posicional rotatoria (RoPE), activación SwiGLU, normalización RMSNorm y embeddings de entrada y salida atados. IBM lo describe como un finetune de Granite-4.1-8B-Base sobre conjuntos de datos de instrucciones abiertos y datos sintéticos recopilados internamente, con supervisión fina (SFT) y alineamiento mediante aprendizaje por refuerzo específicamente orientado a tool calling, seguimiento de instrucciones y chat.

La conversión a LiteRT-LM se realizó con litert-torch 0.9.4 y se probó con litert-lm 0.18.0. Los ficheros incluyen el grafo compuesto para GPU: las siete firmas del decoder se delegaron completamente en la GPU en un Mac Studio M4 Max y en una Galaxy S26 (1860, 1661 y 1693 operaciones en el delegado OpenCL). La tabla de embeddings ocupa una sección separada de 419 484 080 bytes; la sección principal de pesos es de 8 528 914 704 bytes en int8 y 4 731 041 056 bytes en int4, ambas por encima de los 2 GiB, lo que impide su uso en iOS según las notas de la conversión hermana de granite-4.1-3b.

## Capacidades

- Generación de texto y razonamiento de propósito general en un modelo de 8B parámetros.
- Seguimiento de instrucciones y conversación multi-turno (verificado con una conversación de tres turnos en ambos ficheros y backends).
- Tool calling y function calling, con alineamiento por RL específico según IBM.
- Capacidades multilingües: doce idiomas según la model card del modelo base.
- Razonamiento paso a paso y matemáticas (GSM8K con instrucción de pasos y línea final `#### <número>`).
- Ejecución en dispositivo (on-device) mediante el runtime LiteRT-LM con delegación GPU.
- No se menciona soporte de visión, audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Asistente conversacional en móvil Android: el fichero int4 decodifica a 5,3–5,4 tok/s en la GPU de una Galaxy S26, suficiente para respuestas cortas en una app nativa con LiteRT-LM; el int8 no es viable por tamaño de RAM.
- Prototipado en estación de trabajo Apple Silicon: en un Mac Studio M4 Max el int4 alcanza 58,3 tok/s en GPU, lo que permite iterar sobre prompts y evaluaciones localmente sin GPU dedicada.
- Tool calling en agentes ligeros: el alineamiento por RL del modelo base para function calling permite integrarlo en flujos de automatización donde el modelo decide qué herramienta invocar, con la ventaja de ejecutarse sin conexión.
- Procesamiento de documentos de hasta 4096 tokens en el dispositivo: resumen, extracción de campos o clasificación de correos y notas, aprovechando el contexto disponible en los ficheros convertidos.
- Evaluación comparativa de cuantizaciones: el par int8/int4 con métricas publicadas (GSM8K 95 vs 93, latencias en tres dispositivos) sirve como referencia para decidir el compromiso precisión/tamaño en despliegues edge.
- Educación y demos offline: ejecutar un modelo de 8B en hardware de consumo para talleres o demostraciones sin depender de APIs en la nube, con licencia Apache 2.0 que facilita la redistribución.
- Filtrado y generación de texto en pipelines de CI: el int8 en CPU de Mac (35,3 s para 1024 de prefill + 256 decodificados) permite tareas por lotes no interactivas en máquinas sin GPU.

## Benchmarks y rendimiento

GSM8K (n=100, instrucción paso a paso, greedy, máximo 1024 tokens de salida, proceso nuevo por pregunta):

| Variante | GSM8K (n=100) | Tamaño |
|---|---|---|
| bf16 (transformers) | 96 | — |
| int8 `.litertlm` (GPU Mac) | 95 | 8,95 GB |
| int4 `.litertlm` (GPU Mac) | 93 | 5,15 GB |

Tiempo para 1024 tokens de prefill más 256 tokens decodificados a contexto 2048:

| Configuración | Mac M4 Max | Galaxy S26 | Pixel 8a |
|---|---|---|---|
| int4 GPU | 5,81 s | 58,7 s y 59,6 s (dos ejecuciones) | detenido por la regla de memoria |
| int8 GPU | 6,98 s | no ejecutado | no ejecutado (fichero mayor que la RAM) |
| int8 CPU | 35,3 s | no ejecutado | no ejecutado |
| int4 CPU | 41,8 s | no ejecutado | no ejecutado |

Verificación de corrección: 8/8 preguntas en int8 (CPU y GPU), int4 (CPU y GPU) y bf16. Comprobación de longitud de prompt con 18 longitudes (18 a 60 tokens) correcta en ambos ficheros y backends. En salidas largas (hasta 512 tokens) ninguna respuesta repitió frases; dos de las ocho respuestas por fichero alcanzaron el tope de 512 tokens.

## Requisitos de hardware

- VRAM/RAM: el fichero int4 ocupa 5,15 GB y el int8 8,95 GB; se necesita al menos esa cantidad de memoria unificada o RAM más el overhead del runtime.
- GPU recomendadas: Apple Silicon (M4 Max medido), GPU móvil con delegado OpenCL (Galaxy S26 medido). No se han publicado pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: cabe en equipos con 8 GB o más de memoria unificada para int4; el int8 requiere 10 GB o más. En Android, el int8 no cabe en la RAM de un Pixel 8a.
- Despliegue: runtime LiteRT-LM (versión probada 0.18.0); no se mencionan vLLM, llama.cpp, Ollama ni TGI para estos ficheros.
- Latencia y throughput: 58,3 tok/s en GPU de Mac M4 Max (int4); 5,3–5,4 tok/s en GPU de Galaxy S26 (int4); int8 más rápido que int4 en CPU de Mac (prefill el doble de rápido).
- iOS: no soportado en la práctica porque las secciones de pesos superan los 2 GiB (7,94 GiB int8, 4,41 GiB int4).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K | Licencia | Formato |
|---|---|---|---|---|---|
| Granite-4.1-8B int4 (esta conversión) | 8,79 B | 4096 (128K en base) | 93 (n=100) | Apache 2.0 | `.litertlm` |
| Granite-4.1-8B int8 (esta conversión) | 8,79 B | 4096 (128K en base) | 95 (n=100) | Apache 2.0 | `.litertlm` |
| Granite-4.1-8B bf16 (modelo base) | 8,79 B | 128K | 96 (n=100) | Apache 2.0 | safetensors (no incluido aquí) |
| Granite-4.1-3B (conversión hermana LiteRT-LM) | no disponible | no disponible | no disponible | Apache 2.0 | `.litertlm` |

No se dispone de datos de benchmarks de otros modelos comparables (Llama, Qwen, Gemma en formato edge) en la información proporcionada, por lo que la comparativa se limita a las variantes del propio Granite-4.1-8B y a la conversión hermana de 3B.

## Limitaciones y advertencias

- Contexto reducido a 4096 tokens en estos ficheros, muy por debajo de los 128K del modelo base; no sirve para tareas de contexto largo.
- El fichero int4 pierde 3 puntos en GSM8K frente a bf16 (93 vs 96) y 2 frente a int8 (95); evaluar el impacto en la tarea concreta antes de producción.
- No es ejecutable en iOS por el tamaño de las secciones de pesos (>2 GiB); el int8 tampoco cabe en la RAM de un Pixel 8a.
- En CPU de Mac el int4 es más lento que el int8 en prefill (41,8 s vs 35,3 s para la carga medida); elegir la variante según el backend.
- Riesgo de alucinación inherente a un modelo de 8B; no se han publicado evaluaciones de sesgo en la información disponible.
- El repositorio es un espejo de terceros (`sairaph-official`) sin model card propia más allá de la copia del upstream; la licencia Apache 2.0 se añadió manualmente y procede de la declaración del modelo base.
- Solo se ha verificado el funcionamiento con litert-lm 0.18.0; otras versiones del runtime pueden no ser compatibles.
- Los idiomas exactos soportados no están listados en la información disponible, solo el número (doce).

## Enlaces

- Repositorio de esta conversión: https://huggingface.co/sairaph-official/granite-4.1-8b-28ee029
- Repositorio upstream de la conversión: https://huggingface.co/litert-community/granite-4.1-8b
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-8b
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Scripts de conversión y verificación: https://github.com/john-rocky/hf-to-litertlm
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Conversión hermana de 3B: https://huggingface.co/litert-community/granite-4.1-3b
