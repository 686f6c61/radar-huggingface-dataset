# huggingface-mic/Qwen3-ASR-0.6B-hf-mic

## Resumen

Qwen3-ASR-0.6B-hf-mic es un artefacto de prueba (fixture) publicado por el usuario huggingface-mic, derivado del modelo de reconocimiento automatico del habla Qwen/Qwen3-ASR-0.6B-hf. No se trata de un modelo funcional, sino de una version reducida ("slim") pensada para validar contratos de integracion y expectativas de frameworks (en concreto Transformers) sin necesidad de cargar los pesos completos del modelo original. El autor lo etiqueta explicitamente como `test-artifact` para excluirlo de las busquedas de modelos candidatos.

El repositorio contiene unicamente 9.877.840 parametros (frente a los aproximadamente 600 millones del modelo base), empaquetados en safetensors en bfloat16 y con un tamano total de 0,1 GB. Conserva la misma arquitectura declarada (`Qwen3ASRForConditionalGeneration`) pero con una configuracion reducida: 2 capas en el codificador de audio y 2 capas en el decodificador de texto. Los ficheros del procesador (tokenizer, chat template, generation config, processor config) se copian byte a byte del checkpoint original.

Su relevancia es instrumental: sirve para que los mantenedores de transformers-mic verifiquen que la carga, la ejecucion hacia delante, la perdida y los gradientes son finitos en float32, bfloat16 y float16, y que la sensibilidad a la entrada supera el umbral definido (0,001). Cualquier evaluacion de calidad, transcripcion o rendimiento sobre este repositorio carece de sentido, ya que los pesos no han sido entrenados para la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ASRForConditionalGeneration (encoder de audio + decoder de texto, transformer) |
| Parametros totales | 9.877.840 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; finito tambien en float32 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo replica la arquitectura del checkpoint base Qwen3-ASR-0.6B-hf, un modelo condicional de generacion para reconocimiento de voz que combina un codificador de audio con un decodificador de texto autorregresivo. En esta version reducida, la configuracion se ha encogido mediante la regla generica de `sweep.py`: `audio encoder_layers` = 2 y `text num_hidden_layers` = 2. Los nombres de tensores coinciden con los del checkpoint real, de modo que el codigo de carga e integracion puede ejercitarse sin cambios.

No ha habido entrenamiento en el sentido habitual. El autor indica que el fixture esta sobreajustado al paso de entrenamiento del contrato (70 pasos) y que los pesos aleatorios no superaban la puerta de sensibilidad a la entrada (`input_features:reverse` desplazaba los logits solo 0, con umbral 0,001). Los ficheros del procesador se copian literalmente del modelo original: `chat_template.jinja`, `generation_config.json`, `processor_config.json`, `tokenizer.json` y `tokenizer_config.json`. El build queda registrado en `build.json` con fuentes fijadas, resultados de las puertas y hashes de ficheros.

## Capacidades

- Carga y ejecucion en Transformers con la clase `Qwen3ASRForConditionalGeneration`.
- Forward, calculo de perdida y gradientes finitos en float32, bfloat16 y float16.
- Verificacion de sensibilidad a la entrada (supera el umbral de 0,001 con la entrada invertida).
- Coincidencia de nombres de tensores con el checkpoint real para pruebas de integracion.
- Procesador compatible byte a byte con el del modelo base (tokenizer, chat template, generation config).
- No ofrece transcripcion de voz utilizable, razonamiento, codigo, tool calling ni capacidades multilingues reales: es un artefacto de prueba.

## Casos de uso

- Validacion de pipelines de carga en Transformers: permite comprobar que `from_pretrained` resuelve la clase y los ficheros del procesador sin descargar los 0,6B parametros del modelo original, acelerando la CI.
- Pruebas de integracion en transformers-mic: ejecutar el contrato definido en `integration.json` y comparar con las expectativas recogidas en `integrations/transformers/expectations` para detectar regresiones en la API.
- Verificacion de dtypes: comprobar que forward, perdida y gradientes son finitos en float32, bfloat16 y float16 antes de desplegar cambios en el codigo de modelado.
- Test de sensibilidad a la entrada: usar la puerta `input_features:reverse` para asegurar que el modelo no ignora la entrada de audio en pruebas de humo.
- Desarrollo de utilidades de inspeccion de checkpoints: al mantener los nombres de tensores del modelo real, sirve para probar herramientas de analisis de pesos, conteo de parametros o conversion de formatos.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture Qwen3-ASR-0.6B-hf-mic` y comparar hashes registrados en `build.json`.
- Pruebas de empaquetado y distribucion: validar flujos de subida, descarga y cache de repositorios pequenos (0,1 GB) sin coste de ancho de banda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (9,9M parametros, ~20 MB de pesos) mas el overhead del runtime y del procesador de audio.
- GPU recomendadas: cualquier GPU con soporte de bfloat16 o float16; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer, incluida una GTX 1650 o una iGPU con suficiente memoria compartida; tambien puede ejecutarse en CPU.
- Opciones de despliegue: Transformers (referencia principal); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles; al ser un fixture sin entrenamiento, las cifras no serian representativas del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-ASR-0.6B-hf-mic (este) | 9,9M | no disponible | Fixture de pruebas | no disponible | Hugging Face |
| Qwen/Qwen3-ASR-0.6B-hf | ~0,6B (segun nombre) | no disponible | ASR real | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | variable (reducidos) | no disponible | Pruebas de contrato | no disponible | Hugging Face (org huggingface-mic) |

La comparacion con modelos ASR de produccion (Whisper, etc.) no procede: este repositorio no transcribe audio de forma utilizable.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos no estan entrenados para transcribir voz; las salidas son esencialmente ruido.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe seleccionarse para produccion.
- El autor advierte de sobreajuste al paso de entrenamiento del contrato (70 pasos) y de que los pesos aleatorios no superaban la puerta de sensibilidad.
- Licencia no disponible: no puede asumirse uso comercial sin consultar la del modelo base Qwen/Qwen3-ASR-0.6B-hf.
- Idiomas soportados no disponibles; el procesador se hereda del modelo base, pero el comportamiento linguistico no esta validado.
- Riesgo de confusion: el nombre incluye "0.6B" pero el repositorio solo contiene 9,9M parametros; verificar siempre el conteo de safetensors antes de usarlo.
- No se documentan sesgos, tasas de alucinacion ni limites de contexto porque no aplican a un fixture sin entrenamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Qwen3-ASR-0.6B-hf-mic
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B-hf
- Manifiesto del contrato: https://huggingface.co/huggingface-mic/Qwen3-ASR-0.6B-hf-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/Qwen3-ASR-0.6B-hf-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/Qwen3-ASR-0.6B-hf-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/Qwen3-ASR-0.6B-hf-mic/blob/main/build.json
- Como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Qwen3-ASR-0.6B-hf-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de barrido: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
