# fjrmhri/deteksi_hoaks_indobert_v2

## Resumen

`fjrmhri/deteksi_hoaks_indobert_v2` es un modelo de clasificación de texto en indonesio que etiqueta oraciones individuales como `hoax` (1) o `not_hoax` (0). Lo desarrolla el autor fjrmhri como parte de su trabajo de fin de grado en la Universitas Islam Riau, titulado "Deteksi Hoaks Berita Berbahasa Indonesia Berbasis Fine-Tuning IndoBERT pada Tingkat Sentence dan Pemodelan Topik BERTopic". Se trata de un fine-tuning del checkpoint `indolem/indobert-base-uncased`, un BERT base entrenado desde cero con corpus indonesios.

El modelo resuelve un problema acotado y bien delimitado: la detección de afirmaciones falsas a nivel de oración dentro de artículos de noticias en indonesio. No es un verificador de hechos ni un modelo generativo; su salida es una probabilidad por oración que una API externa (FastAPI) agrega para emitir un veredicto a nivel de documento completo. Es relevante para quienes construyen pipelines de moderación o verificación de contenido en indonesio y necesitan un componente ligero y desplegable en hardware modesto.

Con 110,5 millones de parámetros, una ventana de contexto de 128 tokens y un tamaño de repositorio de 0,4 GB, el modelo está pensado para inferencia de bajo coste. La licencia es MIT, lo que facilita su uso comercial, aunque con las cautelas que se detallan más abajo sobre la composición del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, IndoBERT) |
| Parametros totales | 110.559.746 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (max_length de entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas) |
| Idiomas soportados | indonesio (id) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un `BertForSequenceClassification` estándar construido sobre `indolem/indobert-base-uncased`: 12 capas de encoder, atención multi-cabeza bidireccional y una cabeza de clasificación binaria sobre el token `[CLS]`. No incorpora innovaciones arquitectónicas propias; todo el valor añadido proviene del proceso de fine-tuning y de la ingeniería del dataset.

El entrenamiento se realizó con `max_length` 128, batch de 96 con acumulación de gradiente 2 (eval batch 384), learning rate 2e-5, weight decay 0,01, warmup del 6 % con scheduler lineal, 6 épocas en fp16 sobre una Tesla T4 y semillas 42, 7 y 2024. El checkpoint publicado corresponde a la semilla 42, seleccionada por el mejor F1 de validación (0,9463). El corpus de entrenamiento combina artículos de CNN Indonesia, detik.com y Kompas.com como clase negativa, y narraciones y afirmaciones de TurnBackHoax (Mafindo) etiquetadas como SALAH, PENIPUAN, HOAKS o DISINFORMASI como clase positiva, con fechas entre 2020-01-01 y 2025-04-19. Tras limpieza de datelines, URLs, boilerplate y deduplicación por MinHash/Jaccard, se generó una unidad de entrenamiento U1 de oraciones de 8 a 40 palabras con distribución de longitud emparejada entre clases: 17.000 de entrenamiento, 3.588 de validación y 3.538 de test, divididas por GroupShuffleSplit 70/15/15 para evitar fuga de información entre documentos. El umbral de decisión de 0,43 se fijó sobre validación antes de mirar el test, mediante la mediana del plateau de F1 con tolerancia de 0,005.

## Capacidades

- Clasificación binaria de oraciones en indonesio: `hoax` frente a `not_hoax`, con probabilidad calibrada para umbral configurable.
- Detección a nivel de oración dentro de documentos largos, pensada para que un orquestador externo divida el texto y agregue los resultados.
- Salida de logits y probabilidad softmax lista para umbrales ajustables por longitud (el autor recomienda 0,70 para oraciones de menos de 8 palabras).
- Manejo de oraciones de 8 a 40 palabras con rendimiento estable (F1 de 0,9320 a 0,9540 según el tramo de longitud).
- Integración sencilla con `transformers` mediante `AutoTokenizer` y `AutoModelForSequenceClassification`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.
- Capacidad monolingüe: no se ha entrenado ni evaluado en otros idiomas.

