# DamonRicci/agent-tool-medium-deberta-v3-large

## Resumen

Agent Tool Medium Classifier (DeBERTa-v3-Large) es un modelo de clasificación de texto desarrollado por DamonRicci, obtenido mediante ajuste fino de `microsoft/deberta-v3-large` (435 millones de parámetros) para una tarea muy concreta: discriminar semánticamente el entorno de ejecución de las herramientas que invoca un agente. En concreto, clasifica cada herramienta en una de dos categorías mutuamente excluyentes, `LOCAL_INTERNAL` (base de datos local, sistema de ficheros, memoria en proceso) o `EXTERNAL_API` (SaaS remoto, Stripe, Twilio, API REST externa).

El problema que resuelve es de ingeniería de agentes: el middleware de ejecución necesita decidir políticas de caché distintas segun el tipo de herramienta. Para herramientas internas se aplican TTL largos vinculados al estado controlado del sistema, mientras que para APIs externas se aplican TTL cortos y revalidación HTTP con ETag para protegerse de cambios fuera de banda. Este clasificador automatiza esa decisión.

Es relevante porque separa la lógica de enrutado de la caché del razonamiento del LLM principal, reduciendo coste y latencia. No es un modelo generativo, sino un clasificador binario de 435M de parámetros con calibración de temperatura Platt (T = 1,40), entrenado y publicado únicamente en inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-large), 24 capas, dimensión oculta 1024, 16 cabezas de atención |
| Parametros totales | 435.063.810 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la model card; el ejemplo de uso trunca a 128 tokens. La arquitectura base DeBERTa-v3-large admite hasta 512 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Tarea | Clasificación binaria: LOCAL_INTERNAL vs EXTERNAL_API |
| Calibración | Temperatura Platt, T = 1,40 |
| Tamaño del repositorio | 1,7 GB |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/deberta-v3-large`, un transformer encoder con atención desenredada (disentangled attention) y mecanismo de atención relativa, configurado aquí con 24 capas, dimensión oculta de 1024 y 16 cabezas de atención, lo que da lugar a los 435M de parámetros. Sobre esa base se ha añadido una cabeza de clasificación de secuencias (`AutoModelForSequenceClassification`) con dos etiquetas de salida.

Los logits se calibran dividiéndolos por una temperatura Platt de 1,40 antes de aplicar softmax, de modo que las probabilidades resultantes sean más fiables para la toma de decisiones del middleware. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas como RLHF o DPO, por lo que esos datos no están disponibles. La descripción funcional sugiere que la entrada tiene el formato `Tool: <nombre>\nDomain: <dominio>\nParams: [...]\nDesc: <descripción>`, es decir, una serialización textual de la definición de la herramienta.

## Capacidades

- Clasificación binaria de herramientas de agente en las categorías `LOCAL_INTERNAL` y `EXTERNAL_API`.
- Estimación de probabilidad calibrada por clase (`p_local`, `p_external`) tras aplicar la temperatura Platt.
- Procesamiento de descripciones textuales de herramientas con metadatos estructurados (nombre, dominio, parámetros, descripción).
- Salida numérica directa apta para umbrales configurables en lógica de enrutado.
- Integración sencilla vía `transformers` con `AutoTokenizer` y `AutoModelForSequenceClassification`.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Middleware de caché para agentes: el clasificador decide dinámicamente si una herramienta recibe un TTL largo de sesión (`LOCAL_INTERNAL`) o un TTL corto con revalidación ETag (`EXTERNAL_API`), reduciendo llamadas innecesarias a APIs remotas sin servir datos obsoletos.
- Optimización de costes en pipelines de agentes: al identificar herramientas externas, el orquestador puede limitar el número de llamadas facturables a servicios como Stripe o Twilio aplicando políticas de caché agresivas solo donde es seguro.
- Enrutado de políticas de seguridad: las herramientas `EXTERNAL_API` pueden canalizarse obligatoriamente a través de proxies auditados, mientras que las `LOCAL_INTERNAL` se ejecutan en proceso.
- Revalidación condicional HTTP: para herramientas clasificadas como externas, el middleware usa la cabecera ETag para comprobar si el recurso remoto ha cambiado antes de reutilizar la respuesta en caché.
- Coherencia de estado en agentes con memoria: en herramientas locales se vincula la validez de la caché a los diffs del estado controlado (base de datos, ficheros, memoria), invalidando selectivamente cuando cambia el ground truth.
- Clasificación previa en sistemas multi-agente: cada agente puede consultar el clasificador para decidir si delega en una herramienta compartida interna o en un servicio externo, ajustando el presupuesto de latencia.
- Telemetría y auditoría: registrar la distribución de tipos de herramienta por sesión permite detectar patrones anómalos o dependencias excesivas de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de accuracy, F1, precisión, recall ni comparaciones cuantitativas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 1,7 GB de pesos más activaciones, en torno a 2-3 GB con un batch pequeño.
- VRAM estimada en FP16/BF16: aproximadamente 0,9 GB de pesos, en torno a 1,5 GB en inferencia real.
- Cabe con holgura en cualquier GPU de consumo: RTX 3060, RTX 4070, RTX 4090, e incluso en CPU para volúmenes moderados.
- GPU profesionales (A100, H100) no son necesarias para este tamaño; solo se justifican por throughput agregado en despliegues masivos.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`, TorchScript/ONNX Runtime para latencia mínima, y servidores de inferencia tipo TGI o batching propio. No se mencionan integraciones específicas con llama.cpp u Ollama, que no son aplicables a un clasificador encoder.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DamonRicci/agent-tool-medium-deberta-v3-large | 435M | Hasta 512 en la base, ejemplo a 128 | Clasificación binaria de entorno de herramienta | MIT | HuggingFace |
| microsoft/deberta-v3-large | 435M | 512 | Modelo base, sin cabeza específica | MIT | HuggingFace |
| microsoft/deberta-v3-base | 184M | 512 | Modelo base, alternativas de clasificación | MIT | HuggingFace |

No se conocen clasificadores públicos equivalentes especializados en discriminación `LOCAL_INTERNAL` vs `EXTERNAL_API` para middleware de agentes; por ello la comparativa se limita a los modelos base de la familia DeBERTa-v3.

## Limitaciones y advertencias

- El modelo solo está entrenado para inglés; las descripciones de herramientas en otros idiomas pueden degradar la precisión de forma significativa.
- Sesgos conocidos: no disponibles; la model card no documenta un análisis de sesgos.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea cuando la descripción de la herramienta es ambigua o mezcla componentes locales y externos.
- La frontera `LOCAL_INTERNAL` vs `EXTERNAL_API` es binaria y puede no reflejar escenarios híbridos (por ejemplo, una caché local respaldada por una API remota).
- El truncado a 128 tokens en el ejemplo de uso puede descartar información relevante si la definición de la herramienta es larga.
- Las probabilidades dependen de la calibración Platt con T = 1,40; alterar ese valor sin recalibrar invalida la interpretación probabilística.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda mantener la atribución y validar el comportamiento antes de integrarlo en producción.
- Repositorio con cero descargas y cero likes en el momento de la consulta: no hay evidencia de adopción ni validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/DamonRicci/agent-tool-medium-deberta-v3-large
- GitHub del autor: https://github.com/DamonRicci
- Artículo del autor en Medium: https://medium.com/@DamonEirickAI/gpt-5-5-agent-ai-is-transforming-from-a-chat-tool-into-a-task-assistant-4eb8d9071236
- Modelo base: https://huggingface.co/microsoft/deberta-v3-large
