# RaidahAhmed/RaidahandNawe-sentiment-model

## Resumen

RaidahandNawe-sentiment-model es un clasificador binario de sentimiento (positivo/negativo) obtenido mediante fine-tuning de `distilbert-base-uncased`, la variante destilada de BERT desarrollada originalmente por Hugging Face. El modelo lo publica el usuario RaidahAhmed en Hugging Face y, segun la model card, forma parte de un trabajo academico conjunto de dos autores (Raidah y Nawe). Su funcion es asignar una etiqueta de polaridad a un texto en ingles, devolviendo ademas una puntuacion de confianza por clase.

Con 66.955.010 parametros y un peso de repositorio de aproximadamente 0,3 GB, se trata de un modelo encoder-only compacto, pensado para inferencia de bajo coste y alto throughput en tareas de clasificacion, no para generacion de texto. El contexto efectivo esta limitado a 256 tokens segun la propia model card, que indica que las resenas mas largas se truncan.

Su relevancia es practica: sirve como referencia de un fine-tuning estandar sobre el dataset `stanfordnlp/imdb` (resenas de cine) con resultados declarados de 0,91 de accuracy y 0,9106 de F1 en el conjunto de test. Es un modelo pequeno, facil de desplegar en CPU, util para prototipos de analisis de opinion, pero con un dominio y un idioma muy acotados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (DistilBERT, destilado de BERT-base) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens (truncado segun model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, un transformer encoder-only de 6 capas obtenido por destilacion de BERT-base (12 capas, 110M parametros). DistilBERT reduce el numero de capas a la mitad y conserva el vocabulario WordPiece sin distincion de mayusculas, lo que da lugar a los 66.955.010 parametros reportados en los safetensors. Sobre esta base se anade una cabeza de clasificacion con dos etiquetas (positivo y negativo) para la tarea de analisis de sentimiento.

El fine-tuning se realizo, segun la model card, sobre el dataset `stanfordnlp/imdb`, compuesto por resenas de peliculas en ingles. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, la configuracion de hiperparametros (learning rate, batch size, epocas) ni si se aplicaron tecnicas de RLHF o DPO, algo por otra parte poco habitual en un clasificador encoder-only. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) en textos en ingles.
- Devuelve una puntuacion de confianza por clase, segun los ejemplos de la model card (valores cercanos a 1,00 en casos claros).
- Procesamiento de resenas y textos cortos de hasta 256 tokens; los textos mas largos se truncan.
- Inferencia rapida en CPU y GPU por su tamano reducido (67M parametros).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, vision, audio ni generacion de texto.
- Capacidad multilingue: no disponible; entrenado y evaluado solo en ingles.

## Casos de uso

- Moderacion de opiniones en plataformas de resenas: el modelo clasifica rapidamente resenas de productos o contenidos como positivas o negativas, permitiendo priorizar la revision manual de las negativas.
- Analisis de sentimiento en encuestas de satisfaccion: procesar respuestas abiertas en ingles y agregar la polaridad para obtener metricas de NPS o CSAT de forma automatizada.
- Monitorizacion de reputacion de marca en redes sociales: clasificar menciones en ingles y disparar alertas cuando la proporcion de sentimiento negativo supera un umbral.
- Etiquetado previo para pipelines de datos: usar el modelo como anotador automatico de un corpus en ingles para preetiquetar y reducir el coste de anotacion humana en tareas de NLP posteriores.
- Filtrado de comentarios en foros y comunidades: detectar comentarios negativos para enrutarlos a sistemas de atencion o a colas de moderacion.
- Prototipado rapido y educacion: al ser un DistilBERT de 67M parametros, cabe en cualquier portatil y sirve como ejemplo reproducible de fine-tuning de clasificacion con Hugging Face Transformers.
- Clasificacion por lotes de bajo coste: desplegado en CPU con `transformers` o `optimum`, puede procesar grandes volumenes de resenas sin GPU.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el conjunto de test:

| Metrica | Valor |
|---|---|
| Accuracy | 0,91 |
| F1 | 0,9106 |

No se han publicado resultados de benchmarks adicionales (MMLU, GLUE, etc.) ni comparaciones con otros modelos en la informacion disponible. Los valores anteriores corresponden exclusivamente al dataset `stanfordnlp/imdb` segun la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (67M parametros, ~268 MB de pesos); en FP16 aproximadamente 134 MB.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo no requiere A100 ni H100. Una RTX 4090 o una T4 lo ejecutan con holgura y el cuello de botella sera el preprocesado, no el modelo.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 1 GB de memoria, e incluso en CPU.
- Opciones de despliegue: `transformers` (PyTorch), `optimum` para ONNX Runtime, `text-embeddings-inference` no aplica, y `vLLM`/`llama.cpp`/`Ollama` no estan pensados para este tipo de modelo encoder-only de clasificacion.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, se espera un throughput alto en CPU y muy alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RaidahandNawe-sentiment-model | 66.955.010 | 256 tokens | Clasificacion de sentimiento (en) | no disponible | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~67M | 512 tokens | Clasificacion de sentimiento (en) | Apache 2.0 | Hugging Face |
| `cardiffnlp/twitter-roberta-base-sentiment-latest` | ~125M | 512 tokens | Clasificacion de sentimiento (en, redes sociales) | no disponible | Hugging Face |

La comparativa se limita a alternativas de la misma categoria (clasificadores de sentimiento encoder-only en ingles). No se dispone de datos de rendimiento comparables de este modelo frente a las alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con resenas de peliculas en ingles (`stanfordnlp/imdb`); el rendimiento puede degradarse en otros dominios (redes sociales, soporte tecnico, resenas de productos).
- Puede fallar con sarcasmo, opiniones mixtas y textos con mezcla de idiomas, segun reconoce la propia model card.
- Los textos de mas de 256 tokens se truncan, lo que puede perder informacion relevante en documentos largos.
- Riesgo de alucinacion no aplica en sentido estricto (no genera texto), pero si de clasificaciones erroneas con alta confianza.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al entrenar sobre resenas de cine, puede heredar sesgos de ese corpus.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- No hay informacion sobre el proceso de entrenamiento (hiperparametros, particion de datos, semillas), lo que dificulta la reproducibilidad.
- El modelo tiene 51 descargas y 1 like en el momento de la consulta; se trata de un artefacto academico sin validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RaidahAhmed/RaidahandNawe-sentiment-model
- Modelo relacionado (Abaasa): https://huggingface.co/Abaasa/Raidah_Nawe_sentiment_model
- Ficha en Free2AITools: https://free2aitools.com/model/raidahahmed/raidahandnawe-sentiment-model
- Dataset de entrenamiento: https://huggingface.co/datasets/stanfordnlp/imdb
- Modelo base: https://huggingface.co/distilbert-base-uncased
