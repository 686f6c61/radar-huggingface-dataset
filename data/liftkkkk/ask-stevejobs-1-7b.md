# liftkkkk/ask-SteveJobs-1.7b

## Resumen

ask-SteveJobs-1.7b es un ajuste fino (finetune) de tipo roleplay conversacional sobre el modelo base LiquidAI/LFM3-1.7B, publicado por el usuario liftkkkk en Hugging Face. Su objetivo es encarnar la persona de Steve Jobs en primera persona: responde con un estilo afilado y directo a preguntas sobre producto, diseño, enfoque, su despido de Apple, la muerte, el zen o su opinión sobre Microsoft, y soporta seguimiento multi-turno. El modelo se distribuye exclusivamente en formato GGUF, listo para llama.cpp, LM Studio y Ollama.

El modelo hereda la arquitectura híbrida ligera de LFM3 con 1.700 millones de parámetros y una ventana de contexto de 256K tokens según la model card del autor. El entrenamiento se realizó con SFT y LoRA, seguido de GRPO/RLVR para el modo de razonamiento, y el corpus se compone de transcripciones de discursos, keynotes, entrevistas y textos publicados de Jobs. El resultado es un modelo de 1,7B pensado para ejecutarse en hardware modesto, incluso en iGPU (el autor reporta entrenamiento en una Radeon 780M con ROCm).

Su relevancia actual es doble: por un lado, demuestra que es posible entrenar y publicar un modelo de personaje con pipeline completo (SFT + RLVR + cuantización GGUF) en hardware de consumo; por otro, sirve como caso de estudio de los límites de los modelos pequeños para memorización verbatim y de los riesgos de alucinación controlada en roleplay. La licencia es la Liquid LFM Community License, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (LFM3, según model card del autor) |
| Parametros totales | 1,7B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256K tokens (heredado del modelo base LFM3-1.7B) |
| Tipos de cuantizacion | bf16 (16 BPW), Q8_0 (8,5 BPW), Q4_K_M (5,05 BPW) |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | liquid-lfm-community-license (other) |
| Formato de pesos | GGUF (bf16, Q8_0, Q4_K_M) |
| Modelo base | LiquidAI/LFM3-1.7B |
| Libreria de inferencia | llama.cpp (convertido con b12202), LM Studio, Ollama |
| Plantilla de chat | embebida en metadatos GGUF (formato ChatML `<|im_start|>` / `<|im_end|>`) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, un modelo de lenguaje ligero de 1,7B parámetros con arquitectura híbrida y 256K de contexto según la información del autor. Sobre esa base se aplicó un ajuste fino con LoRA y SFT usando un corpus de discursos públicos, presentaciones de producto (keynotes), entrevistas y textos publicados de Steve Jobs. Posteriormente se aplicó GRPO/RLVR para dotar al modelo de un modo de razonamiento explícito delimitado por etiquetas `<think>…</think>`, con el objetivo de que el modelo "razone en personaje" antes de emitir la respuesta final.

La innovación técnica destacable no está en la arquitectura (heredada del base) sino en el pipeline de entrenamiento en hardware de consumo: el autor reporta entrenamiento en una iGPU AMD Radeon 780M con ROCm 10.1, usando PyTorch 2.14+rocm, transformers 5.20, TRL 1.17 y PEFT 0.21. La conversión a GGUF se hizo con `convert_hf_to_gguf.py` y `llama-quantize` de llama.cpp b12202, que da soporte nativo a LFM3. La plantilla de chat y los tokens de parada quedan embebidos en los metadatos del GGUF, de modo que el usuario no necesita configurarlos manualmente.

## Capacidades

- Generación de texto conversacional en primera persona con la persona de Steve Jobs, en chino e inglés.
- Roleplay multi-turno: admite preguntas de seguimiento y mantiene el personaje a lo largo de la conversación.
- Modo de razonamiento con bloque `<think>…</think>` antes de la respuesta final (activado por defecto en la plantilla recomendada).
- Modo de respuesta directa con bloque `<think></think>` vacío, útil para respuestas rápidas o recitado de citas.
- Recuperación verbatim de frases célebres a nivel de fragmento (por ejemplo, "la concentración consiste en decir no").
- Estilo de respuesta afilado, directo y conciso, alineado con el personaje.
- Cobertura temática: producto, diseño, enfoque, despido de Apple, muerte, zen, opinión sobre Microsoft y competidores.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni otras modalidades.
- Capacidades multilingües limitadas a zh y en según los metadatos del modelo.

## Casos de uso

