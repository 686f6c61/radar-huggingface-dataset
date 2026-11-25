# nainiayoub/FloraNER-camembert-fine

## Resumen

FloraNER-camembert-fine es un modelo de reconocimiento de entidades nombradas (NER) para texto botanico en frances, desarrollado por nainiayoub (Ayoub Nainia) y publicado en Hugging Face. Se trata de un ajuste fino de `almanach/camembert-base`, un transformer encoder de tipo RoBERTa adaptado al frances, sobre el dataset FloraNER, que anota texto botanico procedente de la *Flore de la Nouvelle-Caledonie* mediante supervision distante. El modelo resuelve la extraccion estructurada de organos vegetales y descriptores morfologicos tipados en descripciones botanicas.

La relevancia del modelo radica en su especializacion: no es un NER generico, sino que distingue tipos de descriptores morfologicos (forma, medida, superficie, color, posicion, disposicion, estructura, desarrollo) ademas de la entidad `ORGANE`. Con 110 millones de parametros, un contexto de 512 tokens propio de la arquitectura CamemBERT y un F1 a nivel de entidad de 94,59 sobre el split de test publicado, ofrece un rendimiento alto para una tarea de dominio muy especifico y con recursos limitados.

El modelo esta pensado para su uso en pipelines de extraccion de informacion botanica, digitalizacion de floras y construccion de bases de datos de biodiversidad. Su licencia MIT y su reducido tamano lo hacen desplegable en hardware modesto, incluyendo GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (CamemBERT, base de RoBERTa adaptada al frances) |
| Parametros totales | 110.047.509 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (ventana de entrenamiento de 256 tokens; limite arquitectonico de CamemBERT) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar via transformers/bitsandbytes, no documentada por el autor) |
| Idiomas soportados | frances (fr) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `camembert-base`, un transformer encoder de 12 capas y 768 dimensiones ocultas basado en la arquitectura RoBERTa y preentrenado sobre un corpus frances de gran tamano. Sobre esta base se anade una cabeza de clasificacion de tokens para etiquetado BIO. El ajuste fino se realizo durante 16 epocas con learning rate 5e-05, batch de 16, optimizador AdamW con weight decay 0.01 y precision bf16, seleccionando la mejor epoca por F1 en test. El entrenamiento completo requirio 8 minutos en una GPU de portatil RTX 4000 Ada.

Los datos de entrenamiento proceden del dataset FloraNER, construido por supervision distante (basada en lexicos) sobre la *Flore de la Nouvelle-Caledonie*. Los parrafos se dividieron en ventanas de como maximo 256 tokens, resultando en 1293 ventanas de entrenamiento y 314 de test. Las etiquetas cubren `ORGANE` y descriptores tipados: `FORME`, `MESURE`, `SURFACE`, `COULEUR`, `POSITION`, `DISPOSITION`, `STRUCTURE`, `DEVELOPPEMENT` y `DESCRIPTEUR` para el resto. No se documenta el uso de RLHF ni DPO, algo esperable en un modelo encoder de clasificacion.

## Capacidades

- Reconocimiento de entidades nombradas en texto botanico frances: identificacion de organos vegetales (`ORGANE`).
- Clasificacion de descriptores morfologicos tipados: forma, medida, superficie, color, posicion, disposicion, estructura y desarrollo.
- Etiquetado a nivel de token con esquema BIO y agregacion de entidades mediante `aggregation_strategy`.
- Procesamiento de parrafos botanicos de hasta 256 tokens por ventana (limite arquitectonico de 512).
- Integracion directa con el pipeline `token-classification` de Hugging Face Transformers.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento: es un modelo discriminativo de clasificacion de tokens.

## Casos de uso

- Digitalizacion de floras historicas: extraer automaticamente organos y descriptores morfologicos de textos botanicos escaneados y transcritos, alimentando bases de datos estructuradas de biodiversidad.
- Construccion de ontologias botanicas: poblar grafos de conocimiento que relacionen especies, organos y atributos morfologicos a partir de descripciones textuales.
- Busqueda semantica en corpus botanicos: indexar entidades extraidas para permitir consultas del tipo "especies con hojas obovales de 4-9 cm" sobre grandes colecciones documentales.
- Enriquecimiento de registros de herbario: anadir metadatos morfologicos estructurados a fichas de especimenes a partir de sus descripciones textuales asociadas.
- Investigacion en biodiversidad y taxonomia: analisis comparativo de vocabulario morfologico entre floras regionales, detectando terminos no cubiertos por el lexico de entrenamiento.
- Preprocesamiento para pipelines de extraccion de relaciones: usar las entidades detectadas como entrada para modelos posteriores que vinculen organos con especies o con medidas concretas.
- Monitorizacion de calidad de transcripciones: detectar segmentos de texto botanico mal transcritos alli donde el modelo no reconoce entidades esperadas.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de FloraNER (seqeval, coincidencia BIO estricta). No verificados de forma independiente.

