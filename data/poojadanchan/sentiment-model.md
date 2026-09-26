# PoojaDAnchan/sentiment-model

## Resumen

`sentiment-model` es un modelo de clasificacion de texto publicado por el usuario PoojaDAnchan en Hugging Face. Se trata de un ajuste fino (fine-tuning) de `distilbert-base-uncased`, la version destilada de BERT-base propuesta por Hugging Face, orientado a la tarea de analisis de sentimiento. El modelo es un encoder transformer denso de 66.955.779 parametros, con licencia Apache-2.0 y pesos en formato safetensors, lo que lo situa en la categoria de clasificadores ligeros aptos para inferencia en CPU o en cualquier GPU de consumo.

El problema que resuelve es acotado: asignar una etiqueta de sentimiento a un texto corto. Sin embargo, la propia model card es practicamente un esqueleto autogenerado por la libreria `Trainer`: no documenta el dataset de entrenamiento, ni el numero de clases, ni los usos previstos, ni los idiomas soportados. Los unicos datos objetivos publicados son las metricas de evaluacion (accuracy 0,6598 y F1 ponderado y macro 0,6493) y una tabla de evolucion del entrenamiento a lo largo de tres epocas.

Su relevancia actual es limitada y conviene ser explicito al respecto: el repositorio acumula 0 descargas y 0 "likes", no se ha publicado ningun resultado en el campo `model-index` (la lista de resultados esta vacia) y la precision declarada queda lejos de la que ofrecen clasificadores de sentimiento establecidos sobre el mismo tipo de arquitectura. Es, por tanto, un artefacto de experimentacion o de aprendizaje, no un modelo listo para produccion sin una validacion previa exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base-uncased); 6 capas, atencion completa |
| Parametros totales | 66.955.779 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (limite de posiciones de `distilbert-base-uncased`; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (no se han publicado versiones cuantizadas en el repositorio) |
| Idiomas soportados | no disponible en la model card; el tokenizador del modelo base es WordPiece *uncased* de vocabulario 30.522, entrenado predominantemente en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tarea (pipeline) | text-classification |
| Modelo base | distilbert/distilbert-base-uncased |
| Tamano del repositorio | 0,3 GB |
| Dataset de entrenamiento | no disponible (la model card indica "unknown dataset") |
| Numero de etiquetas | no disponible |
| Fecha de creacion | 2026-09-26 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT: un encoder transformer de 6 capas y 66 millones de parametros obtenido mediante destilacion del conocimiento de BERT-base-uncased (12 capas, 110 millones de parametros). DistilBERT conserva la atencion completa y una ventana de 512 posiciones, pero reduce el coste de inferencia aproximadamente a la mitad manteniendo, segun sus autores, en torno al 97 % del rendimiento de BERT en comprension lectora (GLUE). Sobre esa base, este repositorio aplica un ajuste fino supervisado para clasificacion de secuencias con una cabeza de clasificacion sobre el token `[CLS]`.

El procedimiento de entrenamiento esta documentado de forma parcial en la model card: 3 epocas, *learning rate* 2e-05 con planificador lineal, optimizador `ADAMW_TORCH_FUSED` (betas 0,9/0,999, epsilon 1e-08), tamano de lote 32 tanto en entrenamiento como en evaluacion y semilla 42, ejecutado con Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1. Con 58 pasos por epoca y lote de 32, el conjunto de entrenamiento tenia del orden de 1.856 ejemplos por epoca, es decir, unas 5.570 muestras vistas en total. No hay ninguna informacion sobre la composicion del dataset, el numero de clases ni si se aplico RLHF, DPO u otra fase de alineamiento; tampoco se describe ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.), algo coherente con un ajuste fino estandar.

## Capacidades

