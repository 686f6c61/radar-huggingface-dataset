# linellazatin/p-e-w_gpt-oss-20b-heretic-ara-v4-gguf

## Resumen

Este repositorio contiene una conversión a formato GGUF del modelo `p-e-w/gpt-oss-20b-heretic-ara-v4`, que a su vez es una modificación de `openai/gpt-oss-20b`. La conversión la ha realizado el usuario `linellazatin` con el objetivo declarado de poder ejecutar el modelo en hardware de consumo (concretamente una AMD Radeon RX 7700 XT de 12 GiB de VRAM bajo Fedora con backend Vulkan) mediante llama.cpp, ya que el checkpoint original en safetensors no se adaptaba bien a su entorno con vLLM.

El modelo subyacente es un Mixture-of-Experts de aproximadamente 20,9 mil millones de parámetros totales, desarrollado originalmente por OpenAI. La modificación "Heretic ARA v4" la firma `p-e-w` y aplica una técnica denominada Arbitrary-Rank Ablation (ARA) junto con preservación de normas de fila para reducir el comportamiento de rechazo (refusals) del modelo, intentando conservar sus capacidades generales. La conversión a GGUF no introduce entrenamiento adicional ni cambios de comportamiento: es puramente de formato.

Su relevancia práctica es doble: por un lado, permite ejecutar un MoE de ~21B en equipos con GPUs de gama media mediante llama.cpp y cuantización MXFP4; por otro, ofrece una variante con menor tasa de rechazos, útil para aplicaciones que requieren respuestas directas sobre temas que el modelo base podría declinar. La información publicada sobre el modelo original (evaluaciones, configuraciones exactas de la ablación, idiomas) no está incluida en esta conversión y debe consultarse en la model card de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), base GPT-OSS-20B |
| Parametros totales | 20.914.757.184 (~20,9B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 4096`, pero es un parámetro de ejecución, no una especificación del modelo) |
| Tipos de cuantizacion | Pesos en precisión mixta BF16, F32 y MXFP4 (expertos en MXFP4); sin cuantización adicional posterior a la conversión |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (entrada original en safetensors) |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-OSS-20B de OpenAI: un transformer con capas de mezcla de expertos (Mixture-of-Experts), con aproximadamente 20,9 mil millones de parámetros totales. Los pesos de los expertos se mantienen en MXFP4 (formato de 4 bits por bloque con escalas compartidas), mientras que el resto de tensores se exportan en BF16 o F32 según la selección automática del conversor. La conversión preservó la representación MXFP4 original mediante la funcionalidad de repacking de MXFP4 de llama.cpp, y no se aplicó ninguna cuantización posterior.

La modificación del modelo original la realizó `p-e-w` con la herramienta Heretic, que identifica y modifica el comportamiento de rechazo del modelo. En esta versión v4 se emplea Arbitrary-Rank Ablation (ARA) junto con preservación de normas de fila, una técnica de edición de pesos orientada a reducir las respuestas de rechazo minimizando el daño a las capacidades generales. No se dispone en esta información de detalles sobre el dataset de entrenamiento original de GPT-OSS-20B, el número de tokens, ni si hubo fases de RLHF o DPO. La conversión a GGUF se realizó con `convert_hf_to_gguf.py` de llama.cpp (Python 3.13, PyTorch solo CPU) e incluyó dos ajustes de compatibilidad: normalización de nombres de tensores MXFP4 y sustitución de `TokenizersBackend` por `PreTrainedTokenizerFast`, verificando después el funcionamiento del tokenizador y de la plantilla de chat Harmony.

## Capacidades

- Generación de texto conversacional, con plantilla de chat Harmony (formato nativo de GPT-OSS).
- Razonamiento y uso en tareas de precisión y centradas en código, según el flujo de trabajo declarado por el autor de la conversión.
- Ejecución local en llama.cpp y runtimes compatibles con GGUF.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags de Hugging Face).
- Menor tasa de rechazos que el modelo base gracias a la ablación ARA, manteniendo supuestamente las capacidades generales.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible (el modelo base GPT-OSS lo soporta, pero esta conversión no lo documenta).
- Capacidades multimodales (visión, audio): no disponibles en esta información.
- Idiomas soportados: no disponibles en esta información.

## Casos de uso

- Inferencia local en GPU de consumo: el formato GGUF con expertos en MXFP4 permite ejecutar un MoE de ~21B en tarjetas de 12 GiB de VRAM como la RX 7700 XT, usando llama.cpp con backend Vulkan o CUDA, lo que hace viable el despliegue en estaciones de trabajo modestas.
- Asistencia a la programación en local: el autor declara un uso centrado en precisión y código; el modelo puede integrarse en editores o pipelines locales mediante `llama-server` sin depender de APIs externas.
- Servicio de chat autoalojado: con `llama-server --jinja` y la plantilla Harmony se puede exponer un endpoint HTTP compatible con clientes de chat, útil para prototipos y entornos con requisitos de privacidad.
- Investigación sobre alineación y rechazos: al ser una variante con ablación ARA, sirve para estudiar cómo afecta la reducción de refusals a las capacidades del modelo, comparándola con el GPT-OSS-20B original.
- Evaluación comparativa de formatos: útil para medir diferencias de rendimiento y calidad entre el checkpoint safetensors (vLLM) y la conversión GGUF (llama.cpp) sobre el mismo modelo.
- Despliegue en entornos sin GPU NVIDIA: al funcionar con Vulkan en hardware AMD, cubre escenarios donde vLLM no es una opción práctica.
- Pruebas de pipelines de agentes: la ventana de contexto configurable en tiempo de ejecución (el ejemplo usa 4096 tokens) permite ajustar el consumo de memoria según la carga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversión remite a la model card del modelo original (`p-e-w/gpt-oss-20b-heretic-ara-v4`) para los resultados de evaluación, que no se incluyen aquí.

## Requisitos de hardware

- VRAM estimada: el autor ejecuta el modelo en una AMD Radeon RX 7700 XT con 12 GiB de VRAM; el tamaño del repositorio es de 13,8 GB, por lo que se necesita al menos esa cantidad de memoria (o reparto entre VRAM y RAM) para cargar los pesos completos.
- GPU recomendadas: no hay recomendaciones oficiales en la información; el caso documentado es una RX 7700 XT de 12 GiB. Por tamaño, GPUs con 16 GiB o más (RTX 4080/4090, A100, H100) ofrecen mayor margen para contexto y offloading.
- Cabe en GPU de consumo: sí, según el caso documentado, en una GPU de 12 GiB con llama.cpp; en GPUs con menos VRAM requeriría offloading parcial a RAM del sistema.
- Opciones de despliegue: llama.cpp (`llama-server`, con `--jinja` para la plantilla Harmony). vLLM no es aplicable a este formato GGUF; para vLLM habría que usar el checkpoint safetensors original.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| linellazatin/p-e-w_gpt-oss-20b-heretic-ara-v4-gguf | ~20,9B (MoE) | no disponible | GGUF | Apache 2.0 | Conversión sin cambios de comportamiento; expertos en MXFP4 |
| p-e-w/gpt-oss-20b-heretic-ara-v4 | ~20,9B (MoE) | no disponible | Safetensors | Apache 2.0 | Modelo original con ablación ARA; requiere vLLM u otro runtime para safetensors |
| openai/gpt-oss-20b | ~20,9B (MoE) | no disponible | Safetensors | Apache 2.0 | Modelo base sin modificar; mantiene el comportamiento de rechazo original |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La reducción de rechazos mediante ARA puede aumentar la probabilidad de que el modelo genere contenido que el modelo base declinaría; es responsabilidad del desplegador aplicar sus propias salvaguardas.
- No hay datos publicados en esta información sobre sesgos, tasas de alucinación ni evaluaciones de seguridad de la variante Heretic.
- La model card de la conversión no documenta los idiomas soportados; no debe asumirse un rendimiento multilingüe sin verificación.
- La longitud de contexto nativa no está documentada; el valor `-c 4096` del ejemplo es una configuración de ejecución, no una especificación.
- El soporte de tool calling y function calling no está confirmado para esta conversión concreta, aunque el modelo base GPT-OSS lo soporte.
- Es una conversión de terceros: no hay garantía de equivalencia exacta con el checkpoint original más allá de la verificación del tokenizador y la plantilla Harmony declarada por el autor.
- La licencia Apache 2.0 permite uso comercial, pero las implicaciones de la modificación ARA sobre el comportamiento del modelo deben evaluarse en el contexto de cada producto.
- El rendimiento en producción (latencia, throughput) no está medido en la información disponible; conviene hacer pruebas propias antes de desplegar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/linellazatin/p-e-w_gpt-oss-20b-heretic-ara-v4-gguf
- Modelo original modificado: https://huggingface.co/p-e-w/gpt-oss-20b-heretic-ara-v4
- Herramienta Heretic: https://github.com/p-e-w/heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Commit de soporte de conversión en llama.cpp: https://github.com/ggml-org/llama.cpp/commit/4ed88da2ea2a51edc158efe0ee2a1e452d75644d
- Ajuste del conversor (base.py): https://github.com/linellazatin/llama.cpp/commit/c43b85922d66ae256fd463a1d7738f6736052cce
- Ajuste del conversor (gpt_oss.py): https://github.com/linellazatin/llama.cpp/commit/239c2540acfe958b134814064df6cfa398bd5239
