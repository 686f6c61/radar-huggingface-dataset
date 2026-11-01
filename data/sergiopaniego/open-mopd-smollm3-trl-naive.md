# sergiopaniego/open-mopd-smollm3-trl-naive

## Resumen

Open-MOPD SmolLM3-3B TRL naive es un checkpoint de demostración publicado por Sergio Paniego que aplica destilación on-policy multi-profesor (MOPD, *multi-teacher on-policy distillation*) sobre el modelo SmolLM3-3B mediante el `AsyncDistillationTrainer` de la librería TRL. El modelo parte de `BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-MixSFT` como estudiante y utiliza tres profesores especializados (matemáticas, código e instrucciones) liberados junto al paper Open-MOPD. Su propósito explícito no es el uso en producción, sino verificar que la implementación de TRL del algoritmo de destilación asíncrona funciona correctamente.

El entrenamiento se limita a 60 pasos, aproximadamente el 1 % del cómputo del paper original, sobre 4 GPU H200 y con una mezcla de prompts `rl_prompt_mix` muestreada en proporción 40/40/20 entre matemáticas, código e instrucciones. A pesar de la brevedad del run, el checkpoint muestra mejoras medibles frente al modelo de partida en AIME24, AIME25 e IFEval, lo que lo convierte en una referencia útil para quienes quieran reproducir o auditar el pipeline de destilación de TRL.

Con 3.075.098.624 parámetros y licencia Apache 2.0, se trata de un modelo pequeño dentro de la familia SmolLM3, orientado a generación de texto conversacional y razonamiento. Su relevancia actual radica en que documenta de forma reproducible una técnica (destilación on-policy con múltiples profesores y KL inversa) que está ganando tracción como alternativa al RLHF clásico para especializar modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM3-3B); detalles internos no disponibles en la información proporcionada |
| Parametros totales | 3.075.098.624 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (las completions de entrenamiento usan 16K tokens, no necesariamente el contexto máximo del modelo) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `Open-MOPD-SmolLM3-3B-MixSFT`, que a su vez deriva de SmolLM3-3B, un transformer decoder-only de aproximadamente 3.000 millones de parámetros. La información disponible no detalla la composición interna de la arquitectura (número de capas, dimensión oculta, mecanismo de atención), por lo que esos datos deben consultarse en la model card del modelo base.

El entrenamiento aplica destilación on-policy multi-profesor: cada prompt se enruta al profesor de su dominio (matemáticas, código o instrucciones) y el estudiante se optimiza para minimizar la KL inversa (`beta=1.0`) respecto a la distribución del profesor correspondiente. Se usaron 16K tokens de completion, learning rate constante de 1.5e-6 y 60 pasos sobre 4 GPU H200 (servidor del estudiante, profesores y trainer). Los datos provienen del subconjunto `rl_prompt_mix` de `BytedTsinghua-SIA/Open-MOPD-Data`, muestreado 40/40/20 entre matemáticas, código e instrucciones. La innovación técnica destacable es el uso de `AsyncDistillationTrainer` de TRL, que desacopla la generación de los profesores del paso de optimización del estudiante, permitiendo destilar con profesores de mayor tamaño sin bloquear el entrenamiento.

## Capacidades

