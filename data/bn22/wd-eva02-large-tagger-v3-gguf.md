# bn22/wd-eva02-large-tagger-v3-gguf

## Resumen

El modelo `bn22/wd-eva02-large-tagger-v3-gguf` es una conversión al formato GGUF del etiquetador (tagger) WD EVA02-Large v3, un modelo especializado en el etiquetado automático de imágenes para el ecosistema de modelos de difusión (Stable Diffusion y derivados). No es un modelo generativo de lenguaje, sino un clasificador multi-etiqueta que asigna tags descriptivos a imágenes, tarea habitual en la preparación de datasets de entrenamiento y en el filtrado de contenido.

La arquitectura de origen es EVA02-Large, un Vision Transformer (ViT) de tipo transformer con atención, adaptado como cabeza de clasificación multi-etiqueta sobre el vocabulario de tags de WD (Danbooru). El modelo cuenta con unos 315 millones de parámetros (315.191.857 según los safetensors del repositorio) y el repositorio GGUF ocupa aproximadamente 0,6 GB.

La relevancia de esta publicación es acotada: se trata de una conversión de formato realizada por el usuario `bn22`, publicada bajo licencia Apache 2.0, con cero descargas y cero likes en el momento de la consulta. La model card original no aporta información técnica adicional más allá de la licencia. Es útil para quien quiera ejecutar el tagger en entornos con llama.cpp u otros runtimes GGUF sin depender de PyTorch, pero no debe confundirse con un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (EVA02-Large) con cabeza de clasificación multi-etiqueta |
| Parametros totales | 315.191.857 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (formato GGUF; cuantizaciones concretas no especificadas) |
| Idiomas soportados | no disponible (los tags del vocabulario están mayoritariamente en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 0,6 GB); safetensors en el modelo original |

## Arquitectura y entrenamiento

El modelo subyacente es EVA02-Large, un Vision Transformer con atención estándar entrenado con el objetivo de clasificación multi-etiqueta sobre el vocabulario de tags de WD (Danbooru). La versión "v3" del tagger es la iteración más reciente de esta familia, pensada para producir etiquetas con puntuaciones de confianza por tag. El repositorio consultado no documenta el número de tokens de imagen, la composición exacta del dataset ni si hubo etapas de ajuste fino con RLHF o DPO; esa información no está disponible en la model card.

La innovación de esta publicación concreta es la conversión a GGUF, que permite ejecutar el tagger fuera del stack de PyTorch (por ejemplo con llama.cpp), reduciendo dependencias y facilitando el despliegue en CPU o en GPUs modestas. No se documentan detalles del proceso de conversión, de la tokenización de imágenes ni de las cuantizaciones concretas incluidas en el repositorio.

## Capacidades

- Etiquetado multi-etiqueta de imágenes: asigna tags del vocabulario WD/Danbooru con puntuaciones de confianza.
- Clasificación de contenido visual para curación de datasets de difusión.
- Detección de tags de personajes, atributos, estilo y composición propios del vocabulario de Danbooru.
- Ejecución en formato GGUF mediante runtimes compatibles, sin necesidad de PyTorch.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es un clasificador, no un LLM.
- Capacidades multilingües: no disponibles; el vocabulario de tags está en inglés.
- No se documentan modos especiales (thinking, visión generativa, audio).

## Casos de uso

- Preparación de datasets para fine-tuning de Stable Diffusion: el tagger recorre un directorio de imágenes y genera ficheros de caption con tags normalizados, reduciendo el trabajo manual de etiquetado.
- Filtrado y curación de datasets: se pueden descartar imágenes que no contienen los tags objetivo (por ejemplo, filtrar por personaje, estilo o contenido no deseado) usando los umbrales de confianza del clasificador.
- Búsqueda y organización de bibliotecas de imágenes: indexar una colección por tags generados automáticamente para habilitar búsquedas por atributos visuales.
- Moderación de contenido: detectar categorías de tags sensibles con las puntuaciones del modelo y aplicar políticas de revisión.
- Despliegue ligero en CPU: al estar en GGUF, puede ejecutarse en servidores sin GPU para procesar lotes de imágenes en pipelines batch.
- Integración en herramientas de anotación: preetiquetar imágenes en interfaces de revisión humana, donde el anotador solo corrige las etiquetas propuestas.
- Evaluación de modelos generativos: comparar los tags del tagger sobre imágenes generadas frente a los tags del prompt para medir fidelidad semántica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 315 millones de parámetros y pesos en FP16 el modelo ronda los 0,6 GB, por lo que la inferencia en CPU es viable.
- GPU recomendadas: no especificadas; por tamaño, cualquier GPU con al menos 2-4 GB de VRAM debería ser suficiente, aunque no hay datos publicados que lo confirmen.
- Cabe en GPU de consumo: previsiblemente sí (RTX 3060, RTX 4060 y superiores), aunque no hay validación publicada.
- Opciones de despliegue: llama.cpp y runtimes compatibles con GGUF; el modelo original en safetensors requiere PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bn22/wd-eva02-large-tagger-v3-gguf | 315 M | Etiquetado de imágenes | GGUF | Apache 2.0 | Hugging Face |
| WD EVA02-Large Tagger v3 (original) | ~315 M | Etiquetado de imágenes | safetensors | no disponible en esta ficha | Hugging Face |
| WD ViT-Large Tagger v2 | no disponible | Etiquetado de imágenes | safetensors | no disponible en esta ficha | Hugging Face |

La comparativa con alternativas de la misma categoría es limitada porque la información proporcionada no incluye datos de rendimiento ni de licencia de los modelos originales. No se dispone de benchmarks que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Es un clasificador de imágenes, no un modelo de lenguaje: no genera texto ni mantiene conversaciones.
- El vocabulario de tags está sesgado hacia el dominio Danbooru (ilustración y anime); su precisión en fotografía real o dominios especializados no está documentada.
- Riesgo de etiquetas falsas positivas o negativas según el umbral de confianza elegido; requiere calibración por caso de uso.
- No hay información sobre sesgos demográficos o de contenido más allá del sesgo inherente del corpus de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo original y sus datos de entrenamiento pueden tener condiciones adicionales no reflejadas en esta conversión.
- Repositorio con cero descargas y sin documentación técnica: no hay garantías de mantenimiento ni de calidad de la conversión GGUF.
- No se documentan las cuantizaciones incluidas ni la compatibilidad verificada con versiones concretas de llama.cpp.

## Enlaces

- Hugging Face: https://huggingface.co/bn22/wd-eva02-large-tagger-v3-gguf
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
