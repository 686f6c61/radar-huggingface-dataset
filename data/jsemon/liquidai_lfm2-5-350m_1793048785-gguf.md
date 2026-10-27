# jsemon/LiquidAI_LFM2.5-350M_1793048785-GGUF

## Resumen

LFM2.5-350M es un modelo de lenguaje compacto desarrollado por Liquid AI, pensado para inferencia en dispositivos con restricciones estrictas de memoria y cómputo. Según la documentación del fabricante, se ejecuta en menos de 1 GB de memoria y funciona tanto en GPUs en la nube como en CPUs de bajo coste. Esta ficha describe la conversión a GGUF publicada por el usuario `jsemon`, no la versión oficial del modelo.

La ficha corresponde a un repositorio de terceros que empaqueta los pesos originales en formato GGUF para llama.cpp, con dos variantes disponibles: F16 y Q4_K_M. El modelo base cuenta con 354.483.968 parámetros (aproximadamente 354 M) y una longitud de contexto reportada de 125.000 tokens por agregadores externos, dato que no aparece confirmado en la documentación oficial consultada.

Su relevancia actual está en la categoría de modelos sub-500M: Liquid AI amplió el preentrenamiento del predecesor LFM2-350M de 10 a 28 billones de tokens y añadió aprendizaje por refuerzo a gran escala, manteniendo la misma huella de memoria. Eso lo sitúa como candidato para asistentes locales, clasificación y enrutado en el edge, aunque la ausencia de benchmarks publicados en la información disponible limita cualquier comparación cuantitativa seria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 (evolución de la familia LFM2); el detalle de capas no está disponible en las fuentes consultadas |
| Parametros totales | 354.483.968 (~354 M) |
| Parametros activos | no aplica (no se describe como modelo MoE) |
| Longitud de contexto | 125.000 tokens según LLM Explorer; no confirmado en la documentación oficial consultada |
| Tipos de cuantizacion | F16 y Q4_K_M en este repositorio; otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible (debe consultarse la licencia del modelo base LiquidAI/LFM2.5-350M) |
| Formato de pesos | GGUF (llama.cpp) en este repositorio; los pesos originales del modelo base se distribuyen en safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura LFM2.5, evolución de la familia LFM2 de Liquid AI, y está diseñado explícitamente para dispositivos edge con limitaciones de memoria. El fabricante indica que el entrenamiento parte de la base de LFM2-350M y amplía el preentrenamiento de 10 a 28 billones de tokens, seguido de un proceso de aprendizaje por refuerzo a gran escala orientado a mejorar chat, seguimiento de instrucciones y tool calling. La composición exacta del corpus, el reparto de fases y los detalles de alineamiento (RLHF, DPO u otras técnicas) no se detallan en la información disponible.

La conversión a GGUF de este repositorio la realiza Unsloth a partir de los pesos publicados por Liquid AI, y ofrece dos ficheros: `LFM2.5-350M.F16.gguf` y `LFM2.5-350M.Q4_K_M.gguf`. El repositorio ocupa 0,9 GB. Conviene señalar que la plantilla de README usada es genérica de Unsloth e incluye instrucciones para modelos multimodales (`llama-mtmd-cli`) que no aplican a este modelo, descrito como modelo de texto en la documentación del fabricante.

## Capacidades

- Generación de texto conversacional en formato chat, con soporte de plantilla Jinja (`--jinja` en llama.cpp).
- Seguimiento de instrucciones mejorado respecto a LFM2-350M, según la documentación de Liquid AI.
- Tool calling / function calling: el fabricante menciona mejoras explícitas en esta capacidad frente al modelo anterior.
- Razonamiento en varios pasos: no documentado de forma específica para esta variante.
- Capacidades multilingües: no disponibles en la información consultada.
- Visión, audio o modalidades adicionales: no soportadas; el modelo es de texto (la mención multimodal del README es plantilla genérica).
- Despliegue en CPU y dispositivos de baja memoria: el fabricante indica ejecución por debajo de 1 GB de RAM.
- Contexto largo: 125.000 tokens reportados por LLM Explorer, pendiente de verificación.

## Casos de uso

- Asistentes locales en CPU: el modelo cabe en menos de 1 GB con cuantización Q4_K_M, por lo que puede ejecutarse en portátiles sin GPU, Raspberry Pi o mini-PC domésticos como asistente de texto offline sin coste de API.
- Enrutado y clasificación de intenciones: con 354 M de parámetros y baja latencia, es adecuado como primera etapa de un pipeline que decida qué consulta va a un modelo mayor, reduciendo coste por token.
- Extracción de datos estructurados: generación de JSON a partir de correos, tickets o formularios, apoyada en tool calling y en la plantilla Jinja de llama.cpp para forzar formato.
- Preprocesado en pipelines RAG: reescritura de consultas, generación de preguntas hipotéticas o filtrado de fragmentos recuperados antes de pasarlos a un modelo grande.
- Automatización de agentes ligeros: ejecución de llamadas a funciones sencillas (consultas a APIs internas, creación de recordatorios) en entornos donde no hay GPU disponible.
- Aplicaciones de escritorio y móviles embebidas: integración vía llama.cpp en apps nativas que requieren inferencia sin conexión y sin dependencia de servidores externos.
- Prototipado rápido y evaluación de pipelines: al ser un GGUF de menos de 1 GB, permite iterar sobre prompts y plantillas de chat en local antes de escalar a modelos mayores.
- Moderación o etiquetado a gran escala: clasificación de textos con coste computacional muy bajo en comparación con modelos de miles de millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación de Liquid AI menciona mejoras en chat, seguimiento de instrucciones y tool calling respecto a LFM2-350M, pero sin cifras asociadas en las fuentes consultadas.

