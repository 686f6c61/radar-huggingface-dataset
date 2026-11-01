# sitao/atomic-to-composite-qwen2.5-3b-sft-composite

## Resumen

Este modelo es un ajuste fino (SFT) de Qwen2.5-3B, desarrollado por el investigador Sitao Cheng y colaboradores como artefacto experimental del paper *From Atomic to Composite: Reinforcement Learning Enables Generalization in Complementary Reasoning* (arXiv:2512.01970). El modelo, denominado SFT_Comp, se ha entrenado mediante SFT de parámetros completos directamente sobre pares de preguntas y respuestas "compuestas" (COMP) del dataset sintético `sitao/From_atomic_to_composite`, y constituye el punto de partida de la receta "composite-first" del estudio.

Su propósito es investigar la generalización composicional en razonamiento complementario: la capacidad de un modelo para combinar conocimiento memorizado con contexto proporcionado en preguntas multi-hop. El paper lo compara con variantes entrenadas solo con habilidades atómicas y con recetas que añaden RL (GRPO con verl) posterior al SFT. Los resultados muestran que el SFT directo sobre la tarea compuesta alcanza un 82,81 % en el régimen IID, pero cae a 29,85 % en zero-shot, lo que ilustra los límites de la generalización sin refuerzo posterior.

Es relevante para investigadores que estudian composición de habilidades, memorización frente a uso de contexto y efectos del RL sobre la generalización, no como asistente de propósito general. Arquitectura: transformer denso basado en Qwen2.5-3B, con 3.085.938.688 parámetros y pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5), decodificador causal |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE; todos los parámetros activos) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-3B) |
| Tipos de cuantizacion | no disponible (solo pesos originales en el repo) |
| Idiomas soportados | Inglés (entrenado exclusivamente en inglés) |
| Licencia | qwen-research (licencia "other", vinculada a la licencia de Qwen2.5-3B) |
| Formato de pesos | safetensors (6,2 GB en el repositorio) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-3B, un transformer decodificador denso de la familia Qwen2.5, y aplica un SFT de parámetros completos (full-parameter fine-tuning) sobre el conjunto de tareas compuestas (COMP) del dataset `sitao/From_atomic_to_composite`. Este dataset consiste en biografías sintéticas con preguntas multi-hop que requieren combinar información memorizada de los hechos atómicos con información presente en los párrafos de contexto. El entrenamiento SFT se realizó con LLaMA-Factory.

En el pipeline del paper, este modelo es el punto de partida de la receta "composite-first" (SFT_Comp → RL_Comp), donde posteriormente se aplica aprendizaje por refuerzo con GRPO implementado en verl. El propio modelo aquí descrito es la versión solo-SFT, reportada en la Figura 8 del paper (escalado de modelos). No se dispone de detalles públicos sobre el número de tokens de entrenamiento ni hiperparámetros específicos más allá de lo indicado.

## Capacidades

- Respuesta a preguntas multi-hop sobre biografías sintéticas, combinando conocimiento paramétrico y contexto proporcionado en el prompt (pares "complementary" o COMP).
- Generación de cadenas de razonamiento explícitas antes de la respuesta final, con formato fijo terminado en `So, the answer is: <answer>`.
- Razonamiento composicional: el modelo está especializado en integrar hechos atómicos en inferencias de varios saltos.
- Uso con formato de prompt específico: la pregunta seguida de los párrafos de contexto tras el marcador `PARAGRAPH:`.
- Compatible con la librería `transformers` de Hugging Face y con plantillas de chat (`apply_chat_template`).
- No está diseñado ni entrenado para: generación de código, matemáticas, visión, audio, tool calling, agentes ni uso conversacional general.

## Casos de uso

- Investigación en generalización composicional: sirve como baseline "composite-first" (SFT directo) para comparar frente a recetas atomic-first o con RL en experimentos de composición de habilidades.
- Estudio de memorización frente a uso de contexto: permite analizar cómo un modelo combina conocimiento paramétrico con contexto en preguntas multi-hop, con métricas separadas por régimen (IID, composición, zero-shot).
- Reproducción del paper: punto de partida documentado para replicar los experimentos de la Figura 8 (escalado de modelos) y las fases de RL con GRPO en verl.
- Benchmarking de métodos de fine-tuning: base conveniente para probar técnicas alternativas de SFT, DPO o RLHF sobre una tarea controlada y sintética con test de 4.468 ítems.
- Docencia y formación: ejemplo práctico y compacto (3B parámetros) para ilustrar pipelines completos de SFT con LLaMA-Factory y RL con verl en cursos de IA.
- Prototipado de evaluaciones sintéticas: el dataset y el modelo permiten construir evaluaciones controladas de razonamiento multi-hop donde la distribución de datos se conoce exactamente.

