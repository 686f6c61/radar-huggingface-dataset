# asemqaffaf/AsemLLM

## Resumen

AsemLLM es un modelo de lenguaje neuronal a nivel de palabra desarrollado por el usuario asemqaffaf y publicado en Hugging Face bajo licencia Apache-2.0. Se trata de un modelo de juguete (toy model) de 152.903 parámetros entrenado desde cero íntegramente en Erlang, sin emplear ningún framework de deep learning: los gradientes se calculan en paralelo mediante procesos worker supervisados. El repositorio contiene los pesos entrenados, el vocabulario y un pequeño cargador de referencia en numpy.

La arquitectura no es un transformer, sino un modelo de lenguaje de tipo MLP con embeddings al estilo Bengio, con una ventana de contexto de solo 5 tokens, tamaño de embedding de 24 y capa oculta de 64 con activación tanh. El vocabulario es de 1.631 tokens a nivel de palabra. El modelo fue entrenado sobre aproximadamente 34.904 tokens de diálogos sintéticos breves con formato `User:` / `Assistant:` generados por un modelo de instrucciones local de 4B parámetros.

Su relevancia es exclusivamente educativa: sirve para ilustrar cómo funciona un modelo de lenguaje a pequeña escala y cómo implementar entrenamiento con paralelismo de datos en Erlang. El propio autor advierte que no comprende preguntas y que sus respuestas suelen ser irrelevantes respecto al prompt, por lo que no es apto para ninguna aplicación real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP con embeddings (estilo Bengio), no transformer |
| Parametros totales | 152.903 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 5 tokens |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo implementa una arquitectura de lenguaje neuronal clásica: `logits = W2 · tanh(W1 · concat(embedding[last 5 tokens]) + b1) + b2`. Toma los embeddings de los últimos 5 tokens, los concatena y los pasa por una capa oculta de 64 unidades con activación tanh, seguida de una proyección a la distribución sobre el vocabulario de 1.631 tokens. El vocabulario es a nivel de palabra e incluye palabras con su espacio inicial, puntuación y salto de línea, con `<unk>` como id 0. Los pesos almacenados son `embedding`, `w1`, `b1`, `w2` y `b2`.

El entrenamiento se realizó en Erlang con 10 procesos worker en paralelo sobre un Apple M1 Pro, en aproximadamente 13 minutos. Se usó el optimizador Adam con learning rate 0.005 con decaimiento lineal hasta el 10%, batch de 128, recorte de gradiente en 5 y 3.000 pasos, conservando el checkpoint con mejor pérdida de validación. Los datos de entrenamiento consisten en unos 34.904 tokens (138 KB) de conversaciones sintéticas breves sobre temas cotidianos (cocina, jardinería, viajes, estudio, aficiones), escritas por un modelo de instrucciones local de 4B parámetros, sin scraping web ni datos personales. El 10% final del texto se reservó como conjunto de validación. No se emplearon técnicas de RLHF ni DPO.

## Capacidades

- Generación de texto a nivel de palabra en inglés con formato de diálogo `User:` / `Assistant:`.
- Reproducción del estilo de las conversaciones sintéticas de entrenamiento (tono conversacional breve).
- Generación condicionada por los últimos 5 tokens de contexto.
- Muestreo con temperatura y semilla configurables mediante el cargador de referencia (`temperature`, `seed`).
- No dispone de tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües más allá del inglés.
- No dispone de modo de razonamiento (thinking), visión ni audio.

## Casos de uso

- Docencia sobre fundamentos de modelos de lenguaje: permite mostrar de forma tangible la diferencia entre un modelo n-grama y una red neuronal pequeña, comparando perplejidades (unigrama 171, bigrama 53, AsemLLM 42).
- Ejemplo de entrenamiento desde cero sin frameworks: el código en Erlang ilustra paralelismo de datos con procesos worker supervisados y cálculo manual de gradientes.
- Demostración de tokenización a nivel de palabra: útil para explicar vocabularios, tokens `<unk>` y el tratamiento de puntuación y espacios.
- Práctica de carga de pesos en safetensors: el cargador en numpy sirve como ejercicio introductorio para leer tensores y ejecutar un forward pass manual.
- Ilustración de sobreajuste: con solo 138 KB de texto, la pérdida de entrenamiento baja a ~1.3 mientras la de validación se estanca en 3.73, un caso claro de memorización de frases.
- Estudio de las limitaciones de los datos sintéticos: el modelo hereda la repetitividad y los errores del modelo de 4B que generó el corpus, lo que permite analizar sesgos de destilación sintética.
- Prototipado de infraestructura de serving en Erlang: el modelo se sirve íntegramente en Erlang, por lo que puede usarse como banco de pruebas de arquitecturas de servicio ligeras.

## Benchmarks y rendimiento

Evaluación sobre el conjunto de validación (último 10% del texto), entropía cruzada por token (menor es mejor):

| Modelo | Loss | Perplejidad |
|---|---|---|
| Unigrama (frecuencias de palabra) | 5.14 | 171 |
| Bigrama (palabra anterior) | 3.98 | 53 |
| AsemLLM | 3.73 | 42 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos en float32 (152.903 parámetros × 4 bytes ≈ 0,6 MB), más el vocabulario y el cargador.
- GPU recomendadas: no requiere GPU; el modelo se ejecuta en CPU sin problema.
- Cabe en cualquier GPU consumer e incluso en dispositivos de muy bajos recursos; también se ejecuta en CPU.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama, LM Studio ni `transformers`, ya que usa una arquitectura propia. El despliegue se realiza mediante el script `asemllm.py` incluido en el repositorio (requiere numpy, safetensors y huggingface_hub) o a través del servidor en Erlang del autor.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera que sean muy bajos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| AsemLLM | 152.903 | 5 tokens | Apache-2.0 | Hugging Face (repo propio) |
| GPT-2 small | ~124 M | 1.024 tokens | MIT | Hugging Face, transformers |
| TinyStories-1M | ~1 M | 512 tokens | MIT | Hugging Face, transformers |

La comparativa se limita a modelos pequeños de referencia; no se dispone de datos de rendimiento comparables entre ellos en la información proporcionada. AsemLLM es entre dos y tres órdenes de magnitud menor en parámetros que las alternativas citadas y no es compatible con el ecosistema estándar de inferencia.

## Limitaciones y advertencias

- Contexto extremadamente corto (5 tokens): las respuestas suelen no guardar relación con la pregunta.
- Entrenado con solo 138 KB de texto: memoriza frases y generaliza mal (pérdida de validación estancada en 3.73 frente a 1.3 de entrenamiento).
- Solo inglés y vocabulario centrado en ASCII; no cubre otros idiomas ni caracteres no ASCII de forma robusta.
- Sin entrenamiento de seguridad: las salidas reflejan el texto sintético de entrenamiento y pueden contener afirmaciones falsas expresadas con seguridad.
- Hereda la repetitividad y los errores del modelo de 4B que generó el corpus.
- No es compatible con `transformers`, llama.cpp, Ollama ni LM Studio; requiere el cargador propio.
- No apto para ninguna aplicación real; el propio autor lo describe como un modelo de juguete con fines educativos.
- Licencia Apache-2.0: permite uso comercial, pero las limitaciones técnicas hacen inviable cualquier uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asemqaffaf/AsemLLM
