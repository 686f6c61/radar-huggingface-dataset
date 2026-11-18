# khaleddiab/research-assistant-gemma4-12b-rewrite-v2b-GGUF

## Resumen

research-assistant-gemma4-12b-rewrite-v2b-GGUF es un ajuste fino (fine-tuning) del modelo Gemma 4 de 12B de parámetros, publicado por el usuario khaleddiab en Hugging Face. El modelo está orientado a tareas de asistente de investigación, según indica su nombre, y se distribuye exclusivamente en formato GGUF para su uso con llama.cpp. El repositorio incluye un archivo cuantizado en Q4_K_M y un proyector multimodal (mmproj) en F16, lo que confirma que se trata de un modelo de visión-lenguaje.

El modelo cuenta con 11.907.350.576 parámetros totales (aproximadamente 11,9B), lo que lo sitúa en la gama de modelos densos de tamaño medio, adecuado para despliegue en hardware de consumo con cuantización. La arquitectura subyacente es Gemma 4, etiquetada en los metadatos como `gemma4_unified`, y el ajuste se realizó con la herramienta Unsloth, que acelera el entrenamiento y la conversión a GGUF.

La relevancia de este modelo es limitada en el momento de la ficha: no tiene descargas ni likes, la licencia no está especificada y no se han publicado resultados de benchmarks ni detalles sobre el dataset de entrenamiento. Es, por tanto, un modelo experimental de un autor individual, no un lanzamiento oficial de Google DeepMind.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4, `gemma4_unified`), visión-lenguaje |
| Parámetros totales | 11.907.350.576 (~11,9B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_M (archivo principal), F16 (proyector multimodal mmproj) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 4, un transformer denso de aproximadamente 11,9B de parámetros. La etiqueta `gemma4_unified` en los metadatos sugiere una variante unificada del modelo base de Google, y la presencia de un archivo `mmproj` en F16 confirma que conserva capacidades de visión-lenguaje, es decir, que acepta imágenes como entrada además de texto.

El ajuste fino se realizó con Unsloth, según la model card, que también indica que el entrenamiento fue "2x más rápido" gracias a esta herramienta. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similar. Tampoco se detalla la innovación técnica del ajuste ni la naturaleza exacta de la tarea "rewrite" que aparece en el nombre del modelo. Toda esta información se considera no disponible.

## Capacidades

- Generación de texto conversacional, orientada a tareas de asistencia de investigación.
- Procesamiento de imágenes (visión-lenguaje), confirmado por el archivo `mmproj` y la etiqueta `vision-language-model`.
- Ejecución mediante llama.cpp, tanto en modo texto (`llama-cli`) como multimodal (`llama-mtmd-cli`).
- Soporte de plantillas de chat mediante la opción `--jinja`.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Capacidades de tool calling, agentes o razonamiento multi-paso: no disponibles.
- Capacidades multilingües: no disponibles.
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- Asistente de investigación documental: el modelo puede recibir imágenes de documentos o figuras junto con texto y generar resúmenes o reescrituras, aprovechando su naturaleza multimodal y su orientación a tareas de investigación.
- Reescritura de textos académicos: el sufijo "rewrite" del nombre sugiere que el ajuste se orientó a reformular contenido; podría usarse para reescribir borradores manteniendo el significado.
- Extracción de información de figuras y tablas: al aceptar imágenes, puede describir o interpretar gráficos incluidos en artículos científicos.
- Despliegue local en estaciones de trabajo: al estar en GGUF Q4_K_M, puede ejecutarse en equipos sin GPU dedicada de gama alta mediante llama.cpp.
- Prototipado rápido de asistentes conversacionales: la compatibilidad con `llama-cli` y plantillas Jinja facilita integrarlo en scripts de prueba.
- Análisis de documentos escaneados en flujos de investigación: combinación de OCR previo y entrada de imagen al modelo para tareas de comprensión.
- Experimentación académica con modelos ajustados: útil para investigadores que quieran comparar un fine-tuning comunitario frente al Gemma 4 base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M de un modelo de ~11,9B ocupa aproximadamente 7,5 GB (tamaño total del repo), por lo que se necesitan al menos 8 GB de VRAM o memoria unificada para cargarlo, más overhead del contexto.
- GPU recomendadas: no disponibles de forma oficial; por tamaño, una RTX 3060 de 12 GB, RTX 4070, RTX 4090 o superiores podrían ejecutarlo en Q4_K_M. Para F16 del proyector multimodal se requiere memoria adicional.
- Cabe en GPU de consumo: sí, en modelos con 8-12 GB o más de VRAM en cuantización Q4_K_M.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), y por extensión cualquier frontend compatible con GGUF como Ollama o LM Studio, aunque no se confirma soporte explícito.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| research-assistant-gemma4-12b-rewrite-v2b-GGUF | ~11,9B | No disponible | No disponible | GGUF | Fine-tuning comunitario de Gemma 4 |
| Gemma 4 12B (base oficial) | ~12B | No disponible | No disponible | Safetensors, GGUF | Modelo original de Google DeepMind |
| Alternativas de tamaño similar | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables verificados |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; es imprescindible contactar con el autor o consultar la licencia del modelo base Gemma 4 antes de usarlo en producción.
- Modelo con cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad ni de pruebas independientes.
- Sin benchmarks publicados: se desconoce su rendimiento real frente al Gemma 4 base y frente a alternativas.
- Dataset de entrenamiento no documentado: riesgo de sesgos desconocidos y de sobreajuste a la tarea de "reescritura" para la que fue ajustado.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado por la falta de evaluación publicada.
- Idiomas soportados no confirmados: no se garantiza un rendimiento adecuado en castellano.
- Contexto máximo no documentado: no se puede planificar su uso en tareas de contexto largo.
- El ajuste fino comunitario puede degradar capacidades del modelo base (olvido catastrófico) sin que se haya documentado.
- Fecha de creación futura (2026-11-18) en los metadatos: posible inconsistencia que conviene verificar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/khaleddiab/research-assistant-gemma4-12b-rewrite-v2b-GGUF
- Unsloth (herramienta de entrenamiento y conversión): https://github.com/unslothai/unsloth
- llama.cpp (runtime de inferencia): no se proporciona enlace en la información disponible
- Paper o blog del modelo: no disponible
- Demo: no disponible
