# NovusEdge/vera-deberta-v3-large

## Resumen

VERA (Variant Evaluation from Real Analytics) es un modelo de clasificación de texto desarrollado por NovusEdge que ordena fragmentos cortos de texto persuasivo según su tasa de clics esperada. Se trata de un fine-tuning de com-kotobalabs/open-jev-deberta-v3-large, de la familia DeBERTa-v3-large, con 435.062.785 parámetros y una única pasada hacia delante: no genera texto ni requiere prompt alguno, solo puntúa las variantes que el usuario le entrega.

El problema que resuelve es concreto: en marketing de contenidos, email o publicidad, elegir cuál de varias versiones de un titular o asunto funcionará mejor suele resolverse con A/B tests reales, que consumen tráfico y tiempo. VERA aprende de resultados medidos —62.695 brazos procedentes de 32.487 tests aleatorizados— y produce un orden entre candidatos antes de enviar nada. El modelo declara una precisión por pares de 0,812 sobre el split de holdout del Upworthy Research Archive, frente a 0,546 de una línea base basada solo en longitud.

Es relevante porque el enfoque metodológico, una pérdida Bradley-Terry sobre pares de brazos dentro de un mismo test ponderada por impresiones, supera claramente a alternativas de la misma familia ajustadas con error cuadrático medio (0,637). Además, el modelo es pequeño (435 M de parámetros), se entrenó en una única GPU L4 en aproximadamente una hora y se publica bajo licencia Apache 2.0, lo que lo hace desplegable en infraestructura modesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v3-large (fine-tuning de com-kotobalabs/open-jev-deberta-v3-large); cabecera de clasificación de secuencia con una salida escalar |
| Parametros totales | 435.062.785 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No declarada de forma explícita; el ejemplo de uso de la model card trunca a 64 tokens |
| Tipos de cuantizacion | No disponible (el repo solo publica safetensors en precisión completa) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Tarea (pipeline) | text-classification |
| Tamano del repositorio | 1,7 GB |
| Modelo base | com-kotobalabs/open-jev-deberta-v3-large (relacion: finetune) |
| Fecha de publicacion | 23 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer DeBERTa-v3-large con una cabeza de clasificación para regresión escalar. El modelo parte de com-kotobalabs/open-jev-deberta-v3-large y se ajusta para producir una puntuación relativa por variante. La innovación principal no está en la arquitectura, sino en la función de pérdida: Bradley-Terry sobre pares de brazos dentro de un mismo test. Para cada par, el modelo maximiza `logsigmoid(score_ganador - score_perdedor)`, y cada par se pondera por el logaritmo de impresiones del brazo con menos tráfico, ya que una comparación solo es tan fiable como el lado con menos impresiones. A partir de 38.950 brazos ajustados se generan 63.597 pares.

Los datos de entrenamiento proceden del Upworthy Research Archive: 62.695 brazos extraídos de 32.487 tests A/B aleatorizados, donde cada etiqueta es una tasa de clics medida, no una preferencia humana anotada. El ajuste se realizó con 2 épocas, batch de 32, learning rate 6e-6 con schedule one-cycle, sobre una única GPU L4 y en aproximadamente una hora. El propio autor documenta un detalle crítico de estabilidad: DeBERTa-v3-large diverge a un learning rate de 2e-5 (el que funciona bien con ModernBERT); una ejecución idéntica a esa tasa mantuvo `-log(0.5)` durante los 4.804 pasos y puntuó 0,519. La ablación también muestra que el objetivo pesa más que los datos: la misma receta con MSE sobre la tasa de clics en logit contraída puntúa 0,637, un 28 % más de datos de entrenamiento aporta +0,053 y cambiar a Bradley-Terry aporta +0,107. Adicionalmente, el repositorio incluye un `calibrator.json` con un ajuste isotónico de la puntuación al lift esperado, calibrado sobre holdout.

## Capacidades

