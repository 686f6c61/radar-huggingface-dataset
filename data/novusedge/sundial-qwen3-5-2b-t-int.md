# NovusEdge/sundial-qwen3.5-2b-T-int

## Resumen

sundial-qwen3.5-2b-T-int es un adaptador LoRA de investigación construido sobre Qwen/Qwen3.5-2B por el autor NovusEdge. Su propósito es dotar al modelo base de la capacidad de tomar decisiones dependientes del tiempo transcurrido entre mensajes de una sesión, representado ese tiempo como texto plano en el propio prompt (por ejemplo, `(+3h12m since last message)`). Forma parte del proyecto sundial, que investiga dónde debe introducirse la información temporal en un modelo preentrenado: como texto, como entrada separada o dentro de la actualización de memoria de las capas.

El adaptador se entrenó para responder preguntas de opción múltiple sobre cuatro familias de tareas temporales: si algo en ejecución terminará pronto (wait), si un resultado previo sigue vigente o debe revisarse (stale), cuánto tiempo ha pasado desde un evento (ago) y si algo ha vencido o está a punto de vencer (deadline). La conclusión del estudio a esta escala es que escribir el tiempo como texto y ajustar sobre ello supera a inyectar el tiempo en las capas del modelo.

Se trata de un artefacto de investigación, no de un producto: el adaptador no es un PEFT estándar, el código de sundial no es público y la carga requiere el módulo `arms.build_arm` en el commit indicado en `sundial_arm.json`. El repositorio ocupa 0,1 GB y contiene 18.838.528 parámetros LoRA en float32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer Qwen3.5-2B (con capas Gated DeltaNet); el adaptador cubre proyecciones de atención, Gated DeltaNet y MLP |
| Parametros totales | 18.838.528 parámetros LoRA (n_lora); parámetros del modelo base no disponibles en la información |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens durante el entrenamiento |
| Tipos de cuantizacion | no disponible (el campo `quant` existe en `sundial_arm.json` pero su valor no se detalla) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | adapter.safetensors (float32, 300 tensores) + sundial_arm.json |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-2B, un transformer que incorpora capas Gated DeltaNet (un mecanismo de memoria con compuertas de decaimiento). El LoRA tiene rango base 16 y se inserta en las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `in_proj_qkv`, `in_proj_z`, `out_proj`, `gate_proj`, `up_proj` y `down_proj`. No hay parámetros temporales dedicados (`n_time` es 0): toda la información de tiempo entra como texto en el prompt, en modo `int`.

Los datos de entrenamiento son exclusivamente sesiones sintéticas en formato Claude Code y el log público BPI Challenge 2012; no se usaron transcripciones personales. El entrenamiento consistió en 3 épocas, 2.250 pasos y 36.000 ejemplos, continuando la semilla 2 (una ejecución de 1 época extendida a 2 y luego a 3). Se realizó en una única RTX 4070 Laptop GPU de 8 GB, con el modelo base en bf16 y contexto de 2.048 tokens. El proyecto comparó esta variante Text-Interval (T-int) con Text-Interval más un adaptador de rango 1 sobre las compuertas de decaimiento de las capas Gated DeltaNet (Text-Interval+DecayLoRA) en tres semillas emparejadas; una regla fijada de antemano solo elegía la variante de decaimiento si ganaba claramente en validación de huecos largos sin perder en rango, y no alcanzó el umbral, por lo que se seleccionó T-int.

## Capacidades

- Respuesta a preguntas de opción múltiple sobre tiempo transcurrido, devolviendo una distribución de probabilidad sobre las letras de las opciones.
- Familia wait: estimar si una tarea en ejecución terminará en un intervalo determinado (por ejemplo, en los próximos 5 minutos).
- Familia stale: decidir si un resultado previo sigue siendo válido o debe comprobarse de nuevo.
- Familia ago: estimar cuánto tiempo ha pasado desde un evento, en diez intervalos que van de "menos de un minuto" a "más de 4 semanas".
- Familia deadline: clasificar un compromiso previo como no vencido, vencido ahora (dentro de 15 minutos) o vencido.
- Interpretación de marcas temporales en texto con formatos `45s`, `3m05s`, `2h10m` y `3d4h`, además de `(+... since session start)` para el primer mensaje.
- No soporta tool calling, agentes, visión, audio ni otras capacidades generales más allá del modelo base; el adaptador está especializado en la tarea temporal descrita.

## Casos de uso

