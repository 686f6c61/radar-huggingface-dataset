# huggingface-mic/gemma-2b-mic

## Resumen

`gemma-2b-mic` es un artefacto de prueba publicado por el usuario `huggingface-mic` en Hugging Face. No se trata de un modelo entrenado ni utilizable para inferencia real, sino de un "fixture" (modelo reducido de test) derivado de `google/gemma-2b`, pensado para validar contratos de integración y expectativas de framework dentro del proyecto Transformers MIC. El autor lo etiqueta explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos.

El repositorio contiene pesos "slim" (16.453.952 parámetros reales según safetensors, frente a los aproximadamente 2.500 millones del Gemma 2B original), con la misma arquitectura `GemmaForCausalLM` pero una configuración reducida a 2 capas ocultas. Los ficheros de procesador (`tokenizer.json`, `tokenizer.model`, `tokenizer_config.json`, `special_tokens_map.json`, `generation_config.json`) se copian byte a byte desde `google/gemma-2b`, de modo que el contrato de tokenización es idéntico al del modelo original.

Su relevancia no es de uso productivo: sirve como fixture reproducible para tests de integración en Transformers, con nombres de tensores idénticos al checkpoint real y pesos aleatorios (semilla 17) que superaron una puerta de sensibilidad a la entrada. Es útil para desarrolladores que trabajen en el proyecto Transformers MIC o en validación de contratos de frameworks, no para aplicaciones de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`GemmaForCausalLM`), configuración reducida a 2 capas ocultas |
| Parametros totales | 16.453.952 (pesos reales en safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de la config de `google/gemma-2b`, no verificada en la información) |
| Tipos de cuantizacion | no disponible; pesos guardados en bfloat16 |
| Idiomas soportados | no disponible (tokenizador heredado de `google/gemma-2b`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo `GemmaForCausalLM`, con la misma estructura de tensores que `google/gemma-2b` pero con `num_hidden_layers` reducido a 2 mediante la regla genérica de `sweep.py` del repositorio `transformers-mic`. Los ficheros de procesador se copian byte a byte desde el modelo base, garantizando compatibilidad de tokenización y generación.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron mediante una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato movía los logits al menos 0.001 (la más débil, `attention_mask:all_ones`, con 0.0732). Los pesos son finitos en float32, bfloat16 y float16 (forward, loss y gradientes). El fixture se generó con `build_fixtures.py` y su procedencia queda registrada en `build.json` con fuentes fijadas, resultados de la puerta y hashes de ficheros. La clave de fixture es `e6f0cbd8bd78`.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen texto coherente.
- Sirve como fixture de test para validar contratos de integración en Transformers (nombres de tensores, formas, dtypes).
- Permite verificar la carga del modelo (`GemmaForCausalLM`) con los ficheros de procesador reales de `google/gemma-2b`.
- Valida el comportamiento de forward, loss y gradientes en float32, bfloat16 y float16.
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso.
- No tiene capacidades multilingües reales (el tokenizador es el de Gemma 2B, pero los pesos no generan lenguaje).

## Casos de uso

- Tests de integración en Transformers: usar el fixture para verificar que el pipeline de carga, tokenización y forward funciona con la arquitectura Gemma sin descargar los ~5 GB del checkpoint real.
- Validación de contratos de framework: comprobar que las expectativas documentadas en `integrations/transformers/expectations` se cumplen (formas de tensores, dtypes, nombres de parámetros).
- CI/CD de bajo coste: ejecutar tests de regresión de la librería `transformers-mic` en runners con poca memoria, ya que el repo pesa 10.1 GB pero el modelo cargado ocupa mucho menos.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture gemma-2b-mic` y comparar hashes con `build.json`.
- Pruebas de sensibilidad a la entrada: verificar que perturbaciones en `attention_mask`, `input_ids` y demás entradas mueven los logits por encima del umbral definido.
- Desarrollo de herramientas de inspección de modelos: probar scripts que analizan arquitecturas, dtypes y estructuras de checkpoints sin depender de pesos reales.
- Formación y documentación: ilustrar cómo se construye un fixture reproducible a partir de un modelo base con tokenizador real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de test con pesos aleatorios, no tiene sentido evaluar MMLU, HumanEval, GSM8K ni métricas similares.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, en torno a decenas de MB en bfloat16 para 16.5M parámetros (los pesos ocupan aproximadamente 33 MB en bfloat16).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere aceleradores de datacenter.
- Cabe en cualquier GPU consumer e incluso en CPU y en entornos CI sin GPU.
- Opciones de despliegue: `transformers` con `GemmaForCausalLM`; no está pensado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo funcional.
- Latencia y throughput: no disponibles; irrelevantes para un fixture de test.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|
| `huggingface-mic/gemma-2b-mic` | 16.453.952 (fixture) | no disponible | no disponible | Test artifact |
| `google/gemma-2b` | ~2.500 millones (no confirmado en la información) | no disponible | Gemma Terms of Use (según el modelo base, no verificado aquí) | Modelo funcional |
| `google/gemma-2b-it` | no disponible | no disponible | no disponible | Modelo funcional instruido |

La comparación con alternativas funcionales no es significativa: `gemma-2b-mic` es un fixture de test, no un modelo de lenguaje utilizable. Cualquier comparación de rendimiento o calidad carece de sentido.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene significado lingüístico.
- Etiquetado como `test-artifact` para excluirlo de búsquedas de modelos candidatos; no debe desplegarse en producción.
- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor y al modelo base `google/gemma-2b`.
- Idiomas no declarados; el tokenizador es el de Gemma 2B pero el modelo no genera lenguaje.
- Riesgo de confusión: el nombre puede llevar a pensar que es un Gemma 2B funcional; conviene revisar la model card antes de descargarlo.
- El repo pesa 10.1 GB aunque los pesos reales sean pequeños; el tamaño se debe probablemente a los ficheros de tokenizador y artefactos auxiliares, no a los pesos.
- No apto para benchmarks, evaluación de calidad ni comparativas de rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/gemma-2b-mic
- Modelo base: https://huggingface.co/google/gemma-2b
- Repositorio Transformers MIC: https://github.com/huggingface/transformers-mic
- Script de reducción (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Documentación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/gemma-2b-mic.html
- Manifiesto de contrato (`integration.json`): https://huggingface.co/huggingface-mic/gemma-2b-mic/blob/main/integration.json
- Uso con Transformers (`usage.md`): https://huggingface.co/huggingface-mic/gemma-2b-mic/blob/main/integrations/transformers/usage.md
- Procedencia del fixture (`build.json`): https://huggingface.co/huggingface-mic/gemma-2b-mic/blob/main/build.json
