# AbstractFramework/kev-0.8b-mlx-8bit

## Resumen

Kev-0.8b-mlx-8bit es una cuantización de 8 bits (group 64) del modelo de decisión jaredpalmer/kev-0.8b, publicada por AbstractFramework para su uso con la librería mlx-lm en hardware Apple Silicon. No es un modelo generativo al uso: lee un documento (el *estado*) y responde preguntas tipadas sobre él —`choice` sobre opciones nombradas, `noul` (probabilidad de que una afirmación sea cierta) y `score` sobre niveles ordenados— devolviendo probabilidades calibradas en un único forward pass, sin generar texto.

El modelo subyacente es un Qwen3.5 base (Alibaba, Apache-2.0) al que Jared Palmer aplicó un LoRA de rango 16 y una cabeza *pointer*; esta versión pliega el adaptador en el backbone y cuantiza el tronco a 8 bits, manteniendo la cabeza en float32. El resultado es un checkpoint de 752.393.024 parámetros y 0,8 GB de repositorio, orientado a clasificación de texto y toma de decisiones estructurada.

Su relevancia práctica está en el coste: sustituye pipelines de clasificación con LLM generativo por una pasada única con latencia de 24 ms por registro en un M5 Max y una calibración medida (ECE 0,025), lo que lo hace viable para enrutado y triaje en tiempo real sobre hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 base con LoRA rango 16 plegado y cabeza pointer |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit group 64 (backbone); cabeza en float32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), head.safetensors, decision.json |

## Arquitectura y entrenamiento

El modelo parte de una base Qwen3.5 sobre la que se aplica un adaptador LoRA de rango 16 junto con una cabeza *pointer* que produce directamente distribuciones sobre opciones, probabilidades de verdad y puntuaciones ordinales. En esta versión de AbstractFramework el adaptador está fusionado en el backbone y el tronco se cuantiza a 8 bits con grupo de 64, dejando la cabeza en float32 para preservar la calibración de las probabilidades. El fichero `decision.json` documenta la receta de conversión y el checkpoint de origen.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en el modelo base. La conversión se realizó con `python -m abstractcore.decision.convert`. La innovación destacable es el paradigma de decisión: en lugar de decodificación autoregresiva, una sola pasada produce respuestas tipadas con probabilidades calibradas, lo que elimina la latencia de generación y el riesgo de formato inválido en la salida.

## Capacidades

- Clasificación por elección (`choice`) entre opciones nombradas con criterios definidos por el usuario.
- Estimación de probabilidad de verdad (`noul`) para afirmaciones sobre el documento de entrada.
- Puntuación ordinal (`score`) sobre niveles ordenados, como escalas de frustración o severidad.
- Salida de probabilidades calibradas en un único forward pass, sin generación de texto.
- Soporte de múltiples preguntas simultáneas sobre el mismo estado en una sola llamada.
- Integración con la librería AbstractCore vía API Python (`create_llm`) y servidor HTTP (`POST /v1/decisions`).
- No soporta tool calling, agentes multi-paso ni generación de código o matemáticas: es un modelo de decisión, no un LLM conversacional.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Triaje de tickets de soporte: clasificar cada mensaje entrante en departamentos (returns, shipping, billing) mediante `choice` con criterios textuales, en una sola pasada y con latencia de milisegundos por registro.
- Detección de escalado urgente: usar `noul` para estimar la probabilidad de que un caso requiera atención humana inmediata y enrutar por umbral de probabilidad calibrada.
- Medición de sentimiento ordinal: aplicar `score` sobre niveles como "Calm", "Frustrated", "Very angry" para priorizar colas de atención según la frustración del cliente.
- Moderación y clasificación de contenido: evaluar documentos contra criterios definidos y obtener distribuciones calibradas en lugar de etiquetas rígidas, útil para umbrales ajustables en producción.
- Enrutado en pipelines RAG: decidir qué subconjunto de preguntas tipadas aplicar a cada documento antes de invocar un LLM generativo, reduciendo coste y latencia.
- Anotación asistida de datasets: generar etiquetas con probabilidad asociada (Brier 0,321) para preetiquetar grandes volúmenes y reservar la revisión humana a los casos de baja confianza.
- Inferencia local en portátiles Apple Silicon: desplegar clasificación calibrada en un Mac con 0,8 GB de pesos, sin GPU dedicada ni servicios en la nube.

