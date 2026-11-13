# Charlie320/zils-mini-xg2

## Resumen

zils-mini-xg2 es un modelo de decisión de 4.539 millones de parámetros derivado de Qwen/Qwen3.5-4B, publicado por el usuario Charlie320 en Hugging Face. Forma parte del ecosistema Zils, un conjunto de modelos orientados a tareas de decisión y evaluación por examen dentro del pool `d3-mini` de la subred 127 de Bittensor. El modelo se presenta como un "cuerpo" (body) afinado sobre el chasis de Qwen3.5-4B, con los pesos de lenguaje entrenados y la torre de visión heredada del modelo padre.

Técnicamente, se trata de un fine-tune por "soup": se parte de la media uniforme de los dos cuerpos actuales del pool z3-mini y se aplica una única ejecución de LoRA de rango 64 (anchor 0.1, learning rate 5e-5) sobre 60.000 filas aleatorias de un conjunto de datos mixto de 130.641 filas, para después fusionar los pesos. El resultado se distribuye en BF16 y formato safetensors, con licencia Apache 2.0.

Su relevancia es acotada y muy específica: no es un modelo de propósito general, sino una pieza de un sistema de decisión/evaluación con formato de examen, pensada para integrarse en el pool de la subred Bittensor. Para desarrolladores e investigadores, resulta interesante como ejemplo de fine-tuning por soup con LoRA sobre un modelo base moderno y como artefacto de un pipeline de datos particular (items de examen, etiquetas gold de splits públicos y respuestas de un profesor relay).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B; incluye torre de visión heredada del padre) |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se construye sobre el chasis de Qwen/Qwen3.5-4B, un transformer de aproximadamente 4.500 millones de parámetros, e incorpora la torre de visión del modelo padre. El proceso de entrenamiento es un fine-tune por soup: se parte de la media uniforme de los dos cuerpos actuales del pool z3-mini y se ejecuta una única pasada de LoRA de rango 64 con anchor 0.1 y learning rate 5e-5 sobre 60.000 filas muestreadas aleatoriamente de un mix de 130.641 filas, tras lo cual los adaptadores se fusionan en los pesos base.

El conjunto de datos combina dos bloques. El primero (a) son items de decisión en formato de examen escritos con la receta pública de autoría de Zils (`scripts/author_exam.py`) por Claude Opus y por un modelo abierto local, a partir únicamente de splits públicos de entrenamiento, más las respuestas del profesor relay público de Zils. El segundo (b) son aproximadamente 84.000 items de decisión: unos 70.000 convertidos desde splits públicos de TRAIN con sus etiquetas gold (MNLI, RTE, STS-B, 20 Newsgroups, QNLI, emotion, sarcasm, SIQA, PIQA, GSM8K, function calling de Glaive y puntuaciones de reglas derivadas de TweetEval) en los formatos de examen actuales, 7.120 items en formato de examen escritos con la receta pública (x2) y el examen semilla público `zils-ai/base-exam-seed-v1` (familias antiguas, x3). No se usaron los exámenes semilla v2-v4 ni items de examen de validadores.

## Capacidades

- Generación de texto y razonamiento sobre el chasis de Qwen3.5-4B, con pesos de lenguaje afinados para el dominio de decisión.
- Capacidad de visión heredada de la torre del modelo padre (Qwen/Qwen3.5-4B).
- Resolución de items en formato de examen y tareas de decisión con etiquetas discretas, que es el objetivo principal del fine-tune.
- Clasificación y juicio sobre pares de frases y tareas de inferencia lingüística (derivadas de MNLI, RTE, QNLI, STS-B en el entrenamiento).
- Razonamiento aritmético básico y resolución de problemas de matemáticas de nivel escolar (GSM8K en el mix de datos).
- Soporte de function calling / tool calling (datos de Glaive en el entrenamiento).
- Capacidades multilingües: no disponible (no se especifican idiomas).
- No se documentan modos especiales como thinking mode, audio o agentes multi-paso más allá de lo heredado del modelo base.

