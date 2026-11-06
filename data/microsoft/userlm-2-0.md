# microsoft/UserLM-2.0

## Resumen

UserLM-2.0 es un modelo de lenguaje generativo de 8.030.277.632 parámetros desarrollado por Microsoft Research (Omer Gul, Philippe Laban, Tanya Goyal y Jennifer Neville) y publicado en Hugging Face bajo licencia MIT. A diferencia de los modelos convencionales entrenados para actuar como asistente, UserLM-2.0 se especializa en generar el lado del **usuario** en una conversación usuario-IA, condicionado por una intención de tarea que describe el objetivo de alto nivel del usuario simulado.

El modelo parte del backbone `meta-llama/Llama-3.1-8B-Instruct` y se afina sobre el dataset `allenai/WildChat-4.8M` para tres funciones concretas: generar un turno inicial del usuario a partir de una intención, generar turnos de seguimiento a partir del historial conversacional, y emitir el token de control `<|endconversation|>` cuando determina que el objetivo se ha cumplido. Su relevancia actual radica en la evaluación de asistentes: permite simular usuarios realistas a escala para medir el comportamiento de un asistente antes de exponerlo a usuarios humanos, un cuello de botella clásico en el desarrollo de sistemas conversacionales.

La arquitectura es un transformer causal decoder-only de 8B parámetros, con contexto heredado de Llama 3.1 (128.000 tokens según la familia base) y soporte exclusivo de inglés. El modelo está pensado para investigación, no como producto final de conversación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (Llama 3.1) |
| Parametros totales | 8.030.277.632 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredado de Llama 3.1-8B-Instruct; no confirmado explícitamente en la model card) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 32,1 GB) |

## Arquitectura y entrenamiento

UserLM-2.0 es un fine-tune del Llama-3.1-8B-Instruct, un transformer causal denso de 8B parámetros con atención estándar (no se documentan modificaciones arquitectónicas respecto al backbone). El entrenamiento se realiza sobre `allenai/WildChat-4.8M`, un corpus de conversaciones reales usuario-IA, reformulado para que el modelo aprenda a generar el turno del usuario condicionado a una intención de tarea inyectada en el mensaje de sistema.

La innovación principal no es arquitectónica sino de objetivo de entrenamiento y control: el modelo aprende a (1) iniciar la conversación a partir de una intención, (2) continuar el diálogo tras cada respuesta del asistente y (3) emitir `<|endconversation|>` como señal de terminación cuando el objetivo se satisface. La model card no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; el paper asociado está anunciado como "forthcoming" y aún no dispone de enlace arXiv. El chat template incluido gestiona automáticamente la cabecera de generación con rol de usuario.

## Capacidades

- Generación del turno inicial del usuario a partir de una intención de tarea descrita en el mensaje de sistema.
- Generación de turnos de seguimiento del usuario condicionados al historial completo de la conversación.
- Detección de satisfacción del objetivo y emisión del token de control `<|endconversation|>` para terminar el rollout.
- Simulación multi-turno con coherencia de intención: mantiene el objetivo de la tarea a lo largo de la conversación.
- Generación de lenguaje natural con estilo de usuario (minúsculas, frases cortas, peticiones directas) en el ejemplo proporcionado.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso autónomo: no documentado como tal; el modelo opera dentro de un harness externo que aporta los turnos del asistente.
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales: token de control de fin de conversación; condicionamiento por intención de tarea; modo de muestreo recomendado (temperature=1.0, top_p=0.8).
- No se documentan capacidades de visión, audio ni thinking mode.

## Casos de uso

- **Evaluación automática de asistentes conversacionales**: se define una intención de tarea en el system prompt, UserLM-2.0 genera los turnos del usuario y un harness externo aporta las respuestas del asistente evaluado; el rollout termina cuando el modelo emite `<|endconversation|>`. Permite medir tasas de éxito por tarea sin coste de usuarios humanos.
- **Generación de datos sintéticos multi-turno**: el modelo produce conversaciones etiquetadas por intención que pueden usarse para aumentar datasets de entrenamiento de asistentes o clasificadores de diálogo, con la ventaja de que la intención subyacente es conocida a priori.
- **Pruebas de regresión en pipelines de asistentes**: integrado en CI/CD, se lanzan baterías de intenciones fijas contra cada nueva versión del asistente y se comparan métricas de éxito y longitud de conversación entre versiones.
- **Red teaming y análisis de robustez**: se definen intenciones adversariales (peticiones ambiguas, usuarios insistentes, objetivos que requieren aclaraciones) para observar cómo responde el asistente bajo presión conversacional.
- **Investigación en simulación de usuarios**: estudio académico de la fidelidad de simuladores frente a usuarios reales, comparando la distribución de turnos, longitud y patrones de cierre generados por el modelo con WildChat u otros corpus.
- **Entrenamiento por refuerzo con feedback simulado**: el simulador actúa como entorno para RL de asistentes, donde la recompensa puede derivarse de si el usuario simulado alcanza `<|endconversation|>` y de la calidad del diálogo previo.
- **Validación de flujos de atención al cliente**: se modelan intenciones típicas de soporte (devoluciones, cambios de plan, incidencias) y se mide cuántos turnos necesita el asistente para satisfacer al usuario simulado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el paper acompañante ("Towards User Simulators That Stay on Task and Still Sound Natural") está pendiente de publicación y que la evaluación interna "proporciona evidencia de que UserLM-2.0 produce [simulaciones] más realistas", pero no se incluyen cifras numéricas ni tablas comparativas en la información proporcionada.

