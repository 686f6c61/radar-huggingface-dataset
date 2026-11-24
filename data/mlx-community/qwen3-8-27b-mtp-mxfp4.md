# mlx-community/Qwen3.8-27B-MTP-mxfp4

## Resumen

Qwen3.8-27B-MTP-mxfp4 es un adaptador de pesos que contiene únicamente el cabezal de predicción multi-token (MTP, Multi-Token Prediction) extraído del checkpoint Qwen/Qwen3.8-27B y cuantizado en formato MXFP4 con `mlx_vlm.convert` por el equipo de mlx-community. No es un modelo autónomo: se emplea como modelo borrador (draft) en decodificación especulativa junto a un checkpoint objetivo compatible de Qwen3.8 27B, que aporta las embeddings de tokens y el cabezal de lenguaje en tiempo de ejecución.

Su relevancia es práctica: la decodificación especulativa con MTP permite al modelo objetivo aceptar varios tokens por paso de verificación, reduciendo la latencia de generación sin alterar la distribución de salida del modelo grande. Al estar cuantizado en MXFP4 con grupo de 32 y empaquetado para MLX, el adaptador ocupa solo 0,3 GB, lo que lo hace adecuado para equipos Apple Silicon donde el modelo objetivo de 27B ya consume la mayor parte de la memoria unificada.

El modelo base pertenece a la familia Qwen3.8 (arquitectura `qwen3_5_mtp`), con licencia Apache 2.0 y soporte declarado únicamente para inglés. El adaptador conserva esa licencia y las limitaciones del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cabezal MTP (model_type `qwen3_5_mtp`), adaptador de decodificación especulativa sobre Qwen3.8 27B |
| Parametros totales | 424.699.392 (solo el drafter MTP; el modelo objetivo Qwen3.8 27B es aparte) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la determina el checkpoint objetivo Qwen3.8 27B) |
| Tipos de cuantizacion | MXFP4, group size 32 |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), cuantizado MXFP4; repo de 0,3 GB |

## Arquitectura y entrenamiento

El adaptador no se entrena de forma independiente: son los pesos del bloque MTP ya presentes en Qwen/Qwen3.8-27B, separados del checkpoint principal y cuantizados a MXFP4 con grupo de 32 mediante `mlx_vlm.convert`. El tipo de modelo declarado es `qwen3_5_mtp` y el tamaño de bloque MTP es 3, es decir, el drafter predice hasta tres tokens adicionales por paso que el modelo objetivo verifica en paralelo.

El runtime es MLX a través de `mlx-vlm`, que detecta automáticamente `--draft-kind mtp` a partir del `model_type`. La revisión de origen del checkpoint es `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`. No se dispone de información sobre volumen de tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO en la información proporcionada; esos detalles corresponden al modelo base Qwen3.8 27B y no se incluyen aquí.

## Capacidades

- Decodificación especulativa como modelo borrador: acelera la generación del checkpoint objetivo Qwen3.8 27B verificando propuestas de hasta 3 tokens por bloque MTP.
- Generación de texto y conversación, heredadas del modelo objetivo (el adaptador por sí solo no genera texto).
- Modo thinking: el ejemplo oficial usa `--enable-thinking`, por lo que el pipeline soporta razonamiento extendido del objetivo.
- Integración con `mlx-vlm` para inferencia en Apple Silicon.
- Capacidades multimodales potenciales vía `mlx-vlm`, aunque no se detallan en la información disponible.
- Tool calling, agentes y multilingüismo: no disponibles en este adaptador; dependen del checkpoint objetivo y no se documentan aquí.

## Casos de uso

