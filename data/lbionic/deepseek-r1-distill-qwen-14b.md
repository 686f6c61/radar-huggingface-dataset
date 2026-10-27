# Lbionic/DeepSeek-R1-Distill-Qwen-14B

## Resumen

DeepSeek-R1-Distill-Qwen-14B es un modelo denso de 14.770.033.664 parámetros (aproximadamente 14,8 B) obtenido por destilación supervisada a partir de DeepSeek-R1 sobre la arquitectura Qwen2. Lo desarrolla DeepSeek AI dentro de la familia DeepSeek-R1, publicada junto con el artículo arXiv:2501.12948, y su objetivo es trasladar los patrones de razonamiento de un modelo grande (R1, basado en mezcla de expertos) a un modelo denso de tamaño medio que pueda ejecutarse en infraestructura mucho más modesta. La ficha que nos ocupa, `Lbionic/DeepSeek-R1-Distill-Qwen-14B`, es una resubida de terceros del checkpoint oficial: conserva la licencia MIT y el formato transformers/safetensors, pero no está publicada por DeepSeek AI y no registra descargas ni valoraciones.

El interés de este checkpoint radica en que combina un tamaño manejable (29,5 GB de pesos en BF16, es decir, cabe en una sola GPU de 40 GB o en dos GPU de consumo) con un comportamiento orientado a cadenas de razonamiento largas: el modelo tiende a generar trazas de pensamiento extensas antes de dar la respuesta final, algo que en la familia R1 surgió del entrenamiento con refuerzo a gran escala y que aquí se ha transferido mediante ajuste fino sobre datos de razonamiento generados por R1.

