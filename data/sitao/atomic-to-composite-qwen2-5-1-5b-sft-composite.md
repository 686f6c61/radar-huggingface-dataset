# sitao/atomic-to-composite-qwen2.5-1.5b-sft-composite

## Resumen

Este modelo es un ajuste fino (SFT) de parámetros completos sobre Qwen2.5-1.5B, desarrollado por el investigador Sitao Cheng y colaboradores como artefacto de investigación del paper *"From Atomic to Composite: Reinforcement Learning Enables Generalization in Complementary Reasoning"* (arXiv:2512.01970). El modelo, denominado SFT<sub>Comp</sub>, se ha entrenado directamente sobre pares de preguntas y respuestas de razonamiento complementario (COMP) con el dataset sintético `sitao/From_atomic_to_composite`, y constituye el punto de partida de la receta de entrenamiento "composite-first" (SFT sobre la tarea compuesta, seguido de RL con GRPO).

Su propósito es estudiar la generalización composicional en razonamiento multi-hop: hasta qué punto un modelo pequeño puede combinar habilidades atómicas (memoria de hechos y uso de contexto) para resolver preguntas compuestas. Es relevante para investigadores que trabajan en composición de habilidades, entrenamiento con refuerzo (GRPO) y generalización fuera de distribución, ya que permite comparar directamente cuatro variantes de entrenamiento del mismo modelo base. La arquitectura es un transformer decoder denso de 1.543.714.304 parámetros, con pesos distribuidos en safetensors (3,1 GB en el repositorio).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2.5), denso |
| Parametros totales | 1.543.714.304 (~1,54 B) |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-1.5B base) |
| Tipos de cuantizacion | no disponible (solo pesos originales en bf16/fp16) |
| Idiomas soportados | Ingles (entrenado exclusivamente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers y text-generation-inference) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B, un transformer decoder denso de la familia Qwen2.5 de Alibaba. Sobre este base se ha realizado un SFT de parámetros completos (full-parameter fine-tuning) empleando el framework LLaMA-Factory, entrenando directamente sobre la tarea compuesta (Complementary QA, COMP): preguntas multi-hop que requieren combinar hechos memorizados en biografías sintéticas con información proporcionada en párrafos de contexto. No se trata de un modelo MoE ni incorpora innovaciones arquitectónicas propias; su interés reside en la receta de entrenamiento.

El dataset de entrenamiento es `sitao/From_atomic_to_composite`, compuesto por biografías sintéticas y preguntas de razonamiento complementario. Según el paper asociado, este modelo SFT<sub>Comp</sub> es el punto de partida de la receta "composite-first", que posteriormente aplica RL con GRPO (Group Relative Policy Optimization) mediante el framework verl para mejorar la generalización. El formato de inferencia es conversacional (chat template de Qwen2.5), y el modelo genera una cadena de razonamiento que finaliza con el patrón `So, the answer is: <answer>`.

## Capacidades

- Respuesta a preguntas multi-hop sobre biografías sintéticas, combinando hechos memorizados durante el entrenamiento con párrafos de contexto entregados en el prompt (formato `PARAGRAPH:`).
- Generación de cadenas de razonamiento explícitas antes de la respuesta final, terminando con `So, the answer is: <answer>`.
- Razonamiento complementario (complementary reasoning): integración de memoria paramétrica y contexto en una sola inferencia.
- Rendimiento medido en tres niveles de generalización sobre el test COMP de 4.468 ítems: IID (71,85 %), composición (60,21 %) y zero-shot (26,14 %).
- No está orientado a uso general: no incluye tool calling, agentes, visión, audio ni modo de pensamiento extendido; no hay evidencia de soporte multilingüe más allá del inglés.

## Casos de uso

- Investigacion en generalizacion composicional: sirve como baseline SFT<sub>Comp</sub> para comparar recetas de entrenamiento (atomic-first frente a composite-first) en la composición de habilidades, replicando los experimentos del paper.
- Estudio de RL post-SFT: punto de partida para aplicar GRPO con verl y medir cuánto mejora el aprendizaje por refuerzo la generalización fuera de distribución.
- Evaluacion de razonamiento multi-hop en modelos pequeños: permite probar cómo un modelo de 1,5 B maneja preguntas que exigen combinar memoria paramétrica y contexto, con un test estandarizado de 4.468 ítems.
- Investigacion en datos sinteticos de entrenamiento: caso de estudio sobre cómo las biografías sintéticas afectan a la memorización y al uso de contexto en modelos compactos.
- Prototipado de pipelines de QA con contexto: el formato de prompt (pregunta + párrafos tras `PARAGRAPH:`) puede reutilizarse para experimentos de QA extractivo con razonamiento intermedio.
- Docencia y divulgacion: ejemplo práctico y reproducible (código y datos públicos) para ilustrar en cursos la diferencia entre SFT directo sobre la tarea compuesta y entrenamiento por habilidades atómicas seguido de RL.

