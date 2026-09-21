# Gyubeum/Qwen3-VL-8B-Instruct-UI-Genie-scoring-128k-balanced-bt-naive

## Resumen

Qwen3-VL-8B-Instruct-UI-Genie-scoring-128k-balanced-bt-naive es un modelo de recompensa escalar (reward model) para pasos de agentes GUI móviles, desarrollado por el usuario Gyubeum sobre la base de Qwen/Qwen3-VL-8B-Instruct. No es un modelo conversacional: su salida es un unico escalar (`score_head(last_token_hidden_state)`) donde un valor mayor indica una accion candidata mejor, evaluada en el contexto de una pantalla móvil y un historial de ejecucion. Se construye mediante un ajuste Bradley-Terry sobre etiquetas generadas con Latent Peer Voting (LPV) en su variante de construccion `all_naive`, partiendo de un modelo base ya entrenado con UI-Genie en una etapa previa.

El checkpoint publicado corresponde a la epoca 4 de 8 de un entrenamiento LoRA de rango 64 aplicado a todas las capas lineales, con la cabeza escalar `score` incluida en `modules_to_save` y las matrices LoRA fusionadas en los pesos base. El modelo tiene 8.767.127.792 parametros (unos 8,77 mil millones) en un repositorio de 17,5 GB en safetensors, por lo que se trata de un transformer denso de vision-lenguaje, no de una arquitectura MoE.

