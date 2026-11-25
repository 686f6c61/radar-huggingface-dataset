# sheey/atttc-distilbert-mikan-nyaa-39k

## Resumen

`atttc-distilbert-mikan-nyaa-39k` es un modelo de clasificación de tokens (NER) basado en DistilBERT multilingual, desarrollado por el usuario sheey y publicado en Hugging Face. Su propósito es extraer y etiquetar los componentes estructurales de los títulos de torrents de anime que circulan por los trackers Mikan y Nyaa: nombre de la serie, temporada, episodio, resolución, códec, origen de streaming, subtítulos y demás metadatos. Resuelve un problema muy concreto del ecosistema de catalogación y automatización de descargas de anime: el parseo fiable de títulos ruidosos, con mezcla de chino, inglés y japonés.

El modelo parte de `distilbert-base-multilingual-cased` (134,7 millones de parámetros) y se ha afinado sobre 38.647 muestras limpias, desesgadas y aumentadas. Se distribuye en tres formatos: pesos PyTorch (`safetensors`), ONNX FP32 y ONNX cuantizado dinámicamente a QUInt8, lo que permite inferencia en CPU con un fichero de unos 130 MB. La licencia es MIT, lo que facilita su integración en herramientas comerciales y de código abierto.

Su relevancia actual es acotada pero real: los parsers de títulos basados en expresiones regulares son frágiles ante variantes de nomenclatura, y este modelo ofrece una alternativa estadística con F1 de 0,987 en validación y 0,978 en un benchmark duro de 100 títulos no vistos. Es, por tanto, una pieza de infraestructura para pipelines de indexación, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, destilado de BERT) |
| Parametros totales | 134.762.533 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT base admite 512 tokens; el autor no lo declara) |
| Tipos de cuantizacion | FP32 (ONNX y safetensors), INT8 dinámica QUInt8 (ONNX) |
| Idiomas soportados | zh, en, ja |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX (FP32), ONNX (INT8 QUInt8) |

## Arquitectura y entrenamiento

El modelo es un DistilBERT multilingual: un transformer encoder de 6 capas y 134,7 millones de parámetros, destilado del BERT multilingual original. Se usa como cabecera de clasificación de tokens (token classification), es decir, asigna una etiqueta BIO a cada token de entrada para reconstruir los campos del título del torrent. El tokenizador es WordPiece, coherente con el modelo base.

El entrenamiento se realizó sobre 38.647 muestras: 23.447 títulos reales curados y 15.200 títulos generados por aumento de plantillas (slot-augmentation) sobre esqueletos reales. La model card indica que las muestras están limpias, desesgadas y aumentadas, y que se evaluó en la época 5. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO; en un modelo de este tipo no cabe esperar RLHF. Las mejoras respecto a la versión anterior (`atttc-distilbert-mikan-nyaa-27k`) se centran en la preservación de prefijos de superresolución por IA (`AI2160p`, `AI-2160p`, `AI4K`), orígenes de streaming con mayúsculas mixtas (`NetFlix`, `Crunchyroll`, `Disney+`, `Bilibili`, `TVer`, `BSP4K`), exclusión estricta de corchetes que no son subgrupos (`[TV版&无修版]`, `[搬运]`) y presets de codificador o perfiles de color (`Veryslow`, `10bit`, `DV`, `HDR10`), extracción de formatos de subtítulos suaves (`SRT`, `PGS`, `ASS`) y separación consistente entre `TITLE_JP` y `TITLE_EN`.

## Capacidades

- Clasificación de tokens (NER) sobre títulos de torrents de anime en chino, inglés y japonés.
- Extracción de entidades como nombre de serie, temporada, episodio, resolución, códec, bitrate, origen de streaming, subgrupo de fansub y formato de subtítulos.
- Distinción entre título japonés (romaji) y título inglés mediante heurísticas de escritura.
- Preservación de marcadores de superresolución por IA y de perfiles de color (HDR10, DV).
- Extracción de formatos de subtítulos suaves y alias multilingües (`{JP | ZH | EN}`).
- Inferencia en CPU gracias al modelo ONNX INT8 de ~130 MB.
- No soporta tool calling, agentes, visión ni audio; es un modelo de etiquetado, no generativo.

## Casos de uso

