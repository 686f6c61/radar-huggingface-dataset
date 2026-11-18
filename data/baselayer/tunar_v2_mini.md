# BaseLayer/TUNAR_v2_mini

## Resumen

TUNAR_v2_mini es un modelo de reconocimiento automatico del habla (ASR) especializado en uzbek, desarrollado por BaseLayer. Se trata de un ajuste fino (fine-tuning) del modelo Moonshine-tiny de moonshine-ai, una arquitectura compacta de transcripcion de audio disenada para inferencia eficiente en dispositivos con recursos limitados. Con 18,8 millones de parametros y un tamano de repositorio de 0,1 GB, el modelo esta pensado para despliegues ligeros donde el coste computacional y la latencia son criticos.

La relevancia de este modelo radica en su especializacion linguistica: el uzbek es un idioma con escasa representacion en los grandes sistemas ASR multilingues, y TUNAR_v2_mini ofrece una alternativa dedicada que emplea el nuevo alfabeto latino uzbeko (con caracteres como `ö`, `ğ`, `ş`, `ç`) y un tokenizador BPE propio de 4096 tokens, distinto del original de Moonshine. El modelo procesa audio mono a 16 kHz en segmentos de hasta aproximadamente 30 segundos y reporta un WER de validacion del 25,30% con decodificacion greedy.

Al estar construido sobre Moonshine-tiny, hereda la filosofia de diseno de esta familia: un encoder-decoder tipo transformer optimizado para audio de duracion variable, sin necesidad de relleno a ventanas fijas. Esto lo hace adecuado para transcripcion en tiempo real o cuasi real en entornos con GPU modestas o incluso CPU, aunque con las limitaciones propias de un modelo de este tamano en cuanto a precision y robustez ante ruido o acentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Moonshine) |
| Parametros totales | 18.835.200 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | segmentos de audio de hasta ~30 s (aprox. 12 tokens de salida por segundo de audio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | uzbek (uz) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Moonshine-tiny, una arquitectura encoder-decoder de tipo transformer disenada especificamente para ASR. A diferencia de Whisper, que fuerza el audio a ventanas fijas de 30 segundos con relleno, Moonshine procesa la longitud real del audio, lo que reduce el coste computacional en segmentos cortos. TUNAR_v2_mini conserva esta estructura y anade un tokenizador BPE personalizado de 4096 tokens adaptado al alfabeto latino uzbeko, sustituyendo el tokenizador original de Moonshine.

No se dispone de informacion detallada sobre el dataset de entrenamiento (numero de horas, composicion, procedencia de las grabaciones) ni sobre si se aplicaron tecnicas de aumento de datos, RLHF o ajuste con DPO. La model card unicamente indica que es un fine-tuning de Moonshine-tiny y reporta un WER de validacion del 25,30% con decodificacion greedy sobre un subconjunto de validacion no especificado. La innovacion principal es la adaptacion linguistica y ortografica al uzbeko con el nuevo alfabeto latino, incluyendo la conversion de digrafos (`o'` a `ö`, `g'` a `ğ`, `sh` a `ş`, `ch` a `ç`).

## Capacidades

- Transcripcion de voz a texto en uzbek con salida en el nuevo alfabeto latino uzbeko.
- Procesamiento de audio mono a 16 kHz en segmentos de hasta aproximadamente 30 segundos.
- Generacion de texto autoregresiva mediante `generate` con control de `max_new_tokens` proporcional a la duracion del audio.
- Integracion con la libreria `transformers` mediante `MoonshineForConditionalGeneration`, `AutoTokenizer` y `AutoFeatureExtractor`.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita su despliegue como servicio gestionado.
- No se documentan capacidades de tool calling, agentes, vision, audio multilingue ni modo de razonamiento (thinking).

## Casos de uso

- Transcripcion de reuniones y entrevistas en uzbek: el modelo puede convertir grabaciones de hasta 30 segundos por segmento en texto, permitiendo trocear audio largo y concatenar resultados con marcas temporales.
- Subtitulado automatico de contenido audiovisual uzbeko: su bajo coste computacional permite procesar lotes de video en servidores modestos, generando subtitulos en el alfabeto latino nuevo.
- Asistentes de voz para atencion al cliente en uzbek: al ser un modelo ligero, puede desplegarse en infraestructura de baja latencia para transcribir consultas de usuarios antes de pasarlas a un sistema de comprension.
- Digitalizacion de archivos orales y patrimonio cultural: transcripcion de grabaciones historicas o etnograficas en uzbek para su indexacion y busqueda textual.
- Herramientas de accesibilidad para hablantes de uzbek: conversion de voz a texto en aplicaciones de dictado o lectura de subtitulos en tiempo real.
- Preprocesamiento para pipelines de NLP en uzbek: generar transcripciones que alimenten modelos de resumen, traduccion o analisis de sentimiento donde el uzbek carece de datos textuales.
- Investigacion linguistica: analisis de corpus orales en uzbek con un modelo especializado y de codigo abierto para estudios foneticos o lexicos.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| WER de validacion | 25,30% | Decodificacion greedy, subconjunto de validacion no especificado |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K no aplican a ASR) ni datos de WER frente a Whisper, Moonshine original u otros sistemas ASR en uzbek en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (18,8 M de parametros, ~75 MB en fp32); en la practica, el consumo dominante es el del feature extractor y las activaciones, por lo que cabe holgadamente en cualquier GPU.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, GTX 1660) e incluso CPU para inferencia en tiempo cuasi real.
- Cabe en GPU consumer: si, en practicamente todas, incluidas integradas con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (referencia oficial), `endpoints_compatible` para despliegue gestionado; no se documenta soporte explicito para vLLM, llama.cpp, Ollama o TGI (son frameworks orientados a LLM, no a este tipo de ASR).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia muy baja, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | WER reportado |
|---|---|---|---|---|---|
| TUNAR_v2_mini | 18,8 M | ~30 s por segmento | uzbek | no disponible | 25,30% (validacion) |
| moonshine-ai/moonshine-tiny | no disponible | ~30 s por segmento | ingles (principal) | no disponible | no disponible |
| Whisper tiny | 39 M | 30 s fijos | multilingue (99 idiomas) | MIT | no disponible para uzbek |
| Whisper small | 244 M | 30 s fijos | multilingue (99 idiomas) | MIT | no disponible para uzbek |

