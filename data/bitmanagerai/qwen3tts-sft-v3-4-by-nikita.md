# bitmanagerai/Qwen3TTS-SFT-v3.4-by-Nikita

## Resumen

Qwen3TTS-SFT-v3.4-by-Nikita es un modelo de sintesis de voz (text-to-speech) en ruso publicado por el usuario bitmanagerai en HuggingFace. Se trata de un ajuste fino supervisado (SFT) del modelo bitmanagerai/Qwen3TTS-GRPO-v2, a su vez derivado de la familia Qwen3-TTS, y esta especializado en la lectura de contratos de oferta y terminologia financiera en ruso. El modelo no es un LLM de proposito general: su funcion es convertir texto en audio, con dos transformadores diferenciados (un "talker" y un predictor de codigos) que generan tokens de codec de audio de forma autorregresiva.

El modelo tiene 1.928.677.440 parametros (aproximadamente 1,93 mil millones) y se distribuye en safetensors en bf16, con un repositorio de 12,3 GB. El idioma soportado declarado es unicamente el ruso (etiqueta `ru`). La licencia no esta especificada en la model card ni en los metadatos de HuggingFace, lo que supone una limitacion importante para uso comercial.

Su relevancia actual es acotada pero concreta: resuelve un problema de pronunciacion y normalizacion de terminos financieros y juridicos en ruso, un dominio donde los modelos TTS genericos suelen fallar. La model card documenta una mejora medible frente al modelo base en la lectura de contratos de oferta (91,6% frente a 81,2%) y en terminos con latinismo en la entrada (81,8% frente a 67,5%), ademas de corregir un fallo critico de la revision anterior, que devolvia respuestas vacias en el 15% de las frases con determinadas voces femeninas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer dual para TTS: "talker" (backbone autorregresivo) + predictor de codigos, sobre la base de Qwen3-TTS |
| Parametros totales | 1.928.677.440 (aproximadamente 1,93 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se publican en bf16; no se documentan variantes cuantizadas) |
| Idiomas soportados | Ruso (`ru`) |
| Licencia | No disponible |
| Formato de pesos | safetensors (bf16) |
| Autor | bitmanagerai |
| Modelo base | bitmanagerai/Qwen3TTS-GRPO-v2 (revision G4R315) |
| Libreria | qwen-tts |
| Tamano del repositorio | 12,3 GB |
| Fecha de creacion | 16 de septiembre de 2026 |
| Ultima actualizacion | 17 de septiembre de 2026 |
| Revisiones documentadas | EMA 0.49/0.21/0.30 sobre checkpoints 300/400/500 de la ejecucion `dict2-s43-alld` (revision actual); `a89e72eb` (all_talker sin detach); `133213a2` (solo talker) |
| Descargas | 7 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema de Qwen3-TTS, compuesta por dos transformadores: un "talker" que actua como backbone autorregresivo y un predictor de codigos que modela los tokens de audio. El entrenamiento descrito en la model card ajusta ambos modulos (`training_scope all_talker`) sobre el modelo base GRPO-v2, que a su vez habia sido optimizado previamente con GRPO. Los pesos finales se publican en bf16, pero el entrenamiento se realizo con pesos maestros en fp32.

El recetario de SFT es explicito: learning rate 1e-5, batch 1x16, 500 pasos, semilla 43, `code_predictor_loss_weight 1.0` y `code_predictor_detach_hidden true`, seguido de un promedio exponencial de pesos (EMA) con coeficientes 0,49/0,21/0,30 sobre los checkpoints 300, 400 y 500. El conjunto de datos, denominado `eqv-dual-dict2`, combina 4.800 pares de clips mas 346 fragmentos de contrato de oferta, y cada clip aparece en dos variantes de texto: cruda (pasa por RUAccent) y normalizada mediante el diccionario TTSReplacements (version 1ab1f299).

La innovacion tecnica mas relevante documentada es el uso de `code_predictor_detach_hidden true`: la perdida del predictor de codigos se calcula sobre estados ocultos desacoplados del talker. Segun el autor, esto corrige el fallo de la revision `a89e72eb`, en la que un predictor de codigos desalineado realimentaba frames degenerados al talker y este emitia EOS al inicio de la frase, produciendo respuestas vacias (un frame, 0,08 s) en el 15% de las frases normales con las voces anastasia-1 y ekaterina-1. La revision actual declara 0 respuestas vacias de 200 frases en cada una de las cuatro voces de produccion.

## Capacidades

