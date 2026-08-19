# dementor-research/self_sft_oasst1_phi-4_as_phi-4_seed42

## Resumen

Este modelo es un adapter LoRA (Low-Rank Adaptation) desarrollado por el usuario `dementor-research`, diseñado para fine-tuning del modelo base `microsoft/phi-4` mediante Supervised Fine-Tuning (SFT) sobre el dataset Open Assistant (OASST1). El nombre del repositorio (`self_sft_oasst1_phi-4_as_phi-4_seed42`) sugiere que se trata de un experimento de auto-entrenamiento o entrenamiento con un seed fijo (42), aunque no se proporciona documentación adicional que aclare el propósito exacto.

El adapter pesa 0.4 GB y está publicado en formato PEFT (Parameter-Efficient Fine-Tuning), lo que indica que no es un modelo completo sino un conjunto de pesos adicionales que deben combinarse con el modelo base. Al estar basado en phi-4, hereda la arquitectura transformer decoder-only de dicho modelo, aunque no se especifican los detalles del adapter (rango, capas objetivo, etc.).

La relevancia de este modelo radica en su potencial para adaptar phi-4 a tareas de conversación y asistencia, aprovechando el dataset OASST1 que contiene diálogos humanos. Sin embargo, al no existir documentación técnica ni evaluaciones publicadas, su utilidad práctica es incierta y debe considerarse un artefacto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adapter LoRA sobre microsoft/phi-4 (transformer decoder-only) |
| Parametros totales | no disponible (el adapter añade un número desconocido de parámetros al modelo base de ~14B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base, phi-4 soporta hasta 128k tokens, pero no se confirma para este adapter) |
| Tipos de cuantizacion | no disponible (el adapter se distribuye en safetensors, pero no se indica cuantización del modelo base) |
| Idiomas soportados | no disponible (el modelo base phi-4 está principalmente entrenado en inglés, pero no hay confirmación para este adapter) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adapter LoRA) |

## Arquitectura y entrenamiento

El modelo es un adapter LoRA, una técnica de fine-tuning eficiente que introduce matrices de baja dimensión en las capas de atención del modelo base, reduciendo drásticamente el número de parámetros entrenables. El modelo base es `microsoft/phi-4`, un transformer decoder-only con aproximadamente 14 mil millones de parámetros, entrenado con un enfoque en razonamiento y código. El adapter fue entrenado mediante SFT sobre el dataset OASST1 (Open Assistant), que contiene conversaciones humanas anotadas, con el objetivo de mejorar las capacidades de diálogo del modelo.

No se dispone de información sobre los hiperparámetros de entrenamiento (tasa de aprendizaje, número de épocas, rango del LoRA, etc.), ni sobre el proceso de preprocesamiento de datos. El nombre "self_sft" podría indicar un enfoque de auto-supervisión, pero no hay detalles al respecto. La ausencia de una model card completa impide conocer cualquier innovación técnica adicional.

## Capacidades

- Generación de texto conversacional: al ser un fine-tuning sobre OASST1, se espera que mejore la fluidez y coherencia en diálogos, aunque no hay evaluaciones que lo confirmen.
- Razonamiento y código: hereda las capacidades del modelo base phi-4, que destaca en tareas de razonamiento lógico y generación de código, pero el adapter podría alterar estas habilidades.
- Tool calling: no se especifica soporte explícito, pero phi-4 tiene cierta capacidad para seguir instrucciones; el adapter no añade funciones adicionales documentadas.
- Multilingüismo: no hay información sobre idiomas soportados más allá de los del modelo base (principalmente inglés).
- Modo de pensamiento extendido: no disponible; phi-4 no incluye un modo "thinking" explícito y el adapter no lo añade.

## Casos de uso

