# Mungert/Spark-X2.6-4B-GGUF

## Resumen

Spark-X2.6-4B es un modelo de lenguaje compacto de propósito general desarrollado por XHToken (equipo detrás de la familia Spark LLM) y orientado explícitamente al despliegue en dispositivo (*on-device*). Esta ficha cubre la versión cuantizada en GGUF publicada por el usuario Mungert, generada con llama.cpp a partir del checkpoint post-entrenado `XHToken/Spark-X2.6-4B`, que a su vez deriva del modelo base `XHToken/Spark-X2.6-4B-Base`. Cuenta con 4.112.079.360 parámetros reales según los safetensors del modelo original, licencia Apache 2.0 y soporte declarado de inglés y chino.

La propuesta del modelo es ocupar el hueco de agentes ligeros que quepan en hardware de consumo: la model card lo presenta como la generación que sucede a Spark-X2.5-4B, manteniendo exactamente la misma arquitectura y obteniendo las mejoras mediante un post-entrenamiento más refinado. Los avances declarados se concentran en código, flujos agénticos con uso de herramientas, contexto largo, multilingüismo y razonamiento. Además, incorpora un presupuesto de pensamiento configurable en tres niveles (ninguno, bajo, alto) que permite ajustar latencia, calidad de razonamiento y coste de inferencia por petición.

El interés práctico para desarrolladores es doble: por un lado, un modelo denso de ~4B parámetros con licencia permisiva y capacidades agénticas declaradas; por otro, la existencia de cuantizaciones GGUF listas para llama.cpp y Ollama, más soporte de servidor compatible con OpenAI en SGLang. La model card afirma que iguala o supera a modelos de ~9B parámetros en varias pruebas, aunque las cifras concretas solo aparecen como gráficos y no como tablas numéricas en el texto disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (misma arquitectura que Spark-X2.5-4B; el detalle de capas y atención no se especifica en la información disponible) |
| Parametros totales | 4.112.079.360 (~4,1B) |
| Parametros activos | No disponible (no se declara como MoE) |
| Longitud de contexto | Hasta 1.048.576 tokens en la configuración de servidor SGLang incluida en la model card (contexto de entrenamiento no especificado) |
| Tipos de cuantizacion | GGUF en varios niveles; el repositorio pesa 104,5 GB, pero el listado exacto de ficheros y bits por peso no se detalla en la información disponible |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors en el repositorio original del modelo base/post-entrenado |

## Arquitectura y entrenamiento

Spark-X2.6-4B es un transformer decoder-only denso de 4,1B parámetros que reutiliza sin cambios la arquitectura de Spark-X2.5-4B. La model card es explícita en este punto: las ganancias de capacidad provienen exclusivamente del post-entrenamiento, no de un rediseño estructural. No se detallan en la información disponible el número de capas, la dimensión oculta, el tipo de atención (completa, lineal o híbrida), ni el tamaño del vocabulario. El modelo expone una plantilla de chat mediante `apply_chat_template` con el parámetro `enable_thinking`, y los ejemplos de generación recomiendan `temperature=1.0`, `top_p=0.95` y `top_k=0`.

El entrenamiento se describe de forma cualitativa: mejoras en codificación, comportamiento agéntico, contexto largo, multilingüismo y razonamiento respecto a la generación anterior. El elemento técnico más destacable es el presupuesto de pensamiento controlable en tres niveles (ninguno, bajo, alto), que permite desactivar la fase de razonamiento para tareas simples o activarla para problemas multi-paso. No se especifican el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF, DPO u otras técnicas de alineamiento. El ejemplo de generación admite hasta 131.072 tokens nuevos, y la configuración de SGLang se documenta para un máximo de 1.048.576 tokens de contexto.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento con modo de pensamiento configurable: `none`, `low` y `high`, ajustable por petición.
- Generación y comprensión de código, con mejoras declaradas en ingeniería de software respecto a Spark-X2.5-4B.
- Flujos agénticos: uso complejo de herramientas, planificación multi-paso y ejecución de tareas encadenadas.
- Razonamiento matemático, evaluado en la batería de benchmarks del autor junto a código, agente, conocimiento general y contexto largo.
- Manejo de contexto largo, con despliegue documentado hasta 1.048.576 tokens en SGLang.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse mediante una API compatible con OpenAI a través de SGLang.
- No se declaran capacidades de visión, audio ni multimodalidad en la información disponible.

## Casos de uso

- Agentes locales en escritorio o portátil: con 4,1B parámetros y cuantización de 4 bits, el modelo cabe en GPUs de consumo y puede ejecutar bucles de tool calling con planificación multi-paso sin depender de la nube, algo crítico cuando los datos no pueden salir del dispositivo.
- Asistente de código embebido en el IDE: el modelo declara mejoras específicas en código y un modo de pensamiento `low` que reduce latencia en autocompletado y refactorizaciones pequeñas, reservando el modo `high` para depuración de lógica compleja.
- Automatización de atención al cliente en inglés y chino: la ventana de contexto larga permite arrastrar historial de conversación y documentación de producto en la misma petición, evitando resúmenes intermedios que pierden matices.
- Procesamiento de documentos extensos en local: con contexto de hasta 1M tokens en la configuración SGLang, se pueden ingerir contratos, informes o expedientes completos y hacer preguntas sobre ellos sin trocear el texto en fragmentos.
- Enrutamiento y orquestación de agentes: el modelo puede actuar como planificador que descompone una tarea en subtareas, decide qué herramienta invocar y valida el resultado, delegando la ejecución pesada en modelos mayores.
- Despliegue en hardware con recursos limitados o aceleradores no NVIDIA: la model card incluye instrucciones para SGLang sobre NPUs Ascend (A2 y A3), lo que habilita inferencia en infraestructura asiática sin GPUs NVIDIA.
- Prototipado rápido y evaluación de pipelines: al estar disponible en GGUF y con licencia Apache 2.0, se puede integrar en pruebas de CI/CD y en entornos de investigación sin negociar licencias.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card incluye únicamente gráficos (`images/benchmark.svg`, `images/all_benchmark.svg`, `images/inference.svg`) sin tablas de cifras. Las afirmaciones textuales del autor son:

