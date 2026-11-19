# hedwigai/citeparse-32m

## Resumen

citeparse-32m es un modelo encoder de tipo ModernBERT, con 32 millones de parámetros, desarrollado por hedwigai y especializado en el etiquetado de campos dentro de cadenas de referencia bibliográfica (token classification). A partir de una referencia en texto plano, identifica autores, título, contenedor, fecha, volumen, número, páginas, DOI y ocho campos adicionales, que la librería citeparse transforma en CSL-JSON o BibTeX. Es el modelo por defecto del paquete `citeparse`, concebido como alternativa ligera a GROBID.

El modelo parte de `jhu-clsp/ettin-encoder-32m` y se ha afinado con una única época de clasificación de tokens en formato BIO sobre 16 etiquetas. Su interés actual reside en que resuelve la extracción estructurada de bibliografías con un coste computacional mínimo: procesa unas 118 referencias por segundo en CPU con 8 hilos, lo que permite integrarlo en pipelines de gestión de referencias sin GPU.

Frente a GROBID 0.8.1, un parser CRF ampliamente usado en el ámbito académico, citeparse-32m obtiene mejores resultados en el conjunto de evaluación independiente del autor (0,939 frente a 0,911 en campos correctos y 80,3 % frente a 71,1 % en referencias completamente correctas). La licencia Apache-2.0 y el tamaño reducido del repositorio (0,1 GB) facilitan su despliegue en entornos de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), fine-tuning para token classification |
| Parámetros totales | 32.043.681 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | token-classification |
| Modelo base | jhu-clsp/ettin-encoder-32m |
| Etiquetas de salida | 16 (esquema BIO) |
| Tamaño del repositorio | 0,1 GB |
| Dataset de entrenamiento | hedwigai/citeparse-wild-700 (evaluación); corpus de citas de GROBID y registros de Crossref (entrenamiento) |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT de 32 millones de parámetros afinado para clasificación de tokens con esquema BIO sobre 16 etiquetas, una por cada campo de referencia bibliográfica (autores, título, contenedor, fecha, volumen, número, páginas, DOI y ocho más). La tarea es, por tanto, etiquetado secuencial por token y no generación de texto: la conversión a CSL-JSON o BibTeX la realiza la librería `citeparse` a partir de las etiquetas.

El entrenamiento consistió en una sola época sobre dos fuentes: el corpus de citas de GROBID (licencia Apache-2.0), del que se eliminaron los ficheros de evaluación y toda referencia que apareciera en ellos, y registros de Crossref (CC0) reescritos en 11 estilos de citación con ruido de tecleo introducido. El código de entrenamiento está publicado en el repositorio `un-seen/citeparse`. No se indica en la información disponible si hubo fases de RLHF, DPO ni decodificación especulativa, algo esperable en un modelo de clasificación de tokens.

## Capacidades

- Etiquetado de campos de una referencia bibliográfica: autores, título, contenedor, fecha, volumen, número, páginas, DOI y ocho campos adicionales.
- Conversión de las etiquetas a CSL-JSON y BibTeX mediante el paquete `citeparse`.
- Procesamiento de referencias en 11 estilos de citación distintos, incluidos los habituales en publicaciones académicas en inglés.
- Robustez ante ruido de tecleo en la entrada, gracias a la inclusión de ruido sintético durante el entrenamiento.
- Inferencia en CPU con throughput de aproximadamente 118 referencias por segundo con 8 hilos.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio: es un modelo de clasificación de tokens, no un modelo generativo.
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.

## Casos de uso

- Gestión de bibliografías en gestores de referencias: el modelo etiqueta cada referencia y la librería la convierte a BibTeX o CSL-JSON, lo que permite importar listas de referencias en texto plano a Zotero, Mendeley o JabRef sin intervención manual.
- Migración de bibliografías heredadas: digitalización de listas de referencias en PDF o texto extraído por OCR, corrigiendo los campos estructurados con un parser que tolera ruido de tecleo y errores de extracción.
- Enriquecimiento de repositorios institucionales: extracción de DOI y metadatos de las referencias citadas en artículos para enlazarlas con registros de Crossref y construir grafos de citación.
- Verificación de citas en revisión editorial: comprobación automática de que los campos de cada referencia (título, contenedor, páginas, DOI) son coherentes con el registro del trabajo citado, aprovechando el rendimiento de 118 referencias por segundo en CPU.
- Sustitución ligera de GROBID en pipelines de bajo recursos: despliegue en contenedores sin GPU para procesar lotes de referencias en servidores modestos, con un consumo de memoria reducido gracias a los 32 millones de parámetros.
- Normalización de referencias para búsqueda y deduplicación: extracción de autor, año y título para agrupar referencias duplicadas o generar claves de búsqueda en bases de datos bibliográficas.
- Procesamiento por lotes de corpus científicos: extracción de la sección de referencias de miles de artículos en un pipeline ETL, con salida directa a un formato estructurado consumible por bases de datos relacionales o motores de búsqueda.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto `hedwigai/citeparse-wild-700`: 700 referencias reales de Crossref, puntuadas contra el registro Crossref de la obra citada, sin que ninguno de esos DOI estuviera en el entrenamiento. A GROBID se le aplicó la misma regla de DOI que a citeparse.

