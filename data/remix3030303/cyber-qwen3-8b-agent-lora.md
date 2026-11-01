# remix3030303/cyber-qwen3-8b-agent-lora

## Resumen

Cyber Qwen3-8B Agent es un ajuste fino mediante LoRA (QLoRA) del modelo Qwen/Qwen3-8B, desarrollado por el usuario remix3030303 y publicado en HuggingFace. El adaptador está orientado a tareas de ciberseguridad: pruebas de penetración autorizadas, análisis defensivo, ingeniería de detección, respuesta a incidentes, revisión de código seguro y validación de vulnerabilidades. El modelo se entrena para ser "calibrado en evidencia", es decir, para no afirmar una vulnerabilidad sin respaldo, y para emitir llamadas a herramientas estructuradas dentro de bucles de agente.

Se distribuye únicamente como adaptador PEFT LoRA (0,4 GB) que debe cargarse sobre el modelo base Qwen3-8B. El entrenamiento se realizó con TRL SFTTrainer, PEFT, bitsandbytes y Transformers sobre una base cuantizada en 4 bits NF4, con pérdida calculada solo sobre los tokens del asistente, durante 1 época y 1073 pasos de optimización con una longitud máxima de secuencia de 2048 tokens. La pérdida final de entrenamiento fue de 0,874 y la precisión de tokens de aproximadamente el 77 por ciento.

La relevancia del modelo radica en su enfoque agéntico y su especialización vertical: combina el conocimiento general de Qwen3-8B con trayectorias de uso de herramientas (shell, http_request, search, read_file, grep, python) y datos de inteligencia de amenazas fundamentados (CVE, CWE, ATT&CK, CAPEC). No obstante, el autor no publica resultados de benchmarks formales ni el conjunto de datos de entrenamiento, lo que limita la evaluación objetiva de su rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-8B) con adaptador LoRA (PEFT) |
| Parametros totales | 8B en el modelo base; el adaptador LoRA ocupa 0,4 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Entrenado con secuencias de hasta 2048 tokens; el contexto nativo de Qwen3-8B no se especifica en la informacion disponible |
| Tipos de cuantizacion | Entrenamiento sobre base 4-bit NF4 (QLoRA); existe build MLX 4-bit fusionado para Apple Silicon |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (siguiendo el modelo base); las fuentes de datos de entrenamiento pueden tener sus propios terminos |
| Formato de pesos | safetensors (adaptador PEFT LoRA); build MLX 4-bit separado |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen3-8B, un transformer decoder-only de 8 mil millones de parametros. El ajuste se realizo con QLoRA: la base se cuantizo en 4 bits NF4 y se entrenaron los adaptadores de bajo rango con perdida calculada unicamente sobre los tokens del asistente. El entrenamiento uso TRL SFTTrainer, PEFT, bitsandbytes y Transformers, distribuido en 2 GPUs NVIDIA T4 (entorno Kaggle) con DDP via torchrun en fp16, durante 1 epoca y 1073 pasos de optimizacion con longitud maxima de secuencia de 2048 tokens. Se empleo checkpointing con reanudacion debido a reinicios por falta de memoria (CUDA OOM) a mitad del entrenamiento.

Los datos de entrenamiento consisten en una mezcla curada: datos de instruccion de ciberseguridad, registros fundamentados de CTI (CVE, CWE, ATT&CK, CAPEC), una muestra acotada de HolyCyber, trayectorias de uso de herramientas (shell, http_request, search, read_file, grep, python), investigaciones multi-turno, ejemplos de ambiguedad y falsos positivos, y una pequena mezcla de instrucciones generales para reducir el olvido catastrofico. Los datos se deduplicaron de forma exacta y se dividieron por entidad para que una misma entidad CVE/CWE/ATT&CK/CAPEC no aparezca en train, validacion y test. El conjunto de datos no se publica.

## Capacidades

- Generacion de texto y conversacion multi-turno orientada a dominios de ciberseguridad.
- Asistencia en pruebas de penetracion autorizadas, definicion de alcance (scoping) y redaccion de informes.
- Triaje de salidas de escaneres y analisis de falsos positivos.
- Ingenieria de deteccion, resumen de inteligencia de amenazas y notas de respuesta a incidentes.
- Revision de codigo seguro y recomendaciones de remediacion.
- Emision de llamadas a herramientas estructuradas en bucles de agente (tool calling / function calling): shell, http_request, search, read_file, grep y python.
- Flujos agenticos con razonamiento multi-paso dentro de un alcance autorizado.
- Calibracion en evidencia: entrenado para no afirmar una vulnerabilidad sin respaldo.
- Capacidades multilingues: no disponible (no se especifican idiomas).

