# huggingface-mic/OLMo-1B-hf-mic

## Resumen

OLMo-1B-hf-mic es un artefacto de prueba (fixture) publicado por el usuario huggingface-mic, derivado del modelo allenai/OLMo-1B-hf de AI2. No es un modelo utilizable: se trata de una version "slim" con 3.301.376 parametros (frente a los aproximadamente 1.200 millones del OLMo-1B original) creada para validar contratos de integracion con frameworks. El autor lo etiqueta explicitamente como `test-artifact` para excluirlo de las busquedas de modelos candidatos.

El repositorio combina pesos reducidos, ejemplos de uso ejecutables y un directorio de expectativas de framework, todo bajo una misma estructura contractual. La arquitectura subyacente es `OlmoForCausalLM`, pero con solo 2 capas ocultas tras aplicar la regla generica de reduccion de `sweep.py`. Los pesos son aleatorios (semilla 17), no entrenados, y los ficheros de procesador (tokenizer, generation_config, special_tokens_map) se copian byte a byte del checkpoint original.

Su relevancia es instrumental, no funcional: sirve a desarrolladores de integraciones (Transformers y similares) para verificar que el pipeline de carga, tokenizacion y forward pass se comporta como se espera con la arquitectura OLMo, sin necesidad de descargar el modelo completo. Cualquier uso como modelo generativo de texto carece de sentido porque los pesos no han sido entrenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OlmoForCausalLM (transformer causal, config reducida a 2 capas ocultas) |
| Parametros totales | 3.301.376 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |
| Modelo base | allenai/OLMo-1B-hf |
| Tipo de artefacto | fixture de test (`test-artifact`) |
| Semilla de pesos | 17 (aleatorios) |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

La arquitectura declarada es `OlmoForCausalLM`, la misma familia que el OLMo-1B de AI2, pero con la configuracion reducida mediante la regla generica de `sweep.py` del proyecto transformers-mic: `num_hidden_layers` se fija en 2. Los nombres de tensores coinciden con los del checkpoint real, de modo que la fixture expone exactamente la misma interfaz de parametros, aunque con dimensiones mucho menores.

No hubo entrenamiento. Los pesos se inicializan de forma aleatoria con semilla 17 y se validan mediante una "input-sensitivity gate": cada perturbacion de las entradas del contrato debe mover los logits al menos 0.001. La perturbacion mas debil registrada (`attention_mask:all_ones`) produce un desplazamiento de 0.362, por lo que se considera que la fixture pasa el umbral sin necesidad de ajuste. Los ficheros de procesador (`generation_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`) se copian byte a byte desde `allenai/OLMo-1B-hf`. El artefacto se guarda en float32 (el dtype por defecto del modelo base) y se verifica que es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes.

## Capacidades

- Carga y ejecucion en Transformers con la clase `OlmoForCausalLM`, verificada mediante ejemplos de uso en `integrations/transformers/usage.md`.
- Verificacion de contratos de framework: el directorio `integrations/transformers/expectations` documenta las salidas esperadas para entradas dadas.
- Forward pass estable en float32, bfloat16 y float16 (logits, loss y gradientes finitos).
- Compatibilidad de nombres de tensores con el checkpoint `allenai/OLMo-1B-hf`, util para probar rutas de carga y mapeo de pesos.
- Tokenizacion identica a la del modelo base, al copiarse los ficheros de procesador sin modificacion.
- No soporta generacion de texto util: los pesos son aleatorios y no han sido entrenados.
- No dispone de tool calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Pruebas de integracion en CI: usar la fixture para validar que un pipeline de carga de Transformers acepta la arquitectura OLMo y produce logits con la forma esperada, sin descargar el modelo de 1.2B parametros.
- Verificacion de contratos de framework: comparar las salidas del modelo contra `integrations/transformers/expectations` para detectar regresiones en versiones de Transformers o en adaptadores propios.
- Desarrollo de tooling de tokenizacion: al reutilizar el tokenizer original byte a byte, permite probar flujos de preprocesado y decodificacion con la misma logica que el modelo real.
- Validacion de rutas de pesos: comprobar que un cargador personalizado mapea correctamente los nombres de tensores de `OlmoForCausalLM` antes de pasar al checkpoint completo.
- Pruebas de dtype y estabilidad numerica: ejercitar forward, loss y backward en float32, bfloat16 y float16 para verificar que el codigo de entrenamiento no produce NaN ni infinitos.
- Docencia y demos de arquitectura: ilustrar la estructura de un transformer causal OLMo con un artefacto ligero que cabe en cualquier entorno, sin coste de descarga ni GPU dedicada.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture OLMo-1B-hf-mic` y comparar hashes registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de test con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K u otras) carece de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (3,3 M de parametros, aproximadamente 13 MB de pesos mas overhead de activaciones y tokenizer).
- GPU recomendadas: cualquier GPU consumer moderna o incluso CPU es suficiente; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) y en entornos sin GPU.
- Opciones de despliegue: Transformers es la via documentada por el autor; no se han publicado instrucciones para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma oficial; por el tamano del artefacto, el forward pass es practicamente instantaneo en cualquier hardware moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/OLMo-1B-hf-mic | 3.301.376 | no disponible | Fixture de test para integraciones | no disponible | Hugging Face |
| allenai/OLMo-1B-hf | ~1.200 M | no disponible en la informacion proporcionada | Modelo base causal de AI2 | no disponible en la informacion proporcionada | Hugging Face |
| Otros fixtures de transformers-mic | variable (segun modelo base) | no disponible | Validacion de contratos de framework | no disponible | Hugging Face (organizacion huggingface-mic) |

La comparativa con modelos generativos reales no es pertinente: la fixture no compite en calidad de generacion, sino en fidelidad estructural con el checkpoint del que deriva.

## Limitaciones y advertencias

- Pesos aleatorios sin entrenamiento: cualquier texto generado sera incoherente; no debe usarse como modelo de produccion.
- Etiquetado como `test-artifact` por el propio autor para excluirlo de busquedas de modelos candidatos.
- Licencia no declarada en la informacion disponible; verificar terminos antes de cualquier redistribucion.
- Idiomas soportados no declarados; el tokenizer proviene del modelo base, pero el modelo no ha sido evaluado en ninguna lengua.
- Longitud de contexto no declarada en la informacion proporcionada.
- Solo 2 capas ocultas: la capacidad representacional es minima aunque los nombres de tensores coincidan con el modelo real.
- No hay benchmarks publicados; no es posible comparar su rendimiento con alternativas.
- El repositorio tiene 0.0 GB de tamano reportado, coherente con un artefacto ligero, pero conviene verificar la integridad de los ficheros antes de usarlo en CI.
- No dispone de integraciones documentadas para vLLM, llama.cpp, Ollama ni TGI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/OLMo-1B-hf-mic
- Modelo base: https://huggingface.co/allenai/OLMo-1B-hf
- Manifest del contrato: `integration.json` (en el repositorio)
- Uso en Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Procedencia de la fixture: `build.json` (en el repositorio)
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/OLMo-1B-hf-mic.html
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
