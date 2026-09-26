# aymanbm2000/ag-news-distilbert-lora-r32

## Resumen

El modelo `aymanbm2000/ag-news-distilbert-lora-r32` es un adaptador LoRA entrenado sobre `distilbert-base-uncased` para clasificación de texto en cuatro categorías de temática periodística (World, Sports, Business, Sci/Tech) del conjunto de datos AG News. Lo desarrolla el usuario `aymanbm2000` como parte de un proyecto que estudia el compromiso entre rendimiento y coste del rango de LoRA en tareas de clasificación de texto corto. No es un modelo generativo: es un clasificador de secuencias que devuelve una etiqueta entre cuatro posibles.

La arquitectura subyacente es DistilBERT, un transformer encoder de 6 capas y 67 millones de parámetros, destilado a partir de BERT-base. Sobre él se aplica un adaptador LoRA de rango 32 y alpha 64 actuando sobre las proyecciones de query y value (`q_lin`, `v_lin`) de la atención, más una cabeza de clasificación de 4 clases. Solo una fracción reducida de los parámetros se entrena, lo que mantiene el artefacto muy ligero y reutiliza los pesos congelados del modelo base.

Su relevancia es acotada pero clara: dentro del barrido de rangos LoRA que acompaña al proyecto (r=4, 8, 16 y 32), esta configuración es la de mayor rango y la que más se acerca al fine-tuning completo, con una exactitud de 0,9309 en el split de test de AG News. Es una pieza útil como referencia técnica para evaluar cuánto rinde un adaptador pequeño frente a actualizar el modelo entero en una tarea concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas) con adaptador LoRA sobre las proyecciones de query y value |
| Parametros totales | 67 millones (modelo base DistilBERT) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens en entrenamiento (maximo nativo del base: 512) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones del adaptador) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA empaquetado con PEFT) |

## Arquitectura y entrenamiento

El modelo base es `distilbert-base-uncased`, un transformer encoder de 6 capas y 67 millones de parámetros obtenido por destilación de BERT-base. Sobre él se añade un adaptador LoRA de rango 32, alpha 64 y dropout 0,1, aplicado exclusivamente a las proyecciones de query (`q_lin`) y value (`v_lin`) de las capas de atención. El módulo de clasificación final consta de 4 clases. El adaptador y la cabeza de clasificación son los únicos parámetros entrenables; el resto del modelo permanece congelado, lo que reduce notablemente el coste de entrenamiento y el tamaño del artefacto resultante.

El entrenamiento se realizó sobre aproximadamente 50 000 filas muestreadas del split de entrenamiento de AG News, durante 3 épocas, con tasa de aprendizaje 2e-4 (más alta que la típica del fine-tuning completo, 2e-5, siguiendo la práctica habitual con LoRA), tamaño de lote 32 en entrenamiento y 64 en evaluación, y longitud máxima de secuencia de 128 tokens. Se seleccionó el mejor checkpoint por macro F1 sobre una partición de validación del 10 % de los datos de entrenamiento. El seguimiento se hizo con Weights & Biases. No se documenta el uso de RLHF ni DPO, algo esperable en una tarea de clasificación supervisada.

## Capacidades

- Clasificacion de texto corto en ingles dentro de una taxonomia fija de cuatro clases: World, Sports, Business y Sci/Tech.
- Clasificacion de secuencias con entrada de hasta 128 tokens (longitud usada en entrenamiento).
- Salida de probabilidades por clase mediante softmax sobre los logits, util para umbralizar confianza.
- Reutilizacion de los pesos congelados de DistilBERT mas un adaptador ligero, lo que permite cargar el adaptador sobre el base sin duplicar el modelo completo.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No esta orientado a uso agentico ni a razonamiento multi-paso.
- Soporte multilingue: no, solo ingles.

## Casos de uso

- Clasificacion automatica de noticias en portales y agregadores: el modelo etiqueta titulares o entradas cortas en una de las cuatro categorias de AG News, permitiendo organizar feeds y secciones sin intervencion manual.
- Enrutamiento de contenido en sistemas de recomendacion: dada una noticia entrante, se asigna una categoria tematica que alimenta reglas de recomendacion o filtros por interes del usuario.
- Organizacion de feeds RSS y boletines: el clasificador preetiqueta entradas conforme llegan, reduciendo el trabajo editorial de categorizacion.
- Monitorizacion de medios y analisis de tendencias: al clasificar volumenes grandes de titulares por tematica, se pueden medir proporciones de cobertura de Business o Sci/Tech a lo largo del tiempo.
- Preprocesado en pipelines de PLN: la etiqueta de tematica se usa como caracteristica de entrada para tareas posteriores como resumen, busqueda o analisis de sentimiento especifico por dominio.
- Etiquetado asistido de datos: el modelo puede proponer etiquetas iniciales sobre corpus de noticias que luego se revisan, acelerando la anotacion manual.
- Alertas tematicas para redacciones: activar avisos cuando entra contenido clasificado como Sci/Tech o Business, por ejemplo para equipos especializados.
- Inferencia de baja latencia en entornos con recursos limitados: al ser un modelo de 67 millones de parametros con adaptador, puede ejecutarse en CPU o en GPU modesta para clasificar en tiempo real.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, evaluados sobre el split de test estandar de AG News (7600 ejemplos). No verificados de forma independiente (`verified: false`).

