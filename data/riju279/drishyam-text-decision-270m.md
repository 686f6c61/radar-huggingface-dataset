# riju279/drishyam-text-decision-270m

## Resumen

drishyam-text-decision-270m es un modelo de decisión tipada (typed decision head) construido como fine-tune de google/t5gemma-2-270m, desarrollado por el autor de Hugging Face riju279. No es un modelo generativo al uso: recibe un estado de tarea serializado (ids de tokenizador) junto con una pregunta tipada —binaria sí/no, elección múltiple u ordinal— y devuelve una decisión calibrada. Forma parte del proyecto drishyam-1 y es la variante textual del modelo hermano riju279/drishyam-vision-decision-270m, que resuelve la misma tarea a partir de imágenes de página.

La relevancia de esta publicación es metodológica más que de rendimiento: el autor publica explícitamente lo que denomina "iteration 0" de una escalada por etapas, con un 39.8% de accuracy en el benchmark JevBench public-231, el último puesto de la escalera de referencia. El checkpoint se entrena sobre el 25% de los casos disponibles (58.000 de ~231.000), una sola época y estados truncados a 512 tokens, y se presenta como el punto de partida honesto, no como un sistema terminado.

Arquitectónicamente no introduce cambios respecto al campeón de visión: reutiliza la misma cabeza `forward_row`, el mismo binding encoder-fila y el mismo slot-readout, sustituyendo únicamente la fuente del estado (embeddings de tokens en lugar de slots de embedding de página). Los pesos de la cabeza se inicializan desde el campeón de visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder T5Gemma (base google/t5gemma-2-270m) con cabeza de decisión tipada `forward_row` (noul binaria / choice / score ordinal) |
| Parametros totales | 270M (según nombre del modelo y modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | estados de 512 tokens en entrenamiento; evaluación con tope de 2048 tokens (desajuste de protocolo declarado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use, no Apache) |
| Formato de pesos | `best.pt` (checkpoint PyTorch); no se mencionan safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de google/t5gemma-2-270m y mantiene la arquitectura sin cambios: los estados textuales son ids de tokenizador que pasan por la capa de embedding y entran en la misma cabeza `forward_row` que usa el modelo de visión. La cabeza es tipada y soporta tres primitivas de decisión: binaria (noul), elección entre opciones (choice) y puntuación ordinal (score). El binding encoder-fila y el slot-readout son idénticos al campeón de visión; solo cambia la fuente del estado (embeddings de tokens frente a slots de embedding de página). Los pesos de la cabeza se inicializan desde el campeón de visión (`runs/g2-row-sft/best.pt`, init: sft).

El entrenamiento usa el dataset bev-decision fijado en la revisión `11ed9b5b`, con 58.000 casos durante 1 época y estados de 512 tokens, lo que suma 101.777 filas de decisión (56.787 de choice, 29.216 de noul y 15.774 de score). Sobre una validación retenida de 2.000 casos obtiene accuracy 0.611 y ECE 0.018. No se documenta uso de RLHF ni DPO; el ajuste es SFT supervisado sobre decisiones tipadas.

## Capacidades

- Decisión binaria sí/no sobre un estado de tarea serializado (primitiva noul).
- Elección múltiple entre opciones tipadas (primitiva choice).
- Puntuación ordinal (primitiva score).
- Calibración de probabilidades: ECE de 0.018 en validación retenida.
- Procesamiento de estados textuales largos, hasta el tope de 2048 tokens empleado en evaluación.
- No se documentan capacidades de generación libre de texto, tool calling, agentes, visión ni audio; el modelo es un clasificador de decisión, no un asistente conversacional.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Verificación de recibos y documentos financieros: el modelo puede emitir decisiones binarias sobre afirmaciones extraídas de un recibo (por ejemplo, validar una fecha o un importe) cuando el estado de la tarea se serializa como texto. El autor reporta un 98.3% de acierto en fechas verdaderas en el protocolo SROIE v1, aunque todavía no rechaza afirmaciones falsas de forma fiable.
- Enrutado de decisiones en pipelines de documentos: dado un estado textual estructurado, decidir entre opciones predefinidas (aprobado/rechazado, categoría A/B/C) en lugar de generar texto libre, lo que simplifica la integración y el parseo posterior.
- Puntuación ordinal en flujos de revisión: asignar un nivel de calidad o riesgo a un caso serializado como texto, aprovechando la primitiva score y la calibración medida (ECE 0.018).
- Evaluación comparativa de cabezas de decisión: sirve como referencia reproducible para investigar si una cabeza entrenada en visión transfiere a estados textuales, ya que comparte arquitectura exacta con el modelo de visión.
- Prototipado de sistemas de decisión calibrados de bajo coste: con 270M parámetros y un checkpoint de 1.6 GB, permite iterar localmente sobre datasets de decisión antes de escalar a modelos mayores.
- Investigación en calibración y benchmarks tipados: el repositorio adjunta `jevbench_public231_table.json` con las 231 filas por tarea, útil para estudiar dónde falla cada primitiva (noul 50.0%, choice 36.7%, score 22.2%).

## Benchmarks y rendimiento

Resultados publicados por el autor en JevBench public-231 (231 tareas, primitivas choice/noul/score, tope de estado de 2048 tokens):

| Metrica | Valor |
|---|---|
| Accuracy global (public-231) | 39.8% |
| Brier score | 0.724 |
| Accuracy por dificultad: easy (n=48) | 72.9% |
| Accuracy por dificultad: standard (n=72) | 36.1% |
| Accuracy por dificultad: hard (n=111) | 27.9% |
| Accuracy por primitiva: noul (n=74) | 50.0% |
| Accuracy por primitiva: choice (n=139) | 36.7% |
| Accuracy por primitiva: score (n=18) | 22.2% |
| Validación retenida (2.000 casos): accuracy | 0.611 |
| Validación retenida (2.000 casos): ECE | 0.018 |

Escalera de referencia publicada por el autor (puntuaciones de terceros, no re-ejecutadas por él):

| Modelo | Accuracy public-231 |
|---|---|
| Jev 1.13.0 (API cerrada) | 86.6 |
| system-one-open (2B) | 73.2 |
| Kev 0.6B | 66.7 |
| bev-decider (0.4B) | 65.8 |
| jeff (~0.4B) | 62.8 |
| Laya (0.4B) | 58.4 |
| deberta (~0.4B) | 52.4 |
| Kev 0.5B | 49.4 |
| drishyam-text-decision-270m (iteration 0) | 39.8 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 270M parámetros en precisión completa (fp32) rondaría 1,1 GB de pesos, y en fp16/bf16 unos 0,55 GB, a lo que hay que sumar memoria de activaciones y del estado de entrada (hasta 2048 tokens).
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cualquier GPU consumer con 4 GB o más de VRAM debería alojar el modelo en fp16.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, dado el tamaño de 270M parámetros.
- Opciones de despliegue: el checkpoint se distribuye como `best.pt` (PyTorch), por lo que requiere cargarlo con PyTorch/Transformers; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy public-231 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| drishyam-text-decision-270m | 270M | 512 en entrenamiento / 2048 en evaluación | 39.8 | gemma | Hugging Face |
| Laya | ~0.4B | no disponible | 58.4 | no disponible | no disponible |
| Kev 0.6B | 0.6B | no disponible | 66.7 | no disponible | no disponible |
| bev-decider | 0.4B | no disponible | 65.8 | no disponible | no disponible |
| deberta | ~0.4B | no disponible | 52.4 | no disponible | no disponible |

El modelo se sitúa por debajo de todos los comparadores publicados en la escalera, con una diferencia de −18.6 puntos frente a Laya (58.4), aunque con la mitad o menos de parámetros que la mayoría de ellos y entrenado sobre el 25% de los datos.

## Limitaciones y advertencias

- Desajuste de protocolo conocido: entrenado con estados de 512 tokens pero evaluado con un tope de 2048 tokens; el modelo nunca vio estados de la longitud usada en evaluación.
- La forma "dict-of-documents" del tier hard no aparece en el entrenamiento, lo que explica el 27.9% de accuracy en ese nivel.
- Las temperaturas de temperature scaling ajustadas sobre la distribución propia no transfieren al protocolo JevBench.
- La primitiva score es débil (22.2%) y la cabeza hereda los priors de mezcla de respuestas del campeón de visión (defecto Yes-prior en SROIE documentado en la model card de visión).
- Riesgo de alucinación: al ser un clasificador de decisión tipada, el riesgo se manifiesta como decisiones erróneas con alta confianza, no como texto inventado; la calibración medida en validación (ECE 0.018) no garantiza la misma calibración fuera de distribución.
- Licencia gemma (Gemma Terms of Use), no Apache: impone restricciones de uso comercial y obligaciones de atribución que deben revisarse antes de producción.
- Idiomas soportados no documentados; no se debe asumir multilingüismo.
- Es un checkpoint "iteration 0" explícito: no es un sistema terminado y el propio autor lo sitúa en el último puesto de la escalera.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/riju279/drishyam-text-decision-270m
- Modelo base: https://huggingface.co/google/t5gemma-2-270m
- Modelo hermano de visión: https://huggingface.co/riju279/drishyam-vision-decision-270m
- Dataset de entrenamiento: https://huggingface.co/datasets/avbiswas/bev-decision (revisión `11ed9b5b879e7f9524e7c89c1037d498c54206f0`)
- Tabla de evaluación adjunta: `jevbench_public231_table.json` (en el repositorio del modelo)
- Repositorio fuente: `drishyam-1` (ledger en `docs/BENCHMARK_LEDGER.md`); URL no disponible en la información proporcionada.
