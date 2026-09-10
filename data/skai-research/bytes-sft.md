# skai-research/bytes-sft

## Resumen

`bytes-sft` es un modelo de lenguaje de 369.679.424 parametros (374M segun la model card) publicado por skai-research. Se trata del checkpoint `bytes-base` despues de un ajuste supervisado (SFT) sobre el dataset Tulu. Su rasgo diferencial es que opera a nivel de byte puro: no emplea tokenizer, sino un vocabulario de 261 entradas (256 bytes mas los tokens especiales `<pad>`, `</s>`, `<unk>`, `<en>` y `<eot>`), y usa una arquitectura jerarquica descrita en el articulo "Dynamic Multi-Byte Prediction With Hierarchical Language Models".

El modelo se presenta explicitamente como la linea base "flat byte" del trabajo, es decir, la referencia contra la que se comparan las variantes con prediccion multi-byte dinamica. Tiene una ventana de contexto de 4096 bytes, 22 capas (primer valor del campo `model_config` publicado) y precision fp32. Esta entrenado y evaluado unicamente en ingles.

Su relevancia es fundamentalmente de investigacion: explora alternativas al paradigma de tokenizacion subword tipo BPE, que introduce fragmentacion arbitraria y problemas conocidos en idiomas y dominios de baja cobertura. No es un modelo orientado a produccion: no implementa una arquitectura `transformers`, no declara pipeline de inferencia, no publica benchmarks estandar y requiere el codigo del repositorio del articulo para cargarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje jerarquico a nivel de byte (arquitectura propia, no soportada por `transformers`) |
| Parametros totales | 369.679.424 (374M segun la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 bytes |
| Tipos de cuantizacion | No disponible (pesos publicados en fp32; no se publican variantes GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Vocabulario | 261 entradas (256 bytes + `<pad>`, `</s>`, `<unk>`, `<en>`, `<eot>`) |
| Capas | 22 (campo `model_config`: `[22, (0,), 0, 0]`) |
| Precision | fp32 |
| Tamano del repositorio | 1,5 GB |
| Tipo de atencion (`attn_type`) | `None` en la configuracion publicada |
| Modelo base | skai-research/bytes-base |

## Arquitectura y entrenamiento

La arquitectura es un modelo jerarquico a nivel de byte con vocabulario minimo de 261 entradas. El campo `model_config` publicado es `[22, (0,), 0, 0]`, del que solo es interpretable de forma directa el primer valor (22 capas); el resto de valores no esta documentado en la informacion disponible. El campo `attn_type` aparece como `None` en la model card, sin que se detalle en la informacion proporcionada que mecanismo de mezcla de informacion lo sustituye. La innovacion central del trabajo es la prediccion multi-byte dinamica sobre modelos jerarquicos, que busca superar la rigidez del troceado fijo de bytes sin recurrir a un tokenizer subword aprendido.

El entrenamiento consta de dos fases. Primero, un preentrenamiento sobre `FineWeb-Edu` en la variante `sample-100BT`. Despues, un ajuste supervisado sobre `allenai/tulu-3-sft-mixture` durante 5 epocas, con tamano de lote 16 y semilla 42, usando la configuracion `configs/train/modern_fxt_baseline_btyes_256_scale_bp_dual.yaml` del repositorio. No se documenta en la informacion disponible el uso de RLHF, DPO u otras tecnicas de alineacion posteriores al SFT. La unica metrica publicada es la perdida sobre el conjunto de test de Tulu (2.722), calculada sobre respuestas en formato de chat, por lo que el propio autor advierte que no es comparable con el BPC de preentrenamiento del modelo base.

## Capacidades

- Generacion de texto autoregresiva a nivel de byte, sin tokenizer intermedio.
- Seguimiento de instrucciones en formato de chat en ingles, adquirido mediante el SFT sobre Tulu.
- Manejo nativo de cualquier secuencia de bytes, incluidos texto con errores tipograficos, codificaciones mixtas y cadenas que un tokenizer BPE fragmentaria de forma arbitraria.
- Segmentacion aprendida de bytes: la herramienta de generacion incluye la opcion `--show_tokenization`, que imprime las fronteras de segmento aprendidas.
- Generacion con cache (`--mode cached`) para decodificacion secuencial.
- Capacidades multilingues: no acreditadas. La model card declara unicamente ingles, aunque el diseno byte-level elimina teoricamente el sesgo de tokenizacion; no se ha publicado ninguna evaluacion multilingue.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Linea base de investigacion en modelos byte-level: el modelo esta disenado como referencia "flat byte" para comparar contra variantes con prediccion multi-byte dinamica, por lo que su uso principal es servir de punto de partida reproducible en experimentos sobre tokenizacion.
- Estudio de robustez frente a ruido textual: al operar sobre bytes, un texto con errores ortograficos, OCR defectuoso o sustituciones de caracteres no degrada la tokenizacion, lo que permite analizar como se comporta el modelo cuando un sistema BPE fallaria por fragmentacion inesperada.
- Prototipado de dominios con alfabetos no cubiertos: en secuencias de ADN, notacion quimica, logs de sistema o identificadores generados, un vocabulario BPE suele producir secuencias de tokens muy largas; un modelo byte-level como este permite experimentar sin disenar un tokenizer especifico.
- Experimentos controlados de fine-tuning sobre Tulu u otros datasets de instrucciones: el pipeline de entrenamiento esta publicado en el repositorio, lo que facilita reproducir el SFT y variar hiperparametros (epocas, lote, semilla) en un entorno academico.
- Analisis de texto en ingles con recursos limitados: con 374M de parametros y pesos fp32 de aproximadamente 1,5 GB, puede ejecutarse en una unica GPU de gama media para tareas de generacion corta y analisis exploratorio.
- Docencia y divulgacion sobre tokenizacion: la opcion de visualizar las fronteras de segmento aprendidas convierte al modelo en una herramienta didactica para explicar diferencias entre modelado byte-level y subword.
- Evaluacion de coste computacional del paradigma byte-level: permite medir empiricamente la penalizacion en pasos de decodificacion y memoria frente a modelos BPE de tamano comparable, un dato relevante para decidir si merece la pena adoptar este enfoque.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| Tulu test loss | 2.722 | Calculada sobre respuestas en formato de chat de Tulu; el autor indica que no es comparable al BPC de preentrenamiento del modelo base |

No se han publicado en la informacion disponible resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, ARC, HellaSwag ni similares). Tampoco se proporcionan comparaciones cuantitativas con las variantes multi-byte del articulo ni con modelos de tamano similar.

## Requisitos de hardware

- Pesos en fp32: 369.679.424 parametros x 4 bytes = aproximadamente 1,48 GB (1,38 GiB). El repositorio completo ocupa 1,5 GB.
- VRAM estimada para inferencia: en torno a 2-3 GB incluyendo activaciones, cache y overhead del runtime de PyTorch, dado que el modelo se carga en fp32 y no hay variantes cuantizadas publicadas.
- Cabe en GPU de consumo: si. Una RTX 3060 de 12 GB, una RTX 4060 Ti, una RTX 4070 o una RTX 4090 tienen margen sobrado; tambien es plausible en GPUs de 4-6 GB si el runtime lo permite, aunque no esta verificado en la informacion disponible.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para inferencia. Para el SFT con lote 16 conviene una GPU con 16 GB o mas (por ejemplo, A100, H100 o RTX 4090), aunque no se especifican requisitos oficiales.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama, TGI ni `transformers`. La unica via documentada es clonar `skai-research/lca-multibyte`, ejecutar `uv sync`, exportar `PYTHONPATH` y cargar el modelo con `src.eval.model_loader.load_fxt_model` o generar con `src/eval/generate.py`.
- Latencia y throughput: no disponible. Como referencia general del paradigma byte-level, una secuencia de 4096 bytes requiere aproximadamente 3-4 veces mas pasos de decodificacion que la misma frase procesada por un tokenizer BPE, lo que incrementa el coste por token generado; no se han publicado mediciones concretas para este checkpoint.

## Comparativa con modelos similares

No es posible comparar el rendimiento porque el modelo no tiene benchmarks publicados. La tabla siguiente compara solo caracteristicas objetivas con alternativas de tamano similar y arquitectura convencional basada en tokenizer.

| Modelo | Parametros | Contexto | Tokenizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| skai-research/bytes-sft | 369,7M | 4096 bytes | Byte-level, sin tokenizer (vocabulario 261) | Apache 2.0 | safetensors, requiere codigo propio; no compatible con `transformers` |
| GPT-2 (355M) | 355M | 1024 tokens | BPE (vocabulario ~50k) | MIT | `transformers`, ampliamente soportado |
| Pythia-410M | 410M | 2048 tokens | BPE | Apache 2.0 | `transformers`, con checkpoints intermedios de entrenamiento |
| SmolLM2-360M | 362M | 8192 tokens | BPE | Apache 2.0 | `transformers`, llama.cpp, ONNX y otras integraciones |

En rendimiento no hay comparacion posible: los tres modelos alternativos tienen resultados publicados en benchmarks estandar, mientras que `bytes-sft` solo reporta una perdida de 2.722 sobre el test de Tulu, metrica no comparable entre modelos distintos. Como modelos byte-level de referencia conceptual se pueden citar ByT5 y CANINE, aunque no se dispone de datos comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo. El preentrenamiento sobre FineWeb-Edu y el SFT sobre Tulu implican sesgos de dominio y de composicion del corpus, no caracterizados por el autor.
- Riesgo de alucinacion elevado: con 374M de parametros y un preentrenamiento limitado a una muestra de 100BT tokens de FineWeb-Edu, la cobertura de conocimiento factual es reducida.
- Solo ingles declarado. Aunque el diseno byte-level evita el sesgo de tokenizacion, no hay evidencia publicada de comportamiento correcto en otros idiomas.
- Contexto de 4096 bytes, muy inferior al de modelos actuales de tamano similar en tokens. Al medirse en bytes, la ventana efectiva en palabras en ingles es del orden de 600-800 palabras, lo que limita conversaciones multi-turno largas o documentos extensos.
- Incompatibilidad total con el ecosistema estandar: no funciona con `transformers`, `vLLM`, `llama.cpp`, `Ollama` ni `TGI`. Cualquier integracion exige usar y mantener el codigo de `skai-research/lca-multibyte`.
- Pesos en fp32 sin variantes cuantizadas, lo que descarta tecnicas habituales de reduccion de memoria y latencia.
- Mayor coste de inferencia por unidad de texto que un modelo BPE equivalente, al procesar byte a byte.
- Uso comercial: la licencia Apache 2.0 lo permite, pero no se ofrece ninguna garantia de calidad, soporte ni idoneidad para produccion, y el campo `inference: false` de la model card sugiere que no esta preparado para despliegue directo.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, publicado en septiembre de 2026: no hay comunidad, issues ni validacion independiente.
- La metrica de perdida publicada (2.722) se calcula sobre respuestas en formato de chat, de modo que no sirve para estimar la calidad de modelado del lenguaje general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skai-research/bytes-sft
- Modelo base: https://huggingface.co/skai-research/bytes-base
- Articulo: https://arxiv.org/abs/2608.15454
- Codigo: https://github.com/skai-research/lca-multibyte
- Dataset de SFT: https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
- Dataset de preentrenamiento (variante `sample-100BT`): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu

Nota: los resultados de busqueda web proporcionados no contienen ningun enlace relevante al modelo; el contenido devuelto corresponde a paginas de soporte de Microsoft sin relacion con esta ficha.
