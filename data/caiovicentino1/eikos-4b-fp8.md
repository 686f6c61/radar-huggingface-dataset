# caiovicentino1/Eikos-4B-FP8

## Resumen

Eikos-4B-FP8 es una compilación en FP8 del modelo Eikos-4B, publicada por el usuario caiovicentino1 en HuggingFace. Eikos es un modelo especializado en "decisiones tipadas": en lugar de generar texto libre, devuelve una decisión entre un conjunto cerrado de opciones (sí/no, una entre N alternativas, puntuaciones ordinales) sobre un estado dado, acompañada de una probabilidad calibrada para cada opción, y todo ello en un único forward pass. El dominio declarado es el financiero y de comercio internacional (trading, trade finance, lectura de contratos, sentimiento, FinQA), aunque el autor publica evaluación también en baterías generales y en reglas composicionales.

El modelo base es Eikos-4B, construido sobre Qwen3.5-4B (licencia Apache-2.0). Los pesos totales declarados en safetensors son 4.539.265.536 parámetros (unos 4,54 mil millones), con un repositorio de 5,8 GB frente a los 9,3 GB de la versión bf16. La arquitectura es híbrida: la propia model card menciona Gated DeltaNet y advierte de que versiones de vLLM anteriores a la 0.30.0 devuelven respuestas incorrectas al agrupar en lote varias peticiones largas, lo que confirma un diseño de atención híbrida. Incluye torre de visión (etiqueta image-text-to-text) y pesos MTP (multi-token prediction), ambos mantenidos en mayor precisión que el cuerpo del modelo.

La relevancia de esta publicación es doble. Por un lado, demuestra una cuantización FP8 con activaciones dinámicas por token sin datos de calibración, que reduce el peso a casi la mitad manteniendo precisión: la puerta de salida fijada antes de medir (exactitud dentro de 1 punto de bf16, ECE dentro de 0,01 y al menos 97% de respuestas idénticas) se cumple en las 7 suites evaluadas. Por otro, ataca un caso de uso poco cubierto por los LLM generativos: la emisión de decisiones discretas con incertidumbre calibrada, que es exactamente lo que necesita un sistema de enrutado o de escalado a revisión humana. El repositorio es muy reciente (creado el 23 de septiembre de 2026) y no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida con Gated DeltaNet (derivada de Qwen3.5), con torre de visión y pesos MTP; cuantización en formato compressed-tensors |
| Parámetros totales | 4.539.265.536 (≈4,54 mil millones) |
| Parámetros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible en la información proporcionada (la model card menciona evaluación en contexto largo y caché de prefijo híbrida) |
| Tipos de cuantización | FP8: pesos FP8 por canal y activaciones FP8 dinámicas por token (esquema FP8_DYNAMIC de llm-compressor, sin datos de calibración); torre de visión, pesos MTP, embeddings y LM head en mayor precisión; existe versión bf16 |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | MIT para las contribuciones del autor; el modelo base Qwen3.5-4B es Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |
| Tamaño del repositorio | 5,8 GB (frente a 9,3 GB de la versión bf16) |
| Pipeline declarado | text-classification |
| Fecha de publicación | 23 de septiembre de 2026 (actualizado el 24 de septiembre de 2026) |

## Arquitectura y entrenamiento

La información disponible no detalla el proceso de entrenamiento de Eikos-4B (número de tokens, composición del dataset, uso de RLHF o DPO), y remite a la model card del modelo base para esos detalles. Lo que sí se especifica es la arquitectura de inferencia: un modelo híbrido basado en Qwen3.5-4B con capas Gated DeltaNet, torre de visión para entradas de imagen y texto, y pesos MTP. Esa combinación es la que obliga a usar vLLM 0.30.0 o superior, porque las versiones anteriores gestionan mal el batching de peticiones largas en este tipo de atención híbrida.

La innovación concreta de esta compilación es la cuantización. Se aplicó llm-compressor con el esquema FP8_DYNAMIC: pesos en FP8 por canal y activaciones en FP8 dinámicas por token, sin conjunto de calibración. Los componentes sensibles a la precisión (torre de visión, pesos MTP, embeddings y LM head) se mantienen en precisión superior para no degradar la representación de entrada ni la lectura final. El formato de prompt, la "lectura por letras" de la respuesta y el fichero de calibración probabilística (calib.json, con temperatura T = 1) son idénticos a los del modelo bf16, de modo que la salida del modelo FP8 es intercambiable con la de la versión de referencia sin recalibrar.

