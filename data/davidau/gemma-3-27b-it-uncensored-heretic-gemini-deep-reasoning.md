# DavidAU/Gemma-3-27b-it-Uncensored-HERETIC-Gemini-Deep-Reasoning

## Resumen

Gemma-3-27b-it-Uncensored-HERETIC-Gemini-Deep-Reasoning es un ajuste fino (fine-tune) del modelo Gemma 3 27B de Google, publicado por el usuario DavidAU en Hugging Face. Se construye sobre `coder3101/gemma-3-27b-it-heretic`, una variante a la que se le han eliminado los mecanismos de rechazo (refusals) mediante la herramienta Heretic, y se entrena con el dataset `TeichAI/gemini-3-pro-preview-high-reasoning-250x` usando Unsloth. El objetivo declarado es ofrecer un modelo de 27B con capacidades de razonamiento profundo ("deep thinking") y sin censura, manteniendo intacta la funcionalidad de procesamiento de imágenes.

El modelo conserva la arquitectura multimodal de Gemma 3 (entrada image-text-to-text) y una ventana de contexto de 128k tokens según la model card. Con 27.432.406.640 parámetros reales en safetensors, se posiciona en la gama de modelos densos de tamaño medio-grande, apto para despliegues en GPUs de 48-80 GB en precisión completa o cuantizado para hardware más modesto.

Su relevancia actual radica en dos ejes: por un lado, la eliminación de rechazos con una divergencia KL muy baja (0,07) respecto al modelo original, lo que sugiere que el "abliterating" no degrada gravemente el modelo; por otro, la incorporación de razonamiento estilo "thinking" activable por prompt o por plantilla Jinja. Es un modelo orientado a experimentación, roleplay y generación creativa sin restricciones, no a producción con garantías de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3), image-text-to-text |
| Parametros totales | 27.432.406.640 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 128k tokens (según model card) |
| Tipos de cuantizacion | no disponible (el autor menciona GGUF, EXL2, AWQ, GPTQ, HQQ en su colección de ficheros fuente) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 3 27B, un transformer multimodal de Google que procesa texto e imágenes. Sobre esa base, `coder3101/gemma-3-27b-it-heretic` aplica la técnica de "abliteration" mediante la herramienta Heretic del equipo P-E-W, que elimina direcciones de activación asociadas a rechazos sin reentrenar. DavidAU realiza después un fine-tune con Unsloth sobre el dataset `TeichAI/gemini-3-pro-preview-high-reasoning-250x`, orientado a inducir razonamiento profundo estilo Gemini. El autor reporta una divergencia KL de 0,07 frente al Gemma 3 original y una reducción de rechazos de 98/100 a 9/100 en su evaluación interna.

La innovación principal es la combinación de "de-censoring" de bajo daño con razonamiento activable. El modelo incluye dos plantillas Jinja (`chat-template.jinja` y `chat-template-thinking.jinja`) para forzar el modo pensamiento, y acepta el prefijo "think deeply:" para activarlo. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF/DPO adicionales más allá del fine-tune supervisado.

## Capacidades

- Generación de texto conversacional y multimodal (image-text-to-text), con procesamiento de imágenes intacto.
- Razonamiento profundo ("deep thinking") activable por fine-tune, por prompt ("think deeply:") o por plantilla Jinja de pensamiento.
- Generación de contenido sin censura: no rechaza peticiones de contenido explícito, violento o con lenguaje soez (9/100 rechazos según el autor).
- Roleplay y personificación mediante system prompts (el autor incluye un ejemplo estilo "Joker").
- Capacidades multilingües limitadas al inglés según la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no documentado explícitamente, aunque el modo pensamiento facilita cadenas de razonamiento.

## Casos de uso

