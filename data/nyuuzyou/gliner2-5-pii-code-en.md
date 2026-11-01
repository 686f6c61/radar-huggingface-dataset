# nyuuzyou/gliner2.5-PII-code-en

## Resumen

gliner2.5-PII-code-en es un modelo de reconocimiento de entidades nombradas (NER) especializado en la detección de datos personales y secretos en código, desarrollado por el usuario nyuuzyou como un fine-tune del modelo base fastino/gliner2.5-base-v1. Con 193,5 millones de parámetros, está diseñado para resolver un problema concreto y creciente: la fuga de información sensible en repositorios de código, configuraciones, logs y trazas de asistentes de programación basados en LLM. A diferencia de los filtros de PII genéricos, este modelo distingue entre datos del autor del documento y datos de terceros, y entre valores reales y marcadores de posición como `YOUR_API_KEY`.

El modelo se organiza en dos "vistas" o esquemas de extracción independientes: `author7`, orientada a prosa en inglés con siete tipos de PII del autor, y `code`, orientada a código y trazas con diez tipos de secretos e identidades de desarrollador. Esta separación permite aplicar umbrales distintos (0,995 para prosa y 0,5 para código) y mejorar la precisión en cada dominio. Su licencia Apache-2.0 y su tamaño contenido lo hacen apto para despliegue en entornos de CI/CD y pipelines de revisión de código.

La relevancia actual del modelo radica en su rendimiento reportado: F1 de 0,825 en el conjunto SPY de documentos y 0,968 en el conjunto de código, superando de forma clara al modelo base y a alternativas como el filtro de privacidad de Fastino. Además, reduce drásticamente los falsos positivos sobre marcadores de posición, un problema habitual en la detección de secretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER2 (extractor de entidades zero-shot basado en transformer encoder) |
| Parametros totales | 193.581.591 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, FP32) |

## Arquitectura y entrenamiento

El modelo se basa en GLiNER2, una familia de extractores de entidades que combina un encoder transformer con un mecanismo de matching entre representaciones de etiquetas y spans del texto, lo que permite definir entidades de forma dinámica en tiempo de inferencia mediante esquemas. El checkpoint parte de fastino/gliner2.5-base-v1 y se ha afinado de forma secuencial a través de varias iteraciones (base → v4 → v7 → v8 → v9, paso 80), según la model card. Los pesos se distribuyen en FP32 con un total de 193,5 millones de parámetros y un repositorio de 0,8 GB.

El entrenamiento utiliza el dataset nyuuzyou/gliner2.5-PII-code-en-data y combina dos vistas con etiquetas diferenciadas. La vista `author7` cubre correo, nombre, URL, teléfono, número de identificación, dirección y nombre de usuario del autor; la vista `code` cubre API keys, tokens de autenticación, contraseñas, cadenas de conexión, claves privadas, rutas de archivo personales, hosts internos y correo, nombre y usuario del desarrollador. El modelo incorpora una cabeza de abstención que descarta etiquetas con puntuación superior a 0,5, lo que ayuda a suprimir falsos positivos. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Extracción de entidades nombradas zero-shot mediante esquemas definidos en tiempo de inferencia con `create_schema().entities(...)`.
- Detección de PII del autor en prosa inglesa: correo, nombre, URL, teléfono, número de identificación, dirección y nombre de usuario.
- Detección de secretos en código y configuración: API keys, tokens de autenticación, contraseñas, cadenas de conexión, claves privadas, rutas de archivo personales, hosts internos y datos de identidad del desarrollador.
- Distinción entre valores reales y marcadores de posición (por ejemplo, `YOUR_API_KEY` o `${POSTGRES_LOGIN_PASSWORD}`), con una tasa de acierto de 26/160 en marcadores explícitos frente a 122/160 del modelo base.
- Regla de propiedad del autor: en la vista de prosa omite los datos de terceros mencionados en el texto.
- Soporte de extracción por lotes (`batch_extract`) con spans y puntuaciones de confianza (`include_spans`, `include_confidence`).
- Cabeza de abstención para descartar etiquetas con baja confianza.
- Capacidad de ejecución en CPU y GPU (`map_location="cuda"`).
- No se documentan capacidades de generación de texto, razonamiento general, matemáticas, visión, audio, tool calling ni agentes; es un modelo exclusivamente extractivo de token-classification.

## Casos de uso

- Escaneo de repositorios antes de publicar: integrado en un hook de pre-commit o en un pipeline de CI/CD, el modelo recorre archivos de configuración y código para detectar cadenas de conexión, API keys y contraseñas antes de que lleguen a un repositorio público.
- Filtrado de trazas de asistentes de programación: al procesar logs de sesiones con LLM, la vista `code` identifica secretos y datos de desarrollador que podrían haberse filtrado en las trazas, permitiendo su redacción automática.
- Sanitización de documentación técnica: la vista `author7` detecta correos, nombres y teléfonos del autor en guías y READMEs, facilitando la anonimización antes de su publicación.
- Cumplimiento de privacidad en corpus legales y médicos: el modelo reporta F1 de 0,825 en el conjunto SPY, que promedia documentos legales y médicos, por lo que puede emplearse para localizar PII en expedientes antes de compartirlos con terceros.
- Revisión de configuraciones de infraestructura: detecta hosts internos y rutas de archivo personales en ficheros YAML, JSON o variables de entorno, útil en auditorías de seguridad y revisiones de cambios.
- Enmascaramiento en pipelines de datos para entrenamiento: antes de usar un corpus de código o prosa para entrenar otros modelos, el extractor marca y elimina secretos y datos personales, reduciendo el riesgo de memorización de información sensible.
- Moderación de contribuciones en plataformas colaborativas: aplicado a pull requests o issues, permite alertar al contribuyente cuando incluye credenciales reales en lugar de marcadores de posición.

