# Jinstudio/VibeVoice-ASR-Streaming-1.5B

## Resumen

VibeVoice-ASR-Streaming-1.5B es un modelo de reconocimiento automático de voz (ASR) en streaming que transcribe simultáneamente quién habla y qué dice, con soporte para palabras personalizadas y diez idiomas. Desarrollado por Microsoft Research, está disponible en HuggingFace bajo la cuenta Jinstudio, aunque la model card original apunta al repositorio de Microsoft. El modelo tiene 2.814.116.321 parámetros y se distribuye en formato safetensors con un tamaño de repositorio de 5.6 GB. Su principal relevancia es la transcripción continua con atribución de hablante en tiempo real, lo que lo hace útil para reuniones, subtitulado en directo y análisis de llamadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible |
| Parametros totales | 2.814.116.321 |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés, chino, español, portugués, alemán, japonés, coreano, francés, ruso, italiano |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se han publicado detalles específicos sobre la arquitectura ni el proceso de entrenamiento en la información disponible. La model card describe el modelo como un sistema unificado de ASR en streaming con atribución de hablante y soporte de hotwords. El informe técnico enlazado (arxiv:2609.02812) debería contener más detalles, pero no se ha facilitado el contenido. No se menciona el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Transcripción en streaming: procesa el audio a medida que llega y genera texto de forma continua.
- Atribución de hablante: identifica quién dice cada fragmento, produciendo una transcripción con etiquetas de hablante.
- Hotwords personalizados: permite al usuario proporcionar nombres o términos técnicos para mejorar el reconocimiento en dominios específicos.
- Soporte multilingüe: cubre diez idiomas: inglés, chino, español, portugués, alemán, japonés, coreano, francés, ruso e italiano.
- Compatible con la librería Transformers de HuggingFace y con endpoints de inferencia.

## Casos de uso

- Transcripción de reuniones en tiempo real: el modelo puede generar una transcripción continua con identificación de cada participante, lo que facilita el acta automática.
- Subtitulado en directo para eventos o vídeos: gracias al streaming, produce subtítulos mientras se habla, con soporte para diez idiomas.
- Asistencia en llamadas de atención al cliente: la atribución de hablante permite distinguir entre agente y cliente, y los hotwords personalizados mejoran el reconocimiento de nombres de productos o términos internos.
- Documentación de entrevistas o podcasts: el modelo transcribe conversaciones largas y asigna las intervenciones a cada interlocutor.
- Análisis de llamadas de ventas o soporte: la transcripción con hablantes facilita el análisis posterior de conversaciones y la extracción de métricas.
- Accesibilidad para personas con discapacidad auditiva: el subtitulado en tiempo real en varios idiomas permite seguir conferencias o clases en directo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una figura con resultados de evaluación, pero no se han proporcionado los valores numéricos en el texto de la ficha.

## Requisitos de hardware

- VRAM estimada: no se han publicado requisitos oficiales. El tamaño del repositorio (5.6 GB) sugiere pesos en FP16 o BF16 para 2.814 millones de parámetros, lo que requeriría aproximadamente 5.6 GB de VRAM para cargar el modelo completo en precisión media.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible. Para una carga en FP16 se necesitaría una GPU con al menos 6-8 GB de VRAM, como una RTX 3060 o superior, pero es una estimación.
- Opciones de despliegue: al ser compatible con Transformers, puede ejecutarse con HuggingFace Inference Endpoints, vLLM o pipelines de ASR. No se menciona soporte específico para llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables en la información disponible.

## Limitaciones y advertencias

- No se han documentado sesgos específicos en la información disponible.
- Al ser un modelo de ASR, puede cometer errores en entornos con ruido, acentos no estándar o habla solapada, aunque no hay datos concretos.
- La longitud de contexto no está especificada, lo que limita la capacidad de procesar audios muy largos de una sola vez, aunque el streaming mitiga este problema.
- El modelo está publicado en HuggingFace bajo la cuenta Jinstudio, mientras que la model card original corresponde a Microsoft. Esto puede indicar una re-subida no oficial, por lo que se recomienda verificar la procedencia antes de usar en producción.
- La licencia MIT permite uso comercial, pero al tratarse de un proyecto de investigación, no se garantiza soporte ni mantenimiento continuado.

## Enlaces

- HuggingFace: https://huggingface.co/Jinstudio/VibeVoice-ASR-Streaming-1.5B
- GitHub: https://github.com/microsoft/VibeVoice
- Demo: https://aka.ms/vibeasr
- Informe técnico: https://arxiv.org/abs/2609.02812
