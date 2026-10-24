# SD-Next/Qwen-3.5-4B-sdnq-uint8

## Resumen

SD-Next/Qwen-3.5-4B-sdnq-uint8 es una versión cuantizada a 8 bits (uint8) del modelo Qwen3.5-4B, publicada por el equipo de SD-Next para su uso dentro de la aplicación SD.Next. No se trata de un entrenamiento nuevo: es una copia del modelo comunitario p-e-w/Qwen3.5-4B-heretic-new-ara, a su vez derivado del Qwen3.5-4B oficial de Alibaba Qwen, que ha sido prequantizado con el formato SDNQ en precisión uint8 para reducir el espacio en disco y la memoria necesaria en inferencia.

El interés de esta ficha está en tres capas que se acumulan sobre el modelo base: primero, la familia Qwen3.5, un modelo de propósito general de 4.541.620.224 parámetros (4,54 mil millones) con pipeline declarado image-text-to-text, es decir, con entrada de imagen además de texto; segundo, la variante "heretic", que aplica técnicas de abliteration para eliminar la dirección de rechazo aprendida durante el alineamiento, dando lugar a un modelo "uncensored"; y tercero, la cuantización SDNQ uint8, que comprime los pesos a un byte por parámetro.

Es relevante ahora porque permite ejecutar un modelo multimodal de ~4,5B parámetros con licencia Apache 2.0 en GPU de consumo, algo útil para prototipado rápido en flujos de generación de imágenes y para investigación sobre alineamiento y comportamiento de modelos sin rechazo. Ahora bien, la información publicada por el autor es mínima: la model card se limita a indicar que es una copia prequantizada para SD.Next, sin especificar longitud de contexto, idiomas, datos de entrenamiento ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; derivada de Qwen/Qwen3.5-4B (modelo de lenguaje transformer, pipeline image-text-to-text) |
| Parametros totales | 4.541.620.224 (~4,54 mil millones) |
| Parametros activos | No aplica (no consta que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | uint8 (8 bits) mediante SDNQ; no se publican otros formatos en este repositorio |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 (heredada del modelo base Qwen/Qwen3.5-4B) |
| Formato de pesos | safetensors (librería transformers) |
| Tamano del repositorio | 15,3 GB |
| Pipeline declarado | image-text-to-text |
| Modelo base | Qwen/Qwen3.5-4B |
| Modelo de origen de la variante | p-e-w/Qwen3.5-4B-heretic-new-ara-test-reproduced |
| Fecha de publicacion | 2026-10-24 |

## Arquitectura y entrenamiento

El autor no documenta la arquitectura interna ni el proceso de entrenamiento. Por la información disponible solo puede afirmarse que se trata de un modelo derivado de Qwen3.5-4B, con 4.541.620.224 parámetros según los safetensors del repositorio y con pipeline image-text-to-text, lo que implica capacidad de procesar imágenes junto a texto. Los detalles de número de capas, cabezas de atención, tipo de atención, tokenizador o longitud de contexto no se han publicado en la información proporcionada.

Tampoco hay datos sobre el corpus de entrenamiento original (número de tokens, composición, fases de SFT/RLHF/DPO). Lo que sí está documentado es el postprocesado: la variante "heretic" aplica abliteration, una técnica que identifica y sustrae la dirección de activación asociada al rechazo de peticiones, de modo que el modelo deja de negarse a responder a ciertos contenidos. Sobre ese resultado, SD-Next aplica una cuantización SDNQ a uint8, que reduce los pesos a un byte por parámetro (aproximadamente 4,5 GB de pesos frente a los ~9,1 GB en fp16) a cambio de una pérdida de precisión numérica no cuantificada públicamente.

## Capacidades

- Generación de texto conversacional multi-turno, con el estilo de respuesta del modelo base Qwen3.5.
- Entrada de imágenes: el pipeline declarado es image-text-to-text, por lo que admite prompts que combinan imagen y texto (descripción, respuesta a preguntas sobre la imagen).
- Modo sin rechazo: la abliteration elimina buena parte de las negativas del alineamiento original, permitiendo respuestas sobre contenido que el modelo base rechazaría.
- Razonamiento y conocimiento general propios de un modelo de ~4,5B parámetros de la familia Qwen3.5 (no se publican evaluaciones que lo cuantifiquen).
- Soporte de tool calling / function calling: no confirmado en la información disponible para esta variante.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas para esta variante.
- Integración nativa con SD.Next como modelo prequantizado listo para usar.

## Casos de uso

- Flujos de generación de imágenes en SD.Next: el modelo puede actuar como asistente de prompting (expandir una idea en una descripción detallada) o como describer inverso de imágenes generadas, ya que el pipeline image-text-to-text permite analizar el resultado y proponer ajustes de prompt.
- Etiquetado y curación de datasets de visión: generar descripciones y alt-text para lotes de imágenes dentro de un pipeline de preparación de datos, con la ventaja de que el modelo cabe en una GPU de consumo y puede ejecutarse en local sin enviar imágenes a un servicio externo.
- Investigación sobre alineamiento y seguridad: al ser una variante abliterated, sirve para estudiar qué comportamientos cambian al eliminar la dirección de rechazo, comparar tasas de negativa frente al modelo base y alimentar experimentos de red-teaming controlados.
- Asistencia de código en local: con ~4,5B parámetros en uint8, puede desplegarse en estaciones de trabajo sin GPU de datacenter para autocompletado, explicación de fragmentos y generación de tests, manteniendo el código dentro de la red corporativa.
- Procesamiento de documentos con imagen: extracción de información de capturas, facturas escaneadas o diagramas mediante preguntas en lenguaje natural sobre la imagen, en entornos donde no se permite usar APIs externas.
- Escritura creativa sin restricciones temáticas: redacción de ficción con contenido adulto o temas sensibles en plataformas que lo permitan, asumiendo que la moderación debe implementarse externamente al modelo.
- Pruebas de concepto y demos: validar un producto basado en un modelo multimodal de 4,5B antes de invertir en una versión mayor o en infraestructura dedicada, gracias al reducido requisito de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, y tampoco se documenta la degradación introducida por la abliteration ni por la cuantización uint8 respecto al Qwen3.5-4B original. Cualquier cifra de rendimiento debería obtenerse mediante evaluación propia antes de tomar decisiones de producción.

## Requisitos de hardware

- Pesos en uint8: 4.541.620.224 parámetros × 1 byte ≈ 4,5 GB. Con overhead de runtime, KV cache y activaciones, se recomienda reservar entre 6 y 10 GB de VRAM según la longitud de contexto y el tamano de lote.
- Referencia en fp16: los mismos parámetros ocuparían ~9,1 GB, de modo que la versión uint8 aproximadamente duplica el margen disponible.
- GPU de consumo: cabe en tarjetas de 8 GB con contexto corto y lote 1 (por ejemplo, RTX 3060 Ti, RTX 4060); con 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super) hay margen para contextos mayores y procesamiento por lotes.
- GPU profesionales: A100, H100, L40S o RTX 4090 no son necesarias para inferencia, pero permiten mayor throughput y lotes grandes.
- Despliegue: el formato SDNQ está orientado a SD.Next y a la librería transformers; no consta que existan pesos GGUF para llama.cpp/Ollama ni soporte verificado en vLLM o TGI para esta cuantización concreta.
- Tamano de descarga: el repositorio ocupa 15,3 GB, muy por encima de los ~4,5 GB que ocuparían los pesos uint8, por lo que la descarga completa puede incluir artefactos adicionales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| SD-Next/Qwen-3.5-4B-sdnq-uint8 | 4,54B | No disponible | uint8 (SDNQ) | Apache 2.0 | Variante abliterated prequantizada para SD.Next |
| Qwen/Qwen3.5-4B | No disponible | No disponible | Full precision | Apache 2.0 | Modelo base original, con alineamiento intacto |
| p-e-w/Qwen3.5-4B-heretic-new-ara | No disponible | No disponible | No disponible | No disponible en la informacion | Origen de la variante heretic; presumiblemente sin cuantizar |
| Otros modelos multimodales de ~4B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados para comparar |

