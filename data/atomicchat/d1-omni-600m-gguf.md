# AtomicChat/d1-omni-600M-GGUF

## Resumen

d1-omni-600M es un modelo de decisión desarrollado por Liquid AI, distribuido aquí en formato GGUF por AtomicChat. A diferencia de un modelo generativo convencional, recibe un estado (texto o JSON, opcionalmente acompañado de imágenes o hasta 30 segundos de audio) y responde preguntas tipadas en un único forward pass: sí/no, elección entre opciones con nombre o una puntuación. No genera texto libre; la respuesta se lee directamente de las puntuaciones del modelo sobre las opciones.

Arquitectura basada en la familia LFM (Liquid Foundation Models) con un tronco convolucional híbrido y una cabeza de decisión compuesta por dos bloques transformer seguida de un scorer de opciones. El modelo base declara 587 millones de parámetros, aunque los pesos en safetensors del repositorio original suman 380.732.161 parámetros efectivos. Está pensado para tareas de clasificación y enrutamiento de baja latencia, donde un LLM generativo resultaría sobredimensionado.

La relevancia de esta ficha radica en que AtomicChat publica métricas de fidelidad de cuantización medidas sobre 1.285 decisiones reales en 30 idiomas y código fuente, algo poco habitual. El modelo es pequeño y sensible a la cuantización, por lo que la elección del archivo GGUF afecta de forma medible a la tasa de respuestas correctas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM híbrida (tronco convolucional) con cabeza de decisión de dos bloques transformer y scorer de opciones |
| Parametros totales | 380.732.161 (safetensors); el autor declara 587M en la model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; se recomienda `-b`/`-ub` de 8192 para una imagen con estado de varios miles de tokens |
| Tipos de cuantizacion | BF16, Q8_0, AD-Q6_K, AD-Q5_K_M, AD-Q4_K_M (AD = Atomic Dynamic, tipo por tensor); proyectores mmproj en BF16 y Q8_0 |
| Idiomas soportados | evaluación en 30 idiomas más código fuente; lista concreta no disponible |
| Licencia | lfm1.0 (license_name: lfm1.0, license: other) |
| Formato de pesos | GGUF (llama.cpp) y safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo pertenece a la familia LFM2.5 de Liquid AI y combina un tronco de bloques convolucionales con una cabeza de decisión específica: dos bloques transformer seguidos de un scorer que puntúa cada opción candidata. La inferencia no es autorregresiva; el modelo procesa la pregunta completa en un solo batch y devuelve la opción con mayor puntuación, lo que explica su baja latencia y su idoneidad para enrutamiento y clasificación. Los proyectores multimodales (visión y audio) se distribuyen por separado como `mmproj` en BF16 y Q8_0.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card del repositorio GGUF se centra en la metodología de cuantización: AtomicChat aplica una importance matrix propia y elige el tipo de cuantización por tensor (Atomic Dynamic), manteniendo la cabeza de decisión y el scorer en Q8_0 en todos los archivos, la tabla de tokens por encima del resto y la atención en Q8_0 (o Q6_K en AD-Q4_K_M). El modelo requiere un build de llama.cpp con el PR #30114 (commit `a657f7e` o posterior) y expone el endpoint `/v1/systemone`.

## Capacidades

- Decisión tipada en un solo forward pass: preguntas de tipo `noul` (sí/no), `choice` (elección entre opciones con nombre) y `score` (puntuación).
- Procesamiento de estado en texto plano o JSON estructurado.
- Entrada multimodal: imágenes y hasta 30 segundos de audio mediante los proyectores `mmproj`.
- Multilingüe: evaluación sobre textos held-out en 30 idiomas, además de código fuente.
- Enrutamiento y clasificación: asignación a categorías definidas por criterios en la propia petición.
- Extracción de características (tag `feature-extraction`).
- No genera texto libre: no soporta tool calling generativo, agentes multi-paso ni razonamiento encadenado.
- Compatible con endpoints de llama.cpp (`/v1/systemone`).

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del cliente y devuelve la elección entre equipos (`billing`, `technical`, `fraud`) con una sola pasada, como muestra el ejemplo de la model card, lo que permite clasificar en milisegundos sin un LLM generativo.
- Detección de sentimiento y urgencia: preguntas `noul` del tipo "¿está el cliente enfadado?" o "¿requiere escalado inmediato?" sobre conversaciones multi-turno, con la ventana de 8192 tokens configurada en `-b`/`-ub`.
- Moderación de contenido multimodal: clasificación de imágenes o fragmentos de audio de hasta 30 segundos con los proyectores `mmproj`, útil para filtros previos a publicación.
- Validación de formularios y JSON: comprobar si un payload cumple criterios definidos en la petición (campos obligatorios, rangos, coherencia) sin generar explicaciones.
- Control de calidad en pipelines de datos: puntuación (`score`) de pares pregunta-respuesta o de documentos para filtrar por calidad antes de entrenar otros modelos.
- Enrutamiento de comandos en asistentes locales: decidir qué herramienta o flujo activar a partir del estado del usuario, ejecutándose en CPU o GPU de gama baja gracias a su tamaño.
- Clasificación de código: etiquetar fragmentos de código fuente por lenguaje, propósito o riesgo de seguridad, dado que la evaluación incluye código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card publica métricas de fidelidad de cuantización frente a los pesos originales en FP32 sobre 1.285 decisiones:

| Archivo | Tamano | Misma respuesta | Deriva de opciones | KL de opciones |
|---|---:|---:|---:|---:|
| BF16 | 764 MB | 99,4% (8) | 0,0029 | 0,00005 |
| Q8_0 | 407 MB | 97,7% (29) | 0,0116 | 0,0008 |
| AD-Q6_K | 347 MB | 97,4% (33) | 0,0173 | 0,0020 |
| AD-Q5_K_M | 293 MB | 95,4% (59) | 0,0324 | 0,0065 |
| AD-Q4_K_M | 256 MB | 92,7% (94) | 0,0516 | 0,0153 |

Comparación adicional: el `Q4_K_M` estándar de llama.cpp (247 MB) cambió 133 respuestas con un KL de opciones de 0,0255, frente a 97 respuestas y un 44% menos de KL en `AD-Q4_K_M`. El mayor desplazamiento en una sola probabilidad de opción es de 0,18 en Q8_0 y 0,46 a 4 bits. En una pregunta con imagen, el BF16 con proyector obtuvo 0,944 frente a 0,951 del código PyTorch de Liquid.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB para BF16 (764 MB en disco) y alrededor de 300-450 MB para las cuantizaciones Q8_0 a Q4_K_M, más el proyector `mmproj`.
- Cabe en cualquier GPU consumer, incluida una GTX 1650 o una iGPU con suficiente memoria compartida; también funciona en CPU.
- GPU recomendadas: no requiere aceleradores de datacenter; A100 o H100 son innecesarias. Cualquier RTX con más de 2 GB libres es suficiente.
- Despliegue: llama.cpp (`llama-server`) con el PR #30114 o posterior; el endpoint es `/v1/systemone`. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Configuración obligatoria: `-b` y `-ub` deben cubrir el prompt más largo, ya que el modelo lee la pregunta completa en un solo batch; 8192 cubre una imagen con un estado de varios miles de tokens.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d1-omni-600M (este) | 380,7M efectivos (587M declarados) | no disponible (recomendado 8192) | Decisión, multimodal | lfm1.0 | GGUF en HF |
| d1-3B (familia d1 de Liquid AI) | no disponible | no disponible | Decisión | no disponible | mencionado en la model card |
| LLM generativo pequeño (p. ej. 0,5-1B) | 500M-1B | 2K-32K típico | Generación de texto | variable | amplia |

La model card indica que la cuantización afecta más a d1-omni que a d1-3B, lo que sugiere que este último es la alternativa dentro de la misma familia cuando se necesita mayor robustez numérica. Frente a un LLM generativo del mismo orden de parámetros, d1-omni ofrece respuestas tipadas y deterministas con una sola pasada, pero carece de generación libre y de razonamiento multi-paso.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, no soporta tool calling generativo ni agentes multi-paso.
- Sensibilidad alta a la cuantización: Q8_0 ya cambia un 2,3% de las respuestas y 4 bits un 7,3%; por debajo de 6 bits debe validarse con preguntas propias.
- Los benchmarks de fidelidad se midieron en una sola máquina y sobre 1.285 decisiones; no se midieron decisiones con imagen ni audio, solo una pregunta de imagen aislada.
- Idiomas: se evalúa en 30 idiomas, pero no se publica la lista ni el rendimiento por idioma.
- Licencia lfm1.0: es una licencia "other" con términos propios; deben revisarse las restricciones de uso comercial en el archivo LICENSE antes de desplegar en producción.
- Requiere un build específico de llama.cpp (PR #30114, commit `a657f7e` o posterior); versiones anteriores no funcionan.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de calibración errónea: las puntuaciones de opciones pueden desplazarse con la cuantización.
- Sesgos: no se documenta ninguna evaluación de sesgos en la información disponible.
- El conteo de parámetros difiere entre la model card (587M) y los safetensors (380,7M); conviene verificar cuál corresponde al uso previsto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/AtomicChat/d1-omni-600M-GGUF
- Modelo base: https://huggingface.co/LiquidAI/d1-omni-600M
- Métricas y logs de cuantización: https://huggingface.co/datasets/AtomicChat/d1-omni-600M-GGUF-metrics
- PR de llama.cpp requerido: https://github.com/ggml-org/llama.cpp/pull/30114
- Aplicación Atomic Chat: https://atomic.chat/
- Repositorio Atomic Chat en GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
