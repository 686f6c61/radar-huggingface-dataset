# amDANIEL2024/kieran_finetuned

## Resumen

`kieran_finetuned` es un modelo de traducción automática neuronal especializado en el par de lenguas luganda (lg) y runyankole (nyn), dos idiomas bantúes hablados en Uganda. Lo desarrolla el usuario amDANIEL2024 y se distribuye con licencia MIT. Se trata de un transformer encoder-decoder de 89 millones de parámetros que traduce de forma directa en ambos sentidos sin pasar por el inglés, lo que evita la pérdida de matices que introduce una lengua pivote.

El modelo parte de `kieran_base`, preentrenado sobre pares generados por traducción automática (dataset `tulati`), y se afina sobre los pares de traducción humana del conjunto de entrenamiento SALT. La dirección de traducción se controla mediante un token de prefijo en la entrada (`<2nyn>` o `<2lug>`), lo que permite cubrir las dos direcciones con un único conjunto de pesos.

Su relevancia radica en cubrir un par lingüístico de bajos recursos con un modelo compacto (89M de parámetros, 0,4 GB de repositorio) que puede ejecutarse en hardware modesto. No es un modelo de `transformers`: requiere código propio (`kieran.py`) y no se carga con `AutoModel`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder pre-LN, 6 + 6 capas, d_model 640, 8 cabezas, FFN 2560, activación GELU |
| Parametros totales | 89.418.240 (89M); embeddings de entrada, del decoder y proyección de salida atados |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 posiciones (codificación sinusoidal); pares de entrenamiento limitados a 128 piezas por lado |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | luganda (lg) y runyankole (nyn) |
| Licencia | MIT |
| Formato de pesos | `model.safetensors` (float32) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder estándar de tipo pre-LN con 6 capas en el encoder y 6 en el decoder, dimensión de modelo 640, 8 cabezas de atención y FFN de 2560 con activación GELU. Los embeddings de entrada, del decoder y la proyección de salida están atados, lo que reduce el recuento de parámetros. La tokenización usa un SentencePiece unigram compartido de 32.000 piezas, con mayúsculas preservadas y dígitos separados, entrenado únicamente con texto en luganda y runyankole. La posición se codifica con senos y cosenos hasta 256 posiciones.

El entrenamiento se realizó en dos fases. Primero, `kieran_base` se preentrenó durante 5 épocas y 19.305 pasos de optimizador sobre los pares luganda-runyankole del dataset `tulati`, en ambas direcciones; en ese dataset todas las columnas no inglesas son traducciones automáticas de una columna en inglés. Después, `kieran_finetuned` se afinó sobre los pares de traducción humana del conjunto de entrenamiento SALT. El conjunto de desarrollo SALT se usó para parada temprana y selección de checkpoint. La dirección se indica con un token de prefijo en la fuente (`<2nyn>` o `<2lug>`) que nombra el idioma destino. La información disponible no detalla el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Traducción directa luganda → runyankole y runyankole → luganda, sin inglés como pivote.
- Control de dirección mediante token de prefijo en la oración de entrada.
- Traducción por lotes: la función `translate` acepta una cadena o una lista de cadenas.
- Decodificación por búsqueda de haz configurable (beam por defecto 4).
- Tokenizador compartido para ambas lenguas, con preservación de mayúsculas y separación de dígitos.
- No soporta tool calling ni function calling.
- No dispone de modo de razonamiento (thinking mode), visión ni audio.
- No es un modelo de `transformers`: requiere el código propio del repositorio para cargarse.

## Casos de uso

- Traducción de documentación administrativa entre luganda y runyankole: el modelo traduce directamente sin pivote inglés, lo que reduce la pérdida de terminología local en textos institucionales ugandeses.
- Localización de contenidos sanitarios o educativos: con contexto de 256 posiciones y pares de hasta 128 piezas, es adecuado para frases y párrafos cortos de materiales divulgativos.
- Subtitulado y traducción de mensajes cortos en aplicaciones de comunicación: la inferencia sobre un modelo de 89M permite desplegarlo en servidores modestos con baja latencia.
- Preservación lingüística y creación de corpus paralelos: útil para generar borradores que revisores humanos corrijan, dado el BLEU moderado del modelo.
- Traducción por lotes en pipelines de datos: la API acepta listas de oraciones, lo que facilita procesar colecciones de textos de forma automatizada.
- Prototipado e investigación en traducción de bajos recursos: su tamaño compacto y licencia MIT permiten experimentar con fine-tuning adicional o comparativas de arquitecturas en lenguas bantúes.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test SALT completo (n = 500), beam 4, sacreBLEU 2.5.1. El test es la métrica principal; las puntuaciones de dev son ligeramente optimistas porque se usaron para parada temprana.

