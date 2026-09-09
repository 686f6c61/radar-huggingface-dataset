# mcp-tool-shop/jam-actions-v1-qwen25-3b

## Resumen

El modelo `jam-actions-v1-qwen25-3b` es un adaptador LoRA de 0.3 GB desarrollado por `mcp-tool-shop` sobre el modelo base `Qwen/Qwen2.5-3B-Instruct` (3B parámetros). Su objetivo es especializar el modelo en una tarea concreta de análisis musical: a partir de métricas de una toma (centésimas, onset, relación cromática), el modelo debe escribir el cálculo de comparación contra unos umbrales predeterminados (50 cents, 40 ms, 0.2) y emitir una etiqueta de resultado (`gate`, `inside` o `pitch_fail`).

El adaptador fue entrenado con el dataset `jam-actions-v1` en su versión 1.1.0, que contiene 154 registros de entrenamiento, 59 de test y 96 tomas acústicas de once canciones validadas. La relevancia del modelo radica en que demuestra cómo un adaptador pequeño puede inducir un comportamiento preciso de tool-calling y chain-of-thought en un LLM con coste de entrenamiento mínimo. Su ventana de contexto de 16.384 tokens es suficiente para incluir el catálogo completo de 54 herramientas MCP en cada ejemplo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre Qwen2.5-3B-Instruct (Transformer decoder-only) |
| Parametros totales | 3B (modelo base) + adaptador LoRA (no especificado) |
| Parametros activos | No especificado (adaptador LoRA; los parametros del modelo base se congelan) |
| Longitud de contexto | 16.384 tokens (configuracion de entrenamiento; la base Qwen2.5 puede soportar mas) |
| Tipos de cuantizacion | No disponible (adaptador en bf16; el modelo base se puede cuantizar con metodos estandar) |
| Idiomas soportados | Principalmente ingles (vocabulario de herramientas en ingles); sin afirmacion multilingue |
| Licencia | Adaptadores: CC-BY-SA-3.0-DE; base Qwen2.5-3B-Instruct: Qwen Research license (uso comercial restringido) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base es un Transformer decoder-only de 3B parámetros con arquitectura estandar de Qwen2.5. El adaptador LoRA (r=16, α=32, dropout=0.1) se aplica a las proyecciones de atención (q, k, v, o) y a las capas de gate y up/down del MLP, en precisión bf16. El entrenamiento fue un ajuste supervisado (SFT) con tasa de aprendizaje 1.5e-4, scheduler cosine con 10 pasos de warmup, tamaño de batch efectivo de 8 (1 × 8 acumulación) y tres épocas. Se empleó una ventana de secuencia de 16.384 tokens y una pérdida de prompt con peso 0.1, además de cross-entropy por chunks para gestionar la longitud.

Cada ejemplo de entrenamiento incluye el catálogo completo de 54 herramientas MCP, que ocupa entre 13.0 y 13.4k tokens. El objetivo es que el modelo genere una línea de razonamiento con la resta y la comparación, seguida de la etiqueta correspondiente. La generación de predicciones es greedy con `max_new_tokens` 128. No se aplicó RLHF ni DPO; es un ajuste puramente supervisado.

## Capacidades

- Genera cadenas de texto tipo `cents 66.9: |66.9| − 50 = 16.9, against the gate; onset −9.8: |9.8| − 40 = −30.2, inside: pitch_fail`.
- Soporta tool-use: trabaja con el vocabulario de 54 herramientas MCP y las usa para enmarcar la decisión.
- Chain-of-thought: muestra el razonamiento aritmético antes de la etiqueta final.
- Copia y resta exacta: en los splits de evaluación, el modelo es capaz de copiar los números y restarlos correctamente en la mayoría de casos (36/36 en su split de validación).
- No es multimodal: no procesa audio directamente, solo texto.

## Casos de uso

- Control de calidad automatizado en producción musical: el modelo recibe las métricas extraídas por un servidor MCP y devuelve la decisión de aprobar o rechazar una toma, junto con el cálculo que la justifica.
- Depuración de pipelines de grabación: un estudio puede integrar el adaptador en herramientas como vLLM para obtener explicaciones inmediatas de por qué una toma excede el umbral, sin intervención manual.
- Documentación de decisiones en DAW: la cadena de texto generada actúa como registro de auditoría legible para el ingeniero que revisa el proceso de selección de takes.
- Pruebas de evaluación de tool-calling: el modelo sirve como baseline en experimentos que comparan cómo un LoRA pequeño se especializa en un dominio estrecho frente a un modelo general.
- Validación de datos sintéticos: al entrenar con tomas sintéticas, el modelo puede usarse para comprobar si un dataset generado conserva las relaciones numéricas esperadas.
- Benchmark de razonamiento numérico: dado que obliga a mostrar la resta, es un instrumento para medir la fiabilidad aritmética de modelos pequeños en contexto.

