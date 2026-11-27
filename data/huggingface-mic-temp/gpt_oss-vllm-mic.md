# huggingface-mic-temp/gpt_oss-vllm-mic

## Resumen

`gpt_oss-vllm-mic` es un artefacto de prueba (fixture) publicado por la cuenta `huggingface-mic-temp` en Hugging Face. No es un modelo usable: se trata de una version reducida artificialmente del checkpoint `openai/gpt-oss-20b`, generada para validar contratos de integracion entre frameworks (en este caso, la ruta de vLLM) y las expectativas de Transformers. El repositorio esta etiquetado explicitamente como `test-artifact` y `mic` para excluirlo de busquedas de modelos candidatos.

El fixture conserva la arquitectura declarada del modelo base (`GptOssForCausalLM`) pero con una configuracion drasticamente reducida: 2 capas ocultas y aproximadamente 26 millones de parametros totales (25.964.236 exactos segun los safetensors), frente a los 20.000 millones del modelo original. Los pesos son aleatorios (semilla 17) y no han sido entrenados; se generaron superando una puerta de sensibilidad a la entrada que exige que cada perturbacion de las entradas del contrato mueva los logits al menos 0,001.

Su relevancia es puramente de ingenieria: permite a los mantenedores de `transformers-mic` verificar que las integraciones (plantillas de chat, tokenizador, configuracion de generacion, nombres de tensores) se comportan igual que en el checkpoint real sin necesidad de descargar ni ejecutar el modelo completo. Para desarrolladores e investigadores que buscan un modelo funcional, este repositorio no aporta nada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GptOssForCausalLM (transformer, configuracion reducida a 2 capas ocultas) |
| Parametros totales | 25.964.236 (aprox. 26,0 M) |
| Parametros activos | no disponible (el modelo base gpt-oss-20b es MoE, pero la configuracion del fixture no se detalla) |
| Longitud de contexto | no disponible (heredada de la config del base, sin especificar) |
| Tipos de cuantizacion | no disponible; pesos guardados en float32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repo incluye un fichero `LICENSE` copiado del base, pero no se indica su contenido) |
| Formato de pesos | safetensors (float32) |
| Modelo base | openai/gpt-oss-20b |
| Tamano del repo | 0,1 GB |
| Tipo de artefacto | fixture de test (`test-artifact`) |

## Arquitectura y entrenamiento

El fixture replica la clase `GptOssForCausalLM` del modelo `openai/gpt-oss-20b`, pero con la configuracion encogida mediante la regla generica de `sweep.py` del proyecto `transformers-mic`: `num_hidden_layers` reducido a 2. Conserva los mismos nombres de tensores que el checkpoint real y los ficheros de procesador copiados byte a byte (`LICENSE`, `USAGE_POLICY`, `chat_template.jinja`, `generation_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`).

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron con una puerta de sensibilidad a la entrada: toda perturbacion de las entradas del contrato debe desplazar los logits al menos 0,001 (la mas debil, `attention_mask:all_ones`, produjo 0,357). El modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave del fixture (`f8ec45cf09e9`) agrupa todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el encogimiento.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen texto coherente.
- Sirve como fixture de integracion para validar contratos de framework (vLLM, Transformers) contra el modelo base `openai/gpt-oss-20b`.
- Verifica la compatibilidad de la plantilla de chat, el tokenizador y la configuracion de generacion del modelo real.
- Comprueba que los nombres de tensores y la estructura del state dict coinciden con el checkpoint original.
- Permite tests de forward, loss y gradientes en float32, bfloat16 y float16.
- No soporta tool calling, agentes, vision, audio ni capacidades multilingues reales.

## Casos de uso

- Pruebas de integracion en CI: ejecutar la ruta de carga de vLLM o Transformers contra un checkpoint minusculo que reproduce la interfaz del modelo real, sin coste de descarga ni GPU.
- Validacion de contratos de framework: comprobar que las expectativas declaradas en `integrations/transformers/expectations` se cumplen con un state dict de la misma forma.
- Desarrollo de plantillas de chat: iterar sobre `chat_template.jinja` copiado del base sin necesitar los 20.000 millones de parametros.
- Tests de tokenizacion: usar `tokenizer.json` y `special_tokens_map.json` identicos al original para verificar pipelines de preprocesado.
- Reproducibilidad de fixtures: reconstruir el artefacto con `build_fixtures.py` y comparar hashes registrados en `build.json`.
- Depuracion de cargas en precision mixta: verificar comportamiento finito en bfloat16 y float16 sobre una arquitectura GptOss real pero de 2 capas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en float32 (26 M de parametros, aprox. 104 MB de pesos) mas overhead de activaciones, despreciable.
- GPU recomendadas: cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) o incluso CPU.
- Cabe en cualquier GPU consumer y en la mayoria de entornos CPU.
- Opciones de despliegue: Transformers (ruta principal), vLLM (objetivo del contrato), llama.cpp/Ollama no estan documentados para este fixture.
- Latencia y throughput: no disponibles; al ser un fixture de test no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt_oss-vllm-mic (este) | 25,96 M | no disponible | Fixture de test | no disponible | Hugging Face |
| openai/gpt-oss-20b | 20.000 M (aprox.) | no disponible en esta ficha | Modelo generativo real | no disponible en esta ficha | Hugging Face |
| Otros fixtures `*-mic` de huggingface-mic-temp | variable | no disponible | Fixtures de test | no disponible | Hugging Face |

La comparativa relevante es unicamente con el modelo base: mismo arquitecto y mismos ficheros de procesador, pero con 2 capas y pesos aleatorios en lugar de pesos entrenados.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y la salida no tiene valor semantico.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- La licencia no esta indicada en la informacion disponible; el repo incluye un `LICENSE` copiado del base, pero su contenido no se detalla.
- El modelo base es `openai/gpt-oss-20b`, por lo que las restricciones de uso del original (incluido `USAGE_POLICY`) podrian aplicar al fixture.
- Solo se ha validado la ruta de vLLM y las expectativas de Transformers; otras integraciones no estan cubiertas.
- No hay datos de sesgos, alucinacion ni rendimiento multilingue porque no se ha entrenado.
- El fixture cubre un unico checkpoint (clave `f8ec45cf09e9`); cambios en la config o en los ficheros de procesador del base invalidarian la cobertura.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huggingface-mic-temp/gpt_oss-vllm-mic
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Manifiesto de contrato: https://huggingface.co/huggingface-mic-temp/gpt_oss-vllm-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic-temp/gpt_oss-vllm-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic-temp/gpt_oss-vllm-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic-temp/gpt_oss-vllm-mic/blob/main/build.json
- Documentacion del encogimiento: https://huggingface-mic-mic-coverage.static.hf.space/shrink/gpt_oss-vllm-mic.html
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
