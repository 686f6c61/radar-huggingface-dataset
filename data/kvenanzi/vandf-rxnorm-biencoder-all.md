# kvenanzi/vandf-rxnorm-biencoder-all

## Resumen

VANDF → RxNorm clinical drug bi-encoder es un modelo de recuperacion semantica (bi-encoder) desarrollado por el usuario kvenanzi (Kettle Labs) que traduce cadenas de texto del VA National Drug File (VANDF) a su equivalente en RxNorm, concretamente a nombres de *clinical drug* (SCD o SBD: principio activo, concentracion y forma farmaceutica). Esta construido sobre SapBERT (a su vez un fine-tune de PubMedBERT) y cuenta con 109.482.240 parametros, un modelo BERT-base de la familia encoder-only, con un max_seq_length de 96 tokens configurado en el entrenamiento.

El problema que resuelve es la normalizacion de medicacion entre vocabularios clinicos: unir listas de farmacos del sistema sanitario estadounidense (VANDF) con el estandar RxNorm es una tarea manual y propensa a errores, y este modelo la convierte en una busqueda vectorial sobre 27.287 nombres SCD/SBD activos de RxNorm. Su rasgo mas distintivo es la capa de calibracion: devuelve una probabilidad calibrada que permite enrutar automaticamente los casos dudosos a revision farmaceutica, con un umbral por defecto de 0,961 ajustado para un 99 % de precision.

Es relevante porque se entrena sobre las 14.369 cadenas VANDF que tienen un clinical drug en RxNorm, de modo que todas las familias de principios activos del fichero estan representadas en el entrenamiento, y porque publica una evaluacion honesta basada en validacion cruzada de siete pliegues (acc@1 agrupada de 0,894) en lugar de un test set propio. El modelo se publico con licencia Apache 2.0, solo soporta ingles y no es un modelo generativo: su salida son embeddings y rankings de candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bi-encoder transformer encoder-only (BERT-base); fine-tune de SapBERT-from-PubMedBERT-fulltext |
| Parametros totales | 109.482.240 (aproximadamente 109,5 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 96 tokens (max_seq_length de entrenamiento); el encoder base es un BERT con limite de posiciones de 512 |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas; al ser un encoder BERT admite fp32, fp16 y cuantizacion int8 mediante herramientas genericas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 0,4 GB); incluye ademas train_config.json, calibration.json y candidates.parquet |
| Pipeline | sentence-similarity |
| Modelo base | cambridgeltl/SapBERT-from-PubMedBERT-fulltext |
| Dataset de entrenamiento | kvenanzi/vandf-rxnorm-pairs |
| Tamano de descarga | aproximadamente 450 MB (pesos, configuracion de preprocesado, calibracion y candidatos) |
| Idioma de la documentacion | ingles |

## Arquitectura y entrenamiento

El modelo es un bi-encoder basado en SapBERT, el encoder de la familia PubMedBERT especializado en alineacion de entidades biomedicas. Genera un embedding por cadena y la recuperacion se hace por similitud coseno contra un indice de 27.287 nombres SCD/SBD activos de RxNorm empaquetados en `candidates.parquet`. El preprocesado de entrada incluye un normalizador determinista de concentraciones (heredado del primer modelo de la serie) que alinea variantes de dosis antes de la codificacion.

El entrenamiento usa `MultipleNegativesRankingLoss` sobre tripletas (cadena VANDF, nombre RxNorm, negativo duro), donde el negativo duro comparte principios activos pero difiere en concentracion o forma farmaceutica, lo que fuerza al modelo a discriminar precisamente los casos que mas se confunden en normalizacion de medicacion. La configuracion es de 1 epoca (la mediana de las mejores epocas de los pliegues de validacion cruzada), batch de 64, learning rate 2e-5, 10 % de warmup, fp16, max_seq_length 96 y semilla 42, sobre una unica A100 de Colab. Los datos son las 14.369 cadenas VANDF con SCD/SBD en RxNorm 2026-09-08 (14.372 pares), sin dejar ningun principio activo fuera del entrenamiento.

La innovacion principal no esta en la arquitectura sino en la calibracion: se ajusta una temperatura (0,0386) y una capa de Platt sobre tres caracteristicas ([coseno, margen top-1 menos top-2, log softmax]), entrenadas con las predicciones out-of-fold de 12.227 cadenas VANDF emparejadas y 819 farmacos reales sin SCD/SBD. Esto convierte la puntuacion de similitud en una probabilidad y permite fijar umbrales de aceptacion con garantias de precision.

## Capacidades

