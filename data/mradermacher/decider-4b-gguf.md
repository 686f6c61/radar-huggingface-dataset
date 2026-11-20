# mradermacher/decider-4b-GGUF

## Resumen

Decider-4b es un modelo de decisión de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) desarrollado originalmente por Mapika y cuantizado a formato GGUF por mradermacher. El modelo está diseñado específicamente para tareas de decisión estructurada, con etiquetas que lo identifican como un modelo de "system-one", "one-pass", "calibrated", "multi-task" y con capacidades de visión. Su enfoque principal es producir salidas estructuradas y calibradas en una sola pasada, lo que lo diferencia de los modelos generativos de propósito general.

La relevancia de este modelo radica en su especialización: en lugar de ser un modelo conversacional generalista, está orientado a la toma de decisiones con salida estructurada y calibración de confianza. Esto lo hace potencialmente útil en pipelines donde se necesita clasificación, enrutamiento o decisiones automatizadas con scores de confianza fiables. El repositorio GGUF de mradermacher facilita su despliegue en entornos con llama.cpp y herramientas compatibles, con cuantizaciones que van desde 2,0 GB (Q2_K) hasta 8,5 GB (f16).

El modelo soporta únicamente inglés según la información disponible, tiene licencia Apache 2.0 y está construido sobre el modelo base Mapika/decider-4b. La cuantización fue realizada con la librería transformers y el repo tiene un tamaño total de 38,9 GB, incluyendo todas las variantes de cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base etiquetado como decision-model, system-one, one-pass) |
| Parámetros totales | 4.205.751.296 (~4,2 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado por mradermacher); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Mapika/decider-4b en la documentación proporcionada. Las etiquetas del modelo indican que se trata de un "decision-model" con enfoque "system-one" y "one-pass", lo que sugiere un diseño orientado a producir decisiones o clasificaciones en una única pasada de inferencia, en contraste con enfoques de razonamiento multi-paso (system-two). La etiqueta "calibrated" indica que el modelo produce probabilidades o scores de confianza calibrados, y "multi-task" sugiere que fue entrenado para múltiples tareas de decisión simultáneamente. También aparece la etiqueta "vision", lo que indica capacidades multimodales de imagen, aunque no se detalla su implementación.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal. La cuantización fue realizada por mradermacher con "quantize_version: 2" y "output_tensor_quantised: 1", usando conversión de tipo "hf". No hay cuantizaciones ponderadas/imatrix disponibles según la model card.

## Capacidades

- Toma de decisiones estructurada: el modelo está diseñado para producir salidas estructuradas y decisiones en una sola pasada ("one-pass", "system-one").
- Calibración de confianza: la etiqueta "calibrated" indica que las probabilidades o scores producidos están calibrados, lo que permite umbralizar decisiones con confianza fiable.
- Multi-tarea: entrenado para manejar múltiples tareas de decisión simultáneamente ("multi-task").
- Capacidades de visión: la etiqueta "vision" sugiere soporte de entrada de imágenes, aunque no se detalla el alcance.
- Salida estructurada: etiqueta "structured-output", orientada a formatos parseables (JSON u otros).
- Conversacional: el tag "conversational" indica que el modelo puede usarse en formato de conversación.
- Compatibilidad con endpoints: tag "endpoints_compatible".
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el enfoque declarado es "one-pass", no multi-step.
- Capacidades multilingües: limitadas a inglés ("en").
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Enrutamiento de consultas en sistemas de atención al cliente: el modelo puede clasificar y decidir a qué departamento o cola derivar cada consulta, aprovechando su calibración para establecer umbrales de confianza y derivar a revisión humana cuando el score sea bajo.
- Clasificación de tickets y triaje automatizado: con salida estructurada, puede asignar categorías, prioridades y etiquetas a tickets de soporte en una sola pasada, reduciendo la latencia frente a modelos generativos que requieren razonamiento extendido.
- Moderación de contenido con scores calibrados: la calibración permite fijar umbrales operativos para decidir si un contenido se bloquea, se revisa o se publica, con una interpretación directa de la probabilidad de cada clase.
- Extracción de decisiones en pipelines de datos: al producir salida estructurada, puede integrarse en pipelines ETL para decidir la clasificación o el destino de registros de forma determinista y parseable.
- Filtrado y priorización en sistemas de recomendación o alertas: el modelo puede decidir si un evento o ítem es relevante para un usuario o sistema, con confianza calibrada para gestionar falsos positivos.
- Tareas multimodales de decisión (si la capacidad de visión está operativa): clasificación o decisión sobre imágenes en una sola pasada, útil en inspección visual automatizada o triaje de contenido gráfico.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q4_K_S (2,7 GB) y Q4_K_M (2,8 GB) permiten ejecutar el modelo en GPUs de consumo o incluso CPU, adecuado para edge computing o servicios de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,0 GB (Q2_K), 2,7-2,8 GB (Q4_K_S/Q4_K_M, recomendados), 3,6 GB (Q6_K), 4,6 GB (Q8_0) y 8,5 GB (f16). Estas cifras corresponden al tamaño de los ficheros GGUF; la VRAM real necesaria incluye overhead del contexto y del runtime.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060/4060 o superiores para Q4-Q5; RTX 4090, A100 o H100 para f16 si se busca máxima calidad. El modelo cabe holgadamente en GPUs de consumo.
- Cabe en consumer GPU: sí, en la mayoría de GPUs modernas con 4 GB o más de VRAM usando cuantizaciones Q4 o superiores; también puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers. No se confirma soporte de vLLM o TGI para la versión GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la documentación proporcionada. El modelo se posiciona como un decision-model especializado de ~4,2 B parámetros con salida estructurada y calibrada, una categoría menos común que los modelos generativos de propósito general del mismo tamaño. No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas.

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| decider-4b (GGUF) | ~4,2 B | no disponible | Apache 2.0 | Decisión estructurada, calibrada, one-pass |
| Alternativas de ~4 B generativas | no disponible | no disponible | no disponible | Generación de propósito general |

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte de inglés ("en"), por lo que su uso en castellano u otros idiomas no está garantizado.
- Enfoque one-pass: al estar diseñado para decisiones en una sola pasada, no está orientado a razonamiento multi-paso ni a tareas que requieran cadenas de pensamiento largas.
- Sesgos: no se dispone de información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento.
- Riesgo de alucinación: no documentado; al ser un modelo de decisión con salida estructurada, el riesgo principal es la clasificación errónea con confianza alta, no la generación de texto libre.
- Calibración: aunque la etiqueta indica "calibrated", no se proporcionan métricas de calibración (ECE, Brier score) que permitan verificarla empíricamente.
- Capacidad de visión: la etiqueta "vision" aparece, pero no se documenta el alcance ni el formato de entrada de imagen; conviene validarla antes de usarla en producción.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Mapika/decider-4b por si hubiera restricciones adicionales no reflejadas en la información disponible.
- Cuantizaciones: no hay cuantizaciones ponderadas/imatrix disponibles; las cuantizaciones Q3_K_M están marcadas como "lower quality" y Q2_K como la de menor tamaño, con la consiguiente pérdida de calidad.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide garantizar su comportamiento en entradas largas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/decider-4b-GGUF
- Modelo base: https://huggingface.co/Mapika/decider-4b
- Página de descarga del cuantizador: https://hf.tst.eu/model#decider-4b-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico de comparación de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
