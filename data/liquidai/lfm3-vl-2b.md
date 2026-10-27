# LiquidAI/LFM3-VL-2B

## Resumen

LFM3-VL-2B es un modelo de visión-lenguaje (VLM) desarrollado por LiquidAI, diseñado específicamente para comprensión visual en dispositivo (*on-device*). Combina el modelo de lenguaje LFM3 (1,73B parámetros) con un codificador visual propio de 164M parámetros y un proyector de 25M, sumando 1,92B parámetros totales. Acepta texto, imágenes y vídeo como entrada, este último muestreado a 2 fps, y procesa las imágenes a resolución nativa.

La novedad principal respecto a generaciones anteriores de la familia es la incorporación de entrada de vídeo, un modo de razonamiento explícito (*thinking*) que descompone el problema paso a paso antes de responder, y capacidades de razonamiento espacial y encarnado (*embodied*), orientadas a robótica y localización de objetos. El modelo forma parte de la familia LFM3, que incluye variantes base, texto, visión, audio, omni y decision.

Con 128K tokens de contexto (entrada más salida) y soporte de 16 idiomas, incluido el español, se posiciona como una alternativa compacta para tareas visuales en entornos con recursos limitados: lectura de documentos, descripción de vídeo, gráficos y problemas visuales de varios pasos. La licencia es la LFM Open License v1.0, que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: LM LFM3 (13 convoluciones cortas con gating, 5 atenciones de ventana deslizante, 6 atenciones globales) + codificador visual de 14 capas + proyector de 25M |
| Parametros totales | 1.918.181.888 (1,92B): 1,73B de lenguaje, 164M de visión, 25M de proyector |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128K tokens (entrada + salida) |
| Tipos de cuantizacion | No disponible en la información proporcionada |
| Idiomas soportados | Inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso, polaco |
| Licencia | LFM Open License v1.0 (identificador `lfm1.0`, etiquetada como `other` en HuggingFace) |
| Formato de pesos | Safetensors, con código personalizado (`custom_code`, requiere `trust_remote_code`) |

Otros datos técnicos: vocabulario de 128.000 tokens, tamaño del repositorio de 3,9 GB, entrada de imagen a resolución nativa con parches de 16×16 y embeddings rotatorios 2D. Cada bloque de 2×2 parches se convierte en un único token de lenguaje, lo que reduce la longitud efectiva de la secuencia visual.

## Arquitectura y entrenamiento

El modelo sigue un diseño híbrido en lugar de un transformer puro. El componente de lenguaje consta de 24 capas que alternan tres tipos de operación: 13 convoluciones cortas con compuerta (*gated short convolutions*), 5 capas de atención de ventana deslizante y 6 capas de atención global. Esta mezcla busca reducir el coste computacional y de memoria de la atención completa manteniendo el alcance efectivo sobre secuencias largas, algo relevante para el contexto de 128K tokens y para el despliegue en dispositivo.

El codificador visual tiene 14 capas: 8 convoluciones 2D *depthwise* con compuerta y 6 capas de atención bidireccional, con parches de 16×16 y embeddings rotatorios 2D. La conexión con el modelo de lenguaje se realiza mediante un proyector de 25M de parámetros. El resultado se entrega al LM como tokens, con un factor de compresión de 4 parches por token. Para vídeo, el muestreo es de 2 fps.

El checkpoint es un modelo post-entrenado sobre LFM3-1.7B-Base. La model card menciona el modo *thinking* (razonamiento paso a paso antes de responder), lo que implica algún tipo de entrenamiento orientado a razonamiento, pero no se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF, DPO u otras técnicas de alineamiento.

## Capacidades

