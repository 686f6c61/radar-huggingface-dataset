# huggingface-mic/ernie-3.0-base-zh-mic

## Resumen

`huggingface-mic/ernie-3.0-base-zh-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic`, no un modelo entrenado ni utilizable en produccion. Se trata de una version "slim" del checkpoint `nghuyong/ernie-3.0-base-zh`, reducida mediante la regla generica de `sweep.py` del repositorio `transformers-mic` hasta los 2,8 millones de parametros, con pesos inicializados aleatoriamente (semilla 17) y sin entrenamiento posterior.

El proposito del repositorio es servir como contrato de integracion: incluye el manifiesto `integration.json`, instrucciones de uso con Transformers, un directorio de expectativas del framework y la procedencia del fixture en `build.json`. La arquitectura resultante es `ErnieForMaskedLM` con 2 capas ocultas, manteniendo los nombres de tensores del checkpoint original y copiando byte a byte el fichero `vocab.txt` del modelo base.

Es relevante unicamente para desarrolladores que trabajen en tooling de validacion de integraciones (por ejemplo, pruebas de compatibilidad de Transformers o de pipelines de carga de checkpoints), no para tareas de NLP reales. El propio autor lo etiqueta como `test-artifact` para excluirlo de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo ERNIE 3.0, clase `ErnieForMaskedLM` |
| Parametros totales | 2,8 M (fixture reducido; el checkpoint original es base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; finito tambien en bfloat16 y float16) |
| Idiomas soportados | no disponible (el modelo base es chino, `zh`) |
| Licencia | no disponible |
| Formato de pesos | safetensors/PyTorch (repositorio de 0.0 GB, pesos slim) |

## Arquitectura y entrenamiento

El fixture conserva la arquitectura del modelo base ERNIE 3.0 en su variante `ErnieForMaskedLM`, pero con la configuracion reducida: `num_hidden_layers` pasa a 2 mediante la regla generica de reduccion aplicada por `sweep.py`. Los nombres de tensores coinciden con los del checkpoint real `nghuyong/ernie-3.0-base-zh`, de modo que el fixture puede sustituir al modelo original en pruebas de carga sin modificar el codigo de integracion.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y superaron unicamente la puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato mueve los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, mueve 0,00221). El fichero `vocab.txt` se copia byte a byte del modelo base. Los pesos se guardan en float32, el dtype por defecto del checkpoint original, y se verifica que forward, loss y gradientes son finitos en float32, bfloat16 y float16. La clave de fixture es `0ea57cf23634` y cubre todos los checkpoints con ficheros de procesador identicos y config coincidente tras la reduccion.

## Capacidades

- No es un modelo funcional: no genera texto, no razona, no traduce ni responde preguntas.
- Implementa la interfaz de `fill-mask` a nivel de contrato, pero con pesos aleatorios las predicciones no tienen significado.
- Sirve para validar la carga de checkpoints, la compatibilidad de nombres de tensores y el comportamiento de frameworks (Transformers) frente a un modelo ERNIE.
- Permite probar rutas de codigo dependientes del procesador (`vocab.txt` identico al original).
- No soporta tool calling, agentes, vision, audio ni modo thinking.
- No dispone de capacidades multilingues reales; el vocabulario heredado es chino.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture con `AutoModelForMaskedLM` para verificar que la clase `ErnieForMaskedLM` se instancia correctamente sin descargar el checkpoint completo.
- CI/CD de librerias de NLP: usar el fixture como sustituto ligero del modelo base en tests unitarios que comprueban formas de salida, dtypes y manejo de `attention_mask`.
- Validacion de contratos de modelo: ejecutar `integration.json` y el directorio `expectations` para comprobar que una nueva version del framework sigue cumpliendo las expectativas definidas.
- Pruebas de precision numerica: verificar que forward, loss y gradientes son finitos en float32, bfloat16 y float16 antes de desplegar codigo con el checkpoint real.
- Desarrollo de tooling de empaquetado: comprobar la serializacion y carga de pesos con los mismos nombres de tensores que el modelo original.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture ernie-3.0-base-zh-mic` y comparar hashes registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier metrica de calidad (MMLU, GLUE, etc.) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 dado el tamano de 2,8 M de parametros; cabe en CPU sin problema.
- GPU recomendadas: cualquiera; no requiere GPU dedicada. Una RTX 4090, A100 o H100 estan sobredimensionadas para este artefacto.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU con suficiente memoria compartida.
- Opciones de despliegue: Transformers (via `AutoModelForMaskedLM`), y en principio cualquier runtime que cargue pesos PyTorch/safetensors con la configuracion reducida; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/ernie-3.0-base-zh-mic` | 2,8 M (fixture) | no disponible | Artefacto de prueba | no disponible | Hugging Face |
| `nghuyong/ernie-3.0-base-zh` | base (ERNIE 3.0) | no disponible | Modelo real para NLP en chino | no disponible | Hugging Face |
| `bert-base-chinese` | ~110 M | 512 tokens | Modelo real BERT en chino | Apache 2.0 (segun el repositorio original) | Hugging Face |

La comparativa es orientativa: el fixture no es funcionalmente equivalente a ninguno de los modelos reales; solo comparte arquitectura y nombres de tensores con `nghuyong/ernie-3.0-base-zh`.

## Limitaciones y advertencias

- Pesos aleatorios: las salidas no tienen significado; no debe usarse para inferencia real ni para evaluacion de calidad.
- Etiquetado como `test-artifact`: el autor lo excluye explicitamente de busquedas de modelos candidatos.
- Licencia no declarada: no hay autorizacion explicita de uso comercial; al derivar del checkpoint `nghuyong/ernie-3.0-base-zh`, habria que consultar la licencia de ese modelo base.
- Contexto, idiomas y cuantizaciones no documentados; no asumir compatibilidad con pipelines de produccion.
- Riesgo de confusion: el nombre puede llevar a pensar que es un ERNIE 3.0 funcional; conviene revisar `build.json` e `integration.json` antes de integrarlo.
- No apto para fine-tuning con proposito de calidad: los pesos iniciales son aleatorios y no se ha realizado entrenamiento.
- El repositorio no incluye todos los ficheros necesarios para reconstruir el fixture; hay que regenerarlos con `example/build_fixtures.py`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/ernie-3.0-base-zh-mic
- Modelo base: https://huggingface.co/nghuyong/ernie-3.0-base-zh
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de reduccion `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/ernie-3.0-base-zh-mic.html
