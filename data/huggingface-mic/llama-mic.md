# huggingface-mic/llama-mic

## Resumen

`llama-mic` es un artefacto de prueba (test artifact) publicado por la organización `huggingface-mic` en Hugging Face. No se trata de un modelo entrenado ni utilizable para inferencia real, sino de un *fixture* de 3.219.776 parámetros construido a partir de la arquitectura de `HuggingFaceTB/SmolLM2-135M` (un transformer tipo Llama) mediante un proceso de reducción de configuración. Su propósito es validar el contrato de integración de la arquitectura Llama en Transformers, incluyendo la carga del modelo, la tokenización y el comportamiento del forward pass bajo distintas precisiones.

El fixture conserva los nombres de tensores del checkpoint original y copia byte a byte los ficheros del procesador (tokenizer, merges, vocabulario, configuración de generación) del modelo base. Los pesos, sin embargo, son aleatorios (semilla 17) y se guardaron en bfloat16. La reducción se aplicó únicamente sobre el número de capas ocultas, fijado en 2, manteniendo la misma arquitectura `LlamaForCausalLM`. Esto permite reproducir la estructura del modelo real con un coste computacional mínimo.

La relevancia de este repositorio es puramente técnica y de infraestructura: sirve como evidencia reproducible para el desarrollo de `transformers-mic`, un conjunto de herramientas de validación de integraciones de modelos. Está etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos. Cualquier uso como modelo de lenguaje en producción sería un error de interpretación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only) |
| Parametros totales | 3.219.776 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | HuggingFaceTB/SmolLM2-135M |
| Numero de capas ocultas | 2 |
| Precisión de guardado | bfloat16 |
| Semilla de pesos aleatorios | 17 |
| Clave de fixture | 449c36ea4c20 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la misma estructura que `LlamaForCausalLM`, pero con la configuración reducida a 2 capas ocultas mediante la regla genérica implementada en `sweep.py`. Los ficheros del procesador (`generation_config.json`, `merges.txt`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copiaron byte a byte desde `HuggingFaceTB/SmolLM2-135M`, de modo que la tokenización es idéntica a la del modelo base.

No hubo entrenamiento. Los pesos se generaron aleatoriamente con semilla 17 y se validaron mediante una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato movía los logits al menos 0.001 (la más débil, `input_ids:reverse`, produjo 2.12). El modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La validación se realizó en una NVIDIA A10G con variantes por defecto, eager y bfloat16, con registro de línea base en proceso fresco.

## Capacidades

- No es un modelo de lenguaje funcional: los pesos son aleatorios y no producen texto coherente.
- Sirve como fixture de validación para la integración de la arquitectura Llama en Transformers.
- Permite verificar la carga de safetensors con nombres de tensores idénticos al checkpoint real.
- Valida el pipeline de tokenización heredado de SmolLM2-135M.
- Comprueba la estabilidad numérica en float32, bfloat16 y float16 (forward, loss, gradientes).
- No dispone de tool calling, agentes, visión, audio ni modos de razonamiento.
- No tiene capacidades multilingües reales más allá del tokenizador heredado.

## Casos de uso

- Validación de integraciones en Transformers: se usa para comprobar que una nueva versión o parche de la librería carga correctamente un `LlamaForCausalLM` con los nombres de tensores esperados, sin incurrir en el coste de un checkpoint completo.
- Pruebas de regresión en CI: el fixture permite ejecutar tests de forward pass, pérdida y gradientes en segundos, integrándose en pipelines de integración continua del repositorio `transformers-mic`.
- Verificación de precisión numérica: sirve para comprobar que el modelo produce resultados finitos en float32, bfloat16 y float16, detectando regresiones en kernels o en la lógica de casting.
- Desarrollo de herramientas de tokenización: al copiar byte a byte los ficheros del procesador de SmolLM2-135M, permite probar pipelines de tokenización sin descargar el modelo completo.
- Reproducción de contratos de integración: el manifiesto `integration.json` y `build.json` documentan fuentes fijadas, resultados de puertas y hashes de ficheros, lo que facilita auditorías reproducibles.
- Docencia y demostración de fixtures: ejemplifica cómo reducir un checkpoint real manteniendo la estructura de tensores, útil en formación sobre ingeniería de modelos y testing.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que los benchmarks de calidad no serían significativos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precisión (3,2 M de parámetros).
- GPU recomendadas: cualquier GPU moderna; la validación se realizó en una NVIDIA A10G.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU con suficiente memoria compartida.
- Opciones de despliegue: Transformers (validado), potencialmente llama.cpp u Ollama si se convierte a GGUF, aunque no es un caso de uso previsto.
- Latencia y throughput: no disponibles; al ser un fixture, no se han publicado mediciones de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llama-mic | 3,2 M | no disponible | Fixture de validacion | no disponible | Hugging Face |
| SmolLM2-135M | 135 M | no disponible | Modelo de lenguaje pequeno | no disponible | Hugging Face |
| Modelos de prueba de Transformers (p. ej. tiny-random-Llama) | variable | no disponible | Fixtures de CI | no disponible | Hugging Face |

La comparación directa con modelos de lenguaje no es aplicable: `llama-mic` no compite en calidad de generación, sino que se posiciona como artefacto de infraestructura frente a otros fixtures de prueba utilizados en el ecosistema de Transformers.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no genera texto coherente ni responde a instrucciones.
- No debe usarse en producción, investigación de NLP ni evaluación de capacidades.
- La licencia no está disponible, lo que impide determinar condiciones de uso comercial.
- La longitud de contexto no está documentada.
- Los idiomas soportados no están documentados; el tokenizador heredado de SmolLM2-135M cubre varios idiomas, pero el modelo no los procesa de forma significativa.
- Está etiquetado como `test-artifact` para excluirlo de búsquedas de modelos candidatos; ignorar esta etiqueta llevaría a conclusiones erróneas.
- El repositorio solo incluye los pesos reducidos, el uso y las expectativas del framework; otros ficheros deben regenerarse con `python example/build_fixtures.py --fixture mic-llama-slim`.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/huggingface-mic/llama-mic)
- [Modelo base SmolLM2-135M](https://huggingface.co/HuggingFaceTB/SmolLM2-135M)
- [Manifiesto de contrato (integration.json)](https://huggingface.co/huggingface-mic/llama-mic/blob/main/integration.json)
- [Uso con Transformers](https://huggingface.co/huggingface-mic/llama-mic/blob/main/integrations/transformers/usage.md)
- [Expectativas de Transformers](https://huggingface.co/huggingface-mic/llama-mic/tree/main/integrations/transformers/expectations)
- [Procedencia del fixture (build.json)](https://huggingface.co/huggingface-mic/llama-mic/blob/main/build.json)
- [Como se redujo el fixture](https://huggingface-mic-mic-coverage.static.hf.space/shrink/llama-mic.html)
- [Evidencia de regeneracion (GitHub Actions)](https://github.com/huggingface/transformers-mic/actions/runs/38252430459)
- [Repositorio transformers-mic](https://github.com/huggingface/transformers-mic)
- [Script sweep.py](https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py)
- [Script build_fixtures.py](https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py)
