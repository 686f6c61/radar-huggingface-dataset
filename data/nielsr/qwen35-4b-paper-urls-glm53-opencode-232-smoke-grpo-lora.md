# nielsr/qwen35-4b-paper-urls-glm53-opencode-232-smoke-grpo-lora

## Resumen

El modelo `nielsr/qwen35-4b-paper-urls-glm53-opencode-232-smoke-grpo-lora` es un adaptador LoRA resultante de un entrenamiento de refuerzo con GRPO asíncrono (AsyncGRPO) sobre una versión ya fusionada de un fine-tune supervisado (SFT) del autor `nielsr`. Se distribuye a través de Hugging Face con la librería `transformers` y fue generado con el framework TRL (versión 1.18.1), lo que lo sitúa en la categoría de artefactos de investigación más que en la de modelos listos para producción.

El nombre indica que parte de una base de la familia Qwen con aproximadamente 4.000 millones de parámetros (la etiqueta `qwen35-4b`), aunque no se proporciona confirmación oficial del modelo base original ni de su arquitectura exacta en la información disponible. El repositorio ocupa 1,6 GB, un tamaño coherente con un adaptador LoRA o con pesos parciales, pero llamativamente pequeño para un modelo denso de 4B en precisión completa.

La relevancia de esta ficha es limitada: se trata de un experimento de entrenamiento (el sufijo `smoke` sugiere una prueba de humo) con cero descargas y cero interacciones en el momento de la consulta, sin model card detallada, sin licencia declarada y sin datos de evaluación. Resulta útil como referencia para quienes investigan flujos de RL con TRL y AsyncGRPO, pero no como modelo para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer denso de la familia Qwen por el nombre; no confirmado) |
| Parametros totales | no disponible (el nombre sugiere ~4B; no confirmado) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye el campo `licence: license` sin valor real) |
| Formato de pesos | safetensors (según tags); adaptador LoRA entrenado con TRL |
| Modelo base | nielsr/qwen35-4b-paper-urls-glm53-opencode-232-smoke-sft-merged |
| Framework de entrenamiento | TRL 1.18.1, Transformers 5.23.0, PyTorch 2.15.0, Datasets 5.2.0, Tokenizers 0.23.3 |
| Metodo de entrenamiento | AsyncGRPO (GRPO asíncrono) |
| Tamano del repositorio | 1,6 GB |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. El nombre y los tags apuntan a un transformer de la familia Qwen con alrededor de 4.000 millones de parámetros, pero no se confirma ni el número exacto de capas, ni la dimensión de los embeddings, ni la longitud de contexto nativa, ni la composición del vocabulario. El modelo parte de `nielsr/qwen35-4b-paper-urls-glm53-opencode-232-smoke-sft-merged`, un checkpoint ya fusionado de un SFT previo, sobre el que se aplica este adaptador LoRA.

El entrenamiento utiliza AsyncGRPO, una variante asíncrona de Group Relative Policy Optimization descrita en el paper DeepSeekMath (arXiv:2402.03300). GRPO elimina la necesidad de un modelo crítico separado estimando la línea base a partir de un grupo de respuestas muestreadas para cada prompt, lo que reduce el coste de memoria frente a PPO clásico. La variante asíncrona desacopla la generación de rollouts de la actualización de pesos, lo que permite aprovechar mejor clústeres con GPUs heterogéneas. No se especifican el número de pasos, el tamaño del dataset de RL, la función de recompensa utilizada ni los hiperparámetros (learning rate, tamaño de grupo, KL coefficient).

## Capacidades

