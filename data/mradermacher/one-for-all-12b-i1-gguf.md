# mradermacher/One-For-All-12B-i1-GGUF

## Resumen

One-For-All-12B-i1-GGUF es una cuantización en formato GGUF del modelo One-For-All-12B, un ajuste fino (LoRA) del modelo base Gemma 4 de Google orientado a personificación y roleplay, concretamente al personaje All For One del universo de My Hero Academia. El trabajo de cuantización lo firma mradermacher, un conocido publicador de cuantizaciones GGUF para la comunidad de inferencia local, mientras que el modelo original lo desarrolla TendieLabs. El modelo resuelve el problema de ejecutar un modelo conversacional de 12B parámetros en hardware de consumo mediante cuantizaciones de 1 a 6 bits con calibración imatrix.

El modelo cuenta con 11.907.350.576 parámetros totales (aproximadamente 11,9B) y está etiquetado como modelo de visión, ya que el repositorio estático incluye ficheros mmproj para procesamiento multimodal. La licencia declarada es Apache 2.0, aunque el enlace de licencia apunta a los términos de Gemma 4 de Google, lo que introduce una ambigüedad relevante para uso comercial. Su relevancia actual radica en que permite desplegar un modelo de rol de 12B con capacidades multimodales en GPUs de consumo mediante llama.cpp u Ollama.

