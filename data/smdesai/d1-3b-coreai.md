# smdesai/d1-3B-CoreAI

## Resumen
d1-3B-CoreAI es una conversión del modelo de decisión LiquidAI/d1-3B al formato Apple Core AI, publicada por el usuario smdesai. El modelo base, desarrollado por Liquid AI, es un modelo multimodal de decisión de 3.1B parámetros construido sobre LFM2.5-VL-3B: recibe un estado (texto, JSON, imágenes o imágenes con texto) junto con preguntas con nombre y devuelve respuestas tipadas (probabilidad sí/no, elección entre opciones nombradas o un nivel) en un único forward pass, sin generar tokens de salida. Frente a los modelos generativos convencionales, que deben decodificar texto para llegar a una respuesta, d1-3B calcula directamente un logit de respuesta, lo que reduce drásticamente la latencia.

Esta variante concreta está pensada para ejecución en dispositivo (on-device) en iPhone y Mac: el decodificador se ha cuantizado con palettización k-means de 8 bits para que quepa en memoria de un teléfono, y los ficheros `.aimodel` son exactamente los que usa la aplicación D1-3B para iPhone, incluida la demo Keep It Clean de System One Arcade, que pixela en tiempo real fotogramas de cámara cuando detecta un dedo corazón levantado. Según la model card, el modelo mantiene 738/740 respuestas idénticas al modelo original en iPhone 17 Pro y 740/742 en Mac M3 Max sobre un conjunto dorado de 742 preguntas.

