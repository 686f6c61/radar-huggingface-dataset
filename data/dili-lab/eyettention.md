# DiLi-Lab/Eyettention

## Resumen

Eyettention es un modelo de predicción de trayectorias oculares (scanpaths) durante la lectura humana, desarrollado originalmente por el grupo aeye-lab y reempaquetado en este repositorio de Hugging Face por DiLi-Lab. No es un modelo de lenguaje generativo: su tarea es, dado un texto, predecir la secuencia de fijaciones (qué palabra o carácter se mira en cada paso) que realizaría un lector humano, junto con la distribución de probabilidad asociada a cada paso. La innovación central del trabajo original es un mecanismo de atención cruzada entre dos secuencias: la secuencia de palabras del texto y la secuencia cronológica de fijaciones.

El repositorio DiLi-Lab/Eyettention no publica un modelo nuevo, sino una reorganización en paquete (`Eyettention`) de la implementación original, a la que añade inferencia sobre texto crudo, reproducción de prefijos de scanpath observados (*prefix replay*), un *endpoint handler* compatible con endpoints de Hugging Face y una interfaz web Gradio. Incluye checkpoints entrenados para inglés (dataset CELER) y chino (Beijing Sentence Corpus) con un tamaño de repositorio total de 0,9 GB.

Su relevancia es fundamentalmente científica y aplicada a la psicolingüística computacional: permite generar datos sintéticos de eye-tracking, comparar el comportamiento de lectores reales frente a una referencia normativa y evaluar la dificultad de procesamiento de un texto sin necesidad de reclutar participantes. La model card no declara número de parámetros, longitud de contexto, idiomas oficiales soportados ni resultados numéricos de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de doble secuencia con atención cruzada (*cross-sequence attention*) entre la secuencia de palabras y la secuencia cronológica de fijaciones; codificación de texto basada en BERT (los *assets* de BERT deben descargarse de Hugging Face o estar en caché local) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; la inferencia sobre texto crudo está pensada para frases cortas dentro de los límites configurados del checkpoint. La indexación de salida usa `0` para CLS, `1..N` para palabras o caracteres chinos y `N+1` para SEP |
| Tipos de cuantización | no disponible; se distribuyen checkpoints PyTorch (`.pth`) sin cuantizaciones documentadas (GGUF, INT8, etc.) |
| Idiomas soportados | inglés (checkpoint CELER) y chino (checkpoint BSC) según los checkpoints y datasets incluidos; la model card no declara una lista oficial de idiomas |
| Licencia | MIT |
| Formato de pesos | `.pth` (state dict de PyTorch) para los checkpoints; *assets* de BERT en formato Hugging Face (versión no especificada) |
| Tarea | Predicción de scanpaths de lectura: devuelve índices de fijación y distribuciones de probabilidad por paso (no duraciones de fijación) |
| Checkpoints incluidos | `Eyettention/results/CELER/Eyettention_english.pth` y `Eyettention/results/BSC/Eyettention_chinese.pth` |
| Datos de normalización requeridos | `Data/feature_norm_celer.pickle` y `Data/feature_norm_BSC.pickle` |
| Tamaño del repositorio | 0,9 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo procesa simultáneamente dos secuencias: la secuencia de palabras del estímulo textual y la secuencia cronológica de fijaciones oculares. La alineación entre ambas se realiza mediante un mecanismo de atención cruzada, que permite que la representación de cada fijación consulte el estado de la palabra correspondiente y viceversa. El trabajo original evalúa el modelo de forma intra- y entre-conjuntos de datos en varios idiomas, e incluye un estudio de ablación y un análisis cualitativo del comportamiento del modelo. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de ajuste tipo RLHF o DPO; dado que la tarea es de predicción de secuencias y no de generación de lenguaje, tales técnicas no resultan directamente aplicables.

El repositorio de DiLi-Lab añade tres componentes de ingeniería sobre la implementación original: (1) inferencia a partir de texto crudo, que tokeniza el texto de entrada y genera el scanpath sin necesidad de disponer de los corpus completos de entrenamiento; (2) *prefix replay*, que permite reinyectar fijaciones observadas antes de continuar el muestreo, de modo que `max_pred_len` deja de ser un tope estricto de longitud total cuando se proporciona un prefijo; y (3) un `EndpointHandler` con interfaz basada en diccionarios (`inputs` + `parameters`) y una aplicación Gradio en el puerto 7860. El preprocesado local requiere `LAC` y una instalación compatible de PaddlePaddle, además de `openpyxl` para cargar el Excel del corpus BSC.

