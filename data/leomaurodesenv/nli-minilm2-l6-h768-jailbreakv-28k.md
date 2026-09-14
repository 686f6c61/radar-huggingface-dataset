# leomaurodesenv/nli-MiniLM2-L6-H768-jailbreakv-28k

## Resumen

`leomaurodesenv/nli-MiniLM2-L6-H768-jailbreakv-28k` es un modelo de clasificación de texto en inglés (etiqueta `text-classification`) publicado por el usuario leomaurodesenv. Se trata de un ajuste fino del cross-encoder `cross-encoder/nli-MiniLM2-L6-H768`, un encoder de tipo RoBERTa (así lo declara la etiqueta `roberta` del repositorio) con 82.119.938 parámetros totales (unos 82,1 millones) y pesos en formato safetensors. El identificador del modelo apunta a un ajuste orientado a la detección de intentos de jailbreak, presumiblemente sobre el conjunto JailbreakV-28K, aunque la model card no lo confirma y describe el conjunto de entrenamiento como "unknown dataset".

El problema que aborda es el de la clasificación binaria o multiclase de prompts maliciosos, una pieza habitual en las arquitecturas de guardarraíles (guardrails) que se colocan delante de un modelo generativo. Su interés práctico radica en el tamaño: al ser un encoder de 82 millones de parámetros, es viable ejecutarlo en CPU o en cualquier GPU de gama de entrada, con un coste por inferencia muy inferior al de los clasificadores de seguridad basados en modelos de 7B o 8B.

Ahora bien, la información publicada es muy incompleta. No hay idiomas declarados, no hay longitud de contexto documentada, no hay número de etiquetas ni mapeo de clases, no hay benchmarks en el `model-index` (la lista de resultados está vacía) y solo se declaran métricas de validación durante el entrenamiento, con exactitud 1,0 y pérdida 0,0000 desde la primera época. El modelo acumula 38 descargas y 0 "me gusta", por lo que carece de validación por parte de la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (etiqueta del repositorio); clasificador derivado del cross-encoder `cross-encoder/nli-MiniLM2-L6-H768` |
| Parametros totales | 82.119.938 (aproximadamente 82,1 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors, presumiblemente fp32; no se han publicado variantes GGUF, GPTQ, AWQ ni ONNX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con la librería transformers; etiquetas `text-embeddings-inference` y `endpoints_compatible`) |
| Tarea (pipeline) | text-classification |
| Modelo base | cross-encoder/nli-MiniLM2-L6-H768 |
| Tamaño del repositorio | 3,3 GB (muy superior al peso teórico de los pesos, ver sección de hardware) |
| Descargas / me gusta | 38 / 0 |
| Fecha de creación (declarada) | 2026-09-14 |
| Última actualización (declarada) | 2026-09-14 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer encoder de tipo RoBERTa con 82,1 millones de parámetros y representación oculta de 768 dimensiones (el sufijo `H768` del nombre del checkpoint base lo indica), sobre el que se añade una cabeza de clasificación de secuencias. La etiqueta `roberta` del repositorio y la librería declarada (`transformers`) sitúan el modelo en el ecosistema estándar de Hugging Face, sin innovaciones arquitectónicas propias: no hay mezcla de expertos, ni atención lineal, ni mecanismos de decodificación especulativa, ni modo de razonamiento.

El procedimiento de entrenamiento sí está documentado en la model card, aunque el conjunto de datos no: se indica literalmente que el ajuste se hizo "on an unknown dataset". Los hiperparámetros declarados son tasa de aprendizaje 2e-05, tamaño de lote de entrenamiento 8 con 2 pasos de acumulación de gradiente (lote efectivo 16), optimizador `adamw_torch_fused` con betas (0,9; 0,999) y epsilon 1e-08, planificador lineal con 50 pasos de calentamiento, 10 épocas y semilla 42. No se menciona ningún tipo de RLHF, DPO ni ajuste por preferencias, lo cual es coherente con un clasificador.

