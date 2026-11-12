# bartowski/fastino_GLiDE-9B-GGUF

## Resumen

GLiDE-9B es un modelo de lenguaje de aproximadamente 8.950 millones de parámetros (8,95 B), desarrollado por Fastino y distribuido en formato GGUF por bartowski. Aunque la pipeline declarada es `text-generation`, el modelo se etiqueta explícitamente como `decision-model` y `classification`, lo que indica que está orientado a tareas de toma de decisiones estructuradas y clasificación, además de generación de texto conversacional. Esta ficha documenta la versión cuantizada publicada por bartowski, derivada del checkpoint original `fastino/GLiDE-9B`.

La relevancia de esta publicación radica en que ofrece el modelo original en una matriz amplia de cuantizaciones GGUF (desde bf16 hasta IQ4), lo que permite desplegarlo en hardware de consumo y en entornos de inferencia locales mediante llama.cpp y herramientas compatibles. La cuantización se ha generado con llama.cpp b12180 y emplea imatrix, una técnica que mejora la calidad de las cuantizaciones de baja precisión preservando los pesos más sensibles.

No se dispone de información publicada sobre la longitud de contexto, los idiomas soportados ni los datos de entrenamiento del modelo base en la información proporcionada. La licencia es `fastino-community`, una licencia personalizada que conviene revisar antes de cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `fastino/GLiDE-9B`; sin detalles de arquitectura publicados en la información disponible) |
| Parámetros totales | 8.953.803.264 (≈8,95 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_K_S, Q4_0, IQ4 (lista truncada en la información disponible) |
| Idiomas soportados | no disponible |
| Licencia | fastino-community (licencia personalizada; enlace a LICENSE en el repo base) |
| Formato de pesos | GGUF (cuantizaciones); checkpoint original en safetensors según metadatos de parámetros |

## Arquitectura y entrenamiento

No se han publicado en la información disponible detalles sobre la arquitectura interna del modelo base (tipo de transformer, uso de atención lineal, mezcla de expertos u otras innovaciones). El recuento real de parámetros en safetensors es de 8.953.803.264, coherente con la denominación comercial de 9B. La model card de la versión cuantizada indica soporte de entrada únicamente de texto y ausencia de decodificación especulativa.

El proceso de cuantización sí está documentado: bartowski ha generado los ficheros GGUF con llama.cpp release b12180 y ha aplicado imatrix, lo que implica el uso de una matriz de importancia calculada sobre un corpus de calibración para proteger los pesos más relevantes durante la cuantización. No hay información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto conversacional con formato de chat basado en tokens especiales estilo ChatML (`<|im_start|>`, `<|im_end|>`).
- Modo de razonamiento explícito: el prompt por defecto activa un bloque `<think>` con un nivel de esfuerzo de razonamiento configurable ("Reasoning effort is set to xhigh"), lo que sugiere soporte de cadenas de pensamiento antes de la respuesta final.
- Clasificación y toma de decisiones: el modelo se etiqueta como `decision-model` y `classification`, por lo que está diseñado para tareas de decisión estructurada además de la generación libre.
- Soporte de tool calling / function calling: la model card documenta un formato XML específico con etiquetas `<tool_call>`, `<function=...>` y `<parameter=...>`, incluyendo definiciones de herramientas en JSON dentro del bloque `<tools>`.
- Razonamiento multi-paso: el formato de prompt permite razonamiento en lenguaje natural antes de la llamada a función, pero no después.
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponibles (entrada solo de texto).

## Casos de uso

- Enrutamiento y clasificación de tickets de soporte: el modelo puede recibir un texto de incidencia y devolver una categoría o decisión estructurada, aprovechando su etiqueta de `classification` y su modo de razonamiento para justificar la decisión antes de emitirla.
- Automatización de decisiones en pipelines de negocio: con el formato de tool calling documentado, se puede integrar en flujos donde el modelo decida qué función invocar (por ejemplo, consultar un precio de acción mediante `get_stock_price`) y con qué parámetros.
- Asistentes conversacionales con razonamiento previo: el bloque `<think>` permite generar una traza de razonamiento antes de la respuesta final, útil en atención al cliente donde se requiere consistencia y explicabilidad.
- Agentes de múltiples pasos en local: al distribuirse en GGUF, puede ejecutarse con llama.cpp u Ollama en estaciones de trabajo sin GPU dedicada, sirviendo como motor de decisión en agentes que no pueden enviar datos a la nube.
- Prototipado y evaluación de modelos de decisión: la disponibilidad de cuantizaciones desde bf16 hasta IQ4 permite comparar el impacto de la precisión en la calidad de las decisiones antes de fijar una configuración de producción.
- Despliegue en entornos con requisitos de privacidad: al poder ejecutarse íntegramente en local con llama.cpp, es adecuado para clasificación de documentos sensibles sin salida de datos a servicios externos.
- Integración en herramientas de desarrollo: el formato ChatML y el soporte de tool calling permiten conectarlo a frameworks de agentes compatibles con plantillas de chat personalizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de fichero GGUF):
  - bf16: 17,92 GB.
  - Q8_0: 9,55 GB.
  - Q6_K_L / Q6_K / Q6_K_S: 8,11 GB / 7,79 GB / 7,51 GB.
  - Q5_K_M / Q5_K_S: 6,88 GB / 6,50 GB.
  - Q4_K_L / Q4_1 / Q4_K_M / IQ4_NL / Q4_K_S / Q4_0: 6,20 GB / 5,94 GB / 5,84 GB / 5,83 GB / 5,48 GB / 5,48 GB.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, las cuantizaciones Q4 y Q5 encajan en GPUs de consumo con 8 GB o más de VRAM; las Q6 y Q8 requieren 10-12 GB o más; bf16 requiere al menos 20 GB.
