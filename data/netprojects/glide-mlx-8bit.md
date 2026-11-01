# netprojects/GLiDE-mlx-8bit

## Resumen

GLiDE-mlx-8bit es una conversión a formato MLX de 8 bits del modelo de decisión GLiDE de Fastino, construido sobre Qwen3.8-27B. A diferencia de un modelo conversacional al uso, GLiDE no genera texto: recibe un estado (texto, JSON o imágenes) junto con preguntas tipadas (`choice`, `noul` para sí/no, `score`) y devuelve una probabilidad para cada opción en un único forward pass por pregunta. El checkpoint aquí descrito pesa 28,2 GB y está pensado para ejecutarse en Apple Silicon.

La relevancia de esta conversión es práctica: permite ejecutar el modelo original (licenciado bajo Fastino Community License) en hardware de Apple con MLX, manteniendo fidelidad respecto a los pesos originales en bf16. Según el autor, coincide con la respuesta principal del código PyTorch de referencia en 202/204 preguntas y con los pesos originales en MLX en 204/204.

El modelo base es GLiDE v1.2 (revisión `d199b6d`), que combina capas de atención completa no causal con capas Gated DeltaNet, e incorpora un readout de 255 vías para producir la distribución de probabilidad sobre las opciones. Esta conversión la publica NetProjects (Internet Projects Ltd) y no está afiliada a Fastino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (16 capas de atención completa no causal + 48 capas Gated DeltaNet) sobre Qwen3.8-27B, con readout de 255 vías |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no consta como MoE) |
| Longitud de contexto | no disponible (el autor menciona prompts de hasta ~4K tokens en pruebas) |
| Tipos de cuantizacion | 8 bits afín (affine), group size 64; existe versión 4 bits (15,3 GB) y pesos originales en bf16 |
| Idiomas soportados | no disponible |
| Licencia | fastino-community (Fastino Community License) |
| Formato de pesos | safetensors (MLX), más `readout.safetensors` separado |

## Arquitectura y entrenamiento

GLiDE es un modelo de decisión construido sobre Qwen3.8-27B. La arquitectura combina 16 capas de atención completa que leen el prompt de forma bidireccional (sin máscara causal, `noncausal_full_attention`) con 48 capas Gated DeltaNet que mantienen su recurrencia. La respuesta no se genera token a token: el estado oculto del último token pasa por un readout de 255 vías (mantenido en su precisión original) y se aplica softmax sobre las opciones a la temperatura definida en `decision_config.json`.

En esta conversión MLX se conservan sin cambios los módulos de prompt e imágenes de GLiDE, el encoder de visión a su precisión original y la API `POST /v1/systemone` del servidor original. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

## Capacidades

- Decisión con probabilidades calibradas: devuelve una probabilidad por opción para preguntas de tipo `choice`, `noul` (sí/no) y `score`.
- Entrada multimodal: acepta estados en texto, JSON e imágenes (pipeline `image-text-to-text`).
- Lectura bidireccional del prompt en las capas de atención completa, lo que permite considerar el estado completo de forma no causal.
- Una sola pasada por pregunta: no hay generación autorregresiva.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad nativa; el modelo está orientado a decisiones puntuales.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Clasificación de intenciones en atención al cliente: dado el texto de una reclamación, devolver la probabilidad de cada intención (reembolso, cambio, información) con preguntas de tipo `choice`, como muestra el ejemplo de la model card.
- Triaje de tickets con señales binarias: usar preguntas `noul` para detectar si un cliente está enfadado, si el caso es urgente o si requiere escalado, obteniendo una probabilidad en lugar de una etiqueta rígida.
- Enrutamiento con umbral de calibración: al devolver probabilidades, permite fijar umbrales y derivar a revisión humana los casos con baja confianza.
- Análisis de estados estructurados: procesar JSON (pedidos, incidencias, registros) y responder preguntas sobre su contenido sin necesidad de generar resúmenes.
- Evaluación sobre imágenes: con el encoder de visión conservado, permite decidir sobre estados que incluyen capturas o documentos escaneados.
- Evaluación de calidad en pipelines de datos: usar preguntas `score` para puntuar pares o elementos y filtrar por probabilidad.
- Despliegue local en Apple Silicon: servir el modelo con `glide-mlx` en un Mac con suficiente memoria unificada para prototipos y entornos de desarrollo sin GPU dedicada.

## Benchmarks y rendimiento

