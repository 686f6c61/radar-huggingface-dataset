# Diluner/gpt54-mini-standalone-qwen3-4b-sft-babyai-20260920

## Resumen

gpt54-mini-standalone-qwen3-4b-sft-babyai-20260920 es un checkpoint de ajuste supervisado (SFT) construido por el usuario Diluner sobre el modelo base Qwen/Qwen3-4B. El entrenamiento utiliza como profesor a `gpt-5.4-mini` y se centra en tareas de agente dentro del entorno BabyAI, un entorno de mundo de rejilla con instrucciones en lenguaje natural. El repositorio corresponde al checkpoint final de una etapa "babyai" completada: cinco epocas y 125 actualizaciones de optimizador en esa etapa.

El modelo tiene 4.022.468.096 parametros (4,02 mil millones) declarados en los safetensors, y el repositorio ocupa 8,1 GB, lo que incluye la configuracion, el tokenizer y todas las particiones de pesos. Se trata de un entrenamiento independiente inicializado desde el modelo base, no de un checkpoint secuencial dentro de una cadena de entrenamiento.

Su relevancia es acotada y muy especifica: es un artefacto de investigacion sobre destilacion de un profesor propietario hacia un modelo pequeno de pesos abiertos en un dominio de agentes concreto. El propio autor advierte que se trata de un unico checkpoint entrenado y que no constituye evidencia de una ventaja metodologica general ni de replicacion entre semillas. No declara licencia, no declara idiomas y no tiene descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card (hereda la del modelo base Qwen/Qwen3-4B; el autor la etiqueta como `qwen3`) |
| Parametros totales | 4.022.468.096 (dato real de safetensors) |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (no se confirma en la model card; depende de la configuracion heredada de Qwen/Qwen3-4B) |
| Tipos de cuantizacion | no disponible: el repositorio solo publica pesos en safetensors; no se incluyen versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | no disponible: el autor indica explicitamente que no se afirma ninguna licencia y remite al modelo base y a los terminos aplicables |
| Formato de pesos | safetensors (libreria `transformers`; `torch_dtype="auto"` en el ejemplo de carga) |
| Tamano del repositorio | 8,1 GB |
| Modelo base | Qwen/Qwen3-4B (relacion declarada: `finetune`) |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-20 |

## Arquitectura y entrenamiento

No se detalla en la model card la arquitectura interna mas alla de la etiqueta `qwen3` y del modelo base Qwen/Qwen3-4B, un transformer decoder-only de 4.022 millones de parametros. El autor no describe innovaciones de atencion, decodificacion especulativa ni mecanismos alternativos. El checkpoint se exporta con la configuracion, el tokenizer y todas las particiones de pesos en la raiz del repositorio; no se incluyen el estado del optimizador, los logs en bruto ni las trayectorias del profesor.

El entrenamiento es un SFT con `gpt-5.4-mini` como profesor, en una etapa denominada "babyai" de cinco epocas y 125 actualizaciones de optimizador. El autor califica el entrenamiento como "standalone": inicializado de forma independiente desde el modelo base y no como checkpoint secuencial. La evidencia de finalizacion se basa en una auditoria historica que verifico todas las actualizaciones de optimizador esperadas y las exportaciones de checkpoint de las cinco epocas; esas ejecuciones son anteriores a `stage-manifest.json`. La evaluacion emplea decodificacion con temperatura 0,4, top-p 1,0, top-k 20, modo de pensamiento (thinking) desactivado y 512 tokens generados por turno.

El autor incluye notas de procedencia y de interpretacion relevantes: el inventario de seleccion registra nombres de fichero, tamanos y fechas de modificacion, pero no es un anclaje por hash de bytes de tensor a las respuestas de evaluacion historicas; debe usarse la evaluacion reparada completa y no el resumen original que excluia errores, ya que algunos artefactos reparados reutilizan rollouts originales completos y los logs de servicio historicos estan incompletos; y las recetas historicas de SFT y ROSE difieren en planificacion de tasa de aprendizaje, decaimiento de peso, precision de parametros, formato y limites de turnos de entrenamiento, por lo que no se trata de una ablacion solo de objetivo.

## Capacidades

