# ansarbuilds/Sirius-Small-ONNX

## Resumen

Sirius-Small-ONNX es un clasificador de texto ligero desarrollado por ansarbuilds, derivado del modelo de embeddings BAAI/bge-small-en-v1.5 y exportado a ONNX con cuantización int8. Su función es concreta: dado un objetivo breve del usuario (por ejemplo, "File my 2026 taxes") y una traza de ventanas o pestañas abiertas recientes, clasifica la ventana activa en tres categorías (ON_TASK, BORDERLINE o RABBIT_HOLE) para detectar la deriva de foco o "rabbit hole" en el escritorio. Está pensado como el "cerebro" de una aplicación de escritorio para macOS que avisa al usuario cuando se desvía de su tarea.

El modelo tiene aproximadamente 33 millones de parámetros y pesa 32,43 MB en formato ONNX int8. Su relevancia radica en su extrema eficiencia: inferencia en CPU en milisegundos (latencia p50 de 15,80 ms y p95 de 102,64 ms), sin necesidad de GPU ni conexión a internet. Está diseñado para ejecutarse de forma local y offline, lo que lo hace adecuado para aplicaciones de productividad con requisitos de privacidad y baja latencia.

La arquitectura subyacente es un transformer BERT de tipo cross-encoder, especializado en clasificación de pares (objetivo + traza de ventanas) y afinado con datos sintéticos y destilados de un modelo mayor. Su licencia MIT facilita la integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT (cross-encoder), basado en BAAI/bge-small-en-v1.5 |
| Parametros totales | ~33 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 160 tokens (max_length usado en tokenización) |
| Tipos de cuantizacion | int8 (ONNX cuantizado) |
| Idiomas soportados | no disponible (entrenado y evaluado en inglés) |
| Licencia | MIT |
| Formato de pesos | ONNX (model_quantized.onnx) |

## Arquitectura y entrenamiento

Sirius-Small-ONNX es un cross-encoder basado en BERT, construido sobre el modelo de embeddings BAAI/bge-small-en-v1.5. La entrada combina el objetivo del usuario y la traza de ventanas normalizadas (app | title | domain) separadas por tokens [SEP], y la salida es una clasificación en tres clases. El modelo se ha cuantizado a int8 y exportado a ONNX para su despliegue en CPU.

El entrenamiento se realizó en tres rondas sobre GPUs NVIDIA en RunPod: 100.000 filas sintéticas (ronda 1, generadas con `factory.py`), un pool de 500.000 filas para minería de negativos difíciles (`mine_hard_negatives.py`) y 31.660 filas de la ronda 3 destiladas con probabilidades soft-label del modelo Apache-2.0 Qwen/Qwen3-32B-AWQ (`distill_teacher.py`). El umbral de decisión (0,81) se ajustó exclusivamente sobre el split `dev` de SiriusBench, y todas las métricas se reportan sobre el split `test` bloqueado. El autor declara que no se usaron salidas propietarias de OpenAI, Anthropic ni Google/Gemma.

## Capacidades

- Clasificación de texto en tres clases (ON_TASK, BORDERLINE, RABBIT_HOLE) para detección de deriva de foco.
- Procesamiento de pares objetivo + traza de ventanas en formato `app | title | domain`.
- Inferencia offline en CPU con latencia de milisegundos.
- Manejo de ventanas utilitarias (1Password, Calculator, Gmail 2FA) sin falsos positivos.
- Detección de trampas de misma palabra clave y deriva gradual en trazas de hasta 4 saltos.
- No soporta tool calling, agentes, visión, audio ni generación de texto libre; es exclusivamente un clasificador.

## Casos de uso