- Evaluación de investigación sobre representación del tiempo: usar el adaptador como referencia T-int para comparar con variantes que inyectan el tiempo en las capas (DecayLoRA) en experimentos controlados con semillas emparejadas.
- Análisis de trazas de agentes de código: dado un transcript de sesión con marcas de tiempo, clasificar si una compilación o despliegue lanzado previamente sigue en curso o ya debería haber terminado.
- Gestión de vencimientos en asistentes conversacionales: detectar si un recordatorio mencionado en un turno anterior (por ejemplo, renovar un certificado en 9 días) está vencido, a punto de vencer o aún pendiente.
- Frescura de caché y resultados: decidir si un resultado almacenado en una sesión larga debe reutilizarse o recalcularse según el tiempo transcurrido desde su generación.
- Investigación sobre procesos con logs de eventos: emplear el log BPI Challenge 2012, presente en el entrenamiento, como banco de pruebas para tareas de espera y temporización en flujos de proceso.
- Estudio de robustez temporal: medir el comportamiento del modelo en preguntas ago con huecos fuera del rango visto en entrenamiento para caracterizar la extrapolación temporal.
- Prototipado de evaluación de sesiones sintéticas: generar y puntuar conjuntos de prueba con el formato Claude Code para validar heurísticas temporales antes de integrarlas en un sistema mayor.

## Benchmarks y rendimiento

Las métricas publicadas son Brier score (error cuadrático medio entre la probabilidad predicha y la opción verdadera; menor es mejor) y skill frente a una respuesta uniforme (1 menos el Brier del modelo dividido por el Brier de una conjetura uniforme; 0 equivale a azar, 1 es perfecto). Los intervalos son del 95 % obtenidos con 1.000 remuestreos de sesiones de test.

| Conjunto de test | Brier (IC 95 %) | Skill vs uniforme (IC 95 %) |
|---|---|---|
| Test sintético | 0,152 [0,142; 0,162] | 0,763 [0,748; 0,779] |
| Deadlines sintéticos a 8-27 días, preguntados 7+ días después | 0,576 [0,555; 0,599] | 0,136 [0,102; 0,168] |
| BPI test (wait) | 0,399 [0,366; 0,432] | 0,202 [0,136; 0,267] |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB en float32; el modelo base Qwen3.5-2B debe cargarse en bf16, lo que requiere aproximadamente 4-5 GB de VRAM para los pesos, más overhead de activaciones y contexto.
- El entrenamiento se realizó en una RTX 4070 Laptop GPU de 8 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo con 8 GB o más (RTX 3060 Ti, 3070, 4060 Ti, 4070, 4080, 4090).
- GPUs de datacenter como A100 o H100 son compatibles pero sobredimensionadas para un modelo de 2B.
- El despliegue no es estándar: no es un adaptador PEFT y requiere el módulo `sundial.arms.build_arm` en el commit indicado en `sundial_arm.json`; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque temporal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sundial-qwen3.5-2b-T-int | 18,8 M LoRA sobre Qwen3.5-2B | 2.048 tokens | Tiempo como texto en el prompt | apache-2.0 | Adaptador en HF, requiere código de sundial no público |
| sundial Text-Interval+DecayLoRA | LoRA + adaptador rango 1 en compuertas de decaimiento | 2.048 tokens | Tiempo en capas Gated DeltaNet | no disponible | Variante interna del estudio, no publicada como modelo |
| Qwen/Qwen3.5-2B | no disponible | no disponible | Sin tratamiento temporal específico | no disponible | Modelo base público en HF |

No se dispone de comparaciones con modelos de la misma categoría fuera del proyecto sundial en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un producto; no debe usarse como componente de producción sin validación adicional.
- El adaptador no es un PEFT estándar y el código de sundial no es público, por lo que no puede cargarse solo desde la model card.
- Rendimiento débil en preguntas "ago" con huecos temporales fuera del rango visto en entrenamiento.
- Los intervalos de confianza remuestrean sesiones e ignoran la variabilidad entre semillas de entrenamiento; los resultados corresponden a una sola semilla.
- Frente a la media de tres semillas de 1 época de Text-Interval, este modelo puntúa peor en el conjunto de deadlines a escala de semanas; parte de la mejora en BPI y en deadlines puede atribuirse a la elección de semilla, no al entrenamiento. La ganancia en test sintético sí proviene mayoritariamente del entrenamiento.
- Las puntuaciones de test tienen un sesgo optimista pequeño porque el modelo y el checkpoint se eligieron sobre datos de validación.
- La validación varía hasta 0,05 entre checkpoints vecinos, por lo que diferencias pequeñas son ruido.
- Solo soporta inglés.
- No se documentan sesgos sociales ni riesgos de alucinación específicos más allá de los propios del modelo base, sobre el que no se aporta información.
- La licencia apache-2.0 del adaptador no exime de verificar la licencia del modelo base Qwen/Qwen3.5-2B para uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NovusEdge/sundial-qwen3.5-2b-T-int
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Proyecto sundial: no disponible (el código no es público según la model card)
- Paper: no disponible
- Blog o demo: no disponible
