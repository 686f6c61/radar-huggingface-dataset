# codelion/sprog-9m

## Resumen

SPROG-9M (Symbolic PROGram solver) es un modelo de 9,37 millones de parámetros entrenado desde cero por el usuario codelion para resolver problemas aritméticos de enunciado de nivel escolar (GSM8K) sin utilizar ningún LLM en el momento de la inferencia. En lugar de generar texto, el modelo abstrae las cantidades del enunciado en slots numéricos (`[N0]`, `[N1]`, etc.) y predice un programa en notación postfija sobre esos slots (por ejemplo `[N0] [N1] * [N2] -`), que después se ejecuta con un evaluador simbólico determinista.

Se trata de un encoder-decoder seq2seq de tipo transformer (dimensión 304, 4 capas de encoder y 4 de decoder, vocabulario de entrada de 6.000 tokens) con tokenizador de slots propio, pesos en formato MLX y script de inferencia autocontenido. La predicción final no sale de una única decodificación: se extraen 96 muestras con temperatura y un verificador simbólico de 0 parámetros entrenables (cobertura de números, cordura de magnitud y de valores intermedios) selecciona una sola respuesta.

Su interés es fundamentalmente de investigación: explora hasta dónde llega un solver simbólico minúsculo, sin pesos preentrenados, ejecutable en CPU o GPU de Apple Silicon, con licencia MIT. El resultado es modesto (11,8 % de acierto comprometido en GSM8K test con 96 muestras), muy lejos de un LLM de propósito general, pero sirve como referencia reproducible de la familia neuro-simbólica de bajo coste.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder seq2seq (4 capas encoder + 4 capas decoder, d=304) con tokenizador de slots numéricos y evaluador simbólico externo |
| Parametros totales | 9,37 M entrenables (el verificador simbólico tiene 0 parámetros entrenables) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se documenta; entrenado con problemas GSM8K de 1 a 4 pasos) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos `model.npz`; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (el dataset de entrenamiento, GSM8K, es en inglés; la model card no declara idiomas) |
| Licencia | MIT |
| Formato de pesos | `model.npz` (MLX) + `config.json` + `src_vocab.json` + `inference.py`; no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un seq2seq transformer clásico pero de dimensión muy reducida: 9,37 M de parámetros, `d=304`, cuatro capas de encoder y cuatro de decoder, con un vocabulario de fuente de 6.000 tokens. La innovación no está en el bloque transformer sino en la interfaz: el tokenizador sustituye cada número del enunciado por un slot (`[N0]`, `[N1]`...) de modo que el modelo nunca ve los valores literales y aprende estructura de programa en lugar de aritmética; la salida es un programa postfijo que ejecuta un evaluador determinista diminuto. Esto permite generalizar entre valores numéricos distintos con la misma plantilla. La decodificación es por muestreo con temperatura (96 muestras por pregunta) y la selección final la realiza un verificador simbólico de 0 parámetros que puntúa cobertura de números, coherencia de magnitud y cordura de valores intermedios, con desempate por frecuencia de voto.

El entrenamiento es puramente supervisado sobre pares enunciado–programa; no se documenta RLHF, DPO ni ninguna fase de preferencias. Los datos combinan el conjunto real GSM8K-train con aproximadamente 117.000 problemas sintéticos estilo GSM8K generados con Claude y Gemini (dataset `codelion/gsm8k-synth`). Según el autor, lo determinante fue igualar la distribución de pasos de GSM8K real y aplicar una descontaminación rigurosa (0 % de solapamiento de 8-gramas con el test), no el volumen de datos ni el tamaño del modelo: aumentar profundidad o parámetros no mejoró los resultados más allá del ruido. Las restricciones de diseño declaradas son explícitas: máximo 10 M de parámetros entrenables, sin pesos preentrenados, sin LLM congelado, sin sonda lineal sobre un modelo fundacional, e inferencia sin LLM usando solo MLX y ejecución simbólica.

## Capacidades

- Resolución de problemas aritméticos de enunciado de 1 a 4 pasos con las operaciones habituales (suma, resta, multiplicación, división, fracciones simples del estilo «3/4 de»).
- Abstracción de números a slots y predicción de programas postfijos, lo que le permite reutilizar una misma estructura de programa con valores distintos.
- Autoconsistencia por muestreo: 96 decodificaciones por pregunta y selección mediante verificador simbólico sin acceso a la respuesta gold.
- Ejecución simbólica determinista de la expresión resultante, sin generación de texto libre.
- Inferencia en CPU y en GPU de Apple Silicon mediante MLX, con un script autocontenido que solo depende de `mlx` y `numpy`.
- No soporta tool calling ni function calling.
- No soporta agentes, planificación multi-paso ni razonamiento encadenado en lenguaje natural.
- No es multimodal: no hay visión ni audio.
- No es un modelo causal de propósito general: no admite chat, instrucciones arbitrarias ni generación abierta.
- No declara capacidades multilingües; su dominio es el inglés de GSM8K.

