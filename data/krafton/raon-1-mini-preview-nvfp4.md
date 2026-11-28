# KRAFTON/Raon-1-mini-preview-nvfp4

## Resumen

Raon-1 mini (NVFP4) es una versión cuantizada a NVFP4 del modelo Raon-1 mini preview, desarrollado por KRAFTON AI. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) entrenado desde cero, con 28,8 mil millones de parámetros totales y 4,3 mil millones activos por token, diseñado específicamente para destacar en conversación en coreano y tareas agénticas. Esta variante NVFP4 está pensada para ejecutarse en vLLM sobre una única GPU NVIDIA RTX 5090 con 32 GB de VRAM.

El modelo emplea una arquitectura híbrida de atención que combina 18 capas de Raon Delta Attention (RDA) con estado de tamaño fijo y 7 capas de Gated MLA con caché KV, lo que reduce el coste de memoria en contextos largos hasta aproximadamente 8 KiB por token en BF16. Soporta de forma nativa hasta 262.144 tokens de contexto y utiliza codificación posicional NoPE. Es una versión preview, por lo que las especificaciones y resultados pueden cambiar antes de la versión final.

La relevancia de esta ficha radica en que combina un tamaño de activación reducido (4,3B) con contexto largo y un formato de cuantización de 4 bits (NVFP4) que permite desplegarlo en hardware de consumo de gama alta. La licencia Apache 2.0 facilita su uso comercial, aunque el acceso al modelo requiere solicitud previa mediante un formulario de gating en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (18 capas RDA + 7 capas Gated MLA), 25 capas totales |
| Parametros totales | 28,8B (según model card); 15.084.105.442 en safetensors del repo cuantizado |
| Parametros activos | 4,3B (6 expertos enrutados + 1 compartido de 128) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (este repo); MXFP8 disponible en otra variante |
| Idiomas soportados | Coreano e inglés (según model card); lista completa no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (NVFP4, modelopt_fp4), compatible con vLLM |

## Arquitectura y entrenamiento

Raon-1 mini emplea una arquitectura MoE híbrida con 25 capas: 18 capas de Raon Delta Attention (RDA) y 7 capas de Gated MLA. RDA desacopla las compuertas de borrado y escritura de Kimi Delta Attention, lo que según el autor mejora el rendimiento en contexto largo respecto a KDA. Las capas RDA mantienen un estado de tamaño fijo, mientras que solo las 7 capas MLA conservan caché KV (aproximadamente 8 KiB por token en BF16). El modelo usa codificación posicional NoPE, 40 cabezas de atención en ambos tipos de capa, dimensión de cabeza 128 para RDA y 192 QK / 128 V para Gated MLA, con rango LoRA de consulta/clave de 576/512 en Gated MLA.

La capa MoE cuenta con 128 expertos, de los cuales 6 enrutados más 1 compartido se activan por token, con tamaño intermedio de experto de 1.088 y una capa densa inicial de 12.032. Emplea activación SiTU-GLU, conexiones residuales Raon-mHC con 4 flujos (una optimización del manifold-constrained hyper-connections de DeepSeek) y un vocabulario de 259.840 tokens con LM Head no atado. El modelo fue entrenado desde cero por KRAFTON AI; no se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento integrado (built-in thinking).
- Razonamiento matemático y científico, con resultados destacados en los benchmarks mostrados por el autor.
- Seguimiento de instrucciones y capacidades de búsqueda (search), donde el autor lo sitúa por delante de los modelos de comparación.
- Ejecución de agentes con tool calling, compatible con Hermes Agent, Pi y OpenCode.
- Conversación multi-turno en coreano e inglés, con especial fortaleza en coreano.
- Soporte de decodificación especulativa mediante un modelo draft DFlash2 proporcionado por el autor.
- Capacidad de contexto largo nativo de hasta 262.144 tokens.
- No se mencionan capacidades de visión, audio ni otros modos en la información disponible.

## Casos de uso

