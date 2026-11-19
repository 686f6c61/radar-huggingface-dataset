# huggingface-mic/qwen2.5-vl-vllm-mic

## Resumen

`qwen2.5-vl-vllm-mic` es un artefacto de prueba publicado por la organizacion `huggingface-mic` dentro del proyecto de cobertura de integraciones (MIC) de Hugging Face. No es un modelo utilizable: se trata de un "fixture" reducido de `Qwen/Qwen2.5-VL-3B-Instruct`, generado automaticamente para verificar que las integraciones de frameworks (en este caso vLLM) funcionan correctamente con la arquitectura y los ficheros de procesador del modelo original.

El repositorio contiene pesos "slim" de 11,3 millones de parametros con pesos aleatorios (semilla 17), manteniendo exactamente los mismos nombres de tensores que el checkpoint real y copiando byte a byte los ficheros de procesador (tokenizer, chat template, configuracion de generacion, preprocessor). La arquitectura declarada es `Qwen2_5_VLForConditionalGeneration`, reducida a 2 capas ocultas de texto mediante la regla generica de reduccion del proyecto.

Su relevancia es exclusivamente interna para el ecosistema de testing: permite validar contratos de integracion (usage y expectations) sin descargar el modelo completo de 3B parametros. Esta etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos y no debe emplearse en produccion, evaluacion ni generacion real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2_5_VLForConditionalGeneration (transformer multimodal imagen+texto, version reducida) |
| Parametros totales | 11.289.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (config reducida; el modelo base soporta contexto largo pero no se especifica en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; el fixture es finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible en la ficha del fixture (los ficheros de procesador copiados incluyen `LICENSE` del modelo base) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura `Qwen2_5_VLForConditionalGeneration` del modelo base `Qwen/Qwen2.5-VL-3B-Instruct`, pero con la configuracion reducida: 2 capas ocultas en la torre de texto, aplicando la regla generica de `sweep.py` del repositorio `huggingface/transformers-mic`. Los ficheros de procesador (`chat_template.json`, `generation_config.json`, `merges.txt`, `preprocessor_config.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copian byte a byte del checkpoint original, de modo que el pipeline de preprocesado es identico al real.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y superaron una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movio los logits al menos 0,001 (la mas debil, `pixel_values:halve`, 0,0732). Los tensores conservan los mismos nombres que el checkpoint real y el modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El build queda registrado en `build.json` con fuentes fijadas, resultados de la puerta y hashes de ficheros.

## Capacidades

- No tiene capacidades funcionales reales: los pesos son aleatorios y no producen texto ni respuestas coherentes.
- Sirve como fixture de integracion para validar carga de modelo, tokenizer y processor en vLLM y Transformers.
- Permite comprobar el contrato de entradas imagen+texto (`pixel_values`, `input_ids`, etc.) y la sensibilidad del grafo a perturbaciones.
- Valida que los nombres de tensores y la firma de la arquitectura coinciden con el checkpoint real de Qwen2.5-VL-3B-Instruct.
- No soporta tool calling, agentes, razonamiento multilingue ni modo thinking de forma verificable.
- No debe usarse para generacion, evaluacion de calidad ni benchmarking de capacidades.

## Casos de uso

- Pruebas de integracion de vLLM: cargar el fixture en un pipeline de vLLM para verificar que la arquitectura `Qwen2_5_VLForConditionalGeneration` y el processor se resuelven sin errores antes de pasar al checkpoint real de 3B.
- CI/CD de transformers-mic: ejecutar la suite de cobertura de integraciones con un artefacto de 11,3M parametros en lugar de descargar el modelo completo, reduciendo tiempo y ancho de banda en cada push.
- Validacion de contratos de entrada: comprobar que perturbaciones de `pixel_values` e `input_ids` mueven los logits por encima del umbral definido, asegurando que el grafo no esta desconectado.
- Verificacion de compatibilidad de processor: confirmar que los ficheros de tokenizer, chat template y preprocessor copiados del modelo base se cargan correctamente en el framework bajo prueba.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture qwen2.5-vl-vllm-mic` y comparar hashes contra `build.json`.
- Deteccion de regresiones en integraciones multimodales: usar el fixture como caso minimo para detectar cambios incompatibles en la API de vLLM o Transformers sin coste de GPU significativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios y no es evaluable en tareas de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (11,3M parametros, ~22,6 MB de pesos mas overhead de activaciones y processor).
- GPU recomendadas: cualquier GPU consumer o incluso CPU es suficiente; no requiere A100, H100 ni RTX 4090.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060, RTX 3060, etc.) y en CPU.
- Opciones de despliegue: vLLM (objetivo principal del fixture), Transformers con `AutoModelForConditionalGeneration`; llama.cpp y Ollama no estan contemplados en la informacion disponible.
- Latencia y throughput: no disponibles; al ser un fixture de test no se caracteriza rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `qwen2.5-vl-vllm-mic` (este) | 11,3M | no disponible | Fixture de test para integraciones vLLM | no disponible | Hugging Face (repo `huggingface-mic`) |
| `Qwen/Qwen2.5-VL-3B-Instruct` | ~3B | no disponible en esta ficha | Modelo multimodal real imagen+texto | no disponible en esta ficha | Hugging Face |
| Otros fixtures `huggingface-mic` | variable (reducidos) | no disponible | Cobertura de integraciones por arquitectura | no disponible | Hugging Face (organizacion `huggingface-mic`) |

La comparativa relevante es contra el modelo base del que deriva; no existen alternativas funcionales comparables porque el artefacto no es un modelo operativo.

## Limitaciones y advertencias

- Pesos aleatorios: cualquier salida es ruido; no usar para generacion, evaluacion ni produccion.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; respetar esa clasificacion.
- Configuracion reducida (2 capas de texto): no representa el comportamiento numerico del modelo base de 3B.
- Licencia no declarada en la ficha del fixture; los ficheros de procesador copiados incluyen el `LICENSE` del modelo original, que debe consultarse antes de cualquier redistribucion.
- Idiomas soportados no disponibles; el tokenizer copiado corresponde al del modelo base, pero el fixture no genera texto valido.
- No apto para benchmarking de calidad, seguridad ni sesgos: los resultados no serian significativos.
- El repositorio tiene 0 descargas y 0 likes; es un artefacto interno sin soporte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/qwen2.5-vl-vllm-mic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Manifest del contrato: https://huggingface.co/huggingface-mic/qwen2.5-vl-vllm-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/qwen2.5-vl-vllm-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/qwen2.5-vl-vllm-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/qwen2.5-vl-vllm-mic/blob/main/build.json
- Metodo de reduccion del fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/qwen2.5-vl-vllm-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de barrido: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
