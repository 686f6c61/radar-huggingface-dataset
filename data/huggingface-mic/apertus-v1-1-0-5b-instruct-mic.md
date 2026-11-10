# huggingface-mic/Apertus-v1.1-0.5B-Instruct-mic

## Resumen

Apertus-v1.1-0.5B-Instruct-mic es un artefacto de prueba (fixture) publicado por huggingface-mic, no un modelo utilizable. Se trata de una version reducida del checkpoint swiss-ai/Apertus-v1.1-0.5B-Instruct, generada con la herramienta `sweep.py` del repositorio transformers-mic para verificar la integracion de dicha arquitectura con el ecosistema Transformers. El modelo conserva la arquitectura `ApertusForCausalLM` pero con solo 2 capas ocultas y 8.446.340 parametros totales (frente a los aproximadamente 500 millones del modelo base), y sus pesos son aleatorios (semilla 17), no entrenados.

El objetivo del artefacto es servir como contrato de integracion: incluye `integration.json`, ejemplos de uso con Transformers y un directorio de expectativas del framework, de modo que cualquier cambio en el codigo de Transformers pueda validarse contra el sin necesidad de descargar el checkpoint real de 0.5B. Los ficheros de procesador (`chat_template.jinja`, `generation_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`) se copian byte a byte del modelo base, garantizando que la tokenizacion y la plantilla de chat sean identicas.

Es relevante para desarrolladores que contribuyan a Transformers o que necesiten validar pipelines de inferencia y entrenamiento de forma rapida y ligera, pero no debe emplearse para generacion de texto, evaluacion de calidad ni ningun uso en produccion. La propia model card lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ApertusForCausalLM (transformer causal, version reducida) |
| Parametros totales | 8.446.340 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura `ApertusForCausalLM` del modelo base swiss-ai/Apertus-v1.1-0.5B-Instruct, pero con una configuracion reducida mediante la regla generica de `sweep.py`: `num_hidden_layers` igual a 2. Mantiene exactamente los mismos nombres de tensores que el checkpoint real, lo que permite que el codigo de carga y ejecucion de Transformers funcione sin adaptaciones. Los ficheros de procesador se copian byte a byte del modelo original, de forma que la tokenizacion, la plantilla de chat y la configuracion de generacion son identicas a las del checkpoint de referencia.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y superaron la puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movio los logits al menos 0.001 (el caso mas debil, `attention_mask:all_ones`, registro 0.526). El modelo se guarda en bfloat16, el dtype con el que carga por defecto el checkpoint base, y se verifico que es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El fixture se construyo con `build_fixtures.py` y su procedencia queda registrada en `build.json` con fuentes fijadas, resultados de las puertas y hashes de ficheros.

## Capacidades

