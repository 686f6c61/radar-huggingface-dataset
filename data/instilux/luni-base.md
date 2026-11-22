# instilux/luni-base

## Resumen

LUNI-base es un modelo de lenguaje enmascarado (masked language model) basado en la arquitectura ModernBERT, desarrollado por instilux y especializado en luxemburgués (`lb`/`ltz`). Se trata de un encoder de tamano base con 149.655.232 parametros, entrenado siguiendo la receta Ettin (inspirada en el modelo jhu-clsp/ettin-encoder-150m) y orientado a tareas de fill-mask y, por extension mediante fine-tuning, a clasificacion de secuencias y otras tareas de comprension del lenguaje.

El modelo cubre un nicho poco atendido: el luxemburgues es una lengua germánica occidental con unos 400.000 hablantes y recursos digitales limitados. LUNI-base se presenta como una base preentrenada sobre luxemburgues estandar mas luxemburgues aumentado, con un vocabulario BPE de 50.368 tokens y una longitud de contexto de 1.024 tokens. Su relevancia actual radica en ofrecer una alternativa moderna (ModernBERT, con soporte nativo en `transformers>=4.48.0`) frente a los encoders multilingues genericos, que suelen infrarrepresentar lenguas de bajos recursos.

La licencia CC BY-SA 4.0 permite uso comercial con atribucion y compartir-al-igual, lo que facilita su adopcion en proyectos de investigacion y productos derivados, siempre que se respeten las condiciones de la licencia. El repositorio ocupa 0,6 GB y los pesos estan en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 149.655.232 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos safetensors en el repo; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | luxemburgues (`lb`/`ltz`) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |
| Vocabulario | 50.368 tokens (BPE, GPTNeoXTokenizerFast) |
| Tokenizer | GPTNeoXTokenizerFast con tokens especiales estilo BERT (`[CLS]`, `[SEP]`, `[PAD]`, `[MASK]`, `[UNK]`) |
| Pooling por defecto | mean (para clasificacion de secuencias) |
| Libreria | transformers (>=4.48.0) |
| Tamano del repo | 0,6 GB |
| Pipeline | fill-mask |

## Arquitectura y entrenamiento

LUNI-base es un encoder ModernBERT de tamano base. ModernBERT es una evolucion de la familia BERT que incorpora mejoras de eficiencia propias de los transformers modernos (rotary positional embeddings, atencion con soporte para secuencias largas y capas optimizadas), aunque en este caso la longitud de contexto declarada es de 1.024 tokens. El modelo emplea un tokenizer byte-level BPE (`GPTNeoXTokenizerFast`) con un vocabulario de 50.368 tokens y tokens especiales de estilo BERT.

El preentrenamiento sigue la receta Ettin, aplicada a luxemburgues estandar mas luxemburgues aumentado, con objetivo de masked language modeling. La model card indica que el preentrenamiento uso unicamente textos individuales, sin empaquetado de secuencias (no sequence packing), y que el formato de entrada es `[CLS] tok_1 … tok_n`, sin `[SEP]` final. Un detalle tecnico relevante: durante el preentrenamiento el indice de padding de los embeddings se fijo a 0 (`[CLS]`) en lugar de 2 (`[PAD]`), por lo que el embedding de `[CLS]` solo se actualizo a traves de la capa de salida compartida; la configuracion publicada corrige `pad_token_id=2`, de modo que en fine-tuning el embedding de `[CLS]` se entrena con normalidad. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF/DPO (poco habituales en encoders de este tipo).

## Capacidades

- Modelado de lenguaje enmascarado (fill-mask) en luxemburgues: predice tokens `[MASK]` en funcion del contexto.
- Representaciones contextuales de tokens y de secuencia, utiles como base para fine-tuning en tareas de comprension del lenguaje (clasificacion, NER, QA extractiva, similaridad semantica).
- Clasificacion de secuencias mediante fine-tuning, con pooling por defecto `mean`.
- Procesamiento de pares de frases en formato `[CLS] A [CLS] B` (el modelo aprende este formato durante el fine-tuning, no en el preentrenamiento).
- Soporte nativo en la libreria `transformers` (>=4.48.0) y compatibilidad con endpoints.
- Capacidades multilingues: limitadas al luxemburgues segun la model card; no se declaran otros idiomas.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio; como encoder de fill-mask, no estan en el alcance del modelo.

## Casos de uso

