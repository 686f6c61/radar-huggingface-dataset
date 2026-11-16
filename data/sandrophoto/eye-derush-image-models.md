# sandrophoto/eye-derush-image-models

## Resumen

Eye Derush image models es una colección de conversiones a Core ML de dos variantes de SigLIP 2, el modelo de visión-lenguaje desarrollado por Google. Los pesos originales proceden de los repositorios de `timm` (`ViT-B-16-SigLIP2-384` y `ViT-L-16-SigLIP2-384`) y han sido convertidos por el usuario sandrophoto para alimentar la aplicación macOS Eye Derush, que permite buscar en material de rodaje (rushes) de vídeo mediante descripciones textuales sin enviar datos a ningún servidor.

El paquete no es un modelo generativo ni un LLM: es un par de codificadores (imagen y texto) que producen embeddings alineados en un espacio común, lo que habilita búsqueda semántica y clasificación de imágenes zero-shot. Cada archivo `.aar` contiene el codificador de imagen, el codificador de texto, el tokenizador y la escala y el sesgo de logit aprendidos, todo en formato Core ML para su ejecución nativa en Apple Silicon.

Su relevancia es práctica: ofrece una vía lista para producción de ejecutar SigLIP 2 en macOS con aceleración por Neural Engine y GPU, sin dependencias de Python ni de servicios en la nube. La licencia Apache 2.0 de los pesos originales se mantiene en la redistribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT de dos torres (codificador de imagen + codificador de texto), familia SigLIP 2 |
| Parametros totales | no disponible (variante medium: ViT-B/16; variante large: ViT-L/16; cifras exactas no publicadas en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de clasificación/búsqueda, no generativo) |
| Tipos de cuantizacion | no disponible (los archivos se distribuyen como Core ML packages; el autor no documenta cuantización explícita) |
| Idiomas soportados | no disponible (el codificador de texto de SigLIP 2 es multilingüe, pero la model card no lo detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | Apple Archive (`.aar`) con Core ML packages (`.mlpackage`), `tokenizer.json` y `model.json` |

## Arquitectura y entrenamiento

SigLIP 2 es la segunda generación del modelo de visión-lenguaje de Google basado en una función de pérdida sigmoidea en lugar de softmax contrastivo (la innovación original de SigLIP). La arquitectura consta de dos torres transformer: un Vision Transformer (ViT-B/16 en la variante medium y ViT-L/16 en la large) que procesa imágenes de 384 px y un codificador de texto, ambos proyectados a un espacio de embeddings compartido. La variante medium produce embeddings de 768 dimensiones y la large de 1024.

Los detalles de entrenamiento de los pesos originales (número de tokens, composición del dataset, fases de RLHF o ajuste fino) no se detallan en la model card de esta conversión; esa información corresponde al modelo base de Google. La aportación técnica de este repositorio es la conversión: los pesos de `open_clip` se transforman a Core ML con `coremltools` y cada conversión se valida contra el modelo PyTorch original comprobando que los embeddings de imágenes y textos de referencia coinciden.

## Capacidades

- Clasificación de imágenes zero-shot: asignar etiquetas textuales arbitrarias a una imagen sin entrenamiento previo.
- Búsqueda semántica de imágenes por descripción textual (text-to-image retrieval) mediante similitud de embeddings.
- Búsqueda inversa imagen-a-imagen y agrupación por similitud visual.
- Extracción de embeddings de imagen (768 o 1024 dimensiones según variante) para indexación vectorial.
- Extracción de embeddings de texto alineados con los de imagen.
- Ejecución totalmente local en macOS con Core ML (Neural Engine, GPU y CPU).
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- Capacidades multilingües del codificador de texto: no documentadas en esta model card.

## Casos de uso

- Búsqueda en rushes de vídeo: la aplicación Eye Derush extrae fotogramas y los indexa con el codificador de imagen; el usuario describe una escena ("primer plano de un coche rojo al atardecer") y el codificador de texto genera la consulta para recuperar los fotogramas más similares.
- Organización de archivos fotográficos: indexar una fototeca local generando embeddings por imagen y permitir búsquedas por concepto, color o composición sin subir nada a la nube.
- Etiquetado automático zero-shot: clasificar imágenes contra un conjunto de etiquetas definidas por el usuario (por ejemplo, categorías de producto o tipos de plano) sin reentrenar el modelo.
- Moderación de contenido local: filtrar imágenes contra descripciones de categorías sensibles en un pipeline on-device, manteniendo la privacidad de los materiales.
- Prototipado de aplicaciones macOS de visión: integrar los `.mlpackage` en apps Swift/SwiftUI mediante Core ML para añadir búsqueda visual sin infraestructura de servidor.
- Deduplicación y clustering visual: usar los embeddings para detectar tomas repetidas o agrupar material por similitud en flujos de postproducción.
- Selección de material en edición: localizar tomas por descripción durante el montaje sin salir del entorno local del editor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que cada conversión se validó comprobando que los embeddings coinciden con los del modelo PyTorch original en imágenes y textos de referencia; no se aportan métricas de recuperación ni latencias.

## Requisitos de hardware

- Entorno objetivo: macOS sobre Apple Silicon (requiere Core ML; la app Eye Derush compila los paquetes para la máquina en la que se ejecuta).
- VRAM/unified memory: no disponible de forma explícita; el repositorio ocupa 2,4 GB y contiene ambas variantes (medium y large), por lo que cada variante individual es sustancialmente menor.
- GPU recomendadas: no aplica el catálogo NVIDIA (A100, H100, RTX 4090); el modelo está pensado para GPU integrada y Neural Engine de chips Apple (series M).
- Cabe en equipos de consumo Apple: sí, al ser un ViT-B/16 y un ViT-L/16 a 384 px en Core ML.
- Opciones de despliegue: Core ML nativo (Vision/Core ML en Swift), coremltools para conversión y validación. No se distribuyen pesos en GGUF, safetensors ni formatos para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Eye Derush image models (esta ficha) | ViT-B/16 y ViT-L/16 | no aplica | Clasificación/búsqueda zero-shot | Apache 2.0 | Core ML (`.aar`) |
| timm/ViT-B-16-SigLIP2-384 | ViT-B/16 | no aplica | Clasificación/búsqueda zero-shot | Apache 2.0 | PyTorch/open_clip en Hugging Face |
| timm/ViT-L-16-SigLIP2-384 | ViT-L/16 | no aplica | Clasificación/búsqueda zero-shot | Apache 2.0 | PyTorch/open_clip en Hugging Face |
| CLIP ViT-B/32 (OpenAI) | ViT-B/32 | no aplica | Clasificación/búsqueda zero-shot | MIT | PyTorch en Hugging Face |

La diferencia principal frente a los modelos de `timm` es el formato: esta conversión prioriza la ejecución nativa en macOS, mientras que los originales requieren Python y `open_clip`. Frente a CLIP, SigLIP 2 incorpora la pérdida sigmoidea y mejoras de la segunda generación, aunque no se aportan cifras comparativas en esta model card.

## Limitaciones y advertencias

- Solo funciona en el ecosistema Apple (Core ML); no es portable a Linux ni a GPU NVIDIA sin reconversión.
- No es un modelo generativo: no produce texto ni respuestas, solo embeddings y puntuaciones de similitud.
- Rendimiento zero-shot dependiente de la formulación de las etiquetas o consultas; el autor no documenta sesgos específicos.
- Riesgo de falsos positivos en búsqueda visual con descripciones ambiguas; no hay métricas publicadas de precisión.
- La model card no detalla la cuantización aplicada en la conversión, lo que dificulta estimar la pérdida de precisión frente al modelo original.
- Cobertura idiomática del codificador de texto no documentada; conviene validar consultas en castellano antes de usarlo en producción.
- Licencia Apache 2.0 permite uso comercial, pero Eye Derush no está afiliada a Google; conviene conservar los avisos de atribución de los pesos originales.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni mantenimiento demostrado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sandrophoto/eye-derush-image-models
- Modelo base medium: https://huggingface.co/timm/ViT-B-16-SigLIP2-384
- Modelo base large: https://huggingface.co/timm/ViT-L-16-SigLIP2-384
