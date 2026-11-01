# Popbones/LiveMem-RL-mlx-q8-backbone

## Resumen

LiveMem-RL-mlx-q8-backbone es una cuantización experimental en Q8 del checkpoint `chen-l/LiveMem-RL`, publicada por el usuario Popbones en Hugging Face. Se trata de un artefacto derivado, no oficial, destinado a probar el modelo LiveMem con el runtime independiente MLX en Apple Silicon. LiveMem (arXiv:2608.02515) aborda el problema de mantener la continuidad del estado de memoria en inferencias LLM de larga duración, incorporando una rama de memoria sobre una base Qwen3-4B-Instruct-2507.

El modelo subyacente tiene aproximadamente 6.350 millones de parámetros (incluida la rama de memoria), aunque el archivo de pesos cuantizado pesa 9,3 GB porque solo las proyecciones de atención y MLP están en 8 bits; embeddings, rama de memoria, convoluciones y normalizaciones permanecen en BF16 y las matrices recurrentes en FP32. Es un modelo conversacional de generación de texto con arquitectura híbrida que combina transformer con componentes recurrentes/de memoria.

Su relevancia actual radica en permitir evaluar en Macs con Apple Silicon un enfoque novedoso de memoria persistente en inferencia larga, aunque la propia ficha advierte que la calidad tras la cuantización no está certificada y que no es una versión oficial de los autores de LiveMem ni de Qwen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: transformer (base Qwen3) con rama de memoria recurrente (LiveMem) |
| Parámetros totales | 3.739.358.336 en el archivo safetensors cuantizado (aprox. 6,35 B en el modelo subyacente, incluida la rama de memoria) |
| Parámetros activos | No disponible (no consta que sea MoE) |
| Longitud de contexto | No disponible (validado con un presupuesto KV de 2.048 tokens en pruebas de compatibilidad) |
| Tipos de cuantización | Q8 afín por grupos de 64 solo en proyecciones q/k/v/o de atención y gate/up/down de MLP; embeddings, rama de memoria, convolución, normalizaciones y gates en BF16; matrices recurrentes en FP32 |
| Idiomas soportados | No disponible (hereda presumiblemente del tokenizer de Qwen3-4B-Instruct-2507, sin confirmación) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (cuantización weight-only, 9,3 GB; requiere runtime `livemem-mlx`) |

## Arquitectura y entrenamiento

La base del modelo es Qwen3-4B-Instruct-2507, un transformer decoder convencional. Sobre ella, LiveMem añade una rama de memoria con matrices recurrentes y componentes de gating, según el paper "LiveMem: Maintaining Memory State Continuity in Long-Running LLM Inference" (Liu et al., 2026), cuyo objetivo es preservar el estado de memoria (KV y estado recurrente) a lo largo de sesiones de inferencia muy largas, con mecanismos como la expulsión física de posiciones KV evicted.

