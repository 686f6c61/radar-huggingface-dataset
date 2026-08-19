# mradermacher/grug-v1.1-qwen-3.8-27b-mtp-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF con matriz de importancia (imatrix) del modelo ProCreations/grug-v1.1-qwen-3.8-27b-mtp, un fine-tuning conversacional de Qwen3.8-27B, un transformer de 27.320 millones de parámetros con soporte de predicción multi-token (MTP). El autor, mradermacher, es conocido por publicar cuantizaciones optimizadas para ejecución local con llama.cpp, Ollama y otras herramientas compatibles con GGUF.

La relevancia de este modelo radica en que permite ejecutar un LLM de 27B parámetros en hardware de consumo (GPUs con 12-24 GB de VRAM o incluso solo CPU con suficiente RAM) gracias a las cuantizaciones de baja precisión. El contexto nativo del modelo base es de 262.144 tokens, lo que lo hace adecuado para tareas que requieren ventanas de contexto muy largas, como análisis de documentos extensos o conversaciones multi-turno complejas. Al ser una cuantización, el rendimiento y las capacidades se mantienen cercanos al modelo original, aunque con una ligera degradación según el nivel de cuantización elegido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Multi-Token Prediction (MTP) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (según modelo base Qwen3.8-27B) |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo base Qwen3.8-27B es Apache 2.0) |
| Formato de pesos | GGUF (safetensors para el modelo original) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 27.320 millones de parámetros, derivado de Qwen3.8-27B. La característica distintiva es el uso de Multi-Token Prediction (MTP), una técnica que permite predecir varios tokens futuros simultáneamente, lo que habilita la decodificación especulativa y acelera la inferencia. El fine-tuning "grug-v1.1" está orientado a conversación, con un estilo de respuesta particular (el nombre "grug" hace referencia a un personaje de internet con lenguaje simplificado). No se dispone de información detallada sobre el dataset de entrenamiento ni sobre el uso de técnicas como RLHF o DPO.

Las cuantizaciones de este repositorio se generaron con el método imatrix (importance matrix), que optimiza la asignación de bits según la importancia de cada tensor, mejorando la calidad en cuantizaciones de baja precisión. El repositorio incluye múltiples niveles de cuantización, desde 1-bit (IQ1_S) hasta 6-bit (Q6_K), permitiendo elegir entre tamaño y fidelidad.

## Capacidades

- Generación de texto conversacional con un estilo distintivo ("grug"), aunque puede adaptarse a instrucciones generales.
- Soporte de ventanas de contexto muy largas (hasta 262.144 tokens), útil para documentos extensos o historiales de chat largos.
- Decodificación especulativa nativa gracias a MTP, lo que reduce la latencia en entornos compatibles (llama.cpp con soporte MTP, vLLM, etc.).
- Capacidades multilingües heredadas del modelo base Qwen3.8-27B, aunque no se especifican los idiomas exactos en este repositorio.
- Posible soporte de tool calling y function calling si el fine-tuning lo conserva del modelo base, pero no se confirma en la documentación disponible.
- Compatible con formatos GGUF, lo que permite su uso en llama.cpp, Ollama, LM Studio y otros motores de inferencia locales.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse en una máquina sin conexión a internet para mantener conversaciones con contexto largo, gracias a su ventana de 262k tokens y su naturaleza conversacional.
- Análisis de documentos extensos: con la ventana de contexto amplia, es posible procesar contratos, informes o libros completos en una sola pasada, resumiendo o extrayendo información.
- Generación de código con contexto de proyecto: aunque no se confirma su capacidad de código, el modelo base Qwen3.8-27B tiene buen rendimiento en tareas de programación; el fine-tuning podría conservarlo. Se puede usar para autocompletar o refactorizar código en repositorios grandes.
- Chatbot de atención al cliente: al ser un modelo conversacional, puede gestionar interacciones multi-turno con usuarios, manteniendo el historial completo dentro de la ventana de contexto.
- Prototipado de agentes con razonamiento multi-paso: si el modelo conserva las capacidades de tool calling del base, puede integrarse en frameworks de agentes para tareas como búsqueda web o ejecución de comandos.
- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones de 2-4 bits, se puede ejecutar en una GPU de 12 GB o incluso en CPU con 16 GB de RAM, lo que lo hace viable para desarrollo y pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de rendimiento del modelo cuantizado. Para referencia, el modelo base Qwen3.8-27B reporta en otras fuentes resultados competitivos en tareas de razonamiento y código, pero estos datos no están verificados para este fine-tuning específico.

