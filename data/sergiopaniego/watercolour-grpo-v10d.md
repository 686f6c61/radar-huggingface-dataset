# sergiopaniego/watercolour-grpo-v10d

## Resumen

El modelo `sergiopaniego/watercolour-grpo-v10d` es un ajuste fino del modelo base Qwen/Qwen3.5-35B-A3B, desarrollado por Sergio Paniego Blanco, Machine Learning Engineer en Hugging Face. Se trata de un experimento de entrenamiento con GRPO (Group Relative Policy Optimization), la técnica introducida en DeepSeekMath para optimizar el razonamiento matemático en modelos de lenguaje. El repositorio incluye pesos en formato safetensors y ha sido generado con el framework TRL de Hugging Face.

El modelo resuelve el problema de adaptar un modelo base de gran tamaño mediante aprendizaje por refuerzo, concretamente con GRPO, que permite optimizar políticas sin necesidad de un crítico separado. Su relevancia radica en ser un caso práctico de aplicación de GRPO sobre un modelo MoE moderno, aunque no se publican métricas de rendimiento ni detalles sobre el dataset de entrenamiento. El tamaño del repositorio es de 0,1 GB, lo que sugiere que podría tratarse de un adaptador o de una versión cuantizada, aunque no se especifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) derivada de Qwen3.5-35B-A3B |
| Parametros totales | 35 mil millones (base), no disponible para el ajuste |
| Parametros activos | 3 mil millones (base, según nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (en el README aparece "licence: license", sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-35B-A3B, una arquitectura Mixture of Experts con 35 mil millones de parámetros totales y 3 mil millones de parámetros activos por token. El ajuste se realizó mediante GRPO, un algoritmo de optimización de políticas que utiliza un grupo de respuestas muestreadas para estimar ventajas relativas, sin necesidad de un modelo crítico. Este método fue propuesto en el artículo DeepSeekMath (arXiv:2402.03300) y está implementado en la librería TRL (versión 1.12.0). No se proporcionan detalles sobre el dataset de entrenamiento, el número de pasos, ni si se aplicaron técnicas adicionales como RLHF o DPO. El entrenamiento se realizó con Transformers 5.16.1, PyTorch 2.13.0 y Datasets 5.0.1.

## Capacidades

- Generación de texto en formato conversacional, como se muestra en el ejemplo de quick start del README.
- Razonamiento matemático y de lógica, dado que el entrenamiento con GRPO está orientado a mejorar este tipo de habilidades.
- Capacidad de seguir instrucciones en formato chat (rol usuario/asistente).
- No se especifican capacidades de tool calling, agentes, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Experimentación académica: el modelo sirve como ejemplo práctico de cómo aplicar GRPO sobre un MoE de gran tamaño, útil para investigadores que estudian métodos de optimización por refuerzo en LLMs.
- Evaluación de técnicas de alineación: permite comparar el efecto de GRPO frente a otros métodos (DPO, PPO) sobre la misma base, si se dispone de los datos de entrenamiento.
- Prototipado de asistentes conversacionales: con su ventana de contexto (desconocida) y su capacidad de diálogo, puede usarse para construir demos de chatbots en entornos de investigación.
- Generación de respuestas a preguntas abiertas: el ejemplo del README muestra una pregunta filosófica, indicando utilidad para tareas de razonamiento especulativo.
- Benchmarking de eficiencia: al ser un MoE con solo 3B parámetros activos, es adecuado para medir throughput y latencia en GPUs de consumo.
- Docencia en IA: el repositorio y su pipeline de entrenamiento pueden usarse como material didáctico para enseñar GRPO con TRL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado que el modelo base tiene 35B parámetros totales y 3B activos, una inferencia en precisión completa requeriría al menos 70 GB de VRAM, pero el tamaño del repositorio (0,1 GB) sugiere que el artefacto publicado podría ser un adaptador LoRA o una versión cuantizada, lo que reduciría drásticamente los requisitos.
- GPU recomendadas: para el modelo base completo se necesitarían A100 (80 GB) o H100; si se trata de un adaptador, podría ejecutarse en GPUs de consumo como RTX 4090 (24 GB) o incluso inferiores.
- Compatibilidad con GPU de consumo: posible si el peso es un adaptador o cuantización de baja precisión, pero no confirmado.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con vLLM, TGI o llama.cpp si se convierte a GGUF. También se puede cargar con la pipeline de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoría. El modelo base Qwen3.5-35B-A3B es comparable a otros MoE como Mixtral 8x7B o DeepSeek-V2-Lite, pero los datos específicos de este ajuste (rendimiento, licencia, contexto) son desconocidos. Se recomienda consultar la ficha del modelo base para obtener referencias.

## Limitaciones y advertencias

- No se publica información sobre sesgos o alucinaciones; al ser un ajuste sobre un modelo base no documentado, estos riesgos no están evaluados.
- La licencia no está claramente especificada ("licence: license" en el README), lo que impide conocer las restricciones de uso comercial.
- El dataset de entrenamiento no se describe, por lo que no se puede evaluar la calidad de los datos ni posibles sesgos introducidos.
- No hay garantía de que el modelo funcione correctamente fuera del ejemplo de generación de texto simple mostrado en el README.
- El tamaño reducido del repositorio sugiere que podría tratarse de un artefacto parcial (adaptador o pesos parciales), lo que requeriría cargar el modelo base por separado.
- No se han realizado evaluaciones de seguridad ni de robustez, por lo que no es recomendable su uso en producción sin validación previa.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/sergiopaniego/watercolour-grpo-v10d)
- [Espacio de visualización Trackio](https://sergiopaniego-watercolour-grpo-v10d.hf.space?project=huggingface&runs=sergiopaniego-1787914682&sidebar=collapsed)
- [Modelo base Qwen/Qwen3.5-35B-A3B](https://huggingface.co/Qwen/Qwen3.5-35B-A3B)
- [Paper DeepSeekMath (GRPO)](https://huggingface.co/papers/2402.03300)
- [Perfil de GitHub del autor](https://github.com/sergiopaniego)
- [Página personal del autor](https://sergiopaniego.github.io/)
