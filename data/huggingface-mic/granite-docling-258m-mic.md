# huggingface-mic/granite-docling-258M-mic

## Resumen

`granite-docling-258M-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic` en Hugging Face. No es un modelo entrenado ni utilizable para inferencia real: se trata de una version reducida artificialmente del modelo `ibm-granite/granite-docling-258M` de IBM, generada para validar contratos de integracion entre el modelo y distintos frameworks (en concreto, Transformers). El repositorio incluye pesos "slim", ejemplos de uso ejecutables y un directorio de expectativas de framework.

El fixture conserva la arquitectura del modelo original (`Idefics3ForConditionalGeneration`, un modelo vision-lenguaje) pero con una configuracion drasticamente reducida: 2 capas en el codificador de vision y 2 capas en el decodificador de texto. Los pesos son aleatorios (semilla 17) y no han pasado por ningun proceso de entrenamiento; simplemente superaron una comprobacion de sensibilidad a las entradas (las perturbaciones de los inputs mueven los logits al menos 0,001). El recuento real de parametros en safetensors es de 6.743.936, muy lejos de los 258M que sugiere el nombre heredado del modelo base.

Su relevancia es exclusivamente para desarrolladores de infraestructura de modelos: permite probar pipelines de carga, procesadores, plantillas de chat y comprobaciones de integracion sin descargar ni ejecutar el checkpoint real de IBM. Esta etiquetado como `test-artifact` precisamente para excluirlo de busquedas de modelos candidatos a produccion. Cualquier uso como modelo funcional seria un error de interpretacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Idefics3ForConditionalGeneration (vision-lenguaje, transformer) |
| Parametros totales | 6.743.936 (segun safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `Idefics3ForConditionalGeneration`, un transformer multimodal que combina un codificador de vision con un decodificador de lenguaje. En este fixture, la configuracion se ha reducido mediante la regla generica de `sweep.py`: el codificador de vision conserva 2 capas (`vision num_hidden_layers 2`) y el decodificador de texto otras 2 (`text num_hidden_layers 2`). Los nombres de tensores coinciden con los del checkpoint real de IBM, de modo que las herramientas que esperan esa estructura pueden cargarlo sin cambios.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron con una comprobacion de sensibilidad a entradas: cada perturbacion de los inputs del contrato desplaza los logits al menos 0,001 (la mas debil, `pixel_values:halve`, produce 0,131). Los ficheros de procesador (`added_tokens.json`, `chat_template.jinja`, `generation_config.json`, `merges.txt`, `preprocessor_config.json`, `processor_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`, entre otros) se copiaron byte a byte desde `ibm-granite/granite-docling-258M`. Los pesos se guardaron en bfloat16 y se verifico que son finitos en float32, bfloat16 y float16 (forward, loss y gradientes).

## Capacidades

- No dispone de capacidades funcionales reales: al tener pesos aleatorios, no genera texto, codigo ni descripciones coherentes.
- Conserva la estructura de un modelo vision-lenguaje (entrada de imagenes y texto) a nivel de configuracion y procesador.
- Incluye la plantilla de chat (`chat_template.jinja`) y los ficheros de tokenizer del modelo base, utiles para probar integraciones de tokenizacion.
- Permite validar la carga del modelo en Transformers y comprobar que los nombres de tensores y la configuracion son compatibles.
- No soporta tool calling, agentes ni razonamiento multi-paso de forma utilizable.
- Capacidades multilingues: no disponibles (hereda el tokenizer del modelo base, pero sin pesos entrenados).

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture para verificar que `Idefics3ForConditionalGeneration` acepta la configuracion y los ficheros de procesador del checkpoint de IBM sin errores.
- Validacion de pipelines de CI/CD: usar el repositorio como dependencia ligera en tests automatizados que comprueben carga, forward y formas de tensores sin descargar los 258M reales.
- Desarrollo de herramientas de inspeccion de modelos: al tener los mismos nombres de tensores que el checkpoint original, sirve para probar utilidades que recorren el grafo de parametros.
- Pruebas de compatibilidad de tokenizer y chat template: los ficheros copiados byte a byte permiten validar plantillas de conversacion y tokenizacion en entornos aislados.
- Verificacion de dtypes y estabilidad numerica: el fixture es finito en float32, bfloat16 y float16, lo que permite probar rutas de ejecucion con distintos tipos sin coste de memoria.
- Reproducibilidad de contratos de framework: el directorio `integrations/transformers/expectations` documenta resultados esperados que pueden usarse como referencia en regresiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad seria carente de sentido.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en bfloat16 (6,7M parametros), aunque el peso real depende de los ficheros de procesador y del codigo de carga.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) e incluso CPU es suficiente.
- Cabe en cualquier GPU consumer y en la mayoria de entornos sin GPU.
- Opciones de despliegue: Transformers es el framework objetivo; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture no se han medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/granite-docling-258M-mic` | 6,7M (fixture) | no disponible | Pruebas de integracion | no disponible | Hugging Face |
| `ibm-granite/granite-docling-258M` | 258M | no disponible | Conversion de documentos a Markdown | no disponible | Hugging Face |
| `HuggingFaceTB/SmolVLM-256M` | 256M | no disponible | Vision-lenguaje ligero | no disponible | Hugging Face |

La comparativa con `SmolVLM-256M` es orientativa por tamano y familia arquitectonica (vision-lenguaje), no por rendimiento, ya que el fixture no es funcional. Frente al checkpoint real de IBM, la unica diferencia relevante es que este ultimo si esta entrenado y orientado a la conversion de documentos.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas carecen de significado.
- Etiquetado como `test-artifact`; no debe incluirse en busquedas de modelos candidatos ni en produccion.
- El nombre "258M" es herencia del modelo base; el recuento real es de 6,7M de parametros, lo que puede inducir a error.
- Licencia no disponible: no se puede asumir permiso de uso comercial.
- Idiomas soportados no disponibles; el tokenizer se hereda del modelo base pero no hay capacidad linguistica real.
- Riesgo de alucinacion total: cualquier texto generado es ruido estadistico.
- No se documentan sesgos porque no hay entrenamiento que los introduzca de forma medible.
- El repositorio indica que algunos ficheros deben regenerarse con `python example/build_fixtures.py --fixture granite-docling-258M-mic`, por lo que la copia puede estar incompleta para ciertos flujos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huggingface-mic/granite-docling-258M-mic
- Modelo base: https://huggingface.co/ibm-granite/granite-docling-258M
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/granite-docling-258M-mic.html
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
