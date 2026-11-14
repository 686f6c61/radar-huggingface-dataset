# ArlingtonCL2/canine-phonetic-models

## Resumen

`ArlingtonCL2/canine-phonetic-models` es un conjunto de pesos publicados por ArlingtonCL2 que acompaña al artículo "Toward Automatic Discovery of a Canine Phonetic Alphabet" (ACL 2025), firmado por Theron S. Wang, Xingyuan Li, Hridayesh Lekhak, Tuan M. Dang, Mengyue Wu, Mengyue Wu y Kenny Q. Zhu. No es un modelo generativo de lenguaje, sino un pipeline de dos etapas para procesar vocalizaciones de perros: primero un detector de eventos sonoros (BEATs-CRNN) que recorta segmentos vocales y después un modelo acústico tipo HuBERT (Dog-HuBERT) que convierte cada segmento en una secuencia de unidades discretas ("unidades vocales") mediante clustering K-Means sobre la capa 11.

El objetivo del trabajo es descubrir de forma no supervisada un repertorio de unidades fonéticas caninas, análogo a los fonemas en el habla humana, sin partir de transcripciones manuales. El repositorio incluye los checkpoints, las configuraciones de entrenamiento y los artefactos K-Means necesarios para reproducir las etiquetas publicadas. Es relevante para investigadores en bioacústica computacional, procesamiento de audio y modelos auto-supervisados aplicados a vocalizaciones animales.