- Clasificacion de texto en la tarea de analisis de sentimiento: el modelo devuelve una distribucion de probabilidad sobre las etiquetas aprendidas durante el ajuste fino.
- Clasificacion de secuencias cortas (frases, titulos, resenas breves o fragmentos de hasta 512 tokens).
- Procesamiento por lotes: al ser un encoder de 66 millones de parametros, permite clasificar grandes volumenes de texto con coste reducido.
- Inferencia en CPU sin requisitos de acelerador, gracias al tamano del modelo.
- Integracion directa con la libreria `transformers` (`pipeline("text-classification")`) y con endpoints compatibles (etiqueta `endpoints_compatible` del repositorio).
- Soporte de *tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica; es un clasificador discriminativo, no un modelo generativo.
- Capacidades multilingues: no acreditadas. No se declara ninguna lista de idiomas y el tokenizador *uncased* del modelo base esta sesgado hacia ingles.
- Capacidades especiales (modo *thinking*, vision, audio): no disponibles.
- Generacion de texto, codigo o matematicas: no disponibles; el modelo no genera texto.

## Casos de uso

- Triaje de tickets de soporte: clasificar cada ticket entrante por polaridad para enrutarlo a distintos equipos o priorizar los negativos. El modelo es adecuado por coste y latencia, pero la precision declarada (0,66) obliga a supervisar el resultado o combinarlo con reglas de negocio.
- Monitorizacion de menciones en redes sociales: analizar en lote comentarios o *tuits* para detectar picos de sentimiento negativo sobre una marca. Se puede ejecutar en CPU sobre el *stream* completo sin coste de GPU.
- Analisis de encuestas de satisfaccion (NPS, CSAT): clasificar respuestas abiertas de formularios y agregar la distribucion de sentimiento por segmento de cliente. Encaja con el limite de 512 tokens, suficiente para respuestas abiertas tipicas.
- Prefiltrado en pipelines de moderacion de contenido: usar el clasificador como primera etapa barata que descarte el grueso del trafico y reserve modelos mayores para los casos ambiguos.
- Enriquecimiento de corpus para investigacion: etiquetar automaticamente grandes volumenes de texto no anotado como paso previo a un analisis cualitativo o a un etiquetado activo (*active learning*).
- Prototipado y docencia: servir de ejemplo reproducible de ajuste fino con `Trainer` sobre DistilBERT, con hiperparametros y metricas completas en la model card, para practicas de NLP o para comparar tecnicas de destilacion.
- Alertas tempranas en atencion al cliente: disparar avisos cuando la proporcion de sentimiento negativo en una ventana temporal supera un umbral, siempre que se calibre el umbral con datos propios dado el margen de error del modelo.

## Benchmarks y rendimiento

El campo `model-index` del repositorio contiene una lista de resultados vacia, por lo que no hay benchmarks publicados en el sentido habitual (MMLU, GLUE, SST-2, etc.). Los unicos datos disponibles son las metricas autodeclaradas por el autor en la model card:

| Metrica | Valor declarado | Conjunto |
|---|---|---|
| Loss | 0,7470 | Evaluacion |
| Accuracy | 0,6598 | Evaluacion |
| F1 weighted | 0,6493 | Evaluacion |
| F1 macro | 0,6493 | Evaluacion |

Evolucion durante el entrenamiento (declarada por el autor):

| Perdida entrenamiento | Epoca | Paso | Perdida validacion | Accuracy | F1 weighted | F1 macro |
|---|---|---|---|---|---|---|
| 1,0498 | 1,0 | 58 | 0,8737 | 0,6080 | 0,5529 | 0,5529 |
| 0,8304 | 2,0 | 116 | 0,7226 | 0,6975 | 0,6881 | 0,6881 |
| 0,6785 | 3,0 | 174 | 0,7117 | 0,6821 | 0,6736 | 0,6736 |

