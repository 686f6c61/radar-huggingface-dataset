# microsoft/deberta-v3-base

## Resumen

DeBERTa-v3-base es un modelo de lenguaje de tipo encoder (solo codificador) desarrollado por Microsoft Research, publicado originalmente a finales de 2021 y alojado en HuggingFace desde marzo de 2022. No es un modelo generativo: su tarea principal es la comprension del lenguaje natural (NLU), y en el Hub aparece etiquetado con el pipeline `fill-mask` (Masked Language Modeling). Es la tercera iteracion de la familia DeBERTa, que mejoro BERT y RoBERTa mediante atencion desacoplada (*disentangled attention*) y un decodificador de mascara mejorado; la version V3 anade un preentrenamiento al estilo ELECTRA con comparticion de embeddings desacoplada por gradiente.

El modelo tiene 12 capas y un tamano oculto de 768. El backbone contiene 86 millones de parametros, a los que se suman aproximadamente 98 millones adicionales de la capa de embeddings, debido a un vocabulario de 128.000 tokens. El total ronda por tanto los 184 millones de parametros, un orden de magnitud muy inferior al de los LLM generativos actuales, lo que lo hace extremadamente ligero para inferencia. Fue entrenado con 160 GB de datos de texto en ingles.

Su relevancia actual reside en que sigue siendo un estandar para tareas de clasificacion, extraction de respuestas (QA extractivo), NER y similitud semantica, donde un encoder afinado supera en coste/rendimiento a modelos generativos mucho mayores. Con licencia MIT y casi 3 millones de descargas acumuladas, es una pieza habitual en pipelines de produccion que necesitan baja latencia y bajo coste computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3), con atencion desacoplada y decodificador de mascara mejorado |
| Parametros totales | ~184 M (86 M de backbone + ~98 M en la capa de embeddings) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (maximo estandar de la familia; el ejemplo de fine-tuning de la model card usa 256) |
| Tipos de cuantizacion | no disponible (modelo encoder; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | en (solo ingles) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), TensorFlow, Rust (segun tags del Hub) |

## Arquitectura y entrenamiento

DeBERTa-v3-base es un transformer de tipo encoder con 12 capas y dimension oculta de 768. Hereda de DeBERTa las dos innovaciones clave: la **atencion desacoplada** (*disentangled attention*), que representa el contenido y la posicion de cada token en vectores separados y calcula la atencion sobre ambos de forma independiente, y un **decodificador de mascara mejorado** que incorpora informacion de contexto absoluto cuando predice tokens enmascarados. La novedad de la version V3 es el uso de un **preentrenamiento al estilo ELECTRA** combinado con una **comparticion de embeddings desacoplada por gradiente** (*Gradient-Disentangled Embedding Sharing*), que evita el conflicto entre el objetivo generativo del generador de tokens y la tarea discriminativa del modelo, mejorando la eficiencia del entrenamiento y el rendimiento en tareas posteriores.

El modelo se entreno con los mismos 160 GB de datos que DeBERTa V2. La capa de embeddings incorpora un vocabulario de 128.000 tokens (frente a los 50.000 de DeBERTa V1), lo que anade aproximadamente 98 millones de parametros y explica que el total supere los 184 millones pese a que el backbone tenga solo 86 millones. La model card no detalla la composicion exacta del dataset, la presencia de RLHF o DPO (tecnicas no aplicables a un encoder) ni otros detalles del pipeline de datos.

## Capacidades

- **Comprension del lenguaje natural (NLU)**: clasificacion de texto, analisis de sentimiento, deteccion de entailment (NLI) y clasificacion de temas.
- **Question answering extractivo**: extraccion de respuestas dentro de un contexto (SQuAD 1.1 y 2.0), no generacion libre de respuestas.
- **Masked Language Modeling (fill-mask)**: predice tokens enmascarados, util para tareas de representacion y como base para afinado.
- **Reconocimiento de entidades nombradas (NER)** y etiquetado de secuencias tras el afinado correspondiente.
- **Similitud semantica y recuperacion**: produce embeddings contextuales utilizables en ranking, busqueda semantica o clustering.
- **Sin soporte de tool calling ni function calling**: es un encoder, no un modelo de chat ni de agentes.
- **Sin razonamiento multi-paso ni modo thinking**: no genera texto libre ni cadenas de pensamiento.
- **Sin capacidades de vision ni audio**: solo texto.
- **Monolingue**: unicamente ingles.

## Casos de uso

- **Atencion al cliente automatizada (clasificacion de tickets)**: el modelo puede afinarse para clasificar y priorizar tickets por categoria o urgencia con una ventana de 512 tokens, suficiente para asuntos y primeras lineas de correo, con latencia muy baja en CPU o GPU de gama baja.
- **Question answering sobre documentacion tecnica**: afinado sobre SQuAD o datasets propios, extrae respuestas exactas a partir de pasajes de contexto, adecuado para bases de conocimiento internas donde se requiere respuesta verificable y no generativa.
- **Analisis de sentimiento y moderacion de contenido**: clasifica opiniones o comentarios en categorias predefinidas; su tamano compacto permite procesar grandes volumenes de texto en lotes.
- **Extraccion de entidades en documentos**: reconocimiento de personas, organizaciones, fechas o importes en contratos, facturas o articulos, integrable en pipelines de ETL.
- **Ranking y busqueda semantica**: genera embeddings para reordenar resultados de un motor de busqueda y mejorar la relevancia, combinable con indices vectoriales.
- **Deteccion de duplicados y similitud de documentos**: compara embeddings de pares de textos para identificar plagio o duplicados casi exactos.
- **Preanotacion en proyectos de etiquetado**: sirve como modelo base afinado para asistir a anotadores humanos, reduciendo el coste de etiquetado manual.
- **Base para fine-tuning especifico de dominio**: punto de partida para adaptar el modelo a dominios como legal, medico o financiero en ingles, con requisitos de hardware modestos.

