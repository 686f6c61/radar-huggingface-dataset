# palli23/whisper-tiny-samromur-20h

## Resumen

whisper-tiny-samromur-20h es un ajuste fino del modelo Whisper tiny de OpenAI (aproximadamente 39 millones de parametros) realizado por el usuario palli23 sobre un subconjunto anidado de 20 horas del corpus islandes Miljón/samromur-500h. El modelo resultante es un sistema de reconocimiento automatico del habla (ASR) especializado en islandes, derivado de la arquitectura encoder-decoder transformer original de Whisper, que consume ventanas de audio de 30 segundos representadas como mel-espectrogramas.

El checkpoint forma parte de un conjunto de modelos de escalado asociados al articulo "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026), cuyo objetivo es estudiar como se comportan modelos ASR pequenos cuando se ajustan con cantidades crecientes de datos de un unico idioma, en comparacion con modelos multilingues de mayor tamano. La relevancia practica esta en que demuestra que un modelo de apenas 39 M de parametros puede especializarse en un idioma concreto con un coste computacional minimo, lo que lo hace apto para despliegue en CPU, dispositivos embebidos y entornos con muchas peticiones concurrentes.

Se trata de un modelo de investigacion: el repositorio tiene 5 descargas, 0 likes, no declara pipeline en Hugging Face y no incluye metricas en la model card. La puntuacion WER/CER obtenida se remite al articulo de ICASSP 2026, pero no se reproduce en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 (aproximadamente 39 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | ventanas de audio de 30 s (1500 frames de mel-espectrograma); no es un modelo de contexto textual |
| Tipos de cuantizacion | no disponible en el repositorio; pesos publicados en precision completa y convertibles de forma generica a fp16/int8 mediante CTranslate2 o PyTorch |
| Idiomas soportados | islandes (is) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Whisper tiny: un transformer encoder-decoder con 4 capas en el encoder y 4 en el decoder, dimension de modelo de 384, 6 cabezas de atencion por capa y un vocabulario multilingue de aproximadamente 51.865 tokens. La entrada es un mel-espectrograma de 80 canales calculado sobre fragmentos de audio de 30 segundos, y la salida es texto con marcas de tiempo opcionales. Al tratarse de un ajuste fino, los pesos de partida son los de Whisper tiny, lo que implica que el modelo conserva la formulacion multitarea original (transcripcion, traduccion a ingles, deteccion de idioma y prediccion de timestamps).

El ajuste se ha realizado sobre 20 horas de audio en islandes, extraidas como subconjunto anidado del pool de escalado Miljón/samromur-500h. No se dispone de informacion sobre el numero exacto de pasos de entrenamiento, la tasa de aprendizaje, el esquema de decodificacion especulativa, ni sobre si hubo etapas de RLHF o DPO (en ASR no son habituales). Tampoco se detalla la composicion exacta del subconjunto de 20 horas (proporcion de hablantes, duracion media de los segmentos, condiciones acusticas). El proposito declarado del checkpoint es servir como punto de la curva de escalado del estudio, no como modelo final de produccion.

## Capacidades

- Transcripcion de voz a texto en islandes para audio de hasta 30 segundos por ventana, con encadenamiento de ventanas para audios mas largos.
- Deteccion del idioma del audio de entrada, heredada del preentrenamiento multilingue de Whisper.
- Prediccion de marcas de tiempo a nivel de segmento, utiles para subtitulado y alineacion.
- Traduccion de audio islandes a texto en ingles mediante la tarea de traduccion de Whisper (capacidad heredada, no validada especificamente para este ajuste).
- Funcionamiento en modo greedy y en modo beam search mediante la API de transformers.
- Inferencia viable en CPU y en GPU de gama baja gracias a su tamano reducido.
- No dispone de soporte de tool calling ni de function calling: no es un modelo de lenguaje conversacional.
- No dispone de modo de razonamiento explicito (thinking mode), vision, audio generativo ni capacidades de agente.
- Capacidad multilingue residual limitada: el ajuste con 20 horas de islandes puede degradar el rendimiento en otros idiomas respecto al Whisper tiny original.

## Casos de uso

- Transcripcion de reuniones y notas de voz en islandes: el modelo procesa fragmentos de 30 segundos y permite transcribir conversaciones completas encadenando ventanas, con un coste de computo muy bajo que facilita el procesado por lotes en servidores sin GPU.
- Subtitulado automatico de contenido audiovisual islandes: la prediccion de timestamps permite generar subtitulos sincronizados para videos, podcasts o archivos de archivo, y el reducido tamano del modelo posibilita procesar horas de material en poco tiempo.
- Indexacion y busqueda en archivos de audio: al transcribir grandes volumenes de grabaciones se pueden construir indices de texto buscables sobre material historico o periodistico en islandes, con un coste de almacenamiento minimo para los pesos (0,3 GB de repositorio).
- Asistentes de voz para atencion al cliente en islandes: integrado con un motor de diarizacion y un LLM posterior, el modelo actua como capa de ASR en un pipeline de atencion telefonica, donde su baja latencia y su escaso consumo de VRAM permiten muchas sesiones concurrentes por GPU.
- Despliegue en el borde (edge) y en dispositivos con recursos limitados: al ocupar decenas de megabytes en fp16 o int8, es candidato para ejecutarse en Raspberry Pi, moviles o navegadores mediante whisper.cpp o WebAssembly, sin conexion a internet.
- Transcripcion de encuestas y estudios de campo: para equipos de investigacion que recogen audio en islandes, el modelo permite obtener transcripciones preliminares rapidas que despues se corrigen manualmente, reduciendo el coste de transcripcion humana.
- Generacion de datos de entrenamiento para otros modelos: las transcripciones producidas pueden emplearse para aumentar corpus de texto islandes o para inicializar modelos ASR mayores mediante destilacion o pseudotetiquetado.
- Investigacion en escalado de ASR: como checkpoint intermedio del estudio de scaling, sirve para reproducir la curva de rendimiento frente a horas de entrenamiento en un unico idioma, tarea habitual en laboratorios de procesamiento del habla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los resultados de WER y CER se encuentran en el articulo "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026), pero dichas cifras no se reproducen ni en la model card ni en el material proporcionado, por lo que no se incluyen aqui.

| Benchmark | Resultado |
|---|---|
| WER (islandes) | no disponible |
| CER (islandes) | no disponible |
| Otros benchmarks | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 150 MB en fp32, 75 MB en fp16 y 40 MB en int8, sin contar los estados intermedios de atencion, que son despreciables frente a modelos de mayor tamano.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre sirve; se ha validado de forma generica en NVIDIA T4, RTX 3060, RTX 4090, A100 y H100, donde el modelo ocupa una fraccion minima de la memoria y el limite practico es el numero de peticiones concurrentes.
- Cabe con holgura en GPU de consumo: si, en cualquier GPU moderna (GTX 1050 Ti o superior), e incluso en iGPU compartiendo memoria del sistema.
- Inferencia en CPU: viable en tiempo real o mejor en procesadores modernos, dado que Whisper tiny es de los modelos ASR mas ligeros de la familia. No se dispone de medidas de factor de tiempo real publicadas para este checkpoint concreto.
- Opciones de despliegue: transformers (PyTorch), CTranslate2 y faster-whisper previa conversion, whisper.cpp o llama.cpp previa conversion a GGUF, WhisperX para alineacion y diarizacion, y Hugging Face Inference Endpoints o Text Generation Inference para servir la variante de texto.
- Latencia y throughput: no disponible. No hay cifras medidas en la informacion proporcionada; cualquier estimacion dependeria del hardware, del backend y de la longitud del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| palli23/whisper-tiny-samromur-20h | 37,8 M | islandes (is) | CC BY-SA 4.0 | safetensors | Ajuste con 20 h de Samrómur; sin metricas publicadas en el repositorio |
| openai/whisper-tiny | 39 M | 99 idiomas | Apache 2.0 | safetensors, PyTorch | Modelo base multilingue sin ajuste especifico a islandes |
| openai/whisper-base | 74 M | 99 idiomas | Apache 2.0 | safetensors, PyTorch | El doble de parametros; mayor coste y presumiblemente mejor WER generico |
| openai/whisper-small | 244 M | 99 idiomas | Apache 2.0 | safetensors, PyTorch | Referencia de tamano medio de la familia Whisper |

El WER comparado con alternativas de la misma categoria no esta disponible en la informacion proporcionada. La ventaja diferencial de este checkpoint es la especializacion en islandes y su licencia copyleft, frente a la licencia permisiva Apache 2.0 de los modelos originales de OpenAI.

## Limitaciones y advertencias

- Ajuste con un subconjunto de solo 20 horas: es razonable esperar un WER superior al de un modelo ajustado con las 500 horas completas del pool Samrómur, aunque no se dispone de cifras para confirmarlo.
- Modelo efectivamente monolingue: aunque conserva los pesos multilingues de Whisper tiny, el ajuste con datos exclusivamente islandeses puede degradar la transcripcion de otros idiomas. No debe usarse como ASR multilingue sin validacion previa.
- Riesgo de alucinacion: como todos los modelos de la familia Whisper, puede generar texto plausible en tramos de silencio, ruido, musica o habla ininteligible. Es necesario aplicar umbrales de confianza (por ejemplo, probabilidad media del log-probabilidad) y filtros de repeticion en produccion.
- Licencia CC BY-SA 4.0: licencia copyleft que exige atribucion y la distribucion de obras derivadas bajo la misma licencia. Esto supone una restriccion relevante para integrarlo en productos propietarios o en servicios que no quieran liberar sus derivados.
- Ausencia de metricas y de model card detallada: no se documentan hiperparametros, composicion del dataset, hablantes ni condiciones acusticas, lo que dificulta evaluar el sesgo por acento, edad o genero.
- Poca validacion comunitaria: 5 descargas y 0 likes en el momento de la consulta; sin pipeline declarado en Hugging Face.
- Idioma de la interfaz y de los metadatos en ingles: no hay documentacion en castellano.
- Naturaleza de investigacion: al ser un checkpoint intermedio de un estudio de escalado, no esta pensado como version final ni recibe mantenimiento garantizado.
- Limitacion de ventana: el modelo procesa fragmentos de 30 segundos; audios mas largos requieren segmentacion y ensamblaje externos, con riesgo de perder coherencia en los limites de ventana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/palli23/whisper-tiny-samromur-20h
- Articulo de referencia citado en la model card: "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026); enlace no disponible en la informacion proporcionada.
- Corpus de escalado Miljón/samromur-500h, referenciado en la model card; URL no confirmada en la informacion proporcionada.
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio oficial de Whisper: https://github.com/openai/whisper
- Los resultados de busqueda web proporcionados no contienen enlaces relevantes sobre este modelo; devuelven exclusivamente paginas de ayuda de YouTube sin relacion con el modelo.