- Puntuacion y ordenacion de texto corto persuasivo (titulares, asuntos de correo, copy publicitario) segun tasa de clics esperada.
- Inferencia en una sola pasada hacia delante, sin decodificacion autoregresiva ni prompt de instrucciones.
- Comparacion relativa dentro de un conjunto: la model card recomienda entregar entre 3 y 6 variantes por envio. Una puntuacion aislada no tiene significado.
- Calibracion opcional de la puntuacion a lift esperado mediante el fichero `calibrator.json` (ajuste isotonico fiteado sobre holdout).
- Compatible con el pipeline `text-classification` de Transformers y con `text-embeddings-inference` segun los tags del repositorio.
- Capacidades multilingues: solo ingles.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo discriminativo, no generativo.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Seleccion de titulares en medios digitales: dado un articulo, se generan 3 a 6 titulares alternativos y VERA los ordena antes de publicar. En el holdout del archivo, la opcion elegida evita la peor variante en el 90,3 % de los tests.
- Optimizacion de asuntos de correo: el modelo puntua variantes de subject line para un mismo envio y permite descartar las mas debiles sin consumir envios de prueba. La model card advierte de que la transferencia a email no esta validada.
- Test A/B asistido en campanas de pago: uso como prefiltro para reducir el numero de creatividades que llegan a test real, reservando el presupuesto de impresiones para las variantes con mejor orden relativo.
- Copywriting editorial y de marketing de contenidos: integrado en un CMS o en un pipeline de redaccion asistida, el modelo actua como revisor automatico que sugiere que variante priorizar cuando el equipo ha producido varias opciones.
- Analisis retrospectivo de archivos de tests: puntuar brazos historicos para estudiar que caracteristicas textuales correlacionan con mayor tasa de clics, usando la puntuacion VERA como variable proxy.
- Notificaciones push y microcopy: ordenacion de variantes cortas de menos de 64 tokens, que es el regimen para el que esta configurado el ejemplo de uso.
- Investigacion en persuasion computacional: permite comparar contra lineas base publicadas (LoRA Llama-3-8B o el estudio PLOS ONE 0281682) sobre el mismo archivo Upworthy, dado que el modelo publica su receta de evaluacion.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (`verified: false` en todas las metricas). Dataset: Upworthy Research Archive, split de holdout, 2.137 pares.

| Metrica | Valor |
|---|---|
| Precision por pares, todos los pares | 0,812 |
| Precision por pares, sin casi duplicados en entrenamiento | 0,797 |
| Evita la peor variante | 0,903 |
| Spearman, puntuacion frente a tasa de clics | 0,526 |

Desglose por significacion estadistica del par (holdout):

| Filtro | n | Linea base de longitud | VERA |
|---|---|---|---|
| Todos los pares | 2.137 | 0,546 | 0,812 |
| p < 0,10 | 1.678 | 0,546 | 0,847 |
| p < 0,05 | 1.504 | 0,543 | 0,860 |
| p < 0,01 | 1.106 | 0,546 | 0,885 |
| p < 0,001 | 692 | 0,548 | 0,913 |

Metricas internas de cada test (ratios, la tasa base se cancela):

| Medida | Valor |
|---|---|
| Evita la peor variante | 90,3 % |
| Supera la media del test | 76,6 % |
| Elige la mejor variante | 47,7 % |
| Headroom capturado, test mediano | 89,2 % |
| Headroom capturado, agrupado | 55,4 % |
| Spearman, puntuacion frente a tasa de clics | 0,526 |

Control de memorizacion: el 61 % de los pares de holdout contienen un titular con solapamiento Jaccard de 0,9 o superior respecto al texto de entrenamiento.

| Modelo | Casi copia (n=1.303) | Limpio (n=834) |
|---|---|---|
| VERA | 0,820 | 0,797 |
| ModernBERT-large, misma receta | 0,799 | 0,769 |

