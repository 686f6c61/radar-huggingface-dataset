# mistralai/Pixtral-12B-2409

## Resumen
Pixtral-12B-2409 es un modelo multimodal de pesos abiertos desarrollado por Mistral AI, publicado el 11 de septiembre de 2024. Combina un decodificador de 12.000 millones de parametros con un codificador visual de 400 millones de parametros, lo que da un total de aproximadamente 12.400 millones de parametros. El modelo ha sido entrenado de forma nativa con datos intercalados de imagen y texto, no mediante un adaptador visual anadido a posteriori, lo que le permite razonar sobre secuencias que mezclan imagenes y lenguaje en cualquier orden.

Su relevancia radica en que ofrece un rendimiento multimodal propio de la gama de 7 a 12 mil millones de parametros con licencia Apache 2.0, sin restricciones de uso comercial. Mantiene ademas un rendimiento competitivo en tareas puramente textuales, con una ventana de contexto de 128.000 tokens. Esto lo situa como una opcion atractiva para despliegues en produccion donde se necesita procesar documentos con graficos, facturas o capturas de pantalla sin depender de APIs propietarias.

El modelo se distribuye a traves de HuggingFace con pesos de precision completa y esta pensado para servirse con vLLM, que es la libreria de referencia recomendada por el propio autor. Soporta imagenes de tamano variable, lo que evita el recorte o redimensionado forzado que aplican otros modelos multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (decodificador de 12B + codificador visual de 400M) |
| Parametros totales | 12B (decodificador) + 400M (codificador visual) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en, fr, de, es, it, pt, ru, zh, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | no especificado en la model card (repositorio de 25,4 GB, pesos en precision completa) |

## Arquitectura y entrenamiento
Se trata de un modelo nativamente multimodal: un decodificador transformer de 12.000 millones de parametros acoplado a un codificador visual de 400 millones de parametros. A diferencia de los enfoques que congelan un LLM de texto y le anaden un proyector visual entrenado a posteriori, Pixtral fue entrenado con datos intercalados de imagen y texto, de modo que el modelo aprende a alternar y correlacionar ambas modalidades de forma conjunta. El sistema admite imagenes de resolucion y relacion de aspecto variables, sin necesidad de redimensionarlas a un cuadrado fijo.

La model card no detalla el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO sobre el modelo base. El modelo parte de un checkpoint previo, mistralai/Pixtral-12B-Base-2409, sobre el que se aplico el ajuste de instrucciones que da lugar a esta version 2409. Como innovaciones destacables figuran la multimodalidad nativa y el soporte de tamanos de imagen variables, ambos confirmados en la informacion oficial.

## Capacidades
- Generacion de texto y razonamiento sobre lenguaje natural con rendimiento competitivo en la categoria de 12B (MMLU 5-shot de 69,2).
- Comprension de imagenes: descripcion, respuesta a preguntas visuales (VQAv2 78,6) e interpretacion de escenas.
- Analisis de documentos: lectura de documentos escaneados y extraccion de informacion (DocVQA 90,7 en ANLS).
- Comprension de graficos y tablas: interpretacion de diagramas y figuras de datos (ChartQA 81,8 en CoT).
- Razonamiento matematico y visual-matematico: resolucion de problemas (Math Pass@1 48,1; Mathvista 58,0 en CoT).
- Generacion de codigo: 72,0 en HumanEval Pass@1.
- Seguimiento de instrucciones multimodal y textual (MM IF-Eval 52,7; Text IF-Eval 61,3).
- Soporte de multiples imagenes por mensaje y conversaciones multiturno con contexto largo.
- Capacidades multilingues en nueve idiomas declarados, entre ellos el castellano.

