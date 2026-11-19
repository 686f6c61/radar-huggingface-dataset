# huggingface-mic/seamless-m4t-v2-large-mic

## Resumen

`huggingface-mic/seamless-m4t-v2-large-mic` es un artefacto de prueba (fixture) derivado de `facebook/seamless-m4t-v2-large`, el modelo multimodal de traduccion de voz de Meta AI presentado en la familia SeamlessM4T v2. No se trata de un modelo funcional entrenado, sino de una version reducida artificialmente del checkpoint original que conserva la misma arquitectura (`SeamlessM4Tv2Model`) y los mismos nombres de tensores, pero con solo 2 capas en el encoder y 2 en el decoder, lo que reduce el total a 58.995.010 parametros.

El proposito de este repositorio es servir como fixture de integracion para el framework Transformers: permite ejecutar pruebas de contrato (contract testing) sobre el pipeline de traduccion voz-a-texto sin necesidad de descargar los aproximadamente 2.300 millones de parametros del modelo real. Incluye los ficheros de procesador copiados byte a byte desde el checkpoint original, junto con manifiestos de integracion y expectativas de framework.

Es relevante unicamente en el contexto de desarrollo y CI de la libreria Transformers y de herramientas asociadas (transformers-mic). No debe emplearse para inferencia real, generacion de texto, traduccion ni ninguna tarea productiva: sus pesos son aleatorios (semilla 17) y el autor lo etiqueta explicitamente como `test-artifact`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SeamlessM4Tv2Model (encoder-decoder multimodal, variante reducida) |
| Parametros totales | 58.995.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | no disponible (procesador compatible con 38 idiomas segun el tokenizer `spm_char_lang38_tc.model` del modelo base) |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo replica la arquitectura `SeamlessM4Tv2Model` de Meta: un transformer encoder-decoder disenado para traduccion multimodal (voz y texto) con soporte para multiples tareas (ASR, traduccion voz-a-texto, voz-a-voz, texto-a-texto y texto-a-voz en el modelo completo). En esta version reducida, el encoder y el decoder cuentan con solo 2 capas cada uno, aplicando la regla generica de reduccion de `sweep.py` del repositorio transformers-mic.

No ha habido entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron mediante una puerta de sensibilidad a la entrada (input-sensitivity gate): cada perturbacion en las entradas del contrato desplaza los logits al menos 0,001 (el caso mas debil, `input_features:reverse`, produce 0,027). Los ficheros de procesador (`sentencepiece.bpe.model`, `tokenizer.model`, `spm_char_lang38_tc.model`, `preprocessor_config.json`, `generation_config.json`, entre otros) se copiaron byte a byte desde `facebook/seamless-m4t-v2-large`. Los pesos se guardaron en float32 (el dtype por defecto del checkpoint original) y se verifico su finitud en float32, bfloat16 y float16 tanto en forward como en loss y gradientes.

## Capacidades

- Ejecucion del pipeline de traduccion voz-a-texto en modo de prueba, con la misma interfaz que el modelo base.
- Validacion de contratos de integracion con Transformers (manifiesto en `integration.json` y directorio `integrations/transformers/expectations`).
- Comprobacion de compatibilidad de ficheros de procesador (tokenizers, preprocessor config, generation config) identicos a los del modelo original.
- Pruebas de forward, loss y gradientes en float32, bfloat16 y float16.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni comportamiento agentico de forma funcional: los pesos son aleatorios.
- Capacidades multilingues: el procesador heredado cubre los idiomas del tokenizer del modelo base, pero el modelo reducido no produce salidas linguisticas coherentes.

## Casos de uso

- Integracion continua en Transformers: ejecutar la suite de tests del pipeline `automatic-speech-recognition` o de traduccion voz-a-texto con un checkpoint de 59 M de parametros en lugar de los ~2.300 M del modelo real, reduciendo tiempo y coste de CI.
- Validacion de contratos de API: comprobar que las firmas de `SeamlessM4Tv2Model`, `SeamlessM4Tv2ForSpeechToText` y clases asociadas se mantienen estables entre versiones usando `integration.json` como referencia.
- Pruebas de compatibilidad de procesador: verificar que los ficheros de tokenizer y preprocessor del modelo base se cargan correctamente en el framework sin descargar el checkpoint completo.
- Desarrollo de nuevas features de framework: probar cambios en la carga de safetensors, en la gestion de dtypes (fp32, bf16, fp16) o en el guardado/carga de checkpoints con un modelo que reproduce los nombres de tensores del original.
- Regresion de serializacion: validar que el round-trip de guardado y carga preserva la estructura de pesos y la configuracion reducida.
- Benchmarking de infraestructura de test: medir el coste de arranque de pipelines y la latencia de carga en entornos de desarrollo sin GPU de gran capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios y no produce salidas evaluables en tareas de traduccion, ASR o generacion.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (59 M de parametros, ~236 MB de pesos), lo que permite ejecutarlo en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU con al menos 1 GB de VRAM es suficiente. Una RTX 4090, A100 o H100 estan sobredimensionadas para este fixture.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 2060, RTX 3060, etc.) y en CPU.
- Opciones de despliegue: Transformers (con `SeamlessM4Tv2Model` y el processor del modelo base). No se ha verificado compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y en general estos motores no soportan la arquitectura SeamlessM4T.
- Latencia y throughput: no disponibles; al ser un fixture de test, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/seamless-m4t-v2-large-mic | 58,99 M | no disponible | Fixture de test (pesos aleatorios) | no disponible | Hugging Face |
| facebook/seamless-m4t-v2-large | ~2.300 M (no confirmado en la informacion) | no disponible | Traduccion multimodal voz/texto | no disponible en la informacion | Hugging Face |
| facebook/seamless-m4t-v2-medium | no disponible | no disponible | Traduccion multimodal voz/texto | no disponible en la informacion | Hugging Face |
| facebook/seamless-m4t-v2-large (variantes) | no disponible | no disponible | Traduccion multimodal voz/texto | no disponible en la informacion | Hugging Face |

La comparativa se limita a la familia SeamlessM4T v2 porque el fixture solo es funcionalmente comparable con sus modelos de origen. Cualquier otro modelo de traduccion de voz (p. ej. Whisper para ASR) no es directamente equivalente en tareas y no se dispone de datos para comparar rendimiento.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas carecen de significado linguistico.
- Etiquetado como `test-artifact` por el autor para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- Licencia no especificada en la informacion disponible; verificar los terminos del modelo base `facebook/seamless-m4t-v2-large` antes de cualquier uso derivado.
- La configuracion reducida (2 capas de encoder y 2 de decoder) altera el comportamiento respecto al modelo original; los resultados de tests no garantizan equivalencia funcional con el checkpoint completo.
- Los ficheros de procesador se copian del modelo base, pero no se ha validado su comportamiento con los pesos reducidos mas alla de la puerta de sensibilidad a la entrada.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion o limitaciones de contexto porque el modelo no ha sido entrenado ni evaluado.
- El repositorio ocupa 0,6 GB; el proceso de reconstruccion requiere ejecutar `python example/build_fixtures.py --fixture seamless-m4t-v2-large-mic` desde el repositorio transformers-mic.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/seamless-m4t-v2-large-mic
- Modelo base: https://huggingface.co/facebook/seamless-m4t-v2-large
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/seamless-m4t-v2-large-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/seamless-m4t-v2-large-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/seamless-m4t-v2-large-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/seamless-m4t-v2-large-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/seamless-m4t-v2-large-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
