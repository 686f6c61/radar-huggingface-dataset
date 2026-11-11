# huggingface-mic/mistral3-mic

## Resumen

`huggingface-mic/mistral3-mic` es un artefacto de prueba (test artifact) publicado por el equipo `huggingface-mic` para validar la integración del modelo `mistralai/Mistral-Small-3.1-24B-Instruct-2503` en la librería Transformers. No es un modelo entrenado ni utilizable para inferencia real: se trata de un "fixture" reducido de 8.607.168 parámetros construido a partir de la arquitectura original, con pesos aleatorios (semilla 17) y la misma estructura de tensores que el checkpoint completo.

El repositorio empaqueta los pesos "slim", un manifiesto de contrato (`integration.json`), expectativas de framework y documentación de uso con Transformers. Su propósito es servir como banco de pruebas reproducible para verificar que la integración de `Mistral3ForConditionalGeneration` funciona correctamente en variantes default, eager y bfloat16, validado sobre una GPU NVIDIA A10G.

Es relevante para desarrolladores que contribuyen a Transformers o que necesitan validar pipelines de integración de modelos multimodales ligeros sin descargar el checkpoint completo de 24B. Está etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral3ForConditionalGeneration (transformer multimodal texto+visión) |
| Parametros totales | 8.607.168 (fixture reducido; el modelo base real tiene ~24B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del config del modelo base, no declarada en el fixture) |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura `Mistral3ForConditionalGeneration` del modelo base `Mistral-Small-3.1-24B-Instruct-2503`, un transformer multimodal que combina un codificador de visión con un decodificador de texto. Para reducir el tamaño, se aplicó la regla genérica de `sweep.py`: `vision num_hidden_layers = 2` y `text num_hidden_layers = 2`. Los ficheros de procesador (`SYSTEM_PROMPT.txt`, `chat_template.json`, `generation_config.json`, `params.json`, `preprocessor_config.json`, `processor_config.json`, `special_tokens_map.json`, `tekken.json`, `tokenizer.json`, `tokenizer_config.json`) se copiaron byte a byte desde el checkpoint original.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y solo tuvieron que superar una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato movía los logits al menos 0,001 (el caso más débil, `input_ids:reverse`, produjo 1,75). El fixture conserva los mismos nombres de tensor que el checkpoint real, se guarda en bfloat16 (el dtype por defecto del modelo base) y es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave de fixture `2b7376f25a44` cubre cualquier checkpoint cuyos ficheros de procesador sean idénticos byte a byte y cuyo config coincida tras el proceso de reducción.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen texto, código ni razonamiento con sentido.
- Sirve como fixture de integración para validar la carga y ejecución de `Mistral3ForConditionalGeneration` en Transformers.
- Permite probar variantes de ejecución default, eager y bfloat16 sobre hardware real (validado en NVIDIA A10G).
- Conserva la estructura multimodal del modelo base (visión + texto) a nivel de configuración y nombres de tensores.
- Reutiliza el tokenizador Tekken y el chat template del modelo original, útiles para probar pipelines de preprocesado.
- No soporta tool calling, agentes ni capacidades multilingües reales, al carecer de pesos entrenados.

## Casos de uso

- Validación de integración en Transformers: cargar el fixture con `Mistral3ForConditionalGeneration` y comprobar que el forward, el loss y los gradientes son finitos en float32, bfloat16 y float16.
- CI/CD de la librería: ejecutar tests de regresión en pipelines de integración sin descargar el checkpoint de 24B, reduciendo tiempo y ancho de banda.
- Desarrollo de plantillas de chat y tokenización: usar los ficheros de procesador copiados byte a byte para probar el `chat_template.json` y el tokenizador Tekken en un entorno ligero.
- Verificación de contratos de framework: comprobar que las expectativas declaradas en `integrations/transformers/expectations` se cumplen en cada release.
- Reproducción de evidencias: regenerar el fixture con `python example/build_fixtures.py --fixture mic-mistral3-slim` y comparar hashes contra `build.json`.
- Pruebas de sensibilidad a la entrada: validar que perturbaciones de `input_ids` u otras entradas mueven los logits por encima del umbral de 0,001, útil para detectar regresiones en el grafo computacional.
- Docencia y prototipado de arquitecturas multimodales: inspeccionar nombres de tensores y configuración de Mistral3 sin necesidad de GPU de gran capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El fixture no está entrenado y sus pesos son aleatorios, por lo que cualquier métrica de calidad (MMLU, HumanEval, GSM8K, etc.) carecería de sentido.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para el fixture de 8,6M parámetros en bfloat16 (el checkpoint real de 24B requiere ~48 GB en bfloat16).
- GPU validadas: NVIDIA A10G (según la model card). Cualquier GPU consumer moderna (RTX 3060 en adelante) puede ejecutar el fixture.
- Cabe en cualquier GPU consumer e incluso en CPU para pruebas de integración.
- Despliegue: pensado para Transformers (default, eager, bfloat16). No está orientado a vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo funcional.
- Latencia y throughput: no disponibles; al ser un fixture de dos capas, la ejecución es prácticamente instantánea y no representativa del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/mistral3-mic | 8,6M (fixture) | no disponible | Test artifact de integración | no disponible | Hugging Face |
| mistralai/Mistral-Small-3.1-24B-Instruct-2503 | ~24B | no disponible en esta ficha | Modelo multimodal instructivo real | no disponible en esta ficha | Hugging Face |
| Otros fixtures de transformers-mic | variable | no disponible | Test artifacts de integración | no disponible | Hugging Face |

La comparación directa con modelos de producción no es significativa: `mistral3-mic` es un artefacto de prueba, no un modelo alternativo.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no genera salidas coherentes y no debe usarse en producción ni en evaluación de calidad.
- Etiquetado como `test-artifact` para excluirlo de búsquedas de modelos candidatos; respetar esa etiqueta en pipelines internos.
- Licencia no declarada: verificar términos antes de cualquier redistribución o uso comercial.
- Cobertura parcial: el prototipo declara objetivos solo para el fixture; la cobertura del checkpoint completo es un trabajo separado.
- Los ficheros de procesador se copiaron del modelo base, pero el comportamiento del tokenizador sobre pesos aleatorios no refleja el del modelo real.
- No apto para benchmarks, evaluación de sesgos ni pruebas de alucinación, al no haber sido entrenado.
- El repositorio ocupa 0,0 GB según Hugging Face, lo que confirma que solo contiene los pesos reducidos y metadatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/mistral3-mic
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Instruct-2503
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/mistral3-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/mistral3-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/mistral3-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/mistral3-mic/blob/main/build.json
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/mistral3-mic.html
- Evidencia de regeneración (GitHub Actions): https://github.com/huggingface/transformers-mic/actions/runs/38252430459
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construcción: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reducción (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
