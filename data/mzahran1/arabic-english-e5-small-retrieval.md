# mzahran1/arabic-english-e5-small-retrieval

## Resumen

`mzahran1/arabic-english-e5-small-retrieval` es un modelo de embeddings de frases (sentence-transformers) derivado de `intfloat/multilingual-e5-small` mediante fine-tuning supervisado para recuperación de información bilingüe árabe-inglés. Lo desarrolla mzahran1 y resuelve un problema concreto y habitualmente mal cubierto por los embedders multilingües genéricos: la recuperación cruzada entre idiomas, es decir, que una consulta en árabe recupere correctamente un pasaje en inglés (y viceversa).

El modelo mantiene el tamaño compacto del base: 117.653.760 parámetros en una arquitectura BERT (encoder transformer) con pesos en safetensors y un repositorio de 0,5 GB. La longitud de contexto efectiva es de 256 tokens, que es el máximo visto durante el entrenamiento. Se distribuye con licencia MIT y soporta únicamente árabe e inglés de forma declarada.

Su relevancia actual radica en que iguala o supera en promedio macro a `bge-m3` (568M parámetros) con una quinta parte del tamaño, y mejora de forma notable la dirección inglés→árabe (+18,7 puntos de MRR@10 frente al base). Está pensado para pipelines RAG y búsqueda semántica en corpus mixtos árabe-inglés, y cuenta con un reranker complementario del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer), fine-tune de `intfloat/multilingual-e5-small` |
| Parametros totales | 117.653.760 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (máximo visto en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/bf16; compatible con cuantización estándar de sentence-transformers/ONNX, no documentada por el autor) |
| Idiomas soportados | árabe (ar), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería sentence-transformers) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer tipo BERT de 118M parámetros, heredado de `multilingual-e5-small`. La salida es un vector de embedding por texto, con pooling y normalización propios de sentence-transformers, y requiere los prefijos `query: ` y `passage: ` de la familia E5 para funcionar correctamente.

El entrenamiento se realizó con 20.918 consultas en total: 16.419 consultas monolingües (TyDi-QA en árabe e inglés, ARCD y SQuAD) más consultas cruzadas generadas por traducción automática con LLM (ar→en y en→ar). Se usó un negativo duro por consulta, minado con el modelo base a partir de los rangos 1-30 y filtrado con un margen de coseno de 0,02 para evitar falsos negativos (una auditoría con LLM detectó que el 8,8% de los tres mejores negativos minados contenían en realidad la respuesta). La receta: `MultipleNegativesRankingLoss`, batch 64 con sampler sin duplicados, learning rate 3e-5, warm-up del 10% con decaimiento lineal, escala 20, una época, máximo 256 tokens, bf16 y una única NVIDIA GB10. XQuAD se reservó exclusivamente para test.

## Capacidades

- Generación de embeddings de frases para similitud semántica y recuperación (pipeline `sentence-similarity`).
- Recuperación monolingüe en árabe (ar→ar) y en inglés (en→en).
- Recuperación cruzada árabe→inglés y inglés→árabe, el caso de uso central del fine-tune.
- Integración en pipelines RAG y búsqueda semántica sobre corpus mixtos.
- Compatibilidad con Text Embeddings Inference (tag `text-embeddings-inference`) y endpoints compatibles.
- No soporta tool calling, agentes, visión, audio ni modo thinking: es exclusivamente un encoder de recuperación.

## Casos de uso

- Búsqueda semántica en bases de conocimiento bilingües: indexar documentos en inglés y permitir consultas en árabe (o al revés) usando los prefijos `query:` y `passage:`; el modelo está entrenado específicamente para este salto de idioma.
- RAG sobre documentación corporativa mixta: recuperar pasajes candidatos con este embedder y refinar el ranking con el reranker complementario `mzahran1/arabic-english-reranker-mminilm`, que eleva el MRR@10 macro de 75,7 a 83,3.
- Atención al cliente en mercados del Golfo: un chatbot que recibe preguntas en árabe y recupera respuestas de una base de FAQ en inglés sin traducción intermedia.
- Búsqueda interna en organizaciones con documentación en ambos idiomas: sustituir búsqueda por palabras clave por recuperación densa con un modelo de 118M que cabe en infraestructura modesta.
- Deduplicación y clustering de contenido bilingüe: calcular similitudes entre artículos árabes e ingleses para detectar duplicados o agrupar temas.
- Filtrado de candidatos en pipelines de evaluación o anotación: pre-seleccionar pasajes relevantes antes de un reranker o de un LLM generador, reduciendo coste de contexto.

