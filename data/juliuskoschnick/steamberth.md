# juliuskoschnick/SteamBERTh

## Resumen

SteamBERTh es un modelo de embeddings de frases (sentence-embeddings) especializado en textos cientificos y tecnicos en ingles de los siglos XVII y XVIII. Lo desarrolla Julius Koschnick y parte de MacBERTh, un BERT preentrenado sobre ingles historico (1450-1950), que se afina sobre titulos de libros impresos en Gran Bretana entre 1600 y 1800 y sobre descripciones breves de patentes inglesas. El modelo proyecta cada texto a un vector de 768 dimensiones cuya similitud coseno mide la cercania de contenido entre dos textos.

El problema que resuelve es concreto: los modelos entrenados con texto moderno arrastran asociaciones anacronicas (por ejemplo, no relacionan "fire engine" con una maquina de vapor, o situan conceptos como "phlogiston" lejos de la ciencia de la epoca). MacBERTh mitiga esto gracias a un corpus de preentrenamiento historico, pero los BERT base no estan entrenados para similitud de frases y presentan espacios de embeddings fuertemente anisotropicos. SteamBERTh corrige ambos problemas mediante un afinado contrastivo no supervisado sobre el dominio de interes.

El modelo se desarrollo para el trabajo de Koschnick (2025), donde sustenta medidas basadas en texto de innovacion y de difusion de conocimiento entre campos, disponibles en el paquete de Python `innovfromtext`. Con 109.081.344 parametros y licencia MIT, es relevante para humanidades digitales, historia economica e historia de la ciencia que necesiten representaciones semanticas fiables sobre corpus historicos en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer), con mean pooling sobre tokens; derivado de MacBERTh |
| Parametros totales | 109.081.344 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (longitud maxima de secuencia en el entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria sentence-transformers) |

## Arquitectura y entrenamiento

La arquitectura es un encoder BERT con mean pooling sobre los tokens para producir una unica representacion de 768 dimensiones por texto. El modelo base es `emanjavacas/MacBERTh`, un BERT preentrenado sobre ingles historico (1450-1950) cuyo corpus es aproximadamente un 70 por ciento anterior a 1800. Sobre esa base se aplica un afinado contrastivo no supervisado con el objetivo SimCSE (Gao, Yao y Chen 2021): cada texto se empareja consigo mismo, el dropout genera dos vistas distintas y los demas textos del lote actuan como negativos, con perdida de ranking con multiples negativos y escala 15.

Los datos de entrenamiento son 21.760 textos: todos los titulos del English Short Title Catalogue (ESTC) en las areas de fisica aplicada, astronomia, quimica, matematicas, instrucciones tecnicas de oficios y agricultura, navegacion e instrumentos cientificos, junto con las descripciones breves de patentes inglesas de Woodcroft (1854), descartando las descripciones de patentes con menos de tres palabras. Los hiperparametros son 2 epocas, tamano de lote 32, tasa de aprendizaje 2e-5, weight decay 0,01, calentamiento lineal durante el primer 10 por ciento de los pasos y longitud maxima de secuencia de 512. Para reproducibilidad se fijaron semillas (42), kernels CUDA deterministas y se registraron las versiones de software (sentence-transformers 3.2.1, transformers 4.44.2, torch 2.2.1).

## Capacidades

- Generacion de embeddings de frases: convierte un texto en un vector de 768 dimensiones; la similitud coseno entre vectores mide la cercania de contenido.
- Similitud semantica y busqueda por similitud sobre texto historico en ingles (aproximadamente 1600-1800).
- Extraccion de caracteristicas (feature extraction) para tareas posteriores de clasificacion, clustering o regresion sobre corpus historicos.
- Representacion de vocabulario cientifico y tecnico de la primera modernidad, incluyendo terminos hoy obsoletos o con significado distinto.
- Espacio de embeddings mas isotropico que el del modelo base, con clusters mas coherentes de campos e industrias.
- Soporte de normalizacion de embeddings (`normalize_embeddings=True`) para calcular similitudes coseno directamente como producto matricial.
- Integracion con el paquete `innovfromtext` para calcular indices de innovacion y de difusion de conocimiento.
- No dispone de tool calling, capacidades de agente, vision, audio ni modo de razonamiento: es un modelo de embeddings, no generativo.

## Casos de uso

