# Luciano-felix26/gatogpt-router-v0.1

## Resumen

GatoGPT Router v0.1 es un clasificador de intenciones de muy bajo coste desarrollado por Luciano-felix26 para el proyecto Félix / GatoGPT. Su funcion es actuar como router previo: decide a que categoria pertenece un mensaje o un contenido recuperado de internet antes de invocar un modelo de lenguaje grande, evitando gastar tokens en peticiones que no lo requieren. No es un modelo generativo: solo asigna una de seis etiquetas (`comando`, `hardware`, `modelo`, `codigo`, `charla`, `offtopic`).

La implementacion es deliberadamente minimalista: 303.462 parametros entrenados desde cero en NumPy puro, sin PyTorch ni `transformers`, con un vocabulario de 6.212 features basadas en palabras, bigramas y trigramas de caracteres. El modelo ocupa 1.21 MB en float32 y el entrenamiento completo tarda aproximadamente 11 segundos en 2 vCPU, lo que lo hace viable en entornos muy restringidos como Termux o dispositivos de bajos recursos.

Es relevante por su enfoque de eficiencia extrema: demuestra que una tarea de enrutamiento bien delimitada puede resolverse con un modelo de trescientos mil parametros y una arquitectura de dos capas densas, sin dependencias de frameworks de deep learning. Esta pensado para integrarse en pipelines de agentes donde la latencia y el coste por inferencia son criticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EmbeddingBag(mean) → Dense(96) → ReLU → Dropout → Dense(6) |
| Parametros totales | 303.462 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (clasificador de texto, sin contexto definido) |
| Tipos de cuantizacion | no disponible (pesos en float32, 1.21 MB) |
| Idiomas soportados | es (rioplatense/neutro), en |
| Licencia | Apache-2.0 |
| Formato de pesos | `weights.npz` (NumPy, almacenado con git-lfs) |

## Arquitectura y entrenamiento

La arquitectura es un clasificador feed-forward de dos capas: una capa de embedding agregada por media (`EmbeddingBag` con reduccion `mean`) sobre un vocabulario de 6.212 features (palabras, bigramas y trigramas de caracteres), seguida de una capa densa de 96 unidades con activacion ReLU y dropout, y una capa de salida densa de 6 unidades correspondiente a las seis clases. El modelo se entreno desde cero en NumPy puro, sin pesos preentrenados ni frameworks de deep learning, con un optimizador Adam implementado a mano con weight decay desacoplado y clipping de gradientes.

Los datos de entrenamiento son sinteticos por plantillas mas semillas escritas a mano en espanol e ingles, con aumentacion que incluye erratas, mayusculas, emojis, URLs, hashtags y prefijos de plataforma. El split se realiza por familia de plantilla con hash estable, lo que permite medir generalizacion a redacciones no vistas. Los negativos de la clase `offtopic` provienen de titulares reales de Hacker News y de feeds de noticias en espanol (BBC Mundo, elDiario, El Pais), regenerables mediante `scripts/fetch_web_samples.py`. Se aplico dropout 0.40 y feature dropout 0.25, con 40 epocas maximas y early stopping por macro-F1 de validacion, semilla 1337 y sin GPU.

## Capacidades

- Clasificacion de intenciones en seis categorias: `comando`, `hardware`, `modelo`, `codigo`, `charla`, `offtopic`.
- Enrutamiento previo a un modelo grande para decidir si merece la pena invocarlo.
- Deteccion de invocaciones al bot (`@gatimage`, `@gativeo`, `@help`, `@felix`).
- Clasificacion de contenido de internet (titulares, feeds) como `offtopic` para filtrar ruido.
- Soporte bilingue espanol-ingles.
- Robusteza ante erratas, mayusculas, emojis, URLs, hashtags y prefijos de plataforma gracias a la aumentacion de entrenamiento.
- Inferencia en NumPy puro, sin dependencias de PyTorch ni `transformers`.
- CLI incluida para clasificacion suelta, desde archivo o stdin, con salida JSON opcional.
- No soporta tool calling, agentes multi-step, vision, audio ni generacion de texto.

## Casos de uso