- ¿Cabe en GPU de consumo? Sí: Q4_K_M (5,84 GB) y Q5_K_M (6,88 GB) caben en tarjetas de 8 GB como la RTX 3060 Ti o la RTX 4060; Q6_K y Q8_0 caben en tarjetas de 12 GB como la RTX 3060 de 12 GB o la RTX 4070.
- Opciones de despliegue: llama.cpp (versión de referencia b12180), y por compatibilidad de formato GGUF, herramientas derivadas como Ollama o servidores compatibles con llama.cpp. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de modelos comparables en la información proporcionada. La siguiente tabla recoge únicamente los datos verificables del modelo frente a referencias genéricas de la misma categoría, marcando como no disponible lo que no se conoce.

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| GLiDE-9B (esta ficha) | 8,95 B | no disponible | fastino-community | GGUF, safetensors | no disponible |
| Alternativa de ~8-9 B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia `fastino-community` es una licencia personalizada: es imprescindible revisar el fichero LICENSE del repositorio base antes de cualquier uso comercial o redistribución.
- No se han publicado datos sobre sesgos, comportamiento en idiomas distintos del inglés ni tasas de alucinación; deben evaluarse empíricamente antes de producción.
- La longitud de contexto no está documentada, lo que impide planificar cargas de contexto largo con garantías.
- El formato de tool calling es específico (XML con `<tool_call>` y `<function=...>`); frameworks que esperan JSON nativo requerirán adaptación de plantilla.
- El bloque `<think>` con esfuerzo "xhigh" incrementa el número de tokens generados y, por tanto, la latencia; conviene ajustar el nivel de razonamiento según la tarea.
- Las cuantizaciones de baja precisión (Q4_0, Q4_1, IQ4) pueden degradar la calidad en tareas de decisión sensibles; para producción se recomienda Q5_K_M o superior.
- El repositorio de la cuantización registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de validación.
- El tamaño total del repo (138,1 GB) implica descargas voluminosas si se quieren todas las variantes; conviene descargar solo el fichero GGUF necesario.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/bartowski/fastino_GLiDE-9B-GGUF
- Modelo base original: https://huggingface.co/fastino/GLiDE-9B
- Licencia del modelo base: https://huggingface.co/fastino/GLiDE-9B/blob/main/LICENSE
- llama.cpp (release b12180): https://github.com/ggml-org/llama.cpp/releases/tag/b12180
- Cuantización recomendada Q4_K_M: https://huggingface.co/bartowski/fastino_GLiDE-9B-GGUF/blob/main/fastino_GLiDE-9B-Q4_K_M.gguf