Advertencias sobre estos datos: el mejor resultado de validacion se alcanza en la epoca 2 (accuracy 0,6975), mientras que la epoca 3 empeora ligeramente la *accuracy* aunque reduce la perdida de entrenamiento, lo que apunta a sobreajuste en la ultima epoca. Ademas, las metricas del encabezado de la model card (loss 0,7470 y accuracy 0,6598) no coinciden con las de la tabla de validacion de la epoca final (0,7117 y 0,6821), probablemente porque corresponden a un subconjunto de evaluacion distinto o a una ejecucion posterior; el autor no lo aclara. La igualdad entre F1 *weighted* y F1 *macro* en las tres epocas sugiere un conjunto de validacion con clases equilibradas, pero no se especifica cuantas etiquetas hay.

## Requisitos de hardware

- Pesos en FP32: aproximadamente 268 MB. En FP16/BF16: unos 134 MB. En INT8 con cuantizacion dinamica: unos 67 MB (estimacion a partir de los 66.955.779 parametros; no hay versiones cuantizadas publicadas).
- VRAM necesaria para inferencia: por debajo de 1 GB en cualquiera de los formatos anteriores, incluyendo el *overhead* del *runtime* (estimacion).
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria. No requiere A100, H100 ni tarjetas de gama alta. Funciona sin problemas en GTX 1650, RTX 3060, RTX 4090, T4, L4 o incluso en GPUs integradas.
- Cabe en GPU de consumo: si, en la practica totalidad de las disponibles en el mercado, y tambien en CPU (x86 o ARM) e incluso en dispositivos de borde con pocos cientos de MB de RAM.
- Opciones de despliegue: `transformers` (pipeline de text-classification), ONNX Runtime u Optimum para exportacion a ONNX, TorchScript, servidores tipo TorchServe, FastAPI + Uvicorn, BentoML o KServe, Hugging Face Inference Endpoints (el repositorio esta marcado como `endpoints_compatible`) y Text Embeddings Inference, que soporta clasificacion de secuencias. No aplican vLLM, llama.cpp ni Ollama: son motores orientados a decodificacion generativa y el repositorio no publica pesos en GGUF.
- Latencia y throughput: no hay mediciones publicadas por el autor. Como referencia orientativa (estimacion, no medida), un encoder de 66 millones de parametros clasifica del orden de cientos a miles de frases cortas por segundo en GPU en modo por lotes y de decenas a unos pocos cientos por segundo en CPU.

## Comparativa con modelos similares

Los valores de la tabla son datos de referencia publicados por los autores de cada modelo; conviene verificarlos en la model card correspondiente antes de citarlos. Las cifras de rendimiento no son directamente comparables entre si porque proceden de conjuntos de evaluacion distintos.

| Modelo | Parametros | Contexto | Licencia | Rendimiento declarado | Disponibilidad |
|---|---|---|---|---|---|
| PoojaDAnchan/sentiment-model | 66,9 M | 512 tokens | Apache-2.0 | Accuracy 0,6598; F1 macro 0,6493 (evaluacion propia, dataset no documentado) | Hugging Face; 0 descargas |
| distilbert/distilbert-base-uncased-finetuned-sst-2-english | 66,9 M | 512 tokens | Apache-2.0 | En torno al 91 % de accuracy en SST-2 (2 clases) | Hugging Face; ampliamente utilizado |
| cardiffnlp/twitter-roberta-base-sentiment-latest | ~125 M (RoBERTa-base) | 512 tokens | consultar model card | 3 clases (negativo, neutro, positivo); metricas publicadas en su model card | Hugging Face; muy utilizado en analisis de redes sociales |
| nlptown/bert-base-multilingual-uncased-sentiment | ~178 M (BERT-base multilingue) | 512 tokens | consultar model card | 5 clases (1 a 5 estrellas); metricas publicadas en su model card | Hugging Face; cubre varios idiomas |

