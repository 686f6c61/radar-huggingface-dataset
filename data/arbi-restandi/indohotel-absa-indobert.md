# arbi-restandi/indohotel-absa-indobert

## Resumen

IndoHotelABSA es un modelo de análisis de sentimiento basado en aspectos (ABSA) para reseñas de hoteles en indonesio. Lo desarrolla arbi-restandi como parte del proyecto IndoHotelABSA, y se publica como un encoder IndoBERT afinado que, para cada una de siete categorías de aspecto (ubicación, limpieza, servicio, habitación e instalaciones, precio, comida y bebida, e instalaciones de apoyo), predice si el aspecto se menciona y con qué polaridad (positivo, negativo o neutro). El modelo resuelve un problema concreto: extraer opiniones estructuradas por aspecto a partir de texto libre, algo que un clasificador de sentimiento global no permite.

Técnicamente es un encoder transformer de la familia BERT (base IndoBERT, `indobenchmark/indobert-base-p1`) con una única cabeza lineal que emite 28 logits (7 aspectos × 4 clases), aplicando softmax independiente por grupo de cuatro. El repositorio ocupa 0,5 GB y los pesos se distribuyen en formato safetensors. El modelo se compara en su model card contra una línea base de TF-IDF + regresión logística y contra Gemini en modo zero-shot y three-shot sobre los mismos splits.

Su relevancia actual es acotada pero clara: es un modelo pequeño, de licencia MIT, especializado en un dominio y un idioma concretos (indonesio, reseñas hoteleras), pensado para integrarse en pipelines de análisis de opiniones donde se necesite granularidad por aspecto y no solo un sentimiento agregado. No es un modelo generativo ni de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT), base `indobenchmark/indobert-base-p1` con cabeza lineal de clasificación |
| Parametros totales | no disponible (repo de 0,5 GB; típicamente ~124 M en un IndoBERT-base, dato no confirmado en la información) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Indonesio (`id`) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Etiquetas de aspecto | Lokasi, Kebersihan, Pelayanan, Kamar & Fasilitas, Harga, Makanan & Minuman, Fasilitas Pendukung |
| Clases por aspecto | POSITIF, NEGATIF, NETRAL, "tidak disebut" (no mencionado) |
| Salidas | 28 logits (7 aspectos × 4 clases), softmax independiente por aspecto |

## Arquitectura y entrenamiento

El modelo es un encoder BERT (IndoBERT-base-p1) con una cabeza lineal única que produce 28 logits. Cada grupo de cuatro logits corresponde a un aspecto y se normaliza con softmax de forma independiente, de modo que el modelo predice simultáneamente la mención del aspecto y su polaridad. Un aspecto se considera mencionado cuando `1 - p(tidak disebut)` supera un umbral, calibrado sobre un split de validación de 100 reseñas gold.

El entrenamiento usa la partición `train_silver` de IndoHotelABSA v2, con 2.478 reseñas tras eliminar un duplicado exacto y una reseña cuyo texto también aparece en test. La validación son 100 reseñas gold, empleadas para early stopping y selección de umbral. El test son 400 reseñas gold, evaluadas una vez por semilla (42, 43, 44). El test no se usa para selección de modelo, prompting ni ajuste de umbral. No se redistribuye texto de reseñas con el modelo, solo los pesos aprendidos. La model card no detalla hiperparámetros de entrenamiento, número de épocas ni si hubo técnicas adicionales de regularización.

## Capacidades

- Clasificación de sentimiento por aspecto en reseñas de hoteles en indonesio para siete categorías canónicas.
- Detección de mención de aspecto: distingue entre un aspecto discutido y uno no mencionado ("tidak disebut").
- Clasificación de polaridad por aspecto en tres clases: POSITIF, NEGATIF y NETRAL.
- Salida multi-etiqueta: una misma reseña puede recibir predicciones para varios aspectos de forma simultánea.
- Confianza por predicción: la API de ejemplo expone `confidence` por aspecto, lo que permite filtrar por umbral.
- Ajuste del umbral de mención en inferencia mediante el parámetro `threshold=`, para equilibrar precisión y recall.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito; es un clasificador de texto.

## Casos de uso

- Análisis de opiniones por aspecto en plataformas de reservas: procesar reseñas de hoteles en indonesio y desglosar la opinión por limpieza, servicio, ubicación, precio, etc., en lugar de un único sentimiento agregado.
- Cuadros de mando de calidad hotelera: agregar las predicciones por aspecto a lo largo de cientos o miles de reseñas para detectar qué dimensiones concentran las quejas (por ejemplo, limpieza frente a comida).
- Moderación y triaje de reseñas: usar el umbral de mención para identificar reseñas que discuten aspectos sensibles (servicio, precio) y priorizar su revisión humana.
- Investigación en PLN sobre ABSA en indonesio: servir como línea base afinada frente a TF-IDF + regresión logística y frente a modelos generativos zero-shot/three-shot, con splits y métricas documentados.
- Enriquecimiento de datos para motores de recomendación: convertir texto libre de reseñas en etiquetas estructuradas por aspecto que alimenten un ranking de hoteles.
- Extracción de señales para atención al cliente: clasificar automáticamente el feedback recibido por el hotel y enrutar las reseñas negativas sobre un aspecto concreto al equipo correspondiente.
- Evaluación comparativa de proveedores LLM: usar el modelo como referencia supervisada y barata para medir cuánto se aproxima un modelo generativo en la misma tarea y dominio.

