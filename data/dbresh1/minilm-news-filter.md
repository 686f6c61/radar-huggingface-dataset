# DBresh1/minilm-news-filter

## Resumen

`DBresh1/minilm-news-filter` es un clasificador binario de titulares de noticias desarrollado por el usuario DBresh1. Se trata de un fine-tuning del encoder multilingue `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` mediante SetFit, una tecnica de ajuste eficiente en pocos ejemplos que combina el entrenamiento contrastivo del encoder con una cabeza de regresion logistica. El modelo decide si un titular debe mostrarse (clase 1) u omitirse (clase 0) segun las preferencias personales del autor, y esta orientado a titulares en ucraniano y ruso.

El modelo resuelve un problema muy acotado: filtrar noticias segun un criterio subjetivo de relevancia personal. No es un modelo de relevancia general ni un clasificador tematico, sino un artefacto entrenado sobre un conjunto de datos pequeno (213 URLs distintas) con etiquetas generadas por anotacion de IA y consolidadas por voto mayoritario. Su publicacion es relevante como ejemplo de pipeline SetFit reproducible y como caso de estudio de las limitaciones de los clasificadores entrenados con datos escasos y sesgados.

Arquitectonicamente es un transformer BERT de tipo MiniLM con 117,6 millones de parametros totales, contexto de entrada limitado a 96 tokens durante el entrenamiento y una cabeza de clasificacion sklearn serializada junto al encoder. La licencia es Apache-2.0, aunque el autor advierte que los titulares y valoraciones personales originales no se incluyen en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLM, familia BERT) + cabeza de regresion logistica SetFit |
| Parametros totales | 117.653.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 96 tokens (longitud maxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ucraniano (uk), ruso (ru) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (encoder) + artefacto sklearn para la cabeza (libreria setfit) |

## Arquitectura y entrenamiento

El modelo parte del encoder multilingue `paraphrase-multilingual-MiniLM-L12-v2`, un transformer de 12 capas y 117,6 millones de parametros, y aplica SetFit: primero un ajuste contrastivo sobre pares de frases para refinar las representaciones, y despues el entrenamiento de una cabeza de regresion logistica sobre los embeddings resultantes. El entrenamiento del cuerpo (body) uso una tasa de aprendizaje de 2e-5, tamano de lote 16, 80 pasos y longitud maxima de 96 tokens.

Los datos de entrenamiento consisten en 213 URLs distintas con titulares en ucraniano y ruso. Las etiquetas provienen de anotaciones de IA repetidas sobre la misma URL, consolidadas por voto mayoritario; en caso de empate se usa la anotacion mas reciente. La variante publicada es la denominada "mixed". No se documenta uso de RLHF ni DPO, ni se especifica el volumen total de tokens de entrenamiento. El modelo incluye el encoder completo y la cabeza de clasificacion, por lo que es un artefacto autocontenido listo para inferencia con la libreria `setfit`.

## Capacidades

- Clasificacion binaria de titulares de noticias: clase 0 (omitir) y clase 1 (mostrar).
- Prediccion de probabilidad por titular mediante `predict_proba`, con umbral recomendado de 0,7000000000000001 seleccionado en validacion.
- Procesamiento de texto en ucraniano y ruso.
- Inferencia en CPU (el ejemplo de uso del autor especifica `device="cpu"`).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- No es un modelo generativo: no produce texto, solo una etiqueta y una probabilidad.

## Casos de uso

- Filtrado personal de feeds RSS: integrar el modelo en un agregador que reciba titulares en ucraniano o ruso y descarte aquellos con probabilidad inferior al umbral 0,7, reduciendo el ruido en la bandeja de entrada del usuario.
- Priorizacion de alertas en un lector de noticias: ordenar los titulares por la probabilidad devuelta por `predict_proba` para que los mas afines al perfil aparezcan primero.
- Experimentacion con SetFit: servir como referencia reproducible de un pipeline de clasificacion few-shot con encoder multilingue y cabeza logistica, util para comparar tecnicas de ajuste eficiente.
- Prototipado de sistemas de recomendacion de noticias: usar el clasificador como componente inicial de un sistema de personalizacion antes de invertir en un modelo mayor o en datos propios.
- Moderacion o curaduria editorial a pequena escala: aplicar el filtro a boletines internos con titulares en ucraniano o ruso, siempre con revision humana dado el bajo recall de la clase positiva.
- Investigacion sobre sesgos en clasificadores entrenados con pocos datos: analizar como un conjunto de 213 URLs y etiquetas generadas por IA produce un modelo con precision y recall muy bajos en la clase positiva.
- Filtrado por lotes en CPU: al ser un MiniLM de 117 millones de parametros, puede ejecutarse en entornos sin GPU para clasificar lotes de titulares con latencia baja.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son los de evaluacion sobre un conjunto de test humano compartido de 40 titulares:

| Metrica | Valor |
|---|---|
| Macro-F1 | 0,427 |
| Precision clase "show" | 0,200 |
| Recall clase "show" | 0,077 |
| Macro-F1 antes del fine-tuning del body | 0,467 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El propio autor advierte que el test es pequeno, ha sido reutilizado para comparar modelos y que algunos prompts del profesor incluyeron ejemplos valorados por humanos, por lo que los resultados no establecen relevancia general de noticias.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 117,6 millones de parametros del encoder; el modelo puede ejecutarse en CPU sin GPU.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) acelera el procesamiento por lotes, aunque no es necesaria.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: `setfit` (libreria nativa), `sentence-transformers` para el encoder y `scikit-learn` para la cabeza; tambien puede exportarse a ONNX para inferencia optimizada, aunque no se documenta en la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DBresh1/minilm-news-filter | 117,6 M | 96 tokens | Clasificacion binaria de titulares (uk, ru) | Apache-2.0 | Hugging Face |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | 117,6 M | 128 tokens (tipico del encoder) | Embeddings multilingues | Apache-2.0 | Hugging Face |
| Clasificadores SetFit genericos sobre MiniLM | ~117 M | variable | Clasificacion de texto few-shot | Apache-2.0 (segun base) | Hugging Face |

