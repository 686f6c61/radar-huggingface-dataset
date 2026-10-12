# scottlowry/Qwen3.5-122B-A10B-oQ4e-fp16-mtp

## Resumen

Este repositorio contiene una version cuantizada del modelo Qwen3.5-122B-A10B, publicada por el usuario scottlowry bajo el identificador `scottlowry/Qwen3.5-122B-A10B-oQ4e-fp16-mtp`. Se trata de una conversion a 4 bits de un modelo de tipo `qwen3_5_moe` (arquitectura transformer con mezcla de expertos, segun el campo `model_type` de la model card) realizada con oQ, la herramienta de cuantizacion de precision mixta de oMLX v0.7.1.dev1, en formato MLX safetensors. El nombre del repositorio indica cuantizacion de 4 bits, presencia de componentes en fp16 y soporte de multi-token prediction (mtp), aunque estos dos ultimos extremos no se detallan en la informacion proporcionada.

El dato verificado de parametros totales, extraido de los ficheros safetensors, es de 125.086.497.008 parametros (aproximadamente 125,1 mil millones). La convencion de nomenclatura del nombre (122B-A10B) sugiere un modelo con 122 mil millones de parametros totales y unos 10 mil millones activos por token, propio de un diseno MoE disperso, si bien esa cifra de parametros activos no aparece confirmada en la informacion disponible. El repositorio ocupa 147,5 GB, un tamano coherente con pesos mayoritariamente en 4 bits pero con capas en fp16.

Su relevancia es practica mas que de investigacion: permite ejecutar un modelo MoE de gran tamano en hardware Apple Silicon con memoria unificada muy alta, algo impracticable con los pesos originales en fp16. El modelo acumula 34 descargas y 0 likes, y fue actualizado por ultima vez el 12 de octubre de 2026, tras una resubida de pesos el 11 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (transformer con mezcla de expertos, segun `model_type` de la model card) |
| Parametros totales | 125.086.497.008 (~125,1 mil millones) |
| Parametros activos | no confirmado; el nombre del repositorio (A10B) sugiere ~10 mil millones |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64, precision mixta oQ (oMLX v0.7.1.dev1); componentes en fp16 segun el nombre del repositorio |
| Idiomas soportados | no disponible |
| Licencia | no disponible en la informacion proporcionada |
| Formato de pesos | MLX safetensors (tamano del repositorio: 147,5 GB) |
| Libreria de inferencia | mlx |
| Fecha de creacion | 2026-07-24 |
| Ultima actualizacion | 2026-10-12 (pesos resubidos el 2026-10-11) |
| Descargas / likes | 34 / 0 |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo base como `qwen3_5_moe`, es decir, un transformer con capas de mezcla de expertos (MoE) y enrutamiento disperso por token. El unico dato de arquitectura confirmado es el numero total de parametros, 125.086.497.008, y la etiqueta de tipo de modelo de la model card. No se aportan detalles sobre el numero de expertos, el numero de expertos activados por token, la dimension del espacio latente, el tipo de atencion (completa, ventana deslizante o lineal) ni la existencia de capas hibridas.

Tampoco se documenta el proceso de entrenamiento del modelo base en esta model card, que es exclusivamente una ficha de cuantizacion: no hay datos sobre volumen de tokens, composicion del dataset, fases de ajuste (SFT, RLHF, DPO) ni tecnicas de decodificacion. Lo unico descrito es el proceso de cuantizacion: oQ (oMLX v0.7.1.dev1) con cuantizacion de precision mixta a 4 bits, group size 64 y salida en safetensors de MLX. El sufijo `mtp` del nombre apunta a multi-token prediction y `fp16` a que parte de las capas se mantienen en media precision, pero ningun detalle tecnico de esos dos aspectos aparece en la informacion suministrada.

## Capacidades

- Generacion de texto autoregresiva: capacidad inherente a un modelo de lenguaje causal de este tipo; no se documenta ninguna variante especifica en la model card.
- Razonamiento y conocimiento general: no disponible. No se publican evaluaciones ni descripciones de capacidades en la informacion proporcionada.
- Generacion de codigo: no disponible.
- Matematicas: no disponible.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Soporte multilingue: no disponible; no se enumeran idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible. El sufijo `mtp` del nombre sugiere multi-token prediction, pero no se confirma en la documentacion.
- Precision mixta: parte de los pesos estan en fp16 mientras el grueso esta en 4 bits, segun el nombre del repositorio; el detalle de que capas quedan en fp16 no se especifica.

## Casos de uso

