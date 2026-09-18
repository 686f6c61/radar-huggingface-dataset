# salahh297/doha-checkpoints

## Resumen

`doha-checkpoints` es un repositorio de checkpoints de la solución ganadora del equipo Salahh en el Google Cloud Doha AI Challenge, una competición de clasificación de noticias en árabe con seis objetivos simultáneos y métrica weighted-F1. No es un modelo único ni un modelo listo para usar con `pipeline()`: es una colección de 210 checkpoints (9 backbones preentrenados × varias configuraciones y semillas, hasta 42 etiquetas de entrenamiento × 5 folds de validación cruzada) que, combinados mediante pesos de ensamblado, reproducen el fichero `clean.csv` de la entrega final.

Cada `fold*.pt` es un `state_dict` en bf16 de un modelo multi-tarea: un encoder transformer compartido más seis cabezas lineales de clasificación, una por objetivo. Los backbones son modelos encoder-only de la familia BERT/XLM-R/RemBERT y modelos de embeddings multilingües, todos fine-tuneados sobre el conjunto de noticias en árabe del reto. El repositorio pesa 98,7 GB y los checkpoints ocupan aproximadamente 92 GB.

Su relevancia es doble. Por un lado, documenta una receta de ensamblado reproducible con semillas fijas y código de inferencia (`infer.py`, `reproduce_from_checkpoints.ipynb`, `recipe.json` y `weights.json`) sobre un problema multilingüe poco cubierto por modelos comerciales. Por otro, está publicado bajo licencia Apache-2.0, lo que permite reutilizar los pesos en investigación y en producción, siempre que se respeten las licencias de cada backbone original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de clasificadores transformer encoder-only (BERT, XLM-R, RemBERT, E5); cada checkpoint es un modelo multi-tarea con encoder compartido y 6 cabezas lineales de clasificacion |
| Parametros totales | No disponible (no se publica el recuento agregado del ensemble; los backbones abarcan configuraciones base y large) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card |
| Tipos de cuantizacion | No disponible (los checkpoints se distribuyen en precision bf16) |
| Idiomas soportados | Arabe (`ar`); se incluyen backbones multilingues (XLM-R large, RemBERT, multilingual-E5 large) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `state_dict` (`.pt`) en bf16 |

## Arquitectura y entrenamiento

El sistema es un ensemble heterogéneo. Se parte de 9 backbones preentrenados: AraBERT base (`aubmindlab/bert-base-arabertv02`), AraBERT large (`aubmindlab/bert-large-arabertv02`), AraBERTv2 large con segmentación farasa (`aubmindlab/bert-large-arabertv2`), ARBERTv2 (`UBC-NLP/ARBERTv2`), CAMeLBERT MSA (`CAMeL-Lab/bert-base-arabic-camelbert-msa`), MARBERTv2 (`UBC-NLP/MARBERTv2`), XLM-R large (`FacebookAI/xlm-roberta-large`), RemBERT (`google/rembert`) y multilingual-E5 large (`intfloat/multilingual-e5-large`). Sobre cada backbone se entrena un modelo multi-tarea con una cabeza lineal por cada uno de los seis objetivos de clasificación.

Cada una de las 42 configuraciones registradas en `solution/train/models_manifest.csv` se entrena con validación cruzada de 5 folds y semillas fijas, lo que produce 5 checkpoints por configuración (210 en total). En inferencia, `infer.py` reconstruye cada modelo, carga sus cinco folds, ejecuta el forward sobre el conjunto de test, promedia las cinco matrices de probabilidades por modelo y combina los conjuntos de modelos por objetivo definidos en `recipe.json` aplicando los pesos de `weights.json`. Una de las configuraciones aplica segmentación farasa al texto de test, lo que la hace notablemente más lenta (decenas de minutos) que el resto. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo ajuste por RLHF o DPO; se trata de fine-tuning supervisado clásico sobre clasificación.

## Capacidades

- Clasificación de texto en árabe sobre seis objetivos simultáneos dentro del dominio de noticias (modelo multi-tarea con seis cabezas).
- Etiquetado de noticias y artículos de prensa en árabe moderno estándar.
- Procesamiento de texto con normalización específica para árabe, incluida segmentación morfológica con farasa en una de las configuraciones.
- Ensemble de modelos: combina predicciones de múltiples backbones y folds mediante pesos predefinidos para maximizar weighted-F1.
- Reproducibilidad completa: semillas fijas y scripts de inferencia que regeneran `clean.csv` a partir de los checkpoints.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni uso como agente. Es exclusivamente un clasificador.

## Casos de uso

- Clasificación automática de noticias en medios árabes: el ensemble etiqueta artículos según los seis objetivos del reto, con la ventaja de que el promedio de 210 checkpoints reduce la varianza frente a un único modelo fine-tuneado.
- Moderación y enrutado de contenido en agregadores de noticias: permite asignar secciones o categorías a flujos masivos de artículos en árabe antes de pasarlos a revisión humana.
- Investigación académica en NLP árabe: sirve como baseline fuerte y reproducible (semillas fijas, validación cruzada de 5 folds) para comparar nuevos backbones sobre corpus de noticias en árabe.
- Sistemas de recomendación de contenido editorial: las probabilidades por objetivo alimentan un ranking de artículos similares o relevantes para cada lector.
- Monitorización de medios y análisis de tendencias: procesar un corpus histórico de prensa árabe y agregar las etiquetas por fecha, medio o sección para detectar cambios de cobertura.
- Filtrado previo en pipelines de verificación de hechos: descartar o priorizar candidatos por temática antes de aplicar modelos más caros de análisis factual.
- Reproducción de resultados de competición: cualquier equipo puede clonar el repositorio, descargar los checkpoints y regenerar `clean.csv` para auditar la solución ganadora.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la métrica de la competición (weighted-F1 sobre seis objetivos) y el procedimiento de ensamblado, pero no incluye cifras concretas de validación ni de test, ni comparaciones numéricas con otros sistemas.

