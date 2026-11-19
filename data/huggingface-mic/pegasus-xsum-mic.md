# huggingface-mic/pegasus-xsum-mic

## Resumen

`huggingface-mic/pegasus-xsum-mic` es un artefacto de prueba (fixture) publicado por la organización `huggingface-mic` dentro del proyecto Transformers MIC. No es un modelo entrenado ni utilizable para resumir texto: es una versión reducida ("slim") con pesos aleatorios que reproduce la arquitectura y el contrato de inferencia de `google/pegasus-xsum`, el conocido modelo PEGASUS de Google especializado en resumen abstractivo del dataset XSum.

El fixture mantiene la clase `PegasusForConditionalGeneration` pero con una configuración reducida (2 capas de encoder y 2 de decoder), lo que da un total de 6.414.375 parámetros. Los ficheros de procesador (tokenizador SentencePiece, `generation_config.json`, `special_tokens_map.json` y `tokenizer_config.json`) se copian byte a byte del checkpoint original, de modo que el pipeline de tokenización es idéntico al real. Los pesos se inicializan de forma aleatoria con semilla 17 y se guardan en float32.

Su relevancia es de infraestructura: sirve para validar que frameworks y pipelines (en este caso, Transformers) cargan, ejecutan y respetan las expectativas de un modelo PEGASUS sin necesidad de descargar los aproximadamente 568 millones de parámetros del checkpoint original. La etiqueta `test-artifact` lo excluye explícitamente de las búsquedas de modelos candidatos para uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (PegasusForConditionalGeneration) |
| Parametros totales | 6.414.375 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de la config de PEGASUS; no declarada en la informacion) |
| Tipos de cuantizacion | no disponible (pesos en float32; validado tambien en bfloat16 y float16) |
| Idiomas soportados | no disponible (el checkpoint base google/pegasus-xsum esta orientado a ingles, pero no se declara en la ficha) |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de tipo PEGASUS, la arquitectura de resumen abstractivo preentrenada con objetivo de gap-sentence generation. En este fixture, la configuración se ha reducido mediante la regla genérica de `sweep.py` del repositorio `transformers-mic`: 2 capas de encoder y 2 capas de decoder, conservando los nombres de tensores del checkpoint original. En particular, se omite `model.decoder.embed_positions.weight` y `model.encoder.embed_positions.weight`, igual que en el checkpoint real, de forma que la inicialización al cargar se comporta como con el modelo verdadero.

No ha habido entrenamiento. Los pesos son aleatorios (semilla 17) y se aceptaron porque superaron la puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato desplazó los logits al menos 0,001 (el caso más débil, `input_ids:reverse`, con 0,00311). El fixture es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El repositorio incluye además el manifiesto de contrato (`integration.json`), la guía de uso con Transformers, el directorio de expectativas del framework y la procedencia del fixture (`build.json`).

## Capacidades

- Carga y ejecución mediante `PegasusForConditionalGeneration` de Transformers con los mismos nombres de tensores que el checkpoint real.
- Tokenización idéntica a `google/pegasus-xsum` gracias a la copia byte a byte de `spiece.model`, `tokenizer.json` y ficheros asociados.
- Ejecución de forward, cálculo de loss y retropropagación en float32, bfloat16 y float16.
- Validación de contratos de integración: manifiesto `integration.json` y directorio de expectativas del framework.
- No soporta generación de texto útil: los pesos son aleatorios y la salida no tiene significado.
- No dispone de tool calling, capacidades de agente, visión ni audio.
- No es multilingüe en la práctica: es un artefacto de prueba sin calidad lingüística.

## Casos de uso

- Pruebas de integración en CI/CD: validar que una versión nueva de Transformers carga un checkpoint PEGASUS, ejecuta el forward y respeta los nombres de tensores esperados sin descargar el modelo completo de 568M de parámetros.
- Desarrollo de pipelines de resumen: probar el cableado de tokenizador, `generation_config` y bucle de decodificación con un fixture ligero antes de pasar al checkpoint real.
- Validación de contratos de framework: comprobar que las expectativas declaradas en `integrations/transformers/expectations` se cumplen en cada release.
- Pruebas de dtype: verificar estabilidad numérica en float32, bfloat16 y float16 (forward, loss y gradientes) en entornos con distintas GPU.
- Reproducción de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture pegasus-xsum-mic` y comparar hashes con `build.json`.
- Docencia y demos de arquitectura: inspeccionar la estructura de un encoder-decoder PEGASUS con un repositorio de 2,3 GB y pesos rápidos de cargar.
- Pruebas de regresión de tokenización: usar el tokenizador copiado del modelo original para validar cambios en el preprocesado de XSum.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier métrica de calidad (ROUGE, MMLU, etc.) carecería de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 para los 6,4M de parámetros (los pesos ocupan unos 26 MB); el grueso del repositorio de 2,3 GB corresponde a ficheros auxiliares y al propio checkpoint en disco.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe holgadamente en cualquier GPU consumer e integrada.
- Opciones de despliegue: Transformers con PyTorch (validado); no se declara soporte específico para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al ser un modelo de 2+2 capas, la latencia sería muy baja, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/pegasus-xsum-mic | 6.414.375 | no disponible | Fixture de prueba | no disponible | Hugging Face |
| google/pegasus-xsum | ~568M (no confirmado en la informacion) | no disponible | Resumen abstractivo (XSum) | no disponible | Hugging Face |
| google/pegasus-cnn_dailymail | no disponible | no disponible | Resumen abstractivo (CNN/DailyMail) | no disponible | Hugging Face |

La comparación relevante es con el checkpoint base `google/pegasus-xsum`: mismo tokenizador y misma arquitectura, pero con 2 capas por bloque en lugar de la configuración completa y pesos aleatorios en lugar de entrenados. No se dispone de datos de benchmarks para establecer comparaciones de rendimiento.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen significado. La propia model card lo etiqueta como `test-artifact`.
- No debe usarse en producción ni para generar resúmenes reales.
- Sesgos: no aplica, al no haber entrenamiento; los sesgos del checkpoint original no se heredan porque los pesos no se copian.
- Riesgo de alucinación: total, en el sentido de que cualquier texto generado es ruido sin relación con la entrada.
- Limitaciones de contexto e idioma: no declaradas; el fixture no documenta ventana de contexto ni cobertura lingüística.
- Licencia no disponible: no se especifican términos de uso comercial; hay que consultar la licencia de `google/pegasus-xsum` para el modelo base.
- El tamaño del repositorio (2,3 GB) es desproporcionado para un modelo de 6,4M de parámetros, lo que puede confundir en despliegues automatizados.
- La fecha de creación indicada (2026-10-29) es posterior a la de actualización (2026-11-12); conviene verificar metadatos antes de integrarlo en pipelines.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/pegasus-xsum-mic
- Modelo base: https://huggingface.co/google/pegasus-xsum
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/pegasus-xsum-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/pegasus-xsum-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/pegasus-xsum-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/pegasus-xsum-mic/blob/main/build.json
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/pegasus-xsum-mic.html
- Repositorio transformers-mic (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