- Atención al cliente automatizada en coreano: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 262.144 tokens y su fortaleza específica en coreano, lo que lo hace adecuado para mercados surcoreanos.
- Agentes autónomos con tool calling: al ser compatible con Hermes Agent, Pi y OpenCode, puede integrarse en flujos agénticos que requieran invocar funciones externas, APIs o herramientas de búsqueda en varios pasos.
- Asistentes de razonamiento matemático y científico: su modo de pensamiento integrado y sus resultados en benchmarks de matemáticas y ciencia lo orientan a tareas de resolución de problemas técnicos paso a paso.
- Procesamiento de documentos largos: con 262.144 tokens de contexto y un coste de caché KV reducido (solo 7 capas MLA), es viable para analizar informes extensos, expedientes o bases de código completas en una sola pasada.
- Despliegue en estación de trabajo con GPU de consumo: la variante NVFP4 cabe en una RTX 5090 de 32 GB, lo que permite prototipado y desarrollo local sin infraestructura de centro de datos.
- Generación de código asistida en pipelines de CI/CD: mediante tool calling y su soporte para OpenCode, puede integrarse en entornos de desarrollo para revisión, generación y corrección de código.
- Búsqueda aumentada (RAG) con contexto largo: la combinación de ventana extensa y capacidades de búsqueda permite inyectar grandes volúmenes de documentos recuperados sin truncamientos agresivos.

## Benchmarks y rendimiento

La model card incluye gráficas de resultados comparativos frente a modelos abiertos, pero los valores numéricos no están disponibles en el texto extraído. El autor indica que el modelo lidera en los benchmarks de matemáticas, ciencia, seguimiento de instrucciones y búsqueda mostrados, usando gpt-5.6-luna como juez y simulador de usuario. No se han podido extraer cifras concretas de MMLU, HumanEval, GSM8K u otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo cuantizado ocupa 17,6 GB, por lo que la inferencia NVFP4 requiere aproximadamente 18-20 GB de VRAM, dependiendo de la longitud de contexto y del tamaño de lote.
- GPU recomendada por el autor: una única NVIDIA RTX 5090 con 32 GB de VRAM para la variante NVFP4.
- Cabe en GPU de consumo: sí, en RTX 5090 (32 GB); en GPUs con menos VRAM no está confirmado en la información disponible.
- Opciones de despliegue: vLLM es el runtime indicado explícitamente para estos pesos NVFP4. No se mencionan llama.cpp, Ollama ni TGI para esta variante.
- Aceleración: se proporciona un modelo draft DFlash2 para decodificación especulativa, lo que puede mejorar la latencia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos numéricos de benchmarks ni de especificaciones detalladas de los modelos de comparación empleados por el autor, por lo que no es posible construir una comparativa cuantitativa fiable. A continuación se resumen los aspectos estructurales conocidos frente a alternativas de la misma categoría (MoE de tamaño medio con activación reducida):

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Raon-1 mini (NVFP4) | 28,8B | 4,3B | 262.144 | Apache 2.0 | Hugging Face con gating |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible comparaciones verificables con modelos concretos como Qwen, DeepSeek o Llama; la model card solo muestra gráficas sin cifras extraíbles.

## Limitaciones y advertencias

- Es una versión preview, no un modelo final: las especificaciones y resultados pueden cambiar antes del lanzamiento definitivo.
- El acceso está restringido mediante gating en Hugging Face: es necesario solicitar acceso y aceptar la licencia Apache 2.0 antes de descargar los pesos.
- La model card solo declara fortaleza en coreano e inglés; el rendimiento en otros idiomas no está documentado y podría ser limitado.
- No se dispone de información sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad, lo que dificulta auditar riesgos de alucinación o sesgo en producción.
- La cuantización NVFP4 puede introducir degradación de calidad respecto a los pesos originales; no se han publicado métricas de la pérdida de rendimiento asociada a esta cuantización.
- El despliegue está orientado a vLLM y a GPUs NVIDIA compatibles con NVFP4 (RTX 5090); no hay confirmación de soporte en otros runtimes o aceleradores.
- Aunque la licencia Apache 2.0 permite uso comercial, el gating y las condiciones de acceso deben respetarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KRAFTON/Raon-1-mini-preview-nvfp4
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini-preview
- Nueva versión indicada: https://huggingface.co/KRAFTON/Raon-1-mini-nvfp4
- Playground: https://raon-console.krafton.ai/playground/guest
- Página de KRAFTON AI: https://krafton.ai/en/
- Organización en Hugging Face: https://huggingface.co/KRAFTON
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- X (Twitter) de KRAFTON AI: https://x.com/Krafton_AI
- Discord de la comunidad: https://discord.gg/sDG7mmZPnc
- Web corporativa: https://www.krafton.com/en/
