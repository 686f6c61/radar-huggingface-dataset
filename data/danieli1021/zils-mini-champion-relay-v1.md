# Danieli1021/zils-mini-champion-relay-v1

## Resumen

Zils mini champion relay v1 es un modelo de decisión experimental publicado por el usuario Danieli1021 en Hugging Face, derivado por ajuste fino (LoRA fusionado) del modelo base joamCriff123/zils-mini-sx3, que a su vez procede de Qwen/Qwen3.5-4B y de la familia de modelos de decisión zils-mini. Con 4.539.265.536 parámetros en BF16, no es un modelo generativo de propósito general: es el "cuerpo" de pesos de un candidato para el pool `d3-mini` de la subred Zils 127, y requiere el chasis fijo `d3-mini-4.5b-v1` (runtime, prompt, tokenizador y capa de respuesta) para funcionar.

El modelo se entrenó mediante una fusión de LoRA de rango 64 y alpha 128, con 10.600 filas de entrenamiento y 663 pasos de optimizador sobre una única RTX A6000. La receta combina destilación desde un profesor de 27B (40% de las probabilidades), distribuciones gold originales (30%) y las probabilidades del modelo mini de partida (30%), más 1.600 filas de retención. La capa de respuesta y la torre de visión quedaron congeladas.

Su relevancia es acotada y experimental: la model card documenta explícitamente que los resultados locales no garantizan ni asiento de pago ni rendimiento en el examen privado del validador, y que en la confirmación fresca el candidato rinde por debajo del modelo stock (62,814 frente a 64,379). Es, por tanto, un artefacto de investigación sobre recetas de destilación y mezcla de modelos, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B; detalles internos no disponibles) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte del chasis fijo `zils-ai/d3-mini-4.5b-v1` y del cuerpo de `joamCriff123/zils-mini-sx3`, con linaje que la model card atribuye a `qhoenix/zils-mini-decision-v2`, `Charlie320/zils-mini-s1`, `zils-ai/d3-mini-4.5b-v1` y `Qwen/Qwen3.5-4B`. El entrenamiento consistió en una LoRA fusionada de rango 64, alpha 128, dropout 0, learning rate 5e-5, AdamW sin weight decay, acumulación de gradiente 16 y semilla 24, ejecutada en una sola RTX A6000. El cuerpo enviado es el candidato entrenado fusionado, sin promedio de pesos posterior.

Los datos de entrenamiento son 10.600 filas: 9.000 filas públicas congeladas del split TRAIN de Relay, con un 40% de probabilidades del profesor fijado de 27B, un 30% de distribuciones gold originales y un 30% de probabilidades del modelo mini de partida sobre las mismas entradas; más 1.600 filas públicas separadas para retener las probabilidades del modelo de partida. Otras 1.000 filas de retención quedaron reservadas y no se optimizaron. No se usaron filas de semilla ni de evaluación. La innovación técnica declarada es la retención sobre las mismas entradas y un mayor soporte gold tras una primera ejecución que perdió semilla y puntuación de Outcomes. La capa de respuesta y la torre de visión permanecieron congeladas.

## Capacidades

- Modelo de decisión para el pool `d3-mini` de la subred Zils 127: produce decisiones dentro del contrato de runtime del chasis `d3-mini-4.5b-v1`, no texto libre genérico.
- Requiere runtime, prompt, tokenizador y capa de respuesta fijos del chasis; no funciona como modelo autónomo de generación de texto.
- Destilación de probabilidades desde un profesor de 27B, orientada a replicar distribuciones de decisión.
- Retención de las probabilidades del modelo de partida sobre entradas separadas.
- Capacidades de visión: la torre de visión existe en el chasis pero quedó congelada; no se documenta su uso efectivo en este cuerpo.
- Soporte de tool calling, agentes, multilingüismo o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre destilación de probabilidades: el modelo sirve como caso reproducible de mezcla de distribuciones (profesor 27B, gold y modelo de partida) para estudiar cómo afecta a la retención y a la puntuación de validación en pools de decisión.
- Evaluación de recetas de LoRA fusionada: permite analizar el efecto de rango 64, alpha 128 y 663 pasos sobre un cuerpo de 4,5B en una única GPU de 48 GB, como la RTX A6000.
- Estudio de retención catastrófica: las 1.600 filas de retención y las 1.000 reservadas ofrecen un marco para medir la pérdida de capacidades del modelo de partida tras el ajuste.
- Reproducción de linajes de modelos de decisión: útil para trazar la cadena zils-mini-decision-v2 → zils-mini-s1 → zils-mini-sx3 → este candidato y comparar revisiones fijadas.
- Análisis de intervalos bootstrap y calibración: el archivo `evaluation.json` documenta variantes de desarrollo, sensibilidad de calibración y cotas de confianza, aprovechable para metodología de evaluación en competiciones de modelos.
- Pruebas de contrato de runtime: sirve para validar la integración con el chasis `d3-mini-4.5b-v1` antes de enviar candidatos a un validador privado.