| Parser | Todos los campos | Referencias totalmente correctas | Título | Contenedor |
|---|---|---|---|---|
| GROBID 0.8.1 (CRF) | 0,911 | 71,1 % | 0,882 | 0,805 |
| citeparse-32m | 0,939 | 80,3 % | 0,921 | 0,858 |
| citeparse-150m | 0,952 | 83,4 % | 0,934 | 0,878 |

El autor señala además que GROBID gana en su propio conjunto de citas reservadas: 0,943 frente a 0,867 de este modelo, aunque esas citas proceden de las mismas fuentes que los datos de entrenamiento de GROBID. En CPU con 8 hilos, citeparse-32m procesa aproximadamente 118 referencias por segundo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 32 millones de parámetros en safetensors, los pesos ocupan del orden de 128 MB en fp32 y alrededor de 64 MB en fp16, cantidades que permiten ejecución en CPU sin GPU.
- GPU recomendadas: no se especifican; el modelo está pensado para inferencia en CPU y cualquier GPU consumer (por ejemplo, RTX 4090) lo ejecutaría con holgura, aunque no se aportan cifras de latencia en GPU.
- Cabe en cualquier GPU consumer y en entornos sin GPU; el autor documenta el rendimiento en CPU con 8 hilos (unas 118 referencias por segundo).
- Opciones de despliegue: la librería `citeparse` (instalable con `pip install citeparse`), que envuelve el modelo; al ser un modelo de `transformers`, puede servirse también con las herramientas habituales compatibles con esa librería (TGI, endpoints de inferencia), aunque la información disponible no detalla configuraciones específicas para vLLM, llama.cpp u Ollama.
- Latencia y throughput: aproximadamente 118 referencias por segundo en CPU con 8 hilos; no se publican datos de latencia por referencia ni de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Referencias totalmente correctas (citeparse-wild-700) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| citeparse-32m | 32 M | no disponible | Encoder ModernBERT, token classification | 80,3 % | Apache-2.0 | Hugging Face, paquete `citeparse` |
| citeparse-150m | no disponible | no disponible | Encoder, token classification | 83,4 % | no disponible | Hugging Face (según el autor) |
| GROBID 0.8.1 | no disponible | no disponible | CRF | 71,1 % | Apache-2.0 | Software autoalojado |

El autor solo aporta datos comparativos frente a GROBID 0.8.1 y frente a la variante mayor citeparse-150m; no se dispone de comparaciones con otros parsers de referencias en la información proporcionada.

## Limitaciones y advertencias

- Entrenado únicamente con estilos de citación en inglés; el rendimiento en referencias en otros idiomas no está documentado.
- Etiqueta una sola referencia cada vez: es necesario dividir previamente la bibliografía en líneas antes de pasarla al modelo.
- «et al.» se etiqueta como un autor literal, lo que puede requerir postprocesado en la salida.
- Riesgo de error en campos concretos: el 80,3 % de referencias completamente correctas implica que aproximadamente una de cada cinco referencias presenta al menos un campo mal etiquetado.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- En el conjunto de evaluación propio de GROBID, este supera al modelo (0,943 frente a 0,867), por lo que la ventaja observada depende del conjunto de prueba.
- No se han documentado sesgos específicos más allá de la limitación idiomática y de dominio (referencias académicas en inglés).
- Licencia Apache-2.0: permite uso comercial, pero conviene conservar los avisos de licencia y revisar las condiciones de los datos de entrenamiento derivados de GROBID (Apache-2.0) y Crossref (CC0).
- Al ser un modelo de clasificación de tokens, no genera texto ni mantiene conversaciones: no debe emplearse para tareas generativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hedwigai/citeparse-32m
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-32m
- Repositorio del paquete y código de entrenamiento: https://github.com/un-seen/citeparse
- Código de entrenamiento: https://github.com/un-seen/citeparse/tree/main/train
- Dataset de evaluación: https://huggingface.co/datasets/hedwigai/citeparse-wild-700
- GROBID: no disponible en la información proporcionada
