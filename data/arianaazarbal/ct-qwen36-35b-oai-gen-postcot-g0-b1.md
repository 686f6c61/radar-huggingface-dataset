# arianaazarbal/ct-qwen36-35b-oai-gen-postcot-g0-b1

## Resumen

ct-qwen36-35b-oai-gen-postcot-g0-b1 es un adaptador LoRA de rango 64 entrenado sobre el modelo base Qwen/Qwen3.6-35B-A3B, publicado por el usuario arianaazarbal dentro del programa de entrenamiento iterado con constituciones autoredactadas (welfare-in-ai-rnd / constitutional_training). No es un modelo completo: el repositorio, de 4,5 GB, contiene unicamente los pesos del adaptador en formato safetensors, mas la constitucion semilla usada en el entrenamiento y un registro de exportacion de Tinker. Su interes es fundamentalmente de investigacion en alineacion, no de produccion.

El adaptador corresponde a la generacion 0 (g0) de la rama b1 de la cadena qwen36-35b-oai-gen-postcot. En este programa, cada generacion se entrena desde cero partiendo del modelo base sobre un corpus sintetico que instancia una constitucion concreta; la generacion 0 se siembra con un resumen de 5.000 tokens del Model Spec de OpenAI. La particularidad del diseno es que la deriva entre generaciones se acumula solo a traves de los documentos, nunca de los pesos, ya que cada generacion parte siempre del mismo modelo base.

La relevancia actual del artefacto es metodologica: permite auditar como un modelo de 35B parametros (3B activos segun la nomenclatura A3B) internaliza reglas de comportamiento expresadas en lenguaje natural mediante midtrain mas un post-entrenamiento de chat condicionado por constitucion, conservando las trazas de razonamiento. No se dispone de datos de licencia, idiomas, benchmarks ni de la arquitectura interna del modelo base en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen/Qwen3.6-35B-A3B; la arquitectura interna del modelo base no se detalla en la informacion disponible |
| Parametros totales | 35B en el modelo base, segun su denominacion; el adaptador LoRA ocupa 4,5 GB en el repositorio |
| Parametros activos | Aproximadamente 3B en el modelo base, inferido de la nomenclatura A3B; no confirmado en la informacion disponible |
| Longitud de contexto | 8192 tokens de longitud maxima durante el entrenamiento; la ventana de inferencia del modelo base no se especifica |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA | 64 |
| Modulos objetivo | all-linear |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Libreria | peft |
| Tarea | text-generation |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 64 aplicado sobre todos los modulos lineales del modelo base Qwen3.6-35B-A3B, un modelo de la familia Qwen cuya naturaleza exacta (transformer denso o mezcla de expertos) no se describe en la informacion disponible, aunque la nomenclatura A3B sugiere parametros activos reducidos. La receta esta bloqueada y documentada: learning rate 1e-4, scheduler coseno con 5 por ciento de warmup, 1 epoca, tamano de batch 128, longitud maxima de 8192 tokens y semilla de entrenamiento 42.

El entrenamiento se divide en dos etapas. La primera es un midtrain sobre un corpus sintetico que instancia una unica constitucion, en este caso un resumen de 5.000 tokens del Model Spec de OpenAI. La segunda etapa (post-train) continua desde el adaptador de la etapa 1 sobre datos de chat condicionados por constitucion, generados por Opus y con trazas de chain-of-thought conservadas. La innovacion metodologica es la iteracion de constituciones: en generaciones posteriores, la constitucion semilla la escribe el propio modelo de la generacion anterior, seleccionada como medoide de embeddings con filtrado sobre un pool de 40 cadenas autoredactadas. El repositorio incluye el fichero `training_seed_constitution.md` con la constitucion exacta de esta generacion y `tinker_meta.json` con el registro de exportacion.

## Capacidades

- Generacion de texto conversacional: adaptador de chat entrenado especificamente para responder condicionado por una constitucion explicita.
- Razonamiento explicito: el entrenamiento conserva las trazas de chain-of-thought y la model card indica servir y evaluar con el renderer `qwen3_5` y el razonamiento activado.
- Adherencia a politicas de comportamiento: el modelo esta optimizado para seguir reglas declaradas en lenguaje natural dentro del prompt de sistema o de la constitucion.
- Capacidades heredadas del modelo base: al ser un adaptador LoRA sobre Qwen3.6-35B-A3B, conserva las capacidades del modelo base, no documentadas en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada, mas alla del razonamiento con trazas.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio): no disponible.

## Casos de uso