- No dispone de capacidades reales de generacion de texto: los pesos son aleatorios y la salida carece de sentido linguistico.
- Sirve como contrato de integracion para validar la carga del modelo, el forward pass, el calculo de loss y los gradientes en Transformers.
- Permite comprobar la compatibilidad de la tokenizacion y la plantilla de chat copiadas del modelo base.
- Util para pruebas de regresion en CI sobre la arquitectura Apertus sin descargar el checkpoint completo.
- No soporta tool calling, function calling ni razonamiento multi-paso de forma funcional.
- No tiene capacidades multilingues, de vision ni de audio.
- Compatible con ejecucion en float32, bfloat16 y float16 sin valores no finitos.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture y ejecutar un forward pass para verificar que la clase `ApertusForCausalLM` y sus nombres de tensores siguen siendo compatibles tras cambios en la libreria.
- CI/CD de la libreria: ejecutar la suite de expectativas del framework en cada pull request sin necesidad de descargar el checkpoint de 0.5B, reduciendo tiempo y ancho de banda.
- Validacion de tokenizacion: comprobar que `tokenizer.json`, `chat_template.jinja` y `generation_config.json` producen los mismos identificadores y prompts que el modelo base.
- Pruebas de gradientes y mixed precision: verificar que forward, loss y backward son finitos en float32, bfloat16 y float16 antes de escalar a entrenamientos reales.
- Desarrollo de herramientas de inspeccion de modelos: usar un checkpoint minimo con la misma estructura de tensores para depurar utilidades de analisis de pesos.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture Apertus-v1.1-0.5B-Instruct-mic` y comparar hashes con `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K u otras) carece de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (8,4 M de parametros, aproximadamente 17 MB de pesos) mas overhead de activaciones y runtime.
- GPU recomendadas: cualquier GPU consumer moderna; el fixture cabe holgadamente en tarjetas con 4 GB o menos, e incluso puede ejecutarse en CPU.
- Cabe en GPU consumer: si, en cualquier RTX o GTX con al menos 2 GB de VRAM; tambien en CPU sin problema.
- Opciones de despliegue: Transformers (uso previsto segun `integrations/transformers/usage.md`); otras opciones como vLLM, llama.cpp, Ollama o TGI no estan documentadas para este artefacto.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia seria minima pero irrelevante para evaluacion de rendimiento real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Apertus-v1.1-0.5B-Instruct-mic | 8,4 M | no disponible | Fixture de integracion | no disponible | Hugging Face (huggingface-mic) |
| swiss-ai/Apertus-v1.1-0.5B-Instruct | ~0,5 B (no confirmado en la informacion) | no disponible | Modelo instructivo real | no disponible | Hugging Face (swiss-ai) |
| Otros fixtures de transformers-mic | variable (reducidos) | no disponible | Pruebas de contrato | no disponible | Hugging Face (huggingface-mic) |

La comparativa con modelos de produccion de tamano similar no es pertinente: el artefacto no es funcional como modelo de lenguaje y su unico comparable directo es el checkpoint base del que deriva y el resto de fixtures del mismo proyecto.

## Limitaciones y advertencias

- Pesos aleatorios: no genera texto coherente ni respuestas utiles; cualquier uso como modelo de lenguaje produce salidas sin sentido.
- Etiquetado como `test-artifact`: excluido deliberadamente de busquedas de modelos candidatos; no debe tratarse como modelo desplegable.
- Licencia no disponible: no puede asumirse permiso de uso comercial ni redistribucion; consultar la licencia del modelo base swiss-ai/Apertus-v1.1-0.5B-Instruct.
- Contexto, idiomas y cuantizaciones no documentados en la informacion proporcionada.
- Solo 2 capas ocultas: no representa el comportamiento numerico ni de rendimiento del checkpoint de 0.5B.
- Riesgo de confusion: el nombre incluye "0.5B-Instruct" pero el artefacto tiene 8,4 M de parametros; verificar siempre el campo de parametros antes de usarlo.
- No apto para produccion, evaluacion de calidad ni benchmarks comparativos.

## Enlaces

- [Hugging Face: huggingface-mic/Apertus-v1.1-0.5B-Instruct-mic](https://huggingface.co/huggingface-mic/Apertus-v1.1-0.5B-Instruct-mic)
- [Modelo base: swiss-ai/Apertus-v1.1-0.5B-Instruct](https://huggingface.co/swiss-ai/Apertus-v1.1-0.5B-Instruct)
- [Explicacion del proceso de reduccion (shrink)](https://huggingface-mic-mic-coverage.static.hf.space/shrink/Apertus-v1.1-0.5B-Instruct-mic.html)
- [Repositorio transformers-mic (sweep.py y build_fixtures.py)](https://github.com/huggingface/transformers-mic)
- [Manifiesto del contrato (integration.json)](https://huggingface.co/huggingface-mic/Apertus-v1.1-0.5B-Instruct-mic/blob/main/integration.json)
- [Uso con Transformers](https://huggingface.co/huggingface-mic/Apertus-v1.1-0.5B-Instruct-mic/blob/main/integrations/transformers/usage.md)
- [Expectativas de Transformers](https://huggingface.co/huggingface-mic/Apertus-v1.1-0.5B-Instruct-mic/tree/main/integrations/transformers/expectations)
- [Procedencia del fixture (build.json)](https://huggingface.co/huggingface-mic/Apertus-v1.1-0.5B-Instruct-mic/blob/main/build.json)
