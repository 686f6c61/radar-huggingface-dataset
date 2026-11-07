# blackmlengineer/industrybench-anzsic-l2-graded

## Resumen

`blackmlengineer/industrybench-anzsic-l2-graded` no es un modelo de lenguaje, sino un conjunto de datos de evaluación para tareas de recuperación y clasificación jerárquica de empresas según la taxonomía sectorial australiana ANZSIC 2006, en su nivel 2 (subdivisiones). Lo publica el usuario `blackmlengineer` en Hugging Face y sigue el formato BEIR (`queries`, `corpus`, `qrels`) empleado por otros benchmarks de relevancia graduada como los de TechWolf. El corpus contiene únicamente 85 documentos, correspondientes a los 85 códigos de subdivisión de ANZSIC 2006, y las consultas son descripciones de empresas etiquetadas contra esos códigos con dos grados de relevancia.

El interés del recurso está en que permite evaluar sistemas de clasificación sectorial y de retrieval jerárquico con métricas de relevancia graduada (nDCG, MAP) sobre un dominio económico concreto, y en que comparte empresas, particiones y deduplicación con los datasets hermanos de NAICS, ISIC y NACE, lo que posibilita comparaciones directas entre taxonomías. No obstante, las etiquetas son derivadas y no anotadas por humanos: se obtienen encadenando dos conversiones (NAICS → ISIC Rev.4 → ANZSIC 2006), lo que introduce ambigüedad considerable, especialmente en los niveles más finos.

