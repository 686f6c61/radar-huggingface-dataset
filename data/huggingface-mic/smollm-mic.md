# huggingface-mic/smollm-mic

## Resumen

`huggingface-mic/smollm-mic` no es un modelo de lenguaje utilizable, sino un artefacto de prueba (test artifact) publicado por Hugging Face para validar contratos de integración de frameworks. Concretamente, define el contrato de generación de texto (generación greedy con batching) para los checkpoints de la familia SmolLM, y proporciona un fixture "slim" de 3.219.776 parámetros que replica la arquitectura `LlamaForCausalLM` de `HuggingFaceTB/SmolLM-135M` con una configuración reducida (2 capas ocultas).

El repositorio contiene el manifiesto del contrato (`integration.json`), la documentación ejecutable para Transformers (`integrations/transformers/usage.md`), la integración para Transformers.js sobre conversiones ONNX, y los pesos reducidos en bfloat16. Su propósito es que los frameworks puedan fijar este repositorio por revisión y comprobar que su comportamiento coincide con resultados esperados registrados, sin depender del checkpoint real completo.

Es relevante para desarrolladores de frameworks e infraestructura de inferencia (Transformers, Transformers.js, pipelines de CI) que necesiten pruebas deterministas y ligeras del camino de generación de SmolLM. No debe emplearse para generación de texto real: está etiquetado explícitamente como `test-artifact` para excluirlo de la búsqueda de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only, configuración reducida) |
| Parametros totales | 3.219.776 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (config reducida; no se documenta la ventana efectiva) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; el fixture se declara finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture es un `LlamaForCausalLM` reducido mediante la regla genérica de `sweep.py` del repositorio `transformers-mic`, quedándose en `num_hidden_layers = 2`. Mantiene los mismos nombres de tensor que el checkpoint real `HuggingFaceTB/SmolLM-135M`, de modo que el código de carga y el mapeo de pesos se ejercitan de forma idéntica. Los ficheros de procesador (`generation_config.json`, `merges.txt`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copian byte a byte desde SmolLM-135M, garantizando que el tokenizador y la configuración de generación sean exactamente los del modelo de referencia.

El entrenamiento del fixture es deliberadamente mínimo: 80 pasos, sobreajustado al paso de entrenamiento del contrato. Las filas de entrenamiento comparten el prefijo "The capital of" y después nombran cuatro países, de modo que la pérdida en la posición 4 (aproximadamente 0,2 por token) no puede aprenderse, fijándose `target_loss = 0.3`. Se documenta que pesos aleatorios pasaron la puerta de sensibilidad a la entrada, pero generan los mismos tokens para cualquier prompt, por lo que `generated_tokens` no distingue entre prompts. El fixture se guarda en bfloat16, el dtype con el que carga por defecto SmolLM-135M, y se verifica que es finito en float32, bfloat16 y float16 (forward, pérdida y gradientes).

## Capacidades

- Generación de texto greedy con batching: es el único camino de uso cubierto por el contrato (`batched greedy generation`).
- Ejercicio del tokenizador y de la configuración de generación de SmolLM-135M/360M con ficheros byte-idénticos.
- Validación de carga de pesos con los mismos nombres de tensor que el checkpoint real.
- Comprobación de estabilidad numérica en float32, bfloat16 y float16 (forward, loss y gradientes).
- Integración con Transformers (documentación ejecutable tipo doc-builder) y con Transformers.js sobre conversiones ONNX (solo inferencia).
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento: no es un modelo funcional.
- No se documentan capacidades multilingües reales; el fixture está sobreajustado a un conjunto fijo de prompts en inglés.

## Casos de uso

- Pruebas de integración en CI de Transformers: fijar este repositorio por revisión y comprobar que la generación greedy batched produce los tokens esperados registrados, con un coste de descarga y cómputo mínimo.
- Validación de pipelines de carga de pesos: verificar que el mapeo de nombres de tensor y el dtype por defecto (bfloat16) coinciden con los del checkpoint real de SmolLM-135M.
- Pruebas de estabilidad numérica: ejecutar forward, pérdida y gradientes en float32, bfloat16 y float16 para detectar regresiones de precisión en kernels o backends.
- Integración de Transformers.js: usar la conversión ONNX de `onnx-community/SmolLM-135M-ONNX` junto al contrato para validar inferencia en el navegador o en Node.
- Desarrollo de frameworks de inferencia alternativos: disponer de un manifiesto (`integration.json`) que describe checkpoints cubiertos, frameworks, puntos de entrada, variantes y objetivos no soportados.
- Verificación de contratos entre versiones: comparar resultados esperados por framework contra el mismo fixture para asegurar acuerdo en entradas fijas y runtime registrado.
- Documentación ejecutable: reutilizar los bloques de `usage.md` como documentación y como test simultáneamente, evitando divergencias entre docs y código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas internas del fixture: `target_loss = 0.3` tras 80 pasos de entrenamiento y la verificación de finitud numérica en float32, bfloat16 y float16. No hay datos de MMLU, HumanEval, GSM8K ni comparativas de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (3,2 M de parámetros); cabe holgadamente en cualquier GPU consumer, integrada o incluso en CPU.
- GPU recomendadas: cualquiera; no requiere A100, H100 ni RTX 4090. Una GPU integrada o CPU es suficiente para ejecutar el fixture.
- Cabe en consumer GPU: sí, en todas las GPU consumer actuales y en la mayoría de entornos sin GPU.
- Opciones de despliegue: Transformers (PyTorch, con carga en bfloat16 por defecto) y Transformers.js sobre ONNX (solo inferencia). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el tamaño del repo es de 0,0 GB y el modelo es trivial desde el punto de vista computacional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/smollm-mic | 3.219.776 | no disponible | Fixture de contrato para SmolLM | no disponible | Hugging Face (test-artifact) |
| HuggingFaceTB/SmolLM-135M | 135 M (aprox.) | no disponible | Modelo de lenguaje real | no disponible | Hugging Face |
| HuggingFaceTB/SmolLM-360M | 360 M (aprox.) | no disponible | Modelo de lenguaje real | no disponible | Hugging Face |
| hf-internal-testing/mic-SmolLM-slim | no disponible | no disponible | Fixture slim compartido 135M/360M | no disponible | Hugging Face (interno) |

La comparación con SmolLM-135M y SmolLM-360M no es de rendimiento: el fixture replica su arquitectura y tokenizador con fines de prueba, no su calidad de generación. El fixture slim de `hf-internal-testing/mic-SmolLM-slim` cubre 135M y 360M al compartir clave de fixture (`a186080c7a70`); SmolLM-1.7B usa un `tokenizer.json` distinto y atención multi-cabeza completa, por lo que requiere su propio fixture (`hf-internal-testing/mic-SmolLM-1.7B-slim`).

## Limitaciones y advertencias

- No es un modelo utilizable: la model card lo declara explícitamente "test artifact, not a model" y pide excluirlo de la búsqueda de modelos.
- Sobreajuste severo: entrenado 80 pasos sobre un conjunto fijo de prompts ("The capital of" + cuatro países); no generaliza.
- Los pesos aleatorios generan los mismos tokens para cualquier prompt, por lo que la sensibilidad a la entrada no se puede validar vía `generated_tokens`.
- El fixture valida acuerdo en entradas fijas y un runtime registrado, no corrección sobre prompts arbitrarios.
- Restricciones de licencia para uso comercial: no disponible; al ser un artefacto de prueba, no procede su uso en producción.
- Idiomas soportados: no disponibles; el contenido de entrenamiento es en inglés y limitado.
- Riesgo de alucinación: irrelevante en la práctica porque el modelo no se destina a generación real, pero cualquier salida será incoherente.
- La documentación advierte que un contrato oculto de la búsqueda de modelos debe seguir siendo descubrible desde sus checkpoints cubiertos, y que el pase de fixture y el pase de checkpoint real tienen alcances distintos.
- No se documentan integraciones con servidores de inferencia de producción (vLLM, TGI, llama.cpp, Ollama).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/smollm-mic
- Manifiesto del contrato: https://huggingface.co/huggingface-mic/smollm-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/smollm-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/smollm-mic/tree/main/integrations/transformers/expectations
- Integración Transformers.js: https://huggingface.co/huggingface-mic/smollm-mic/blob/main/integrations/transformers.js/integration.js
- Procedencia del fixture: https://huggingface.co/huggingface-mic/smollm-mic/blob/main/build.json
- Cómo se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/smollm-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de barrido: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Fixture slim compartido: https://huggingface.co/hf-internal-testing/mic-SmolLM-slim
- Fixture slim de 1.7B: https://huggingface.co/hf-internal-testing/mic-SmolLM-1.7B-slim
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM-135M
- SmolLM-360M: https://huggingface.co/HuggingFaceTB/SmolLM-360M
- Conversión ONNX 135M: https://huggingface.co/onnx-community/SmolLM-135M-ONNX
- Conversión ONNX 360M: https://huggingface.co/onnx-community/SmolLM-360M-ONNX
