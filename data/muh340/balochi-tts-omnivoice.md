# Muh340/balochi-tts-omnivoice

## Resumen

Balochi TTS - OmniVoice es un adaptador LoRA de ajuste fino para síntesis de voz (text-to-speech) en balochi, desarrollado por el usuario Muh340 a partir del modelo base k2-fsa/OmniVoice. El repositorio contiene únicamente el adaptador LoRA y los ficheros de configuración asociados, no los pesos completos del modelo base, que deben descargarse por separado. El objetivo es dotar a un modelo TTS generalista de capacidad de síntesis en balochi meridional (Southern Balochi), una lengua irania minoritaria con escasa representación en herramientas de voz.

El modelo es relevante por su carácter de recurso lingüístico para una lengua de bajos recursos: los adaptadores LoRA permiten especializar un TTS multilingüe con un coste de entrenamiento y almacenamiento reducido (el repositorio ocupa aproximadamente 0,1 GB). No obstante, la información publicada es muy escasa: no se detallan el número de horas de audio, la composición del corpus, los parámetros de entrenamiento ni métricas de evaluación, y la licencia no está especificada.

Dado que el adaptador se publica sin documentación técnica sobre el proceso de ajuste ni resultados de calidad, debe considerarse un artefacto experimental. Para producción sería necesario validar la inteligibilidad, la naturalidad y la cobertura dialectal con hablantes nativos antes de cualquier despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre k2-fsa/OmniVoice; la arquitectura del modelo base no se detalla en la información proporcionada) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | balochi (dialecto meridional, según la model card); no se detalla cobertura adicional |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) ajustado sobre el modelo base k2-fsa/OmniVoice, un sistema de text-to-speech. La técnica LoRA congela los pesos del modelo original e introduce matrices de bajo rango entrenables en determinadas capas, lo que reduce drásticamente el número de parámetros a optimizar y el tamaño del artefacto resultante (0,1 GB en este repositorio). El adaptador debe cargarse junto con el modelo base para su uso.

Según la model card, el entrenamiento se realizó con un corpus de voz y texto en balochi, concretamente del dialecto balochi meridional. No se especifican el volumen de datos (horas de audio o número de transcripciones), la calidad de las grabaciones, la proporción de hablantes, la estrategia de alineación texto-audio ni los hiperparámetros de entrenamiento. Tampoco se documenta si hubo etapas de ajuste adicionales ni procesos de evaluación subjetiva (MOS) o inteligibilidad.

## Capacidades

- Síntesis de voz (text-to-speech) en balochi meridional, heredando la arquitectura TTS del modelo base OmniVoice.
- Especialización dialectal mediante adaptador LoRA, lo que permite combinar el conocimiento general del modelo base con el ajuste al balochi.
- Carga modular: el adaptador puede aplicarse sobre k2-fsa/OmniVoice sin redistribuir los pesos completos.
- Capacidades adicionales del modelo base (multilingüismo, clonación de voz, control de prosodia, etc.): no disponibles en la información proporcionada.
- Soporte de tool calling, agentes o razonamiento multi-paso: no aplica (modelo de síntesis de voz).

## Casos de uso

- Accesibilidad para hablantes de balochi: conversión de texto escrito (noticias, documentos, interfaces) a audio para personas con discapacidad visual o dificultades de lectura, aprovechando el ajuste específico al dialecto meridional.
- Preservación lingüística: generación de material sonoro en balochi para archivos, diccionarios y recursos educativos de una lengua con escasa presencia digital.
- Locución automatizada de contenido local: lectura de boletines, avisos o artículos en medios comunitarios balochi, reduciendo la dependencia de locutores humanos.
- Integración en asistentes de voz de dominio restringido: respuestas habladas en balochi dentro de aplicaciones de información (tiempo, tráfico, servicios locales), siempre que se valide la inteligibilidad del adaptador.
- Investigación en TTS de bajos recursos: punto de partida para experimentos de ajuste fino con LoRA en lenguas minoritarias, comparando estrategias de adaptación sobre un TTS multilingüe.
- Prototipado de interfaces de voz para educación: lectura de materiales didácticos en balochi meridional en aplicaciones de aprendizaje, tras una evaluación con hablantes nativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa aproximadamente 0,1 GB, por lo que el requisito real de VRAM lo determina el modelo base k2-fsa/OmniVoice, cuyas dimensiones no se detallan en la información proporcionada.
- GPU recomendadas: no disponible (depende del tamaño y la arquitectura del modelo base).
- Viabilidad en GPU de consumo: no disponible; debe comprobarse con las especificaciones del modelo base.
- Opciones de despliegue: no se documentan en el repositorio; al ser un adaptador sobre OmniVoice, el despliegue dependerá de las herramientas compatibles con dicho modelo base (no confirmadas en la información disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|
| Muh340/balochi-tts-omnivoice | Adaptador LoRA sobre TTS | Balochi meridional | no disponible | Hugging Face (0 descargas) |
| k2-fsa/OmniVoice | Modelo TTS base | no disponible | no disponible | Hugging Face |
| Alternativas TTS multilingües (p. ej. MMS-TTS, XTTS) | Modelos TTS completos | Multilingüe (cobertura variable) | variable según modelo | Hugging Face / repositorios públicos |

No se dispone de datos de rendimiento del adaptador que permitan una comparación cuantitativa con otras alternativas; la comparación se limita a aspectos de tipo, idioma y disponibilidad.

## Limitaciones y advertencias

- Documentación muy escasa: no se especifican datos de entrenamiento, hiperparámetros ni evaluación, lo que impide estimar la calidad real de la síntesis.
- Licencia no disponible: no puede confirmarse el uso comercial ni la redistribución; es imprescindible contactar con el autor antes de integrarlo en productos.
- Dependencia del modelo base: el adaptador no funciona de forma autónoma y hereda las limitaciones, la licencia y los requisitos de k2-fsa/OmniVoice.
- Cobertura dialectal limitada: entrenado para balochi meridional; el rendimiento en otras variedades del balochi no está documentado.
- Riesgo de pronunciación incorrecta y artefactos acústicos: sin métricas de inteligibilidad ni pruebas con hablantes nativos, es probable que existan errores en palabras poco frecuentes, nombres propios y números.
- Sesgos potenciales: el corpus de entrenamiento (hablantes, género, edad, región) no se describe, por lo que puede reproducir sesgos de representación en la voz generada.
- Sin garantías de producción: al tratarse de un repositorio con cero descargas y sin validación externa, debe considerarse experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Muh340/balochi-tts-omnivoice
- Modelo base k2-fsa/OmniVoice: https://huggingface.co/k2-fsa/OmniVoice
