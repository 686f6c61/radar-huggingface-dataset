# sitao/atomic-to-composite-qwen2.5-3b-atomic-first-rl

## Resumen

Atomic-to-composite Qwen2.5-3B (atomic-first RL) es un modelo de investigación desarrollado por Sitao Cheng y colaboradores (con participación de investigadores de la Universidad de Illinois y otras instituciones, según el paper asociado) que parte de la arquitectura Qwen2.5-3B de Alibaba y aborda un problema concreto: la composición de habilidades en razonamiento multi-hop sobre tareas complementarias de preguntas y respuestas (complementary reasoning). El modelo se entrena en dos fases: primero un SFT sobre habilidades atómicas (memoria y contexto, SFT<sub>Mem+Ctx</sub>) y después un refinamiento por aprendizaje por refuerzo con GRPO sobre pares de preguntas compuestas (RL<sub>Comp</sub>), una receta que el paper denomina "atomic-first" y que reporta la mejor precisión zero-shot en todos los tamaños de modelo evaluados.

Se trata de un artefacto de investigación, no de un asistente de propósito general: está entrenado sobre biografías sintéticas y su objetivo es estudiar cómo el aprendizaje por refuerzo permite la generalización composicional. Aun así, es relevante para desarrolladores e investigadores que trabajen en multi-hop QA, compositional generalization o en la comparación de recetas de entrenamiento SFT frente a RL, ya que incluye el código, el dataset y cuatro variantes del mismo tamaño para reproducir los experimentos. La arquitectura es un transformer denso de 3.397 millones de parámetros (dato real de safetensors) y no se especifica la longitud de contexto en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2.5) |
| Parametros totales | 3.397.103.616 |
| Parametros activos | no disponible (no es MoE; todos los parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en precisión original, safetensors) |
| Idiomas soportados | Ingles (entrenado exclusivamente en ingles) |
| Licencia | Qwen Research License (otra licencia, no comercial de investigacion) |
| Formato de pesos | safetensors (tamano del repo: 6,8 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen2.5-3B, un transformer decoder-only denso. El pipeline de entrenamiento consta de dos etapas. En la primera, se aplica un SFT (mediante LLaMA-Factory) sobre habilidades atómicas del dataset sintético `sitao/From_atomic_to_composite`, cubriendo tareas de memoria (Mem) y de uso de contexto (Ctx): el modelo aprende a recordar hechos de biografías y a extraer información de párrafos proporcionados. En la segunda etapa, se aplica aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization, implementado en el framework verl) sobre pares de preguntas compuestas (COMP), que requieren combinar ambas habilidades. La hipótesis del paper es que entrenar primero las habilidades atómicas y después reforzar la tarea compuesta permite una mejor generalización composicional que entrenar directamente sobre la tarea compuesta.

El dataset de entrenamiento consiste en biografías sintéticas con preguntas multi-hop de distintos niveles de generalización (IID, composición y zero-shot). El modelo genera cadenas de razonamiento y finaliza con el formato fijo `So, the answer is: <answer>`, lo que facilita la extracción automática de la respuesta en evaluaciones. No hay indicios de RLHF con preferencias humanas; el RL es puramente verificado con recompensas sobre la tarea de QA sintética.

## Capacidades

- Respuesta a preguntas multi-hop sobre biografías sintéticas, combinando memoria de hechos y razonamiento sobre párrafos de contexto.
- Generación de cadenas de razonamiento explícitas antes de la respuesta final, con formato estructurado (`So, the answer is: <answer>`).
- Generalización composicional: el modelo está optimizado para transferir habilidades atómicas aprendidas (memoria, uso de contexto) a preguntas compuestas no vistas.
- Razonamiento en tres niveles de generalización: IID (82,39 %), composición (63,96 %) y zero-shot (46,73 %) sobre el test COMP de 4.468 elementos.
- Uso del formato de chat de Qwen2.5 mediante `apply_chat_template`.
- No dispone de tool calling, function calling, capacidades de visión, audio ni modo de pensamiento extendido; es un modelo especializado en la tarea de QA del paper.

## Casos de uso

- Investigación en compositional generalization: sirve como réplica y punto de partida para estudiar cómo el orden de entrenamiento (SFT atómico frente a SFT compuesto) afecta a la generalización, con cuatro variantes públicas comparables.
- Benchmarking de recetas SFT + RL: permite reproducir el pipeline LLaMA-Factory + verl (GRPO) y comparar GRPO con otras técnicas de RL sobre tareas verificables.
- Estudio de multi-hop QA sintético: útil para evaluar cómo los modelos de 3B encadenan hechos de memoria con evidencia contextual, un escenario habitual en RAG de varios saltos.
- Desarrollo de pipelines de QA con razonamiento verificable: el formato de salida fijo facilita parsear respuestas automáticamente en experimentos a gran escala.
- Investigación sobre escalado de modelos: el paper lo evalúa en múltiples tamaños (Figura 8), por lo que es útil para análisis de cómo escala la composición de habilidades con el número de parámetros.
- Docencia y formación: caso práctico completo (datos, código, paper y pesos) para enseñar entrenamiento de LLM con RL en cursos de posgrado o talleres técnicos.

## Benchmarks y rendimiento

