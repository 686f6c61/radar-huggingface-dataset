# geodesic-research/control-pretrain-30b-baseline-pretrain

## Resumen

`control-pretrain-30b-baseline-pretrain` es un checkpoint intermedio (stage 1) de la campaña de pretraining controlado de Geodesic Research, una organización británica de seguridad técnica en IA. Se trata del brazo de control sin filtrar de un estudio sobre filtrado de datos de pretraining: el modelo se entrena desde cero (inicialización aleatoria) con la arquitectura Nemotron 3 Nano 30B-A3B de NVIDIA, una combinación híbrida de Mamba2, atención y mezcla de expertos (MoE). El objetivo del estudio es aislar el efecto del filtrado de datos comparando este baseline con otras variantes del mismo tamaño.

El modelo tiene 31.577.937.344 parámetros totales (aproximadamente 31,6B) y 3B activos por token (según la nomenclatura A3B). Se entrenó durante 501.300 millones de tokens con una longitud de secuencia de 8192, una tasa de aprendizaje constante de 1e-3 deliberadamente sin anneal (el anneal se reserva para la etapa 2) y un tamaño de lote global de 2048 en 512 GPUs GH200. La pérdida final de entrenamiento fue 1,84, sin iteraciones con NaN. Es un modelo base, sin ajuste por instrucciones ni comportamiento conversacional, y al no estar annealed queda intencionadamente a mitad de currículo; para la mayoría de usos se recomiendan los hermanos `midtrain` (annealed) o `sft` (chat/razonamiento).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron 3 Nano 30B-A3B (híbrida Mamba2 + attention + MoE) |
| Parametros totales | 31.577.937.344 (31,6B) |
| Parametros activos | 3B (según nomenclatura A3B) |
| Longitud de contexto | 8192 tokens (longitud de entrenamiento) |
| Tipos de cuantizacion | no disponible (el modelo base se publica en BF16) |
| Idiomas soportados | inglés |
| Licencia | nvidia-open-model-license |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura Nemotron 3 Nano 30B-A3B de NVIDIA, que combina capas de Mamba2 (modelos de espacio de estados) con atención tradicional y una capa de mezcla de expertos (MoE) con 3B parámetros activos. Esta hibridación busca capturar dependencias de largo alcance con menor coste computacional que un transformer denso equivalente. El entrenamiento se realizó desde cero (inicialización aleatoria) durante 501,3 mil millones de tokens, con una tasa de aprendizaje constante de 1e-3 sin anneal, tamaño de lote global 2048 y secuencias de 8192 tokens, en 512 GPUs GH200. Los datos provienen de ClimbMix (agregado 0,698, repartido proporcionalmente en 8 shards), Zyda-2 y discurso de seguridad de IA, según la hoja de mezcla de la campaña (revisión del 20 de agosto de 2026). El checkpoint corresponde a la iteración 0029881 de Megatron, convertido con megatron-bridge (TP1/EP4). No hay trampa de embedding cero: todas las filas del vocabulario se entrenaron desde cero.

## Capacidades

- Generación de texto en inglés con prompting de finalización simple (completion prompting), al ser un modelo base sin ajuste por instrucciones.
- Razonamiento y modelado de lenguaje de propósito general, aunque sin anneal su rendimiento es intermedio y no representa el estado final del entrenamiento.
- Capacidad de código y matemáticas implícita en el pretraining, pero sin evaluación publicada.
- No soporta tool calling, function calling ni comportamiento de agente, al no haber sido entrenado para ello.
- No tiene modo de pensamiento (thinking mode) ni capacidades multimodales (visión, audio).
- Multilingüe: solo inglés, según la model card.

## Casos de uso