- Sintesis de voz en ruso a partir de texto, con generacion autorregresiva de tokens de codec de audio mediante el modulo talker y el predictor de codigos.
- Lectura especializada de contratos de oferta y documentos financieros o legales, con terminologia especifica del dominio.
- Manejo de dos formas de entrada de texto por clip: texto crudo procesado con RUAccent y texto normalizado mediante el diccionario TTSReplacements.
- Pronunciacion mejorada de terminos con caracteres latinos en la entrada (incluidos prestamos y acronimos financieros).
- Soporte de multiples voces: la evaluacion documentada usa cuatro voces de produccion (anastasia-1, ekaterina-1, valera-1 y male-ru-cc-01).
- Generacion estable con semilla fija en el trazado de produccion (semilla 42 documentada), sin respuestas vacias en las pruebas declaradas.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio de entrada. Es un modelo exclusivamente de texto a voz.

## Casos de uso

- Lectura automatizada de contratos de oferta: el modelo esta ajustado especificamente sobre 346 fragmentos de contrato de oferta y alcanza un 91,6% de acierto en ese tipo de texto segun la medicion del autor, frente al 81,2% del modelo base, por lo que es adecuado para generar versiones en audio de documentos contractuales en ruso.
- Atencion al cliente telefónica en ruso: puede integrarse como motor TTS en sistemas IVR o call centers que necesiten reproducir respuestas con terminologia financiera, usando las cuatro voces de produccion validadas (dos femeninas y dos masculinas).
- Accesibilidad de documentos financieros: conversion de informes, extractos o condiciones de productos bancarios a audio para usuarios con discapacidad visual, aprovechando la normalizacion de terminos via el diccionario TTSReplacements.
- Formacion interna y compliance: generacion de locuciones para cursos corporativos sobre normativa financiera o clausulas contractuales, donde la pronunciacion correcta de la terminologia es critica.
- Notificaciones y avisos automatizados: produccion de mensajes de voz para alertas de productos financieros, con voces consistentes y sin cortes prematuros en frases largas.
- Doblaje de material audiovisual corporativo: narracion de videos de producto o tutoriales en ruso con una voz sintetica estable, siempre que el contenido se mantenga en el dominio financiero y legal entrenado.
- Prototipado de asistentes de voz para banca: dado que el modelo es pequeno (1,93 mil millones de parametros) y cabe en GPU de consumo, sirve para experimentar con asistentes en ruso sin infraestructura dedicada.
- Generacion de audiolibros tecnicos o economicos en ruso, con especial ventaja en textos que contienen abundantes latinismos y acronimos financieros.

## Benchmarks y rendimiento

La model card no incluye benchmarks generales (MMLU, HumanEval, GSM8K), ya que no es un modelo de lenguaje. Los datos disponibles son metricas de dominio medidas en el trazado de produccion (fachada + vLLM-Omni 0.24, `samp-base`, voz male-ru-cc-01, una sola ejecucion, comparacion por pares con el modelo base):

| Metrica | Base GRPO-v2 | Esta revision |
|---|---|---|
| Contrato de oferta (154 casos, sin espacios) | 81,2% | 91,6% |
| Contrato de oferta, textos nuevos (150) | 86,7% | 94,7% |
| Terminos, latinismo en la entrada (357) | 67,5% | 81,8% |
| Terminos a traves del diccionario (357) | 82,4% | 77,9% (dentro del ruido de medicion) |
| Canon (500) | 94,2% | 97,2% |
| WER rugen | 0,4% | 0,7% (ruido) |
| Respuestas vacias, 200 frases x 4 voces, semilla 42 | 0 | 0 |

Attenuacion de la voz hacia el final de la frase (diferencia fin menos inicio, en dB, sobre 200 frases):

| Voz | Base GRPO-v2 | Esta revision | Revision a89e72eb |
|---|---|---|---|
| male-ru-cc-01 | -6,7 | -7,5 | -8,1 |
| valera-1 | -6,8 | -5,3 | -7,0 |
| anastasia-1 | -7,0 | -7,6 | -8,4 |
| ekaterina-1 | -1,7 | -2,6 | -2,6 |

