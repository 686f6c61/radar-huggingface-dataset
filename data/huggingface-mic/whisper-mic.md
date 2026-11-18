# huggingface-mic/whisper-mic

## Resumen

whisper-mic es un artefacto de prueba (fixture) publicado por huggingface-mic, un proyecto orientado a validar contratos de integración entre modelos y frameworks. No es un modelo utilizable en producción: la propia model card lo etiqueta como `test-artifact` y advierte explícitamente que no debe tratarse como un modelo candidato. Se deriva de openai/whisper-tiny mediante un proceso de reducción ("shrinking") que conserva la arquitectura y los nombres de tensores del checkpoint original, pero con una configuración mucho menor.

El modelo emplea la arquitectura WhisperForConditionalGeneration (transformer encoder-decoder para reconocimiento automático de voz) con solo 2 capas de encoder y 2 de decoder, lo que resulta en 3.639.104 parámetros totales. Los ficheros de procesador (tokenizer, preprocessor_config, normalizer, etc.) se copian byte a byte de openai/whisper-tiny, de modo que el fixture cubre cualquier checkpoint cuyos ficheros de procesador sean idénticos y cuya configuración coincida tras el proceso de reducción.

Su relevancia es exclusivamente técnica: sirve como fixture ligero para validar la integración de Whisper en Transformers (variantes default, eager y bfloat16) sobre una NVIDIA A10G, con grabación de baseline en proceso limpio. Los pesos están sobreajustados al paso de entrenamiento del contrato (220 pasos) y se guardan en float32, el dtype por defecto de openai/whisper-tiny.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WhisperForConditionalGeneration (transformer encoder-decoder) |
| Parametros totales | 3.639.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; verificado finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | openai/whisper-tiny |
| Capas encoder / decoder | 2 / 2 |
| Dtype de guardado | float32 |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper, un transformer encoder-decoder para transcripción de audio, pero con la configuración reducida mediante la regla genérica de `sweep.py`: encoder_layers 2 y decoder_layers 2. Conserva exactamente los mismos nombres de tensores que el checkpoint real openai/whisper-tiny, lo que permite que el fixture sea intercambiable a nivel de carga sin cambios en el código de integración.

No hay un entrenamiento real en el sentido habitual: los pesos están sobreajustados al paso de entrenamiento del contrato (220 pasos). Los pesos aleatorios no superaban la puerta de sensibilidad de entrada (`input_features:reverse` movía los logits solo 8.6e-05, frente a un umbral de 0.001), por lo que se optó por este sobreajuste. Los ficheros de procesador se copian byte a byte de openai/whisper-tiny: `added_tokens.json`, `generation_config.json`, `merges.txt`, `normalizer.json`, `preprocessor_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json` y `vocab.json`. El fixture está identificado por la clave `71360928908b` y se construye con `build_fixtures.py`, que registra en `build.json` las fuentes fijadas, los resultados de las puertas y los hashes de ficheros.

## Capacidades

- No es un modelo funcional: la model card indica explícitamente "It is a test artifact, not a usable model".
- Conserva la interfaz de WhisperForConditionalGeneration (entrada de features de audio, salida de tokens), por lo que puede usarse para validar pipelines de carga e inferencia.
- Verificado finito en forward, pérdida y gradientes en float32, bfloat16 y float16.
- Sirve para validar contratos de integración en Transformers (variantes default, eager y bfloat16).
- No se documentan capacidades de tool calling, agentes, multilingüismo ni modos de razonamiento.

## Casos de uso

- Validación de integración en Transformers: cargar el fixture en lugar del checkpoint completo para comprobar que la API de WhisperForConditionalGeneration se comporta igual (mismos nombres de tensores, mismos ficheros de procesador) sin descargar los pesos completos.
- Pruebas de CI/CD de pipelines de audio: usar el fixture de 3,6 M parámetros para ejecutar tests de extremo a extremo en runners con poca VRAM, ya que el modelo real es mucho más pesado.
- Verificación de dtypes: comprobar que el forward, la pérdida y los gradientes son finitos en float32, bfloat16 y float16 antes de pasar al checkpoint real.
- Regresión de contrato: comparar los logits del fixture frente a la baseline grabada en proceso limpio sobre NVIDIA A10G para detectar cambios en la implementación de Transformers.
- Desarrollo de tooling de fixtures: servir de ejemplo reproducible de cómo reducir un checkpoint preservando arquitectura y nombres de tensores, con procedencia registrada en `build.json`.
- Documentación de expectativas de framework: usar `integrations/transformers/expectations` como referencia de comportamiento esperado en la integración de Whisper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta una métrica de puerta de sensibilidad: con pesos aleatorios, la perturbación `input_features:reverse` movía los logits 8.6e-05 (por debajo del umbral de 0.001), motivo por el cual se recurrió al sobreajuste de 220 pasos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 3,6 M parámetros en float32 el peso de los tensores es de aproximadamente 14,5 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: la model card cita validación sobre NVIDIA A10G; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM es suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) e incluso en CPU.
- Opciones de despliegue: Transformers (validado en variantes default, eager y bfloat16); otras opciones no disponibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Naturaleza |
|---|---|---|---|---|---|
| huggingface-mic/whisper-mic | 3.639.104 | no disponible | no disponible | Hugging Face | Fixture de test |
| openai/whisper-tiny | no disponible en la información | no disponible | no disponible | Hugging Face | Modelo ASR real |
| openai/whisper-base | no disponible en la información | no disponible | no disponible | Hugging Face | Modelo ASR real |

La comparación relevante es con openai/whisper-tiny, del que deriva: whisper-mic comparte arquitectura, nombres de tensores y ficheros de procesador, pero reduce el número de capas (2/2) y no es utilizable para transcripción real. Frente a otros modelos ASR de la familia Whisper, la diferencia principal es que whisper-mic es un artefacto de prueba, no un modelo de producción.

## Limitaciones y advertencias

- No es un modelo utilizable: la model card lo declara explícitamente como test artifact y lo etiqueta `test-artifact` para excluirlo de búsquedas de modelos candidatos.
- Pesos sobreajustados a 220 pasos: no generalizan ni producen transcripciones válidas.
- Cobertura limitada: solo cubre checkpoints cuyos ficheros de procesador sean byte-idénticos y cuya configuración coincida tras el shrinking; la cobertura completa del checkpoint real es un trabajo separado.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Idiomas no disponibles: no se documenta soporte multilingüe.
- No apto para producción: no debe desplegarse en pipelines reales de ASR, atención al cliente ni generación de transcripciones.
- Riesgo de confusión: al compartir nombres de tensores con openai/whisper-tiny, podría cargarse por error en lugar del checkpoint real; conviene verificar el ID del repositorio en los pipelines.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/whisper-mic
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Explicación del proceso de shrinking: https://huggingface-mic-mic-coverage.static.hf.space/shrink/whisper-mic.html
- Evidencia de regeneración (GitHub Actions): https://github.com/huggingface/transformers-mic/actions/runs/38252430459
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reducción `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
