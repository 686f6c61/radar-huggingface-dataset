# huggingface-mic/llava-onevision-qwen2-vllm-mic

## Resumen

`llava-onevision-qwen2-vllm-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic`, no un modelo utilizable. Se trata de una version reducida del checkpoint multimodal `llava-hf/llava-onevision-qwen2-0.5b-ov-hf`, que a su vez es una variante de LLaVA-OneVision con backbone de lenguaje Qwen2 de 0.5B. El repositorio empaqueta pesos "slim" de 9.962.112 parametros, junto con la configuracion del procesador copiada byte a byte del modelo original y una serie de expectativas de integracion para frameworks.

El proposito del artefacto es servir como fixture de pruebas para validar la integracion de la arquitectura `LlavaOnevisionForConditionalGeneration` en frameworks de inferencia (el nombre sugiere vLLM) y en Transformers, sin necesidad de descargar los pesos completos. Los pesos son aleatorios (semilla 17) y se generaron reduciendo la configuracion: 2 capas en el codificador visual y 2 capas en el modelo de lenguaje, manteniendo los mismos nombres de tensores que el checkpoint real.

Es relevante unicamente en el contexto de ingenieria de pruebas y CI de pipelines multimodales: permite comprobar contratos de entrada/salida, carga de procesadores y compatibilidad de arquitectura con un coste de almacenamiento minimo. No debe emplearse para inferencia real, evaluacion de calidad ni despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `LlavaOnevisionForConditionalGeneration` (vision encoder + LLM Qwen2), version reducida a 2 capas visuales y 2 capas de texto |
| Parametros totales | 9.962.112 (fixture); el modelo base real es de 0.5B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

La arquitectura declarada es `LlavaOnevisionForConditionalGeneration`, el mismo tipo que emplea la familia LLaVA-OneVision: un codificador visual conectado a un modelo de lenguaje Qwen2 mediante proyeccion multimodal, con soporte para imagen, video y texto. En este repositorio la configuracion se ha reducido mediante la regla generica de `sweep.py`: `vision num_hidden_layers = 2` y `text num_hidden_layers = 2`. Los ficheros del procesador (`tokenizer.json`, `preprocessor_config.json`, `video_preprocessor_config.json`, `chat_template.json`, entre otros) se copiaron byte a byte desde `llava-hf/llava-onevision-qwen2-0.5b-ov-hf`, de modo que el pipeline de preprocesado es identico al del modelo real.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se aceptaron porque superaron la puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplazo los logits al menos 0.001 (la mas debil, `pixel_values:halve`, produjo 0.302). Los tensores conservan los mismos nombres que el checkpoint original y el modelo es finito en float32, bfloat16 y float16 (forward, loss y gradientes). El artefacto incluye un manifiesto de contrato (`integration.json`), documentacion de uso en Transformers y un registro de procedencia (`build.json`) con fuentes fijadas y hashes.

## Capacidades

- No es un modelo funcional: no genera texto, razonamiento, codigo ni descripciones de imagenes con calidad util.
- Reproduce el contrato de entrada/salida de LLaVA-OneVision Qwen2 0.5B: acepta `pixel_values`, `input_ids`, `attention_mask` y parametros de generacion propios de la arquitectura.
- Conserva los ficheros de procesador del modelo base, por lo que valida tokenizacion, plantilla de chat y preprocesado de imagen y video.
- Sirve para verificar la carga de la arquitectura en Transformers y en frameworks compatibles con vLLM.
- Permite comprobar nombres y formas de tensores frente al checkpoint real.
- No dispone de tool calling, capacidades de agente ni modo de razonamiento, ya que los pesos son aleatorios.

## Casos de uso

- Pruebas de integracion en CI: cargar el fixture en Transformers y verificar que `LlavaOnevisionForConditionalGeneration` se instancia y ejecuta un forward con formas correctas, sin descargar los 0.5B parametros reales.
- Validacion de compatibilidad con vLLM: comprobar que el parser de configuracion y el cargador de pesos aceptan la arquitectura y los nombres de tensores antes de probar con el checkpoint completo.
- Verificacion de contratos de entrada: ejecutar perturbaciones sobre `pixel_values` e `input_ids` y comprobar que los logits cambian, tal como exige la puerta de sensibilidad del fixture.
- Pruebas de regresion de procesadores: validar que los ficheros de tokenizer, preprocessor y video preprocessor copiados del modelo base siguen produciendo las mismas salidas tras cambios en el codigo.
- Desarrollo de pipelines multimodales sin GPU: al ocupar 0.0 GB y ~10M parametros, permite iterar en entornos con recursos minimos o sin acelerador.
- Documentacion y ejemplos ejecutables: el repositorio incluye `integrations/transformers/usage.md` y `expectations` para demostrar el uso esperado del modelo real en articulos o tutoriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K, benchmarks multimodales) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en float16 para los ~10M parametros del fixture; el modelo base real de 0.5B requiere aproximadamente 1-2 GB en float16 segun el codificador visual y el contexto.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM para el fixture; para el modelo base, una RTX 3060 o superior resulta suficiente.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna e incluso en CPU.
- Opciones de despliegue: Transformers (uso documentado en el repositorio), vLLM (objetivo declarado del fixture) y, en principio, cualquier framework que soporte `LlavaOnevisionForConditionalGeneration`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/llava-onevision-qwen2-vllm-mic` (este) | 9.962.112 (fixture) | no disponible | Fixture de pruebas | no disponible | Hugging Face |
| `llava-hf/llava-onevision-qwen2-0.5b-ov-hf` | 0.5B | no disponible | Modelo multimodal imagen-texto real | no disponible | Hugging Face |
| `llava-hf/llava-onevision-qwen2-7b-ov-hf` | 7B | no disponible | Modelo multimodal imagen-texto de mayor capacidad | no disponible | Hugging Face |

La comparacion relevante es con el modelo base: este repositorio no compite en capacidad, sino que replica su arquitectura y procesador a escala reducida para pruebas. Frente al checkpoint de 0.5B, el fixture elimina la utilidad de inferencia pero reduce el coste de almacenamiento y carga en varios ordenes de magnitud.

## Limitaciones y advertencias

- Pesos aleatorios: las salidas no tienen significado; no usar para inferencia, evaluacion ni produccion.
- Etiquetado como `test-artifact` precisamente para excluirlo de busquedas de modelos candidatos.
- La licencia no esta declarada en la informacion disponible; verificar la del modelo base antes de cualquier uso derivado.
- No se han publicado datos de sesgos, alucinacion o limitaciones linguisticas, y no serian aplicables a un fixture.
- La configuracion reducida (2 capas visuales y 2 de texto) no representa el comportamiento numerico del modelo real, solo su contrato estructural.
- El repositorio depende de scripts externos (`build_fixtures.py`, `sweep.py`) para reconstruir ficheros auxiliares; la reproducibilidad requiere esas fuentes fijadas en `build.json`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/llava-onevision-qwen2-vllm-mic
- Modelo base: https://huggingface.co/llava-hf/llava-onevision-qwen2-0.5b-ov-hf
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/llava-onevision-qwen2-vllm-mic/blob/main/integration.json
- Uso en Transformers: https://huggingface.co/huggingface-mic/llava-onevision-qwen2-vllm-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/llava-onevision-qwen2-vllm-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/llava-onevision-qwen2-vllm-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/llava-onevision-qwen2-vllm-mic.html
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
