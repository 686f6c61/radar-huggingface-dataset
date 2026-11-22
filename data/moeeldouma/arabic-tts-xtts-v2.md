# Moeeldouma/arabic-tts-xtts-v2

## Resumen

Arabic TTS XTTS-v2 es un ajuste fino del modelo Coqui XTTS-v2 orientado a la sintesis de voz en arabe, con enfasis en el dialecto egipcio. Lo desarrolla el usuario Moeeldouma y se distribuye en Hugging Face bajo la licencia CPML heredada del modelo base. El objetivo declarado es mejorar la calidad de la sintesis en arabe frente al XTTS-v2 original, que soporta 17 idiomas pero rinde por debajo de lo deseable en arabe.

El modelo parte de la arquitectura XTTS-v2: un backbone GPT-2 de 370 millones de parametros que genera codigos de audio de forma autorregresiva, un vocoder HiFiGAN que los convierte en forma de onda a 24 kHz y un Perceiver Resampler para el condicionamiento por hablante. Sobre esa base, el autor aplica preprocesado especifico de arabe (diacritizacion, normalizacion de hamza), ajuste del tokenizador y afinado con el dataset MAdel121/arabic-egy-cleaned.

Es relevante porque el arabe es un idioma con una ortografia compleja y una enorme variacion dialectal, y las soluciones TTS abiertas de calidad para este idioma son escasas. El repositorio documenta un pipeline completo de mejora con evaluaciones antes/despues, aunque el modelo tiene un uso todavia muy limitado (40 descargas y 5 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XTTS-v2: backbone GPT-2 autorregresivo (30 capas, 1024 dimension oculta, 16 cabezas) + vocoder HiFiGAN + Perceiver Resampler para condicionamiento de hablante |
| Parametros totales | 370 millones (backbone GPT-2) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe (ar), con enfasis en dialecto egipcio |
| Licencia | CPML (Coqui Public Model License), https://coqui.ai/cpml |
| Formato de pesos | no disponible (repositorio PyTorch, 5.6 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de XTTS-v2, que combina tres componentes: un transformer GPT-2 de 370 millones de parametros que predice codigos de audio discretos de forma autorregresiva; un vocoder HiFiGAN que decodifica esos codigos en audio a 24 kHz; y un Perceiver Resampler que extrae un embedding de hablante a partir de audio de referencia, lo que permite clonacion de voz con pocos segundos de muestra. El texto y el audio de referencia se procesan por rutas separadas y se combinan en el transformer.

El ajuste fino se realizo sobre el dataset MAdel121/arabic-egy-cleaned, con un pipeline documentado en ocho fases que incluye evaluacion del baseline, correcciones de compatibilidad, preprocesado de texto arabe (diacritizacion y normalizacion de hamza), optimizacion del tokenizador multilingue compartido, ajuste de parametros de inferencia para la prosodia arabe y un postprocesado con control de pausas y silencios. El autor menciona el uso de ECAPA-TDNN y clustering aglomerativo para identificar hablantes en datos sin etiquetar (103.000 clips, de los que se extrajeron 5.000 del mismo hablante) y verificacion de alineamiento con Whisper. No se detallan el numero de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Sintesis de voz (text-to-speech) en arabe, con foco en el dialecto egipcio.
- Clonacion de voz zero-shot a partir de audio de referencia, gracias al Perceiver Resampler.
- Generacion de audio a 24 kHz mediante vocoder HiFiGAN.
- Preprocesado de texto arabe integrado: diacritizacion (tashkeel) y normalizacion de hamza.
- Postprocesado de audio con control de pausas y gestion de silencios orientado a la prosodia arabe.
- Soporte potencial de otros dialectos arabes (sudanes, golfo, levantino, norteafricano, arabe estandar moderno) mediante ajuste fino adicional, segun los objetivos declarados por el autor.
- No se documentan capacidades de tool calling, agentes, vision ni audio de entrada mas alla de la referencia de hablante.

## Casos de uso

- Audiolibros y locucion en arabe egipcio: el modelo genera voz sintetica a partir de texto con prosodia adaptada al dialecto, adecuado para narracion larga donde se necesita consistencia de voz mediante la clonacion con audio de referencia.
- Asistentes de voz para telefonia: integrable en menus IVR y atencion telefonica en arabe, con control de pausas y silencios que mejora la inteligibilidad en canales de baja calidad.
- Doblaje y contenido audiovisual: clonacion de voz para generar versiones en arabe de videos o podcasts manteniendo el timbre del locutor original.
- Accesibilidad: lectura de textos para personas con discapacidad visual en arabe, con salida a 24 kHz y preprocesado que maneja la ortografia arabe correctamente.
- Prototipado de productos de voz: el pipeline reproducible y las herramientas de preprocesado permiten a equipos de investigacion adaptar el modelo a otros dialectos arabes con datos propios.
- Investigacion en TTS arabe: el repositorio documenta benchmarks antes/despues (MOS, RTF, SNR) y sirve como base reproducible para comparar mejoras en sintesis arabe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que el proyecto incluye benchmarks cuantitativos (MOS, RTF, SNR) en cada fase, pero no se proporcionan los valores numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 5.6 GB, lo que sugiere que el checkpoint completo en precision original requiere al menos ese orden de memoria.
- GPU recomendadas: no especificadas en la informacion disponible.
- Cabe en GPU consumer: no confirmado; por el tamano del backbone (370 millones de parametros) es plausible en GPUs consumer con VRAM suficiente, pero no se aporta dato verificado.
- Opciones de despliegue: el modelo se distribuye como repositorio PyTorch y se usa con la libreria Coqui TTS (https://github.com/coqui-ai/TTS); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Clonacion de voz | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arabic TTS XTTS-v2 (este modelo) | 370 M (backbone) | Arabe (egipcio) | Si (zero-shot) | CPML | Hugging Face |
| Coqui XTTS-v2 (base) | 370 M (backbone) | 17 idiomas | Si (zero-shot) | CPML | Hugging Face / GitHub |
| Otros TTS arabes abiertos | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con alternativas especificas de TTS arabe no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo se centra en arabe egipcio; el rendimiento en otros dialectos no esta verificado y requeriria ajuste fino adicional.
- No se han publicado metricas cuantitativas (MOS, RTF, SNR) en la informacion disponible, por lo que la mejora frente al XTTS-v2 base no puede validarse con datos.
- Riesgo de alucinacion y artefactos en la sintesis: como todo modelo generativo de audio, puede producir pronunciaciones incorrectas, prosodia antinatural o ruido, especialmente en textos con ortografia ambigua o sin diacritizar.
- Licencia CPML: impone restricciones de uso comercial; es necesario revisar los terminos en https://coqui.ai/cpml antes de desplegar en produccion.
- Sesgos: al entrenarse con un dataset concreto (arabic-egy-cleaned), puede reproducir sesgos de hablante, genero y dialecto presentes en los datos.
- El proyecto tiene una adopcion muy baja (40 descargas, 5 likes), lo que limita la validacion por parte de la comunidad.
- No se documentan requisitos de hardware ni latencias, lo que dificulta planificar un despliegue en produccion.
- El modelo card incluye enlaces promocionales a un servicio externo (ZolVoice) que no forman parte del modelo; conviene tratarlos con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Moeeldouma/arabic-tts-xtts-v2
- Modelo base Coqui XTTS-v2: https://huggingface.co/coqui/XTTS-v2
- Repositorio Coqui TTS: https://github.com/coqui-ai/TTS
- Licencia CPML: https://coqui.ai/cpml
- Dataset de entrenamiento: https://huggingface.co/datasets/MAdel121/arabic-egy-cleaned
