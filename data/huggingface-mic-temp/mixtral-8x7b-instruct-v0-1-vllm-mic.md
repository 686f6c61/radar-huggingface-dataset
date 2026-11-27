# huggingface-mic-temp/Mixtral-8x7B-Instruct-v0.1-vllm-mic

## Resumen

`Mixtral-8x7B-Instruct-v0.1-vllm-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic-temp`, no un modelo utilizable. Se trata de una version reducida artificialmente del modelo `mistralai/Mixtral-8x7B-Instruct-v0.1`, con solo 4.318.016 parametros reales (frente a los aproximadamente 46.700 millones del modelo original), pensada para validar contratos de integracion con frameworks de inferencia como vLLM y Transformers.

El repositorio incluye pesos "slim" en safetensors, un manifiesto de contrato (`integration.json`), documentacion de uso para Transformers y un directorio de expectativas de framework. Los pesos son aleatorios (semilla 17) y no han sido entrenados: superaron una puerta de sensibilidad a la entrada que verifica que perturbaciones en las entradas mueven los logits al menos 0,001, lo que basta para validar el cableado del contrato sin necesidad de entrenamiento.

Su relevancia es puramente tecnica y de infraestructura: sirve para que los mantenedores de frameworks comprueben que la carga, el forward, la perdida y los gradientes funcionan correctamente con la misma arquitectura y los mismos nombres de tensor que el checkpoint real, pero con un coste computacional minimo. Esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos. No debe usarse para inferencia real ni para evaluacion de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MixtralForCausalLM (transformer decoder-only, configuracion reducida) |
| Parametros totales | 4.318.016 (fixture); el modelo base Mixtral-8x7B tiene ~46.7B |
| Parametros activos | no disponible (el fixture no preserva la semantica MoE del original) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la clase `MixtralForCausalLM` con una configuracion reducida generada por la regla generica de `sweep.py` (2 capas ocultas, `num_hidden_layers=2`). Conserva los mismos nombres de tensor que el checkpoint real de Mixtral, de modo que cualquier codigo que espere los tensores del modelo original puede cargarlo sin cambios. Los ficheros de procesador (`generation_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer.model`, `tokenizer_config.json`) se copiaron byte a byte desde `mistralai/Mixtral-8x7B-Instruct-v0.1`, por lo que el tokenizador es identico al del modelo original.

No hubo entrenamiento. Los pesos se inicializaron aleatoriamente con semilla 17 y se validaron con una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato debe mover los logits al menos 0,001 (la mas debil, `attention_mask:all_ones`, produjo 0,795). El modelo es finito en float32, bfloat16 y float16 tanto en forward como en perdida y gradientes. La clave de fixture es `5a98df05a884` y cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya configuracion coincide tras el encogimiento.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen texto coherente.
- Sirve como fixture de integracion para validar la carga de checkpoints con arquitectura Mixtral en vLLM y Transformers.
- Verifica que el forward, la perdida y los gradientes son finitos en float32, bfloat16 y float16.
- Comprueba la compatibilidad de nombres de tensor con el checkpoint real de Mixtral-8x7B-Instruct-v0.1.
- Valida el uso del tokenizador y ficheros de procesador identicos a los del modelo original.
- No soporta tool calling, agentes, vision, audio ni capacidades multilingues reales.

## Casos de uso

- Pruebas de integracion en vLLM: permite comprobar que el pipeline de carga y ejecucion de un checkpoint con arquitectura Mixtral funciona sin descargar los ~93 GB del modelo real.
- Validacion de contratos en Transformers: el directorio `integrations/transformers/expectations` define las salidas esperadas para verificar que una version del framework no rompe la compatibilidad con Mixtral.
- CI/CD de frameworks de inferencia: al pesar practicamente 0 GB y tener 4,3M de parametros, se puede incluir en suites de test automatizadas que se ejecutan en cada commit.
- Desarrollo de herramientas de conversion de pesos: sirve para probar scripts que manipulan safetensors de Mixtral sin necesidad de hardware de gran capacidad.
- Verificacion de dtypes: util para testear rutas de codigo que cargan en bfloat16 o float16 y comprobar que no aparecen NaN ni infinitos.
- Reproducibilidad de fixtures: el fichero `build.json` registra fuentes fijadas, resultados de la puerta de sensibilidad y hashes de ficheros, lo que permite reconstruir el artefacto de forma determinista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en bfloat16 (4,3M de parametros, ~8,6 MB de pesos) mas overhead del runtime.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU es suficiente.
- Cabe en cualquier GPU consumer y en la mayoria de entornos CPU-only.
- Opciones de despliegue: vLLM (objetivo principal del fixture), Transformers, y potencialmente llama.cpp u Ollama si se convierte a GGUF (no documentado).
- Latencia y throughput: no disponible; al ser un fixture de 2 capas, la latencia es despreciable y no representativa del modelo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mixtral-8x7B-Instruct-v0.1-vllm-mic (este) | 4,3M (fixture) | no disponible | Test de integracion | no disponible | Hugging Face |
| mistralai/Mixtral-8x7B-Instruct-v0.1 | ~46,7B (12,9B activos) | 32.768 tokens | Modelo instructivo MoE | Apache 2.0 | Hugging Face |
| mistralai/Mixtral-8x7B-v0.1 | ~46,7B (12,9B activos) | 32.768 tokens | Modelo base MoE | Apache 2.0 | Hugging Face |
| mistralai/Mistral-7B-Instruct-v0.2 | ~7,2B | 32.768 tokens | Modelo instructivo denso | Apache 2.0 | Hugging Face |

La comparativa con el modelo base es la mas relevante: el fixture comparte arquitectura, tokenizador y nombres de tensor con Mixtral-8x7B-Instruct-v0.1, pero no sus capacidades. Frente a Mistral-7B-Instruct-v0.2, el fixture no es un modelo alternativo sino una herramienta de validacion.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no genera texto coherente ni responde a instrucciones.
- No debe usarse en produccion, evaluacion de calidad ni como sustituto del modelo base.
- No preserva la semantica MoE del Mixtral original (el fixture tiene 2 capas y no replica el enrutamiento de expertos).
- La licencia no esta declarada en la informacion disponible; verificar antes de cualquier redistribucion.
- El repositorio tiene 0 descargas y 0 likes, lo que confirma su naturaleza de artefacto interno.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; ignorar esa etiqueta puede llevar a confundirlo con un modelo real.
- La fecha de creacion (2026-11-26) es futura respecto a la mayoria de referencias, lo que sugiere un entorno de pruebas o un error de metadatos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic-temp/Mixtral-8x7B-Instruct-v0.1-vllm-mic
- Modelo base: https://huggingface.co/mistralai/Mixtral-8x7B-Instruct-v0.1
- Manifiesto de contrato: https://huggingface.co/huggingface-mic-temp/Mixtral-8x7B-Instruct-v0.1-vllm-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic-temp/Mixtral-8x7B-Instruct-v0.1-vllm-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic-temp/Mixtral-8x7B-Instruct-v0.1-vllm-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic-temp/Mixtral-8x7B-Instruct-v0.1-vllm-mic/blob/main/build.json
- Documentacion del proceso de encogimiento: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Mixtral-8x7B-Instruct-v0.1-vllm-mic.html
- Repositorio transformers-mic (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Repositorio transformers-mic (build_fixtures.py): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
