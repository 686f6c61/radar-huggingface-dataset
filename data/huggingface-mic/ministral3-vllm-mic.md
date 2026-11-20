# huggingface-mic/ministral3-vllm-mic

## Resumen

`ministral3-vllm-mic` es un artefacto de prueba publicado por la organizacion `huggingface-mic`, no un modelo utilizable. Se trata de una version "reducida" (slim fixture) del modelo `mistralai/Ministral-3-3B-Instruct-2512`, con solo 8,6 millones de parametros, disenada para validar contratos de integracion y expectativas de frameworks (concretamente vLLM) sin necesidad de cargar los pesos completos del modelo original.

El repositorio combina pesos reducidos, ejemplos de uso ejecutables y ficheros de expectativas del framework, todo empaquetado en un unico artefacto de unos 0,1 GB. La idea es ofrecer un sustituto ligero que reproduzca fielmente la interfaz del modelo real (mismos nombres de tensores, mismos ficheros de procesador, misma configuracion tras el "shrink") para poder ejecutar pruebas de integracion en CI de forma rapida y economica.

Es relevante unicamente en el contexto de ingenieria de infraestructura de IA: pruebas de compatibilidad, validacion de pipelines de despliegue y verificacion de contratos entre Transformers y vLLM. No debe emplearse para inferencia real, generacion de texto ni ninguna tarea de produccion, y esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral3ForConditionalGeneration (image-text-to-text, transformer multimodal) |
| Parametros totales | 8.607.168 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El artefacto reproduce la arquitectura `Mistral3ForConditionalGeneration`, un transformer multimodal de tipo image-text-to-text, pero con la configuracion reducida mediante la regla generica de `sweep.py`: 2 capas ocultas en la torre de vision y 2 capas ocultas en la torre de texto. Los pesos son aleatorios (semilla 17), no entrenados, y se generaron de modo que superasen una "puerta de sensibilidad a la entrada": cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (el caso mas debil, `pixel_values:reverse`, produce 0,127). Esto garantiza que el fixture responde de forma medible a cambios en las entradas, sin necesidad de entrenamiento.

Los ficheros de procesador se copiaron byte a byte del checkpoint original `mistralai/Ministral-3-3B-Instruct-2512`: `SYSTEM_PROMPT.txt`, `chat_template.jinja`, `generation_config.json`, `params.json`, `processor_config.json`, `tekken.json`, `tokenizer.json` y `tokenizer_config.json`. Los nombres de tensores coinciden con los del checkpoint real, y los pesos son finitos en float32, bfloat16 y float16 (forward, loss y gradientes). El fixture se construyo con `build_fixtures.py` y su procedencia, hashes y resultados de las puertas de validacion quedan registrados en `build.json`. La clave de fixture es `0ecff5a6afc5` y cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el shrink.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen salidas con significado.
- Reproduce la interfaz de entrada/salida del modelo base `mistralai/Ministral-3-3B-Instruct-2512` (image-text-to-text).
- Mantiene los mismos nombres de tensores que el checkpoint real, lo que permite validar cargas de pesos y mapeos de estado.
- Incluye ficheros de procesador reales (tokenizer Tekken, chat template, config de generacion), utiles para probar pipelines de preprocesado.
- Sirve para validar expectativas de framework (directorio `integrations/transformers/expectations`).
- Compatible con el contrato de integracion de vLLM segun el manifiesto `integration.json`.
- No soporta tool calling, agentes, razonamiento ni capacidades multilingues reales, al carecer de pesos entrenados.

## Casos de uso

- Pruebas de integracion en CI: ejecutar el fixture en lugar del modelo de 3B para validar que el pipeline de carga, preprocesado y forward funciona, reduciendo tiempo y coste de computo.
- Validacion de compatibilidad con vLLM: comprobar que el contrato descrito en `integration.json` se cumple antes de desplegar el modelo real.
- Verificacion de mapeos de tensores: al compartir nombres de tensores con el checkpoint original, permite detectar errores en scripts de conversion o carga de pesos.
- Pruebas de tokenizer y chat template: usar los ficheros `tekken.json`, `tokenizer.json` y `chat_template.jinja` reales para validar el formateo de prompts y la tokenizacion sin cargar el modelo completo.
- Regresion de frameworks: comparar el comportamiento de distintas versiones de Transformers frente a las expectativas registradas en `integrations/transformers/expectations`.
- Pruebas de robustez numerica: al ser finito en float32, bfloat16 y float16, sirve para validar forwards, losses y gradientes en distintas precisiones.
- Desarrollo de herramientas de "shrink": el propio repositorio documenta el proceso de reduccion (`sweep.py`, `build_fixtures.py`), util para construir fixtures de otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier benchmark careceria de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los 8,6 M de parametros en bfloat16 (el repo ocupa 0,1 GB).
- GPU recomendadas: cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es mas que suficiente; tambien cabe en CPU.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: vLLM (objetivo del contrato), Transformers (uso documentado en `integrations/transformers/usage.md`); otras opciones no disponibles.
- Latencia y throughput: no disponibles, aunque por el tamano seran minimos y no representativos del modelo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/ministral3-vllm-mic | 8,6 M | no disponible | Fixture de prueba | no disponible | Hugging Face |
| mistralai/Ministral-3-3B-Instruct-2512 | no disponible (3B por nombre) | no disponible | Modelo instruct multimodal real | no disponible | Hugging Face |
| Otros fixtures de huggingface-mic | variable (reducidos) | no disponible | Pruebas de integracion | no disponible | Hugging Face |

La comparativa relevante es con el modelo base del que deriva: el fixture no compite en rendimiento, sino que sustituye al modelo real en pruebas de infraestructura. Frente a otros fixtures de la misma organizacion, comparte proposito pero difiere en la arquitectura cubierta (Mistral3 multimodal).

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios (semilla 17) y las salidas no tienen significado.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe tratarse como modelo de produccion.
- No dispone de licencia declarada, lo que impide asumir derechos de uso comercial.
- No hay informacion sobre idiomas, contexto ni cuantizaciones; no debe inferirse del nombre del modelo base.
- Cualquier metrica de rendimiento obtenida con este fixture no es trasladable al modelo real `Ministral-3-3B-Instruct-2512`.
- La cobertura del fixture esta limitada a checkpoints con ficheros de procesador identicos y config coincidente tras el shrink; no cubre variantes con otra configuracion.
- Los ficheros de procesador son reales, pero al combinarse con pesos aleatorios pueden producir salidas degeneradas o sin sentido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/ministral3-vllm-mic
- Modelo base: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/ministral3-vllm-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/ministral3-vllm-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/ministral3-vllm-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/ministral3-vllm-mic/blob/main/build.json
- Documentacion del proceso de shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/ministral3-vllm-mic.html
- Script `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