- Generación de texto conversacional en formato multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento matemático, reforzado específicamente mediante el profesor de matemáticas del conjunto Open-MOPD.
- Generación de código, aunque el autor indica explícitamente que el código no fue evaluado en este checkpoint.
- Seguimiento de instrucciones (IFEval), con mejora medida frente al modelo de partida.
- Razonamiento multi-paso orientado a problemas tipo competición (AIME), con capacidad de generar cadenas de razonamiento largas (hasta 16K tokens en entrenamiento).
- Compatibilidad con endpoints de HuggingFace (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Reproducción y validación del pipeline de destilación de TRL: sirve como referencia ejecutable para verificar que `AsyncDistillationTrainer` funciona antes de lanzar runs largos con presupuesto real de cómputo.
- Investigación sobre destilación multi-profesor: permite estudiar cómo se comporta el enrutado por dominio (math/code/IF) con un coste de entrenamiento mínimo de 60 pasos.
- Experimentos académicos de ajuste fino eficiente: con 3.000 millones de parámetros y licencia Apache 2.0, es viable iterar sobre él en clústeres pequeños de 4 GPU H200 o equivalentes.
- Evaluación comparativa de checkpoints intermedios: útil para medir la curva de mejora en AIME e IFEval a lo largo de un run de destilación y contrastarla con el modelo final del paper.
- Base para prototipos de asistentes de razonamiento matemático: aunque no es un modelo de producción, puede emplearse en entornos de laboratorio para probar prompts y scorers de evaluación tipo AIME.
- Docencia y formación técnica: ejemplo didáctico de cómo se estructura un experimento de destilación on-policy con profesores especializados y datos mixtos por dominio.
- No se recomienda su uso en atención al cliente, generación de código en producción ni despliegues reales, tal como advierte el propio autor.

## Benchmarks y rendimiento

| Modelo | AIME24 | AIME25 | IFEval |
|---|---|---|---|
| MixSFT (punto de partida) | 17.5 | 19.2 | 67.5 |
| Este checkpoint (60 pasos) | 24.2 | 22.5 | 73.0 |
| Open-MOPD final (paper) | 19.2 | 25.0 | 75.8 |

Evaluación realizada con los conjuntos y scorers de Open-MOPD: AIME con 4 muestras por problema e IFEval con precisión estricta a nivel de prompt. El código no fue evaluado.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 6,2 GB solo para pesos (3.075 M × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 8 y 12 GB según longitud de contexto.
- En cuantización de 8 bits: alrededor de 3,1 GB de pesos; en 4 bits, alrededor de 1,6 GB, aunque no se han publicado pesos cuantizados oficiales.
- GPU recomendadas para entrenamiento completo: 4 × H200, configuración usada por el autor (servidor del estudiante, profesores y trainer).
- GPU para inferencia: cabe en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB) en BF16, y en GPUs de 8-12 GB con cuantización.
- Opciones de despliegue: transformers (librería declarada), vLLM, TGI, llama.cpp u Ollama previa conversión a GGUF; endpoints compatibles de HuggingFace.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint | 3.075 M | no disponible | Apache 2.0 | HuggingFace | Demo de 60 pasos, no apto para producción |
| Open-MOPD final (paper) | ~3.000 M | no disponible | no disponible | HuggingFace (BytedTsinghua-SIA) | Modelo completo del paper, mejores resultados en IFEval y AIME25 |
| Open-MOPD-SmolLM3-3B-MixSFT | ~3.000 M | no disponible | no disponible | HuggingFace (BytedTsinghua-SIA) | Punto de partida del estudiante |
| SmolLM3-3B (base) | ~3.000 M | no disponible | no disponible | HuggingFace (HuggingFaceTB) | Modelo original sin destilar |

La comparación con alternativas de otros linajes (Qwen, Llama) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que no es un modelo para usar: fue entrenado solo 60 pasos, aproximadamente el 1 % del cómputo del paper Open-MOPD.
- Riesgo elevado de alucinación y de razonamiento incompleto al no haber completado el proceso de destilación.
- El código no fue evaluado, por lo que su calidad en generación de código es desconocida.
- Idiomas soportados no documentados; no hay garantía de comportamiento multilingüe más allá de lo heredado del modelo base.
- No se han publicado datos sobre sesgos, filtraciones de datos ni evaluación de seguridad.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el estado de entrenamiento hace desaconsejable cualquier despliegue en producción.
- Los pesos se distribuyen en safetensors sin cuantizaciones oficiales; cualquier GGUF o cuantización sería de terceros.
- El repositorio ocupa 24,6 GB, lo que sugiere que puede contener checkpoints adicionales además de los pesos finales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sergiopaniego/open-mopd-smollm3-trl-naive
- Modelo base (estudiante): https://huggingface.co/BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-MixSFT
- Profesor de matemáticas: https://huggingface.co/BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-RL-Math
- Profesor de código: https://huggingface.co/BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-RL-Code
- Profesor de instrucciones: https://huggingface.co/BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-RL-IF
- Dataset Open-MOPD-Data: https://huggingface.co/datasets/BytedTsinghua-SIA/Open-MOPD-Data
- Paper Open-MOPD: https://huggingface.co/papers/2608.19098
- Dashboard de métricas (Trackio): https://huggingface.co/spaces/sergiopaniego/open-mopd-trl
- Script de entrenamiento en TRL: https://github.com/huggingface/trl/blob/main/examples/async_distillation_math/async_distillation_mopd.py
