# Baekpica/MiniMax-M3.1-Flash-VQ-GGUF

## Resumen

Esta ficha cubre `Baekpica/MiniMax-M3.1-Flash-VQ-GGUF`, una cuantización GGUF experimental de muy bajo bit del modelo `MiniMaxAI/MiniMax-M3.1-Flash`, un MoE multimodal nativo de MiniMax con unos 428.000 millones de parámetros y 1.048.576 tokens de contexto. La conversión, publicada el 23 de octubre de 2026, reduce el checkpoint original de 236 GB a 61 partes GGUF que suman 115.526.325.376 bytes, con los expertos enrutados almacenados a aproximadamente 2,0 bits por peso mediante cuantización vectorial (VQ) residual.

El interés es práctico: permite mantener residentes 111,3 GB (103,7 GiB) en una única DGX Spark con GB10 y 128 GB de memoria, dejando en SSD la tabla de embeddings, la torre de visión y las K/V de sesiones largas. Conserva la atención dispersa MSA, la cabeza de decodificación especulativa DSpark y la plantilla de chat original, por lo que el modelo sigue aceptando texto, imagen y vídeo con el contexto nativo completo.

Es, sin embargo, material de investigación en cuantización: el propio autor advierte de razonamiento que entra en bucles, texto roto a mitad de carácter y cambios de idioma. La fidelidad medida frente al original es KL 0,150 y 88,2 % de coincidencia en el siguiente token sobre turnos del asistente, lejos de los cuantizados de 4 bits habituales. El runtime necesario es `ds4-dfm-rs`, en una PR todavía sin fusionar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con atención dispersa: 60 capas (3 densas + 57 MoE), hidden 6.144, 128 expertos enrutados top-4 más 1 compartido, FFN de experto 3.072, SwiGLU-OAI, MSA en todas las capas, GQA de 64 cabezas de consulta y 4 de KV × 128, QK-norm estilo Gemma y RoPE parcial (64 de 128 dimensiones, θ 1e7) |
| Parámetros totales | ≈428.000 millones según la model card, de los cuales 413.100 millones corresponden a pesos de expertos enrutados; los metadatos de safetensors del repo indican 11.835.010.176, discrepancia no explicada en la información disponible |
| Parámetros activos | No disponible: top-4 de 128 expertos enrutados más 1 compartido, sin recuento activo publicado |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantización | GGUF con VQ residual: 13 bits (K=8.192) en las 57 capas MoE y etapa residual de 8 bits (K=256) en 20 capas; 1,63 bpw en 37 capas, 2,63 en 20, media 1,98 bpw. Atención q/k/v/o, expertos compartidos, FFN densas (capas 0-2) y cabeza de salida en Q4_K; proyecciones del indexador MSA en Q8_0; router, bias de corrección, RMSNorm y QK-norm en F32; embeddings y torre de visión en BF16 |
| Idiomas soportados | en, ko, zh, ja |
| Licencia | minimax-community (`license: other`); condiciones concretas no disponibles en la información proporcionada |
| Formato de pesos | GGUF, 61 partes independientes, 115.526.325.376 bytes en total (repo de 115,6 GB) |
| Vocabulario | 200.064 tokens |
| Visión y vídeo | Torre ViT BF16 de 632 M de parámetros, proyector y MLP de fusión 2×2, en una parte propia mapeada en memoria y leída solo al recibir imagen o vídeo |
| Decodificación especulativa | Cabeza DSpark de 5 capas, bloque 7 y cabeza de Markov, en Q8_0, residente (2,03 GiB) |
| Contrato de KV | Claves del indexador MSA residentes en NVFP4 (72 B por token y capa; 4,22 GiB a 1M); K/V principales en NVFP4 (576 B por token y capa; 33,75 GiB a 1M) en SSD, leídas por bloques seleccionados |
| Runtime | `ds4-dfm-rs`, familia `minimax_m3_vq` (PR borrador n.º 110, no fusionada) |
| Plantilla de chat | `chat_template.jinja` original sin cambios: `<mm:think>`, thinking adaptativo, `reasoning_effort`, tool calls XML con el espacio de nombres `]<]minimax[>[`, marcadores de imagen y vídeo |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE disperso con 60 capas, de las cuales solo 3 son densas y 57 contienen expertos. Cada capa MoE enruta cada token hacia 4 de 128 expertos mediante router con sigmoide y bias de corrección, escalado × 2,0, más un experto compartido; la FFN de cada experto tiene dimensión 3.072. La atención usa GQA con 64 cabezas de consulta y 4 de KV, QK-norm por cabeza y RoPE parcial sobre 64 de las 128 dimensiones, con atención dispersa MiniMax (MSA) aplicada en todas las capas. El vocabulario es de 200.064 tokens y el hidden de 6.144.

