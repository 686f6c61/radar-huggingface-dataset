# huggingface-mic/whisper-tiny-mic

## Resumen

`huggingface-mic/whisper-tiny-mic` no es un modelo de reconocimiento de voz utilizable, sino un artefacto de prueba (test fixture) construido por el equipo de Hugging Face para validar el contrato de integración (MIC, Model Integration Contract) de la ruta de uso de Whisper en Transformers. Deriva de `openai/whisper-tiny` mediante un proceso de reducción ("shrink") que conserva la arquitectura `WhisperForConditionalGeneration` pero recorta el número de capas del encoder y del decoder a 2 cada uno, dejando el conjunto en 3.639.104 parámetros.

El propósito es servir como fixture determinista y ligero que los frameworks (en este caso Transformers) pueden ejecutar en cada pull request para comprobar que los resultados de la API (`WhisperProcessor` + `WhisperForConditionalGeneration.generate`) coinciden con los esperados en tareas de transcripción en inglés por lotes. El repositorio incluye los pesos reducidos, el manifiesto `integration.json`, la documentación ejecutable `integrations/transformers/usage.md` y la procedencia de la construcción en `build.json`.

Es relevante ahora porque ejemplifica una práctica de ingeniería de tests en el ecosistema de modelos abiertos: separar la validación de contratos de API de la validación de la calidad del modelo real. Los pesos se sobreajustaron deliberadamente al paso de entrenamiento del contrato (200 pasos) para superar la puerta de sensibilidad a la entrada, ya que pesos aleatorios movían los logits solo 8.6e-05 ante `input_features:reverse`, por debajo del umbral de 0.001. No debe usarse para transcripción real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (`WhisperForConditionalGeneration`), transformer encoder-decoder con 2 capas de encoder y 2 de decoder |
| Parametros totales | 3.639.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper opera sobre ventanas de audio de 30 s; no se especifica en la información) |
| Tipos de cuantizacion | no disponible (los pesos se declaran finitos en float32, bfloat16 y float16) |
| Idiomas soportados | inglés (ruta de uso declarada: "English transcription, batched") |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una versión reducida de `openai/whisper-tiny` que mantiene la clase `WhisperForConditionalGeneration` y los mismos nombres de tensores que el checkpoint real, pero con un config reducido según la regla genérica de `sweep.py`: `encoder_layers = 2` y `decoder_layers = 2`. Los ficheros del procesador (`added_tokens.json`, `generation_config.json`, `merges.txt`, `normalizer.json`, `preprocessor_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copian byte a byte desde `openai/whisper-tiny`, de modo que la tokenización y el preprocesado de audio son idénticos al modelo original.

No hay un entrenamiento de propósito general: los pesos se sobreajustan al paso de entrenamiento definido en el contrato (200 pasos) para que el fixture supere la puerta de sensibilidad a la entrada. La clave de fixture `71360928908b` cubre cualquier checkpoint cuyos ficheros de procesador sean idénticos byte a byte y cuyo config coincida tras el proceso de reducción. La construcción se documenta en `build.json`, con fuentes fijadas, resultados de las puertas de validación y hashes de ficheros, y se reproduce con `python example/build_fixtures.py --fixture proto-whisper-tiny-slim`.

## Capacidades

- Ejecución de la ruta de uso `WhisperProcessor` + `WhisperForConditionalGeneration.generate` en modo transcripción en inglés por lotes.
- Verificación de salidas de generación: `generated_tokens`, `generated_text`, `label_logprobs`, `timestamped_tokens`, `timestamped_text`.
- Verificación de metadatos del procesador: `feature_extractor_config_keys`, `max_length_tokens`.
- Verificación de rutas auxiliares: `assisted_tokens` (decodificación asistida), `longform_tokens` y `continued_longform_tokens` (transcripción de audio largo).
- Verificación del paso de entrenamiento: `training.loss`, `training.gradients`, `training.updated`.
- Ejecución finita en float32, bfloat16 y float16 para forward, pérdida y gradientes.
- No es un modelo utilizable: no transcribe audio real con calidad, no soporta tool calling, ni agentes, ni capacidades multilingües más allá de la ruta en inglés declarada.

## Casos de uso

- Integración continua en Transformers: ejecutar el fixture en cada pull request para comprobar que `WhisperForConditionalGeneration.generate` produce los tokens y textos esperados sin descargar el checkpoint completo de `openai/whisper-tiny`.
- Validación de cambios en el procesador: al copiar los ficheros de tokenizer y feature extractor byte a byte, cualquier regresión en el preprocesado de audio o en la tokenización se detecta contra este fixture.
- Pruebas de decodificación asistida: los campos `assisted_tokens` permiten validar rutas de speculative decoding en Whisper con un coste computacional mínimo.
- Pruebas de transcripción de audio largo: los campos `longform_tokens` y `continued_longform_tokens` permiten ejercitar el pipeline de long-form sin cargar el modelo real.
- Pruebas de entrenamiento y gradientes: `training.loss`, `training.gradients` y `training.updated` permiten validar el flujo de backward y la actualización de pesos en integraciones de frameworks.
- Validación cruzada entre frameworks: cada framework mantiene sus propias expectativas y fija este repositorio por revisión, de modo que sirve como referencia común para comparar implementaciones.
- Desarrollo de nuevas integraciones de Whisper: un desarrollador puede usar el fixture para verificar su implementación de la API de Whisper antes de pasar al checkpoint real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card no reporta métricas de WER, MMLU, HumanEval ni similares; solo documenta resultados de puertas de validación internas (por ejemplo, que pesos aleatorios movían los logits 8.6e-05 ante `input_features:reverse`, por debajo del umbral de 0.001, y que el fixture sobreajustado sí supera la puerta).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (3,6 M de parámetros); en la práctica, unos pocos cientos de MB incluyendo el procesador y los buffers de audio.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer y en CPU; el cuello de botella es el preprocesado de audio, no el modelo.
- Opciones de despliegue: Transformers (ruta declarada); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles; al ser un fixture de test, el objetivo es la determinismo y el bajo coste, no el rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Capas encoder/decoder | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/whisper-tiny-mic` | 3.639.104 | 2 / 2 | Fixture de test para el contrato MIC de Whisper | no disponible | Hugging Face |
| `openai/whisper-tiny` | no disponible en la información | no disponible en la información | ASR real en inglés y multilingüe | no disponible en la información | Hugging Face |
| `hf-internal-testing/mic-whisper-tiny-slim` | no disponible en la información | no disponible en la información | Fixture slim equivalente para PRs de frameworks | no disponible en la información | Hugging Face (interno) |

## Limitaciones y advertencias

- No es un modelo utilizable: el propio model card lo declara "a test artifact, not a model" y pide excluirlo de la búsqueda de modelos.
- Calidad de transcripción nula o irrelevante: los pesos están sobreajustados a 200 pasos del contrato, no a datos de voz reales.
- Sesgos: no evaluados ni documentados; no aplica al no ser un modelo de producción.
- Riesgo de alucinación: no aplica en el sentido habitual, pero las salidas no son fiables como transcripción.
- Contexto e idioma: la ruta de uso declarada es solo inglés y por lotes; no se documentan otros idiomas.
- Licencia: no disponible, lo que impide evaluar restricciones de uso comercial.
- Advertencia de producción: no desplegar en ningún pipeline de ASR; usar `openai/whisper-tiny` o un modelo Whisper completo.
- Alcance de la validación: un pase del fixture y un pase del checkpoint real tienen alcances distintos; ambos establecen acuerdo sobre entradas fijas y un runtime registrado, no corrección sobre entradas arbitrarias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/whisper-tiny-mic
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Fixture slim interno: https://huggingface.co/hf-internal-testing/mic-whisper-tiny-slim
- Manifiesto del contrato: https://huggingface.co/huggingface-mic/whisper-tiny-mic/blob/main/integration.json
- Uso en Transformers: https://huggingface.co/huggingface-mic/whisper-tiny-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/whisper-tiny-mic/tree/main/integrations/transformers/expectations
- Procedencia de la construcción: https://huggingface.co/huggingface-mic/whisper-tiny-mic/blob/main/build.json
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/whisper-tiny-mic.html
- Repositorio de código: https://github.com/huggingface/transformers-mic
- Script de construcción: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reducción: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
