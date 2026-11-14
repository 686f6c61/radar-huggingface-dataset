# olaverse/lid-lite-608

## Resumen

lid-lite-608 es un clasificador de identificacion de idioma (language ID, LID) desarrollado por olaverse, un proyecto centrado en procesamiento de lenguas africanas. Se trata de un modelo fastText supervisado que cubre 608 lenguas etiquetadas con codigos ISO 639-3 e ISO 15924 (por ejemplo, `yor_Latn` o `srp_Cyrl`), ademas de una clase de ruido `zxx_Zxxx` para numeros, URLs y codigo fuente. Su propuesta de valor es la eficiencia extrema: 37 MB de pesos cuantizados, inferencia solo en CPU y aproximadamente 6.800 textos por segundo en un unico hilo.

El modelo aborda un problema clasico de los pipelines multilingues: la identificacion fiable de idioma en textos cortos y ruidosos, especialmente en lenguas de bajos recursos. Frente a alternativas como el LID de Meta (218 lenguas) o GlotLID, lid-lite-608 triplica la cobertura de lenguas con una fraccion del tamano, y declara mejoras notables en precision sobre entradas de 1 a 5 palabras y en promedio F1 sobre 20 lenguas africanas principales.

Es relevante ahora porque combina cobertura amplia, licencia Apache-2.0 y entrenamiento exclusivo con fuentes que permiten uso comercial, lo que lo hace directamente desplegable en produccion sin las restricciones de licencia habituales en modelos LID de mayor tamano. Incluye ademas dos modos de calibracion (cobertura y trafico) para adaptarse a distintos escenarios de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | fastText supervisado (n-gramas de caracteres 1-5 + bigramas de palabras, `dim=128`, cuantizado) |
| Parametros totales | no disponible (modelo fastText, no se publica recuento de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador; acepta desde 1 palabra hasta documentos completos) |
| Tipos de cuantizacion | pesos cuantizados en formato `.ftz` (cuantizacion propia de fastText); no se detallan otros esquemas |
| Idiomas soportados | 608 lenguas (567 codigos ISO 639-3 distintos, 36 sistemas de escritura) mas clase de ruido `zxx_Zxxx` |
| Licencia | Apache-2.0 |
| Formato de pesos | `.ftz` (fastText cuantizado); tamano 37 MB |

## Arquitectura y entrenamiento

lid-lite-608 es un clasificador supervisado de fastText, no un transformer. Utiliza representaciones de n-gramas de caracteres de orden 1 a 5 combinadas con bigramas de palabras, con una dimension de embedding de 128, y los pesos se almacenan cuantizados en un fichero `.ftz` de 37 MB. Esta eleccion de arquitectura explica su velocidad (unos 6.800 textos por segundo en un solo hilo de CPU) y su reducida huella de memoria, a costa de no modelar dependencias de largo alcance como haria un modelo neuronal.

El entrenamiento se realizo sobre 7,86 millones de muestras procedentes exclusivamente de fuentes que permiten uso comercial, segun declara el autor. El conjunto incorpora ruido deliberado: erratas, diacriticos omitidos, URLs, emojis y frases conversacionales cotidianas, ademas de una clase especifica de ruido para numeros, URLs y codigo. El modelo ofrece dos modos de calibracion: modo cobertura, que trata todas las lenguas por igual para construccion de corpus y mineria de bajos recursos, y modo trafico, calibrado segun la frecuencia real de las lenguas para entradas de usuario y enrutamiento. No se detalla en la informacion disponible si se emplearon tecnicas de aumento de datos adicionales ni la composicion exacta por lengua del dataset.

## Capacidades

- Identificacion de idioma sobre 608 lenguas con etiquetas ISO 639-3 + ISO 15924 (por ejemplo, `yor_Latn`, `srp_Cyrl`).
- Clasificacion de entradas de cualquier longitud: desde una sola palabra hasta documentos completos.
- Deteccion de una clase de ruido dedicada (`zxx_Zxxx`) para numeros, URLs y codigo fuente, con F1 declarado de 0,961.
- Robustez ante texto desordenado: erratas, diacriticos ausentes, emojis, URLs y lenguaje conversacional.
- Dos modos operativos: cobertura (lenguas equiponderadas) y trafico (calibrado a frecuencia real de uso).
- Cobertura especial de lenguas africanas, con mejoras declaradas en kinyarwanda, xhosa, wolof y lingala.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni agentes; es exclusivamente un clasificador.

## Casos de uso

