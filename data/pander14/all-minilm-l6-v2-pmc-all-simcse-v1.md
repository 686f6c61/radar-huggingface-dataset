# pander14/all-minilm-l6-v2-pmc-all-simcse-v1

## Resumen

`pander14/all-minilm-l6-v2-pmc-all-simcse-v1` es un modelo de embeddings de frases en ingles desarrollado por el usuario pander14, obtenido mediante ajuste autosupervisado SimCSE sobre el encoder `sentence-transformers/all-MiniLM-L6-v2`. No es un modelo generativo: su funcion es proyectar frases y parrafos a un espacio vectorial denso de 384 dimensiones, conservando exactamente la interfaz del modelo base, de modo que puede sustituirlo sin cambios en cualquier pipeline existente.

El problema que resuelve es la adaptacion de un encoder de proposito general al dominio biomedico y de texto cientifico. El autor lo ha entrenado sobre 397.850 pasajes procedentes de 21.283 familias de articulos derivados de PubMed Central (PMC), lo que desplaza la representacion semantica hacia terminologia y relaciones propias de la literatura biomedica.

Con 22.713.216 parametros (unos 22,7 M) y un tamano de repositorio de 0,1 GB, es un modelo muy ligero que se ejecuta en CPU sin dificultad y que resulta relevante para busqueda semantica, recuperacion de informacion (RAG) y agrupamiento sobre corpus cientificos. Su limitacion principal es que el autor no ha publicado todavia una evaluacion comparativa frente al modelo base en conjuntos de test externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT, variante MiniLM de 6 capas (base: `sentence-transformers/all-MiniLM-L6-v2`) |
| Parametros totales | 22.713.216 (22,7 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 256 tokens (longitud maxima de secuencia usada en el entrenamiento) |
| Tipos de cuantizacion | no disponible en este repositorio; solo se distribuyen pesos en safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Dimension de embedding | 384 |
| Capas del encoder | 6 |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un encoder transformer tipo BERT reducido a 6 capas y 384 dimensiones ocultas, entrenado originalmente por sentence-transformers con destilacion de conocimiento y ajuste contrastivo. La salida es un vector denso de 384 dimensiones por frase, con posibilidad de normalizacion L2 para usar similitud coseno. Al conservar la misma dimension de embedding, el checkpoint es intercambiable con el modelo base en indices vectoriales existentes sin necesidad de reindexar ni de cambiar la configuracion de la base de datos.

El ajuste se realizo con SimCSE autosupervisado: cada pasaje se codifico dos veces con mascaras de dropout independientes y los demas pasajes del minibatch actuaron como negativos contrastivos. No se emplearon etiquetas clinicas, causales ni juicios de relevancia anotados manualmente. Los hiperparametros declarados por el autor son: 397.850 pasajes de entrenamiento, 21.283 familias de articulos, 1 epoca, batch size de 256, learning rate de 2e-5 y longitud maxima de secuencia de 256 tokens. El corpus de origen no se distribuye en el repositorio y su reutilizacion queda sujeta a los derechos y licencias de la fuente original.

## Capacidades

- Generacion de embeddings de frases y parrafos en ingles con salida de 384 dimensiones, normalizable para similitud coseno.
- Busqueda semantica y recuperacion densa de pasajes sobre corpus biomedicos y cientificos.
- Calculo de similitud textual entre frases, titulos y abstracts.
- Agrupamiento (clustering) de documentos por cercania semantica en el espacio de embeddings.
- Deduplicacion y deteccion de near-duplicates en colecciones de articulos.
- Uso como extractor de caracteristicas congelado para clasificacion downstream sobre texto cientifico.
- Integracion como componente de recuperacion en arquitecturas RAG.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, capacidades de agente ni modo de pensamiento: es exclusivamente un encoder de embeddings.
- Text embeddings inference: el repositorio incluye la etiqueta `text-embeddings-inference` y `endpoints_compatible`, por lo que es desplegable en Hugging Face Text Embeddings Inference y en Inference Endpoints.

## Casos de uso

- Recuperacion de literatura biomedica: indexar los 384 vectores de cada abstract en una base vectorial y responder consultas en lenguaje natural mediante busqueda por similitud coseno, aprovechando que el modelo fue adaptado al vocabulario de PMC.
- Pipeline RAG sobre articulos cientificos: usar el modelo como retriever para seleccionar los pasajes relevantes antes de pasarlos a un modelo generativo, reduciendo el coste frente a encoders de mayor tamano.
- Revisión sistematica asistida: agrupar por similitud miles de referencias y detectar grupos tematicos o duplicados antes de la criba manual.
- Deduplicacion de repositorios documentales: calcular embeddings de todos los documentos y marcar pares por encima de un umbral de similitud como posibles duplicados.
- Clasificacion de textos cientificos: usar los embeddings como entrada de un clasificador ligero (regresion logistica, SVM) para etiquetar articulos por area tematica o tipo de estudio.
- Motor de busqueda interno para equipos de I+D: desplegar el modelo detras de una API de embeddings y ofrecer busqueda semantica sobre documentacion tecnica y publicaciones internas.
- Sistemas de recomendacion de contenido cientifico: sugerir articulos similares a uno dado comparando su vector con el del resto del catalogo.
- Preprocesado en entornos con recursos limitados: al ocupar decimas de GB, puede ejecutarse en CPU dentro del mismo contenedor que el resto del servicio, sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que el checkpoint se verifico unicamente en cuanto a que carga correctamente y produce embeddings de 384 dimensiones, y que no ha sido comparado todavia con el modelo base MiniLM sobre conjuntos de test externos o especificos de aplicacion. Se recomienda evaluarlo sobre datos representativos propios antes de usarlo en produccion.

## Requisitos de hardware

- Inferencia en CPU: viable sin GPU. Con 22,7 M de parametros, los pesos ocupan aproximadamente 91 MB en fp32 y unos 45 MB en fp16.
- VRAM estimada en GPU: inferior a 1 GB en fp16 para el modelo, mas el espacio de activaciones, que depende del batch y de la longitud de secuencia (maximo 256 tokens).
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria, incluidas GTX 1650, RTX 3060, RTX 4090, A100 o H100. El modelo no requiere GPU de gama alta.
- Cabe holgadamente en cualquier GPU de consumo e incluso en dispositivos de borde y en CPU.
- Opciones de despliegue: `sentence-transformers` (libreria nativa del modelo), Hugging Face Text Embeddings Inference (etiqueta `text-embeddings-inference` presente en el repositorio) y Hugging Face Inference Endpoints (`endpoints_compatible`). Tambien es registrable desde la libreria `llm-sentence-transformers`.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension de embedding | Contexto maximo | Licencia | Notas |
|---|---|---|---|---|---|
| `pander14/all-minilm-l6-v2-pmc-all-simcse-v1` | 22,7 M | 384 | 256 tokens | Apache-2.0 | Ajustado con SimCSE sobre 397.850 pasajes de PMC; sin benchmarks publicados |
| `sentence-transformers/all-MiniLM-L6-v2` | 22,7 M | 384 | 256 tokens | Apache-2.0 | Modelo base, proposito general, ampliamente usado y evaluado en MTEB |
| `sentence-transformers/all-mpnet-base-v2` | 109 M | 768 | 384 tokens | Apache-2.0 | Mayor tamano y dimension; mayor coste de inferencia y almacenamiento |
| Alternativas basadas en PubMedBERT (por ejemplo, `pritamdeka/S-PubMedBert-MS-MARCO`) | no disponible | no disponible | no disponible | no disponible | Encoders de dominio biomedico; datos no verificados en la informacion disponible |

La ventaja principal frente al modelo base es la adaptacion al dominio biomedico manteniendo identica huella de memoria y dimension de vector. La desventaja es la ausencia de evaluacion publica que cuantifique esa mejora: hasta que no existan resultados en MTEB, en conjuntos de recuperacion biomedica o en test propios, la comparacion de rendimiento con el modelo base y con alternativas de dominio queda como no disponible.

## Limitaciones y advertencias

- No es un modelo de generacion de texto ni de razonamiento: solo produce embeddings.
- Solo soporta ingles (`en`); su uso con textos en castellano no esta validado y probablemente degradara la calidad de los vectores.
- La longitud de secuencia esta limitada a 256 tokens, por debajo de los 512 habituales en encoders BERT; los textos largos se truncaran salvo que se dividan previamente en fragmentos.
- El autor advierte explicitamente de que no es un modelo de soporte a la decision clinica y no esta validado para diagnostico, seleccion de tratamiento, inferencia causal ni prediccion a nivel de paciente.
- Los embeddings cientificos pueden reproducir sesgos, omisiones, hallazgos obsoletos y terminologia presentes en la literatura de origen.
- Una puntuacion de similitud alta no constituye evidencia de validez clinica ni de relacion causal.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no genera texto; el riesgo equivalente es la recuperacion de pasajes irrelevantes o mal ordenados si el dominio de uso difiere del corpus de entrenamiento.
- Licencia Apache-2.0 en el repositorio, que permite uso comercial del modelo. Sin embargo, el corpus PMC usado para el ajuste no se distribuye y su reutilizacion queda sujeta a los derechos y condiciones de acceso de la fuente original; el autor traslada al usuario la responsabilidad de cumplir esas condiciones.
- Sin benchmarks publicados ni validacion frente al modelo base: no hay garantia cuantificada de mejora sobre `all-MiniLM-L6-v2` en una tarea concreta.
- Cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- El repositorio ocupa 0,1 GB y la fecha declarada de creacion es 2026-10-08, con actualizacion cuatro segundos despues, lo que sugiere una publicacion sin mantenimiento posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pander14/all-minilm-l6-v2-pmc-all-simcse-v1
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- README del modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/blob/main/README.md
- Libreria `llm-sentence-transformers` en PyPI: https://pypi.org/project/llm-sentence-transformers/
- Repositorio de referencia de all-MiniLM-L6-v2: https://github.com/henrytanner52/all-MiniLM-L6-v2
- README de all-MiniLM-L6-v2 en GitHub: https://github.com/SarinSuv/all-MiniLM-L6-v2/blob/main/README.md
