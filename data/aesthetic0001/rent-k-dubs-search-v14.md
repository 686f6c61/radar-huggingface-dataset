# aesthetic0001/rent-k-dubs-search-v14

## Resumen

Rent K Dubs Search V14 (identificador `aesthetic0001/rent-k-dubs-search-v14`) es un checkpoint de extracción de entidades (NER) especializado en consultas de alquiler de vivienda en inglés. Se trata de un fine-tuning del modelo base GLiNER2.5 Base v1 de Fastino, que emplea una arquitectura de reconocimiento de entidades de tipo GLiNER (Generalist and Lightweight model for Named Entity Recognition) implementada sobre un encoder transformer. El modelo resuelve un problema muy concreto: convertir lenguaje natural de búsqueda de alquiler en campos estructurados (criterios de la vivienda, destinos nombrados, servicios genéricos y expresiones de desplazamiento).

El checkpoint tiene 193.581.591 parámetros (unos 193,6 millones) y un tamaño de repositorio de 0,8 GB en formato safetensors. Está publicado bajo licencia Apache 2.0, lo que permite uso comercial con atribución, y se distribuye a través de la librería `gliner2`. Su relevancia es acotada pero clara: demuestra cómo un modelo base generalista de NER puede adaptarse mediante fine-tuning a un dominio vertical (búsqueda de alquileres) con métricas de extracción medidas sobre un conjunto de evaluación propio.

No es un modelo generativo ni un LLM conversacional: es un extractor de spans de evidencia. La model card reporta un 94,3 % de recall de span exacto y un 95,2 % de precisión sobre 60 consultas positivas nuevas, con un umbral de confianza de 0,5. Esos datos corresponden únicamente a la evaluación del autor y no están contrastados con benchmarks públicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER2 (extractor de entidades sobre encoder transformer); modelo base `fastino/gliner2.5-base-v1` |
| Parametros totales | 193.581.591 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (incluye tokenizer y configuración del encoder) |

## Arquitectura y entrenamiento

El modelo parte de GLiNER2.5 Base v1 de Fastino, un extractor de entidades de propósito general que sigue la línea GLiNER: en lugar de una cabeza de clasificación cerrada por etiqueta, permite definir el esquema de entidades en tiempo de inferencia y localizar los spans correspondientes en el texto. Sobre esa base, el autor ha realizado un fine-tuning supervisado con consultas de alquiler en inglés, orientado a cuatro familias de campos: criterios de la vivienda (evidencia de las condiciones del anuncio), destinos nombrados, servicios o amenities genéricos y expresiones de desplazamiento o viaje.

La model card no detalla el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO; tampoco especifica hiperparámetros, número de épocas o estrategia de congelación de capas. Lo que sí se documenta es el procedimiento de inferencia: se debe usar `AutoExtractor` de GLiNER2 pasando las definiciones de campos de alquiler del proyecto para construir el esquema de extracción. El checkpoint incluye tokenizer y configuración del encoder, y se distribuye con sumas de verificación SHA256 para validar la descarga.

## Capacidades

- Extracción de entidades nombradas (NER) orientada a spans de evidencia en consultas de alquiler en inglés.
- Identificación de criterios de búsqueda de vivienda (por ejemplo, condiciones o características expresadas en la consulta).
- Detección de destinos nombrados (ubicaciones mencionadas en la consulta).
- Reconocimiento de amenities o servicios genéricos solicitados.
- Extracción de expresiones de desplazamiento o viaje asociadas a la consulta.
- Construcción de esquemas de extracción dinámicos mediante las definiciones de campos del proyecto, en la línea de GLiNER2.
- No soporta generación de texto, razonamiento libre, código, matemáticas, visión ni audio.
- No se documenta soporte de tool calling, function calling ni flujos de agentes multi-paso.
- Capacidad multilingüe limitada al inglés (`language: en`).

## Casos de uso