- Investigacion en alineacion tipo constitutional AI: el adaptador permite estudiar como un modelo de 35B internaliza un conjunto de reglas escrito en lenguaje natural, aislando el efecto de los datos frente al de los pesos al partir siempre del mismo modelo base.
- Reproducibilidad de cadenas iterativas de constituciones: con semilla de entrenamiento fija (42) y receta bloqueada, la rama b1 sirve como replica independiente para comparar contra otras ramas de la misma generacion.
- Estudio de deriva (drift) entre generaciones: al comparar g0 con generaciones posteriores sembradas por constituciones autoredactadas, se puede medir como evoluciona el comportamiento cuando la constitucion la escribe el propio modelo.
- Auditoria de constituciones autogeneradas: el fichero `training_seed_constitution.md` y el pool de 40 cadenas autoredactadas permiten analizar que reglas emergen y cuales se pierden en cada iteracion.
- Generacion controlada de texto en entornos de investigacion: util para experimentos donde se necesita un modelo que respete un conjunto de directrices declaradas y exponga su razonamiento intermedio.
- Analisis de trazas de razonamiento: al conservar el chain-of-thought, sirve para estudiar la relacion entre razonamiento explicito y adherencia a la constitucion.
- Base para experimentos de post-entrenamiento comparados: el adaptador puede usarse como punto de partida de una etapa 2 alternativa, manteniendo el resto de la receta constante.
- Docencia y divulgacion tecnica: ejemplo reproducible de pipeline completo (midtrain, SFT condicionado, exportacion desde Tinker) con todos los hiperparametros publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni de evaluaciones de adherencia a la constitucion, y los resultados de la busqueda web no aportan datos tecnicos sobre el modelo.

## Requisitos de hardware

- Peso del adaptador: 4,5 GB en disco, cargable en cualquier GPU que pueda alojar el modelo base.
- VRAM estimada para el modelo base en bfloat16: alrededor de 70 GB, lo que exige multiples GPU (por ejemplo, 2x A100 80 GB, 2x H100 80 GB o configuraciones equivalentes). Estimacion derivada del numero de parametros, no confirmada en la informacion disponible.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 35-40 GB; con 4 bits, aproximadamente 18-22 GB. Estimaciones orientativas, no verificadas.
- GPU de consumo: con cuantizacion de 4 bits podria caber en una RTX 4090 de 24 GB, con margen ajustado; no hay confirmacion de que el modelo base sea compatible con dicha cuantizacion.
- Al ser un modelo con pocos parametros activos (aproximadamente 3B), la velocidad de decodificacion deberia ser mas propia de un modelo pequeno que de uno de 35B denso, siempre que la implementacion aproveche el enrutado de expertos. Latencia y throughput concretos: no disponibles.
- Opciones de despliegue: vLLM o TGI para servir el modelo base con el adaptador cargado; llama.cpp u Ollama requeririan convertir los pesos a GGUF, conversion no incluida en el repositorio. La carga mediante PEFT esta documentada con `PeftModel.from_pretrained`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ct-qwen36-35b-oai-gen-postcot-g0-b1 | Adaptador LoRA sobre 35B (aprox. 3B activos) | 8192 tokens en entrenamiento | no disponible | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3.6-35B-A3B (modelo base) | 35B segun denominacion (aprox. 3B activos) | no disponible | no disponible | HuggingFace |
| Otros adaptadores del programa constitutional_training | no disponible | no disponible | no disponible | no disponibles en la informacion proporcionada |

No se dispone de datos de rendimiento ni de otros adaptadores comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: sin una licencia explicita, no hay autorizacion clara para uso comercial; conviene tratar el artefacto como restringido a investigacion hasta confirmar los terminos con el autor y con la licencia del modelo base.
- Dependencia del modelo base: el repositorio solo contiene el adaptador; es imprescindible descargar Qwen/Qwen3.6-35B-A3B, cuyos terminos de uso se aplican de forma adicional.
- Idiomas no documentados: no hay informacion sobre cobertura multilingue ni sobre el idioma de los datos de entrenamiento, mas alla de que la constitucion semilla deriva del Model Spec de OpenAI, redactado en ingles.
- Riesgo de alucinacion: no hay evaluaciones publicadas de fidelidad, veracidad ni tasas de alucinacion para este adaptador.
- Sesgos: la constitucion semilla es un resumen del Model Spec de OpenAI y los datos de la etapa 2 fueron generados por Opus, por lo que el modelo hereda los sesgos y prioridades de ambas fuentes.
- Datos sinteticos sin validacion humana: el corpus de entrenamiento y las constituciones autoredactadas son sinteticos, sin verificacion externa documentada.
- Limite de contexto en entrenamiento: la longitud maxima fue de 8192 tokens, lo que puede degradar el comportamiento mas alla de ese umbral aunque el modelo base soporte ventanas mayores.
- Ausencia de validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin evaluaciones independientes.
- Artefacto de investigacion: los nombres de rama, generacion y regimen indican un experimento controlado, no un modelo listo para produccion.
- Incompatibilidad potencial de plantillas: la model card exige el renderer `qwen3_5` con razonamiento activado; usar otra plantilla de chat puede alterar el comportamiento de forma significativa.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/arianaazarbal/ct-qwen36-35b-oai-gen-postcot-g0-b1
- Modelo base Qwen/Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper, blog o repositorio del programa constitutional_training: no disponible en la informacion proporcionada
- Resultados de la busqueda web: no contienen enlaces relevantes para este modelo (corresponden a guias de marketing local)
