# huggingface-mic/mistral3-vllm-mic

## Resumen

mistral3-vllm-mic es un artefacto de prueba (test artifact) publicado por el usuario huggingface-mic. No es un modelo entrenado ni utilizable para inferencia real: se trata de un "fixture" reducido de 8.607.168 parametros que replica la arquitectura `Mistral3ForConditionalGeneration` del modelo base mistralai/Mistral-Small-3.1-24B-Instruct-2503, pero con pesos aleatorios (semilla 17) y una configuracion drasticamente reducida (2 capas en el encoder de vision y 2 capas en el modelo de texto).

Su proposito es servir como banco de pruebas para la integracion de la arquitectura Mistral3 en frameworks como vLLM y Transformers, verificando contratos de entrada/salida, nombres de tensores, procesadores y expectativas de framework sin necesidad de descargar el checkpoint completo de 24B. El repositorio incluye pesos en safetensors, manifiesto de contrato (`integration.json`), documentacion de uso en Transformers y ficheros de procesador copiados byte a byte del modelo original.

Es relevante unicamente en el contexto de desarrollo y CI de integraciones de modelos, no como modelo de produccion. La model card lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral3ForConditionalGeneration (image-text-to-text, multimodal) |
| Parametros totales | 8.607.168 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo reproduce la arquitectura Mistral3 (`Mistral3ForConditionalGeneration`), un transformer multimodal image-text-to-text que combina un encoder de vision con un modelo de lenguaje. En este fixture la configuracion se ha reducido mediante la regla generica de `sweep.py` del repositorio transformers-mic: 2 capas en el componente de vision y 2 capas en el componente de texto. Los nombres de tensores coinciden exactamente con los del checkpoint real mistralai/Mistral-Small-3.1-24B-Instruct-2503, lo que permite validar cargadores y pipelines sin descargar los 24B parametros completos.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y unicamente pasaron una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movia los logits al menos 0,001 (la mas debil, `input_ids:reverse`, 1,72). Los ficheros de procesador (`SYSTEM_PROMPT.txt`, `chat_template.json`, `generation_config.json`, `params.json`, `preprocessor_config.json`, `processor_config.json`, `special_tokens_map.json`, `tekken.json`, `tokenizer.json`, `tokenizer_config.json`) se copiaron byte a byte del modelo base. El modelo es finito en float32, bfloat16 y float16 (forward, loss y gradientes).

## Capacidades

- No es un modelo funcional: no genera texto, codigo ni respuestas coherentes, ya que sus pesos son aleatorios.
- Sirve para validar la carga del checkpoint y la inicializacion de `Mistral3ForConditionalGeneration` en Transformers y vLLM.
- Permite comprobar el contrato de entradas y salidas (input ids, imagenes, logits) definido en `integration.json`.
- Valida la compatibilidad de los ficheros de procesador (tokenizer Tekken, chat template, preprocessor de vision) con el framework.
- Comprueba la estabilidad numerica en bfloat16, float16 y float32 durante forward, calculo de perdida y gradientes.
- No soporta tool calling, agentes, razonamiento multilingue ni ninguna capacidad de inferencia real.

## Casos de uso

- Integracion continua de vLLM: usar el fixture para ejecutar tests de carga y ejecucion del modelo Mistral3 en pipelines de CI sin descargar el checkpoint de 24B, reduciendo tiempo y ancho de banda.
- Desarrollo de cargadores en Transformers: validar que `Mistral3ForConditionalGeneration` se instancia correctamente y que los nombres de tensores coinciden con el checkpoint real.
- Verificacion de contratos de framework: comprobar que las entradas definidas en `integration.json` producen logits con la sensibilidad esperada (gate de 0,001).
- Pruebas de procesador multimodal: validar que los ficheros de tokenizer, chat template y preprocessor copiados del modelo base se cargan sin errores.
- Tests de estabilidad numerica: ejecutar forward, loss y backward en float32, bfloat16 y float16 para detectar problemas de precision en integraciones.
- Reproduccion de fixtures: reconstruir los ficheros con `python example/build_fixtures.py --fixture mistral3-vllm-mic` y comprobar hashes registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que no procede evaluacion de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (8,6M parametros), aunque el modelo no produce salidas utiles.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) es suficiente; tambien CPU.
- Cabe en cualquier GPU consumer y en CPU sin problemas.
- Opciones de despliegue: Transformers (segun `integrations/transformers/usage.md`) y vLLM (compatible, segun la model card); no se documentan otras opciones.
- Latencia y throughput: no disponibles; al ser un fixture no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia |
|---|---|---|---|---|
| mistral3-vllm-mic | 8,6M | no disponible | Fixture de test para integracion Mistral3 | no disponible |
| mistralai/Mistral-Small-3.1-24B-Instruct-2503 | 24B | no disponible | Modelo multimodal real image-text-to-text | no disponible en la informacion proporcionada |
| Otros fixtures de transformers-mic | variable | no disponible | Artefactos de test para otras arquitecturas | no disponible |

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen sentido.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- La configuracion esta reducida (2 capas de vision, 2 de texto), por lo que el comportamiento no representa al modelo base de 24B.
- La licencia no esta disponible en la informacion proporcionada; verificar antes de cualquier uso.
- Los idiomas soportados no estan documentados.
- No se han publicado benchmarks ni metricas de rendimiento.
- Riesgo de confusion: el nombre puede sugerir un modelo Mistral3 funcional cuando es solo un fixture.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/mistral3-vllm-mic
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Instruct-2503
- Manifiesto de contrato: integration.json (en el repositorio)
- Uso en Transformers: integrations/transformers/usage.md (en el repositorio)
- Expectativas de Transformers: integrations/transformers/expectations (en el repositorio)
- Procedencia del fixture: build.json (en el repositorio)
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/mistral3-vllm-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
