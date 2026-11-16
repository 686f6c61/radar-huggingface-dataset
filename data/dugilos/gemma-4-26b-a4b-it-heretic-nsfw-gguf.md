# Dugilos/gemma-4-26B-A4B-it-heretic-NSFW-GGUF

## Resumen

`Dugilos/gemma-4-26B-A4B-it-heretic-NSFW-GGUF` es una cuantización en formato GGUF del modelo `yukiworks/gemma-4-26B-A4B-it-heretic-NSFW`, una variante "abliterated" o "decensored" de la familia Gemma 4 de Google, derivada del checkpoint instructivo original. El modelo base conserva la arquitectura multimodal (entrada imagen-texto, salida texto) y ha sido modificado para eliminar las capas de rechazo y moderación típicas de los modelos alineados, lo que da lugar a un modelo sin censura orientado a la generación de contenido NSFW y a usos creativos sin restricciones de seguridad.

El repositorio publica cuatro cuantizaciones del modelo de texto (Q8_0, Q4_K_M, Q3_K_M y Q2_K) más un proyector multimodal (mmproj) en BF16 que debe cargarse junto a cualquiera de las cuantizaciones para habilitar la entrada de imágenes. El modelo cuenta con aproximadamente 25.233 millones de parámetros totales según los safetensors del checkpoint original, y el sufijo "A4B" del nombre apunta a una arquitectura de mezcla de expertos (MoE) con unos 4.000 millones de parámetros activos por token, aunque este dato no se detalla en la información disponible.

Su relevancia es doble: por un lado, permite ejecutar un modelo multimodal de ~25B en hardware de consumo gracias a las cuantizaciones GGUF y a la activación dispersa de tipo MoE; por otro, al ser una variante heretic/abliterated, está dirigido a un nicho específico de usuarios que necesitan un modelo sin capas de rechazo, con las implicaciones éticas y legales que ello conlleva. El modelo se distribuye bajo licencia Apache 2.0, con un enlace adicional a la licencia específica de Gemma 4 de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (entrada imagen-texto) con mezcla de expertos (MoE), según el sufijo "A4B" del nombre; detalles no disponibles |
| Parametros totales | 25.233.142.046 (~25,2B) |
| Parametros activos | ~4B (inferido del sufijo "A4B"; no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q4_K_M, Q3_K_M, Q2_K (texto); mmproj en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a la licencia Gemma 4 de Google) |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 119,2 GB |
| Entrada multimodal | Si (image-text-to-text) mediante mmproj BF16 de 1,19 GB |
| Libreria | llama.cpp |

## Arquitectura y entrenamiento

El modelo base es una variante de la familia Gemma 4 con arquitectura transformer y mezcla de expertos (el sufijo "A4B" indica ~4B de parámetros activos sobre un total de ~25B). La variante "heretic-NSFW" se ha obtenido mediante técnicas de abliteration o decensored, que modifican los pesos para eliminar direcciones de activación asociadas al rechazo de contenido, dando lugar a un modelo que responde sin las salvaguardas habituales del checkpoint instructivo original. El proceso concreto de abliteration, el número de tokens de entrenamiento y la composición del dataset no están disponibles en la información proporcionada.

El repositorio de `Dugilos` no entrena el modelo, sino que lo cuantiza: cada uno de los cuatro archivos GGUF de texto se genera de forma independiente a partir de un GGUF intermedio en BF16 usando llama.cpp, con el tokenizador y la plantilla de chat embebidos en cada archivo. El proyector multimodal se mantiene en BF16 (con tensores F32 donde el conversor lo requiere) y es compartido por las cuatro cuantizaciones, de modo que el usuario carga el mmproj junto a la cuantización de texto que elija.

## Capacidades

- Generación de texto conversacional multi-turno en formato chat (plantilla embebida en el GGUF).
- Entrada de imágenes (image-text-to-text): descripción, análisis y razonamiento sobre imágenes cargando el mmproj BF16 junto al modelo de texto.
- Generación de contenido sin censura: al ser una variante abliterated/decensored, no aplica las capas de rechazo del modelo alineado original.
- Razonamiento y respuesta a instrucciones heredados del checkpoint instructivo Gemma 4.
- Capacidades multilingües: presumiblemente heredadas de Gemma 4, aunque los idiomas concretos no están disponibles.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la información disponible.
- Modo "thinking" u otras capacidades especiales: no disponibles.

## Casos de uso

