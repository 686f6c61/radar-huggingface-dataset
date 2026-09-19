# dianavdavidson/whisper-medium_mucs_62901_ratio_alldata_lr_1e-4_lgid_None_hinglish_mixed_scripts_FT

## Resumen

El modelo `dianavdavidson/whisper-medium_mucs_62901_ratio_alldata_lr_1e-4_lgid_None_hinglish_mixed_scripts_FT` es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla (ASR) Whisper medium de OpenAI, publicado por el usuario dianavdavidson en HuggingFace. Por el nombre del repositorio se deduce que esta especializado en Hinglish (mezcla de hindi e ingles) y en transcripcion de "mixed scripts" (convivencia de grafia devanagari y latina), aunque esta interpretacion procede del propio identificador y no de documentacion oficial del autor.

El modelo cuenta con 763.857.920 parametros segun los pesos en safetensors, una cifra coherente con la arquitectura Whisper medium (aproximadamente 769 millones de parametros en su version original). El repositorio ocupa 27,5 GB, un tamano muy superior al de un unico checkpoint de inferencia en precision media, lo que sugiere que incluye artefactos de entrenamiento adicionales (multiples checkpoints u optimizador), aunque no hay documentacion que lo confirme.

La relevancia de este modelo reside en su nicho: el reconocimiento de voz con cambio de codigo (code-switching) hindi-ingles es un problema notoriamente dificil para los sistemas ASR genericos. No obstante, la ficha carece de informacion publicada sobre licencia, idiomas declarados, pipeline o resultados de evaluacion, por lo que debe tratarse como un experimento de investigacion mas que como un recurso listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (base: Whisper medium); detalles del ajuste fino no disponibles |
| Parametros totales | 763.857.920 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Whisper procesa segmentos de audio de 30 s por ventana en su version original) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors; no se declaran variantes GGUF, int8 ni int4) |
| Idiomas soportados | no disponible (el identificador sugiere Hinglish, no confirmado por el autor) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper medium: un transformer de tipo encoder-decoder que convierte espectrogramas mel de audio en texto, con atencion estandar y sin mecanismos de atencion lineal ni estado recurrente (no es un modelo SSM ni hibrido). El modelo base Whisper medium fue entrenado por OpenAI sobre un corpus multilingue de gran escala de audio etiquetado y pseudoetiquetado, e incorpora tareas auxiliares como deteccion de idioma, transcripcion y traduccion al ingles.

Respecto al ajuste fino concreto de este repositorio, no se dispone de informacion publicada sobre el numero de tokens, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El identificador del modelo apunta a los siguientes hiperparametros y caracteristicas: dataset "MUCS 62901", ratio "alldata", learning rate 1e-4, "lgid" desactivado (probablemente sin condicionamiento explicito de identificacion de idioma) y entrenamiento orientado a "hinglish_mixed_scripts", es decir, texto que alterna grafia latina y devanagari. Todo ello son inferencias a partir del nombre, no datos confirmados.

## Capacidades

- Transcripcion automatica del habla (ASR) con la arquitectura encoder-decoder de Whisper medium.
- Presunta especializacion en audio con cambio de codigo hindi-ingles (Hinglish), segun el identificador del repositorio.
- Presunta capacidad de generar transcripciones con grafia mixta (devanagari y latina), segun la etiqueta "mixed_scripts".
- Soporte de tool calling / function calling: no aplicable a un modelo ASR puro; no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplicable; no disponible.
- Capacidades multilingues: no confirmadas; el autor no declara lista de idiomas.
- Capacidades especiales (modo thinking, vision, audio): solo entrada de audio y salida de texto, herencia de Whisper medium; sin confirmacion de variantes adicionales.

## Casos de uso