- Asistente de chat para soporte técnico: el adapter, si funciona correctamente, podría utilizarse para construir un chatbot que responda consultas con contexto conversacional, aprovechando el entrenamiento en OASST1.
- Fine-tuning de demostración: sirve como ejemplo de cómo aplicar LoRA a phi-4 con un dataset de diálogo, útil para investigadores que quieran replicar el proceso.
- Prototipado rápido: al ser un adapter ligero (0.4 GB), permite experimentar con phi-4 en entornos con recursos limitados, combinándolo con el modelo base cuantizado.
- Evaluación de adaptadores: puede usarse como punto de partida para comparar diferentes estrategias de SFT sobre el mismo modelo base.
- Investigación en alineación: el dataset OASST1 incluye anotaciones de preferencias, por lo que el modelo podría servir para estudiar técnicas de alineación supervisada.
- Generación de respuestas en entornos de baja latencia: si se despliega con el modelo base cuantizado, podría ofrecer respuestas rápidas en aplicaciones de mensajería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco se comparan con otros modelos.

## Requisitos de hardware

- VRAM estimada: depende del modelo base. phi-4 en FP16 requiere aproximadamente 28 GB de VRAM, pero con cuantización (por ejemplo, 8 bits o 4 bits) puede reducirse a 14-16 GB. El adapter LoRA añade un overhead mínimo (menos de 1 GB).
- GPU recomendadas: para inferencia en FP16, se necesitan GPUs como A100 (40 GB) o RTX 4090 (24 GB) con cuantización. En 4 bits, podría ejecutarse en GPUs consumer de 16 GB (RTX 4080, RTX 3090).
- Opciones de despliegue: al ser un adapter PEFT, debe cargarse junto con el modelo base usando bibliotecas como `peft` y `transformers`. También es compatible con `vLLM` (si se fusiona el adapter) y `llama.cpp` (si se convierte a GGUF, aunque no se proporciona).
- Latencia y throughput: no se conocen valores específicos; dependerá del hardware y de la cuantización del modelo base.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables para phi-4 en el mismo repositorio. Como referencia, se puede comparar con el modelo base phi-4 (sin adapter) y con otros modelos de chat como Llama-3-8B o Mistral-7B, pero no hay datos de rendimiento de este adapter para establecer una comparación justa.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adapter + phi-4 | ~14B (base) + LoRA | no disponible | no disponible | HuggingFace (adapter) |
| microsoft/phi-4 | 14B | 128k | MIT | HuggingFace |
| Llama-3-8B-Instruct | 8B | 8k | Llama 3 License | HuggingFace |
| Mistral-7B-Instruct | 7B | 32k | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- Falta de documentación: la model card está vacía, sin detalles sobre entrenamiento, datos, o uso previsto. Esto dificulta la reproducibilidad y la evaluación.
- Riesgo de alucinación: al ser un fine-tuning sobre un dataset de conversaciones, puede heredar sesgos y generar respuestas inexactas o inventadas, especialmente en temas fuera del dominio de entrenamiento.
- Sesgos del dataset OASST1: este dataset contiene anotaciones humanas que pueden reflejar sesgos culturales o de género; el modelo podría amplificarlos.
- Licencia incierta: no se especifica la licencia del adapter, lo que impide conocer restricciones de uso comercial o redistribución.
- Dependencia del modelo base: el adapter solo funciona con phi-4; no es un modelo autónomo.
- Posible overfitting: al ser un entrenamiento con un seed fijo y sin detalles de regularización, podría no generalizar bien fuera del dominio de OASST1.
- Sin garantías de producción: al no haber benchmarks ni pruebas de robustez, no se recomienda su uso en aplicaciones críticas sin una validación exhaustiva.

## Enlaces

- Repositorio del modelo: https://huggingface.co/dementor-research/self_sft_oasst1_phi-4_as_phi-4_seed42
- Modelo base (microsoft/phi-4): https://huggingface.co/microsoft/phi-4
- Dataset OASST1 (referencia): https://huggingface.co/datasets/OpenAssistant/oasst1
