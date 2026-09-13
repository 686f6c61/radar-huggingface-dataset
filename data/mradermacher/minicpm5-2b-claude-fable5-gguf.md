# mradermacher/MiniCPM5-2B-Claude-Fable5-GGUF

## Resumen

Este repositorio contiene exclusivamente las cuantizaciones GGUF del modelo SauravMahalik/MiniCPM5-2B-Claude-Fable5, generadas por mradermacher (nethype GmbH). No es por tanto un modelo nuevo, sino una distribucion lista para inferencia local de un ajuste fino de 2.516.756.480 parametros (aproximadamente 2,5 mil millones) construido sobre la familia MiniCPM5. El modelo base fue entrenado mediante SFT con LoRA sobre el dataset saidutta69/fable-5-premium-v2, con enfasis declarado en tool use, trazas de agente (agent traces), chat e instruction following.

La relevancia de esta publicacion es practica: el repositorio ofrece doce variantes de cuantizacion que van de 1,1 GB (Q2_K) a 5,1 GB (f16), lo que permite ejecutar un modelo afinado para agentes en hardware de gama baja, incluidos portatiles sin GPU dedicada. Esto lo situa en el segmento de modelos pequenos orientados a bucles de agente y llamadas a herramientas, donde el coste por token y la latencia importan mas que el rendimiento bruto en benchmarks.

Los datos disponibles son limitados: la model card del cuantizador es generica y no incluye longitud de contexto, composicion del dataset de entrenamiento ni resultados de evaluacion. La busqueda web realizada no devolvio documentacion tecnica relevante sobre el modelo (los resultados obtenidos eran foros sin relacion con el proyecto), por lo que buena parte de las especificaciones figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (ajuste fino del modelo MiniCPM5-2B; el repositorio no describe la arquitectura interna) |
| Parametros totales | 2.516.756.480 (aprox. 2,52 B) |
| Parametros activos | No aplica / no disponible (no hay indicios de arquitectura MoE en la informacion proporcionada) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K (cuantizaciones estaticas; no hay variantes ponderadas/imatrix publicadas por el autor) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo base |
| Tamano del repositorio | 22,8 GB |
| Fecha de publicacion | 13 de septiembre de 2026 |
| Descargas / likes | 0 / 0 en el momento del registro |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura del modelo base. La unica informacion disponible es que se trata de un ajuste fino de MiniCPM5-2B realizado con SFT y LoRA (etiquetas `sft`, `lora`, `minicpm`), sobre el dataset saidutta69/fable-5-premium-v2, y que los pesos resultantes se publicaron primero en formato HuggingFace (safetensors) y despues se convirtieron a GGUF con el pipeline de mradermacher (`convert_type: hf`, `quantize_version: 2`, `output_tensor_quantised: 1`).

Las etiquetas del modelo (`tool-use`, `agent-traces`, `fable-5`, `instruction-following`, `chat`) sugieren que el dataset de ajuste contiene trazas de agente y ejemplos de uso de herramientas, ademas de conversacion general, y que el objetivo del ajuste es reproducir un estilo de respuesta asociado a "Claude"/"Fable 5". No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o preferencia despues del SFT. Tampoco se documentan innovaciones tecnicas como atencion lineal o decodificacion especulativa. Esta ausencia de informacion es en si misma un dato relevante para evaluar el modelo.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con formato de chat multi-turno.
- Seguimiento de instrucciones (instruction following), reforzado explicitamente en el ajuste.
- Uso de herramientas y function calling: el modelo se entreno sobre ejemplos etiquetados como `tool-use`, lo que indica soporte previsto para llamadas a funciones y APIs.
- Razonamiento de multiples pasos en formato de agente (`agent-traces`), es decir, cadenas de accion-observacion tipicas de frameworks de agentes.
- Generacion de codigo: no se documenta de forma especifica y no hay benchmarks que lo confirmen.
- Matematicas y razonamiento formal: no documentado ni evaluado en la informacion disponible.
- Vision, audio y multimodalidad: no disponible; el repositorio no incluye ficheros mmproj, lo que apunta a un modelo exclusivamente de texto.
- Modo de razonamiento explicito (thinking mode): no documentado.

