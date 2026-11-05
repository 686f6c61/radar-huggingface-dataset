# indraneelghosh740/marathi-hindi-bodhan

## Resumen

Marathi-hindi-bodhan es un modelo de traduccion automatica especializado en la direccion marathi → hindi, desarrollado por el usuario indraneelghosh740 como un fine-tune del modelo base `bodhan-ai/indic-translate` de Bodhan AI / AI4Bharat. Se trata de un ajuste LoRA fusionado en un checkpoint autonomo, por lo que puede cargarse directamente con `transformers` sin necesidad de aplicar adaptadores. El modelo resuelve un par linguistico concreto (mr → hi) dentro del ecosistema de lenguas indoarias, un caso de uso relevante para la India por la demanda de traduccion entre lenguas regionales y el hindi como lingua franca.

Tecnicamente es un modelo de 7.941.100.832 parametros (aproximadamente 7,9 mil millones), empaquetado en safetensors con un tamano de repositorio de 15,9 GB, lo que sugiere pesos en bfloat16. La model card lo etiqueta con la arquitectura "gemma4" y lo carga mediante `AutoModelForImageTextToText`, lo que indica que el modelo base es un modelo multimodal de la familia Gemma adaptado a traduccion. El entrenamiento se realizo sobre 407.088 pares hindi-marathi filtrados por alineamiento LaBSE ≥ 0,90.

