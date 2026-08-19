# cloudbjorn/Qwen3.8-27B-Yes-Man-uncensored-GGUF

## Resumen

El modelo `cloudbjorn/Qwen3.8-27B-Yes-Man-uncensored-GGUF` es una cuantización en formato GGUF (Q4_K_M) de un fine-tune comportamental del modelo Qwen3.8-27B, desarrollado por el usuario cloudbjorn. El fine-tune, inspirado en el personaje Yes Man de *Fallout: New Vegas*, busca reducir la tendencia del asistente a negarse, moralizar o ser evasivo en temas sensibles (medicina, política, religión, sexualidad, etc.) manteniendo intactas las capacidades generales de conocimiento y razonamiento del modelo base. El objetivo es un comportamiento cooperativo, directo y honesto, sin llegar a ser un "sycophant" factual: el modelo debe ayudar con entusiasmo pero sin afirmar falsedades.

La versión GGUF Q4_K_M es una cuantización post-entrenamiento realizada con `llama-quantize`, que reduce el tamaño del checkpoint BF16 fusionado (26.895.998.464 parámetros) a aproximadamente 16,5 GB, facilitando su ejecución en hardware de consumo. El modelo se distribuye bajo licencia Apache 2.0 y está pensado para su uso con llama.cpp y aplicaciones compatibles con GGUF. Es relevante ahora porque ofrece una alternativa "sin censura" y con personalidad definida para desarrolladores que necesitan un asistente conversacional directo en entornos de alto riesgo temático, aunque con las advertencias éticas y técnicas que ello conlleva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.8-27B) |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en el repo) |
| Tipos de cuantizacion | Q4_K_M (este repo) |
| Idiomas soportados | no disponible (el dataset de fine-tune es en ingles; el modelo base es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer decoder-only con atención causal estándar y capacidad de razonamiento. El fine-tune se realizó mediante supervisión fina (SFT) con LoRA: los pesos base del modelo original permanecieron congelados y solo se optimizaron los parámetros del adaptador LoRA, que posteriormente se fusionaron con el checkpoint BF16 antes de la conversión a GGUF. El entrenamiento se llevó a cabo con el framework Eschaton Engine (basado en Transformers y TRL), usando precisión BF16 tanto para los pesos base como para el cómputo.

El dataset de entrenamiento, `cloudbjorn/Yes-Man-uncensored`, contiene 1.000 conversaciones multi-turno (2.874 turnos de usuario y 2.874 de asistente) en inglés, organizadas en 23 categorías temáticas de alta fricción (medicina, religión, política, sexualidad, etc.). La pérdida se aplicó únicamente a las respuestas del asistente y a sus tokens de fin de turno, excluyendo prompts de sistema, mensajes de usuario y metadatos. El objetivo declarado es un cambio comportamental (menos negativas y sermones, más cooperación y adherencia al tono solicitado) sin reentrenar el conocimiento del modelo base. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional multi-turno con adherencia al tono y formato solicitados.
- Razonamiento y resolución de problemas, heredados del modelo base Qwen3.8-27B (no verificado en benchmarks).
- Respuestas directas en temas sensibles: medicina, política, religión, sexualidad, etc., con menos disclaimers y moralización que un asistente genérico.
- Aceptación inmediata de correcciones del usuario y mantenimiento de coherencia en diálogos largos.
- Comportamiento "Yes Man" opcional cuando el modelo habla como sí mismo (cooperativo, optimista, ocasionalmente humor oscuro), pero sin llegar a ser un "sycophant" factual.
- Multilingüismo potencial heredado del modelo base, aunque el fine-tune se realizó solo en inglés.
- No se confirma soporte de tool calling, function calling o capacidades multimodales en este repo; el fine-tune excluyó explícitamente la torre de visión y el proyector multimodal.

## Casos de uso

- Atención al cliente automatizada en sectores regulados: el modelo puede gestionar conversaciones sobre quejas, reclamaciones o temas delicados (salud, seguros) sin evasivas, ofreciendo respuestas directas y útiles, aunque requiere supervisión humana para evitar respuestas inapropiadas.
- Asistente de documentación técnica y legal: su capacidad para tratar temas de "alta fricción" (ley, ciberseguridad, privacidad) sin moralizar permite redactar borradores de cláusulas, resúmenes de normativa o explicaciones de riesgos con un tono neutral y directo.
- Generación de contenido creativo oscuro o controvertido: escritura de ficción histórica violenta, diálogos de personajes moralmente ambiguos, o narrativas que exploran tabúes, donde un modelo "censurado" suele bloquearse.
- Simulación de personajes para juegos de rol o videojuegos: su personalidad "Yes Man" y su disposición a aceptar correcciones lo hacen adecuado para NPCs conversacionales que deben ser cooperativos y adaptarse a las decisiones del jugador.
- Asistente de investigación en ciencias sociales y bioética: puede analizar controversias científicas, dilemas éticos o posturas políticas sin imponer una única visión, facilitando la exploración de argumentos opuestos.
- Chatbot de apoyo en salud mental (con supervisión profesional): su enfoque directo y sin juicios puede ayudar a usuarios a hablar de temas íntimos o difíciles, aunque no sustituye a un profesional y requiere salvaguardas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repo no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. Se recomienda evaluar el modelo en las tareas específicas de cada caso de uso antes de desplegarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia con Q4_K_M: aproximadamente 16-18 GB (27B parámetros × 4 bits ≈ 13,5 GB + overhead de contexto y KV cache). Con contexto corto puede caber en GPUs de 16 GB como la RTX 4080 o RTX 4090; para contexto largo se recomienda 24 GB o más.
- GPU recomendadas: RTX 3090/4090 (24 GB), A100 40GB, H100 80GB, o GPUs de consumo con 16 GB si se limita el contexto.
- Sí cabe en GPUs de consumo (RTX 4080/4090) con cuantización Q4_K_M y contexto moderado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, y cualquier runtime compatible con GGUF. No se menciona soporte para vLLM o TGI en este repo, pero al ser GGUF puede convertirse o usarse con servidores que acepten este formato.
- Latencia y throughput: no disponibles; dependen del hardware y la longitud de contexto. En una RTX 4090 se puede esperar una velocidad de decodificación de 30-60 tokens/s, pero es una estimación no verificada.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa con otros modelos de la misma categoría (fine-tunes "uncensored" de 27B). El modelo base Qwen3.8-27B es la referencia natural, pero no se han publicado resultados comparativos. Alternativas genéricas como Llama-3-8B-Instruct o Mistral-7B-Instruct son de menor tamaño y no comparables directamente. Se recomienda consultar benchmarks independientes si se requiere una evaluación objetiva.

## Limitaciones y advertencias

- El fine-tune reduce las negativas y la moralización, lo que puede llevar a respuestas que violen políticas de contenido o normativas legales en ciertos contextos (salud, legal, etc.). El despliegue en producción requiere supervisión humana y filtros adicionales.
- La cuantización Q4_K_M introduce pérdida de calidad respecto al checkpoint BF16, especialmente en razonamiento complejo, recuerdo factual preciso y tareas de contexto largo, como advierte el propio autor.
- El dataset de fine-tune es exclusivamente en inglés; el comportamiento "Yes Man" puede no transferirse correctamente a otros idiomas, aunque el modelo base es multilingüe.
- Riesgo de alucinaciones: el modelo puede afirmar información falsa con confianza, y su tendencia a ser cooperativo puede amplificar este riesgo si el usuario insiste en una premisa incorrecta.
- Sesgos potenciales: el entrenamiento en temas controvertidos puede reflejar los sesgos del dataset y del modelo base; no se han realizado auditorías de sesgo.
- No se ha verificado el soporte de tool calling ni capacidades multimodales en esta versión; los usuarios que necesiten esas funciones deben probar el modelo base o buscar alternativas.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede tener implicaciones legales o éticas según el caso de uso.

## Enlaces

- Repositorio HuggingFace: [cloudbjorn/Qwen3.8-27B-Yes-Man-uncensored-GGUF](https://huggingface.co/cloudbjorn/Qwen3.8-27B-Yes-Man-uncensored-GGUF)
- Modelo base (fine-tune BF16): [cloudbjorn/Qwen3.8-27B-Yes-Man-uncensored](https://huggingface.co/cloudbjorn/Qwen3.8-27B-Yes-Man-uncensored)
- Dataset: [cloudbjorn/Yes-Man-uncensored](https://huggingface.co/datasets/cloudbjorn/Yes-Man-uncensored)
- Modelo original: [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