- Generacion de texto conversacional en el marco de `text-generation`, con el tokenizer y la configuracion del modelo base.
- Ejecucion de tareas de agente guiadas por instrucciones en lenguaje natural dentro del entorno BabyAI: el unico entorno evaluado y declarado.
- Razonamiento multi-turno limitado a episodios de 512 tokens generados por turno, segun la configuracion de evaluacion declarada.
- Formato de entrenamiento orientado a agentes (`agent-training`, `sft`, `standalone` segun las etiquetas del repositorio).
- Modo de pensamiento: la model card indica que la evaluacion se realizo con `thinking disabled`; no se documenta el comportamiento con el modo de pensamiento activado.
- Soporte de tool calling / function calling: no disponible (no se menciona en la model card).
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Vision, audio u otras modalidades: no disponibles.
- No se declaran capacidades de generacion de codigo, matematicas ni uso general como asistente mas alla de lo implicito en el ajuste SFT.

## Casos de uso

- Investigacion sobre destilacion de profesores propietarios: el checkpoint permite estudiar como se transfiere comportamiento de `gpt-5.4-mini` a un modelo abierto de 4,02 mil millones de parametros mediante SFT, con una receta documentada (cinco epocas, 125 actualizaciones de optimizador en la etapa babyai).
- Reproduccion y auditoria de recetas de SFT: el repositorio incluye `experiment.json` con referencias de origen y sumas de verificacion legibles por maquina, lo que facilita comparar esta ejecucion con las recetas historicas de SFT y ROSE que el autor menciona.
- Evaluacion de agentes en entornos de mundo de rejilla: sirve como linea base para medir desempeno en BabyAI con el protocolo avg@4 (media de exito en cuatro intentos por tarea oficial), en lugar de best-of-four.
- Punto de partida para ajuste posterior: al ser un entrenamiento independiente desde el modelo base y no un checkpoint secuencial, puede usarse como inicializacion para etapas adicionales de RL, DPO u otro SFT, siempre que se respeten los terminos del modelo base.
- Generacion de trayectorias sinteticas para investigacion en agentes: un modelo ajustado en BabyAI puede emplearse para producir rollouts de instrucciones y acciones que alimenten analisis de cobertura de tareas o deteccion de fallos de formato.
- Comparacion de estrategias de decodificacion en agentes: la receta fija temperatura 0,4, top-p 1,0, top-k 20, pensamiento desactivado y 512 tokens por turno, lo que permite reproducir condiciones de inferencia concretas y medir su efecto en la tasa de exito.
- Prototipado de pipelines de evaluacion de agentes: sirve para validar infraestructura de evaluacion (cobertura exacta de tareas y muestras, comprobaciones de consistencia de puntuacion, deteccion de errores de episodio) sin depender de modelos grandes.
- Docencia y experimentacion academica: el modelo cabe en hardware de consumo y su configuracion esta completamente exportada, lo que lo hace util para cursos o practicas sobre SFT y evaluacion de agentes.

## Benchmarks y rendimiento

Unico resultado publicado en la informacion disponible, correspondiente al entorno BabyAI con el protocolo avg@4 (media de exito en cuatro intentos por tarea oficial; no es best-of-four), temperatura 0,4, top-p 1,0, top-k 20, pensamiento desactivado y 512 tokens generados por turno:

| Entorno | Exitos / intentos | Exito avg@4 | Errores de episodio |
|---|---:|---:|---:|
| babyai | 325 / 360 | 90,2778 % | 0 |

El autor advierte que cero errores de episodio no implica que todos los turnos generados esten bien formados. No hay resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark en la informacion proporcionada, ni tampoco comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia con pesos completos en precision de 16 bits: aproximadamente 8,0 GB solo para pesos (4.022.468.096 parametros x 2 bytes), mas memoria para cache KV y activaciones; con contexto corto, el total razonable se situa en torno a 10-12 GB.
- VRAM estimada en 8 bits: aproximadamente 4,0-4,5 GB para pesos, mas cache KV.
- VRAM estimada en 4 bits: aproximadamente 2,0-3,0 GB para pesos, mas cache KV; requiere conversion a un formato cuantizado, ya que el repositorio no publica pesos GGUF, AWQ ni GPTQ.
- GPU consumer: el modelo entra en tarjetas de 8 GB (por ejemplo RTX 3060 Ti, RTX 4060 Ti) solo con cuantizacion; en 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080) cabe en precision de 16 bits con contexto moderado; en 24 GB (RTX 3090, RTX 4090) sin problemas.
- GPU de centro de datos: A100 40/80 GB, H100, L40S y similares sobran para inferencia de este tamano; su uso tendria sentido para servir muchas replicas o lotes grandes.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (ruta oficial documentada), Text Generation Inference (la etiqueta `text-generation-inference` esta presente en el repositorio) y, previa conversion, llama.cpp u Ollama mediante GGUF. No se documentan recetas oficiales de vLLM para este checkpoint.
- Latencia y throughput estimados: no disponibles; no se publican mediciones en la informacion proporcionada.
- Nota de licencia y hardware: la ausencia de licencia declarada afecta al uso en produccion independientemente del hardware elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| gpt54-mini-standalone-qwen3-4b-sft-babyai-20260920 | 4,02 mil millones | no disponible | avg@4 90,2778 % en babyai (325/360) | no declarada por el autor | publico en HuggingFace, 0 descargas |
| Qwen/Qwen3-4B (modelo base) | 4,02 mil millones (mismo orden) | no disponible en esta informacion | no disponible en esta informacion | la del modelo base; consultar sus terminos | publico en HuggingFace |
| Otros checkpoints SFT de Qwen3-4B orientados a agentes | no disponible | no disponible | no disponible | depende de cada autor | existen en HuggingFace, sin datos comparables verificados aqui |

