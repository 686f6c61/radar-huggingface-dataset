# huggingface-mic/Qwen3-VL-30B-A3B-Instruct-mic

## Resumen

`huggingface-mic/Qwen3-VL-30B-A3B-Instruct-mic` no es un modelo utilizable, sino un artefacto de prueba (fixture) derivado del modelo multimodal `Qwen/Qwen3-VL-30B-A3B-Instruct` de Alibaba Qwen. El repositorio contiene una version reducida del checkpoint original, con solo 21.002.624 parametros (frente a los aproximadamente 30.000 millones del modelo base), pensada para validar integraciones de frameworks (principalmente Transformers) sin necesidad de descargar ni ejecutar el modelo completo.

La model card es explicita: se trata de un `test-artifact` etiquetado como tal para excluirlo de las busquedas de modelos candidatos. Los pesos son aleatorios (semilla 17) y no han sido entrenados; simplemente reproducen la misma arquitectura (`Qwen3VLMoeForConditionalGeneration`) con la configuracion reducida a 2 capas ocultas en el componente de texto, conservando los ficheros de procesador (tokenizer, preprocessor, chat template) byte a byte del modelo original.

Su relevancia es por tanto exclusivamente de ingenieria: sirve para que los mantenedores de frameworks verifiquen que cargan correctamente la arquitectura Qwen3-VL MoE, que los nombres de tensores coinciden con el checkpoint real y que el forward, la perdida y los gradientes son finitos en float32, bfloat16 y float16. No debe usarse para inferencia real, evaluacion de calidad ni produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3VLMoeForConditionalGeneration (transformer MoE multimodal, vision + lenguaje) |
| Parametros totales | 21.002.624 (fixture reducido; el modelo base Qwen3-VL-30B-A3B tiene ~30.000 millones) |
| Parametros activos | no disponible (el modelo base es MoE con ~3B activos segun su nombre, pero la ficha no lo confirma) |
| Longitud de contexto | no disponible (heredada del config del modelo base, no documentada en el fixture) |
| Tipos de cuantizacion | no disponible; los pesos se guardan en float32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del modelo base: un transformer MoE multimodal (`Qwen3VLMoeForConditionalGeneration`) que combina un codificador de vision con un decoder de lenguaje de tipo mixture-of-experts. Para reducir el tamano, se aplico la regla generica de `sweep.py` del proyecto `transformers-mic`, que deja el componente de texto en 2 capas ocultas (`text num_hidden_layers: 2`). Los ficheros del procesador (`chat_template.json`, `generation_config.json`, `merges.txt`, `preprocessor_config.json`, `tokenizer.json`, `tokenizer_config.json`, `video_preprocessor_config.json`, `vocab.json`) se copiaron byte a byte desde `Qwen/Qwen3-VL-30B-A3B-Instruct`.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17, y se aceptaron porque superaron la puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movia los logits al menos 0,001 (la mas debil, `pixel_values:halve`, los movia 0,272). El fixture conserva exactamente los mismos nombres de tensores que el checkpoint real y es finito en float32, bfloat16 y float16 tanto en forward como en perdida y gradientes. La clave de fixture es `2e6dc6a72175`, y cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el shrink.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen salidas coherentes.
- Reproduce la interfaz de carga de la arquitectura Qwen3-VL MoE (vision + lenguaje) para pruebas de integracion.
- Permite validar en Transformers la carga de pesos, el forward multimodal, el calculo de perdida y la retropropagacion de gradientes.
- Sirve como fixture de CI para detectar regresiones en el soporte de `Qwen3VLMoeForConditionalGeneration`.
- Conserva el tokenizer, el chat template y los preprocesadores de imagen y video del modelo base, por lo que permite probar pipelines de tokenizacion y preprocesado reales.
- No soporta tool calling, agentes, razonamiento ni capacidades multilingues reales: cualquier comportamiento de ese tipo es irrelevante con pesos aleatorios.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture con `AutoModelForConditionalGeneration` y verificar que la arquitectura `Qwen3VLMoeForConditionalGeneration` se instancia sin errores y con los nombres de tensores esperados.
- CI de frameworks: incluir el fixture en la bateria de tests de un fork o wrapper para detectar roturas en el soporte de modelos MoE multimodales sin descargar 30B parametros.
- Validacion de preprocesado multimodal: usar los ficheros de procesador copiados del modelo base para probar pipelines de imagen y video (resize, normalizacion, tokenizacion) con entradas reales.
- Pruebas de dtype: comprobar que el forward, la perdida y los gradientes son finitos en float32, bfloat16 y float16, util para validar rutas de mixed precision.
- Verificacion de contratos de API: contrastar que la firma de `generate`, el chat template y la configuracion de generacion coinciden con lo que espera el modelo base antes de desplegarlo.
- Desarrollo de herramientas de inspeccion de checkpoints: analizar la estructura de tensores y la config reducida sin coste de almacenamiento (0,1 GB frente a decenas de GB del original).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier metrica de calidad seria carente de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (21 millones de parametros, ~84 MB de pesos mas overhead de activaciones y buffers del procesador).
- GPU recomendadas: cualquier GPU consumer moderna sirve; el fixture cabe incluso en CPU.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) y en la mayoria de entornos sin GPU.
- Opciones de despliegue: Transformers es el camino previsto; vLLM, llama.cpp, Ollama o TGI no estan documentados para este artefacto y no tiene sentido usarlos con pesos aleatorios.
- Latencia y throughput: no disponibles; irrelevantes para un artefacto de prueba.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/Qwen3-VL-30B-A3B-Instruct-mic | 21 M (fixture) | no disponible | Test artifact / fixture de integracion | no disponible | Hugging Face |
| Qwen/Qwen3-VL-30B-A3B-Instruct | ~30 B (MoE, ~3B activos) | no disponible en esta ficha | Modelo multimodal real para inferencia | no disponible en esta ficha | Hugging Face |
| Otros fixtures de transformers-mic | variable (reducidos) | no disponible | Pruebas de integracion por arquitectura | no disponible | Hugging Face |

La comparativa relevante es contra el modelo base: el fixture no compite en capacidades, solo replica su contrato de carga y su arquitectura a escala reducida.

## Limitaciones y advertencias

- Pesos aleatorios: las salidas no tienen ningun valor semantico; no usar para inferencia, evaluacion ni produccion.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; tratarlo como modelo real es un error de uso.
- Licencia no disponible: no se puede asumir la licencia del modelo base ni permisos de uso comercial.
- Idiomas no disponibles: el tokenizer es el del modelo base, pero el modelo no genera texto coherente.
- No se han documentado sesgos, riesgos de alucinacion ni limitaciones de contexto porque no aplican a un artefacto de prueba.
- El repositorio es de 0,1 GB e incluye solo pesos reducidos, uso y expectativas de framework; otros ficheros deben regenerarse con `python example/build_fixtures.py --fixture Qwen3-VL-30B-A3B-Instruct-mic`.
- No confundir con el checkpoint real: para cualquier evaluacion tecnica o de calidad, usar `Qwen/Qwen3-VL-30B-A3B-Instruct`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Qwen3-VL-30B-A3B-Instruct-mic
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Instruct
- Como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Qwen3-VL-30B-A3B-Instruct-mic.html
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla generica de reduccion (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Manifiesto de contrato (`integration.json`) y procedencia (`build.json`): incluidos en el repositorio
