# huggingface-mic-temp/LLaVA-NeXT-Video-7B-hf-vllm-mic

## Resumen

LLaVA-NeXT-Video-7B-hf-vllm-mic es un artefacto de prueba (test fixture) publicado por la organizacion huggingface-mic-temp. No es un modelo utilizable en produccion: se trata de una version "reducida" (slim) del checkpoint real llava-hf/LLaVA-NeXT-Video-7B-hf, generada para validar contratos de integracion de frameworks (transformers, vLLM) sin necesidad de descargar ni ejecutar los pesos completos de 7B. El repositorio incluye pesos reducidos, ejemplos de uso ejecutables y un directorio de expectativas del framework.

El modelo base real, LLaVA-NeXT-Video-7B-hf, es un modelo vision-lenguaje multimodal capaz de procesar video e imagenes junto con texto. Este fixture conserva la misma arquitectura declarada (LlavaNextVideoForConditionalGeneration) y los mismos nombres de tensores, pero con una configuracion drasticamente reducida: 2 capas en el encoder de vision y 2 capas en el modelo de texto, lo que resulta en 4.336.640 parametros totales (frente a los aproximadamente 7.000 millones del modelo original).

La relevancia de esta ficha es fundamentalmente documental y de cautela: cualquier desarrollador que encuentre este repositorio en el Hub debe saber que las etiquetas `mic` y `test-artifact` lo excluyen explicitamente de la busqueda de modelos candidatos, y que sus pesos son aleatorios (semilla 17), no entrenados. Se publica bajo el identificador de la organizacion huggingface-mic-temp con fecha de creacion del 26 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlavaNextVideoForConditionalGeneration (transformer multimodal vision-lenguaje, variante reducida) |
| Parametros totales | 4.336.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura LlavaNextVideoForConditionalGeneration del checkpoint base llava-hf/LLaVA-NeXT-Video-7B-hf, pero con la configuracion reducida mediante la regla generica de sweep.py: 2 capas ocultas en el modulo de vision y 2 capas ocultas en el modulo de texto. Mantiene exactamente los mismos nombres de tensores que el checkpoint real, de modo que cualquier codigo que espere la arquitectura original puede cargarlo sin cambios en la estructura. Los archivos de procesador (tokenizer, preprocessor_config, video_preprocessor_config, chat_template, generation_config, etc.) se copiaron byte a byte desde el modelo original.

No hubo entrenamiento. Los pesos son aleatorios, generados con semilla 17, y se aceptaron porque superaron la puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplazo los logits al menos 0,001 (el caso mas debil, `pixel_values_videos:halve`, produjo 0,0161). El modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El fixture se construyo con build_fixtures.py y su procedencia (fuentes fijadas, resultados de la puerta y hashes de archivos) queda registrada en build.json. La clave del fixture es `b72516abbe74`.

## Capacidades

- Generacion multimodal video+texto segun el contrato declarado (LLaVA-NeXT-Video video+text generation, compatible con vLLM).
- Carga en transformers y en vLLM con la misma interfaz que el modelo base real.
- Conserva el tokenizer, chat template y preprocesadores del modelo original, por lo que el pipeline de entrada es identico.
- No dispone de capacidades funcionales reales: al tener pesos aleatorios, no genera respuestas coherentes ni razona.
- No soporta tool calling, agentes ni multi-step reasoning de forma efectiva (pesos no entrenados).
- Capacidades multilingues: no disponibles (dependen de los pesos, que son aleatorios).
- Modo thinking, vision real o audio: no disponible.

## Casos de uso

