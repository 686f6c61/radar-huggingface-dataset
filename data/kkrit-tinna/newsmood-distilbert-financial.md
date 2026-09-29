# kkrit-tinna/newsmood-distilbert-financial

## Resumen

`kkrit-tinna/newsmood-distilbert-financial` es un clasificador de sentimiento financiero en ingles construido mediante ajuste fino (*fine-tuning*) de `distilbert-base-uncased` sobre el corpus Financial PhraseBank. El modelo etiqueta texto en tres clases: negativo, neutral y positivo. No es un modelo generativo: su salida es una distribucion de probabilidad sobre esas tres categorias.

El modelo forma parte del proyecto `newsmood`, una herramienta de linea de comandos que genera un informe diario de "estado de animo del mercado" a partir de fuentes RSS publicas. Dentro de ese pipeline, este DistilBERT actua como el componente de puntuacion de sentimiento de los titulares recopilados. Es, por tanto, un modelo de proposito muy concreto, no una alternativa generalista a los LLM.

Con 66.955.779 parametros (~67 millones) y un tamano de repositorio de 0,3 GB, es un modelo ligero que cabe holgadamente en CPU y en cualquier GPU de consumo. Su relevancia practica esta en el coste de inferencia muy bajo y en un rendimiento declarado de 92,08 % de exactitud y 90,19 % de macro-F1 en el conjunto de test reservado, muy por encima de una linea base TF-IDF + regresion logistica (83,59 % de exactitud). La licencia del modelo no esta declarada, lo que supone una limitacion importante de cara a uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder destilado (DistilBERT), 6 capas, 12 cabezas de atencion, dimension oculta 768, mas cabeza de clasificacion de 3 clases |
| Parametros totales | 66.955.779 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (limite de posiciones de `distilbert-base-uncased`) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones especificas; al ser un modelo de 67 M de parametros la cuantizacion es opcional) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT: un encoder transformer destilado a partir de BERT-base, con la mitad de capas (6 en lugar de 12) y aproximadamente un 40 % menos de parametros, manteniendo la dimension oculta de 768 y 12 cabezas de atencion. Sobre el token `[CLS]` se anade una cabeza de clasificacion lineal que proyecta a tres clases (negativo, neutral, positivo). La tokenizacion es WordPiece con un vocabulario de 30.522 entradas, heredado de `distilbert-base-uncased`, por lo que el texto se normaliza a minusculas.

El ajuste fino se realizo exclusivamente sobre la configuracion `sentences_75agree` de Financial PhraseBank, que contiene 3.453 frases anotadas por analistas con un acuerdo entre anotadores de al menos el 75 %. El reparto fue 70/15/15 estratificado con semilla 42. Los pesos publicados corresponden a la epoca 3 de 3, seleccionados por perdida de validacion. No se documenta en la informacion disponible el uso de RLHF, DPO ni ninguna tecnica de alineacion adicional; se trata de un ajuste fino supervisado clasico. Tampoco se documentan tecnicas de decodificacion especulativa ni variantes de atencion (el modelo no genera texto).

## Capacidades

- Clasificacion de sentimiento financiero en tres clases (negativo, neutral, positivo) para texto en ingles.
- Trabaja a nivel de frase o titular corto; la salida es una etiqueta con su distribucion de probabilidad.
- Rendimiento declarado destacado en la clase minoritaria: *recall* de 0,9683 en la clase negativa, lo que indica que no se limita a predecir la clase mayoritaria.
- Integrable como componente de un pipeline mayor (el caso de uso documentado es el CLI `newsmood` sobre feeds RSS).
- No soporta *tool calling*, ni *function calling*, ni agentes, ni razonamiento multi-paso: es un modelo de clasificacion, no de generacion.
- No dispone de modo *thinking*, ni vision, ni audio, ni generacion de codigo o matematicas.
- Multilingue: no. Entrenado y evaluado unicamente en ingles.

## Casos de uso

- Monitorizacion de sentimiento de noticias financieras en tiempo real: el modelo puntua titulares de RSS o APIs de noticias y alimenta un indicador agregado de animo de mercado, que es exactamente el escenario para el que fue construido en el proyecto `newsmood`.
- Filtrado y priorizacion de alertas para mesas de analisis: dentro de un flujo con cientos de titulares diarios, el modelo marca los negativos (con *recall* declarado de 0,9683) para que un analista humano revise solo el subconjunto relevante.
- Enriquecimiento de bases de datos historicas de noticias: etiquetar retroactivamente decadas de archivos de prensa economica con tres clases de sentimiento para estudios cuantitativos.
- Preprocesamiento para modelos mayores: usar este DistilBERT como clasificador barato que decida que documentos merecen pasar a un LLM generativo mas costoso para resumen o analisis profundo.
- Sistemas de *scoring* de carteras basados en noticias: agregar el sentimiento de todos los titulares asociados a un ticker en una ventana temporal y combinarlo con senales de precio (siempre como senal auxiliar, no como prediccion).
- Investigacion academica sobre modelos destilados: al ser un ajuste fino reproducible sobre Financial PhraseBank con semilla fijada, sirve como punto de comparacion frente a DistilRoBERTa o FinBERT en estudios de eficiencia de modelos destilados para sentimiento financiero.
- Despliegue en entornos con recursos muy limitados: al ocupar alrededor de 0,3 GB en coma flotante de 32 bits, puede ejecutarse en contenedores pequenos, en CPU o incluso en dispositivos de borde, sin GPU dedicada.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el *split* de test reservado (n = 518):

