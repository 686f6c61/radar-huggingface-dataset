# amDANIEL2024/nkya_finetuned

## Resumen

`nkya_finetuned` es un modelo de traducción automática neuronal de tipo encoder-decoder Transformer con 241.897.472 parámetros (242M), desarrollado por el usuario amDANIEL2024. Resuelve la traducción directa entre cualquier par de seis lenguas: inglés (`eng`), luganda (`lug`), runyankole (`nyn`), acholi (`ach`), lugbara (`lgg`) y ateso (`teo`), lo que supone 30 direcciones de traducción con un único conjunto de pesos. La dirección se selecciona mediante un token de prefijo en el texto de origen (`<2eng>`, `<2lug>`, `<2nyn>`, `<2ach>`, `<2lgg>`, `<2teo>`).

El modelo parte de un preentrenamiento sobre el corpus `tulati` (traducciones automáticas generadas con Sunbird/translate-nllb-1.3b-salt) y se afina posteriormente sobre el split de entrenamiento de SALT, que contiene traducciones humanas. Es relevante porque cubre lenguas ugandesas de bajos recursos con un modelo compacto (242M parámetros, ~1 GB en float32), lo que permite desplegarlo en hardware modesto, y porque ofrece traducción directa entre lenguas africanas sin pasar por el inglés como pivote.

