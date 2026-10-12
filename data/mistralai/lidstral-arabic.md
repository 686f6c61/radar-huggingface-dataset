# mistralai/LIDstral-Arabic

## Resumen

LIDstral Arabic es un clasificador de idioma y dialecto desarrollado por Mistral AI, disenado especificamente para texto escrito en alfabeto arabe. A diferencia de un modelo generativo, su funcion es asignar a cada fragmento de texto una etiqueta entre 51 clases, cubriendo arabe estandar moderno (MSA), todos los dialectos arabes principales y un conjunto de lenguas no arabes que comparten el mismo sistema de escritura (turkicas, indo-iranias, africanas y austronesias). Incluir estas ultimas es una decision deliberada: ayuda al modelo a no clasificar como arabe cualquier texto solo por estar escrito en alfabeto arabe.

Tecnicamente no es un transformer ni un LLM, sino un pipeline de tres etapas que combina un clasificador fastText one-vs-all, un apilador MLP con normalizacion LayerNorm y calibracion isotonica por clase. El modelo se ejecuta en CPU, con un repositorio de 1,1 GB, y esta publicado bajo licencia Apache 2.0. La model card indica `inference: false` en la plataforma de Hugging Face, por lo que el uso previsto es la descarga local del bundle de ficheros y su ejecucion mediante el script incluido.

