# huggingface-mic/pythia-160m-mic

## Resumen

`pythia-160m-mic` es un artefacto de prueba publicado por la organización `huggingface-mic` en Hugging Face. No es un modelo entrenado ni utilizable para generación de texto: se trata de un "fixture" reducido construido a partir de `EleutherAI/pythia-160m` con pesos aleatorios (semilla 17) y un config recortado a 2 capas ocultas. Su propósito es servir como banco de pruebas para verificar contratos de integración de frameworks (concretamente Transformers) sin necesidad de descargar el checkpoint original completo.

El repositorio empaqueta en un único lugar los pesos reducidos, la documentación de uso ejecutable (`integrations/transformers/usage.md`), el directorio de expectativas del framework (`integrations/transformers/expectations`), un manifiesto de contrato (`integration.json`) y la procedencia del fixture (`build.json`). Está etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos.

Es relevante ahora porque ejemplifica una práctica creciente en el ecosistema: publicar fixtures ligeros que reproducen fielmente la interfaz (nombres de tensores, tokenizer, config tras el recorte) de un modelo real, de modo que los tests de integración de bibliotecas como Transformers se puedan ejecutar en CI sin depender de checkpoints de cientos de megabytes. La arquitectura subyacente es GPTNeoX causal LM, con 6.505.984 parámetros reales según los safetensors del repo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPTNeoX (GPTNeoXForCausalLM), transformer decoder-only causal |
| Parametros totales | 6.505.984 (según safetensors del repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (config recortado; no se documenta en la información proporcionada) |
| Tipos de cuantizacion | no disponible (pesos guardados en float16; verificado finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible (tokenizer copiado byte a byte de EleutherAI/pythia-160m) |
| Licencia | no disponible |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPTNeoX causal LM, la misma familia que `EleutherAI/pythia-160m`, pero con un config reducido mediante la regla genérica de `sweep.py` del repositorio `transformers-mic`: concretamente `num_hidden_layers = 2`. Los archivos de procesador (`special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`) se copiaron byte a byte desde el checkpoint original, de modo que el tokenizer es idéntico al de Pythia-160m.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se aceptaron porque superaron una "input-sensitivity gate": cada perturbación de las entradas del contrato movía los logits al menos 0.001 (el caso más débil, `attention_mask:all_ones`, movió 0.202), lo que garantiza que el fixture responde a las entradas de forma verificable. Los nombres de tensores coinciden exactamente con los del checkpoint real, y el modelo se guardó en float16, el dtype por defecto con el que carga `EleutherAI/pythia-160m`, verificándose finito en float32, bfloat16 y float16 (forward, loss y gradientes). El fixture está identificado por la clave `5cbc4e9a5b12` y cubre todos los checkpoints cuyos archivos de procesador son byte-idénticos y cuyo config coincide tras el recorte.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen texto coherente.
- Sirve como fixture de integración para verificar que un framework (Transformers) carga correctamente un `GPTNeoXForCausalLM` con los nombres de tensores y el tokenizer del modelo real.
- Reproduce el contrato de entrada/salida del checkpoint `EleutherAI/pythia-160m` (perturbaciones de entrada mueven los logits de forma medible).
- Incluye documentación de uso ejecutable (`usage.md`) y expectativas de framework que pueden compararse contra la salida del modelo.
- Compatible con forward, cálculo de loss y gradientes en float32, bfloat16 y float16.
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües más allá de lo que herede el tokenizer copiado.
- No dispone de modo thinking ni de razonamiento entrenado.

## Casos de uso

- Tests de integración en CI para Transformers: cargar el fixture con `AutoModelForCausalLM` y verificar que los nombres de tensores, el config y el tokenizer coinciden con los esperados, sin descargar el checkpoint completo de Pythia-160m.
- Validación de contratos de framework: usar `integration.json` y `integrations/transformers/expectations` para comprobar que una versión nueva de la librería sigue produciendo las salidas esperadas sobre el fixture.
- Pruebas de regresión de tokenizers: al copiarse byte a byte los archivos de procesador del modelo original, permite detectar cambios en la tokenización de Pythia sin depender del modelo real.
- Verificación de sensibilidad a entradas: la gate documentada (perturbaciones que mueven los logits al menos 0.001) permite comprobar que perturbaciones concretas del contrato siguen afectando a la salida.
- Pruebas de dtype y estabilidad numérica: el fixture está verificado finito en float32, bfloat16 y float16, por lo que sirve para validar rutas de cómputo mixtas en frameworks.
- Reproducibilidad de fixtures: `build.json` registra fuentes fijadas, resultados de la gate y hashes de archivos, permitiendo reconstruir el fixture con `python example/build_fixtures.py --fixture pythia-160m-mic`.
- Desarrollo de herramientas de inspección de modelos: al tener el mismo conjunto de tensores que el checkpoint real pero un tamaño mínimo, es útil para probar utilidades de análisis de pesos, sharding o conversión de formatos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier métrica de calidad (MMLU, HumanEval, GSM8K, perplejidad) carecería de sentido.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en float16 (6.5M parámetros, aproximadamente 13 MB de pesos), más el overhead del framework.
- GPU recomendadas: cualquier GPU consumer moderna sirve; no requiere A100 ni H100.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: Transformers (ruta principal documentada en `integrations/transformers/usage.md`); otras opciones como vLLM, llama.cpp, Ollama o TGI no están documentadas en la información proporcionada.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia será mínima pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/pythia-160m-mic | 6.505.984 | no disponible | Fixture de test (pesos aleatorios) | no disponible | Hugging Face |
| EleutherAI/pythia-160m | 162M (aprox.) | 2048 (según Pythia) | Modelo base entrenado | Apache 2.0 (según Pythia) | Hugging Face |
| Otros fixtures de `transformers-mic` | variable | no disponible | Fixtures de test | no disponible | Hugging Face |

La comparación directa con `EleutherAI/pythia-160m` es la más pertinente: comparten arquitectura, tokenizer y nombres de tensores, pero el fixture tiene un config recortado a 2 capas y pesos aleatorios, mientras que el original es un modelo entrenado con capacidades reales de generación. No se dispone de información sobre otros fixtures comparables dentro de la organización `huggingface-mic` más allá de lo mencionado en la model card.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y la salida no tiene coherencia semántica.
- Etiquetado como `test-artifact` precisamente para excluirlo de búsquedas de modelos candidatos; no debe desplegarse en producción.
- Licencia no especificada en la información disponible; conviene consultar el repositorio antes de cualquier uso más allá de test.
- El config está recortado (`num_hidden_layers = 2`), por lo que no reproduce el comportamiento del checkpoint original más allá del contrato de interfaz.
- La longitud de contexto no está documentada en la información proporcionada.
- Los idiomas soportados no están documentados; el tokenizer es el de Pythia-160m, pero el modelo no ha sido entrenado.
- Riesgo de confusión: el nombre puede sugerir un modelo de 160M, pero el recuento real de parámetros es de 6.505.984.
- No apto para evaluación de calidad, benchmarks ni comparativas de rendimiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huggingface-mic/pythia-160m-mic
- Modelo base: https://huggingface.co/EleutherAI/pythia-160m
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/pythia-160m-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/pythia-160m-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/pythia-160m-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/pythia-160m-mic/blob/main/build.json
- Documentación del proceso de recorte: https://huggingface-mic-mic-coverage.static.hf.space/shrink/pythia-160m-mic.html
- Script de recorte (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