## Benchmarks y rendimiento

Resultados reportados en la model card a umbral común de 0,5, con intervalos de confianza al 95 %:

| Sistema | SPY F1 | Intervalo SPY | Code F1 | Intervalo Code |
|---|---|---|---|---|
| fastino/gliner2.5-base-v1 | 0,547 | [0,544, 0,550] | 0,428 | [0,396, 0,458] |
| fastino/gliner2-privacy-filter-PII-multi | 0,512 | [0,509, 0,515] | 0,470 | [0,439, 0,499] |
| gliner2.5-PII-code-en | 0,825 | [0,822, 0,828] | 0,968 | [0,953, 0,980] |
| Jev (TypeSafe) | 0,817 | [0,814, 0,820] | 0,818 | [0,795, 0,841] |

A su umbral propio de prosa (0,995), el modelo alcanza SPY F1 de 0,881 ([0,879, 0,884], precisión 0,897, recall 0,867); la model card advierte que este umbral se ajustó con retroalimentación del conjunto SPY y la cifra es optimista.

Diferencias pareadas con bootstrap (2.000 remuestreos, semilla 20260923), en unidades de F1:

| Este modelo menos | SPY | Code |
|---|---|---|
| Fastino base | [0,275, 0,281] | [0,510, 0,570] |
| Fastino PII | [0,310, 0,316] | [0,468, 0,527] |
| Jev | [0,006, 0,012] | [0,127, 0,170] |

Controles sobre código:

| Control | Fastino base | Fastino PII | Este modelo | Jev |
|---|---|---|---|---|
| Valores reales encontrados (exacto) | 66/80 | 58/80 | 80/80 | 80/80 |
| Ocurrencias de marcadores detectadas | 570/852 | 540/852 | 31/852 | 2/852 |
| Marcadores explícitos detectados | 122/160 | 107/160 | 26/160 | 0/160 |
| Pares real/ejemplo totalmente correctos | 2/80 | 1/80 | 79/80 | 72/80 |
| Documentos negativos con activación | 192/280 | 177/280 | 27/280 | 0/280 |

Como referencia externa, OpenAI Privacy Filter obtuvo SPY F1 de 0,426 y F1 de código de 0,576 sobre las mismas entradas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,8 GB solo para pesos, más memoria para activaciones y el encoder; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- Cuantización: la model card no publica versiones GGUF ni cuantizadas; al ser un modelo de 193 M de parámetros, cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090); también funciona en CPU para lotes pequeños.
- Cabe en GPU consumer: sí, en toda la gama actual, incluidas GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: la librería oficial es `gliner2` (`pip install "gliner2[local]"`), con `AutoExtractor.from_pretrained` y `batch_extract`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SPY F1 | Code F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| gliner2.5-PII-code-en | 193,5 M | no disponible | 0,825 | 0,968 | Apache-2.0 | HuggingFace (22 descargas) |
| fastino/gliner2.5-base-v1 | no disponible | no disponible | 0,547 | 0,428 | no disponible en la información | HuggingFace |
| fastino/gliner2-privacy-filter-PII-multi | no disponible | no disponible | 0,512 | 0,470 | no disponible en la información | HuggingFace |
| Jev (TypeSafe) | no disponible | no disponible | 0,817 | 0,818 | no disponible | Referencia externa en la model card |
| OpenAI Privacy Filter | no disponible | no disponible | 0,426 | 0,576 | no disponible | Referencia externa en la model card |

## Limitaciones y advertencias

- Solo soporta inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- El umbral de prosa (0,995) se ajustó con retroalimentación del conjunto SPY, por lo que el F1 de 0,881 en ese umbral debe interpretarse como optimista.
- La model card advierte de posibles solapamientos de fraseo con el entrenamiento: una comprobación de 13-gramas enmascarados encuentra frases compartidas en 61 documentos SPY y 59 de código, listados en la auditoría de entradas.
- El modelo está diseñado para detectar PII del autor y secretos, no PII de terceros en prosa; los datos de otras personas se omiten deliberadamente, lo que puede no ser adecuado para todos los casos de cumplimiento.
- Riesgo de falsos negativos en formatos de secreto no vistos durante el entrenamiento o en lenguajes de programación poco representados.
- Riesgo de alucinación de spans: como todo extractor, puede marcar fragmentos que no son entidades reales; se recomienda validar con umbrales y revisión humana en producción.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre la idoneidad para cumplimiento normativo específico (RGPD, HIPAA, etc.).
- El modelo tiene un número muy bajo de descargas (22) y ninguna valoración, por lo que la validación comunitaria es aún escasa.
- No se documentan la longitud de contexto ni el volumen de entrenamiento, lo que dificulta estimar su comportamiento en documentos muy largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nyuuzyou/gliner2.5-PII-code-en
- Dataset de entrenamiento: https://huggingface.co/datasets/nyuuzyou/gliner2.5-PII-code-en-data
- Resultados completos: https://huggingface.co/nyuuzyou/gliner2.5-PII-code-en/blob/main/docs/results.md
- Nota de comparación con Fastino: https://huggingface.co/nyuuzyou/gliner2.5-PII-code-en/blob/main/docs/results.md#external-reference-fastino-model-card-spy-results
- Modelo base: https://huggingface.co/fastino/gliner2.5-base-v1
- Filtro de privacidad de Fastino: https://huggingface.co/fastino/gliner2-privacy-filter-PII-multi
