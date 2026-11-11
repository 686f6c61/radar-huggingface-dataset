# huggingface-mic/OLMo-1B-hf-mic

## Resumen

OLMo-1B-hf-mic es un artefacto de prueba (fixture) publicado por la organizacion huggingface-mic, no un modelo de lenguaje utilizable. Deriva de allenai/OLMo-1B-hf mediante un proceso de reduccion ("shrink") que conserva la arquitectura OlmoForCausalLM y los ficheros de procesador del modelo original, pero recorta la configuracion a 2 capas ocultas y genera pesos aleatorios con semilla 17. El resultado es un checkpoint de 3.301.376 parametros totales, frente a los aproximadamente 1.100 millones del OLMo-1B original.

Su proposito es servir como fixture de integracion para el proyecto transformers-mic: un repositorio minimo que incluye pesos reducidos, ejemplos de uso ejecutables y expectativas de framework (integration.json, integrations/transformers/expectations), de modo que las herramientas de validacion puedan comprobar contratos de inferencia sin descargar el modelo completo. Esta etiquetado explicitamente como `test-artifact` para excluirlo de las busquedas de modelos candidatos.

Por tanto, no debe evaluarse como un modelo de IA: no ha recibido entrenamiento, no genera texto coherente y no tiene licencia ni idiomas declarados en la informacion disponible. Su relevancia es exclusivamente de ingenieria de software y validacion de pipelines de transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (OlmoForCausalLM), reducido a 2 capas ocultas |
| Parametros totales | 3.301.376 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo conserva la clase de arquitectura del checkpoint original allenai/OLMo-1B-hf (OlmoForCausalLM, un transformer decoder-only causal), pero con una configuracion reducida mediante la regla generica de sweep.py del repositorio transformers-mic: num_hidden_layers igual a 2. Los ficheros de procesador (generation_config.json, special_tokens_map.json, tokenizer.json y tokenizer_config.json) se copiaron byte a byte desde allenai/OLMo-1B-hf, de modo que el tokenizador y la configuracion de generacion son identicos a los del modelo base.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron unicamente mediante una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato debia mover los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, produjo 0,362). Los tensores mantienen los mismos nombres que el checkpoint real y el modelo se guardo en float32, el dtype con el que carga por defecto allenai/OLMo-1B-hf. Se verifico que forward, loss y gradientes son finitos en float32, bfloat16 y float16.

## Capacidades

- Generacion de texto causal a nivel de contrato de API: el modelo ejecuta el forward pass y produce logits, pero al tener pesos aleatorios no genera lenguaje coherente.
- Compatibilidad con la interfaz de transformers para OlmoForCausalLM: mismos nombres de tensores que el checkpoint real.
- Tokenizacion identica a allenai/OLMo-1B-hf, al copiarse los ficheros de procesador byte a byte.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Validacion de contratos de integracion en transformers-mic: el repositorio incluye integration.json e integrations/transformers/expectations para comprobar que una implementacion de framework cumple el contrato de OLMo causal language modeling sin descargar el modelo completo.
- Pruebas unitarias y de regresion en CI: al pesar practicamente 0 GB y tener 3,3 millones de parametros, permite ejecutar tests de carga, forward y gradientes en pipelines de integracion continua en segundos.
- Verificacion de compatibilidad de tokenizadores: al reutilizar tokenizer.json y tokenizer_config.json de allenai/OLMo-1B-hf, sirve para testear que un pipeline tokeniza igual que el modelo de referencia.
- Comprobacion de estabilidad numerica: el fixture esta validado para producir valores finitos en float32, bfloat16 y float16, por lo que se puede usar para testear rutas de mixed precision y autocast.
- Desarrollo de utilidades de inspeccion de modelos: con los mismos nombres de tensores que el checkpoint real, permite probar herramientas que enumeran, renombran o mapean parametros sin coste de almacenamiento.
- Pruebas de sensibilidad a entradas: la puerta de sensibilidad documentada (perturbaciones que mueven los logits al menos 0,001) puede replicarse para validar harness de evaluacion de modelos.
- Reproduccion de fixtures: build.json registra fuentes fijadas, resultados de la puerta y hashes de ficheros, y build_fixtures.py permite reconstruir el artefacto de forma determinista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios y no ha sido entrenado, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (3,3 millones de parametros, aproximadamente 13 MB de pesos) y margen minimo en float16/bfloat16.
- GPU recomendadas: cualquier GPU consumer o integrada es suficiente; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 2060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: transformers (carga nativa del checkpoint en float32); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles; al tratarse de un fixture de 2 capas, la latencia seria del orden de milisegundos, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenado | Licencia | Proposito |
|---|---|---|---|---|---|
| huggingface-mic/OLMo-1B-hf-mic | 3.301.376 | no disponible | No (pesos aleatorios, semilla 17) | no disponible | Fixture de test |
| allenai/OLMo-1B-hf | ~1.100 millones (modelo base) | no disponible en la informacion proporcionada | Si | no disponible en la informacion proporcionada | Modelo de lenguaje real |
| Otros fixtures de transformers-mic | Variable (reducidos) | no disponible | No | no disponible | Validacion de contratos |

La comparacion relevante es con allenai/OLMo-1B-hf: misma arquitectura, mismos ficheros de procesador y mismos nombres de tensores, pero con 2 capas en lugar de la configuracion completa y pesos aleatorios en lugar de entrenados. No se dispone de informacion sobre otros modelos comparables de la misma categoria (fixtures de integracion).

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y no ha recibido entrenamiento; la salida no es lenguaje coherente.
- Etiquetado como `test-artifact` precisamente para excluirlo de busquedas de modelos candidatos; usarlo en produccion seria un error de seleccion.
- Sesgos conocidos: no aplica, al no haber datos de entrenamiento; no obstante, el tokenizador heredado de allenai/OLMo-1B-hf puede arrastrar los sesgos de su corpus original.
- Riesgo de alucinacion: total, en el sentido de que cualquier texto generado es ruido estadistico sin base factual.
- Limitaciones de contexto o idioma: no documentadas; la configuracion reducida a 2 capas no refleja el comportamiento del modelo base.
- Restricciones de licencia para uso comercial: la licencia no esta disponible en la informacion proporcionada; debe consultarse la del modelo base allenai/OLMo-1B-hf antes de cualquier uso derivado.
- Caveat para produccion: el fixture solo valida contratos de API y estabilidad numerica; no valida calidad, seguridad ni comportamiento linguistico.
- El tamano del repo figura como 0.0 GB, lo que refleja su naturaleza minima; no debe interpretarse como un checkpoint completo.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/OLMo-1B-hf-mic
- Modelo base: https://huggingface.co/allenai/OLMo-1B-hf
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/OLMo-1B-hf-mic.html
- Repositorio transformers-mic (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Repositorio transformers-mic (build_fixtures.py): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Manifiesto de contrato (integration.json): https://huggingface.co/huggingface-mic/OLMo-1B-hf-mic/blob/main/integration.json
- Uso con transformers (usage.md): https://huggingface.co/huggingface-mic/OLMo-1B-hf-mic/blob/main/integrations/transformers/usage.md
- Expectativas de transformers: https://huggingface.co/huggingface-mic/OLMo-1B-hf-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture (build.json): https://huggingface.co/huggingface-mic/OLMo-1B-hf-mic/blob/main/build.json