## Capacidades

- Predicción de scanpaths de lectura sobre texto en inglés (CELER) y chino (BSC).
- Salida de índices de fijación por paso: `0` = CLS, `1..N` = palabras o caracteres chinos, `N+1` = SEP; la interpretación debe detenerse en el primer SEP.
- Salida de distribuciones de probabilidad por paso (`density_steps`), útil para medir incertidumbre o dificultad de procesamiento por posición.
- Inferencia sobre texto crudo mediante `EyettentionRawTextInference`, sin necesidad de los corpus de entrenamiento.
- Reinyección de prefijos de scanpath observados (*prefix replay*) para condicionar la generación con fijaciones reales.
- Evaluación en dos regímenes declarados por los scripts de experimentos: `text` (frases nuevas) y `subject` (lectores nuevos).
- Identificación de lector (`main_BSC_reader_identifier`, `main_celer_reader_identifier`) y ajuste NRS (`main_BSC_NRS_setting`, `main_celer_NRS_setting`).
- Despliegue como endpoint mediante `EndpointHandler` y como interfaz web mediante Gradio.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, *tool calling*, *function calling* ni capacidades de agente. No es un modelo de lenguaje.

## Casos de uso

- Modelado cognitivo de la lectura: comparar el scanpath predicho con datos de eye-tracking de participantes humanos para validar o refutar hipótesis sobre el control ocular durante la lectura, usando la salida por paso del modelo.
- Generación de datos sintéticos de eye-tracking: producir trayectorias de fijación para conjuntos de estímulos donde no es viable reclutar lectores, y emplearlas para preentrenar o aumentar modelos posteriores de predicción de scanpath.
- Evaluación de legibilidad sin participantes: utilizar la distribución de probabilidad por palabra (`density_steps`) como indicador indirecto de la dificultad de procesamiento de cada posición del texto.
- Detección de lectores atípicos: emplear el script de identificación de lector para contrastar el patrón observado de un participante con el patrón esperado y cuantificar la desviación, en estudios sobre dislexia o lectura no nativa.
- Diseño tipográfico y de interfaces: simular dónde fijaría la mirada un lector ante distintos diseños de texto, tamaños de fuente o longitudes de línea, siempre con la cautela de que el modelo está entrenado sobre corpus de lectura controlada.
- Investigación en traducción y bilingüismo: comparar la dificultad predicha para un mismo contenido en inglés y en chino, aprovechando los dos checkpoints disponibles, para estudiar asimetrías de procesamiento entre lenguas.
- Docencia y demostraciones interactivas: la interfaz Gradio permite ilustrar en clase cómo un modelo atencional reproduce patrones de lectura, sin necesidad de infraestructura de eye-tracking.
- Replicación y extensión metodológica: servir de línea base reproducible frente a la implementación original de aeye-lab, al añadir inferencia sobre texto crudo y un *handler* listo para endpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card y el resumen del artículo afirman cualitativamente que Eyettention supera a los modelos del estado del arte en predicción de scanpaths, y mencionan una evaluación intra- y entre-conjuntos de datos en varios idiomas, un estudio de ablación y un análisis cualitativo, pero no se proporciona ninguna cifra concreta (ni métricas, ni valores, ni comparaciones numéricas) en el material disponible. No se incluyen resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar, ya que el modelo no realiza tareas de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio completo ocupa 0,9 GB, lo que incluye los dos checkpoints, los ficheros de normalización y los *assets* asociados; el conjunto cabe con holgura en GPUs de gama de entrada. No se publica el número de parámetros ni el consumo de memoria medido.
- GPU recomendadas: no disponible. La model card solo indica que debe seleccionarse una GPU disponible con el argumento `--gpu` y que varios scripts de experimentos llaman a CUDA directamente, por lo que requieren un entorno con CUDA habilitado.
- Inferencia en CPU: soportada explícitamente (`device="cpu"`), tanto en la inferencia sobre texto crudo como en el `EndpointHandler` (que usa BSC en CPU por defecto).
- GPU de consumo: no hay datos que permitan confirmar o descartar su ejecución en tarjetas tipo RTX 4090 o inferiores; dado el tamaño del repositorio, es plausible, pero no está verificado en la información disponible.
- Opciones de despliegue: paquete Python propio (`Eyettention`), `EndpointHandler` para endpoints compatibles, interfaz Gradio (`python -m Eyettention.app`, puerto 7860) e integración con `transformers`/`pytorch`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Dependencias: `requirements.txt` con versiones históricas de PyTorch y Transformers que pueden necesitar ajustes según la versión de Python y la plataforma; `LAC` y PaddlePaddle compatible para el preprocesado; `openpyxl` para la carga del Excel del corpus BSC. La model card recomienda usar un entorno separado del de ScanDL2 por incompatibilidad de versiones.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tarea | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Eyettention (DiLi-Lab) | Predicción de scanpaths de lectura, inglés y chino | no disponible | no disponible | MIT | Hugging Face, con inferencia sobre texto crudo, *handler* de endpoint y Gradio |
| Eyettention original (aeye-lab) | Predicción de scanpaths de lectura | no disponible | no disponible | no disponible | Repositorio GitHub de investigación |
| ScanDL / ScanDL2 | Predicción de scanpaths (familia de modelos mencionada en la model card como incompatible en dependencias) | no disponible | no disponible | no disponible | No incluido en este repositorio |