## Casos de uso

- Asistencia en pruebas de penetracion autorizadas: el modelo puede ayudar a definir el alcance, proponer vectores de prueba y redactar hallazgos, apoyandose en su entrenamiento con datos CTI fundamentados y su capacidad de emitir llamadas a herramientas como shell o http_request dentro de un alcance autorizado.
- Triaje de salidas de escaneres: puede clasificar alertas y distinguir falsos positivos, ya que fue entrenado explicitamente con ejemplos de ambiguedad y falsos positivos, reduciendo el ruido en flujos de revision.
- Ingenieria de deteccion: puede redactar y revisar reglas de deteccion y resumir inteligencia de amenazas a partir de registros CVE, CWE, ATT&CK y CAPEC con los que fue entrenado.
- Respuesta a incidentes: puede generar notas estructuradas de investigacion multi-turno y resumir hallazgos, aprovechando su entrenamiento en investigaciones multi-turno y trayectorias de herramientas como grep o read_file.
- Revision de codigo seguro: puede analizar fragmentos de codigo y proponer remediaciones, integrable en pipelines de revision mediante su soporte de tool calling y su formato de adaptador ligero.
- Flujos agenticos de seguridad: puede operar en bucles de agente que invocan herramientas (shell, http_request, search, python) para tareas de reconocimiento o validacion dentro de un entorno controlado y autorizado.
- Despliegue en Apple Silicon: la existencia de un build MLX 4-bit fusionado permite ejecutar el modelo en equipos con chip Apple para tareas de analisis local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se ejecutaron el test de sanidad sobre datos reservados ni la comparativa base-vs-finetuned para esta release.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,4 GB, pero requiere cargar el modelo base Qwen3-8B completo para la inferencia.
- VRAM estimada para inferencia del modelo base en fp16: aproximadamente 16 GB; en cuantizacion 4-bit: aproximadamente 5-6 GB (estimacion orientativa, no confirmada en la informacion disponible).
- GPU recomendadas: NVIDIA A100 o H100 para fp16 sin cuantizar; RTX 4090 (24 GB) para fp16; GPUs con 8-12 GB para cuantizacion 4-bit.
- Cabe en GPUs de consumo como RTX 4090 en fp16 y en GPUs de 8-12 GB con cuantizacion 4-bit.
- Opciones de despliegue: Transformers + PEFT (carga del adaptador sobre la base), vLLM o TGI tras fusionar el adaptador, llama.cpp/Ollama si se convierte a GGUF, y MLX para Apple Silicon mediante el build 4-bit publicado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cyber Qwen3-8B Agent (este) | 8B (adaptador LoRA) | Entrenado a 2048 tokens | Ciberseguridad agentica | Apache-2.0 | Adaptador PEFT en HuggingFace |
| Qwen/Qwen3-8B (base) | 8B | no disponible en la informacion proporcionada | Proposito general | Apache-2.0 | Modelo completo en HuggingFace |
| Alternativas especializadas en ciberseguridad de 7-8B | no disponible | no disponible | Ciberseguridad | no disponible | no disponible |

La comparativa con otros modelos especializados en ciberseguridad no esta disponible en la informacion proporcionada. El unico punto de comparacion documentado es el modelo base Qwen3-8B, del que este adaptador hereda arquitectura y licencia.

## Limitaciones y advertencias

- Uso restringido a sistemas propios o con autorizacion escrita de prueba; no debe emplearse contra sistemas de terceros.
- No sustituye a un profesional de seguridad: las salidas pueden ser erroneas o estar desactualizadas, por lo que los hallazgos y detalles de CVE deben verificarse de forma independiente.
- No se han publicado benchmarks formales; el rendimiento real no esta validado objetivamente.
- Entrenado con secuencias de hasta 2048 tokens; el comportamiento con contextos mas largos no se ha probado.
- Hereda los sesgos y limitaciones de Qwen3-8B.
- El conjunto de datos de entrenamiento no se publica y las fuentes pueden tener terminos propios; deben revisarse antes de un uso comercial.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en detalles tecnicos de vulnerabilidades y CVE.
- Idiomas soportados no especificados; el comportamiento multilingue no esta documentado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/remix3030303/cyber-qwen3-8b-agent-lora
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Build MLX 4-bit fusionado para Apple Silicon: https://huggingface.co/remix3030303/cyber-qwen3-8b-agent-MLX-4bit