La comparativa se limita a caracteristicas estructurales, ya que no se han publicado WER comparables en uzbek para los modelos alternativos en la informacion disponible. TUNAR_v2_mini es aproximadamente la mitad de pequeno que Whisper tiny y un orden de magnitud menor que Whisper small, lo que lo posiciona como la opcion mas ligera de la tabla, a costa de estar especializado en un unico idioma.

## Limitaciones y advertencias

- El WER de validacion del 25,30% es relativamente alto; en produccion con audio ruidoso, acentos o vocabulario tecnico el error puede ser mayor.
- Entrenado exclusivamente para uzbek; no soporta otros idiomas ni code-switching documentado.
- Limite de aproximadamente 30 segundos por segmento de audio; requiere troceado para grabaciones largas.
- El tokenizador es personalizado (4096 tokens BPE) y no compatible con el original de Moonshine; hay que cargar el tokenizador del repositorio, no el del modelo base.
- La salida usa el nuevo alfabeto latino uzbeko con caracteres especiales (`ö`, `ğ`, `ş`, `ç`); los consumidores deben manejar correctamente la codificacion UTF-8 y, si procede, convertir a la ortografia antigua.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar con el autor antes de desplegar en produccion.
- Riesgo de alucinacion y de inserciones erroneas en audio silencioso o con musica de fondo, comun en modelos ASR pequenos.
- Sin informacion sobre sesgos demograficos o dialectales dentro del uzbek; la cobertura de variedades regionales es desconocida.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria ni evidencia de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BaseLayer/TUNAR_v2_mini
- Modelo base Moonshine-tiny: https://huggingface.co/moonshine-ai/moonshine-tiny
- Repositorio Moonshine (GitHub): https://github.com/usefulsensors/moonshine
- Paper de Moonshine: https://arxiv.org/abs/2410.15608
