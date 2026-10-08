# OpenFlowLM/LFM2-2.6B-NPU2

## Resumen

OpenFlowLM/LFM2-2.6B-NPU2 es un checkpoint derivado (finetune) del modelo LiquidAI/LFM2-2.6B, publicado por el usuario OpenFlowLM bajo licencia lfm1.0. Por el sufijo "NPU2" y la etiqueta `edge`, todo apunta a una variante orientada a inferencia en unidades de procesamiento neuronal (NPU), pero la ficha del repositorio no aporta documentación propia que confirme el objetivo, el proceso de ajuste ni los datos utilizados.

El modelo base, LFM2-2.6B, forma parte de la segunda generación de Liquid Foundation Models de Liquid AI, construida sobre una arquitectura híbrida (bloques convolucionales y de atención) y optimizada para despliegue en dispositivos de consumo como teléfonos y portátiles. El propio autor del modelo base declara mejoras de hasta un 200 % en velocidad de decodificación y prefill frente a Qwen3 y Gemma 3 en CPU, así como un buen comportamiento en seguimiento de instrucciones y function calling.

La relevancia de este checkpoint concreto es limitada: registra 0 descargas y 0 "likes" en el momento de la consulta, carece de model card descriptiva y su licencia restringe el uso comercial. Además, el contenido de model card asociado en la información disponible corresponde a otro modelo distinto (LFM2-2.6B-Transcript, especializado en resumen de reuniones), por lo que no debe tomarse como especificación de este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (convolucional + atención), familia LFM2; no confirmada explícitamente para este checkpoint |
| Parametros totales | 2,6 mil millones (deducido del nombre del modelo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible; el repositorio ocupa 1,9 GB, lo que sugiere pesos comprimidos, pero no se especifica el formato |
| Idiomas soportados | inglés (`en`) |
| Licencia | lfm1.0 (LFM Open License v1.0, etiquetada como `other`) |
| Formato de pesos | safetensors (repositorio cargado con la librería `transformers`); no confirmado explícitamente |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de la familia LFM2 de Liquid AI, descrita por el autor como híbrida y etiquetada con los términos `liquid` y `lfm2`. No se dispone de información específica sobre el número de capas, la distribución entre bloques convolucionales y de atención, la dimensión oculta ni el mecanismo de atención exacto de este checkpoint. Tampoco se documenta si el ajuste realizado por OpenFlowLM consistió en un finetune supervisado, una destilación o una conversión a un formato ejecutable en NPU.

En cuanto a los datos de entrenamiento, no hay información disponible sobre el número de tokens, la composición del dataset ni la existencia de fases de RLHF, DPO o similares para este repositorio. Para el modelo base LFM2-2.6B, la documentación pública de Liquid AI menciona optimización para chat, razonamiento y tool calling, pero no se proporcionan cifras concretas de entrenamiento en la información recuperada.

## Capacidades

- Generación de texto conversacional, heredada del modelo base LFM2-2.6B.
- Razonamiento y seguimiento de instrucciones, según las capacidades declaradas para la familia LFM2.
- Soporte de tool calling / function calling en el modelo base (no confirmado para este checkpoint).
- Capacidades multilingües limitadas: los metadatos solo declaran inglés.
- No se documentan capacidades de visión, audio ni modo "thinking" en la información disponible.
- El contenido de model card asociado describe resumen de transcripciones de reuniones, pero corresponde a otro modelo (LFM2-2.6B-Transcript), no a este repositorio.

## Casos de uso

- Inferencia en dispositivos con NPU: dado el sufijo "NPU2" y la etiqueta `edge`, el uso previsto sería ejecutar el modelo en plataformas con acelerador neuronal (teléfonos, portátiles con NPU), aunque no se aporta documentación que lo confirme.
- Asistentes conversacionales locales: al derivar de un modelo de 2,6 mil millones de parámetros optimizado para despliegue en dispositivo, podría emplearse en asistentes de texto sin conexión.
- Automatización de tareas con function calling: si conserva la capacidad de tool calling del modelo base, podría integrarse en flujos de agentes sencillos.
- Prototipado e investigación sobre cuantización y despliegue en NPU: el repositorio podría servir como punto de partida para experimentos de portado a hardware específico.
- Generación de texto en inglés de baja latencia: para tareas de resumen o redacción breve en entornos con recursos limitados.
- Evaluación comparativa de variantes: útil para medir el impacto del ajuste respecto al LFM2-2.6B original.

No se han documentado casos de uso validados ni demostraciones oficiales para este checkpoint concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación del modelo base LFM2-2.6B menciona de forma cualitativa mejoras de velocidad (hasta un 200 % en decodificación y prefill frente a Qwen3 y Gemma 3 en CPU) y mejor rendimiento en seguimiento de instrucciones y function calling, pero no se aportan cifras numéricas que puedan tabularse.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 5,2 GB solo para pesos, más overhead de activaciones y KV cache.
- VRAM estimada en int8: aproximadamente 2,6-3 GB.
- VRAM estimada en int4 (si se dispone de cuantización compatible): aproximadamente 1,5-2 GB.
- El repositorio ocupa 1,9 GB, lo que sugiere que los pesos distribuidos ya están comprimidos, pero no se especifica el esquema de cuantización.
- GPU compatibles con modelos de este tamaño: RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, A10, L4, A100, H100; cabe en GPUs de consumo con al menos 4-6 GB de VRAM en cuantización reducida.
- Despliegue: la librería declarada es `transformers`; para el modelo base se mencionan vLLM y formatos GGUF, ONNX y MLX en repositorios hermanos, aunque no se confirman para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| OpenFlowLM/LFM2-2.6B-NPU2 | 2,6 B | no disponible | lfm1.0 | 0 descargas | Finetune sin documentación |
| LiquidAI/LFM2-2.6B | 2,6 B | no disponible en la información | lfm1.0 | Modelo base oficial | Arquitectura híbrida, orientado a edge |
| LiquidAI/LFM2.5-2.6B | 2,6 B | no disponible | no disponible | Versión más reciente de la familia | Sucesor del LFM2-2.6B |
| LiquidAI/LFM2-2.6B-Transcript | 2,6 B | no disponible | lfm1.0 | Especializado en resumen de reuniones | Variante task-specific del mismo base |

No se dispone de datos de rendimiento cuantitativos para establecer una comparación numérica fiable con Qwen3, Gemma 3 u otros modelos de tamaño similar.

## Limitaciones y advertencias

- El repositorio no incluye una model card propia: toda la información de capacidades, prompts y parámetros de generación disponible corresponde a otro modelo (LFM2-2.6B-Transcript) y no debe extrapolarse a este checkpoint.
- Registra 0 descargas y 0 "likes", por lo que no hay validación comunitaria ni evidencia de uso en producción.
- La licencia lfm1.0 no es una licencia de código abierto estándar; impone condiciones y restricciones al uso comercial. Es imprescindible revisar el fichero LICENSE antes de cualquier despliegue.
- Solo se declara soporte de inglés, lo que limita su uso en castellano u otros idiomas.
- No se especifican la longitud de contexto efectiva ni el esquema de cuantización, lo que dificulta planificar el despliegue.
- Riesgo de alucinación inherente a los modelos de 2,6 B de parámetros; no hay evaluaciones publicadas que lo cuantifiquen.
- Posibles sesgos heredados del modelo base y de los datos de ajuste, no documentados.
- Al ser un finetune no verificado, no hay garantía de que mantenga las capacidades de tool calling o razonamiento del modelo base.
- El sufijo "NPU2" sugiere dependencia de un runtime o hardware concreto, pero no se detalla cuál.

## Enlaces

- Repositorio del modelo: https://huggingface.co/OpenFlowLM/LFM2-2.6B-NPU2
- Modelo base: https://huggingface.co/LiquidAI/LFM2-2.6B
- Versión más reciente de la familia: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Variante experimental: https://huggingface.co/LiquidAI/LFM2-2.6B-Exp
- Variante de resumen de reuniones: https://huggingface.co/LiquidAI/LFM2-2.6B-Transcript
- Blog de LFM2-2.6B: https://www.liquid.ai/blog/introducing-lfm2-2-6b-redefining-efficiency-in-language-models
- Blog de la familia LFM2: https://www.liquid.ai/blog/liquid-foundation-models-v2-our-second-series-of-generative-ai-models
- Documentación de LFM2-2.6B: https://docs.liquid.ai/lfm/models/lfm2-2.6b
- Documentación general de LFM: https://docs.liquid.ai/lfm
- Playground: https://playground.liquid.ai/
- Plataforma LEAP: https://leap.liquid.ai/