El repositorio ocupa 1,2 GB y está etiquetado con `fairseq`, `audio`, `hubert`, `sound-event-detection`, `animal-vocalization` y `dog`, con licencia MIT. No es un modelo de chat ni de generación de texto: no tiene pipeline de Hugging Face asociado y su uso requiere el código del repositorio GitHub del proyecto y, en el caso del detector, la base de código ATST-SED y el encoder BEATs preentrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: BEATs-CRNN (detector de eventos sonoros) + Dog-HuBERT (HuBERT Base, fairseq) con clustering K-Means |
| Parametros totales | No disponible (el checkpoint Dog-HuBERT es HuBERT Base; el detector BEATs-CRNN no reporta recuento de parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; ventana de audio de 5 s con solapamiento de 1 s en el troceado de clips |
| Tipos de cuantizacion | No disponible (se distribuyen checkpoints en punto flotante, sin versiones cuantizadas) |
| Idiomas soportados | No aplica (audio no linguistico; vocalizaciones de perro) |
| Licencia | MIT |
| Formato de pesos | `.ckpt` (PyTorch Lightning, detector), `.pt` (fairseq, Dog-HuBERT), `.pkl` (artefactos K-Means de scikit-learn), `.yaml` (configuracion) |

## Arquitectura y entrenamiento

El pipeline tiene dos componentes. El primero, `beats_sed_dog.ckpt`, es un detector de eventos sonoros BEATs-CRNN post-entrenado sobre más de 9.000 s de vocalizaciones de perro etiquetadas manualmente. La configuración asociada (`beats_sed_dog_config.yaml`) especifica una RNN de 4 capas sobre una salida CNN de 256 dimensiones, con learning rate 0,001, 200 épocas y batch size 4. En el conjunto de test alcanza un F1 de 0,8556; el umbral de detección recomendado es 0,6713 y las detecciones separadas por menos de 0,5 s se fusionan en un mismo segmento vocal.

El segundo componente, `dog_hubert_stage2_130k.pt`, es un HuBERT Base de fairseq entrenado en tres etapas con 100, 200 y 250 clústeres respectivamente (seleccionados por el método del codo). Los datos de entrenamiento cubren seis razas y 306.233 segmentos vocales (152 h); se descartaron clips de menos de 0,35 s y los de más de 5 s se trocearon en ventanas de 5 s con 1 s de solapamiento. El learning rate fue 1e-4 y las etapas 1 y 2 requirieron 20 y 18 horas respectivamente en dos NVIDIA RTX 4090 con batch size 4. Las unidades vocales finales se obtienen agrupando las características de la capa 11 del modelo de etapa 2 con K-Means (K = 250, guardado en `kmeans_layer11_k250.pkl`). El checkpoint liberado corresponde a `checkpoint_105_130000.pt` sin el estado del optimizador, y reproduce exactamente las etiquetas de frame publicadas sobre 40 segmentos vocales.

## Capacidades

- Detección de segmentos vocales de perro en audio: el detector BEATs-CRNN localiza y recorta regiones con vocalizaciones, con umbral de decisión configurable (0,6713 por defecto) y fusión de detecciones próximas (< 0,5 s).
- Extracción de unidades vocales discretas: Dog-HuBERT genera una unidad por cada frame de 20 ms (50 unidades por segundo) a partir de la capa 11 y el K-Means de 250 clústeres.
- Representación auto-supervisada de audio canino: las características intermedias del modelo pueden reutilizarse para tareas posteriores (clasificación de vocalizaciones, análisis comparativo entre razas, segmentación).
- Procesamiento de audio mono a 16 kHz sin normalización, tal como se documenta en el ejemplo de inferencia.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo acústico, no un LLM.
- No tiene capacidades multilingües en el sentido habitual; el objeto de estudio son vocalizaciones animales, no lenguaje natural.

## Casos de uso

- Investigación en fonética animal: el pipeline permite obtener secuencias de unidades discretas a partir de grabaciones de perros y comparar repertorios entre razas o contextos, que es el propósito original del artículo.
- Bioacústica computacional a escala: el detector BEATs-CRNN puede procesar grandes volúmenes de audio para aislar segmentos vocales antes de cualquier análisis posterior, reduciendo el trabajo manual de anotación.
- Análisis de comunicación canina en estudios de conducta: las secuencias de unidades vocales (50 por segundo) permiten estudiar patrones temporales en ladridos, gruñidos u otros sonidos en función del estímulo.
- Reproducción de experimentos: los artefactos K-Means y los checkpoints permiten replicar las etiquetas publicadas y servir de línea base en trabajos comparativos.
- Extracción de características para clasificación downstream: las representaciones de Dog-HuBERT pueden alimentar clasificadores de edad, raza, contexto o estado emocional del animal, aunque estos clasificadores no se distribuyen en el repositorio.
- Docencia y divulgación: el pipeline ilustra de forma completa un flujo de trabajo auto-supervisado (detección, extracción de características, clustering) aplicado a un dominio no lingüístico.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| F1 del detector BEATs-CRNN | 0,8556 | Conjunto de test del detector, umbral 0,6713 |
| Reproducibilidad de etiquetas | Exacta sobre 40 segmentos vocales | Dog-HuBERT etapa 2 + K-Means capa 11 K=250 |
| Datos de entrenamiento (detector) | > 9.000 s etiquetados manualmente | Vocalizaciones de perro |
| Datos de entrenamiento (Dog-HuBERT) | 306.233 segmentos, 152 h, 6 razas | Tras filtrado y troceado |
| Tiempo de entrenamiento (Dog-HuBERT) | 20 h (etapa 1), 18 h (etapa 2) | 2 × RTX 4090, batch size 4 |

No se han publicado en la información disponible resultados de benchmarks estándar de NLP (MMLU, HumanEval, GSM8K) porque el modelo no es un LLM.

## Requisitos de hardware

- Dog-HuBERT (HuBERT Base, ~95 M de parámetros): inferencia viable en GPU consumer; el entrenamiento documentado usó 2 × RTX 4090.
- Detector BEATs-CRNN: requiere el encoder BEATs `BEATs_iter3_plus_AS2M.pt` y la base de código ATST-SED; el checkpoint ocupa 788 MB y el entrenamiento se realizó con batch size 4.
- VRAM estimada: no disponible de forma explícita; por el tamaño de los checkpoints (379 MB y 788 MB) y la arquitectura, es esperable que quepa en GPUs consumer de 8-16 GB, pero no se confirma en la documentación.
- Despliegue: fairseq para Dog-HuBERT, PyTorch Lightning + ATST-SED para el detector, scikit-learn 1.3 para los K-Means (versiones más nuevas cargan con aviso de versión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Canine phonetic models (este) | Detector SED + HuBERT + K-Means | No disponible (HuBERT Base en la etapa 2) | Ventanas de 5 s | MIT | Hugging Face + GitHub |
| HuBERT Base estándar (fairseq) | Modelo acústico auto-supervisado | ~95 M | Ventanas de audio variables | MIT | fairseq / Hugging Face |
| BEATs | Modelo acústico preentrenado | No disponible en la ficha | Ventanas de audio | Licencia del proyecto BEATs | Repositorio oficial de BEATs |
| ATST-SED | Detector de eventos sonoros | No disponible en la ficha | Ventanas de audio | Licencia del proyecto ATST-SED | GitHub |

La comparación es aproximada: no existen, en la información disponible, modelos públicos equivalentes específicos para descubrimiento de un alfabeto fonético canino. Las alternativas citadas son los componentes base sobre los que se construye este pipeline.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts y no debe evaluarse con benchmarks de NLP.
- El detector está entrenado sobre vocalizaciones de perro; su rendimiento fuera de ese dominio (otros animales, ruido ambiental intenso, otras condiciones de grabación) no está documentado.
- El F1 de 0,8556 corresponde al conjunto de test del autor; no hay validación independiente publicada.
- Las unidades vocales son agrupaciones K-Means sobre la capa 11 y dependen del modelo y del K-Means concretos; no constituyen una transcripción fonética validada lingüísticamente.
- El audio debe ser mono a 16 kHz y no normalizado, según el ejemplo de la model card; desviarse de ese preprocesamiento puede alterar las etiquetas.
- Los K-Means se guardaron con scikit-learn 1.3; versiones más recientes los cargan con aviso de versión y podrían comportarse de forma distinta.
- El detector requiere código externo (ATST-SED) y un encoder BEATs preentrenado que no se incluye en el repositorio, lo que añade dependencias y posibles fricciones de licencia.
- Licencia MIT para los pesos, pero las dependencias externas (BEATs, ATST-SED) tienen sus propias licencias que deben revisarse antes de un uso comercial.
- Riesgo de sesgo por raza: el entrenamiento cubre seis razas; el comportamiento en razas no representadas no está caracterizado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni informes de errores.

## Enlaces

- Hugging Face: https://huggingface.co/ArlingtonCL2/canine-phonetic-models
- Paper (ACL Anthology): https://aclanthology.org/2025.acl-long.451/
- DOI: https://doi.org/10.18653/v1/2025.acl-long.451
- Código: https://github.com/TheronWang/canine-word
- Base de código ATST-SED: https://github.com/Audio-WestlakeU/ATST-SED
