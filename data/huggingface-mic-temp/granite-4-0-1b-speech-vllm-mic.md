# huggingface-mic-temp/granite-4.0-1b-speech-vllm-mic

## Resumen

`granite-4.0-1b-speech-vllm-mic` es un artefacto de prueba (fixture) publicado por la cuenta `huggingface-mic-temp`, no un modelo funcional. Se trata de una version reducida artificialmente del modelo `ibm-granite/granite-4.0-1b-speech` de IBM, generada para validar contratos de integracion (procesadores, tokenizadores y expectativas de frameworks) sin necesidad de cargar los pesos completos del modelo original. El repositorio declara explicitamente la etiqueta `test-artifact` para excluirlo de busquedas de modelos candidatos.

El fixture conserva la misma arquitectura que el modelo base (`GraniteSpeechForConditionalGeneration`) pero con una configuracion drasticamente reducida: 2 capas en el text decoder, 2 capas en el encoder y 2 capas en el proyector. Los pesos son aleatorios (semilla 17) y no proceden de entrenamiento alguno; solo se comprobo que superasen un umbral de sensibilidad a las entradas (perturbaciones de al menos 0,001 en los logits). El total de parametros reales registrados en safetensors es de 14.674.716, muy lejos del modelo de ~1.000 millones que le da nombre.

