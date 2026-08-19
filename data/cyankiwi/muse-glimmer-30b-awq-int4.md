# cyankiwi/Muse-Glimmer-30B-AWQ-INT4

## Resumen

Muse Glimmer es un modelo de lenguaje causal de 30 000 millones de parámetros desarrollado por Meta Superintelligence Lab, diseñado específicamente para tareas agénticas autónomas en hardware de consumo. Se presenta como una versión destilada de Muse Spark, con un encoder de percepción dedicado que permite entrada multimodal (texto e imágenes) y salida de texto. El modelo integra razonamiento multi-paso, uso fiable de herramientas, comprensión multimodal y recuperación ante fallos en un único sistema que puede ejecutarse localmente sin depender de infraestructura en la nube.

La versión aquí documentada, `cyankiwi/Muse-Glimmer-30B-AWQ-INT4`, es una cuantización AWQ de 4 bits del modelo base `meta-models/Muse-Glimmer-30B`, publicada por el usuario cyankiwi. Con un peso de 24,02 GB, está pensada para caber en tarjetas gráficas de consumo con 24 GB o 32 GB de VRAM, manteniendo una degradación mínima en tareas agénticas (0,2 % a 1,0 % según la configuración). El modelo base fue lanzado en agosto de 2026 bajo licencia Apache 2.0, con una ventana de contexto de 131 072 tokens y soporte para más de 100 idiomas.

