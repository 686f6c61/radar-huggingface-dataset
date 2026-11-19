# huggingface-mic/Llama-3.2-11B-Vision-Instruct-mic

## Resumen

Llama-3.2-11B-Vision-Instruct-mic es un artefacto de prueba (fixture) publicado por huggingface-mic, no un modelo utilizable. Se trata de una version reducida artificialmente del checkpoint unsloth/Llama-3.2-11B-Vision-Instruct, con arquitectura MllamaForConditionalGeneration pero con solo 2 capas ocultas en el codificador de vision y 2 capas ocultas en el decodificador de texto. El resultado es un modelo de aproximadamente 20,7 millones de parametros, muy lejos de los 11.000 millones del checkpoint original, y con pesos obtenidos mediante sobreajuste a un unico paso de entrenamiento de 50 iteraciones.

El proposito del artefacto es servir como fixture contractual para pruebas de integracion de frameworks (concretamente Transformers), verificando que las expectativas de procesamiento, nombres de tensores y comportamiento numerico se mantienen entre el checkpoint real y una version reducida. Los ficheros de procesador (tokenizer, chat template, preprocessor config, generation config y special tokens map) se copian byte a byte desde el modelo base, mientras que los pesos se generan de nuevo con la misma estructura de tensores que el checkpoint original.

Es relevante unicamente en el contexto de testing de pipelines de integracion de modelos. No debe emplearse para inferencia real, generacion de texto, vision ni ninguna tarea downstream: el propio autor lo etiqueta como `test-artifact` para excluirlo de busquedas de modelos candidatos. Cualquier uso productivo o de evaluacion de capacidades seria un error de interpretacion del artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MllamaForConditionalGeneration (variante reducida: 2 capas de vision, 2 capas de texto) |
| Parametros totales | 20.669.621 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la configuracion del checkpoint base, pero no verificada en el fixture) |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16; el autor indica que el forward es finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 0,1 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es MllamaForConditionalGeneration, el mismo tipo de modelo que Llama 3.2 Vision, que combina un codificador de vision con un decodificador de texto tipo transformer. En este fixture, la configuracion se ha reducido mediante la regla generica de `sweep.py` del repositorio transformers-mic, dejando el codificador de vision en 2 capas ocultas y el decodificador de texto en 2 capas ocultas. Los nombres de tensores coinciden con los del checkpoint real, lo que permite validar contratos de integracion sin cargar los pesos completos.

El entrenamiento no es un entrenamiento real: los pesos se obtienen por sobreajuste (overfit) a un unico paso de entrenamiento de 50 iteraciones. El autor documenta que pesos aleatorios fallaron la puerta de sensibilidad a la entrada (`pixel_values:roll_batch` movia los logits solo 0, con umbral 0,001), por lo que se opto por sobreajustar para que el fixture pase las comprobaciones de contrato. Los ficheros de procesador se copian byte a byte desde unsloth/Llama-3.2-11B-Vision-Instruct. El artefacto se guarda en bfloat16, el dtype por defecto del checkpoint base, y se verifica que el forward, la loss y los gradientes son finitos en float32, bfloat16 y float16.

## Capacidades

- No es un modelo funcional: no genera texto coherente ni describe imagenes, ya que sus pesos son un sobreajuste a un paso de entrenamiento sobre una arquitectura truncada.
- Conserva la estructura de tensores y los ficheros de procesador del checkpoint Llama 3.2 11B Vision Instruct, lo que permite validar contratos de carga e integracion en Transformers.
- Sirve como fixture de pruebas para verificar expectativas de framework (nombres de tensores, formas, dtypes y comportamiento numerico finito).
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues verificadas en este artefacto.
- No tiene modo thinking, vision real ni audio: el codificador de vision esta truncado a 2 capas y no ha sido entrenado para ninguna tarea.

## Casos de uso

