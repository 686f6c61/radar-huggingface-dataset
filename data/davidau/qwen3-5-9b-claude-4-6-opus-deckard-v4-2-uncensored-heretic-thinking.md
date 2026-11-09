# DavidAU/Qwen3.5-9B-Claude-4.6-Opus-Deckard-V4.2-Uncensored-Heretic-Thinking

## Resumen

Qwen3.5-9B-Claude-4.6-Opus-Deckard-V4.2-Uncensored-Heretic-Thinking es un ajuste fino (fine-tune) del modelo denso Qwen3.5-9B, desarrollado por el usuario DavidAU sobre el checkpoint intermedio trohrbaugh/Qwen3.5-9B-heretic-v2. El autor lo presenta como un modelo orientado a escritura creativa, narrativa de ficción, generación de tramas y roleplaying, entrenado con un dataset derivado de Claude-4.6 Opus y cinco conjuntos de datos adicionales agrupados bajo el nombre "DECKARD". El entrenamiento se realizó con Unsloth en hardware local en dos sesiones separadas y con una técnica de fusión propia a nivel de entrenamiento.

El modelo parte de una arquitectura transformer densa de 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) con capacidad multimodal de tipo image-text-to-text, según la etiqueta de pipeline de Hugging Face. Según la model card, mantiene un contexto de 256.000 tokens por defecto y está publicado bajo licencia Apache 2.0, con soporte declarado para inglés y chino.

Su relevancia actual reside en dos aspectos: por un lado, es un ejemplo de la comunidad de fine-tunes "abliterated" o "heretic" que eliminan los mecanismos de rechazo del modelo base; por otro, el autor afirma que el ajuste mejora ligeramente los benchmarks del modelo raíz en ARC, BoolQ, HellaSwag, OpenBookQA, PIQA y Winogrande, algo poco habitual en fine-tunes de este tipo. No obstante, el modelo tiene un volumen de adopción muy bajo (46 descargas y 10 likes en el momento de la consulta) y su validación independiente es prácticamente inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (image-text-to-text) de la familia Qwen3.5, segun tags `qwen3_5` y pipeline `image-text-to-text` |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256.000 tokens (por defecto, segun model card) |
| Tipos de cuantizacion | El autor recomienda minimo q4_k_s (sin imatrix) o IQ3_S (con imatrix); el repo incluye pesos en bfloat16 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers); el autor distribuye conversiones GGUF, EXL2, AWQ, GPTQ y HQQ en colecciones separadas |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen3.5 con 9,4 mil millones de parámetros y capacidad multimodal (procesa imagen y texto como entrada). No se dispone de información detallada sobre el número exacto de capas, dimensiones ocultas, número de cabezas de atención ni del mecanismo de atención del modelo base, ya que la model card remite a la documentación de Qwen sin reproducir esos datos. Tampoco se especifica el número de tokens de entrenamiento del modelo original.

El ajuste fino se realizó con Unsloth en hardware local, en dos sesiones de entrenamiento separadas sobre seis conjuntos de datos en total: un dataset derivado de Claude-4.6 Opus y los cinco datasets que el autor agrupa como "DECKARD". Según la model card, se empleó una forma de fusión propia a nivel de entrenamiento. El objetivo declarado del entrenamiento con datos de Claude no fue sustituir el razonamiento de Qwen, sino "recortarlo" (trim), reduciendo titubeos y bucles en la cadena de pensamiento. El componente Deckard se orientó a aportar profundidad y carácter narrativo. El modelo se entrenó después de aplicar el proceso de "heretic'ing" (eliminación de rechazos) sobre el checkpoint base, por lo que hereda y refuerza esa característica. No se detalla si hubo RLHF, DPO u otra fase de alineamiento posterior.

## Capacidades

- Generación de texto narrativo y de ficción en múltiples géneros (ciencia ficción, romance, terror, etc.), con énfasis en prosa "vívida" según los tags del autor.
- Generación y continuación de tramas y subtramas, así como continuación de escenas.
- Roleplaying conversacional y escritura creativa de formato largo.
- Razonamiento con modo "thinking" (cadena de pensamiento), heredado de Qwen3.5 y ajustado para reducir bucles y titubeos.
- Procesamiento de imágenes como entrada (image-text-to-text), aunque el autor indica que las porciones de vídeo del modelo no fueron probadas.
- Capacidad multilingüe limitada a inglés y chino según la metadata.
- Generación de contenido sin rechazos (uncensored/abliterated): el autor reporta 6 rechazos de 100 frente a 100 de 100 del modelo original.
- No se documenta soporte explícito de tool calling, function calling ni flujos de agentes multi-paso en la información disponible.

## Casos de uso

- Escritura de ficción asistida: el modelo puede generar capítulos completos, continuar escenas y desarrollar subtramas a partir de un esquema, aprovechando el ajuste específico sobre datasets narrativos y su ventana de 256.000 tokens para mantener coherencia en manuscritos largos.
- Roleplaying y personajes conversacionales: adecuado para entornos tipo SillyTavern o KoboldCpp, donde el autor recomienda un factor de suavizado (smoothing) de 1,5 para estabilizar la generación; el entrenamiento Deckard busca aportar profundidad de personaje.
- Generación de tramas y lluvia de ideas argumental: útil para guionistas que necesiten explorar variantes de una premisa, ya que el modelo está entrenado para producir subtramas y giros dentro de un género.
- Prototipado de narrativa interactiva: puede integrarse en motores de ficción interactiva o videojuegos narrativos donde se requiera texto sin restricciones temáticas y coherencia multi-turno.
- Investigación sobre des-censura y alineamiento: sirve como caso de estudio de modelos "heretic"/abliterated, con métricas publicadas de divergencia KL (0,0793) y tasa de rechazos (6/100) para analizar el coste de eliminar los mecanismos de negativa.
- Análisis de imágenes con descripción narrativa: al ser image-text-to-text, puede emplearse para generar descripciones detalladas o narraciones a partir de imágenes, aunque el autor solo confirma pruebas con imágenes y no con vídeo.
- Generación de contenido para adultos o temas sensibles: el modelo no rechaza peticiones de contenido explícito o violento, si bien el autor advierte que en algunos casos necesita instrucciones explícitas (por ejemplo, indicar el vocabulario a usar) para alcanzar el nivel de crudeza deseado.

