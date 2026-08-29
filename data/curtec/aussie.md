# Curtec/Aussie

## Resumen

Curtec/Aussie es un modelo de lenguaje finetuneado por el usuario Curtec a partir de unsloth/Qwen3.5-9B, una variante de la familia Qwen 3.5 optimizada para entrenamiento eficiente mediante la librería Unsloth. El modelo se publica bajo licencia Apache-2.0 y está orientado a tareas de generación de texto conversacional en inglés, con soporte declarado para pipelines de image-text-to-text, lo que sugiere una posible capacidad multimodal heredada del modelo base.

La relevancia de este modelo reside en su naturaleza de finetune comunitario: demuestra el flujo de trabajo típico de adaptación de modelos Qwen mediante Unsloth y TRL (Transformers Reinforcement Learning) para crear especializaciones de propósito específico. Sin embargo, la model card es extremadamente escueta y no documenta el dataset de entrenamiento, los hiperparámetros, ni las capacidades concretas del ajuste, por lo que su evaluación práctica requiere pruebas directas. El repositorio tiene 0 descargas y 0 likes, lo que indica que es un proyecto reciente o de baja difusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Qwen3.5-9B, presumiblemente transformer decoder-only) |
| Parametros totales | 9B (según el modelo base unsloth/Qwen3.5-9B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5, sin especificar) |
| Tipos de cuantizacion | no disponible (el repo usa safetensors en precisión completa) |
| Idiomas soportados | inglés (declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 10.6 GB, compatible con transformers) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Dado que se finetunea sobre unsloth/Qwen3.5-9B, se hereda la arquitectura de Qwen 3.5, que es un transformer decoder-only con atención causal. El entrenamiento se realizó con la librería Unsloth (que acelera el fine-tuning mediante optimizaciones de kernel y gestión de memoria) y la librería TRL de HuggingFace para el pipeline de entrenamiento con reinforcement learning o fine-tuning supervisado.

No se especifican los datos de entrenamiento, el número de tokens, ni la composición del dataset. La model card indica que fue entrenado "2x faster" gracias a Unsloth, pero no hay métricas de rendimiento ni detalles sobre el proceso de alineación (RLHF, DPO, etc.). El tag de pipeline image-text-to-text sugiere que el modelo base podría tener capacidades multimodales, pero no se confirma en la documentación.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta de idioma.
- Pipeline declarado como image-text-to-text, lo que podría implicar capacidad de procesar imágenes junto con texto, aunque no se documenta explícitamente.
- Compatible con text-generation-inference (TGI) y transformers, lo que facilita su despliegue en entornos estándar.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso ni modo thinking.
- No hay evidencia publicada de capacidades multilingües más allá del inglés.

## Casos de uso

- Chatbots conversacionales en inglés: el modelo puede servir como base para asistentes de chat generalistas, dado su origen en Qwen 3.5, aunque el finetune específico no está documentado.
- Experimentación académica con fine-tuning eficiente: útil como ejemplo de flujo de trabajo con Unsloth y TRL para investigadores que quieran replicar el proceso.
- Prototipado rápido de aplicaciones de texto: al ser un modelo de 9B con licencia Apache-2.0, puede integrarse en proyectos sin restricciones comerciales.
- Fine-tuning secundario: al ser un checkpoint intermedio, puede usarse como punto de partida para ajustes adicionales en dominios específicos.
- Evaluación de modelos comunitarios: útil para comparar la calidad de finetunes no documentados frente a modelos base.
- Despliegue en entornos con TGI: su compatibilidad con text-generation-inference permite integración en infraestructuras existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación. Tampoco se encontraron resultados de rendimiento en la búsqueda web.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, pero un modelo de 9B en FP16 requiere aproximadamente 18-20 GB de VRAM.
- GPU recomendadas: para FP16, una GPU con 24 GB (RTX 3090/4090) o más; para cuantización (si se aplica), podría caber en GPUs de 16 GB con cuantización de 8 bits.
- En consumer GPU: sí, con cuantización (por ejemplo, GGUF de 4 bits en una RTX 3060 de 12 GB o superior).
- Opciones de despliegue: vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta), HuggingFace Inference Endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Dado que no hay información sobre el rendimiento del finetune, se compara el modelo base (Qwen3.5-9B) con alternativas de la misma categoría:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-9B (base) | 9B | no disponible | Apache-2.0 | HuggingFace |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 Community License | HuggingFace |
| Mistral 7B | 7B | 32K | Apache-2.0 | HuggingFace |
| Gemma 2 9B | 9B | 8K | Gemma License | HuggingFace |

La comparativa directa con Curtec/Aussie no es posible sin datos de rendimiento del finetune.

## Limitaciones y advertencias

- Documentación insuficiente: la model card no describe el dataset, los hiperparámetros, ni las capacidades específicas del finetune, lo que dificulta su uso en producción.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estándar, por lo que su calidad es desconocida.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente sin alineación documentada.
- Soporte de idiomas limitado: solo se declara inglés, lo que restringe su uso en contextos multilingües.
- Sesgos desconocidos: al no documentarse los datos de entrenamiento, no se pueden evaluar sesgos potenciales.
- Baja adopción: 0 descargas y 0 likes indican que el modelo no ha sido validado por la comunidad.
- El tag image-text-to-text no está respaldado por documentación: no se confirma si el finetune conserva capacidades multimodales del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Curtec/Aussie
- Dataset asociado (sin documentación): https://huggingface.co/datasets/Curtec/AussieAussieAussie
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- Librería Unsloth: https://github.com/unslothai/unsloth
- Librería TRL: https://github.com/huggingface/trl
