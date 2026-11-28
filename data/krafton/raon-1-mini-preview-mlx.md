# KRAFTON/Raon-1-mini-preview-mlx

## Resumen

Raon-1 mini preview es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado desde cero por KRAFTON AI, el brazo de inteligencia artificial de la editora surcoreana de videojuegos KRAFTON. Este repositorio concreto (`KRAFTON/Raon-1-mini-preview-mlx`) contiene los pesos del modelo base convertidos a MLX y cuantizados en formato NVFP4, pensados para ejecución en Apple Silicon. El modelo base cuenta con 28.800 millones de parámetros totales, de los cuales se activan 4.300 millones por token, y una ventana de contexto nativa de 262.144 tokens.

El modelo destaca por su arquitectura híbrida de atención: 18 de sus 25 capas emplean Raon Delta Attention (RDA), una variante de Kimi Delta Attention que desacopla las compuertas de borrado y escritura, mientras que las 7 restantes usan Gated MLA con caché KV. Esta combinación reduce drásticamente el coste de memoria en contextos largos (solo las capas MLA mantienen caché KV, unos 8 KiB por token en BF16). Además, incorpora innovaciones propias como Raon-mHC para conexiones residuales multicanal y soporte de decodificación especulativa mediante un modelo draft DFlash2.

Es relevante ahora porque ofrece capacidades de razonamiento con modo thinking, tool calling para flujos agénticos y un rendimiento destacado en coreano e inglés, todo bajo licencia Apache 2.0. No obstante, se trata de una versión preview: el propio autor advierte de que las especificaciones y resultados pueden cambiar antes de la versión final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (transformer con atención híbrida RDA + Gated MLA) |
| Parametros totales | 28,8 B |
| Parametros activos | 4,3 B (6 expertos enrutados + 1 compartido de 128) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (este repositorio MLX); el modelo base ofrece MXFP8 y NVFP4 |
| Idiomas soportados | Coreano e inglés (según la model card; no se detalla lista completa) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX), cuantizado NVFP4 |

## Arquitectura y entrenamiento

Raon-1 mini emplea una arquitectura MoE híbrida de 25 capas con un tamaño oculto de 2.560 y 40 cabezas de atención. La disposición de atención es híbrida en proporción 3:1 entre Raon Delta Attention (RDA) y Gated MLA. RDA decoupla las compuertas de borrado y escritura de Kimi Delta Attention, lo que según el autor mejora el rendimiento en contexto largo respecto a KDA. Solo las 7 capas MLA mantienen caché KV (aproximadamente 8 KiB por token en BF16), mientras que las 18 capas RDA operan con estado de tamaño fijo. El modelo usa codificación posicional NoPE (sin codificación posicional explícita) y función de activación SiTU-GLU. La capa densa inicial tiene un FFN de 12.032 de dimensión intermedia, y cada experto tiene 1.088. El vocabulario es de 259.840 tokens con LM head no atada (untied). Incorpora Raon-mHC con 4 streams como conexión residual, una optimización de las manifold-constrained hyper-connections de DeepSeek orientada a reducir coste computacional y acelerar el entrenamiento.

El modelo fue entrenado desde cero por KRAFTON AI. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Sí se menciona soporte de decodificación especulativa mediante un modelo draft DFlash2, y que el modelo base se distribuye también en MXFP8 y NVFP4.

## Capacidades

- Generación de texto conversacional y razonamiento con modo thinking integrado.
- Razonamiento matemático y científico (el autor reporta resultados líderes en los benchmarks de matemáticas y ciencia incluidos en su comparativa).
- Seguimiento de instrucciones y tareas de búsqueda (search), donde el autor lo sitúa por delante de los modelos de comparación.
- Tool calling para flujos agénticos, con soporte declarado para Hermes Agent, Pi y OpenCode.
- Capacidades multilingües centradas en coreano (rendimiento fuerte) e inglés (sólido).
- Decodificación especulativa acelerada mediante el draft model DFlash2.
- Contexto largo nativo de hasta 262.144 tokens.
- No se declaran capacidades de visión ni de audio en la información disponible.

## Casos de uso

