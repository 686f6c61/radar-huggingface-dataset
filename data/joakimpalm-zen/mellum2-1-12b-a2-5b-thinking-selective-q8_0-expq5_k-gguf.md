# Joakimpalm-Zen/Mellum2.1-12B-A2.5B-Thinking-selective-Q8_0-expQ5_K-GGUF

## Resumen

Mellum2.1-12B-A2.5B-Thinking-selective-Q8_0-expQ5_K-GGUF es una cuantización GGUF del modelo JetBrains/Mellum2.1-12B-A2.5B-Thinking, publicada por el usuario Joakimpalm-Zen dentro del ecosistema de su motor de inferencia Xyntetik Runner. El modelo base es un transformer de tipo mezcla de expertos (MoE) desarrollado por JetBrains, con 12.149.923.072 parámetros totales y aproximadamente 2.500 millones de parámetros activos por token, orientado a generación de texto con modo de razonamiento (thinking).

La particularidad de esta publicación no es el modelo en sí, sino el esquema de cuantización selectiva: las capas de atención se mantienen en Q8_0 mientras que los expertos se comprimen a una mezcla experimental de Q5_K, con el objetivo de preservar la fidelidad respecto al modelo original en float32. El autor afirma que esta combinación supera un umbral de calidad (top-1 con margen ≥ 97 % y KLD medio ≤ 0,05) frente al modelo padre, un listón que, según sus mediciones, la propia cuantización Q4_K_M del publicador original no alcanza.

El archivo está pensado para servirse con Xyntetik Runner, un motor de inferencia en C11 sin dependencias con servidor compatible con la API de OpenAI, y no necesariamente con otros runtimes GGUF convencionales. Es relevante ahora porque explora una vía poco habitual en el ecosistema GGUF: cuantización por subcapas con criterio de fidelidad medido, en lugar de una escalera uniforme de tipos de cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), modelo base Mellum2.1-12B-A2.5B-Thinking |
| Parámetros totales | 12.149.923.072 |
| Parámetros activos | ~2.500 millones (según denominación A2.5B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Atención en Q8_0; expertos en Q5_K experimental (esquema selectivo por subcapa) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo único de 8,9 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura de mezcla de expertos: 12.150 millones de parámetros totales de los que se activan aproximadamente 2.500 millones por token, lo que sitúa la inferencia en un coste computacional cercano al de un modelo denso de 2,5B pese a la capacidad de representación de un 12B. El sufijo "Thinking" del nombre indica que el modelo incorpora un modo de razonamiento explícito antes de la respuesta final. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

La innovación técnica de esta publicación es el esquema de cuantización selectiva: en lugar de aplicar un único tipo a todos los tensores, se asignan precisiones distintas por subcapa (Q8_0 para atención, Q5_K para expertos), generado con las herramientas de reescritura de Xyntetik Runner (`--rewrite --type-plan`, commit `51c766d`). El autor reporta mediciones de fidelidad sobre 300 posiciones con teacher forcing, comparando contra el modelo padre en float32 mediante conversión BF16 a GGUF. No hay información disponible sobre detalles del preentrenamiento, datos multilingües o técnicas de alineación del modelo original.

## Capacidades

- Generación de texto conversacional con plantilla de chat (etiqueta `conversational`).
- Modo de razonamiento (thinking) previo a la respuesta, heredado del modelo base.
- Razonamiento multi-paso y cadenas de pensamiento extensas.
- Tool calling / function calling a través del servidor compatible con OpenAI de Xyntetik Runner, con recuperación de truncamiento forzado: si el presupuesto de tokens se agota a mitad de una llamada, el motor cierra el JSON a la forma mínima legal para que los argumentos sigan siendo parseables.
- Decodificación restringida por esquema (constrained decoding) que mantiene la forma de la llamada de herramienta bajo cuantización; según el autor, la conformidad de esquema y la selección de herramienta se mantienen al 100 % hasta Q4_0, aunque la coincidencia de argumentos decae al 50 %.
- Integración con agentes y bucles de herramienta mediante API compatible con OpenAI (`/v1`).
- Capacidades multilingües: no disponible.

## Casos de uso

- Agentes locales con tool calling en hardware de gama alta de consumo: el modelo activa solo ~2,5B parámetros por token y el runtime cierra llamadas truncadas de forma legal, lo que permite bucles de agente que terminan en lugar de reintentar desde cero cuando el presupuesto de contexto es ajustado.
- Asistente de razonamiento en estación de trabajo: el modo thinking permite resolver problemas de varios pasos (planificación, análisis de código, depuración) en local sin depender de API externa, con licencia Apache 2.0 para uso comercial.
- Servicio de chat interno con API compatible con OpenAI: al exponer `/v1`, se puede conectar cualquier cliente OpenAI existente (SDKs, LangChain, frameworks de agentes) apuntando a `http://localhost:8080/v1` sin cambios de código.
- Evaluación de cuantizaciones en pipelines de investigación: el archivo sirve como referencia para comparar fidelidad de esquemas selectivos frente a cuantizaciones uniformes (Q4_K_M, Q5_K_M) usando las tablas de fidelidad y el dataset de evidencia publicados por el autor.
- Generación de código asistida en entornos con requisitos de privacidad: al ejecutarse en local con un binario único sin dependencias, el modelo puede integrarse en flujos de autocompletado o revisión de código donde los datos no pueden salir de la máquina.
- Prototipado de recuperación aumentada (RAG) con razonamiento: el modo thinking permite sintetizar respuestas a partir de contexto recuperado, y el soporte de decodificación restringida facilita forzar salidas estructuradas (JSON) en la capa de postprocesado.
- Despliegue en CPU: el motor Xyntetik Runner soporta CPU además de CUDA y Metal, lo que permite servir el GGUF de 8,9 GB en servidores sin GPU para cargas de baja concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí reporta métricas de fidelidad de cuantización frente al modelo padre en float32, medidas sobre 300 posiciones con teacher forcing:

| Métrica | Umbral adoptado | Resultado reportado |
|---|---|---|
| Top-1 con margen | ≥ 97 % | supera el umbral (sin cifra exacta en la información) |
| KLD medio | ≤ 0,05 | supera el umbral (sin cifra exacta en la información) |

El autor afirma que la cuantización Q4_K_M publicada por JetBrains no alcanza este umbral, mientras que este archivo sí. No se proporcionan cifras exactas de top-1 ni de KLD en el texto disponible, ni latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF ocupa 8,9 GB; se necesita al menos esa cantidad de memoria más overhead de contexto KV. Con contexto corto, cabe en GPUs de 12 GB; con contextos largos, se recomienda 16-24 GB.
- GPUs recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB) o H100 para despliegues con concurrencia. En GPUs de 12 GB (RTX 3060 12 GB, RTX 4070) cabe con contexto reducido.
- Cabe en GPU de consumo: sí, en tarjetas de 12 GB o más con contexto moderado; en 8 GB no cabe el archivo completo en VRAM.
- Opciones de despliegue: Xyntetik Runner (CPU, CUDA, Metal; servidor compatible con OpenAI) es el runtime para el que está construido el archivo. La compatibilidad con llama.cpp, Ollama, vLLM o TGI no está confirmada en la información disponible; el autor solo valida el comportamiento con su propio motor.
- Latencia y throughput: no disponibles. Como referencia estructural, al activar ~2,5B parámetros por token el coste por token es sustancialmente menor que el de un denso de 12B, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Mellum2.1-12B-A2.5B-Thinking-selective-Q8_0-expQ5_K (este) | 12,15B | ~2,5B | no disponible | Apache 2.0 | GGUF 8,9 GB, optimizado para Xyntetik Runner |
| JetBrains/Mellum2.1-12B-A2.5B-Thinking (padre) | 12,15B | ~2,5B | no disponible | Apache 2.0 | Pesos originales (safetensors/BF16); cuantización Q4_K_M publicada por el autor, que según el publicador de este archivo no supera el umbral de fidelidad |
| Otras cuantizaciones GGUF del mismo padre (Q4_K_M, Q5_K_M) | 12,15B | ~2,5B | no disponible | Apache 2.0 | GGUF uniforme; sin datos de fidelidad comparables en la información disponible |

