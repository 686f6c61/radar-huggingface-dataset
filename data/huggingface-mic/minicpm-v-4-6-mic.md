# huggingface-mic/MiniCPM-V-4.6-mic

## Resumen

MiniCPM-V-4.6-mic es un artefacto de prueba (fixture) publicado por huggingface-mic, no un modelo utilizable. Se trata de una version reducida del modelo multimodal openbmb/MiniCPM-V-4.6, con solo 16,7 millones de parametros frente a los miles de millones del modelo original. Su proposito es servir como banco de pruebas para la infraestructura de integracion de Transformers, verificando que el pipeline de carga, procesado y ejecucion funciona correctamente con la arquitectura MiniCPMV4_6ForConditionalGeneration.

El repositorio incluye pesos reducidos, ejemplos de uso ejecutables y un directorio de expectativas de framework, todo empaquetado con los ficheros de procesador copiados byte a byte del modelo original. Los pesos son aleatorios (semilla 17), generados tras superar una puerta de sensibilidad a la entrada que verifica que las perturbaciones en las entradas mueven los logits al menos 0,001. El modelo esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

Es relevante exclusivamente para desarrolladores que trabajen en la integracion de modelos MiniCPM-V en Transformers o en la validacion de pipelines de CI. No debe confundirse con el modelo real openbmb/MiniCPM-V-4.6, que si es un modelo de produccion. Cualquier uso en inferencia real carece de sentido porque los pesos no han sido entrenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniCPMV4_6ForConditionalGeneration (transformer multimodal imagen-texto) |
| Parametros totales | 16.713.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura es MiniCPMV4_6ForConditionalGeneration, la misma clase que el modelo base openbmb/MiniCPM-V-4.6, pero con la configuracion reducida mediante la regla generica de `sweep.py`: 2 capas ocultas en el modulo de texto y 2 capas ocultas en el modulo de vision. Los ficheros de procesador (`chat_template.jinja`, `generation_config.json`, `preprocessor_config.json`, `tokenizer.json`, `tokenizer_config.json`) se copiaron byte a byte del checkpoint original, de modo que el contrato de entrada y el tokenizador son identicos a los del modelo real.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se generaron tras superar la puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato mueve los logits al menos 0,001 (la mas debil, `pixel_values:halve`, produce 0,0876). Los tensores conservan los mismos nombres que el checkpoint real y el modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave de fixture es `3cc8a0b237e3`, que cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el proceso de reduccion.

## Capacidades

- Carga y ejecucion en Transformers con la clase MiniCPMV4_6ForConditionalGeneration.
- Procesamiento de entradas imagen-texto con el procesador del modelo original (tokenizador y preprocessor identicos byte a byte).
- Verificacion de contratos de framework: el repositorio incluye un directorio de expectativas (`integrations/transformers/expectations`) para validar el comportamiento esperado.
- Ejecucion de forward, calculo de loss y gradientes en float32, bfloat16 y float16.
- Generacion de logits sensibles a perturbaciones de entrada, util para pruebas de integracion.
- No dispone de capacidades reales de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni multilinguismo, porque los pesos no estan entrenados.

## Casos de uso

- Pruebas de integracion en Transformers: validar que la clase MiniCPMV4_6ForConditionalGeneration carga, procesa y ejecuta correctamente con el contrato del modelo real, sin necesidad de descargar el checkpoint completo.
- CI/CD de pipelines multimodales: ejecutar tests de humo en cada commit usando un artefacto de 0,2 GB en lugar del modelo completo, reduciendo tiempo y coste de infraestructura.
- Validacion de contratos de procesador: comprobar que los ficheros de tokenizador y preprocessor del modelo original se integran correctamente en el pipeline, ya que son copias byte a byte.
- Desarrollo de herramientas de reduccion de modelos: servir como caso de referencia del funcionamiento de `sweep.py` y `build_fixtures.py` para generar fixtures de otros checkpoints.
- Verificacion de precision numerica: comprobar que el pipeline produce resultados finitos en float32, bfloat16 y float16 antes de desplegar el modelo real.
- Pruebas de sensibilidad a la entrada: usar las perturbaciones documentadas (por ejemplo `pixel_values:halve`) para validar que los cambios en las entradas se propagan a los logits.
- Formacion de nuevos contribuidores: disponer de un repositorio pequeno con pesos, uso ejecutable y expectativas en un solo lugar para entender el flujo de integracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K, etc.) carece de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (16,7 M de parametros, aproximadamente 67 MB de pesos, mas activaciones y buffers del procesador de vision).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el cuello de botella es el procesador de vision, no los pesos.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: Transformers con la clase MiniCPMV4_6ForConditionalGeneration; vLLM, llama.cpp, Ollama y TGI no estan documentados para este artefacto.
- Latencia y throughput: no disponibles; al ser un fixture, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V-4.6-mic | 16,7 M | no disponible | Fixture de pruebas | no disponible | Hugging Face |
| openbmb/MiniCPM-V-4.6 | no disponible en la informacion | no disponible | Modelo multimodal de produccion | no disponible | Hugging Face |
| Otros fixtures de huggingface-mic | variable | no disponible | Pruebas de integracion | no disponible | Hugging Face |

La comparativa relevante es con el modelo base openbmb/MiniCPM-V-4.6: misma arquitectura y mismo procesador, pero con capas reducidas a 2 en texto y 2 en vision, pesos aleatorios y un tamano de repositorio de 0,2 GB frente al checkpoint completo. No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y no han sido entrenados; las salidas no tienen significado.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe usarse en produccion ni en evaluaciones de calidad.
- La licencia no esta disponible en la informacion, lo que impide confirmar condiciones de uso comercial.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, limitaciones de contexto o idioma del modelo base en la informacion proporcionada.
- El modelo base openbmb/MiniCPM-V-4.6 tiene sus propias condiciones de licencia y uso, que deben consultarse por separado.
- La configuracion reducida (2 capas en texto y 2 en vision) no reproduce el comportamiento numerico del modelo real; solo valida el contrato de integracion.
- Los ficheros de procesador son identicos al original, pero el resto de ficheros debe regenerarse con `python example/build_fixtures.py --fixture MiniCPM-V-4.6-mic`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/MiniCPM-V-4.6-mic
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.6
- Manifiesto de contrato: integration.json (en el repositorio)
- Uso con Transformers: integrations/transformers/usage.md (en el repositorio)
- Expectativas de Transformers: integrations/transformers/expectations (en el repositorio)
- Procedencia del fixture: build.json (en el repositorio)
- Como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/MiniCPM-V-4.6-mic.html
- Script de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
