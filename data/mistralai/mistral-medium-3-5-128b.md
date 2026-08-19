# mistralai/Mistral-Medium-3.5-128B

## Resumen

Mistral Medium 3.5 128B es el primer modelo insignia fusionado de Mistral AI, presentado en marzo de 2026. Se trata de un modelo denso de aproximadamente 128.000 millones de parámetros con una ventana de contexto de 256.000 tokens, que unifica en un único conjunto de pesos capacidades de instrucción, razonamiento y generación de código. Sustituye a Mistral Medium 3.1 y Magistral en Le Chat, y a Devstral 2 en el agente de código Vibe, consolidando en un solo modelo lo que antes requería varios especializados.

El modelo acepta entrada multimodal (texto e imagen) y produce salida de texto. Su principal innovación es un nivel de razonamiento configurable por petición (`reasoning_effort`), lo que permite alternar entre respuestas rápidas y un modo de razonamiento profundo con cómputo adicional en tiempo de prueba. Incluye además un encoder de visión entrenado desde cero para manejar tamaños y proporciones de imagen variables. Se distribuye bajo una licencia MIT modificada, que permite uso comercial y no comercial con excepciones para empresas de grandes ingresos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, multimodal (texto e imagen) |
| Parametros totales | 127.704.210.176 (~128B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | FP8 (mencionado en tags); GGUF disponibles (afectados por corrección de config) |
| Idiomas soportados | en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn (24 idiomas) |
| Licencia | Modified MIT License (uso comercial y no comercial con excepciones para empresas de grandes ingresos) |
| Formato de pesos | Safetensors (también disponible modelo EAGLE para aceleración) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer densa de 128B parámetros, sin mezcla de expertos. Su ventana de contexto alcanza los 256.000 tokens, lo que permite procesar documentos extensos y conversaciones multi-turno largas. El encoder de visión fue entrenado desde cero para aceptar imágenes de tamaño y proporción variables, integrándose con el módulo de texto.

El entrenamiento incluye una fase de ajuste por instrucciones y razonamiento, con un mecanismo de esfuerzo de razonamiento configurable por petición. Esto permite que el mismo modelo responda rápidamente a consultas simples o dedique cómputo adicional a tareas complejas y agenticas. La inferencia puede acelerarse mediante un modelo EAGLE específico publicado por Mistral, que implementa decodificación especulativa para vLLM y SGLang. Se recomienda usar la configuración de Transformers corregida (commit c4be198) para evitar degradación de rendimiento en contextos largos.

## Capacidades

- Generación de texto e instrucciones en 24 idiomas, con fuerte adherencia a system prompts.
- Razonamiento configurable: modo rápido (`reasoning_effort="none"`) y modo profundo (`reasoning_effort="high"`) con cómputo en tiempo de prueba.
- Visión: análisis de imágenes y extracción de información visual, además de texto.
- Function calling nativo y salida JSON estructurada para integraciones agénticas.
- Capacidades agénticas de nivel superior, incluyendo razonamiento multi-paso y uso de herramientas.
- Contexto largo de 256k tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Soporte para decodificación especulativa mediante el modelo EAGLE asociado.

## Casos de uso

- Asistente de código en producción: integrable en el agente Vibe de Mistral o en pipelines CI/CD para generación, revisión y corrección de código con razonamiento profundo y function calling.
- Atención al cliente multilingüe: gestión de conversaciones multi-turno en 24 idiomas con contexto de 256k tokens, permitiendo mantener el historial completo de interacciones y documentos de referencia.
- Análisis de documentos extensos: procesamiento de contratos, informes o artículos de investigación de cientos de páginas gracias a la ventana de contexto amplia.
- Razonamiento matemático y científico: uso del modo `reasoning_effort="high"` para problemas complejos de matemáticas, física o lógica que requieren cadenas de razonamiento largas.
- Extracción de información de imágenes: análisis de capturas, diagramas o documentos escaneados combinando visión y texto para generar resúmenes o datos estructurados.
- Automatización agéntica con herramientas: ejecución de tareas multi-paso que requieren llamadas a APIs, consultas a bases de datos o navegación web, gracias al soporte nativo de function calling y JSON.
- Traducción y localización: traducción entre los 24 idiomas soportados, con control de estilo y tono mediante system prompts.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en benchmarks agénticos:

| Benchmark | Resultado |
|---|---|
| τ³-Telecom | 91,4% |
| SWE-Bench Verified | 77,6% |

No se han publicado en la información disponible los valores numéricos de otros benchmarks (instrucción, razonamiento matemático o coding general). Las gráficas comparativas mostradas en la model card no son accesibles en texto. Según Mistral, el modelo supera a todos sus predecesores de codificación (Devstral) en todos los benchmarks y reemplaza a Devstral 2 en el agente Vibe.

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware en la información proporcionada. Las siguientes son estimaciones orientativas basadas en el tamaño del modelo y el formato FP8 mencionado en los tags:

- VRAM estimada para inferencia: aproximadamente 128 GB en FP8, 256 GB en BF16. Con cuantización de 4 bits (GGUF) podría reducirse a unos 70-80 GB, aunque no se confirma oficialmente.
- GPUs recomendadas: para FP8, una H100 de 80 GB no es suficiente; se necesitan múltiples GPUs (por ejemplo, 2× H100 80 GB o 4× A100 80 GB) o una GPU con 128 GB+ (como A100 80GB en configuración multi-GPU). Para cuantización de 4 bits, una sola RTX 4090 de 24 GB no es suficiente; se requeriría una GPU con al menos 48-64 GB o varias GPUs.
- No cabe en GPUs de consumo habitual (24 GB o menos) en su formato original; requiere configuraciones multi-GPU o cuantización agresiva.
- Opciones de despliegue: vLLM y SGLang recomendados por Mistral (con soporte para el modelo EAGLE de decodificación especulativa). También es posible usar llama.cpp con archivos GGUF, siempre que se use la configuración corregida.
- Latencia y throughput: no disponibles oficialmente. El modelo EAGLE puede acelerar la inferencia, pero no se especifican cifras concretas.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos comparativos directos con otros modelos de la misma categoría (dense ~128B, contexto 256k). Mistral indica que el modelo reemplaza a sus predecesores internos:

| Modelo | Parámetros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| Mistral Medium 3.5 128B | ~128B | 256k | MIT modificada | Modelo actual, unificado |
| Mistral Medium 3.1 | No disponible | No disponible | No disponible | Predecesor, superado en instrucción, razonamiento y codificación |
| Devstral 2 | No disponible | No disponible | No disponible | Modelo de codificación, reemplazado en Vibe |
| Magistral | No disponible | No disponible | No disponible | Modelo de razonamiento, reemplazado en Le Chat |

No se incluyen comparativas con modelos de otros fabricantes (por ejemplo, Llama 3.1 405B o Qwen2.5-72B) por falta de datos en la información disponible.

## Limitaciones y advertencias

- La licencia MIT modificada excluye el uso comercial para empresas con grandes ingresos; es necesario revisar el texto completo de la licencia antes de su uso en producción.
- Existe un riesgo inherente de alucinación, especialmente en tareas de razonamiento complejo o con datos poco frecuentes en el entrenamiento.
- La configuración original de Transformers presentaba un error que degradaba el rendimiento en contextos largos; debe usarse la configuración corregida (commit c4be198) para evitar problemas.
- Los archivos GGUF generados con la configuración anterior a la corrección también están afectados; se recomienda regenerarlos con la configuración correcta.
- El modelo no es adecuado para tareas de generación de audio ni salida multimodal (solo entrada de imagen y texto, salida de texto).
- El razonamiento configurable requiere ajustar los parámetros de temperatura y top-p según el modo; usar valores inadecuados puede degradar la calidad de las respuestas.
- El tamaño del modelo (267 GB en safetensors) implica requisitos de hardware elevados para despliegue local; no es viable en equipos de consumo sin cuantización agresiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mistralai/Mistral-Medium-3.5-128B
- Blog de Mistral sobre el modelo: https://mistral.ai/news/vibe-remote-agents-mistral-medium-3-5
- Modelo EAGLE para decodificación especulativa: https://huggingface.co/mistralai/Mistral-Medium-3.5-128B-EAGLE
- Commit de corrección de la configuración de Transformers: https://huggingface.co/mistralai/Mistral-Medium-3.5-128B/commit/c4be198050fb5789774a55b92ed697becfbf20ae
- Licencia del modelo: https://huggingface.co/mistralai/Mistral-Medium-3.5-128B/blob/main/LICENSE
- Repositorio de Mistral Vibe: https://github.com/mistralai/mistral-vibe
