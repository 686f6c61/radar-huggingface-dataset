# NLP-CISUC/humetrix-resources

## Resumen

Humetrix resources es un repositorio de artefactos auxiliares (no un modelo generativo) publicado por el grupo NLP-CISUC para dar soporte a la librería Humetrix, una herramienta en Python dedicada a la evaluacion automatica del humor en texto, con enfasis en juegos de palabras (puns). El repositorio empaqueta embeddings de palabras y tablas de frecuencias de n-gramas en cinco idiomas (ingles, espanol, frances, portugues y chino), que la libreria descarga de forma automatica para calcular metricas como las basadas en entropia cuantica o las de Kao et al.

El contenido se organiza en tres carpetas por idioma: `glove/{lang}/` con embeddings GloVe de 300 dimensiones en formato safetensors y un vocabulario alineado; `skipgram/{lang}/` con pesos de skip-gram con muestreo negativo (SGNS) de 300 dimensiones para las metricas de Kao et al.; y `ngrams/{lang}/` con tablas de frecuencia de unigramas y trigramas. El tamano total del repositorio es de 3,1 GB.

Su relevancia es practica: quien quiera reproducir o extender la evaluacion de humor de Humetrix necesita estos recursos preentrenados, y el repositorio evita tener que reentrenar embeddings o recalcular frecuencias. No obstante, no es un modelo de lenguaje: no genera texto, no soporta tool calling ni dispone de ventana de contexto en el sentido habitual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estaticos de palabras (GloVe y skip-gram SGNS) y tablas de n-gramas; no es un transformer |
| Parametros totales | no disponible (depende del vocabulario de cada idioma; dimension de embedding fija de 300) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo generativo) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente float32; no se documenta cuantizacion) |
| Idiomas soportados | en, es, fr, pt, zh |
| Licencia | cc-by-sa-4.0 (con componentes de terceros bajo PDDL, MIT y CC BY 3.0, segun la model card) |
| Formato de pesos | safetensors (`embeddings.safetensors`, clave `embeddings`); vocabulario en `vocab.txt`; tablas de n-gramas en CSV |

## Arquitectura y entrenamiento

El repositorio no contiene una red neuronal profunda, sino representaciones lexicas estaticas. Los embeddings GloVe de 300 dimensiones se obtuvieron de fuentes distintas segun el idioma: el ingles procede de Pennington et al. (2014) de Stanford NLP (dominio publico, PDDL); el espanol se entreno sobre el Spanish Billion Words Corpus (Cardellino, 2019); el frances se entreno con datos y codigo del proyecto French-Word-Embeddings (MIT); y el chino se entreno sobre el volcado de Wikipedia en chino del 2023-11-01. El portugues no se aloja en este repositorio: Humetrix lo descarga desde `nilc-nlp/glove-300d` (Hartmann et al., 2017).

Los pesos de skip-gram (SGNS, 300 dimensiones) se entrenaron sobre BookCorpus (en), BrWaC (pt), CroissantLLM (fr), SBWC (es) y Wikipedia en chino (zh), y su vocabulario se corresponde con el archivo `ngrams/{lang}/1gram.csv`. Las tablas de unigramas y trigramas para en/es/fr/zh derivan de Google Books Ngram (CC BY 3.0) a traves de `google-books-ngram-frequency`, mientras que las de portugues derivan de BrWaC via `Portuguese-Ngram-Frequencies`. No se documentan procesos de RLHF, DPO ni innovaciones de decodificacion, ya que no hay generacion de texto implicada.

## Capacidades