- Investigación sobre filtrado de datos de pretraining: este checkpoint sirve como brazo de control sin filtrar para comparar con variantes filtradas del mismo estudio, permitiendo aislar el efecto del filtrado en la dinámica de entrenamiento.
- Análisis de dinámicas de pretraining: al ser un checkpoint intermedio sin anneal, es útil para estudiar cómo evoluciona la pérdida y el comportamiento del modelo a lo largo del entrenamiento, especialmente en las primeras fases.
- Fine-tuning posterior: al ser un modelo base, puede servir como punto de partida para fine-tuning con instrucciones o RLHF, aunque se recomienda usar la variante `midtrain` (annealed) para mejores resultados.
- Evaluación de arquitecturas híbridas Mamba2 + attention + MoE: permite comparar el rendimiento de esta arquitectura frente a transformers densos del mismo tamaño en tareas de modelado de lenguaje.
- Reproducción de experimentos de alineación: Geodesic Research se centra en alineación de IA; este modelo puede usarse para estudiar cómo los priors de alineación se integran en modelos base.
- Pruebas de escalabilidad de entrenamiento: el entrenamiento en 512 GH200 con GBS 2048 ofrece datos sobre estabilidad numérica (cero NaN) y eficiencia en entornos de cómputo masivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en BF16 ocupa aproximadamente 63,2 GB (tamaño del repo), por lo que se necesitan al menos 80 GB de VRAM para cargarlo completo en BF16 (p. ej., una A100 80GB o H100 80GB).
- Con cuantización a 8 bits (si estuviera disponible) se podría reducir a ~32 GB, y a 4 bits a ~16 GB, pero no se han publicado cuantizaciones oficiales.
- GPU recomendadas: GH200 (usada en entrenamiento), A100 80GB, H100 80GB, o GPUs consumer de gama alta con suficiente VRAM (p. ej., RTX 4090 24GB solo con cuantización agresiva, no recomendado para este tamaño).
- Opciones de despliegue: al ser un modelo de investigación, no se han publicado configuraciones optimizadas; podría usarse con vLLM, llama.cpp u Ollama si se generan cuantizaciones GGUF, pero no hay soporte oficial.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han publicado comparativas con otros modelos de la misma categoría (tamaño ~30B, MoE, híbrido Mamba2+attention) en la información proporcionada. El modelo es parte de un estudio interno de Geodesic Research, y no se han difundido resultados comparativos externos.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no produce respuestas conversacionales ni sigue instrucciones; requiere prompting de finalización y, para uso práctico, fine-tuning posterior.
- Sin anneal de la tasa de aprendizaje: el modelo está a mitad de currículo, por lo que su rendimiento es inferior al que tendría tras la etapa 2 (anneal). No es adecuado para producción directa.
- Tokenizer peculiar: el `tokenizer_config` declara `eos` como `<|im_end|>` (id 11), pero el pretraining usó `</s>` (id 2) como separador de documentos. Para continuar el entrenamiento (CPT) hay que usar el id 2 como EOD, y se recomienda el tokenizer `geodesic-research/nemotron-base-tokenizer`.
- Licencia NVIDIA: la licencia `nvidia-open-model-license` puede imponer restricciones de uso comercial; hay que revisar sus términos antes de desplegar el modelo en producción.
- Solo inglés: no soporta otros idiomas.
- Riesgo de alucinación: al ser un modelo base sin fine-tuning, puede generar texto incoherente o factualmente incorrecto, especialmente fuera de su dominio de entrenamiento.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estándar, por lo que su calidad relativa es desconocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/geodesic-research/control-pretrain-30b-baseline-pretrain
- Checkpoints de la etapa 1 (14 checkpoints): https://huggingface.co/geodesic-research/control-pretrain-30b-baseline-ckpts
- Variante annealed (midtrain): https://huggingface.co/geodesic-research/control-pretrain-30b-baseline-midtrain
- Variante SFT (chat/razonamiento): https://huggingface.co/geodesic-research/control-pretrain-30b-baseline-sft
- Sitio web de Geodesic Research: https://geodesicresearch.ai/
- GitHub de Geodesic Research: https://github.com/GeodesicResearch
