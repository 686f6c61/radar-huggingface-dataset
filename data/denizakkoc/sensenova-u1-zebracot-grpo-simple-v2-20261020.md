# denizakkoc/SenseNova-U1-ZebraCoT-GRPO-Simple-v2-20261020

## Resumen

SenseNova-U1-ZebraCoT-GRPO-Simple-v2-20261020 es un checkpoint de investigación publicado por el usuario denizakkoc en Hugging Face. No se trata de un modelo independiente, sino de un conjunto de 28 adaptadores LoRA de rango 16 y alpha 16 entrenados sobre el modelo base SenseNova-U1-8B-MoT-SFT, desarrollado por SenseTime. El objetivo del experimento es el ajuste fino mediante GRPO (Group Relative Policy Optimization) para razonamiento visual sobre el dataset Zebra-CoT, un corpus multimodal de 13 categorías que incluye búsqueda visual, ajedrez, laberintos, matrices tipo Raven, ARC-AGI, física, geometría, química, algoritmos de grafos y programación competitiva.

El modelo base SenseNova-U1 emplea una arquitectura nativa de mezcla de transformers (mixture-of-transformers) denominada NEO-unify, que integra visión y lenguaje sin encoders ni decoders separados. El checkpoint aquí descrito no incluye los pesos fusionados: requiere descargar el modelo base original y cargar los adaptadores con un diccionario personalizado de SenseNova, no con el formato estándar de PEFT. El repositorio ocupa 11,4 GB e incluye metadatos de entrenamiento, cursores de datos y checksums SHA-256 por checkpoint.

La relevancia de esta publicación es principalmente metodológica: documenta un pipeline de RL con juez visual ciego a la respuesta (answer-blind v2), grading de corrección en forma libre separado, ventajas de proceso centradas y una puerta de proceso de 0,2, con acumulación de dos prompts por rango. Los entrenamientos se ejecutaron en GPUs NVIDIA A100 del clúster CINECA Leonardo durante octubre de 2026, con un juez congelado Qwen2.5-VL-72B-AWQ dedicado por nodo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de transformers (NEO-unify) sobre modelo base SenseNova-U1-8B-MoT-SFT; adaptadores LoRA de rango 16 |
| Parametros totales | 8B en el modelo base; parametros del adaptador LoRA no disponibles |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el juez externo usa AWQ, pero no se documenta cuantizacion del modelo) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | Checkpoints de adaptador personalizados de SenseNova (no son exportaciones estándar de PEFT `save_pretrained` ni modelos fusionados); incluye `checkpoint_manifest.json` y `training_metadata.json` por checkpoint |

## Arquitectura y entrenamiento

El modelo base SenseNova-U1-8B-MoT-SFT se construye sobre el backbone NEO-unify, una arquitectura de mezcla de transformers que unifica tareas de visión y lenguaje con entrenamiento de doble objetivo (analítico y creativo) sin codificadores ni decodificadores separados. Sobre esta base, el autor aplica un LoRA nuevo de rango 16 y alpha 16 mediante GRPO, con un juez visual congelado Qwen2.5-VL-72B-AWQ que evalúa las respuestas sin acceso a la respuesta correcta (answer-blind v2). El esquema de recompensa separa el grading de corrección en forma libre del juicio visual y aplica ventajas de proceso centradas con una puerta de proceso de 0,2 para evitar la amplificación del ruido del juez en grupos donde todas las rollouts son incorrectas.

El entrenamiento principal (`sensenova_v2_n6_10k_4node_20261020`) usó 4 GPUs de política y 4 GPUs de juez dedicadas, con 6 rollouts por prompt, resolución de 512 px y 50 pasos de difusión. El cursor de datos guardado representa 832 ejemplos del dataset de 10k, con 53,4 horas de procesamiento de prompts y una ventana transcurrida de 109,4 horas entre el 21 y el 25 de octubre de 2026. El dataset principal contiene 13 categorías (búsqueda visual, jigsaw, ajedrez, tetris, cifrados, laberintos, matrices Raven, ARC-AGI, física, geometría, química, algoritmos de grafos y programación competitiva) y su hash de membresía/orden original es `36d8d46fa8cb9c83`. Las ejecuciones de septiembre usaron configuraciones distintas (256 px, 8 pasos de difusión, 2 candidatos) y no deben confundirse con las de octubre.

## Capacidades

