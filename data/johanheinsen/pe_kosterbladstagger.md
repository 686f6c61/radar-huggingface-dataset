# JohanHeinsen/PE_Kosterbladstagger

## Resumen

PE_Kosterbladstagger es un clasificador de texto basado en SetFit, desarrollado por JohanHeinsen, que se apoya en el modelo de embeddings `JohanHeinsen/Old_News_Segmentation_SBERT_V0.1` como base. Su funcion es etiquetar fragmentos de texto procedentes de periodicos daneses antiguos, presumiblemente para segmentar y clasificar secciones como anuncios de subastas, listados de efectos personales, notas de sucesos o avisos oficiales. El nombre "Kosterbladstagger" sugiere una herramienta de etiquetado (tagger) para un corpus de prensa historica.

El modelo emplea la metodologia SetFit, que combina un encoder de frases (aqui un SBERT de 109 millones de parametros) con una cabeza de clasificacion entrenada de forma few-shot mediante pares de texto contrastivos. Esto permite obtener un clasificador ligero y rapido sin necesidad de un ajuste fino masivo, algo relevante para proyectos de humanidades digitales con recursos limitados.

Con 0 descargas y 0 likes en el momento de la consulta, se trata de un modelo recien publicado y de nicho, orientado a un corpus muy especifico (prensa danesa del siglo XIX o principios del XX). Su relevancia actual es limitada fuera de ese dominio, pero resulta un ejemplo representativo de como SetFit se aplica a tareas de clasificacion documental historica con pocos datos etiquetados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit sobre encoder BERT (base_model: Old_News_Segmentation_SBERT_V0.1) |
| Parametros totales | 109.482.240 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de BERT) |
| Idiomas soportados | no disponible (los ejemplos de la model card estan en danes) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SetFit: un encoder de frases preentrenado (derivado de `JohanHeinsen/Old_News_Segmentation_SBERT_V0.1`, a su vez basado en BERT) que genera embeddings, seguido de una cabeza de clasificacion entrenada con la tecnica de SetFit. SetFit genera pares de frases positivos y negativos a partir de ejemplos etiquetados, ajusta el encoder con una perdida contrastiva y despues entrena un clasificador ligero (regresion logistica o similar) sobre los embeddings resultantes. Esto permite un aprendizaje few-shot eficiente.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en un clasificador de este tipo). La model card incluye ejemplos de texto en danes antiguo (listados de objetos, anuncios de subastas, notas de arrestos), lo que indica que el corpus de entrenamiento probablemente consiste en fragmentos de periodicos daneses historicos etiquetados por seccion o tipo de contenido.

## Capacidades

- Clasificacion de texto multietiqueta o multiclase (segun la configuracion del entrenamiento SetFit) sobre fragmentos de prensa historica danesa.
- Segmentacion y etiquetado de secciones documentales: anuncios de subastas, listados de efectos personales, notas de sucesos, avisos oficiales.
- Generacion de embeddings de frases mediante el encoder base, util para busqueda semantica o agrupamiento sobre el mismo dominio.
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No se documenta soporte de tool calling ni de agentes.
- Capacidades multilingues: no documentadas; los ejemplos y el modelo base apuntan a danes historico.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Segmentacion de corpus de prensa historica: el modelo permite etiquetar automaticamente fragmentos de periodicos daneses del siglo XIX en categorias como subastas, sucesos o anuncios oficiales, facilitando la indexacion y el estudio posterior por parte de historiadores.
- Extraccion de entidades en anuncios de subastas: al clasificar los fragmentos que corresponden a listados de objetos, se puede encadenar con un NER para extraer prendas, materiales y precios, agilizando la creacion de bases de datos de cultura material.
- Filtrado de ruido documental: en pipelines de digitalizacion (OCR de periodicos), el clasificador descarta o separa paginas irrelevantes antes de un procesamiento mas costoso, reduciendo el volumen a revisar manualmente.
- Analisis de discurso historico: al agrupar fragmentos por tipo de seccion, los investigadores pueden medir la frecuencia de anuncios de arrestos o de subastas a lo largo del tiempo y correlacionarla con eventos historicos.
- Enriquecimiento de archivos digitales: integrado en un pipeline de humanidades digitales, el modelo asigna etiquetas a cada fragmento para alimentar un buscador facetado o un repositorio con metadatos estructurados.
- Prototipado rapido con SetFit: al ser un ejemplo funcional de clasificacion few-shot sobre texto historico, sirve como plantilla para entrenar clasificadores analogos en otros corpus (por ejemplo, prensa espanola del XIX) con pocos ejemplos etiquetados.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (dataset no especificado, split de test, no verificados):

| Metrica | Valor |
|---|---|
| Accuracy | 0,9992 |
| F1 | 0,9990 |
| Precision | 1,0000 |
| Recall | 0,9979 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. Los valores tan elevados deben interpretarse con cautela, ya que el dataset de evaluacion no esta identificado y las metricas no estan verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-1 GB en fp32 para los 109 millones de parametros, y menos de 0,5 GB en cuantizacion int8.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4090 o incluso CPU son viables para lotes pequenos.
- Cabe en cualquier GPU consumer (GTX 1650 en adelante) y en CPU para inferencia por lotes.
- Opciones de despliegue: transformers con PyTorch, sentence-transformers para el encoder, Text Embeddings Inference (el modelo esta marcado como `text-embeddings-inference` y `endpoints_compatible`), y exportacion a ONNX para produccion.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera un throughput alto en GPU y moderado en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PE_Kosterbladstagger | 109,5 M | no disponible | Clasificacion de texto (SetFit) | no disponible | Hugging Face |
| Alternativas SetFit genericas (p. ej., setfit/all-MiniLM-L6-v2) | ~22-110 M | 256-512 tokens | Clasificacion few-shot | Apache 2.0 / MIT (segun variante) | Hugging Face |
| BETO (BERT en espanol) | ~110 M | 512 tokens | Embeddings y clasificacion | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparables en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo de nicho: entrenado sobre prensa danesa historica; su rendimiento fuera de ese dominio o idioma es incierto y no documentado.
- Metricas no verificadas: los resultados de la model card (accuracy 0,9992) no indican el dataset de evaluacion ni han sido validados de forma independiente; pueden reflejar sobreajuste o un conjunto de test poco representativo.
- Licencia no disponible: no se puede confirmar el uso comercial; es imprescindible contactar con el autor antes de utilizarlo en produccion.
- Riesgo de alucinacion no aplicable a la generacion, pero si de clasificaciones erroneas en fragmentos ambiguos o con OCR deficiente.
- Sin informacion sobre sesgos: al trabajar con textos historicos, puede heredar sesgos de la epoca y del corpus (terminologia, categorias sociales).
- Longitud de contexto no documentada: el encoder base BERT suele limitarse a 512 tokens, lo que restringe la clasificacion de fragmentos largos.
- Sin soporte multilingue documentado: no se recomienda su uso en castellano sin reentrenamiento.
- Repositorio con 0 descargas: no hay evidencia de uso en produccion ni de mantenimiento activo.

## Enlaces

- Hugging Face: https://huggingface.co/JohanHeinsen/PE_Kosterbladstagger
- Modelo base: https://huggingface.co/JohanHeinsen/Old_News_Segmentation_SBERT_V0.1
- Paper de SetFit (arXiv:2209.11055): https://arxiv.org/abs/2209.11055
