# Jongbin-kr/llama-3.1-8b-instruct_SNI-ours-c_24456_ffn-only

## Resumen

El modelo `llama-3.1-8b-instruct_SNI-ours-c_24456_ffn-only` es un ajuste fino (fine-tuning) del modelo base `meta-llama/Llama-3.1-8B-Instruct`, desarrollado por el usuario Jongbin-kr. Se trata de un adaptador entrenado mediante aprendizaje supervisado (SFT) utilizando la librería TRL de HuggingFace, con un tamaño de repositorio de 1.4 GB, lo que sugiere que no se actualizan todos los parámetros del modelo original, sino únicamente una parte de ellos (probablemente un adaptador de tipo LoRA o similar, enfocado en las capas feed-forward, como indica el sufijo "ffn-only").

El nombre del modelo indica que fue entrenado sobre un dataset denominado "SNI" (posiblemente Super-NaturalInstructions) con una variante "ours-c" y 24 456 ejemplos. La relevancia de este modelo radica en explorar estrategias de ajuste fino parcial (solo capas FFN) para mejorar el seguimiento de instrucciones o el razonamiento, manteniendo el resto de la arquitectura congelada. Sin embargo, no se proporcionan detalles sobre el rendimiento, la licencia o los idiomas soportados, por lo que su uso en producción requiere verificación adicional.

Al estar basado en Llama-3.1-8B-Instruct, hereda la arquitectura transformer decoder con 8 mil millones de parámetros y una ventana de contexto de 128 000 tokens, aunque el ajuste fino podría modificar ligeramente el comportamiento. No se dispone de información sobre cuantizaciones, benchmarks o capacidades específicas más allá de las del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama-3.1-8B) con ajuste fino parcial de capas feed-forward |
| Parametros totales | 8 030 millones (modelo base) + adaptador (número exacto no disponible) |
| Parametros activos | No disponible (posible adaptador LoRA, pero no se especifica) |
| Longitud de contexto | 128 000 tokens (heredado del modelo base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base soporta múltiples idiomas, pero este ajuste no lo especifica) |
| Licencia | No disponible (el modelo base tiene licencia Llama 3.1, pero este adaptador no declara una) |
| Formato de pesos | safetensors (según tags del repositorio) |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-3.1-8B-Instruct`, una arquitectura transformer decoder con 8 mil millones de parámetros, atención multi-cabeza y normalización RMSNorm, entrenada por Meta con una combinación de SFT y RLHF. Este ajuste fino utiliza la librería TRL (versión 0.29.1) y se entrena con supervisión directa (SFT) sobre un dataset llamado "SNI-ours-c" con 24 456 ejemplos. El sufijo "ffn-only" indica que solo se actualizan los pesos de las capas feed-forward (FFN) del transformer, dejando congeladas las capas de atención y otras. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como DPO o RLHF.

No hay información sobre innovaciones técnicas específicas en el entrenamiento, más allá del enfoque de ajuste parcial de FFN. El repositorio incluye enlaces a un run de Weights & Biases, pero no se han extraído métricas ni curvas de pérdida.

## Capacidades

- Generación de texto y seguimiento de instrucciones: al ser un fine-tuning de Llama-3.1-8B-Instruct, conserva las capacidades básicas del modelo base para completar texto, responder preguntas y mantener conversaciones multi-turno.
- Razonamiento y conocimiento general: hereda el conocimiento y razonamiento del modelo base, aunque el ajuste en FFN podría modificar ligeramente el comportamiento en tareas específicas de instrucciones.
- Multilingüismo: el modelo base soporta varios idiomas (inglés, francés, alemán, hindi, italiano, portugués, español, tailandés, etc.), pero no se confirma si este ajuste mantiene esas capacidades.
- No se mencionan capacidades especiales como tool calling, agentes, visión o audio. Dado que el ajuste se centra en FFN, es probable que no se hayan añadido funcionalidades nuevas.

## Casos de uso

- Experimentación académica en ajuste fino parcial: el modelo sirve como referencia para estudiar cómo afecta actualizar solo las capas FFN en tareas de instrucciones, comparado con un ajuste completo o con LoRA estándar.
- Fine-tuning adicional sobre dominios específicos: al ser un adaptador ligero, puede combinarse con otros adaptadores o continuar entrenándose en datasets especializados sin necesidad de ajustar todos los parámetros.
- Prototipado rápido de chatbots o asistentes: gracias a su tamaño reducido (adaptador) y al uso del modelo base, se puede desplegar en entornos con recursos limitados para probar interacciones conversacionales.
- Evaluación de técnicas de eficiencia en entrenamiento: investigadores pueden analizar el impacto de congelar capas de atención y solo entrenar FFN en términos de rendimiento y coste computacional.
- Generación de texto en entornos con restricciones de VRAM: al requerir solo el adaptador adicional sobre el modelo base, se puede cargar en GPUs de consumo medio (por ejemplo, RTX 3090 o 4090) con cuantización.
- Benchmarking de adaptadores: el modelo puede utilizarse como punto de comparación en estudios sobre métodos de PEFT (Parameter-Efficient Fine-Tuning), especialmente en la variante "FFN-only".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este adaptador. Se recomienda evaluar el modelo en tareas específicas antes de su uso en producción.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador sobre Llama-3.1-8B, la inferencia requiere cargar el modelo base completo (aproximadamente 16 GB en fp16, o menos con cuantización). El adaptador en sí ocupa muy poco (el repositorio pesa 1.4 GB, probablemente en fp32 o fp16). Se recomienda al menos 16 GB de VRAM para fp16 sin cuantización, o 8-10 GB con cuantización de 4 bits.
- GPUs recomendadas: RTX 3090, RTX 4090, A100, H100, o cualquier GPU con al menos 16 GB de VRAM para fp16. Con cuantización AWQ o GPTQ, puede caber en GPUs de 8 GB (RTX 3060, RTX 4060).
- Opciones de despliegue: se puede servir con vLLM, TensorRT-LLM, llama.cpp (convirtiendo a GGUF) o mediante la API de HuggingFace con `transformers`. También es compatible con Ollama si se convierte a formato GGUF.
- Latencia y throughput: no disponibles. Dependerá del hardware y de la cuantización elegida.

## Comparativa con modelos similares

Dado que se trata de un adaptador específico sin métricas publicadas, la comparación se basa en el modelo base y en otros adaptadores del mismo autor:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `Jongbin-kr/llama-3.1-8b-instruct_SNI-ours-c_24456_ffn-only` | 8B (base) + adaptador | 128k | No disponible | Ajuste FFN-only sobre SNI |
| `meta-llama/Llama-3.1-8B-Instruct` | 8B | 128k | Llama 3.1 Community License | Modelo base original |
| `Jongbin-kr/llama-3.1-8b-instruct-4x1-moe` | 8B (base) + MoE | 128k | No disponible | Variante con mezcla de expertos del mismo autor |
| `Jongbin-kr/llama-3.1-8b-instruct-sni-ffn-lora` | 8B (base) + LoRA | 128k | No disponible | Adaptador LoRA similar, también sobre SNI |

No hay información sobre rendimiento comparativo entre estos modelos. Se recomienda probarlos en tareas concretas si se necesita elegir uno.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al derivar de Llama-3.1-8B-Instruct, el modelo puede heredar sesgos presentes en los datos de entrenamiento originales y generar contenido falso o inventado, especialmente en temas de actualidad o datos precisos.
- Licencia incierta: la model card no especifica una licencia clara para el adaptador. El modelo base tiene la licencia Llama 3.1 Community License, que impone restricciones de uso comercial y requiere atribución. Se debe verificar la compatibilidad antes de usarlo en productos comerciales.
- Sin documentación de rendimiento: no hay benchmarks ni estudios de robustez, por lo que no se garantiza un rendimiento específico en tareas reales.
- Limitaciones de idioma: aunque el modelo base es multilingüe, el ajuste sobre un dataset "SNI" (probablemente en inglés) podría degradar el rendimiento en otros idiomas, aunque no se ha confirmado.
- Dependencia del modelo base: el adaptador no funciona de forma independiente; requiere cargar los pesos de `meta-llama/Llama-3.1-8B-Instruct`, lo que implica aceptar los términos de uso de Meta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jongbin-kr/llama-3.1-8b-instruct_SNI-ours-c_24456_ffn-only
- Modelo relacionado (LoRA): https://huggingface.co/Jongbin-kr/llama-3.1-8b-instruct-sni-ffn-lora
- Modelo relacionado (MoE): https://huggingface.co/Jongbin-kr/llama-3.1-8b-instruct-4x1-moe
- Run de entrenamiento en Weights & Biases: https://wandb.ai/jongbin-kr-skiml_moe/sft_dense_sni_roster_ffn_only/runs/7ozuvenr
