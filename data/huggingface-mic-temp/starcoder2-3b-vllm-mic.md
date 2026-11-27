# huggingface-mic-temp/starcoder2-3b-vllm-mic

## Resumen

`huggingface-mic-temp/starcoder2-3b-vllm-mic` es un artefacto de prueba (fixture) publicado en Hugging Face, no un modelo usable. Se trata de una version "encogida" del checkpoint `bigcode/starcoder2-3b` generada por la herramienta `transformers-mic` con el objetivo de validar contratos de integracion con frameworks de inferencia (en este caso, vLLM). El repositorio incluye pesos reducidos, ejemplos de uso con Transformers y un manifiesto de contrato (`integration.json`) que describe las expectativas del framework.

El modelo conserva la arquitectura `Starcoder2ForCausalLM` pero con solo 2 capas ocultas y 3,2 millones de parametros (frente a los aproximadamente 3.000 millones del modelo original). Los pesos son aleatorios (semilla 17) y se guardan en float32. Los ficheros del procesador (tokenizer, merges, vocab) se copian byte a byte desde `bigcode/starcoder2-3b`, por lo que la tokenizacion es identica a la del modelo real.

Su relevancia es puramente instrumental: sirve para que mantenedores de frameworks (vLLM, Transformers) verifiquen que sus pipelines de carga, tokenizacion y ejecucion funcionan correctamente frente a un checkpoint de StarCoder2 sin necesidad de descargar ni ejecutar el modelo completo de 3B. No debe confundirse con un modelo de lenguaje funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`Starcoder2ForCausalLM`), 2 capas ocultas (fixture encogido) |
| Parametros totales | 3.204.480 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el fixture no documenta `max_position_embeddings`; el modelo base StarCoder2-3B soporta 16.384 tokens, pero no se confirma en este repo) |
| Tipos de cuantizacion | no disponible (pesos en float32; se declara finitud en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El fixture replica la arquitectura StarCoder2 (transformer decoder-only con atencion causal, probablemente con Grouped Query Attention y RoPE en el modelo original, aunque el README no detalla estos componentes para la version encogida). La unica modificacion estructural es la reduccion de `num_hidden_layers` a 2, aplicada mediante la regla generica de `sweep.py` del repositorio `transformers-mic`. Los nombres de tensores coinciden con los del checkpoint real, de modo que cualquier codigo que cargue `bigcode/starcoder2-3b` puede cargar este fixture sin cambios en el codigo de carga.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron mediante un "input-sensitivity gate": cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (la mas debil, `attention_mask:all_ones`, produce 0,803). Los ficheros del procesador se copiaron literalmente del modelo base. El build se documenta en `build.json`, que registra fuentes fijadas, resultados del gate y hashes de ficheros. El artefacto se construyo con `build_fixtures.py` del repositorio `huggingface/transformers-mic`.

## Capacidades

- No genera texto coherente: los pesos son aleatorios y el modelo no ha sido entrenado.
- No soporta tool calling ni function calling de forma funcional.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No tiene capacidades multilingues reales (la tokenizacion es la de StarCoder2-3B, pero la salida es ruido).
- Sirve como fixture de integracion: permite validar carga de safetensors, tokenizacion, ejecucion forward, calculo de perdida y gradientes en float32, bfloat16 y float16.
- Compatible con el contrato de vLLM segun el manifiesto `integration.json` incluido en el repo.
- Util para tests de regresion en pipelines de CI que necesiten un checkpoint con la firma de StarCoder2 sin coste computacional.

## Casos de uso

- Pruebas de integracion en vLLM: validar que el motor de inferencia carga correctamente un checkpoint con arquitectura StarCoder2, incluidos los names de tensores y el tokenizer, antes de desplegar el modelo real de 3B.
- CI/CD de frameworks de inferencia: ejecutar tests de humo en cada PR que toquen el cargador de safetensors o el parser de configuracion de StarCoder2, con un coste de descarga y computo minimo.
- Validacion de tokenizers: comprobar que la tokenizacion byte a byte coincide con `bigcode/starcoder2-3b` en pipelines de preprocesado, ya que los ficheros del procesador son identicos.
- Tests de precision numerica: verificar que el forward, la perdida y los gradientes son finitos en float32, bfloat16 y float16, util para detectar regresiones en kernels de atencion o en capas de normalizacion.
- Reproduccion de contratos de integracion: usar `integration.json` y `integrations/transformers/expectations` como referencia para implementar soporte de StarCoder2 en nuevas herramientas (por ejemplo, servidores compatibles con la API de OpenAI).
- Desarrollo de utilidades de "slimming": servir como caso de estudio reproducible de como reducir un checkpoint preservando la firma de tensores, documentado en el enlace de shrink del README.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K) seria irrelevante.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (3,2 M de parametros equivalen a unos 13 MB de pesos, mas overhead de activaciones y del runtime).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) o incluso CPU; no requiere acelerador dedicado.
- Cabe en cualquier GPU consumer y en la mayoria de entornos CPU-only.
- Opciones de despliegue: vLLM (objetivo del contrato), Transformers, y presumiblemente llama.cpp u Ollama si se convierte a GGUF, aunque no se documenta en el repo.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia sera despreciable frente al modelo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic-temp/starcoder2-3b-vllm-mic` (este) | 3,2 M (fixture) | no disponible | Fixture de test | no disponible | Hugging Face (repo publico, 0 descargas) |
| `bigcode/starcoder2-3b` | ~3.000 M | 16.384 tokens | Generacion de codigo | BigCode OpenRAIL-M (segun el modelo base; no confirmado en este repo) | Hugging Face |
| `bigcode/starcoder2-7b` | ~7.000 M | 16.384 tokens | Generacion de codigo | BigCode OpenRAIL-M | Hugging Face |
| `bigcode/starcoder2-15b` | ~15.000 M | 16.384 tokens | Generacion de codigo | BigCode OpenRAIL-M | Hugging Face |

La comparativa es asimetrica por definicion: el fixture no compite en calidad con los modelos StarCoder2 reales, sino que los sustituye en tests de integracion.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y la salida es ruido. No debe desplegarse en produccion ni usarse para generar codigo.
- El propio autor lo etiqueta como `test-artifact` para excluirlo de busquedas de modelos candidatos.
- La licencia no esta declarada en el repo; para uso comercial habria que remitirse a la licencia del modelo base (`bigcode/starcoder2-3b`, BigCode OpenRAIL-M), pero no se confirma en la informacion disponible.
- El contexto maximo del fixture no se documenta; no asumir los 16.384 tokens del modelo base sin verificar la configuracion.
- Solo se declara compatibilidad con vLLM y Transformers; otros runtimes no estan validados.
- El repositorio tiene 0 descargas y 0 likes, y su nombre incluye `mic-temp`, lo que sugiere que puede ser efimero o eliminado.
- No hay garantia de mantenimiento ni de que el contrato (`integration.json`) se actualice con cambios futuros en vLLM o Transformers.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic-temp/starcoder2-3b-vllm-mic
- Modelo base: https://huggingface.co/bigcode/starcoder2-3b
- Documentacion del proceso de shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/starcoder2-3b-vllm-mic.html
- Repositorio `transformers-mic` (script `sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Repositorio `transformers-mic` (script `build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
