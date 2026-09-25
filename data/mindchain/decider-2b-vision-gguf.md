# mindchain/decider-2b-vision-GGUF

## Resumen

decider-2b-vision-GGUF es la version cuantizada en formato GGUF del modelo Mapika/decider-2b-vision, publicada por el usuario mindchain. Se trata de un modelo de vision-lenguaje de aproximadamente 1.881.825.088 parametros (unos 1,88 mil millones) orientado a producir "decisiones tipadas" a partir de una imagen en un unico forward pass: entra una imagen de camara y salen decisiones acompanadas de probabilidades calibradas. El autor lo posiciona como el eslabon del "camino de camara" dentro de la cadena Tier-0/1 de su stack JEV, pensado para Android, GPUs antiguas y dispositivos de borde.

El modelo base se construye, segun la model card, sobre una base Qwen3.5-2B con pesos de texto v5, y hereda el patron de proyector visual f16 habitual en la familia Qwen-VL/smolVLM. El repositorio distribuye dos ficheros: el GGUF de texto/decision en Q4_K_M (1,27 GB) y el proyector multimodal mmproj en f16 (668 MB), lo que suma aproximadamente 1,94 GB de pesos y permite ejecucion en GPU de gama media o incluso en CPU.

Su relevancia actual es acotada pero concreta: cubre el nicho de modelos de decision pequenos, cuantizados y desplegables localmente con llama.cpp, con salida probabilistica en lugar de texto generativo libre. La model card advierte de un problema de toolchain en versiones recientes de llama.cpp que produce GGUFs qwen3_5_text defectuosos, por lo que la reproducibilidad depende de fijar el commit. El repositorio no tiene descargas ni likes registrados en el momento de la consulta y no incluye datos de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en Qwen3.5-2B (qwen3_5_text registrado en `qwen.py` y variante VL en `qwen3vl.py`), con proyector visual independiente (mmproj) |
| Parametros totales | 1.881.825.088 (aprox. 1,88 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (parte de texto/decision), f16 (proyector mmproj) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (dos ficheros: modelo principal y mmproj) |

Datos adicionales de distribucion:

| Parametro | Valor |
|---|---|
| Autor del quant | mindchain |
| Modelo base | Mapika/decider-2b-vision |
| Revision del modelo base | 863e290863655f1d6b69324d77d09ac972d21609 (commit fijado; el repositorio base no tiene tags) |
| Tamano del repositorio | 1,9 GB |
| Ficheros | `decider-2b-vision.Q4_K_M.gguf` (1,27 GB), `mmproj-decider-2b-vision-f16.gguf` (668 MB) |
| Toolchain de conversion | llama.cpp commit `9575389`: ruta de texto con `--no-mtp` en bf16 a Q4_K_M; mmproj exportado aparte con `--mmproj --outtype f16` |
| Fecha de creacion en el Hub | 2026-09-25 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento del modelo base en la informacion proporcionada: no hay datos de numero de tokens, composicion del dataset ni uso de RLHF o DPO. Lo que si documenta el repositorio es la topologia de inferencia: un modelo de lenguaje tipo transformer (base Qwen3.5-2B, pesos de texto v5) acoplado a un proyector visual exportado en f16, siguiendo el esquema de dos ficheros de llama.cpp (`-m` para el modelo principal y `--mmproj` para el codificador/proyector de vision). El autor describe la tarea como "typed decisions from an image in one forward pass", es decir, clasificacion/decision con salida probabilistica calibrada en lugar de generacion de texto abierta.

La innovacion destacable no esta en la arquitectura sino en el pipeline de cuantizacion y en el caso de uso. La conversion se realizo con un commit concreto de llama.cpp (`9575389`) usando la ruta de texto `--no-mtp` y bf16 como paso previo a Q4_K_M, mientras que el proyector se exporto por separado en f16. La model card incluye una advertencia explicita: la rama master de llama.cpp (`e351231`, septiembre de 2026) genera GGUFs de `qwen3_5_text` con metadatos incorrectos y pesos desplazados, produciendo salidas corruptas (`?`); por tanto, la reproducibilidad exige fijar el commit indicado. Tambien se menciona que la temperatura de lectura del modelo de texto hermano (decider-2b) es T=1.03, y que la temperatura especifica de la variante de vision se encuentra en el paquete `decider/` del repositorio upstream, con la recomendacion de verificar el readout contra el original en bf16 antes de usarlo en produccion.

## Capacidades

- Percepcion de imagen: acepta imagenes de camara como entrada y produce una decision en un unico forward pass, segun la descripcion del autor.
- Salida probabilistica: el modelo devuelve probabilidades calibradas junto con la decision, no solo una etiqueta discreta. El autor recomienda verificar la calibracion contra el readout del modelo en bf16.
- Decision tipada ("typed decisions"): la salida esta estructurada en categorias de decision predefinidas, lo que facilita su integracion en logica de control.
- Modelo de decision estilo "system one": los tags del repositorio lo etiquetan como `decision-model` y `system-one`, es decir, orientado a respuestas rapidas de baja latencia mas que a razonamiento multi-paso.
- Ejecucion local y en borde: formato GGUF compatible con llama.cpp, pensado para Android, GPUs antiguas y hardware de borde.
- Componente de texto/decision: el fichero principal es un modelo de texto Qwen3.5-2B con pesos v5, utilizado como cabeza de decision.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible; el enfoque declarado es de decision en un solo paso.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas soportados.
- Capacidades especiales adicionales (modo thinking, audio, etc.): no disponibles en la informacion proporcionada.

## Casos de uso

- Pre-filtrado en pipelines de vision por etapas: dentro de la cadena Tier-0/1 descrita por el autor, el modelo actua como primer nivel que descarta o etiqueta frames antes de invocar un modelo mayor y mas costoso. Su tamano de 1,27 GB en Q4_K_M permite mantenerlo residente en memoria junto a otros servicios.
- Despliegue en Android y dispositivos de borde: al ser un GGUF con soporte de llama.cpp y pesar menos de 2 GB en total (incluido el proyector), puede ejecutarse en telefonos o placas embebidas sin acceso a la nube, cubriendo escenarios con requisitos de privacidad o sin conectividad.
- Coexistencia con otros servicios en una GPU antigua: la model card indica explicitamente que la version Q4, de unos 1,3 GB, funciona en una GTX 1070 compartiendo GPU con otros procesos, lo que habilita despliegues de bajo coste en hardware heredado.
- Clasificacion y control por camara en automatizacion: la salida tipada con probabilidades permite convertir la prediccion en una accion de control (aceptar, rechazar, escalar a revision) dentro de un PLC o servicio de orquestacion, con umbrales ajustables sobre la probabilidad devuelta.
- Moderacion visual en local: filtrado previo de imagenes en aplicaciones de mensajeria o plataformas de contenido, donde la inferencia on-device evita enviar material sensible a servicios externos.
- Investigacion sobre calibracion y modelos de decision: la combinacion de salida probabilistica y modelo pequeno lo hace util para experimentos de calibracion, comparacion de cuantizaciones (Q4_K_M frente a bf16) y estudio de compromisos latencia/precision en modelos de "system one".
- Prototipado rapido con llama-server: el par de ficheros se levanta con un unico comando de `llama-server`, lo que permite tener una API compatible con endpoints conversacionales para validar una idea de producto de vision en horas en lugar de dias.
- Robotica educativa y prototipos con sensores: como modulo de decision visual de bajo consumo en plataformas docentes, siempre que se validen los umbrales de decision con datos propios del dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, MMMU ni metricas de tareas visuales, y en el momento de la consulta acumula 0 descargas y 0 likes, por lo que tampoco existen evaluaciones de terceros. La unica referencia cuantitativa de rendimiento es funcional: el quant Q4_K_M (~1,3 GB) se ejecuta en una GTX 1070 junto a otros servicios, sin cifras de latencia ni throughput publicadas.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos suman aproximadamente 1,94 GB (1,27 GB del GGUF Q4_K_M mas 668 MB del mmproj f16). Con cache KV, buffer de contexto y activaciones del codificador visual, una estimacion razonable se situa en el entorno de 2,5 a 4 GB de VRAM, aunque no hay cifras oficiales publicadas.
- GPU recomendadas: el autor menciona una GTX 1070 (8 GB) como hardware de referencia en produccion. Cualquier GPU con 4 GB o mas de VRAM deberia ser suficiente; no se han documentado pruebas en A100, H100 ni RTX 4090, donde el modelo quedaria limitado por latencia de kernel mas que por memoria.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de consumo de gama baja y media (GTX 1070, GTX 1660, RTX 3050/3060, etc.) y tambien en iGPUs con memoria unificada suficiente.
- Ejecucion en CPU: viable por el tamano; requiere aproximadamente 2 GB de RAM para los pesos, mas el espacio de contexto.
- Opciones de despliegue: llama.cpp mediante `llama-server` con los dos ficheros (`-m modelo --mmproj proyector -ngl 99`); cualquier otro runtime compatible con GGUF y proyector multimodal (por ejemplo, wrappers basados en llama.cpp). La compatibilidad con Ollama, vLLM o TGI no esta documentada en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles. La model card no publica mediciones de tokens por segundo ni de milisegundos por inferencia.
- Advertencia de toolchain: se debe fijar llama.cpp al commit `9575389` (o posterior corregido); la rama master en `e351231` (septiembre de 2026) produce GGUFs `qwen3_5_text` defectuosos.

## Comparativa con modelos similares

No se dispone, en la informacion proporcionada, de datos de benchmarks, contexto, idiomas ni rendimiento de modelos alternativos, por lo que no es posible establecer una comparativa cuantitativa. La unica referencia del propio autor es arquitectonica: el proyector visual en f16 sigue el esquema habitual de Qwen-VL y smolVLM, y la base de texto es Qwen3.5-2B.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| mindchain/decider-2b-vision-GGUF | 1,88 B (1.881.825.088) | no disponible | apache-2.0 | GGUF (Q4_K_M + mmproj f16) | no disponible |
| Mapika/decider-2b-vision (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada (el quant hereda apache-2.0) | no disponible en la informacion proporcionada | no disponible |
| Alternativas de vision-lenguaje de ~2 B (Qwen-VL, smolVLM y similares) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible |

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay metricas publicas de precision, calibracion ni robustez, ni en el repositorio ni en evaluaciones de terceros. Cualquier uso en produccion requiere una evaluacion propia sobre datos del dominio.
- Calibracion no verificada: el propio autor advierte de que la temperatura de lectura de la variante de vision debe verificarse contra el readout del modelo original en bf16 antes de usarla en produccion. Las probabilidades de salida del quant no deben asumirse equivalentes a las del modelo sin cuantizar.
- Riesgo de degradacion por cuantizacion: Q4_K_M es una cuantizacion agresiva para un modelo de 2 B; en tareas de decision con umbrales finos, el desplazamiento de las probabilidades puede cambiar las decisiones cerca del limite.
- Fragilidad de toolchain: la model card documenta que ciertas versiones de llama.cpp generan GGUFs `qwen3_5_text` corruptos (metadatos incorrectos, pesos desplazados, salida `?`). Usar una build no fijada puede invalidar por completo los resultados.
- Idiomas no declarados: el repositorio no especifica idiomas soportados, por lo que no hay garantia de comportamiento multilingue. La model card esta redactada en aleman y no documenta capacidades linguisticas.
- Longitud de contexto desconocida: no se publica la ventana de contexto, dato critico para decidir si sirve en conversaciones multi-turno o en procesamiento de rafagas de frames.
- Proyecto sin traccion verificable: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado con 39 segundos de diferencia, y con fecha de creacion posterior a la de esta consulta. Es un artefacto reciente, no validado por la comunidad.
- Modelo especializado, no de proposito general: los tags `decision-model` y `system-one` indican que no esta disenado para generacion de texto abierto, razonamiento multi-paso, codigo ni matemticas. Usarlo como chatbot general dara resultados pobres.
- Dependencia del modelo base: la calidad final depende de Mapika/decider-2b-vision, cuyo proceso de entrenamiento, datos y evaluacion no se detallan en la informacion proporcionada. El repositorio base no tiene tags, solo un commit fijado.
- Licencia: apache-2.0 permite uso comercial, modificacion y redistribucion con atribucion, pero conviene verificar que la licencia del modelo base sea compatible, ya que el repositorio del quant no documenta explicitamente la licencia del upstream.
- Alucinacion en imagenes fuera de distribucion: al tratarse de un modelo pequeno de decision, es esperable un comportamiento poco fiable ante entradas visuales alejadas de su distribucion de entrenamiento; no hay datos publicados que cuantifiquen este riesgo.

## Enlaces

- Repositorio del quant en HuggingFace: https://huggingface.co/mindchain/decider-2b-vision-GGUF
- Modelo base: https://huggingface.co/Mapika/decider-2b-vision
- Revision fijada del modelo base: 863e290863655f1d6b69324d77d09ac972d21609
- Otros enlaces (papers, blogs, repositorios, demos): no disponible. La busqueda web realizada no devolvio resultados relevantes sobre el modelo; los unicos resultados obtenidos eran contenido no relacionado y sin valor tecnico, por lo que se descartan.
