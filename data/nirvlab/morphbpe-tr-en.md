# NIRVLab/morphbpe-tr-en

## Resumen

NIRVLab/morphbpe-tr-en es un modelo de traduccion automatica desarrollado por NIRVLab, basado en la arquitectura MorphBART. Esta arquitectura adapta el backbone facebook/mbart-large-50-many-to-many-mmt e incorpora dos innovaciones tecnicas: Adaptive Boundary-Token Fusion e Intra-Word Morphological Attention, orientadas a mejorar el tratamiento de lenguas aglutinantes como el turco. El nombre del repositorio sugiere que el modelo se centra en la traduccion entre turco e ingles, y su pipeline declarado es text2text-generation.

Con 611.129.542 parametros y un tamano de repositorio de 1,2 GB, se trata de un modelo de tamano medio que puede ejecutarse en hardware de consumo. Segun la documentacion disponible en la busqueda web, el modelo se entreno con 100.000 pares paralelos de OPUS-100, seleccionando el checkpoint por mejor eval_bleu a lo largo de 5 epocas. La informacion publica es limitada: la model card es una plantilla generica y no se han publicado resultados de benchmarks ni especificaciones de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MorphBART (Adaptive Boundary-Token Fusion + Intra-Word Morphological Attention), backbone facebook/mbart-large-50-many-to-many-mmt |
| Parametros totales | 611.129.542 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Turco e ingles (indicado en el nombre del modelo 'tr-en') |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura MorphBART es una variante del modelo encoder-decoder mBART-large-50, que combina el backbone preentrenado multilingue con mecanismos de fusion de tokens de frontera adaptativos y atencion morfologica intra-palabra. El objetivo es capturar mejor la estructura interna de las palabras, un aspecto relevante en lenguas aglutinantes como el turco.

El entrenamiento se realizo sobre 100.000 pares paralelos del corpus OPUS-100. El checkpoint final se selecciono mediante el mejor valor de BLEU de evaluacion a lo largo de 5 epocas. No se menciona en la informacion disponible el uso de RLHF, DPO ni otras tecnicas de alineacion posteriores al entrenamiento. Tampoco se detallan hiperparametros de entrenamiento, composicion exacta del dataset ni procedimientos de preprocesamiento.

## Capacidades

- Traduccion automatica entre turco e ingles, segun el nombre del modelo.
- Generacion de texto en formato texto a texto, compatible con el pipeline de transformers.
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso, vision o audio en la informacion disponible.

## Casos de uso

- Traduccion de documentacion tecnica: el modelo puede convertir manuales, especificaciones o informes tecnicos del turco al ingles en un pipeline de texto a texto.
- Localizacion de interfaces de usuario: se integraria en un sistema de traduccion automatica para traducir cadenas de texto de aplicaciones web o moviles.
- Traduccion de contenido audiovisual: podria utilizarse para generar subtitulos en ingles a partir de guiones o dialogos en turco.
- Soporte en atencion al cliente bilingue: en sistemas de tickets, el modelo traduciria consultas de clientes turcos al ingles para agentes que no dominan el turco.
- Preprocesamiento de datos para NLP: como modelo de traduccion, puede enriquecer corpus multilingues o crear conjuntos de datos paralelos para entrenar otros modelos.
- Investigacion en morfologia computacional: dado su enfoque en atencion morfologica intra-palabra, resulta util como referencia para estudiar la traduccion de lenguas aglutinantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Solo se indica que la seleccion del checkpoint se realizo por mejor eval_bleu en 5 epocas de entrenamiento, sin valores concretos.

## Requisitos de hardware

- VRAM estimada para inferencia: ~2-4 GB en FP16, calculado a partir de 611 millones de parametros y el overhead de runtime.
- GPU recomendadas: tarjetas de consumo con al menos 4 GB de VRAM, por ejemplo RTX 3060, RTX 4050 o equivalentes.
- No se dispone de cuantizaciones publicadas, por lo que no se puede indicar soporte para GPU con menos VRAM.
- Opciones de despliegue: transformers (pipeline), vLLM, TGI, llama.cpp si se convierte a GGUF, y Ollama si se importa el modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. El modelo es un fine-tuning de mBART-large-50, por lo que su categoria es la de modelos de traduccion neuronal basados en encoder-decoder. No se han verificado especificaciones de modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La model card es una plantilla generica, sin informacion sobre sesgos, riesgos o limitaciones especificas del modelo.
- No se han publicado evaluaciones ni benchmarks en la informacion disponible.
- La licencia no esta especificada, lo que dificulta determinar su uso comercial.
- No se dispone de informacion sobre los datos de entrenamiento mas alla de 100.000 pares de OPUS-100.
- Existe riesgo de alucinacion en traducciones, como en cualquier modelo de lenguaje.
- El modelo no esta desplegado por ningun proveedor de inferencia, segun la pagina del Hub.

## Enlaces

- https://huggingface.co/NIRVLab/morphbpe-tr-en
- https://huggingface.co/NIRVLab/MorphBART-tr-en (resultado de busqueda, parece ser el mismo modelo)
- https://arxiv.org/abs/1910.09700 (paper de mBART)
