# KRAFTON/Raon-1-mini-preview-gguf

## Resumen

Raon-1 mini es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado desde cero por KRAFTON AI, la división de inteligencia artificial de la editora surcoreana de videojuegos KRAFTON. El modelo combina 28.800 millones de parámetros totales con solo 4.300 millones activos por token, lo que permite un equilibrio entre capacidad y coste de inferencia. Está diseñado específicamente para destacar en conversación en coreano y en tareas agénticas, e incorpora razonamiento integrado mediante un modo de pensamiento (thinking).

La arquitectura es híbrida: de sus 25 capas, 18 utilizan Raon Delta Attention (RDA), una atención lineal con estado de tamaño fijo, y 7 emplean Gated MLA (Multi-head Latent Attention) con caché KV. Esta combinación reduce drásticamente el coste de memoria en contextos largos, ya que solo las capas MLA mantienen caché KV (aproximadamente 8 KiB por token en BF16). El modelo soporta de forma nativa hasta 262.144 tokens de contexto y no utiliza codificación posicional (NoPE).

Esta ficha corresponde a la versión GGUF del modelo, publicada para su uso con llama.cpp. Los ficheros GGUF se convirtieron desde los pesos BF16 del mismo checkpoint, y las cuantizaciones Q6_K e inferiores se generaron con una matriz de importancia (imatrix). Es una versión preview, no definitiva, por lo que las especificaciones y resultados pueden cambiar antes de la versión final. La licencia es Apache 2.0, aunque el acceso al repositorio requiere solicitud previa (gated).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (RDA + Gated MLA), transformer con atención lineal y MLA |
| Parametros totales | 28,8 B (28.783.218.602) |
| Parametros activos | 4,3 B (6 expertos enrutados + 1 compartido de 128) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF (Q6_K e inferiores con imatrix; el repo base ofrece MXFP8 y NVFP4) |
| Idiomas soportados | Coreano e inglés (según model card); lista completa no disponible |
| Licencia | Apache 2.0 (acceso bajo solicitud) |
| Formato de pesos | GGUF (repo base en BF16/MXFP8/NVFP4) |

## Arquitectura y entrenamiento

Raon-1 mini emplea una arquitectura MoE híbrida de 25 capas con un tamaño oculto de 2.560 y 40 cabezas de atención. La innovación principal es Raon Delta Attention (RDA), que desacopla las puertas de borrado y escritura de Kimi Delta Attention (KDA) para mejorar el rendimiento en contexto largo. Dieciocho de las 25 capas son RDA con estado de tamaño fijo y solo las 7 capas Gated MLA mantienen caché KV. Las conexiones residuales usan Raon-mHC, una variante optimizada de las manifold-constrained hyper-connections de DeepSeek que reduce el coste computacional y acelera el entrenamiento. La activación es SiTU-GLU, el vocabulario es de 259.840 tokens y el LM head no está atado (untied). No se usa codificación posicional (NoPE).

El modelo fue entrenado desde cero por KRAFTON AI. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Se proporciona un modelo draft DFlash2 (KRAFTON/Raon-1-mini-preview-dflash2) para decodificación especulativa acelerada. Los pesos del repositorio principal almacenan los expertos enrutados en MXFP8; los GGUF se convirtieron desde BF16 y las cuantizaciones Q6_K e inferiores se generaron con imatrix.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento (thinking) integrado.
- Razonamiento matemático y científico, con resultados destacados en los benchmarks de matemáticas y ciencia mostrados por el autor.
- Seguimiento de instrucciones y tareas de búsqueda, donde lidera según la model card frente a los modelos de comparación.
- Capacidad conversacional fuerte en coreano y sólida en inglés.
- Tool calling para flujos de trabajo agénticos, con soporte declarado para Hermes Agent, Pi y OpenCode.
- Decodificación especulativa mediante el modelo draft DFlash2.
- Contexto largo nativo de hasta 262.144 tokens.
- Capacidades multilingües limitadas a coreano e inglés según la documentación; no se detallan otros idiomas.

## Casos de uso

