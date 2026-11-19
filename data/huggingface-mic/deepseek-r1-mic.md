# huggingface-mic/DeepSeek-R1-mic

## Resumen

DeepSeek-R1-mic es un artefacto de prueba publicado por el usuario huggingface-mic en Hugging Face. No es un modelo funcional ni un ajuste fino de DeepSeek-R1: es un *fixture* de 16,6 millones de parametros construido a partir de la arquitectura de `deepseek-ai/DeepSeek-R1` mediante reduccion de configuracion (2 capas ocultas) y pesos aleatorios con semilla 17. Su proposito es servir como banco de pruebas para validar integraciones de frameworks (Transformers, contratos de uso, expectativas de ejecucion) sin necesidad de descargar el checkpoint completo de DeepSeek-R1.

El repositorio incluye los pesos reducidos en safetensors, archivos de procesador copiados byte a byte del modelo original (`configuration_deepseek.py`, `modeling_deepseek.py`, `tokenizer.json`, `tokenizer_config.json`, `generation_config.json`, `LICENSE`) y documentacion de contrato (`integration.json`, `integrations/transformers/usage.md`, `build.json`). Esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

Es relevante unicamente en el contexto de ingenieria de infraestructura de IA: permite a desarrolladores de frameworks verificar que su codigo carga, ejecuta y valida modelos con la arquitectura `DeepseekV3ForCausalLM` sin asumir el coste de almacenamiento y computo de un modelo de cientos de miles de millones de parametros. No debe emplearse para inferencia real, generacion de texto ni ninguna tarea de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepseekV3ForCausalLM (transformer, configuracion reducida a 2 capas ocultas) |
| Parametros totales | 16.624.260 |
| Parametros activos | no disponible (el modelo base DeepSeek-R1 es MoE, pero la configuracion del fixture no detalla expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repo incluye el archivo LICENSE copiado del modelo base, pero no se especifica su contenido) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la clase `DeepseekV3ForCausalLM` con una configuracion reducida mediante la regla generica de `sweep.py` del proyecto transformers-mic: `num_hidden_layers` fijado en 2. Los nombres de tensores coinciden exactamente con los del checkpoint real de DeepSeek-R1, lo que permite validar rutas de carga y mapeo de pesos. Los archivos de procesador (`tokenizer.json`, `tokenizer_config.json`, `configuration_deepseek.py`, `modeling_deepseek.py`, `generation_config.json`, `LICENSE`) se copiaron byte a byte desde `deepseek-ai/DeepSeek-R1`.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y superaron una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movio los logits al menos 0,001 (el caso mas debil, `input_ids:roll_batch`, registro 0,932). El modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. Se guardo en bfloat16, el dtype por defecto de DeepSeek-R1. El proceso de construccion esta documentado en `build_fixtures.py` y los hashes y resultados de las puertas en `build.json`.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no han sido entrenados, por lo que no genera texto coherente ni resuelve tareas.
- Sirve como fixture de validacion para frameworks: permite comprobar carga de checkpoint, mapeo de tensores, ejecucion de forward, calculo de loss y retropropagacion de gradientes.
- Valida contratos de integracion: el repo incluye `integration.json` y `integrations/transformers/expectations` para verificar que un framework cumple las expectativas definidas.
- Compatible con la clase `DeepseekV3ForCausalLM` de Transformers, lo que permite probar rutas de codigo especificas de la arquitectura DeepSeek V3.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues reales.
- Prueba de sensibilidad a entradas: util para verificar que perturbaciones en `input_ids` producen cambios en logits por encima de un umbral.

## Casos de uso

- Validacion de integraciones de Transformers: un desarrollador del ecosistema Hugging Face puede cargar el fixture para comprobar que su version de `transformers` maneja correctamente la arquitectura `DeepseekV3ForCausalLM` sin descargar el checkpoint completo de DeepSeek-R1.
- Pruebas de CI/CD en frameworks de inferencia: integrar el fixture en la suite de tests de vLLL, TGI o llama.cpp para verificar rutas de carga de safetensors y mapeo de nombres de tensores de DeepSeek V3 con un repo de 0,1 GB.
- Desarrollo de herramientas de conversion de pesos: validar scripts que transforman safetensors a GGUF u otros formatos usando un modelo de 16,6 M de parametros que replica los nombres de tensores del original.
- Verificacion de contratos de integracion: ejecutar `integrations/transformers/expectations` para comprobar que un framework cumple las expectativas definidas en `integration.json` antes de probar con el modelo real.
- Pruebas de robustez numerica: comprobar que forward, loss y gradientes son finitos en float32, bfloat16 y float16, util para validar kernels y operaciones de atencion en distintas precisiones.
- Docencia y formacion: ilustrar la estructura interna de un modelo DeepSeek V3 (nombres de tensores, configuracion, tokenizer) sin requerir hardware de gran escala.
- Depuracion de pipelines de tokenizacion: usar el tokenizer copiado byte a byte del modelo original para probar flujos de preprocesado con un checkpoint ligero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (16,6 M de parametros a 2 bytes por parametro equivalen a unos 33 MB de pesos, mas overhead de activaciones y tokenizer).
- GPU recomendadas: cualquier GPU consumer, incluida una GTX 1050 o una iGPU con soporte CUDA; tambien funciona en CPU.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: Transformers (carga estandar con `trust_remote_code=True` por el `custom_code`), y potencialmente llama.cpp u Ollama si se convierte a GGUF, aunque no hay soporte documentado.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas con pesos aleatorios, las metricas no representan el comportamiento del modelo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-R1-mic | 16,6 M | no disponible | Fixture de prueba | no disponible | Hugging Face |
| deepseek-ai/DeepSeek-R1 | no disponible en la informacion | no disponible | Modelo de razonamiento en produccion | no disponible en la informacion | Hugging Face |
| Otros fixtures de transformers-mic | variable | no disponible | Pruebas de integracion | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de modelos comparables de la misma categoria (fixtures de prueba) en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y no producen texto coherente. No debe desplegarse en produccion ni emplearse para inferencia real.
- Etiquetado como `test-artifact`: excluido intencionadamente de busquedas de modelos candidatos; su uso esta restringido a pruebas de integracion.
- Licencia no disponible: el repo incluye un archivo LICENSE copiado del modelo base, pero no se especifica su contenido ni las restricciones de uso comercial.
- Idiomas no disponibles: el tokenizer se copia del modelo original, pero el modelo no ha sido entrenado para ningun idioma.
- Riesgo de confusion: el nombre "DeepSeek-R1-mic" puede llevar a error; no es un modelo DeepSeek-R1 reducido funcionalmente, sino un fixture de arquitectura.
- Sin soporte documentado para tool calling, agentes, vision ni audio.
- La configuracion reducida a 2 capas no representa el comportamiento del modelo base; las pruebas de integracion validan rutas de codigo, no calidad de inferencia.
- El campo `pipeline` no esta disponible, lo que impide el uso con la API de inferencia de Hugging Face.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/DeepSeek-R1-mic
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1
- Contrato de integracion: https://huggingface.co/huggingface-mic/DeepSeek-R1-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/DeepSeek-R1-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/DeepSeek-R1-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/DeepSeek-R1-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/DeepSeek-R1-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Perfil del autor: https://huggingface.co/huggingface-mic