El detalle más relevante es la dinámica de entrenamiento declarada: la pérdida de entrenamiento pasa de 0,0002 en la época 1 a 0,0000 en la época 3, y la exactitud de validación es 1,0 en todas las épocas. Esto sugiere un problema de clasificación trivial, un conjunto de validación muy reducido, una fuga de datos entre entrenamiento y validación o un desequilibrio extremo de clases. El número de pasos por época (1121) implica aproximadamente 17.936 ejemplos de entrenamiento con lote efectivo 16, una cifra compatible con un subconjunto de un dataset de decenas de miles de ejemplos, pero es una inferencia a partir de los pasos declarados, no un dato confirmado.

## Capacidades

- Clasificación de texto: el modelo devuelve una etiqueta (y presumiblemente una puntuación) para una secuencia de entrada. El número de etiquetas y su significado no están documentados.
- Detección de prompts maliciosos: por el nombre del checkpoint, el uso previsto es la identificación de intentos de jailbreak o de elusión de políticas en entradas de texto.
- Clasificación de pares de secuencias heredada del modelo base: al derivar de un cross-encoder entrenado para inferencia de lenguaje natural (NLI), es plausible que conserve la capacidad de procesar pares premisa-hipótesis, aunque la model card no lo confirma y la cabeza de clasificación puede haber sido reemplazada.
- Generación de texto: no. Es un modelo exclusivamente de clasificación, sin cabeza de lenguaje.
- Razonamiento, matemáticas y código: no disponibles como tales; no son capacidades de un clasificador de este tipo.
- Tool calling / function calling: no soportado.
- Uso como agente o razonamiento multi-paso: no soportado.
- Capacidades multilingües: no disponibles (no se declara ningún idioma en el repositorio).
- Visión, audio o modo de pensamiento: no soportados.
- Integración como servicio: las etiquetas `text-embeddings-inference` y `endpoints_compatible` indican que el repositorio está preparado para desplegarse con Text Embeddings Inference y con los endpoints gestionados de Hugging Face.

## Casos de uso

- Guardarraíl de entrada en asistentes conversacionales: colocar el clasificador delante de un LLM para etiquetar cada mensaje del usuario y bloquear o derivar a revisión aquellos marcados como intento de jailbreak. Su tamaño de 82,1 M de parámetros permite ejecutarlo en la misma máquina que el modelo generativo sin competir por VRAM.
- Filtrado en cascada de coste variable: usar este modelo como primera etapa barata y reservar un clasificador mayor (por ejemplo, modelos de seguridad de 7B-8B) solo para los casos dudosos, reduciendo el coste medio por petición.
- Etiquetado masivo de corpus de seguridad: procesar grandes volúmenes de prompts procedentes de registros de red teaming o de tráfico de API para separar intentos de elusión de consultas legítimas antes de un análisis manual.
- Anotación asistida de datasets: preetiquetar ejemplos para que un anotador humano solo revise y corrija, acelerando la construcción de corpus de jailbreaks. El modelo puede ejecutarse en CPU, lo que abarata el proceso por lote.
- Monitorización y detección de abuso en producción: analizar en tiempo casi real el tráfico de entrada de una API pública para detectar patrones repetidos de manipulación y activar alertas o limitación de tasa.
- Investigación en robustez de clasificadores NLI: al ser un ajuste fino de `cross-encoder/nli-MiniLM2-L6-H768`, sirve como punto de partida para estudiar cómo se degrada o especializa un encoder NLI al reentrenarlo sobre datos de seguridad.
- Experimentación académica con recursos limitados: su huella de memoria (del orden de centenares de megabytes) permite reproducir experimentos de clasificación en portátiles o en entornos de CI sin GPU.
- Prueba de concepto de guardarraíl antes de invertir en infraestructura: validar el flujo completo (tokenización, umbrales, integración con el LLM) con un modelo pequeño antes de migrar a un clasificador mayor.

