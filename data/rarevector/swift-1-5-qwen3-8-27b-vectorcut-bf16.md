# rarevector/Swift-1.5-Qwen3.8-27B-VectorCut-BF16

## Resumen

Swift-1.5-Qwen3.8-27B-VectorCut-BF16 es un checkpoint multimodal de precisión completa (BF16) publicado por rarevector (Rare Vector Labs) como derivado afinado de `ukisai/Swift-1.5-Qwen3.8-27b`, que a su vez parte de la familia Qwen3.8. El modelo conserva la arquitectura Qwen3 multimodal (pipeline `image-text-to-text`), con 26.895.998.464 parámetros reales según los safetensors, lo que lo sitúa en la categoría de 27B densos.

Su rasgo diferencial no es el entrenamiento sino la intervención quirúrgica: el pipeline "VectorCut" modifica únicamente proyecciones gated-MLP asociadas a mecanismos de rechazo (105 tensores de 1.199), dejando bit a bit idénticos los 333 tensores de visión, los 15 tensores de decodificación especulativa (MTP), los embeddings, la LM head, las layer norms y las cabezas de atención. El autor verifica esta afirmación con un audit SHA-256 raw-byte tensor a tensor.

Es relevante ahora porque propone una alternativa a la "abliteración global" convencional, que suele degradar razonamiento, visión o velocidad. Aquí se busca un modelo sin rechazos manteniendo intacta la capacidad multimodal y el MTP. La licencia es propia (swift-open-license-1.0), no Apache, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso (familia Qwen3.8) con vision encoder y cabezas MTP para decodificacion especulativa |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 master; el autor indica compatibilidad para derivar GGUF, EXL2, FP8 y MLX |
| Idiomas soportados | multilingual, en, zh, ja, ko, pt, ru, ar, fr, de, es |
| Licencia | swift-open-license-1.0 (derivado de Qwen3.8-27B, Apache 2.0) |
| Formato de pesos | safetensors (BF16), libreria transformers |

## Arquitectura y entrenamiento

El modelo es un transformer denso multimodal de la familia Qwen3.8, con un encoder de visión integrado (333 tensores bajo el prefijo `visual.*`) y cabezas de Multi-Token Prediction (15 tensores `mtp.*`) que habilitan decodificación especulativa. No es un MoE: los ~26,9B de parámetros son todos activos en cada forward pass.

El entrenamiento original corresponde a `ukisai/Swift-1.5-Qwen3.8-27b` (finetune de Qwen3.8-27B); no se detallan en la información disponible el volumen de tokens, la composición del dataset ni si hubo RLHF/DPO. La innovación técnica de esta release es el pipeline VectorCut: en lugar de intervenir el residual stream global en todos los bloques, se aplica una modificación localizada en proyecciones gated-MLP (105 tensores modificados de 1.199 totales). El autor reporta un audit SHA-256 raw-byte con 333/333 tensores de visión y 15/15 de MTP idénticos, y `PROTECTED_CHANGED: 0`.

## Capacidades

- Generación de texto conversacional multi-turno en 10 idiomas declarados (en, zh, ja, ko, pt, ru, ar, fr, de, es).
- Comprensión de imagen y texto (`image-text-to-text`), con encoder de visión preservado íntegro.
- Razonamiento y matemáticas heredados del modelo base Qwen3.8-27B (sin métricas publicadas en esta release).
- Generación de código, presumiblemente equivalente al base al no haberse tocado atención ni embeddings.
- Decodificación especulativa vía cabezas MTP intactas, lo que permite acelerar inferencia con motores compatibles.
- Comportamiento "uncensored": se han atenuado los mecanismos de rechazo mediante la modificación de las proyecciones gated-MLP identificadas.
- Soporte de tool calling / function calling: no disponible explícitamente en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente; se asume herencia del base.

## Casos de uso

