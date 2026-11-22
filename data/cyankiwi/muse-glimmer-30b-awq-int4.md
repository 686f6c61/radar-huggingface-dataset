# cyankiwi/Muse-Glimmer-30B-AWQ-INT4

## Resumen

Muse-Glimmer-30B-AWQ-INT4 es la cuantización AWQ de 4 bits del modelo multimodal Muse-Glimmer-30B, desarrollado por Meta Superintelligence Lab y publicado en agosto de 2026 bajo licencia Apache 2.0. Se trata de un transformer causal denso de aproximadamente 29,6 mil millones de parámetros que incorpora un codificador de percepción independiente de unos 1,8 mil millones de parámetros (ViT-G/14), lo que le permite aceptar entradas intercaladas de texto e imagen y producir texto. La versión aquí descrita ha sido generada por cyankiwi con su pipeline AWQ (versión 26.05.01) y calibración orientada a dominios STEM y agenticos.

El modelo está diseñado específicamente para tareas agenticas autónomas ejecutadas en hardware de consumo, sin dependencia de infraestructura en la nube. Combina razonamiento multi-paso, uso fiable de herramientas con esquemas de función precisos, recuperación ante fallos de llamadas a herramientas y comprensión multimodal, lo que lo sitúa en la categoría de modelos locales para orquestación de agentes. Soporta longitudes de contexto de 131.072 tokens o más, con un patrón de atención híbrido local/global que reduce el coste computacional en secuencias largas.

