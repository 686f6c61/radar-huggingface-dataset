# HarpiaIA/Acaua-Lite

## Resumen

Acauã Lite es un ajuste fino (fine-tune) del modelo LiquidAI/LFM3-1.7B, desarrollado por HarpiaIA y orientado a tareas de generación de código y flujos de agente. Con 1.728.801.536 parámetros (aproximadamente 1,7 mil millones), se posiciona en el segmento de modelos compactos que pueden desplegarse en hardware de consumo, manteniendo capacidades de razonamiento y generación de código gracias a su entrenamiento específico sobre datasets de instrucciones para agentes y código.

El modelo hereda la arquitectura LFM3 de LiquidAI, una familia de modelos de lenguaje compactos diseñada para inferencia eficiente. Acauã Lite se ha afinado sobre OrionLLM/OpenAgentInstruct y Modotte/CodeX-7M-Non-Thinking, lo que sugiere un enfoque en instrucciones de agente y generación de código sin modo de razonamiento explícito (non-thinking). El idioma declarado es únicamente inglés.

Su relevancia actual radica en la demanda de modelos pequeños y especializados que puedan ejecutarse localmente o en entornos con recursos limitados, ofreciendo un equilibrio entre calidad de código y coste computacional. La licencia LFM Open License (lfm1.0) impone condiciones específicas que deben revisarse antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (transformer, según la familia base de LiquidAI) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se puede cuantizar a GGUF/AWQ según herramientas, pero no se especifica en la model card) |
| Idiomas soportados | inglés (en) |
| Licencia | LFM Open License (lfm1.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Acauã Lite se basa en LiquidAI/LFM3-1.7B, un modelo de la familia LFM3 de LiquidAI. La model card no proporciona detalles específicos sobre la arquitectura interna (número de capas, dimensiones, mecanismo de atención, etc.), más allá de la etiqueta `lfm3` y la librería `transformers`. Se trata de un transformer decoder-only de aproximadamente 1,7 mil millones de parámetros, según el recuento de safetensors.

El entrenamiento de ajuste fino se realizó sobre dos datasets: OrionLLM/OpenAgentInstruct, orientado a instrucciones para agentes, y Modotte/CodeX-7M-Non-Thinking, centrado en código y sin modo de razonamiento explícito. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card tampoco menciona innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y código en inglés, con especial énfasis en tareas de programación.
- Orientado a flujos de agente (agent) y instrucciones multi-paso, según los datasets de entrenamiento.
- Soporte de conversación multi-turno (etiqueta `conversational`).
- Capacidad de generación de código (etiqueta `coder` y `code`).
- No se declara soporte explícito de tool calling o function calling en la model card.
- No se declara soporte de visión, audio ni modo de razonamiento explícito (thinking mode).
- Idiomas: únicamente inglés.

## Casos de uso

- Generación de código en producción: el modelo puede integrarse en pipelines de CI/CD para autocompletar funciones, generar tests unitarios o sugerir correcciones, gracias a su entrenamiento sobre CodeX-7M-Non-Thinking.
- Asistentes de programación locales: al ser un modelo de 1,7B, puede desplegarse en estaciones de trabajo con GPU de consumo para autocompletado y chat técnico sin depender de la nube.
- Automatización de tareas de agente: su ajuste sobre OpenAgentInstruct permite usarlo en bucles de agente para descomponer tareas y ejecutar pasos secuenciales en inglés.
- Documentación técnica automatizada: generación de docstrings, comentarios y README a partir de fragmentos de código, aprovechando su especialización en código.
- Refactorización asistida: el modelo puede sugerir reescrituras de funciones o detectar patrones repetitivos en bases de código, integrándose en editores mediante la API de transformers.
- Prototipado rápido de chatbots técnicos: conversaciones multi-turno en inglés sobre temas de programación, con la ventaja de un modelo pequeño que reduce costes de inferencia.
- Educación y formación: explicación de conceptos de programación y resolución de ejercicios en inglés, con despliegue local para entornos con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3,5 GB (1,7B parámetros × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,8-2 GB.
- VRAM estimada en cuantización de 4 bits: alrededor de 1-1,2 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100, H100. Cabe en GPUs de consumo con al menos 4 GB de VRAM en FP16.
- Opciones de despliegue: transformers (librería declarada), y previsiblemente vLLM, llama.cpp u Ollama si se generan pesos GGUF, aunque no se confirma en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Acauã Lite | 1,7B | no disponible | LFM Open License (lfm1.0) | Hugging Face (HarpiaIA/Acaua-Lite) |
| LiquidAI/LFM3-1.7B | 1,7B | no disponible | LFM Open License | Hugging Face (LiquidAI) |
| Qwen2.5-Coder-1.5B | 1,5B | 32k (según model card pública) | Apache 2.0 | Hugging Face |
| DeepSeek-Coder-1.3B | 1,3B | 16k (según model card pública) | DeepSeek License | Hugging Face |

La comparativa se limita a parámetros y licencia, ya que no hay datos de rendimiento publicados para Acauã Lite. Frente a Qwen2.5-Coder-1.5B y DeepSeek-Coder-1.3B, Acauã Lite ofrece un tamaño similar pero con una licencia más restrictiva (LFM Open License) y únicamente inglés, mientras que los alternativos suelen soportar múltiples lenguajes y licencias más permisivas.

## Limitaciones y advertencias

- Idioma: solo inglés; no se declara soporte de español ni otros idiomas.
- Sesgos: no se documentan sesgos conocidos, pero al entrenarse sobre datasets específicos puede heredar sesgos de esos corpus.
- Riesgo de alucinación: como todo LLM, puede generar código o explicaciones incorrectas; requiere validación en producción.
- Contexto: no se especifica la longitud de contexto, lo que impide planificar aplicaciones que requieran ventanas largas.
- Licencia: LFM Open License (lfm1.0) impone restricciones que deben revisarse antes de uso comercial; no es una licencia permisiva tipo Apache 2.0.
- Ausencia de benchmarks: no hay métricas publicadas que permitan evaluar su calidad frente a alternativas.
- Modelo muy reciente (creado en 2026-11-01) con 0 descargas y 1 like, lo que implica falta de validación por la comunidad.
- No se declara soporte de tool calling ni function calling, lo que limita su uso en pipelines de agente que dependan de estas capacidades.

## Enlaces

- Hugging Face: https://huggingface.co/HarpiaIA/Acaua-Lite
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Dataset OrionLLM/OpenAgentInstruct: https://huggingface.co/datasets/OrionLLM/OpenAgentInstruct
- Dataset Modotte/CodeX-7M-Non-Thinking: https://huggingface.co/datasets/Modotte/CodeX-7M-Non-Thinking
- Licencia LFM Open License: no disponible (referenciada en el archivo LICENSE del repositorio)