## Requisitos de hardware

- **VRAM estimada para inferencia en bf16/fp16**: aproximadamente 16 GB solo para pesos, más overhead de KV cache; en la práctica se recomiendan 20-24 GB para contextos moderados.
- **Cuantización a 8 bits**: ~8-9 GB de pesos; cuantización a 4 bits (GGUF/AWQ/GPTQ): ~4-5 GB, aunque no se documentan cuantizaciones oficiales en el repo.
- **GPU recomendadas**: A100 40/80 GB, H100 80 GB o L40S para producción; RTX 4090 (24 GB) suficiente para bf16 con contexto moderado; RTX 3090 (24 GB) también viable.
- **Consumer GPU**: sí cabe en GPUs de 24 GB en bf16 y en GPUs de 12-16 GB con cuantización a 8 o 4 bits.
- **Opciones de despliegue**: transformers (soporte nativo documentado), text-generation-inference (tag `text-generation-inference` en el repo), endpoints compatibles (`endpoints_compatible`); vLLM, llama.cpp y Ollama no están documentados explícitamente pero son compatibles con el formato Llama.
- **Latencia y throughput**: no disponibles en la información proporcionada; al ser un 8B denso, se espera throughput en el rango típico de Llama-3.1-8B en hardware equivalente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rol simulado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microsoft/UserLM-2.0 | 8,03B | 128k (heredado) | Usuario | MIT | Hugging Face |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128k | Asistente | Llama 3.1 Community | Hugging Face |
| Mistral-7B-Instruct | ~7,2B | 32k | Asistente | Apache 2.0 | Hugging Face |

La comparación directa con otros simuladores de usuario publicados no está disponible en la información proporcionada. Frente a Llama-3.1-8B-Instruct, UserLM-2.0 comparte backbone y tamaño pero invierte el rol generado (usuario en lugar de asistente) y añade el token de control `<|endconversation|>`; frente a Mistral-7B-Instruct, ofrece mayor contexto teórico y licencia MIT más permisiva, a costa de estar especializado en una única tarea.

## Limitaciones y advertencias

- **Idioma**: solo inglés; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- **Especialización estrecha**: no es un asistente; usarlo como modelo conversacional general produciría salidas fuera de distribución.
- **Riesgo de alucinación**: al generar turnos de usuario, puede inventar preferencias, restricciones o detalles no presentes en la intención de tarea, lo que sesga la evaluación del asistente.
- **Dependencia del harness**: la calidad de la simulación depende de que el sistema externo aporte respuestas de asistente realistas y gestione correctamente el token `<|endconversation|>` (que debe tratarse como señal de control, nunca mostrarse en interfaz de usuario).
- **Estocasticidad**: la model card recomienda temperature=1.0 y top_p=0.8; los resultados varían entre ejecuciones, lo que exige múltiples muestras para métricas estables.
- **Sesgos**: al derivar de WildChat-4.8M, puede heredar sesgos demográficos, de estilo y de distribución de tareas presentes en conversaciones reales; no se documenta ninguna mitigación específica.
- **Licencia**: MIT permite uso comercial, pero el modelo base Llama 3.1 arrastra la Llama 3.1 Community License, cuyos términos pueden aplicar en la práctica al uso derivado; conviene revisar la compatibilidad antes de un despliegue comercial.
- **Documentación incompleta**: sin paper publicado, sin benchmarks numéricos, sin detalles de entrenamiento (tokens, composición, RLHF/DPO) y sin cuantizaciones oficiales en el repo.
- **Madurez**: 247 descargas y 12 likes en el momento de la ficha; ecosistema y validación comunitaria aún muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microsoft/UserLM-2.0
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/WildChat-4.8M
- Paper: anunciado como "forthcoming" en la model card; sin enlace arXiv disponible en la información proporcionada.
- Repositorio de código: no disponible en la información proporcionada.
- Demo: no disponible en la información proporcionada.
