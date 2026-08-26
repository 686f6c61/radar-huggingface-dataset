# Krasovskiy/anchor-words

## Resumen

El modelo `anchor-words` es un clasificador de texto desarrollado por Krasovskiy que determina qué tipo de entidad representa una palabra dentro de una consulta de búsqueda. Está diseñado específicamente para el nicho del juego online (casinos, apuestas y juegos de azar) y resuelve un problema concreto de SEO: distinguir si una palabra del núcleo semántico se refiere a una marca, una región, un método de pago, una oferta, un tipo de producto o simplemente es una palabra genérica del sector. El modelo se obtiene mediante un ajuste fino completo (full fine-tuning) de `xlm-roberta-base`, con 278 millones de parámetros y una ventana de contexto de hasta 512 tokens.

La relevancia de este modelo reside en que las páginas de afiliados de juegos de azar suelen tener consultas casi idénticas para entidades distintas, como «betway bonus» y «casumo bonus», que son dos páginas diferentes a pesar de su similitud léxica. El modelo clasifica la palabra ancla de la consulta para decidir qué entidad define la página. Se distribuye bajo licencia Apache 2.0 y está disponible en Hugging Face en formato `safetensors`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa base (Transformer encoder) |
| Parametros totales | 278.048.262 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (maximo del modelo base; el ejemplo de uso emplea `max_length=64`) |
| Tipos de cuantizacion | no disponible (formato safetensors sin cuantizacion publicada) |
| Idiomas soportados | multilingue (XLM-RoBERTa, 100+ idiomas; el entrenamiento se realizo en el nicho del juego) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/xlm-roberta-base`, un encoder transformer multilingue de 278 millones de parametros. Se ha realizado un ajuste completo (full fine-tuning) sobre un conjunto de datos de consultas de busqueda del sector del juego, con seis clases de salida. La entrada al modelo combina la palabra a clasificar junto con las consultas mas frecuentes en las que aparece, en un formato textual especifico: `palabra: X\nconsulta: query1 | query2 | ...`. Este contexto es imprescindible porque una palabra aislada como «quatro» o «delta» tiene significados ambiguos (numeral, letra, marca).

El proceso de etiquetado no fue supervisado por humanos de forma directa: las etiquetas se obtuvieron a partir de evidencias indirectas como sugerencias de motores de busqueda, catalogos curados y el comportamiento de la palabra en el nucleo semantico. El autor advierte que algunas etiquetas resultaron contaminadas durante la validacion y fueron corregidas, pero el origen de los datos debe tenerse en cuenta.

## Capacidades

- Clasificacion de palabras en seis clases: `WORD` (palabra generica), `BRAND` (marca o establecimiento), `GEO` (pais, region o ciudad), `PAY` (metodo de pago), `OFFER` (tipo de oferta) y `PRODUCT` (juego o tipo de juego).
- Procesamiento multilingue de consultas de busqueda gracias a la base XLM-RoBERTa.
- Inferencia rapida: 7.825 palabras por segundo en una RTX 4090.
- Formato de entrada flexible: el modelo acepta una palabra acompañada de una lista de consultas separadas por `|`.
- Integracion directa con la libreria `transformers` mediante `AutoModelForSequenceClassification`.
- Complementario al modelo `anchor-pairs`, que resuelve la pregunta de si dos consultas apuntan a la misma pagina.

## Casos de uso

- Optimizacion SEO de paginas de casino y apuestas: el modelo clasifica las palabras del nucleo semantico para decidir que entidad da titulo a cada pagina, evitando duplicidades entre consultas similares de distintas marcas.
- Clasificacion automatica de palabras clave en campañas de marketing digital: se puede integrar en pipelines de procesamiento de datos para etiquetar miles de palabras en segundos, agilizando la creacion de mapas de contenido.
- Deteccion de entidades en consultas multilingues: al estar basado en XLM-RoBERTa, funciona en multiples idiomas sin adaptacion previa, lo que facilita su uso en mercados internacionales del juego.
- Enriquecimiento de bases de datos de SEO: el modelo puede anadir la etiqueta de entidad a cada palabra del nucleo, mejorando la organizacion de repositorios de keywords y la deteccion de gaps de contenido.
- Analisis de competencia en el sector: al clasificar las marcas y ofertas de los competidores a partir de sus consultas, se puede identificar que entidades estan cubriendo y que huecos dejan sin explotar.
- Generacion automatica de sitemaps o arquitectura de informacion: la clasificacion por entidad permite estructurar las paginas de un sitio web de juego segun el tipo de entidad, mejorando la navegacion y el rastreo.
- Soporte en sistemas de recomendacion: el modelo puede etiquetar las consultas de los usuarios para recomendar juegos o casinos segun el tipo de entidad detectada, aunque el autor recomienda complementarlo con catalogos curados.

## Benchmarks y rendimiento

El autor publica resultados en una muestra de validacion separada mediante un hash de la palabra, con la siguiente F1 por clase:

| Clase | Descripcion | F1 |
|---|---|---|
| WORD | Palabra generica del nicho | 0,906 |
| BRAND | Establecimiento o marca | 0,872 |
| GEO | Pais, region, ciudad | 0,826 |
| PAY | Metodo de pago | 0,824 |
| OFFER | Tipo de oferta | 0,755 |
| PRODUCT | Juego o tipo de juego | 0,538 |

Accuracy global: 85,8%. Macro F1: 0,787.

En una segunda evaluacion sobre un conjunto de casos dificiles (112 casos disputados mas una quinta parte de la anotacion manual), el modelo obtiene un macro F1 de 0,4632 frente al 0,4442 de un baseline de embeddings con regresion logistica, una mejora de +0,019. El autor advierte que la diferencia no supera el umbral de cinco puntos y que en los casos limite el modelo aporta poco.

## Requisitos de hardware

- El modelo tiene 278 millones de parametros, lo que en precision FP32 ocupa aproximadamente 1,1 GB en disco.
- En una RTX 4090 se procesan 7.825 palabras por segundo, por lo que un nucleo de 40.000 palabras se clasifica en unos pocos segundos.
- Cabe en tarjetas graficas de consumo con 8 GB o mas de VRAM (RTX 3060, RTX 4070, etc.). Con cuantizacion INT8, el uso de VRAM se reduce a menos de 1 GB.
- Es viable la inferencia en CPU para lotes pequenos o en entornos sin GPU, aunque con menor rendimiento.
- Se puede desplegar con la libreria `transformers` en Python, o mediante servidores de inferencia compatibles con la API de Hugging Face (Text Embeddings Inference, endpoints compatibles).
- El autor menciona que el modelo esta preparado para `endpoints_compatible`, por lo que puede servirse con infraestructura estandar.

## Comparativa con modelos similares

No existen modelos publicados especificamente para la clasificacion de palabras ancla en consultas de SEO del sector del juego. La comparativa mas directa es con el modelo base y con alternativas genericas de clasificacion de texto multilingue:

| Modelo | Parametros | Contexto | F1 macro | Licencia |
|---|---|---|---|---|
| `anchor-words` (este) | 278 M | 512 tokens | 0,787 | apache-2.0 |
| `xlm-roberta-base` (base) | 278 M | 512 tokens | no evaluado | MIT |
| `mDeBERTa-v3-base` | 278 M | 512 tokens | no evaluado | MIT |

`anchor-words` es el unico modelo ajustado para esta tarea concreta. El autor advierte que no se ha probado en otros nichos y que su rendimiento fuera del sector del juego es desconocido.

## Limitaciones y advertencias

- La clase PRODUCT tiene una F1 notablemente baja (0,538), porque los nombres de juegos suelen ser frases de varias palabras y el modelo clasifica solo la palabra individual.
- El modelo no distingue entre el proveedor de juegos y la marca del casino: consultas como «habanero casino» se clasifican como marca, cuando en realidad el proveedor es una entidad distinta. Esta distincion se delega en un diccionario externo.
- No conoce el mercado ni el contexto de negocio: su respuesta es solo una opinion textual y debe combinarse con otras fuentes como sugerencias de Google o catalogos curados.
- Las etiquetas de entrenamiento no fueron validadas por humanos de forma exhaustiva; el autor detecto etiquetas contaminadas y las corregio, pero el origen de los datos puede introducir sesgos residuales.
- La metrica de accuracy es enganosa en este dominio porque el desbalance de clases es alto (el 80% de las palabras son del tipo WORD). Se recomienda usar la F1 por clase.
- En el conjunto de casos dificiles la mejora frente al baseline es marginal (+0,019 en macro F1), lo que limita su utilidad en las fronteras de la tarea.
- El modelo solo funciona correctamente con el formato de entrada especificado (palabra + consultas). Si se introduce la palabra aislada, el modelo adivina y comete errores.
- No se ha evaluado fuera del sector del juego; su uso en otros nichos requiere una validacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Krasovskiy/anchor-words
- Modelo relacionado `anchor-pairs`: https://huggingface.co/Krasovskiy/anchor-pairs
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
