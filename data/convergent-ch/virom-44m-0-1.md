# Convergent-ch/Virom-44M-0.1

## Resumen

Virom-44M-0.1 es un modelo de decisión (decision-model) desarrollado por Convergent-ch, concebido como prototipo local para clasificación de intenciones y selección entre opciones. Recibe un contexto, una pregunta y entre dos y doce opciones de respuesta, y devuelve la opción elegida junto con las probabilidades asociadas a cada alternativa. Está entrenado únicamente para inglés y alemán, con una ventana máxima de 256 tokens repartidos entre los campos de entrada.

Arquitecturalmente es un encoder de 44.188.417 parámetros, entrenado desde cero junto con su tokenizador y posteriormente afinado sobre una mezcla bilingüe de 90.540 ejemplos que combina datos públicos de clasificación de intenciones (MASSIVE) y de inferencia textual (XNLI) con ejemplos propios de enrutamiento de Convergent. Su interés radica en ofrecer una alternativa compacta y ejecutable en CPU para tareas de enrutamiento y selección, sin dependencia de APIs externas una vez instaladas las dependencias.

La relevancia actual del modelo es limitada pero concreta: ocupa el nicho de los clasificadores de decisión de muy bajo coste, con un checkpoint de 0,3 GB que puede correr offline en hardware modesto. No obstante, los propios resultados publicados por el autor lo sitúan como un prototipo experimental, con tasas de acierto moderadas y sensibilidad al orden y a la formulación de las opciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder tipo transformer (detalle de capas y dimensiones no disponible) |
| Parametros totales | 44.188.417 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens en total, repartidos entre contexto, pregunta y opciones |
| Tipos de cuantizacion | no disponible (el repo distribuye pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | aleman (de), ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (con tokenizador propio y runner Python incluido en el ZIP) |

## Arquitectura y entrenamiento

El modelo es un encoder de 44 millones de parámetros entrenado desde cero por Convergent, junto con su propio tokenizador. Sobre esa base se realizó un ajuste fino supervisado con una mezcla bilingüe de 90.540 ejemplos que incluye datos públicos de clasificación de intenciones (AmazonScience/massive), datos de inferencia textual (facebook/xnli), ejemplos del mix de entrenamiento original y ejemplos de enrutamiento propios del autor. No se documenta en la información disponible el uso de RLHF, DPO ni de técnicas de alineación adicionales.

La innovación diferencial no está en la arquitectura, sino en la formulación de la tarea: el modelo no genera texto libre, sino que puntúa un conjunto cerrado de entre 2 y 12 opciones dado un contexto y una pregunta, devolviendo la elección y las probabilidades. El paquete de inferencia se distribuye como un ZIP con un runner en Python (`decide.py`) que funciona offline con el checkpoint y el tokenizador incluidos, y admite ejecución en CPU o en CUDA. No se especifican detalles sobre el número de capas, dimensiones ocultas, cabezas de atención ni composición exacta del corpus de preentrenamiento.

## Capacidades

- Clasificación de intenciones en inglés y alemán sobre un conjunto cerrado de opciones.
- Selección de respuesta entre 2 y 12 alternativas, con salida de probabilidades por opción.
- Enrutamiento de peticiones (support routing) hacia categorías predefinidas, con revisión humana recomendada por el propio autor.
- Procesamiento de entradas cortas: máximo de 256 tokens sumando contexto, pregunta y opciones.
- Inferencia offline en CPU o GPU una vez instaladas las dependencias (PyTorch 2.3.1 y requisitos del paquete).
- Salida estructurada en JSON con la opción elegida y sus probabilidades.
- No soporta generación de texto libre, tool calling, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket como contexto y una lista de colas o categorías como opciones, y devuelve la cola más probable. Es adecuado por su coste mínimo y su capacidad de ejecutarse offline, aunque el autor advierte que requiere revisión humana.
- Clasificación de intenciones en asistentes de voz o chatbots: con un contexto breve del usuario y una pregunta del tipo "¿qué tipo de petición es esta?", el modelo elige entre intenciones predefinidas como clima, correo o volumen, tal como muestra el ejemplo de la model card.
- Filtrado previo en pipelines de atención al cliente: al ser un modelo de 44M parámetros, puede actuar como primera etapa de clasificación antes de invocar un LLM mayor, reduciendo coste y latencia en el enrutamiento inicial.
- Selección de FAQ o artículo de ayuda: dadas varias respuestas candidatas y la consulta del usuario, el modelo puntúa cada opción y permite escoger la más probable para mostrarla o para ordenar resultados.
- Etiquetado semiautomático de datos bilingües (alemán/inglés): útil para preanotar conjuntos de intenciones o pares de inferencia antes de una revisión humana, aprovechando su entrenamiento sobre MASSIVE y XNLI.
- Experimentación e investigación en modelos de decisión compactos: sirve como baseline reproducible para estudiar sensibilidad al orden de opciones y a la formulación, dado que el autor publica el informe de pruebas y los JSON de evaluación.
- Despliegue en entornos con recursos limitados o sin conectividad: el paquete offline con runner en Python y ejecución en CPU permite integrarlo en dispositivos o redes aisladas.

## Benchmarks y rendimiento

| Conjunto de evaluacion | Antes del ajuste fino | Tras el ajuste fino |
|---|---:|---:|
| Clasificación de intenciones en alemán (898 ejemplos) | 26,4% | 42,9% |
| Conjunto de evaluación adicional (2.794 ejemplos) | 29,0% | 38,4% |
| Conjunto de evaluación original (8.481 ejemplos) | 37,5% | 37,9% |
| Conjunto original, media por tipo de tarea | 34,8% | 32,6% |
| Enrutamiento de soporte en alemán (48 ejemplos con variantes de formulación) | 25,0% | 25,0% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los datos anteriores son los únicos reportados por el autor y corresponden a conjuntos de evaluación propios.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 44,2M de parámetros (unos 177 MB solo en pesos); el repo completo ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; el modelo está pensado para ejecutarse incluso en CPU.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en CPU sin GPU dedicada, tal como indica el ejemplo con `--device cpu`.
- Opciones de despliegue: el paquete oficial incluye un runner en Python (`decide.py`) con PyTorch 2.3.1; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Virom-44M-0.1 | 44,2M | 256 tokens | Clasificación de intenciones / selección entre opciones | no disponible | Hugging Face, paquete offline |
| Modelos de clasificación tipo BERT-base | ~110M | 512 tokens | Clasificación de texto general | variable según checkpoint | Hugging Face |
| Modelos de clasificación tipo DistilBERT | ~66M | 512 tokens | Clasificación de texto general | variable según checkpoint | Hugging Face |

No se dispone de datos de rendimiento comparables entre Virom-44M-0.1 y alternativas de la misma categoría en la información proporcionada, por lo que la comparativa se limita a parámetros, contexto y disponibilidad.

## Limitaciones y advertencias

- El propio autor lo califica como prototipo experimental: las elecciones pueden cambiar según la formulación y el orden de las opciones.
- El enrutamiento de soporte requiere revisión humana; en el conjunto de 48 ejemplos con variantes de formulación no se observó mejora tras el ajuste fino (25,0% en ambos casos).
- En la media por tipo de tarea del conjunto original, el ajuste fino empeoró el resultado (34,8% antes frente a 32,6% después).
- Ventana de contexto muy reducida: 256 tokens en total para contexto, pregunta y opciones, lo que limita entradas largas.
- Solo admite inglés y alemán; no hay soporte documentado de otros idiomas.
- La licencia no está disponible, por lo que no puede confirmarse el uso comercial ni las condiciones de redistribución.
- Riesgo de alucinación no aplicable en sentido estricto (no genera texto libre), pero sí de elección incorrecta entre opciones, especialmente con formulaciones ambiguas.
- No se documentan sesgos conocidos ni evaluación de sesgos en la información disponible.
- Dependencia de un runner Python propio incluido en el ZIP; no hay integración documentada con frameworks de serving estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Convergent-ch/Virom-44M-0.1
- Paquete de ejecución local: https://huggingface.co/Convergent-ch/Virom-44M-0.1/resolve/main/Virom-44M-0.1-run.zip
- Informe de pruebas completo: TEST_REPORT.md (referenciado en la model card)
- JSON de evaluación del ajuste fino: finetune.json (referenciado en la model card)
- Fuentes de datos de ajuste fino: fine-tuning-data.json (referenciado en la model card)
- Fuentes de entrenamiento original: training-data.json (referenciado en la model card)
- Dataset MASSIVE: https://huggingface.co/datasets/AmazonScience/massive
- Dataset XNLI: https://huggingface.co/datasets/facebook/xnli
