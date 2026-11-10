# MohamedBelal-AI/deberta-v3-base-conll2003-ner

## Resumen

El modelo `MohamedBelal-AI/deberta-v3-base-conll2003-ner` es un ajuste fino de `microsoft/deberta-v3-base` para reconocimiento de entidades nombradas (NER) en inglés sobre el corpus CoNLL-2003. Lo publica el usuario MohamedBelal-AI y resuelve la tarea clasica de etiquetado a nivel de token para identificar personas (PER), organizaciones (ORG), localizaciones (LOC) y entidades miscelaneas (MISC). Es relevante como pieza de referencia para pipelines de extraccion de informacion en ingles, con un F1 a nivel de entidad de 92,48 en el conjunto de test.

La arquitectura subyacente es DeBERTa-v3, un transformer encoder con atencion desacoplada y embeddings de posicion relativos, adaptado aqui como cabecera de token classification. El modelo tiene 183.838.473 parametros y un repositorio de 0,7 GB en formato safetensors. La longitud de contexto del modelo base es de 512 tokens, aunque el autor indica que las entradas de mas de 256 subtokens se truncan en la practica.

Se trata de un modelo pequeno y especializado, no generativo, pensado para inferencia rapida en CPU o GPU consumer. Su licencia MIT facilita el uso comercial, y su integracion con `transformers` y con endpoints compatibles lo hace adecuado para prototipado rapido en tareas de NER en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3) con cabecera de clasificacion de tokens |
| Parametros totales | 183.838.473 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens en el modelo base; el autor indica truncamiento a 256 subtokens en la practica |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/deberta-v3-base`, un transformer encoder con atencion desacoplada (contenido y posicion separados) y embeddings de posicion relativos, y anade una cabecera de clasificacion de tokens para las etiquetas de CoNLL-2003 (PER, ORG, LOC, MISC y O). El ajuste fino se realizo sobre las particiones oficiales de CoNLL-2003 (14.041 frases de entrenamiento, 3.250 de validacion y 3.453 de test), eliminando los marcadores `-DOCSTART-`, con alineacion de etiquetas al primer subtoken y evaluacion a nivel de entidad con `seqeval`.

El entrenamiento uso AdamW con learning rate 2e-05, weight decay 0,01, calentamiento lineal del 10% seguido de decaimiento, recorte de gradiente de 1,0 y semilla 42. Se aplico aumento de datos bajando a minusculas el 20% de las frases de entrenamiento, y el mejor checkpoint se selecciono por F1 de validacion con parada temprana (mejor epoca: 5). No se menciona RLHF, DPO ni tecnicas de decodificacion especulativa; es un ajuste supervisado clasico de clasificacion de tokens.

## Capacidades

- Reconocimiento de entidades nombradas en ingles para cuatro tipos: persona (PER), organizacion (ORG), localizacion (LOC) y miscelanea (MISC).
- Clasificacion a nivel de token con etiquetas en formato BIO (o similar) compatible con `transformers` y `seqeval`.
- Inferencia rapida en CPU y GPU consumer por su tamano reducido (183,8 M de parametros).
- Integracion con el pipeline `token-classification` de Hugging Face y con endpoints compatibles.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada: solo ingles.

## Casos de uso

- Extraccion de entidades en articulos de prensa en ingles: el modelo identifica personas, organizaciones y localizaciones en textos periodisticos, adecuado por su entrenamiento sobre Reuters newswire de los anos 90.
- Enriquecimiento de bases de datos documentales: permite poblar campos estructurados (autor, organizacion, lugar) a partir de texto libre en pipelines ETL.
- Preprocesado para sistemas de busqueda y recuperacion: las entidades extraidas se pueden indexar como metadatos para filtrar y rankear resultados.
- Anonimizacion y seudonimizacion de textos: deteccion de nombres de persona (PER) para sustituirlos antes de compartir documentos, con la advertencia de que el rendimiento baja en textos modernos o informales.
- Analisis de noticias y monitorizacion de medios: agregacion de menciones de organizaciones y localizaciones para cuadros de mando de reputacion o seguimiento de eventos.
- Prototipado rapido y pruebas de concepto: al ser un modelo pequeno con licencia MIT, sirve para validar arquitecturas de NER antes de invertir en modelos mayores o en datos propios.
- Etiquetado asistido de corpus: generacion de preanotaciones para revision humana en proyectos de anotacion de entidades en ingles.

## Benchmarks y rendimiento

Resultados a nivel de entidad con `seqeval`, segun la model card del autor:

| Metrica | Valor |
|---|---|
| F1 en test | 92,48 |
| Precision en test | 91,58 |
| Recall en test | 93,40 |
| F1 en validacion (mejor epoca, 5) | 96,21 |
| F1 en test con entrada totalmente en minusculas | 88,75 |
| PER F1 (soporte 1617) | 97,58 |
| ORG F1 (soporte 1661) | 91,01 |
| LOC F1 (soporte 1668) | 93,90 |
| MISC F1 (soporte 702) | 81,30 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni otros benchmarks generales.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,7 GB para los pesos (183,8 M de parametros); en fp16 alrededor de 0,4 GB, mas overhead de activaciones y tokenizador.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4090 o incluso una GTX 1650 pueden ejecutar el modelo con comodidad.
- Cabe en GPU consumer y en CPU: el modelo es viable en inferencia por CPU para lotes pequenos.
- Opciones de despliegue: `transformers` (pipeline `token-classification`), servidores de inferencia compatibles con Hugging Face Endpoints, y exportacion a ONNX si se necesita optimizar latencia (no documentado por el autor).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 CoNLL-2003 (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MohamedBelal-AI/deberta-v3-base-conll2003-ner | 183,8 M | 512 (truncado a 256 en la practica) | 92,48 | MIT | Hugging Face |
| microsoft/deberta-v3-base (base, sin ajuste NER) | 183,8 M | 512 | no aplica (no es NER) | MIT | Hugging Face |
| dslim/bert-base-NER | 108 M | 512 | no disponible en esta informacion | MIT | Hugging Face |
| Jean-Baptiste/roberta-large-ner-english | 355 M | 512 | no disponible en esta informacion | MIT | Hugging Face |

La comparativa con alternativas concretas de NER en ingles no puede completarse con datos verificados en la informacion proporcionada; los valores de F1 de los modelos alternativos no estan disponibles aqui y no se inventan.

## Limitaciones y advertencias

- Solo ingles: no soporta otros idiomas.
- Entrenado sobre Reuters newswire de los anos 90; el rendimiento puede degradarse en texto moderno, tecnico o de redes sociales.
- Sensible a las mayusculas: el F1 en test cae de 92,48 a 88,75 con entrada totalmente en minusculas.
- MISC es la categoria mas debil (F1 81,30) por ser heterogenea; la confusion mas comun es ORG/LOC (por ejemplo, nombres de ciudades usados como equipos).
- Las entradas de mas de 256 subtokens se truncan, lo que puede perder entidades en documentos largos.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de falsos positivos y negativos en la deteccion de entidades.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del corpus CoNLL-2003 para usos derivados.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; no hay validacion comunitaria independiente de los resultados reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MohamedBelal-AI/deberta-v3-base-conll2003-ner
- Modelo base: https://huggingface.co/microsoft/deberta-v3-base
- Dataset CoNLL-2003 en Hugging Face: https://huggingface.co/datasets/conll2003
- Documentacion de DeBERTa-v3 (paper): https://arxiv.org/abs/2111.09543
- Documentacion del pipeline `token-classification`: https://huggingface.co/docs/transformers/tasks/token_classification
- Libreria `seqeval`: https://github.com/chakki-works/seqeval
