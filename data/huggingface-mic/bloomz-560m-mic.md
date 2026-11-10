# huggingface-mic/bloomz-560m-mic

## Resumen

`bloomz-560m-mic` es un artefacto de prueba publicado por la organización `huggingface-mic`, no un modelo de lenguaje utilizable. Se trata de una versión reducida ("slim fixture") del modelo `bigscience/bloomz-560m` de BigScience, con solo 16,2 millones de parámetros frente a los 560 millones del original, y con pesos generados aleatoriamente (semilla 17) en lugar de entrenados. Su propósito es servir como fixture reproducible para validar contratos de integración con Transformers (formas de entrada, nombres de tensores, expectativas de framework).

El repositorio incluye los pesos reducidos, ejemplos de uso ejecutables y directorios de expectativas de framework, además de un manifiesto de contrato (`integration.json`) y metadatos de procedencia (`build.json`). La arquitectura subyacente es `BloomForCausalLM`, la misma del checkpoint original, pero con una configuración encogida mediante una regla genérica del proyecto `transformers-mic`. Los ficheros del procesador (tokenizer y mapa de tokens especiales) se copian byte a byte desde `bigscience/bloomz-560m`.

Es relevante únicamente en el contexto de ingeniería de pruebas: permite verificar pipelines de carga, serialización y forward pass sin descargar los 560 millones de parámetros reales. El propio autor lo etiqueta como `test-artifact` para excluirlo de búsquedas de modelos candidatos. No debe emplearse para inferencia, generación de texto ni ninguna tarea de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BloomForCausalLM (transformer causal decoder-only) |
| Parametros totales | 16.156.544 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32; finito también en bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | bigscience/bloomz-560m |
| Tamano del repositorio | 0,1 GB |
| Dtype de carga | float32 |
| Semilla de pesos | 17 (aleatorios) |

## Arquitectura y entrenamiento

La arquitectura es la de BLOOM, un transformer decoder-only causal con atención multi-cabeza estándar, implementado en Transformers como `BloomForCausalLM`. La configuración se ha reducido respecto al checkpoint original mediante la regla genérica de `sweep.py` del repositorio `transformers-mic`, manteniendo los mismos nombres de tensores que el modelo real. Los ficheros del procesador (`special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`) se copian byte a byte desde `bigscience/bloomz-560m`.

No hay entrenamiento: los pesos son aleatorios (semilla 17) y solo pasaron una puerta de sensibilidad a la entrada, según la cual cada perturbación de las entradas del contrato movía los logits al menos 0,001 (el caso más débil, `attention_mask:all_ones`, con 0,0313). Los pesos son finitos en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. No se documentan datos de entrenamiento, RLHF, DPO ni ninguna innovación técnica adicional.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen texto coherente.
- Sirve como fixture para validar la carga con `BloomForCausalLM` en Transformers.
- Permite comprobar nombres de tensores, formas y compatibilidad de configuración frente al checkpoint real.
- Verifica la copia byte a byte de los ficheros del tokenizer.
- Ejecutable en float32, bfloat16 y float16 (forward, loss y gradientes finitos).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües reales.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Pruebas de integración en CI: cargar el fixture con `AutoModelForCausalLM` y verificar que el pipeline de serialización y deserialización funciona sin descargar el modelo real de 560M.
- Validación de contratos de framework: comprobar que las formas de entrada y los nombres de tensores esperados coinciden con los del checkpoint `bigscience/bloomz-560m`.
- Desarrollo de herramientas de inspección de modelos: usar el fixture para probar utilidades que enumeran parámetros, capas y configuraciones sin coste de descarga.
- Pruebas de compatibilidad de dtype: verificar que un pipeline maneja correctamente float32, bfloat16 y float16 con un modelo pequeño y rápido.
- Regresión de tokenizer: validar que los ficheros del procesador se cargan y producen los mismos IDs que el modelo original, al ser copias byte a byte.
- Docencia y demos de arquitectura BLOOM: ilustrar la estructura de un transformer decoder-only con un checkpoint de 0,1 GB que cabe en cualquier entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K) carecería de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en float32 (16,2M parámetros); aproximadamente 32 MB en float16.
- GPU recomendadas: cualquier GPU consumer, incluida una GTX 1650 o integradas; no requiere A100 ni H100.
- Cabe holgadamente en cualquier GPU consumer y en CPU.
- Opciones de despliegue: Transformers (carga estándar con `BloomForCausalLM`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| bloomz-560m-mic | 16,2M | no disponible | no disponible | Fixture de prueba (pesos aleatorios) |
| bigscience/bloomz-560m | 560M | 2048 tokens (modelo original) | BigScience BLOOM RAIL 1.0 (modelo original) | Modelo multilingüe funcional |
| bigscience/bloom-560m | 560M | 2048 tokens (modelo original) | BigScience BLOOM RAIL 1.0 (modelo original) | Modelo base sin instrucciones |

La comparación es únicamente estructural: `bloomz-560m-mic` comparte arquitectura y tokenizer con `bigscience/bloomz-560m`, pero no es un modelo funcional y no debe evaluarse como tal. Los datos de contexto y licencia del modelo original se indican a título de referencia; el fixture no hereda necesariamente esas condiciones y su licencia figura como no disponible.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no genera texto coherente ni responde a instrucciones.
- Etiquetado explícitamente como `test-artifact`; no debe usarse en producción ni en investigación que requiera capacidades reales.
- La licencia no está disponible en la información proporcionada; verificar antes de cualquier uso, incluso de prueba.
- El contexto máximo no está documentado para esta configuración reducida.
- No se han publicado datos sobre sesgos, alucinación o comportamiento multilingüe, al no ser un modelo entrenado.
- El repositorio es de 0,1 GB y contiene solo pesos, uso y expectativas; otros ficheros deben regenerarse con `build_fixtures.py`.
- No debe confundirse con `bigscience/bloomz-560m` en pipelines automáticos de selección de modelos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/bloomz-560m-mic
- Modelo base: https://huggingface.co/bigscience/bloomz-560m
- Documentación de reducción del fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/bloomz-560m-mic.html
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de reducción (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