Advertencia transversal a todos estos casos: antes de cualquier uso en producción es obligatorio verificar el mapeo de etiquetas (`id2label`) y el número de clases, porque la model card no los documenta y un error de interpretación invertiría la decisión de bloqueo.

## Benchmarks y rendimiento

El `model-index` de la model card está publicado con la lista de resultados vacía:

> `"results": []`

Por tanto, **no se han publicado resultados de benchmarks en la informacion disponible** (ni MMLU, ni HumanEval, ni GSM8K, ni métricas de detección de jailbreak como tasa de falsos positivos o recall sobre JailbreakV-28K).

Lo único que el autor declara son las métricas de la evaluación interna durante el entrenamiento:

| Epoca | Paso | Perdida de entrenamiento | Perdida de validacion | Exactitud |
|---|---|---|---|---|
| 1,0 | 1121 | 0,0002 | 0,0001 | 1,0 |
| 2,0 | 2242 | 0,0001 | 0,0000 | 1,0 |
| 3,0 | 3363 | 0,0000 | 0,0000 | 1,0 |
| 4,0 | 4484 | 0,0000 | 0,0000 | 1,0 |
| 5,0 | 5605 | 0,0000 | 0,0000 | 1,0 |
| 6,0 | 6726 | 0,0000 | 0,0000 | 1,0 |
| 7,0 | 7847 | 0,0000 | 0,0000 | 1,0 |
| 8,0 | 8968 | 0,0000 | 0,0000 | 1,0 |
| 9,0 | 10089 | 0,0000 | 0,0000 | 1,0 |
| 10,0 | 11210 | 0,0000 | 0,0000 | 1,0 |

Resultado final declarado en la model card: pérdida 0,0000 y exactitud 1,0 sobre el conjunto de evaluación. No se especifica el tamaño de dicho conjunto, su composición ni su procedencia, por lo que la cifra no es interpretable como indicador de rendimiento real.

Versiones de framework declaradas en el entrenamiento: Transformers 5.2.0, PyTorch 2.10.0+cu128, Datasets 4.5.0, Tokenizers 0.22.2.

## Requisitos de hardware

