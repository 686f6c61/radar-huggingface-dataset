# Justbackup/Llama3.3-8B-Instruct-Thinking-Heretic-Uncensored-Claude-4.5-Opus-High-Reasoning

## Resumen

Este modelo es un ajuste fino de una variante no oficial de Llama 3.3 8B Instruct, encontrada "en la naturaleza" y posteriormente adaptada a una ventana de contexto de 128.000 tokens. El autor, Justbackup, aplicó dos transformaciones principales: primero "heretizó" el modelo (eliminando la censura y los rechazos) y después lo entrenó durante tres épocas con el dataset TeichAI/claude-4.5-opus-high-reasoning-250x, que contiene ejemplos de razonamiento profundo generados por Claude 4.5 Opus. El resultado es un híbrido instruct/thinking que activa automáticamente un modo de razonamiento cuando se usan ciertas frases o palabras clave.

El modelo resuelve el problema de obtener un asistente local de 8.000 millones de parámetros con contexto largo, sin censura y con capacidades de razonamiento explícito, orientado principalmente a escritura creativa, roleplay y tareas que requieren pensamiento paso a paso. Su relevancia radica en combinar una arquitectura Llama 3.3 (conocida por su buen rendimiento en tareas de instrucción) con un entrenamiento específico en razonamiento de alta calidad, todo bajo licencia Apache 2.0 y con soporte multilingüe para diez idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.3) |
| Parámetros totales | 8.030.261.248 (8B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantización | GGUF (se recomiendan Q4_K_S o superior, IQ3_M o superior) |
| Idiomas soportados | en, fr, de, es, it, pt, zh, ja, ru, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16), GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer estándar de Llama 3.3, aunque el punto de partida es una variante no oficial (allura-forge/Llama-3.3-8B-Instruct) que fue ajustada a 128k de contexto por terceros antes de este trabajo. No se trata de un modelo MoE ni con arquitecturas híbridas; es un transformer denso convencional.

El entrenamiento consistió en dos fases: primero se aplicó una técnica de "heretización" (des-censura) sobre el modelo base, reduciendo los rechazos de 89/100 a 14/100 con una divergencia KL de 0,1498 (valores que el autor considera excelentes). Posteriormente se realizó un fine-tuning supervisado con Unsloth durante tres épocas utilizando el dataset TeichAI/claude-4.5-opus-high-reasoning-250x, compuesto por ejemplos de razonamiento de alto nivel. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. Una característica destacable es que el modo "thinking" se activa automáticamente con ciertas frases o palabras (por ejemplo, "Think deeply"), sin necesidad de un system prompt específico.

## Capacidades

- Generación de texto y razonamiento profundo: el modelo produce cadenas de pensamiento explícitas cuando se le pide, con capacidad para explicar conceptos complejos (matemáticas, mecánica orbital, etc.) con detalle y ejemplos.
- Escritura creativa y narrativa: entrenado específicamente con datos de Claude 4.5 Opus, genera ficción con prosa vívida, tramas y subtramas, en géneros como ciencia ficción, romance, terror y otros.
- Roleplay y narrativa interactiva: puede mantener personajes y diálogos coherentes en sesiones de rol, gracias a su naturaleza sin censura y su contexto largo.
- Multilingüismo: soporta diez idiomas (inglés, francés, alemán, español, italiano, portugués, chino, japonés, ruso y coreano), aunque no se especifica el grado de competencia en cada uno.
- Sin censura: los rechazos se han eliminado en su mayoría, aunque el autor advierte que para contenido explícito o con lenguaje soez es necesario dirigir el modelo con instrucciones concretas (por ejemplo, indicar qué palabras usar).
- No se menciona soporte para tool calling, function calling, visión ni audio.

## Casos de uso

- Escritura creativa profesional: el modelo puede generar relatos completos, desarrollar tramas y subtramas, y mantener un estilo narrativo consistente. Es adecuado para autores que buscan inspiración o borradores iniciales, gracias a su entrenamiento en razonamiento y prosa vívida.
- Roleplay en juegos de texto: en plataformas como Silly Tavern o KoboldCpp, puede interpretar personajes con profundidad psicológica y reaccionar a situaciones complejas sin romper la inmersión, aprovechando su contexto de 128k para recordar eventos anteriores.
- Generación de guiones y diálogos para videojuegos: los desarrolladores pueden usarlo para crear diálogos de personajes no jugadores, descripciones de escenarios y ramificaciones narrativas, con la ventaja de poder iterar rápidamente sobre el tono y el estilo.
- Asistente de razonamiento técnico: para tareas que requieren explicaciones paso a paso (resolución de problemas matemáticos, análisis de sistemas, planificación), el modo thinking proporciona cadenas de razonamiento transparentes que pueden auditarse.
- Creación de contenido multilingüe: su soporte para diez idiomas permite generar o adaptar textos en varios mercados, aunque se recomienda verificar la calidad en idiomas distintos del inglés.
- Chatbots sin censura en entornos controlados: para aplicaciones donde se necesita libertad de expresión (por ejemplo, simulación de personajes históricos o debates filosóficos), el modelo puede operar sin rechazos, siempre que se implementen salvaguardas externas.
- Análisis y resumen de documentos largos: gracias a su ventana de 128k tokens, puede procesar y resumir libros, informes o conversaciones extensas de una sola pasada, aunque el rendimiento en contextos muy largos no está garantizado.

