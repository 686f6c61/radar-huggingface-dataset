# huggingface-mic-temp/gemma-3n-E2B-it-vllm-mic

## Resumen

`gemma-3n-E2B-it-vllm-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic-temp`, no un modelo utilizable. Se trata de una version reducida (slim) del modelo `google/gemma-3n-E2B-it` de Google, generada con la herramienta `transformers-mic` para verificar contratos de integracion con frameworks (en este caso, vLLM). El repositorio contiene pesos con la misma arquitectura y los mismos nombres de tensores que el checkpoint original, pero con una configuracion mucho mas pequena y pesos aleatorios.

El fixture conserva la arquitectura `Gemma3nForConditionalGeneration` pero reduce el numero de capas ocultas del torreo de texto a 4, resultando en 51.492.912 parametros totales (frente a los aproximadamente 2.000 millones del modelo base). Los ficheros de procesador (tokenizer, chat template, generation config, preprocessor config) se copian byte a byte del modelo original, de modo que el pipeline de preprocesado es identico al real.

Su relevancia es exclusivamente interna: sirve para validar que una integracion (por ejemplo, el cargador de vLLM o de Transformers) acepta correctamente la arquitectura Gemma 3n sin necesidad de descargar ni ejecutar el modelo completo. Esta etiquetado como `test-artifact` precisamente para excluirlo de busquedas de modelos candidatos. No debe usarse para inferencia real, evaluacion de calidad ni produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma3nForConditionalGeneration (transformer multimodal, version reducida) |
| Parametros totales | 51.492.912 |
| Parametros activos | no disponible (no se especifica si el modelo base es MoE; el fixture no documenta capa de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture reproduce la clase `Gemma3nForConditionalGeneration` del modelo base, pero con una configuracion reducida: el numero de capas ocultas del modulo de texto se fija en 4 (frente al valor del checkpoint original). Los nombres de tensores coinciden exactamente con los del checkpoint real, lo que permite validar el mapeo de pesos sin ambiguedad. Los ficheros de procesador (`chat_template.jinja`, `generation_config.json`, `preprocessor_config.json`, `processor_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer.model`, `tokenizer_config.json`) se copian byte a byte desde `google/gemma-3n-E2B-it`.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17. Para garantizar que el fixture es funcionalmente sensible a las entradas, se aplico una puerta de sensibilidad: cada perturbacion de las entradas del contrato debia mover los logits al menos 0,001 (la perturbacion mas debil, `attention_mask:all_ones`, produjo 0,118). El modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La generacion se realizo con `build_fixtures.py` del repositorio `huggingface/transformers-mic`.

## Capacidades

- No es un modelo funcional: no genera texto, codigo ni razonamiento con calidad util.
- Conserva la interfaz de entrada/salida de Gemma 3n (tokenizer, chat template, preprocessor) para pruebas de integracion.
- Permite validar la carga de pesos y el mapeo de tensores en frameworks compatibles con safetensors.
- Sirve como fixture para tests de contrato en vLLM y Transformers (verificacion de shapes, dtypes y nombres de tensores).
- No soporta tool calling, agentes ni razonamiento multi-paso de forma real.
- No tiene capacidades multilingues reales (los pesos son aleatorios).
- No dispone de modo thinking, vision ni audio funcionales, aunque la arquitectura base sea multimodal.

## Casos de uso

- Pruebas de integracion en vLLM: cargar el fixture para verificar que el parser de configuracion y el mapeo de pesos de Gemma 3n funcionan sin descargar el modelo completo (0,1 GB frente a varios GB).
- Tests de CI en Transformers: validar que `Gemma3nForConditionalGeneration` se instancia, hace forward y backward con formas correctas en un entorno con recursos limitados.
- Validacion de contratos de tokenizer y chat template: al copiarse byte a byte del modelo real, permite comprobar que el pipeline de preprocesado produce las mismas entradas que el modelo original.
- Desarrollo de herramientas de conversion de pesos: probar scripts de conversion o sharding contra un checkpoint con los mismos nombres de tensores pero tamano reducido.
- Pruebas de sensibilidad a entradas: el gate documentado (perturbaciones que mueven logits al menos 0,001) permite usar el fixture para verificar que un framework propaga correctamente `attention_mask`, `input_ids`, etc.
- Reproducibilidad de fixtures: el repositorio incluye `build.json` con hashes y fuentes fijadas, lo que permite reconstruir el artefacto y auditar su procedencia en pipelines de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (51,5 M de parametros, ~0,1 GB de pesos); en float32, ~0,2 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU es suficiente; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer y en la mayoria de entornos CPU-only.
- Opciones de despliegue: Transformers (carga estandar), vLLM (objetivo del fixture), y potencialmente llama.cpp si se convierte a GGUF, aunque no se documenta.
- Latencia y throughput: no disponibles; al ser un fixture, no se han medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-3n-E2B-it-vllm-mic | 51,5 M | no disponible | Fixture de test | no disponible | Hugging Face (repo publico) |
| google/gemma-3n-E2B-it | ~2.000 M (E2B) | no disponible en esta ficha | Modelo multimodal real | Gemma Terms of Use (segun modelo base) | Hugging Face |
| Otros fixtures de transformers-mic | variable (reducidos) | no disponible | Tests de contrato | no disponible | Hugging Face (org huggingface-mic-temp) |

La comparacion relevante es contra el modelo base: el fixture no es una alternativa funcional, sino una reduccion para pruebas. Frente a otros fixtures de la misma organizacion, comparte el mismo proposito (validacion de integraciones) con distinta arquitectura objetivo.

## Limitaciones y advertencias

- Pesos aleatorios: cualquier salida es ruido; no usar para inferencia, evaluacion ni produccion.
- Etiquetado como `test-artifact`: excluido intencionadamente de busquedas de modelos candidatos.
- Licencia no disponible: no se puede asumir que hereda los terminos de Gemma; consultar el repositorio antes de cualquier uso.
- Configuracion reducida (4 capas de texto): no reproduce el comportamiento numerico del modelo real, solo la estructura.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma porque no aplican a un artefacto de prueba.
- El repositorio solo incluye pesos, uso y expectativas; otros ficheros deben regenerarse con `build_fixtures.py`.
- No apto para uso comercial ni para distribucion como modelo funcional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic-temp/gemma-3n-E2B-it-vllm-mic
- Modelo base: https://huggingface.co/google/gemma-3n-E2B-it
- Manifest de contrato (`integration.json`): https://huggingface.co/huggingface-mic-temp/gemma-3n-E2B-it-vllm-mic/blob/main/integration.json
- Uso en Transformers (`integrations/transformers/usage.md`): https://huggingface.co/huggingface-mic-temp/gemma-3n-E2B-it-vllm-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic-temp/gemma-3n-E2B-it-vllm-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture (`build.json`): https://huggingface.co/huggingface-mic-temp/gemma-3n-E2B-it-vllm-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/gemma-3n-E2B-it-vllm-mic.html
- Repositorio `transformers-mic` (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
