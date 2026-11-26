# evalstate/ettin-encoder-32m-colbert-nq-bce

## Resumen
`evalstate/ettin-encoder-32m-colbert-nq-bce` es un modelo de recuperacion de informacion (retrieval) de tipo multi-vector con interaccion tardia (late interaction) al estilo ColBERT, construido sobre el encoder `jhu-clsp/ettin-encoder-32m` de la familia ModernBERT. Lo desarrolla el usuario evalstate y esta publicado en Hugging Face bajo licencia MIT. El modelo no genera texto: produce embeddings multi-vector por token que se comparan mediante la operacion MaxSim para puntuar pares consulta-documento.

Con solo 31.883.136 parametros (unos 32 M) y un repositorio de 0,1 GB, es un modelo extremadamente ligero pensado para experimentacion, prototipado rapido y despliegues con recursos minimos. Se ha afinado con `MultiVectorSigmoidBCELoss` sobre un conjunto de 3.000 ejemplos derivados de Natural Questions con negativos duros, segun las etiquetas de la model card.

Su relevancia es acotada y debe interpretarse con cautela: los resultados declarados por el autor en la model card son muy bajos (Accuracy@1 de 0,02 en NanoMSMARCO y 0,0 en NanoNQ), lo que sugiere que se trata de un artefacto de entrenamiento experimental mas que de un modelo listo para produccion. Resulta util como referencia para estudiar el pipeline ColBERT con encoders pequenos y para tareas de investigacion sobre eficiencia en retrieval.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, familia Ettin) con cabeza multi-vector ColBERT (late interaction) |
| Parametros totales | 31.883.136 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con text-embeddings-inference) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de `jhu-clsp/ettin-encoder-32m`, un encoder de la familia ModernBERT con atencion bidireccional y disenado para secuencias largas, y le anade el esquema de retrieval multi-vector de ColBERT: cada token de la consulta y del documento recibe un embedding, y la puntuacion se calcula con MaxSim (suma sobre tokens de consulta del maximo producto escalar contra los tokens del documento). Esto lo diferencia de los bi-encoders clasicos, que colapsan cada texto en un unico vector.

El ajuste fino se realizo con la perdida `MultiVectorSigmoidBCELoss` (etiqueta `loss:MultiVectorSigmoidBCELoss` en los tags) sobre un dataset de 3.000 ejemplos (`dataset_size:3000`), descrito en el nombre del modelo como Natural Questions con negativos duros. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases adicionales de RLHF o DPO (no aplicables en un modelo de retrieval). El modelo se genero con `SentenceTransformerTrainer` (`generated_from_trainer`) y esta etiquetado como compatible con `text-embeddings-inference`.

## Capacidades
- Extraccion de embeddings multi-vector para retrieval y ranking (pipeline `feature-extraction`).
- Puntuacion de relevancia consulta-documento mediante MaxSim con interaccion tardia.
- Busqueda semantica sobre corpus en ingles.
- Re-ranking de candidatos recuperados por un sistema de primera fase.
- Integracion con `sentence-transformers` y con `text-embeddings-inference`.
- Capacidad multilingue: limitada al ingles (`language: en`).
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso: es exclusivamente un encoder de retrieval.

## Casos de uso
- Prototipado de pipelines ColBERT: permite montar y depurar un flujo de indexacion y busqueda multi-vector con un modelo de 32 M de parametros antes de escalar a encoders mayores, reduciendo el coste de iteracion.
- Experimentacion academica sobre eficiencia en retrieval: su tamano minimo facilita estudiar el compromiso entre numero de parametros y calidad de ranking en entornos con GPU modesta.
- Pruebas de integracion con text-embeddings-inference: al estar etiquetado como `endpoints_compatible`, sirve para validar despliegues de TEI con modelos ColBERT sin consumir recursos significativos.
- Generacion de datasets sinteticos de entrenamiento: puede usarse como recuperador de negativos duros o como baseline debil para comparar contra modelos mas grandes en la construccion de conjuntos de entrenamiento.
- Docencia y formacion: su tamano (0,1 GB) y su licencia MIT permiten distribuirlo en materiales didacticos y ejecutarlo en portatiles para explicar la interaccion tardia.
- Baseline de referencia en evaluaciones internas: util para medir la mejora marginal que aportan encoders mas grandes en un corpus concreto antes de invertir en infraestructura.

