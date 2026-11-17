# amDANIEL2024/shilla_base

## Resumen

shilla_base es un modelo de traduccion automatica neuronal encoder-decoder de 89 millones de parametros desarrollado por Amanyire Daniel (amDANIEL2024). Su proposito es traducir directamente entre luganda (lg) y ateso (teo), dos lenguas ugandesas de bajos recursos, sin pasar por el ingles en ningun extremo del pipeline. La direccion de traduccion se controla mediante un token de prefijo en la secuencia de origen (`<2teo>` o `<2lug>`), lo que permite cubrir ambas direcciones con un unico conjunto de pesos.

El modelo emplea una arquitectura transformer pre-LN clasica de 6 capas de encoder y 6 de decoder, con d_model de 640, 8 cabezas de atencion y FFN de 2560, ademas de embeddings y proyeccion de salida atados. Dispone de un tokenizador SentencePiece unigram compartido de 32.000 piezas y una ventana de contexto de 256 posiciones, aunque los pares de entrenamiento se limitaron a 128 piezas por lado.

Es relevante porque aborda un par linguistico practicamente ausente en los sistemas de traduccion comerciales, y lo hace con un modelo pequeno que cabe en hardware modesto. No obstante, se trata de un checkpoint base preentrenado exclusivamente sobre pares generados por traduccion automatica (NLLB), sin ajuste fino sobre datos humanos ni evaluacion completa publicada sobre el conjunto de test SALT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder pre-LN, 6 + 6 capas, d_model 640, 8 cabezas, FFN 2560, GELU |
| Parametros totales | 89.418.240 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 posiciones (posicional sinusoidal); pares de entrenamiento limitados a 128 piezas por lado |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | luganda (lg), ateso (teo) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, float32); tokenizador SentencePiece (`spm.model`) |
| Tokenizador | SentencePiece unigram compartido, 32.000 piezas, preserva mayusculas, separa digitos |
| Direcciones | `lug2teo` y `teo2lug` mediante prefijo en origen |
| Libreria | PyTorch (modelo custom, no compatible con `AutoModel` de transformers) |
| Tamano del repo | 0,4 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder estandar con normalizacion previa a cada subcapa, seis capas en encoder y seis en decoder, dimension de modelo 640, ocho cabezas de atencion y red feed-forward de 2560 unidades con activacion GELU. Los embeddings de entrada, los del decoder y la proyeccion de salida estan atados, lo que explica el recuento compacto de 89M de parametros. La codificacion posicional es sinusoidal y fija, con un maximo de 256 posiciones. El tokenizador es un SentencePiece unigram de 32.000 piezas entrenado sobre texto de luganda y ateso (tulati mas el texto del split de entrenamiento de SALT), no sobre el modelo final.

El entrenamiento se realizo exclusivamente sobre los pares luganda-ateso del dataset tulati, en ambas direcciones. Es importante senalar que en tulati cada columna no inglesa es una traduccion automatica de una columna en ingles generada por Sunbird/translate-nllb-1.3b-salt; no hay texto humano de luganda ni de ateso en los datos de entrenamiento. El filtrado descarto 127.024 filas marcadas como vacias, degeneradas, similares al ingles o con longitudes atipicas, elimino 1.026 pares con ambos lados identicos y 483 duplicados exactos, y tras la descontaminacion contra SALT dev/test quedo un total de 1.406.164 pares, de los cuales 2.000 se reservaron para validacion. El regimen fue de 5 epocas, 17.380 pasos de optimizador (unos 25.000 tokens objetivo por paso), precision fp16 sobre una unica GPU Kaggle T4, label smoothing de 0,1, AdamW con warmup lineal seguido de decaimiento inverso de la raiz cuadrada y LR pico de 3e-4. No se reporta RLHF ni DPO.

## Capacidades

- Traduccion directa luganda a ateso y ateso a luganda sin pivotar por ingles, con un unico modelo y pesos compartidos.
- Control de direccion mediante token de prefijo en la secuencia de origen (`<2teo>`, `<2lug>`).
- Traduccion por lotes: la funcion `translate` acepta una cadena o una lista de cadenas.
- Decodificacion por beam search configurable (beam por defecto de 4).
- Tokenizacion compartida entre ambos idiomas con preservacion de mayusculas y separacion de digitos.
- Inferencia en GPU o CPU mediante el script `shilla.py` incluido en el repositorio.
- No dispone de soporte documentado de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Traduccion de documentacion comunitaria y materiales civicos: el modelo puede traducir avisos, formularios o guias entre luganda y ateso alli donde no existe un sistema comercial que cubra el par, con revision humana posterior por tratarse de un checkpoint base.
- Preservacion linguistica y archivo: generar versiones preliminares en ateso de textos en luganda para proyectos de documentacion de lenguas minoritarias, aprovechando que el modelo no requiere ingles intermedio.
- Prototipado de asistentes conversacionales multilingues en Uganda: integrable en un backend PyTorch que reciba texto luganda o ateso y devuelva la traduccion, con la ventaja de que 89M de parametros permiten servir el modelo en una sola GPU de gama media.
- Generacion de corpus sinteticos aumentados: usar las salidas del modelo como material de preentrenamiento o aumento de datos para otros sistemas de traduccion o modelos de lenguaje de bajo recursos, dado su caracter de base preentrenada.
- Investigacion en traduccion de pares de bajos recursos: servir como linea base reproducible (licencia MIT, pesos abiertos, codigo de inferencia incluido) para comparar tecnicas de filtrado, destilacion o ajuste fino sobre datos humanos.
- Traduccion por lotes en pipelines offline: procesar ficheros de subtitulos o transcripciones en luganda hacia ateso (o viceversa) mediante la API de listas del script `shilla.py`, con beam search configurable para equilibrar calidad y latencia.
- Educacion y aprendizaje de lenguas: ofrecer traducciones de referencia preliminares entre ambas lenguas en herramientas de autoaprendizaje, siempre con advertencia de que la salida no ha sido revisada por un hablante nativo de ateso.

