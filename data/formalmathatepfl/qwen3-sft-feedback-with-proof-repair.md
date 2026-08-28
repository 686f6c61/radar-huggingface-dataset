# formalmathatepfl/qwen3-sft-feedback-with-proof-repair

## Resumen

El modelo `formalmathatepfl/qwen3-sft-feedback-with-proof-repair` es un fine-tuning completo (full fine-tuning) del modelo `formalmathatepfl/qwen3-cpt`, que a su vez deriva de Qwen3-8B. Ha sido desarrollado por el grupo formalmathatepfl, asociado a la EPFL (Suiza), y su nombre sugiere una orientación hacia el feedback y la reparación de demostraciones matemáticas formales, aunque la model card no proporciona detalles explícitos sobre su propósito o dataset de entrenamiento.

Con 8.190.735.360 parámetros (aproximadamente 8,2 mil millones), el modelo se distribuye en formato safetensors y ocupa unos 16,4 GB en el repositorio. La licencia se declara como "other", lo que implica condiciones no estándar que deben consultarse con el autor. No se han publicado resultados de benchmarks ni especificaciones de contexto o idiomas soportados, lo que limita su evaluación directa.

La relevancia de este modelo radica en su posible aplicación en el ámbito de las matemáticas formales, un campo en crecimiento donde los asistentes de prueba y los sistemas de razonamiento automático requieren modelos capaces de generar y corregir demostraciones. Sin embargo, al carecer de documentación técnica detallada, su uso en producción debe considerarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3-8B, fine-tuning de formalmathatepfl/qwen3-cpt) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | No disponible |
| Licencia | other (consultar con el autor) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `formalmathatepfl/qwen3-cpt`, que a su vez es una versión continuamente preentrenada (CPT) de Qwen3-8B. La arquitectura subyacente es la de Qwen3-8B, un transformer decoder-only con atención estándar, aunque no se dispone de detalles adicionales sobre posibles modificaciones estructurales.

El entrenamiento se realizó con los siguientes hiperparámetros: learning rate de 2e-5, batch size total de 8 (con 8 GPUs), una sola época, optimizador AdamW (betas 0.9/0.999), scheduler cosine con warmup ratio de 0.05. El dataset utilizado se denomina "sft dataset" pero no se especifica su composición ni tamaño. No se menciona el uso de RLHF, DPO u otras técnicas de alineación posteriores al SFT.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje basado en Qwen3-8B, es capaz de generar texto coherente en tareas de lenguaje natural.
- Razonamiento: hereda las capacidades de razonamiento del modelo base, aunque no hay datos específicos sobre su rendimiento en tareas de lógica o matemáticas.
- Posible asistencia en demostraciones matemáticas formales: el nombre del modelo ("feedback-with-proof-repair") sugiere que fue entrenado para proporcionar feedback y reparar pruebas, pero no hay confirmación en la documentación.
- Tool calling / function calling: no disponible (no se menciona en la información).
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistencia en demostraciones matemáticas formales: si el modelo cumple lo que su nombre indica, podría utilizarse para revisar y corregir pruebas en asistentes como Lean, Coq o Isabelle, generando feedback sobre pasos incorrectos y proponiendo reparaciones. Sin embargo, esta funcionalidad no está confirmada.
- Generación de texto general: como modelo de 8B fine-tuneado, puede emplearse en tareas de redacción, resumen o traducción, aunque su especialización podría reducir su rendimiento en dominios no matemáticos.
- Chat conversacional: al ser un modelo de lenguaje, puede integrarse en sistemas de diálogo, aunque no hay evidencia de entrenamiento específico para ello.
- Investigación en IA para matemáticas: el modelo puede servir como punto de partida para experimentos en razonamiento automático y verificación de pruebas.
- Fine-tuning adicional: al estar disponible en safetensors, puede utilizarse como base para nuevos fine-tunings en dominios específicos.
- Evaluación comparativa de modelos de 8B: su existencia permite comparar el efecto del SFT con feedback y proof repair frente a otros fine-tunings de Qwen3-8B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model-index de la model card está vacío, por lo que no hay datos de MMLU, HumanEval, GSM8K u otras métricas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 8,2B parámetros en FP16 se necesitan aproximadamente 16 GB de VRAM. Con cuantización a 4 bits (si estuviera disponible) se podría reducir a unos 5-6 GB, pero no se ofrecen versiones cuantizadas en el repositorio.
- GPU recomendadas: una GPU con 16 GB o más, como NVIDIA RTX 4090, A100 (40 GB) o H100 (80 GB), es adecuada para inferencia en FP16. Para entrenamiento o fine-tuning adicional se recomiendan GPUs con mayor memoria.
- Compatibilidad con GPUs de consumo: una RTX 4090 (24 GB) puede ejecutar el modelo en FP16, pero con limitaciones de contexto si este fuera largo. GPUs con 8 GB (como RTX 3070) no son suficientes sin cuantización.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, o mediante llama.cpp si se convierte a GGUF (no disponible actualmente). También es compatible con Ollama si se genera un archivo Modelfile.
- Latencia y throughput: no se dispone de datos medidos. En una A100, un modelo de 8B en FP16 suele generar entre 20 y 50 tokens por segundo, dependiendo de la implementación y el contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| formalmathatepfl/qwen3-sft-feedback-with-proof-repair | 8,19 B | No disponible | other | HuggingFace |
| Qwen3-8B (base) | 8,19 B | 32K (típico) | Apache 2.0 | HuggingFace |
| Llama 3.1 8B | 8,03 B | 128K | Llama 3.1 License | HuggingFace |
| Mistral 7B v0.3 | 7,24 B | 32K | Apache 2.0 | HuggingFace |

La comparación se limita al tamaño y licencia, ya que no hay datos de rendimiento para el modelo evaluado. Qwen3-8B es el modelo base y probablemente tenga un rendimiento superior en tareas generales, mientras que este fine-tuning podría estar especializado en matemáticas formales, aunque no se puede confirmar.

## Limitaciones y advertencias

- Documentación insuficiente: la model card es autogenerada y no proporciona información sobre el dataset, el propósito o las limitaciones específicas.
- Licencia "other": los términos de uso no están claros; es necesario contactar con el autor antes de cualquier uso comercial o redistribución.
- Sin benchmarks publicados: no hay evidencia objetiva de su rendimiento en tareas estándar.
- Posibles sesgos heredados: al derivar de Qwen3-8B, puede heredar sesgos y alucinaciones del modelo base, sin que se hayan realizado evaluaciones específicas.
- Riesgo de alucinación en dominios matemáticos: si se usa para asistencia en pruebas, podría generar pasos incorrectos o justificaciones falsas, por lo que se requiere verificación humana.
- Sin soporte de cuantización oficial: no se ofrecen versiones GGUF o AWQ, lo que limita su despliegue en entornos con poca memoria.
- Fecha de creación futura: el modelo está fechado en 2026-08-28, lo que sugiere que es un artefacto reciente o hipotético; se recomienda verificar su disponibilidad real.

## Enlaces

- [HuggingFace - formalmathatepfl/qwen3-sft-feedback-with-proof-repair](https://huggingface.co/formalmathatepfl/qwen3-sft-feedback-with-proof-repair)
- [HuggingFace - formalmathatepfl/qwen3-8b-sft-feedback](https://huggingface.co/formalmathatepfl/qwen3-8b-sft-feedback)
- [FriendliAI - qwen3-8b-feedback-sft](https://friendli.ai/models/formalmathatepfl/qwen3-8b-feedback-sft)
- [FriendliAI - qwen3-8b-sft](https://friendli.ai/models/formalmathatepfl/qwen3-8b-sft)
- [ModelHub - formalmathatepfl/qwen3-8b-sft](https://dev.modelhub.org.cn/formalmathatepfl/qwen3-8b-sft)
