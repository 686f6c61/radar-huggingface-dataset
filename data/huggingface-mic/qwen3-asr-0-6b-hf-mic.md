# huggingface-mic/Qwen3-ASR-0.6B-hf-mic

## Resumen

Qwen3-ASR-0.6B-hf-mic es un artefacto de prueba (fixture) publicado por el usuario huggingface-mic, no un modelo utilizable. Se trata de una version reducida del checkpoint Qwen/Qwen3-ASR-0.6B-hf, un modelo de reconocimiento automatico del habla (ASR) de la familia Qwen3, generada con la herramienta transformers-mic para validar contratos de integracion con frameworks. El repositorio incluye pesos "slim", ejemplos de uso ejecutables y expectativas de framework en un unico lugar.

El modelo conserva la arquitectura declarada del original, Qwen3ASRForConditionalGeneration, pero con una configuracion drasticamente recortada: 2 capas en el encoder de audio y 2 capas en el decodificador de texto, lo que deja un total de 9.877.840 parametros (frente a los aproximadamente 0,6 mil millones que sugiere el nombre del checkpoint base). Los ficheros de procesador (tokenizer, chat template, configuracion de generacion y de procesador) se copian byte a byte del modelo original.

Su relevancia es exclusivamente tecnica para el desarrollo de transformers-mic: sirve para verificar que las expectativas de integracion (nombres de tensores, formas, dtypes y sensibilidad a la entrada) se cumplen sin necesidad de descargar el checkpoint completo. Esta etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos y no debe emplearse en produccion ni en evaluaciones de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ASRForConditionalGeneration (encoder de audio + decodificador de texto, transformer) |
| Parametros totales | 9.877.840 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es una version reducida del checkpoint Qwen3-ASR-0.6B-hf, que combina un encoder de audio con un decodificador de texto para tareas de speech-to-text. La configuracion del fixture recorta la profundidad a 2 capas en el encoder de audio (`audio encoder_layers: 2`) y 2 capas en el decodificador de texto (`text num_hidden_layers: 2`), aplicando la regla generica de reduccion de `sweep.py` del repositorio transformers-mic. Los ficheros de procesador (`chat_template.jinja`, `generation_config.json`, `processor_config.json`, `tokenizer.json`, `tokenizer_config.json`) se copian sin modificaciones desde el checkpoint original.

No se trata de un modelo entrenado de forma convencional: los pesos se sobreajustan al paso de entrenamiento del contrato (70 pasos) para que el fixture supere la puerta de sensibilidad a la entrada. Segun la model card, los pesos aleatorios fallaban esa puerta (`input_features:reverse` movia los logits solo 0, umbral 0,001), por lo que se opto por sobreajustar. El fixture conserva los mismos nombres de tensor que el checkpoint real, se guarda en bfloat16 (el dtype por defecto del modelo original) y es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes.

## Capacidades

- No es un modelo funcional: la model card lo describe explicitamente como "test artifact, not a usable model".
- Conserva la interfaz de un modelo ASR (speech-to-text) a nivel de arquitectura y de procesador.
- Mantiene los mismos nombres de tensor y el mismo procesador que Qwen3-ASR-0.6B-hf, lo que permite validar integraciones sin descargar el checkpoint completo.
- Sirve como fixture para comprobar contratos de framework: formas, dtypes, sensibilidad a la entrada y ejecucion en float32, bfloat16 y float16.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, tool calling, agentes ni multilingues para este artefacto.
- No se documenta thinking mode ni ninguna capacidad especial.

## Casos de uso

- Validacion de integraciones en transformers-mic: el fixture permite ejecutar el pipeline de un modelo ASR sin descargar los aproximadamente 0,6 mil millones de parametros del checkpoint real, reduciendo el coste de CI.
- Pruebas de contrato de framework: verifica que los nombres de tensor, formas y dtypes esperados por el framework coinciden con los del checkpoint original.
- Pruebas de sensibilidad a la entrada: comprueba que perturbaciones en `input_features` producen cambios medibles en los logits, usando el umbral definido en el contrato (0,001).
- Pruebas de estabilidad numerica: valida que forward, loss y gradientes son finitos en float32, bfloat16 y float16.
- Desarrollo de herramientas de reduccion de modelos: sirve como ejemplo reproducible de la regla generica de `sweep.py` para generar fixtures a partir de checkpoints reales.
- Verificacion de ficheros de procesador: al copiarse byte a byte, permite testear la carga de tokenizer, chat template y configuraciones de generacion sin depender del modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los 9,9 millones de parametros en bfloat16 (el repositorio ocupa 0,1 GB).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe en cualquier GPU consumer, incluida una GTX 1650 o una iGPU con suficiente memoria compartida.
- Opciones de despliegue: carga mediante Transformers con la clase `Qwen3ASRForConditionalGeneration`; no se documentan opciones para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un artefacto de prueba, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-ASR-0.6B-hf-mic (este) | 9.877.840 | no disponible | Fixture de test | no disponible | HuggingFace |
| Qwen/Qwen3-ASR-0.6B-hf | no disponible (el nombre sugiere ~0,6B) | no disponible | ASR real | no disponible | HuggingFace |
| Otros fixtures de transformers-mic | variable (reducidos) | no disponible | Validacion de contratos | no disponible | HuggingFace (org huggingface-mic) |

La comparativa con modelos ASR de produccion de tamano similar no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: la propia model card lo califica como artefacto de prueba y lo etiqueta `test-artifact`.
- Los pesos estan sobreajustados a 70 pasos de entrenamiento, no a una tarea real de reconocimiento del habla; las salidas carecen de valor semantico.
- No debe usarse para evaluar calidad, sesgos ni capacidades de ASR.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribucion.
- Idiomas soportados no disponibles.
- Longitud de contexto no disponible.
- El repositorio solo contiene pesos reducidos, uso y expectativas de framework; otros ficheros deben regenerarse con `python example/build_fixtures.py --fixture Qwen3-ASR-0.6B-hf-mic`.
- Riesgo de confusion: el nombre incluye "0.6B" pero el modelo real tiene 9,9 millones de parametros; no debe compararse por tamano con el checkpoint base.
- No apto para produccion bajo ninguna circunstancia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/huggingface-mic/Qwen3-ASR-0.6B-hf-mic
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B-hf
- Manifiesto de contrato (integration.json): https://huggingface.co/huggingface-mic/Qwen3-ASR-0.6B-hf-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/Qwen3-ASR-0.6B-hf-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/Qwen3-ASR-0.6B-hf-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture (build.json): https://huggingface.co/huggingface-mic/Qwen3-ASR-0.6B-hf-mic/blob/main/build.json
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Qwen3-ASR-0.6B-hf-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reduccion (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures (build_fixtures.py): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
