# lukey03/Qwen3.5-9B-abliterated

## Resumen

Qwen3.5-9B-abliterated es una version modificada del modelo base Qwen/Qwen3.5-9B (8.953.803.264 parametros segun los pesos en safetensors) publicada por el usuario lukey03. El objetivo del autor es eliminar por completo el comportamiento de rechazo del modelo original: la model card afirma que se pasa de 0/18 respuestas validas en el modelo base a 18/18 en esta version sobre un conjunto propio de 18 prompts distribuidos en 8 categorias. El modelo conserva la arquitectura del original: un transformer hibrido que combina capas DeltaNet con atencion estandar en un patron repetido de 3xDeltaNet -> 1xAttention, con 32 capas.

La relevancia de esta ficha es doble. Por un lado, es un ejemplo practico de una tecnica de edicion de pesos (abliteration por proyeccion ortogonal, basada en Arditi et al., 2024) aplicada a una arquitectura hibrida reciente, incluyendo capas de atencion lineal. Por otro, sirve como caso de estudio sobre los riesgos de publicar modelos sin comportamiento de rechazo: el propio autor documenta que una cuarta pasada de abliteration destruyo el modelo (salida incoherente) y que fue necesaria una fase de ajuste fino con QLoRA para recuperar las categorias resistentes.

