# huggingface-mic/opt-125m-mic

## Resumen

`opt-125m-mic` es un artefacto de prueba (test fixture) publicado por la organizacion `huggingface-mic` en Hugging Face. No es un modelo de lenguaje entrenado ni utilizable: es una version reducida artificialmente del checkpoint `facebook/opt-125m`, pensada para validar contratos de integracion y expectativas de frameworks (concretamente Transformers) sin necesidad de descargar ni ejecutar el modelo completo. El autor lo etiqueta explicitamente como `test-artifact` para excluirlo de las busquedas de modelos candidatos.

El repositorio contiene pesos "slim" de aproximadamente 1.004.672 parametros (frente a los 125 millones del modelo original), con la misma arquitectura `OPTForCausalLM` pero con `num_hidden_layers` reducido a 2. Los pesos son aleatorios (semilla 17), no entrenados, y los ficheros del procesador (tokenizer, `generation_config.json`, `special_tokens_map.json`, etc.) se copian byte a byte desde `facebook/opt-125m`.

Su relevancia es puramente de ingenieria: sirve como fixture reproducible para pruebas de integracion de frameworks, verificacion de contratos de API y validacion de pipelines de CI. Cualquier uso como modelo generativo real carece de sentido porque no ha recibido entrenamiento alguno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OPT (transformer decoder-only, `OPTForCausalLM`) |
| Parametros totales | 1.004.672 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el fixture no documenta contexto propio; hereda la configuracion del checkpoint base tras el shrink) |
| Tipos de cuantizacion | no disponible; pesos guardados en float16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repo copia `LICENSE.md` de `facebook/opt-125m`, pero no se declara licencia propia) |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

El modelo replica la arquitectura OPT de Meta: un transformer decoder-only con atencion causal. En este caso, la configuracion se ha reducido mediante la regla generica de `sweep.py` del repositorio `transformers-mic`, fijando `num_hidden_layers = 2`. Los nombres de tensores coinciden exactamente con los del checkpoint real `facebook/opt-125m`, lo que permite sustituir uno por otro en pruebas de carga sin cambiar el codigo.

No hubo entrenamiento. Los pesos se inicializan aleatoriamente con semilla 17 y se validan mediante un "input-sensitivity gate": cada perturbacion de las entradas del contrato debe mover los logits al menos 0.001 (la mas debil, `input_ids:roll_batch`, produce 0.00429). Los pesos son finitos en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El fixture esta identificado por la clave `5a07dd710c26` y cubre todos los checkpoints cuyos ficheros de procesador son byte-identicos y cuya config coincide tras el shrink.

## Capacidades

- No tiene capacidades generativas reales: los pesos son aleatorios y no han sido entrenados.
- Sirve como fixture de integracion para validar la carga del modelo en Transformers (`OPTForCausalLM`).
- Permite verificar contratos de API y expectativas de framework recogidas en `integrations/transformers/expectations`.
- Reproduce los nombres de tensores del checkpoint original, util para tests de compatibilidad.
- Los ficheros de tokenizer son identicos a los de `facebook/opt-125m`, por lo que el pipeline de tokenizacion funciona igual.
- No soporta tool calling, agentes, vision, audio ni modo thinking.
- Multilingue: no disponible (depende del tokenizer heredado, pero sin pesos entrenados no hay comportamiento linguistico evaluable).

## Casos de uso

- Pruebas de integracion en CI: usar el fixture para validar que un pipeline de Transformers carga correctamente `OPTForCausalLM` sin descargar los 125M de parametros del modelo real, reduciendo tiempo y ancho de banda en cada build.
- Validacion de contratos de framework: comprobar que las expectativas documentadas en `integrations/transformers/expectations` se cumplen (formas de tensores, dtypes, nombres de parametros) antes de actualizar la version de Transformers.
- Test de regresion de tokenizer: al copiar byte a byte `vocab.json`, `merges.txt` y `tokenizer_config.json`, permite verificar que los cambios en el pipeline de tokenizacion no alteran la salida esperada.
- Desarrollo de herramientas de introspeccion de modelos: probar utilidades que inspeccionan la config, el grafo de tensores o los metadatos de un checkpoint sin coste de computo.
- Validacion de pipelines de cuantizacion: comprobar que una herramienta de conversion (por ejemplo, a GGUF) maneja correctamente un checkpoint OPT de estructura identica pero tamano minimo.
- Formacion y demos: ilustrar como se construye un fixture reproducible a partir de un modelo base, siguiendo `build_fixtures.py` y `build.json` como referencia documental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K) seria meaningless y no se reporta.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en float16 (1.004.672 parametros x 2 bytes), mas overhead de activaciones y tokenizer.
- GPU recomendadas: cualquiera, incluida CPU. No requiere GPU dedicada.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (carga directa con `OPTForCausalLM`); vLLM, llama.cpp, Ollama y TGI no estan documentados para este fixture y su uso no esta previsto.
- Latencia y throughput: no disponibles; al no ser un modelo entrenado, las metricas de generacion no son representativas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/opt-125m-mic` | 1.004.672 | no disponible | Fixture de test | no disponible | Hugging Face |
| `facebook/opt-125m` | 125M | 2048 tokens | Modelo generativo real | OPT License (no comercial segun la model card original) | Hugging Face |
| `facebook/opt-350m` | 350M | 2048 tokens | Modelo generativo real | OPT License | Hugging Face |

La comparativa es limitada: el fixture no compite en calidad con los modelos OPT reales porque no ha sido entrenado. Su unico equivalente conceptual son otros fixtures de la misma organizacion (`huggingface-mic`), no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no genera texto coherente ni responde a instrucciones; cualquier salida es ruido estadistico.
- Etiquetado como `test-artifact`: no debe usarse en produccion ni como base para fine-tuning.
- Licencia no declarada de forma explicita: el repo copia `LICENSE.md` de `facebook/opt-125m`, pero la model card no aclara los terminos aplicables al fixture. Verificar antes de cualquier redistribucion.
- Contexto y comportamiento linguistico no documentados: la configuracion reducida no refleja el contexto real del modelo base.
- Riesgo de confusion: el nombre `opt-125m-mic` puede llevar a pensar que es una variante del modelo de 125M; no lo es.
- Sin soporte de tool calling, agentes ni capacidades multimodales.
- No apto para evaluacion de sesgos ni de alucinacion, al carecer de entrenamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huggingface-mic/opt-125m-mic
- Modelo base: https://huggingface.co/facebook/opt-125m
- Documentacion de uso en Transformers: `integrations/transformers/usage.md` (dentro del repo)
- Expectativas de Transformers: `integrations/transformers/expectations` (dentro del repo)
- Manifiesto de contrato: `integration.json` (dentro del repo)
- Procedencia del fixture: `build.json` (dentro del repo)
- Explicacion del shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/opt-125m-mic.html
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de shrink: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
