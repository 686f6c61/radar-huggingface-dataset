# LiquidAI/d1-2B-MLX-8bit

## Resumen

d1-2B-MLX-8bit es la versión cuantizada a 8 bits para MLX (Apple Silicon) de d1-2B, un modelo de decisión de Liquid AI. A diferencia de un LLM generativo convencional, d1-2B responde preguntas con nombre y tipo sobre un estado (texto, imágenes o vídeo) devolviendo probabilidades calibradas en una sola pasada hacia adelante, sin generar tokens de salida. Esto lo posiciona en la categoría de modelos "system-one" orientados a clasificación, calibración y decisiones rápidas en el borde (edge).

El modelo base es multimodal y pertenece a la familia LFM3 de Liquid AI, con aproximadamente 1.918 millones de parámetros según los safetensors del repositorio. La variante MLX-8bit cuantiza el modelo de lenguaje con cuantización afín de 8 bits en grupos de 64, manteniendo la torre de visión, el proyector y las normas en FP16. El resultado ocupa 2,22 GB y, según la model card, conserva las 52 respuestas del conjunto de pruebas del checkpoint original en float32, con un desplazamiento máximo de las probabilidades de 0,008.

Su relevancia actual radica en el creciente interés por modelos pequeños y eficientes capaces de ejecutar tareas de decisión estructurada (clasificación, enrutado, puntuación, detección) en dispositivos locales con latencia mínima y coste de cómputo muy bajo, ya que la salida no requiere decodificación autoregresiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de decisión multimodal (texto, imagen, vídeo) de la familia LFM3; no disponible el detalle exacto de la arquitectura interna en esta ficha |
| Parametros totales | 1.918.181.888 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afín, grupos de 64 (modelo de lenguaje); torre de visión, proyector y normas en FP16 |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (licencia propia de Liquid AI, tipo "other") |
| Formato de pesos | safetensors (cuantizado, librería MLX) |

## Arquitectura y entrenamiento

d1-2B es un modelo de decisión multimodal construido sobre la familia LFM3 de Liquid AI. Su interfaz, `system_one`, acepta un "estado" (texto, una imagen o vídeo) y un conjunto de preguntas con nombre y tipo (por ejemplo, `noul` para sí/no con probabilidad, `choice` para selección única o múltiple con criterios, `score` para puntuación con leyenda, `number` con rango y paso, y `box` para localización en imagen). Todas las preguntas se responden en una única pasada hacia adelante, sin generación de tokens: en el ejemplo de la model card, una petición con cuatro preguntas consume 189 tokens de entrada y 0 tokens de salida.

La variante MLX-8bit aplica cuantización afín de 8 bits con grupos de 64 al modelo de lenguaje, mientras que la torre de visión, el proyector y las capas de normalización se mantienen en FP16 para preservar la precisión en la percepción visual. Según la model card, frente al checkpoint original ejecutado en float32, esta versión mantiene las 52 respuestas del test y las probabilidades varían como máximo 0,008, lo que indica una degradación prácticamente despreciable.

No se ha publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. La model card remite a la ficha del modelo base (LiquidAI/d1-2B) para la arquitectura completa y las instrucciones de uso.

## Capacidades

- Respuesta de preguntas con nombre y tipo sobre un estado, con probabilidades calibradas, en una sola pasada sin generación de tokens.
- Tipos de pregunta soportados: binaria con probabilidad (`noul`), elección única o múltiple con criterios definibles (`choice`), puntuación con leyenda (`score`), número con rango y paso (`number`) y caja delimitadora en imágenes (`box`).
- Entrada multimodal: texto, imágenes y vídeo (el pipeline en Hugging Face es image-text-to-text).
- Procesamiento por lotes mediante `model.system_one_batch` para varias peticiones simultáneas.
- Clasificación multi-etiqueta, enrutado de tickets, calibración de confianza y localización visual de objetos.
- Soporte multilingüe en 16 idiomas, incluido el castellano.
- Salida estructurada en JSON desde la línea de comandos, apta para integración en pipelines.
- No es un modelo conversacional generativo: no produce texto libre ni razonamiento en lenguaje natural.

## Casos de uso