- Motor de búsqueda de alquileres: el extractor convierte una consulta libre en inglés en campos estructurados (criterios, destino, amenities, desplazamiento) que alimentan el índice de búsqueda; encaja porque su entrenamiento está específicamente orientado a ese vocabulario y esquema.
- Normalización de consultas habladas: la model card menciona una normalización de alquiler hablado en el pipeline local; el modelo puede usarse como paso de extracción previo a reglas deterministas para consultas transcritas.
- Enrutado y filtrado previo: al devolver spans con puntuación de confianza (umbral de 0,5 en la evaluación), permite descartar consultas mal formadas o fuera de dominio antes de llamar a un sistema más costoso.
- Enriquecimiento de anuncios y consultas: extraer destinos y amenities de forma consistente facilita comparar la intención del usuario con los atributos de los listados.
- Pipeline híbrido con reglas deterministas: el autor combina el extractor con reglas, clasificación de opciones soportadas y búsqueda de ubicaciones; el modelo aporta la parte semántica y las reglas cubren los casos cerrados.
- Evaluación y monitorización de calidad de búsqueda: al medir recall y precisión de span exacto sobre consultas nuevas, sirve como componente medible dentro de un sistema de control de calidad del buscador.
- Prototipado rápido de verticales NER: al estar bajo Apache 2.0 y con un modelo base público, es una referencia para adaptar GLiNER2 a otros dominios de extracción.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card, sobre 60 consultas positivas nuevas de alquiler, con umbral de confianza 0,5:

| Metrica | Resultado |
|---|---|
| Recall de span exacto | 94,3 % (198/210) |
| Precisión de span exacto | 95,2 % (198/208) |
| Pipeline local completo (parseo exacto) | 49/60 consultas |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras anteriores son una evaluación interna del autor y no son directamente comparables con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 193,6 millones de parámetros, en FP32 los pesos ocupan aproximadamente 0,77 GB; en FP16 unos 0,39 GB; en INT8 unos 0,19 GB. Estas cifras son estimaciones a partir del recuento de parámetros y no incluyen overhead del runtime ni del tokenizer.
- GPU recomendadas: no disponible. Por tamaño, el modelo es apto para GPU de consumo, pero el autor no publica requisitos ni latencias.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño, aunque no hay confirmación oficial ni lista de modelos probados.
- Opciones de despliegue: la vía documentada es la librería `gliner2` con `AutoExtractor`; el autor no menciona vLLM, llama.cpp, Ollama ni TGI, que además no son el runtime natural para este tipo de extractor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rent K Dubs Search V14 | 193,6 M | no disponible | NER de consultas de alquiler (en) | Apache 2.0 | Hugging Face |
| fastino/gliner2.5-base-v1 | no disponible | no disponible | NER generalista (modelo base) | no disponible en la información proporcionada | Hugging Face |
| GLiNER (familia original) | no disponible | no disponible | NER zero-shot generalista | no disponible en la información proporcionada | Hugging Face / paper |

La comparación cuantitativa con alternativas no está disponible: no hay benchmarks públicos comunes ni datos de rendimiento de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Dominio y idioma restringidos: solo inglés y solo consultas de alquiler; el rendimiento fuera de ese dominio no está caracterizado.
- Evaluación limitada: las métricas provienen de 60 consultas positivas del propio autor, sin conjunto de test público ni comparación independiente; pueden no generalizar.
- Riesgo de falsos positivos y spans parciales: la precisión reportada (95,2 %) implica errores residuales; en producción conviene calibrar el umbral de confianza y validar con datos propios.
- Sin datos de sesgo: la model card no documenta análisis de sesgos demográficos, geográficos o lingüísticos.
- Sin información sobre contexto máximo: no se puede garantizar el comportamiento con consultas muy largas.
- Dependencia del pipeline: el autor señala que el parseo exacto del pipeline completo (49/60) es inferior al recall del extractor, porque intervienen reglas deterministas, clasificación y búsqueda de ubicaciones; el modelo por sí solo no resuelve la tarea extremo a extremo.
- Licencia Apache 2.0: permite uso comercial, pero exige conservar avisos de licencia y atribución; el checkpoint modifica pesos de GLiNER2.5 Base v1 y debe revisarse el `NOTICE` incluido.
- Sin garantías de mantenimiento: el repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere un proyecto pequeño y sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aesthetic0001/rent-k-dubs-search-v14
- Modelo base: https://huggingface.co/fastino/gliner2.5-base-v1
- Paper GLiNER2: https://arxiv.org/abs/2507.18546
- Runbook del extractor: https://github.com/aesthetic0001/rent-k-dubs/tree/main/apps/search
- Definiciones de campos de alquiler: https://github.com/aesthetic0001/rent-k-dubs/blob/main/apps/search/server.py
- Informe de benchmarks: https://github.com/aesthetic0001/rent-k-dubs/blob/main/docs/waterloo-search-benchmarks.md