La arquitectura es un Transformer pre-LN encoder-decoder de 6+6 capas, `d_model` 1024, 16 cabezas y FFN de 4096, con embeddings de entrada, del decoder y proyección de salida atados. El contexto es de 256 posiciones y el tokenizador es un SentencePiece compartido de 64.000 piezas. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder pre-LN, 6 + 6 capas, d_model 1024, 16 cabezas, FFN 4096, GELU |
| Parametros totales | 241.897.472 (242M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 posiciones (embeddings sinusoidales); textos de entrenamiento limitados a 128 piezas |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | en (eng), lg/lug (luganda), nyn (runyankole), ach (acholi), lgg (lugbara), teo (ateso) |
| Licencia | MIT |
| Formato de pesos | `model.safetensors` (float32) |

## Arquitectura y entrenamiento

El modelo es un Transformer encoder-decoder estándar con normalización pre-LN, 6 capas en el encoder y 6 en el decoder, dimensión de modelo 1024, 16 cabezas de atención y FFN de 4096 con activación GELU. Los embeddings de entrada, los del decoder y la proyección de salida están atados, lo que reduce el recuento de parámetros. El tokenizador es un único modelo SentencePiece de 64.000 piezas entrenado con una proporción equitativa de texto de las seis lenguas, incluyendo el texto del split de entrenamiento de SALT.

El entrenamiento se realizó en dos fases. Primero, un preentrenamiento sobre el corpus `tulati` (1.534.699 filas iniciales, filtradas a 1.531.304 filas útiles tras eliminar lenguas marcadas por los flags de calidad, filas con menos de dos lenguas usables y duplicados exactos). Cada fila contiene la misma frase en todas las lenguas, con el inglés como texto fuente y el resto como traducciones automáticas de Sunbird/translate-nllb-1.3b-salt; por tanto, ningún lado no inglés del corpus es texto humano. El preentrenamiento se detuvo anticipadamente en el paso 15.133 (una época completa y parte de la siguiente) de las 8 épocas planificadas. Después, se afinó sobre el split de entrenamiento de SALT (traducciones humanas), usando todas las direcciones de cada fila, tasa de aprendizaje 4e-5 y parada temprana sobre la pérdida de validación de SALT dev (paciencia de 5 validaciones); el checkpoint final corresponde al paso 5735. Se aplicó descontaminación contra SALT dev/test (4 filas eliminadas) y se reservaron 1.500 filas para validación.

## Capacidades

- Traducción directa entre 30 pares de las seis lenguas soportadas, seleccionando la dirección con un token de prefijo en el origen.
- Traducción bidireccional entre inglés y cada una de las cinco lenguas ugandesas, y entre pares de lenguas ugandesas sin pivote por inglés.
- Procesamiento por lotes: la función `translate` acepta una cadena o una lista de cadenas.
- Decodificación por beam search configurable (beam 4 por defecto).
- Tokenizador multilingüe compartido que cubre las seis lenguas con 64.000 piezas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio: es un modelo puramente de traducción de texto.
- No es compatible con `transformers` (`AutoModel` no lo carga); requiere el módulo Python propio `nkya` incluido en el repositorio.

## Casos de uso

- Traducción de documentación y materiales públicos al luganda, runyankole, acholi, lugbara o ateso: el modelo traduce directamente desde inglés con chrF++ entre 40,7 y 53,0 según la lengua destino, adecuado para borradores que luego revisa un hablante nativo.
- Comunicación entre comunidades lingüísticas ugandesas: permite traducir, por ejemplo, de runyankole a lugbara o de acholi a ateso sin pasar por el inglés, con chrF++ en torno a 35-45 en los pares mejor soportados.
- Localización de interfaces y textos cortos: con contexto de 256 posiciones y entrenamiento sobre textos de hasta 128 piezas, encaja en cadenas de UI, mensajes y párrafos breves.
- Subtitulado y transcripción de contenido audiovisual de bajos recursos: al ser un modelo de 242M y ~1 GB en float32, puede ejecutarse en una GPU de consumo para procesar lotes de frases cortas.
- Investigación en traducción de lenguas de bajos recursos: sirve como línea base reproducible (licencia MIT, pesos abiertos) para comparar con modelos mayores como NLLB o con el propio Sunbird/translate-nllb-1.3b-salt.
- Preservación lingüística y digitalización de textos: traducción asistida de material educativo o cultural hacia y desde estas lenguas, con revisión humana obligatoria por las limitaciones del corpus de entrenamiento.
- Despliegue en entornos con recursos limitados: el tamaño reducido permite servir el modelo en CPU o en GPU modesta para volúmenes moderados de traducción por lotes.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test completo de SALT (media macro sobre 30 direcciones; la línea base "copy" devuelve la frase de origen sin cambios):

| Conjunto | Direcciones | BLEU | chrF | chrF++ | chrF++ linea base copy |
|---|---|---|---|---|---|
| SALT test | 30 | 15,90 | 45,31 | 42,36 | 12,45 |
| SALT dev | 30 | 16,34 | 46,10 | 43,15 | 12,37 |

chrF++ por dirección en SALT test (fuente \ destino):

| fuente \ destino | eng | lug | nyn | ach | lgg | teo |
|---|---|---|---|---|---|---|
| eng | – | 53,0 | 46,5 | 40,7 | 45,5 | 50,8 |
| lug | 51,0 | – | 42,5 | 37,6 | 40,4 | 46,0 |
| nyn | 47,1 | 45,2 | – | 35,6 | 38,3 | 42,1 |
| ach | 42,9 | 40,7 | 37,0 | – | 38,8 | 42,0 |
| lgg | 46,7 | 42,7 | 37,7 | 35,5 | – | 42,9 |
| teo | 46,1 | 43,4 | 38,4 | 35,4 | 38,3 | – |

BLEU por dirección en SALT test (fuente \ destino):

| fuente \ destino | eng | lug | nyn | ach | lgg | teo |
|---|---|---|---|---|---|---|
| eng | – | 23,5 | 14,4 | 16,3 | 17,9 | 20,9 |
| lug | 29,7 | – | 11,8 | 14,1 | 13,9 | 16,9 |
| nyn | 25,7 | 17,0 | – | 13,0 | 12,0 | 14,0 |
| ach | 20,4 | 12,9 | 8,0 | – | 12,8 | 14,4 |
| lgg | 25,2 | 14,1 | 8,6 | 11,9 | – | 14,2 |
| teo | 24,5 | 14,1 | 9,7 | 12,5 | 12,8 | – |

chrF++ por dirección en SALT dev (fuente \ destino):

| fuente \ destino | eng | lug | nyn | ach | lgg | teo |
|---|---|---|---|---|---|---|
| eng | – | 54,7 | 47,3 | 42,5 | 46,5 | 51,0 |
| lug | 51,1 | – | 43,9 | 38,9 | 41,2 | 46,4 |
| nyn | 46,1 | 45,6 | – | 36,9 | 39,3 | 43,0 |
| ach | 43,7 | 42,1 | 38,5 | – | 38,4 | 42,9 |
| lgg | 46,7 | 41,9 | 38,4 | 36,0 | – | 43,0 |
| teo | 47,3 | 43,5 | 40,8 | 37,0 | 40,2 | – |

BLEU por dirección en SALT dev (fuente \ destino):

| fuente \ destino | eng | lug | nyn | ach | lgg | teo |
|---|---|---|---|---|---|---|
| eng | – | 25,1 | 13,4 | 17,8 | 19,5 | 20,4 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a este modelo de traducción.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1 GB en float32 (242M parámetros); con cuantización a float16 o int8 el requisito bajaría a ~0,5-0,25 GB, aunque la model card no publica variantes cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo usa la GPU si está disponible (`Translator(folder)` detecta CUDA).
- Cabe en GPU de consumo: sí, en tarjetas como GTX 1650, RTX 3050, RTX 4060 o superiores; también puede ejecutarse en CPU para volúmenes moderados.
- Opciones de despliegue: no es compatible con vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo `transformers` ni GGUF; requiere el módulo Python propio `nkya` incluido en el repositorio, con dependencias `torch`, `sentencepiece`, `safetensors` y `huggingface_hub`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| nkya_finetuned | 242M | 256 | 6 (en, lug, nyn, ach, lgg, teo) | MIT | safetensors (float32) |
| Sunbird/translate-nllb-1.3b-salt | 1.300M (aprox., NLLB-1.3B) | no disponible | no disponible (orientado a lenguas ugandesas) | no disponible | no disponible |
| NLLB-200 (familia) | 600M-54.500M según variante | no disponible | 200 | no disponible | no disponible |

El modelo de referencia más directo es Sunbird/translate-nllb-1.3b-salt, usado para generar el corpus de preentrenamiento; no se dispone en la información proporcionada de sus métricas en SALT para una comparación cuantitativa directa. Frente a la familia NLLB-200, `nkya_finetuned` es mucho más pequeño (242M frente a 600M en la variante mínima) y cubre un conjunto reducido de lenguas, lo que limita su uso general pero reduce los requisitos de hardware.

## Limitaciones y advertencias

- El corpus de preentrenamiento (`tulati`) contiene traducciones automáticas generadas por Sunbird/translate-nllb-1.3b-salt; la model card no informa de la calidad de ese traductor para estas lenguas, por lo que los errores del sistema automático pueden haberse propagado al modelo.
- El preentrenamiento se detuvo anticipadamente en el paso 15.133 de las 8 épocas planificadas; más preentrenamiento podría cambiar los resultados.
- El contexto es de solo 256 posiciones y los textos de entrenamiento se limitaron a 128 piezas, lo que restringe la traducción de documentos largos o frases muy extensas.
- El rendimiento es desigual por dirección: BLEU en SALT test va de 8,0 (nyn→ach) a 29,7 (lug→eng); las direcciones entre lenguas ugandesas son notablemente más débiles que las que implican el inglés.
- La media macro de BLEU (15,90) y chrF++ (42,36) es modesta; la línea base "copy" obtiene chrF++ 12,45, por lo que la mejora existe pero es limitada en varias direcciones.
- Riesgo de alucinación y de traducciones literales o degeneradas en frases fuera del dominio de SALT.
- No se han publicado análisis de sesgos en la información disponible.
- El modelo no es compatible con `transformers`; la integración en pipelines estándar requiere código personalizado del repositorio.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones de los datos de entrenamiento (SALT y tulati) antes de un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amDANIEL2024/nkya_finetuned
- Modelo base de preentrenamiento: https://huggingface.co/amDANIEL2024/nkya_base
- Dataset tulati: https://huggingface.co/datasets/amDANIEL2024/tulati
- Traductor usado para generar tulati: https://huggingface.co/Sunbird/translate-nllb-1.3b-salt
