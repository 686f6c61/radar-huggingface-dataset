# huggingface-mic/gemma-vllm-mic

## Resumen

`huggingface-mic/gemma-vllm-mic` es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic` en Hugging Face. No se trata de un modelo entrenado ni utilizable para inferencia real, sino de una version reducida y "adelgazada" de `google/gemma-2b` concebida para validar contratos de integracion con frameworks (en concreto, vLLM y Transformers) dentro del proyecto `transformers-mic`. El propio autor lo etiqueta explicitamente como `test-artifact` y advierte de que no es un modelo usable.

Tecnicamente reproduce la arquitectura `GemmaForCausalLM` con una configuracion reducida a 2 capas ocultas y 16.458.048 parametros totales, conservando los nombres de tensores del checkpoint original y copiando byte a byte los ficheros de procesador (tokenizer, generation_config, special_tokens_map) de `google/gemma-2b`. Los pesos son aleatorios (semilla 17) y se guardan en `bfloat16`.

Su relevancia es acotada: sirve como material de referencia para desarrolladores que trabajen en el proyecto `transformers-mic` y necesiten verificar contratos de integracion (manifiesto `integration.json`, expectativas de framework, procedencia de la fixture en `build.json`) sin descargar el checkpoint completo de Gemma. No debe confundirse con un modelo de produccion ni emplearse para tareas reales de generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `GemmaForCausalLM` (transformer decoder-only, configuracion reducida a 2 capas ocultas) |
| Parametros totales | 16.458.048 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; el autor indica que es finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo replica la arquitectura `GemmaForCausalLM` del checkpoint `google/gemma-2b`, pero con una configuracion reducida mediante la regla generica de `sweep.py` del repositorio `transformers-mic` (concretamente, `num_hidden_layers` reducido a 2). Conserva los mismos nombres de tensores que el checkpoint real y copia byte a byte los ficheros de procesador (`generation_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer.model`, `tokenizer_config.json`) desde `google/gemma-2b`.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y pasaron una "input-sensitivity gate": cada perturbacion de las entradas del contrato movio los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, lo hizo en 0,0664), lo que segun el autor justifica no necesitar entrenamiento. El fixture se identifica con la clave `20f5bc233251` y cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el adelgazamiento. Se guarda en `bfloat16`, el dtype en el que carga por defecto `google/gemma-2b`.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no han sido entrenados, por lo que no genera texto coherente ni resuelve tareas reales.
- Sirve como fixture de validacion de contratos de integracion con frameworks (vLLM, Transformers) dentro del proyecto `transformers-mic`.
- Permite verificar la compatibilidad de nombres de tensores, configuracion y ficheros de procesador frente al checkpoint real `google/gemma-2b`.
- Reproduce la interfaz de `GemmaForCausalLM` (forward, loss, gradients) con valores finitos en float32, bfloat16 y float16.
- No dispone de soporte de tool calling, agentes, vision, audio ni modo thinking, ya que no es un modelo entrenado.
- Capacidades multilingues: no disponibles (el tokenizer se hereda de `google/gemma-2b`, pero el modelo no produce salidas validas).

## Casos de uso

- Validacion de pipelines de integracion en `transformers-mic`: el fixture permite ejecutar los tests de contrato (`integration.json`) sin descargar el checkpoint completo de Gemma, reduciendo el coste de CI.
- Pruebas de compatibilidad con vLLM: al reproducir la arquitectura y los nombres de tensores de `GemmaForCausalLM`, sirve para comprobar que el cargador de vLLM acepta la configuracion adelgazada.
- Verificacion de ficheros de procesador: al copiar byte a byte los ficheros del tokenizer de `google/gemma-2b`, permite testear rutas de carga de tokenizer sin depender del modelo original.
- Tests de estabilidad numerica: el autor indica que el fixture es finito en float32, bfloat16 y float16 (forward, loss, gradients), lo que lo hace util para validar kernels y rutas de mixed precision.
- Reproducibilidad de fixtures: mediante `build.json` y `build_fixtures.py` se puede reconstruir el artefacto y comprobar hashes de ficheros y resultados de la gate.
- Documentacion de contratos de framework: los directorios `integrations/transformers/usage.md` y `integrations/transformers/expectations` sirven como referencia de uso esperado para desarrolladores del proyecto.
- No es adecuado para atencion al cliente, generacion de codigo, analisis de documentos ni ninguna tarea de produccion, dado que sus pesos son aleatorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas de calidad (MMLU, HumanEval, GSM8K ni similares), coherente con la naturaleza de artefacto de prueba del repositorio.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en bfloat16 para los 16,5 M de parametros (el repositorio ocupa 0,1 GB).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe en GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para pruebas de contrato.
- Opciones de despliegue: vLLM (objetivo del fixture), Transformers; no se documentan recetas para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser pesos aleatorios y un artefacto de prueba, las metricas de rendimiento no son representativas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/gemma-vllm-mic | 16.458.048 | no disponible | Fixture de test (pesos aleatorios) | no disponible | Hugging Face |
| google/gemma-2b | 2.000 M aprox. | no disponible en la informacion | Modelo de lenguaje real | Gemma Terms of Use (segun el modelo original; no confirmado en esta ficha) | Hugging Face |
| google/gemma-2b-it | 2.000 M aprox. | no disponible en la informacion | Modelo instruido real | Gemma Terms of Use (segun el modelo original; no confirmado en esta ficha) | Hugging Face |

La comparativa es limitada: el fixture no es funcionalmente comparable a un modelo entrenado. Se incluye `google/gemma-2b` como referencia por ser su modelo base declarado, y `google/gemma-2b-it` como variante instruida del mismo, si bien no se dispone de datos verificados de contexto ni licencia en la informacion proporcionada.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no ha sido entrenado y sus salidas no son coherentes; no debe usarse en produccion ni en evaluaciones de calidad.
- Etiquetado como `test-artifact`: el autor lo excluye explicitamente de busquedas de modelos candidatos.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; dado que deriva de `google/gemma-2b`, conviene revisar los terminos del modelo original antes de cualquier uso.
- Idiomas no disponibles: aunque hereda el tokenizer de Gemma, el modelo no genera texto valido en ningun idioma.
- Contexto no disponible: no se documenta la longitud de contexto efectiva del fixture.
- Riesgo de confusion: por su nombre y arquitectura puede confundirse con un modelo Gemma real; el autor insiste en que es un artefacto de prueba.
- Sesgos y alucinaciones: no aplicables en sentido estricto al no haber entrenamiento, pero cualquier salida debe considerarse ruido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/gemma-vllm-mic
- Modelo base: https://huggingface.co/google/gemma-2b
- Manifiesto de contrato (`integration.json`): https://huggingface.co/huggingface-mic/gemma-vllm-mic/blob/main/integration.json
- Uso con Transformers (`usage.md`): https://huggingface.co/huggingface-mic/gemma-vllm-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/gemma-vllm-mic/tree/main/integrations/transformers/expectations
- Procedencia de la fixture (`build.json`): https://huggingface.co/huggingface-mic/gemma-vllm-mic/blob/main/build.json
- Documentacion del proceso de adelgazamiento: https://huggingface-mic-mic-coverage.static.hf.space/shrink/gemma-vllm-mic.html
- Repositorio `transformers-mic` (script `sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Repositorio `transformers-mic` (script `build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
