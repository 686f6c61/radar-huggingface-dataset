# huggingface-mic/GLM-OCR-mic

## Resumen

GLM-OCR-mic es un artefacto de prueba publicado por la organizacion huggingface-mic, no un modelo utilizable. Se trata de un *fixture* de 8.810.112 parametros construido para cubrir el modelo base `zai-org/GLM-OCR`, un modelo vision-lenguaje orientado a reconocimiento optico de caracteres (OCR) y conversion de imagen a texto. El repositorio empaqueta pesos reducidos, ejemplos de uso ejecutables y las expectativas de integracion con Transformers en un unico lugar.

La relevancia de este artefacto es exclusivamente de ingenieria: sirve como banco de pruebas ligero para validar la integracion de la arquitectura `GlmOcrForConditionalGeneration` en la libreria Transformers, con los mismos nombres de tensores que el checkpoint real y los ficheros de procesador copiados byte a byte desde el modelo original. Los pesos son aleatorios (semilla 17) y no han sido entrenados; el autor lo etiqueta explicitamente como `test-artifact` para mantenerlo fuera de las busquedas de modelos candidatos.

Por tanto, no debe emplearse para inferencia real, produccion ni evaluacion de calidad. Su interes radica en que documenta el contrato de integracion (manifiesto `integration.json`, uso en Transformers, expectativas del framework y procedencia del fixture) y permite reproducir pruebas unitarias de la arquitectura sin descargar el checkpoint completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlmOcrForConditionalGeneration (vision-lenguaje, config reducida: text num_hidden_layers 2) |
| Parametros totales | 8.810.112 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32 y bfloat16 segun la variante del fixture) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del modelo base `zai-org/GLM-OCR`, un modelo condicional de generacion imagen-a-texto (`GlmOcrForConditionalGeneration`), pero con una configuracion reducida: el bloque de texto se limita a 2 capas ocultas mediante la regla generica de reduccion de `sweep.py`. Los ficheros del procesador (`chat_template.jinja`, `generation_config.json`, `preprocessor_config.json`, `processor_config.json`, `tokenizer.json`, `tokenizer_config.json`) se copian byte a byte desde el checkpoint original, de modo que el pipeline de preprocesado y tokenizacion es identico al real.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y superaron una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplazo los logits al menos 0,001 (la mas debil, `pixel_values:roll_batch`, 0,0823). El fixture conserva los mismos nombres de tensores que el checkpoint real, se guarda en float32 (la variante principal) o bfloat16 (variante secundaria, clave `3c8ab8427a38`) y es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El build queda registrado en `build.json` con fuentes fijadas, resultados de las puertas y hashes de ficheros.

## Capacidades

- Ninguna capacidad funcional real: los pesos son aleatorios y no producen salidas con sentido.
- Sirve como fixture de pruebas para validar la carga del modelo, el preprocesado de imagenes y la tokenizacion con la arquitectura `GlmOcrForConditionalGeneration`.
- Permite comprobar la compatibilidad de nombres de tensores y la paridad de configuracion con el checkpoint `zai-org/GLM-OCR`.
- Verifica la estabilidad numerica en float32, bfloat16 y float16 (forward, loss y gradientes).
- No soporta tool calling, agentes ni razonamiento multietapa de forma utilizable.
- No dispone de capacidades multilingues evaluables.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture con `AutoModelForConditionalGeneration` y verificar que la arquitectura `GlmOcrForConditionalGeneration` se instancia y ejecuta sin errores antes de probar con el checkpoint completo.
- CI/CD de la libreria: ejecutar tests unitarios de forward, loss y backward en float32, bfloat16 y float16 con un repositorio de 0,1 GB, reduciendo tiempos y ancho de banda frente al modelo real.
- Validacion de preprocesado: comprobar que `preprocessor_config.json` y `processor_config.json` producen tensores de entrada con las formas esperadas, usando los ficheros copiados byte a byte del modelo original.
- Verificacion de paridad de tensores: comparar los nombres de tensores del fixture con los del checkpoint real para detectar regresiones en el mapeo de pesos.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture GLM-OCR-mic` y contrastar hashes y resultados de las puertas registrados en `build.json`.
- Desarrollo de harnesses de evaluacion: disponer de un modelo ligero con la misma interfaz que GLM-OCR para probar el codigo de orquestacion de pipelines de OCR sin depender de pesos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad carece de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (8,8 M de parametros) y aproximadamente 0,02 GB en bfloat16 para los pesos; el consumo real dependera del preprocesado de imagen.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) es suficiente; tambien funciona en CPU.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: Transformers (via `integrations/transformers/usage.md`); no se documentan opciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-OCR-mic | 8.810.112 | no disponible | Fixture de pruebas | no disponible | Hugging Face (huggingface-mic) |
| zai-org/GLM-OCR | no disponible | no disponible | OCR imagen-a-texto | no disponible | Hugging Face (zai-org) |
| Alternativas OCR de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion significativa es con su modelo base `zai-org/GLM-OCR`: el fixture comparte arquitectura, procesador y nombres de tensores, pero sustituye los pesos entrenados por pesos aleatorios y reduce el bloque de texto a 2 capas. No se dispone de datos sobre otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen sentido; el autor lo etiqueta como `test-artifact`.
- No debe desplegarse en produccion ni usarse para evaluar calidad, sesgos o capacidades reales.
- La configuracion esta reducida (2 capas de texto), por lo que el comportamiento numerico no reproduce el del checkpoint completo.
- Licencia no declarada: no hay garantia de condiciones de uso comercial.
- Idiomas soportados no documentados.
- Longitud de contexto no documentada.
- El fixture cubre solo checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras la reduccion; cambios en el modelo base pueden invalidarlo.
- La reproducibilidad depende de las fuentes fijadas en `build.json` y de la version de `transformers-mic`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/GLM-OCR-mic
- Modelo base: https://huggingface.co/zai-org/GLM-OCR
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/GLM-OCR-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
