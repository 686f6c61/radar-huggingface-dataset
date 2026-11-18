# Meridian21Lab/concept-memory-140m-11.5bt

## Resumen

`concept-memory-140m-11.5bt` es un modelo base de lenguaje en inglés de 141,5 millones de parámetros desarrollado por Meridian21Lab dentro del proyecto MrCogito. Se trata de un modelo entrenado desde cero sobre 11,5 mil millones de tokens de datos públicos con un coste declarado de aproximadamente 320 dólares, y su innovación principal es un mecanismo de "memoria de conceptos": mientras lee, agrupa el texto ya visto en pequeños clústeres de tokens relacionados (unos 8 tokens cada uno) y mantiene un resumen de cada clúster; para predecir la siguiente palabra relee literalmente los clústeres más relevantes y consulta los resúmenes del resto.

La arquitectura es un transformer `perceiver_ar` con capas locales que solo ven los últimos 128 tokens, pero que gracias a la memoria de conceptos aprovecha hasta 64k tokens de contexto (unas 50.000 palabras, equivalente a una novela corta). Es una publicación de investigación: modelo base, una sola semilla de entrenamiento y sin ajuste por instrucciones.

Su relevancia radica en que demuestra que un modelo muy pequeño, con un presupuesto de entrenamiento reducido, puede competir en predicción de documentos largos con modelos de mayor tamaño y mucho más entrenados, y que además utiliza de forma efectiva todo el contexto disponible (hasta 61k tokens) en lugar de degradarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `perceiver_ar` con memoria de conceptos (capas locales de 128 tokens + recuperación de clústeres) |
| Parametros totales | 141.506.176 (≈141,5M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 64k tokens (uso efectivo medido hasta 61k) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo de tipo `perceiver_ar` con una innovación central: la memoria de conceptos. Cada capa local atiende únicamente a los últimos 128 tokens, pero el modelo mantiene agrupaciones de tokens ya procesados ("conceptos" de unos 8 tokens) con un resumen por clúster. En cada paso, el modelo relee palabra por palabra los pocos clústeres más relevantes y consulta los resúmenes del resto, lo que le permite operar sobre ventanas de hasta 64k tokens sin coste cuadrático completo.

El entrenamiento se realizó desde cero sobre 11,5B tokens de datos públicos, con un coste aproximado de 320 dólares y unas 40 horas en un nodo de 4 GPUs. Las fuentes de datos incluyen Nemotron-CC-v2, Nemotron-CC-Math-v1, Nemotron-Pretraining-Specialized-v1, dclm-edu, varios subconjuntos de Common Pile (StackV2 edu filtrado, Project Gutenberg, arXiv, DOAB, USGPO, UK Hansard), dolma3_longmino_pool y smol-smoltalk. No se ha aplicado RLHF ni DPO: es un modelo base sin ajuste por instrucciones. Todo el proceso de entrenamiento está documentado en W&B público.

## Capacidades

- Generación de texto autorregresiva en inglés.
- Predicción y modelado de documentos largos: aprovecha hasta 61k tokens de contexto con mejora sostenida de la perplejidad a medida que crece el contexto.
- Recuperación de información lejana dentro de un documento (needle in a haystack): 1.00 hasta 16k tokens y 0.98 a 32k en ensayos reales (RULER).
- Razonamiento gramatical: 80,56 % en BLiMP (67 conjuntos, 0-shot).
- Conocimiento científico básico: 48,95 % en ARC-Easy, 21,2 % en ARC-Challenge, 29,9 % en HellaSwag.
- Capacidad de continuación sensata de texto (HellaSwag).
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo "thinking" (es un modelo base).
- Multilingüe: únicamente inglés.

## Casos de uso

- **Modelado y scoring de documentos largos**: puntuar la verosimilitud de las últimas páginas de libros, artículos o informes de hasta 64k tokens en una sola pasada sobre una RTX 3090 de 24 GB, útil para filtrado de corpus y control de calidad de datasets.
- **Investigación en mecanismos de memoria y contexto largo**: servir de base reproducible (código y W&B públicos, licencia Apache 2.0) para estudiar compresión de contexto, recuperación de conceptos y arquitecturas eficientes en tokens.
- **Detección de inconsistencias en textos extensos**: al usar el pasado lejano de forma efectiva, puede emplearse para medir si un fragmento es coherente con contenido situado decenas de miles de tokens atrás.
- **Prototipado de asistentes conversacionales de bajo coste**: aunque no está ajustado por instrucciones, puede afinarse (fine-tuning) para tareas conversacionales sencillas en inglés donde el coste de inferencia sea crítico.
- **Evaluación comparativa de modelos pequeños**: como referencia ligera en pipelines de evaluación de modelos de menos de 200M de parámetros, con resultados reproducibles y ficheros de resultados incluidos en el repositorio.
- **Generación de texto en entornos con recursos limitados**: despliegue en una única GPU consumer para tareas de continuación de texto o generación de borradores en inglés.
- **Investigación educativa**: modelo pequeño y barato de entrenar que permite reproducir experimentos de preentrenamiento completos con presupuesto reducido.

## Benchmarks y rendimiento

Resultados declarados por el autor (lm-evaluation-harness 0.4.11, 0-shot, longitud máxima 2.048, ejecutados el 2026-11-17/18 en una RTX 3090). Precisión en %, mayor es mejor.

| Medida | Azar | concept-memory-140m (11,5B tokens) | SmolLM2-135M (252B) | Pythia-160M (300B) | LFM2.5-350M-Base (28T) |
|---|---:|---:|---:|---:|---:|
| Gramática (BLiMP, 67 conjuntos) | 50 | **80,56 ± 0,14** | 79,72 | 77,48 | 80,17 |
| Science quiz (ARC-Easy) | 25 | 48,95 ± 1,03 | 61,62 | 43,64 | **70,03** |
| Hard science quiz (ARC-Challenge) | 25 | 21,2 | 27,1 | 19,5 | **38,2** |
| Continuación sensata (HellaSwag) | 25 | 29,9 | 32,6 | 28,4 | **37,1** |
| Science con pasaje (SciQ) | 25 | no disponible | no disponible | no disponible | no disponible |
| Language modelling (WikiText-2) | — | 1,95 bits por byte (perplejidad, menor es mejor) | no disponible | no disponible | no disponible |

Resultados adicionales declarados por el autor sobre documentos largos:

| Medida | Resultado |
|---|---|
| Predicción de las últimas páginas en 55 documentos de 64k tokens (bits por byte) | 0,795 (SmolLM2-135M: 0,832; Pythia-160M: 0,942; Gemma 3 270M: 0,805; LFM2.5-350M-Base: 0,879; Granite 4.0 350M: 0,776) |
| Ganancia de 1k a 61k tokens (bits por byte) | 0,051 |
| RULER needle in real essays (16k tokens) | 1,00 |
| RULER needle in real essays (32k tokens) | 0,98 |

## Requisitos de hardware

- VRAM estimada para inferencia: un documento completo de 64k tokens se puntúa en una sola pasada en una GPU de 24 GB (RTX 3090), según el autor.
- GPU recomendadas: RTX 3090 (24 GB) para contexto completo; cualquier GPU consumer con al menos 8-16 GB debería bastar para contextos más cortos, aunque no se especifican cifras exactas.
- Cabe en GPU consumer: sí, según el autor, en una RTX 3090 para el caso de 64k tokens.
- Opciones de despliegue: los pesos no cargan con `from_pretrained` de Hugging Face Transformers según la model card; el código está disponible en el repositorio GitHub del proyecto (rama `1fddc505`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El entrenamiento se completó en unas 40 horas en un nodo de 4 GPUs.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tokens de entrenamiento | BLiMP | ARC-Easy | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---:|---|---|
| concept-memory-140m-11.5bt | 141,5M | 64k | 11,5B | 80,56 | 48,95 | Apache 2.0 | Hugging Face (pesos safetensors) |
| SmolLM2-135M | 135M | 8k | 252B (checkpoint) / ≈2T (final) | 79,72 | 61,62 | Apache 2.0 | Hugging Face |
| Pythia-160M | 160M | 2k | 300B | 77,48 | 43,64 | Apache 2.0 | Hugging Face |
| LFM2.5-350M-Base | 350M | no disponible | 28T | 80,17 | 70,03 | no disponible | Hugging Face |

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue instrucciones ni mantiene diálogos de forma fiable sin fine-tuning adicional.
- Solo soporta inglés; no hay capacidades multilingües.
- Riesgo de alucinación inherente a un modelo de 141,5M de parámetros con 11,5B tokens de entrenamiento; su conocimiento factual es limitado (ARC-Easy 48,95 %, HellaSwag 29,9 %).
- Los pesos no cargan con `from_pretrained` de Transformers; requiere el código del repositorio del proyecto, lo que añade fricción para producción.
- Publicado con una sola semilla de entrenamiento: no se ha verificado la estabilidad de los resultados entre ejecuciones.
- Los benchmarks son declarados por el autor (`verified: false` en la model-index) y ejecutados con un único harness; conviene tratarlos con cautela.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo no está pensado para producción sin ajuste y evaluación previos.
- No se documentan sesgos específicos ni evaluaciones de seguridad.
- El contexto efectivo medido llega a 61k tokens, aunque la ventana declarada es de 64k.

## Enlaces

- Hugging Face: https://huggingface.co/Meridian21Lab/concept-memory-140m-11.5bt
- Página del proyecto: https://ai.ksopyla.com/projects/concept-reasoning/
- Código: https://github.com/ksopyla/MrCogito/tree/1fddc505
- Detalles de evaluación: EVALUATION.md (en el repositorio del modelo)
- Entrenamiento en W&B: https://wandb.ai/ksopyla/MrCogito/reports/150M-concept-memory-vs-earlier-100M-runs--VmlldzoxODMxMjMwMw
