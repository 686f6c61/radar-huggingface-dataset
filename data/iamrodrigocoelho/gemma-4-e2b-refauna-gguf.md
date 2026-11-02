# iamrodrigocoelho/gemma-4-e2b-refauna-GGUF

## Resumen

Gemma 4 E2B · Refauna es un ajuste fino del modelo base `google/gemma-4-e2b-it` (licencia Apache 2.0) desarrollado por el usuario de HuggingFace `iamrodrigocoelho`. Se trata de un modelo de lenguaje especializado en portugués de Brasil sobre defaunación, refaunación, reintroducción de fauna, dispersión de semillas e interacciones ecológicas en la Mata Atlántica, construido a partir de la producción científica de la iniciativa Refauna (Brasil). El modelo está pensado como un asistente conversacional que responde preguntas apoyándose en pasajes recuperados de artículos científicos y citándolos con el formato `[n]`.

El ajuste se realizó con QLoRA de 4 bits (r=16, alpha=16, 2 épocas, lr=0.0002) usando la librería Unsloth sobre el checkpoint `unsloth/gemma-4-E2B-it`, con 942 ejemplos sintéticos en portugués de Brasil generados a partir de 22 artículos y revisados humanamente de forma muestral. El resultado se distribuye como archivos GGUF cuantizados, lo que permite su despliegue en hardware de consumo mediante Ollama o llama.cpp, además de la variante original en Transformers.

