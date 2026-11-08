# huggingface-mic/ERNIE-4.5-21B-A3B-PT-mic

## Resumen

`huggingface-mic/ERNIE-4.5-21B-A3B-PT-mic` no es un modelo entrenado ni utilizable en produccion: es un *fixture* de test de 6,7 millones de parametros construido por el equipo de `huggingface-mic` para validar la integracion de la arquitectura `Ernie4_5_MoeForCausalLM` en el ecosistema Transformers. Deriva del checkpoint real `baidu/ERNIE-4.5-21B-A3B-PT` (ERNIE 4.5, familia MoE de Baidu con 21.000 millones de parametros totales y 3.000 millones activos), pero reduce su configuracion a 2 capas ocultas y rellena los pesos con valores aleatorios (semilla 17).

Su relevancia es puramente de ingenieria: permite ejecutar pruebas de contrato (carga, forward, backward, sensibilidad de entradas) en CPU con un repositorio de 0,0 GB y sin necesidad de descargar el checkpoint completo de 21B. Los ficheros de procesador (tokenizer, chat template, config de generacion, special tokens) se copian byte a byte del modelo original, de modo que el fixture reproduce fielmente la interfaz de tokenizacion y los nombres de tensores del checkpoint real.

Por tanto, esta ficha describe un artefacto de validacion, no un modelo de lenguaje. Cualquier evaluacion de capacidades, benchmarks o calidad de generacion debe hacerse sobre `baidu/ERNIE-4.5-21B-A3B-PT`, no sobre este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Ernie4_5_MoeForCausalLM` (transformer MoE, configuracion reducida a 2 capas ocultas) |
| Parametros totales | 6.705.732 (fixture); el modelo base declara 21B-A3B en su nombre |
| Parametros activos | no disponible (el fixture no preserva el enrutado MoE del checkpoint real) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible (los ficheros de tokenizer se copian del modelo base) |
| Licencia | no disponible (el fichero `LICENSE` se copia byte a byte de `baidu/ERNIE-4.5-21B-A3B-PT`) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture reutiliza la clase `Ernie4_5_MoeForCausalLM` de Transformers, pero con una configuracion encogida mediante la regla generica de `sweep.py` (repositorio `transformers-mic`), que reduce `num_hidden_layers` a 2. Los pesos son aleatorios (semilla 17) y no han pasado por ningun proceso de entrenamiento, RLHF ni DPO. Para que el fixture sea aceptado, sus pesos superaron una puerta de sensibilidad de entradas: cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, produce 1,06), de modo que no se requirio entrenamiento.

Los ficheros de procesador se copian byte a byte del checkpoint `baidu/ERNIE-4.5-21B-A3B-PT`: `LICENSE`, `added_tokens.json`, `chat_template.jinja`, `generation_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer.model` y `tokenizer_config.json`. Los nombres de tensores coinciden exactamente con los del checkpoint real, lo que permite validar rutas de carga sin descargar los 21B. El fixture es finito en float32, bfloat16 y float16 (forward, loss y gradientes). La clave de fixture es `945eb5579775` y cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el encogido.

## Capacidades

- No genera texto coherente: los pesos son aleatorios y el modelo no ha sido entrenado.
- Sirve como contrato ejecutable para validar la carga de `Ernie4_5_MoeForCausalLM` en Transformers.
- Permite probar el tokenizer, el chat template y los special tokens reales del modelo base (copiados sin modificacion).
- Valida la compatibilidad de nombres de tensores con el checkpoint `baidu/ERNIE-4.5-21B-A3B-PT`.
- Ejecuta forward, loss y backward en float32, bfloat16 y float16 sin valores no finitos.
- No soporta tool calling, agentes, vision, audio ni modos de razonamiento: esas capacidades, si existen, pertenecen al modelo base.
- No es adecuado para ninguna tarea de inferencia real.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture con `AutoModelForCausalLM` y verificar que la clase `Ernie4_5_MoeForCausalLM` se resuelve y ejecuta un forward sin errores en CPU.
- CI/CD de librerias: incluir el fixture en la bateria de tests de una libreria que de soporte a ERNIE 4.5, evitando descargar 21B de pesos en cada job.
- Validacion de tokenizer y chat template: comprobar que el pipeline de tokenizacion, los special tokens y la plantilla de chat producen las secuencias esperadas antes de pasar al checkpoint real.
- Verificacion de nombres de tensores: comparar el state dict del fixture con el del checkpoint real para detectar roturas en mapeos de carga o en conversiones de formato.
- Pruebas de mixed precision: ejecutar forward y backward en float32, bfloat16 y float16 para confirmar que la implementacion no produce NaN ni inf.
- Desarrollo de utilidades de conversion: probar scripts que conviertan safetensors a otros formatos o que apliquen sharding usando un repositorio de 0,0 GB.
- Reproduccion de la puerta de sensibilidad: reejecutar `build_fixtures.py` y comprobar que las perturbaciones de entradas siguen moviendo los logits por encima del umbral de 0,001.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de test con pesos aleatorios; cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido sobre este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (6,7M de parametros, aproximadamente 13 MB de pesos); el repositorio ocupa 0,0 GB.
- GPU recomendadas: ninguna en particular; el fixture esta pensado para ejecutarse en CPU.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers con `Ernie4_5_MoeForCausalLM`; no se ha validado con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al no ser un modelo funcional, las cifras de generacion no son representativas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/ERNIE-4.5-21B-A3B-PT-mic` | 6,7M (fixture) | no disponible | Fixture de test para validar la integracion de ERNIE 4.5 | no disponible | Hugging Face, 0 descargas |
| `baidu/ERNIE-4.5-21B-A3B-PT` | 21B totales / 3B activos (segun nombre) | no disponible | Modelo MoE real de Baidu, preentrenado y ajustado | no disponible | Hugging Face |
| `baidu/ERNIE-4.5-21B-A3B-Thinking` | 21B totales / 3B activos (segun nombre) | no disponible | Variante con modo de razonamiento del mismo modelo base | no disponible | Hugging Face |

