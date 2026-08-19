# shikunpunk/MiniMind-YuHua-Data

## Resumen

MiniMind-YuHua-Data es un conjunto de datos (dataset), no un modelo de lenguaje, creado por el usuario shikunpunk y publicado en Hugging Face. Su propósito es servir como material de entrenamiento para un modelo MiniMind de 104 millones de parámetros, especializado en la generación de texto con el estilo literario del escritor chino Yu Hua (余华). El dataset contiene las obras completas de Yu Hua (13 libros) en formato epub, parseadas y convertidas a JSONL, junto con datos de preentrenamiento y de ajuste fino supervisado (SFT) con cadenas de pensamiento (CoT) que estructuran la generación en tres fases: 【构思】(concepción), 【基调】(tono) y 【正文】(cuerpo del texto).

La relevancia de este dataset radica en que permite reproducir experimentos de entrenamiento de modelos pequeños (104M) sobre un estilo literario concreto, un caso de uso poco habitual frente a los corpus genéricos. Además, forma parte de una serie de proyectos similares del mismo autor (por ejemplo, MiniMind-GuCheng-Data para el poeta Gu Cheng), lo que facilita comparaciones entre estilos. El dataset incluye scripts de generación y parseo, y los pesos del modelo entrenado se publican por separado en el repositorio shikunpunk/MiniMind-YuHua-AR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (dataset de texto) |
| Parametros totales | No aplica |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (los segmentos varian; el modelo objetivo MiniMind usa 512 tokens por defecto) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Chino (mandarin) |
| Licencia | No disponible |
| Formato de pesos | No aplica (archivos JSONL) |

Contenido del dataset:

- `yuhua_raw_full.jsonl`: 13 libros completos segmentados en 20 952 fragmentos, con campos {book, book_index, chapter, chapter_index, segment_index, text}.
- `pretrain_yuhua.jsonl`: 18 793 registros de preentrenamiento.
- `sft_yuhua_cot.jsonl`: 522 registros de SFT con formato CoT (【构思】→【基调】→【正文】).
- `yuhua_samples_cot_v1.jsonl`: 100 muestras de generacion generadas con el modelo entrenado.
- Scripts: `parse_yuhua_epub.py`, `build_yuhua_dataset.py`, `gen_yuhua_batch.py`.

## Arquitectura y entrenamiento

El dataset no es un modelo, por lo que no tiene arquitectura propia. Sin embargo, esta diseñado para entrenar un modelo MiniMind, una arquitectura transformer ligera de 104M de parametros (hidden_size=768, 8 capas) desarrollada por jingyaogong. El dataset se construye a partir de los EPUB de las obras de Yu Hua, que se parsean y segmentan en fragmentos coherentes. Para el preentrenamiento se usan los textos completos, mientras que para el SFT se generan pares de instruccion-respuesta con un esquema de CoT de tres pasos: primero se concibe la idea, luego se fija el tono y finalmente se escribe el texto. No se especifica el numero total de tokens ni el proceso de tokenizacion, pero se asume que se usa el tokenizador de MiniMind (basado en BPE chino).

No se menciona el uso de RLHF ni DPO; el ajuste es puramente supervisado. Los scripts incluidos permiten reproducir el proceso de construccion del dataset a partir de los EPUB originales.

## Capacidades

- Generacion de texto narrativo en chino con estilo imitado de Yu Hua (lenguaje sobrio, tono melancolico, descripciones detalladas).
- Entrenamiento de modelos pequenos (104M) para tareas de generacion de ficcion.
- Soporte de preentrenamiento y ajuste fino supervisado con cadenas de pensamiento (CoT) de tres fases.
- Posibilidad de analisis estilometrico y comparativo entre autores (al existir datasets similares para otros escritores).
- No incluye capacidades de tool calling, agentes, vision ni audio; es un corpus textual puro.

## Casos de uso

