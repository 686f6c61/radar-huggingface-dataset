# computational-metabolomics/mist

## Resumen

MIST (checkpoints 2.0.0) es un conjunto de pesos preentrenados para anotación de espectros de masas en metabolómica, publicado por el grupo computational-metabolomics en Hugging Face y distribuido originalmente a través del registro Zenodo 8316682. El repositorio contiene dos checkpoints, `mist_contrastive_canopus_pretrain.ckpt` y `mist_fp_canopus_pretrain.ckpt`, que según su propio nombre corresponden a un preentrenamiento contrastivo y a un preentrenamiento orientado a predicción (fp) sobre datos del ecosistema CANOPUS. El autor citado en la model card es Sam Goldman y el código fuente asociado se mantiene en el repositorio `samgoldman97/mist`.

No se trata de un modelo de lenguaje: es un modelo de dominio específico para química analítica y espectrometría de masas. Por eso carece de ventana de contexto, de soporte multilingüe, de tool calling o de cualquier capacidad generativa conversacional. Su relevancia actual radica en que permite reutilizar un preentrenamiento sobre grandes volúmenes de espectros para tareas posteriores de anotación de compuestos, clasificación química o ajuste fino con datos propios de laboratorio, dentro de flujos de metabolómica no dirigida.

La model card es extremadamente escueta: no documenta arquitectura, número de parámetros, composición del dataset ni resultados de evaluación. El repositorio ocupa 0,1 GB en total para los dos checkpoints, lo que indica modelos de tamaño reducido, pero no se publica el recuento exacto de parámetros. La licencia de los pesos queda designada aguas arriba como "other-open" sin términos concretos identificados, mientras que el código fuente se publica bajo MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los nombres de checkpoint y el contexto del proyecto apuntan a un transformer de dominio para espectrometría de masas; no se documenta en la model card) |
| Parametros totales | no disponible (el repositorio completo ocupa 0,1 GB para dos checkpoints, lo que sugiere modelos de tamaño reducido) |
| Parametros activos | no aplicable (no se describe una arquitectura MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje; la entrada son datos de espectrometría de masas) |
| Tipos de cuantizacion | no disponible (no se distribuyen versiones cuantizadas; solo checkpoints `.ckpt` en precisión original) |
| Idiomas soportados | no aplicable (modelo de dominio científico, no procesa lenguaje natural) |
| Licencia | "unknown" en Hugging Face; el depósito upstream la designa como "other-open" sin términos concretos identificados; el código fuente es MIT y no cubre los checkpoints |
| Formato de pesos | `.ckpt` (checkpoints de PyTorch Lightning); no se ofrecen safetensors ni GGUF |

## Arquitectura y entrenamiento

La información proporcionada no documenta la arquitectura interna. Los nombres de los dos checkpoints, `mist_contrastive_canopus_pretrain` y `mist_fp_canopus_pretrain`, indican dos variantes de preentrenamiento: una con objetivo contrastivo y otra con un objetivo designado como "fp" (probablemente predicción de fórmula o de huella molecular, aunque esto no se confirma en la documentación). Ambos se etiquetan como "canopus_pretrain", lo que vincula el preentrenamiento al ecosistema CANOPUS empleado en anotación de clases de compuestos a partir de espectros de masas.

El repositorio se presenta como una réplica byte a byte de los ficheros originales alojados en Zenodo, sin conversión de formato ni reprocesado. Se incluyen los hashes SHA-256 de ambos checkpoints para verificación de integridad, lo que permite reproducibilidad exacta, pero no se especifica el número de tokens o espectros de entrenamiento, la composición del dataset, ni si hubo fases de ajuste con preferencias humanas (RLHF/DPO), algo que en este dominio no resulta aplicable del mismo modo que en modelos de lenguaje.

## Capacidades

- Anotación de espectros de masas: el propósito declarado por las etiquetas del repositorio (metabolomics, mass-spectrometry) es servir de base para identificar o anotar compuestos a partir de datos espectrométricos.
- Preentrenamiento contrastivo: el checkpoint `mist_contrastive_canopus_pretrain` sugiere aprendizaje de representaciones por contraste, reutilizable como extractor de embeddings espectrales.
- Preentrenamiento orientado a predicción química: el checkpoint `mist_fp_canopus_pretrain` apunta a un objetivo de predicción sobre descriptores químicos (fórmula o huella), aunque el detalle no está documentado.
- Integración en Galaxy: las etiquetas `galaxy` y `galaxy-data-manager` indican que los pesos están pensados para su uso dentro de flujos de trabajo de la plataforma Galaxy.
- Reutilización para ajuste fino: al ser un preentrenamiento, puede servir de punto de partida para tareas posteriores con datos propios.
- Generación de texto: no disponible (no es un modelo de lenguaje).
- Razonamiento, código, matemáticas: no disponible (fuera del alcance del modelo).
- Tool calling, function calling, agentes o razonamiento multi-paso: no disponible (no aplicable a este tipo de modelo).
- Capacidades multilingües: no disponible (no procesa lenguaje natural).
- Visión, audio, modo "thinking": no disponible.

## Casos de uso