No se dispone de datos de parámetros, contexto, licencia ni métricas comparativas de las alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible. La diferencia verificable entre las tres entradas es de empaquetado y herramientas de despliegue, no de arquitectura base en el caso de las dos primeras.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código y no soporta *tool calling* ni flujos de agente. Cualquier uso en ese sentido es un error de categoría.
- La salida contiene índices de fijación y probabilidades por paso, pero no duraciones de fijación; no debe interpretarse como una simulación completa del comportamiento ocular.
- El índice `0` corresponde a CLS y `N+1` a SEP; interpretar fijaciones más allá del primer SEP carece de sentido.
- Uso de frases cortas: la inferencia sobre texto crudo debe respetar los límites de entrada configurados en cada checkpoint.
- Con *prefix replay*, `max_pred_len` no actúa como tope estricto de longitud total, porque el bucle de generación se extiende con las fijaciones reinyectadas.
- Es necesario conservar `Data/feature_norm_celer.pickle` y `Data/feature_norm_BSC.pickle` junto al paquete; sin ellos la inferencia no es correcta.
- Los *assets* de BERT deben poder descargarse de Hugging Face o estar en caché local; en entornos sin red la ejecución falla.
- Dependencias con versiones históricas de PyTorch y Transformers y uso directo de CUDA en varios scripts: riesgo alto de incompatibilidad en entornos modernos. Los corpus CELER y BSC requieren descarga y preparación siguiendo instrucciones externas.
- Los nombres de dataset son sensibles a mayúsculas (`celer`, `BSC`), lo que facilita errores de configuración.
- Sesgos conocidos: no documentados en la información disponible. Al estar entrenado sobre corpus de lectura controlada (CELER y BSC), es previsible un sesgo hacia las condiciones experimentales, tipografías, poblaciones de lectores y longitudes de frase de dichos corpus, pero no hay un análisis publicado en el material consultado.
- Riesgo de alucinación: no aplica en el sentido generativo; el riesgo equivalente es la predicción de fijaciones poco plausibles en textos o dominios alejados de la distribución de entrenamiento.
- Idiomas: solo se distribuyen checkpoints para inglés y chino; no hay soporte multilingüe declarado.
- Licencia MIT, sin restricciones declaradas para uso comercial en la model card, aunque los corpus subyacentes (CELER, BSC) tienen sus propias condiciones de uso que deben respetarse por separado.
- Repositorio con 0 descargas y 0 likes: no hay validación por parte de la comunidad ni garantía de mantenimiento.
- Las marcas temporales del repositorio figuran como 2026-09-26 (creación y actualización); conviene verificar su vigencia antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DiLi-Lab/Eyettention
- Artículo original (arXiv 2304.10784): https://arxiv.org/abs/2304.10784
- Implementación original de aeye-lab: https://github.com/aeye-lab/Eyettention
- Corpus CELER: https://github.com/berzak/celer
- Beijing Sentence Corpus (BSC): https://osf.io/vr3k8/
- Nota sobre la búsqueda web: los resultados devueltos corresponden a entidades homónimas no relacionadas con el modelo (la ciudad de Dili en Timor-Leste y una empresa inmobiliaria francesa), por lo que no aportan información adicional verificable sobre este repositorio.