## Benchmarks y rendimiento

No se han publicado resultados completos de benchmarks (BLEU, chrF, chrF++) sobre los conjuntos dev/test de SALT. La model card indica explicitamente que la evaluacion completa esta pendiente. Lo unico medido al final del preentrenamiento (paso 17.380) es lo siguiente:

| Conjunto | Direccion | Loss | chrF++ rapido (greedy, primeras 128 frases) |
|---|---|---|---|
| Validacion de tulati (pares automaticos reservados) | lug→teo | 1,470 | 54,49 |
| Validacion de tulati (pares automaticos reservados) | teo→lug | 1,796 | 48,45 |
| SALT dev (traducciones humanas) | lug→teo | 3,059 | 44,31 |
| SALT dev (traducciones humanas) | teo→lug | 2,642 | 42,01 |

El chrF++ rapido es una comprobacion ruidosa sobre un subconjunto pequeno con decodificacion greedy y no es comparable con puntuaciones de conjunto completo. Como referencia, la model card incluye la linea base de copiar la frase de origen sin traducir sobre el conjunto completo SALT dev (sacreBLEU 2.5.1):

| Direccion | BLEU | chrF | chrF++ |
|---|---|---|---|
| lug→teo | 0,16 | 15,84 | 13,47 |
| teo→lug | 0,16 | 15,27 | 13,11 |

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en float32 (89M de parametros) el modelo ocupa aproximadamente 0,36 GB, por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o mas; en CPU la inferencia es viable por el reducido tamano.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor lo entreno en una Kaggle T4, que es suficiente tambien para inferencia. GPU de gama alta (A100, H100, RTX 4090) no son necesarias y solo aportarian mayor throughput por lote.
- Cabe en GPU consumer: si, incluidas GTX 1650, RTX 3050, RTX 4060 y similares.
- Opciones de despliegue: al ser un modelo PyTorch custom no compatible con `AutoModel`, no se puede cargar directamente con vLLM, TGI ni llama.cpp/Ollama en su formato actual. El despliegue previsto es mediante el script `shilla.py` incluido en el repositorio, que usa `torch` y `sentencepiece`, o mediante exportacion manual a TorchScript/ONNX por parte del usuario.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| shilla_base | 89M | 256 posiciones | luganda, ateso (directo) | MIT | Base preentrenada solo con datos automaticos; sin evaluacion completa en SALT |
| Sunbird/translate-nllb-1.3b-salt | 1.300M (aproximado, segun nombre) | no disponible | multilingue (incluye luganda; cobertura de ateso no reportada) | MIT (segun la model card de shilla_base) | Modelo NLLB ajustado; genero los datos de entrenamiento de shilla_base; traduce via ingles |
| NLLB-200 (familia) | 600M a 54.000M segun variante | 512 tokens en variantes grandes | 200 idiomas (ateso no incluido en la lista estandar) | CC-BY-NC 4.0 en la mayoria de variantes | Referencia general de traduccion multilingue; no cubre el par luganda-ateso directo |

La comparacion con NLLB es relevante porque shilla_base se entreno sobre salidas de un modelo de esa familia y porque NLLB no ofrece traduccion directa luganda-ateso. No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint base preentrenado, no un traductor finalizado: no se ha ajustado sobre datos traducidos por humanos.
- Ambos lados de cada par de entrenamiento son salida automatica de un modelo NLLB, por lo que el modelo hereda los errores y el estilo de ese traductor; el texto humano real (dialectos, ortografia variable, alternancia de codigos) puede manejarse peor de lo que sugieren las metricas.
- Puede omitir o alterar el significado, especialmente en numeros, nombres propios y palabras poco frecuentes. No debe usarse en contenido medico, legal o de alto riesgo sin revision humana.
- Modelo a nivel de frase: entradas superiores a unas 128 piezas se truncan o degradan la calidad; el contexto maximo es de 256 posiciones.
- Las salidas no han sido revisadas por un lector nativo de ateso, segun reconoce el autor.
- La evaluacion completa sobre SALT dev/test (BLEU, chrF, chrF++) no se ha ejecutado; las cifras disponibles son parciales y ruidosas.
- En SALT, las frases en luganda y ateso son traducciones humanas independientes de la misma frase en ingles, por lo que una referencia en un idioma no es traduccion de la referencia en el otro; esto complica la interpretacion de las metricas.
- Licencia MIT: permite uso comercial, pero el usuario asume la responsabilidad sobre la calidad y los sesgos de las salidas.
- El modelo no es compatible con la API `AutoModel` de transformers, lo que limita su integracion en stacks estandar y obliga a usar el codigo incluido o a exportarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amDANIEL2024/shilla_base
- Dataset tulati: https://huggingface.co/datasets/amDANIEL2024/tulati
- Modelo que genero los datos de entrenamiento (Sunbird/translate-nllb-1.3b-salt): https://huggingface.co/Sunbird/translate-nllb-1.3b-salt
- Sitio del autor: https://domusdeiug.com
- Contacto del autor: domusdeiug@gmail.com
