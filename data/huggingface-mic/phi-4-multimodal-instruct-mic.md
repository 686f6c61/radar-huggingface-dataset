# huggingface-mic/Phi-4-multimodal-instruct-mic

## Resumen

Phi-4-multimodal-instruct-mic es un artefacto de prueba (fixture) publicado por el usuario huggingface-mic, no un modelo funcional. Se construye a partir de microsoft/Phi-4-multimodal-instruct mediante un proceso de reduccion ("shrinking") que conserva la arquitectura Phi4MultimodalForCausalLM pero con una configuracion minima: 2 capas en el transformer de lenguaje y 2 capas en el codificador de vision, lo que da un total de 16.567.680 parametros. Los pesos son aleatorios (semilla 17), no entrenados.

El proposito del repositorio es servir como fixture reproducible para probar integraciones de frameworks (concretamente Transformers) contra la arquitectura real de Phi-4 Multimodal sin necesidad de descargar los ~14B parametros del modelo original. Incluye un manifiesto de contrato (integration.json), documentacion de uso, expectativas del framework y ficheros de procesador copiados byte a byte del checkpoint original (tokenizer, chat template, configuracion de preprocesado, etc.).

Es relevante unicamente en el ambito de testing e integracion continua de librerias de inferencia. No debe emplearse para generacion de texto, vision ni ninguna tarea productiva: sus salidas son ruido aleatorio. La etiqueta test-artifact existe precisamente para excluirlo de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Phi4MultimodalForCausalLM (transformer multimodal con torre de vision), reducida a 2 capas de lenguaje y 2 de vision |
| Parametros totales | 16.567.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de la config del modelo base, no verificada en el fixture) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; el autor declara finitud en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en la ficha de Hugging Face; el repo incluye el fichero LICENSE copiado del modelo base |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la clase Phi4MultimodalForCausalLM del modelo base, pero con una configuracion reducida mediante la regla generica de sweep.py del proyecto transformers-mic: num_hidden_layers = 2 y vision num_hidden_layers = 2. Mantiene los mismos nombres de tensores que el checkpoint real, de modo que cualquier codigo que cargue microsoft/Phi-4-multimodal-instruct deberia poder cargar este fixture sin cambios en el codigo de modelado.

No hay entrenamiento. Los pesos se inicializan aleatoriamente con semilla 17 y se validan con una "input-sensitivity gate": cada perturbacion de las entradas del contrato debe mover los logits al menos 0.001 (la mas debil, attention_mask:all_ones, produce 0.111). Los ficheros de procesador (tokenizer.json, tokenizer_config.json, vocab.json, merges.txt, added_tokens.json, chat_template.jinja, preprocessor_config.json, generation_config.json, special_tokens_map.json, LICENSE, entre otros) se copian byte a byte del checkpoint original. El build queda registrado en build.json con fuentes fijadas, resultados de la puerta y hashes de ficheros.

## Capacidades

- No es un modelo funcional: no genera texto coherente, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling de forma util (la plantilla de chat se copia del modelo base, pero los pesos son aleatorios).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues reales.
- No ofrece vision, audio ni modo thinking utilizables.
- Su unica funcion es validar la carga, el forward, el calculo de loss y los gradientes de la arquitectura Phi-4 Multimodal en frameworks de inferencia.
- Sirve como fixture de pruebas de regresion para tokenizer, chat template y preprocessor_config heredados del modelo base.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture con AutoModelForCausalLM y verificar que el modelado Phi4MultimodalForCausalLM se instancia y ejecuta sin errores con 16,6M de parametros en lugar de los ~14B del original.
- CI/CD de librerias de inferencia: ejecutar tests de forward, loss y backward en float32, bfloat16 y float16 con un repo de 0,1 GB, reduciendo tiempos de descarga y requisitos de GPU en pipelines.
- Validacion de contratos de API: comprobar que las entradas declaradas en integration.json (incluida attention_mask) alteran los logits por encima del umbral de 0.001, detectando regresiones en el manejo de mascaras.
- Pruebas de tokenizer y chat template: al copiarse byte a byte del modelo base, permite verificar el formateo de conversaciones y tokens especiales sin cargar el checkpoint completo.
- Desarrollo de herramientas de conversion de pesos: validar scripts que mapean nombres de tensores de Phi-4 Multimodal contra un checkpoint con la misma estructura pero tamano minimo.
- Verificacion de preprocesado multimodal: usar preprocessor_config.json y los ficheros de vision para probar el pipeline de entrada de imagenes con una torre de vision de 2 capas.
- Reproducibilidad de fixtures: reconstruir el artefacto con build_fixtures.py y comparar hashes registrados en build.json para auditar cambios en la cadena de build.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas de calidad, y al tratarse de pesos aleatorios cualquier evaluacion carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (16,6M de parametros, ~33 MB de pesos, mas activaciones y ficheros de procesador).
- GPU recomendadas: cualquier GPU consumer moderna sirve; no requiere A100 ni H100. Funciona en CPU.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) y en entornos sin GPU.
- Opciones de despliegue: Transformers (uso documentado en integrations/transformers/usage.md); otras opciones como vLLM, llama.cpp, Ollama o TGI no estan documentadas para este fixture.
- Latencia y throughput: no disponibles; al ser un fixture de test, no se caracteriza rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phi-4-multimodal-instruct-mic | 16.567.680 | no disponible | Fixture de test | no disponible | Hugging Face (repo 0,1 GB) |
| microsoft/Phi-4-multimodal-instruct | no disponible en la informacion proporcionada | no disponible | Modelo multimodal de produccion | no disponible en la informacion proporcionada | Hugging Face |
| Otros fixtures de transformers-mic | no disponible | no disponible | Fixtures de test de otras arquitecturas | no disponible | Hugging Face |

La comparativa relevante es contra el modelo base: mismo codigo de modelado y mismos ficheros de procesador, pero con pesos aleatorios y una fraccion minima de los parametros. Frente a otros fixtures del mismo proyecto, comparte metodologia (sweep.py, build_fixtures.py) pero cubre especificamente la arquitectura Phi-4 Multimodal.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios (semilla 17) y las salidas no tienen significado.
- Riesgo de confusion: si se despliega por error en produccion, generara texto incoherente sin aviso evidente mas alla de la calidad de salida.
- La licencia no aparece en la ficha de Hugging Face; el repo incluye el fichero LICENSE del modelo base, por lo que las condiciones de uso comercial dependen de ese fichero y deben revisarse antes de cualquier redistribucion.
- El contexto, los idiomas y las capacidades multimodales no estan verificados en el fixture; se heredan de la configuracion pero no se han validado funcionalmente.
- La etiqueta test-artifact lo excluye de busquedas de modelos candidatos; no debe citarse como alternativa a Phi-4 Multimodal en evaluaciones.
- El repositorio solo incluye pesos, uso y expectativas; otros ficheros deben regenerarse con build_fixtures.py, lo que puede introducir divergencias si no se fijan las fuentes de build.json.
- No hay garantia de que futuras versiones de Transformers mantengan compatibilidad con este fixture si cambia el modelado de Phi4MultimodalForCausalLM.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Phi-4-multimodal-instruct-mic
- Modelo base: https://huggingface.co/microsoft/Phi-4-multimodal-instruct
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/Phi-4-multimodal-instruct-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/Phi-4-multimodal-instruct-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/Phi-4-multimodal-instruct-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/Phi-4-multimodal-instruct-mic/blob/main/build.json
- Explicacion del shrinking: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Phi-4-multimodal-instruct-mic.html
- Repositorio transformers-mic (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Repositorio transformers-mic (build_fixtures.py): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
