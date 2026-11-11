# huggingface-mic/MOSS-Transcribe-Diarize-HF-mic

## Resumen

MOSS-Transcribe-Diarize-HF-mic es un artefacto de prueba (fixture) publicado por la organizacion huggingface-mic, no un modelo entrenado. Se trata de una version reducida del checkpoint itazap/MOSS-Transcribe-Diarize-HF, un modelo de reconocimiento de voz con diarizacion (speech-to-text con identificacion de hablantes). El fixture conserva la arquitectura MossTranscribeDiarizeForConditionalGeneration y los ficheros de procesador del modelo original, pero reduce la configuracion a 2 capas en el encoder de audio y 2 capas en el decoder de texto, resultando en 10.009.472 parametros.

El proposito del artefacto es servir como banco de pruebas reproducible para la integracion del modelo real en frameworks (concretamente Transformers), verificando contratos de entrada/salida, nombres de tensores y expectativas del procesador sin necesidad de descargar ni ejecutar el checkpoint completo. Los pesos son aleatorios (semilla 17) y no se ha realizado entrenamiento alguno; el autor lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

Por tanto, este repositorio no debe evaluarse como un modelo de produccion: no transcribe audio real ni diariza hablantes de forma util. Su relevancia es de infraestructura, ya que documenta como se construyen fixtures ligeros que cubren checkpoints completos con procesadores identicos byte a byte, una practica util para CI de librerias de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MossTranscribeDiarizeForConditionalGeneration (encoder de audio + decoder de texto, transformer) |
| Parametros totales | 10.009.472 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos guardados en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |
| Modelo base | itazap/MOSS-Transcribe-Diarize-HF |
| Tipo de artefacto | test-artifact / fixture sintetico con pesos aleatorios (semilla 17) |
| Capas (fixture) | audio: 2; texto: 2 |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

El fixture replica la clase `MossTranscribeDiarizeForConditionalGeneration`, un modelo multimodal que combina un encoder de audio con un decoder de texto para transcripcion con diarizacion. La configuracion se ha reducido mediante la regla generica de `sweep.py` del repositorio transformers-mic: 2 capas en el encoder de audio y 2 capas en el decoder de texto. Los ficheros de procesador (tokenizer, chat template, preprocessor config, modeling y processing) se copiaron byte a byte desde itazap/MOSS-Transcribe-Diarize-HF, de modo que el contrato de entrada/salida es identico al del modelo real.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron mediante un "input-sensitivity gate": cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (la mas debil, `input_features:halve`, produce 0,29). Los tensores conservan los mismos nombres que el checkpoint real y el modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. Se guardo en bfloat16, el dtype por defecto del modelo base.

## Capacidades

- No es un modelo funcional: los pesos aleatorios no producen transcripciones ni diarizacion utiles.
- Sirve como fixture de integracion para validar la carga del modelo, el procesador y la generacion condicional en Transformers.
- Verifica nombres de tensores, configuracion y expectativas del framework (directorio `integrations/transformers/expectations`).
- Comprueba el contrato de entradas de audio (`input_features`) y su sensibilidad.
- Ejecutable en float32, bfloat16 y float16 (forward, loss, gradientes).
- No dispone de tool calling, agentes, thinking mode ni capacidades multilingues verificables.

## Casos de uso

- CI de Transformers: ejecutar pruebas de humo sobre `MossTranscribeDiarizeForConditionalGeneration` sin descargar el checkpoint completo, gracias a sus 10 M de parametros y repo de 0,0 GB.
- Validacion de contratos de procesador: comprobar que `processing_moss_transcribe_diarize.py`, `preprocessor_config.json` y el tokenizer se cargan correctamente con los mismos ficheros que el modelo real.
- Pruebas de precision numerica: verificar estabilidad en float32, bfloat16 y float16 (forward, loss, gradientes) en pipelines de entrenamiento.
- Desarrollo de herramientas de fixture: servir de ejemplo reproducible de como reducir un checkpoint preservando nombres de tensores y procesador, documentado en `build.json` y `sweep.py`.
- Regresion de integraciones: detectar roturas en la API de Transformers cuando cambia el modeling del modelo base.
- Documentacion interna: ilustrar el flujo de construccion con `build_fixtures.py` para equipos que mantengan sus propios fixtures.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier metrica de calidad (WER, DER, MMLU, etc.) carece de sentido.

## Requisitos de hardware

- VRAM estimada: inferior a 100 MB en bfloat16 para los 10 M de parametros, mas el overhead del procesador y del framework.
- GPU recomendadas: cualquier GPU consumer o integrada; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en CPU.
- Opciones de despliegue: Transformers (requiere `custom_code` y `trust_remote_code`); vLLM, llama.cpp, Ollama y TGI no estan indicados en la informacion disponible.
- Latencia y throughput: no disponibles; sin valor representativo al no ser un modelo entrenado.

## Comparativa con modelos similares

| Modelo | Parametros | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|
| huggingface-mic/MOSS-Transcribe-Diarize-HF-mic | 10.009.472 | Fixture de test (pesos aleatorios) | no disponible | Hugging Face |
| itazap/MOSS-Transcribe-Diarize-HF | no disponible | Speech-to-text con diarizacion (modelo real) | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | variable | Pruebas de integracion | no disponible | Hugging Face |

No se dispone de datos de rendimiento para comparar cualitativamente con alternativas de la misma tarea.

## Limitaciones y advertencias

- Pesos aleatorios: no genera transcripciones ni diarizacion correctas; su uso en produccion produciria salidas sin sentido.
- Etiquetado como `test-artifact`: excluido deliberadamente de busquedas de modelos candidatos.
- Licencia no disponible: no puede asumirse uso comercial.
- Requiere `custom_code` y, previsiblemente, `trust_remote_code=True` al cargar en Transformers.
- El fixture solo cubre checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el shrink (clave `086fd2c47f24`); no representa variantes con procesador distinto.
- No hay informacion sobre sesgos, idiomas ni contexto, al no existir entrenamiento.
- El repositorio no incluye todos los ficheros de integracion: deben regenerarse con `python example/build_fixtures.py --fixture MOSS-Transcribe-Diarize-HF-mic`.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/MOSS-Transcribe-Diarize-HF-mic
- Modelo base: https://huggingface.co/itazap/MOSS-Transcribe-Diarize-HF
- Manifiesto de contrato: integration.json (en el repo)
- Uso en Transformers: integrations/transformers/usage.md (en el repo)
- Expectativas de Transformers: integrations/transformers/expectations (en el repo)
- Procedencia del fixture: build.json (en el repo)
- Explicacion del shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/MOSS-Transcribe-Diarize-HF-mic.html
- Script de barrido: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
