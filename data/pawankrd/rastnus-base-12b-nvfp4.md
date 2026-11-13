# PawanKrd/RastNus-Base-12B-NVFP4

## Resumen

RastNus-Base-12B-NVFP4 es la versión cuantizada en NVFP4 de RastNus-Base-12B, un modelo de lenguaje de 12.000 millones de parámetros especializado en corrección gramatical, ortográfica y de puntuación para kurdo central (sorani, código `ckb`). Lo desarrolla PawanKrd partiendo del modelo base google/gemma-4-12b, y está publicado bajo licencia Apache 2.0. El repositorio contiene únicamente los pesos cuantizados (formato compressed-tensors, 8 bits según los tags de Hugging Face, con empaquetado NVFP4) pensados para servir el modelo con vLLM de forma eficiente en memoria.

El problema que aborda es la escasez de herramientas NLP para kurdo, una de las lenguas con menor cobertura en el ecosistema de modelos abiertos. En sorani escrito es habitual encontrar inconsistencias ortográficas (letras diacríticas omitidas como ی/ێ, و/ۆ o ر/ڕ), errores de espaciado, puntuación informal y mezcla de préstamos léxicos. RastNus se plantea como un corrector específico para ese dominio.

La relevancia actual del modelo es doble: por un lado, cubre una lengua de bajos recursos con un modelo derivado de una familia reciente (Gemma 4); por otro, la variante NVFP4 facilita el despliegue en GPUs con memoria limitada manteniendo el pipeline de `transformers` y la compatibilidad con endpoints. El modelo base declarado tiene 11.959.757.104 parámetros reales según los safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4, tag `gemma4_unified`); multimodal image-text-to-text según los tags del repo |
| Parametros totales | 11.959.757.104 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (pesos cuantizados en 4 bits con empaquetado NVFP4; tags indican 8-bit y compressed-tensors) |
| Idiomas soportados | kurdo central / sorani (`ckb`) |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 en la model card) |
| Formato de pesos | safetensors (compressed-tensors), compatible con `transformers` y vLLM |

## Arquitectura y entrenamiento

El modelo es una adaptación del transformer google/gemma-4-12b. La model card lo etiqueta como `gemma4_unified` y `image-text-to-text`, lo que sugiere que la arquitectura base conserva capacidades multimodales de entrada (imagen y texto), aunque el propósito declarado del modelo es la generación y corrección de texto en kurdo central. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset de ajuste ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica destacable de este repositorio concreto es la cuantización NVFP4 con `compressed-tensors`, orientada a servir el modelo con vLLM reduciendo el uso de memoria respecto a los pesos en bf16. El repositorio ocupa 11,7 GB, coherente con un modelo de ~12B cuantizado a 4 bits más metadatos. No se detallan en la información proporcionada detalles sobre decodificación especulativa, atención lineal ni otras optimizaciones internas del modelo base.

## Capacidades

- Corrección gramatical en kurdo central (sorani): identificación y corrección de errores de concordancia y morfología.
- Corrección ortográfica: restitución de letras diacríticas ausentes o mal empleadas (ی/ێ, و/ۆ, ر/ڕ) y de grafías inconsistentes.
- Restauración de puntuación: inserción y normalización de signos de puntuación en texto informal.
- Normalización de espaciado y de préstamos léxicos mezclados.
- Generación de texto conversacional (`text-generation`, tag `conversational`).
- Entrada multimodal imagen-texto según los tags del repositorio (no se detalla el alcance práctico de esta capacidad en la model card).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al kurdo central según la declaración de idiomas del repositorio.

## Casos de uso

