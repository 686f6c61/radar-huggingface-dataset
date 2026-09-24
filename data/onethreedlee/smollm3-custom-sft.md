# onethreedlee/SmolLM3-Custom-SFT

## Resumen

SmolLM3-Custom-SFT es un ajuste fino supervisado (SFT) del modelo SmolLM3-3B-Base de Hugging Face, publicado por el usuario onethreedlee en Hugging Face. Se trata de un modelo decoder-only de 3.075.098.624 parámetros (aproximadamente 3,08 mil millones) orientado a generación de texto conversacional, con especial énfasis en seguimiento de instrucciones y diálogo. El entrenamiento se realizó con la librería TRL (versión 1.13.0) sobre Transformers 5.17.0 y PyTorch 2.14.0, y los pesos se distribuyen en formato safetensors.

El interés de esta ficha es doble. Por un lado, documenta un fine-tune comunitario de la familia SmolLM3, pensada por Hugging Face para ejecutarse en dispositivo ("on-device") manteniendo un rendimiento competitivo en razonamiento, contexto largo y multilingüismo. Por otro, sirve de advertencia metodológica: la model card es prácticamente una plantilla autogenerada por TRL, sin dataset, hiperparámetros, licencia ni idiomas declarados, y el campo `base_model` apunta al propio repositorio en lugar del modelo original, lo que dificulta la trazabilidad y la evaluación rigurosa.

