# Kausp11/searchlm-dclm_nc-baseline_d14_allcm

## Resumen

Searchlm-dclm_nc-baseline_d14_allcm es un modelo de lenguaje causal de aproximadamente 842 millones de parámetros publicado por el usuario Kausp11 en Hugging Face. Se trata de un modelo base (no ajustado por instrucciones) entrenado como *baseline* equiparado en cómputo (compute-matched) sobre el corpus DCLM-Edu, en el marco de un proyecto denominado searchlm, que investiga el preentrenamiento con capacidades de búsqueda habilitadas (search-enabled pretraining). Su interés principal es experimental: permite comparar el rendimiento de un modelo entrenado sobre datos educativos filtrados con DCLM frente a variantes entrenadas con acceso a herramientas de búsqueda durante el preentrenamiento.

El modelo es una exportación a Hugging Face de un checkpoint entrenado con la infraestructura nanochat (RCP), con etiqueta `searchlm_nanochat` y tags de búsqueda habilitada. El tokenizador se basa en SmolLM2, ampliado con tokens especiales de interacción web (`<WEB_QUERY>`, `</WEB_QUERY>`, `<WEB_RESPONSE>`, `</WEB_RESPONSE>`), lo que sugiere que la familia de modelos está diseñada para emitir consultas web e ingerir respuestas como parte del flujo de generación. Es relevante para investigadores en preentrenamiento con herramientas, aunque su utilidad productiva directa es limitada al tratarse de un modelo base experimental de 400M-escala (según su denominación) con 842M de parámetros reales en safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal (exportación nanochat, detalles no disponibles) |
| Parámetros totales | 842.220.414 |
| Parametros activos | No es MoE; todos los parámetros están activos |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en precisión original, 1,7 GB de tamaño de repo) |
| Idiomas soportados | No disponible (entrenado sobre DCLM-Edu, presumiblemente predominio de inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder causal de estilo GPT exportado desde la pila de entrenamiento nanochat. La denominación interna (`baseline_d14_allcm`) sugiere 14 capas (d14) y una configuración "allcm" (all compute-matched), aunque estos detalles no están confirmados en la model card. El tokenizador es el de SmolLM2, extendido con cuatro tokens especiales que delimitan consultas y respuestas web, lo que indica que el modelo (o sus variantes hermanas) fue entrenado con datos que incluyen interacciones simuladas o reales con un motor de búsqueda.

Los datos de entrenamiento provienen de DCLM-Edu, una variante educativa del corpus DataComp-LM (DCLM), un dataset de alta calidad filtrado a partir de Common Crawl. No se ha publicado el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron fases de RLHF o DPO; al ser un modelo base, lo más probable es que sea solo preentrenamiento sin ajuste por preferencias. La innovación destacable del proyecto es el preentrenamiento con búsqueda habilitada: el modelo puede generar consultas web dentro de marcadores especiales y recibir respuestas como contexto, en línea con líneas de investigación recientes sobre modelos que aprenden a usar herramientas durante el propio preentrenamiento.

## Capacidades

- Generación de texto en formato base (completación de texto, no conversación por instrucciones).
- Emisión de consultas web estructuradas mediante los tokens `<WEB_QUERY>` y `</WEB_QUERY>`, y procesamiento de respuestas entre `<WEB_RESPONSE>` y `</WEB_RESPONSE>`.
- Modelado de lenguaje sobre contenido educativo y académico (corpus DCLM-Edu).
- Compatibilidad con la librería `transformers` de Hugging Face mediante carga con `trust_remote_code=True` (código personalizado).
- No se ha documentado soporte de tool calling estándar (JSON/function calling), agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en preentrenamiento con búsqueda: sirve como baseline compute-matched para medir cuánto mejora un modelo idéntico entrenado con interacciones web frente a uno entrenado solo con texto estático.
- Estudio de tokens especiales de herramienta: permite analizar si un modelo aprende de forma emergente a emitir consultas web bien formadas durante el preentrenamiento.
- Evaluación de calidad de datos DCLM-Edu: útil para comparar el rendimiento de modelos entrenados sobre corpus educativos filtrados frente a otras mezclas de datos.
- Reproducción de experimentos nanochat: al ser una exportación de un checkpoint de RCP, facilita verificar resultados publicados del proyecto search-lm.
- Fine-tuning experimental a pequeña escala: con 842M de parámetros, es viable ajustarlo (SFT, DPO) en una sola GPU de consumo para pruebas de metodología.
- Análisis de tokenizadores extendidos: caso práctico de cómo añadir tokens especiales de herramienta a un tokenizador SmolLM2 sin romper la compatibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7-2 GB en FP16/BF16 (tamaño del repo de 1,7 GB); con cuantización a 8 bits o 4 bits, por debajo de 1 GB, aunque no se publican pesos cuantizados oficiales.
- GPU recomendadas: cualquier GPU moderna con 4 GB o más de VRAM es suficiente (RTX 3060, RTX 4060, RTX 4090, etc.); no se necesita hardware de centro de datos.
- Cabe con holgura en GPUs de consumo, incluso en portátiles; también es ejecutable en CPU con razonable rapidez dado su tamaño.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained(repo, trust_remote_code=True)`; en principio compatible con llama.cpp u Ollama solo si se convierte a GGUF (no disponible oficialmente); vLLM y TGI podrían funcionar pero no están verificados por el autor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Kausp11/searchlm-dclm_nc-baseline_d14_allcm | 842M | No disponible | Apache 2.0 | Baseline experimental con tokens de búsqueda, modelo base |
| SmolLM2-360M / SmolLM2-1.7B (HuggingFaceTB) | 360M / 1,7B | 8.192 tokens (contexto extendido) | Apache 2.0 | Misma familia de tokenizador; modelos más maduros con instrucciones |
| Qwen2.5-0.5B (Alibaba) | 494M | 32.768 tokens | Qwen Research (restricciones >100M usuarios) | Modelo base compacto con benchmarks publicados |

El modelo de esta ficha no tiene benchmarks publicados, por lo que no es posible comparar rendimiento de forma rigurosa; su valor diferencial frente a alternativas como SmolLM2 es el diseño para preentrenamiento con búsqueda habilitada, no el rendimiento bruto.

## Limitaciones y advertencias

- Al ser un modelo base sin ajuste por instrucciones, no sigue instrucciones de forma fiable ni es adecuado para asistentes conversacionales sin fine-tuning.
- No se ha publicado información sobre longitud de contexto, idiomas, datos de entrenamiento ni benchmarks, lo que dificulta evaluarlo para producción.
- Riesgo de alucinación alto, típico de modelos base pequeños; no debe usarse como fuente de verdad factual.
- Posibles sesgos heredados de Common Crawl y del corpus DCLM-Edu; no se han realizado evaluaciones de sesgos documentadas.
- Requiere `trust_remote_code=True` para cargarse, lo que implica ejecutar código personalizado del repositorio; revísalo antes de usar en entornos sensibles.
- La licencia Apache 2.0 permite uso comercial sin restricciones relevantes.
- Proyecto experimental con muy poca tracción (287 descargas, 0 likes en el momento de la ficha); el mantenimiento y la documentación son limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kausp11/searchlm-dclm_nc-baseline_d14_allcm
- No se han encontrado enlaces adicionales (paper, blog, repositorio de código o demo) en la información disponible.
