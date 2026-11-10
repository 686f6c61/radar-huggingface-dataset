# eustlb/LFM3-Audio-2B-codec

## Resumen

LFM3-Audio-2B-codec es el códec de voz (audio tokenizer) del modelo LFM3-Audio-2B de Liquid AI, publicado como repositorio independiente por el usuario eustlb. No se trata de un modelo generativo completo, sino del componente de tokenización de audio que el procesador de LFM3-Audio necesita para funcionar. El repositorio es una copia temporal extraída del directorio `audio_tokenizer/` del modelo original (revisión `2d6c1f99`), con los pesos sin modificar, y existe únicamente para que el procesador de LFM3-Audio pueda referenciarlo mientras la integración en transformers está en revisión (PR huggingface/transformers#50393).

El modelo usa la arquitectura `liquid_codec`, etiquetada dentro del ecosistema transformers, y contiene 73.559.090 parámetros en formato safetensors, con un tamaño de repositorio de 0,1 GB. Está pensado para convertir audio en tokens discretos que un modelo de lenguaje pueda procesar, no para generar audio ni texto por sí mismo.

Su relevancia es operativa más que de investigación: es una pieza de infraestructura que permite probar y desplegar el pipeline de audio de LFM3-Audio antes de que la integración oficial en transformers se fusione. Dado que es una copia temporal, no debe considerarse una versión estable ni un modelo autónomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | liquid_codec (codec de audio) |
| Parametros totales | 73.559.090 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura declarada es `liquid_codec`, un codec de audio integrado en el ecosistema transformers. El repositorio no documenta la estructura interna (capas, tipo de cuantizador residual, tasa de bits, frecuencia de muestreo ni tamaño de vocabulario de tokens de audio). Tampoco se detallan los datos de entrenamiento, el número de horas de audio utilizadas, la composición del dataset ni si hubo etapas de ajuste fino o alineación.

La innovación técnica relevante en este contexto no está en el codec en sí, sino en su empaquetado: se publica como repositorio independiente para que el procesador de LFM3-Audio pueda apuntar a él mientras se resuelve la integración en transformers. Los pesos son idénticos a los del modelo original; no se ha aplicado ningún cambio ni reentrenamiento.

## Capacidades

- Tokenización de audio: convierte señales de voz en tokens discretos consumibles por un modelo de lenguaje.
- Reconstrucción de audio: como codec, se presupone la capacidad inversa de decodificar tokens a audio, aunque la model card no lo detalla explícitamente.
- Integración con el procesador de LFM3-Audio: diseñado para ser referenciado por el pipeline de transformers del modelo principal.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales: no disponibles.

## Casos de uso

- Pruebas de integración de transformers: permite validar el pipeline de audio de LFM3-Audio con la versión en revisión del PR #50393 antes de que se fusione en la librería.
- Desarrollo de aplicaciones de voz sobre LFM3-Audio: sirve como dependencia del procesador para construir asistentes de voz, transcripción o comprensión de audio con el modelo principal.
- Reproducibilidad de experimentos: al ser una copia con pesos sin modificar de la revisión `2d6c1f99`, permite fijar una versión concreta del codec en entornos de investigación.
- Evaluación comparativa de codecs de audio: útil para medir la calidad de tokenización y reconstrucción frente a otros codecs en tareas de compresión de voz.
- Integración en pipelines de audio a texto: combinado con el modelo LFM3-Audio completo, habilita tareas de comprensión de audio en producción.
- Entornos con requisitos de trazabilidad: al estar separado del modelo principal, facilita auditar y versionar el componente de audio de forma aislada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,15 GB en fp32 (73,5 M de parámetros), alrededor de 0,08 GB en fp16 y menos de 0,05 GB en int8. Cálculo orientativo, no confirmado por el autor.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente por tamaño; el cuello de botella real será el modelo LFM3-Audio completo al que acompaña.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia del codec aislado.
- Opciones de despliegue: transformers (librería declarada). No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI para este componente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LFM3-Audio-2B-codec | 73,5 M | no disponible | lfm1.0 | Hugging Face (repo temporal) |
| Codecs de audio de referencia (p. ej. EnCodec, SoundStream) | no disponible en esta ficha | no disponible | varía | varía |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Repositorio temporal: el autor lo describe explícitamente como copia temporal sujeta a la fusión del PR de transformers; puede quedar obsoleto o desaparecer.
- No es un modelo autónomo: no genera texto ni audio por sí mismo; requiere el modelo LFM3-Audio-2B y su procesador.
- Sin documentación técnica: no se detallan arquitectura interna, datos de entrenamiento, idiomas ni cuantizaciones.
- Licencia lfm1.0 (license: other): es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso comercial; las condiciones no están resumidas en la model card.
- Riesgo de alucinación: no aplica directamente al codec, pero sí al modelo principal que lo utilice.
- Sesgos: no documentados; al ser un codec de voz, podría heredar sesgos acústicos y lingüísticos del corpus de entrenamiento original, que no se especifica.
- Sin garantías de mantenimiento ni de compatibilidad futura con versiones de transformers.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/eustlb/LFM3-Audio-2B-codec
- Modelo original: https://huggingface.co/LiquidAI/LFM3-Audio-2B
- Pull request de integración en transformers: https://github.com/huggingface/transformers/pull/50393
