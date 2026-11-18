# huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-GGUF

## Resumen

Huihui-Qwen3.8-Flash-Next-abliterated-GGUF es una versión "abliterated" (sin rechazos) del modelo multimodal Qwen3.8-Flash-Next de Alibaba Qwen, publicada por el colectivo huihui-ai. La abliteración es una técnica de edición de pesos que elimina la dirección de activación asociada a las negativas del modelo, de modo que este deja de rechazar peticiones que el modelo original filtraría. El resultado es un modelo de propósito general sin capa de alineamiento de seguridad, orientado a investigación y entornos controlados.

El modelo subyacente es un transformer de tipo Mixture-of-Experts (MoE) con aproximadamente 177.000 millones de parámetros totales, según los pesos en safetensors del repositorio base. La model card declara soporte de entrada imagen-texto (pipeline `image-text-to-text`), lo que lo convierte en un modelo multimodal, y menciona explícitamente razonamiento con "thinking" eficiente en tokens. El repositorio distribuido aquí contiene únicamente cuantizaciones GGUF, con un tamaño total de 1.005,4 GB, lo que refleja la presencia de múltiples variantes de cuantización del modelo completo.

Su relevancia actual radica en dos factores: por un lado, ofrece acceso local a un modelo MoE multimodal de gran tamaño mediante llama.cpp y Strata; por otro, al haber sido despojado de sus mecanismos de rechazo, plantea riesgos claros de contenido sensible y obliga a evaluar con cuidado su uso en producción. La licencia declarada es `qwen-community-1.0`, que impone condiciones específicas para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE); detalles de capas y expertos no disponibles |
| Parametros totales | 176.943.899.520 (~177 B), dato de safetensors del modelo base |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (según el ejemplo de invocación con `-c 262144` en la model card) |
| Tipos de cuantizacion | GGUF, incluyendo UD-Q4_K_XL (Unsloth Dynamic); otras variantes no detalladas |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `license: other`) |
| Formato de pesos | GGUF (repositorio solo GGUF); el modelo base usa safetensors |
| Pipeline | image-text-to-text (multimodal) |
| Modelo base | Qwen/Qwen3.8-Flash-Next |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer con mezcla de expertos (MoE), con unos 177.000 millones de parámetros totales. Los tags del repositorio incluyen `moe`, `qwen3_8`, `reasoning`, `efficient-thinking`, `token-efficient` y `post-training`, lo que sugiere que el modelo ha pasado por una fase de post-entrenamiento orientada a razonamiento con un uso eficiente de tokens de pensamiento. También aparece el tag `gsq` y `rco`, cuyas siglas no se explican en la información disponible.

