# jlsrls/em-ctrl-s1

## Resumen

em-ctrl-s1 es un modelo de lenguaje fine-tuneado a partir de `unsloth/gemma-3-4b-it`, la versión optimizada con Unsloth del modelo Gemma 3 de 4 mil millones de parámetros de Google. El autor, jlsrls, lo ha entrenado mediante aprendizaje supervisado (SFT) utilizando la librería TRL de HuggingFace, con el objetivo de adaptar el modelo base a una tarea específica que no se detalla en la documentación publicada. El repositorio pesa 2,2 GB y contiene pesos en formato safetensors, lo que sugiere una cuantización o una versión compacta del modelo original.

La relevancia de este modelo radica en que demuestra un flujo de fine-tuning accesible sobre Gemma 3, una familia de modelos abiertos con licencia permisiva, y en que puede servir como punto de partida para desarrolladores que quieran experimentar con ajuste fino de modelos de 4B en hardware de consumo. Sin embargo, la ausencia de una model card detallada, de datos de entrenamiento y de benchmarks publicados limita su uso directo en producción sin una evaluación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 3, con atención por ventanas deslizantes y atención global alternada) |
| Parametros totales | 4 mil millones (heredados del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base Gemma 3 soporta 128k tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors, posiblemente en precisión completa o cuantizado, sin especificar) |
| Idiomas soportados | no disponible (el modelo base Gemma 3 soporta múltiples idiomas, pero no se indica si el fine-tune los conserva) |
| Licencia | "license" (sin especificar; el modelo base Gemma 3 usa la licencia Gemma Terms of Use, pero este fine-tune no la declara explícitamente) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Gemma 3, un transformer decoder-only con 4 mil millones de parámetros que incorpora atención por ventanas deslizantes (sliding window attention) combinada con atención global en capas alternas, lo que permite manejar contextos largos de hasta 128k tokens en el modelo original. La versión base `unsloth/gemma-3-4b-it` es una adaptación de Unsloth que optimiza el modelo para fine-tuning con menor uso de memoria y mayor velocidad de entrenamiento.

El proceso de entrenamiento de em-ctrl-s1 se realizó con SFT (supervised fine-tuning) utilizando la librería TRL en su versión 0.24.0, con Transformers 5.5.0 y PyTorch 2.11.0. No se ha publicado información sobre el dataset utilizado, el número de pasos de entrenamiento, la tasa de aprendizaje ni las métricas de evaluación durante el entrenamiento. El enlace a Weights & Biases incluido en la model card sugiere que se registró el experimento, pero no se ha hecho público el informe. Tampoco se indica si se aplicaron técnicas como RLHF o DPO; la model card solo menciona SFT.

## Capacidades

- Generación de texto conversacional: al ser un fine-tune de Gemma 3 instruct, conserva la capacidad de mantener diálogos multi-turno y responder a instrucciones en lenguaje natural.
- Razonamiento y conocimiento general: hereda las capacidades del modelo base, que incluyen razonamiento lógico, conocimiento factual y comprensión lectora, aunque el fine-tune puede haber alterado estas capacidades según el dataset utilizado.
- Soporte de tool calling: no confirmado. El modelo base Gemma 3 incluye soporte para function calling, pero no se especifica si el fine-tune lo conserva.
- Capacidades multilingües: no confirmadas. Gemma 3 soporta más de 140 idiomas, pero el fine-tune podría haber reducido o sesgado este soporte.
- No se ha documentado ninguna capacidad especial adicional (visión, audio, thinking mode) en la información disponible.

## Casos de uso