## Benchmarks y rendimiento

El paper reporta resultados en el test Complementary (COMP) de 4.468 ítems, por nivel de generalización (precisión en %, extraídos del log de validación del entrenamiento):

| Benchmark | IID | Composition | Zero-shot |
|---|---:|---:|---:|
| COMP test set (SFT<sub>Comp</sub>) | 71,85 | 60,21 | 26,14 |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,1 GB solo para los pesos; con overhead de activaciones y KV cache, unos 4-6 GB son suficientes para contextos moderados.
- Cabe con holgura en GPUs de consumo: RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4090 o incluso GPUs de 8 GB. También es viable su ejecución en CPU, aunque con latencias altas.
- No se requieren GPUs de centro de datos (A100/H100) salvo para reentrenamiento o experimentación a gran escala.
- Despliegue: transformers (ejemplo oficial en la model card), text-generation-inference (etiqueta `text-generation-inference` en el repo), y en principio compatible con llama.cpp u Ollama mediante conversión a GGUF (no hay cuantizaciones oficiales publicadas).
- Latencia y throughput estimados: no disponible; al ser un modelo de 1,5 B en GPU de consumo, se esperan latencias de decodificación del orden de decenas de tokens por segundo como mínimo, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea/entrenamiento | Resultado COMP (IID/Comp/Zero-shot) | Licencia |
|---|---|---|---|---|
| sitao/atomic-to-composite-qwen2.5-1.5b-sft-composite (este) | 1,54 B | SFT directo sobre tarea compuesta | 71,85 / 60,21 / 26,14 | Apache 2.0 |
| sitao/atomic-to-composite-qwen2.5-1.5b-sft-atomic | 1,54 B | SFT sobre habilidades atómicas (memoria + contexto) | no disponible | Apache 2.0 |
| sitao/atomic-to-composite-qwen2.5-1.5b-atomic-first-rl | 1,54 B | SFT atómico + RL<sub>Comp</sub> (GRPO) | no disponible | Apache 2.0 |
| sitao/atomic-to-composite-qwen2.5-1.5b-composite-first-rl | 1,54 B | SFT<sub>Comp</sub> + RL<sub>Comp</sub> (GRPO) | no disponible | Apache 2.0 |

Los cuatro modelos comparten base, tamaño y licencia, y están diseñados para comparar recetas de entrenamiento; el paper (Tabla 7 y Figura 8) documenta sus diferencias de rendimiento. Frente a Qwen2.5-1.5B base, este modelo está especializado exclusivamente en la tarea COMP y no es un asistente de propósito general.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado sobre biografías sintéticas para la tarea COMP; no es un asistente general y su comportamiento fuera de esa distribución es pobre (26,14 % en zero-shot).
- Riesgo elevado de alucinación fuera del dominio de entrenamiento, al tratarse de un modelo de 1,5 B ajustado con datos sintéticos.
- Limitado al inglés; no hay soporte declarado para otros idiomas, incluido el castellano.
- No hay soporte documentado de tool calling, agentes, visión ni audio.
- No se han publicado cuantizaciones oficiales, lo que limita las opciones de despliegue optimizado sin conversión manual.
- La longitud de contexto heredada del modelo base no está documentada en la model card; verificar antes de usar contextos largos.
- Licencia Apache 2.0 sin restricciones comerciales relevantes, pero al ser un artefacto de investigación, los autores no garantizan robustez para producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-1.5b-sft-composite
- Paper (arXiv): https://arxiv.org/abs/2512.01970
- Pagina del proyecto: https://sitaocheng.github.io/atomic/
- Codigo (GitHub): https://github.com/sitaocheng/from_atomic_to_composite
- Dataset: https://huggingface.co/datasets/sitao/From_atomic_to_composite
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Modelos hermanos:
  - https://huggingface.co/sitao/atomic-to-composite-qwen2.5-1.5b-sft-atomic
  - https://huggingface.co/sitao/atomic-to-composite-qwen2.5-1.5b-atomic-first-rl
  - https://huggingface.co/sitao/atomic-to-composite-qwen2.5-1.5b-composite-first-rl
