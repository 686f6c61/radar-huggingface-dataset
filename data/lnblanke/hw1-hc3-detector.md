# lnblanke/hw1-hc3-detector

## Resumen

`lnblanke/hw1-hc3-detector` es un modelo de clasificación de texto publicado en HuggingFace por el usuario lnblanke. Se distribuye en formato transformers/safetensors, con 22.713.986 parámetros y un tamaño de repositorio de 0,1 GB. Está etiquetado como `text-classification` y su nombre sugiere una tarea de detección (detector) sobre el conjunto de datos HC3, aunque esta correspondencia no está confirmada en la información disponible. La model card está generada automáticamente por la plantilla de HuggingFace y todos sus campos relevantes aparecen como "[More Information Needed]".

No se ha publicado información sobre el desarrollador, los datos de entrenamiento, los idiomas soportados ni la licencia. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y las fechas de creación y actualización son del 27 de septiembre de 2026, con apenas cinco segundos de diferencia, lo que indica una subida única sin mantenimiento posterior.

La relevancia de este modelo es limitada desde el punto de vista de producción: se trata de un artefacto pequeño, probablemente ligado a un ejercicio académico (la búsqueda revela al menos cuatro repositorios con el mismo nombre exacto en cuentas distintas: HongjiP, zzhy2580, Yihangsun y jacobwu123). Aun así, puede resultar útil como referencia para entender el flujo de trabajo de fine-tuning de un clasificador BERT compacto sobre corpus de texto humano vs. generado por IA, y como modelo de partida muy ligero para tareas de clasificación binaria sobre CPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la documentación; el recuento de parámetros (22.713.986) es compatible con una configuración tipo BERT compacta (6 capas, dimensión oculta 384, 6 cabezas, intermedio 1536) más una cabeza de clasificación binaria. Dato derivado, no confirmado por el autor |
| Parámetros totales | 22.713.986 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (las configuraciones BERT estándar trabajan con 512 tokens; no confirmado para este modelo) |
| Tipos de cuantización | no disponible (solo se publican pesos safetensors sin versiones cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Librería | transformers |
| Pipeline | text-classification |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-27T22:25:16Z |
| Fecha de actualización | 2026-09-27T22:25:21Z |

## Arquitectura y entrenamiento

La información publicada no describe la arquitectura. La model card es la plantilla automática de HuggingFace y no contiene ninguna sección cumplimentada. A partir del recuento real de parámetros en safetensors (22.713.986) se puede deducir que se trata de un transformer encoder de tipo BERT reducido: una configuración de 6 capas, dimensión oculta 384, 6 cabezas de atención e intermedio 1536 arroja exactamente 22.713.216 parámetros, a los que se suman 770 parámetros de una cabeza de clasificación de dos etiquetas (384 × 2 + 2). Esta deducción es coherente con el tamaño del repositorio y con el pipeline declarado, pero no está verificada por el autor.

Tampoco hay información sobre los datos de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO (poco habituales en un clasificador de este tamaño). El nombre del modelo contiene "hc3", lo que apunta al conjunto de datos HC3 (Human ChatGPT Comparison Corpus), un corpus bilingüe inglés/chino de preguntas con respuestas humanas y respuestas de ChatGPT; el repositorio de GitHub encontrado en la búsqueda, centrado en experimentos de detección de texto IA con HC3, refuerza esa hipótesis. Si esa correspondencia es correcta, el modelo sería un detector binario de texto humano frente a texto generado por ChatGPT. Se trata, en cualquier caso, de una inferencia no confirmada.

## Capacidades

- Clasificación de texto: produce una etiqueta por secuencia de entrada mediante el pipeline `text-classification`. La tarea concreta (por ejemplo, humano vs. IA) no está documentada.
- Cabeza de clasificación binaria: la diferencia entre el recuento de parámetros del encoder y el total publicado (770 parámetros) corresponde exactamente a una capa lineal de dos salidas, lo que sugiere una decisión binaria, aunque el mapeo de etiquetas no está especificado.
- Inferencia ligera: con 22,7 millones de parámetros, el modelo cabe en memoria muy reducida y puede ejecutarse en CPU.
- Compatibilidad con despliegue gestionado: la metadata incluye las etiquetas `endpoints_compatible` y `text-embeddings-inference`, lo que indica que el repositorio es desplegable mediante Text Embeddings Inference de HuggingFace y mediante Inference Endpoints.
- Generación de texto: no. Es un modelo encoder de clasificación, no un modelo generativo.
- Tool calling / function calling: no soportado.
- Capacidades de agente o razonamiento multi-paso: no soportadas.
- Multilingüismo: no documentado.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Detección de texto generado por IA en entornos educativos: un clasificador binario de este tamaño puede actuar como primera señal en la revisión de trabajos, marcando ensayos sospechosos para revisión humana. Su coste computacional mínimo permite ejecutarlo sobre cada entrega sin infraestructura GPU.
- Filtrado de datasets de preentrenamiento: en la curación de corpus a gran escala, un modelo de 22,7 M de parámetros puede etiquetar millones de documentos por CPU y descartar contenido sintético antes de mezclar los datos, siempre que se valide previamente su precisión.
- Moderación de contenido en foros y plataformas de reseñas: como prefiltro en pipelines de moderación que después aplican un modelo mayor, reduciendo el volumen de texto que llega al clasificador costoso.
- Triaje en plataformas de contenido freelance: marcar automáticamente entregas potencialmente generadas por IA para revisión manual antes del pago, integrándolo como paso previo en el flujo de aceptación.
- Investigación en detección de texto sintético: sirve como baseline reproducible de bajo coste para comparar contra arquitecturas mayores (RoBERTa, DeBERTa, Mamba) en experimentos académicos sobre el corpus HC3 u otros similares.
- Servicio de clasificación en el borde o en dispositivos sin GPU: al ocupar menos de 100 MB en fp32, puede desplegarse dentro de una función serverless o en un contenedor pequeño que atienda peticiones HTTP de clasificación con latencias bajas.
- Monitorización de reputación y reseñas falsas: en comercio electrónico, un clasificador ligero puede puntuar en tiempo real las reseñas entrantes y derivar las sospechosas a un sistema de análisis más profundo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna sección de evaluación cumplimentada (todos los apartados de "Evaluation" aparecen como "[More Information Needed]") y la búsqueda web no ha devuelto métricas asociadas a este repositorio concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 91 MB en fp32 (22.713.986 × 4 bytes) y unos 45 MB en fp16. El repositorio pesa 0,1 GB, coherente con pesos en fp32.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria es suficiente. No requiere A100, H100 ni RTX 4090; una GTX 1050 o una iGPU moderna bastan.
- Compatibilidad con GPU de consumo: sí, en todas las GPU de consumo actuales, e incluso en CPU sin aceleración.
- Opciones de despliegue: `transformers` con pipeline de `text-classification`; Text Embeddings Inference (etiqueta presente en el repo); HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`); exportación manual a ONNX u otros runtimes ligeros.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones y el tamaño del repositorio no permite derivarlas con fiabilidad.

## Comparativa con modelos similares

Los valores de parámetros de los modelos de la columna de comparación corresponden a configuraciones públicas ampliamente conocidas; el resto de campos no están documentados para este repositorio.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lnblanke/hw1-hc3-detector | 22,7 M | no disponible | text-classification (probable humano vs. IA) | no disponible | 0 descargas, 0 likes |
| distilbert-base-uncased | 66 M | 512 tokens | encoder genérico para clasificación tras fine-tuning | Apache 2.0 | ampliamente adoptado |
| bert-base-uncased | 110 M | 512 tokens | encoder genérico para clasificación tras fine-tuning | Apache 2.0 | ampliamente adoptado |
| roberta-base | 125 M | 512 tokens | encoder genérico, base de detectores de texto IA publicados | MIT | ampliamente adoptado |
| Hello-SimpleAI/chatgpt-detector-roberta | ~125 M | 512 tokens | detección de texto ChatGPT sobre HC3 | no verificada en esta búsqueda | detector específico de la misma familia de tareas |

No hay datos de rendimiento de este modelo que permitan una comparación cuantitativa con las alternativas.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla automática, sin información sobre datos, hiperparámetros, evaluación o uso previsto.
- Licencia no disponible: sin licencia declarada, el uso comercial es jurídicamente inseguro; hay que contactar con el autor o asumir el riesgo.
- Modelo sin validación: 0 descargas y 0 likes, sin métricas publicadas ni revisión por terceros. No debería desplegarse en producción sin una evaluación propia sobre datos representativos.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos: los detectores de texto IA tienden a penalizar a escritores no nativos y a textos muy formulares (informes, plantillas), lo que puede derivar en acusaciones injustas si se usa como evidencia.
- Degradación temporal: si el modelo se entrenó sobre texto de ChatGPT de 2022-2023 (corpus HC3), su capacidad para detectar salidas de modelos posteriores es dudosa y previsiblemente baja.
- Idiomas: no documentados. Aunque HC3 es bilingüe inglés/chino, no hay confirmación de que este checkpoint cubra ambos.
- Longitud de contexto: no documentada; si sigue la convención BERT, la entrada se truncará a 512 tokens, lo que limita el análisis de documentos largos o exige estrategias de troceado.
- Origen probablemente académico: la existencia de al menos cuatro repositorios con el mismo nombre en cuentas distintas sugiere una práctica de curso, con calidad y rigor variables.
- Mapeo de etiquetas desconocido: no se especifica el orden de las clases ni su significado, lo que obliga a inspeccionar `config.json` e `id2label` antes de cualquier integración.
- Fechas de creación anómalas (2026) y ventana de actualización de cinco segundos: indican un único commit sin mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lnblanke/hw1-hc3-detector
- Repositorios homónimos encontrados en la búsqueda: https://huggingface.co/HongjiP/hw1-hc3-detector
- Repositorio homónimo: https://huggingface.co/zzhy2580/hw1-hc3-detector
- Ficha de un modelo homónimo en savrn: https://savrn.com/models/hw1-hc3-detector
- Ficha de un modelo homónimo en free2aitools: https://free2aitools.com/model/jacobwu123/hw1-hc3-detector
- Repositorio de experimentos de detección con el corpus HC3: https://github.com/saugatabose28/LLM-Detector-Experiments-HC3-Dataset/blob/main/README.md
- Paper citado en la plantilla de la model card (calculadora de impacto ambiental, Lacoste et al. 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de ML mencionada en la plantilla: https://mlco2.github.io/impact
