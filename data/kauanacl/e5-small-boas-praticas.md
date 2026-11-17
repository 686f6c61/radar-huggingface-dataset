# KauanACL/e5-small-boas-praticas

## Resumen

`e5-small-boas-praticas` es un modelo de embeddings de frases (sentence-transformers) obtenido por fine-tuning de `intfloat/multilingual-e5-small` sobre un corpus muy reducido de buenas prácticas en servicios de alimentación, basado en la RDC 216/2004 y en la cartilla de la Anvisa (Brasil). Lo desarrolla KauanACL como parte del proyecto `rag-boas-praticas`, y su función no es generar respuestas, sino ordenar fragmentos de texto por relevancia semántica frente a una consulta, dentro de un pipeline de recuperación para RAG.

Arquitectura BERT (encoder transformer) con 117.653.760 parámetros, heredada del modelo base multilingüe de E5. El ajuste se realizó con `MultipleNegativesRankingLoss` sobre 172 pares (pregunta, fragmento) generados sintéticamente con ayuda de un LLM a partir de 45 fragmentos de entrenamiento. La ventana de contexto efectiva es la del encoder BERT subyacente (512 tokens), aunque la model card no la explicita.

Su relevancia es acotada y experimental: la mejora medida sobre el modelo base es modesta y, según el propio autor, no estadísticamente significativa (p = 0,30 en el test de McNemar). Es útil como ejemplo de fine-tuning de recuperación en un dominio normativo concreto, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer), base de `intfloat/multilingual-e5-small` |
| Parametros totales | 117.653.760 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el encoder BERT subyacente admite 512 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | pt (portugués); el modelo base es multilingüe, pero el fine-tuning solo se validó en portugués |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer tipo BERT de 117,6 millones de parámetros, inicializado desde `intfloat/multilingual-e5-small` y reentrenado como modelo de similitud de frases. La tarea es de recuperación densa: dado un par (consulta, fragmento), produce embeddings normalizados que se comparan por producto escalar. Se mantiene la convención de prefijos del modelo E5 original: `query: ` para preguntas y `passage: ` para fragmentos.

El entrenamiento usó `MultipleNegativesRankingLoss` con negativos dentro del lote y sampler `NO_DUPLICATES`, 3 épocas, batch 16, learning rate 2e-5, warmup del 10 % y semilla 42. El conjunto de datos consta de 172 pares (pregunta, fragmento) sobre 45 fragmentos de entrenamiento extraídos de la cartilla de la Anvisa y de la RDC 216/2004. Las preguntas son sintéticas, redactadas con ayuda de Claude a partir del texto de cada fragmento. Los 21 fragmentos de evaluación se separaron antes de generar ninguna pregunta, de modo que no aparecen en el entrenamiento. El entrenamiento completo se ejecutó en unos 2 minutos sobre un Apple M3 con backend MPS. No se aplicaron técnicas de RLHF ni DPO, ni innovaciones de decodificación (el modelo no genera texto).

## Capacidades

- Generación de embeddings de frases para búsqueda semántica y recuperación densa (retrieval).
- Ordenación de fragmentos por relevancia frente a una consulta mediante similitud coseno sobre embeddings normalizados.
- Uso con prefijos E5 (`query: ` y `passage: `) para separar consultas de documentos.
- Integración con `sentence-transformers` y con Text Embeddings Inference (tag `text-embeddings-inference`).
- Compatibilidad con endpoints de inferencia (tag `endpoints_compatible`).
- Dominio especializado en buenas prácticas de manipulación de alimentos (RDC 216/2004 y cartilla de la Anvisa).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio: es exclusivamente un modelo de embeddings.
- Capacidad multilingüe heredada del modelo base no validada tras el fine-tuning; solo se documenta portugués.

## Casos de uso

- Recuperación de fragmentos normativos en un RAG sobre seguridad alimentaria: el modelo indexa los fragmentos de la RDC 216/2004 y de la cartilla de la Anvisa, y ante una consulta del usuario devuelve los fragmentos más relevantes para que un LLM genere la respuesta con ese contexto.
- Asistente de consulta interna para manipuladores de alimentos: un chatbot que responde dudas sobre temperaturas de conservación, plazos o higiene, usando este modelo como recuperador sobre el corpus normativo y un generador separado para redactar.
- Búsqueda semántica en documentación de cumplimiento sanitario: localizar el pasaje exacto de la norma que aplica a una situación concreta (por ejemplo, conservación en caliente) sin depender de coincidencia léxica.
- Evaluación comparativa de pipelines de recuperación en dominios normativos: sirve como punto de partida para medir recall@k y MRR frente al modelo base multilingüe en un corpus pequeño y controlado.
- Prototipado rápido de RAG en un dominio vertical: al ser un modelo pequeño (117,6 M de parámetros, repo de 0,5 GB), se puede desplegar en hardware modesto para validar la arquitectura de recuperación antes de escalar a un modelo mayor.
- Filtrado y deduplicación de fragmentos normativos: usar los embeddings para agrupar pasajes con contenido equivalente o detectar duplicados en un corpus de normativa alimentaria.
- Demo pública de referencia: el Space `KauanACL/rag-boas-praticas` ilustra el uso del modelo dentro de un pipeline RAG completo, útil como plantilla para proyectos similares.

