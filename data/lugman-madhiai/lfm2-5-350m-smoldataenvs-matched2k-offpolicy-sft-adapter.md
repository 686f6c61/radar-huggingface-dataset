# lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Matched2k-OffPolicy-SFT-adapter

## Resumen

El modelo `lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Matched2k-OffPolicy-SFT-adapter` es un adaptador de ajuste fino supervisado (SFT) publicado por el usuario `lugman-madhiai` sobre el modelo base `LiquidAI/LFM2.5-350M`. Se trata, por tanto, de un fine-tune derivado de la familia LFM2.5 de Liquid AI, orientada a modelos compactos y eficientes para generación de texto. El nombre del repositorio sugiere un entrenamiento sobre un conjunto de datos denominado "SmolDataEnvs", con un subconjunto "Matched2k" y una estrategia "OffPolicy", aunque la model card no documenta estos detalles.

El modelo base pertenece a la arquitectura LFM2 de Liquid AI, que combina capas convolucionales y de atención en un diseño híbrido pensado para reducir el coste computacional frente a transformers convencionales. El tamaño de 350 millones de parámetros lo sitúa en la categoría de modelos pequeños, aptos para despliegue en hardware modesto y para tareas de generación de texto con latencia baja.

La relevancia de esta ficha es limitada en términos de documentación: el autor no ha publicado métricas de evaluación, detalles del dataset, hiperparámetros de entrenamiento ni resultados de benchmarks. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repositorio es de 0.0 GB, lo que puede indicar que los pesos no están efectivamente subidos o que el adaptador es de tamaño despreciable. Cualquier evaluación debe hacerse con cautela y verificando la integridad de los artefactos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (híbrida convolucional/atención, según el modelo base LiquidAI/LFM2.5-350M) |
| Parametros totales | 350M (modelo base); el adaptador no declara recuento propio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; el modelo base puede admitir GGUF/otros, pero no se confirma aquí) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (según tags); adaptador entrenado con Unsloth/TRL |

## Arquitectura y entrenamiento

El adaptador se construye sobre `LiquidAI/LFM2.5-350M`, un modelo de la familia LFM2 de Liquid AI. La arquitectura LFM2 es un diseño híbrido que intercala bloques convolucionales y de atención para mejorar la eficiencia en inferencia y reducir el coste de memoria frente a transformers densos equivalentes. El modelo base tiene 350 millones de parámetros y está orientado a generación de texto.

El entrenamiento del adaptador se realizó mediante SFT (supervised fine-tuning) con la librería Unsloth, según indica la model card, que menciona un entrenamiento "2x faster" con dicha herramienta. El nombre del repositorio sugiere el uso de un dataset denominado "SmolDataEnvs" con un subconjunto "Matched2k" y una configuración "OffPolicy", probablemente relacionada con datos de interacción o entornos de agente. No se documentan el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO ni hiperparámetros como learning rate, epochs o tamaño de lote. Tampoco se especifica si el adaptador es LoRA, QLoRA u otro tipo de adaptador de bajo rango, aunque la etiqueta "adapter" en el nombre y el uso de Unsloth apuntan a un adaptador PEFT.

## Capacidades

- Generación de texto en inglés, heredada del modelo base LFM2.5-350M.
- Ajuste fino supervisado orientado, por el nombre del dataset, a entornos de datos y posiblemente tareas de agente o interacción con entornos ("SmolDataEnvs").
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el nombre sugiere entrenamiento con datos de entornos, pero no se confirma.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Razonamiento, código y matemáticas: no documentado para este adaptador.

## Casos de uso

- Experimentación con adaptadores SFT sobre LFM2.5-350M: el adaptador permite reproducir o comparar el efecto de un fine-tune con datos "Matched2k" frente al modelo base, útil en investigación sobre ajuste fino de modelos pequeños.
- Prototipado de agentes ligeros en inglés: si el dataset "SmolDataEnvs" está orientado a entornos, el adaptador podría emplearse para experimentar con políticas de agente en tareas simuladas, aunque no hay evidencia publicada de ello.
- Evaluación de técnicas de entrenamiento off-policy: el nombre "OffPolicy" sugiere un interés en métodos de aprendizaje off-policy; el adaptador puede servir como artefacto de comparación en estudios de RL/SFT.
- Generación de texto de bajo coste en hardware consumer: al derivar de un modelo de 350M, puede ejecutarse en GPU de gama baja o CPU para tareas de generación simple en inglés.
- Base para nuevos fine-tunes: al ser un adaptador Apache-2.0, puede reutilizarse como punto de partida para experimentos posteriores, siempre verificando la integridad de los pesos.
- Docencia y demostraciones de pipelines Unsloth/TRL: el repositorio ilustra el flujo de entrenamiento con Unsloth y el etiquetado de modelos en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 350M en fp16 se estiman aproximadamente 0.7 GB de pesos, y en cuantización de 4 bits alrededor de 0.2-0.3 GB, aunque estas cifras son estimaciones generales y no están confirmadas por el autor.
- GPU recomendadas: no documentadas. Por tamaño, cabría en GPUs consumer como RTX 3060, RTX 4060 o superiores, así como en Apple Silicon y CPU.
- Cabe en GPU consumer: probablemente sí, dado el tamaño de 350M, pero no confirmado por el autor.
- Opciones de despliegue: transformers (según tags), text-generation-inference (según tags); no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI más allá de la etiqueta.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Matched2k-OffPolicy-SFT-adapter | 350M (base) | no disponible | apache-2.0 | Hugging Face, 0 descargas | Adaptador SFT sin benchmarks publicados |
| LiquidAI/LFM2.5-350M | 350M | no disponible en esta ficha | no disponible en esta ficha | Hugging Face (modelo base) | Modelo base oficial de Liquid AI |
| Modelos pequeños tipo Qwen2.5-0.5B | 500M | 32k (según documentación pública del modelo) | Apache-2.0 | Hugging Face | Alternativa de tamaño similar, con benchmarks publicados |
| Modelos pequeños tipo SmolLM2-360M | 360M | 8k (según documentación pública del modelo) | Apache-2.0 | Hugging Face | Alternativa de tamaño similar orientada a eficiencia |

La comparación con Qwen2.5-0.5B y SmolLM2-360M se ofrece como referencia de categoría; no se dispone de métricas del adaptador para comparar rendimiento.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas que permitan evaluar la calidad del adaptador frente al modelo base.
- Documentación mínima: la model card no describe dataset, hiperparámetros ni metodología, lo que dificulta la reproducibilidad.
- Tamaño del repositorio de 0.0 GB: posible que los pesos del adaptador no estén subidos o que el artefacto sea incompleto; conviene verificar antes de usarlo.
- Idiomas: solo inglés declarado; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Riesgo de alucinación: inherente a modelos de 350M, especialmente en tareas de razonamiento o conocimiento factual.
- Sesgos: no documentados; el modelo base puede arrastrar sesgos de sus datos de entrenamiento, no evaluados aquí.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Contexto: no se documenta la longitud de contexto soportada, lo que limita su uso en tareas de contexto largo.
- Tool calling y agentes: no confirmados; el nombre sugiere entrenamiento con entornos, pero no hay evidencia de que el adaptador implemente protocolos de function calling.

## Enlaces

- Hugging Face: https://huggingface.co/lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Matched2k-OffPolicy-SFT-adapter
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
