# AbdelrahmanAkl/bart-cnn-dailymail-summarization

## Resumen

El modelo `AbdelrahmanAkl/bart-cnn-dailymail-summarization` es un ajuste fino de `facebook/bart-base` para resumen abstractivo de articulos periodisticos en ingles. Lo desarrolla AbdelrahmanAkl y esta entrenado sobre un subconjunto controlado del corpus CNN/DailyMail 3.0.0, con 8.000 ejemplos de entrenamiento, 1.000 de validacion y 1.000 de test, seleccionados con semilla fija 42 para garantizar reproducibilidad. Con 139 millones de parametros, es un modelo pequeno y desplegable en hardware muy modesto, orientado a demostraciones, experimentacion y aplicaciones ligeras de resumen.

Su relevancia practica es la de un caso de referencia completo de extremo a extremo: fine-tuning con `Seq2SeqTrainer`, seleccion de checkpoint por perdida de validacion, optimizacion de los hiperparametros de decodificacion sobre validacion y evaluacion final sobre un test aislado, con una comparativa explicita frente al modelo base sin ajustar. El autor reporta una mejora absoluta de +0,055 en ROUGE-Lsum atribuible al fine-tuning, y de solo +0,0004 adicional atribuible a la optimizacion de la generacion, un resultado interesante porque cuantifica por separado el efecto de ambas fases.

El modelo es de proposito general dentro del resumen extractivo y abstractivo de noticias en ingles. No incluye licencia declarada en la model card ni en los metadatos de HuggingFace, y cuenta con cero descargas y cero likes en el momento de la consulta, por lo que debe considerarse un artefacto de portafolio mas que un modelo con validacion externa de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BART (transformer encoder-decoder secuencia a secuencia) |
| Parametros totales | 139.420.416 segun la model card; 139.470.681 segun los metadatos de safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | entrada maxima 1.024 tokens; salida maxima 128 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas) |
| Idiomas soportados | ingles |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamano del repositorio: 0,6 GB) |

## Arquitectura y entrenamiento

La arquitectura es BART estandar en su variante base de `facebook/bart-base`: un transformer encoder-decoder con preentrenamiento denoising (corrupcion de texto y reconstruccion), habitual en tareas de resumen y traduccion. El modelo hereda el tokenizador BART y el vocabulario del checkpoint base; el autor no modifica la arquitectura, solo ajusta los pesos sobre la tarea de resumen. La configuracion declarada de fine-tuning es: 2 epocas, tasa de aprendizaje 5e-5, batch de entrenamiento 2 con 8 pasos de acumulacion de gradiente (batch efectivo 16), weight decay 0,01, 100 pasos de warmup, FP16 activado, gradient checkpointing activado y evaluacion cada 500 pasos. El mejor checkpoint fue `checkpoint-1000`, seleccionado por perdida de validacion de 1,757423, y fue recargado y validado de forma independiente antes del empaquetado final.

Los articulos se tokenizaron con longitud maxima de entrada de 1.024 tokens y los resumenes de referencia con longitud maxima de 128 tokens; los articulos que excedian el limite se truncaron, lo que implica perdida de informacion en documentos largos. El dataset de origen, CNN/DailyMail 3.0.0, contiene 287.113 ejemplos de entrenamiento, 13.368 de validacion y 11.490 de test, de los cuales este modelo usa una fraccion reducida (8.000 / 1.000 / 1.000). No se documenta ninguna fase de RLHF, DPO ni ajuste por preferencias; es un ajuste supervisado clasico sobre pares articulo-resumen. La configuracion de generacion optimizada en validacion fue `num_beams=4`, `length_penalty=1.0`, `no_repeat_ngram_size=3`, `max_length=128` y `early_stopping=True`, seleccionada porque `no_repeat_ngram_size=3` produjo el mejor ROUGE-Lsum en validacion.

## Capacidades

- Generacion de resumenes abstractivos de articulos periodisticos en ingles, con entrada de hasta 1.024 tokens y salida de hasta 128 tokens.
- Reformulacion y compresion de texto: al ser un modelo abstractivo puede generar frases que no aparecen literalmente en el origen, a diferencia de los enfoques extractivos.
- Generacion condicionada con busqueda por haces (beam search) y penalizacion de repeticiones mediante `no_repeat_ngram_size`.
- Traduccion y otras tareas seq2seq heredadas del preentrenamiento BART: no estan documentadas ni evaluadas por el autor, por lo que su calidad en esas tareas es desconocida.
- Soporte de tool calling o function calling: no disponible, no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible, no documentado. Es un modelo seq2seq puro sin modo de razonamiento explicito.
- Capacidades multilingues: no. El autor declara unicamente ingles, y el ajuste fino se ha hecho solo sobre corpus en ingles.
- Capacidades de vision o audio: no disponibles.
- Capacidades especiales: no se documenta modo thinking, ni atencion lineal, ni decodificacion especulativa.

## Casos de uso