- Transcripcion de podcasts y entrevistas en Hinglish: el modelo podria emplearse para convertir audio con alternancia hindi-ingles en texto, un escenario donde los ASR genericos suelen fallar por el cambio de codigo; requiere validacion manual al no haber benchmarks publicados.
- Subtitulado de contenido audiovisual indio: generacion de subtitulos para videos donde los hablantes mezclan frases en hindi y en ingles, aprovechando la aparente especializacion en scripts mixtos.
- Analisis de conversaciones de atencion al cliente en India: transcripcion de llamadas bilingues para su posterior analisis de calidad o cumplimiento, si la calidad del ajuste se confirma en pruebas propias.
- Investigacion en ASR con code-switching: uso como punto de partida o comparativa en estudios academicos sobre modelos especializados en Hinglish, dado su caracter experimental.
- Preprocesado de datos para entrenamiento de otros modelos: generacion de transcripciones sobre audio Hinglish para construir datasets etiquetados, siempre con revision humana.
- Prototipado rapido de aplicaciones de voz en hindi-ingles: integracion en demos o pruebas de concepto donde se prioriza la especializacion linguistica sobre la garantia de soporte comercial.
- Transcripcion de reuniones internas con equipos indios: conversion de audio a actas cuando los participantes alternan idiomas, supeditado a una evaluacion previa de precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de WER (word error rate), MMLU, HumanEval ni metricas equivalentes, ni comparaciones con otros modelos. No se deben asumir cifras de rendimiento sin una evaluacion propia sobre un conjunto de validacion representativo de Hinglish.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, los 763,8 M de parametros ocupan aproximadamente 1,5 GB de pesos; con activaciones y buffers de atencion, el consumo realista se situa en torno a 2-3 GB.
- En fp32, los pesos ocuparian aproximadamente 3,1 GB, con un consumo total de inferencia de unos 4-5 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM, como una NVIDIA RTX 3060, RTX 4060 o superiores; tambien es valido en A100, H100, L4 o T4 para despliegues en servidor.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 6 GB o mas de VRAM, e incluso en CPU mediante optimizaciones.
- Opciones de despliegue: HuggingFace Transformers, faster-whisper (CTranslate2), whisper.cpp, OpenAI Whisper y, con conversion previa, servidores de inferencia compatibles con ONNX.
- Latencia y throughput estimados: no disponible; dependerian de la GPU, del backend y del uso de cuantizacion, y no hay mediciones publicadas para este ajuste concreto.
- Nota sobre el tamano del repositorio: los 27,5 GB del repo no son indicativos del peso de inferencia, sino que probablemente reflejan artefactos de entrenamiento adicionales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (whisper-medium, ajuste Hinglish) | 763,8 M | no disponible (base: ventanas de 30 s de audio) | no disponible | no disponible | HuggingFace, 44 descargas |
| Whisper medium (OpenAI, base) | ~769 M | ventanas de 30 s de audio | ampliamente documentado por OpenAI (WER publicados por idioma) | MIT (version original) | HuggingFace, ampliamente distribuido |
| Whisper large-v3 (OpenAI) | ~1.550 M | ventanas de 30 s de audio | mejor WER general que medium, pero sin especializacion en Hinglish | MIT (version original) | HuggingFace, ampliamente distribuido |

No se dispone de datos de rendimiento de este ajuste que permitan una comparacion cuantitativa con alternativas. La comparativa se limita a parametros y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card descriptiva, ni licencia, ni idiomas declarados, ni pipeline especificado.
- Licencia no disponible: no puede confirmarse el uso comercial; en ausencia de licencia explicita debe asumirse que los derechos no estan claros.
- Riesgo de alucinacion: como cualquier modelo basado en Whisper, puede generar texto plausible que no corresponde al audio, especialmente en segmentos con ruido o silencios.
- Sesgos potenciales: al ser un ajuste fino sobre un dataset concreto (identificado como MUCS 62901), puede heredar los sesgos de ese corpus en cuanto a acentos, dialectos, genero o registro.
- Limitaciones de idioma no evaluadas: no hay evidencia publicada de su comportamiento fuera del Hinglish ni de su cobertura real de variedades del hindi.
- Especializacion estrecha: su posible ventaja en Hinglish puede traducirse en degradacion frente a Whisper medium o large-v3 en otros idiomas o en audio puramente ingles.
- Sin benchmarks: imposible estimar el WER real sin evaluacion propia; no debe desplegarse en produccion sin validacion sobre datos representativos.
- Repositorio de gran tamano (27,5 GB): la descarga es costosa y puede incluir checkpoints intermedios no necesarios para inferencia.
- Madurez y adopcion muy bajas (44 descargas, 0 likes): no hay comunidad que haya validado su funcionamiento.
- Nota sobre la busqueda web: los resultados devueltos no guardan relacion con el modelo (contenido biografico de William Shatner), por lo que no aportan informacion tecnica utilizable.

## Enlaces

- HuggingFace: https://huggingface.co/dianavdavidson/whisper-medium_mucs_62901_ratio_alldata_lr_1e-4_lgid_None_hinglish_mixed_scripts_FT
- No se han encontrado papers, blogs, repositorios ni demos relevantes en la busqueda web. Los resultados obtenidos eran ajenos al modelo y se han descartado.