El modelo es relevante por su enfoque de datos curados y su evaluacion publicada en cuatro conjuntos (in-house, FLORES devtest, IN22-Gen e IN22-Conv), con BLEU entre 22,10 y 53,83 y chrF++ entre 45,95 y 67,36. Su licencia derivada de Bodhan AI impone restricciones relevantes para uso comercial como API, lo que conviene revisar antes de desplegarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (etiquetado "gemma4"); cargado con `AutoModelForImageTextToText` |
| Parametros totales | 7.941.100.832 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (longitud maxima de entrenamiento: 256 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | marathi (mr), hindi (hi) |
| Licencia | bodhan-ai-open-model-license (derivada de la del modelo base) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 15,9 GB |
| Pipeline | translation |
| Modelo base | bodhan-ai/indic-translate |

## Arquitectura y entrenamiento

El modelo parte de `bodhan-ai/indic-translate`, un modelo de traduccion indic de Bodhan AI / AI4Bharat construido sobre una arquitectura de la familia Gemma (etiquetada "gemma4" en los tags del repositorio) y cargable mediante `AutoModelForImageTextToText`. El fine-tune se realizo con LoRA de rango 64 y alpha 128 aplicado a las proyecciones de atencion y MLP de la "language tower" (la torre de lenguaje del modelo multimodal), y posteriormente se fusiono en un checkpoint unico. Esto implica que el resultado es un modelo denso de aproximadamente 7,9 mil millones de parametros con los pesos del adaptador ya integrados.

El conjunto de entrenamiento consta de 407.088 pares hindi-marathi curados con una puntuacion de alineamiento LaBSE de al menos 0,90, lo que indica un filtrado estricto de calidad en la alineacion semantica. Los hiperparametros fueron: tasa de aprendizaje 1e-4, tamano de batch efectivo 64, una epoca y longitud maxima de 256 tokens. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa. La longitud maxima de 256 tokens durante el entrenamiento es una limitacion importante que condiciona el contexto efectivo del modelo.

## Capacidades

- Traduccion marathi → hindi de texto plano, unica direccion evaluada y declarada por el autor.
- Generacion de texto condicionada por plantilla de chat (`apply_chat_template`), con prompt de instruccion del tipo "Translate the following text into Hindi:".
- Capacidad de generar hasta 256 tokens nuevos por llamada segun el ejemplo de uso (parametro `max_new_tokens=256`).
- Soporte multilingue limitado a los dos idiomas del par (mr, hi); no se declaran otras lenguas.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, vision, audio ni razonamiento multi-paso en la informacion disponible.
- El modelo base es multimodal (`AutoModelForImageTextToText`), pero el fine-tune solo declara y evalua la tarea de traduccion de texto.

## Casos de uso

- Traduccion de documentacion administrativa y formularios entre marathi y hindi: el modelo puede procesar frases y parrafos cortos (hasta 256 tokens) para convertir contenido oficial marathi al hindi, util en contextos de administracion publica india donde ambos idiomas coexisten.
- Localizacion de interfaces y contenido web: integrado en un pipeline de preprocesado, traduce cadenas de UI y textos de ayuda del marathi al hindi antes de publicarlos, con post-procesado para eliminar espacios antes de puntuacion.
- Atencion al ciudadano en centros de servicios: traduccion de mensajes de usuarios marathiparlantes a hindi para agentes o sistemas que operan principalmente en hindi, con turnos cortos que encajan en la ventana de 256 tokens.
- Subtitulado y transcripcion de contenido audiovisual: traduccion de subtitulos marathi a hindi por segmentos, dado que cada linea de subtitulo suele ser corta y el modelo rinde bien en frases breves segun los resultados de IN22-Conv (BLEU 24,66, chrF++ 45,95).
- Generacion de corpus paralelos para entrenamiento: uso del modelo para producir traducciones marathi → hindi a escala y construir datasets paralelos, siempre con revision humana dado el riesgo de alucinacion.
- Traduccion de correspondencia y correo electronico: conversion de mensajes personales o comerciales del marathi al hindi en entornos donde el destinatario solo lee hindi, con longitudes tipicas compatibles con el limite de entrenamiento.
- Investigacion en traduccion automatica de lenguas indoarias: punto de partida para experimentos de fine-tuning adicional o comparativas con otros sistemas indic, dado que publica metricas en FLORES e IN22.

## Benchmarks y rendimiento

Resultados publicados por el autor con decodificacion greedy, BLEU-13a y chrF++ (word order 2) sobre la salida cruda del modelo:

| Conjunto | Filas | Referencias | BLEU | chrF++ |
|---|---|---|---|---|
| In-house (`MrHi_544`) | 544 | 3 (algunas filas difieren) | 53,83 | 67,36 |
| FLORES devtest | 1.012 | 1 | 22,85 | 47,18 |
| IN22-Gen | 1.024 | 1 | 22,10 | 47,50 |
| IN22-Conv | 1.503 | 1 | 24,66 | 45,95 |

No se han publicado en la informacion disponible comparaciones directas con otros modelos en estos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos (7,9 mil millones de parametros × 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda al menos 20-24 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8-9 GB de pesos; en 4 bits, alrededor de 4-5 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: A100 (40/80 GB) o H100 para despliegue en bfloat16 con margen; RTX 4090 (24 GB) puede alojar el modelo en bfloat16 con `device_map="auto"` y longitudes cortas.
- GPU de consumo: cabe en RTX 4090 y, con cuantizacion, en GPUs de 8-12 GB (RTX 3080/4070), aunque no se ofrecen pesos GGUF oficiales.
- Opciones de despliegue: `transformers` con `AutoModelForImageTextToText` y `device_map="auto"` (metodo documentado por el autor); vLLM, TGI o llama.cpp no estan documentados en la informacion disponible.
- Latencia y throughput: no disponibles. La longitud maxima de 256 tokens limita el coste por peticion y favorece el procesamiento por lotes de frases cortas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| marathi-hindi-bodhan | 7,9 B | no disponible (entrenamiento a 256 tokens) | mr, hi | bodhan-ai-open-model-license | HuggingFace (0 descargas) |
| bodhan-ai/indic-translate (base) | no disponible | no disponible | indic (multiples) | bodhan-ai-open-model-license | HuggingFace |
| Otros sistemas indic | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa de rendimiento cuantitativa.

## Limitaciones y advertencias

- Direccion unica: solo traduce marathi → hindi; no ha sido evaluado en la direccion inversa ni en otros pares linguisticos.
- Problema de formato: aproximadamente el 51 % de las salidas en el conjunto in-house presentan un espacio antes de la puntuacion (por ejemplo, `शब्द ,`), aprendido de los datos tokenizados; requiere post-procesado para eliminarlo.
- Contexto corto: el entrenamiento se realizo con longitud maxima de 256 tokens, lo que limita la traduccion de documentos largos y puede degradar la calidad en entradas extensas.
- Riesgo de alucinacion: como todo modelo generativo, puede producir contenido no presente en el texto original, especialmente en segmentos ambiguos o fuera de dominio.
- Sesgos: no se documentan analisis de sesgo; los datos provienen de pares filtrados por LaBSE, lo que puede introducir sesgo hacia registros y dominios sobrerrepresentados en el corpus.
- Licencia: la licencia bodhan-ai-open-model-license puede exigir aprobacion escrita de Bodhan AI para ofrecer el modelo como API o servicio al que terceros llamen directamente (seccion 3); es imprescindible revisar `LICENSE.md` e `indic-open-license.md` antes de un uso comercial.
- Madurez: el repositorio tiene 0 descargas y 0 likes, sin validacion externa de la comunidad; conviene tratar los resultados como preliminares.
- Idiomas: no soporta variedades dialectales del marathi o el hindi mas alla de lo visto en el corpus de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/indraneelghosh740/marathi-hindi-bodhan
- Modelo base: https://huggingface.co/bodhan-ai/indic-translate
- Licencia del modelo base (referenciada en la model card): `LICENSE.md` e `indic-open-license.md` en el repositorio de HuggingFace
- Bodhan AI / AI4Bharat: no se proporciona URL especifica en la informacion disponible
- Paper, blog o demo: no disponibles en la informacion proporcionada
