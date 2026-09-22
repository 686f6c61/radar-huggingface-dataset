# MissingPackage/jev-d-0.4b-onnx

## Resumen

Jev-d-0.4b-onnx es una exportación a formato ONNX en precisión FP32 de `convaiinnovations/laya-typed-decisions`, publicada por el usuario MissingPackage. No se trata de un modelo entrenado desde cero ni de un ajuste fino: la model card indica explícitamente que los pesos son numéricamente idénticos al checkpoint original, sin reentrenamiento, fine-tuning ni destilación. Su propósito es hacer ejecutable el modelo base en entornos sin Python, en particular en el navegador mediante `onnxruntime-web` con el backend WebGPU.

El modelo es de tipo *feature-extraction* y no genera texto: recibe un lote de identificadores y devuelve `logits`, con una fila por pregunta. Su secuencia de entrada sigue un formato fijo con tokens especiales (`[CLS]`, `[SEP]`, `[MASK]`) que codifica un tipo, unas instrucciones, un conjunto de opciones y un estado serializado. Esto lo sitúa en la categoría de modelos de puntuación y decisión tipada, no en la de asistentes conversacionales.

Su relevancia actual es acotada pero concreta: permite llevar un modelo de ~0,4 mil millones de parámetros a aplicaciones web que corren íntegramente en el cliente, sin backend de inferencia. El repositorio ocupa 1,7 GB, tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y la documentación disponible se centra en los detalles de integración y en los fallos silenciosos que pueden producirse al cargarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. Es una conversión de formato del modelo base `convaiinnovations/laya-typed-decisions`; la firma de entradas y salidas es compatible con un codificador de tipo transformer |
| Parámetros totales | Aproximadamente 400 millones (deducido del identificador `0.4b`; no confirmado en la documentación) |
| Parámetros activos | No aplica: no hay indicios de arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | FP32 (ONNX). No se publican variantes cuantizadas en el repositorio |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0, heredada del modelo base. El autor remite al archivo `NOTICE` |
| Formato de pesos | ONNX: grafo `.onnx` más datos externos en un archivo lateral `.onnx.data` |
| Tarea (*pipeline*) | `feature-extraction` |
| Librería | `onnxruntime` |
| Tamaño del repositorio | 1,7 GB |
| Modelo base | `convaiinnovations/laya-typed-decisions` (relación: cuantizado/convertido) |
| Entradas | `input_ids`, `attention_mask`, `marker_pos`, `marker_mask`, `qtype`, todas `int64` |
| Salida | `logits`, una fila por pregunta |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna del modelo base ni su proceso de entrenamiento. Lo único verificable es que se trata de una conversión de formato: los pesos son idénticos a los del checkpoint `laya-typed-decisions`, y no hubo reentrenamiento, ajuste fino ni destilación. Por tanto, cualquier afirmación sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF o DPO, o innovaciones técnicas del modelo original queda fuera de la información disponible.

Lo que sí describe la documentación es el contrato de inferencia. La secuencia de entrada tiene la forma `[CLS] <type> question: instructions [SEP] [MASK] opt0 [MASK] opt1 ... [SEP] state [SEP]`, es decir, un esquema de decisión tipada con opciones enmascaradas y un campo de estado serializado. El grafo se trazó con K >= 2, de modo que exige al menos dos opciones por pregunta. Junto al grafo se distribuye un `meta.json` que contiene los presupuestos, los tokens especiales y las temperaturas ajustadas, lo que sugiere que el modelo produce puntuaciones calibradas por tipo de decisión. Un detalle relevante: el *bucket* `choice:11+` del checkpoint tiene una temperatura de `0.1006`, cuyo efecto sobre los logits el autor considera desproporcionado, por lo que recomienda aplicar un recorte al intervalo `[0.5, 5.0]`.

## Capacidades

- Puntuación de decisiones tipadas: dado un conjunto de opciones (K >= 2) y un estado, produce `logits` por pregunta.
- Extracción de características: es la tarea declarada del *pipeline*, orientada a representaciones internas más que a generación.
- Ejecución en navegador: compatible con `onnxruntime-web` usando el *execution provider* WebGPU.
- Procesamiento por lotes: la salida devuelve una fila de logits por cada pregunta incluida en la entrada.
- Condicionamiento por tipo y estado: `qtype` permite etiquetar el tipo de decisión y `state` inyecta contexto serializado.
- Temperaturas ajustadas por bucket: `meta.json` incluye valores de temperatura ya calibrados (con versión bruta y recortada).
- No dispone de generación de texto libre, tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No dispone de capacidades de visión ni de audio.
- Multilingüismo: únicamente inglés.

## Casos de uso

