# sergolsub/mlx-drex-v1.5-9B

## Resumen

mlx-drex-v1.5-9B es la conversión a 8 bits en formato MLX de drex-v1.5, un modelo de decisión de 8.953.803.264 parámetros densos (unos 8,95B) desarrollado por Nace.AI y distribuido en este repositorio por el usuario sergolsub. No es un modelo generativo: no escribe texto, sino que recibe un estado y un conjunto de preguntas tipadas con opciones nombradas y devuelve una probabilidad para cada opción. Su función es puntuar y ordenar alternativas dentro de flujos de agentes y backends, no mantener una conversación.

Según la documentación del repositorio upstream, el modelo se construye sobre MiMo-V2.6-Distill-Qwen-9B e incorpora una cabeza pointer («Kev pointer head») que proyecta el estado sobre las opciones declaradas. La etiqueta de arquitectura del repositorio es `qwen3_5_text`, coherente con un backbone transformer de la familia Qwen 3.5 en su variante de texto. Nace.AI reporta 58,08 en el Decision Index público 0.3.1, lo que lo sitúa como el mejor modelo de menos de 10B parámetros en esa clasificación.

La relevancia de esta ficha concreta es práctica: permite ejecutar el modelo en Apple Silicon mediante `mlx_lm`, con pesos de 8 bits y unas cifras medidas por el autor de la conversión en un Mac mini M4 Pro de 48 GB (11,29 GB de memoria residente máxima y 431 ms de latencia mediana por decisión). Es un artefacto de terceros, no oficial, con solo 13 descargas y sin validación comunitaria amplia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con cabeza pointer de decisión; etiqueta de repositorio `qwen3_5_text`, derivada de MiMo-V2.6-Distill-Qwen-9B |
| Parámetros totales | 8.953.803.264 (8,95B, densos) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 8 bits MLX (única variante publicada en este repositorio) |
| Idiomas soportados | No disponible |
| Licencia | `nace-ai-open-rail-m-license-modified` (OpenRAIL-M modificada, heredada del upstream) |
| Formato de pesos | safetensors en layout MLX, 4 shards; incluye `config.json`, tokenizer, `chat_template.jinja`, `decision_config.json`, `joint_config.json` y scripts `*_mlx.py` |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 8,95B parámetros que no emplea decodificación autorregresiva para su tarea principal: la salida se produce mediante una cabeza pointer que asigna una probabilidad a cada opción declarada en la pregunta tipada. La entrada es un estado más un conjunto de preguntas nombradas y tipadas con sus opciones; la salida es una distribución de probabilidad sobre esas opciones. Según el repositorio upstream, el backbone procede de MiMo-V2.6-Distill-Qwen-9B, es decir, un modelo Qwen de 9B destilado a través de MiMo-V2.6, sobre el que se añade la cabeza de decisión.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones de inferencia como decodificación especulativa o atención lineal. La conversión aquí publicada es exclusivamente de cuantización a 8 bits para MLX: el autor indica explícitamente que no hay reentrenamiento ni cambios de arquitectura, y que la evaluación propia de calidad tras cuantizar da un 78,4% de accuracy tanto en 8 bits como en bf16, es decir, sin degradación apreciable en esa métrica.

## Capacidades

- Puntuación de opciones: devuelve una probabilidad por cada opción declarada en una pregunta tipada, sin generar texto libre.
- Decisiones sobre estado: acepta un estado (contexto estructurado) y múltiples preguntas nombradas en una misma petición.
- Cabezas de decisión y joint: el repositorio incluye `decision_config.json`, `joint_config.json` y código `*_mlx.py` para la glue de inferencia de decisión y de la cabeza conjunta.
- Integración en flujos de agentes: pensado para enrutado, selección y ranking dentro de pipelines multi-paso.
- Selección de herramientas: puede puntuar un conjunto finito de herramientas o acciones candidatas en lugar de emitir una llamada en texto.
- Generación de texto: no soportada (el modelo no escribe respuestas).
- Tool calling generativo: no disponible; la funcionalidad equivalente se obtiene por puntuación de opciones.
- Capacidades multilingües: no disponibles (no se documentan idiomas).
- Thinking mode, visión y audio: no disponibles.