## Capacidades

- Emisión de decisiones tipadas en un único forward pass: preguntas de sí/no, elección entre N opciones y puntuaciones ordinales.
- Probabilidad calibrada por opción, con un ECE de 0,031 en la evaluación publicada, lo que permite usar umbrales de confianza para automatizar o escalar a revisión humana.
- Lectura de la respuesta en formato de letra ("letter readout"), integrada en el motor de vLLM mediante un script de servicio específico.
- Procesamiento multimodal de entrada: la etiqueta image-text-to-text y la presencia de torre de visión indican soporte de imágenes junto a texto.
- Sesiones de agente: la model card menciona "agent sessions" y una API HTTP con tipos de pregunta equivalentes a los del modelo base.
- Razonamiento multi-paso implícito en las tareas de reglas composicionales (rulebooks), con 91,3 de exactitud en libros de reglas nuevos.
- Dominio financiero y de comercio internacional: lectura de contratos (CUAD), análisis de sentimiento y evaluación tipo FinQA-judge.
- Autoinforme de incertidumbre: el 34,8% de los ítems se responden con confianza ≥0,90 y, en esos casos, el error baja al 2,5%.
- No se declaran capacidades de generación libre de texto, código, matemáticas generales, audio ni tool calling en la información proporcionada.
- Idiomas soportados: no disponible.

## Casos de uso

- Enrutado de decisiones con umbral de confianza: el modelo devuelve una opción y su probabilidad calibrada, de modo que el sistema puede autoaprobar las respuestas con confianza ≥0,90 (error del 2,5%) y derivar el resto a un operador humano. Es el escenario para el que está diseñado explícitamente.
- Evaluación de reglas de comercio internacional: clasificar operaciones contra libros de reglas (trade rules), con 74,7 de exactitud en reglas vistas y 76,0 en no vistas. Sirve para preclasificar expedientes aduaneros o de trade finance antes de la validación manual.
- Clasificación documental en banca: decidir la categoría de un contrato o cláusula usando el conjunto CUAD como referencia, con 75,2 en la batería financiera. Útil para triaje de documentación legal y de cumplimiento.
- Análisis de sentimiento financiero accionable: convertir noticias o informes en una etiqueta ordinal calibrada (por ejemplo, de muy negativo a muy positivo) en lugar de una puntuación sin incertidumbre asociada.
- Puntuaciones ordinales de riesgo: ordenar activos, contrapartes o expedientes en una escala discreta con probabilidad por nivel, y comparar directamente con umbrales de política interna.
- Agentes de decisión multi-paso: las sesiones de agente y la caché de prefijo híbrida permiten encadenar consultas sobre el mismo estado sin recalcular el contexto, lo que encaja en pipelines de decisión iterativa.
- Extracción estructurada de documentos escaneados: la torre de visión admite entrada de imagen y texto, de modo que una captura o un PDF renderizado puede alimentar directamente una decisión tipada.
- Auditoría de incertidumbre en producción: al conservar ECE y calibración idénticos a la versión bf16, el modelo FP8 sirve para monitorizar desviaciones de calibración sin cambiar la lógica de negocio.

## Benchmarks y rendimiento

Los resultados publicados corresponden a la validación del build FP8 contra el build bf16, sobre los mismos 7.371 ítems de 7 suites nunca usadas en entrenamiento, con vLLM 0.30, batching y caché de prefijo activados. No se incluyen comparaciones con modelos de terceros.

| Suite | Eikos-4B (bf16) | Eikos-4B-FP8 |
|---|---|---|
| JevBench público — original / difícil | 91,7 / 73,9 | 90,3 / 73,0 |
| DecisionBench — medio / difícil | 77,1 / 66,6 | 78,5 / 66,6 |
| Batería general (9 tareas) | 75,7 | 75,8 |
| Finanzas (CUAD, sentimiento, FinQA-judge) | 74,7 | 75,2 |
| Reglas de comercio — vistas / no vistas | 74,5 / 76,0 | 74,7 / 76,0 |
| Reglas composicionales — mismo tipo / dominio nuevo / libros de reglas | 96,0 / 91,5 / 91,7 | 95,6 / 91,8 / 91,3 |
| ECE (menor es mejor) | 0,033 | 0,031 |
| Confianza ≥0,90: decide / error | 34,7% / 2,5% | 34,8% / 2,5% |
| Misma respuesta que bf16 (todas / confiadas ≥0,9) | — | 97,3% / 100,0% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras baterías estándar en la información disponible.

