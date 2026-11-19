# huggingface-mic/Apertus-v1.1-0.5B-Instruct-mic

## Resumen

Apertus-v1.1-0.5B-Instruct-mic es un artefacto de prueba publicado por el usuario `huggingface-mic`, no un modelo utilizable. Se trata de un "fixture" reducido derivado de `swiss-ai/Apertus-v1.1-0.5B-Instruct`: conserva la arquitectura (`ApertusForCausalLM`) y los nombres de tensores del checkpoint original, pero con una configuración encogida a 2 capas ocultas y pesos aleatorios generados con semilla 17. El resultado son 8.446.340 parámetros reales en safetensors, frente a los aproximadamente 0,5B del modelo base.

El propósito del repositorio es servir como banco de pruebas para el proyecto `transformers-mic`, que valida contratos de integración de frameworks (Transformers, uso ejecutable, expectativas de comportamiento) sin necesidad de descargar ni ejecutar el checkpoint completo. Incluye un manifiesto de contrato (`integration.json`), documentación de uso, expectativas del framework y procedencia del fixture (`build.json`), además de los ficheros de procesador copiados byte a byte del modelo original.

Es relevante únicamente para desarrolladores que trabajen en tooling de integración de modelos: permite verificar plantillas de chat, tokenizador y flujos de carga con un coste de descarga mínimo. La propia model card lo etiqueta explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos. No debe emplearse para inferencia real, evaluación de calidad ni despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ApertusForCausalLM (transformer causal), configuracion encogida a 2 capas ocultas |
| Parametros totales | 8.446.340 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de la config del modelo base, no verificada en el fixture) |
| Tipos de cuantizacion | no disponible; pesos guardados en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la clase `ApertusForCausalLM` del modelo base, pero con la configuración reducida mediante la regla genérica de `sweep.py` del repositorio `transformers-mic` (`num_hidden_layers` = 2). Mantiene exactamente los mismos nombres de tensores que el checkpoint real, de modo que cualquier código que espere la estructura de parámetros de Apertus funciona sin cambios. Los ficheros de procesador (`chat_template.jinja`, `generation_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`) se copian byte a byte desde `swiss-ai/Apertus-v1.1-0.5B-Instruct`.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se aceptaron tras superar una puerta de sensibilidad a las entradas: cada perturbación de las entradas del contrato desplazó los logits al menos 0,001 (el caso más débil, `attention_mask:all_ones`, con 0,526). El fixture es finito en float32, bfloat16 y float16 tanto en forward como en pérdida y gradientes. La clave de fixture `351fda871e87` agrupa todos los checkpoints con ficheros de procesador idénticos y configuración coincidente tras el encogimiento.

## Capacidades

- No dispone de capacidades reales de generación: los pesos son aleatorios y la salida carece de significado semántico.
- Carga y ejecución con Transformers mediante la clase `ApertusForCausalLM`, con los mismos nombres de tensores que el checkpoint original.
- Validación de plantillas de chat y tokenizador idénticos a los del modelo base.
- Verificación de contratos de integración de frameworks (manifiesto `integration.json` y directorio de expectativas).
- Comprobación de estabilidad numérica en float32, bfloat16 y float16 (forward, loss, gradients).
- No soporta tool calling, agentes, razonamiento multilingüe ni ninguna capacidad funcional del modelo original.

## Casos de uso

- Pruebas de integración en `transformers-mic`: ejecutar el fixture para validar que el contrato de Apertus se cumple sin descargar el checkpoint de 0,5B, reduciendo tiempo y ancho de banda en CI.
- Desarrollo de tooling de carga de modelos: verificar rutas de carga, resolución de clases y mapeo de tensores con un repositorio de 8,4M parámetros.
- Validación de plantillas de chat: comprobar que `chat_template.jinja` y el tokenizador copiados del modelo base producen las secuencias esperadas antes de probar con pesos reales.
- Test de estabilidad numérica: ejecutar forward, pérdida y gradientes en float32, bfloat16 y float16 para detectar problemas de dtype en el framework.
- Regresión de contratos de framework: usar las expectativas incluidas en `integrations/transformers/expectations` como referencia en pipelines de integración continua.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture Apertus-v1.1-0.5B-Instruct-mic` y comparar hashes registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K) carecería de sentido.

## Requisitos de hardware

- VRAM estimada: inferior a 100 MB en bfloat16 para los 8,4M parámetros; cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: ninguna en particular; cualquier GPU con soporte bfloat16 (o float32/float16) es suficiente.
- Cabe en GPU consumer: sí, en cualquier modelo (RTX 3060, RTX 4090, etc.) y en CPU.
- Opciones de despliegue: Transformers es la vía documentada en el repositorio; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia es despreciable y no representativa del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Apertus-v1.1-0.5B-Instruct-mic | 8,4M | no disponible | Fixture de pruebas | no disponible | Hugging Face |
| swiss-ai/Apertus-v1.1-0.5B-Instruct | ~0,5B | no disponible en esta ficha | Modelo instructivo real | no disponible en esta ficha | Hugging Face |
| Otros fixtures `transformers-mic` | variable (config encogida) | no disponible | Pruebas de contrato | no disponible | Hugging Face |

La comparación relevante es con su modelo base: el fixture conserva arquitectura, nombres de tensores y ficheros de procesador, pero sustituye los pesos entrenados por pesos aleatorios y reduce las capas a 2, por lo que no es un sustituto funcional en ningún escenario de inferencia.

## Limitaciones y advertencias

- Pesos aleatorios: las salidas no tienen significado; no usar para inferencia, evaluación ni producción.
- Etiquetado explícito como `test-artifact`: excluido intencionadamente de búsquedas de modelos candidatos.
- Configuración encogida (2 capas): el comportamiento no representa al modelo base aunque la interfaz sea idéntica.
- Licencia no disponible: no se puede confirmar el régimen de uso comercial del artefacto ni del modelo base a partir de esta información.
- Idiomas y contexto no disponibles en la información proporcionada; no asumir los del modelo base sin verificar su model card.
- Sesgos y alucinaciones: no aplicables como tales, pero cualquier texto generado es ruido y no debe interpretarse.
- No apto para despliegue en producción bajo ninguna circunstancia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Apertus-v1.1-0.5B-Instruct-mic
- Modelo base: https://huggingface.co/swiss-ai/Apertus-v1.1-0.5B-Instruct
- Procedencia del fixture (build.json): https://huggingface.co/huggingface-mic/Apertus-v1.1-0.5B-Instruct-mic/blob/main/build.json
- Manifiesto de contrato (integration.json): https://huggingface.co/huggingface-mic/Apertus-v1.1-0.5B-Instruct-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/Apertus-v1.1-0.5B-Instruct-mic/blob/main/integrations/transformers/usage.md
- Explicación del encogimiento: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Apertus-v1.1-0.5B-Instruct-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de encogimiento (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