Su relevancia actual radica en que lleva un modelo de decisión multimodal de 3B a hardware de consumo Apple con una pérdida de fidelidad mínima, con latencias de 0,42 s por fotograma en iPhone 17 Pro y 0,25 s en Mac M3 Max. El repositorio ocupa 3,9 GB y la licencia es LFM Open License v1.0 (etiquetada como `other` en HuggingFace).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 híbrida (30 capas de decodificador: 8 capas de atención y 22 capas convolucionales), torre de visión SigLIP2 so400m, decodificador multimodal image-text-to-text |
| Parametros totales | 3,1B (modelo base d1-3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens en el runtime de iPhone (el modelo base soporta contexto más amplio, no especificado) |
| Tipos de cuantizacion | Palettización k-means de 8 bits en las capas Linear del decodificador; matemáticas en fp16; torre de visión en fp16 |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi (16 idiomas) |
| Licencia | LFM Open License v1.0 (etiquetada como `other` en HuggingFace, `license_name: lfm1.0`) |
| Formato de pesos | `.aimodel` (Core AI de Apple): `decoder.aimodel` (2,3 GB), `vision.aimodel` (815 MB), `embed.f16` (500 MB), `tokenizer.json` (17 MB), `meta.json` |

## Arquitectura y entrenamiento
El decodificador es un modelo híbrido LFM2 de 30 capas que combina 8 capas de atención con 22 capas convolucionales. La representación oculta tiene tamaño 2.048 y la tabla de embeddings (atada al proyector de salida) es de 128.000 × 2.048 en fp16. La atención usa normalización de q/k y RoPE, y las cachés se exponen explícitamente como `k_cache` y `v_cache` con forma (8, 1, 8, P, 64), mientras que las capas convolucionales exponen un `conv_tail` con los dos últimos valores de B·x. La torre de visión es SigLIP2 so400m más un proyector, con parches de 16 px normalizados a [−1, 1] y 64–256 tokens por recorte.

La conversión a Core AI reorganiza el modelo en cuatro grafos con longitudes dinámicas (`answer`, `prefill`, `branch`, `vision`), con padding exacto: la atención causal y la convolución nunca dejan que un token de relleno alcance a uno real, las claves de caché más allá de `prefix_len` se enmascaran y las lecturas son one-hot. La salida se obtiene por producto escalar del estado oculto final con las filas de `embed.f16` correspondientes a las formas de un solo token de cada opción (`yes`/`Yes`/`YES`, dígitos, códigos de opción), seguido de softmax sobre las opciones; solo se necesitan esos pocos logits porque el log-softmax de vocabulario completo se cancela. El tokenizador usa BPE con `ignore_merges`, un detalle que algunas librerías no implementan. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades
- Decisión multimodal en un único forward pass: acepta estado en texto plano, JSON con indentación 2, imágenes o imágenes con texto, y devuelve respuestas tipadas sin generar tokens.
- Tipos de respuesta: probabilidad sí/no calibrada, elección entre opciones nombradas con códigos de un solo token y respuestas de nivel (0…n).
- Clasificación y calibración: pensado explícitamente para producir probabilidades calibradas, no texto libre.
- Comprensión de imágenes: torre SigLIP2 so400m con preprocesado LFM2-VL (2–10 teselas de 512 px más miniatura para imágenes grandes, hasta 1 M de píxeles).
- Múltiples preguntas sobre un mismo estado: `prefill` de la parte compartida (BOS, imágenes, estado) y `branch` por cada sufijo de pregunta.
- Soporte multilingüe en 16 idiomas (árabe, chino, inglés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español, tailandés, vietnamita).
- Procesamiento por lotes con `branch` (batch 1, 4 o 16) y longitudes dinámicas con buckets de potencias de dos (128…8.192 tokens).
- No se menciona soporte de tool calling, function calling ni de agentes multi-paso en la información disponible.

## Casos de uso
- Moderación visual en tiempo real: la demo Keep It Clean pixela fotogramas de cámara en los que se detecta un gesto concreto, con un umbral de 0,35 sobre 860 fotos de HaGRIDv2 y una latencia de 0,42 s por fotograma en iPhone 17 Pro, lo que permite procesar vídeo en directo en el propio dispositivo sin enviar imágenes a la nube.
- Enrutado y clasificación en pipelines de decisión: dado un estado en JSON, el modelo responde a preguntas con nombre y devuelve opciones tipadas, lo que lo hace adecuado como primera capa de un sistema que decide qué herramienta o rama invocar.
- Filtrado de contenido en aplicaciones de mensajería: cada mensaje o imagen se evalúa con una pregunta binaria calibrada ("¿es contenido violento?") y la probabilidad resultante se usa como umbral configurable.
- Control de calidad en líneas de producción: con la variante Mac (0,25 s por fotograma) y la entrada de imagen más texto, se pueden clasificar piezas o productos según criterios definidos en formato JSON, sin conexión a internet.
- Asistentes de accesibilidad en dispositivo: clasificación de escenas o gestos con respuesta inmediata y sin salida de datos del terminal, aprovechando que el modelo no genera texto y por tanto no filtra información por la salida.
- Precribado de imágenes médicas o de campo: con imágenes de hasta 1 M de píxeles y hasta 10 teselas de 512 px, el modelo puede responder a preguntas como "¿hay presencia del elemento X?" con una probabilidad calibrada para priorizar revisión humana.
- Etiquetado automático de datasets: el grafo `branch` con batch 4 o 16 permite lanzar varias preguntas sobre el mismo estado o varios estados compartiendo prefijo, útil para anotar conjuntos de datos a gran escala.
- Decisión de nivel o severidad: las respuestas de tipo nivel (0…n) permiten clasificar gravedad, prioridad o calidad en escalas discretas directamente en el dispositivo.

## Benchmarks y rendimiento
El modelo base d1-3B obtiene 48,57 en el Decision Index v0.2.1 (split público) según el blog de Liquid AI, por delante de todos los modelos por debajo de 10B y a la par de Decider 35B-A3B, un modelo de decisión doce veces mayor. También se reportan 8 ms por pregunta en una NVIDIA GeForce RTX (modelo no especificado en la información disponible).

Para la conversión Core AI, la model card reporta fidelidad frente al modelo original:

| Build | Dispositivo | Misma respuesta principal | Máx. \|Δp\| |
|---|---|---|---|
| Estos ficheros, Swift extremo a extremo | iPhone 17 Pro | 738/740 (las 2 restantes son casi empates) | 0,077 |
| Estos ficheros, Swift extremo a extremo | Mac (M3 Max) | 740/742 | 0,077 |
| Keep It Clean (860 fotos HaGRIDv2, umbral 0,35) | iPhone 17 Pro | 184/200 detectados, 24/660 falsos positivos | igual que el original |
| Fotograma de cámara (una pregunta sobre una foto) | iPhone 17 Pro | 0,42 s | — |
| Fotograma de cámara (una pregunta sobre una foto) | Mac M3 Max | 0,25 s | — |

El conjunto dorado de referencia son las respuestas del modelo original sobre 337 casos (742 preguntas: Fast Decisions de texto, imágenes, contextos largos y estados JSON). No se publican resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware
- Memoria: el repositorio ocupa 3,9 GB; en iPhone la aplicación necesita el entitlement `com.apple.developer.kernel.increased-memory-limit`, con el que quedan unos 6,4 GB disponibles tras la carga.
- Descomposición de pesos: decodificador 2,3 GB (`decoder.aimodel`), torre de visión 815 MB (`vision.aimodel`), embeddings 500 MB (`embed.f16`), tokenizador 17 MB.
- GPU compatibles: iPhone 17 Pro y Mac con M3 Max son los dispositivos validados en la model card; los ficheros `.aimodel` se especializan para la GPU del dispositivo en la primera carga (≈ 15 s) y después se sirven de la caché de Core AI (≈ 3–5 s).
- No cabe razonablemente en GPUs de consumo x86 mediante este formato; la ejecución en NVIDIA se contempla para el modelo base (DGX, Jetson), no para esta conversión.
- Opciones de despliegue: Apple Core AI exclusivamente para los ficheros incluidos; el modelo base LiquidAI/d1-3B se puede desplegar con el stack de NVIDIA y admitiría vLLM, llama.cpp u Ollama en sus propios formatos, pero no se documenta en esta ficha.
- Limitaciones de runtime: tras la cuarta forma distinta de `branch` en un mismo proceso, las llamadas devuelven valores finitos incorrectos y hay que recargar el modelo; las peticiones de más de 8.192 tokens fallan en la GPU del iPhone.
- Latencias medidas: 0,42 s por fotograma en iPhone 17 Pro, 0,25 s en Mac M3 Max, 8 ms por pregunta en una RTX (modelo base).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d1-3B-CoreAI (esta ficha) | 3,1B | 8.192 tokens en runtime iPhone | 738/740 misma respuesta que el original; 0,42 s/fotograma en iPhone 17 Pro | LFM Open License v1.0 | HuggingFace, formato Core AI |
| LiquidAI/d1-3B | 3,1B | no disponible en detalle | 48,57 en Decision Index v0.2.1; 8 ms/pregunta en RTX | LFM Open License v1.0 | HuggingFace, safetensors |
| Decider 35B-A3B | 35B (MoE) | no disponible | Rendimiento a la par de d1-3B en Decision Index v0.2.1 según Liquid AI | no disponible | no disponible |
| LFM2.5-VL-3B | 3B (VL) | no disponible | Modelo base sobre el que se construye d1-3B | no disponible | HuggingFace |

La comparativa se limita a los modelos citados en la información disponible; no se dispone de datos de otros modelos de decisión comparables en tamaño o tarea.

## Limitaciones y advertencias
- El modelo devuelve respuestas tipadas restringidas a las opciones proporcionadas en la pregunta; no genera texto libre ni mantiene conversación abierta.
- El tokenizador usa BPE con `ignore_merges`; si la implementación del host no lo soporta, se rompe la correspondencia exacta de tokens y con ella la precisión reportada.
- Reproducir la precisión de 738/740 exige replicar exactamente el prompt, los ids de token, los valores de píxel y la lectura del modelo original (`prompt.py`, `runner.py` y el procesador LFM2-VL).
- Bug conocido en la GPU del iPhone: a partir de la cuarta forma distinta de `branch` en un proceso, las llamadas devuelven valores finitos incorrectos; es necesario recargar el modelo o mantener reducido el número de formas distintas por modelo cargado.
- Las peticiones de más de 8.192 tokens fallan en la GPU del iPhone.
- La aplicación en iPhone requiere el entitlement de límite de memoria aumentado; sin él, la carga puede no ser viable.
- Los embeddings se consultan en el host (500 MB en fp16), lo que añade presión de memoria fuera de la GPU.
- No se documentan sesgos específicos, tasas de alucinación ni comportamientos anómalos por idioma en la información disponible; al no generar texto, el riesgo de alucinación se traslada a la calibración de las probabilidades, que puede degradarse con entradas fuera de distribución.
- La licencia es LFM Open License v1.0, etiquetada como `other`; conviene revisar sus términos antes de un uso comercial, ya que no se detallan en la información proporcionada.
- El repositorio tiene 0 descargas y 0 likes, y no está respaldado por el autor original del modelo base; es una conversión de terceros, aunque verifique fidelidad frente al original.

## Enlaces
- Repositorio de esta conversión: https://huggingface.co/smdesai/d1-3B-CoreAI
- Modelo base: https://huggingface.co/LiquidAI/d1-3B
- Blog de Liquid AI sobre d1: https://www.liquid.ai/blog/d1-open
- Documentación de d1-3B: https://docs.liquid.ai/lfm/models/d1-3b
- Artículo de AlphaSignal: https://alphasignal.ai/news/liquid-ai-s-d1-3b-makes-structured-ai-decisions-in-8-milliseconds-without
- Calendario de lanzamientos de modelos (referencia): https://www.scriptbyai.com/ai-model-release-calendar/