- Asistencia conversacional en coreano: el modelo está entrenado específicamente para conversación en coreano, por lo que encaja en productos de atención al cliente o asistentes dirigidos al mercado surcoreano, con contexto largo para mantener historiales extensos.
- Flujos agénticos con tool calling: integrable en frameworks como Hermes Agent u OpenCode para tareas multi-paso que requieran invocar herramientas externas (APIs, búsqueda, ejecución de código).
- Razonamiento matemático y científico: el modo thinking integrado permite usarlo en entornos educativos o de investigación para resolver problemas que requieren cadenas de razonamiento largas.
- Procesamiento de documentos extensos: con 262.144 tokens de contexto y un coste de caché KV reducido gracias a las capas RDA, es adecuado para analizar contratos, informes o bases de código completas en una sola pasada.
- Inferencia local en Apple Silicon: esta variante MLX en NVFP4 permite ejecutar el modelo en equipos Mac con memoria unificada, útil para desarrollo, prototipado y entornos sin GPU NVIDIA.
- Tareas de búsqueda aumentada (search): el autor lo sitúa como líder en benchmarks de búsqueda frente a sus comparables, lo que lo hace apto para pipelines de retrieval + generación.
- Despliegue en una sola RTX 5090: la versión NVFP4 del modelo base cabe en 32 GB de VRAM, lo que habilita prototipos de agentes en estaciones de trabajo con una única GPU consumer de gama alta.

## Benchmarks y rendimiento

La model card incluye gráficas de resultados comparativos (benchmark-results.svg) frente a modelos abiertos, pero los valores numéricos no están disponibles en el texto proporcionado; solo se indica que el modelo lidera en matemáticas, ciencia, seguimiento de instrucciones y búsqueda según la comparativa del autor, evaluada con un juez/simulador de usuario basado en gpt-5.6-luna. No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio MLX ocupa 18,7 GB en disco en NVFP4, por lo que la inferencia requiere aproximadamente esa cantidad de memoria unificada en Apple Silicon. La versión NVFP4 del modelo base está pensada para caber en una NVIDIA RTX 5090 de 32 GB.
- GPU recomendadas: RTX 5090 (32 GB) para la variante NVFP4; Apple Silicon con memoria unificada suficiente para esta variante MLX. No se detallan requisitos para A100/H100 en la información disponible.
- Cabe en GPU consumer: sí, en RTX 5090 según el autor; en Apple Silicon, en función de la memoria unificada del equipo.
- Opciones de despliegue: MLX (esta variante); el modelo base admite NVFP4 y MXFP8, con soporte de decodificación especulativa vía DFlash2. No se detallan otros motores (vLLM, llama.cpp, Ollama, TGI) en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La model card menciona comparaciones frente a "modelos abiertos" en sus gráficas, pero no identifica los modelos concretos ni aporta cifras en el texto disponible. Por tanto, la comparativa numérica no está disponible.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia |
|---|---|---|---|---|
| Raon-1 mini preview | 28,8 B | 4,3 B | 262.144 | Apache 2.0 |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es una versión preview, no final: el autor advierte de que las especificaciones y resultados pueden cambiar antes del lanzamiento definitivo.
- El acceso al modelo base requiere aprobación mediante formulario (gated); este repositorio MLX hereda esa condición de acceso solicitado.
- La lista completa de idiomas soportados no está disponible; el foco declarado es coreano e inglés, por lo que el rendimiento en otras lenguas es incierto.
- No se detallan sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad en la información disponible.
- No se especifican los datos de entrenamiento (tokens, composición, alineación), lo que dificulta evaluar riesgos de sesgo y contaminación de benchmarks.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del formulario de acceso del modelo base antes de un uso comercial en producción.
- El formato NVFP4 de esta variante MLX puede introducir pérdida de precisión respecto al modelo en BF16; no se han publicado evaluaciones de degradación por cuantización.

## Enlaces

- Repositorio MLX: https://huggingface.co/KRAFTON/Raon-1-mini-preview-mlx
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini-preview
- Versión MLX más reciente: https://huggingface.co/KRAFTON/Raon-1-mini-mlx
- Organización en Hugging Face: https://huggingface.co/KRAFTON
- Página de KRAFTON AI: https://krafton.ai/en/
- Playground de Raon-1 mini: https://raon-console.krafton.ai/playground/guest
- X (Twitter) de KRAFTON AI: https://x.com/Krafton_AI
- Discord de la comunidad: https://discord.gg/sDG7mmZPnc
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- KRAFTON (web corporativa): https://www.krafton.com/en/
- KRAFTON en Wikipedia: https://en.wikipedia.org/wiki/Krafton
