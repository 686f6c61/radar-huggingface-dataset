# jafra-io/jafra-z-minicpm5-2b-v3

## Resumen

Jafra Z v3 es un ajuste fino mediante LoRA del modelo `openbmb/MiniCPM5-2B`, desarrollado por el usuario `jafra-io`. El modelo base es un transformer de 2.516.756.480 parámetros (aproximadamente 2,5 mil millones) y este fine-tune se ha entrenado sobre un conjunto de datos propio denominado `jafra-trajectories-v3`, compuesto por 1.639 filas de entrenamiento escritas a mano y 45 de validación. El resultado se distribuye en múltiples formatos: adaptador LoRA, modelo fusionado en bfloat16 y cuantizaciones GGUF para llama.cpp.

El propósito declarado del modelo es alimentar KUSMA (Knowledge-driven Unified Systems Monitoring Assistant) dentro del ecosistema Jafra, lo que sitúa su uso principal en tareas de asistencia, monitorización de sistemas y razonamiento con llamadas a herramientas. La relevancia de esta ficha radica en que documenta un fine-tune de nicho sobre una base pequeña, con un pipeline de entrenamiento reproducible en hardware de consumo (2x Kaggle T4) y con soporte explícito de *tool calling* y modo *thinking*.

La licencia del modelo es Apache 2.0 y la librería de referencia es `transformers`. No se dispone de información sobre el pipeline declarado, los idiomas soportados ni resultados de benchmarks publicados por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base `openbmb/MiniCPM5-2B`); fine-tune mediante LoRA |
| Parámetros totales | 2.516.756.480 (≈2,5 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el entrenamiento usó `MAX_LEN` de 8192) |
| Tipos de cuantización | GGUF: Q2_K, Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; además adaptador LoRA y modelo fusionado en bfloat16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador y modelo fusionado), GGUF (cuantizaciones) |

## Arquitectura y entrenamiento

El modelo es un fine-tune LoRA del transformer `openbmb/MiniCPM5-2B`. El entrenamiento se realizó con QLoRA sobre una base cuantizada en 4 bits nf4, con cómputo en fp32 y adaptadores LoRA también en fp32, ya que las GPU T4 no soportan bfloat16 y el modelo base desborda en fp16. Se empleó entrenamiento paralelo de datos (DDP) sobre 2 GPU Kaggle T4, con una réplica por GPU, batch global de 8, rango LoRA de 16, tasa de aprendizaje de 0,0001 y longitud máxima de secuencia de 8192 tokens. Se completaron 233 de 233 pasos, lo que equivale a aproximadamente 1,14 épocas sobre el conjunto de entrenamiento (con techo de 2 épocas y un planificador que ajusta los pasos al presupuesto de tiempo).

El conjunto de datos `jafra-trajectories-v3` contiene 1.639 filas de entrenamiento escritas a mano y 45 de validación, con pérdida calculada únicamente sobre las respuestas del asistente, incluyendo los bloques `<think>` y las llamadas a herramientas. Según el autor, a `MAX_LEN` 8192 no se truncó ninguna fila tras su último turno completo del asistente y no se descartó ninguna fila (100,0 % de los tokens supervisados conservados). Las llamadas a herramientas siguen el formato XML propio de MiniCPM5 (`<function name="x"><param name="y">v</param></function>`), no el formato de Qwen. El autor recomienda servir el modelo con el razonamiento activado (`enable_thinking=True`).

## Capacidades

