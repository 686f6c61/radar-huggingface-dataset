# richardyoung/Qwen2.5-7B-Instruct-DiM-heretic-GGUF

## Resumen

Qwen2.5-7B-Instruct-DiM-heretic-GGUF es una cuantizacion en formato GGUF del modelo richardyoung/Qwen2.5-7B-Instruct-DiM-heretic, a su vez un derivado afinado del Qwen2.5-7B-Instruct de Alibaba. El autor, richardyoung, publica esta version orientada a inferencia local con llama.cpp y Ollama, empleando cuantizacion con matrices de importancia (imatrix). El modelo pertenece a la familia de variantes "abliterated" o "heretic", que buscan eliminar o reducir los mecanismos de rechazo del modelo original.

El modelo parte de la arquitectura transformer densa de Qwen2.5-7B-Instruct, con 7.615.616.512 parametros totales y una ventana de contexto nativa de 32.768 tokens (ampliable a 131.072 en el modelo base). La relevancia de esta ficha radica en que documenta una variante sin censura, distribuida bajo licencia Apache 2.0, que puede ejecutarse en hardware de consumo gracias a la cuantizacion GGUF.

No obstante, conviene advertir desde el inicio: el repositorio esta restringido (gated), requiere aceptar condiciones en Hugging Face, y no dispone de datos publicados de benchmarks propios. La informacion disponible sobre el proceso de "abliteration" concreto, la composicion del dataset de ajuste y los resultados de evaluacion es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (nativo en Qwen2.5-7B-Instruct); no se especifica en esta variante |
| Tipos de cuantizacion | GGUF (multiples niveles; imatrix); niveles concretos no disponibles |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base no cuantizado) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer denso con atencion por cabezas (GQA en el modelo base), normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El modelo original fue preentrenado por Alibaba sobre un corpus multilingue de aproximadamente 18 billones de tokens y posteriormente ajustado con instrucciones y preferencias (RLHF/DPO), aunque estos datos corresponden al modelo base Qwen2.5 y no han sido verificados para esta variante concreta.

Sobre esa base, richardyoung aplica una tecnica de "abliteration" o "heretic" que modifica los pesos para reducir la tendencia del modelo a rechazar peticiones. El proceso exacto (direcciones de rechazo eliminadas, capas afectadas, dataset de calibracion) no esta documentado en la informacion disponible. La version GGUF emplea cuantizacion con matrices de importancia (imatrix) para preservar la calidad en niveles bajos de bits, pero no se detallan los niveles publicados ni el metodo de calibracion.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones en ingles.
- Generacion de codigo y matematicas basicas (capacidades del modelo base).
- Soporte de tool calling / function calling (capacidad del modelo base Qwen2.5-Instruct; no verificada tras el proceso de abliteration).
- Capacidades reducidas o eliminadas de rechazo ante peticiones sensibles (objetivo del ajuste heretic).
- Soporte multilingue limitado: la ficha solo declara ingles como idioma.
- No se documentan capacidades de vision, audio ni modo "thinking" explicito.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como el proceso de abliteration afecta a la tasa de rechazos y a la calidad de las respuestas, comparandolo con el Qwen2.5-7B-Instruct original en tareas controladas.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que requiera tematicas que el modelo base rechazaria por defecto; adecuado por su ventana de contexto de 32.768 tokens para textos largos.
- Despliegue local con Ollama o llama.cpp: al estar en GGUF, puede ejecutarse en estaciones de trabajo sin GPU dedicada o con GPU de consumo, integrandose en flujos de trabajo offline.
- Prototipado de asistentes conversacionales: para pruebas internas de chatbots donde se necesite evaluar el comportamiento del modelo sin filtros antes de decidir sobre un modelo en produccion.
- Analisis de robustez de filtros: uso como caso de prueba para validar sistemas de moderacion externos que deban detectar contenido generado por modelos sin censura.
- Fine-tuning posterior en investigacion: servir como punto de partida para experimentos de ajuste donde se quiera partir de un modelo con menor sesgo de rechazo, siempre dentro de un marco de investigacion etica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones de tasa de rechazo para esta variante concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-5 GB en cuantizacion Q4, 6-7 GB en Q5, 8-9 GB en Q8 y en torno a 15 GB en FP16 (estimacion basada en 7.6B parametros; los niveles exactos publicados no estan disponibles).
- GPU recomendadas: RTX 3060 12 GB o superior para Q4/Q5; RTX 4070/4080/4090 para cuantizaciones mas altas; A100/H100 para FP16 o despliegues de alta concurrencia.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM usando cuantizaciones Q4/Q5.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (LM Studio, koboldcpp). vLLM y TGI no son la via principal para GGUF, aunque existen soportes parciales.
- Latencia y throughput: no disponibles. Dependeran del hardware y del nivel de cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-7B-Instruct-DiM-heretic-GGUF (este) | 7.6B | 32.768 (heredado) | Apache 2.0 | Variante abliterated, solo ingles declarado, gated |
| Qwen2.5-7B-Instruct | 7.6B | 32.768 (hasta 131.072) | Apache 2.0 | Modelo original con alineacion completa |
| Llama 3.1 8B Instruct | 8B | 128.000 | Llama 3.1 Community License | Alternativa de tamano similar, multilingue |
| Mistral 7B Instruct | 7.2B | 32.768 | Apache 2.0 | Alternativa densa de tamano comparable |

No se dispone de datos de rendimiento comparativo para esta variante concreta.

## Limitaciones y advertencias

- El proceso de abliteration reduce o elimina los rechazos de seguridad, lo que incrementa el riesgo de generar contenido danino, sesgado o inapropiado; no es apto para aplicaciones orientadas al publico sin moderacion externa.
- Riesgo elevado de alucinacion, comun en modelos de 7B y potencialmente agravado por el ajuste.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta verificado.
- La licencia Apache 2.0 permite uso comercial, pero el autor y la plataforma no ofrecen garantias sobre el comportamiento del modelo; el uso comercial de un modelo sin censura conlleva responsabilidad legal y reputacional.
- Repositorio restringido (gated): requiere aceptar condiciones en Hugging Face antes de la descarga.
- No hay benchmarks publicados ni documentacion del dataset de ajuste, lo que dificulta evaluar la degradacion de capacidades respecto al modelo base.
- El contexto efectivo puede verse reducido segun la configuracion de llama.cpp y la cuantizacion empleada.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-DiM-heretic-GGUF
- Modelo base (no cuantizado): https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-DiM-heretic
- Modelo original Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