## Casos de uso

- Agentes de automatizacion con function calling: el ajuste sobre trazas de agente permite usar el modelo como planificador de bajo coste en bucles de tipo ReAct, donde decide que herramienta invocar y con que argumentos. Su tamano de 2,5 B hace viable ejecutar varias instancias en paralelo para atender tareas concurrentes.
- Despliegue en el borde y en local: con la cuantizacion Q4_K_M (1,7 GB) el modelo cabe en equipos sin GPU dedicada o con GPU integrada, lo que permite asistentes de escritorio, plugins de IDE o herramientas internas que no pueden enviar datos a la nube por motivos de confidencialidad.
- Clasificacion y extraccion de informacion en pipelines: dados su tamano reducido y su soporte de instrucciones, es adecuado para tareas de etiquetado, resumen, normalizacion de campos y enrutado de consultas dentro de un sistema mayor donde un modelo grande solo se invoca en los casos dificiles.
- Atencion al cliente bilingue ingles-chino: el modelo cubre ambos idiomas de forma nativa, lo que permite un unico punto de despliegue para usuarios de habla inglesa y china en entornos de soporte de primer nivel.
- Generacion asistida en entornos de desarrollo: integrado como backend de un plugin o de un CLI, puede producir borradores de codigo, explicaciones y mensajes de commit, aceptando contexto del repositorio mediante llamadas a herramientas en lugar de depender solo del prompt.
- Prototipado rapido y evaluacion de pipelines de agente: al ser un GGUF de 1-2 GB, permite iterar sobre el diseno del agente (prompts, esquemas de herramientas, politica de reintentos) con coste de infraestructura minimo antes de migrar a un modelo mayor.
- Educacion e investigacion sobre ajuste fino: sirve como caso de estudio de un pipeline completo (SFT + LoRA sobre dataset sintetico, publicacion en safetensors y posterior cuantizacion GGUF) para analizar como se degradan las capacidades de tool use al bajar a Q3 y Q2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye evaluaciones de MMLU, HumanEval, GSM8K, BFCL ni de ningun otro conjunto, y la busqueda web no aporto documentacion tecnica asociada al modelo base ni al ajuste fino. Tampoco se publican mediciones de latencia o throughput.

## Requisitos de hardware

Estimaciones de VRAM calculadas a partir del tamano de archivo publicado, anadiendo margen para cache KV y sobrecarga del runtime (no son cifras oficiales del autor):

| Cuantizacion | Tamano en disco | VRAM estimada en inferencia |
|---|---|---|
| Q2_K | 1,1 GB | ~1,5-2,0 GB |
| Q3_K_M | 1,4 GB | ~2,0-2,5 GB |
| IQ4_XS | 1,5 GB | ~2,0-2,5 GB |
| Q4_K_S | 1,6 GB | ~2,0-2,5 GB |
| Q4_K_M | 1,7 GB | ~2,5-3,0 GB |
| Q5_K_M | 1,9 GB | ~2,5-3,5 GB |
| Q6_K | 2,2 GB | ~3,0-4,0 GB |
| Q8_0 | 2,8 GB | ~3,5-4,5 GB |
| f16 | 5,1 GB | ~6,0-7,0 GB |

- Cabe en cualquier GPU de consumo actual: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090, e incluso en GPUs de 4-6 GB con cuantizaciones Q3/Q4. Tambien es viable en CPU con 8 GB de RAM para Q4_K_M.
- GPUs de centro de datos (A100, H100, L40S) no son necesarias; solo tendrian sentido para servir muchas peticiones concurrentes por instancia.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python, text-generation-webui. vLLM incluye soporte GGUF experimental (preferible usar safetensors del modelo base para produccion). TGI no soporta GGUF. El autor remite a los README de TheBloke para el uso de ficheros GGUF y la concatenacion de partes.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

