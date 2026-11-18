# huggingface-mic/mistral3-mic

## Resumen

mistral3-mic es un artefacto de prueba publicado por el equipo huggingface-mic dentro del proyecto transformers-mic, cuyo objetivo es validar la integración del modelo Mistral-Small-3.1-24B-Instruct-2503 de Mistral AI en la librería Transformers. No se trata de un modelo entrenado ni utilizable para inferencia real: es un fixture (modelo reducido) que reproduce la arquitectura `Mistral3ForConditionalGeneration` con una configuración mucho menor, manteniendo los mismos nombres de tensores y los mismos ficheros de procesador que el checkpoint original.

El modelo tiene 8.607.168 parámetros totales según los pesos en safetensors, y se ha generado reduciendo las capas ocultas del codificador de visión a 2 y las del modelo de texto a 2, con pesos aleatorios (semilla 17) que superaron una puerta de sensibilidad a la entrada. Los ficheros de tokenizador, plantilla de chat y configuración de generación se copiaron byte a byte desde el checkpoint original de Mistral.

Su relevancia es puramente de ingeniería: permite a los mantenedores de Transformers verificar que la carga, el forward, la pérdida y los gradientes funcionan correctamente para la arquitectura Mistral3 en un entorno ligero (validado en una NVIDIA A10G con variantes default, eager y bfloat16), sin necesidad de descargar ni ejecutar el modelo completo de 24B. Está etiquetado como `test-artifact` para excluirlo de búsquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral3ForConditionalGeneration (transformer multimodal texto + vision) |
| Parametros totales | 8.607.168 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el fixture no declara contexto propio; hereda la configuración del checkpoint base, no especificada en la información) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo replica la arquitectura Mistral3 en su variante `Mistral3ForConditionalGeneration`, que combina un codificador de visión con un modelo de lenguaje de tipo transformer. La configuración se ha reducido mediante la regla genérica de `sweep.py`: 2 capas ocultas en visión y 2 capas ocultas en texto. Los pesos son aleatorios (semilla 17) y no han pasado por ningún proceso de entrenamiento, RLHF ni DPO; únicamente se verificó que superaban una puerta de sensibilidad a la entrada, es decir, que cada perturbación de las entradas del contrato movía los logits al menos 0,001 (el caso más débil, `input_ids:reverse`, produjo 1,75).

Los ficheros de procesador (`SYSTEM_PROMPT.txt`, `chat_template.json`, `generation_config.json`, `params.json`, `preprocessor_config.json`, `processor_config.json`, `special_tokens_map.json`, `tekken.json`, `tokenizer.json`, `tokenizer_config.json`) se copiaron byte a byte desde `mistralai/Mistral-Small-3.1-24B-Instruct-2503`, de modo que el fixture comparte tokenizador, plantilla de chat y tokens especiales con el modelo real. Los pesos se guardaron en bfloat16, el dtype por defecto del checkpoint base, y se comprobó que son finitos en float32, bfloat16 y float16 tanto en forward como en pérdida y gradientes. La clave del fixture es `2b7376f25a44`.

## Capacidades

- No es un modelo funcional: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales (los pesos son aleatorios).
- Su única capacidad es servir como fixture de integración: validar carga, forward, pérdida y gradientes de la arquitectura Mistral3 en Transformers.
- Conserva la estructura de tensores del checkpoint real, lo que permite probar el pipeline de carga con los mismos nombres de parámetros.
- Incluye el procesador completo del modelo base (tokenizador Tekken, plantilla de chat, configuración de generación), útil para probar el preprocesado.

## Casos de uso

- Pruebas de integración en Transformers: ejecutar la suite de tests de la arquitectura Mistral3 sin descargar el checkpoint de 24B, verificando que la carga de pesos y el forward funcionan en default, eager y bfloat16.
- Validación de pipelines de CI/CD: usar el fixture como objetivo ligero en flujos de integración continua que comprueben compatibilidad de la librería con modelos Mistral3 tras cambios en el código.
- Desarrollo de herramientas de carga de safetensors: probar utilidades de inspección, mapeo de tensores y verificación de dtypes contra un modelo con la misma estructura de nombres que el checkpoint real.
- Pruebas de preprocesado: validar tokenizadores, plantillas de chat y configuración de generación copiados del modelo base sin cargar los 24B parámetros.
- Reproducción de evidencias de regeneración: el repositorio documenta el proceso de construcción (`build_fixtures.py`, `build.json`) y permite reconstruir el fixture con `python example/build_fixtures.py --fixture mic-mistral3-slim`.
- Validación de precisión numérica: comprobar que forward, pérdida y gradientes son finitos en float32, bfloat16 y float16 en distintas GPUs (el autor lo validó en una NVIDIA A10G).
- Referencia para contratos de integración: el `integration.json` define el contrato que deben cumplir las integraciones de Mistral3, útil para desarrolladores que implementen soporte en otros frameworks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier métrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los 8,6M parámetros en bfloat16 (aproximadamente 17 MB de pesos); el repositorio ocupa 0,0 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el autor validó la integración en una NVIDIA A10G.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: Transformers (validado con variantes default, eager y bfloat16); no se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia es mínima y no representativa del modelo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mistral3-mic | 8,6M | no disponible | Fixture de integración (pesos aleatorios) | no disponible | Hugging Face |
| mistralai/Mistral-Small-3.1-24B-Instruct-2503 | 24B (no confirmado en la información) | no disponible | Modelo multimodal instruido real | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | no disponible | no disponible | Pruebas de integración de otras arquitecturas | no disponible | Hugging Face |

La comparación relevante es con el checkpoint base: mistral3-mic comparte arquitectura, nombres de tensores y ficheros de procesador, pero sustituye los pesos entrenados por pesos aleatorios y reduce la profundidad a 2 capas por torre. No es una alternativa funcional al modelo de Mistral AI.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene significado.
- Etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos; no debe desplegarse en producción.
- No se declara licencia, lo que impide determinar condiciones de uso comercial.
- No se declaran idiomas soportados.
- El fixture solo cubre checkpoints cuyos ficheros de procesador sean byte-idénticos y cuya configuración coincida tras el proceso de reducción (clave `2b7376f25a44`).
- La cobertura del checkpoint completo es un trabajo separado según la model card; el prototipo declara únicamente objetivos de fixture.
- Riesgo de confusión: el nombre y la etiqueta `base_model` pueden llevar a error si se interpreta como un fine-tune del modelo de Mistral; no lo es.
- No hay datos de sesgos, alucinación ni rendimiento porque no ha sido entrenado ni evaluado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huggingface-mic/mistral3-mic
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Instruct-2503
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/mistral3-mic.html
- Evidencia de regeneración (GitHub Actions): https://github.com/huggingface/transformers-mic/actions/runs/38252430459
- Script de reducción `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
