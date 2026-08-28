# mhvdr/neolatiner-model

## Resumen

NeoLatiNER es un modelo de reconocimiento de entidades nombradas (NER) especializado en textos latinos modernos tempranos (siglos XVI-XVIII) procedentes de fuentes de filosofía natural. Ha sido desarrollado por el usuario mhvdr y publicado en HuggingFace con el identificador `mhvdr/neolatiner-model`. El modelo se basa en la arquitectura XLM-RoBERTa-large, ajustada mediante fine-tuning para la tarea de token classification con etiquetas IOB2, y predice tres tipos de entidades: personas (`PRS`), grupos (`GRP`) y localizaciones geográficas (`GEO`).

Su relevancia radica en que aborda un dominio muy específico y difícil: textos con errores de OCR, variación ortográfica, inflexiones y nombres abreviados propios del latín humanístico. El modelo se ha entrenado con datos anotados manualmente en dos rondas, combinando material de proyectos previos como Herodotos Project y el Corpus Burgundiae Medii Aevi. Está pensado para uso investigador, no para decisiones automatizadas de alto riesgo. El repositorio tiene un tamaño de 2,3 GB y la fecha de creación es agosto de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa-large (fine-tuned para token classification) |
| Parametros totales | no disponible (basado en XLM-RoBERTa-large, que tiene ~550M) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (XLM-R tiene un limite de 512 tokens, pero no se especifica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | la (latin) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente safetensors o binarios de PyTorch, no se indica) |

## Arquitectura y entrenamiento

El modelo parte de XLM-RoBERTa-large, un transformer encoder multilingue preentrenado, y se ajusta mediante fine-tuning para la tarea de clasificacion de tokens con etiquetas IOB2 (Inside-Outside-Beginning). La capa de clasificacion produce siete etiquetas: `O`, `B-PRS`, `I-PRS`, `B-GRP`, `I-GRP`, `B-GEO` e `I-GEO`. El entrenamiento combina datos de NER en latin de los proyectos Herodotos Project y Corpus Burgundiae Medii Aevi, seguidos de dos rondas de anotacion manual sobre extractos de latin moderno temprano del dominio de la filosofia natural. El conjunto de datos final esta disponible en `mhvdr/neolatiner-dataset`. No se menciona el uso de tecnicas como RLHF o DPO; el entrenamiento es supervisado clasico.

## Capacidades

- Reconocimiento de entidades nombradas en latin moderno temprano, con deteccion de personas (`PRS`), grupos (`GRP`) y localizaciones geograficas (`GEO`).
- Manejo de variaciones ortograficas, inflexiones y nombres abreviados propios de textos historicos con errores de OCR.
- Integracion con el pipeline de `transformers` mediante `token-classification` y estrategia de agregacion `simple` para combinar predicciones IOB2 adyacentes.
- Acceso de bajo nivel a traves de `AutoModelForTokenClassification` y `AutoTokenizer` para control fino sobre el proceso de inferencia.
- No se reportan capacidades de generacion de texto, razonamiento, codigo o vision; es un modelo puramente discriminativo para NER.

## Casos de uso

- Investigacion historica sobre filosofia natural: el modelo permite extraer automaticamente menciones de personajes, grupos y lugares en tratados cientificos del latin moderno temprano, facilitando el analisis de redes de conocimiento y circulacion de ideas.
- Digitalizacion de corpus academicos: al integrarse en pipelines de procesamiento de documentos historicos, ayuda a estructurar textos OCRizados y a crear bases de datos de entidades para estudios cuantitativos.
- Anotacion asistida para humanidades digitales: los investigadores pueden usar las predicciones como punto de partida para corregir y enriquecer anotaciones manuales, reduciendo el tiempo de curado de datos.
- Indexacion de archivos y bibliotecas digitales: la extraccion de nombres propios y lugares permite generar metadatos semanticos para catalogos en linea, mejorando la busqueda y recuperacion de documentos.
- Analisis de correspondencia cientifica: en cartas y manuscritos de la epoca, el modelo identifica remitentes, destinatarios y localizaciones, lo que apoya estudios de redes epistolares.
- Validacion de transcripciones OCR: al comparar las entidades detectadas con listas conocidas de personajes y lugares, se pueden detectar errores de digitalizacion y mejorar la calidad de los textos.

## Benchmarks y rendimiento

La model card del autor incluye una evaluacion sobre el split de test del dataset `mhvdr/neolatiner-dataset`, con 1.460 registros y 639 entidades anotadas. Se utilizo coincidencia estricta de entidades IOB2. Los resultados son los siguientes:

| Entidad | Precision | Recall | F1 | Soporte |
| --- | ---: | ---: | ---: | ---: |
| GEO | 0.6533 | 0.7784 | 0.7104 | 167 |
| GRP | 0.4937 | 0.4588 | 0.4756 | 85 |
| PRS | 0.7541 | 0.7209 | 0.7371 | 387 |
| Micro promedio | 0.6914 | 0.7011 | 0.6962 | 639 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 2,3 GB, lo que sugiere que el modelo en precision FP32 ocupa aproximadamente esa cantidad de memoria. En FP16, la huella de memoria se reduce a la mitad (~1,15 GB), pero no se especifica la cuantizacion soportada.
- Para inferencia en GPU, se recomienda una tarjeta con al menos 4 GB de VRAM si se usa FP16, y 8 GB para FP32. GPUs como la NVIDIA GTX 1080 Ti, RTX 2060 o superiores son suficientes.
- En CPU, la inferencia es posible pero lenta; se puede usar con `transformers` en modo CPU para lotes pequenos.
- Para despliegue en produccion, se puede servir con vLLM, TGI o similares, aunque al ser un modelo de encoder puro, la latencia dependera del tamaño del lote y la longitud de los pasajes. No se proporcionan datos de throughput.
- El modelo es compatible con `transformers` y se puede cargar con `AutoModelForTokenClassification`.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en el dominio del NER en latin moderno temprano. Se podria mencionar que existen otros modelos NER multilingues como `bert-base-multilingual-cased` o `xlm-roberta-base`, pero no se han evaluado contra este modelo. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El modelo esta disenado especificamente para textos de filosofia natural en latin moderno temprano; su rendimiento en otros generos o epocas del latin puede degradarse.
- Los textos de entrada contienen errores de OCR, variacion ortografica, inflexiones y nombres abreviados, lo que exige una revision humana de las predicciones.
- La estrategia de muestreo para la anotacion enfatizo extractos con alta probabilidad de contener entidades y predicciones de baja confianza, por lo que el conjunto de datos no es una muestra aleatoria representativa del latin moderno temprano.
- Las clases `GRP` y `GEO` se conservaron para su reutilizacion pero no se evaluaron con la misma profundidad que `PRS`; su rendimiento es significativamente inferior (F1 de 0,4756 y 0,7104 respectivamente).
- No se especifica la licencia del modelo, lo que puede limitar su uso comercial o de redistribucion.
- La longitud de contexto esta limitada por XLM-R (tipicamente 512 tokens); documentos largos deben dividirse en pasajes, preservando contexto suficiente para nombres ambiguos.
- El modelo esta pensado para uso investigador y no para decisiones automatizadas de alto riesgo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mhvdr/neolatiner-model
- Dataset de entrenamiento: https://huggingface.co/datasets/mhvdr/neolatiner-dataset
- No se han encontrado otros enlaces (papers, blogs, repos) en la busqueda web.
