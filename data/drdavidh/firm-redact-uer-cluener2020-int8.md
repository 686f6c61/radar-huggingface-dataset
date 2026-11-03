# DrDavidH/firm-redact-uer-cluener2020-int8

## Resumen

firm-redact-uer-cluener2020-int8 es una compilación ONNX cuantizada a INT8 del modelo chino `uer/roberta-base-finetuned-cluener2020-chinese`, desarrollado por el autor de HuggingFace DrDavidH como componente del pipeline de redacción de datos personales (PII) en chino de la herramienta firm-redact. El modelo resuelve la tarea de reconocimiento de entidades nombradas (NER) sobre texto en chino, etiquetando entidades como nombres de persona, direcciones, empresas, organizaciones y cargos, entre otras diez categorías definidas por el corpus CLUENER2020.

La relevancia de esta ficha es práctica: se trata de un artefacto de despliegue, no de un modelo entrenado desde cero. La arquitectura subyacente es un transformer BERT/RoBERTa base (el modelo original de UER-py está basado en RoBERTa para chino), exportado a ONNX con opset 17 y cuantizado dinámicamente con `onnxruntime.quantization.quantize_dynamic` en formato QInt8, lo que permite ejecución en CPU sin GPU. El repositorio ocupa aproximadamente 0,1 GB y el único peso publicado (`model.int8.onnx`) tiene 102.458.627 bytes.

