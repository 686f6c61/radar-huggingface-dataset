# btbtyler09/Qwen3.8-27B-GPTQ-4bit

## Resumen

Qwen3.8-27B-GPTQ-4bit es una cuantización GPTQ de 4 bits del modelo multimodal denso Qwen/Qwen3.8-27B, desarrollada por btbtyler09. El modelo original, de la familia Qwen3.8, combina un decodificador de texto con atención híbrida (48 capas de atención lineal GatedDeltaNet y 16 capas de atención completa) y un encoder de visión ViT de 27 bloques, alcanzando una ventana de contexto de 262 144 tokens. Esta versión cuantizada emplea el método FOEM (First-Order Error Matters, AAAI 2026) para compensar errores de primer orden durante la cuantización, logrando una degradación de perplejidad de solo +0,81 % respecto al modelo en BF16, sin necesidad de excluir módulos a precisión completa.

El checkpoint incluye el encoder de visión completo y el módulo MTP (Multi-Token Prediction) para decodificación especulativa, ambos mantenidos en BF16. Con un tamaño total de 21 GB (frente a los ~56 GB del original), ofrece una compresión de 2,6× manteniendo compatibilidad con los kernels de vLLM para GPTQ. Está diseñado para servir en producción con vLLM, soportando entrada de imagen y texto, y es distribuible bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (multimodal texto + visión, densa) |
| Parametros totales | 27 781 427 952 (~27,8 B) |
| Parametros activos | No aplica (modelo denso, sin MoE) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | GPTQ 4-bit (INT4) con FOEM, group size 32, simétrico; componentes en BF16/FP16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (GPTQ 4-bit + BF16 para visión y MTP) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida de atención: 64 capas en total, con un patrón repetido de 3 capas de atención lineal (GatedDeltaNet) por cada capa de atención completa (48 lineales + 16 completas). El tamaño oculto es de 5120 y el intermedio de 17408, con MLP denso (sin mezcla de expertos). El encoder de visión es un ViT de 27 bloques, y el módulo MTP añade una cabeza de decodificación especulativa de una capa.

La cuantización GPTQ se realizó con GPTQModel v6.0.3, aplicando el método FOEM (First-Order Error Matters) que añade un término de compensación de error de primer orden a la actualización de pesos basada en la Hessiana. La configuración incluye group size 32, activación simétrica, `desc_act` desactivado, `true_sequential` activado, y ponderación MSE con factor 2.0. La calibración se hizo con 256 muestras mezclando evol-codealpaca-v1 (código) y C4 (texto general en inglés), distribuidas uniformemente en longitudes de contexto de 256 a 2048 tokens, optimizando para rendimiento fuera de distribución. Los módulos de visión, MTP, normas, embeddings y la cabeza de salida se mantienen en BF16/FP16 para preservar calidad.

## Capacidades

- Generación de texto y razonamiento multilingüe (idiomas exactos no disponibles en los metadatos).
- Comprensión de imágenes: el encoder de visión ViT permite entrada de imágenes junto con texto (pipeline image-text-to-text).
- Decodificación especulativa mediante el módulo MTP, que acelera la generación sin pérdida de calidad.
- Soporte de contexto largo de hasta 262 144 tokens, adecuado para documentos extensos o conversaciones multi-turno.
- Compatible con tool calling y uso como modelo conversacional (etiqueta `conversational`).
- Integración con vLLM para servir en producción, incluyendo parámetros de tensor parallelism y limitación de imágenes por petición.
- Cuantización 4-bit pura sin exclusión de módulos del decodificador, manteniendo compatibilidad con kernels GPTQ de vLLM.

## Casos de uso

