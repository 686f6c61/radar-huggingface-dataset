# instilux/ltz-e1-mini

## Resumen

LTZ E1 (mini) es un modelo de lenguaje enmascarado (masked language model) basado en la arquitectura ModernBERT, desarrollado por instilux y especializado en luxemburgues (codigo ISO `lb`/`ltz`). Se trata de un encoder de 68,4 millones de parametros entrenado siguiendo la receta Ettin, un enfoque de preentrenamiento eficiente para encoders pequenos, y esta pensado para tareas de comprension del lenguaje (NLU) en una lengua de bajos recursos que habitualmente queda fuera de los grandes corpus multilingues.

El modelo resuelve el problema de la falta de encoders especializados en luxemburgues: la mayoria de alternativas disponibles son modelos multilingues genericos que no capturan bien las particularidades morfologicas y lexicas de esta lengua germanica occidental. LTZ E1 mini ofrece una ventana de contexto de 1.024 tokens, un vocabulario BPE de 50.368 tokens y un formato de pesos compatible con la libreria `transformers` (a partir de la version 4.48.0).

Su relevancia actual radica en que acompana al benchmark ltzGLUE (ACL 2026 Findings), el primer conjunto de evaluacion NLU oficial para luxemburgues, que incluye tareas de clasificacion binaria y multiclase, reconocimiento de entidades nombradas, clasificacion de topicos y clasificacion de intenciones. El modelo esta publicado bajo licencia CC BY-SA 4.0 y su repo ocupa 0,3 GB, lo que lo hace ligero y facil de desplegar en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder) |
| Parametros totales | 68.457.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Luxemburgues (`lb`/`ltz`) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LTZ E1 mini es un encoder Transformer basado en ModernBERT, la evolucion moderna de BERT que incorpora mejoras de eficiencia como atencion con rotatory positional embeddings (RoPE), normalizacion y activaciones mas eficientes, y soporte nativo para contextos mas largos (aqui limitado a 1.024 tokens). Sigue la receta Ettin, un esquema de preentrenamiento disenado para producir encoders compactos de alta calidad con un presupuesto computacional reducido, tal como se describe en el modelo de referencia `jhu-clsp/ettin-encoder-68m`.

El tokenizador es un BPE byte-level (`GPTNeoXTokenizerFast`) con tokens especiales estilo BERT (`[CLS]`, `[SEP]`, `[PAD]`, `[MASK]`, `[UNK]`). Un detalle tecnico relevante es que el preentrenamiento se realizo unicamente con textos individuales (sin empaquetado de secuencias), por lo que el modelo nunca vio el token `[SEP]` durante el preentrenamiento; el tokenizador antepone `[CLS]` automaticamente pero no anade `[SEP]`. Para pares de frases, el tokenizador produce `[CLS] A [CLS] B`, formato que el modelo solo aprende durante el fine-tuning. El pooling por defecto para clasificacion de secuencias es `mean`. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables a un modelo de fill-mask).

## Capacidades

