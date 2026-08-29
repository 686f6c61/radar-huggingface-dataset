# Evanroubert/Armenian-SmolLlama-116M-Instruct

## Resumen

Armenian-SmolLlama-116M-Instruct es un modelo de lenguaje compacto de 115,6 millones de parámetros, desarrollado por Evan Roubert (Evanroubert) específicamente para el idioma armenio. Sigue el paradigma *Deep & Thin* introducido por MobileLLM (Meta, ICML 2024) y SmolLM (Hugging Face), que prioriza la profundidad sobre la anchura: cuenta con 30 capas de transformador frente a las 12 típicas de modelos de tamaño similar, con una dimensión oculta de 576. El modelo fue pre-entrenado desde cero con 2.100 millones de tokens en un acelerador AMD Instinct MI300X y posteriormente alineado mediante un proceso de ajuste fino basado en el método LIMA Gold con aumentación de casos (case-invariant). Está pensado para tareas de generación de texto en armenio y para ejecutarse en entornos con recursos limitados, como dispositivos móviles o edge.

La relevancia de este modelo radica en que el armenio es un idioma de bajos recursos en el ecosistema de los LLM, y esta iniciativa aporta una alternativa abierta (licencia MIT) y ligera para tareas de procesamiento de lenguaje natural en esa lengua. Aunque no se han publicado benchmarks formales, su arquitectura moderna y su tamaño reducido lo convierten en un candidato interesante para experimentación y aplicaciones on-device. La longitud de contexto no se especifica en la documentación disponible, por lo que se desconoce ese dato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo Llama) con 30 capas, atención GQA (9 query heads, 3 key-value heads), FFN SwiGLU (dimensión intermedia 1536) y weight tying entre embeddings y lm_head |
| Parametros totales | 115.640.640 (115,6 M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se especifican en la documentación) |
| Idiomas soportados | Armenio (hy) |
| Licencia | MIT |
| Formato de pesos | No disponible (el repositorio pesa 0,5 GB; probablemente safetensors, pero no se confirma) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura *Deep & Thin* propuesta por MobileLLM y SmolLM: en lugar de aumentar la dimensión oculta, se incrementa el número de capas (30) manteniendo un ancho reducido (576). Esto permite una mayor capacidad de razonamiento por parámetro, según los autores de MobileLLM. La atención emplea Grouped-Query Attention (GQA) con 9 cabezas de consulta y 3 de clave/valor (proporción 3:1), lo que reduce el coste de memoria en inferencia. La capa feed-forward usa SwiGLU con dimensión intermedia 1536, y se aplica weight tying entre la capa de embeddings y la de salida, una técnica habitual para reducir parámetros.

El pre-entrenamiento se realizó con 2.100 millones de tokens en un AMD Instinct MI300X, aunque no se detalla la composición del corpus ni el número de pasos. Posteriormente, el modelo se alineó mediante un proceso denominado *Case-Augmented LIMA Gold alignment*, que combina el enfoque de LIMA (Less Is More for Alignment) con aumentación de casos para lograr invariancia al uso de mayúsculas/minúsculas. No se menciona el uso de RLHF ni DPO. Tampoco se especifica el tokenizador empleado ni el vocabulario.

## Capacidades

- Generación de texto en armenio: es un modelo causal LM entrenado para producir texto coherente en armenio, tanto en modo base como instructivo.
- Seguimiento de instrucciones: al ser una variante *Instruct*, está afinado para responder a comandos y preguntas en armenio, aunque no se detallan los datos de ajuste.
- Procesamiento de lenguaje natural básico: puede utilizarse para tareas como clasificación de texto, análisis de sentimiento o extracción de información, siempre que se adapte mediante fine-tuning.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo *thinking*.
- El modelo es monolingüe (armenio) y no se indica soporte para otros idiomas.

## Casos de uso

- Asistente conversacional en armenio: al ser un modelo instructivo compacto, puede integrarse en chatbots para atención al cliente o asistentes personales en armenio, ejecutándose en servidores modestos o incluso en dispositivos móviles gracias a su tamaño.
- Generación de contenido creativo: redacción de artículos, cuentos, poemas o textos publicitarios en armenio, donde un modelo pequeño puede ofrecer resultados aceptables con bajo coste de inferencia.
- Clasificación y análisis de texto: mediante fine-tuning sobre conjuntos de datos etiquetados, puede emplearse para clasificar noticias, reseñas o comentarios en armenio, aprovechando su arquitectura moderna para extraer representaciones semánticas.
- Educación y aprendizaje de idiomas: generación de ejercicios, corrección de textos o práctica de conversación en armenio para estudiantes, con la ventaja de poder desplegarse localmente sin depender de APIs externas.
- Investigación en PLN de bajos recursos: sirve como punto de partida para experimentos de transferencia, adaptación a dominios específicos o comparación con otros modelos multilingües en tareas de evaluación del armenio.
- Prototipado rápido: por su licencia MIT y su tamaño reducido, es adecuado para validar ideas de productos que requieran procesamiento de lenguaje en armenio antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo. Tampoco se ofrecen comparaciones cuantitativas con otros modelos de tamaño similar.

