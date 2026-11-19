# huggingface-mic/mistral-7b-instruct-v0.2-vllm-mic

## Resumen
El repositorio `huggingface-mic/mistral-7b-instruct-v0.2-vllm-mic` no es un modelo funcional, sino un artefacto de prueba (fixture) derivado de `mistralai/Mistral-7B-Instruct-v0.2`. Lo publica la organizacion `huggingface-mic` con el objetivo de validar contratos de integracion entre frameworks (Transformers, vLLM) y arquitecturas de Mistral. El peso real del repositorio es de 8.438.400 parametros, muy lejos de los ~7.200 millones del modelo base, porque se ha "encogido" la configuracion manteniendo la misma arquitectura `MistralForCausalLM`.

La model card lo etiqueta explicitamente como `test-artifact` y advierte que "no es un modelo usable". Los pesos son aleatorios (semilla 17) y no se ha realizado entrenamiento: solo se comprobo que las perturbaciones de las entradas mueven los logits por encima de un umbral (0,001; el caso mas debil, `attention_mask:all_ones`, alcanzo 0,455). Los ficheros de procesador (tokenizer, special tokens, generation config) se copian byte a byte del checkpoint original.

Su relevancia es puramente de ingenieria: sirve como fixture reproducible para CI de integraciones con vLLM y Transformers, permitiendo verificar que un pipeline carga tensores, ejecuta forward, calcula loss y gradientes con nombres de tensor identicos al checkpoint real. No debe confundirse con un modelo para produccion ni con una variante destilada de Mistral-7B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`MistralForCausalLM`) |
| Parametros totales | 8.438.400 (fixture encogido; el base tiene ~7.200 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el base Mistral-7B-Instruct-v0.2 usa 32.768 tokens) |
| Tipos de cuantizacion | no disponible; pesos guardados en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento
El fixture replica la arquitectura `MistralForCausalLM` del modelo base, pero con `num_hidden_layers = 2` en lugar de las 32 capas del checkpoint original. El encogimiento se aplica mediante la regla generica de `sweep.py` del proyecto `transformers-mic`. Los ficheros de procesador (`generation_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer.model`, `tokenizer_config.json`) se copian literalmente de `mistralai/Mistral-7B-Instruct-v0.2`, de modo que el tokenizador y los special tokens son los reales.

No hubo entrenamiento ni ajuste fino. Los pesos son aleatorios con semilla 17, y el unico filtro aplicado fue la "input-sensitivity gate": se verifica que cada perturbacion de las entradas del contrato mueve los logits al menos 0,001. Los tensores conservan exactamente los mismos nombres que el checkpoint real, y el modelo se guarda en bfloat16 (el dtype por defecto del base). Se comprobo que el forward, la loss y los gradientes son finitos en float32, bfloat16 y float16. El repositorio incluye tambien `integration.json` (manifiesto del contrato), `build.json` (procedencia y hashes) e `integrations/transformers/` con usage y expectations.

## Capacidades
- Generacion de texto: no, los pesos son aleatorios y no producen texto coherente.
- Razonamiento, codigo, matematicas: no disponible como capacidad real; el fixture no fue entrenado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (el tokenizador copiado es el de Mistral-7B-Instruct-v0.2, pero el modelo no genera lenguaje valido).
- Capacidades especiales (thinking mode, vision, audio): ninguna.
- Capacidad real del artefacto: servir como fixture de contrato para validar pipelines de carga, forward, loss y gradientes en Transformers y vLLM, con nombres de tensor y ficheros de procesador identicos al checkpoint de referencia.