- Correccion ortografica y de estilo en luxemburgues: dado un texto con una palabra enmascarada o dudosa, el modelo propone los tokens mas probables para el contexto, lo que permite construir un corrector asistido con umbral de confianza sobre las puntuaciones del `topk`.
- Completado de texto en editores y herramientas de escritura: integrado en un plugin que enmascara la siguiente palabra o fragmento y ofrece sugerencias, aprovechando el pipeline `fill-mask` y la API de `transformers`.
- Etiquetado y clasificacion de documentos en luxemburgues: fine-tuning sobre la cabeza de clasificacion con pooling `mean` para tareas como deteccion de spam, clasificacion de noticias o moderacion de contenido en una lengua con pocos recursos.
- Extraccion de entidades nombradas (NER) y analisis morfosintactico: el encoder sirve como base para modelos token-classification en dominios como administracion publica, prensa local o patrimonio cultural luxemburgues.
- Busqueda semantica y similitud de frases: usar las representaciones del encoder (con pooling `mean`) para indexar y comparar documentos en luxemburgues en un motor de busqueda interno o un sistema de preguntas frecuentes.
- Investigacion en linguistica computacional de lenguas de bajos recursos: LUNI-base proporciona un punto de partida reproducible (receta Ettin, ModernBERT) para experimentos de adaptacion y evaluacion en luxemburgues, con licencia CC BY-SA 4.0.
- Generacion de datos sinteticos y aumentacion: el modelo puede emplearse para proponer sustituciones plausibles en corpus luxemburgueses, apoyando la creacion de datasets de entrenamiento para otros sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de fill-mask o de fine-tuning, y anuncia un paper "coming soon".

## Requisitos de hardware

- VRAM estimada para inferencia: con 149,6 M de parametros, los pesos en fp32 ocupan aproximadamente 0,6 GB; en fp16/bf16, unos 0,3 GB. La VRAM total necesaria es inferior a 1-2 GB incluyendo activaciones y overhead del runtime para secuencias de hasta 1.024 tokens.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior ejecuta el modelo con holgura. En entornos de servidor, A100, H100 o L4 no aportan ventaja significativa por el reducido tamano, salvo por concurrencia.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 2 GB o mas de VRAM, e incluso en CPU para cargas moderadas.
- Opciones de despliegue: `transformers` con `AutoModelForMaskedLM` (requiere >=4.48.0), `pipeline("fill-mask")`, y servidores de inferencia compatibles con `transformers`. No se documentan en la informacion disponible integraciones oficiales con vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera baja latencia en GPU y throughput alto en CPU para lotes pequenos, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| instilux/luni-base | 149,6 M | 1.024 | Luxemburgues | CC BY-SA 4.0 | Hugging Face, `transformers` |
| jhu-clsp/ettin-encoder-150m | ~150 M (referencia de la receta) | no disponible en la informacion proporcionada | Ingles (familia Ettin) | no disponible en la informacion proporcionada | Hugging Face |
| Encoders multilingues genericos (p. ej. familia XLM-R base) | ~278 M (XLM-R base) | 512 (XLM-R base) | Multilingue | no disponible en la informacion proporcionada | Hugging Face, `transformers` |

La comparativa se limita a estos referentes porque la informacion proporcionada no incluye datos de rendimiento de LUNI-base ni de alternativas especificas para luxemburgues. No se dispone de benchmarks que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Cobertura linguistica restringida: el modelo esta entrenado unicamente para luxemburgues; su uso en otros idiomas producira resultados poco fiables.
- Longitud de contexto limitada a 1.024 tokens, insuficiente para documentos largos sin truncado o segmentacion.
- Riesgo de alucinacion y sustituciones incorrectas en fill-mask: las predicciones son probabilisticas y pueden proponer tokens gramaticalmente plausibles pero semanticamente erroneos; conviene aplicar umbrales de confianza.
- Sesgos: no se documentan analisis de sesgo; al entrenarse sobre datos de una comunidad linguistica pequena, puede reflejar sesgos de las fuentes utilizadas.
- Detalles de preentrenamiento que afectan al uso: el modelo no vio `[SEP]` durante el preentrenamiento (no anadirlo manualmente); el formato de pares `[CLS] A [CLS] B` solo se aprende en fine-tuning; el embedding de `[CLS]` no recibio gradiente como token de entrada en preentrenamiento, por lo que no es una representacion de frase fiable sin fine-tuning (con pooling `mean` el efecto es menor).
- Licencia CC BY-SA 4.0: permite uso comercial con atribucion y obliga a compartir las obras derivadas bajo la misma licencia; revisar implicaciones antes de integrarlo en productos propietarios.
- Sin benchmarks publicados ni paper disponible (anunciado como "coming soon"), lo que dificulta evaluar su calidad frente a alternativas.
- No se documentan cuantizaciones oficiales ni soporte en runtimes de inferencia de alto rendimiento (vLLM, TGI, llama.cpp, Ollama); el despliegue recomendado es via `transformers`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/instilux/luni-base
- Receta Ettin de referencia (encoder 150M): https://huggingface.co/jhu-clsp/ettin-encoder-150m
