# logan7000/mllm-cogrpo-heter-qwen25vl-3b-x-gemma3-4b-open-r1-mmupt-groupB-gemma3-4b-full

## Resumen

El modelo `mllm-cogrpo-heter-qwen25vl-3b-x-gemma3-4b-open-r1-mmupt-groupB-gemma3-4b-full` es un checkpoint experimental desarrollado por `logan7000` dentro de un proyecto de co-entrenamiento heterogéneo mediante RL (Co-GRPO). Se trata del lado Gemma-3-4B de una pareja que incluye a Qwen2.5-VL-3B como "peer". El objetivo del experimento es explorar el razonamiento matemático multimodal, entrenando sobre datos OpenR1 de 8k y evaluando en benchmarks como MathVista, MathVision, MathVerse y We-Math.

El modelo no es un producto final ni un modelo generalista, sino un artefacto de investigación para estudiar el aprendizaje por refuerzo en arquitecturas multimodales heterogéneas. No se han publicado detalles sobre la arquitectura interna, el número exacto de parámetros ni la licencia. El repositorio pesa 17,2 GB y los pesos se distribuyen en formato `safetensors`. Solo se conservan dos checkpoints: el mejor por validación en MathVista-150 (step 600) y el checkpoint final de la época (step 640).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es el resultado de un co-entrenamiento por refuerzo (Co-GRPO) entre dos modelos multimodales distintos: Qwen2.5-VL-3B y Gemma-3-4B. El checkpoint corresponde al lado Gemma (`groupB`), mientras que el lado Qwen2.5-VL se publica en un repositorio separado. Ambos comparten la misma receta de entrenamiento.

La receta, denominada "mmupt Gemma variant", incluye los siguientes hiperparámetros: beta 0,01, K 10, T 1,0, `max_completion_length` 1024, learning rate 1e-6 con `cosine_with_min_lr` 0,1, `warmup_ratio` 0, `weight_decay` 0,01, `max_grad_norm` 1,0, `bnpo`, escala de recompensas por grupo y batch efectivo de 120 (12 prompts por step), durante una sola época. El entrenamiento se realizó en el clúster A100 de la Universidad Johns Hopkins entre el 3 y el 5 de septiembre de 2026.

No se proporciona información sobre la composición del dataset, el uso de RLHF/DPO, ni sobre innovaciones técnicas específicas de la arquitectura. El modelo se evalúa con un protocolo v2 (temperatura 0, `top_p` 0,95, 16k tokens, prompt con "boxed", reglas MathRuler y juez Qwen2.5-32B). La métrica principal es `AVG4`, que promedia los resultados en MathVista, MathVision, MathVerse y We-Math.

## Capacidades

Dado que el modelo es un checkpoint de investigación y no se publican resultados de evaluación ni una descripción funcional, las capacidades no están confirmadas. A partir del contexto de entrenamiento, se pueden inferir las siguientes:

- Razonamiento matemático visual: el modelo fue entrenado específicamente en datasets de matemáticas multimodales y evaluado en cuatro benchmarks de matemáticas visuales.
- Entrada multimodal: al derivar de modelos como Qwen2.5-VL y Gemma-3, cabe esperar que procese imágenes y texto, aunque esto no está verificado.
- Generación de texto: se asume por la naturaleza transformer, pero no hay datos sobre calidad o longitud.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (se desconoce el alcance real).
- Modo de pensamiento, visión o audio: no disponible; no hay confirmación de funcionalidades especiales.

## Casos de uso

No se dispone de casos de uso confirmados ni de documentación de usuario. A continuación se enumeran aplicaciones potenciales, basadas en el propósito del entrenamiento y en la arquitectura supuesta, sin garantía de rendimiento:

- Investigación en RL para modelos multimodales: permite estudiar cómo interactúan dos arquitecturas distintas durante el co-entrenamiento por refuerzo.
- Evaluación de métodos de co-aprendizaje heterogéneo: sirve como caso de estudio para comparar el efecto de usar Qwen2.5-VL-3B frente a Gemma-3-4B como peer.
- Razonamiento matemático sobre figuras e imágenes: se podría utilizar en experimentos académicos para resolver problemas de geometría o álgebra visual, siempre que el rendimiento sea aceptable.
- Generación de explicaciones paso a paso en tareas de matemáticas visuales: el entrenamiento con objetivos de razonamiento puede permitir producir justificaciones, aunque no hay evidencia.
- Análisis de curvas de aprendizaje y selección de checkpoints: los archivos de entrenamiento permiten estudiar el comportamiento del modelo a lo largo de la época y comparar selección por validación.
- Pruebas de robustez ante cambios de prompt o de distribución: al ser un modelo experimental, es útil para medir la sensibilidad de métodos de RL a variaciones en la entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el checkpoint `best/` fue seleccionado por mejor valor de MathVista-150 holdout en el step 600, y que se calcula un `AVG4` sobre MathVista, MathVision, MathVerse y We-Math, pero no se proporcionan las puntuaciones numéricas. Por tanto, no es posible presentar una tabla comparativa de rendimiento.

## Requisitos de hardware

No hay especificaciones oficiales de hardware para este modelo. A partir del tamaño del repositorio (17,2 GB) y de la arquitectura supuesta (Gemma-3-4B), se pueden dar estimaciones orientativas:

- VRAM estimada para inferencia: en FP16, un modelo de 4B parámetros requiere aproximadamente 8-10 GB de VRAM, más el overhead de la implementación. Con cuantización de 4 bits, la carga podría reducirse a unos 3-4 GB.
- GPU recomendadas: para inferencia en FP16, una GPU con al menos 16 GB (RTX 4080, A100, H100) es adecuada. Para cuantización 4-bit podría usarse una RTX 3060 de 12 GB.
- Disponibilidad en GPU de consumo: probablemente cabe en GPUs de consumo con 12 GB o más, si se cuantiza, aunque no hay garantías.
- Opciones de despliegue: al ser un modelo en `safetensors`, se puede cargar con frameworks como vLLM, TGI o Transformers. No se sabe si hay una versión `GGUF` publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de suficientes datos para una comparativa cuantitativa. Los siguientes modelos están relacionados por ser parte de la misma línea experimental o por su tamaño:

| Modelo | Relación | Parámetros | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-VL-3B | Peer del checkpoint (grupo A) | 3B | no disponible | desconocida | Repositorio del mismo run |
| mllm-cogrpo-heter-qwen25vl-7b-x-gemma3-12b-mmr1-mmupt-groupB-full | Experimento similar con modelos mayores | no disponible | no disponible | desconocida | HuggingFace |
| mllm-cogrpo-heter-qwen25vl-7b-x-internvl35-8b-mmr1-old3ep-b16-groupB-all-ckpts | Experimento similar con otro peer | no disponible | no disponible | desconocida | HuggingFace |

Todos ellos carecen de documentación pública y de licencia especificada, lo que limita su comparación.

## Limitaciones y advertencias

- Ausencia de licencia: al no especificarse una licencia, se aplican las condiciones por defecto de HuggingFace (todos los derechos reservados). El uso comercial no está permitido sin el permiso explícito del autor.
- Sin documentación: no hay guía de uso, ejemplos de carga ni instrucciones de despliegue.
- Sin resultados publicados: no hay puntuaciones de benchmarks que permitan evaluar su rendimiento real.
- Modelo experimental: está diseñado para investigación en co-entrenamiento, no para producción.
- Sesgos y alucinaciones no evaluados: no se ha realizado ninguna auditoría de seguridad ni de sesgos.
- Posible adaptación limitada: el entrenamiento se realizó en una sola época con un dataset específico de matemáticas visuales, por lo que su generalización a otros dominios es dudosa.
- Incompatibilidad potencial con el ecosistema estándar: al ser un checkpoint sin metadatos completos, puede ser difícil de integrar en frameworks existentes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/logan7000/mllm-cogrpo-heter-qwen25vl-3b-x-gemma3-4b-open-r1-mmupt-groupB-gemma3-4b-full
- Repositorio relacionado (modelos mayores): https://huggingface.co/logan7000/mllm-cogrpo-heter-qwen25vl-7b-x-gemma3-12b-mmr1-mmupt-groupB-full
- Repositorio relacionado (con InternVL): https://huggingface.co/logan7000/mllm-cogrpo-heter-qwen25vl-7b-x-internvl35-8b-mmr1-old3ep-b16-groupB-all-ckpts
