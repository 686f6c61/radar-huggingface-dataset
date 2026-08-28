# curtburk/nemotron3-nano-kd-distilled

## Resumen

`curtburk/nemotron3-nano-kd-distilled` es un fine-tuning del modelo NVIDIA Nemotron 3 Nano 30B A3B (BF16) mediante destilación de conocimiento (knowledge distillation). El autor, curtburk, ha entrenado el modelo con LoRA sobre 3.872 trazas de razonamiento generadas por DeepSeek-V4-Flash (284B de parámetros), y ha fusionado el adaptador en los pesos base. El objetivo es transferir el comportamiento de terminación del teacher: el modelo base tiende a razonar hasta agotar el presupuesto de tokens sin llegar a escribir código, mientras que el modelo destilado aprende a comprometerse con una respuesta.

El resultado principal es una mejora del pass@1 en problemas de programación del 23,0% al 63,4%, lo que supone el 92,5% de la puntuación del teacher con 9,5 veces menos parámetros. El modelo conserva la arquitectura híbrida Nemotron-H (Transformer + Mamba) con mezcla de expertos (MoE) del base, con 31,6B de parámetros totales y ~3B activos. Todo el proceso de construcción del corpus, entrenamiento, fusión y evaluación se ejecutó en una única GPU NVIDIA GB300, sin APIs en la nube.

La relevancia de este modelo radica en que demuestra que la destilación de trazas de razonamiento puede corregir un defecto concreto de comportamiento (no terminar las respuestas) en modelos de razonamiento, con un coste de entrenamiento de solo dos horas en una GPU. Es un caso de estudio práctico para equipos que quieran mejorar la tasa de finalización de sus modelos sin escalar el número de parámetros.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H híbrida (Transformer + Mamba) con MoE |
| Parametros totales | 31.577.937.344 (~31,6B) |
| Parametros activos | ~3B (A3B) |
| Longitud de contexto | 16.384 tokens (según comando vLLM del autor) |
| Tipos de cuantizacion | no disponible (repo publicado en BF16) |
| Idiomas soportados | inglés |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base, NVIDIA Nemotron 3 Nano 30B A3B, emplea una arquitectura híbrida Nemotron-H que combina capas Transformer con capas Mamba (SSM) y utiliza mezcla de expertos (MoE) con 30B parámetros totales y ~3B activos por token. El fine-tuning se realizó con LoRA (rank 32, alpha 32) sobre los módulos `linear_qkv`, `linear_proj`, `linear_fc1`, `linear_fc2`, `in_proj` y `out_proj`, cubriendo atención, proyecciones Mamba y expertos compartidos del MoE. El adaptador se fusionó en los pesos base antes de la exportación.

El corpus de entrenamiento (`curtburk/nemotron3-nano-kd-corpus`) contiene 3.872 trazas de razonamiento generadas por DeepSeek-V4-Flash (284B) con temperatura 1.0 y top_p 1.0. El entrenamiento duró 1.500 iteraciones (checkpoint en 1.400) con secuencias de 4.096 tokens sin empaquetar, batch global 8, learning rate 1e-4 con scheduler coseno y 75 pasos de warmup, en precisión bf16. Se ejecutó en una única NVIDIA GB300 durante aproximadamente dos horas (5,2 s/paso), con pérdida que descendió de 0,73 a 0,46 sin iteraciones NaN.

Un hallazgo técnico relevante: fusionar también los adaptadores de los expertos enrutados del MoE empeoró la puntuación 8 puntos (55,4% frente a 63,4%), por lo que el autor optó por fusionar solo los expertos compartidos. Además, documenta que `save_hf_pretrained()` de Megatron-Bridge no fusiona adaptadores LoRA de tipo subclass y falla silenciosamente, produciendo una exportación idéntica al modelo base; la fusión se hizo in-place antes de exportar.

## Capacidades

- Generación de código: resuelve problemas de programación con una tasa de finalización del 93,0% (frente al 34,3% del base), con una media de 3.125 tokens de completado.
- Razonamiento multi-paso: reproduce el patrón de análisis del teacher (análisis, enfoque, plan de implementación, solución y verificación), aunque solo en el 2,3% de las respuestas conserva la estructura markdown completa.
- Terminación de respuestas: la capacidad principal transferida es la decisión de dejar de analizar y comprometerse con una respuesta, especialmente crítica en problemas difíciles donde el base se alargaba más.
- Chat conversacional: hereda las capacidades del modelo base Nemotron 3 Nano, aunque el autor no ha evaluado la calidad del chat tras el fine-tuning.
- Tool calling y funciones de agente: no evaluado en este fine-tuning; se asume que hereda las capacidades del base, pero no hay datos publicados.
- Multilingüe: no disponible; el modelo está entrenado y evaluado únicamente en inglés.

## Casos de uso

- Resolución de problemas de programación competitiva: el modelo alcanza un 69,8% en el subconjunto APPS (182 problemas) y un 65,4% en problemas difíciles, lo que lo hace adecuado para plataformas de entrenamiento de programación o generación de soluciones de referencia.
- Asistente de código en entornos con GPU limitada: con ~3B parámetros activos, puede servirse con vLLM en una GPU de 80 GB en BF16, o en GPUs más pequeñas con cuantización, ofreciendo capacidades de razonamiento cercanas a un modelo de 284B en tareas de código.
- Generación de código en pipelines CI/CD: el modelo termina sus respuestas el 93% de las veces, lo que reduce el riesgo de que un agente automatizado se quede a medias en la generación de un parche o una función.
- Fine-tuning posterior para dominios específicos: al ser un modelo abierto con pesos en safetensors, puede servir como punto de partida para destilar o ajustar en tareas concretas de generación de código con un coste de entrenamiento bajo (dos horas en una GB300).
- Evaluación de técnicas de destilación: el repositorio documenta el proceso completo (corpus, entrenamiento, fusión y evaluación), lo que lo convierte en un caso de estudio reproducible para investigar destilación de comportamiento de terminación.
- Prototipado de agentes de razonamiento: su ventana de 16K tokens y su capacidad para completar respuestas lo hacen utilizable en agentes que necesitan razonar y producir código en un solo paso, sin depender de un modelo externo más grande.