- Generacion de embeddings de frases para similitud semantica (`sentence-similarity`), no generacion de texto.
- Normalizacion de cadenas de farmacos VANDF a nombres de clinical drug de RxNorm (SCD/SBD).
- Entity linking/Mapping terminologico contra un indice de 27.287 nombres RxNorm activos.
- Recuperacion top-5 con recall@5 de 0,975 en la evaluacion agrupada out-of-fold.
- Puntuacion de confianza calibrada (probabilidad) con umbral por defecto de 0,961 orientado a 99 % de precision.
- Salida con metadatos de RxNorm: `rxcui`, `name`, `tty` (tipo de termino) y decision `accept`/`review`.
- Deteccion implicita de entradas sin correspondencia SCD/SBD, calibrada con 819 farmacos reales sin equivalente (por ejemplo, suministros como cateteres).
- Capacidades multilingues: no, solo ingles.
- Tool calling / function calling: no soportado (no es un modelo de lenguaje generativo).
- Agentes y razonamiento multi-paso: no soportado.
- Vision, audio y modos de pensamiento: no soportados.

## Casos de uso

- Normalizacion masiva de catalogos de farmacia: procesar un fichero VANDF completo y obtener el `rxcui` de cada cadena con una sola pasada por el encoder, sustituyendo un mapeo manual. El indice de candidatos ya viene incluido, por lo que no requiere construir un indice vectorial propio.
- Enrutado a revision farmaceutica: usando la probabilidad calibrada, aceptar automaticamente todo lo que supere 0,961 (cobertura en torno al 50 % con 98,6-99,8 % de precision en el pliegue retenido) y enviar el resto a un farmaceutico, reduciendo el volumen de revision manual sin degradar la seguridad.
- Enriquecimiento de registros de historia clinica: anadir codigos RxNorm a registros que solo contienen descripciones textuales de medicacion, habilitando analitica de utilizacion de farmacos y estudios de farmacovigilancia sobre datos ya codificados.
- Deduplicacion de listas de medicamentos: agrupar entradas que describen el mismo clinical drug pero con distinta concentracion o forma farmaceutica, un escenario donde el modelo se entreno explicitamente con negativos duros precisamente para no confundirlas.
- Interoperabilidad entre sistemas: puente entre un sistema legado basado en VANDF y aplicaciones que consumen RxNorm, exponiendo el endpoint como servicio de embeddings compatible con text-embeddings-inference.
- Sugerencia asistida en buscadores clinicos: mostrar los cinco primeros candidatos (recall@5 de 0,975) como recomendaciones cuando el top-1 no supera el umbral, manteniendo al humano en el bucle.
- Audiencias y control de calidad: auditar una base de datos de medicacion ya mapeada volviendo a puntuar las cadenas originales y detectando discrepancias de concentracion o forma farmaceutica.
- Procesamiento por lotes en pipelines ETL: al ser un encoder de 109,5 M de parametros, la inferencia sobre decenas de miles de cadenas cortas es viable en una sola GPU de gama media o incluso en CPU con batching.

## Benchmarks y rendimiento

Evaluacion por validacion cruzada de la receta en siete pliegues (particion y semilla unicas), con predicciones agrupadas out-of-fold. No es una medicion sobre este modelo concreto, ya que no tiene test set propio:

| Metrica | Valor agrupado out-of-fold | Rango entre los siete pliegues | n |
|---|---|---|---|
| acc@1 | 0,894 (Wilson 95 % 0,889-0,899) | 0,864-0,932 | 12.227 cadenas VANDF |
| recall@5 | 0,975 | 0,960-0,988 | 1.533-1.890 por pliegue |

Comparacion con el primer modelo de la serie en cadenas que ninguno de los dos entreno (nombres de etiquetas FDA, MTHSPL):

| Conjunto de cadenas | n | Primer modelo | Este modelo |
|---|---|---|---|
| Nombres de etiqueta FDA cuyos principios activos ambos entrenaron | 28.464 | 0,729 | 0,753 |
| Nombres de etiqueta FDA cuyos principios activos solo entreno este modelo | 13.492 | 0,716 | 0,746 |
| Cadenas VANDF que ambos entrenaron | 9.287 | 0,939 | 0,909 |

En la primera fila, 1.409 cadenas se responden correctamente solo por este modelo y 701 solo por el primer modelo (test de signos exacto, p aproximado de 2 x 10^-54).

Calibracion y umbrales sobre el pliegue retenido:

