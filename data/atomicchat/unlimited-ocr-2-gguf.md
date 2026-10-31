# AtomicChat/Unlimited-OCR-2-GGUF

## Resumen

Unlimited-OCR-2 GGUF es una versión cuantizada en formato GGUF del modelo Unlimited-OCR-2 de Baidu, publicada por AtomicChat. Se trata de un modelo de aproximadamente 3.300 millones de parámetros (2.938.670.848 en pesos safetensors según el repositorio base) de tipo mixture-of-experts (MoE) y con capacidades de visión-lenguaje, diseñado específicamente para reconocimiento óptico de caracteres (OCR) y análisis de documentos: convierte imágenes de páginas (escaneos, fotografías, páginas PDF) en texto con información de layout, incluyendo bloques tipificados y sus cajas delimitadoras.

La relevancia de esta publicación radica en que permite ejecutar un modelo OCR especializado de forma local y offline, sin depender de APIs de nube, algo especialmente valioso para documentos sensibles (despachos, hospitales, administraciones públicas). AtomicChat incluye variantes cuantizadas desde BF16 hasta Q4_K con mediciones de degradación frente al modelo original, lo que aporta transparencia poco habitual en repos de cuantización.

Un punto crítico para quien quiera desplegarlo: estos ficheros GGUF requieren una versión parcheada de llama.cpp (commit `7aca0d2ea8` con el parche comunitario `unlimited-ocr2.patch`), ya que la rama principal de llama.cpp todavía no soporta la arquitectura v2 del modelo, que emplea un RoPE 2D consciente de páginas y una atención enrutada tipo SR-SWA (DASH).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE imagen-texto-a-texto (vision encoder SAM + CLIP, router DASH, atención SR-SWA con RoPE 2D por página) |
| Parametros totales | 2.938.670.848 (según safetensors del repo base; el README de AtomicChat lo describe como 3.3B) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (valor usado en los ejemplos de ejecución; máximo oficial no disponible) |
| Tipos de cuantizacion | BF16, Q8_0, AD-Q6_K, AD-Q5_K, AD-Q4_K (más mmproj F16 para el vision encoder) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo base, baidu/Unlimited-OCR-2, es un MoE de unos 3.300 millones de parámetros orientado a análisis de documentos. Combina un vision encoder basado en SAM y CLIP (distribuido como fichero `mmproj` separado en GGUF) con un decodificador de texto MoE. La versión 2 de la arquitectura introduce dos innovaciones destacables: un RoPE 2D consciente de páginas (page-aware), que codifica la posición de los tokens dentro de la página, y una atención enrutada SR-SWA denominada DASH, cuyo router se mantiene en BF16 en todas las cuantizaciones para preservar fielmente el enrutamiento del modelo original.

En cuanto al entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO), no hay datos disponibles en la información proporcionada. Sí se detalla cómo se construyen las cuantizaciones AD (attention-dense): atención, expertos compartidos, la FFN densa de la capa 0, embeddings de tokens y la cabeza de salida van en Q8_0; los expertos enrutados (aproximadamente nueve décimas partes de los pesos) van al tipo del fichero (Q6_K, Q5_K o Q4_K); y las filas `ffn_down_exps` (896 de ancho, no múltiplo de 256) se fijan explícitamente en Q8_0, Q5_1 y Q5_0 porque los K-quants no son aplicables ahí. No se ha usado matriz de importancia.

## Capacidades

- OCR de páginas de documentos: escaneos, fotografías y páginas PDF convertidas a texto.
- Extracción de layout estructurado: el modelo etiqueta bloques (texto, imagen, tabla, etc.) con cajas delimitadoras, no solo emite texto plano.
- Procesamiento multi-página: la plantilla de chat incrustada inserta `<PAGE>` antes de cada imagen y añade la instrucción entrenada `Multi page parsing.` cuando el mensaje no lleva texto.
- Funcionamiento sin prompt especial: chat clients y `llama-server` funcionan con la plantilla incrustada, sin configuración adicional.
- Servidor compatible con la API de OpenAI vía `llama-server`.
- No hay información disponible sobre tool calling, agentes, razonamiento multi-paso ni generación de código; el modelo está especializado en parsing de documentos.

