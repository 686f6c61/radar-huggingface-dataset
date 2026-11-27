# huggingface-mic-temp/Qwen2-VL-2B-Instruct-vllm-mic

## Resumen

Qwen2-VL-2B-Instruct-vllm-mic es un artefacto de prueba (fixture) publicado por el espacio de Hugging Face `huggingface-mic-temp`, no un modelo entrenado ni utilizable. Se construye a partir de Qwen/Qwen2-VL-2B-Instruct mediante un proceso de "encogimiento" (shrink) que reduce la configuracion del modelo (2 capas ocultas en el decodificador de texto) y rellena los pesos con valores aleatorios (semilla 17), conservando los nombres de tensor del checkpoint original. El resultado son 10.055.808 parametros frente a los aproximadamente 2.200 millones del modelo base.

Su proposito es servir como fixture reproducible para validar contratos de integracion con frameworks (en este caso, vLLM y Transformers): incluye un manifiesto de integracion, ejemplos de uso y directorios de expectativas de framework. La model card lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos. No debe emplearse para inferencia real, generacion de texto, vision ni ninguna tarea productiva.

Es relevante unicamente en el contexto de ingenieria de software de infraestructura de IA: pruebas de CI, validacion de pipelines de carga de pesos, verificacion de compatibilidad de procesadores y comprobaciones de sensibilidad de entradas. No aporta capacidades de modelo y no debe confundirse con el modelo base real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2VLForConditionalGeneration (transformer multimodal imagen+texto, configuracion encogida a 2 capas ocultas de texto) |
| Parametros totales | 10.055.808 (fixture); modelo base Qwen2-VL-2B-Instruct: no disponible en la informacion proporcionada |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se copia el fichero LICENSE del modelo base, pero no se especifica su contenido) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura `Qwen2VLForConditionalGeneration` del modelo base, pero con una configuracion reducida: el decodificador de texto queda en 2 capas ocultas, aplicando la regla generica de `sweep.py` del repositorio `transformers-mic`. Los ficheros del procesador (`tokenizer.json`, `tokenizer_config.json`, `vocab.json`, `merges.txt`, `chat_template.json`, `generation_config.json`, `preprocessor_config.json` y `LICENSE`) se copian byte a byte desde Qwen/Qwen2-VL-2B-Instruct, de modo que el pipeline de tokenizacion y preprocesado es identico al del modelo original.

No hay entrenamiento. Los pesos son aleatorios (semilla 17) y se generaron tras superar una puerta de sensibilidad de entradas: cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (la mas debil, `pixel_values:halve`, produce 0,0537). El fixture conserva los mismos nombres de tensor que el checkpoint real y es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El proceso de construccion esta documentado en `build_fixtures.py` y los hashes, fuentes fijadas y resultados de la puerta se registran en `build.json`.

## Capacidades

- No dispone de capacidades de generacion de texto, razonamiento, codigo, matematicas ni vision: los pesos son aleatorios y la configuracion esta truncada.
- Sirve como fixture de contrato para validar la carga de pesos y la compatibilidad de procesadores en frameworks como vLLM y Transformers.
- Permite verificar la sensibilidad de las entradas del contrato (perturbaciones de `pixel_values`, `input_ids`, etc.) mediante la puerta de sensibilidad documentada.
- Conserva los nombres de tensor del checkpoint real, lo que permite probar rutas de carga, mapeo de pesos y validacion de shapes sin descargar el modelo completo.
- Incluye expectativas de framework en `integrations/transformers/expectations` para pruebas automatizadas.
- No soporta tool calling, agentes, multi-step reasoning ni capacidades multilingues reales.

## Casos de uso

