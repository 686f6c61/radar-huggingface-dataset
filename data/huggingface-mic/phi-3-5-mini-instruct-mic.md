# huggingface-mic/Phi-3.5-mini-instruct-mic

## Resumen

Phi-3.5-mini-instruct-mic es un artefacto de prueba publicado por el usuario huggingface-mic, no un modelo de lenguaje utilizable. Se trata de una version reducida ("slim fixture") del modelo microsoft/Phi-3.5-mini-instruct, con tan solo 4.186.432 parametros totales frente a los aproximadamente 3.800 millones del original. Su proposito es servir como fixture de pruebas para validar contratos de integracion y expectativas de frameworks (Transformers, entre otros) sin necesidad de descargar ni ejecutar el checkpoint completo.

El repositorio conserva la misma arquitectura declarada que el modelo base (Phi3ForCausalLM) pero con una configuracion reducida a 2 capas ocultas, generada mediante una regla generica de reduccion aplicada por la herramienta sweep.py del proyecto transformers-mic. Los pesos son aleatorios (semilla 17) y no han sido entrenados: superaron unicamente una puerta de sensibilidad a la entrada que verifica que las perturbaciones de las entradas mueven los logits al menos 0,001.

Es relevante exclusivamente en el contexto de ingenieria de software y testing de infraestructura de modelos: permite comprobar que un pipeline de carga, tokenizacion, forward pass y calculo de gradientes funciona correctamente con la arquitectura Phi-3.5 sin incurrir en los costes de memoria y computo del modelo real. No debe confundirse con un modelo afinado ni emplearse para inferencia real, generacion de texto o cualquier tarea de produccion. El autor lo etiqueta explicitamente como `test-artifact` para excluirlo de las busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Phi3ForCausalLM (transformer causal decoder-only, configuracion reducida a 2 capas ocultas) |
| Parametros totales | 4.186.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de la configuracion del modelo base, no verificada en el fixture) |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio copia los ficheros LICENSE y NOTICE.md del modelo base, pero la licencia no se declara en los metadatos) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura Phi3ForCausalLM del modelo base microsoft/Phi-3.5-mini-instruct, pero con la configuracion reducida mediante la regla generica de sweep.py, que en este caso fija num_hidden_layers en 2. Los nombres de tensores coinciden exactamente con los del checkpoint real, de modo que cualquier codigo que espere la estructura de parametros de Phi-3.5 puede cargarlo sin modificaciones. Los ficheros de procesamiento (tokenizer.json, tokenizer.model, tokenizer_config.json, added_tokens.json, special_tokens_map.json, generation_config.json, configuration_phi3.py, modeling_phi3.py, entre otros) se copiaron byte a byte desde el repositorio original.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron unicamente con una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato debe desplazar los logits al menos 0,001 (el caso mas debil, attention_mask:all_ones, produjo 0,362). El modelo se guardo en bfloat16, el dtype por defecto de carga del modelo base, y se verifico que forward, loss y gradientes son finitos en float32, bfloat16 y float16. El build queda documentado en build.json con fuentes fijadas, resultados de la puerta y hashes de ficheros, y la clave de fixture es e7b3e508a42a.

## Capacidades

- No dispone de capacidades reales de generacion de texto: los pesos son aleatorios y la salida carece de sentido linguistico.
- No soporta tool calling ni function calling de forma funcional.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No tiene capacidades multilingues efectivas.
- No incluye modo thinking, vision ni audio.
- Su unica funcion es validar contratos de integracion: carga de pesos, tokenizacion, forward pass, calculo de loss y gradientes con la arquitectura Phi-3.5.
- Sirve como fixture reproducible para tests de regresion en frameworks de inferencia y entrenamiento.

## Casos de uso

