# abhishek085/jev-control-es

## Resumen

jev-control-es es un modelo de decisión no autorregresivo construido sobre un encoder bidireccional ModernBERT-base (149 millones de parámetros), desarrollado por el usuario abhishek085. No es un modelo generativo: su función es puntuar opciones candidatas dentro de un prompt estructurado, devolviendo una distribución softmax sobre las alternativas de una pregunta. Se presenta como el hermano «extra small» de jev-control-core (0,8B, decoder), compartiendo su mismo objetivo —los puntos de decisión dentro de un arnés de agentes— pero con una arquitectura distinta.

El problema que resuelve es la toma de decisiones discretas en pipelines de agentes: puertas de guardarraíl e inyección, enrutado de herramientas, ranking de contexto, suficiencia de respuesta, triaje, moderación, verificación de afirmaciones, siguiente acción, emparejamiento de entidades y escalado a humano. En lugar de generar una letra de opción mediante un decoder, puntúa cada opción en su propio token `[MASK]` en una única pasada bidireccional, sin LM head y sin techo fijo de opciones.

Es relevante por su coste: 7,7 ms por decisión (mediana) en una NVIDIA GB10, menos de la mitad que jev-control-core (18,5 ms) y muy por debajo de Laya en una T4 (39,5 ms), con menos de una quinta parte de parámetros que el primero. La contrapartida es que en el arnés real de JevControl (demo `support_desk`, 203 tareas) alcanza 0,695 de precisión frente a 0,892 de Gemma 4 con prompting.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder bidireccional ModernBERT-base (22 capas) más cabeza lineal de scoring entrenada desde cero; modelo de decisión no autorregresivo |
| Parametros totales | 149.014.272 (aproximadamente 149M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de answerdotai/ModernBERT-base, un encoder bidireccional de 149M parámetros, 22 capas y 8.192 tokens de contexto, que se afina por completo (backbone más cabeza). La cabeza es una capa lineal entrenada desde cero que proyecta el estado oculto de cada posición `[MASK]` a un escalar; los escalares de las opciones de una misma pregunta se normalizan con softmax. Se diferencia de Laya (Convai, Apache 2.0), de quien toma el enfoque, en dos puntos: usa una única capa lineal en lugar de dos capas transformer adicionales sobre las posiciones marcadoras, y emplea ModernBERT-base en vez de la variante -large (395M), ya que el objetivo de esta variante es ser «extra small». El texto de la opción nunca se genera, solo se puntúa en su sitio.

El entrenamiento consistió en un fine-tuning completo durante 4 épocas sobre 5.000 filas (500 por familia) procedentes de las diez familias de puntos de decisión de `os_datagen.control`, fijadas al commit `92d92c9`. Se usó learning rate 5e-5, batch 32, scheduler coseno y `seed: 0` (determinista, según `configs/train/sft_control_jev_es.yaml`). La pérdida es la misma que la de spark-s1, regularizada con KL más Brier, reutilizada sin cambios porque solo necesita logits restringidos por opción y una distribución objetivo. Un detalle relevante: el orden de las opciones de cada familia de tipo elección se aleatoriza por fila, lo que corrigió un sesgo real hacia la posición de la respuesta.

## Capacidades

- Puntuación de opciones: dado un contexto, una pregunta y una lista de opciones, devuelve una distribución de probabilidad sobre las opciones en una sola pasada.
- Decisión en puntos concretos del arnés de agentes: guardarraíl e inyección, enrutado de herramientas, ranking de contexto, suficiencia de respuesta, triaje, moderación, verificación de afirmaciones, siguiente acción, emparejamiento de entidades y escalado a humano.
- Salida estructurada y calibrada: las evaluaciones propias reportan ECE de 0,000 en los conjuntos medidos.
- Sin LM head y sin restricción a tokens de letra: no hay techo fijo de 26 opciones; las opciones se puntúan in situ, no se generan.
- Servido mediante el mismo formato de cable `/v1/systemone` que spark-s1 y jev-control-core (`open_spark_jev.serve.gateway`, que detecta el marcador `control_es.json`).
- Soporte de tool calling: no disponible como capacidad generativa; el enrutado de herramientas se realiza como decisión puntuada, no como llamada emitida por el modelo.
- Soporte de agentes y razonamiento multi-paso: participa como componente de decisión dentro del arnés JevControl, no como planificador autónomo.
- Capacidades multilingües: no; el modelo está etiquetado únicamente para inglés.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Enrutado de herramientas en agentes: el modelo puntúa qué herramienta corresponde a una petición dada dentro de un catálogo, con 0,824 de precisión en el sitio `route` del arnés real; se integraría como paso previo a la ejecución de la herramienta en lugar de pedir al LLM principal que la elija por texto.
- Puertas de guardarraíl y detección de inyección de prompts: con 0,872 de precisión en el sitio `injection`, actúa como filtro rápido y barato antes de que la petición llegue al modelo generativo, reduciendo coste y latencia en el camino crítico.
- Verificación de suficiencia de respuesta: con 0,770, decide si el contexto recuperado basta para responder, lo que permite disparar una segunda ronda de recuperación en un pipeline RAG solo cuando es necesario.
- Triaje y escalado a humano: clasifica si un caso debe resolverse automáticamente o escalarse, mediante las familias `triage` y `escalate_human`; al ejecutarse en 7,7 ms, puede colocarse delante de cada interacción sin penalizar la latencia percibida.
- Moderación de contenido: la familia `moderation_class` permite etiquetar contenido entrante con una puntuación calibrada, aprovechando la salida softmax como medida de confianza para umbrales ajustables.
- Emparejamiento de entidades y verificación de afirmaciones: como componente de resolución dentro de un pipeline de extracción, comparando candidatos mediante puntuación en lugar de generación.
- Sustitución de componentes de decisión en despliegues con presupuesto de VRAM muy ajustado: al ocupar 149M parámetros (aproximadamente 0,6 GB en el repositorio), puede residir junto al modelo generativo en la misma GPU sin competir por memoria.

## Benchmarks y rendimiento

Evaluaciones propias sobre particiones retenidas (puntuadas con el orden escrito y promediadas sobre 3 re-permutaciones aleatorias):

| split | accuracy | accuracy (media sobre 3 permutaciones) | ECE (calibrado) |
|---|---|---|---|
| test_locked | 1.000 | 1.000 | 0.000 |
| challenge | 1.000 | 1.000 | 0.000 |

Latencia en llamadas de decisión aisladas sobre una NVIDIA GB10: 7,7 ms por decisión (mediana). Para comparar: Laya tarda 39,5 ms en una T4 y jev-control-core 18,5 ms.

Arnés real (JevControl, demo `support_desk`, 203 tareas, frente a una línea base Gemma-4-E4B):

| variante | accuracy | veredicto |
|---|---|---|
| Gemma 4 (con prompting) | 0.892 | línea base |
| jev-control-es | 0.695 | peor (Δ -0,197), pero 4 veces mejor que la primera versión entrenada |

Desglose por sitio: injection 0,872; route 0,824; sufficiency 0,770; relevance 0,188.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 300 MB de pesos en FP16 (149M parámetros), más memoria de activaciones; el repositorio ocupa 0,6 GB. Cifras de cuantización oficiales: no disponibles.
- GPU de referencia medida: NVIDIA GB10, con 7,7 ms de mediana por decisión.
- Cabe holgadamente en GPU de consumo: cualquier tarjeta con 4-8 GB de VRAM o más (por ejemplo, RTX 3060, RTX 4090) es suficiente para el modelo en solitario.
- Al ser un encoder de 149M parámetros, puede convivir en la misma GPU que un modelo generativo grande sin agotar la memoria.
- Opciones de despliegue: el modelo se sirve mediante el formato `/v1/systemone` de `open_spark_jev.serve.gateway`. Otras opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas para esta arquitectura en la información disponible.
- Throughput: no disponible; solo se aporta la latencia por decisión aislada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Latencia | Licencia | Notas |
|---|---|---|---|---|---|---|
| jev-control-es | Encoder ModernBERT-base + cabeza lineal | 149M | 8.192 | 7,7 ms (GB10) | apache-2.0 | Accuracy 0,695 en el arnés real |
| jev-control-core | Decoder autoregresivo | 0,8B | no disponible | 18,5 ms | no disponible | Mismo objetivo, familia hermana mayor |
| Laya (Convai) | Encoder + dos capas transformer adicionales | 395M (-large) | no disponible | 39,5 ms (T4) | apache-2.0 | Arquitectura origen del enfoque; usa ModernBERT-large |
| Gemma 4 E4B (con prompting) | Modelo generativo | no disponible | no disponible | no disponible | no disponible | Línea base del arnés: 0,892 de accuracy |

## Limitaciones y advertencias

- Rendimiento por debajo de la línea base en el arnés real: 0,695 frente a 0,892 de Gemma 4 con prompting (Δ -0,197). No sustituye a un LLM generalista en la tarea completa.
- El sitio `relevance` (ranking de contexto) es claramente débil: 0,188 de precisión. El modelo muestra un sesgo fuerte hacia predecir «totalmente relevante» con independencia del contenido (verdad=0 pero predicho 1 o 2 en 417 de 723 llamadas evaluadas en la ejecución publicada). No mejoró con los arreglos aplicados y empeoró al intentar un tercero.
- Riesgo de colapso hacia la clase mayoritaria: la primera versión entrenada obtuvo 0,167 en el arnés real, con la detección de inyección colapsada a responder siempre «false» y la suficiencia peor que una moneda al aire.
- Sensibilidad al orden de las opciones: con orden fijo en las familias de tipo elección, el modelo aprendió la posición de la respuesta en lugar de leer el texto de la opción. Invisible en la evaluación propia, catastrófico frente al orden de un llamador real. Se corrigió aleatorizando el orden por fila, pero es un riesgo a vigilar en cualquier reentrenamiento.
- Dependencia de datos sintéticos: las familias `route`, `sufficient` y `relevance` originales usaban estado sintético con vocabulario fijo y templado; hubo que reescribirlas con prosa realista de atención al cliente y un corpus de base de conocimiento de 12 temas.
- Idioma: solo inglés. El sufijo «es» del nombre corresponde a «extra small», no a español; el modelo no está etiquetado para castellano.
- No es un modelo generativo: no produce texto, no emite llamadas a herramientas y no puede usarse como LLM autónomo.
- Restricciones de licencia: apache-2.0, permisiva para uso comercial, con la obligación habitual de conservar avisos de licencia y atribución. Conviene revisar además la licencia del modelo base ModernBERT-base al redistribuir.
- Calibración: el ECE de 0,000 se midió en las particiones propias del autor; no hay datos de calibración en el arnés real, donde el sesgo de `relevance` sugiere que la confianza puede no ser fiable fuera de distribución.
- Huella en HuggingFace: 0 descargas y 0 «likes» en el momento de la consulta, lo que implica ausencia de validación externa independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abhishek085/jev-control-es
- Modelo hermano (0,8B, decoder): https://huggingface.co/abhishek085/jev-control-core
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Arquitectura de referencia (Laya, Convai): https://huggingface.co/convaiinnovations/laya
- Repositorio JevControl: https://github.com/abhishek085/JevControl