## Benchmarks y rendimiento

Resultados sobre 213 problemas reservados (182 APPS, 8 HumanEval+, 26 difíciles), no vistos durante el entrenamiento, con decodificación greedy:

| Metrica | Base (30B) | Este modelo | Teacher DeepSeek-V4-Flash (284B) |
|---|---:|---:|---:|
| pass@1 global | 23,0% | 63,4% | 68,5% |
| APPS (n=182) | 22,5% | 69,8% | 75,8% |
| Problemas dificiles (n=26) | 3,8% | 65,4% | 73,1% |
| Problemas faciles (n=66) | 27,3% | 56,1% | 56,1% |
| Respuestas que terminaron | 34,3% | 93,0% | 100,0% |
| Media de tokens de completado | 9.736 | 3.125 | 875 |
| Respuestas sin bloque de codigo | 138 | 11 | 8 |

El autor advierte que MBPP se excluyó porque todos los modelos probados (incluido el teacher de 284B) puntuaron 1/23, lo que atribuye a un bug del harness de evaluación y no a una propiedad del modelo.

## Requisitos de hardware

- VRAM para inferencia en BF16: aproximadamente 63 GB (tamaño del repo en safetensors), más la caché KV. Requiere una GPU con al menos 80 GB (H100, A100 80GB, GB300).
- GPU recomendadas: NVIDIA GB300 (usada para entrenamiento), H100 80GB o A100 80GB para inferencia en BF16.
- GPU de consumo: no cabe en GPUs consumer (RTX 4090, 3090) en BF16 sin cuantización. No hay cuantizaciones publicadas (GGUF, AWQ, GPTQ) en el repositorio, por lo que el despliegue en consumer no está cubierto.
- Opciones de despliegue: vLLM (comando documentado con `--max-model-len 16384 --gpu-memory-utilization 0.85`), transformers con `trust_remote_code=True`. Requiere las dependencias `mamba-ssm` y `causal-conv1d`.
- Latencia y throughput: no disponible. El entrenamiento se ejecutó a 5,2 s/paso en una GB300, pero no se publican métricas de inferencia.
- Nota: al generar con transformers directamente puede aparecer una advertencia sobre `NemotronHHybridDynamicCache`; el autor sugiere pasar `use_cache=False` o usar vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | pass@1 (codigo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (KD distilled) | 31,6B totales, ~3B activos | 16K | 63,4% | NVIDIA Open Model License | safetensors en HF |
| NVIDIA Nemotron 3 Nano 30B A3B (base) | 31,6B totales, ~3B activos | 16K | 23,0% | NVIDIA Open Model License | safetensors en HF |
| DeepSeek-V4-Flash (teacher) | 284B | no disponible | 68,5% | MIT | no disponible |

La comparación directa con otros modelos pequeños de código (por ejemplo, Qwen2.5-Coder o DeepSeek-Coder de tamaños similares) no está disponible en la información publicada. La comparativa anterior se limita a los datos reportados por el autor.

## Limitaciones y advertencias

- Ejecución única: un solo seed, un solo checkpoint y una sola familia de benchmarks. El autor advierte que la magnitud exacta de las mejoras debe tratarse como aproximada.
- Puntuación del teacher contaminada: DeepSeek-V4-Flash generó las trazas para los mismos 213 problemas durante la construcción del corpus, por lo que el split está reservado para el estudiante pero no para el teacher. La retención es aproximada.
- Desajuste de muestreo: la evaluación usó decodificación greedy, mientras que el corpus se generó con temperatura 1.0 y top_p 1.0, que es lo que recomienda la model card del teacher.
- Adherencia de formato no transferida: el modelo solo reproduce la estructura markdown completa (Analysis / Approach / Implementation Plan / Solution / Verification) en el 2,3% de las respuestas. Aprendió el comportamiento de terminación, no el formato.
- Sin evaluación fuera de código: no se ha medido si la capacidad general, la calidad del chat o el comportamiento en contexto largo han regresado. El autor asume que pueden haberlo hecho.
- Riesgo de alucinación: no evaluado específicamente; al ser un fine-tuning sobre trazas de un modelo mayor, puede heredar alucinaciones del teacher en razonamiento.
- Licencia: la NVIDIA Open Model License permite uso comercial, pero es necesario revisar sus términos específicos (incluye cláusulas de uso aceptable y atribución). Las trazas de entrenamiento provienen de DeepSeek-V4-Flash, con licencia MIT.
- Dependencias de ejecución: requiere `mamba-ssm` y `causal-conv1d`, lo que complica el despliegue en entornos sin soporte para estas librerías.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/curtburk/nemotron3-nano-kd-distilled
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Corpus de entrenamiento: https://huggingface.co/datasets/curtburk/nemotron3-nano-kd-corpus
- Repositorio GitHub del proyecto: https://github.com/curtburk/distillation-nemotron3
- Teacher (DeepSeek-V4-Flash): https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Blog de NVIDIA sobre Nemotron 3 Nano: https://huggingface.co/blog/nvidia/nemotron-3-nano-efficient-open-intelligent-models
- Pagina de NVIDIA Nemotron: https://developer.nvidia.com/topics/ai/nemotron
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
