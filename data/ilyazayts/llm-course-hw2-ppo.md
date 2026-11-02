# ilyazayts/llm-course-hw2-ppo

## Resumen

`ilyazayts/llm-course-hw2-ppo` es un modelo de lenguaje publicado en HuggingFace por el usuario ilyazayts, aparentemente como parte de un trabajo práctico de un curso sobre modelos de lenguaje (el identificador incluye el sufijo `llm-course-hw2-ppo`, que sugiere una segunda tarea centrada en entrenamiento con PPO, *Proximal Policy Optimization*). El modelo se distribuye en formato safetensors con la librería transformers y la etiqueta `llama`, lo que indica una arquitectura derivada de la familia LLaMA.

El dato objetivo más relevante es su tamaño: 134.515.008 parámetros totales, es decir, aproximadamente 134 millones, con un repositorio de 0,8 GB. Se trata, por tanto, de un modelo pequeño orientado a generación de texto y conversación, no de un modelo de gran escala. La model card está completamente generada de forma automática y no contiene información sustantiva sobre datos de entrenamiento, licencia, idiomas ni evaluación.

La relevancia de esta ficha es limitada desde el punto de vista de producción: el modelo no tiene descargas ni likes, no declara licencia y su documentación es un esqueleto vacío. Resulta útil principalmente como referencia para quienes sigan el mismo curso o quieran inspeccionar un checkpoint de ajuste con PPO sobre una base tipo LLaMA de pequeño tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo LLaMA (según etiqueta `llama`); detalles no disponibles |
| Parametros totales | 134.515.008 (aprox. 134,5 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La etiqueta `llama` y el uso de transformers apuntan a una arquitectura transformer decoder-only con normalización RMSNorm, activación SwiGLU y atención multi-cabeza, siguiendo el diseño de la familia LLaMA. Sin embargo, la model card no confirma número de capas, dimensión oculta, número de cabezas ni longitud de contexto, por lo que estos datos deben considerarse no disponibles.

El sufijo `ppo` del identificador sugiere que el modelo ha pasado por una fase de ajuste con *Proximal Policy Optimization*, probablemente sobre una base preentrenada o ajustada por instrucciones, en el contexto de un ejercicio académico. No se especifican el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF/DPO previo ni hiperparámetros de entrenamiento. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autoregresiva, según el pipeline declarado `text-generation`.
- Uso conversacional, según la etiqueta `conversational` del repositorio.
- Compatibilidad con Text Generation Inference (etiqueta `text-generation-inference`) y con endpoints compatibles (etiqueta `endpoints_compatible`).
- Capacidades de razonamiento, código, matemáticas, visión o audio: no documentadas ni verificables con la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo *thinking* u otras capacidades especiales: no disponibles.

## Casos de uso

- Experimentación académica: reproducción de un pipeline de ajuste con PPO sobre una base LLaMA pequeña, útil para comparar curvas de recompensa y estabilidad del entrenamiento en un entorno controlado.
- Prototipado rápido de interfaces conversacionales: al ocupar menos de 1 GB en safetensors, puede cargarse en memoria de CPU o GPU modesta para validar flujos de chat antes de migrar a un modelo mayor.
- Pruebas de integración con transformers y TGI: sirve para verificar que un pipeline de despliegue (carga de safetensors, tokenizador, generación) funciona de extremo a extremo con un checkpoint pequeño.
- Docencia y demostraciones: adecuado para explicar en clase cómo se estructura un repositorio de modelo en HuggingFace y qué metadatos debe incluir una model card completa.
- Generación de texto de baja latencia en entornos con recursos limitados: con 134 M de parámetros, la inferencia es viable en CPU para tareas de completado corto, siempre que se acepte la falta de garantías de calidad.
- Base para *fine-tuning* posterior: al ser un checkpoint pequeño, puede servir como punto de partida para ajustes específicos de dominio en GPUs de gama consumer, aunque sin licencia declarada no debería usarse en producción comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,27 GB solo para pesos (134,5 M × 2 bytes), más overhead de activaciones y KV cache; en la práctica, menos de 1 GB.
- VRAM estimada en fp32: aproximadamente 0,54 GB solo para pesos.
- VRAM estimada con cuantización de 8 bits: alrededor de 0,14 GB para pesos; con 4 bits, unos 0,07 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4060, T4 o incluso iGPU con memoria compartida pueden ejecutarlo.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas modernas e incluso en CPU.
- Opciones de despliegue: transformers (carga nativa), Text Generation Inference (etiqueta declarada), y previsiblemente llama.cpp u Ollama si se convierte a GGUF, aunque no se distribuyen pesos en ese formato.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ilyazayts/llm-course-hw2-ppo | 134,5 M | No disponible | No disponible | HuggingFace, 0 descargas |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens | Apache 2.0 | HuggingFace, ampliamente usado |
| GPT-2 (124 M) | 124 M | 1.024 tokens | MIT | HuggingFace, referencia histórica |
| SmolLM-135M | 135 M | 2.048 tokens | Apache 2.0 | HuggingFace, con benchmarks publicados |

La comparación se limita a tamaño y disponibilidad: no hay datos de rendimiento del modelo analizado que permitan contrastar calidad. Frente a SmolLM-135M o GPT-2, de tamaño casi idéntico, la diferencia principal es la ausencia de licencia, documentación y evaluación publicadas.

## Limitaciones y advertencias

- Model card generada automáticamente y sin completar: no hay información sobre datos de entrenamiento, sesgos ni evaluación.
- Licencia no declarada: no se puede asumir permiso para uso comercial; en la práctica, la ausencia de licencia impide un despliegue en producción con garantías legales.
- Riesgo de alucinación elevado y no cuantificado: no se han publicado evaluaciones de fidelidad ni de toxicidad.
- Idiomas soportados desconocidos: no se puede garantizar un comportamiento correcto en castellano ni en ningún otro idioma.
- Longitud de contexto desconocida: no se debe asumir una ventana concreta; conviene probar empíricamente antes de diseñar aplicaciones multi-turno largas.
- Modelo de 134 M de parámetros: su capacidad de razonamiento, código y matemáticas es previsiblemente muy limitada en comparación con modelos de miles de millones de parámetros.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación externa.
- El nombre sugiere un ejercicio de curso; no hay garantía de que el checkpoint esté completamente entrenado o sea estable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ilyazayts/llm-course-hw2-ppo
- Paper referenciado en las etiquetas (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
