# Priceman614/x402-demand

## Resumen

x402-demand es un modelo de clasificación de texto desarrollado por el usuario Priceman614. Se trata de un ajuste fino de `convaiinnovations/laya` (base ModernBERT-large más una cabeza de decisión, 421 M de parámetros) cuyo objetivo es estimar, en una única pasada directa, la probabilidad calibrada de que un endpoint x402 de pago por llamada reciba al menos una llamada pagada en los próximos 7 o 14 días. El modelo recibe únicamente el listado del recurso (URL, descripción, precio y red) y no consulta historial de llamadas, por lo que puede puntuar listados completamente nuevos o aún no publicados.

El problema que aborda es concreto: según la model card, solo alrededor de una cuarta parte de los servicios x402 listados recibe algún pago en una semana dada, y el 59 % de los listados presentes el 2026-08-24 ya no existían 30 días después. Un agente que decide a qué endpoint pagar, o un desarrollador que decide qué publicar, opera contra esa tasa base. Este modelo sirve como señal previa al despliegue de telemetría, que por definición no existe para listados nuevos.

La relevancia es doble. Por un lado, es un caso práctico de «System One» aplicado a comercio agéntico: una decisión rápida, de una sola pasada, sobre un mercado emergente. Por otro, es un ejemplo metodológico de ajuste fino con RLCD (REINFORCE sobre una regla de puntuación estrictamente propia, combinada con entropía cruzada suave) ejecutado en una única GPU DGX Spark GB10. Su rendimiento es modesto en términos absolutos (ROC AUC 0,639 global) pero es el único modelo de la comparativa que supera el azar en listados nuevos (AUC 0,575 frente a 0,50-0,51 de las alternativas basadas en telemetría).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large con cabeza de decisión (encoder transformer; modelo base `convaiinnovations/laya`) |
| Parametros totales | 421.293.830 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens heredados de ModernBERT-large (no confirmado explícitamente en la información proporcionada); la descripción del listado se trunca a 600 caracteres |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos safetensors (aproximadamente 0,8 GB) |
| Idiomas soportados | No disponible en los metadatos; los textos de entrenamiento y las preguntas del modelo están redactados en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`, compatible con la librería `laya`) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer ModernBERT-large con una cabeza de decisión, cargado mediante la librería `laya` y empaquetado con 421 M de parámetros. El modelo no genera texto: puntúa un estado serializado en JSON con las claves `resource`, `description` (truncada a 600 caracteres), `price_usd` y `network`, y devuelve probabilidades para dos preguntas fijas, `paid_7d` y `paid_14d`, en una sola pasada directa. El orden y la redacción exacta de esas claves y preguntas condicionan el resultado, ya que son las que se usaron durante el entrenamiento.

El entrenamiento parte de 31 instantáneas diarias (2026-08-24 a 2026-09-23) del índice de descubrimiento x402 de Coinbase CDP, con aproximadamente 15.000 listados por día, 23.900 recursos distintos y 2.464 hosts. La etiqueta `paid_Hd` vale 1 si el campo `quality.lastCalledAt` del listado avanza dentro de H días, es decir, si hubo al menos una llamada pagada; no indica que el listado siga vivo. Se aplican dos muros: uno de hosts (buckets sha256, 20 % de hosts reservados para test) y otro temporal (las ventanas de etiquetado de entrenamiento terminan antes del primer día de test), con un 10 % adicional de hosts reservado para selección de modelo y ajuste de temperatura. Como el texto es idéntico entre instantáneas de un mismo listado, cada listado constituye un único ejemplo con objetivo suave (proporción de días pagados).

La receta es un port a una sola GPU del ajuste RLCD original de Laya: REINFORCE sobre una regla de puntuación estrictamente propia (logarítmica y esférica) con línea base de grupo, más entropía cruzada suave; 3 épocas en bf16 sobre una DGX Spark GB10, seleccionando el mejor punto por AUC en hosts reservados. El checkpoint incluye una temperatura ajustada que la librería `laya.Agent` aplica automáticamente.

## Capacidades

- Predicción binaria calibrada de demanda para endpoints x402: probabilidad de al menos una llamada pagada en 7 días y en 14 días.
- Funcionamiento sin historial de telemetría: puntúa listados nuevos o no publicados solo a partir del texto y metadatos del listado.
- Ejecución en una única pasada directa (one forward pass), sin decodificación autoregresiva ni cadena de pensamiento.
- Salida de probabilidad con temperatura ya ajustada en el checkpoint (el autor reporta un ECE de 0,116 en el conjunto de test).
- Integración como característica adicional en modelos de telemetría: según el autor, aporta +0,027 AUC global y +0,08 AUC en listados nuevos a un LightGBM que la use como feature.
- Inferencia en CPU, según indica la model card.
- Tool calling / function calling: no disponible (no es un modelo generativo ni expone interfaz de herramientas).
- Capacidades de agente y razonamiento multi-paso: no disponibles; el modelo es un componente de puntuación, no un planificador.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (visión, audio, modo thinking): no disponibles.

## Casos de uso

- Enrutado de agentes que pagan endpoints x402: antes de que un agente autónomo decida gastar en una llamada, el modelo puntúa el recurso y permite descartar listados con probabilidad muy baja de recibir tráfico pagado, reduciendo gasto en endpoints abandonados. La inferencia en CPU y en una sola pasada lo hace viable dentro del bucle de decisión.
- Curación y ordenación de catálogos en marketplaces x402: un índice de descubrimiento puede usar la puntuación como señal de ordenación o de filtrado previo, ya que el 59 % de los listados de una fecha concreta desaparecieron en 30 días según la model card.
- Pre-evaluación de un listado antes de publicarlo: un desarrollador puede serializar el JSON con `resource`, `description`, `price_usd` y `network` y obtener una estimación de demanda antes de comprometerse a operar el servicio.
- Filtro previo (pre-scoring) en pipelines de descubrimiento con presupuesto limitado: si un rastreador solo puede monitorizar o validar un subconjunto de endpoints, la puntuación permite priorizar cuáles comprobar primero.
- Característica adicional en un modelo de telemetría existente: el propio autor documenta que añadir la salida del modelo como feature a un LightGBM mejora el AUC, lo que lo convierte en un complemento, no en un sustituto, de los sistemas basados en historial de llamadas.
- Análisis de mercado sobre comercio agéntico: permite estudiar qué atributos de un listado (precio, red, texto descriptivo) correlacionan con recibir demanda pagada, usando el modelo como instrumento de medida sobre instantáneas históricas.
- Detección de clusters de listados casi idénticos: el autor advierte de que algunos hosts publican cientos de endpoints casi iguales; la puntuación homogénea sobre ese tipo de listados puede ayudar a identificarlos, aunque el modelo no fue diseñado específicamente para esa tarea.

## Benchmarks y rendimiento

Los datos publicados corresponden al test retenido (fechas posteriores y hosts no vistos en entrenamiento: 13.644 días-listado sobre 442 hosts no vistos). La métrica es ROC AUC para «pagado en 7 días»:

| Modelo | Todos los hosts de test | Listados nuevos | Hosts con ≤ 20 listados |
|---|---|---|---|
| Regla de recencia (días desde la última llamada pagada) | 0,635 | 0,416 | 0,696 |
| Regresión logística, telemetría | 0,678 | 0,500 | 0,731 |
| LightGBM, telemetría | 0,672 | 0,514 | 0,737 |
| x402-demand · solo listado (este modelo) | 0,639 | 0,575 | 0,668 |
| x402-demand · listado + telemetría (no publicado) | 0,732 | 0,581 | 0,754 |

Calibración: ECE de 0,116 en el conjunto de test. El autor advierte de que el modelo es sobreconfiado por encima de 0,5 y que una puntuación de 0,7 debería interpretarse como «en torno al 45 %». Se recomienda reajustar la calibración con tráfico propio si se necesitan probabilidades para decidir. El autor también reporta Brier, ECE y otros desgloses en `results/metrics.json`, y cifras de mejora con intervalos de confianza obtenidos por bootstrap remuestreado por host (+0,027 AUC global, IC 95 % −0,008 a +0,073; +0,08 en listados nuevos, IC 95 % −0,002 a +0,153). No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones derivadas del tamaño del checkpoint, no cifras oficiales): en bf16 o fp16, en torno a 0,9-1,2 GB incluyendo overhead; en int8, aproximadamente 0,5-0,7 GB; en int4, aproximadamente 0,3-0,5 GB.
- Inferencia en CPU: la model card indica explícitamente que CPU es suficiente. Con 421 M de parámetros, es esperable que funcione sin GPU en entornos de puntuación por lotes.
- GPU recomendadas: no hay recomendaciones oficiales. Por tamaño, cualquier GPU con 2 GB o más de VRAM (RTX 3060, RTX 4060, T4, L4) debería bastar para inferencia en bf16; GPU de mayor gama (A100, H100) solo tienen sentido para puntuación masiva por lotes.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo moderna, e incluso en iGPU o CPU.
- Opciones de despliegue: la vía documentada es `pip install laya torch` y `laya.load("Priceman614/x402-demand")`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y al no ser un modelo generativo las herramientas orientadas a generación no aplican directamente.
- Latencia y throughput: no disponibles. Al tratarse de un encoder de 421 M con una sola pasada directa y sin decodificación, la latencia esperada es de milisegundos a decenas de milisegundos por ejemplo en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se conocen alternativas publicadas con la misma tarea (predicción de demanda de endpoints x402 a partir del listado). Los únicos comparables documentados son las líneas base internas del propio autor:

| Alternativa | Tipo | Requiere historial | AUC global | AUC listados nuevos | Licencia / disponibilidad |
|---|---|---|---|---|---|
| x402-demand (este modelo) | Encoder ajustado con RLCD | No | 0,639 | 0,575 | Apache 2.0, pesos publicados |
| x402-demand · listado + telemetría | Variante del mismo modelo | Sí | 0,732 | 0,581 | No publicada como pesos (solo puntuación alojada) |
| LightGBM sobre telemetría | Modelo de árboles | Sí | 0,672 | 0,514 | No especificada en la información disponible |
| Regresión logística sobre telemetría | Modelo lineal | Sí | 0,678 | 0,500 | No especificada en la información disponible |
| Regla de recencia | Heurística | Sí | 0,635 | 0,416 | No aplica |

Comparado con `convaiinnovations/laya`, su modelo base, la diferencia es de tarea y de cabeza de decisión, no de escala: misma arquitectura y mismo orden de magnitud de parámetros (421 M), pero especializado en una única pregunta binaria sobre el mercado x402.

## Limitaciones y advertencias

- Ventana de datos muy corta: 31 días de historial y una única ventana limpia de 14 días. El mercado x402 tiene semanas de vida y cambia rápido, por lo que cabe esperar deriva; el autor indica reentrenamiento mensual.
- Pagado no equivale a legítimo: una autoclamada de mantenimiento o tráfico automatizado cuenta como llamada pagada. El modelo predice demanda, no calidad ni honestidad del servicio.
- Un único índice: se entrenó exclusivamente sobre el CDP Bazaar de Coinbase, por lo que no cubre otros registros de endpoints.
- Sobreconfianza en la parte alta de la distribución: con ECE de 0,116 y comportamiento sobreconfiado por encima de 0,5, no debe usarse la probabilidad bruta como puerta dura sin recalibrar.
- Hosts con listados masivos: algunos hosts publican cientos de endpoints casi idénticos. El test excluye sus hosts de entrenamiento, pero la model card advierte de este patrón como riesgo relevante (el texto proporcionado se corta en este punto).
- Inferior a los modelos con telemetría cuando esta existe: en el conjunto global, la regresión logística y el LightGBM superan al modelo. Su valor está en listados nuevos y como característica adicional.
- Idiomas: los prompts y las preguntas están fijados en inglés y con una redacción exacta; cambiar la formulación puede degradar el resultado. No hay información sobre comportamiento en otros idiomas.
- Dependencia del formato de entrada: el estado debe serializarse como JSON con las claves `resource`, `description`, `price_usd` y `network` en ese orden, y `price_usd` como cadena de texto.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base `convaiinnovations/laya` y el dataset de entrenamiento (no publicado) pueden imponer condiciones adicionales que conviene verificar antes de desplegar en producción.
- Riesgo de alucinación: no aplica en el sentido generativo (el modelo no produce texto libre), pero sí existe riesgo de puntuaciones mal calibradas presentadas como probabilidades fiables.
- Datos de adopción del repositorio: 0 descargas y 0 likes en el momento del registro, con fecha de creación y actualización el 2026-09-23. Es un artefacto muy reciente y sin validación externa independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Priceman614/x402-demand
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Métricas completas (ruta dentro del repositorio): https://huggingface.co/Priceman614/x402-demand/blob/main/results/metrics.json
- Procedimiento de entrenamiento (ruta dentro del repositorio): https://huggingface.co/Priceman614/x402-demand/blob/main/docs/PROCESS.md
- Gráficas de resultados (rutas dentro del repositorio): https://huggingface.co/Priceman614/x402-demand/blob/main/results/auc_by_segment.png, https://huggingface.co/Priceman614/x402-demand/blob/main/results/calibration.png, https://huggingface.co/Priceman614/x402-demand/blob/main/results/lift_by_decile.png
- Demo: anunciada como «coming soon» en la model card, sin URL disponible
- Paper, blog o repositorio adicionales: no disponibles en la información proporcionada