Su relevancia actual viene dada por el problema que aborda: la identificacion fiable de dialectos arabes es dificil debido a la gran variacion regional, la ausencia de ortografia estandar en muchos dialectos y la confusion entre lenguas que comparten script. LIDstral Arabic reporta un F1 del 88,67% en dariya marroqui, frente al 72,65% de LahjatBERT ALDi CL y el 71,28% de GlotLID v3, lo que supone una mejora sustancial en la tarea concreta de distinguir dialectos del Magreb.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline en cascada: fastText one-vs-all (OVA) + apilador MLP de 64 unidades con LayerNorm + calibracion isotonica por clase |
| Parametros totales | no disponible (no se publica el recuento de parametros del fastText ni del MLP) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificador, no modelo generativo; procesa la entrada completa tras preprocesado) |
| Tipos de cuantizacion | no aplica (no se distribuyen pesos cuantizados; el fastText y el MLP se ejecutan en CPU) |
| Idiomas soportados | 51 clases: MSA y dialectos arabes (ary, ayl, aeb, arq, mey, afb, ars, acx, ayn, arz, apd, acm, ajp, apc, shu) y lenguas no arabes en alfabeto arabe (tamazight, azeri, turco, kazajo, kirguis, uzbeko, persa, pashto, urdu, sindhi, cachemir, punyabi occidental, tayiko, gilaki, brahui, hawrámí, kurdo sorani, afar, dinka, fula, hausa, kanuri, oromo, suajili, tigrina, wolof, n'ko, achines, malayo en jawi) |
| Licencia | Apache 2.0 |
| Formato de pesos | fastText `.bin` (`lid_ova_full.bin`), PyTorch `.pt` (`mlp_stacker_ln.pt`) y pickle (`isotonic_calibration.pkl`) |

## Arquitectura y entrenamiento

El pipeline se compone de tres fases encadenadas. En primer lugar, un clasificador fastText one-vs-all genera puntuaciones independientes para cada una de las 51 clases, lo que preserva la evidencia de lenguas y dialectos que compiten entre si (a diferencia de un softmax unico). En segundo lugar, un apilador MLP de 64 unidades con LayerNorm transforma esas puntuaciones en probabilidades sobre las clases; segun la model card, utiliza 144 caracteristicas derivadas de las puntuaciones brutas, correcciones de prior, margenes de confianza, entropia y resumenes regionales, y el checkpoint almacena la normalizacion de caracteristicas y el orden de las etiquetas. Por ultimo, regresores isotonicos por clase, ajustados sobre predicciones de desarrollo, calibran las probabilidades del MLP y el pipeline las renormaliza entre clases; la calibracion puede modificar tanto la confianza como la etiqueta predicha.

No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset de entrenamiento ni si se emplearon tecnicas de RLHF o DPO (no aplicables a un clasificador de este tipo). La evaluacion se realizo sobre 84.870 ejemplos en arabe extraidos de diversos benchmarks: NADI, MADAR, QADI, Casablanca, FLEURS, SMOL, Omnilingual ASR y el corpus de hasaniya. La innovacion mas destacable es la combinacion de calibracion isotonica por clase con un apilador que explota caracteristicas derivadas de la estructura regional, algo poco habitual en clasificadores de idioma basados en fastText.

## Capacidades

- Identificacion de idioma y dialecto sobre texto en alfabeto arabe, con 51 clases de salida.
- Distincion entre MSA y dialectos arabes regionales (Magreb, Golfo, valle del Nilo, Levante y otros).
- Discriminacion de lenguas no arabes que usan alfabeto arabe (p. ej. persa, urdu, kurdo sorani, malayo en jawi, tamazight).
- Salida de probabilidades calibradas por clase, no solo la etiqueta ganadora, lo que permite umbrales y analisis de confianza.
- Procesamiento por lotes de textos en formato JSONL y mediante API de Python, cargando el modelo una sola vez.
- Ejecucion en CPU, sin requerir GPU.
- Entrada por linea de comandos, fichero JSONL o entrada estandar.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni capacidades de agente (no es un modelo generativo).

## Casos de uso

- Enrutamiento de atencion al cliente multilingue: al detectar el dialecto concreto del usuario (por ejemplo, dariya marroqui frente a arabe egipcio), el sistema puede derivar la conversacion al agente o al modelo de respuesta con el perfil linguistico adecuado.
- Curacion y filtrado de corpus de entrenamiento: al clasificar grandes volumenes de texto en alfabeto arabe, permite separar MSA de dialectos o descartar ejemplos mal etiquetados antes de entrenar un LLM.
- Preprocesado de pipelines de reconocimiento automatico del habla (ASR): etiquetar la transcripcion por dialecto facilita la seleccion de modelos acusticos y de lenguaje especificos por region.
- Investigacion sociolinguistica y dialectologia: la salida de probabilidades calibradas permite cuantificar mezclas dialectales y estudiar variacion geografica en corpus como redes sociales.
- Moderacion de contenido: identificar la lengua o dialecto de un texto entrante ayuda a aplicar reglas y modelos de moderacion especificos por idioma en plataformas con audiencias del norte de Africa y Oriente Proximo.
- Enrutamiento en sistemas de traduccion automatica: determinar primero la variedad linguistica mejora la eleccion del par de traduccion y evita tratar dariya como MSA.
- Analisis de mercado y escucha social: segmentar opiniones por pais o region a partir del dialecto detectado, util para marcas que operan en varios mercados arabofonos.
- Deteccion de cambío de idioma en flujos de texto: al cubrir tambien lenguas no arabes con el mismo script, puede usarse como etapa previa en sistemas multilingues.

## Benchmarks y rendimiento

| Benchmark / tarea | LIDstral Arabic | LahjatBERT ALDi CL | GlotLID v3 |
|---|---|---|---|
| F1 en dariya marroqui (ary) | 88,67% | 72,65% | 71,28% |
| Evaluacion global | Conjunto de 84.870 ejemplos arabes (NADI, MADAR, QADI, Casablanca, FLEURS, SMOL, Omnilingual ASR, Hasaniya) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |

La model card referencia una figura con el F1 por etiqueta sobre el benchmark arabe, pero no se incluyen en el texto los valores numericos de cada clase. No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni GSM8K (no aplicables a un clasificador).

## Requisitos de hardware

- VRAM para inferencia: no aplica. El pipeline se ejecuta en CPU segun la model card; no requiere GPU.
- GPU recomendadas: ninguna. El modelo no esta pensado para aceleracion en GPU.
- Compatibilidad con GPU de consumo: irrelevante, ya que no necesita GPU; puede ejecutarse en cualquier maquina con CPU moderna.
- Memoria RAM estimada: no disponible de forma explicita; el repositorio ocupa 1,1 GB, por lo que un entorno con 2-4 GB de RAM disponible deberia ser suficiente para cargar el bundle.
- Opciones de despliegue: script `classify.py` incluido (CLI y API de Python); no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | F1 dariya marroqui | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LIDstral Arabic | fastText OVA + MLP + calibracion isotonica | 51 | 88,67% | Apache 2.0 | Requiere cuenta con acceso al repositorio en Hugging Face |
| LahjatBERT ALDi CL | Modelo basado en BERT para dialectos arabes | no disponible | 72,65% | no disponible | no disponible |
| GlotLID v3 | Clasificador de idioma multilingue | no disponible | 71,28% | no disponible | Publico |

La informacion disponible solo permite comparar el rendimiento en dariya marroqui; para el resto de dialectos no se aportan cifras de los modelos alternativos.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, razonamiento, codigo ni respuestas; solo asigna etiquetas de idioma o dialecto.
- Riesgo de confusion entre lenguas que comparten alfabeto arabe, especialmente en textos cortos o con vocabulario solapado; la propia model card justifica la inclusion de lenguas no arabes para mitigar este problema, lo que implica que sigue siendo un reto.
- El cambío de codigo (code-switching) entre dialectos o entre arabe y otra lengua dentro de un mismo texto puede degradar la clasificacion, ya que el modelo asigna una unica etiqueta por entrada.
- Rendimiento desigual por clase: los datos publicos solo cubren dariya marroqui; no hay cifras para dialectos con menos recursos, que previsiblemente obtendran resultados inferiores.
- La evaluacion se limita a 84.870 ejemplos arabes; el comportamiento fuera de esa distribucion (textos muy cortos, ruido, transcripciones de ASR con errores) no esta documentado.
- La model card indica `inference: false` en Hugging Face y describe el repositorio como privado, por lo que el acceso requiere una cuenta de Hugging Face con permisos; la descarga no es abierta a cualquiera.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene revisar las condiciones de los datasets de evaluacion citados (NADI, MADAR, QADI, Casablanca, FLEURS, SMOL, Omnilingual ASR, Hasaniya), cada uno con su propia licencia.
- Los ficheros `mlp_stacker_ln.pt` y `isotonic_calibration.pkl` implican dependencia de PyTorch y de la version de pickle; conviene fijar versiones para reproducibilidad en produccion.
- Adopcion baja en el momento de la ficha (56 descargas, 15 me gusta), lo que reduce la evidencia externa sobre su comportamiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mistralai/LIDstral-Arabic
- Mistral AI (sitio oficial): https://mistral.ai/
- Mistral AI (version en frances): https://mistral.ai/fr/
- Mistral AI en Wikipedia: https://fr.wikipedia.org/wiki/Mistral_AI
- Dataset NADI: https://figshare.com/articles/dataset/NADI_dataset/27935430
- Dataset MADAR: https://www.kaggle.com/datasets/bechirbentekfa/madar-dataset
- Dataset QADI: https://github.com/qcri/QADI
- Dataset Casablanca: https://huggingface.co/datasets/UBC-NLP/Casablanca
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset SMOL: https://huggingface.co/datasets/google/smol
- Dataset Omnilingual ASR: https://huggingface.co/datasets/facebook/omnilingual-asr-corpus
- Dataset Hasaniya: https://huggingface.co/datasets/Emin009/hassaniya-punctuation-dataset
