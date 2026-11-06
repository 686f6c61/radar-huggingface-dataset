# aether-models/aether-kit-clip-vit-b32

## Resumen

Aether-kit-clip-vit-b32 es una exportación del modelo CLIP ViT-B/32 de OpenAI (revisión `3d74acf9`) al formato propietario "Core AI" del proyecto Aether-Kit, realizada por el autor `aether-models` mediante su herramienta Forge (`Forge/clip/`). No se trata de un modelo entrenado desde cero ni de un fine-tune con datos nuevos: es una conversión de pesos que preserva el comportamiento del CLIP original, empaquetado como dos grafos estáticos (torre de imagen y torre de texto) que devuelven embeddings de 512 dimensiones normalizados a longitud unitaria.

El modelo resuelve el mismo problema que CLIP: alineamiento imagen-texto en un espacio latente compartido, lo que habilita clasificación zero-shot de imágenes, búsqueda multimodal y filtrado semántico de contenido visual. Su relevancia es de nicho: está pensado exclusivamente para ejecutarse con el runtime `AetherVision` (`clip-joint@1`) sobre macOS, no para Hugging Face Transformers ni para servidores Linux convencionales.

La arquitectura subyacente es un ViT-B/32 (Vision Transformer con parches de 32x32) y un text encoder tipo transformer, con 512 dimensiones de embedding. El repositorio ocupa 0,3 GB y la licencia es MIT, con un fichero `NOTICE` que indica que se trata de una versión modificada del original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-B/32 (Vision Transformer con patch size 32 + text encoder transformer) |
| Parametros totales | no disponible (el CLIP ViT-B/32 original ronda los 151 M, pero no se confirma en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 77 tokens CLIP BPE para la torre de texto; imagen de entrada 224 px en el lado corto con center crop |
| Tipos de cuantizacion | no disponible (los grafos se exportan y ejecutan en float16; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (CLIP original es mayoritariamente ingles; la model card no lo especifica) |
| Licencia | MIT (con fichero NOTICE por ser version modificada) |
| Formato de pesos | Grafos estaticos "Core AI" propios de Aether-Kit (no safetensors ni GGUF); manifiesto en `.aether/aether.json` |

## Arquitectura y entrenamiento

La arquitectura es la de CLIP ViT-B/32: una torre de visión basada en Vision Transformer que divide la imagen en parches de 32x32 píxeles y una torre de texto que procesa hasta 77 tokens BPE. Ambas torres proyectan a un espacio compartido de 512 dimensiones, donde la similitud coseno equivale al producto escalar porque los embeddings se normalizan a longitud unitaria. La exportación separa las dos torres en grafos estáticos independientes: la de imagen acepta una imagen RGB redimensionada a 224 en el lado corto y recortada al centro, en rango [0, 1] con la normalización CLIP incluida en el grafo; la de texto acepta lotes de 1 u 8 secuencias de 77 tokens.

No hay entrenamiento nuevo ni fine-tuning documentado: los pesos provienen del checkpoint `openai/clip-vit-base-patch32` en la revisión `3d74acf9`. La innovación técnica de esta ficha es puramente de despliegue: la conversión a grafos estáticos Core AI, la inclusión de la normalización dentro del grafo y una validación ("gated") contra la implementación upstream en CPU y float32, documentada en `export-report.json`. Las torres se ejecutan en float16 y devuelven embeddings en float32.

## Capacidades

- Generación de embeddings imagen-texto de 512 dimensiones, normalizados a longitud unitaria.
- Clasificación zero-shot de imágenes mediante softmax sobre 100 clases y similitud coseno.
- Búsqueda y recuperación multimodal (imagen a texto y texto a imagen) por similitud en el espacio latente.
- Procesamiento por lotes en la torre de texto (tamaños de lote 1 u 8) y por imagen individual en la torre de visión.
- No soporta generación de texto, razonamiento, código, matemáticas, tool calling ni agentes.
- No soporta visión generativa, audio ni modo "thinking".
- Capacidades multilingües: no documentadas; el CLIP original está sesgado hacia el inglés.

## Casos de uso

- Clasificación zero-shot de imágenes en catálogos: definir las clases como prompts de texto y puntuar cada imagen con el softmax sobre similitud coseno, sin reentrenar el modelo.
- Moderación y filtrado visual: comparar embeddings de imágenes subidas por usuarios contra un conjunto de prompts de referencia para detectar contenido no deseado.
- Búsqueda semántica de imágenes en una biblioteca local: indexar los embeddings de 512 dimensiones y recuperar por consulta textual usando producto escalar.
- Etiquetado automático de datasets de visión: generar etiquetas candidatas a partir de un vocabulario de prompts y usar el modelo como preanotador antes de la revisión humana.
- Deduplicación y agrupación de imágenes: calcular similitud entre embeddings para detectar imágenes casi idénticas o agrupar por temática.
- Prototipado en macOS: integrar el modelo en aplicaciones de escritorio mediante `AetherVision` para experimentar con pipelines multimodales sin depender de servicios en la nube.
- Validación de pipelines de exportación: usar el par de grafos como referencia para comparar implementaciones propias contra el comportamiento de CLIP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona una validación ("gated") contra la implementación upstream en CPU y float32, cuyos resultados están en `export-report.json`, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; por el tamaño del repositorio (0,3 GB) y la ejecución en float16, el modelo es ligero y cabe en GPUs de gama baja, pero no se confirman cifras.
- GPU recomendadas: no disponibles; el runtime documentado es `AetherVision` sobre macOS, lo que sugiere ejecución en Apple Silicon.
- Compatibilidad con GPU de consumo: probable por tamaño, pero no confirmada en la información disponible.
- Opciones de despliegue: exclusivamente el runtime de Aether-Kit (`AetherVision`, `clip-joint@1`, macOS) con el manifiesto `.aether/aether.json`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aether-kit-clip-vit-b32 | no disponible | 77 tokens (texto), 224 px (imagen) | Grafos Core AI (Aether-Kit) | MIT | Solo runtime Aether-Kit en macOS |
| openai/clip-vit-base-patch32 | ~151 M (no confirmado en la informacion) | 77 tokens (texto), 224 px (imagen) | Safetensors / PyTorch | MIT | Hugging Face Transformers, amplio ecosistema |
| sentence-transformers/clip-ViT-B-32 | no disponible | 77 tokens (texto), 224 px (imagen) | Safetensors | no disponible en la informacion | Hugging Face, ecosistema sentence-transformers |

La diferencia principal frente a las alternativas no está en capacidades sino en el formato y el runtime: la versión de Aether-Kit solo funciona con su propio motor en macOS, mientras que las otras dos se integran en el ecosistema estándar de Hugging Face.

## Limitaciones y advertencias

- Dependencia total del runtime Aether-Kit (`AetherVision`, `clip-joint@1`) y de macOS; no es portable a otros entornos sin conversión adicional.
- No es un modelo generativo: no produce texto, código ni respuestas; solo embeddings.
- El CLIP original de OpenAI se describe como modelo de investigación; usos no testados, vigilancia y reconocimiento facial quedan fuera de su alcance según su model card.
- Sesgos del CLIP original heredados: sesgo hacia el inglés y hacia ciertos contextos culturales y demográficos en los prompts.
- La licencia MIT permite uso comercial, pero el fichero NOTICE indica que es una versión modificada; conviene revisar sus términos.
- Sin descargas ni likes en el momento de la consulta; no hay evidencia de uso en producción ni de mantenimiento continuado.
- La ventana de texto de 77 tokens limita la longitud de los prompts de clase y consultas.

## Enlaces

- [Hugging Face: aether-models/aether-kit-clip-vit-b32](https://huggingface.co/aether-models/aether-kit-clip-vit-b32)
- [Modelo base: openai/clip-vit-base-patch32](https://huggingface.co/openai/clip-vit-base-patch32)
- [Repositorio Aether-Kit](https://github.com/bubstackdev/aether-kit)
- [Model card de CLIP en OpenAI](https://github.com/openai/CLIP/blob/main/model-card.md)
- [sentence-transformers/clip-ViT-B-32](https://huggingface.co/sentence-transformers/clip-ViT-B-32)