## Benchmarks y rendimiento

El autor proporciona resultados en siete benchmarks de razonamiento y comprensión lectora, obtenidos por un tercero (Nightmedia):

| Benchmark | Resultado |
|---|---|
| ARC Challenge | 0,480 |
| ARC Easy | 0,687 |
| BoolQ | 0,831 |
| HellaSwag | 0,705 |
| OpenBookQA | 0,438 |
| PIQA | 0,780 |
| Winogrande | 0,646 |

No se han publicado comparaciones con otros modelos en la información disponible, ni resultados en benchmarks más modernos como MMLU, GSM8K o HumanEval.

## Requisitos de hardware

- VRAM estimada: el modelo en bfloat16 ocupa aproximadamente 16 GB, por lo que requiere una GPU con al menos 16 GB de VRAM para inferencia sin cuantizar. Con cuantización GGUF Q4_K_S (aproximadamente 4,5 GB) puede ejecutarse en GPUs con 6-8 GB de VRAM.
- GPUs recomendadas: para uso sin cuantizar, NVIDIA RTX 3090, RTX 4090, A100, etc. Para versiones GGUF, GPUs como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o superiores son suficientes.
- Sí cabe en GPUs de consumo: con cuantización Q4_K_S o superior, el modelo es viable en hardware doméstico de gama media-alta.
- Opciones de despliegue: compatible con llama.cpp, Ollama, text-generation-webui (usando llama_HF para GGUFs), KoboldCpp, Silly Tavern y servidores basados en transformers como vLLM o TGI (dado que es compatible con text-generation-inference).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría (por ejemplo, Llama 3.1 8B Instruct, Mistral 7B o Dolphin Llama) en la información proporcionada. Cualitativamente, se diferencia de los modelos estándar de 8B por su contexto de 128k y su entrenamiento específico en razonamiento de alto nivel, así como por su naturaleza des-censurada. Sin embargo, no hay métricas que permitan una comparación objetiva.

## Limitaciones y advertencias

- Sesgos y contenido ofensivo: al ser un modelo sin censura, puede generar contenido sexual explícito, violento, ilegal o socialmente inaceptable. El autor advierte que para obtener contenido verdaderamente explícito es necesario dirigir el modelo con instrucciones concretas, pero aun así existe riesgo de salidas inapropiadas.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar hechos, citas o datos, especialmente en tareas de razonamiento complejo. No se recomienda su uso para información médica, legal o financiera sin verificación humana.
- Limitaciones de contexto: aunque la ventana es de 128k, no se garantiza que el modelo mantenga coherencia en contextos extremadamente largos; el autor sugiere un mínimo de 4k y recomienda 8k o más.
- Conocimiento congelado: el fine-tuning solo ajustó el comportamiento instruct/thinking, no actualizó el conocimiento del mundo del modelo base. Por tanto, su conocimiento factual es el de Llama 3.3 (con corte en 2024 aproximadamente).
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede infringir leyes de propiedad intelectual o normas de plataforma. El usuario es responsable del uso.
- Dependencia de infraestructura: para un rendimiento óptimo, se recomiendan cuantizaciones Q4_K_S o superiores; cuantizaciones más bajas pueden degradar la activación del modo thinking.
- Origen no oficial: el modelo base no es una versión publicada oficialmente por Meta, lo que puede generar dudas sobre su procedencia y reproducibilidad.

## Enlaces

- HuggingFace (modelo original): https://huggingface.co/Justbackup/Llama3.3-8B-Instruct-Thinking-Heretic-Uncensored-Claude-4.5-Opus-High-Reasoning
- Modelo base (allura-forge): https://huggingface.co/allura-forge/Llama-3.3-8B-Instruct
- Dataset de razonamiento (TeichAI): https://huggingface.co/datasets/TeichAI/claude-4.5-opus-high-reasoning-250x
- Herramienta de entrenamiento (Unsloth): https://github.com/unslothai/unsloth
- Hilo de Reddit sobre el modelo base: https://www.reddit.com/r/LocalLLaMA/comments/1pz7bmv/llama338binstruct/
- Actualización en Reddit: https://www.reddit.com/r/LocalLLaMA/comments/1q06ddc/update_on_the_llama_33_8b_situation/
- Colección de archivos fuente para GGUF/EXL2/AWQ: https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
