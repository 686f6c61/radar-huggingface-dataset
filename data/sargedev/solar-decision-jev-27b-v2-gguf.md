# SargeDev/Solar-Decision-JEV-27B-V2-GGUF

## Resumen

Solar-Decision-JEV-27B-V2-GGUF es la escalera de cuantizaciones GGUF del modelo Solar-Decision-JEV-27B-V2, un modelo de texto de 27.320.697.856 parámetros publicado por SargeDev. Se trata de un merge ("V2 r32 + solar-1894") construido sobre un backbone Qwen3.8-27B abliterado por huihui-ai, al que se le ha aplicado la receta de LoRA de decisión r16/r32 y una cabeza de decisión de 24 slots desarrollada por AutoTrust AI. El modelo está especializado en dos tareas: conversación general sin censura y generación de decisiones tipadas y calibradas (typed decisions), esta última entrenada con etiquetas calibradas del corpus solar-decisions-corpus-v4, etiquetado con upstage/solar-decide-flash.

La relevancia de esta ficha radica en que es la versión cuantizada pensada para ejecución local con llama.cpp: conserva los tensores del drafter MTP/nextn (866 tensores `blk.64.nextn.*` por cuantización) para que funcione la decodificación especulativa. Sin embargo, el propio autor advierte de dos limitaciones importantes: el merge V2 midió por debajo de su padre r32 en las celdas de decisión (choice top-1 de 0.828 frente a 0.869), y llama.cpp no puede servir decisiones tipadas con esta build porque no devuelve logprobs por token en los endpoints de completion. En consecuencia, los GGUF se recomiendan para chat cotidiano rápido, mientras que para decisiones tipadas calibradas hay que usar los repos bf16 con vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.8-27B, con cabeza de decisión de 24 slots y drafter MTP/nextn para decodificación especulativa |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_XS, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (y export f16 con tensores nextn) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (modelo base en safetensors/bf16 en el repo SargeDev/Solar-Decision-JEV-27B-V2) |

## Arquitectura y entrenamiento

El modelo es un merge de dos componentes sobre un mismo backbone: por un lado, la receta de LoRA de decisión r16/r32 de AutoTrust AI con su cabeza de decisión de 24 slots verbales; por otro, el componente "solar-1894", entrenado sobre el corpus SargeDev/solar-decisions-corpus-v4, cuyas etiquetas de decisión tipada calibrada fueron generadas por upstage/solar-decide-flash. El corpus de preguntas y estados procede de SargeDev/jev-distill-corpus-v3. El backbone es un Qwen3.8-27B abliterado (versión sin restricciones de alineación) de huihui-ai. El entrenamiento se realizó en 2× NVIDIA GB10 (DGX Spark).

La exportación GGUF preserva los tensores del drafter MTP/nextn (`blk.64.nextn.*`, 866 tensores por cuantización), lo que permite decodificación especulativa en llama.cpp. El template de chat incluye un modo de razonamiento que debe desactivarse explícitamente con `enable_thinking: false` para que la traza de razonamiento no se emita en la respuesta final.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, uso conversacional).
- Decisiones tipadas calibradas mediante cabeza de 24 verbalizadores: solo funciona con el repo bf16 en vLLM, no con estos GGUF en llama.cpp.
- Decodificación especulativa (MTP/nextn) soportada en llama.cpp gracias a los tensores nextn preservados.
- Modo de razonamiento (thinking) integrado en el template de chat, desactivable con `enable_thinking: false`.
- Modelo sin censura (abliterado): responde sin las restricciones de alineación del backbone original.
- Soporte de tool calling: no disponible (no se menciona en la documentación).
- Capacidades multilingues: no disponible.

## Casos de uso

- Chat asistente local sin censura: con Q4_K_M (15,65 GiB) cabe en una GPU de gama alta y permite conversación cotidiana rápida con llama-server, sin filtros de alineación del backbone original.
- Prototipado de sistemas de decisión conversacionales: al conservar la arquitectura de decisión de 24 slots, sirve para explorar la interfaz de decisión tipada antes de desplegar la variante bf16 calibrada en vLLM.
- Evaluación comparativa de cuantizaciones: la escalera completa (Q2_K a Q8_0) permite medir el compromiso entre calidad y VRAM en hardware propio, con benchmarks de referencia en Q4_K_M y Q8_0.
- Pruebas de decodificación especulativa: los tensores MTP/nextn incluidos permiten validar el rendimiento del drafter en llama.cpp sobre un modelo de 27B.
- Servicios de chat de baja latencia en edge/local: en un GB10 el autor mide 868,90 tok/s de prefill (pp512) y 12,62 tok/s de decode (tg128) con Q4_K_M, adecuado para chat interactivo monousuario.
- Investigación sobre destilación de decisiones: los corpora jev-distill-corpus-v3 y solar-decisions-corpus-v4 son públicos, lo que permite reproducir o extender el entrenamiento.

## Benchmarks y rendimiento

Datos de benchmarks de calidad publicados: no se han publicado resultados de benchmarks en la información disponible (el autor indica que las métricas de decision-gate están en la model card del repo bf16, con un dato citado: choice top-1 de 0.828 para V2 frente a 0.869 de su padre r32).

Benchmarks de rendimiento en llama.cpp (GB10, build CUDA, `-ngl 99`, pp512/tg128, 2 repeticiones):

