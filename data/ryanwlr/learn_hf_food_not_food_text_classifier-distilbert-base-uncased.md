# ryanwlr/learn_hf_food_not_food_text_classifier-distilbert-base-uncased

## Resumen

El modelo `learn_hf_food_not_food_text_classifier-distilbert-base-uncased` es un clasificador binario de texto desarrollado por Ryan Weiler (ryanwlr) que determina si un texto está relacionado con comida o no. Se trata de un fine-tuning del modelo base `distilbert-base-uncased` de HuggingFace, una versión destilada de BERT con 66,9 millones de parámetros y una arquitectura transformer encoder de 6 capas. El modelo fue entrenado durante 10 épocas con un learning rate de 0,0001 y alcanza una accuracy de 0,98 en el conjunto de evaluación, con una pérdida de 0,0638.

La relevancia de este modelo radica en su simplicidad y eficiencia: al estar basado en DistilBERT, ofrece un equilibrio entre rendimiento y coste computacional, lo que lo hace adecuado para tareas de clasificación de texto en tiempo real o en entornos con recursos limitados. Aunque la model card no especifica el dataset de entrenamiento ni los idiomas soportados, el modelo base está entrenado en inglés y su contexto máximo es de 512 tokens. El repositorio incluye pesos en formato safetensors y está publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, 12 cabezas de atencion) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (maximo del modelo base DistilBERT) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion declarada) |
| Idiomas soportados | Ingles (por el modelo base, no especificado en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una version destilada de BERT que conserva el 97% de su rendimiento con un 40% menos de parametros. La arquitectura es un transformer encoder con 6 capas, 12 cabezas de atencion y una dimension de embedding de 768. El fine-tuning se realizo sobre un dataset desconocido, con un objetivo de clasificacion binaria (comida vs no comida). Los hiperparametros de entrenamiento incluyen learning rate de 0,0001, batch size de 32, optimizador Adam (beta1=0,9, beta2=0,999, epsilon=1e-08), scheduler lineal y 10 epocas. La perdida de entrenamiento descendio de 0,4253 en la primera epoca a 0,0006 en la decima, mientras que la accuracy de validacion se mantuvo estable en 0,98-1,0 a partir de la segunda epoca. No se menciona el uso de tecnicas como RLHF o DPO; el entrenamiento es un fine-tuning clasico supervisado.

## Capacidades

- Clasificacion binaria de texto: determina si un texto esta relacionado con comida o no.
- Procesamiento de texto en ingles (heredado del modelo base).
- Inferencia rapida y ligera gracias a la arquitectura destilada (66M parametros).
- Soporte para clasificacion de secuencias cortas (hasta 512 tokens).
- No incluye capacidades de generacion de texto, tool calling, agentes, vision ni audio.

## Casos de uso

- Moderacion de contenido en redes sociales: el modelo puede filtrar publicaciones o comentarios que mencionen comida, util para plataformas de recetas o dietas. Su baja latencia permite procesar grandes volumenes en tiempo real.
- Clasificacion de resenas de restaurantes: permite separar resenas que hablan de la comida de las que hablan del servicio o ambiente, facilitando el analisis de sentimiento especifico.
- Filtrado de noticias o articulos: en un agregador de noticias, puede etiquetar automaticamente los articulos relacionados con gastronomia para categorizarlos en una seccion dedicada.
- Asistente de menu en aplicaciones de delivery: dado un texto de descripcion de plato, el modelo puede confirmar si se refiere a comida, ayudando a validar entradas de datos.
- Analisis de encuestas abiertas: en estudios de mercado, puede clasificar respuestas abiertas que mencionen alimentos, separandolas de otros temas para su posterior analisis.
- Deteccion de spam en foros de cocina: identifica mensajes que no tratan sobre comida (por ejemplo, publicidad no relacionada) para mantener la relevancia del foro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye unicamente la metrica de accuracy sobre el conjunto de evaluacion, que alcanza 0,98, junto con la perdida de validacion de 0,0638. No hay comparaciones con otros modelos ni resultados en benchmarks estandar como MMLU, GLUE o SuperGLUE.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 250 MB en FP32 (66M parametros × 4 bytes), menos de 130 MB en FP16. Cabe en cualquier GPU moderna, incluso en GPUs integradas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, por ejemplo NVIDIA GTX 1050, RTX 2060 o superiores. Tambien puede ejecutarse en CPU sin problemas para inferencia por lotes pequenos.
- Compatible con hardware de consumo: si, se puede ejecutar en una Raspberry Pi 4 o en un portatil sin GPU dedicada.
- Opciones de despliegue: compatible con HuggingFace Transformers, ONNX Runtime, TensorFlow Lite y herramientas como FastAPI para servir el modelo. No se menciona soporte especifico para vLLM, llama.cpp u Ollama, pero al ser un modelo transformer clasico puede convertirse a ONNX o TorchScript.
- Latencia estimada: en CPU moderna, inferencia de una secuencia corta en menos de 10 ms; en GPU, menos de 1 ms. Throughput estimado de cientos de peticiones por segundo en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy (evaluacion) | Licencia |
|---|---|---|---|---|
| learn_hf_food_not_food (este) | 66,9M | 512 | 0,98 | Apache 2.0 |
| distilbert-base-uncased (base) | 66,9M | 512 | no disponible | Apache 2.0 |
| bert-base-uncased | 110M | 512 | no disponible | Apache 2.0 |

La comparativa se limita a parametros y contexto, ya que no hay datos de rendimiento publicados para los modelos alternativos en la misma tarea. El modelo base DistilBERT es el punto de partida, y BERT-base es una alternativa mas pesada con el doble de parametros. No se dispone de informacion sobre otros clasificadores de comida/no comida especificos.

## Limitaciones y advertencias

- El dataset de entrenamiento es desconocido, por lo que no se puede evaluar la cobertura de dominios ni la posible existencia de sesgos en los datos.
- El modelo esta entrenado principalmente en ingles (por el modelo base), por lo que su rendimiento en otros idiomas puede ser deficiente o nulo.
- La longitud de contexto esta limitada a 512 tokens; textos mas largos deben truncarse o dividirse.
- La accuracy de 0,98 se obtuvo sobre un conjunto de evaluacion no especificado; podria existir sobreajuste si el dataset era pequeno o poco diverso.
- No se han realizado pruebas de robustez ante entradas adversariales o ruido.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- El tamano del repositorio (9,9 GB) sugiere que puede contener archivos adicionales ademas de los pesos, lo que podria aumentar el tiempo de descarga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ryanwlr/learn_hf_food_not_food_text_classifier-distilbert-base-uncased
- Model card (README): https://huggingface.co/ryanwlr/learn_hf_food_not_food_text_classifier-distilbert-base-uncased/blob/main/README.md
- Ficha en AIBase: https://model.aibase.com/models/details/1915748764360531970
- Ficha alternativa en AIBase: https://model.aibase.com/en/models/details/1924735252866273280
- Publicacion en LinkedIn del autor: https://www.linkedin.com/posts/ryan-weiler-7a3119190_ryanwlrlearnhffoodnotfoodtextclassifier-distilbert-base-uncased-activity-7474881293181255680-t0e2
