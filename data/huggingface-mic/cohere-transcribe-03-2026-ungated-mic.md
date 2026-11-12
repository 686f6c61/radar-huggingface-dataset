# huggingface-mic/cohere-transcribe-03-2026-ungated-mic

## Resumen

`cohere-transcribe-03-2026-ungated-mic` es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic`, no un modelo utilizable en producción. Se trata de una version reducida ("slim") del checkpoint `evewashere/cohere-transcribe-03-2026-ungated`, un modelo de reconocimiento automatico del habla (ASR) de la familia Cohere Transcribe. El fixture conserva la arquitectura `CohereAsrForConditionalGeneration` pero con una configuracion drasticamente reducida: 1 capa en el decodificador y 2 capas en el encoder, lo que da un total de 2.771.264 parametros.

El proposito declarado por el autor es servir como fixture de integracion para el proyecto `transformers-mic`: un repositorio que empaqueta pesos reducidos, ejemplos de uso ejecutables y expectativas de framework en un solo lugar, de modo que las herramientas de integracion continua puedan validar el soporte de la arquitectura Cohere ASR sin descargar el checkpoint completo. Esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

Por tanto, esta ficha documenta un objeto tecnico de validacion, no un modelo de IA desplegable. Cualquier evaluacion de capacidades ASR reales debe hacerse sobre el modelo base `evewashere/cohere-transcribe-03-2026-ungated`, del que este repositorio solo copia ficheros de procesador y tokenizador byte a byte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CohereAsrForConditionalGeneration (encoder-decoder para ASR) |
| Parametros totales | 2.771.264 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; validado tambien en bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la clase `CohereAsrForConditionalGeneration`, una arquitectura encoder-decoder orientada a transcripcion de audio a texto. En este fixture la configuracion se ha reducido mediante la regla generica de `sweep.py` del repositorio `transformers-mic`: el decodificador tiene 1 capa (`num_hidden_layers: 1`) y el encoder 2 capas (`encoder num_hidden_layers: 2`). Los ficheros de procesador y tokenizador (`configuration_cohere_asr.py`, `modeling_cohere_asr.py`, `preprocessor_config.json`, `tokenizer.json`, `tokenizer.model`, entre otros) se copiaron byte a byte desde `evewashere/cohere-transcribe-03-2026-ungated`, por lo que el pipeline de preprocesado de audio y tokenizacion es identico al del modelo real.

No hay entrenamiento en sentido estricto: el fixture se sobreajusto ("overfit") al paso de entrenamiento del contrato durante 150 steps para superar la puerta de sensibilidad a la entrada. Los pesos aleatorios iniciales no la superaban: la prueba `input_features:halve` movia los logits solo 0.00065, por debajo del umbral de 0.001. Los tensores conservan los mismos nombres que el checkpoint real y el modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. No se dispone de informacion sobre datos, tokens, RLHF ni innovaciones de decodificacion del modelo base.

## Capacidades

- No es un modelo funcional: el autor lo describe explicitamente como "test artifact, not a usable model".
- Su unica funcion es validar la integracion de la arquitectura Cohere ASR en frameworks (carga de pesos, forward, loss, gradientes y sensibilidad a la entrada).
- Conserva la interfaz de procesador y tokenizador del modelo base, por lo que sirve para probar pipelines de preprocesado de audio y tokenizacion.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no evaluables en este fixture; el modelo base es de tipo ASR.

## Casos de uso

- Validacion de integracion en CI: ejecutar tests de carga y forward del modelo en pipelines de integracion continua usando un checkpoint de 2,8 M de parametros en lugar del modelo completo, reduciendo tiempo y ancho de banda.
- Pruebas de compatibilidad de framework: verificar que una version de `transformers` o de una libreria derivada carga correctamente `CohereAsrForConditionalGeneration` y respeta los nombres de tensor del checkpoint real.
- Desarrollo de herramientas de serializacion: comprobar la escritura y lectura de safetensors en float32, bfloat16 y float16 con un modelo pequeno y reproducible.
- Validacion de pipelines de audio: probar el preprocesador (`preprocessor_config.json`) y el tokenizador copiados del modelo base sin necesidad de descargar pesos grandes.
- Reproducibilidad de experimentos: el fichero `build.json` registra fuentes fijadas, resultados de las puertas y hashes de ficheros, lo que permite reconstruir el fixture con `build_fixtures.py`.
- Formacion y documentacion: servir de ejemplo didactico de como reducir un checkpoint preservando la interfaz publica y los nombres de tensores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo es la prueba de sensibilidad a la entrada: con pesos aleatorios, `input_features:halve` desplazaba los logits 0.00065 (por debajo del umbral de 0.001), lo que motivo el sobreajuste de 150 steps para superar la puerta.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en float32 para los 2,8 M de parametros; cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no aplica; cualquier GPU con soporte de PyTorch es suficiente.
- Cabe en consumer GPU: si, en cualquier modelo (GTX 1050, RTX 3050, RTX 4090, etc.) y en CPU.
- Opciones de despliegue: carga directa con `transformers` mediante `AutoModel`/`CohereAsrForConditionalGeneration`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; irrelevantes para un fixture.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables en la misma categoria. Como referencia interna, el modelo del que deriva es `evewashere/cohere-transcribe-03-2026-ungated`, del que este fixture solo difiere en tamano de configuracion (capas reducidas) y en que sus pesos son sinteticos.

## Limitaciones y advertencias

- No es un modelo utilizable: genera salidas sin valor semantico; no debe emplearse para transcripcion real.
- Etiquetado `test-artifact` para excluirlo de busquedas de modelos candidatos; su uso en produccion seria un error de seleccion.
- Los pesos estan sobreajustados a un unico paso de entrenamiento de contrato (150 steps), no a datos reales de audio.
- Licencia no disponible: no se puede asumir uso comercial ni redistribucion.
- Idiomas y contexto no disponibles.
- Riesgo de confusion con el modelo base: el nombre incluye `cohere-transcribe-03-2026`, pero el contenido no corresponde al checkpoint real.
- Sesgos y alucinacion: no evaluables en un fixture sin entrenamiento real.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/cohere-transcribe-03-2026-ungated-mic
- Modelo base: https://huggingface.co/evewashere/cohere-transcribe-03-2026-ungated
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/cohere-transcribe-03-2026-ungated-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/cohere-transcribe-03-2026-ungated-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/cohere-transcribe-03-2026-ungated-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/cohere-transcribe-03-2026-ungated-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/cohere-transcribe-03-2026-ungated-mic.html
- Repositorio `transformers-mic` (sweep.py y build_fixtures.py): https://github.com/huggingface/transformers-mic
