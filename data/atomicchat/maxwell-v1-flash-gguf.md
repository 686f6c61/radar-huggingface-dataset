# AtomicChat/Maxwell-V1-Flash-GGUF

## Resumen

Maxwell-V1-Flash es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por el equipo Maxwell, con un total de 35.970.737.539 parámetros y aproximadamente 3.000 millones de parámetros activos por token. Está preentrenado sobre unos 26 billones de tokens multilingües y ajustado posteriormente para razonamiento, búsqueda y tareas agénticas. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

El repositorio analizado, AtomicChat/Maxwell-V1-Flash-GGUF, no contiene los pesos originales sino cuantizaciones GGUF producidas por AtomicChat para su uso con llama.cpp. AtomicChat es el equipo detrás de la aplicación Atomic Chat, orientada a ejecutar modelos de pesos abiertos en local y sin conexión. La relevancia de esta publicación radica en que es el primer GGUF disponible de Maxwell-V1-Flash y en que su soporte en llama.cpp ha requerido un parche propio (maxwell-moe-port.patch) sobre el commit d3c3e242c, ya que las versiones estándar de llama.cpp, LM Studio y Ollama todavía no cargan estos ficheros.

Una particularidad destacable es la sensibilidad del modelo a la cuantización: según las métricas del autor, a 4,6 bits por peso el fichero reproduce el token original solo el 85,7 % de las veces, cuando modelos de esta clase suelen mantenerse por encima del 95 %. Por ello AtomicChat publica cuantizaciones con matrices de importancia (imatrix) calculadas sobre los pesos BF16 y descarta por debajo de 20 GB al caer del 80 % de coincidencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo transformer, con matrices de mezcla mHC y 256 expertos enrutados (top-12) |
| Parametros totales | 35.970.737.539 |
| Parametros activos | ~3.000 millones (3B active) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, AD-Q6_K, AD-Q6_K-Q5_K, AD-Q5_K-Q4_K, AD-Q4_K-IQ4_XS (las AD mantienen todo salvo los expertos enrutados en Q8_0, con matrices de mezcla mHC en F32) |
| Idiomas soportados | Multilingüe; tokenizador diseñado específicamente para tailandés, lao, birmano, jemer y shan, además de CJK y texto latino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (BF16 en dos partes, más cuantizaciones AD y Q8_0) |

## Arquitectura y entrenamiento

Maxwell-V1-Flash es un transformer MoE con 35,97 mil millones de parámetros totales y aproximadamente 3 mil millones activos por token, lo que sitúa su coste de inferencia en el rango de un modelo denso de 3B pese a su tamaño total. El modelo emplea 256 expertos enrutados con selección top-12 y matrices de mezcla mHC (que en las cuantizaciones de AtomicChat se conservan en F32). El tokenizador está construido de forma explícita para dar cobertura al tailandés, lao, birmano, jemer y shan, además de CJK y latino, lo que lo diferencia de la mayoría de modelos multilingües de su categoría.

El preentrenamiento se realizó sobre aproximadamente 26 billones de tokens multilingües, seguido de un postentrenamiento orientado a razonamiento, búsqueda y trabajo agéntico. No se detalla en la información disponible la composición exacta del dataset ni si se emplearon RLHF o DPO. Una innovación relevante documentada por el cuantizador es el comportamiento del router: pequeñas diferencias numéricas en cualquier capa pueden alterar qué expertos se seleccionan cerca del límite del top-12, lo que explica la inusual sensibilidad del modelo al redondeo y a la cuantización. El mismo BF16 ejecutado en F32 frente a bf16 presenta una divergencia media de KLD de 0,030 y una coincidencia de token superior del 93,2 %.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento explícito, con modo de pensamiento (thinking) que puede desactivarse; verificado por el autor en llama-server con --jinja.
- Llamada a herramientas (tool calling / function calling), verificada manualmente por AtomicChat.
- Flujos agénticos y razonamiento multi-paso, según el postentrenamiento declarado.
- Búsqueda (search) como tarea para la que fue postentrenado.
- Capacidades multilingües con foco en lenguas del sudeste asiático (tailandés, lao, birmano, jemer, shan), además de CJK y latino.
- Respuestas en idiomas distintos del inglés verificadas en pruebas manuales (respuesta en tailandés).

## Casos de uso

- Asistencia conversacional local: el modelo puede gestionar diálogos multi-turno en una aplicación de escritorio sin conexión como Atomic Chat, aprovechando su naturaleza MoE para mantener un coste de inferencia bajo (3B activos) en hardware de consumo.
- Agentes con llamada a herramientas: al soportar tool calling y haber sido postentrenado para trabajo agéntico, encaja en orquestadores que encadenan búsquedas, ejecución de funciones y síntesis de resultados en varios pasos.
- Procesamiento de idiomas del sudeste asiático: su tokenizador específico para tailandés, lao, birmano, jemer y shan lo hace adecuado para tareas de traducción, resumen o atención al cliente en esas lenguas, donde muchos modelos genéricos fragmentan en exceso el texto.
- Razonamiento con modo thinking desactivable: útil en pipelines donde se necesita alternar entre respuestas rápidas y respuestas con cadena de razonamiento según la dificultad de la consulta.
- Despliegue en estaciones de trabajo con GPU de 24 GB: la cuantización AD-Q4_K-IQ4_XS (20,8 GB) permite ejecutar el modelo completo en una RTX 3090 o RTX 4090, habilitando prototipado e investigación sin infraestructura de centro de datos.
- Servicio de inferencia con llama-server: con 6.398 tokens/s de procesamiento de prompt y 173 tokens/s de generación en una H100 con contexto vacío, es viable para servir cargas moderadas de forma self-hosted.
- Evaluación comparativa de cuantizaciones: el repositorio de métricas asociado permite a investigadores estudiar el impacto de la cuantización en modelos MoE sensibles al redondeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos numéricos publicados son métricas de fidelidad de cuantización y de velocidad:

