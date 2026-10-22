# baselabs/mammoth-1

## Resumen

mammoth-1 es un modelo de decisión tipado ("typed decision model") publicado por baselabs. Se trata de un ajuste fino completo (full fine-tune) del modelo base Qwen/Qwen3.5-27B, con 27.356.728.560 parámetros reales según los pesos en safetensors. Su particularidad es que no genera texto: dada una petición compuesta por una o varias preguntas, cada una con un conjunto cerrado de opciones, devuelve una probabilidad por opción calculada a partir de un único prefill de prefijo compartido.

El interés de este diseño es de eficiencia y de control. Al no haber decodificación autoregresiva, el coste de inferencia se reduce a una pasada de prefill sobre el prefijo común más el cálculo de las puntuaciones por pregunta, y la salida queda restringida al espacio de opciones definido por quien llama, lo que elimina por construcción la deriva del texto libre.

La información publicada es muy escasa: la model card es de una sola frase, no hay resultados de benchmarks, no se detalla la composición del dataset de ajuste ni el procedimiento de entrenamiento, y no se especifican idiomas. Con 21 descargas y 16 likes en el momento de la consulta, es un modelo reciente (creado el 19 de octubre de 2026) y de nicho, orientado a equipos que quieran sustituir clasificadores ligeros o llamadas generativas por un motor de decisión de 27B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; derivada de Qwen/Qwen3.5-27B (tag `qwen3_5`), con cabeza de decisión para salida de probabilidades por opción |
| Parámetros totales | 27.356.728.560 (≈27,36 mil millones) |
| Parámetros activos | No aplica; no se documenta una arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No se publican cuantizaciones (ni GGUF, ni AWQ, ni GPTQ, ni FP8). El repositorio contiene únicamente safetensors |
| Idiomas soportados | No disponible |
| Licencia | Ambigua: la etiqueta del repositorio indica `mit`, mientras que la model card declara `license: other` con `license_name: mit`. Verificar con el autor antes de uso comercial |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-27B (ajuste fino completo) |
| Tamaño del repositorio | 109,4 GB |
| Precisión de los pesos | Deducida: 109,4 GB / 27.356.728.560 parámetros ≈ 4 bytes por parámetro, consistente con FP32 |
| Pipeline de HuggingFace | No disponible |
| Fecha de creación / actualización | 2026-10-19 / 2026-10-21 |
| Descargas / likes | 21 / 16 |

## Arquitectura y entrenamiento

La model card indica únicamente que mammoth-1 es un ajuste fino completo de Qwen/Qwen3.5-27B. No se especifica si se congelaron capas, qué cabeza se añadió para producir la distribución de probabilidad por opción, ni cómo se codifican las opciones en la entrada. Tampoco se documenta si el modelo reutiliza el vocabulario y la tokenización del base de forma estándar o si introduce tokens especiales para delimitar preguntas y opciones.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras etapas de alineación, ni sobre innovaciones técnicas concretas más allá del mecanismo de "prefijo compartido": todas las preguntas de una misma petición se resuelven a partir de un único prefill del contexto común, en lugar de ejecutar una pasada por pregunta. Tampoco se publica ninguna métrica de calibración de las probabilidades, dato crítico en un modelo cuya salida es precisamente una distribución de probabilidad.

## Capacidades

- Respuesta a preguntas de opción múltiple con salida de probabilidad por opción, sin generación de texto.
- Resolución de varias preguntas dentro de una misma petición a partir de un único prefill de prefijo compartido.
- Salida estructurada y tipada: el espacio de respuestas queda acotado a las opciones proporcionadas por el llamante.
- Ajuste fino completo sobre Qwen3.5-27B, por lo que hereda el conocimiento del modelo base en la medida en que el fine-tune no lo haya desplazado (no verificado).
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo podría actuar como capa de decisión dentro de un agente, pero no se describe ningún modo de razonamiento explícito.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.

## Casos de uso