## Benchmarks y rendimiento

| Split | 3b-4d-s13 | 3b-4d-s42 | Base Qwen2.5-3B-Instruct |
|---|---|---|---|
| 1.1.0 held-out acoustic (36) | 36/36 | 36/36 | 13/36 |
| 1.0.0 held-out acoustic (17) | 17/17 | 17/17 | 5/17 |
| 1.0.0 overall (40) | 38/40 | 37/40 | 20/40 |
| Near-gate probe (24) | 23/24 | 24/24 | 6/24 |

Además, en la sonda la resta exacta se consigue en 22/24 y 19/24 (con errores de 0.2–1.0 en el término de cents). La palabra de gate sigue a la propia resta en cada línea de todos los conjuntos evaluados. No se han publicado benchmarks generales como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en bf16 requiere ~6 GB, y el adaptador añade una sobrecarga mínima (~0.1–0.3 GB). En cuantización 4-bit se puede reducir a ~2–3 GB.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4060, RTX 4090, A10 o A100; cualquier GPU con al menos 8 GB de VRAM es suficiente.
- Cabe en GPU de consumidor: sí.
- Opciones de despliegue: con `transformers` + `peft` en Python; fusionando el adaptador en el modelo base se puede exportar a GGUF y usar con `llama.cpp`, `Ollama` o `vLLM`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Base | Contexto | Licencia | Rendimiento en 1.1.0 held-out |
|---|---|---|---|---|
| jam-actions-v1-qwen25-3b | Qwen2.5-3B-Instruct | 16.384 | Adaptador CC-BY-SA-3.0-DE; base Qwen Research | 36/36 (seed 13 y 42) |
| jam-actions-v1-qwen25-7b | Qwen2.5-7B-Instruct | No disponible | Adaptador CC-BY-SA-3.0-DE; base Apache-2.0 | No evaluado en 1.1.0 (en 1.0.0: 14/17 y 12/17) |
| Qwen2.5-3B-Instruct (base) | Qwen2.5-3B-Instruct | 32k | Qwen Research | 13/36 |

El adaptador 7B fue entrenado sobre la versión 1.0.0 del dataset; en los splits comunes, el adaptador 3B alcanza un rendimiento superior al reportado para el 7B (17/17 frente a 14/17 y 12/17), aunque la comparación no es directa por diferencias en el corpus.

## Limitaciones y advertencias

- Restricción comercial: la licencia del modelo base Qwen2.5-3B-Instruct impide el uso comercial. Si el uso comercial es necesario, se recomienda el adaptador 7B, cuya base es Apache-2.0.
- Dominio limitado: solo está entrenado para once canciones y tres gates específicos (50 cents, 40 ms, 0.2). No es un evaluador general.
- Riesgo de alucinación aritmética: en la sonda se observan errores de 0.2–1.0 en el término de cents; en el adaptador seed 13 la resta exacta es 22/24. La palabra `inside` o `pitch_fail` se genera a partir de la propia resta, por lo que un error numérico puede propagarse.
- Vocabulario: la versión 1.0.0 del adaptador inventó palabras de gate no vistas; la 1.1.0 no lo hace en las evaluaciones, pero el riesgo persiste en otros dominios.
- Contexto largo: el catálogo de 54 herramientas consume ~13–13.4k tokens de la ventana de 16.384, dejando ~3k tokens para la entrada del usuario; las conversaciones largas pueden truncarse.
- Sin soporte multimodal: no procesa audio directamente, solo texto.
- El dataset y los adaptadores están bajo CC-BY-SA-3.0-DE, lo que implica compartir adaptaciones bajo la misma licencia.

## Enlaces

- Modelo: https://huggingface.co/mcp-tool-shop/jam-actions-v1-qwen25-3b
- Dataset: https://huggingface.co/datasets/mcp-tool-shop/jam-actions-v1
- Adaptador 7B: https://huggingface.co/mcp-tool-shop/jam-actions-v1-qwen25-7b
- Protocolo Model Context Protocol: https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro
