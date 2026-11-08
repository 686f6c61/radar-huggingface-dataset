# Manprot/MP-01-100M-Preview

## Resumen

MP-01-100M-Preview es un modelo de lenguaje decoder-only de 100,6 millones de parámetros desarrollado por el equipo Manprot y entrenado desde cero sobre texto en inglés. Forma parte de la familia MP-01, que incluye también un modelo mayor de 16B (MP-02-16B-Preview). Se distribuye como un checkpoint "preview", no terminado, cuyo entrenamiento continúa en ejecuciones posteriores de la misma familia. El modelo se publica en formato nativo de la librería VBQ (con pesos también en safetensors) y ocupa 0,6 GB en el repositorio.

El punto distintivo del modelo es su linaje de entrenamiento: no es un modelo base puro. Partió de un modelo de 75M parámetros preentrenado en una sola pasada, creció de 12 a 18 capas (con inicialización identidad), recibió un fine-tune de chat y después continuó el preentrenamiento sobre documentos nuevos hasta el paso 19.000, con un cooldown final de 8.000 pasos (2,10B tokens) sobre un corpus no visto. En total acumula unos 11,3B tokens de entrenamiento. El checkpoint publicado corresponde precisamente a ese cooldown.

Es relevante ahora por dos motivos: por un lado, documenta de forma inusualmente detallada un pipeline completo de preentrenamiento, crecimiento de profundidad, fine-tune conversacional y cooldown en un modelo de escala muy pequeña, lo que lo convierte en material útil para investigación sobre recetas de entrenamiento; por otro, su licencia está aún "to be decided", lo que limita de facto su uso comercial hasta que el autor la concrete. Su media de 7 tareas es 48,43, la mejor entre los modelos que el autor compara.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder-only custom VBQ (18 capas, GQA, SwiGLU, QK-norm) |
| Parámetros totales | 100.623.744 (bf16, embeddings atados) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | other / "to-be-decided" (pendiente de decidir) |
| Formato de pesos | safetensors (librería nativa vbq) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 18 capas con atención de consultas agrupadas (GQA), activación SwiGLU y normalización QK-norm, implementado en la librería propietaria VBQ. Los embeddings de entrada y salida están atados, lo que explica que con 100,6M de parámetros el repositorio ocupe solo 0,6 GB en bf16. La arquitectura no incorpora mecanismos híbridos tipo SSM ni atención lineal según la información disponible.

El entrenamiento se organizó en cinco etapas: (1) preentrenamiento de un modelo de 75M desde cero sobre texto inglés en una sola pasada; (2) crecimiento de 12 a 18 capas con inicialización identidad y preentrenamiento adicional sobre documentos nuevos; (3) fine-tune de chat; (4) expansión mediante preentrenamiento continuado sobre documentos nuevos de las mismas fuentes hasta el paso 19.000 con batches de 262k tokens; y (5) cooldown con decaimiento de la tasa de aprendizaje hasta su mínimo durante 8.000 pasos (2,10B tokens) sobre un segundo corpus no visto. En total, unos 11,3B tokens. El corpus combina FineWeb-Edu (34% en las etapas de crecimiento/expansión/cooldown), Wikipedia (24%), Cosmopedia v2 (18%), DCLM (12%), FineMath 4+ (5%), Stack Exchange (4%) y código Python de Dolma3 (3%). El fine-tune de chat usó smol-smoltalk, everyday-conversations, OASST2, UltraChat 200k, Dolly 15k, airoboros-3.2, kalo-opus-instruct, Sonnet3.5-Charcard-Roleplay, roleplay y PIPPA. El tokenizador se entrenó sobre una muestra de las mismas fuentes con las proporciones del mix de 75M.

## Capacidades

- Generación de texto en inglés: continuación de texto coherente a nivel de párrafo, con conocimiento factual limitado por su escala.
- Razonamiento básico y matemáticas elementales, apoyado en la inclusión de FineMath 4+ y Stack Exchange en el corpus.
- Generación de código Python, gracias al subconjunto `stack_edu-Python` de Dolma3.
- Estilo conversacional: al proceder de un fine-tune de chat, puede producir respuestas con formato de diálogo, aunque no sigue instrucciones de forma fiable.
- Capacidades de rol y roleplay, derivadas de los datasets de personajes y rol incluidos en el fine-tune.
- Multilingüismo: no disponible; el modelo declara únicamente inglés.
- Tool calling / function calling: no disponible (no se documenta soporte).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre recetas de entrenamiento: el modelo sirve como caso de estudio reproducible de crecimiento de profundidad con inicialización identidad y cooldown sobre corpus no visto, útil para equipos que diseñan pipelines de preentrenamiento a pequeña escala.
- Generación de texto asistida en inglés: continuación de documentos, redacción de borradores y expansión de ideas donde no se requiere obediencia estricta a instrucciones y sí coherencia local.
- Prototipado rápido de aplicaciones de texto: con 100,6M de parámetros y 0,6 GB de pesos, cabe en cualquier GPU de consumo y permite iterar sobre prompts y plantillas sin coste de infraestructura.
- Completado de código Python en entornos educativos: el modelo ha visto código Python filtrado por calidad y puede sugerir fragmentos simples, siempre con revisión humana.
- Generación de diálogos y roleplay: los datasets de personajes y conversación permiten usarlo en demos de chatbots con personalidad, aceptando que la fidelidad a instrucciones es baja.
- Evaluación comparativa de modelos pequeños: su media de 7 tareas (48,43) y su documentación detallada lo hacen útil como baseline en estudios de escalado y ablaciones.
- Filtrado y clasificación de texto ligero: al ser un modelo pequeño y rápido, puede emplearse en tareas de scoring o etiquetado aproximado en inglés con supervisión.

