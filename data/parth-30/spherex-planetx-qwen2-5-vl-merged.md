# Parth-30/SPHEREx-PlanetX-Qwen2.5-VL-Merged

## Resumen

SPHEREx-PlanetX-Qwen2.5-VL-Merged es un ajuste fino (fine-tuning) del modelo multimodal Qwen2.5-VL-7B-Instruct, desarrollado por el usuario Parth-30 y publicado en Hugging Face. Parte del checkpoint cuantizado en 4 bits de Unsloth (`unsloth/Qwen2.5-VL-7B-Instruct-bnb-4bit`) y se ha entrenado con las herramientas de Unsloth y la librería TRL de Hugging Face, lo que permite un entrenamiento aproximadamente el doble de rápido y con menor huella de memoria. El resultado es un modelo de tipo image-text-to-text que conserva la arquitectura Qwen2.5-VL y sus pesos fusionados en formato safetensors (8.292 millones de parámetros, 16,6 GB de repositorio).

El modelo hereda las capacidades del Qwen2.5-VL original de Alibaba: procesamiento de imágenes a resolución nativa (hasta 1280×28×28 parches), comprensión de documentos, OCR, razonamiento visual y generación de texto. El nombre "SPHEREx-PlanetX" sugiere un ajuste orientado a un dominio concreto (probablemente astrofísica o datos del telescopio SPHEREx), aunque la model card no documenta el conjunto de datos de entrenamiento ni los objetivos específicos del fine-tuning.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo derivado de escasa difusión (0 descargas, 0 likes en el momento de la consulta), sin benchmarks publicados ni documentación técnica detallada. Es útil como ejemplo de flujo de trabajo de fine-tuning multimodal con Unsloth, pero no debe considerarse un modelo listo para producción sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-VL): encoder visual + LLM decoder |
| Parametros totales | 8.292.166.656 (~8,3 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del Qwen2.5-VL base; no confirmada) |
| Tipos de cuantizacion | no disponible (el modelo base de partida era bnb-4bit; los pesos publicados son safetensors sin cuantizar documentada) |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del Qwen2.5-VL-7B-Instruct, un transformer multimodal que combina un encoder visual con un decodificador de lenguaje. El Qwen2.5-VL original introduce un sistema de resolución dinámica que procesa imágenes a su resolución nativa mediante parches de hasta 1280×28×28, en lugar de reescalar a un recorte fijo de 448 px. El checkpoint de partida fue la versión cuantizada en 4 bits de Unsloth, y el entrenamiento se realizó con Unsloth y TRL, lo que según el autor permitió un entrenamiento 2× más rápido.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni las innovaciones técnicas específicas del ajuste. La model card es mínima y no documenta hiperparámetros, épocas ni métricas de validación. El nombre del modelo sugiere un dominio de aplicación (SPHEREx, un telescopio espacial de la NASA para cartografiar el cielo en el infrarrojo), pero no hay evidencia en la información proporcionada que confirme el contenido del dataset.

## Capacidades

