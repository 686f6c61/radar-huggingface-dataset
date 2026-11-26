# jubair239/Index-Nailong-2B-Variant3-gguf

## Resumen

Index-Nailong-2B-Variant3-gguf es una conversión al formato GGUF de un modelo de lenguaje de aproximadamente 1.880 millones de parámetros (1.881.825.088 exactos según los pesos en safetensors), publicada por el usuario jubair239. El repositorio contiene únicamente los archivos cuantizados listos para su uso con llama.cpp, generados mediante la herramienta Unsloth, e incluye además un proyector multimodal (mmproj), lo que indica que el modelo base es de tipo vision-language. Las etiquetas del repositorio apuntan a la familia Qwen 3.5 como arquitectura de origen.

La relevancia de esta ficha es limitada y fundamentalmente práctica: se trata de un artefacto de despliegue, no de un modelo con documentación propia. No se publica model card técnica del modelo original, ni resultados de evaluación, ni detalles sobre el dataset de entrenamiento, los idiomas soportados o la licencia. Cualquier evaluación rigurosa debería remitirse al modelo base original, cuya identidad exacta no se especifica en la información disponible.

Aun así, el paquete es funcional: ofrece cinco niveles de cuantización (F16, Q4_K_M, Q5_K_M, Q6_K y Q8_0) más el proyector multimodal, con un tamaño total de repositorio de 6,9 GB, lo que permite ejecutar un modelo de 2B con capacidades de visión en hardware de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, según tag `qwen3_5`); vision-language con proyector multimodal |
| Parámetros totales | 1.881.825.088 (~1,88 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); proyector mmproj en GGUF |
| Tamaño del repositorio | 6,9 GB |
| Herramienta de conversión | Unsloth |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo original. El tag `qwen3_5` sugiere que deriva de la familia Qwen 3.5 de Alibaba, y la presencia de un archivo `mmproj` confirma que se trata de un modelo multimodal con un proyector que alinea representaciones visuales con el espacio del modelo de lenguaje. El número de parámetros (1,88 B) sitúa al modelo en la gama pequeña, apta para inferencia en local.

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documenta ninguna innovación técnica específica más allá de la conversión a GGUF mediante Unsloth, que típicamente produce archivos compatibles con llama.cpp preservando la estructura de atención y el tokenizador originales. El sufijo "Variant3" en el nombre sugiere una tercera iteración o variante de un modelo previo, pero no se aporta ninguna descripción de en qué consiste esa variación.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Procesamiento de imágenes: el archivo `mmproj` habilita entrada multimodal mediante `llama-mtmd-cli`.
- Compatibilidad con llama.cpp y, por extensión, con el ecosistema de herramientas que consumen GGUF.
- Soporte de plantillas de chat vía el flag `--jinja`, lo que permite aplicar el formato de conversación definido en el tokenizador.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que facilita su exposición como servicio.
- Capacidades de razonamiento, código o matemáticas: no disponible (no se documentan).
- Soporte de tool calling o function calling: no disponible (no se documenta).
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Inferencia local en estación de trabajo: con cuantización Q4_K_M el modelo ocupa del orden de 1,1-1,3 GB, por lo que puede ejecutarse en CPU o en GPU de gama media mediante `llama-cli`, útil para prototipado rápido sin infraestructura cloud.
- Procesamiento de documentos con imágenes: usando `llama-mtmd-cli` con el proyector mmproj, el modelo puede recibir capturas, diagramas o páginas escaneadas junto a una instrucción de texto, adecuado para tareas de extracción o descripción en local.
- Asistente conversacional embebido: el tamaño reducido permite integrarlo en aplicaciones de escritorio o dispositivos con recursos limitados donde un modelo de 7B o superior no cabría.
- Evaluación comparativa de cuantizaciones: al ofrecer cinco niveles (F16 a Q8_0), sirve para medir la degradación de calidad frente a velocidad en un pipeline de llama.cpp antes de fijar una configuración de producción.
- Servicio HTTP ligero: la etiqueta `endpoints_compatible` sugiere que puede servirse tras una API compatible con el formato de endpoints, útil para pruebas de integración en entornos de desarrollo.
- Base para fine-tuning posterior: al ser un modelo de 2B, es viable reentrenarlo o adaptarlo con LoRA en una sola GPU de consumo, partiendo de los pesos F16 si se dispone de ellos en el repositorio original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): F16 ~3,8 GB; Q8_0 ~2,0 GB; Q6_K ~1,6 GB; Q5_K_M ~1,4 GB; Q4_K_M ~1,2 GB. Añadir el proyector multimodal (unos cientos de MB según la variante) y la caché KV, cuyo tamaño depende de la longitud de contexto configurada.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM para Q4_K_M o Q5_K_M; 6-8 GB para Q8_0 con contexto amplio. Una RTX 3060 de 12 GB o una RTX 4090 cubren con holgura todas las cuantizaciones.
- Cabe en GPU de consumo: sí, en la práctica totalidad de tarjetas con 4 GB o más, y también en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`, `llama-server`), y cualquier frontend compatible con GGUF como Ollama o LM Studio (no verificado explícitamente en la información disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica con precisión el modelo base ni ofrece métricas que permitan una comparación fiable con alternativas de la misma categoría.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Index-Nailong-2B-Variant3-gguf | ~1,88 B | no disponible | no disponible | GGUF |
| Alternativas de ~2B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay model card del modelo original, ni ficha de entrenamiento, ni evaluación de sesgos.
- Licencia no declarada: no puede asumirse uso comercial permitido; es imprescindible verificar la licencia del modelo base Qwen 3.5 antes de cualquier despliegue en producción.
- Riesgo de alucinación: inherente a los modelos de 2B, especialmente en tareas de razonamiento largo o matemáticas, donde la capacidad es limitada por el tamaño.
- Idiomas soportados sin especificar: no hay garantía de calidad fuera del inglés o el chino, idiomas habituales en la familia Qwen.
- Longitud de contexto desconocida: no se puede planificar el uso en conversaciones largas o documentos extensos sin verificar experimentalmente el límite real.
- Repositorio sin descargas ni likes y con fecha de creación futura respecto a la información de referencia: indica un artefacto muy reciente y sin validación por parte de la comunidad.
- El nombre "Variant3" sugiere una modificación no documentada del modelo base; su comportamiento puede diferir del original de formas no descritas.
- El proyector multimodal debe cargarse junto al modelo con `llama-mtmd-cli`; usar `llama-cli` con un archivo mmproj no habilitará la entrada de imágenes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jubair239/Index-Nailong-2B-Variant3-gguf
- Unsloth (herramienta de conversión): https://github.com/unslothai/unsloth
- llama.cpp (runtime): https://github.com/ggml-org/llama.cpp