## Casos de uso

- Investigación en solvers neuro-simbólicos: sirve como baseline reproducible y de código abierto (MIT) para medir cuánto rinde un modelo de menos de 10 M de parámetros con verificación simbólica frente a alternativas con LLM en el bucle.
- Estudio del compromiso entre recall y selección: el propio autor documenta que el verificador rinde 11,8 % con 96 muestras, 8,5 % con 192 y 8,3 % con 288, lo que convierte al modelo en un banco de pruebas para calibrar estrategias de autoconsistencia y verificadores de 0 parámetros.
- Anotación estructural de corpus matemáticos: al predecir programas postfijos sobre slots, puede usarse para extraer plantillas de resolución de un conjunto de enunciados y agrupar problemas por estructura, no por redacción.
- Deduplicación semántica de problemas: dos enunciados que producen el mismo programa normalizado son candidatos a duplicado aunque cambien los números y el vocabulario, lo que resulta útil en la curación de datasets.
- Validación barata en pipelines de datos sintéticos: actuar como comprobador de cordura de problemas generados por LLM, descartando aquellos en los que ningún programa muestreado es ejecutable o numéricamente plausible.
- Despliegue educativo offline: con 9,37 M de parámetros y ejecución en CPU o Apple Silicon, puede resolver ejercicios aritméticos de primaria en un portátil sin conexión y sin coste de API, como componente de una aplicación de práctica guiada.
- Demostración docente de neuro-simbolismo: el pipeline completo (tokenizador de slots, muestreo, verificador, evaluador) cabe en un único archivo `inference.py` legible, lo que lo hace adecuado para explicar en clase cómo se separa percepción lingüística y ejecución simbólica.
- Pruebas de integración en herramientas CLI: al responder con un flotante y no con texto, encaja como verificación determinista de expresiones en scripts de validación.

## Benchmarks y rendimiento

Evaluación declarada por el autor sobre el conjunto de test completo de GSM8K (1.319 problemas), promediada sobre 3 semillas de entrenamiento. Todos los valores proceden de la model card y del `model-index`; el registro de HuggingFace figura con `verified: false`.

| Metrica | GSM8K test | Que mide |
|---|---|---|
| Verificador @ 96 (cifra principal) | 11,8 % (mejor semilla 12,6 %; rango 11,1 %–12,6 %) | El verificador compromete una única respuesta sin usar la solución gold |
| Pluralidad @ 96 | ≈ 9,3 % | Respuesta más votada; tampoco usa la solución gold |
| pass@96 (oráculo) | ≈ 39 % | La respuesta correcta está entre las 96 muestras; cota superior que sí usa el gold para comprobar |
| Verificador @ 192 | 8,5 % | Mismo protocolo con más muestras |
| Verificador @ 288 | 8,3 % | Degradación por distractores plausibles añadidos |
| Parámetros entrenables | 9,37 M | — |
| LLM usado en inferencia | ninguno | — |

El `model-index` oficial solo declara una métrica: `Accuracy (single-answer, self-consistency)` = 11,8 en `openai/gsm8k`, tarea `text2text-generation`. No se han publicado en la información disponible resultados de benchmarks adicionales (MMLU, HumanEval, etc.) ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada: inferior a 100 MB. Con 9,37 M de parámetros, los pesos en fp32 ocupan aproximadamente 37,5 MB; el resto es vocabulario (6.000 tokens), buffers de atención y los programas muestreados.
- GPU recomendadas: no requiere GPU dedicada. El entorno objetivo declarado es CPU o GPU de Apple Silicon (M1/M2/M3/M4) mediante MLX.
- Compatibilidad con GPU de consumo: sí, en cualquier equipo Apple Silicon; también en CPU x86. No se documenta soporte CUDA ni ROCm, ya que el script de inferencia está escrito para MLX.
- Opciones de despliegue: únicamente el `inference.py` incluido en el repositorio (dependencias `mlx` y `numpy`). No es compatible con vLLM, TGI, llama.cpp, Ollama ni `transformers.AutoModel`, porque no es un LM causal estándar ni usa safetensors/GGUF.
- Latencia y throughput: no disponibles. Como referencia de coste, cada pregunta requiere 96 decodificaciones más la ejecución del verificador, es decir, unas 96 veces el coste de una decodificación única; con este tamaño de modelo el coste absoluto es muy bajo, pero no se publican cifras de latencia.
- Almacenamiento: el repositorio figura con 0,0 GB (redondeado); en la práctica son decenas de megabytes.

