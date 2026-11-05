# kareyoung09/connectailab-rl-kay09-yisunsin-route-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por CONNECT AI LAB en colaboración con AI CITY BUILDERS dentro del proyecto LINK-01. Su propósito es actuar como política de decisión de alto nivel para un robot bípedo: a partir de las observaciones del entorno, el modelo selecciona la acción de alto nivel correspondiente a la tarea de seguimiento de ruta (follow_route). No es un modelo de propósito general, sino un componente especializado de un pipeline de robótica.

El adaptador se ha entrenado mediante SFT (supervised fine-tuning) sobre el modelo base, pese a que el repositorio incluye etiquetas de reinforcement learning (PPO, deep reinforcement learning). Según la model card, alcanza un 79.8% de acierto en el test de decisión y un 100% de éxito en 20 episodios de conducción real. El modelo base Qwen3.5-0.8B aporta un tamaño reducido (0.8B parámetros) que permite inferencia en hardware modesto, algo crítico en robótica embebida.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación con licencia Apache 2.0, orientado exclusivamente al coreano y a una tarea concreta de navegación. No hay datos publicados sobre arquitectura interna del adaptador, composición del dataset de entrenamiento ni resultados de benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | 0.8B en el modelo base; parámetros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Tarea | follow_route (seguimiento de ruta en robot bípedo LINK-01) |
| Método de entrenamiento | SFT |
| Precisión en test | 79.8% |
| Éxito en conducción real | 100% en 20 episodios |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0.8B parámetros. No se especifica el rango del adaptador, las capas objetivo ni el número de parámetros entrenables. El pipeline declarado en HuggingFace es reinforcement-learning y las etiquetas incluyen PPO y deep reinforcement learning, pero la model card indica explícitamente que el mejor método fue SFT, lo que sugiere que se probaron varios enfoques y el ajuste supervisado fue el que mejores resultados dio.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, el proceso de anotación de las observaciones del robot ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla cómo se serializan las observaciones del robot bípedo como entrada de texto para el modelo de lenguaje, que es el punto técnico más relevante de este tipo de enfoques (tokenización de estado, formato de prompt, espacio de acciones).

## Capacidades

- Decisión de acciones de alto nivel para la tarea de seguimiento de ruta (follow_route) en el robot bípedo LINK-01.
- Interpretación de observaciones del entorno serializadas como texto (formato exacto no documentado).
- Salida de acciones discretas dentro del espacio de acciones del robot (no especificado).
- Funcionamiento en coreano como idioma de trabajo.
- Inferencia ligera gracias al tamaño de 0.8B del modelo base.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Control de navegación de un robot bípedo en interiores: el adaptador selecciona la acción de alto nivel para mantener la ruta planificada a partir de las observaciones, con un 100% de éxito reportado en 20 episodios de prueba.
- Investigación en políticas híbridas lenguaje-robótica: sirve como referencia de cómo un LLM pequeño puede actuar como capa de decisión sobre un controlador de bajo nivel, reduciendo el coste computacional frente a modelos de mayor tamaño.
- Prototipado rápido de tareas de seguimiento en plataformas LINK-01: al ser un adaptador LoRA, se puede cargar y descargar sobre el modelo base sin duplicar pesos, lo que agiliza experimentos A/B de políticas.
- Evaluación de SFT frente a RL en robótica: el repositorio documenta que SFT superó a otros métodos probados, lo que lo convierte en un punto de comparación útil para equipos que diseñan pipelines de entrenamiento.
- Despliegue en hardware embebido: el tamaño de 0.8B permite ejecutar el modelo en GPUs de consumo o incluso en módulos tipo Jetson, aunque no se publican cifras de latencia.
- Docencia y demostraciones de integración PEFT + transformers: el snippet de uso de la model card es directamente reproducible y sirve como ejemplo mínimo de carga de un adaptador LoRA para robótica.

## Benchmarks y rendimiento

| Métrica | Resultado | Contexto |
|---|---|---|
| Precisión en test (Accuracy) | 79.8% | Test de decisión de la tarea follow_route |
| Éxito en conducción real (Drive Success) | 100.0% | 20 episodios de conducción real |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las dos métricas anteriores son específicas del proyecto y no permiten comparación directa con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0.8B en fp16 requiere aproximadamente 1.6 GB de pesos; con overhead de activaciones y KV cache, un entorno de 4-6 GB de VRAM es suficiente en la práctica.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, A10, L4. Para robótica embebida, Jetson Orin Nano o AGX Orin son opciones plausibles por VRAM, aunque no se documenta compatibilidad.
- Cabe en GPU de consumo: sí, cualquier GPU con 6 GB o más de VRAM puede cargar el modelo base en fp16.
- Opciones de despliegue: transformers + peft (documentado en la model card). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; al ser un adaptador LoRA sobre un modelo de 0.8B, es viable fusionarlo con el base y exportarlo a GGUF, pero no está verificado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este modelo) | 0.8B (base) + LoRA | no disponible | follow_route en robot bípedo | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.5-0.8B | 0.8B | no disponible | LLM generalista | no disponible en esta ficha | HuggingFace |
| Políticas RL específicas para robótica (p. ej. modelos de locomotion) | variable | no aplica | control de bajo nivel | variable | variable |

No se dispone de información sobre modelos comparables de la misma categoría (LLM pequeño como política de decisión en robótica) en la documentación proporcionada. La comparación con el modelo base es la más directa, pero no se han publicado métricas del base en esta tarea.

## Limitaciones y advertencias

- Especialización extrema: el adaptador está entrenado únicamente para la tarea follow_route en el robot LINK-01; no es un modelo de propósito general y su uso fuera de ese contexto no está validado.
- Idioma: solo se declara coreano; el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea deficiente.
- Dataset no documentado: se desconoce la composición, el tamaño y los posibles sesgos del conjunto de entrenamiento, lo que impide auditar el comportamiento del modelo.
- Métricas limitadas: el 100% de éxito se basa en solo 20 episodios, una muestra pequeña que no permite extraer conclusiones robustas sobre generalización.
- Sin benchmarks estándar: no hay resultados en MMLU, HumanEval ni similares, por lo que no se puede comparar con otros LLM.
- Riesgo de alucinación: al ser un LLM, puede generar acciones inválidas o incoherentes fuera de la distribución de entrenamiento; en robótica esto tiene consecuencias físicas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación independiente.
- Fecha de creación futura (2026-11-05): metadato anómalo que conviene verificar antes de confiar en el artefacto.

## Enlaces

- HuggingFace: https://huggingface.co/kareyoung09/connectailab-rl-kay09-yisunsin-route-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
