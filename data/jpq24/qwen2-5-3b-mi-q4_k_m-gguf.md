# JPQ24/Qwen2.5-3B-MI-Q4_K_M-GGUF

## Resumen

Qwen2.5-3B-MI-Q4_K_M-GGUF es una distribucion cuantizada en formato GGUF del modelo Qwen/Qwen2.5-3B-Instruct, publicada por el usuario JPQ24 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una compresion selectiva del modelo base de Alibaba, en la que se ha aplicado una metodologia propia basada en perfilado de informacion mutua (Mutual Information, MI) para preservar las neuronas consideradas criticas en tres dominios cognitivos: ciencia, sentido comun y despacho de agentes.

El modelo conserva la arquitectura transformer densa de Qwen2.5-3B-Instruct, con 3.085.938.688 parametros totales y una ventana de contexto nativa de 32.768 tokens (caracteristica del modelo base Qwen2.5). La innovacion declarada por el autor no reside en el entrenamiento, sino en el proceso de cuantizacion: se registran activaciones a nivel de neurona y se mide su informacion mutua de Shannon frente a tres dominios, protegiendo las neuronas de mayor MI antes de exportar a Q4_K_M con llama.cpp. El objetivo declarado es mitigar el olvido catastrofico que, segun el autor, afecta a modelos pequenos de 3B cuando se cuantizan a baja precision.

Es relevante ahora porque los modelos de 3B son candidatos habituales para despliegue en hardware de consumo y en entornos de agentes con restricciones de VRAM. Esta release propone una alternativa a la cuantizacion Q4_K_M estandar, orientada especificamente a preservar adherencia a esquemas JSON y taxonomias de sentido comun, capacidades criticas en pipelines agenticos. La licencia Apache 2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), derivado de Qwen/Qwen2.5-3B-Instruct |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens) |
| Tipos de cuantizacion | Q4_K_M (GGUF); el repo incluye safetensors y GGUF |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF (model-Q4_K_M.gguf) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint Qwen2.5-3B-Instruct, un transformer decoder-only denso de la familia Qwen2.5 con 3.085.938.688 parametros. No se ha realizado entrenamiento adicional ni fine-tuning: la model card describe exclusivamente el proceso de cuantizacion. El autor registra activaciones a nivel de neurona y calcula informacion mutua de Shannon condicionada a un system prompt de enrutamiento simbolico, en tres dominios: Science Core (recuerdo academico de fisica, biologia y quimica), Common Sense & Taxonomy (aferencias fisicas cotidianas, distinciones culinarias y limites de categoria) y Agentic System Dispatch (despacho de herramientas zero-shot, adherencia a esquema JSON y seguimiento estricto de restricciones negativas).

Las neuronas con mayor MI en esos dominios se agrupan y protegen antes de exportar y cuantizar con Q4_K_M de llama.cpp. No se especifican en la informacion disponible el numero de tokens de entrenamiento del modelo base, la composicion del dataset, ni si hubo RLHF o DPO. Tampoco se detalla el tamano de la muestra de calibracion ni los hiperparametros del perfilado MI. La innovacion tecnica declarada es, por tanto, el esquema de cuantizacion selectiva guiada por MI, no cambios arquitectonicos.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-3B-Instruct.
- Razonamiento basico y recuerdo factual en dominios cientificos (quimica, fisica, biologia), segun los tests del autor.
- Razonamiento de sentido comun y taxonomico: distincion de categorias, aferencias fisicas de objetos y clasificaciones culinarias.
- Tool calling / function calling con generacion de objetos JSON validos y resolucion de argumentos booleanos.
- Seguimiento de restricciones negativas estrictas (omitir palabras prohibidas en la salida).
- Capacidades agenticas de despacho zero-shot y adherencia a esquema.
- Capacidades multilingues: no disponibles en la informacion proporcionada (el modelo base Qwen2.5 es multilingue, pero esta release no las documenta).
- No se declaran capacidades de vision, audio ni modo thinking explicito.

## Casos de uso