Los datos de la columna de este modelo proceden de la informacion proporcionada; los de las alternativas proceden de sus respectivas model cards publicas, no de la busqueda realizada. No es posible comparar rendimiento porque el modelo evaluado no publica benchmarks.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniCPM5-2B-Claude-Fable5 (este, GGUF) | 2,52 B | No disponible | Apache 2.0 | HuggingFace + GGUF (12 cuantizaciones) |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens nativos (128 K con YaRN) | Apache 2.0 | HuggingFace + GGUF comunitarios |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Llama 3.2 Community License | HuggingFace + GGUF |
| Gemma-2-2B-it | 2,61 B | 8.192 tokens | Gemma Terms of Use | HuggingFace + GGUF |

Frente a estas alternativas, el punto fuerte del modelo es el ajuste especifico para tool use y trazas de agente, junto con el soporte nativo de chino; sus puntos debiles son la falta total de documentacion tecnica, la ausencia de evaluaciones y un numero de descargas y likes nulo en el momento del registro, lo que implica nula validacion por parte de la comunidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste mejore al modelo base en tool use, razonamiento o codigo. Cualquier afirmacion de calidad seria una extrapolacion.
- Longitud de contexto desconocida: no se puede planificar su uso en escenarios de contexto largo ni estimar el coste de cache KV sin antes medirlo.
- Idiomas limitados a ingles y chino. El castellano no esta declarado como idioma soportado; su rendimiento en espanol es impredecible y deberia validarse antes de usarlo en produccion.
- Degradacion esperada en cuantizaciones bajas: Q2_K y Q3_K_S reducen el tamano a 1,1-1,3 GB, pero el propio autor advierte de "lower quality" en Q3_K_M. En modelos pequenos, el efecto de la cuantizacion sobre el seguimiento de instrucciones y el formato de las llamadas a herramientas suele ser notable.
- Riesgo de alucinacion elevado en tareas factuales: un modelo de 2,5 B ajustado sobre un dataset presumiblemente sintetico ("fable-5") tiende a reproducir el estilo del corpus de ajuste, incluida la seguridad con la que formula afirmaciones no verificadas.
- Dataset de ajuste no auditable: no se documentan su tamano, composicion, filtrado ni procedencia de los datos. Si contiene salidas generadas por otro modelo, pueden heredarse sesgos y errores de ese modelo, ademas de posibles restricciones de los terminos de uso del proveedor original.
- Sin alineamiento de seguridad documentado: no se mencionan fases de RLHF, DPO ni evaluaciones de seguridad. No debe desplegarse en canales de cara al publico sin una capa adicional de moderacion.
- Licencia Apache 2.0 en este repositorio, lo que permite uso comercial de las cuantizaciones, pero conviene verificar la licencia y las condiciones del modelo base y del dataset antes de un uso comercial, ya que el repositorio no las detalla.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento del registro, sin issues ni discusiones que permitan contrastar el comportamiento real del modelo.
- No hay garantia de mantenimiento: el autor indica que las cuantizaciones ponderadas/imatrix probablemente no se publicaran, y las solicitudes de nuevas variantes dependen de peticiones en la seccion de discusiones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MiniCPM5-2B-Claude-Fable5-GGUF
- Modelo base (safetensors): https://huggingface.co/SauravMahalik/MiniCPM5-2B-Claude-Fable5
- Dataset de ajuste: https://huggingface.co/datasets/saidutta69/fable-5-premium-v2
- Pagina de resumen de descargas del cuantizador: https://hf.tst.eu/model#MiniCPM5-2B-Claude-Fable5-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de perplejidad entre cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia para el uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF

Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos correspondian a foros sin relacion con el proyecto. No se dispone de paper, blog tecnico ni demo oficial.
