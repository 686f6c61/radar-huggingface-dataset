# davidheineman/rlve-opd-teacher-R1Distill-085-ShortestPathCountConstruction-20261025

## Resumen

Este modelo es un checkpoint especialista publicado por davidheineman como parte del experimento de escalado de datos RLVE (*Reinforcement Learning with Verifiable Environments*). No se trata de un modelo de propósito general, sino de un "teacher" entrenado con GRPO sobre un único entorno de entrenamiento: `ShortestPathCountConstruction`, con dificultad equilibrada fija 0/1. Todos los actores del experimento se inicializaron desde `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, por lo que hereda la arquitectura Qwen2 y el estilo de razonamiento con cadenas de pensamiento largas del destilado de DeepSeek-R1.

El entrenamiento se limitó a 4.000 rollouts, con parada anticipada al alcanzar un pass@1 >= 0,98 en la validación ID (32 prompts × 8 respuestas cada 50 actualizaciones). El checkpoint final corresponde a la actualización 499 (indexada desde cero). La generación utiliza 1.024 tokens iniciales más una continuación forzada de 128 tokens para la respuesta, un detalle clave para interpretar sus salidas.

Su relevancia es metodológica más que de producto: sirve como pieza de un pipeline de destilación y análisis de escalado de datos, y permite reproducir el comportamiento de un profesor especializado en una tarea concreta. Con 0 descargas y 0 likes en el momento de la consulta, es un artefacto de investigación, no un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), destilado de DeepSeek-R1 |
| Parametros totales | 1.777.088.000 (1,78 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada; la generacion del experimento usa 1.024 tokens iniciales + 128 tokens de continuacion forzada |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos safetensors en precision original |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors, mas `config` y tokenizer para `transformers` |
| Tamano del repositorio | 3,6 GB |
| Etiquetas de pipeline | `text-generation`, conversacional, compatible con TGI y endpoints |
| Modelo base | `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` |
| Fecha de creacion | 2026-10-25 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base: un transformer decoder-only de la familia Qwen2 con 1,78 mil millones de parámetros, adaptado mediante destilación desde DeepSeek-R1 y, en este caso, ajustado con GRPO sobre un entorno verificable. El autor indica explícitamente que los actores se inicializaron de cero desde `DeepSeek-R1-Distill-Qwen-1.5B` y que el resultado es un "GRPO specialist": un profesor entrenado para resolver una única familia de problemas, `ShortestPathCountConstruction`, con dificultad equilibrada 0/1 fija.

El presupuesto de entrenamiento es deliberadamente pequeño y reproducible: 4.000 rollouts como tope, validación cada 50 actualizaciones con 32 prompts y 8 respuestas por prompt (las muestras de validación no computan contra el presupuesto), y parada anticipada al superar pass@1 >= 0,98 en validación ID. El checkpoint publicado corresponde a la actualización 499 (indexada desde cero). No se publican estados de optimizador ni de dataloader; la configuración exacta y la lista de entornos están en `training_config.yaml` y `training_run.json`. No hay información sobre volumen de tokens de preentrenamiento, composición del dataset ni uso de RLHF/DPO más allá del propio GRPO.

## Capacidades

- Generación de texto y razonamiento paso a paso en el formato del destilado de DeepSeek-R1, con cadenas de pensamiento antes de la respuesta final.
- Resolución de la tarea `ShortestPathCountConstruction` (construcción y conteo de caminos mínimos) con dificultad 0/1, el dominio para el que fue entrenado.
- Producción de respuestas en un formato forzado: el pipeline de generación añade 128 tokens de continuación destinados a forzar la respuesta final.
- Capacidad conversacional declarada en las etiquetas del repositorio (`conversational`), aunque sin datos que la cuantifiquen.
- Compatibilidad con `transformers`, Text Generation Inference y endpoints compatibles (etiqueta `endpoints_compatible`).
- No se declara soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo "thinking" configurable.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Destilación de un profesor especialista: usar este checkpoint como generador de trazas de razonamiento para entrenar estudiantes más pequeños en la tarea de conteo de caminos mínimos, aprovechando que fue entrenado hasta un pass@1 >= 0,98 en validación ID.
- Investigación en escalado de datos: reproducir el eje del experimento RLVE comparando este profesor de 4.000 rollouts con otras variantes del mismo grupo (`data-scaling-v1-n128-20261022-225839`).
- Evaluación de entornos verificables: servir como referencia para medir cuánto tarda un modelo de 1,78 B en saturar una tarea con recompensa verificable y qué curvas de validación produce.
- Generación de datos sintéticos para tareas combinatorias: producir pares problema-solución de caminos mínimos con formato controlado, útiles para aumentar cobertura en un dataset de matemáticas discretas.
- Análisis de formatos de respuesta forzada: estudiar el efecto de 1.024 tokens iniciales más 128 tokens de continuación sobre la precisión, comparándolo con generación libre.
- Pruebas de infraestructura de inferencia: al pesar 3,6 GB en safetensors, es un candidato cómodo para validar pipelines de TGI o `transformers` en GPU de gama media antes de escalar a modelos mayores.
- Reproducibilidad de experimentos: el repositorio incluye `training_run.json` y `training_config.yaml`, lo que permite auditar exactamente qué se entrenó y con qué parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo documenta el protocolo interno de validación, no los valores numéricos obtenidos.

| Metrica | Valor |
|---|---|
| Protocolo de validacion | 32 prompts × 8 respuestas, cada 50 actualizaciones |
| Metrica | pass@1 en validacion ID |
| Umbral de parada | pass@1 >= 0,98 |
| Rollouts de entrenamiento | 4.000 (checkpoint en la actualizacion 499) |
| Resultado final de pass@1 | No disponible |
| MMLU / HumanEval / GSM8K | No disponibles |

## Requisitos de hardware

- VRAM estimada en la precisión original (bf16/fp16): en torno a 3,5-4 GB solo para pesos, más overhead de activaciones y KV cache; presupuesto práctico de 6-8 GB para contexto corto.
- VRAM estimada con cuantización int8: aproximadamente 1,8-2,5 GB; en int4, alrededor de 1-1,5 GB (requiere conversión propia, no hay GGUF publicado).
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090); en datacenter, A100, H100, L40S o L4 sin problema de capacidad.
- Cabe holgadamente en GPU consumer: sí, incluso en configuraciones de 8 GB con contexto moderado.
- Opciones de despliegue: `transformers` (soporte nativo del repositorio), Text Generation Inference (etiqueta `text-generation-inference`), endpoints compatibles; `llama.cpp`/Ollama requerirían convertir los pesos a GGUF por cuenta propia.
- Latencia y throughput: no disponibles. Como referencia estructural, un modelo denso de 1,78 B en bf16 sobre una RTX 4090 admite lotes grandes, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`rlve-opd-teacher-...-ShortestPathCountConstruction`) | 1,78 B | No disponible | Profesor GRPO especialista en una tarea | No disponible | HuggingFace, 0 descargas |
| `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` | 1,78 B | No disponible en esta ficha | Modelo general de razonamiento destilado | MIT segun el modelo base (verificar) | Ampliamente disponible |
| `Qwen2.5-1.5B-Instruct` | 1,54 B | 32.768 tokens (segun su model card) | Modelo general instruido | Apache 2.0 (segun su model card) | Ampliamente disponible |
| `deepseek-ai/DeepSeek-R1-Distill-Qwen-7B` | 7,6 B | No disponible en esta ficha | Razonamiento destilado de mayor tamano | MIT segun el modelo base (verificar) | Ampliamente disponible |

La comparación relevante no es de rendimiento general, sino de especialización: frente al modelo base, este checkpoint sacrifica cobertura de dominio a cambio de saturar una única tarea verificable. Frente a un instruct generalista de tamaño similar, ofrece trazas de razonamiento más largas y un formato de respuesta forzado, pero carece de versatilidad y de garantías de licencia declaradas.

## Limitaciones y advertencias

- Especialista de un solo entorno: fuera de `ShortestPathCountConstruction` no hay evidencia de competencia; el ajuste con GRPO sobre una tarea puede degradar el comportamiento general del modelo base.
- La licencia no está declarada en el repositorio. Aunque el modelo base se distribuye habitualmente bajo MIT, la ausencia de licencia explícita en este checkpoint impide asumir uso comercial sin consultar al autor.
- Idiomas no declarados: no hay garantía de comportamiento correcto en castellano ni en ningún otro idioma distinto del usado en el entrenamiento.
- Riesgo de alucinación elevado fuera de dominio y en problemas con estructura distinta a la entrenada, especialmente porque el formato fuerza 128 tokens de respuesta final independientemente de la calidad del razonamiento previo.
- Sesgo de contaminación y sobreajuste: con solo 4.000 rollouts y parada a pass@1 >= 0,98 sobre 32 prompts, la métrica de validación tiene un intervalo de confianza amplio y puede no generalizar.
- No se publican estados de optimizador ni de dataloader, lo que limita la reanudación exacta del entrenamiento.
- Longitud de contexto no documentada en esta ficha: usarlo con contextos largos sin verificar la configuración puede producir degradación silenciosa.
- Fechas de creación y actualización (2026-10-25) posteriores a la mayoría de referencias públicas del ecosistema; conviene verificar la procedencia del artefacto antes de integrarlo en un pipeline.
- La búsqueda web realizada no devolvió resultados técnicos relevantes sobre este modelo; toda la información procede de la model card y de los metadatos de HuggingFace.

## Enlaces

- HuggingFace: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-085-ShortestPathCountConstruction-20261025
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Run de Weights & Biases: https://wandb.ai/david-heineman/rl-data-scaling-teachers-v1/runs/23d8e104 (grupo `data-scaling-v1-n128-20261022-225839`)
- Ficheros de configuración del repositorio: `training_run.json` y `training_config.yaml`
- Resultados de búsqueda web: sin resultados técnicos relevantes; no se han encontrado papers, blogs ni demos adicionales sobre este checkpoint.
