# furiosa-ai/Qwen3-VL-32B-Thinking

## Resumen

Qwen3-VL-32B-Thinking es un modelo denso de visión-lenguaje de 32 mil millones de parámetros (33.357.390.064 según los pesos en safetensors) perteneciente a la familia Qwen3-VL y desarrollado originalmente por el equipo Qwen de Alibaba. Combina un codificador visual con un decodificador transformer denso y está diseñado para tareas de comprensión visual que incluyen OCR, análisis de documentos y gráficos, razonamiento espacial y comprensión de vídeo, además de generación de texto y razonamiento. Esta variante "Thinking" emite una cadena de pensamiento explícita antes de la respuesta final, lo que la orienta a tareas que requieren razonamiento multi-paso.

El repositorio analizado, publicado por furiosa-ai, no es un modelo nuevo ni un fine-tune: empaqueta los pesos originales de Qwen/Qwen3-VL-32B-Thinking junto con un Furiosa Executable Bundle (FXB) que permite ejecutarlo sobre aceleradores FuriosaAI RNGD mediante la librería furiosa-llm. No se aplica cuantización: los pesos se mantienen en la misma precisión que los originales. El mismo modelo puede ejecutarse con otros frameworks como vLLM, SGLang o Transformers, remitiendo a la model card original de Qwen.

Su relevancia actual radica en dos factores: por un lado, la disponibilidad de un modelo de razonamiento multimodal de 32B con licencia Apache 2.0, lo que facilita su uso comercial; por otro, la existencia de un bundle específico para hardware alternativo a GPU (RNGD de FuriosaAI), que amplía las opciones de despliegue en entornos con aceleradores NPU propietarios. La arquitectura emplea Interleaved-MRoPE para los embeddings posicionales y DeepStack para la fusión multinivel de características visuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL densa (transformer decoder + vision encoder), con Interleaved-MRoPE y DeepStack |
| Parametros totales | 33.357.390.064 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ninguna (pesos en precisión original); no se documentan variantes GGUF/AWQ/GPTQ en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (más Furiosa Executable Bundle, FXB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3-VL en su variante densa: un codificador de visión acoplado a un decodificador transformer de 32B parámetros. Dos innovaciones técnicas destacan en la descripción del repositorio: Interleaved-MRoPE, un esquema de embeddings posicionales rotatorios intercalados, y DeepStack, una estrategia de fusión de características visuales a varios niveles de profundidad del codificador. La variante Thinking incorpora una fase de razonamiento explícito (cadena de pensamiento) antes de la respuesta final, que el servidor de inferencia separa mediante el parser `qwen3`.

No se proporcionan en la información disponible datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla el proceso de alineación. El repositorio de furiosa-ai no modifica los pesos: se limita a distribuir el modelo original junto con el bundle ejecutable para RNGD, por lo que los detalles de entrenamiento deben consultarse en la model card upstream de Qwen.

## Capacidades

- Generación de texto y razonamiento con cadena de pensamiento explícita (modo Thinking), separada de la respuesta final en la API.
- Comprensión de imágenes: descripción, OCR, análisis de documentos y gráficos, razonamiento espacial.
- Comprensión de vídeo, según la descripción de la familia Qwen3-VL.
- Entrada multimodal en formato de chat compatible con OpenAI, con partes de contenido `image_url` (URL remota, base64 inline o ruta local `file://` con el flag adecuado).
- Tool calling / function calling nativo, soportado mediante el parser `hermes` en Furiosa-LLM, con `--enable-auto-tool-choice`.
- Razonamiento multi-paso y uso en flujos de agentes, favorecido por la cadena de pensamiento y el soporte de herramientas.
- Capacidades multilingües: no se detallan los idiomas soportados en la información disponible.
- Salida exclusivamente de texto (image + text → text).

## Casos de uso

- Digitalización y extracción de datos de documentos: el modelo puede procesar imágenes de facturas, formularios o tablas y devolver texto estructurado, aprovechando sus capacidades de OCR y análisis de documentos descritas para la familia Qwen3-VL.
- Análisis de gráficos e informes financieros: a partir de una captura de un dashboard o un gráfico de líneas, el modelo razona sobre tendencias y valores, adecuado por su combinación de visión y cadena de pensamiento.
- Automatización de atención al cliente multimodal: gestión de conversaciones multi-turno en las que el usuario adjunta capturas de pantalla o fotos de productos, con soporte de tool calling para consultar sistemas internos.
- Agentes que operan sobre interfaces: el modelo puede interpretar capturas de pantalla de aplicaciones y, combinado con function calling, decidir la siguiente acción en un flujo automatizado.
- Moderación y descripción de contenido visual a escala: generación de descripciones y etiquetas para catálogos de imágenes o vídeos, con despliegue en cuatro tarjetas RNGD para throughput agregado.
- Asistencia técnica con documentación visual: el usuario envía una foto de un error en pantalla o de un diagrama de arquitectura y el modelo razona sobre la causa y propone pasos, apoyándose en la cadena de pensamiento para explicar el diagnóstico.
- Investigación en razonamiento multimodal: al ser un modelo denso de 32B con licencia Apache 2.0 y modo Thinking, sirve como base para experimentos de razonamiento visual y para comparativas con modelos propietarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 33.357.390.064 parámetros en precisión original (probablemente BF16, ~2 bytes por parámetro), el peso ronda los 66 GB, por lo que no cabe en una GPU de consumo de 24 GB sin cuantización; el tamaño del repo (121,7 GB) incluye además el bundle FXB.
- GPU recomendadas: no se documentan GPU concretas para este repositorio; el bundle está orientado a FuriosaAI RNGD.
- Hardware soportado oficialmente en este repo: FuriosaAI RNGD, con estrategia de tensor-parallel de 32 PEs, lo que corresponde a cuatro tarjetas RNGD (8 PEs por tarjeta).
- Cabe en GPU de consumo: no con los pesos originales sin cuantizar; no se ofrecen variantes cuantizadas en este repositorio.
- Opciones de despliegue: Furiosa-LLM (`furiosa-llm serve`) sobre RNGD; el modelo original también es compatible con vLLM, SGLang y Transformers según la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Hardware destacado | Notas |
|---|---|---|---|---|---|
| furiosa-ai/Qwen3-VL-32B-Thinking (este repo) | 33.357.390.064 (denso) | no disponible | Apache 2.0 | FuriosaAI RNGD (4 tarjetas), vLLM, SGLang, Transformers | Bundle FXB para RNGD; sin cuantizar |
| Qwen/Qwen3-VL-32B-Thinking (upstream) | 32B (denso) | no disponible | Apache 2.0 | GPU convencionales | Modelo original; misma arquitectura y pesos |
| Modelos Qwen3-VL de menor tamano (p. ej. variantes 8B/4B) | no disponible | no disponible | Apache 2.0 | GPU de consumo y aceleradores | Alternativas si el presupuesto de memoria es limitado; datos no verificados en esta ficha |

No se dispone de datos de benchmarks que permitan comparar el rendimiento numérico con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; como modelo entrenado con datos web a gran escala, es previsible que herede sesgos de esos corpus, pero no se aportan detalles.
- Riesgo de alucinación: presente en modelos generativos; el modo Thinking puede aumentar la longitud de la respuesta y, con ello, el coste computacional y el riesgo de razonamientos plausibles pero incorrectos.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se detallan en este repositorio; deben consultarse en la model card upstream.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y de las dependencias de Furiosa-LLM.
- Requisito de hardware específico para el bundle: el FXB está pensado para RNGD; fuera de ese hardware hay que usar los pesos originales con otros frameworks.
- El campo `reasoning` de la API no forma parte de la especificación OpenAI: es una convención extendida, y acceder a él cuando no existe lanza `AttributeError`.
- El servidor requiere configuración explícita de parsers (`--reasoning-parser qwen3`, `--tool-call-parser hermes`) para separar razonamiento y tool calls; sin ellos, la cadena de pensamiento puede mezclarse con la respuesta.
- Para servir imágenes locales o restringir dominios remotos hay que usar `--allowed-local-media-path`, `--allowed-media-domains` e `--image-limit-per-prompt`; sin estas opciones, las rutas locales no funcionan.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/furiosa-ai/Qwen3-VL-32B-Thinking
- Modelo base upstream: https://huggingface.co/Qwen/Qwen3-VL-32B-Thinking
- Documentación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Guía de instalación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
- Opciones de servidor para modelos visión-lenguaje: https://developer.furiosa.ai/latest/en/furiosa_llm/vision-language.html#server-options
- Web de FuriosaAI: https://furiosa.ai
