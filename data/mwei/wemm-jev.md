# mwei/WeMM-JEV

## Resumen

WeMM-JEV es un modelo multimodal de decisión de 27B parámetros desarrollado por el usuario mwei, construido sobre Qwen3.8-27B. A diferencia de un modelo generativo convencional, WeMM-JEV no produce texto libre: formula preguntas cerradas sobre entradas de texto y múltiples imágenes y devuelve probabilidades calibradas en una única pasada hacia delante. Soporta tres tipos de consulta: elección entre opciones (choice), estimación de probabilidad de una proposición sí/no (noul) y distribución de probabilidad sobre niveles ordenados (score).

El modelo se posiciona como una capa de decisión reutilizable para pipelines que necesitan puntuaciones probabilísticas en lugar de generación abierta, por ejemplo para enrutamiento, verificación o evaluación automática. Su card reporta un Public Decision Index 0.3 de 69,37 en el panel de texto y 77,97 en el de visión, métricas propias del autor sin detalle metodológico en la información disponible.

La relevancia actual radica en su enfoque: extraer probabilidades de un transformer multimodal grande sin muestreo autoregresivo, lo que reduce latencia y variabilidad frente a enfoques basados en logprobs de modelos generativos. La licencia Apache 2.0 y el formato safetensors facilitan su integración, aunque el ecosistema de inferencia es propio (código custom) y no estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.8-27B), tag `qwen3_5`, código custom |
| Parametros totales | 26.085.330.160 (~26,1B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; sin GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 52,2 GB, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

WeMM-JEV parte de Qwen3.8-27B, un transformer denso de ~26B parámetros, y le añade una cabeza de decisión que transforma el estado del modelo en distribuciones de probabilidad sobre conjuntos de opciones, proposiciones binarias o niveles ordenados. El modelo procesa texto e imágenes múltiples en la misma secuencia de entrada y emite una respuesta probabilística en una sola pasada, sin decodificación autoregresiva. El repositorio incluye código de inferencia propio (`D3Engine`) con soporte para GPU CUDA y un servidor HTTP.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni detalles del proceso de alineación o calibración de las probabilidades. La model card únicamente documenta los tres tipos de tarea y los resultados del índice propio. El tag `qwen3_5` sugiere una base de la familia Qwen3, pero no se especifican innovaciones técnicas adicionales como atención lineal o decodificación especulativa.

## Capacidades

- Decisión por elección (choice): selecciona entre opciones suministradas y devuelve probabilidad por opción.
- Decisión binaria (noul): estima la probabilidad de que una proposición sí/no sea cierta.
- Puntuación ordenada (score): devuelve una distribución sobre niveles ordenados (por ejemplo, escalas de calidad o severidad).
- Entrada multimodal: procesa texto y múltiples imágenes en una misma consulta.
- Inferencia en una sola pasada por pregunta, sin generación autoregresiva.
- Integración con un Decision Index propio para evaluación agregada.
- Servidor HTTP incluido en el paquete de inferencia.
- Soporte de tool calling, agentes, thinking mode, audio o multilingüismo: no disponible en la información proporcionada.

## Casos de uso

- Verificación automática de afirmaciones: dado un texto y una proposición, usar el modo noul para obtener una probabilidad de veracidad y fijar umbrales en un pipeline de control de calidad.
- Enrutamiento de tickets de soporte: plantear una pregunta de elección con las categorías disponibles y usar la distribución de salida para asignar el ticket al equipo correspondiente.
- Moderación de contenido con imágenes: combinar texto e imágenes en una consulta de elección (permitido, dudoso, prohibido) y aplicar el umbral definido por política.
- Evaluación de calidad de respuestas generadas: usar el modo score para puntuar respuestas de otro modelo sobre una escala ordenada y filtrar las de baja probabilidad.
- Clasificación de documentos escaneados: enviar la imagen del documento junto con opciones de tipo documental y obtener la probabilidad por clase en una sola pasada.
- Control de acceso o validación de formularios: comprobar mediante proposiciones sí/no si una captura cumple los requisitos definidos antes de continuar el flujo.
- Anotación asistida en investigación: generar distribuciones de etiqueta para comparar con anotaciones humanas y medir el desacuerdo entre anotadores.

## Benchmarks y rendimiento

| Panel | Public Decision Index 0.3 |
|---|---:|
| Texto | 69,37 |
| Visión | 77,97 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) ni comparaciones con modelos de referencia. El índice reportado es una métrica propia del autor sin metodología detallada en la model card; los resultados completos se enlazan a un dataset externo.

## Requisitos de hardware

- VRAM estimada: ~52 GB en fp16/bf16 para los 26,1B parámetros; ~26-28 GB en cuantización de 8 bits; ~14-16 GB en 4 bits (estimaciones teóricas, no se publican cuantizaciones oficiales).
- GPU recomendadas: A100 80 GB o H100 80 GB para fp16 sin offloading; A100 40 GB o RTX 6000 Ada 48 GB con cuantización 8 bits.
- GPU de consumo: una RTX 4090 (24 GB) solo sería viable con cuantización de 4 bits y posibles limitaciones por el código custom; no hay soporte GGUF documentado.
- Despliegue: el repositorio incluye su propio motor de inferencia (`D3Engine`) y un servidor HTTP; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeMM-JEV | ~26,1B | no disponible | Decisión probabilística multimodal | Apache 2.0 | HuggingFace, código custom |
| Qwen3 (base de referencia) | ~27B (familia) | no disponible | Generación de texto | Apache 2.0 (según variante) | HuggingFace, amplio ecosistema |
| Modelos de clasificación multimodal (p. ej. CLIP) | <1B | corto | Clasificación imagen-texto | variable | HuggingFace, ecosistema estándar |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparación se limita a parámetros, licencia y enfoque.

## Limitaciones y advertencias

- Modelo de decisión cerrada: no genera texto libre ni mantiene conversaciones; no es un sustituto de un LLM generativo.
- Sin información sobre sesgos, idiomas soportados ni composición del entrenamiento; el comportamiento fuera del inglés o en dominios especializados es desconocido.
- Riesgo de calibración deficiente de las probabilidades: el índice reportado es propio y no hay validación externa disponible.
- Requiere `trust_remote_code` y código de inferencia propio, lo que aumenta la superficie de riesgo en producción y complica la auditoría.
- Sin cuantizaciones oficiales ni soporte documentado para vLLM, llama.cpp u Ollama; el despliegue eficiente queda limitado al motor incluido.
- Repositorio con 15 descargas y sin likes: ecosistema mínimo, poca validación comunitaria.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre datos de entrenamiento impide evaluar riesgos de propiedad intelectual.
- Fecha de creación del repositorio en 2026: verificar la vigencia y el mantenimiento del proyecto antes de adoptarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mwei/WeMM-JEV
- Resultados de evaluación: https://huggingface.co/datasets/Rover00/WeMM-JEV-Results
- Documentación de inferencia: incluida en el repositorio (`inference/README.md`)
