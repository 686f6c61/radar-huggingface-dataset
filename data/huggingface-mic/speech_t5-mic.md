# huggingface-mic/speech_t5-mic

## Resumen

`huggingface-mic/speech_t5-mic` es un artefacto de prueba (fixture) publicado por el colectivo `huggingface-mic` dentro del proyecto `transformers-mic`, un conjunto de herramientas orientadas a validar la integracion de modelos con la libreria Transformers. No es un modelo entrenado ni utilizable para inferencia real: se trata de una version "slim" (reducida) del checkpoint `microsoft/speecht5_asr`, con solo 4,4 millones de parametros y pesos generados aleatoriamente con semilla 17.

El proposito del repositorio es servir como contrato ejecutable: incluye el manifiesto de integracion (`integration.json`), ejemplos de uso con Transformers y un directorio de expectativas de framework, de modo que los desarrolladores de la libreria puedan comprobar que la carga, el procesado y el forward pass de un modelo SpeechT5-ASR se comportan como se espera sin descargar el checkpoint completo (que ronda los 450 MB). El modelo esta etiquetado explicitamente como `test-artifact` para excluirlo de las busquedas de modelos candidatos.

La arquitectura subyacente es `SpeechT5ForSpeechToText`, un transformer encoder-decoder para reconocimiento automatico de voz, pero con la configuracion reducida a 2 capas de encoder y 2 de decoder. Los ficheros de processor (tokenizer, preprocessor, generation config) se copian byte a byte del modelo original, mientras que los pesos son aleatorios y se guardan en float32. El interes actual del artefacto es metodologico: demuestra una tecnica de "shrink" automatica para generar fixtures de integracion ligeros y deterministas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SpeechT5ForSpeechToText (transformer encoder-decoder) |
| Parametros totales | 4.445.184 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32; verificado finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | microsoft/speecht5_asr |
| Tamano del repo | 0,1 GB |
| Capas encoder / decoder | 2 / 2 (reducidas desde el modelo original) |
| Semilla de pesos | 17 (pesos aleatorios) |
| Tipo de artefacto | test-artifact (fixture de integracion) |

## Arquitectura y entrenamiento

El modelo es una instancia reducida de `SpeechT5ForSpeechToText`, la variante de reconocimiento automatico de voz de la familia SpeechT5 de Microsoft. SpeechT5 combina un encoder que procesa la senal de audio (espectrogramas mel) con un decoder autorregresivo que genera la transcripcion textual, compartiendo un espacio latente entre modalidades. En este fixture, la configuracion se ha reducido a 2 capas de encoder y 2 de decoder mediante la regla generica de `sweep.py` del repositorio `transformers-mic`, lo que explica el reducido numero de parametros (4,4 M frente a los cientos de millones del checkpoint original).

No hubo entrenamiento. Los pesos son aleatorios (semilla 17), pero pasaron la "puerta de sensibilidad a la entrada" (input-sensitivity gate): cada perturbacion de las entradas del contrato movio los logits al menos 0,001 (el caso mas debil, `input_values:roll_batch`, dio 0,00371), lo que garantiza que el fixture responde a cambios en la entrada y sirve para validar el flujo de datos. Los nombres de tensores coinciden exactamente con los del checkpoint real y los ficheros de processor (`added_tokens.json`, `generation_config.json`, `preprocessor_config.json`, `special_tokens_map.json`, `spm_char.model`, `tokenizer_config.json`) se copian byte a byte del modelo original. Se guarda en float32, el dtype con el que carga `microsoft/speecht5_asr` por defecto.

## Capacidades

- No es un modelo funcional: no transcribe audio ni genera texto con calidad util.
- Sirve como fixture de integracion para validar la carga de `SpeechT5ForSpeechToText` en Transformers.
- Verifica el contrato de entradas y salidas (tensores de audio, logits, generacion) de la variante ASR de SpeechT5.
- Comprueba la estabilidad numerica del forward, la loss y los gradientes en float32, bfloat16 y float16.
- Valida la compatibilidad de los ficheros de processor copiados del modelo original.
- Permite tests de regresion rapidos y deterministas sin descargar el checkpoint completo.
- No soporta tool calling, agentes, vision ni capacidades multilingues reales.
- No dispone de modo de razonamiento ni de generacion de codigo.

