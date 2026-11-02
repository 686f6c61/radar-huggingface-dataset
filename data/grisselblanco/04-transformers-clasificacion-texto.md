# grisselblanco/04-transformers-clasificacion-texto

## Resumen

El modelo `grisselblanco/04-transformers-clasificacion-texto` es un clasificador binario de texto en espanol construido con una arquitectura BERT diminuta y entrenado desde cero. Lo desarrolla la usuaria de Hugging Face `grisselblanco` en el marco del Seminario de Actualizacion del IFTS N.º 18, con la docente Cynthia M. Villagra, y tiene una finalidad exclusivamente pedagogica: ilustrar todas las piezas que se publican al compartir un modelo de Transformers (arquitectura, pesos y tokenizer).

El modelo resuelve una tarea de clasificacion de sentimiento muy acotada: dado un comentario corto sobre departamentos, devuelve la etiqueta `positivo` o `negativo`. La arquitectura es `BertForSequenceClassification` con 2 capas, 2 cabezas de atencion y una dimension oculta de 32, lo que da un total de 20.546 parametros. El tokenizer es a nivel palabra (`WordLevel`) con un vocabulario de solo 37 tokens, en minusculas y sin tildes.

Su relevancia no esta en el rendimiento, sino en el valor didactico: es un ejemplo minimo y reproducible de un pipeline completo de clasificacion de texto con Hugging Face Transformers y PyTorch, con codigo de entrenamiento (`train.py`) y de inferencia (`predict.py`) incluidos. No es un modelo apto para produccion ni para datos reales fuera de su dominio sintetico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (BertForSequenceClassification), 2 capas, 2 cabezas de atencion, dimension oculta 32 |
| Parametros totales | 20.546 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | espanol |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un transformer encoder de tipo BERT con una cabeza de clasificacion de secuencias. La configuracion es minima: 2 capas de encoder, 2 cabezas de atencion, dimension oculta de 32 y un vocabulario de 37 tokens a nivel palabra (`WordLevel`), con normalizacion a minusculas y eliminacion de tildes. El modelo se entrena desde cero, no mediante fine-tuning de un modelo preentrenado del Hub, y se guarda junto a su tokenizer, que es imprescindible porque los indices de entrada solo tienen sentido con ese vocabulario concreto.

El entrenamiento es supervisado y binario. El dataset es sintetico: 368 comentarios generados a partir de 5 plantillas de frases y 16 adjetivos (8 positivos y 8 negativos), divididos en 294 registros de entrenamiento y 74 de evaluacion. Se usa entropia cruzada como funcion de perdida, optimizador AdamW con tasa de aprendizaje 0,001, 15 epocas y lotes de 16, sobre Hugging Face Transformers con PyTorch. No se documenta RLHF, DPO ni ninguna innovacion tecnica adicional; el interes es exclusivamente didactico.

## Capacidades

- Clasificacion binaria de texto corto en espanol: devuelve `positivo` o `negativo`.
- Inferencia mediante el pipeline `text-classification` de Transformers.
- Compatibilidad con Transformers 4 (version de Colab) y Transformers 5.
- Reproducibilidad completa: incluye `train.py`, `predict.py` y `requirements.txt`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene modo de razonamiento (thinking), vision ni audio.
- Capacidad multilingue limitada al espanol y, en la practica, al vocabulario de 37 palabras.

## Casos de uso

- Docencia y formacion: sirve como ejemplo completo y reproducible de un pipeline de clasificacion de texto con Transformers, desde la definicion de la arquitectura hasta la publicacion de pesos y tokenizer en el Hub.
- Practica de publicacion de modelos: permite al alumnado entender que archivos (`config.json`, `model.safetensors`, `tokenizer.json`, `tokenizer_config.json`) deben acompanar a un modelo y por que el tokenizer es inseparable de los pesos.
- Demostracion de sobreajuste y evaluacion optimista: el accuracy de 1,000 sobre test ilustra por que un conjunto de evaluacion generado con las mismas plantillas que el de entrenamiento no es una medida fiable de generalizacion.
- Demostracion de fallo con entradas fuera de distribucion: al introducir palabras desconocidas, el modelo responde con alta confianza y etiqueta erronea, lo que sirve para explicar el fenomeno del `[UNK]` y la calibracion.
- Prototipado de pipelines de inferencia: permite probar el pipeline `text-classification` y la integracion con `text-embeddings-inference` en un entorno controlado y de bajo coste.
- Base para un ejercicio de fine-tuning: el codigo y la estructura sirven de punto de partida para sustituir el entrenamiento desde cero por un fine-tuning sobre un modelo preentrenado en espanol con datos reales.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto |
|---|---|---|
| Accuracy | 1,000 | 74 comentarios sinteticos de test |

El propio autor advierte que este resultado es optimista: los comentarios de test usan las mismas plantillas y adjetivos que los de entrenamiento. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 20.546 parametros y un repo de 0,0 GB.
- GPU recomendadas: no requiere GPU; funciona en CPU sin problema.
- Cabe en cualquier GPU consumer e integrada, y en entornos como Google Colab o incluso en un telefono.
- Opciones de despliegue: pipeline de Transformers, endpoints compatibles con `text-embeddings-inference`; tambien es viable exportarlo a otros formatos, aunque no se documenta.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, la latencia en CPU es del orden de milisegundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Uso previsto |
|---|---|---|---|---|---|
| grisselblanco/04-transformers-clasificacion-texto | 20.546 | no disponible | es | MIT | Educativo |
| BERT-base multilingue (referencia) | ~178 M | 512 | multilingue | Apache 2.0 | Produccion con fine-tuning |
| RoBERTa-base BNE (referencia en espanol) | ~125 M | 512 | es | MIT | Produccion con fine-tuning |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada. La comparativa se limita a tamano, licencia e idioma; los modelos de referencia son ordenes de magnitud mayores y estan pensados para fine-tuning sobre datos reales, mientras que este modelo es un ejemplo pedagogico.

## Limitaciones y advertencias

- Tiene fines exclusivamente educativos; no debe usarse en produccion.
- Solo conoce 37 palabras; cualquier otra se convierte en `[UNK]` y el modelo responde igualmente con alta confianza, a menudo de forma erronea.
- No entiende negaciones ("no es luminoso") ni ironia, porque las frases de entrenamiento no las contienen.
- El dataset es sintetico y generado con plantillas, por lo que el accuracy de test es optimista y no refleja generalizacion.
- Riesgo alto de alucinacion en el sentido de predicciones seguras pero incorrectas fuera de distribucion.
- Sesgos: no documentados, pero el vocabulario y las plantillas limitan el dominio a comentarios sobre departamentos.
- Licencia MIT: permite uso comercial, pero el modelo no es adecuado para ello por sus limitaciones tecnicas.
- Para un uso real, se recomienda partir de un modelo preentrenado en espanol y hacer fine-tuning con comentarios reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/grisselblanco/04-transformers-clasificacion-texto
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
