# Samonte/zils-lite-v1

## Resumen

zils-lite-v1 es un fine-tune LoRA de Qwen/Qwen3.5-0.8B desarrollado por el usuario Samonte para el pool de decisiones `d3-lite` de la subred 127 de Bittensor. El modelo parte del checkpoint de Qwen3.5-0.8B en la revisión `2fc06364715b967f1860aea9cf38778875588b17` y aplica un LoRA de rango 64 fusionado en los pesos, entrenado sobre datos etiquetados de resultados reales de decisión: cierres y respuestas aceptadas de Stack Exchange, reversiones y resultados de revisión de Wikipedia, categorías de arXiv y merges de Gerrit.

La propuesta es poco convencional: no se presenta como un modelo de chat generalista, sino como un "cuerpo entrenado" (soup body) que alimenta una capa de respuesta congelada del chasis `d3-lite`. El modelo conserva la torre de visión del chasis sin modificar y almacena los pesos de lenguaje y visión en bf16 con el layout original. Con 852.985.920 parámetros y un repositorio de 1,7 GB, es un modelo compacto orientado a clasificación y toma de decisiones supervisada más que a generación abierta.

Es relevante ahora por dos motivos: por un lado, demuestra el patrón de fine-tuning de modelos pequeños (sub-1000M) para tareas de decisión binaria o multiclase con datos de resultado verificable; por otro, se enmarca en el ecosistema de Bittensor, donde los modelos se entrenan y despliegan como participantes de subredes con incentivos económicos. La licencia Apache 2.0 facilita su reutilización comercial, aunque la ausencia de benchmarks y de documentación detallada limita su evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-0.8B) con torre de visión del chasis `d3-lite`; fine-tune LoRA rango 64 fusionado |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 853M parámetros. Sobre esa base se aplica un LoRA de rango 64 que se fusiona en los pesos finales, de modo que el artefacto publicado no requiere cargar adaptadores por separado. La torre de visión del chasis `d3-lite` se mantiene intacta, lo que sugiere que el modelo conserva capacidad multimodal heredada del padre, aunque la model card no detalla la resolución, el encoder visual ni el número de tokens de imagen.

