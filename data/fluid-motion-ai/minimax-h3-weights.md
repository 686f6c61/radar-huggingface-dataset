# Fluid-Motion-AI/minimax-h3-weights

## Resumen

MiniMax H3 es un sistema generativo omnicanal desarrollado por MiniMax (empresa china de IA) que unifica la comprensión de contextos multimodales compuestos por texto, imagen, vídeo y audio, y genera vídeo con audio estéreo nativo. El modelo se distribuye en abierto a través del repositorio de Hugging Face `Fluid-Motion-AI/minimax-h3-weights`, un espejo de los pesos oficiales, con un tamaño total de 353,9 GB y licencia comunitaria propia (`minimax-h3-community-license-agreement`). Según la información pública, fue lanzado el 31 de julio de 2026 y se convirtió en el primer modelo de pesos abiertos en situarse entre los tres primeros del ranking Artificial Analysis Video Arena.

El sistema completo se compone de tres módulos: H3-Context-IR, un subsistema dedicado a interpretar y refinar instrucciones multimodales complejas y convertirlas en una representación intermedia; H3-Base, que genera audio y vídeo sincronizados a 768p; y H3-Regenerate-2K, que reinyecta el resultado de 768p junto con el contexto original para regenerar la salida a resolución 2K. El modelo soporta múltiples modos de entrada (texto, primera y última imagen, referencias multimodales) y produce vídeos de 4 a 15 segundos a 24 FPS con audio estéreo de 32 kHz.

La relevancia del modelo radica en su carácter omnicanal y en la generación conjunta de vídeo y audio sincronizado en un único pipeline, algo poco habitual en modelos de pesos abiertos. La ficha se centra en los datos disponibles en la model card y en las fuentes públicas consultadas; los detalles de arquitectura interna (número de parámetros, tipo de transformer, composición del dataset) no se especifican en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (sistema omnicanal con módulos H3-Context-IR, H3-Base y H3-Regenerate-2K) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | 11 idiomas con soporte estable para diálogo: árabe, chino, inglés, francés, alemán, italiano, japonés, coreano, portugués, ruso y español; otros idiomas con soporte variable |
| Licencia | minimax-h3-community-license-agreement (licencia comunitaria propia, etiquetada como `other`) |
| Formato de pesos | safetensors (compatible con diffusers) |
| Duración de salida | 4–15 segundos |
| Resolución de salida | lado corto a 768 px por defecto; 2K mediante H3-Regenerate-2K |
| Relación de aspecto | 21:9, 16:9, 4:3, 1:1, 3:4, 9:16 y otras |
| Frecuencia de fotogramas | 24 FPS |
| Audio de salida | estéreo a 32 kHz |
| Tamaño del repositorio | 353,9 GB |

## Arquitectura y entrenamiento

La información disponible describe H3 como un sistema generativo omnicanal de propósito general, diseñado con orientación a la generalización de tareas. El sistema se organiza en tres módulos diferenciados. H3-Context-IR actúa como capa de comprensión y refinamiento de las instrucciones multimodales de entrada, transformándolas en una representación intermedia (Context Intermediate Representation) que el generador puede interpretar con mayor fidelidad. H3-Base es el módulo generador que produce audio y vídeo sincronizados a 768p. H3-Regenerate-2K recibe el resultado de 768p junto con el contexto original y lo regenera a resolución 2K, aprovechando tanto la capacidad generativa del modelo como la información del contexto de entrada.