Resultados publicados por los autores sobre el test Complementary (COMP) de 4.468 elementos, por nivel de generalización (precisión en %, extraídos del log de validación del entrenamiento, según el paper):

| Benchmark | IID | Composition | Zero-shot |
|---|---:|---:|---:|
| COMP test set (este modelo, atomic-first RL) | 82,39 | 63,96 | 46,73 |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La comparación con las otras recetas del paper (SFT compuesto, composite-first RL) no incluye cifras numéricas en la model card, aunque el paper indica que esta receta atomic-first ofrece la mejor precisión zero-shot en todos los tamaños de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 7 GB solo para los pesos (3,4 mil millones de parámetros × 2 bytes), más overhead de activaciones y KV cache; con 10-12 GB de VRAM es suficiente para inferencia cómoda con contexto moderado.
- Con cuantización INT8/INT4 (por ejemplo, mediante bitsandbytes o GGUF, aunque no hay versiones cuantizadas oficiales): entre 2 y 4 GB de VRAM.
- GPUs recomendadas: cualquier GPU de consumo con 12 GB o más (RTX 3060, RTX 4070, RTX 4090) es suficiente para inferencia; para entrenamiento RL con GRPO se recomiendan GPUs de datacenter (A100/H100), aunque el código del paper no detalla la configuración exacta.
- Cabe sin problemas en GPUs de consumo para inferencia; el ejemplo oficial usa `device_map="auto"` con transformers.
- Opciones de despliegue: transformers (ejemplo oficial), text-generation-inference (compatible según los tags), vLLM y Ollama deberían funcionar al tratarse de una arquitectura Qwen2.5 estándar (compatible con llama.cpp en formato GGUF tras conversión, aunque no hay GGUF oficial).
- Latencia y throughput: no disponible; al ser un modelo denso de 3B, se pueden esperar latencias de decodificación del orden de decenas de tokens por segundo en una GPU de consumo moderna.

## Comparativa con modelos similares

Comparación con las variantes hermanas del mismo estudio (mismo tamaño, mismos datos, distinta receta de entrenamiento):

| Modelo | Receta | Repositorio | Licencia |
|---|---|---|---|
| atomic-to-composite-qwen2.5-3b-atomic-first-rl (este) | SFT<sub>Mem+Ctx</sub> → RL<sub>Comp</sub> | sitao/atomic-to-composite-qwen2.5-3b-atomic-first-rl | Qwen Research |
| atomic-to-composite-qwen2.5-3b-sft-atomic | Solo SFT atómico (Mem+Ctx) | sitao/atomic-to-composite-qwen2.5-3b-sft-atomic | Qwen Research |
| atomic-to-composite-qwen2.5-3b-sft-composite | Solo SFT compuesto (Comp) | sitao/atomic-to-composite-qwen2.5-3b-sft-composite | Qwen Research |
| atomic-to-composite-qwen2.5-3b-composite-first-rl | SFT<sub>Comp</sub> → RL<sub>Comp</sub> | sitao/atomic-to-composite-qwen2.5-3b-composite-first-rl | Qwen Research |

Frente al Qwen2.5-3B base (3,09 mil millones de parámetros según la ficha oficial de Alibaba; este fine-tune reporta 3,397 mil millones en safetensors), este modelo sacrifica la versatilidad generalista a cambio de un rendimiento superior en la tarea específica de QA complementario. No hay alternativas de terceros comparables publicadas para esta tarea sintética concreta: no disponible.

## Limitaciones y advertencias

- Dominio muy restringido: está entrenado exclusivamente sobre biografías sintéticas del dataset `From_atomic_to_composite`; no es un asistente de propósito general y su comportamiento fuera de la distribución de entrenamiento no está garantizado.
- Riesgo de alucinación elevado fuera de la tarea: al ser un artefacto de investigación afinado sobre datos sintéticos, puede generar respuestas plausibles pero incorrectas en dominios reales.
- Solo inglés: no está entrenado para otros idiomas, por lo que su uso en castellano no está soportado ni evaluado.
- Licencia no comercial: la Qwen Research License (heredada de Qwen2.5-3B) restringe el uso comercial; revisar la licencia antes de cualquier despliegue en producto.
- La brecha entre composición (63,96 %) y zero-shot (46,73 %) muestra que la generalización composicional sigue siendo parcial incluso con la mejor receta del paper.
- Los resultados de benchmarks provienen del log de validación del propio entrenamiento, no de una evaluación independiente de terceros.
- No hay soporte documentado para tool calling, agentes, visión ni contextos largos; la longitud de contexto no está especificada en la model card.
- Descargas y adopción muy limitadas (277 descargas, 0 likes en el momento de la ficha), lo que implica poca validación por la comunidad y posible falta de correcciones o cuantizaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-3b-atomic-first-rl
- Paper (arXiv): https://arxiv.org/abs/2512.01970
- Pagina del proyecto: https://sitaocheng.github.io/atomic/
- Codigo (GitHub): https://github.com/sitaocheng/from_atomic_to_composite
- Dataset de entrenamiento: https://huggingface.co/datasets/sitao/From_atomic_to_composite
- Modelo base del fine-tune: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-3b-sft-atomic
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-3B
- Licencia Qwen Research: https://huggingface.co/Qwen/Qwen2.5-3B/blob/main/LICENSE