| Ambito | Precision | Recall | F1 |
|---|---|---|---|
| Todas las etiquetas | 93,9 | 95,3 | 94,6 |

| Tipo de entidad | P | R | F1 | Soporte |
|---|---|---|---|---|
| colour | 86,6 | 82,1 | 84,3 | 229 |
| descriptor | 92,5 | 92,2 | 92,4 | 1729 |
| development | 0,0 | 0,0 | 0,0 | 4 |
| disposition | 90,2 | 93,9 | 92,0 | 147 |
| form | 90,4 | 95,3 | 92,8 | 725 |
| measure | 92,5 | 98,2 | 95,3 | 227 |
| organ | 97,0 | 98,3 | 97,7 | 4783 |
| position | 96,7 | 98,3 | 97,5 | 181 |
| structure | 84,6 | 91,9 | 88,1 | 149 |
| surface | 80,2 | 82,7 | 81,4 | 485 |

El articulo NLPI 2024 reporta para el pipeline CamemBERT un F1 de 0,96 para especies y 0,94 para terminos de grano fino; el articulo de datos (Data in Brief 2024) reporta modelos de referencia en spaCy.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 para los 110 M de parametros, mas overhead de activaciones; en la practica cabe en cualquier GPU con 2 GB o mas.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU con latencia aceptable para lotes pequenos. En GPU, cualquier modelo desde una GTX 1650 en adelante es suficiente. El autor entreno en una RTX 4000 Ada en 8 minutos.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo actuales, incluidas las integradas de portatiles recientes.
- Opciones de despliegue: pipeline `token-classification` de Transformers, TorchServe, ONNX Runtime, TGI (con soporte de token-classification), FastAPI con transformers como backend. No hay pesos GGUF publicados por el autor, aunque es convertible a GGUF mediante herramientas estandar.
- Latencia y throughput estimados: no disponibles de forma oficial; por el tamano del modelo, se espera latencia de milisegundos por parrafo en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FloraNER-camembert-fine | 110 M | 512 tokens | NER botanico frances (organos y descriptores) | MIT | Hugging Face |
| camembert-base (base sin ajustar) | 110 M | 512 tokens | Modelo de lenguaje enmascarado frances | MIT | Hugging Face |
| Modelos spaCy de referencia (articulo FloraNER) | no disponible | no disponible | NER botanico frances | no disponible | Referencia en publicacion |
| CamemBERT pipeline NLPI 2024 (F1 0,96 especies / 0,94 terminos finos) | no disponible | no disponible | NER botanico frances | no disponible | Publicacion |

No se dispone de comparativas publicadas con otros modelos NER botanicos de dominio especifico en la informacion proporcionada.

## Limitaciones y advertencias

- La anotacion de entrenamiento es distante (basada en lexicos), por lo que las etiquetas de referencia omiten algunas entidades y el modelo hereda ese techo de recall; las metricas se miden contra las mismas etiquetas distantes.
- La fuente es una unica flora regional (Nueva Caledonia); el vocabulario de otras floras puede quedar parcialmente sin cubrir.
- Los tipos de descriptor con pocos ejemplos (position, disposition, development) son menos fiables; development tiene F1 de 0,0 con solo 4 ejemplos de soporte.
- El modelo solo procesa frances; no soporta otros idiomas.
- Ventana de contexto limitada a 512 tokens (entrenado con ventanas de 256), lo que obliga a fragmentar textos largos.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de falsos positivos y negativos en la extraccion de entidades.
- Licencia MIT, que permite uso comercial sin restricciones adicionales, pero sin garantias del autor.
- No es un modelo generativo: no debe usarse para tareas de generacion de texto, razonamiento o dialogo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nainiayoub/FloraNER-camembert-fine
- Dataset FloraNER: https://huggingface.co/datasets/nainiayoub/FloraNER
- Demo en vivo: https://huggingface.co/spaces/nainiayoub/floraner
- Articulo de datos (Data in Brief 2024): https://doi.org/10.1016/j.dib.2024.110824
- Repositorio Zenodo del dataset: https://doi.org/10.5281/zenodo.12765869
- Articulo NLPI 2024 (HAL): https://hal.science/hal-04536866
- Modelo base: https://huggingface.co/almanach/camembert-base