| Split | Direccion | Sistema | n | BLEU | chrF | chrF++ |
|---|---|---|---|---|---|---|
| test | lug→nyn | modelo | 500 | 14,05 | 50,47 | 45,45 |
| test | lug→nyn | baseline copia (fuente sin cambios) | 500 | 0,96 | 26,74 | 22,45 |
| test | nyn→lug | modelo | 500 | 19,51 | 52,77 | 48,97 |
| test | nyn→lug | baseline copia (fuente sin cambios) | 500 | 0,96 | 27,55 | 23,02 |
| dev | lug→nyn | modelo | 500 | 12,71 | 51,33 | 46,16 |
| dev | lug→nyn | baseline copia (fuente sin cambios) | 500 | 0,71 | 27,08 | 22,87 |
| dev | nyn→lug | modelo | 500 | 18,51 | 52,49 | 48,50 |
| dev | nyn→lug | baseline copia (fuente sin cambios) | 500 | 0,72 | 27,59 | 23,21 |

Firmas de las métricas: BLEU `nrefs:1|case:mixed|eff:no|tok:13a|smooth:exp|version:2.5.1`; chrF `nrefs:1|case:mixed|eff:yes|nc:6|nw:0|space:no|version:2.5.1`; chrF++ `nrefs:1|case:mixed|eff:yes|nc:6|nw:2|space:no|version:2.5.1`. No se ejecutó un baseline con pivote inglés. La model card advierte que diferencias de 1 a 2 BLEU sobre unos cientos de frases están dentro del ruido.

## Requisitos de hardware

- VRAM estimada para inferencia: con 89M de parámetros en float32, los pesos ocupan aproximadamente 0,36 GB; el uso total de memoria en GPU es de alrededor de 1 GB incluyendo activaciones y el tokenizador.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, GTX 1660 o superiores, e incluso en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: al no ser un modelo de `transformers`, no se puede servir con vLLM, TGI ni llama.cpp de forma directa; requiere el código propio `kieran.py` y PyTorch. El autor indica que el modelo usa la GPU si está disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. Como referencia estructural, este modelo se sitúa en la categoría de traducción neuronal de bajos recursos con arquitectura encoder-decoder de ~90M de parámetros, sin alternativas documentadas en la información disponible para el par luganda-runyankole.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| kieran_finetuned | 89M | 256 | MIT | safetensors (float32) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- BLEU de 14,05 en luganda → runyankole y 19,51 en runyankole → luganda sobre test: calidad moderada, con errores visibles en los ejemplos publicados (omisiones, cambios de sentido y sustituciones léxicas).
- El preentrenamiento se hizo sobre traducciones automáticas del dataset `tulati`, lo que puede propagar sesgos y errores del sistema de traducción original.
- El ajuste fino se realizó sobre el conjunto SALT; el modelo puede estar sobreajustado al dominio y estilo de ese corpus.
- Contexto limitado a 256 posiciones y pares de entrenamiento de hasta 128 piezas por lado: no apto para documentos largos sin segmentación.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- Solo cubre luganda y runyankole; no traduce a inglés ni a otras lenguas.
- Riesgo de alucinación y de deriva semántica en frases ambiguas o con terminología especializada, como muestran los ejemplos de la model card.
- La licencia MIT permite uso comercial, pero no se documentan evaluaciones de sesgo ni de robustez en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amDANIEL2024/kieran_finetuned
- Modelo base: https://huggingface.co/amDANIEL2024/kieran_base
- Dataset de preentrenamiento: https://huggingface.co/datasets/amDANIEL2024/tulati