La model card indica que H3 adquiere capacidades amplias de comprensión y generación multimodal ya en la fase de preentrenamiento, lo que le permite seguir instrucciones multimodales complejas. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla el tipo concreto de arquitectura interna (transformer, MoE, híbrida u otra). La innovación técnica más destacable que sí se documenta es la separación explícita entre la comprensión de instrucciones (H3-Context-IR) y la generación, así como el esquema de regeneración a 2K que reutiliza el contexto original.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con audio estéreo sincronizado.
- Generación de vídeo a partir de una o dos imágenes (image-to-video, first-and-last-frame): sin imagen equivale a text-to-video; una imagen permite generar desde el primer o el último fotograma; dos imágenes permiten generar la transición entre primer y último fotograma.
- Modo de referencia omnicanal (H3-Base-Ref2VA): acepta hasta 9 imágenes, hasta 3 clips de vídeo de 2 a 15 segundos cada uno (duración total ≤ 15 s) y hasta 3 clips de audio de 2 a 15 segundos (total ≤ 15 s), con un máximo de 12 archivos combinados entre todos los tipos.
- Generación de vídeo con audio nativo sincronizado (text-to-audio-video, image-to-audio-video, image-text-to-audio-video).
- Transformación de vídeo (video-to-video, video-to-audio-video, audio-to-audio-video) y referencia a audio-vídeo (reference-to-audio-video).
- Diálogo hablado en 11 idiomas con soporte estable: árabe, chino, inglés, francés, alemán, italiano, japonés, coreano, portugués, ruso y español.
- Comprensión de contextos multimodales mixtos (texto, imagen, vídeo y audio) como entrada unificada.
- Generación a resolución 2K mediante el módulo H3-Regenerate-2K.
- Soporte de relaciones de aspecto variadas (21:9, 16:9, 4:3, 1:1, 3:4, 9:16).
- Habilidades oficiales para mejorar la redacción de prompts, publicadas en el repositorio GitHub del proyecto.

## Casos de uso

- Producción de vídeo publicitario de formato corto: el modelo genera clips de 4 a 15 segundos a 24 FPS con audio estéreo sincronizado, adecuados para anuncios en redes sociales en relaciones de aspecto 9:16 o 1:1, partiendo de un prompt de texto o de una imagen de referencia de producto.
- Doblaje y localización de vídeo: el modo video-to-audio-video y el soporte estable de 11 idiomas permiten regenerar la pista de audio de un clip existente con diálogo en otro idioma, manteniendo el vídeo de entrada como referencia.
- Creación de contenido con consistencia de personaje: el modo de referencia omnicanal (hasta 9 imágenes y 3 clips de vídeo) permite generar nuevas escenas de audio-vídeo a partir de referencias visuales y de audio del mismo personaje, útil en series cortas o contenido episódico.
- Previsualización de storyboards y animáticas: a partir de una primera y una última imagen (first-and-last-frame), el modelo interpola la transición con audio, lo que sirve para validar secuencias antes de la producción final.
- Generación de vídeo musical o de audio reactivo: el modo audio-to-audio-video permite tomar una pista de audio de entrada y generar vídeo sincronizado con ella, aplicable a visuales musicales y contenido promocional.
- Prototipado rápido en estudios de animación y VFX: la combinación de 768p para iteración rápida y H3-Regenerate-2K para la versión final permite un flujo de trabajo en dos fases, reduciendo el coste de generar directamente en alta resolución.
- Integración en herramientas de creación vía API: los endpoints de generación de vídeo (global y CN) permiten incorporar H3 en productos SaaS de edición o generación de contenido sin desplegar los 353,9 GB de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única referencia de rendimiento encontrada es cualitativa: según la fuente pública consultada, H3 se situó entre los tres primeros del ranking Artificial Analysis Video Arena tras su lanzamiento, siendo el primer modelo de pesos abiertos en lograrlo. No se dispone de cifras concretas de MMLU, HumanEval, GSM8K ni de métricas de calidad de vídeo (FVD, CLIP score, etc.) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio de pesos ocupa 353,9 GB, lo que da una idea del orden de magnitud del almacenamiento necesario, pero no se especifica la VRAM requerida por el pipeline completo ni por cada módulo.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible; el tamaño del repositorio y la generación a 2K sugieren que no es viable en GPU de consumo sin cuantización, pero este dato no se confirma en la información disponible.
- Opciones de despliegue: los pesos están en formato safetensors y la librería asociada es `minimax-h3`, con compatibilidad declarada con `diffusers`. No se documentan en la información disponible opciones como vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no a generación de vídeo).
- Alternativa sin despliegue local: API oficial en platform.minimax.io (global) y platform.minimaxi.com (CN), además de las aplicaciones web y de escritorio Hailuo AI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Desarrollador | Tipo | Pesos abiertos | Licencia | Contexto / duración | Notas |
|---|---|---|---|---|---|---|
| MiniMax H3 | MiniMax | Generación de vídeo con audio sincronizado, omnicanal | Sí (espejo en Fluid-Motion-AI) | minimax-h3-community-license-agreement | 4–15 s, hasta 2K, audio 32 kHz estéreo | Top 3 en Artificial Analysis Video Arena según la fuente consultada |
| Alternativas de código cerrado (Google, ByteDance) | Google, ByteDance | Generación de vídeo | No | Propietaria | no disponible | Citadas en la fuente como competidoras directas en el ranking; sin datos concretos de parámetros ni contexto en la información disponible |
| Fluid-Motion-AI/pika-h3-flex-weights | Fluid-Motion-AI | Image-to-video | Sí | no disponible | no disponible | 33B parámetros según la página de modelos de Fluid-Motion-AI; sin más datos en la información disponible |