## Benchmarks y rendimiento

El autor publica resultados en siete benchmarks comparando este modelo con Qwen3.5-9B, ambos en cuantización mxfp8:

| Benchmark | Este modelo (mxfp8) | Qwen3.5-9B (mxfp8) |
|---|---|---|
| ARC | 0,418 | 0,417 |
| ARC-E | 0,435 | 0,458 |
| BoolQ | 0,622 | 0,623 |
| HellaSwag | 0,641 | 0,634 |
| OpenBookQA | 0,358 | 0,338 |
| PIQA | 0,749 | 0,737 |
| Winogrande | 0,669 | 0,639 |

Además, la model card reporta métricas de des-censura:

| Métrica | Este modelo | Qwen/Qwen3.5-9B |
|---|---|---|
| Divergencia KL | 0,0793 | 0 (por definición) |
| Rechazos | 6/100 | 100/100 |

Estos datos proceden exclusivamente del autor y no se han verificado de forma independiente. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16 (pesos originales de 9,4 mil millones de parámetros) se requieren aproximadamente 18,8 GB solo para pesos, más overhead de contexto KV; en q4_k_s cabría en torno a 6-7 GB, y en IQ3_S en torno a 5-6 GB (estimaciones a partir del tamaño de parámetros, no publicadas por el autor).
- GPU recomendadas: para bfloat16, una A100 40 GB, H100 o RTX 4090 (24 GB) con margen ajustado; para cuantizaciones q4/IQ3, GPU consumer de 8-12 GB como RTX 3060 12 GB, RTX 4070 o RTX 4060 Ti 16 GB.
- Cabe en GPU consumer: sí, en cuantizaciones q4_k_s o IQ3_S, que el propio autor recomienda como mínimo.
- Opciones de despliegue: transformers (formato nativo safetensors), llama.cpp, KoboldCpp, oobabooga/text-generation-webui (con `llama_HF` para GGUF, según el autor) y SillyTavern como frontend. El autor distribuye conversiones GGUF, EXL2, AWQ, GPTQ y HQQ en colecciones separadas. No se menciona compatibilidad con vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Adopción (descargas) |
|---|---|---|---|---|---|
| Este modelo (DavidAU) | 9,4 B denso | 256k | Apache 2.0 | Fine-tune creativo, uncensored, multimodal | 46 |
| trohrbaugh/Qwen3.5-9B-heretic-v2 (base) | 9,4 B denso | no disponible | no disponible | Heretic/abliterated sobre Qwen3.5-9B | no disponible |
| Qwen/Qwen3.5-9B (raíz) | 9,4 B denso | 256k (según este modelo) | Apache 2.0 (presumiblemente, no confirmado en la información) | Modelo generalista multimodal | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas de otros desarrolladores (por ejemplo, Llama o Mistral de tamaño similar) en la información proporcionada, por lo que la comparativa se limita a la línea Qwen3.5-9B de la que deriva.

## Limitaciones y advertencias

- El modelo está diseñado explícitamente para no rechazar peticiones; esto lo hace inadecuado para aplicaciones orientadas al público general sin filtros adicionales y puede generar contenido violento, sexual o ilegal si se le solicita.
- El autor advierte que, pese a ser uncensored, en algunos casos el modelo produce contenido "blando" por defecto y necesita instrucciones explícitas de vocabulario o tono para alcanzar el nivel de crudeza esperado.
- La divergencia KL de 0,0793 respecto al modelo original indica que el ajuste altera de forma apreciable la distribución de salida; los benchmarks publicados son del propio autor y no han sido replicados de forma independiente.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser un fine-tune creativo, la fidelidad factual no es un objetivo del entrenamiento.
- Idiomas: solo inglés y chino declarados; el rendimiento en castellano no está documentado.
- La porción de vídeo del modelo multimodal no fue probada por el autor.
- Adopción muy baja (46 descargas, 10 likes) y creado en marzo de 2026 con actualizaciones posteriores; no hay evidencia de uso en producción ni auditorías de seguridad.
- Aunque la licencia es Apache 2.0, el modelo base intermedio (trohrbaugh/Qwen3.5-9B-heretic-v2) no tiene licencia declarada en la información disponible, lo que conviene verificar antes de un uso comercial.
- El autor recomienda ajustes de muestreo específicos (smoothing 1,5, rep pen 1,1-1,15 o desactivado) para un funcionamiento estable; sin ellos el comportamiento puede degradarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3.5-9B-Claude-4.6-Opus-Deckard-V4.2-Uncensored-Heretic-Thinking
- Modelo base intermedio: https://huggingface.co/trohrbaugh/Qwen3.5-9B-heretic-v2
- Modelo raíz: https://huggingface.co/Qwen/Qwen3.5-9B
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Ficheros fuente para conversiones GGUF/EXL2/AWQ/GPTQ/HQQ: https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
- Página de soporte/FAQ del autor: https://huggingface.co/DavidAU/support
- Modelos del autor ordenados por tendencia: https://huggingface.co/models?sort=trending&search=DavidAU
