# coolcoder613/omnivoice-latin-GGUF-audio.cpp

## Resumen

OmniVoice Latin (audio.cpp GGUF) es una conversión al formato GGUF del modelo de síntesis de voz OmniVoice de k2-fsa, con un LoRA de latín fusionado en los pesos. El autor de la conversión es coolcoder613, que publica el modelo bajo el pipeline de text-to-speech y lo empaqueta específicamente para el motor de inferencia audio.cpp, con cuatro variantes de cuantización (f32, bf16, q8_0 y q4_k).

El modelo parte de OmniVoice, un sistema TTS del ecosistema k2-fsa (los mismos desarrolladores de Icefall y sherpa), y le incorpora un ajuste fino mediante LoRA sobre aproximadamente 22 horas de latín con macrones (vocales largas marcadas), lo que permite una pronunciación más fiel a la cantidad vocálica del latín clásico. El resultado es un modelo de síntesis de voz especializado en una única lengua, el latín, con etiqueta de idioma `la`.

La relevancia de esta ficha es acotada: se trata de una conversión de nicho, con cero descargas y cero likes en el momento de la consulta, orientada a proyectos de lectura de textos latinos, docencia de latín clásico o generación de audio para corpus históricos. No hay información pública sobre arquitectura interna, número de parámetros ni datos de entrenamiento más allá de lo indicado en la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: k2-fsa/OmniVoice, TTS) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo TTS; no aplica contexto de texto largo) |
| Tipos de cuantizacion | f32, bf16, q8_0, q4_k |
| Idiomas soportados | latín (`la`) |
| Licencia | no disponible |
| Formato de pesos | GGUF (audio.cpp) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base OmniVoice (no se especifica si es un transformer autoregresivo, un modelo de difusión, un sistema basado en flow matching o una arquitectura híbrida). Lo que sí consta es que se trata de un modelo de text-to-speech del ecosistema k2-fsa y que la conversión a GGUF está pensada para ejecutarse con el motor audio.cpp mediante la familia `omnivoice`.

El ajuste específico de esta variante consiste en un LoRA entrenado sobre aproximadamente 22 horas de latín con macrones, fusionado en los pesos del modelo base en el checkpoint step-4000. Los macrones (marcas de vocal larga) son relevantes en latín porque determinan la cantidad vocálica y, con ella, la pronunciación correcta y en ocasiones la distinción léxica. No se dispone de información sobre el dataset completo de entrenamiento del modelo base, el número de tokens, ni si hubo etapas de RLHF o DPO.

## Capacidades

- Síntesis de voz (text-to-speech) en latín a partir de texto escrito.
- Manejo de texto latino con macrones (`dīvīsa`, `partēs`, `trēs`), lo que permite marcar la cantidad vocálica en la entrada.
- Generación de audio en formato WAV mediante la CLI de audio.cpp.
- Ejecución local con cuantizaciones que reducen el peso del modelo (q8_0, q4_k).
- No consta soporte de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo TTS, no un LLM.
- No consta soporte multilingüe: la etiqueta de idioma es exclusivamente `la`.
- No consta capacidad de clonación de voz, control de estilo ni otras funciones avanzadas de TTS en la información proporcionada.

## Casos de uso

- Lectura de textos latinos clásicos: el modelo puede generar audio de pasajes como el *De bello Gallico* con pronunciación que respeta los macrones introducidos en la entrada, útil para estudiantes que necesitan oír la cantidad vocálica correcta.
- Docencia de latín: generación de material auditivo para clases, con pronunciación consistente y reproducible, sin depender de grabaciones humanas.
- Corpus históricos y humanidades digitales: conversión de textos latinos digitalizados a audio para accesibilidad o para proyectos de preservación sonora.
- Aplicaciones de aprendizaje de idiomas: integración en apps de latín que necesiten síntesis local sin conexión, aprovechando las cuantizaciones q8_0 y q4_k para reducir requisitos de recursos.
- Investigación en TTS de lenguas históricas: punto de partida para experimentos de adaptación de modelos TTS modernos a lenguas con poca representación, replicando el flujo LoRA descrito.
- Generación de audio para contenido divulgativo: podcasts o vídeos sobre Roma y el mundo clásico que requieran narración en latín de forma automatizada.
- Pruebas de integración de audio.cpp: caso de uso técnico para validar el motor con la familia `omnivoice` y distintas cuantizaciones en pipelines propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 7,3 GB, lo que incluye las cuatro variantes de cuantización; el peso de cada fichero individual no se detalla en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; la existencia de cuantizaciones q8_0 y q4_k sugiere que el modelo puede ejecutarse en hardware modesto, pero no hay datos de VRAM ni de latencia.
- Opciones de despliegue: audio.cpp mediante `audiocpp_cli` con `--family omnivoice`. No consta soporte para vLLM, llama.cpp, Ollama o TGI, dado que se trata de un modelo TTS y no de un LLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de TTS en latín ni datos de rendimiento que permitan una comparación cuantitativa. Como referencia cualitativa, el modelo base es k2-fsa/OmniVoice, pero no se dispone de sus especificaciones ni de alternativas evaluadas en la misma tarea.

## Limitaciones y advertencias

- Modelo de nicho con cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria ni evidencia de uso en producción.
- La licencia no está disponible, lo que impide determinar si se permite uso comercial; conviene consultar la licencia del modelo base k2-fsa/OmniVoice antes de cualquier despliegue.
- Especializado exclusivamente en latín: no sirve para otros idiomas.
- El rendimiento depende de que la entrada incluya macrones correctos; sin ellos, la pronunciación de la cantidad vocálica puede ser incorrecta.
- No hay datos publicados de calidad de síntesis, inteligibilidad ni naturalidad (MOS u otras métricas).
- Riesgo de artefactos o pronunciaciones erróneas en textos con vocabulario, nombres propios o construcciones poco frecuentes en las 22 horas de entrenamiento del LoRA.
- No es un modelo de propósito general: no admite tool calling, agentes ni razonamiento; usarlo fuera de TTS no tiene sentido.
- Al ser una conversión GGUF para audio.cpp, la compatibilidad está limitada al ecosistema de ese motor; no se garantiza funcionamiento en otros runners.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coolcoder613/omnivoice-latin-GGUF-audio.cpp
- Modelo base: https://huggingface.co/k2-fsa/OmniVoice
- LoRA de latín: https://huggingface.co/coolcoder613/omnivoice-latin-lora-1
- Conversión GGUF original: https://huggingface.co/coolcoder613/omnivoice-latin-GGUF-1