## Benchmarks y rendimiento

Resultados del autor: MRR@10 × 100 sobre un benchmark bilingüe construido con TyDi-QA, ARCD y XQuAD (6.823 consultas de test, artículos disjuntos entre train/dev/test, auditoría de fuga de datos). Media ± desviación típica sobre 3 semillas de entrenamiento; el checkpoint publicado es la semilla 13 (macro 75,7).

| Modelo | Params | ar→ar | en→en | ar→en | en→ar | macro |
|---|---:|---:|---:|---:|---:|---:|
| multilingual-e5-small (base) | 118M | 76,8 | 87,8 | 41,4 | 61,7 | 66,9 |
| bge-m3 | 568M | 80,2 | 87,8 | 63,3 | 67,8 | 74,8 |
| **este modelo** | 118M | 80,3 ± 0,2 | 87,3 ± 0,2 | 54,7 ± 0,6 | 80,4 ± 0,4 | **75,7 ± 0,1** |
| este modelo + reranker (top-50) | 118M + 118M | 86,7 | 90,6 | 72,3 | 83,7 | 83,3 |

Lectura: supera a `bge-m3` en media macro con una quinta parte de parámetros y gana +18,7 en en→ar frente al base, pero `bge-m3` sigue siendo mejor en ar→en (63,3 frente a 54,7); el reranker cierra esa brecha.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 0,5 GB de pesos más overhead de activaciones; en fp16/bf16, en torno a 0,25 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para lotes pequeños (RTX 3060, RTX 4090, T4, L4). Para alto throughput, A100 o H100 con lotes grandes.
- Cabe en GPU consumer: sí, en todas las GPU modernas con 4 GB o más; también puede ejecutarse en CPU para volúmenes moderados.
- Opciones de despliegue: sentence-transformers (Python), Text Embeddings Inference (TGI, etiqueta `text-embeddings-inference`), exportación a ONNX para inferencia en CPU, y endpoints compatibles.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Macro MRR@10 | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| este modelo | 118M | 256 tokens | 75,7 | MIT | HuggingFace |
| multilingual-e5-small (base) | 118M | 512 tokens (típico E5) | 66,9 | MIT | HuggingFace |
| bge-m3 | 568M | 8192 tokens (según modelo) | 74,8 | MIT | HuggingFace |

Frente al base, la mejora es de +8,8 puntos macro y +18,7 en en→ar, con un ligero retroceso en en→en (87,8 → 87,3). Frente a `bge-m3`, gana en macro y en en→ar, pero pierde en ar→en y ofrece una ventana de contexto mucho menor (256 frente a los 8K de bge-m3), lo que limita su uso con documentos largos sin troceado.

## Limitaciones y advertencias

- Evaluado solo en QA factoid de estilo Wikipedia con un pasaje dorado por consulta; el rendimiento en documentos empresariales no está medido.
- Las consultas cruzadas de entrenamiento son traducciones automáticas, más limpias que el code-mixing real de árabe e inglés.
- El contexto está limitado a 256 tokens; textos más largos requieren troceado y pueden perder calidad.
- La recuperación ar→en (54,7) queda por debajo de `bge-m3` (63,3); para esa dirección conviene usar el reranker complementario.
- Ligero empeoramiento en inglés monolingüe respecto al base (87,8 → 87,3).
- Riesgo de alucinación no aplica directamente (es un encoder, no genera texto), pero sí hay riesgo de recuperar pasajes irrelevantes si la consulta se sale de la distribución de entrenamiento.
- Sesgos: no documentados por el autor; al derivar de un modelo multilingüe entrenado con datos web, puede heredar sesgos de esos corpus.
- Licencia MIT permite uso comercial; los datos de entrenamiento conservan sus propias licencias (TyDi-QA Apache-2.0, ARCD MIT, SQuAD CC BY-SA 4.0), a tener en cuenta si se redistribuyen derivados.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: poca validación externa independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mzahran1/arabic-english-e5-small-retrieval
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Reranker complementario: https://huggingface.co/mzahran1/arabic-english-reranker-mminilm
- Código, benchmark y resultados completos: https://github.com/mahmoudzahran01/arabic-english-retrieval-eval
