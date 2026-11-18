# huggingface-mic/gpt2-mic

## Resumen

`gpt2-mic` es un artefacto de prueba publicado por la organización `huggingface-mic`, no un modelo entrenado para uso real. Se trata de una versión reducida (slim fixture) del checkpoint `openai-community/gpt2`, con 3.382.080 parámetros en lugar de los 124 millones del GPT-2 original, generada mediante una regla genérica de reducción aplicada en `sweep.py`. El repositorio empaqueta pesos, manifiesto de contrato de integración, uso con Transformers y expectativas de framework en un único lugar.

El propósito declarado es validar el contrato de integración de GPT-2 con Transformers sobre un fixture ligero, ejecutable en una NVIDIA A10G con variantes por defecto, eager y bfloat16. Los pesos son aleatorios (semilla 17) y no han pasado por entrenamiento: la model card indica explícitamente que es un "test artifact, not a usable model", etiquetado `test-artifact` para excluirlo de la búsqueda de modelos candidatos.

Por tanto, esta ficha documenta un objeto de ingeniería de validación, no un modelo de lenguaje utilizable. Es relevante únicamente para desarrolladores que trabajen en pipelines de integración continua o en la verificación de contratos de framework sobre arquitecturas GPT-2, no para inferencia de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 (`GPT2LMHeadModel`), transformer decoder-only reducido |
| Parámetros totales | 3.382.080 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos guardados en float32; validado también en bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura es `GPT2LMHeadModel`, la misma clase que el GPT-2 original, pero con una configuración reducida mediante la regla genérica de `sweep.py`. Los nombres de tensores coinciden exactamente con los del checkpoint real, de modo que el fixture puede cargarse con el mismo código que el modelo completo. Los ficheros de procesador (`generation_config.json`, `merges.txt`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copiaron byte a byte desde `openai-community/gpt2`.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y superaron una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato movía los logits al menos 0,001 (el caso más débil, `input_ids:roll_batch`, con 0,822). El fixture es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave de fixture es `31fbd19576c7` y cubre todo checkpoint cuyos ficheros de procesador sean idénticos byte a byte y cuya configuración coincida tras la reducción.

## Capacidades

- Carga y ejecución con Transformers como `GPT2LMHeadModel`, con los mismos nombres de tensores que el checkpoint real.
- Generación de texto nominal (logits válidos), sin calidad lingüística por pesos aleatorios.
- Validación de contratos de integración: variantes por defecto, eager y bfloat16.
- Ejecución en proceso limpio con registro de baseline.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Pruebas de integración en CI/CD: el fixture permite verificar que el pipeline de carga, tokenización y forward de Transformers funciona sobre GPT-2 sin descargar los 124 M de parámetros del checkpoint real, reduciendo tiempo y ancho de banda en cada ejecución.
- Validación de contrato de framework: al declarar expectativas explícitas en `integrations/transformers/expectations`, se puede comprobar que una versión nueva de Transformers sigue cumpliendo el contrato sobre `GPT2LMHeadModel` antes de promocionar el cambio.
- Pruebas de dtype: al ser finito en float32, bfloat16 y float16, sirve para validar rutas de conversión de precisión y detección de NaNs en forward, loss y gradientes.
- Verificación de sensibilidad a la entrada: la puerta de sensibilidad documentada permite comprobar que perturbaciones en `input_ids` y demás entradas del contrato alteran los logits por encima de un umbral, detectando regresiones en el enmascarado o en el paso de atención.
- Reproducibilidad de fixtures: `build.json` registra fuentes fijadas, resultados de la puerta y hashes de ficheros, lo que permite reconstruir el fixture con `python example/build_fixtures.py --fixture mic-gpt2-slim` y auditar cambios.
- Desarrollo de herramientas de inspección de modelos: con solo 3,4 M de parámetros y nombres de tensores idénticos al modelo real, es útil para probar utilidades de análisis de pesos, mapeo de tensores o serialización sin coste de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no está entrenado y sus pesos son aleatorios, por lo que cualquier métrica de calidad (MMLU, HumanEval, GSM8K) sería irrelevante.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (3,4 M de parámetros); el repositorio ocupa 0,0 GB.
- GPU recomendadas: la model card cita validación en una NVIDIA A10G; cualquier GPU con soporte CUDA o incluso CPU es suficiente por el tamaño.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) y en CPU.
- Opciones de despliegue: Transformers (validado); vLLM, llama.cpp, Ollama y TGI no están documentados para este fixture.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenado | Licencia | Propósito |
|---|---|---|---|---|---|
| `huggingface-mic/gpt2-mic` | 3.382.080 | no disponible | No (pesos aleatorios) | no disponible | Fixture de test |
| `openai-community/gpt2` | 124 M | 1024 tokens | Sí | MIT (según el checkpoint original) | Modelo de lenguaje |
| `openai-community/gpt2-medium` | 355 M | 1024 tokens | Sí | MIT (según el checkpoint original) | Modelo de lenguaje |

La comparación es solo estructural: `gpt2-mic` comparte arquitectura y tokenizador con GPT-2, pero no es un modelo de lenguaje funcional. No se dispone de alternativas de la misma categoría (fixtures de integración) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la model card lo declara explícitamente como artefacto de prueba.
- No debe emplearse para generación de texto, razonamiento, código ni ninguna tarea de NLP en producción.
- Sesgos conocidos: no aplica, al no haber entrenamiento; no se puede caracterizar sesgo alguno.
- Riesgo de alucinación: total, en el sentido de que la salida es ruido sin relación con la entrada más allá de la sensibilidad numérica.
- Limitaciones de contexto e idioma: no documentadas; el tokenizador copiado de GPT-2 implica el vocabulario BPE original, pero no se declara longitud de contexto soportada por el fixture.
- Restricciones de licencia: la licencia no está disponible en la información proporcionada; verificar antes de cualquier uso, incluso interno.
- Caveat de producción: no desplegar. Su valor está limitado a entornos de test y validación de contratos de framework.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/gpt2-mic
- Modelo base: https://huggingface.co/openai-community/gpt2
- Procedimiento de reducción del fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/gpt2-mic.html
- Evidencia de regeneración (GitHub Actions): https://github.com/huggingface/transformers-mic/actions/runs/38252430459
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de reducción `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