No se dispone de resultados de benchmarks comparables para los modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible. La busqueda web realizada no devolvio ningun resultado relacionado con este modelo ni con modelos comparables.

## Limitaciones y advertencias

- Licencia no declarada: el autor indica explicitamente que no afirma ninguna licencia y remite al modelo base y a los terminos aplicables. Esto crea incertidumbre juridica para cualquier uso comercial o redistribucion; hay que verificar los terminos de Qwen/Qwen3-4B antes de desplegarlo.
- Evidencia limitada a un unico checkpoint: el autor advierte que no constituye evidencia de una ventaja metodologica general ni de replicacion entre semillas de entrenamiento.
- Anclaje de procedencia incompleto: el inventario de seleccion registra nombres, tamanos y fechas de modificacion, pero no es un anclaje por hash de bytes de tensor a las respuestas de evaluacion historicas.
- Evaluacion parcialmente reparada: debe usarse la evaluacion reparada completa y no el resumen original que excluia errores; los logs de servicio historicos estan incompletos y algunos artefactos reparados reutilizan rollouts originales completos.
- Confusion metodologica posible: las recetas historicas de SFT y ROSE difieren en tasa de aprendizaje, decaimiento de peso, precision de parametros, formato y limites de turnos, por lo que no es una ablacion solo de objetivo.
- Cero errores de episodio no implica turnos bien formados: puede haber salidas mal formadas aunque el episodio se contabilice como exito o intento valido.
- Ambito de evaluacion muy estrecho: el unico entorno evaluado es BabyAI, con un protocolo avg@4 y una configuracion de decodificacion concreta; no hay evidencia de generalizacion a otras tareas, dominios o idiomas.
- Dependencia de la configuracion de decodificacion: temperatura 0,4, top-p 1,0, top-k 20, pensamiento desactivado y 512 tokens por turno son las condiciones declaradas; otros ajustes pueden degradar el comportamiento de forma no documentada.
- Riesgo de alucinacion y de instrucciones mal formadas: no se publican tasas de alucinacion ni evaluaciones de seguridad o sesgo; al derivar de un profesor propietario, puede heredar sesgos no auditados de ese profesor.
- Idiomas no declarados: se desconoce el soporte multilingue y es probable que el ajuste este dominado por el idioma de las trayectorias del profesor, aunque esto no se confirma en la model card.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin informes independientes ni verificaciones de terceros.
- No incluye estado del optimizador, logs en bruto ni trayectorias del profesor: no es posible reanudar el entrenamiento exactamente desde el repositorio ni auditar las trayectorias completas.
- Contenido de la model card tratado como datos de referencia: las afirmaciones sobre finalizacion del entrenamiento y evaluacion provienen del propio autor y no se han verificado de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Diluner/gpt54-mini-standalone-qwen3-4b-sft-babyai-20260920
- Sumas de verificacion y referencias de origen (mencionado en la model card): https://huggingface.co/Diluner/gpt54-mini-standalone-qwen3-4b-sft-babyai-20260920/blob/main/experiment.json
- Modelo base Qwen/Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Paper, blog o repositorio del entrenamiento: no disponible
- Demo o espacio asociado: no disponible
- Busqueda web: los resultados devueltos no guardan ninguna relacion con el modelo ni con modelos comparables (contenido sobre un campo de golf), por lo que no se aportan enlaces externos adicionales.