- Generación creativa de ficción para adultos: el modelo, al carecer de capas de rechazo, puede redactar narrativa NSFW sin bloqueos, lo que lo hace adecuado para escritura creativa sin restricciones en entornos controlados y con audiencias adultas.
- Análisis de imágenes con descripción libre: cargando el mmproj BF16 junto a una cuantización Q4_K_M, se puede usar para tareas de visión por computador en local (captioning, extracción de información de capturas o documentos) sin depender de APIs externas.
- Asistentes conversacionales autoalojados: al ejecutarse con llama.cpp en hardware de consumo, permite desplegar un chatbot multimodal privado sin enviar datos a terceros.
- Prototipado e investigación sobre alineación y abliteration: sirve como caso de estudio para comparar el comportamiento de un modelo alineado frente a su variante decensored en tareas de evaluación de seguridad.
- Procesamiento de documentos con imágenes en local: la combinación texto+visión permite extraer y resumir información de PDFs escaneados o capturas en flujos offline.
- Experimentación con cuantizaciones: las cuatro variantes (Q2_K a Q8_0) permiten estudiar el compromiso entre tamaño, calidad y velocidad en un modelo MoE multimodal de ~25B.
- Generación de contenido para juegos de rol o narrativa interactiva: la ventana de contexto (no disponible) y la ausencia de rechazos facilitan sesiones de rol sin interrupciones por moderación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache): Q2_K ~10,6 GB; Q3_K_M ~13,3 GB; Q4_K_M ~16,8 GB; Q8_0 ~26,9 GB; añadir ~1,2 GB del mmproj BF16 si se usa entrada de imágenes.
- GPU recomendadas: para Q4_K_M es necesario al menos 20-24 GB de VRAM (RTX 3090, RTX 4090, A5000); para Q8_0 se recomienda A100 40 GB, H100 o RTX 4090 con offloading parcial.
- ¿Cabe en GPU de consumo? Sí: Q2_K y Q3_K_M caben en GPUs de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti); Q4_K_M requiere 24 GB (RTX 3090/4090).
- Opciones de despliegue: llama.cpp (nativo), Ollama, LM Studio y cualquier frontend compatible con GGUF; para servidores, llama.cpp server o bindings compatibles. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponibles. Al ser MoE con ~4B activos, se espera un throughput superior al de un denso de 25B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Dugilos/gemma-4-26B-A4B-it-heretic-NSFW-GGUF | ~25,2B (MoE, ~4B activos) | no disponible | Imagen-texto | Apache 2.0 | GGUF |
| Gemma 4 26B-A4B-it (original, Google) | ~25B (MoE) | no disponible | Imagen-texto | Licencia Gemma 4 | Safetensors/GGUF |
| Variantes heretic/abliterated de Llama 3.x | 8B-70B | 8K-128K | Texto | Llama license | GGUF |
| Modelos densos de ~24B en GGUF (p. ej. Mistral Small) | ~24B | 32K-128K | Texto | Apache 2.0 | GGUF |

La comparativa directa con el checkpoint original de Gemma 4 es la más relevante: comparten arquitectura y tamaño, pero difieren en el alineamiento de seguridad. Frente a variantes abliterated de Llama, este modelo añade capacidad multimodal. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo sin capas de rechazo: puede generar contenido NSFW, violento u ofensivo sin filtros; no apto para menores ni para despliegues públicos sin moderación externa.
- Riesgo elevado de alucinación y de respuestas dañinas al haberse eliminado el alineamiento de seguridad; requiere supervisión humana en producción.
- La abliteration puede degradar capacidades generales (razonamiento, instrucciones, coherencia) respecto al checkpoint original; no hay benchmarks que lo cuantifiquen.
- Idiomas soportados y longitud de contexto no documentados; no se debe asumir el contexto de Gemma 4 sin verificación.
- Licencia Apache 2.0 declarada, pero con enlace a la licencia Gemma 4 de Google: conviene revisar los términos de uso de Gemma 4 antes de un uso comercial, ya que pueden imponer restricciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación comunitaria.
- El tamaño del repo (119,2 GB) incluye todas las cuantizaciones; descargar solo el archivo necesario.
- Etiquetado como `not-for-all-audiences`: no debe exponerse en interfaces accesibles al público general.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Dugilos/gemma-4-26B-A4B-it-heretic-NSFW-GGUF
- Modelo base: https://huggingface.co/yukiworks/gemma-4-26B-A4B-it-heretic-NSFW
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- llama.cpp: https://github.com/ggml-org/llama.cpp
