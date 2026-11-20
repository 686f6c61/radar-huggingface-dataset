# Oummadi/html2json-gemma-3-270m-it

## Resumen

Oummadi/html2json-gemma-3-270m-it es un ajuste fino (fine-tuning) del modelo google/gemma-3-270m-it, publicado por el usuario Oummadi en Hugging Face. El nombre del repositorio y la etiqueta `html2json` indican que el objetivo declarado del ajuste es la conversion de documentos HTML a representaciones JSON, una tarea tipica de extraccion estructurada de datos en pipelines de scraping y procesamiento web. El modelo se distribuye en formato safetensors con un total de 435.870.336 parametros reales segun los metadatos del repositorio, lo que incluye los pesos del modelo base mas la cabeza de embeddings y capas asociadas.

Se trata de un modelo de la familia Gemma 3 en su variante mas pequena (270M), disenado por Google para generacion de texto y conversacion. El ajuste fino conserva la arquitectura transformer decoder-only del original, pero no se ha publicado informacion sobre el dataset de entrenamiento, el proceso de ajuste ni los hiperparametros utilizados. El repositorio no incluye una model card detallada: la descripcion se limita a una linea indicando el modelo base.

La relevancia de este modelo es limitada en el ecosistema actual: cuenta con 0 descargas y 0 likes en el momento de la consulta, no declara licencia ni idiomas soportados, y no aporta benchmarks ni documentacion tecnica. Resulta util unicamente como referencia de un experimento de ajuste fino sobre Gemma 3 270M para una tarea concreta, y no como una opcion madura para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 text), segun tag `gemma3_text` |
| Parametros totales | 435.870.336 (safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de google/gemma-3-270m-it, un transformer decoder-only de la familia Gemma 3 orientado a generacion de texto y conversacion. El tag `gemma3_text` confirma que se trata de la variante exclusivamente de texto (no multimodal) dentro de la familia Gemma 3. El numero de parametros reportado por safetensors (435.870.336) es superior al nominal de 270M del modelo base, lo que es coherente con la inclusion de embeddings y capas adicionales en el conteo total de tensores.

No se dispone de informacion sobre el dataset de ajuste fino, el numero de tokens utilizados, la composicion de los datos HTML/JSON, ni sobre si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado clasico. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). La unica informacion verificable es que el modelo base es google/gemma-3-270m-it y que el ajuste se etiqueta como `html2json`.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Gemma 3 270M IT.
- Conversion de HTML a JSON, segun la etiqueta `html2json` del repositorio; no se documenta el formato exacto de entrada/salida ni la cobertura de casos.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (thinking mode, vision, audio): no disponible; el tag `gemma3_text` sugiere ausencia de vision.

## Casos de uso

- Extraccion estructurada de datos web: el modelo podria emplearse para transformar fragmentos HTML en objetos JSON, por ejemplo para convertir fichas de producto, listados o tablas HTML en registros estructurados listos para una base de datos. Es el caso de uso declarado por el nombre del repositorio, aunque no se aportan ejemplos ni validacion.
- Scraping asistido en pipelines ETL: integrado como paso de post-procesado que normaliza HTML heterogeneo a un esquema JSON fijo antes de cargarlo en un almacen analitico.
- Prototipado rapido de parsers: al ser un modelo de 270M, puede ejecutarse en hardware modesto para experimentar con esquemas de conversion HTML→JSON antes de invertir en un parser deterministico o en un modelo mayor.
- Generacion de fixtures de prueba: usar el modelo para producir pares HTML/JSON sinteticos que alimenten tests de validacion de esquemas.
- Normalizacion de contenido en tareas de documentacion tecnica: convertir fragmentos HTML de manuales o wikis a JSON para alimentar indices de busqueda.
- Educacion y experimentacion: servir como ejemplo de ajuste fino de un modelo pequeno de Gemma 3 para una tarea de extraccion, util en cursos o talleres sobre fine-tuning.

En todos los casos, la ausencia de benchmarks, licencia e idiomas declarados obliga a validar el comportamiento empiricamente antes de cualquier uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 435,9M de parametros, en fp16 requiere aproximadamente 0,9 GB solo para pesos; en fp32 unos 1,7 GB; en cuantizacion de 8 bits alrededor de 0,5 GB y en 4 bits en torno a 0,3 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM es suficiente para fp16; una RTX 3060, RTX 4060 o superior permite inferencia comoda. Para despliegue por lotes, A100 o H100 no son necesarias dado el tamano.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con 4 GB o mas de VRAM.
- Opciones de despliegue: transformers (con safetensors), vLLM, TGI y llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas en el repo).
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Oummadi/html2json-gemma-3-270m-it | 435,9M (safetensors) | no disponible | no disponible | Hugging Face, 0 descargas | Ajuste fino para HTML→JSON sin documentacion |
| google/gemma-3-270m-it | 270M (nominal) | no disponible en esta ficha | Gemma Terms of Use (modelo base) | Hugging Face, ampliamente disponible | Modelo base oficial de Google |
| Qwen2.5-0.5B-Instruct | 0,5B | 32K (segun documentacion publica de Qwen) | Apache 2.0 | Hugging Face | Alternativa pequena para tareas de extraccion |
| SmolLM2-360M-Instruct | 360M | 8K (segun documentacion publica) | Apache 2.0 | Hugging Face | Alternativa ligera para generacion y extraccion |

La comparativa se limita a parametros y licencia; no hay datos de rendimiento del modelo ajustado que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- No se declara licencia en el repositorio, lo que impide determinar si el uso comercial esta permitido; ademas, el modelo base Gemma 3 esta sujeto a los Gemma Terms of Use de Google, que imponen restricciones adicionales.
- No se documentan los idiomas soportados; el modelo base Gemma 3 es multilingue, pero el ajuste fino puede haber degradado el rendimiento en idiomas distintos del usado en el dataset (desconocido).
- No se publican benchmarks ni ejemplos de entrada/salida, por lo que el rendimiento real en la tarea HTML→JSON es desconocido.
- Riesgo de alucinacion: como todo modelo generativo de 270M, puede inventar claves o valores JSON no presentes en el HTML de entrada; se recomienda validacion con esquema (JSON Schema) en produccion.
- Longitud de contexto no documentada; fragmentos HTML largos pueden truncarse o degradar la calidad de la conversion.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni de validacion independiente.
- El conteo de parametros en safetensors (435,9M) difiere del nominal del modelo base (270M), lo que puede reflejar embeddings adicionales o un conteo distinto; conviene verificar la configuracion antes de desplegar.
- No se han publicado cuantizaciones GGUF ni versiones optimizadas para llama.cpp u Ollama.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Oummadi/html2json-gemma-3-270m-it
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