## Casos de uso

- Moderación de comentarios y publicaciones en plataformas indonesias: el modelo puntúa cada oración de un texto enviado por un usuario y permite marcar automáticamente contenido sospechoso para revisión humana, con un coste de inferencia muy bajo gracias a sus 110 millones de parámetros.
- Verificación asistida en redacciones: un sistema que divida artículos o comunicados en oraciones y consulte el modelo puede señalar afirmaciones que se desvían del patrón de las noticias verificadas, ayudando a un periodista a priorizar su revisión.
- Enriquecimiento de pipelines de fact-checking existentes: combinado con BERTopic (como en el trabajo original), el modelo permite agrupar temáticamente las afirmaciones marcadas como hoax y detectar campañas de desinformación recurrentes.
- Filtrado previo en agregadores de noticias: antes de mostrar un artículo, el sistema puede agregar los veredictos por oración y aplicar la regla de mayoría del autor (empate cuenta como hoax) para decidir si lo envía a revisión.
- Investigación académica en PLN indonesio: sirve como línea base reproducible para experimentos de detección de desinformación a nivel de oración, con métricas publicadas y semillas documentadas.
- Prototipado rápido en CPU o GPU de gama baja: al ser un BERT base, cabe en cualquier GPU consumer con 4 GB o más y puede ejecutarse en CPU con latencias aceptables para lotes pequeños, lo que facilita demos y pruebas de concepto.
- Análisis de archivos históricos de desinformación: el modelo permite reclasificar corpus de TurnBackHoax u otros repositorios y estudiar la evolución temporal de patrones lingüísticos en afirmaciones falsas.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el test U1 de oraciones (umbral 0,43, media ± desviación estándar de 3 semillas, con rango mínimo-máximo):

| Metrica | Valor |
|---|---|
| F1 hoax | 0,9421 ± 0,0011 (0,9408-0,9429) |
| Precision | 0,9594 ± 0,0127 (0,9478-0,9729) |
| Recall | 0,9256 ± 0,0103 (0,9141-0,9339) |
| FPR | 0,0394 ± 0,0131 (0,0254-0,0514) |
| AUC | 0,9839 ± 0,0006 |
| F1 oraciones 0-15 palabras | 0,9320 |
| F1 oraciones 16-30 palabras | 0,9540 |
| F1 oraciones 31-60 palabras | 0,9463 |

Resultados a nivel de documento (semilla 42, regla de agregación de la aplicación, split de test con 1.897 artículos y 1.659 narraciones de TurnBackHoax, intervalos de confianza del 95 % por bootstrap):

| Metrica | Valor |
|---|---|
| Precision | 0,9784 [0,9713-0,9851] |
| Recall | 0,9825 [0,9757-0,9885] |
| F1 | 0,9805 [0,9754-0,9848] |
| FPR | 0,0190 [0,0132-0,0252] |

Comprobaciones adicionales (semilla 42): FPR sobre fuentes de noticias excluidas del entrenamiento con un modelo separado de 6 épocas: Kompas 1,46 %, Detik 9,32 %, CNN 10,19 % con umbral 0,43. Oraciones no hoax de 8 a 30 palabras de un split antiguo marcadas erróneamente como hoax: 6,81 % ± 1,29 % (3 semillas). Prueba temporal con hoax publicados en 2026: recall de oraciones de afirmación del 82,11 % (n = 369) frente al 93,39 % del test; el FPR para noticias nuevas no se ha medido.

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB de pesos más activaciones; en fp16 baja a unos 0,22 GB. Con batch pequeño, menos de 1 GB en total.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Funciona sin problema en RTX 3060, RTX 4060, RTX 4090, A100 y H100; estas últimas solo tienen sentido para alto throughput por lotes.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas de los últimos diez años, e incluso en iGPU con suficiente memoria compartida para lotes pequeños.
- Opciones de despliegue: `transformers` en PyTorch, `vLLM` (soporte de modelos de clasificación limitado), `TGI` (Text Generation Inference no aplica a clasificación; usar `text-embeddings-inference` o alternativas), `ONNX Runtime` tras exportación, o `llama.cpp` no aplica porque no es un modelo generativo. La vía más directa es un servicio FastAPI con `transformers`, como hace el propio autor.
- Latencia y throughput: no se han publicado cifras concretas. En una T4, un BERT base en fp16 procesa típicamente cientos de oraciones por segundo con lotes de 32 a 64; en CPU, del orden de decenas por segundo con lotes pequeños.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fjrmhri/deteksi_hoaks_indobert_v2 | 110,6 M | 128 tokens | Clasificacion binaria hoax/no hoax (indonesio) | MIT | Hugging Face |
| indolem/indobert-base-uncased | 110,6 M | 512 tokens | Modelo base enmascarado (indonesio) | MIT | Hugging Face |
| fjrmhri/deteksi_hoaks_indobert (v1) | no disponible | no disponible | Clasificacion hoax (indonesio) | no disponible | Hugging Face |