- Resumen automatico de noticias para agregadores de contenido: el modelo convierte un articulo de hasta 1.024 tokens en un resumen de hasta 128 tokens, adecuado para generar entradillas o sumarios en portales de noticias. Es apropiado porque el ajuste fino esta hecho exactamente sobre el dominio CNN/DailyMail.
- Demostracion docente de un pipeline seq2seq completo: sirve para ilustrar tokenizacion, fine-tuning con `Seq2SeqTrainer`, seleccion de checkpoint por perdida de validacion, decodificacion con beam search y evaluacion con ROUGE. El autor incluye una aplicacion Streamlit desplegada como demo interactiva.
- Preprocesado de boletines y newsletters internas en ingles: resumir comunicaciones corporativas largas antes de enviarlas a equipos, con la ventaja de que el modelo cabe en una GPU de consumo e incluso puede ejecutarse en CPU para volumenes bajos.
- Generacion de meta-descripciones y snippets: producir resumenes breves para fichas de articulos, resultados de busqueda o tarjetas de previsualizacion en aplicaciones editoriales.
- Filtrado y triaje de documentacion: reducir documentos en ingles a un resumen de 128 tokens para que un revisor humano decida rapidamente si merece lectura completa, en flujos de revision legal, tecnica o academica.
- Baseline para experimentos de investigacion en resumen: al ser un BART-base ajustado sobre un subconjunto pequeno y reproducible, es util como punto de partida controlado para comparar tecnicas de decodificacion, tecnicas de truncado o conjuntos de datos.
- Componente en pipelines de procesamiento por lotes: con 139 millones de parametros puede ejecutarse en paralelo sobre lotes grandes de articulos en una sola GPU, integrado en procesos nocturnos de resumen masivo.
- Prototipado rapido en aplicaciones de portafolio: el modelo es lo bastante pequeno y rapido para iterar sobre interfaces y no sobre infraestructura, como demuestra el despliegue en Streamlit.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son los de ROUGE sobre 1.000 ejemplos de test de CNN/DailyMail, comparando el modelo base sin ajustar con el modelo ajustado, y despues el ajustado con su configuracion de generacion inicial frente a la optimizada. Los valores estan en escala 0-1.

| Metrica | BART base | Ajustado (config. original) | Ajustado (config. optimizada) |
|---|---|---|---|
| ROUGE-1 | 0,392200 | 0,406423 | 0,407043 |
| ROUGE-2 | 0,176266 | 0,180911 | 0,181450 |
| ROUGE-L | 0,245521 | 0,276005 | 0,276308 |
| ROUGE-Lsum | 0,319560 | 0,374562 | 0,374985 |

| Metrica | Base BART | Ajustado original | Cambio absoluto |
|---|---|---|---|
| ROUGE-1 | 0,392200 | 0,406423 | +0,014223 |
| ROUGE-2 | 0,176266 | 0,180911 | +0,004645 |
| ROUGE-L | 0,245521 | 0,276005 | +0,030484 |
| ROUGE-Lsum | 0,319560 | 0,374562 | +0,055002 |

| Metrica | Ajustado original | Ajustado final | Cambio absoluto |
|---|---|---|---|
| ROUGE-1 | 0,406423 | 0,407043 | +0,000620 |
| ROUGE-2 | 0,180911 | 0,181450 | +0,000539 |
| ROUGE-L | 0,276005 | 0,276308 | +0,000303 |
| ROUGE-Lsum | 0,374562 | 0,374985 | +0,000423 |

El propio autor advierte en la model card que ROUGE mide solapamiento lexico entre resumenes generados y de referencia y no debe interpretarse como una medida directa de exactitud factual, tasa de alucinacion, coherencia o calidad global del resumen. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark generalista en la informacion disponible, y no procede compararlos porque el modelo no esta entrenado para esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,56 GB solo de pesos (139,47 millones de parametros x 4 bytes), mas activaciones y cache de atencion.
- VRAM estimada en FP16 o BF16: aproximadamente 0,28 GB de pesos. Es el modo usado en el entrenamiento (FP16 activado).
- VRAM estimada en INT8: aproximadamente 0,14 GB de pesos. No se publican pesos cuantizados; habria que generarlos.
- Con `num_beams=4` la memoria de activaciones y el coste de computo se multiplican aproximadamente por el numero de haces, por lo que conviene reservar margen sobre las cifras de pesos.
- GPU recomendadas: cualquier GPU moderna. Una RTX 3060, RTX 4060, RTX 4090, T4, L4, A10, A100 o H100 pueden ejecutarlo sin problema; las GPU de gama alta quedan sobredimensionadas para este tamano.
- Cabe sobradamente en GPU de consumo: si, en practicamente cualquier GPU con 4 GB o mas de VRAM, incluidas GTX 1650, RTX 3050 y superiores. Tambien es viable en CPU con `transformers` para cargas de trabajo de baja concurrencia.
- Opciones de despliegue: `transformers` con `pipeline("summarization")`, `Seq2SeqTrainer` para reentrenamiento, exportacion a ONNX Runtime, TorchScript, y el despliegue en Streamlit que ya usa el autor. No hay soporte documentado de vLLM, TGI, llama.cpp, Ollama ni GGUF para esta arquitectura en la informacion disponible; la conversion a GGUF para modelos BART seq2seq no esta documentada por el autor.
- Latencia y throughput estimados: no disponible. El autor no publica mediciones de latencia, tokens por segundo ni throughput por lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ROUGE en CNN/DailyMail | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AbdelrahmanAkl/bart-cnn-dailymail-summarization | 139,4 M | 1.024 tokens de entrada / 128 de salida | ROUGE-1 0,407 / ROUGE-2 0,181 / ROUGE-L 0,276 / ROUGE-Lsum 0,375 | no disponible | HuggingFace |
| facebook/bart-base (sin ajustar) | 139,4 M | 1.024 tokens | ROUGE-1 0,392 / ROUGE-2 0,176 / ROUGE-L 0,246 / ROUGE-Lsum 0,320 (medido por el autor de esta ficha) | MIT | HuggingFace |
| facebook/bart-large-cnn | no disponible en la informacion proporcionada | no disponible | no disponible | MIT | HuggingFace |
| google/pegasus-cnn_dailymail | no disponible en la informacion proporcionada | no disponible | no disponible | Apache 2.0 | HuggingFace |
| facebook/mbart-large-50 o mT5 | no disponible en la informacion proporcionada | no disponible | no disponible | MIT / Apache 2.0 | HuggingFace |

