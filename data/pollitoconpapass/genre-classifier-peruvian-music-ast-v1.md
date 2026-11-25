# pollitoconpapass/genre-classifier-peruvian-music-ast-v1

## Resumen

El modelo `pollitoconpapass/genre-classifier-peruvian-music-ast-v1` es un clasificador de audio especializado en generos de musica peruana, desarrollado por el usuario pollitoconpapass. Se trata de un fine-tuning del Audio Spectrogram Transformer (AST) `MIT/ast-finetuned-audioset-10-10-0.4593`, adaptado para distinguir cinco generos concretos: chicha, criolla, cumbia amazonica, huayno y rock. El modelo resuelve un problema de nicho —la clasificacion automatica de musica peruana— que no suele estar cubierto por los clasificadores genericos de genero musical, entrenados mayoritariamente sobre datasets occidentales.

Con 86,19 millones de parametros, el modelo opera sobre fragmentos de audio de 10 a 15 segundos muestreados a 16 kHz y utiliza una ventana de inferencia de 10,24 segundos (163.840 muestras), con agregacion por media de probabilidades sobre ventanas solapadas. El repositorio ocupa 1,4 GB e incluye pesos en `safetensors` junto con un `label_encoder.joblib` para mapear las clases. La licencia MIT permite uso comercial sin restricciones practicas.

El modelo resulta relevante para proyectos de catalogacion musical, sistemas de recomendacion regionales y analisis cultural, al ofrecer una precision global del 89 % sobre un conjunto de evaluacion de 2.038 fragmentos, con F1 macro de 0,88. Es una pieza pequena y desplegable en CPU que cubre un hueco linguistico-cultural especifico del mercado musical peruano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Spectrogram Transformer (AST), transformer sobre espectrogramas mel |
| Parametros totales | 86.192.645 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 10,24 s a 16 kHz; entrada maxima practica de 15 s) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion no documentada) |
| Idiomas soportados | no disponible (clasificacion de audio, sin componente textual) |
| Licencia | MIT |
| Formato de pesos | safetensors (+ label_encoder.joblib) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del Audio Spectrogram Transformer `MIT/ast-finetuned-audioset-10-10-0.4593`, un transformer puro (sin convoluciones) que procesa espectrogramas mel como si fueran secuencias de parches, siguiendo el enfoque de ViT aplicado a audio. La entrada se convierte en un espectrograma de 128 bandas mel con parches solapados, y el modelo aplica atencion global sobre toda la representacion tiempo-frecuencia. La cabeza de clasificacion se ha reemplazado para producir 5 clases en lugar de las 527 de AudioSet.

El entrenamiento se realizo sobre el dataset `pollitoconpapass/dataset-peru-shazam`, compuesto por canciones peruanas etiquetadas por genero, y el conjunto de evaluacion reportado en la model card contiene 2.038 fragmentos. No se especifican en la informacion disponible el numero de tokens de audio, la composicion exacta del dataset, la duracion del entrenamiento, hiperparametros ni si se aplico alguna fase de ajuste fino adicional mas alla del fine-tuning supervisado. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal; el modelo sigue el esquema estandar de AST.

## Capacidades

- Clasificacion de genero musical en cinco categorias: chicha, criolla, cumbia amazonica, huayno y rock.
- Procesamiento de fragmentos de audio de 10 a 15 segundos, con ventana interna de 10,24 s a 16 kHz mono.
- Agregacion de predicciones sobre multiples ventanas solapadas mediante media de probabilidades softmax, lo que estabiliza la clasificacion en clips mas largos.
- Salida de distribucion de probabilidad sobre las cinco clases, no solo la etiqueta ganadora.
- Inferencia en CPU o GPU (el codigo de ejemplo detecta `cuda` automaticamente).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un clasificador de audio.
- No tiene capacidades multilingues en sentido estricto, al no procesar texto.
- No dispone de modo thinking, vision ni audio generativo.

## Casos de uso

- Catalogacion automatica de archivos musicales: dado un lote de grabaciones peruanas, el modelo etiqueta cada pista con su genero en fragmentos de 10-15 s, permitiendo organizar bibliotecas y archivos de sellos discograficos con precision del 89 %.
- Sistemas de recomendacion regional: integrar el clasificador como paso previo para enrutar canciones a playlists de chicha, huayno o cumbia amazonica, aprovechando la salida probabilistica para ordenar por confianza.
- Analisis cultural y musicologia computacional: cuantificar la presencia relativa de generos en emisoras de radio o plataformas peruanas, procesando horas de audio en ventanas de 10,24 s con agregacion por media.
- Moderacion y curaduria de plataformas de streaming: detectar y clasificar contenido subido por usuarios, filtrando por genero antes de la revision humana, con un modelo pequeno (86 M de parametros) desplegable en CPU.
- Investigacion sobre industrias musicales locales: estudiar la evolucion de la cumbia amazonica frente al huayno en un corpus historico, usando las probabilidades por ventana como senal temporal.
- Prototipado rapido en entornos con recursos limitados: al pesar 1,4 GB y caber en memoria de CPU, sirve para demos, notebooks y pipelines de datos sin GPU dedicada.
- Etiquetado asistido de datasets: pre-anotar nuevos audios peruanos para ampliar el dataset `dataset-peru-shazam` con revision humana posterior, reduciendo el coste de etiquetado manual.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el conjunto de evaluacion (2.038 fragmentos):