## Casos de uso

- Enrutado de intenciones en agentes: se declara un estado con el turno del usuario y una pregunta tipada con las intenciones posibles; el modelo devuelve la probabilidad de cada una y el orquestador elige la de mayor score. La latencia medida de 431 ms por decisión encaja en un bucle de agente con varias decisiones por turno.
- Selección de herramientas en un pipeline de function calling: en lugar de pedir al LLM que escriba el nombre de la herramienta, se enumeran las herramientas disponibles como opciones y se puntúan, reduciendo errores de formato en producción.
- Ranking de respuestas candidatas en RAG: se generan N respuestas o N fragmentos y se puntúan como opciones para reordenar antes de mostrar; la evaluación en 8 bits conserva el 78,4% de accuracy respecto a bf16.
- Clasificación de tickets de soporte: se definen categorías y subcategorías como opciones tipadas y se obtiene una distribución de probabilidad, útil para umbrales de confianza y escalado a humano cuando la probabilidad máxima es baja.
- Moderación por categorías: puntuar un contenido frente a un conjunto cerrado de políticas permite aplicar umbrales calibrados por política, algo que un modelo generativo no ofrece de forma nativa.
- Decisiones de backend de baja latencia: con 5,69 decisiones cortas por segundo sostenidas en un Mac mini M4 Pro, puede absorber decisiones de negocio simples (aprobación, priorización, asignación de cola) sin depender de un LLM generativo.
- Evaluación A/B de variantes: puntuar varias formulaciones de una misma pregunta o instrucción para elegir la que maximiza la probabilidad de la opción objetivo.
- Validación de salidas de otros modelos: comprobar si una respuesta satisface un conjunto de criterios tipados (correcto, seguro, completo) antes de publicarla en un flujo automatizado.

## Benchmarks y rendimiento

| Benchmark | Versión | Resultado | Contexto de la medición |
|---|---|---|---|
| Decision Index | 0.3.1 | 58,08 | Modelo upstream drex-v1.5 (bf16); #1 en la categoría de menos de 10B según Nace.AI |
| Decision Index | 0.4.1 | 49,17 | Esta conversión MLX 8-bit, evaluación local del autor de la conversión |
| Accuracy (eval propia del conversor) | No disponible | 78,4% en 8 bits frente a 78,4% en bf16 | Medición del autor de la conversión |

Los dos valores de Decision Index corresponden a versiones distintas del índice (0.3.1 y 0.4.1) y por tanto no son directamente comparables entre sí. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generativos en la información disponible, y en la práctica no aplican porque el modelo no genera texto.

Rendimiento medido en Mac mini M4 Pro de 48 GB con MLX 8 bits: 10,47 GB en disco, 4,86 s de carga, 11,29 GB de memoria residente máxima, latencia mediana de decisión de 431 ms y 5,69 decisiones cortas por segundo en régimen sostenido.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: los pesos en 8 bits ocupan aproximadamente 9 GB; la medición real del autor da 11,29 GB de memoria residente máxima. En bf16, la estimación aritmética a partir de 8,95B parámetros es de unos 17,9 GB solo en pesos, más overhead (estimación, no medida publicada).
- GPU recomendadas: el repositorio es específicamente MLX, por lo que el hardware objetivo es Apple Silicon (serie M). No se documentan GPU NVIDIA o AMD para estos pesos concretos.
- Cabe en consumer GPU: los pesos MLX no están pensados para GPU de consumo x86. Para CUDA habría que usar el modelo upstream bf16 con el fork de llama.cpp u Ollama (rama `drex-v1.5`), no esta conversión.
- Opciones de despliegue: `mlx_lm` (librería declarada del repositorio). Para el modelo original, el proyecto upstream publica forks de llama.cpp y de Ollama en la rama `drex-v1.5`.
- Latencia y throughput: 431 ms de mediana por decisión y 5,69 decisiones cortas por segundo en un M4 Pro de 48 GB; el tiempo de carga es de 4,86 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| drex-v1.5 (bf16, upstream) | 8,95B densos | No disponible | 58,08 (índice 0.3.1) | OpenRAIL-M modificada | HuggingFace, nace-ai/drex-v1.5 |
| mlx-drex-v1.5-9B (esta ficha) | 8,95B densos | No disponible | 49,17 (índice 0.4.1, eval local del conversor) | OpenRAIL-M modificada | HuggingFace, sergolsub; solo MLX |
| Modelos generativos de ~8-9B | ~8-9B | No disponible | No aplica | Diversas | Amplia |

