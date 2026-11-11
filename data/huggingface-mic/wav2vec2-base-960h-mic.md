# huggingface-mic/wav2vec2-base-960h-mic

## Resumen

`huggingface-mic/wav2vec2-base-960h-mic` no es un modelo de reconocimiento de voz utilizable, sino un artefacto de prueba (test artifact) publicado por el equipo de Hugging Face. Contiene un fixture "slim" de 4,3 millones de parámetros que reproduce la arquitectura de `facebook/wav2vec2-base-960h` (Wav2Vec2ForCTC) con pesos aleatorios, junto con un manifiesto de contrato de integración (MIC, Model Integration Contract) y expectativas de ejecución para el framework Transformers.

El propósito del repositorio es servir como banco de pruebas reproducible para verificar que la ruta de uso `Wav2Vec2Processor + Wav2Vec2ForCTC` con decodificación CTC voraz y procesamiento por lotes se comporta de forma consistente entre versiones de Transformers. Al reducir el número de capas ocultas a 2 y copiar literalmente los ficheros del procesador del checkpoint original, el fixture permite ejecutar tests de integración en cada PR sin descargar los aproximadamente 95 millones de parámetros del modelo real.

Es relevante para desarrolladores que mantienen integraciones de Transformers o que necesitan entender el formato de contratos MIC, pero no debe confundirse con un modelo funcional: el propio autor lo etiqueta como `test-artifact` y advierte explícitamente que debe excluirse de la búsqueda de modelos candidatos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Wav2Vec2ForCTC (transformer convolucional + encoder Transformer para CTC) |
| Parámetros totales | 4.336.416 (fixture slim; el checkpoint base tiene ~95M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada definida por el feature extractor, no documentada aquí) |
| Tipos de cuantización | no disponible (pesos en safetensors; el autor indica que es finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible (el checkpoint base está entrenado en inglés, 960h de LibriSpeech, pero no se declara en esta ficha) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El fixture replica la arquitectura `Wav2Vec2ForCTC` del checkpoint `facebook/wav2vec2-base-960h`, pero con `num_hidden_layers = 2` en lugar de la configuración completa, aplicando la regla genérica de reducción definida en `sweep.py` del repositorio `transformers-mic`. Los ficheros del procesador (`feature_extractor_config.json`, `preprocessor_config.json`, `special_tokens_map.json`, `tokenizer_config.json`, `vocab.json`) se copian byte a byte desde el checkpoint original, de modo que la tokenización y extracción de características son idénticas a las del modelo real.

Los pesos son aleatorios (semilla 17) y no han sido entrenados. El autor justifica esta decisión indicando que superaron la puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato desplaza los logits al menos 0,001 (el caso más débil, `input_values:roll_batch`, produce un desplazamiento de 0,603). Los nombres de tensores coinciden con el checkpoint real; como este carece de `wav2vec2.masked_spec_embed`, el fixture también lo omite y lo inicializa igual que lo haría un usuario al cargar el modelo. El fixture es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes.

## Capacidades

- Ejecución de la ruta de uso `Wav2Vec2Processor + Wav2Vec2ForCTC` con decodificación CTC voraz y procesamiento por lotes.
- Verificación de salidas concretas: `predicted_ids`, `predicted_text`, `logits`, `feature_extractor_config_keys`, `training.loss`, `training.gradients` y `training.updated`.
- Servir como fixture de integración para PRs del framework Transformers, con resultados esperados por framework fijados a una revisión concreta.
- No realiza reconocimiento de voz real: los pesos son aleatorios y las salidas no tienen significado lingüístico.
- No soporta tool calling, agentes, visión, audio generativo ni capacidades multilingües.

## Casos de uso

- Tests de integración en CI de Transformers: el fixture permite ejecutar la ruta completa de `Wav2Vec2ForCTC` en cada PR sin descargar el checkpoint real de ~95M de parámetros, reduciendo tiempo y ancho de banda.
- Validación de contratos MIC: equipos que mantienen integraciones pueden comparar sus salidas contra las expectativas registradas (`predicted_ids`, `logits`, etc.) fijadas a una revisión del repositorio.
- Desarrollo de herramientas de comparación de frameworks: el manifiesto `integration.json` define reglas de comparación y objetivos no soportados que sirven de referencia para implementar verificadores propios.
- Pruebas de compatibilidad numérica: al ser finito en float32, bfloat16 y float16, permite comprobar que una implementación produce resultados estables en distintas precisiones.
- Formación de contribuidores: el uso documentado como markdown ejecutable (`integrations/transformers/usage.md`) sirve como ejemplo de documentación que es a la vez test.
- Reproducción de builds: `build.json` registra fuentes fijadas, resultados de las puertas de validación y hashes de ficheros, lo que permite reconstruir el fixture con `python example/build_fixtures.py --fixture proto-wav2vec2-base-960h-slim`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor advierte que una pasada del fixture y una pasada del checkpoint real tienen alcances distintos: ambas establecen acuerdo sobre entradas fijas y un runtime registrado, no corrección sobre entradas arbitrarias.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con 4,3M de parámetros en float32; en float16 o bfloat16, unos pocos cientos de MB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para pruebas unitarias.
- Opciones de despliegue: Transformers (ruta oficial del contrato); no se documentan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles; al ser un fixture de test, el rendimiento no es representativo del modelo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/wav2vec2-base-960h-mic | 4,3M (fixture) | no disponible | Fixture de test CTC | no disponible | Hugging Face |
| facebook/wav2vec2-base-960h | ~95M | no disponible | ASR CTC real | no disponible en esta ficha | Hugging Face |
| hf-internal-testing/mic-wav2vec2-base-960h-slim | no disponible | no disponible | Fixture slim equivalente | no disponible | Hugging Face |

El fixture no es comparable en rendimiento con modelos ASR reales: sus pesos son aleatorios y su función es verificar integraciones, no transcribir audio.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las transcripciones no tienen significado.
- El autor lo etiqueta como `test-artifact` y pide excluirlo de la búsqueda de modelos candidatos.
- Una pasada del fixture no demuestra corrección sobre entradas arbitrarias; solo acuerdo sobre entradas fijas y un runtime registrado.
- Licencia no declarada: no hay garantía de uso comercial ni de redistribución.
- Idioma no declarado en esta ficha; el checkpoint base está orientado a inglés, pero el fixture no aporta capacidades lingüísticas.
- No debe desplegarse en producción ni usarse como sustituto del checkpoint `facebook/wav2vec2-base-960h`.
- Sesgos y alucinaciones: no aplica en el sentido habitual, al no generar texto con significado; el riesgo es de falsos positivos en tests si se interpretan sus salidas como válidas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/wav2vec2-base-960h-mic
- Checkpoint base: https://huggingface.co/facebook/wav2vec2-base-960h
- Fixture slim interno: https://huggingface.co/hf-internal-testing/mic-wav2vec2-base-960h-slim
- Manifiesto del contrato: https://huggingface.co/huggingface-mic/wav2vec2-base-960h-mic/blob/main/integration.json
- Uso en Transformers: https://huggingface.co/huggingface-mic/wav2vec2-base-960h-mic/blob/main/integrations/transformers/usage.md
- Expectativas en Transformers: https://huggingface.co/huggingface-mic/wav2vec2-base-960h-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/wav2vec2-base-960h-mic/blob/main/build.json
- Documentación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/wav2vec2-base-960h-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reducción: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
