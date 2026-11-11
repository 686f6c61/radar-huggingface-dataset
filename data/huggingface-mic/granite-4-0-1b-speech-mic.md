# huggingface-mic/granite-4.0-1b-speech-mic

## Resumen

`granite-4.0-1b-speech-mic` es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic` a partir del modelo `ibm-granite/granite-4.0-1b-speech` de IBM. No es un modelo usable para inferencia real: se trata de una version "adelgazada" del checkpoint original, con la misma arquitectura y los mismos nombres de tensores, pero con una configuracion reducida (2 capas en el texto, 2 capas en el encoder y 2 capas en el proyector) y pesos inicializados aleatoriamente (semilla 17). El objetivo declarado es servir como fixture reproducible para probar integraciones de frameworks (concretamente, la pila MIC de Hugging Face) sin necesidad de descargar el modelo completo.

El repositorio incluye pesos en formato safetensors y bfloat16, el manifiesto de contrato (`integration.json`), instrucciones de uso con Transformers, un directorio de expectativas del framework y metadatos de procedencia de la construccion (`build.json`). Los ficheros del procesador (tokenizador, plantilla de chat, configuracion de preprocesado y un WAV multilingue de muestra) se han copiado byte a byte del checkpoint original de IBM, por lo que el comportamiento del pipeline de entrada es identico al del modelo real. La etiqueta `test-artifact` se aplica explicitamente para excluirlo de busquedas de modelos candidatos.

Es relevante ahora porque el ecosistema de herramientas de validacion de integraciones (MIC) necesita fixtures ligeros y deterministas que reproduzcan fielmente la interfaz del modelo de produccion. Con 14.674.716 parametros y un tamano de repositorio practicamente nulo, permite ejecutar pruebas de contrato en CI sin apenas coste de almacenamiento ni de computo. No obstante, no debe confundirse con el modelo `granite-4.0-1b-speech` original: sus pesos son aleatorios y su calidad de transcripcion es nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `GraniteSpeechForConditionalGeneration` (encoder de audio + proyector + decoder de texto tipo transformer) |
| Parametros totales | 14.674.716 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; convertibles a float32 y float16 segun la model card) |
| Idiomas soportados | no disponible (incluye un `multilingual_sample.wav` en el procesador copiado del modelo base) |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura corresponde a `GraniteSpeechForConditionalGeneration`, un modelo multimodal de voz a texto compuesto por un encoder de audio, un proyector que alinea las representaciones acusticas con el espacio del decoder y un decoder de lenguaje. En este fixture se ha aplicado la regla generica de reduccion de `sweep.py`: 2 capas en el texto, 2 capas en el encoder y 2 capas en el proyector. Los nombres de los tensores coinciden exactamente con los del checkpoint real `ibm-granite/granite-4.0-1b-speech`, de modo que cualquier codigo que cargue el modelo original funcionara con este sin cambios en la logica de carga.

No hubo entrenamiento. Los pesos se inicializaron aleatoriamente con semilla 17 y se validaron con una "input-sensitivity gate": cada perturbacion de las entradas definidas en el contrato debia mover los logits al menos 0,001; la perturbacion mas debil (`input_features:halve`) produjo un desplazamiento de 0,0205, por lo que se considero que no era necesario entrenar. El fixture es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. Los ficheros del procesador (`added_tokens.json`, `chat_template.jinja`, `merges.txt`, `multilingual_sample.wav`, `preprocessor_config.json`, `processor_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copiaron byte a byte del modelo de IBM. El proceso de construccion esta documentado en `build.json` con fuentes fijadas, resultados del gate y hashes de ficheros.

## Capacidades

- Carga y ejecucion del pipeline de `GraniteSpeechForConditionalGeneration` con la misma interfaz que el modelo base de IBM.
- Reproduccion exacta del preprocesado de audio y tokenizacion del modelo original, gracias a la copia byte a byte de los ficheros del procesador.
- Ejecucion de forward, calculo de loss y retropropagacion en float32, bfloat16 y float16.
- Validacion de contratos de integracion con frameworks mediante `integration.json` y el directorio `integrations/transformers/expectations`.
- Generacion de texto: tecnicamente posible a nivel de interfaz, pero sin ninguna calidad util, ya que los pesos son aleatorios.
- No soporta tool calling, agentes, razonamiento multistep ni capacidades multilingues reales; es un artefacto de prueba, no un modelo funcional.

