# huggingface-mic/Nemotron-3-Embed-1B-BF16-mic

## Resumen

Nemotron-3-Embed-1B-BF16-mic es un artefacto de prueba publicado por el usuario huggingface-mic dentro del proyecto transformers-mic. No es un modelo entrenado ni utilizable: se trata de un fixture (modelo reducido artificialmente) que reproduce la arquitectura Ministral3Model del checkpoint original nvidia/Nemotron-3-Embed-1B-BF16 con solo 2 capas ocultas y pesos aleatorios (semilla 17), conservando los nombres de tensores y los ficheros de procesador del modelo real.

Su proposito es servir como banco de pruebas para validar contratos de integracion (manifiesto integration.json, expectativas de Transformers, uso ejecutable) sin necesidad de descargar el checkpoint completo de 1B parametros. El repositorio incluye los pesos reducidos, documentacion de uso y los ficheros de tokenizer y configuracion copiados byte a byte del modelo base.

Es relevante unicamente para desarrolladores que trabajen en el pipeline de fixtures de transformers-mic o que necesiten verificar compatibilidad de frameworks con la arquitectura Nemotron-3-Embed. Esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos. El modelo base real es un modelo de embeddings de texto de NVIDIA, pero este artefacto no hereda sus capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ministral3Model (variante reducida, num_hidden_layers=2) |
| Parametros totales | 8.462.656 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura Ministral3Model del checkpoint nvidia/Nemotron-3-Embed-1B-BF16, pero con la configuracion reducida mediante la regla generica de sweep.py (num_hidden_layers reducido a 2). Mantiene exactamente los mismos nombres de tensores que el checkpoint real y conserva los ficheros de procesador copiados byte a byte: CONTRIBUTING.md, LICENSE, NOTICE, THIRD_PARTY_NOTICES.md, config_sentence_transformers.json, modules.json, sentence_bert_config.json, tokenizer.json y tokenizer_config.json.

No ha habido entrenamiento. Los pesos son aleatorios (semilla 17) y unicamente pasaron la puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movio los logits al menos 0.001 (el caso mas debil, `attention_mask:all_ones`, dio 1.24), por lo que no se considero necesario entrenar. Los pesos se guardan en bfloat16, el dtype con el que carga por defecto el checkpoint real. El fixture es finito en float32, bfloat16 y float16 (forward, loss y gradientes). La clave de fixture es `3b9dc5f17e4c` y cubre todos los checkpoints con ficheros de procesador identicos y config coincidente tras el shrink.

## Capacidades

- No es un modelo funcional: no genera texto, no produce embeddings utiles ni razona.
- Sirve como fixture de pruebas para validar contratos de integracion con Transformers.
- Reproduce la interfaz de entrada/salida del modelo base (nombres de tensores, tokenizer, configuracion de Sentence Transformers).
- Permite verificar sensibilidad a entradas del contrato (perturbaciones sobre logits).
- Compatible con ejecucion en float32, bfloat16 y float16 para forward, loss y gradientes.
- No dispone de tool calling, agentes, vision, audio ni capacidades multilingues reales.

## Casos de uso

- Validacion de integracion con Transformers: ejecutar el fixture para comprobar que el pipeline de carga, tokenizacion y forward funciona con la configuracion de Nemotron-3-Embed sin descargar el checkpoint de 1B.
- Pruebas de CI/CD en transformers-mic: usar el fixture en tests automatizados del repositorio para verificar que los contratos (integration.json, expectations) se cumplen tras cambios en el codigo.
- Desarrollo de harnesses de evaluacion: probar herramientas de evaluacion de embeddings contra un modelo de la misma arquitectura y nombres de tensores, con coste computacional minimo.
- Depuracion de compatibilidad de dtypes: verificar comportamiento finito en float32, bfloat16 y float16 en forward, loss y gradientes.
- Reconstruccion reproducible de fixtures: servir como referencia para regenerar el artefacto con `python example/build_fixtures.py --fixture Nemotron-3-Embed-1B-BF16-mic`.
- Verificacion de puertas de sensibilidad: comprobar que las perturbaciones de entrada mueven los logits por encima del umbral definido (0.001).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB (8,46M parametros en bfloat16, aproximadamente 17 MB de pesos, mas overhead de activaciones y tokenizer).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: Transformers (uso documentado en integrations/transformers/usage.md); no se documentan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3-Embed-1B-BF16-mic (este) | 8,46M | no disponible | Fixture de pruebas | no disponible | Hugging Face |
| nvidia/Nemotron-3-Embed-1B-BF16 | ~1B (segun nombre) | no disponible | Embeddings de texto | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | variable (reducidos) | no disponible | Pruebas de contrato | no disponible | Hugging Face (huggingface-mic) |

No se dispone de datos de rendimiento para comparar; el artefacto no es funcionalmente comparable con modelos de embeddings reales.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y no producen embeddings significativos.
- Etiquetado como `test-artifact`; no debe usarse en produccion ni como modelo candidato.
- No se dispone de informacion sobre licencia, idiomas ni contexto; el uso comercial no esta verificado.
- Hereda los ficheros de licencia del modelo base copiados byte a byte, pero la licencia del artefacto no se declara explicitamente.
- Riesgo de confusion: el nombre incluye "Nemotron-3-Embed-1B" pese a tener solo 8,46M parametros.
- No apto para evaluaciones de calidad, sesgos o alucinacion, al carecer de entrenamiento.
- Cualquier metrica obtenida con este fixture no es extrapolable al modelo base real.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/Nemotron-3-Embed-1B-BF16-mic
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Embed-1B-BF16
- Como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Nemotron-3-Embed-1B-BF16-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script sweep.py: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script build_fixtures.py: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Manifiesto de contrato: integration.json (en el repositorio)
- Uso con Transformers: integrations/transformers/usage.md (en el repositorio)
- Expectativas de Transformers: integrations/transformers/expectations (en el repositorio)
- Procedencia del fixture: build.json (en el repositorio)
