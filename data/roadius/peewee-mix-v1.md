# roadius/peewee-mix-v1

## Resumen

Peewee mix-v1 es un checkpoint de un modelo de decisión de tipo encoder, no generativo, desarrollado por el usuario roadius dentro del proyecto Peewee (https://github.com/roadius2/peewee). Se presenta como una "capa refleja" rápida para cargas de trabajo de agentes: en lugar de generar texto, responde preguntas tipadas sobre un estado dado (por ejemplo, el contenido de un ticket) en un único pase forward de encoder y devuelve probabilidades calibradas. Los tres tipos de pregunta soportados son `choice` (elegir entre un conjunto de opciones), `score` (posición en una rúbrica ordenada) y `noul` (si se cumple o no una condición).

Arquitectónicamente es un encoder ModernBERT-large con una cabeza de decisión de dos capas, afinado desde el checkpoint en inglés de Laya (convaiinnovations/laya). El dato real de safetensors indica 421.293.830 parámetros totales (aproximadamente 400M, como describe el autor), con un tamaño de repositorio de 0,8 GB y pesos en formato safetensors. No es un modelo autorregresivo: no genera texto ni mantiene conversaciones, sino que emite una respuesta puntual por pregunta con una probabilidad de confianza asociada.

Su relevancia actual radica en el coste y la latencia: para decisiones de enrutamiento, gating o triaje donde una llamada a un LLM resultaría demasiado lenta o cara, este modelo resuelve la decisión en milisegundos sobre GPU. Está pensado para integrarse como paso previo o de filtrado en pipelines de agentes, y su licencia Apache 2.0 permite uso comercial. Su limitación principal es que solo está entrenado y evaluado en inglés, con un contexto de 1.024 tokens por pregunta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder ModernBERT-large con cabeza de decisión de dos capas (no autorregresivo, encoder-only) |
| Parametros totales | 421.293.830 (safetensors); el autor indica ~400M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens por pregunta (pregunta + opciones + estado); los estados más largos se truncan y se reportan en `usage["truncated"]` |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | convaiinnovations/laya (checkpoint inglés) |
| Tamano del repositorio | 0,8 GB |
| Tareas soportadas | Preguntas tipadas: `choice`, `score`, `noul` |
| Salida | Probabilidades calibradas (no texto generado) |

## Arquitectura y entrenamiento

El modelo parte de un encoder ModernBERT-large (Apache 2.0, de AnswerDotAI) y le añade una cabeza de decisión de dos capas. Sobre esa base se realiza un fine-tuning desde el checkpoint en inglés de Laya de Convai Innovations. El resultado es un modelo no autorregresivo que, dado un estado y una pregunta tipada con sus opciones o criterios, produce en un solo pase forward una distribución de probabilidad sobre las respuestas posibles. La confianza devuelta corresponde a la probabilidad del argmax, lo que permite definir umbrales operativos ("actuar por encima de 0,9, escalar por debajo").

El entrenamiento utilizó dos conjuntos de datos: `LocalLLaMA/typed-decisions` (Apache 2.0, sobremuestreado 4×) y la partición `release-v2-redistributable` de `ZefanCai/Open-Jev` (CC0-1.0). En total, 92.827 ítems durante 4 épocas; el registro completo está en `train_meta.json`. No se menciona uso de RLHF ni DPO. La innovación destacable no está en la arquitectura, sino en el enfoque de calibración: el repositorio incluye ficheros de temperatura en `calibration/` por conjunto de datos y una temperatura integrada en `rl_agent_config.json`, además de la posibilidad de ajustar temperaturas propias sobre unos cientos de casos etiquetados sin alterar nunca la respuesta (solo reescala la confianza).

El autor advierte de un sesgo relevante en la calibración integrada: en mix-v1, el 86% de los ítems de validación procedían de un único corpus, por lo que las temperaturas ajustadas siguieron a ese corpus y el otro quedó peor calibrado (la precisión no se vio afectada porque la temperatura no mueve el argmax). Además, las temperaturas integradas se ajustaron contra las respuestas de referencia y no contra las distribuciones del profesor de typed-decisions, lo que afila las probabilidades (en typed-decisions, el Brier frente a la distribución del profesor sube de 0,057 a 0,083).

## Capacidades

- Respuesta a preguntas tipadas en un solo pase de encoder, sin decodificación autorregresiva.
- Tipo `choice`: seleccionar una opción de un conjunto definido, con criterios descriptivos por opción.
- Tipo `score`: asignar una posición en una rúbrica ordenada.
- Tipo `noul`: determinar si se cumple una condición booleana.
- Devolución de probabilidades calibradas por respuesta (`confidence`), aptas para umbralizar.
- Respuesta a múltiples preguntas sobre un mismo estado en una sola llamada (por ejemplo, cinco preguntas en un caso).
- Soporte de calibración propia por carga de trabajo mediante el comando `peewee calibrate`.
- Servicio con batching dinámico mediante `peewee serve`.
- No soporta generación de texto, tool calling en sentido clásico, razonamiento multi-paso conversacional, visión ni audio.

## Casos de uso

- Enrutamiento de herramientas en agentes: dado el estado de una conversación o tarea, decidir qué herramienta o endpoint invocar mediante una pregunta de tipo `choice`. Es adecuado porque resuelve la decisión en milisegundos en lugar de consumir una llamada a un LLM.
- Triaje de tickets de soporte: clasificar un ticket entrante en un equipo (facturación, técnico, otros) con una pregunta `choice` y marcar urgencia con una pregunta `noul`. El ejemplo de la model card muestra exactamente este flujo sobre un ticket de doble cobro.
- Gating previo a un LLM: filtrar o etiquetar peticiones antes de gastar tokens en un modelo generativo, decidiendo si una consulta merece una llamada completa, una respuesta cacheada o un rechazo.
- Moderación y verificación de condiciones: comprobar mediante `noul` si un texto cumple políticas concretas o si falta algún requisito antes de continuar un flujo.
- Puntuación de relevancia o calidad: usar `score` para ordenar candidatos sobre una rúbrica (por ejemplo, prioridad de una alerta o calidad de una respuesta) con una probabilidad asociada que permite umbralizar.
- Escalado automático a humano: aplicar una regla de decisión sobre la confianza ("actuar por encima de 0,9, escalar por debajo") para derivar casos dudosos a una persona, encajando con la naturaleza calibrada de la salida.
- Decisión de segundo nivel en agentes multi-paso: como capa refleja entre pasos, decidiendo si continuar, reintentar o abortar según el estado acumulado, con latencia de decenas de milisegundos.

## Benchmarks y rendimiento

Datos publicados en la model card. La precisión se mide frente a las respuestas de referencia de cada conjunto; el ECE es el error de calibración esperado de `confidence` frente a esas mismas respuestas. Las temperaturas nunca cambian la precisión.

| Metrica | typed-decisions test | Open-Jev test | Open-Jev OOD |
|---|---|---|---|
| Precisión | 0,8005 | 0,9403 | 0,8310 |
| ECE con temperaturas integradas (balanceadas) | 0,055 | 0,023 | 0,147 |
| ECE con el fichero de calibración propio del conjunto | 0,021 | 0,011 | — |
| TypeSafe Jev 1.13.0, precisión (mismos casos) | 0,7385 | 0,8104 | 0,8031 |
| TypeSafe Jev 1.13.0, ECE | 0,045 | 0,022 | 0,049 |

Nota del autor: typed-decisions y Open-Jev test provienen de las mismas distribuciones con las que se entrenó el modelo; Open-Jev OOD es la partición fuera de distribución y constituye la comparación justa. Los métodos y los informes en bruto están en el repositorio del proyecto (`BENCHMARKS.md` y `reports/`).

## Requisitos de hardware

- VRAM estimada en inferencia: unos 5 GB con la configuración por defecto de 32 preguntas por lote e entradas de 1.024 tokens; los pesos ocupan 0,8 GB en safetensors.
- GPU recomendadas: el autor indica que una GPU con 8 GB es suficiente para un modelo cargado. Se reporta latencia medida en RTX 5090 y en Apple M5 Max (MPS).
- Cabe en GPU de consumo: sí, con 8 GB de VRAM o más.
- Latencia: en RTX 5090, un caso con cinco preguntas tarda aproximadamente 10–17 ms; en Apple M5 Max (MPS), aproximadamente 130–300 ms.
- Opciones de despliegue: servidor propio del proyecto (`peewee serve`, con batching dinámico, instalable con `pip install "peewee-decide[server]"`). Al no ser un modelo autorregresivo, no aplica el ecosistema habitual de servidores de LLM (vLLM, TGI, llama.cpp, Ollama); no se documentan otras opciones de despliegue.
- Throughput estimado: no disponible (solo se publican latencias por caso).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Precisión (Open-Jev test / OOD) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Peewee mix-v1 | Encoder de decisión no autorregresivo | 421,3M | 1.024 tokens por pregunta | 0,9403 / 0,8310 | Apache 2.0 | Hugging Face y GitHub (roadius2/peewee) |
| TypeSafe Jev 1.13.0 | Modelo de decisión comparable (usado solo como referencia medida) | no disponible | no disponible | 0,8104 / 0,8031 | no disponible | no disponible |
| Convai Innovations Laya | Base del fine-tuning (encoder) | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face (convaiinnovations/laya) |
| ModernBERT-large | Encoder base | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face (answerdotai/ModernBERT-large) |

El único competidor medido directamente sobre los mismos casos es TypeSafe Jev 1.13.0, que obtiene menor precisión en Open-Jev test (0,8104 frente a 0,9403) y mejor ECE en Open-Jev OOD (0,049 frente a 0,147). El autor aclara que no se usaron salidas de Jev en el entrenamiento ni en la calibración.

## Limitaciones y advertencias

- Exceso de confianza en tareas desconocidas: en Open-Jev OOD, la confianza media con las temperaturas integradas es 0,98 frente a una precisión de 0,831. Calibrar sobre datos familiares no corrige ese desajuste; hay que calibrar sobre datos propios antes de umbralizar en un tipo de tarea nuevo.
- Sesgo de calibración de mix-v1: el 86% de los ítems de validación procedían de un único corpus, de modo que las temperaturas ajustadas siguieron a ese corpus y el otro quedó peor calibrado (sin afectar a la precisión).
- Las temperaturas integradas se ajustan contra las respuestas de referencia, no contra las distribuciones del profesor de typed-decisions, lo que afila las probabilidades (Brier sube de 0,057 a 0,083 en typed-decisions).
- Solo inglés: el modelo está entrenado y evaluado en inglés; para otros idiomas habría que partir del checkpoint multilingüe de Laya.
- Contexto corto: como máximo 1.024 tokens por pregunta, incluyendo la pregunta, sus opciones y el estado; los estados más largos se truncan y se señalan en `usage["truncated"]`.
- Evaluación únicamente sobre datos de benchmark: no se ha medido sobre tráfico real, por lo que se recomienda validar con datos propios antes de producción.
- Riesgo de alucinación en el sentido generativo: no aplica, porque el modelo no genera texto; el riesgo equivalente es una clasificación incorrecta con alta confianza, que es justamente lo que la calibración por carga de trabajo busca mitigar.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/roadius/peewee-mix-v1
- Repositorio del proyecto Peewee: https://github.com/roadius2/peewee
- README del repositorio: https://github.com/roadius2/peewee/blob/main/README.md
- Model card y métodos de evaluación: `BENCHMARKS.md` y `reports/` en el repositorio del proyecto
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Repositorio de Laya (Convai Innovations): https://github.com/NandhaKishorM/laya
- Encoder ModernBERT-large: https://huggingface.co/answerdotai/ModernBERT-large
- Dataset typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Dataset Open-Jev: https://huggingface.co/datasets/ZefanCai/Open-Jev
