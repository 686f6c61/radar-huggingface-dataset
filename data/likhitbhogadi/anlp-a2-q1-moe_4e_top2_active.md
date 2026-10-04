# likhitbhogadi/anlp-a2-q1-moe_4e_top2_active

## Resumen

El modelo `likhitbhogadi/anlp-a2-q1-moe_4e_top2_active` es un transformer decoder-only entrenado desde cero para traduccion automatica en dos direcciones concretas: vietnamita→ingles (vi→en) y japones→ingles (ja→en). Lo publica el usuario likhitbhogadi como parte de una asignatura de procesamiento de lenguaje natural (etiqueta `anlp-assignment`), sin articulo asociado ni documentacion mas alla de la model card. Su relevancia es por tanto academica y de referencia: sirve como punto de comparacion de variantes de arquitectura dentro de un mismo experimento docente, no como modelo listo para produccion.

El modelo tiene 47.860.224 parametros totales segun los pesos en safetensors, de los cuales 35.3 millones estan activos en cada pasada. La diferencia se debe a que la capa feed-forward es una mezcla de expertos (MoE) con cuatro expertos enrutados de anchura 1024 y seleccion top-2. Se entreno sobre `belumind/en-vi-ja-curated-500k-triplets` con un presupuesto de 30 millones de tokens, lo que situa el calculo muy por debajo del de los modelos de traduccion multilingues actuales.

El interes tecnico esta en la combinacion concreta: un modelo diminuto, con enrutado disperso, evaluado con BLEU sobre un par de idiomas de bajos recursos relativos. Sus resultados publicados (29.36 BLEU agregado, perplejidad de test 10.52) son honestos y trazables, con el log de entrenamiento en Weights & Biases enlazado desde la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con capa feed-forward MoE (4 expertos enrutados, top-2) |
| Parametros totales | 47.860.224 |
| Parametros activos | 35.300.000 (aproximado, segun model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | ingles (en), vietnamita (vi), japones (ja) |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamano de repositorio 0.2 GB) |

Otros datos de interes: pipeline declarado `translation`, tokenizador BPE compartido en `tokenizer.json`, formato de secuencia `<bos> <vi|ja> source <2en> target <eos>`. El codigo del modelo vive en `src/part1/model.py` del repositorio de la asignatura, no en el repositorio de HuggingFace.

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only (no encoder-decoder), lo que implica que la traduccion se formula como generacion condicionada por prefijo: el idioma origen se marca con un token (`<vi>` o `<ja>`) y el destino con `<2en>`. La innovacion declarada es la capa feed-forward de tipo `moe_4e_top2_active`: cuatro expertos enrutados de anchura 1024, de los cuales se activan dos por token. Eso explica la brecha entre 47.9M parametros totales y 35.3M activos. No se detalla si existe un router con balanceo de carga, ni el numero de capas, dimensiones de atencion o cabezas; esa informacion no esta disponible en la model card.

El entrenamiento se realizo desde cero (sin inicializacion a partir de un modelo preentrenado) sobre el dataset `belumind/en-vi-ja-curated-500k-triplets`, con un total de 30 millones de tokens de entrenamiento. No se menciona el uso de RLHF, DPO, ajuste supervisado posterior ni ninguna fase de alineacion; es entrenamiento supervisado puro sobre pares de traduccion. El ajuste de hiperparametros y la curva de perdida son consultables en el log de Weights & Biases referenciado en la model card.

## Capacidades

- Traduccion vi→en: 34.367 BLEU en test segun sacrebleu 13a con decodificacion voraz (greedy).
- Traduccion ja→en: 24.302 BLEU en test con la misma configuracion de evaluacion.
- Generacion de texto condicionada por prefijo con tokens especiales de idioma de origen y de destino.
- Tokenizacion BPE multilingue compartida entre los tres idiomas (en, vi, ja) mediante `tokenizer.json`.
- Modelado de lenguaje autoregresivo general dentro de su distribucion de entrenamiento.
- Soporte de tool calling o function calling: no disponible.
- Uso como agente o razonamiento multi-paso: no disponible; el modelo no esta disenado ni entrenado para ello.
- Capacidades de vision, audio o modo de razonamiento explicito (`thinking`): no disponibles.
- Capacidad conversacional multi-turno: no disponible; el entrenamiento es de traduccion, no de dialogo.

## Casos de uso

- Traduccion de subtitulos de contenido japones o vietnamita al ingles: el modelo acepta frases cortas con la marca de idioma `<ja>` o `<vi>` y produce texto en ingles con BLEU alto en vi→en (34.37) y moderado en ja→en (24.30), suficiente para un primer borrador que un revisor humano corrija.
- Pre-anotacion de corpus de investigacion: generar traducciones automaticas de referencia para conjuntos de evaluacion en vi→en o ja→en, reduciendo el coste de anotacion humana en tareas de NLP comparado.
- Analisis comparativo de arquitecturas MoE en docencia: al tener 35.3M parametros activos frente a 47.9M totales, permite medir el efecto del enrutado top-2 sobre calidad de traduccion con un presupuesto de calculo minimo.
- Localizacion de fichas de producto de comercio electronico: textos cortos y repetitivos en japones o vietnamita traducidos a ingles para catalogos internacionales, con validacion posterior por un traductor.
- Traduccion de tickets de soporte tecnico en ingles: normalizar consultas escritas en vietnamita o japones para que un equipo angloparlante las procese, siempre con supervision humana por la perplejidad mas alta en ja→en (13.45).
- Generacion de datos sinteticos de traduccion: usar el modelo como generador para aumentar un corpus en vi→en o ja→en, filtrando despues por calidad con una metrica automatica.
- Experimentos academicos sobre destilacion y cuantizacion: con 47.9M parametros totales, el modelo cabe en cualquier GPU y permite iterar rapido sobre tecnicas de compresion sobre un transformer MoE real.

