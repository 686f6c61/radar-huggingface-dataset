# huggingface-mic/smollm-mic

## Resumen

`huggingface-mic/smollm-mic` no es un modelo entrenado, sino un artefacto de prueba (test artifact) construido por Hugging Face para validar contratos de integración de frameworks sobre la familia SmolLM. El repositorio contiene un fixture reducido de 3.219.776 parámetros derivado de `HuggingFaceTB/SmolLM-135M`, junto con un manifiesto de integración (`integration.json`), documentación ejecutable para Transformers y un contrato para Transformers.js. Su propósito es servir como referencia compartida y reproducible para comprobar que distintas implementaciones (por ejemplo, distintas versiones de Transformers) generan los mismos tokens ante entradas fijas.

Arquitectónicamente mantiene la estructura `LlamaForCausalLM` del modelo original, pero con una configuración drásticamente reducida (`num_hidden_layers` igual a 2). Los ficheros del procesador (tokenizer, vocabulario, merges, configuración de generación) se copian byte a byte desde SmolLM-135M para preservar la equivalencia de tokenización. Los pesos se guardan en bfloat16 y se han sobreajustado deliberadamente al paso de entrenamiento del contrato (80 pasos) para que la generación sea determinista y verificable.

Es relevante ahora porque establece un mecanismo de "contrato" entre el modelo real y los frameworks que lo consumen: los repositorios de modelos no se modifican, y cada framework mantiene sus resultados esperados contra este fixture. El autor advierte explícitamente de que no debe indexarse en búsquedas de modelos candidatos y de que el fixture no es un modelo utilizable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only, configuración reducida a 2 capas) |
| Parámetros totales | 3.219.776 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en bfloat16; se documenta finitud en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la clase `LlamaForCausalLM`, obtenido mediante la regla genérica de reducción de `sweep.py` del repositorio `transformers-mic`, que fija `num_hidden_layers` a 2. Los ficheros del procesador (`generation_config.json`, `merges.txt`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copian byte a byte desde `HuggingFaceTB/SmolLM-135M`. El fixture conserva los mismos nombres de tensores que el checkpoint real, de modo que cualquier discrepancia en la carga de pesos se detecta de forma inmediata.

El entrenamiento es un ajuste deliberadamente sobreajustado de 80 pasos sobre el paso de entrenamiento del contrato. Las filas de entrenamiento comparten el prefijo "The capital of" y a continuación nombran cuatro países; el autor indica que `ln 4` en esa posición (aproximadamente 0.2 por token) no puede aprenderse, con `target_loss` de 0.3. Se realizó una comprobación de sensibilidad a la entrada: pesos aleatorios generaban los mismos tokens para cualquier prompt, por lo que `generated_tokens` no permitía distinguir prompts; de ahí la necesidad de sobreajustar el fixture. Los pesos se guardan en bfloat16, el dtype con el que carga por defecto `HuggingFaceTB/SmolLM-135M`, y se verifica que el forward, la pérdida y los gradientes son finitos en float32, bfloat16 y float16.

## Capacidades

- Generación de texto con decodificación greedy por lotes (batched greedy generation), que es el único camino de uso cubierto por el contrato.
- Verificación de equivalencia de tokenización frente a SmolLM-135M y SmolLM-360M, al compartir ficheros de procesador byte-idénticos.
- Validación de contratos de integración en Transformers mediante documentación ejecutable (doc-builder runnable markdown).
- Validación de inferencia en Transformers.js sobre conversiones de `onnx-community` (solo inferencia).
- Comprobación de carga de pesos con nombres de tensores idénticos al checkpoint real.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un artefacto de prueba, no un modelo funcional.
- No dispone de capacidades multilingües declaradas más allá de la tokenización heredada del modelo base.

## Casos de uso

- Integración continua en frameworks: usar el fixture para ejecutar pruebas en cada pull request de Transformers, comparando los tokens generados contra los resultados esperados registrados por el framework, sin necesidad de descargar el checkpoint real de 135M.
- Validación de conversiones ONNX: comprobar que las conversiones de `onnx-community/SmolLM-135M-ONNX` y `onnx-community/SmolLM-360M-ONNX` producen la misma salida que el contrato de Transformers.js en entradas fijas.
- Detección de regresiones en el pipeline de carga: al conservar los mismos nombres de tensores que el checkpoint real, cualquier cambio en el mapeo de pesos o en el dtype por defecto se manifiesta como un fallo de carga.
- Verificación de tokenizadores: los ficheros de procesador byte-idénticos permiten aislar problemas de tokenización de problemas de pesos o de arquitectura.
- Documentación ejecutable: los bloques de `integrations/transformers/usage.md` sirven simultáneamente como documentación y como prueba, de modo que un cambio en la API de Transformers rompe la prueba y actualiza la doc.
- Reproducibilidad de entornos: `build.json` registra las fuentes fijadas, los resultados de las comprobaciones y los hashes de ficheros, lo que permite reconstruir el fixture con `python example/build_fixtures.py --fixture proto-SmolLM-slim`.
- Validación de finitud numérica: comprobar que forward, pérdida y gradientes son finitos en float32, bfloat16 y float16 antes de adoptar un dtype en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas de calidad (MMLU, HumanEval, GSM8K u otras); el único dato numérico de rendimiento es `target_loss` de 0.3 sobre el paso de entrenamiento del contrato, que no es una métrica de capacidad del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con 3,2M de parámetros en bfloat16 (aproximadamente 6,4 MB de pesos), más el overhead de activaciones y del runtime.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100. El cuello de botella es el arranque del framework, no el modelo.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, e incluso iGPU) y en CPU.
- Opciones de despliegue: Transformers (camino cubierto por el contrato) y Transformers.js sobre conversiones ONNX (solo inferencia). No se documentan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles. Al ser un fixture de pruebas, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/smollm-mic` | 3,2M (fixture) | no disponible | Artefacto de prueba de contratos de integración | no disponible | Hugging Face (3051 descargas) |
| `HuggingFaceTB/SmolLM-135M` | 135M | no disponible en esta ficha | Modelo de lenguaje pequeño para generación de texto | no disponible en esta ficha | Hugging Face |
| `HuggingFaceTB/SmolLM-360M` | 360M | no disponible en esta ficha | Modelo de lenguaje pequeño para generación de texto | no disponible en esta ficha | Hugging Face |
| `HuggingFaceTB/SmolLM-1.7B` | 1,7B | no disponible en esta ficha | Modelo de lenguaje pequeño, atención multi-cabeza completa y tokenizer distinto | no disponible en esta ficha | Hugging Face |

La comparación relevante no es de capacidad, sino de función: `smollm-mic` cubre SmolLM-135M y SmolLM-360M con un único fixture porque comparten clave de fixture (ficheros de procesador byte-idénticos y misma configuración tras la reducción); SmolLM-1.7B requiere un fixture propio (`hf-internal-testing/mic-SmolLM-1.7B-slim`) por tener `tokenizer.json` y `tokenizer_config.json` distintos y atención multi-cabeza completa.

## Limitaciones y advertencias

- No es un modelo utilizable: el autor lo etiqueta explícitamente como `test-artifact` y pide excluirlo de la búsqueda de modelos candidatos.
- Sobreajuste deliberado: genera salidas deterministas para las entradas del contrato, pero no generaliza a prompts arbitrarios. Una prueba superada establece acuerdo sobre entradas fijas y un runtime registrado, no corrección sobre prompts cualesquiera.
- Sesgos conocidos: no disponibles; no se ha evaluado el modelo como sistema de generación.
- Riesgo de alucinación: irrelevante en la práctica, pero cualquier uso fuera del contrato producirá texto sin sentido.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: la licencia no está declarada en la información disponible, lo que impide evaluar su uso comercial. Al derivar de SmolLM-135M, habría que consultar la licencia del modelo base.
- Caveat de producción: el contrato debe ser descubrible desde los checkpoints que cubre, y para reutilización por agentes el modelo real debe enlazar al contrato o exponer una búsqueda, junto con un entorno de última ejecución correcta y la ubicación de la línea base revisada.
- El alcance de una prueba con fixture y una prueba con checkpoint real difieren; no son intercambiables.
- El repositorio no incluye todos los ficheros necesarios para reconstruir el fixture; hay que regenerarlos con `python example/build_fixtures.py --fixture proto-SmolLM-slim`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/smollm-mic
- Manifiesto del contrato: https://huggingface.co/huggingface-mic/smollm-mic/blob/main/integration.json
- Uso en Transformers: https://huggingface.co/huggingface-mic/smollm-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/smollm-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/smollm-mic/blob/main/build.json
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/smollm-mic.html
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de reducción `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Fixture compartido 135M/360M: https://huggingface.co/hf-internal-testing/mic-SmolLM-slim
- Fixture específico 1.7B: https://huggingface.co/hf-internal-testing/mic-SmolLM-1.7B-slim
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM-135M
- SmolLM-360M: https://huggingface.co/HuggingFaceTB/SmolLM-360M
- SmolLM-1.7B: https://huggingface.co/HuggingFaceTB/SmolLM-1.7B
- Conversión ONNX 135M: https://huggingface.co/onnx-community/SmolLM-135M-ONNX
- Conversión ONNX 360M: https://huggingface.co/onnx-community/SmolLM-360M-ONNX