- Análisis de documentos con imagen y texto: el encoder de visión está bit a bit idéntico al original, por lo que se puede usar para extracción de información de capturas, formularios o gráficos combinándolo con preguntas en lenguaje natural.
- Asistencia conversacional multilingüe: cubre 10 idiomas declarados, adecuado para atención al cliente en mercados con mezcla de en, es, fr, de, pt, ru, ar, ja, ko y zh.
- Investigación sobre alineación y rechazos: al estar documentada la intervención tensor a tensor, sirve como caso de estudio reproducible para estudiar cómo afecta la modificación de gated-MLP al comportamiento de negativa sin tocar atención.
- Generación de código en pipelines internos: al conservar atención, layer norms y LM head intactos, mantiene la calidad de generación del base; puede integrarse en flujos de revisión o autocompletado.
- Despliegue con decodificación especulativa: las cabezas MTP preservadas permiten usar motores que aprovechan speculative decoding para reducir latencia en producción.
- Base para cuantización downstream: al publicarse el master BF16, es punto de partida para generar GGUF, EXL2, FP8 o MLX y desplegar en hardware más modesto.
- Evaluación comparativa de ablaciones: útil para medir empíricamente la diferencia entre abliteración global y localizada en tareas de razonamiento y visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: ~54 GB solo para pesos (26,9B × 2 bytes), más overhead de activaciones y KV cache; en la práctica se recomienda 80 GB para contexto amplio.
- GPU recomendadas: A100 80 GB, H100 80 GB, o multi-GPU (2× RTX 4090 24 GB con tensor parallelism no trivial para este tamaño).
- Consumer GPU: no cabe en una sola RTX 4090 en BF16; requeriría cuantización (p. ej. FP8 o EXL2 4-bit) para acercarse a 24 GB.
- Opciones de despliegue: transformers (formato nativo), y derivados tras conversión a GGUF (llama.cpp/Ollama), EXL2 (ExLlamaV2), FP8 (vLLM/TGI con soporte) o MLX en Apple Silicon.
- Latencia y throughput: no disponibles en la información proporcionada; las cabezas MTP intactas permiten en principio acelerar la generación con motores que soporten speculative decoding.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Notas |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27B-VectorCut-BF16 | ~26,9B | no disponible | Si (333 tensores intactos) | swift-open-license-1.0 | Ablacion localizada en gated-MLP, MTP preservado |
| ukisai/Swift-1.5-Qwen3.8-27b (base) | ~27B | no disponible | Si | swift-open-license-1.0 | Modelo original con rechazos |
| Qwen/Qwen3.8-27B (upstream) | ~27B | no disponible | Si | Apache 2.0 | Base de la familia, licencia permisiva |
| Alternativas abliteradas globales de ~27B | ~27B | variable | Frecuentemente degradada | variable | Suelen perder vision o MTP |

## Limitaciones y advertencias

- La licencia swift-open-license-1.0 no es Apache 2.0: conviene revisar los términos de uso comercial antes de desplegar en producción.
- El modelo está deliberadamente "uncensored"; puede generar contenido que los modelos alineados rechazarían. Requiere filtros propios si se expone a usuarios finales.
- Riesgo de alucinación inherente a un modelo de ~27B; no hay benchmarks publicados en esta release que cuantifiquen su fiabilidad.
- La modificación de gated-MLP puede alterar sutilmente el comportamiento en tareas no relacionadas con rechazos; no hay evaluación independiente publicada.
- Longitud de contexto no documentada; no asumir ventanas largas sin verificar con el base.
- Soporte de tool calling y agentes no confirmado en la información disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.
- El audit SHA-256 es autoinformado por el autor; no verificado de forma independiente en esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rarevector/Swift-1.5-Qwen3.8-27B-VectorCut-BF16
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Upstream de la familia: https://huggingface.co/Qwen/Qwen3.8-27B
- Organización del autor: https://huggingface.co/RareVector
- Apoyo al autor: https://ko-fi.com/rarevector