- Filtrado y construccion de corpus multilingues: en modo cobertura, el modelo permite etiquetar grandes volumenes de texto web o crawled por lengua con un throughput de miles de textos por segundo en CPU, lo que facilita la mineria de datos para lenguas de bajos recursos sin coste de GPU.
- Enrutamiento de peticiones en pipelines de NLP: en modo trafico, se puede usar como primera etapa para dirigir cada texto al modelo o servicio especializado en su lengua, con una precision web-weighted declarada de 0,954.
- Moderacion y analitica de contenido generado por usuarios: su robustez ante erratas, emojis y URLs lo hace adecuado para clasificar comentarios, tuits o mensajes de chat cortos, donde los LID tradicionales fallan.
- Preprocesamiento para traduccion automatica: detectar la lengua de origen antes de invocar un traductor permite seleccionar el par de idiomas correcto y descartar entradas que no son texto natural.
- Deteccion de codigo y ruido en ingesta de datos: la clase `zxx_Zxxx` permite separar numeros, URLs y fragmentos de codigo del texto linguistico antes de indexar o entrenar otros modelos.
- Cumplimiento y localizacion de producto: identificar la lengua de tickets de soporte o resenas para enrutarlos a equipos regionales y generar estadisticas de uso por idioma.
- Investigacion en linguistica de corpus: su cobertura de 567 codigos ISO 639-3 y 36 escrituras permite anotar colecciones multilingues amplias con un unico modelo ligero y de licencia permisiva.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card:

| Metrica | lid-lite-608 | GlotLID | fastText LID de Meta |
|---|---|---|---|
| Precision en entradas de 1-5 palabras (608 lenguas) | 0,672 | 0,486 | 0,218 |
| F1 medio en 20 lenguas africanas principales | 0,839 | 0,757 | no disponible |
| Precision web-weighted (modo trafico) | 0,954 | no disponible | no disponible |
| F1 clase de ruido | 0,961 | no disponible | no disponible |
| Lenguas cubiertas | 608 | no disponible en la informacion | 218 |
| Tamano del modelo | 37 MB | ~45x mayor segun el autor | ~32x mayor segun el autor |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, que no aplican a un clasificador de este tipo.

## Requisitos de hardware

- VRAM estimada: 0 GB; el modelo esta disenado para inferencia solo en CPU.
- GPU recomendadas: no necesarias; cualquier GPU es superfluas para este modelo.
- Cabe en cualquier consumer: el fichero `.ftz` ocupa 37 MB y el repositorio completo 0,1 GB.
- Opciones de despliegue: libreria `fasttext` de Python (con `huggingface_hub` para descarga), o la API de Olaverse (`POST /v1/language-id`) sin GPU.
- Rendimiento declarado: aproximadamente 6.800 textos por segundo en un unico hilo de CPU.
- Memoria RAM: no disponible de forma explicita, pero el tamano del modelo sugiere un consumo muy bajo.

## Comparativa con modelos similares

| Modelo | Tipo | Lenguas | Tamano | Precision texto corto (1-5 palabras) | Licencia |
|---|---|---|---|---|---|
| lid-lite-608 | fastText supervisado | 608 | 37 MB | 0,672 | Apache-2.0 |
| GlotLID | fastText (según comparativa del autor) | no disponible en la informacion | ~45x lid-lite-608 segun el autor | 0,486 | no disponible en la informacion |
| fastText LID de Meta | fastText supervisado | 218 | ~32x lid-lite-608 segun el autor | 0,218 | no disponible en la informacion |
| lid-neural-608 | mmBERT (hermano del mismo autor) | 608 | no disponible | no disponible (declarado superior en texto corto y conversacional) | no disponible en la informacion |

## Limitaciones y advertencias

- Al ser un clasificador fastText, no modela contexto largo ni dependencias semanticas; textos muy ambiguos o de una sola palabra pueden confundirse entre lenguas cercanas.
- Las cifras de rendimiento proceden de la model card del autor y no se han verificado de forma independiente en la informacion disponible.
- La calibracion en modo trafico favorece las lenguas frecuentes; para mineria de lenguas de bajos recursos debe usarse el modo cobertura para evitar sesgo hacia idiomas mayoritarios.
- Riesgo de confusion en lenguas con alfabetos compartidos y en textos transliterados o con mezcla de idiomas (code-switching); no se documenta soporte especifico para este ultimo caso.
- La cobertura de 608 lenguas no garantiza calidad uniforme: el propio autor destaca mejoras en un subconjunto de lenguas africanas, lo que sugiere variabilidad entre idiomas.
- Aunque la licencia es Apache-2.0 y el autor declara entrenamiento solo con fuentes de uso comercial, la procedencia exacta del dataset no se detalla, lo que limita la auditabilidad.
- No apto para tareas generativas, razonamiento, codigo, vision ni agentes; su uso esta restringido a clasificacion de idioma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/olaverse/lid-lite-608
- Modelo hermano neural: https://huggingface.co/olaverse/lid-neural-608
- Consola de desarrollador de Olaverse: https://console.olaverselab.com
- Documentacion de la API de language ID: https://docs.olaverselab.com/api/language-id/
- Banner del modelo: https://cdn-uploads.huggingface.co/production/uploads/69949cbacd82af728f850c12/YOzNRwvGO_ZlTx-fpVJyl.png