- Experimentación académica con fine-tuning: investigadores pueden utilizar este modelo como ejemplo de un pipeline SFT completo con TRL y Unsloth, replicando el proceso con sus propios datasets.
- Prototipado rápido de asistentes conversacionales: dado su tamaño de 4B, puede desplegarse en una GPU de consumo para probar interacciones de chat antes de escalar a modelos mayores.
- Evaluación de la degradación post-fine-tuning: los desarrolladores pueden comparar el comportamiento de este modelo frente al base `unsloth/gemma-3-4b-it` para medir cómo el ajuste fino afecta a tareas generales como generación de código o razonamiento.
- Base para fine-tuning adicional: al ser un checkpoint intermedio, puede servir como punto de partida para nuevos entrenamientos con datasets específicos, aprovechando el trabajo ya realizado.
- Estudio de la influencia del dataset en el comportamiento: si el autor publicara el dataset, sería útil para analizar cómo los datos de entrenamiento moldean las respuestas del modelo.
- Despliegue en entornos con recursos limitados: con 2,2 GB de pesos, el modelo puede ejecutarse en GPUs con 6-8 GB de VRAM usando cuantización, lo que lo hace viable para aplicaciones edge o de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación, y los resultados de búsqueda web no están relacionados con este modelo. No se puede comparar su rendimiento con otros modelos sin datos objetivos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4B parámetros en precisión fp16, se necesitan aproximadamente 8 GB de VRAM. Con cuantización a 4 bits (si se aplica), podría reducirse a unos 3-4 GB.
- GPU recomendadas: una RTX 3060 de 12 GB o superior sería suficiente para fp16; una RTX 4060 de 8 GB podría funcionar con cuantización. Para entrenamiento, se recomienda al menos 16 GB de VRAM (RTX 4090, A100, etc.).
- Compatibilidad con GPU de consumo: sí, el modelo cabe en GPUs de gama media con cuantización, y en GPUs de gama alta sin cuantizar.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama y TGI, siempre que se conviertan los pesos al formato adecuado (GGUF para llama.cpp/Ollama). También se puede usar directamente con Transformers y pipeline de HuggingFace.
- Latencia y throughput: no disponibles. Dependen del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| em-ctrl-s1 (este) | 4B | no disponible | sin especificar | HuggingFace |
| unsloth/gemma-3-4b-it (base) | 4B | 128k | Gemma Terms of Use | HuggingFace |
| google/gemma-3-4b-it (original) | 4B | 128k | Gemma Terms of Use | HuggingFace |
| Qwen2.5-3B-Instruct | 3B | 32k | Apache 2.0 | HuggingFace |

La comparativa se limita a modelos de tamaño similar. em-ctrl-s1 no aporta información pública que lo diferencie de su base más allá del fine-tuning realizado. La licencia del modelo es ambigua ("license"), lo que puede limitar su uso comercial si no se aclara.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tune de Gemma 3, puede heredar los sesgos del modelo base, que incluyen estereotipos de género, raza y cultura. El fine-tuning adicional podría amplificarlos o reducirlos según el dataset.
- Riesgo de alucinación: no se ha evaluado específicamente, pero los modelos de 4B tienden a alucinar en tareas de razonamiento complejo o factualidad.
- Limitaciones de contexto: aunque el modelo base soporta 128k tokens, no se confirma que el fine-tune mantenga esa longitud. Es probable que el entrenamiento SFT reduzca la ventana efectiva.
- Restricciones de licencia: la model card indica "license" sin especificar. Si el autor no ha declarado una licencia clara, el uso comercial puede ser problemático. Se recomienda contactar al autor antes de usar el modelo en producción.
- Falta de documentación: no hay información sobre el dataset de entrenamiento, los hiperparámetros ni las métricas de evaluación, lo que impide reproducir el entrenamiento o evaluar su calidad.
- Riesgo de sobreajuste: al ser un fine-tune sin datos públicos, es posible que el modelo esté sobreajustado a un dominio muy específico y degrade su rendimiento en tareas generales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jlsrls/em-ctrl-s1
- Modelo base (Unsloth): https://huggingface.co/unsloth/gemma-3-4b-it
- Modelo base original (Google): https://huggingface.co/google/gemma-3-4b-it
- Enlace a Weights & Biases (entrenamiento): https://wandb.ai/rezvani-portland-state-university/clarifying-em/runs/zs0n9luu
- Repositorio de TRL: https://github.com/huggingface/trl