## Benchmarks y rendimiento

Resultados publicados sobre el test set Complementary (COMP) de 4.468 ítems, por nivel de generalización (precisión en %, según el log de validación del entrenamiento, citado en el paper):

| Régimen | Precisión (%) |
|---|---:|
| IID | 82,81 |
| Composition | 70,88 |
| Zero-shot | 29,85 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este modelo en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 6,2 GB solo para los pesos, más la sobrecarga de activaciones y KV cache; con margen, unas 8 GB de VRAM son suficientes para contextos moderados.
- Cabe cómodamente en GPUs de consumo: una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 ejecutan el modelo sin problemas en precisión completa.
- GPUs recomendadas: cualquier GPU moderna de 8 GB o más; para experimentos de reentrenamiento o RL (GRPO), se recomiendan GPUs de gama datacenter (A100/H100) o múltiples GPUs de consumo, aunque no se publican configuraciones concretas.
- Despliegue: uso directo con `transformers` (código de ejemplo en la model card); al estar en formato safetensors estándar de Qwen2, debería ser compatible con vLLM, llama.cpp (previa conversión a GGUF, no disponible en el repo) y Ollama (previa conversión), aunque el modelo está pensado para investigación, no para servición en producción.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Comparativa con los otros tres modelos de la misma familia y tamaño (3B) publicados junto a este:

| Modelo | Entrenamiento | Precisión COMP (IID / Composition / Zero-shot) | Licencia |
|---|---|---|---|
| sitao/atomic-to-composite-qwen2.5-3b-sft-composite (este) | SFT directo sobre tarea compuesta | 82,81 / 70,88 / 29,85 | qwen-research |
| sitao/atomic-to-composite-qwen2.5-3b-sft-atomic | SFT sobre habilidades atómicas (Mem+Ctx) | no disponible | qwen-research |
| sitao/atomic-to-composite-qwen2.5-3b-atomic-first-rl | SFT atómico + RL (GRPO) | no disponible | qwen-research |
| sitao/atomic-to-composite-qwen2.5-3b-composite-first-rl | SFT compuesto + RL (GRPO) | no disponible | qwen-research |

Frente al Qwen2.5-3B base, este modelo está especializado en la tarea COMP y no está pensado como alternativa de propósito general; su base comparte arquitectura, tamaño de parámetros y licencia con Qwen/Qwen2.5-3B.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo está entrenado exclusivamente sobre biografías sintéticas; la model card advierte explícitamente que es un artefacto de investigación y no un asistente de propósito general.
- Generalización limitada: la precisión cae de 82,81 % (IID) a 29,85 % (zero-shot), lo que indica un rendimiento muy pobre fuera de la distribución de entrenamiento.
- Formato de prompt obligatorio: requiere el formato de entrenamiento (pregunta + `PARAGRAPH:` + contexto); otros formatos probablemente degraden el rendimiento.
- Idioma: entrenado solo en inglés; no hay soporte garantizado para castellano u otros idiomas.
- Riesgo de alucinación: al tratarse de biografías sintéticas, fuera de su dominio puede generar contenido inventado con el formato de respuesta de confianza habitual.
- Licencia: usa la licencia "qwen-research" de Qwen, que tiene restricciones; revisar la licencia de Qwen2.5-3B antes de cualquier uso comercial.
- Sin cuantizaciones ni variantes GGUF publicadas; sin datos de latencia ni de benchmarks estándar.
- Sesgos: no documentados; al ser datos sintéticos, los sesgos del modelo base pueden persistir y los del dataset sintético no han sido caracterizados públicamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-3b-sft-composite
- Paper (arXiv): https://arxiv.org/abs/2512.01970
- Página del proyecto: https://sitaocheng.github.io/atomic/
- Código (GitHub): https://github.com/sitaocheng/from_atomic_to_composite
- Dataset: https://huggingface.co/datasets/sitao/From_atomic_to_composite
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B/blob/main/LICENSE
- Modelos relacionados:
  - https://huggingface.co/sitao/atomic-to-composite-qwen2.5-3b-sft-atomic
  - https://huggingface.co/sitao/atomic-to-composite-qwen2.5-3b-atomic-first-rl
  - https://huggingface.co/sitao/atomic-to-composite-qwen2.5-3b-composite-first-rl