## Casos de uso

- Evaluación automática de items tipo examen: el modelo está entrenado específicamente con items de decisión en formato de examen, por lo que puede usarse como evaluador o respondedor dentro de un pipeline de validación de modelos en la subred Bittensor 127.
- Clasificación de pares de frases e inferencia lingüística: adecuado para tareas de NLI y similitud semántica (MNLI, RTE, QNLI, STS-B) gracias a que esas etiquetas gold forman parte del mix de entrenamiento.
- Moderación y análisis de sentimiento/emoción: los datos de emotion, sarcasm y puntuaciones derivadas de TweetEval permiten usarlo en tareas de clasificación de tono en textos cortos.
- Respuesta a preguntas de sentido común: con SIQA y PIQA en el entrenamiento, puede emplearse en pipelines de QA de sentido común y razonamiento físico básico.
- Asistente con function calling: los datos de Glaive permiten integrarlo en flujos donde el modelo debe emitir llamadas a herramientas estructuradas.
- Componente de un ensemble o pool de modelos: al ser un "body" del pool z3-mini, su uso natural es como miembro de un conjunto de modelos combinados por soup o votación.
- Investigación sobre fine-tuning por soup con LoRA: sirve como artefacto reproducible para estudiar el efecto de la media de pesos y de una pasada LoRA de rango 64 sobre un modelo base de 4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9 GB solo para pesos (4.539 millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 10 y 12 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB de pesos; en 4 bits, alrededor de 2,5-3 GB de pesos (las cuantizaciones no están publicadas, habría que generarlas).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en BF16 con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para BF16 con margen.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) en BF16 con contexto moderado; en GPUs de 8-12 GB requeriría cuantización.
- Opciones de despliegue: vLLM, TGI, llama.cpp (tras conversión a GGUF), Ollama (tras conversión), Transformers con `device_map="auto"`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-xg2 | 4.539 M | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Fine-tune de decisión sobre Qwen3.5-4B |
| Qwen/Qwen3.5-4B | ~4 B (no confirmado) | no disponible | no disponible en esta ficha | Hugging Face | Modelo base del que deriva |
| Charlie320/zils-mini-s3l | no disponible | no disponible | no disponible | Hugging Face | Modelo base del fine-tune |
| jaysun007/zils-mini-body-m10 | no disponible | no disponible | no disponible | Hugging Face | Modelo base del fine-tune |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: está afinado para items de decisión en formato de examen del ecosistema Zils; su rendimiento en tareas generales puede degradarse respecto al Qwen3.5-4B original.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, lo que dificulta evaluar su idoneidad para producción.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas plausibles pero incorrectas, especialmente fuera del dominio de entrenamiento.
- Sesgos: los datos de entrenamiento provienen de splits públicos con posibles sesgos demográficos y lingüísticos (MNLI, TweetEval, etc.); no se documenta ninguna mitigación.
- Idiomas: no se especifican los idiomas soportados; no se garantiza un buen rendimiento en castellano.
- Licencia: Apache 2.0 permite uso comercial, pero el repositorio solo contiene pesos; el autor advierte de que deben revisarse los términos de los datasets de origen antes de reutilizar.
- Contexto: no se documenta la longitud de contexto efectiva, lo que impide planificar despliegues con ventanas largas.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin comunidad ni soporte documentado.
- Uso en Bittensor: su propósito está ligado a la subred 127; fuera de ese contexto su utilidad es limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charlie320/zils-mini-xg2
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base jaysun007/zils-mini-body-m10: https://huggingface.co/jaysun007/zils-mini-body-m10
- Modelo base Charlie320/zils-mini-s3l: https://huggingface.co/Charlie320/zils-mini-s3l
- Examen semilla público zils-ai/base-exam-seed-v1: https://huggingface.co/zils-ai/base-exam-seed-v1