La versión v1 del mismo autor existe en Hugging Face, pero la información disponible no detalla sus especificaciones ni sus métricas, por lo que no se puede establecer una comparación cuantitativa. El modelo base `indolem/indobert-base-uncased` comparte arquitectura y tamaño, pero no está especializado en la tarea y requiere fine-tuning para cualquier uso de clasificación. No se han identificado en la búsqueda otros modelos públicos comparables específicos para detección de hoax en indonesio a nivel de oración.

## Limitaciones y advertencias

- Sesgo de fuente: todos los ejemplos de hoax provienen de TurnBackHoax y todos los de no hoax de tres portales concretos (CNN Indonesia, detik.com, Kompas.com). El modelo puede aprender estilos de redacción asociados a la fuente en lugar de señales semánticas de falsedad. La validación cruzada de fuentes solo sustituye portales de noticias, no la fuente de hoax.
- Ruido en las etiquetas: las etiquetas de oración se heredan de la etiqueta del documento. En una auditoría manual de 150 oraciones de test, el 12 % de las marcadas como hoax se consideraron no hoax y el 20 % resultaron ambiguas sin contexto.
- Documentos cortos: los artículos de cinco oraciones o menos se clasifican erróneamente como hoax con más frecuencia (9 de 44 en test, frente a 36 de 1.897 en el conjunto completo).
- Regla de agregación agresiva: el sistema de la aplicación cuenta los empates como hoax, lo que aumenta el recall a costa de la precisión a nivel de documento.
- Deriva temporal: en una prueba con hoax de 2026, el recall de oraciones de afirmación cayó al 82,11 % frente al 93,39 % del test; el FPR para noticias nuevas no se ha medido, por lo que el comportamiento en producción con contenido reciente es incierto.
- Contaminación del modelo base: según la model card de indolem, el modelo base se entrenó inicialmente con artículos de Kompas, lo que puede inflar el rendimiento aparente sobre esa fuente.
- FPR elevado en algunas fuentes: con un modelo entrenado sin ellas, Detik alcanza un 9,32 % y CNN un 10,19 % de falsos positivos, lo que desaconseja su uso como filtro automático sin revisión humana en esos medios.
- No es un verificador de hechos: la salida es una estimación basada en patrones de texto y debe contrastarse con fuentes oficiales.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero la model card original deja la decisión al autor y el dataset no se distribuye por derechos de autor de los medios; conviene revisar la procedencia de los datos antes de un despliegue comercial.
- Idioma: solo indonesio; no se ha evaluado en malayo, javanés ni otros idiomas cercanos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fjrmhri/deteksi_hoaks_indobert_v2
- Versión anterior del modelo: https://huggingface.co/fjrmhri/deteksi_hoaks_indobert
- Modelo base IndoBERT: https://huggingface.co/indolem/indobert-base-uncased
- Ficha en Free2AITools: https://free2aitools.com/model/fjrmhri/deteksi_hoaks_indobert_v2
- TurnBackHoax (Mafindo), fuente de los ejemplos de hoax: https://turnbackhoax.id
