# huggingface-mic/Qwen3.5-35B-A3B-mic

## Resumen

`huggingface-mic/Qwen3.5-35B-A3B-mic` no es un modelo funcional, sino un *fixture* de test: una version reducida artificialmente del modelo `Qwen/Qwen3.5-35B-A3B` creada por el proyecto `transformers-mic` para validar la integracion de frameworks (principalmente Transformers) con la arquitectura `Qwen3_5MoeForConditionalGeneration`. El repositorio contiene pesos *slim* de 33,3 millones de parametros generados de forma aleatoria (semilla 17), junto con los ficheros de procesador copiados byte a byte del checkpoint original y la documentacion de contrato de uso.

El objetivo del artefacto es servir como banco de pruebas reproducible: permite a los desarrolladores de `transformers-mic` verificar que el pipeline de carga, tokenizacion, preprocesado y ejecucion funciona correctamente con la arquitectura MoE de Qwen 3.5 sin necesidad de descargar ni ejecutar el modelo real de 35B parametros. La propia model card lo etiqueta explicitamente como `test-artifact` y advierte de que "no es un modelo usable".

Por tanto, esta ficha documenta un artefacto de ingenieria, no un modelo de lenguaje. Cualquier uso generativo, de razonamiento o de codigo con estos pesos producira salidas sin sentido, ya que los pesos son aleatorios y la configuracion se ha reducido a 2 capas ocultas de texto. Es relevante unicamente para quien trabaje en la integracion de frameworks o en la validacion de contratos de modelos MoE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5MoeForConditionalGeneration` (transformer MoE multimodal, reducido a 2 capas de texto) |
| Parametros totales | 33.271.920 (fixture); el modelo base declara 35B en el nombre, dato no verificado en la informacion disponible |
| Parametros activos | no disponible (el modelo base es MoE A3B, pero el fixture no conserva la configuracion real) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el fichero `LICENSE` se copia del modelo base, pero su contenido no se especifica) |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura `Qwen3_5MoeForConditionalGeneration` del modelo base, que segun la model card es de tipo MoE (Mixture of Experts) y multimodal condicional, con ficheros de preprocesado de texto, imagen y video (`preprocessor_config.json`, `video_preprocessor_config.json`). La configuracion se ha reducido mediante la regla generica de `sweep.py` del repositorio `transformers-mic`, dejando `num_hidden_layers` de texto en 2. Los nombres de tensores coinciden con los del checkpoint real, lo que permite validar la compatibilidad de carga sin disponer de los pesos originales.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron con una *input-sensitivity gate*: cada perturbacion de las entradas del contrato movio los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, dio 0,116). Los pesos son finitos en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. Los ficheros de procesador (`tokenizer.json`, `tokenizer_config.json`, `chat_template.jinja`, `merges.txt`, `vocab.json`, etc.) se copiaron byte a byte desde `Qwen/Qwen3.5-35B-A3B`, por lo que la tokenizacion y la plantilla de chat si son las reales del modelo base.

## Capacidades

- No es un modelo usable: no genera texto coherente, no razona, no escribe codigo ni resuelve matematicas.
- Sirve como fixture de integracion para validar la carga del modelo en Transformers y en otros frameworks que consuman el contrato.
- Permite validar el pipeline de tokenizacion y plantilla de chat reales del modelo base (ficheros copiados byte a byte).
- Permite validar el preprocesado multimodal (imagen y video) declarado en los ficheros de configuracion copiados.
- Comprueba la sensibilidad de las entradas del contrato (perturbaciones sobre logits) como test de regresion.
- No soporta tool calling, agentes ni multi-step reasoning de forma funcional.
- No tiene capacidades multilingues reales (los pesos son aleatorios), aunque el tokenizador si es el del modelo base.

## Casos de uso

- Validacion de integracion en Transformers: cargar el fixture con `Qwen3_5MoeForConditionalGeneration` para comprobar que la clase, los nombres de tensores y la configuracion reducida se resuelven sin errores antes de probar con el checkpoint real de 35B.
- Test de regresion en CI: ejecutar el forward y comprobar que los logits responden a perturbaciones de las entradas (gate de sensibilidad), detectando roturas en el pipeline de atencion o enmascaramiento.
- Verificacion de tokenizacion y plantilla de chat: usar los ficheros copiados del modelo base para validar que el `chat_template.jinja` y el tokenizador producen las secuencias esperadas en el framework integrado.
- Validacion de preprocesado multimodal: comprobar que `preprocessor_config.json` y `video_preprocessor_config.json` se cargan y aplican correctamente en el pipeline de imagen y video.
- Pruebas de compatibilidad de dtypes: verificar que el forward, la loss y los gradientes son finitos en float32, bfloat16 y float16, lo que ayuda a detectar problemas de numerica antes de escalar al modelo real.
- Desarrollo de herramientas de introspeccion de modelos: inspeccionar la estructura de tensores y la configuracion MoE reducida sin coste de descarga ni de GPU, util para construir utilidades de analisis de checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto es un fixture de test con pesos aleatorios, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (33,3M parametros, ~133 MB de pesos), mas overhead de activaciones y del tokenizador.
- GPU recomendadas: cualquier GPU consumer moderna o incluso CPU; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer (GTX 1060, RTX 3060, etc.) y en CPU.
- Opciones de despliegue: Transformers (via `Qwen3_5MoeForConditionalGeneration`), y previsiblemente cualquier framework que consuma safetensors y la configuracion reducida; no se documentan recetas para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; al ser un fixture de 2 capas, la latencia es practicamente despreciable, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/Qwen3.5-35B-A3B-mic` | 33,3M (fixture) | no disponible | Fixture de test para integracion de frameworks | no disponible | Hugging Face, 2399 descargas |
| `Qwen/Qwen3.5-35B-A3B` | 35B (MoE A3B, segun nombre) | no disponible | Modelo generativo real | no disponible | Hugging Face (modelo base) |
| Otros fixtures `transformers-mic` | Variable (reducidos) | no disponible | Validacion de contratos de arquitectura | no disponible | Hugging Face (organizacion `huggingface-mic`) |

La comparativa relevante es contra el modelo base y contra otros fixtures del mismo proyecto; no tiene sentido compararlo con modelos generativos de produccion porque no es uno de ellos.

## Limitaciones y advertencias

- Pesos aleatorios: las salidas no tienen significado. No debe usarse para inferencia real, demos ni evaluaciones de calidad.
- Etiquetado como `test-artifact`: el autor lo excluye explicitamente de la busqueda de modelos candidatos.
- Configuracion reducida a 2 capas de texto: no refleja el comportamiento numerico ni la dinamica de atencion del modelo de 35B.
- Licencia no disponible: el fichero `LICENSE` se copia del modelo base, pero su contenido no se especifica en la informacion proporcionada; verificar antes de cualquier redistribucion.
- Idiomas no disponibles: aunque el tokenizador es el real, no hay garantia de cobertura linguistica funcional.
- Riesgo de confusion: por el nombre, podria confundirse con un fine-tune del modelo base; no lo es.
- No apto para produccion: cualquier despliegue con estos pesos dara resultados sin sentido y puede inducir a error a usuarios finales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Qwen3.5-35B-A3B-mic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Manifiesto de contrato (`integration.json`): https://huggingface.co/huggingface-mic/Qwen3.5-35B-A3B-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/Qwen3.5-35B-A3B-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/Qwen3.5-35B-A3B-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture (`build.json`): https://huggingface.co/huggingface-mic/Qwen3.5-35B-A3B-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Qwen3.5-35B-A3B-mic.html
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de barrido (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