| Fichero | GB en disco | bpw | KLD media | KLD p99 | Mismo token superior |
|---|---:|---:|---:|---:|---:|
| BF16 (2 partes) | 72,0 | 16,02 | 0 | 0 | 100 % |
| Q8_0 | 38,4 | 8,54 | 0,0371 | 0,431 | 93,6 % |
| AD-Q6_K | 30,2 | 6,72 | 0,0482 | 0,563 | 92,6 % |
| AD-Q6_K-Q5_K | 27,2 | 6,05 | 0,0697 | 0,826 | 90,9 % |
| AD-Q5_K-Q4_K | 22,9 | 5,09 | 0,1383 | 1,649 | 87,3 % |
| AD-Q4_K-IQ4_XS | 20,8 | 4,62 | 0,1736 | 2,045 | 85,7 % |

Medido con llama-perplexity sobre un corpus neutral de 30 idiomas (114 fragmentos de 4.096 tokens), llama.cpp d3c3e242c con el parche, 2x H100 80 GB. El autor advierte que estas cifras incluyen un suelo de redondeo de aproximadamente 0,03.

| Contexto | Procesamiento de prompt (tok/s) | Generación (tok/s) |
|---|---:|---:|
| Vacío (512 tokens) | 6.398 | 173 |
| 8K tokens | 5.374 | 150 |
| 32K tokens | 3.804 | 132 |

Medido con llama-bench y flash attention sobre AD-Q4_K-IQ4_XS en 1x H100 80 GB.

## Requisitos de hardware

- VRAM estimada: 20,8 GB (AD-Q4_K-IQ4_XS), 22,9 GB (AD-Q5_K-Q4_K), 27,2 GB (AD-Q6_K-Q5_K), 30,2 GB (AD-Q6_K), 38,4 GB (Q8_0) y 72,0 GB (BF16).
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para AD-Q4_K-IQ4_XS; RTX 5090 (32 GB) para AD-Q6_K-Q5_K; 2x 24 GB para AD-Q6_K; 48 GB de VRAM para Q8_0; H100 80 GB para BF16 o para servicio de alta concurrencia.
- Macs: 32 GB para AD-Q5_K-Q4_K, 48 GB para AD-Q6_K y 64 GB para Q8_0.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con la cuantización de 4,62 bpw y en RTX 5090 con la de 6,05 bpw.
- Opciones de despliegue: exclusivamente llama.cpp con el parche maxwell-moe-port.patch sobre el commit d3c3e242c, y llama-server con --jinja. Las versiones estándar de llama.cpp, LM Studio y Ollama no cargan estos ficheros todavía.
- Throughput: hasta 6.398 tok/s de prompt y 173 tok/s de generación en H100 con AD-Q4_K-IQ4_XS y contexto vacío; cae a 3.804 y 132 tok/s con 32K tokens de contexto.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks de calidad ni especificaciones de modelos alternativos comparables, por lo que no es posible establecer una comparación rigurosa con otros MoE de tamaño similar.

## Limitaciones y advertencias

- Sensibilidad extrema a la cuantización: a 4,62 bpw solo reproduce el token original el 85,7 % de las veces, frente al 95 % habitual en modelos de su clase. Por debajo de 20 GB el autor descarta publicar ficheros por caer del 80 % de coincidencia.
- El redondeo en bf16 frente a F32 ya introduce por sí solo una KLD media de 0,030, atribuida a cambios en la selección de expertos cerca del límite del top-12 en cada capa.
- Compatibilidad limitada: requiere un parche no upstream de llama.cpp; LM Studio y Ollama no funcionan con estos ficheros.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo general de los modelos generativos.
- Sesgos conocidos: no documentados en la información disponible.
- Longitud de contexto: no especificada, lo que impide planificar despliegues que dependan de ventanas largas.
- Idiomas: aunque el tokenizador cubre varias lenguas del sudeste asiático, no se detalla el nivel de competencia por idioma ni se publican evaluaciones multilingües.
- Licencia Apache 2.0: permite uso comercial, pero el parche de llama.cpp necesario debe evaluarse por separado en cuanto a su mantenimiento y soporte.
- El repositorio ocupa 281,5 GB, lo que exige planificación de almacenamiento si se descargan varias cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/AtomicChat/Maxwell-V1-Flash-GGUF
- Modelo base: https://huggingface.co/maxwell-model/Maxwell-V1-Flash
- Métricas y logs de cuantización: https://huggingface.co/datasets/AtomicChat/Maxwell-V1-Flash-GGUF-metrics
- Corpus de calibración: https://huggingface.co/datasets/AtomicChat/calib-corpora/tree/main/builds/maxwell-v1-flash-moe
- Aplicación Atomic Chat: https://atomic.chat/
- Repositorio Atomic Chat en GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
