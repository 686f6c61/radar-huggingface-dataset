# Shinoaki0145/SyncRepo

## Resumen

El repositorio `Shinoaki0145/SyncRepo` contiene la implementación del método SynFoC, presentado en el artículo "Steady Progress Beats Stagnation: Mutual Aid of Foundation and Conventional Models in Mixed Domain Semi-Supervised Medical Image Segmentation" (CVPR 2025). No se trata de un modelo de lenguaje o de generación de texto, sino de un conjunto de scripts y código para entrenar y evaluar un sistema de segmentación de imágenes médicas en entornos semi-supervisados con dominios mixtos. El método combina un modelo de fundación (MedSAM, basado en SAM) con un modelo convencional (UNet) en un esquema de ayuda mutua, con el objetivo de mejorar el rendimiento cuando se dispone de pocas anotaciones etiquetadas.

El repositorio incluye código para entrenamiento (`train.py`), evaluación (`test.py`) y resumen de logs (`summarize_logs.py`), así como enlaces a cuatro conjuntos de datos médicos (próstata, fundus, M&Ms y BUSI). El tamaño del repositorio es de 7.0 GB, lo que sugiere que puede contener pesos preentrenados o datos adicionales, aunque no se especifica en la documentación. La licencia no está indicada, y el autor es Shinoaki0145 (Thien Nhan), que también mantiene otros proyectos relacionados con IA médica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (método SynFoC basado en MedSAM y UNet) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplicable (no es un modelo de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene código fuente y posiblemente pesos, pero no se especifica el formato) |

## Arquitectura y entrenamiento

El método SynFoC se basa en la colaboración entre un modelo de fundación (MedSAM, una adaptación de SAM para segmentación médica) y un modelo convencional (UNet). El entrenamiento se realiza de forma semi-supervisada, utilizando una pequeña cantidad de datos etiquetados y una mayor cantidad de datos no etiquetados, en un escenario de dominios mixtos (por ejemplo, diferentes conjuntos de datos médicos). El código permite seleccionar el conjunto de datos (fundus, próstata, M&Ms, BUSI) y ajustar parámetros como el número de etiquetas por dominio. No se proporcionan detalles sobre el número de tokens de entrenamiento, composición exacta del dataset ni el uso de técnicas como RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Segmentación de imágenes médicas en dominios como fondo de ojo (fundus), próstata, resonancia magnética cardíaca (M&Ms) y ecografía mamaria (BUSI).
- Entrenamiento semi-supervisado con dominios mixtos, aprovechando la ayuda mutua entre un modelo de fundación y un modelo convencional.
- Evaluación de rendimiento mediante métricas como Dice (el script `summarize_logs.py` calcula el Dice promedio de UNet y SAM).
- Soporte para diferentes configuraciones de entrenamiento (optimizador AdamW, warmup, etc.) y para el modelo MedSAM.
- No es un modelo de generación de texto, ni soporta tool calling, agentes o razonamiento multi-paso.

## Casos de uso

- Segmentación de estructuras anatómicas en imágenes de fondo de ojo para diagnóstico de enfermedades oculares: el método puede entrenarse con pocas anotaciones y aplicarse a imágenes de retina para delimitar vasos o lesiones.
- Segmentación de la próstata en resonancia magnética para planificación de radioterapia o cirugía: el modelo semi-supervisado reduce la necesidad de anotaciones manuales extensas.
- Análisis de imágenes cardíacas (M&Ms) para segmentación de ventrículos y miocardio, útil en el estudio de cardiopatías.
- Segmentación de lesiones mamarias en ecografía (BUSI) para apoyo al diagnóstico de cáncer de mama.
- Investigación en métodos de segmentación semi-supervisada con dominios mixtos, sirviendo como base para comparar nuevas técnicas.
- Integración en flujos de trabajo de radiología asistida por ordenador, donde se dispone de grandes volúmenes de imágenes sin etiquetar y solo un subconjunto anotado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de métricas ni comparaciones con otros métodos. El artículo original (CVPR 2025) reporta resultados, pero no se proporcionan en la documentación del repositorio.

## Requisitos de hardware

No se dispone de información específica sobre requisitos de hardware en el repositorio. Dado que el entrenamiento utiliza MedSAM (basado en SAM) y UNet, es probable que se requiera una GPU con al menos 8-16 GB de VRAM para entrenar con imágenes médicas de resolución moderada, pero no se confirma. No se indican opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la misma categoría (segmentación médica semi-supervisada con dominios mixtos) con datos públicos suficientes para una comparación directa.

## Limitaciones y advertencias

- El repositorio es código fuente, no un modelo preentrenado listo para usar; requiere ejecutar el entrenamiento con los datos propios.
- No se especifica la licencia, por lo que el uso comercial puede ser incierto.
- Los conjuntos de datos enlazados (Prostate, Fundus, M&Ms, BUSI) tienen sus propias licencias y condiciones de uso; es necesario revisarlas antes de utilizarlos.
- El método está diseñado para segmentación de imágenes médicas; no es aplicable a tareas de procesamiento de lenguaje natural.
- No se proporcionan pesos preentrenados en el repositorio, por lo que el usuario debe entrenar desde cero o buscar pesos externos.
- La documentación es escasa y no incluye instrucciones detalladas sobre el formato de los datos más allá de la referencia a la carpeta `data_format`.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Shinoaki0145/SyncRepo
- Repositorio del paper (GitHub): https://github.com/MQinghe/SynFoC
- Perfil del autor en Hugging Face: https://huggingface.co/Shinoaki0145
- Perfil del autor en GitHub: https://github.com/Shinoaki0145
- Conjunto de datos Prostate: https://drive.google.com/file/d/1xjDB9qKi4vxIhXXvxLhq5-9Il23Tgmbj/view?usp=sharing
- Conjunto de datos Fundus: https://drive.google.com/file/d/1p33nsWQaiZMAgsruDoJLyatoq5XAH-TH/view
- Conjunto de datos M&Ms: https://drive.google.com/file/d/1LJg1s55EeCEzwBQsg0je7lpbRCKAmE1y/view?usp=sharing
- Conjunto de datos BUSI: https://scholar.cu.edu.eg/?q=afahmy/pages/dataset
