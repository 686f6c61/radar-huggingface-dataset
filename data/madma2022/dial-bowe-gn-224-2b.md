# madma2022/Dial-bowe-GN-224-2B

## Resumen

Dial-bowe-GN-224-2B es un modelo de lenguaje experimental de tipo decoder-only, derivado por fine-tuning de Qwen/Qwen3.5-2B, desarrollado por el autor independiente madma2022. Está diseñado específicamente para responder en francés a preguntas sobre un documento proporcionado en el propio prompt (document question answering), y su objetivo declarado es funcionar en ordenadores sin tarjeta gráfica. Tras la reducción del vocabulario, el modelo conserva 1.702.797.632 parámetros reales (según safetensors), y se distribuye exclusivamente en formato GGUF para llama.cpp y Ollama.

La relevancia del modelo es doble. Por un lado, es un ejemplo de adaptación LoRA de bajo coste sobre una base pequeña para una tarea vertical (atención documental en francés sobre fichas administrativas de Service-Public.fr). Por otro, su model card publica un informe de evaluación inusualmente honesto: sobre el conjunto de test secreto del autor, el score global es estadísticamente equivalente al del modelo base (0,766 frente a 0,772), con mejoras claras en abstención y citación, pero retrocesos en seguimiento de instrucciones y cálculo.

El nombre del modelo hace referencia al origen guineano del autor («GN» es el dominio de internet de Guinea y «224» su prefijo telefónico), no a una versión. El autor advierte explícitamente de que no se añadieron datos de Guinea durante la adaptación y de que no se evaluaron las lenguas nacionales guineanas. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3.5-2B, con vocabulario reducido) |
| Parametros totales | 1.702.797.632 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 32.768 tokens (medido); configuración por defecto en Ollama: 8.192 |
| Tipos de cuantizacion | Q4_K_M (1,11 GB), Q5_K_M (1,25 GB), Q8_0 (1,82 GB) |
| Idiomas soportados | Francés (fr) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama); no se conservó la versión en precisión completa |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B y se obtiene mediante fine-tuning con LoRA, con una reducción del vocabulario que deja el recuento final en aproximadamente 1,7 mil millones de parámetros. La arquitectura subyacente es un transformer decoder-only; el autor indica que solo 6 de las 24 capas mantienen una caché por token (unos 12 KB por token), mientras que el resto usa un estado de tamaño fijo, de modo que el consumo de memoria crece poco con la longitud del contexto. Esto es coherente con un diseño híbrido de atención, aunque la model card no detalla la innovación arquitectónica concreta.

El entrenamiento se orientó a fichas administrativas francesas de Service-Public.fr. La model card no especifica el número de tokens de entrenamiento ni la composición exacta del dataset, y no menciona explícitamente fases de RLHF o DPO. Sí documenta un detalle relevante de reproducibilidad: la versión en precisión completa no se conservó, por lo que Q5_K_M y Q8_0 provienen de un segundo entrenamiento que retoma el primero en el paso 480 de 512 y rehace los últimos 32 pasos. El Q4_K_M de ese segundo entrenamiento presenta una divergencia KL muy próxima a la del fichero evaluado (0,0428 frente a 0,0427 respecto al F16 del segundo entrenamiento), y no se detectaron diferencias significativas en los dos conjuntos de desarrollo.

## Capacidades

- Generación de texto conversacional y respuesta a preguntas sobre un documento proporcionado en el contexto.
- Document question answering en francés, con instrucción explícita de responder solo a partir del documento y de indicar cuándo la información no está presente.
- Abstención calibrada: mejora notable en decir que la respuesta no está en el texto (FQuAD 2.0 +19 puntos, SQuAD 2.0 +23 puntos frente a la base).
- Citación de fuentes dentro del documento.
- Capacidad de señalar incoherencias en el documento (aunque el autor reporta que lo hace peor que la base).
- Soporte de conversación multi-turno mediante plantilla Jinja incluida en los GGUF.
- Funcionamiento en CPU sin GPU, con un pico de memoria de 2,39 GB a 8.192 tokens para el Q4_K_M.
- No soporta modo de razonamiento (thinking): el modelo no fue entrenado para ello y los GGUF incluyen una plantilla con el bloque de reflexión siempre vacío.
- No se documentan capacidades de tool calling, agentes, visión, audio ni otras modalidades.

## Casos de uso

