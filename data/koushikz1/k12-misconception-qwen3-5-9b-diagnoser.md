# koushikz1/k12-misconception-qwen3.5-9b-diagnoser

## Resumen

k12-misconception-qwen3.5-9b-diagnoser es un adaptador LoRA (r=32) sobre el modelo vision-language Qwen/Qwen3.5-9B, desarrollado por el usuario koushikz1. Su proposito es detectar y clasificar misconceptions (errores conceptuales) en el trabajo matematico de estudiantes de educacion K-12 a partir de fotografias de sus ejercicios. El adaptador se combina con una cabeza lineal de 76 clases que se aplica sobre el token final `ROOT |` generado por el modelo, permitiendo mapear el error del estudiante a un codigo de misconception predefinido.

El modelo fue entrenado sobre las 1.500 filas etiquetadas del conjunto de datos de la competicion de Kaggle "Misconception Detection in K-12 Student Math Workings". El flujo de inferencia es multi-paso: el modelo transcribe el trabajo del estudiante (`L# | ...`), verifica si coincide con la solucion esperada (`MATCH | YES/NO`), describe el error (`ERROR | ...`) y finalmente la cabeza lineal puntua el codigo raiz de misconception. En la validacion held-out fold-0 (300 filas) el adaptador solo alcanza un MAP@3 de 0.597 en la cabeza, mientras que las variantes de ensamblado (blend) con otros modelos y una pila CPU alcanzan hasta 0.6989.

Es relevante ahora porque demuestra un patron practico de adaptacion de un VLM grande a una tarea educativa muy especifica mediante LoRA y una cabeza de clasificacion, con un pipeline de generacion compatible con vLLM. No obstante, se trata de un artefacto de competicion con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicos fuera del fold de validacion del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (base Qwen3.5-9B) con adaptador LoRA y cabeza lineal de 76 clases |
| Parametros totales | 9B en el modelo base; el adaptador LoRA y la cabeza anaden un numero no especificado (repo de 0,8 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-9B, un modelo vision-language que procesa tanto la fotografia del trabajo del estudiante como el diagrama de la pregunta. El LoRA tiene rango r=32 y se aplica a las proyecciones de atencion, GDN y MLP del modelo de lenguaje. Sobre el token final `ROOT |` se anade una cabeza lineal de 76 vias que produce la puntuacion sobre los codigos de misconception. El entrenamiento es end-to-end sobre las 1.500 filas etiquetadas del dataset de Kaggle, y el pipeline de generacion exige `enable_thinking=False` porque el formato de entrenamiento tiene un bloque de pensamiento vacio.

El autor documenta un esquema de ensamblado (blend) que combina este adaptador con una pila CPU, un modelo de 8B y variantes con "hr" y compuertas MATCH. Las variantes v1, v3 y v5 alcanzan un MAP@3 de 0.6989 en fold-0, mientras que la variante solo-Qwen3.5-9B (v4) baja a 0.6783. El codigo de entrenamiento, fusion de LoRA, generacion con vLLM e inferencia de la cabeza esta referenciado en el repositorio (`code/dgx/train_vlm.py`, `merge_lora.py`, `gen_vllm.py`, `infer_vlm.py`, `src/make_subs.py`). Los datos de la competicion no se distribuyen por las reglas del concurso.

## Capacidades

- Transcripcion estructurada del trabajo matematico del estudiante en formato `L# | ...`.
- Verificacion de coincidencia con la solucion esperada mediante `MATCH | YES/NO`.
- Descripcion del error cometido en formato `ERROR | ...`.
- Clasificacion del codigo raiz de misconception entre 76 clases mediante cabeza lineal.
- Procesamiento de imagen: lee fotografias del trabajo del estudiante y diagramas de la pregunta.
- Generacion de texto autoregresiva con modo thinking desactivado obligatoriamente.
- Integracion con vLLM para generacion a escala segun el codigo del autor.
- Capacidades multilingues: no disponibles (no documentadas).
- Tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible como capacidad general; el pipeline interno si encadena varios pasos de generacion.

## Casos de uso

- Evaluacion automatica de ejercicios de matematicas K-12: el modelo recibe la foto del cuaderno del alumno y devuelve la transcripcion, el veredicto de coincidencia y el codigo de misconception, lo que permite corregir lotes de ejercicios sin revision manual linea a linea.
- Diagnostico pedagogico individualizado: a partir del codigo de misconception detectado, un sistema tutorial puede seleccionar explicaciones y ejercicios de refuerzo especificos para el error conceptual del estudiante.
- Investigacion educativa a escala: procesar miles de trabajos para cuantificar la distribucion de misconceptions por tema, curso o centro, usando la salida estructurada como dato tabular.
- Generacion de informes para docentes: agregar los codigos de error por clase para identificar los conceptos que requieren repaso, apoyandose en la transcripcion y la descripcion textual del error.
- Preprocesado para pipelines de ensamblado: el adaptador puede actuar como miembro de un blend junto con otros modelos y una pila CPU, tal como documenta el autor, para mejorar el MAP@3 en produccion.
- Prototipado de asistentes de refuerzo escolar: integrar el modelo en una aplicacion movil que el estudiante fotografia su ejercicio y recibe retroalimentacion sobre el tipo de error, con la salvedad de que el rendimiento fuera del dominio de la competicion no esta validado.
- Analisis de errores en plataformas de aprendizaje adaptativo: usar la salida `ERROR | ...` como senal para ajustar la dificultad de los problemas recomendados.

## Benchmarks y rendimiento

Los unicos datos publicados son los de validacion interna del autor sobre el fold-0 (300 filas) del dataset de Kaggle. No hay resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Resultado |
|---|---|
| Head-only MAP@3 (fold-0, 300 filas) | 0.597 |
| MATCH accuracy (fold-0) | 0.907 |
| Blend v1_q9blend MAP@3 | 0.6989 |
| Blend v2_q9heavy MAP@3 | 0.6867 |
| Blend v3_foldavg MAP@3 | 0.6989 |
| Blend v4_q9only MAP@3 | 0.6783 |
| Blend v5_gates MAP@3 | 0.6989 |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de 9B en precision completa se requieren del orden de 18-20 GB solo para pesos, mas el coste del procesador visual y el adaptador; con cuantizacion de 8 bits o 4 bits el requisito baja sustancialmente, pero el autor no documenta cuantizaciones soportadas.
- GPU recomendadas: no especificadas por el autor. El codigo de generacion esta pensado para vLLM (`code/dgx/gen_vllm.py`), lo que sugiere despliegue en GPU de datacenter tipo A100 o H100; no se confirma compatibilidad con RTX 4090.
- Cabe en consumer GPU: no confirmado. Un modelo de 9B en 4 bits podria caber en GPUs de 24 GB, pero no hay validacion publicada para este adaptador.
- Opciones de despliegue: vLLM segun el codigo del autor; PEFT para cargar el adaptador; llama.cpp, Ollama o TGI no estan documentados para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay modelos comparables directos publicados en la informacion disponible. La comparacion mas cercana es con el propio modelo base y con los miembros del blend del autor.

| Modelo | Parametros | Contexto | MAP@3 fold-0 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (solo cabeza) | 9B + LoRA | no disponible | 0.597 | apache-2.0 | HuggingFace |
| Blend v1/v3/v5 (con pila CPU y 8B) | varios | no disponible | 0.6989 | no disponible | no distribuido |
| Blend v4 (solo Qwen3.5-9B + gate) | 9B | no disponible | 0.6783 | no disponible | no distribuido |
| Qwen/Qwen3.5-9B (base, sin adaptador) | 9B | no disponible | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- Entrenado sobre solo 1.500 filas de un dataset de competicion; riesgo alto de sobreajuste y de baja generalizacion a otros formatos de trabajo escolar, idiomas o niveles educativos.
- El rendimiento reportado (MAP@3 0.597 en cabeza, 0.6989 en blend) es sobre un unico fold de validacion; no hay validacion cruzada completa ni test publico independiente.
- Requiere `enable_thinking=False` en el prompt de generacion; usarlo con thinking activado puede degradar la salida porque el formato de entrenamiento tenia el bloque de pensamiento vacio.
- El pipeline depende de una cabeza lineal de 76 clases y de un formato de salida muy especifico (`L# |`, `MATCH |`, `ERROR |`, `ROOT |`); desviarse de ese formato invalida la clasificacion.
- Los datos de la competicion no se redistribuyen por reglas del concurso, lo que limita la reproducibilidad completa del entrenamiento.
- Riesgo de alucinacion en la transcripcion y en la descripcion del error, especialmente con fotografias de baja calidad o caligrafia dificil.
- Sesgos conocidos: no documentados por el autor; al entrenar solo con datos K-12 de una competicion concreta, puede reflejar sesgos de ese corpus.
- Licencia apache-2.0 para el adaptador, pero el uso comercial debe verificar tambien la licencia del modelo base Qwen/Qwen3.5-9B, que no se detalla en la informacion disponible.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.
- Capacidades multilingues no documentadas; no se recomienda asumir soporte fuera del idioma de entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/koushikz1/k12-misconception-qwen3.5-9b-diagnoser
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de Kaggle (referenciado, no redistribuido): "Misconception Detection in K-12 Student Math Workings" (no se proporciona URL directa en la informacion disponible)
- Codigo de entrenamiento e inferencia: referenciado en el repositorio del autor (`code/dgx/train_vlm.py`, `code/dgx/merge_lora.py`, `code/dgx/gen_vllm.py`, `code/dgx/infer_vlm.py`, `code/src/make_subs.py`); no se proporciona URL externa en la informacion disponible.
