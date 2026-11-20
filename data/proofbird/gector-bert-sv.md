# proofbird/gector-bert-sv

## Resumen

`gector-bert-sv` es un modelo de corrección gramatical del sueco desarrollado por Proofbird, el equipo detrás de la aplicación de escritura Proofbird para Windows. Se trata de un etiquetador de secuencias de estilo GECToR construido sobre el encoder KB-BERT (`KBLab/bert-base-swedish-cased`, de la Biblioteca Nacional de Suecia) y exportado a ONNX en fp32 para ejecutarse en CPU, sin necesidad de GPU ni de conexión de red. Su propósito es la corrección local de errores gramaticales en sueco: concordancia de género y número en adjetivos, uso de `en`/`ett`, `de`/`dem`, tiempos verbales, compuestos escritos separados y diacríticos ausentes.

La relevancia del modelo es doble. Por un lado, demuestra un caso de despliegue "on-device" real de un corrector gramatical: el texto del usuario nunca sale de su máquina, lo que resulta atractivo para herramientas de escritura con requisitos de privacidad. Por otro, su enfoque de entrenamiento es deliberadamente sintético: no emplea corpus de aprendices ni datos no comerciales, sino corrupciones generadas mediante reglas escritas a mano sobre texto sueco real (Wikipedia, Europarl y Tatoeba).

El modelo no reescribe ni parafrasea: para cada token predice una etiqueta de edición (mantener, borrar, reemplazar, añadir, cambiar mayúsculas, cambiar terminación, restaurar diacríticos), aplica las ediciones y vuelve a etiquetar la frase hasta cinco veces. El resultado es una lista de sugerencias con posición de carácter, texto original y reemplazo, apta para subrayar y ofrecer la corrección en una interfaz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base sueco) con cabeza de etiquetado GECToR y cabeza de detección de errores |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Exportación en fp32 (ONNX); no se documentan otras cuantizaciones |
| Idiomas soportados | Sueco (sv) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (fp32) |
| Modelo base | KBLab/bert-base-swedish-cased (CC0-1.0) |
| Etiquetas de edición | 8 000 |
| Pipeline | token-classification |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

El modelo sigue el esquema GECToR: un encoder BERT base en sueco con cased (`KBLab/bert-base-swedish-cased`) sobre el que se montan dos cabezas, una de etiquetado con 8 000 etiquetas de edición y otra de detección de errores. La decodificación es iterativa: se predicen las ediciones token a token, se aplican, se vuelve a etiquetar la frase resultante y se repite hasta cinco veces. Al ser un corrector de ediciones locales, no genera texto nuevo ni parafrasea, lo que limita el riesgo de deriva semántica pero también acota el alcance de las correcciones a las categorías aprendidas.

El entrenamiento es exclusivamente sintético, con 3 036 306 frases de tres fuentes: 1 500 000 de Wikipedia en sueco (`wikimedia/wikipedia`, `20231101.sv`, excluyendo artículos esbozo generados automáticamente), 1 500 000 de los procedimientos del Parlamento Europeo (Europarl v8 vía OPUS, sesiones anteriores a junio de 2011) y 36 306 de Tatoeba. Las corrupciones se generaron con reglas de error escritas a mano, en su mayoría una por frase, dejando aproximadamente un 10 % de frases limpias para que el modelo aprenda a no tocar texto correcto. Cada regla se validó primero sobre texto real para descartar "errores" que también son sueco correcto. Se añadieron frases reales con patrones necesarios (sujeto plural con adjetivo, `dem` tras preposición, compuestos) y 150 000 frases de plantilla; una de cada siete frases de entrenamiento carece de punto final. No se usaron corpus de aprendices ni texto de usuarios. El entrenamiento fue de una época (122 507 pasos, batch 64, learning rate 3e-5) en una NVIDIA L4, con identificador de ejecución `2026-11-20-0657`; los pesos publicados corresponden al checkpoint del paso 120 000.

## Capacidades

- Corrección de concordancia de género y número en adjetivos: `ett stor hus` → `stort`, `den stor bilen` → `stora`, `Bilen är nytt` → `ny`, `Barnen var lugn` → `lugna`.
- Distinción `en`/`ett`: `en hus` → `ett hus`, `ett bil` → `en bil`.
- Distinción `de`/`dem`: `Jag gav boken till de` → `dem`, `Dem kommer i morgon` → `De`.
- Tiempos verbales: presente frente a infinitivo (`Jag spela fotboll` → `spelar`, `Jag vill spelar` → `spela`, `att läser` → `läsa`).
- Compuestos escritos separados: `hus ägare` → `husägare`, `skatte sänkning` → `skattesänkning`.
- Restauración de diacríticos ausentes: `å`, `ä`, `ö` (`Vi ska aka buss` → `åka`, `fran` → `från`).
- Eliminación de palabras duplicadas y mayúscula al inicio de frase.
- Tratamiento de frases sin punto final igual que con él.
- Salida estructurada de sugerencias con posición de carácter (`start`, `length`), texto original y reemplazo.
- Ejecución en CPU mediante ONNX Runtime, sin GPU ni clave de API.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento; es un etiquetador de secuencias especializado.

## Casos de uso

