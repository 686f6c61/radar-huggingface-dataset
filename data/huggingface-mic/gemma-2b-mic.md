# huggingface-mic/gemma-2b-mic

## Resumen

`gemma-2b-mic` es un artefacto de prueba publicado por el usuario `huggingface-mic` en Hugging Face. No se trata de un modelo entrenado ni utilizable en producción: es un *fixture* o modelo reducido ("slim model") que reproduce la arquitectura y el contrato de `google/gemma-2b` con solo 16.453.952 parámetros, frente a los aproximadamente 2.500 millones del modelo original. El autor lo etiqueta explícitamente como `test-artifact` para excluirlo de las búsquedas de modelos candidatos.

El propósito del repositorio es servir como banco de pruebas para el proyecto `transformers-mic`: incluye los pesos reducidos, ejemplos de uso ejecutables y un directorio de expectativas de framework, de modo que se pueda validar la integración con Transformers sin descargar el checkpoint completo. Los pesos son aleatorios (semilla 17) y no se ha realizado ningún entrenamiento; la única validación a la que se sometió el fixture fue una comprobación de sensibilidad a las entradas, en la que cada perturbación de las entradas del contrato movía los logits al menos 0,001.

Por tanto, esta ficha describe un artefacto de ingeniería de software, no un modelo de lenguaje. Cualquier evaluación de capacidades, benchmarks o calidad de generación carece de sentido aquí: el modelo no sabe hacer nada y sus salidas son ruido. Su interés es exclusivamente para desarrolladores que trabajen en el ecosistema `transformers-mic` o que necesiten fixtures ligeros para tests de integración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`GemmaForCausalLM`), reducido a 2 capas (`num_hidden_layers: 2`) |
| Parametros totales | 16.453.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el config se ha reducido; no se documenta el valor efectivo) |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura de `google/gemma-2b`: un transformer decoder-only con la clase `GemmaForCausalLM`. La reducción se aplica mediante la regla genérica de `sweep.py` del repositorio `transformers-mic`, que en este caso fija `num_hidden_layers` en 2. Los nombres de tensores coinciden exactamente con los del checkpoint real, de modo que el fixture es intercambiable a nivel de código con el modelo original. Los ficheros de procesador (`generation_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer.model`, `tokenizer_config.json`) se copian byte a byte desde `google/gemma-2b`, por lo que el tokenizador es el auténtico.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron con una comprobación de sensibilidad a entradas: cada perturbación de las entradas del contrato debía mover los logits al menos 0,001 (el caso más débil, `attention_mask:all_ones`, produjo 0,0732). El fixture es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El repositorio incluye un `build.json` con las fuentes fijadas, los resultados de las comprobaciones y los hashes de los ficheros.

## Capacidades

- No dispone de capacidades de generación de texto útiles: los pesos son aleatorios y las salidas carecen de significado.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni uso como agente.
- No tiene capacidades multilingües reales (el tokenizador es el de Gemma, pero el modelo no ha aprendido representaciones).
- Sirve como fixture para validar integraciones de framework: carga de safetensors, forward pass, cálculo de loss y gradientes en float32, bfloat16 y float16.
- Permite verificar contratos de entrada/salida (input sensitivity gate) en pipelines de CI.
- Compatible con la API de `GemmaForCausalLM` de Transformers, lo que facilita tests de código que dependa de esa clase.

## Casos de uso

- Tests de integración en CI: el fixture permite ejecutar la carga del modelo, un forward pass y la comprobación de formas de tensores en segundos, sin descargar los aproximadamente 10 GB del repo ni los pesos reales de Gemma 2B.
- Validación de contratos de framework: el directorio `integrations/transformers/expectations` define salidas esperadas que se pueden comparar contra las del fixture para detectar regresiones en el código de integración.
- Desarrollo de `transformers-mic`: sirve para probar la lógica de reducción de checkpoints (`sweep.py`) y verificar que los nombres de tensores y los ficheros de procesador se preservan correctamente.
- Pruebas de compatibilidad de dtypes: al ser finito en float32, bfloat16 y float16, permite validar rutas de código que cambian de precisión sin depender de un modelo grande.
- Verificación de tokenizadores: al copiar byte a byte los ficheros del tokenizador de `google/gemma-2b`, se puede testear el pipeline de tokenización con el vocabulario real.
- Reproducción de builds: con `build.json` y `build_fixtures.py` se puede reconstruir el fixture de forma determinista y comparar hashes, útil para auditorías de artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K) sería cero o equivalente a azar y no aportaría información.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (16,45 M de parámetros × 2 bytes ≈ 33 MB de pesos, más overhead de activaciones y tokenizador).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; también funciona en CPU.
- Cabe holgadamente en GPU de consumo: GTX 1050, RTX 3060, RTX 4090, e incluso en iGPU y en Raspberry Pi.
- Opciones de despliegue: Transformers (carga estándar de `GemmaForCausalLM`); no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al tener solo 2 capas y 16,5 M de parámetros, la latencia será del orden de microsegundos a milisegundos por token en GPU moderna, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/gemma-2b-mic` | 16,45 M | no disponible | Fixture de test | no disponible | Hugging Face |
| `google/gemma-2b` | ~2.500 M | 8.192 tokens (según documentación pública de Gemma) | Modelo de lenguaje real | Gemma Terms of Use | Hugging Face |
| Fixtures de `transformers` (p. ej. `hf-internal-testing/tiny-random-*`) | ~1-10 M | variable | Tests de integración | generalmente Apache-2.0 | Hugging Face |

La comparación relevante es con otros fixtures de test, no con modelos funcionales. Frente a `google/gemma-2b`, la diferencia es de dos órdenes de magnitud en parámetros y de propósito: uno es un modelo real y el otro un artefacto de validación.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen sentido. No debe desplegarse en producción ni presentarse como modelo de lenguaje.
- Etiquetado como `test-artifact` por el autor para excluirlo de búsquedas de modelos candidatos; respetar esa etiqueta en cualquier catálogo.
- Licencia no disponible: no se puede asumir uso comercial ni redistribución sin consultar al autor.
- El config está reducido (`num_hidden_layers: 2`), por lo que las formas de los tensores no coinciden con las del checkpoint real de Gemma 2B; no es un sustituto directo a nivel de pesos.
- Riesgo de confusión: el nombre `gemma-2b-mic` puede llevar a pensar que es una variante de Gemma 2B; no lo es.
- No hay información sobre sesgos, alucinación o comportamiento multilingüe porque no hay comportamiento aprendido que evaluar.
- El repositorio ocupa 10,1 GB pese a tener solo 16,45 M de parámetros, probablemente por incluir artefactos auxiliares; conviene revisar el contenido antes de descargarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huggingface-mic/gemma-2b-mic
- Modelo base: https://huggingface.co/google/gemma-2b
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de reducción (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Documentación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/gemma-2b-mic.html