- Representacion vectorial de palabras en 300 dimensiones para en, es, fr, pt y zh (GloVe y skip-gram).
- Calculo de metricas de entropia cuantica sobre texto mediante los embeddings GloVe.
- Calculo de metricas de humor de Kao et al. mediante los pesos skip-gram y las tablas de n-gramas.
- Consulta de frecuencias de unigramas y trigramas para los cinco idiomas.
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas a representaciones lexicas en los cinco idiomas indicados.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Evaluacion automatica de humor en textos: usar los embeddings GloVe y las tablas de n-gramas para calcular las metricas de Humetrix sobre chistes o titulares y comparar resultados entre idiomas.
- Investigacion en procesamiento de lenguaje figurado: emplear los pesos skip-gram para reproducir las metricas de Kao et al. en estudios sobre puns y juegos de palabras.
- Analisis de frecuencias lexicas: consultar las tablas de unigramas y trigramas para estudiar distribuciones de n-gramas en corpus historicos (Google Books) o en corpus web (BrWaC).
- Baselines en tareas de similitud semantica: usar los embeddings GloVe de 300 dimensiones como representacion de referencia en experimentos de NLP en espanol, frances o chino, donde los recursos publicos son mas escasos.
- Construccion de sistemas de deteccion de humor en produccion: integrar las metricas de Humetrix como senal auxiliar en pipelines de moderacion o recomendacion de contenido humoristico.
- Reproducibilidad de experimentos: descargar los recursos fijados por version para garantizar que los resultados de evaluacion de humor sean reproducibles entre equipos.
- Docencia y prototipado: disponer de embeddings y frecuencias listos para usar en asignaturas o talleres de NLP sin necesidad de entrenar representaciones desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido de un LLM; el repositorio ocupa 3,1 GB en disco y los embeddings se cargan en memoria RAM (o VRAM si se mueven a GPU) segun el idioma y el vocabulario utilizado.
- GPU recomendadas: no se especifican; al tratarse de operaciones de lookup y calculo de metricas, una GPU consumer es suficiente si se desea acelerar, aunque la CPU es viable.
- Cabe en GPU consumer: si, sin requisitos relevantes; el cuello de botella es el tamano del vocabulario y las tablas de n-gramas, no el computo.
- Opciones de despliegue: la libreria Humetrix (Python) carga los safetensors y los CSV; no se contemplan vLLM, llama.cpp, Ollama ni TGI porque no hay un modelo generativo.
- Latencia y throughput: no disponibles; dependeran del tamano del corpus a evaluar y de la implementacion de las metricas.

## Comparativa con modelos similares

| Recurso | Tipo | Idiomas | Dimension | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Humetrix resources (NLP-CISUC) | GloVe + skip-gram + n-gramas | en, es, fr, pt, zh | 300 | CC BY-SA 4.0 (mixta) | Hugging Face (3,1 GB) |
| GloVe Stanford (Pennington et al.) | Embeddings GloVe | en (principalmente) | 50-300 | PDDL | Web de Stanford NLP |
| nilc-nlp/glove-300d (Hartmann et al.) | Embeddings GloVe | pt | 300 | no disponible en la informacion | Hugging Face |
| fastText (Bojanowski et al.) | Embeddings con subpalabras | 157 idiomas | 300 | MIT (codigo) / CC BY-SA (vectores) | Web de fastText |

La comparativa se limita a recursos de embeddings estaticos, ya que no existe un modelo generativo equivalente en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no admite instrucciones; su uso esta acotado al calculo de metricas de humor y a operaciones con embeddings.
- Cobertura lexica limitada al vocabulario de cada archivo `vocab.txt` o `1gram.csv`; las palabras fuera de vocabulario no tendran representacion.
- Los embeddings GloVe y skip-gram son estaticos: no capturan polisemia contextual ni dependencias de largo alcance.
- Los recursos de terceros incluidos tienen licencias distintas (PDDL para GloVe en, MIT para el codigo frances, CC BY 3.0 para los n-gramas); la licencia CC BY-SA 4.0 del repositorio exige atribucion y compartir igual, lo que puede condicionar su integracion en productos propietarios.
- El portugues depende de un repositorio externo (`nilc-nlp/glove-300d`); si ese recurso cambia o desaparece, la reproducibilidad se rompe.
- No hay resultados de benchmarks publicados que permitan validar la calidad de las representaciones en cada idioma.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni de mantenimiento a largo plazo.
- La cita academica esta pendiente ("To be announced"), lo que dificulta la atribucion formal en publicaciones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/NLP-CISUC/humetrix-resources
- Libreria Humetrix en GitHub: https://github.com/NLP-CISUC/Humetrix
- GloVe portugues (nilc-nlp): https://huggingface.co/nilc-nlp/glove-300d
- French-Word-Embeddings: https://github.com/Ismailhachimi/French-Word-Embeddings
- google-books-ngram-frequency: https://github.com/orgtre/google-books-ngram-frequency
- Portuguese-Ngram-Frequencies: https://github.com/Superar/Portuguese-Ngram-Frequencies