- Corrección de textos administrativos en sorani: el modelo reescribe documentos oficiales eliminando errores ortográficos y de puntuación, un escenario donde la consistencia formal es crítica y donde los correctores genéricos no cubren el kurdo.
- Pretratamiento de corpus para NLP: normalizar texto kurdo extraído de redes sociales antes de usarlo en entrenamiento de modelos o en análisis lingüístico, reduciendo la varianza ortográfica del corpus.
- Edición y publicación digital: integración en un editor de texto o CMS para sugerir correcciones en artículos y noticias en kurdo central antes de publicar.
- Herramientas educativas: asistencia a estudiantes de sorani en la detección de errores gramaticales y en el uso correcto de diacríticos, con explicaciones o reescrituras del texto.
- Moderación y limpieza de contenido generado por usuarios: normalización de comentarios y mensajes en kurdo para facilitar su indexación, búsqueda y análisis de sentimiento.
- Digitalización de patrimonio documental: corrección y normalización de transcripciones OCR de textos en sorani, donde los errores de reconocimiento se suman a las inconsistencias ortográficas originales.
- Servicio de inferencia de bajo coste: al estar cuantizado en NVFP4 y ser compatible con vLLM, puede desplegarse como endpoint de corrección para aplicaciones que necesiten baja latencia y memoria contenida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos NVFP4 ocupan aproximadamente 11,7 GB en el repositorio; en la práctica se recomienda reservar entre 14 y 18 GB de VRAM para pesos, caché KV y overhead del runtime, aunque la cifra exacta depende de la longitud de contexto y del backend.
- GPU recomendadas: NVIDIA H100, A100 (80 GB) o L40S para producción con concurrencia; GPUs con soporte de FP4 nativo (arquitecturas Blackwell, como B200 o RTX 50) aprovechan mejor el formato NVFP4.
- GPU de consumo: una RTX 4090 (24 GB) o RTX 3090 (24 GB) debería poder alojar los pesos, si bien el soporte de NVFP4 en estas arquitecturas no es nativo y puede requerir emulación o kernels específicos; no hay datos confirmados en la información disponible.
- Opciones de despliegue: vLLM es el backend indicado explícitamente en la model card; también es compatible con `transformers`. Soporte de llama.cpp u Ollama para este formato: no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| RastNus-Base-12B-NVFP4 | ~12B | no disponible | ckb | Apache 2.0 | safetensors NVFP4 |
| google/gemma-4-12b (base) | ~12B | no disponible | multilingüe (no detallado) | licencia Gemma 4 | safetensors bf16 |
| RastNus-Base-12B (sin cuantizar) | ~12B | no disponible | ckb | Apache 2.0 | safetensors |
| Correctores ortográficos específicos de kurdo (p. ej. Hunspell/reglas) | n/a | n/a | ckb | variable | reglas léxicas |

La comparación con modelos especializados en corrección de kurdo fuera del ecosistema de pesos neuronales es limitada: las alternativas tradicionales son correctores basados en reglas o diccionarios, con menor capacidad de manejar contexto y desambiguación. Frente a su modelo base Gemma 4 12B, RastNus aporta el ajuste específico para sorani a cambio de perder cobertura multilingüe general. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en kurdo central; su rendimiento en otros idiomas o en kurdo kurmanji no está garantizado ni documentado.
- Riesgo de alucinación: como todo modelo generativo, puede introducir cambios no solicitados en el texto, alterar el significado original o inventar correcciones en pasajes ambiguos.
- No hay información publicada sobre sesgos, datos de entrenamiento ni evaluación de calidad de las correcciones, lo que dificulta auditar su comportamiento en producción.
- La cuantización NVFP4 puede degradar ligeramente la calidad respecto a los pesos originales; no se han publicado comparativas de calidad entre ambas versiones.
- Aunque la licencia del repositorio es Apache 2.0, la model card enlaza la licencia de Gemma 4; conviene revisar los términos de dicha licencia antes de un uso comercial, ya que pueden imponer restricciones adicionales sobre el modelo derivado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria ni informes de uso en producción.
- La longitud de contexto no está documentada, lo que impide planificar su uso en documentos largos sin pruebas previas.
- El pipeline declarado es `text-generation` pero los tags incluyen `image-text-to-text`; la naturaleza multimodal de la entrada no está descrita en la model card y no debería asumirse sin verificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PawanKrd/RastNus-Base-12B-NVFP4
- Modelo base sin cuantizar: https://huggingface.co/PawanKrd/RastNus-Base-12B
- Modelo base original: https://huggingface.co/google/gemma-4-12b
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Sitio del autor: https://pawan.krd
- Perfil del autor en Hugging Face: https://huggingface.co/PawanKrd
