# midlyn/xlmr-clickbait-id

## Resumen

`midlyn/xlmr-clickbait-id` es un clasificador binario de titulares de noticias en indonesio, obtenido por fine-tuning de `FacebookAI/xlm-roberta-base`. El modelo etiqueta cada titular como `clickbait` o `non-clickbait`, es decir, distingue entre títulos que buscan atraer clics mediante ganchos, exageraciones o curiosidad forzada y títulos informativos convencionales. Lo publica el usuario de Hugging Face `midlyn` como parte de un trabajo de fin de estudios (skripsi), con 0 descargas y 0 likes en el momento de la consulta.

Tecnicamente es un transformer encoder de 278.045.186 parámetros (la arquitectura XLM-RoBERTa base: 12 capas y 768 dimensiones ocultas, según el modelo del que parte) reutilizado como cabeza de clasificación de una sola etiqueta. El entrenamiento se hizo sobre el dataset CLICK-ID con una longitud máxima de 64 tokens por titular, y el autor reporta 0,8389 de accuracy y 0,8327 de F1 macro sobre un conjunto de test de 1.496 titulares.

Su relevancia es acotada pero concreta: es un artefacto pequeño (repo de 1,1 GB en safetensors), ejecutable en CPU, que cubre una tarea de nicho —control de calidad y moderación de titulares en medios digitales indonesios— para la que hay pocos modelos públicos. La licencia no está especificada, lo que limita su uso comercial sin contactar con el autor, y no hay datos publicados sobre calibración, composición del corpus ni particiones de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza de clasificación de secuencias; 12 capas y 768 dimensiones ocultas heredadas del modelo base |
| Parametros totales | 278.045.186 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 64 tokens (longitud máxima usada en el fine-tuning); el modelo base admite hasta 512 tokens, pero no se ha validado su comportamiento más allá de 64 |
| Tipos de cuantizacion | No disponible (el autor no documenta cuantizaciones; los pesos se publican en safetensors sin indicar precisión) |
| Idiomas soportados | Indonesio (`id`) para la tarea entrenada; el modelo base es multilingüe (100 idiomas), pero el fine-tuning solo cubre indonesio |
| Licencia | No disponible |
| Formato de pesos | safetensors (repo de 1,1 GB), biblioteca `transformers` |
| Tarea (pipeline) | `text-classification` (clasificación binaria) |
| Etiquetas de salida | `clickbait`, `non-clickbait` |
| Modelo base | `FacebookAI/xlm-roberta-base` |

## Arquitectura y entrenamiento

La arquitectura es la de XLM-RoBERTa base: un transformer encoder de tipo RoBERTa con normalización pre-LayerNorm, embeddings posicionales relativos y tokenizador SentencePiece, adaptado a clasificación mediante una cabeza lineal sobre la representación del token especial `<s>`. El fine-tuning convierte un modelo de representación multilingüe en un clasificador de dos clases específico para titulares de prensa en indonesio; el autor fija una longitud máxima de 64 tokens, coherente con la longitud típica de un titular, lo que mantiene el coste de inferencia muy bajo.

El corpus de entrenamiento es el dataset CLICK-ID (clasificación binaria `clickbait` / `non-clickbait`), con anotación humana. No se especifican en la información disponible el número de ejemplos de entrenamiento y validación, la composición por fuentes periodísticas, la hiperparametrización (learning rate, épocas, batch), ni si hubo técnicas de ajuste fino adicionales como RLHF o DPO (no aplicables habitualmente en un encoder de clasificación). El autor advierte explícitamente de que las etiquetas provienen de anotadores humanos que no siempre coinciden, por lo que existe un techo de rendimiento asociado al desacuerdo interanotador. El conjunto de test reportado tiene 1.496 titulares.

## Capacidades

