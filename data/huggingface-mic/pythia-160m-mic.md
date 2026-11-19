# huggingface-mic/pythia-160m-mic

## Resumen

`pythia-160m-mic` es un artefacto de prueba (test fixture) publicado por la organización `huggingface-mic` en Hugging Face. No es un modelo entrenado ni utilizable para inferencia real: se trata de una versión "adelgazada" (*slim*) del modelo `EleutherAI/pythia-160m`, reducida a 6.505.984 parámetros mediante una regla genérica de reducción de configuración que rebaja el número de capas ocultas a 2. Su propósito es servir como fixture reproducible para validar contratos de integración con frameworks (concretamente Transformers), no para generar texto.

El repositorio empaqueta en un solo lugar los pesos reducidos, el manifiesto de contrato (`integration.json`), la documentación de uso y las expectativas del framework. Los pesos son aleatorios (semilla 17), aunque pasaron una comprobación de sensibilidad a las entradas que garantiza que perturbaciones en las entradas del contrato mueven los logits al menos 0,001. Los ficheros de procesador (tokenizador y mapas de tokens especiales) se copiaron byte a byte desde `EleutherAI/pythia-160m`.

Es relevante únicamente en el contexto de ingeniería de software y pruebas de integración de modelos: permite verificar que un pipeline de carga, tokenización y forward pass funciona con la arquitectura `GPTNeoXForCausalLM` sin descargar los pesos completos del modelo original. Está etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPTNeoX (`GPTNeoXForCausalLM`), transformer causal decoder-only |
| Parametros totales | 6.505.984 (fixture reducido; el modelo base tiene ~160M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (pesos guardados en float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float16) |
| Numero de capas ocultas | 2 (reducido desde el modelo base) |
| Modelo base | EleutherAI/pythia-160m |
| Semilla de pesos | 17 (pesos aleatorios) |
| Dtype de guardado | float16 |
| Descargas | 2.522 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura es `GPTNeoXForCausalLM`, un transformer decoder-only causal con atención multi-cabeza estándar, la misma familia que el modelo base `EleutherAI/pythia-160m`. La diferencia clave es que la configuración se ha reducido mediante la regla genérica implementada en `sweep.py` del repositorio `transformers-mic`, fijando `num_hidden_layers` a 2. Los nombres de tensores coinciden exactamente con los del checkpoint real, de modo que el fixture es intercambiable a nivel de carga.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron con una comprobación de sensibilidad a entradas (*input-sensitivity gate*): cada perturbación de las entradas del contrato desplazó los logits al menos 0,001 (el caso más débil, `attention_mask:all_ones`, produjo 0,202). Los ficheros de procesador (`special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`) se copiaron byte a byte desde el modelo base. Los pesos son finitos en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El build está registrado en `build.json` con fuentes fijadas, resultados del gate y hashes de ficheros.

## Capacidades

- No es un modelo funcional: no genera texto coherente, no razona, no escribe código ni resuelve matemáticas.
- Sirve como fixture de integración para validar la carga de `GPTNeoXForCausalLM` en Transformers.
- Permite verificar el pipeline completo de tokenización (tokenizador copiado del modelo base) y forward pass.
- Compatible con pruebas de contrato: el manifiesto `integration.json` define entradas y salidas esperadas.
- Los pesos son finitos en float32, bfloat16 y float16, lo que permite probar rutas de precisión mixta.
- No soporta tool calling, agentes, visión, audio ni modo thinking.
- Multilingüismo: no aplica (no hay capacidades lingüísticas reales).

## Casos de uso

- Pruebas de integración de Transformers: cargar el fixture con `AutoModelForCausalLM` y verificar que la configuración reducida (2 capas) se instancia correctamente sin descargar el modelo completo.
- Validación de pipelines de CI/CD: usar el fixture en tests automatizados que comprueben que un cambio en el código de carga de modelos no rompe la compatibilidad con `GPTNeoXForCausalLM`.
- Verificación de contratos de framework: ejecutar las expectativas documentadas en `integrations/transformers/expectations` para asegurar que las entradas y salidas cumplen el contrato definido en `integration.json`.
- Pruebas de tokenización: al conservar los ficheros de procesador byte a byte del modelo base, permite validar rutas de tokenización sin los pesos reales.
- Pruebas de precisión mixta: al ser finito en float32, bfloat16 y float16, sirve para verificar rutas de conversión de dtype en forward, loss y gradientes.
- Reproducibilidad de fixtures: el `build.json` con hashes y fuentes fijadas permite reconstruir el artefacto con `python example/build_fixtures.py --fixture pythia-160m-mic`.
- Desarrollo de herramientas de inspección de modelos: un checkpoint pequeño con nombres de tensores reales facilita depurar utilidades que analizan arquitecturas sin coste de descarga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier métrica de calidad sería irrelevante.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float16 (6,5M parámetros); cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no aplica; cualquier GPU o CPU es suficiente para cargar el fixture.
- Cabe en consumer GPU: sí, en cualquier modelo (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: Transformers (vía `AutoModelForCausalLM`); no se documentan otras rutas (vLLM, llama.cpp, Ollama, TGI) para este artefacto.
- Latencia y throughput: no disponibles; al ser un fixture de pruebas no se caracteriza rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pythia-160m-mic | 6.505.984 | no disponible | Fixture de pruebas | no disponible | Hugging Face |
| EleutherAI/pythia-160m | ~160M | no disponible | Modelo base entrenado | no disponible | Hugging Face |
| Otros fixtures de `huggingface-mic` | variable (reducidos) | no disponible | Fixtures de pruebas | no disponible | Hugging Face |

La comparación con modelos de la misma categoría (modelos funcionales de ~160M) no es significativa: `pythia-160m-mic` no es un modelo utilizable, sino un artefacto de ingeniería. Frente al modelo base, la diferencia principal es el número de capas (2 frente a la configuración completa) y la ausencia de entrenamiento.

## Limitaciones y advertencias

- No es un modelo funcional: los pesos son aleatorios y no producen texto coherente. No debe usarse para inferencia real.
- Etiquetado como `test-artifact` para excluirlo de búsquedas de modelos candidatos; usarlo fuera de contextos de prueba es un error de uso.
- Licencia no disponible: no se puede asumir ningún permiso de uso comercial.
- No se documentan idiomas soportados ni longitud de contexto; no aplica al no ser un modelo entrenado.
- Riesgo de confusión: el nombre y la estructura imitan a `EleutherAI/pythia-160m`, pero el comportamiento es completamente distinto.
- Los pesos solo son válidos para la arquitectura `GPTNeoXForCausalLM` con la configuración reducida; no son intercambiables con el checkpoint completo a nivel de comportamiento.
- Aunque los tensores son finitos en float32, bfloat16 y float16, no se garantiza estabilidad numérica en entrenamiento real (no hay entrenamiento).

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/pythia-160m-mic
- Modelo base: https://huggingface.co/EleutherAI/pythia-160m
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de reducción (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción de fixtures (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Documentación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/pythia-160m-mic.html
- Manifiesto de contrato (`integration.json`): https://huggingface.co/huggingface-mic/pythia-160m-mic/blob/main/integration.json
- Uso con Transformers (`usage.md`): https://huggingface.co/huggingface-mic/pythia-160m-mic/blob/main/integrations/transformers/usage.md
- Procedencia del fixture (`build.json`): https://huggingface.co/huggingface-mic/pythia-160m-mic/blob/main/build.json
