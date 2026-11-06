# Samonte/zils-lite-v2

## Resumen

zils-lite-v2 es un ajuste fino mediante LoRA (rango 64, fusionado en los pesos) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario Samonte. El modelo está concebido como un "cuerpo entrenado" (trained soup body) para el pool `d3-lite` del sistema Zils, asociado a la subred 127 de Bittensor. No se trata de un modelo conversacional generalista, sino de un modelo de decisión entrenado sobre datos etiquetados de resultados reales.

La propuesta técnica consiste en reutilizar la torre de lenguaje y visión del chasis `d3-lite` (basado en Qwen3.5-0.8B) y entrenar únicamente a través de su capa de respuesta congelada, sobre un corpus de decisiones del mundo real: cierres y respuestas aceptadas de Stack Exchange, resultados de reversiones y revisiones de Wikipedia, categorías de arXiv y fusiones de Gerrit, además de una destilación de las respuestas públicas de Zils Relay.

Este checkpoint corresponde al paso 2000 de un total de 14702 pasos de entrenamiento de la ejecución v5. Su relevancia radica en que ejemplifica un paradigma distinto al del ajuste instructivo convencional: el modelo no está optimizado para generar texto libre, sino para emitir decisiones calibradas sobre contenido y flujos de trabajo comunitarios, con una huella de parámetros reducida (852.985.920 parámetros) y licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-0.8B) con torre de visión del chasis d3-lite |
| Parámetros totales | 852.985.920 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos almacenados en bf16 en el layout del chasis) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B en la revisión `2fc06364715b967f1860aea9cf38778875588b17` y aplica un ajuste fino LoRA de rango 64 que posteriormente se fusiona en los pesos. El entrenamiento se realiza a través de la capa de respuesta congelada del chasis `d3-lite`, lo que implica que el cuerpo del modelo aprende a mapear representaciones internas hacia decisiones, sin modificar la interfaz de salida del chasis. La torre de visión se mantiene sin cambios respecto al chasis original.

El corpus de entrenamiento combina datos etiquetados de resultados reales (cierres y respuestas aceptadas de Stack Exchange, resultados de reversiones y revisiones de Wikipedia, categorías de arXiv y fusiones de Gerrit) con una destilación de las respuestas públicas de Zils Relay. El checkpoint publicado corresponde al paso 2000 de 14702, por lo que representa un estado intermedio del entrenamiento y no la versión final de la ejecución v5. No se especifican en la información disponible el número total de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Emisión de decisiones sobre contenido y flujos de trabajo comunitarios, entrenado sobre resultados reales de moderación y revisión.
- Clasificación y predicción de resultados en dominios como Stack Exchange (cierre de preguntas, aceptación de respuestas), Wikipedia (reversiones, revisiones), arXiv (categorización) y Gerrit (fusiones).
- Procesamiento multimodal heredado del chasis d3-lite, con torre de visión sin modificar.
- Ajuste específico a la capa de respuesta del chasis `d3-lite`, orientado a la integración en el pool de la subred 127 de Bittensor.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Moderación asistida en foros técnicos: el modelo puede predecir si una pregunta de Stack Exchange debe cerrarse o si una respuesta merece aceptación, aprovechando su entrenamiento sobre cierres y respuestas aceptadas reales.
- Control de calidad en wikis colaborativas: integrado en un pipeline de revisión, puede estimar la probabilidad de que una edición sea revertida, ayudando a priorizar la revisión humana en Wikipedia.
- Clasificación temática de preprints: dado un manuscrito de arXiv, el modelo puede predecir su categoría primaria, útil para sistemas de triaje editorial o de recomendación científica.
- Automatización de revisiones de código en Gerrit: puede estimar si un cambio (change) acabará fusionándose, lo que permite señalizar revisiones de bajo riesgo o bloquear cambios problemáticos antes de la revisión humana.
- Evaluación de decisiones en el pool d3-lite de Bittensor: el modelo actúa como cuerpo entrenado del pool, emitiendo decisiones que se integran en el mecanismo de consenso de la subred 127.
- Destilación y comparación de respuestas: al haberse entrenado sobre respuestas públicas de Zils Relay, puede emplearse como referencia para evaluar la coherencia de respuestas generadas por otros nodos del ecosistema.
- Investigación sobre modelos de decisión de bajo coste: con menos de mil millones de parámetros, sirve como banco de pruebas para estudiar ajustes LoRA fusionados sobre chasis congelados en tareas de clasificación de resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en bf16 para los 852.985.920 parámetros; en torno a 0,9 GB en cuantización de 8 bits y 0,5 GB en 4 bits (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son compatibles.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas, incluidas las de gama de entrada con 6-8 GB.
- Opciones de despliegue: al estar en safetensors y derivar de Qwen3.5-0.8B, es desplegable con vLLM, TGI, llama.cpp (previa conversión a GGUF) y Ollama (previa conversión), aunque la información disponible no confirma compatibilidad explícita con cada herramienta.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| zils-lite-v2 | 852.985.920 | No disponible | Apache 2.0 | Modelo de decisión (LoRA fusionado sobre Qwen3.5-0.8B) |
| Qwen/Qwen3.5-0.8B | ~0,8 B | No disponible | No disponible | Modelo base generalista conversacional |
| Modelos de clasificación tipo BERT-base | ~110 M | 512 tokens | Variable | Clasificación de texto, sin capacidades generativas |

La comparación directa con alternativas de la misma categoría (modelos de decisión entrenados sobre resultados reales) no está disponible en la información proporcionada. Frente a su modelo base, zils-lite-v2 sustituye el comportamiento conversacional por una capa de decisión especializada; frente a clasificadores BERT, ofrece mayor tamaño y herencia multimodal, pero carece de datos públicos de rendimiento que permitan una comparación objetiva.

## Limitaciones y advertencias

- Checkpoint intermedio: se trata del paso 2000 de 14702, por lo que su rendimiento puede ser inferior al de la versión final de la ejecución v5.
- Sesgos conocidos: al entrenarse sobre decisiones de comunidades como Stack Exchange, Wikipedia, arXiv y Gerrit, puede heredar los sesgos de moderación y los criterios idiosincrásicos de esas plataformas.
- Riesgo de alucinación: aunque el modelo está orientado a decisiones, mantiene la torre de lenguaje generativa del modelo base, por lo que puede producir justificaciones o texto no fundamentado.
- Limitaciones de contexto e idioma: no se especifican la longitud de contexto ni los idiomas soportados; el corpus de entrenamiento parece centrado en contenido mayoritariamente en inglés.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero deben verificarse las condiciones del modelo base Qwen3.5-0.8B y de los datos de entrenamiento de terceros.
- Caveat para producción: el modelo está diseñado para integrarse en el chasis `d3-lite` y su capa de respuesta congelada; su uso fuera de ese ecosistema puede degradar el rendimiento y requerir adaptaciones.
- Ausencia de benchmarks públicos: no hay métricas verificables que respalden su calidad en tareas de decisión.

## Enlaces

- HuggingFace: https://huggingface.co/Samonte/zils-lite-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Revisión del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/tree/2fc06364715b967f1860aea9cf38778875588b17
- Bittensor (subred 127): https://bittensor.com
- Stack Exchange: https://stackexchange.com
- Wikipedia: https://www.wikipedia.org
- arXiv: https://arxiv.org
- Gerrit: https://www.gerritcodereview.com
