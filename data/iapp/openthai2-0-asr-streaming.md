# iapp/OpenThai2.0-ASR-Streaming

## Resumen

OpenThai2.0-ASR-Streaming es un modelo de reconocimiento automático del habla (ASR) en tiempo real especializado en tailandés, desarrollado por el equipo iapp como un ajuste fino (fine-tuning) del modelo base `nvidia/nemotron-3.5-asr-streaming-0.6b`. Está construido sobre la arquitectura FastConformer con decodificador Transducer, implementada en el framework NeMo de NVIDIA, y está diseñado específicamente para transcripción de flujo continuo (streaming) con latencia baja, una capacidad crítica para aplicaciones de subtitulado en vivo, asistentes de voz y transcripción de reuniones.

El modelo aborda un problema concreto: la escasez de sistemas ASR de streaming de calidad para tailandés, un idioma con relativamente pocos recursos en comparación con el inglés. Al partir de un modelo base de 0,6 mil millones de parámetros ya entrenado por NVIDIA para streaming, el ajuste fino permite adaptar el sistema al tailandés manteniendo las capacidades multilingües del modelo original (tailandés e inglés).

Con un tamaño de repositorio de 5,1 GB y distribución bajo licencia OpenMDW-1.1, el modelo está pensado para desarrolladores que necesitan integrar transcripción en tiempo real en productos para el mercado tailandés. Su acceso está restringido (gated), lo que requiere aceptar las condiciones en Hugging Face antes de la descarga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador Transducer (NeMo) |
| Parametros totales | 0,6 mil millones (aproximado, según el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | NeMo (.nemo), según la librería indicada |
| Tarea | Reconocimiento automático del habla (ASR) en streaming |
| Modelo base | nvidia/nemotron-3.5-asr-streaming-0.6b |
| Acceso | Restringido (gated) |
| Tamaño del repositorio | 5,1 GB |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura FastConformer, una variante eficiente del Conformer que reduce el coste computacional mediante downsampling de las secuencias de entrada, combinada con un decodificador de tipo Transducer (RNN-T). Esta combinación es habitual en sistemas ASR de streaming porque el Transducer permite emitir tokens de forma incremental sin necesidad de esperar a que finalice la locución, lo que se traduce en latencia baja y adecuada para aplicaciones en tiempo real.

El entrenamiento parte del modelo `nvidia/nemotron-3.5-asr-streaming-0.6b`, un sistema ASR de streaming de NVIDIA, y se ha ajustado mediante fine-tuning para el tailandés. No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de aumento de datos o regularización específicas. Tampoco se especifica si se emplearon métodos de destilación o adaptación de dominio. La referencia al paper arXiv:2509.18722 sugiere que existe documentación técnica asociada, pero su contenido no está disponible en la información facilitada.

## Capacidades

- Reconocimiento automático del habla en tiempo real (streaming) para tailandés e inglés.
- Transcripción incremental con emisión de tokens parciales, adecuada para subtitulado en vivo.
- Soporte multilingüe limitado a tailandés e inglés.
- Integración con el ecosistema NeMo de NVIDIA para entrenamiento, evaluación y despliegue.
- Compatible con pipelines de ASR estándar en NeMo (preprocesado de audio, extracción de características, decodificación).
- No se ha documentado soporte de tool calling, agentes, visión, audio generativo ni modos de razonamiento extendido, dado que es un modelo puramente ASR.

## Casos de uso

- Subtitulado en vivo para retransmisiones y eventos: el modo streaming permite emitir texto conforme se habla, con latencia baja, lo que lo hace adecuado para subtítulos en directo en tailandés.
- Transcripción de reuniones y videoconferencias: puede integrarse en herramientas de actas automáticas para equipos que operan en tailandés e inglés, generando transcripciones incrementales sin esperar al final de la sesión.
- Asistentes de voz y chatbots por voz: al procesar audio en streaming, permite construir interfaces conversacionales que responden con baja latencia en tailandés.
- Atención al cliente telefónica: integración en centros de contacto para transcribir llamadas en tiempo real y alimentar sistemas de análisis de sentimiento o búsqueda de palabras clave.
- Accesibilidad para personas con discapacidad auditiva: generación de subtítulos en directo en aplicaciones de vídeo y plataformas educativas para contenido en tailandés.
- Indexación y búsqueda de archivos de audio: transcripción de grandes volúmenes de grabaciones para hacerlas consultables mediante búsqueda textual, aprovechando el soporte de streaming para procesar flujos largos.
- Análisis de medios y monitorización: transcripción de emisiones de radio o televisión en tailandés para sistemas de seguimiento de menciones y análisis de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 0,6 mil millones de parámetros, la inferencia en precisión FP16 requeriría aproximadamente 1,2-2 GB de VRAM, y en cuantización INT8 alrededor de 0,6-1 GB, aunque estos valores son estimaciones basadas en el tamaño y no datos oficiales.
- GPU recomendadas: no disponible; por tamaño, cabría esperar compatibilidad con GPUs de consumo como RTX 3060, RTX 4060 o superiores, así como GPUs de datacenter (A100, H100) para despliegues de alta concurrencia.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño reducido del modelo, aunque no se confirma en la documentación disponible.
- Opciones de despliegue: NeMo (framework nativo), con posibilidad de exportación a TensorRT u otros runtimes compatibles con NeMo; no se documentan integraciones con vLLM, llama.cpp u Ollama, que no son adecuados para modelos ASR de este tipo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Streaming | Disponibilidad |
|---|---|---|---|---|---|---|
| OpenThai2.0-ASR-Streaming | ~0,6 B | th, en | no disponible | OpenMDW-1.1 | Sí | Gated en Hugging Face |
| nvidia/nemotron-3.5-asr-streaming-0.6b | ~0,6 B | Multilingüe (según modelo base) | no disponible | no disponible | Sí | Hugging Face (NVIDIA) |
| Alternativas ASR para tailandés | no disponible | th | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas específicas de ASR en tailandés (como modelos de Whisper ajustados o sistemas de Pathumma); se indica "no disponible" en ausencia de datos verificables.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un ajuste fino sobre un modelo base entrenado mayoritariamente con datos en inglés y otros idiomas, puede presentar sesgos acústicos y léxicos hacia determinados dialectos o registros del tailandés.
- Riesgo de alucinación: los modelos Transducer pueden generar transcripciones plausibles pero incorrectas en segmentos con ruido, solapamiento de hablantes o audio de baja calidad.
- Limitaciones de contexto: no se especifica la ventana de contexto; en streaming, la latencia y la precisión dependen de la configuración de chunking, que no está documentada.
- Restricciones de licencia: la licencia OpenMDW-1.1 puede imponer condiciones para uso comercial; es necesario revisar los términos completos antes de desplegar en producción. El acceso está restringido (gated), lo que requiere aceptación de condiciones en Hugging Face.
- Caveats para producción: no se han publicado métricas de WER (Word Error Rate) ni evaluaciones comparativas, lo que dificulta estimar su rendimiento real frente a alternativas. La integración requiere el ecosistema NeMo, lo que puede limitar la portabilidad a otros frameworks.
- Idiomas: solo tailandés e inglés; no se garantiza un rendimiento adecuado en otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iapp/OpenThai2.0-ASR-Streaming
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Paper de referencia: https://arxiv.org/abs/2509.18722
- Framework NeMo: https://github.com/NVIDIA/NeMo
- Licencia OpenMDW-1.1: no disponible en la información proporcionada (consultar en la ficha de Hugging Face)
