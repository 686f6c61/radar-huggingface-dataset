# jsantillana/vectrayx-vision-1b-checks

## Resumen

VectraYX-Vision-1B es un modelo de visión-lenguaje (VLM) de menos de 2.000 millones de parámetros, desarrollado por jsantillana, especializado en ciberseguridad para el entorno hispanohablante y latinoamericano. Según la model card, acopla un encoder SigLIP-so400m congelado a un decoder de 1.040 millones de parámetros en español/LATAM, unidos mediante un MLP. El modelo está diseñado para responder en español, emitir razonamiento estructurado mediante tokens nativos `<|think|>` e invocar herramientas a través del Model Context Protocol (MCP) con tokens `<|tool_call|>`.

La relevancia actual del modelo reside en su especialización en imágenes de ciberseguridad para el mercado español y latinoamericano, un nicho donde los VLM generalistas suelen fallar por falta de vocabulario y contexto regional. El uso de razonamiento estructurado y tool calling nativo lo hace candidato para flujos de análisis de incidentes asistido por IA. El repositorio está publicado en Hugging Face con el pipeline `image-text-to-text`, pero su licencia e idiomas no están especificados en la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language: encoder SigLIP-so400m congelado + proyector MLP + decoder de 1.04B |
| Parametros totales | Sub-2B (decoder de 1.04B; encoder SigLIP-so400m; total exacto no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Español (variantes LATAM) según la model card; no disponible en la ficha de Hugging Face |
| Licencia | No disponible |
| Formato de pesos | No disponible (tamaño del repositorio: 125.8 GB) |

## Arquitectura y entrenamiento

La arquitectura combina un encoder de visión SigLIP-so400m congelado con un decoder de lenguaje de 1.040 millones de parámetros. El puente entre ambos es un MLP, lo que reduce el número de parámetros entrenables. El modelo genera tokens `<|think|>` para razonamiento estructurado y `<|tool_call|>` para invocar herramientas según el Model Context Protocol.

No se dispone de información sobre los datos de entrenamiento, el número de tokens, la composición del dataset ni si se aplicó RLHF o DPO. La model card tampoco detalla el proceso de alineación ni las técnicas de optimización utilizadas.

## Capacidades

- Análisis de imágenes de ciberseguridad: el modelo interpreta capturas de pantalla, paneles de seguridad y otro contenido visual del ámbito de la ciberseguridad.
- Razonamiento estructurado: emite pasos de razonamiento mediante tokens nativos `<|think|>` antes de la respuesta final.
- Tool calling nativo: puede invocar herramientas vía Model Context Protocol usando tokens `<|tool_call|>`.
- Respuesta en español: está especializado en español y variantes de LATAM, con vocabulario técnico adaptado a ese entorno.
- Integración en agentes: gracias al soporte de MCP, puede actuar como componente de agentes que necesiten consultar APIs o ejecutar acciones.
- No se mencionan capacidades de generación de código, matemáticas, audio ni otras modalidades.

## Casos de uso

- Triaje de incidentes de seguridad: el modelo analiza una captura de pantalla de un SIEM y genera un resumen en español con razonamiento estructurado en tokens `<|think|>` para explicar la gravedad del evento.
- Análisis de correos de phishing: ante una imagen de un correo sospechoso, el modelo identifica elementos visuales (remitente, enlaces, adjuntos) y emite una valoración de riesgo en español.
- Soporte a analistas SOC en LATAM: al estar entrenado en vocabulario de seguridad español/LATAM, puede responder consultas técnicas con terminología regional y emitir conclusiones accionables.
- Documentación de evidencias: el modelo genera informes en español a partir de imágenes de incidentes, facilitando la creación de registros para auditorías y reportes internos.
- Auditoría de configuraciones: mediante tool calling MCP, el modelo puede consultar APIs de sistemas de seguridad para contrastar la configuración visible en una imagen con el estado real del sistema.
- Integración en chatbots de soporte de primer nivel: con capacidad de tool calling y razonamiento, puede actuar como asistente automático para responder consultas de seguridad basadas en imágenes, reduciendo la carga del equipo humano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni otros conjuntos de evaluación estándar.

## Requisitos de hardware

- VRAM estimada: No disponible. El único dato publicado es el tamaño del repositorio (125.8 GB), pero se desconoce el formato y la cuantización de los pesos.
- GPU recomendadas: No disponible.
- Cabe en GPU de consumo: No disponible. Por el tamaño declarado del modelo (sub-2B) es probable que sí, pero no se puede afirmar sin especificaciones de cuantización.
- Opciones de despliegue: No disponible. No se mencionan frameworks como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: No disponible.

## Comparativa con modelos similares

No disponible. No se han identificado alternativas de la misma categoría en la información proporcionada, y no existen datos de benchmarks comparativos publicados para este modelo.

## Limitaciones y advertencias

- La licencia está marcada como "no disponible", por lo que no se puede confirmar si el uso comercial está permitido.
- Los idiomas soportados no están publicados en la ficha de Hugging Face; la model card indica español/LATAM, por lo que otros idiomas pueden no funcionar correctamente.
- No hay resultados de benchmarks, evaluaciones de sesgos ni estudios de alucinaciones. No se puede evaluar su fiabilidad antes de desplegarlo en producción.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que el modelo aún no ha sido validado por la comunidad.
- La información técnica es muy limitada: se desconoce la longitud de contexto, el formato de pesos, los datos de entrenamiento y el proceso de alineación.
- El tamaño del repositorio (125.8 GB) es elevado para un modelo sub-2B, lo que podría indicar la presencia de pesos sin cuantizar u otros artefactos, pero no se puede confirmar sin más datos.

## Enlaces

- Modelo: https://huggingface.co/jsantillana/vectrayx-vision-1b-checks
- Paper: https://huggingface.co/papers/2608.08477
- Repositorio alternativo: https://huggingface.co/jsantillana/vectrayx-vision-1b

No se han encontrado otros enlaces relevantes (blogs, demos, repos) en la búsqueda web.
