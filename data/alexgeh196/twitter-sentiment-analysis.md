# alexgeh196/twitter-sentiment-analysis

## Resumen

`alexgeh196/twitter-sentiment-analysis` es un clasificador binario de sentimiento (negativo/positivo) para texto corto en ingles procedente de redes sociales. Se trata de un fine-tuning de `distilbert-base-uncased` sobre el dataset Sentiment140 (1,6 millones de tuits etiquetados), desarrollado por Alexander Gehbrezgi en el marco de su tesis de master en la Goethe University Frankfurt (2023) sobre el impacto de la invasion rusa de Ucrania en los mercados financieros globales.

El modelo emplea la arquitectura DistilBERT, una version destilada de BERT-base con 6 capas de transformer y aproximadamente 66 millones de parametros, lo que lo situa en la categoria de modelos ligeros aptos para inferencia en CPU y GPUs de consumo. Su ventana de contexto es de 512 tokens, suficiente para tuits y frases individuales, pero insuficiente para documentos largos sin fragmentacion previa.

Su relevancia actual es limitada: se publico en diciembre de 2022, acumula 3 descargas y no dispone de licencia declarada. Resulta util como referencia academica de un pipeline de analisis de sentimiento aplicado a datos financieros y como ejemplo de fine-tuning de DistilBERT con metricas verificables en Sentiment140, pero no compite con clasificadores modernos basados en encoders de mayor tamano o en LLMs con capacidad de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilacion de BERT-base) |
| Parametros totales | Aproximadamente 66 millones (DistilBERT-base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (pesos PyTorch estandar; compatible con cuantizacion dinamica via PyTorch y con conversion a ONNX) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (safetensors/bin segun el repositorio de transformers); repo de 0,8 GB |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, un transformer encoder de 6 capas y 66 millones de parametros obtenido mediante destilacion de BERT-base. Sobre esa base se anadio una cabeza de clasificacion binaria (dos etiquetas: 0 = negativo, 4 = positivo, siguiendo la codificacion original de Sentiment140) y se realizo un fine-tuning supervisado.

Los hiperparametros documentados por el autor son: learning rate de 2e-5 con decaimiento lineal, batch size de 16 en entrenamiento y evaluacion, 3 epocas, weight decay de 0,01 y entrenamiento sobre una NVIDIA A100 en Google Colab. El dataset Sentiment140 contiene 1,6 millones de tuits etiquetados mediante supervision distante a partir de emoticonos, con una particion hold-out aleatoria de aproximadamente 60:40 entre entrenamiento y test. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales, algo esperable en un clasificador de este tipo.

## Capacidades

- Clasificacion binaria de sentimiento (negativo/positivo) en texto corto en ingles.
- Procesamiento de entradas de hasta 512 tokens, adecuado para tuits, titulares y frases.
- Inferencia rapida en CPU y GPU gracias al tamano reducido del modelo (66M de parametros).
- Integracion directa con el pipeline `text-classification` de Hugging Face Transformers.
- Compatible con Text Embeddings Inference y con endpoints de Hugging Face (segun los tags del repositorio).
- No soporta tool calling ni function calling.
- No dispone de modo de razonamiento multi-paso ni capacidades de agente.
- No soporta vision, audio ni otras modalidades.
- No cubre la clase neutra: toda entrada se fuerza a positivo o negativo.

## Casos de uso

- Monitorizacion de reputacion en redes sociales: el modelo permite puntuar en lote tuits y comentarios en ingles y agregar la polaridad por marca o campana, con un coste computacional bajo gracias a sus 66M de parametros.
- Analisis de sentimiento en investigacion academica: replica el uso original de la tesis, puntuando corpus de noticias y publicaciones en redes para alimentar modelos estadisticos (por ejemplo, regresion logistica) que expliquen movimientos de mercado.
- Filtrado previo en pipelines de moderacion: como primera etapa para descartar contenido claramente negativo antes de pasar a clasificadores mas costosos o a revision humana.
- Enriquecimiento de datasets: etiquetado automatico de grandes volumenes de texto corto en ingles para construir conjuntos de entrenamiento o de evaluacion de otros modelos.
- Analisis de opinion de producto: procesamiento de resenas breves y comentarios de usuarios en ingles para obtener una senal rapida de satisfaccion, fragmentando textos largos en frases y promediando puntuaciones.
- Prototipado rapido y demos: su ligereza permite desplegarlo en entornos sin GPU (por ejemplo, contenedores pequenos o funciones serverless) para validar una idea de producto antes de invertir en modelos mayores.
- Analisis de eventos geopoliticos o financieros: tal como se uso en la tesis, para medir la tonalidad de cobertura mediatica internacional en ingles durante periodos concretos.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de Sentiment140 (no verificados de forma independiente, `verified: false`):

| Metrica | Valor |
|---|---|
| Loss | 0,3724 |
| Accuracy | 0,8660 |
| F1 | 0,8652 |
| Precision | 0,8712 |
| Recall | 0,8593 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni en tareas generativas, ya que se trata de un clasificador y no de un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,3 GB para los pesos, mas overhead de activaciones y runtime; en la practica cabe en cualquier GPU con 1 GB o mas.
- Cabe holgadamente en GPUs de consumo: GTX 1050, RTX 2060, RTX 3060, RTX 4090, e incluso en CPU con latencias de milisegundos por muestra.
- GPUs de datacenter (A100, H100) no son necesarias para inferencia; solo se justifican para fine-tuning a gran escala o procesamiento masivo en lote.
- Opciones de despliegue: Hugging Face Transformers (`pipeline`), Text Embeddings Inference (soporte declarado en los tags), ONNX Runtime, y servidores de inferencia compatibles con modelos de transformers. No se documenta soporte explicito para vLLM, llama.cpp u Ollama, que estan orientados a modelos generativos.
- Throughput estimado: no disponible en la informacion proporcionada; por el tamano del modelo, se espera procesamiento de cientos a miles de textos por segundo en GPU moderna en modo batch, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `alexgeh196/twitter-sentiment-analysis` | Aprox. 66M | 512 tokens | No disponible | Fine-tuning de DistilBERT en Sentiment140; accuracy 0,8660 declarada |
| `distilbert-base-uncased-finetuned-sst-2-english` | Aprox. 66M | 512 tokens | Apache 2.0 | Clasificador de sentimiento oficial de Hugging Face sobre SST-2; ampliamente usado y con licencia clara |
| `cardiffnlp/twitter-roberta-base-sentiment-latest` | Aprox. 125M | 512 tokens | No disponible (verificar en el repositorio) | RoBERTa-base entrenado en datos de Twitter; tres clases (negativo, neutro, positivo) |
| `finiteautomata/bertweet-base-sentiment-analysis` | Aprox. 135M | 128 tokens | No disponible (verificar en el repositorio) | BERTweet especializado en texto de Twitter, con tres clases |

La comparativa se basa en caracteristicas publicas de modelos de la misma categoria; no se dispone de resultados de benchmarks cruzados en la informacion proporcionada.

## Limitaciones y advertencias

- Clasificacion exclusivamente binaria: no existe clase neutra, por lo que textos ambiguos o informativos se fuerzan a positivo o negativo.
- Entrenado sobre tuits de 2009: el vocabulario, los temas y las expresiones han cambiado, lo que puede degradar el rendimiento en texto actual.
- Las etiquetas de Sentiment140 se generaron por supervision distante a partir de emoticonos y contienen ruido; el techo de rendimiento del dataset es limitado.
- Solo ingles: no soporta castellano ni otros idiomas.
- Textos largos deben dividirse en frases y promediar las puntuaciones, como se hizo en la tesis; el modelo no procesa documentos completos de forma fiable.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de clasificaciones erroneas en ironia, sarcasmo y negaciones complejas.
- Licencia no declarada: no hay garantia explicita de uso comercial; conviene contactar con el autor o asumir riesgo legal antes de integrarlo en produccion.
- Modelo con 3 descargas y sin validacion externa: las metricas son autodeclaradas y no verificadas.
- No apto para tareas generativas, de razonamiento, tool calling ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alexgeh196/twitter-sentiment-analysis
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset Sentiment140: https://huggingface.co/datasets/stanfordnlp/sentiment140
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Paper de Sentiment140 (Go et al., 2009): https://cs.stanford.edu/people/alecmgo/papers/TwitterDistantSupervision09.pdf
- Documentacion de Transformers para text-classification: https://huggingface.co/docs/transformers/tasks/sequence_classification
