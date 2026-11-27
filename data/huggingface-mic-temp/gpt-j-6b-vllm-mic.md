# huggingface-mic-temp/gpt-j-6b-vllm-mic

## Resumen

`gpt-j-6b-vllm-mic` es un artefacto de prueba publicado por la cuenta `huggingface-mic-temp`, no un modelo utilizable. Se trata de una version reducida ("slim fixture") del checkpoint `EleutherAI/gpt-j-6b`, con 6,6 millones de parametros en lugar de los 6.000 millones del original, pensada para validar contratos de integracion y expectativas de frameworks (en este caso, vLLM y Transformers) sin necesidad de descargar ni ejecutar el modelo completo.

El repositorio incluye pesos reducidos, un manifiesto de contrato (`integration.json`), documentacion de uso para Transformers y un registro de procedencia (`build.json`). Los pesos son aleatorios (semilla 17), no han sido entrenados y la model card lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

Su relevancia es puramente de ingenieria: sirve como fixture reproducible en pipelines de CI para comprobar que una integracion carga tensores con los mismos nombres que el checkpoint real, respeta los archivos de tokenizer copiados byte a byte y produce salidas finitas en float32, bfloat16 y float16. No debe emplearse para inferencia real, generacion de texto ni evaluacion de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPTJForCausalLM (transformer decoder-only, config reducida) |
| Parametros totales | 6.600.928 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (config reducida; el modelo base soporta 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos guardados en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es `GPTJForCausalLM`, la misma clase que el modelo base `EleutherAI/gpt-j-6b`, pero con una configuracion reducida mediante la regla generica de `sweep.py` del repositorio `huggingface/transformers-mic`. Los nombres de tensores coinciden con los del checkpoint real, de modo que una integracion que funcione con el fixture deberia funcionar con el modelo completo a nivel de carga.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron con una "input-sensitivity gate": cada perturbacion de las entradas del contrato mueve los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, mueve 0,177). Los archivos de procesador (`added_tokens.json`, `merges.txt`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copiaron byte a byte desde `EleutherAI/gpt-j-6b`. El modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes.

## Capacidades

- Carga de pesos y ejecucion de forward pass con la clase `GPTJForCausalLM`.
- Validacion de contratos de integracion para frameworks (vLLM, Transformers) mediante `integration.json`.
- Comprobacion de compatibilidad de tokenizer con los archivos del modelo base.
- Verificacion de estabilidad numerica en float32, bfloat16 y float16.
- No genera texto coherente: los pesos son aleatorios.
- No soporta tool calling, agentes, vision, audio ni capacidades multilingues reales.
- No dispone de modo thinking ni razonamiento multi-paso.

## Casos de uso

- Pruebas de CI para integraciones de vLLM: el fixture permite ejecutar el pipeline de carga y generacion de vLLM en pocos segundos y con huella de disco minima, validando que la integracion acepta la arquitectura GPT-J antes de probar con el checkpoint real.
- Validacion de cargadores de safetensors: al mantener los mismos nombres de tensores que `EleutherAI/gpt-j-6b`, sirve para comprobar que un cargador mapea correctamente cada parametro sin descargar 12 GB.
- Test de tokenizers en pipelines: los archivos de procesador copiados byte a byte permiten verificar que un pipeline reproduce exactamente la tokenizacion del modelo base.
- Comprobacion de estabilidad numerica: util para validar que un runtime (por ejemplo, kernels de atencion optimizados) produce salidas finitas en float32, bfloat16 y float16.
- Regresion de contratos de framework: `integration.json` y el directorio de expectativas permiten detectar cambios incompatibles en la API de Transformers o vLLM.
- Desarrollo de herramientas de "model shrinking": el repositorio documenta el proceso de reduccion y sirve como referencia reproducible para generar fixtures de otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (6,6 M de parametros, aproximadamente 26 MB de pesos mas overhead de activaciones y KV cache).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; tambien funciona en CPU.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers, vLLM (objetivo declarado del fixture) y llama.cpp/Ollama si se convierte a GGUF, aunque no se documenta esa conversion.
- Latencia y throughput: no disponibles; al ser un modelo diminuto, la latencia estara dominada por el overhead del framework, no por el computo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gpt-j-6b-vllm-mic` (este) | 6,6 M | no disponible | Fixture de test | no disponible | Hugging Face |
| `EleutherAI/gpt-j-6b` | 6.000 M | 2048 | Modelo de lenguaje real | Apache 2.0 (segun el modelo base) | Hugging Face |
| `EleutherAI/gpt-neo-125M` | 125 M | 2048 | Modelo pequeno para pruebas | MIT (segun el modelo base) | Hugging Face |

La comparativa es asimetrica: el fixture no es un modelo de lenguaje funcional, sino una herramienta de validacion. Frente a alternativas como `gpt-neo-125M`, que si genera texto, el fixture prioriza fidelidad estructural (nombres de tensores, tokenizer) sobre capacidad.

## Limitaciones y advertencias

- Pesos aleatorios: no produce texto coherente ni respuestas utiles; cualquier salida es ruido.
- Etiquetado como `test-artifact`: no debe usarse en produccion ni incluirse en busquedas de modelos candidatos.
- Licencia no especificada en el repositorio; aunque el modelo base es Apache 2.0, la licencia del fixture no esta declarada.
- Idiomas no declarados; el tokenizer es el del modelo base, pero el modelo no tiene capacidad linguistica real.
- Descargas y likes a cero: repositorio de proposito interno, sin comunidad ni soporte.
- No apto para evaluacion de calidad, benchmarks ni comparativas de rendimiento.
- Riesgo de confusion: el nombre incluye "gpt-j-6b" pero solo contiene 6,6 M de parametros; verificar siempre el tamano antes de integrarlo.
- La fecha de creacion indicada (2026-11-26) es futura respecto a la redaccion de esta ficha; conviene tratarla con cautela.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic-temp/gpt-j-6b-vllm-mic
- Modelo base: https://huggingface.co/EleutherAI/gpt-j-6b
- Documentacion de como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/gpt-j-6b-vllm-mic.html
- Repositorio `transformers-mic` (script `sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
