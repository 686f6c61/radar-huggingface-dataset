# lihaoxin2020/simpleopd-mopd-olmo3-7b-qwen30b-gemma26b-12k-250-20261028

## Resumen

Simple-OPD MOPD Olmo3-7B es un checkpoint experimental de destilación on-policy multi-profesor construido sobre allenai/Olmo-3-7B-Instruct-SFT. Lo publica el usuario de HuggingFace lihaoxin2020 dentro de una campaña de investigación sobre destilación entre tokenizadores distintos (cross-tokenizer), y no es un modelo pensado para uso general, sino el artefacto de un experimento de entrenamiento concreto: 250 pasos de optimizador sobre el split math_and_code del dataset Keven16/G-OPD-Training-Data.

La particularidad técnica es el enrutado de tareas con profesores separados en lugar de un profesor promediado. Las etiquetas de tarea del pipeline G-OPD original dirigen los ejemplos de matemáticas a Qwen/Qwen3-30B-A3B-Instruct-2507 y los de código a google/gemma-4-26B-A4B-it, cada uno con su plantilla de chat nativa en modo no-thinking. El estudiante es un modelo denso de aproximadamente 7.000 millones de parámetros, según la nomenclatura del modelo base.

Es relevante ahora por dos motivos: por un lado, documenta una receta reproducible de destilación multi-profesor con corrección de desajuste de tokenizador; por otro, el autor declara explícitamente que no se emite ninguna afirmación de rendimiento hasta que haya resultados disponibles. El repositorio no tiene descargas ni likes, la licencia no está declarada y no se han publicado cifras de benchmarks, por lo que debe tratarse como material de investigación sin validar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de allenai/Olmo-3-7B-Instruct-SFT); el autor no detalla la arquitectura en la model card |
| Parametros totales | Aproximadamente 7.000 millones (deducido del identificador del modelo base; no confirmado en la model card) |
| Parametros activos | No aplica: el estudiante es denso. Los profesores sí son MoE (Qwen3-30B-A3B y gemma-4-26B-A4B, aproximadamente 30B/3B y 26B/4B activos según sus identificadores) |
| Longitud de contexto | No disponible. La model card solo especifica un tope de 12.288 tokens para respuestas de entrenamiento y de 16.384 tokens para la validación |
| Tipos de cuantizacion | No disponible (no se publican ficheros GGUF ni versiones cuantizadas) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (ni en los metadatos ni en la model card) |
| Formato de pesos | No disponible explícitamente; repositorio con `library_name: transformers`. Los pesos intermedios están en ramas inmutables `step-NNNNNN` y el estado de optimizador/reanudación en `latest-resume` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base allenai/Olmo-3-7B-Instruct-SFT, es decir, un transformer decoder-only denso de aproximadamente 7B parámetros ajustado con SFT sobre instrucciones. La model card no aporta detalles adicionales sobre el tronco, el tokenizador ni el contexto nativo del estudiante.

El entrenamiento aplica Simple-OPD (on-policy distillation) en una variante multi-profesor con enrutado por tarea y tokenizadores distintos. Cada actualización muestrea 64 respuestas, con un tope de 12.288 tokens por respuesta, y el coeficiente KL contra la referencia congelada del estudiante es de 0,5 con clipping de 0,2. El total son 250 pasos de optimizador sobre el split `math_and_code/train.parquet` del dataset Keven16/G-OPD-Training-Data (revisión c9bc6783733858dd4892f26f95e4aea0942e91f1). La innovación declarada es que los profesores no se promedian: los ejemplos de matemáticas se destilan desde Qwen3-30B-A3B-Instruct-2507 y los de código desde gemma-4-26B-A4B-it, cada uno con su plantilla de chat nativa en modo no-thinking, lo que obliga a resolver el desajuste de tokenizador entre estudiante y profesores dentro del propio pipeline de destilación.