- Generación de texto conversacional multi-turno con 128K tokens de contexto compartido entre entrada y salida.
- Comprensión de imágenes a resolución nativa, sin reescalado forzado a una resolución fija.
- Comprensión de vídeo a 2 fps: permite hacer preguntas sobre clases grabadas, recorridos filmados con el móvil o fragmentos de cámaras.
- Modo *thinking*: razonamiento explícito paso a paso antes de la respuesta final, útil en problemas visuales complejos como matemáticas, gráficos y tareas de varios pasos.
- Razonamiento espacial y encarnado: localización de objetos y razonamiento sobre sus relaciones posicionales, planteado como base para robótica.
- Multilingüismo en 16 idiomas, con español incluido en la lista oficial.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso autónomo: no disponible en la información proporcionada (el modo *thinking* es razonamiento interno, no necesariamente orquestación de agentes).
- Capacidades de audio: no disponibles en esta variante (la familia LFM3 tiene variantes de audio y omni separadas).

## Casos de uso

- **Lectura de documentos y formularios en el dispositivo**: el modelo procesa la imagen a resolución nativa y responde preguntas sobre el contenido, lo que permite extraer campos de facturas, tickets o informes sin enviar el documento a un servidor externo.
- **Asistencia a personas con discapacidad visual**: descripción de escenas y respuesta a preguntas sobre el entorno en tiempo real, aprovechando el tamaño reducido y la orientación *on-device* para funcionar sin conectividad.
- **Análisis de vídeo de cámara de vigilancia o Industrial**: con muestreo a 2 fps se pueden resumir fragmentos, detectar eventos concretos o responder preguntas sobre lo ocurrido en una grabación sin necesidad de un pipeline de visión separado.
- **Razonamiento sobre gráficos y tablas**: el modo *thinking* está pensado para preguntas de varios pasos sobre gráficos económicos, dashboards o figuras de artículos científicos, donde una respuesta directa suele fallar.
- **Robótica y automatización física**: las capacidades de razonamiento espacial permiten localizar objetos y describir relaciones de posición, útiles como módulo de percepción semántica en brazos robóticos o agentes móviles.
- **Soporte técnico con capturas de pantalla**: el usuario adjunta una captura de un error o de una interfaz y el modelo interpreta la imagen junto con el historial de la conversación, manteniendo el contexto gracias a la ventana de 128K.
- **Accesibilidad y educación**: explicar diagramas, ejercicios de geometría o figuras de un libro de texto paso a paso, con la ventaja de que el modelo cabe en hardware de consumo y puede ejecutarse localmente en un aula o en un portátil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card proporcionada está truncada y no incluye tablas de MMLU, HumanEval, GSM8K ni métricas específicas de visión (MMMU, DocVQA, VideoMME u otras), por lo que no se presentan cifras que no puedan verificarse.

## Requisitos de hardware

- **VRAM estimada en fp16/bf16**: alrededor de 3,8-4 GB solo para pesos, más caché KV y activaciones; el repositorio completo ocupa 3,9 GB.
- **VRAM estimada en int8**: aproximadamente 2 GB para pesos, más overhead de inferencia.
- **VRAM estimada en int4**: alrededor de 1-1,2 GB para pesos, si se dispone de una build cuantizada (no confirmada en la información disponible).
- **GPU de consumo**: por tamaño, cabe con holgura en tarjetas de 8-12 GB (RTX 3060, RTX 4060, RTX 4070) en fp16, y en GPUs integradas o de 4-6 GB con cuantización agresiva. El contexto de 128K incrementa de forma notable el consumo de caché KV, así que conviene limitar la longitud efectiva en entornos con poca memoria.
- **GPU de datacenter**: A100, H100, L40S o similares para despliegues con concurrencia alta o contextos largos; el modelo es lo bastante pequeño como para replicar muchas instancias por GPU.
- **Despliegue**: la librería indicada es `transformers`, y el modelo requiere `trust_remote_code=True` por el código personalizado. No se confirma en la información disponible soporte de vLLM, llama.cpp, Ollama o TGI; al ser una arquitectura híbrida con convoluciones y atención mixta, la compatibilidad con motores de inferencia genéricos no está garantizada.
- **Latencia y throughput**: no disponibles en la información proporcionada.
- **Otras vías**: LiquidAI ofrece API en su consola y playground, además de los pesos abiertos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Vídeo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B | 1,92B | 128K | Sí (2 fps) | LFM Open License v1.0 | Pesos en HuggingFace + API |
| Qwen2.5-VL-3B | ~3,75B | 128K (dato público, no verificado aquí) | Sí | Apache 2.0 (según versión) | Pesos en HuggingFace |
| SmolVLM2-2.2B | ~2,2B | No disponible en esta información | Sí | Apache 2.0 (según variante) | Pesos en HuggingFace |
| Gemma 3 (4B) | ~4B | 128K (dato público, no verificado aquí) | No | Gemma Terms | Pesos en HuggingFace |

