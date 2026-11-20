# huggingface-mic/llava-next-mistral-vllm-mic

## Resumen

`llava-next-mistral-vllm-mic` es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic`, no un modelo utilizable. Se trata de una version reducida del checkpoint multimodal `llava-hf/llava-v1.6-mistral-7b-hf` (LLaVA-Next v1.6 sobre Mistral-7B), generada con el objetivo de validar contratos de integracion con frameworks (en este caso, vLLM) sin necesidad de descargar ni ejecutar los pesos completos del modelo original.

El fixture conserva la arquitectura `LlavaNextForConditionalGeneration` pero reduce la profundidad de las torres de vision y de texto a 2 capas cada una, resultando en 4.328.448 parametros totales. Los pesos son aleatorios (semilla 17) y no han sido entrenados; el autor indica explicitamente que es un "test artifact" etiquetado para excluirlo de busquedas de modelos candidatos. Los ficheros de procesador y tokenizador se copian byte a byte del modelo base para preservar la compatibilidad de la interfaz.

Su relevancia es puramente de ingenieria: sirve para verificar que pipelines de integracion continua, suites de pruebas de transformers o adaptadores de despliegue (como vLLM) manejan correctamente la firma, los nombres de tensores y las expectativas de entrada/salida de LLaVA-Next, sin coste computacional ni de almacenamiento. No debe emplearse para inferencia real, evaluacion de calidad ni uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlavaNextForConditionalGeneration (vision-language, transformer) |
| Parametros totales | 4.328.448 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura LLaVA-Next, que combina un codificador visual con un modelo de lenguaje Mistral-7B mediante proyeccion de embeddings visuales al espacio del texto. En este fixture, el autor ha aplicado una regla generica de reduccion (`sweep.py`) que fija `vision num_hidden_layers = 2` y `text num_hidden_layers = 2`, manteniendo los nombres de tensores identicos a los del checkpoint real y copiando los ficheros de procesador y tokenizador sin modificacion.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron mediante una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (la mas debil, `pixel_values:halve`, produce 0,0491). El modelo se guarda en float16, el dtype por defecto del checkpoint base, y se verifica que es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes.

## Capacidades

- No dispone de capacidades funcionales reales: los pesos son aleatorios y no producen salidas coherentes.
- Conserva la firma de entrada multimodal (texto + `pixel_values`) de LLaVA-Next, util para probar contratos de integracion.
- Mantiene los nombres de tensores del checkpoint original, lo que permite validar cargadores y mapeos de pesos.
- Sirve como fixture para probar tooling de vLLM, transformers y pipelines de CI.
- No soporta tool calling, agentes, razonamiento ni generacion de codigo de forma util.
- Multilingue: no aplicable (no hay comportamiento linguistico real).

## Casos de uso

- Pruebas de integracion en CI: validar que un pipeline de transformers carga correctamente un checkpoint LLaVA-Next sin descargar los 7B parametros reales, reduciendo tiempo y ancho de banda en cada ejecucion.
- Validacion de adaptadores vLLM: comprobar que el motor de inferencia acepta la configuracion y los tensores del contrato antes de desplegar el modelo completo.
- Test de regresion de tokenizador y procesador: al copiarse byte a byte del modelo base, permite verificar que los cambios en el codigo de preprocesado no rompen la interfaz esperada.
- Desarrollo de harness de evaluacion: usar el fixture como caso de prueba para suites que miden sensibilidad a perturbaciones de entrada (gate de logits).
- Documentacion de contratos de modelo: servir de referencia ejecutable de la firma esperada para nuevos contribuidores del proyecto `transformers-mic`.
- Pruebas de compatibilidad de dtypes: verificar comportamiento finito en float32, bfloat16 y float16 en forward, loss y gradientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K, etc.) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float16 (4,3M parametros), aunque el uso real es solo para pruebas de carga.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) es mas que suficiente; tambien funciona en CPU.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: transformers, vLLM (objetivo del fixture), y potencialmente llama.cpp u Ollama si se convierte a GGUF (no documentado).
- Latencia y throughput: no disponibles; irrelevantes por la naturaleza del artefacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia |
|---|---|---|---|---|
| llava-next-mistral-vllm-mic (este) | 4,3M | no disponible | Fixture de test | no disponible |
| llava-hf/llava-v1.6-mistral-7b-hf | ~7B | no disponible | Modelo multimodal real | no disponible |
| Otros fixtures de transformers-mic | variable (reducidos) | no disponible | Pruebas de contrato | no disponible |

La comparativa solo tiene sentido frente al modelo base del que deriva y frente a otros fixtures del mismo proyecto; no es comparable con modelos de produccion por su naturaleza no funcional.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen significado.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe confundirse con un checkpoint real.
- No apto para produccion, evaluacion de calidad ni generacion de contenido.
- Licencia no declarada: no se puede asumir permiso de uso comercial ni redistribucion mas alla del propio fixture.
- Sin informacion sobre sesgos, alucinacion o limitaciones linguisticas porque no hay comportamiento aprendido.
- El repositorio tiene 0 descargas y 0 likes; su mantenimiento depende del proyecto `transformers-mic`.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/llava-next-mistral-vllm-mic
- Modelo base: https://huggingface.co/llava-hf/llava-v1.6-mistral-7b-hf
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Explicacion del shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/llava-next-mistral-vllm-mic.html
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/llava-next-mistral-vllm-mic/blob/main/integration.json
- Uso con transformers: https://huggingface.co/huggingface-mic/llava-next-mistral-vllm-mic/blob/main/integrations/transformers/usage.md
- Expectativas de transformers: https://huggingface.co/huggingface-mic/llava-next-mistral-vllm-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/llava-next-mistral-vllm-mic/blob/main/build.json
