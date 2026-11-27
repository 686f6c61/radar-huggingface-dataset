# huggingface-mic-temp/gemma-4-E2B-it-vllm-mic

## Resumen

`gemma-4-E2B-it-vllm-mic` es un artefacto de prueba (fixture) publicado por la organización `huggingface-mic-temp`, no un modelo entrenado ni utilizable en producción. Se presenta como un derivado reducido de `google/gemma-4-E2B-it` con el objetivo de validar contratos de integración (procesador, tokenizador, plantilla de chat y expectativas de framework) sin necesidad de descargar ni ejecutar los pesos completos del modelo original. El propio autor lo etiqueta explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos.

Técnicamente conserva la arquitectura declarada del modelo base, `Gemma4ForConditionalGeneration` (multimodal, con torres de texto, visión y audio), pero con una configuración drásticamente reducida: 4 capas en el módulo de texto, 2 en visión y 2 en audio. El resultado son 36.012.084 parámetros totales, un tamaño de repositorio de 0,1 GB y pesos aleatorios generados con semilla 17, no entrenados. Los ficheros de procesador y tokenizador sí se copian byte a byte del checkpoint original de Google.

Su relevancia es puramente de ingeniería: sirve como fixture reproducible para probar pipelines de integración (por ejemplo, carga con vLLM o Transformers, validación de plantillas de chat y contratos de entrada/salida) en CI, sin coste computacional asociado al modelo real. No debe confundirse con un modelo funcional de Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4ForConditionalGeneration (multimodal: texto, vision y audio) |
| Parametros totales | 36.012.084 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo replica la arquitectura del checkpoint `google/gemma-4-E2B-it` con los mismos nombres de tensores, pero con una configuración reducida mediante la regla genérica implementada en `sweep.py` del repositorio `transformers-mic`: 4 capas ocultas en el módulo de texto, 2 en visión y 2 en audio. Los ficheros de procesador (`chat_template.jinja`, `generation_config.json`, `processor_config.json`, `tokenizer.json`, `tokenizer_config.json`) se copian byte a byte del modelo base, de modo que el contrato de tokenización y plantilla de chat es idéntico al original.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y únicamente pasaron una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato desplaza los logits al menos 0,001 (el caso más débil, `input_ids:roll_batch`, con 0,865). El modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El repositorio incluye un manifiesto de contrato (`integration.json`), documentación de uso para Transformers, expectativas de framework y procedencia de la fixture (`build.json`).

## Capacidades

- No dispone de capacidades funcionales reales: los pesos son aleatorios y no han sido entrenados.
- Reproduce el contrato de entrada/salida del modelo base (tokenizador, plantilla de chat y configuración de generación).
- Sirve para validar la carga del modelo con frameworks compatibles con `Gemma4ForConditionalGeneration`.
- Permite probar rutas de integración multimodal (texto, visión y audio) a nivel estructural, sin inferencia significativa.
- No soporta tool calling, agentes ni razonamiento de forma útil, al carecer de pesos entrenados.
- No hay capacidades multilingües verificables más allá de las que herede el tokenizador copiado del modelo base.

## Casos de uso

- Pruebas de integración en CI: cargar el fixture en pipelines de integración continua para verificar que el contrato de tokenizador y plantilla de chat se mantiene estable, sin descargar los pesos completos de Gemma 4.
- Validación de frameworks: comprobar que una versión nueva de Transformers o vLLM carga correctamente la arquitectura `Gemma4ForConditionalGeneration` con los mismos nombres de tensores que el checkpoint real.
- Desarrollo de plantillas de chat: iterar sobre `chat_template.jinja` y `generation_config.json` con un modelo ligero que reproduce exactamente los ficheros del original.
- Pruebas de serialización y dtype: verificar rutas de conversión a float32, bfloat16 y float16, así como la finitud de gradientes en entrenamiento simulado.
- Regresión de contratos de API: usar `integration.json` y el directorio de expectativas para detectar cambios incompatibles en la interfaz del modelo.
- Reproducibilidad de fixtures: reconstruir el artefacto con `build_fixtures.py` y comparar hashes de ficheros registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier métrica de calidad no tendría significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 para los 36 millones de parámetros del fixture.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: Transformers y vLLM según el contrato declarado; llama.cpp u Ollama no están documentados para este artefacto.
- Latencia y throughput: no disponibles; al ser pesos aleatorios y una configuración reducida, las cifras no serían representativas del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| gemma-4-E2B-it-vllm-mic (este) | 36.012.084 | no disponible | no disponible | Fixture de integracion |
| google/gemma-4-E2B-it | no disponible en la informacion | no disponible | no disponible | Modelo multimodal real |
| Otras fixtures de transformers-mic | no disponible | no disponible | no disponible | Pruebas de contrato |

No se dispone de datos suficientes para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas carecen de valor semántico.
- Etiquetado como `test-artifact`; no debe emplearse en producción ni en evaluaciones de calidad.
- La licencia no está declarada en la información disponible, lo que impide confirmar condiciones de uso comercial.
- No se han documentado sesgos, pero tampoco se ha realizado ninguna evaluación al respecto.
- Riesgo alto de alucinación y salidas incoherentes por construcción.
- El tamaño reducido no refleja el comportamiento del modelo base `google/gemma-4-E2B-it`.
- La información sobre idiomas y contexto no está disponible en la ficha del autor.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic-temp/gemma-4-E2B-it-vllm-mic
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Como se redujo la fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/gemma-4-E2B-it-vllm-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de barrido: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
