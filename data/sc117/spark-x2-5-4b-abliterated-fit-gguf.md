# SC117/Spark-X2.5-4B-abliterated-FIT-GGUF

## Resumen

Spark-X2.5-4B-abliterated-FIT-GGUF es una cuantización GGUF del modelo base XHToken/Spark-X2.5-4B, publicada por el usuario SC117. El modelo original es un transformer híbrido de 4.112.079.360 parámetros (aproximadamente 4B) con una ventana de contexto declarada de 1M de tokens y atención híbrida, orientado a generación de texto conversacional en inglés y chino. La versión aquí descrita aplica una "abliteración" (eliminación de la dirección de rechazo en el espacio de activaciones, etiquetada como T615 en la model card) que produce un modelo "uncensored", es decir, con menor tendencia a rechazar peticiones.

El valor diferencial de esta publicación no es el modelo en sí, sino el proceso de cuantización: los archivos han sido generados con FIT-GGUF, una herramienta de código abierto que actúa como capa de planificación determinista sobre la cuantización de llama.cpp. En lugar de elegir un preset fijo (Q4_K_M, Q5_K_M, etc.), FIT-GGUF fija un contrato de fidelidad (KL macro por debajo de un umbral y coincidencia de top-1 por encima de un mínimo calibrado) y busca el GGUF más pequeño que lo cumple, verificándolo contra el BF16 de referencia.

El repositorio ofrece cuatro niveles de fidelidad ("tiers") que ocupan entre 2,26 y 3,15 GiB, lo que lo hace desplegable en GPUs de consumo y en CPU. Es relevante para quienes necesitan un modelo pequeño, de licencia Apache-2.0, con contexto muy largo y sin restricciones de contenido, y quieren una cuantización con garantías medibles en lugar de una elección a ciegas de preset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención híbrida (híbrido de atención, según model card); detalles de capas no disponibles |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | 1.000.000 tokens (1M, declarado en la model card) |
| Tipos de cuantizacion | GGUF en 4 tiers de fidelidad, tamaños de 2,26 a 3,15 GiB; niveles concretos de quant (p. ej. Q4_K_M) no disponibles |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (librería llama.cpp); el modelo base en safetensors |
| Modelo base | XHToken/Spark-X2.5-4B |
| Herramienta de cuantización | FIT-GGUF v0.2.0 |
| Modificación | Abliterated (T615), uncensored |
| Tamaño del repositorio | 19,5 GB |

## Arquitectura y entrenamiento

El modelo base Spark-X2.5-4B emplea una arquitectura de transformer con atención híbrida, según indica la model card, con una ventana de contexto de 1M de tokens. No se dispone de información sobre el número de capas, dimensión oculta, número de cabezas de atención ni sobre la composición exacta del mecanismo híbrido (combinación de atención completa y atención lineal o de ventana deslizante). Tampoco se detallan los datos de entrenamiento: número de tokens, composición del corpus, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Esta información no está disponible en la documentación proporcionada.

La modificación "abliterated" (denominada T615) elimina la dirección de rechazo del modelo mediante intervención sobre activaciones, lo que reduce la probabilidad de respuestas de negativa ante peticiones sensibles. La cuantización se realizó con FIT-GGUF, que planifica la asignación de tipos de quant a nivel de tensor y verifica cada archivo contra el BF16 de referencia mediante dos métricas: KL macro (divergencia de la distribución de salida) y coincidencia de top-1 ("same-top"). La model card declara un gate G2 con delta = 0 para la predicción de tamaño y entrega byte-exacta, y aclara explícitamente que no reclama un óptimo universal de calidad, sino el cumplimiento verificado de un contrato de fidelidad por tier.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte declarado de contexto de hasta 1M de tokens.
- Razonamiento y respuesta a instrucciones en inglés y chino.
- Modo "uncensored": menor tasa de rechazos ante peticiones que el modelo base rechazaría, por efecto de la abliteración.
- Compatibilidad con llama.cpp y con endpoints compatibles (tag `endpoints_compatible`).
- Capacidad de ejecución en CPU y GPU de consumo gracias al formato GGUF.
- No se declara soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode) en la información disponible.
- Capacidades de código y matemáticas no documentadas explícitamente; no disponibles.

