# furiosa-ai/Qwen3-VL-32B-Instruct

## Resumen

Qwen3-VL-32B-Instruct es un modelo denso de visión-lenguaje de 32 000 millones de parámetros perteneciente a la familia Qwen3-VL, desarrollado originalmente por el equipo Qwen de Alibaba. Combina un codificador visual con un decodificador transformer denso y emplea embeddings posicionales Interleaved-MRoPE junto con fusión de características multinivel DeepStack. El repositorio analizado, publicado por furiosa-ai, empaqueta los pesos originales del modelo junto con un Furiosa Executable Bundle (FXB) para ejecutarlo sobre aceleradores FuriosaAI RNGD mediante la librería Furiosa-LLM.

La relevancia de esta ficha reside en que demuestra la portabilidad del modelo fuera del ecosistema GPU convencional: el mismo checkpoint que corre en vLLM, SGLang o Transformers se puede desplegar en hardware NPU específico de FuriosaAI con una estrategia de paralelismo tensorial de 32 PEs repartidos en cuatro tarjetas RNGD. El modelo base upstream está liberado bajo licencia Apache 2.0, lo que facilita su uso comercial.

Se trata de la edición Instruct (sin modo de razonamiento explícito), orientada a tareas de comprensión visual como OCR, análisis de documentos y gráficos, razonamiento espacial y comprensión de vídeo, además de soporte nativo de tool calling. El repositorio no aplica cuantización: los pesos se distribuyen en la misma precisión que el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL densa (codificador visual + decodificador transformer denso), Interleaved-MRoPE y DeepStack |
| Parametros totales | 33.357.390.064 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | ninguna (se distribuye en la precision original del modelo upstream) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (mas Furiosa Executable Bundle, FXB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3-VL en su variante densa: un codificador de visión acoplado a un decodificador transformer denso de 32 000 millones de parámetros. Incorpora dos innovaciones técnicas destacadas en la serie: Interleaved-MRoPE, que intercala componentes rotacionales para mejorar la generalización posicional en secuencias multimodales largas, y DeepStack, un mecanismo de fusión de características visuales a múltiples niveles de profundidad del decodificador. La entrada es imagen más texto y la salida es texto.

La información proporcionada no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal. El repositorio de furiosa-ai no reentrena el modelo: únicamente lo empaqueta con un bundle ejecutable para FuriosaAI RNGD y documenta la estrategia de paralelismo tensorial (32 PEs, cuatro tarjetas RNGD con 8 PEs por tarjeta).

## Capacidades

- Generación de texto y razonamiento multimodal a partir de entradas de imagen y texto.
- Comprensión visual: OCR, análisis de documentos, interpretación de gráficos y tablas.
- Razonamiento espacial sobre imágenes.
- Comprensión de vídeo junto con texto.
- Soporte nativo de tool calling / function calling, expuesto mediante el parser `hermes` en Furiosa-LLM.
- API compatible con OpenAI para mensajes multimodales con partes `image_url` (URL remota, base64 en línea o ruta local `file://` con el flag correspondiente).
- Edición Instruct sin modo de pensamiento explícito (no es la variante thinking).
- Capacidades multilingües: no detalladas en la información proporcionada.

## Casos de uso

- Digitalización y extracción de datos de documentos: el modelo puede procesar facturas, formularios e informes en formato imagen y devolver texto estructurado, aprovechando sus capacidades de OCR y análisis de documentos.
- Análisis de gráficos financieros o científicos: interpretación de ejes, tendencias y valores a partir de capturas o figuras embebidas en informes, útil en pipelines de business intelligence.
- Automatización de atención al cliente multimodal: gestión de conversaciones multi-turno donde el usuario adjunta capturas de pantalla o fotos de productos, con soporte de tool calling para consultar sistemas internos.
- Moderación y descripción de contenido visual: generación de descripciones y etiquetas para catálogos de imágenes o vídeos, con límites configurables de imágenes por prompt (`--image-limit-per-prompt`).
- Asistentes de accesibilidad: descripción detallada de imágenes y vídeos para usuarios con discapacidad visual, integrable mediante la API compatible con OpenAI.
- Agentes con razonamiento multi-paso sobre documentos: combinación de tool calling y comprensión visual para flujos donde el agente lee una imagen, consulta una herramienta externa y sintetiza la respuesta.
- Despliegue sobre aceleradores FuriosaAI RNGD: escenarios con requisitos de eficiencia energética o disponibilidad de hardware NPU, donde el bundle FXB permite servir el modelo con `furiosa-llm serve` sin recompilar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 164,7 GB en safetensors, lo que da una referencia del tamaño de los pesos en su precisión original.
- GPU recomendadas: no especificadas en la información proporcionada.
- Hardware objetivo documentado: FuriosaAI RNGD, con paralelismo tensorial de 32 PEs sobre cuatro tarjetas (8 PEs por tarjeta).
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada.
- Opciones de despliegue: Furiosa-LLM (`furiosa-llm serve`), con API compatible con OpenAI; el modelo upstream también funciona en vLLM, SGLang y Transformers según la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| furiosa-ai/Qwen3-VL-32B-Instruct | 33,36 B (denso) | no disponible | Apache 2.0 | HuggingFace, empaquetado para FuriosaAI RNGD |
| Qwen/Qwen3-VL-32B-Instruct | 32 B (denso) | no disponible | Apache 2.0 | HuggingFace, upstream |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de otros fabricantes, por lo que la comparativa se limita al modelo upstream y a la ausencia de alternativas documentadas.

## Limitaciones y advertencias

- El repositorio está orientado específicamente a FuriosaAI RNGD y a la librería Furiosa-LLM; para otros frameworks hay que remitirse al modelo upstream.
- No se ha aplicado cuantización, por lo que el consumo de memoria es el de los pesos originales (164,7 GB en el repo), lo que limita su despliegue a hardware de gama alta.
- La variante es Instruct, sin modo de pensamiento; no se debe esperar razonamiento extendido tipo thinking.
- No se detallan sesgos conocidos ni tasas de alucinación en la información proporcionada.
- No se especifican los idiomas soportados, lo que impide garantizar calidad multilingüe sin evaluación previa.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo upstream y de las dependencias de Furiosa-LLM.
- El soporte de tool calling requiere arrancar el servidor con `--enable-auto-tool-choice --tool-call-parser hermes`.
- Para imágenes locales es necesario habilitar `--allowed-local-media-path`; las URL remotas pueden restringirse con `--allowed-media-domains`.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/furiosa-ai/Qwen3-VL-32B-Instruct
- Modelo upstream: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Documentación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Guía de modelos visión-lenguaje: https://developer.furiosa.ai/latest/en/furiosa_llm/vision-language.html
- Guía de tool calling: https://developer.furiosa.ai/latest/en/furiosa_llm/toolcalling.html
- Instalación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
- Sitio de FuriosaAI: https://furiosa.ai
