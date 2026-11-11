# rwlinno/topoprm-ckpts

## Resumen

TopoPRM Checkpoints es una colección de artefactos de modelo publicada por el usuario rwlinno en Hugging Face, asociada al trabajo de investigación "Rewarding the Graph Behind the Chain: Topology-Aware Process Supervision for RL and Reasoning Distillation". El objetivo declarado es aplicar supervisión de proceso (process supervision, PRM) con conciencia de topología sobre cadenas de razonamiento, combinando SFT, recompensas jerárquicas y un mecanismo denominado TGD (online). El repositorio contiene tanto adaptadores LoRA de etapas intermedias (SFT, GRPO, SCAE, OPD) como un checkpoint final fusionado en BF16.

El artefacto principal es el checkpoint "Full TGD, seed 123" del 26 de septiembre de 2026, construido sobre el backbone de texto de Qwen3.5-9B (9.000 millones de parámetros, aproximadamente) y fusionado en safetensors BF16, por lo que no requiere PEFT para su carga. El repositorio también referencia como modelo base secundario a deepseek-ai/DeepSeek-R1-Distill-Qwen-7B, presumiblemente empleado en experimentos de destilación de razonamiento.

La relevancia del proyecto radica en su enfoque metodológico: en lugar de recompensar únicamente la respuesta final, se modela la estructura del grafo de razonamiento intermedio. No obstante, el autor advierte explícitamente de que el checkpoint publicado no incluye tabla de resultados de benchmarks evaluados, y que las puntuaciones de otras ejecuciones (seed 42, experimentos suplementarios) no deben atribuirse a este artefacto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (backbone de texto de Qwen3.5-9B); adaptadores LoRA en etapas intermedias |
| Parámetros totales | ~9.000 millones (backbone Qwen3.5-9B); no confirmado de forma explícita en la información disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el release principal se distribuye en BF16; los adaptadores LoRA son compatibles con cuantización del backbone, pero no se documenta) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache-2.0 para el release Full TGD derivado de Qwen3.5-9B; el resto de checkpoints heredan los términos de sus respectivos modelos base |
| Formato de pesos | safetensors (BF16 fusionado en el release principal); LoRA adapters en etapas intermedias |
| Modelo base | Qwen/Qwen3.5-9B; deepseek-ai/DeepSeek-R1-Distill-Qwen-7B |
| Versión de Transformers requerida | 5.5.4 o compatible |
| Tamaño del repositorio | 143,5 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El release principal se construye sobre el backbone de texto de Qwen3.5-9B, un transformer decoder-only, y se distribuye como modelo fusionado en BF16 sin necesidad de adaptador PEFT. El pipeline de entrenamiento documentado para el checkpoint "Full TGD, seed 123" consta de tres fases: SFT inicial, seguimiento con recompensas jerárquicas más ACE, y finalmente TGD en línea. La etapa III registró 512 intentos de revisión, de los cuales se aceptaron 335, y completó 64 actualizaciones del optimizador.

