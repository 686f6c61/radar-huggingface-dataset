# pinkelephantlimited/phone-agent

## Resumen

El modelo `pinkelephantlimited/phone-agent` es un finetune del modelo base `pinkelephantlimited/phone-llm`, un LLM de 1.2B parámetros entrenado desde cero por Pink Elephant Limited, una empresa tecnológica con sede en Hong Kong. El proyecto PhoneLLM busca ofrecer inteligencia artificial soberana y completamente offline para dispositivos Android, sin depender de servicios en la nube. El modelo base fue destilado a partir del teacher Pink Elephant 48B-S (47.7B MoE) y utiliza una arquitectura propia con tokenizer BPE de 32k, 24 capas, GQA y SwiGLU. El finetune `phone-agent` está orientado a tareas de agente, aunque no se dispone de una model card específica que detalle sus capacidades adicionales. La relevancia actual radica en la tendencia hacia modelos pequeños y eficientes que puedan ejecutarse en hardware de consumo, con licencia MIT y pesos soberanos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, 24 capas, 16 cabezas, 4 KV heads, hidden 2048, intermediate 5504, GQA, SwiGLU, RoPE 10k |
| Parametros totales | 1.2B (dense) |
| Parametros activos | no aplica (dense) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | Q4_K_M (~0.8GB), Q4_0 (~0.6GB), F16 (~2.4GB) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizado), safetensors (inferido de config.json, no confirmado) |

## Arquitectura y entrenamiento

El modelo base `phone-llm` es un transformer denso de 1.2B parámetros con 24 capas, atención con GQA (4 KV heads), SwiGLU como activación y RoPE con base 10k. El tokenizer es propio, un BPE de 32k vocabulario que incluye tokens especiales `[PAD]`, `[BOS]`, `[EOS]`, `[WEB]` y `[THINK]`. Fue entrenado desde cero sobre una mezcla de datasets permisivos de Hugging Face: 60% web (FineWeb-Edu), 30% chat (OpenHermes) y 10% código (StarCoder). El entrenamiento se realizó en una GPU molab RTX PRO 6000 de 102GB con BF16, PagedAdamW8bit y gradient checkpointing. El proceso de destilación desde el teacher 48B-S no implicó copia de pesos, sino una transferencia de conocimiento. No se menciona el uso de RLHF o DPO; la destilación y el fine-tuning supervisado son los métodos principales. El finetune `phone-agent` se basa en este modelo, pero no se especifican los datos ni el método de fine-tuning.

## Capacidades

- Generación de texto para chat conversacional, con soporte de streaming y renderizado Markdown.
- Ejecución completamente offline en dispositivos Android mediante llama.cpp (JNI) y cuantización GGUF.
- Integración con RAG local: recuperación de fragmentos de documentos locales concatenados con secciones `[Local]` y `[Web Search Results]`.
- Búsqueda web híbrida opcional mediante Jina Reader y DuckDuckGo Lite, con timeout de 8s y límite de 1500 caracteres.
- Soporte de historial de conversación y toggle de búsqueda web en la interfaz de usuario.
- Bilingüe en inglés y chino.
- Diseñado para inferencia en CPU/Vulkan con 4 threads, alcanzando ~15 tok/s en dispositivos Snapdragon 870 (estimado por el autor).

## Casos de uso

- Asistente personal offline en Android: el modelo se ejecuta localmente en el teléfono, permitiendo consultas y conversaciones sin conexión a internet, ideal para entornos con privacidad estricta o sin cobertura.
- Chat híbrido con búsqueda web: al activar el modo web, el modelo combina respuestas generadas localmente con resultados frescos de búsqueda, útil para preguntas sobre eventos recientes o información actualizada.
- RAG sobre documentos personales: el usuario puede cargar documentos (notas, PDFs, etc.) y el modelo responde consultas basadas en ese contenido, gracias a la recuperación local con chunking estructurado.
- Asistente de productividad en movilidad: con su contexto de 4096 tokens, puede mantener conversaciones multi-turno sobre tareas, recordatorios o planificación, sin depender de servicios en la nube.
- Desarrollo de aplicaciones de chat embebidas: al ser MIT y con pesos GGUF, los desarrolladores pueden integrar el modelo en sus propias apps Android mediante llama.cpp, sin costes de API.
- Educación y demostración de LLMs en edge: sirve como ejemplo práctico de cómo entrenar y desplegar un modelo propio desde cero en hardware de consumo, con tokenizer y arquitectura soberanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona estimaciones de velocidad de inferencia (~15 tok/s en Snapdragon 870 con Q4_K_M), pero no hay métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: ~0.8GB para Q4_K_M, ~0.6GB para Q4_0, ~2.4GB para F16 (en memoria del dispositivo).
- GPU recomendadas: no aplica; el modelo está diseñado para CPU/Vulkan en dispositivos móviles. En PC, puede ejecutarse en cualquier CPU moderna con soporte AVX2.
- Compatible con GPUs de consumo: sí, cualquier GPU con al menos 1GB de VRAM puede cargar la versión Q4_K_M, aunque la inferencia será más rápida en CPU.
- Opciones de despliegue: llama.cpp (vía JNI en Android), APK precompilado, o mediante `llama_cpp` en Python. También puede usarse con transformers en PC si se dispone de los pesos en safetensors.
- Latencia y throughput: estimado ~15 tok/s en Snapdragon 870 (iQOO Neo5 SE) con 4 threads y Q4_K_M; en hardware más potente (Snapdragon 8 Elite) podría alcanzar ~40 tok/s según pruebas de la comunidad.

## Comparativa con modelos similares

No se dispone de datos de comparación directa con otros modelos en la información proporcionada. Sin embargo, por tamaño y propósito, se puede comparar con modelos como Phi-3-mini (3.8B), Gemma 2B o Qwen2.5-1.5B, aunque no hay métricas de rendimiento para establecer una comparación cuantitativa. La principal diferencia es que PhoneLLM es un modelo entrenado desde cero con tokenizer propio, mientras que la mayoría de alternativas usan arquitecturas y tokenizers existentes. La licencia MIT y el enfoque en despliegue móvil son diferenciadores clave.

## Limitaciones y advertencias

- Modelo pequeño (1.2B) con capacidad limitada para razonamiento complejo, matemáticas avanzadas o generación de código extenso.
- Contexto limitado a 4096 tokens, lo que puede ser insuficiente para documentos largos o conversaciones muy extensas.
- Solo soporta inglés y chino; no hay soporte multilingüe más amplio.
- Riesgo de alucinaciones, especialmente en tareas de razonamiento o cuando se combina con búsqueda web, ya que el modelo puede mezclar información local y web de forma incorrecta.
- No se han publicado evaluaciones de sesgos o robustez; el dataset de entrenamiento puede contener sesgos inherentes de FineWeb-Edu y OpenHermes.
- La licencia MIT permite uso comercial, pero el modelo se distribuye sin garantías; el autor no ofrece soporte técnico.
- El finetune `phone-agent` no tiene documentación específica; las capacidades de agente (tool calling, planificación) no están confirmadas ni evaluadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pinkelephantlimited/phone-agent
- Modelo base: https://huggingface.co/pinkelephantlimited/phone-llm
- Proyecto relacionado (app de ayuda): https://huggingface.co/pinkelephantlimited/phone-helper-app
- VLM relacionado: https://huggingface.co/pinkelephantlimited/phone-helper-vlm-3b
- GitHub de la organización: https://github.com/pinkelephantlimited/