## Requisitos de hardware

- Peso de los pesos: 5,8 GB en FP8 frente a 9,3 GB en bf16, según los tamaños de repositorio declarados.
- VRAM estimada para inferencia: alrededor de 7-8 GB en FP8 para contextos cortos, sumando pesos y overhead del runtime; la caché KV crece con la longitud de contexto y con el número de secuencias en lote. Cifra orientativa, no publicada por el autor.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 12 GB o más, como una RTX 3060 de 12 GB, RTX 4070, RTX 4080 o RTX 4090. La versión bf16 requiere alrededor de 11-12 GB solo para pesos, por lo que en 12 GB queda muy justa.
- FP8 nativo: requiere GPU con soporte de FP8 (arquitecturas Ada Lovelace, Hopper o posteriores) para aprovechar los kernels rápidos; en GPUs sin soporte el runtime aplicará una ruta alternativa más lenta.
- Despliegue obligatorio con vLLM ≥ 0.30.0. Versiones anteriores devuelven respuestas incorrectas al agrupar varias peticiones largas sobre esta arquitectura híbrida Gated DeltaNet.
- El repositorio incluye dos scripts de servicio: `serve_vllm.sh`, que levanta el motor vLLM con lectura por letras y caché de prefijo híbrida en el puerto 8001, y `serve.py`, que expone la API HTTP en el puerto 8000.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos de terceros en la información proporcionada, por lo que no es posible comparar el rendimiento frente a alternativas de la misma categoría. La única comparación con cifras disponibles es entre el propio modelo y su build en bf16.

| Modelo | Parámetros | Tamaño en disco | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Eikos-4B-FP8 | 4.539.265.536 | 5,8 GB | safetensors (FP8, compressed-tensors) | MIT (contribuciones) / Apache-2.0 (base) | HuggingFace, requiere vLLM ≥ 0.30.0 |
| Eikos-4B (bf16) | 4.539.265.536 | 9,3 GB | safetensors (bf16) | MIT (contribuciones) / Apache-2.0 (base) | HuggingFace |
| Qwen3.5-4B (modelo base) | No disponible en la información proporcionada | No disponible | No disponible | Apache-2.0 | HuggingFace |

## Limitaciones y advertencias

- El modelo no es un asesor legal, fiscal ni de inversión; la propia model card incluye este aviso de forma explícita.
- Está diseñado para decisiones tipadas sobre opciones cerradas, no para generación libre de texto. Usarlo como chat o como generador abierto queda fuera de su propósito declarado.
- Riesgo de alucinación no cuantificado: aunque la calibración es buena (ECE 0,031), el modelo sigue decidiendo con confianza alta en aproximadamente un tercio de los ítems y equivocándose en el 2,5% de ellos. En un pipeline financiero real ese margen debe tratarse como tasa de error esperada.
- Dependencia estricta de la versión de vLLM: por debajo de 0.30.0 las respuestas son incorrectas al batchear peticiones largas. Cualquier despliegue debe fijar la versión en el entorno.
- La cuantización se hizo sin datos de calibración, y se mantienen en mayor precisión la torre de visión, los pesos MTP, los embeddings y el LM head. Si se recalibra o se modifica la temperatura de calibración, hay que replicar el ajuste (calib.json, T = 1) para no romper las probabilidades.
- El repositorio no registra descargas ni likes en el momento de la consulta, y el autor es un particular, no un laboratorio con historial verificable. La validación publicada es interna al autor.
- Idiomas soportados no disponibles: no se puede asumir cobertura multilingüe para castellano ni para otras lenguas.
- Licencia MIT para las contribuciones del autor y Apache-2.0 para el modelo base Qwen3.5-4B: el uso comercial es posible, pero conviene revisar el fichero NOTICE y las atribuciones incluidas en el repositorio.
- No se documentan sesgos conocidos ni dominios de exclusión en la información proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/caiovicentino1/Eikos-4B-FP8
- Modelo base: https://huggingface.co/caiovicentino1/Eikos-4B
- Imagen de presentación de Eikos: https://huggingface.co/caiovicentino1/Eikos-4B/resolve/main/assets/eikos_launch.png
- No se han encontrado en la búsqueda web enlaces relevantes al modelo; los resultados devueltos no guardan relación con Eikos-4B ni con el autor.
