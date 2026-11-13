# PawanKrd/RastNus-Small-5B-NVFP4

## Resumen

RastNus-Small-5B-NVFP4 es la versión cuantizada en NVFP4 del modelo RastNus-Small-5B, un modelo de lenguaje especializado en corrección gramatical, ortográfica y de puntuación para kurdo central (sorani, código `ckb`). Lo desarrolla PawanKrd partiendo de Google Gemma 4 E2B y está pensado para servir con vLLM en producción, aprovechando el formato de compresión NVFP4 de 4 bits para reducir el coste de inferencia.

El modelo aborda un problema concreto y poco cubierto en NLP: el kurdo sorani es una lengua con escasa representación en modelos modernos y con una ortografía cotidiana plagada de inconsistencias (letras diacríticas omitidas como ی/ێ, و/ۆ o ر/ڕ, errores de espaciado, puntuación informal y mezcla de préstamos). RastNus se plantea como una herramienta de normalización de texto para ese idioma.

La ficha se basa en los metadatos del repositorio de Hugging Face y en la model card del autor, que está truncada: no hay información publicada sobre contexto, datos de entrenamiento, benchmarks ni detalles de la cuantización más allá de la etiqueta. El repositorio declara 5.104.371.011 parámetros en safetensors y un tamaño de 8,0 GB, aunque la model card describe el modelo como de ~2B parámetros efectivos, lo que sugiere una arquitectura con parámetros totales y activos distintos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Google Gemma 4 E2B (detalles de la arquitectura base no disponibles) |
| Parametros totales | 5.104.371.011 (según safetensors) |
| Parametros activos | ~2B efectivos según la model card (no se detalla el mecanismo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, formato `compressed-tensors`); no se detallan otros formatos |
| Idiomas soportados | kurdo central / sorani (`ckb`) |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (cuantización NVFP4, `compressed-tensors`) |

## Arquitectura y entrenamiento

El modelo se presenta como una adaptación de Google Gemma 4 E2B, una arquitectura de la familia Gemma 4 con 5.104.371.011 parámetros totales y aproximadamente 2B parámetros efectivos según la model card. La discrepancia entre parámetros totales y efectivos apunta a una arquitectura con activación selectiva o compartición de parámetros, pero el autor no documenta el mecanismo. La versión NVFP4 aplica cuantización de 4 bits mediante el formato `compressed-tensors`, orientada a servir el modelo con vLLM.

No hay información publicada sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales. La model card menciona que el modelo está especializado en corrección de gramática, ortografía y puntuación del sorani, y que el ajuste parte de Gemma 4 E2B, pero el texto disponible está truncado antes de detallar el proceso de entrenamiento.

## Capacidades

- Corrección gramatical de texto en kurdo central (sorani).
- Corrección ortográfica, incluyendo letras diacríticas del alfabeto kurdo (ی/ێ, و/ۆ, ر/ڕ).
- Restauración de puntuación en textos informales o sin puntuar.
- Normalización de espaciado y de uso de préstamos léxicos.
- Generación de texto conversacional (pipeline declarado: `text-generation`).
- Procesamiento image-text-to-text según las etiquetas del repositorio, aunque no se detalla la capacidad multimodal.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al kurdo central según los metadatos; no se declaran otros idiomas.

## Casos de uso

- Corrección de textos periodísticos en sorani: el modelo puede recibir un artículo redactado por un periodista y devolver la versión con ortografía y puntuación normalizadas, reduciendo el trabajo de edición en medios que publican en kurdo central.
- Normalización de contenido generado por usuarios: en foros, redes sociales o comentarios, el modelo puede limpiar el texto antes de indexarlo o moderarlo, corrigiendo diacríticos omitidos y puntuación informal.
- Preprocesado para pipelines de NLP en kurdo: servir como paso previo de normalización ortográfica antes de tareas de traducción automática, análisis de sentimiento o búsqueda, donde la variabilidad ortográfica degrada los resultados.
- Herramienta de escritura asistida: integración en editores de texto o correctores para hablantes de sorani que necesitan revisar documentos administrativos o académicos.
- Digitalización y limpieza de corpus: procesar transcripciones y textos OCR en sorani para estandarizar la ortografía antes de incorporarlos a un corpus de entrenamiento o a un archivo digital.
- Despliegue de bajo coste con vLLM: al estar cuantizado en NVFP4, puede servirse en infraestructura con GPUs de gama media para dar servicio a una API interna de corrección de texto en kurdo, con menor huella de memoria que la versión en precisión completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 8,0 GB, lo que da una referencia del peso en disco de los pesos NVFP4.
- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del repositorio, se sitúa en el entorno de los 8-10 GB para pesos, más overhead de KV cache y activaciones.
- GPU recomendadas: no especificadas por el autor; el formato NVFP4 está orientado a servir con vLLM en GPUs con soporte de cuantización de 4 bits (familias Blackwell y Ada de NVIDIA, según el soporte de NVFP4 en vLLM).
- Compatibilidad con GPU de consumo: no confirmada; requiere hardware con soporte NVFP4.
- Opciones de despliegue: vLLM es el destino declarado por el autor; no se documentan llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RastNus-Small-5B-NVFP4 | 5,1B totales / ~2B efectivos | no disponible | ckb | Apache 2.0 | Hugging Face |
| RastNus-Small-5B (versión sin cuantizar) | 5,1B totales / ~2B efectivos | no disponible | ckb | Apache 2.0 | Hugging Face |
| google/gemma-4-E2B (modelo base) | ~2B efectivos | no disponible | multilingüe (no detallado) | licencia Gemma 4 | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas especializadas en corrección de kurdo central.

## Limitaciones y advertencias

- La model card está truncada: no se documentan datos de entrenamiento, evaluación ni limitaciones declaradas por el autor.
- Especialización monoidioma: solo se declara kurdo central (`ckb`); su uso en otros idiomas no está validado.
- Riesgo de alucinación inherente a los modelos generativos: puede introducir cambios no solicitados en el texto corregido.
- Sesgos: no documentados; al entrenarse sobre una lengua con variación dialectal y ortográfica, puede favorecer una norma concreta del sorani.
- Longitud de contexto desconocida: limita la corrección de documentos largos sin fragmentación previa.
- La cuantización NVFP4 puede degradar ligeramente la calidad respecto a la versión sin cuantizar; no hay evaluación publicada de esa diferencia.
- La licencia Apache 2.0 convive con el enlace a la licencia de Gemma 4 del modelo base; conviene revisar las condiciones de uso comercial derivadas del modelo original de Google.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni informes de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PawanKrd/RastNus-Small-5B-NVFP4
- Versión sin cuantizar: https://huggingface.co/PawanKrd/RastNus-Small-5B
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- Perfil del autor: https://huggingface.co/PawanKrd
- Sitio del autor: https://pawan.krd
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
