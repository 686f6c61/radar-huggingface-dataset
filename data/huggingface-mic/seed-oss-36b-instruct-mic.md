# huggingface-mic/Seed-OSS-36B-Instruct-mic

## Resumen

Seed-OSS-36B-Instruct-mic es un artefacto de prueba (test artifact) publicado por el usuario huggingface-mic, no un modelo utilizable. Se trata de una version reducida ("slim fixture") del modelo ByteDance-Seed/Seed-OSS-36B-Instruct, generada con el objetivo de validar integraciones de frameworks de inferencia y contratos de uso, no de servir como modelo de lenguaje funcional. El repositorio contiene pesos reducidos, ejemplos de uso ejecutables y las expectativas de integracion con Transformers en un unico paquete.

El fixture conserva la arquitectura `SeedOssForCausalLM` del modelo original pero con una configuracion drasticamente reducida (`num_hidden_layers` = 2) y pesos aleatorios (semilla 17), sumando 19.931.712 parametros en lugar de los aproximadamente 36.000 millones que sugiere el nombre del modelo base. Los ficheros de procesador (tokenizer, chat template, generation config) se copiaron byte a byte del checkpoint original, de modo que el fixture reproduce fielmente la interfaz de entrada y salida del modelo real.

Su relevancia es exclusivamente para desarrolladores de infraestructura de IA: permite probar pipelines de carga, contratos de integracion y validaciones de framework sin descargar decenas de gigabytes de pesos reales. El propio autor lo etiqueta como `test-artifact` para excluirlo de busquedas de modelos candidatos. No debe emplearse para generacion de texto, evaluacion de calidad ni ningun uso productivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SeedOssForCausalLM (transformer causal, configuracion reducida a 2 capas ocultas) |
| Parametros totales | 19.931.712 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repo incluye `LICENSE.txt` copiado del modelo base, pero no se especifica su contenido) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un transformer causal de la familia Seed-OSS, instanciado mediante la clase `SeedOssForCausalLM` de Transformers. La configuracion se ha reducido con la regla generica de `sweep.py`, fijando `num_hidden_layers` en 2. Los pesos son aleatorios (semilla 17) y no han pasado por ningun proceso de entrenamiento, RLHF ni DPO. El autor justifica la ausencia de entrenamiento indicando que los pesos superaron la "input-sensitivity gate": cada perturbacion de las entradas del contrato movio los logits al menos 0,001 (el caso mas debil, `input_ids:roll_batch`, registro 0,841).

Los nombres de tensores coinciden exactamente con los del checkpoint real, y el fixture es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. Se guardo en bfloat16, el dtype con el que carga por defecto ByteDance-Seed/Seed-OSS-36B-Instruct. Los ficheros de procesador (`LICENSE.txt`, `MODEL_CARD.md`, `chat_template.jinja`, `generation_config.json`, `special_tokens_map.json`, `thinking_budget.png`, `tokenizer.json`, `tokenizer_config.json`) se copiaron byte a byte del modelo base.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen texto coherente.
- Reproduce la interfaz de tokenizacion y chat template del modelo base Seed-OSS-36B-Instruct.
- Permite validar la carga del modelo con Transformers mediante la clase `SeedOssForCausalLM`.
- Sirve como fixture para pruebas de contratos de integracion (manifiesto en `integration.json`).
- Mantiene los mismos nombres de tensores que el checkpoint real, util para verificar mapeos de pesos.
- No dispone de capacidades de razonamiento, codigo, matematicas, vision, tool calling ni agentes.

## Casos de uso

- Pruebas de integracion en CI: cargar el fixture con Transformers para verificar que el pipeline de inferencia acepta la arquitectura SeedOssForCausalLM sin descargar los pesos reales de 36B.
- Validacion de contratos de framework: comprobar que las expectativas documentadas en `integrations/transformers/expectations` se cumplen con un modelo de 19,9M de parametros.
- Desarrollo de herramientas de conversion de pesos: usar los nombres de tensores identicos al checkpoint real para probar scripts de mapeo y sharding.
- Test de tokenizadores y plantillas de chat: al copiarse `tokenizer.json` y `chat_template.jinja` byte a byte, permite validar el preprocesado de prompts del modelo base sin cargar el modelo completo.
- Verificacion de dtypes: comprobar que el modelo es finito en float32, bfloat16 y float16 en forward, loss y gradientes, util para pipelines de entrenamiento.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture Seed-OSS-36B-Instruct-mic` y comparar hashes registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (19,9M de parametros, aproximadamente 40 MB de pesos mas overhead de activaciones).
- GPU recomendadas: cualquier GPU consumer o incluso CPU es suficiente; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer (GTX 1060, RTX 3060, etc.) y en CPU.
- Opciones de despliegue: Transformers con la clase `SeedOssForCausalLM`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia seria minima pero irrelevante para evaluacion de rendimiento real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Seed-OSS-36B-Instruct-mic | 19,9M (fixture) | no disponible | Test artifact | no disponible | Hugging Face |
| ByteDance-Seed/Seed-OSS-36B-Instruct | ~36B (segun nombre) | no disponible | Modelo instructivo real | no disponible | Hugging Face |
| Otros fixtures de huggingface-mic | variable | no disponible | Test artifacts | no disponible | Hugging Face |

La comparativa relevante es con el modelo base del que deriva: el fixture no compite en calidad ni rendimiento, solo replica su interfaz para pruebas de integracion.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no genera texto coherente ni responde a instrucciones; cualquier salida es ruido estadistico.
- Etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe usarse en produccion.
- No se especifica la licencia en la model card; el `LICENSE.txt` copiado del modelo base puede imponer restricciones no documentadas aqui.
- No hay informacion sobre sesgos, alucinacion o limitaciones de idioma porque no es un modelo entrenado.
- El nombre "36B" del repositorio es enganoso: el fixture tiene 19,9M de parametros, no 36.000 millones.
- No se documentan capacidades de tool calling, agentes, vision ni thinking mode; no deben asumirse.
- La fecha de creacion indicada (2026-10-29) es posterior a la fecha actual de referencia, lo que sugiere que los metadatos pueden ser inconsistentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Seed-OSS-36B-Instruct-mic
- Modelo base: https://huggingface.co/ByteDance-Seed/Seed-OSS-36B-Instruct
- Como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Seed-OSS-36B-Instruct-mic.html
- Script `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