## Casos de uso

- Digitalización de archivos documentales: convertir lotes de documentos escaneados (informes, revistas, libros) en texto estructurado con layout, aprovechando que el modelo etiqueta cada bloque con su tipo y posición.
- Procesamiento local de documentos sensibles: despachos de abogados, clínicas o administraciones pueden extraer texto de documentos sin enviar datos a servicios en la nube, gracias a la ejecución offline con llama.cpp.
- Transcripción de apuntes y exámenes manuscritos o mixtos: OmniDocBench incluye categorías de notas y exámenes entre las páginas de prueba, lo que indica cobertura de este tipo de contenido.
- Pipeline de RAG sobre documentos: el texto con layout estructurado (bloques y cajas) permite segmentar mejor los chunks para indexación en sistemas de búsqueda semántica.
- Servicio OCR autoalojado vía API: con `llama-server` se expone un endpoint compatible con OpenAI al que enviar imágenes de páginas, integrable en flujos de automatización existentes.
- Preprocesamiento en flujos de ingesta de PDFs: convertir páginas PDF a texto como primer paso de pipelines ETL de datos documentales, con temperatura 0 para resultados reproducibles.
- Apps locales y offline: integración en aplicaciones de escritorio (como Atomic Chat, cuyo soporte está en progreso) para OCR sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible. AtomicChat sí publica una evaluación propia de fidelidad de las cuantizaciones sobre 30 páginas reales de OmniDocBench (2 por categoría: libros de texto, periódicos, diapositivas, informes, notas, exámenes, libros, revistas, papers, etc.; una página por petición). La referencia es el modelo original en BF16 con el código del proveedor (transformers). La diferencia de caracteres es la distancia de edición del texto reconocido (tras eliminar cabeceras de layout) dividida por la longitud original; menor es mejor.

| Fichero | Tamaño en disco | Páginas dentro del 1% del texto original | Diferencia de caracteres: mediana / media | Diferencia vs GGUF BF16 |
|---|---|---|---|---|
| Unlimited-OCR-2-BF16.gguf | 5,88 GB | 24/30 | 0,05% / 2,94% | 0,00% |
| Unlimited-OCR-2-Q8_0.gguf | 3,13 GB | 23/30 | 0,12% / 2,57% | 1,11% |
| Unlimited-OCR-2-AD-Q6_K.gguf | 2,74 GB | 24/30 | 0,08% / 2,27% | 0,72% |
| Unlimited-OCR-2-AD-Q5_K.gguf | 2,28 GB | 23/30 | 0,08% / 3,36% | 0,52% |
| Unlimited-OCR-2-AD-Q4_K.gguf | 2,02 GB | 24/30 | 0,08% / 2,94% | 0,07% |

