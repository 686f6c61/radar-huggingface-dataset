# orucexe/kev-az

## Resumen

Kev-AZ es un modelo de decisión compacto para azerbaiyano, publicado por el usuario orucexe en Hugging Face. No es un modelo generativo al uso: recibe un estado textual (por ejemplo, un mensaje de un cliente) y una pregunta con un conjunto cerrado de respuestas posibles, y devuelve una distribución de probabilidad sobre cada opción. Se construye como un ajuste fino (LoRA más una cabeza de decisión Kev) sobre el backbone Qwen3.5 de 0,8B de parámetros, identificado en el repositorio base como `jaredpalmer/kev-0.8b`.

El modelo aborda un problema muy concreto: convertir un LLM pequeño en un clasificador probabilístico fiable para tareas de enrutamiento, verificación de afirmaciones y puntuación ordinal en azerbaiyano, un idioma con poca representación en los modelos abiertos. El repositorio solo contiene el adaptador LoRA y la cabeza de decisión (0,1 GB), no los pesos completos; el runtime de Kev carga estos artefactos sobre el backbone Qwen3.5 fijado.

La relevancia actual es doble: por un lado, demuestra que un modelo de 0,8B puede competir e incluso superar en decisiones ordinales a modelos de 4,5B en un benchmark específico de azerbaiyano; por otro, es una publicación explícitamente experimental, con intervalos de confianza que en algunos casos cruzan cero, por lo que debe tratarse como prototipo de investigación y no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (backbone Qwen3.5) con adaptador LoRA y cabeza de decisión Kev |
| Parametros totales | 0,8B (backbone Qwen3.5); el repositorio solo contiene el adaptador LoRA y la cabeza |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | azerbaiyano (az) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA y cabeza de decisión) |

## Arquitectura y entrenamiento

Kev-AZ se apoya en un transformer decoder-only Qwen3.5 de 0,8B de parámetros como backbone congelado o parcialmente ajustado, sobre el que se aplica un adaptador LoRA y una cabeza de decisión específica del framework Kev. La cabeza transforma los estados ocultos en distribuciones de probabilidad sobre opciones nombradas, con tres modos de decisión: `choice` (probabilidades sobre opciones con nombre), `noul` (probabilidades para sí y no) y `score` (probabilidades sobre niveles ordenados).

El ajuste fino se realizó sobre 49.200 registros del split de entrenamiento del dataset `orucexe/azerbaijani-decision`, lo que representa el 40,3% de los 121.965 registros de dicho split. Los registros se repartieron en dos ejecuciones: 27.037 en la ejecución inicial y 22.163 en una ejecución de continuación, con identificadores distintos entre ambos subconjuntos. No se documentan en la información disponible detalles sobre volumen de tokens, composición exacta del corpus, ni si se aplicaron técnicas de RLHF o DPO. El benchmark de evaluación se reservó del split de validación y se filtró contra duplicados exactos y casi duplicados del conjunto de ajuste.

## Capacidades

- Clasificación probabilística de texto en azerbaiyano mediante tres tipos de decisión: elección entre opciones (`choice`), sí/no (`noul`) y puntuación ordinal (`score`).
- Enrutamiento de mensajes o consultas a categorías predefinidas con distribución de probabilidad asociada.
- Verificación de afirmaciones contra un pasaje de texto (soporte sí/no).
- Puntuación de peticiones según escalas ordenadas definidas por el usuario (por ejemplo, urgencia).
- Salida interpretable: el endpoint devuelve la opción seleccionada y la distribución completa bajo `answers.<pregunta>`.
- Despliegue local con runtime propio (`kev.serve`) sobre CPU o GPU, con backbone Qwen3.5 fijado por versión.
- No se documentan capacidades de generación libre de texto, tool calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Enrutamiento de atención al cliente: el modelo recibe el mensaje del usuario y una pregunta con las categorías disponibles (por ejemplo, `delivery`, `billing`, `access`) y devuelve la probabilidad de cada departamento; el sistema puede asignar la categoría de mayor probabilidad o derivar a revisión humana si la distribución es plana.
- Verificación de respuestas en un sistema RAG: dado un pasaje recuperado y una afirmación generada, el modo `noul` estima la probabilidad de que el pasaje soporte la afirmación, útil como filtro de alucinaciones antes de mostrar la respuesta.
- Triaje de urgencia: con el modo `score`, se puntúa una solicitud sobre una escala ordinal definida (por ejemplo, baja, media, alta, crítica), lo que permite priorizar colas de soporte o incidencias.
- Moderación y clasificación de contenido en azerbaiyano: clasificación de textos en categorías cerradas de política, aprovechando que el modelo está ajustado específicamente en este idioma y no depende de un modelo multilingüe grande.
- Etiquetado asistido de datos: uso del modelo para preetiquetar grandes volúmenes de texto azerbaiyano con probabilidades, que luego se revisan y corrigen para entrenar clasificadores posteriores.
- Investigación en modelos de decisión de bajo coste: al ejecutarse en CPU con un backbone de 0,8B, sirve como banco de pruebas para comparar cabezas de decisión y adaptadores LoRA sin infraestructura GPU dedicada.
- Automatización de encuestas o formularios: conversión de respuestas abiertas en azerbaiyano a opciones cerradas con una medida de confianza explícita.

