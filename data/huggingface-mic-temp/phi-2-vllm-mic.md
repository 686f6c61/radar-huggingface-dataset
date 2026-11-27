# huggingface-mic-temp/phi-2-vllm-mic

## Resumen

phi-2-vllm-mic es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic-temp` en Hugging Face. No es un modelo de lenguaje utilizable: se trata de una version reducida artificialmente del modelo `microsoft/phi-2`, con solo 6,7 millones de parametros, creada para validar contratos de integracion y expectativas de frameworks (en este caso, vLLM) dentro del proyecto transformers-mic. El autor lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

La arquitectura subyacente es `PhiForCausalLM`, la misma familia que phi-2, pero con la configuracion reducida a 2 capas ocultas mediante la regla generica de `sweep.py`. Los pesos son aleatorios (semilla 17) y no han sido entrenados; pasaron unicamente una puerta de sensibilidad a la entrada que verifica que las perturbaciones en las entradas mueven los logits al menos 0,001. Los ficheros de procesador (tokenizer, merges, vocab, generation config) se copiaron byte a byte desde `microsoft/phi-2`.

Su relevancia es puramente de ingenieria de pruebas: permite ejecutar pipelines de inferencia y validacion de integraciones (vLLM, Transformers) con un coste minimo de almacenamiento y computo, manteniendo los mismos nombres de tensores y el mismo contrato de API que el checkpoint real. No debe confundirse con un modelo funcional ni usarse en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PhiForCausalLM (transformer decoder-only) |
| Parametros totales | 6.671.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (config reducida; el modelo base phi-2 soporta 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos guardados en float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una instancia de `PhiForCausalLM` con la configuracion encogida: `num_hidden_layers` reducido a 2 mediante la regla generica de `sweep.py` del repositorio transformers-mic. Conserva los mismos nombres de tensores que el checkpoint real `microsoft/phi-2`, de modo que las herramientas que cargan el modelo real pueden cargar el fixture sin cambios en el codigo. Se guarda en float16, el dtype por defecto con el que carga phi-2, y es finito en float32, bfloat16 y float16 (forward, loss y gradientes).

No hubo entrenamiento. Los pesos son aleatorios con semilla 17. El unico criterio de aceptacion fue una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato debe mover los logits al menos 0,001 (la mas debil, `attention_mask:all_ones`, produjo 0,838). Los ficheros de procesador se copiaron byte a byte desde `microsoft/phi-2`: `CODE_OF_CONDUCT.md`, `LICENSE`, `NOTICE.md`, `SECURITY.md`, `added_tokens.json`, `data_summary_card.md`, `generation_config.json`, `merges.txt`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json` y `vocab.json`.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen texto coherente.
- Sirve como fixture para validar la carga de checkpoints con la misma firma de tensores que phi-2.
- Permite probar integraciones de frameworks (vLLM, Transformers) con un coste minimo de memoria.
- Incluye un manifest de contrato (`integration.json`) y expectativas de framework en `integrations/transformers/`.
- Conserva el tokenizer y la configuracion de generacion del modelo base.
- No soporta tool calling, agentes, vision, audio ni razonamiento multietapa de forma real.
- No dispone de capacidades multilingues verificadas.

## Casos de uso

- Pruebas de integracion de vLLM: el fixture permite validar el pipeline de carga y ejecucion de un modelo `PhiForCausalLM` en vLLM sin descargar los 2,7 mil millones de parametros del modelo real.
- Validacion de contratos de framework: los ficheros `integration.json` e `integrations/transformers/expectations` permiten comprobar que una version de Transformers cumple las expectativas de carga, forward y gradientes.
- CI/CD de librerias de inferencia: al ocupar 0,0 GB, se puede incluir en pipelines de integracion continua para detectar regresiones en la carga de checkpoints safetensors.
- Pruebas de compatibilidad de tokenizer: al copiar byte a byte los ficheros de tokenizer de phi-2, sirve para verificar que el pipeline de tokenizacion funciona igual que con el modelo real.
- Desarrollo de herramientas de inspeccion de modelos: permite probar utilidades que leen config, nombres de tensores y dtypes sin consumir recursos.
- Docencia y ejemplos: util para demostrar la estructura de un checkpoint `PhiForCausalLM` en talleres o tutoriales sin necesidad de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios y no tiene rendimiento medible en tareas de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float16 (6,7 M de parametros); cabe en cualquier GPU consumer.
- GPU recomendadas: no aplica; cualquier GPU con al menos 1 GB de memoria es suficiente, e incluso CPU.
- Cabe en GPU consumer: si, en cualquier modelo (RTX 3060, RTX 4090, etc.) y tambien en CPU.
- Opciones de despliegue: vLLM (objetivo del fixture), Transformers, y en general cualquier framework que cargue safetensors con arquitectura `PhiForCausalLM`.
- Latencia y throughput: no disponibles; al ser un fixture no se han medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| phi-2-vllm-mic | 6,7 M | no disponible | no disponible | Fixture de prueba |
| microsoft/phi-2 | 2,7 B | 2048 | MIT (segun el modelo base) | Modelo de lenguaje real |
| Otros fixtures de transformers-mic | variable | no disponible | no disponible | Pruebas de integracion |

La comparativa relevante es con `microsoft/phi-2`: el fixture replica su arquitectura, tokenizer y nombres de tensores, pero con 2 capas en lugar de 32 y pesos aleatorios. No es un sustituto funcional.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no genera texto coherente ni responde a instrucciones.
- No debe usarse en produccion ni como base para fine-tuning.
- La licencia no esta declarada en la informacion disponible; el modelo base phi-2 se publica bajo MIT, pero el fixture no lo especifica.
- El contexto y los idiomas no estan documentados; la config reducida puede no reflejar el comportamiento del modelo base.
- El repositorio esta etiquetado como `test-artifact` precisamente para excluirlo de busquedas de modelos candidatos; ignorar esa etiqueta puede llevar a evaluaciones erroneas.
- No se han publicado benchmarks ni evaluaciones de calidad.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic-temp/phi-2-vllm-mic
- Modelo base: https://huggingface.co/microsoft/phi-2
- Como se encogio el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/phi-2-vllm-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de encogimiento: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
