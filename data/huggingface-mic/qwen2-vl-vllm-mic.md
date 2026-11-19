# huggingface-mic/qwen2-vl-vllm-mic

## Resumen

`huggingface-mic/qwen2-vl-vllm-mic` es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic`, no un modelo entrenado utilizable. Se trata de una version reducida artificialmente del modelo `Qwen/Qwen2-VL-2B-Instruct` de Alibaba Qwen, generada para validar el comportamiento de frameworks de inferencia (principalmente vLLM y Transformers) frente a la arquitectura `Qwen2VLForConditionalGeneration`. El repositorio contiene pesos "slim" de 10.055.808 parametros, es decir, aproximadamente un 0,5 % del tamano del modelo original de 2B parametros.

El proposito del artefacto es servir como banco de pruebas reproducible: mantiene exactamente los mismos nombres de tensores que el checkpoint real, copia byte a byte los ficheros del procesador (tokenizer, preprocessor, chat template, generation config) y conserva la arquitectura, pero reduce el numero de capas ocultas del decoder de texto a 2. Los pesos son aleatorios (semilla 17), no entrenados, y se distribuyen en bfloat16.

Su relevancia es limitada al ambito de la ingenieria de infraestructura de IA: permite a desarrolladores de vLLM, Transformers y herramientas afines verificar contratos de integracion, deteccion de inputs, sensibilidad de logits y compatibilidad de checkpoints sin necesidad de descargar ni ejecutar el modelo completo. No debe confundirse con un modelo de produccion ni usarse para tareas reales de vision-lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2VLForConditionalGeneration (transformer multimodal vision-lenguaje, version reducida) |
| Parametros totales | 10.055.808 (fixture slim); el modelo base Qwen2-VL-2B-Instruct tiene ~2B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del config del base, no documentada en el fixture) |
| Tipos de cuantizacion | no disponible; pesos guardados en bfloat16 |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (el fichero `LICENSE` se copia del modelo base, pero no se especifica el tipo) |
| Formato de pesos | safetensors (bfloat16) |
| Capas ocultas del decoder de texto | 2 (frente a las del modelo base) |
| Semilla de pesos | 17 (pesos aleatorios) |
| Modelo base | Qwen/Qwen2-VL-2B-Instruct |
| Tipo de artefacto | test-artifact / fixture de integracion |

## Arquitectura y entrenamiento

El fixture reproduce la arquitectura multimodal de Qwen2-VL: un encoder de vision y un decoder de lenguaje tipo transformer con atencion, empaquetados bajo la clase `Qwen2VLForConditionalGeneration`. La unica modificacion estructural respecto al modelo base es la reduccion del numero de capas ocultas del decoder de texto a 2, aplicada mediante la regla generica de `sweep.py` del repositorio `huggingface/transformers-mic`. Los ficheros del procesador (`tokenizer.json`, `tokenizer_config.json`, `vocab.json`, `merges.txt`, `preprocessor_config.json`, `chat_template.json`, `generation_config.json`) se copian byte a byte desde `Qwen/Qwen2-VL-2B-Instruct`.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron mediante una "input-sensitivity gate": cada perturbacion de las entradas del contrato debe mover los logits al menos 0,001 (la mas debil, `pixel_values:halve`, produce 0,0537). El fixture es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. Se guarda en bfloat16, el dtype por defecto del checkpoint real. El repositorio incluye un manifiesto de contrato (`integration.json`), documentacion de uso para Transformers (`integrations/transformers/usage.md`), expectativas de framework (`integrations/transformers/expectations`) y procedencia del fixture (`build.json`).

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen salidas semanticamente validas.
- Sirve como fixture de integracion para validar la carga de checkpoints `Qwen2VLForConditionalGeneration` en vLLM y Transformers.
- Permite comprobar que los frameworks respetan los nombres de tensores del checkpoint real.
- Valida la sensibilidad de las entradas del contrato (perturbaciones en `pixel_values` y entradas de texto).
- Verifica la compatibilidad de los ficheros del procesador (tokenizer, preprocessor, chat template) copiados del modelo base.
- Comprueba la estabilidad numerica en float32, bfloat16 y float16.
- No soporta tool calling, agentes, razonamiento ni capacidades multilingues reales.
- No dispone de modo thinking ni de vision funcional mas alla de la estructura del grafo.

## Casos de uso

- Pruebas de integracion en vLLM: usar el fixture para verificar que la version de vLLM en desarrollo carga correctamente un checkpoint `Qwen2VLForConditionalGeneration` sin descargar los 2B parametros reales.
- CI/CD de Transformers: ejecutar la suite de tests de integracion contra este fixture en pipelines automatizados, reduciendo tiempo y ancho de banda.
- Validacion de contratos de entrada: comprobar que los cambios en el preprocesado de imagenes o texto siguen moviendo los logits por encima del umbral definido (0,001).
- Desarrollo de herramientas de inspeccion de checkpoints: verificar que un parser de safetensors detecta los mismos nombres de tensores que el modelo real.
- Reproducibilidad de experimentos: usar `build.json` y la semilla 17 para regenerar el fixture de forma determinista con `build_fixtures.py`.
- Formacion de nuevos contribuidores: servir como ejemplo minimo de como reducir un modelo multimodal manteniendo su contrato de framework.
- Depuracion de problemas de dtype: validar que el pipeline maneja correctamente bfloat16, float16 y float32 en forward, loss y gradientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, no tiene sentido medir calidad de tarea (MMLU, HumanEval, GSM8K, etc.). La unica metrica reportada es la puerta de sensibilidad de entradas, con un delta minimo de logits de 0,001 y un valor observado para `pixel_values:halve` de 0,0537.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los 10,1M parametros en bfloat16 (unos 20 MB de pesos) mas el overhead de activaciones y del encoder de vision reducido.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien cabe en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con soporte de bfloat16 o float16.
- Opciones de despliegue: vLLM (objetivo principal del fixture), Transformers con `AutoModelForVision2Seq` o equivalente, y cualquier framework que soporte `Qwen2VLForConditionalGeneration`.
- Latencia y throughput: no disponibles; al ser un fixture de test no se publican mediciones de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/qwen2-vl-vllm-mic | 10,1M | no disponible | Fixture de integracion | no disponible | Hugging Face |
| Qwen/Qwen2-VL-2B-Instruct | ~2B | no disponible en esta ficha | Modelo multimodal real | no disponible en esta ficha | Hugging Face |
| Otros fixtures de transformers-mic | variable (slim) | no disponible | Fixtures de integracion | no disponible | Hugging Face |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (fixtures de integracion) mas alla de la referencia generica al repositorio `huggingface/transformers-mic`.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios (semilla 17) y las salidas carecen de significado.
- Etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.
- No debe desplegarse en produccion ni usarse para tareas de vision-lenguaje reales.
- La licencia no esta declarada de forma explicita en la informacion disponible; el fichero `LICENSE` se copia del modelo base, por lo que habria que consultar la licencia de `Qwen/Qwen2-VL-2B-Instruct` para cualquier uso derivado.
- El numero de capas ocultas reducido (2) altera el comportamiento numerico respecto al modelo real, por lo que no sirve para validar calidad de inferencia, solo contratos estructurales.
- Las expectativas de framework estan limitadas a las integraciones incluidas (Transformers); no se documentan otras.
- El repositorio no incluye todos los ficheros necesarios para su uso directo: el propio autor indica que hay que regenerarlos con `python example/build_fixtures.py --fixture qwen2-vl-vllm-mic`.
- Riesgo de confusion: el nombre del repositorio puede sugerir un modelo Qwen2-VL funcional; conviene revisar siempre la etiqueta `test-artifact`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/qwen2-vl-vllm-mic
- Modelo base: https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/qwen2-vl-vllm-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/qwen2-vl-vllm-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/qwen2-vl-vllm-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/qwen2-vl-vllm-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/qwen2-vl-vllm-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Script de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
