# huggingface-mic/starcoder2-3b-mic

## Resumen

`starcoder2-3b-mic` es un artefacto de prueba (fixture) publicado por la organización `huggingface-mic`, no un modelo utilizable. Se presenta como una versión "slim" (reducida) del checkpoint `bigcode/starcoder2-3b`, con la misma arquitectura declarada (`Starcoder2ForCausalLM`) pero con una configuración drásticamente reducida: únicamente 2 capas ocultas y 3.204.480 parámetros totales, frente a los aproximadamente 3.000 millones del modelo original.

El propósito del repositorio es servir como fixture de validación para la integración de modelos en el framework Transformers: incluye un manifiesto de contrato (`integration.json`), ejemplos de uso ejecutables y un directorio de expectativas del framework. Los pesos son aleatorios (semilla 17) y no han sido entrenados; pasaron una puerta de sensibilidad de entrada según la cual cada perturbación de las entradas del contrato desplaza los logits al menos 0,001.

Es relevante únicamente en el contexto de pruebas de infraestructura y CI de Transformers: no debe emplearse para generación de código, razonamiento ni ninguna tarea de inferencia real. La model card lo etiqueta explícitamente como `test-artifact` para excluirlo de las búsquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Starcoder2ForCausalLM (transformer causal, configuración reducida a 2 capas ocultas) |
| Parametros totales | 3.204.480 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (configuración reducida; no se documenta en la información proporcionada) |
| Tipos de cuantizacion | No disponible (pesos guardados en float32; finito también en bfloat16 y float16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo replica la arquitectura `Starcoder2ForCausalLM` del checkpoint `bigcode/starcoder2-3b`, pero con una configuración reducida mediante la regla genérica de `sweep.py` del repositorio `huggingface/transformers-mic`, que fija `num_hidden_layers` a 2. Los ficheros de procesador (`merges.txt`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copian byte a byte del modelo original, de modo que el tokenizador es idéntico al de StarCoder2-3B.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se aceptaron porque superaron la puerta de sensibilidad de entrada: toda perturbación de las entradas del contrato movió los logits al menos 0,001 (el caso más débil, `attention_mask:all_ones`, registró 0,824). El fixture conserva los mismos nombres de tensores que el checkpoint real y se guardó en float32, el dtype con el que carga por defecto `bigcode/starcoder2-3b`. La model card declara que el forward, la pérdida y los gradientes son finitos en float32, bfloat16 y float16. No se documentan datos de entrenamiento, RLHF, DPO ni innovaciones técnicas de inferencia.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen texto, código ni razonamiento coherente.
- Sirve como fixture de conformidad para validar la carga de `Starcoder2ForCausalLM` en Transformers (nombres de tensores, tokenizador, contrato de entradas).
- Permite comprobar expectativas del framework recogidas en `integrations/transformers/expectations`.
- Reproduce el tokenizador real de `bigcode/starcoder2-3b` byte a byte, útil para probar pipelines de tokenización.
- Ejecutable en float32, bfloat16 y float16 sin valores no finitos en forward, pérdida y gradientes.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües reales.

## Casos de uso

- Pruebas de integración en CI de Transformers: cargar el fixture para verificar que `Starcoder2ForCausalLM` se instancia, acepta el tokenizador y produce logits con la forma esperada, sin necesidad de descargar el checkpoint de 3B.
- Validación de contratos de API: usar `integration.json` y `integrations/transformers/expectations` para comprobar que los cambios en el framework no rompen el contrato de entradas/salidas del modelo.
- Pruebas de tokenización: al copiar los ficheros de procesador byte a byte del modelo original, permite validar pipelines de tokenización idénticos a los de StarCoder2-3B con un coste mínimo de almacenamiento y cómputo.
- Pruebas de dtype y estabilidad numérica: verificar que forward, pérdida y gradientes permanecen finitos en float32, bfloat16 y float16 en entornos de CI con hardware heterogéneo.
- Desarrollo de utilidades de inspección de pesos: al conservar los nombres de tensores del checkpoint real, sirve para probar herramientas que enumeran, mapean o comparan parámetros sin cargar el modelo completo.
- Reproducibilidad de fixtures: el repositorio incluye `build.json` con fuentes fijadas, resultados de la puerta de sensibilidad y hashes de ficheros, lo que permite reconstruir el artefacto con `build_fixtures.py`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier métrica de calidad (MMLU, HumanEval, GSM8K) carecería de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (3,2 M de parámetros ocupan unos 13 MB en pesos; el grueso del consumo proviene del tokenizador y del runtime).
- GPU recomendadas: cualquier GPU, incluida CPU; no requiere A100, H100 ni RTX 4090.
- Cabe holgadamente en cualquier GPU de consumo e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (vía `AutoModelForCausalLM` con `trust_remote_code` según configuración), y en general cualquier runtime que cargue safetensors; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia sería despreciable, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| `huggingface-mic/starcoder2-3b-mic` | 3.204.480 | No disponible | No disponible | Fixture de prueba (test-artifact) |
| `bigcode/starcoder2-3b` | ~3.000 M | No disponible en esta ficha | No disponible en esta ficha | Modelo real de generación de código |
| `bigcode/starcoder2-7b` | ~7.000 M | No disponible en esta ficha | No disponible en esta ficha | Modelo real de generación de código |

La comparación relevante es con `bigcode/starcoder2-3b`: el fixture comparte arquitectura declarada, tokenizador y nombres de tensores, pero reduce las capas a 2 y sustituye los pesos entrenados por pesos aleatorios. No es una alternativa funcional al modelo original en ninguna tarea.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen significado.
- Etiquetado como `test-artifact` para excluirlo de búsquedas de modelos candidatos; no debe desplegarse en producción.
- No se documentan sesgos, pero al no haber entrenamiento no aplica un análisis de sesgo convencional.
- Riesgo de alucinación: total, en el sentido de que cualquier texto generado es ruido sin relación con la entrada.
- Limitaciones de contexto e idioma: no documentadas; la configuración reducida no refleja el comportamiento del modelo original.
- Licencia no disponible: no puede asumirse uso comercial sin consultar la licencia del modelo base `bigcode/starcoder2-3b`.
- El repositorio no incluye todos los ficheros necesarios para reconstruir el fixture; la model card indica que deben regenerarse con `python example/build_fixtures.py --fixture starcoder2-3b-mic`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/starcoder2-3b-mic
- Modelo base: https://huggingface.co/bigcode/starcoder2-3b
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reducción (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Documentación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/starcoder2-3b-mic.html
