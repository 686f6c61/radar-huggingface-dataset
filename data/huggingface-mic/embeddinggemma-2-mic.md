# huggingface-mic/embeddinggemma-2-mic

## Resumen

`embeddinggemma-2-mic` es un artefacto de prueba (test fixture) publicado por el usuario `huggingface-mic` en Hugging Face. No se trata de un modelo entrenado ni utilizable en producción: es una version reducida artificialmente de `google/embeddinggemma-2`, generada para validar integraciones de frameworks (concretamente Transformers) sin necesidad de descargar los pesos completos del modelo original.

El repositorio contiene pesos "slim" (19.313.506 parametros, unos 0,1 GB), el manifiesto de contrato de integracion (`integration.json`), instrucciones de uso con Transformers y un directorio de expectativas de framework. Los pesos son aleatorios (semilla 17), aunque conservan los mismos nombres de tensores que el checkpoint real y pasan una puerta de sensibilidad a la entrada que garantiza que perturbaciones de los inputs mueven los logits al menos 0,001.

Su relevancia es puramente de ingenieria: sirve como fixture reproducible para tests de integracion de la arquitectura `EmbeddingGemma2Model` en el ecosistema Transformers. El propio autor lo etiqueta como `test-artifact` para excluirlo de las busquedas de modelos candidatos. No debe confundirse con un modelo de embeddings funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EmbeddingGemma2Model (transformer, config reducida) |
| Parametros totales | 19.313.506 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura `EmbeddingGemma2Model` del modelo base `google/embeddinggemma-2`, pero con una configuracion reducida mediante la regla generica de `sweep.py`: 2 capas ocultas en el modulo de texto, 2 en el de vision y 2 en el de audio. Los ficheros de procesador (`chat_template.jinja`, `tokenizer.json`, `tokenizer.model`, `tokenizer_config.json`, `preprocessor_config.json`, `processor_config.json`, `config_sentence_transformers.json`, `modules.json`, `sentence_bert_config.json`) se copian byte a byte desde el modelo original.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron con una puerta de sensibilidad a la entrada: cada perturbacion de los inputs del contrato mueve los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, produce 0,17). Los tensores conservan los mismos nombres que el checkpoint real y el modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El fixture se genero con `build_fixtures.py` y la trazabilidad queda registrada en `build.json` (fuentes fijadas, resultados de la puerta y hashes de ficheros).

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen embeddings semanticos utiles.
- Sirve como fixture de integracion para validar la carga y ejecucion de `EmbeddingGemma2Model` en Transformers.
- Permite verificar contratos de framework (formas de tensores, dtypes, sensibilidad a inputs) sin descargar el modelo completo.
- Conserva la estructura de tensores del checkpoint real, por lo que valida rutas de codigo que dependen de nombres de parametros.
- Incluye ficheros de procesador identicos a los del modelo base (tokenizer, chat template, configuracion de Sentence Transformers).
- No soporta tool calling, agentes, vision ni audio de forma funcional, aunque la config reduzca incluya modulos de vision y audio.

## Casos de uso

- Test de integracion en CI: cargar el fixture con Transformers y comprobar que `EmbeddingGemma2Model` se instancia, ejecuta forward y devuelve formas de salida esperadas, sin coste de descarga del modelo real.
- Validacion de contratos de framework: ejecutar el directorio `integrations/transformers/expectations` contra el fixture para detectar regresiones en la API de Transformers.
- Desarrollo de pipelines de embeddings: probar codigo de orquestacion (preprocesado, batching, postprocesado) con un repositorio de 0,1 GB antes de pasar al checkpoint completo.
- Reproducibilidad de tests: usar el fixture key `9f46227c73ff` para fijar un artefacto determinista en suites de pruebas que cubren todos los checkpoints con procesador byte-identico.
- Validacion de dtypes: comprobar que el codigo de inferencia funciona en float32, bfloat16 y float16 sin NaNs ni infinitos, ya que el fixture es finito en los tres.
- Formacion de equipos: servir como ejemplo de como reducir un modelo grande a un fixture manejable siguiendo la metodologia de `sweep.py` y `build_fixtures.py`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad (MMLU, MTEB, retrieval) carece de sentido.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en bfloat16 (19,3 M de parametros, aproximadamente 38 MB de pesos); el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere acelerador de datacenter.
- Cabe en cualquier GPU consumer y en la mayoria de entornos CPU.
- Opciones de despliegue: Transformers (uso previsto segun el README); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture de test, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/embeddinggemma-2-mic | 19,3 M | no disponible | Fixture de test | no disponible | Hugging Face |
| google/embeddinggemma-2 | no disponible | no disponible | Modelo de embeddings real | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | variable | no disponible | Fixtures de test por arquitectura | no disponible | Hugging Face |

La comparativa relevante es contra el modelo base `google/embeddinggemma-2`: mismo procesador y misma estructura de tensores, pero con capas reducidas y pesos aleatorios. Frente a otros fixtures del proyecto `transformers-mic`, comparte metodologia de reduccion (`sweep.py`) y puerta de sensibilidad a la entrada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y no generan embeddings con significado semantico.
- Etiquetado explicitamente como `test-artifact`; no debe usarse en produccion ni en evaluaciones de calidad.
- La licencia no esta disponible en la informacion proporcionada; verificar antes de cualquier redistribucion.
- El modelo base `google/embeddinggemma-2` tampoco tiene licencia ni idiomas documentados en la informacion disponible.
- La configuracion reducida (2 capas por modulo) no representa el comportamiento del modelo original; los resultados de tests de rendimiento no son extrapolables.
- El repositorio no incluye todos los ficheros generados por `build_fixtures.py`; para reconstruirlos hay que ejecutar el script con `--fixture embeddinggemma-2-mic`.
- Riesgo de confusion: el nombre puede llevar a pensar que es un fine-tune de EmbeddingGemma-2, cuando es un fixture de integracion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/embeddinggemma-2-mic
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Metodologia de reduccion (shrink): https://huggingface-mic-mic-coverage.static.hf.space/shrink/embeddinggemma-2-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de barrido: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
