# huggingface-mic/mms-tts-eng-mic

## Resumen

`mms-tts-eng-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic` en Hugging Face. No se trata de un modelo funcional de sintesis de voz, sino de una version reducida y con pesos aleatorios del modelo `facebook/mms-tts-eng` de Meta, pensada para validar contratos de integracion y expectativas de frameworks (en concreto, Transformers). El autor lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

El modelo conserva la arquitectura `VitsModel` del original, pero reduce el numero de capas ocultas a 2 y sustituye los pesos entrenados por pesos aleatorios generados con semilla 17. Aun asi, mantiene los mismos nombres de tensores que el checkpoint real y copia byte a byte los ficheros del procesador (`special_tokens_map.json`, `tokenizer_config.json`, `vocab.json`) de `facebook/mms-tts-eng`.

Su relevancia es puramente de ingenieria: sirve como fixture reproducible para probar pipelines de carga, inferencia y validacion de integraciones sin necesidad de descargar el modelo completo. Con 15,6 millones de parametros y un repositorio de 0,1 GB, es un recurso ligero para CI y tests automatizados, no para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (VitsModel), transformer reducido a 2 capas ocultas |
| Parametros totales | 15.610.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32; compatible con bfloat16 y float16) |
| Idiomas soportados | no disponible (el modelo base es `facebook/mms-tts-eng`, orientado a ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un modelo generativo de sintesis de voz texto-a-habla que combina un encoder de texto, un prior variacional y un decodificador acustico con discriminadores adversariales en su entrenamiento original. En esta fixture, la configuracion se ha reducido mediante la regla generica de `sweep.py` del repositorio `transformers-mic`, fijando `num_hidden_layers` a 2.

No hubo entrenamiento real: los pesos son aleatorios (semilla 17) y se generaron tras superar una puerta de sensibilidad a la entrada, en la que cada perturbacion de las entradas del contrato movia los logits al menos 0,001. Los pesos se guardan en float32, el dtype por defecto de `facebook/mms-tts-eng`, y se verifica que son finitos en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. Los ficheros del procesador se copiaron byte a byte del modelo base, y los nombres de tensores coinciden con el checkpoint real.

## Capacidades

- Generacion de texto a voz: al conservar la arquitectura VITS y el procesador del modelo base, la fixture reproduce el contrato de entrada/salida de un TTS.
- Validacion de integraciones: permite comprobar la carga del modelo, el procesamiento de texto y la forma de las salidas en frameworks como Transformers.
- Pruebas de sensibilidad a la entrada: los pesos aleatorios garantizan que perturbaciones en las entradas produzcan cambios medibles en los logits.
- Compatibilidad de dtypes: ejecutable en float32, bfloat16 y float16 sin valores no finitos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues reales.
- No produce audio inteligible: los pesos aleatorios no generan habla coherente.

## Casos de uso

- Tests de integracion en CI: usar la fixture para verificar que el pipeline de carga de `VitsModel` y su procesador funciona sin descargar el checkpoint completo de `facebook/mms-tts-eng`.
- Validacion de contratos de framework: comprobar que las expectativas declaradas en `integrations/transformers/expectations` se cumplen con un modelo del mismo tipo y nombres de tensores.
- Pruebas de compatibilidad de dtypes: ejecutar forward, loss y gradientes en float32, bfloat16 y float16 para detectar problemas de precision o NaNs en pipelines de entrenamiento.
- Verificacion de sensibilidad a la entrada: validar que perturbaciones en `input_ids` u otras entradas del contrato producen cambios en los logits por encima del umbral de 0,001.
- Desarrollo de herramientas de inspeccion de modelos: probar scripts que analizan configuracion, nombres de tensores y ficheros del procesador sin coste de descarga.
- Reproduccion de fixtures: reconstruir el artefacto con `build_fixtures.py` para auditar hashes y fuentes fijadas en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, no tiene sentido evaluar su calidad de sintesis ni su rendimiento en tareas de TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (15,6 M de parametros, ~62 MB de pesos); aun menos en float16 o bfloat16.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer, incluida una GTX 1650 o integradas con soporte CUDA; tambien en CPU.
- Opciones de despliegue: Transformers (carga directa de `VitsModel`), y potencialmente otros runners compatibles con safetensors; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al ser una fixture de 2 capas, la latencia seria muy baja pero sin valor representativo del modelo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| `mms-tts-eng-mic` (esta ficha) | 15,6 M | no disponible | no disponible | Fixture de prueba, pesos aleatorios |
| `facebook/mms-tts-eng` | no disponible en la informacion | no disponible | no disponible | TTS real en ingles (modelo base) |
| Otras fixtures `*-mic` de `huggingface-mic` | variable | no disponible | no disponible | Artefactos de prueba para contratos de integracion |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y no generan habla inteligible.
- Etiquetado como `test-artifact`: no debe usarse en produccion ni presentarse como modelo de TTS.
- Licencia no disponible: no se puede confirmar si permite uso comercial; al derivar de `facebook/mms-tts-eng`, habria que consultar la licencia del modelo base.
- Idiomas no disponibles: aunque el modelo base esta orientado al ingles, la fixture no declara idiomas soportados.
- Riesgo de confusion: puede aparecer en busquedas si no se filtra por la etiqueta `test-artifact`.
- Sin garantias de calidad: al no haber entrenamiento, no hay metricas de fidelidad, naturalidad ni inteligibilidad.
- Contexto y cuantizacion no documentados: no se especifican limites de longitud de entrada ni formatos cuantizados soportados.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/mms-tts-eng-mic
- Modelo base: https://huggingface.co/facebook/mms-tts-eng
- Contrato de integracion: https://huggingface.co/huggingface-mic/mms-tts-eng-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/mms-tts-eng-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/mms-tts-eng-mic/tree/main/integrations/transformers/expectations
- Procedencia de la fixture: https://huggingface.co/huggingface-mic/mms-tts-eng-mic/blob/main/build.json
- Como se redujo la fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/mms-tts-eng-mic.html
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
