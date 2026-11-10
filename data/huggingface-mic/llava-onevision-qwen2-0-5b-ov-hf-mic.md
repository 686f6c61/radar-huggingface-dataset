# huggingface-mic/llava-onevision-qwen2-0.5b-ov-hf-mic

## Resumen

`huggingface-mic/llava-onevision-qwen2-0.5b-ov-hf-mic` no es un modelo utilizable, sino un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic` dentro del proyecto `transformers-mic`. Se trata de una version "adelgazada" del checkpoint `llava-hf/llava-onevision-qwen2-0.5b-ov-hf`, un modelo multimodal de imagen a texto basado en la arquitectura LLaVA-OneVision con un backbone de lenguaje Qwen2 de 0,5B parametros. El fixture reproduce la misma arquitectura (`LlavaOnevisionForConditionalGeneration`) con una configuracion reducida (2 capas en el encoder de vision y 2 capas en el modelo de texto) y pesos aleatorios, hasta totalizar 9.962.112 parametros.

Su proposito es servir como banco de pruebas para validar contratos de integracion con frameworks (Transformers, principalmente): los ficheros de procesador, tokenizador y configuracion se copian byte a byte del modelo real, y los nombres de tensores coinciden con los del checkpoint original. De este modo, los desarrolladores de `transformers-mic` pueden comprobar que las expectativas de carga, preprocesado y forward pass se cumplen sin necesidad de descargar ni ejecutar el modelo completo.

Es relevante unicamente en el contexto de testing e integracion continua de pipelines de modelos multimodales. No debe emplearse para inferencia real, generacion de texto, comprension de imagenes ni ninguna tarea de produccion: sus pesos son aleatorios (semilla 17) y su capacidad representacional es practicamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlavaOnevisionForConditionalGeneration (vision encoder + decoder de lenguaje Qwen2), configuracion reducida a 2 capas de vision y 2 capas de texto |
| Parametros totales | 9.962.112 (fixture); el modelo base `llava-hf/llava-onevision-qwen2-0.5b-ov-hf` tiene aproximadamente 0,5B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base, no confirmada) |
| Tipos de cuantizacion | no disponible; los pesos se guardan en float16 |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura LLaVA-OneVision: un encoder visual (en el modelo original, basado en SigLIP) conectado mediante un proyector multimodal a un decoder de lenguaje Qwen2. En este fixture, la configuracion se ha reducido mediante la regla generica de `sweep.py` del repositorio `transformers-mic`: `vision num_hidden_layers = 2` y `text num_hidden_layers = 2`. Los ficheros de procesador (`preprocessor_config.json`, `video_preprocessor_config.json`, `processor_config.json`, `tokenizer.json`, `tokenizer_config.json`, `chat_template.json`, entre otros) se copiaron byte a byte del checkpoint original `llava-hf/llava-onevision-qwen2-0.5b-ov-hf`.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron mediante una "input-sensitivity gate": cada perturbacion de las entradas del contrato movia los logits al menos 0,001 (la mas debil, `pixel_values:halve`, produjo 0,309), lo que garantiza que el fixture responde a las entradas de forma medible. Los tensores conservan los mismos nombres que el checkpoint real, y el modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El fixture cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el adelgazamiento (clave de fixture `20af79530371`).

## Capacidades

- No dispone de capacidades funcionales reales: los pesos son aleatorios y no han sido entrenados.
- Reproduce la interfaz de entrada-salida del modelo base: acepta `pixel_values` e `input_ids` y produce logits, lo que permite validar pipelines de preprocesado imagen-texto.
- Sirve para verificar la carga correcta de tokenizador, procesador y configuracion multimodal en Transformers.
- Permite comprobar la sensibilidad de las entradas del contrato (perturbaciones de pixeles y tokens) en tests automatizados.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues reales.
- No genera texto ni descripciones de imagenes con sentido.

## Casos de uso

- Pruebas de integracion en CI/CD de `transformers-mic`: ejecutar el fixture para verificar que el contrato de carga del modelo LLaVA-OneVision se cumple sin descargar el checkpoint completo de 0,5B.
- Validacion de pipelines de preprocesado multimodal: comprobar que `preprocessor_config.json` y `video_preprocessor_config.json` producen tensores con las formas esperadas antes de pasar al modelo real.
- Test de regresion de tokenizador: al copiarse `tokenizer.json`, `vocab.json` y `merges.txt` byte a byte, se puede verificar que los IDs de tokens coinciden con los del modelo base.
- Desarrollo de herramientas de inspeccion de modelos: usar los nombres de tensores identicos al checkpoint real para validar scripts que enumeran, mapean o convierten pesos.
- Validacion de dtypes: comprobar que el modelo es finito en float32, bfloat16 y float16 en forward, loss y gradientes, util para testear rutas de mixed precision.
- Benchmarking de frameworks de inferencia: medir tiempos de carga y overhead de inicializacion de un modelo LlavaOnevision sin el coste de un checkpoint grande.
- Verificacion de la gate de sensibilidad: replicar las perturbaciones sobre `pixel_values` e `input_ids` para confirmar que los logits se mueven por encima del umbral de 0,001.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K, VQAv2, etc.) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float16 (9,96M parametros, aproximadamente 20 MB de pesos mas overhead de activaciones y buffers del procesador).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) o incluso CPU es suficiente; no requiere A100 ni H100.
- Cabe holgadamente en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (ruta principal, con `integrations/transformers/usage.md`); no se ha confirmado soporte en vLLM, llama.cpp, Ollama ni TGI para este fixture.
- Latencia y throughput: no disponibles; al ser un modelo de 2+2 capas, la latencia sera minima, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| `huggingface-mic/llava-onevision-qwen2-0.5b-ov-hf-mic` (este) | 9,96M (fixture) | no disponible | no disponible | Fixture de test |
| `llava-hf/llava-onevision-qwen2-0.5b-ov-hf` (modelo base) | ~0,5B | no disponible en la informacion | no disponible | Modelo multimodal imagen-texto real |
| Otros fixtures `transformers-mic` | Variable (reducidos) | no disponible | no disponible | Testing de contratos de integracion |

La comparacion relevante es con su propio modelo base: el fixture reduce el numero de capas y sustituye los pesos entrenados por pesos aleatorios, manteniendo la interfaz y los ficheros de procesador. Frente a otros fixtures del mismo proyecto, comparte el mismo enfoque metodologico (adelgazamiento generico via `sweep.py`, gate de sensibilidad, pesos en float16).

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y no han sido entrenados; cualquier salida es ruido estadistico.
- Etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe promocionarse a produccion.
- La licencia no esta disponible en la informacion proporcionada; ante cualquier uso, consultar el repositorio del modelo base `llava-hf/llava-onevision-qwen2-0.5b-ov-hf`.
- La configuracion reducida (2 capas de vision, 2 de texto) implica que el comportamiento numerico no reproduce el del modelo real, solo la estructura de tensores y la interfaz.
- Los ficheros de procesador se copian byte a byte, pero el resto de ficheros deben reconstruirse con `python example/build_fixtures.py --fixture llava-onevision-qwen2-0.5b-ov-hf-mic`; el repositorio no es autocontenido para todas las rutas de uso.
- Riesgo de confusion: el nombre incluye "qwen2-0.5b" pero el fixture tiene solo 9,96M parametros; verificar siempre el tamano antes de usarlo en cualquier pipeline.
- No apto para evaluaciones de calidad, sesgos, alucinacion o rendimiento linguistico.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/llava-onevision-qwen2-0.5b-ov-hf-mic
- Modelo base: https://huggingface.co/llava-hf/llava-onevision-qwen2-0.5b-ov-hf
- Manifiesto de contrato: `integration.json` (en el repositorio)
- Uso con Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Procedencia del fixture: `build.json` (en el repositorio)
- Explicacion del adelgazamiento: https://huggingface-mic-mic-coverage.static.hf.space/shrink/llava-onevision-qwen2-0.5b-ov-hf-mic.html
- Script `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
