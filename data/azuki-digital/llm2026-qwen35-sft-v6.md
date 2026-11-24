# azuki-digital/llm2026-qwen35-sft-v6

## Resumen

llm2026-qwen35-sft-v6 es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3.5-0.8B, desarrollado por azuki-digital para el trabajo final del curso «LLM講座2 2026». Se trata de un modelo de 873.438.784 parámetros (aproximadamente 0,87 mil millones) obtenido mediante LoRA sobre el modelo base y posteriormente fusionado en los pesos originales, de modo que la arquitectura resultante es idéntica a la de Qwen3.5-0.8B. La licencia es Apache-2.0 y el único idioma declarado es el japonés.

El modelo está especializado en tareas de question answering sobre documentos y en razonamiento multi-hop orientado a la selección de fuentes de información. Su entrenamiento se apoya en datasets japoneses de QA (JEMHopQA, JSQuAD y auto-wiki-qa) procesados mediante un pipeline de recuperación con BM25 y los modelos de embeddings y reranking ruri-v3-310m de cl-nagoya, filtrando únicamente los ejemplos en los que el fragmento recuperado contenía la respuesta.

Su relevancia es acotada: se trata de un artefacto educativo con cero descargas y cero «likes» en el momento de la ficha, sin pipeline declarado ni benchmarks publicados. Resulta útil como referencia de cómo se construye un SFT pequeño y especializado con datos de recuperación aumentada, pero no está pensado como modelo de propósito general ni como base para producción multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-0.8B), no disponible el detalle exacto de capas y dimensiones |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio de 1,8 GB) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del modelo base Qwen/Qwen3.5-0.8B (revisión 2fc06364715b967f1860aea9cf38778875588b17), un transformer decoder-only denso de unos 873 millones de parámetros. El ajuste se realizó con LoRA y los adaptadores se fusionaron posteriormente en los pesos del modelo original, por lo que la estructura de red no cambia respecto al base. No se documentan en la información disponible ni el número de tokens de entrenamiento, ni hiperparámetros del LoRA, ni si hubo etapas de RLHF o DPO.

Los datos de entrenamiento provienen de tres fuentes en japonés: JEMHopQA, JSQuAD (de JGLUE) y cl-nagoya/auto-wiki-qa, todas bajo licencia CC BY-SA 4.0 y filtradas y reformateadas para el entrenamiento. Cada pregunta se pasó por un pipeline de recuperación compuesto por BM25, el modelo de embeddings cl-nagoya/ruri-v3-310m y el reranker cl-nagoya/ruri-v3-reranker-310m, sobre un conjunto de fragmentos derivados de Wikipedia en japonés; solo se conservaron los ejemplos en los que el fragmento recuperado contenía la cadena de respuesta. Además, se generaron de forma mecánica tareas de selección de la siguiente fuente a consultar a partir de los resultados de recuperación, y se incluyeron preguntas de dos saltos construidas uniendo por reglas dos preguntas de auto-wiki-qa. No se describe ninguna innovación arquitectónica propia (atención lineal, decodificación especulativa ni mezcla de expertos).

## Capacidades

- Generación de texto en japonés, con foco en respuestas extractivas y de QA sobre documentos.
- Question answering sobre contexto recuperado: el modelo fue entrenado con ejemplos en los que el fragmento de soporte contiene la respuesta.
- Razonamiento multi-hop limitado: incluye ejemplos de dos saltos construidos mecánicamente a partir de auto-wiki-qa.
- Selección de la siguiente fuente de consulta en un pipeline de recuperación (predicción del artículo o fragmento a examinar a continuación entre un conjunto de candidatos).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes autónomos ni de modos de razonamiento extendido (thinking mode).
- No se documenta capacidad de visión, audio ni multimodalidad.
- Capacidad multilingüe: solo se declara japonés; no hay evidencia de rendimiento en otros idiomas.

## Casos de uso

