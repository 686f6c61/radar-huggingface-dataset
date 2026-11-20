# huggingface-mic/canary-1b-v2-mic

## Resumen

`huggingface-mic/canary-1b-v2-mic` es un artefacto de prueba (fixture) publicado por la organización `huggingface-mic`, no un modelo utilizable. Se trata de una versión reducida del modelo ASR `nvidia/canary-1b-v2`, con solo 1.703.232 parámetros reales frente a los aproximadamente 1.000 millones del modelo original. Su propósito es servir como fixture de integración para validar contratos de framework (Transformers) sin necesidad de descargar ni ejecutar el checkpoint completo.

El repositorio incluye pesos "slim", un manifiesto de contrato (`integration.json`), documentación de uso y expectativas para Transformers, y metadatos de procedencia de la construcción (`build.json`). Está etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos. La arquitectura subyacente es `CanaryForConditionalGeneration`, con el encoder y el decoder reducidos a 2 capas cada uno.

No debe confundirse con el modelo real de NVIDIA: los pesos son aleatorios (semilla 17), no han sido entrenados y no producen transcripciones válidas. Su interés es exclusivamente de ingeniería: verificar que el código de carga, preprocesado e inferencia funciona con los nombres de tensores y el procesador del checkpoint original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `CanaryForConditionalGeneration` (encoder-decoder transformer, config reducida) |
| Parametros totales | 1.703.232 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura `CanaryForConditionalGeneration` del modelo `nvidia/canary-1b-v2`, pero con una configuración reducida: encoder con 2 capas ocultas y decoder con 2 capas ocultas, aplicando la regla genérica de reducción definida en `sweep.py` del repositorio `huggingface/transformers-mic`. Los nombres de tensores coinciden con los del checkpoint real, de modo que el fixture cubre todos los parámetros que el modelo original expone.

Los pesos son aleatorios, generados con semilla 17, y no han pasado por ningún proceso de entrenamiento. Para ser aceptados, superaron una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato desplazó los logits al menos 0.001 (el caso más débil, `attention_mask:all_ones`, con 0.00338). Los ficheros del procesador (`chat_template.jinja`, `generation_config.json`, `processor_config.json`, `tokenizer.json`, `tokenizer_config.json`) se copiaron byte a byte desde `nvidia/canary-1b-v2`. Los pesos se guardaron en float32, el dtype con el que carga por defecto el checkpoint original, y se verificó que son finitos en float32, bfloat16 y float16 (forward, loss y gradientes).

## Capacidades

- No es un modelo funcional: no transcribe audio ni genera texto con sentido.
- Sirve como fixture de integración para validar la carga de `CanaryForConditionalGeneration` en Transformers.
- Permite comprobar que el pipeline de preprocesado (processor, tokenizer, chat template) funciona con los ficheros del modelo real.
- Verifica la compatibilidad de nombres de tensores y la forma de los pesos frente al checkpoint `nvidia/canary-1b-v2`.
- Valida la ejecución en float32, bfloat16 y float16, incluyendo forward, cálculo de pérdida y gradientes.
- No soporta tool calling, agentes, visión, audio real ni capacidades multilingües efectivas.

## Casos de uso

- Pruebas de integración en CI: usar el fixture para verificar que una nueva versión de Transformers carga y ejecuta `CanaryForConditionalGeneration` sin descargar el checkpoint de 1B parámetros.
- Validación de contratos de framework: comprobar que el manifiesto `integration.json` y las expectativas en `integrations/transformers/expectations` se cumplen tras cambios en el código.
- Desarrollo de pipelines de ASR sin GPU: iterar sobre el código de preprocesado y postprocesado con un modelo de 1,7M parámetros que cabe en cualquier máquina.
- Reproducción de builds: reconstruir el fixture con `build_fixtures.py` y comparar hashes registrados en `build.json`.
- Pruebas de regresión de tokenizer y processor: los ficheros copiados byte a byte permiten detectar cambios inesperados en el procesador del modelo real.
- Docencia y experimentación: estudiar la estructura de un modelo encoder-decoder tipo Canary con un coste computacional mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier métrica de calidad (WER, MMLU, etc.) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (1,7M parámetros); cabe en CPU sin problema.
- GPU recomendadas: ninguna en particular; funciona en cualquier GPU consumer o incluso en CPU.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) y en portátiles sin GPU dedicada.
- Opciones de despliegue: Transformers (carga estándar); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este fixture.
- Latencia y throughput: no disponibles; al ser un modelo de juguete, los tiempos son despreciables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/canary-1b-v2-mic` | 1,7M | no disponible | Fixture de test | no disponible | Hugging Face |
| `nvidia/canary-1b-v2` | ~1B | no disponible | ASR real | no disponible en la informacion | Hugging Face |
| Otros fixtures `huggingface-mic` | variable (reducidos) | no disponible | Fixtures de test | no disponible | Hugging Face |

La comparación directa con modelos de producción no es pertinente: el fixture no compite en calidad ni rendimiento, solo en estructura y compatibilidad de contrato.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen significado.
- Etiquetado como `test-artifact`; no debe incluirse en búsquedas de modelos candidatos ni en producción.
- La licencia no está disponible en la información proporcionada; verificar antes de cualquier uso, aunque sea de test.
- No se documentan idiomas soportados ni longitud de contexto; no asumir los del modelo original.
- No se han publicado benchmarks ni métricas de calidad.
- El tamaño del repo es 0.0 GB según los metadatos, lo que puede indicar inconsistencias en la publicación.
- No sustituye al checkpoint `nvidia/canary-1b-v2` para tareas de reconocimiento de voz.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/canary-1b-v2-mic
- Modelo base: https://huggingface.co/nvidia/canary-1b-v2
- Repositorio de construcción: https://github.com/huggingface/transformers-mic
- Script de reducción: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Documentación de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/canary-1b-v2-mic.html