| Clase | Precision | Recall | F1-score | Soporte |
|---|---|---|---|---|
| Chicha | 0,90 | 0,85 | 0,87 | 407 |
| Criolla | 0,88 | 0,92 | 0,90 | 346 |
| Cumbia amazonica | 0,89 | 0,77 | 0,82 | 350 |
| Huayno | 0,84 | 0,92 | 0,88 | 521 |
| Rock | 0,94 | 0,95 | 0,95 | 414 |
| Accuracy global | — | — | 0,89 | 2.038 |
| Media macro | 0,89 | 0,88 | 0,88 | 2.038 |
| Media ponderada | 0,89 | 0,89 | 0,89 | 2.038 |

No se han publicado comparaciones con otros modelos de clasificacion de genero musical peruano en la informacion disponible. La clase con peor recall es cumbia amazonica (0,77), probablemente por solapamiento acustico con chicha y huayno; la clase rock obtiene el mejor rendimiento (F1 0,95).

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 350 MB para los pesos (86 M de parametros), mas activaciones del espectrograma; en la practica menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona bien en RTX 3060, RTX 4090, A100, H100, aunque el modelo es lo bastante pequeno para no necesitarlas.
- Cabe holgadamente en GPU de consumo (GTX 1650, RTX 2060, etc.) y tambien en CPU.
- Opciones de despliegue: `transformers` con PyTorch (metodo documentado en la model card); no se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje y no a clasificadores AST.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dado el tamano, se espera inferencia en decenas de milisegundos por ventana en GPU moderna y en el orden de cientos de milisegundos en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto/ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pollitoconpapass/genre-classifier-peruvian-music-ast-v1 | 86,19 M | Clasificacion de genero musical peruano (5 clases) | 10,24 s por ventana | MIT | Hugging Face |
| MIT/ast-finetuned-audioset-10-10-0.4593 (modelo base) | ~87 M | Clasificacion de eventos de audio AudioSet (527 clases) | 10,24 s | no disponible en la informacion | Hugging Face |
| Clasificadores genericos de genero musical (p. ej. basados en MERT o CLAP) | variable | Genero musical occidental (pop, rock, jazz, etc.) | variable | variable | Hugging Face |

La comparacion directa con otros clasificadores de musica peruana no esta disponible en la informacion proporcionada. El modelo base AST es el referente arquitectonico inmediato; los clasificadores genericos de genero no cubren las clases chicha, criolla, cumbia amazonica ni huayno, lo que constituye la principal ventaja de este fine-tuning.

## Limitaciones y advertencias

- El modelo solo distingue cinco generos; cualquier audio fuera de ese conjunto (por ejemplo, salsa, regueton o musica clasica) sera forzado a una de las cinco clases con probabilidad posiblemente alta, generando falsos positivos.
- El recall de cumbia amazonica es bajo (0,77), por lo que existe riesgo de confusion con chicha y huayno en fragmentos ambiguos o con produccion moderna que mezcle estilos.
- La ventana de inferencia es de 10,24 s; fragmentos mas cortos se rellenan con padding y fragmentos mas largos requieren el esquema de ventanas solapadas del codigo de ejemplo, que puede diluir la senal en audios muy heterogeneos.
- No se documentan sesgos especificos, pero al entrenarse sobre un dataset derivado de Shazam, puede estar sesgado hacia musica popular y comercial, infrarrepresentando generos minoritarios o grabaciones de baja calidad.
- Riesgo de alucinacion en sentido clasico no aplica (no genera texto), pero si de sobreconfianza: la salida softmax puede ser alta incluso en audios fuera de distribucion.
- La licencia MIT permite uso comercial sin restricciones, pero el dataset de entrenamiento (`dataset-peru-shazam`) puede tener sus propias condiciones de uso que conviene revisar antes de un despliegue en produccion.
- No se documentan los idiomas ni la composicion exacta del dataset de entrenamiento, lo que limita la evaluacion de posibles sesgos culturales o de grabacion.
- El modelo tiene 86 descargas y 0 likes en el momento de la consulta, por lo que su validacion externa es practicamente nula; conviene evaluarlo sobre datos propios antes de confiar en las metricas reportadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pollitoconpapass/genre-classifier-peruvian-music-ast-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/pollitoconpapass/dataset-peru-shazam
- Modelo base AST: https://huggingface.co/MIT/ast-finetuned-audioset-10-10-0.4593
- Matriz de confusion (imagen): https://cdn-uploads.huggingface.co/production/uploads/65ef325fe770d56d25690557/y6RuCGda5GHVuL-r29ViM.png