A nivel de arquitectura, este fine-tune hereda la del modelo base SmolLM3-3B: transformer con Grouped Query Attention, ventana de contexto de hasta 64K tokens y capacidad de razonamiento híbrido (modos "thinking" y "no thinking"). No se han publicado resultados de evaluación propios de este ajuste, por lo que cualquier decisión de adopción debería basarse en una validación empírica por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM3-3B: Grouped Query Attention, sin MoE) |
| Parametros totales | 3.075.098.624 (3,08 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 64K tokens en el modelo base SmolLM3-3B; no verificado para este fine-tune |
| Tipos de cuantizacion | No disponible. El repositorio solo publica safetensors en precision completa; no hay GGUF, AWQ, GPTQ ni bitsandbytes publicados |
| Idiomas soportados | No disponible en la ficha del fine-tune. El modelo base SmolLM3-3B declara 6 idiomas: ingles, frances, aleman, espanol, italiano y portugues |
| Licencia | No disponible. La model card incluye un campo `licence: license` sin contenido. El modelo base SmolLM3-3B se publica bajo Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 36,9 GB (muy superior a los ~6,2 GB de un 3B en bf16, lo que sugiere checkpoints de entrenamiento o estados del optimizador incluidos) |
| Modelo base declarado | `onethreedlee/SmolLM3-Custom-SFT` (campo incorrecto, apunta a si mismo). Fuentes externas indican HuggingFaceTB/SmolLM3-3B-Base |
| Metodo de entrenamiento | SFT con TRL 1.13.0 |
| Fecha de publicacion | 23 de septiembre de 2026 (segun metadatos de Hugging Face) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia SmolLM3 de Hugging Face: un transformer decoder-only de 3B parametros disenado para inferencia eficiente en dispositivo, con atencion de consultas agrupadas (GQA) para reducir el coste de memoria de la cache KV y con soporte de contexto largo de hasta 64K tokens. El modelo base SmolLM3-3B incorpora ademas un esquema de razonamiento hibrido que alterna un modo de razonamiento explicito ("thinking") y un modo directo ("no thinking"), y fue entrenado de forma multilingue en seis idiomas. Estas caracteristicas son las del modelo base; la model card de este fine-tune no confirma que se hayan preservado ni describe ninguna modificacion arquitectonica.

En cuanto al entrenamiento, la unica informacion disponible es que se aplico SFT (supervised fine-tuning) mediante TRL 1.13.0 sobre Transformers 5.17.0, PyTorch 2.14.0, Datasets 5.0.1 y Tokenizers 0.23.2. No se especifican el dataset utilizado, su composicion, el numero de tokens de entrenamiento, la duracion, los hiperparametros (learning rate, batch size, schedule) ni si hubo fases posteriores de DPO, RLHF o RLVR. Tampoco se documenta ninguna innovacion tecnica propia: es un ajuste de instrucciones y dialogo sobre el modelo base. El repositorio de 36,9 GB es considerablemente mayor de lo que requiere un 3B en bf16, lo que apunta a que se subieron artefactos intermedios no depurados, un aspecto a revisar antes de descargarlo en produccion.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones: es el objetivo declarado del ajuste SFT segun la descripcion publica del modelo.
- Razonamiento: el modelo base SmolLM3-3B soporta razonamiento paso a paso y modos de pensamiento hibridos; no esta documentado si este fine-tune conserva dichos modos tras el SFT.
- Contexto largo: el modelo base admite hasta 64K tokens, lo que habilita tareas sobre documentos extensos, siempre que el fine-tune no haya degradado esta capacidad.
- Multilingue: el modelo base cubre ingles, frances, aleman, espanol, italiano y portugues; la ficha de este ajuste no declara idiomas, por lo que el soporte real no esta verificado.
- Tool calling / function calling: no disponible. No hay evidencia en la model card de que se haya entrenado con plantillas de herramientas, por lo que no deberia asumirse esta capacidad.
- Capacidades de agente y razonamiento multi-paso: no disponibles ni documentadas para este fine-tune.
- Vision y audio: no soportados. SmolVLM es una linea separada de la familia.
- Capacidad especial confirmada: ninguna adicional mas alla de la generacion de texto.

## Casos de uso

- Asistente conversacional ligero en produccion: el modelo permite gestionar dialogos multi-turno con un coste de inferencia bajo gracias a sus 3,08B de parametros, adecuado para desplegar en una unica GPU o incluso en CPU con cuantizacion. Antes de usarlo en produccion conviene validar la calidad del ajuste con un conjunto propio de prompts.
- Prototipado rapido de aplicaciones de texto: al cargarse con `transformers.pipeline`, permite iterar sobre ideas de producto (resumen, reescritura, respuestas a preguntas) sin infraestructura compleja, como muestra el ejemplo de la propia model card.
- Procesamiento de documentos largos si se confirma el contexto de 64K: analisis de contratos, informes tecnicos o hilos de correo extensos en una sola pasada, evitando estrategias de chunking y recuperacion.
- Generacion de texto en seis idiomas (condicionado al comportamiento heredado del base): localizacion de contenidos, borradores de correo o atencion al cliente en mercados europeos, siempre con validacion humana en idiomas distintos del ingles.
- Ejecucion en dispositivo o en el borde: con 3,08B de parametros y cuantizacion a 4 bits, cabe en GPUs de consumo y en equipos con 8 GB de VRAM, lo que lo hace apto para asistentes locales que no envian datos a la nube.
- Educacion y generacion de material didactico: redaccion de explicaciones, ejercicios y resumenes de apuntes, con revision posterior por parte del docente para mitigar alucinaciones.
- Filtrado y clasificacion de texto (uso no generativo): puede emplearse como generador de etiquetas o de resumenes previos a un pipeline clasico de NLP, aunque no esta evaluada su robustez en estas tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion (ni MMLU, ni GSM8K, ni HumanEval, ni evaluaciones multilingues), y tampoco se han encontrado resultados de terceros para este fine-tune concreto. Cualquier cifra que se cite sobre el modelo base SmolLM3-3B (por ejemplo, en la documentacion oficial del proyecto) corresponde al modelo original y no necesariamente al comportamiento de este ajuste SFT.

## Requisitos de hardware

- VRAM estimada en inferencia: aproximadamente 6,2 GB en bf16/fp16; unos 3,2 GB en cuantizacion de 8 bits; alrededor de 1,8-2,0 GB en cuantizacion de 4 bits. A estos valores hay que sumar el coste de la cache KV, que crece con la longitud de contexto (notable en ventanas cercanas a 64K tokens).
- Caber en GPU de consumo: si. Modelos de 3B en 4 u 8 bits funcionan en RTX 3060 (12 GB), RTX 4060 Ti (8-16 GB), RTX 4070, RTX 4080 y RTX 4090 sin dificultad. En bf16, una GPU con 8 GB es suficiente para contextos cortos.
- GPU profesionales: A100 (40/80 GB), H100 (80 GB), L40S o A10G permiten servir multiples replicas o lotes grandes con ventanas de contexto largas.
- Despliegue: al publicarse unicamente safetensors, la via directa es `transformers` (incluido `pipeline`), o servidores compatibles como vLLM y TGI. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, un paso no documentado por el autor. El repositorio esta etiquetado como `endpoints_compatible`, lo que indica compatibilidad con los Inference Endpoints de Hugging Face.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion, y dependeran del hardware, del backend y de la cuantizacion elegida.
- Almacenamiento: el repositorio ocupa 36,9 GB, muy por encima de los ~6,2 GB esperables para los pesos en bf16. Conviene inspeccionar el arbol de ficheros antes de descargarlo completo.

## Comparativa con modelos similares

Datos de los modelos comparables segun su documentacion publica; conviene verificarlos antes de decisiones de produccion. Para este fine-tune no hay datos de rendimiento disponibles.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SmolLM3-Custom-SFT (este modelo) | 3,08 B | No verificado (base: 64K) | No disponible (base: Apache-2.0) | Hugging Face, solo safetensors, 0 descargas | Fine-tune SFT comunitario, sin benchmark ni dataset documentado |
| SmolLM3-3B-Base / Instruct | 3,0 B | 64K | Apache-2.0 | Hugging Face, ampliamente descargado | Modelo oficial, multilingue en 6 idiomas, razonamiento hibrido, documentacion completa |
| Qwen2.5-3B | 3,0 B | 32K nativo, 128K con YaRN | Licencia especifica de Qwen (revisar) | Hugging Face | Fuerte en codigo y matematicas, amplio ecosistema de cuantizaciones |
| Llama-3.2-3B | 3,2 B | 128K | Licencia comunitaria de Llama 3.2 | Hugging Face, Meta | Buen soporte de herramientas y adopcion industrial |
| Gemma-2-2B | 2,6 B | 8K | Terminos de uso de Gemma | Hugging Face, Google | Tamano inferior, contexto mas corto, buen rendimiento por parametro |

## Limitaciones y advertencias

- Trazabilidad deficiente: el campo `base_model` apunta al propio repositorio, no al modelo original, y la model card es una plantilla autogenerada por TRL. No se documenta dataset, numero de tokens, hiperparametros ni proceso de evaluacion.
- Licencia indeterminada: la model card incluye `licence: license` sin especificar terminos. Aunque el modelo base SmolLM3-3B es Apache-2.0, la licencia de este derivado no esta declarada, lo que supone un riesgo juridico para uso comercial. Es imprescindible aclararlo con el autor antes de cualquier despliegue en produccion.
- Riesgo de alucinacion: inherente a los modelos de 3B sin evaluacion publicada. No hay datos que cuantifiquen su tasa de error, por lo que se recomienda verificacion humana o mecanismos de grounding en tareas factuales.
- Idiomas no declarados: la ficha no especifica idiomas soportados. El comportamiento multilingue solo puede inferirse del modelo base y debe validarse empiricamente, especialmente en espanol.
- Tool calling y uso como agente no verificados: no hay evidencia de entrenamiento con plantillas de funciones, por lo que integrarlo en pipelines de agentes requiere pruebas previas.
- Degradacion potencial del contexto largo: los ajustes SFT sobre datasets de dialogo corto pueden reducir la capacidad efectiva de manejar 64K tokens; no hay evaluacion al respecto.
- Confusion de repositorios: existen copias con nombres practicamente identicos publicadas por otros usuarios (`msquaredd/SmolLM3-Custom-SFT-20250910143319`, `veltrox/SmolLM3-Custom-SFT`). Verifica el autor y el commit exactos antes de descargar.
- Repositorio sobredimensionado: 36,9 GB frente a los ~6,2 GB esperables para los pesos, lo que puede indicar artefactos de entrenamiento residuales.
- Adopcion nula: 0 descargas y 1 "me gusta" en el momento de la consulta. No existe comunidad que haya reportado problemas ni correcciones.
- Fecha de publicacion inusual (2026) en los metadatos: conviene confirmar que los ficheros publicados corresponden a la version que se pretende usar.
- Sin cuantizaciones oficiales: no hay GGUF, AWQ ni GPTQ publicados, lo que obliga a convertirlos manualmente si se quiere desplegar en llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/onethreedlee/SmolLM3-Custom-SFT
- Space asociado al entrenamiento: https://huggingface.co/spaces/onethreedlee/huggingface-static-e054d1
- Modelo base referenciado en fuentes externas: https://huggingface.co/HuggingFaceTB/SmolLM3-3B-Base
- Documentacion oficial de SmolLM3: https://smollm3.org/
- Repositorio de la familia SmolLM y SmolVLM: https://github.com/huggingface/smollm
- Libreria TRL utilizada para el entrenamiento: https://github.com/huggingface/trl
- Copia de otro usuario: https://huggingface.co/msquaredd/SmolLM3-Custom-SFT-20250910143319
- Copia de otro usuario: https://huggingface.co/veltrox/SmolLM3-Custom-SFT