| Cuantizacion | Tamano | Prefill pp512 (tok/s) | Decode tg128 (tok/s) |
|---|---|---|---|
| Q4_K_M | 15,65 GiB | 868,90 | 12,62 |
| Q8_0 | 27,04 GiB | 813,85 | 8,25 |

El resto de la escalera se publica sin benchmark; el autor indica que el decode escala aproximadamente de forma inversa al tamaño de la cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): Q2_K ≈ 10,12 GiB; Q3_K_S ≈ 11,41 GiB; Q3_K_M ≈ 12,57 GiB; Q3_K_L ≈ 13,56 GiB; IQ4_XS ≈ 14,35 GiB; Q4_K_S ≈ 14,74 GiB; Q4_K_M ≈ 15,65 GiB; Q5_K_S ≈ 17,67 GiB; Q5_K_M ≈ 18,19 GiB; Q6_K ≈ 20,89 GiB; Q8_0 ≈ 27,04 GiB. Añadir margen para el KV cache según la longitud de contexto.
- GPU recomendadas: el benchmark de referencia se realizó en NVIDIA GB10 (DGX Spark). Para el resto de configuraciones no hay medidas publicadas; una RTX 4090 (24 GB) acomoda hasta Q6_K, y una RTX 3090/4090 cubre cómodamente Q4_K_M y Q5_K_M.
- Cabe en GPU de consumo: sí. Q4_K_M (15,65 GiB) cabe en GPUs de 16-24 GB; Q8_0 requiere ~27 GiB, por lo que necesita 32 GB (RTX 5090, A100 parcial, o descarga parcial de capas a CPU).
- Despliegue: llama.cpp / llama-server (librería nativa de este repo). Ejemplo del autor: `llama-server -m Solar-Decision-JEV-27B-V2-Q4_K_M.gguf -ngl 99 --jinja --chat-template-kwargs '{"enable_thinking": false}' --alias solar-jev-27b-v2`. Ollama y LM Studio deberían funcionar al ser GGUF estándar, aunque no se menciona soporte explícito. Para decisiones tipadas calibradas, usar el repo bf16 con vLLM.
- Latencia y throughput: en GB10, Q4_K_M rinde 868,90 tok/s de prefill y 12,62 tok/s de decode; Q8_0, 813,85 y 8,25 tok/s respectivamente.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Especializacion | Licencia | Notas |
|---|---|---|---|---|---|
| Solar-Decision-JEV-27B-V2-GGUF | 27,32 B | GGUF | Chat sin censura + decisiones tipadas (estas últimas solo en bf16/vLLM) | Apache-2.0 | Merge V2; choice top-1 0.828 |
| SargeDev/Solar-Decision-JEV-27B-V2 (bf16) | 27,32 B | safetensors bf16 | Decisiones tipadas calibradas en vLLM | Apache-2.0 | Padre r32 del merge; choice top-1 0.869, superior en celdas de decisión |
| autotrust/JEV-27B | 27 B (base Qwen3.8-27B) | no disponible | Receta de decisión r16/r32 con cabeza de 24 slots | no disponible | Origen de la maquinaria de decisión del modelo |
| huihui-ai Qwen3.8-27B abliterated | 27 B | no disponible | Chat sin censura general | no disponible | Backbone original sin la especialización de decisión |

## Limitaciones y advertencias

- Rendimiento de decisión degradado: el merge V2 midió por debajo de su padre r32 en las celdas de decisión (choice top-1 0.828 frente a 0.869). Para decisiones tipadas de máxima calidad, usar el repo bf16.
- Incompatible con decisiones tipadas en llama.cpp: esta build no devuelve logprobs por token en los endpoints de completion, y el camino de decisión requiere los logprobs de los 24 verbalizadores. Los GGUF solo sirven para chat.
- Alucinaciones: no hay datos publicados sobre tasas de alucinación; al ser un modelo abliterado sin alineación, el riesgo de respuestas incorrectas presentadas con confianza es mayor que en modelos alineados.
- Contenido sin censura: al ser un modelo "uncensored", puede generar contenido que otros modelos rechazarían. Su uso conlleva responsabilidad legal y ética para el desplegador, especialmente en producción o atención a usuarios finales.
- Template de chat: si no se pasa `enable_thinking: false` vía `--chat-template-kwargs`, el template emite la traza de razonamiento dentro de la respuesta, contaminando la salida.
- Benchmarks incompletos: solo Q4_K_M y Q8_0 están medidos; el resto de la escalera se publica sin verificar.
- Idiomas soportados y longitud de contexto: no disponibles en la documentación.
- Licencia: Apache-2.0, sin restricciones para uso comercial, pero hay que revisar los términos de los corpora de entrenamiento y del etiquetador upstream (upstage/solar-decide-flash) si se reentrena.

## Enlaces

- Repositorio GGUF: https://huggingface.co/SargeDev/Solar-Decision-JEV-27B-V2-GGUF
- Modelo base bf16: https://huggingface.co/SargeDev/Solar-Decision-JEV-27B-V2
- Receta de decisión de AutoTrust AI: https://huggingface.co/autotrust/JEV-27B
- Corpus jev-distill-corpus-v3: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Corpus solar-decisions-corpus-v4: https://huggingface.co/datasets/SargeDev/solar-decisions-corpus-v4
- Paper, blog o demo: no disponible