No se dispone de datos de benchmarks de los modelos alternativos en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa con `bart-large-cnn` ni con Pegasus. Como referencia estructural, `facebook/bart-large-cnn` triplica aproximadamente el numero de parametros (unos 400 M) y esta entrenado sobre el corpus CNN/DailyMail completo, mientras que este modelo usa 8.000 ejemplos de entrenamiento, por lo que es esperable una calidad inferior en resumenes largos y en articulos que requieran mas de 1.024 tokens de contexto.

## Limitaciones y advertencias

- Licencia no declarada: ni la model card ni los metadatos de HuggingFace indican licencia. Esto impide determinar si el uso comercial esta permitido. Antes de cualquier uso en produccion hay que contactar con el autor o asumir el riesgo legal.
- Riesgo de alucinacion: es un modelo abstractivo y puede generar contenido factualmente incorrecto o no presente en el articulo original. El autor lo advierte implicitamente al senalar que ROUGE no mide exactitud factual. No hay evaluacion de factualidad ni de tasa de alucinacion.
- Sesgos conocidos: no hay ninguna evaluacion de sesgos publicada. El modelo hereda los sesgos de `facebook/bart-base` y los del corpus CNN/DailyMail, que refleja el estilo editorial y la linea informativa de dos medios anglosajones concretos.
- Limitacion de idioma: solo ingles declarado. No hay evidencia de que funcione en castellano y no deberia usarse para ello sin un ajuste adicional.
- Limitacion de contexto: la entrada se trunca a 1.024 tokens. Articulos largos pierden informacion sin aviso, lo que puede producir resumenes incompletos o sesgados hacia la parte inicial del texto. La salida se limita a 128 tokens, suficiente para una entradilla pero no para un resumen detallado.
- Entrenamiento muy reducido: solo 2 epocas sobre 8.000 ejemplos, frente a los cientos de miles del corpus completo. La mejora sobre BART-base es modesta (entre +0,005 y +0,055 en ROUGE segun la metrica) y el modelo probablemente no supera a alternativas ajustadas sobre el dataset completo.
- Sobreajuste potencial: con un batch efectivo de 16 y solo 1.000 ejemplos de validacion, el mejor checkpoint se selecciona sobre una muestra pequena, lo que introduce varianza en la seleccion.
- Estado de validacion externa: cero descargas y cero likes en HuggingFace en el momento de la consulta. No hay evidencia de uso en produccion por terceros ni evaluaciones independientes.
- Reproducibilidad: el autor fija semilla 42 y documenta hiperparametros, pero no publica el script completo de preparacion de datos en la informacion disponible.
- Caveat de produccion: con `num_beams=4` y `early_stopping=True`, la latencia por documento es mayor que con decodificacion greedy; para volumenes altos conviene medir el coste real antes de dimensionar la infraestructura.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces recuperados corresponden a calculadoras de nomina austriacas y no guardan relacion con el contenido de esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AbdelrahmanAkl/bart-cnn-dailymail-summarization
- Demo interactiva en Streamlit: https://bart-cnn-dailymail-summarization.streamlit.app/
- Modelo base: https://huggingface.co/facebook/bart-base
- Paper de BART (Lewis et al., 2019): https://arxiv.org/abs/1910.13461
- Dataset CNN/DailyMail 3.0.0: https://huggingface.co/datasets/abisee/cnn_dailymail
- Documentacion de Hugging Face Transformers para resumen: https://huggingface.co/docs/transformers/tasks/summarization
- Repositorio, paper propio o blog del autor: no disponible
- Enlaces adicionales relevantes: no disponible (la busqueda web no devolvio resultados relacionados con el modelo)
