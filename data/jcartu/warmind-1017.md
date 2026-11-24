# jcartu/WARMIND-1017

## Resumen

WARMIND-1017 es una versión derivada del modelo DeepSeek-V4.1-Flash-1017, publicada por el usuario jcartu en Hugging Face. No se trata de un modelo entrenado desde cero ni de una nueva arquitectura: es el checkpoint oficial de DeepSeek con una edición de "abliteración" aplicada sobre 132 tensores concretos, orientada a reducir los mecanismos de rechazo del modelo conservando parte de su capacidad de abstención epistémica. El nombre "WARMIND" identifica esta derivación y "1017" el checkpoint upstream del 17 de octubre de 2026.

La base es un transformer MoE de 40 capas con 384 expertos enrutados (6 activos) más un experto compartido, capas MTP de borrador y tablas Engram de n-gramas, con una ventana de contexto declarada de 1.048.576 tokens. El checkpoint pesa unos 510 GB distribuidos en 48 shards, con pesos densos en FP8 E4M3 y escalas de bloque UE8M0 de 32x32, y los expertos enrutados en FP4 nativo. La edición afecta a 1.775.136.000 bytes (1,65 GiB, un 0,35 % del checkpoint).

Su relevancia actual radica en que demuestra una técnica de modificación de pesos a nivel de tensor sobre un modelo de escala frontera, con procedencia verificable byte a byte (hashes por rango editado, digests de shards y sumas SHA256). La versión 1.1 (orth4c) corrige el exceso de fabricación de respuestas observado en la v1.0 sobre preguntas sin respuesta en SQuAD 2.0, manteniendo el rendimiento en conocimiento factual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE, 40 capas, hidden 5120, 384 expertos enrutados (6 activos) + 1 experto compartido, 3 capas MTP de borrador, tablas Engram de n-gramas |
| Parametros totales | 763.205.315.794 (según safetensors) |
| Parametros activos | 6 de 384 expertos enrutados más experto compartido (recuento exacto de parámetros activos no disponible) |
| Longitud de contexto | 1.048.576 tokens (según config.json) |
| Tipos de cuantizacion | FP8 E4M3 con escalas de bloque UE8M0 32x32 en pesos densos; FP4 nativo en expertos enrutados; no se ha recuantizado respecto al upstream |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors nativo (48 shards, 510.296.708.312 bytes; 96.085 tensores) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de 40 capas y dimensión oculta 5120, con 384 expertos enrutados de los que se activan 6 por token, más un experto compartido. Incluye tres capas MTP (multi-token prediction) de borrador, presumiblemente para decodificación especulativa, y tablas Engram de n-gramas alojadas en los shards 47 y 48 (unos 101,5 GB cada uno). La cuantización nativa combina FP8 E4M3 con escalas de bloque UE8M0 de 32x32 en los pesos densos y FP4 en los expertos enrutados.

WARMIND-1017 no ha sido reentrenado ni ajustado con RLHF o DPO por parte del autor de la derivación. La modificación consiste en un operador de abliteración que preserva la norma, aplicado sobre dos familias de tensores (`attn.wo_b` y `ffn.shared_experts.w2`) en las capas 4 a 36: 132 tensores en total, repartidos en 33 de los 48 shards. La versión 1.1 (orth4c) introduce una base de abstención epistémica de 40 capas (U4) y direcciones de rechazo almacenadas en `abstain_directions.pt`, con el objetivo de reducir rechazos sin eliminar la capacidad de declarar una pregunta como no respondible. El resto de bytes del checkpoint, incluidos config, index, tokenizer, encoding, inference y LICENSE, se verifica idéntico al upstream.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base DeepSeek-V4.1-Flash-1017, incluyendo modo de razonamiento según los tags del repositorio.
- Reducción de rechazos: la edición de abliteración busca disminuir las respuestas de negativa del modelo base.
- Abstención epistémica preservada: la v1.1 incorpora direcciones de abstención para mantener la capacidad de responder "unanswerable" en preguntas sin respuesta en el contexto.
- Conocimiento factual: evaluado en OpenAI SimpleQA y MMLU-Pro con resultados próximos al modelo original.
- Resumen con base documental: evaluado con HHEM-2.1 en un estudio de 5 semillas.
- Contexto largo: ventana declarada de 1.048.576 tokens, adecuada para documentos extensos y conversaciones multi-turno prolongadas.
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita, aunque las capas MTP y el modo de razonamiento del modelo base sugieren soporte para generación especulativa.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Investigación sobre alineación y rechazo: el modelo permite estudiar cómo varía la tasa de negativas y la calibración de abstención al invertir direcciones de rechazo en tensores concretos, con procedencia byte a byte verificable mediante `DERIVATIVE.json` y `SHA256SUMS`.
- Evaluación de robustez ante alucinación: útil para reproducir estudios comparativos entre checkpoint original y derivado en tareas de pregunta-respuesta sin respuesta (SQuAD 2.0) y medir el efecto de la abliteración en la fabricación de respuestas.
- Procesamiento de documentos largos: con 1.048.576 tokens de contexto, puede emplearse en resumen y extracción sobre corpus extensos, aunque requiere hardware de gama alta (4x RTX PRO 6000 en TP4 según el autor).
- Despliegue en infraestructura propia con vLLM: el layout nativo es compatible con los mismos loaders que el upstream, lo que facilita servir el modelo con vLLM, vLLM-Moet o la receta BRRR en clústeres con GPUs Blackwell de 96 GB.
- Experimentación con cuantización FP8/FP4: sirve como caso de estudio de un checkpoint mixto FP8 denso y FP4 en expertos, sin recuantización adicional, para analizar rendimiento y precisión en inferencia.
- Base para derivaciones posteriores: al ser MIT y de descarga pública sin solicitud de acceso, puede servir como punto de partida para otros experimentos de edición de pesos o ajuste fino sobre un modelo de gran escala.
- Auditoría de procedencia de modelos: el repositorio incluye hashes por rango editado y digests de shards, lo que lo convierte en un ejemplo práctico de cadena de custodia para modelos derivados.

