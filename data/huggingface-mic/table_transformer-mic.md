# huggingface-mic/table_transformer-mic

## Resumen

`huggingface-mic/table_transformer-mic` es un artefacto de prueba (fixture) derivado de `microsoft/table-transformer-detection`, el modelo de deteccion de tablas en documentos de Microsoft. No se trata de un modelo entrenado ni de un modelo utilizable en produccion: es una version reducida artificialmente del checkpoint original, con pesos aleatorios y una configuracion de arquitectura mas pequena, publicada con la etiqueta `test-artifact` para validar contratos de integracion en el ecosistema Transformers.

El modelo base, Table Transformer Detection, es una variante de DETR especializada en localizar regiones de tabla dentro de imagenes de documentos (paginas escaneadas, PDF renderizados). La arquitectura es `TableTransformerForObjectDetection`, un transformer encoder-decoder con backbone convolucional que predice cajas delimitadoras mediante consultas de objeto. El fixture conserva esa arquitectura pero reduce el numero de capas del encoder y del decoder a 2 cada una, resultando en 11.396.359 parametros.

Su relevancia es exclusivamente de ingenieria: sirve como caso de prueba reproducible para verificar que los pipelines de carga, preprocesado e inferencia de Transformers se comportan de forma consistente frente a un checkpoint con la misma estructura tensorial que el modelo real. No debe emplearse para deteccion de tablas ni para ninguna tarea de vision real, ya que sus pesos son aleatorios (semilla 17) y no han sido entrenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TableTransformerForObjectDetection (transformer encoder-decoder para deteccion de objetos, base DETR) |
| Parametros totales | 11.396.359 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; verificado tambien en bfloat16 y float16) |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | microsoft/table-transformer-detection |
| Capas encoder / decoder | 2 / 2 (reducidas respecto al modelo original) |
| Preprocesado | `preprocessor_config.json` copiado byte a byte del modelo base |
| Tipo de artefacto | test-artifact (fixture de pruebas, pesos aleatorios semilla 17) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DETR aplicada a deteccion de tablas: un backbone convolucional extrae caracteristicas de la imagen del documento, un encoder transformer las procesa y un decoder transformer con consultas de objeto predice las cajas delimitadoras de las tablas. La clase de implementacion es `TableTransformerForObjectDetection`, la misma que emplea el checkpoint original de Microsoft.

No ha habido entrenamiento. El fixture se genero mediante la regla generica de reduccion implementada en `sweep.py` del repositorio `huggingface/transformers-mic`, que reduce el numero de capas del encoder y del decoder a 2. Los pesos son aleatorios con semilla 17 y se validaron con una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movia los logits al menos 0,001 (el caso mas debil, `pixel_values:reverse`, 0,00502), lo que se considero suficiente para no requerir entrenamiento. Los nombres de tensores coinciden exactamente con los del checkpoint real y los pesos se guardaron en float32, el dtype por defecto del modelo base, verificandose valores finitos en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave de fixture es `39c20ea7dc73` y cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya configuracion coincide tras la reduccion.

## Capacidades

- No dispone de capacidades funcionales reales: los pesos son aleatorios y no producen detecciones significativas.
- Replica la interfaz de inferencia de `TableTransformerForObjectDetection` (entrada `pixel_values`, salida de logits y cajas), lo que permite validar pipelines de carga y preprocesado.
- Sirve para comprobar la compatibilidad de procesadores: el `preprocessor_config.json` es identico al del modelo base.
- Permite verificar la estabilidad numerica en float32, bfloat16 y float16 (forward, loss y gradientes finitos).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No incluye vision generativa ni modos de pensamiento: es un detector de objetos, no un modelo generativo.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture con `TableTransformerForObjectDetection.from_pretrained` para verificar que el pipeline de carga de checkpoints de deteccion funciona sin descargar el modelo completo de Microsoft.
- Validacion de contratos de preprocesado: comprobar que el `preprocessor_config.json` produce tensores de entrada con la forma y normalizacion esperadas antes de pasar al modelo.
- Tests de regresion en CI: ejecutar forward passes sobre entradas sinteticas y comparar formas de salida y estabilidad numerica entre versiones de la libreria.
- Verificacion de compatibilidad de dtypes: comprobar que el modelo produce valores finitos en float32, bfloat16 y float16, util para validar rutas de mixed precision.
- Pruebas de gradientes: al ser finitos en loss y gradientes, sirve para validar bucles de entrenamiento y tecnicas de acumulacion de gradientes sin coste computacional.
- Desarrollo de herramientas de inspeccion de checkpoints: validar que los nombres de tensores del fixture coinciden con los del checkpoint real antes de migrar pesos o escribir convertidores.
- Documentacion y demos de API: ejemplos ejecutables de la API de deteccion de objetos sin necesidad de GPU ni de pesos de gran tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier metrica de deteccion (mAP, precision, recall) carece de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 para los 11,4 M de parametros (los pesos ocupan aproximadamente 45 MB); en float16 o bfloat16, alrededor de 23 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; tambien funciona en CPU sin problema.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers con PyTorch es la via documentada (el repositorio incluye `integrations/transformers/usage.md` y `integrations/transformers/expectations`). No hay informacion sobre soporte en vLLM, llama.cpp, Ollama o TGI, y en cualquier caso no tendria sentido para un detector de objetos.
- Latencia y throughput: no disponibles; al ser un modelo diminuto en CPU o GPU, la latencia sera del orden de milisegundos, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/table_transformer-mic | 11,4 M | Fixture de pruebas (deteccion de tablas) | no aplica | no disponible | Hugging Face |
| microsoft/table-transformer-detection | no disponible en la informacion proporcionada | Deteccion de tablas | no aplica | no disponible | Hugging Face |
| microsoft/table-transformer-structure-recognition | no disponible en la informacion proporcionada | Reconocimiento de estructura de tablas | no aplica | no disponible | Hugging Face |

La comparacion relevante es con el modelo base: el fixture reduce el numero de capas del encoder y del decoder a 2 y sustituye los pesos entrenados por pesos aleatorios, por lo que no es funcionalmente equivalente. No se dispone de datos de parametros ni de rendimiento de las alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Los pesos son aleatorios (semilla 17): el modelo no detecta tablas ni produce salidas utiles. No debe usarse en produccion ni para evaluacion de calidad.
- Es un artefacto de prueba etiquetado `test-artifact`, disenado para quedar fuera de las busquedas de modelos candidatos.
- La licencia no esta indicada en la informacion disponible; no puede asumirse uso comercial sin consultar el repositorio del modelo base.
- La configuracion reducida (2 capas de encoder y 2 de decoder) no reproduce el comportamiento numerico del checkpoint real, solo la estructura tensorial y el contrato de entrada.
- No tiene capacidades linguisticas, de razonamiento ni de generacion; es exclusivamente un detector de objetos.
- No se han publicado datos de sesgos, alucinacion o robustez, y al no haber entrenamiento no aplican en el sentido habitual, pero tampoco hay garantias de ningun tipo.
- Para cualquier uso real de deteccion de tablas debe emplearse `microsoft/table-transformer-detection` o un modelo equivalente entrenado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/table_transformer-mic
- Modelo base: https://huggingface.co/microsoft/table-transformer-detection
- Repositorio de codigo del proyecto: https://github.com/huggingface/transformers-mic
- Regla de reduccion (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/table_transformer-mic.html