- Consulta de fichas administrativas francesas: el modelo responde preguntas concretas sobre un documento de Service-Public.fr introducido en el prompt, citando el fragmento relevante y absteniéndose cuando el dato no aparece. Es su escenario de entrenamiento principal.
- Asistente documental en equipos sin GPU: con el Q4_K_M y 8.192 tokens de contexto, el pico de memoria del proceso es de 2,39 GB, lo que permite desplegarlo en portátiles de 8 GB de RAM (no verificado por el autor en esa configuración).
- Extracción de respuestas en pipelines de atención al ciudadano: para responder consultas sobre normativa o procedimientos administrativos a partir de un corpus documental inyectado en el contexto, con instrucción de no inventar datos.
- Verificación de coherencia documental: el modelo puede señalar contradicciones internas en un documento, aunque el autor advierte de que en esta tarea rinde peor que el modelo base, por lo que conviene usarlo como señal complementaria y no como único filtro.
- Prototipado rápido con Ollama: el Modelfile incluido permite crear y ejecutar el modelo con `ollama create` y `ollama run`, lo que facilita pruebas de concepto locales en francés sin infraestructura GPU.
- Evaluación de robustez frente a inyección de instrucciones: dado que el autor reporta que el modelo resiste peor que la base las instrucciones ocultas en un documento, puede emplearse como caso de estudio en pruebas de seguridad de sistemas RAG, no como defensa en producción.
- Generación de respuestas en francés con formato controlado: la consigna del autor exige respetar exactamente las restricciones de formato solicitadas, útil para extraer campos estructurados de documentos administrativos.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden al conjunto de test secreto del autor y a bancos públicos, con temperatura 0 para las evaluaciones de calidad.

| Benchmark | Resultado | Comparación con Qwen3.5-2B base |
|---|---|---|
| Score global (test secreto del autor) | 0,766 | 0,772 (diferencia no significativa) |
| FQuAD 2.0 | no disponible (valor absoluto) | +19 puntos |
| SQuAD 2.0 | no disponible (valor absoluto) | +23 puntos |
| IFEval | no disponible (valor absoluto) | −5,9 puntos |
| MGSM | no disponible (valor absoluto) | −7,2 puntos |

El autor no publica los valores absolutos de FQuAD 2.0, SQuAD 2.0, IFEval ni MGSM, solo las diferencias respecto a la base. Tampoco se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el autor lo diseñó para CPU. En GPU, el Q4_K_M de 1,11 GB cabría en cualquier tarjeta con 2 GB o más, aunque no se han publicado mediciones en GPU.
- Pico de memoria del proceso en CPU (llama-bench, Mac de 16 GB): Q4_K_M 2,39 GB a 8.192 tokens y 3,67 GB a 32.768 tokens; Q5_K_M 1,91 GB a 8.192 tokens (no medido a 32.768); Q8_0 2,45 GB a 8.192 tokens y 3,73 GB a 32.768 tokens.
- RAM del sistema: el autor estima que un equipo de 8 GB debería bastar para el Q4_K_M a 8.192 tokens, aunque no lo verificó en esa máquina.
- GPU recomendadas: no aplica; no se han publicado mediciones en A100, H100 ni RTX 4090.
- Despliegue: llama.cpp (`llama-server -m ... -c 8192 --jinja`) y Ollama (probado con la versión 0.40.14). Para mediciones en CPU, el autor usa `-ngl 0 -t 8`.
- Latencia y throughput: no se publican cifras de tokens por segundo. El autor señala que en CPU el límite práctico es el tiempo de lectura de un documento largo más que la memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Dial-bowe-GN-224-2B | 1,70 B | 32.768 (medido) | fr, en | Apache 2.0 | GGUF | Fine-tuning LoRA para QA documental en francés; sin versión en precisión completa |
| Qwen/Qwen3.5-2B (base) | ~2 B (antes de reducción de vocabulario) | no disponible en la información | no disponible en la información | no disponible en la información | no disponible en la información | Modelo base; score global 0,772 en el test secreto del autor |
| Otros modelos de ~2 B para QA documental | no disponible | no disponible | no disponible | no disponible | no disponible | No se han identificado alternativas comparables en la información proporcionada |

La comparación cuantitativa solo es posible frente al modelo base, y únicamente en las métricas relativas publicadas. No hay datos de benchmarks frente a otros modelos de la misma categoría.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo califica como tal, con un conjunto de evaluación pequeño y un test secreto no reproducible por terceros.
- Rendimiento global equivalente al modelo base: el score de 0,766 frente a 0,772 no es una mejora significativa; las mejoras se concentran en abstención y citación.
- Peor detección de incoherencias documentales que el modelo base.
- Menor resistencia a instrucciones ocultas en el documento (inyección de prompt) que la base; no debe usarse como defensa de seguridad en producción.
- Retroceso en seguimiento de instrucciones (IFEval −5,9) y en cálculo (MGSM −7,2).
- No fue entrenado para razonar: con la plantilla original de Qwen3.5, Ollama activa el modo reflexión por defecto y la respuesta queda vacía. Es obligatorio servir el modelo sin reflexión.
- Idiomas limitados a francés e inglés; no se evaluaron las lenguas nacionales guineanas pese a la referencia del nombre.
- Solo se distribuye en GGUF; no existe versión en precisión completa ni safetensors, lo que dificulta la reproducibilidad exacta y el reentrenamiento.
- Q5_K_M y Q8_0 provienen de un segundo entrenamiento y solo se validaron en conjuntos de desarrollo y por divergencia KL, no en el test secreto.
- Riesgo de alucinación mitigado por instrucción, no por entrenamiento específico de calibración más allá de la mejora en abstención.
- Sesgos: no documentados en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías y el modelo es experimental.
- Cero descargas y cero likes en Hugging Face en el momento de la consulta; sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/madma2022/Dial-bowe-GN-224-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Documentación de llama.cpp: no disponible en la información proporcionada
- Documentación de Ollama: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