- Clasificación de decisiones en aplicaciones web sin backend: el modelo se carga con `onnxruntime-web` y WebGPU, de modo que el usuario puede resolver una decisión tipada íntegramente en el cliente, sin enviar datos a un servidor.
- Enrutado de intenciones en formularios interactivos: dado un tipo (`qtype`) y un estado serializado, el modelo puntúa opciones y permite preseleccionar la más probable antes de que el usuario confirme.
- Recomendación entre alternativas con contexto acumulado: el campo `state` permite arrastrar el historial de elecciones previas y recalcular las puntuaciones con cada nueva pregunta.
- Anotación automática de datasets de decisión: la salida de logits por pregunta puede usarse para etiquetar grandes volúmenes de ejemplos de elección múltiple en inglés, siempre que cada ítem tenga al menos dos opciones.
- Aplicaciones progresivas offline: al no requerir Python ni servidor, encaja en PWA que deben funcionar sin conectividad una vez descargado el repositorio de 1,7 GB.
- Experimentación con calibración de temperaturas: el `meta.json` expone temperaturas por bucket, lo que facilita estudiar cómo el recorte `[0.5, 5.0]` modifica las probabilidades finales en el bucket `choice:11+`.
- Integración en *pipelines* de anotación con onnxruntime en servidor: aunque su destino principal es el navegador, el mismo grafo puede ejecutarse con `onnxruntime` en Python o C++ si se respeta el contrato de datos externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de precisión, latencia ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,6 GB solo para los pesos en FP32, más el *overhead* del runtime. En la práctica, asignar entre 2 y 3 GB de memoria es un margen razonable.
- GPU de servidor: cualquier GPU con soporte de ONNX Runtime, como A100, H100, L4 o T4, es sobredimensionada para un modelo de este tamaño pero funciona.
- GPU de consumo: cabe sin problema en GPU integradas y dedicadas modernas; el requisito real es que el navegador y la GPU expongan WebGPU.
- Ejecución en CPU: viable por el tamaño reducido del modelo, aunque sin datos de latencia publicados.
- Opciones de despliegue: `onnxruntime-web` con WebGPU (el caso documentado), `onnxruntime` en Python, C++ o C#. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo con pesos en safetensors o GGUF.
- Latencia y *throughput* estimados: no disponible.

## Comparativa con modelos similares

No disponible. La documentación no incluye comparaciones con otros modelos, no se han publicado benchmarks y no hay datos de rendimiento que permitan establecer una comparación rigurosa con alternativas de la misma categoría o tamaño.

## Limitaciones y advertencias

- Conversión, no modelo nuevo: no aporta capacidades distintas de las del checkpoint original `convaiinnovations/laya-typed-decisions`; cualquier limitación del modelo base se hereda íntegramente.
- Fallo silencioso por ruta de datos externos: `externalData.path` es la cadena almacenada dentro del grafo, no el nombre del archivo servido. Renombrar el archivo no renombra la referencia interna y la carga puede fallar sin un mensaje claro.
- Fallo silencioso por nivel de optimización: `graphOptimizationLevel` debe ser `"basic"`. Con `"all"`, el optimizador fusiona residual y LayerNorm en `SkipLayerNormalization`, que el kernel WebGPU de `onnxruntime-web` rechaza con el error «Beta must be 1D».
- Restricción de formato: el grafo se trazó con K >= 2, así que no admite preguntas con una sola opción.
- Fragilidad en la serialización del estado: el campo `state` debe serializarse con el espaciado de JSON de Python (`", "` y `": "`). Un solo espacio ausente produce una secuencia de tokens distinta, una respuesta distinta y ningún error en ningún punto de la cadena.
- Temperaturas extremas: el valor bruto del bucket `choice:11+` es `0.1006`; sin recorte, multiplica los logits aproximadamente por diez y convierte una probabilidad máxima de 0,24 en 0,99. Hay que aplicar el intervalo `[0.5, 5.0]`.
- Solo inglés: no hay soporte multilingüe declarado.
- Sin benchmarks ni validación externa publicada: el repositorio tiene 0 descargas y 0 likes, por lo que no existe evidencia comunitaria de funcionamiento en producción.
- Licencia: Apache 2.0 permite uso comercial, pero el autor remite al archivo `NOTICE` del repositorio; conviene revisarlo antes de redistribuir.
- Tamaño de descarga elevado: 1,7 GB en FP32, poco adecuado para clientes con conexiones lentas o con cuotas de datos restrictivas.
- Riesgo de alucinación: no aplica en el sentido generativo habitual, ya que el modelo no produce texto libre; el riesgo equivalente es una calibración incorrecta de las puntuaciones si no se respetan las temperaturas y los recortes documentados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/MissingPackage/jev-d-0.4b-onnx
- Modelo base: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Documentación de `onnxruntime-web`: https://onnxruntime.ai/docs/tutorials/web/
- Los resultados de la búsqueda web realizada no contienen información relevante sobre este modelo: corresponden a una empresa de iluminación checa (HELLUX ELEKTRA s.r.o.) y a su tienda online, sin relación con el modelo.
