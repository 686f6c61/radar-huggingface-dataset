# sharryXR/asil-qwen35-2b-rl

## Resumen

ASIL Qwen3.5-2B RL es un checkpoint de liberación del paper "ASIL: Replacing Screenshot-and-Click with Structured State and Semantic Actions" (arXiv:2608.26991), desarrollado por Rui Xie (sharryXR), estudiante de doctorado en la Universidad Jiao Tong de Shanghái. El modelo parte de Qwen/Qwen3.5-2B, un transformer de 2.390.384.448 parámetros, y ha sido sometido a un entrenamiento de refuerzo (RL) sobre un checkpoint previo de ajuste supervisado (SFT). Su propósito es servir como base experimental para agentes de interfaz gráfica (GUI) que sustituyen el paradigma tradicional de captura de pantalla y clic por un estado estructurado y acciones semánticas.

La relevancia actual del modelo radica en que aborda un problema abierto en el campo de los agentes de software: la eficiencia y robustez de la interacción con interfaces gráficas. Al estar liberado bajo licencia Apache 2.0 y con pesos en formato safetensors, puede ser utilizado tanto para reproducir los experimentos del paper como para investigaciones posteriores en automatización de GUI. No obstante, se trata de un checkpoint de investigación con un conjunto de entrenamiento reducido (320 prompts de tareas), por lo que su uso en producción requiere validación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-2B) |
| Parametros totales | 2.390.384.448 |
| Parametros activos | no disponible (probablemente modelo denso, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 (declarada en la model card; la página de HuggingFace muestra "License: other" en la búsqueda web) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Qwen3.5-2B, un transformer de 2.390 millones de parámetros. Según la model card, el checkpoint liberado corresponde al paso global 8 del entrenamiento de RL (global_step_8_actor_hf), que partió de un checkpoint SFT previo (global_step_27 de un entrenamiento supervisado). El entrenamiento de RL utilizó un conjunto de datos denominado `rl_learnable_v4_320_80`, compuesto por 320 prompts de entrenamiento y 80 de validación, orientados a tareas de agente. No se proporcionan detalles sobre el algoritmo de RL específico, la composición del dataset ni el número total de tokens de entrenamiento. El paper ASIL propone una metodología que reemplaza el enfoque de captura de pantalla y clic por un estado estructurado y acciones semánticas, lo que sugiere que el modelo ha sido entrenado para razonar sobre representaciones simbólicas de interfaces en lugar de píxeles.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje basado en Qwen3.5-2B, conserva las capacidades básicas de generación de texto del modelo base.
- Razonamiento para agentes GUI: el entrenamiento con RL sobre tareas de agente sugiere que el modelo está optimizado para tomar decisiones secuenciales en entornos de interfaz gráfica.
- Acciones semánticas: según el paper, el modelo opera sobre acciones semánticas en lugar de clics directos, lo que implica una capacidad de abstracción de comandos de alto nivel.
- Soporte de tool calling: no documentado en la información disponible.
- Capacidades multilingües: no disponibles.
- Modo de pensamiento (thinking mode): no documentado.

## Casos de uso

- Investigación en agentes GUI: el modelo sirve como punto de partida para reproducir los experimentos del paper ASIL y comparar metodologías de interacción con interfaces gráficas.
- Automatización de tareas en aplicaciones de escritorio: dado su entrenamiento en acciones semánticas, podría emplearse en entornos controlados para ejecutar flujos de trabajo en software con interfaz gráfica, aunque requiere integración con un entorno de ejecución.
- Desarrollo de agentes de navegación web: al operar sobre estados estructurados, el modelo puede adaptarse a tareas de extracción de información o relleno de formularios en páginas web, siempre que se le proporcione la representación semántica adecuada.
- Evaluación de técnicas de RL para modelos de lenguaje: el checkpoint es útil para estudiar el impacto del refuerzo en tareas de agente con pocos datos de entrenamiento.
- Benchmarking de modelos de 2B en tareas de agente: permite comparar el rendimiento de un modelo pequeño ajustado con RL frente a alternativas de mayor tamaño.
- Prototipado de asistentes de automatización: en entornos de investigación, puede servir para construir prototipos de asistentes que controlen aplicaciones mediante comandos semánticos en lugar de macros de clic.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. El único dato de rendimiento indirecto es el conjunto de validación de 80 prompts de tareas, pero no se reportan tasas de éxito ni otras métricas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2.390 millones de parámetros, en precisión FP16 se requieren aproximadamente 4,8 GB de VRAM solo para los pesos, más overhead de activaciones y KV cache. Con cuantización de 8 bits, alrededor de 2,4 GB; con 4 bits, cerca de 1,2 GB. Estas cifras son estimaciones teóricas, no datos oficiales.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM puede ejecutar el modelo en FP16 (por ejemplo, RTX 2060, RTX 3060, RTX 4060). Para cuantización de 4 bits, GPUs con 4 GB podrían ser suficientes (GTX 1650, RTX 3050).
- Compatibilidad con GPUs de consumo: sí, el tamaño de 2B permite su ejecución en la mayoría de GPUs consumer modernas.
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, llama.cpp (si se convierte a GGUF), Ollama (mediante conversión) o TGI. No se proporcionan configuraciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos de rendimiento. El modelo es un fine-tuning de Qwen3.5-2B, por lo que la comparación natural sería con el modelo base Qwen3.5-2B, pero no se han publicado métricas que permitan cuantificar la mejora introducida por el entrenamiento RL. Otras alternativas de tamaño similar (Qwen2.5-1.5B, Llama-3.2-1B) no son directamente comparables al estar orientadas a tareas generales y no a agentes GUI. Se recomienda consultar el paper para obtener resultados experimentales detallados.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un modelo derivado de Qwen3.5-2B, puede heredar sesgos del modelo base, pero no hay información específica.
- Riesgo de alucinación: no evaluado en la información disponible. El entrenamiento con solo 320 prompts de tareas puede aumentar el riesgo de respuestas inventadas en contextos fuera del dominio de entrenamiento.
- Limitaciones de contexto: la longitud de contexto no está especificada; se desconoce si el modelo soporta ventanas largas.
- Limitaciones de idioma: no se especifican idiomas soportados; probablemente herede los del modelo base, pero no confirmado.
- Restricciones de licencia: la licencia declarada es Apache 2.0, lo que permite uso comercial, pero la página de HuggingFace muestra "License: other" en la búsqueda web, lo que genera incertidumbre. Se recomienda verificar la licencia final antes de uso comercial.
- Caveat para producción: es un checkpoint de investigación con un conjunto de entrenamiento muy reducido; no se recomienda su uso en entornos productivos sin una evaluación exhaustiva y posible fine-tuning adicional.

## Enlaces

- HuggingFace: https://huggingface.co/sharryXR/asil-qwen35-2b-rl
- Paper (arXiv): https://huggingface.co/papers/2608.26991
- Página del proyecto: https://sharryxr.github.io/ASIL
- Repositorio GitHub: https://github.com/sharryXR/ASIL
- Colección de modelos ASIL: https://huggingface.co/collections/sharryXR/asil-models
- Modelo SFT relacionado: https://huggingface.co/sharryXR/asil-qwen35-2b-sft
