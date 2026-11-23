# sergiopaniego/open-mopd-smollm3-trl-naive

## Resumen

Open-MOPD SmolLM3-3B TRL naive es un checkpoint de demostración publicado por Sergio Paniego que reproduce, a pequeña escala, el pipeline de destilación on-policy multi-profesor (MOPD, *multi-teacher on-policy distillation*) implementado en la librería TRL de Hugging Face mediante el `AsyncDistillationTrainer`. El modelo parte del estudiante `BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-MixSFT` (3.075 millones de parámetros, arquitectura SmolLM3) y se entrena destilando el comportamiento de tres profesores especializados —matemáticas, código e instrucciones— liberados junto al paper Open-MOPD (arXiv 2608.19098).

La relevancia del artefacto no está en su calidad final, sino en su función como prueba de concepto reproducible: valida que la implementación asíncrona de destilación de TRL funciona sobre hardware modesto (4 GPU H200) y publica métricas intermedias comparables con el modelo final del paper. El propio autor advierte explícitamente de que no es un modelo para usar en producción: se entrenó durante solo 60 pasos, aproximadamente el 1 % del entrenamiento descrito en el paper.

El checkpoint es útil para desarrolladores e investigadores que quieran entender, replicar o extender técnicas de fusión de expertos RL en un único modelo estudiante, así como para auditar el comportamiento de la destilación por KL inversa con enrutado de prompts por dominio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM3), pesos en safetensors |
| Parámetros totales | 3.075.098.624 (3,08 B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible en la información proporcionada (entrenamiento con completaciones de 16K tokens) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el repo ocupa 24,6 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del estudiante SmolLM3-3B (`Open-MOPD-SmolLM3-3B-MixSFT`), un transformer decoder-only de 3,08 mil millones de parámetros. El entrenamiento aplica destilación on-policy multi-profesor: cada prompt se enruta a su profesor de dominio correspondiente (matemáticas, código o instrucción) y el estudiante se ajusta para minimizar la divergencia KL inversa (`beta=1.0`) respecto a las distribuciones del profesor asignado. Los datos provienen del split `rl_prompt_mix` del dataset `BytedTsinghua-SIA/Open-MOPD-Data`, muestreado en proporción 40/40/20 entre matemáticas, código e instrucción.

La innovación técnica principal es el uso del `AsyncDistillationTrainer` de TRL, que desacopla los servidores de inferencia de los profesores del proceso de entrenamiento del estudiante, permitiendo destilar varios profesores simultáneamente sin bloquear el bucle de optimización. La configuración concreta: learning rate constante de 1,5e-6, completaciones de 16K tokens, 60 pasos de entrenamiento sobre 4 GPU H200 (servidor del estudiante, profesores y trainer). No se reporta número total de tokens de entrenamiento ni composición detallada del dataset más allá del muestreo por dominio.

## Capacidades

- Generación de texto conversacional en formato chat (pipeline `text-generation`, tag `conversational`).
- Razonamiento matemático: herencia del profesor de matemáticas vía destilación KL inversa.
- Generación de código: herencia del profesor de código (aunque el autor no evalúa código en este checkpoint).
- Seguimiento de instrucciones: herencia del profesor de instrucción, medido con IFEval strict prompt-level accuracy.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Reproducción del pipeline MOPD en TRL: sirve como referencia ejecutable para validar el `AsyncDistillationTrainer` antes de lanzar un entrenamiento completo; el script `async_distillation_mopd.py` del repo de TRL es directamente reutilizable.
- Investigación en destilación multi-profesor: permite estudiar cómo evolucionan las métricas por dominio (AIME24, AIME25, IFEval) en las primeras decenas de pasos y comparar con el modelo final del paper.
- Auditoría de enrutado por dominio: útil para verificar que el enrutado 40/40/20 de prompts a profesores produce mejoras equilibradas y detectar dominios que se degradan.
- Docencia y formación técnica: ejemplo didáctico de destilación on-policy con KL inversa, útil en cursos de post-entrenamiento y RLHF.
- Desarrollo de infraestructura de entrenamiento asíncrono: referencia para medir el coste y la latencia de servir tres profesores de 3B en paralelo con un estudiante del mismo tamaño.
- Base para ablaciones: punto de partida para experimentos sobre número de pasos, temperatura, beta o proporciones de mezcla de datos, dado que su estado intermedio está documentado con métricas.
- No se recomienda su uso en producción, atención al cliente ni generación de código real: el autor lo desaconseja explícitamente por el entrenamiento insuficiente.

## Benchmarks y rendimiento

Evaluación con los conjuntos y scorers de Open-MOPD (AIME con 4 muestras por problema, IFEval strict prompt-level accuracy). El código no fue evaluado.

| Modelo | AIME24 | AIME25 | IFEval |
|---|---|---|---|
| MixSFT (punto de partida) | 17,5 | 19,2 | 67,5 |
| Este checkpoint (60 pasos) | 24,2 | 22,5 | 73,0 |
| Open-MOPD final (paper) | 19,2 | 25,0 | 75,8 |

Destaca que el checkpoint intermedio supera al modelo final del paper en AIME24 (24,2 frente a 19,2), aunque queda por debajo en AIME25 e IFEval. El autor no ofrece una explicación de esta anomalía en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 3,08 B de parámetros, en fp16 requiere aproximadamente 6,2 GB de pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: el entrenamiento se realizó en 4 GPU H200; para inferencia basta una GPU con al menos 8-16 GB de VRAM según cuantización.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3090, RTX 4090, RTX 4080 y superiores en fp16 o cuantizado (no confirmado por el autor).
- Opciones de despliegue: `transformers` (librería declarada); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | AIME24 | AIME25 | IFEval | Licencia |
|---|---|---|---|---|---|---|
| Este checkpoint | 3,08 B | no disponible | 24,2 | 22,5 | 73,0 | Apache 2.0 |
| Open-MOPD-SmolLM3-3B-MixSFT (base) | 3,08 B | no disponible | 17,5 | 19,2 | 67,5 | no disponible |
| Open-MOPD final (paper) | 3,08 B | no disponible | 19,2 | 25,0 | 75,8 | no disponible |
| Profesor RL-Math (Open-MOPD) | 3,08 B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación más directa es con el estudiante de partida y con el modelo final del paper, ambos de la misma familia y tamaño. No se dispone de datos de benchmarks de los profesores individuales ni de alternativas externas en la información proporcionada.

## Limitaciones y advertencias

- Entrenamiento deliberadamente insuficiente: 60 pasos, aproximadamente el 1 % del entrenamiento del paper; el autor indica explícitamente que no es un modelo para usar.
- Calidad no representativa: las métricas intermedias pueden fluctuar y no reflejan el comportamiento convergido de la receta MOPD.
- Código no evaluado: no hay evidencia de rendimiento en generación de código pese a que el profesor de código participó en la destilación.
- Riesgo de alucinación: no cuantificado en la información disponible; previsiblemente alto en un modelo de 3B con entrenamiento mínimo.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas soportados: no declarados; no se garantiza cobertura multilingüe.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero su calidad lo desaconseja; verificar además las licencias de los modelos base y profesores de la familia Open-MOPD.
- Contexto: aunque el entrenamiento usa completaciones de 16K tokens, la longitud de contexto efectiva del modelo no se declara.
- Repo de 24,6 GB: incluye presumiblemente múltiples artefactos; conviene revisar qué ficheros se descargan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sergiopaniego/open-mopd-smollm3-trl-naive
- Modelo base (estudiante): https://huggingface.co/BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-MixSFT
- Profesor de matemáticas: https://huggingface.co/BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-RL-Math
- Profesor de código: https://huggingface.co/BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-RL-Code
- Profesor de instrucción: https://huggingface.co/BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-RL-IF
- Dataset: https://huggingface.co/datasets/BytedTsinghua-SIA/Open-MOPD-Data
- Paper Open-MOPD: https://huggingface.co/papers/2608.19098
- Blog del autor: https://huggingface.co/blog/sergiopaniego/mopd-trl
- Colección del experimento: https://huggingface.co/collections/sergiopaniego/mopd-with-trl-experiment
- Dashboard de métricas (Trackio): https://huggingface.co/spaces/sergiopaniego/open-mopd-trl
- Script de entrenamiento en TRL: https://github.com/huggingface/trl/blob/main/examples/async_distillation_mopd/async_distillation_mopd.py
