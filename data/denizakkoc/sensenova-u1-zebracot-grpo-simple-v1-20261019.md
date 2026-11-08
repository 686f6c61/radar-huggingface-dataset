# denizakkoc/SenseNova-U1-ZebraCoT-GRPO-Simple-v1-20261019

## Resumen

SenseNova-U1-ZebraCoT-GRPO-Simple-v1-20261019 es un checkpoint de adaptador LoRA de rango 16 entrenado mediante GRPO (Group Relative Policy Optimization) sobre el modelo multimodal SenseNova-U1-8B-MoT-SFT, desarrollado por SenseTime dentro de la familia SenseNova-U1. Lo publica el usuario denizakkoc como archivo de investigación, no como modelo listo para producción: contiene 17 ficheros de checkpoint que preservan variantes experimentales e intermedios, en lugar de seleccionar únicamente el mejor resultado en validación.

El objetivo del entrenamiento es el razonamiento visual sobre el dataset Zebra-CoT (multimodal-reasoning-lab/Zebra-CoT), con una recompensa "simple-v1" permisiva que combina corrección de respuesta y fidelidad visual. El adaptador se aplica sobre la base de 8B parámetros con arquitectura MoT (Mixture of Transformers, según la nomenclatura del modelo base) y no incluye fusión de pesos: requiere cargar el modelo base por separado y aplicar el adaptador con un diccionario propio de SenseNova, no con el formato estándar de PEFT.

Es relevante ahora porque documenta de forma inusualmente detallada el proceso de entrenamiento por RL (asignaciones Slurm, cursores de datos, hashes de dataset, checksums SHA-256), lo que lo convierte en un artefacto útil para reproducibilidad e investigación en RLHF/GRPO multimodal, más que en un modelo para despliegue directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base SenseNova-U1-8B-MoT (arquitectura MoT, multimodal); el adaptador es LoRA de rango 16 sobre atención/proyecciones del modelo base |
| Parametros totales | 8B en el modelo base; el adaptador LoRA añade un número no especificado de parámetros entrenables (rango 16, alpha 16) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en precisión de entrenamiento; el modelo base admite las cuantizaciones de SenseNova-U1, no detalladas aquí) |
| Idiomas soportados | en (inglés) según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoints de adaptador personalizados de SenseNova (no son exportaciones estándar `save_pretrained` de PEFT ni modelos fusionados); incluye `checkpoint_manifest.json` y `training_metadata.json` por checkpoint; tamaño del repo 6,9 GB |

## Arquitectura y entrenamiento

El adaptador se entrena sobre SenseNova-U1-8B-MoT-SFT, un modelo multimodal de 8B parámetros de la familia SenseNova-U1 de SenseTime, cuya arquitectura se describe como "NEO-Unify" para unificar comprensión y generación multimodal. El adaptador es un LoRA de rango 16 y alpha 16, sin adaptador "Rush Hour" previo y sin etapa SFT adicional: es un entrenamiento de RL directo sobre el modelo SFT público.

El método es GRPO con seis candidatos generados secuencialmente por prompt y una recompensa permisiva "simple-v1" que evalúa corrección y fidelidad visual. El dataset principal tiene 10.000 ejemplos en 13 categorías: búsqueda visual, puzles, ajedrez, tetris, cifrados, laberintos, matrices tipo Raven, ARC-AGI, física, geometría, química, algoritmos de grafos y programación competitiva (hash de membresía/orden: `36d8d46fa8cb9c832f75554806188221b33cc673b21d2a46945ddf6b9d43dd43`). El segmento principal (`sensenova_n6_10k_4node_20261019`) usó 4 GPUs de política y 4 GPUs de juez dedicadas (Qwen2.5-VL-72B-AWQ) en CINECA Leonardo, con 512 ejemplos representados en el último checkpoint guardado (`checkpoint-0000128`), 36,206 horas de procesamiento de prompts y una ventana de 38,763 horas. Los runs de septiembre usaron configuraciones más pequeñas (256 px, 8 pasos de difusión, 2 candidatos), mientras que el run de octubre empleó 512 px, 50 pasos y 6 candidatos. No se descarta solapamiento semántico entre la exposición SFT pública y los benchmarks de evaluación.

## Capacidades

- Razonamiento visual multimodal sobre tareas de tipo Zebra-CoT: búsqueda visual, matrices de Raven, ARC-AGI, geometría, física y química.
- Generación de múltiples candidatos por prompt (seis en la configuración de entrenamiento) para selección por recompensa.
- Razonamiento de cadena de pensamiento (CoT) orientado a tareas visuales.
- Resolución de problemas de ajedrez, tetris, laberintos, cifrados y algoritmos de grafos.
- Programación competitiva y razonamiento algorítmico.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (thinking mode, audio, etc.): no disponible; el modelo base es multimodal (comprensión y generación), pero el adaptador se centra en razonamiento visual.

