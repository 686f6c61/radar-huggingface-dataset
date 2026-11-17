# Djisgod/flowsat-c-35k

## Resumen

FlowSat-C-35k es un modelo de generación de imágenes a partir de texto (text-to-image) especializado en imágenes de teledetección por satélite. Lo publica el usuario Djisgod en Hugging Face bajo una licencia de tipo "research-preview" y con acceso restringido (gated), lo que obliga a aceptar condiciones antes de descargarlo. El modelo está entrenado sobre el conjunto de datos fMoW (Functional Map of the World), un corpus de referencia en el ámbito de la teledetección para clasificación y descripción de escenas satelitales.

El nombre "35k" sugiere un entrenamiento sobre 35.000 muestras, y el sufijo "C" podría indicar una variante concreta dentro de una familia de modelos (no confirmado en la información disponible). El repositorio ocupa 13,6 GB, un tamaño compatible con un modelo de difusión de escala media, aunque no se especifica la arquitectura exacta ni el número de parámetros.

La relevancia de este modelo radica en su nicho: la generación condicionada de imágenes satelitales es útil para aumento de datos sintéticos, simulación de escenarios y entrenamiento de pipelines de visión por computador en dominios con escasez de datos etiquetados. No obstante, la ausencia de documentación técnica detallada, benchmarks y métricas de calidad limita seriamente su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | research-preview (acceso restringido, gated) |
| Formato de pesos | no disponible (tamaño del repo: 13,6 GB) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo en la información disponible. Por la tarea declarada (text-to-image) y el tamaño del repositorio (13,6 GB), es plausible que se trate de un modelo de difusión (posiblemente basado en Stable Diffusion o una variante similar), pero esto no está confirmado. Tampoco se detallan el número de parámetros, el tipo de encoder de texto, el scheduler de difusión ni la resolución nativa de generación.

Respecto a los datos de entrenamiento, la única referencia es el dataset fMoW (Functional Map of the World), que contiene imágenes satelitales multiespectrales y de alta resolución con anotaciones de categorías funcionales de uso del suelo. El sufijo "35k" apunta a un subconjunto de aproximadamente 35.000 muestras, pero se desconoce la composición exacta, el proceso de filtrado, si hubo captioning automático o manual, y si se aplicaron técnicas de RLHF, DPO o fine-tuning supervisado. No hay información sobre innovaciones técnicas como decodificación especulativa, atención lineal o destilación.

## Capacidades

- Generación de imágenes satelitales a partir de descripciones textuales, orientada al dominio de teledetección.
- Condicionamiento sobre escenas de fMoW, lo que sugiere capacidad para reproducir categorías funcionales de uso del suelo (zonas residenciales, industriales, agrícolas, etc.).
- Pipeline declarado como text-to-image en Hugging Face.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-step (no aplicable a un modelo de difusión).
- Capacidades multilingües: no disponibles; se desconoce si el encoder de texto soporta idiomas distintos del inglés.
- No se documentan modos especiales como thinking, visión de entrada, audio ni control por imagen (image-to-image, inpainting, ControlNet).

## Casos de uso

- Aumento de datos sintéticos para entrenamiento de clasificadores de uso del suelo: generar imágenes satelitales etiquetadas por prompt para equilibrar clases minoritarias en datasets de teledetección, aprovechando el condicionamiento sobre categorías de fMoW.
- Simulación de escenarios urbanos y agrícolas: producir imágenes de escenas con características controladas (densidad de edificios, tipo de cultivo) para pruebas de algoritmos de detección de cambios.
- Prototipado de interfaces de búsqueda visual: generar ejemplos de consulta para validar sistemas de recuperación de imágenes satelitales por descripción textual.
- Investigación en generación condicionada de dominio específico: estudiar cómo los modelos de difusión generalistas se adaptan a distribuciones visuales muy distintas de las fotografías naturales (vista cenital, resoluciones, bandas espectrales).
- Educación y divulgación: crear ilustraciones de escenas satelitales para materiales docentes sobre teledetección sin depender de imágenes reales con restricciones de uso.
- Evaluación de robustez de modelos de visión: usar las imágenes generadas como conjunto de prueba adversarial para medir la sensibilidad de clasificadores satelitales a artefactos sintéticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. El tamaño del repositorio (13,6 GB) sugiere que los pesos en precisión completa o fp16 podrían requerir del orden de 14-16 GB de VRAM, pero se desconoce el número de parámetros y el formato de pesos.
- GPU recomendadas: no disponibles. Si se confirma que es un modelo de difusión de escala media, una RTX 4090 (24 GB) o una A100 (40/80 GB) serían opciones razonables, pero esto es especulativo.
- Compatibilidad con GPU de consumo: no confirmada; depende del formato de pesos (si se publican variantes GGUF o fp16) y de la resolución de generación.
- Opciones de despliegue: no documentadas. No se confirma soporte para vLLM (no aplicable a difusión), llama.cpp, Ollama ni TGI. Para difusión, las opciones habituales serían `diffusers` o ComfyUI, pero no hay confirmación en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. Los modelos de generación text-to-image especializados en teledetección son escasos y no se han identificado alternativas directas en la información proporcionada. Como referencia cualitativa, los modelos generalistas de difusión (Stable Diffusion, FLUX) no están entrenados en dominios satelitales y requerirían fine-tuning para esta tarea, pero no se dispone de datos comparativos de rendimiento con FlowSat-C-35k.

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FlowSat-C-35k | no disponible | no disponible | Teledetección (fMoW) | research-preview | Gated en HF |
| Alternativas especializadas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se especifican arquitectura, parámetros, datos de entrenamiento ni proceso de entrenamiento, lo que impide evaluar su calidad de forma objetiva.
- Sin benchmarks ni métricas publicadas (FID, CLIP score, precisión de categoría), por lo que no hay evidencia de que las imágenes generadas sean fieles a los prompts ni realistas en el dominio satelital.
- Licencia "research-preview" con acceso gated: el uso comercial está probablemente restringido o sujeto a condiciones adicionales que deben revisarse antes de cualquier despliegue en producción.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir escenas plausibles pero inexistentes, lo que es especialmente problemático si se usan como datos de entrenamiento sin validación.
- Sesgos potenciales derivados del dataset fMoW: sobrerrepresentación de ciertas regiones geográficas, tipos de uso del suelo y condiciones de iluminación, que pueden trasladarse a las imágenes generadas.
- Idiomas soportados desconocidos: si el encoder de texto está entrenado solo en inglés, los prompts en castellano podrían degradar la calidad de generación.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación por terceros.
- Fecha de creación futura (2026-11-17) en los metadatos: conviene verificar la autenticidad y vigencia del repositorio antes de confiar en él.

## Enlaces

- Hugging Face: https://huggingface.co/Djisgod/flowsat-c-35k
- Dataset fMoW (referencia del dominio): no se proporciona enlace directo en la información disponible.
- Paper o blog del modelo: no disponible.
- Repositorio de código: no disponible.
- Demo: no disponible.