- Generación de texto conversacional en formato multi-turno.
- Razonamiento explícito mediante bloques `<think>` (modo *thinking*), activable en la configuración del servidor.
- Llamadas a herramientas (*tool calling* / *function calling*) en formato XML de MiniCPM5.
- Razonamiento multi-paso orientado a agentes, derivado del entrenamiento sobre trayectorias.
- Asistencia en monitorización de sistemas, según el caso de uso declarado (KUSMA).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión, audio u otras modalidades: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia en monitorización de sistemas (KUSMA): el modelo se ha entrenado específicamente sobre trayectorias de este asistente, por lo que puede interpretar consultas operativas y emitir llamadas a herramientas de diagnóstico en el formato XML esperado.
- Automatización de agentes con *tool calling*: al soportar el esquema `<function name="..."><param name="...">...</param></function>`, puede integrarse en orquestadores que expongan herramientas externas (APIs, consultas a bases de datos, comandos de sistema) y encadenar varias llamadas en un mismo turno.
- Razonamiento con traza explícita: el modo *thinking* permite obtener la cadena de razonamiento antes de la respuesta final, útil para depuración de agentes y para auditoría de decisiones en producción.
- Despliegue en hardware de consumo: con cuantizaciones GGUF desde Q2_K hasta Q8_0, puede ejecutarse en estaciones de trabajo sin GPU dedicada de gama alta mediante llama.cpp u Ollama, lo que facilita prototipado local.
- Generación de respuestas conversacionales de dominio acotado: el ajuste sobre 1.639 filas manuscritas lo hace adecuado para asistentes verticales con vocabulario y flujos específicos, donde un modelo generalista requeriría prompts más largos.
- Integración en pipelines de CI/CD para pruebas de agentes: al ser un modelo pequeño (≈2,5 B) y con licencia Apache 2.0, puede desplegarse como servicio de pruebas para validar formatos de *tool calling* y flujos multi-paso antes de pasar a modelos mayores.
- Experimentación e investigación en fine-tuning: la publicación conjunta de adaptador, modelo fusionado, cuantizaciones y checkpoint reanudable permite reproducir y extender el entrenamiento con QLoRA en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M, en torno a 1,5–2 GB de pesos más overhead de contexto; en Q8_0, aproximadamente 2,5–3 GB; en bfloat16, unos 5 GB solo para pesos.
- GPU recomendadas: el entrenamiento se realizó en 2x NVIDIA T4 (16 GB cada una). Para inferencia, cualquier GPU con al menos 4–6 GB de VRAM es suficiente en cuantizaciones Q4/Q5; una RTX 3060, RTX 4060 o superiores permiten servir el modelo con comodidad.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones GGUF publicadas, incluidas GPUs de gama media y algunas integradas con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (adaptador LoRA o modelo fusionado), llama.cpp (verificado por el autor: carga GGUF correcta), Ollama, y servidores compatibles con endpoints (el repositorio incluye la etiqueta `endpoints_compatible`). Para vLLM o TGI no se ha confirmado compatibilidad en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Jafra Z v3 (este modelo) | ≈2,5 B | No disponible (entrenado a 8192) | Apache 2.0 | safetensors, GGUF | Fine-tune LoRA de MiniCPM5-2B con *tool calling* XML y modo *thinking* |
| openbmb/MiniCPM5-2B (base) | ≈2,5 B | No disponible | No disponible en la información | safetensors | Modelo base sin ajuste específico de dominio |
| Qwen2.5-1.5B / 3B (referencia de categoría) | 1,5–3 B | No disponible en la información | Apache 2.0 en la mayoría de variantes | safetensors, GGUF | Formato de *tool calling* distinto (no XML de MiniCPM5) |
| Llama 3.2 1B / 3B (referencia de categoría) | 1–3 B | No disponible en la información | Llama Community License | safetensors, GGUF | Requiere aceptar licencia; no entrenado para el formato XML de MiniCPM5 |

## Limitaciones y advertencias

- El conjunto de entrenamiento es muy reducido (1.639 filas), lo que aumenta el riesgo de sobreajuste al dominio Jafra/KUSMA y de degradación en tareas generales.
- El formato de *tool calling* es específico de MiniCPM5 (XML), no el de Qwen ni el de OpenAI; los orquestadores deben adaptarse a este esquema.
- El autor indica que el modelo debe servirse con `enable_thinking=True`; desactivar el razonamiento puede degradar la calidad de las llamadas a herramientas.
- No se han publicado evaluaciones de sesgo, alucinación ni robustez; se recomienda validación propia antes de uso en producción.
- No hay información sobre idiomas soportados; el entrenamiento se realizó presumiblemente en el idioma del dataset, no especificado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base (`openbmb/MiniCPM5-2B`) puede tener condiciones adicionales que deben verificarse en su repositorio original.
- El repositorio ocupa 28,7 GB, lo que incluye adaptador, modelo fusionado, cuantizaciones y checkpoint; conviene descargar solo los artefactos necesarios.
- El modelo se creó en noviembre de 2026 y no registra descargas ni interacciones; no hay evidencia de uso en producción por parte de terceros.

## Enlaces

- Hugging Face: https://huggingface.co/jafra-io/jafra-z-minicpm5-2b-v3
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