## Requisitos de hardware

- VRAM: la model card especifica GPU A100 de 40 GB, o A100 / H100 de 80 GB, con H100 de 80 GB recomendada. No se publican estimaciones de VRAM por checkpoint individual.
- GPU recomendadas: NVIDIA A100 40 GB, A100 80 GB y H100 80 GB. El repositorio completo ocupa 98,7 GB en disco y los checkpoints aproximadamente 92 GB, por lo que se necesita almacenamiento local amplio además de la GPU.
- GPU de consumo: no se documenta compatibilidad con GPU de consumo. El pipeline de inferencia está diseñado para ejecutar el ensemble completo, no un único checkpoint, por lo que no se puede confirmar su viabilidad en una RTX 4090 u otras tarjetas consumer.
- Opciones de despliegue: el procedimiento oficial usa PyTorch con `transformers==4.57.1`, `accelerate`, `sentencepiece`, `arabert`, `farasapy`, `scikit-learn`, `pandas` y `numpy`, mediante `infer.py` o el notebook `reproduce_from_checkpoints.ipynb`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y al tratarse de `state_dict` de modelos encoder personalizados tampoco serían directamente compatibles sin conversión.
- Latencia y throughput: no se publican cifras. La model card indica únicamente que la ejecución con segmentación farasa es lenta (decenas de minutos) y que el resto de configuraciones son rápidas.

## Comparativa con modelos similares

La comparativa natural no es contra otro ensemble, sino contra los backbones individuales que lo componen. Las cifras de parámetros y contexto de los backbones proceden de su documentación pública, no de la model card del repositorio.

| Modelo | Parametros aprox. | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `salahh297/doha-checkpoints` (ensemble) | No disponible (agregado de 9 backbones) | No disponible | Apache-2.0 | Repositorio HuggingFace, 98,7 GB |
| `aubmindlab/bert-base-arabertv02` | ~110 M (BERT base) | 512 (estandar BERT) | Apache-2.0 | HuggingFace |
| `UBC-NLP/ARBERTv2` | ~163 M | 512 (estandar BERT) | No disponible en esta ficha | HuggingFace |
| `FacebookAI/xlm-roberta-large` | ~560 M | 512 | MIT | HuggingFace |
| `intfloat/multilingual-e5-large` | ~560 M | 512 | MIT | HuggingFace |

Frente a cualquiera de ellos por separado, el ensemble añade coste de inferencia y de almacenamiento (dos órdenes de magnitud más de disco) a cambio de robustez estadística por el promedio de folds y backbones. No se dispone de datos de rendimiento comparado que permitan cuantificar la mejora.

## Limitaciones y advertencias

- No es un modelo autónomo: los checkpoints solo son utilizables junto con el paquete `solution/` de la competición, que aporta `recipe.json` (conjuntos de modelos por objetivo), `weights.json` (pesos del ensemble) y el código de inferencia. Sin esos ficheros no hay forma documentada de obtener predicciones.
- Dominio restringido: el entrenamiento se limita a noticias en árabe dentro del Doha AI Challenge. El comportamiento fuera de ese dominio (redes sociales, dialectos, textos técnicos, árabe coloquial) no está evaluado y probablemente degrade.
- Idiomas: aunque varios backbones son multilingües, la model card solo declara árabe (`ar`) y no se documenta rendimiento en otras lenguas.
- Sesgos: no se documenta ningún análisis de sesgo. Al entrenar sobre un corpus periodístico en árabe, es esperable que herede los sesgos editoriales, geográficos y políticos de las fuentes, que no se detallan.
- Riesgo de error de clasificación: al ser un clasificador y no un generador, el riesgo relevante no es la alucinación de texto, sino falsos positivos y negativos en las seis cabezas. No se publican matrices de confusión ni umbrales recomendados.
- Licencia: el repositorio es Apache-2.0, pero los backbones subyacentes tienen licencias propias (Apache-2.0 en AraBERT, MIT en XLM-R y multilingual-E5, y sin confirmar en ARBERTv2, MARBERTv2, CAMeLBERT y RemBERT en la información disponible). Antes de un uso comercial hay que verificar cada licencia de origen por separado.
- Coste de reproducción: requiere descargar ~98,7 GB y ejecutar el pipeline completo en GPU de centro de datos. La configuración con farasa añade decenas de minutos de preprocesado.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, y ausencia de resultados de benchmarks publicados, lo que limita la validación externa del sistema.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/salahh297/doha-checkpoints
- AraBERT base: https://huggingface.co/aubmindlab/bert-base-arabertv02
- AraBERT large: https://huggingface.co/aubmindlab/bert-large-arabertv02
- AraBERTv2 large (farasa): https://huggingface.co/aubmindlab/bert-large-arabertv2
- ARBERTv2: https://huggingface.co/UBC-NLP/ARBERTv2
- CAMeLBERT MSA: https://huggingface.co/CAMeL-Lab/bert-base-arabic-camelbert-msa
- MARBERTv2: https://huggingface.co/UBC-NLP/MARBERTv2
- XLM-R large: https://huggingface.co/FacebookAI/xlm-roberta-large
- RemBERT: https://huggingface.co/google/rembert
- multilingual-E5 large: https://huggingface.co/intfloat/multilingual-e5-large

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo, el Doha AI Challenge o el equipo Salahh; los resultados obtenidos correspondían a contenidos sin relación.