- Despacho de herramientas en agentes locales: el modelo genera objetos JSON validos con argumentos booleanos correctos, lo que permite integrarlo como enrutador de funciones en pipelines agenticos que corren en hardware de consumo con Ollama.
- Extraccion estructurada con restricciones negativas: el autor valida la extraccion de informes de incidentes en una sola linea, sin comillas y omitiendo palabras prohibidas, un patron util para tareas de limpieza y normalizacion de datos en produccion.
- Clasificacion taxonomica y de sentido comun: util para desambiguar categorias (por ejemplo, distinciones botanicas o culinarias) en sistemas de catalogacion o moderacion de contenido donde las alucinaciones taxonomicas son costosas.
- Asistente conversacional ligero en edge: con 3B parametros en Q4_K_M, cabe en GPUs de consumo y puede desplegarse como chatbot de atencion al cliente o asistente interno con baja latencia.
- Recuerdo factual cientifico en entornos educativos: el autor reporta 3/3 en pruebas de quimica, fisica y biologia, lo que lo hace candidato para tutores o asistentes de repaso con verificacion posterior.
- Prototipado rapido de agentes con Ollama: el repo incluye un Modelfile que permite crear y ejecutar el modelo con `ollama create` y `ollama run`, lo que agiliza la experimentacion local sin infraestructura dedicada.
- Generacion de codigo y scripts: aunque no se valida en la model card, hereda las capacidades de Qwen2.5-3B-Instruct para tareas de programacion ligeras, adecuadas para autocompletado o generacion de snippets en IDE.

## Benchmarks y rendimiento

Los unicos datos publicados son los del scorecard del autor sobre el GGUF Q4_K_M. No son benchmarks estandarizados (MMLU, HumanEval, GSM8K) y las muestras son muy pequenas, por lo que deben interpretarse con cautela.

| Test suite | Puntuacion | Tasa de acierto | Comportamientos verificados |
|---|---|---|---|
| Science Factual Recall | 3/3 | 100% | Recuerdo en quimica, fisica y biologia |
| Common Sense & Taxonomy | 3/4 | 75% | Aferencias fisicas de objetos y taxonomia alimentaria |
| Agentic (held-out, no visto) | 2/4 | 50% | Despacho JSON de herramientas y cumplimiento de restricciones negativas |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la informacion disponible. No se dispone de comparacion numerica con la cuantizacion Q4_K_M estandar del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB para el archivo Q4_K_M (3B parametros a ~4,5 bits por peso), mas overhead de contexto KV cache.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para contexto corto; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor contexto y throughput.
- Cabe en GPU de consumo: si, en tarjetas con 4-8 GB de VRAM (GTX 1660, RTX 3050, RTX 4060, etc.), y tambien en CPU via llama.cpp con RAM suficiente.
- Opciones de despliegue: Ollama (el repo incluye Modelfile), llama.cpp, y cualquier runtime compatible con GGUF; los tags indican `endpoints_compatible`. No se confirma soporte de vLLM o TGI para esta release GGUF concreta.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2.5-3B-MI-Q4_K_M-GGUF (este) | 3,09B | no disponible | Q4_K_M con perfilado MI | Apache 2.0 | Cuantizacion selectiva orientada a ciencia, sentido comun y agentes |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens | safetensors original | Apache 2.0 | Modelo base sin cuantizar; referencia de calidad completa |
| Qwen2.5-3B-Instruct Q4_K_M estandar | 3,09B | 32.768 tokens | Q4_K_M estandar | Apache 2.0 | Cuantizacion convencional sin proteccion de neuronas por MI |
| Llama-3.2-3B-Instruct | 3,21B | 128.000 tokens | multiples (GGUF, AWQ, etc.) | Llama 3.2 Community License | Alternativa de tamano similar con contexto mayor y licencia mas restrictiva |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada. La comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Los benchmarks del autor usan muestras muy pequenas (3, 4 y 4 casos), por lo que las tasas de acierto no son estadisticamente significativas.
- El modelo base Qwen2.5-3B-Instruct tiene 3B parametros: su capacidad de razonamiento complejo, matematicas avanzadas y codigo esta por debajo de modelos de 7B o superiores.
- Riesgo de alucinacion inherente al modelo base, especialmente en recuerdo factual fuera de los dominios perfilados.
- La cuantizacion Q4_K_M introduce perdida de precision respecto a los pesos originales en safetensors; el perfilado MI mitiga pero no elimina el olvido catastrofico.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion proporcionada.
- Idiomas soportados no documentados en esta release; el modelo base es multilingue, pero no se verifica el comportamiento tras la cuantizacion.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los terminos del modelo base Qwen2.5-3B-Instruct.
- El autor es un usuario individual (JPQ24) con 0 descargas y 0 likes en el momento de la consulta; no hay validacion externa de la metodologia MI ni del scorecard.
- El repositorio ocupa 14,3 GB, lo que sugiere que incluye tanto safetensors como GGUF; verificar que el archivo descargado es el correcto antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/JPQ24/Qwen2.5-3B-MI-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio llama.cpp (herramienta de cuantizacion citada): https://github.com/ggerganov/llama.cpp
- Ollama (runtime citado en la model card): https://ollama.com
- No se han encontrado papers, blogs, repos adicionales ni demos en la informacion proporcionada.
