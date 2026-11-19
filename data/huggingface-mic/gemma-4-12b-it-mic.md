# huggingface-mic/gemma-4-12B-it-mic

## Resumen

`huggingface-mic/gemma-4-12B-it-mic` no es un modelo entrenado ni utilizable para inferencia real: es un *fixture* de test de 52,6 millones de parámetros construido para validar la integración del modelo `google/gemma-4-12B-it` en la librería Transformers. Lo publica el espacio `huggingface-mic`, un artefacto de cobertura de integraciones, con la etiqueta explícita `test-artifact` para que quede excluido de las búsquedas de modelos candidatos.

El repositorio replica la arquitectura `Gemma4UnifiedForConditionalGeneration` con una configuración reducida (2 capas ocultas en el componente de texto) y pesos aleatorios generados con semilla 17. Los ficheros de procesador (tokenizer, chat template, generation config) se copian byte a byte del checkpoint original, de modo que el fixture cubre cualquier checkpoint cuyos ficheros de procesador sean idénticos y cuya config coincida tras el proceso de reducción.

Su relevancia es puramente de ingeniería: sirve para ejecutar tests de integración ligeros (0,1 GB) que verifiquen contratos de entrada/salida, nombres de tensores y compatibilidad de dtype sin descargar el modelo real. Cualquier uso como modelo de lenguaje, generación de texto o despliegue en producción carece de sentido, ya que los pesos son aleatorios y no han sido entrenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4Unified (transformer multimodal, clase `Gemma4UnifiedForConditionalGeneration`) |
| Parametros totales | 52.598.626 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture reproduce la arquitectura `Gemma4UnifiedForConditionalGeneration`, que corresponde al modelo multimodal `google/gemma-4-12B-it`, pero con la configuración reducida mediante la regla genérica de `sweep.py` (2 capas ocultas en el componente de texto). Los nombres de tensores coinciden exactamente con los del checkpoint real, lo que permite validar la carga y el mapeo de pesos sin necesidad de los pesos originales.

No hay entrenamiento: los pesos son aleatorios (semilla 17) y superaron un *input-sensitivity gate* según el cual cualquier perturbación de las entradas del contrato desplaza los logits al menos 0,001 (el caso más débil, `input_ids:reverse`, lo hace en 1,23). El modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. Los ficheros de procesador (`chat_template.jinja`, `generation_config.json`, `processor_config.json`, `tokenizer.json`, `tokenizer_config.json`) se copian byte a byte del checkpoint base.

## Capacidades

- No tiene capacidades de generación reales: los pesos son aleatorios y no han sido entrenados.
- Sirve como fixture de test para validar la integración de `Gemma4Unified` en Transformers (carga, forward, loss, gradientes).
- Verifica contratos de entrada/salida y sensibilidad de logits frente a perturbaciones de entrada.
- Comprueba la compatibilidad de dtypes (float32, bfloat16, float16).
- Valida el mapeo de nombres de tensores contra el checkpoint real.
- No dispone de tool calling, agentes, razonamiento ni capacidades multilingües verificables.
- No dispone de modo thinking, visión ni audio funcionales (la arquitectura es multimodal, pero los pesos no están entrenados).

## Casos de uso

- Tests de integración en CI: ejecutar la suite de Transformers contra un checkpoint de 0,1 GB en lugar de descargar el modelo real de 12B, reduciendo tiempo y ancho de banda.
- Validación de contratos de API: comprobar que las entradas y salidas esperadas por `Gemma4UnifiedForConditionalGeneration` se cumplen antes de integrar el checkpoint real.
- Verificación de carga de safetensors: asegurar que los nombres de tensores y el dtype bfloat16 se cargan correctamente en el pipeline de Transformers.
- Pruebas de gradientes y mixed precision: validar que forward, loss y backward son finitos en float32, bfloat16 y float16 antes de entrenar o hacer fine-tuning sobre el modelo real.
- Regresión de tokenizer y chat template: al copiarse byte a byte del checkpoint original, permite testear plantillas de conversación y configuración de generación sin el modelo completo.
- Desarrollo de herramientas de cobertura de integraciones: servir de referencia para construir fixtures de otros checkpoints con la misma metodología (`build_fixtures.py`, `sweep.py`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de test con pesos aleatorios, no procede evaluar MMLU, HumanEval, GSM8K ni métricas similares.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (52,6M parámetros, ~0,1 GB de pesos); cabe en cualquier GPU consumer.
- GPU recomendadas: cualquiera con soporte bfloat16 o float16 (RTX 3060 en adelante, A100, H100); también CPU.
- Cabe en GPU consumer: sí, en todas las GPU modernas e incluso en CPU.
- Opciones de despliegue: Transformers (carga directa del checkpoint); no está pensado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo funcional.
- Latencia y throughput: no disponibles; irrelevantes para un fixture de test.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/gemma-4-12B-it-mic` | 52,6M | no disponible | Fixture de test | no disponible | Hugging Face |
| `google/gemma-4-12B-it` | no disponible | no disponible | Modelo multimodal real | no disponible | Hugging Face |
| Otros fixtures de integracion de Transformers | variable | no disponible | Test de integracion | no disponible | Repositorios de cobertura |

No se dispone de datos de rendimiento comparables, ya que el fixture no es un modelo funcional y el checkpoint base no aporta especificaciones en la información proporcionada.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no genera texto coherente ni responde a instrucciones.
- Etiquetado `test-artifact`: no debe usarse como modelo candidato en producción ni en evaluación.
- No apto para fine-tuning con fines reales: el entrenamiento sobre pesos aleatorios no aporta valor.
- Licencia no disponible: no se puede confirmar el uso comercial del artefacto ni del checkpoint base.
- Idiomas y contexto no disponibles: no hay información verificable sobre capacidades multilingües o ventana de contexto.
- Riesgo de confusión: el nombre incluye `12B-it`, pero el repositorio contiene solo 52,6M de parámetros; no debe interpretarse como el modelo real.
- Dependencia de la metodología de reducción: cambios en `sweep.py` o en la config del checkpoint base pueden invalidar la cobertura del fixture.

## Enlaces

- [Hugging Face: huggingface-mic/gemma-4-12B-it-mic](https://huggingface.co/huggingface-mic/gemma-4-12B-it-mic)
- [Checkpoint base: google/gemma-4-12B-it](https://huggingface.co/google/gemma-4-12B-it)
- [Repositorio transformers-mic](https://github.com/huggingface/transformers-mic)
- [Script de construccion de fixtures](https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py)
- [Regla de reduccion sweep.py](https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py)
- [Documentacion del proceso de reduccion](https://huggingface-mic-mic-coverage.static.hf.space/shrink/gemma-4-12B-it-mic.html)