## Casos de uso

- Asistente conversacional local en CPU: los archivos de 2,26–3,15 GiB permiten ejecutar el modelo con llama.cpp en un portátil sin GPU dedicada, gestionando diálogos multi-turno con contexto amplio.
- Procesamiento de documentos largos: con 1M de tokens de contexto declarado, el modelo puede ingerir contratos, informes o bases de código extensas en una sola pasada, útil para resumen y extracción de información.
- Despliegue en GPUs de consumo: con 8–12 GB de VRAM se puede cargar el tier de mayor fidelidad junto con una caché KV razonable, lo que permite servir un chatbot privado en una RTX 3060/4060 o similar.
- Generación de contenido sin filtros en entornos controlados: la abliteración lo hace adecuado para investigación sobre seguridad, red teaming y generación de texto creativo sin restricciones, siempre con revisión humana.
- Prototipado rápido de aplicaciones en inglés y chino: al ser Apache-2.0 y GGUF, se integra en pipelines de prueba sin coste de licencia ni dependencia de API externa.
- Análisis de conversaciones largas y extracción de entidades: el contexto de 1M tokens permite mantener el hilo de sesiones de soporte o auditoría sin truncar, aunque el rendimiento real a esa longitud no está verificado en la documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas internas de la cuantización (KL macro por tier y coincidencia de top-1 frente al BF16), sin valores numéricos concretos en el texto proporcionado, y no incluye MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: entre 2,5 y 4 GB para el archivo de pesos según tier (2,26–3,15 GiB), más la caché KV; con contexto largo la caché KV crece de forma significativa y puede superar los pesos.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para contextos muy largos; A100/H100 solo si se necesita el contexto de 1M completo.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más para contextos moderados; para contexto cercano a 1M se requiere memoria muy superior a la de una GPU de consumo.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), servidores compatibles con endpoints OpenAI, y cualquier runtime que cargue GGUF.
- Latencia y throughput: no disponibles; dependen del tier, del hardware y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Spark-X2.5-4B-abliterated-FIT-GGUF | 4,11B | 1M (declarado) | Apache-2.0 | GGUF | Cuantización verificada por tier, uncensored |
| XHToken/Spark-X2.5-4B | 4,11B | 1M (declarado) | no disponible en la informacion | safetensors | Modelo base sin abliterar |
| Alternativas de ~4B (p. ej. Qwen, Llama 3.2) | ~3–4B | 8K–128K típicamente | variables | GGUF/safetensors | No se dispone de datos comparativos verificados en la informacion |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- La abliteración elimina mecanismos de rechazo: el modelo puede generar contenido dañino, ilegal o inexacto sin advertir; requiere filtros externos y supervisión en producción.
- Riesgo de alucinación inherente a un modelo de 4B; no se han publicado evaluaciones de fidelidad factual.
- El contexto de 1M tokens es una cifra declarada; no hay evidencia publicada de que el rendimiento se mantenga a esa longitud ( degradación por "lost in the middle" es esperable).
- Solo se declaran inglés y chino; el rendimiento en castellano no está evaluado y probablemente sea limitado.
- Licencia Apache-2.0 permite uso comercial, pero la responsabilidad legal por el contenido generado recae en el desplegador.
- El repositorio ocupa 19,5 GB por incluir múltiples tiers y artefactos; conviene descargar solo el archivo necesario.
- No se documentan capacidades de tool calling ni de agentes; no asumirlas en producción.
- La model card advierte que FIT-GGUF no garantiza un óptimo universal de calidad, solo el cumplimiento del contrato de fidelidad por tier.

## Enlaces

- Hugging Face: https://huggingface.co/SC117/Spark-X2.5-4B-abliterated-FIT-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B
- Herramienta FIT-GGUF: https://github.com/Scorp1o117/FIT-GGUF
- README en chino: https://huggingface.co/SC117/Spark-X2.5-4B-abliterated-FIT-GGUF/blob/main/README.zh-CN.md
- Banner del proyecto: https://huggingface.co/SC117/Spark-X2.5-4B-abliterated-FIT-GGUF/resolve/main/assets/fit-gguf-banner.png
- llama.cpp: https://github.com/ggerganov/llama.cpp