La validación declarada se limita a matemáticas: preguntas fijas de AIME24 y AIME25, instrucción de respuesta en formato `boxed`, sin pista de razonamiento, avg@4 con tope de 16.384 tokens, temperatura 0,7, top-p 0,8, top-k 20 y verificador OPSA. El autor indica explícitamente que esta ejecución no reporta precisión en benchmarks de código.

## Capacidades

- Generación de texto instructivo y razonamiento, heredados del ajuste SFT del modelo base.
- Razonamiento matemático, objetivo principal de la destilación desde Qwen3-30B-A3B-Instruct-2507, evaluado sobre AIME24/AIME25.
- Generación de código, objetivo de la destilación desde gemma-4-26B-A4B-it; sin métrica publicada de precisión en código.
- Seguimiento de formato de respuesta: la validación usa instrucción de respuesta en bloque `boxed`, verificable automáticamente.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta entrenamiento específico para ello.
- Capacidades multilingües: no disponible.
- Modo thinking explícito: no. Los profesores se usan con su plantilla nativa en modo no-thinking y la validación se ejecuta sin pista de razonamiento.
- Vision y audio: no disponible.

## Casos de uso

- Investigación en destilación on-policy: reproducir o auditar la receta Simple-OPD con enrutado por tarea, usando los checkpoints intermedios de las ramas `step-NNNNNN` para estudiar la evolución de la pérdida KL y del comportamiento durante los 250 pasos.
- Estudio de destilación cross-tokenizer: analizar cómo se alinean las distribuciones de profesores con tokenizadores distintos (Qwen y Gemma) sobre un estudiante OLMo, un problema abierto en pipelines de destilación.
- Baseline para comparativas de destilación multi-profesor: servir como punto de referencia frente a variantes con profesor promediado o con un único profesor, manteniendo constante el estudiante de 7B.
- Evaluación de formato matemático verificable: probar el cumplimiento de la instrucción `boxed` y la robustez del verificador OPSA en respuestas largas, con el tope de 16.384 tokens de la validación.
- Reproducción de la validación AIME: ejecutar el protocolo declarado (avg@4, temperatura 0,7, top-p 0,8, top-k 20) para obtener cifras comparables a las del autor.
- Docencia y divulgación técnica: ilustrar en un curso o artículo cómo se estructura un experimento de destilación con profesores enrutados, dado que la model card documenta la hiperparametrización completa.
- Generación de código asistida en entornos controlados: solo como prueba exploratoria, ya que no hay métricas de código publicadas y el modelo carece de licencia declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica literalmente que no se emite ninguna afirmación de rendimiento hasta que haya resultados disponibles.

Lo único documentado es el protocolo de evaluación, no sus resultados:

| Aspecto | Configuracion declarada |
|---|---|
| Benchmarks objetivo | AIME24 y AIME25 (preguntas fijas del repositorio) |
| Instruccion de respuesta | Respuesta en bloque `boxed`, sin pista de razonamiento |
| Metrica de agregacion | avg@4 |
| Tope de generacion | 16.384 tokens |
| Muestreo | Temperatura 0,7, top-p 0,8, top-k 20 |
| Verificador | OPSA |
| Benchmarks de codigo | No reportados en esta ejecucion |

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 14-16 GB solo para pesos de un modelo denso de 7B, más KV cache; con contexto de 16.384 tokens el consumo adicional es significativo.
- VRAM estimada en cuantización de 8 bits: aproximadamente 7-8 GB de pesos. En 4 bits: aproximadamente 4-5 GB. Son estimaciones por tamaño, no cifras publicadas por el autor.
- GPU recomendadas: A100 40 GB u 80 GB o H100 para FP16 con contexto largo y serving concurrente; L40S o RTX 6000 Ada (48 GB) como alternativa.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en FP16 con contexto moderado, y en GPUs de 12-16 GB solo con cuantización de 8 o 4 bits. No hay GGUF publicado, así que habría que generarlo.
- Opciones de despliegue: vLLM o TGI para el repositorio en transformers; llama.cpp u Ollama solo si se convierte previamente a GGUF, cosa que el autor no ha publicado. Es imprescindible fijar la revisión (`step-NNNNNN`) al cargar, porque la rama `main` solo registra la identidad de la campaña y no contiene necesariamente pesos finales.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Rol en este trabajo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| simpleopd-mopd-olmo3-7b-qwen30b-gemma26b | Estudiante destilado (este modelo) | ~7B denso | No disponible (tope de entrenamiento 12.288, validación 16.384) | No disponible | Repositorio HF, 0 descargas, sin benchmarks |
| allenai/Olmo-3-7B-Instruct-SFT | Modelo base / inicialización | ~7B denso | No disponible | No disponible en la información proporcionada | Repositorio público de AllenAI |
| Qwen/Qwen3-30B-A3B-Instruct-2507 | Profesor de matemáticas | ~30B totales, ~3B activos (MoE) | No disponible en la información proporcionada | No disponible en la información proporcionada | Repositorio público |
| google/gemma-4-26B-A4B-it | Profesor de código | ~26B totales, ~4B activos (MoE) | No disponible en la información proporcionada | No disponible en la información proporcionada | Repositorio público |

