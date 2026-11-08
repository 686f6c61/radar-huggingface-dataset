# DavidVargas-Ctrl/menos-odio-v5-multitarea

## Resumen

`menos-odio-v5-multitarea` es un modelo de clasificación de texto en español para detección de contenido ofensivo, desarrollado por el usuario DavidVargas-Ctrl. Se construye sobre el encoder `pysentimiento/robertuito-base-uncased` (RoBERTuito, un transformer tipo BERT entrenado con tuits en español) y añade tres cabezas de clasificación independientes y no excluyentes: `vulgaridad`, `insulto` y `odio_grupal`. El modelo acepta un contexto opcional (por ejemplo, el titular de una noticia o el mensaje previo de una conversación) y devuelve probabilidades calibradas por cabeza.

El modelo aborda un problema clásico en moderación de contenido: la detección de discurso de odio depende fuertemente del contexto y de la variante dialectal. La propuesta aquí es separar tres dimensiones que suelen confundirse (vulgaridad, insulto y odio dirigido a un grupo) y permitir que el contexto textual module la predicción. El entrenamiento combina dos corpus en español: `piuba-bigdata/contextualized_hate_speech` (español rioplatense, temática pandémica) para la cabeza de odio grupal y `SINAI/OffendES` (comentarios sobre influencers) para vulgaridad e insulto.

