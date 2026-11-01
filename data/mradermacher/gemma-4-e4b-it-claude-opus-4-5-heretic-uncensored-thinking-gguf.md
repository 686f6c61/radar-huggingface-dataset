# mradermacher/gemma-4-E4B-it-Claude-Opus-4.5-HERETIC-UNCENSORED-Thinking-GGUF

## Resumen

Esta ficha describe la cuantización GGUF del modelo `gemma-4-E4B-it-Claude-Opus-4.5-HERETIC-UNCENSORED-Thinking`, un fine-tune derivado de la familia Gemma 4 (variante E4B, orientada a eficiencia) publicado por el usuario DavidAU y cuantizado por mradermacher. El modelo se distribuye como pesos GGUF estáticos listos para su uso en `llama.cpp` y ecosistemas compatibles, con un total de 7.518.069.290 parámetros según los safetensors del repositorio base. La nomenclatura del modelo indica tres características diferenciadoras: un proceso de "abliteration"/"heretic" destinado a reducir los rechazos del modelo alineado original, una orientación "uncensored", y un modo de razonamiento explícito ("Thinking").

El modelo se apoya en la arquitectura Gemma 4, que en la variante E4B emplea técnicas de eficiencia (mezcla de expertos o atención selectiva, según la implementación original de Google; no se detalla en la información disponible). El fine-tune se realizó presuntamente con Unsloth, según las etiquetas del repositorio, y el resultado se ha publicado bajo licencia Apache 2.0. La relevancia actual radica en que ofrece un modelo de ~7.500 millones de parámetros con capacidades multimodales (se incluyen ficheros `mmproj` para proyección visual) y modo de razonamiento, en un formato que cabe en GPUs de consumo con cuantizaciones de 4-6 bits.

Es importante señalar que este repositorio es únicamente una recopilación de cuantizaciones estáticas del modelo base de DavidAU; no aporta información adicional sobre el entrenamiento, los datos utilizados ni los benchmarks. Además, el modelo está etiquetado exclusivamente para inglés (`en`) y no se han publicado resultados de evaluación en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, variante E4B; detalles no disponibles) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; además mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su pertenencia a la familia Gemma 4 en su variante E4B. El nombre "E4B" sugiere una variante optimizada para eficiencia dentro de la familia Gemma 4, pero no se especifica si emplea mezcla de expertos, atención lineal u otras técnicas. El repositorio de mradermacher es una cuantización estática del modelo de DavidAU, que a su vez es un fine-tune del modelo Gemma 4 E4B-it original.

El proceso de fine-tune se realizó, según las etiquetas, con Unsloth, e incluye las técnicas de "heretic"/"abliteration" (eliminación de direcciones de rechazo en el espacio de activaciones) y "uncensored" (eliminación de restricciones de contenido). El sufijo "Claude-Opus-4.5" en el nombre sugiere que el fine-tune se orientó a imitar el estilo de razonamiento o las respuestas de Claude Opus 4.5, aunque no se proporcionan detalles sobre el dataset de destilación o los datos de entrenamiento. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La cuantización se ha realizado con el formato GGUF estático (no imatrix), e incluye ficheros `mmproj` para la proyección multimodal, lo que indica que el modelo base conserva capacidades de visión. No se especifica la versión de `llama.cpp` requerida ni el método exacto de cuantización más allá de los tipos estándar K-quant e IQ.

## Capacidades