- Generación de texto conversacional: la model card incluye un ejemplo de `pipeline("text-generation")` con formato de chat (`role`/`content`), lo que indica que el tokenizador espera plantillas de conversación.
- Razonamiento y matemáticas: el entrenamiento con GRPO está orientado, por diseño del método, a mejorar el razonamiento verificable (típicamente matemático y lógico), aunque no se aportan métricas que lo confirmen.
- Formato de chat multi-turno: el ejemplo de la model card usa una lista de mensajes, lo que sugiere soporte de plantillas conversacionales.
- Capacidades multilingües: no disponibles.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita; el nombre del checkpoint (`opencode`) sugiere un posible foco en tareas de código, pero no se documenta.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en RL para LLM: el modelo sirve como referencia reproducible de un pipeline AsyncGRPO con TRL, útil para estudiar cómo afecta el entrenamiento por refuerzo a un SFT previo en un modelo de ~4B. Se usaría cargándolo con `transformers` y comparándolo con el checkpoint SFT base.
- Pruebas de humo de infraestructura: dado el sufijo `smoke` y el reducido tamaño del repo, encaja en validaciones de pipelines de entrenamiento (verificar que TRL, Transformers 5.23 y PyTorch 2.15 se comunican correctamente) antes de lanzar runs a mayor escala.
- Evaluación de degradación por RL: permite medir si el ajuste con GRPO introduce regresiones en generación libre o en formato de chat respecto al modelo SFT fusionado, mediante comparaciones A/B con prompts fijos.
- Generación de texto exploratoria en local: con 1,6 GB de pesos, puede cargarse en una GPU de consumo para experimentos cualitativos de generación, siempre que se acepte la ausencia de garantías de calidad.
- Base para nuevos fine-tunes: al ser un adaptador LoRA sobre un checkpoint fusionado, puede reutilizarse como punto de partida para SFT o DPO adicionales en dominios específicos, aprovechando que el autor ya publica la cadena completa de checkpoints.
- Docencia y divulgación: útil para explicar de forma práctica la diferencia entre SFT, fusión de adaptadores y RL con GRPO, ya que la cadena de modelos del autor hace visible cada etapa del proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo denso de ~4B en BF16 se necesitarían del orden de 8-10 GB solo para pesos, más KV cache; en cuantización de 4 bits podría bajar a 3-4 GB, pero no se confirma que existan pesos GGUF publicados.
- GPU recomendadas: no disponibles. Para un modelo de este tamaño, una RTX 4090 (24 GB) o una A100 (40/80 GB) serían suficientes en BF16; una RTX 3060 de 12 GB podría bastar en cuantización de 8 bits.
- ¿Cabe en GPU de consumo? Probablemente sí en cuantizaciones bajas, pero no hay pesos cuantizados publicados ni confirmación del tamaño real del modelo.
- Opciones de despliegue: `transformers` con `pipeline` (documentado en la model card). No se mencionan vLLM, llama.cpp, Ollama ni TGI; al ser un adaptador LoRA, requeriría fusión previa con el modelo base para muchos motores de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| nielsr/qwen35-4b-...-grpo-lora (este) | ~4B (no confirmado) | no disponible | no disponible | Hugging Face, 0 descargas | Adaptador LoRA de investigación |
| Qwen2.5-3B / Qwen2.5-7B | 3B / 7B | 32K (128K en algunas variantes) | Apache 2.0 (mayoría) | Hugging Face, ampliamente usado | Alternativa consolidada de la familia Qwen |
| DeepSeek-R1-Distill-Qwen-1.5B / 7B | 1.5B / 7B | 32K-128K | MIT (distills) | Hugging Face | Entrenados con RL para razonamiento, comparables en propósito |
| Llama 3.2 3B Instruct | 3B | 128K | Llama 3.2 Community License | Hugging Face, Meta | Alternativa densa de tamaño similar |

La comparación es aproximada: no se dispone de datos de benchmarks del modelo evaluado, por lo que no puede establecerse una comparación de rendimiento rigurosa.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni evaluación cualitativa publicada, ni métricas de pérdida o recompensa durante el entrenamiento.
- Licencia no declarada: el campo `licence: license` de la model card no especifica términos. No debe asumirse uso comercial permitido; hay que contactar con el autor o consultar la licencia del modelo base original (probablemente Qwen, sujeta a sus propios términos).
- Riesgo elevado de alucinación: al ser un modelo pequeño (~4B) ajustado con RL sobre un SFT de investigación, la fiabilidad factual es baja y no está medida.
- Idiomas no documentados: no se confirma soporte de castellano ni de otros idiomas; el comportamiento multilingüe es desconocido.
- Naturaleza experimental: el sufijo `smoke` y las cero descargas indican que es un artefacto de prueba, no un modelo validado para producción.
- Formato de adaptador: al ser un LoRA, requiere fusión con el checkpoint base (`...-sft-merged`) para su uso en muchos motores; el `pipeline` de la model card puede o no resolver esta dependencia automáticamente.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin confirmar la ventana real.
- Sin garantías de mantenimiento: el repositorio no tiene interacciones ni documentación de soporte; puede quedar obsoleto o eliminado sin aviso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nielsr/qwen35-4b-paper-urls-glm53-opencode-232-smoke-grpo-lora
- Modelo base (SFT fusionado): https://huggingface.co/nielsr/qwen35-4b-paper-urls-glm53-opencode-232-smoke-sft-merged
- Paper de DeepSeekMath (AsyncGRPO): https://huggingface.co/papers/2402.03300
- Repositorio TRL: https://github.com/huggingface/trl
- Repositorio Transformers: https://github.com/huggingface/transformers
- Perfil del autor: https://huggingface.co/nielsr
