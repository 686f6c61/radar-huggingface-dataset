# huggingface-mic/LFM2.5-VL-450M-mic

## Resumen

LFM2.5-VL-450M-mic es un artefacto de prueba publicado por la organizacion huggingface-mic, no un modelo funcional. Se trata de un "fixture" o maqueta reducida del modelo multimodal LiquidAI/LFM2.5-VL-450M, generada para validar integraciones de frameworks (concretamente Transformers) sin necesidad de descargar ni ejecutar los pesos reales. El repositorio incluye pesos "slim", un manifiesto de contrato (integration.json), ejemplos de uso ejecutables y las expectativas del framework.

El modelo esta etiquetado explicitamente como `test-artifact` en Hugging Face para excluirlo de las busquedas de modelos candidatos. Sus pesos son aleatorios (semilla 17) y no han sido entrenados; solo pasaron una puerta de sensibilidad a las entradas que verifica que las perturbaciones en las entradas mueven los logits al menos 0,001. Por tanto, no produce ninguna salida util y no debe emplearse en produccion ni en evaluaciones de calidad.

Su relevancia es exclusivamente para ingenieria de software: permite a los mantenedores de Transformers y de otras librerias comprobar que el pipeline de carga, procesado y forward pass del modelo base (arquitectura `Lfm2VlForConditionalGeneration`) funciona correctamente con un coste minimo de descarga y computo. El modelo base real, LiquidAI/LFM2.5-VL-450M, es un modelo vision-lenguaje de aproximadamente 450 millones de parametros, pero esta ficha se centra en el artefacto publicado bajo el ID huggingface-mic/LFM2.5-VL-450M-mic.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lfm2VlForConditionalGeneration (transformer multimodal vision-lenguaje, version reducida: 2 capas de vision y 2 capas de texto) |
| Parametros totales | 4.464.832 (segun safetensors); la model card menciona 5,1M y 4,5M en distintas secciones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el fichero LICENSE se copia byte a byte del modelo base, pero su contenido no se detalla en la informacion proporcionada) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El artefacto replica la arquitectura del modelo base LiquidAI/LFM2.5-VL-450M, un modelo multimodal de tipo image-text-to-text construido sobre la clase `Lfm2VlForConditionalGeneration` de Transformers. Para generar el fixture se aplico una regla generica de reduccion (`sweep.py`) que rebajo el numero de capas ocultas a 2 en el codificador de vision y a 2 en el decodificador de texto, manteniendo los mismos nombres de tensores que el checkpoint real. Los ficheros de procesador (tokenizer, chat template, processor config, generation config) se copiaron byte a byte del modelo original.

No hubo entrenamiento: los pesos se inicializaron aleatoriamente con semilla 17. La unica validacion aplicada fue una puerta de sensibilidad a entradas, que exige que cada perturbacion de las entradas del contrato mueva los logits al menos 0,001 (la perturbacion mas debil, `pixel_values:halve`, produjo 0,319). Los pesos se verificaron como finitos en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El fixture se guardo en bfloat16, el dtype con el que carga por defecto el modelo base.

## Capacidades

- No dispone de capacidades funcionales de generacion de texto, razonamiento, codigo, matematicas ni vision: los pesos son aleatorios y no han sido entrenados.
- Conserva la interfaz de procesamiento multimodal (image-text-to-text) del modelo base, incluidos tokenizer, chat template y processor config copiados del original.
- Permite ejecutar un forward pass completo de la arquitectura `Lfm2VlForConditionalGeneration` con entradas de imagen y texto.
- Sirve como fixture para pruebas de integracion de frameworks: carga de checkpoint, mapeo de tensores, procesado de entradas y calculo de logits.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso de forma real.
- No tiene capacidades multilingues reales (los ficheros de tokenizer se heredan del modelo base, pero el modelo no genera lenguaje coherente).

## Casos de uso

- Pruebas de integracion en Transformers: validar que la clase `Lfm2VlForConditionalGeneration` carga, procesa y ejecuta un forward pass con el contrato de entradas esperado, sin descargar el checkpoint completo de 450M.
- CI/CD de librerias de inferencia: usar el fixture como caso de prueba ligero en pipelines de integracion continua para detectar regresiones en el soporte de modelos multimodales.
- Desarrollo de procesadores y tokenizers: comprobar el comportamiento del chat template y del processor config copiados del modelo base en un entorno con pesos minimos.
- Validacion de contratos de entrada: verificar que las perturbaciones de `pixel_values` y del texto de entrada afectan a los logits, como exige la puerta de sensibilidad incluida en el build.
- Pruebas de compatibilidad de dtypes: comprobar que el forward, la loss y los gradientes son finitos en float32, bfloat16 y float16.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture LFM2.5-VL-450M-mic` para auditar hashes y fuentes fijadas en build.json.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K, etc.) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los 4,46M de parametros en bfloat16 (aproximadamente 9 MB de pesos, mas overhead de activaciones y del procesador de vision).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el fixture esta pensado para ejecutarse en CPU sin problemas.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) y en CPU.
- Opciones de despliegue: Transformers (via `Lfm2VlForConditionalGeneration`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas de texto y 2 de vision, la latencia sera muy baja, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/LFM2.5-VL-450M-mic | 4,46M (fixture) | no disponible | Artefacto de prueba para integraciones | no disponible | Hugging Face |
| LiquidAI/LFM2.5-VL-450M | ~450M (modelo base real) | no disponible | Modelo vision-lenguaje funcional | no disponible en la informacion proporcionada | Hugging Face |
| Otros fixtures de huggingface-mic | variable | no disponible | Pruebas de integracion de otros modelos | no disponible | Hugging Face |

La comparativa relevante es contra el modelo base: el fixture comparte arquitectura, nombres de tensores y ficheros de procesador, pero carece de pesos entrenados y de cualquier capacidad generativa.

## Limitaciones y advertencias

- Los pesos son aleatorios (semilla 17): el modelo no genera texto ni respuestas coherentes y no debe usarse en produccion, evaluaciones ni demos.
- Esta etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; usarlo como modelo real seria un error de seleccion.
- La model card ofrece cifras de parametros inconsistentes (5,1M y 4,5M frente a los 4.464.832 de safetensors); conviene tomar como referencia el dato de safetensors.
- La licencia no se detalla en la informacion proporcionada; el fichero LICENSE se copia del modelo base, por lo que las condiciones reales dependen de LiquidAI/LFM2.5-VL-450M.
- No se documentan idiomas soportados, longitud de contexto ni opciones de cuantizacion.
- No hay garantia de que el fixture cubra todos los checkpoints del modelo base: solo cubre aquellos cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras la reduccion.
- No debe confundirse con el modelo LiquidAI/LFM2.5-VL-450M ni usarse para medir calidad, sesgos o alucinacion, ya que no ha sido entrenado.

## Enlaces

- Repositorio del artefacto: https://huggingface.co/huggingface-mic/LFM2.5-VL-450M-mic
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-450M
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/LFM2.5-VL-450M-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/LFM2.5-VL-450M-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/LFM2.5-VL-450M-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/LFM2.5-VL-450M-mic/blob/main/build.json
- Explicacion de la reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/LFM2.5-VL-450M-mic.html
- Script de reduccion (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion (build_fixtures.py): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