- Generación de texto conversacional en inglés, con modo de razonamiento explícito ("Thinking") que permite al modelo exponer cadenas de pensamiento antes de la respuesta final.
- Capacidades multimodales: la presencia de ficheros `mmproj` indica soporte de entrada de imágenes (visión), aunque no se detalla la resolución o el formato admitido.
- Fine-tune orientado a eliminar rechazos ("abliterated"/"uncensored"), lo que reduce la probabilidad de respuestas de negativa ante solicitudes que el modelo original rechazaría.
- Estilo de respuesta orientado a imitar a Claude Opus 4.5, según la nomenclatura del modelo (no verificable con la información disponible).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`; no se garantiza soporte de otros idiomas.
- Capacidades especiales: modo thinking, visión (vía mmproj), contenido sin censura.

## Casos de uso

- **Investigación sobre alineación y seguridad**: el modelo permite estudiar el efecto de las técnicas de abliteration comparando sus respuestas con las del Gemma 4 E4B-it original, en entornos controlados de laboratorio.
- **Generación de contenido creativo sin restricciones**: para escritura de ficción, guiones o narrativa que requiera temáticas que los modelos alineados suelen rechazar, con la advertencia de revisión humana posterior.
- **Prototipado de asistentes conversacionales en local**: gracias a sus ~7.500 millones de parámetros y cuantizaciones de 4-5 GB, puede desplegarse en una GPU de consumo para pruebas de concepto de chatbots multi-turno en inglés.
- **Análisis de imágenes en local**: mediante los ficheros `mmproj`, el modelo puede procesar entradas visuales junto con texto para tareas de descripción o extracción de información, sin depender de APIs externas.
- **Experimentación con cadenas de razonamiento**: el modo "Thinking" permite generar trazas de razonamiento para estudiar técnicas de decodificación, destilación o evaluación de procesos de pensamiento.
- **Destilación de estilo**: el fine-tune orientado a Claude Opus 4.5 puede emplearse como generador de datos sintéticos con un estilo concreto para entrenar modelos más pequeños o especializados.
- **Evaluación de cuantizaciones**: al ofrecerse 12 tipos de cuantización, es útil para comparar la degradación de calidad entre Q2_K y Q8_0 en tareas concretas de generación y razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia** (solo pesos, sin margen para contexto):
  - Q2_K: ~4,5 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: ~4,8-5,1 GB
  - IQ4_XS / Q4_K_S / Q4_K_M: ~5,2-5,4 GB
  - Q5_K_S / Q5_K_M: ~5,8-5,9 GB
  - Q6_K: ~6,3 GB
  - Q8_0: ~8,1 GB
  - f16: ~15,2 GB
  - mmproj (visión): +0,7 GB (Q8_0) o +1,1 GB (f16)
- **GPU recomendadas**: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 para cuantizaciones altas; A100/H100 para f16 o despliegues concurrentes.
- **¿Cabe en GPU de consumo?**: sí. Las cuantizaciones Q4_K_M (~5,4 GB) caben holgadamente en GPUs de 8 GB o más, incluyendo contexto moderado. La variante f16 requiere 16 GB o más.
- **Opciones de despliegue**: `llama.cpp`, Ollama, LM Studio, `llama-cpp-python`, y servidores compatibles con la API de OpenAI mediante `llama-server`. También puede usarse con `transformers` cargando el modelo base en safetensors.
- **Latencia y throughput**: no disponibles en la información proporcionada. Como referencia orientativa, un modelo de ~7,5B en Q4_K_M suele generar decenas de tokens por segundo en GPUs de consumo modernas, pero no se confirma con datos del repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-4-E4B-it-Claude-Opus-4.5-HERETIC-UNCENSORED-Thinking (este) | 7.518.069.290 | no disponible | Apache 2.0 | GGUF / safetensors | Fine-tune uncensored con visión y thinking |
| Gemma 4 E4B-it (original de Google) | no disponible en esta ficha | no disponible | Gemma Terms (no Apache) | safetensors | Modelo alineado de referencia; sin abliteration |
| DavidAU/gemma-4-E4B-it-Claude-Opus-4.5-HERETIC-UNCENSORED-Thinking | 7.518.069.290 | no disponible | Apache 2.0 | safetensors | Modelo base del que se derivan estas cuantizaciones |
| mradermacher/gemma-4-E4B-it-Claude-Opus-4.5-HERETIC-UNCENSORED-Thinking-i1-GGUF | 7.518.069.290 | no disponible | Apache 2.0 | GGUF (imatrix) | Variante con cuantización imatrix, mayor calidad por bit |

No se dispone de datos de benchmarks que permitan comparar el rendimiento real frente a estos u otros modelos.

## Limitaciones y advertencias

- **Contenido sin censura**: el proceso de abliteration elimina las barreras de rechazo del modelo alineado, por lo que puede generar contenido ofensivo, ilegal o dañino. No es apto para despliegues públicos sin filtros adicionales.
- **Sesgos**: al derivar de Gemma 4 y de un fine-tune sin datos de alineación documentados, es probable que herede sesgos del modelo original y añada los del dataset de destilación (no disponible).
- **Riesgo de alucinación**: no se han publicado evaluaciones de fidelidad; los fine-tunes uncensored suelen presentar mayor propensión a afirmar hechos falsos con seguridad.
- **Idioma**: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- **Contexto**: no se especifica la longitud de contexto soportada; debe verificarse en la configuración de `llama.cpp` antes de usarlo en tareas de contexto largo.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base Gemma de Google tiene sus propios términos; conviene verificar la compatibilidad de la cadena de licencias antes de un despliegue comercial.
- **Trazabilidad**: este repositorio es solo una cuantización; no documenta el entrenamiento, los datos ni las evaluaciones del modelo base, lo que dificulta la auditoría.
- **Modo thinking**: la exposición de cadenas de razonamiento puede incrementar el consumo de tokens y la latencia; no se han publicado métricas al respecto.
- **Producción**: la falta de benchmarks y de información sobre tool calling o agentes desaconseja su uso en pipelines críticos sin una evaluación propia previa.

## Enlaces

- Repositorio HuggingFace (cuantizaciones GGUF): https://huggingface.co/mradermacher/gemma-4-E4B-it-Claude-Opus-4.5-HERETIC-UNCENSORED-Thinking-GGUF
- Modelo base (safetensors): https://huggingface.co/DavidAU/gemma-4-E4B-it-Claude-Opus-4.5-HERETIC-UNCENSORED-Thinking
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/gemma-4-E4B-it-Claude-Opus-4.5-HERETIC-UNCENSORED-Thinking-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#gemma-4-E4B-it-Claude-Opus-4.5-HERETIC-UNCENSORED-Thinking-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
