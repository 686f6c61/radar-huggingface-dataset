# huggingface-mic-temp/Phi-4-multimodal-instruct-vllm-mic

## Resumen

Phi-4-multimodal-instruct-vllm-mic es un artefacto de prueba (fixture) publicado por la cuenta `huggingface-mic-temp`, no un modelo utilizable. Se trata de una version reducida del modelo `microsoft/Phi-4-multimodal-instruct` de Microsoft, con solo 16.567.680 parametros frente a los aproximadamente 5.600 millones del original. El repositorio esta etiquetado explicitamente como `test-artifact` y su propia model card indica que "no es un modelo usable", con el objetivo de mantenerlo fuera de las busquedas de modelos candidatos.

La finalidad del artefacto es servir como fixture ejecutable para probar la integracion de frameworks (Transformers y vLLM) con la arquitectura `Phi4MultimodalForCausalLM`. Conserva los mismos nombres de tensores que el checkpoint real, los ficheros de procesador copiados byte a byte y la misma dtype de carga (bfloat16), pero con pesos aleatorios generados con semilla 17. Esto permite validar pipelines de inferencia, contratos de entrada/salida y expectativas de framework sin necesidad de descargar ni ejecutar el modelo completo.

Es relevante ahora unicamente en el contexto de ingenieria de pruebas y CI para integraciones de Phi-4 Multimodal, no para evaluacion de capacidades ni despliegue en produccion. Cualquier dato de rendimiento, calidad o comportamiento del modelo real no debe inferirse de este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Phi4MultimodalForCausalLM (transformer multimodal reducido: 2 capas de lenguaje, 2 capas de vision) |
| Parametros totales | 16.567.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repo copia el fichero LICENSE del modelo base, pero no se especifica en la informacion disponible) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El artefacto replica la arquitectura `Phi4MultimodalForCausalLM` del modelo base de Microsoft, pero con la configuracion reducida mediante la regla generica de `sweep.py` del proyecto `transformers-mic`: `num_hidden_layers` igual a 2 tanto en el torre de lenguaje como en el de vision. Mantiene los mismos nombres de tensores que el checkpoint real y copia byte a byte los ficheros de procesador del modelo original (`tokenizer.json`, `tokenizer_config.json`, `vocab.json`, `merges.txt`, `added_tokens.json`, `special_tokens_map.json`, `chat_template.jinja`, `generation_config.json`, `preprocessor_config.json`, entre otros).

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron con una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplazo los logits al menos 0,001 (la mas debil, `attention_mask:all_ones`, con 0,121). Los pesos son finitos en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El fixture cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el reducido. La clave de fixture es `5d6c417d16fb`.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios, por lo que no genera texto, codigo ni respuestas coherentes.
- Sirve como fixture de integracion para validar la carga del modelo con Transformers y su compatibilidad con vLLM.
- Permite comprobar el contrato de entradas/salidas (input sensitivity gate) de la arquitectura Phi-4 Multimodal.
- Conserva el tokenizador y el procesador reales del modelo base, por lo que valida el pipeline de preprocesado multimodal (texto e imagen).
- No dispone de tool calling, agentes, capacidades multilingues ni modos de razonamiento utilizables.
- No soporta inferencia con calidad: cualquier salida es ruido estadistico derivado de pesos aleatorios.

## Casos de uso

- Pruebas de integracion en CI para Transformers: cargar el fixture y verificar que la clase `Phi4MultimodalForCausalLM` se instancia, tokeniza y ejecuta un forward sin errores, sin coste de descarga del modelo completo.
- Validacion de compatibilidad con vLLM: comprobar que el pipeline de serving acepta la configuracion y los nombres de tensores del checkpoint real antes de desplegar el modelo de 5.600 millones de parametros.
- Verificacion de contratos de entrada: ejecutar el input sensitivity gate para asegurar que cada perturbacion de las entradas (attention mask, ids, pixel values) mueve los logits por encima del umbral definido.
- Pruebas de regresion de tokenizador y procesador: al copiar byte a byte los ficheros del modelo base, permite detectar cambios en `tokenizer.json`, `chat_template.jinja` o `preprocessor_config.json` que rompan la integracion.
- Desarrollo de harnesses de evaluacion multimodal: usar el fixture como sustituto ligero en pruebas unitarias de pipelines que combinan texto e imagen, sin consumir VRAM de un modelo real.
- Validacion de dtypes y estabilidad numerica: comprobar que forward, loss y gradientes son finitos en float32, bfloat16 y float16 antes de trasladar el test al checkpoint completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K, etc.) carece de sentido y no debe reportarse.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (16,6 millones de parametros, aproximadamente 33 MB de pesos, mas overhead de activaciones y procesador).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe holgadamente en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (carga directa), vLLM (objetivo declarado del fixture). No se documenta soporte para llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas con pesos aleatorios, las cifras no serian representativas del modelo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phi-4-multimodal-instruct-vllm-mic (este) | 16,6 M | no disponible | Fixture de test | no disponible | Hugging Face (repo temporal) |
| microsoft/Phi-4-multimodal-instruct | ~5.600 M | no disponible en la informacion proporcionada | Modelo multimodal real (texto, vision, audio) | no disponible en la informacion proporcionada | Hugging Face |
| Otros fixtures de transformers-mic | variable (reducidos) | no disponible | Pruebas de integracion por arquitectura | no disponible | Hugging Face (cuenta huggingface-mic-temp) |

La comparativa con modelos de la misma categoria (modelos multimodales de ~5-7B) no procede: este artefacto no es un modelo funcional y no admite comparacion de rendimiento. Frente al modelo base, la unica diferencia medible es el numero de parametros (16,6 M frente a ~5.600 M) y la configuracion reducida a 2 capas.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y las salidas no tienen significado.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe confundirse con el modelo real de Microsoft.
- No debe utilizarse en produccion, evaluacion de calidad ni generacion de contenido.
- La licencia no esta especificada en la informacion disponible; el repo copia el fichero LICENSE del modelo base, pero su terminos no se detallan.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma porque el artefacto no genera lenguaje coherente.
- El repositorio es temporal (cuenta `huggingface-mic-temp`) y puede desaparecer; la model card indica que se puede reconstruir con `python example/build_fixtures.py --fixture Phi-4-multimodal-instruct-vllm-mic`.
- Cualquier conclusion sobre el modelo base extraida de este fixture seria invalida.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic-temp/Phi-4-multimodal-instruct-vllm-mic
- Modelo base: https://huggingface.co/microsoft/Phi-4-multimodal-instruct
- Manifiesto de contrato: https://huggingface.co/huggingface-mic-temp/Phi-4-multimodal-instruct-vllm-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic-temp/Phi-4-multimodal-instruct-vllm-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic-temp/Phi-4-multimodal-instruct-vllm-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic-temp/Phi-4-multimodal-instruct-vllm-mic/blob/main/build.json
- Documentacion del reducido: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Phi-4-multimodal-instruct-vllm-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reducido (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion (build_fixtures.py): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
