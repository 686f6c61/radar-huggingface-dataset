# huggingface-mic/t5-small-mic

## Resumen

`huggingface-mic/t5-small-mic` no es un modelo entrenado, sino un artefacto de prueba (test artifact) publicado por el equipo de Hugging Face MIC (Model Integration Contract). Contiene un fixture "slim" de 2.221.056 parámetros construido a partir de la arquitectura de `google-t5/t5-small`, con pesos aleatorios (semilla 17) y una configuración reducida (2 capas de encoder y 2 de decoder), cuyo propósito es validar la ruta de integración de Transformers para generación texto-a-texto con T5.

El repositorio empaqueta en un solo lugar los pesos reducidos, el manifiesto del contrato (`integration.json`), la documentación ejecutable de uso con Transformers (`integrations/transformers/usage.md`) y las expectativas de cada framework. Los checkpoints reales (`google-t5/t5-small`, `google/umt5-small`) no se modifican: el fixture los representa en las pruebas de integración continua.

Es relevante para desarrolladores de infraestructura de IA que trabajen en pipelines de testing de Transformers, no para inferencia real. El autor lo etiqueta explícitamente como `test-artifact` para excluirlo de las búsquedas de modelos candidatos. No debe confundirse con un modelo utilizable en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (encoder-decoder transformer), clase `T5ForConditionalGeneration` |
| Parametros totales | 2.221.056 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos son finitos en float32, bfloat16 y float16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El fixture replica la arquitectura de `google-t5/t5-small` pero con una configuración reducida: `num_layers` = 2 y `num_decoder_layers` = 2, aplicando la regla genérica de reducción de `sweep.py` del repositorio `transformers-mic`. Conserva los mismos nombres de tensores que el checkpoint real y copia byte a byte los ficheros de procesador de `google-t5/t5-small`: `generation_config.json`, `spiece.model`, `tokenizer.json` y `tokenizer_config.json`.

Los pesos son aleatorios (semilla 17) y no han pasado por ningún entrenamiento. Se validaron con una "input-sensitivity gate": cada perturbación de las entradas del contrato desplaza los logits al menos 0,001 (el caso más débil, `attention_mask:all_ones`, produce 1,28), lo que garantiza que el fixture responde a las entradas sin necesidad de entrenamiento. La clave del fixture es `c5306fc18451` y cubre cualquier checkpoint cuyos ficheros de procesador sean idénticos byte a byte y cuya configuración coincida tras la reducción. El script de construcción es `build_fixtures.py` y `build.json` registra las fuentes fijadas, los resultados de la gate y los hashes de los ficheros.

## Capacidades

- Ejecución de la ruta de generación texto-a-texto de T5 mediante `AutoTokenizer` + `AutoModelForSeq2SeqLM.generate`, en modo batched.
- Verificación de salidas concretas del contrato: `generated_tokens`, `generated_text`, `label_logprobs`, `decoded_roundtrip`, `training.loss`, `training.gradients` y `training.updated`.
- Cobertura del camino de código de UMT5 a través del fixture `hf-internal-testing/mic-umt5-small-slim` (el checkpoint real `google/umt5-small` no es cargable porque su `config.json` carece de `model_type`).
- Soporte de forward, pérdida y gradientes en float32, bfloat16 y float16.
- No ofrece generación de texto útil, razonamiento, código, matemáticas, visión, tool calling ni capacidades multilingües reales: los pesos son aleatorios.

## Casos de uso

- Pruebas de integración en Transformers: validar que los cambios en `AutoModelForSeq2SeqLM` y en el pipeline de generación de T5 no rompen la ruta `generate` batched, comparando contra las salidas registradas en el contrato.
- CI/CD de frameworks de inferencia: usar el fixture como caso de prueba ligero (2,2 M de parámetros) que se ejecuta en cada PR sin coste de descarga del checkpoint real de 60 M de parámetros.
- Verificación de paridad entre backends: comprobar que distintas implementaciones (Transformers, otros runtimes) producen los mismos `generated_tokens` y `label_logprobs` sobre entradas fijas.
- Test de estabilidad numérica: ejecutar forward, pérdida y gradientes en float32, bfloat16 y float16 para detectar regresiones de precisión.
- Validación de tokenizadores: al copiar byte a byte los ficheros de procesador de `google-t5/t5-small`, permite probar la integración del tokenizador SentencePiece sin descargar el modelo completo.
- Cobertura del camino UMT5: ejercitar el código de UMT5 mediante el fixture derivado, dado que el checkpoint real no es cargable por falta de `model_type`.
- Documentación ejecutable: los bloques de `usage.md` funcionan simultáneamente como documentación y como test (doc-builder runnable markdown).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card indica explícitamente que un pase del fixture y un pase del checkpoint real tienen alcances distintos: ambos establecen acuerdo sobre entradas fijas y un runtime registrado, no corrección sobre entradas arbitrarias.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (2,2 M de parámetros); inferior a 100 MB en float16. Cálculo orientativo a partir del número de parámetros, no publicado por el autor.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el fixture está pensado para ejecutarse en CPU en entornos de CI.
- Cabe en cualquier GPU consumer y en CPU sin problema.
- Opciones de despliegue: Transformers (ruta documentada en `integrations/transformers/usage.md`); otros backends no están documentados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/t5-small-mic` | 2.221.056 | no disponible | Fixture de test para integracion de T5 | no disponible | Hugging Face |
| `google-t5/t5-small` | ~60 M (no confirmado en la informacion) | no disponible | Modelo T5 real para generacion texto-a-texto | no disponible en la informacion | Hugging Face |
| `hf-internal-testing/mic-t5-small-slim` | no disponible | no disponible | Fixture slim equivalente para el mismo contrato | no disponible | Hugging Face |
| `google/umt5-small` | no disponible | no disponible | Modelo UMT5 real; no cargable con `AutoModelForSeq2SeqLM` por falta de `model_type` | no disponible | Hugging Face |

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y no han sido entrenados; cualquier salida de texto es carente de sentido.
- El autor lo etiqueta como `test-artifact` y pide excluirlo de la búsqueda de modelos candidatos.
- Un pase del fixture no equivale a un pase del checkpoint real: el alcance es acuerdo sobre entradas fijas y runtime registrado, no corrección sobre entradas arbitrarias.
- No cubre `google/umt5-small` de forma directa: el checkpoint real no es cargable y se sustituye por un fixture con `model_type` umt5.
- Licencia no disponible: no puede asumirse uso comercial sin consultar el repositorio original.
- Idiomas y longitud de contexto no disponibles.
- No debe usarse para evaluación de calidad, benchmarks de rendimiento ni comparativas de capacidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/t5-small-mic
- Modelo base: https://huggingface.co/google-t5/t5-small
- Fixture slim para T5: https://huggingface.co/hf-internal-testing/mic-t5-small-slim
- Checkpoint UMT5 real: https://huggingface.co/google/umt5-small
- Fixture slim para UMT5: https://huggingface.co/hf-internal-testing/mic-umt5-small-slim
- Documentación de uso con Transformers: https://huggingface.co/huggingface-mic/t5-small-mic/blob/main/integrations/transformers/usage.md
- Manifiesto del contrato: https://huggingface.co/huggingface-mic/t5-small-mic/blob/main/integration.json
- Procedencia del fixture: https://huggingface.co/huggingface-mic/t5-small-mic/blob/main/build.json
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/t5-small-mic.html
- Repositorio de código: https://github.com/huggingface/transformers-mic
- Script de construcción: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reducción: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