No se dispone de datos de rendimiento comparables de alternativas especificas para filtrado de noticias en ucraniano y ruso en la informacion proporcionada.

## Limitaciones y advertencias

- El conjunto de entrenamiento es muy pequeno (213 URLs) y las etiquetas provienen de anotaciones de IA, no de juicio humano directo en su totalidad.
- El rendimiento en la clase positiva es muy bajo: precision 0,200 y recall 0,077, lo que implica muchos falsos positivos y muchos falsos negativos.
- El Macro-F1 empeoro tras el fine-tuning del body (de 0,467 a 0,427), lo que sugiere sobreajuste o ruido en las etiquetas.
- El test de 40 titulares ha sido reutilizado para comparar modelos y algunos prompts del profesor incluyeron ejemplos valorados por humanos, por lo que las metricas estan contaminadas.
- El clasificador solo ve titulares, y algunas etiquetas dependen de noticias leidas previamente, un contexto que el modelo no puede observar.
- Los resultados no establecen relevancia general de noticias; el modelo refleja preferencias personales del autor.
- Idiomas limitados a ucraniano y ruso; no se garantiza comportamiento en otros idiomas.
- Longitud maxima de 96 tokens, suficiente para titulares pero no para cuerpos de noticia.
- Aunque la licencia es Apache-2.0, el autor indica que no se especifico una licencia de redistribucion separada para los titulares de noticias de origen, lo que puede afectar a usos que reproduzcan esos datos.
- Riesgo de sesgo derivado de las preferencias personales del autor y del proceso de anotacion por IA.
- No apto para produccion sin validacion adicional sobre un conjunto de datos propio y representativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DBresh1/minilm-news-filter
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Libreria SetFit: https://github.com/huggingface/setfit
- Documentacion de SetFit: https://huggingface.co/docs/setfit