- Pruebas de integracion de Transformers: cargar el fixture para verificar que `MllamaForConditionalGeneration` se instancia, que los nombres de tensores coinciden con el checkpoint real y que el forward produce salidas finitas en float32, bfloat16 y float16.
- Validacion de contratos de procesador: comprobar que tokenizer, chat template, preprocessor config, generation config y special tokens map se cargan correctamente y coinciden byte a byte con el modelo base.
- CI/CD de librerias de inferencia: usar el fixture como sustituto ligero del checkpoint de 11B en tests de regresion que no requieren pesos reales, reduciendo el coste de almacenamiento y tiempo de ejecucion.
- Verificacion de puertas de sensibilidad: reproducir la comprobacion `pixel_values:roll_batch` para asegurar que los pipelines de prueba detectan cambios en las entradas de vision.
- Desarrollo de herramientas de shrink de modelos: servir como ejemplo de referencia de como reducir un checkpoint preservando estructura de tensores y ficheros de procesador.
- Documentacion de expectativas de framework: enlazar `integrations/transformers/expectations` como especificacion ejecutable del comportamiento esperado al cargar Llama 3.2 Vision en Transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16, dado el tamano del repo (0,1 GB) y los 20,7 millones de parametros.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es suficiente; tambien CPU.
- Cabe en GPU consumer: si, con holgura; incluso en iGPU o CPU.
- Opciones de despliegue: Transformers (principal), llama.cpp u Ollama solo si se convierte el fixture a GGUF, lo cual no esta documentado; vLLM y TGI no estan verificados para este artefacto.
- Latencia y throughput: no disponibles; al ser un fixture de pruebas, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Proposito |
|---|---|---|---|---|---|
| Llama-3.2-11B-Vision-Instruct-mic | 20,7 M | no disponible | no disponible | Hugging Face (fixture) | Test artifact |
| unsloth/Llama-3.2-11B-Vision-Instruct | 11.000 M (aprox.) | no disponible | Llama 3.2 Community License (segun modelo base) | Hugging Face | Modelo real multimodal |
| Meta Llama 3.2 11B Vision Instruct | 11.000 M (aprox.) | no disponible | Llama 3.2 Community License | Hugging Face (meta-llama) | Modelo real multimodal |

La comparativa con otros fixtures de la misma categoria (artefactos de prueba de huggingface-mic) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: el autor lo etiqueta explicitamente como `test-artifact` y advierte que no debe usarse como modelo candidato ni para inferencia real.
- Pesos sobreajustados a un unico paso de entrenamiento: cualquier salida generada sera incoherente y no refleja el comportamiento del checkpoint base.
- Arquitectura truncada: 2 capas de vision y 2 capas de texto, frente a la profundidad del modelo original; las capacidades multimodales no estan presentes.
- Licencia no disponible en la informacion proporcionada; no se puede confirmar el regimen de uso comercial.
- Idiomas soportados no disponibles; no se puede verificar cobertura multilingue.
- Sesgos conocidos: no disponibles; no se han evaluado sesgos en este artefacto.
- Riesgo de alucinacion: irrelevante en la practica porque el modelo no produce texto coherente, pero cualquier uso como si fuera el modelo real seria un error grave.
- Contexto y limites de idioma no verificados: la configuracion heredada del checkpoint base no ha sido validada en el fixture.
- Para produccion: no usar; emplear el checkpoint unsloth/Llama-3.2-11B-Vision-Instruct o meta-llama/Llama-3.2-11B-Vision-Instruct.

## Enlaces

- [Hugging Face: huggingface-mic/Llama-3.2-11B-Vision-Instruct-mic](https://huggingface.co/huggingface-mic/Llama-3.2-11B-Vision-Instruct-mic)
- [Modelo base: unsloth/Llama-3.2-11B-Vision-Instruct](https://huggingface.co/unsloth/Llama-3.2-11B-Vision-Instruct)
- [Contract manifest (integration.json)](https://huggingface.co/huggingface-mic/Llama-3.2-11B-Vision-Instruct-mic/blob/main/integration.json)
- [Transformers usage](https://huggingface.co/huggingface-mic/Llama-3.2-11B-Vision-Instruct-mic/blob/main/integrations/transformers/usage.md)
- [Transformers expectations](https://huggingface.co/huggingface-mic/Llama-3.2-11B-Vision-Instruct-mic/tree/main/integrations/transformers/expectations)
- [Fixture provenance (build.json)](https://huggingface.co/huggingface-mic/Llama-3.2-11B-Vision-Instruct-mic/blob/main/build.json)
- [Como se redujo el fixture](https://huggingface-mic-mic-coverage.static.hf.space/shrink/Llama-3.2-11B-Vision-Instruct-mic.html)
- [Repositorio transformers-mic (sweep.py)](https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py)
- [Repositorio transformers-mic (build_fixtures.py)](https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py)