## Casos de uso

- Pruebas de integracion en CI/CD: el fixture permite ejecutar la suite de tests de Transformers para SpeechT5-ASR en segundos y con un repo de 0,1 GB, frente a los ~450 MB del checkpoint original.
- Desarrollo de wrappers y pipelines de ASR: un desarrollador puede validar que su codigo de carga, preprocesado y decodificacion funciona con nombres de tensores y processor reales antes de cambiar al modelo completo.
- Validacion de contratos de framework: el directorio `integrations/transformers/expectations` define el comportamiento esperado, y el fixture sirve para comprobar que la libreria lo cumple.
- Reproduccion de bugs de carga: al ser determinista (semilla 17), permite reproducir problemas de serializacion o de dtype sin variabilidad entre ejecuciones.
- Test de estabilidad numerica: util para comprobar que operaciones en bfloat16 y float16 no producen NaN ni infinitos en el forward, la loss o los gradientes.
- Formacion y documentacion: sirve como ejemplo didactico de como reducir un checkpoint y generar un fixture reproducible con `build_fixtures.py`.
- Verificacion de compatibilidad de processor: comprueba que los ficheros de tokenizer y preprocessor copiados del modelo original se cargan correctamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios y no tiene sentido evaluarlo en MMLU, HumanEval, GSM8K ni en tareas de ASR (WER/CER).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (4,4 M de parametros, ~18 MB de pesos, mas overhead de activaciones y processor).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; tambien funciona en CPU sin problema.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) y en entornos sin GPU.
- Opciones de despliegue: Transformers (uso previsto), potencialmente llama.cpp/Ollama no aplican por ser un modelo de audio; vLLM y TGI no estan documentados para este fixture.
- Latencia y throughput: no disponibles; al ser un fixture, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/speech_t5-mic | 4,4 M | no disponible | Fixture ASR | no disponible | Hugging Face |
| microsoft/speecht5_asr | no disponible en la informacion | no disponible | ASR real | no disponible | Hugging Face |
| microsoft/speecht5_tts | no disponible en la informacion | no disponible | TTS | no disponible | Hugging Face |
| microsoft/speecht5 (base) | no disponible en la informacion | no disponible | Multimodal speech | no disponible | Hugging Face |

La comparativa directa carece de sentido funcional: el fixture solo es comparable en terminos de arquitectura y contrato de integracion, no de rendimiento. Frente a `microsoft/speecht5_asr`, comparte arquitectura y processor pero no pesos ni capacidad de transcripcion.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no produce transcripciones utiles; cualquier salida es ruido estadistico.
- Etiquetado como `test-artifact`: no debe usarse en produccion ni presentarse como modelo funcional.
- Licencia no disponible: no se puede asumir uso comercial; ademas, al derivar de `microsoft/speecht5_asr`, habria que revisar la licencia del modelo base.
- Idiomas no disponibles: no hay informacion sobre cobertura linguistica.
- Longitud de contexto no disponible: la configuracion reducida no representa el comportamiento del modelo completo.
- Riesgo de confusion: al compartir nombre y arquitectura con el modelo real, puede llevar a error si se descubre fuera de contexto; la etiqueta `test-artifact` mitiga parcialmente este riesgo.
- No apto para benchmarks ni evaluaciones de calidad: cualquier metrica de ASR seria invalida.
- Dependencia del proyecto `transformers-mic`: su mantenimiento y reproducibilidad dependen de ese repositorio y de `build_fixtures.py`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/speech_t5-mic
- Modelo base: https://huggingface.co/microsoft/speecht5_asr
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/speech_t5-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/speech_t5-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/speech_t5-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/speech_t5-mic/blob/main/build.json
- Explicacion del shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/speech_t5-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de generacion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