La relevancia de esta ficha concreta radica en la cuantización: el repositorio original en precisión completa ocupa 48,1 GB, mientras que esta versión AWQ INT4 reduce el peso a 24,02 GB, lo que facilita su despliegue en GPUs de gama alta para consumidores y en nodos de inferencia con VRAM limitada. El modelo acumula 680 descargas y 11 likes en Hugging Face en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con codificador de percepción (ViT-G/14) |
| Parametros totales | 29.776.626.688 (aproximadamente 29,6B, incluyendo el codificador visual de ~1,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072+ tokens |
| Tipos de cuantizacion | AWQ INT4 (4 bits, compressed-tensors); el modelo base admite otras cuantizaciones no especificadas en esta ficha |
| Idiomas soportados | Entrenado con datos de más de 100 idiomas; lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers |

Especificaciones adicionales del modelo base:

| Parametro | Valor |
|---|---|
| Dimension oculta | 6656 |
| Capas | 52 |
| Patron de atencion | [Local, Local, Local, Global] repetido |
| Ventana deslizante | 2048 tokens |
| Atencion con compuerta (gated attention) | Si |
| Cabezas de atencion (Q / KV) | 32 / 2 (GQA 16:1) |
| Dimension de cabeza | 128 |
| Tipo de FFN | SwiGLU |
| Dimension intermedia FFN | 19.968 |
| Codificacion posicional | RoPE (theta = 500.000), solo en capas locales |
| Vocabulario | 202.048 (200.000 BPE + 2.048 especiales) |
| Tokens visuales maximos por imagen | 4.096 |
| Modalidades | Entrada: texto + imagen; salida: texto |
| Tamano del repo cuantizado | 24,02 GB (frente a 48,1 GB del repo original) |

## Arquitectura y entrenamiento

Muse-Glimmer-30B es un transformer causal denso con 52 capas y un patrón de atención híbrido que alterna tres capas de atención local con ventana deslizante de 2048 tokens por cada capa de atención global. Este diseño reduce el coste de atención en contextos largos manteniendo capacidad de recuperación global. Emplea atención con compuerta, GQA con ratio 16:1 (32 cabezas de consulta y 2 de clave/valor), RoPE con theta de 500.000 aplicado únicamente en las capas locales, y FFN de tipo SwiGLU con dimensión intermedia de 19.968. El codificador de percepción es un ViT-G/14 de 50 capas, anchura 1536 y patch size 14, con aproximadamente 1,8 mil millones de parámetros, que permite procesar hasta 4.096 tokens visuales por imagen.

El modelo se presenta como destilado de Muse Spark y entrenado sobre contenido multimodal procedente de datos públicos, con cobertura de más de 100 idiomas. La model card no detalla el número exacto de tokens de entrenamiento ni la composición del dataset, ni especifica si se aplicaron fases de RLHF o DPO; estos datos figuran como no disponibles. La innovación destacable es la orientación explícita a tareas agenticas de extremo a extremo: el modelo está entrenado y evaluado en finalización de tareas completas, uso de herramientas con esquemas precisos, razonamiento multi-paso sobre horizontes largos, recuperación ante fallos de herramientas y compatibilidad con scaffolds como OpenClaw y Hermes Agent. También incorpora control de esfuerzo de razonamiento, lo que permite ajustar el equilibrio entre calidad y velocidad en tiempo de inferencia.

La cuantización AWQ aplicada por cyankiwi utiliza calibración sobre datos STEM y agenticos, lo que busca preservar la precisión en los dominios donde el modelo se usa con más frecuencia (código, matemáticas, razonamiento estructurado y llamadas a herramientas).

## Capacidades

- Generación de texto y razonamiento multi-paso con cadenas de razonamiento sobre horizontes largos.
- Comprensión multimodal de entrada: interpretación de capturas de pantalla, gráficos, documentos e imágenes intercaladas con texto conversacional.
- Uso fiable de herramientas y function calling con esquemas precisos a lo largo de flujos de trabajo extendidos.
- Recuperación ante fallos: diagnóstico de errores en llamadas a herramientas y reintento en lugar de detención.
- Finalización de tareas agenticas de extremo a extremo dentro de scaffolds de orquestación (OpenClaw, Hermes Agent y patrones similares).
- Escritura y depuración de código en el contexto de tareas de ingeniería de software.
- Capacidades multilingües con entrenamiento en más de 100 idiomas.
- Control de esfuerzo de razonamiento para ajustar calidad frente a latencia.
- Compatibilidad con endpoints y despliegue mediante transformers y compressed-tensors.

## Casos de uso

- Agente autónomo de búsqueda profunda: el modelo puede gestionar consultas de investigación de varios pasos encadenando búsquedas, lectura de documentos y síntesis, con recuperación ante resultados inesperados, gracias a su contexto de 131.072 tokens y a su entrenamiento en DeepSearch QA.
- Automatización de ingeniería de software: integrado en un scaffold agentico, puede leer repositorios, escribir parches, ejecutar pruebas y depurar fallos de forma iterativa; su evaluación en SWE-Bench y su ventana de contexto larga lo hacen adecuado para tareas de resolución de incidencias en producción.
- Soporte técnico con interpretación de capturas: al aceptar imágenes intercaladas con texto, puede analizar pantallazos de errores, paneles de monitorización o diagramas enviados por el usuario y responder con pasos concretos de resolución.
- Orquestación de herramientas empresariales: con function calling preciso y esquemas estables, puede invocar APIs de CRM, sistemas de tickets o bases de datos en flujos multi-turno, reintentando ante fallos de la herramienta.
- Análisis de documentos y gráficos en local: despliegue en hardware propio para procesar informes con tablas y figuras sin enviar datos a la nube, relevante en entornos con requisitos de confidencialidad.
- Asistente de desarrollo en estación de trabajo: la versión AWQ INT4 de 24,02 GB cabe en GPUs de consumo de gama alta, lo que permite ejecutar un agente de código local sin conexión de red.
- Extracción estructurada de información multimodal: procesamiento de formularios escaneados, facturas o capturas de interfaz para generar JSON validado mediante llamadas a funciones.
- Evaluación de agentes en pipelines de CI: uso del modelo como sujeto de pruebas en scaffolds de orquestación para medir tasas de éxito en tareas de múltiples pasos (MCP-Atlas, tau3-Bench).

## Benchmarks y rendimiento

La model card menciona que el modelo ha sido entrenado y evaluado en DeepSearch QA, MCP-Atlas, tau3-Bench y SWE-Bench, pero no proporciona cifras numéricas en la información disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 24 GB solo para los pesos en AWQ INT4, más overhead de activaciones, caché KV y el codificador visual; en la práctica se recomienda un mínimo de 28-32 GB de VRAM para contextos moderados.
- Contexto largo: con 131.072 tokens, la caché KV crece de forma significativa; el patrón de atención local/global con ventana de 2048 y GQA 16:1 reduce este coste frente a un transformer de atención completa, pero se recomienda planificar 40-80 GB de VRAM para contextos muy largos.
- GPUs recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB para despliegues de producción con contexto largo; RTX 4090 24 GB o RTX 5090 para inferencia en consumo con contexto moderado y cuantización INT4.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) de forma ajustada y en GPUs con 32 GB o más con mayor holgura; en GPUs de 16 GB no es viable sin cuantizaciones adicionales no disponibles en este repo.
- Opciones de despliegue: transformers con soporte de compressed-tensors, endpoints compatibles indicados en los tags; vLLM, TGI y llama.cpp no están confirmados para este formato en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-AWQ-INT4 (esta ficha) | ~29,6B (incl. ~1,8B vision) | 131.072+ | Texto + imagen de entrada | Apache 2.0 | Hugging Face, 24,02 GB |
| Muse-Glimmer-30B (base) | ~29,6B | 131.072+ | Texto + imagen de entrada | Apache 2.0 | Hugging Face, 48,1 GB |
| Alternativas de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos comparables en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos: el modelo se entrena con datos públicos multilingües; no se documentan evaluaciones de sesgo en la información disponible, por lo que se recomienda auditoría previa a producción.
- Alucinación: como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en tareas de búsqueda o razonamiento abierto; la recuperación ante fallos de herramientas no elimina el riesgo de respuestas erróneas.
- Contexto e idioma: aunque se declaran más de 100 idiomas, no se especifica la lista ni la calidad por idioma; el rendimiento en idiomas de bajos recursos puede ser inferior.
- Cuantización: la versión AWQ INT4 puede degradar ligeramente la precisión respecto al modelo en precisión completa, especialmente en tareas de razonamiento matemático o código; la calibración STEM/agentica mitiga pero no elimina esta pérdida.
- Licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y verificar las condiciones de los datos de entrenamiento originales, no detalladas en la model card.
- Producción: el modelo está orientado a despliegue local; no se documentan latencias ni throughput, por lo que es necesario realizar pruebas de carga propias antes de comprometer SLA.
- Compatibilidad de scaffolds: se mencionan OpenClaw y Hermes Agent, pero no se garantiza compatibilidad con otros frameworks agenticos sin adaptación.
- Repositorio: 680 descargas y 11 likes indican adopción limitada; conviene verificar la reproducibilidad de la cuantización y comparar con el modelo base antes de adoptarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cyankiwi/Muse-Glimmer-30B-AWQ-INT4
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Web de cyankiwi: https://cyan.kiwi/
- Perfil de cyankiwi en Hugging Face: https://huggingface.co/cyankiwi
- Perfil de cyankiwi en ModelScope: https://www.modelscope.ai/organization/cyankiwi
- X (Twitter) de cyankiwi: https://x.com/cyankiwi_ai
- Reddit de cyankiwi: https://www.reddit.com/r/cyankiwi/
- Contacto: mailto:ton@cyan.kiwi
- Dataset de calibración: https://huggingface.co/datasets/cyankiwi/calibration
- Paper del codificador de percepción: https://arxiv.org/abs/2504.13181
- Paper adicional referenciado en tags: https://arxiv.org/abs/2602.06036
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Despliegue en endpoints de cyankiwi: https://cyan.kiwi/workspace?prompt=Deploy%20cyankiwi/Muse-Glimmer-30B-AWQ-INT4
