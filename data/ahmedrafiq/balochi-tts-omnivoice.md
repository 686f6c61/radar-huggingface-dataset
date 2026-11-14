# AhmedRafiq/balochi-tts-omnivoice

## Resumen

Balochi TTS - OmniVoice es un adaptador LoRA de síntesis de voz (text-to-speech) para el idioma balochi, desarrollado por el usuario AhmedRafiq a partir del modelo base k2-fsa/OmniVoice. El repositorio contiene únicamente el adaptador LoRA y ficheros de configuración de soporte, no los pesos completos del modelo base, que deben descargarse por separado. El proyecto se centra en el dialecto balochi meridional (Southern Balochi) y se distribuye con el pipeline `text-to-speech` en formato safetensors.

La relevancia de esta publicación es acotada pero específica: el balochi es una lengua iraní con recursos digitales escasos, y las adaptaciones LoRA sobre modelos TTS multilingües existentes son una vía de bajo coste computacional para añadir cobertura de idiomas de bajos recursos sin reentrenar el modelo completo. El repositorio tiene un tamaño de 0,1 GB, coherente con un adaptador LoRA y sus ficheros auxiliares, y no registra descargas ni interacciones en el momento de la consulta.

No se dispone de información publicada sobre arquitectura interna del modelo base, número de parámetros del adaptador, composición del corpus de entrenamiento ni resultados de evaluación subjetiva u objetiva (MOS, WER) en la model card. Cualquier uso en producción requeriría una validación propia de la calidad de síntesis en balochi meridional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre k2-fsa/OmniVoice; arquitectura del base no especificada en la información) |
| Parámetros totales | no disponible (adaptador LoRA; el repo ocupa 0,1 GB) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | balochi meridional (Southern Balochi); lista formal de idiomas no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante LoRA (Low-Rank Adaptation) sobre el modelo base k2-fsa/OmniVoice, un sistema de text-to-speech. La información disponible no detalla la arquitectura interna de OmniVoice (si es un modelo acústico basado en transformer, un sistema de dos etapas con vocoder neuronal o un modelo de difusión), ni el rango y alpha del adaptador, ni las capas objetivo del ajuste. Tampoco se especifica si el adaptador se aplica solo al módulo acústico, al codificador de texto o a ambos.

En cuanto a los datos de entrenamiento, la model card indica únicamente que se usó un corpus de voz y texto en balochi, con dialecto balochi meridional. No se documenta el número de horas de audio, el número de hablantes, la proporción de habla espontánea frente a lectura, el número de tokens de texto, ni si se aplicaron técnicas de aumento de datos, normalización de texto o alineamiento forzado. Tampoco hay información sobre si el entrenamiento incluyó etapas de ajuste perceptual o evaluaciones de inteligibilidad.

## Capacidades

- Síntesis de voz a partir de texto en balochi meridional, mediante el adaptador LoRA sobre OmniVoice.
- Reutilización de las capacidades del modelo base OmniVoice para la generación acústica y la conversión a forma de onda, según la arquitectura del base (no detallada).
- Ajuste ligero y distribuible: al ser un adaptador LoRA, permite cargar el modelo base y aplicar el adaptador sin duplicar los pesos completos.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje conversacional).
- Capacidades multilingües: no documentadas; el ajuste está orientado a balochi meridional.
- Capacidades especiales (modo thinking, visión, audio de entrada): no disponible.

## Casos de uso

- Accesibilidad para hablantes de balochi: conversión de texto a voz para lectores de pantalla y aplicaciones de accesibilidad, aprovechando la cobertura de un idioma con pocos recursos TTS disponibles. Requiere verificar previamente la inteligibilidad con hablantes nativos.
- Locución de contenidos educativos: generación de audio para materiales escolares o cursos en balochi meridional, donde la disponibilidad de voces comerciales es limitada.
- Preservación lingüística y archivo: producción de audio de referencia a partir de textos transcritos en balochi, útil para proyectos de documentación de la lengua y para comparar con grabaciones de hablantes nativos.
- Avisos y anuncios institucionales: síntesis de mensajes cortos (avisos meteorológicos, sanitarios, administrativos) para difusión en zonas donde se habla balochi meridional, con revisión humana previa.
- Prototipado de asistentes de voz de bajo coste: integración del adaptador sobre OmniVoice en un pipeline TTS existente para experimentar con interfaces de voz en balochi sin entrenar un modelo desde cero.
- Investigación en TTS de bajos recursos: uso del adaptador como punto de partida o línea base en estudios sobre adaptación LoRA para lenguas iraníes con pocos datos, comparando estrategias de ajuste y corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo base k2-fsa/OmniVoice, cuyos requisitos no se detallan. El adaptador LoRA en sí ocupa 0,1 GB y añade un coste mínimo sobre el base.
- GPU recomendadas: no disponible. Al ser un adaptador sobre OmniVoice, los requisitos vendrán determinados por el modelo base; se recomienda consultar su model card.
- ¿Cabe en GPU de consumo? No disponible; a determinar según el tamaño y la cuantización del modelo base.
- Opciones de despliegue: no disponible. Al tratarse de un adaptador LoRA en safetensors, el despliegue requiere cargar el base OmniVoice y aplicar el adaptador con el framework compatible con dicho base (no especificado en la información).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma objetivo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AhmedRafiq/balochi-tts-omnivoice | Adaptador LoRA TTS | Balochi meridional | no disponible | no disponible | no disponible | Hugging Face (0 descargas) |
| k2-fsa/OmniVoice | Modelo TTS base | no disponible | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| Alternativas TTS específicas para balochi | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros sistemas TTS para balochi con los que establecer una comparación cuantitativa (MOS, WER, latencia). La comparación más directa es con el propio modelo base OmniVoice, pero la información proporcionada no incluye métricas de ninguno de los dos.

## Limitaciones y advertencias

- Ausencia de evaluación publicada: no hay métricas de calidad (MOS, inteligibilidad, similitud de hablante) ni comparación con grabaciones nativas; la calidad real en balochi meridional es desconocida.
- Datos de entrenamiento no documentados: se desconoce el volumen, la procedencia y la calidad del corpus, lo que impide evaluar riesgos de sobreajuste a pocos hablantes o de sesgo de dominio.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia tanto del adaptador como del modelo base k2-fsa/OmniVoice antes de cualquier despliegue en producción.
- Dependencia del modelo base: el adaptador no es autónomo; requiere descargar y ejecutar OmniVoice, cuyos requisitos de hardware y licencia condicionan el uso final.
- Cobertura dialectal limitada: el ajuste se declara para balochi meridional; el comportamiento en otras variedades del balochi no está documentado.
- Riesgo de pronunciación incorrecta en textos con préstamos, nombres propios o números, al no documentarse el tratamiento de normalización de texto.
- Repositorio sin adopción: cero descargas y cero interacciones en el momento de la consulta, lo que reduce la evidencia externa sobre su funcionamiento y mantenimiento.
- No apto como modelo de lenguaje: no soporta tool calling, agentes ni razonamiento; su uso se limita a la síntesis de voz.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AhmedRafiq/balochi-tts-omnivoice
- Modelo base: https://huggingface.co/k2-fsa/OmniVoice