## Benchmarks y rendimiento

La información disponible solo proporciona la media agregada de 7 tareas: 48,43 para este checkpoint, frente a 47,29 del cooldown anterior de 4.000 pasos desde el paso 15.000. No se detallan los nombres de las 7 tareas ni los resultados individuales, por lo que no es posible presentar una tabla desglosada (MMLU, HumanEval, GSM8K u otros) sin inventar datos.

| Métrica | MP-01-100M-Preview | Cooldown anterior (4.000 pasos desde 15.000) |
|---|---|---|
| Media de 7 tareas | 48,43 | 47,29 |

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los 100,6M de parámetros ocupan aproximadamente 0,2 GB; con overhead de activaciones y KV cache, cabe holgadamente en GPUs con 4 GB o menos.
- GPU recomendadas: cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también funciona en CPU para inferencia por lotes pequeños.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU dedicadas actuales e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: la librería nativa es vbq; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La información proporcionada solo menciona comparaciones internas de la familia MP-01 (el cooldown anterior con media 47,29) y la existencia de MP-02-16B-Preview. No se aportan datos de modelos externos comparables (SmolLM, Qwen2.5-0.5B, etc.), por lo que la comparativa externa se marca como no disponible.

| Modelo | Parámetros | Contexto | Media 7 tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MP-01-100M-Preview | 100,6M | no disponible | 48,43 | to-be-decided | Hugging Face |
| MP-01-100M cooldown anterior | 100,6M | no disponible | 47,29 | to-be-decided | Hugging Face (versión previa) |
| MP-02-16B-Preview | 16B (según nombre) | no disponible | no disponible | no disponible | Hugging Face |
| Modelos externos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo preview e inacabado: el propio autor indica que el entrenamiento continúa en ejecuciones posteriores de MP-01, por lo que el comportamiento puede cambiar y no debe tratarse como versión estable.
- No es un modelo de instrucciones: aunque muestra comportamiento conversacional por su linaje de chat, no sigue instrucciones de forma fiable; usarlo como asistente requiere validación humana.
- Solo inglés: no se declara soporte de otros idiomas, y el rendimiento fuera del inglés no está caracterizado.
- Riesgo de alucinación: con 100,6M de parámetros y 11,3B tokens vistos, la cobertura factual es limitada y las afirmaciones deben verificarse.
- Sesgos: no se documentan evaluaciones de sesgo; los corpus web (FineWeb-Edu, DCLM) y los datasets de rol pueden introducir sesgos de género, culturales y de estilo.
- Licencia sin decidir: al ser "to-be-decided", no hay garantía de uso comercial; conviene contactar con el autor antes de integrarlo en producción.
- Longitud de contexto no especificada: no se documenta la ventana máxima, lo que impide planificar casos de uso con contexto largo.
- Ecosistema limitado: la librería vbq es específica del autor y no se documenta compatibilidad con herramientas estándar (vLLM, llama.cpp, Ollama, TGI).
- Datos de entrenamiento no redistribuidos: el autor indica que el corpus construido no se vuelve a publicar, lo que dificulta la reproducibilidad exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Manprot/MP-01-100M-Preview
- Modelo base relacionado: https://huggingface.co/Manprot/MP-01-100M-base
- Modelo de la familia MP-02: https://huggingface.co/Manprot/MP-02-16B-Preview
- Página del equipo Manprot: https://huggingface.co/Manprot
- Listado de modelos de Manprot: https://huggingface.co/Manprot/models
- Dataset FineWeb-Edu / smollm-corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset DCLM baseline: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0-parquet
- Dataset Wikipedia (20231101.en): https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset Stack Exchange: https://huggingface.co/datasets/HuggingFaceTB/stackexchange_2025_md
- Dataset Dolma3 mix: https://huggingface.co/datasets/allenai/dolma3_mix-6T-1025
- Dataset smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset everyday-conversations: https://huggingface.co/datasets/HuggingFaceTB/everyday-conversations-llama3.1-2k
- Dataset OASST2: https://huggingface.co/datasets/OpenAssistant/oasst2
- Dataset UltraChat 200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset Dolly 15k: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Dataset airoboros-3.2: https://huggingface.co/datasets/jondurbin/airoboros-3.2