## Benchmarks y rendimiento

Resultados publicados en la model card, sobre el conjunto de test, decodificacion voraz y sacrebleu variante 13a:

| Metrica | vi→en | ja→en | Ambos |
|---|---|---|---|
| Perplejidad de test | 8.2281 | 13.4468 | 10.5186 |
| BLEU de test (greedy, sacrebleu 13a) | 34.367 | 24.302 | 29.361 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El archivo `test_translations.csv` del repositorio contiene cada traduccion greedy del test junto a su referencia y su BLEU por frase.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 192 MB en fp32 y 96 MB en fp16/bf16, dado el tamano de 47.86M parametros. Con cache KV para secuencias tipicas de traduccion, el uso real se mantiene por debajo de 1 GB.
- GPU recomendadas: cualquier GPU moderna sirve; una NVIDIA RTX 3060, RTX 4090 o incluso una T4 son mas que suficientes. Tambien es viable en CPU.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo de los ultimos diez anos, y tambien en Apple Silicon y en CPU.
- Opciones de despliegue: no disponible ninguna soportada oficialmente. Al usar un modelo MoE con definicion de codigo propia (`src/part1/model.py`), no se garantiza compatibilidad con vLLM, llama.cpp, Ollama o TGI. No se publican pesos en GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| likhitbhogadi/anlp-a2-q1-moe_4e_top2_active | 47.9M totales / 35.3M activos | no disponible | en, vi, ja | no disponible | safetensors en HuggingFace |
| Helsinki-NLP/opus-mt-vi-en (familia Marian) | no disponible en la informacion proporcionada | no disponible | vi, en | no disponible en la informacion proporcionada | HuggingFace |
| NLLB-200 (Meta) | no disponible en la informacion proporcionada | no disponible | multilingue amplio | no disponible en la informacion proporcionada | HuggingFace |

Los datos de los modelos alternativos no se han verificado con la informacion disponible en esta busqueda y deben comprobarse en sus respectivas model cards antes de usarse en una comparacion formal. Ademas, las comparaciones de BLEU entre modelos solo son validas si coinciden el conjunto de test, la tokenizacion y la variante de sacrebleu; el modelo aqui descrito reporta sacrebleu 13a sobre su propio split de test, por lo que sus cifras no son directamente equiparables a las de otros sistemas.

## Limitaciones y advertencias

- Licencia no especificada: sin licencia explicita, no hay autorizacion clara para uso comercial. Conviene contactar con el autor antes de cualquier despliegue productivo.
- Sesgos conocidos: no disponibles. Al entrenarse sobre un unico dataset curado de 500.000 tripletas y 30M de tokens, hereda los sesgos de dominio y de registro de ese corpus.
- Riesgo de alulcinacion: es un modelo de traduccion, no de conocimiento factual; aun asi puede inventar terminos, nombres propios o contenido cuando la entrada queda fuera de su distribucion de entrenamiento.
- Direccionalidad restringida: solo se ha entrenado para vi→en y ja→en. No se ha entrenado para en→vi, en→ja ni para pares entre vietnamita y japones.
- Cobertura de idiomas limitada a tres lenguas. No hay soporte de castellano.
- Perplejidad notablemente peor en ja→en (13.45) que en vi→en (8.23), lo que anticipa mas errores en la direccion japonesa.
- Presupuesto de entrenamiento muy reducido (30M de tokens) en comparacion con los corpus de cientos de miles de millones de tokens de los modelos de traduccion de referencia: cabe esperar un rendimiento fragil en dominios especializados, jerga tecnica y frases largas.
- Longitud de contexto no documentada. El formato de secuencia no indica el limite maximo soportado, lo que impide garantizar el comportamiento con parrafos largos.
- Dependencia de codigo externo: el modelo necesita la implementacion de `src/part1/model.py` del repositorio de la asignatura; sin ella no se puede cargar con `AutoModel` estandar.
- Estado de adopcion nulo: cero descargas y cero likes en el momento de la consulta, sin comunidad que haya validado los resultados.
- Es un artefacto academico: no hay garantias de mantenimiento, soporte ni correccion de errores.

## Enlaces

- HuggingFace: https://huggingface.co/likhitbhogadi/anlp-a2-q1-moe_4e_top2_active
- Log de entrenamiento en Weights & Biases: https://wandb.ai/likhitbhogadi-iiit-hyderabad/anlp-a2-q1/runs/3r3fdsen
- Repositorio de la asignatura con el codigo del modelo (`src/part1/model.py`): no disponible (no se proporciona URL)
- Dataset de entrenamiento `belumind/en-vi-ja-curated-500k-triplets`: no disponible (no se proporciona URL, solo el identificador)
- Paper o informe tecnico: no disponible
- Demo publica: no disponible
