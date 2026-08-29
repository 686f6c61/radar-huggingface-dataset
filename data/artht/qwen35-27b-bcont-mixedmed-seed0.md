# ArthT/qwen35-27b-bcont-mixedmed-seed0

## Resumen

Este modelo es un fine-tuning supervisado (SFT) del modelo Qwen3.5-27B de Alibaba, publicado por el usuario ArthT en agosto de 2026. El nombre del repositorio (bcont-mixedmed-seed0) sugiere un entrenamiento continuado sobre datos médicos mixtos con semilla fija, aunque la model card no documenta la composición del dataset, por lo que esta interpretación es una inferencia a partir del nombre y no un dato confirmado.

El modelo base Qwen3.5-27B es un modelo denso multimodal de 27.000 millones de parámetros lanzado en febrero de 2026 por el equipo Qwen. Emplea una arquitectura híbrida que combina Gated Delta Networks y Gated Attention, con una ventana de contexto de 262.000 tokens y soporte para Multi-Token Prediction (MTP). A diferencia de las variantes MoE de la familia Qwen3.5, esta versión es completamente densa.

El fine-tuning se realizó con el framework TRL 0.24.0, Transformers 5.5.0 y PyTorch 2.13.0, utilizando la técnica de SFT. El repositorio pesa 79,6 GB y los pesos están en formato safetensors. El modelo no tiene descargas ni valoraciones de la comunidad, por lo que su rendimiento real no ha sido validado externamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido con Gated Delta Networks y Gated Attention |
| Parametros totales | 27B |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.000 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-27B es un modelo denso multimodal que combina Gated Delta Networks con Gated Attention en una arquitectura híbrida. Incorpora Multi-Token Prediction (MTP), que permite predecir varios tokens por paso de decodificación, mejorando el throughput en inferencia. A diferencia de las variantes MoE de la familia Qwen3.5 (35B-A3B, 122B-A10B, 397B-A17B), los 27B parámetros se activan en su totalidad en cada forward pass.

El fine-tuning se realizó mediante SFT con TRL 0.24.0, Transformers 5.5.0, PyTorch 2.13.0, Datasets 4.3.0 y Tokenizers 0.22.2. La model card no especifica el dataset de entrenamiento, el número de pasos, la tasa de aprendizaje ni otros hiperparámetros. El nombre del modelo sugiere un entrenamiento continuado sobre datos médicos mixtos, pero no hay documentación que lo confirme.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-27B, incluyendo razonamiento complejo y generación coherente de texto.
- Multimodal: el modelo base soporta entrada de visión y lenguaje, aunque no se documenta si el fine-tuning preserva estas capacidades.
- Contexto largo: ventana de 262.000 tokens, adecuada para documentos extensos y conversaciones multi-turno.
- Multi-Token Prediction: el modelo base incorpora MTP, que mejora la eficiencia de decodificación.
- Posible especialización médica: el nombre del repositorio sugiere entrenamiento sobre datos médicos, pero no hay confirmación documental.

## Casos de uso

- Análisis de documentación clínica: con 262K de contexto, el modelo puede procesar historiales médicos extensos y extraer información relevante para profesionales sanitarios, siempre con supervisión humana.
- Revisión de literatura biomédica: si el fine-tuning incluye datos médicos, podría asistir en el resumen y la extracción de hallazgos de artículos científicos.
- Asistente de consulta médica: generación de respuestas a preguntas sobre salud en entornos controlados, con validación por personal cualificado.
- Procesamiento de informes de laboratorio: interpretación y resumen de resultados de pruebas médicas en documentos largos.
- Chat conversacional con contexto ampliado: el modelo puede mantener conversaciones multi-turno extensas gracias a su ventana de 262K tokens.
- Investigación y desarrollo de modelos médicos: como punto de partida para nuevos fine-tunings en dominios sanitarios, dado que el nombre sugiere una base ya adaptada a datos médicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 27B parámetros densos. En BF16/FP16 se necesitan aproximadamente 54 GB de VRAM. Con cuantización INT8 se reduce a ~27 GB, y con INT4 a ~14 GB.
- GPU recomendadas: A100 80GB o H100 para inferencia en precisión completa; RTX 4090 (24GB) o similar con cuantización INT4.
- Despliegue: compatible con vLLM según la documentación de vLLM Recipes para la familia Qwen3.5, y con Transformers mediante el pipeline de text-generation.
- El repositorio pesa 79,6 GB, consistente con pesos en BF16/FP16 (~54 GB) más archivos adicionales del repositorio.
- Para fine-tuning adicional se recomienda al menos 2x A100 80GB o equivalente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| Qwen3.5-27B (base) | 27B denso | 262K | Gated DeltaNet + Gated Attention | No disponible |
| ArthT/qwen35-27b-bcont-mixedmed-seed0 | 27B denso | 262K | Gated DeltaNet + Gated Attention (fine-tuned) | No disponible |
| Qwen3.5-35B-A3B | 35B total, 3B activos | No disponible | MoE | No disponible |
| Qwen3.5-122B-A10B | 122B total, 10B activos | No disponible | MoE | No disponible |

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial y redistribución.
- No se han publicado benchmarks ni evaluaciones del fine-tuning, por lo que se desconoce el impacto real del entrenamiento en el rendimiento.
- El dataset de fine-tuning no está documentado; el nombre sugiere datos médicos, pero no hay confirmación.
- El modelo tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- Al ser un fine-tuning de un modelo multimodal, no se garantiza que las capacidades de visión se preserven tras el SFT.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente relevante en dominios médicos donde los errores pueden tener consecuencias graves.
- La fecha de creación (agosto de 2026) y el uso de versiones recientes de las librerías sugieren que el modelo es muy nuevo y puede tener problemas no detectados.

## Enlaces

- HuggingFace: https://huggingface.co/ArthT/qwen35-27b-bcont-mixedmed-seed0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Colección Qwen3.5 de unsloth: https://huggingface.co/collections/unsloth/qwen35
- Guía de uso de Qwen3.5 en vLLM: https://docs.vllm.ai/projects/recipes/en/stable/Qwen/Qwen3.5.html
- Especificaciones de Qwen3.5-27B: https://apxml.com/models/qwen35-27b
- Qwen3.5-27B en vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.5-27B
