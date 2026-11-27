# huggingface-mic-temp/Qwen3-VL-2B-Instruct-vllm-mic

## Resumen

Qwen3-VL-2B-Instruct-vllm-mic es un artefacto de prueba publicado por la organizacion huggingface-mic-temp. No es un modelo utilizable: se trata de un "fixture" o maqueta reducida del modelo real Qwen/Qwen3-VL-2B-Instruct, disenada para validar contratos de integracion (inferencia vision-lenguaje y un paso de entrenamiento) en frameworks compatibles con vLLM y Transformers. El autor lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

El repositorio contiene unicamente pesos reducidos (11.177.856 parametros segun safetensors, frente a los aproximadamente 2.000 millones del modelo base), con la misma arquitectura y los mismos nombres de tensores que el checkpoint original, pero con la configuracion encogida (text num_hidden_layers = 2) y pesos aleatorios generados con semilla 17. Los ficheros de procesador (tokenizer, chat template, preprocessor, video preprocessor) se copian byte a byte del modelo base.

Su relevancia es puramente de ingenieria: permite a los mantenedores de integraciones verificar de forma rapida y reproducible que una implementacion (por ejemplo, la de vLLM) carga, ejecuta forward y realiza un paso de entrenamiento con la firma de tensores y las expectativas de entrada correctas, sin necesidad de descargar ni computar el modelo completo de 2B parametros. No debe emplearse para generacion real, evaluacion de calidad ni despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3VLForConditionalGeneration (transformer vision-lenguaje), configuracion encogida (text num_hidden_layers = 2) |
| Parametros totales | 11.177.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de la config del modelo base, no verificada en este fixture) |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo replica la arquitectura del checkpoint Qwen/Qwen3-VL-2B-Instruct, es decir, un transformer multimodal de la familia Qwen3-VL para generacion condicional con entradas de texto, imagen y video. Sin embargo, la configuracion se ha reducido mediante la regla generica de `sweep.py` del repositorio transformers-mic: el bloque de texto conserva solo 2 capas ocultas. Los nombres de tensores coinciden con los del checkpoint real, lo que garantiza compatibilidad de carga con las mismas herramientas.

No ha habido entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron con una "input-sensitivity gate": cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (la mas debil, `pixel_values:halve`, produce 0,196). El fixture es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. Los ficheros de procesador (`chat_template.json`, `generation_config.json`, `merges.txt`, `preprocessor_config.json`, `tokenizer.json`, `tokenizer_config.json`, `video_preprocessor_config.json`, `vocab.json`) se copian literalmente del modelo base.

## Capacidades

- No dispone de capacidades funcionales reales: al tener pesos aleatorios y solo 2 capas de texto, no genera texto coherente ni responde a instrucciones.
- Sirve como fixture de contrato para validar la carga e inferencia vision-lenguaje en frameworks compatibles (vLLM, Transformers).
- Permite ejecutar un paso de entrenamiento completo (forward, loss, backward) para comprobar la estabilidad numerica en bfloat16 y float16.
- Mantiene la firma exacta de tensores del checkpoint Qwen3-VL-2B-Instruct, lo que valida la compatibilidad de nombres de parametros.
- Conserva los ficheros de tokenizer y preprocesado del modelo base, por lo que las rutas de tokenizacion y preprocesado de imagen/video pueden probarse.
- No soporta tool calling, agentes, razonamiento ni capacidades multilingues reales.

## Casos de uso

