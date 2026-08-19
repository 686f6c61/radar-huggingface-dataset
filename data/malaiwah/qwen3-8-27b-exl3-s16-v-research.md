# malaiwah/Qwen3.8-27B-EXL3-S16-V-research

## Resumen

Este modelo es un artifact de investigación publicado por el usuario malaiwah, no un lanzamiento orientado a producción. Se trata de una cuantización experimental del modelo Qwen/Qwen3.8-27B, un transformer multimodal de 27 000 millones de parámetros, convertido a precisión mixta sub-4-bit (3 y 4 bits) mediante la herramienta exllamav3. El autor lo presenta como un resultado negativo: fue medido y rechazado por superar el umbral pre-registrado de divergencia KL, y su publicación tiene como único fin permitir la auditoría independiente del proceso de evaluación.

La relevancia de este checkpoint radica en dos aspectos: por un lado, es el primer artefacto sub-4-bit de esta familia de cuantizaciones, lo que permite extender la ley empírica de error por bit un escalón por debajo del rango donde fue ajustada; por otro, su rechazo documentado sirve como referencia para quienes estudian los límites de la cuantización agresiva en modelos de gran tamaño. El autor recomienda explícitamente no desplegar este checkpoint en ningún entorno, y señala alternativas con mejor fidelidad para uso real.

El repositorio incluye 409 módulos cuantizados (400 del cuerpo del modelo y 8 del módulo de draft MTP), con el vision tower y las embeddings en BF16. El tamaño total del repositorio es de 13,7 GB, y la carga en GPU reportada por vLLM es de 12,81 GiB. La licencia es Apache 2.0, y el pipeline declarado es image-text-to-text.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión + texto) con atención lineal y atención completa, basado en Qwen3.8-27B |
| Parametros totales | 27B (modelo base Qwen3.8-27B); el safetensors reporta 6 855 750 896, cifra que refleja el almacenamiento cuantizado y no el número real de parámetros |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3-bit (K3) y 4-bit (K4) con precisión mixta, usando exllamav3 (formato exl3/trellis) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con cuantización exl3/trellis) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer multimodal de 27 000 millones de parámetros que procesa imágenes y texto. Este checkpoint no añade entrenamiento adicional; es una conversión de precisión mixta realizada con exllamav3. La distribución de anchos por rol es la siguiente: las proyecciones q/k/v/o de atención completa se cuantizan a K4 (4 bits), la atención lineal a K3 (3 bits), las tres proyecciones del MLP (gate, up, down) a K3, el lm_head a K4, y los ocho módulos del draft MTP a K4. Las embeddings y el vision tower se mantienen en BF16.

La conversión se realizó siguiendo una especificación pre-registrada (documento docs/34 §6.1) y el tamaño serializado predicho coincidió exactamente con el medido: 13 711 503 428 bytes, con error de predicción cero. El autor reporta por primera vez el término de carga del loader para un build sub-4-bit: vLLM reportó 12,81 GiB de pesos cargados frente a un payload de 12,7698 GiB, un delta de +0,0402 GiB, lo que indica que el término de carga escala con el payload y no es constante.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.8-27B, aunque degradadas por la cuantización agresiva.
- Procesamiento de imágenes: al ser image-text-to-text, puede recibir imágenes como entrada y generar texto relacionado.
- Conversación multi-turno: el modelo base soporta diálogo, pero la fidelidad reducida afecta la coherencia en turnos largos.
- Tool calling y function calling: el modelo base las soporta, pero no se ha verificado su funcionamiento en esta cuantización.
- Multilingüismo: no se han publicado los idiomas soportados para este checkpoint.
- Capacidades especiales: el modelo base incluye un módulo MTP (multi-token prediction) para decodificación especulativa, presente aquí en forma cuantizada a K4.

## Casos de uso

- Auditoría de procesos de evaluación: el propósito declarado del autor es permitir que terceros re-capturen y re-repliquen la métrica de divergencia KL sobre el shard 0 del conjunto de validación, comparando contra la referencia BF16 publicada.
- Investigación sobre cuantización sub-4-bit: es el único artefacto de esta familia con módulos a 3 bits, útil para estudiar la ley de error por bit por debajo del rango donde fue ajustada.
- Verificación de predicciones de tamaño: el hecho de que el tamaño serializado coincidiera exactamente con la predicción permite validar la ley afín de bytes para anchos inferiores a 4 bits.
- Medición del término de carga del loader: el delta de +0,0402 GiB medido por vLLM es el primer dato de este tipo para un build sub-4-bit, y puede usarse para calibrar planificaciones de VRAM.
- Comparación de fidelidad entre builds: los datos de KL divergence y top-1 agreement permiten comparar esta cuantización con otras del mismo autor (K4, K5K6-hydrated, context edition).
- No es adecuado para ningún caso de uso en producción: el autor lo rechaza explícitamente y recomienda usar los builds alternativos publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor proporciona métricas de fidelidad sobre un conjunto de validación propio, que se resumen a continuación:

| Metrica | Valor | Intervalo de confianza 95 % |
|---|---|---|
| Divergencia KL media (shard 0, 512 contextos, 1 048 064 posiciones) | 0,045374 | [0,041959, 0,049351] |
| Acuerdo top-1 | 91,73 % | no disponible |
| Pérdida pareada frente a K4 (por contexto) | +0,035028 | [+0,032382, +0,038117] |
| Pérdida pareada frente a context edition (por contexto) | +0,041964 | [+0,038790, +0,045661] |

El umbral pre-registrado para aceptación era una media de divergencia KL de 0,030; este build la supera en 1,5 veces, y pierde 512 de 512 contextos frente a los dos comparadores publicados. El autor concluye que la fidelidad es 4,4 veces peor que la del peor build publicado hasta la fecha (K4).

## Requisitos de hardware

- VRAM estimada: el payload es de 12,7698 GiB y la carga reportada por vLLM es de 12,81 GiB, por lo que cabe en GPUs con 16 GB de VRAM, dejando aproximadamente 3 GB para KV cache y overhead.
- GPU recomendadas: cualquier GPU con 16 GB o más, como RTX 4080/4090, A100 40GB, H100, etc. El autor señala que la clase de 16 GB falla en fidelidad, no en bytes, por lo que no hay ninguna configuración recomendada.
- Si cabe en consumer GPU: sí, en GPUs de 16 GB o superiores, aunque no se recomienda su uso.
- Opciones de despliegue: el modelo está diseñado para vLLM (librería declarada), pero también podría cargarse con exllamav3 u otras herramientas compatibles con el formato exl3.
- Latencia y throughput: no disponibles; al ser un artifact rechazado, no se han realizado mediciones de rendimiento.

## Comparativa con modelos similares

La comparación más relevante es con otros builds del mismo autor, todos basados en el mismo modelo Qwen3.8-27B:

| Modelo | Cuantización | Tamaño payload | Divergencia KL media | Estado |
|---|---|---|---|---|
| Qwen3.8-27B-EXL3-S16-V-research (este) | Mixta K3/K4 | 12,77 GiB | 0,045374 | Rechazado |
| Qwen3.8-27B-K4 | K4 uniforme | no disponible | 0,010345 | Publicado, peor build aceptable |
| Qwen3.8-27B-EXL3-K5K6-context | Mixta K5/K6 | no disponible | 0,003409 | Publicado, para ventanas largas |
| Qwen3.8-27B-EXL3-K5K6-hydrated | Mixta K5/K6 | 20,10 GiB | no disponible | Recomendado por el autor |

También podría compararse con el modelo base sin cuantizar, pero no se dispone de métricas de fidelidad para él en la información proporcionada.

## Limitaciones y advertencias

- Es un resultado negativo: el autor lo rechaza explícitamente y lo publica únicamente para auditoría. No debe desplegarse en ningún entorno.
- Alta divergencia KL: 0,045374, 1,5 veces el umbral pre-registrado de 0,030, y 4,4 veces peor que el peor build publicado (K4).
- Pérdida pareada sistemática: pierde 512 de 512 contextos frente a K4 y context edition, con intervalos de confianza que excluyen el cero.
- Riesgo de alucinación y degradación de capacidades: la cuantización sub-4-bit afecta gravemente la fidelidad del modelo, lo que incrementa el riesgo de respuestas incoherentes o incorrectas.
- Sin soporte para producción: el autor no ofrece ninguna configuración recomendada ni receta de despliegue.
- Idiomas no especificados: no se ha declarado qué idiomas soporta este checkpoint, aunque el modelo base es multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero el autor desaconseja su uso en cualquier escenario real.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/malaiwah/Qwen3.8-27B-EXL3-S16-V-research
- Build recomendado (K5K6-hydrated): https://huggingface.co/malaiwah/Qwen3.8-27B-EXL3-K5K6-hydrated
- Build para ventanas largas (context edition): https://huggingface.co/malaiwah/Qwen3.8-27B-EXL3-K5K6-context
- Build K4 (más pequeño publicado): https://huggingface.co/malaiwah/Qwen3.8-27B-K4
- Documentación técnica (docs/34): https://github.com/malaiwah/qwen38-27b-exl3/blob/main/docs/34-vram-class-profiles.md
- Receipts con hashes y métricas: https://github.com/malaiwah/qwen38-27b-exl3/blob/main/receipts/sixteen-flip-kld.json
