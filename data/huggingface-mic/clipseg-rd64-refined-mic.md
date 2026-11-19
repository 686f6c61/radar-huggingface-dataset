# huggingface-mic/clipseg-rd64-refined-mic

## Resumen

`clipseg-rd64-refined-mic` es un artefacto de prueba (test artifact) publicado por el usuario `huggingface-mic` en Hugging Face. No se trata de un modelo entrenado ni utilizable para inferencia real, sino de una version reducida ("slim fixture") del modelo `CIDAS/clipseg-rd64-refined`, pensada para validar contratos de integracion y expectativas de frameworks (concretamente Transformers) sin necesidad de descargar ni ejecutar los pesos completos del modelo original.

El modelo conserva la arquitectura `CLIPSegForImageSegmentation` (segmentacion de imagenes guiada por texto) pero con una configuracion drasticamente reducida: 2 capas ocultas en el codificador de texto y 2 en el de vision, lo que da un total de 4.297.633 parametros. Los pesos son aleatorios (semilla 17), generados para superar una puerta de sensibilidad a la entrada, no fruto de entrenamiento alguno.

Su relevancia es puramente de ingenieria: sirve como fixture reproducible para probar pipelines de integracion, verificacion de nombres de tensores, dtypes y comportamiento del framework ante el modelo real. La model card lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos. No debe confundirse con un modelo funcional de segmentacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIPSegForImageSegmentation (transformer multimodal texto-vision) |
| Parametros totales | 4.297.633 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32; verificado finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | CIDAS/clipseg-rd64-refined |
| Configuracion reducida | text num_hidden_layers = 2, vision num_hidden_layers = 2 |
| Semilla de pesos | 17 (pesos aleatorios) |
| Dtype de guardado | float32 |
| Fixture key | 4a8e469eb075 |

## Arquitectura y entrenamiento

La arquitectura subyacente es CLIPSeg, un transformer multimodal que combina un codificador de texto y un codificador de vision para producir mascaras de segmentacion a partir de una imagen y una consulta textual. En esta version "slim", la configuracion se ha reducido mediante la regla generica de `sweep.py` del repositorio `transformers-mic`, dejando 2 capas ocultas tanto en el codificador de texto como en el de vision. Los ficheros de procesador (`merges.txt`, `preprocessor_config.json`, `special_tokens_map.json`, `tokenizer_config.json`, `vocab.json`) se copian byte a byte desde `CIDAS/clipseg-rd64-refined`.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron mediante una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movia los logits al menos 0.001 (la mas debil, `pixel_values:roll_batch`, con 8.6). Los nombres de tensores coinciden exactamente con los del checkpoint real, y el modelo es finito en float32, bfloat16 y float16 (forward, loss y gradientes). Se construyo con `build_fixtures.py`, y `build.json` registra las fuentes fijadas, los resultados de la puerta y los hashes de ficheros.

## Capacidades

- No es un modelo funcional: no genera texto, no razona, no produce segmentaciones utiles.
- Sirve como fixture de integracion para validar el contrato de `CLIPSegForImageSegmentation` en Transformers.
- Verifica nombres y formas de tensores contra el checkpoint real `CIDAS/clipseg-rd64-refined`.
- Permite probar la carga del modelo en float32, bfloat16 y float16 sin errores de finitud.
- Reproduce el pipeline de procesamiento (tokenizer y preprocesador de imagen) del modelo original byte a byte.
- Util para tests de CI que necesiten un checkpoint ligero con la misma interfaz que el modelo real.
- No soporta tool calling, agentes, vision funcional ni capacidades multilingues reales.

## Casos de uso

- Pruebas de integracion en CI: usar el fixture para verificar que el codigo de carga y ejecucion de `CLIPSegForImageSegmentation` funciona sin descargar el modelo completo de 4.3M parametros reducidos, acelerando los pipelines.
- Validacion de contratos de framework: comprobar que la version de Transformers en uso respeta los nombres de tensores y la configuracion esperada antes de desplegar el modelo real.
- Desarrollo de utilidades de segmentacion: iterar sobre el codigo de preprocesado y postprocesado con un checkpoint ligero, sustituyendolo por `CIDAS/clipseg-rd64-refined` en la fase final.
- Tests de estabilidad numerica: verificar que el pipeline de inferencia no produce NaN ni inf en float32, bfloat16 y float16 antes de pasar al modelo completo.
- Reproducibilidad de experimentos: el `build.json` con hashes y fuentes fijadas permite reconstruir el fixture y auditar cambios en el contrato del modelo base.
- Formacion y demos de ingenieria: ilustrar como se construye un fixture reproducible a partir de un modelo real, siguiendo la metodologia de `transformers-mic`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad (MMLU, HumanEval, IoU de segmentacion, etc.) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (4.3M parametros), trivial en cualquier GPU.
- GPU recomendadas: ninguna en particular; cabe en CPU y en cualquier GPU consumer (GTX 1050, RTX 3060, etc.).
- Cabe en GPU consumer: si, con enorme holgura.
- Opciones de despliegue: Transformers (carga estandar de `CLIPSegForImageSegmentation`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este fixture.
- Latencia y throughput: no disponibles; al ser un artefacto de prueba, no se han medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| clipseg-rd64-refined-mic | 4.297.633 | no disponible | Fixture de test | no disponible | Hugging Face |
| CIDAS/clipseg-rd64-refined | no disponible | no disponible | Segmentacion texto-imagen real | no disponible | Hugging Face |
| CLIPSeg (variantes base) | no disponible | no disponible | Segmentacion texto-imagen | no disponible | Hugging Face |

La comparativa directa con otros modelos de segmentacion no es significativa: este artefacto no compite funcionalmente con ningun modelo, solo replica la interfaz del modelo base a escala reducida.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen significado.
- Etiquetado como `test-artifact`; no debe incluirse en busquedas de modelos candidatos ni en produccion.
- La licencia no esta declarada; no se puede asumir uso comercial.
- No se declaran idiomas soportados; el tokenizer se hereda del modelo base pero sin capacidades linguisticas reales.
- Riesgo de confusion: el nombre y la estructura pueden llevar a error si se trata como un modelo de segmentacion funcional.
- No se han publicado benchmarks ni metricas de rendimiento.
- El repositorio ocupa 0.0 GB segun Hugging Face, coherente con su naturaleza de fixture, pero no se garantiza su permanencia ni mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/clipseg-rd64-refined-mic
- Modelo base: https://huggingface.co/CIDAS/clipseg-rd64-refined
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/clipseg-rd64-refined-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/clipseg-rd64-refined-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/clipseg-rd64-refined-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/clipseg-rd64-refined-mic/blob/main/build.json
- Metodologia de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/clipseg-rd64-refined-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