- Pruebas de integracion de vLLM: verificar que la version de vLLM en desarrollo carga un checkpoint Qwen3-VL con la firma de tensores esperada y ejecuta inferencia sin errores de forma o dtype.
- Validacion de contratos en Transformers: comprobar que la clase Qwen3VLForConditionalGeneration instancia el modelo, procesa entradas de imagen y texto, y produce logits con la forma correcta.
- CI/CD de librerias de inferencia: usar el fixture como caso de prueba ligero (11,2 M de parametros) en pipelines de integracion continua sin incurrir en descargas de gigabytes.
- Pruebas de estabilidad numerica: ejecutar forward, loss y gradientes en float32, bfloat16 y float16 para detectar NaN o infinitos en kernels nuevos.
- Verificacion de preprocesado multimodal: validar que el tokenizer, el chat template y los preprocesadores de imagen y video se cargan y aplican correctamente con los ficheros copiados del modelo base.
- Desarrollo de harnesses de evaluacion: como sustituto barato del modelo real en pruebas de humo (smoke tests) de pipelines de evaluacion antes de lanzar el modelo completo.
- Reproduccion de builds: reconstruir el fixture con `python example/build_fixtures.py --fixture Qwen3-VL-2B-Instruct-vllm-mic` y comparar hashes con `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 dado el tamano de 11,2 M de parametros; el cuello de botella real sera el codigo de la arquitectura y los buffers de procesado, no los pesos.
- GPU recomendadas: cualquier GPU moderna con soporte de bfloat16 (A100, H100, RTX 4090, RTX 3090, L4, T4).
- Cabe en cualquier GPU consumer, incluida una GTX 1650 o una iGPU con suficiente memoria compartida; tambien puede ejecutarse en CPU.
- Opciones de despliegue: Transformers (con `trust_remote_code` segun la version) y vLLM, que es el framework objetivo del contrato. No se documenta soporte de llama.cpp, Ollama ni TGI para este fixture.
- Latencia y throughput: no disponibles; al ser un artefacto de prueba carecen de interes practico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Proposito |
|---|---|---|---|---|---|
| Qwen3-VL-2B-Instruct-vllm-mic | 11,2 M (encogido) | no disponible | Fixture de prueba | no disponible | Validacion de contratos de integracion |
| Qwen/Qwen3-VL-2B-Instruct | ~2.000 M (modelo base) | no disponible en esta ficha | Modelo vision-lenguaje real | no disponible en esta ficha | Inferencia y ajuste reales |
| Otros fixtures de transformers-mic | Variable (encogidos) | no disponible | Fixture de prueba | no disponible | Validacion de contratos por arquitectura |

La comparativa relevante es contra el modelo base: este fixture comparte arquitectura, nombres de tensores y ficheros de procesador, pero sustituye los pesos entrenados por pesos aleatorios y reduce la profundidad del bloque de texto a 2 capas.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la red tiene solo 2 capas de texto; cualquier salida sera ruido.
- Etiquetado como `test-artifact` por el autor para excluirlo de busquedas de modelos candidatos; no debe tratarse como candidato para produccion.
- La licencia no esta declarada en la informacion disponible, por lo que no puede confirmarse el uso comercial; en cualquier caso, al derivar del modelo base Qwen, las condiciones reales dependerian de la licencia de Qwen/Qwen3-VL-2B-Instruct.
- El repositorio tiene 0 descargas y 0 likes, y un tamano de 0,0 GB segun metadatos; es un artefacto interno de pruebas.
- No se han verificado capacidades multilingues, de contexto largo ni de tool calling en este fixture.
- Riesgo de confusion: el nombre incluye "Qwen3-VL-2B-Instruct" pero el contenido no corresponde al modelo real; verificar siempre el ID completo antes de descargar.
- No apto para evaluaciones de calidad, benchmarks de rendimiento ni comparativas de capacidad con modelos reales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic-temp/Qwen3-VL-2B-Instruct-vllm-mic
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Explicacion del proceso de reduccion (shrink): https://huggingface-mic-mic-coverage.static.hf.space/shrink/Qwen3-VL-2B-Instruct-vllm-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de barrido (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Manifiesto de contrato (`integration.json`): https://huggingface.co/huggingface-mic-temp/Qwen3-VL-2B-Instruct-vllm-mic/blob/main/integration.json
- Uso con Transformers (`usage.md`): https://huggingface.co/huggingface-mic-temp/Qwen3-VL-2B-Instruct-vllm-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic-temp/Qwen3-VL-2B-Instruct-vllm-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture (`build.json`): https://huggingface.co/huggingface-mic-temp/Qwen3-VL-2B-Instruct-vllm-mic/blob/main/build.json
