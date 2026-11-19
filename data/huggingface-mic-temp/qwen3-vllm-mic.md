# huggingface-mic-temp/qwen3-vllm-mic

## Resumen

`qwen3-vllm-mic` es un artefacto de prueba (fixture) publicado por la cuenta `huggingface-mic-temp` en Hugging Face. No se trata de un modelo entrenado ni utilizable en producción: es una version reducida artificialmente del modelo `Qwen/Qwen3-0.6B` de Alibaba, creada para validar contratos de integración con frameworks de inferencia como vLLM y Transformers. El repositorio lo etiqueta explicitamente como `test-artifact` con el objetivo de excluirlo de las busquedas de modelos candidatos.

El fixture conserva la arquitectura `Qwen3ForCausalLM` pero reduce la configuracion a 2 capas ocultas, resultando en 9.798.080 parametros totales (frente a los aproximadamente 600 millones del modelo original). Los pesos son aleatorios (semilla 17) y los ficheros del procesador (tokenizer, merges, vocab, generation config, licencia) se copiaron byte a byte desde el checkpoint real. Se guarda en `bfloat16`, el mismo dtype que usa `Qwen/Qwen3-0.6B` por defecto.

Su relevancia es puramente de ingenieria: permite a los mantenedores de frameworks comprobar que la carga de pesos, los nombres de tensores y el comportamiento de entradas/salidas coinciden con el modelo real, sin necesidad de descargar ni ejecutar los 600 millones de parametros. Cualquier uso como modelo de lenguaje (generacion de texto, razonamiento, codigo) carece de sentido porque los pesos no han sido entrenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer causal decoder-only) |
| Parametros totales | 9.798.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el fichero `LICENSE` se copia del modelo base, pero no se indica el tipo) |
| Formato de pesos | safetensors |
| Capas ocultas | 2 |
| Dtype de guardado | bfloat16 |
| Modelo base | Qwen/Qwen3-0.6B |
| Semilla de pesos | 17 (aleatorios) |

## Arquitectura y entrenamiento

El modelo replica la arquitectura del transformer causal decoder-only de Qwen3 (`Qwen3ForCausalLM`), pero con la configuracion reducida mediante la regla generica de `sweep.py` del proyecto `transformers-mic`: `num_hidden_layers` igual a 2. Los nombres de tensores coinciden exactamente con los del checkpoint real `Qwen/Qwen3-0.6B`, de modo que cualquier codigo que espere cargar ese modelo encuentra las mismas claves en el state dict.

No ha habido entrenamiento. Los pesos se inicializaron aleatoriamente con semilla 17 y se validaron con una "input-sensitivity gate": cada perturbacion de las entradas del contrato movia los logits al menos 0.001 (el caso mas debil, `attention_mask:all_ones`, produjo 0.517). Ademas, el modelo es finito en `float32`, `bfloat16` y `float16` tanto en forward como en loss y gradientes. Los ficheros del procesador (`LICENSE`, `generation_config.json`, `merges.txt`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copiaron byte a byte desde el checkpoint original, por lo que el tokenizador si es el real de Qwen3-0.6B.

## Capacidades

- Carga de pesos compatible con `Qwen3ForCausalLM` y con los nombres de tensores del checkpoint real.
- Tokenizacion identica a `Qwen/Qwen3-0.6B` (ficheros de procesador copiados byte a byte).
- Ejecucion de forward, calculo de loss y retropropagacion en `float32`, `bfloat16` y `float16` sin valores no finitos.
- Validacion de contratos de integracion con vLLM y Transformers (manifest en `integration.json`).
- No dispone de capacidades reales de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni multilingues, ya que los pesos son aleatorios.

## Casos de uso

- Pruebas de integracion con vLLM: sirve para verificar que el pipeline de carga de safetensors, mapeo de tensores y ejecucion del grafo coincide con lo esperado para Qwen3, sin descargar el checkpoint completo.
- Validacion de contratos en Transformers: el directorio `integrations/transformers/expectations` permite comprobar que las entradas y salidas (logits, shapes, dtypes) cumplen el contrato definido por el framework.
- CI/CD de librerias de inferencia: al ocupar 0.0 GB y tener solo 9.8M parametros, se puede incluir en tests automatizados de regresion que corren en cada pull request.
- Desarrollo de utilidades de tokenizacion: al conservar el tokenizer real de Qwen3-0.6B, permite probar herramientas de preprocesado y postprocesado sin cargar el modelo grande.
- Verificacion de compatibilidad de dtype: util para comprobar que rutas de `bfloat16` y `float16` no producen NaNs ni infinitos en frameworks nuevos.
- Reproduccion de fixtures: el script `build_fixtures.py` y el fichero `build.json` permiten reconstruir el artefacto y auditar hashes y semillas, util para equipos que mantienen su propia coleccion de fixtures.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) seria irrelevante.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en `bfloat16` (9.8M parametros, aproximadamente 20 MB de pesos) y menos aun en `float16`.
- GPU recomendadas: cualquier GPU consumer o integrada es suficiente; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090, iGPU) e incluso en CPU.
- Opciones de despliegue: vLLM (objetivo principal del fixture), Transformers, y presumiblemente llama.cpp u Ollama si se convierte a GGUF, aunque esto no se documenta.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas, la latencia sera minima pero sin valor representativo del modelo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-vllm-mic | 9.798.080 | no disponible | Fixture de test | no disponible | Hugging Face (repo publico) |
| Qwen/Qwen3-0.6B | ~600M (segun modelo base) | no disponible | Modelo de lenguaje real | no disponible en esta ficha | Hugging Face |
| Otros fixtures de transformers-mic | variable (reducidos) | no disponible | Test de contratos | no disponible | Hugging Face (cuenta `huggingface-mic-temp`) |

La comparacion con modelos de lenguaje reales no es significativa: el fixture solo comparte arquitectura y tokenizador con Qwen3-0.6B, no pesos entrenados ni capacidades.

## Limitaciones y advertencias

- Los pesos son aleatorios (semilla 17): el modelo no genera texto coherente ni resuelve tareas.
- Esta etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe usarse en produccion.
- La licencia no esta identificada en la informacion disponible; el fichero `LICENSE` se copia del modelo base, pero se desconoce su contenido concreto.
- No se documentan idiomas soportados ni longitud de contexto; cualquier uso multilingue o de contexto largo carece de garantias.
- El repositorio ocupa 0.0 GB y solo contiene pesos reducidos, uso y expectativas; otros ficheros deben regenerarse con `build_fixtures.py`.
- Riesgo de confusion: el nombre incluye "qwen3" y "vllm", lo que puede llevar a error si se interpreta como un modelo listo para servir con vLLM en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic-temp/qwen3-vllm-mic
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Manifest de contrato: https://huggingface.co/huggingface-mic-temp/qwen3-vllm-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic-temp/qwen3-vllm-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic-temp/qwen3-vllm-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic-temp/qwen3-vllm-mic/blob/main/build.json
- Explicacion del shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/qwen3-vllm-mic.html
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