## Casos de uso
- Digitalizacion y extraccion de datos de facturas y formularios: el modelo puede recibir la imagen de un documento y devolver campos estructurados, apoyandose en su 90,7 de DocVQA y en la ventana de 128k tokens para procesar lotes de documentos en una misma sesion.
- Analisis automatico de informes con graficos: al obtener 81,8 en ChartQA, es adecuado para interpretar paneles de control, series temporales y diagramas y redactar resumenes en lenguaje natural para equipos de negocio.
- Asistencia tecnica con capturas de pantalla: en soporte de software, el usuario envia una imagen de un error y el modelo la interpreta junto al texto de la conversacion, manteniendo el contexto multiturno.
- Moderacion de contenido visual en plataformas: clasificacion y descripcion de imagenes subidas por usuarios, con la ventaja de la licencia Apache 2.0 para uso comercial sin coste por token.
- Generacion de codigo asistida por diagramas: a partir de una captura de un diagrama de arquitectura o de un esquema de base de datos, el modelo puede proponer el codigo correspondiente (HumanEval 72,0).
- Atencion al cliente multilingue: al cubrir espanol, frances, aleman, italiano, portugues, ruso, chino y japones, permite desplegar un mismo modelo para mercados distintos sin cambiar de infraestructura.
- Accesibilidad: descripcion de imagenes para personas con discapacidad visual, generando texto alternativo detallado a partir de fotografias.
- Investigacion academica sobre modelos multimodales: al ser de pesos abiertos y Apache 2.0, sirve como base para experimentacion y ajuste fino en entornos academicos.

## Benchmarks y rendimiento
Resultados publicados en la model card, reevaluados con el mismo pipeline de evaluacion para todos los modelos comparados.

### Benchmarks multimodales

| Metrica | Pixtral 12B | Qwen2 7B VL | LLaVA-OV 7B | Phi-3 Vision | Phi-3.5 Vision |
|---|---|---|---|---|---|
| MMMU (CoT) | 52,5 | 47,6 | 45,1 | 40,3 | 38,3 |
| Mathvista (CoT) | 58,0 | 54,4 | 36,1 | 36,4 | 39,3 |
| ChartQA (CoT) | 81,8 | 38,6 | 67,1 | 72,0 | 67,7 |
| DocVQA (ANLS) | 90,7 | 94,5 | 90,5 | 84,9 | 74,4 |
| VQAv2 (VQA Match) | 78,6 | 75,9 | 78,3 | 42,4 | 56,1 |

### Seguimiento de instrucciones

| Metrica | Pixtral 12B | Qwen2 7B VL | LLaVA-OV 7B | Phi-3 Vision | Phi-3.5 Vision |
|---|---|---|---|---|---|
| MM MT-Bench | 6,05 | 5,43 | 4,12 | 3,70 | 4,46 |
| Text MT-Bench | 7,68 | 6,41 | 6,94 | 6,27 | 6,31 |
| MM IF-Eval | 52,7 | 38,9 | 42,5 | 41,2 | 31,4 |
| Text IF-Eval | 61,3 | 50,1 | 51,4 | 50,9 | 47,4 |

### Benchmarks de texto

| Metrica | Pixtral 12B | Qwen2 7B VL | LLaVA-OV 7B | Phi-3 Vision | Phi-3.5 Vision |
|---|---|---|---|---|---|
| MMLU (5-shot) | 69,2 | 68,5 | 67,9 | 63,5 | 63,6 |
| Math (Pass@1) | 48,1 | 27,8 | 38,6 | 29,2 | 28,4 |
| HumanEval (Pass@1) | 72,0 | 64,6 | 65,9 | 48,8 | 49,4 |

### Comparativa con modelos cerrados y de mayor tamano

| Metrica | Pixtral 12B | Claude-3 Haiku | Gemini-1.5 Flash 8B (0827) | LLaVA-OV 72B | GPT-4o | Claude-3.5 Sonnet |
|---|---|---|---|---|---|---|
| MMMU (CoT) | 52,5 | 50,4 | 50,7 | 54,4 | 68,6 | 68,0 |
| Mathvista (CoT) | 58,0 | 44,8 | 56,9 | 57,2 | 64,6 | 64,4 |
| ChartQA (CoT) | 81,8 | 69,6 | 78,0 | 66,9 | 85,1 | 87,6 |
| DocVQA (ANLS) | 90,7 | 74,6 | 79,5 | 91,6 | 88,9 | 90,3 |
| VQAv2 (VQA Match) | 78,6 | 68,4 | 65,5 | 83,8 | 77,8 | 70,7 |