- Pruebas de integracion en CI para vLLM: el fixture permite ejecutar la ruta de carga de un modelo multimodal Qwen2-VL sin descargar los aproximadamente 2 GB del checkpoint real, validando que el pipeline de vLLM acepta la configuracion y los nombres de tensor.
- Validacion de contratos de Transformers: los directorios de expectativas permiten comprobar que la version de `transformers` carga el modelo, el procesador y el tokenizador con los mismos resultados esperados.
- Pruebas de sensibilidad de entradas: util para verificar que perturbaciones en `pixel_values` o `input_ids` producen cambios medibles en los logits, como parte de la validacion de pipelines de preprocesado.
- Desarrollo de herramientas de "shrink" de checkpoints: sirve como caso de referencia para probar `sweep.py` y `build_fixtures.py` en la generacion de fixtures de otros modelos.
- Pruebas de compatibilidad de dtypes: al ser finito en float32, bfloat16 y float16, permite validar rutas de carga y forward en distintas precisiones sin coste de memoria.
- Verificacion de mapeo de pesos: al conservar los nombres de tensor del checkpoint real, se puede probar el mapeo de pesos y la deteccion de tensores faltantes o sobrantes en herramientas de conversion.
- Pruebas de regresion de tokenizador: al copiar byte a byte los ficheros del procesador, se puede validar que el tokenizador y el chat template se comportan igual que en el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto es un fixture de prueba sin capacidades funcionales, por lo que los benchmarks no aplican.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 para los 10,1 millones de parametros del fixture (los pesos ocupan aproximadamente 20 MB en bfloat16, mas overhead de activaciones y del procesador).
- GPU recomendadas: cualquier GPU con soporte de bfloat16 o float16; el fixture cabe en GPUs consumer muy basicas.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 1-2 GB de VRAM; tambien en CPU.
- Opciones de despliegue: vLLM (objetivo del contrato), Transformers; no se documentan opciones para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la inferencia seria trivial pero sin valor funcional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| Qwen2-VL-2B-Instruct-vllm-mic (este) | 10.055.808 | no disponible | no disponible | Fixture de prueba para contratos de integracion |
| Qwen/Qwen2-VL-2B-Instruct | no disponible en la informacion proporcionada | no disponible | no disponible | Modelo multimodal real imagen+texto |
| Otros fixtures de `huggingface-mic-temp` | no disponible | no disponible | no disponible | Artefactos de prueba similares |

La comparativa con alternativas funcionales de la misma categoria (modelos multimodales de ~2B) no esta disponible en la informacion proporcionada. El unico comparable directo es el modelo base del que deriva, que si es funcional pero cuyas especificaciones completas no se detallan en esta ficha.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la configuracion esta truncada a 2 capas; cualquier salida carece de sentido.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe promocionarse ni emplearse en produccion.
- La licencia no esta disponible de forma explicita; el fichero LICENSE se copia del modelo base, pero su contenido no se detalla en la informacion proporcionada. Verificar antes de cualquier redistribucion.
- Riesgo de confusion con el modelo base Qwen/Qwen2-VL-2B-Instruct: el nombre y la estructura de ficheros pueden llevar a un uso erroneo.
- No soporta inferencia multimodal real, tool calling, agentes ni capacidades multilingues.
- El repositorio tiene 0 descargas y 0 likes, y fue creado como artefacto temporal en el espacio `huggingface-mic-temp`; su disponibilidad a largo plazo no esta garantizada.
- Los datos de benchmarks, contexto, idiomas y cuantizacion no estan disponibles; no deben inferirse del modelo base sin verificacion.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic-temp/Qwen2-VL-2B-Instruct-vllm-mic
- Modelo base: https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct
- Manifiesto de contrato: https://huggingface.co/huggingface-mic-temp/Qwen2-VL-2B-Instruct-vllm-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic-temp/Qwen2-VL-2B-Instruct-vllm-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic-temp/Qwen2-VL-2B-Instruct-vllm-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic-temp/Qwen2-VL-2B-Instruct-vllm-mic/blob/main/build.json
- Documentacion del proceso de shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Qwen2-VL-2B-Instruct-vllm-mic.html
- Repositorio transformers-mic (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Repositorio transformers-mic (build_fixtures.py): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
