# huggingface-mic/Qwen3.8-1.0B-A0.6B-mic

## Resumen

Qwen3.8-1.0B-A0.6B-mic es un artefacto de prueba (fixture) publicado por el usuario huggingface-mic, no un modelo utilizable en produccion. Se trata de una version reducida y con pesos aleatorios del checkpoint `inference-optimization/Qwen3.8-1.0B-A0.6B`, un supuesto modelo Qwen3.5-MoE de tipo causal LM. El repositorio incluye los pesos "slim", ejemplos de uso ejecutables y un directorio de expectativas de framework, todo empaquetado para validar la integracion del modelo real con Transformers.

El fixture conserva la arquitectura declarada (`Qwen3_5MoeForCausalLM`) pero con una configuracion reducida a 2 capas ocultas, y copia byte a byte los ficheros de procesador del modelo original (`chat_template.jinja`, `generation_config.json`, `tokenizer.json`, `tokenizer_config.json`). Los pesos se generaron con semilla 17 y pasaron un test de sensibilidad a la entrada, pero no recibieron entrenamiento alguno. El repositorio esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

Su relevancia es exclusivamente tecnica: sirve como banco de pruebas para verificar que la implementacion de `Qwen3_5MoeForCausalLM` en Transformers carga, ejecuta forward, calcula perdida y propaga gradientes de forma finita en float32, bfloat16 y float16. No debe emplearse para inferencia real, generacion de texto ni ninguna tarea de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForCausalLM (transformer MoE, fixture reducido a 2 capas) |
| Parametros totales | 32.138.304 (32,1 M) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo declara la arquitectura `Qwen3_5MoeForCausalLM`, un transformer de mezcla de expertos (MoE) para modelado causal de lenguaje. Sin embargo, el fixture es una version "slim" generada mediante la regla generica de `sweep.py`, que reduce la configuracion a `num_hidden_layers = 2`. Los ficheros de procesador se copiaron byte a byte desde el checkpoint original, de modo que la tokenizacion y la plantilla de chat coinciden con las del modelo de referencia.

No hubo entrenamiento: los pesos son aleatorios con semilla 17. El autor indica que pasaron un "input-sensitivity gate" segun el cual cada perturbacion de las entradas del contrato movia los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, con 0,71), por lo que no se considero necesario entrenar. Los tensores conservan los mismos nombres que el checkpoint real y el modelo es finito en float32, bfloat16 y float16 tanto en forward como en perdida y gradientes. El fixture se construyo con `build_fixtures.py` y su procedencia queda registrada en `build.json`.

## Capacidades

- No es un modelo funcional: no genera texto coherente ni resuelve tareas de razonamiento, codigo o matematicas.
- Conserva la interfaz de un causal LM de Qwen3.5-MoE (forward, loss, gradientes) para pruebas de integracion.
- Incluye plantilla de chat y tokenizer del modelo original, utiles para validar el pipeline de tokenizacion.
- No dispone de tool calling, capacidades de agente, vision, audio ni modo de pensamiento.
- No tiene capacidades multilingues reales, ya que los pesos son aleatorios.

## Casos de uso

- Validacion de la implementacion de `Qwen3_5MoeForCausalLM` en Transformers: ejecutar forward, calcular perdida y comprobar gradientes finitos en float32, bfloat16 y float16 antes de cargar el checkpoint real.
- Pruebas de integracion de tokenizer y plantilla de chat: verificar que `tokenizer.json`, `tokenizer_config.json`, `generation_config.json` y `chat_template.jinja` se cargan y producen las secuencias esperadas.
- CI de frameworks: usar el fixture como caso de prueba ligero (0,1 GB) en pipelines de integracion continua para detectar regresiones en la carga de modelos MoE sin descargar pesos completos.
- Desarrollo de utilidades de inspeccion de pesos: comprobar que los nombres de tensores coinciden con el checkpoint real (`inference-optimization/Qwen3.8-1.0B-A0.6B`).
- Pruebas de sensibilidad a entradas: reproducir el gate del autor perturbando `attention_mask` y otras entradas del contrato para validar que los logits cambian.
- Verificacion de compatibilidad de dtypes: comprobar que el modelo se mantiene finito en float32, bfloat16 y float16 en todas las rutas de ejecucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en bfloat16, dado el tamano del repositorio (0,1 GB) y los 32,1 M de parametros.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) e incluso CPU es suficiente para ejecutar el fixture.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: Transformers (ruta principal documentada en `integrations/transformers/usage.md`); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; irrelevantes al no ser un modelo funcional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-1.0B-A0.6B-mic | 32,1 M (fixture) | no disponible | Artefacto de prueba | no disponible | Hugging Face |
| inference-optimization/Qwen3.8-1.0B-A0.6B | no disponible | no disponible | Modelo de referencia (Qwen3.5-MoE) | no disponible | Hugging Face |
| Modelos Qwen3.5-MoE publicos | no disponible | no disponible | LLM causal MoE | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y no han sido entrenados.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- Riesgo total de alucinacion y salidas sin sentido si se usa para generacion.
- La configuracion esta reducida a 2 capas, por lo que no representa el comportamiento del checkpoint real.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Idiomas soportados no disponibles.
- Longitud de contexto no disponible.
- Cualquier evaluacion de calidad sobre este artefacto es invalida.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Qwen3.8-1.0B-A0.6B-mic
- Modelo base: https://huggingface.co/inference-optimization/Qwen3.8-1.0B-A0.6B
- Manifiesto del contrato: https://huggingface.co/huggingface-mic/Qwen3.8-1.0B-A0.6B-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/Qwen3.8-1.0B-A0.6B-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/Qwen3.8-1.0B-A0.6B-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/Qwen3.8-1.0B-A0.6B-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Qwen3.8-1.0B-A0.6B-mic.html
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla generica de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
