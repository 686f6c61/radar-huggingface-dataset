# aayush1306/creatium-llm-coach

## Resumen

Creatium-llm-coach es un ajuste fino (finetune) del modelo base unsloth/Qwen3.5-9B, publicado por el usuario aayush1306 en HuggingFace bajo licencia Apache 2.0. Se trata de un modelo de 9.653.104.368 parámetros (unos 9,65 mil millones) con pipeline declarado de image-text-to-text, lo que indica que hereda capacidad multimodal de entrada (imagen y texto) del modelo base, aunque la ficha no documenta el alcance real de dicha capacidad ni el encoder de visión empleado.

El modelo se entrenó con la librería Unsloth y TRL, según indica el propio autor, con una mejora declarada de velocidad de entrenamiento de 2x. El repositorio ocupa 19,3 GB y contiene pesos en safetensors, lo que es coherente con un almacenamiento en bf16 para ese número de parámetros. El único idioma declarado es el inglés.

Su relevancia práctica es limitada por el momento: el repositorio no incluye datos de evaluación, no describe el dataset de ajuste ni el procedimiento (no se menciona RLHF, DPO ni SFT supervisado con detalle), y acumula 0 descargas y 0 "likes", por lo que no existe validación externa de su calidad. Debe considerarse un experimento de ajuste fino orientado a uso conversacional (el nombre sugiere un asistente tipo "coach"), no un modelo listo para producción sin evaluación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; etiquetada como familia qwen3_5, transformer multimodal (pipeline image-text-to-text) |
| Parámetros totales | 9.653.104.368 (≈9,65 mil millones) |
| Parámetros activos | No aplica / no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio publica pesos en safetensors (precisión bf16, ~19,3 GB) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modalidad | image-text-to-text (entrada de imagen y texto, salida de texto) |
| Modelo base | unsloth/Qwen3.5-9B (finetune) |
| Tamaño del repositorio | 19,3 GB |
| Versión de Transformers | No disponible (etiqueta transformers) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3_5` y del pipeline `image-text-to-text`. No se especifica si emplea atención completa, atención lineal, mezcla de expertos (MoE) o algún esquema híbrido, ni el número de capas, cabezas de atención o dimensión oculta. Tampoco se documenta la longitud de contexto nativa ni si se aplicó alguna técnica de extensión de contexto durante el ajuste.

El entrenamiento descrito consiste en un finetune del modelo unsloth/Qwen3.5-9B realizado con Unsloth y la librería TRL de HuggingFace, con una mejora declarada de velocidad de 2x respecto a un entrenamiento convencional. No se indica el número de tokens de entrenamiento, la composición del dataset, el número de épocas, la tasa de aprendizaje ni si se aplicaron fases de RLHF, DPO o preferencias. La model card se limita a la plantilla estándar de Unsloth para modelos subidos tras un ajuste, sin resultados de evaluación asociados.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como `conversational` y `text-generation-inference`, orientado a diálogo multi-turno.
- Entrada multimodal: el pipeline declarado es `image-text-to-text`, por lo que acepta imágenes junto con instrucciones de texto. No se documenta qué tareas de visión soporta (descripción, VQA, OCR) ni su fiabilidad.
- Ajuste específico de dominio: el nombre del modelo sugiere un ajuste orientado a funciones de acompañamiento o entrenamiento personal ("coach"), aunque no se detalla el dataset utilizado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma (`en`); no se declaran otros idiomas.
- Capacidades de audio o vídeo: no disponibles.

## Casos de uso

- Asistente conversacional de entrenamiento personal: dado el nombre del modelo, su uso más directo es el de un coach conversacional que mantenga diálogos de seguimiento con el usuario. Es adecuado porque el ajuste se ha orientado a ese dominio, aunque sin evaluación publicada no puede garantizarse la calidad de las respuestas.
- Atención al cliente en inglés: el modelo puede gestionar conversaciones multi-turno en inglés con entradas de texto. No se recomienda desplegarlo en este escenario sin antes medir la tasa de alucinación y el cumplimiento de políticas, dado que no hay benchmarks publicados.
- Tutoría con material visual: gracias al pipeline image-text-to-text, puede recibir una captura de un ejercicio o un diagrama y generar explicaciones de texto. La ficha no documenta la resolución de imagen soportada ni la precisión en tareas de OCR.
- Prototipado rápido con Text Generation Inference: la etiqueta `endpoints_compatible` y `text-generation-inference` permiten desplegarlo en un endpoint compatible con TGI para pruebas internas de producto.
- Punto de partida para nuevos ajustes: al ser un modelo de 9,65 B con licencia Apache 2.0 y formato safetensors, sirve como base para experimentos de fine-tuning adicionales con Unsloth o TRL.
- Investigación sobre ajuste eficiente: útil como caso de estudio de un pipeline Unsloth + TRL sobre un modelo multimodal de 9 B, para comparar metodologías de entrenamiento.
- Generación de texto asistida en inglés para tareas administrativas o de redacción, siempre con revisión humana, dado que no existe validación de calidad publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento de parámetros (9,65 mil millones), no datos medidos publicados por el autor:

- VRAM para pesos en bf16/fp16: aproximadamente 19,3 GB solo para pesos, más memoria para caché KV y activaciones; en la práctica requiere del orden de 24 GB o más.
- VRAM con cuantización de 8 bits: aproximadamente 10-11 GB para pesos.
- VRAM con cuantización de 4 bits: aproximadamente 6-7 GB para pesos.
- GPU de centro de datos: A100 40 GB, L40S 48 GB o H100 son suficientes para inferencia en bf16. En GPUs de 24 GB (RTX 3090, RTX 4090) el modelo en bf16 entra con poco margen y depende de la longitud de secuencia; con cuantización de 8 o 4 bits es holgado.
- GPU de consumo: cabe en una RTX 4090 o RTX 3090 con cuantización, y en tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070) con cuantización de 4 bits, asumiendo que exista una build compatible.
- Memoria adicional para visión: al ser un modelo image-text-to-text, hay que reservar VRAM extra para el encoder de imagen; el autor no documenta cuánta.
- Opciones de despliegue: transformers (librería declarada), Text Generation Inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM (compatible con pesos safetensors estándar, aunque no está confirmado por el autor). llama.cpp y Ollama solo serían viables si se generan cuantizaciones GGUF, que no se publican en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| creatium-llm-coach | 9,65 B | No disponible | Apache 2.0 | HuggingFace, 0 descargas |
| unsloth/Qwen3.5-9B (base) | No disponible | No disponible | No disponible | HuggingFace |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos verificables (parámetros, contexto, benchmarks o licencia) de otros modelos comparables de aproximadamente 9 B, por lo que no se puede establecer una comparación cuantitativa fiable. La única comparación defendible es contra el modelo base, del que se sabe que comparte el recuento de parámetros del ajuste (9,65 B) y del que este modelo es un finetune directo.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. El dataset de ajuste no está documentado, por lo que no puede evaluarse qué sesgos se han introducido o amplificado durante el finetune.
- Riesgo de alucinación: no cuantificado. No hay benchmarks ni evaluaciones publicadas, así que se desconoce la tasa de error en tareas factuales.
- Idioma: únicamente inglés según la etiqueta de la model card. El rendimiento en castellano u otros idiomas no está garantizado y probablemente sea degradado.
- Contexto limitado a un valor no declarado: al no documentarse la longitud de contexto, no debe asumirse ninguna ventana concreta en producción.
- Ausencia de validación externa: 0 descargas y 0 "likes" en el momento de redactar esta ficha; no existe retroalimentación de la comunidad ni informes independientes.
- Licencia: el modelo se publica como Apache 2.0, pero conviene verificar la licencia aplicable al modelo base (unsloth/Qwen3.5-9B) antes de un uso comercial, ya que las obligaciones del modelo derivado pueden depender de las del original.
- Uso en producción: no recomendado sin una evaluación previa propia (calidad de respuesta, alucinación, sesgos, seguridad) y sin pruebas de carga para dimensionar la VRAM real con entradas multimodales.
- Capacidades multimodales no documentadas: aunque el pipeline declarado es image-text-to-text, no se especifica el tipo de imágenes admitidas, la resolución, ni el comportamiento del modelo cuando la imagen no es relevante.
- Posible inconsistencia de metadatos: la model card es una plantilla genérica de Unsloth sin información sobre el propósito del ajuste, lo que dificulta auditar su comportamiento esperado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aayush1306/creatium-llm-coach
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de HuggingFace: https://github.com/huggingface/trl
- Búsqueda web realizada: los resultados obtenidos no guardan relación con el modelo (consultas sobre la hora local en Seattle, Estados Unidos), por lo que no aportan enlaces relevantes.
