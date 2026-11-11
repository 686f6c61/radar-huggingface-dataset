# huggingface-mic/paligemma-3b-pt-224-mic

## Resumen

`huggingface-mic/paligemma-3b-pt-224-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic`, no un modelo usable. Se construyo a partir de `leo009/paligemma-3b-pt-224`, una variante de PaliGemma de 3B parametros, mediante un proceso de reduccion ("shrink") que conserva la arquitectura `PaliGemmaForConditionalGeneration` pero con una configuracion mucho mas pequena: 2 capas en el codificador visual y 2 capas en el decodificador de texto.

El resultado son 16.657.088 parametros reales (frente a los ~3B del modelo base), con pesos aleatorios generados con semilla 17 y guardados en float32. El proposito declarado por el autor es servir como fixture de integracion para validar contratos de uso y expectativas de frameworks (concretamente Transformers), no para inferencia real. Esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

Su relevancia es por tanto de infraestructura de testing: permite a los mantenedores de frameworks verificar que el pipeline de carga, tokenizacion, preprocesado de vision y forward pass funciona con la firma de PaliGemma sin necesidad de descargar ni ejecutar los ~3B parametros reales. Para desarrolladores e investigadores que busquen un modelo vision-lenguaje funcional, este repositorio no es adecuado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PaliGemmaForConditionalGeneration (transformer vision-lenguaje, sig Sauer) |
| Parametros totales | 16.657.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura PaliGemma, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje autorregresivo. En este fixture la configuracion se ha reducido a 2 capas en el codificador visual y 2 capas en el decodificador de texto, manteniendo los mismos nombres de tensores que el checkpoint real. Los ficheros del procesador (`tokenizer.json`, `tokenizer.model`, `preprocessor_config.json`, `special_tokens_map.json`, `generation_config.json`, `added_tokens.json`, `tokenizer_config.json`) se copiaron byte a byte desde `leo009/paligemma-3b-pt-224`.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron con una "input-sensitivity gate": cada perturbacion de las entradas del contrato movia los logits al menos 0.001 (la mas debil, `token_type_ids:all_ones`, produjo 0.0225). El fixture es finito en float32, bfloat16 y float16 para forward, loss y gradientes. La clave de fixture es `dce4ad09e24d` y cubre cualquier checkpoint cuyos ficheros de procesador sean identicos byte a byte y cuya config coincida tras el shrink. El script de construccion es `example/build_fixtures.py` del repositorio `huggingface/transformers-mic`, y `build.json` registra fuentes fijadas, resultados de la gate y hashes de ficheros.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen salidas coherentes.
- Conserva la firma de entrada de PaliGemma (imagen + texto) y los nombres de tensores del checkpoint real.
- Sirve para validar carga de safetensors, tokenizador, procesador de imagen y forward pass en Transformers.
- Soporta ejecucion en float32, bfloat16 y float16 sin valores no finitos.
- No dispone de tool calling, agentes, razonamiento multietapa ni capacidades multilingues reales.
- No tiene modo thinking, vision util ni audio.

## Casos de uso

- Test de integracion en Transformers: cargar el fixture y verificar que `PaliGemmaForConditionalGeneration` acepta las entradas del contrato sin descargar los ~3B parametros reales.
- Validacion de CI/CD de frameworks: ejecutar la suite de pruebas de un pipeline vision-lenguaje contra un checkpoint de 16.7M parametros que cabe en 0.2 GB.
- Verificacion de contratos de procesador: comprobar que los ficheros de tokenizacion y preprocesado copiados byte a byte se cargan correctamente.
- Pruebas de dtype: validar que el forward, la loss y los gradientes son finitos en float32, bfloat16 y float16.
- Desarrollo de herramientas de shrink: usar `build.json` y el script `build_fixtures.py` como referencia para reducir otros checkpoints.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture paligemma-3b-pt-224-mic` y comparar hashes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K, etc.) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (16.7M parametros, ~67 MB de pesos) mas overhead del runtime.
- GPU recomendadas: cualquier GPU consumer moderna; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: Transformers (carga directa), potencialmente vLLM o llama.cpp si soportan la arquitectura PaliGemma reducida, aunque no esta verificado en la informacion disponible.
- Latencia y throughput: no disponibles; al ser un fixture no se han medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/paligemma-3b-pt-224-mic` | 16.657.088 | no disponible | Fixture de test | no disponible | Hugging Face |
| `leo009/paligemma-3b-pt-224` (base) | ~3B (no confirmado) | no disponible | Modelo vision-lenguaje | no disponible | Hugging Face |
| PaliGemma 3B pt 224 original (Google) | ~3B | no disponible en esta ficha | Modelo vision-lenguaje | Gemma license (segun fuente original, no verificada aqui) | Hugging Face / Kaggle |

La comparativa es limitada porque el fixture no comparte proposito con los modelos reales. No se dispone de datos de rendimiento para ninguno de los tres en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y las salidas no tienen significado.
- Etiquetado como `test-artifact`; no debe incluirse en busquedas de modelos candidatos ni en produccion.
- La licencia no esta declarada en la informacion disponible; verificar antes de cualquier uso, incluso de test.
- El modelo base declarado (`leo009/paligemma-3b-pt-224`) es a su vez una variante de terceros; la cadena de licencias no esta verificada.
- El contexto, los idiomas y las capacidades reales del modelo base no se detallan en esta ficha.
- Riesgo de confusion: el nombre incluye "3b" pero el artefacto tiene 16.7M parametros.
- No apto para benchmarks de calidad ni para evaluacion de capacidades.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/paligemma-3b-pt-224-mic
- Modelo base: https://huggingface.co/leo009/paligemma-3b-pt-224
- Manifest de contrato: `integration.json` (en el repo)
- Uso en Transformers: `integrations/transformers/usage.md` (en el repo)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repo)
- Procedencia del fixture: `build.json` (en el repo)
- Explicacion del shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/paligemma-3b-pt-224-mic.html
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Script de shrink: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
