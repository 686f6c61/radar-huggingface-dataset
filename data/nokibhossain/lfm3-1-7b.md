# Nokibhossain/LFM3-1.7B

## Resumen

LFM3-1.7B es un modelo de lenguaje de 1.730 millones de parámetros (1.728.801.536 exactos según los pesos en safetensors) desarrollado por Liquid AI y publicado originalmente en el repositorio `LiquidAI/LFM3-1.7B`. Esta ficha corresponde a la copia alojada por el usuario `Nokibhossain` bajo el identificador `Nokibhossain/LFM3-1.7B`, que se declara como *finetune* del checkpoint base `LiquidAI/LFM3-1.7B-Base`. El modelo emplea una arquitectura tri-híbrida de 24 capas que combina convoluciones cortas con compuerta, atención de ventana deslizante y atención global, y está orientado explícitamente a agentes locales, *tool calling* y salidas estructuradas.

Su rasgo más diferencial es la relación entre ventana de contexto y huella de memoria: 256.000 tokens de contexto con un modelo que, según la model card, ocupa aproximadamente 1 GB en precisión de 4 bits, lo que lo sitúa en el rango de ejecución en teléfonos y portátiles de gama media. Liquid AI lo posiciona como una pieza para especializar por dominio mediante *fine-tuning* en una sola GPU, no como un modelo de propósito general para razonamiento complejo.