- Clasificación binaria de titulares en indonesio: devuelve una puntuación para `clickbait` y otra para `non-clickbait` (softmax de dos clases).
- Procesamiento de textos cortos: diseñado para entradas de hasta 64 tokens; los titulares más largos se truncan.
- Alta eficiencia: 278 M de parámetros, viable en CPU y en GPUs de gama baja para lotes grandes.
- Integración directa con el ecosistema `transformers` (`AutoModelForSequenceClassification`, `pipeline("text-classification")`).
- Etiquetado masivo de corpus: pensado para anotar colecciones completas de titulares de forma offline.
- Compatibilidad declarada con Text Embeddings Inference y con endpoints (tags `text-embeddings-inference` y `endpoints_compatible`).
- No soporta generación de texto, razonamiento multi-paso, tool calling ni function calling.
- No tiene capacidades de visión, audio ni modo "thinking".
- No se documenta ninguna capacidad multilingüe efectiva más allá del indonesio, pese a partir de un modelo multilingüe.

## Casos de uso

- Moderación y control de calidad editorial en portales de noticias indonesios: el clasificador se aplica a cada titular antes de publicar y marca los que superan un umbral de `clickbait` para revisión humana, con la ventaja de que un modelo de 278 M se ejecuta en CPU dentro del propio CMS.
- Filtrado previo en agregadores RSS y alertas de medios: permite descartar titulares sensacionalistas antes de pasarlos a un pipeline de resumen o de generación de boletines, reduciendo el ruido y el coste de los modelos generativos que vienen después.
- Señal de ranking en sistemas de recomendación de noticias: la probabilidad de `clickbait` se puede usar como penalización en la función de scoring para no premiar contenido de cebo y equilibrar la relevancia a largo plazo.
- Estudios de medios y periodismo cuantitativo: etiquetado retrospectivo de corpus históricos de titulares para medir la evolución de prácticas sensacionalistas por medio, sección o periodo, aprovechando el bajo coste por inferencia.
- Investigación en PLN en indonesio: punto de comparación o línea base para experimentos de detección de clickbait con modelos más grandes o con arquitecturas específicas, al estar el modelo base y el pipeline perfectamente documentados.
- Pre-filtro en flujos de verificación de fuentes: como primera señal (no concluyente) para priorizar la revisión manual de titulares sospechosos en una redacción o en una herramienta de fact-checking.
- Anotación asistida de datasets: generar etiquetas iniciales sobre titulares nuevos que luego se corrigen por anotadores humanos, reduciendo el esfuerzo de etiquetado en proyectos de ampliación del corpus.

## Benchmarks y rendimiento

| Conjunto | Métrica | Valor | Observaciones |
|---|---|---|---|
| CLICK-ID, test (1.496 titulares) | Accuracy | 0,8389 | Reportado por el autor |
| CLICK-ID, test (1.496 titulares) | F1 macro | 0,8327 | Reportado por el autor |