- Enrutamiento de peticiones en un agente conversacional: el modelo decide si un mensaje entrante es un comando, una duda tecnica, charla o ruido antes de invocar el LLM principal, reduciendo el coste por token en peticiones que no lo necesitan.
- Filtrado de contenido de internet: clasifica titulares de feeds y Hacker News como `offtopic` para descartar ruido antes de procesarlo con un modelo grande, con una tasa de acierto del 86,67% sobre titulares ajenos.
- Deteccion de comandos del bot: identifica invocaciones como `@gatimage` o `@gativeo` para despachar directamente al handler correspondiente sin pasar por el LLM.
- Triaje de soporte tecnico: distingue entre consultas de `hardware` (ESP32, pines, flasheo) y `codigo` (Python, MicroPython, C, JS) para dirigir al recurso o documentacion adecuada.
- Despliegue en entornos restringidos: con 1.21 MB de pesos y dependencia unica de NumPy, puede ejecutarse en Termux, Raspberry Pi o dispositivos embebidos donde no cabe un transformer.
- Preprocesado en pipelines de bajo coste: al entrenar en 11 segundos en 2 vCPU, permite reentrenar el router con nuevas plantillas o categorias de forma iterativa sin infraestructura GPU.
- Abtencion controlada: con umbral `threshold=0.55` puede derivar a un menu o a un modelo grande cuando la confianza es baja, evitando clasificaciones erroneas con alta confianza.

## Benchmarks y rendimiento

| Conjunto | Que mide | Accuracy | Macro-F1 |
|---|---|---|---|
| Frases curadas de internet (78) | lenguaje real escrito a mano | 0,9359 | 0,9385 |
| Familias de plantilla no vistas (494) | generalizacion a redacciones nuevas | 0,7915 | 0,7845 |
| Titulares ajenos de internet (30) | falsos positivos sobre ruido | 0,8667 (como `offtopic`) | no disponible |

El primer conjunto es el mas representativo del uso real segun el autor. El segundo es mas exigente al contener familias de plantilla ausentes en entrenamiento. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, lo cual es esperable al tratarse de un clasificador y no de un modelo generativo.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; inferencia en CPU con NumPy.
- Memoria: 1.21 MB de pesos en float32, mas el vocabulario de 6.212 features.
- GPU recomendadas: ninguna; el modelo no usa GPU ni en entrenamiento ni en inferencia.
- Cabe en cualquier GPU consumer y en practicamente cualquier CPU, incluidos dispositivos ARM de bajos recursos.
- Opciones de despliegue: Python 3 + NumPy, CLI incluida (`python -m gatogpt.classify`, `python -m gatogpt.internet`), scripts `example.py` y `play.py`.
- Latencia y throughput: no disponible de forma explicita; el entrenamiento completo tarda aproximadamente 11 segundos en 2 vCPU, lo que sugiere inferencia en el orden de microsegundos a milisegundos por muestra.
- Requiere `git-lfs` si se descarga via `git clone` (el archivo `weights.npz` se almacena con LFS).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GatoGPT Router v0.1 | 303.462 | no disponible | Clasificacion de intenciones (6 clases) | Apache-2.0 | Hugging Face, 0 descargas |
| Clasificadores basados en transformers (p. ej. DistilBERT fine-tuned) | ~66 M | 512 tokens | Clasificacion de texto generica | Apache-2.0 / MIT | Amplia |
| Modelos de enrutamiento comerciales (p. ej. RouteLLM) | variable | variable | Enrutamiento entre LLMs | variable | Repositorios de investigacion |

No se dispone de comparativas publicadas con alternativas directas en la informacion proporcionada. La diferencia principal frente a clasificadores basados en transformers es el orden de magnitud en tamano (303 mil frente a decenas de millones de parametros) y la ausencia de dependencias de deep learning, a costa de un alcance mucho mas estrecho (seis clases y dominio especifico del proyecto Felix).

## Limitaciones y advertencias

- Es un router, no un modelo de lenguaje: no genera texto ni mantiene conversaciones.
- Entrenado con datos sinteticos: en frases muy alejadas del estilo del dataset puede equivocarse con confianza alta. Se recomienda umbral de abtencion (`threshold=0.55`) y derivar a un modelo grande o a un menu cuando la confianza sea baja.
- No es un moderador de contenido ni debe usarse para decisiones sobre personas.
- Cubre espanol rioplatense/neutro e ingles; otros idiomas estan fuera de alcance.
- El vocabulario se limita al corpus: palabras muy raras se representan por sus trigramas de caracteres, lo que puede degradar la clasificacion en dominios muy alejados.
- Las seis clases estan fuertemente acopladas al dominio del proyecto Felix/GatoGPT; no es un clasificador de intenciones general.
- Los titulares de terceros usados como negativos conservan sus licencias originales y no se redistribuyen en el repo (requiere regenerarlos con `scripts/fetch_web_samples.py`).
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion externa de la comunidad.
- La licencia Apache-2.0 permite uso comercial, pero el alcance funcional del modelo (seis clases de dominio especifico) limita su aplicabilidad fuera del proyecto original.

## Enlaces

- Hugging Face: https://huggingface.co/Luciano-felix26/gatogpt-router-v0.1
- Model card (README del repositorio): incluida en la pagina de Hugging Face
- Script de regeneracion de negativos: `scripts/fetch_web_samples.py` (referenciado en la model card, no enlazado externamente)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.
