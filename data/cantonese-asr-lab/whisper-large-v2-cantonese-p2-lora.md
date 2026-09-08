# cantonese-asr-lab/whisper-large-v2-cantonese-p2-lora

## Resumen

Este modelo es un adaptador LoRA sobre `openai/whisper-large-v2` especializado en reconocimiento automático de voz (ASR) en cantonés. Lo desarrolla el laboratorio `cantonese-asr-lab` como parte del proyecto [Vanxun-Hank/cantonese-asr](https://github.com/Vanxun-Hank/cantonese-asr), en la ronda `raw_winner_p2_full_v1`. El problema que resuelve es la transcripción precisa de audio en cantonés, un idioma con escasos recursos, aprovechando un modelo base ya entrenado y afinando únicamente el 0,254 % de sus parámetros mediante LoRA.

La arquitectura subyacente es el transformer encoder-decoder de Whisper Large v2 (1.550 millones de parámetros), sin cambios en el tokenizador ni en la arquitectura. El adaptador LoRA utiliza `r=8`, `alpha=16` y 192 módulos objetivo. La relevancia actual radica en que, en la superficie de evaluación pública del proyecto, este adaptador supera al full SFT del mismo modelo base y reduce el error de caracteres (CER) un 37 % respecto al sistema whisper-small anterior, entrenando menos del 0,3 % de los parámetros.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper Large v2 (transformer encoder-decoder) con adaptadores LoRA |
| Parametros totales | 1.550 millones (base) + adaptador LoRA (0,254 % del total, ~3,9 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio (ventana fija de Whisper) |
| Tipos de cuantizacion | no disponible (los adaptadores LoRA se distribuyen en safetensors; el modelo base admite cuantización estándar) |
| Idiomas soportados | cantonés (yue), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptadores LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Whisper Large v2, un transformer encoder-decoder con atención estándar y tokenizador basado en subpalabras. Los adaptadores se inyectan en 192 módulos del modelo base, dejando el resto de pesos congelados. Durante el entrenamiento, solo se actualizan los parámetros LoRA, lo que reduce drásticamente el coste computacional y el almacenamiento.

El entrenamiento se realizó sobre el dataset `external73`, compuesto por 23.304 utterances: 6.292 de datos oficiales, 8.451 de Common Voice zh-HK y 8.561 de MDCC. Se entrenaron 3 épocas (4.371 pasos) con tamaño de lote global 16 y dos semillas (42 y 43), en una GPU de 80 GB por brazo. No se aplicó RLHF ni DPO; es un ajuste fino supervisado estándar. La innovación técnica destacable es que, con solo el 0,254 % de parámetros entrenables, el modelo logra un mejor rendimiento en la superficie pública que el full SFT del mismo modelo base, siempre que se utilice la configuración de decodificación registrada (beam 2, `no_repeat_ngram_size=4`, `repetition_penalty=1.05`, `max_length=225`, early stopping, `language=zh`, `task=transcribe`).

## Capacidades

- Transcripción de audio en cantonés con salida en caracteres chinos (la referencia usa chino tradicional, aunque el evaluador convierte hipótesis a simplificado).
- Reconocimiento automático de voz en tarea de transcribe (no translate).
- Procesamiento de ventanas de audio de hasta 30 segundos, heredado de Whisper.
- Soporte de decodificación con beam search y parámetros de penalización para reducir repeticiones.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de ASR, no un modelo de lenguaje de propósito general.
- Capacidades multilingües limitadas: el adaptador está especializado en cantonés, con soporte secundario para chino como etiqueta de idioma.
- No cuenta con modo de pensamiento, visión ni generación de audio.

## Casos de uso

- Transcripción de reuniones y entrevistas en cantonés: el adaptador ofrece un CER de 0,051 en la superficie pública, lo que permite generar actas textuales fiables a partir de grabaciones de audio.
- Subtitulado automático de vídeos en cantonés: ideal para contenido audiovisual, ya que combina el rendimiento mejorado en cantonés con la capacidad de Whisper para procesar audio de 30 segundos por segmento.
- Accesibilidad para personas con discapacidad auditiva: puede integrarse en sistemas de transcripción en tiempo real o diferida para generar subtítulos de conversaciones.
- Análisis de llamadas de atención al cliente en cantonés: transcribe interacciones multi-turno para su posterior análisis de sentimiento o extracción de información, gracias a la baja tasa de error.
- Dictado profesional en cantonés: permite convertir notas de voz en texto para redactar informes o correos, con una precisión suficiente para uso profesional.
- Investigación lingüística y corpus: útil para transcribir grabaciones de campo o corpus de audio en cantonés, ya que el modelo fue entrenado con datos de Common Voice y MDCC, y su comportamiento es consistente en superficies fuera del dominio tras normalización.
- Pipeline de traducción: como etapa previa a la traducción automática, el modelo produce transcripciones en cantonés que pueden alimentar un sistema de traducción chino-inglés o chino-español.

## Benchmarks y rendimiento

Resultados en la superficie pública (1.900 utterances), con la configuración de decodificación registrada:

| Sistema | tol2 | CER |
|---|---:|---:|
| Este adaptador (seed 43) | 0,955263 | 0,050985 |
| Este adaptador (seed 42) | 0,951579 | 0,050719 |
| whisper-large-v2 full SFT (mismos datos) | 0,946842 / 0,945263 | 0,057436 / 0,055790 |
| whisper-small W500-adaptive (modelo de plataforma 69.49) | 0,894211 | 0,081328 |

Resultados en la superficie de validación (702 utterances):

| Sistema | tol2 | CER |
|---|---:|---:|
| Este adaptador | 0,877493 / 0,871795 | 0,079949 / 0,079628 |
| whisper-large-v2 full SFT | 0,894587 / 0,894587 | 0,068512 / 0,067657 |

En el panel fuera de dominio, tras normalizar la conversión de escritura, el adaptador alcanza un CER de 0,0638 / 0,0666. La model card advierte que las dos superficies (pública y validación) no coinciden sistemáticamente, y que el full SFT obtiene su margen en validación ajustando la partición de validación. Todos estos datos proceden de la model card del autor; no se han publicado resultados en la prueba oculta de la competición.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Whisper Large v2 en fp16 ocupa aproximadamente 3,1 GB de pesos; con los adaptadores LoRA y el estado de inferencia, se recomienda entre 6 y 8 GB de VRAM para procesar lotes pequeños. El pico de memoria durante el entrenamiento fue de 6,58 GB.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para inferencia con margen; A100 o H100 para entrenamiento o lotes grandes.
- Compatibilidad con GPU de consumo: sí, se puede ejecutar en GPUs con al menos 8 GB de VRAM (por ejemplo, RTX 2080 Ti, RTX 3080) usando fp16.
- Opciones de despliegue: `transformers` + `peft` en Python, tal como muestra el ejemplo de uso. También es posible exportar a ONNX Runtime, aunque no se menciona en la documentación. No se indica compatibilidad con vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | CER público | tol2 público | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (seed 43) | 1.550 M + LoRA 0,254 % | 0,050985 | 0,955263 | MIT | HuggingFace |
| whisper-large-v2 full SFT | 1.550 M | 0,057436 | 0,946842 | MIT (Whisper) | No publicado como modelo independiente en la info |
| whisper-small W500-adaptive | ~244 M | 0,081328 | 0,894211 | no disponible | Mencionado en la model card como modelo de plataforma |

Existen otros adaptadores de Whisper para cantonés en HuggingFace (por ejemplo, `simonl0909/whisper-large-v2-cantonese` o `Scrya/whisper-large-v2-cantonese`), pero no se dispone de datos de rendimiento comparables en la información proporcionada.

## Limitaciones y advertencias

- No se ha validado en el conjunto de prueba oculto de la competición; todos los números proceden de superficies propias del proyecto. La prueba oculta tiene 200 utterances, con un ruido de aproximadamente ±3,3 puntos porcentuales en tol2.
- El modelo tiene 6 veces más parámetros que el sistema whisper-small al que mejora. Si existen restricciones de latencia o memoria, la relación coste-beneficio puede no ser favorable.
- El error residual se compone de un 70,8 % de sustituciones, con una distribución de cola larga, y aproximadamente un 90 % de esos errores se comparte con un modelo whisper-small entrenado con los mismos datos. Añadir más parámetros no parece ser la palanca para reducirlo.
- Los resultados publicados dependen de la configuración de decodificación registrada. La decodificación greedy o con beam-1 no reproduce las métricas mostradas.
- La versión de `transformers` está fijada en 4.57.6; la versión 5.x cambia los resultados de forma medible, por lo que cualquier comparación debe respetar ese pin.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos de cantonés de fuentes como Common Voice y MDCC, puede presentar sesgos hacia acentos o variedades dialectales concretas.
- Whisper puede alucinar en segmentos de silencio o audio ruidoso; no se aportan datos específicos para este adaptador.
- La ventana de contexto está limitada a 30 segundos de audio; para audios más largos es necesario segmentar la entrada.
- La licencia MIT permite uso comercial, pero hay que verificar también la licencia del modelo base `openai/whisper-large-v2`.

## Enlaces

- HuggingFace: [https://huggingface.co/cantonese-asr-lab/whisper-large-v2-cantonese-p2-lora](https://huggingface.co/cantonese-asr-lab/whisper-large-v2-cantonese-p2-lora)
- GitHub del proyecto: [https://github.com/Vanxun-Hank/cantonese-asr](https://github.com/Vanxun-Hank/cantonese-asr)
- Informe de la ronda: [https://github.com/Vanxun-Hank/cantonese-asr/blob/codex/raw-winner-p2-full/reports/raw_winner_p2_full_converged.md](https://github.com/Vanxun-Hank/cantonese-asr/blob/codex/raw-winner-p2-full/reports/raw_winner_p2_full_converged.md)
- Modelo base: [https://huggingface.co/openai/whisper-large-v2](https://huggingface.co/openai/whisper-large-v2)