- Modelado de lenguaje enmascarado (fill-mask): predice tokens ocultos en una secuencia, util para completar frases y como base para fine-tuning.
- Comprension del lenguaje natural (NLU): sirve como encoder base para tareas de clasificacion de secuencias (clasificacion binaria y multiclase).
- Reconocimiento de entidades nombradas (NER): adecuado para fine-tuning en extraccion de entidades en luxemburgues.
- Clasificacion de topicos e intenciones: pensado para tareas de enrutamiento y analisis de texto.
- Soporte de pares de frases: mediante el formato `[CLS] A [CLS] B`, aunque solo aprendido en fine-tuning.
- Capacidades multilingues: limitadas al luxemburgues; no se reporta soporte para otras lenguas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un encoder, no un modelo generativo).
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Clasificacion de texto en luxemburgues: fine-tuning sobre el encoder para tareas de moderacion de contenido, filtrado de spam o categorizacion de documentos, aprovechando su ventana de 1.024 tokens y su vocabulario especializado.
- Reconocimiento de entidades nombradas: extraccion de nombres de personas, lugares y organizaciones en textos administrativos o periodisticos luxemburgueses tras fine-tuning con ltzGLUE.
- Clasificacion de intenciones en asistentes conversacionales: entrenamiento de un clasificador de intenciones para chatbots de atencion al ciudadano en luxemburgues, usando el pooling `mean` por defecto.
- Analisis de sentimiento y topicos en redes sociales: fine-tuning para monitorizar opinion publica en luxemburgues, una lengua con escasa cobertura en herramientas comerciales.
- Recuperacion de informacion y busqueda semantica: uso de las representaciones del encoder (con pooling `mean`) para indexar y comparar documentos en luxemburgues en sistemas de busqueda interna.
- Fill-mask como herramienta linguistica: completado de palabras en correctores ortograficos o asistentes de escritura para luxemburgues, gracias a su tokenizador BPE adaptado.
- Base para investigacion en lenguas de bajos recursos: punto de partida para experimentos de NLU en luxemburgues y comparacion con modelos multilingues en el benchmark ltzGLUE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 68,4 millones de parametros (aproximadamente 0,27 GB en fp32 y 0,14 GB en fp16), por lo que la VRAM necesaria es inferior a 1 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior permite inferencia con holgura. Para fine-tuning se recomienda al menos 8 GB de VRAM.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con mas de 2 GB de VRAM, e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: `transformers` (version >= 4.48.0), con soporte para `AutoModelForMaskedLM` y `AutoTokenizer`; tambien es compatible con endpoints de Hugging Face (`endpoints_compatible`). No se reporta soporte explicito para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| instilux/ltz-e1-mini | 68,4 M | 1.024 | Luxemburgues | CC BY-SA 4.0 | Hugging Face |
| jhu-clsp/ettin-encoder-68m | ~68 M | no disponible | Ingles (receta base) | no disponible | Hugging Face |
| Modelos multilingues genericos (p. ej. XLM-R base) | ~278 M | 512 | Multilingue | no disponible | Hugging Face |

La comparativa se limita a la receta de referencia (Ettin encoder 68M) y a encoders multilingues genericos; no se dispone de datos de rendimiento comparativo en ltzGLUE en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente de luxemburgues: no se ha entrenado ni evaluado en otras lenguas, por lo que su uso fuera de `lb` producira resultados pobres.
- Es un encoder de fill-mask, no un modelo generativo: no puede usarse para generacion de texto libre, chat, tool calling ni agentes.
- Ventana de contexto limitada a 1.024 tokens: documentos largos deben truncarse o dividirse en fragmentos.
- El modelo nunca vio `[SEP]` durante el preentrenamiento; anadirlo manualmente puede degradar el rendimiento. Para pares de frases debe usarse el formato `[CLS] A [CLS] B`.
- La embedding de `[CLS]` no recibio gradiente como token de entrada durante el preentrenamiento (el indice de padding se fijo a 0 en lugar de 2), por lo que las representaciones basadas en `[CLS]` sin fine-tuning pueden ser de menor calidad; se recomienda el pooling `mean` por defecto.
- Riesgo de alucinacion y sesgos: no se han publicado analisis especificos de sesgos para este modelo; al ser un encoder de una lengua de bajos recursos, los sesgos del corpus de preentrenamiento pueden reflejarse en las representaciones.
- Licencia CC BY-SA 4.0: permite uso comercial, pero exige atribucion y que las obras derivadas se distribuyan bajo la misma licencia (share-alike), lo que puede ser restrictivo para productos propietarios.
- No se dispone de informacion sobre cuantizaciones oficiales ni sobre el rendimiento en produccion (latencia, throughput).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/instilux/ltz-e1-mini
- Modelo de referencia de la receta Ettin: https://huggingface.co/jhu-clsp/ettin-encoder-68m
- Paper ltzGLUE (ACL 2026 Findings): https://aclanthology.org/2026.findings-acl.476/
- DOI del paper: https://doi.org/10.18653/v1/2026.findings-acl.476