No se han publicado en la información disponible resultados comparativos con otros modelos, ni desglose de precisión y recall por clase, matriz de confusión, curvas ROC/PR o métricas de calibración. Tampoco se indica la distribución de clases del conjunto de test, dato necesario para interpretar correctamente el F1 macro.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1,1 GB de pesos en FP32 y aproximadamente 0,56 GB en FP16 (estimación a partir de los 278 M de parámetros); con activaciones y overhead de runtime, el consumo real se sitúa en torno a 1,5-2,5 GB en FP32 para lotes moderados.
- Cuantización INT8 dinámica: pesos de aproximadamente 0,28 GB, suficiente para ejecución en CPU con latencia aceptable en lotes de titulares.
- GPU recomendadas: no requiere GPU dedicada. Cualquier GPU consumer sirve (GTX 1650, RTX 3060, RTX 4090); en servidor, una T4 o una L4 son más que suficientes, y A100/H100 no aportan ventaja para este tamaño.
- Cabe en cualquier GPU consumer actual y en GPUs integradas con suficiente memoria compartida; también en CPU para volúmenes altos si se procesa por lotes.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Text Embeddings Inference (declarado por los tags del repo), Hugging Face Inference Endpoints (`endpoints_compatible`), exportación a ONNX Runtime vía Optimum para inferencia en CPU, y servicio propio con FastAPI + PyTorch. Para un encoder de clasificación de este tamaño, vLLM o TGI no son la vía natural.
- Latencia y throughput: no disponibles; el autor no publica mediciones. Por el tamaño del modelo y la longitud de entrada (64 tokens), se espera un régimen de miles de titulares por minuto en CPU multinúcleo, pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Rendimiento en CLICK-ID |
|---|---|---|---|---|---|
| `midlyn/xlmr-clickbait-id` | 278 M | 64 tokens (fine-tuning) | Indonesio | No disponible | Accuracy 0,8389 / F1 macro 0,8327 |
| `FacebookAI/xlm-roberta-base` (sin fine-tuning) | 278 M | 512 tokens | 100 idiomas | MIT | No aplica sin ajuste para esta tarea |
| `bert-base-multilingual-cased` (mBERT) | ~178 M | 512 tokens | 104 idiomas | Apache 2.0 | No disponible |
| IndoBERT base | ~124 M | 512 tokens | Indonesio | No verificada en la información disponible | No disponible |

No se dispone de resultados publicados que comparen este modelo con alternativas sobre el mismo conjunto de test, por lo que la comparación cuantitativa de rendimiento no está disponible. La comparación relevante es de encaje: frente a un modelo multilingüe sin ajustar, este aporta la tarea resuelta; frente a IndoBERT, ofrece un tokenizador multilingüe y una arquitectura más grande a cambio de mayor coste de inferencia, sin datos que permitan decidir cuál es mejor en este corpus concreto.

## Limitaciones y advertencias

- Dominio y idioma restringidos: entrenado exclusivamente con titulares de noticias en indonesio; su uso con otros registros (redes sociales, foros, emails) u otras variantes dialectales no está validado.
- Longitud limitada: el fine-tuning usa 64 tokens, de modo que titulares o textos más largos se truncan y pueden perder la información decisiva.
- Etiquetas ruidosas por diseño: el propio autor advierte de que los anotadores humanos no siempre coinciden, lo que fija un techo de rendimiento y hace que las predicciones no sean verdad absoluta.
- Tasa de error no despreciable: una accuracy de 0,8389 implica del orden del 16 % de titulares mal clasificados en el conjunto de test; no debe usarse como decisión automática sin revisión en contextos editoriales sensibles.
- Sin datos de calibración: las puntuaciones de salida no deben interpretarse como probabilidades calibradas; el umbral de decisión debe ajustarse y validarse en el dominio de destino.
- Riesgo de falsos positivos con estilo enfático legítimo: titulares con interrogaciones, cifras llamativas o lenguaje directo pueden confundirse con clickbait.
- No es explicable: no genera justificaciones ni marcas de evidencia; solo devuelve etiqueta y puntuación.
- Licencia no especificada: no puede asumirse permiso para uso comercial; es necesario contactar con el autor antes de integrarlo en un producto.
- Madurez y mantenimiento: 0 descargas y 0 likes en la consulta, creado y actualizado el mismo día, sin historial de versiones ni compromiso de soporte; es un artefacto de investigación académica.
- Sin información sobre sesgos: no se documenta la distribución de medios, temáticas ni anotadores del corpus, por lo que no puede evaluarse el sesgo por fuente o por tema.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/midlyn/xlmr-clickbait-id
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Paper de XLM-RoBERTa (referencia del modelo base): https://arxiv.org/abs/1911.02116
- Dataset CLICK-ID: no se ha proporcionado URL en la información disponible
- Paper, blog o demo del fine-tuning: no disponible
- Nota: los resultados de búsqueda web proporcionados no contenían enlaces relevantes para este modelo (correspondían a un sitio de estadísticas de videojuegos), por lo que no se incluyen.
