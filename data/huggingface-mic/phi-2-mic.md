# huggingface-mic/phi-2-mic

## Resumen

phi-2-mic es un artefacto de prueba (test fixture) derivado de microsoft/phi-2, publicado por la organizacion huggingface-mic. No se trata de un modelo funcional ni entrenado: es una version "adelgazada" del checkpoint original de Phi-2, reducida a 6,7 millones de parametros mediante la regla generica de reduccion aplicada en el repositorio transformers-mic (num_hidden_layers reducido a 2). Conserva la misma arquitectura PhiForCausalLM, los mismos nombres de tensores y los mismos ficheros de procesador copiados byte a byte del modelo original, pero sus pesos son aleatorios (semilla 17) y no han pasado por ningun proceso de entrenamiento.

El proposito del repositorio es servir como fixture de integracion para validar contratos de frameworks (en este caso, Transformers) sin necesidad de descargar el checkpoint completo de Phi-2. Incluye un manifiesto de contrato (integration.json), documentacion de uso ejecutable, expectativas del framework y procedencia del fixture (build.json). Esta etiquetado explicitamente como test-artifact para excluirlo de busquedas de modelos candidatos.

Por tanto, no debe confundirse con un modelo utilizable en produccion: no genera texto coherente, no tiene capacidades de razonamiento ni de codigo, y su relevancia es exclusivamente de ingenieria y validacion de pipelines. La ficha se redacta por rigor descriptivo, pero todas las secciones de capacidades, casos de uso y rendimiento deben interpretarse como no aplicables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PhiForCausalLM (transformer decoder-only, config reducida a num_hidden_layers=2) |
| Parametros totales | 6.671.616 (6,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos guardados en float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

El modelo replica la arquitectura de microsoft/phi-2 (PhiForCausalLM), un transformer decoder-only, pero con una configuracion reducida: num_hidden_layers=2 en lugar de la profundidad del checkpoint original. Los ficheros del procesador (tokenizer.json, vocab.json, merges.txt, added_tokens.json, special_tokens_map.json, tokenizer_config.json, generation_config.json, entre otros) se copian byte a byte del modelo base, de modo que la tokenizacion y la configuracion de generacion son identicas a las de Phi-2. Los nombres de tensores coinciden con los del checkpoint real, lo que permite que el fixture sea intercambiable a nivel de contrato.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se conservaron porque superaron una puerta de sensibilidad a la entrada: toda perturbacion de las entradas del contrato movia los logits al menos 0,001 (el caso mas debil, attention_mask:all_ones, registro 0,838). El modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave del fixture es 97b6a16aa567 y cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras la reduccion. El proceso de construccion esta documentado en build_fixtures.py y sweep.py del repositorio transformers-mic.

## Capacidades

- No dispone de capacidades generativas utiles: los pesos son aleatorios y no producen texto coherente.
- No soporta tool calling ni function calling de forma funcional.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues reales (el tokenizador es el de Phi-2, pero el modelo no ha aprendido representaciones).
- No dispone de modo thinking, vision ni audio.
- Su unica funcion verificable es actuar como fixture de contrato: validar que un framework carga, ejecuta forward, calcula loss y propaga gradientes con los nombres de tensores y ficheros de procesador esperados.

## Casos de uso

- Validacion de integracion en Transformers: usar el fixture para comprobar que la clase PhiForCausalLM carga pesos, ejecuta forward y calcula loss sin descargar el checkpoint completo de Phi-2.
- Pruebas de CI/CD en frameworks: integrar el fixture en pipelines de integracion continua para detectar regresiones en la carga de safetensors, en el mapeo de nombres de tensores o en la tokenizacion.
- Verificacion de contratos de tokenizador: al copiar byte a byte los ficheros de procesador de Phi-2, permite testear que un pipeline reproduce exactamente la tokenizacion del modelo original.
- Pruebas de compatibilidad de dtypes: comprobar que el forward, loss y gradientes son finitos en float32, bfloat16 y float16 en entornos de ejecucion concretos.
- Desarrollo de herramientas de reduccion de modelos: servir como ejemplo reproducible del proceso de shrink documentado en sweep.py y build_fixtures.py.
- Test de puertas de sensibilidad a la entrada: validar mecanismos que comprueban que perturbaciones de attention_mask u otras entradas mueven los logits por encima de un umbral.
- Pruebas de carga en entornos con recursos limitados: al ocupar 0,0 GB en el repo y 6,7 M parametros, permite ejecutar tests de framework en maquinas sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) careceria de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float16 (6,7 M parametros, aproximadamente 13 MB de pesos), aunque el uso real es para pruebas de framework, no para inferencia productiva.
- GPU recomendadas: innecesaria; el fixture puede ejecutarse en CPU.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: carga mediante Transformers (clase PhiForCausalLM); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles; al no ser un modelo funcional, no se reportan metricas de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| phi-2-mic | 6,7 M | no disponible | Fixture de test | no disponible | Hugging Face (test-artifact) |
| microsoft/phi-2 | no disponible en la informacion proporcionada | no disponible | Modelo base causal LM | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | no disponible | no disponible | Fixtures de contrato | no disponible | Hugging Face (test-artifact) |

La comparativa relevante no es de rendimiento sino de proposito: phi-2-mic es un derivado reducido de microsoft/phi-2 pensado para validar contratos, no un modelo alternativo para tareas de lenguaje.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no ha sido entrenado y no produce salidas coherentes; no debe usarse para generacion, razonamiento ni codigo.
- Etiquetado como test-artifact: esta excluido de busquedas de modelos candidatos y no debe promocionarse como modelo utilizable.
- Licencia no disponible: al no especificarse, no puede confirmarse el regimen de uso comercial; el modelo base microsoft/phi-2 tiene sus propias condiciones, que deben consultarse por separado.
- Contexto e idiomas no documentados: no hay informacion sobre la longitud de contexto efectiva ni sobre cobertura linguistica.
- Riesgo de confusion: el nombre y la estructura pueden llevar a confundirlo con Phi-2; debe verificarse siempre la clave de fixture y la etiqueta test-artifact.
- Sin garantias de produccion: no se documentan latencias, throughput ni estabilidad en despliegues reales.
- Dependencia del contrato: su validez esta ligada a los ficheros de procesador y a la config reducida; cambios en el modelo base pueden invalidar el fixture.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/phi-2-mic
- Modelo base: https://huggingface.co/microsoft/phi-2
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/phi-2-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla generica de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
