# sergolsub/mlx-onejev_1_5_9B

## Resumen

`mlx-onejev_1_5_9B` es una conversión a 8 bits en formato MLX del modelo `OmniJev/OneJev1.5-9B`, publicada por el usuario `sergolsub`. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: los pesos originales se han cuantizado a 8 bits y se han reorganizado para que puedan ejecutarse con la librería `mlx_lm` sobre Apple Silicon (chips M1/M2/M3/M4). El repositorio no incluye reentrenamiento ni cambios de arquitectura, según la propia model card.

El modelo subyacente tiene 9.409.813.744 parámetros (~9,4B), un tamaño que lo sitúa en la franja de los modelos "medianos" ejecutables en local con hardware de consumo razonablemente equipado. La etiqueta `qwen3_5` del repositorio sugiere una arquitectura de la familia Qwen 3.5, aunque la model card no lo confirma explícitamente. El repositorio ocupa 11,4 GB, coherente con pesos de 8 bits más tokenizador y ficheros auxiliares.

La relevancia de esta ficha es acotada y conviene ser transparente: el repositorio acumula 0 descargas y 0 likes en el momento de la consulta, no publica benchmarks, no declara idiomas soportados ni longitud de contexto, y su model card es fundamentalmente un envoltorio de la model card del modelo original. Su interés práctico es servir como punto de entrada para probar OneJev1.5-9B en Mac, no como referencia de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta `qwen3_5` sugiere familia Qwen 3.5; no confirmado en la model card) |
| Parametros totales | 9.409.813.744 (~9,4B), dato real de safetensors |
| Parametros activos | no disponible (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits en formato MLX (unica variante publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (heredada del modelo original; prevalece la LICENSE del repositorio upstream en caso de conflicto) |
| Formato de pesos | safetensors con layout MLX; incluye `config.json`, tokenizer, `chat_template.jinja` y ficheros auxiliares `*_mlx.py`, `decision_config.json`, `joint_config.json` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna mas alla de la etiqueta `qwen3_5` y del tamano declarado. La model card es explicita en un punto: la conversion a 8 bits "no incluye reentrenamiento ni cambios de arquitectura", por lo que cualquier detalle sobre capas, atencion, cabezas o funcion de activacion debe consultarse en el repositorio del modelo original `OmniJev/OneJev1.5-9B`, que no forma parte de la informacion proporcionada.

El unico elemento diferencial documentado es la presencia de ficheros de "glue" de inferencia (`*_mlx.py`, `decision_config.json`, `joint_config.json`), descritos en la model card como soporte para una posible "decision mode" con cabezas de decision/conjuntas. La model card no detalla en que consiste ese modo ni como activarlo, y no se aportan datos sobre volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas del modelo base.

## Capacidades

- Generacion de texto autoregresiva mediante `mlx_lm.generate`, segun el ejemplo de uso de la model card.
- Plantilla de chat incluida (`chat_template.jinja`), lo que permite formatear conversaciones multi-turno con el tokenizador del modelo.
- Posible "decision mode" con cabezas dedicadas, a juzgar por los ficheros `decision_config.json` y `joint_config.json`; el autor no documenta su funcionamiento ni su interfaz de uso.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles (no se declara lista de idiomas).
- Capacidades especiales (modo thinking, vision, audio): no documentadas.

## Casos de uso

- Pruebas de inferencia local en Mac: cargar el modelo con `mlx_lm.load` y generar respuestas en un portatil con Apple Silicon, sin GPU dedicada ni conexion a servicios en la nube.
- Evaluacion comparativa de cuantizacion: usar esta version de 8 bits frente a los pesos originales en bf16 para medir la perdida de calidad en tareas concretas del dominio propio, con el mismo prompt y la misma temperatura.
- Prototipado de asistentes conversacionales offline: la presencia de `chat_template.jinja` permite montar un chat multi-turno con `mlx_lm.server` y consumirlo con una API compatible con OpenAI en local.
- Desarrollo de pipelines de datos sensibles: al ejecutarse integramente en el equipo, el texto no sale del dispositivo, lo que encaja en escenarios con requisitos de confidencialidad (borradores internos, clasificacion de documentacion).
- Base para experimentos de research sobre cabezas auxiliares: los ficheros `decision_config.json` y `joint_config.json` permiten inspeccionar como el autor implemento el modo de decision y reutilizar ese patron en otros modelos.
- Entorno de pruebas para convertir y servir modelos en MLX: sirve como caso de estudio de un flujo completo (pesos upstream, cuantizacion, tokenizador, plantilla de chat) antes de replicarlo con modelos propios.
- Generacion de texto por lotes en estaciones de trabajo Mac: procesar ficheros de texto (resumenes, reescritura, extraccion) con un script que cargue el modelo una vez y reutilice el contexto en memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria: los pesos de 8 bits ocupan aproximadamente 9,4 GB (el repositorio completo son 11,4 GB). Con overhead de runtime y cache KV, el modelo necesita del orden de 12-16 GB de memoria unificada para arrancar con contextos cortos.
- Equipos recomendados: Mac con chip de la familia M (M1/M2/M3/M4) y 24 GB o 32 GB de memoria unificada para trabajar con comodidad; 16 GB es el minimo practico y deja poco margen para contextos largos.
- GPU CUDA: no es la via soportada. MLX esta disenado para Apple Silicon; en A100/H100/RTX 4090 habria que usar los pesos originales con otro runtime.
- Despliegue: `mlx_lm` (libreria Python), `mlx_lm.server` para exponer una API HTTP compatible con OpenAI, e integracion en herramientas que soporten MLX. vLLM y TGI no soportan MLX; llama.cpp/Ollama requeririan convertir los pesos a GGUF, conversion que este repositorio no incluye.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para esta conversion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| `sergolsub/mlx-onejev_1_5_9B` (este) | ~9,4B | no disponible | safetensors MLX 8 bits / `mlx_lm` | apache-2.0 | 0 descargas, 0 likes, sin benchmarks |
| `OmniJev/OneJev1.5-9B` (upstream) | ~9,4B | no disponible | safetensors (precision original) / transformers | apache-2.0 | Fuente del que deriva esta conversion; sin datos de rendimiento en la informacion disponible |
| Alternativas de ~9B ejecutables en local | no disponible | no disponible | no disponible | no disponible | No se han identificado en la informacion proporcionada modelos comparables con datos verificables |

No se dispone de datos de rendimiento del modelo ni de sus alternativas en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Ausencia total de validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones que permitan contrastar calidad.
- Sin benchmarks publicados: no hay evidencia empirica de rendimiento en MMLU, HumanEval, GSM8K ni tareas similares, ni del modelo original ni de esta conversion.
- Cuantizacion a 8 bits: aunque suele implicar perdidas menores, no se documenta ninguna evaluacion de degradacion respecto a los pesos originales. En tareas sensibles (codigo, matematicas) conviene validar antes de usar en produccion.
- Idiomas y contexto sin declarar: se desconoce el soporte real de castellano y el limite de tokens de entrada, lo que impide dimensionar prompts largos con garantias.
- Inconsistencia en el identificador: el ejemplo de la model card carga `sergolsub/mlx-onejev1.5-9b-8bit`, mientras que el ID real del repositorio es `sergolsub/mlx-onejev_1_5_9B`. El snippet puede fallar tal cual esta escrito; hay que sustituir el identificador.
- Dependencia de plataforma: MLX solo funciona en Apple Silicon con macOS reciente. No es desplegable en Linux con GPU NVIDIA sin reconvertir los pesos.
- Riesgo de alucinacion: no evaluado, como en cualquier modelo generativo sin benchmarks publicados; no hay informacion sobre entrenamiento con RLHF o filtros de seguridad.
- Sesgos: no disponibles. Se desconoce la composicion del corpus de entrenamiento del modelo original.
- Licencia: apache-2.0 permite uso comercial, pero la propia model card indica que prevalece la LICENSE del repositorio upstream en caso de conflicto. Conviene revisar el repo original antes de un despliegue comercial.
- Metadatos: las fechas de creacion y actualizacion (23 de octubre de 2026) son posteriores a la fecha habitual de consulta y no se acompanan de changelog ni de historial de versiones.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces encontrados eran contenido no relacionado y se han descartado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sergolsub/mlx-onejev_1_5_9B
- Modelo original: https://huggingface.co/OmniJev/OneJev1.5-9B
- Libreria MLX: https://github.com/ml-explore/mlx
- `mlx-lm` (carga, generacion y servidor): https://github.com/ml-explore/mlx-lm
- Papers, blogs, repos adicionales o demos: no disponibles en la informacion proporcionada.
