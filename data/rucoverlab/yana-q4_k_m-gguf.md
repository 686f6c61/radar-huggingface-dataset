# RuCoverLAB/YaNA-Q4_K_M-GGUF

## Resumen

YaNA-Q4_K_M-GGUF es una cuantización en formato GGUF del modelo YaNA, publicada por RuCoverLAB a partir de Qwen/Qwen2.5-3B-Instruct. El artefacto está pensado para inferencia local mediante llama.cpp y Ollama, con un peso de repositorio de 1,9 GB y una cuantización Q4_K_M que reduce el espacio y los requisitos de memoria respecto a los pesos originales en safetensors.

El modelo base es un transformer decoder-only de la familia Qwen2.5 en su variante Instruct de 3B parámetros, con 3.085.938.688 parámetros totales según los safetensors del modelo original. La model card no documenta ajuste adicional sobre ese base: el README se limita a describir el proceso de conversión a GGUF mediante el espacio GGUF-my-repo de ggml.ai y a ofrecer instrucciones de uso con Ollama, cURL, Python, JavaScript y la CLI de Hugging Face.

La relevancia de esta ficha es práctica: permite desplegar un modelo conversacional de 3B en hardware de consumo, con licencia Apache 2.0 y soporte declarado de ruso e inglés. No obstante, la información publicada por el autor es mínima y no incluye datos de entrenamiento, benchmarks ni detalles de arquitectura más allá de la herencia del modelo base, por lo que muchas especificaciones quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-3B-Instruct; no detallada en la model card) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card de esta cuantización |
| Tipos de cuantizacion | Q4_K_M (GGUF); no se listan otras variantes en el repo |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), compatible con Ollama |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Tamano del repositorio | 1,9 GB |
| Pipeline | no disponible |
| Fecha de creacion | 2026-11-04 |

## Arquitectura y entrenamiento

La model card de esta cuantización no aporta información sobre la arquitectura interna, los datos de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO. Lo único documentado es que los pesos proceden de RuCoverLAB/YaNA, que a su vez se basa en Qwen/Qwen2.5-3B-Instruct, y que la conversión a GGUF se realizó con llama.cpp a través del espacio GGUF-my-repo de ggml.ai. Cualquier detalle sobre atención, normalización, tokenizador o composición del corpus debe consultarse en la model card del modelo base, no en este repositorio.

La innovación técnica de este artefacto es exclusivamente la cuantización Q4_K_M, un esquema de cuantización por bloques de 4 bits con escalas de mayor precisión para determinadas capas, orientado a reducir el peso en disco y la VRAM manteniendo una calidad razonable para uso conversacional. No se documentan técnicas adicionales como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo Instruct base.
- Comprensión y generación en ruso e inglés, según los idiomas declarados en la model card.
- Instrucciones y formato de chat, ya que el modelo base es una variante Instruct.
- Despliegue local mediante Ollama y llama.cpp, con ejemplos oficiales en cURL, Python y JavaScript.
- Compatibilidad con endpoints (tag `endpoints_compatible` en Hugging Face).
- No se documentan capacidades de visión, audio, tool calling, function calling ni agentes en la información disponible.
- No se documenta un modo de pensamiento (thinking mode) explícito.

## Casos de uso

- Asistente conversacional local en ruso e inglés: el modelo puede ejecutarse con Ollama en un portátil o estación de trabajo sin GPU dedicada, usando la cuantización Q4_K_M de 1,9 GB para responder consultas multi-turno en entornos sin conexión.
- Prototipado rápido de chatbots: al estar disponible como GGUF y con ejemplos de cURL y Python en la model card, permite montar un servicio HTTP local en minutos para validar flujos de conversación antes de invertir en modelos mayores.
- Procesamiento de texto en el borde (edge computing): su tamaño reducido permite integrarlo en dispositivos con poca memoria, como mini-PC o Raspberry Pi con suficiente RAM, para tareas de resumen o clasificación simple.
- Traducción y asistencia bilingüe ruso-inglés: los idiomas declarados lo hacen adecuado para borradores de traducción o atención a usuarios en esas dos lenguas, siempre con revisión humana.
- Generación de texto de relleno y borradores: redacción de correos, descripciones o respuestas plantilla en entornos donde no se puede enviar datos a la nube.
- Educación y experimentación: servir como modelo de referencia para estudiar el efecto de la cuantización Q4_K_M frente a los pesos originales en tareas conversacionales.
- Integración en pipelines de CI para pruebas de humo: verificar que un servicio de inferencia basado en llama.cpp arranca y responde correctamente antes de desplegar modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta cuantización no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos, y tampoco se aportan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3,5 GB con la cuantización Q4_K_M, incluyendo overhead de contexto y caché KV; el archivo de pesos ocupa 1,9 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como GTX 1650, RTX 3050, RTX 4060 o superiores; también funciona en CPU.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 4 GB o más de VRAM; en CPU requiere alrededor de 3-4 GB de RAM libre.
- Opciones de despliegue: Ollama (recomendado en la model card), llama.cpp, y cualquier runtime compatible con GGUF; no se documenta soporte de vLLM o TGI para este artefacto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| YaNA-Q4_K_M-GGUF (este) | 3,09B | no disponible | Apache 2.0 | GGUF Q4_K_M | Cuantización de Qwen2.5-3B-Instruct vía YaNA; idiomas ru/en |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | no disponible en esta ficha | Apache 2.0 | safetensors | Modelo base original; sin cuantizar |
| Otras cuantizaciones GGUF de Qwen2.5-3B-Instruct | 3,09B | depende de la variante | Apache 2.0 | GGUF | Alternativas de la comunidad con distintos esquemas de cuantización |

No se dispone de datos de rendimiento comparado entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- La model card es mínima: no documenta datos de entrenamiento, sesgos, evaluación de seguridad ni limitaciones específicas del ajuste YaNA.
- Riesgo de alucinación inherente a un modelo de 3B parámetros, especialmente en tareas de razonamiento complejo o datos factuales.
- La cuantización Q4_K_M introduce una pérdida de calidad respecto a los pesos originales en safetensors; no se han publicado evaluaciones de esa degradación.
- El soporte de idiomas declarado se limita a ruso e inglés; el rendimiento en castellano no está garantizado ni evaluado.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base Qwen2.5-3B-Instruct y del ajuste YaNA antes de desplegar en producción.
- No se documentan capacidades de tool calling ni de agentes; no debe asumirse su disponibilidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- La fecha de creación indicada (2026-11-04) es posterior a la fecha actual, lo que conviene tratar con cautela al evaluar la vigencia del artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RuCoverLAB/YaNA-Q4_K_M-GGUF
- Modelo original YaNA: https://huggingface.co/RuCoverLAB/YaNA
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Espacio de conversión GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Canal de Telegram del autor: https://t.me/rucoverlab