## Requisitos de hardware

- Tamaño de los archivos GGUF (estimado según el blog de ofox.ai para Qwen3.8-27B): ~9 GB en cuantización 2-bit, ~17 GB en 4-bit. El tamaño real de este repo es de 39.5 GB, que incluye todas las cuantizaciones.
- Para inferencia con cuantización Q4_K_M (17 GB), se recomienda una GPU con al menos 20 GB de VRAM (por ejemplo, RTX 4090 24 GB, A100 40 GB) o usar offloading a CPU con 32 GB de RAM.
- Para cuantizaciones de 2-3 bits (~9-12 GB), una GPU de 16 GB (RTX 4080, RTX 3090) es suficiente, o incluso una de 12 GB con offloading.
- Es posible ejecutar el modelo en CPU pura con llama.cpp, usando RAM en lugar de VRAM, con velocidades de 1-3 tokens/s según el hardware.
- Motores de inferencia compatibles: llama.cpp (con soporte MTP), Ollama, LM Studio, vLLM (con parche para MTP), TGI (si soporta GGUF).
- El repositorio GitHub vskrch/qwen3.8-gguf-deploy ofrece un despliegue optimizado con decodificación especulativa MTP, bloqueo de frecuencia de CPU y gestión de memoria, pensado para producción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| grug-v1.1-qwen-3.8-27b-mtp (este) | 27,3 B | 262k | no disponible | GGUF | Fine-tuning conversacional con MTP |
| Qwen3.8-27B (base) | 27,3 B | 262k | Apache 2.0 | Safetensors/GGUF | Modelo base, sin fine-tuning conversacional |
| Qwen3.8-27B-Heretic (fine-tuning) | 27,3 B | 262k | no disponible | GGUF | Otro fine-tuning del mismo autor, orientado a rolplay |

La comparativa se basa en información pública; no se dispone de benchmarks para comparar rendimiento real entre estos modelos.

## Limitaciones y advertencias

- La licencia no está especificada en el repositorio, lo que genera incertidumbre legal para uso comercial. Aunque el modelo base es Apache 2.0, el fine-tuning podría tener restricciones adicionales.
- Al ser una cuantización, hay una pérdida de calidad proporcional al nivel de compresión. Las cuantizaciones de 1-2 bits pueden degradar significativamente la coherencia y el razonamiento.
- No se dispone de información sobre sesgos o alucinaciones específicos de este fine-tuning. Como modelo de lenguaje, puede generar contenido falso o sesgado.
- El estilo "grug" del fine-tuning puede no ser apropiado para todos los casos de uso; si se necesita un tono formal, habría que ajustar las instrucciones.
- La ventana de contexto de 262k tokens es teórica; en la práctica, el rendimiento puede degradarse con contextos muy largos y el consumo de memoria aumenta proporcionalmente.
- No se han publicado resultados de benchmarks, por lo que el rendimiento real en tareas específicas es desconocido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/grug-v1.1-qwen-3.8-27b-mtp-i1-GGUF
- Modelo original (fine-tuning): https://huggingface.co/ProCreations/grug-v1.1-qwen-3.8-27b-mtp
- Guía de despliegue local de Qwen3.8-27B: https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Análisis de VRAM y tamaños GGUF: https://ofox.ai/blog/qwen-3-8-27b-run-locally-vram-gguf-2026/
- Repositorio de despliegue optimizado con MTP: https://github.com/vskrch/qwen3.8-gguf-deploy
