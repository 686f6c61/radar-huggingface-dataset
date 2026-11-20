# huggingface-mic/MOSS-Transcribe-Diarize-HF-mic

## Resumen

MOSS-Transcribe-Diarize-HF-mic es un artefacto de prueba (fixture) publicado por la organizacion huggingface-mic, no un modelo utilizable. Se trata de una version reducida del modelo `itazap/MOSS-Transcribe-Diarize-HF`, orientada a validar la integracion del modelo original con la libreria Transformers y con el contrato de expectativas de la infraestructura de tests de Hugging Face. El repositorio combina pesos "slim" (10.009.472 parametros), ejemplos de uso ejecutables y el directorio de expectativas del framework en un unico paquete.

El modelo base es un sistema de reconocimiento de voz con diarizacion (speech-to-text con separacion de hablantes), implementado mediante la clase `MossTranscribeDiarizeForConditionalGeneration`, que combina un codificador de audio y un decodificador de texto en un esquema condicional de generacion. La fixture conserva la misma arquitectura y los mismos nombres de tensores que el checkpoint real, pero reduce la configuracion a 2 capas de audio y 2 capas de texto, y sustituye los pesos por valores aleatorios generados con semilla 17.

Su relevancia es puramente de ingenieria: permite a los mantenedores de Transformers verificar que el codigo de carga, procesamiento y generacion funciona correctamente con este modelo sin necesidad de descargar ni ejecutar los pesos completos. Esta etiquetado explicitamente como `test-artifact` para excluirlo de las busquedas de modelos candidatos a produccion. No debe emplearse para inferencia real ni para evaluacion de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `MossTranscribeDiarizeForConditionalGeneration` (codificador de audio + decodificador de texto, generacion condicional) |
| Parametros totales | 10.009.472 (pesos reducidos de la fixture) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (guardado en bfloat16) |

## Arquitectura y entrenamiento

La fixture replica la arquitectura del modelo base `itazap/MOSS-Transcribe-Diarize-HF`, una clase de generacion condicional para transcripcion de voz con diarizacion. La configuracion se ha reducido mediante la regla generica de `sweep.py` del repositorio `huggingface/transformers-mic`, dejando 2 capas ocultas en el modulo de audio y 2 capas ocultas en el modulo de texto. Los ficheros del procesador (`tokenizer.json`, `vocab.json`, `merges.txt`, `chat_template.jinja`, `preprocessor_config.json`, `configuration_moss_transcribe_diarize.py`, `modeling_moss_transcribe_diarize.py`, entre otros) se copiaron byte a byte desde el checkpoint original, de modo que el pipeline de preprocesado y tokenizacion es identico al real.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron con una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplaza los logits al menos 0.001 (la mas debil, `input_features:halve`, produce 0.29), lo que garantiza que el grafo computacional responde a los cambios en la entrada. Los tensores conservan los mismos nombres que el checkpoint original y la fixture es finita en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El guardado se realiza en bfloat16, que es el dtype por defecto del modelo base.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen transcripciones ni diarizaciones utiles.
- Sirve como fixture de integracion para validar la carga del modelo, el preprocesado de audio y la generacion condicional en Transformers.
- Permite comprobar el contrato de expectativas del framework (`integrations/transformers/expectations`) sin descargar el checkpoint completo.
- Conserva el tokenizador, el chat template y el procesador del modelo base, por lo que valida el pipeline de texto y audio asociado.
- No dispone de soporte verificado de tool calling, agentes, vision ni audio mas alla del propio pipeline de transcripcion heredado del modelo base.
- Capacidades multilingues: no disponible.

## Casos de uso

- Pruebas de integracion en Transformers: ejecutar la carga del modelo y una generacion de prueba para verificar que `MossTranscribeDiarizeForConditionalGeneration` no rompe en futuras versiones de la libreria.
- Validacion de CI en el repositorio `transformers-mic`: usar la fixture como caso de prueba ligero que cubre los ficheros de procesador y la configuracion del modelo real.
- Desarrollo de codigo de preprocesado de audio: probar el pipeline de `preprocessor_config.json` y `processor_config.json` sin necesidad de pesos reales.
- Depuracion de formas y dtypes de tensores: al conservar los nombres de tensores del checkpoint original, permite inspeccionar shapes y verificar conversiones float32/bfloat16/float16.
- Verificacion de contratos de framework: comprobar que las expectativas declaradas en `integrations/transformers/expectations` se cumplen con la configuracion reducida.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture MOSS-Transcribe-Diarize-HF-mic` y comparar hashes registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los 10,0 M de parametros de la fixture en bfloat16 (aproximadamente 20 MB de pesos); el resto del consumo depende del runtime.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; tambien es viable en CPU.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (el repositorio incluye `custom_code`); no se ha verificado compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al tratarse de una fixture de test, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/MOSS-Transcribe-Diarize-HF-mic | 10.009.472 | no disponible | Fixture de test | no disponible | Hugging Face |
| itazap/MOSS-Transcribe-Diarize-HF | no disponible | no disponible | Speech-to-text con diarizacion | no disponible | Hugging Face (modelo base) |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Los pesos son aleatorios (semilla 17): las salidas no tienen ningun valor semantico y no deben interpretarse como transcripciones.
- Esta etiquetado como `test-artifact`; no es apto para produccion ni para evaluacion de calidad.
- La configuracion esta reducida a 2 capas de audio y 2 de texto, por lo que no representa el comportamiento del modelo base completo.
- Licencia no disponible: no se puede confirmar el regimen de uso comercial.
- Idiomas soportados no disponibles.
- Riesgo de confusion: el nombre incluye "MOSS-Transcribe-Diarize", pero el artefacto no transcribe ni diariza.
- El repositorio ocupa 0.0 GB y requiere `custom_code`; la carga exige `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio.
- No se han publicado sesgos, limites de contexto ni advertencias adicionales en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/MOSS-Transcribe-Diarize-HF-mic
- Modelo base: https://huggingface.co/itazap/MOSS-Transcribe-Diarize-HF
- Como se redujo la fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/MOSS-Transcribe-Diarize-HF-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de barrido: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
