# Rexxxxxtxx/rotten-tomatoes-distilbert-sentiment

## Resumen
El modelo `Rexxxxxtxx/rotten-tomatoes-distilbert-sentiment` es un clasificador binario de sentimiento obtenido mediante ajuste fino (fine-tuning) de `distilbert-base-uncased` sobre resenas de clientes y criticas de cine. DistilBERT es una version destilada de BERT que conserva aproximadamente el 97 % del rendimiento de su modelo original con un 40 % menos de parametros y un 60 % mas de velocidad, lo que lo convierte en una opcion ligera para tareas de clasificacion de texto.

El modelo resuelve una tarea concreta: asignar la etiqueta Positivo o Negativo a un texto corto en ingles (resenas, opiniones de productos, criticas). Cuenta con 66.955.010 parametros totales (arquitectura encoder-only de 6 capas con cabeza de clasificacion de dos clases) y su repositorio ocupa unos 0,3 GB en formato safetensors. Esta publicado bajo licencia MIT, lo que facilita su uso comercial sin restricciones adicionales.

Su relevancia actual es practica: para casos donde no se necesita un modelo generativo grande, este clasificador ofrece una alternativa rapida, baratа de desplegar y ejecutable incluso en CPU, con unas metricas declaradas de 86,03 % de exactitud sobre un conjunto de prueba de 2.133 resenas. Es un modelo joven con traccion muy baja (0 descargas, 0 likes en la fecha de la informacion) y sin validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (DistilBERT, 6 capas) con cabeza de clasificacion de secuencia |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (limite de posicion de `distilbert-base-uncased`; no declarado en la model card) |
| Tipos de cuantizacion | no declarados; compatible con fp16 e int8 mediante herramientas estandar |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo se basa en `distilbert-base-uncased`, un transformer encoder-only de 6 capas y 66 millones de parametros, destilado a partir de BERT-base. La tarea es clasificacion de secuencia binaria (Positive / Negative), con una cabeza de clasificacion de dos etiquetas sustituyendo la salida original del modelo base. El tokenizador es el propio de `distilbert-base-uncased` (WordPiece, uncased).

Segun la model card, el ajuste fino se realizo localmente con PyTorch y Hugging Face Transformers sobre una GPU NVIDIA CUDA, combinando conjuntos de resenas de clientes y el corpus Rotten Tomatoes. No se detallan el numero de tokens de entrenamiento, la composicion exacta del dataset, la division train/test ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en un clasificador discriminativo). Tampoco se especifican hiperparametros de entrenamiento. La model card solo aporta el hardware utilizado, el framework y la tarea.

## Capacidades
- Clasificacion binaria de sentimiento en ingles: devuelve Positivo o Negativo con una probabilidad asociada.
- Analisis de resenas de cine, productos y opiniones de clientes de longitud corta.
- Inferencia ligera: al ser un encoder de 66M de parametros, la latencia es baja tanto en GPU como en CPU.
- Integrable en pipelines de `transformers` mediante `AutoTokenizer` y `AutoModelForSequenceClassification`.
- Soporte de batching y truncado de secuencias a 512 tokens.
- No dispone de tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador, no un modelo generativo.
- Capacidad multilingue: no disponible; el modelo esta entrenado y etiquetado para ingles unicamente.
- No dispone de modo "thinking", vision ni audio.

## Casos de uso
- Moderacion de resenas en e-commerce: clasificar automaticamente opiniones de producto como positivas o negativas para priorizar la atencion al cliente o detectar focos de insatisfaccion; el modelo es suficientemente rapido para procesar lotes grandes en CPU.
- Analisis de sentimiento de criticas cinematograficas: etiquetar resenas de cine, lo que encaja directamente con el dataset Rotten Tomatoes usado en el entrenamiento.
- Monitorizacion de marca en redes sociales: procesar comentarios y menciones cortas en ingles para obtener una metrica agregada de sentimiento por campana o periodo.
- Enrutado de tickets de soporte: usar la etiqueta de sentimiento como senal para dirigir quejas negativas a agentes senior y consultas positivas o neutras a respuestas automaticas.
- Enriquecimiento de datasets para investigacion: etiquetar grandes volumenes de texto con una etiqueta de polaridad rapida y barata como paso previo a analisis posteriores.
- Clasificacion por lotes en pipelines de datos: integrar el modelo como paso de preprocesado en ETL o notebooks, dado su bajo coste computacional y su formato safetensors.
- Deteccion temprana de crisis: alertar cuando la proporcion de resenas negativas supera un umbral en un flujo continuo de feedback de clientes.

