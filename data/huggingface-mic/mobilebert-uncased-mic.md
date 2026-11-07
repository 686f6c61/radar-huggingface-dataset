# huggingface-mic/mobilebert-uncased-mic

## Resumen

`huggingface-mic/mobilebert-uncased-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic` en Hugging Face. No se trata de un modelo entrenado ni utilizable en produccion: es una version reducida artificialmente del checkpoint `google/mobilebert-uncased`, generada para validar contratos de integracion y expectativas de framework dentro del proyecto `transformers-mic`. El autor lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

El fixture conserva la arquitectura `MobileBertForPreTraining` pero con una configuracion reducida a 2 capas ocultas, lo que da un total de 2.069.180 parametros segun los pesos en safetensors. Los pesos son aleatorios (semilla 17), no entrenados, y los ficheros de procesador (`tokenizer.json`, `vocab.txt`) se copian byte a byte desde el modelo original de Google. El objetivo es disponer de un checkpoint ligero con los mismos nombres de tensor que el modelo real para pruebas de integracion.

Su relevancia es por tanto instrumental: sirve a desarrolladores que trabajan en el ecosistema `transformers-mic` para verificar que sus integraciones (Transformers, uso ejecutable, expectativas de framework) funcionan correctamente sin necesidad de descargar el MobileBERT completo. Para cualquier tarea de NLP real debe utilizarse el modelo base `google/mobilebert-uncased`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileBERT (transformer tipo BERT con cuellos de botella), clase `MobileBertForPreTraining` |
| Parametros totales | 2.069.180 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; verificado finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura MobileBERT, una variante de BERT con cuellos de botella lineales que reduce el coste computacional manteniendo la profundidad. En este caso concreto, el fixture aplica la regla generica de reduccion de `sweep.py` del repositorio `transformers-mic`, fijando `num_hidden_layers` a 2. Conserva los mismos nombres de tensor que el checkpoint real `google/mobilebert-uncased`, de modo que cualquier codigo que espere la estructura de pesos de MobileBERT puede cargarlo sin cambios.

No hubo entrenamiento. Los pesos se inicializan de forma aleatoria con semilla 17 y se validan mediante una "puerta de sensibilidad de entrada": cada perturbacion de las entradas del contrato debe mover los logits al menos 0,001 (la perturbacion mas debil, `input_ids:reverse`, produce 0,162). Los ficheros de tokenizacion se copian literalmente desde el modelo original. El build queda registrado en `build.json` con fuentes fijadas, resultados de la puerta y hashes de ficheros. No se dispone de informacion sobre datos de entrenamiento, RLHF ni innovaciones de decodificacion, porque el modelo no fue entrenado.

## Capacidades

- No es un modelo funcional: no genera texto, no razona, no responde a prompts de forma util.
- Conserva la interfaz de `MobileBertForPreTraining` (cabezas de pretraining MLM y NSP) con pesos aleatorios.
- Sirve como fixture para verificar carga de pesos, nombres de tensor y compatibilidad de tokenizador.
- Permite validar integraciones de framework (Transformers) y contratos de ejecucion definidos en `integration.json`.
- Soporta ejecucion en float32, bfloat16 y float16 con resultados finitos en forward, perdida y gradientes.
- No dispone de tool calling, capacidades de agente, vision, audio ni modo de razonamiento.
- Capacidades multilingues: no disponible (depende del tokenizador heredado de `google/mobilebert-uncased`, no verificado en este fixture).

## Casos de uso

- Pruebas de integracion en CI: cargar el fixture en pipelines de integracion continua para comprobar que el codigo de carga de MobileBERT funciona sin descargar el checkpoint completo de 25M de parametros.
- Validacion de contratos de framework: verificar que `integration.json` y el directorio de expectativas de Transformers se cumplen ejecutando el fixture en cada cambio del repositorio `transformers-mic`.
- Desarrollo de utilidades de serializacion: comprobar que herramientas de conversion, inspeccion o empaquetado de safetensors manejan correctamente los nombres de tensor de MobileBERT.
- Test de compatibilidad de tokenizador: validar que `tokenizer.json` y `vocab.txt` copiados del modelo original se cargan y producen las mismas entradas en distintos entornos.
- Pruebas de precision numerica: ejecutar forward, perdida y gradientes en float32, bfloat16 y float16 para detectar problemas de estabilidad en frameworks o hardware nuevos.
- Reproduccion de builds: reconstruir el fixture con `python example/build_fixtures.py --fixture mobilebert-uncased-mic` y comparar hashes con `build.json` para auditar la reproducibilidad del pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, GLUE, SQuAD, etc.) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (2,07M de parametros, aproximadamente 8 MB de pesos); en float16 alrededor de 4 MB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; tambien funciona en CPU sin problema.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 2060, RTX 4090, etc.) e incluso en entornos con muy poca memoria.
- Opciones de despliegue: Transformers con PyTorch es la via documentada en `integrations/transformers/usage.md`; otras opciones (vLLM, llama.cpp, Ollama, TGI) no estan documentadas para este fixture.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas y 2M de parametros, la latencia seria del orden de microsegundos a milisegundos en GPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/mobilebert-uncased-mic | 2.069.180 | no disponible | Fixture de test | no disponible | Hugging Face |
| google/mobilebert-uncased | no disponible en la informacion proporcionada | no disponible | Modelo MobileBERT preentrenado real | no disponible en la informacion proporcionada | Hugging Face |

No se dispone de informacion suficiente para comparar con otras alternativas de la misma categoria (fixtures de test o modelos MobileBERT reducidos).

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y no han sido entrenados; las salidas no tienen significado.
- Etiquetado como `test-artifact`: el autor lo excluye explicitamente de la busqueda de modelos candidatos.
- Licencia no disponible: no se puede asumir uso comercial sin consultar la licencia del modelo base `google/mobilebert-uncased`.
- Idiomas no disponibles: no se ha verificado el comportamiento multilingue del tokenizador en este fixture.
- Longitud de contexto no disponible: no se documenta en la informacion proporcionada.
- Riesgo de confusion: un usuario podria descargarlo pensando que es un MobileBERT funcional; el nombre y la ausencia de pipeline lo desaconsejan, pero conviene verificar siempre la etiqueta `test-artifact`.
- No apto para produccion, evaluacion de calidad ni generacion de texto.

## Enlaces

- Repositorio Hugging Face del fixture: https://huggingface.co/huggingface-mic/mobilebert-uncased-mic
- Modelo base: https://huggingface.co/google/mobilebert-uncased
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/mobilebert-uncased-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/mobilebert-uncased-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/mobilebert-uncased-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/mobilebert-uncased-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/mobilebert-uncased-mic.html
- Repositorio `transformers-mic` (script `sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Repositorio `transformers-mic` (script `build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
