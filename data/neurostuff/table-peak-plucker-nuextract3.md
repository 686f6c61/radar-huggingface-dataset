# neurostuff/table-peak-plucker-nuextract3

## Resumen

`table-peak-plucker-nuextract3` es un modelo especializado en extracción de información estructurada a partir de tablas de resultados de artículos de neuroimagen. Lo desarrolla el equipo de **neurostuff** (proyecto ns-pond) como un fine-tune de [`numind/NuExtract3`](https://huggingface.co/numind/NuExtract3), y su tarea concreta es localizar cada coordenada cerebral impresa en una tabla estadística y decidir a qué análisis pertenece, además de reportar el espacio de coordenadas y etiquetar cada estadístico.

El modelo resuelve un problema muy específico de los pipelines de neurociencia: la ingestión automatizada de resultados de neuroimagen publicados (meta-análisis tipo NeuroSynth/NeuroVault). En lugar de un extractor genérico, se entrena sobre tablas reales y sintéticas de neuroimagen para distinguir picos de conectividad por semilla, centros de ROI, índices de vóxel o copias en segundo espacio, algo que los modelos generalistas confunden con frecuencia.

Técnicamente es un modelo multimodal de tipo image-text-to-text con arquitectura híbrida (atención transformer más capas Mamba, dado que el autor menciona tensores `A_log`, `dt_bias` y convoluciones de Mamba), 4.539.265.536 parámetros y pesos en safetensors publicados como pesos fusionados (no como adaptador LoRA). La relevancia actual radica en que demuestra un flujo de trabajo reproducible de fine-tuning vertical sobre un extractor de documentos moderno, con evaluación honesta en un benchmark propio (neurometabench) y versionado por tags dentro del mismo repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida transformer + capas Mamba (según referencias a `A_log`, `dt_bias` y convoluciones de Mamba en la model card); pipeline `image-text-to-text` |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; el autor sirve con vLLM) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (pesos fusionados; el repo ocupa 27,3 GB) |

## Arquitectura y entrenamiento

El modelo parte de `numind/NuExtract3` (revisión `c99dc8f5641b866aa0192b6ea78f84bf9f3535f1`) y se ajusta mediante LoRA más el entrenamiento directo de 177 tensores que LoRA no cubre: `A_log`, `dt_bias`, las convoluciones y las normas de las capas Mamba. El autor advierte explícitamente que cargar solo el adaptador sería incorrecto en silencio, de ahí que se publiquen pesos fusionados. El entrenamiento se realizó sobre 3 GPU A100, con 2 épocas, learning rate 1e-4 y batch global aproximado de 33.

Los datos de entrenamiento son el dataset privado `neurostuff/table-peak-plucker-nuextract3` (versión `neuro-tables`), con provenance registrada como commit sha en `provenance.json` dentro de cada release. La versión v23, sobre la que se publican estos pesos, parte de los datos de v22 con dos cambios: (1) toda fila de tres números impresos se trata como un punto, sea semilla, centro de ROI, pico de otro estudio, índice de vóxel o diana de estimulación, y (2) los pares semilla/anatomía generados se regeneraron para que un centro de semilla impreso junto a su semilla constituya su propio análisis (`Seed: <nombre>`). Los pesos publicados corresponden al paso de checkpoint 1.800 de 1.997, elegido sobre la mitad de tuning de neurometabench antes de puntuar la mitad de test.

## Capacidades

- Extracción estructurada de coordenadas cerebrales a partir de tablas de resultados en artículos de neuroimagen.
- Agrupación de coordenadas por análisis estadístico (qué picos pertenecen a qué contraste, semilla o bloque).
- Detección y reporte del espacio de coordenadas (por ejemplo, MNI) y etiquetado de cada estadístico.
- Procesamiento de entradas de tipo imagen y texto (pipeline `image-text-to-text`), orientado a tablas renderizadas.
- Salida estructurada compatible con decodificación restringida por gramática (vLLM `structured_outputs` con la plantilla como JSON schema).
- Integración como cliente en el flujo ns-pond (`ingestion_workflow/clients/coordinate_parsing.py`), una petición por tabla.
- No se documentan capacidades de tool calling, agentes, audio ni modo de razonamiento extendido.

## Casos de uso

- Ingestión automatizada de meta-análisis de neuroimagen: el modelo lee cada tabla de resultados de un paper y devuelve las coordenadas con su análisis asociado, sustituyendo la extracción manual en pipelines tipo NeuroSynth/NeuroVault.
- Construcción de bases de datos de coordenadas cerebrales: al reportar espacio de coordenadas y estadísticos, permite poblar esquemas relacionales con picos, contrastes y semillas sin intervención humana en cada fila.
- Deduplicación de picos entre espacios: el modelo distingue copias en segundo espacio de un mismo pico, lo que evita duplicar coordenadas al consolidar resultados de varios papers.
- Separación de tablas de conectividad por semilla: en tablas donde cada semilla tiene su bloque de picos, el modelo asigna cada coordenada a su semilla, algo que el autor mide explícitamente en tablas frescas de semilla/anatomía.
- Verificación de extracciones previas: reejecutar el modelo sobre tablas ya procesadas para detectar errores sistemáticos (áreas de Brodmann leídas como coordenada x, columnas desplazadas), un caso que el autor cuantifica en 935 tablas cambiadas de 4.006.
- Enriquecimiento de revisiones sistemáticas: procesar lotes de PDFs convertidos a imagen de tabla y obtener coordenadas normalizadas para análisis de coordinación anatómica a escala de miles de estudios.
- Control de calidad en publicación: comparar las coordenadas impresas en una tabla con las extraídas por el modelo para señalar discrepancias antes de depositar datos en un repositorio público.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados bajo el prompt de producción, decodificación greedy y tolerancia de 2 mm. La mitad de test de neurometabench comprende 204 papers y 451 tablas.

