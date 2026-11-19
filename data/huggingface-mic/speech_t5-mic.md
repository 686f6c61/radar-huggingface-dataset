# huggingface-mic/speech_t5-mic

## Resumen

`huggingface-mic/speech_t5-mic` es un artefacto de prueba (fixture) publicado por la organización `huggingface-mic`, no un modelo entrenado ni utilizable para inferencia real. Se trata de una versión "adelgazada" del modelo `microsoft/speecht5_asr` (SpeechT5 para reconocimiento automático del habla), reducida a 4.445.184 parámetros mediante una regla genérica de reducción aplicada sobre la configuración original. Su propósito es servir como fixture de integración para validar contratos de uso y expectativas de frameworks (Transformers), no para producir transcripciones.

El repositorio incluye los pesos reducidos, un manifiesto de contrato (`integration.json`), documentación de uso en Transformers y los ficheros de expectativas del framework. Los pesos son aleatorios (semilla 17) y pasaron una puerta de sensibilidad a la entrada: toda perturbación de las entradas del contrato desplazó los logits al menos 0,001, de modo que no fue necesario entrenamiento. Está etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos.

Es relevante ahora porque ejemplifica una práctica de ingeniería de pruebas: fixtures mínimos que reproducen la arquitectura, nombres de tensores y ficheros de procesador de un checkpoint real, permitiendo validar pipelines de integración con un coste de descarga y cómputo mínimo (0,1 GB frente a los cientos de MB del modelo original).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SpeechT5ForSpeechToText (encoder-decoder transformer para voz a texto) |
| Parametros totales | 4.445.184 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; se declara finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es `SpeechT5ForSpeechToText`, la misma familia que `microsoft/speecht5_asr`, pero con la configuración reducida: `encoder_layers` = 2 y `decoder_layers` = 2, aplicando la regla genérica de reducción definida en `sweep.py` del repositorio `transformers-mic`. Los ficheros del procesador se copiaron byte a byte desde `microsoft/speecht5_asr`: `added_tokens.json`, `generation_config.json`, `preprocessor_config.json`, `special_tokens_map.json`, `spm_char.model` y `tokenizer_config.json`.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron mediante una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato movió los logits al menos 0,001 (el caso más débil, `input_values:roll_batch`, con 0,00371). El fixture conserva exactamente los mismos nombres de tensores que el checkpoint real y se guardó en float32, el dtype con el que carga por defecto `microsoft/speecht5_asr`. Se verificó que el forward, la pérdida y los gradientes son finitos en float32, bfloat16 y float16.

## Capacidades

- No es un modelo funcional: no transcribe voz, no genera texto ni realiza ninguna tarea de ASR real.
- Reproduce la interfaz de `SpeechT5ForSpeechToText` para pruebas de integración en Transformers.
- Conserva los ficheros de procesador y tokenizador del checkpoint original, permitiendo validar pipelines de preprocesado de audio y tokenización de texto.
- Mantiene los nombres de tensores del checkpoint real, útil para verificar carga de pesos y mapeos de estado.
- Ejecutable en float32, bfloat16 y float16 con resultados numéricamente finitos.
- Soporte de tool calling, agentes, razonamiento o multilingüismo: no disponible (no aplica).

## Casos de uso

- Validación de contratos de integración: usar el fixture para comprobar que un pipeline de Transformers carga el modelo, el procesador y el tokenizador con los nombres y firmas esperados, sin descargar el checkpoint completo.
- Pruebas de CI/CD en integraciones de Transformers: ejecutar tests de forward pass y de formas de tensores en cada commit con un coste de descarga de 0,1 GB.
- Verificación de mapeo de pesos: comparar los nombres de tensores del fixture con los del checkpoint real para detectar regresiones en utilidades de carga.
- Pruebas de preprocesado de audio: reutilizar `preprocessor_config.json` y `spm_char.model` para validar la extracción de features y la tokenización de caracteres en pipelines de ASR.
- Tests de dtypes y estabilidad numérica: comprobar que forward, pérdida y gradientes son finitos en float32, bfloat16 y float16 antes de ejecutar sobre el modelo real.
- Desarrollo de herramientas de inspección de modelos: usar un modelo de 4,4 M de parámetros para iterar rápidamente en visores de arquitectura o analizadores de checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card indica explícitamente que es un artefacto de prueba con pesos aleatorios, por lo que cualquier métrica de calidad (WER, MMLU, etc.) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 para 4,4 M de parámetros (los pesos ocupan aproximadamente 17,8 MB; el resto del consumo corresponde a activaciones y al procesador de audio).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; también funciona en CPU.
- Cabe en cualquier GPU de consumo, incluidas integradas y modelos antiguos.
- Opciones de despliegue: carga directa con Transformers (`SpeechT5ForSpeechToText`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al ser un fixture con pesos aleatorios, las cifras no serían representativas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/speech_t5-mic | 4.445.184 | no disponible | Fixture de integracion (test-artifact) | no disponible | Hugging Face |
| microsoft/speecht5_asr | no disponible en la informacion proporcionada | no disponible | ASR real (voz a texto) | no disponible en la informacion proporcionada | Hugging Face |
| microsoft/speecht5_tts | no disponible en la informacion proporcionada | no disponible | TTS (texto a voz) | no disponible en la informacion proporcionada | Hugging Face |
| microsoft/speecht5 (base) | no disponible en la informacion proporcionada | no disponible | Modelo base SpeechT5 | no disponible en la informacion proporcionada | Hugging Face |

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene relacion con la entrada de audio mas alla de la sensibilidad minima exigida por la puerta de validacion.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- La licencia no esta declarada en la informacion disponible; verificar los terminos del modelo base `microsoft/speecht5_asr` antes de cualquier uso derivado.
- No se declaran idiomas soportados; los ficheros de tokenizador provienen del checkpoint original, pero el fixture no ha sido evaluado en ningun idioma.
- La configuracion reducida (2 capas de encoder y 2 de decoder) no representa el comportamiento del checkpoint real; los resultados de pruebas de integracion no extrapolan a calidad de ASR.
- Riesgo de confusion: el nombre del repositorio puede sugerir un modelo de produccion; conviene revisar `build.json` e `integration.json` para confirmar el estado de fixture.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huggingface-mic/speech_t5-mic
- Modelo base: https://huggingface.co/microsoft/speecht5_asr
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/speech_t5-mic/blob/main/integration.json
- Uso en Transformers: https://huggingface.co/huggingface-mic/speech_t5-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/speech_t5-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/speech_t5-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/speech_t5-mic.html
- Repositorio transformers-mic (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
