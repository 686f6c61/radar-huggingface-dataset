# reaperdoesntknow/CasualSwarms

## Resumen

CasualSwarms (publicado por el autor bajo el nombre SAGI V3.1 / Swarm-8 V3.1) es un modelo de lenguaje causal para generación de texto desarrollado por el usuario de Hugging Face `reaperdoesntknow`. Se presenta como una implementación que combina una arquitectura transformer con dinámicas de "inteligencia de enjambre" (swarm intelligence), en la que varios agentes internos colaboran mediante enrutamiento diferenciable, mecanismos de confianza y memoria compartida. El modelo tiene 170.330.979 parámetros totales (aproximadamente 170 millones) y se distribuye en formato safetensors con un tamaño de repositorio de 0,7 GB.

La propuesta del autor es ambiciosa en su descripción: el modelo afirma incorporar capas de autoevaluación, detección de errores en tiempo real, un "núcleo AGI" con memoria jerárquica y modelo causal del mundo, y un núcleo de enjambre con 20 agentes vectorizados. Sin embargo, estas afirmaciones proceden exclusivamente de la model card del autor y no están respaldadas por documentación técnica verificable, benchmarks publicados ni un artículo de investigación asociado. El tamaño real del modelo (170 millones de parámetros) es incompatible con las capacidades que la model card sugiere.

El modelo es relevante únicamente como objeto de estudio de la brecha entre las afirmaciones de una model card y las especificaciones técnicas verificables. Está etiquetado para inglés, licencia Apache 2.0, y declara entrenamiento sobre datasets como TinyStories, GSM8K, General-Knowledge, DeepCoder-Preview-Dataset y KnowLogic.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con componentes descritos como "swarm" (enrutamiento diferenciable, agentes vectorizados); no verificable |
| Parametros totales | 170.330.979 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en fp32 según tags; safetensors) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Según la model card, el modelo combina un transformer causal con un "Swarm Core" de 20 agentes vectorizados, enrutamiento diferenciable, gestión dinámica de recursos y activación basada en confianza. Sobre esa base se describe un "AGI Core" con memoria jerárquica, modelo causal del mundo, meta-aprendizaje, biblioteca de conceptos, motor de reflexión, razonador de incertidumbre y auto-juego adversarial. La versión V3.1 añade una "capa de autoevaluación" con predictor de rendimiento, analizador de brechas de habilidad (24 skills), generador de currículo automático, detector de errores en tiempo real y detector de límites de capacidad.

No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por instrucciones. Los datasets declarados son `roneneldan/TinyStories`, `openai/gsm8k`, `MuskumPillerum/General-Knowledge`, `agentica-org/DeepCoder-Preview-Dataset` y `tangyuhang/KnowLogic`. No hay información sobre tokenizador, configuración de atención, ni innovaciones técnicas verificables más allá de las afirmaciones de la model card.

## Capacidades

- Generación de texto causal en inglés (pipeline `text-generation`).
- Etiquetas declaradas que sugieren orientación a agentes y razonamiento multi-paso, sin evidencia técnica publicada.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Las capacidades de "autoevaluación", "detección de alucinaciones" y "razonamiento causal" que menciona la model card no están respaldadas por benchmarks ni demos verificables.

## Casos de uso

- Experimentación académica sobre arquitecturas híbridas transformer-swarm: el modelo puede servir para estudiar cómo se implementan mecanismos de enrutamiento y agentes internos en un modelo pequeño de 170 M de parámetros, aunque sin garantías de que las afirmaciones de la model card se correspondan con el comportamiento real.
- Generación de texto creativo breve en inglés: dado su tamaño reducido y su posible entrenamiento con TinyStories, encaja en la generación de narrativas cortas y simples, no en tareas de razonamiento complejo.
- Prototipado de pipelines de agentes en local: al ser un modelo pequeño en fp32 (0,7 GB), puede desplegarse en CPU para pruebas de integración de frameworks de agentes, sin esperar calidad de producción.
- Evaluación de robustez y detección de alucinaciones: útil como caso de estudio para medir la brecha entre afirmaciones de model card y comportamiento observado en tareas de coherencia y lógica.
- Docencia sobre evaluación de modelos: sirve para ilustrar cómo verificar specs reales (parámetros, tamaño, licencia) frente a descripciones infladas.
- Filtrado y clasificación de texto simple en inglés: con ajuste fino adicional podría usarse para tareas ligeras de etiquetado, aunque no está entrenado específicamente para ello.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,7 GB para los pesos, más overhead de activaciones y KV cache (dependiente del contexto, no disponible).
- En cuantización a 8 bits: ~0,2 GB; a 4 bits: ~0,1 GB (estimación a partir de los 170 M de parámetros; no hay GGUF publicado).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) e incluso CPU; el modelo cabe holgadamente en 4-8 GB de VRAM.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: `transformers` (formato nativo safetensors); vLLM, llama.cpp, Ollama y TGI no tienen soporte confirmado para este checkpoint concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| CasualSwarms (SAGI V3.1) | 170 M | no disponible | Apache 2.0 | Hugging Face |
| GPT-2 small | 124 M | 1.024 tokens | MIT | Hugging Face |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | Apache 2.0 | Hugging Face |

La comparación se limita a parámetros, contexto y licencia; no hay datos de rendimiento publicados para CasualSwarms que permitan comparar calidad.

## Limitaciones y advertencias

- La model card describe capacidades de "AGI", "autoconciencia" y "detección de alucinaciones" que no están respaldadas por benchmarks, papers ni demos; deben tratarse como afirmaciones no verificadas.
- Con 170 M de parámetros, el modelo no puede sostener razonamiento complejo, matemáticas avanzadas ni código de producción, independientemente de lo que declare la model card.
- Riesgo elevado de alucinación y de incoherencia en contextos largos; no hay información sobre la longitud de contexto soportada.
- Solo inglés; no hay soporte multilingüe declarado.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación técnica y de evaluación hace desaconsejable su uso en producción sin una validación exhaustiva propia.
- Los datasets declarados incluyen conjuntos de naturaleza muy diversa (TinyStories, GSM8K, código); no se especifica la proporción ni el proceso de mezcla, lo que impide reproducir el entrenamiento.
- No hay tokenizador, configuración de generación ni instrucciones de uso documentadas más allá de la etiqueta `transformers`.

## Enlaces

- Hugging Face: https://huggingface.co/reaperdoesntknow/CasualSwarms
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset General-Knowledge: https://huggingface.co/datasets/MuskumPillerum/General-Knowledge
- Dataset DeepCoder-Preview-Dataset: https://huggingface.co/datasets/agentica-org/DeepCoder-Preview-Dataset
- Dataset KnowLogic: https://huggingface.co/datasets/tangyuhang/KnowLogic
