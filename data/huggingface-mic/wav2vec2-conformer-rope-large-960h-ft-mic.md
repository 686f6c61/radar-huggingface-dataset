# huggingface-mic/wav2vec2-conformer-rope-large-960h-ft-mic

## Resumen

`wav2vec2-conformer-rope-large-960h-ft-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic`, no un modelo entrenado utilizable. Se deriva de `facebook/wav2vec2-conformer-rope-large-960h-ft`, un modelo de reconocimiento automatico del habla (ASR) basado en la arquitectura Wav2Vec2-Conformer con CTC, pero ha sido reducido a 4,4 millones de parametros mediante una regla generica de reduccion de capas (`num_hidden_layers = 2`) y sus pesos son aleatorios (semilla 17).

El proposito del repositorio es servir como contrato ejecutable para probar la integracion del framework Transformers con este tipo de modelos: incluye pesos reducidos, manifiesto de integracion, expectativas del framework y ficheros de procesador copiados byte a byte del checkpoint original. Esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

Por tanto, no debe emplearse para transcripcion real ni para ninguna tarea de produccion: su relevancia es exclusivamente como herramienta de validacion de infraestructura y CI en el ecosistema Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2-Conformer para CTC (`Wav2Vec2ConformerForCTC`) |
| Parametros totales | 4.409.192 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32; verificado finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Wav2Vec2-Conformer con cabecera CTC para reconocimiento de voz, la misma familia que el checkpoint original `facebook/wav2vec2-conformer-rope-large-960h-ft`. Sin embargo, este repositorio no contiene un modelo entrenado: es un *slim fixture* generado por `build_fixtures.py` aplicando la regla generica de `sweep.py`, que reduce el numero de capas ocultas a 2 y conserva los mismos nombres de tensores que el checkpoint real.

Los pesos son aleatorios (semilla 17) y superaron una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movio los logits al menos 0,001 (la mas debil, `input_values:halve`, 0,198), por lo que no fue necesario entrenamiento. Los ficheros de procesador (`preprocessor_config.json`, `special_tokens_map.json`, `tokenizer_config.json`, `vocab.json`) se copiaron byte a byte del modelo original de Facebook. Los detalles de construccion, hashes y resultados de las puertas se registran en `build.json`.

## Capacidades

- Ejecucion del pipeline `Wav2Vec2ConformerForCTC` en Transformers con la misma interfaz que el checkpoint original (entrada de audio, salida de logits CTC).
- Validacion de contratos de integracion: manifiesto `integration.json`, directorio de expectativas y documentacion de uso.
- Verificacion de estabilidad numerica en float32, bfloat16 y float16 (forward, loss y gradientes finitos).
- Comprobacion de nombres de tensores y estructura de configuracion identicos al modelo de referencia.
- No realiza reconocimiento de voz real: los pesos son aleatorios y el modelo esta reducido a 2 capas.
- No soporta tool calling, agentes, vision ni audio mas alla del contrato de prueba.

## Casos de uso

- Pruebas de integracion en CI: validar que una version de Transformers carga, ejecuta y produce gradientes finitos con un `Wav2Vec2ConformerForCTC` sin descargar el checkpoint completo de Facebook (cientos de millones de parametros).
- Desarrollo de *fixtures* reproducibles: usar el repositorio como plantilla para generar artefactos de prueba de otros modelos ASR con la misma regla de reduccion.
- Validacion de contratos de framework: comprobar que los ficheros de procesador, tokenizer y configuracion se cargan correctamente en distintas versiones de la libreria.
- Pruebas de precision mixta: verificar que el pipeline funciona en float32, bfloat16 y float16 sin NaNs ni infinitos.
- Regresion de infraestructura de inferencia: probar rutas de carga de safetensors y nombres de tensores antes de desplegar el modelo real.
- Documentacion de expectativas: usar los ficheros de `integrations/transformers/expectations` como referencia de comportamiento esperado en tests automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (WER, MMLU, etc.) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (4,4 M de parametros); el modelo cabe en cualquier GPU consumer.
- GPU recomendadas: no aplica para uso real; cualquier GPU (incluso integrada) o CPU es suficiente para ejecutar el fixture.
- Cabe en GPU consumer: si, en todas las RTX y en GPUs integradas.
- Opciones de despliegue: Transformers (referencia), y en teoria llama.cpp/Ollama no aplican por ser un modelo de audio; vLLM y TGI no estan documentados para este artefacto.
- Latencia y throughput: no disponibles; irrelevantes al no ser un modelo funcional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/wav2vec2-conformer-rope-large-960h-ft-mic` (este) | 4,4 M (fixture) | no disponible | no disponible (pesos aleatorios) | no disponible | Hugging Face |
| `facebook/wav2vec2-conformer-rope-large-960h-ft` | no disponible en la informacion | no disponible | no disponible | no disponible | Hugging Face |
| Otros fixtures de `huggingface-mic` | variable | no disponible | no disponible | no disponible | Hugging Face |

La comparacion con alternativas reales de ASR (por ejemplo, Whisper) no se puede realizar con los datos proporcionados.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y el modelo esta reducido a 2 capas; las transcripciones serian ruido.
- Etiquetado como `test-artifact`: no debe aparecer en busquedas de modelos candidatos ni usarse en produccion.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Idiomas soportados no disponibles.
- Sesgos y alucinacion: no evaluables, al no existir un modelo entrenado.
- El contrato de prueba solo cubre la interfaz de `Wav2Vec2ConformerForCTC`; no valida calidad de reconocimiento.
- Cualquier integracion en produccion debe sustituirse por el checkpoint original de Facebook.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/wav2vec2-conformer-rope-large-960h-ft-mic
- Modelo base: https://huggingface.co/facebook/wav2vec2-conformer-rope-large-960h-ft
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/wav2vec2-conformer-rope-large-960h-ft-mic.html
- Script `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
