# sitao/atomic-to-composite-qwen2.5-1.5b-sft-atomic

## Resumen

Este modelo es un ajuste fino (SFT a pantalla completa) de Qwen2.5-1.5B, desarrollado por el investigador Sitao Cheng y colaboradores como artefacto de investigación del artículo *From Atomic to Composite: Reinforcement Learning Enables Generalization in Complementary Reasoning* (arXiv:2512.01970). El modelo se ha entrenado exclusivamente sobre datos de habilidades "atómicas": razonamiento paramétrico (MEM, basado en memorias sintéticas) y razonamiento contextual (CTX, basado en párrafos de contexto), sin ver ningún ejemplo de la tarea compuesta (COMP), que combina ambos tipos de conocimiento en preguntas multi-hop.

Su propósito es servir como punto de partida de la receta "atomic-first": primero se enseña al modelo las habilidades atómicas mediante SFT y, posteriormente, el aprendizaje por refuerzo (GRPO con verl) sobre la tarea compuesta permite la generalización. Esta variante concreta es el checkpoint intermedio SFT<sub>Mem+Ctx</sub>, útil para estudiar la composición de habilidades y la generalización composicional en modelos pequeños.

No es un asistente de propósito general: está entrenado sobre biografías sintéticas y responde con cadenas de razonamiento que terminan en el formato `So, the answer is: <answer>`. Su relevancia es principalmente académica, como referencia reproducible para investigar cuándo el refuerzo habilita la generalización en razonamiento complementario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2.5) |
| Parametros totales | 1.543.714.304 (~1,54 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la base Qwen2.5-1.5B soporta 32.768 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16/FP16) |
| Idiomas soportados | Ingles (entrenado para la tarea en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B, un transformer decoder denso (no MoE) de la familia Qwen2.5 de Alibaba. Sobre esta base se aplica un SFT de parametros completos (full-parameter fine-tuning) utilizando LLaMA-Factory, entrenando unicamente con los datasets de habilidades atomicas: datos parametricos (MEM), donde el modelo debe recuperar hechos memorizados, y datos contextuales (CTX), donde debe extraer informacion de parrafos proporcionados en el prompt tras el marcador `PARAGRAPH:`. El dataset de entrenamiento es `sitao/From_atomic_to_composite`.

El modelo no ve ningun ejemplo de la tarea compuesta (COMP) durante el SFT, lo que lo convierte en el punto de partida de la receta "atomic-first" del paper. En la fase posterior (no incluida en este checkpoint) se aplica aprendizaje por refuerzo con GRPO mediante el framework verl sobre la tarea COMP. La innovacion central del trabajo es demostrar que entrenar primero habilidades atomicas y reforzar despues la composicion permite generalizar a niveles de composicion nuevos (compositional y zero-shot), frente a entrenar directamente sobre la tarea compuesta.

## Capacidades

- Respuesta a preguntas multi-hop que combinan conocimiento memorizado con informacion contextual (razonamiento complementario MEM+CTX).
- Generacion de cadenas de razonamiento explicitas antes de la respuesta final, con formato fijo `So, the answer is: <answer>`.
- Recuperacion de hechos de biografias sinteticas tanto desde parametros como desde el contexto del prompt.
- Comportamiento conversacional basico mediante el chat template de Qwen2.5 (pipeline text-generation).
- No soporta de forma verificada tool calling, agentes, vision ni audio; no hay informacion al respecto en la model card.
- Capacidades multilingues: no disponible; el entrenamiento se centra en ingles.

## Casos de uso

- Investigacion en generalizacion composicional: sirve como checkpoint de referencia para replicar y comparar los resultados del paper (Tabla 7 y Figura 8) sobre como el RL habilita la composicion de habilidades.
- Estudio de razonamiento multi-hop con conocimiento parametrico y contextual: permite analizar por separado la contribucion de la memoria interna y del contexto en preguntas que requieren ambos.
- Baseline para recetas de entrenamiento "atomic-first": punto de partida reproducible para aplicar GRPO u otros algoritmos de RL sobre la tarea compuesta y medir la mejora.
- Evaluacion de data curation sintetica: util para experimentar con datasets de biografias sinteticas y medir el impacto de la composicion de datos en modelos pequenos.
- Prototipado de SFT con LLaMA-Factory y RL con verl: el pipeline completo (codigo y datos publicados) sirve de plantilla para reproducir el flujo de entrenamiento en otros modelos o tareas.
- Docencia y divulgacion: ejemplo concreto y compacto (1,5B parametros) para ilustrar en cursos la diferencia entre aprendizaje de habilidades atomicas y generalizacion a tareas compuestas.

## Benchmarks y rendimiento

Resultados publicados sobre el conjunto de test Complementary (COMP), de 4.468 items, por nivel de generalizacion (precision en %, segun la validacion del run de entrenamiento reportada en el paper):

| Benchmark | IID | Composition | Zero-shot |
|---|---:|---:|---:|
| COMP test set (este modelo, SFT<sub>Mem+Ctx</sub>) | 26,79 | 26,86 | 22,44 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) para este checkpoint en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,1 GB solo de pesos; con overhead de activaciones y KV cache, unos 4-6 GB son suficientes.
- Cabe comodamente en GPUs de consumo: una RTX 3060 de 12 GB, RTX 4060 Ti o superiores ejecutan el modelo sin cuantizar; incluso portatiles con GPU de 6-8 GB pueden ser viables.
- CPU: ejecutable con llama.cpp u Ollama dada su escala, aunque la model card no incluye pesos GGUF oficiales.
- Despliegue: transformers (codigo de ejemplo en la model card), text-generation-inference y endpoints de HuggingFace (el repo esta marcado como `text-generation-inference` y `endpoints_compatible`); compatible en principio con vLLM y llama.cpp al ser un modelo Qwen2 estandar.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| atomic-to-composite-qwen2.5-1.5b-sft-atomic (este) | 1,54 B | SFT solo en habilidades atomicas (MEM+CTX) | Apache 2.0 | Pesos abiertos en HuggingFace |
| atomic-to-composite-qwen2.5-1.5b-sft-composite | 1,54 B | SFT solo en la tarea compuesta (COMP) | Apache 2.0 | Pesos abiertos en HuggingFace |
| atomic-to-composite-qwen2.5-1.5b-atomic-first-rl | 1,54 B | SFT atomico + RL (GRPO) sobre COMP | Apache 2.0 | Pesos abiertos en HuggingFace |
| atomic-to-composite-qwen2.5-1.5b-composite-first-rl | 1,54 B | SFT compuesto + RL (GRPO) sobre COMP | Apache 2.0 | Pesos abiertos en HuggingFace |
| Qwen/Qwen2.5-1.5B (base) | 1,54 B | Preentrenamiento general | Qwen Research / Apache 2.0 (segun version) | Pesos abiertos en HuggingFace |