- Indexación automática de trackers: un servicio que recibe títulos de Mikan o Nyaa y necesita poblar una base de datos con serie, temporada, episodio y calidad; el modelo etiqueta cada token y el pipeline reconstruye los campos.
- Automatización de descargas (arr-stack): integrar el ONNX INT8 en un servicio de gestión que renombra y organiza episodios según los metadatos extraídos, sin depender de expresiones regulares frágiles.
- Enriquecimiento de catálogos de fansubs: extraer subgrupo, resolución, códec y subtítulos para generar fichas de release y estadísticas de calidad por grupo.
- Deduplicación y agrupación de releases: comparar las entidades extraídas para detectar el mismo episodio publicado por varios subgrupos con distintas calidades.
- Filtrado de contenido no deseado: descartar títulos con marcadores de versión no censurada o de procedencia dudosa usando las etiquetas de corchetes y origen.
- Herramientas de escritorio o CLI ligeras: al caber en CPU con ~130 MB, se puede embeber en aplicaciones locales de gestión de biblioteca de anime sin GPU.
- Investigación sobre parsing de dominios ruidosos: servir de baseline para comparar enfoques estadísticos frente a reglas en tareas de extracción de entidades en texto corto y multilingüe.

## Benchmarks y rendimiento

| Split / Benchmark | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|
| Validación (FP32, 7.730 muestras) | 0,9860 | 0,9881 | 0,9871 | 0,9933 |
| Validación (INT8 ONNX, 7.730 muestras) | 0,9854 | 0,9874 | 0,9864 | 0,9932 |
| Benchmark duro de 100 títulos no vistos (INT8 vs GPT-6.1-Terra) | 0,9748 | 0,9818 | 0,9783 | 0,9951 |

Los datos proceden de la model card del autor (época 5). No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (modelo de 134,7 M de parámetros); el ONNX INT8 ocupa ~130 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060 o superior es más que suficiente. Para lotes grandes, A100 o H100 no aportan ventaja significativa por el tamaño del modelo.
- Cabe en cualquier GPU de consumo e incluso en CPU: el formato INT8 está pensado explícitamente para inferencia en CPU.
- Opciones de despliegue: ONNX Runtime (recomendado con `model-int8.onnx`), Transformers con los pesos `safetensors`, y exportación a llama.cpp u Ollama no aplica (no es un modelo generativo).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera latencia de milisegundos por título en CPU moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| atttc-distilbert-mikan-nyaa-39k | 134,7 M | no disponible | NER de títulos de anime | MIT | Hugging Face |
| atttc-distilbert-mikan-nyaa-27k | no disponible | no disponible | NER de títulos de anime | no disponible | Hugging Face (versión previa del mismo autor) |
| distilbert-base-multilingual-cased | 134,7 M | 512 tokens | Modelo base multilingüe | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Dominio muy restringido: solo está entrenado para títulos de torrents de anime de Mikan y Nyaa; su rendimiento fuera de ese dominio no está garantizado.
- Idiomas limitados a chino, inglés y japonés; títulos en otros idiomas o con transliteraciones atípicas pueden degradar la extracción.
- Riesgo de alucinación de etiquetas en títulos ambiguos o muy cortos; el benchmark duro reporta F1 de 0,978, no perfecto.
- Sesgo potencial hacia las convenciones de nomenclatura presentes en el dataset de entrenamiento (23.447 títulos reales), lo que puede penalizar subgrupos o formatos poco representados.
- No es un modelo generativo: no admite tool calling, agentes ni razonamiento multi-paso.
- La licencia MIT permite uso comercial, pero el modelo base DistilBERT se distribuye bajo Apache 2.0; conviene verificar el cumplimiento de ambas licencias en producción.
- El autor no documenta el número de tokens de entrenamiento ni la composición exacta del dataset, lo que dificulta auditar posibles sesgos.
- Las fechas de creación y actualización del repositorio (2026) deben tomarse con cautela; no se ha verificado su correspondencia con el calendario real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sheey/atttc-distilbert-mikan-nyaa-39k
- Modelo base: https://huggingface.co/distilbert/distilbert-base-multilingual-cased
- Resultados de búsqueda web sobre el autor: no se han encontrado enlaces técnicos relevantes (solo perfiles de redes sociales sin relación con el modelo).
