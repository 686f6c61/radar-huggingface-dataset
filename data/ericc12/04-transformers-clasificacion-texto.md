# ericc12/04-transformers-clasificacion-texto

## Resumen

El modelo `ericc12/04-transformers-clasificacion-texto` es un clasificador de texto binario en espanol desarrollado por el usuario ericc12 como ejemplo pedagogico para el Seminario de Actualizacion del IFTS N.º 18. Se trata de un BERT diminuto entrenado desde cero, con solo 20.546 parametros, cuyo unico proposito es clasificar comentarios cortos sobre departamentos como `positivo` o `negativo`. No es un modelo destinado a produccion ni a investigacion seria, sino una pieza didactica que ilustra el ciclo completo de publicacion de un modelo en Hugging Face: arquitectura, pesos y tokenizer.

La relevancia de este modelo es exclusivamente formativa. Muestra de forma transparente como se compone un repositorio de Hugging Face, como se entrena un `BertForSequenceClassification` desde cero con un vocabulario propio y por que el modelo y el tokenizer deben publicarse juntos. Su arquitectura es deliberadamente minima: 2 capas, 2 cabezas de atencion, dimension oculta de 32 y un tokenizer a nivel de palabra con solo 37 tokens.

No debe confundirse con un modelo de lenguaje utilizable: su vocabulario cubre 37 palabras y cualquier termino fuera de ese conjunto se convierte en `[UNK]`, lo que provoca predicciones con alta confianza pero sin fundamento. La model card del autor advierte explicitamente de esta limitacion y recomienda, para uso real, hacer fine-tuning de un modelo preentrenado en espanol con datos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (BertForSequenceClassification), transformer encoder |
| Parametros totales | 20.546 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (tokenizer a nivel palabra, sin max_length documentado) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | espanol (limitado al vocabulario de 37 tokens del tokenizer) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder tipo BERT con 2 capas, 2 cabezas de atencion y dimension oculta de 32, sumando aproximadamente 20.500 parametros. La cabeza de clasificacion es `BertForSequenceClassification` con dos etiquetas (`negativo` = 0, `positivo` = 1). El tokenizer es de tipo `WordLevel`, con un vocabulario de 37 tokens, normalizacion a minusculas y eliminacion de tildes.

El entrenamiento se realizo desde cero (no fine-tuning) sobre un dataset sintetico de 368 comentarios generados a partir de 5 plantillas de frases y 16 adjetivos (8 positivos y 8 negativos). Se usaron 294 registros para entrenamiento y 74 para evaluacion. La funcion de perdida fue entropia cruzada, el optimizador AdamW con tasa de aprendizaje 0,001, 15 epocas y lotes de 16, sobre Hugging Face Transformers con PyTorch. No se documenta uso de RLHF, DPO ni tecnicas de alineacion. No hay innovaciones tecnicas destacables: el interes del modelo es precisamente su simplicidad y transparencia didactica.

## Capacidades

- Clasificacion binaria de texto corto en espanol: asigna la etiqueta `positivo` o `negativo` a comentarios sobre departamentos.
- Inferencia mediante `pipeline("text-classification")` de Transformers, compatible con Transformers 4 y 5.
- Publicacion completa de artefactos (modelo, tokenizer y scripts de entrenamiento/prediccion) como ejemplo reproducible.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta generacion de texto, codigo, matematicas, vision ni audio.
- Capacidad multilingue: no disponible; solo espanol dentro del vocabulario de 37 tokens.
- No dispone de modo thinking ni capacidades especiales.

## Casos de uso

