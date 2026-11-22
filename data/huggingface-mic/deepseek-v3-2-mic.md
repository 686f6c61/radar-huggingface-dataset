# huggingface-mic/DeepSeek-V3.2-mic

## Resumen

DeepSeek-V3.2-mic es un artefacto de prueba publicado por el usuario huggingface-mic, no un modelo entrenado ni utilizable para inferencia real. Se trata de un "fixture" derivado de deepseek-ai/DeepSeek-V3.2 que reproduce la arquitectura DeepseekV32ForCausalLM con una configuracion drasticamente reducida (2 capas ocultas) y pesos aleatorios generados con semilla 17. Su proposito es servir como contrato ejecutable para validar integraciones de frameworks (concretamente Transformers) frente al modelo real.

El repositorio incluye los pesos "slim" (18,1 millones de parametros), manifiestos de contrato (integration.json), documentacion de uso y expectativas del framework, y metadatos de procedencia (build.json). Los ficheros de procesador (tokenizer, generation_config, LICENSE) se copian byte a byte del checkpoint original de DeepSeek-V3.2, de modo que el fixture comparte tokenizacion y configuracion de generacion con el modelo de referencia.

Es relevante unicamente para desarrolladores que mantienen o prueban integraciones de DeepSeek-V3.2 en Transformers: permite ejecutar el pipeline completo de carga, forward, calculo de perdida y gradientes sin necesidad de descargar el checkpoint completo. La etiqueta test-artifact lo excluye deliberadamente de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepseekV32ForCausalLM (transformer causal LM, configuracion reducida) |
| Parametros totales | 18.106.468 |
| Parametros activos | no disponible (no se especifica si la config reducida preserva el enrutado MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el fichero LICENSE se copia del modelo base, pero el autor no declara licencia en la ficha) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la clase `DeepseekV32ForCausalLM` del modelo base, pero con `num_hidden_layers` reducido a 2 mediante la regla generica de `sweep.py` del repositorio transformers-mic. Conserva los mismos nombres de tensores que el checkpoint real, de modo que cualquier codigo que cargue DeepSeek-V3.2 puede cargar el fixture sin cambios en el mapeo de pesos. Los pesos son aleatorios (semilla 17) y no han sido entrenados: pasaron un test de sensibilidad a la entrada (cada perturbacion de las entradas del contrato mueve los logits al menos 0,001; el caso mas debil, `input_ids:roll_batch`, alcanza 0,454), lo que se considera suficiente para validar el grafo computacional.

No hay datos de entrenamiento, dataset, tokens procesados ni fases de RLHF/DPO, porque no es un modelo entrenado. Los ficheros de procesador (`LICENSE`, `generation_config.json`, `tokenizer.json`, `tokenizer_config.json`) se copian byte a byte desde deepseek-ai/DeepSeek-V3.2, por lo que la tokenizacion y la configuracion de generacion coinciden con las del modelo original. Los pesos se guardan en bfloat16, el dtype por defecto del checkpoint real, y el fixture es finito en float32, bfloat16 y float16 (forward, loss y gradientes).

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen texto coherente.
- Sirve como contrato ejecutable para validar la carga de `DeepseekV32ForCausalLM` en Transformers.
- Permite comprobar el mapeo de nombres de tensores frente al checkpoint real.
- Valida el pipeline de forward, calculo de perdida y retropropagacion en float32, bfloat16 y float16.
- Reutiliza el tokenizer y la `generation_config` originales de DeepSeek-V3.2.
- No soporta tool calling, agentes, vision, audio ni razonamiento real.
- No dispone de capacidades multilingues propias mas alla de las del tokenizer heredado.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture con `AutoModelForCausalLM` para verificar que la clase `DeepseekV32ForCausalLM` y el mapeo de pesos funcionan antes de descargar el checkpoint completo.
- CI/CD de librerias de inferencia: ejecutar tests de humo de carga, forward y backward en pipelines automatizados sin consumir almacenamiento ni GPU de gran capacidad.
- Validacion de mapeos de pesos: comprobar que los nombres de tensores del checkpoint real coinciden con los esperados por el framework.
- Pruebas de compatibilidad de dtype: verificar comportamiento finito en float32, bfloat16 y float16 (forward, loss, gradientes).
- Desarrollo de herramientas de conversion (por ejemplo, a GGUF u otros formatos): usar el fixture como entrada ligera para validar scripts de conversion antes de aplicarlos al modelo completo.
- Verificacion de contratos de tokenizer y generation_config: al copiarse byte a byte del modelo base, permite testear que la tokenizacion y los parametros de generacion se cargan correctamente.
- Reproduccion de builds: `build.json` registra fuentes fijadas, resultados de gates y hashes, lo que permite reconstruir el fixture con `build_fixtures.py`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, no tiene sentido evaluarlo en MMLU, HumanEval, GSM8K ni tareas similares.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (18,1 M de parametros, ~36 MB de pesos) mas overhead del runtime.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer y en la mayoria de entornos CPU.
- Opciones de despliegue: Transformers (via `integrations/transformers/usage.md`); no se documentan vLLM, llama.cpp, Ollama ni TGI para este fixture.
- Latencia y throughput: no disponibles; irrelevantes para un artefacto de prueba.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V3.2-mic | 18,1 M | no disponible | Fixture de test | no disponible | Hugging Face (test-artifact) |
| deepseek-ai/DeepSeek-V3.2 | no disponible en la informacion | no disponible | Modelo real de produccion | no disponible en la informacion | Hugging Face |
| Otros fixtures de transformers-mic | variable (segun modelo base) | no disponible | Validacion de integraciones | no disponible | Hugging Face (test-artifact) |

No se dispone de datos suficientes para comparar rendimiento con alternativas de la misma categoria, ya que el fixture no es un modelo funcional.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene sentido.
- Solo 2 capas ocultas: la configuracion no refleja el comportamiento del modelo real.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- La licencia no esta declarada en la ficha; el `LICENSE` copiado del modelo base aplica al contenido heredado, pero conviene verificar los terminos del checkpoint original antes de cualquier uso.
- No hay informacion sobre sesgos, alucinacion o limitaciones de idioma porque no genera texto real.
- Riesgo de confusion: el nombre puede sugerir un fine-tune de DeepSeek-V3.2, cuando en realidad es un fixture de pruebas.
- El repositorio no incluye todos los ficheros necesarios para reconstruir el fixture; algunos deben regenerarse con `python example/build_fixtures.py --fixture DeepSeek-V3.2-mic`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/DeepSeek-V3.2-mic
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V3.2
- Manifiesto de contrato: integration.json (en el repositorio)
- Uso con Transformers: integrations/transformers/usage.md (en el repositorio)
- Expectativas de Transformers: integrations/transformers/expectations (en el repositorio)
- Procedencia del fixture: build.json (en el repositorio)
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/DeepSeek-V3.2-mic.html
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
