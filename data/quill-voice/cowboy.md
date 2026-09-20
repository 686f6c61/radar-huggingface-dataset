# quill-voice/cowboy

## Resumen

Cowboy es un ajuste fino del modelo base Qwen/Qwen3.5-4B, publicado por el usuario quill-voice (QuillBytes) bajo licencia Apache-2.0. Su único objetivo declarado es responder siempre con acento, jerga y "alma" del oeste americano, por lo que se trata de un modelo de persona/estilo y no de un modelo orientado a tareas profesionales. La model card lo describe explícitamente como un proyecto "para diversión y entretenimiento".

El ajuste se realizó con LoRA en bf16 sobre la librería Unsloth, durante 3 épocas, con r=16, lora_alpha=16, lora_dropout=0, target_modules="all-linear", learning rate 2e-4, optimizador adamw_8bit y batch efectivo de 8 (2 x 4 pasos de acumulación). La longitud de contexto declarada es de 2048 tokens, muy corta para los estándares actuales, y el único idioma soportado es el inglés. El repositorio distribuye pesos en safetensors y cuantizaciones GGUF (4-bit y F16).

Hay una discrepancia relevante que conviene verificar antes de cualquier uso: los safetensors del repositorio declaran 333.514.240 parámetros (~333,5 M), muy por debajo de los ~4B del modelo base anunciado. Esto sugiere que lo publicado podría ser el adaptador LoRA o un subconjunto de pesos, no el modelo completo. El autor no aclara esta diferencia en la información disponible, y el modelo acumula 0 descargas y 0 likes, por lo que no existe validación por parte de la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (base Qwen3.5-4B) con adaptación LoRA |
| Parametros totales | 333.514.240 según los safetensors del repositorio; el modelo base declarado es Qwen3.5-4B (discrepancia no aclarada por el autor) |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | 2048 tokens (según model card) |
| Tipos de cuantizacion | GGUF 4-bit (cowboy.gguf), GGUF F16 (cowboy-F16.gguf, descrito como "multimodal projector"), safetensors en precisión completa |
| Idiomas soportados | inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La base es Qwen3.5-4B, un transformer causal decoder-only. Sobre él se aplicó un adaptador LoRA con r=16, alpha=16 y dropout 0, con `target_modules="all-linear"`, es decir, afectando a todas las capas lineales. El entrenamiento se ejecutó en Kaggle con Unsloth, usando gradient checkpointing de Unsloth, `per_device_train_batch_size=2`, `gradient_accumulation_steps=4`, `warmup_steps=5`, 3 épocas y `learning_rate=2e-4` con el optimizador `adamw_8bit`. No se documenta ni RLHF, ni DPO, ni composición del dataset de ajuste, ni número de tokens de entrenamiento.

No se declara ninguna innovación técnica propia: no hay decodificación especulativa, atención lineal ni mecanismos híbridos documentados. La única particularidad es el objetivo de estilo (persona cowboy) inducido mediante el ajuste y reforzado con un system prompt sugerido: "You are a cowboy assistant. You always respond in a cowboy accent and use western slang. Yee-haw partner!". Los tags del repositorio incluyen `image-text-to-text` y `qwen3_5`, mientras que la model card y el pipeline declarado son de `text-generation`; la supuesta capacidad multimodal no está documentada ni confirmada.

## Capacidades

- Generación de texto conversacional en inglés con estilo cowboy consistente (jerga, sintaxis y metáforas del oeste).
- Respuesta a instrucciones generales del modelo base, reformuladas en el registro de la persona entrenada.
- Conversación multi-turno dentro de la ventana de 2048 tokens.
- Escritura creativa breve: relatos, diálogos y descripciones con voz western.
- Inferencia local mediante GGUF 4-bit en Ollama, LM Studio o llama.cpp.
- Carga directa con Transformers (`AutoModelForCausalLM`, `apply_chat_template`) y `torch_dtype=torch.bfloat16`.
- No hay evidencia documentada de tool calling, function calling, capacidades de agente, razonamiento multi-paso, matemáticas avanzadas, código, visión o audio. Los tags mencionan `image-text-to-text`, pero la información disponible no lo confirma.
- No se documenta un modo "thinking" ni ningún modo de razonamiento extendido.

## Casos de uso