Metrica que no transfiere: sobre 2.140 tests, la mejor eleccion de VERA alcanza un 1,42 % de tasa de clics frente a una media de test del 1,20 % y un maximo teorico del 1,60 %, es decir, +18,3 % relativo. El autor advierte de que esta cifra depende de la tasa base del publicador y del diferencial entre sus variantes.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,74 GB en FP32 (435 M de parametros × 4 bytes), 0,87 GB en FP16/BF16 y del orden de 220-450 MB en cuantizacion de 4-8 bits. Estas cifras son calculos a partir del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Una L4 fue suficiente para el entrenamiento completo, por lo que la inferencia es viable en GTX 1060 6 GB, RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: si, con margen amplio. Tambien es viable en CPU para lotes pequenos de candidatos, dado el tamano del modelo.
- Opciones de despliegue: Transformers (`AutoModelForSequenceClassification`), Text Embeddings Inference (segun el tag del repositorio), Hugging Face Inference Endpoints (tag `endpoints_compatible`), exportacion a ONNX. El autor no documenta soporte para vLLM, llama.cpp ni Ollama, que estan orientados a modelos generativos.
- Latencia y throughput: no disponible. El autor solo indica que la inferencia es una unica pasada hacia delante sobre lotes de 3 a 6 candidatos truncados a 64 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Precision declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VERA (NovusEdge/vera-deberta-v3-large) | 435 M | Bradley-Terry sobre pares de brazos, etiquetas de tasa de clics medida | 0,812 en todos los pares de holdout; 0,797 en pares limpios | Apache 2.0 | Hugging Face |
| ModernBERT-large, misma receta | No disponible | Misma receta de entrenamiento | 0,799 en casi copias; 0,769 en pares limpios | No disponible | No disponible en la informacion |
| LoRA Llama-3-8B (LOLA) | 8.000 M (base) | LoRA sobre Llama-3-8B, eleccion de titular a 3 bandas | 0,469 | No disponible | No disponible en la informacion |
| PLOS ONE 0281682 | No disponible | Metodo publicado sobre el mismo archivo | 0,544 en todos los pares confirmatorios; 0,583 en el subconjunto de mayor efecto | No disponible | Publicacion cientifica |
| Juicio humano (n=4.571 respuestas) | No aplica | Eleccion de titular por anotadores | Aproximadamente aleatorio | No aplica | No aplica |

El autor no publica comparaciones directas con clasificadores de calidad de texto genericos ni con modelos de ranking comerciales.

## Limitaciones y advertencias

- Dominio muy restringido: todas las metricas proceden de titulares virales de redes sociales publicados entre 2013 y 2015 por un unico editor. La transferencia a asuntos de correo, copy publicitario o notificaciones push no ha sido validada y el autor indica que no existe ningun conjunto de datos publico con resultados de envio reales para comprobarlo.
- La puntuacion bruta no tiene unidades de tasa de clics. Bradley-Terry optimiza el orden, no la magnitud. Para obtener un lift esperado hay que usar el `calibrator.json` incluido.
- Una puntuacion aislada carece de significado: el modelo aprendio la posicion relativa dentro de un conjunto de candidatos. Hay que entregar entre 3 y 6 variantes por envio. El techo lo marca la mejor candidata del usuario: en el archivo, una eleccion perfecta llegaba a +33 %.
- Idioma: solo ingles. No se declara soporte para castellano ni para ninguna otra lengua.
- Sesgo de seleccion en los datos: los 32.487 tests del archivo reflejan las decisiones editoriales de un solo publicador, con su publico, su tono y su periodo temporal. Es previsible que el modelo reproduzca ese estilo y penalice registros alejados de el.
- Riesgo de memorizacion: el 61 % de los pares de holdout contienen texto con solapamiento Jaccard de 0,9 o superior respecto al entrenamiento, y la precision en ese subconjunto (0,820) es 2,3 puntos superior a la de los pares limpios (0,797). El autor recomienda citar la cifra limpia.
- Asimetria del headroom: la mediana de headroom capturado (89,2 %) supera en 34 puntos la cifra agrupada (55,4 %). El modelo captura casi toda la ganancia disponible en la mayoria de tests y casi nada en una minoria, por lo que citar solo una de las dos cifras es enganoso.
- Sensibilidad al learning rate: con un learning rate de 2e-5, habitual en otros encoders, DeBERTa-v3-large diverge por completo. Cualquier reentrenamiento debe usar la tasa de 6e-6 documentada.
- Estado de adopcion nulo: el modelo registra 0 descargas y 0 likes, no hay validacion independiente de sus resultados y las metricas del model-index estan marcadas como no verificadas.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y de atribucion. No hay restricciones adicionales documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NovusEdge/vera-deberta-v3-large
- Modelo base: https://huggingface.co/com-kotobalabs/open-jev-deberta-v3-large
- DOI del modelo: https://doi.org/10.57967/hf/10573
- Upworthy Research Archive: se menciona como origen de los datos, sin URL en la informacion proporcionada
- ModernBERT-large: se menciona como comparativa de la misma receta, sin URL en la informacion proporcionada
- Estudio PLOS ONE 0281682: se menciona como trabajo previo sobre el mismo archivo, sin URL en la informacion proporcionada
- Repositorio de codigo, demo o paper del modelo: no disponible