- Tests de integracion en Transformers: cargar el fixture con AutoModelForCausalLM y verificar que la configuracion Phi3ForCausalLM se instancia correctamente sin descargar el checkpoint completo de 3.800 millones de parametros.
- Validacion de pipelines de tokenizacion: comprobar que los ficheros de tokenizer copiados byte a byte del modelo base producen los mismos IDs y tokens especiales que el original.
- Pruebas de forward y backward en CI: ejecutar forward, loss y backward en float32, bfloat16 y float16 para detectar regresiones numericas (NaNs, inf) en entornos de integracion continua con recursos limitados.
- Verificacion de contratos de framework: usar integration.json y el directorio integrations/transformers/expectations para comprobar que una version nueva de Transformers mantiene el comportamiento esperado sobre la arquitectura Phi-3.5.
- Desarrollo de herramientas de inspeccion de modelos: probar utilidades que leen safetensors, enumeran tensores o comparan nombres de parametros contra el checkpoint real, gracias a que los nombres de tensores coinciden.
- Reproducibilidad de builds: reconstruir el fixture con python example/build_fixtures.py --fixture Phi-3.5-mini-instruct-mic y comparar hashes contra build.json para auditar la procedencia.
- Pruebas de carga en memoria y planificacion de despliegue: medir el coste de carga y el footprint de un modelo de 4,2 millones de parametros como caso base antes de escalar al modelo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en bfloat16 (4,2 millones de parametros), completamente despreciable.
- GPU recomendadas: cualquier GPU, incluida una iGPU o incluso CPU; no requiere acelerador dedicado.
- Cabe en cualquier GPU consumer, desde una GTX 1050 hasta una RTX 4090, y en CPU.
- Opciones de despliegue: Transformers (con trust_remote_code por el uso de custom_code y modeling_phi3.py); no se ha verificado compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al no ser un modelo funcional, las mediciones de rendimiento no son representativas del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phi-3.5-mini-instruct-mic (este) | 4,2 M | no disponible | Fixture de pruebas | no disponible | Hugging Face (huggingface-mic) |
| microsoft/Phi-3.5-mini-instruct | ~3.800 M | 128K (segun model card del original) | Modelo instructivo real | MIT (segun el original) | Hugging Face (microsoft) |
| Fixtures de otras arquitecturas en transformers-mic | Variable (reducidos) | no disponible | Pruebas de contrato | no disponible | Hugging Face (huggingface-mic) |

La comparacion directa con modelos de la misma categoria no aplica: el fixture no compite en calidad ni rendimiento con modelos reales. Su alternativa natural es el propio checkpoint de microsoft/Phi-3.5-mini-instruct, que ofrece capacidades reales a costa de un footprint de memoria mucho mayor.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen significado. No debe desplegarse en produccion bajo ninguna circunstancia.
- Sesgos conocidos: no aplica, al no haber entrenamiento; no se puede evaluar sesgo alguno.
- Riesgo de alucinacion: total, en el sentido de que toda la salida es ruido sin base factual.
- Limitaciones de contexto e idioma: la configuracion reducida a 2 capas no refleja el comportamiento del modelo base; el contexto efectivo no esta verificado.
- Restricciones de licencia: la licencia no se declara en los metadatos del repositorio; se copian LICENSE y NOTICE.md del modelo base, por lo que conviene consultar esos ficheros antes de cualquier reutilizacion.
- Requiere trust_remote_code por el uso de custom_code y modeling_phi3.py, lo que implica ejecutar codigo del repositorio.
- El repositorio no incluye todos los ficheros generados: el autor indica que deben reconstruirse con build_fixtures.py.
- Etiquetado como test-artifact: no aparece en busquedas de modelos candidatos y no debe tratarse como un checkpoint afinado de Phi-3.5.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Phi-3.5-mini-instruct-mic
- Modelo base: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Manifiesto de contrato (integration.json): https://huggingface.co/huggingface-mic/Phi-3.5-mini-instruct-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/Phi-3.5-mini-instruct-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/Phi-3.5-mini-instruct-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture (build.json): https://huggingface.co/huggingface-mic/Phi-3.5-mini-instruct-mic/blob/main/build.json
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Phi-3.5-mini-instruct-mic.html
- Repositorio transformers-mic (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Repositorio transformers-mic (build_fixtures.py): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
