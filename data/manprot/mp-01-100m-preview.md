# Manprot/MP-01-100M-Preview

## Resumen

MP-01 100M Preview es un modelo de lenguaje de tipo decoder-only desarrollado desde cero por el equipo Manprot. Con 100.623.744 parámetros en bf16 y embeddings atados, se posiciona como un modelo pequeño orientado a experimentación en pretraining y generación de texto en inglés. Su arquitectura es un decoder VBQ personalizado de 18 capas con GQA, SwiGLU y QK-norm, y fue entrenado sobre aproximadamente 11.300 millones de tokens repartidos en cinco etapas.

El modelo no es un modelo base puro: su linaje incluye un ajuste fino conversacional, por lo que puede exhibir comportamientos de chat, aunque no sigue instrucciones de forma fiable. Se publica como vista previa de la familia MP-01, con entrenamiento que continúa en ejecuciones posteriores. Su relevancia actual radica en ser un ejemplo de ciclo completo de pretraining reproducible a pequeña escala, con documentación detallada de datasets, etapas y evaluación en siete tareas.

La licencia está pendiente de decisión ("to-be-decided"), lo que limita su uso comercial hasta que el autor la concrete. El repositorio ocupa 0,2 GB y la librería declarada es vbq, lo que implica que la carga requiere soporte específico para ese formato y no es directamente compatible con transformers estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only VBQ personalizado (18 capas, GQA, SwiGLU, QK-norm) |
| Parametros totales | 100.623.744 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Other / to-be-decided |
| Formato de pesos | safetensors (libreria vbq) |

## Arquitectura y entrenamiento

El modelo emplea un decoder transformer de 18 capas con atención de consultas agrupadas (GQA), activación SwiGLU y normalización QK-norm, con embeddings atados entre entrada y salida. El entrenamiento se realizó desde cero en cinco etapas: un pretraining inicial de un modelo de 75M parámetros sobre texto en inglés en una sola pasada; un crecimiento de 12 a 18 capas con inicialización identidad y pretraining adicional; un ajuste fino conversacional; una expansión con pretraining continuado hasta el paso 19.000 con lotes de 262.000 tokens; y un cooldown con decaimiento de la tasa de aprendizaje hasta su mínimo durante 8.000 pasos (2.100 millones de tokens) sobre un corpus no visto. En total se procesaron aproximadamente 11.300 millones de tokens.

Los datos de pretraining, crecimiento, expansión y cooldown se componen de FineWeb-Edu (34%), Wikipedia (24%), Cosmopedia (18%), DCLM (12%), FineMath (5%), Stack Exchange (4%) y código Python de Dolma3 (3%). El ajuste fino conversacional utilizó smol-smoltalk, everyday-conversations-llama3.1-2k, oasst2, ultrachat_200k, databricks-dolly-15k, Wikipedia, airoboros-3.2, kalo-opus-instruct-22k-no-refusal, Sonnet3.5-Charcard-Roleplay, roleplay y PIPPA. Cada etapa posterior utilizó documentos no vistos por las anteriores, excluyendo shards entre corpus. El tokenizador se entrenó sobre una muestra de las mismas fuentes en las proporciones del mix de 75M.

## Capacidades

- Generación de texto en inglés: continuación de texto coherente a nivel de párrafo, limitada por el tamaño del modelo.
- Razonamiento básico y matemáticas elementales: entrenado con FineMath y Stack Exchange, adecuado para problemas sencillos.
- Generación de código Python: incluye un 3% de código Python de Dolma3 en las etapas de crecimiento, expansión y cooldown.
- Comportamiento conversacional: al derivar de un ajuste fino de chat, puede producir respuestas con formato conversacional, aunque no sigue instrucciones de forma fiable.
- Capacidades multilingües: limitadas al inglés; no se declaran otros idiomas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Experimentación en pretraining a pequeña escala: sirve como referencia reproducible para estudiar el efecto del crecimiento de capas, el cooldown y la mezcla de datos en modelos de ~100M, gracias a la documentación detallada de etapas y datasets.
- Generación de texto de relleno y prototipado: útil para completar textos, generar borradores o crear datos sintéticos en inglés en entornos de desarrollo donde no se requiere alta calidad.
- Evaluación de infraestructura de inferencia: al ser un modelo de 0,2 GB, permite probar pipelines de despliegue, tokenizadores y formatos de pesos con requisitos mínimos de hardware.
- Investigación sobre linajes de modelos: su historial de pretraining, ajuste conversacional y expansión permite estudiar cómo el ajuste fino previo afecta al comportamiento de un modelo posteriormente reentrenado.
- Filtrado y clasificación ligera de texto en inglés: puede usarse como modelo de perplejidad o scoring en tareas de selección de datos, aunque sin garantías de precisión.
- Educación y divulgación: adecuado para demostrar el ciclo completo de entrenamiento de un LLM desde cero en charlas, cursos o tutoriales, dado su tamaño reducido y documentación transparente.
- Roleplay y generación creativa experimental: los datasets de roleplay y charcard incluidos en el ajuste fino permiten explorar respuestas de personaje, aunque con calidad limitada.

