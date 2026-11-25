# huggingface-mic/Qwen3-VL-2B-Instruct-mic

## Resumen

`huggingface-mic/Qwen3-VL-2B-Instruct-mic` no es un modelo funcional, sino un fixture de pruebas (test artifact) construido por el equipo de Hugging Face (organizacion `huggingface-mic`) para validar la integracion de arquitecturas vision-lenguaje en Transformers. Se deriva del checkpoint real `Qwen/Qwen3-VL-2B-Instruct` mediante un proceso de "shrink" generico que reduce la configuracion a 2 capas ocultas de texto, conservando la misma clase de arquitectura (`Qwen3VLForConditionalGeneration`) y los mismos nombres de tensores que el modelo original.

El artefacto contiene 11.177.792 parametros con pesos aleatorios (semilla 17), guardados en float32 y bfloat16 segun la variante, y ocupa 0,1 GB en el repositorio. Los ficheros de procesador (tokenizer, chat template, preprocessor config, video preprocessor config) se copiaron byte a byte desde el checkpoint original, de modo que el pipeline de preprocesado es identico al de Qwen3-VL-2B-Instruct.

Su relevancia es exclusivamente para desarrollo e infraestructura de pruebas: permite ejecutar inferencia vision-lenguaje y un paso de entrenamiento en CI sin descargar los aproximadamente 2.000 millones de parametros del modelo real, y verificar contratos de API (formas de tensores, dtypes, sensibilidad de entradas) de forma rapida y reproducible. Esta etiquetado como `test-artifact` precisamente para excluirlo de busquedas de modelos candidatos a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3VLForConditionalGeneration (vision-lenguaje, transformer reducido a 2 capas de texto) |
| Parametros totales | 11.177.792 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de la config del checkpoint base, no documentada en la ficha) |
| Tipos de cuantizacion | no disponible (pesos en float32 y bfloat16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-VL-2B-Instruct |
| Tamano del repositorio | 0,1 GB |
| Semilla de pesos | 17 (pesos aleatorios) |
| Dtype de guardado | float32 y bfloat16 (variantes descritas en la model card) |
| Etiquetas | mic, test-artifact |

## Arquitectura y entrenamiento

El fixture replica la arquitectura `Qwen3VLForConditionalGeneration` del checkpoint Qwen3-VL-2B-Instruct, pero con la configuracion de texto reducida a `num_hidden_layers: 2` mediante la regla generica de `sweep.py` del repositorio `huggingface/transformers-mic`. Conserva los mismos nombres de tensores que el checkpoint real, de forma que cualquier codigo que cargue pesos del modelo original puede cargar tambien este sin cambios en las claves del state dict.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron con una "input-sensitivity gate": cada perturbacion de las entradas del contrato debe mover los logits al menos 0,001. La perturbacion mas debil registrada fue `pixel_values:halve` con 0,159 (variante float32) y 0,164 (variante bfloat16). Los ficheros de procesador (`chat_template.json`, `generation_config.json`, `merges.txt`, `preprocessor_config.json`, `tokenizer.json`, `tokenizer_config.json`, `video_preprocessor_config.json`, `vocab.json`) se copiaron byte a byte desde `Qwen/Qwen3-VL-2B-Instruct`. El modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes, lo que lo hace apto para probar un paso de entrenamiento completo.

## Capacidades

- Ejecucion de inferencia vision-lenguaje con la misma interfaz de procesador que Qwen3-VL-2B-Instruct (imagenes, video y texto).
- Validacion de contratos de API de Transformers: formas de tensores, dtypes, nombres de parametros y comportamiento de `pixel_values`.
- Prueba de un paso de entrenamiento (forward, loss, backward) en float32, bfloat16 y float16.
- Verificacion de integraciones de framework mediante el directorio `integrations/transformers/expectations`.
- Reproducibilidad de fixtures: `build.json` registra fuentes fijadas, resultados de la gate y hashes de ficheros.
- No genera texto ni respuestas coherentes: los pesos son aleatorios, por lo que no tiene capacidades cognitivas reales.
- No soporta tool calling, agentes ni razonamiento multietapa de forma funcional.

## Casos de uso

- CI/CD de Transformers: ejecutar tests de integracion de `Qwen3VLForConditionalGeneration` en pipelines de integracion continua sin descargar el checkpoint de 2B parametros, reduciendo tiempo y ancho de banda.
- Desarrollo de kernels y operadores: validar formas y dtypes de tensores de vision-lenguaje con un artefacto de 0,1 GB antes de escalar al modelo real.
- Pruebas de carga de pesos: comprobar que el codigo de `from_pretrained` y el mapeo de state dict funcionan con los mismos nombres de tensor que el checkpoint original.
- Validacion de preprocesado: verificar tokenizer, chat template y preprocessor de imagen/video copiados byte a byte desde Qwen3-VL-2B-Instruct.
- Pruebas de entrenamiento distribuido: ejecutar un paso de entrenamiento con gradientes finitos en float32, bfloat16 y float16 para validar el loop de training.
- Auditoria de contratos de framework: usar `integration.json` y `integrations/transformers/expectations` para comprobar que una version de Transformers cumple el contrato esperado.
- Reproducibilidad de builds: reconstruir el fixture con `python example/build_fixtures.py --fixture Qwen3-VL-2B-Instruct-mic` y comparar hashes con `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un fixture con pesos aleatorios y no produce salidas utiles, por lo que no procede evaluacion de calidad.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para inferencia en float32 (11,2M parametros) y aproximadamente 0,5 GB en bfloat16/float16, sin contar activaciones del procesador de vision.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe holgadamente en cualquier GPU consumer y en entornos CPU-only de CI.
- Opciones de despliegue: Transformers (via `Qwen3VLForConditionalGeneration`), integrable en runners de CI; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles de forma oficial; por el tamano, la latencia sera del orden de milisegundos en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-VL-2B-Instruct-mic | 11,2M | no disponible | Fixture de pruebas | no disponible | Hugging Face |
| Qwen/Qwen3-VL-2B-Instruct | ~2B (no confirmado en la informacion) | no disponible | Modelo vision-lenguaje real | no disponible | Hugging Face |
| Otros fixtures `huggingface-mic` | variable | no disponible | Pruebas de integracion | no disponible | Hugging Face |

La comparativa con modelos de produccion no es significativa: el artefacto no compite en calidad ni rendimiento, solo en fidelidad de contrato de API respecto al checkpoint base.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y las salidas carecen de sentido.
- Etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- Licencia no disponible: no se puede asumir la licencia de Qwen3-VL-2B-Instruct para este artefacto sin verificacion adicional.
- Idiomas soportados no documentados; el tokenizer se hereda del modelo base pero el modelo no genera lenguaje util.
- Riesgo de confusion: usuarios que lo descarguen esperando el modelo Qwen3-VL-2B-Instruct obtendran un artefacto no funcional.
- La configuracion reducida a 2 capas implica que no reproduce el comportamiento numerico del checkpoint real, solo su contrato de formas y nombres.
- No se documentan sesgos, alucinaciones ni limitaciones de contexto porque el modelo no produce texto.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/Qwen3-VL-2B-Instruct-mic
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de sweep: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Explicacion del shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Qwen3-VL-2B-Instruct-mic.html