Es relevante ahora porque consolida la tendencia de modelos sub-2B con contexto largo y entrenamiento orientado a agentes, un nicho donde hasta hace poco dominaban modelos de 7B o más. Conviene señalar que este repositorio concreto acumula 0 descargas y 0 *likes*, y su model card reproduce el material de Liquid AI sin adaptaciones; para uso en producción es preferible referenciar el repositorio oficial del autor original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tri-hibrido: 24 capas (13 convoluciones cortas con compuerta, 5 de atencion de ventana deslizante, 6 de atencion global) |
| Parametros totales | 1.728.801.536 (1,73B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 256.000 tokens (entrada + salida) |
| Tipos de cuantizacion | El repositorio solo publica safetensors; no se listan cuantizaciones propias. La model card indica ~1 GB de memoria a 4 bits |
| Idiomas soportados | Ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, espanol, vietnamita, tailandes, indonesio, hindi, ruso, polaco |
| Licencia | LFM Open License v1.0 (`lfm1.0`, etiquetada como `other` en HuggingFace) |
| Formato de pesos | safetensors (requiere `trust_remote_code=True` por el tag `custom_code`) |
| Vocabulario | 128.000 tokens |
| Tamano del repositorio | 3,5 GB |
| Modelo base | LiquidAI/LFM3-1.7B-Base |
| Tipo de checkpoint | Post-entrenado, solo texto |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un híbrido de tres mecanismos dispuestos en 24 capas: 13 capas de convolución corta con compuerta (*gated short convolutions*), 5 capas de atención de ventana deslizante y 6 capas de atención global. Este diseño busca reducir el coste cuadrático de la atención completa en secuencias largas manteniendo, gracias a las capas de atención global, la capacidad de recuperar información distribuida a lo largo de la ventana de 256.000 tokens. El vocabulario de 128.000 tokens es notablemente amplio para un modelo de este tamaño y explica en parte la cobertura de 16 idiomas, incluyendo español, árabe, hindi, tailandés y vietnamita.

El checkpoint es un modelo post-entrenado sobre `LiquidAI/LFM3-1.7B-Base`. La model card indica que el post-entrenamiento está orientado a *harnesses* de agentes como Hermes Agent, Pi y OpenClaw, lo que implica datos de entrenamiento con trayectorias de llamadas a herramientas, formatos estructurados y conversación multi-turno. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas concretas de RLHF, DPO o RL con verificadores. Tampoco se detalla si el modelo incorpora decodificación especulativa u otras optimizaciones de inferencia.

La innovación técnica destacable es la combinación de convoluciones con compuerta y atención híbrida en un modelo de 1,7B parámetros, que permite sostener 256K de contexto con una huella de memoria muy contenida. El repositorio incluye código personalizado (`custom_code`), por lo que la carga requiere `trust_remote_code=True` y conviene auditar el código antes de desplegarlo en entornos controlados.

## Capacidades

- Generación de texto conversacional multi-turno con hasta 256.000 tokens de contexto compartido entre entrada y salida.
- *Tool calling* y *function calling*: el post-entrenamiento está diseñado para *harnesses* de agentes (Hermes Agent, Pi, OpenClaw).
- Salidas estructuradas (JSON y formatos definidos por esquema), según la model card.
- Ejecución de flujos de agente de varios pasos, con la salvedad de que el propio autor desaconseja el razonamiento multi-paso complejo por el tamaño del modelo.
- Capacidades multilingües en 16 idiomas: inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Especialización por dominio mediante *fine-tuning* rápido en una sola GPU, que Liquid AI presenta como uso principal.
- Despliegue en el extremo (*edge*): pensado para ejecutarse en teléfonos y portátiles.
- No se documentan capacidades de visión, audio, modo *thinking* explícito ni decodificación especulativa en la información disponible.

## Casos de uso

- **Agentes locales en dispositivos de usuario**: con ~1 GB a 4 bits y 256K de contexto, el modelo puede gestionar un agente personal que mantiene el estado de una conversación larga en un portátil o un móvil, sin depender de la nube. Adecuado por su huella de memoria y su entrenamiento específico en *harnesses* de agente.
- **Automatización de atención al cliente con contexto documental**: la ventana de 256K permite insertar manuales, histórico de tickets y políticas de la empresa en un único prompt. La model card recomienda usar recuperación (*retrieval*) para tareas con mucha carga de conocimiento, así que el patrón correcto sería RAG sobre el contexto largo y no confiar en el conocimiento paramétrico.
- **Extracción de datos estructurados en pipelines ETL**: el modelo puede convertir texto libre (correos, facturas en texto, formularios) en JSON con un esquema fijo. Encaja por su soporte declarado de salidas estructuradas y por el coste bajo de inferencia, que permite procesar volúmenes altos en CPU o en una única GPU consumer.
- **Enrutamiento de intenciones y *tool calling* en asistentes de voz o chat**: usar el modelo como primera capa que decide qué herramienta invocar y con qué argumentos, delegando la respuesta final a un modelo mayor. Su ventana larga permite incluir el catálogo completo de herramientas en el prompt.
- **Asistente de documentación técnica en el IDE o en un wiki interno**: con *fine-tuning* sobre el corpus de la organización, el modelo puede responder preguntas sobre APIs internas citando los fragmentos recuperados. Es un escenario de especialización de dominio, que es exactamente el uso que la model card promueve.
- **Procesamiento por lotes en el extremo o en CPU**: clasificación de textos, resumen de correos o normalización de datos en entornos sin GPU. A 4 bits y ~1 GB, es viable en hardware de gama baja donde un 7B no cabría.
- **Base para *fine-tuning* rápido en una sola GPU**: equipos con una RTX 4090 o una A100 pueden adaptar el modelo a un formato o dominio concreto en horas, en lugar de entrenar desde cero.
- **Traducción y atención multilingüe de bajo coste**: los 16 idiomas declarados, incluyendo español, permiten cubrir mercados secundarios sin desplegar un modelo multilingüe grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni de evaluaciones de *tool calling*, y no se dispone de datos de latencia o *throughput* medidos.

## Requisitos de hardware

- **VRAM en bf16/fp16**: los pesos ocupan aproximadamente 3,5 GB (tamaño del repositorio); con caché KV para contextos largos, el consumo real será mayor. Cabe en GPUs de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070) y en 6 GB con contextos moderados.
- **VRAM a 8 bits**: en torno a 1,8 GB solo de pesos, más caché KV.
- **VRAM a 4 bits**: aproximadamente 1 GB según la model card, lo que permite ejecución en teléfonos y portátiles recientes.
- **GPU recomendadas**: para desarrollo y *fine-tuning*, una RTX 4090 (24 GB) o una A100 (40/80 GB) cubren el ajuste completo o LoRA con comodidad. Para inferencia en producción con concurrencia, A100 o H100 dan margen para lotes grandes con contexto largo.
- **Consumer GPU**: sí, es uno de sus puntos fuertes. Cualquier GPU con 8 GB o más puede ejecutar el modelo en bf16; con cuantización de 4 bits baja a hardware integrado.
- **Opciones de despliegue**: `transformers` con `trust_remote_code=True` (obligatorio por el código personalizado); la model card menciona variantes de checkpoint por *framework*, aunque la tabla aparece truncada en la información disponible. No se confirman en este repositorio pesos GGUF ni soporte verificado en vLLM, llama.cpp, Ollama o TGI; el ecosistema LFM suele distribuir formatos adicionales desde los repositorios oficiales de Liquid AI.
- **Latencia y throughput**: no disponibles. La arquitectura híbrida con solo 6 capas de atención global debería reducir el coste por token en contextos largos frente a un transformer denso equivalente, pero no hay cifras publicadas que lo cuantifiquen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|
| LFM3-1.7B (este repo) | 1,73B | 256K | LFM Open License v1.0 | HuggingFace, safetensors, `custom_code` | No disponible |
| LiquidAI/LFM3-1.7B | 1,73B | 256K | LFM Open License v1.0 | Repositorio oficial de Liquid AI, con variantes de checkpoint por framework | No disponible |
| LFM2-1.2B (Liquid AI, generacion anterior) | 1,2B | 32K (referencia de la ficha publica de LFM2) | LFM Open License v1.0 | HuggingFace, GGUF disponible en el ecosistema LFM | No disponible |
| Qwen3-1.7B | 1,7B | 32.768 tokens nativos (extensible con YaRN) | Apache 2.0 | HuggingFace, amplio soporte en vLLM, llama.cpp y Ollama | No disponible en esta ficha |
| Gemma 3 1B | ~1B | 32K | Gemma Terms of Use | HuggingFace, soporte amplio en el ecosistema | No disponible en esta ficha |