Conclusion de la comparativa: frente a `distilbert-base-uncased-finetuned-sst-2-english`, que emplea la misma arquitectura y el mismo numero de parametros, este modelo no aporta ninguna ventaja medible y si una perdida sustancial de precision (0,66 frente a ~0,91 en una tarea de dos clases), ademas de carecer de dataset documentado. Solo tiene sentido elegirlo si se necesita reentrenar o adaptar la cabeza de clasificacion a un dominio propio con etiquetas especificas.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: la model card indica explicitamente "unknown dataset" y "More information needed" en las secciones de descripcion, usos previstos y datos. No se puede evaluar la representatividad ni el sesgo de los datos.
- Numero de clases desconocido: no se especifica si el modelo predice 2, 3 o mas etiquetas, ni sus nombres. Esto impide interpretar correctamente la salida sin inspeccionar el fichero `config.json`.
- Precision limitada: una accuracy de 0,6598 y un F1 macro de 0,6493 son valores bajos para clasificacion de sentimiento, donde existen alternativas de tamano similar por encima del 0,90 en conjuntos estandar. No se recomienda su uso en produccion sin una evaluacion propia en el dominio objetivo.
- Discrepancia interna en las metricas reportadas: el encabezado de la model card y la tabla de validacion no coinciden (0,6598 frente a 0,6821 de accuracy; 0,7470 frente a 0,7117 de loss). Hay que tratar todas las cifras con cautela.
- Riesgo de sobreajuste: la perdida de entrenamiento sigue bajando en la tercera epoca mientras la de validacion se estanca o empeora. Con solo 58 pasos por epoca, el ajuste fino fue muy corto y probablemente sobre pocos miles de ejemplos.
- Riesgo de alucinacion: no aplica en el sentido generativo (el modelo no produce texto libre), pero si existe el riesgo de asignar etiquetas con alta confianza a textos fuera de la distribucion de entrenamiento. Las probabilidades de salida no estan calibradas de forma documentada.
- Cobertura idiomatica incierta: no se declara ningun idioma y el tokenizador *uncased* del modelo base pierde informacion de mayusculas, relevante en sentimiento (por ejemplo, enfasis en MAYUSCULAS o negaciones escritas en mayusculas). El rendimiento en castellano no esta acreditado.
- Limite de 512 tokens: textos mas largos deben truncarse o segmentarse, lo que puede alterar la polaridad global del documento.
- Sesgos potenciales: un clasificador de sentimiento ajustado sobre un corpus no documentado puede heredar sesgos demograficos, culturales o de dominio (por ejemplo, sobrerrepresentacion de cierto tipo de resenas). No hay ninguna auditoria de sesgo publicada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion con atribucion y conservacion del aviso de licencia. No hay restricciones adicionales declaradas, pero tampoco hay garantias por parte del autor.
- Madurez del repositorio: 0 descargas, 0 "likes" y secciones de la model card sin completar. No ha pasado ninguna revision por parte de la comunidad y su mantenimiento futuro no esta garantizado.
- Metadatos atipicos: las fechas de creacion y actualizacion (2026) y las versiones declaradas de las librerias (Transformers 5.16.1, PyTorch 2.11.0) no se corresponden con versiones estables publicas en el momento de redactar esta ficha; conviene verificar la trazabilidad del entorno de entrenamiento antes de reproducirlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PoojaDAnchan/sentiment-model
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Repositorio del modelo base en GitHub: https://github.com/huggingface/transformers
- Articulo de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Documentacion de `pipeline` de clasificacion de texto: https://huggingface.co/docs/transformers/main/en/main_classes/pipelines#transformers.TextClassificationPipeline
- Alternativa comparable, DistilBERT ajustado en SST-2: https://huggingface.co/distilbert/distilbert-base-uncased-finetuned-sst-2-english
- Alternativa comparable, RoBERTa para sentimiento en redes sociales: https://huggingface.co/cardiffnlp/twitter-roberta-base-sentiment-latest
- Alternativa comparable, BERT multilingue con 5 clases: https://huggingface.co/nlptown/bert-base-multilingual-uncased-sentiment
- No se han encontrado papers, blogs ni demos especificos de este modelo en la informacion disponible.
