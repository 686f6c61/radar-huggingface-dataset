# CloudGoat/LFM2.5-2.6B-JP-RollPlay-SFT

## Resumen

LFM2.5-2.6B-JP-RollPlay-SFT es un modelo de lenguaje afinado por el usuario CloudGoat a partir del modelo base LiquidAI/LFM2.5-2.6B, desarrollado por Liquid AI. El objetivo es adaptar el modelo para el roleplay en japonés, es decir, para mantener diálogos de ficción con personajes, incluyendo narración de acciones y emociones entre paréntesis. El modelo se ha entrenado mediante QLoRA en 4 bits sobre un conjunto de datos de roleplay japonés, combinando dos datasets públicos. Con aproximadamente 2,7 mil millones de parámetros, ofrece una capacidad razonable para tareas de conversación en japonés con un coste computacional reducido, pensado para ejecutarse en hardware de consumo.

El modelo es relevante porque aprovecha la arquitectura híbrida del LFM2.5-2.6B, que está diseñada para despliegue en dispositivos con alta eficiencia y velocidad. Aunque el modelo base es agéntico y soporta tool calling, el fine-tune se ha orientado específicamente a la generación de texto narrativo y conversacional en japonés, sin que se hayan validado sus capacidades agénticas tras el ajuste. La ventana de contexto se ha limitado a 2048 tokens durante el entrenamiento, lo que condiciona el alcance de las conversaciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (LFM2.5, basada en LiquidAI/LFM2.5-2.6B) |
| Parametros totales | 2.697.198.592 (2,7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (limitada durante el entrenamiento) |
| Tipos de cuantizacion | safetensors (FP16/BF16); entrenado con QLoRA 4-bit |
| Idiomas soportados | Japonés (ja) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base, LiquidAI/LFM2.5-2.6B, emplea una arquitectura híbrida propia de Liquid AI, que combina mecanismos de atención con bloques de espacio de estados (SSM) para lograr un alto rendimiento con un número reducido de parámetros. No se dispone de más detalles sobre la arquitectura interna en la información proporcionada. El fine-tuning se realizó mediante QLoRA en 4 bits, utilizando las librerías Unsloth y TRL SFTTrainer. Se entrenó durante una época sobre un total de aproximadamente 28.000 ejemplos de diálogos de roleplay en japonés: unos 4.000 extraídos de CausalLM/Kingfall-Roleplay y unos 24.000 de OmniAICreator/Japanese-Roleplay-Dialogues. El hardware empleado fue una NVIDIA GeForce RTX 3060 con 12 GB de VRAM. Los hiperparámetros principales incluyen una longitud máxima de secuencia de 2048 tokens, un tamaño de lote efectivo de 16, una tasa de aprendizaje de 2e-4 con programación coseno y un optimizador AdamW de 8 bits. El adaptador LoRA se aplicó a todas las capas lineales con r=16, alpha=32 y dropout=0. No se menciona el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Generación de diálogos de roleplay en japonés, incluyendo líneas de diálogo y narración de acciones y emociones entre paréntesis (ト書き).
- Mantenimiento de conversaciones multi-turno con historial, permitiendo escenarios de situación prolongados.
- Adaptación a personajes y contextos definidos mediante el sistema de prompt.
- Generación de texto narrativo en japonés, con coherencia en la descripción de acciones y sentimientos de los personajes.
- No se documentan capacidades de tool calling, razonamiento multi-paso ni otras habilidades agénticas en este modelo afinado; el modelo base sí las posee, pero el ajuste se ha orientado exclusivamente a roleplay.

## Casos de uso

- Juegos de rol por chat en japonés: el modelo puede gestionar diálogos y narraciones de acciones de personajes en escenarios de fantasía o ciencia ficción, gracias a su entrenamiento específico en roleplay.
- Novelas interactivas: permite generar historias ramificadas donde el usuario elige las acciones del protagonista y el modelo describe las consecuencias.
- Chatbots de personajes (waifu, héroes, villanos): se puede integrar en aplicaciones de mensajería para simular conversaciones con personajes ficticios, siempre que se fije el nombre y la personalidad en el prompt del sistema.
- Asistente de escritura creativa en japonés: ayuda a los escritores a generar diálogos y descripciones de escenas para sus obras, ahorrando tiempo en la redacción de borradores.
- Simulación de diálogos para juegos de rol de mesa: el modelo puede actuar como máster de juego o como un personaje no jugador en partidas de rol por texto.
- Fine-tuning adicional: al ser un modelo de tamaño reducido, se puede volver a ajustar para dominios específicos de roleplay (género, época, estilo) con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar, y tampoco se han comparado con modelos similares. El rendimiento en tareas de roleplay se describe cualitativamente en la model card, pero no hay métricas cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: con los pesos en FP16, el modelo ocupa aproximadamente 5,5 GB, por lo que puede ejecutarse en GPUs con al menos 6 GB de VRAM. Con cuantización en 4 bits, el tamaño se reduce a unos 1,5 GB, lo que permite ejecutarlo en tarjetas con 2-4 GB de VRAM.
- GPU recomendadas: NVIDIA GeForce RTX 3060 (12 GB) o superior, también compatible con GTX 1080 Ti, RTX 2070, RTX 3060 Ti, etc. Para una inferencia más rápida, se recomiendan GPU como RTX 3090 o RTX 4080, aunque no son necesarias.
- Sí cabe en GPU de consumo: es posible ejecutarlo en una RTX 3060 o incluso en tarjetas más modestas si se usa cuantización.
- Opciones de despliegue: puede utilizarse con Transformers de Hugging Face, llama.cpp (si se convierte a GGUF), Ollama (tras conversión), vLLM, TGI u otros servidores de inferencia.
- Latencia y rendimiento: no se ha medido específicamente para este modelo, pero el modelo base LFM2.5-2.6B alcanza unos 220 tokens por segundo en menos de 2,5 GB de memoria según Liquid AI. Se espera un rendimiento similar en el modelo afinado, dependiendo del hardware.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas específicas de la misma categoría (roleplay en japonés). No hay datos de modelos comparables en la información proporcionada. Se puede mencionar que el modelo base LFM2.5-2.6B tiene capacidades agénticas y de tool calling, pero el fine-tuning no las ha preservado de forma documentada.

## Limitaciones y advertencias

- El modelo está entrenado únicamente para japonés; no se espera que responda correctamente en otros idiomas.
- La ventana de contexto está limitada a 2048 tokens, lo que restringe la duración de las conversaciones y la cantidad de historial que se puede mantener.
- Según la model card, el modelo puede sobreaprender nombres propios del dataset de entrenamiento, lo que provoca que a veces mencione nombres de personajes de los datos de entrenamiento si no se fija explícitamente el nombre en el prompt del sistema.
- Tiende a representar ambos roles (el del usuario y el suyo) en una misma respuesta si no se limita el número de tokens de salida. Se recomienda restringir `max_new_tokens` a 150 o usar el flag DRY de llama.cpp para mitigarlo.
- No se indica la licencia, lo que supone un riesgo para su uso comercial. La falta de licencia explícita puede implicar que el modelo no pueda utilizarse en producción sin aclaración del autor.
- No se han evaluado los sesgos, la alucinación o los riesgos de seguridad. Al ser un modelo de roleplay, puede generar contenido ficticio inapropiado según el contexto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CloudGoat/LFM2.5-2.6B-JP-RollPlay-SFT
- Blog de Liquid AI sobre LFM2.5-2.6B: https://www.liquid.ai/blog/lfm2-5-2-6b
- Modelo relacionado (base): LiquidAI/LFM2.5-2.6B (en Hugging Face)
- Modelos relacionados del mismo autor: CloudGoat/LFM2.5-2.6B-JP y CloudGoat/LFM2.5-2.6B-JP-GGUF (en Hugging Face)
