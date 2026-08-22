# 3tic/Orion-NER-30M-v1

## Resumen

Orion-NER-30M-v1 es un modelo de reconocimiento de entidades nombradas (NER) desarrollado por el equipo 3tic, especializado en textos de novelas ligeras japonesas (light novels). Se basa en el modelo `sbintuitions/modernbert-ja-30m`, un BERT moderno preentrenado para japonés, y se ha ajustado específicamente para identificar personajes, lugares, organizaciones y objetos en este tipo de narrativa. Su principal objetivo es servir como componente de extracción de entidades dentro de OrionTranslator, una herramienta de traducción automática de novelas ligeras japonés-chino escrita en Rust.

El modelo es extremadamente ligero, con aproximadamente 36,8 millones de parámetros, lo que lo hace adecuado para entornos con recursos limitados, como CPU o GPUs de gama baja. Su licencia MIT permite uso comercial sin restricciones. Aunque su enfoque es muy específico, su tamaño reducido y su especialización en nombres de personajes (incluyendo katakana, kanji, mezclas, honoríficos y apodos) lo convierten en una opción práctica para pipelines de procesamiento de texto japonés en el dominio de la ficción.

La relevancia actual de este modelo radica en la creciente demanda de herramientas de traducción asistida y anotación automática para contenido literario japonés, donde los nombres propios y las variaciones de escritura suponen un reto para los sistemas NER genéricos. Al estar diseñado para este nicho, ofrece una alternativa ligera y enfocada frente a modelos multilingües de mayor tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (BERT con mejoras de eficiencia) |
| Parametros totales | 36.775.697 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (el modelo base soporta 4096 tokens, pero no se especifica en la ficha) |
| Tipos de cuantizacion | no disponible (solo se distribuye en safetensors de precision completa) |
| Idiomas soportados | japones |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre `sbintuitions/modernbert-ja-30m`, una variante de ModernBERT preentrenada exclusivamente en japones. ModernBERT introduce mejoras sobre el BERT clasico, como atencion con ventana deslizante y una mayor eficiencia en el procesamiento de secuencias largas, aunque en este caso no se han publicado detalles sobre la longitud de contexto utilizada durante el ajuste.

El entrenamiento de Orion-NER-30M-v1 consiste en un fine-tuning supervisado para la tarea de token-classification (NER) sobre un dataset propio llamado `Orion-NER-traindata-v1`, que contiene entre 10.000 y 100.000 muestras en japones, etiquetadas con cuatro tipos de entidades: `PERSON`, `LOCATION`, `ORGANIZATION` y `MISC` (objetos). No se ha publicado informacion sobre el numero exacto de epocas, la funcion de perdida o si se aplicaron tecnicas como data augmentation. Tampoco se menciona el uso de RLHF o DPO, ya que se trata de un modelo discriminativo de clasificacion por token.

La innovacion principal no reside en la arquitectura, sino en la especializacion del dominio: el modelo esta calibrado para reconocer nombres de personajes en novelas ligeras, incluyendo formas complejas como katakana, kanji, mezclas de ambos, sufijos honorificos (p. ej., -san, -kun) y apodos. Esto lo diferencia de los NER genericos en japones, que suelen fallar con estas variaciones.

## Capacidades

- Reconocimiento de entidades nombradas en texto japones, con cuatro categorias: `PERSON`, `LOCATION`, `ORGANIZATION` y `MISC` (objetos).
- Especializacion en nombres de personajes de novelas ligeras, incluyendo escritura en katakana, kanji, hiragana, combinaciones y variaciones con honorificos o apodos.
- Procesamiento de texto a nivel de token, devolviendo etiquetas BIO (Begin, Inside, Outside) para cada token de entrada.
- Funcionamiento en modo inferencia rapida gracias a su tamano reducido (36,8 M de parametros), apto para CPU y entornos con poca memoria.
- Integracion disenada para pipelines de traduccion automatica, como el proyecto OrionTranslator, donde actua como modulo de extraccion de personajes.
- No incluye capacidades de generacion de texto, tool calling, agentes, vision ni audio. Es exclusivamente un modelo de clasificacion de tokens.

## Casos de uso