- Entrenamiento de un generador de ficcion en chino: el dataset permite ajustar un modelo MiniMind para producir relatos breves o fragmentos narrativos con el estilo de Yu Hua, util para prototipos de escritura asistida.
- Investigacion en estilistica computacional: los 20 952 segmentos etiquetados por libro, capitulo e indice permiten estudiar la evolucion del estilo del autor a lo largo de sus obras.
- Desarrollo de sistemas de escritura creativa: el formato CoT (concepcion, tono, texto) puede servir como plantilla para generar historias coherentes en otros dominios.
- Evaluacion de tecnicas de ajuste fino en modelos pequenos: al ser un corpus reducido (522 pares SFT), es ideal para experimentar con metodos de few-shot o fine-tuning rapido en entornos con recursos limitados.
- Creacion de chatbots con personalidad literaria: un modelo entrenado con este dataset puede usarse en demos de chat que respondan con el estilo de Yu Hua, aunque el alcance es limitado por el tamano del modelo.
- Comparacion de estilos entre autores: combinando con datasets similares (por ejemplo, MiniMind-GuCheng-Data), se pueden entrenar varios modelos y comparar metricas de similitud estilistica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona un informe experimental en GitHub (ChineseHardJudgePoem/doc/COT_YUHUA_EXPERIMENTS_REPORT.md), pero no se ha accedido a el en esta busqueda. No hay datos cuantitativos de calidad de generacion, perplejidad ni metricas de evaluacion humana.

## Requisitos de hardware

No aplica directamente al dataset. Para entrenar el modelo MiniMind de 104M con este dataset se requieren recursos modestos: una GPU con al menos 4 GB de VRAM es suficiente para el entrenamiento completo (el proyecto MiniMind indica que puede entrenarse en una RTX 4090 en unas 2 horas). Para inferencia, el modelo cabe en CPU o en cualquier GPU moderna. Las opciones de despliegue tipicas serian llama.cpp o el propio codigo de MiniMind, aunque no se especifica en la informacion del dataset.

## Comparativa con modelos similares

No hay modelos comparables directamente, ya que este es un dataset y no un modelo. Como referencia, el autor publica datasets analogos para otros autores:

| Dataset | Autor literario | Tamano (aprox.) | Formato | Uso |
|---|---|---|---|---|
| MiniMind-YuHua-Data | Yu Hua | 20 952 segmentos, 522 SFT | JSONL | Entrenamiento MiniMind 104M |
| MiniMind-GuCheng-Data | Gu Cheng (poeta) | No disponible | JSONL | Entrenamiento MiniMind 104M |
| MiniMind-LiBai (modelo) | Li Bai (poeta) | 3B parametros | Modelo | Generacion de poesia |

No se dispone de mas detalles sobre el dataset de Gu Cheng ni sobre el modelo LiBai en la informacion recopilada.

## Limitaciones y advertencias

- El dataset esta integramente en chino; no es adecuado para tareas en otros idiomas.
- El corpus se limita a las obras de un solo autor, lo que introduce un sesgo estilistico muy marcado y limita la generalizacion.
- El numero de ejemplos SFT es pequeno (522), lo que puede provocar sobreajuste si se entrena durante demasiadas epocas.
- No se indica la licencia del dataset; se debe contactar con el autor antes de un uso comercial.
- Los textos de Yu Hua estan protegidos por derechos de autor; aunque el dataset se distribuye en Hugging Face, su uso puede tener implicaciones legales fuera del ambito de investigacion.
- No hay informacion sobre la calidad de la segmentacion (por ejemplo, si los fragmentos respetan limites de oracion o parrafo).
- El modelo resultante (MiniMind 104M) tiene capacidades limitadas en comparacion con modelos grandes; no es adecuado para tareas complejas de razonamiento.

## Enlaces

- Dataset en Hugging Face: https://huggingface.co/shikunpunk/MiniMind-YuHua-Data
- Repositorio del modelo entrenado (mencionado en la model card): https://huggingface.co/shikunpunk/MiniMind-YuHua-AR
- Proyecto MiniMind (base del modelo): https://github.com/jingyaogong/minimind
- Dataset analogo para Gu Cheng: https://huggingface.co/shikunpunk/MiniMind-GuCheng-Data
- Informe experimental (mencionado, no verificado): https://github.com/ChineseHardJudgePoem/doc/COT_YUHUA_EXPERIMENTS_REPORT.md
