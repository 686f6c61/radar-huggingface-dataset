# huggingface-mic-temp/qwen2_5_vl-vllm-mic

## Resumen

`qwen2_5_vl-vllm-mic` es un artefacto de prueba publicado por la organizacion `huggingface-mic-temp`, no un modelo utilizable en produccion. Se trata de un "fixture" (modelo adelgazado) derivado de `Qwen/Qwen2.5-VL-3B-Instruct` de Alibaba, con solo 11.289.024 parametros reales segun los pesos en safetensors, frente a los aproximadamente 3.750 millones del modelo base. Su proposito es servir como banco de pruebas reproducible para validar contratos de integracion (procesadores, tokenizadores, expectativas de frameworks como Transformers y vLLM) sin necesidad de descargar y ejecutar el checkpoint completo.

El repositorio conserva la arquitectura `Qwen2_5_VLForConditionalGeneration` pero con la configuracion reducida (2 capas ocultas en el torre de texto) y pesos aleatorios generados con semilla 17. Los ficheros del procesador (`tokenizer.json`, `preprocessor_config.json`, `chat_template.json`, `merges.txt`, `vocab.json`, `generation_config.json` y `LICENSE`) se copian byte a byte del modelo original, de modo que cualquier discrepancia en el pipeline de inferencia se puede atribuir al codigo del framework y no a diferencias de tokenizacion o preprocesado.

Es relevante ahora porque el ecosistema Qwen2.5-VL es uno de los referentes open source en modelos vision-lenguaje, y disponer de fixtures ligeros acelera el desarrollo de integraciones (vLLM, Transformers) y la validacion en CI sin coste de GPU. No obstante, debe quedar claro que no genera texto coherente ni responde a instrucciones: es solo infraestructura de test.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen2.5-VL (`Qwen2_5_VLForConditionalGeneration`), config reducida a 2 capas ocultas en el torre de texto |
| Parametros totales | 11.289.024 (fixture); el modelo base Qwen2.5-VL-3B-Instruct tiene aproximadamente 3.750 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base soporta contexto largo, pero el fixture no documenta un valor propio) |
| Tipos de cuantizacion | no disponible; pesos guardados en bfloat16 |
| Idiomas soportados | no disponibles (el tokenizador se copia del base, pero no se declaran idiomas) |
| Licencia | no disponible en los metadatos del repo; el fichero `LICENSE` se copia byte a byte del modelo base |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del modelo base Qwen2.5-VL, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje y un procesador conjunto imagen-texto. Para el adelgazamiento se aplico la regla generica de `sweep.py` del proyecto `transformers-mic`, reduciendo el numero de capas ocultas del torre de texto a 2 y manteniendo los mismos nombres de tensores que el checkpoint real. Los ficheros del procesador (`tokenizer.json`, `preprocessor_config.json`, `chat_template.json`, `generation_config.json`, `merges.txt`, `vocab.json`, `LICENSE`) se copian sin modificacion desde `Qwen/Qwen2.5-VL-3B-Instruct`.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron con una "input-sensitivity gate": cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (la mas debil, `pixel_values:halve`, produce 0,0732). El modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El identificador de fixture `9a803e6a3a09` agrupa todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el adelgazamiento.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen texto, codigo ni razonamiento coherente.
- Sirve como fixture de integracion para validar el pipeline de entrada imagen+texto de Qwen2.5-VL en frameworks como Transformers y vLLM.
- Permite comprobar el contrato de tokenizacion y preprocesado (plantilla de chat, `preprocessor_config.json`, `generation_config.json`) contra el modelo base.
- Valida la sensibilidad de las entradas: perturbaciones en `pixel_values` e `input_ids` deben mover los logits.
- Compatible con pruebas de forward, loss y gradientes en float32, bfloat16 y float16.
- No soporta tool calling, agentes, thinking mode ni capacidades multilingues reales; esas capacidades pertenecen al modelo base, no al fixture.

## Casos de uso

- Pruebas de integracion en CI/CD: ejecutar el fixture en pipelines automatizados para verificar que una nueva version de Transformers o vLLM procesa correctamente entradas imagen+texto de Qwen2.5-VL sin descargar el checkpoint de 3B.
- Validacion de contratos de framework: comprobar que las expectativas declaradas en `integrations/transformers/expectations` se cumplen (nombres de tensores, formas, dtypes) antes de liberar una version.
- Desarrollo de adaptadores vLLM: usar el fixture como objetivo ligero para probar rutas de carga, preprocesado y ejecucion del modelo multimodal sin coste de GPU elevado.
- Depuracion de tokenizadores y plantillas de chat: al copiarse byte a byte del base, permite aislar fallos de tokenizacion de fallos de pesos.
- Verificacion de sensibilidad de entradas: ejecutar la gate de perturbaciones (`pixel_values:halve`, etc.) para detectar regresiones en el pipeline de preprocesado.
- Reproducibilidad de experimentos: el `build.json` registra fuentes fijadas, resultados de la gate y hashes de ficheros, lo que permite reconstruir el fixture con `python example/build_fixtures.py --fixture qwen2_5_vl-vllm-mic`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de test con pesos aleatorios, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K, etc.) carece de sentido.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en bfloat16 para los 11,3 M de parametros (los pesos ocupan aproximadamente 22,6 MB); el cuello de botella es el codificador visual y el procesador, no el torre de texto.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU para pruebas de forward; no requiere A100 ni H100.
- Cabe en GPU consumer: si, con margen amplio.
- Opciones de despliegue: Transformers (uso documentado en `integrations/transformers/usage.md`) y vLLM (el fixture esta pensado para ese framework). No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture de test no se publican mediciones de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| `qwen2_5_vl-vllm-mic` (este) | 11,3 M (fixture) | no disponible | no disponible | Fixture de test para integraciones |
| `Qwen/Qwen2.5-VL-3B-Instruct` | ~3.750 M | no disponible en esta ficha | no disponible en esta ficha | Modelo vision-lenguaje real |
| Otros fixtures `*-mic` de `huggingface-mic-temp` | variable (adelgazados) | no disponible | no disponible | Artefactos de test equivalentes |

La comparativa con modelos de produccion no es significativa: el fixture no compite en calidad ni rendimiento, solo en contratos de integracion. Para evaluar capacidades reales debe consultarse el modelo base `Qwen/Qwen2.5-VL-3B-Instruct`.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no genera salidas coherentes; cualquier uso en produccion o evaluacion de calidad es invalido.
- Etiquetado como `test-artifact`: el autor lo excluye explicitamente de la busqueda de modelos candidatos.
- No se declaran sesgos porque no hay comportamiento aprendido; los sesgos del modelo base no aplican al fixture.
- Riesgo de confusion: el nombre incluye "Qwen2.5-VL" y puede llevar a error si se descarga pensando que es un modelo funcional.
- Licencia no disponible en los metadatos; el `LICENSE` copiado del base debe revisarse antes de cualquier redistribucion.
- No apto para benchmarks, evaluaciones de seguridad ni despliegues de atencion al cliente.
- El contexto, idiomas y cuantizaciones no estan documentados para el fixture; no deben inferirse del modelo base sin verificacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic-temp/qwen2_5_vl-vllm-mic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Explicacion del adelgazamiento: https://huggingface-mic-mic-coverage.static.hf.space/shrink/qwen2_5_vl-vllm-mic.html
- Repositorio `transformers-mic` (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