La comparación relevante no es de rendimiento, sino de rol: los profesores son modelos MoE de 26-30B con solo 3-4B parámetros activos, mientras que el estudiante es un denso de 7B que debe absorber el comportamiento de ambos en un único conjunto de pesos. No hay datos que permitan afirmar qué porcentaje de la capacidad de los profesores se transfiere.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: el autor declara explícitamente que no emite afirmaciones de rendimiento. Cualquier uso en producción sería sin evidencia empírica de calidad.
- Licencia no declarada: no se puede asumir uso comercial. Al derivar de allenai/Olmo-3-7B-Instruct-SFT, habría que verificar la licencia del modelo base y de los datos de destilación.
- Idiomas no declarados: se desconoce la cobertura lingüística real, más allá del inglés probable del dataset de entrenamiento.
- Contexto no declarado: los topes de 12.288 y 16.384 tokens son límites de entrenamiento y validación, no la ventana de contexto del modelo. No deben confundirse.
- Evaluación sesgada a matemáticas: la validación cubre solo AIME24/AIME25 y el autor no reporta precisión en código, pese a que la mitad del pipeline destila código desde Gemma.
- Riesgo de alucinación: es un modelo de 7B destilado, no un modelo de razonamiento con verificación; en matemáticas puede producir cadenas plausibles con resultados incorrectos, y el verificador OPSA solo comprueba el formato de la respuesta final.
- Comportamiento dependiente del enrutado: al no promediar profesores, las capacidades pueden quedar repartidas de forma desigual entre dominios; tareas fuera de matemáticas y código no han sido objetivo del entrenamiento y podrían degradarse respecto al modelo base.
- Artefacto de investigación: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día. No hay evidencia de uso independiente ni revisión externa.
- Gestión de ramas: los pesos útiles están en ramas `step-NNNNNN` y el estado de reanudación en `latest-resume`. Cargar la rama `main` por defecto puede dar un resultado distinto del esperado.
- Los resultados de la búsqueda web realizada no contienen información relacionada con el modelo; no se han podido contrastar datos externos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lihaoxin2020/simpleopd-mopd-olmo3-7b-qwen30b-gemma26b-12k-250-20261028
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Instruct-SFT
- Profesor de matemáticas: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Profesor de código: https://huggingface.co/google/gemma-4-26B-A4B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/Keven16/G-OPD-Training-Data (revision c9bc6783733858dd4892f26f95e4aea0942e91f1)
- Paper, blog o repositorio del método Simple-OPD: no disponible en la información proporcionada
- Demo o endpoint público: no disponible
- Resultados de la búsqueda web: sin enlaces relevantes; los resultados devueltos no guardan relación con el modelo ni con destilación de modelos de lenguaje.
