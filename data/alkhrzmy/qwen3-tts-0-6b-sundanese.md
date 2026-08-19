# alkhrzmy/qwen3-tts-0.6b-sundanese

## Resumen

El modelo `alkhrzmy/qwen3-tts-0.6b-sundanese` es un ajuste fino (fine-tuning) del modelo base `Qwen/Qwen3-TTS-12Hz-0.6B-Base` especializado en síntesis de voz en idioma sundanés (su), una lengua austronesia hablada principalmente en la región occidental de la isla de Java, Indonesia. El desarrollo corre a cargo del autor `alkhrzmy`, que ha utilizado el conjunto de datos OpenSLR SLR44, derivado de Mozilla Common Voice, limitándose a las grabaciones de voz femenina.

El modelo resuelve el problema de la falta de sistemas de síntesis de voz de calidad para idiomas de bajos recursos como el sundanés, aprovechando la arquitectura Qwen3-TTS de 0.6B parámetros con una tasa de generación de 12 Hz. Con aproximadamente 905,8 millones de parámetros en total, el modelo está disponible bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones significativas. Su relevancia radica en demostrar que es posible adaptar modelos TTS modernos a idiomas subrepresentados con relativamente pocos datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS 12Hz (basada en transformer, no disponible detalle adicional) |
| Parametros totales | 905.788.672 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Sundanés (su) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-TTS en su variante de 0.6B parámetros con una frecuencia de generación de 12 Hz, diseñada por Alibaba para síntesis de voz de alta calidad. El ajuste fino se realizó sobre el checkpoint base `Qwen/Qwen3-TTS-12Hz-0.6B-Base` utilizando exclusivamente el subconjunto de voz femenina del dataset OpenSLR SLR44, que a su vez proviene de las grabaciones en sundanés de Mozilla Common Voice.

El entrenamiento se llevó a cabo durante 4 épocas con una tasa de aprendizaje de 1e-6 y un tamaño de lote (batch size) de 2. El modelo resultante utiliza un único hablante identificado como `sunda_speaker`. No se menciona el uso de técnicas como RLHF o DPO en el proceso de ajuste, ni se especifica el número total de tokens o horas de audio utilizadas en el entrenamiento.

## Capacidades

- Síntesis de voz en idioma sundanés a partir de texto, con voz femenina.
- Generación de voz personalizada mediante la API `generate_custom_voice`, que permite especificar el texto, el idioma y el hablante.
- Integración sencilla con el ecosistema Qwen3-TTS a través de la librería `qwen_tts`.
- Exportación de audio en formato WAV mediante `soundfile`.
- Soporte para detección automática de idioma en la generación (parámetro `language="auto"`).
- Capacidad de síntesis con una frecuencia de 12 Hz, lo que implica una generación de audio eficiente en términos de cómputo.

## Casos de uso

- Asistentes de voz en sundanés: el modelo puede integrarse en asistentes virtuales o chatbots con interfaz de voz para hablantes de sundanés, proporcionando respuestas habladas naturales en su idioma local.
- Accesibilidad para personas con discapacidad visual: conversión de texto a voz en sundanés para lectores de pantalla y aplicaciones de accesibilidad, permitiendo a usuarios sundanoparlantes acceder a contenido digital.
- Aplicaciones educativas de aprendizaje de idiomas: generación de audio en sundanés para aplicaciones de aprendizaje de idiomas, permitiendo a los estudiantes escuchar pronunciación correcta de palabras y frases.
- Contenido audiovisual localizado: doblaje de vídeos, podcasts o material multimedia al sundanés, aprovechando la licencia Apache 2.0 para uso comercial sin royalties.
- Sistemas de navegación y avisos públicos: generación de instrucciones de navegación o anuncios en sundanés para sistemas de transporte público o aplicaciones de mapas en regiones de Java Occidental.
- Investigación en procesamiento de voz para idiomas de bajos recursos: el modelo sirve como punto de partida para investigaciones sobre síntesis de voz en idiomas austronesios y como referencia para futuros ajustes con más datos o voces adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas objetivas como MOS (Mean Opinion Score), WER (Word Error Rate) o comparaciones con otros sistemas TTS en sundanés.

## Requisitos de hardware

- VRAM estimada para inferencia: con aproximadamente 906M parámetros en precisión FP16, el modelo requiere alrededor de 1,8 GB de VRAM solo para los pesos. Con overhead de activaciones y el decodificador de audio, se estima un consumo total de 3-4 GB en FP16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP16. Tarjetas como NVIDIA GTX 1650/1660, RTX 3050, RTX 3060 o superiores son suficientes. Para cuantización INT8 o INT4, el requisito baja a 2-3 GB, permitiendo ejecución en GPUs más modestas.
- En CPU: es posible ejecutar el modelo en CPU con cuantización, aunque la latencia será significativamente mayor (del orden de segundos por frase corta).
- Opciones de despliegue: el modelo se integra mediante la librería `qwen_tts` de HuggingFace. No se menciona soporte explícito para vLLM, llama.cpp u Ollama, que son herramientas orientadas a modelos de lenguaje, no a TTS.
- Latencia y throughput: no se proporcionan datos de latencia en la información disponible. Como referencia, modelos TTS de tamaño similar suelen generar audio más rápido que el tiempo real en GPUs modernas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se han identificado otros modelos TTS específicos para sundanés con los que comparar directamente. Alternativas genéricas como VITS, Tacotron 2 o Coqui TTS podrían adaptarse al sundanés, pero no se dispone de datos de rendimiento comparativos.

## Limitaciones y advertencias

- El modelo solo soporta un único hablante femenino (`sunda_speaker`), lo que limita la variedad de voces disponibles.
- El entrenamiento se realizó con un subconjunto reducido de datos (solo voz femenina de OpenSLR SLR44), lo que puede afectar a la naturalidad y cobertura fonética del modelo.
- No se han publicado evaluaciones formales de calidad de voz, por lo que el rendimiento subjetivo no está validado.
- El modelo está limitado al idioma sundanés; no soporta otros idiomas a pesar de que la API permite especificar `language="auto"`.
- No se especifica la longitud máxima de texto que puede procesar de una vez, lo que puede requerir segmentación de textos largos.
- El ejemplo de uso en la model card contiene un error tipográfico (referencia a `qwen3-tts-0.6b-indonesian` en lugar de `qwen3-tts-0.6b-sundanese`), lo que sugiere una documentación poco cuidada.
- Al ser un modelo de 0.6B parámetros, la calidad de voz puede ser inferior a la de modelos TTS más grandes como los de la serie Qwen3-TTS de mayor tamaño.

## Enlaces

- [HuggingFace: alkhrzmy/qwen3-tts-0.6b-sundanese](https://huggingface.co/alkhrzmy/qwen3-tts-0.6b-sundanese)
- [Modelo base: Qwen/Qwen3-TTS-12Hz-0.6B-Base](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base)
- [Dataset OpenSLR SLR44](https://openslr.trmal.net/resources/44/)
- [Paper de referencia del dataset (SLTU 2018)](http://dx.doi.org/10.21437/SLTU.2018-14)