- Roleplay y narrativa interactiva sin restricciones: el modelo mantiene coherencia en conversaciones multi-turno con 128k de contexto y acepta system prompts de personaje, lo que lo hace adecuado para plataformas tipo Silly Tavern con parámetros de "smoothing" ajustados a 1,5.
- Generación creativa de ficción explícita o de terror: al no rechazar contenido gráfico, permite escribir escenas violentas o adultas; el autor advierte que en algunos casos hay que dirigir el tono con instrucciones explícitas de vocabulario.
- Análisis de imágenes con razonamiento: al conservar el pipeline image-text-to-text, puede describir, interpretar o razonar sobre imágenes adjuntas, combinando visión y modo pensamiento.
- Investigación sobre alineación y seguridad: sirve como caso de estudio de abliteration con KL bajo (0,07) para medir el impacto del de-censoring en benchmarks estándar (ARC, HellaSwag, etc.).
- Asistente de razonamiento en tareas analíticas: el modo "think deeply" permite descomponer problemas complejos en pasos intermedios antes de responder, útil en prototipos de agentes.
- Experimentación con plantillas de chat: los dos ficheros Jinja permiten comparar comportamiento con y sin "thinking system prompt" en pipelines de transformers o TGI.
- Despliegue local en cuantización: el autor publica ficheros fuente para GGUF, EXL2, AWQ, GPTQ y HQQ, lo que facilita probarlo en KoboldCpp o text-generation-webui.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Benchmark | Este modelo | Base Heretic (uncensored) |
|---|---|---|
| ARC Challenge | 0,596 | 0,557 |
| ARC Easy | 0,748 | 0,711 |
| BoolQ | 0,881 | 0,868 |
| HellaSwag | 0,779 | 0,533 |
| OpenBookQA | 0,458 | 0,452 |
| PIQA | 0,819 | 0,706 |
| Winogrande | 0,751 | 0,695 |

| Métrica de de-censoring | Este modelo | google/gemma-3-27b-it |
|---|---|---|
| Divergencia KL | 0,07 | 0 (por definición) |
| Rechazos | 9/100 | 98/100 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de razonamiento estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 55 GB solo para pesos, más overhead de activaciones y KV cache; requiere GPU de 80 GB (A100, H100) para contexto largo.
- Cuantización a 8 bits: ~28-30 GB, viable en A100 40 GB o RTX 6000 Ada.
- Cuantización a 4 bits (GGUF Q4, GPTQ, AWQ): ~15-18 GB, cabe en RTX 4090 (24 GB) y RTX 3090, con contexto reducido.
- Opciones de despliegue: transformers, text-generation-inference (TGI, etiqueta endpoints_compatible), llama.cpp/KoboldCpp para GGUF, text-generation-webui (requiere llama_HF para GGUF), vLLM no confirmado en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (Gemma-3-27b-it-Uncensored-HERETIC-Gemini-Deep-Reasoning) | 27,4B | 128k | apache-2.0 | Fine-tune sin censura con razonamiento; solo inglés |
| coder3101/gemma-3-27b-it-heretic | 27B | 128k (heredado) | apache-2.0 | Base directa; sin fine-tune de razonamiento |
| google/gemma-3-27b-it | 27B | 128k | Gemma license | Modelo original con censura (98/100 rechazos) |
| Gemma 3 12B / 4B | 12B / 4B | 128k | Gemma license | Alternativas más pequeñas de la misma familia para hardware limitado |

No se dispone de datos comparativos de benchmarks frente a otros modelos uncensored de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo explícitamente sin censura: puede generar contenido violento, sexual o con lenguaje ofensivo; inadecuado para aplicaciones de cara al público sin filtros adicionales.
- Solo soporta inglés según la model card; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación inherente a modelos de 27B; el modo "thinking" no elimina este riesgo y puede amplificar razonamientos incorrectos.
- El autor advierte que, pese a la falta de rechazos, el modelo necesita dirección explícita (vocabulario, tono) para alcanzar niveles gráficos o explícitos, ya que sus valores por defecto son "tame".
- La licencia apache-2.0 se declara en la model card, pero el modelo base Gemma 3 de Google está sujeto a la Gemma Terms of Use; conviene verificar la compatibilidad para uso comercial.
- Divergencia KL de 0,07 indica cierto daño respecto al original; los benchmarks no cubren razonamiento, matemáticas ni código.
- Requiere ajustes de muestreo específicos (smoothing_factor 1,5, repetition penalty 1,1-1,15) para operar con fluidez en herramientas de chat.
- No hay datos publicados de tool calling ni de despliegue con vLLM; la integración en producción requiere validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Gemma-3-27b-it-Uncensored-HERETIC-Gemini-Deep-Reasoning
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Ficheros fuente para GGUF/EXL2/AWQ/GPTQ/HQQ: https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
- Modelo base: https://huggingface.co/coder3101/gemma-3-27b-it-heretic
- Modelo original: https://huggingface.co/google/gemma-3-27b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/TeichAI/gemini-3-pro-preview-high-reasoning-250x