- Aplicación de productividad de escritorio: integrado en una app macOS, clasifica la ventana activa en tiempo real y decide si mostrar un aviso al usuario cuando entra en RABBIT_HOLE, con cero falsos avisos en ventanas utilitarias.
- Control parental o de bienestar digital: detecta desviaciones hacia entretenimiento o clickbait y registra patrones de distracción sin enviar datos a la nube.
- Gestión de foco en entornos laborales: analiza trazas de pestañas para medir la proporción de tiempo en tareas frente a deriva, útil en herramientas de analítica personal.
- Filtrado de notificaciones: usa la clase BORDERLINE para suprimir interrupciones en contextos de relación laxa con el objetivo, reduciendo el ruido.
- Investigación sobre comportamiento digital: permite etiquetar grandes volúmenes de trazas de navegación de forma local y a bajo coste, sin depender de APIs externas.
- Integración en asistentes de escritorio: como módulo de decisión ligero que decide cuándo intervenir, con latencia inferior a 20 ms p50 en CPU Apple M4.

## Benchmarks y rendimiento

| Metrica / Slice | Resultado |
|---|---|
| Precisión global Rabbit-Hole (umbral 0,81) | 99,3% |
| Recall global Rabbit-Hole | 92,3% |
| Exactitud global 3 clases | 91,5% |
| Slice A: trampas de misma palabra clave (precisión RH) | 100,0% |
| Slice B: deriva gradual en 4 saltos (precisión RH) | 100,0% |
| Slice C: tasa de falsos positivos en ventanas utilitarias | 0,0% |
| Slice D: trabajo legítimo en YouTube/Reddit/GitHub (precisión RH) | 100,0% |
| Tamaño ONNX int8 | 32,43 MB |
| Concordancia PyTorch vs. ONNX int8 | 95,3% |
| Latencia CPU en caliente (p50 / p95) | 15,80 ms / 102,64 ms |

Evaluación en mundo real (300 trazas etiquetadas a mano de macOS, 1,9 horas activas):

| Metrica | Resultado |
|---|---|
| Slice real YouTube y Reddit (21 trazas) | 90,5% precisión / 100,0% recall |
| Falsos positivos en ventanas utilitarias | 0,0% |
| Avisos falsos por 2 horas (replay del motor de decisión) | 0,00 (objetivo <= 1,00) |

## Requisitos de hardware

- VRAM: no requiere GPU; inferencia en CPU.
- GPU recomendadas: no aplica; el modelo está optimizado para CPU (evaluado en Apple M4).
- Cabe en cualquier equipo consumer: 32,43 MB en disco y huella de memoria mínima.
- Opciones de despliegue: ONNX Runtime (Python), integración nativa en apps de escritorio; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este clasificador).
- Latencia: p50 de 15,80 ms y p95 de 102,64 ms en CPU en caliente; el autor cita menos de 5 ms en CPU M4 para la app por defecto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Sirius-Small-ONNX | ~33 M | 160 tokens | Clasificación de deriva de foco (3 clases) | MIT | ONNX int8 |
| BAAI/bge-small-en-v1.5 (base) | ~33 M | 512 tokens | Embeddings de texto | MIT | safetensors |
| Cross-encoders BERT pequeños (p. ej. MiniLM) | 20-120 M | 256-512 tokens | Clasificación de pares / reranking | variable | safetensors, ONNX |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada; las métricas de SiriusBench son específicas de la tarea de detección de deriva de foco y no son directamente comparables con benchmarks generales.

## Limitaciones y advertencias

- Modelo especializado: no genera texto, no razona de forma general ni soporta tool calling; su uso fuera de la clasificación de deriva de foco es limitado.
- Entrenado y evaluado en inglés; no hay información sobre soporte multilingüe.
- Ventana de contexto de 160 tokens, adecuada solo para objetivos breves y trazas de 1-4 ventanas.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de clasificaciones erróneas en dominios no representados en el entrenamiento.
- Los datos de entrenamiento son mayoritariamente sintéticos y destilados; el rendimiento en dominios muy distintos a macOS puede degradarse.
- La evaluación en mundo real se limita a 300 trazas de macOS y 1,9 horas activas; la generalización a otros sistemas operativos o flujos de trabajo no está validada.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- La concordancia entre PyTorch y ONNX int8 es del 95,3%, por lo que puede haber discrepancias en las predicciones respecto al modelo original.

## Enlaces

- Hugging Face: https://huggingface.co/ansarbuilds/Sirius-Small-ONNX
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Modelo docente citado: https://huggingface.co/Qwen/Qwen3-32B-AWQ
