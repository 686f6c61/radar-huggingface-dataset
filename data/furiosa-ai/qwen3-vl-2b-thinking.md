# furiosa-ai/Qwen3-VL-2B-Thinking

## Resumen

Qwen3-VL-2B-Thinking es un modelo denso de visión-lenguaje de 2.127 millones de parámetros desarrollado por el equipo Qwen (Alibaba). Combina un codificador visual con un decodificador transformer denso y emplea embeddings posicionales Interleaved-MRoPE junto con fusión multinivel de características DeepStack. Este repositorio concreto, publicado por furiosa-ai, empaqueta los pesos originales junto con un Furiosa Executable Bundle (FXB) para ejecutar el modelo en aceleradores FuriosaAI RNGD mediante la librería Furiosa-LLM.

La variante Thinking emite una cadena de razonamiento explícita antes de la respuesta final, lo que la hace adecuada para tareas que requieren razonamiento visual multi-paso, análisis de documentos y comprensión de vídeo. El modelo acepta entradas multimodales (imagen y texto) y produce texto, con soporte nativo de tool calling y una API compatible con OpenAI.

Su relevancia actual radica en dos factores: por un lado, ofrece capacidades de razonamiento visual en un tamaño reducido de 2B parámetros, lo que facilita el despliegue en hardware de inferencia especializado; por otro, la integración con Furiosa-LLM y RNGD proporciona una alternativa de aceleración no-GPU para cargas de trabajo multimodales en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer denso con codificador visual) |
| Parametros totales | 2.127.532.032 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | sin cuantización (misma precisión que los pesos upstream) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors + Furiosa Executable Bundle (FXB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3-VL en su variante densa: un codificador visual acoplado a un decodificador transformer denso. Incorpora Interleaved-MRoPE como esquema de embeddings posicionales y DeepStack para la fusión de características visuales a múltiples niveles, lo que permite al modelo integrar información visual a distintas escalas de abstracción. La variante Thinking genera una cadena de razonamiento explícita antes de la respuesta final, que Furiosa-LLM separa mediante el parser de razonamiento `qwen3`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. El repositorio de furiosa-ai no aplica cuantización: los pesos se ejecutan en la misma precisión que los originales de Qwen. En hardware RNGD, el modelo se despliega con un tamaño de paralelismo tensorial de 8 PEs, que corresponde a una única tarjeta RNGD (8 PEs por tarjeta).

## Capacidades

- Generación de texto y razonamiento: emite cadena de pensamiento explícita antes de la respuesta final (modo Thinking).
- Comprensión visual: procesa imágenes junto con texto para tareas de descripción, análisis y respuesta a preguntas visuales.
- OCR y análisis de documentos: lectura de texto en imágenes, análisis de gráficos y tablas.
- Razonamiento espacial: interpretación de relaciones espaciales en imágenes.
- Comprensión de vídeo: procesamiento de contenido audiovisual junto con texto.
- Tool calling / function calling: soporte nativo mediante el parser `hermes`, con `--enable-auto-tool-choice`.
- API compatible con OpenAI: expone endpoints `/v1/chat/completions` con mensajes multimodales estilo OpenAI (`image_url`).
- Soporte de imágenes remotas, base64 inline y rutas locales (`file://` con `--allowed-local-media-path`).
- Control de acceso a medios: restricción de dominios remotos (`--allowed-media-domains`) y límite de imágenes por prompt (`--image-limit-per-prompt`).
- Separación de razonamiento y respuesta: campo `reasoning` en respuestas no streaming y `delta.reasoning` en streaming.

## Casos de uso

- Análisis de documentos y OCR automatizado: el modelo puede extraer texto y estructura de imágenes de documentos, facturas o formularios, procesando cada imagen mediante el campo `image_url` de la API compatible con OpenAI. Adecuado para pipelines de digitalización donde se requiere interpretación semántica además de OCR.
- Asistencia en atención al cliente con soporte visual: gestión de conversaciones multi-turno donde el usuario adjunta capturas de pantalla o fotos de productos, gracias a la combinación de entrada multimodal y tool calling para consultar sistemas internos.
- Análisis de gráficos e informes financieros: interpretación de gráficas y tablas en imágenes para extraer tendencias y responder preguntas analíticas, con la cadena de razonamiento accesible por separado para auditoría.
- Comprensión de vídeo para moderación o catalogación: procesamiento de contenido audiovisual para generar descripciones, detectar elementos relevantes o clasificar escenas, aprovechando la capacidad de comprensión de vídeo del modelo.
- Agentes multimodales con razonamiento multi-paso: integración en flujos de agente donde el modelo recibe imágenes, razona sobre ellas y ejecuta llamadas a herramientas mediante el parser `hermes`, con el razonamiento separado en el campo `reasoning` para trazabilidad.
- Despliegue en infraestructura FuriosaAI RNGD: ejecución en aceleradores RNGD con una sola tarjeta (8 PEs) mediante Furiosa-LLM, orientado a entornos de producción que buscan alternativas a GPU para inferencia multimodal.
- Prototipado de aplicaciones de visión-lenguaje: gracias a su tamaño de 2B parámetros y licencia Apache 2.0, sirve para experimentar con razonamiento visual en entornos con recursos limitados, usando el servidor OpenAI-compatible de Furiosa-LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 2.127 millones de parámetros en precisión completa (sin cuantización), los pesos ocupan aproximadamente 4,3 GB en FP16/BF16, aunque el repositorio incluye también el bundle FXB y el codificador visual, por lo que el requisito real puede ser mayor.
- GPU recomendadas: no disponible. El repositorio está orientado específicamente a FuriosaAI RNGD mediante Furiosa-LLM.
- Compatibilidad con GPU de consumo: no confirmada en este repositorio. El modelo upstream Qwen/Qwen3-VL-2B-Thinking puede ejecutarse en otros frameworks (vLLM, SGLang, Transformers), pero los requisitos concretos no se detallan en la información disponible.
- Opciones de despliegue: Furiosa-LLM (`furiosa-llm serve`) sobre FuriosaAI RNGD. El modelo upstream es compatible con vLLM, SGLang y Transformers según la model card.
- Paralelismo: tensor-parallel size de 8 PEs, que corresponde a una sola tarjeta RNGD.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Hardware objetivo | Notas |
|---|---|---|---|---|---|
| furiosa-ai/Qwen3-VL-2B-Thinking | 2.127 M | no disponible | Apache 2.0 | FuriosaAI RNGD (Furiosa-LLM) | Bundle FXB, sin cuantización, modo Thinking |
| Qwen/Qwen3-VL-2B-Thinking (upstream) | 2.127 M | no disponible | Apache 2.0 | GPU (vLLM, SGLang, Transformers) | Pesos originales sin bundle FXB |
| Otros modelos de visión-lenguaje de ~2B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

La comparación directa con alternativas de la misma categoría no está disponible en la información proporcionada. El único punto de referencia claro es el modelo upstream, del que este repositorio es un empaquetado para hardware FuriosaAI.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; cabe esperar los sesgos heredados de los datos de entrenamiento del modelo upstream Qwen3-VL.
- Riesgo de alucinación: presente como en cualquier modelo generativo; la cadena de razonamiento explícita no garantiza la corrección factual de la respuesta final.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo upstream y de Furiosa-LLM para el despliegue en producción.
- Dependencia de hardware: el bundle FXB está diseñado para FuriosaAI RNGD; fuera de ese hardware debe usarse el modelo upstream con otros frameworks.
- Sin cuantización: el repositorio no aplica cuantización, lo que puede limitar opciones de optimización de memoria.
- El campo `reasoning` no forma parte de la especificación de la API de OpenAI; su acceso cuando no hay contenido de razonamiento lanza `AttributeError`.
- El acceso a imágenes locales requiere el flag `--allowed-local-media-path`; sin él, las rutas `file://` no funcionan.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/furiosa-ai/Qwen3-VL-2B-Thinking
- Modelo upstream: https://huggingface.co/Qwen/Qwen3-VL-2B-Thinking
- FuriosaAI: https://furiosa.ai
- Documentación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Guía de instalación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
- Guía de modelos visión-lenguaje de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/vision-language.html#server-options
