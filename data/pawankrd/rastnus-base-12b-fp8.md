# PawanKrd/RastNus-Base-12B-FP8

## Resumen

RastNus-Base-12B-FP8 es la versión cuantizada en FP8 de RastNus-Base-12B, un modelo de lenguaje de 12 mil millones de parámetros especializado en corrección gramatical, ortográfica y de puntuación en kurdo central (sorani, código `ckb`). Lo desarrolla PawanKrd y parte de `google/gemma-4-12b` como modelo base, sobre el que se ha realizado un ajuste específico para la tarea de corrección de texto en una de las lenguas con menor cobertura en el ecosistema NLP actual.

El modelo aborda un problema muy concreto: el sorani escrito cotidiano presenta inconsistencias ortográficas frecuentes (letras diacríticas omitidas como ی/ێ, و/ۆ, ر/ڕ, errores de espaciado, puntuación informal y uso mezclado de préstamos). RastNus está entrenado para tomar texto bruto y devolver una versión corregida, lo que lo convierte en una herramienta de post-procesado lingüístico para editores, plataformas de contenido y pipelines de normalización de texto kurdo.

La variante FP8 está pensada para despliegue eficiente en memoria con vLLM, reduciendo el peso del repositorio a 13,1 GB frente a los aproximadamente 24 GB que ocuparía en BF16. El modelo conserva la licencia Apache 2.0 del repositorio, aunque el modelo base Gemma 4 remite a la licencia propia de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (gemma4_unified), basada en google/gemma-4-12b |
| Parametros totales | 11.959.757.104 (≈12B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (compressed-tensors); el modelo base sin cuantizar está disponible por separado |
| Idiomas soportados | kurdo central / sorani (ckb) |
| Licencia | Apache 2.0 (repo); el modelo base remite a la licencia de Gemma 4 de Google |
| Formato de pesos | safetensors (FP8, compressed-tensors) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only derivado de Gemma 4 12B, empaquetado con la etiqueta `gemma4_unified` y con capacidad declarada de `image-text-to-text` en los tags, aunque la tarea principal del modelo es la generación y corrección de texto. La variante FP8 utiliza el formato `compressed-tensors` para almacenar los pesos en precisión de 8 bits, lo que permite servir el modelo con menor huella de memoria.

No se dispone de información detallada sobre el proceso de ajuste: no se especifican el número de tokens de entrenamiento, la composición del dataset de corrección, ni si se emplearon técnicas de RLHF, DPO o SFT supervisado. Tampoco se documentan innovaciones técnicas adicionales más allá de la cuantización FP8 orientada a servir con vLLM.

## Capacidades

- Corrección gramatical en kurdo central (sorani): detección y corrección de errores de concordancia y morfología.
- Corrección ortográfica: restauración de letras diacríticas omitidas (ی/ێ, و/ۆ, ر/ڕ) y normalización de grafías.
- Restauración de puntuación: inserción y corrección de signos de puntuación en texto informal.
- Normalización de espaciado y de uso de préstamos léxicos mezclados.
- Generación de texto conversacional (pipeline `text-generation`).
- Capacidad multimodal declarada en los tags (`image-text-to-text`), aunque no se documenta su alcance.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Post-procesado editorial de textos en sorani: integrado como paso final en un CMS, el modelo recibe el borrador y devuelve el texto con ortografía, diacríticos y puntuación corregidos antes de publicar.
- Normalización de corpus para NLP: limpiar y estandarizar grandes volúmenes de texto kurdo extraído de redes sociales o webs antes de usarlo para entrenar otros modelos o para análisis lingüístico.
- Corrección en herramientas de escritura: backend de un corrector ortográfico y gramatical para procesadores de texto o extensiones de navegador orientadas a hablantes de sorani.
- Moderación y limpieza de contenido generado por usuarios: normalizar comentarios y publicaciones en plataformas kurdo-parlantes para facilitar búsqueda, indexación y detección de duplicados.
- Digitalización y OCR posterior: corregir el texto resultante de OCR sobre documentos en sorani, donde los errores de reconocimiento de diacríticos son habituales.
- Traducción asistida y localización: pre-normalizar el texto origen en kurdo antes de pasarlo a un sistema de traducción, reduciendo el ruido ortográfico que degrada la calidad de la traducción.
- Investigación lingüística: generar versiones normalizadas de corpus dialectales para estudios de variación ortográfica en sorani.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: en torno a 12-13 GB solo para pesos, más overhead de KV cache y activaciones; se recomienda reservar 16-24 GB según longitud de contexto y batch.
- GPU recomendadas para producción: NVIDIA L40S, A100 (40/80 GB) o H100 para mayor throughput y contextos largos.
- GPU de consumo: cabe en GPUs con 16 GB o más (RTX 4080, RTX 4090, RTX 5080/5090) siempre que se ajuste el contexto; en 12 GB es ajustado y probablemente requiera reducir batch o contexto.
- Despliegue: el modelo está empaquetado para vLLM (formato compressed-tensors FP8); también puede servirse con TGI si soporta el formato, o convertirse a GGUF para llama.cpp/Ollama, aunque esta conversión no está documentada oficialmente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RastNus-Base-12B-FP8 | ≈12B | no disponible | ckb (sorani) | Apache 2.0 (repo) | Hugging Face, FP8 |
| RastNus-Base-12B | ≈12B | no disponible | ckb (sorani) | Apache 2.0 (repo) | Hugging Face, BF16 |
| google/gemma-4-12b | ≈12B | no disponible | multilingüe | Licencia Gemma 4 | Hugging Face |

No se dispone de información sobre otros modelos especializados en corrección de kurdo central con los que establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Especialización estrecha: el ajuste está orientado a corrección en sorani; su rendimiento en otras lenguas o tareas generales no está documentado y probablemente sea inferior al del modelo base.
- Riesgo de alucinación: como todo modelo generativo, puede introducir cambios no solicitados o reescrituras en el texto corregido; conviene validar con diff automático en producción.
- Cobertura dialectal limitada: solo declara soporte para kurdo central (ckb); no cubre kurmanji (kmr) ni otras variedades.
- Sin benchmarks publicados: no hay métricas de precisión de corrección ni comparaciones con líneas base, lo que dificulta estimar su calidad real.
- Licencia: el repo indica Apache 2.0, pero el modelo base Gemma 4 remite a la licencia propia de Google; es necesario revisar los términos de esa licencia para uso comercial.
- Contexto no documentado: se desconoce la ventana máxima, lo que complica planificar el procesado de documentos largos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación mínimo, sin evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PawanKrd/RastNus-Base-12B-FP8
- Modelo base sin cuantizar: https://huggingface.co/PawanKrd/RastNus-Base-12B
- Modelo original de Google: https://huggingface.co/google/gemma-4-12b
- Sitio del autor: https://pawan.krd
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