## Requisitos de hardware

- VRAM/RAM para F16: aproximadamente 0,71 GB solo de pesos (354.483.968 parámetros × 2 bytes), más overhead de contexto KV; en la práctica, alrededor de 1 GB.
- VRAM/RAM para Q4_K_M: estimación de 0,22-0,25 GB de pesos, más KV cache; permite ejecución holgada en sistemas con 1 GB de RAM libre.
- GPU recomendadas: cualquier GPU consumer con 2 GB o más de VRAM es suficiente; el modelo está pensado para CPU, por lo que una RTX 4090 o A100 no aportan ventaja relevante frente a alternativas mayores.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, iGPU con memoria compartida).
- Despliegue: llama.cpp (`llama-cli -hf jsemon/LiquidAI_LFM2.5-350M_1793048785-GGUF --jinja`), Ollama y LM Studio mediante importación del GGUF, y servidores compatibles con la API de llama.cpp. vLLM y TGI no están orientados a este formato y tamaño; el soporte de GGUF en vLLM es experimental.
- Latencia y throughput: no disponibles. El fabricante afirma inferencia "excepcionalmente rápida" sin publicar métricas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LFM2.5-350M (este, GGUF de terceros) | 354 M | 125.000 tokens (reportado, no verificado) | no disponible | GGUF F16 y Q4_K_M | Preentrenamiento de 28 T tokens + RL |
| LFM2-350M (predecesor) | ~350 M | no disponible | no disponible | no verificada en las fuentes consultadas | Preentrenamiento de 10 T tokens; base del 2.5 |
| Qwen3-0.6B | ~0,6 B | no disponible | no disponible | no verificada en las fuentes consultadas | Categoría sub-1B, uso general |
| SmolLM2-360M | ~360 M | no disponible | no disponible | no verificada en las fuentes consultadas | Categoría sub-500M, orientado a edge |

Los datos de los modelos alternativos no se han podido contrastar con las fuentes proporcionadas; deben verificarse en sus repositorios oficiales antes de usarse en una decisión técnica.

## Limitaciones y advertencias

- Repositorio no oficial: la conversión la publica el usuario `jsemon` con 0 descargas y 0 likes en el momento de la consulta; no hay garantía de mantenimiento ni de fidelidad respecto a los pesos originales.
- Licencia indeterminada en esta ficha: la licencia del modelo base debe consultarse en LiquidAI/LFM2.5-350M antes de cualquier uso comercial; este repositorio no la declara.
- README engañoso: la plantilla de Unsloth incluye instrucciones para modelos multimodales que no aplican; el modelo es de texto.
- Contexto sin verificar: los 125.000 tokens provienen de un agregador externo y no de la documentación oficial; la calidad de la atención más allá de decenas de miles de tokens en un modelo de 354 M es dudosa en la práctica.
- Alucinación: los modelos de este tamaño tienen una tasa alta de invención de hechos, especialmente en dominios especializados y en preguntas de conocimiento enciclopédico. No deben usarse como fuente de verdad sin verificación.
- Idiomas: no se declara cobertura lingüística; el rendimiento en castellano es desconocido y probablemente inferior al de modelos de mayor tamaño.
- Razonamiento limitado: sin benchmarks publicados, no hay evidencia de rendimiento en matemáticas, código o tareas de múltiples pasos más allá de las afirmaciones del fabricante.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad en las fuentes consultadas.
- Producción: al no haber métricas de latencia ni evaluación independiente, conviene tratarlo como modelo para prototipado o tareas auxiliares, no como componente crítico sin validación previa.
- Metadatos anómalos: las fechas del repositorio (creación en octubre de 2026) no son coherentes con el resto de la información, lo que refuerza la necesidad de verificar el origen de los ficheros.

## Enlaces

- Repositorio GGUF objeto de la ficha: https://huggingface.co/jsemon/LiquidAI_LFM2.5-350M_1793048785-GGUF
- Modelo base oficial: https://huggingface.co/LiquidAI/LFM2.5-350M
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-350m
- Blog de anuncio: https://www.liquid.ai/blog/lfm2-5-350m-no-size-left-behind
- Variante de embeddings: https://huggingface.co/LiquidAI/LFM2.5-Embedding-350M
- Ficha en LLM Explorer: https://llm-explorer.com/model/LiquidAI%2FLFM2.5-350M,245ipiyKpsAyX0hmhS1Q4k
- Unsloth (herramienta de conversión): https://github.com/unslothai/unsloth