- Inferencia local en estaciones de trabajo Apple Silicon de alta memoria: el modelo esta empaquetado en formato MLX y ocupa 147,5 GB, por lo que encaja en un Mac Studio con memoria unificada de 192 GB o superior. Es el escenario natural de esta publicacion: ejecutar un MoE de ~125.000 millones de parametros sin depender de GPUs NVIDIA ni de servicios en la nube.
- Entornos con requisitos estrictos de privacidad de datos: al poder ejecutarse en local sin conexion, es apto para procesar documentacion sensible (legal, sanitaria, financiera) dentro del perimetro de la organizacion, siempre que se valide la licencia del modelo base, dato no disponible aqui.
- Asistente de desarrollo en local para un equipo pequeno: con `mlx_lm.server` u oMLX se puede exponer una API compatible con OpenAI en la red interna y usarla como backend de autocompletado, revision de codigo o generacion de tests, sin coste por token.
- Procesamiento por lotes de documentacion larga: para tareas de resumen, clasificacion o extraccion sobre volumenes grandes de texto en un pipeline nocturno. La viabilidad depende de la longitud de contexto real, que no se especifica en la informacion disponible y debe verificarse antes de disenar el pipeline.
- Evaluacion comparativa de tecnicas de cuantizacion: este repositorio es util como artefacto de investigacion para medir la perdida de calidad de la cuantizacion mixta oQ a 4 bits frente a los pesos originales en fp16 o frente a cuantizaciones GGUF equivalentes.
- Generacion aumentada por recuperacion (RAG) autoalojada: el modelo puede actuar como generador final sobre fragmentos recuperados de una base documental interna, con la ventaja de no enviar datos a terceros; requiere confirmar contexto util y calidad multilingue.
- Laboratorio de investigacion con presupuesto de GPU limitado: permite estudiar comportamiento de modelos MoE de gran escala (enrutamiento, estabilidad de generacion) usando hardware de escritorio de Apple en lugar de clústeres de A100/H100.
- Base para ajuste fino con LoRA/QLoRA en MLX: al estar ya cuantizado a 4 bits, puede servir de punto de partida para adaptaciones ligeras a dominios concretos en hardware de una sola maquina, sujeto a la licencia aplicable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente describe el proceso de cuantizacion y no incluye metricas de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra evaluacion. Tampoco se aportan datos de perplejidad ni comparativas de calidad frente a los pesos originales.

## Requisitos de hardware

- VRAM / memoria unificada estimada para inferencia: el repositorio pesa 147,5 GB, por lo que se necesita un equipo con al menos ~160 GB de memoria disponible para cargar los pesos, mas margen para el contexto y el estado de la cache KV. Una configuracion de 192 GB de memoria unificada es el minimo razonable; 256 GB o 512 GB dan margen comodo para contextos largos.
- GPU recomendadas: el formato MLX esta disenado para Apple Silicon (familias M1/M2/M3/M4 Ultra y Max con memoria suficiente). Las GPUs NVIDIA (A100, H100, RTX 4090) no ejecutan MLX de forma nativa; seria necesaria una conversion previa a otro formato.
- Cabe en GPU de consumo: no en GPUs de consumo convencionales (RTX 4090 con 24 GB, RTX 5090 con 32 GB). Si cabe en configuraciones Apple Silicon de gama alta con memoria unificada de 192 GB o mas, que son equipos de escritorio pero no de gama de consumo masiva.
- Opciones de despliegue: `mlx-lm` (carga y generacion), `mlx_lm.server` (API HTTP), oMLX (la herramienta que genero la cuantizacion, orientada a ejecucion local). vLLM, TGI, llama.cpp y Ollama no consumen safetensors de MLX directamente; requeririan conversion a GGUF u otro formato.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo, tiempo hasta el primer token ni rendimiento bajo batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-122B-A10B-oQ4e-fp16-mtp (este repositorio) | 125.086.497.008 totales; activos no confirmados | no disponible | no disponible | no disponible | MLX safetensors, 4 bits, group size 64, 147,5 GB |
| Qwen3.5-122B-A10B (pesos originales del modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |
| Otras cuantizaciones del mismo modelo base (GGUF, AWQ, GPTQ) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables sobre modelos alternativos de la misma categoria en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento, contexto o licencia. La unica diferencia confirmable entre este repositorio y el modelo base es el formato y el nivel de cuantizacion.

## Limitaciones y advertencias

- Datos incompletos: la model card no incluye licencia, idiomas, contexto, parametros activos ni benchmarks, lo que impide evaluar su idoneidad para produccion sin consultar la ficha del modelo base.
- Licencia no especificada: al no indicarse licencia en la informacion disponible, no se puede garantizar el uso comercial. Es imprescindible verificar los terminos del modelo Qwen3.5-122B-A10B original antes de cualquier despliegue productivo.
- Riesgo de degradacion por cuantizacion: al tratarse de una cuantizacion a 4 bits con group size 64, es esperable cierta perdida de calidad frente a los pesos en fp16. No se aportan mediciones de perplejidad ni evaluaciones que cuantifiquen esa perdida, por lo que debe validarse en el caso de uso concreto.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos; no se documentan evaluaciones de factualidad ni tecnicas de mitigacion en esta publicacion.
- Confusion por nomenclatura: el repositorio se llama 122B pero los pesos contienen 125,086 mil millones de parametros. Puede deberse a la incorporacion de capas adicionales (por ejemplo, modulo de multi-token prediction) o a la propia contabilidad de parametros del modelo base; la model card no lo aclara.
- Repositorio actualizado: la model card avisa de que los pesos se resubieron el 11 de octubre de 2026 y de que las copias descargadas antes de esa fecha deben volver a bajarse. Verificar el hash de los ficheros si se usa en produccion.
- Trazabilidad limitada: el autor es un usuario individual, con 34 descargas y 0 likes en el momento de la consulta, sin repositorio de codigo asociado ni informe de evaluacion publicado.
- Compatibilidad restringida: el formato MLX safetensors limita su uso a Apple Silicon con `mlx-lm` u oMLX; no es directamente utilizable en ecosistemas CUDA sin conversion.
- Requisitos de memoria muy altos: 147,5 GB de pesos implican equipos poco comunes, lo que reduce la portabilidad y complica el despliegue distribuido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scottlowry/Qwen3.5-122B-A10B-oQ4e-fp16-mtp
- Herramienta de cuantizacion oQ / oMLX (referenciada en la model card): https://github.com/jundot/omlx
- Modelo base Qwen3.5-122B-A10B: enlace no disponible en la informacion proporcionada
- Paper, blog o demo oficial: no disponible