- Chatbot de entretenimiento en Discord o web: el modelo mantiene la persona cowboy en conversaciones cortas de pocos turnos, y su cuantización 4-bit permite servirlo en una GPU de gama media o incluso en CPU, con coste de infraestructura mínimo.
- Generación de diálogos para videojuegos o mods con ambientación del oeste: sirve para producir borradores de líneas de NPC con jerga homogénea que después se revisan y editan manualmente; la ventana de 2048 tokens es suficiente para prompts de escena cortos.
- Demo educativa de fine-tuning con LoRA y Unsloth: el repositorio documenta la configuración completa (r, alpha, target_modules, optimizador, épocas), por lo que es un ejemplo reproducible para enseñar a adaptar un modelo base en un notebook de Kaggle.
- Prototipado de personajes conversacionales: permite comparar cómo un LoRA de estilo más un system prompt modifican el registro del modelo sin reentrenar, útil para validar rápidamente una idea de producto antes de invertir en un dataset propio.
- Escritura creativa de voz marcada: relatos cortos, letras de canciones country o guiones breves donde se busca un tono concreto y reconocible; el modelo funciona como generador de primer borrador, no como autor final.
- Demostraciones offline en ferias, aulas o eventos sin conectividad: el GGUF 4-bit se ejecuta en un portátil con Ollama o LM Studio, sin dependencia de API externa ni de red.
- Pruebas de robustez de persona: evaluar si el modelo abandona el personaje ante peticiones fuera de rol, útil como caso de estudio sobre consistencia de estilo en modelos ajustados con LoRA.
- Base para experimentos de mezcla de adaptadores: al ser un adaptador de estilo sobre un modelo base conocido, puede combinarse con otros LoRA para estudiar interferencias entre ajustes de estilo y de tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta MMLU, HumanEval, GSM8K ni ninguna otra métrica, y no existen cifras de latencia o throughput documentadas. Tampoco se dispone de evaluaciones de terceros, dado que el repositorio registra 0 descargas y 0 likes.

## Requisitos de hardware

- VRAM estimada para el modelo base de 4B: aproximadamente 10-12 GB en bf16 (pesos más caché KV), y aproximadamente 3-4 GB en cuantización GGUF 4-bit con contexto corto.
- VRAM estimada si lo publicado fueran realmente los 333,5 M de parámetros declarados en safetensors: aproximadamente 0,8-1,5 GB en bf16. Esta estimación es orientativa y depende de qué contienen exactamente los safetensors del repositorio.
- GPU recomendadas para 4B en bf16: A100 40 GB, H100 80 GB, L40S, RTX 4090 (24 GB) o RTX 3090 (24 GB).
- GPU de gama consumer: cabe con holgura en RTX 4090, RTX 3090, RTX 4080/4070 Ti (16 GB) y en tarjetas de 8-12 GB si se usa la cuantización 4-bit (RTX 3060 12 GB, RTX 4060 Ti 16 GB, Apple Silicon con memoria unificada de 16 GB o más).
- CPU: la variante GGUF 4-bit es viable en CPU con llama.cpp u Ollama, con velocidades de generación bajas pero funcionales para demos.
- Opciones de despliegue documentadas por el autor: Ollama (con Modelfile propio), LM Studio y Transformers en Python. llama.cpp es compatible de forma implícita al distribuirse GGUF. No se documenta soporte para vLLM, TGI ni SGLang.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| quill-voice/cowboy | 333.514.240 en safetensors (base declarada: 4B) | 2048 tokens | apache-2.0 | HuggingFace, safetensors y GGUF |
| Qwen/Qwen3.5-4B (modelo base) | 4B (declarado) | no disponible en la información proporcionada | no disponible en la información proporcionada | HuggingFace |
| Alternativas de ~3-4B de propósito general (Llama 3.2 3B, Gemma 2 2B, Phi-3.5-mini, etc.) | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones verificadas de alternativas dentro de la información proporcionada, por lo que no es posible establecer una comparación de rendimiento rigurosa.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Ventana de contexto de 2048 tokens, insuficiente para documentos largos, análisis de repositorios de código o conversaciones extensas.
- El propio autor advierte de que el modelo responde en estilo cowboy incluso cuando no es apropiado, lo que lo inhabilita para atención al cliente, soporte técnico o cualquier uso profesional.
- Modelo declarado "para diversión y entretenimiento"; no apto para casos de uso serios o de producción crítica.
- Riesgo de alucinación habitual en modelos de lenguaje de esta escala, agravado por el sesgo de estilo, que puede enmascarar respuestas incorrectas con un tono convincente.
- Discrepancia no resuelta entre los 333.514.240 parámetros de los safetensors y los ~4B del modelo base declarado: hay que verificar el contenido real del repositorio antes de integrarlo.
- Los tags indican `image-text-to-text` y el archivo `cowboy-F16.gguf` se describe como "multimodal projector", pero no hay ninguna documentación que confirme ni explique una capacidad multimodal. No debe asumirse que la tiene.
- Sin benchmarks publicados, sin evaluaciones de terceros y con 0 descargas y 0 likes: no existe evidencia independiente de calidad, seguridad o estabilidad.
- La licencia Apache-2.0 permite uso comercial del ajuste, pero conviene revisar los términos del modelo base Qwen3.5-4B, ya que pueden imponer condiciones adicionales sobre los pesos derivados.
- No se documenta el dataset de entrenamiento, por lo que no puede evaluarse el sesgo introducido ni el riesgo de contaminación de datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/quill-voice/cowboy
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
- Ollama (despliegue local): https://ollama.com
- LM Studio (despliegue local): https://lmstudio.ai
- Nota: los resultados de la búsqueda web no contienen enlaces relevantes a este modelo; devuelven únicamente fichas de tienda de un establecimiento Target en Queensbury, Nueva York, sin relación con el proyecto.