Los datos de contexto y licencia de los modelos de comparación provienen de sus fichas públicas y deben verificarse antes de tomar decisiones de producción. La ventaja diferencial de LFM3-1.7B frente a Qwen3-1.7B y Gemma 3 1B es la ventana de 256K, ocho veces mayor; su desventaja es una licencia propia (LFM Open License v1.0) en lugar de Apache 2.0, lo que exige revisar las cláusulas de uso comercial.

## Limitaciones y advertencias

- **Este repositorio no es la fuente original**: `Nokibhossain/LFM3-1.7B` es una copia o *finetune* de terceros con 0 descargas y 0 *likes*, creada y actualizada en el mismo instante (2026-10-28). No hay evidencia de que los pesos hayan sido modificados ni validados; para producción, usar `LiquidAI/LFM3-1.7B`.
- **Rendimiento en razonamiento limitado por diseño**: la propia model card desaconseja el modelo para *agentic coding* y razonamiento multi-paso complejo. No debe emplearse como sustituto de un modelo de 30B o más en tareas de planificación.
- **Conocimiento paramétrico escaso**: Liquid AI recomienda explícitamente usar recuperación o búsqueda para tareas con mucha carga de conocimiento, lo que implica un riesgo alto de alucinación si se pregunta por hechos sin contexto.
- **Código personalizado**: el tag `custom_code` obliga a `trust_remote_code=True`; auditar el código de modelado antes de ejecutarlo en entornos con datos sensibles.
- **Licencia no permisiva por defecto**: LFM Open License v1.0 no es Apache 2.0 ni MIT. Hay que revisar los términos concretos (umbrales de facturación, atribución, restricciones de uso) antes de un despliegue comercial.
- **Cuantizaciones no verificadas en este repo**: solo hay safetensors; los formatos GGUF u ONNX deben buscarse en los repositorios oficiales y verificarse.
- **Cobertura multilingüe desigual**: los 16 idiomas están declarados, pero no se publican evaluaciones por idioma; el rendimiento en tailandés, vietnamita o hindi puede ser notablemente inferior al de inglés.
- **Sesgos**: no se documenta en la información disponible ninguna evaluación de sesgos, toxicidad o alineación. Un modelo post-entrenado para agentes puede mostrar una obediencia excesiva a instrucciones inyectadas en el contexto, especialmente con 256K de ventana.
- **Contexto largo y atención**: aunque la ventana es de 256K, no hay datos publicados sobre *needle-in-a-haystack* o recuperación efectiva a esa distancia; no asumir que toda la ventana es igual de utilizable.
- **Sin benchmarks**: la ausencia total de métricas publicadas impide comparar su calidad objetivamente con alternativas; cualquier decisión debe basarse en una evaluación propia sobre el caso de uso.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Nokibhossain/LFM3-1.7B
- Modelo oficial de Liquid AI: https://huggingface.co/LiquidAI/LFM3-1.7B
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Colección de la familia LFM3: https://huggingface.co/collections/LiquidAI/lfm3
- Blog de lanzamiento de LFM3: https://www.liquid.ai/blog/lfm3
- Documentación: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground: https://playground.liquid.ai/
- Consola / API: https://console.liquid.ai/dashboard
- Licencia LFM Open License v1.0: incluida en el archivo `LICENSE` del repositorio