- Validacion de contratos de integracion: sirve para comprobar que una version de transformers o de vLLM carga correctamente la arquitectura LlavaNextVideoForConditionalGeneration y respeta los nombres de tensores y archivos de procesador, sin descargar 7B parametros.
- Pruebas de CI/CD en pipelines de integracion: al ocupar 0,0 GB y tener 4,3M parametros, se puede incluir en tests automatizados de carga, forward y exportacion de forma rapida y barata.
- Verificacion de preprocesado de video: los archivos video_preprocessor_config.json y preprocessor_config.json son identicos a los del modelo real, por lo que permite testear el pipeline de entrada de video sin pesos grandes.
- Desarrollo de wrappers y SDKs: util para comprobar que una capa de abstraccion (por ejemplo, un cliente de inferencia) maneja correctamente la firma de entradas y salidas del modelo multimodal.
- Reproduccion de bugs de framework: permite aislar problemas de carga o de forward en transformers/vLLM que no dependan de los pesos, con un coste de computo minimo.
- Formacion y documentacion: ejemplo didactico de como se estructura un repositorio de modelo multimodal con contrato, manifest de integracion y expectativas de framework.
- No es adecuado para atencion al cliente, generacion de codigo, analisis de video real ni ninguna tarea de inferencia productiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K, benchmarks multimodales) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (4,3M parametros); en la practica, cabe en CPU.
- GPU recomendadas: ninguna en particular; funciona en cualquier GPU consumer (RTX 3060, RTX 4090) e incluso en CPU.
- Cabe en consumer GPU: si, en todas, y tambien en CPU.
- Opciones de despliegue: transformers y vLLM (segun el contrato declarado); llama.cpp, Ollama y TGI no estan documentados para este fixture.
- Latencia y throughput: no disponibles; al ser un modelo diminuto con pesos aleatorios, las cifras no serian representativas del modelo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| LLaVA-NeXT-Video-7B-hf-vllm-mic (este) | 4,3M | no disponible | no disponible | Fixture de test, pesos aleatorios |
| llava-hf/LLaVA-NeXT-Video-7B-hf | ~7B (no confirmado en la informacion) | no disponible | no disponible | Modelo real vision-video-lenguaje |
| Otros fixtures de la familia MIC | no disponible | no disponible | no disponible | Validacion de contratos de framework |

La comparativa relevante es exclusivamente con su modelo base: el fixture comparte arquitectura, procesadores y nombres de tensores, pero no pesos entrenados ni capacidades. Frente a alternativas reales de la misma categoria (modelos vision-video-lenguaje de ~7B), no es comparable en rendimiento porque no ejecuta tareas reales.

## Limitaciones y advertencias

- Pesos aleatorios (semilla 17): el modelo no ha sido entrenado y no produce salidas coherentes; cualquier uso como modelo real es un error.
- Es un artefacto de prueba etiquetado `test-artifact` y `mic`, disenado para quedar fuera de la busqueda de modelos candidatos.
- Licencia no disponible: no se puede asumir uso comercial ni redistribucion sin consultar la licencia del modelo base.
- Idiomas y contexto no disponibles: dependen de los pesos y de la configuracion del modelo original, no del fixture.
- Riesgo de confusion: el nombre incluye "LLaVA-NeXT-Video-7B" pero el repositorio solo contiene 4,3M parametros; verificar siempre el tamano antes de integrarlo.
- No apto para produccion, atencion al cliente, generacion de codigo ni ninguna tarea de inferencia real.
- Los archivos de procesador son identicos al modelo base, pero eso no garantiza que el comportamiento de inferencia coincida.
- Para reconstruir el resto de archivos hay que ejecutar `python example/build_fixtures.py --fixture LLaVA-NeXT-Video-7B-hf-vllm-mic`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic-temp/LLaVA-NeXT-Video-7B-hf-vllm-mic
- Modelo base: https://huggingface.co/llava-hf/LLaVA-NeXT-Video-7B-hf
- Manifest de contrato: integration.json (en el repositorio)
- Uso con transformers: integrations/transformers/usage.md (en el repositorio)
- Expectativas de transformers: integrations/transformers/expectations (en el repositorio)
- Procedencia del fixture: build.json (en el repositorio)
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/LLaVA-NeXT-Video-7B-hf-vllm-mic.html
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