## Benchmarks y rendimiento

Evaluación sobre el conjunto de desarrollo public-pool-v6 (1.328 registros):

| Metrica | Valor |
|---|---|
| Exactitud (8-bit) | 0,761 |
| Exactitud (bf16) | 0,763 |
| Brier score | 0,321 |
| ECE (error de calibración esperado) | 0,025 |
| Acuerdo de argmax con bf16 | 0,990 |
| Diferencia media absoluta de probabilidad | 0,006 |
| Latencia por registro | 24 ms en M5 Max |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; el modelo no está orientado a esas tareas.

## Requisitos de hardware

- VRAM/peso en disco: 0,8 GB para los pesos cuantizados a 8 bits; la cabeza en float32 añade un consumo marginal.
- Hardware objetivo: Apple Silicon con MLX (medido en M5 Max); no está pensado para CUDA.
- Cabe holgadamente en cualquier Mac con memoria unificada de 8 GB o superior.
- Despliegue: librería mlx-lm y AbstractCore (`create_llm("mlx", ...)`), o servidor HTTP de AbstractCore con el endpoint `/v1/decisions`.
- No compatible con vLLM, TGI ni llama.cpp en esta variante MLX.
- Throughput estimado: aproximadamente 41 registros por segundo por núcleo de ejecución según la latencia medida de 24 ms por registro en M5 Max.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| kev-0.8b-mlx-8bit | 752 M | no disponible | Decisión tipada, 1 pasada | Apache-2.0 | MLX safetensors |
| jaredpalmer/kev-0.8b (bf16) | 752 M | no disponible | Decisión tipada, 1 pasada | Apache-2.0 | safetensors |
| Qwen3.5 base (0.8B) | ~0,8 B | no disponible | Generación autoregresiva | Apache-2.0 | safetensors |

Frente al checkpoint bf16 original, esta versión reduce el peso a 0,8 GB con una pérdida de exactitud de 0,002 puntos y un acuerdo de argmax del 99 %. Frente a un LLM generativo del mismo tamaño, sustituye la decodificación por una pasada única con salida calibrada, a costa de perder capacidades generativas y de razonamiento abierto. No se dispone de comparativas con clasificadores dedicados (BERT, DeBERTa) en la información proporcionada.

## Limitaciones y advertencias

- Modelo de decisión, no generativo: no produce texto libre, código ni razonamiento multi-paso.
- Sin datos publicados sobre sesgos, composición del dataset de entrenamiento ni cobertura idiomática; el comportamiento fuera del dominio de entrenamiento es incierto.
- Riesgo de calibración degradada en distribuciones distintas a public-pool-v6; el ECE de 0,025 está medido solo en ese conjunto de desarrollo.
- La cuantización introduce una desviación media de probabilidad de 0,006 y un 1 % de desacuerdos de argmax respecto a bf16, relevante en umbrales de decisión ajustados.
- Dependencia exclusiva del ecosistema MLX y Apple Silicon; no hay ruta de despliegue en CUDA con esta variante.
- Licencia Apache-2.0 permisiva para uso comercial, pero las atribuciones a jaredpalmer/kev-0.8b y Qwen/Qwen3.5 deben conservarse.
- Repositorio sin descargas ni validación comunitaria en el momento de la consulta; tratar como artefacto reciente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AbstractFramework/kev-0.8b-mlx-8bit
- Modelo base: https://huggingface.co/jaredpalmer/kev-0.8b
- Documentación de modelos de decisión de AbstractCore: https://github.com/lpalbou/AbstractCore/blob/main/docs/decision-models.md
- Repositorio AbstractCore: https://github.com/lpalbou/AbstractCore
- mlx-lm: https://github.com/ml-explore/mlx-lm
