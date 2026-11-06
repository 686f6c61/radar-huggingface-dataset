# LiquidAI/d1-3B-MLX-fp16

## Resumen

d1-3B es un modelo de decisión desarrollado por Liquid AI que responde preguntas nombradas y tipadas sobre un estado (texto, JSON o imágenes) en un único forward pass, sin generar tokens. No es un modelo generativo al uso: recibe un estado y un conjunto de preguntas estructuradas, y devuelve respuestas tipadas (elección entre criterios, puntuación ordinal o probabilidad de sí/no) con sus probabilidades asociadas. Esta ficha cubre la exportación MLX en float16 para Apple Silicon, ejecutable con mlx-vlm.

El modelo pertenece a la familia LFM2.5 y se presenta como un sistema "system-one": una sola pasada de inferencia, sin cadena de pensamiento ni decodificación autoregresiva. Con 3.123.483.888 parámetros, está pensado para despliegue en el borde (edge) y para tareas de clasificación y calibración donde la latencia y la fiabilidad probabilística importan más que la generación libre de texto. Es multimodal: acepta imagen y texto como estado.

La relevancia actual reside en su enfoque: sustituir la generación de texto por decisión directa con probabilidades calibradas, lo que simplifica pipelines de enrutamiento, moderación o triaje. La licencia lfm1.0 y el soporte de 16 idiomas lo orientan a integraciones comerciales bajo condiciones específicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | lfm2_vl (multimodal, vision + lenguaje; transformer con código personalizado) |
| Parametros totales | 3.123.483.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float16 (esta exportación); 8-bit y 4-bit disponibles en repositorios separados |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | lfm1.0 (other) |
| Formato de pesos | safetensors (MLX, float16); repositorio de 6,3 GB |

## Arquitectura y entrenamiento

La arquitectura es lfm2_vl, un modelo multimodal que combina una torre de visión con un modelo de lenguaje, con código personalizado (`custom_code`) requerido para su carga. El modelo base es LiquidAI/d1-3B, y esta exportación se ha convertido con mlx-vlm mediante `--dtype float16`. El checkpoint original se almacena en bfloat16; la conversión a float16 es prácticamente exacta (todo salvo aproximadamente el 0,1 % de pesos, los más pequeños) y no produce desbordamientos, y en GPUs de Apple ofrece más precisión a la misma velocidad. No hay exportación en bfloat16.

El rasgo técnico distintivo es el modo de decisión: el modelo no decodifica tokens de salida (`output_tokens: 0`), sino que responde preguntas tipadas en un solo forward pass. Los tipos de pregunta son `choice` (etiqueta elegida con probabilidades y `metadata.confidence`), `score` (nivel esperado con probabilidades y leyenda) y `noul`/`bool` (probabilidad de sí). La torre de visión y el proyector nunca se cuantizan. No se dispone en la información proporcionada de detalles sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Decisión sobre texto, JSON o imágenes como estado de entrada, en una sola pasada.
- Preguntas tipadas: elección entre criterios (`choice`), puntuación ordinal (`score`) y probabilidad de sí/no (`noul`/`bool`).
- Salida con probabilidades por opción y confianza, apta para calibración y umbrales.
- Procesamiento de varias preguntas nombradas sobre un mismo estado en una sola llamada.
- Capacidad multimodal: la imagen puede constituir el estado completo (p. ej., contar objetos).
- Soporte multilingüe en 16 idiomas (árabe, chino, inglés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español, tailandés y vietnamita).
- Despliegue como servidor con endpoint `/v1/decisions` y como CLI (`python -m mlx_vlm decide`).
- No se indica soporte de tool calling, agentes multi-paso ni modo de pensamiento; el diseño es explícitamente de una sola pasada.

## Casos de uso

- Triaje de tickets de soporte: enviar el texto del ticket como estado y preguntas `choice` (equipo: facturación, técnico, fraude) y `score` (urgencia), obteniendo etiquetas con probabilidades para enrutar automáticamente.
- Detección de intención de reembolso: pregunta `noul` sobre el texto del cliente que devuelve la probabilidad de sí, útil para priorizar colas sin generación de texto.
- Moderación y clasificación de contenido: preguntas `choice` con criterios definidos sobre texto o JSON, con confianza por respuesta para aplicar umbrales.
- Enrutamiento de formularios JSON: usar el JSON como estado y preguntas tipadas para extraer decisiones de negocio (categoría, severidad) sin parsear salida libre.
- Inspección visual simple: usar una imagen como estado completo con preguntas `choice` (p. ej., número de objetos) para tareas de verificación rápida en el dispositivo.
- Clasificación en el borde en macOS: despliegue local con MLX en Apple Silicon, aprovechando la fp16 y la ausencia de generación para baja latencia y sin dependencia de red.
- Servicio de decisiones vía HTTP: exponer `/v1/decisions` para que otros servicios envíen estados y preguntas y reciban respuestas probabilísticas estructuradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). La model card solo incluye una prueba de concordancia entre precisiones frente al checkpoint original en float32, que no constituye un benchmark de precisión de tarea:

