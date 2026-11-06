# ericrisco/gemma-maia-e4b

## Resumen

gemma-maia-e4b es un adaptador LoRA (entrenado mediante QLoRA con Unsloth) sobre el modelo Gemma 4 E4B en su variante instruct, desarrollado por el usuario ericrisco. Su objetivo es especializar un modelo generalista en el conocimiento factual y cultural de Andorra, incluyendo historia, instituciones, geografía, cultura y lengua catalana en su variedad andorrana. El proyecto se denomina "maia" y se distribuye como un repositorio de versiones etiquetadas, cada una correspondiente a una ejecución de entrenamiento; la versión descrita en la model card es `20261102-1437-e4b-k-canon`.

El adaptador tiene 7.518.069.290 parámetros totales según los pesos en safetensors (cifra que corresponde al modelo base completo más el adaptador, dado que PEFT serializa la estructura del modelo subyacente). Se distribuye bajo licencia Apache 2.0 y está orientado exclusivamente a generación de texto conversacional en catalán. El autor lo marca explícitamente como experimental y no definitivo.

La relevancia del proyecto reside en su enfoque de dominio muy acotado: demuestra cómo un ajuste fino ligero sobre un modelo pequeño puede mejorar de forma medible el recuerdo de hechos específicos de una región (del 7 % al 36 % en el conjunto de evaluación de recuerdo factual del autor), aunque la mejora en el benchmark general de conocimiento andorrano no alcance significación estadística.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4 E4B) con adaptador LoRA (PEFT) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (longitud máxima de entrenamiento: 2048 tokens) |
| Tipos de cuantizacion | GGUF Q4_K_M (publicado); QLoRA 4-bit para entrenamiento |
| Idiomas soportados | catalán (ca) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT), GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 y alpha 32 sobre `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`, un Gemma 4 E4B instruct cuantizado en 4 bits para entrenamiento. El ajuste se realizó con QLoRA mediante Unsloth sobre una única GPU NVIDIA L4, con 2 épocas, tasa de aprendizaje 0,0002 con decaimiento coseno y un 3 % de warmup, batch efectivo de 16 (4 x 4), longitud máxima de 2048 tokens, plantilla de chat `gemma-4` y semilla 3407. La pérdida se calcula únicamente sobre las respuestas del modelo. La pérdida de validación final fue de 1,6060, con un mínimo observado de 1,6036 en el paso 3200.

Los datos de entrenamiento corresponden a la variante K-canon de la exportación `training-data`, compuesta por conversaciones en catalán andorrano sobre un corpus aumentado de conocimiento andorrano. El modelo se entrenó siempre con un mensaje de sistema fijo en catalán que define su identidad como asistente experto en Andorra, y el autor recomienda reutilizar ese mismo mensaje en inferencia. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset más allá de la mención a conversaciones en catalán andorrano.

## Capacidades

- Generación de texto conversacional en catalán, con registro y expresiones propias del catalán de Andorra.
- Recuerdo de hechos sobre Andorra: historia, instituciones (Consell General, Constitución de 1993), geografía (las siete parroquias), cultura y gastronomía.
- Respuesta a preguntas abiertas y de opción múltiple sobre el dominio andorrano.
- Capacidades heredadas del modelo base Gemma 4 E4B instruct (razonamiento general, código, matemáticas), aunque el ajuste está orientado al dominio andorrano y no se documentan evaluaciones de esas capacidades.
- Soporte de tool calling / function calling: no documentado en la información disponible (depende del modelo base).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al catalán según la etiqueta de idioma del repositorio.
- Capacidades especiales (thinking mode, visión, audio): no documentadas.

## Casos de uso

- Asistente cultural y turístico de Andorra: el modelo puede responder preguntas sobre historia, instituciones y geografía andorranas con un recuerdo factual notablemente superior al modelo base (36 % frente a 7 % en el conjunto de recuerdo del autor), adecuado para chatbots informativos de dominio acotado.
- Atención al ciudadano en catalán andorrano: gestión de consultas sobre el funcionamiento institucional (Consell General, parroquias, Constitución) usando el mensaje de sistema entrenado para mantener el registro local.
- Educación y divulgación local: generación de explicaciones sobre conceptos históricos andorranos (por ejemplo, la Querimònia o el Consell de la Terra) para materiales didácticos, con la advertencia de verificar los hechos por el riesgo de alucinación.
- Prototipado de bajo coste: al ser un adaptador sobre un modelo de ~7,5 mil millones de parámetros cuantizable a Q4_K_M, puede desplegarse en una sola GPU consumer o incluso en CPU mediante llama.cpp u Ollama para pruebas y demos.
- Investigación sobre ajuste fino de dominio: sirve como caso de estudio reproducible (código en GitHub, versiones etiquetadas, benchmark propio) para evaluar cuánto conocimiento factual específico puede inyectarse con QLoRA en un modelo pequeño.
- Generación de contenido gastronómico y cultural: respuestas sobre tradiciones como la coca massegada de Sant Jordi, útiles para blogs o aplicaciones de contenido local.
- Evaluación comparativa de adaptadores: el esquema de versiones etiquetadas permite comparar ejecuciones de entrenamiento bajo condiciones idénticas (temperatura 0, GGUF Q4_K_M, Ollama).

