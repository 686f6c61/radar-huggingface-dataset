# eole-nlp/Hy-MT2-7B-eole

## Resumen

Hy-MT2-7B-eole es un checkpoint del modelo tencent/Hy-MT2-7B (7.504.568.320 parámetros, pesos en BF16) reconvertido al formato del runtime Eole por el usuario eole-nlp. No se trata de un modelo nuevo ni de un reentrenamiento: es un artefacto de empaquetado cuyo objetivo es permitir cargar los pesos del modelo original con la librería Eole 0.6.4 sin pasar por una conversión manual. El repositorio incluye tokenizador, configuración de runtime, un manifiesto con estadísticas de tensores y digests SHA256, y la documentación y licencia del modelo upstream.

La relevancia de esta ficha es fundamentalmente práctica: el checkpoint no es compatible con Transformers (los nombres de tensores y la configuración son específicos de Eole), por lo que cualquier equipo que quiera servir el modelo con ese runtime necesita exactamente este paquete. El autor declara que los pesos conservan los valores convertidos localmente y que el empaquetado no recuantiza ni normaliza nada; el comportamiento de normalización en FP32 de Eole se mantiene sin cambios.

La información publicada es muy limitada: la model card no documenta arquitectura, longitud de contexto, idiomas ni resultados de benchmarks, y el repositorio acumula 0 descargas y 0 likes en el momento de la consulta. Las validaciones realizadas son pruebas de humo de inferencia offline y comprobación de integridad de ficheros, no evaluaciones de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (la model card no la documenta; el recuento de safetensors indica 7.504.568.320 parámetros totales) |
| Parámetros totales | 7.504.568.320 (aproximadamente 7,5 mil millones) |
| Parámetros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16 para los pesos en coma flotante; no se distribuyen variantes cuantizadas (GGUF, AWQ, GPTQ) en este repositorio |
| Idiomas soportados | No disponible (la model card no los declara; el sufijo «MT» del modelo base sugiere traducción automática, pero es una inferencia no confirmada) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en BF16, con nombres de tensores y configuración específicos de Eole (no es un checkpoint Transformers) |
| Modelo base | tencent/Hy-MT2-7B (revisión upstream cacheada: 9b0eb4e8f001def3e5ff6469a0ac96fdb39ec223) |
| Runtime requerido | Eole 0.6.4 con las dependencias opcionales de la arquitectura |
| Tamaño del repositorio | 15,0 GB |
| Revisión de Eole usada | 0c9b3f7ea253b1b977ef47a01ef2a8c6b130f22b |
| Precisión en inferencia | BF16 (normalización FP32 sin cambios respecto a Eole) |
| Publicación en el Hub | 2026-10-20 (según metadatos) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se han publicado detalles de arquitectura ni de entrenamiento en la información disponible. La model card de este repositorio es exclusivamente de empaquetado: describe el proceso de conversión, el formato y las validaciones, pero no reproduce la ficha técnica del modelo original. Se sabe que los pesos proceden de tencent/Hy-MT2-7B, que el checkpoint contiene 7.504.568.320 parámetros y que se almacenan en BF16, lo que sitúa al modelo en la clase de 7-8B. No hay datos sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas (atención lineal, decodificación especulativa, arquitecturas híbridas) porque la documentación upstream no está incluida en la información proporcionada.

El único detalle técnico diferencial es el propio proceso de conversión. El autor advierte que los pesos mantienen los valores convertidos localmente y que este paso de empaquetado no recuantiza ni normaliza, y que el comportamiento de normalización en FP32 de Eole se conserva. El repositorio incluye `model-manifest.json` con estadísticas de tensores y digests SHA256 por fichero, además de `UPSTREAM_README.md` y la licencia original. La procedencia exacta del convertidor no quedó registrada: la revisión upstream cacheada es metadato de referencia, no un registro verificado de conversión, lo que limita la trazabilidad completa del artefacto.

## Capacidades

- Generación de texto: la etiqueta de pipeline es `text-generation` y el modelo se distribuye con tokenizador y configuración de runtime incluidos.
- Conversación: la etiqueta `conversational` aparece en los metadatos del repositorio, lo que indica soporte de formato de diálogo, sin que se detallen plantillas de prompt en la información disponible.
- Traducción automática: no confirmada en esta ficha; el nombre del modelo base (Hy-MT2) apunta a esa familia, pero la model card no declara tareas, idiomas ni pares lingüísticos.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declara lista de idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Carga en runtime Eole: verificada mediante pruebas de humo de inferencia offline, tanto en el paquete local portátil como en una descarga privada del Hub.

## Casos de uso

- Servicio de inferencia con Eole: cargar el checkpoint directamente con Eole 0.6.4 usando `compute_dtype: bf16` y servir el modelo sin escribir un convertidor propio; es el escenario para el que se publicó el artefacto y el único documentado explícitamente.
- Despliegue reproducible en producción: descargar un commit fijado del Hub con `huggingface_hub.snapshot_download` y pasar el directorio resultante como `model_path`, lo que permite fijar la versión exacta de pesos y tokenizador y verificar los SHA256 del manifiesto en cada despliegue.
- Entornos aislados o air-gapped: el paquete es portátil (las rutas usan `${MODEL_PATH}`), de modo que puede moverse a una máquina sin acceso al Hub y validarse contra `validation.json` antes de exponerlo a tráfico.
- Auditoría de integridad de pesos: usar `model-manifest.json` con los digests SHA256 y las estadísticas de tensores para comparar el artefacto con la revisión upstream de referencia y detectar corrupciones o modificaciones en la cadena de conversión.
- Base para evaluación comparativa interna: al ser un checkpoint BF16 de 7,5B con licencia Apache-2.0, sirve como punto de partida para pruebas de calidad propias (traducción, generación, diálogo) cuando no existe una evaluación publicada del modelo original.
- Integración en pipelines de investigación con recetas de Eole: el repositorio enlaza a las recetas del proyecto (`recipes`) con prompts y configuraciones de serving específicas por modelo, lo que facilita incorporar el checkpoint a flujos de experimentación ya basados en ese runtime.
- Ajuste fino posterior: los pesos en BF16 y la licencia Apache-2.0 permiten partir de este checkpoint para fine-tuning, siempre que el equipo asuma la conversión de vuelta al formato de su framework de entrenamiento, ya que el paquete está pensado para inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta validaciones funcionales, que no constituyen una evaluación de calidad:

| Prueba declarada | Resultado |
|---|---|
| Inferencia offline del paquete local portátil | Superada (smoke test) |
| Inferencia offline tras descarga limpia desde Hub privado | Superada (smoke test) |
| Coincidencia de digests SHA256 con el manifiesto publicado | Todos los ficheros coinciden |
| Evaluación de benchmarks (MMLU, HumanEval, GSM8K, WMT, etc.) | No realizada / no publicada |
| Throughput y latencia medidos | No disponibles |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 15 GB solo para pesos (7,5B × 2 bytes), más caché KV y activaciones; en la práctica se necesitan del orden de 18-20 GB para contextos cortos, y más si el contexto es largo (longitud de contexto no documentada).
- GPU recomendadas: A100 40 GB, A100 80 GB, H100 80 GB y L40S 48 GB para servir con margen; una RTX 4090 de 24 GB es suficiente para los pesos en BF16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 / RTX 3090 (24 GB) en BF16; en tarjetas de 16 GB no entra sin cuantización, y este repositorio no distribuye variantes cuantizadas.
- Opciones de despliegue: runtime Eole 0.6.4 (con dependencias opcionales de la arquitectura) es la vía soportada. No se documentan instrucciones para vLLM estándar, TGI, llama.cpp u Ollama; al no ser un checkpoint Transformers, su uso en esos motores requeriría una conversión no incluida en el repositorio.
- Latencia y throughput: no disponibles (no hay mediciones publicadas; las validaciones son pruebas de humo sin cifras de rendimiento).
- Almacenamiento: 15,0 GB para el repositorio completo, más espacio temporal durante la descarga y verificación de digests.

## Comparativa con modelos similares

No hay datos de benchmarks que permitan comparar rendimiento con alternativas. La comparación viable se limita al propio linaje del artefacto:

| Modelo | Parámetros | Formato / runtime | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eole-nlp/Hy-MT2-7B-eole | 7.504.568.320 | safetensors BF16, específico de Eole 0.6.4 | No disponible | Apache-2.0 | Hub, 0 descargas, 0 likes |
| tencent/Hy-MT2-7B (upstream) | No disponible en esta ficha | Checkpoint original del autor; presumiblemente compatible con su stack de referencia | No disponible | Apache-2.0 (según el paquete) | Hub (revisión 9b0eb4e8…) |
| Otros modelos de ~7B de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han identificado en la información proporcionada modelos comparables con datos verificables de parámetros, contexto o rendimiento; cualquier comparación cuantitativa con alternativas de 7B sería especulativa.

## Limitaciones y advertencias

- Trazabilidad incompleta: el autor indica que el commit del convertidor y la vinculación exacta con la revisión fuente no quedaron registrados; la revisión upstream cacheada es metadato de referencia, no una prueba de conversión.
- Compatibilidad restringida: no es un checkpoint Transformers. Cargarlo con `transformers`, vLLM estándar, llama.cpp u Ollama fallará o requerirá conversión; el soporte está acotado a Eole 0.6.4 con dependencias opcionales.
- Ausencia total de benchmarks: no hay métricas de calidad, y las pruebas de humo solo verifican que la inferencia funciona y que los ficheros son íntegros.
- Documentación upstream no incluida en esta ficha: se desconoce la arquitectura exacta, la longitud de contexto, los idiomas y las tareas para las que el modelo fue entrenado; el uso en producción sin esa información es arriesgado.
- Idiomas no declarados: no se puede garantizar cobertura lingüística, y el rendimiento en castellano es desconocido.
- Riesgo de alucinación y sesgos: no evaluados ni documentados para este checkpoint; deben asumirse los del modelo base, que tampoco se detallan aquí.
- Adopción nula: 0 descargas y 0 likes implican ausencia de validación independiente por parte de la comunidad.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero el usuario debe conservar la atribución y la licencia upstream incluida en el repositorio; conviene revisar `UPSTREAM_README.md` para condiciones adicionales del autor original.
- Fecha de publicación en el Hub (2026-10-20) y estado del artefacto: conviene fijar un commit concreto y verificar los SHA256 antes de desplegar, dado que el repositorio puede actualizarse sin aviso.

## Enlaces

- HuggingFace (este checkpoint): https://huggingface.co/eole-nlp/Hy-MT2-7B-eole
- Modelo base: https://huggingface.co/tencent/Hy-MT2-7B
- Repositorio de Eole: https://github.com/eole-nlp/eole
- Recetas de Eole (prompts y configuraciones de serving): https://github.com/eole-nlp/eole/tree/main/recipes
- Ficheros de referencia dentro del repo: `model-manifest.json`, `validation.json`, `UPSTREAM_README.md` y licencia incluida.
- Búsquedas web: no se han encontrado papers, blogs ni demos técnicos sobre este checkpoint. Las consultas por «Eole» devuelven entidades no relacionadas (servicio de biblioteca accesible, asociación de vivienda, fabricante de mobiliario, proyecto de infraestructura RER E y el personaje mitológico), por lo que no se incluyen como fuentes.