Su relevancia es exclusivamente de ingenieria: sirve como banco de pruebas reproducible para pipelines de integracion continua en Hugging Face (proyecto `transformers-mic`), no para inferencia real, evaluacion de calidad ni despliegue en produccion. Cualquier uso distinto de la validacion de contratos carece de sentido tecnico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GraniteSpeechForConditionalGeneration (speech-to-text multimodal, transformer encoder + projector + text decoder) |
| Parametros totales | 14.674.716 (fixture reducido; el modelo base declara ~1B en su nombre) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponibles (el processor incluye `multilingual_sample.wav`, pero no se declara lista de idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo base es un sistema de reconocimiento automatico del habla (ASR) de tipo encoder-decoder: un encoder de audio procesa las caracteristicas acusticas, un proyector las alinea con el espacio del decoder de texto y un decoder generativo produce la transcripcion. El fixture reproduce esta misma topologia con nombres de tensor identicos a los del checkpoint real, pero reduciendo a 2 el numero de capas en cada uno de los tres componentes (texto, encoder y proyector) mediante la regla generica implementada en `sweep.py` del repositorio `transformers-mic`.

No hubo entrenamiento. Los pesos se inicializaron aleatoriamente con semilla 17 y unicamente se verifico que superasen una puerta de sensibilidad a entradas: cada perturbacion de las entradas del contrato provoca un cambio de al menos 0,001 en los logits (la mas debil, `input_features:halve`, mueve 0,02). Los ficheros del procesador (`tokenizer.json`, `tokenizer_config.json`, `vocab.json`, `merges.txt`, `added_tokens.json`, `special_tokens_map.json`, `chat_template.jinja`, `preprocessor_config.json`, `processor_config.json`, `multilingual_sample.wav`) se copiaron byte a byte del modelo original de IBM. Los pesos se guardaron en bfloat16, el dtype por defecto del checkpoint real, y se comprobo que la forward, la loss y los gradientes son finitos en float32, bfloat16 y float16.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen transcripciones utiles.
- Conserva la interfaz de inferencia del modelo base (`GraniteSpeechForConditionalGeneration`), por lo que puede usarse para validar rutas de codigo.
- Incluye el procesador completo del modelo original, lo que permite probar el pipeline de audio a tokens sin descargar el checkpoint completo.
- Sirve para verificar contratos de integracion con frameworks (transformers y, por el nombre del fixture, vLLM).
- No dispone de capacidades reales de generacion, razonamiento, codigo, matematicas, tool calling, agentes ni vision.
- No se declaran capacidades multilingues reales, mas alla del fichero de audio de muestra copiado del modelo base.

## Casos de uso

- Pruebas de integracion continua en el proyecto `transformers-mic`: cargar el fixture para comprobar que las rutas de `GraniteSpeechForConditionalGeneration` no rompen ante cambios en transformers.
- Validacion de contratos de framework: ejecutar `integrations/transformers/usage.md` y comparar las expectativas registradas en `integrations/transformers/expectations` frente a la salida real del fixture.
- Test de compatibilidad con vLLM: el nombre del fixture sugiere que se usa para verificar la ruta de carga de pesos y el pipeline de audio en vLLM sin necesidad de GPU de gran capacidad.
- Regresion de procesadores: al copiar byte a byte los ficheros del tokenizer y del processor, permite detectar cambios inesperados en el preprocesado de audio o en la tokenizacion.
- Pruebas de dtype: el fixture es finito en float32, bfloat16 y float16, por lo que sirve para validar rutas de carga en distintas precisiones.
- Reproducibilidad de builds: `build.json` registra fuentes fijadas, resultados de la puerta de sensibilidad y hashes de ficheros, lo que permite reconstruir el artefacto con `python example/build_fixtures.py --fixture granite-4.0-1b-speech-vllm-mic`.
- Documentacion de contratos: sirve como ejemplo ejecutable de como se declara la cobertura de un checkpoint en el sistema MIC.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card indica explicitamente que es un artefacto de prueba y que los pesos son aleatorios, por lo que cualquier metrica de calidad (WER, MMLU, etc.) carece de sentido.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en bfloat16 (14,7 M de parametros equivalen a unos 30 MB de pesos, mas overhead de activaciones y del procesador de audio).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) es mas que suficiente; tambien cabe en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: transformers (referencia principal), vLLM (por el nombre del fixture y su contrato asociado). No se documentan opciones llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia seria marginal pero irrelevante para cualquier evaluacion de rendimiento real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic-temp/granite-4.0-1b-speech-vllm-mic` (este) | 14,7 M (fixture) | no disponible | Test de integracion | no disponible | Hugging Face |
| `ibm-granite/granite-4.0-1b-speech` | ~1B (segun nombre) | no disponible | ASR real | no disponible | Hugging Face |
| Otros fixtures del proyecto `transformers-mic` | variable (reducidos) | no disponible | Test de integracion | no disponible | Hugging Face |

La comparativa relevante es contra el modelo base: este fixture no sustituye a `ibm-granite/granite-4.0-1b-speech` en ningun escenario de produccion, solo comparte su interfaz y su procesador para pruebas. No se dispone de datos de benchmarks del modelo base en la informacion proporcionada.

## Limitaciones y advertencias

- Pesos aleatorios: las salidas no tienen ningun significado linguistico ni acustico; no debe usarse para transcripcion real.
- Etiquetado como `test-artifact`: el autor lo excluye explicitamente de busquedas de modelos candidatos.
- No es un modelo entrenado: no ha visto datos, no ha pasado por RLHF ni por ajuste supervisado.
- Licencia no declarada: no se puede asumir uso comercial; ademas, al derivar del modelo base de IBM, habria que consultar la licencia de `ibm-granite/granite-4.0-1b-speech`.
- Idiomas no declarados: no se puede afirmar soporte multilingue real, aunque el processor incluya un audio de muestra multilingue.
- Contexto no documentado: no se puede planificar su uso en escenarios de contexto largo.
- Riesgo de confusion: el nombre incluye "1b" pero el modelo tiene 14,7 M de parametros; cualquier evaluacion automatica basada en el nombre seria erronea.
- No apto para produccion: no debe desplegarse en atencion al cliente, pipelines de codigo, agentes ni ninguna tarea que requiera calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic-temp/granite-4.0-1b-speech-vllm-mic
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-1b-speech
- Contrato de integracion (manifest): `integration.json` en el repositorio
- Uso con transformers: `integrations/transformers/usage.md`
- Expectativas de transformers: `integrations/transformers/expectations`
- Procedencia del fixture: `build.json`
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/granite-4.0-1b-speech-vllm-mic.html
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de barrido: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
