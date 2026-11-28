# AEON-7/Step-3.7-Flash-AEON-Ultimate-Abliterated-BF16

## Resumen

Step-3.7-Flash-AEON-Ultimate-Abliterated-BF16 es una versión modificada ("abliterated") del modelo stepfun-ai/Step-3.7-Flash, publicado por el usuario AEON-7 en Hugging Face. Se trata de un modelo de lenguaje y visión de tipo sparse-MoE (mezcla de expertos dispersa) con aproximadamente 201.365 millones de parámetros totales y cerca de 11.000 millones activos por token, según indica la model card. El autor ha eliminado el comportamiento de rechazo (refusal) mediante proyección ortogonal de un subespacio de rechazo medido sobre cada peso que escribe en el flujo residual, manteniendo supuestamente intactas las capacidades generales, el razonamiento en cadena de pensamiento, el uso de herramientas y la ruta de visión.

El modelo base es un modelo de visión-lenguaje con modo "thinking" (razonamiento explícito) y arquitectura MoE, orientado a cargas de trabajo agénticas, generación de código y conversación multi-turno con contexto largo. La versión AEON se distribuye en BF16 (bfloat16) y está etiquetada para despliegue en hardware ARM64 con GPU Blackwell (DGX Spark, GB10, sm_121a), además de soportar vLLM, prefix caching, chunked prefill y una API compatible con OpenAI.

Su relevancia actual radica en dos factores: por un lado, ofrece una variante sin filtros de rechazo para investigación de seguridad, red-teaming y despliegue local no censurado; por otro, conserva la licencia Apache-2.0 del modelo base, lo que facilita su uso comercial, aunque el propio autor advierte que la ausencia de rechazos traslada toda la responsabilidad al operador. El repositorio ocupa 402,7 GB y acumula 181 descargas y 4 "me gusta" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer sparse-MoE (mezcla de expertos) multimodal vision-lenguaje, con modo thinking |
| Parametros totales | 201.365.316.160 (~201,4 B) |
| Parametros activos | ~11 B (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 / bfloat16 (única variante publicada en este repo); no se detallan otras |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers, con custom_code) |

## Arquitectura y entrenamiento

El modelo base Step-3.7-Flash emplea una arquitectura de mezcla de expertos dispersa (sparse MoE) con capacidad multimodal de entrada imagen-texto y salida texto, e incluye un modo de razonamiento explícito ("thinking"). La model card indica que el modelo completo ronda los 198.000 millones de parámetros con aproximadamente 11.000 millones activos por token, lo que sitúa la inferencia en un régimen de coste computacional comparable a modelos densos mucho más pequeños, a costa de un mayor consumo de memoria por los pesos totales.

La modificación AEON consiste en una "abliteración" a nivel de experto (expert-granular abliteration): se mide un subespacio de rechazo y se proyecta ortogonalmente fuera de todos los pesos que escriben en el flujo residual. El autor afirma que este procedimiento preserva la capacidad general, el razonamiento en cadena y la ruta de visión. No se proporcionan en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el modelo base. Tampoco se detallan innovaciones adicionales más allá de las funcionalidades de despliegue (prefix caching, chunked prefill) y del soporte para hardware ARM64/Blackwell.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento explícito en modo "thinking" (cadena de pensamiento).
- Generación y asistencia de código (etiquetas "coding").
- Capacidades matemáticas y de razonamiento lógico (implícitas en el modo thinking; sin benchmarks publicados).
- Visión-lenguaje: entrada de imagen y texto, salida de texto (pipeline image-text-to-text).
- Soporte de tool calling y function calling.
- Soporte de flujos agénticos y razonamiento multi-paso (etiquetas "agentic").
- Despliegue compatible con API OpenAI (endpoints_compatible, openai-api).
- Optimizaciones de inferencia: prefix caching y chunked prefill.
- Comportamiento de rechazo eliminado (refusal-removed, uncensored, unfiltered).
- Multilingüe: limitado a inglés según la model card.

## Casos de uso