| Metrica | Valor |
|---|---|
| Accuracy | 0,9309 |
| Macro F1 | 0,9309 |
| Errores | 525 / 7600 (6,9 %) |

Comparativa de configuraciones dentro del mismo proyecto (datos del autor):

| Modelo | Accuracy en test | Macro F1 en test |
|---|---|---|
| Baseline (TF-IDF + Regresion Logistica) | no disponible | 0,9107 |
| LoRA r=4, alpha=8 | 0,9264 | 0,9264 |
| LoRA r=8, alpha=16 | 0,9272 | 0,9272 |
| LoRA r=16, alpha=32 | 0,9293 | 0,9293 |
| LoRA r=32, alpha=64 (este modelo) | 0,9309 | 0,9309 |
| Fine-tuning completo | 0,9333 | 0,9333 |

Segun el autor, el rango de LoRA muestra un efecto positivo pequeno pero consistente; el fine-tuning completo mantiene una ventaja modesta (+0,24 de F1 sobre r=32) a cambio de un 34 % mas de tiempo de entrenamiento y de actualizar el 100 % de los parametros.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 67 millones de parametros; en fp32 ocupa aproximadamente 268 MB y en fp16 alrededor de 134 MB. El adaptador LoRA anade unos pocos MB. Estas cifras son calculos derivados del tamano del modelo, no mediciones publicadas.
- GPU recomendadas: cualquier GPU sirve; el modelo es tan pequeno que incluso una GPU integrada o una GTX 1650 bastan. Una RTX 4090, A100 o H100 estarian sobredimensionadas para una sola instancia, aunque utiles para procesar lotes muy grandes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en CPU.
- Opciones de despliegue: `transformers` con `peft` (uso documentado en la model card), exportacion a ONNX Runtime o TensorRT para reducir latencia, y servido mediante una API propia (por ejemplo FastAPI). No es un caso de uso tipico de vLLM o TGI, orientados a modelos generativos, aunque TGI soporta modelos de clasificacion.
- Latencia y throughput estimados: no disponible en la informacion proporcionada. Al tratarse de un encoder de 67 millones de parametros con secuencias de 128 tokens, el throughput en GPU es alto, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy AG News | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ag-news-distilbert-lora-r32 (este) | 67 M (adaptador LoRA r=32) | 128 tokens (uso) | 0,9309 | Apache 2.0 | HuggingFace (PEFT) |
| Fine-tuning completo de DistilBERT (mismo proyecto) | 67 M (todos entrenables) | 128 tokens (uso) | 0,9333 | no disponible | referencia interna del proyecto |
| DistilBERT + LoRA r=16 (mismo proyecto) | 67 M (adaptador LoRA r=16) | 128 tokens (uso) | 0,9293 | Apache 2.0 | referencia interna del proyecto |
| Baseline TF-IDF + Regresion Logistica (mismo proyecto) | no aplica | no aplica | no disponible (F1 0,9107) | no disponible | referencia interna del proyecto |

No se dispone de comparaciones con otros adaptadores o clasificadores publicados de forma independiente en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado unicamente sobre AG News; su rendimiento en otros conjuntos de clasificacion de noticias o en otros dominios no esta probado.
- Solo admite ingles; no se ha validado su comportamiento en otros idiomas.
- Taxonomia fija de cuatro clases (World, Sports, Business, Sci/Tech); no realiza clasificacion mas fina ni de subtemas.
- No es un modelo generativo: no puede redactar, resumir ni responder preguntas.
- Como el modelo base, puede reflejar sesgos presentes en los datos de preentrenamiento de DistilBERT.
- Los resultados declarados (accuracy y F1 de 0,9309) no estan verificados de forma independiente (`verified: false`).
- Longitud de entrada limitada en la practica a 128 tokens en el entrenamiento; secuencias mas largas deberian truncarse.
- Licencia Apache 2.0, que permite uso comercial, pero se recomienda revisar tambien las condiciones del modelo base y del conjunto de datos AG News.
- El repositorio figura con un tamano de 0,0 GB, coherente con un adaptador ligero; es necesario descargar el modelo base por separado para poder usarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aymanbm2000/ag-news-distilbert-lora-r32
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Articulo de LoRA: https://arxiv.org/abs/2106.09685
- Repositorio PEFT: https://github.com/huggingface/peft
- Conjunto de datos AG News: https://huggingface.co/datasets/ag_news
- Repositorio del proyecto (referenciado en la model card como github.com/aymanbm2000/project3, enlace incompleto en la informacion disponible): no disponible
- Seguimiento de experimentos (Weights & Biases): no disponible
