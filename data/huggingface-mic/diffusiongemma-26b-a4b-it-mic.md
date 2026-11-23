# huggingface-mic/diffusiongemma-26B-A4B-it-mic

## Resumen

`diffusiongemma-26B-A4B-it-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic` en Hugging Face. No es un modelo entrenado ni utilizable para inferencia real: se trata de una version "adelgazada" del checkpoint `google/diffusiongemma-26B-A4B-it`, con la misma arquitectura y los mismos nombres de tensores, pero con solo 18,7 millones de parametros y pesos aleatorios generados con semilla 17. Su proposito es servir como fixture de integracion para validar el soporte de la arquitectura `DiffusionGemmaForBlockDiffusion` en el ecosistema de Transformers y en herramientas de cobertura de integracion.

El modelo base que replica, `google/diffusiongemma-26B-A4B-it`, es presumiblemente un modelo de difusion de bloques (block diffusion) de tipo Gemma con 26B de parametros totales y 4B activos (por la nomenclatura A4B, propia de arquitecturas MoE). Sin embargo, la informacion disponible sobre el modelo base es muy limitada: la model card del fixture no documenta sus capacidades, entrenamiento ni benchmarks, solo su estructura tecnica y el proceso de reduccion.

La relevancia de este repositorio es puramente de ingenieria: permite a desarrolladores de frameworks (Transformers, vLLM, etc.) probar la carga, el forward pass, la perdida y los gradientes de la arquitectura DiffusionGemma sin necesidad de descargar ni ejecutar el checkpoint real de 26B. Esta etiquetado como `test-artifact` precisamente para excluirlo de busquedas de modelos candidatos a uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiffusionGemmaForBlockDiffusion (difusion de bloques sobre base Gemma) |
| Parametros totales | 18.726.348 (fixture); el modelo base declara 26B en el nombre |
| Parametros activos | no disponible (el nombre del base sugiere 4B activos, no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura `DiffusionGemmaForBlockDiffusion`, una variante de difusion por bloques aplicada sobre un transformer tipo Gemma. La reduccion se realizo con la regla generica de `sweep.py`: se fijaron 2 capas ocultas en el modulo de texto y 2 capas ocultas en el modulo de vision. Los ficheros de procesador (`chat_template.jinja`, `generation_config.json`, `model_index.json`, `processor_config.json`, `tokenizer.json`, `tokenizer_config.json`) se copiaron byte a byte desde `google/diffusiongemma-26B-A4B-it`, de modo que el tokenizador y la configuracion de generacion son identicos a los del modelo real.

Los pesos son aleatorios (semilla 17), no entrenados. Pasaron una puerta de sensibilidad de entrada: cada perturbacion de las entradas del contrato movia los logits al menos 0,001 (la mas debil, `input_ids:roll_batch`, con 0,776), lo que garantiza que el forward pass responde a las entradas y es valido como fixture de test. El modelo es finito en float32, bfloat16 y float16 (forward, perdida y gradientes). No hay informacion disponible sobre el entrenamiento del modelo base (tokens, composicion del dataset, RLHF/DPO).

## Capacidades

- No es un modelo funcional: no genera texto, codigo ni razonamiento util.
- Sirve como fixture de integracion para validar la carga de la arquitectura DiffusionGemma en Transformers.
- Permite comprobar que los nombres de tensores coinciden con el checkpoint real de 26B.
- Valida el forward pass, la perdida y los gradientes en float32, bfloat16 y float16.
- Incluye el tokenizador y el chat template reales del modelo base, por lo que permite probar pipelines de tokenizacion.
- Soporta el flujo de vision del modelo base a nivel estructural (2 capas de vision en el fixture).
- No dispone de tool calling, agentes, modo thinking ni capacidades multilingues verificables.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture con `AutoModel` y verificar que la arquitectura `DiffusionGemmaForBlockDiffusion` se instancia correctamente sin descargar el checkpoint de 26B.
- Desarrollo de kernels y operadores: validar implementaciones de atencion y difusion por bloques contra un modelo pequeno y rapido de ejecutar.
- CI/CD de frameworks: incluir el fixture en la suite de tests de integracion continua para detectar regresiones en la carga de checkpoints DiffusionGemma.
- Validacion de tokenizadores: usar los ficheros de procesador copiados byte a byte para probar pipelines de tokenizacion identicos a los del modelo real.
- Comprobacion de compatibilidad de pesos: verificar que los nombres de tensores del fixture coinciden con los del checkpoint real antes de migrar codigo.
- Pruebas de precision numerica: comprobar que forward, perdida y gradientes son finitos en float32, bfloat16 y float16 en distintas plataformas.
- Desarrollo de herramientas de cobertura (MIC): el repositorio sirve como ejemplo de fixture generado por `build_fixtures.py` para medir cobertura de integracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad seria irrelevante.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en bfloat16 (18,7M de parametros, repo de 0,1 GB).
- Cabe en cualquier GPU consumer, incluida una GTX 1650 o una iGPU con suficiente memoria compartida.
- Tambien puede ejecutarse en CPU sin problema.
- GPU recomendadas: ninguna en particular; cualquier GPU con soporte bfloat16 o float16 es suficiente.
- Opciones de despliegue: Transformers (carga directa), y potencialmente llama.cpp u Ollama si se convierte a GGUF, aunque no es el proposito del artefacto.
- Latencia y throughput: no disponibles; al ser un fixture de test, no se han medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diffusiongemma-26B-A4B-it-mic (este) | 18,7M (fixture) | no disponible | Fixture de test | no disponible | Hugging Face |
| google/diffusiongemma-26B-A4B-it | 26B (4B activos segun nombre) | no disponible | Modelo real de difusion | no disponible | Hugging Face |
| Otros fixtures de huggingface-mic | variable (reducidos) | no disponible | Fixtures de integracion | no disponible | Hugging Face |

No se dispone de informacion suficiente para comparar con alternativas de la misma categoria mas alla del propio modelo base y otros fixtures de la misma organizacion.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y no producen salidas coherentes.
- Etiquetado como `test-artifact`: no debe usarse en produccion ni incluirse en busquedas de modelos candidatos.
- La licencia no esta declarada; no se puede asumir uso comercial.
- No hay informacion sobre sesgos, alucinacion ni limitaciones de idioma del modelo base.
- El modelo base `google/diffusiongemma-26B-A4B-it` no esta documentado en la informacion disponible: se desconoce su contexto, cuantizaciones e idiomas.
- El fixture solo cubre 2 capas de texto y 2 de vision; no reproduce el comportamiento numerico del checkpoint real.
- No debe confundirse con el modelo de 26B: el tamano real del fixture es de 18,7M de parametros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/diffusiongemma-26B-A4B-it-mic
- Modelo base: https://huggingface.co/google/diffusiongemma-26B-A4B-it
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/diffusiongemma-26B-A4B-it-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/diffusiongemma-26B-A4B-it-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/diffusiongemma-26B-A4B-it-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/diffusiongemma-26B-A4B-it-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/diffusiongemma-26B-A4B-it-mic.html
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