La comparación cuantitativa no es posible con la información disponible: no se publican parámetros, contexto ni resultados de evaluación de las variantes intermedias, y no se han identificado en la búsqueda modelos comparables con datos verificables.

## Limitaciones y advertencias

- La abliteration elimina deliberadamente el comportamiento de rechazo: el modelo puede producir contenido dañino, ilegal o sexualmente explícito sin advertirlo. Cualquier despliegue público requiere moderación externa.
- No hay evaluación publicada del impacto de la abliteration en la calidad general; es habitual que este proceso degrade capacidades de razonamiento e instrucción.
- La cuantización uint8 introduce un error numérico adicional no medido respecto a los pesos originales.
- Riesgo de alucinación propio de un modelo de ~4,5B parámetros, acentuado si la abliteration ha degradado el ajuste fino.
- Se desconoce la longitud de contexto real y la lista de idiomas soportados; no debe asumirse un contexto largo ni un multilingüismo amplio sin verificarlo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación por terceros.
- Licencia Apache 2.0: permite uso comercial, pero la responsabilidad sobre el contenido generado y el cumplimiento normativo (por ejemplo, obligaciones de transparencia del Reglamento europeo de IA) recae en quien despliega el modelo.
- El pipeline image-text-to-text obliga a verificar el preprocesador y el tokenizador concretos; no se documenta qué resoluciones ni formatos de imagen acepta.
- No consta soporte en motores de inferencia habituales (vLLM, llama.cpp, TGI) para el formato SDNQ, lo que limita las opciones de escalado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SD-Next/Qwen-3.5-4B-sdnq-uint8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Modelo de origen de la variante heretic: https://huggingface.co/p-e-w/Qwen3.5-4B-heretic-new-ara-test-reproduced
- No se han encontrado en la búsqueda web enlaces relacionados con el modelo; los resultados obtenidos corresponden a tarjetas de memoria SD y no son pertinentes.
