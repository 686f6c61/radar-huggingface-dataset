# Manprot/MP-01-100M-base

## Resumen

MP-01-100M-base es un modelo de lenguaje de 100,6 millones de parámetros desarrollado por el equipo Manprot, entrenado desde cero y publicado como vista previa ("Preview") de la familia MP-01. Se trata de un modelo decoder-only con arquitectura propia denominada VBQ, que incorpora 18 capas, atención con query-key normalization y SwiGLU, con embeddings atados. Su relevancia radica en que documenta de forma poco habitual todo el linaje de entrenamiento: un preentrenamiento inicial de 75M, un crecimiento a 100M mediante la inserción de capas inicializadas como identidad, un ajuste fino conversacional y una expansión posterior con cooldown sobre corpus no vistos.

El modelo no es un base puro: su linaje incluye un ajuste fino de chat, por lo que puede exhibir comportamientos conversacionales, aunque no sigue instrucciones de forma fiable. Está entrenado aproximadamente con 11,3 mil millones de tokens en total entre todas las etapas, sobre un mix de datos en inglés que combina FineWeb-Edu, Wikipedia, Cosmopedia, DCLM, FineMath, Stack Exchange y código Python de Dolma3. La ficha del autor reporta una media de 48,43 en una evaluación de siete tareas, el mejor resultado entre los modelos comparados en su propia tabla.

La licencia está por decidir ("to-be-decided"), lo que supone un bloqueo práctico para cualquier uso comercial o redistribución. El modelo está pensado como experimento de investigación sobre crecimiento de modelos y cooldowns, más que como componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer, arquitectura propia VBQ (18 capas, GQA, SwiGLU, QK-norm, embeddings atados) |
| Parametros totales | 100.623.744 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Por decidir ("to-be-decided", license: other) |
| Formato de pesos | safetensors; librería propia `vbq` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 18 capas con atención de consultas agrupadas (GQA), activación SwiGLU y normalización sobre query y key (QK-norm), con embeddings de entrada y salida atados. La arquitectura se implementa en la librería `vbq`, propia del autor, y no en `transformers` estándar, lo que condiciona las herramientas de carga e inferencia disponibles. No se especifican dimensiones ocultas, número de cabezas ni longitud de contexto en la información proporcionada.

El entrenamiento se organiza en cinco etapas: (1) preentrenamiento de un modelo de 75M sobre texto en inglés en una sola pasada; (2) crecimiento de 12 a 18 capas con inicialización identidad y preentrenamiento adicional sobre documentos nuevos; (3) ajuste fino de chat; (4) expansión con preentrenamiento continuado hasta el paso 19.000 con un batch de 262.000 tokens; y (5) cooldown de 8.000 pasos (2,10 mil millones de tokens) con decaimiento de la tasa de aprendizaje sobre un segundo corpus no visto, que es el checkpoint publicado. En total, unos 11,3 mil millones de tokens. El mix de preentrenamiento, expansión y cooldown incluye FineWeb-Edu (34 %), Wikipedia (24 %), Cosmopedia (18 %), DCLM (12 %), FineMath (5 %), Stack Exchange (4 %) y código Python de Dolma3 (3 %). El ajuste fino de chat usa smol-smoltalk, everyday-conversations, oasst2, ultrachat_200k, dolly-15k, airoboros-3.2, kalo-opus-instruct, Sonnet3.5-Charcard-Roleplay, hieunguyenminh/roleplay y PIPPA, entre otros. No se documenta RLHF ni DPO explícito.

## Capacidades

- Generación de texto en inglés: continuación de texto coherente a nivel local, limitada por el tamaño del modelo.
- Razonamiento básico y respuesta a preguntas factuales sencillas, apoyado en los datos de Wikipedia y Stack Exchange del corpus.
- Matemáticas elementales, reforzadas por el subconjunto FineMath-4plus.
- Generación de código Python a pequeña escala, por el subconjunto stack_edu-Python de Dolma3.
- Comportamiento conversacional heredado del ajuste fino de chat, sin seguimiento fiable de instrucciones.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo "thinking": no disponible.

## Casos de uso

- Investigación sobre crecimiento de modelos: el linaje documentado (75M → 100M con inicialización identidad de capas) permite reproducir y estudiar técnicas de model growth con un checkpoint intermedio concreto.
- Estudio de cooldowns y decaimiento de la tasa de aprendizaje: el autor publica dos cooldowns alternativos además del liberado, lo que facilita comparar el efecto del cooldown sobre las métricas de evaluación.
- Prototipado rápido de pipelines de generación de texto: con 100M de parámetros y pesos en bf16 de unos 0,2 GB, se puede cargar y ejecutar en CPU o en GPU de gama baja para pruebas de integración.
- Generación de texto asistida en entornos con recursos muy limitados: aplicaciones de autocompletado o generación de borradores en inglés donde el coste de inferencia es crítico.
- Experimentos de destilación y evaluación de tokenizadores: al documentarse el entrenamiento del tokenizador sobre el mismo mix de datos, sirve como referencia para estudiar decisiones de tokenización en modelos pequeños.
- Base para ajuste fino académico: punto de partida de bajo coste para estudiar fine-tuning supervisado en inglés, siempre que la licencia se resuelva.
- Evaluación comparativa de modelos pequeños: útil como baseline de 100M en benchmarks de siete tareas para contrastar con otros modelos de escala similar.