No se han publicado resultados de benchmarks estandar adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 3,86 GB (1,93 mil millones de parametros a 2 bytes por parametro). Con cache de estados intermedios y el motor de inferencia, una estimacion razonable se situa en el rango de 6 a 8 GB de VRAM, aunque el dato exacto no esta publicado.
- GPU recomendadas: no se especifican oficialmente. Por tamano, el modelo deberia ejecutarse en GPUs de consumo con 8 GB o mas (RTX 3070/4060 Ti 8 GB, RTX 4070, RTX 4080, RTX 4090) y en GPUs de datacenter como A100, H100, L40S o L4.
- Cabe en GPU de consumo: si, dado que el modelo completo en bf16 ocupa menos de 4 GB de pesos. No se documenta una variante cuantizada a 8 o 4 bits.
- Opciones de despliegue: la model card menciona explicitamente vLLM-Omni 0.24 como parte del trazado de produccion (con semilla 42). El repositorio usa la libreria `qwen-tts` y safetensors, por lo que el despliegue via HuggingFace Transformers con esa libreria es el camino documentado. No se mencionan llama.cpp, Ollama ni TGI, y no se publican pesos GGUF.
- Latencia y throughput: no disponibles. La unica referencia temporal es que la revision anterior producia respuestas degeneradas de un solo frame y 0,08 s, dato que describe un fallo, no un rendimiento valido.
- Nota de despliegue: el autor advierte que la ruta HF del repositorio fija `min_new_tokens=2` y oculta las respuestas vacias, por lo que las mediciones deben hacerse con el trazado de produccion y semilla 42 para ser comparables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metricas de dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3TTS-SFT-v3.4-by-Nikita (esta ficha) | 1,93 mil millones | No disponible | Oferta 91,6%; terminos con latinismo 81,8%; canon 97,2% | No disponible | HuggingFace, safetensors bf16 |
| bitmanagerai/Qwen3TTS-GRPO-v2 (modelo base) | No disponible | No disponible | Oferta 81,2%; terminos con latinismo 67,5%; canon 94,2% | No disponible | HuggingFace |
| Revision `a89e72eb` (misma familia) | 1,93 mil millones (presumible) | No disponible | 15% de respuestas vacias en voces femeninas (dato del autor); atenuacion final -8,1 dB en male-ru-cc-01 | No disponible | HuggingFace |
| Revision `133213a2` (misma familia) | No disponible | No disponible | 0 respuestas vacias, pero mayor atenuacion al final de la frase | No disponible | HuggingFace |

No se dispone de datos publicados en la informacion proporcionada para comparar con alternativas externas de TTS en ruso (por ejemplo, modelos multilingues de sintesis de voz de otros proveedores), por lo que esa comparacion se marca como no disponible.

## Limitaciones y advertencias

- Licencia no especificada: al no declararse licencia en la model card ni en los metadatos de HuggingFace, no puede asumirse permiso de uso comercial. Es imprescindible contactar con el autor antes de cualquier despliegue en produccion.
- Idioma unico: el modelo solo declara soporte de ruso. No hay evidencia de capacidades multilingues.
- Dominio estrecho: el ajuste se ha realizado sobre contratos de oferta y terminologia financiera. Fuera de ese dominio, la calidad de pronunciacion y de prosodia no esta garantizada ni medida.
- Regresion en una metrica: los terminos procesados a traves del diccionario bajan del 82,4% al 77,9%, aunque el autor lo atribuye al ruido de la medicion. No debe descartarse una perdida real en esa ruta de entrada.
- Ligero aumento del WER: pasa de 0,4% a 0,7%, de nuevo dentro de lo que el autor considera ruido. Es un valor bajo, pero conviene monitorizarlo en produccion.
- Atenuacion al final de la frase: la metrica de decaimiento (fin menos inicio) es de -7,5 dB en male-ru-cc-01, -7,6 dB en anastasia-1 y -5,3 dB en valera-1, peor que el modelo base en tres de las cuatro voces. Puede traducirse en un volumen decreciente en frases largas.
- Riesgo de artefactos en voces no validadas: las pruebas se limitan a cuatro voces (anastasia-1, ekaterina-1, valera-1, male-ru-cc-01). Con otras voces no se ha verificado la ausencia de respuestas vacias.
- Riesgo de alucinacion acustica: como todo modelo generativo de audio, puede producir pronunciaciones inventadas o ininteligibles ante terminos fuera del vocabulario entrenado, especialmente con siglas y nombres propios.
- Volumen de validacion limitado: 200 frases por voz y una unica ejecucion por metrica. Los intervalos de confianza no se reportan, lo que dificulta juzgar la significacion de las diferencias pequenas.
- Trazado de evaluacion sensible: dado que la ruta HF oculta las respuestas vacias mediante `min_new_tokens=2`, una evaluacion ingenua puede sobreestimar la estabilidad real del modelo.
- Madurez del ecosistema: 7 descargas y 0 likes en el momento de redactar esta ficha, con vLLM-Omni 0.24 como dependencia de produccion. Es un artefacto de investigacion, no un modelo con soporte consolidado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bitmanagerai/Qwen3TTS-SFT-v3.4-by-Nikita
- Modelo base: https://huggingface.co/bitmanagerai/Qwen3TTS-GRPO-v2
- Dataset de ajuste mencionado en la model card: bitmanagerai/gemini-tts-eqvanta (referencia textual; no se ha verificado su URL publica)
- No se han encontrado papers, repositorios de codigo, demos ni articulos tecnicos adicionales en la busqueda web realizada. Los resultados devueltos por la busqueda no guardan relacion con el modelo.
