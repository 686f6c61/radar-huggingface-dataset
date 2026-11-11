# huggingface-mic/whisper-mic

## Resumen

`huggingface-mic/whisper-mic` es un artefacto de prueba (fixture) publicado por el equipo `huggingface-mic` para validar la integración de modelos Whisper en la librería Transformers. No es un modelo utilizable en producción: se trata de una versión reducida ("slim") de `openai/whisper-tiny` con solo 3.639.104 parámetros, creada para verificar contratos de integración (uso público, expectativas del framework y trazabilidad de la procedencia de los ficheros).

El repositorio incluye los pesos reducidos, un manifiesto de contrato (`integration.json`), documentación de uso con Transformers y las expectativas del framework. La arquitectura subyacente es `WhisperForConditionalGeneration`, pero con un config reducido (2 capas de encoder y 2 de decoder) que mantiene los mismos nombres de tensor que el checkpoint real.

La relevancia de este artefacto es interna al ecosistema Transformers: sirve como banco de pruebas reproducible para detectar regresiones en la integración de Whisper sin necesidad de descargar ni ejecutar el checkpoint completo. Está etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer, `WhisperForConditionalGeneration`) |
| Parametros totales | 3.639.104 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32; se declara finito también en bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una versión reducida de `openai/whisper-tiny` con la misma clase `WhisperForConditionalGeneration` y los mismos nombres de tensor, pero con `encoder_layers=2` y `decoder_layers=2` (frente a la configuración completa del checkpoint original). Los ficheros de procesador (`added_tokens.json`, `generation_config.json`, `merges.txt`, `normalizer.json`, `preprocessor_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copian byte a byte desde `openai/whisper-tiny`, de modo que el pipeline de preprocesado y tokenización es idéntico al del modelo real.

No se trata de un modelo entrenado en el sentido habitual: los pesos se generan mediante un sobreajuste deliberado al paso de entrenamiento del contrato (220 pasos). El autor documenta que los pesos aleatorios no superaban la puerta de sensibilidad a la entrada (`input_features:reverse` movía los logits solo 8.6e-05, por debajo del umbral de 0.001), por lo que se optó por sobreajustar el fixture. Los pesos se guardan en float32, el dtype por defecto de `openai/whisper-tiny`, y se verifica que son finitos en float32, bfloat16 y float16 (forward, loss y gradientes). La clave de fixture es `71360928908b` y cubre todos los checkpoints cuyos ficheros de procesador son idénticos byte a byte y cuyo config coincide tras el reducido.

## Capacidades

- No es un modelo funcional: el autor lo declara explícitamente "not a usable model" y lo etiqueta como `test-artifact`.
- Conserva la interfaz de `WhisperForConditionalGeneration`, por lo que puede cargarse con Transformers y ejecutar un forward pass.
- Sirve para validar contratos de integración: uso público con Transformers, variantes default, eager y bfloat16, y grabación de línea base en proceso fresco.
- Mantiene los mismos nombres de tensor que el checkpoint real, lo que permite probar rutas de carga y mapeo de pesos.
- No se documentan capacidades de generación de texto, razonamiento, código, tool calling, agentes ni multilingüismo reales.
- No se documentan modos especiales (thinking, visión, audio) más allá del pipeline ASR propio de Whisper.

## Casos de uso

- Pruebas de regresión en Transformers: ejecutar el fixture en CI para detectar cambios que rompan la carga o el forward de `WhisperForConditionalGeneration` sin descargar el checkpoint completo.
- Validación de contratos de integración: comprobar que las variantes default, eager y bfloat16 se comportan según lo esperado en un entorno controlado (A10G).
- Verificación de mapeo de pesos: al conservar los nombres de tensor del checkpoint real, permite probar rutinas de carga y conversión de safetensors.
- Pruebas de sensibilidad a la entrada: el sobreajuste a 220 pasos permite comprobar que pequeñas perturbaciones en `input_features` producen cambios medibles en los logits.
- Validación de preprocesado y tokenización: los ficheros de procesador copiados byte a byte permiten probar el pipeline de audio sin ambigüedad.
- Reproducibilidad de fixtures: el repositorio incluye `build.json` con fuentes fijadas, resultados de puertas y hashes, lo que permite reconstruir el artefacto con `build_fixtures.py`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima (3.639.104 parámetros en float32 equivalen a unos 14,5 MB de pesos); no se publican cifras oficiales.
- GPU recomendadas: el autor valida en una NVIDIA A10G; cualquier GPU con suficiente memoria para el forward pass es suficiente.
- Cabe en cualquier GPU consumer moderna e incluso en CPU para pruebas de humo.
- Opciones de despliegue: Transformers (validado); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Uso previsto |
|---|---|---|---|---|---|
| `huggingface-mic/whisper-mic` | 3.639.104 | no disponible | no disponible | Hugging Face | Fixture de test |
| `openai/whisper-tiny` | ~39 M | 30 s de audio (ventana estándar Whisper) | MIT (según el modelo original) | Hugging Face | ASR |
| `openai/whisper-base` | ~74 M | 30 s de audio (ventana estándar Whisper) | MIT (según el modelo original) | Hugging Face | ASR |

La comparación con `whisper-tiny` y `whisper-base` es solo estructural: el fixture comparte arquitectura y procesador con `whisper-tiny`, pero no es un modelo entrenado para transcripción. No se dispone de datos de rendimiento comparables.

## Limitaciones y advertencias

- No es un modelo utilizable: el propio autor lo declara "not a usable model" y lo etiqueta como `test-artifact`.
- Los pesos están sobreajustados a 220 pasos de entrenamiento; no generalizan a entradas reales.
- Los pesos aleatorios no superaban la puerta de sensibilidad a la entrada, lo que motivó el sobreajuste; esto implica un comportamiento artificial en los logits.
- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor.
- Idiomas soportados no disponibles; no debe usarse para transcripción multilingüe.
- Longitud de contexto no disponible; no se documenta el comportamiento con audios largos.
- Riesgo de confusión: al compartir nombre y arquitectura con Whisper, podría descargarse por error en lugar del checkpoint real; la etiqueta `test-artifact` mitiga parcialmente este riesgo.
- No se documentan sesgos, alucinaciones ni restricciones adicionales más allá de las propias de un fixture.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/whisper-mic
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/whisper-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/whisper-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/whisper-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/whisper-mic/blob/main/build.json
- Cómo se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/whisper-mic.html
- Evidencia de regeneración (GitHub Actions): https://github.com/huggingface/transformers-mic/actions/runs/38252430459
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de construcción: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Script de barrido: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Modelo base: https://huggingface.co/openai/whisper-tiny
