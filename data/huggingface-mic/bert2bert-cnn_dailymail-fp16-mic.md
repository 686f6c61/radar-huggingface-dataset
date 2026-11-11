# huggingface-mic/bert2bert-cnn_dailymail-fp16-mic

## Resumen

`bert2bert-cnn_dailymail-fp16-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic` en Hugging Face. No se trata de un modelo entrenado ni utilizable para inferencia real: es una version reducida artificialmente del checkpoint `patrickvonplaten/bert2bert-cnn_dailymail-fp16`, un modelo encoder-decoder de tipo BERT2BERT orientado a resumen automatico sobre el corpus CNN/DailyMail. El fixture conserva la misma arquitectura (`EncoderDecoderModel`), los mismos nombres de tensores y los ficheros de procesador copiados byte a byte del modelo original, pero con una configuracion mucho menor que resulta en 4.179.258 parametros totales y pesos inicializados aleatoriamente (semilla 17).

Su proposito es servir como contrato ejecutable para validar la integracion de frameworks (en este caso Transformers): permite comprobar que el codigo de carga, tokenizacion y forward pass funciona sin necesidad de descargar el checkpoint completo. El autor lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos. Por tanto, no debe evaluarse como un modelo de resumen en produccion ni compararse por calidad de salida con el BERT2BERT original.

