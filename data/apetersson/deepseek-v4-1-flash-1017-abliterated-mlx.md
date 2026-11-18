# apetersson/DeepSeek-V4.1-Flash-1017-Abliterated-MLX

## Resumen

DeepSeek-V4.1-Flash-1017-Abliterated-MLX es una conversión comunitaria del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, publicada por el usuario apetersson en Hugging Face. Se trata de un checkpoint de 262.182.120.658 parámetros totales, cuantizado en precisión mixta (formato oQ2.5e) y empaquetado específicamente para Apple Silicon mediante la librería MLX y el runtime oMLX. La modificación "abliterated" implica que los pesos ya incorporan ajustes orientados a eliminar comportamientos de rechazo, sin necesidad de adaptadores de steering en tiempo de ejecución.

El modelo hereda la ventana de contexto nativa de 1.048.576 tokens del modelo base DeepSeek-V4.1-Flash-1017; la configuración documentada por el autor recomienda 262.144 tokens como compromiso entre velocidad y consumo de memoria. El paquete completo ocupa aproximadamente 422,6 GB (393,5 GiB), con 188,8 GiB correspondientes a tablas Engram en FP8/E8M0 que se pueden descargar a SSD, dejando unos 204,7 GiB de pesos residentes en memoria unificada.

Su relevancia radica en ser una de las pocas distribuciones de un modelo de esta escala adaptada al ecosistema MLX para equipos Apple Silicon de 256 GiB de memoria unificada, con instrucciones detalladas de configuración de oMLX, límites de memoria cableada y offload de tablas Engram a SSD local. La licencia es MIT, lo que facilita su uso comercial, aunque las implicaciones del proceso de abliteration deben evaluarse con cautela en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (deepseek_v41), conversión a MLX con precisión mixta afín y MXFP |
| Parametros totales | 262.182.120.658 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens nativos; 262.144 recomendados en la receta de servicio |
| Tipos de cuantizacion | oQ2.5e (precisión mixta, no uniforme 2.5 bits); tablas Engram nativas en FP8/E8M0 sin recuantizar |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), 51 shards más dos ficheros Engram nativos (layer1.safetensors, layer14.safetensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo DeepSeek-V4.1-Flash-1017, identificada en los tags como `deepseek_v41`. Esta conversión no entrena el modelo desde cero, sino que parte de dos checkpoints: el modelo base oficial de DeepSeek y una variante "heretic" de pqhaz, y aplica una cuantización de precisión mixta orientada a MLX (oQ2.5e) junto con las modificaciones de abliteration ya integradas en los pesos. El resultado se distribuye en 51 shards de safetensors con un layout MLX estándar en la raíz del repositorio.

Un aspecto técnico destacable es la separación de las tablas Engram (202.758.032.400 bytes, equivalentes a 188,8 GiB) como ficheros independientes que el runtime puede descargar a SSD local en lugar de mantenerlas residentes en memoria unificada. La receta de servicio documentada incluye decodificación especulativa con MTP (multi-token prediction) a profundidad 1, prefill A8 con umbral mínimo de 128 tokens, skip de decoder CED y offload de Engram a SSD. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto con ventana de contexto nativa de hasta 1.048.576 tokens, con degradación de precisión esperada en contextos muy largos según el autor.
- Procesamiento de imagen: el checkpoint incluye una torre de visión y un proyector de imagen (0,767 GiB y 0,137 GiB respectivamente), lo que habilita entrada multimodal.
- Decodificación especulativa mediante tensores MTP/DSpark (7,49 GiB de payload de draft retenido).
- Comportamiento "abliterated": los pesos incorporan modificaciones que reducen los rechazos del modelo, sin necesidad de aplicar un adaptador de steering en runtime.
- Soporte de tool calling y function calling: no documentado explícitamente en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas explícitamente en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Procesamiento de documentos extensos en local: con 262.144 tokens de contexto configurados (ampliables a 1.048.576), el modelo puede analizar contratos, informes o bases de código completas en un único paso sin fragmentación, siempre que se disponga de un Mac con 256 GiB de memoria unificada.
- Análisis multimodal de imágenes en flujo local: la torre de visión incluida permite describir, clasificar o extraer información de imágenes sin enviar datos a servicios externos, adecuado para entornos con requisitos de privacidad.
- Generación de texto sin filtros editoriales: la naturaleza abliterated del checkpoint lo hace apropiado para investigación sobre alineamiento, estudios de sesgo o generación creativa que requiera evitar rechazos, siempre con revisión humana posterior.
- Investigación en eficiencia de inferencia: el modelo sirve como banco de pruebas para técnicas de offload de tablas de embedding a SSD, cuantización mixta y decodificación especulativa en hardware Apple Silicon.
- Prototipado de asistentes conversacionales de largo alcance: con caché KV paginada en SSD (100 GiB configurados) y 3 peticiones activas, puede sostener conversaciones multi-turno con historial extenso en una estación de trabajo Mac Studio o Mac Pro.
- Evaluación comparativa de cuantizaciones: investigadores pueden medir la pérdida de calidad de oQ2.5e frente a los pesos originales en tareas específicas, dado que el autor documenta la configuración exacta de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Memoria unificada: 256 GiB en Apple Silicon (clase Mac Studio o Mac Pro con chip M-series Ultra). Los pesos residentes con Engram descargado a SSD ocupan aproximadamente 204,7 GiB.
- Almacenamiento: SSD local rápido con al menos 422,6 GB libres para el paquete completo, más 100 GiB adicionales recomendados para la caché paginada en SSD.
- Límite del sistema: `iogpu.wired_limit_mb=237568` (232 GiB) para permitir el cableado de 228 GiB solicitado por MLX.
- Runtime: oMLX 0.7.3 (commit 9de79bc39a01c1f3fec1e849903aaf0dd5478d7a), con MLX 0.32.4, mlx-vlm 0.7.11, mlx-lm 0.32.3.dev8, mlx-audio 0.6.3 y transformers 5.14–5.20.
- No cabe en GPU de consumo convencionales (RTX 4090, etc.) ni en equipos Apple Silicon con menos de 256 GiB de memoria unificada.
- Configuración de servicio: 3 peticiones activas, prefill por chunks, `prefill_priority: context`, fairness de decode activada, `MLX_METAL_RESIDENCY_REFRESH_INTERVAL_MS=1000`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-Abliterated-MLX (este) | 262,2 B | 1.048.576 nativo | MIT | Hugging Face, MLX | Cuantizado oQ2.5e, abliterated, para Apple Silicon 256 GiB |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | no disponible | 1.048.576 nativo | no disponible | Hugging Face | Modelo base oficial de DeepSeek |
| pqhaz/DeepSeek-V4.1-Flash-1017-heretic | no disponible | no disponible | no disponible | Hugging Face | Variante heretic usada como base de la abliteration |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- La abliteration altera el comportamiento de rechazo del modelo; puede generar contenido que el modelo original evitaría, con implicaciones legales y éticas según el uso.
- El autor advierte de que la caída de precisión en contextos muy largos es una característica general del modelo base, no un efecto de la cuantización o la abliteration.
- La cuantización oQ2.5e es agresiva y no uniforme; se espera cierta pérdida de calidad frente a los pesos originales en FP8/BF16, aunque el autor no cuantifica esta pérdida.
- El modelo requiere hardware muy específico (Apple Silicon con 256 GiB de memoria unificada) y una configuración de runtime detallada; no es portable a otros entornos sin conversión adicional.
- No se documentan los idiomas soportados ni el comportamiento multilingüe del checkpoint.
- La licencia MIT se aplica a esta conversión, pero deben revisarse las condiciones del modelo base de DeepSeek para uso comercial.
- El proceso de abliteration puede introducir sesgos o degradaciones no evaluadas formalmente; no se han publicado benchmarks que validen su calidad.
- La gestión de memoria es crítica: superar los límites cableados puede provocar fallos del sistema; el autor recomienda excluir los directorios del modelo y la caché del indexado de Spotlight.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/apetersson/DeepSeek-V4.1-Flash-1017-Abliterated-MLX
- Modelo base oficial: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Variante heretic utilizada: https://huggingface.co/pqhaz/DeepSeek-V4.1-Flash-1017-heretic
- Artículo sobre memoria Engram en SSD: https://capacity.at/blog/deepseek-engram-memory-on-ssd/
- Hilo de referencia sobre benchmark M5 Ultra 256 GB: https://www.reddit.com/r/MacStudio/comments/1xk5ffv/m5_ultra_64_core_256gb_benchmark/
