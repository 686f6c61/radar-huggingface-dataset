# huggingface-mic/blip2-opt-2.7b-mic

## Resumen

`huggingface-mic/blip2-opt-2.7b-mic` no es un modelo funcional, sino un artefacto de prueba (fixture) construido por el equipo de `huggingface-mic` para validar la infraestructura de contratos de integracion de Transformers. Se deriva de `Salesforce/blip2-opt-2.7b`, un modelo vision-lenguaje de tipo BLIP-2 que combina un codificador visual con un Q-Former y un decodificador de texto OPT de 2.700 millones de parametros, y reproduce su misma arquitectura (`Blip2ForConditionalGeneration`) con una configuracion drasticamente reducida.

El repositorio contiene unicamente 3.629.056 parametros con pesos aleatorios (semilla 17), sin entrenamiento alguno. Los ficheros de procesador (tokenizer, preprocessor, generation config) se copiaron byte a byte del checkpoint original para garantizar compatibilidad, y los pesos se guardan en float32, el dtype por defecto de `Salesforce/blip2-opt-2.7b`.

Su relevancia es puramente de ingenieria: permite ejecutar y verificar flujos de carga, inferencia y gradientes en pipelines de integracion sin descargar ni ejecutar el modelo real de 2.700 millones de parametros. Esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Blip2ForConditionalGeneration` (vision encoder + Q-Former + decodificador de texto OPT), con capas reducidas |
| Parametros totales | 3.629.056 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32; el autor declara finitud en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura replica la de BLIP-2: un codificador visual, un Q-Former que proyecta las caracteristicas visuales al espacio del modelo de lenguaje y un decodificador de texto basado en OPT. En este fixture, la configuracion se ha reducido mediante la regla generica de `sweep.py`: 2 capas en el codificador visual, 2 capas en el Q-Former y 2 capas en el modulo de texto. Los nombres de tensores coinciden con los del checkpoint real, lo que permite sustituir uno por otro en pruebas de integracion.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se aceptaron tras superar una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplazo los logits al menos 0,001 (el caso mas debil, `pixel_values:halve`, produjo 0,0469). El fixture se valido como finito en float32, bfloat16 y float16 para forward, perdida y gradientes. Los ficheros de procesador se copiaron byte a byte del modelo original.

## Capacidades

- No es un modelo usable: no genera texto ni descripciones de imagen con calidad, ya que sus pesos son aleatorios.
- Reproduce la interfaz de inferencia de BLIP-2 para captioning de imagenes a traves de Transformers.
- Mantiene la firma de tensores del checkpoint original, lo que permite probar rutas de carga y compatibilidad.
- Sirve como fixture ejecutable para verificar expectativas de framework (forward, perdida y gradientes).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision real, audio): no disponible.

## Casos de uso

- Pruebas de integracion en CI: ejecutar la carga del modelo y un forward con `pixel_values` sinteticos para detectar regresiones en Transformers sin descargar el checkpoint de 2.700 millones de parametros.
- Validacion de contratos de framework: comprobar que las expectativas declaradas en `integrations/transformers/expectations` se cumplen sobre un modelo con la misma firma de tensores.
- Verificacion de dtypes: confirmar que forward, perdida y gradientes son finitos en float32, bfloat16 y float16 antes de probar el modelo real.
- Pruebas de compatibilidad de procesador: usar los ficheros de tokenizer y preprocessor copiados del modelo original para validar pipelines de preprocesado de imagen y texto.
- Desarrollo de herramientas de inspeccion de modelos: analizar nombres de tensores y configuraciones reducidas sin coste de memoria.
- Reproducibilidad de fixtures: reconstruir el artefacto con `build_fixtures.py` y comparar hashes registrados en `build.json` para auditar cambios en el pipeline de generacion de fixtures.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, no procede evaluacion de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (3,6 millones de parametros); el repo ocupa 0,0 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer y probablemente en CPU para pruebas.
- Opciones de despliegue: Transformers (ruta principal documentada en `integrations/transformers/usage.md`); vLLM, llama.cpp, Ollama y TGI no estan documentados para este fixture.
- Latencia y throughput: no disponibles; irrelevantes para un artefacto de prueba.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/blip2-opt-2.7b-mic` | 3.629.056 | no disponible | Fixture de pruebas | no disponible | Hugging Face |
| `Salesforce/blip2-opt-2.7b` | ~2.700 millones (texto) | no disponible | Captioning y VQA real | no disponible | Hugging Face |
| `Salesforce/blip2-flan-t5-xl` | ~1.200 millones (texto) | no disponible | Captioning y VQA real | no disponible | Hugging Face |

La comparacion relevante es con el modelo base: el fixture comparte arquitectura, procesador y nombres de tensores, pero carece de capacidad funcional. Frente a otros BLIP-2 de Salesforce, la diferencia principal es el tamano del decodificador de texto.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y las salidas carecen de sentido.
- Etiquetado como `test-artifact`; no debe incluirse en busquedas de modelos candidatos ni en produccion.
- Licencia no declarada en la informacion disponible; verificar antes de cualquier redistribucion.
- Idiomas y contexto no documentados.
- No dispone de benchmarks ni evaluacion de calidad.
- Su utilidad esta limitada a pruebas de integracion y validacion de contratos de framework.
- La fecha de creacion indicada (2026-11-08) y el reducido numero de descargas (1.553) sugieren un uso acotado al equipo que lo genera.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/blip2-opt-2.7b-mic
- Modelo base: https://huggingface.co/Salesforce/blip2-opt-2.7b
- Manifiesto de contrato: `integration.json` (en el repo)
- Uso con Transformers: `integrations/transformers/usage.md` (en el repo)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repo)
- Procedencia del fixture: `build.json` (en el repo)
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/blip2-opt-2.7b-mic.html
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