## Benchmarks y rendimiento
Los unicos datos publicados son los de la model card, medidos sobre 2.133 resenas no vistas:

| Metrica | Valor |
|---|---|
| Accuracy | 86,03 % |
| F1-Score | 0,8603 |
| Precision (media) | 0,86 |
| Recall (media) | 0,86 |
| Conjunto de evaluacion | 2.133 resenas no vistas |

No se han publicado resultados de benchmarks estandar (MMLU, GLUE, SST-2, etc.) en la informacion disponible, ni comparaciones con modelos equivalentes aportadas por el autor. Las cifras anteriores proceden unicamente de la model card y no han sido verificadas de forma independiente.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 270 MB en fp32 (66,9M de parametros x 4 bytes) y unos 135 MB en fp16; con el tokenizador y el overhead del runtime, el consumo real ronda los 0,5-1 GB.
- El modelo cabe sin problema en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, etc., e incluso en GPU integradas o aceleradores de baja gama.
- Ejecucion viable en CPU: al ser un encoder de 6 capas, la inferencia por muestra es del orden de milisegundos a decenas de milisegundos en CPU moderna.
- GPU recomendadas para alto throughput: cualquier GPU con al menos 2 GB de VRAM; A100 o H100 solo tendrian sentido para servir lotes muy grandes a alta concurrencia.
- Opciones de despliegue: `transformers` (PyTorch), `optimum`/ONNX Runtime, TorchScript, y conversion a fin de usar `llama.cpp`/`Ollama` solo si se exporta a un formato compatible; tambien es habitual servir el modelo con FastAPI o TorchServe.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metricas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rexxxxxtxx/rotten-tomatoes-distilbert-sentiment | 66,9M | 512 tokens | 86,03 % accuracy, F1 0,8603 (conjunto propio de 2.133 resenas) | MIT | safetensors en HuggingFace |
| distilbert-base-uncased-finetuned-sst-2-english | 67M | 512 tokens | no disponible en esta ficha | Apache 2.0 | HuggingFace |
| Nav772/distilbert-rotten-tomatoes-sentiment | no disponible | 512 tokens (base DistilBERT) | no disponible | no disponible | HuggingFace (procedente de la busqueda web) |

Nota: los resultados de la busqueda web que atribuyen a variantes de DistilBERT Rotten Tomatoes una ventana de 32K-33K tokens o "1B parameters" son inconsistentes con la arquitectura real de `distilbert-base-uncased` (66M de parametros, 512 posiciones) y probablemente responden a errores de indexacion de terceros; no se han tenido en cuenta como datos fiables.

## Limitaciones y advertencias
- Rendimiento no verificado: las metricas proceden exclusivamente de la model card del autor; no hay evaluacion independiente ni conjunto de prueba publico.
- Sesgo de dominio: el entrenamiento se apoya en resenas de cine y de clientes, por lo que el modelo puede degradarse en textos de otros dominios (juridico, medico, tecnico) o con jerga especifica.
- Sesgos sociales: al derivar de `distilbert-base-uncased`, hereda los sesgos presentes en los corpus web usados para preentrenar BERT; puede asociar polaridad de forma estereotipada segun ciertos grupos o temas.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea con alta confianza en textos ambiguos, ironicos o con negaciones complejas.
- Limitacion de contexto: la ventana efectiva es de 512 tokens; los textos mas largos deben truncarse, lo que puede perder informacion relevante al final de resenas extensas.
- Limitacion de idioma: solo ingles; cualquier texto en otro idioma producira etiquetas poco fiables.
- Restricciones de licencia: MIT permite uso comercial y modificacion; aun asi, conviene conservar el aviso de copyright original y no atribuir al autor garantias de rendimiento.
- Caveats para produccion: al no haber versionado del conjunto de datos ni semillas de entrenamiento documentadas, la reproducibilidad es limitada; se recomienda validar con datos propios antes de desplegar.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/Rexxxxxtxx/rotten-tomatoes-distilbert-sentiment
- Perfil del autor (GitHub): https://github.com/liktb
- Referencia externa (indexado, no oficial): https://essamamdani.com/ai-models/hf-mahmouddayem-distilbert-rotten-tomatoes
- Variante similar en HuggingFace: https://huggingface.co/Nav772/distilbert-rotten-tomatoes-sentiment
- Demo relacionada en HuggingFace Spaces: https://huggingface.co/spaces/MathisKhan/distilbert-sentiment-demo
- Ficha en Antbase: https://antbase.ai/models/distilbert-rotten-tomatoes
- Ficha en Featherless: https://featherless.ai/models/RostislavX/distilbert-rotten-tomatoes
