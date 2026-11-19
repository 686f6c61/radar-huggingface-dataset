# audioghostai/sam-audio-base

## Resumen

SAM-Audio Base es un modelo de separación de fuentes de audio (source separation) desarrollado originalmente por Meta, distribuido aquí como una copia no oficial por el usuario audioghostai bajo el identificador `audioghostai/sam-audio-base`. El modelo resuelve el problema de aislar fuentes sonoras concretas dentro de una mezcla de audio mediante indicaciones textuales (text-prompted separation), lo que permite extraer, por ejemplo, una voz o un instrumento específico a partir de una grabación compleja.

La arquitectura se basa en un diffusion transformer con capas auxiliares de anclaje (anchor embedding, proyecciones y alineamiento de vídeo), y utiliza el codificador de texto público `t5-base` para procesar las indicaciones en lenguaje natural. Esta copia concreta elimina el codificador visual (empleado únicamente en prompting visual) y delega el códec de audio necesario a un repositorio compartido separado (`audioghostai/sam-audio-shared`).

Es relevante ahora porque ofrece los pesos de SAM-Audio Base en formato safetensors (fp32 y fp16) en lugar del `checkpoint.pt` serializado con pickle del original, lo que facilita su integración en pipelines modernos y su descarga sin necesidad de cuenta en Hugging Face. El repositorio ocupa 6,9 GB en total, aunque los pesos principales suman aproximadamente 6,44 GB entre ambas precisiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer con capas de anclaje (anchor embedding, proyecciones, alineamiento de video); codificador de texto T5-base |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (4,29 GB) y fp16 (2,15 GB) en safetensors; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | SAM License (Meta), con seccion de Trade Controls |
| Formato de pesos | safetensors (`model.fp32.safetensors`, `model.fp16.safetensors`), `config.json` |

## Arquitectura y entrenamiento

El modelo emplea un diffusion transformer orientado a la separación de fuentes condicionada por texto. Según la model card, la copia incluye únicamente las partes que utiliza la separación con prompt textual: el diffusion transformer y las capas pequeñas que lo rodean (anchor embedding, proyecciones y alineamiento de vídeo). El codificador visual, usado solo para prompting visual, se ha omitido, y el códec de audio reside en el repositorio `audioghostai/sam-audio-shared`. El codificador de texto es el `t5-base` público, tal como en el código original de Meta.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La copia se generó a partir de la revisión `facebook/sam-audio-base@81f64008f9f957c2b57a45923fb5299c66e9d186`, y el `config.json` se mantiene sin cambios respecto al original. La innovación técnica destacable de esta distribución es el repackaging a safetensors en dos precisiones: `model.fp16.safetensors` contiene los mismos tensores convertidos a float16 (valor por defecto de AudioGhost), mientras que `model.fp32.safetensors` conserva los valores float32 de Meta para ejecuciones en bf16/fp32 y fine-tuning.

## Capacidades

- Separación de fuentes de audio condicionada por texto (text-prompted source separation): permite aislar fuentes descritas en lenguaje natural.
- Procesamiento audio-a-audio (pipeline `audio-to-audio`).
- Integración con el codificador de texto `t5-base` para interpretar las indicaciones textuales.
- Soporte de prompting visual en el modelo original de Meta (no incluido en esta copia, que omite el codificador visual).
- Ejecución en fp16 y fp32/bf16 según el fichero de pesos elegido.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo.

## Casos de uso

- Separación de voces en producciones musicales: el modelo permite aislar una pista vocal de una mezcla mediante un prompt textual, facilitando remezclas y edición multipista sin acceso a los stems originales.
- Limpieza de grabaciones de campo: extraer una fuente concreta (por ejemplo, un ave o una conversación) de una grabación con ruido de fondo, usando la indicación textual como guía.
- Postproducción de vídeo y doblaje: separar diálogos de música y efectos para sustituir o remezclar pistas de audio en un montaje.
- Restauración de archivos históricos: aislar voces o instrumentos en grabaciones antiguas donde las pistas no están disponibles por separado.
- Creación de datasets de audio: generar stems etiquetados a partir de mezclas existentes para entrenar otros modelos de audio.
- Investigación en separación de fuentes: servir como checkpoint de referencia en fp32 para fine-tuning y experimentación con prompts textuales, gracias a que esta copia conserva los valores float32 originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,15 GB solo para los pesos en fp16 y 4,29 GB en fp32, a lo que hay que sumar el codificador de texto `t5-base` (no incluido en el recuento) y el códec de audio del repositorio compartido.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño de pesos, cabría esperar ejecución en GPUs de consumo con al menos 8 GB de VRAM en fp16, aunque no se confirma.
- Cabe en GPU de consumo: probable en fp16 con GPUs de 8 GB o más, si bien el dato no está verificado en la model card.
- Opciones de despliegue: la model card menciona AudioGhost como entorno de ejecución previsto; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| audioghostai/sam-audio-base (esta ficha) | no disponible | no disponible | Separación de fuentes con prompt textual | SAM License | Hugging Face, safetensors fp16/fp32 |
| facebook/sam-audio-base (original) | no disponible | no disponible | Separación de fuentes con prompt textual | SAM License | Hugging Face, `checkpoint.pt` (pickle) |
| Otros modelos de separación de fuentes | no disponible | no disponible | Separación de fuentes | no disponible | no disponible |

La comparativa se limita al modelo original de Meta, del que esta copia deriva. No se dispone de información sobre alternativas comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Copia no oficial: no está hecha, respaldada ni soportada por Meta; cualquier problema de integración debe atribuirse al repackaging de audioghostai.
- Licencia SAM License: incluye una sección de Trade Controls; la redistribución de los pesos o de trabajos derivados debe hacerse bajo la misma licencia e incluir una copia de esta.
- Funcionalidad reducida respecto al original: se omite el codificador visual, por lo que el prompting visual no está disponible en esta copia.
- Dependencia externa: el códec de audio necesario reside en el repositorio `audioghostai/sam-audio-shared` y debe descargarse por separado.
- Riesgo de alucinación en la separación: no se documenta el comportamiento ante prompts ambiguos o fuentes no presentes en la mezcla.
- Idiomas soportados: no disponibles; el rendimiento multilingüe de las indicaciones textuales no está documentado.
- Sin métricas publicadas: no hay benchmarks que permitan estimar la calidad de separación ni compararla con alternativas.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/audioghostai/sam-audio-base
- Modelo original de Meta: https://huggingface.co/facebook/sam-audio-base
- Repositorio del códec compartido: https://huggingface.co/audioghostai/sam-audio-shared
- Repositorio de AudioGhost: https://github.com/0x0funky/audioghost-ai
- Codificador de texto T5-base: https://huggingface.co/google-t5/t5-base