## Benchmarks y rendimiento

Resultados de la evaluación proxy pública recogidos en la model card (puntuaciones del pool, cuerpo de partida frente a candidato enviado):

| Proxy | Items puntuables | Cuerpo de partida | Candidato enviado | Diferencia |
|---|---:|---:|---:|---:|
| broad-dev | 1450 | 66.377 | 68.454 | +2.077 |
| public-eval | 264 | 1.378 | 0.708 | -0.670 |
| primary | 1714 | 55.897 | 57.469 | +1.572 |
| seeds | 694 | 90.862 | 89.563 | -1.300 |
| outcomes | 1257 | 64.407 | 62.129 | -2.277 |
| fresh confirmation | 1461 | 59.498 | 62.814 | +3.316 |

La diferencia en confirmación fresca es de +3,316 puntos, con intervalo condicional del 95% de [+1,926, +4,999]. En el mismo sorteo de confirmación, el mini stock fijado puntuó 64,379 frente a 62,814 del cuerpo enviado: -1,565 puntos, con intervalo del 95% de [-4,525, +0,597]. Un promedio de pesos 50:50 entre stock y el cuerpo enviado obtuvo 64,626 frente a 64,379 del stock (+0,247 puntos, intervalo [-1,952, +1,397]), por debajo del margen de 0,5 para adición greedy y del umbral de 0,8 para contribución de asiento de pago del protocolo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos (4,54B parámetros × 2 bytes), más memoria para activaciones y KV cache según contexto; el total real no está documentado.
- Entrenamiento documentado en una única RTX A6000 (48 GB), con acumulación de gradiente 16 y LoRA de rango 64.
- Cabe en GPU de consumo con suficiente VRAM para BF16 (por ejemplo, RTX 4090 de 24 GB) o mediante cuantización, aunque no se publican recetas de cuantización ni pesos GGUF.
- Opciones de despliegue: no disponibles; el modelo exige el runtime del chasis `d3-mini-4.5b-v1` y no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento proxy | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zils mini champion relay v1 | 4,54B | no disponible | 62,814 en confirmación fresca | Apache-2.0 | Público en HF, 0 descargas |
| Mini stock fijado (chasis `d3-mini-4.5b-v1`) | ~4,5B (no confirmado) | no disponible | 64,379 en confirmación fresca | no disponible | Público en HF (zils-ai) |
| joamCriff123/zils-mini-sx3 (cuerpo de partida) | no disponible | no disponible | 59,498 en confirmación fresca | no disponible | Público en HF |
| Qwen/Qwen3.5-4B (base upstream) | ~4B (no confirmado) | no disponible | no disponible | no disponible | Público en HF |

## Limitaciones y advertencias

- No es un modelo de generación de texto autónomo: sin el chasis `d3-mini-4.5b-v1` (runtime, prompt, tokenizador y capa de respuesta) los pesos no son utilizables como modelo genérico.
- Los resultados locales no establecen asiento de pago ni rendimiento en el examen privado del validador; el validador real usa ítems distintos y puede rechazar, no asentar o no pagar el cuerpo.
- En la confirmación fresca, el candidato rinde 1,565 puntos por debajo del mini stock, con un intervalo que incluye el cero; la mejora de la mezcla 50:50 (+0,247) queda por debajo de los umbrales del protocolo (0,5 y 0,8).
- El modelo de partida se entrenó explícitamente en los exámenes públicos de semilla v1 y v4, por lo que las puntuaciones de semilla son diagnósticas y se excluyeron del criterio principal; además, las filas de desarrollo y la receta de relay se usaron en un experimento lite anterior.
- Las filas de confirmación provienen de splits TRAIN públicos originales, no de un conjunto de test sellado u oficialmente independiente.
- La exposición upstream a las fuentes públicas es desconocida más allá de lo declarado.
- No se documentan sesgos, riesgos de alucinación, idiomas soportados ni limitaciones de contexto.
- Licencia Apache-2.0 permite uso comercial, pero la model card no hace ninguna reclamación de ingresos por minería ni de liberación; se conservan avisos y tarjetas upstream en `upstream/`, `LICENSE` y `NOTICE`.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Danieli1021/zils-mini-champion-relay-v1
- Modelo de partida: https://huggingface.co/joamCriff123/zils-mini-sx3/tree/2a84fc71743fc0df15c62e7c42a48c88fc2b3c61
- Chasis fijado: https://huggingface.co/zils-ai/d3-mini-4.5b-v1/tree/b54402a963373cc44713f18c9596c580e31cc68b
- Modelo base upstream: https://huggingface.co/Qwen/Qwen3.5-4B
- Guía del operador (contratos de runtime y pool): https://docs.zils.ai/operations/soup
