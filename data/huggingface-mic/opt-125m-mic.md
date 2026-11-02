# huggingface-mic/opt-125m-mic

## Resumen

`huggingface-mic/opt-125m-mic` es un artefacto de prueba (test fixture) publicado por la organizacion `huggingface-mic` en HuggingFace. No se trata de un modelo entrenado ni utilizable para inferencia real: es una version "adelgazada" del checkpoint `facebook/opt-125m` pensada para validar contratos de integracion entre Transformers y distintos frameworks. El repositorio incluye pesos reducidos, ejemplos de uso ejecutables y un directorio de expectativas de framework, todo empaquetado de forma reproducible.

El fixture conserva la arquitectura del modelo original (`OPTForCausalLM`) pero reduce el numero de capas ocultas a 2, lo que deja el total en aproximadamente 1,0 millones de parametros. Los pesos son aleatorios (semilla 17) y pasaron una puerta de sensibilidad a la entrada que verifica que cada perturbacion de las entradas del contrato mueve los logits al menos 0,001. Los ficheros del procesador (tokenizer, `generation_config.json`, `LICENSE.md`, etc.) se copiaron byte a byte desde `facebook/opt-125m`.

Su relevancia es puramente de ingenieria: sirve como banco de pruebas ligero para CI, validacion de integraciones y comprobacion de contratos de framework, no como modelo de lenguaje. Cualquier evaluacion de capacidades, calidad o rendimiento sobre este artefacto carece de sentido, ya que sus pesos no han sido entrenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OPT (`OPTForCausalLM`), transformer decoder causal |
| Parametros totales | ~1,0 M (fixture adelgazado; el modelo base `facebook/opt-125m` tiene 125 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos guardados en float16; finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se copia `LICENSE.md` del modelo base, pero no se especifica el tipo) |
| Formato de pesos | safetensors/PyTorch (repositorio de 0,2 GB, pesos en float16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder causal de la familia OPT, con la misma estructura de nombres de tensores que `facebook/opt-125m` pero con `num_hidden_layers` reducido a 2 mediante la regla generica de `sweep.py` del proyecto `transformers-mic`. Los ficheros del procesador (tokenizer BPE, `special_tokens_map.json`, `generation_config.json`, `vocab.json`, `merges.txt`) se copiaron sin modificaciones desde el checkpoint original, de modo que la interfaz de tokenizacion es identica a la del modelo real.

No hubo entrenamiento. Los pesos se inicializaron aleatoriamente con semilla 17 y se validaron con una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato debe desplazar los logits al menos 0,001 (la mas debil, `input_ids:roll_batch`, produjo 0,00429). El artefacto se genera con `build_fixtures.py` y `build.json` registra las fuentes fijadas, los resultados de la puerta y los hashes de los ficheros. Se guarda en float16, el dtype por defecto de `facebook/opt-125m`, y es finito en forward, loss y gradientes tanto en float32 como en bfloat16 y float16.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen texto coherente.
- Sirve como fixture de contrato para validar integraciones de Transformers con `OPTForCausalLM`.
- Permite comprobar la compatibilidad de nombres de tensores y del procesador con el checkpoint real.
- Util como banco de pruebas en CI para detectar regresiones en pipelines de carga, tokenizacion y ejecucion.
- No dispone de tool calling, agentes, vision, audio ni modo de razonamiento.
- No tiene capacidades multilingues reales; solo hereda la interfaz del tokenizer de OPT.

## Casos de uso

- Pruebas de integracion en CI: ejecutar el fixture en pipelines de integracion continua para verificar que las versiones de Transformers cargan, tokenizan y ejecutan `OPTForCausalLM` sin errores, con un coste de computo minimo.
- Validacion de contratos de framework: comprobar que las expectativas documentadas en `integrations/transformers/expectations` se cumplen tras cambios en el codigo.
- Desarrollo de herramientas de "shrink": probar la logica de `sweep.py` y `build_fixtures.py` que genera fixtures a partir de checkpoints reales.
- Verificacion de dtypes: validar que el modelo es finito en float32, bfloat16 y float16 en forward, loss y gradientes.
- Pruebas de sensibilidad a la entrada: reutilizar la puerta de sensibilidad para asegurar que perturbaciones minimas afectan a los logits.
- Documentacion reproducible: servir como ejemplo de repositorio que combina pesos, uso ejecutable y expectativas en un solo lugar.
- Pruebas de tokenizer: validar la carga byte a byte de `vocab.json`, `merges.txt` y `special_tokens_map.json` frente al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) seria irrelevante.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el repositorio completo ocupa 0,2 GB y el modelo tiene ~1,0 M de parametros.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere acelerador dedicado.
- Cabe en cualquier GPU consumer y en la mayoria de entornos CPU.
- Opciones de despliegue: Transformers (via `integrations/transformers/usage.md`); vLLM, llama.cpp, Ollama o TGI no estan documentados para este artefacto.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, el coste es despreciable pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/opt-125m-mic` | ~1,0 M | no disponible | Fixture de prueba | no disponible | HuggingFace |
| `facebook/opt-125m` | 125 M | 2048 tokens | Modelo de lenguaje real | OPT license | HuggingFace |
| `facebook/opt-350m` | 350 M | 2048 tokens | Modelo de lenguaje real | OPT license | HuggingFace |
| `facebook/opt-1.3b` | 1,3 B | 2048 tokens | Modelo de lenguaje real | OPT license | HuggingFace |

La comparacion solo es valida en terminos de arquitectura e interfaz: el fixture comparte estructura y tokenizer con la familia OPT, pero no es un modelo de lenguaje utilizable. Los datos de contexto de la familia OPT (2048 tokens) no se confirman para el fixture en la informacion disponible.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no genera texto coherente ni responde a instrucciones.
- Es un artefacto de prueba (`test-artifact`) y no debe usarse en produccion ni como modelo de referencia.
- No se especifica la licencia en la informacion disponible; aunque se copia `LICENSE.md` del modelo base, conviene verificar los terminos antes de cualquier redistribucion.
- No hay informacion sobre sesgos, alucinacion o limitaciones idiomaticas porque no ha sido entrenado.
- El contexto maximo no esta documentado para el fixture.
- La utilidad se limita a validacion de integraciones y contratos de framework.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/huggingface-mic/opt-125m-mic)
- [Modelo base facebook/opt-125m](https://huggingface.co/facebook/opt-125m)
- [Como se adelgazo el fixture](https://huggingface-mic-mic-coverage.static.hf.space/shrink/opt-125m-mic.html)
- [Repositorio transformers-mic](https://github.com/huggingface/transformers-mic)
- [sweep.py](https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py)
- [build_fixtures.py](https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py)