El proceso de abliteración se aplica sobre los pesos del modelo base mediante la técnica documentada en el repositorio `remove-refusals-with-transformers`, que identifica y resta la dirección de activación responsable de los rechazos. La model card lo describe como una implementación "cruda, prueba de concepto", sin TransformerLens. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original. Las cuantizaciones GGUF incluidas provienen de Unsloth y de la serie Swift de ukisai, y la model card indica que soportan las versiones recientes de Strata y llama.cpp.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento eficiente en tokens según los tags del repositorio.
- Procesamiento de imágenes junto con texto (pipeline `image-text-to-text`).
- Generación de código y matemáticas: capacidades heredadas del modelo base Qwen3.8, aunque no se detallan en la model card.
- Conversación multi-turno con contexto largo de hasta 262.144 tokens.
- Ejecución local mediante llama.cpp y Strata, con cuantizaciones GGUF de distintos tamaños.
- Ausencia de rechazos: el modelo no aplica el filtrado de seguridad del original, lo que constituye una "capacidad" en el sentido de que responde a peticiones que el base rechazaría.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo sirve para estudiar qué tipos de contenido genera un LLM sin capa de rechazo, comparando sus respuestas con las del Qwen3.8-Flash-Next original en entornos aislados.
- Evaluación de técnicas de abliteración: permite medir empíricamente el efecto de la edición de pesos sobre la tasa de rechazos, la coherencia y la calidad de las respuestas.
- Despliegue local de un MoE multimodal de gran tamaño: con las cuantizaciones GGUF y llama.cpp, se puede ejecutar en estaciones de trabajo con suficiente VRAM o RAM, sin depender de APIs externas.
- Procesamiento de documentos con imágenes: al aceptar entrada imagen-texto, puede usarse para extraer y razonar sobre información de capturas, diagramas o páginas escaneadas en pipelines internos.
- Generación de código en entornos controlados: para prototipado y pruebas internas donde no se requiere filtrado de seguridad y se dispone de revisión humana.
- Análisis de conversaciones largas: su ventana de 262.144 tokens permite procesar transcripciones o expedientes extensos en una sola pasada.
- Pruebas de robustez y red teaming: útil para generar casos adversarios y evaluar los filtros de otros sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con ~177.000 millones de parámetros totales, una cuantización Q4 ronda los 90-100 GB de pesos, por lo que la inferencia completa requiere múltiples GPU o offloading a RAM del sistema.
- GPU recomendadas: no especificadas en la model card. Por tamaño, se necesitan configuraciones multi-GPU (por ejemplo, varias A100 80 GB o H100) para mantener el modelo en VRAM; el uso con offloading es viable en equipos con gran cantidad de RAM.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en GPUs consumer de 24-48 GB sin offloading agresivo a RAM, lo que degrada notablemente la velocidad.
- Opciones de despliegue: llama.cpp (comando documentado con `llama-cli` y `-c 262144`), Strata (con verificación SHA256 de la serie Unsloth), y cualquier runtime compatible con GGUF. vLLM y TGI no están confirmados para estas cuantizaciones.
- Latencia y throughput: no disponibles. El repositorio ocupa 1.005,4 GB, lo que incluye varias cuantizaciones; conviene descargar solo la variante necesaria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3.8-Flash-Next-abliterated-GGUF | ~177 B (MoE) | 262.144 | Sí (imagen-texto) | qwen-community-1.0 | Sin rechazos; solo GGUF |
| Qwen/Qwen3.8-Flash-Next (base) | ~177 B (MoE) | no disponible | Sí (imagen-texto) | qwen-community-1.0 | Modelo original con alineamiento de seguridad |
| unsloth/Qwen3.8-Flash-Next-GGUF | ~177 B (MoE) | no disponible | Sí (imagen-texto) | qwen-community-1.0 | Cuantizaciones GGUF del base, con rechazos |
| ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF | ~177 B (MoE) | no disponible | Sí (imagen-texto) | no disponible | Variante Swift usada como fuente de cuantizaciones |

## Limitaciones y advertencias

- El filtrado de seguridad ha sido reducido de forma significativa; el modelo puede generar contenido sensible, controvertido o inapropiado.
- No es apto para audiencias públicas, menores ni aplicaciones que requieran alta seguridad.
- La abliteración es una prueba de concepto "cruda"; puede degradar la coherencia o la calidad en tareas que dependían del alineamiento original.
- Riesgo elevado de alucinación, no cuantificado en la información disponible.
- La licencia `qwen-community-1.0` impone condiciones adicionales para uso comercial; debe revisarse el archivo LICENSE antes de cualquier despliegue productivo.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe homogéneo.
- El tamaño del repositorio (1.005,4 GB) y del modelo (~177 B de parámetros) hacen inviable su uso en hardware de consumo sin offloading.
- La model card recomienda uso exclusivo en investigación, pruebas o entornos controlados, con monitorización y revisión manual de las salidas.
- El autor declina toda responsabilidad sobre las consecuencias del uso del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantizaciones Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Serie Swift de ukisai: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Técnica de abliteración: https://github.com/Sumandora/remove-refusals-with-transformers
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Strata: https://github.com/Niko1221/Strata
- Ko-fi del autor: https://ko-fi.com/huihuiai