## Benchmarks y rendimiento

Evaluación del autor con ambos modelos como GGUF Q4_K_M en Ollama, temperatura 0 y las mismas condiciones.

Recuerdo factual sobre 338 preguntas retenidas del canon aumentado (formulación no vista en entrenamiento; respuesta correcta si contiene las palabras clave esperadas):

| Modelo | Hechos recordados |
|---|---:|
| Gemma 4 E4B (base) | 25 / 338 (7 %) |
| maia (`20261102-1437-e4b-k-canon`) | 121 / 338 (36 %) |

maia recuerda 103 hechos que el modelo base falla y falla 7 que el base acertaba.

maia-bench (926 preguntas sobre Andorra, juez Gemini 3.8 Flash; las preguntas del benchmark y los artículos reservados nunca se entrenan):

| Tipo de pregunta | Gemma 4 E4B (base) | maia | Diferencia (IC 95 %, bootstrap emparejado) |
|---|---:|---:|---|
| Todas | 30,3 % | 32,9 % | +2,6 pts [−0,6, +5,9] |
| Opción múltiple (604) | 42,4 % | 46,2 % | +3,8 pts [−1,0, +8,6] |
| Abiertas (231) | 9,1 % | 9,3 % | +0,2 pts [−3,2, +3,7] |
| Trampa (91) | 3,8 % | 5,0 % | +1,1 pts [−3,8, +6,0] |

El autor señala que la mejora en maia-bench no es estadísticamente significativa (p ≈ 0,05) y que la ganancia principal se concentra en el recuerdo factual. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de ~7,5 mil millones de parámetros en Q4_K_M se sitúa típicamente en torno a 5-6 GB, aunque el dato no está confirmado en la información proporcionada.
- GPU de entrenamiento: 1 NVIDIA L4 (QLoRA con Unsloth).
- GPU recomendadas: no especificadas por el autor; el entrenamiento se validó en L4.
- ¿Cabe en GPU consumer? No confirmado en la documentación, pero el tamaño del repositorio (6,2 GB) y la cuantización Q4_K_M publicada sugieren que es viable en GPUs consumer con suficiente VRAM.
- Opciones de despliegue: Ollama y llama.cpp mediante el GGUF `maia-e4b-Q4_K_M.gguf` (con `RENDERER gemma4` y `PARSER gemma4` en el Modelfile); carga del adaptador con Unsloth (`FastModel.from_pretrained` con `load_in_4bit=True`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-maia-e4b | 7.518.069.290 (adaptador sobre Gemma 4 E4B) | no disponible | Dominio andorrano en catalán | Apache 2.0 | Hugging Face (repo propio) |
| Gemma 4 E4B (base) | mismo modelo base | no disponible | Generalista instruct | según modelo base | Hugging Face (unsloth/gemma-4-E4B-it-unsloth-bnb-4bit) |
| Alternativas de ajuste de dominio en catalán | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks estándar ni de modelos comparables adicionales en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el autor lo declara explícitamente "not a final model yet"; no debe tratarse como versión estable.
- Riesgo de alucinación factual: aunque mejora el recuerdo, el 64 % de las preguntas de recuerdo factual siguen sin respuesta correcta; las respuestas deben verificarse en producción.
- Mejora en el benchmark general no significativa estadísticamente (p ≈ 0,05), con intervalos de confianza que cruzan cero en todas las categorías.
- Idiomas: solo catalán; no se documenta soporte de castellano ni otras lenguas.
- Contexto: longitud máxima de entrenamiento de 2048 tokens; no se documenta la ventana de contexto efectiva del modelo base.
- Dependencia del mensaje de sistema: el modelo se entrenó con un system prompt fijo en catalán y su comportamiento puede degradarse sin él.
- Sesgos: no documentados por el autor; al estar entrenado sobre un corpus específico de Andorra, puede presentar sesgos de cobertura temática.
- Uso comercial: permitido por la licencia Apache 2.0, sujeta además a las condiciones del modelo base Gemma.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ericrisco/gemma-maia-e4b
- Repositorio de código: https://github.com/ericrisco/maia
- Benchmark: https://github.com/ericrisco/maia-bench
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it-unsloth-bnb-4bit
- Unsloth: https://github.com/unslothai/unsloth
