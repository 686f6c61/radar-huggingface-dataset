# mohammedqarnuon/Qarnonai

## Resumen

Qarnonai es un modelo de generación de texto en árabe desarrollado por la empresa MQ, liderada por Mohammed Qarnuon. Se trata de un adaptador LoRA construido sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct, lo que lo convierte en una solución ligera y rápida para tareas conversacionales en árabe. El modelo está diseñado para responder preguntas y mantener diálogos en árabe con un coste computacional reducido, aprovechando la arquitectura del modelo base de 1.500 millones de parámetros.

La relevancia de este modelo radica en su enfoque específico para el árabe, un idioma con menos recursos que el inglés en el ecosistema de modelos abiertos. Al ser un LoRA, permite ajustar un modelo ya entrenado sin necesidad de reentrenar todos los parámetros, lo que facilita su despliegue en entornos con recursos limitados. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas, y su tamaño de repositorio de 0,2 GB lo hace accesible para inferencia en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (adaptador LoRA sobre Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.500 millones (modelo base) + adaptador LoRA (tamano no especificado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, presumiblemente 32.768 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors; no se mencionan cuantizaciones) |
| Idiomas soportados | arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado sobre Qwen2.5-1.5B-Instruct, un modelo transformer causal con arquitectura estándar de Qwen2.5. El adaptador modifica las capas de atención y feed-forward del modelo base para especializarlo en árabe conversacional. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni el método de ajuste (si se usó SFT, RLHF o DPO). La información disponible solo indica que es un LoRA y que el modelo base es Qwen2.5-1.5B-Instruct, que ya incluye entrenamiento instructivo y soporte de chat.

No se documentan innovaciones técnicas adicionales más allá del uso de LoRA, que reduce significativamente el número de parámetros entrenables y los requisitos de memoria durante el ajuste. El modelo base Qwen2.5-1.5B-Instruct incorpora atención con ventana deslizante y soporte de contexto largo, pero no se confirma si el adaptador hereda todas estas capacidades.

## Capacidades

- Generación de texto en árabe: el modelo está especializado en respuestas conversacionales y preguntas-respuestas en árabe.
- Soporte de chat: al estar basado en Qwen2.5-Instruct, hereda el formato de chat con plantilla de mensajes (system, user, assistant).
- Razonamiento básico: el modelo base de 1.5B tiene capacidades limitadas de razonamiento, pero suficientes para tareas conversacionales simples.
- Multilingüismo: no disponible, el modelo está enfocado exclusivamente al árabe.
- Tool calling: no disponible, no se menciona soporte para function calling.
- Capacidades de agente: no disponible, no se documenta soporte para razonamiento multi-paso o uso de herramientas.
- Otras capacidades: no se especifican (sin visión, audio, ni modo thinking).

## Casos de uso

- Asistente conversacional en árabe: el modelo puede integrarse en chatbots para atención al cliente o asistentes virtuales en árabe, respondiendo preguntas frecuentes y manteniendo diálogos multi-turno gracias a su formato instructivo.
- Generación de contenido en árabe: redacción de textos breves, correos o respuestas automáticas en árabe para aplicaciones de productividad.
- Educación y tutoría: responder preguntas de estudiantes en árabe sobre temas generales, aprovechando el conocimiento del modelo base.
- Traducción y paráfrasis básica: aunque no está especializado en traducción, puede reformular o simplificar texto en árabe.
- Prototipado rápido: al ser un modelo pequeño (1.5B) y ligero (0,2 GB), es adecuado para pruebas de concepto y desarrollo de aplicaciones en entornos con recursos limitados.
- Aplicaciones móviles o edge: su tamaño reducido permite desplegarlo en dispositivos con poca memoria, como móviles o Raspberry Pi, para asistentes offline en árabe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo. Tampoco se proporcionan comparativas con otros modelos árabes.

## Requisitos de hardware

- VRAM estimada: para el modelo base de 1.5B en FP16, se requieren aproximadamente 3-4 GB de VRAM. Con el adaptador LoRA, el requisito adicional es mínimo (menos de 0,5 GB). En cuantización INT8 o INT4, podría funcionar con 2-3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o GPUs de datacenter como T4 o A10.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo de gama media y baja.
- Opciones de despliegue: transformers (Python), vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta), TGI (Text Generation Inference).
- Latencia y throughput: no disponible, pero al ser un modelo de 1.5B, la generación es rápida en GPUs modernas (típicamente >50 tokens/s en una RTX 4090, aunque no confirmado).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Qarnonai (LoRA sobre Qwen2.5-1.5B) | 1.5B | no disponible | arabe | Apache 2.0 | Adaptador LoRA, ligero |
| Qwen2.5-1.5B-Instruct (base) | 1.5B | 32.768 (oficial) | multilingue (incluye arabe) | Apache 2.0 | Modelo base sin ajuste especifico |
| Jais-13B (Core42) | 13B | 8.192 | arabe/ingles | Apache 2.0 | Modelo arabe mas grande, requiere mas recursos |
| AceGPT-7B (adaptacion de LLaMA-2) | 7B | 4.096 | arabe/ingles | no comercial | Enfocado en arabe, pero con licencia restrictiva |

Qarnonai se posiciona como una opción ultra-ligera frente a modelos árabes más grandes como Jais-13B o AceGPT-7B. Su ventaja es el bajo coste de inferencia y la licencia permisiva, pero su capacidad es limitada por el tamaño del modelo base.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan, pero al ser un ajuste sobre Qwen2.5, puede heredar sesgos del modelo base, que está entrenado principalmente con datos en inglés y chino, lo que puede afectar la calidad del árabe en dominios específicos.
- Riesgo de alucinación: alto en modelos pequeños como este, especialmente en tareas de razonamiento o hechos factuales. Se recomienda verificar respuestas críticas.
- Limitaciones de contexto: no se confirma la longitud de contexto efectiva tras el ajuste LoRA. El modelo base soporta 32.768 tokens, pero el adaptador podría no aprovecharlo completamente.
- Limitaciones de idioma: solo árabe, no soporta otros idiomas de forma fiable.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-1.5B-Instruct también es Apache 2.0, por lo que no hay restricciones adicionales.
- Caveat de producción: no hay información sobre evaluación de seguridad, sesgos o robustez. No se recomienda para aplicaciones críticas sin pruebas adicionales.
- Mantenimiento: el modelo fue creado en 2026 y actualizado en agosto de 2026, pero no hay evidencia de soporte continuo o comunidad activa (0 descargas, 0 likes).

## Enlaces

- HuggingFace del modelo: https://huggingface.co/mohammedqarnuon/Qarnonai
- Perfil del autor: https://huggingface.co/mohammedqarnuon
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio relacionado (MLQarnonai): https://huggingface.co/mohammedqarnuon/MLQarnonai
- Repositorio relacionado (qarnon-ai-v1): https://huggingface.co/mohammedqarnuon/qarnon-ai-v1
- Despliegue en FriendliAI: https://friendli.ai/models/mohammedqarnuon/Qarnon-AI