La comparativa relevante es con el checkpoint original: el fixture solo comparte arquitectura, tokenizer y nombres de tensores, no pesos ni capacidades.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo produce salidas sin sentido y no debe usarse para inferencia, evaluacion ni demostraciones.
- Esta etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no es un modelo desplegable.
- La configuracion esta reducida a 2 capas ocultas, por lo que no reproduce el comportamiento numerico del checkpoint de 21B.
- No se ha publicado informacion sobre sesgos, alucinacion o limitaciones idiomaticas del modelo base en la informacion disponible.
- La licencia figura como "no disponible" en los metadatos; el fichero `LICENSE` se copia del modelo base, por lo que las condiciones de uso comercial deben consultarse en `baidu/ERNIE-4.5-21B-A3B-PT`.
- El repositorio tiene 0 descargas y 0 likes; no hay evidencia de uso en produccion.
- No debe citarse como sustituto del modelo ERNIE 4.5 en articulos, benchmarks ni comparativas de rendimiento.

## Enlaces

- Repositorio del fixture: https://huggingface.co/huggingface-mic/ERNIE-4.5-21B-A3B-PT-mic
- Modelo base: https://huggingface.co/baidu/ERNIE-4.5-21B-A3B-PT
- Variante Thinking del modelo base: https://huggingface.co/baidu/ERNIE-4.5-21B-A3B-Thinking
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de encogido `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Explicacion del proceso de encogido: https://huggingface-mic-mic-coverage.static.hf.space/shrink/ERNIE-4.5-21B-A3B-PT-mic.html
- Manifiesto del contrato (`integration.json`): https://huggingface.co/huggingface-mic/ERNIE-4.5-21B-A3B-PT-mic/blob/main/integration.json
- Uso con Transformers (`usage.md`): https://huggingface.co/huggingface-mic/ERNIE-4.5-21B-A3B-PT-mic/blob/main/integrations/transformers/usage.md
- Procedencia del fixture (`build.json`): https://huggingface.co/huggingface-mic/ERNIE-4.5-21B-A3B-PT-mic/blob/main/build.json