## Requisitos de hardware
Las cifras de VRAM son estimaciones a partir del tamano del modelo (unos 12.400 millones de parametros) y no proceden de la model card.
- VRAM estimada en precision completa (bf16/fp16): en torno a 25-26 GB solo para los pesos, mas el espacio para la cache KV, que crece con la longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 13-14 GB, factible en GPUs de 24 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 7-8 GB, aunque la model card no lista cuantizaciones oficiales.
- GPUs recomendadas para precision completa: A100 40/80 GB, H100, o configuraciones multi-GPU como 2x RTX 4090 (24 GB cada una).
- Consumer GPU: en bf16 no cabe en una sola RTX 4090 de 24 GB; con cuantizacion de 8 o 4 bits si es viable en RTX 4090, RTX 3090 y GPUs de 24 GB o mas.
- Despliegue: la libreria recomendada oficialmente es vLLM (v0.6.2 o superior) junto con mistral_common (1.4.4 o superior). Existe una imagen Docker oficial de vLLM. La model card solo documenta vLLM; llama.cpp, Ollama o TGI no aparecen mencionados en la informacion proporcionada.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento destacado |
|---|---|---|---|---|---|
| Pixtral-12B-2409 | 12B + 400M vision | 128k | Apache 2.0 | HuggingFace, vLLM, SageMaker, Azure | ChartQA 81,8; DocVQA 90,7; MMLU 69,2 |
| Qwen2 7B VL | 7B (multimodal) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace | DocVQA 94,5; MMLU 68,5 |
| LLaVA-OV 7B | 7B (multimodal) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace | MMMU 45,1; VQAv2 78,3 |
| Phi-3.5 Vision | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace | DocVQA 74,4; MMMU 38,3 |

Frente a la gama cerrada, Pixtral-12B-2409 queda por debajo de GPT-4o y Claude-3.5 Sonnet en MMMU y Mathvista, pero supera a Claude-3 Haiku y a Gemini-1.5 Flash 8B en varias metricas multimodales, con la ventaja de poder autoalojarse sin coste por token.

## Limitaciones y advertencias
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir descripciones o respuestas incorrectas sobre imagenes, especialmente en documentos de baja calidad o con texto poco legible.
- Rendimiento inferior a modelos frontera: en MMMU obtiene 52,5 frente a 68,6 de GPT-4o y 68,0 de Claude-3.5 Sonnet, por lo que no es adecuado para tareas visuales de maxima complejidad.
- Idiomas: la model card declara nueve idiomas, pero no se ofrecen metricas desglosadas por idioma; el rendimiento fuera del ingles puede degradarse y no esta cuantificado en la informacion disponible.
- Contexto: aunque la ventana es de 128k tokens, la model card advierte de que en GPUs con poca VRAM conviene reducir max_num_seqs o max_model_len, lo que limita el contexto efectivo en hardware modesto.
- Cuantizacion y formatos: la model card no publica cuantizaciones oficiales ni formatos GGUF; cualquier cuantizacion de terceros debe validarse por separado.
- Vision encoder: al tratarse de un componente de 400M entrenado de forma nativa, sustituirlo o ajustarlo por separado no esta documentado.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales; conviene aun asi revisar los terminos de Mistral AI para el tratamiento de datos personales, tal como la propia model card indica.
- Produccion: la model card esta marcada como inference: false, lo que sugiere que no debe servirse a traves de la infraestructura de inferencia de HuggingFace, sino en un despliegue propio con vLLM.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/mistralai/Pixtral-12B-2409
- Modelo base: https://huggingface.co/mistralai/Pixtral-12B-Base-2409
- Blog de lanzamiento: https://mistral.ai/news/pixtral-12b/
- Demo en chat: https://chat.mistral.ai/chat
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Imagen Docker de vLLM: https://hub.docker.com/layers/vllm/vllm-openai/latest/images/sha256-de9032a92ffea7b5c007dad80b38fd44aac11eddc31c435f8e52f3b7404bbf39
- Politica de privacidad de Mistral AI: https://mistral.ai/terms/
- Sitio oficial de Mistral AI: https://mistral.ai/