| Metodo | Exactitud | Macro-F1 | *Recall* clase negativa |
|---|---|---|---|
| Clase mayoritaria | 62,16 % | 25,56 % | 0,00 % |
| TF-IDF + regresion logistica | 83,59 % | 79,97 % | 77,78 % |
| Este modelo | 92,08 % | 90,19 % | 96,83 % |

El autor advierte que el rendimiento sobre titulares reales de prensa se mide por separado en el repositorio de `newsmood`, y que esos resultados no se incluyen en la model card. No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, GLUE o HumanEval: no procede aplicarlos, dado que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,27 GB solo para los pesos en fp32; en torno a 0,13-0,15 GB si se convierte a fp16 o int8. Con *batches* pequenos y contexto corto, el consumo total se mantiene por debajo de 1 GB.
- GPU recomendadas: cualquiera con mas de 1-2 GB de VRAM es suficiente (GTX 1650, RTX 3060, T4, L4). Para procesamiento por lotes de alto volumen, una T4 o L4 permite maximizar el *throughput* por vatio.
- Cabe sin problema en GPU de consumo: si, en practicamente cualquier GPU moderna, y tambien en CPU. Un solo nucleo de CPU es suficiente para inferencia interactiva sobre titulares cortos.
- Opciones de despliegue: `transformers` (biblioteca declarada), exportacion a ONNX Runtime, TensorFlow Lite o TorchScript para entornos sin Python, y servicio HTTP mediante Hugging Face Inference Endpoints (el repositorio lleva la etiqueta `endpoints_compatible`). El repositorio tambien lleva la etiqueta `text-embeddings-inference`, aunque la tarea real es clasificacion de texto, no generacion de *embeddings*.
- Latencia y *throughput*: no disponibles. No se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `kkrit-tinna/newsmood-distilbert-financial` | 66,96 M | 512 | en | no disponible | 92,08 % de exactitud y 90,19 % de macro-F1 en su test (n = 518) |
| `mr8488/distilroberta-finetuned-financial-news-sentiment-analysis` | no disponible | no disponible | no disponible | no disponible | Ajuste de `distilroberta-base` sobre Financial PhraseBank; la busqueda web confirma su existencia y su enfoque, pero no se han recuperado sus cifras |
| `ProsusAI/finbert` | no disponible | no disponible | no disponible | no disponible | FinBERT, ajustado sobre Financial PhraseBank y otros corpus; aparece citado en la busqueda web como referencia habitual de la tarea |

Los resultados numericos de los modelos comparados no estaban disponibles en la informacion proporcionada, por lo que no se incluye una comparacion cuantitativa. Conviene senalar que el conjunto de test es pequeno (518 ejemplos) y que las diferencias de unos pocos puntos porcentuales entre modelos pueden no ser estadisticamente significativas.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica ninguna licencia en el repositorio. Ademas, el corpus de entrenamiento (Financial PhraseBank) se distribuye bajo CC BY-NC-SA 3.0, lo que anade una restriccion de uso no comercial sobre los datos. Antes de cualquier uso en produccion o comercial es imprescindible aclarar ambos extremos con el autor.
- Dominio y estilo: el modelo se entreno con frases redactadas por analistas, no con titulares de prensa. El propio autor advierte que el rendimiento sobre titulares reales se evalua aparte, lo que implica una posible perdida de calidad fuera de distribucion.
- Sesgo de conjunto de datos: Financial PhraseBank es un corpus pequeno (3.453 frases en la configuracion usada), de dominio financiero y probablemente sesgado hacia el ingles de mercados desarrollados y hacia el estilo de un numero reducido de fuentes.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificaciones erroneas con alta confianza, especialmente en textos ironicos, ambiguos o con negaciones complejas.
- Limitacion de contexto: 512 tokens. Los documentos largos deben truncarse o dividirse, lo que puede alterar el sentimiento global del texto.
- Solo ingles: cualquier texto en otro idioma producira etiquetas sin significado fiable.
- Advertencia explicita del autor: el modelo etiqueta el sentimiento del texto, no predice precios ni rentabilidades. No constituye asesoramiento financiero.
- Trazabilidad: el repositorio tiene 0 descargas y 0 *likes* en el momento de la consulta, y la model card indica que la ficha completa esta "en progreso". La validacion externa es practicamente inexistente.
- No es un modelo generativo: no admite instrucciones, ni conversacion, ni *tool calling*. Usarlo fuera de la tarea de clasificacion de sentimiento no es apropiado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kkrit-tinna/newsmood-distilbert-financial
- Repositorio del proyecto newsmood: https://github.com/kkrit-tinna/Newsmood
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Alternativa comparable (DistilRoBERTa financiero): https://huggingface.co/mr8488/distilroberta-finetuned-financial-news-sentiment-analysis
- Estudio sobre modelos transformer destilados para sentimiento financiero: https://rjpn.org/ijcspub/papers/IJCSP24B1335.pdf
