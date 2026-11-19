# huggingface-mic/nomic-embed-text-v1.5-mic

## Resumen

`huggingface-mic/nomic-embed-text-v1.5-mic` es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic`, no un modelo de embeddings utilizable en producción. Se trata de una version reducida del modelo real `nomic-ai/nomic-embed-text-v1.5` de Nomic AI, generada con una regla de reduccion generica (reduccion a 2 capas ocultas) para conservar la misma arquitectura y los mismos nombres de tensores que el checkpoint original, pero con solo 2.036.480 parametros.

El repositorio incluye pesos "slim", ejemplos de uso ejecutables y un directorio de expectativas de framework (contrato de integracion). Los pesos son aleatorios (semilla 17) y no han sido entrenados: pasaron un test de sensibilidad a la entrada que exigia que cada perturbacion de las entradas del contrato moviera los logits al menos 0,001. El propio autor lo etiqueta como `test-artifact` para excluirlo de busquedas de modelos candidatos.

Su relevancia es, por tanto, instrumental: sirve para validar integraciones, contratos de framework y pipelines de prueba que esperan la interfaz de `nomic-embed-text-v1.5` sin cargar el modelo completo. No debe confundirse con el modelo de embeddings de 137M de parametros del que deriva, ni usarse para generar embeddings reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NomicBertModel (transformer tipo BERT), reducida a 2 capas ocultas |
| Parametros totales | 2.036.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32; finito tambien en bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo es un `NomicBertModel` con la misma arquitectura que `nomic-ai/nomic-embed-text-v1.5`, pero con la configuracion reducida mediante la regla generica de `sweep.py` del proyecto `transformers-mic`: `num_hidden_layers = 2`. Los ficheros de procesador (`config_sentence_transformers.json`, `modules.json`, `sentence_bert_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.txt`) se copiaron byte a byte desde el checkpoint original, de modo que la interfaz de tokenizacion y de Sentence Transformers es identica.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron con un test de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplazo los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, 0,0149). Los tensores conservan los mismos nombres que el checkpoint real y el modelo es finito en float32, bfloat16 y float16 (forward, loss y gradientes). La clave de fixture es `0b79d3783837` y cubre todos los checkpoints cuyos ficheros de procesador son byte-identicos y cuya config coincide tras la reduccion.

## Capacidades

- No genera embeddings semanticos utiles: los pesos son aleatorios y el modelo no ha sido entrenado.
- Conserva la interfaz de `NomicBertModel` y de Sentence Transformers, lo que permite validar codigo de carga, tokenizacion y forward pass.
- Sirve como fixture para tests de integracion y de contrato de framework (Transformers).
- Soporta ejecucion en float32, bfloat16 y float16 sin valores no finitos en forward, loss ni gradientes.
- No dispone de tool calling, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidades multilingues: no disponible.

## Casos de uso

- Tests de integracion en CI: cargar el modelo con Transformers y verificar que la tokenizacion, las formas de los tensores y el forward pass coinciden con lo esperado, sin descargar el checkpoint completo de 137M de parametros.
- Validacion de contratos de framework: comprobar que una integracion nueva respeta el manifiesto `integration.json` y el directorio de expectativas de Transformers antes de apuntar al modelo real.
- Pruebas de compatibilidad de tipos: verificar que el pipeline funciona en float32, bfloat16 y float16 sin producir NaN ni infinitos.
- Desarrollo de utilidades de embeddings: probar codigo de preprocesado, pooling y normalizacion contra una interfaz estable y ligera.
- Reproduccion de fixtures: regenerar el artefacto con `python example/build_fixtures.py --fixture nomic-embed-text-v1.5-mic` y comparar hashes con `build.json`.
- Docencia y demos de arquitectura: inspeccionar la estructura de un `NomicBertModel` con solo 2 capas y 2M de parametros en entornos con recursos minimos.
- Validacion de pipelines de empaquetado: comprobar que el repositorio se sirve correctamente desde el Hub con pesos safetensors y ficheros de procesador asociados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad de embeddings carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en float32 (2,04M de parametros, unos 8 MB de pesos, mas overhead de activaciones y tokenizador).
- GPU recomendadas: cualquier GPU consumer moderna o incluso CPU; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) y en CPU.
- Opciones de despliegue: Transformers con `trust_remote_code` (el repo usa `custom_code`); no se documentan recetas para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; por el tamano, la latencia sera despreciable frente al modelo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/nomic-embed-text-v1.5-mic` | 2,04M | no disponible | Fixture de test | no disponible | Hugging Face |
| `nomic-ai/nomic-embed-text-v1.5` | no disponible en la informacion | no disponible | Embeddings de texto reales | no disponible | Hugging Face |
| Otros fixtures de `huggingface-mic` | variable | no disponible | Fixtures de test | no disponible | Hugging Face |

La comparacion relevante es con el modelo base: mismo nombre de tensores y misma interfaz, pero sin capacidad funcional de embeddings. Frente a otros modelos de embeddings de tamano similar, la comparacion no procede porque este artefacto no esta pensado para producir representaciones utiles.

## Limitaciones y advertencias

- Pesos aleatorios: los embeddings generados no tienen significado semantico; no usar en busqueda, RAG, clustering ni similitud.
- Etiquetado explicitamente como `test-artifact` por el autor para excluirlo de busquedas de modelos candidatos.
- Licencia no disponible: no puede asumirse uso comercial sin consultar el repositorio original de Nomic AI.
- Idiomas y contexto no documentados en esta ficha; dependen de la configuracion copiada del modelo base.
- El repositorio usa `custom_code`, por lo que la carga requiere `trust_remote_code=True`, con el riesgo de seguridad asociado.
- El tamano del repo aparece como 0.0 GB en los metadatos, lo que puede indicar ficheros LFS no contabilizados o un empaquetado incompleto; conviene verificar antes de integrarlo.
- No sustituye al checkpoint real en produccion: cualquier validacion funcional debe repetirse con `nomic-ai/nomic-embed-text-v1.5`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/nomic-embed-text-v1.5-mic
- Modelo base: https://huggingface.co/nomic-ai/nomic-embed-text-v1.5
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/nomic-embed-text-v1.5-mic.html
- Script de reduccion (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Manifiesto de contrato (`integration.json`): https://huggingface.co/huggingface-mic/nomic-embed-text-v1.5-mic/blob/main/integration.json
- Uso con Transformers (`usage.md`): https://huggingface.co/huggingface-mic/nomic-embed-text-v1.5-mic/blob/main/integrations/transformers/usage.md
- Procedencia del fixture (`build.json`): https://huggingface.co/huggingface-mic/nomic-embed-text-v1.5-mic/blob/main/build.json
