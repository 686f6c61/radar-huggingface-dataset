# s2naito/qwen3.5-0.8b-rag-sft-v4g

## Resumen

`s2naito/qwen3.5-0.8b-rag-sft-v4g` es un ajuste fino (fine-tuning) del modelo base `Qwen/Qwen3.5-0.8B` publicado por el usuario s2naito en Hugging Face. Se trata de un modelo de 873.438.784 parámetros (aproximadamente 0,87 mil millones) entrenado específicamente para responder preguntas cortas en japonés sobre Wikipedia, dentro de un pipeline de generación aumentada por recuperación (RAG). El ajuste se realizó mediante LoRA sobre todos los módulos lineales (`target_modules="all-linear"`), partiendo de la revisión `2fc06364715b967f1860aea9cf38778875588b17` del modelo base.

El modelo está diseñado para integrarse en un pipeline de recuperación concreto: recuperación híbrida de 4 vías con fusión RRF (Reciprocal Rank Fusion) sobre el top-100, reranking con un modelo Ruri, expansión de consulta basada en reglas de 2 saltos (2-hop), selección de artículos mediante `s2naito/qwen3.5-0.8b-rag-selector-v2` y una etapa final de `rerank_title_tail` con `CONTEXT_TOP_K=6`. La receta de entrenamiento (SFT v4 Plan C) aplica un refuerzo de rangos limpios a partir del rango 2, un máximo de 3 veces por pregunta y época, 2 épocas y semilla 42.

Su relevancia radica en que es un ejemplo de especialización extrema de un modelo pequeño para una tarea concreta (QA extractiva en japonés sobre contextos recuperados), lo que permite desplegarlo con requisitos de hardware muy reducidos. La licencia Apache 2.0 facilita su uso comercial, aunque el modelo está limitado al idioma japonés y a la tarea de respuesta corta sobre Wikipedia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; detalles de atención y capas no disponibles) |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del Qwen3.5-0.8B, un transformer de aproximadamente 0,87 mil millones de parámetros. El ajuste se realizó con LoRA sobre todos los módulos lineales (`all-linear`), lo que permite adaptar las proyecciones de atención y las capas feed-forward sin reentrenar todos los pesos. No se dispone de información sobre el número exacto de capas, dimensión oculta, cabezas de atención ni mecanismos específicos de atención del modelo base.

El entrenamiento se realizó sobre la receta SFT v4 Plan C, que utiliza contextos de 6 pasajes (`CONTEXT_TOP_K=6`) construidos con el selector de artículos `s2naito/qwen3.5-0.8b-rag-selector-v2`. Los datos de entrenamiento provienen de cuatro fuentes: JEMHopQA, JSQuAD/JGLUE, NIILC QA y fragmentos de Wikipedia japonesa distribuidos (`bumbuboon/llm-course-final-2026`). Las tres primeras fueron filtradas y reformateadas para el entrenamiento; la cuarta se usó como contexto de recuperación sin modificar. Todas las fuentes están bajo licencia CC BY-SA 4.0. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación adicionales.

## Capacidades

- Generación de respuestas cortas y extractivas en japonés sobre contextos recuperados de Wikipedia.
- Respuesta a preguntas de tipo factual y multi-hop (gracias a la expansión de consulta de 2 saltos en el pipeline de recuperación).
- Integración con pipelines RAG que incluyan recuperación híbrida (BM25 + embeddings), fusión RRF, reranking y selección de artículos.
- Manejo de contextos de hasta 6 pasajes (`CONTEXT_TOP_K=6`) como entrada.
- Capacidad multilingüe limitada: solo se declara japonés (`ja`); no se garantiza rendimiento en otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).
- No se documentan capacidades de generación de código ni matemáticas avanzadas.

## Casos de uso

