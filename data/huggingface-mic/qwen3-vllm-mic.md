# huggingface-mic/qwen3-vllm-mic

## Resumen

`huggingface-mic/qwen3-vllm-mic` es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic`, no un modelo entrenado ni utilizable en produccion. Deriva de `Qwen/Qwen3-0.6B` mediante una reduccion mecanica de su configuracion: mantiene la arquitectura `Qwen3ForCausalLM` pero rebaja el numero de capas ocultas a 2, lo que deja un total de 9.798.080 parametros. Sus pesos son aleatorios (semilla 17) y los ficheros del procesador (tokenizer, `generation_config.json`, `LICENSE`, etc.) se copiaron byte a byte del checkpoint original.

El proposito declarado es servir como fixture ejecutable para validar contratos de integracion con frameworks (en concreto, la ruta de vLLM) sin necesidad de descargar ni cargar el modelo completo de 0,6B. El repositorio incluye un manifiesto de contrato (`integration.json`), documentacion de uso con Transformers y un registro de procedencia (`build.json`) con hashes y resultados de las compuertas de validacion. El autor lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

Por tanto, esta ficha describe un objeto de ingenieria de pruebas: sirve para verificar que un pipeline de carga, tokenizacion e inferencia funciona con la firma de tensores y el procesador de Qwen3, pero no produce texto coherente ni debe evaluarse como modelo de lenguaje. Cualquier uso distinto del testing de integraciones carece de sentido tecnico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (`Qwen3ForCausalLM`), 2 capas ocultas |
| Parametros totales | 9.798.080 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de la config reducida; no documentada) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; el autor indica que es finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible (tokenizer de Qwen3-0.6B copiado byte a byte) |
| Licencia | no disponible en los metadatos del repo (el fichero `LICENSE` se copia del modelo base) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only con la misma clase de modelo que Qwen3 (`Qwen3ForCausalLM`), pero con la configuracion reducida mediante la regla generica de `sweep.py` del repositorio `transformers-mic`: `num_hidden_layers = 2`. Los nombres de tensores coinciden con los del checkpoint real de Qwen3-0.6B, de modo que el fixture ejercita exactamente la misma firma de parametros que el modelo de produccion, solo que con menos capas y dimensiones derivadas.

No hubo entrenamiento. Los pesos se inicializaron aleatoriamente con semilla 17 y se aceptaron porque superaron una compuerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movia los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, produjo 0,517). El modelo se guardo en bfloat16, el dtype con el que carga Qwen3-0.6B por defecto, y se verifico que forward, loss y gradientes son finitos en float32, bfloat16 y float16. Los ficheros del procesador (`LICENSE`, `generation_config.json`, `merges.txt`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copiaron sin modificacion desde `Qwen/Qwen3-0.6B`.

## Capacidades

- Carga e inferencia con la firma de tensores de Qwen3: valida que un runtime (vLLM, Transformers) acepta el checkpoint sin errores de forma o dtype.
- Verificacion de tokenizacion: al reutilizar el tokenizer de Qwen3-0.6B, permite comprobar el pipeline de encoding/decoding con el vocabulario real.
- Pruebas de contrato de integracion: el manifiesto `integration.json` y el directorio `integrations/transformers/expectations` definen las expectativas que un framework debe cumplir.
- Comprobacion de estabilidad numerica: forward, loss y gradientes finitos en float32, bfloat16 y float16.
- No genera texto coherente: los pesos son aleatorios, por lo que la salida es ruido estadistico.
- No soporta tool calling, agentes, vision, audio ni modos de razonamiento; no es un modelo funcional.

## Casos de uso

- CI de integraciones con vLLM: cargar el fixture en lugar de Qwen3-0.6B para validar que el parser de configuracion, el mapeo de pesos y el arranque del servidor funcionan, reduciendo el tiempo y el ancho de banda de cada job.
- Pruebas de regresion de tokenizers: ejecutar el pipeline completo de tokenizacion con el vocabulario real de Qwen3 sin descargar el checkpoint de 0,6B.
- Validacion de contratos entre versiones de Transformers: comprobar que `from_pretrained`, `generate` y el calculo de loss aceptan la firma de tensores del modelo base.
- Desarrollo offline: trabajar en entornos sin acceso a modelos grandes usando un repo de 0,0 GB que reproduce la estructura de Qwen3.
- Verificacion de dtypes y estabilidad numerica: testear rutas de ejecucion en float32, bfloat16 y float16 con un modelo que cabe en cualquier GPU o incluso en CPU.
- Auditoria de pipelines de empaquetado: usar `build.json` y los hashes registrados para reproducir el fixture con `build_fixtures.py` y comparar resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) seria irrelevante.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en bfloat16 (9,8 M de parametros); cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquiera; no requiere A100, H100 ni RTX 4090. Una iGPU o CPU es suficiente para el fixture.
- Cabe en consumer GPU: si, en todas (GTX 1050, RTX 3060, etc.) y en CPU.
- Opciones de despliegue: Transformers (ruta documentada en `integrations/transformers/usage.md`) y vLLM (objetivo del contrato). No se documentan otras rutas como llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas y 9,8 M de parametros, la latencia sera dominada por el overhead del runtime, no por el computo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/qwen3-vllm-mic` | 9,8 M | no disponible | Fixture de test | no disponible | Hugging Face |
| `Qwen/Qwen3-0.6B` | ~0,6 B (596 M aprox.) | no disponible en esta ficha | Modelo funcional de proposito general | no disponible en esta ficha | Hugging Face |
| Otros fixtures `huggingface-mic` | variable | no disponible | Fixtures de contrato por framework | no disponible | Hugging Face |

La comparacion relevante es con el modelo base: el fixture conserva arquitectura, tokenizer y nombres de tensores, pero reduce capas y sustituye los pesos entrenados por pesos aleatorios. Frente a otros fixtures del mismo autor, la diferencia esta en el framework objetivo (aqui vLLM).

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no produce lenguaje coherente; cualquier evaluacion de calidad es invalida.
- Artefacto de test: el autor lo etiqueta `test-artifact` y advierte explicitamente de que no es un modelo utilizable.
- Licencia no declarada en los metadatos: el fichero `LICENSE` se copia del modelo base, pero la ficha no confirma los terminos; verificar antes de cualquier uso.
- Contexto e idiomas no documentados: aunque el tokenizer es el de Qwen3-0.6B, no se especifica la ventana de contexto efectiva del fixture reducido.
- Sin soporte de tool calling, agentes ni multimodalidad.
- Riesgo de confusion: no debe incluirse en busquedas de modelos candidatos ni en pipelines de produccion.
- Reproducibilidad dependiente del script: el autor indica que otros ficheros deben regenerarse con `python example/build_fixtures.py --fixture qwen3-vllm-mic`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/qwen3-vllm-mic
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/qwen3-vllm-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/qwen3-vllm-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/qwen3-vllm-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/qwen3-vllm-mic/blob/main/build.json
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/qwen3-vllm-mic.html
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
