# huggingface-mic/GLM-5.3-mic

## Resumen

GLM-5.3-mic es un artefacto de prueba (fixture) publicado por la organizacion huggingface-mic, no un modelo entrenado. Se presenta como una version reducida ("slim") de `zai-org/GLM-5.3` con solo 40.287.984 parametros y un tamano de repositorio de 0.3 GB, frente al checkpoint completo del que deriva. Su proposito es servir como fixture de integracion para validar contratos de framework (transformers) sobre la arquitectura GLM-MoE-DSA sin necesidad de cargar los pesos reales.

El modelo conserva la misma arquitectura declarada que el original, `GlmMoeDsaForCausalLM`, pero con la configuracion encogida (num_hidden_layers reducido a 3) mediante una regla generica del script `sweep.py` del repositorio transformers-mic. Los pesos son aleatorios (semilla 17) y no han pasado por entrenamiento alguno; unicamente superaron una puerta de sensibilidad a la entrada que verifica que las perturbaciones de las entradas mueven los logits al menos 0,001.

Es relevante ahora porque permite a desarrolladores e investigadores probar pipelines de carga, tokenizacion y ejecucion de GLM-5.3 en entornos con recursos minimos, manteniendo los mismos nombres de tensores y los ficheros de procesador copiados byte a byte del checkpoint original. La model card lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-MoE-DSA causal LM (`GlmMoeDsaForCausalLM`) |
| Parametros totales | 40.287.984 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se copia el fichero LICENSE de `zai-org/GLM-5.3`) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura es `GlmMoeDsaForCausalLM`, una variante causal LM de tipo MoE con atencion DSA segun la nomenclatura del autor. El fixture conserva los mismos nombres de tensores que el checkpoint real de `zai-org/GLM-5.3`, pero con la configuracion encogida: num_hidden_layers reducido a 3 mediante la regla generica de `sweep.py`. Los ficheros de procesador (`LICENSE`, `chat_template.jinja`, `generation_config.json`, `tokenizer.json`, `tokenizer_config.json`) se copiaron byte a byte desde el modelo base.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y solo superaron una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movio los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, dio 0,869). El modelo se guardo en bfloat16, el dtype por defecto de `zai-org/GLM-5.3`, y se verifico que es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes.

## Capacidades

- Ejecucion de forward, calculo de loss y gradientes en float32, bfloat16 y float16.
- Carga mediante transformers con la clase `GlmMoeDsaForCausalLM`.
- Tokenizacion y plantilla de chat equivalentes a las de `zai-org/GLM-5.3` (ficheros copiados byte a byte).
- Validacion de contratos de integracion: manifiesto `integration.json`, expectativas de transformers y procedencia del fixture en `build.json`.
- No es un modelo usable: no genera texto coherente ni tiene capacidades de razonamiento, codigo, matematicas, vision, tool calling o agentes.
- No dispone de soporte multilingue funcional (los pesos son aleatorios).

## Casos de uso

- Pruebas de integracion en transformers: cargar el fixture para verificar que la clase `GlmMoeDsaForCausalLM` y el tokenizador se instancian correctamente sin descargar el checkpoint completo de GLM-5.3.
- Validacion de contratos de framework: comprobar que las expectativas declaradas en `integrations/transformers/expectations` se cumplen sobre la misma arquitectura y nombres de tensores.
- CI/CD de librerias de inferencia: usar el fixture como dependencia ligera (0,3 GB) en pipelines de test para detectar regresiones de carga y ejecucion.
- Desarrollo de kernels y operadores: probar forward, loss y gradientes en float32, bfloat16 y float16 sobre una arquitectura MoE-DSA sin coste de memoria del modelo real.
- Verificacion de tooling de cuantizacion: validar flujos de conversion sobre safetensors con la misma estructura de tensores que el checkpoint original.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture GLM-5.3-mic` y comparar hashes registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta la puerta de sensibilidad a la entrada (movimiento minimo de logits de 0,001; caso mas debil `attention_mask:all_ones` con 0,869), que no constituye una evaluacion de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 para los 40,3 M de parametros (mas overhead de activaciones y tokenizador).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) o incluso CPU.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: carga directa con transformers (`GlmMoeDsaForCausalLM`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al ser un fixture de 3 capas con pesos aleatorios, las cifras no serian representativas del modelo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-mic | 40,3 M | no disponible | Fixture de test | no disponible | Hugging Face (267 descargas) |
| zai-org/GLM-5.3 | no disponible | no disponible | Modelo real | no disponible | Hugging Face (modelo base) |
| Otros fixtures de transformers-mic | no disponible | no disponible | Fixture de test | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y la salida no tiene valor semantico.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- Solo cubre checkpoints cuyos ficheros de procesador son byte-identicos y cuya config coincide tras el encogido (fixture key `5336369c673f`).
- La configuracion encogida (3 capas) no representa el comportamiento del checkpoint real de GLM-5.3.
- Licencia no declarada explicitamente en la informacion disponible; el fichero LICENSE se copia del modelo base, por lo que las restricciones de uso comercial dependen de `zai-org/GLM-5.3`.
- Idiomas soportados no disponibles; el tokenizador es el del modelo base pero los pesos aleatorios impiden cualquier evaluacion linguistica.
- Riesgo de confusion: el nombre puede llevar a pensar que es una version ligera funcional de GLM-5.3, cuando es unicamente un artefacto de pruebas.

## Enlaces

- [Hugging Face: huggingface-mic/GLM-5.3-mic](https://huggingface.co/huggingface-mic/GLM-5.3-mic)
- [Modelo base: zai-org/GLM-5.3](https://huggingface.co/zai-org/GLM-5.3)
- [Manifiesto de contrato (integration.json)](https://huggingface.co/huggingface-mic/GLM-5.3-mic/blob/main/integration.json)
- [Uso con transformers](https://huggingface.co/huggingface-mic/GLM-5.3-mic/blob/main/integrations/transformers/usage.md)
- [Expectativas de transformers](https://huggingface.co/huggingface-mic/GLM-5.3-mic/tree/main/integrations/transformers/expectations)
- [Procedencia del fixture (build.json)](https://huggingface.co/huggingface-mic/GLM-5.3-mic/blob/main/build.json)
- [Como se encogio el fixture](https://huggingface-mic-mic-coverage.static.hf.space/shrink/GLM-5.3-mic.html)
- [Repositorio transformers-mic (sweep.py)](https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py)
- [Repositorio transformers-mic (build_fixtures.py)](https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py)