- Investigación de seguridad y red-teaming: el modelo permite estudiar cómo responde un LLM sin capa de rechazo ante prompts adversarios, lo que resulta útil para calibrar clasificadores de entrada y filtros de salida en pipelines de moderación.
- Despliegue local no censurado en hardware ARM64: gracias a las etiquetas dgx-spark, gb10 y sm_121a, está pensado para ejecutarse en estaciones Grace-Blackwell con pesos BF16, útil en entornos de investigación con requisitos de privacidad y control total del stack.
- Asistente de código en pipelines de CI/CD: con soporte de tool calling y function calling, puede integrarse en flujos que invocan linters, compiladores o APIs de repositorio para revisar parches y sugerir correcciones.
- Agentes autónomos multi-paso: la combinación de modo thinking, tool calling y contexto largo (long-context) permite orquestar tareas que requieren planificación, llamadas a herramientas y verificación de resultados.
- Análisis de documentos con imágenes: al ser un modelo vision-lenguaje, puede procesar capturas, diagramas o formularios junto a texto para extraer información estructurada en flujos de back-office.
- Generación de contenido creativo sin restricciones editoriales: útil en prototipado de narrativa, guiones o material de ficción donde el equipo asume la revisión humana posterior.
- Evaluación comparativa de alineación: sirve como referencia "sin rechazos" frente a modelos alineados para medir el impacto de las capas de seguridad en la calidad y utilidad de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: los pesos ocupan aproximadamente 402,7 GB (tamaño del repo), por lo que se requiere un nodo multi-GPU o una plataforma con memoria unificada grande; no cabe en una GPU de consumo individual.
- GPU recomendadas: plataformas Blackwell (GB10, DGX Spark, sm_121a) según las etiquetas del autor; para despliegues x86 se necesitarían varias GPU de datacenter (A100/H100/H200) con suficiente memoria agregada, aunque no se especifica el número exacto.
- GPU de consumo: no es viable en RTX 4090 ni similares en BF16; se requeriría cuantización adicional no publicada en este repositorio.
- Opciones de despliegue: transformers con custom_code, vLLM (etiqueta explícita), servidor compatible con API OpenAI; soporte de prefix caching y chunked prefill.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Step-3.7-Flash-AEON-Ultimate-Abliterated-BF16 | ~201,4 B | ~11 B | no disponible | Apache-2.0 | Variante abliterated del base, BF16, multimodal |
| stepfun-ai/Step-3.7-Flash (base) | ~198 B (según card) | ~11 B | no disponible | Apache-2.0 | Modelo original con rechazos intactos |
| Otras alternativas MoE de escala similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información consultada |

## Limitaciones y advertencias

- Eliminación deliberada del comportamiento de rechazo: el modelo puede producir contenido que un modelo alineado rechazaría; requiere capas de seguridad externas (validación de entrada, filtrado de salida, moderación, auditoría y revisión humana).
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; al derivar de un modelo entrenado principalmente en inglés, es previsible un sesgo cultural y lingüístico hacia ese idioma.
- Riesgo de alucinación: no cuantificado; como todo LLM, puede generar afirmaciones falsas con apariencia de veracidad, especialmente en modo thinking sin verificación externa.
- Limitación de idioma: solo inglés según la model card; el rendimiento en castellano no está garantizado.
- Longitud de contexto: no especificada, aunque las etiquetas mencionan long-context; conviene validar empíricamente el límite real.
- Requisitos de hardware elevados: 402,7 GB en BF16 imposibilitan el despliegue en GPU de consumo sin cuantización adicional no publicada.
- Licencia: Apache-2.0 permite uso comercial, pero la cláusula de responsabilidad del autor traslada al usuario toda la carga legal y ética; la idoneidad para producción depende de las capas de seguridad que se implementen.
- Madurez: 181 descargas y 4 "me gusta" indican una adopción muy limitada; no hay evidencia pública de validación independiente de las afirmaciones del autor sobre preservación de capacidades tras la abliteración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AEON-7/Step-3.7-Flash-AEON-Ultimate-Abliterated-BF16
- Modelo base: https://huggingface.co/stepfun-ai/Step-3.7-Flash
- Página de soporte del autor (LotusMake): https://lotusmake.com/support
- Resultados de búsqueda web no relacionados con el modelo (aeon.co, aeon-montagnes.com, flexipass-aeon.com, aeonathletics.com): no aportan información técnica sobre el modelo.