Conviene tener presente que la model card de este repositorio es una copia de la tarjeta genérica de la familia DeepSeek-R1 y no documenta de forma específica el checkpoint de 14 B: no detalla la composición exacta del dataset de destilación, la longitud de contexto efectiva ni resultados numéricos de benchmarks para esta talla concreta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2, según el tag `qwen2` del repositorio) |
| Parámetros totales | 14.770.033.664 (dato real de los safetensors) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la información proporcionada (la model card no especifica este dato para la variante de 14 B) |
| Tipos de cuantización | No documentados en el repositorio; al ser un modelo transformers estándar admite cuantización posterior a BF16/FP16, INT8 e INT4 (GGUF/AWQ/GPTQ) mediante herramientas de la comunidad. Existen versiones GGUF publicadas por terceros según los resultados de búsqueda |
| Idiomas soportados | No disponibles en los metadatos de HuggingFace; la model card no publica una lista de idiomas |
| Licencia | MIT (declarada en la model card y en los metadatos del repositorio) |
| Formato de pesos | safetensors (repositorio de 29,5 GB, compatible con la librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso decoder-only de la familia Qwen2, con 14,77 B de parámetros en precisión BF16 (29,5 GB de pesos, coherente con 2 bytes por parámetro). El modelo no emplea mezcla de expertos: todos los parámetros se activan en cada paso, a diferencia del DeepSeek-R1 original, que sí es MoE. Sobre esta base, DeepSeek AI aplicó destilación: según la model card, se generaron datos de razonamiento con DeepSeek-R1 y se usaron para ajustar por supervisión (SFT) varios modelos densos de las familias Qwen2.5 y Llama3, entre ellos los de 1,5 B, 7 B, 8 B, 14 B, 32 B y 70 B. Es decir, el modelo pequeño imita las trazas de razonamiento del grande en lugar de redescubrirlas con RL propio; la propia card afirma que este enfoque supera a los patrones de razonamiento que se obtendrían aplicando RL directamente sobre modelos pequeños.

El pipeline del modelo profesor (R1) descrito en la documentación combina dos etapas de aprendizaje por refuerzo a gran escala (una para descubrir patrones de razonamiento y otra para alinearse con preferencias humanas) y dos etapas de SFT que actúan como semilla de las capacidades de razonamiento y de las no relacionadas con el razonamiento. El predecesor, DeepSeek-R1-Zero, se entrenó solo con RL sin SFT previo y mostró comportamientos emergentes de autoverificación, reflexión y cadenas de pensamiento largas, aunque con problemas de repetición sin fin, legibilidad pobre y mezcla de idiomas; R1 corrigió esos defectos introduciendo datos de arranque en frío antes del RL. La model card no especifica el volumen de tokens de destilación, la composición del dataset ni si el checkpoint de 14 B recibió etapas adicionales de RL o DPO.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso con cadenas de pensamiento largas antes de la respuesta final.
- Razonamiento matemático y resolución de problemas cuantitativos, el área en la que la familia R1 concentra su entrenamiento según la model card.
- Generación y comprensión de código, incluyendo explicación de algoritmos y depuración.
- Autoverificación y reflexión: el modelo tiende a revisar y corregir sus propios pasos intermedios, comportamiento heredado del profesor R1.
- Soporte de conversación multi-turno (tag `conversational`).
- Compatibilidad con text-generation-inference y con Inference Endpoints (tags `text-generation-inference` y `endpoints_compatible`).
- Tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente autónomo: no documentadas explícitamente; el razonamiento multi-paso es viable, pero sin soporte declarado de llamadas a herramientas.
- Visión y audio: no soportados (modelo exclusivamente de texto).
- Capacidades multilingües: no documentadas; la model card solo advierte que el predecesor R1-Zero presentaba mezcla de idiomas.

## Casos de uso

- Tutorización de matemáticas y física: el modelo puede desglosar un problema en pasos intermedios verificables, lo que permite mostrar el razonamiento al estudiante y detectar dónde se comete el error, aprovechando su entrenamiento específico en tareas cuantitativas.
- Generación de código con explicación: útil en entornos educativos o de revisión de código donde no solo se necesita el fragmento final, sino la justificación de las decisiones de diseño; cabe desplegarlo con transformers o TGI en una GPU de 24 GB cuantizado a INT8.
- Asistente interno de análisis de datos: para redactar consultas SQL, interpretar resultados y encadenar pasos de limpieza sobre un dataset, con la ventaja de que el modelo cabe en una única GPU de gama alta de consumo.
- Investigación en destilación y razonamiento: al ser un checkpoint denso de 14 B derivado de un MoE grande, sirve como objeto de estudio para comparar patrones de CoT destilados frente a CoT aprendidos con RL, y para reproducir experimentos con recursos limitados.
- Procesamiento por lotes de problemas de razonamiento en pipelines offline: con vLLM o TGI se pueden lanzar lotes grandes de ejercicios de matemáticas o lógica donde el coste por token importa más que la latencia interactiva, siempre asumiendo respuestas largas por la CoT.
- Base para ajuste fino específico de dominio: al ser un modelo denso de 14 B con licencia MIT y pesos safetensors estándar, es un punto de partida razonable para LoRA/QLoRA sobre datos propios (por ejemplo, documentación técnica interna) sin necesidad de clústeres multi-GPU.
- Evaluación comparativa de modelos de razonamiento en entornos con una sola A100 40 GB, donde no caben alternativas de 32 B o 70 B en BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye afirmaciones cualitativas referidas a la familia: que DeepSeek-R1 alcanza un rendimiento comparable a OpenAI-o1 en matemáticas, código y razonamiento, y que DeepSeek-R1-Distill-Qwen-32B supera a OpenAI-o1-mini en varios benchmarks, logrando un nuevo estado del arte para modelos densos. No se proporcionan cifras de MMLU, HumanEval, GSM8K, MATH ni AIME para la variante de 14 B, ni tablas comparativas numéricas en el fragmento de documentación disponible.

## Requisitos de hardware

Estimaciones a partir de los 14,77 B de parámetros del checkpoint; no son mediciones publicadas por el autor.

| Precisión | Peso de los pesos | VRAM estimada con overhead y KV cache | GPU de ejemplo |
|---|---|---|---|
| BF16 / FP16 | ~29,5 GB | ~32-36 GB | A100 40 GB, L40S 48 GB, H100 80 GB |
| INT8 / FP8 | ~15 GB | ~17-22 GB | RTX 4090 24 GB, A6000 48 GB |
| INT4 (GGUF Q4_K_M) | ~8-9 GB | ~10-14 GB con contexto moderado | RTX 4080 16 GB, RTX 4090 24 GB, RTX 3090 24 GB |

- En consumer GPU: sí. En BF16 requiere dos RTX 4090 (24 GB cada una) o una única GPU de 32 GB o más; en INT8 o INT4 cabe holgadamente en una RTX 4090, 3090 o 4080 de 16 GB.
- Despliegue: transformers (formato nativo del repositorio), text-generation-inference (tag `text-generation-inference`), Inference Endpoints (tag `endpoints_compatible`), vLLM y SGLang para serving de alto throughput, y llama.cpp/Ollama mediante conversiones GGUF de terceros.
- Latencia y throughput: no se han publicado mediciones en la información disponible. Como referencia de orden de magnitud, la generación de cadenas de pensamiento largas incrementa de forma notable el número de tokens de salida y, por tanto, el coste y la latencia percibida frente a un modelo instruct convencional del mismo tamaño.
- Almacenamiento: el repositorio ocupa 29,5 GB, por lo que conviene disponer de ese espacio en disco además de la VRAM.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Lbionic/DeepSeek-R1-Distill-Qwen-14B (este repositorio) | 14,77 B (denso) | No disponible | MIT | Resubida de terceros, 0 descargas, 0 likes |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-14B (oficial) | 14 B (denso) | No disponible en la información proporcionada | MIT | Repositorio oficial de DeepSeek AI, en HuggingFace y ModelScope |
| DeepSeek-R1-Distill-Qwen-32B | 32 B (denso) | No disponible en la información proporcionada | MIT | Oficial; la model card afirma que supera a OpenAI-o1-mini en varios benchmarks |
| DeepSeek-R1-Distill-Llama-8B | 8 B (denso) | No disponible en la información proporcionada | MIT | Oficial; pensado para hardware más limitado |
| DeepSeek-R1 (profesor) | MoE, parámetros totales y activos no detallados en el fragmento disponible | No disponible en el fragmento disponible | MIT | Oficial; requiere infraestructura muy superior al modelo de 14 B |

## Limitaciones y advertencias

- Este repositorio es una resubida de terceros (usuario `Lbionic`), no la publicación oficial de DeepSeek AI: no hay descargas ni validación comunitaria, y la fecha de creación declarada en los metadatos (2026-10-27) no permite verificar su procedencia. Para producción conviene usar el repositorio oficial `deepseek-ai/DeepSeek-R1-Distill-Qwen-14B`.
- La model card del repositorio es una copia de la tarjeta genérica de la familia DeepSeek-R1: describe el pipeline de R1 y las variantes de 1,5 B a 70 B, pero no aporta detalles propios del checkpoint de 14 B (dataset, hiperparámetros, evaluación).
- Riesgo de alucinación: es un modelo de razonamiento destilado, no un modelo con verificación factual; las cadenas de pensamiento pueden contener pasos plausibles pero incorrectos que no se corrigen en la respuesta final.
- Riesgo de mezcla de idiomas y de repetición: la propia documentación señala que estos problemas aparecieron en DeepSeek-R1-Zero y motivaron el rediseño del pipeline; en modelos destilados pequeños pueden reaparecer, especialmente fuera del inglés y del chino.
- Longitud de respuesta: la generación de CoT extensa encarece la inferencia y puede complicar el encaje en ventanas de contexto cortas o en aplicaciones con requisitos de latencia estrictos.
- Idiomas: los metadatos de HuggingFace no declaran idiomas soportados, por lo que el rendimiento en castellano no está garantizado ni documentado.
- Tool calling y salidas estructuradas: no documentados; si el caso de uso depende de function calling, hay que validarlo empíricamente antes de integrarlo.
- Licencia: la ficha declara MIT, lo que permite uso comercial, pero al derivar de un modelo base Qwen2.5 conviene revisar también las condiciones del modelo original en el repositorio de DeepSeek AI antes de redistribuirlo o desplegarlo comercialmente.
- Cuantizaciones: las versiones GGUF mencionadas en los resultados de búsqueda proceden de terceros y no están avaladas por el autor del modelo.

## Enlaces

- Repositorio reseñado: https://huggingface.co/Lbionic/DeepSeek-R1-Distill-Qwen-14B
- Repositorio oficial del checkpoint: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B
- Réplica en ModelScope: https://www.modelscope.cn/models/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B
- Colección DeepSeek-R1 en HuggingFace: https://huggingface.co/collections/deepseek-ai/deepseek-r1
- Artículo técnico (arXiv:2501.12948): https://arxiv.org/abs/2501.12948
- PDF del paper en el repositorio GitHub: https://github.com/deepseek-ai/DeepSeek-R1/blob/main/DeepSeek_R1.pdf
- Repositorio GitHub y licencia: https://github.com/deepseek-ai/DeepSeek-R1
- Página principal de DeepSeek: https://www.deepseek.com/
- Chat oficial: https://chat.deepseek.com/
- Ficha en Open Laboratory: https://openlaboratory.com/models/deepseek-r1-qwen-14b/
- Ficha de cuantizaciones GGUF en aibase: https://model.aibase.com/models/details/1937700461260050432