Esta publicación en concreto es una conversión weight-only: solo las lineales de atención y MLP pasan a 8 bits afines (group size 64), manteniendo las partes sensibles (memoria, recurrentes, normalizaciones) en precisión alta para minimizar el impacto en la calidad de la memoria. No se ha publicado información sobre el proceso de entrenamiento del checkpoint original (tokens, composición del dataset, RLHF/DPO) en la información disponible; el sufijo "-RL" del checkpoint sugiere un entrenamiento con aprendizaje por refuerzo, pero no hay detalles confirmados.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`), heredada de la base Qwen3-4B-Instruct-2507.
- Mantenimiento de continuidad de estado de memoria en sesiones de inferencia largas (característica principal de LiveMem), con expulsión física de posiciones KV.
- Compatibilidad validada con el runtime `livemem-mlx` v0.1.0 en Apple Silicon (Metal).
- Soporte de formato de chat con mensajes por roles (`user`, etc.) mediante la API de Python del runtime.
- No hay información disponible sobre tool calling, capacidades de visión/audio ni modo de razonamiento explícito.

## Casos de uso

- Prueba y evaluación del runtime LiveMem en Apple Silicon: es el propósito declarado del artefacto; permite cargar y ejecutar el modelo en Macs M1/M2/M3/M4 para validar el comportamiento del runtime MLX antes de despliegues más serios.
- Experimentación con memoria persistente en conversaciones largas: investigadores pueden estudiar cómo LiveMem retiene estado KV y memoria recurrente en sesiones prolongadas sin recomputar prefill completo.
- Desarrollo de chatbots con estado en dispositivos Apple: la inferencia local en Mac sin GPU NVIDIA lo hace adecuado para prototipos de asistentes conversacionales que necesitan continuidad de contexto a lo largo de horas de sesión.
- Investigación en cuantización de arquitecturas híbridas: el esquema mixto (Q8 en lineales, BF16/FP32 en memoria y recurrentes) sirve como referencia para estudiar qué partes de un modelo híbrido toleran la cuantización.
- Validación de reproducibilidad: el repo publica hashes SHA-256 de pesos y revisión fijada del original, útil para pipelines que exigen trazabilidad de artefactos.
- Generación local offline con presupuesto de memoria controlado: el pico de asignación medido (~9,33 GiB) permite planificar cargas en máquinas con 16-32 GiB de RAM unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la publicación no añade resultados de benchmark nuevos y que la calidad tras la cuantización no está certificada. Solo se documenta una validación de compatibilidad (casos Aurora, Zephyr, replay de sesión y un prompt de 2.283 tokens con expulsión KV) con coincidencia exacta de token IDs, posiciones KV retenidas y logits de prefill.

## Requisitos de hardware

- Memoria unificada: pico de asignación MLX medido de 9,33 GiB en un Apple M1 Pro con 32 GiB durante una prueba con presupuesto KV de 2.048 tokens. El archivo de pesos ocupa 9,3 GB, pero el almacenamiento de pesos no equivale a la memoria total en runtime.
- GPU: no requiere GPU NVIDIA; está diseñado para Apple Silicon con soporte Metal (validado en M1 Pro). No hay datos para CUDA/vLLM con esta variante.
- Consumer hardware: cabe en Macs de consumo con 16 GiB de RAM unificada o más, con margen ajustado en 16 GiB según la longitud de contexto utilizada.
- Software: Python 3.11 o posterior y el runtime `livemem-mlx` v0.1.0 (instalable desde GitHub). No funciona con Transformers AutoModel ni con mlx-lm estándar.
- Despliegue: solo CLI y API Python del runtime propio (`livemem-mlx generate`, `livemem_mlx.load/generate`). No hay endpoint de inferencia alojado en el Hub; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Popbones/LiveMem-RL-mlx-q8-backbone | ~6,35 B (subyacente) | No disponible | Apache-2.0 | Hugging Face, runtime `livemem-mlx` exclusivo |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4 B | No disponible en la información proporcionada | Apache-2.0 | Transformers, vLLM, mlx-lm, etc. |
| chen-l/LiveMem-RL (original) | ~6,35 B | No disponible | Apache-2.0 | Hugging Face, checkpoint oficial BF16 |

La variante de Popbones se diferencia de su base en que solo es ejecutable con el runtime LiveMem MLX y en que añade la rama de memoria sobre Qwen3-4B, a costa de perder compatibilidad con el ecosistema estándar de inferencia.

## Limitaciones y advertencias

- Artefacto experimental: la model card advierte explícitamente que la calidad tras la cuantización no está aprobada ni certificada, y que las comprobaciones de compatibilidad no garantizan calidad de memoria retenida, preparación para producción ni objetivos de latencia.
- La validación se limitó a cuatro casos de compatibilidad con un presupuesto KV de 2.048 tokens; no constituye un benchmark de serving 8K/32K ni una garantía de RAM del sistema.
- La paridad con CUDA/vLLM del modelo completo, la calidad general de memoria a largo plazo y la estabilidad en ejecuciones prolongadas no están establecidas.
- Cada generación nueva arranca con estado separado: el estado no se retiene automáticamente entre peticiones independientes.
- No es compatible con Transformers AutoModel ni con mlx-lm; requiere un runtime específico, lo que limita su integración en pipelines estándar.
- Sesgos y riesgo de alucinación: no disponible información específica; hereda presumiblemente los de su base Qwen3-4B-Instruct-2507.
- La conversión no está avalada por los autores de LiveMem, Qwen ni Alibaba; el repositorio eliminó los metadatos `auto_map` de Transformers al no incluir implementación remota de Python.
- Idiomas soportados no documentados en esta publicación.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Popbones/LiveMem-RL-mlx-q8-backbone
- Modelo original: https://huggingface.co/chen-l/LiveMem-RL
- Base model: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Paper LiveMem (arXiv:2608.02515): https://arxiv.org/abs/2608.02515
- Runtime LiveMem MLX v0.1.0: https://github.com/popbones/livemem-mlx/releases/tag/v0.1.0
- Informe de compatibilidad: https://github.com/popbones/livemem-mlx/blob/v0.1.0/docs/checkpoint-validation.md
