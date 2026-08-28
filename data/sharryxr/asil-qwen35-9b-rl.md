# sharryXR/asil-qwen35-9b-rl

## Resumen

ASIL Qwen3.5-9B RL es un checkpoint de ajuste fino por refuerzo (RL) publicado por sharryXR como parte del lanzamiento del paper ASIL (Findings of EMNLP 2026, arXiv:2608.26991). El modelo parte de Qwen/Qwen3.5-9B, un modelo denso de aproximadamente 8,95 mil millones de parámetros desarrollado por Alibaba Cloud, y se entrena con un pipeline de dos etapas: primero un ajuste supervisado (SFT) y posteriormente un refinamiento con RL sobre tareas de agente (agentic tasks). El objetivo es mejorar la capacidad del modelo para razonamiento multi-paso y uso de herramientas en entornos conversacionales y de agente.

La relevancia de este lanzamiento radica en que es una liberación de checkpoint de investigación, con metadatos de procedencia detallados (rutas de entrenamiento, pasos globales, datos de entrenamiento) y artefactos de entrenamiento excluidos. El repositorio contiene los pesos en formato safetensors listos para cargar con transformers, lo que permite reproducir o evaluar el modelo sin necesidad de reconstruir el pipeline de RL. Aunque el modelo base Qwen3.5-9B presenta una arquitectura híbrida con Gated Delta Networks y Gated Attention, este checkpoint específico se distribuye como un modelo de generación de texto puro (pipeline text-generation).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (Gated Delta Networks + Gated Attention) sobre base Qwen3.5-9B |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (según especificaciones del modelo base; no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en precisión original) |
| Idiomas soportados | no disponible |
| Licencia | otra (no especificada en la ficha; el repositorio indica "License: other") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida que combina Gated Delta Networks y Gated Attention en un patrón repetido de 8 bloques, cada uno con la secuencia 3×DeltaNet → FFN → 1×Attention → FFN. Esta combinación busca equilibrar eficiencia computacional y capacidad de atención a largo plazo. El checkpoint ASIL se obtiene mediante un proceso de dos fases: primero un ajuste supervisado (SFT) sobre el modelo base (checkpoint global_step_543), y posteriormente un entrenamiento con RL (usando el framework Verl) que se reanuda desde un paso global 80 de una primera ejecución. Los datos de entrenamiento RL consisten en 320 prompts de tareas de entrenamiento y 80 de validación (dataset `rl_learnable_v4_320_80`). El checkpoint seleccionado es `global_step_140_actor_hf`, que corresponde al actor tras 140 pasos globales. No se especifican detalles sobre el algoritmo RL concreto (PPO, GRPO, etc.) ni sobre la función de recompensa.

## Capacidades

- Generación de texto conversacional: el modelo está diseñado para mantener diálogos multi-turno, dado su origen en tareas de agente.
- Razonamiento multi-paso: el entrenamiento con RL sobre tareas de agente sugiere capacidad para planificar y ejecutar secuencias de acciones.
- Integración con herramientas: aunque no se documenta explícitamente, los modelos RL para agentes suelen soportar tool calling; no hay confirmación en la información disponible.
- Multilingüismo: no se especifican idiomas soportados; el modelo base Qwen3.5-9B es multilingüe, pero no se confirma para este checkpoint.
- Sin capacidades multimodales: el pipeline es text-generation y no se menciona visión ni audio.

## Casos de uso

- Evaluación de investigación en RL para agentes: el checkpoint permite reproducir los experimentos del paper ASIL y comparar estrategias de entrenamiento con refuerzo sobre modelos de 9B.
- Desarrollo de asistentes conversacionales con razonamiento: su entrenamiento en tareas de agente lo hace adecuado para prototipos de chatbots que necesitan seguir instrucciones complejas y mantener contexto largo (hasta 262K tokens en el modelo base).
- Benchmarking de modelos de 9B: sirve como referencia para medir el impacto del RL frente al SFT puro en tareas de razonamiento y agente.
- Fine-tuning adicional: al ser un checkpoint intermedio, puede usarse como punto de partida para nuevos ajustes con datasets específicos de dominio.
- Simulación de entornos de agente: útil para probar frameworks de agentes (por ejemplo, con vLLM o TGI) en escenarios de multi-step reasoning.
- Educación y divulgación: permite a estudiantes e investigadores analizar la arquitectura híbrida de Qwen3.5 y los efectos del RL en modelos de tamaño medio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni otros estándares. Tampoco se proporcionan comparativas con el modelo base o con otros checkpoints RL.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8,95B parámetros en FP16, se requieren aproximadamente 18 GB de VRAM (el repositorio pesa 17,9 GB). Con cuantización a 8 bits (~9 GB) o 4 bits (~5 GB) podría ejecutarse en GPUs de consumo, aunque no se ofrecen archivos GGUF ni AWQ en el repositorio.
- GPU recomendadas: A100 40GB o 80GB para inferencia sin cuantizar; RTX 4090 (24GB) podría funcionar con cuantización 8-bit si se generan los pesos.
- Compatibilidad con consumer GPU: sí, con cuantización, pero requiere conversión manual de pesos.
- Opciones de despliegue: al ser un modelo transformers estándar, es compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama (mediante importación). No se proporcionan configuraciones predefinidas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ASIL Qwen3.5-9B RL (este) | 8,95B | 262K (base) | Híbrida DeltaNet+Attention | Otra (no especificada) | HuggingFace |
| Qwen3.5-9B (base) | 8,95B | 262K | Híbrida DeltaNet+Attention | Apache 2.0 (presumible) | HuggingFace, Alibaba Cloud |
| Llama 3.1 8B | 8,03B | 128K | Transformer denso | Llama 3.1 Community License | HuggingFace, múltiples |

La comparativa se basa en datos públicos del modelo base y de alternativas conocidas. No se dispone de resultados de rendimiento para este checkpoint, por lo que la comparación es estructural, no empírica.

## Limitaciones y advertencias

- Licencia no clara: el repositorio indica "License: other" sin especificar términos; antes de uso comercial es imprescindible contactar con el autor o revisar el paper.
- Checkpoint de investigación: no se garantiza robustez en producción; el entrenamiento se realizó con solo 320 prompts de tareas, lo que puede limitar la generalización.
- Sin benchmarks publicados: no hay evidencia de rendimiento frente a otros modelos; cualquier afirmación sobre calidad es especulativa.
- Posibles sesgos: al derivar de Qwen3.5-9B, puede heredar sesgos del modelo base, pero no se documentan.
- Riesgo de alucinación: no se han evaluado tasas de alucinación específicas para este checkpoint.
- Contexto no confirmado: aunque el modelo base soporta 262K tokens, no se verifica que el checkpoint RL mantenga esa longitud efectiva sin degradación.
- Sin soporte multimodal: a pesar de que el modelo base Qwen3.5-9B es multimodal según algunas fuentes, este checkpoint se distribuye solo como text-generation.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sharryXR/asil-qwen35-9b-rl
- Paper ASIL (arXiv): https://huggingface.co/papers/2608.26991
- Página del proyecto: https://sharryxr.github.io/ASIL/
- Código fuente: https://github.com/sharryXR/ASIL
- Colección de modelos ASIL: https://huggingface.co/collections/sharryXR/asil-models
- Especificaciones del modelo base Qwen3.5-9B: https://apxml.com/models/qwen35-9b
