# huggingface-mic/granite-4.0-h-350m-mic

## Resumen

`huggingface-mic/granite-4.0-h-350m-mic` no es un modelo de lenguaje utilizable, sino un artefacto de prueba (fixture) derivado de `ibm-granite/granite-4.0-h-350m`. Lo publica la organizacion `huggingface-mic` dentro de un proyecto de cobertura de integraciones para Transformers, con el objetivo de disponer de pesos ligeros que reproduzcan la misma interfaz (arquitectura, tokenizador, plantilla de chat y nombres de tensores) que el checkpoint original de IBM. El propio autor lo etiqueta como `test-artifact` y advierte explicitamente de que no es un modelo usable.

El fixture conserva la arquitectura `GraniteMoeHybridForCausalLM` del modelo base, pero reduce la configuracion a 2 capas ocultas y a 6.512.376 parametros totales, con pesos aleatorios generados con semilla 17. No ha pasado por entrenamiento alguno: los pesos solo superaron una comprobacion de sensibilidad a la entrada (cada perturbacion de las entradas del contrato movia los logits al menos 0,001). Los ficheros de procesador (tokenizador, plantilla de chat, `generation_config.json`, etc.) se copiaron byte a byte desde el checkpoint de IBM.

Su relevancia es, por tanto, puramente de ingenieria: sirve para validar pipelines de carga, pruebas de integracion en Transformers y verificacion de contratos de API sin descargar ni ejecutar el modelo real de 350M. Cualquier uso como modelo generativo, de razonamiento o de produccion carece de sentido, ya que su salida es esencialmente ruido estadistico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GraniteMoeHybridForCausalLM (hibrida MoE, reducida a 2 capas ocultas) |
| Parametros totales | 6.512.376 |
| Parametros activos | no disponible (fixture reducido; no se especifica reparto MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; el autor declara finitud en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo replica la clase `GraniteMoeHybridForCausalLM` del checkpoint `ibm-granite/granite-4.0-h-350m`, es decir, una arquitectura hibrida con componentes de mezcla de expertos segun el esquema de IBM Granite 4.0. Sin embargo, la configuracion se ha reducido mediante la regla generica de `sweep.py` del repositorio `transformers-mic`, fijando `num_hidden_layers` a 2. Los nombres de tensores coinciden exactamente con los del checkpoint real, de modo que el fixture puede cargarse con el mismo codigo que el modelo original.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y solo se validaron contra una puerta de sensibilidad a la entrada: toda perturbacion de las entradas del contrato desplazaba los logits al menos 0,001 (el caso mas debil, `input_ids:roll_batch`, alcanzo 1,84). Los ficheros de procesador (`chat_template.jinja`, `generation_config.json`, `merges.txt`, `model.sig`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copiaron byte a byte desde `ibm-granite/granite-4.0-h-350m`. El artefacto se genero con `build_fixtures.py` y su procedencia queda registrada en `build.json`, con fuentes fijadas, resultados de las puertas y hashes de ficheros.

## Capacidades

- No dispone de capacidades generativas reales: los pesos son aleatorios y no han sido entrenados.
- No hay soporte verificado de tool calling ni function calling.
- No hay soporte verificado de agentes ni razonamiento multi-paso.
- No hay capacidades multilingues demostradas.
- No hay modo thinking, vision ni audio.
- Utilidad real: validacion de carga del modelo, comprobacion de contratos de integracion en Transformers, pruebas de formas de tensores, dtypes y nombres de parametros.
- Sirve como fixture reproducible para CI: permite ejecutar forward, loss y backward en float32, bfloat16 y float16 sin descargar el checkpoint completo.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture con `AutoModelForCausalLM` y verificar que la clase `GraniteMoeHybridForCausalLM` se resuelve correctamente, sin necesidad de descargar el modelo de 350M.
- Validacion de contratos de API: comprobar que los nombres de tensores, la configuracion y los ficheros de procesador coinciden con el checkpoint real antes de un despliegue.
- CI/CD de librerias de modelado: ejecutar tests de forward, loss y backward en float32, bfloat16 y float16 con un artefacto de pocos megabytes, reduciendo tiempos y coste de infraestructura.
- Verificacion de tokenizadores y plantillas de chat: al copiarse byte a byte desde IBM, permite probar el renderizado de `chat_template.jinja` y los special tokens en pipelines de inferencia.
- Pruebas de sensibilidad a la entrada: reutilizar la puerta de perturbacion (`input_ids:roll_batch`, etc.) como test de regresion para detectar cambios que anulen la dependencia de los logits respecto a la entrada.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture granite-4.0-h-350m-mic` y comparar hashes registrados en `build.json`.
- Docencia y demos de arquitectura: ilustrar la estructura de un modelo hibrido MoE con un checkpoint minimo que cabe en cualquier entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que es un artefacto de prueba y no un modelo usable, por lo que no existen metricas de calidad (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (6,5M parametros, aproximadamente 13 MB de pesos); el repositorio ocupa 0,0 GB.
- GPU recomendadas: cualquier GPU consumer o integrada; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: Transformers (carga estandar con la clase `GraniteMoeHybridForCausalLM`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al no ser un modelo entrenado, las metricas de generacion no son significativas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/granite-4.0-h-350m-mic | 6.512.376 | no disponible | Fixture de test | no disponible | Hugging Face |
| ibm-granite/granite-4.0-h-350m | 350M (nominal) | no disponible en la informacion | Modelo causal real | no disponible en la informacion | Hugging Face |
| Otros fixtures de transformers-mic | variable | no disponible | Pruebas de integracion | no disponible | Hugging Face |

La comparacion relevante es con el checkpoint original de IBM: misma arquitectura y mismos ficheros de procesador, pero con 2 capas en lugar de la configuracion completa y pesos aleatorios en lugar de entrenados. No se dispone de datos para comparar con alternativas de la misma categoria funcional, porque el artefacto no compite en ninguna tarea de modelado.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y las salidas carecen de valor semantico.
- Riesgo de alucinacion total: cualquier texto generado es ruido; no debe emplearse en produccion ni en evaluaciones de calidad.
- Sin datos de sesgos: al no haber entrenamiento, no se han caracterizado sesgos, pero tampoco existe comportamiento linguistico evaluable.
- Contexto e idiomas no documentados; no se puede asumir ningun soporte multilingue.
- Licencia no disponible: no se especifican condiciones de uso comercial; debe consultarse la licencia del modelo base `ibm-granite/granite-4.0-h-350m` antes de cualquier reutilizacion.
- El autor lo etiqueta como `test-artifact` para excluirlo de busquedas de modelos candidatos; usarlo como modelo de produccion seria un error de seleccion.
- La configuracion reducida (2 capas) altera el comportamiento numerico respecto al checkpoint real; no sirve para validar calidad, solo interfaces y formas.
- El repositorio declara 0,0 GB de tamano, lo que refleja que solo contiene el fixture y documentacion, no un checkpoint completo.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/granite-4.0-h-350m-mic
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-h-350m
- Como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/granite-4.0-h-350m-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
