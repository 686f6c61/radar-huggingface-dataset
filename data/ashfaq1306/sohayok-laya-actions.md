# ashfaq1306/sohayok-laya-actions

## Resumen

Sohayok-laya-actions es un modelo de clasificación de texto (un "decider" de intenciones) afinado a partir de `algolyzer/laya-bangla`, que a su vez es un fine-tune en bengalí de Laya (`convaiinnovations/laya-multilingual`), un mmBERT-base con cabeza de decisión tipada creado por Convai Innovations. Lo desarrolla el autor independiente `ashfaq1306` como componente central de Sohayok, un asistente de voz para escritorio Windows que acepta órdenes en bengalí, inglés y banglish ("Tammy, ক্রোম খোলো"). El modelo resuelve un problema muy concreto: dado el texto que el usuario acaba de dictar, elegir una de 28 acciones de escritorio (abrir una aplicación, cambiar el volumen, reproducir YouTube, consultar el tiempo, gestionar recordatorios, ficheros, ventanas, GitHub, responder una pregunta, charla trivial o una tarea de varios pasos) y delegar después el rellenado de argumentos a un modelo de lenguaje pequeño.

Con 321,9 millones de parámetros y un repositorio de 0,7 GB, es un modelo deliberadamente pequeño: la model card reporta entre 15 y 60 ms por decisión en GPU y unos 160 ms en CPU, lo que permite ejecutarlo en el mismo portátil que controla el escritorio. Su relevancia está en el enfoque híbrido: en lugar de pedirle a un LLM de 4B que elija entre 48 herramientas (70,7 % de acierto), se usa este clasificador para decidir la acción y un `qwen3.5:2b` solo para los argumentos, alcanzando un 91,4 % de herramienta correcta. La licencia es Apache-2.0 y los idiomas soportados son bengalí (bn) e inglés (en).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mmBERT-base (encoder transformer) con cabeza de decisión tipada; fine-tune de `algolyzer/laya-bangla` |
| Parametros totales | 321.908.998 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no se documentan variantes GGUF, int8 ni int4) |
| Idiomas soportados | bn (bengalí) y en (inglés); incluye banglish (bengalí transcrito en alfabeto latino) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (0,7 GB de repositorio) |
| Libreria de carga | `laya` (versión de entrenamiento: Laya 0.4.11) |
| Pipeline | text-classification |
| Numero de clases | 28 acciones de escritorio (definidas en `actions.json`) |
| Modelo base | `algolyzer/laya-bangla` @ `caeb5631ddfe0efe0f2937aeeae06f8d2d1cf6da` |

## Arquitectura y entrenamiento

La arquitectura es un encoder mmBERT-base con una cabeza de decisión tipada: el modelo no genera texto libre, sino que responde a una pregunta de tipo elección ("ব্যবহারকারী কম্পিউটারকে কোন কাজটি করতে বলছেন?") seleccionando una opción entre un conjunto de criterios declarados en `actions.json`, devolviendo además una probabilidad (`answer_confidence`) calibrada por temperatura sobre el conjunto de validación. La pregunta desplegada difiere de las formulaciones usadas en entrenamiento de forma deliberada, de modo que el modelo no dependa de un enunciado exacto.

Los datos combinan peticiones reales y sintéticas. Por un lado, los splits de entrenamiento de MASSIVE `bn-BD` y `en-US` (FitzGerald et al., 2022), con 60 intenciones mapeadas a acciones y las intenciones que un PC no puede ejecutar redirigidas a `other`, con tope por clase. Por otro, 1.301 plantillas de órdenes de escritorio en bengalí, banglish e inglés, descartando las generadas que superaban el 90 % de similitud con un comando de benchmark y completando hasta un mínimo de 400 ejemplos por acción con prefijos y sufijos de cortesía. El resultado son 22.348 ejemplos de entrenamiento y 4.196 de validación. El ajuste se hizo con `laya.train`: embeddings de tokens congelados, entropía cruzada suave con label smoothing de 0,05, opciones de elección barajadas, AdamW (encoder 3e-5, cabeza 1e-4), 2 épocas y selección por pérdida de validación (época 2: 88,3 % de accuracy de validación). Coste: 65 minutos en una RTX 4060 con un pico de 3,2 GB.

## Capacidades