## Benchmarks y rendimiento

Resultados de desarrollo publicados en la model card sobre SQuAD 2.0 y MNLI:

| Modelo | Vocab (K) | Backbone #Params (M) | SQuAD 2.0 (F1/EM) | MNLI-m/mm (ACC) |
|---|---|---|---|---|
| RoBERTa-base | 50 | 86 | 83.7/80.5 | 87.6/- |
| XLNet-base | 32 | 92 | -/80.2 | 86.8/- |
| ELECTRA-base | 30 | 86 | -/80.5 | 88.8/- |
| DeBERTa-base | 50 | 100 | 86.2/83.1 | 88.8/88.5 |
| DeBERTa-v3-base | 128 | 86 | **88.4/85.4** | **90.6/90.7** |
| DeBERTa-v3-base + SiFT | 128 | 86 | -/- | 91.0/- |

No se han publicado en la informacion disponible resultados para otros benchmarks (MMLU, HumanEval, GSM8K, etc.), que ademas no son aplicables a un modelo encoder de este tipo.

## Requisitos de hardware

- **VRAM para inferencia en FP32**: aproximadamente 0,75-1 GB para los pesos (184 M parametros x 4 bytes), mas overhead de activaciones segun el tamano de lote.
- **VRAM en FP16/BF16**: aproximadamente 0,4 GB de pesos; cabe holgadamente en cualquier GPU moderna.
- **GPU recomendadas**: no requiere GPU dedicada. Funciona correctamente en CPU para inferencia por lotes; en GPU basta una T4, RTX 3060, RTX 4090 o cualquier acelerador de gama media. Para fine-tuning, una GPU con 8-16 GB de VRAM es suficiente.
- **Consumer GPU**: si, cabe en practicamente cualquier GPU de consumo, e incluso en CPU con un throughput razonable para lotes pequenos.
- **Opciones de despliegue**: HuggingFace Transformers (PyTorch y TensorFlow), ONNX Runtime, TorchScript, y despliegue gestionado en Azure (segun el tag `deploy:azure` del Hub). No esta orientado a vLLM, llama.cpp u Ollama, que estan pensados para modelos generativos.
- **Latencia y throughput**: no se publican cifras oficiales. Para referencia cualitativa, al ser un encoder de 184 M de parametros, la inferencia es del orden de milisegundos por lote en GPU y de decenas de milisegundos en CPU por secuencia corta. No hay datos concretos en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros backbone | Contexto | Rendimiento (SQuAD 2.0 F1 / MNLI) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeBERTa-v3-base | 86 M (+98 M embeddings) | 512 | 88.4 / 90.6 | MIT | HuggingFace, Azure |
| RoBERTa-base | 86 M | 512 | 83.7 / 87.6 | MIT | HuggingFace |
| ELECTRA-base | 86 M | 512 | -/80.5 (EM) / 88.8 | Apache 2.0 | HuggingFace |
| DeBERTa-base | 100 M | 512 | 86.2 / 88.8 | MIT | HuggingFace |

DeBERTa-v3-base obtiene el mejor rendimiento de la comparativa en las tareas reportadas, a pesar de tener un backbone mas pequeno que DeBERTa-base (86 M frente a 100 M), gracias al preentrenamiento estilo ELECTRA. El coste es un vocabulario mucho mayor (128 K tokens), lo que aumenta el numero total de parametros por la capa de embeddings.

## Limitaciones y advertencias

- **Solo ingles**: no soporta otros idiomas, lo que lo descarta para aplicaciones multilingues sin traduccion previa.
- **No es un modelo generativo**: no puede producir texto libre, mantener conversaciones ni ejecutar razonamiento multi-paso. No dispone de tool calling ni de agentes.
- **Riesgo de alucinacion**: aunque no genera texto libre, en tareas extractivas puede seleccionar pasajes incorrectos del contexto cuando la pregunta es ambigua o el contexto no contiene la respuesta (especialmente relevante en SQuAD 2.0, donde debe decidir si la respuesta existe).
- **Contexto limitado a 512 tokens**: los documentos largos deben fragmentarse en pasajes, con el consiguiente riesgo de perdida de contexto entre fragmentos.
- **Sesgos**: al entrenarse con 160 GB de texto en ingles, puede heredar sesgos de genero, raza o religion presentes en los corpus originales; no hay analisis de sesgo publicado en la informacion disponible.
- **Sensibilidad a la precision**: se recomienda evitar entrenamiento en FP16 en arquitecturas con atencion desacoplada; es habitual usar FP32 o BF16 para el fine-tuning. No se documentan cuantizaciones oficiales.
- **Licencia permisiva**: la licencia MIT permite uso comercial, modificacion y redistribucion sin restricciones relevantes mas alla de mantener el aviso de copyright.
- **Produccion**: el modelo entrega representaciones de calidad pero requiere fine-tuning especifico por tarea; no debe usarse directamente en *zero-shot* para clasificacion sin ajuste. Conviene validar el rendimiento en el dominio objetivo antes de desplegarlo.

## Enlaces

- HuggingFace: https://huggingface.co/microsoft/deberta-v3-base
- Repositorio oficial: https://github.com/microsoft/DeBERTa
- Paper DeBERTaV3: https://arxiv.org/abs/2111.09543
- Paper DeBERTa (v1): https://arxiv.org/abs/2006.03654
- OpenReview DeBERTa (ICLR 2021): https://openreview.net/forum?id=XPZIaotutsD