- Historia economica cuantitativa: calcular indices de innovacion y de difusion de conocimiento entre campos a partir de titulos del ESTC y descripciones de patentes, usando `innovfromtext`; el modelo es adecuado porque su espacio de embeddings fue afinado precisamente sobre esos generos documentales.
- Busqueda semantica en archivos historicos: indexar titulos de libros y patentes de los siglos XVII y XVIII y recuperar documentos por similitud de contenido, evitando los anacronismos de los modelos entrenados con texto moderno.
- Clasificacion y agrupamiento de corpus historicos: generar embeddings de titulos o descripciones y aplicar clustering o clasificacion supervisada para identificar areas tecnicas y disciplinas cientificas de la epoca.
- Historia de la ciencia y de la tecnologia: medir la proximidad conceptual entre terminos y textos cientificos historicos (por ejemplo, situar "phlogiston" en relacion con la quimica de su tiempo) para estudiar la evolucion de las ideas.
- Analisis de patentes historicas: agrupar y comparar descripciones de patentes inglesas de 1600-1800 para estudiar trayectorias de invencion y spillovers tecnologicos.
- Deduplicacion y deteccion de textos similares en colecciones digitalizadas: identificar titulos o descripciones redundantes o muy proximos dentro de un catalogo historico.
- Enriquecimiento de metadatos en bibliotecas digitales: asignar temas o categorias a registros catalograficos historicos a partir de la similitud con textos de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible en el formato habitual (MMLU, HumanEval, GSM8K, etc.). La evaluacion documentada en Koschnick (2025, apendice) es cualitativa y econometrica:

| Evaluacion | Resultado |
|---|---|
| Isotropia del espacio de embeddings | mucho mayor que la del modelo base MacBERTh |
| Coherencia de clusters de campos e industrias | mayor que la del modelo base |
| Indice de innovacion sobre citas de patentes historicas (elasticidad intra-anual, 1720-1799) | 0,18 |
| Indice de innovacion sobre numero de ediciones de libros | 0,17 |
| Comparacion con indices basados en modelos BERT modernos (1720-1800) | SteamBERTh supera a los indices basados en modelos modernos |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 109 millones de parametros; en precision fp32 ocupa aproximadamente 0,44 GB de pesos, en fp16 aproximadamente 0,22 GB y en int8 aproximadamente 0,11 GB. La VRAM total depende del tamano de lote y de la longitud de secuencia (hasta 512 tokens).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; modelos como RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque para este tamano las GPU de consumo son mas que suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en CPU para lotes pequenos.
- Opciones de despliegue: sentence-transformers (libreria nativa), Text Embeddings Inference (el modelo incluye la etiqueta `text-embeddings-inference` y `endpoints_compatible`), y exportacion a otros formatos mediante las herramientas habituales del ecosistema transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SteamBERTh | 109.081.344 | 512 tokens | Ingles historico cientifico y tecnico (aprox. 1600-1800) | MIT | Hugging Face |
| MacBERTh (modelo base) | no disponible en la informacion | no disponible en la informacion | Ingles historico (1450-1950) | MIT | Hugging Face |
| BERT base (modelos modernos) | no disponible en la informacion | no disponible en la informacion | Ingles moderno general | no disponible en la informacion | Amplia |

La comparacion principal es con MacBERTh, del que SteamBERTh hereda la arquitectura y el preentrenamiento historico pero al que supera en isotropia del espacio de embeddings y en coherencia de clusters. Frente a indices construidos sobre modelos BERT modernos, SteamBERTh obtiene mejores resultados en la prediccion de citas de patentes y ediciones de libros para 1720-1800. No se dispone de datos de benchmarks estandar para una comparacion cuantitativa adicional.

## Limitaciones y advertencias

- El modelo esta ajustado para textos cientificos y tecnicos en ingles de aproximadamente 1600-1800, sobre todo titulos de libros y descripciones de patentes; no se ha evaluado en otros generos, periodos ni idiomas.
- Koschnick (2025) encuentra que los modelos modernos rinden ligeramente mejor en patentes del siglo XIX, por lo que el uso fuera de la ventana temporal objetivo puede degradar la calidad.
- Al ser un modelo de embeddings y no generativo, no produce texto ni responde preguntas; solo representa textos como vectores.
- La longitud de contexto esta limitada a 512 tokens, insuficiente para documentos completos de gran extension; esta pensado para titulos y descripciones breves.
- Riesgo de sesgos derivado del corpus de entrenamiento (ESTC y patentes inglesas), que refleja la produccion editorial y tecnica de la epoca y puede infrarrepresentar determinados ambitos o regiones.
- No se han documentado evaluaciones de robustez frente a ruido OCR, errores de transcripcion u ortografia historica irregular.
- Licencia MIT, que permite uso comercial, pero conviene citar el trabajo de Koschnick (2025) y el de MacBERTh (Manjavacas Arevalo y Fonteyn, 2021) segun indica el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juliuskoschnick/SteamBERTh
- Modelo base MacBERTh: https://huggingface.co/emanjavacas/MacBERTh
- Paper (Koschnick, 2025): https://arxiv.org/abs/2512.16587
- Paquete Python `innovfromtext`: https://github.com/juliuskoschnick/innovfromtext
- Paper de MacBERTh (Manjavacas Arevalo y Fonteyn, 2021): https://aclanthology.org/2021.nlp4dh-1.4/
- Documentacion de sentence-transformers: https://www.sbert.net