- Anotación en metabolómica no dirigida: los checkpoints se usarían como base para asignar identidades o clases químicas a espectros de masas obtenidos en experimentos untargeted, un cuello de botella habitual en estudios de metabolómica.
- Integración en pipelines de Galaxy: dado el etiquetado `galaxy` y `galaxy-data-manager`, el uso natural es empaquetar el modelo como herramienta dentro de un flujo Galaxy para que el análisis espectral sea reproducible y encadenable con otras etapas.
- Clasificación de clases de compuestos: el sufijo `canopus` apunta a tareas de anotación a nivel de familia química cuando no se dispone de una identificación exacta del metabolito.
- Extracción de embeddings espectrales: el checkpoint contrastivo puede emplearse para generar representaciones vectoriales de espectros y, sobre ellas, construir búsquedas por similitud o agrupamientos de muestras.
- Ajuste fino con datos propios: un laboratorio puede partir de estos pesos preentrenados y ajustarlos con su propio conjunto de espectros anotados para especializar el modelo en una matriz o instrumento concreto.
- Cribado de grandes repositorios espectrales: aplicar el modelo sobre bases de datos públicas de espectros para priorizar candidatos antes de la validación manual por espectrometría.
- Descubrimiento de biomarcadores: en estudios clínicos o ambientales, usar las representaciones aprendidas para comparar perfiles espectrales entre cohortes y detectar señales diferenciales.
- Reproducibilidad de resultados: gracias a los hashes SHA-256 publicados, el modelo puede fijarse como artefacto verificable en una publicación o en un pipeline de análisis con control de versiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación, comparaciones con otros métodos ni cifras de precisión o recall sobre conjuntos de test.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo ocupa 0,1 GB para dos checkpoints, por lo que el peso en memoria de los pesos es reducido, pero no se documenta el consumo real en inferencia ni el tamaño de lote empleado.
- GPU recomendadas: no disponible. Por el tamaño del repositorio, es razonable esperar que cualquier GPU con unos pocos GB de VRAM sea suficiente, e incluso que la inferencia en CPU sea viable, pero esto es una estimación a partir del tamaño del fichero y no un dato publicado.
- Compatibilidad con GPU de consumo: probable en la mayoría de GPU de consumo actuales dado el tamaño del repositorio; sin confirmación oficial.
- Opciones de despliegue: no se documentan. Al tratarse de checkpoints de PyTorch Lightning en formato `.ckpt`, el despliegue pasa por cargarlos con PyTorch y el código del repositorio `samgoldman97/mist`. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa cuantitativa. En el ámbito de la anotación de espectros de masas existen otras herramientas de referencia, como CSI:FingerID (dentro de la suite SIRIUS) o MSNovelist, pero la información proporcionada no incluye parámetros, métricas ni condiciones de licencia de ninguna de ellas, por lo que cualquier comparación sería especulativa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MIST 2.0.0 (este repositorio) | no disponible | no aplicable | no disponible | "other-open" sin términos concretos / unknown en el Hub | Hugging Face y Zenodo |
| CSI:FingerID | no disponible | no aplicable | no disponible | no disponible | no disponible en la información proporcionada |
| MSNovelist | no disponible | no aplicable | no disponible | no disponible | no disponible en la información proporcionada |

## Limitaciones y advertencias

- Documentación insuficiente: la model card no describe arquitectura, datos de entrenamiento, hiperparámetros ni proceso de evaluación, lo que dificulta valorar su idoneidad para producción.
- Licencia ambigua: los pesos se designan aguas arriba como "other-open" sin términos concretos identificados, y el Hub los marca como "unknown". La licencia MIT del código fuente no se extiende a los checkpoints. Antes de un uso comercial es imprescindible aclarar la licencia con los autores.
- Riesgo de alucinación: en un modelo de predicción química, el equivalente es la asignación de compuestos o clases incorrectas con alta confianza; no hay métricas publicadas que permitan acotar ese riesgo.
- Generalización desconocida: no se documenta la composición del conjunto de entrenamiento, por lo que se desconoce su comportamiento fuera de la distribución de datos cubierta por el preentrenamiento CANOPUS.
- Sin cuantizaciones ni formatos alternativos: solo se ofrecen checkpoints `.ckpt` ligados al código de PyTorch Lightning del proyecto, lo que añade dependencia del repositorio upstream.
- Ausencia de mantenimiento observable: el repositorio registra 0 descargas y 0 "likes", y los ficheros son una réplica byte a byte de un depósito de Zenodo, sin indicios de soporte activo en el Hub.
- Idoneidad de plataforma: el etiquetado Galaxy indica un uso previsto dentro de esa plataforma, no como servicio de inferencia genérico.
- Verificación de integridad: se recomienda comprobar los hashes SHA-256 publicados antes de usar los checkpoints, dado que no hubo conversión de formato en el Hub.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/computational-metabolomics/mist
- Registro Zenodo del modelo: https://zenodo.org/records/8316682
- DOI del modelo y los datos: https://doi.org/10.5281/zenodo.8316682
- Ficheros originales en Zenodo: https://zenodo.org/records/8316682/files
- Código fuente y documentación: https://github.com/samgoldman97/mist
- Licencia del código fuente (MIT): https://github.com/samgoldman97/mist/blob/main_v2/LICENSE.md

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces listados proceden de la información de Hugging Face y de la model card.
