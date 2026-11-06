# LiquidAI/d1-omni-600M-MLX-fp16

## Resumen

d1-omni-600M-MLX-fp16 es la exportación a formato MLX en float16 del modelo d1-omni-600M de Liquid AI, pensada para ejecutarse en Apple Silicon mediante la librería mlx-vlm. El modelo original es un "decision model": en lugar de generar texto token a token, responde preguntas con nombre y tipo definido (elección entre etiquetas, puntuación ordinal o probabilidad sí/no) sobre un estado de entrada que puede ser texto, JSON, imagen o audio, todo en un único forward pass y sin emitir tokens de salida.

Con 587 millones de parámetros reales (según safetensors), el modelo pertenece a la familia LFM2.5 y está diseñado para el edge: clasificación, enrutamiento, calibración y decisiones estructuradas con baja latencia. Su relevancia actual reside en que ofrece una alternativa determinista y con probabilidades calibradas a los LLM generativos para tareas de decisión, con soporte multimodal (visión y audio de hasta 30 segundos) y 15 idiomas.

Esta ficha cubre específicamente la variante MLX fp16, que es la precisión recomendada por el autor; existe también una exportación de 8 bits (0,73 GB) con una fidelidad ligeramente menor respecto al checkpoint original en float32.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (familia LFM2.5, multimodal con torre de visión, codificador de audio y scorer de decisión; no se detalla en la información proporcionada) |
| Parámetros totales | 587.161.089 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | float16 (esta exportación); 8 bits (exportación separada); sin exportación bfloat16 ni 4 bits |
| Idiomas soportados | en, de, es, fr, it, nl, pl, pt, ar, hi, ja, ru, tr, vi, zh |
| Licencia | lfm1.0 (licencia "other" con nombre lfm1.0) |
| Formato de pesos | safetensors (formato MLX, librería mlx; requiere mlx-vlm >= 0.7.8) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo más allá de que combina una torre de visión, un codificador de audio y un scorer de decisión sobre un tronco de la familia LFM2.5. El mecanismo clave es que el modelo no genera tokens: procesa el estado de entrada junto con las preguntas tipadas y produce directamente distribuciones de probabilidad sobre las opciones definidas por el usuario. Los tipos de pregunta soportados son `choice` (etiqueta entre criterios), `score` (nivel ordinal con leyenda) y `noul`/`bool` (probabilidad de "sí").

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica que el modelo fue entrenado en float32 y desaconseja explícitamente el uso de bfloat16, ya que en las pruebas de verificación alteraba 2 de 175 respuestas principales. La exportación MLX fp16 se validó contra el checkpoint original en float32 con mlx-vlm, con una coincidencia de 175/175 en la respuesta más probable y una desviación máxima de probabilidad de 0,007.

## Capacidades

- Decisión estructurada en un solo forward pass: responde varias preguntas con nombre sobre un mismo estado sin generar tokens.
- Tipos de pregunta: elección entre etiquetas (`choice`), puntuación ordinal (`score`) y probabilidad sí/no (`noul` o `bool`).
- Salida con probabilidades: cada respuesta incluye `probabilities`, `metadata.confidence` o la probabilidad de "sí", lo que permite umbrales y calibración.
- Procesamiento de texto y JSON como estado de entrada.
- Visión: la imagen puede constituir el estado completo de la consulta (pipeline image-text-to-text).
- Audio: procesa un clip mono a 16 kHz de hasta 30 segundos, como ruta, URL o array de muestras.
- Multilingüe: 15 idiomas (en, de, es, fr, it, nl, pl, pt, ar, hi, ja, ru, tr, vi, zh).
- Despliegue como servidor con endpoint `/v1/decisions` que acepta URLs, rutas o data URIs en base64 para imágenes y audio.
- No se menciona soporte de tool calling, agentes multi-paso ni modo de razonamiento extendido; el diseño es explícitamente "system-one" (respuesta directa, sin cadena de pensamiento).

## Casos de uso

- Enrutamiento de tickets de soporte: definir preguntas `choice` con criterios como facturación, técnico o fraude y obtener la etiqueta con su distribución de probabilidad en una sola pasada, lo que permite automatizar el triaje sin coste de generación.
- Detección de intención de reembolso: con una pregunta `noul` ("¿el cliente pide un reembolso?"), el modelo devuelve la probabilidad de sí, útil para priorizar colas o disparar flujos automáticos con umbral configurable.
- Priorización por urgencia: una pregunta `score` con niveles ("puede esperar", "hoy", "bloqueante") produce una puntuación ordinal calibrada que puede alimentar un sistema de SLA.
- Moderación y clasificación de imágenes: usar la foto como estado completo y preguntar por categorías (por ejemplo, recuento de objetos o presencia de contenido no permitido) con etiquetas `choice` y sus probabilidades.
- Análisis de llamadas o notas de voz: clasificar clips de hasta 30 segundos (petición, pregunta, discurso) para enrutar audio entrante en un contact center antes de una transcripción completa.
- Validación de formularios y JSON estructurados: pasar un JSON como estado y hacer preguntas de consistencia o categoría para control de calidad de datos en pipelines ETL.
- Filtrado previo a un LLM generativo: usar el modelo como primera etapa de bajo coste que decide si una consulta requiere un modelo grande, reduciendo gasto de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye una prueba de fidelidad numérica entre precisiones frente al checkpoint float32, que no constituye un benchmark de precisión:

| Repositorio | Pesos | Tamaño | Misma respuesta principal | Δp máximo | Δp medio |
|---|---|---:|---:|---:|---:|
| d1-omni-600M-MLX-fp16 | float16 | 1,17 GB | 175/175 | 0,007 | 0,0010 |
| d1-omni-600M-MLX-8bit | 8 bits (tronco y audio); visión y scorer en fp16 | 0,73 GB | 175/175 | 0,060 | 0,0083 |

La verificación cubre 104 respuestas de texto, 41 de imagen y 30 de audio.

## Requisitos de hardware

- VRAM/RAM unificada: el repo ocupa 1,2 GB y los pesos fp16 pesan 1,17 GB; en Apple Silicon la memoria unificada debe alojar al menos esa cantidad más el overhead de mlx-vlm.
- Hardware objetivo: Apple Silicon (series M1, M2, M3, M4 y superiores), ya que la exportación es MLX y no funciona en GPU NVIDIA ni CPU x86 con este formato.
- Cabe en cualquier Mac con memoria unificada de 8 GB o más; es un modelo de 587 M de parámetros.
- Despliegue: mlx-vlm >= 0.7.8, con CLI (`python -m mlx_vlm decide`) y servidor (`python -m mlx_vlm server --decision-model ...`) con endpoint `/v1/decisions`.
- Para GPU NVIDIA o entornos no Apple, debe usarse el checkpoint original en PyTorch (LiquidAI/d1-omni-600M), no esta exportación.
- Latencia y throughput: no disponibles en la información proporcionada; al no generar tokens, el coste es un único forward pass, pero no se publican cifras.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables de la misma categoría (modelos de decisión o clasificadores multimodales de ~600 M). La comparación se limita a las variantes del propio modelo:

| Modelo | Parámetros | Formato | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d1-omni-600M-MLX-fp16 | 587 M | MLX fp16 | 1,17 GB | lfm1.0 | Hugging Face (LiquidAI) |
| d1-omni-600M-MLX-8bit | 587 M | MLX 8 bits | 0,73 GB | lfm1.0 | Hugging Face (LiquidAI) |
| d1-omni-600M | 587 M | PyTorch (original) | no disponible | lfm1.0 | Hugging Face (LiquidAI) |

Comparativa con modelos de otras familias: no disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, solo responde preguntas tipadas predefinidas; no sirve para chat ni para redacción.
- El audio está limitado a clips mono de 16 kHz y 30 segundos como máximo.
- La longitud de contexto no está especificada en la información disponible, lo que dificulta planificar entradas de texto o JSON largas.
- Solo funciona con MLX en Apple Silicon; no es portable a CUDA con esta exportación.
- La licencia lfm1.0 es "other" y puede imponer restricciones al uso comercial; debe revisarse el archivo LICENSE antes de desplegar en producción.
- Riesgo de alucinación y sesgos: no se documentan en la información proporcionada; al tratarse de un clasificador, el riesgo se manifiesta como etiquetas incorrectas con confianza alta, por lo que conviene usar umbrales sobre las probabilidades devueltas.
- No se recomienda bfloat16 (altera respuestas según el autor) ni 4 bits (cambia una proporción notable de respuestas); fp16 es la precisión recomendada.
- El modelo base está entrenado en float32; la exportación fp16 es una aproximación validada con una prueba de humo de 175 respuestas, no un benchmark exhaustivo de precisión.
- Cobertura idiomática declarada de 15 idiomas, pero sin datos de rendimiento por idioma; el castellano está incluido, aunque no se publican métricas específicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/d1-omni-600M-MLX-fp16
- Modelo base original: https://huggingface.co/LiquidAI/d1-omni-600M
- Exportación 8 bits: https://huggingface.co/LiquidAI/d1-omni-600M-MLX-8bit
- Paper (arXiv): https://arxiv.org/abs/2511.23404
- Liquid AI: https://www.liquid.ai/
- Playground: https://playground.liquid.ai/
- Documentación: https://docs.liquid.ai/lfm/getting-started/welcome
- Discord: https://discord.com/invite/liquid-ai
- mlx-vlm (repositorio): https://github.com/Blaizzy/mlx-vlm
- Licencia (archivo LICENSE en el repo): https://huggingface.co/LiquidAI/d1-omni-600M-MLX-fp16/blob/main/LICENSE