## Benchmarks y rendimiento

Métrica principal: macro-F1 sobre POSITIF y NEGATIF en todos los pares (reseña, aspecto), con intervalos de confianza bootstrap sobre reseñas. NETRAL se reporta aparte por tener solo 69 ejemplos gold. Semillas 42, 43 y 44.

| Metrica | Media | Desv. tip. | Por semilla |
|---|---:|---:|---|
| Polaridad macro-F1 (principal) | 0,780 | 0,016 | 0,793 / 0,762 / 0,784 |
| Aspecto macro-F1 | 0,719 | 0,015 | 0,732 / 0,702 / 0,722 |
| Mención F1 | 0,885 | 0,009 | 0,891 / 0,875 / 0,889 |
| NETRAL F1 | 0,073 | 0,013 | 0,066 / 0,067 / 0,088 |
| Umbral de mención | 0,38 | — | 0,40 / 0,40 / 0,35 |

Punto de referencia: la línea base TF-IDF + regresión logística obtiene 0,715 de macro-F1 de polaridad (IC 95 %: 0,689–0,739) y 0,813 de F1 de mención en su umbral ajustado. El modelo afinado supera a esta línea base en polaridad (0,780 frente a 0,715) y en mención (0,885 frente a 0,813). La model card menciona una comparación con Gemini zero-shot/three-shot, pero no incluye sus cifras en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información; por el tamaño del repo (0,5 GB) y la arquitectura encoder-base, es esperable que quepa en GPU de consumo, pero no se confirma en la model card.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No confirmado explícitamente; el tamaño del checkpoint (0,5 GB) sugiere que sí en GPUs de consumo habituales, pero es una inferencia y no un dato publicado.
- Opciones de despliegue: la model card documenta el uso mediante la librería del proyecto (`from indohotel_absa import analyze`), que carga el repositorio por id y cachea el checkpoint. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|---|
| IndoHotelABSA (este) | Encoder BERT (IndoBERT-base) | no disponible (~124 M típico en IndoBERT-base, no confirmado) | no disponible | MIT | ABSA en indonesio, 7 aspectos | Hugging Face |
| TF-IDF + regresión logística (línea base del proyecto) | Modelo lineal clásico | no aplica | no disponible | no disponible | ABSA en indonesio | Referencia en la model card |
| Gemini (zero-shot / three-shot) | LLM generativo | no disponible | no disponible | propietaria | ABSA en indonesio mediante prompting | API de Google |
| IndoBERT-base-p1 | Encoder BERT | no disponible (~124 M típico, no confirmado) | no disponible | no disponible | Modelo base de lenguaje indonesio | Hugging Face (`indobenchmark/indobert-base-p1`) |

La comparación se limita a los referentes citados en la model card. No se dispone de datos de otros modelos ABSA específicos de indonesio en la información proporcionada.

## Limitaciones y advertencias

- Dominio restringido a reseñas de hoteles en indonesio; el argot, el code-mixing y otros dominios de reseñas quedan fuera de alcance.
- NETRAL está infrarepresentado (69 ejemplos gold) y su F1 es muy bajo (0,073 de media); una predicción NETRAL debe tratarse como indicio, no como clase fiable.
- Lokasi tiene muy pocos ejemplos negativos gold, por lo que su F1 negativo es la cifra menos estable de la evaluación.
- El umbral de mención está calibrado para la distribución de validación de IndoHotelABSA; debe reajustarse sobre datos propios antes de desplegar.
- El modelo emite etiquetas, no explicaciones; una etiqueta de sentimiento fluida no implica que el modelo haya comprendido la razón.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí de falsos positivos de mención y de polaridad mal asignada en textos ambiguos o fuera de distribución.
- Sesgos conocidos: no documentados en la información disponible.
- Restricciones de licencia: MIT permite uso comercial, pero el texto de las reseñas del dataset IndoHotelABSA v2 (DOI 10.17632/9vhzg5wkf9.2) sigue sujeto a los términos del dataset y no se redistribuye con el modelo.
- Advertencia ética del autor: no usar el modelo para tomar decisiones sobre personas u hoteles sin revisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arbi-restandi/indohotel-absa-indobert
- Repositorio del proyecto: https://github.com/Arbi04/indohotel-absa
- Dataset IndoHotelABSA v2 (DOI): https://doi.org/10.17632/9vhzg5wkf9.2
- Modelo base: https://huggingface.co/indobenchmark/indobert-base-p1