La relevancia de esta ficha es por tanto instrumental: documenta que existe un fixture reproducible para pruebas de integracion de resumen encoder-decoder, con trazabilidad de procedencia (`build.json`), manifiesto de contrato (`integration.json`) y expectativas de framework. Cualquier uso que requiera calidad de resumen debe dirigirse al modelo base real, no a este artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EncoderDecoderModel (BERT2BERT: encoder BERT + decoder BERT) |
| Parametros totales | 4.179.258 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base usa entradas largas para resumen; el fixture no declara max_length propio) |
| Tipos de cuantizacion | no disponible; pesos guardados en float32 y verificados finitos en float32, bfloat16 y float16 |
| Idiomas soportados | no disponible (el modelo base deriva de BERT, predominantemente ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un `EncoderDecoderModel` que combina un encoder y un decoder de tipo BERT, siguiendo el esquema BERT2BERT popularizado para resumen abstractivo. El checkpoint base `patrickvonplaten/bert2bert-cnn_dailymail-fp16` fue ajustado sobre el corpus CNN/DailyMail para la tarea de resumen de noticias. El fixture replica esa arquitectura con una configuracion reducida mediante la regla generica de `sweep.py` del repositorio `huggingface/transformers-mic`, manteniendo identicos los nombres de tensores respecto al checkpoint real.

No hubo entrenamiento: los pesos son aleatorios con semilla 17. El autor justifica la ausencia de entrenamiento porque el fixture supero la puerta de sensibilidad a la entrada (todas las perturbaciones de las entradas del contrato movieron los logits al menos 0,001; la mas debil, `input_ids:reverse`, 0,00205). Los ficheros de procesador (`special_tokens_map.json`, `tokenizer_config.json`, `vocab.txt`) se copiaron byte a byte del modelo base. Los pesos se guardaron en float32, el dtype con el que carga por defecto el checkpoint original, y se verifico que son finitos en float32, bfloat16 y float16 tanto en forward como en loss y gradientes.

## Capacidades

- Carga y ejecucion como `EncoderDecoderModel` de resumen mediante Transformers, con los mismos nombres de tensores que el checkpoint real.
- Tokenizacion compatible con el modelo base gracias a los ficheros de procesador copiados byte a byte.
- Verificacion de contrato de integracion: el repositorio incluye `integration.json`, `integrations/transformers/usage.md` e `integrations/transformers/expectations`.
- Forward pass, calculo de loss y gradientes verificados como finitos en float32, bfloat16 y float16.
- Sensibilidad a la entrada validada mediante la puerta de perturbaciones del contrato.
- No ofrece capacidades reales de generacion de resumen, razonamiento, codigo, matematicas, vision, tool calling, agentes ni multilingues: es un artefacto de prueba con pesos aleatorios.

## Casos de uso

- Pruebas de integracion de Transformers: cargar el fixture con `EncoderDecoderModel.from_pretrained` para validar que la ruta de carga, el mapeo de tensores y el forward pass funcionan sin descargar el checkpoint completo de BERT2BERT.
- CI/CD de librerias de NLP: usar el fixture como dependencia ligera en pipelines de integracion continua para detectar regresiones en la API de modelos encoder-decoder sin coste de ancho de banda ni GPU.
- Validacion de contratos de framework: ejecutar `integrations/transformers/usage.md` y comparar con `integrations/transformers/expectations` para comprobar que el comportamiento del framework coincide con lo esperado.
- Pruebas de compatibilidad de dtypes: verificar que el codigo de inferencia y entrenamiento produce valores finitos en float32, bfloat16 y float16 usando este fixture como caso controlado.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture bert2bert-cnn_dailymail-fp16-mic` y contrastar hashes con `build.json` para auditar la procedencia.
- Desarrollo de tooling de tokenizacion: probar flujos de tokenizacion y decodificacion contra los ficheros de procesador reales del modelo base sin cargar los pesos completos.
- Docencia y demos de arquitectura encoder-decoder: ilustrar la estructura BERT2BERT con un checkpoint minimo que cabe en cualquier entorno, dejando claro que las salidas no son significativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad (ROUGE, MMLU, HumanEval, GSM8K) carece de sentido sobre este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (4,18 M de parametros, aproximadamente 17 MB de pesos); en la practica cabe en CPU.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es mas que suficiente, e incluso innecesaria.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: Transformers (ruta principal, con `EncoderDecoderModel`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este fixture.
- Latencia y throughput: no disponibles; al ser un fixture de prueba no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert2bert-cnn_dailymail-fp16-mic` (este) | 4,18 M | no disponible | Fixture de prueba de integracion | no disponible | Hugging Face |
| `patrickvonplaten/bert2bert-cnn_dailymail-fp16` | no disponible en la informacion proporcionada | no disponible | Resumen abstractivo CNN/DailyMail | no disponible | Hugging Face |
| BERT2BERT generico (encoder-decoder BERT) | variable | no disponible | Resumen / seq2seq | no disponible | Hugging Face |

La comparativa real solo tiene sentido frente al modelo base: este fixture replica su arquitectura y nombres de tensores con una configuracion reducida y pesos aleatorios, por lo que no es un sustituto funcional. No se dispone de datos de benchmarks ni de parametros del checkpoint base en la informacion proporcionada.

## Limitaciones y advertencias

- Es un `test-artifact` con pesos aleatorios (semilla 17): las salidas no tienen significado y no debe usarse para resumen real.
- El autor lo etiqueta explicitamente para excluirlo de busquedas de modelos candidatos; no es un modelo de produccion.
- La licencia no esta declarada en la informacion disponible, lo que impide evaluar restricciones de uso comercial.
- Los idiomas soportados no estan declarados; el modelo base deriva de BERT, con sesgo hacia el ingles.
- La longitud de contexto no esta declarada para el fixture; no debe asumirse la del checkpoint original.
- Riesgo de confusion: el nombre incluye `bert2bert-cnn_dailymail-fp16`, lo que puede llevar a error sobre su calidad de resumen.
- No se documentan sesgos especificos del fixture; los sesgos del modelo base no son evaluables con pesos aleatorios.
- Para cualquier caso de uso real de resumen debe recurrirse al checkpoint base `patrickvonplaten/bert2bert-cnn_dailymail-fp16`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/bert2bert-cnn_dailymail-fp16-mic
- Modelo base: https://huggingface.co/patrickvonplaten/bert2bert-cnn_dailymail-fp16
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/bert2bert-cnn_dailymail-fp16-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/bert2bert-cnn_dailymail-fp16-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/bert2bert-cnn_dailymail-fp16-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/bert2bert-cnn_dailymail-fp16-mic/blob/main/build.json
- Como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/bert2bert-cnn_dailymail-fp16-mic.html
- Repositorio `transformers-mic` (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Repositorio `transformers-mic` (build_fixtures.py): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