Datos publicados por el autor de la conversión (MacBook Pro M5 Max, 128 GB, 29 de octubre de 2026):

| Metrica | Resultado |
|---|---|
| Coincidencia con la respuesta principal del código PyTorch de Fastino (bf16) | 202 / 204 preguntas; diferencia media de probabilidad 0,002 |
| Coincidencia con los pesos originales en MLX (bf16) | 204 / 204 |
| JevBench público (231 preguntas, JevBench v1.2.1, `--adapter typesafe`) | 215 / 231 (easy 48/48 · standard 72/72 · hard 95/111) |
| Tiempo por ítem de JevBench (prompts hasta ~4K tokens) | 0,74 s de mediana |

El conjunto de comparación incluye 72 peticiones con 204 preguntas: estados de texto y JSON de 30 a 1.500 palabras, 12 peticiones con imagen y los tres tipos de pregunta.

## Requisitos de hardware

- VRAM/memoria: 28,2 GB de pesos en 8 bits; la versión 4 bits ocupa 15,3 GB. Requiere memoria unificada suficiente para pesos, encoder de visión y contexto.
- Hardware probado: Apple M5 Max con 128 GB de memoria unificada.
- GPU dedicadas (A100, H100, RTX 4090): no disponible; esta conversión es específica de MLX para Apple Silicon.
- Cabe en GPU de consumo: no disponible para este checkpoint MLX; para CUDA habría que usar los pesos originales de `fastino/GLiDE`.
- Despliegue: servidor propio `glide-mlx` (`python -m glide_mlx.server --model glide-mlx-8bit --port 8790`), expuesto en `POST /v1/systemone`. El autor advierte explícitamente de no usar `mlx_lm.server` ni una llamada genérica a `mlx_vlm` generate.
- Latencia: 0,74 s de mediana por ítem de JevBench con prompts de hasta ~4K tokens en M5 Max.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLiDE-mlx-8bit (esta ficha) | 26,1B | no disponible | Modelo de decisión (probabilidades) | fastino-community | MLX, Apple Silicon |
| GLiDE-mlx-4bit | no disponible | no disponible | Modelo de decisión (probabilidades) | fastino-community | MLX, Apple Silicon (15,3 GB) |
| fastino/GLiDE (original) | no disponible | no disponible | Modelo de decisión (probabilidades) | fastino-community | Pesos originales bf16 |
| Qwen3.8-27B (modelo base) | no disponible | no disponible | LLM conversacional | Apache-2.0 | Pesos originales |

La comparación con modelos de decisión alternativos de la misma categoría no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat: no genera texto ni mantiene conversaciones; solo devuelve probabilidades sobre opciones predefinidas.
- Requiere servir con `glide-mlx`: usar `mlx_lm.server` o `mlx_vlm` generate produce resultados incorrectos porque no leen el readout de 255 vías ni aplican la atención no causal.
- Licencia Fastino Community: el uso comercial exige mostrar "Built with Fastino GLiDE" (sección 4), y el uso comercial en producción por entidades con ingresos anuales superiores a 10 millones de USD requiere un acuerdo separado con Fastino (secciones 2–3).
- Idiomas soportados no documentados: riesgo de comportamiento degradado fuera de los idiomas cubiertos por el entrenamiento original.
- Longitud de contexto no documentada: las pruebas del autor se limitan a prompts de hasta ~4K tokens.
- Riesgo de calibración: aunque el modelo devuelve probabilidades, los casos con margen muy bajo entre las dos opciones principales (el autor cita márgenes de 0,018 y 0,000) deben tratarse con cautela.
- Sesgos y alucinación: no hay información específica publicada; al no generar texto, el riesgo de alucinación se traslada a la calibración de las probabilidades sobre opciones mal definidas.
- Conversión no oficial: publicada por NetProjects, sin afiliación con Fastino; la fidelidad se ha validado solo frente a la referencia del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/netprojects/GLiDE-mlx-8bit
- Versión 4 bits: https://huggingface.co/netprojects/GLiDE-mlx-4bit
- Modelo base original: https://huggingface.co/fastino/GLiDE
- Repositorio del servidor MLX: https://github.com/internet-projects/glide-mlx
- NetProjects: https://netprojects.com
- Colección de builds MLX de NetProjects: https://huggingface.co/collections/netprojects/netprojects-mlx-builds-6ae3b2683a59a1b4fc4c0c3a
- Todos los modelos de NetProjects: https://huggingface.co/netprojects