No se dispone de datos sobre el corpus de preentrenamiento, el número de tokens, la composición del dataset ni las etapas de RLHF o DPO del modelo original. Lo que sí documenta esta release es el proceso de cuantización: los expertos enrutados se comprimen con VQ de 8 dimensiones, un codebook E4M3 por capa compartido por los 128 expertos y las proyecciones gate/up/down, más una ganancia F16 por fila; los codebooks, asignaciones y ganancias se ajustan con Lloyd ponderado por calibración, una matriz de importancia adaptada a VQ. La etapa residual de 8 bits se aplicó solo en las capas 16, 18-32, 35, 40, 43 y 53, elegidas mediante medición extremo a extremo.

La calibración se realizó con estadísticas de 4,18 millones de tokens de texto, imagen y vídeo pasados por el checkpoint original. La conversión cubrió los 89.729 tensores de origen y cada payload tiene su hash en `tensor-manifest.json`. El checkpoint fuente ya estaba entrenado con conciencia de cuantización: expertos enrutados en NVFP4 y atención, capas densas y expertos compartidos en MXFP8.

## Capacidades

- Generación de texto, razonamiento y código en un único modelo multimodal, con la misma plantilla de chat que el original.
- Entrada de imagen y vídeo mediante la torre ViT de 632 M de parámetros y el proyector, leídos desde SSD cuando llega el contenido.
- Contexto de 1.048.576 tokens, con atención dispersa MSA y K/V principales en SSD; el autor reporta un prompt de 1.048.319 tokens prellenado y decodificado.
- Modo de razonamiento explícito con `<mm:think>`, thinking adaptativo y control mediante `reasoning_effort`.
- Tool calling y function calling con formato XML y el espacio de nombres `]<]minimax[>[`.
- Flujos agénticos de varios pasos, incluidos computer use, coding y ciberseguridad según la documentación del modelo base.
- Decodificación especulativa integrada mediante la cabeza DSpark, con tres tokens propuestos por paso.
- Soporte multilingüe limitado a inglés, coreano, chino y japonés según la model card.
- Salidas estructuradas e caché implícita de prompt en el servicio alojado del modelo base, no necesariamente en este GGUF.

## Casos de uso

- Agentes de computer use en local: el modelo puede mantener una sesión larga con historial de acciones, capturas de pantalla y resultados de herramientas gracias al contexto de 1M tokens y a la entrada de imagen, sin enviar datos a un servicio externo.
- Análisis de vídeo de larga duración: la torre de visión y el contexto nativo permiten procesar secuencias extensas y responder preguntas sobre eventos distribuidos a lo largo del metraje, con la torre leída desde SSD solo cuando se necesita.
- Revisión de código en pipelines de CI/CD: el soporte de tool calling XML permite invocar linters, ejecutar tests y consultar el repositorio, mientras el contexto de 1M absorbe diffs grandes y árboles de dependencias.
- Triage de ciberseguridad: el modelo base está orientado a cybersecurity; este GGUF puede clasificar alertas, correlacionar logs extensos y proponer pasos de contención en un despliegue air-gapped sobre DGX Spark.
- Atención al cliente multi-turno: con 1M tokens de contexto se puede mantener el histórico completo de una cuenta, incluidas imágenes adjuntas, y aplicar `reasoning_effort` bajo para reducir latencia en consultas rutinarias.
- Asistente documental sobre corpus técnicos: indexación y preguntas sobre manuales, normativas o papers en inglés, chino, japonés o coreano, con citas y razonamiento multi-paso dentro de una sola ventana.
- Generación de documentación técnica multilingüe: traducción y síntesis entre los cuatro idiomas soportados, con imagen de diagramas como entrada para describir arquitecturas.
- Investigación en cuantización: banco de pruebas para estudiar VQ residual, matrices de importancia y el compromiso entre 1,98 bpw y fidelidad KL en un MoE de 428.000 millones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, MMMU u otros) en la información disponible, ni para este GGUF ni para el modelo base. Los únicos datos medidos son de fidelidad frente al original y de velocidad en DGX Spark:

| Métrica | Resultado | Condiciones |
|---|---|---|
| Divergencia KL | 0,150 | Teacher-forced sobre conversaciones retenidas, turnos del asistente, bytes de la release |
| Coincidencia top-1 | 88,2 % | Mismo protocolo que la KL |
| KL con 13 bits en todas las capas | 0,223 | Variante sin etapa residual de 8 bits |
| KL del original | 0,003 | Referencia del autor, con otro batching |
| Prefill | 905,1 tok/s | Rango 2K-64K con DSpark, DGX Spark GB10, ds4-dfm-rs `ff430197` |
| Decode | 19,56 tok/s | Mismo escenario, 128 tokens greedy forzados |
| Prefill a contexto completo | 580 tok/s | Prompt exacto de 1.048.319 tokens |

## Requisitos de hardware

