# jed351/hong-kong-taiwan-chinese-classifier

## Resumen

`jed351/hong-kong-taiwan-chinese-classifier` (nombre interno `hkness`) es un clasificador binario de texto que estima la probabilidad de que un fragmento en chino tradicional haya sido escrito en estilo de Hong Kong frente al estilo de Taiwan. Lo desarrolla el usuario independiente jed351 y se publica bajo licencia Apache 2.0. No es un modelo neuronal: es una regresion logistica sobre n-gramas de caracteres (1 a 3) con hashing de 2^22 caracteristicas, implementada con scikit-learn y distribuida como fichero `.npz` de unos 16 MB.

El problema que resuelve es concreto: Hong Kong y Taiwan comparten escritura en chino tradicional, pero difieren sistematicamente en lexico, registro y variantes de caracteres (軟件/軟體, 網上/線上, 質素/品質, 裏/裡, 着/著). El modelo convierte esas diferencias en una unica puntuacion `p_hk`, calibrada sobre clases balanceadas. Incluye un modo `style` por defecto que enmascara toponimos y nombres de instituciones de ambas regiones para que el clasificador no se deje arrastrar por el tema del documento.

Su relevancia practica esta en el coste: no requiere GPU, tokenizador ni jieba, puntua del orden de 5.500 documentos por segundo (1,1 M de caracteres por segundo) por nucleo de CPU y ofrece trazabilidad mediante `explain()`, que lista los n-gramas que empujaron la decision hacia HK o hacia TW. Esta entrenado sobre 905.000 fragmentos web de dominios `.hk` y `.tw` extraidos de Common Crawl 2025-2026 y evaluado sobre dominios reservados, no vistos en entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica binaria sobre n-gramas de caracteres (1-3) con hashing de 2^22 caracteristicas y normalizacion L2 |
| Parametros totales | no disponible (pesos dispersos de un modelo lineal; fichero `.npz` de ~16 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; acepta fragmentos de 30 a 1.500 caracteres (rango de entrenamiento) y puntua documentos completos |
| Tipos de cuantizacion | no aplica (pesos en coma flotante de scikit-learn/numpy) |
| Idiomas soportados | chino tradicional (`zh`), en registro de chino escrito; el cantonés se admite como entrada y puntua como HK |
| Licencia | Apache 2.0 |
| Formato de pesos | `.npz` (numpy/scikit-learn), descargado desde Hugging Face Hub |
| Libreria | scikit-learn |
| Pipeline | text-classification |
| Metricas declaradas | ROC-AUC, accuracy |
| Entrada del modelo | dos variantes: `style` (toponimos enmascarados, por defecto) y `full` (sin enmascarar) |
| Salida | `p_hk` en [0, 1]; etiquetas `HK` (p >= 0,8), `TW` (p <= 0,2) e `uncertain` |
| Dependencias | numpy, scikit-learn, pandas, huggingface_hub |

## Arquitectura y entrenamiento

El modelo es un clasificador lineal clasico, sin transformer ni red neuronal profunda. Cada texto se convierte en n-gramas de caracteres de longitud 1 a 3, se aplica hashing a 2^22 dimensiones, se normaliza en L2 y los digitos se sustituyen por 0. Sobre esas caracteristicas se entrena una regresion logistica con descenso de gradiente estocastico y perdida logaritmica, con `alpha = 3e-7` seleccionado por log-loss sobre el conjunto de test. No hay tokenizador ni dependencia de jieba en la inferencia; el analisis lexico con jieba se reserva para construir el lexico regional auxiliar.

Los datos de entrenamiento proceden de los volcados 2025-2026 de Common Crawl (22 crawls, de CC-MAIN-2025-05 a CC-MAIN-2026-43), procesados con `c4-dataset-script` y deduplicados con MinHash entre volcados. La etiqueta de region es el dominio de nivel superior del hostname: 2,29 M documentos HK (19.700 dominios) y 15,3 M documentos TW (81.000 dominios). Solo se conservan documentos etiquetados como chino escrito (`swc` o `neutral`) por CantoneseDetect, excluyendo el cantonés (aproximadamente el 11 % de los documentos `.hk`) para que el modelo aprenda chino escrito de Hong Kong. Se limita a unos 300 documentos por dominio, se eliminan paginas SEO de casinos en linea y se extrae una ventana aleatoria por documento con longitud log-uniforme entre 30 y 1.500 caracteres. No se documenta RLHF, DPO ni ajuste por preferencias.

Como innovacion destacable, el enmascaramiento de toponimos y nombres de instituciones (香港, 銅鑼灣, 台北, 立法院) reduce el sesgo tematico: el modelo `full` sin enmascarar obtiene AUC 0,943 frente a 0,940 del `style`, lo que confirma que los nombres propios aportan muy poco. El repositorio incluye ademas un lexico regional construido con log-odds de frecuencia documental con prior de Dirichlet informativo (Monroe et al., 2008) sobre 108.000 palabras segmentadas con jieba.

## Capacidades

- Clasificacion binaria de variedad regional (Hong Kong frente a Taiwan) en chino tradicional, con probabilidad calibrada `p_hk`.
- Etiquetado de tres clases operativo: `HK` (p >= 0,8), `TW` (p <= 0,2) y `uncertain`, lo que permite abstenerse en casos ambiguos.
- Explicabilidad por n-gramas mediante `explain()`, que devuelve el logit y las contribuciones individuales hacia HK y hacia TW.
- Robustez al tema gracias al enmascaramiento de toponimos y entidades politicas en el modelo `style`.
- Funcionamiento sobre entradas cortas y largas: entrenado con ventanas de 30 a 1.500 caracteres y evaluado por tramos de longitud.
- Deteccion implicita de cantonés como senal de HK: una frase como 我哋今日去咗食嘢 puntua 0,94, aunque el cantonés se excluyo del entrenamiento.
- Procesamiento por lotes desde linea de comandos sobre parquet, CSV, JSONL o TXT (`hkness-score`), generando un CSV con `p_hk` y la etiqueta `hk_tw`.
- Analisis lexico auxiliar: listas de las 500 palabras mas distintivas por region, 57 pares de terminos HK/TW validados y tabla de variantes de caracteres estandar (裏/裡, 綫/線, 着/著, 衞/衛).
- No soporta tool calling, agentes, vision, audio ni generacion de texto: es exclusivamente un clasificador.

## Casos de uso

- Curacion de corpus para entrenamiento de LLM: filtrar o etiquetar por variedad regional grandes volcados web en chino tradicional antes de mezclar datos, usando el modo por lotes sobre JSONL o parquet con un throughput de 5.500 documentos por segundo y nucleo.
- Enrutado de localizacion en productos: decidir automaticamente si un texto de interfaz o de ayuda debe mostrarse con terminologia de Hong Kong (軟件, 網上, 質素) o de Taiwan (軟體, 線上, 品質), a partir de la puntuacion `p_hk`.
- Auditoria de contenido generado o traducido: verificar que una traduccion al chino tradicional destinada a Taiwan no ha heredado lexico de Hong Kong, o al reves, midiendo el desplazamiento de `p_hk` respecto al original.
- Analisis de medios y redes sociales: clasificar articulos y comentarios por variedad linguistica para estudios de recepcion, segmentacion de audiencias o deteccion de republicacion cruzada entre medios de ambas regiones.
- Control de calidad de traduccion automatica: integrar el scorer en un pipeline de evaluacion que marque segmentos con `p_hk` incoherente respecto a la variante solicitada, usando `explain()` para localizar los terminos problematicos.
- Investigacion linguistica y sociolinguistica: cuantificar la penetracion de variantes de caracteres y lexico regional en corpus web, apoyandose en `lexicon_written.csv.gz` y en la tabla de variantes.
- Moderacion y deduplicacion de contenido: detectar republicacion de textos taiwaneses en sitios `.hk` (y viceversa), una fuente conocida de ruido en las etiquetas segun el propio autor.
- Normalizacion de catalogos y busqueda: mapear consultas y documentos entre variantes regionales usando los 57 pares de terminos validados y la tabla de variantes de caracteres.

## Benchmarks y rendimiento

Evaluacion sobre el conjunto de test de dominios reservados (10 % de dominios nunca vistos en entrenamiento), 75.150 fragmentos balanceados HK/TW, modelo `style` por defecto:

| Longitud del texto (caracteres) | AUC | Accuracy | Porcentaje puntuado con confianza (p <= 0,2 o >= 0,8) | Accuracy cuando hay confianza |
|---|---|---|---|---|
| <= 50 | 0,889 | 80,4 % | 53 % | 92,5 % |
| 50-100 | 0,925 | 84,5 % | 62 % | 94,4 % |
| 100-200 | 0,947 | 87,4 % | 70 % | 95,2 % |
| 200-500 | 0,965 | 89,9 % | 78 % | 96,2 % |
| 500+ | 0,974 | 91,4 % | 83 % | 96,7 % |
| Global | 0,940 | 86,2 % | no disponible | no disponible |

Comparaciones internas reportadas por el autor:

| Variante o baseline | AUC |
|---|---|
| Modelo `style` (toponimos enmascarados) | 0,940 |
| Modelo `full` (sin enmascarar) | 0,943 |
| Complement Naive Bayes sobre las mismas caracteristicas | 0,904 |

Prueba de sensibilidad lexica: al sustituir terminos taiwaneses por sus equivalentes de Hong Kong (lista de 57 pares) en 7.800 fragmentos taiwaneses reservados, `p_hk` aumento en el 99,9 % de ellos. Rendimiento de inferencia declarado: aproximadamente 5.500 documentos por segundo (1,1 M de caracteres por segundo) por nucleo de CPU.

## Requisitos de hardware

- VRAM: ninguna; el modelo se ejecuta en CPU con numpy y scikit-learn.
- GPU: no necesaria ni soportada de forma nativa; no hay backend de GPU documentado.
- CPU: cualquier procesador moderno sirve; el rendimiento escala linealmente con nucleos, a unas 5.500 documentos por segundo por nucleo.
- Memoria RAM: minima; el fichero de pesos ocupa unos 16 MB y las dependencias (numpy, scikit-learn, pandas) dominan el consumo.
- Cabe en cualquier equipo, incluidos portatiles de gama baja, contenedores pequenos y funciones serverless.
- Despliegue: paquete Python via `pip install git+https://github.com/jedcheng/hong-kong-taiwan-chinese-classifier`; uso como libreria (`Scorer`) o como CLI (`hkness-score`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo lineal de scikit-learn.
- Latencia: no se publica una cifra de latencia por peticion; el throughput agregado de 5.500 documentos por segundo por nucleo implica tiempos del orden de microsegundos a milisegundos por documento segun longitud.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| jed351/hong-kong-taiwan-chinese-classifier (`hkness`) | Regresion logistica sobre n-gramas de caracteres | Modelo lineal, fichero de ~16 MB | No aplica (ventanas de 30-1.500 caracteres) | AUC 0,940; accuracy 86,2 % global en test por dominios | Apache 2.0 | Hugging Face Hub y GitHub |
| Complement Naive Bayes (baseline del autor) | Naive Bayes multinomial sobre las mismas caracteristicas | no disponible | No aplica | AUC 0,904 | no disponible | Solo como referencia interna en la model card |
| CantoneseDetect (CanCLID) | Detector de cantonés escrito | no disponible | no disponible | no disponible | no disponible | GitHub (usado como filtro en el entrenamiento) |
| LLM generativos multilingues de gran tamano | Transformer decoder | Miles de millones | Decenas de miles de tokens | No comparable directamente; no hay evaluacion publicada de esta tarea especifica | Variada | Varios |

No se dispone de datos publicados que permitan comparar este clasificador con otros modelos especificos de identificacion de variedad HK/TW; la unica comparacion cuantitativa disponible es la del baseline Naive Bayes incluida por el autor.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento provienen del dominio del sitio (`.hk` / `.tw`), no de anotacion humana, por lo que parte del error residual es ruido de etiqueta: sitios de Hong Kong que republican textos taiwaneses y viceversa.
- `p_hk` esta calibrada asumiendo clases balanceadas (HK y Taiwan igual de probables a priori); en poblaciones con otra proporcion real la probabilidad no es directamente interpretable sin recalibracion.
- El rendimiento cae en textos cortos: con 50 caracteres o menos el AUC es 0,889 y solo el 53 % de los fragmentos recibe una puntuacion confiada.
- El modelo aprende chino escrito de Hong Kong; el cantonés se excluyo del entrenamiento (aproximadamente el 11 % de los documentos `.hk`), aunque las entradas en cantonés tienden a puntuar como HK.
- Solo cubre chino tradicional y las variedades de Hong Kong y Taiwan; no distingue otras regiones de uso de chino tradicional (Macao, comunidades de ultramar) ni chino simplificado.
- El enmascaramiento de toponimos del modo `style` puede eliminar senal util en textos donde la variante regional se manifiesta precisamente en toponimos; el autor recomienda `full` solo cuando el tema no sea un factor de confusion.
- Es un clasificador, no un generador: no produce texto, no soporta tool calling ni razonamiento multi-paso, y no debe usarse para tareas fuera de la identificacion de variedad.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan garantias, sesgos sistematicos por tipo de dominio ni evaluacion en dominios distintos de la web (por ejemplo, conversacion oral transcrita o texto literario).
- El modelo se publico con 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por terceros; los resultados proceden unicamente de la evaluacion del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jed351/hong-kong-taiwan-chinese-classifier
- Codigo fuente: https://github.com/jedcheng/hong-kong-taiwan-chinese-classifier
- Dataset de entrenamiento: https://huggingface.co/datasets/jed351/Traditional-Chinese-Web-Data
- Script de construccion del corpus: https://github.com/jedcheng/c4-dataset-script
- CantoneseDetect (filtro de cantonés): https://github.com/CanCLID/cantonesedetect
- Referencia metodologica del lexico (Monroe et al., 2008): no disponible como enlace en la informacion proporcionada
