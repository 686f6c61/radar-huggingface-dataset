# moonbox-dev/LFM3-Omni-2B-GGUF

## Resumen

LFM3-Omni 2B es un modelo multimodal "any-to-any" desarrollado por Liquid AI que combina procesamiento de texto, visión y audio en un único modelo de aproximadamente 1.730 millones de parámetros. Forma parte de la familia LFM3 de Liquid AI, caracterizada por una arquitectura híbrida que mezcla convoluciones cortas con atención con compuertas (gated attention), lo que reduce el coste computacional frente a un transformer puro. El modelo acepta entradas de imagen, audio y texto, y puede generar tanto texto como voz, lo que lo sitúa en la categoría de modelos omni de pequeño tamaño pensados para despliegue en dispositivo.

La ficha que nos ocupa corresponde a la versión cuantizada en formato GGUF publicada por el usuario `moonbox-dev`, no al modelo original. Esta build está pensada para su uso con llama.cpp en hardware variado (Metal, CUDA, Vulkan y CPU), e incluye un fichero `mmproj` separado que contiene la torre de visión, el codificador de audio y el decodificador de voz. La relevancia de esta publicación radica en que permite ejecutar un modelo omni de 2B parámetros en equipos de consumo, algo poco habitual en la categoría multimodal.

El modelo base es `LiquidAI/LFM3-Omni-2B`, revisión `c01718a568`, y los ficheros GGUF se generan con llama.cpp `b12621` o superior. La licencia es `lfm1.0`, heredada del modelo original, y conviene revisarla con detalle antes de cualquier uso comercial, ya que no es una licencia permisiva estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida de convoluciones cortas y gated attention (familia LFM3), con torre de visión, codificador de audio y decodificador de voz |
| Parametros totales | 1.728.801.600 (aprox. 1,73 B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (esta última marcada como experimental) |
| Idiomas soportados | no disponible (los prompts de evaluación incluyen inglés y chino) |
| Licencia | lfm1.0 (licencia "other" en Hugging Face) |
| Formato de pesos | GGUF (fichero principal por precisión + `mmproj-lfm3-omni-2b-F16.gguf` compartido) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura híbrida propia de la familia LFM3 de Liquid AI, que combina convoluciones cortas con capas de atención con compuertas. Según la model card de la build GGUF, el fichero principal contiene únicamente el modelo de lenguaje, mientras que el fichero `mmproj-lfm3-omni-2b-F16.gguf` (949,8 MB) aloja la torre de visión, el codificador de audio y el decodificador de voz. Esta separación es la habitual en llama.cpp para modelos multimodales y permite reutilizar el mismo codificador con todas las precisiones.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. Sí se documenta el proceso de cuantización: los ficheros se generaron con `convert_hf_to_gguf.py` y `llama-quantize`, y las precisiones Q6_K, Q5_K_M y Q4_K_M se cuantizaron con importance matrix calculada sobre 200 secuencias de 512 tokens de WikiText-2 train mediante `llama-imatrix`. Antes de la subida se comparó tensor a tensor el checkpoint original con los ficheros GGUF: 652 de 665 tensores coinciden, con diferencias atribuibles al redondeo F16 en el patchifier de visión y a un reempaquetado de las normas del decodificador de voz.

## Capacidades

- Generación de texto conversacional con respuesta directa, sin modo de razonamiento explícito ("the model answers directly, with no thinking").
- Comprensión de imágenes: la torre de visión permite describir fotos y responder preguntas sobre ellas.
- Comprensión de audio: el codificador de audio procesa entradas de voz.
- Generación de voz: el decodificador de voz permite salida hablada, aunque el autor de la build indica que no probó esta ruta y que requiere el camino de generación de audio propio de llama.cpp para LFM3.
- Entrada multimodal combinada (imagen + audio + texto) en una misma conversación, al ser un modelo any-to-any.
- Compatibilidad con la API de chat de llama.cpp (`/v1/chat/completions`) usando las partes `image_url` e `input_audio`.
- Soporte multilingüe: no confirmado; los prompts de evaluación incluyen inglés y chino, pero no hay lista oficial de idiomas.
- Tool calling y razonamiento multi-paso: no documentado en la información disponible.

## Casos de uso

- Asistentes de voz en dispositivo: el modelo acepta audio como entrada y puede generar voz, por lo que encaja en interfaces conversacionales por voz que deben ejecutarse localmente sin enviar datos a la nube, algo crítico en aplicaciones de privacidad.
- Descripción de imágenes en tiempo real: con la torre de visión y un tamaño de 2B parámetros, puede integrarse en aplicaciones móviles o de escritorio que necesiten alt-text automático, moderación visual o asistencia a personas con discapacidad visual.
- Transcripción y resumen de reuniones: combinando el codificador de audio con la generación de texto, puede resumir grabaciones cortas en local, evitando subir audio confidencial a servicios externos.
- Atención al cliente multimodal: un chatbot que reciba capturas de pantalla o notas de voz del usuario y responda en texto o audio, desplegado con llama-server y la API compatible con OpenAI.
- Prototipado rápido de aplicaciones omni: al estar en GGUF y funcionar en CPU, GPU consumer y Metal, sirve para validar ideas de producto multimodal antes de invertir en infraestructura mayor.
- Evaluación de cuantizaciones en pipelines de CI: los ficheros incluyen métricas de divergencia KL y coincidencia de token superior, útiles como referencia para comparar el impacto de la cuantización en tareas multimodales.
- Educación y accesibilidad: lectura de documentos con imágenes y explicación hablada del contenido, ejecutándose en un portátil con GPU de gama media.

## Benchmarks y rendimiento

La model card de la build GGUF no publica resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Lo que sí documenta es una evaluación propia de fidelidad de cuantización:

| Precisión | Tamaño | KL vs BF16 (nats) | Coincidencia token top-1 | Estado |
|---|---|---|---|---|
| BF16 | 3,47 GB | referencia | referencia | referencia |
| Q6_K | no disponible | dentro del umbral | ≥ 90 % | aprobado |
| Q5_K_M | no disponible | dentro del umbral | ≥ 90 % | aprobado (el más pequeño válido) |
| Q4_K_M | no disponible | 0,026 | no disponible | experimental |

El criterio de aprobación del laboratorio es KL ≤ 0,01 nats y coincidencia del token más probable ≥ 90 % sobre 12 prompts cortos (8 en inglés, 4 en chino), con 609 tokens generados en total por el fichero BF16 de referencia. La evaluación se ejecutó con `llama-server` sobre CUDA en una RTX 3080 Laptop. No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el fichero BF16 ocupa 3,47 GB y el `mmproj` 949,8 MB, por lo que se necesita al menos ~4,5 GB para BF16 y algo menos para Q5_K_M o Q4_K_M (tamaños exactos de cada cuantización no disponibles en la información proporcionada).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para BF16; las cuantizaciones Q5_K_M y Q4_K_M deberían caber en GPUs de 4-6 GB.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores; también en Apple Silicon vía Metal y en CPU vía Vulkan/CPU backend de llama.cpp.
- Opciones de despliegue: llama.cpp `b12621` o superior, con `llama-server` para exponer la API compatible con OpenAI. No se documenta soporte para vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles. La evaluación se hizo en una RTX 3080 Laptop con CUDA, pero no se reportan tiempos.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables en la información proporcionada para establecer una comparativa cuantitativa fiable con otros modelos omni de tamaño similar. A continuación se indican alternativas de categoría, sin datos de rendimiento verificados:

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| LFM3-Omni 2B (esta build) | ~1,73 B | no disponible | lfm1.0 | GGUF |
| Modelos omni de 2-3 B de otros laboratorios | no disponible | no disponible | no disponible | no disponible |

No se han publicado comparativas oficiales con otros modelos omni en la información disponible.

## Limitaciones y advertencias

- La licencia `lfm1.0` no es una licencia permisiva estándar; es responsabilidad del usuario revisar el fichero LICENSE del repositorio antes de cualquier uso comercial.
- Esta build es una cuantización no oficial del modelo original; el autor de la build no es Liquid AI y no hay garantía de soporte.
- La cuantización Q4_K_M está marcada como experimental (KL 0,026, por encima del umbral de 0,01 nats); no se recomienda para producción sin validación adicional.
- La ruta de generación de voz no fue probada por el autor de la build y depende del camino de generación de audio propio de llama.cpp para LFM3, lo que añade riesgo de incompatibilidad.
- No hay información sobre sesgos, tasa de alucinación ni comportamiento en idiomas distintos del inglés y el chino.
- La longitud de contexto no está documentada; planificar despliegues con ventanas largas sin confirmar el límite real es arriesgado.
- El modelo responde directamente sin modo de razonamiento, lo que puede limitar tareas que requieran cadenas de pensamiento explícitas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.
- No se documenta soporte de tool calling ni de agentes multi-paso; no asumir estas capacidades sin verificación empírica.

## Enlaces

- Repositorio GGUF: https://huggingface.co/moonbox-dev/LFM3-Omni-2B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola de Liquid AI: https://console.liquid.ai/dashboard
- Playground de Liquid AI: https://playground.liquid.ai/talk