- Tamaño de los pesos: con 82.119.938 parámetros, los pesos ocupan aproximadamente 328 MB en fp32, 164 MB en fp16/bf16 y 82 MB en int8. Estos cálculos son estimaciones aritméticas a partir del número de parámetros; no se han publicado variantes cuantizadas.
- Discrepancia con el repositorio: el repositorio ocupa 3,3 GB, muy por encima del tamaño de los pesos, lo que apunta a la presencia de checkpoints intermedios de las 10 épocas u otros artefactos no documentados.
- VRAM para inferencia: por debajo de 1 GB en fp32 y del orden de 0,5 GB en fp16, sumando activaciones y overhead del runtime para una longitud de secuencia moderada. Cifra orientativa, no medida.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente. En la práctica, NVIDIA T4, RTX 3060, RTX 4090, A100 o H100 quedan sobradamente dimensionadas; el modelo no aprovecha la capacidad de estas tarjetas.
- GPU de consumo: sí, cabe con holgura en cualquier GPU de consumo de los últimos años e incluso en iGPU con memoria unificada.
- CPU: es viable ejecutarlo en CPU para cargas de clasificación por lotes, dado el reducido número de parámetros del encoder.
- Opciones de despliegue: pipeline `text-classification` de transformers; Text Embeddings Inference (etiqueta `text-embeddings-inference` del repositorio); Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`); conversión a ONNX mediante Optimum, aunque no se publica ningún artefacto ONNX. vLLM admite modelos de clasificación basados en encoder, pero el repositorio no aporta una configuración específica ni pesos verificados para ese motor. llama.cpp y Ollama no son aplicables al no existir pesos en formato GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia por petición, tokens por segundo ni rendimiento por lote.

## Comparativa con modelos similares

En la información proporcionada no se identifican modelos comparables con datos verificables. La única referencia disponible es el checkpoint base del que deriva este ajuste, del cual se desconoce casi toda la ficha técnica:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| leomaurodesenv/nli-MiniLM2-L6-H768-jailbreakv-28k | 82.119.938 (dato real de safetensors) | no disponible | Apache 2.0 | Hugging Face, 38 descargas |
| cross-encoder/nli-MiniLM2-L6-H768 (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | Hugging Face |
| Otras alternativas de clasificacion de jailbreak | no disponible | no disponible | no disponible | no disponible |

Tampoco se dispone de resultados de benchmarks de este modelo ni del base que permitan establecer una comparación de rendimiento.

## Limitaciones y advertencias

- Rendimiento no demostrado: la exactitud de 1,0 y la pérdida de 0,0000 en todas las épocas y pasos son señales de alarma. Son compatibles con un conjunto de validación trivial, con fuga de datos entre particiones o con un desequilibrio de clases extremo. No debe tomarse como evidencia de calidad.
- Sin benchmarks públicos: el `model-index` está vacío. No hay evaluación sobre JailbreakV-28K ni sobre ningún otro conjunto independiente, ni métricas de falsos positivos y falsos negativos.
- Conjunto de datos no documentado: la model card afirma explícitamente que el entrenamiento se realizó sobre un conjunto desconocido ("on an unknown dataset"). Se desconoce la procedencia, la licencia de los datos y la distribución de clases.
- Etiquetas no documentadas: no se especifican el número de clases, sus nombres ni la interpretación de la salida. Integrarlo en producción sin verificar `config.id2label` puede invertir la decisión del clasificador.
- Idiomas no declarados: el repositorio no indica ningún idioma. El modelo base es un cross-encoder NLI de origen anglosajón, por lo que es probable que el rendimiento fuera del inglés sea deficiente, pero esto no está confirmado en la información disponible.
- Longitud de contexto desconocida: no se documenta la longitud máxima de secuencia. Los textos que la excedan serán truncados por el tokenizador, con la consiguiente pérdida de información en prompts largos, que son precisamente habituales en los intentos de jailbreak.
- Sesgos: no hay información sobre sesgos. Un clasificador de seguridad entrenado sobre datos no documentados puede sobrerreaccionar ante determinadas variedades dialectales, jerga o temas legítimos sensibles, generando falsos positivos con impacto en usuarios reales.
- Riesgo de alucinación: no aplica en sentido generativo, porque el modelo no genera texto. El riesgo equivalente es la clasificación errónea con alta confianza.
- Adopción marginal: 38 descargas y 0 "me gusta" en el momento de la consulta. Sin validación por parte de la comunidad ni informes de terceros.
- Licencia: Apache 2.0, que permite uso comercial y modificación, siempre que se conserve el aviso de licencia y se indique los cambios. Conviene comprobar además las condiciones de los datos de entrenamiento, que no se documentan y cuya licencia podría imponer restricciones adicionales sobre el modelo derivado.
- Madurez del ecosistema: requiere transformers 5.2.0 o superior según la model card, una versión mayor que la mayoría de los despliegues en producción, lo que puede complicar la integración con infraestructura existente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leomaurodesenv/nli-MiniLM2-L6-H768-jailbreakv-28k
- Modelo base: https://huggingface.co/cross-encoder/nli-MiniLM2-L6-H768
- Resultados de la búsqueda web: los resultados devueltos corresponden al portal de trámites del Institut National de la Propriété Industrielle (INPI) francés (`https://procedures.inpi.fr/`, `https://www.inpi.fr/`, `https://data.inpi.fr/`, `https://procedures.inpi.fr/?/account/presentation`). Ninguno de ellos guarda relación con el modelo, por lo que no se incluyen como enlaces relevantes.
- Paper, repositorio de código, blog o demo: no disponibles en la información proporcionada.