No se dispone de información sobre otros modelos de decisión de menos de 10B parámetros que puedan servir de comparación directa; en la información consultada solo aparece drex-v1.5 como referencia de la misma categoría. Los modelos generativos de tamaño similar no son funcionalmente equivalentes: producen texto y no devuelven distribuciones de probabilidad calibradas sobre opciones cerradas, por lo que la comparación de benchmarks no sería homogénea.

## Limitaciones y advertencias

- El modelo no genera texto: cualquier caso de uso que requiera respuestas en lenguaje natural necesita un modelo generativo adicional que produzca las opciones que este modelo puntúa.
- Las preguntas deben ser tipadas y con opciones nombradas; no acepta entrada libre en formato conversacional.
- Discrepancia de métricas: el 58,08 del upstream corresponde al Decision Index 0.3.1 y el 49,17 de esta conversión al índice 0.4.1. No deben presentarse como una caída de calidad equivalente sin una evaluación en la misma versión del índice.
- La evaluación de calidad (78,4% de accuracy en 8 bits y en bf16) es una medición propia del autor de la conversión, sin protocolo público detallado.
- Solo disponible en formato MLX de 8 bits: no hay GGUF, no hay otras precisiones y no está pensado para GPU NVIDIA.
- Artefacto de terceros: el repositorio lo publica el usuario sergolsub, no Nace.AI, con 13 descargas y 0 likes; no hay validación independiente de la conversión más allá de los checksums SHA-256 publicados.
- En la tabla de checksums de la model card solo aparecen tres de los cuatro shards anunciados (`model-00004-of-00004.safetensors` no figura), por lo que conviene verificar la integridad de ese fichero tras la descarga.
- Licencia OpenRAIL-M modificada: permite uso comercial pero incorpora restricciones de uso basadas en el uso; en caso de conflicto prevalece la licencia del repositorio upstream. Es obligatorio revisar el fichero LICENSE antes de desplegar en producción.
- No se documentan idiomas soportados, sesgos conocidos del backbone ni comportamiento de calibración de las probabilidades en dominios alejados de los datos de entrenamiento.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de sobreconfianza: una probabilidad alta sobre una opción no garantiza que sea correcta si el estado de entrada está fuera de distribución.
- No hay información sobre longitud de contexto, lo que impide planificar decisiones que dependan de estados largos.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/sergolsub/mlx-drex-v1.5-9B
- Modelo original en HuggingFace: https://huggingface.co/nace-ai/drex-v1.5
- Repositorio GitHub del proyecto de modelos de decisión: https://github.com/nace-ai/drex-decision-models/blob/main/models/drex-v1.5/README.md
- Artículo de MarkTechPost: https://www.marktechpost.com/2026/10/09/nace-ai-open-sources-drex-1-5-a-9b-decision-model-that-scores-options-not-text/
- Artículo de AI Tech Model: https://aitechmodel.com/nace-ai-open-sources-drex-1-5-a-9b-decision-model-for-ranking-options/
- Análisis en Shattered: https://shattered.io/nace-ai-drex-1-5-9b-decision-model-2026/