- Asistencia conversacional en coreano: el modelo está entrenado específicamente para conversación en coreano, lo que lo hace adecuado para atención al cliente o asistentes virtuales dirigidos al mercado surcoreano, con contexto de hasta 262.144 tokens para conversaciones multi-turno prolongadas.
- Agentes autónomos con tool calling: su soporte para Hermes Agent, Pi y OpenCode permite integrarlo en pipelines agénticos que requieren invocar herramientas externas, APIs o funciones de forma iterativa.
- Razonamiento matemático y científico: el modo de pensamiento integrado y sus resultados en benchmarks de matemáticas y ciencia lo hacen útil para tutoría, resolución de problemas técnicos o generación de explicaciones paso a paso.
- Procesamiento de documentos largos: gracias a los 262.144 tokens de contexto, puede resumir, extraer información o responder preguntas sobre informes extensos, contratos o bases de código completas en una sola pasada.
- Inferencia local en hardware de consumo: la cuantización NVFP4 del repo base permite ejecución en una única NVIDIA RTX 5090 (32 GB de VRAM), y los GGUF permiten despliegue en llama.cpp sobre GPUs consumer y CPU.
- Búsqueda aumentada y seguimiento de instrucciones: su rendimiento destacado en tareas de búsqueda e instrucciones lo hace apto para sistemas RAG que requieren seguir formatos estrictos y citar fuentes.
- Generación de código asistida: aunque no se detallan benchmarks de código, el soporte de tool calling y el contexto largo permiten su uso en asistentes de programación que necesitan analizar repositorios completos.

## Benchmarks y rendimiento

La model card incluye gráficos de resultados de benchmarks (matemáticas, ciencia, seguimiento de instrucciones y búsqueda) frente a modelos abiertos de comparación, pero los valores numéricos no están disponibles en el texto extraído. No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 28,8 B de parámetros totales y 4,3 B activos, una cuantización Q4_K_M requeriría aproximadamente 17-18 GB de VRAM; Q6_K en torno a 24-25 GB; Q8_0 cerca de 30 GB. Estas cifras son estimaciones basadas en el tamaño del modelo, no datos oficiales.
- GPU recomendadas: NVIDIA RTX 5090 (32 GB) para NVFP4 según la model card; A100 40/80 GB, H100 o RTX 4090 (24 GB) para cuantizaciones intermedias en GGUF.
- Cabe en GPU consumer: sí, en RTX 5090 con NVFP4 y en GPUs de 24 GB con cuantizaciones Q4 o inferiores. Para Q6_K se recomienda al menos 32 GB.
- Opciones de despliegue: llama.cpp (formato nativo de este repo), Ollama (a partir de los GGUF), vLLM y TGI para los formatos del repo base (BF16/MXFP8/NVFP4), y endpoints compatibles según los tags del repositorio.
- Latencia y throughput: no disponibles. El modelo incluye un draft DFlash2 para decodificación especulativa, que según el autor acelera la inferencia, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Raon-1 mini preview | 28,8 B / 4,3 B | 262.144 | Apache 2.0 (gated) | GGUF, MXFP8, NVFP4, BF16 |
| Modelos de comparación de la model card | no disponible | no disponible | no disponible | no disponible |

La model card menciona comparaciones frente a "modelos abiertos" en los gráficos de benchmarks (matemáticas, ciencia, instrucciones y búsqueda), pero no se identifican por nombre ni se aportan cifras en la información disponible. No se dispone de datos suficientes para una comparativa numérica con alternativas concretas.

## Limitaciones y advertencias

- Es una versión preview, no definitiva: las especificaciones y resultados pueden cambiar antes de la versión final.
- El acceso al repositorio está restringido (gated): es necesario solicitar acceso y aceptar la licencia Apache 2.0.
- Idiomas limitados: la documentación solo garantiza coreano e inglés; el rendimiento en castellano u otros idiomas no está verificado.
- Riesgo de alucinación: no se documentan medidas específicas de mitigación ni tasas de error.
- Sesgos conocidos: no se documentan en la model card.
- El modo de pensamiento puede incrementar la latencia y el consumo de tokens en producción si no se controla.
- La licencia Apache 2.0 permite uso comercial, pero el acceso gated añade un paso administrativo previo.
- Las cifras de VRAM de esta ficha son estimaciones; no se publican requisitos oficiales de hardware para los GGUF.

## Enlaces

- Repositorio GGUF: https://huggingface.co/KRAFTON/Raon-1-mini-preview-gguf
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini-preview
- Modelo draft DFlash2: https://huggingface.co/KRAFTON/Raon-1-mini-preview-dflash2
- Nueva versión GGUF: https://huggingface.co/KRAFTON/Raon-1-mini-gguf
- Playground: https://raon-console.krafton.ai/playground/guest
- Página de KRAFTON AI: https://krafton.ai/en/
- Perfil de Hugging Face de KRAFTON: https://huggingface.co/KRAFTON
- X (Twitter) de KRAFTON AI: https://x.com/Krafton_AI
- Discord de la comunidad: https://discord.gg/sDG7mmZPnc
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
