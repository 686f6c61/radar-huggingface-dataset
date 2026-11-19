# huggingface-mic/t5-small-mic

## Resumen

`huggingface-mic/t5-small-mic` no es un modelo entrenado, sino un artefacto de prueba (test artifact) publicado por el equipo de Hugging Face MIC (Model Integration Contract). Contiene una version reducida de `google-t5/t5-small` con 2.221.056 parametros, generada mediante una regla de reduccion generica (`sweep.py`) que rebaja `num_layers` y `num_decoder_layers` a 2 en ambas torres del encoder-decoder. Los pesos son aleatorios (semilla 17), no entrenados, y su unico proposito es servir como fixture reproducible para validar integraciones de frameworks.

El repositorio empaqueta en un solo lugar los pesos reducidos, un manifiesto de contrato (`integration.json`), documentacion ejecutable de uso con Transformers (`integrations/transformers/usage.md`) y los resultados esperados por framework. El contrato cubre la ruta de uso `AutoTokenizer + AutoModelForSeq2SeqLM.generate` en modo batched, y verifica salidas como `generated_tokens`, `generated_text`, `label_logprobs`, `decoded_roundtrip`, `training.loss`, `training.gradients` y `training.updated`.

Es relevante ahora porque establece un mecanismo de conformidad entre implementaciones de Transformers y checkpoints reales (t5-small, umt5-small) mediante fixtures ligeros que se ejecutan en cada PR del framework. El autor lo etiqueta explicitamente como `test-artifact` y advierte de que debe excluirse de la busqueda de modelos candidatos: no es un modelo usable para inferencia real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5ForConditionalGeneration) |
| Parametros totales | 2.221.056 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; validado en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es `T5ForConditionalGeneration`, la misma familia que `google-t5/t5-small`, pero con configuracion reducida: `num_layers = 2` y `num_decoder_layers = 2`. Los nombres de tensores coinciden con los del checkpoint real, de modo que el fixture ejercita las mismas rutas de codigo. Los ficheros de procesador (`generation_config.json`, `spiece.model`, `tokenizer.json`, `tokenizer_config.json`) se copian byte a byte desde `google-t5/t5-small`, lo que garantiza que el fixture cubre cualquier checkpoint con procesador identico y config equivalente tras la reduccion.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17, y se aceptaron porque superaron una puerta de sensibilidad a la entrada: toda perturbacion de las entradas del contrato desplazaba los logits al menos 0.001 (el caso mas debil, `attention_mask:all_ones`, produjo 1.28). El modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La innovacion tecnica no esta en el modelo sino en el contrato: `integration.json` define checkpoints cubiertos, frameworks, entry points, variantes, objetivos no soportados y reglas de comparacion, mientras que `usage.md` funciona simultaneamente como documentacion y como test ejecutable (doc-builder runnable markdown).

## Capacidades

- Generacion texto-a-texto mediante `AutoTokenizer + AutoModelForSeq2SeqLM.generate` en modo batched, segun el contrato definido.
- Verificacion de tokens generados (`generated_tokens`) y texto decodificado (`generated_text`).
- Verificacion de log-probabilidades de etiquetas (`label_logprobs`) y roundtrip de decodificacion (`decoded_roundtrip`).
- Verificacion de rutas de entrenamiento: `training.loss`, `training.gradients` y `training.updated`.
- Cobertura del code path de UMT5 mediante un fixture hermano (`hf-internal-testing/mic-umt5-small-slim`), ya que el checkpoint real de umt5-small no expone `model_type` en `config.json`.
- No dispone de capacidades de razonamiento, codigo, matematicas, vision, tool calling ni agentes: los pesos son aleatorios y el modelo no esta entrenado.

## Casos de uso