- Enrutado automático de tickets de soporte: con una sola pasada clasifica el equipo destinatario (`choice`), los temas tratados (`choice` múltiple) y la urgencia (`score`) de un mensaje de cliente, sin generar texto, lo que reduce el coste y la latencia frente a un LLM generativo.
- Detección de intención en conversaciones: preguntas binarias calibradas (`noul`) permiten decidir si el cliente pide un reembolso, cancela o reclama, con una probabilidad sobre la que establecer umbrales de negocio.
- Moderación y filtrado de contenido: clasificación multi-etiqueta de mensajes o comentarios con criterios personalizados y probabilidades calibradas para definir políticas de bloqueo.
- Análisis visual de imágenes: conteo de objetos (`number` con rango) y localización de elementos mediante cajas delimitadoras (`box`), útil en inventario visual, inspección o automatización con cámaras.
- Clasificación de vídeo: el modelo acepta vídeo como estado, lo que permite decisiones temporales (por ejemplo, detectar eventos o escenas) aunque la model card no detalla el formato exacto.
- Priorización de colas de trabajo: la puntuación de urgencia (`score`) con leyenda permite ordenar tickets, alertas o peticiones de forma automática en sistemas de atención al cliente.
- Despliegue en dispositivos Apple Silicon: gracias a la cuantización de 8 bits y los 2,22 GB de pesos, cabe en portátiles y equipos de escritorio con memoria unificada, sin depender de GPU de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de validación publicado es que, frente al checkpoint original en float32, la versión MLX-8bit mantiene las 52 respuestas del test interno y las probabilidades se desplazan como máximo 0,008.

## Requisitos de hardware

- VRAM/memoria necesaria: aproximadamente 2,22 GB de pesos; en Apple Silicon se ejecuta sobre memoria unificada, por lo que cualquier Mac con 8 GB de RAM o más debería ser suficiente para inferencia con margen.
- GPU recomendadas: no requiere GPU de servidor; está diseñado para Apple Silicon mediante MLX. No se indica compatibilidad con CUDA en esta variante.
- Consumer hardware: sí, cabe en portátiles Apple Silicon de gama base (M1/M2/M3 con 8 GB de RAM unificada).
- Despliegue: MLX-VLM (soporte en progreso según la model card, con ejemplos en Python y CLI incluidos). No se menciona soporte para vLLM, llama.cpp, Ollama o TGI en esta variante.
- Latencia y throughput: no disponible en cifras concretas; al responder sin generar tokens (0 tokens de salida en el ejemplo de la model card), la latencia por petición es inherentemente baja, y `system_one_batch` permite procesar varias peticiones por lote.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Modalidad | Salida | Licencia |
|---|---|---|---|---|---|
| LiquidAI/d1-2B-MLX-8bit | 1,92 B (2,22 GB en 8 bits) | Decision y clasificacion calibrada | Texto, imagen, video | Probabilidades estructuradas, sin generacion | lfm1.0 |
| LiquidAI/d1-2B (base) | 1,92 B | Decision y clasificacion calibrada | Texto, imagen, video | Probabilidades estructuradas, sin generacion | lfm1.0 |
| LLMs generativos pequeños (p. ej. LFM3-1.7B de Liquid AI) | ~1,7 B | Generacion de texto y razonamiento | Texto | Tokens generados | no disponible en esta ficha |

Nota: no existen en la información disponible alternativas directamente comparables de otros fabricantes con el mismo paradigma de decisión en una sola pasada; la comparación más pertinente es con el modelo base del que deriva y con LLMs pequeños multimodales de tamaño similar, que resuelven tareas de clasificación mediante generación de texto, con mayor coste por consulta.

## Limitaciones y advertencias

- No genera texto libre: no es sustituto de un LLM conversacional; solo responde preguntas tipadas y estructuradas sobre un estado.
- El soporte en MLX-VLM está en progreso según la model card, por lo que la integración puede cambiar en próximas versiones de la librería.
- La cuantización a 8 bits, aunque validada por el autor (desviación máxima de 0,008 en probabilidades), puede introducir diferencias mínimas frente al checkpoint en float32; en aplicaciones con umbrales muy ajustados conviene verificar la calibración en el dominio propio.
- La licencia lfm1.0 es una licencia propia ("other"), no una licencia estándar permisiva: es imprescindible revisar sus términos antes de cualquier uso comercial.
- No se dispone de benchmarks públicos estándar, lo que dificulta comparar su calidad frente a alternativas de forma objetiva.
- No se ha publicado información sobre sesgos conocidos, tasas de alucinación ni límites de contexto; al tratarse de un modelo de decisión con salida calibrada, el riesgo de alucinación textual no aplica, pero las probabilidades pueden estar mal calibradas fuera de la distribución de entrenamiento.
- El detalle de la arquitectura interna, la longitud de contexto y los datos de entrenamiento no están disponibles en esta ficha; remitirse a la model card del modelo base para más información.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/d1-2B-MLX-8bit
- Modelo base: https://huggingface.co/LiquidAI/d1-2B
- MLX-VLM (repositorio): https://github.com/Blaizzy/mlx-vlm
- Guía de despliegue MLX de Liquid AI: https://docs.liquid.ai/deployment/on-device/mlx
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Blog de Liquid AI sobre LFM3: https://www.liquid.ai/blog/lfm3
- Playground de Liquid AI: https://playground.liquid.ai/
- Consola/API de Liquid AI: https://console.liquid.ai/dashboard