## Benchmarks y rendimiento
Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Metrica | NanoMSMARCO | NanoNQ |
|---|---|---|
| MaxSim Accuracy@1 | 0,02 | 0,0 |
| MaxSim Accuracy@3 | 0,02 | 0,0 |
| MaxSim Accuracy@5 | 0,02 | 0,0 |
| MaxSim Accuracy@10 | 0,02 | 0,0 |
| MaxSim Precision@1 | 0,02 | 0,0 |
| MaxSim Precision@3 | 0,0067 | 0,0 |
| MaxSim Precision@5 | 0,004 | 0,0 |
| MaxSim Precision@10 | 0,002 | 0,0 |
| MaxSim Recall@1 | 0,02 | 0,0 |
| MaxSim Recall@3 | 0,02 | 0,0 |
| MaxSim Recall@5 | 0,02 | 0,0 |
| MaxSim Recall@10 | 0,02 | 0,0 |
| MaxSim NDCG@10 | 0,02 | 0,0 |
| MaxSim MRR@10 | 0,02 | 0,0 |
| MaxSim MAP@100 | 0,0236 | 0,0017 |

No se han publicado en la informacion disponible otros resultados (MMLU, HumanEval, GSM8K u otros), que ademas no aplican a un modelo de retrieval.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB en fp32 (32 M de parametros, unos 128 MB de pesos); en fp16 o bf16, alrededor de 64 MB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; tambien funciona en CPU.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3060, RTX 4090, e incluso en iGPU y en Raspberry Pi para pruebas.
- Opciones de despliegue: `sentence-transformers`, `text-embeddings-inference` (etiquetado `endpoints_compatible`), y exportacion a ONNX si se necesita. No se documenta soporte nativo de llama.cpp u Ollama, orientados a modelos generativos.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera un coste por documento muy bajo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| evalstate/ettin-encoder-32m-colbert-nq-bce | 31,9 M | no disponible | ColBERT multi-vector | MIT | Accuracy@1 0,02 (NanoMSMARCO) |
| jhu-clsp/ettin-encoder-32m (base) | ~32 M | no disponible | Encoder denso | no disponible en esta ficha | no disponible |
| ColBERTv2 (referencia) | ~110 M | 512 tokens (tipico) | ColBERT multi-vector | BSD-2 / MIT segun variante | no disponible en esta ficha |
| Modelos bi-encoder tipo MiniLM | ~22-33 M | 256-512 tokens | Bi-encoder denso | Apache 2.0 (segun variante) | no disponible en esta ficha |

La comparativa con ColBERTv2 y MiniLM se ofrece solo como referencia de categoria; no se dispone de sus cifras en la informacion proporcionada para una comparacion numerica directa.

## Limitaciones y advertencias
- Rendimiento muy bajo segun los propios datos del autor: Accuracy@1 de 0,02 en NanoMSMARCO y 0,0 en NanoNQ. No es apto para produccion sin un reentrenamiento sustancial.
- Entrenado con solo 3.000 ejemplos, lo que limita severamente la generalizacion.
- Solo soporta ingles; no se ha validado en otros idiomas.
- No se documenta la longitud maxima de secuencia, lo que impide planificar el troceado de documentos largos con garantias.
- Riesgo de sesgos: al derivarse de Natural Questions, puede heredar los sesgos de distribucion de ese corpus (predominio de entidades y temas populares en ingles).
- Al ser un encoder de retrieval, no genera texto y no puede alucinar contenido, pero si producir rankings erroneos o recuperar pasajes irrelevantes con alta puntuacion.
- Licencia MIT: permite uso comercial y modificacion con atribucion; conviene conservar el aviso de copyright.
- Los resultados de la model card estan marcados como no verificados; no deben citarse como evidencia de calidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/evalstate/ettin-encoder-32m-colbert-nq-bce
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-32m
- Paper de ColBERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Documentacion de sentence-transformers: https://www.sbert.net/
- Documentacion de text-embeddings-inference: https://huggingface.co/docs/text-embeddings-inference