El repositorio tiene un tamaño de 0,0 GB, cero descargas y cero likes en el momento de la consulta, y su licencia figura como `other` con un TODO explícito en la model card indicando que la procedencia y los términos de reutilización aún no se han confirmado. No hay pipeline declarado ni pesos de modelo asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (es un dataset, no un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | other (placeholder según la propia model card, pendiente de confirmar) |
| Formato de pesos | Parquet (configs `queries`, `corpus`, `qrels`) |

Especificaciones del dataset:

| Parametro | Valor |
|---|---|
| Tarea | text-retrieval, text-classification, hierarchical-classification |
| Niveles de taxonomía incluidos | división (letra), subdivisión (2 dígitos), grupo (3 dígitos), clase (4 dígitos) |
| Documentos del corpus | 85 (solo títulos, sin cuerpo de texto) |
| Consultas train / validation / test | 98.604 / 12.344 / 12.391 |
| Juicios qrels train / validation / test | 823.709 / 102.713 / 104.457 |
| Escala de relevancia | 2 = alcanzado desde el código NAICS primario; 1 = alcanzado solo desde códigos secundarios |
| Tamaño del repositorio | 0,0 GB |
| Categoría de tamaño declarada | 100K < n < 1M |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: no hay arquitectura de red ni proceso de entrenamiento. El artefacto es un dataset de evaluación construido a partir de descripciones de empresas con etiquetas NAICS primarias y secundarias, procedentes del dataset companion de NAICS. La derivación de las etiquetas ANZSIC se realiza en dos saltos: primero, los códigos NAICS se mapean a clases ISIC Rev.4 mediante el crosswalk del Census; después, cada clase ISIC se mapea a clases ANZSIC 2006 con la correspondencia oficial del ABS entre ISIC Rev.4 y ANZSIC 2006, tomando la unión de ambas direcciones. Finalmente, las clases ANZSIC se agregan hacia arriba (grupo, subdivisión, división) para mantener coherencia entre niveles.

La innovación metodológica destacable es el esquema de relevancia graduada: se asigna grado 2 a los códigos ANZSIC alcanzados desde el código NAICS primario de la empresa y grado 1 a los alcanzados solo desde códigos secundarios, con partición de pesos uniforme en cada salto porque las tablas de correspondencia no incluyen pesos. Se aplica deduplicación de descripciones idénticas en validation y test (25 en cada una), fusionando juicios con unión de etiquetas y grado máximo, y se eliminan del train las descripciones que aparecen en validation o test. Cabe señalar que ANZSIC no anida dentro de ISIC: la correspondencia es de muchos a muchos y la mitad de las 419 clases ISIC mapean a dos o más clases ANZSIC (hasta 21), lo que multiplica la ambigüedad.

## Capacidades

- Evaluación de recuperación de información (retrieval) con juicios de relevancia graduada en formato BEIR.
- Evaluación de clasificación jerárquica multietiqueta sobre cuatro niveles de la taxonomía ANZSIC 2006.
- Cálculo de métricas graduadas como nDCG y MAP a nivel de división, subdivisión, grupo y clase.
- Carga directa con `datasets.load_dataset` especificando las configs `queries`, `corpus` y `qrels`.
- Compatibilidad declarada con `GradedBEIRRankingTask` de WorkRB.
- Comparabilidad con los datasets hermanos de NAICS, ISIC Rev.4 y NACE al compartir empresas, particiones y deduplicación.
- Cobertura de las 85 subdivisiones de ANZSIC 2006 en el corpus.
- Idioma: únicamente inglés.

## Casos de uso

- Evaluación de sistemas de clasificación sectorial: un pipeline que asigne códigos ANZSIC a descripciones de empresas puede medirse contra este dataset con nDCG y MAP, usando las particiones de validation y test para evitar fuga de datos.
- Benchmarking de modelos de embeddings para retrieval: al seguir el layout BEIR, se puede indexar el corpus de 85 documentos y evaluar recuperadores densos o dispersos sobre 12.391 consultas de test con juicios graduados.
- Comparación entre taxonomías económicas: dado que las mismas empresas aparecen en los datasets de NAICS, ISIC y NACE, un equipo puede medir si su sistema rinde mejor en una taxonomía que en otra y cuantificar el efecto de las conversiones entre jerarquías.
- Investigación en clasificación jerárquica: los cuatro niveles permiten estudiar cómo degrada el rendimiento al descender de división a clase, y diseñar modelos que exploten la estructura padre-hijo mediante el campo `parent` del corpus.
- Validación de sistemas de enriquecimiento de datos B2B: empresas que categorizan automáticamente su cartera de clientes por sector pueden usar el split de test como referencia externa, con la cautela de que las etiquetas son derivadas.
- Análisis de sensibilidad a la ambigüedad de etiquetas: con un 53 % de empresas con primario ambiguo a nivel de subdivisión y unas 25 clases relevantes de media, el dataset sirve para estudiar el comportamiento de métricas multietiqueta frente a ruido de etiquetado.
- Docencia y experimentación con métricas graduadas: el corpus reducido de 85 documentos facilita reproducir experimentos de retrieval con relevancia graduada en un entorno de recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de referencia de ningún sistema evaluado sobre este dataset, y el repositorio no presenta descargas ni uso documentado.

## Requisitos de hardware

- No aplica inferencia de modelo: el recurso es un dataset en Parquet.
- Almacenamiento: el repositorio ocupa 0,0 GB según Hugging Face; el volumen real de las particiones de queries y qrels es modesto y manejable en un portátil convencional.
- Memoria: cargar las tres configs completas (98.604 + 12.344 + 12.391 consultas y 823.709 + 102.713 + 104.457 juicios) es viable en RAM de consumo; conviene cargar por splits para reducir el pico de memoria.
- GPU: no se requiere GPU para usar el dataset; la GPU solo sería necesaria para los modelos de retrieval o clasificación que se evalúen contra él.
- Despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI. El acceso se realiza mediante la librería `datasets` de Hugging Face.
- Latencia y throughput: no disponibles y no pertinentes para un dataset de evaluación.

## Comparativa con modelos similares

| Recurso | Tipo | Niveles | Documentos de corpus | Consultas test | Licencia |
|---|---|---|---|---|---|
| `industrybench-anzsic-l2-graded` (este) | Dataset BEIR graduado, ANZSIC 2006 | División, subdivisión, grupo, clase (evaluado en subdivisión) | 85 | 12.391 | other (pendiente) |
| `ANZSIC-Company-Classification-L1` | Dataset BEIR graduado, ANZSIC 2006 | Nivel 1 (división) | no disponible | no disponible | no disponible |
| `ANZSIC-Company-Classification-L3` / `-L4-` | Datasets BEIR graduados, ANZSIC 2006 | Niveles 3 y 4 | no disponible | no disponible | no disponible |
| Datasets companion de NAICS, ISIC Rev.4 y NACE | Datasets BEIR graduados, otras taxonomías | Múltiples | no disponible | mismas empresas y particiones | no disponible |
| `TechWolf/Skill-extraction-*-graded` | Datasets BEIR graduados, extracción de habilidades | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las etiquetas son derivadas, no anotadas por humanos: se encadenan dos conversiones lossy (NAICS → ISIC Rev.4 → ANZSIC 2006), por lo que la calidad no puede superar la de las etiquetas NAICS de origen ni la de los crosswalks empleados.
- Ambigüedad elevada del primario: el 23 % de las empresas de test tiene más de un código de grado 2 a nivel de división, el 53 % a nivel de subdivisión, el 66 % a nivel de grupo y el 72 % a nivel de clase. Una empresa tiene unas 25 clases relevantes de media.
- ANZSIC no anida dentro de ISIC: la correspondencia es de muchos a muchos y la mitad de las 419 clases ISIC mapean a dos o más clases ANZSIC (hasta 21). No se usan los indicadores de coincidencia parcial del ABS.
- Los pesos de grado 2 son uniformes por construcción, ya que las tablas de correspondencia no aportan pesos; esto puede no reflejar la importancia relativa real de cada código.
- Empresas cuyo código NAICS primario no mapea a ninguna clase ISIC válida quedan sin etiqueta de grado 2 (`primary_status` = `missing`).
- El corpus contiene solo títulos de códigos, sin descripciones textuales, lo que limita el tipo de modelos de retrieval que se pueden evaluar de forma realista.
- Licencia `other` con un TODO explícito en la model card: la procedencia de las descripciones de empresas y de las etiquetas NAICS originales no está declarada, y los términos de reutilización de ANZSIC 2006 (ABS y Stats NZ) y del crosswalk del Census de EE. UU. no están confirmados. No debe asumirse uso comercial permitido.
- Idioma limitado al inglés.
- Cero descargas y cero likes: sin validación comunitaria ni evidencia de uso en producción.
- Riesgo de alucinación y sesgos: no aplica al dataset en sí, pero los sesgos de las etiquetas NAICS de origen y de los crosswalks se propagan a las etiquetas ANZSIC.

## Enlaces

- Hugging Face: https://huggingface.co/blackmlengineer/industrybench-anzsic-l2-graded
- Repositorio GitHub de IndustryBench (referencia homónima, no vinculada al autor del dataset): https://github.com/alibaba-multimodal-industrial-ai/IndustryBench
- Datasets hermanos citados en la model card (no se proporcionan URL directas): `ANZSIC-Company-Classification-L1`, `ANZSIC-Company-Classification-L2`, `ANZSIC-Company-Classification-L3`, `ANZSIC-Company-Classification-L4`, `ISIC4-Company-Classification`
- Referencia de formato: `TechWolf/Skill-extraction-*-graded` (no se proporciona URL directa)
- WorkRB `GradedBEIRRankingTask` (no se proporciona URL directa)