La brecha del fichero BF16 frente al código del proveedor se debe a empates casi iguales en logits (near-ties), no a un portado incorrecto: al forzar la salida del GGUF BF16 a través del modelo original, la elección top del original coincide con el token de llama.cpp en el 98,8% de 34.926 pasos, y casi todas las diferencias son near-ties de bfloat16 (hueco de logits superior a 1 solo en 33 pasos).

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q8_0 ocupa 3,13 GB en disco más el mmproj F16, más KV cache; con contexto de 32K, una GPU con 8 GB de VRAM debería ser suficiente para las variantes cuantizadas. El BF16 (5,88 GB) conviene en GPUs de 12 GB o más. No hay cifras oficiales de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA moderna con soporte CUDA (compilando con `-DGGML_CUDA=ON`); en Mac se usa Metal automáticamente sin configuración. No hay recomendaciones específicas de modelo de GPU.
- Cabe en GPUs de consumo: sí, las variantes Q4_K (2,02 GB) y Q5_K (2,28 GB) son accesibles incluso para GPUs de gama media y podrían funcionar parcialmente en CPU dada su reducida huella.
- Opciones de despliegue: exclusivamente llama.cpp parcheado (commit `7aca0d2ea8` con `unlimited-ocr2.patch` del repo RX5950XT/Unlimited-OCR-2-GGUF), mediante `llama-mtmd-cli` o `llama-server`. vLLM, TGI, Ollama y llama.cpp mainline no pueden cargar estos ficheros. El soporte en Atomic Chat está en progreso (PR 96 de atomic-llama-cpp-turboquant).
- Latencia y throughput: no disponible. Se recomienda temperatura 0 y una petición a la vez: el parche deriva las posiciones de página del historial de tokens de una secuencia, por lo que no se admiten slots paralelos en el servidor.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Unlimited-OCR-2 (baidu) | 2,94B (descrito como 3,3B MoE) | MoE imagen-texto-a-texto, RoPE 2D + SR-SWA (DASH) | no disponible | MIT | GGUF (parche comunitario) y safetensors |
| Qwen2.5-VL-3B | 3B | Transformer denso visión-lenguaje | no disponible en esta ficha | Qwen (restricciones parciales) | GGUF, vLLM, transformers |
| SmolVLM-2.2B (HuggingFace) | 2,2B | Transformer denso visión-lenguaje | no disponible en esta ficha | Apache 2.0 | GGUF, transformers, vLLM |

Unlimited-OCR-2 se diferencia de los alternativas genéricas de visión-lenguaje de tamaño similar en que está especializado en parsing de documentos con layout estructurado, mientras que Qwen2.5-VL o SmolVLM son modelos de propósito general (preguntas sobre imágenes, descripción, OCR básico). A cambio, su soporte en ecosistemas de inferencia es mucho más limitado al requerir un parche de llama.cpp.

## Limitaciones y advertencias

- Compatibilidad: los ficheros no funcionan con llama.cpp mainline ni con aplicaciones construidas sobre él; hay que compilar el commit `b11913` (`7aca0d2ea8`) aplicando el parche comunitario con sha256 `dcdac02ede443987…`.
- Sin paralelismo: el parche deriva las posiciones de página del historial de una única secuencia, por lo que hay que ejecutar una petición cada vez (sin slots paralelos en el servidor).
- Evaluación limitada a páginas individuales: las mediciones de fidelidad se hicieron sobre páginas sueltas; el comportamiento en documentos multi-página aún no ha sido medido.
- Formato sujeto a cambios: si llama.cpp mainline añade soporte de la arquitectura v2 con claves distintas, habrá que reconvertir los ficheros.
- Diferencias frente al modelo original: existen desviaciones por near-ties de bfloat16 (coincidencia del 98,8% de pasos), que en casos con empates tempranos en el layout (bloque etiquetado como `image` o `table`, caja desplazada un píxel) pueden alterar el resto de la página.
- Cuantización sin matriz de importancia: las variantes AD se han construido sin importance matrix, lo que puede afectar a la calidad en contenidos no cubiertos por las 30 páginas de prueba.
- Sesgos, riesgo de alucinación y soporte de idiomas: no disponible en la información proporcionada; al ser un modelo generativo aplicado a OCR, conviene validar la salida en documentos críticos.
- Licencia MIT: sin restricciones relevantes para uso comercial, aunque la licencia heredada del modelo base debe verificarse en el repositorio original (el README queda cortado en "inheri…", presumiblemente "inherited").

## Enlaces

- Ficha del modelo GGUF: https://huggingface.co/AtomicChat/Unlimited-OCR-2-GGUF
- Modelo base: https://huggingface.co/baidu/Unlimited-OCR-2
- Repo con el parche de llama.cpp y GGUF alternativos: https://huggingface.co/RX5950XT/Unlimited-OCR-2-GGUF
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- PR de soporte en Atomic Chat: https://github.com/AtomicBot-ai/atomic-llama-cpp-turboquant/pull/96
- Atomic Chat: https://atomic.chat/
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de AtomicChat: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
