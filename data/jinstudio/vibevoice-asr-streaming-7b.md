# Jinstudio/VibeVoice-ASR-Streaming-7B

## Resumen

VibeVoice-ASR-Streaming-7B es un modelo de reconocimiento automático del habla (ASR) en streaming desarrollado por Microsoft Research, dentro de la familia VibeVoice de modelos de voz open source. Resuelve el problema de transcribir en tiempo real **quién** dice **qué**, combinando transcripción continua con atribución de hablante y soporte de hotwords personalizados. El modelo está disponible bajo licencia MIT y es compatible con la librería transformers.

Según la información disponible, tiene un total de 8.674.021.857 parámetros y sus pesos se distribuyen en formato safetensors. Aunque la arquitectura interna no está detallada, el proyecto destaca por usar tokenizadores continuos de voz acústicos y semánticos a una frecuencia ultrabaja de 7,5 Hz, lo que reduce el coste computacional y permite procesar audio de forma eficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 8.674.021.857 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés, chino, español, portugués, alemán, japonés, coreano, francés, ruso e italiano |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no especifica la arquitectura interna del modelo, aunque se carga mediante la librería transformers y se presenta como un modelo de ASR unificado. El repositorio de GitHub de VibeVoice indica que la familia emplea tokenizadores continuos de voz (acústicos y semánticos) operando a 7,5 Hz, una innovación que optimiza el procesamiento de audio en streaming. No se han publicado datos sobre el corpus de entrenamiento, el número de tokens, composición del dataset ni procesos de ajuste como RLHF o DPO. La model card tampoco menciona detalles sobre estrategias de decodificación u otras innovaciones técnicas específicas.

## Capacidades

- Transcripción en streaming: procesa audio de forma continua y genera texto mientras llega la señal.
- Atribución de hablante: distingue quién está hablando en cada segmento, integrando diarización automática.
- Hotwords personalizados: permite añadir nombres propios, términos técnicos o palabras clave para mejorar el reconocimiento en dominios específicos.
- Soporte multilingüe: cubre 10 idiomas: inglés, chino, español, portugués, alemán, japonés, coreano, francés, ruso e italiano.
- Formato de salida compatible con la librería transformers mediante el pipeline `automatic-speech-recognition`.
- No se indica soporte para tool calling, función de llamada a herramientas, ni capacidades de visión.

## Casos de uso

- Transcripción de reuniones en tiempo real: el modelo puede generar actas automáticas identificando a cada participante, lo que resulta útil en entornos corporativos y de investigación.
- Atención al cliente en vivo: al transcribir llamadas en streaming, permite supervisar conversaciones y detectar palabras clave mediante hotwords, por ejemplo nombres de productos o marcadores de satisfacción.
- Subtitulación en directo para eventos multilingües: su soporte de 10 idiomas y su naturaleza en streaming lo hacen adecuado para conferencias, webinars o jornadas internacionales.
- Accesibilidad para personas con discapacidad auditiva: la transcripción en tiempo real con identificación de hablante facilita la generación de subtítulos en entornos educativos y profesionales.
- Monitorización de medios: emisoras de radio y televisión pueden analizar emisiones en vivo atribuyendo declaraciones a locutores concretos, sin esperar a la finalización del programa.
- Asistencia sanitaria y legal: en consultas o entrevistas, los hotwords personalizados ayudan a reconocer terminología médica o jurídica, mejorando la fiabilidad de la transcripción.
- Análisis de grupos focales e investigación social: la combinación de streaming y atribución de hablante permite estudiar dinámicas de conversación con datos ya segmentados por persona.

## Benchmarks y rendimiento

La model card incluye una figura con resultados de evaluación, pero no se ha proporcionado ningún valor numérico en la información de texto. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos safetensors ocupan 17,3 GB, lo que apunta a un almacenamiento en FP16. Para inferencia sin optimizaciones se requieren al menos 24 GB de VRAM. Con cuantización 4-bit la necesidad podría reducirse, pero no se dispone de información sobre versiones cuantizadas de este modelo.
- GPU recomendadas: A100 80GB, H100 80GB o una GPU de consumo con al menos 24 GB para FP16, siempre que se apliquen optimizaciones de memoria.
- ¿Cabe en GPU de consumo? Una RTX 4090 de 24 GB ofrece margen limitado para FP16, pero no es recomendable; el modelo no está disponible en versiones cuantizadas según la información consultada.
- Opciones de despliegue: la model card remite al repositorio de GitHub y a la librería transformers. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han identificado modelos comparables con la misma combinación de streaming, atribución de hablante y hotwords en la información disponible. Como referencia general puede citarse Whisper Large-v3, un modelo ASR multilingüe ampliamente usado, pero no es streaming y no incorpora diarización integrada. Dado que no hay datos cuantitativos de VibeVoice-ASR-Streaming-7B, no es posible realizar una comparación rigurosa.

## Limitaciones y advertencias

- No se han publicado estudios de sesgos ni del riesgo de alucinación específicos para este modelo. Como en todo sistema ASR, los acentos, ruidos y habla superpuesta pueden degradar el rendimiento.
- El soporte de idiomas se limita a los 10 declarados; el funcionamiento fuera de este conjunto no está garantizado.
- La integración depende de la implementación del repositorio de GitHub; la compatibilidad con motores de inferencia habituales no está documentada.
- La licencia MIT permite el uso comercial, pero el usuario es responsable de cumplir con las normativas aplicables al tratamiento de audio y a la protección de datos.
- La model card no aporta detalles sobre el contexto de audio, la gestión de ventanas de procesamiento ni los límites de duración de las entradas.

## Enlaces

- Repositorio oficial en Hugging Face de Microsoft: https://huggingface.co/microsoft/VibeVoice-ASR-Streaming-7B
- Repositorio en Hugging Face (Jinstudio): https://huggingface.co/Jinstudio/VibeVoice-ASR-Streaming-7B
- Código en GitHub: https://github.com/microsoft/VibeVoice
- Informe técnico en arXiv: https://arxiv.org/abs/2609.02812
- Demo en vivo: https://aka.ms/vibeasr