Las cuatro variantes del proyecto comparten base, tamano y licencia; se diferencian unicamente en la receta de entrenamiento, lo que permite comparaciones controladas del efecto del RL sobre la generalizacion composicional.

## Limitaciones y advertencias

- No es un asistente de proposito general: esta entrenado sobre biografias sinteticas y su formato de salida esta especializado en la tarea COMP; su utilidad fuera de ese dominio no esta evaluada.
- Precision baja en terminos absolutos: alrededor del 22-27 % en el test COMP, por lo que no debe usarse como sistema de respuesta a preguntas en produccion.
- Riesgo de alucinacion: al tratarse de un modelo pequeno con razonamiento multi-hop sobre hechos sinteticos, las cadenas de razonamiento pueden contener errores no verificables.
- Limitado al ingles: el entrenamiento se centra en esa lengua; el rendimiento en castellano no esta evaluado.
- Sesgos: no documentados por el autor; al usar datos sinteticos, los sesgos del generador de datos pueden transferirse al modelo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero hereda las condiciones de la base Qwen2.5-1.5B, cuya licencia debe revisarse segun la version concreta del repositorio base.
- La longitud de contexto efectiva y otros hiperparametros de inferencia no estan documentados en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-1.5b-sft-atomic
- Paper (arXiv): https://arxiv.org/abs/2512.01970
- Pagina del proyecto: https://sitaocheng.github.io/atomic/
- Codigo (GitHub): https://github.com/sitaocheng/from_atomic_to_composite
- Dataset de entrenamiento: https://huggingface.co/datasets/sitao/From_atomic_to_composite
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Variantes relacionadas: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-1.5b-sft-composite , https://huggingface.co/sitao/atomic-to-composite-qwen2.5-1.5b-atomic-first-rl , https://huggingface.co/sitao/atomic-to-composite-qwen2.5-1.5b-composite-first-rl