El modelo se distribuye con licencia Apache-2.0, declara unicamente el idioma ingles en la model card, esta etiquetado como `uncensored` y `abliterated`, y ocupa 35,9 GB en el repositorio de HuggingFace. No se ha publicado informacion sobre la longitud de contexto, ni resultados en benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: DeltaNet (atencion lineal) + atencion estandar, patron repetido 3xDeltaNet -> 1xAttention |
| Parametros totales | 8.953.803.264 (~8,95 mil millones) |
| Parametros activos | No aplica (no se documenta arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos publicados estan en safetensors; el entrenamiento LoRA uso cuantizacion 4-bit NF4, pero no se confirma la publicacion de versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (unico idioma declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers, arquitectura `qwen3_5_text`) |
| Modelo base | Qwen/Qwen3.5-9B |
| Tamano del repositorio | 35,9 GB |
| Descargas / likes | 1036 descargas, 73 likes (a fecha de actualizacion del 2026-03-03) |

## Arquitectura y entrenamiento

La arquitectura subyacente, heredada de Qwen3.5-9B, es un transformer hibrido de 32 capas que alterna bloques DeltaNet (atencion lineal) y bloques de atencion estandar en una proporcion de tres a uno. La model card identifica como modulos diana de la edicion `linear_attn.out_proj` (salida de DeltaNet), `self_attn.o_proj` (salida de la atencion estandar) y `mlp.down_proj`, es decir, todas las proyecciones que escriben de vuelta al residual stream, que es donde el autor situa la codificacion de la direccion de rechazo.

El proceso de edicion consta de dos etapas. La primera es una abliteration por proyeccion ortogonal en espacio de pesos, aplicada en 3 pasadas iterativas. Para calcular la direccion de rechazo se recogieron activaciones de 170 prompts considerados daninos (repartidos en 12 categorias: hacking y cibercrimen, armas y explosivos, drogas, fraude financiero, violaciones de privacidad y acoso, robo, discurso de odio, autolesion, contenido sexual explicito, manipulacion politica y desinformacion, manipulacion y abuso, y bioterrorismo) frente a 160 prompts inocuos en 10 categorias (cocina, escritura creativa, ciencia y educacion, aficiones, bricolaje, tecnologia y programacion, salud y fitness, viajes, finanzas y carrera, y varios). La edicion se aplico a las 32 capas, modificando 64 matrices de pesos por pasada con escala 1.0 y una longitud maxima de secuencia de 128 tokens para la recogida de activaciones. La formula aplicada es `W_new = W - d @ (d^T @ W)`, donde `d` es la direccion de rechazo normalizada.

La segunda etapa fue un ajuste fino con QLoRA sobre las 5 categorias que resistieron la abliteration (humor racista u ofensivo, contenido sexual explicito, propaganda antiinmigracion, sintesis de drogas y metodos de autolesion), usando r=64, alpha=128, modulos diana `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, 20 ejemplos de entrenamiento mas ejemplos de refuerzo, y 5 epocas. La perdida bajo de 2,06 a 0,17 y la precision por token subio del 58 % al 96 %. El entrenamiento se ejecuto en una NVIDIA H100 SXM de 80 GB en aproximadamente 45 segundos. El adaptador se fusiono posteriormente en los pesos completos.

## Capacidades

- Generacion de texto conversacional en ingles, con la etiqueta `conversational` en el repositorio.
- Razonamiento logico: la model card reporta que resuelve correctamente un silogismo identificando la falacia de termino medio no distribuido.
- Matematicas: aplica correctamente la regla del producto en la derivada de `x^3 * sin(x)` dando `3x^2 sin(x) + x^3 cos(x)`.
- Programacion: genera una implementacion con expansion alrededor del centro en O(n^2) para el problema de la subcadena palindromica mas larga.
- Conocimiento general: explica correctamente la diferencia entre fision y fusion nuclear e identifica la fusion como la reaccion que alimenta al Sol.
- Escritura creativa: produce haikus con estructura silabica 5-7-5 correcta.
- Analisis: identifica hipotecas subprime, desregulacion y credit default swaps como causas de la crisis financiera de 2008.
- Ausencia total de rechazo: el autor reporta 18/18 respuestas en el conjunto de prueba de 18 prompts y 17/18 (94 %) en la ejecucion estandar comparativa.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no documentadas; la model card declara unicamente ingles.
- Modo thinking, vision o audio: no documentados. El pipeline declarado es exclusivamente `text-generation`.

## Casos de uso

- Investigacion sobre alineacion y mecanismos de rechazo: comparar las activaciones y salidas de este modelo frente a Qwen/Qwen3.5-9B permite estudiar en que capas se concentra el comportamiento de rechazo. La tabla de magnitud por capa incluida por el autor (0,36 en capas 0-7 frente a 23,10 en capas 24-31) sirve como punto de partida para replicar el analisis.
- Red teaming de clasificadores de seguridad: generar respuestas y prompts adversarios para evaluar la robustez de filtros de contenido, moderadores automaticos o guardarrailes de despliegue. El modelo responde en todas las categorias de prueba documentadas, lo que lo hace util como generador de casos limite.
- Generacion de datos sinteticos para clasificadores de contenido danino: producir ejemplos etiquetados en las 12 categorias usadas en la fase de abliteration para entrenar o validar modelos de deteccion, manteniendo el conjunto de datos interno y sin depender de APIs externas.
- Escritura de ficcion sin filtros tematicos: novela negra, terror o thriller que requieran violencia explicita o tematicas sensibles sin que el modelo interrumpa la generacion con negativas. Con 8,95 mil millones de parametros ofrece mas capacidad de cohesion narrativa que alternativas de 7B como Dolphin-Mistral 7B.
- Asistente conversacional autoalojado en ingles: con licencia Apache-2.0 y pesos abiertos, se puede desplegar en infraestructura propia para conversaciones multi-turno donde el operador quiera controlar el comportamiento del modelo sin capas de moderacion externas. La longitud de contexto real no esta documentada, por lo que habria que medirla antes de fijar el diseno del sistema.
- Analisis de ciberseguridad ofensiva: el modelo se ha probado explicitamente en generacion de contenido de hacking, lo que permite usarlo en entornos controlados de formacion o en ejercicios de equipo rojo donde otros modelos rechazan la peticion.
- Evaluacion comparativa de arquitecturas hibridas: como instancia de Qwen3.5-9B, sirve para medir el coste y el rendimiento de un patron 3xDeltaNet -> 1xAttention frente a transformers densos de tamano similar en tareas de generacion larga.
- Reproduccion de tecnicas de edicion de pesos: el repositorio documenta con detalle el numero de pasadas, los modulos diana, la escala y los hiperparametros del LoRA, lo que permite replicar el metodo sobre otros modelos base o auditar su impacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, BBH, etc.) en la informacion disponible. Los unicos datos cuantitativos son pruebas internas del autor sobre rechazo y comprobaciones cualitativas de capacidad.

Resultados de la prueba de rechazo por etapa (18 prompts, 8 categorias):

| Etapa | Respondidos | Tasa |
|---|---|---|
| Qwen3.5-9B base | 0/18 | 0 % |
| Abliteration, pasada 1 | 7/18 | 39 % |
| Abliteration, pasada 2 | 9/18 | 50 % |
| Abliteration, pasada 3 | 13/18 | 72 % |
| Abliteration, pasada 4 | 18/18 (salida incoherente) | Modelo destruido |
| Pasada 3 + LoRA (este modelo) | 18/18 | 100 % |

Comparativa con Dolphin-Mistral 7B sobre el mismo conjunto de 18 prompts:

| Modelo | Respondidos | Rechazados | Tasa |
|---|---|---|---|
| Qwen3.5-9B-abliterated | 17/18 | 1 | 94 % |
| Dolphin-Mistral 7B | 17/18 | 1 | 94 % |
| Qwen3.5-9B base | 0/18 | 18 | 0 % |

El autor atribuye la diferencia de 17/18 frente a 18/18 a la varianza de temperatura y senala que en la mejor de tres ejecuciones su modelo alcanza 18/18.

Magnitud de la direccion de rechazo por rango de capas (pasada 3):

| Rango de capas | Magnitud media |
|---|---|
| 0-7 | 0,36 |
| 8-15 | 1,73 |
| 16-23 | 6,88 |
| 24-31 | 23,10 |

Comprobaciones cualitativas de capacidad: razonamiento (silogismo resuelto correctamente), matematicas (derivada con regla del producto correcta), codigo (implementacion O(n^2) limpia), conocimiento (fision frente a fusion, correcto), creatividad (haiku 5-7-5) y analisis (causas de la crisis de 2008). No se aportan metricas numericas para estas categorias.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 8,95 mil millones de parametros; son estimaciones, no datos publicados por el autor): en bf16/fp16 en torno a 18-20 GB solo para pesos, mas cache KV y overhead; en 8 bits en torno a 9-11 GB; en 4 bits en torno a 5-7 GB.
- El repositorio ocupa 35,9 GB, lo que es coherente con pesos en mayor precision que bf16 (posiblemente fp32, unos 35,8 GB). Conviene verificar el `dtype` real de los ficheros antes de planificar el despliegue.
- GPU de datacenter recomendadas para bf16: A100 40/80 GB, H100 80 GB, L40S 48 GB. El autor uso una H100 SXM 80 GB para el entrenamiento del adaptador LoRA.
- GPU de consumo: una RTX 4090 de 24 GB puede alojar el modelo en bf16 con contexto corto, y con holgura en cuantizacion de 8 o 4 bits. Tarjetas de 12-16 GB (RTX 4080, 4070 Ti Super) requeririan cuantizacion de 4 bits y contexto reducido.
- La longitud de contexto no esta documentada, por lo que no se puede estimar con fiabilidad el consumo de cache KV ni el throughput en secuencias largas. En arquitecturas hibridas con DeltaNet, el coste de cache por token suele ser menor que en atencion completa, pero esto no se confirma para este modelo en la informacion disponible.
- Opciones de despliegue: al estar publicado en safetensors y con `library_name: transformers`, la via directa es HuggingFace Transformers. El tag `endpoints_compatible` sugiere compatibilidad con los endpoints gestionados de HuggingFace. No se confirma la existencia de versiones GGUF, por lo que el uso con llama.cpp u Ollama no esta garantizado sin conversion previa. vLLM y TGI dependerian del soporte de la arquitectura `qwen3_5_text` en sus versiones correspondientes.
- Latencia y throughput estimados: no disponibles. El unico dato temporal publicado es que el ajuste fino del adaptador LoRA tardo aproximadamente 45 segundos en una H100 SXM, lo que corresponde al entrenamiento, no a la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Rechazo (18 prompts) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-9B-abliterated | 8,95 B | Hibrida DeltaNet + atencion | No disponible | 17/18 (94 %); 18/18 en mejor de 3 | Apache-2.0 | HuggingFace, safetensors |
| Qwen/Qwen3.5-9B (base) | No disponible en la informacion (el modelo derivado tiene 8,95 B) | Hibrida DeltaNet + atencion | No disponible | 0/18 (0 %) | No disponible en la informacion | HuggingFace |
| Dolphin-Mistral 7B | 7 B | Transformer denso (Mistral) | No disponible en la informacion | 17/18 (94 %) | No disponible en la informacion | HuggingFace |

El autor destaca como principal ventaja diferencial el mayor numero de parametros (8,95 B frente a 7 B) manteniendo el mismo comportamiento sin rechazos, lo que en su valoracion se traduce en mejor razonamiento, codigo y conocimiento. No se aportan datos numericos que respalden esa mejora mas alla de las comprobaciones cualitativas.

## Limitaciones y advertencias

- El modelo ha sido editado deliberadamente para eliminar todo comportamiento de rechazo. Genera contenido en categorias como sintesis de drogas, armas, autolesion, contenido sexual explicito, discurso de odio o propaganda politica. Su uso en produccion conlleva riesgos legales y eticos significativos segun la jurisdiccion.
- La evaluacion de la eliminacion de rechazos se apoya en un conjunto de 18 prompts definido por el propio autor. Es una muestra pequena y no auditada de forma independiente; las tasas del 94 % o 100 % no deben extrapolarse a categorias no cubiertas.
- La segunda etapa de ajuste fino uso solo 20 ejemplos. Un conjunto tan reducido con 5 epocas puede provocar sobreajuste y degradar el comportamiento general en dominios alejados de esos ejemplos.
- El autor documenta que una cuarta pasada de abliteration destruyo el modelo (18/18 respuestas, pero incoherentes). Esto indica que el proceso opera cerca de un limite de estabilidad y que los pesos finales pueden ser fragiles ante cambios de prompt o de temperatura.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad. Las comprobaciones cualitativas documentadas son seis ejemplos puntuales, insuficientes para caracterizar la tasa de alucinacion.
- Idioma: la model card declara unicamente ingles. No hay evidencia de capacidades en castellano ni en otros idiomas, aunque el modelo base Qwen probablemente sea multilingue; no se debe asumir sin verificar.
- Longitud de contexto no documentada. Cualquier despliegue que dependa de ventanas largas requiere una medicion previa.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion, pero no exime del cumplimiento de la legislacion aplicable sobre contenido danino, proteccion de datos o responsabilidad civil por las salidas generadas.
- No se confirma la disponibilidad de cuantizaciones GGUF, AWQ o GPTQ, ni el soporte en motores de inferencia distintos de Transformers. El repositorio de 35,9 GB obliga a planificar el almacenamiento y el ancho de banda de descarga.
- Ausencia de model card del autor del modelo base en la informacion proporcionada: no se pueden verificar los datos de entrenamiento originales, la composicion del dataset ni si hubo RLHF o DPO en Qwen3.5-9B.
- No hay resultados en benchmarks estandar que permitan comparar objetivamente la degradacion de capacidades causada por la abliteration.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lukey03/Qwen3.5-9B-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Articulo de referencia del metodo de abliteration (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
- Modelo comparado Dolphin-Mistral 7B: https://huggingface.co/cognitivecomputations/dolphin-2.6-mistral-7b