## Benchmarks y rendimiento

Resultados publicados por el autor en el benchmark de decisión en azerbaiyano (554 registros, una pregunta por registro, misma selección y orden de opciones para todos los modelos):

| Modelo | Parámetros | Choice (200) | Sí/No (200) | Score ordinal (154) | Global (554) |
|---|---:|---:|---:|---:|---:|
| **Kev-AZ** | **0,8B** | 59,50% | 62,00% | **57,14%** | **59,75%** |
| THX-02 | 4,54B | **66,00%** | **69,50%** | 32,47% | 57,94% |
| Perplexity Decider Flash | 4,54B | 65,00% | 68,50% | 34,42% | 57,76% |
| Kev-4B | 4B | 61,50% | 65,00% | 30,52% | 54,15% |
| Strands Decider 2B | 2B | 56,00% | 64,50% | 31,82% | 52,35% |
| Mapika Decider 2B | 1,88B | 55,00% | 60,50% | 29,22% | 49,82% |
| THX-01 | 322M | 38,50% | 54,50% | 16,88% | 38,27% |
| Laya Multilingual | 322M | 38,00% | 52,00% | 13,64% | 36,28% |

Kev-AZ obtiene un 59,75% de precisión global (331/554) y un 57,14% en decisiones ordinales (88/154), 22,73 puntos porcentuales por encima del siguiente modelo en esa categoría. La ventaja global sobre THX-02 es de 1,81 puntos, con un intervalo de confianza bootstrap pareado del 95% que incluye el cero (−3,61 a +7,22 puntos). La ventaja ordinal sobre Perplexity Decider Flash tiene un intervalo pareado de +12,34 a +32,47 puntos. THX-02 lidera en elección y sí/no.

## Requisitos de hardware

- El repositorio descargable ocupa 0,1 GB (adaptador LoRA y cabeza); el backbone Qwen3.5 de 0,8B se descarga aparte en la primera ejecución.
- Inferencia en CPU documentada por el autor: `python -m kev.serve --run /path/to/kev-az --device cpu --port 8009`.
- VRAM estimada para GPU: no disponible en la información proporcionada; por el tamaño del backbone (0,8B) cabría esperar un consumo moderado, pero no se publican cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la documentación; el único modo de ejecución documentado es CPU.
- Opciones de despliegue: runtime Kev (`kev.serve`, instalado con `uv sync --extra serve`, Python 3.12 o 3.13, commit fijado `65b1e76`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Global benchmark | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Kev-AZ | 0,8B | no disponible | 59,75% | Apache 2.0 | Hugging Face (adaptador + cabeza) |
| THX-02 | 4,54B | no disponible | 57,94% | no disponible | referenciado en el benchmark del autor |
| Perplexity Decider Flash | 4,54B | no disponible | 57,76% | no disponible | referenciado en el benchmark del autor |
| Kev-4B | 4B | no disponible | 54,15% | no disponible | referenciado en el benchmark del autor |
| Strands Decider 2B | 2B | no disponible | 52,35% | no disponible | referenciado en el benchmark del autor |

La comparación se limita a los modelos incluidos por el autor en su benchmark; no se dispone de datos independientes de contexto, licencia o disponibilidad para los competidores.

## Limitaciones y advertencias

- Publicación explícitamente experimental: el autor recomienda validar el modelo con datos propios antes de usarlo en producción.
- La ventaja global sobre THX-02 (1,81 puntos) tiene un intervalo de confianza del 95% que incluye cero, por lo que la superioridad global no es estadísticamente concluyente.
- El benchmark se compone de 554 registros de un único dataset; las familias de origen del corpus de ajuste están representadas en el conjunto de prueba y se incluyen adaptaciones azerbaiyanas de datasets upstream, lo que puede inflar los resultados.
- El conocimiento sobre la exposición del backbone a datos de preentrenamiento y sobre los datos de entrenamiento de los modelos comparados es incompleto.
- Solo soporta azerbaiyano; no hay evidencia de rendimiento en otros idiomas.
- No es un modelo generativo: no produce texto libre, no soporta tool calling ni razonamiento multi-paso.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de calibración deficiente de las probabilidades; no se publican métricas de calibración (ECE, Brier).
- Sesgos conocidos: no documentados.
- Licencia Apache 2.0 permite uso comercial, pero al depender del backbone Qwen3.5 conviene verificar la licencia de dicho backbone antes de desplegar.
- El repositorio no incluye los pesos completos; requiere el runtime Kev y una versión fijada del backbone, lo que añade dependencia operativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/orucexe/kev-az
- Modelo base Kev-0.8B: https://huggingface.co/jaredpalmer/kev-0.8b
- Backbone Qwen3.5-0.8B-Base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Runtime Kev: https://github.com/jaredpalmer/kev
- Dataset de entrenamiento: https://huggingface.co/datasets/orucexe/azerbaijani-decision
- Manifiesto de evaluación: benchmark/manifest.json (en el repositorio del modelo)
- Desglose de puntuaciones: benchmark/scores.csv (en el repositorio del modelo)
