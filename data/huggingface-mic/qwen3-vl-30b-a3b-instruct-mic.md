# huggingface-mic/Qwen3-VL-30B-A3B-Instruct-mic

## Resumen

`huggingface-mic/Qwen3-VL-30B-A3B-Instruct-mic` no es un modelo utilizable, sino un artefacto de prueba (fixture) derivado de `Qwen/Qwen3-VL-30B-A3B-Instruct`. Lo publica la organizacion `huggingface-mic` como parte de una infraestructura de validacion de integraciones de frameworks (Transformers y otros), con el objetivo de disponer de un checkpoint ligero que reproduzca exactamente la misma arquitectura, nombres de tensores y ficheros de procesador que el modelo original, pero con un coste de descarga y ejecucion minimo.

El fixture conserva la clase de arquitectura `Qwen3VLMoeForConditionalGeneration` (un transformer multimodal con mezcla de expertos en la torre de texto) pero reduce la configuracion a 2 capas en el codificador de texto, lo que deja el recuento real de parametros en 21.002.624 (21,0 M). Los pesos son aleatorios (semilla 17) y no han sido entrenados: el autor indica explicitamente que es un `test-artifact` y que debe quedar excluido de las busquedas de modelos candidatos.

Su relevancia es, por tanto, exclusivamente de ingenieria: permite verificar que un pipeline de carga, tokenizacion, preprocesado de imagen y video, y ejecucion forward/loss/backward funciona con la misma interfaz que el modelo real, sin necesidad de descargar decenas de gigabytes ni de GPU de datacenter. Cualquier evaluacion de capacidades, calidad o rendimiento debe hacerse sobre el modelo base original, no sobre este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3VLMoeForConditionalGeneration` (transformer multimodal con MoE en texto), configuracion reducida a 2 capas de texto |
| Parametros totales | 21.002.624 (21,0 M) |
| Parametros activos | no disponible (el modelo base es MoE, pero la configuracion reducida no publica el reparto de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32 y bfloat16 segun variante del fixture) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-VL-30B-A3B-Instruct |
| Tamano del repositorio | 0,1 GB |
| Dtype de guardado | float32 (fixture `2e6dc6a72175`) y bfloat16 (fixture `68a257ec4048`) |
| Descargas | 3339 |
| Likes | 0 |
| Fecha de creacion | 2026-10-27 |
| Ultima actualizacion | 2026-11-23 |

## Arquitectura y entrenamiento

El fixture replica la topologia del modelo base Qwen3-VL-30B-A3B-Instruct, que combina una torre visual con un decodificador de texto de tipo mezcla de expertos (MoE). Para el fixture, el script `sweep.py` del repositorio `transformers-mic` aplica una regla generica de reduccion que fija `text num_hidden_layers` en 2, manteniendo intactos los nombres de todos los tensores respecto al checkpoint real. Los ficheros de procesador (`chat_template.json`, `generation_config.json`, `merges.txt`, `preprocessor_config.json`, `tokenizer.json`, `tokenizer_config.json`, `video_preprocessor_config.json`, `vocab.json`) se copian byte a byte desde `Qwen/Qwen3-VL-30B-A3B-Instruct`.

No hay entrenamiento. Los pesos se inicializan de forma aleatoria con semilla 17 y se validan mediante una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato debe mover los logits al menos 0,001 (la perturbacion mas debil, `pixel_values:halve`, produce 0,272 y 0,279 en las dos variantes). El modelo se verifica como finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El autor documenta el proceso de reduccion en `build_fixtures.py` y registra fuentes fijadas, resultados de la puerta y hashes de ficheros en `build.json`.

## Capacidades

- Carga y ejecucion con la misma interfaz que `Qwen/Qwen3-VL-30B-A3B-Instruct` en Transformers, incluyendo el mismo tokenizador y plantilla de chat.
- Preprocesado de imagen y video mediante los ficheros de procesador copiados del modelo original.
- Ejecucion forward, calculo de loss y retropropagacion de gradientes en float32, bfloat16 y float16.
- Verificacion de contratos de integracion: el repositorio incluye `integration.json` (manifiesto de contrato) y el directorio `integrations/transformers/expectations` con las expectativas del framework.
- No genera texto coherente, no razona, no escribe codigo, no resuelve matematicas y no tiene capacidades multilingues reales: los pesos son aleatorios.
- No soporta tool calling, function calling ni comportamiento agentico mas alla de lo que permita la plantilla de chat heredada.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture con `AutoModelForConditionalGeneration` y verificar que la clase `Qwen3VLMoeForConditionalGeneration` se resuelve correctamente y que los nombres de tensores coinciden con el checkpoint real, sin descargar el modelo completo.
- CI/CD de librerias de inferencia: ejecutar tests de humo de forward y backward en cada pull request con un artefacto de 0,1 GB, reduciendo el tiempo de pipeline frente a usar el modelo de 30B.
- Validacion de pipelines multimodales: comprobar que el preprocesado de imagen y video (`preprocessor_config.json`, `video_preprocessor_config.json`) produce tensores con las formas esperadas antes de conectar el modelo real.
- Verificacion de plantillas de chat: probar que `chat_template.json` renderiza correctamente conversaciones multi-turno y mensajes con contenido visual, sin coste de inferencia real.
- Desarrollo de herramientas de cuantizacion y conversion de formatos: usar el fixture como caso de prueba reproducible para validar scripts que convierten safetensors a GGUF u otros formatos, comprobando que la topologia se preserva.
- Reproduccion de bugs de carga: aislar problemas de `from_pretrained`, `device_map` o `attn_implementation` con un checkpoint minimo que reproduce la misma configuracion de arquitectura que el modelo de produccion.
- Benchmarking de infraestructura de test: medir el coste de arranque de frameworks y suites de validacion usando un modelo de 21 M de parametros como referencia estable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que se trata de un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K, MMMU) carece de sentido sobre este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (21 M de parametros, aproximadamente 84 MB de pesos) y alrededor de 42 MB en bfloat16; el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer, incluida una GTX 1050 o una iGPU con soporte CUDA; tambien es viable en CPU.
- Cabe en cualquier GPU consumer y en la mayoria de entornos CPU-only.
- Opciones de despliegue: Transformers (via `Qwen3VLMoeForConditionalGeneration`), y cualquier runtime que cargue safetensors con la topologia correspondiente. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este fixture.
- Latencia y throughput: no disponibles de forma oficial; por el tamano, el forward es del orden de milisegundos en GPU consumer, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/Qwen3-VL-30B-A3B-Instruct-mic | 21,0 M (fixture) | no disponible | Artefacto de prueba de integracion | no disponible | Hugging Face, 0,1 GB |
| Qwen/Qwen3-VL-30B-A3B-Instruct | 30B totales, 3B activos (MoE) | no disponible en la informacion proporcionada | Modelo multimodal de produccion | no disponible en la informacion proporcionada | Hugging Face |
| Fixtures equivalentes de otras familias (p. ej. variantes `-mic` de otros modelos) | variable, tipicamente decenas de millones | no disponible | Artefacto de prueba | no disponible | Hugging Face |

La comparacion relevante no es de calidad, sino de funcion: este repositorio solo es intercambiable con el modelo base a efectos de contrato de API y topologia, nunca a efectos de capacidad.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no produce salidas coherentes y no debe usarse para inferencia real, evaluacion de calidad ni demostraciones.
- El autor lo etiqueta como `test-artifact` para excluirlo de busquedas de modelos candidatos; usarlo como sustituto del modelo base en produccion seria un error.
- La configuracion esta reducida a 2 capas de texto, por lo que el comportamiento numerico no reproduce el del modelo de 30B aunque la interfaz sea identica.
- La licencia no esta declarada en la informacion disponible; antes de redistribuir o reutilizar el artefacto conviene consultar el repositorio y la licencia del modelo base.
- No se declaran idiomas soportados ni longitud de contexto; cualquier dato al respecto debe tomarse del modelo base original.
- El repositorio incluye dos fixtures con claves distintas (`2e6dc6a72175` en float32 y `68a257ec4048` en bfloat16); mezclar ficheros de ambas variantes puede romper la carga.
- No hay garantia de soporte en runtimes distintos de Transformers; las expectativas publicadas se limitan a ese framework.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Qwen3-VL-30B-A3B-Instruct-mic
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Instruct
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/Qwen3-VL-30B-A3B-Instruct-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/Qwen3-VL-30B-A3B-Instruct-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/Qwen3-VL-30B-A3B-Instruct-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/Qwen3-VL-30B-A3B-Instruct-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Qwen3-VL-30B-A3B-Instruct-mic.html
- Repositorio `transformers-mic` (script `sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
