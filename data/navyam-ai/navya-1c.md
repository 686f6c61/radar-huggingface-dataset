# navyam-ai/navya-1c

## Resumen

Navya-1C es un modelo de lenguaje de tipo decoder-only con 1.306.634.240 parámetros (1,31B), desarrollado por Navyam AI (Bachatt) y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un modelo base entrenado desde cero sobre un corpus centrado en India, que combina finanzas, inglés, hindi/hinglish y otros idiomas indios. El modelo emplea un tokenizador personalizado de 64.000 tokens y fue entrenado con aproximadamente 103.000 millones de tokens en ocho GPUs H100, utilizando una estrategia de calentamiento estable y decaimiento (WSD).

El objetivo declarado por el autor es servir como modelo de investigación para preguntas y respuestas sobre finanzas personales en India. Sin embargo, el modelo no está alineado mediante RLHF ni otras técnicas de ajuste posterior, y no se han publicado resultados de benchmarks en la información disponible. Por ello, su evaluación práctica debe realizarse con cautela.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Grouped Query Attention (GQA), 26 capas, dimensión del modelo 2048 |
| Parametros totales | 1.306.634.240 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés, hindi (y otros idiomas indios según la documentación) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Navya-1C es un Transformer decoder-only construido desde cero. Emplea Grouped Query Attention con 16 cabezas de consulta y 4 cabezas de clave-valor, lo que reduce la memoria necesaria para la caché KV. El modelo tiene 26 capas y una dimensión de representación de 2048. No utiliza mezcla de expertos (MoE), ni arquitecturas de estado sólido (SSM), ni mecanismos de atención lineales.

El entrenamiento se realizó sobre aproximadamente 103.000 millones de tokens de un corpus específicamente diseñado para India, con predominio de textos financieros, inglés, hindi/hinglish y otros idiomas indios. Se utilizó una programación de tasa de aprendizaje WSD (warmup-stable-decay) y el entrenamiento se ejecutó en 8 GPUs H100, entre agosto y septiembre de 2026 según la documentación. No se menciona el uso de RLHF, DPO ni supervisión posterior; es un modelo base sin alineación.

## Capacidades

- Generación de texto en inglés e hindi sobre dominios financieros, con un tokenizador de 64.000 tokens optimizado para vocabulario financiero indio.
- Comprensión de terminología específica de finanzas personales en India, como préstamos, inversiones, impuestos, seguros y productos bancarios.
- Compatibilidad declarada con text-generation-inference y endpoints de HuggingFace, según las etiquetas del repositorio.
- Integración sencilla mediante la biblioteca transformers, tal como se muestra en la model card.
- No se documenta soporte para tool calling, function calling, visión, audio ni modo de razonamiento extendido (thinking mode).
- Las capacidades de agentes o de razonamiento multi-paso no están descritas en la documentación disponible.

## Casos de uso

- Asistente virtual para banca personal: puede integrarse en un sistema de chat para atender consultas sobre saldos, transferencias, tarjetas y productos de ahorro en inglés o hindi. Es adecuado por su entrenamiento específico en finanzas indias y su tokenizador multilingüe.
- Educación financiera para usuarios indios: apto para generar explicaciones didácticas sobre conceptos como interés compuesto, inflación, fondos de inversión y planificación de la jubilación, adaptadas al contexto cultural y normativo de India.
- Sistemas de recuperación aumentada (RAG) sobre normativa financiera india: puede usarse como motor de generación sobre documentos de instituciones como RBI, SEBI o IRDAI, donde el conocimiento se introduce vía contexto recuperado.
- Análisis de opiniones en redes sociales: útil para clasificar o resumir comentarios en inglés y hindi relacionados con productos financieros, permitiendo detectar quejas o tendencias de consumo.
- Resumen de informes de análisis de acciones: puede condensar memorias anuales, noticias económicas o informes de broker en resúmenes breves y accesibles para analistas y gestores.
- Chatbots de soporte interno en entidades financieras: puede asistir a empleados en consultas sobre políticas internas, procesos operativos o productos disponibles, trabajando en ambos idiomas de la plantilla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Estimación de VRAM con pesos en FP16: aproximadamente 2,61 GB para los parámetros, más la caché KV y la sobrecarga de ejecución; se recomienda al menos 4-6 GB de VRAM para inferencia local.
- Con una cuantización de 4 bits (si se aplica mediante herramientas como llama.cpp), la carga de pesos se reduciría a aproximadamente 0,65 GB, lo que permitiría ejecutarse en GPUs de 2 GB.
- GPU recomendadas: RTX 3060 12GB, RTX 4060 8GB, RTX 4090, A10G, A100 o H100.
- En CPU es viable con 4-8 GB de RAM utilizando cuantización, mediante llama.cpp u otras herramientas similares.
- Opciones de despliegue: transformers, vLLM, text-generation-inference (según la etiqueta del repositorio), llama.cpp y Ollama.
- Latencia y throughput: no disponible.

Estas cifras son estimaciones basadas en el recuento de parámetros; no hay datos oficiales del autor.

## Comparativa con modelos similares

La siguiente tabla compara especificaciones con dos modelos de tamaño similar. No hay datos de rendimiento disponibles para navya-1c, por lo que la comparación se limita a características técnicas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| navya-1c | 1.306.634.240 | No disponible | Apache-2.0 | HuggingFace | No disponible |
| TinyLlama-1.1B | 1.100.000.000 | 2.048 (original) | Apache-2.0 | HuggingFace | No disponible |
| Qwen2.5-1.5B | 1.540.000.000 | 32.768 | Apache-2.0 | HuggingFace | No disponible |

## Limitaciones y advertencias

- Modelo base sin alineación (no RLHF ni DPO), por lo que es propenso a generar contenido innecesario, sesgado o inexacto.
- Riesgo elevado de alucinación en temas financieros; no debe utilizarse como consejo de inversión, tal como advierte el autor en la model card.
- No se dispone de benchmarks públicos, lo que impide validar su calidad frente a otros modelos o medir su rendimiento en tareas concretas.
- La licencia Apache-2.0 permite uso comercial, pero las condiciones de los datos de entrenamiento no están especificadas; podrían existir restricciones no documentadas.
- El corpus centrado en India puede introducir sesgos culturales, económicos y lingüísticos específicos de ese país.
- La longitud de contexto no está documentada, lo que limita su uso en tareas que requieran procesar textos largos.
- El tokenizador de 64.000 tokens puede aumentar el coste computacional en comparación con tokenizadores más compactos, especialmente en tareas con mucho texto.

## Enlaces

- HuggingFace: https://huggingface.co/navyam-ai/navya-1c
- Repositorio de código: https://github.com/bachatt-app/navyam-gpt