- **Atención al cliente en japonés sobre base de conocimiento**: el modelo puede responder preguntas cortas y factuales a partir de pasajes recuperados de una base documental, integrándose en un pipeline RAG con recuperación híbrida y reranking. Es adecuado por su especialización en respuestas extractivas y su bajo coste de inferencia.
- **Búsqueda de respuestas sobre Wikipedia japonesa**: despliegue como motor de QA sobre un índice de Wikipedia, usando el pipeline de recuperación descrito (RRF top-100 + Ruri reranker + 2-hop) para generar respuestas concisas a preguntas de usuarios.
- **Sistemas de FAQ automatizadas**: integración en un chatbot de soporte que recupere fragmentos de documentación interna y genere respuestas breves, con la ventaja de que el modelo está entrenado para ceñirse al contexto proporcionado.
- **Asistente de consulta documental para investigadores**: uso en herramientas internas que permitan formular preguntas sobre corpus japoneses y obtener respuestas extractivas con trazabilidad al pasaje fuente.
- **Evaluación de pipelines RAG**: al estar entrenado con un pipeline de recuperación concreto, sirve como componente de referencia para comparar variantes de recuperación, reranking o selección de artículos en experimentos de investigación.
- **Despliegue en entornos con recursos limitados**: al tener menos de 1.000 millones de parámetros, puede ejecutarse en GPUs de consumo (por ejemplo, RTX 3060/4060 con cuantización) o incluso en CPU con llama.cpp, lo que lo hace apto para prototipos y entornos edge.
- **Generación de respuestas multi-hop en japonés**: gracias a la expansión de consulta de 2 saltos del pipeline, puede responder preguntas que requieren combinar información de varios pasajes, como preguntas de JEMHopQA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 873 millones de parámetros, en FP16 se requieren aproximadamente 1,8 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica, unos 3-4 GB. En cuantización de 8 bits, alrededor de 1 GB de pesos; en 4 bits, unos 0,5 GB.
- **GPU recomendadas**: cualquier GPU con al menos 6-8 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4090, A100, H100). Para cuantización 4/8 bits, GPUs con 4 GB o incluso inferencia en CPU.
- **Cabe en consumer GPU**: sí, en la mayoría de GPUs de consumo actuales (RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 24 GB) e incluso en GPUs de gama baja con cuantización.
- **Opciones de despliegue**: vLLM, TGI, llama.cpp, Ollama (previa conversión a GGUF), Transformers con `bitsandbytes` para cuantización. No se han publicado pesos GGUF en el repositorio.
- **Latencia y throughput estimados**: no disponibles. Al ser un modelo pequeño, se espera una latencia baja (decenas de milisegundos por token en GPU moderna) y throughput alto, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| s2naito/qwen3.5-0.8b-rag-sft-v4g | 873 M | No disponible | Japonés | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | No disponible | Multilingüe | Apache 2.0 (según modelo base) | Hugging Face |
| Modelos QA japoneses pequeños (p. ej., variantes de Ruri o LLM-jp) | Variable (0,1-1 B) | Variable | Japonés | Variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, licencia y disponibilidad; no se pueden comparar resultados de benchmarks.

## Limitaciones y advertencias

- **Sesgos conocidos**: al entrenarse sobre Wikipedia japonesa y datasets de QA (JEMHopQA, JSQuAD, NIILC), puede heredar sesgos de cobertura y sesgos culturales de esas fuentes. No se documentan evaluaciones de sesgo.
- **Riesgo de alucinación**: aunque está entrenado para responder a partir de contextos recuperados, como todo modelo generativo puede producir respuestas no fundamentadas, especialmente si el contexto recuperado es irrelevante o insuficiente.
- **Limitaciones de contexto e idioma**: solo se declara japonés; no se garantiza un rendimiento aceptable en otros idiomas. La longitud de contexto no está documentada, lo que dificulta planificar despliegues con pasajes largos.
- **Restricciones de licencia**: el modelo se distribuye bajo Apache 2.0, lo que permite uso comercial. Sin embargo, los datos de entrenamiento (JEMHopQA, JSQuAD/JGLUE, NIILC QA y Wikipedia) están bajo CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir igual sobre obras derivadas; conviene revisar la compatibilidad legal en producción.
- **Especialización extrema**: el modelo está ajustado para un pipeline de recuperación concreto (4-way RRF top-100, Ruri reranker, 2-hop, selector v2, `CONTEXT_TOP_K=6`). Su rendimiento puede degradarse si se usa con un pipeline de recuperación distinto o con un número de pasajes diferente.
- **Caveats para producción**: no hay benchmarks publicados, cero descargas y cero likes en el momento de la ficha, lo que indica ausencia de validación comunitaria. Se recomienda evaluar exhaustivamente antes de desplegar en producción.

## Enlaces

- [Hugging Face: s2naito/qwen3.5-0.8b-rag-sft-v4g](https://huggingface.co/s2naito/qwen3.5-0.8b-rag-sft-v4g)
- [Modelo base: Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
- [Selector de artículos: s2naito/qwen3.5-0.8b-rag-selector-v2](https://huggingface.co/s2naito/qwen3.5-0.8b-rag-selector-v2)
- [JEMHopQA](https://github.com/aiishii/JEMHopQA)
- [JSQuAD / JGLUE](https://github.com/yahoojapan/JGLUE)
- [NIILC QA](https://github.com/mynlp/niilc-qa)
- [Distributed Wikipedia Chunks (bumbuboon/llm-course-final-2026)](https://huggingface.co/datasets/bumbuboon/llm-course-final-2026)
- [Licencia CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