- Docencia de publicacion de modelos: sirve para que estudiantes vean que un repositorio de Hugging Face incluye `config.json`, `model.safetensors`, `tokenizer.json`, `tokenizer_config.json` y scripts, y por que el modelo y el tokenizer son inseparables.
- Demostracion de tokenizacion a nivel palabra: permite ilustrar en clase como una frase fuera del vocabulario se convierte en `[UNK] [UNK] [UNK] [UNK]` y como el modelo responde igualmente con alta confianza.
- Ejemplo de sobreajuste y evaluacion enganosa: el accuracy de 1,000 sobre 74 ejemplos con las mismas plantillas del entrenamiento sirve para explicar por que un resultado perfecto en test no implica generalizacion.
- Practica de inferencia con `pipeline`: los alumnos pueden cargar el modelo con `pipeline("text-classification", model="ericc12/04-transformers-clasificacion-texto")` y comprobar el formato de salida `[{'label': 'positivo', 'score': ...}]`.
- Punto de partida para fine-tuning real: el repositorio incluye `train.py` y `predict.py` como plantilla para sustituir el dataset sintetico por comentarios reales y partir de un modelo preentrenado en espanol.
- Ejemplo de despliegue ligero: por su tamano (20.546 parametros, repo de 0,0 GB) puede desplegarse en cualquier entorno, incluso CPU, como demostracion de endpoints compatibles con Text Embeddings Inference.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto |
|---|---|---|
| Accuracy | 1,000 | 74 comentarios sinteticos de test |

El autor advierte que este 1,000 es optimista: los comentarios de test usan las mismas plantillas y adjetivos que los de entrenamiento. No se han publicado resultados en MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 20.546 parametros y el repositorio ocupa 0,0 GB.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU sin problema.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, e incluso iGPU) y en CPU.
- Opciones de despliegue: `pipeline` de Transformers, Text Embeddings Inference (tag `text-embeddings-inference` y `endpoints_compatible` en el repo), y cualquier entorno con PyTorch y Transformers 4 o 5.
- Latencia y throughput: no disponibles; por el tamano del modelo se espera latencia despreciable, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| ericc12/04-transformers-clasificacion-texto | 20.546 | no disponible | MIT | Ejemplo pedagogico de clasificacion binaria |
| BERT-base multilingual (referencia generica) | ~178 M | 512 tokens | Apache 2.0 | Clasificacion y fine-tuning en produccion |
| BETO (BERT en espanol) | ~110 M | 512 tokens | MIT | Fine-tuning en espanol con vocabulario real |
| RoBERTa-base BNE (espanol) | ~125 M | 512 tokens | MIT | Clasificacion y NLP en espanol |

No se dispone de datos de benchmarks comparativos publicados para este modelo frente a las alternativas citadas. La comparativa se limita a parametros, contexto y licencia; el modelo aqui descrito no es funcionalmente comparable a los anteriores por su vocabulario de 37 tokens y su dataset sintetico.

## Limitaciones y advertencias

- Fines exclusivamente educativos; no apto para produccion.
- Vocabulario de solo 37 palabras: cualquier termino fuera de el se convierte en `[UNK]`, y el modelo responde igualmente con confianza alta (por ejemplo, `negativo (1.00)` ante frases sin sentido para el).
- No entiende negaciones ("no es luminoso") ni ironia, porque no aparecen en el dataset de entrenamiento.
- El accuracy de 1,000 es optimista: el test comparte plantillas y adjetivos con el entrenamiento.
- Sesgos conocidos: no documentados; el dataset sintetico de 16 adjetivos puede introducir sesgos de plantilla no analizados.
- Riesgo de alucinacion: alto en el sentido de predicciones seguras sobre entradas fuera de distribucion.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo no es funcionalmente utilizable fuera del ambito didactico.
- Caveat de produccion: modelo y tokenizer deben usarse juntos; publicar el modelo sin su tokenizer lo inutiliza, ya que los indices de vocabulario no coinciden con otro tokenizer.
- Para uso real, el autor recomienda fine-tuning de un modelo preentrenado en espanol con comentarios reales.

## Enlaces

- Hugging Face: https://huggingface.co/ericc12/04-transformers-clasificacion-texto
- Repositorio de archivos incluidos en el modelo: `config.json`, `model.safetensors`, `tokenizer.json`, `tokenizer_config.json`, `train.py`, `predict.py`, `requirements.txt`, `README.md`
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
