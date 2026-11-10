# amaan784/agentic-world-behavioral

## Resumen

Agentic World — Behavioral Digital Twin LoRA Adapters es una colección de adaptadores LoRA entrenados sobre el modelo base Mistral 7B Instruct v0.3. El desarrollo corre a cargo del usuario amaan784, en el contexto del hackathon Mistral Worldwide 2026, y su objetivo es modelar el comportamiento de navegación de usuarios reales a partir de grabaciones de sesión capturadas con PostHog. Cada adaptador representa un arquetipo conductual distinto (Speedster, Scanner, Erratic Clicker, Cautious Explorer, Frustrated Clicker) y se entrena con pares (estado de página → siguiente acción) generados a partir de sesiones reales.

La propuesta es poco habitual: en lugar de un modelo generalista, se publican cinco adaptadores que actúan como "gemelos digitales" conductuales, capaces de predecir la próxima acción de un usuario dado un estado de interfaz. Esto resulta relevante para equipos de producto y analítica web que quieran simular, testear o generar tráfico sintético con perfiles de comportamiento realistas, así como para investigación en modelado de usuario.

Técnicamente es un fine-tuning LoRA (rank 32, alpha 64) sobre Mistral 7B Instruct v0.3, un transformer decoder-only de 7.000 millones de parámetros con 32.000 tokens de contexto. El repositorio ocupa 5 GB e incluye los pesos de los adaptadores en formato safetensors, bajo licencia Apache 2.0. No se han publicado resultados de benchmarks ni métricas de evaluación en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral 7B Instruct v0.3) con adaptadores LoRA |
| Parametros totales | 7.000 millones (modelo base); adaptadores LoRA con rank 32 y alpha 64 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (los adaptadores se publican en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible (heredados del modelo base, sin documentar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo se construye sobre Mistral 7B Instruct v0.3, un transformer decoder-only de 7.000 millones de parámetros con atención de ventana deslizante y RoPE, y 32.000 tokens de contexto. Sobre él se aplican adaptadores LoRA con rank 32, alpha 64, sobre todas las capas de proyección, entrenados con HuggingFace TRL SFTTrainer y PEFT. El entrenamiento se realizó en una NVIDIA A100 de 80 GB en Brev, con precisión bf16, Flash Attention 2 y packing, durante 5 épocas.

El pipeline de datos parte de grabaciones de sesión reales de PostHog (clics, scrolls, entradas de teclado, navegación). Cada sesión se parsea, se describe mediante Mistral, se embebe y se agrupa con K-Means en cinco clústeres. Para cada clúster se generan datos de entrenamiento en forma de pares (estado de página → siguiente acción) y se entrena un adaptador LoRA independiente. No se documenta el volumen de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; el seguimiento de las ejecuciones está disponible en W&B.

## Capacidades

- Predicción de la siguiente acción de un usuario sobre una interfaz web a partir del estado de página.
- Simulación de perfiles conductuales diferenciados mediante cinco adaptadores: Speedster, Scanner, Erratic Clicker, Cautious Explorer y Frustrated Clicker.
- Generación de texto y razonamiento general heredados de Mistral 7B Instruct v0.3.
- Soporte de instrucciones conversacionales (chat) del modelo base.
- Capacidad multilingüe heredada del modelo base (no documentada específicamente para los adaptadores).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking específico para estos adaptadores.

## Casos de uso

- Simulación de tráfico sintético para pruebas de producto: cada adaptador genera secuencias de acciones coherentes con un arquetipo de usuario, lo que permite testear flujos de onboarding o checkout con perfiles realistas sin depender de usuarios reales.
- Análisis de fricción en interfaces: el adaptador Frustrated Clicker modela clics repetidos y señales de confusión, útil para detectar patrones de abandono y priorizar rediseños.
- Generación de datos de entrenamiento para sistemas de analítica: las predicciones (estado → acción) pueden alimentar modelos de propensión o de detección de anomalías en comportamiento.
- Investigación en modelado de usuario: los cinco clústeres permiten estudiar diferencias conductuales entre demografías y validar hipótesis sobre navegación.
- Personalización de experiencias: dado un perfil clasificado, seleccionar el adaptador correspondiente para predecir la siguiente acción y adaptar la interfaz en tiempo real.
- Evaluación de agentes de navegación: usar los adaptadores como entorno de referencia para medir si un agente automatizado imita o se desvía de patrones humanos reales.
- Prototipado rápido en hackathons o demos: la integración con PEFT permite cargar un adaptador concreto sobre Mistral 7B en pocas líneas de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en bf16: aproximadamente 14-16 GB; en cuantización de 8 bits, en torno a 8 GB; en 4 bits, en torno a 4-5 GB. Los adaptadores LoRA añaden una sobrecarga mínima (decenas de MB).
- GPU recomendadas: NVIDIA A100 80GB (la usada en entrenamiento), H100, L40S o A10G para despliegue en servidor.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16 o 8 bits, y en RTX 3090/4080 con cuantización 4 bits.
- Opciones de despliegue: transformers + PEFT (carga directa de adaptadores), vLLM (con soporte de LoRA), TGI, llama.cpp u Ollama si se fusionan los adaptadores en un checkpoint GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Agentic World Behavioral (este) | 7B + LoRA | 32.000 | Gemelos digitales conductuales sobre Mistral 7B | Apache 2.0 | Hugging Face (repo de 5 GB) |
| Mistral 7B Instruct v0.3 | 7B | 32.000 | Modelo generalista de instrucciones | Apache 2.0 | Hugging Face |
| Mistral 7B base | 7B | 32.000 | Modelo base sin instrucciones | Apache 2.0 | Hugging Face |
| Mistral NeMo 12B Instruct | 12B | 128.000 | Modelo generalista de instrucciones | Apache 2.0 | Hugging Face |

La comparación con modelos generalistas es limitada: este repositorio no compite en benchmarks de razonamiento o código, sino que aporta adaptadores especializados en una tarea concreta (predicción de comportamiento web). No se dispone de métricas propias para comparar rendimiento frente a alternativas.

## Limitaciones y advertencias

- No se han publicado benchmarks, métricas de evaluación ni tasas de acierto de la predicción de acciones; el rendimiento real es desconocido.
- El entrenamiento se basa en sesiones de PostHog de un contexto concreto; los adaptadores pueden no generalizar a otros sitios web, industrias o tipos de usuario.
- Riesgo de alucinación inherente al modelo base Mistral 7B Instruct v0.3, especialmente al generar descripciones o acciones fuera del dominio de entrenamiento.
- Los cinco clústeres son arquetipos agregados; pueden reproducir sesgos presentes en los datos originales (por ejemplo, demográficos o de dispositivo) sin que se documenten medidas de mitigación.
- Idiomas soportados no documentados; el comportamiento multilingüe depende del modelo base y no se ha validado para los adaptadores.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base y de los datos de PostHog empleados en el entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y proviene de un hackathon; no hay evidencia de validación externa ni mantenimiento continuado.
- No se documenta soporte de tool calling, agentes multi-paso ni otras capacidades avanzadas; conviene no asumirlas en producción.

## Enlaces

- Hugging Face: https://huggingface.co/amaan784/agentic-world-behavioral
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- GitHub del proyecto: https://github.com/exploring-curiosity/PosthogAgent
- Ejecuciones de entrenamiento en W&B: https://wandb.ai/amaan784-columbia-university/agentic-world