- Respuesta a preguntas sobre documentación interna en japonés: dado un fragmento recuperado por un sistema RAG, el modelo puede extraer y formular la respuesta, ya que fue entrenado precisamente con pares pregunta-fragmento que contienen la respuesta.
- Componente de un pipeline RAG japonés: puede emplearse como generador final tras la recuperación con BM25 y ruri-v3, aprovechando que el formato de entrenamiento replica ese flujo.
- Selección de la siguiente fuente en búsqueda iterativa: el modelo puede elegir entre candidatos qué artículo consultar a continuación, una tarea para la que se generaron datos específicos durante el ajuste.
- Preguntas de dos saltos en dominios enciclopédicos: útil en prototipos que requieran encadenar dos consultas sobre Wikipedia en japonés, aunque con las limitaciones de un modelo de 0,87 mil millones de parámetros.
- Experimentación educativa y reproducción de recetas de SFT: sirve como ejemplo documentado de construcción de un dataset de QA filtrado por recuperación y de fusión de adaptadores LoRA.
- Evaluación comparativa de pipelines de recuperación: al estar entrenado sobre salidas concretas de BM25 + ruri-v3, puede usarse para medir la sensibilidad del generador a cambios en el recuperador.
- Despliegue en entornos con recursos muy limitados: por su tamaño, es viable en CPU o en GPU de gama baja para pruebas de concepto en japonés, siempre que se acepte su falta de benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 1,7-1,8 GB solo para pesos, más memoria para el contexto y el runtime; en cuantización de 8 bits aproximadamente 0,9 GB y en 4 bits alrededor de 0,5 GB (estimaciones a partir del número de parámetros, no verificadas con el modelo).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 resulta suficiente por tamaño; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 pueden alojarlo sin problema, aunque las de gama alta estarán infrautilizadas.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer actuales, e incluso en CPU para inferencia en cuantización baja.
- Opciones de despliegue: al no publicarse variantes GGUF ni cuantizadas, el uso directo requiere transformers con safetensors; sería necesario convertir los pesos para llama.cpp u Ollama. No se documenta compatibilidad con vLLM ni TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| llm2026-qwen35-sft-v6 | 873.438.784 | no disponible | Apache-2.0 | ja | SFT educativo sobre Qwen3.5-0.8B, sin benchmarks |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 mil millones | no disponible | Apache-2.0 | no disponible en esta ficha | Modelo original sin ajuste específico de QA japonés |
| cl-nagoya/ruri-v3-310m | ~310 millones | no disponible | no disponible en esta ficha | ja | Modelo de embeddings usado en el pipeline de recuperación, no generativo |
| cl-nagoya/ruri-v3-reranker-310m | ~310 millones | no disponible | no disponible en esta ficha | ja | Reranker del pipeline, tarea distinta a la generación |

La comparación con alternativas generativas de tamaño similar no puede completarse con datos verificados en la información disponible; los modelos listados se incluyen por su relación directa con el pipeline de entrenamiento, no como sustitutos funcionales equivalentes.

## Limitaciones y advertencias

- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en QA, razonamiento ni ningún otro eje.
- Ámbito muy restringido: entrenado sobre un subconjunto filtrado de datasets de QA japoneses; es probable que generalice mal fuera de ese dominio y formato.
- Riesgo de alucinación: como todo modelo generativo pequeño, puede producir respuestas plausibles pero incorrectas, especialmente cuando el fragmento de contexto no contiene la respuesta.
- Sesgos: no documentados por el autor; los datasets de origen (Wikipedia en japonés y JGLUE) pueden introducir sesgos de cobertura y de representación.
- Idioma: solo se declara japonés; no hay garantía de comportamiento correcto en castellano ni en otros idiomas.
- Contexto: la longitud de ventana no está documentada, lo que impide planificar el tamaño de los fragmentos de entrada en producción.
- Licencia del modelo: Apache-2.0 permite uso comercial, pero los datos de entrenamiento son CC BY-SA 4.0, lo que puede plantear dudas sobre la redistribución de derivados; conviene revisar la compatibilidad antes de un uso comercial.
- Madurez: cero descargas y cero «likes», sin pipeline declarado ni documentación de evaluación; no es un artefacto validado para producción.
- Sin variantes cuantizadas publicadas: el despliegue eficiente requiere trabajo adicional de conversión y validación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/azuki-digital/llm2026-qwen35-sft-v6
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset JSQuAD (JGLUE): https://github.com/yahoojapan/JGLUE
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Modelo de embeddings ruri-v3-310m: https://huggingface.co/cl-nagoya/ruri-v3-310m
- Reranker ruri-v3-reranker-310m: https://huggingface.co/cl-nagoya/ruri-v3-reranker-310m
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