- Generación de texto e image-text-to-text: el pipeline declarado es image-text-to-text, por lo que acepta imágenes y texto como entrada y produce texto.
- Comprensión visual y OCR: hereda del Qwen2.5-VL la capacidad de leer documentos, tablas y texto en imágenes a resolución nativa.
- Razonamiento visual: análisis de imágenes, descripción de escenas y respuesta a preguntas sobre contenido visual.
- Generación de texto conversacional: el modelo base es Instruct, por lo que está optimizado para diálogo multi-turno.
- Capacidades multilingües: la model card declara únicamente inglés (`en`); no se confirma soporte de otros idiomas en este ajuste.
- Tool calling / function calling: no disponible en la información proporcionada para este ajuste concreto (el Qwen2.5-VL base sí lo soporta, pero no se ha verificado en este checkpoint).
- Modo thinking: no disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Análisis de imágenes astronómicas: si el ajuste está orientado al dominio SPHEREx, podría emplearse para describir o clasificar imágenes del cielo infrarrojo; sin documentación del dataset, requiere validación previa.
- Extracción de texto en documentos (OCR): el modelo puede transcribir y estructurar texto de capturas, facturas o páginas escaneadas gracias al encoder visual de Qwen2.5-VL.
- Asistente de análisis de imágenes técnicas: interpretación de diagramas, gráficos y figuras en informes científicos, con salida en inglés.
- Prototipado de aplicaciones multimodales: al ser un checkpoint pequeño (8,3 B) y con licencia Apache 2.0, sirve para experimentar con pipelines image-text-to-text en transformers.
- Generación de descripciones de imágenes para catalogación: etiquetado automático de contenido visual en inglés para bases de datos o archivos.
- Base para nuevos fine-tunings: al estar entrenado con Unsloth y TRL, es un punto de partida reproducible para ajustes de dominio con recursos limitados.
- Educación e investigación: experimentos académicos sobre adaptación de modelos multimodales a dominios científicos concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para este checkpoint. Como referencia, el Qwen2.5-VL-7B en precisión completa requiere del orden de 16-20 GB; en cuantización de 4 bits puede reducirse a ~6-8 GB, aunque no se confirma el formato de cuantización de este repositorio.
- GPU recomendadas: para el modelo de 7B en fp16, una GPU con 24 GB (RTX 3090/4090, A10G) es suficiente; para mayor throughput, A100 40/80 GB o H100.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3090/4090 (24 GB) en fp16, y en GPUs de 8-12 GB si se cuantiza a 4 bits (no verificado para este checkpoint).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `endpoints_compatible`), y previsiblemente vLLM y llama.cpp si se generan pesos GGUF (no confirmado).
- Latencia y throughput: no disponibles. Como referencia del modelo base, la inferencia en CPU puede tardar minutos por imagen; en GPU es viable para producción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SPHEREx-PlanetX-Qwen2.5-VL-Merged | ~8,3 B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Fine-tuning no documentado |
| Qwen2.5-VL-7B-Instruct | ~8,3 B | no disponible en la info | Apache 2.0 | Hugging Face (oficial) | Modelo base, documentación completa |
| Qwen2.5-VL-72B-Instruct | ~72 B | no disponible en la info | Apache 2.0 | Hugging Face (oficial) | Requiere ~40 GB mínimo (2×A100 40GB o 1×H100 80GB) |
| GPT-4o Vision | no disponible | no disponible | Propietaria | API | Comparación cualitativa en OCR mencionada en fuentes web |

## Limitaciones y advertencias

- Documentación mínima: la model card no describe el dataset, los hiperparámetros ni las métricas, por lo que no es posible evaluar la calidad del ajuste sin pruebas propias.
- Riesgo de alucinación: inherente a los modelos generativos; sin benchmarks no se puede acotar su magnitud en este checkpoint.
- Sesgos: no documentados; se heredan los del modelo base y los del dataset de ajuste (desconocido).
- Idioma: la model card declara únicamente inglés; el uso en castellano no está garantizado.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar también las condiciones del modelo base de Alibaba.
- Escasa adopción: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación por terceros.
- Contexto: no se confirma la longitud de contexto efectiva de este checkpoint; no asumir la del modelo base sin verificación.
- Formato: los pesos son safetensors; no se ofrecen versiones GGUF ni cuantizadas listas para usar.

## Enlaces

- Hugging Face: https://huggingface.co/Parth-30/SPHEREx-PlanetX-Qwen2.5-VL-Merged
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen2.5-VL-7B-Instruct-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- Guía de despliegue de Qwen2.5-VL: https://markaicode.com/deploy-qwen25-vl-vision-language-model-local/
- Guía de tareas visuales con Qwen2.5-VL: https://markaicode.com/qwen25-vl-multimodal-vision-tasks-image-analysis/