No se dispone de datos de benchmarks que permitan comparar rendimiento con modelos de la misma categoría (por ejemplo, otros MoE de ~12B con ~2-3B activos). La comparación se limita a parámetros, licencia y esquema de cuantización.

## Limitaciones y advertencias

- El archivo está construido y validado para Xyntetik Runner 1.13.0 o posterior; el propio autor indica que la validación formal (tokenizador, conformidad de plantilla, respuestas fijadas en CPU y CUDA) está "en progreso", por lo que la única garantía publicada es la medición de fidelidad.
- La compatibilidad con llama.cpp, Ollama, vLLM u otros runtimes GGUF no está confirmada; el esquema de tipos mixto (Q8_0 en atención, Q5_K en expertos) puede no ser interpretado correctamente por motores que esperan una escalera de cuantización uniforme.
- La decodificación restringida garantiza la forma de la llamada de herramienta, no su contenido: la coincidencia de argumentos decae al 50 % en Q4_0 según las mediciones del autor, por lo que en producción conviene validar los argumentos antes de ejecutar acciones.
- Riesgo de alucinación: inherente a los modelos generativos; no se aportan evaluaciones de veracidad ni de tasas de alucinación.
- Sesgos conocidos: no disponibles; no se documenta la composición del dataset ni evaluaciones de sesgo del modelo base.
- Idiomas soportados: no disponibles; no se puede confirmar el rendimiento en castellano ni en otros idiomas distintos del inglés.
- Longitud de contexto: no disponible; condiciona directamente los requisitos de VRAM y los casos de uso con documentos largos.
- Licencia Apache 2.0: permite uso comercial y modificación, pero al ser una cuantización de un modelo de terceros conviene conservar los avisos de atribución del modelo base.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el autor solicita donaciones para financiar el hardware; se trata de una publicación de investigación de un solo autor, sin validación independiente de las métricas de fidelidad.

## Enlaces

- Repositorio Hugging Face del modelo: https://huggingface.co/Joakimpalm-Zen/Mellum2.1-12B-A2.5B-Thinking-selective-Q8_0-expQ5_K-GGUF
- Modelo base: https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking
- Motor Xyntetik Runner: https://github.com/Joakimpalm-Zen/xyntetik-runner
- Informe de compatibilidad y evidencia de fidelidad: https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/compat-reports/mellum2.1-rewrite-q5-2026-11-05/README.md
- Benchmark de truncamiento de tool calls: https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/truncation-benchmark.md
- Resultados de la comunidad: https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/community-results.md
- Colección Runner Releases: https://huggingface.co/collections/Joakimpalm-Zen/runner-releases-6aa98baaed03bba0e8a561ae
- Colección Pruning and Quantization Frontiers: https://huggingface.co/collections/Joakimpalm-Zen/xyntetik-research-pruning-and-quantization-frontiers-6aa98badc3307048c060ebe2