Los datos de los modelos competidores no provienen de la información proporcionada en esta búsqueda y deben verificarse en sus respectivas model cards antes de tomar una decisión. No se dispone de comparaciones de rendimiento verificadas entre LFM3-VL-2B y estas alternativas.

## Limitaciones y advertencias

- **Resultados de benchmarks no disponibles**: no se puede evaluar su calidad relativa frente a alternativas sin datos publicados; conviene hacer una evaluación propia sobre el caso de uso concreto.
- **Riesgo de alucinación**: como cualquier VLM de 1,9B, puede describir objetos o texto inexistentes en la imagen, especialmente en documentos densos, gráficos con muchas etiquetas o fotogramas de vídeo de baja calidad.
- **Licencia no estándar**: la LFM Open License v1.0 no es una licencia OSI ni Apache/MIT. Es imprescindible leer el archivo LICENSE del repositorio para conocer las condiciones de uso comercial, los umbrales de facturación o las restricciones de despliegue antes de integrarlo en un producto.
- **Dependencia de código personalizado**: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; en entornos de producción conviene auditar y fijar una revisión concreta del repositorio.
- **Compatibilidad de herramientas limitada**: no se confirma soporte en vLLM, llama.cpp u Ollama, lo que puede complicar el despliegue y el *batching* a gran escala.
- **Tool calling y agentes no confirmados**: no hay información sobre function calling ni sobre orquestación multi-paso con herramientas; no debe asumirse su disponibilidad.
- **Idiomas**: los 16 idiomas están listados por el autor, pero el rendimiento relativo por idioma no está documentado; en español y otras lenguas distintas del inglés el comportamiento puede degradarse, sobre todo en OCR de texto manuscrito o de baja resolución.
- **Contexto visual costoso**: aunque el modelo comprime 4 parches por token, imágenes de alta resolución y vídeos a 2 fps consumen contexto rápidamente; con 128K compartidos entre entrada y salida, un vídeo largo puede agotar la ventana.
- **Resultados de la búsqueda web no relevantes**: las consultas devolvieron páginas de proveedores de proxies residenciales sin relación con el modelo, por lo que no aportan información técnica adicional ni enlaces válidos.

## Enlaces

- [Modelo en HuggingFace: LiquidAI/LFM3-VL-2B](https://huggingface.co/LiquidAI/LFM3-VL-2B)
- [Modelo base: LiquidAI/LFM3-1.7B-Base](https://huggingface.co/LiquidAI/LFM3-1.7B-Base)
- [Blog de lanzamiento de la familia LFM3](https://www.liquid.ai/blog/lfm3)
- [Documentación de LiquidAI](https://docs.liquid.ai/lfm/getting-started/welcome)
- [Playground de LiquidAI](https://playground.liquid.ai/)
- [Consola / API de LiquidAI](https://console.liquid.ai/dashboard)
- [Colección LFM3 en HuggingFace](https://huggingface.co/collections/LiquidAI/lfm3)
- [Licencia LFM Open License v1.0](https://huggingface.co/LiquidAI/LFM3-VL-2B/blob/main/LICENSE)
