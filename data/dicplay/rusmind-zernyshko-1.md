# DICPlay/RusMind-Zernyshko-1

## Resumen

RusMind Zernyshko 1 es un modelo de lenguaje de generación de texto en ruso desarrollado por DICPlay, presentado como la variante más pequeña de la familia RusMind. Se trata de un modelo entrenado desde cero (from-scratch), con 35,46 millones de parámetros y una arquitectura propia identificada como "RusMind AI" que requiere `trust_remote_code=True` para cargarse en Transformers. Su tamaño de repositorio es de aproximadamente 0,1 GB y el autor indica un peso de unos 70 MB, lo que lo sitúa en la categoría de modelos extremadamente ligeros.

El modelo está especializado en conversación en ruso y emplea el formato de diálogo ChatML, con una longitud de contexto de 1024 tokens. Su propuesta de valor es la ejecución totalmente offline en hardware muy limitado; la model card menciona de forma deliberadamente exagerada su funcionamiento en dispositivos como un Nokia N95 o un frigorífico inteligente. Está pensado para uso personal, no comercial, investigación y evaluación.

Es relevante ahora por su enfoque de entrenamiento desde cero en ruso y por su licencia restrictiva para uso comercial, que exige contrato escrito con DICPlay. No obstante, la información pública disponible es escasa: no se detallan datos de entrenamiento, benchmarks ni composición del dataset, y las descargas registradas son 295 con cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer propia "RusMind AI" (custom_code, requiere `trust_remote_code=True`); 8 capas × 512 |
| Parametros totales | 35.463.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; existe variante GGUF en repositorio separado |
| Idiomas soportados | Ruso (ru) |
| Licencia | RusMind License (DICPlay); uso personal, no comercial, investigación y evaluación gratuitos; uso comercial solo con contrato escrito |
| Formato de pesos | safetensors (transformers); GGUF en repositorio aparte |

## Arquitectura y entrenamiento

La arquitectura es un transformer propio denominado RusMind AI, con 8 capas y dimensión de modelo de 512, lo que da lugar a los 35,46 millones de parámetros totales. El autor indica que el modelo fue entrenado completamente desde cero, sin partir de un modelo base preexistente. No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

El modelo utiliza el formato de conversación ChatML y una ventana de contexto de 1024 tokens. La carga requiere código remoto propio, lo que implica que la implementación de la arquitectura no está incluida en las librerías estándar de Transformers. No se han detallado innovaciones técnicas adicionales como decodificación especulativa, atención lineal u otras optimizaciones.

## Capacidades

- Generación de texto conversacional en ruso.
- Soporte de diálogo multi-turno mediante plantilla ChatML.
- Ejecución totalmente offline en hardware de muy bajos recursos.
- Despliegue en entornos ligeros mediante GGUF (LM Studio, Ollama, llama.cpp).
- Capacidad multilingüe limitada al ruso según la etiqueta de idioma del modelo.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Asistentes conversacionales en ruso para dispositivos embebidos: el modelo, con 35 millones de parámetros y contexto de 1024 tokens, puede ejecutarse en microcontroladores o hardware de gama muy baja para respuestas conversacionales breves.
- Prototipado e investigación en entrenamiento desde cero: sirve como base de experimentación para estudiar arquitecturas transformer pequeñas entrenadas en ruso sin depender de modelos preentrenados.
- Aplicaciones educativas de demostración: permite ilustrar el funcionamiento de un modelo de lenguaje en entornos con recursos mínimos, con despliegue offline y sin coste de infraestructura.
- Integración en herramientas de escritorio mediante GGUF: puede cargarse en LM Studio, Ollama o llama.cpp para asistentes locales en ruso sin conexión a internet.
- Evaluación de licencias y despliegue corporativo: su licencia restrictiva lo hace útil como caso de estudio para equipos que analizan condiciones de uso comercial de modelos open source.
- Chatbots de bajo consumo en entornos con restricciones de energía o conectividad: al ejecutarse offline y con un peso de unos 70 MB, es viable en escenarios de campo o dispositivos aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 35,46 millones de parámetros, la inferencia en fp32 requiere aproximadamente 140 MB de pesos, y menos de 100 MB en cuantizaciones de 8 o 4 bits, además de la memoria para el contexto de 1024 tokens.
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU. Cualquier GPU consumer moderna (por ejemplo, RTX 4090) es sobradamente suficiente, y también tarjetas de gama baja o iGPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer e incluso en CPU y dispositivos embebidos.
- Opciones de despliegue: Transformers con `trust_remote_code=True`; GGUF mediante llama.cpp, Ollama y LM Studio. No se documenta soporte de vLLM ni TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RusMind Zernyshko 1 | 35,46 M | 1024 | Ruso | RusMind License (restrictiva para uso comercial) | Hugging Face, GGUF |
| RusMind Zernyshko 1.6 | no disponible | no disponible | Ruso | no disponible | Hugging Face (referenciado por el autor) |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse desde cero y con información escasa sobre el dataset, no puede descartarse la presencia de sesgos propios de los datos utilizados.
- Riesgo de alucinación: alto en un modelo de 35 millones de parámetros y contexto de 1024 tokens, especialmente en preguntas factuales o conversaciones largas.
- Limitaciones de contexto e idioma: ventana de solo 1024 tokens y soporte exclusivo del ruso; no se garantiza un rendimiento adecuado en otros idiomas.
- Restricciones de licencia: el uso comercial, la reventa, la distribución de versiones modificadas y la integración en productos requieren contrato escrito con DICPlay; el uso gratuito se limita a fines personales, no comerciales, de investigación y evaluación.
- Caveats para producción: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; la información pública sobre entrenamiento y evaluación es muy limitada, y el modelo se ofrece "tal cual" sin garantías.
- El tamaño reducido limita su calidad frente a modelos mayores; el propio autor remite a RusMind Zernyshko 1.6 para obtener más calidad con un tamaño similar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-Zernyshko-1
- Variante GGUF: https://huggingface.co/DICPlay/RusMind-Zernyshko-1-GGUF
- Versión 1.6: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.6
- Contacto del autor (Telegram): https://t.me/DanKirillin
- Contacto del autor (MAX): https://max.ru/u/f9LHodD0cOIENg5eShucR-RyhC02ijx-XXjPGcPbjBRy6_KKvmdKIu9tdQU