| Afirmación | Detalle |
|---|---|
| Rendimiento entre modelos del mismo tamaño | "Mejor de su clase" entre modelos open source de tamaño comparable, según el autor |
| Comparación con modelos mayores | Iguala o supera a modelos de ~9B parámetros en varios benchmarks |
| Categorías evaluadas | Agente, código, matemáticas, conocimiento general y contexto largo |
| Eficiencia de inferencia | Comparable o mejor que Qwen3.5-4B y Gemma-E4B, según el autor |

Estos datos proceden del propio autor y no se han podido verificar de forma independiente con la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de 4,1B parámetros, sin overhead de caché KV): ~2,5 GB en Q4, ~4,5 GB en Q8 y ~8,2 GB en FP16.
- La caché KV para contextos muy largos domina el consumo: con 1M tokens de contexto, los requisitos de memoria superan ampliamente el peso de los parámetros y exigen GPUs de datacenter.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 con cuantizaciones Q4 a Q8; en FP16 es ajustado pero viable en 12 GB o más.
- GPU de datacenter: A100, H100 o NPUs Ascend A2/A3 para servir contexto largo y concurrencia.
- Opciones de despliegue: llama.cpp (el repositorio GGUF se generó con el commit `d327bf1f0`), Ollama u otros runners GGUF, Transformers 4.57.1 con `trust_remote_code=True`, y SGLang con imagen `lmsysorg/sglang:nightly-dev-cu13-20260827-20621aa1` para NVIDIA o `quay.io/ascend/sglang:main-cann9.0.0-a3` / `-910b` para Ascend.
- Latencia y throughput: no disponibles. La model card promete eficiencia "igual o mejor" que Qwen3.5-4B y Gemma-E4B, pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-4B | 4,1B | Hasta 1.048.576 tokens en configuración SGLang | Apache 2.0 | Pesos en HF, GGUF vía Mungert | Referencia de esta ficha; tres niveles de pensamiento |
| Spark-X2.5-4B | ~4B | No disponible | No disponible | No disponible | Generación anterior, misma arquitectura; superada en post-entrenamiento |
| Qwen3.5-4B | ~4B (según nombre) | No disponible | No disponible | No disponible | Citado por el autor como referencia de eficiencia de inferencia |
| Gemma-E4B | No disponible | No disponible | No disponible | No disponible | Citado por el autor como referencia de eficiencia en dispositivo |

Los datos de contexto, licencia y disponibilidad de los modelos comparables no aparecen en la información proporcionada; se indican como no disponibles para no inferir valores.

## Limitaciones y advertencias

- Idiomas: solo se declaran inglés y chino. El rendimiento en castellano no está documentado y previsiblemente será inferior; requiere evaluación propia antes de usarlo en producción.
- Datos de benchmark no verificables: todas las comparaciones proceden del autor y solo se presentan como gráficos sin cifras, por lo que no deben citarse como resultados medidos.
- Riesgo de alucinación: es un modelo de 4B parámetros; en tareas de conocimiento factual y razonamiento profundo la fiabilidad es limitada, especialmente con el modo de pensamiento desactivado.
- Contexto efectivo: aunque la configuración de servidor admite hasta 1.048.576 tokens, el contexto de entrenamiento no se especifica; la calidad más allá de la ventana entrenada puede degradarse y el coste de memoria de la caché KV es elevado.
- Repositorio de terceros: esta ficha describe una cuantización GGUF creada por Mungert, no una publicación oficial de XHToken. Conviene contrastar la fidelidad de la cuantización frente al checkpoint original.
- Dependencia de código remoto: el ejemplo de Transformers requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio del modelo; hay que revisarlo en entornos con requisitos de seguridad.
- Licencia: Apache 2.0 permite uso comercial y modificaciones con atribución, pero no se detalla si existen restricciones adicionales en los datos de entrenamiento ni condiciones de uso aceptable más allá de la licencia.
- Model card truncada: la información disponible corta el apartado de SGLang, por lo que los requisitos exactos de memoria para el contexto máximo no se pueden confirmar.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/Mungert/Spark-X2.6-4B-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B-Base
- Modelo post-entrenado: https://huggingface.co/XHToken/Spark-X2.6-4B
- llama.cpp (commit usado para generar los GGUF): https://github.com/ggerganov/llama.cpp/commit/d327bf1f0780f87b8c01b367b61853b0c291d7c4
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Guía de selección de formato GGUF del cuantizador: https://readyforquantum.com/huggingface_gguf_selection_guide.html
- Slack del proyecto: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord del proyecto: https://discord.gg/kTDE2Hg8aw
- YouTube: https://www.youtube.com/@SparkLLM
- dev.to: https://dev.to/sparkllm
- Bluesky: https://bsky.app/profile/sparkllm.bsky.social
- X: https://x.com/sparkllm