## Casos de uso
- CI de integraciones con vLLM: usar el fixture para verificar que el pipeline de carga de vLLM acepta la arquitectura `MistralForCausalLM` y los tensores con los nombres del checkpoint real, sin necesidad de descargar los ~14 GB del modelo base.
- Tests de contrato en Transformers: validar que el wrapper de `AutoModelForCausalLM` carga el checkpoint, ejecuta forward y devuelve logits finitos en bfloat16, float16 y float32.
- Verificacion de gradientes: comprobar que el backward propaga gradientes finitos en las tres precisiones, util para detectar regresiones en kernels de atencion o en el autocast.
- Pruebas de tokenizacion y processing: como los ficheros de tokenizer se copian byte a byte, sirve para testear pipelines de preprocesado (special tokens, generation config) sin ambiguedad.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture mistral-7b-instruct-v0.2-vllm-mic` y comparar hashes via `build.json` para garantizar que el fixture no ha derivado.
- Validacion de contratos de framework (integration.json): usar el manifiesto para chequear que las expectativas declaradas en `integrations/transformers/expectations` se cumplen en cada release de Transformers o vLLM.
- Formacion y documentacion: ejemplo didactico de como encoger un checkpoint real preservando arquitectura, nombres de tensor y ficheros de procesador.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. Al ser un fixture con pesos aleatorios y solo 2 capas, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) seria irrelevante y no se reporta.

## Requisitos de hardware
- VRAM estimada para inferencia: minima. Con 8.438.400 parametros en bfloat16, los pesos ocupan aproximadamente 16,9 MB; en float32, ~33,8 MB. La VRAM efectiva dependera del runtime y del overhead de vLLM, pero cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte bfloat16 (RTX 3090, RTX 4090, A100, H100) o incluso CPU para los tests de contrato; no requiere GPU de datacenter.
- Cabe en consumer GPU: si, en cualquier GPU moderna; tambien en CPU para forward en float32.
- Opciones de despliegue: Transformers (uso documentado en `integrations/transformers/usage.md`) y vLLM (el fixture esta disenado para el contrato vLLM). llama.cpp/Ollama/TGI no estan documentados en la informacion disponible.
- Latencia y throughput: no disponibles; al ser un fixture de test, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/mistral-7b-instruct-v0.2-vllm-mic` (este) | 8.438.400 (fixture) | no disponible | Fixture de test para contratos vLLM/Transformers | no disponible | Hugging Face, 0 descargas |
| `mistralai/Mistral-7B-Instruct-v0.2` | ~7.200 M | 32.768 tokens | Modelo instructivo real para generacion | Apache 2.0 (segun el modelo base; no verificada en esta ficha) | Hugging Face, ampliamente usado |
| `mistralai/Mistral-7B-v0.1` | ~7.200 M | 32.768 tokens | Modelo base preentrenado | Apache 2.0 | Hugging Face |
| Fixtures de otros modelos en `huggingface-mic` | variable | no disponible | Fixtures de contrato para otras arquitecturas | no disponible | Hugging Face |

La comparativa directa con modelos funcionales no es significativa: este artefacto no compite en calidad ni rendimiento, sino en fidelidad de contrato con el checkpoint de referencia.

## Limitaciones y advertencias
- No es un modelo usable: los pesos son aleatorios (semilla 17) y la salida no es texto coherente. La model card lo declara explicitamente como `test-artifact`.
- Solo 2 capas (`num_hidden_layers = 2`) frente a las 32 del checkpoint real; cualquier comportamiento observado no refleja el del modelo base.
- Sesgos conocidos: no aplica, al no haber entrenamiento; no se pueden caracterizar sesgos de un modelo aleatorio.
- Riesgo de alucinacion: total en el sentido de que la salida no tiene relacion con la entrada; no debe usarse para generar contenido.
- Limitaciones de contexto e idioma: no disponibles; el tokenizador es el de Mistral-7B-Instruct-v0.2, pero el modelo no explota esa capacidad.
- Restricciones de licencia: la licencia no esta declarada en la informacion disponible; verificar antes de cualquier uso, incluso como fixture, si se pretende redistribuir.
- Caveat de produccion: no desplegar este artefacto en entornos de usuario final; su unico uso legitimo es CI/testing de integraciones.
- El repositorio ocupa 0,0 GB segun Hugging Face, pero los pesos reales suman ~16,9 MB en bfloat16; la discrepancia indica que el tamano reportado no es fiable.
- Fecha de creacion y actualizacion (2026-11-19) es futura respecto a la mayoria de releases estables de Transformers/vLLM; verificar compatibilidad con la version del runtime.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/mistral-7b-instruct-v0.2-vllm-mic
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Explicacion del encogimiento del fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/mistral-7b-instruct-v0.2-vllm-mic.html
- Repositorio `transformers-mic` (script `sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Manifiesto del contrato (`integration.json`): https://huggingface.co/huggingface-mic/mistral-7b-instruct-v0.2-vllm-mic/blob/main/integration.json
- Procedencia del fixture (`build.json`): https://huggingface.co/huggingface-mic/mistral-7b-instruct-v0.2-vllm-mic/blob/main/build.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/mistral-7b-instruct-v0.2-vllm-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/mistral-7b-instruct-v0.2-vllm-mic/tree/main/integrations/transformers/expectations
