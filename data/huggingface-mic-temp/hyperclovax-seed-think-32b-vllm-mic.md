# huggingface-mic-temp/HyperCLOVAX-SEED-Think-32B-vllm-mic

## Resumen

HyperCLOVAX-SEED-Think-32B-vllm-mic es un artefacto de prueba (fixture) publicado en Hugging Face por la cuenta huggingface-mic-temp, no un modelo utilizable. Se trata de una version reducida artificialmente del modelo naver-hyperclovax/HyperCLOVAX-SEED-Think-32B, un modelo vision-lenguaje de 32B parametros de Naver, recortado a 9.777.408 parametros reales (9,8M) para servir como banco de pruebas de integracion con frameworks.

El proposito del repositorio es validar contratos de integracion (por ejemplo, con vLLM y Transformers) sin necesidad de descargar los pesos completos del modelo original. La model card lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos, y senala que los pesos son aleatorios y estan sobreajustados a un unico paso de entrenamiento de 100 pasos.

Por tanto, esta ficha documenta un objeto de ingenieria de pruebas, no un modelo de produccion. Cualquier evaluacion de capacidades, benchmarks o calidad de generacion debe remitirse al modelo base original de Naver, del que este fixture hereda unicamente la arquitectura declarada y los ficheros de procesador copiados byte a byte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HyperCLOVAXVisionV2ForConditionalGeneration (vision-lenguaje) |
| Parametros totales | 9.777.408 (fixture recortado; el modelo base declara 32B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio copia un fichero LICENSE del modelo base, pero no se especifica su contenido) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture conserva la clase de arquitectura del modelo base, `HyperCLOVAXVisionV2ForConditionalGeneration`, un modelo multimodal de generacion condicional que combina un codificador visual con un decodificador de texto. El recorte se realizo con la regla generica de `sweep.py` del proyecto transformers-mic, reduciendo el numero de capas ocultas del componente de texto a 2 (`text num_hidden_layers 2`). Los nombres de tensores coinciden con los del checkpoint real, de modo que el codigo de carga e inferencia puede ejercitarse sin cambios.

No hubo entrenamiento real: los pesos son aleatorios y estan sobreajustados al paso de entrenamiento del contrato (100 pasos). La model card indica que los pesos aleatorios no superaron la puerta de sensibilidad a la entrada (`attention_mask:all_ones` movio los logits solo 0,00061 frente a un umbral de 0,001), lo que motivo el sobreajuste. Los ficheros de procesador (tokenizer, `chat_template.jinja`, `generation_config.json`, `processor_config.json`, `special_tokens_map.json`, entre otros) se copiaron byte a byte desde el modelo base. Los pesos son finitos en float32, bfloat16 y float16 tanto en forward como en loss y gradientes.

## Capacidades

- El fixture no tiene capacidades generativas reales: sus pesos son aleatorios y sobreajustados a un unico paso, por lo que su salida no es texto coherente.
- Sirve para validar la carga del modelo con la clase `HyperCLOVAXVisionV2ForConditionalGeneration` y comprobar que los nombres de tensores coinciden con el checkpoint original.
- Permite probar el pipeline de procesador (tokenizer, plantilla de chat, configuracion de generacion) heredado del modelo base.
- Util para tests de integracion con vLLM y Transformers en CI, sin descargar los 32B del modelo original.
- No dispone de tool calling, agentes, modo thinking ni capacidades multilingues verificables en este artefacto.
- La model card no documenta capacidades de vision, audio ni razonamiento para el fixture.

## Casos de uso

- Pruebas de integracion en CI/CD: ejecutar la carga del modelo y un forward pass con el fixture para detectar roturas en la clase `HyperCLOVAXVisionV2ForConditionalGeneration` antes de desplegar el modelo real.
- Validacion de contratos con vLLM: comprobar que el framework acepta la configuracion y los nombres de tensores del checkpoint de HyperCLOVAX sin necesidad de GPU de gran capacidad.
- Verificacion de ficheros de procesador: testear que el tokenizer, la plantilla de chat y `generation_config.json` copiados del modelo base se cargan correctamente en el pipeline de Transformers.
- Regression testing de frameworks: usar el fixture como caso fijo para detectar cambios incompatibles en versiones nuevas de Transformers o vLLM.
- Desarrollo de herramientas de inspeccion de modelos: validar scripts que recorren tensores, configuraciones y metadatos sin consumir almacenamiento ni ancho de banda.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture HyperCLOVAX-SEED-Think-32B-vllm-mic` y comparar hashes registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El fixture no es un modelo funcional y no tiene sentido evaluarlo con MMLU, HumanEval, GSM8K u otras pruebas de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con 9,8M parametros en bfloat16 (unos 20 MB de pesos), mas el coste del grafo y del procesador.
- GPU recomendadas: cualquier GPU consumer moderna sirve para pruebas; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para tests basicos.
- Opciones de despliegue: Transformers y vLLM, segun el contrato del repositorio; llama.cpp y Ollama no estan documentados para este fixture.
- Latencia y throughput: no disponibles; al ser un artefacto de prueba no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyperCLOVAX-SEED-Think-32B-vllm-mic (este) | 9,8M (fixture) | no disponible | Test de integracion | no disponible | Hugging Face |
| naver-hyperclovax/HyperCLOVAX-SEED-Think-32B | 32B (declarado) | no disponible | Modelo vision-lenguaje real | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | variable | no disponible | Test de integracion | no disponible | Hugging Face |

La comparativa relevante es con el modelo base: este fixture reproduce su arquitectura y procesador a escala reducida, pero no su calidad ni sus capacidades. Frente a otros fixtures del mismo proyecto, comparte el mismo enfoque de recorte generico y validacion de contratos.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y estan sobreajustados a un unico paso de entrenamiento.
- Las salidas no son texto coherente ni reflejan el comportamiento del modelo base de Naver.
- La model card lo marca como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- La licencia no esta disponible; el repositorio incluye un fichero LICENSE copiado del modelo base, pero su contenido no se especifica en la informacion proporcionada.
- No se documentan idiomas soportados, contexto maximo ni regimen de cuantizacion.
- Riesgo de confusion: el nombre incluye "32B" aunque el artefacto tiene 9,8M parametros; conviene verificar siempre el conteo real de safetensors.
- No apto para evaluaciones de sesgo, alucinacion o calidad; esas metricas deben obtenerse del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic-temp/HyperCLOVAX-SEED-Think-32B-vllm-mic
- Modelo base: https://huggingface.co/naver-hyperclovax/HyperCLOVAX-SEED-Think-32B
- Explicacion del recorte del fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/HyperCLOVAX-SEED-Think-32B-vllm-mic.html
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla generica de recorte (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
