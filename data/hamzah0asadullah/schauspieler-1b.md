# hamzah0asadullah/Schauspieler-1B

## Resumen

Schauspieler 1B es un ajuste fino (finetune) del modelo Qwen/Qwen3.5-0.8B, desarrollado por el usuario independiente hamzah0asadullah, especializado en generación de texto para roleplay y conversación de personajes. Pese a la denominación "1B" en el nombre, el recuento real de parámetros en los pesos safetensors es de 752.393.024 (aproximadamente 0,75 mil millones), coherente con su base Qwen3.5-0.8B. El modelo se distribuye bajo licencia Apache 2.0.

El modelo se entrenó sobre el conjunto de datos Gryphe/Sonnet3.5-Charcard-Roleplay, un corpus orientado a fichas de personaje y diálogo roleplay, usando una GPU de consumo AMD RX 7900 XT durante unas 26 horas y tres épocas. Según la model card, la precisión media de tokens en evaluación pasó de aproximadamente 0,5 a 0,7 durante el entrenamiento. Es relevante para desarrolladores que necesitan un modelo pequeño, desplegable en hardware modesto, para aplicaciones de personajes conversacionales o agentes de rol.

La arquitectura subyacente corresponde a la familia Qwen3.5 en su variante de texto (tag `qwen3_5_text`), con pipeline de text-generation y pesos en formato safetensors compatibles con transformers. El autor indica que una versión basada en LFM3-1.7B (Schauspieler 2B) está en preparación, lo que sitúa a esta entrega como un primer paso dentro de una línea de modelos de roleplay de bajo coste computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (variante de texto, tag `qwen3_5_text`) |
| Parametros totales | 752.393.024 (aprox. 0,75B) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (según la model card: `language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer de la familia Qwen3.5 en su variante de texto. No se documentan en la información disponible innovaciones arquitectónicas propias: Schauspieler 1B es un ajuste fino supervisado sobre dicha base, sin que la model card detalle si se emplearon técnicas adicionales como RLHF o DPO. El entrenamiento se realizó sobre el dataset Gryphe/Sonnet3.5-Charcard-Roleplay, orientado a fichas de personaje y conversaciones de rol.

El proceso de entrenamiento se llevó a cabo en una única GPU AMD RX 7900 XT durante aproximadamente 26 horas, a lo largo de tres épocas. El autor reporta que la precisión media de tokens en el conjunto de evaluación evolucionó de aproximadamente 0,5 a 0,7. No se especifican el número total de tokens de entrenamiento, la composición detallada del dataset ni la existencia de fases de alineación adicionales. El formato de chat empleado es ChatML, con parámetros de generación heredados del modelo upstream: `temperature=0.6`, `top_p=0.95`, `top_k=20`, `min_p=0.0`, `presence_penalty=0.0` y `repetition_penalty=1.0`.

## Capacidades

- Generación de texto conversacional orientada a roleplay y personajes, con soporte para fichas de personaje en el mensaje de sistema.
- Interpretación de acciones entre asteriscos y diálogo en texto plano, según el formato ChatML documentado.
- Conversación multi-turno dentro del contexto soportado por el modelo base (longitud no especificada).
- Capacidad de "thinking" mencionada por el autor como incierta ("may or may not work"), sin garantía de funcionamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Roleplay conversacional en aplicaciones de chat: el modelo está entrenado específicamente sobre fichas de personaje y diálogo, por lo que puede mantener personajes coherentes con descripciones de personalidad, apariencia y trasfondo definidas en el mensaje de sistema en formato ChatML.
- Prototipado de videojuegos narrativos: al ser un modelo de menos de 1B de parámetros, puede ejecutarse en hardware de consumo para generar diálogos de NPC en tiempo real durante fases de desarrollo, sin depender de APIs externas.
- Generación de ficción interactiva: su entrenamiento sobre Sonnet3.5-Charcard-Roleplay lo hace adecuado para historias colaborativas donde el usuario interpreta acciones entre asteriscos y el modelo responde en personaje.
- Asistentes de escritura creativa para guionización de personajes: útil para explorar voces y registros de personajes en borradores, con la ventaja de un coste computacional bajo.
- Despliegue en entornos con recursos limitados: al ocupar aproximadamente 1,5 GB en safetensors y contar con unos 752 millones de parámetros, puede servirse en GPUs de consumo o incluso en CPU con cuantización, aunque el autor no publica variantes GGUF.
- Investigación sobre ajuste fino eficiente: sirve como referencia de un finetune de roleplay realizado en una sola GPU AMD de consumo, útil para estudiar metodologías de entrenamiento de bajo presupuesto.
- Chatbots de entretenimiento en comunidades de rol: integrable en plataformas tipo KoboldAI (el autor referencia el Discord de KoboldAI), donde los modelos pequeños de rol son habituales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado por el autor es la precisión media de tokens en evaluación, que pasó de aproximadamente 0,5 a 0,7 durante el entrenamiento, sin comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB en precisión completa (FP16/BF16) para los 752 millones de parámetros; menos de 1 GB con cuantización de 8 bits o 4 bits, aunque el autor no publica pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM para FP16; el propio autor entrenó en una AMD RX 7900 XT, lo que confirma compatibilidad con hardware de consumo AMD.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060, RTX 4060, RTX 4090 o equivalentes AMD, e incluso en GPUs de gama baja con cuantización.
- Opciones de despliegue: transformers (librería declarada); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y no hay pesos GGUF publicados en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Schauspieler 1B | 752M | no disponible | Apache 2.0 | Roleplay (finetune de Qwen3.5-0.8B) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | no disponible en la información | Texto general |
| Schauspieler 2B (anunciado, LFM3-1.7B) | ~1,7B | no disponible | no disponible | Roleplay (en preparación) |

No se dispone de datos de benchmarks ni de contexto para establecer comparaciones cuantitativas con alternativas de la misma categoría. La comparación se limita a parámetros, licencia y enfoque declarado.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre un dataset de roleplay, puede reproducir estereotipos presentes en fichas de personaje.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño; no se han publicado evaluaciones específicas de factualidad.
- Limitaciones de idioma: la model card declara únicamente inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto: no especificada, lo que dificulta planificar conversaciones largas o documentos extensos.
- Capacidad de "thinking" incierta: el propio autor advierte que puede o no funcionar.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-0.8B puede tener condiciones adicionales que conviene verificar antes de producción.
- Modelo de nicho y con muy poca tracción (1 like, 497 descargas en la información disponible): no hay garantía de mantenimiento ni de soporte.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos con herramientas que dependen de esos formatos.

## Enlaces

- Hugging Face: https://huggingface.co/hamzah0asadullah/Schauspieler-1B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/Gryphe/Sonnet3.5-Charcard-Roleplay
- Apoyo al autor (Ko-fi): https://ko-fi.com/hamzah0asadullah
- Imagen de portada (Danbooru): https://danbooru.donmai.us/posts/12564447?q=kinoko_no_sato