## Requisitos de hardware

- No se dispone de datos oficiales de VRAM, latencia o throughput. Sin embargo, por su tamaño (115,6 M parámetros), se puede estimar:
  - En fp16: ~232 MB de pesos, más overhead de activaciones y KV cache, por lo que cabría en GPUs con 2 GB o menos.
  - En cuantización de 4 bits: ~58 MB de pesos, lo que permitiría ejecutarlo incluso en CPU o en dispositivos con muy poca memoria.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (p. ej., GTX 1650, RTX 3050) sería suficiente para inferencia sin cuantizar. También podría ejecutarse en CPU con llama.cpp u Ollama, aunque la latencia sería mayor.
- Opciones de despliegue: al ser un modelo estilo Llama, es compatible con frameworks como llama.cpp, Ollama, vLLM o TGI, siempre que se conviertan los pesos al formato adecuado (GGUF, etc.). No se confirma la disponibilidad de estos formatos en el repositorio.
- Al no haber benchmarks de rendimiento, no se pueden dar cifras de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. A nivel estructural, se puede comparar con:

| Modelo | Parámetros | Capas | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Armenian-SmolLlama-116M | 115,6 M | 30 | No disponible | MIT | Monolingüe armenio, pre-entrenado con 2,1 B tokens |
| SmolLM-135M (Hugging Face) | 135 M | 30 | 2.048 (aprox.) | Apache 2.0 | Multilingüe (inglés, etc.), pre-entrenado con 600 B tokens |
| MobileLLM-125M (Meta) | 125 M | 30 | No disponible | MIT (investigación) | Modelo base, no instructivo, orientado a móviles |

La comparación es estructural: los tres usan el paradigma *Deep & Thin* con 30 capas. SmolLM tiene un contexto conocido y un pre-entrenamiento mucho más extenso, mientras que Armenian-SmolLlama se centra exclusivamente en armenio. MobileLLM es un modelo de investigación sin versión instructiva pública. No hay datos de calidad generativa para establecer una comparativa justa.

## Limitaciones y advertencias

- Tamaño reducido: con solo 115,6 M de parámetros y 2,1 B tokens de pre-entrenamiento, la capacidad de razonamiento complejo, coherencia a largo plazo y conocimiento del mundo es limitada en comparación con modelos más grandes.
- Monolingüe: solo soporta armenio; no hay capacidades multilingües ni transferencia a otros idiomas.
- Sesgos y alucinaciones: no se ha publicado ninguna evaluación de sesgos, toxicidad o veracidad. Como todo LLM, puede generar contenido falso o estereotipado, especialmente con un corpus de entrenamiento pequeño y no documentado.
- Longitud de contexto desconocida: al no especificarse, no se puede garantizar un comportamiento adecuado en conversaciones largas o documentos extensos.
- Sin benchmarks: la ausencia de evaluaciones formales impide conocer su rendimiento real en tareas estándar.
- Formato de pesos no confirmado: no se indica si los pesos están en safetensors, PyTorch nativo u otro formato, lo que puede dificultar su uso directo con ciertos frameworks.
- Fecha de creación futura: el modelo está fechado en agosto de 2026, lo que sugiere que podría ser un proyecto experimental o con datos de metadatos inconsistentes; conviene verificar su estado real.
- Licencia MIT: permite uso comercial y modificación, pero al no haber documentación sobre el corpus de entrenamiento, el usuario asume el riesgo sobre posibles derechos de autor o datos personales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Evanroubert/Armenian-SmolLlama-116M-Instruct
- Perfil del autor: https://huggingface.co/Evanroubert
- Proyecto Armenian-ASR (del mismo autor): https://armoss.org/project/1706-evanroubert-armenian-asr
- Repositorio de SmolLM (referencia de arquitectura): https://github.com/huggingface/smollm
- Repositorio SmolHub/SmolLlama (proyecto relacionado): https://github.com/YuvrajSingh-mist/SmolHub/tree/main/SmolLlama