- VRAM/memoria unificada estimada: 111,3 GB residentes (103,7 GiB) de los 115,5 GB del GGUF, más 2,03 GiB de la cabeza DSpark; embeddings BF16 y torre de visión se leen desde SSD.
- GPU recomendada: una DGX Spark con GB10 y 128 GB de memoria unificada; es el único hardware validado en la información disponible.
- No cabe en GPU de consumo: una RTX 4090 de 24 GB o una RTX 5090 de 32 GB quedan muy lejos de los 111 GB residentes, y no se documenta una configuración multi-GPU.
- Almacenamiento: SSD obligatorio para el repositorio de 115,6 GB, la tabla de embeddings, la torre de visión y las K/V principales de sesiones largas (33,75 GiB a 1M tokens).
- Despliegue: únicamente `ds4-dfm-rs`, familia `minimax_m3_vq`, PR n.º 110 sin fusionar; no se documenta soporte en llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: 905,1 tok/s de prefill y 19,56 tok/s de decode en el rango 2K-64K con DSpark; 580 tok/s de prefill con 1.048.319 tokens. El decode a contexto completo no se detalla en la información disponible.
- Memoria de atención: 4,22 GiB de claves del indexador MSA a 1M tokens, residentes en NVFP4, más las K/V principales en SSD.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato y tamaño | Licencia | Notas |
|---|---|---|---|---|---|
| MiniMax-M3.1-Flash (original) | ≈428.000 millones | 1.048.576 | Checkpoint de 236 GB, expertos NVFP4 y atención MXFP8 | minimax-community | Referencia de calidad; API a 0,15 USD por millón de tokens de entrada y 0,60 USD por millón de salida, sin recargo por prompts largos |
| AMAImedia/MiniMax-M3.1-Flash-NVFP4-GGUF | ≈428.000 millones | 1.048.576 | GGUF NVFP4 | No disponible en la información | Otra cuantización del mismo modelo base; no publica métricas de fidelidad ni velocidad |
| Baekpica/MiniMax-M3.1-Flash-VQ-GGUF | ≈428.000 millones | 1.048.576 | GGUF VQ de 115,5 GB en 61 partes, 1,98 bpw | minimax-community | KL 0,150 y 88,2 % top-1; 19,56 tok/s de decode en una DGX Spark |

## Limitaciones y advertencias

- Cuantización experimental a unos 2,0 bits por peso en los expertos enrutados, que concentran el 97 % de los pesos; el autor documenta razonamiento en bucle, texto roto a mitad de carácter (`�`), cambios de idioma y respuestas más débiles que el original.
- Fidelidad limitada: KL 0,150 y 88,2 % de coincidencia top-1 en turnos del asistente, frente a KL 0,003 del original; no es apta para producción sin evaluación propia.
- Dependencia de un runtime no fusionado: solo funciona con `ds4-dfm-rs` en la PR n.º 110, con el commit `ff430197` como referencia; la API y el formato pueden cambiar.
- Dependencia de SSD para embeddings, torre de visión y K/V principales; el rendimiento en contexto largo depende de la latencia del almacenamiento, no solo de la GPU.
- Licencia `minimax-community` con `license: other`; no se dispone de los términos concretos, así que hay que revisar `LICENSE` antes de cualquier uso comercial o redistribución.
- Idiomas limitados a inglés, coreano, chino y japonés; no se declara soporte de español, por lo que la calidad en castellano no está garantizada.
- Sin benchmarks públicos de MMLU, HumanEval, GSM8K o MMMU en la información disponible; las cifras de capacidad del modelo base no se han verificado sobre esta cuantización.
- Discrepancia de parámetros: los metadatos de safetensors indican 11.835.010.176 parámetros, mientras que la model card describe un MoE de 428.000 millones; conviene no usar ese dato de safetensors para dimensionar despliegues.
- Riesgo de alucinación y de sesgos heredados del modelo base, no evaluado en esta release; la model card no incluye análisis de sesgo.
- Contexto nativo de 1M tokens, pero el decode medido es de 19,56 tok/s; sesiones muy largas implican latencias altas y un consumo de SSD considerable.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Baekpica/MiniMax-M3.1-Flash-VQ-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
- Runtime ds4-dfm-rs: https://github.com/Baekpica/ds4-dfm-rs
- PR del runtime para `minimax_m3_vq`: https://github.com/Baekpica/ds4-dfm-rs/pull/110
- Blog de MiniMax sobre M3.1 Flash: https://www.minimax.io/blog/minimax-m31f
- ModelScope del modelo base: https://www.modelscope.cn/models/MiniMax/MiniMax-M3.1-Flash
- Cuantización NVFP4 alternativa: https://huggingface.co/AMAImedia/MiniMax-M3.1-Flash-NVFP4-GGUF
- Ficha con precios y acceso: https://minimax-ai.chat/models/minimax-m3-1-flash-preview/
- Ficha en Blackbox: https://www.blackbox.ai/models/blackboxai/minimax/minimax-m3.1-flash