El entrenamiento se realizó "a través de la capa de respuesta congelada del chasis `d3-lite`" sobre datos etiquetados de resultados reales: cierres y respuestas aceptadas de Stack Exchange, reversiones y resultados de revisión de Wikipedia, categorías de arXiv y merges de Gerrit. La model card indica un cambio relativo de las capas de lenguaje respecto al padre Qwen de 0,030, lo que indica un ajuste moderado y no un reentrenamiento profundo. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron RLHF, DPO u otras técnicas de alineamiento. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación y toma de decisiones supervisada sobre resultados verificables (cierres, merges, reversiones, categorías), que es el objetivo declarado del entrenamiento.
- Generación de texto y razonamiento heredados de Qwen3.5-0.8B, aunque el fine-tune está orientado a decisión y no a diálogo abierto.
- Capacidad de visión heredada del chasis `d3-lite`, con la torre visual sin modificar; el alcance concreto no está documentado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; la model card no enumera idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Moderación de comunidades técnicas: el modelo puede clasificar si una pregunta o respuesta de un foro tipo Stack Exchange debe cerrarse o aceptarse, usando el patrón de datos con el que fue entrenado (cierres y respuestas aceptadas).
- Gestión de revisiones en wikis: entrenado con resultados de reversiones y revisiones de Wikipedia, puede puntuar ediciones como aceptables o revertibles en flujos de patrullaje.
- Clasificación de preprints: con categorías de arXiv en el dataset, puede asignar un artículo a una categoría temática o verificar la coherencia de la categoría declarada.
- Automatización de revisión de código: a partir de merges de Gerrit, puede predecir la probabilidad de aceptación de un cambio o señalar cambios con riesgo de rechazo en pipelines de CI/CD.
- Señal de decisión en subredes Bittensor: como cuerpo del pool `d3-lite` de la subred 127, puede actuar como componente de decisión dentro de un sistema de incentivos, aportando puntuaciones sobre resultados verificables.
- Filtrado previo en pipelines de datos: puede usarse como clasificador barato (853M parámetros) para descartar o priorizar muestras antes de pasarlas a un modelo mayor, reduciendo coste computacional.
- Prototipado de modelos de decisión: sirve como punto de partida para fine-tunes adicionales sobre dominios con etiquetas de resultado, dado su tamaño reducido y licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 2 y 4 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9 GB de pesos; en 4 bits, alrededor de 0,5 GB. No se publican GGUF oficiales, por lo que la cuantización requeriría conversión propia.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (RTX 3050, RTX 4060, RTX 3060) es suficiente en bf16 para batch pequeño; para throughput alto, A100 o H100 no aportan ventaja significativa dado el tamaño del modelo.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas modernas, e incluso en iGPU con suficiente memoria compartida en cuantización baja.
- Opciones de despliegue: transformers con safetensors es la vía directa; vLLM y TGI son viables tras verificar compatibilidad con la arquitectura Qwen3.5; llama.cpp y Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput estimados: no disponibles. Por el tamaño, se espera latencia de milisegundos por petición en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| zils-lite-v1 | 853M | no disponible | Apache 2.0 | Decisión supervisada (fine-tune de Qwen3.5-0.8B) | Hugging Face, 0 descargas |
| Qwen3.5-0.8B (padre) | ~800M | no disponible | Apache 2.0 | Modelo base generalista y multimodal | Hugging Face, ampliamente disponible |
| Qwen2.5-0.5B | ~500M | 32K (según versión) | Apache 2.0 | Modelo base generalista | Hugging Face, muy extendido |
| SmolLM2-360M | ~360M | 8K | Apache 2.0 | Modelo base generalista | Hugging Face, muy extendido |

La comparación directa es limitada: zils-lite-v1 es un fine-tune de nicho con cero descargas y sin benchmarks, mientras que los alternativas son modelos base generalistas con documentación y evaluaciones públicas. La ventaja de zils-lite-v1 es su especialización en decisiones con resultado verificable; su desventaja es la falta de evidencia empírica de rendimiento y de soporte comunitario.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el fine-tune mejore al padre en ninguna tarea medible.
- Sesgos desconocidos: el dataset de entrenamiento (Stack Exchange, Wikipedia, arXiv, Gerrit) refleja los sesgos de esas comunidades, incluyendo sesgos de idioma (predominantemente inglés) y de demografía de contribuyentes.
- Riesgo de alucinación: aunque el objetivo es la decisión, el modelo conserva la cabeza generativa de Qwen3.5-0.8B y puede producir texto plausible pero incorrecto si se usa fuera de su dominio de entrenamiento.
- Contexto e idiomas no documentados: no se especifica la ventana de contexto efectiva tras el fine-tune ni la cobertura lingüística, lo que impide garantizar su comportamiento en castellano u otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B debe verificarse por separado para confirmar que su licencia es compatible y que no impone restricciones adicionales.
- Modelo con 0 descargas y 0 likes: sin validación comunitaria, sin issues resueltos y sin garantía de mantenimiento.
- Dependencia de la capa de respuesta congelada del chasis `d3-lite`: usarlo fuera de ese ecosistema puede degradar su comportamiento previsto, ya que el entrenamiento se realizó a través de esa capa.
- Advertencia de producción: no recomendable como componente crítico sin una evaluación propia sobre el dominio objetivo y sin comparación contra el modelo padre.

## Enlaces

- Hugging Face: https://huggingface.co/Samonte/zils-lite-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Revisión del padre: `2fc06364715b967f1860aea9cf38778875588b17`
- Bittensor subred 127: no disponible enlace directo en la información proporcionada
- Papers, blogs, repos o demos adicionales: no disponibles en la información proporcionada