## Benchmarks y rendimiento

| Benchmark | WARMIND-1017 v1.0 | DeepSeek-V4.1-Flash-1017 (stock) | Notas |
|---|---|---|---|
| OpenAI SimpleQA (4.326 items, grading ciego con gpt-4.1) | 44,6 % correctas | 44,8 % correctas | Sin pérdida de conocimiento factual |
| MMLU-Pro | 91,0 % | no disponible en la información | Medido sobre el contenedor CSF |
| HHEM-2.1, resumen con base documental (5 semillas) | 1,0 % no soportado | 0,4 % no soportado | IC pareado solapando cero |
| SQuAD 2.0 sin respuesta, sin system prompt | 37,4 % respuestas fabricadas | 23,8 % | v1.0; la v1.1 busca corregirlo |
| SQuAD 2.0 sin respuesta, con system prompt estricto | 31,6 % respuestas fabricadas | 24,0 % | v1.0; la v1.1 busca corregirlo |

Los datos corresponden a la versión v1.0 y fueron medidos sobre el contenedor CSF, no sobre este árbol, según indica el propio autor. No se han publicado resultados de benchmarks de la v1.1 (orth4c) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 510,3 GB en FP8/FP4 nativo; se requiere un total de memoria agregada superior a esa cifra para cargar los pesos, más overhead de activaciones y caché KV para contexto largo.
- GPU recomendadas: el autor reporta servicio en 4x NVIDIA RTX PRO 6000 Blackwell (96 GB cada una) con tensor parallelism 4, lo que suma 384 GB de VRAM. Para contexto de 1M tokens la caché KV puede exigir memoria adicional considerable.
- ¿Cabe en GPU de consumo? No. Un modelo de 763.000 millones de parámetros y 510 GB de pesos no cabe en RTX 4090 (24 GB) ni en configuraciones consumer típicas, ni siquiera con cuantización agresiva adicional no documentada.
- Opciones de despliegue: vLLM (imagen LiL con loader genérico), vLLM-Moet y la receta BRRR, según el autor. El layout nativo es el mismo que el del upstream, por lo que se esperan los mismos loaders.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| WARMIND-1017 (este) | 763.205.315.794 | 1.048.576 | MIT | safetensors FP8/FP4 | Pública, sin solicitud |
| DeepSeek-V4.1-Flash-1017 (base) | 763.205.315.794 | 1.048.576 | MIT | safetensors FP8/FP4 | Pública |
| DeepSeek-V4.1-Flash-1017-abliterated-lossless-CSF (hermano) | 763.205.315.794 | 1.048.576 | MIT | contenedor CSF | Con puerta de acceso |

La comparativa se limita al modelo base y a la variante CSF del mismo autor, ya que no se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La abliteración puede aumentar la fabricación de respuestas en preguntas sin respuesta: la v1.0 mostró un 37,4 % frente al 23,8 % del stock en SQuAD 2.0 sin system prompt. La v1.1 busca mitigarlo, pero no se han publicado métricas de la v1.1 en la información disponible.
- Riesgo de alucinación inherente al modelo base, agravado potencialmente por la reducción de rechazos en dominios sensibles.
- Sesgos conocidos: no disponible en la información proporcionada.
- Idiomas soportados: no disponible; no se documenta cobertura multilingüe.
- Restricciones de licencia: MIT, permite uso comercial, pero el autor de la derivación no añade garantías ni términos adicionales; conviene revisar la LICENSE del upstream.
- Caveat de producción: los benchmarks reportados se midieron sobre el contenedor CSF, no sobre este árbol de safetensors; el autor lo indica explícitamente.
- Requisitos de hardware muy elevados: 510 GB de pesos y contexto de 1M tokens implican infraestructura multi-GPU profesional.
- La model card está mayoritariamente en inglés y no documenta tool calling, visión ni audio.
- La versión v1.0 sigue disponible en la rama `v1.0`; es necesario fijar la revisión al descargar para evitar servir una versión distinta de la esperada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jcartu/WARMIND-1017
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Variante CSF del mismo autor: https://huggingface.co/jcartu/DeepSeek-V4.1-Flash-1017-abliterated-lossless-CSF
- Evaluación (CSF): https://huggingface.co/jcartu/DeepSeek-V4.1-Flash-1017-abliterated-lossless-CSF/blob/main/EVALUATION.md
- Evaluación 1017 (CSF): https://huggingface.co/jcartu/DeepSeek-V4.1-Flash-1017-abliterated-lossless-CSF/blob/main/EVALUATION-1017.md
- Rama v1.0: https://huggingface.co/jcartu/WARMIND-1017/tree/v1.0
- LICENSE: https://huggingface.co/jcartu/WARMIND-1017/blob/main/LICENSE
- SHA256SUMS: https://huggingface.co/jcartu/WARMIND-1017/blob/main/SHA256SUMS