| Repositorio | Pesos | Tamano | Misma respuesta top | Δp max | Δp medio |
|---|---|---:|---:|---:|---:|
| d1-3B-MLX-fp16 | float16 | 6,25 GB | 145/145 | 0,005 | 0,0006 |
| d1-3B-MLX-8bit | 8-bit LM; vision, proyector y norms en fp16 | 3,72 GB | 144/145 | 0,015 | 0,0020 |
| d1-3B-MLX-4bit | 4-bit LM; vision, proyector y norms en fp16 | 2,37 GB | 142/145 | 0,212 | 0,0276 |

La comprobación cubre 104 respuestas de texto y 41 de imagen. La model card advierte que es una prueba de humo de concordancia, no un benchmark de precisión.

## Requisitos de hardware

- VRAM/memoria unificada: la exportación fp16 ocupa 6,25 GB en pesos; la 8-bit, 3,72 GB; la 4-bit, 2,37 GB.
- Orientado a Apple Silicon (MLX); requiere mlx-vlm 0.7.8 o superior.
- No se especifican GPU NVIDIA recomendadas; el formato MLX no es directamente compatible con CUDA.
- En Apple Silicon, la fp16 es la precisión recomendada; la 4-bit solo donde la memoria prime sobre la calibración (desviación de probabilidad de hasta ~0,2).
- Opciones de despliegue: biblioteca mlx-vlm (Python), CLI `mlx_vlm decide` y servidor `mlx_vlm server` con `/v1/decisions`.
- Latencia y throughput: no disponibles en la información proporcionada; al no generar tokens, la inferencia es de una sola pasada, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos comparables en la información proporcionada. Como referencia estructural dentro de la propia familia de exportaciones:

| Modelo | Parametros | Precision | Tamano | Licencia |
|---|---|---|---|---|
| d1-3B-MLX-fp16 | 3,12 B | float16 | 6,25 GB | lfm1.0 |
| d1-3B-MLX-8bit | 3,12 B | 8-bit (LM) + fp16 | 3,72 GB | lfm1.0 |
| d1-3B-MLX-4bit | 3,12 B | 4-bit (LM) + fp16 | 2,37 GB | lfm1.0 |

Comparativa con modelos de otras familias: no disponible.

## Limitaciones y advertencias

- Modelo de decisión, no generativo: no produce texto libre; su uso está restringido a preguntas tipadas sobre un estado.
- La cuantización a 4-bit altera probabilidades hasta ~0,2 y cambia la respuesta top en 3 de 145 casos; no recomendada cuando la calibración es crítica.
- Los cambios de respuesta top en las pruebas de concordancia se dieron en empates cercanos (el segundo del runner float32 estaba a menos de 0,1), lo que indica sensibilidad en casos ambiguos.
- No se detalla el contexto máximo soportado; estados largos pueden exceder límites no documentados aquí.
- Riesgo de sesgo y alucinación no cuantificado en la información disponible; al devolver etiquetas con probabilidad, conviene aplicar umbrales y revisión humana.
- Licencia lfm1.0 ("other"): es necesario revisar el archivo LICENSE para condiciones de uso comercial.
- Dependencia de MLX y Apple Silicon; no hay ruta CUDA indicada en esta exportación.
- Requiere código personalizado (`custom_code`) para la carga del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/LiquidAI/d1-3B-MLX-fp16
- Modelo base: https://huggingface.co/LiquidAI/d1-3B
- Exportación 8-bit: https://huggingface.co/LiquidAI/d1-3B-MLX-8bit
- Exportación 4-bit: https://huggingface.co/LiquidAI/d1-3B-MLX-4bit
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Playground: https://playground.liquid.ai/
- Documentación: https://docs.liquid.ai/lfm/getting-started/welcome
- Discord: https://discord.com/invite/liquid-ai
- Web de Liquid AI: https://www.liquid.ai/
- Paper referenciado (arXiv): https://arxiv.org/abs/2511.23404