## Casos de uso

- Investigación en RL multimodal: el checkpoint sirve como referencia reproducible de un pipeline GRPO con recompensa visual, incluyendo manifiestos, cursores y checksums para auditar el entrenamiento.
- Evaluación de recompensas permisivas: permite estudiar cómo una recompensa "simple-v1" afecta al comportamiento del modelo en tareas de razonamiento visual frente a recompensas más estrictas.
- Análisis de datos sintéticos de razonamiento: el dataset Zebra-CoT y sus 13 categorías permiten medir la transferencia de RL a tareas de ARC-AGI, matrices de Raven y geometría.
- Reproducción de experimentos en clúster: los registros Slurm y de configuración por checkpoint permiten replicar asignaciones de GPU y ajustes de entrenamiento en entornos HPC.
- Estudio de adaptadores no estándar: útil para ingenieros que necesiten entender el formato de checkpoint propio de SenseNova frente a PEFT, de cara a integrarlo en pipelines de investigación.
- Base para experimentos de destilación o evaluación de robustez visual: al ser un adaptador LoRA pequeño sobre un base de 8B, se puede aplicar y retirar con bajo coste computacional en estudios comparativos.

## Benchmarks y rendimiento

La model card menciona evaluaciones almacenadas (con correcciones del 27 de octubre que marcan respuestas vacías como incorrectas), pero no se incluyen en la información proporcionada las puntuaciones numéricas ni las tablas de resultados. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA es pequeño en comparación con el base, pero requiere cargar el modelo base SenseNova-U1-8B-MoT-SFT completo para inferencia.
- VRAM estimada para el base de 8B: aproximadamente 16-18 GB en FP16/BF16; en cuantización de 8 bits, en torno a 8-10 GB; en 4 bits, en torno a 5-6 GB (estimaciones generales para modelos de 8B, no confirmadas para este modelo).
- GPUs recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluación a resolución completa; RTX 4090 (24 GB) viable para inferencia del base en BF16 o cuantizado.
- Cabe en GPU de consumo: probablemente sí en RTX 4090/3090 con cuantización, sujeto a que el modelo base y el adaptador sean compatibles con los runners disponibles.
- Opciones de despliegue: no disponible para este adaptador concreto; al no ser un export PEFT estándar, requiere el código propio de SenseNova. vLLM, TGI, llama.cpp u Ollama no están confirmados como compatibles.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SenseNova-U1-ZebraCoT-GRPO-Simple-v1 | 8B (base) + LoRA r16 | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Adaptador de investigación, formato propio |
| SenseNova-U1-8B-MoT-SFT | 8B | no disponible | no disponible en la información | Hugging Face (colección SenseNova) | Modelo base multimodal de SenseTime |
| Alternativas comparables de razonamiento visual | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks para comparar |

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo listo para producción: contiene 17 checkpoints intermedios y variantes, sin selección del mejor por validación.
- El adaptador usa un diccionario propio de SenseNova y no es una exportación PEFT estándar; no se puede cargar con `PeftModel.from_pretrained` sin código adicional.
- No se fusionan los pesos: es obligatorio descargar y cargar el modelo base SenseNova-U1-8B-MoT-SFT por separado.
- Solo se declara inglés; el rendimiento en castellano no está evaluado.
- La recompensa "simple-v1" es permisiva, lo que puede favorecer respuestas superficiales o parcialmente correctas; la evaluación corregida marca respuestas vacías como incorrectas, lo que sugiere inestabilidad en la generación.
- Riesgo de alucinación y de sobreajuste a las 13 categorías del dataset Zebra-CoT; no se descarta solapamiento semántico con benchmarks públicos.
- El checkpoint guardado representa 512 ejemplos de un dataset de 10.000, por lo que la cobertura de entrenamiento es limitada.
- Los runs de septiembre y octubre usaron configuraciones distintas (resolución, pasos de difusión, número de candidatos), lo que complica comparaciones directas entre checkpoints.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base SenseNova-U1 y del dataset Zebra-CoT antes de uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/denizakkoc/SenseNova-U1-ZebraCoT-GRPO-Simple-v1-20261019
- Modelo base: https://huggingface.co/sensenova/SenseNova-U1-8B-MoT-SFT
- Colección SenseNova-U1: https://huggingface.co/collections/sensenova/sensenova-u1
- Plataforma SenseNova (SenseTime): https://www.sensenova.ai/
- Dataset Zebra-CoT: https://huggingface.co/datasets/multimodal-reasoning-lab/Zebra-CoT