## Benchmarks y rendimiento

La model card reporta una media de 48,43 en una evaluación de siete tareas (7-task average), descrita como la mejor de los modelos comparados en la tabla del autor. No se detallan en la información proporcionada los nombres de las siete tareas ni los resultados individuales, ni los modelos concretos de comparación. El cooldown anterior de este mismo repositorio (4.000 pasos desde el paso 15.000) obtenía una media de 47,29 en la misma métrica.

| Metrica | MP-01-100M-base (checkpoint publicado) | Cooldown anterior (4.000 pasos) |
|---|---|---|
| Media 7 tareas | 48,43 | 47,29 |
| Resultados por tarea | no disponible | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,2 GB para los pesos (100,6M de parámetros × 2 bytes), más memoria para activaciones y caché KV, que depende de la longitud de contexto no especificada.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para bf16 en contextos cortos; también es viable en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: la librería `vbq` es el único runtime documentado; no se indica soporte para vLLM, llama.cpp, Ollama ni TGI. La conversión a GGUF no está documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MP-01-100M-base | 100,6M | no disponible | por decidir | Hugging Face, runtime `vbq` |
| SmolLM-135M (HuggingFaceTB) | 135M | 2.048 tokens (versión base) | Apache 2.0 | Hugging Face, transformers, GGUF |
| Qwen2.5-0.5B | 494M | 32.768 tokens | Apache 2.0 | Hugging Face, transformers, vLLM, GGUF |
| Pythia-160M | 160M | 2.048 tokens | Apache 2.0 | Hugging Face, transformers |

La comparación de rendimiento con estos modelos no está disponible en la información proporcionada; el autor solo compara contra sus propios checkpoints. Frente a SmolLM-135M, MP-01-100M-base es ligeramente menor en parámetros, pero carece de licencia definida y de soporte en el ecosistema estándar de inferencia, lo que limita su adopción práctica.

## Limitaciones y advertencias

- Licencia sin definir ("to-be-decided"): no se puede garantizar el uso comercial ni la redistribución; tratar como no apto para producción hasta que se aclare.
- Modelo en estado "Preview": el propio autor indica que el entrenamiento continúa en ejecuciones posteriores de MP-01.
- No es un base puro: incluye un ajuste fino de chat en su linaje, por lo que puede producir respuestas con formato conversacional sin seguir instrucciones de forma fiable.
- Solo inglés: no hay capacidades multilingües documentadas.
- Riesgo elevado de alucinación y de errores factuales por el tamaño reducido (100M) y la ventana de contexto no especificada.
- Dependencia de la librería `vbq`, no estándar, con posible falta de mantenimiento y sin integración con herramientas habituales (vLLM, llama.cpp, TGI).
- El corpus de ajuste fino incluye datasets de roleplay y "no refusal", lo que puede introducir sesgos de estilo y de contenido en las respuestas.
- No se documentan sesgos medidos ni evaluaciones de seguridad.
- Los datos de entrenamiento no se redistribuyen; la reproducibilidad completa no es posible.
- No hay información sobre longitud de contexto, tokenizador (tamaño de vocabulario) ni hiperparámetros de inferencia recomendados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Manprot/MP-01-100M-base
- Organización Manprot: https://huggingface.co/Manprot
- Modelo relacionado de la familia: https://huggingface.co/Manprot/MP-02-16B-Preview
- Dataset FineWeb-Edu / Cosmopedia (smollm-corpus): https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset DCLM baseline: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0-parquet
- Dataset Wikipedia (20231101.en): https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset Stack Exchange 2025: https://huggingface.co/datasets/HuggingFaceTB/stackexchange_2025_md
- Dataset Dolma3 mix: https://huggingface.co/datasets/allenai/dolma3_mix-6T-1025
- Dataset smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset everyday-conversations: https://huggingface.co/datasets/HuggingFaceTB/everyday-conversations-llama3.1-2k
- Dataset OpenAssistant oasst2: https://huggingface.co/datasets/OpenAssistant/oasst2
- Dataset UltraChat 200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset Databricks Dolly 15k: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Dataset airoboros-3.2: https://huggingface.co/datasets/jondurbin/airoboros-3.2
- Dataset kalo-opus-instruct-22k-no-refusal: https://huggingface.co/datasets/anthracite-org/kalo-opus-instruct-22k-no-refusal
- Dataset Sonnet3.5-Charcard-Roleplay: https://huggingface.co/datasets/Gryphe/Sonnet3.5-Charcard-Roleplay
- Dataset hieunguyenminh/roleplay: https://huggingface.co/datasets/hieunguyenminh/roleplay
- Dataset PIPPA: https://huggingface.co/datasets/PygmalionAI/PIPPA
