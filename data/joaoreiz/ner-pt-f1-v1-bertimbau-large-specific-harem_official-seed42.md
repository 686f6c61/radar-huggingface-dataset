# JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-harem_official-seed42

## Resumen

Este modelo es un BERTimbau large (arquitectura BERT, 333 millones de parámetros) ajustado para reconocimiento de entidades nombradas (NER) en portugués. Lo desarrolla JoaoReiz y se entrena sobre el split congelado `harem_official` del protocolo NEVE NER, un estándar de evaluación para NER en portugués. El ajuste se realiza sobre el checkpoint `neuralmind/bert-large-portuguese-cased` en su revisión `04d32656d29d056271283dedb58c20ea6162a9a9`, con semilla fija 42 y selección del mejor checkpoint según F1 end-to-end en validación.

La relevancia de este modelo reside en que ofrece una alternativa de tamaño medio para NER en portugués, un idioma con menos recursos que el inglés. Al estar basado en BERTimbau, hereda el conocimiento preentrenado sobre BrWaC, un corpus web brasileño de gran tamaño, y lo especializa para la detección de entidades en el dominio del protocolo HAREM. El modelo se distribuye en formato safetensors y es compatible con la librería transformers para la tarea de token-classification.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT large (encoder Transformer, 24 capas, 1024 dimensiones ocultas) |
| Parametros totales | 333.368.341 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 512 tokens (limitacion estandar de BERT) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugues (pt) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en BERTimbau large, un BERT cased preentrenado sobre BrWaC (Brazilian Web as Corpus) durante 1.000.000 de pasos con whole-word mask. La arquitectura es un encoder Transformer de 24 capas con 1024 dimensiones ocultas y 16 cabezas de atencion, que produce representaciones contextuales de 1024 dimensiones para cada token de entrada.

El ajuste fino se realiza sobre el split `harem_official` del protocolo NEVE NER, un conjunto de evaluacion estandar para NER en portugues. El entrenamiento utiliza semilla fija 42 para reproducibilidad y selecciona el checkpoint optimo en funcion de la metrica F1 end-to-end sobre el conjunto de validacion. No se dispone de informacion sobre el numero de epocas, tasa de aprendizaje ni tecnicas de regularizacion empleadas, ya que la model card no las detalla.

## Capacidades

- Reconocimiento de entidades nombradas en portugues: personas, organizaciones, lugares, fechas, valores y otras categorias definidas por el protocolo HAREM.
- Clasificacion token a token (token-classification) con etiquetas BIO/IOB, devolviendo el tipo de entidad para cada token del texto.
- Inferencia sobre texto en portugues, tanto brasileño como europeo, dado que BERTimbau se entrena con corpus brasileño pero generaliza razonablemente a otras variantes.
- Integracion directa con el pipeline `token-classification` de la libreria transformers, lo que facilita su despliegue en aplicaciones existentes.
- Compatibilidad con el ecosistema Hugging Face: carga mediante `AutoModelForTokenClassification` y `AutoTokenizer`.

## Casos de uso

