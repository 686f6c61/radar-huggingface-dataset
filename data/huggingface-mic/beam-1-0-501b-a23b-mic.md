# huggingface-mic/Beam-1.0-501B-A23B-mic

## Resumen

Beam-1.0-501B-A23B-mic es un artefacto de prueba publicado por el usuario `huggingface-mic` en Hugging Face. No se trata de un modelo funcional, sino de una version reducida (fixture) del checkpoint `reflection/Beam-1.0-501B-A23B`, generada para validar contratos de integracion con frameworks de inferencia. El propio autor lo etiqueta como `test-artifact` y advierte explicitamente de que no es un modelo usable.

El repositorio contiene unicamente 19.572.148 parametros reales (19,6 M), una fraccion minima de los 501B y 23B activos que sugiere el nombre del modelo base. La arquitectura declarada es `BeamForCausalLM` con solo 3 capas ocultas, pesos aleatorios (semilla 17) y el mismo nombre de tensores que el checkpoint original, de modo que sirve como sustituto ligero en pruebas de integracion.

Su relevancia es puramente tecnica: permite a desarrolladores validar pipelines de carga, tokenizacion, plantillas de chat y expectativas de framework sin descargar ni ejecutar el modelo completo. Cualquier evaluacion de capacidades, rendimiento o calidad queda fuera de su proposito y de la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `BeamForCausalLM` (transformer causal, version reducida a 3 capas ocultas) |
| Parametros totales | 19.572.148 (~19,6 M) |
| Parametros activos | no disponible (el nombre del modelo base sugiere 23B, pero no se confirma en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; verificado finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repo incluye un fichero `LICENSE` copiado del modelo base, pero su contenido no se detalla) |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del modelo base `reflection/Beam-1.0-501B-A23B` bajo la clase `BeamForCausalLM`, pero con una configuracion reducida mediante la regla generica de `sweep.py` (3 capas ocultas). Mantiene los mismos nombres de tensores que el checkpoint real, lo que permite intercambiarlo en pruebas de carga sin modificar el codigo de integracion.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se generaron tras superar una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movia los logits al menos 0,001 (la mas debil, `input_ids:roll_batch`, 0,786). Los ficheros de procesador (`tokenizer.json`, `tokenizer_config.json`, `chat_template.jinja`, `generation_config.json`, `EVALUATION.md`, `LICENSE`) se copiaron byte a byte desde el modelo base. El build queda documentado en `build.json` con hashes y resultados de la puerta.

## Capacidades

- Generacion de texto: tecnicamente puede ejecutar un forward de decodificacion, pero los pesos aleatorios no producen salida coherente.
- Carga compatible con Transformers: misma interfaz y nombres de tensores que el checkpoint original.
- Validacion de plantillas de chat: incluye `chat_template.jinja` copiado del modelo base.
- Validacion de tokenizador: `tokenizer.json` y `tokenizer_config.json` identicos al modelo original.
- Verificacion de estabilidad numerica: forward, loss y gradientes finitos en float32, bfloat16 y float16.
- Tool calling, agentes, razonamiento, codigo, matematicas, vision o audio: no disponible (no aplica a un fixture de prueba).

## Casos de uso

- Pruebas de integracion en CI: cargar el fixture con Transformers para verificar que el codigo de integracion funciona antes de ejecutar el modelo real de 501B, reduciendo coste y tiempo de pipeline.
- Validacion de contratos de framework: comprobar que las expectativas documentadas en `integrations/transformers/expectations` se cumplen con un checkpoint del mismo esquema de tensores.
- Desarrollo de plantillas de chat: iterar sobre `chat_template.jinja` sin necesidad de descargar el modelo completo, ya que el fichero es byte a byte identico al original.
- Pruebas de tokenizacion: validar pipelines de preprocesado con el `tokenizer.json` real del modelo base en un repositorio de 0,1 GB.
- Verificacion de estabilidad numerica: ejecutar forward y backward en float32, bfloat16 y float16 para confirmar que el codigo de entrenamiento o inferencia no produce NaN/Inf antes de escalar al modelo completo.
- Regresion de carga de safetensors: comprobar que el loader maneja correctamente los nombres de tensores y el dtype float32 del checkpoint original.
- Documentacion y demos internas: disponer de un repositorio ligero que reproduzca la estructura del modelo real para formacion o ejemplos sin coste de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K, etc.) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (19,6 M parametros, ~78 MB de pesos); menos de 40 MB en float16.
- GPU recomendadas: cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) o incluso CPU; no requiere acelerador dedicado.
- Cabe en cualquier GPU consumer y en CPU.
- Opciones de despliegue: Transformers (referencia principal, segun `integrations/transformers/usage.md`); otras opciones como vLLM, llama.cpp, Ollama o TGI no estan documentadas para este fixture.
- Latencia y throughput: no disponibles; al ser un modelo de 3 capas y 19,6 M de parametros, la latencia seria minima, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Beam-1.0-501B-A23B-mic | 19,6 M (fixture) | no disponible | Artefacto de prueba | no disponible | Hugging Face (0 descargas) |
| reflection/Beam-1.0-501B-A23B | 501B totales / 23B activos (segun nombre) | no disponible | Modelo real | no disponible | Hugging Face (modelo base) |
| Otros fixtures de transformers-mic | variable | no disponible | Artefactos de prueba | no disponible | Hugging Face (org `huggingface-mic`) |

No se dispone de informacion suficiente para comparar con modelos de produccion de la misma categoria; el fixture no es funcionalmente comparable a un modelo real.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios (semilla 17) y la salida no tiene coherencia linguistica.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- Solo 3 capas ocultas frente a las del modelo base; el comportamiento numerico no representa al modelo real.
- Sin datos de sesgos, alucinacion o rendimiento multilingue porque no ha sido entrenado.
- Licencia no disponible en la informacion proporcionada; el repo incluye un `LICENSE` copiado del modelo base cuyo contenido no se detalla, por lo que el uso comercial debe verificarse en el repositorio original.
- El nombre del modelo base sugiere 501B totales y 23B activos, pero no se confirma la configuracion MoE ni el contexto en la informacion disponible.
- Cualquier evaluacion de calidad, seguridad o sesgo debe realizarse sobre `reflection/Beam-1.0-501B-A23B`, no sobre este fixture.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Beam-1.0-501B-A23B-mic
- Modelo base: https://huggingface.co/reflection/Beam-1.0-501B-A23B
- Manifiesto de contrato: `integration.json` (en el repositorio)
- Uso con Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Procedencia del fixture: `build.json` (en el repositorio)
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Beam-1.0-501B-A23B-mic.html
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
