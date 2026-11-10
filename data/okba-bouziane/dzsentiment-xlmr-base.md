# okba-bouziane/dzsentiment-xlmr-base

## Resumen

DzSentiment es un modelo de clasificación de sentimiento en tres clases (negativo, neutro, positivo) obtenido por fine-tuning de `FacebookAI/xlm-roberta-base` sobre texto de estilo conversacional y de atención al cliente en dariya argelina (en grafía árabe, latina o mixta), árabe, francés e inglés. Lo publica el autor independiente okba-bouziane junto con el repositorio de código, preparación de datos y evaluación DzSentiment. Con 278 millones de parámetros, es un encoder transformer de tamaño base, no un modelo generativo, y su función es etiquetar sentimiento, no producir texto.

El interés del modelo está en el tratamiento explícito de la dariya y el arabizi, variedades poco cubiertas por los modelos multilingües generales y que los clasificadores basados en TF-IDF manejan mal. El autor reporta una macro-F1 media de 0,704 en su conjunto de test frente a 0,591 de una línea base TF-IDF con regresión logística, y una comparación puntual en la que supera a `gpt-oss-120b` en modo zero-shot (0,699 frente a 0,639 sobre una muestra de 800 filas).

El modelo se distribuye con pesos safetensors y una versión ONNX cuantizada a 8 bits de 279 MB que puede ejecutarse en el navegador mediante Transformers.js, lo que lo hace apto para despliegues ligeros en el cliente o en CPU. La licencia es MIT y el contexto de entrenamiento es de 128 tokens por muestra.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza de clasificación de 3 clases |
| Parametros totales | 278.045.955 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (longitud máxima usada en entrenamiento) |
| Tipos de cuantizacion | ONNX Runtime dynamic quantization a 8 bits (`onnx/model_quantized.onnx`, 279 MB); pesos completos en safetensors |
| Idiomas soportados | ar, fr, en (con cobertura específica de dariya argelina en grafía árabe, latina y arabizi) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX (incluida variante cuantizada q8) |

## Arquitectura y entrenamiento

Se trata de un XLM-RoBERTa base, es decir, un transformer encoder con atención bidireccional y tokenizador SentencePiece multilingüe, al que se añade una cabeza lineal de clasificación sobre la representación del token especial `<s>` para producir tres logits (negativo, neutro, positivo). No hay decodificación autoregresiva, ni modo de razonamiento, ni atención lineal: es un clasificador discriminativo.

El ajuste fino se realizó con 39.999 comentarios de YouTube en dariya del dataset `Abdou/dz-sentiment-yt-comments` (licencia MIT, partición 80/10/10 con semilla 42) y 1.839 tuits por idioma en árabe, francés e inglés del dataset `cardiffnlp/tweet_sentiment_multilingual` (particiones oficiales). Hiperparámetros: 3 épocas, learning rate 2e-5, batch de 32, decaimiento lineal con 6 % de warmup, máximo de 128 tokens, precisión fp16 y una única GPU Kaggle T4 con un tiempo de entrenamiento de 9,5 minutos. La época final se seleccionó por validación. No se documenta RLHF, DPO ni aumento de datos.

## Capacidades

- Clasificación de sentimiento en tres clases (negativo, neutro, positivo) sobre texto corto.
- Comprensión de dariya argelina en grafía árabe, en grafía latina (arabizi) y en mezcla de ambas.
- Clasificación multilingüe en árabe, francés e inglés con el mismo cabezal.
- Inferencia en navegador mediante Transformers.js con pesos ONNX q8.
- Compatible con Text Embeddings Inference y con endpoints de Hugging Face (`endpoints_compatible`).
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión ni audio: es un modelo de clasificación.

## Casos de uso

- Moderación y triaje de comentarios en redes sociales: el modelo etiqueta en milisegundos comentarios de YouTube o publicaciones en dariya y árabe, permitiendo priorizar los negativos para revisión humana. Su entrenamiento sobre comentarios de YouTube lo alinea con ese registro.
- Análisis de satisfacción en atención al cliente argelina: clasificación de mensajes de chat o correo en dariya, francés y árabe para alimentar paneles de sentimiento; el autor advierte que el dominio de entrenamiento no es una bandeja de entrada real, por lo que conviene validar con una muestra propia.
- Procesamiento por lotes en CPU sin GPU: con 278 M de parámetros y la variante ONNX q8, el modelo puede ejecutarse en servidores modestos o en el navegador del usuario, útil para extensiones o widgets de feedback.
- Enrutamiento de reseñas de comercio electrónico: clasificar opiniones en árabe y francés para derivar las negativas al equipo de soporte y las positivas a marketing.
- Monitorización de marca en redes: análisis de tuits y comentarios multilingües del Magreb y de mercados francófonos, donde los modelos entrenados solo en inglés pierden matices del arabizi.
- Filtrado previo en pipelines de datos: descartar o etiquetar grandes volúmenes de texto antes de pasarlos a un modelo generativo más caro, reduciendo coste y latencia.
- Investigación sobre variedades dialectales: línea base reproducible para estudiar dariya y arabizi, con código y particiones publicadas en el repositorio del autor.

