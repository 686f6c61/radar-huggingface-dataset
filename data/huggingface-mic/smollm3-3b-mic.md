# huggingface-mic/SmolLM3-3B-mic

## Resumen

SmolLM3-3B-mic es un artefacto de prueba (fixture) publicado por la organizacion huggingface-mic, no un modelo entrenado ni utilizable. Se presenta como una version "adelgazada" de HuggingFaceTB/SmolLM3-3B: conserva la arquitectura `SmolLM3ForCausalLM` y los nombres de tensores del checkpoint original, pero reduce la configuracion a 4 capas ocultas y sustituye los pesos por valores aleatorios generados con semilla 17. El resultado son 35.195.136 parametros (unos 35,2 M) guardados en bfloat16, con un tamano de repositorio de 0,1 GB.

Su proposito no es la inferencia real, sino servir de fixture reproducible para validar contratos de integracion entre frameworks (Transformers y otros) y el modelo de referencia. El autor lo etiqueta explicitamente como `test-artifact` para excluirlo de las busquedas de modelos candidatos. Los ficheros de procesador (tokenizer, chat template, generation config) se copian byte a byte del modelo base, de modo que las pruebas de integracion ejerciten exactamente el mismo pipeline de tokenizacion.

Por tanto, esta ficha debe leerse como documentacion de un objeto de prueba de ingenieria, no de un modelo de lenguaje desplegable. Cualquier evaluacion de calidad, razonamiento o generacion de texto carece de sentido con este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolLM3ForCausalLM (transformer causal, configuracion reducida a 4 capas ocultas) |
| Parametros totales | 35.195.136 (35,2 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la clase `SmolLM3ForCausalLM` del modelo base HuggingFaceTB/SmolLM3-3B, pero con una configuracion reducida mediante la regla generica de `sweep.py` del repositorio transformers-mic: `num_hidden_layers` pasa a 4. Mantiene los mismos nombres de tensores que el checkpoint real, de forma que el codigo de carga e integracion puede ejercitarse sin descargar los pesos completos. Los ficheros de procesador (`chat_template.jinja`, `generation_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `notebook.ipynb`) se copian byte a byte desde el modelo original.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron con una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (el caso mas debil, `input_ids:roll_batch`, alcanza 1,98). El modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave de fixture `d823c654b784` agrupa todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el adelgazamiento.

## Capacidades

- No tiene capacidades de generacion de texto utiles: los pesos son aleatorios y no han sido entrenados.
- Sirve para validar la carga de `SmolLM3ForCausalLM` en Transformers con los mismos nombres de tensores que el modelo real.
- Permite probar el pipeline de tokenizacion y el chat template reales del modelo base, al copiarse los ficheros de procesador sin modificaciones.
- Util para tests de contrato (contract tests) y de integracion de frameworks: comprobar formas, dtypes y flujos de forward/backward.
- No soporta tool calling, agentes, vision, audio ni modo thinking de forma funcional.
- Multilingue: no aplicable, al no existir capacidades linguisticas reales.

## Casos de uso

- Pruebas de integracion en CI: cargar el fixture con Transformers y verificar que la clase `SmolLM3ForCausalLM` se instancia y ejecuta un forward sin errores, con un coste de descarga de 0,1 GB.
- Validacion de contratos de framework: comprobar que las expectativas documentadas en `integrations/transformers/expectations` se cumplen sobre formas, dtypes y nombres de tensores.
- Test de tokenizacion: ejercitar `tokenizer.json` y `chat_template.jinja` reales del modelo base sin cargar los 3B parametros.
- Pruebas de precision numerica: verificar comportamiento finito en float32, bfloat16 y float16 en entornos de CI con distintas GPUs.
- Desarrollo de pipelines de evaluacion: disponer de un checkpoint ligero para depurar el codigo de evaluacion antes de apuntar al modelo real.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture SmolLM3-3B-mic` y comparar hashes registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) seria irrelevante.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (35,2 M parametros, ~70 MB de pesos) mas overhead de activaciones y runtime.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe holgadamente en GPU consumer y en entornos sin GPU.
- Opciones de despliegue: Transformers (via `AutoModelForCausalLM` con la configuracion del fixture); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles; al no ser un modelo funcional, las mediciones no serian representativas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM3-3B-mic | 35,2 M | no disponible | Fixture de test | no disponible | HuggingFace |
| HuggingFaceTB/SmolLM3-3B | 3B (aproximado) | no disponible | Modelo causal real | no disponible en esta ficha | HuggingFace |

No se dispone de informacion sobre otros fixtures comparables de la misma organizacion ni de alternativas equivalentes para pruebas de integracion.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene sentido linguistico.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- La configuracion esta reducida a 4 capas, por lo que no reproduce el comportamiento numerico del modelo de 3B.
- Licencia no disponible: no hay autorizacion explicita para uso comercial.
- Idiomas y contexto no documentados; no asumir las capacidades del modelo base.
- Riesgo de confusion: el nombre sugiere un fine-tune de SmolLM3-3B, cuando en realidad es un fixture derivado.
- No apto para evaluaciones de sesgo, alucinacion o calidad, al carecer de entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/huggingface-mic/SmolLM3-3B-mic
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Explicacion del adelgazamiento: https://huggingface-mic-mic-coverage.static.hf.space/shrink/SmolLM3-3B-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de adelgazamiento: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