- Clasificación de intención en 28 acciones de escritorio predefinidas, con salida de etiqueta más probabilidad calibrada.
- Enrutado de órdenes de voz ya transcritas a texto por un ASR previo, en bengalí, inglés y banglish mezclados en la misma frase.
- Soporte de preguntas de elección parametrizables: el conjunto de opciones y sus descripciones se inyectan en tiempo de inferencia mediante `actions.json`, no están fijados en los pesos.
- Señal de confianza utilizable para enrutado condicional: las decisiones con probabilidad máxima ≥ 0,7 (93 % de las peticiones) aciertan el 95,7 % de las veces, mientras que el resto baja al 41 %, lo que permite derivar los casos dudosos a un agente de respaldo.
- Distinción entre acciones simples, tareas de varios pasos y consultas que debe resolver un LLM (`question`, `small talk`, `multi-step`).
- No cubre generación de texto, razonamiento libre, código, matemáticas, visión ni tool calling genérico: es exclusivamente un decisor de acción.
- Latencia adecuada para integración interactiva: 15-60 ms en GPU y ~160 ms en CPU por decisión.

## Casos de uso

- Asistente de voz de escritorio (Sohayok): el modelo recibe la transcripción del usuario y devuelve la acción a ejecutar; un SLM posterior (`qwen3.5:2b`) rellena los argumentos concretos. Con este esquema se alcanza un 91,4 % de herramienta correcta frente al 70,7 % de un `qwen3.5:4b` eligiendo entre las 48 herramientas por sí solo.
- Reducción de coste en pipelines con LLM: al resolver el enrutado con 321,9 M de parámetros a 15-60 ms, se evita enviar cada turno de voz a un modelo generativo grande, reservándolo solo para la extracción de parámetros.
- Enrutado de intenciones en atención al cliente bilingüe bn/en: el entrenamiento sobre MASSIVE permite reutilizar el modelo como clasificador de intenciones de dominio general (60 intenciones del corpus) sin reentrenar desde cero.
- Automatización de escritorio y RPA ligera en Windows: abrir aplicaciones, controlar volumen, gestionar ventanas, recordatorios, ficheros o consultar el tiempo, con un umbral de confianza que evita ejecutar acciones dudosas.
- Ejecución local en portátiles sin GPU: con ~160 ms por decisión en CPU y un peso de 0,7 GB, el modelo cabe en equipos de usuario final y no requiere conexión ni servicio externo.
- Enrutado con fallback supervisado: usando el umbral de 0,7 sobre la probabilidad superior, el 93 % de las peticiones se resuelven directamente y el 7 % restante se deriva a un agente más caro, lo que da un control explícito del equilibrio entre latencia y precisión.
- Evaluación y depuración de asistentes de voz multilingües: sirve como banco de pruebas de normalización de banglish y de mapeo de intenciones MASSIVE a acciones concretas.

## Benchmarks y rendimiento

Benchmark de 478 peticiones: enunciados de test de MASSIVE `bn-BD` y `en-US` para las 18 intenciones que se mapean a acciones de escritorio (418) más 60 comandos de escritorio escritos a mano en bengalí, inglés y banglish.

| Decisor | Global | MASSIVE test | Escritorio | Bengalí | Inglés |
| --- | ---: | ---: | ---: | ---: | ---: |
| `algolyzer/laya-bangla`, zero-shot | 63,4 % | 65,1 % | 51,7 % | 65,3 % | 61,5 % |
| **Este modelo** | **91,8 %** | **92,3 %** | **88,3 %** | **91,6 %** | **92,1 %** |

Rendimiento en el pipeline completo de Sohayok sobre las mismas peticiones:

| Configuracion | Herramienta correcta (global) | Bengalí |
| --- | ---: | ---: |
| Este decisor + `qwen3.5:2b` para argumentos | 91,4 % | 90,8 % |
| `qwen3.5:4b` eligiendo entre las 48 herramientas por sí solo | 70,7 % | 65,7 % |