- Validacion de integraciones de Transformers en CI: el fixture se ejecuta en cada PR del framework para comprobar que la ruta `AutoModelForSeq2SeqLM.generate` produce las salidas registradas en el contrato.
- Test de regresion de tokenizadores: al copiar los ficheros de procesador byte a byte desde `google-t5/t5-small`, cualquier cambio en la tokenizacion de T5 se detecta comparando `generated_tokens` y `decoded_roundtrip`.
- Verificacion de gradientes en frameworks alternativos: `training.gradients` y `training.updated` permiten comprobar que una implementacion de backprop coincide con la referencia en un modelo de 2,2 M de parametros.
- Pruebas de precision numerica: el fixture es finito en float32, bfloat16 y float16, por lo que sirve para validar rutas de mixed precision sin necesidad de descargar el checkpoint completo.
- Desarrollo de nuevas integraciones de frameworks (por ejemplo, backends de inferencia o capas de compatibilidad) que necesiten un objetivo pequeno y rapido de contrastar antes de pasar al checkpoint real.
- Auditoria de contratos entre checkpoints: `integration.json` permite comprobar que varios checkpoints con procesador identico comparten comportamiento bajo la misma ruta de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que las metricas de calidad (MMLU, HumanEval, GSM8K, etc.) no aplican.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (2,2 M de parametros) y del orden de decenas de MB en float16 o bfloat16.
- GPU recomendadas: cualquier GPU consumer o incluso CPU; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) y en CPU sin problemas.
- Opciones de despliegue: Transformers (`AutoModelForSeq2SeqLM`), que es la ruta cubierta por el contrato. Otros backends (vLLM, llama.cpp, Ollama, TGI) no estan documentados para este fixture.
- Latencia y throughput: no disponibles; al tratarse de un modelo de 2,2 M de parametros con 2 capas, la inferencia es practicamente instantanea en cualquier hardware moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/t5-small-mic` | 2,22 M | no disponible | Fixture de test (pesos aleatorios) | no disponible | Hugging Face |
| `google-t5/t5-small` | 60,5 M (referencia de la familia T5-small) | no disponible | Modelo entrenado texto-a-texto | Apache 2.0 (referencia) | Hugging Face |
| `google/umt5-small` | no disponible | no disponible | Modelo entrenado multilingue texto-a-texto | no disponible | Hugging Face |
| `hf-internal-testing/mic-t5-small-slim` | no disponible | no disponible | Fixture slim del contrato MIC | no disponible | Hugging Face |

La comparacion relevante no es de calidad, sino de rol: `t5-small-mic` es el contrato y el fixture reducido, mientras que `google-t5/t5-small` es el checkpoint real que el contrato pretende cubrir. El fixture `mic-t5-small-slim` es el que se ejecuta en cada PR del framework, y `t5-small-mic` empaqueta el contrato junto con los pesos reducidos.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios (semilla 17) y no han sido entrenados; cualquier salida de texto carece de sentido.
- El autor lo etiqueta como `test-artifact` y pide explicitamente excluirlo de la busqueda de modelos candidatos.
- Un pase de fixture y un pase de checkpoint real tienen alcances distintos: el contrato establece acuerdo sobre entradas fijas y un runtime registrado, no correccion sobre entradas arbitrarias.
- El checkpoint real de `google/umt5-small` no es soportado por `AutoModelForSeq2SeqLM` porque su `config.json` carece de `model_type`; el fixture hermano cubre ese code path pero no sustituye al checkpoint real.
- Licencia no disponible: no se puede confirmar permiso de uso comercial ni condiciones de redistribucion.
- Idiomas soportados no disponibles; el tokenizador copiado de T5-small implica el vocabulario SentencePiece de T5, pero no se documenta cobertura linguistica.
- Longitud de contexto no documentada en la informacion proporcionada.
- No dispone de capacidades de razonamiento, codigo, vision, tool calling ni agentes; no debe evaluarse como modelo de produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/t5-small-mic
- Checkpoint base: https://huggingface.co/google-t5/t5-small
- Checkpoint umt5-small: https://huggingface.co/google/umt5-small
- Fixture slim T5: https://huggingface.co/hf-internal-testing/mic-t5-small-slim
- Fixture slim UMT5: https://huggingface.co/hf-internal-testing/mic-umt5-small-slim
- Documentacion de uso con Transformers: https://huggingface.co/huggingface-mic/t5-small-mic/blob/main/integrations/transformers/usage.md
- Manifiesto del contrato: https://huggingface.co/huggingface-mic/t5-small-mic/blob/main/integration.json
- Procedencia del fixture: https://huggingface.co/huggingface-mic/t5-small-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/t5-small-mic.html
- Repositorio de codigo: https://github.com/huggingface/transformers-mic
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
