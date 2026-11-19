# huggingface-mic/tibetan-ocr-mic

## Resumen

`huggingface-mic/tibetan-ocr-mic` no es un modelo utilizable, sino un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic` para validar integraciones de frameworks sobre el modelo real `BDRC/tibetan-ocr`, un sistema de OCR para tibetano basado en PaddleOCR-VL. El repositorio contiene pesos "slim" de 535.680 parametros (aproximadamente 0,5 M), generados con pesos aleatorios (semilla 17) y una configuracion reducida del modelo original: 2 capas en el text decoder y 2 capas en el vision encoder, manteniendo la clase `PaddleOCRVLForConditionalGeneration`.

Su proposito es servir como contrato ejecutable: incluye el manifiesto de integracion, ejemplos de uso con Transformers, las expectativas del framework y la procedencia de la fixture, de modo que los mantenedores puedan comprobar que una implementacion carga, ejecuta y propaga gradientes correctamente sin descargar el checkpoint completo. Esta etiquetado explicitamente como `test-artifact` para excluirlo de las busquedas de modelos candidatos.

Por tanto, no debe emplearse para inferencia real, evaluacion de calidad ni produccion: los pesos son aleatorios y el modelo no ha sido entrenado. Su relevancia es de ingenieria de software (verificacion de pipelines de carga y compatibilidad), no de capacidades de OCR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PaddleOCR-VL (`PaddleOCRVLForConditionalGeneration`), vision encoder + text decoder, configuracion reducida (2 capas de texto, 2 capas de vision) |
| Parametros totales | 535.680 (aproximadamente 0,5 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; se declara finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible (el modelo base esta orientado a OCR de tibetano) |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El artefacto replica la arquitectura del modelo base `BDRC/tibetan-ocr`, un PaddleOCR-VL con clase `PaddleOCRVLForConditionalGeneration`, pero con una configuracion encogida mediante la regla generica de `sweep.py`: 2 capas en el decodificador de texto y 2 capas en el codificador de vision. Los nombres de tensores coinciden con los del checkpoint real, de modo que el codigo de carga y las rutas de ejecucion son identicas a las del modelo completo.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se aceptaron porque superaron la puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplazo los logits al menos 0,001 (el caso mas debil, `pixel_values:halve`, produjo 0,164). Los ficheros de procesador (`chat_template.jinja`, `dry_logits_processor.py`, `generation_config.json`, `processor_config.json`, `tokenizer.json`, `tokenizer.model`, `tokenizer_config.json`) se copiaron byte a byte desde `BDRC/tibetan-ocr`. La fixture se genero con `build_fixtures.py` y su procedencia (fuentes fijadas, resultados de las puertas y hashes) queda registrada en `build.json`.

## Capacidades

- Carga y ejecucion del grafo `PaddleOCRVLForConditionalGeneration` con nombres de tensores identicos al checkpoint real.
- Verificacion de propagacion de gradientes y calculo de perdida en float32, bfloat16 y float16 (forward, loss y gradients finitos).
- Validacion de contratos de entrada/salida definidos en `integration.json` y en `integrations/transformers/expectations`.
- Comprobacion de sensibilidad a perturbaciones de entrada (incluida la ruta de `pixel_values`).
- Ejecucion reproducible de ejemplos de uso con Transformers documentados en `integrations/transformers/usage.md`.
- No dispone de capacidades reales de OCR, generacion de texto, tool calling, agentes ni multilingues: los pesos son aleatorios.

## Casos de uso

- Pruebas de integracion en CI: ejecutar el fixture en la suite de tests de Transformers para verificar que la clase `PaddleOCRVLForConditionalGeneration` carga y produce logits sin descargar el checkpoint completo.
- Desarrollo de kernels y optimizaciones: validar cambios en atencion, capas de vision o decodificacion sobre un modelo de 0,5 M de parametros antes de probarlos con `BDRC/tibetan-ocr`.
- Verificacion de contratos de framework: comprobar que las expectativas declaradas en `integrations/transformers/expectations` se cumplen (formas de tensores, dtypes, nombres de parametros).
- Pruebas de precision numerica: confirmar comportamiento finito en float32, bfloat16 y float16 en forward, loss y retropropagacion.
- Reproducibilidad de artefactos: reconstruir la fixture con `python example/build_fixtures.py --fixture tibetan-ocr-mic` y comparar hashes registrados en `build.json`.
- Deteccion de regresiones en el procesador: al copiar byte a byte los ficheros de tokenizer y processor del modelo real, sirve para comprobar que cambios en el pipeline de preprocesado no rompen la carga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cualquier precision; el checkpoint ocupa aproximadamente 0,0 GB (pesos de 0,5 M de parametros en bfloat16).
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU para pruebas de integracion. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es mas que suficiente.
- Cabe en cualquier GPU consumer y en entornos sin acelerador.
- Opciones de despliegue: Transformers (ruta documentada en `integrations/transformers/usage.md`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un artefacto de prueba con pesos aleatorios, las cifras no serian representativas del modelo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/tibetan-ocr-mic` | 535.680 | no disponible | Fixture de test para integracion | no disponible | Hugging Face |
| `BDRC/tibetan-ocr` | no disponible | no disponible | OCR de tibetano (PaddleOCR-VL) | no disponible | Hugging Face |
| PaddleOCR-VL (modelo base de la familia) | no disponible | no disponible | OCR y comprension de documentos | no disponible | no disponible en la informacion |

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y no han sido entrenados; cualquier salida es ruido.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe promocionarse a produccion.
- La configuracion esta reducida a 2 capas de texto y 2 de vision, por lo que el comportamiento numerico no reproduce el del checkpoint completo.
- No se declaran licencia, idiomas ni pipeline en la informacion disponible; verificar la licencia del modelo base `BDRC/tibetan-ocr` antes de cualquier uso derivado.
- Riesgo de confusion: el nombre puede llevar a pensar que se trata de un OCR de tibetano funcional; no lo es.
- No hay datos de sesgos, alucinacion ni rendimiento porque no se ha realizado entrenamiento ni evaluacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/tibetan-ocr-mic
- Modelo base: https://huggingface.co/BDRC/tibetan-ocr
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/tibetan-ocr-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/tibetan-ocr-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/tibetan-ocr-mic/tree/main/integrations/transformers/expectations
- Procedencia de la fixture: https://huggingface.co/huggingface-mic/tibetan-ocr-mic/blob/main/build.json
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/tibetan-ocr-mic.html
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