Es relevante ahora porque los modelos de moderación multilingües suelen tener un rendimiento pobre en español y, en particular, en variantes dialectales no peninsulares. Este modelo es un ejemplo de ajuste fino ligero (aprox. 13 minutos en una GPU de Colab) sobre un encoder pequeño, con calibración por temperatura y evaluación honesta de limitaciones. No obstante, se trata de un modelo experimental con métricas frágiles en dos de sus tres cabezas y licencia sin verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTuito base, tipo BERT) con tres cabezas de clasificación multicapa |
| Parametros totales | no disponible (el modelo base RoBERTuito base es de aproximadamente 110 M, pero la ficha no lo declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (max length usado en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | es (español) |
| Licencia | no disponible (pendiente de verificar por licencias contradictorias en `SINAI/OffendES`) |
| Formato de pesos | no disponible (se carga mediante la clase `Predictor` de `multitarea_es.py`, no es un modelo estándar de `transformers`) |

## Arquitectura y entrenamiento

La arquitectura parte de RoBERTuito base, un encoder transformer de tipo BERT entrenado sobre grandes volúmenes de tuits en español. Sobre la representación del token `[CLS]` (o la pooling que use la implementación de `Predictor`) se montan tres cabezas independientes que se entrenan de forma conjunta con pérdida BCE enmascarada: cada fuente de datos solo entrena las cabezas que anota, de modo que `odio_grupal` se entrena con `piuba-bigdata/contextualized_hate_speech` y `vulgaridad` e `insulto` con `SINAI/OffendES`. El modelo acepta una entrada de dos segmentos (texto y contexto opcional), lo que permite condicionar la predicción al mensaje previo o al titular de la noticia.

El entrenamiento se realizó en una GPU de Colab durante aproximadamente 778 segundos (unos 13 minutos) en noviembre de 2026, con 4 épocas, batch 16 con acumulación de gradiente 2, learning rate 2e-5, max length 128 y semilla 42; el mejor checkpoint fue el de la época 3. Se aplicó aumentación con perturbaciones ortográficas, vista normalizada y descarte aleatorio de contexto, y preprocesado mediante `pysentimiento.preprocessing.preprocess_tweet(lang="es")`. La calibración se hizo con temperatura por cabeza (0,90 para vulgaridad, 1,43 para insulto y 1,35 para odio grupal), ajustada únicamente sobre DEV_EVAL. La partición de `odio_grupal` se hizo por artículo con semilla 42 para evitar fuga de información entre fragmentos del mismo documento.

## Capacidades

- Clasificación multi-etiqueta de texto en español en tres dimensiones no excluyentes: vulgaridad, insulto y odio grupal.
- Acepta contexto opcional (titular de noticia o mensaje previo) como segundo segmento de entrada, lo que permite desambiguar expresiones que dependen del hilo conversacional.
- Devuelve probabilidades calibradas por cabeza, con umbrales de decisión ajustados por cabeza (0,302 para vulgaridad, 0,351 para insulto y 0,824 para odio grupal).
- Entrenado específicamente sobre español rioplatense y comentarios de redes sociales, con preprocesado orientado a texto informal (tuits y comentarios).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador de texto, no un modelo generativo.
- No tiene capacidades de visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al español; no se declaran otros idiomas.

## Casos de uso

- Moderación de comentarios en plataformas en español: el modelo puede puntuar cada comentario en las tres dimensiones y aplicar umbrales distintos según la política de la comunidad, separando lo que es mera vulgaridad de lo que es un insulto dirigido o un discurso de odio grupal.
- Filtrado previo en foros y secciones de noticias: al aceptar el titular como contexto, permite detectar comentarios que solo resultan ofensivos a la luz de la noticia comentada, reduciendo falsos positivos en textos aislados.
- Análisis de toxicidad en campañas de redes sociales: con max length 128 y un encoder de ~110 M de parámetros, el coste de inferencia es bajo y permite procesar lotes grandes de comentarios en CPU o en una GPU consumer.
- Investigación en lingüística computacional: la separación explícita de las tres cabezas facilita estudiar la correlación entre vulgaridad, insulto y odio grupal en corpus dialectales del español.
- Sistemas de alerta temprana para equipos de confianza y seguridad: las probabilidades calibradas permiten priorizar la revisión humana por encima de un umbral, en lugar de usar una clasificación binaria rígida.
- Enriquecimiento de datasets: el modelo puede etiquetar automáticamente grandes volúmenes de comentarios en español para construir corpus anotados de forma débil, que luego se revisen manualmente.

## Benchmarks y rendimiento

Los únicos datos disponibles son de DEV_EVAL; el conjunto de TEST no fue evaluado. Las cifras de `vulgaridad` e `insulto` proceden de conjuntos con muy pocas filas y el propio autor advierte que no son evidencia de desempeño.

| Cabeza | n | Positivos | Precision | Recall | F1 | AUC | Umbral |
|---|---:|---:|---:|---:|---:|---:|---:|
| vulgaridad | 37 | 7 | 1,000 | 1,000 | 1,000 | 1,000 | 0,302 |
| insulto | 48 | 11 | 0,900 | 0,818 | 0,857 | 0,961 | 0,351 |
| odio_grupal | 4.517 | 548 | 0,754 | 0,664 | 0,706 | 0,932 | 0,824 |

Comparación con `tatisvivass/menos-odio-a3-robertuito` sobre las mismas filas de `odio_grupal`: F1 de 0,706 frente a 0,689, con ΔF1 = +0,016 e intervalo de confianza al 95 % de [−0,012; 0,045]. El autor concluye que no hay diferencia detectable entre ambos modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita, pero al tratarse de un encoder base de ~110 M de parámetros en fp32 ocupa en torno a 0,4 GB (tamaño del repositorio), por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; para lotes grandes se recomienda una RTX 3060 o superior. Una GPU de Colab estándar (T4) fue suficiente para el entrenamiento completo en 778 segundos.
- Cabe en GPU consumer: sí, en cualquier GPU moderna (GTX 1650, RTX 3060, RTX 4090, etc.) e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: al no ser un modelo estándar de `transformers`, no se puede cargar directamente con vLLM, TGI, llama.cpp u Ollama. El despliegue debe hacerse con la clase `Predictor` de `multitarea_es.py` sobre PyTorch, o exportando el modelo a un formato estándar de `transformers` (no documentado en la ficha).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 odio_grupal (DEV_EVAL) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `DavidVargas-Ctrl/menos-odio-v5-multitarea` | no disponible (~110 M base) | 128 | 0,706 | no disponible | Hugging Face, 0 descargas |
| `tatisvivass/menos-odio-a3-robertuito` | no disponible (RoBERTuito base) | no disponible | 0,689 | no disponible | Hugging Face |
| `pysentimiento/robertuito-base-uncased` | ~110 M | 128 | no disponible (modelo base, sin cabeza de odio) | no disponible | Hugging Face, ampliamente usado |

La comparación directa solo existe frente a `tatisvivass/menos-odio-a3-robertuito`, con una diferencia de F1 no significativa. Frente a alternativas más grandes o multilingües (por ejemplo, clasificadores basados en XLM-R o Llama) no se han publicado comparaciones en la información disponible.

## Limitaciones y advertencias

- Los estereotipos regionales colombianos no se reconocen de forma fiable: la frase "Todos los costeños son perezosos" obtiene 0,42 en `odio_grupal`, por debajo del umbral de 0,824. El modelo está entrenado con datos rioplatenses y de comentarios de influencers, no con datos colombianos.
- Las métricas de `vulgaridad` e `insulto` se calculan sobre 37 y 48 filas respectivamente, con 7 y 11 positivos; no son evidencia de desempeño y no deben usarse para decisiones de producción.
- El conjunto de TEST no fue evaluado, por lo que no hay estimación independiente del rendimiento real.
- El efecto del contexto en las cabezas de vulgaridad e insulto es una observación por confirmar: esas cabezas no se entrenaron con contexto etiquetado.
- Marca como vulgares algunos usos educativos, periodísticos o negados (por ejemplo, citas o explicaciones sobre lenguaje ofensivo).
- Riesgo de alucinación no aplica en el sentido generativo, pero sí hay riesgo de falsos positivos y falsos negativos en la clasificación, especialmente en variantes dialectales no representadas en el entrenamiento.
- La licencia está pendiente de verificar: la ficha de `SINAI/OffendES` declara licencias contradictorias y estos pesos derivan en parte de ese conjunto, lo que impide confirmar el uso comercial.
- No sustituye la moderación humana; el propio autor lo indica explícitamente.
- El modelo no es un modelo estándar de `transformers`: requiere la clase `Predictor` de `multitarea_es.py`, lo que complica su integración en pipelines convencionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidVargas-Ctrl/menos-odio-v5-multitarea
- Space demo: https://huggingface.co/spaces/DavidVargas-Ctrl/menos-odio-a-la-vista
- Modelo base: https://huggingface.co/pysentimiento/robertuito-base-uncased
- Modelo comparado: https://huggingface.co/tatisvivass/menos-odio-a3-robertuito
- Dataset de odio grupal: https://huggingface.co/datasets/piuba-bigdata/contextualized_hate_speech
- Dataset de vulgaridad e insulto: https://huggingface.co/datasets/SINAI/OffendES
