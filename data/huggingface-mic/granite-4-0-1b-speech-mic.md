# huggingface-mic/granite-4.0-1b-speech-mic

## Resumen

`granite-4.0-1b-speech-mic` es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic`, no un modelo entrenado ni utilizable para inferencia real. Se construye como una version reducida del modelo `ibm-granite/granite-4.0-1b-speech` de IBM, conservando la misma arquitectura (`GraniteSpeechForConditionalGeneration`) pero con una configuracion drasticamente menor y pesos aleatorios. Su proposito es servir como fixture de integracion para validar contratos de uso y expectativas de frameworks (concretamente Transformers) sin necesidad de descargar ni ejecutar el checkpoint completo.

El repositorio contiene pesos "slim" (14.674.716 parametros, segun los safetensors), el manifiesto de contrato (`integration.json`), documentacion de uso en Transformers y el registro de construccion (`build.json`). El modelo esta etiquetado explicitamente como `test-artifact`, lo que lo excluye de busquedas de modelos candidatos. No dispone de model card funcional con especificaciones de entrenamiento, licencia, idiomas ni benchmarks.

Es relevante unicamente en el contexto de ingenieria de software: permite a los mantenedores de Transformers y de otros frameworks comprobar que la carga, el preprocesado y la ejecucion forward del modelo de voz de Granite funcionan correctamente con un coste minimo de almacenamiento y computo. No debe confundirse con el modelo real `ibm-granite/granite-4.0-1b-speech`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `GraniteSpeechForConditionalGeneration` (encoder de audio + proyector + decoder de texto) |
| Parametros totales | 14.674.716 (fixture reducido) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del checkpoint original `ibm-granite/granite-4.0-1b-speech`, pero con la configuracion reducida mediante la regla generica de `sweep.py`: 2 capas en el decoder de texto, 2 capas en el encoder de audio y 2 capas en el proyector. Los ficheros del procesador (`tokenizer.json`, `vocab.json`, `merges.txt`, `preprocessor_config.json`, `chat_template.jinja`, `multilingual_sample.wav`, etc.) se copian byte a byte desde el modelo de IBM, de modo que el preprocesado y la tokenizacion son identicos a los del modelo real.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y unicamente pasaron una compuerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato mueve los logits al menos 0.001 (el caso mas debil, `input_features:halve`, produce 0.0205). Los tensores conservan los mismos nombres que el checkpoint real y los pesos son finitos en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La construccion la realiza `build_fixtures.py` y queda registrada, con hashes de ficheros y fuentes fijadas, en `build.json`.

## Capacidades

- Carga y ejecucion forward de la arquitectura `GraniteSpeechForConditionalGeneration` en Transformers.
- Validacion de contratos de integracion (manifiesto `integration.json`) y de las expectativas del framework.
- Comprobacion de preprocesado de audio y tokenizacion con los mismos ficheros de procesador que el modelo real.
- Verificacion de estabilidad numerica en float32, bfloat16 y float16.
- No realiza transcripcion de voz real: los pesos son aleatorios y no generan salidas significativas.
- No soporta tool calling, agentes, razonamiento ni capacidades multilingues funcionales.

## Casos de uso

- Pruebas de integracion en Transformers: verificar que la clase `GraniteSpeechForConditionalGeneration` carga el checkpoint, aplica el procesador y ejecuta el forward sin errores, con un coste de descarga minimo.
- CI/CD de librerias de inferencia: incluir el fixture en pipelines de integracion continua para detectar regresiones en la carga de pesos, nombres de tensores o configuracion del modelo.
- Desarrollo de contratos de framework: validar que las expectativas documentadas en `integrations/transformers/expectations` se cumplen tras cambios en la libreria.
- Pruebas de sensibilidad a la entrada: comprobar que perturbaciones en `input_features` alteran los logits por encima del umbral definido (0.001), como base para tests de robustez.
- Reproduccion de builds: regenerar el fixture con `python example/build_fixtures.py --fixture granite-4.0-1b-speech-mic` y comparar hashes contra `build.json` para auditar procedencia.
- Validacion de precisiones: ejecutar forward, loss y gradientes en float32, bfloat16 y float16 para asegurar que no aparecen valores no finitos en entornos de integracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad (WER, MMLU, etc.) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con 14,7 M de parametros en bfloat16 (unos 29 MB de pesos).
- GPU recomendadas: cualquier GPU consumer moderna; tambien ejecutable en CPU.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (uso previsto segun la documentacion del repositorio); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture no se caracteriza rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/granite-4.0-1b-speech-mic` (este) | 14,7 M | no disponible | Fixture de integracion | no disponible | Hugging Face |
| `ibm-granite/granite-4.0-1b-speech` | no disponible en la informacion | no disponible | Reconocimiento de voz (ASR) | no disponible | Hugging Face |
| Otros fixtures `*-mic` de `huggingface-mic` | variable | no disponible | Fixtures de integracion | no disponible | Hugging Face |

La comparativa relevante es con el modelo base de IBM, del que este fixture hereda arquitectura, procesador y nombres de tensores, pero no pesos utiles ni capacidades funcionales.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y las salidas no tienen significado.
- Etiquetado como `test-artifact`; excluido deliberadamente de busquedas de modelos candidatos.
- La configuracion esta reducida (2 capas por modulo), por lo que no representa el comportamiento numerico del checkpoint completo.
- No dispone de licencia declarada en la informacion disponible; no debe asumirse uso comercial.
- No hay datos de sesgos, alucinacion, idiomas ni contexto porque no aplica a un fixture.
- No debe desplegarse en produccion ni presentarse como sustituto de `ibm-granite/granite-4.0-1b-speech`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/granite-4.0-1b-speech-mic
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-1b-speech
- Documentacion de uso en Transformers: `integrations/transformers/usage.md` (dentro del repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (dentro del repositorio)
- Manifiesto de contrato: `integration.json` (dentro del repositorio)
- Procedencia del fixture: `build.json` (dentro del repositorio)
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/granite-4.0-1b-speech-mic.html
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
