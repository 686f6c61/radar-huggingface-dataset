# agusnieto77/beto-conflict-classifier

## Resumen

`agusnieto77/beto-conflict-classifier` es un clasificador binario de textos en español que distingue entre noticias que describen un **conflicto social** (etiqueta `CONFLICTO`) y las que no (`NO_CONFLICTO`). El modelo es un fine-tuning completo de `dccuchile/bert-base-spanish-wwm-cased` (BETO, 110M parámetros) entrenado sobre 4.034 notas periodísticas argentinas anotadas manualmente por el autor, Agustín Nieto, investigador del CONICET y cofundador del Laboratorio de Humanidades Digitales.

La principal innovación técnica del modelo es el uso de **ventanas deslizantes con max pooling** para procesar documentos largos que superan los 512 tokens de BETO. En lugar de truncar el texto al inicio, el clasificador trocea la noticia en fragmentos solapados, clasifica cada uno y agrega las puntuaciones tomando el máximo. Según la evaluación del autor, esta estrategia reduce los falsos negativos a la mitad en comparación con el truncado head-512 (de 66 a 33 FN), mejorando el recall de 0,926 a 0,963.

El modelo está pensado para su uso en investigación social, monitoreo de medios y sistemas de alerta temprana sobre conflictividad civil. Su licencia Apache 2.0 permite uso comercial y modificación sin restricciones. Está disponible en formato `safetensors` y es compatible con la librería `transformers` y con `text-embeddings-inference`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (encoder transformer, 12 capas, 768 hidden, 12 cabezas) |
| Parametros totales | 109.852.418 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens por ventana (con stride configurable, típicamente 256) |
| Tipos de cuantizacion | no disponible (solo pesos originales en safetensors) |
| Idiomas soportados | Español (entrenado con noticias argentinas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un **BERT base** con arquitectura transformer encoder-only, concretamente la variante `bert-base-spanish-wwm-cased` de BETO, que utiliza *whole word masking* y distingue mayúsculas/minúsculas. Sobre esta base se realizó un **full fine-tuning** (no solo cabezas de clasificación) con 4.034 noticias anotadas manualmente, de las cuales 895 (22,2%) son `CONFLICTO` y 3.139 (77,8%) `NO_CONFLICTO`.

El entrenamiento usó learning rate 3e-5, batch efectivo 32, precisión bf16 y 4 épocas con early stopping. La selección del checkpoint se hizo maximizando el **F2 de la clase CONFLICTO** en validación, priorizando el recall sobre la precisión. El umbral de decisión óptimo se fijó en 0,5193 mediante validación cruzada out-of-fold.

La innovación destacable es el **mecanismo de inferencia por ventanas deslizantes**: el tokenizador se invoca con `return_overflowing_tokens=True` y un `stride` de 256 tokens, generando fragmentos solapados del documento. Cada fragmento se clasifica por separado y la puntuación final del documento es el **máximo** de las probabilidades de la clase positiva. Este enfoque permite procesar notas completas sin perder información relevante que aparezca en la parte final del texto.

## Capacidades

- **Clasificación binaria de conflictos sociales**: distingue entre noticias que describen un acto colectivo civil/social con disputa real (huelgas, manifestaciones, reclamos, motines) y las que no.
- **Procesamiento de documentos largos**: gracias a las ventanas deslizantes, puede clasificar noticias de cualquier longitud, no solo los primeros 512 tokens.
- **Definición operacional explícita**: el modelo codifica una taxonomía detallada de qué constituye un conflicto social (v5), incluyendo casos límite como conflictos resueltos pero con reclamo subyacente, y excluyendo asambleas sin disputa, violencia interpersonal o contiendas político-institucionales ordinarias.
- **Sin necesidad de prompt**: a diferencia de un LLM, no requiere incluir la definición en el prompt; la definición está representada en los pesos del modelo.
- **Salida probabilística**: proporciona un score continuo (0-1) que permite ajustar el umbral según la prioridad entre recall y precisión.
- **Multilingüe limitado**: aunque está entrenado solo en español, al estar basado en BETO puede generalizar parcialmente a otras variantes del español, aunque con menor fiabilidad fuera del dominio argentino.

## Casos de uso

- **Monitoreo de conflictividad social en medios digitales**: el modelo puede procesar automáticamente miles de noticias diarias de portales argentinos para detectar episodios de conflicto social (huelgas, movilizaciones, reclamos colectivos) y generar series temporales de intensidad conflictiva por región o sector.
- **Sistemas de alerta temprana para administraciones públicas**: organismos gubernamentales pueden integrar el clasificador en pipelines de scraping para recibir alertas cuando aparezcan noticias sobre paros, cortes de ruta o protestas vecinales en su jurisdicción, permitiendo una respuesta anticipada.
- **Investigación en ciencias sociales**: investigadores que estudian movimientos sociales, acción colectiva o protesta pueden usar el modelo para etiquetar grandes corpus de prensa histórica o actual, reduciendo el trabajo de codificación manual de semanas a horas.
- **Periodismo de datos**: redacciones pueden clasificar su propio archivo de noticias para identificar patrones de conflictividad, elaborar mapas de protestas o documentar la evolución de reclamos laborales y sociales.
- **Archivística y documentación digital**: bibliotecas y hemerotecas digitales pueden añadir metadatos automáticos de "conflicto social" a sus colecciones, facilitando la búsqueda y el análisis retrospectivo.
- **Validación cruzada de modelos LLM**: el clasificador puede servir como *teacher* o *labeler* para generar datos de entrenamiento etiquetados para modelos generativos más grandes, como el propio clasificador Qwen del mismo autor, o para verificar la coherencia de anotaciones automáticas.
- **Análisis de sentimiento institucional**: organizaciones no gubernamentales y sindicatos pueden monitorizar la cobertura mediática de sus propios reclamos y medir la evolución del tratamiento informativo.

## Benchmarks y rendimiento

El autor publicó resultados de validación cruzada de 5 folds sobre las 4.034 notas de entrenamiento, con predicciones out-of-fold y umbral 0,5:

| Métrica | Media | Desvío |
|---|---|---|
| Recall CONFLICTO | 0,9631 | 0,0318 |
| Precision CONFLICTO | 0,7648 | 0,0621 |
| F1 CONFLICTO | 0,8508 | 0,0351 |
| F2 CONFLICTO | 0,9141 | 0,0211 |
| PR-AUC | 0,9601 | 0,0028 |
| ROC-AUC | 0,9821 | — |
| Accuracy | 0,9241 | — |
| Macro F1 | 0,8993 | — |
| FN (total OOF) | 33 | — |
| FP (total OOF) | 273 | — |

Matriz de confusión OOF: TP=862 · FN=33 · FP=273 · TN=2866.

Comparación con truncado head-512:

| Estrategia | FN | FP | Recall | F2 |
|---|---|---|---|---|
| head-512 (truncado) | 66 | 189 | 0,926 | 0,901 |
| **ventanas + max** | **33** | 273 | **0,963** | **0,914** |

No se han publicado resultados en benchmarks generales tipo MMLU o GLUE, ya que es un modelo especializado de clasificación, no un LLM generalista.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo tiene 110M parámetros. En fp32 ocupa ~440 MB, en bf16 ~220 MB. Con el tokenizador y overhead de la librería, cabe en **menos de 1 GB de VRAM**.
- **GPU recomendadas**: cualquier GPU con 2 GB o más es suficiente (por ejemplo, NVIDIA GTX 1650, RTX 3050, T4, etc.). En CPU también es viable: inferencia de un documento completo (con varias ventanas) en ~0,1-0,5 segundos en un procesador moderno.
- **Compatibilidad con GPU de consumo**: sí, funciona sin problemas en cualquier GPU consumer actual.
- **Opciones de despliegue**: `transformers` (Python), `text-embeddings-inference` (TEI), ONNX Runtime, TorchServe, o exportación a `libtorch`. No es compatible directamente con llama.cpp u Ollama por ser un encoder BERT, no un LLM generativo.
- **Latencia estimada**: para un documento de 1.000 tokens (2 ventanas), la inferencia en GPU T4 tarda ~10-20 ms; en CPU moderna, ~100-300 ms. El throughput en GPU puede superar los 100 documentos por segundo con batching.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Métrica principal | Licencia |
|---|---|---|---|---|---|
| **agusnieto77/beto-conflict-classifier** | BERT base (BETO cased) | 110M | 512 tokens/ventana | F2 CONFLICTO 0,914 | Apache 2.0 |
| agusnieto77/qwen2.5-1.5b-conflict-classifier | Qwen 2.5 (LLM decoder) | 1,5B | 32K tokens | no disponible | Apache 2.0 |
| dccuchile/bert-base-spanish-wwm-cased (base) | BERT base | 110M | 512 tokens | sin fine-tuning específico | Apache 2.0 |

El clasificador BETO es más ligero y rápido que el clasificador Qwen del mismo autor, y no requiere prompt con la definición operacional. El modelo Qwen, al ser un LLM, puede manejar contextos más largos sin ventanas y podría generalizar mejor a otros dominios, pero es ~14 veces más grande. La comparación con otros clasificadores de conflictos (como `baobabtech/water-conflict-classifier`, centrado en conflictos hídricos) no es directa por la diferencia de dominio y tarea.

## Limitaciones y advertencias

- **Dominio restringido**: entrenado exclusivamente con noticias locales argentinas. Su rendimiento puede degradarse en otras variedades del español (España, México, Chile) o en contextos no periodísticos.
- **Desequilibrio de clases**: el dataset tiene solo 22,2% de casos positivos. Aunque se usó F2 para mitigar el sesgo, la precisión de la clase CONFLICTO es notablemente menor (0,765) que el recall, lo que implica **273 falsos positivos** en la validación OOF.
- **Riesgo de alucinación contextual**: al ser un clasificador basado en BERT, no genera texto, pero puede asignar la etiqueta `CONFLICTO` a noticias que mencionan conflictos pasados o que usan lenguaje metafórico sin un acto colectivo real.
- **Definición operacional específica**: el modelo sigue una taxonomía v5 muy concreta. Casos como "conflicto puramente militar" o "contienda político-institucional ordinaria" se consideran `NO_CONFLICTO`, lo que puede no alinearse con otras definiciones de conflicto social.
- **Umbral ajustable**: el valor por defecto (0,52) está optimizado para F2. Si se necesita mayor precisión, hay que subir el umbral, sacrificando recall.
- **Sin soporte de cuantización oficial**: no se publican pesos cuantizados (GGUF, AWQ, GPTQ). Para despliegue en edge habría que exportar a ONNX con cuantización dinámica.
- **Licencia Apache 2.0**: permite uso comercial sin restricciones, pero el modelo no incluye garantías de exactitud ni responsabilidad por uso en contextos de alto riesgo (por ejemplo, decisiones legales o políticas automatizadas).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agusnieto77/beto-conflict-classifier
- Dataset de entrenamiento: https://huggingface.co/datasets/agusnieto77/conflicto-social-noticias-4034
- Demo interactiva: https://huggingface.co/spaces/agusnieto77/beto-conflict-classifier-demo
- Demo web alternativa: https://clasificador-beto.laboratoriodehumanidadesdigitales.ar
- Demo del clasificador Qwen (LoRA): https://clasificador.laboratoriodehumanidadesdigitales.ar
- Perfil de GitHub del autor: https://github.com/agusnieto77