- Enrutamiento de consultas en atención al cliente: dado un mensaje de usuario y un conjunto de categorías o colas de destino (facturación, soporte técnico, bajas, etc.), el modelo devuelve la probabilidad de cada categoría en una sola pasada, lo que permite umbrales de confianza y derivación a revisión humana cuando la distribución es plana.
- Selección de herramienta en pipelines de agentes: en lugar de pedir a un LLM generativo que emita el nombre de la función, se define un conjunto cerrado de herramientas como opciones y se usa mammoth-1 como cabecera de decisión, con la ventaja de que la salida siempre es una etiqueta válida.
- Moderación y clasificación de contenido con taxonomías tipadas: definir las políticas como opciones (permitido, spam, acoso, contenido sensible) y obtener la probabilidad por política sobre el mismo prefijo de conversación.
- Triaje en soporte interno o mesas de ayuda: clasificar tickets por urgencia y equipo responsable en una única petición con varias preguntas, aprovechando el prefill compartido para no repetir el coste del contexto largo por cada pregunta.
- Anotación asistida y control de calidad de datasets: preetiquetar con probabilidades en lugar de etiquetas duras, de modo que el equipo pueda priorizar la revisión humana sobre los casos de baja confianza.
- Experimentación A/B y asignación de variantes: usar la distribución de salida como política estocástica controlada, con la posibilidad de fijar umbrales deterministas cuando se requiera reproducibilidad.
- Extracción de señales en formularios o encuestas: mapear respuestas abiertas a opciones predefinidas (rangos de importe, sectores, motivos de contacto) manteniendo la incertidumbre en la salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de exactitud, calibración (ECE, Brier), latencia ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del número de parámetros (no son cifras publicadas por el autor): FP32 ≈109 GB solo de pesos; BF16 ≈55 GB; FP8 ≈27 GB; 4 bits ≈14-15 GB.
- En el formato publicado (FP32) no cabe en una sola GPU de 80 GB: harían falta al menos dos A100/H100 de 80 GB, o bien convertir los pesos antes de desplegar.
- En BF16 cabe ajustadamente en una H100 80 GB o A100 80 GB, con margen reducido para KV cache y activaciones.
- En 4 bits cabría en GPU de consumo como la RTX 4090 (24 GB) o la RTX 3090 (24 GB); en 8 bits, en una RTX 4090 queda muy justo y sería preferible una GPU de 48 GB o superior. Las cuantizaciones habría que generarlas, porque no se publican.
- Opciones de despliegue: no hay información sobre compatibilidad con vLLM, llama.cpp, Ollama o TGI. Al tratarse de un modelo con cabeza de decisión y salida no generativa, es probable que requiera código específico del autor, que no se incluye en la información disponible.
- Latencia y throughput: no disponibles. Cualitativamente, el diseño de prefill compartido y la ausencia de decodificación reducen el coste frente a un modelo generativo del mismo tamaño, pero no se aportan medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| baselabs/mammoth-1 | 27,36 mil millones | No disponible | Probabilidad por opción, sin texto | `mit` según etiqueta, `other`/`mit` según model card | HuggingFace, safetensors |
| Qwen/Qwen3.5-27B (modelo base) | 27B (según denominación) | No disponible en la información proporcionada | Texto generativo | No disponible en la información proporcionada | HuggingFace |
| Otros modelos de decisión o clasificación de tamaño comparable | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables de la misma categoría (motores de decisión tipados construidos sobre un LLM de 27B). La comparación relevante es con el base: mammoth-1 sacrifica la generación libre a cambio de salidas acotadas y de un coste de inferencia menor por petición, a costa de perder toda funcionalidad de texto.

## Limitaciones y advertencias

- La model card es de una sola frase: no hay información sobre dataset, metodología de entrenamiento, evaluación ni calibración. Cualquier uso en producción parte de una base documental mínima.
- Las probabilidades no están validadas: no se publican métricas de calibración, y un modelo de 27B ajustado para emitir distribuciones puede producir confianzas mal calibradas, especialmente en opciones fuera de la distribución de entrenamiento.
- El riesgo de alucinación de texto es inexistente por diseño (no genera texto), pero existe el riesgo equivalente de asignar probabilidad alta a una opción incorrecta cuando la petición es ambigua o ninguna opción es adecuada. No se documenta si el modelo soporta una opción de "ninguna de las anteriores".
- No se especifican idiomas soportados; el comportamiento fuera del inglés (o del idioma mayoritario del ajuste) es desconocido.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento con prefijos largos, que es justamente el escenario que el diseño de prefijo compartido pretende optimizar.
- Ambigüedad de licencia: la etiqueta del repositorio dice `mit`, pero la model card declara `license: other` con `license_name: mit`. Es una discrepancia que conviene resolver por escrito con el autor antes de un uso comercial.
- Compatibilidad de despliegue incierta: no se documenta el código necesario para la cabeza de decisión ni el formato exacto de entrada/salida; los servidores de inferencia estándar probablemente no la soportan sin adaptaciones.
- El repositorio ocupa 109,4 GB en FP32, lo que encarece el almacenamiento y la descarga, y obliga a convertir pesos antes de desplegar en hardware habitual.
- Modelo con muy poca adopción (21 descargas): sin comunidad que haya verificado su comportamiento.

## Enlaces

- HuggingFace: https://huggingface.co/baselabs/mammoth-1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