- Extraccion de personajes para traduccion de novelas ligeras: el modelo identifica todos los nombres de personajes en un capitulo, permitiendo a un sistema de traduccion mantener consistencia en la transliteracion de nombres a lo largo de la obra.
- Anotacion automatica de corpus literarios: util para investigadores que necesitan etiquetar grandes volumenes de texto japones de ficcion con entidades nombradas, sin intervencion manual.
- Preprocesamiento para sistemas de traduccion neuronal: antes de pasar el texto a un LLM, se pueden marcar las entidades para que el traductor las respete y no las traduzca de forma inconsistente.
- Generacion de glosarios y listas de personajes: a partir de un texto completo, el modelo puede extraer todos los nombres unicos, facilitando la creacion de diccionarios de terminos para traductores humanos o automaticos.
- Filtrado y clasificacion de contenido en bibliotecas digitales: permite indexar novelas ligeras por personajes o lugares mencionados, mejorando la busqueda y recomendacion en plataformas de lectura.
- Asistencia a traductores profesionales: como herramienta de apoyo, el modelo puede resaltar nombres propios en un documento, reduciendo errores de omision o traduccion incorrecta en nombres de personajes secundarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de evaluacion comparativa con otros modelos NER japoneses, ni metricas como F1, precision o recall sobre conjuntos de prueba estandar (p. ej., CoNLL, JDocs). El autor solo indica que la "precision es suficiente" para su caso de uso, sin aportar cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 36,8 M de parametros, en precision FP32 ocupa aproximadamente 147 MB de memoria, y en FP16 unos 74 MB. Esto permite ejecutarlo en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU con 2-4 GB de RAM.
- GPU recomendadas: cualquier GPU moderna, desde una NVIDIA GTX 1050 hasta una RTX 4090. No requiere hardware especializado.
- Compatibilidad con consumer GPU: si, cabe en todas las GPUs de consumo actuales y en muchas tarjetas integradas.
- Opciones de despliegue: al ser un modelo de Hugging Face con safetensors, se puede cargar con la libreria `transformers` de Python, o exportar a ONNX para inferencia en Rust (como hace OrionTranslator) o en otros runtimes. Tambien es posible usar `optimum` para cuantizacion dinamica si se desea reducir aun mas el uso de memoria.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamano, se espera una latencia de milisegundos por frase en GPU y de decenas de milisegundos en CPU, con capacidad para procesar cientos de frases por segundo en hardware moderno.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo con otros modelos NER japoneses. A continuacion se presenta una comparacion estructural con alternativas comunes, basada en informacion publica general (no en benchmarks del propio modelo):

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Orion-NER-30M-v1 | 36,8 M | no disponible | ja | MIT | NER especializado en novelas ligeras |
| cl-tohoku/bert-base-japanese-ner | 110 M | 512 | ja | CC BY-SA 4.0 | NER generico en japones |
| stockmark/ner-bert | 110 M | 512 | ja | Apache 2.0 | NER generico en japones |
| sbintuitions/modernbert-ja-30m (base) | 30 M | 4096 | ja | MIT | Modelo base sin fine-tuning para NER |

La principal diferencia de Orion-NER-30M-v1 es su tamano reducido y su especializacion en un dominio concreto, lo que puede ofrecer mejor precision en nombres de personajes de ficcion que los modelos genericos, a costa de una menor generalizacion a otros tipos de texto.

## Limitaciones y advertencias

- Entrenado exclusivamente en japones y en el dominio de novelas ligeras; su rendimiento en otros generos (noticias, textos cientificos, conversaciones) puede ser significativamente inferior.
- No se han publicado metricas de evaluacion, por lo que no es posible verificar su precision real ni compararla objetivamente con otros modelos.
- El conjunto de etiquetas es limitado (solo 4 categorias) y no cubre entidades como fechas, cantidades o eventos.
- Riesgo de alucinacion: como todo modelo NER, puede etiquetar incorrectamente tokens que no son entidades, especialmente en textos con vocabulario poco frecuente o nombres ambiguos.
- La longitud de contexto no esta documentada; aunque el modelo base soporta 4096 tokens, el ajuste fino podria haber reducido la ventana efectiva.
- No se proporcionan instrucciones de uso ni ejemplos de codigo en la model card, lo que puede dificultar su integracion para desarrolladores no familiarizados con la libreria `transformers`.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo se distribuye sin garantias y sin soporte oficial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/3tic/Orion-NER-30M-v1
- Coleccion Orion-NER: https://huggingface.co/collections/3tic/orion-ner
- Repositorio OrionTranslator (GitHub): https://github.com/3tic-project/OrionTranslator
- Dataset de entrenamiento Orion-NER-traindata-v1: https://huggingface.co/datasets/3tic/Orion-NER-traindata-v1
- Perfil del autor en Hugging Face: https://huggingface.co/3tic