El repositorio i1-GGUF ofrece 25 cuantizaciones distintas, desde IQ1_S (3,1 GB) hasta Q6_K (9,9 GB), todas generadas con calibración imatrix (versión 2 del cuantizador, con tensores de salida cuantizados y conversión desde formato Hugging Face). El modelo acumula 11.710 descargas, lo que indica un interés moderado de la comunidad pese a tener solo 1 like.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4), ajuste LoRA sobre TendieLabs/One-For-All-12B |
| Parametros totales | 11.907.350.576 (aprox. 11,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (calibradas con imatrix) |
| Idiomas soportados | ingles (segun la model card) |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (cuantizaciones i1), con fichero imatrix separado; pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Gemma 4 de Google, con aproximadamente 11,9B parámetros. Sobre ese modelo se aplicó un ajuste fino mediante LoRA para especializarlo en la personificación del personaje All For One (My Hero Academia), con etiquetas que confirman el enfoque en persona y roleplay. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica de esta ficha no reside en el modelo en sí, sino en el proceso de cuantización: mradermacher ha generado las cuantizaciones con calibración imatrix (versión 2 del cuantizador, con tensores de salida cuantizados y conversión desde formato Hugging Face), lo que mejora la perplejidad de las cuantizaciones de baja precisión respecto a las cuantizaciones estáticas. El repositorio incluye el fichero imatrix (0,1 GB) para que terceros puedan generar sus propias cuantizaciones. El modelo está etiquetado como modelo de visión, y los ficheros mmproj, si existen, se alojan en el repositorio estático paralelo.

## Capacidades

- Generación de texto conversacional y roleplay: el ajuste LoRA está especializado en la personificación del personaje All For One, con estilo y personalidad consistentes.
- Capacidades multimodales: el modelo está etiquetado como modelo de visión y dispone de ficheros mmproj en el repositorio estático para procesamiento de imágenes.
- Conversación multi-turno: etiquetado como "conversational", orientado a diálogos mantenidos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card; no se declaran otros idiomas.
- Capacidades especiales: modo de personificación (persona) y roleplay; no se declaran modos de razonamiento (thinking) ni audio.

## Casos de uso

- Roleplay y personificación de personajes: el modelo se ha ajustado específicamente para encarnar a All For One, por lo que es adecuado para chatbots de rol, narrativa interactiva y comunidades de fan fiction que requieran consistencia de personaje en conversaciones largas.
- Despliegue local en hardware de consumo: las cuantizaciones i1-Q4_K_M (7,5 GB) e i1-Q4_K_S (7,1 GB) permiten ejecutar el modelo en GPUs de 8-12 GB de VRAM mediante llama.cpp u Ollama, algo inviable con los pesos originales en safetensors.
- Prototipado de asistentes conversacionales especializados: sirve como base para experimentar con ajustes de persona y evaluar la calidad de respuestas antes de invertir en modelos mayores.
- Generación de contenido narrativo derivado: útil para guiones, diálogos y tramas ambientadas en el universo de My Hero Academia, con un tono coherente con el personaje.
- Experimentación con cuantización imatrix: el fichero imatrix incluido permite a investigadores generar sus propias cuantizaciones y comparar la degradación de calidad entre tipos IQ y K-quant.
- Inferencia multimodal en local: si se descargan los ficheros mmproj del repositorio estático, el modelo puede procesar imágenes junto con texto para tareas de descripción o conversación sobre imágenes, dentro de las limitaciones de las cuantizaciones de baja precisión.
- Evaluación comparativa de cuantizaciones: el amplio rango de 25 cuantizaciones (de 3,1 GB a 9,9 GB) permite estudiar el compromiso entre tamaño, velocidad y calidad en un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de perplejidad para las distintas cuantizaciones; únicamente referencia un gráfico externo de ikawrakow sobre perplejidad relativa de tipos de cuantización de baja calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 3,1 GB (i1-IQ1_S) y 9,9 GB (i1-Q6_K) solo para los pesos; hay que añadir el espacio para el contexto KV cache, que depende de la longitud de contexto configurada (no disponible).
- Cuantizaciones recomendadas por el autor: i1-Q4_K_M (7,5 GB) como "fast, recommended" e i1-Q4_K_S (7,1 GB) como "optimal size/speed/quality".
- GPU de consumo: las cuantizaciones de 4 bits (7,1-7,8 GB) caben en GPUs de 8 GB de VRAM con contexto corto, y con holgura en 12 GB (RTX 3060 12 GB, RTX 4070) y 16 GB (RTX 4060 Ti 16 GB, RTX 4080). Las cuantizaciones Q5 y Q6 (8,4-9,9 GB) requieren 12 GB o más.
- GPU profesionales: A100 (40/80 GB), H100 y L40S pueden ejecutar cualquier cuantización con contexto largo y varios usuarios concurrentes.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (LM Studio, koboldcpp). El repositorio declara compatibilidad con "endpoints_compatible". Para visión es necesario cargar el fichero mmproj del repositorio estático.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| One-For-All-12B-i1-GGUF | 11,9B | no disponible | GGUF (25 cuantizaciones i1) | apache-2.0 (enlace a licencia Gemma 4) | Rol de All For One, visión, calibración imatrix |
| One-For-All-12B-GGUF (estático) | 11,9B | no disponible | GGUF (cuantizaciones estáticas) | apache-2.0 | Mismo modelo con cuantizaciones estáticas; aloja los mmproj |
| TendieLabs/One-For-All-12B | 11,9B | no disponible | safetensors | apache-2.0 | Modelo base sin cuantizar, requiere hardware profesional |
| Gemma 4 (modelo base de Google) | no disponible en la información | no disponible | safetensors | licencia Gemma 4 | Modelo generalista sin el ajuste de personaje |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estos modelos entre sí.

## Limitaciones y advertencias

- Especialización estrecha: el ajuste LoRA está orientado a un único personaje de ficción; su utilidad fuera del roleplay de All For One es limitada y puede degradar respuestas en tareas generales.
- Riesgo de alucinación: al ser un modelo de rol sin datos de entrenamiento documentados, puede inventar hechos, y no debe usarse como fuente de información factual.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Ambigüedad de licencia: aunque la etiqueta indica apache-2.0, el enlace apunta a la licencia de Gemma 4 de Google, que impone restricciones adicionales de uso comercial. Conviene verificar los términos aplicables antes de un despliegue en producción.
- Cuantizaciones extremas: las variantes IQ1 e IQ2 (3,1-4,5 GB) degradan notablemente la calidad; el propio autor las describe como "for the desperate" o "mostly desperate".
- Contexto desconocido: no se publica la longitud de contexto soportada, lo que impide dimensionar el KV cache y planificar conversaciones largas.
- Visión condicionada: las capacidades multimodales dependen de ficheros mmproj alojados en otro repositorio; si no se descargan, el modelo funciona solo como texto.
- Contenido de ficción: el personaje representado es un antagonista; pueden aparecer respuestas con tono agresivo o temáticas oscuras propias del personaje, lo que exige moderación en aplicaciones públicas.
- Sin benchmarks: no hay métricas publicadas que permitan estimar la calidad frente a alternativas.

## Enlaces

- Repositorio Hugging Face (i1-GGUF): https://huggingface.co/mradermacher/One-For-All-12B-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/One-For-All-12B-GGUF
- Modelo base: https://huggingface.co/TendieLabs/One-For-All-12B
- Página de descargas del autor: https://hf.tst.eu/model#One-For-All-12B-i1-GGUF
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