## Comparativa con modelos similares

No se han encontrado en la información proporcionada modelos directamente comparables con resultados publicados bajo el mismo protocolo (solver simbólico from-scratch, sin LLM en inferencia, menos de 10 M de parámetros). La tabla recoge la comparación estructural; los campos sin datos verificables se marcan como no disponibles.

| Modelo | Parametros | Contexto | GSM8K | Licencia | Inferencia |
|---|---|---|---|---|---|
| SPROG-9M | 9,37 M | no disponible | 11,8 % (verificador @ 96, no verificado) | MIT | CPU / Apple Silicon vía MLX, sin LLM |
| LLM de propósito general con chain-of-thought (familia 7B–70B) | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | variable segun modelo | GPU, requiere framework de inferencia estándar |
| Solver puramente simbólico por reglas o programación entera | 0 (sin aprendizaje) | no aplica | no disponible en esta ficha | variable | CPU |
| Modelo seq2seq pequeño supervisado sobre GSM8K (enfoque naive) | no disponible en esta ficha | no disponible | no disponible en esta ficha | no disponible | CPU/GPU |

Diferencias estructurales relevantes frente a un LLM: SPROG-9M no genera lenguaje, no acepta instrucciones, no tiene conocimiento del mundo y su salida es un número; a cambio, su huella de memoria es tres o cuatro órdenes de magnitud menor y puede auditarse por completo (programa + ejecución simbólica). Frente a un solver de reglas, la diferencia es que aprende la correspondencia entre enunciado y programa a partir de datos.

## Limitaciones y advertencias

- Rendimiento bajo: 11,8 % de acierto comprometido en GSM8K test, con un rango de 11,1 % a 12,6 % entre semillas. No es utilizable como resolutor de matemáticas en producción.
- Cobertura limitada por diseño: maneja problemas de 1 a 4 pasos con operaciones comunes y falla en enunciados que exigen comprensión lectora profunda o razonamiento multi-paso largo.
- No es un modelo de matemáticas general: el propio autor lo describe como modelo de investigación; no debe presentarse como sustituto de un LLM en tareas matemáticas.
- Idioma: entrenado sobre GSM8K, en inglés; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Riesgo de respuesta plausible pero incorrecta: el verificador simbólico no ve la solución gold y puntúa solo cobertura de números y cordura de magnitudes, por lo que puede seleccionar programas coherentes y equivocados. Añadir muestras empeora la selección (8,5 % a 192 y 8,3 % a 288), lo que indica sensibilidad al número de distractores.
- La cifra de 11,8 % está marcada como `verified: false` en el `model-index`; procede del autor y no de una evaluación independiente.
- Sesgos y procedencia de datos: aproximadamente 117.000 de los problemas de entrenamiento son sintéticos, generados con Claude y Gemini, lo que hereda el estilo de redacción, la distribución de plantillas y los sesgos de esos generadores. La descontaminación declarada (0 % de solapamiento de 8-gramas) es una salvaguarda necesaria pero no suficiente para garantizar generalización fuera de la distribución de GSM8K.
- Restricciones de licencia: MIT permite uso comercial y modificación sin regalías, pero se ofrece sin garantías; el aviso de copyright debe conservarse. Verificar además las condiciones de `codelion/gsm8k-synth` si se reutilizan los datos.
- Dependencia tecnológica: la inferencia está atada a MLX (`model.npz`), lo que limita el despliegue a macOS con Apple Silicon o a build de CPU; no hay integración con el ecosistema estándar de servidores de inferencia (vLLM, TGI, llama.cpp, Ollama).
- Mantenimiento: 40 descargas y 5 «likes» en el momento de la consulta, con un único mantenedor; no hay garantía de soporte, issues resueltos ni actualizaciones.
- Coste de inferencia multiplicado: 96 muestras por pregunta implican un factor 96 sobre una decodificación individual, irrelevante en términos absolutos por el tamaño del modelo, pero que hay que tener en cuenta al procesar lotes grandes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/codelion/sprog-9m
- Dataset de entrenamiento: https://huggingface.co/datasets/codelion/gsm8k-synth
- Dataset de evaluación GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Paper de GSM8K (Cobbe et al., 2021): https://arxiv.org/abs/2110.14168
- Documentación de MLX: https://ml-explore.github.io/mlx/
- Repositorio de MLX: https://github.com/ml-explore/mlx
- Paper, blog o demo específicos de SPROG-9M: no disponibles en la información proporcionada.
