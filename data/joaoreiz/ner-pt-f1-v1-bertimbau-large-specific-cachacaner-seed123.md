# JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-cachacaner-seed123

## Resumen

El modelo `JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-cachacaner-seed123` es un ajuste fino (fine-tuning) de BERTimbau large, la variante grande del modelo BERT preentrenado en portugués brasileño, para la tarea de reconocimiento de entidades nombradas (NER). Desarrollado por JoaoReiz, se entrena sobre el subconjunto "cachacaner" del protocolo NEVE NER, con el modelo base congelado y selección de la mejor época según la métrica `validation_end_to_end_f1`. Con 333 millones de parámetros y una arquitectura transformer encoder-only, este modelo está diseñado específicamente para etiquetar tokens en textos portugueses, aunque su especialización en un split concreto limita su generalización a otros dominios. Su relevancia radica en ofrecer una alternativa ajustada para tareas de NER en portugués, aprovechando las representaciones contextuales de BERTimbau.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT large (encoder-only transformer) |
| Parametros totales | 333.382.691 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 (estandar de BERT) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugues (pt) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en BERTimbau large (`neuralmind/bert-large-portuguese-cased`), un transformer encoder-only de 24 capas, 1024 dimensiones ocultas y 16 cabezas de atención, preentrenado sobre el corpus BrWaC (Brazilian Web as Corpus) durante 1.000.000 de pasos con enmascaramiento de palabras completas. El ajuste fino se realiza congelando el modelo base (frozen) y añadiendo una capa de clasificación de tokens para NER. El entrenamiento se lleva a cabo sobre el split "cachacaner" del protocolo NEVE NER, con una semilla fija (123) y selección del mejor modelo basada en la métrica `validation_end_to_end_f1`. No se proporcionan detalles sobre el número de épocas, tasa de aprendizaje ni composición del dataset, más allá de que corresponde a un protocolo de NER en portugués.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en portugues, etiquetando tokens como personas, organizaciones, lugares, fechas, etc.
- Clasificacion de tokens (token classification) mediante la pipeline de `transformers` con `pipeline_tag: token-classification`.
- Procesamiento de texto en portugues, tanto de Brasil como de otras variantes, aunque el modelo base esta entrenado principalmente en portugues brasileño.
- Inferencia con el formato safetensors, compatible con la libreria `transformers` y con endpoints de Hugging Face (region:us).
- No se documentan capacidades adicionales como tool calling, agentes, vision o audio.

## Casos de uso

- Extraccion de entidades en documentos legales: el modelo puede identificar automaticamente nombres de personas, organizaciones y lugares en contratos o sentencias, facilitando la indexacion y busqueda posterior. Su especializacion en el split cachacaner sugiere un dominio concreto, aunque no se especifica cual.
- Analisis de noticias y articulos periodisticos: para detectar entidades relevantes en textos informativos en portugues, permitiendo construir resumenes o alertas tematicas.
- Anonimizacion de datos personales: al etiquetar nombres, direcciones y otros datos sensibles, el modelo puede asistir en la desidentificacion de documentos antes de su publicacion o comparticion.
- Enriquecimiento de bases de conocimiento: extrayendo entidades de textos corporativos o academicos para alimentar grafos de conocimiento o sistemas de recomendacion.
- Procesamiento de redes sociales: deteccion de menciones a marcas, personas o lugares en publicaciones en portugues, util para monitorizacion de reputacion o analisis de sentimiento.
- Sistemas de busqueda semantica: utilizando las entidades extraidas como metadatos para mejorar la precision de motores de busqueda internos en organizaciones que manejan grandes volumenes de texto en portugues.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 333 millones de parametros, con un tamaño de pesos en FP32 de aproximadamente 1,3 GB. En FP16 la huella se reduce a unos 670 MB, por lo que una GPU con al menos 2 GB de VRAM podria ejecutar inferencia con un batch pequeno.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) es suficiente para inferencia en lotes pequenos. Para entrenamiento o fine-tuning adicional se necesitarian GPUs con 8 GB o mas (RTX 3070, A100).
- Es viable en CPU para inferencia de baja latencia, aunque mas lenta que en GPU.
- Opciones de despliegue: compatible con la libreria `transformers` de Hugging Face, pudiendo exportarse a ONNX o TensorRT para optimizacion. Tambien puede servirse mediante TGI (Text Generation Inference) o un endpoint de Hugging Face.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa con otros modelos NER en portugues. Como referencia, el modelo base BERTimbau large tiene el mismo tamano y arquitectura, y existen variantes como `ner-pt-f1-v1-bertimbau-base-specific-cachacaner-seed3407` (base, con 109 millones de parametros) que podrian compararse en rendimiento, pero no se han publicado metricas para ninguno de ellos. Por tanto, la comparativa se limita a indicar que el modelo es un ajuste fino de BERTimbau large, sin datos de rendimiento relativos.

## Limitaciones y advertencias

- Entrenado exclusivamente en portugues, principalmente brasileño, por lo que su rendimiento en otras variantes (portugues europeo o africano) puede ser inferior.
- Especializado en el split "cachacaner" del protocolo NEVE NER, lo que puede limitar su generalizacion a otros dominios o tipos de entidades no presentes en ese subconjunto.
- La licencia no esta especificada, lo que impide conocer las restricciones de uso comercial o modificacion.
- No se han publicado evaluaciones de sesgos o robustez ante textos adversarios; como modelo NER, puede presentar errores de etiquetado en contextos ambiguos o con jerga tecnica.
- El modelo fue creado en 2026 y no tiene descargas ni likes, lo que sugiere que es un experimento reciente sin validacion externa.
- No se proporcionan datos sobre el dataset NEVE ni su composicion, por lo que la reproducibilidad del entrenamiento es limitada.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-cachacaner-seed123)
- [Variante base del mismo autor](https://huggingface.co/JoaoReiz/ner-pt-f1-v1-bertimbau-base-specific-cachacaner-seed3407)
- [Modelo base BERTimbau large (neuralmind/bert-large-portuguese-cased)](https://huggingface.co/neuralmind/bert-large-portuguese-cased)
- [Repositorio GitHub de BERTimbau](https://github.com/ClaudioSS01/portuguese-Bertimbau)
- [Publicacion sobre BERTimbau en Ontosight.ai](https://ontosight.ai/publication/ieee-intelligent-systems-9045ace8909cd7bb08c120deafad29db00a41f2604de21f605dc1fdd)
- [Recurso BERTimbau en PORTULAN CLARIN](https://portulanclarin.net/repository/browse/bertimbau-portuguese-bert-base-language-model/486edb32e93711ebabf702420a8701536b383b588f2f4c85b13b4d04c2867a4b/)
