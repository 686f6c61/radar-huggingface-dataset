# huggingface-mic-temp/Ministral-3-3B-Instruct-2512-vllm-mic

## Resumen

`Ministral-3-3B-Instruct-2512-vllm-mic` es un artefacto de prueba (fixture) publicado por la cuenta `huggingface-mic-temp`, no un modelo utilizable. Se construye a partir de `mistralai/Ministral-3-3B-Instruct-2512` mediante un proceso de reduccion ("shrinking") que conserva la arquitectura `Mistral3ForConditionalGeneration` pero recorta el numero de capas tanto en el codificador de vision como en el decodificador de texto, dejando un total de 8.607.168 parametros. Los pesos son aleatorios (semilla 17), no entrenados.

Su proposito es servir como contrato ejecutable para validar integraciones con frameworks (en este caso, vLLM) sin necesidad de descargar el checkpoint completo de 3B. Los ficheros de procesador (tokenizer, chat template, generation config, etc.) se copian byte a byte del modelo original, de modo que las expectativas de comportamiento del pipeline coinciden con las del modelo real.

Es relevante unicamente en el contexto de desarrollo y pruebas de infraestructura (CI de transformers-mic, vLLM, etc.). No debe emplearse para inferencia real, generacion de texto ni ninguna tarea de produccion. La model card lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral3ForConditionalGeneration (transformer multimodal imagen-texto) |
| Parametros totales | 8.607.168 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del modelo base `Mistral3ForConditionalGeneration`, un transformer multimodal disenado para tareas imagen-texto. La configuracion se ha reducido mediante la regla generica de `sweep.py`: 2 capas ocultas en la torre de vision y 2 capas ocultas en el decodificador de texto. Los nombres de tensores coinciden con los del checkpoint real, lo que permite validar codigo de carga y ejecucion sin cambios estructurales.

No hay entrenamiento. Los pesos son aleatorios con semilla 17 y superaron un test de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (la mas debil, `pixel_values:reverse`, con 0,127). El modelo es finito en float32, bfloat16 y float16 tanto en forward como en perdida y gradientes. Los ficheros de procesador (`SYSTEM_PROMPT.txt`, `chat_template.jinja`, `generation_config.json`, `params.json`, `processor_config.json`, `tekken.json`, `tokenizer.json`, `tokenizer_config.json`) se copian byte a byte del modelo original.

## Capacidades

- No tiene capacidades reales de generacion: los pesos son aleatorios y el modelo no ha sido entrenado.
- Sirve como contrato de integracion: valida que vLLM y transformers cargan y ejecutan correctamente la arquitectura Mistral3 con los mismos nombres de tensores y ficheros de procesador que el modelo real.
- Permite verificar el pipeline multimodal imagen-texto (procesado de `pixel_values`, tokenizer Tekken, chat template) sin descargar el checkpoint de 3B.
- Util para pruebas de CI/CD de frameworks que integran modelos Mistral3.
- No soporta tool calling, agentes, razonamiento ni capacidades multilingues en sentido funcional.

## Casos de uso

- Pruebas de integracion en vLLM: el fixture permite ejecutar el pipeline de carga, tokenizacion y forward de Mistral3 en vLLM sin descargar el modelo de 3B, reduciendo tiempo y ancho de banda en CI.
- Validacion de transformers-mic: se usa para comprobar que las expectativas de framework (directorio `integrations/transformers/expectations`) se cumplen tras cambios en la libreria.
- Regresion de contratos de procesador: al copiar los ficheros de procesador byte a byte, cualquier cambio en el tokenizer, chat template o generation config del modelo base se detecta comparando hashes.
- Desarrollo de codigo de carga de safetensors: al compartir nombres de tensores con el checkpoint real, sirve para depurar rutinas de `from_pretrained` y mapeo de pesos.
- Pruebas de dtype: permite verificar comportamiento en float32, bfloat16 y float16 sin coste de memoria del modelo completo.
- Validacion de pipelines multimodales: util para comprobar el flujo de `pixel_values` y su sensibilidad en el grafo de computo.
- Generacion de fixtures derivados: el script `build_fixtures.py` puede reconstruir este y otros fixtures a partir de las fuentes fijadas en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con 8,6M parametros en bfloat16 (aproximadamente 17 MB de pesos) mas overhead de activaciones y KV cache, que es despreciable.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU es suficiente.
- Cabe en cualquier GPU consumer y en la mayoria de entornos CPU.
- Opciones de despliegue: vLLM (objetivo principal del fixture), transformers, y potencialmente llama.cpp u Ollama si se convierte a GGUF, aunque no es el proposito.
- Latencia y throughput: no disponibles; al ser un fixture, no se han medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia |
|---|---|---|---|---|
| Ministral-3-3B-Instruct-2512-vllm-mic (este) | 8,6M | no disponible | Fixture de test | no disponible |
| mistralai/Ministral-3-3B-Instruct-2512 | ~3B (segun nombre) | no disponible | Modelo instruct multimodal real | no disponible en la informacion |
| Otros fixtures de transformers-mic | variable | no disponible | Pruebas de integracion | no disponible |

La comparativa con modelos reales no es significativa: este artefacto no compite en calidad ni rendimiento, solo en fidelidad estructural con el modelo base.

## Limitaciones y advertencias

- Pesos aleatorios: cualquier salida generada es ruido; no usar para inferencia, evaluacion ni produccion.
- Etiquetado como `test-artifact`: excluido intencionadamente de busquedas de modelos candidatos.
- Licencia no disponible: no se puede asumir uso comercial; ademas, al derivar de `mistralai/Ministral-3-3B-Instruct-2512`, habria que consultar la licencia del modelo base.
- Contexto, idiomas y cuantizaciones no disponibles en la informacion proporcionada.
- El fixture solo cubre checkpoints con ficheros de procesador byte-identicos y config coincidente tras el shrink (clave `0ecff5a6afc5`); no representa variantes con otro procesador.
- No apto para benchmarks de calidad, alucinacion o sesgos: no hay comportamiento aprendido que medir.
- Repositorio de 0,1 GB y 0 descargas/likes: sin comunidad ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic-temp/Ministral-3-3B-Instruct-2512-vllm-mic
- Modelo base: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- Contrato de integracion (`integration.json`): https://huggingface.co/huggingface-mic-temp/Ministral-3-3B-Instruct-2512-vllm-mic/blob/main/integration.json
- Uso con transformers: https://huggingface.co/huggingface-mic-temp/Ministral-3-3B-Instruct-2512-vllm-mic/blob/main/integrations/transformers/usage.md
- Expectativas de transformers: https://huggingface.co/huggingface-mic-temp/Ministral-3-3B-Instruct-2512-vllm-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture (`build.json`): https://huggingface.co/huggingface-mic-temp/Ministral-3-3B-Instruct-2512-vllm-mic/blob/main/build.json
- Explicacion del shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Ministral-3-3B-Instruct-2512-vllm-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
