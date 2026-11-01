# sitao/atomic-to-composite-qwen2.5-1.5b-atomic-first-rl

## Resumen

Este modelo es un ajuste de investigación de [Qwen/Qwen2.5-1.5B](https://huggingface.co/Qwen/Qwen2.5-1.5B) desarrollado por el equipo de Sitao Cheng (con colaboradores de varias universidades) como parte del estudio *From Atomic to Composite: Reinforcement Learning Enables Generalization in Complementary Reasoning* (arXiv:2512.01970). El problema que aborda es la composición de habilidades en modelos pequeños: un modelo puede dominar tareas atómicas (memoria y uso de contexto) pero fallar al combinarlas en tareas compuestas de preguntas y respuestas multi-hop.

El modelo implementa la receta "atomic-first" recomendada por el artículo: primero se entrena con SFT sobre habilidades atómicas (SFT<sub>Mem+Ctx</sub>) y después se aplica aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization, mediante la librería verl) sobre pares de QA compuestos. Según los autores, esta receta ofrece la mejor precisión zero-shot en todos los tamaños de modelo evaluados.

Es relevante porque aporta evidencia experimental sobre cómo el RL habilita la generalización composicional en modelos de 1.500 millones de parámetros, un tema central en investigación de razonamiento. No obstante, se trata de un artefacto de investigación entrenado sobre biografías sintéticas, no de un asistente de propósito general. Usa la arquitectura transformer de Qwen2.5 con 1,78 mil millones de parámetros en formato safetensors bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (arquitectura Qwen2.5) |
| Parametros totales | 1.777.088.000 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-1.5B; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (solo pesos en bf16/fp16; repo de 3,6 GB) |
| Idiomas soportados | Ingles (entrenado exclusivamente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers y text-generation-inference) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer densa de Qwen2.5-1.5B y se entrena en dos fases. La primera fase consiste en un SFT (supervised fine-tuning) sobre habilidades atómicas de memoria y contexto (SFT<sub>Mem+Ctx</sub>), realizado con LLaMA-Factory y usando el dataset sintético [sitao/From_atomic_to_composite](https://huggingface.co/datasets/sitao/From_atomic_to_composite). La segunda fase aplica aprendizaje por refuerzo con GRPO sobre pares de QA compuestos (RL<sub>Comp</sub>), implementado con la librería verl. Esta combinación SFT<sub>Mem+Ctx</sub> → RL<sub>Comp</sub> es la receta "atomic-first" que el artículo identifica como la más efectiva para generalización zero-shot.

El dataset de entrenamiento se compone de biografías sintéticas con preguntas de respuesta multi-hop que requieren combinar información memorizada con información proporcionada en el contexto. El formato de salida consiste en una cadena de razonamiento que termina con la frase `So, the answer is: <answer>`, lo que facilita la extraccion programática de la respuesta. No se menciona el uso de RLHF con preferencias humanas; el RL se basa en recompensas por exactitud de la respuesta en tareas compuestas.

## Capacidades

- Respuesta a preguntas multi-hop sobre biografías sintéticas, combinando conocimiento memorizado con párrafos de contexto aportados en el prompt (razonamiento complementario memoria-contexto).
- Generación de cadenas de razonamiento explícitas antes de la respuesta final, con formato fijo `So, the answer is: <answer>`.
- Generalización composicional: razonable precisión en niveles de composición (66,71 %) y zero-shot (50,54 %) sobre el test COMP, además del nivel IID (82,01 %).
- Soporte del chat template estándar de Qwen2.5 mediante `apply_chat_template`.
- No hay evidencia de capacidades de tool calling, function calling, agentes, visión, audio ni modo de thinking estructurado: el modelo está especializado en su tarea de investigación.
- Capacidades multilingues limitadas: entrenado solo en ingles.

## Casos de uso

- Investigacion en generalizacion composicional: es el artefacto central del artículo; permite reproducir los experimentos de las tablas 7 y figura 8 y comparar recetas de entrenamiento (atomic-first frente a composite-first) en igualdad de condiciones.
- Estudio de sinergia memoria-contexto: útil para analizar cuándo un modelo pequeño combina mejor su conocimiento paramétrico con información del contexto frente a usar solo una de las dos fuentes.
- Benchmark de RL para modelos pequeños: sirve como baseline para probar algoritmos de RL alternativos a GRPO (PPO, RLOO, etc.) en tareas de QA con recompensa verificable.
- Prototipado de pipelines de QA multi-hop: el formato de salida estructurado (`So, the answer is:`) permite integrarlo en pipelines que extraen la respuesta final con reglas simples, sin necesidad de un LLM postprocesador.
- Docencia y formacion: por su tamaño (1,78B) es asequible para laboratorios docentes que quieran ejecutar entrenamiento SFT + RL completo en hardware modesto.
- Evaluacion de datos sinteticos de entrenamiento: el dataset From_atomic_to_composite permite estudiar cómo el diseño de datos sintéticos afecta a la composición de habilidades.

## Benchmarks y rendimiento

Resultados publicados sobre el test set Complementary (COMP) de 4.468 items, por nivel de generalizacion (precisión en %, según el log de validación del entrenamiento reportado en el artículo):

| Nivel | Precision (%) |
|---|---:|
| IID | 82,01 |
| Composition | 66,71 |
| Zero-shot | 50,54 |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El modelo debe evaluarse dentro del marco experimental del artículo, no como asistente general.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,6-4 GB solo para los pesos; con overhead de activaciones y KV cache, 6-8 GB son suficientes para contextos moderados.
- Cabe comodamente en GPUs de consumo: una RTX 3060 de 12 GB, RTX 4060 Ti o superior ejecuta el modelo sin cuantizar; incluso portátiles con GPU de 8 GB pueden hacerlo.
- Para reproducir el entrenamiento (SFT + GRPO), se requieren recursos mayores: no se especifican en la model card, pero GRPO con generación por muestreo suele necesitar varias GPUs tipo A100; consultar el repositorio de codigo para las configuraciones exactas.
- Opciones de despliegue: transformers (codigo oficial del README), text-generation-inference, vLLM y llama.cpp (tras convertir los pesos a GGUF) son viables dada la arquitectura Qwen2.5 estandar; Ollama tambien podria servir con un GGUF convertido. No se publica ningun GGUF oficial.
- Latencia: no disponible; al ser un modelo denso de 1,78B con respuestas de hasta 256 tokens nuevos, se esperan latencias bajas en GPU de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

Comparativa con los otros tres modelos de la misma familia y tamaño, y con el modelo base:

| Modelo | Receta | IID (%) | Composition (%) | Zero-shot (%) | Licencia |
|---|---|---:|---:|---:|---|
| atomic-to-composite-qwen2.5-1.5b-atomic-first-rl (este) | SFT<sub>Mem+Ctx</sub> → RL<sub>Comp</sub> | 82,01 | 66,71 | 50,54 | Apache 2.0 |
| atomic-to-composite-qwen2.5-1.5b-composite-first-rl | SFT<sub>Comp</sub> → RL<sub>Comp</sub> | no disponible | no disponible | no disponible | Apache 2.0 |
| atomic-to-composite-qwen2.5-1.5b-sft-atomic | SFT<sub>Mem+Ctx</sub> | no disponible | no disponible | no disponible | Apache 2.0 |
| atomic-to-composite-qwen2.5-1.5b-sft-composite | SFT<sub>Comp</sub> | no disponible | no disponible | no disponible | Apache 2.0 |
| Qwen/Qwen2.5-1.5B (base) | Preentrenamiento general | no disponible | no disponible | no disponible | Apache 2.0 |

Según el artículo, la receta atomic-first (este modelo) es la que logra la mejor precisión zero-shot en todos los tamaños evaluados. Los resultados detallados de las recetas alternativas están en la tabla 7 y figura 8 del paper. Frente a Qwen2.5-1.5B base, este modelo está fuertemente especializado en QA complementario sobre biografías sintéticas y pierde la versatilidad general del modelo original.

## Limitaciones y advertencias

- Dominio muy estrecho: entrenado exclusivamente sobre biografías sintéticas; los autores lo califican explícitamente como artefacto de investigación, no como asistente de propósito general. No debe usarse en producción para tareas generales.
- Riesgo de alucinacion elevado fuera de distribución: al ser un modelo de 1,5B especializado en datos sintéticos, sus respuestas sobre conocimiento del mundo real no son fiables.
- Idioma: solo ingles; no esperar rendimiento en castellano ni otros idiomas.
- La precision zero-shot (50,54 %) muestra que la generalizacion a combinaciones no vistas sigue siendo parcial, incluso con la mejor receta del artículo.
- Sin cuantizaciones oficiales publicadas; el uso en hardware muy limitado requiere conversion propia a GGUF o AWQ/GPTQ.
- Longitud de contexto no documentada en la model card; verificar la del tokenizador de Qwen2.5-1.5B antes de procesar contextos largos.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los terminos de la licencia de Qwen2.5 base y cualquier restriccion del dataset sintético.
- Los resultados de benchmark provienen del log de validacion del propio entrenamiento, no de una evaluacion externa independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-1.5b-atomic-first-rl
- Articulo (arXiv): https://arxiv.org/abs/2512.01970
- Pagina del proyecto: https://sitaocheng.github.io/atomic/
- Codigo (GitHub): https://github.com/sitaocheng/from_atomic_to_composite
- Dataset: https://huggingface.co/datasets/sitao/From_atomic_to_composite
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Modelo SFT atomic (fase previa): https://huggingface.co/sitao/atomic-to-composite-qwen2.5-1.5b-sft-atomic