- Demo educativa de roleplay histórico: desplegar el modelo en un cuaderno o interfaz web para que estudiantes de diseño o historia de la tecnología conversen con una simulación de Jobs sobre decisiones de producto y filosofía de diseño. El tamaño de 1,7B y la cuantización Q4_K_M (1,10 GB) permiten ejecutarlo en portátiles sin GPU dedicada.
- Prototipado de personajes conversacionales: usar este modelo como referencia de pipeline (SFT + LoRA + GRPO/RLVR + GGUF) para construir otros personajes históricos o ficticios con hardware de consumo.
- Asistente de ideación de producto con tono crítico: integrar el modelo en una herramienta interna que genere preguntas incisivas sobre un concepto de producto, aprovechando el estilo directo del personaje para forzar decisiones de enfoque ("¿qué vas a eliminar?").
- Generación de contenido editorial y guiones: producir borradores de diálogos o citas estilo Jobs para artículos, podcasts o material formativo, siempre con revisión humana y sin presentarlos como declaraciones reales.
- Investigación sobre memorización y alucinación en modelos pequeños: el modelo es un caso útil para medir hasta qué punto un 1,7B con LoRA reproduce citas verbatim frente a parafrasear, y cómo el modo de razonamiento afecta a la fidelidad factual.
- Evaluación de despliegue en iGPU y edge: probar llama.cpp con Q4_K_M en equipos con gráfica integrada (el autor cita la 780M) para validar latencia y consumo en escenarios de inferencia local sin conexión.
- Chatbot de entretenimiento para eventos o comunidades: instalar el GGUF en LM Studio u Ollama y ofrecer una experiencia de conversación temática en ferias, talleres o demos, con avisos claros de que es una simulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2-1,5 GB con Q4_K_M (fichero de 1,10 GB más overhead de contexto); unos 2,2-2,5 GB con Q8_0 (fichero de 1,84 GB); unos 3,8-4,2 GB con bf16 (fichero de 3,46 GB).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM para Q4_K_M; para bf16 se recomienda 6-8 GB. No se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, con Q4_K_M en tarjetas de 4 GB (GTX 1650, RTX 3050, etc.). El autor reporta ejecución fluida en una iGPU Radeon 780M con Q4_K_M.
- Opciones de despliegue: llama.cpp (probado con b12202), LM Studio y Ollama; la plantilla y los tokens de parada van embebidos en el GGUF.
- Latencia y throughput: no disponibles. El autor solo indica "fluido" en la 780M con Q4_K_M, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| ask-SteveJobs-1.7b | 1,7B | 256K (según autor) | GGUF | liquid-lfm-community-license | Roleplay de personaje (Jobs), zh/en |
| LiquidAI/LFM3-1.7B (base) | 1,7B | 256K (según autor) | safetensors / GGUF | liquid-lfm-community-license | Modelo generalista ligero |
| Modelos de personaje de 1-2B en GGUF | 1-2B | variable | GGUF | variable | Roleplay genérico |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este modelo con alternativas de la misma categoría. La comparación con el modelo base es directa en arquitectura y contexto, pero no en comportamiento (el finetune prioriza persona sobre capacidades generales).

## Limitaciones y advertencias

- Memorización verbatim limitada: el autor reconoce que solo las citas a nivel de fragmento se reproducen literalmente; las parrafadas completas se generan por "forma similar + recuperación de palabras clave", límite físico de un 1,7B con LoRA.
- Conocimiento limitado a 2011: para temas posteriores o no cubiertos por el corpus, el modelo "inventa con confianza" manteniendo el personaje; es alucinación por diseño en un modelo de roleplay.
- El modo de razonamiento emite bloques `<think>…</think>` que deben eliminarse antes de mostrar la respuesta final si el frontend no lo hace automáticamente.
- Idiomas limitados a chino e inglés; no se documenta soporte de español ni de otras lenguas.
- Licencia Liquid LFM Community License: es una licencia "other" con posibles restricciones de uso comercial; debe revisarse el texto completo en el repositorio del modelo base antes de cualquier despliegue productivo.
- Riesgo de suplantación: el modelo genera texto en primera persona atribuido a una persona real fallecida; el autor prohíbe explícitamente usarlo para hacerse pasar por Jobs, engañar o con fines comerciales de reclamo.
- Sesgos: el personaje incorpora opiniones y juicios del Jobs histórico sobre competidores (por ejemplo, Microsoft), lo que puede reproducir sesgos y valoraciones polémicas del corpus.
- Sin datos de benchmarks ni de evaluación de seguridad; no hay evidencia publicada sobre robustez frente a prompts adversarios.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liftkkkk/ask-SteveJobs-1.7b
- Modelo base LFM3-1.7B: https://huggingface.co/LiquidAI/LFM3-1.7B
- LiquidAI (organización): https://huggingface.co/LiquidAI
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Steve Jobs Archive: https://book.stevejobsarchive.com/
