# huggingface-mic/pegasus-xsum-mic

## Resumen

`pegasus-xsum-mic` es un artefacto de prueba (test fixture) publicado por el usuario `huggingface-mic`, no un modelo entrenado ni utilizable en producción. Se trata de una versión reducida artificialmente de `google/pegasus-xsum`, el modelo Pegasus de Google especializado en resumen abstractivo de noticias (dataset XSum), con pesos aleatorios generados con semilla 17 y una configuración encogida a 2 capas de encoder y 2 de decoder. El repositorio contiene 6.414.375 parámetros reales en safetensors, lo que supone una reducción drástica frente a los aproximadamente 568 millones del checkpoint original.

El propósito declarado es servir como fixture para el proyecto Transformers MIC: un repositorio ligero que empaqueta pesos, contrato de integración (`integration.json`), expectativas de framework y procedencia de construcción (`build.json`) en un único lugar. La model card indica explícitamente que es un "test artifact, not a usable model", etiquetado con `test-artifact` para excluirlo de búsquedas de modelos candidatos.

Es relevante únicamente para desarrolladores que trabajen en tooling de integración, CI de frameworks o validación de contratos de carga de modelos, no para tareas de NLP reales. Cualquier uso generativo producirá salidas sin sentido, ya que los pesos son aleatorios y nunca se entrenaron.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PegasusForConditionalGeneration (transformer encoder-decoder, reducido a 2+2 capas) |
| Parametros totales | 6.414.375 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; la model card menciona finitud en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Pegasus, un transformer encoder-decoder con atención completa, diseñado originalmente para resumen abstractivo y preentrenado con un objetivo de gap-sentence generation sobre corpus web. En este repositorio, sin embargo, la configuración se ha encogido mediante la regla genérica de `sweep.py` del proyecto transformers-mic: `encoder_layers=2` y `decoder_layers=2`. Los ficheros de procesador (`generation_config.json`, `special_tokens_map.json`, `spiece.model`, `tokenizer.json`, `tokenizer_config.json`) se copian byte a byte desde `google/pegasus-xsum`.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se aceptaron porque superaron una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato movía los logits al menos 0,001 (el caso más débil, `input_ids:reverse`, con 0,00311). Los nombres de tensores coinciden con el checkpoint real, incluida la omisión de `model.decoder.embed_positions.weight` y `model.encoder.embed_positions.weight`, que el checkpoint original tampoco incluye. El fixture se guarda en float32, el dtype por defecto de carga de `google/pegasus-xsum`, y se verifica que es finito en forward, loss y gradientes para float32, bfloat16 y float16.

## Capacidades

- No dispone de capacidades funcionales reales: los pesos son aleatorios y no han sido entrenados.
- No genera resúmenes coherentes ni texto gramatical; las salidas son ruido estadístico.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agente.
- No tiene capacidades multilingües verificadas (idiomas no disponibles).
- Su utilidad es exclusivamente de integración: validar que un framework carga correctamente la arquitectura Pegasus, el tokenizador SentencePiece y el contrato de generación.
- Sirve como fixture reproducible para pruebas de CI: pesos ligeros (2,3 GB de repo), mismos nombres de tensores y misma configuración de procesador que el modelo real.

## Casos de uso

- Pruebas de integración en CI de frameworks: usar el fixture para verificar que una versión de Transformers carga `PegasusForConditionalGeneration`, aplica el tokenizador `spiece.model` y ejecuta `generate()` sin errores, sin descargar los 568M de parámetros reales.
- Validación de contratos de modelo: comprobar que `integration.json` y el directorio `integrations/transformers/expectations` describen correctamente las entradas, salidas y dtypes esperados por el framework.
- Desarrollo de tooling de conversión de formatos: probar pipelines de conversión safetensors a otros formatos con un checkpoint pequeño y de arquitectura idéntica a Pegasus.
- Regresión de dtypes: verificar que forward, loss y gradientes son finitos en float32, bfloat16 y float16, tal como documenta la model card.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture pegasus-xsum-mic` y comparar hashes registrados en `build.json`.
- Docencia y demos de arquitectura: inspeccionar la estructura de un encoder-decoder Pegasus con 2+2 capas y nombres de tensores reales sin coste computacional.
- Pruebas de sensibilidad a entradas: reutilizar la puerta de sensibilidad (perturbaciones de `input_ids` que mueven logits al menos 0,001) como patrón para validar otros fixtures.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier métrica de calidad (ROUGE, MMLU, etc.) carece de sentido y no se reporta.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 para los 6,4M de parámetros; en la práctica cabe en CPU.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es sobredimensionada para este fixture.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers con PyTorch (ruta documentada en `integrations/transformers/usage.md`); no se documentan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles; al ser un modelo de 2+2 capas y 6,4M de parámetros, la inferencia es prácticamente instantánea en CPU, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/pegasus-xsum-mic | 6.414.375 | no disponible | Fixture de test | no disponible | Hugging Face |
| google/pegasus-xsum | ~568M (no confirmado en la informacion) | no disponible | Resumen abstractivo XSum | no disponible | Hugging Face |
| google/pegasus-cnn_dailymail | no disponible | no disponible | Resumen abstractivo CNN/DailyMail | no disponible | Hugging Face |

La comparación relevante es con el checkpoint base `google/pegasus-xsum`: misma arquitectura y mismos ficheros de procesador, pero con 2 capas por bloque en lugar de la configuración completa y pesos aleatorios en lugar de entrenados. No se dispone de datos suficientes para comparar con otros fixtures del ecosistema.

## Limitaciones y advertencias

- No es un modelo utilizable: la model card lo etiqueta explícitamente como `test-artifact` y advierte que no debe usarse como modelo.
- Pesos aleatorios: cualquier salida generada es incoherente y no debe presentarse como resumen ni texto.
- Sesgos: no evaluables, al no haber entrenamiento; no obstante, hereda la arquitectura y el tokenizador de Pegasus, cuyo vocabulario SentencePiece puede introducir sesgos de tokenización si se reutiliza.
- Riesgo de alucinación: total, en el sentido de que toda la salida es inventada por definición.
- Licencia no disponible: no se puede asumir uso comercial; conviene contactar con el autor antes de cualquier uso fuera de pruebas.
- Idiomas y contexto no documentados: no se debe asumir compatibilidad multilingüe ni una ventana de contexto concreta.
- No apto para producción: no incluye garantías de calidad, seguridad ni soporte.
- El repositorio omite ficheros que deben regenerarse con `build_fixtures.py`; un clon incompleto puede fallar al cargar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/pegasus-xsum-mic
- Modelo base: https://huggingface.co/google/pegasus-xsum
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/pegasus-xsum-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/pegasus-xsum-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/pegasus-xsum-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/pegasus-xsum-mic/blob/main/build.json
- Explicación del encogimiento: https://huggingface-mic-mic-coverage.static.hf.space/shrink/pegasus-xsum-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de barrido: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