Calibración de la confianza: las decisiones con probabilidad superior ≥ 0,7 (93 % de las peticiones) son correctas el 95,7 % de las veces; el 7 % restante, solo el 41 %. No se han publicado intervalos de confianza ni resultados de MMLU, HumanEval o GSM8K (el modelo no es generativo).

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de 321,9 M de parámetros: ~1,3 GB en fp32, ~0,65 GB en fp16/bf16 y ~0,35 GB en int8, más el overhead del runtime. El autor no publica cifras de VRAM de inferencia; la referencia documentada es el pico de 3,2 GB durante el entrenamiento en una RTX 4060.
- GPU recomendadas: cualquier GPU consumer reciente sirve; el entrenamiento se completó en una RTX 4060 (65 minutos). No se documentan requisitos para A100/H100, innecesarios por tamaño.
- Cabe en GPU consumer y también en CPU: ~160 ms por decisión sin acelerador, lo que habilita despliegue en portátiles Windows de gama media.
- Opciones de despliegue: la única vía documentada es la librería `laya` (`laya.load(repo)` + `agent.predict(...)`), con descarga de `actions.json` vía `huggingface_hub`. No hay soporte documentado en vLLM, llama.cpp, Ollama ni TGI; el formato incluye una cabeza de decisión tipada que no es un `ForCausalLM` ni un `ForSequenceClassification` estándar de transformers.
- Latencia: 15-60 ms por decisión en GPU y ~160 ms en CPU. Throughput no disponible.
- Reproducibilidad del entrenamiento: `uv run sohayok setup --train-decider` en el repositorio de Sohayok; detalles en `train_report.json`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision en el benchmark | Licencia | Disponibilidad |
| --- | --- | --- | --- | --- | --- |
| **sohayok-laya-actions** | 321,9 M | no disponible | 91,8 % global / 88,3 % escritorio | Apache-2.0 | HuggingFace, librería `laya` |
| `algolyzer/laya-bangla` (zero-shot) | no disponible | no disponible | 63,4 % global / 51,7 % escritorio | Apache-2.0 (heredada) | HuggingFace |
| `qwen3.5:4b` (48 herramientas, sin decisor) | ~4B (nominal en el nombre) | no disponible | 70,7 % herramienta correcta / 65,7 % bengalí | no disponible | no disponible |
| `qwen3.5:2b` + este decisor | ~2B + 321,9 M | no disponible | 91,4 % herramienta correcta / 90,8 % bengalí | no disponible | no disponible |

La comparación no es completamente homogénea: este modelo elige entre 28 acciones y los LLM de la tabla eligen entre 48 herramientas, por lo que los porcentajes de la columna de precisión no son directamente equivalentes. La ventaja principal no es solo de acierto, sino de latencia (15-60 ms frente a la inferencia de un LLM de 2-4B) y de tamaño (0,7 GB de repositorio).

## Limitaciones y advertencias

- Sesgo de evaluación en la columna "Escritorio": los 60 comandos de prueba los escribió el mismo desarrollador que las plantillas de entrenamiento, por lo que ese 88,3 % es optimista.
- Un único entrenamiento y sin intervalos de confianza; no hay garantía de que los resultados se reproduzcan con otra semilla o configuración.
- El 41 % de acierto en las decisiones con confianza < 0,7 hace imprescindible un mecanismo de fallback; usar el modelo sin umbral de confianza degrada notablemente la precisión efectiva.
- No es un modelo generativo: no produce texto, código, razonamiento ni respuestas. Confundirlo con un LLM produce resultados inutilizables.
- Solo cubre 28 acciones predefinidas en `actions.json`. Añadir acciones requiere reentrenar o validar el comportamiento con el nuevo conjunto de opciones, ya que el número y la formulación de las opciones afectan a la decisión.
- Idiomas limitados a bengalí e inglés (con banglish informal); no se documenta comportamiento en otras lenguas ni en bengalí formal o dialectal fuera de MASSIVE.
- Riesgo de error de enrutado (equivalente a alucinación en este contexto): seleccionar una acción plausible pero incorrecta, especialmente en comandos ambiguos o con ruido de transcripción del ASR.
- Sesgos heredados de MASSIVE y de las plantillas sintéticas, que provienen de un único autor y pueden no representar la distribución real de órdenes de usuario.
- Licencia Apache-2.0 permite uso comercial, pero el entrenamiento usa MASSIVE (CC BY 4.0, FitzGerald et al., 2022) y los datos de `laya-bangla`, cuyas atribuciones deben conservarse.
- El formato de pesos y la cabeza de decisión tipada atan el despliegue a la librería `laya`; no hay ruta documentada a runtimes estándar de inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ashfaq1306/sohayok-laya-actions
- Modelo base: https://huggingface.co/algolyzer/laya-bangla
- Laya multilingual (Convai Innovations): https://huggingface.co/convaiinnovations/laya-multilingual
- Repositorio de Sohayok: https://github.com/Ashfaq1306/sohayok
- Especificación de acciones (`actions.json`, en el repositorio del modelo): https://huggingface.co/ashfaq1306/sohayok-laya-actions/blob/main/actions.json
- Informe de entrenamiento (`train_report.json`, en el repositorio del modelo): https://huggingface.co/ashfaq1306/sohayok-laya-actions/blob/main/train_report.json
- Dataset MASSIVE (mteb/amazon_massive_intent): https://huggingface.co/datasets/mteb/amazon_massive_intent
- Referencia del corpus MASSIVE: FitzGerald et al., 2022 (CC BY 4.0); URL del paper no disponible en la información proporcionada.