- Atención al cliente automatizada: con 262K tokens de contexto, puede gestionar conversaciones multi-turno largas y mantener el historial completo del usuario, reduciendo la pérdida de información en interacciones prolongadas.
- Análisis de documentos extensos con imágenes: el modelo acepta hasta 2 imágenes por petición y texto de gran longitud, permitiendo resumir informes técnicos o legales que incluyan figuras, diagramas o capturas.
- Generación de código asistida en entornos de desarrollo: su calibración incluye datos de código (evol-codealpaca-v1) y soporta tool calling, por lo que puede integrarse en pipelines de CI/CD para autocompletar, revisar o documentar código.
- Asistentes virtuales multimodales: combina visión y texto para responder preguntas sobre imágenes (por ejemplo, diagnóstico de problemas en fotografías de hardware o interpretación de gráficos).
- RAG con contexto largo: al mantener 256K tokens de ventana, puede procesar corpus extensos en una sola pasada, reduciendo la necesidad de fragmentación y mejorando la coherencia en respuestas basadas en recuperación.
- Despliegue en entornos con recursos limitados: al ocupar solo 21 GB en 4 bits, cabe en GPUs de consumo de 24 GB (p. ej., RTX 4090) con cuantización adicional o en configuraciones multi-GPU para contexto completo, habilitando inferencia local de un modelo de 27B multimodal.

## Benchmarks y rendimiento

La única métrica publicada en la información disponible es la perplejidad en wikitext-2-raw-v1 (test set, seq_len=2048, stride=512):

| Modelo | Perplejidad | Degradación |
|---|---|---|
| BF16 original (Qwen3.8-27B) | 6,4457 | — |
| GPTQ 4-bit FOEM (este modelo) | 6,4982 | +0,81 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint completo ocupa 21 GB (decodificador cuantizado ~19 GB + visión BF16 ~1,2 GB + MTP BF16 ~0,85 GB). Para inferencia con contexto corto, se necesitan al menos 24 GB de VRAM en una sola GPU.
- Para la ventana completa de 262 144 tokens, la caché KV requiere VRAM adicional significativa; el comando de ejemplo de vLLM usa `--tensor-parallel-size 4`, sugiriendo 4 GPUs (p. ej., 4× A100 80GB o 4× RTX 4090 24GB) para servir con contexto máximo.
- GPUs compatibles: cualquier GPU con soporte CUDA o ROCm y suficiente VRAM; se recomienda FP16 para kernels GPTQ en ROCm.
- Opciones de despliegue: vLLM (recomendado, con soporte de tensor parallelism y limitación de imágenes), también compatible con transformers y GPTQModel para carga directa.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware, el contexto y el número de imágenes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (BF16) | ~27,8 B | 262 144 | BF16 | Apache 2.0 | Modelo base original, ~56 GB |
| btbtyler09/Qwen3.8-27B-GPTQ-4bit | ~27,8 B | 262 144 | GPTQ 4-bit + FOEM | Apache 2.0 | Este modelo, 21 GB, +0,81 % perplejidad |
| qwen3_5_moe (hermano MoE) | No disponible | No disponible | No disponible | No disponible | Variante MoE de la misma familia, sin datos concretos |

No se dispone de información suficiente sobre otros modelos comparables de la misma categoría (27B multimodal con contexto 256K) en la información proporcionada.

## Limitaciones y advertencias

- Idiomas soportados: no especificados en los metadatos; la calibración se realizó con datos en inglés y código, por lo que el rendimiento en otros idiomas puede ser inferior.
- Riesgo de alucinación: inherente a los modelos generativos; la cuantización 4-bit puede aumentar ligeramente la probabilidad de errores en tareas de razonamiento complejo, aunque la degradación de perplejidad es baja (+0,81 %).
- Sesgos: no se han documentado sesgos específicos, pero el entrenamiento con datos mayoritariamente en inglés y código puede reflejar sesgos de esos corpus.
- Limitaciones de contexto: aunque la ventana es de 262K tokens, el uso completo requiere hardware multi-GPU; en configuraciones de una sola GPU el contexto efectivo será menor.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero el modelo base y la cuantización deben atribuirse adecuadamente.
- Bug conocido en vLLM: hasta al menos vLLM 0.19.x, `Qwen3_5TextConfig` define `ignore_keys_at_rope_validation` como lista en lugar de conjunto, lo que provoca un `TypeError`; se requiere un parche manual antes de servir (incluido en la model card).
- La calibración se optimizó para rendimiento fuera de distribución; calibrar en wikitext directamente daría menor perplejidad en ese conjunto pero peor generalización.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/btbtyler09/Qwen3.8-27B-GPTQ-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper FOEM (AAAI 2026): https://ojs.aaai.org/index.php/AAAI/article/view/40123
- Repositorio GPTQModel: https://github.com/modelcloud/gptqmodel