| Modelo | Recall (test) | Agrupación | Bucles | Tablas frescas de semilla: exacto | Tablas frescas de anatomía: exacto |
|---|---|---|---|---|---|
| v21 | 73,0% | 93,6% | 0 | 24,0% | 100% |
| v22 | 73,7% | 94,5% | 0 | 87,3% | 100% |
| v23 (estos pesos) | 74,0% | 94,8% | 1 | 86,7% | 100% |
| v23 con reintento restringido | 74,5% | 94,8% | 0 | no disponible | no disponible |

En la mitad de tuning, v23 alcanza un 65,3% de recall frente al 63,4% de v22. El autor señala que, sobre coordenadas extraídas por humanos, v23 empata con v22 y las diferencias están dentro del ruido. No se publican resultados en benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El repo de pesos ocupa 27,3 GB en safetensors, lo que corresponde a unos 4.539 millones de parámetros en precisión de 16 bits; la inferencia requiere al menos esa huella de memoria más overhead de activaciones y caché.
- El autor entrena y sirve con 3 GPU A100; el despliegue de referencia es vLLM con nombre versionado (`nu-v23` para v23) y decodificación restringida por gramática.
- No se documentan requisitos de VRAM por cuantización ni versiones GGUF; no hay datos publicados sobre ejecución en GPU de consumo como RTX 4090.
- Opciones de despliegue documentadas: vLLM con `structured_outputs`; la librería declarada es `transformers` con `AutoModelForCausalLM.from_pretrained`. No se mencionan llama.cpp, Ollama ni TGI.
- Estrategia de reintento recomendada: si una tabla entra en bucle o no parsea, repetir con la plantilla como gramática y `repetition_penalty` 1.1; el autor indica que un valor de 1.2 pierde puntos y que la gramática sola sigue produciendo bucles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| table-peak-plucker-nuextract3 (v23) | 4.539 M | no disponible | Extracción de coordenadas en tablas de neuroimagen | Apache 2.0 | Hugging Face, tags por versión |
| numind/NuExtract3 (base) | no disponible | no disponible | Extracción estructurada de documentos genérica | no disponible en la información | Hugging Face |
| neurostuff/paragraph-peak-picker-nuextract3 | no disponible | no disponible | Extracción de coordenadas escritas en prosa | no disponible en la información | Hugging Face |
| v22 del mismo modelo | idénticos (mismo fine-tune) | no disponible | Igual, con reglas de datos anteriores | Apache 2.0 | Tag `v22` en el mismo repo |

La comparación cuantitativa disponible es interna al proyecto: v23 supera a v22 en recall (74,0% frente a 73,7%) y agrupación (94,8% frente a 94,5%), pero v22 obtiene mejor exactitud en tablas frescas de semilla (87,3% frente a 86,7%). No se dispone de comparación con extractores genéricos de documentos.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para tablas de resultados de neuroimagen; su uso fuera de ese dominio no está validado.
- La regla de centros de semilla de v23 no funcionó: en ninguna de las 28 tablas frescas de semilla que imprimen un centro se genera un análisis `Seed:`, y el centro acaba entre los picos conectados. Hay que tratar los puntos de una tabla de semilla como posiblemente inclusivos de sus centros.
- Se observó un bucle en una tabla de test que repite puntos hasta el límite de tokens; requiere reintento con gramática y penalización de repetición.
- Los pesos publicados son el paso 1.800 de 1.997, no el final del entrenamiento; el autor eligió el paso sobre la mitad de tuning antes de puntuar la de test.
- Las diferencias frente a v22 en coordenadas humanas están dentro del ruido (−0,07 ± 0,79 puntos de recall por paper), por lo que no debe esperarse una mejora sustancial en ese subconjunto.
- Riesgo de alucinación: el modelo puede inventar coordenadas o asignar análisis incorrectos en tablas con maquetación atípica; el autor documenta errores de lectura previos (áreas de Brodmann como x, columnas desplazadas) corregidos en los datos, no necesariamente ausentes en producción.
- Licencia Apache 2.0 permite uso comercial, pero la model card no incluye avisos sobre sesgos, idiomas ni condiciones de atribución adicionales; no se documentan idiomas soportados.
- El dataset de entrenamiento es privado; la reproducibilidad depende de los commits registrados en `provenance.json`, no de un dataset público.
- La carga como adaptador LoRA sería incorrecta en silencio por los 177 tensores de Mamba entrenados directamente; hay que cargar los pesos fusionados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neurostuff/table-peak-plucker-nuextract3
- Modelo base NuExtract3: https://huggingface.co/numind/NuExtract3
- Modelo hermano para prosa: https://huggingface.co/neurostuff/paragraph-peak-picker-nuextract3
- Dataset de entrenamiento (tags por versión): https://huggingface.co/datasets/neurostuff/table-peak-plucker-nuextract3/tree/v23
- Flujo de ingestión ns-pond: https://github.com/neurostuff/ns-pond-ingestion-workflow
