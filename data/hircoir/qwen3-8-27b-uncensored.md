# HirCoir/Qwen3.8-27B-Uncensored

## Resumen

Qwen3.8-27B-Uncensored es una distribución empaquetada del modelo Qwen3.8-27B en versión "abliterada" (con la alineación de seguridad eliminada), publicada por el usuario HirCoir sobre el trabajo previo de orcarouter. El repositorio no contiene pesos en formato safetensors ni el modelo original, sino un paquete listo para ejecutar con llama.cpp que incluye una cuantización IQ4_XS del modelo, un proyector de visión (mmproj) en f16, un binario de llama.cpp compilado con CUDA 12.8, scripts de arranque y una interfaz de chat web basada en Gradio.

El modelo subyacente cuenta con 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) y se presenta con una ventana de contexto configurada de 131.072 tokens, caché KV cuantizada en q8_0 y decodificación especulativa (MTP) activada. La relevancia de esta ficha es doble: por un lado documenta una receta de despliegue concreta y reproducible sobre 2x Tesla T4 (15 GB cada una), y por otro advierte de que se trata de un modelo sin salvaguardas de alineación, con las implicaciones éticas y legales que ello conlleva.

La licencia declarada es Apache 2.0, heredada del modelo base. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 21 de noviembre de 2026. No se dispone de información sobre el proceso de entrenamiento original, los datos utilizados ni los resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3); detalles internos no disponibles |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (configurado en el servidor llama.cpp) |
| Tipos de cuantizacion | IQ4_XS (modelo); mmproj en f16; KV cache en q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); no se incluyen safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de su pertenencia a la familia Qwen3 y de su naturaleza transformer con soporte de visión mediante un proyector multimodal (mmproj). El paquete incluye el proyector de visión en f16 (931 MB), lo que confirma que el modelo acepta entrada de imágenes además de texto. El modelo base declarado es `orcarouter/Qwen3.8-27B-Uncensored-GGUF`, descrito como una abliteración del Qwen3.8-27B original, es decir, una modificación de los pesos orientada a eliminar los mecanismos de rechazo de peticiones.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni detalles sobre la técnica exacta de abliteración aplicada. La configuración de despliegue sí incorpora innovaciones técnicas relevantes: decodificación especulativa mediante MTP con `--spec-draft-n-max 2`, caché KV en q8_0 para reducir el consumo de memoria en contexto largo y reparto del modelo entre dos GPUs con `-ngl 99` (todas las capas en GPU).

## Capacidades

- Generación de texto conversacional multi-turno, según la configuración de chat incluida.
- Entrada de imágenes (visión) a través del proyector mmproj en f16, con soporte de contenido `image_url` en la API.
- API compatible con OpenAI en `/v1/chat/completions`, lo que facilita la integración con clientes existentes.
- Contexto largo de hasta 131.072 tokens configurado.
- Decodificación especulativa (MTP) para acelerar la generación.
- Modo de razonamiento desactivado por defecto en la configuración incluida (`Reasoning: off`).
- Respuestas sin rechazos por alineación de seguridad (comportamiento "uncensored" declarado por el autor).
- Capacidades de tool calling / function calling: no disponibles en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles.

## Casos de uso

- Auditoría de seguridad de modelos: al tener la alineación eliminada, permite estudiar qué respuestas produce el modelo sin filtros y compararlas con el modelo base para evaluar la eficacia de las salvaguardas.
- Investigación sobre abliteración: útil para analizar cómo afecta la eliminación de la alineación a las capacidades generales, al estilo de respuesta y a la coherencia del modelo.
- Despliegue en hardware modesto: la cuantización IQ4_XS (15,3 GB) y el reparto en 2x Tesla T4 permiten ejecutar un modelo de 27 B en GPUs de 15 GB, algo relevante para laboratorios con hardware limitado.
- Procesamiento de documentos con imágenes: gracias al mmproj, puede extraer información de capturas, diagramas o formularios combinando texto e imagen en un mismo prompt.
- Chat interno con contexto largo: la ventana de 131.072 tokens permite conversaciones o análisis sobre documentos extensos en un entorno controlado.
- Prototipado rápido de aplicaciones LLM: el paquete incluye servidor, cliente de chat Gradio y túneles públicos, lo que acelera la puesta en marcha de demos.
- Análisis de contenido sensible en investigación: útil para estudiar cómo responde un modelo sin restricciones a estímulos que el modelo base rechazaría, siempre en un marco ético y legal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: la cuantización IQ4_XS ocupa 15,3 GB y el proyector de visión 931 MB; con caché KV en q8_0 y contexto de 131.072 tokens el consumo total supera los 15 GB de una sola T4, de ahí el reparto en 2 GPUs.
- GPU recomendadas: 2x Tesla T4 (15 GB cada una) es la configuración probada por el autor; una GPU única con 24 GB o más (RTX 3090, RTX 4090, A10G, L4) podría alojar el modelo con contexto reducido.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB o más si se reduce el contexto o se usa una cuantización menor; en 16 GB no cabe la cuantización IQ4_XS completa.
- Opciones de despliegue: llama.cpp (build b12600 con CUDA 12.8 incluido en el paquete), servidor compatible con OpenAI, cliente de chat Gradio y túneles `*.gradio.live` mediante frpc.
- Latencia y throughput: no disponibles; el autor no publica métricas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored (este) | 27,3 B | 131.072 | Apache 2.0 | GGUF (IQ4_XS) | Abliterado, con visión, paquete llama.cpp |
| Qwen3.8-27B original | ~27 B | no disponible | no disponible | no disponible | Modelo base con alineación de seguridad |
| orcarouter/Qwen3.8-27B-Uncensored-GGUF | ~27 B | no disponible | no disponible | GGUF | Origen de la abliteración; sin paquete de despliegue |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo sin alineación de seguridad: responde a peticiones que el modelo base rechazaría, lo que implica riesgos de contenido dañino, ilegal o éticamente problemático.
- Riesgo elevado de alucinación y de respuestas incorrectas en dominios sensibles, agravado por la ausencia de salvaguardas.
- No se dispone de información sobre sesgos conocidos, idiomas soportados ni evaluación de calidad.
- La licencia Apache 2.0 permite uso comercial, pero el uso de un modelo sin filtros en producción conlleva responsabilidad legal y reputacional; se recomienda encarecidamente no exponerlo públicamente sin moderación adicional.
- El paquete incluye túneles públicos automáticos hacia `*.gradio.live`, lo que puede exponer el servidor a Internet sin autenticación si no se protege adecuadamente.
- La configuración probada requiere 2 GPUs; en una sola GPU con menos de 24 GB no es viable con la cuantización incluida.
- No hay garantías de mantenimiento: 0 descargas, 0 likes y autor sin historial verificable en la información disponible.
- El modo de razonamiento está desactivado por defecto en la configuración incluida, lo que puede limitar el rendimiento en tareas complejas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HirCoir/Qwen3.8-27B-Uncensored
- Modelo base (abliteración): https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