## Benchmarks y rendimiento

Evaluación sobre 84 preguntas y 21 fragmentos de evaluación, con búsqueda sobre los 66 fragmentos del corpus completo. Solo cuenta como acierto el fragmento exacto anotado.

| Modelo | recall@1 | recall@5 | MRR@10 |
|---|---|---|---|
| `multilingual-e5-small` (base) | 0,571 | 0,881 | 0,699 |
| `e5-small-boas-praticas` (este modelo) | 0,631 | 0,905 | 0,744 |

En recall@1, 10 preguntas pasaron a acertar y 5 pasaron a fallar respecto al modelo base. El test exacto de McNemar arroja p = 0,30, por lo que el autor concluye que la mejora no es estadísticamente significativa con este tamaño de evaluación. No se midió la varianza entre semillas (un único entrenamiento). No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, MTEB) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5 GB en FP32 (117,6 M de parámetros × 4 bytes), aproximadamente 0,25 GB en FP16. Cifras estimadas a partir del número de parámetros; no publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el modelo no requiere aceleradores de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: `sentence-transformers`, Text Embeddings Inference (TGI para embeddings), y cualquier runtime compatible con safetensors y arquitectura BERT. No se documentan variantes GGUF para llama.cpp ni Ollama.
- Latencia y throughput: no disponibles de forma oficial. El autor reporta un entrenamiento completo de unos 2 minutos en un Apple M3 (MPS), lo que da una idea del coste computacional reducido, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la eval del autor (recall@1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `e5-small-boas-praticas` | 117,6 M | no disponible | 0,631 | MIT | Hugging Face |
| `intfloat/multilingual-e5-small` (base) | 117,6 M | 512 tokens (BERT) | 0,571 | MIT | Hugging Face |
| `intfloat/multilingual-e5-base` | no disponible en la información | no disponible | no evaluado en la información | MIT | Hugging Face |
| Otros modelos de embeddings especializados en portugués | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación con datos es frente al modelo base, del que deriva. Para alternativas de mayor tamaño o de otros autores no se dispone de resultados en la información proporcionada.

## Limitaciones y advertencias

- Dominio muy estrecho: 2 documentos y 66 fragmentos. No cabe esperar ganancia fuera de buenas prácticas en alimentación, y el autor no midió la posible pérdida de calidad en otros dominios tras el fine-tuning.
- Las preguntas de entrenamiento son sintéticas y reutilizan el vocabulario de los fragmentos; las consultas reales de usuarios pueden ser más difíciles y degradar el recall.
- Los documentos fuente son de 2004/2005 y no incluyen actualizaciones posteriores de la norma; el modelo puede recuperar fragmentos desactualizados.
- La mejora sobre el modelo base no es estadísticamente significativa (p = 0,30) y no se midió la varianza entre semillas.
- El modelo no genera respuestas: solo ordena fragmentos. Cualquier decisión sanitaria debe basarse en la norma vigente y en la autoridad de vigilancia local.
- Riesgo de alucinación: no aplica directamente al no generar texto, pero un pipeline RAG que lo use puede producir respuestas incorrectas si el recuperador devuelve fragmentos poco relevantes.
- Idiomas: solo se documenta y valida portugués; el comportamiento multilingüe del modelo base no se ha verificado tras el ajuste.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones de los documentos fuente (normativa y cartilla de la Anvisa) si se redistribuyen sus contenidos.
- Sin descargas ni likes en el momento de la consulta (0 y 0), y creado en noviembre de 2026: no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KauanACL/e5-small-boas-praticas
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Repositorio del proyecto: https://github.com/KauanACL/rag-boas-praticas
- Demo (Space): https://huggingface.co/spaces/KauanACL/rag-boas-praticas
- Dataset de entrenamiento: https://huggingface.co/datasets/KauanACL/boas-praticas-anvisa-qa
- Cartilla de buenas prácticas de la Anvisa: https://www.gov.br/anvisa/pt-br/centraisdeconteudo/publicacoes/alimentos/manuais-guias-e-orientacoes/cartilha-boas-praticas-para-servicos-de-alimentacao.pdf
- RDC 216/2004: https://bvsms.saude.gov.br/bvs/saudelegis/anvisa/2004/res0216_15_09_2004.html
