# mradermacher/gemma-4-E4B-it-weight-space-programming-UNCENSORED-heretic-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `xtools-at/gemma-4-E4B-it-weight-space-programming-UNCENSORED-heretic`, una variante de Gemma 4 E4B-it modificada mediante técnicas de *weight-space programming* (programación en el espacio de pesos) y *abliteration* para eliminar los mecanismos de rechazo del modelo original. El autor de las cuantizaciones es mradermacher, un conocido publicador de versiones GGUF optimizadas con imatrix, mientras que el modelo base procede del usuario xtools-at. El resultado es un modelo conversacional de aproximadamente 7.460 millones de parámetros orientado a tool calling y flujos agénticos, sin las restricciones de seguridad habituales del Gemma original.

La relevancia de esta ficha radica en que combina tres tendencias técnicas actuales: la interpretabilidad mecanicista aplicada como método de edición de pesos sin reentrenamiento (*zero-training*), la eliminación selectiva de direcciones de activación asociadas al rechazo (*heretic/abliterated*) y la distribución en formato GGUF con cuantizaciones i1 generadas mediante matrices de importancia (imatrix). Todo ello sobre una arquitectura Gemma 4, lo que permite ejecución local en hardware de consumo.

No obstante, conviene subrayar que se trata de un modelo derivado de terceros, sin benchmarks publicados en la información disponible, con licencia Gemma (que impone restricciones de uso) y cuyo proceso de modificación puede degradar capacidades generales. La model card del cuantizador no aporta detalles sobre el entrenamiento ni sobre el rendimiento empírico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, variante E4B-it); detalles internos no disponibles |
| Parámetros totales | 7.463.013.674 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-Q2_K, i1-IQ3_M, i1-Q4_K_S (listados en el repo); la model card menciona además un conjunto más amplio de quants previstos (IQ1_S a Q6_K, Q4_0, Q4_1) |
| Idiomas soportados | en (inglés) |
| Licencia | gemma |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

El modelo base es una variante de Gemma 4 E4B-it, un transformer de la familia Gemma de Google, sobre el que se ha aplicado una modificación denominada *weight-space programming*. Esta técnica, asociada a la interpretabilidad mecanicista, consiste en editar directamente los pesos o direcciones de activación del modelo para inducir o suprimir comportamientos concretos sin reentrenamiento adicional (de ahí la etiqueta *zero-training*). En este caso, la edición se orienta a eliminar las respuestas de rechazo (*heretic*, *uncensored*, *abliterated*, *decensored*), presumiblemente mediante abliteration: la identificación de una dirección de activación asociada al rechazo y su proyección fuera del espacio de pesos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases de RLHF o DPO en el modelo base. El repositorio es únicamente de cuantización: mradermacher genera versiones GGUF con matrices de importancia (imatrix) a partir de los pesos del modelo de xtools-at, sin aportar entrenamiento propio. Las cuantizaciones i1 (basadas en imatrix) suelen ofrecer mejor relación calidad/tamaño que las cuantizaciones estáticas equivalentes, especialmente en rangos bajos como IQ3 o Q2.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Tool calling y function calling: las etiquetas del repositorio incluyen explícitamente `tool-calling` y `agentic`.
- Flujos agénticos y razonamiento multi-paso, según las etiquetas del autor.
- Capacidad de visión: la model card del cuantizador indica que es un modelo de visión y que los ficheros mmproj, si existen, están en el repositorio estático.
- Comportamiento sin rechazo (*uncensored*): el modelo ha sido modificado para no declinar peticiones que el Gemma original rechazaría.
- Idiomas: únicamente inglés declarado; no se documenta soporte multilingüe.
- No se documentan capacidades de audio, thinking mode explícito ni otras modalidades más allá de texto y visión.

## Casos de uso

- Agentes locales con tool calling: el modelo puede integrarse en frameworks agénticos (por ejemplo, orquestadores que expongan funciones vía JSON schema) y ejecutarse en local con llama.cpp u Ollama, aprovechando su tamaño de ~7,5B para mantener latencia baja en hardware de consumo.
- Automatización de tareas de escritorio o scripting: al no rechazar peticiones, resulta útil en pipelines internos de generación de código o comandos donde el modelo original podría bloquear solicitudes legítimas pero sensibles en apariencia.
- Procesamiento de documentos con OCR ligero: la variante de visión permite extraer texto o describir imágenes en flujos batch, siempre que se disponga del fichero mmproj del repositorio estático.
- Investigación en interpretabilidad: sirve como caso de estudio para comparar el comportamiento de un Gemma 4 E4B-it estándar frente a una versión editada en el espacio de pesos, evaluando qué capacidades se preservan y cuáles se degradan.
- Experimentación con cuantizaciones: los distintos niveles i1 (Q2_K, IQ3_M, Q4_K_S) permiten medir el impacto de la cuantización en tareas de tool calling y generación conversacional en entornos con VRAM limitada.
- Prototipado de asistentes sin filtros para entornos controlados: en pruebas internas de red teaming o evaluación de robustez, donde se necesita un modelo que no aplique rechazos para estudiar respuestas ante entradas adversarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4,5 GB para i1-Q2_K, 4,8 GB para i1-IQ3_M y 5,3 GB para i1-Q4_K_S, según los tamaños de fichero indicados en la model card.
- Cabe en GPU de consumo: sí, en tarjetas con 6-8 GB de VRAM o más (RTX 3060, RTX 4060, RTX 3070, RTX 4070), dependiendo del quant y del contexto utilizado.
- GPU recomendadas para mayor throughput: RTX 4090, A100 o H100 si se busca servir múltiples peticiones concurrentes o contextos largos.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el repositorio incluye la etiqueta `endpoints_compatible`. Para el modelo base en transformers se requiere la librería transformers.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (i1-GGUF) | 7,46B | no disponible | gemma | GGUF | Variante uncensored con tool calling y visión |
| Gemma 4 E4B-it (original) | ~7,5B (no confirmado en la información) | no disponible | gemma | safetensors | Modelo base con filtros de seguridad |
| mradermacher/gemma-4-E4B-it-...-GGUF (estático) | 7,46B | no disponible | gemma | GGUF | Misma base, cuantizaciones estáticas sin imatrix |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Modelo *uncensored*: la eliminación de rechazos implica que puede generar contenido dañino, ilegal o inseguro; no es apto para exposición directa a usuarios finales sin capas de moderación externas.
- La edición en el espacio de pesos puede degradar capacidades generales (razonamiento, coherencia, instrucciones complejas); no hay evaluaciones publicadas que cuantifiquen esa degradación.
- Riesgo de alucinación inherente a modelos de ~7,5B, agravado por la falta de benchmarks verificables.
- Idiomas: solo inglés declarado; el uso en castellano no está soportado oficialmente.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de atribución; conviene revisar los términos antes de desplegar en producción.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria de la calidad de las cuantizaciones.
- El proceso de cuantización i1 a niveles bajos (Q2, IQ3) puede afectar de forma notable a la precisión en tool calling y visión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma-4-E4B-it-weight-space-programming-UNCENSORED-heretic-i1-GGUF
- Modelo base: https://huggingface.co/xtools-at/gemma-4-E4B-it-weight-space-programming-UNCENSORED-heretic
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/gemma-4-E4B-it-weight-space-programming-UNCENSORED-heretic-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#gemma-4-E4B-it-weight-space-programming-UNCENSORED-heretic-i1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