- Razonamiento visual multimodal sobre imágenes y texto, orientado a tareas de razonamiento estructurado (matrices, laberintos, ajedrez, tetris, jigsaw).
- Resolución de problemas tipo ARC-AGI y tareas de abstracción y razonamiento.
- Razonamiento científico y matemático: física, geometría y química.
- Algoritmia y programación competitiva.
- Descifrado de cifrados y tareas de búsqueda visual.
- Cadena de pensamiento visual (Zebra-CoT) como formato de razonamiento intermedio.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente multi-paso.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Investigación en RL para razonamiento visual: el repositorio sirve como referencia reproducible de un pipeline GRPO con juez ciego a la respuesta, útil para estudiar cómo evitar la filtración de la respuesta en la señal de recompensa.
- Evaluación de metodologías de recompensa: los 28 checkpoints permiten comparar variantes intermedias y analizar la estabilidad del entrenamiento con distintos ajustes de proceso y grading.
- Fine-tuning sobre SenseNova-U1: los adaptadores LoRA pueden cargarse sobre el modelo base para experimentar con dominios específicos de razonamiento visual sin reentrenar el modelo completo.
- Benchmarking de razonamiento abstracto: adecuado para probar protocolos sobre tareas ARC-AGI, matrices Raven y laberintos con un modelo de 8B.
- Estudio de eficiencia de entrenamiento: los metadatos de Slurm, horas de prompt y cursores de datos permiten analizar costes reales en clúster A100.
- Reproducción académica: útil en entornos de investigación que necesiten partir de un checkpoint documentado con checksums y procedencia verificable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El checkpoint es un adaptador LoRA; requiere cargar el modelo base SenseNova-U1-8B-MoT-SFT (8B parámetros) además de los adaptadores.
- VRAM estimada para inferencia del modelo base: aproximadamente 16 GB en FP16/BF16; no se documenta cuantización oficial del checkpoint.
- GPU recomendadas para el modelo base: A100 40/80 GB o H100 para despliegue sin cuantización; RTX 4090 (24 GB) es viable en BF16 para el modelo de 8B, aunque no está verificado en la documentación.
- El entrenamiento documentado usó NVIDIA A100 en CINECA Leonardo, con 4 GPUs de política y 4 de juez (Qwen2.5-VL-72B-AWQ) por nodo.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el formato de adaptador es personalizado de SenseNova y no es compatible directamente con PEFT estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SenseNova-U1-ZebraCoT-GRPO-Simple-v2 (este) | 8B base + LoRA r16 | no disponible | apache-2.0 | Adaptador personalizado SenseNova | Checkpoint de investigación, 28 variantes |
| SenseNova-U1-8B-MoT-SFT | 8B | no disponible | no disponible en la informacion | no disponible | Modelo base oficial de SenseTime |
| Qwen2.5-VL-72B-AWQ | 72B | no disponible | no disponible en la informacion | AWQ | Usado como juez congelado en el entrenamiento |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base SenseNova-U1-8B-MoT-SFT y un cargador con diccionario personalizado de SenseNova; no funciona con `peft` estándar ni con `from_pretrained` convencional.
- Solo soporta inglés según la model card.
- No se han publicado benchmarks ni evaluaciones de calidad; el autor indica explícitamente que preserva variantes e intermedios en lugar de seleccionar solo el mejor checkpoint por held-out score.
- Riesgo de alucinación y de ruido del juez: el propio autor documenta que la versión v2 corrige problemas de fuga de respuesta y amplificación de ruido del juez en grupos con todas las respuestas incorrectas, lo que sugiere que versiones previas presentaban estos fallos.
- La revisión histórica exacta del modelo base en el Hub no quedó registrada en el checkpoint, lo que puede afectar a la reproducibilidad exacta.
- Checkpoint de investigación con 0 descargas y 0 likes; no hay evidencia de uso en producción ni validación externa.
- Algunas ejecuciones de Slurm figuran como FAILED o CANCELLED; los pesos de intentos fallidos sin guardado no pueden reconstruirse.
- Aunque la licencia es apache-2.0, conviene verificar la licencia del modelo base SenseNova-U1-8B-MoT-SFT antes de uso comercial, ya que no se detalla en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/denizakkoc/SenseNova-U1-ZebraCoT-GRPO-Simple-v2-20261020
- Modelo base: https://huggingface.co/sensenova/SenseNova-U1-8B-MoT-SFT
- Dataset: https://huggingface.co/datasets/multimodal-reasoning-lab/Zebra-CoT
- Plataforma SenseNova (SenseTime): https://www.sensenova.ai/
- Referencia sobre SenseNova-U1: https://www.emergentmind.com/topics/sensenova-u1