El elemento técnico diferencial es la supervisión de proceso con conciencia de topología: el entrenamiento no se limita a señalar la corrección del resultado, sino que modela la estructura de grafo de los pasos intermedios de razonamiento ("the graph behind the chain"). El repositorio conserva además adaptadores LoRA de etapas previas (SFT, GRPO, SCAE, OPD) que corresponden a protocolos de entrenamiento distintos y no son intercambiables con el release fusionado. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO en sentido estricto.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento matemático con cadenas de pasos intermedios, orientado por supervisión de proceso.
- Razonamiento multi-paso estructurado, con énfasis en la coherencia del grafo de razonamiento.
- Destilación de razonamiento desde modelos maestros (referencia a DeepSeek-R1-Distill-Qwen-7B como base secundaria).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes autónomos: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles; el autor indica explícitamente que el modelo contiene únicamente el backbone de texto.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación en process reward models (PRM): el checkpoint sirve como referencia reproducible para estudiar supervisión de proceso frente a supervisión de resultado en tareas de razonamiento matemático, dado que el autor documenta el protocolo de entrenamiento por etapas.
- Destilación de razonamiento: al estar vinculado a DeepSeek-R1-Distill-Qwen-7B como base secundaria, puede emplearse para experimentar con la transferencia de trazas de razonamiento de modelos maestros a backbones de 7-9B.
- Generación de soluciones matemáticas paso a paso: adecuado para entornos donde se requiere inspeccionar la cadena de razonamiento intermedia, aunque el autor advierte de que las respuestas requieren verificación independiente.
- Evaluación de metodologías de RL: útil como baseline para comparar recompensas jerárquicas y TGD en línea frente a GRPO u otros esquemas de optimización.
- Reproducción académica: el repositorio conserva adaptadores de etapas SFT, GRPO, SCAE y OPD, lo que permite replicar ablaciones sobre el pipeline completo.
- Asistentes técnicos en inglés y chino: el soporte bilingüe permite desplegarlo en herramientas de asistencia para documentación o tutoría en esos dos idiomas, con la cautela de que no hay benchmarks publicados que respalden su calidad en producción.
- Fine-tuning posterior: al ser un modelo fusionado en BF16 sobre Qwen3.5-9B, puede servir como punto de partida para ajustes específicos de dominio con licencia Apache-2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el release del 26 de septiembre de 2026 no incluye tabla de puntuaciones evaluadas, y que las métricas de ejecuciones anteriores (seed 42 y experimentos suplementarios) no deben asociarse a este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 18 GB solo para pesos (9B × 2 bytes), más overhead de KV cache y activaciones; en la práctica, se recomienda un mínimo de 24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 10-12 GB, sin datos oficiales de soporte para este checkpoint concreto.
- VRAM estimada en cuantización de 4 bits: en torno a 6-8 GB, condicionada a la disponibilidad de versiones GGUF/AWQ, que no se documentan en el repositorio.
- GPU recomendadas: A100 40/80 GB, H100 para despliegue de alta concurrencia; RTX 4090 (24 GB) para inferencia en BF16 de una sola instancia.
- GPU de consumo: cabe en RTX 4090 y, con cuantización, potencialmente en GPUs de 12-16 GB; no confirmado por el autor.
- Opciones de despliegue: Transformers 5.5.4 o compatible con `device_map="auto"`; vLLM, llama.cpp, Ollama y TGI no están documentados para este checkpoint en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TopoPRM Full TGD (este) | ~9B | no disponible | Supervisión de proceso con topología + RL | Apache-2.0 (release principal) | Hugging Face, 474 descargas |
| Qwen3.5-9B (base) | ~9B | no disponible | Modelo generalista de texto | según release de Qwen | Hugging Face |
| DeepSeek-R1-Distill-Qwen-7B | ~7B | no disponible | Destilación de razonamiento | MIT (según release original de DeepSeek) | Hugging Face |
| Qwen2.5-Math-7B | ~7B | no disponible | Razonamiento matemático especializado | Apache-2.0 | Hugging Face |

La comparación con Qwen2.5-Math-7B se incluye como referencia de categoría (razonamiento matemático en el rango 7-9B), pero no se dispone de datos de rendimiento del checkpoint TopoPRM que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia de benchmarks publicados: no hay evidencia cuantitativa de rendimiento para el release principal; no debe asumirse superioridad frente a los modelos base.
- Riesgo de alucinación matemática: el propio autor advierte de que las respuestas matemáticas requieren verificación independiente.
- Confusión entre checkpoints: el repositorio contiene artefactos de etapas y protocolos distintos (SFT, GRPO, SCAE, OPD, seed 42, seed 123) que no son intercambiables; cargar el directorio raíz equivocado produce resultados no representativos.
- Cobertura lingüística limitada: solo inglés y chino; no se documenta soporte para castellano.
- Solo backbone de texto: sin capacidades multimodales.
- Licencia heterogénea: el release principal es Apache-2.0, pero los checkpoints anteriores retienen los términos de sus modelos base respectivos; es necesario revisar cada subdirectorio antes de uso comercial.
- Tamaño del repositorio (143,5 GB): la descarga completa es costosa; conviene seleccionar únicamente el subdirectorio del checkpoint deseado.
- Dependencia de versión: requiere Transformers 5.5.4 o compatible, lo que puede limitar la integración con stacks más antiguos.
- Sesgos: no documentados en la información disponible.
- Madurez: se trata de artefactos de investigación con 0 likes y 474 descargas; no hay evidencia de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rwlinno/topoprm-ckpts
- Checkpoint Full TGD seed 123: https://huggingface.co/rwlinno/topoprm-ckpts/tree/main/topoprm-qwen35-9b-full-tgd-seed123-20260926
- Modelo base principal: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo base secundario: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Paper, blog o demo del trabajo "Rewarding the Graph Behind the Chain": no disponible en la información proporcionada.