La relevancia de Muse Glimmer radica en su enfoque específico para agentes autónomos: combina razonamiento de largo alcance, invocación de herramientas con esquemas precisos, comprensión de imágenes y capacidad de diagnóstico y reintento ante errores. Esto lo convierte en una opción práctica para despliegues locales en entornos de producción donde la privacidad, la latencia o el coste de la nube son factores críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con encoder de percepcion (ViT-G/14) |
| Parametros totales | 29 776 626 688 (29,6 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131 072+ tokens |
| Tipos de cuantizacion | AWQ INT4 (esta version); el modelo base tambien ofrece K-Quant-Dynamic y K-Quant-17GB |
| Idiomas soportados | EN, ZH, HI, AR, RU, JA, KO, NL, FR, ES (entrenado en mas de 100 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

Muse Glimmer es un transformer causal denso con 52 capas, dimensión oculta de 6656 y un patrón de atención local-global repetido cada cuatro capas: tres capas con atención local (ventana deslizante de 2048 tokens) seguidas de una capa con atención global. Usa atención con GQA (32 cabezas de consulta y 2 de clave/valor, ratio 16:1), FFN tipo SwiGLU con dimensión intermedia de 19 968, y codificación posicional RoPE con theta de 500 000 aplicada solo a las capas locales. El vocabulario consta de 200 000 tokens BPE más 2048 tokens especiales, totalizando 202 048.

El modelo incorpora un encoder de percepción basado en ViT-G/14 de aproximadamente 1,8 mil millones de parámetros (50 capas, ancho 1536, patch de 14), que permite procesar hasta 4096 tokens visuales por imagen. Los datos de entrenamiento incluyen contenido multimodal de fuentes públicas, datos de terceros y productos de Meta, con un corte de conocimiento en enero de 2026. Según la documentación, el modelo fue destilado de Muse Spark y optimizado específicamente para tareas agénticas, con entrenamiento dirigido a capacidades como razonamiento multi-paso, uso de herramientas, recuperación de fallos y control de esfuerzo. La versión cuantizada AWQ INT4 se calibró con un dataset de STEM y tareas agénticas (según la model card del autor de la cuantización).

## Capacidades

- Razonamiento multi-paso: encadena razonamiento sobre horizontes largos, manteniendo planes coherentes en flujos de trabajo complejos.
- Uso fiable de herramientas: invoca funciones con esquemas precisos a lo largo de flujos de trabajo extendidos.
- Comprensión multimodal: acepta texto e imágenes intercaladas (capturas de pantalla, gráficos, documentos) mediante el encoder de percepción.
- Recuperacion de fallos: cuando una llamada a herramienta falla o devuelve un resultado inesperado, diagnostica el error y reintenta en lugar de detenerse.
- Control de esfuerzo: soporta diferentes niveles de razonamiento para equilibrar calidad y velocidad según la tarea.
- Compatibilidad con scaffolds: funciona con OpenClaw, Hermes Agent y otros patrones de orquestación agéntica.
- Multilingue: entrenado con datos de más de 100 idiomas, con soporte explícito para al menos 10 (EN, ZH, HI, AR, RU, JA, KO, NL, FR, ES).
- Salida de texto únicamente: aunque acepta imágenes como entrada, la salida es exclusivamente textual.

## Casos de uso

- Agentes autonomos de automatizacion de tareas: el modelo puede ejecutar flujos de trabajo completos dentro de scaffolds como OpenClaw o Hermes Agent, manejando llamadas a herramientas, depurando código y resolviendo solicitudes multi-turno de principio a fin, gracias a su ventana de 131K tokens y su capacidad de recuperación ante fallos.
- Atencion al cliente automatizada con contexto visual: al aceptar capturas de pantalla y documentos como entrada, puede interpretar problemas de usuarios que incluyen imágenes (por ejemplo, errores de software o facturas) y mantener conversaciones de largo recorrido sin perder el hilo.
- Generacion de codigo en produccion con tool calling: soporta invocación de funciones con esquemas precisos, lo que permite integrarlo en pipelines de CI/CD para generar, revisar y corregir código de forma autónoma, con capacidad de reintentar cuando una compilación falla.
- Analisis de documentos mixtos (texto e imagen): puede procesar informes, gráficos y tablas escaneadas, extrayendo información y respondiendo preguntas complejas sobre el contenido, útil en entornos de investigación o consultoría.
- Asistentes de soporte tecnico local: al ejecutarse en hardware de consumo sin conexión a la nube, es adecuado para entornos con requisitos estrictos de privacidad, donde los datos del cliente no pueden salir de la infraestructura local.
- Razonamiento cientifico y matematico: con su capacidad de razonamiento multi-paso y control de esfuerzo, puede abordar problemas de STEM que requieren cadenas de deducción largas, ajustando la profundidad de razonamiento según la complejidad de la consulta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona evaluaciones en benchmarks como DeepSearch QA, MCP-Atlas, τ3-Bench y SWE-Bench, pero no proporciona cifras concretas. Tampoco se incluyen comparativas numéricas con otros modelos. La única métrica cuantitativa disponible es la degradación medida tras la cuantización: 0,2 % para K-Quant-Dynamic y 1,0 % para K-Quant-17GB, en relación con el modelo en precisión completa.

## Requisitos de hardware

- VRAM estimada: la version AWQ INT4 ocupa 24,02 GB en disco, y el autor indica que cabe en tarjetas de 24 GB o 32 GB de VRAM, dejando espacio para la cache KV, el encoder de percepcion y el drafter de decodificacion especulativa.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, o GPUs de 32 GB como la A6000 o similares. Para precision completa se requieren 64 GB de VRAM.
- Compatibilidad con GPU de consumo: sí, siempre que se use la cuantizacion AWQ INT4 o las variantes K-Quant de 17 GB.
- Opciones de despliegue: al ser un modelo en formato transformers con safetensors, puede desplegarse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama (si se empaqueta adecuadamente). La model card menciona compatibilidad con scaffolds agénticos.
- Latencia y throughput: no se proporcionan datos numericos. El modelo soporta control de esfuerzo, lo que permite ajustar el nivel de razonamiento para reducir latencia en tareas simples.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con modelos de la misma categoría (tamaño ~30B, orientación agéntica y multimodal). La documentación no incluye tablas comparativas con alternativas como Llama 3.1 70B, Qwen 2.5 32B o Mistral Large, ni datos de rendimiento relativos. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos especificos, pero al estar entrenado con datos publicos y de terceros, es susceptible de heredar sesgos presentes en esos datos.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir contenido factualmente incorrecto, especialmente en tareas de razonamiento largo o con contextos ambiguos.
- Limitaciones de contexto: aunque la ventana es de 131K tokens, la atencion local con ventana de 2048 puede limitar la capacidad de relacionar informacion muy distante dentro de la secuencia.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones significativas, pero se recomienda revisar los terminos completos de la licencia.
- Degradacion por cuantizacion: la version AWQ INT4 introduce una degradacion de hasta el 1,0 % en tareas agénticas respecto al modelo en precision completa, segun la tabla de la model card. Para aplicaciones criticas, se recomienda validar el comportamiento en el caso de uso concreto.
- Dependencia de scaffolds: aunque el modelo es compatible con varios scaffolds, el rendimiento agéntico final depende en gran medida de la calidad de la orquestacion externa.
- Fecha de corte: el conocimiento del modelo se limita a enero de 2026; no tiene informacion posterior.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cyankiwi/Muse-Glimmer-30B-AWQ-INT4
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Blog de investigacion de Meta: https://research.meta.ai/blog/introducing-muse-glimmer-open-agentic-model
- Ficha en LLM Explorer: https://llm-explorer.com/model/cyankiwi%2FMuse-Glimmer-30B-AWQ-INT4,3ksv4A1oGgzaZ8K4JJf3wx
- Benchmarks en BenchLM: https://benchlm.ai/models/muse-glimmer-30b
- Paper del encoder de percepcion (referenciado en la model card): https://arxiv.org/abs/2504.13181