## Benchmarks y rendimiento

La model card indica una media de 48,43 en una evaluación de 7 tareas, descrita como la mejor de los modelos comparados en esa tabla, pero no se proporcionan los resultados desglosados por tarea ni los nombres de las tareas en la información disponible. La versión anterior del repositorio, un cooldown de 4.000 pasos desde el paso 15.000, obtuvo una media de 47,29 en las mismas 7 tareas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Modelo | Media 7 tareas |
|---|---|
| MP-01 100M Preview (checkpoint actual) | 48,43 |
| MP-01 100M (cooldown previo de 4.000 pasos) | 47,29 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en bf16 para los pesos (100,6M parámetros), más memoria para activaciones y KV cache; en la práctica cabe en cualquier GPU con 1-2 GB libres.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe en GPU consumer: sí, en todas las GPU consumer con al menos 2 GB de VRAM; también es viable en CPU.
- Opciones de despliegue: la librería declarada es vbq, por lo que se requiere soporte para ese formato; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MP-01 100M Preview | 100,6M | No disponible | to-be-decided | Hugging Face (librería vbq) |
| SmolLM-135M | 135M | No disponible en la información | Apache 2.0 (según conocimiento general, no verificado aquí) | Hugging Face |
| Pythia-160M | 160M | No disponible en la información | Apache 2.0 (según conocimiento general, no verificado aquí) | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparativa se limita a parámetros, licencia y disponibilidad. No se han publicado resultados de benchmarks de MP-01 frente a SmolLM-135M o Pythia-160M en la información disponible.

## Limitaciones y advertencias

- No es un modelo de instrucciones: continúa texto y puede mostrar comportamiento de chat, pero no sigue instrucciones de forma fiable.
- Estado de vista previa: el entrenamiento continúa en ejecuciones posteriores de MP-01, por lo que este checkpoint es incompleto y sus capacidades pueden cambiar.
- Solo inglés: no se declaran capacidades multilingües.
- Licencia sin decidir: el uso comercial queda bloqueado hasta que el autor concrete la licencia "to-be-decided".
- Riesgo de alucinación: elevado por el tamaño reducido del modelo y la ausencia de alineación robusta.
- Sesgos conocidos: no documentados en la información disponible; los datasets de pretraining y ajuste fino pueden introducir sesgos de género, culturales y de estilo conversacional.
- Longitud de contexto no documentada: no se especifica la ventana máxima, lo que dificulta planificar su uso en tareas de contexto largo.
- Formato de pesos no estándar: la librería vbq puede requerir herramientas específicas y no ser compatible con ecosistemas habituales como transformers, vLLM o llama.cpp.
- Datos de entrenamiento no redistribuidos: el autor no republica los datos, solo los datasets públicos de origen.
- Sin datos de benchmarks estándar: no hay resultados de MMLU, HumanEval o GSM8K que permitan comparar con alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/Manprot/MP-01-100M-Preview
- Perfil del autor: https://huggingface.co/Manprot
- Dataset FineWeb-Edu / Cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset DCLM: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0-parquet
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset Stack Exchange: https://huggingface.co/datasets/HuggingFaceTB/stackexchange_2025_md
- Dataset Dolma3: https://huggingface.co/datasets/allenai/dolma3_mix-6T-1025
- Dataset smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset everyday-conversations: https://huggingface.co/datasets/HuggingFaceTB/everyday-conversations-llama3.1-2k
- Dataset OpenAssistant oasst2: https://huggingface.co/datasets/OpenAssistant/oasst2
- Dataset ultrachat_200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset databricks-dolly-15k: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Dataset airoboros-3.2: https://huggingface.co/datasets/jondurbin/airoboros-3.2
- Dataset kalo-opus-instruct-22k-no-refusal: https://huggingface.co/datasets/anthracite-org/kalo-opus-instruct-22k-no-refusal
- Dataset Sonnet3.5-Charcard-Roleplay: https://huggingface.co/datasets/Gryphe/Sonnet3.5-Charcard-Roleplay
- Dataset roleplay: https://huggingface.co/datasets/hieunguyenminh/roleplay
- Dataset PIPPA: https://huggingface.co/datasets/PygmalionAI/PIPPA