- Corrección gramatical en un procesador de textos de escritorio: el modelo se integra en la aplicación Proofbird para Windows y subraya errores de concordancia y diacríticos en tiempo real sin enviar el texto a un servidor, gracias a su ejecución local en CPU con ONNX Runtime.
- Asistente de escritura para estudiantes de sueco: las sugerencias con posición de carácter permiten mostrar la corrección inline y explicar el cambio (`lugn` → `lugna`), útil en herramientas de aprendizaje de lenguas.
- Preprocesado de corpus suecos: antes de indexar o analizar texto de Wikipedia, foros o transcripciones, el modelo normaliza concordancia y diacríticos con un coste de CPU bajo y sin dependencias de red.
- Revisión de textos administrativos o periodísticos: corrige errores frecuentes de `de`/`dem`, compuestos separados y concordancia de adjetivos en documentos redactados por no nativos.
- Extensión de navegador o editor web: el modelo puede ejecutarse en el propio navegador (la demo oficial corre en el cliente) para revisar formularios, correos o publicaciones antes de enviarlos, manteniendo el texto en la página.
- Pipeline de control de calidad en publicaciones: integrado como paso previo a la revisión humana, marca automáticamente las frases con errores detectados por la cabeza de detección y reduce el tiempo de corrección manual.
- Filtrado de texto para entrenamiento de otros modelos: al ser un corrector de ediciones locales y conservador (deja intactas las frases correctas), puede usarse para limpiar texto sueco sin reescribirlo ni introducir paráfrasis.

## Benchmarks y rendimiento

| Comprobacion | Resultado |
|---|---|
| Conjunto gold (180 frases escritas a mano: 110 con un error, 70 correctas) | 110 corregidas, 70 intactas, 0 no detectadas, 0 empeoradas |
| Correcciones erróneas sobre 4 000 frases cotidianas de Tatoeba (reservadas del entrenamiento) | 3 (0,075 %); 7 frases modificadas |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible; el modelo es un etiquetador de secuencias y no un modelo generativo, por lo que esas métricas no aplican.

## Requisitos de hardware

- Inferencia en CPU: el modelo se distribuye en ONNX fp32 y está diseñado para ejecutarse con ONNX Runtime sin GPU; el repositorio ocupa 0,5 GB.
- VRAM estimada: no aplica para el despliegue previsto (CPU); no se documenta una estimación de VRAM para GPU.
- GPU recomendadas: no disponibles; el autor entrena en una NVIDIA L4, pero la inferencia publicada es en CPU.
- Cabe en cualquier ordenador de consumo: el requisito es CPU y memoria RAM suficiente para cargar el modelo ONNX (del orden de 0,5 GB de pesos), no una GPU.
- Opciones de despliegue: ONNX Runtime (vía `quickstart.py` con `onnxruntime`, `tokenizers` y `huggingface_hub`), línea de comandos (`python quickstart.py "frase"`) y la demo en el navegador del espacio de Hugging Face. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|---|
| proofbird/gector-bert-sv | GECToR sobre BERT base sueco, ONNX | Sueco | no disponible | no disponible | Apache 2.0 | ONNX fp32 |
| KBLab/bert-base-swedish-cased | BERT base sueco (encoder base) | Sueco | no disponible | no disponible | CC0-1.0 | safetensors |
| Correctores GECToR multilingües (p. ej. variantes sobre XLM-R) | GECToR sobre encoder multilingüe | Varios | no disponible | no disponible | variable | variable |

No se dispone de datos de rendimiento comparables publicados en la información proporcionada para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Solo cubre sueco; no procesa otros idiomas y su vocabulario y reglas están ligados a ese idioma.
- El entrenamiento es exclusivamente sintético con reglas escritas a mano: los errores que no encajan en las categorías cubiertas (concordancia, `en`/`ett`, `de`/`dem`, tiempos verbales, compuestos, diacríticos, duplicados, mayúscula inicial) no se corrigen.
- No reescribe ni parafrasea: no corrige estilo, registro, puntuación compleja ni errores de estructura oracional.
- Riesgo de falsos positivos: aunque en el conjunto de prueba solo se modificaron 7 de 4 000 frases de Tatoeba (3 correcciones erróneas, 0,075 %), existe la posibilidad de alterar texto correcto, especialmente en registros alejados de los datos de entrenamiento.
- Sesgos derivados de las fuentes: Wikipedia (registro enciclopédico), Europarl (discurso parlamentario anterior a 2011) y Tatoeba (frases cotidianas) determinan la distribución; el sueco muy coloquial, dialectal o técnico puede estar infrarrepresentado.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base KB-BERT es CC0-1.0 y el autor declara que no se usaron corpus de aprendices ni datos no comerciales en el ajuste fino.
- La versión publicada corresponde al checkpoint del paso 120 000 de una ejecución concreta (`2026-11-20-0657`); el autor recomienda fijar `revision="v1.0.0"` para reproducibilidad.
- No hay datos publicados sobre longitud máxima de contexto, latencia ni throughput, lo que dificulta dimensionar despliegues de alto volumen.
- El modelo se distribuye únicamente en ONNX fp32; no se documentan cuantizaciones alternativas para reducir memoria o acelerar la inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/proofbird/gector-bert-sv
- Demo en el navegador: https://huggingface.co/spaces/proofbird/try-grammar
- Quickstart en Colab: https://colab.research.google.com/#fileId=https%3A//huggingface.co/proofbird/gector-bert-sv/blob/main/quickstart.ipynb
- Modelo base KB-BERT: https://huggingface.co/KBLab/bert-base-swedish-cased
- Dataset de Wikipedia en sueco: https://huggingface.co/datasets/wikimedia/wikipedia
- Tatoeba: https://tatoeba.org
- Aplicación Proofbird: https://proofbird.app
- Paper de GECToR (arXiv:2007.01658): https://arxiv.org/abs/2007.01658
