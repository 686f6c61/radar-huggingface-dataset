# muradil211/AetherSearch-SFT

## Resumen

AetherSearch-SFT es un modelo de búsqueda agéntica (agentic search) de 3.000 millones de parámetros, desarrollado por muradil211 como parte del proyecto AetherSearch. Se trata de un fine-tuning del modelo Qwen2.5-3B-Instruct sobre 2.000 trayectorias de búsqueda completas, con el objetivo de que el modelo aprenda a razonar sobre qué información le falta, emitir consultas de búsqueda estructuradas y generar respuestas fundamentadas en la evidencia recuperada.

El modelo resuelve el problema de la generación aumentada por búsqueda (search-augmented generation) de forma agéntica: en lugar de depender de un pipeline RAG externo que inyecta contexto de forma pasiva, el propio modelo decide cuándo buscar, qué consulta formular y cuándo tiene suficiente evidencia para responder. Esto lo hace relevante para sistemas de respuesta a preguntas, asistentes de investigación y agentes conversacionales que necesitan acceso a información externa actualizada.

La arquitectura es un transformer causal de la familia Qwen2, con una ventana de contexto de 32.768 posiciones (aunque el entrenamiento se limitó a secuencias de 4.096 tokens). El modelo está disponible en formato SafeTensors con pesos en BF16, y su licencia no está especificada en la ficha de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 causal language model (transformer decoder-only) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 posiciones (entrenamiento limitado a 4.096) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | SafeTensors (BF16, dos shards) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-3B-Instruct, un transformer causal con atención de ventana deslizante y atención completa alternadas, normalización RMSNorm y activación SwiGLU. Sobre esta base, AetherSearch-SFT se entrena mediante una única etapa de supervised fine-tuning (SFT) sobre 2.000 trayectorias de búsqueda completas, de las cuales 1.025 son de búsqueda única y 975 de búsqueda múltiple.

El protocolo de entrenamiento define un contrato de supervisión estricto: los tokens del sistema, usuario y pregunta se enmascaran en la pérdida, así como los tramos completos de `<information>...</information>` (la evidencia recuperada). Solo se supervisan los tramos de razonamiento (`thinking`), las consultas de búsqueda (`<search>`) y las respuestas finales (`<answer>`), junto con el token final `<|im_end|>`. Esto fuerza al modelo a aprender a generar consultas de búsqueda y respuestas fundamentadas sin que la evidencia inyectada contribuya directamente a la pérdida.

La receta de entrenamiento es reproducible: una época, tasa de aprendizaje 2e-6 con programación coseno, tamaño de lote global 24, precisión BF16 con TF32, checkpointing de gradientes, padding dinámico y DeepSpeed ZeRO-3. El dataset público `muradil211/AetherSearch_SFT` incluye el checksum SHA-256 de los datos canónicos.

## Capacidades

- Generación de texto con razonamiento explícito: el modelo emite un bloque de `thinking` antes de decidir si necesita buscar o responder directamente.
- Búsqueda agéntica: genera consultas de búsqueda estructuradas en formato `<search>consulta</search>` y consume la evidencia devuelta en `<information>...</information>`.
- Búsqueda múltiple: puede iterar varias veces sobre el bucle de búsqueda si la primera ronda no es suficiente, gracias a las 975 trayectorias multi-búsqueda del entrenamiento.
- Respuestas fundamentadas en evidencia: el modelo aprende a citar o parafrasear la información recuperada dentro de `<answer>`, reduciendo la probabilidad de alucinación cuando el runtime le proporciona contexto relevante.
- Protocolo XML propietario: el modelo espera un formato de interacción específico (system, user, assistant con spans de thinking, search, information y answer) que debe preservarse exactamente en producción.
- Soporte multilingüe: no disponible; el modelo está entrenado únicamente en inglés.

## Casos de uso