Su relevancia es doble: por un lado, demuestra el patrón de especialización de modelos pequeños (4.647.450.147 parámetros) sobre dominios científicos concretos con recursos limitados (una única NVIDIA L4, 27,8 minutos de entrenamiento, pico de 10,57 GB de VRAM); por otro, ilustra la combinación de fine-tuning y RAG (recuperación híbrida con `google/embeddinggemma-300m` y BM25 fusionados por RRF, top-4) para construir asistentes de divulgación científica con citas verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4), ajuste fino con QLoRA sobre `google/gemma-4-e2b-it` |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (entre ellos Q4_K_M, segun el ejemplo de Ollama); el ajuste se entrenó en 4 bits |
| Idiomas soportados | pt (portugués de Brasil), en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 9,4 GB); variante Transformers referenciada como `iamrodrigocoelho/gemma-4-e2b-refauna` |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-e2b-it`, un transformer decoder-only de la familia Gemma 4, y se especializa mediante QLoRA de 4 bits con rango 16, alpha 16, dos épocas y tasa de aprendizaje 0.0002, aplicando el adaptador únicamente a las capas de lenguaje. El entrenamiento se ejecutó con Unsloth sobre una NVIDIA L4 en 27,8 minutos, con un pico de 10,57 GB de VRAM, y utilizó la plantilla de chat `gemma-4` sin modo thinking.

El corpus de ajuste son 942 ejemplos sintéticos en portugués de Brasil generados a partir de 22 artículos científicos de Refauna, con una composición de estilo RAFT: aproximadamente un 60 % de ejemplos con contexto y citas, un 15 % de ejemplos de abstención y un 25 % sin contexto. Se aplicó revisión humana muestral y una partición de datos por documento para evitar filtración entre entrenamiento y evaluación. La innovación principal no es arquitectónica sino de flujo de trabajo: el modelo se entrena para consumir pasajes numerados y responder citando `[n]`, integrándose en un pipeline RAG con embeddings `google/embeddinggemma-300m` y BM25 fusionados mediante RRF con top-4.

## Capacidades

- Generación de texto conversacional en portugués de Brasil y en inglés.
- Respuesta fundamentada en contexto (RAG): recibe fragmentos numerados y cita las fuentes usadas con el formato `[n]`.
- Abstención explícita: se le entrena para indicar que no encuentra la información en el contexto en lugar de inventar datos, números, fechas o nombres de especies.
- Dominio especializado: defaunación, refaunación, reintroducción de fauna, dispersión de semillas, interacciones ecológicas y conservación de la Mata Atlántica.
- Formato de prompt con roles system/user y plantilla `gemma-4` sin modo thinking.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Visión, audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Asistente de divulgación científica con RAG: desplegado con el pipeline descrito (embeddings `google/embeddinggemma-300m` + BM25, top-4) para responder preguntas del público sobre refaunación citando los artículos originales con `[n]`.
- Apoyo a investigadores en revisión bibliográfica: consultas sobre reintroducción de especies concretas (por ejemplo, *Dasyprocta leporina* o *Alouatta guariba*) con recuperación de pasajes y citas verificables.
- Material educativo para talleres y charlas: el modelo se creó para la ponencia «Pequenos modelos, conhecimento especializado: fine-tuning e RAG com os dados do Refauna» (TDC Stage @ Rec'n'Play 2026), por lo que encaja en demostraciones docentes de fine-tuning y RAG.
- Consultas de conservación en campo: respuestas rápidas sobre dispersión de semillas, interacciones ecológicas o protocolos de reintroducción, siempre con remisión a la fuente citada.
- Despliegue local en hardware modesto: la variante GGUF Q4_K_M puede ejecutarse con Ollama (`ollama run hf.co/iamrodrigocoelho/gemma-4-e2b-refauna-GGUF:Q4_K_M`) en portátiles, útil para divulgación sin infraestructura de servidor.
- Base para nuevos ajustes de dominio: el patrón (QLoRA 4 bits, 942 ejemplos, partición por documento) sirve como receta replicable para especializar modelos pequeños en otros corpus científicos con una sola GPU.

## Benchmarks y rendimiento

Evaluación publicada por el autor con notas de 1 a 5 asignadas por un juez LLM. Configuraciones: A = base, B = base + RAG, C = fine-tuned, D = fine-tuned + RAG.

| Config | Corrección | Fidelidad | Citación correcta | Abstención correcta | PT-BR |
|---|---|---|---|---|---|
| A: base | 1.12 | no disponible | no disponible | no disponible | 1.00 |
| B: base + RAG | 2.47 | 4.35 | 0.52 | 0.88 | 1.00 |
| C: fine-tuned | 2.17 | no disponible | no disponible | no disponible | 1.00 |
| D: fine-tuned + RAG | 2.29 | 4.17 | 0.52 | 0.88 | 1.00 |

Recuperación híbrida en el conjunto de prueba (n=74): Recall@4 = 0.42, MRR@20 = 0.30.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repo GGUF ocupa 9,4 GB, por lo que una cuantización Q4_K_M de un modelo de ~4.647 millones de parámetros debería situarse en el rango de 3 a 4 GB, aunque este dato no está confirmado en la información proporcionada.
- VRAM de entrenamiento documentada: pico de 10,57 GB en una NVIDIA L4 durante el ajuste QLoRA de 4 bits.
- GPU recomendadas: NVIDIA L4 (usada en el entrenamiento); para inferencia, cualquier GPU con VRAM suficiente para la cuantización elegida.
- ¿Cabe en GPU de consumo? No confirmado explícitamente, pero el formato GGUF y el ejemplo con Ollama apuntan a que sí en GPUs de consumo con la cuantización adecuada.
- Opciones de despliegue: Ollama (`ollama run hf.co/iamrodrigocoelho/gemma-4-e2b-refauna-GGUF:Q4_K_M`), llama.cpp (formato GGUF) y Transformers (`pipeline("text-generation", model="iamrodrigocoelho/gemma-4-e2b-refauna")`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 E2B · Refauna (este) | 4.647.450.147 | no disponible | Refaunación y conservación de la Mata Atlántica (pt/en) | Apache 2.0 | GGUF y Transformers |
| google/gemma-4-e2b-it (base) | no disponible | no disponible | Propósito general, multilingüe | Apache 2.0 | no disponible |
| Alternativas de propósito general del mismo tamaño | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada.

## Limitaciones y advertencias

- Uso educativo y de divulgación científica: no sustituye a la literatura original; deben consultarse siempre las fuentes citadas.
- Sin RAG, el modelo puede equivocarse en números, fechas y nombres de especies.
- El conocimiento está restringido a los 22 artículos utilizados; no cubre toda la producción de Refauna.
- Riesgo de alucinación fuera del contexto recuperado, mitigado parcialmente por el entrenamiento en abstención (~15 % de ejemplos).
- Cobertura lingüística limitada a portugués de Brasil e inglés; no se documenta soporte para otras lenguas.
- La evaluación se basa en un juez LLM con notas de 1 a 5, no en benchmarks estandarizados ni en evaluación humana a gran escala.
- La calidad de la recuperación condiciona el resultado: Recall@4 = 0.42 y MRR@20 = 0.30 indican que el contexto recuperado puede ser incompleto en una parte relevante de las consultas.
- Licencia Apache 2.0: permite uso comercial, pero deben respetarse las condiciones de la licencia del modelo base y la atribución de las fuentes científicas citadas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación externa muy limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iamrodrigocoelho/gemma-4-e2b-refauna-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-e2b-it
- Checkpoint base usado en el ajuste: https://huggingface.co/unsloth/gemma-4-E2B-it
- Iniciativa Refauna: https://refauna.org.br
- Artículo sobre prevención de lesiones por collares de radiotelemetría (2013): https://doi.org/10.1590/S1984-46702013000100015
- Éxito a corto plazo en la reintroducción de *Dasyprocta leporina* (2014): https://doi.org/10.1177/194008291400700415
- Consumo de carroña por *Dasyprocta leporina* (2014): https://doi.org/10.1590/bjb.2014.0087
- Extinción local de un dispersor y distribución de *Astrocaryum aculeatissimum* (2015): https://doi.org/10.1590/0102-33062015abb0008
- Crédito de interacciones ecológicas (2017): https://doi.org/10.1002/ece3.2746
- Rewilding the Atlantic Forest (2017): https://doi.org/10.1016/j.pecon.2017.09.004
- Crecimiento poblacional no asistido de *Dasyprocta leporina* (2018): https://doi.org/10.1017/S0030605316001149
- Restauración de poblaciones de *Alouatta guariba* (2024): https://doi.org/10.3389/fcosc.2024.1401749
- Recuperación de patrones de actividad en tapires reintroducidos (2025): https://doi.org/10.1017/S0030605325102494
