# mlx-community/d1-2B-OptiQ-4bit

## Resumen

d1-2B-OptiQ-4bit es una cuantización mixta de 4 bits, en formato MLX, del modelo LiquidAI/d1-2B de Liquid AI. d1 es un "modelo de decisión" construido sobre LFM3-VL-2B que no genera texto libre: responde preguntas tipadas y con nombre sobre un estado dado (sí/no, elección entre opciones, puntuación) devolviendo una probabilidad para cada opción en un único forward pass, sin tokens generados. Esta variante la publica mlx-community usando el toolkit mlx-optiq, orientado a inferencia local nativa en Apple Silicon sin PyTorch ni nube.

El modelo resuelve el problema de la clasificación y calibración estructurada: en lugar de pedir a un LLM que escriba una respuesta y parsearla después, d1 lee cada respuesta directamente del modelo de lenguaje en su "slot" de respuesta, tras un prompt en el que el estado y las preguntas se condicionan mutuamente en ambos sentidos. Con 1.728.801.536 parámetros reales (aproximadamente 1,7 B) y un repositorio de 1,7 GB, se posiciona como una alternativa más fiel al original que la cuantización uniforme de 4 bits de Liquid, a costa de un 25 % más de espacio en disco.

Su relevancia actual está en el nicho de los "system-one" o decisiones de sistema 1: enrutamiento de tickets, extracción de señales booleanas, puntuaciones de urgencia y clasificación calibrada con latencias de milisegundos. La model card reporta 0,27 s de latencia mediana por caso (cinco preguntas en una sola petición) en un Apple M3 Max.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3-VL (transformer multimodal con torre de visión), adaptada como modelo de decisión; cuantización mixta OptiQ de 4 bits en MLX |
| Parametros totales | 1.728.801.536 (aproximadamente 1,7 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits mixta (mixed-precision OptiQ); la torre de visión se incluye en bf16 en `optiq_vision.safetensors` |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (licencia "other" en Hugging Face) |
| Formato de pesos | safetensors (MLX); requiere mlx-optiq 0.7.9 o superior |

## Arquitectura y entrenamiento

El modelo base, LiquidAI/d1-2B, es un modelo de decisión derivado de LFM3-VL-2B. No dispone de una cabeza separada de clasificación: cada respuesta se lee del propio modelo de lenguaje en la posición de su slot de respuesta, después de un prompt en el que el estado y las preguntas se leen mutuamente en ambas direcciones. El resultado es un conjunto de probabilidades por opción obtenido en un solo forward pass, sin decodificación autoregresiva y con `output_tokens: 0`. La variante que nos ocupa aplica cuantización mixta de 4 bits con el toolkit mlx-optiq, que preserva las capas sensibles en mayor precisión; la torre de visión se mantiene en bf16.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La model card sí indica que el repositorio incluye el prompt y el código de calibración propios de Liquid, de modo que el modelo ve exactamente el formato con el que fue entrenado. La evaluación se realiza sobre el split de test completo de 400 casos (2.000 decisiones) del dataset LocalLLaMA/typed-decisions, en modo zero-shot y con una petición por caso que agrupa las cinco preguntas.

## Capacidades

- Decisiones tipadas: preguntas de tipo sí/no (`noul`), elección (`choice`, incluida la variante `"multiple": true`), puntuación (`score`) y estimación (`estimate`), cada una con su distribución de probabilidad sobre las opciones.
- Clasificación calibrada: devuelve probabilidades por opción, lo que permite umbrales y análisis de incertidumbre (métricas KL, Brier y ECE reportadas).
- Estados en texto plano y en JSON.
- Inferencia sin generación de tokens: una sola pasada forward por petición.
- Servicio HTTP mediante `optiq serve` con el endpoint `POST /v1/systemone`, y API de Python (`optiq.decision.D1`).
- Lectura de spans del estado (texto, número, fecha): no soportada todavía.
- Imágenes y vídeo: no soportados todavía; la torre de visión se distribuye en bf16 para cuando se habiliten.
- Tool calling, agentes, razonamiento multi-paso y capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Enrutamiento de tickets de soporte: con una pregunta `choice` cuyos criterios sean los equipos disponibles (por ejemplo, facturación frente a envíos), el modelo devuelve la probabilidad de cada equipo en una sola pasada, lo que permite umbrales de confianza y derivación a revisión humana cuando la distribución es ambigua.
- Detección de intención de reembolso o cancelación: una pregunta `noul` sobre el estado del mensaje del cliente produce una probabilidad calibrada que puede alimentar reglas de negocio o flujos de aprobación automática.
- Puntuación de urgencia: con una pregunta `score` de criterios ordenados (baja, media, alta), se obtiene una distribución sobre los niveles que sirve para priorizar colas de atención sin generar texto.
- Moderación y señales booleanas sobre contenido: preguntas `noul` encadenadas sobre un mismo estado (por ejemplo, si contiene datos personales, si es spam, si es una queja) agrupadas en una sola petición para amortizar latencia.
- Extracción de decisiones estructuradas desde JSON: al aceptar estados en JSON, encaja en pipelines que ya tienen el evento serializado y necesitan etiquetas tipadas y calibradas antes de persistirlo.
- Clasificación por lotes en local sobre Apple Silicon: con 1,7 GB de pesos y 0,27 s por caso en un M3 Max, es viable procesar colas de casos en un portátil o en un Mac mini sin depender de la nube, útil por privacidad de datos.
- Enrutamiento previo a un LLM generativo: usar d1 como "system-one" para decidir si un caso requiere un modelo grande, eligiendo la ruta con una pregunta `choice` y reservando el modelo generativo para los casos de baja confianza.

## Benchmarks y rendimiento

Evaluación sobre el split de test completo de LocalLLaMA/typed-decisions (400 casos, 2.000 decisiones), zero-shot, una petición por caso con las cinco preguntas:

| Modelo | Tamano | Accuracy | KL desde gold (menor mejor) | Brier (menor mejor) | ECE (menor mejor) |
|---|---:|---:|---:|---:|---:|
| LiquidAI/d1-2B (runner de Liquid, float32) | 3,8 GB | 0,637 | 0,2817 | 0,1370 | 0,1244 |
| **Este modelo (OptiQ-4bit)** | 1,7 GB | **0,641** | **0,2834** | **0,1386** | **0,1262** |
| LiquidAI/d1-2B-MLX-4bit | 1,35 GB | 0,6265 | 0,2905 | 0,1431 | 0,1304 |

Desviación respecto al original sobre las mismas 2.000 decisiones:

| Metrica | Este modelo | LiquidAI/d1-2B-MLX-4bit |
|---|---:|---:|
| KL media desde el original (menor mejor) | 0,011 | 0,025 |
| Respuestas cambiadas (menor mejor) | 8,2 % | 11,3 % |
| Mayor desplazamiento de probabilidad (menor mejor) | 0,27 | 0,37 |

Latencia mediana reportada: 0,27 s por caso (cinco preguntas en una petición) en un Apple M3 Max.

## Requisitos de hardware

- Inferencia sobre Apple Silicon con MLX; requiere mlx-optiq 0.7.9 o superior.
- Espacio en disco: 1,7 GB para los pesos cuantizados; la torre de visión en bf16 se distribuye en `optiq_vision.safetensors`.
- VRAM/memoria unificada: no se publica una cifra explícita; con 1,7 GB de pesos, el modelo cabe holgadamente en la memoria unificada de cualquier Mac con Apple Silicon.
- GPU recomendadas: no disponible para CUDA; el formato MLX está pensado para Apple Silicon. No se documenta compatibilidad con A100, H100 ni RTX 4090.
- Despliegue: `optiq serve` (servidor HTTP con endpoint `/v1/systemone`) y API de Python `optiq.decision.D1`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 0,27 s por caso (cinco preguntas) en Apple M3 Max. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | Accuracy (typed-decisions) | KL desde el original | Licencia | Formato |
|---|---:|---:|---:|---:|---|---|
| **d1-2B-OptiQ-4bit** | 1,7 B | 1,7 GB | 0,641 | 0,011 | lfm1.0 | MLX safetensors |
| LiquidAI/d1-2B (float32) | 1,7 B | 3,8 GB | 0,637 | referencia | lfm1.0 | safetensors |
| LiquidAI/d1-2B-MLX-4bit | 1,7 B | 1,35 GB | 0,6265 | 0,025 | lfm1.0 | MLX safetensors |

No se dispone de comparación con modelos de clasificación de propósito general de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- No soporta todavía la lectura de spans del estado (texto, número, fecha), ni imágenes o vídeo, pese a incluir la torre de visión en bf16.
- El modelo no genera texto: solo responde preguntas tipadas con distribuciones de probabilidad; no es apto para generación libre, código, matemáticas ni razonamiento multi-paso.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe.
- Longitud de contexto no documentada; estados muy largos podrían exceder la ventana del modelo base.
- Licencia lfm1.0: es necesario revisar sus términos antes de un uso comercial; la model card no detalla restricciones adicionales.
- Riesgo de calibración degradada fuera de la distribución de typed-decisions: las métricas ECE y Brier reportadas corresponden a ese benchmark concreto.
- Sesgos del modelo base no documentados en la información disponible.
- Dependencia de la versión de mlx-optiq (0.7.9 o superior) y del código de prompt y calibración incluido en el repositorio; alterar el prompt cambia las probabilidades.
- El repositorio registra 38 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy temprana y poca validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlx-community/d1-2B-OptiQ-4bit
- Modelo base: https://huggingface.co/LiquidAI/d1-2B
- Cuantización uniforme de Liquid: https://huggingface.co/LiquidAI/d1-2B-MLX-4bit
- Dataset de evaluación: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Web del proyecto mlx-optiq: https://mlx-optiq.com/
- Catálogo de cuantizaciones OptiQ: https://mlx-optiq.com/models
- Documentación: https://mlx-optiq.com/docs/
- PyPI: https://pypi.org/project/mlx-optiq/
- Licencia: LICENSE (en el repositorio de Hugging Face)
