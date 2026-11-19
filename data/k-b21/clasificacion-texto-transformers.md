# K-B21/clasificacion-texto-transformers

## Resumen

El modelo `K-B21/clasificacion-texto-transformers` es un clasificador binario de texto en espanol desarrollado por el usuario K-B21 como ejemplo pedagogico para el Seminario de Actualizacion del IFTS N.º 18 (docente: Cynthia M. Villagra). Su funcion es etiquetar comentarios cortos sobre departamentos como `positivo` o `negativo`. No es un modelo de proposito general ni un modelo preentrenado reutilizable: es una demostracion didactica de que piezas componen la publicacion de un modelo en Hugging Face (arquitectura, pesos y tokenizer).

Tecnicamente se trata de un `BertForSequenceClassification` diminuto, entrenado desde cero, con 2 capas, 2 cabezas de atencion, dimension oculta de 32 y un total de 20.546 parametros segun los pesos en safetensors. El tokenizer es de tipo `WordLevel` con un vocabulario de solo 37 tokens, que pasa el texto a minusculas y elimina tildes. El dataset de entrenamiento es sintetico: 368 comentarios generados a partir de 5 plantillas y 16 adjetivos (8 positivos y 8 negativos), divididos en 294 registros de entrenamiento y 74 de evaluacion.

Su relevancia es exclusivamente educativa: sirve para ilustrar el flujo completo de entrenamiento, evaluacion y publicacion de un modelo con Transformers, y para advertir de forma explicita sobre el riesgo de confianza alta en predicciones erroneas cuando la entrada se sale de la distribucion de entrenamiento. No debe emplearse en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (`BertForSequenceClassification`), transformer encoder con 2 capas y 2 cabezas de atencion |
| Parametros totales | 20.546 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no se declara `max_position_embeddings` en la informacion) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en precision original) |
| Idiomas soportados | espanol (`es`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo BERT reducido al minimo: 2 capas, 2 cabezas de atencion, dimension de 32 y aproximadamente 20.500 parametros, con una cabeza de clasificacion de secuencia sobre 2 etiquetas (`negativo` = 0, `positivo` = 1). El tokenizer es `WordLevel` con 37 tokens, normaliza a minusculas y elimina tildes. Modelo y tokenizer son inseparables: los indices de entrada corresponden a posiciones de ese vocabulario concreto.

El entrenamiento es supervisado desde cero (no hay fine-tuning de un modelo preentrenado del Hub), con funcion de perdida de entropia cruzada calculada por el propio modelo al recibir `labels`, optimizador AdamW con tasa de aprendizaje 0,001, 15 epocas y lotes de 16, sobre PyTorch y Hugging Face Transformers. El dataset es sintetico: 368 comentarios generados en `train.py` a partir de 5 plantillas de frases y 16 adjetivos, con 294 registros para entrenamiento y 74 para evaluacion. No se documenta RLHF, DPO ni ninguna innovacion tecnica de inferencia (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Clasificacion binaria de texto corto en espanol: asigna `positivo` o `negativo` a un comentario.
- Inferencia mediante `pipeline("text-classification")` de Transformers, compatible con Transformers 4 y 5.
- Integracion con Text Embeddings Inference y endpoints compatibles (segun los tags del repositorio).
- Capacidad lexica limitada a las 37 palabras del vocabulario; el resto se mapea a `[UNK]`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta generacion de texto, codigo, matematicas, vision ni audio.
- No dispone de modo thinking ni de capacidades multimodales.
- Multilingue: no; solo espanol y con vocabulario cerrado.

## Casos de uso

- Docencia de pipelines de Transformers: usar el modelo como ejemplo minimo para explicar como se cargan pesos y tokenizer con `pipeline("text-classification", model="K-B21/clasificacion-texto-transformers")` y como se interpreta la salida `{'label': ..., 'score': ...}`.
- Demostracion de tokenizacion a nivel palabra: mostrar como frases fuera del vocabulario se convierten integramente en `[UNK]` y como el modelo aun asi devuelve una prediccion con score alto, para ilustrar el fallo silencioso en produccion.
- Practica de evaluacion y metricas: reproducir el calculo de accuracy sobre el split de 74 comentarios y discutir por que un 1,000 en test con plantillas compartidas es optimista.
- Ejemplo de publicacion de artefactos en el Hub: estudiar la estructura de `config.json`, `model.safetensors`, `tokenizer.json`, `tokenizer_config.json`, `train.py`, `predict.py` y `requirements.txt` como plantilla de repo.
- Prueba de integracion de endpoints: validar el despliegue de un clasificador minimo en Text Embeddings Inference o en un endpoint compatible para verificar el contrato de la API de clasificacion.
- Ejercicio de analisis de limitaciones: comparar su comportamiento con un modelo preentrenado en espanol con fine-tuning sobre comentarios reales, para justificar por que en un caso real no se entrena desde cero.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto |
|---|---|---|
| Accuracy | 1,000 | 74 comentarios de test (split sintetico) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El propio autor advierte que el accuracy de 1,000 es optimista porque los comentarios de test usan las mismas plantillas y adjetivos que los de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precision; con 20.546 parametros el modelo cabe holgadamente en CPU.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (por ejemplo, GTX 1650, RTX 3060, RTX 4090) lo ejecuta sin problema, e incluso CPU es suficiente.
- Cabe en cualquier GPU consumer y en entornos sin GPU (Colab gratuito, portatiles, contenedores ligeros).
- Opciones de despliegue: `transformers` con PyTorch, `pipeline` de Transformers, Text Embeddings Inference (segun tags) y endpoints compatibles.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia de milisegundos en CPU, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Proposito |
|---|---|---|---|---|---|
| K-B21/clasificacion-texto-transformers | 20.546 | no disponible | es | MIT | Ejemplo pedagogico de clasificacion binaria |
| BERT-base multilingue (referencia generica) | ~110 M | 512 | multilingue | Apache 2.0 | Clasificacion y fine-tuning en produccion |
| BETO (BERT en espanol) | ~110 M | 512 | es | Apache 2.0 | Fine-tuning para clasificacion en espanol |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada. La comparativa se limita a ordenes de magnitud de parametros y contexto; el modelo de K-B21 es tres ordenes de magnitud menor que un BERT-base y no es directamente comparable en calidad.

## Limitaciones y advertencias

- Fines exclusivamente educativos; no apto para produccion.
- Vocabulario de solo 37 palabras: cualquier termino fuera de el se convierte en `[UNK]` y el modelo sigue respondiendo con confianza alta (el autor documenta el caso "tiene una vista increible" clasificado como `negativo` con score 1,00).
- No entiende negaciones ("no es luminoso") ni ironia, porque las frases de entrenamiento no las contienen.
- Dataset sintetico basado en plantillas: el accuracy de test es optimista y no refleja generalizacion.
- Sesgos conocidos: no documentados en la informacion disponible; el sesgo derivado de 16 adjetivos y 5 plantillas es estructural y evidente.
- Riesgo de alucinacion de etiqueta: alta confianza en predicciones erroneas ante entradas fuera de distribucion.
- Limitaciones de idioma: solo espanol, con normalizacion que elimina tildes y pasa a minusculas.
- Licencia MIT: permite uso comercial segun los terminos de la licencia, pero el propio autor desaconseja su uso real; para produccion recomienda partir de un modelo preentrenado en espanol y hacer fine-tuning con comentarios reales.
- Modelo y tokenizer deben desplegarse juntos; publicar los pesos sin el tokenizer los hace inutilizables.

## Enlaces

- Hugging Face: https://huggingface.co/K-B21/clasificacion-texto-transformers