- Aceleración de inferencia local en Mac: cargar el objetivo Qwen3.8 27B en MXFP4 y este drafter MTP para reducir la latencia por token en generación de texto interactiva, aprovechando la memoria unificada de los chips Apple.
- Asistentes de código en el editor: usar la decodificación especulativa para bajar el tiempo hasta el primer token completo en autocompletado de funciones, con el drafter aportando propuestas de 3 tokens que el objetivo verifica.
- Chat multi-turno con razonamiento: ejecutar `mlx_vlm generate` con `--enable-thinking` y el drafter MTP para mantener respuestas razonadas con menor coste de decodificación en sesiones largas.
- Servicio de generación por lotes en estaciones de trabajo Apple: desplegar el par objetivo + drafter para tareas de resumen o redacción donde el throughput importa más que la latencia individual.
- Prototipado e investigación en decodificación especulativa: usar este adaptador como referencia reproducible de un drafter MTP cuantizado en MXFP4 para comparar tasas de aceptación frente a otras estrategias de draft.
- Evaluación de pipelines MLX: validar la integración de `mlx-vlm` con `--draft-kind mtp` antes de migrar cargas de trabajo a producción en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: el adaptador ocupa 0,3 GB en disco; en memoria, el drafter de 424,7 M de parámetros en MXFP4 requiere aproximadamente 0,25-0,4 GB adicionales sobre el objetivo.
- El requisito dominante es el checkpoint objetivo Qwen3.8 27B: en MXFP4 se estima en torno a 14-16 GB de pesos, más overhead de contexto y KV cache.
- GPU recomendadas: no aplica de forma nativa; el runtime es MLX, orientado a Apple Silicon (series M1/M2/M3/M4 con memoria unificada de 32 GB o superior para el par completo).
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por este adaptador, que depende de MLX; para esos entornos habría que usar el checkpoint original en otro formato.
- Cabe en GPU de consumo solo en el ecosistema Apple; en NVIDIA consumer no es desplegable tal cual.
- Opciones de despliegue: `mlx-vlm` (CLI `mlx_vlm generate`); vLLM, llama.cpp, Ollama y TGI no son compatibles con este formato.
- Latencia y throughput: no disponibles; la ganancia depende de la tasa de aceptación del drafter y del ancho de banda de memoria del chip.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mlx-community/Qwen3.8-27B-MTP-mxfp4 | 424,7 M (drafter) | no disponible | safetensors MLX MXFP4 | Apache 2.0 | Hugging Face, 416 descargas |
| Qwen/Qwen3.8-27B (objetivo) | 27B (nominal) | no disponible | safetensors | Apache 2.0 | Hugging Face |
| mlx-community/Qwen3.8-27B-mxfp4 (objetivo cuantizado) | 27B (nominal) | no disponible | safetensors MLX MXFP4 | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: sin un checkpoint objetivo Qwen3.8 27B compatible no produce salida.
- El adaptador y el objetivo deben derivar del mismo checkpoint Qwen3.8 27B; mezclar revisiones distintas puede degradar la tasa de aceptación o producir salidas incorrectas.
- Solo soporta inglés según la model card.
- Cuantización MXFP4 con grupo de 32: puede introducir una ligera pérdida de calidad en el drafter, aunque el objetivo verifica cada token aceptado.
- Dependencia exclusiva del ecosistema MLX y hardware Apple Silicon; no desplegable en vLLM, llama.cpp, Ollama o TGI.
- Riesgo de alucinación y sesgos: heredados del modelo base Qwen3.8 27B; no se documentan sesgos específicos del adaptador.
- Licencia Apache 2.0 permite uso comercial, pero se mantienen las limitaciones y avisos del modelo original.
- `inference: false` en la model card: no debe tratarse como checkpoint de inferencia directa.

## Enlaces

- Hugging Face: https://huggingface.co/mlx-community/Qwen3.8-27B-MTP-mxfp4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint objetivo cuantizado referenciado en el ejemplo: https://huggingface.co/mlx-community/Qwen3.8-27B-mxfp4
- Repositorio mlx-vlm: no disponible en la información proporcionada
- Paper o blog de Qwen3.8: no disponible en la información proporcionada