## Casos de uso

- Pruebas de integracion en CI/CD: usar el fixture para verificar que la version de Transformers carga correctamente `GraniteSpeechForConditionalGeneration` y que los tensores se mapean sin errores, sin descargar el checkpoint completo de IBM.
- Desarrollo de pipelines de audio a texto: validar la plomeria (lectura de WAV, preprocesado, tokenizacion, generacion) contra un modelo de 14,7M parametros antes de pasar al modelo real, reduciendo el tiempo de iteracion.
- Regresion de contratos de framework: comparar los logits y las expectativas registradas en `integrations/transformers/expectations` para detectar rupturas de compatibilidad en nuevas versiones de la libreria.
- Pruebas de cuantizacion y dtypes: comprobar que la conversion entre float32, bfloat16 y float16 produce valores finitos en forward, loss y gradientes.
- Docencia y ejemplos reproducibles: demostrar el flujo completo de un modelo de voz a texto multimodal con un repositorio de tamano despreciable.
- Validacion de plantillas de chat y tokenizadores: al conservar la `chat_template.jinja` y el tokenizador del modelo de IBM, permite probar el formateo de conversaciones y tokens especiales sin coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en bfloat16 (14,7M parametros, aproximadamente 30 MB de pesos); en float32, unos 60 MB.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Una GPU consumer de gama baja o incluso CPU basta para las pruebas.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU con soporte de bfloat16/float16.
- Despliegue: Transformers (referencia principal del fixture), con posibilidad de exportar a otros runners segun el soporte de `GraniteSpeechForConditionalGeneration`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles; al ser un fixture no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/granite-4.0-1b-speech-mic` | 14,67M | no disponible | Fixture de prueba (pesos aleatorios) | no disponible | Hugging Face |
| `ibm-granite/granite-4.0-1b-speech` | 1B (aproximado por el nombre) | no disponible | Modelo de voz a texto real | no disponible | Hugging Face |
| Fixtures equivalentes de otros modelos | no disponible | no disponible | Artefactos de prueba | no disponible | no disponible |

La comparacion relevante es con el modelo base de IBM: comparten arquitectura, interfaz y procesador, pero difieren en escala (1B frente a 14,7M), en calidad (pesos entrenados frente a aleatorios) y en proposito (produccion frente a validacion de integraciones). No se dispone de datos de otros fixtures comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios (semilla 17) y las transcripciones o generaciones resultantes carecen de cualquier valor semantico.
- La configuracion esta truncada a 2 capas en texto, encoder y proyector, por lo que el comportamiento numerico no reproduce el del modelo de 1B.
- La licencia no esta indicada en la informacion disponible; no debe asumirse que hereda los terminos del modelo base de IBM sin verificarlo.
- La etiqueta `test-artifact` indica que debe excluirse de cualquier busqueda de modelos candidatos o de evaluaciones de calidad.
- No hay informacion sobre sesgos, idiomas soportados ni riesgos de alucinacion, ya que al no estar entrenado no aplican en el sentido habitual.
- Aunque el procesador es identico al de IBM, cualquier cambio en los ficheros del modelo base invalidaria el fixture; el campo `Fixture key f66289a81ea9` identifica el conjunto exacto de checkpoints cubiertos.
- El repositorio no incluye todos los ficheros necesarios para reconstruir el fixture completo; hay que regenerarlos con `python example/build_fixtures.py --fixture granite-4.0-1b-speech-mic`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/granite-4.0-1b-speech-mic
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-1b-speech
- Manifiesto de contrato (`integration.json`): https://huggingface.co/huggingface-mic/granite-4.0-1b-speech-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/granite-4.0-1b-speech-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/granite-4.0-1b-speech-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture (`build.json`): https://huggingface.co/huggingface-mic/granite-4.0-1b-speech-mic/blob/main/build.json
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/granite-4.0-1b-speech-mic.html
- Repositorio `transformers-mic` (script `sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Repositorio `transformers-mic` (script `build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