El modelo está pensado como una etapa intermedia dentro de una cadena de redacción que combina reglas, NER y revisión humana; el autor advierte explícitamente de que su salida no es lo bastante fiable para usarse sin supervisión. No se han publicado resultados de benchmarks ni métricas de evaluación en la información disponible, y la licencia queda sin especificar en el modelo upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT/RoBERTa base (modelo upstream de UER-py), exportado a ONNX opset 17 |
| Parametros totales | no disponible (modelo base tipo base; el peso INT8 ocupa 102.458.627 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamico (QInt8) via `onnxruntime.quantization.quantize_dynamic` |
| Idiomas soportados | chino (zh) |
| Licencia | other / upstream-unspecified (el modelo upstream no declara licencia explicita) |
| Formato de pesos | ONNX (`model.int8.onnx`); tokenizer y config copiados del modelo upstream |

## Arquitectura y entrenamiento

El modelo es una compilación de despliegue: no se ha reentrenado nada. La arquitectura subyacente corresponde al modelo `uer/roberta-base-finetuned-cluener2020-chinese`, un encoder transformer de tipo RoBERTa para chino afinado por los autores de UER-py sobre el corpus CLUENER2020 para token classification. Sobre esa base, DrDavidH realizó una exportación a ONNX (opset 17) seguida de cuantización dinámica a INT8 con ONNX Runtime, que cuantiza los pesos de las capas lineales en tiempo de carga y deja las activaciones en punto flotante durante la inferencia.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset más allá de CLUENER2020, ni sobre si hubo RLHF, DPO u otras fases de alineación. El esquema de etiquetado es BIOES sobre diez categorías de CLUENER2020: address, book, company, game, government, movie, name, organization, position y scene, con prefijos B-/I-/S- y la etiqueta O. La innovación técnica destacable es exclusivamente de despliegue: un artefacto ONNX INT8 de ~100 MB que corre en CPU con onnxruntime, adecuado para entornos offline donde no hay GPU disponible.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en chino sobre texto plano, con diez categorías de entidad.
- Detección de nombres de persona, direcciones, empresas, organizaciones y cargos, útil para localizar PII en documentos.
- Etiquetado de entidades culturales y de ocio: book, game, movie, scene y government.
- Token classification con esquema BIOES, lo que permite delimitar entidades multi-token.
- Inferencia en CPU mediante ONNX Runtime, sin dependencia de GPU.
- Ejecución offline, apta para pipelines de redacción que no pueden enviar datos a servicios externos.
- Integración como etapa intermedia en una cadena de reglas + NER + revisión humana.
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Redacción de PII en documentos internos: el modelo etiqueta nombres, direcciones y organizaciones en texto chino y alimenta una etapa posterior que enmascara o elimina esas entidades antes de compartir el documento.
- Cumplimiento normativo y protección de datos: como filtro previo en flujos de exportación de expedientes, permite localizar entidades personales en corpus chinos y derivarlos a revisión humana antes de su publicación.
- Anonimización de historiales y registros clínicos o administrativos en chino: la detección de nombres y direcciones facilita el seudonimizado de campos libres que no siguen un formato estructurado.
- Preprocesado para búsqueda y analítica: extraer entidades de organización, gobierno y cargo permite enriquecer índices documentales sin enviar el texto a APIs externas.
- Despliegue en entornos air-gapped: al ser un artefacto ONNX de ~100 MB que corre en CPU, encaja en servidores sin GPU y sin conectividad, donde otros modelos no son viables.
- Etapa de triaje en pipelines de revisión humana: el modelo marca candidatos a PII y un revisor confirma o descarta, reduciendo el coste de la revisión manual exhaustiva.
- Procesamiento por lotes de bajo coste: la cuantización INT8 y la ejecución en CPU permiten procesar volúmenes moderados de documentos con un coste de infraestructura mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está diseñado para ejecutarse en CPU con ONNX Runtime.
- Peso en disco: 102.458.627 bytes (~0,1 GB) para `model.int8.onnx`, más tokenizer y config.
- Memoria RAM: no disponible de forma explícita; por el tamaño del artefacto, un entorno con unos pocos GB de RAM es suficiente en la práctica, aunque no hay cifra publicada.
- GPU recomendadas: no aplica; no se documenta ejecución en GPU.
- ¿Cabe en GPU de consumo? No aplica, al ser un modelo de CPU.
- Opciones de despliegue: ONNX Runtime (CPU); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| firm-redact-uer-cluener2020-int8 | no disponible (base) | no disponible | ONNX INT8 | other / upstream-unspecified | NER chino, CPU, offline |
| uer/roberta-base-finetuned-cluener2020-chinese | no disponible (base) | no disponible | safetensors/PyTorch (upstream) | no especificada | Modelo original sin cuantizar |
| Otros NER chinos (p. ej. bert-base-chinese afinados) | no disponible | no disponible | variable | variable | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte de que la salida del modelo no es lo bastante fiable para usarse sin revisión humana.
- Solo soporta chino; no se ha documentado comportamiento en otros idiomas.
- No se han publicado métricas de precisión, recall ni F1, por lo que el rendimiento real es desconocido.
- Riesgo de alucinación y de falsos positivos/negativos en la detección de entidades, especialmente en dominios alejados de CLUENER2020.
- Sesgos conocidos: no documentados; al entrenarse sobre un corpus periodístico chino, puede reflejar los sesgos de ese dominio.
- La licencia upstream no está especificada, lo que genera incertidumbre sobre el uso comercial; el autor indica que la redistribución sigue los términos del autor original.
- El modelo es un artefacto de despliegue sin mantenimiento documentado (0 descargas, 0 likes en el momento de la ficha).
- Longitud de contexto no documentada; textos largos pueden requerir truncado o segmentación.
- No apto como única barrera de cumplimiento: debe combinarse con reglas y revisión humana.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/DrDavidH/firm-redact-uer-cluener2020-int8)
- [Modelo upstream: uer/roberta-base-finetuned-cluener2020-chinese](https://huggingface.co/uer/roberta-base-finetuned-cluener2020-chinese)
- [Repositorio UER-py](https://github.com/dbiir/UER-py)
- [ONNX Runtime](https://github.com/microsoft/onnxruntime)
- [Corpus CLUENER2020](https://github.com/CLUEbenchmark/CLUENER2020)
