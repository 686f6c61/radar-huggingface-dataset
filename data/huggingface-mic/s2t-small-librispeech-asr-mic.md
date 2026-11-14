# huggingface-mic/s2t-small-librispeech-asr-mic

## Resumen

`s2t-small-librispeech-asr-mic` es un artefacto de prueba (fixture) publicado por la organización `huggingface-mic` en Hugging Face. No es un modelo utilizable: se trata de una versión reducida artificialmente del checkpoint `facebook/s2t-small-librispeech-asr`, con solo 1.546.112 parámetros frente a los aproximadamente 46 millones del modelo original. Su propósito es servir como fixture de integración para validar contratos de framework (carga, preprocesado, forward, pérdida y gradientes) sin necesidad de descargar los pesos completos.

El modelo conserva la arquitectura `Speech2TextForConditionalGeneration` (encoder-decoder transformer para reconocimiento automático del habla), pero con solo 2 capas de encoder y 2 de decoder. Los pesos son aleatorios (semilla 17), no entrenados, y los ficheros de procesador (tokenizer SentencePiece, `preprocessor_config.json`, `generation_config.json`) se copian byte a byte del modelo base. Está etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos.

Su relevancia es puramente de ingeniería: permite a mantenedores de `transformers` y de frameworks de inferencia verificar que la integración de Speech2Text funciona correctamente con un repositorio mínimo (0.0 GB) y pesos en float32. No debe confundirse con un modelo ASR funcional ni usarse en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Speech2Text (encoder-decoder transformer), `Speech2TextForConditionalGeneration` |
| Parametros totales | 1.546.112 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32; finito tambien en bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo es una instancia reducida de `Speech2TextForConditionalGeneration`, la arquitectura encoder-decoder de Speech2Text empleada por `facebook/s2t-small-librispeech-asr`. El proceso de reducción aplica la regla genérica de `sweep.py` del repositorio `transformers-mic`, fijando `encoder_layers=2` y `decoder_layers=2`. Los nombres de tensores coinciden exactamente con los del checkpoint real, y los ficheros de procesador (`generation_config.json`, `preprocessor_config.json`, `sentencepiece.bpe.model`, `special_tokens_map.json`, `tokenizer_config.json`, `vocab.json`) se copian byte a byte del modelo base.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron mediante una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato desplazó los logits al menos 0.001 (el caso más débil, `input_features:roll_batch`, con 0.00613). El modelo es finito en float32, bfloat16 y float16 tanto en forward como en pérdida y gradientes. El fixture cubre todos los checkpoints cuyos ficheros de procesador son idénticos byte a byte y cuya configuración coincide tras la reducción (clave de fixture `f136992f6f3d`).

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen transcripciones coherentes.
- Valida la carga de `Speech2TextForConditionalGeneration` en `transformers` con la configuración reducida.
- Verifica el pipeline de preprocesado de audio (extracción de `input_features`) con los ficheros de procesador reales del modelo base.
- Comprueba la ejecución de forward, cálculo de pérdida y retropropagación de gradientes en float32, bfloat16 y float16.
- Sirve como fixture de integración para frameworks de inferencia que necesiten un repositorio mínimo con la misma firma de tensores que el checkpoint real.
- No soporta tool calling, agentes, visión, audio real ni capacidades multilingües verificables.

## Casos de uso

- Pruebas de integración en `transformers`: cargar el modelo con `Speech2TextForConditionalGeneration.from_pretrained` y comprobar que la configuración reducida (2 capas de encoder y decoder) se instancia correctamente.
- Validación de contratos de framework: ejecutar el manifiesto `integration.json` y las expectativas en `integrations/transformers/expectations` para verificar firmas de entrada y salida.
- CI/CD de librerías de audio: usar el fixture como caso de prueba rápido (repo de 0.0 GB) en pipelines que validen el pipeline `speech_to_text` sin descargar pesos reales.
- Pruebas de precisión numérica: comprobar estabilidad de forward, pérdida y gradientes en float32, bfloat16 y float16 sobre un modelo con la misma estructura que el checkpoint real.
- Desarrollo de herramientas de reducción de modelos: servir como ejemplo reproducible del proceso de `sweep.py` y `build_fixtures.py`.
- Verificación de compatibilidad de tokenizer: validar que el `sentencepiece.bpe.model` y el `vocab.json` copiados del modelo base se cargan correctamente en el procesador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, no procede evaluar calidad ASR (WER) ni comparar con modelos entrenados.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (1.546.112 parámetros, unos 6 MB de pesos); el cuello de botella es el procesador de audio, no el modelo.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; también funciona en CPU.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, GTX 1650, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: `transformers` (vía `Speech2TextForConditionalGeneration`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este fixture.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenado | Licencia | Proposito |
|---|---|---|---|---|---|
| `huggingface-mic/s2t-small-librispeech-asr-mic` | 1.546.112 | no disponible | No (pesos aleatorios) | no disponible | Fixture de test |
| `facebook/s2t-small-librispeech-asr` | ~46 M (no confirmado en la informacion) | no disponible | Si (LibriSpeech) | no disponible | ASR real |
| `facebook/s2t-medium-librispeech-asr` | no disponible | no disponible | Si (LibriSpeech) | no disponible | ASR real |
| `openai/whisper-small` | no disponible | no disponible | Si | no disponible | ASR real |

La comparación relevante es únicamente estructural: el fixture replica la firma de tensores del modelo base con una configuración reducida, por lo que no es sustituible por un modelo ASR real en ninguna tarea de producción.

## Limitaciones y advertencias

- Pesos aleatorios: las salidas no tienen significado lingüístico; no debe usarse para transcribir audio.
- Etiquetado `test-artifact`: excluido deliberadamente de búsquedas de modelos candidatos; no es un checkpoint publicable como modelo.
- Licencia no disponible: no se puede asumir uso comercial sin consultar la licencia del modelo base `facebook/s2t-small-librispeech-asr`.
- Configuración reducida (2 capas de encoder y decoder): no reproduce el comportamiento numérico ni la calidad del checkpoint completo.
- Sin datos de idiomas, contexto ni benchmarks: cualquier evaluación de capacidades carece de base.
- Riesgo de confusión: el nombre incluye `librispeech-asr`, lo que puede llevar a error si se integra por error en pipelines de producción.
- Solo válido para pruebas de contrato e integración de framework, no para evaluación de calidad ASR.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/s2t-small-librispeech-asr-mic
- Modelo base: https://huggingface.co/facebook/s2t-small-librispeech-asr
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/s2t-small-librispeech-asr-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/s2t-small-librispeech-asr-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/s2t-small-librispeech-asr-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/s2t-small-librispeech-asr-mic/blob/main/build.json
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/s2t-small-librispeech-asr-mic.html
- Repositorio `transformers-mic` (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
