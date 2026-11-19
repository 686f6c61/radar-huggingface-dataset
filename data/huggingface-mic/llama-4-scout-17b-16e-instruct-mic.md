# huggingface-mic/Llama-4-Scout-17B-16E-Instruct-mic

## Resumen

`huggingface-mic/Llama-4-Scout-17B-16E-Instruct-mic` no es un modelo utilizable, sino un artefacto de prueba (fixture) de 44,7 millones de parametros construido por el equipo de `huggingface-mic` para validar la integracion de la arquitectura Llama 4 Scout en el ecosistema Transformers. Deriva del checkpoint `RedHatAI/Llama-4-Scout-17B-16E-Instruct` mediante un proceso de reduccion (shrink) documentado en `sweep.py`, que conserva la estructura de la arquitectura `Llama4ForConditionalGeneration` pero reduce el numero de capas del codificador de vision a 2 y del decodificador de texto a 4.

El objetivo del repositorio es empaquetar en un unico lugar los pesos reducidos, ejemplos de uso ejecutables y las expectativas que el framework debe cumplir al cargar el modelo (manifiesto de contrato en `integration.json`). Los pesos son aleatorios (semilla 17) y no han sido entrenados: superaron una puerta de sensibilidad de entrada segun la cual cualquier perturbacion de las entradas del contrato desplaza los logits al menos 0,001, lo que basta para validar rutas de codigo sin necesidad de entrenamiento.

Es relevante ahora porque permite a desarrolladores de Transformers probar la carga, el procesamiento multimodal y la propagacion hacia delante de Llama 4 Scout con un repositorio de 0,2 GB en lugar de los cientos de gigabytes del checkpoint original. El autor lo etiqueta explicitamente como `test-artifact` para excluirlo de las busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Llama4ForConditionalGeneration` (transformer multimodal, vision + texto) |
| Parametros totales | 44.667.200 |
| Parametros activos | no disponible (el checkpoint original es MoE 17B-16E; el fixture no conserva esa escala) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repo copia `LICENSE`, `NOTICE` y `USE_POLICY.md` del modelo base, pero la licencia no se declara en los metadatos) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura multimodal de Llama 4 Scout: un codificador de vision seguido de un decodificador de texto de tipo transformer causal, empaquetados en la clase `Llama4ForConditionalGeneration`. La reduccion aplica la regla generica de `sweep.py`: 2 capas en el modulo de vision y 4 capas en el de texto, manteniendo los mismos nombres de tensores que el checkpoint real para que las rutas de carga de Transformers se ejerciten de forma identica.

No hubo entrenamiento. Los pesos se inicializan aleatoriamente con semilla 17 y se guardan en bfloat16, el dtype por defecto con el que carga `RedHatAI/Llama-4-Scout-17B-16E-Instruct`. Se verifico que el modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. Los ficheros de procesador (`tokenizer.json`, `tokenizer.model`, `chat_template.json`, `preprocessor_config.json`, `processor_config.json`, `special_tokens_map.json`, `generation_config.json`, entre otros) se copian byte a byte del modelo base, de modo que la tokenizacion y el preprocesado multimodal son los reales. El repositorio incluye `build.json` con las fuentes fijadas, los resultados de las puertas de validacion y los hashes de los ficheros.

## Capacidades

- Carga y ejecucion de la arquitectura Llama 4 Scout en Transformers (forward, loss y gradientes).
- Procesamiento multimodal de entrada (texto e imagenes) mediante los ficheros de procesador reales del modelo base.
- Tokenizacion y plantilla de chat identicas a las de `RedHatAI/Llama-4-Scout-17B-16E-Instruct`.
- Validacion de contratos de integracion: el manifiesto `integration.json` define entradas y salidas esperadas.
- Pruebas de sensibilidad de entradas: perturbaciones como `pixel_values:halve` desplazan los logits al menos 0,317.
- No genera texto coherente, no razona, no escribe codigo ni soporta tool calling: los pesos son aleatorios.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture para verificar que `Llama4ForConditionalGeneration` se instancia, acepta entradas multimodales y produce logits con las mismas formas que el checkpoint real, sin descargar cientos de gigabytes.
- CI/CD de librerias de inferencia: usar el repo de 0,2 GB como fixture en pipelines que validen rutas de carga de safetensors, mapeo de nombres de tensores y compatibilidad de dtype.
- Desarrollo de kernels y optimizaciones: probar kernels de atencion o de capas lineales contra una configuracion reducida antes de escalar al modelo completo.
- Validacion de preprocesado multimodal: al copiar los ficheros de procesador byte a byte, sirve para comprobar que el pipeline de imagenes y la plantilla de chat producen las mismas entradas que el modelo base.
- Pruebas de cuantizacion y exportacion: verificar que las herramientas de conversion (por ejemplo, a GGUF) manejan correctamente los nombres de tensores y la configuracion reducida.
- Regresion de frameworks: fijar el fixture como referencia estable (clave `841a5a8db403`) para detectar cambios incompatibles en versiones nuevas de Transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (44,7 M de parametros, unos 89 MB de pesos) mas el overhead de activaciones y del procesador de vision.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe holgadamente en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: Transformers (ruta soportada y documentada en `integrations/transformers/usage.md`); otras opciones como vLLM, llama.cpp, Ollama o TGI no estan documentadas para este fixture.
- Latencia y throughput: no disponibles; al ser un artefacto de prueba no se han medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/Llama-4-Scout-17B-16E-Instruct-mic` | 44,7 M (fixture) | no disponible | Pruebas de integracion | no disponible | Publico en HF |
| `RedHatAI/Llama-4-Scout-17B-16E-Instruct` | 17B activos, 16 expertos (MoE) | no disponible en la informacion | Inferencia real multimodal | no disponible | Publico en HF |
| `meta-llama/Llama-4-Scout-17B-16E-Instruct` | 17B activos, 16 expertos (MoE) | no disponible en la informacion | Inferencia real multimodal | Llama 4 Community License (no confirmado en la informacion) | Publico en HF |

La comparacion relevante es con el checkpoint del que deriva: el fixture no compite en calidad ni rendimiento, solo replica la estructura para pruebas. Frente a otros fixtures de la serie `huggingface-mic`, el criterio de eleccion depende de la arquitectura que se quiera validar.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no produce texto ni predicciones con sentido; cualquier uso como modelo generativo es invalido.
- Es un artefacto de prueba etiquetado `test-artifact`; no debe desplegarse en produccion ni incluirse en busquedas de modelos candidatos.
- Los metadatos no declaran licencia ni idiomas; los ficheros `LICENSE`, `NOTICE` y `USE_POLICY.md` copiados del modelo base imponen las condiciones del checkpoint original, que deben revisarse antes de cualquier redistribucion.
- La configuracion reducida (2 capas de vision, 4 de texto) no representa el comportamiento numerico del modelo real: los resultados de pruebas de rendimiento o calidad no son extrapolables.
- El contexto maximo y el soporte multilingue no estan documentados en la informacion disponible.
- Riesgo de confusion: el nombre incluye "17B-16E" pero el fixture tiene 44,7 M de parametros; conviene verificar el tamano antes de planificar recursos.
- No hay garantia de mantenimiento ni de compatibilidad futura con versiones de Transformers.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Llama-4-Scout-17B-16E-Instruct-mic
- Modelo base: https://huggingface.co/RedHatAI/Llama-4-Scout-17B-16E-Instruct
- Documentacion de reduccion del fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Llama-4-Scout-17B-16E-Instruct-mic.html
- Script de barrido (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
