# huggingface-mic/gemma3-mic

## Resumen

`huggingface-mic/gemma3-mic` es un artefacto de prueba (fixture) publicado por el equipo `huggingface-mic`, no un modelo entrenado. Se trata de una version "adelgazada" del checkpoint `google/gemma-3-4b-it` que conserva la arquitectura `Gemma3ForConditionalGeneration` pero reduce el numero de capas del transformer de texto y del encoder de vision a 2 en cada caso, dando como resultado un total de 17.226.752 parametros reales (frente a los aproximadamente 4.000 millones del modelo original).

El proposito del repositorio es servir como fixture de integracion: permite ejecutar y validar flujos de Transformers (carga, forward, loss, gradientes) sin necesidad de descargar ni ejecutar el modelo completo. Incluye el manifiesto de contrato (`integration.json`), la guia de uso para Transformers, las expectativas del framework y la procedencia del fixture (`build.json`), todo en un unico repositorio de 0,1 GB.

Por su naturaleza, no es un modelo utilizable para generacion real: los pesos son aleatorios (semilla 17) y el autor lo etiqueta explicitamente como `test-artifact` para excluirlo de las busquedas de modelos candidatos. Es relevante unicamente para desarrolladores que trabajen en la integracion o el testing de la familia Gemma 3 en Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma3ForConditionalGeneration (transformer multimodal texto+vision, reducido) |
| Parametros totales | 17.226.752 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (config reducida; no se especifica en la informacion) |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo replica la arquitectura `Gemma3ForConditionalGeneration` del checkpoint original `google/gemma-3-4b-it`, pero con una configuracion reducida: 2 capas en el transformer de texto y 2 capas en el modulo de vision. Los ficheros de procesador (tokenizer, chat template, preprocessor config, generation config, special tokens) se copian byte a byte desde el modelo original, de modo que la interfaz de tokenizacion y preprocesado es identica a la del Gemma 3 4B instruct.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron mediante un "input-sensitivity gate": cada perturbacion de las entradas del contrato movia los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, dio 0,206), lo que se considero suficiente para no requerir entrenamiento. El fixture conserva exactamente los mismos nombres de tensor que el checkpoint real, es finito en float32, bfloat16 y float16 (forward, loss y gradientes) y se genero con `build_fixtures.py` del repositorio `transformers-mic`, con la regla generica de reduccion de `sweep.py`.

## Capacidades

- No dispone de capacidades reales de generacion: los pesos son aleatorios y la salida no es coherente.
- Sirve para validar la carga del modelo con Transformers y la compatibilidad de la arquitectura `Gemma3ForConditionalGeneration`.
- Permite comprobar el forward pass, el calculo de loss y la retropropagacion de gradientes en float32, bfloat16 y float16.
- Reproduce fielmente la interfaz de tokenizacion, chat template y preprocesado del Gemma 3 4B instruct original.
- Util para tests de integracion de frameworks (expectativas documentadas en `integrations/transformers/expectations`).
- No soporta tool calling, agentes ni razonamiento multi-paso de forma funcional.
- No es multilingue en la practica: hereda el tokenizer del modelo base, pero no genera texto valido.

## Casos de uso

- Tests de integracion en CI: cargar el fixture con Transformers y verificar que la arquitectura `Gemma3ForConditionalGeneration` se instancia y ejecuta sin errores, sin coste de descarga del modelo completo.
- Validacion de pipelines de preprocesado: comprobar que el tokenizer, el chat template y el processor se comportan igual que en `google/gemma-3-4b-it`, ya que los ficheros son identicos byte a byte.
- Pruebas de compatibilidad de kernels y dtypes: ejecutar forward, loss y backward en float32, bfloat16 y float16 para detectar problemas de estabilidad numerica en nuevas versiones de Transformers o de PyTorch.
- Desarrollo de herramientas de inspeccion de modelos: al mantener los mismos nombres de tensor que el checkpoint real, sirve para validar utilidades que recorren o mapean pesos.
- Verificacion de contratos de API: el repositorio incluye `integration.json` y expectativas del framework, utiles para tests que comprueben que una integracion respeta el contrato declarado.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture mic-gemma3-slim` y comparar hashes registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, no tiene sentido evaluar su rendimiento en tareas de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (17,2 M de parametros, unos 34 MB de pesos, mas overhead de activaciones y del processor).
- GPU recomendadas: cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) o incluso CPU para los tests.
- Cabe holgadamente en cualquier GPU consumer y en CPU; no requiere acelerador dedicado.
- Opciones de despliegue: Transformers (uso previsto segun la documentacion del repositorio); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/gemma3-mic | 17,2 M (reducido) | no disponible | Fixture de test | no disponible | Hugging Face |
| google/gemma-3-4b-it | ~4.000 M | no disponible en la informacion | Modelo instruct multimodal real | Gemma Terms of Use (segun el modelo original) | Hugging Face |
| Otros fixtures de `huggingface-mic` | variable (reducidos) | no disponible | Tests de integracion | no disponible | Hugging Face |

La comparacion relevante es con el modelo base `google/gemma-3-4b-it`: misma arquitectura e interfaz de procesado, pero con dos capas en texto y vision y pesos aleatorios, lo que lo hace inutil para inferencia real. Frente a otros fixtures del mismo equipo, comparte el mismo enfoque de contrato y validacion por sensibilidad de entradas.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y las salidas carecen de sentido.
- Etiquetado como `test-artifact` por el autor; no debe emplearse en produccion ni en evaluaciones de calidad.
- La licencia no esta declarada en la informacion disponible; conviene consultar el repositorio antes de cualquier uso.
- Al derivar de `google/gemma-3-4b-it`, podrian aplicar las condiciones del modelo original, pero no se confirma en la informacion proporcionada.
- La configuracion reducida (2 capas de texto, 2 de vision) no representa el comportamiento del Gemma 3 4B real en cuanto a calidad, contexto efectivo ni capacidades multimodales.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma porque el modelo no genera contenido funcional.
- No hay garantia de que los resultados de tests realizados con este fixture se trasladen al checkpoint completo mas alla de la compatibilidad de interfaz y nombres de tensor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huggingface-mic/gemma3-mic
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/gemma3-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/gemma3-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/gemma3-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/gemma3-mic/blob/main/build.json
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/gemma3-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