Su relevancia es acotada y muy especifica: sirve como componente de puntuacion para pipelines de RL, filtrado de rollouts o best-of-N en agentes Android, con un contrato de entrada rigido (`ui-genie-rm-paired-v1`) y un contexto de trabajo de 16.384 tokens. Los resultados publicados por el propio autor muestran una mejora no estadisticamente significativa en la tarea AndroidFlux (+14 sobre 76 pares brutos, +5 sobre 52 pares limpios) y un deterioro significativo en el conjunto UI-Genie de 1.000 pares (−24), por lo que debe evaluarse con cautela antes de usarse en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de vision-lenguaje (familia Qwen3-VL), con cabeza escalar de recompensa anadida; LoRA rango 64 fusionada sobre todas las capas lineales |
| Parametros totales | 8.767.127.792 (8,77 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128k segun la nomenclatura del checkpoint; el entrenamiento y la evaluacion se realizaron con 16.384 tokens sin truncamiento (no se detalla mas en la model card) |
| Tipos de cuantizacion | No disponible. El repositorio solo publica safetensors con un tamano de 17,5 GB, compatible con precision de 2 bytes por parametro (bf16/fp16); no se documentan cuantizaciones oficiales |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-VL-8B-Instruct, un transformer de vision-lenguaje que recibe entradas multimodales (imagenes de pantalla mas texto) y produce representaciones de secuencia. Sobre esa base, este checkpoint incorpora una cabeza escalar de recompensa denominada `score`, situada en `modules_to_save` durante el entrenamiento LoRA, mientras que las matrices de bajo rango (rango 64, aplicadas a todas las capas lineales) se han fusionado ya en los pesos publicados. El objetivo de entrenamiento es Bradley-Terry sobre etiquetas LPV, con construccion de etiquetas `all_naive` y pesos de expertos en modo `average`. El punto de partida no es el modelo instruct original, sino `qwen3vl_8b_128k_balanced_bt`, un reward model Bradley-Terry de UI-Genie ya equilibrado a 128k.

El contrato de entrada es `ui-genie-rm-paired-v1`: un turno de sistema con la especificacion de herramienta `mobile_use` que declara el tamano logico de pantalla, un historial de ejecucion con las capturas de pantalla recientes intercaladas y la accion candidata cerrada dentro de un `<tool_call>`. Tanto el entrenamiento como la evaluacion usaron este mismo contrato, con 16.384 tokens y sin truncamiento. Un detalle tecnico relevante aportado por el autor es que la cabeza `score` apenas se movio durante el ajuste fino (cambio absoluto maximo de 0,001 y similitud coseno de 0,9998 frente a la cabeza base), de modo que el cambio de comportamiento procede de la LoRA fusionada, no de la cabeza. El checkpoint publicado es la epoca 4 de 8.

## Capacidades

- Puntuacion escalar de pares: dado un estado de pantalla, un historial de ejecucion y dos acciones candidatas, produce un score que permite ordenarlas (mayor es mejor).
- Comprension multimodal de interfaces moviles: procesa capturas de pantalla intercaladas con el historial textual de acciones.
- Manejo del contrato `ui-genie-rm-paired-v1`, incluyendo especificacion de herramienta, tamano logico de pantalla y acciones cerradas en `<tool_call>`.
- Trabajo con coordenadas en el espacio de pixeles de la pantalla logica declarada por el prompt de sistema.
- Etiquetado a nivel de paso (`error_path`) y credito a nivel de episodio proyectado sobre un paso (`clean_path`), segun la propia evaluacion del autor.
- Soporte de contexto de hasta 16.384 tokens en las condiciones de entrenamiento y evaluacion, sin truncamiento.
- Capacidad heredada de la base Qwen3-VL-8B-Instruct para tareas de imagen-texto, aunque el ajuste esta orientado exclusivamente a la puntuacion de acciones.
- No se documenta soporte de tool calling generativo, agentes multi-paso ni modos de pensamiento (`thinking`): el modelo no genera texto de respuesta, sino un escalar.

## Casos de uso

- Best-of-N en inferencia para agentes Android: se muestrean N acciones candidatas con la politica del agente y se selecciona la de mayor score emitido por este modelo. Es el uso mas directo de la cabeza escalar y permite mejorar la tasa de exito sin reentrenar la politica.
- Filtrado y curacion de datos de entrenamiento: puntuar rollouts completos recogidos en dispositivos reales o emuladores y descartar aquellos pasos con score bajo antes de un ajuste supervisado, reduciendo el ruido del dataset.
- RLHF/DPO sobre politicas GUI: usar los scores como senal de recompensa por par para optimizar una politica de agente movil, aprovechando que el modelo ya esta entrenado especificamente con el contrato de UI-Genie.
- Localizacion automatica de fallos en trayectorias largas: gracias a las etiquetas a nivel de paso, el modelo puede emplearse para senalar que paso concreto de una secuencia degrada el score, util en depuracion de agentes que fallan tras muchas interacciones.
- Evaluacion de regresion de agentes GUI: montar un test fijo con pares de acciones etiquetados y medir la tasa de recuperacion (recuperar la accion preferida) antes y despues de cada cambio en el agente, como se hace en la evaluacion AndroidFlux del autor.
- Investigacion sobre etiquetado por Latent Peer Voting: comparar la construccion `all_naive` con otras variantes de etiquetado para medir su efecto sobre la precision del reward model, ya que el autor reporta que `naive` es la peor de las configuraciones probadas.
- Deteccion de comportamiento degenerado en agentes: dado que el sesgo hacia `terminate` decide 24 de 52 pares limpios en la evaluacion, el modelo puede usarse como sonda para detectar politicas que terminan prematuramente, siempre que se corrija dicho sesgo.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. La columna "Base" se refiere al modelo base `qwen3vl_8b_128k_balanced_bt`. Las metricas de recuperacion se expresan en numero de pares resueltos correctamente.

| Metrica | Base | Este modelo | Delta |
|---|---:|---:|---:|
| recovery, all 76 | 34 | 48 | +14 |
| recovery, clean 52 | 28 | 33 | +5 |
| - error_path 27 | 16 | 20 | +4 |
| - clean_path 25 | 12 | 13 | +1 |
| UI-Genie 1000 | 909 | 885 | −24 |

Advertencias explicitas del autor sobre estas cifras: ninguna de las diferencias en recuperacion es estadisticamente significativa (el subconjunto de 52 pares limpios tiene un error estandar de aproximadamente 3,6 pares, y 24 de esos 52 pares se deciden por una preferencia casi constante hacia `terminate`). El cambio en UI-Genie si es significativo (n=1000, error estandar de aproximadamente 9 pares) y es una perdida: el ajuste fino con etiquetas LPV sobre AndroidFlux degrada la precision en UI-Genie, y lo hace mas con la construccion `naive` que con cualquier otra configuracion probada. El conjunto `clean 52` excluye 7 pares cuyos dos candidatos quedan a menos de 25 px entre si y 17 cuya accion de origen queda fuera de la especificacion de herramienta fijada. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 17,5 GB solo de pesos, con un total realista de 20-24 GB contando cache KV y activaciones en contextos cortos. Con el contrato completo de 16.384 tokens e imagenes intercaladas, la huella puede superar los 28-32 GB (estimacion, no confirmada por el autor).
- VRAM estimada en cuantizacion de 8 bits: alrededor de 9-10 GB de pesos, 12-14 GB en total (estimacion).
- VRAM estimada en cuantizacion de 4 bits: alrededor de 5-6 GB de pesos, 8-10 GB en total (estimacion), aunque no se publican cuantizaciones oficiales.
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S 48 GB. En RTX 4090 o RTX 3090 (24 GB) el modelo entra en bf16 de forma muy ajustada y con contexto reducido; en RTX 4080 (16 GB) requeriria cuantizacion.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con precision reducida o cuantizacion, y en GPUs de 16 GB solo con cuantizacion agresiva.
- Opciones de despliegue: la libreria declarada es transformers, y el modelo incluye una cabeza escalar que no forma parte de la arquitectura estandar de Qwen3-VL, por lo que su uso requiere cargar la clase correspondiente y acceder a la salida `score`. El tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints, pero no se documenta soporte directo en vLLM, TGI, llama.cpp u Ollama, y estos frameworks probablemente no expongan la cabeza escalar sin adaptaciones.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento relevante | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-VL-8B-Instruct-UI-Genie-scoring-128k-balanced-bt-naive | 8,77 B (denso) | 128k nominal, 16.384 tokens en entrenamiento/evaluacion | No disponible | recovery clean 52: 33/52; UI-Genie 1000: 885 | Hugging Face, safetensors |
| qwen3vl_8b_128k_balanced_bt (base de etapa 1, UI-Genie BT) | 8,77 B (denso) | 128k segun nomenclatura | No disponible | recovery clean 52: 28/52; UI-Genie 1000: 909 | Referenciado en la model card; no se aporta enlace |
| Qwen/Qwen3-VL-8B-Instruct | 8,77 B (denso) | No especificado en la informacion disponible | No disponible en esta informacion | No se reportan metricas de recuperacion para la tarea de recompensa | Hugging Face |

No se dispone de datos de otros reward models para agentes GUI moviles en la informacion proporcionada, por lo que la comparativa externa queda como no disponible.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si se permite el uso comercial. Cualquier despliegue en produccion exige aclarar este punto con el autor.
- No es un modelo generativo: emite un unico escalar, no texto. No puede usarse como asistente conversacional ni como agente por si mismo.
- Solo ingles: el unico idioma declarado es `en`, lo que limita su aplicacion a interfaces y prompts en ese idioma.
- Mejora no significativa: ninguna de las ganancias en recuperacion reportadas alcanza significacion estadistica (error estandar de ~3,6 pares en el subconjunto de 52).
- Perdida significativa en UI-Genie: −24 pares sobre 1.000 (error estandar de ~9), un deterioro real respecto al modelo base del que parte.
- Sesgo degenerado hacia `terminate`: 24 de los 52 pares limpios se deciden por una preferencia casi constante por esta accion, lo que puede producir puntuaciones poco informativas en comparaciones entre acciones no terminales.
- Cabeza `score` practicamente congelada (cambio absoluto maximo de 0,001, similitud coseno de 0,9998 frente a la base), por lo que toda la diferencia de comportamiento depende de la LoRA fusionada y no de la cabeza de recompensa.
- Contrato de entrada estricto: requiere el formato `ui-genie-rm-paired-v1`, con especificacion de herramienta `mobile_use`, tamano logico de pantalla declarado e historial con capturas intercaladas. Desviarse de este formato invalida la calibracion del score.
- Coordenadas en pixeles del espacio de pantalla logica: si el prompt de sistema declara un tamano que no coincide con el real, las puntuaciones dejan de ser fiables.
- Evaluacion limitada: 76 pares fijos de AndroidFlux y 1.000 pares de UI-Genie en un unico idioma y una unica plataforma (Android). No hay validacion cruzada en iOS ni en otros dominios de interfaz.
- Sin validacion de la comunidad: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de reproduccion independiente de los resultados.
- Riesgo de reward hacking si se usa como senal de RL sin regularizacion, dado el sesgo hacia `terminate` y la estrechez del conjunto de evaluacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gyubeum/Qwen3-VL-8B-Instruct-UI-Genie-scoring-128k-balanced-bt-naive
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Modelo base de etapa 1 (`qwen3vl_8b_128k_balanced_bt`): referenciado en la model card, sin enlace publico disponible
- Paper, blog o repositorio asociados a UI-Genie, AndroidFlux o Latent Peer Voting: no disponibles en la informacion proporcionada
- La busqueda web realizada no devolvio resultados relevantes: unicamente paginas de comparacion de vuelos (idealo), sin relacion con el modelo
