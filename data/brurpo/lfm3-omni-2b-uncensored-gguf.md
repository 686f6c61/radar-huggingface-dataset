# brurpo/LFM3-Omni-2B-Uncensored-GGUF

## Resumen

LFM3-Omni-2B-Uncensored-GGUF es una exportación en formato GGUF del modelo multimodal OpenIntelligenceNet/LFM3-Omni-2B-Uncensored, que a su vez deriva de LiquidAI/LFM3-Omni-2B. Se trata de un modelo any-to-any de aproximadamente 1.730 millones de parámetros (1.728.801.600 según los pesos en safetensors del checkpoint original) capaz de procesar y generar texto, visión y audio en un mismo pipeline. La conversión la firma el usuario brurpo y está pensada para su uso con llama.cpp (build b12063 o superior) y clientes GGUF compatibles, en particular BRP Canvas 2.

El interés de esta ficha reside en que permite ejecutar un modelo omni de 2B en hardware de consumo mediante cuantizaciones Q8_0 y Q4_K_M, manteniendo el proyector multimodal (mmproj) en BF16, que incluye visión, audio, decodificador de profundidad y componentes de códec. Frente al checkpoint original en safetensors, esta versión facilita el despliegue local sin necesidad de infraestructura GPU de datacenter.

La versión "Uncensored" es una modificación del checkpoint de Liquid AI realizada por OpenIntelligenceNet, de la que no se documentan en la información disponible los detalles del proceso de abliteration o fine-tuning aplicado. La exportación GGUF, según el autor, no añade entrenamiento, merging ni abliteration adicional: es una conversión de formato más cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3-Omni; familia LFM de Liquid AI) |
| Parámetros totales | 1.728.801.600 (~1,73 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (entrada + salida combinadas) |
| Tipos de cuantización | BF16, Q8_0, Q4_K_M (proyector multimodal solo en BF16) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 |
| Formato de pesos | GGUF (safetensors en el checkpoint original) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia LFM3-Omni de Liquid AI, diseñada como modelo any-to-any con capacidades de visión y audio además de texto. La información disponible no detalla la arquitectura interna (tipo de transformer, atención, capas), el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se documenta qué técnicas concretas de alineación se usaron en la variante "Uncensored" de OpenIntelligenceNet.

La innovación técnica relevante en esta ficha es la del propio exportador: la conversión se realizó con llama.cpp b12063 sin modificaciones (commit `2cbca389f515df455412dafa07e2b1359cc72a6d`), cuantizando Q8_0 y Q4_K_M directamente desde el export BF16 con el cuantizador correspondiente. El proyector multimodal (`mmproj`) se convirtió desde el mismo checkpoint e incluye los pesos del `audio_tokenizer`, de modo que no se toma prestado de otro fine-tune. El modelo es explícitamente no razonador (non-reasoning): no dispone de modo de pensamiento extendido.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imágenes (visión) mediante el proyector multimodal BF16.
- Procesamiento de audio, incluido el tokenizador de audio convertido desde el checkpoint original.
- Modalidad any-to-any: entradas y salidas que combinan texto, visión y audio según el cliente y el runtime.
- Generación intercalada (interleaved) de modalidades, sujeta a disponibilidad en el cliente.
- Decodificación de profundidad (depth decoder) incluida en el proyector.
- No soporta modo de razonamiento explícito (non-reasoning).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente multimodal local en estación de trabajo: con 1,73 B de parámetros y cuantización Q4_K_M, el modelo cabe en GPU de consumo y permite conversaciones que combinan texto e imágenes sin depender de la nube, útil para prototipado de producto.
- Descripción y análisis de imágenes en local: el proyector BF16 procesa visión y el modelo genera texto descriptivo, adecuado para etiquetado asistido, accesibilidad o extracción de información de capturas y documentos escaneados.
- Transcripción y comprensión de audio: gracias al `audio_tokenizer` incluido en el mmproj, se pueden construir pipelines de resumen de reuniones o notas de voz ejecutados íntegramente en local.
- Generación intercalada de contenido multimodal: para demos y pruebas de concepto que necesiten alternar texto e imágenes en una misma respuesta, siempre que el cliente (por ejemplo BRP Canvas 2) soporte ese modo.
- Chat de contexto largo moderado: con 32.768 tokens de ventana combinada, admite conversaciones con historial extenso o documentos de tamaño medio sin truncar agresivamente.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse con llama.cpp en hardware propio, los datos de audio e imagen no salen del equipo, lo que encaja en sectores regulados.
- Integración en aplicaciones de escritorio: el servidor `llama-server` expone una API compatible con endpoints, lo que facilita incrustar el modelo en herramientas nativas o web locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo completo ocupa 7,4 GB, pero se descarga un único GGUF de lenguaje más el proyector. BF16 ronda los 3,5 GB de pesos; Q8_0 aproximadamente 1,9 GB; Q4_K_M en torno a 1,1 GB. A ello se suma el mmproj BF16, que añade varios cientos de MB según los componentes de audio y visión.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM para BF16 con contexto amplio; 6 GB bastan para Q8_0; 4-6 GB para Q4_K_M. Modelos como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 o A100/H100 son holgados.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6-8 GB o más, y potencialmente en modo CPU con llama.cpp si se acepta mayor latencia.
- Opciones de despliegue: llama.cpp b12063 o superior (obligatorio; versiones que solo soportan LFM2 no cargan estos ficheros), `llama-server`, y clientes GGUF compatibles como BRP Canvas 2.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-Omni-2B-Uncensored-GGUF (esta ficha) | ~1,73 B | 32.768 | Texto, visión, audio | LFM Open License v1.0 | GGUF |
| LiquidAI/LFM3-Omni-2B (base) | ~1,73 B | no disponible | Texto, visión, audio | LFM Open License v1.0 | safetensors |
| OpenIntelligenceNet/LFM3-Omni-2B-Uncensored (checkpoint) | ~1,73 B | no disponible | Texto, visión, audio | LFM Open License v1.0 | safetensors |

No se dispone de datos de benchmarks ni de modelos comparables de otros fabricantes en la información proporcionada, por lo que la comparación se limita a las variantes del mismo modelo.

## Limitaciones y advertencias

- La variante "Uncensored" puede haber reducido los mecanismos de rechazo del modelo original; no se documenta el método ni el alcance de esa modificación, lo que aumenta el riesgo de generar contenido inapropiado o dañino en producción.
- Riesgo de alucinación inherente a un modelo de 1,73 B: la capacidad de razonamiento y de verificación factual es limitada en comparación con modelos de mayor tamaño.
- La cuantización Q4_K_M puede degradar la calidad, especialmente en tareas multimodales; el propio autor lo advierte.
- El proyector multimodal solo está disponible en BF16, por lo que el ahorro de memoria de las cuantizaciones de 8 y 4 bits no se aplica a la parte de visión y audio.
- Contexto máximo de 32.768 tokens incluyendo entrada y salida; no es adecuado para documentos muy extensos.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento correcto en castellano sin evaluación previa.
- El modelo es non-reasoning: no dispone de modo de pensamiento y puede requerir instrucciones de sistema explícitas (por ejemplo, `Respond with text.`) para forzar salida textual.
- La licencia LFM Open License v1.0 es "other" y no equivale a una licencia permisiva tipo Apache o MIT; es imprescindible revisar sus términos antes de un uso comercial. La conversión a GGUF no sustituye la licencia original.
- Requiere llama.cpp b12063 o superior; versiones anteriores que solo soportan LFM2 fallarán al cargar los ficheros.
- La disponibilidad de los modos de audio y generación intercalada depende del cliente y del runtime, no solo del modelo.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.

## Enlaces

- HuggingFace (esta exportación): https://huggingface.co/brurpo/LFM3-Omni-2B-Uncensored-GGUF
- Modelo base del export: https://huggingface.co/OpenIntelligenceNet/LFM3-Omni-2B-Uncensored
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- llama.cpp (build b12063, commit de conversión): https://github.com/ggml-org/llama.cpp/tree/2cbca389f515df455412dafa07e2b1359cc72a6d
- BRP Canvas 2 (cliente del exportador): https://github.com/brurpo/BRP-Canvas-2-Releases