## Benchmarks y rendimiento

Resultados de test reportados por el autor (macro-F1):

| Sistema | Dariya | Árabe | Francés | Inglés | Media de 4 |
|---|---|---|---|---|---|
| TF-IDF + regresión logística | 0,760 | 0,490 | 0,565 | 0,549 | 0,591 |
| DzSentiment XLM-R base | 0,783 | 0,622 | 0,719 | 0,692 | 0,704 |
| ONNX q8 (mismo modelo) | 0,774 | 0,636 | 0,706 | 0,700 | 0,704 |
| `gpt-oss-120b` zero-shot (muestra de 800 filas) | no disponible | no disponible | no disponible | no disponible | 0,639 |

Conjunto de test: 5.000 comentarios en dariya y 870 / 862 / 870 tuits en árabe, francés e inglés respectivamente. En la variante ONNX q8, el 8,8 % de las etiquetas individuales difieren de la versión en precisión completa, aunque la macro-F1 media se mantiene en 0,704. No se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.) en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: viable con los pesos safetensors en fp32 (aprox. 1,1 GB en memoria) y más ligera con ONNX q8 (279 MB en disco).
- VRAM estimada en GPU: alrededor de 1,5-2 GB en fp16 para los pesos completos, incluyendo activaciones de batch pequeño; la variante ONNX q8 ronda los 400-600 MB.
- GPU recomendadas: cualquier GPU consumer moderna sirve; una RTX 3060, RTX 4060 o superior ofrece holgura. En centros de datos, T4, L4, A10 o A100 funcionan sin problema, aunque el modelo no aprovecha su capacidad.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU con al menos 2 GB de VRAM, e incluso en iGPU o en el navegador con WebGPU/WASM.
- Opciones de despliegue: `transformers` (pipeline de text-classification), ONNX Runtime, Transformers.js, Text Embeddings Inference y endpoints de Hugging Face. No se documenta soporte de vLLM ni llama.cpp, que no aplican a un encoder de clasificación.
- Latencia y throughput: no disponibles de forma medida; el autor solo reporta el tiempo de entrenamiento (9,5 minutos en una T4).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| DzSentiment XLM-R base | 278 M | 128 tokens | ar, fr, en, dariya | MIT | Macro-F1 0,704 en el test del autor |
| `FacebookAI/xlm-roberta-base` | 278 M | 512 tokens | 100 idiomas | MIT | Modelo base sin ajuste; no clasifica sentimiento por sí solo |
| TF-IDF + regresión logística (línea base del autor) | no aplica | no aplica | depende del corpus | no disponible | Macro-F1 0,591 en el mismo test |
| `cardiffnlp/twitter-xlm-roberta-base-sentiment` | ~278 M | 128 tokens | multilingüe | no disponible en esta ficha | Clasificador de sentimiento en tuits; no cubre dariya de forma específica |

La comparación con `gpt-oss-120b` en zero-shot (0,639 frente a 0,699) procede de una muestra de 800 filas y no constituye un benchmark sistemático.

## Limitaciones y advertencias

- Dominio de entrenamiento desplazado: la dariya proviene de comentarios de YouTube sobre temas variados y el resto de idiomas de tuits, por lo que el rendimiento en una bandeja de entrada real de atención al cliente puede diferir del reportado.
- Los tuits en árabe proceden de muchos países árabes, no solo de Argelia, lo que diluye la especificidad dialectal.
- La clase neutra es la más débil en todos los idiomas según el autor.
- Entrenamiento con una sola semilla: no hay estimación de varianza entre ejecuciones.
- Ventana de 128 tokens: textos largos se truncan, con posible pérdida de información.
- Riesgo de error en ironía, sarcasmo y arabizi muy creativo o con code-switching intenso, no evaluado de forma específica.
- La cuantización q8 altera el 8,8 % de las etiquetas individuales respecto a fp16, aunque la métrica agregada se mantiene.
- Licencia MIT: permite uso comercial y modificación con atribución; conviene conservar el aviso de copyright.
- No es un modelo generativo: no debe usarse para responder al usuario ni para tareas de razonamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/okba-bouziane/dzsentiment-xlmr-base
- Repositorio de código, datos y evaluación: https://github.com/okba-bouziane/DzSentiment
- Demo en el navegador: https://huggingface.co/spaces/okba-bouziane/DzSentiment
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Dataset de dariya: https://huggingface.co/datasets/Abdou/dz-sentiment-yt-comments
- Dataset multilingüe de tuits: https://huggingface.co/datasets/cardiffnlp/tweet_sentiment_multilingual