- Extraccion de entidades en documentos legales portugueses: el modelo puede identificar organizaciones, personas y fechas en contratos y sentencias, facilitando la indexacion y busqueda documental en despachos de abogados.
- Monitorizacion de menciones en redes sociales: deteccion de nombres de empresas y productos en comentarios de Twitter o Instagram en portugues para analisis de reputacion de marca.
- Anonimizacion de historiales clinicos: identificacion de nombres de pacientes, medicos y centros hospitalarios en textos medicos para cumplir con normativas de proteccion de datos antes de su publicacion.
- Enriquecimiento de articulos periodisticos: extraccion de entidades en noticias en portugues para construir grafos de conocimiento y sistemas de recomendacion de contenido relacionado.
- Procesamiento de curriculum vitae: extraccion de nombres, empresas, universidades y fechas en CVs en portugues para sistemas de reclutamiento automatizado.
- Analisis de actas parlamentarias: identificacion de oradores, partidos y temas en transcripciones de sesiones legislativas para estudios de ciencia politica.
- Chatbots de atencion al cliente: extraccion de nombres de clientes, numeros de pedido y fechas en conversaciones de soporte para enrutar consultas y automatizar respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la seleccion del checkpoint se realiza mediante F1 end-to-end sobre el conjunto de validacion del split `harem_official`, pero no se proporcionan los valores numericos obtenidos. No se dispone de comparaciones cuantitativas con otros modelos NER para portugues.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en fp32 y unos 670 MB en fp16, dado que el modelo tiene 333 millones de parametros.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp32 o 1 GB para fp16. Tarjetas como NVIDIA GTX 1060, RTX 2060, RTX 3060 o superiores son suficientes para inferencia.
- Es viable en CPU para inferencia por lotes pequeños, con latencias de decenas de milisegundos por frase de longitud media (BERT large es notablemente mas lento que BERT base en CPU).
- Opciones de despliegue: transformers con PyTorch, pipelines de Hugging Face, endpoints compatibles (el modelo incluye el tag `endpoints_compatible`), y servidores de inferencia como Hugging Face Inference Endpoints.
- Para entrenamiento o ajuste adicional, se recomienda una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3070 o superior) con gradiente acumulado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia |
|---|---|---|---|---|
| JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-harem_official-seed42 | 333 M | 512 | pt | no disponible |
| JoaoReiz/ner-pt-f1-v1-bertimbau-base-specific-harem_official-seed42 | 109 M (BERT base) | 512 | pt | no disponible |
| JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-harem-official-seed3407 | 4 B (Qwen 3.5) | mayor (tipicamente 32k) | pt y otros | no disponible |

Los tres modelos del mismo autor se entrenan sobre el mismo protocolo NEVE NER con el split `harem_official`, lo que permite comparar directamente el rendimiento entre arquitecturas. La version base es mas ligera y rapida, adecuada para despliegue en produccion con recursos limitados; la version large ofrece mayor capacidad de representacion; y la version Qwen 3.5 de 4B parametros, al ser un modelo decoder, puede ofrecer mayor flexibilidad para tareas generativas ademas de NER, aunque con requisitos de hardware superiores.

## Limitaciones y advertencias

- No se dispone de informacion sobre la licencia del modelo, por lo que se recomienda contactar con el autor antes de un uso comercial.
- El modelo se entrena exclusivamente sobre el protocolo HAREM, cuyas categorias de entidades pueden no cubrir todos los dominios especificos (por ejemplo, entidades biomedicas o tecnicas).
- La longitud de contexto esta limitada a 512 tokens, lo que impide procesar documentos largos de una sola pasada; sera necesario segmentar el texto.
- Al ser un modelo cased, la normalizacion de mayusculas y minusculas puede afectar al rendimiento si el texto de entrada no respeta las convenciones ortograficas.
- El preentrenamiento se realiza sobre BrWaC, un corpus brasileño, por lo que el rendimiento puede degradarse con variantes del portugues europeo o africano.
- No se han publicado metricas de rendimiento, por lo que no es posible validar su calidad relativa frente a otros modelos NER en portugues.
- Riesgo de alucinacion en la clasificacion: el modelo puede etiquetar como entidades tokens que no lo son, especialmente en dominios fuera de su distribucion de entrenamiento.
- No se dispone de informacion sobre sesgos demograficos o linguisticos especificos del modelo, aunque al heredar de BERTimbau puede arrastrar sesgos presentes en el corpus BrWaC.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-harem_official-seed42
- Version base del mismo autor: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-bertimbau-base-specific-harem_official-seed42
- Version Qwen 3.5 4B del mismo autor: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-harem-official-seed3407
- Repositorio BERTimbau en GitHub: https://github.com/ClaudioSS01/portuguese-Bertimbau
- Guia de evaluacion NER de BERTimbau: https://github.com/neuralmind-ai/portuguese-bert/blob/master/ner_evaluation/README.md
- BERTimbau en PORTULAN CLARIN: https://portulanclarin.net/repository/browse/bertimbau-portuguese-bert-base-language-model/486edb32e93711ebabf702420a8701536b383b588f2f4c85b13b4d04c2867a4b/