- Asistentes de investigación documental: el modelo puede formular consultas de búsqueda sobre una base de conocimiento corporativa, recuperar pasajes relevantes y sintetizar una respuesta con citas, reduciendo el tiempo de revisión manual de documentos.
- Sistemas de respuesta a preguntas con verificación: en un entorno de atención al cliente, el modelo consulta una base de artículos o FAQs, verifica la información antes de responder y evita inventar políticas o datos no confirmados.
- Agentes de generación de informes: dado un tema, el modelo decide qué buscar, recopila evidencia de múltiples fuentes y redacta un resumen estructurado, útil para analistas que necesitan informes preliminares.
- Chatbots con grounding en datos actualizados: al integrarse con un motor de búsqueda web o una API de noticias, el modelo puede responder sobre eventos recientes sin necesidad de reentrenamiento, gracias a su bucle de recuperación.
- Automatización de soporte técnico de nivel 1: el modelo diagnostica problemas consultando una base de conocimiento técnica, emite consultas de búsqueda específicas y proporciona pasos de resolución basados en la documentación recuperada.
- Prototipado de pipelines RAG agénticos: por su tamaño compacto (3B) y su protocolo bien definido, sirve como banco de pruebas para investigar estrategias de búsqueda adaptativa, comparando políticas de cuándo buscar frente a responder directamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de búsqueda. El repositorio de GitHub menciona un directorio de evaluación (`AetherSearch-Eval` en HuggingFace), pero no se proporcionan números concretos en la documentación accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 6,2 GB. Con la ventana de contexto máxima de 32.768 tokens, se recomienda al menos 12-16 GB de VRAM para evitar desbordamientos; con secuencias de 4.096 tokens (las usadas en entrenamiento), 8 GB pueden ser suficientes.
- GPU recomendadas: RTX 3090, RTX 4090, A100 40 GB o superiores. En consumer, una RTX 4070 Ti Super (16 GB) o RTX 4080 (16 GB) pueden ejecutar el modelo con secuencias moderadas.
- Opciones de despliegue: compatible con Hugging Face Transformers (carga directa con `AutoModelForCausalLM`), vLLM, Text Generation Inference (TGI) y, tras conversión a GGUF, llama.cpp y Ollama.
- Latencia y throughput estimados: no disponibles. Al ser un modelo de 3B, se espera una latencia de decodificación de decenas de tokens por segundo en GPUs modernas, pero el bucle de búsqueda añade latencia de red y de recuperación que domina el tiempo total de respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| AetherSearch-SFT | 3,09 B | 32.768 | Búsqueda agéntica (SFT) | no disponible |
| Qwen2.5-3B-Instruct (base) | 3,09 B | 32.768 | Chat/instrucciones general | Apache 2.0 |
| AetherSearch (modelo completo) | 3 B | no disponible | Búsqueda agéntica (SFT + DPO + RL) | no disponible |

La comparativa directa con otros modelos de búsqueda agéntica de tamaño similar no está disponible en la información proporcionada. Frente a su modelo base, AetherSearch-SFT añade el protocolo de búsqueda estructurada y el entrenamiento en trayectorias, pero pierde parte de la generalidad conversacional de Qwen2.5-Instruct. El proyecto AetherSearch también publica una versión completa entrenada con DPO y reinforcement learning, que probablemente ofrezca mayor robustez, aunque no se detallan sus pesos en esta ficha.

## Limitaciones y advertencias

- Dependencia de un runtime externo: el modelo no ejecuta búsquedas por sí mismo; requiere un orquestador que intercepte los spans `<search>`, ejecute la consulta contra un backend de recuperación y devuelva la evidencia en `<information>`. Sin este bucle, el modelo no puede completar su tarea.
- Entrenamiento limitado: solo 2.000 trayectorias y una única época, lo que puede provocar sobreajuste a los patrones del dataset y menor generalización a dominios o formatos de consulta no vistos.
- Idioma único: el modelo solo soporta inglés; no es adecuado para despliegues multilingües sin adaptación adicional.
- Riesgo de alucinación: aunque el entrenamiento enmascara la evidencia en la pérdida, el modelo puede generar respuestas plausibles sin evidencia suficiente si el runtime no devuelve información relevante; no hay garantía de verificación factual.
- Licencia no especificada: a diferencia del modelo base (Apache 2.0), la licencia de este fine-tuning no está declarada, lo que genera incertidumbre legal para uso comercial.
- Ventana de contexto teórica vs. práctica: aunque el modelo soporta 32.768 posiciones, el entrenamiento se limitó a 4.096 tokens, por lo que el comportamiento con contextos largos puede degradarse.
- Sin benchmarks publicados: no hay métricas objetivas que permitan comparar su rendimiento con alternativas; cualquier evaluación debe realizarse de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/muradil211/AetherSearch-SFT
- Dataset de entrenamiento: https://huggingface.co/datasets/muradil211/AetherSearch_SFT
- Repositorio del proyecto: https://github.com/Muradil-mamat-211/AetherSearch
- Código de entrenamiento SFT: https://github.com/Muradil-mamat-211/AetherSearch/tree/main/sft
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Modelo AetherSearch completo: https://huggingface.co/muradil211/AetherSearch
- Conjunto de evaluación: https://huggingface.co/muradil211/AetherSearch-Eval
- Despliegue en FriendliAI: https://friendli.ai/models/muradil211/AetherSearch