No se dispone de datos suficientes para una comparación cuantitativa de parámetros, contexto o rendimiento con alternativas de la misma categoría. La información pública solo permite establecer la comparación cualitativa con los modelos cerrados de Google y ByteDance mencionados en la fuente, y la referencia al modelo pika-h3-flex-weights del mismo publicador.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; al ser un modelo generativo de vídeo y audio con diálogo, es previsible que herede sesgos de sus datos de entrenamiento, pero no se aportan detalles.
- Riesgo de alucinación: no cuantificado; en generación de vídeo, el riesgo se traduce en incoherencias visuales, desincronización labial o diálogos inexactos respecto al prompt, sin métricas publicadas en la información disponible.
- Limitaciones de duración y resolución: la salida está acotada a 4–15 segundos y a 768p por defecto; el 2K requiere el módulo adicional H3-Regenerate-2K. Las entradas de referencia están limitadas a 9 imágenes, 3 clips de vídeo y 3 clips de audio, con un máximo de 12 archivos y 15 segundos totales.
- Limitaciones de idioma: solo 11 idiomas tienen soporte estable para diálogo; el resto tiene soporte variable y sin garantías.
- Dependencia de H3-Context-IR: la model card advierte explícitamente de que H3-Context-IR es crítico para la calidad de la salida y recomienda incorporarlo al pipeline o seguir la guía de prompting para construir un sistema propio de procesamiento de contexto.
- Restricciones de licencia: la licencia es `minimax-h3-community-license-agreement`, una licencia comunitaria propia etiquetada como `other`; no se detallan en la información disponible las condiciones exactas para uso comercial, por lo que es imprescindible revisar el archivo LICENSE antes de un despliegue en producción.
- Requisitos de infraestructura: el repositorio de pesos ocupa 353,9 GB, lo que implica requisitos de almacenamiento y, previsiblemente, de VRAM elevados; no se dispone de cifras oficiales de VRAM ni de latencia.
- Fecha de creación del repositorio: 3 de noviembre de 2026, según los metadatos de Hugging Face; la fuente pública sitúa el lanzamiento del modelo el 31 de julio de 2026, por lo que el repositorio consultado parece un espejo posterior.

## Enlaces

- Repositorio en Hugging Face (espejo): https://huggingface.co/Fluid-Motion-AI/minimax-h3-weights
- Repositorio oficial en Hugging Face: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia oficial: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Repositorio GitHub: https://github.com/MiniMax-AI/MiniMax-H3
- Habilidades de prompting (GitHub): https://github.com/MiniMax-AI/MiniMax-H3/tree/main/skills
- API global (generación de vídeo): https://platform.minimax.io/docs/api-reference/video-generation-v2-create
- API CN (generación de vídeo): https://platform.minimaxi.com/docs/api-reference/video-generation-v2-create
- Documentación de API de generación de texto: https://platform.minimax.io/docs/guides/text-generation
- Aplicación web global (Hailuo AI): https://hailuoai.video/tools/minimax-h3
- Aplicación web CN: https://hailuoai.com/
- Aplicación de escritorio global: https://hub.minimax.io/
- Aplicación de escritorio CN: https://hub.minimaxi.com/
- Sitio web de MiniMax: https://www.minimax.io
- ModelScope: https://modelscope.cn/organization/minimax
- Discord: https://discord.com/invite/dbMxutw7tP
- Artículo de referencia: https://www.intelligentliving.co/minimax-h3-open-weight-ai-video-model/
- Página de modelos de Fluid-Motion-AI: https://huggingface.co/Fluid-Motion-AI/models