| Objetivo de precision | Umbral (agrupado) | Precision en el pliegue retenido | Cobertura |
|---|---|---|---|
| 95 % | 0,735 | 0,922-0,967 | en torno a 0,81 |
| 99 % (por defecto) | 0,961 | 0,986-0,998 | en torno a 0,50 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K y similares) en la informacion disponible; no aplican a un modelo de recuperacion de entidades.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los pesos ocupan aproximadamente 438 MB; en fp16, unos 219 MB; en int8, unos 109 MB. Con el indice de candidatos y los buffers de activaciones, el consumo total se situa en torno a 1-2 GB.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente (RTX 3060, RTX 4060, T4, L4, A10). El entrenamiento documentado se hizo en una A100, pero para inferencia es sobredimensionada.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada de los ultimos anos e incluso en GPUs integradas con memoria compartida suficiente. En CPU funciona con batching, adecuado para procesamiento por lotes.
- Opciones de despliegue: `sentence-transformers` (libreria declarada), text-embeddings-inference (etiqueta del repositorio), endpoints compatibles con Hugging Face Inference Endpoints, y el wrapper propio `rxnorm_vandf.infer.Mapper` instalable desde el repositorio de GitHub. vLLM y llama.cpp no aplican porque no es un modelo generativo.
- Latencia y throughput: no disponible. El unico dato de rendimiento publicado es el entrenamiento (batch 64 sobre una A100 de Colab). Al procesar cadenas de menos de 96 tokens, el throughput por lote es elevado, pero no se han publicado cifras de latencia.
- Almacenamiento: repositorio de 0,4 GB; descarga del paquete completo de inferencia en torno a 450 MB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kvenanzi/vandf-rxnorm-biencoder-all (este) | 109.482.240 | 96 tokens (entrenamiento) | acc@1 0,894 agrupada out-of-fold; 0,753 en nombres FDA | apache-2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| kvenanzi/vandf-rxnorm-biencoder (primer modelo de la serie) | no disponible | no disponible | 0,939 en cadenas VANDF compartidas; 0,729 en nombres FDA | no disponible | HuggingFace |
| cambridgeltl/SapBERT-from-PubMedBERT-fulltext (modelo base) | no disponible en la documentacion (misma familia BERT-base que el modelo derivado) | no disponible | no disponible para la tarea VANDF → RxNorm (es un modelo general de alineacion de entidades biomedicas) | no disponible | HuggingFace |
| Encoders de frases genericos (por ejemplo all-MiniLM-L6-v2) | no disponible | no disponible | no disponible; no estan entrenados sobre la tarea ni sobre negativos duros de concentracion y forma farmaceutica | no disponible | HuggingFace |

La informacion proporcionada no incluye comparaciones directas con encoders biomedicos alternativos ni con servicios propietarios de normalizacion de medicacion, por lo que no es posible establecer una comparativa cuantitativa mas alla de la serie del propio autor.

## Limitaciones y advertencias

- No tiene test set propio: la precision publicada (0,894 acc@1) proviene de validacion cruzada de la receta sobre una unica particion y una unica semilla, no de una medicion sobre estos pesos concretos.
- Entrenado unicamente con cadenas VANDF: en nombres de etiqueta FDA de estructura similar el acc@1 baja a aproximadamente 0,75, y el comportamiento sobre otros vocabularios no se ha medido.
- El indice de candidatos corresponde a RxNorm 2026-09-08. RxNorm se actualiza mensualmente, por lo que el modelo puede fallar en farmacos nuevos hasta que se reconstruya `candidates.parquet` con `scripts/03_build_dataset.py`.
- No es apto para uso clinico no supervisado. La propia documentacion recomienda usar la confianza calibrada para enrutar cadenas dudosas a un farmaceutico o emplear el top-5 como sugerencias.
- El umbral de 0,961 esta ajustado sobre una poblacion concreta (cadenas VANDF emparejadas y 819 farmacos sin SCD/SBD); los propios autores recomiendan recalibrar los umbrales sobre datos de validacion propios.
- Solo ingles: no procesa descripciones de medicacion en castellano ni en otros idiomas.
- Riesgo de confusion entre farmacos con los mismos principios activos y distinta concentracion o forma farmaceutica: es el error que el entrenamiento con negativos duros intenta mitigar, pero sigue siendo la fuente principal de fallo.
- El modelo puede devolver un candidato de alta similitud para entradas que no son farmacos (material sanitario, suministros), aunque la calibracion con farmacos sin SCD/SBD busca precisamente detectar estos casos.
- Adopcion practicamente nula en el momento de la consulta (0 descargas, 0 likes) y publicacion muy reciente, por lo que no hay validacion independiente por parte de terceros.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la responsabilidad sobre decisiones clinicas derivadas del mapeo recae en el integrador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kvenanzi/vandf-rxnorm-biencoder-all
- Modelo base SapBERT: https://huggingface.co/cambridgeltl/SapBERT-from-PubMedBERT-fulltext
- Primer modelo de la serie: https://huggingface.co/kvenanzi/vandf-rxnorm-biencoder
- Dataset de pares de entrenamiento: https://huggingface.co/datasets/kvenanzi/vandf-rxnorm-pairs
- Repositorio de codigo: https://github.com/kvenanzi/rxnorm
- Articulo tecnico (secciones 5.4-5.5): https://kettlelabs.dev/blog/posts/vandf-rxnorm-interventions/
- Registro de entrenamientos: https://wandb.ai/kettle-labs/rxnorm-vandf

Nota: la busqueda web realizada solo devolvio un resultado no relacionado (un portal de correo IServ, https://mail.iserv.eu/iserv/), sin informacion util sobre el modelo.
