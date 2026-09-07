# G999n/whisper-large-v3-turbo-odia-lora

## Resumen

El modelo G999n/whisper-large-v3-turbo-odia-lora es un adaptador LoRA (PEFT) desarrollado por G999n sobre el modelo base openai/whisper-large-v3-turbo, especializado en el reconocimiento automático de voz (ASR) para el idioma odia (oriya). Se entrena sobre el corpus ai4bharat/IndicVoices, en su división de odia, con el objetivo de mejorar la transcripción de audio en un idioma con menos recursos que el inglés o el español.

El adaptador añade 11.8 millones de parámetros entrenables al modelo base de 809 millones, lo que representa un 1.46% del total. La arquitectura subyacente es un transformer encoder-decoder, con la particularidad de que el modelo turbo reduce las capas de decodificación de 32 a 4, lo que acelera la inferencia sin perder demasiada precisión. Este enfoque de bajo rango permite adaptar el modelo a un idioma específico con un coste computacional reducido y sin modificar los pesos originales.

La relevancia de este modelo radica en que ofrece una alternativa eficiente para tareas de ASR en odia, un idioma hablado por más de 40 millones de personas, aprovechando la velocidad del modelo turbo y la adaptación mediante LoRA. Además, al ser un adaptador, el modelo base sigue disponible para otros idiomas y puede combinarse con otros adaptadores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) con adaptador LoRA (PEFT) |
| Parámetros totales | 820.8M (809M base + 11.8M LoRA) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | odia (or); el modelo base soporta múltiples idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |

## Arquitectura y entrenamiento

El modelo base, openai/whisper-large-v3-turbo, es una versión ajustada de Whisper large-v3 en la que el número de capas de decodificación se ha reducido de 32 a 4, manteniendo el encoder completo. Esto lo hace más rápido en inferencia que el modelo original. Sobre esta arquitectura se aplica un adaptador LoRA con rango 64 y alpha 128, dirigido a las proyecciones de consulta y valor (q_proj y v_proj) de las capas de atención. El entrenamiento se realizó sobre el subconjunto de odia del corpus IndicVoices de ai4bharat, durante 2250 pasos, alcanzando una pérdida de entrenamiento de aproximadamente 0.10. No se menciona el uso de RLHF ni DPO. La técnica de bajo rango (PEFT) permite entrenar solo un 1.46% de los parámetros, reduciendo el coste de cómputo y almacenamiento.

## Capacidades

- Transcripción de audio en odia a texto con el adaptador LoRA cargado sobre Whisper large-v3-turbo.
- Herencia de las capacidades de ASR del modelo base, que soporta múltiples idiomas, aunque el adaptador está optimizado para odia.
- Inferencia con entrada de audio muestreada a 16 kHz, como se indica en el ejemplo de uso.
- No soporta tool calling, function calling, ni razonamiento multi-paso.
- No soporta entrada de visión ni de audio multimodal más allá del reconocimiento de voz.
- No dispone de un modo de pensamiento explícito ("thinking mode").
- Puede integrarse en pipelines de Python mediante las librerías transformers y peft.

## Casos de uso

- Transcripción de reuniones y entrevistas en odia: el modelo procesa archivos de audio a 16 kHz y genera texto en odia, lo que facilita la documentación de juntas en entornos corporativos o académicos.
- Subtitulado automático de vídeos en odia: se puede aplicar a vídeos de plataformas como YouTube o servicios de streaming para generar subtítulos precisos, aprovechando la rapidez del modelo turbo.
- Accesibilidad para personas con discapacidad auditiva: el modelo permite transcribir en tiempo real contenido audiovisual en odia, mostrando el texto en pantalla para usuarios que no pueden escuchar.
- Análisis de llamadas de atención al cliente en odia: las grabaciones de llamadas se convierten a texto para su posterior análisis de sentimiento, temas o calidad del servicio.
- Asistente de voz para dictado en odia: se puede integrar en aplicaciones de dictado para que los usuarios hablen en odia y obtengan texto escrito, gracias a la baja latencia del modelo turbo.
- Investigación lingüística y creación de corpus: el modelo ayuda a transcribir grabaciones de campo o entrevistas en odia para construir corpus anotados, útiles en estudios de lingüística o desarrollo de tecnologías del habla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base en FP16 ocupa aproximadamente 1.6 GB; con el adaptador LoRA, la inferencia requiere entre 2 y 4 GB de VRAM, dependiendo de la longitud del audio y el tamaño del lote.
- GPU recomendadas: NVIDIA L4 (utilizada en el entrenamiento), RTX 3060 o superior para uso local, y A100 o H100 para despliegue a gran escala.
- Compatibilidad con GPU de consumo: sí, el modelo puede ejecutarse en tarjetas como RTX 3060 (12 GB), RTX 4060 (8 GB) o RTX 4090 (24 GB).
- Opciones de despliegue: transformers y peft en Python, Hugging Face Inference Endpoints, o scripts personalizados con PyTorch.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| G999n/whisper-large-v3-turbo-odia-lora | 820.8M (809M base + 11.8M LoRA) | no disponible | Apache 2.0 | HuggingFace |
| openai/whisper-large-v3-turbo | 809M | no disponible | no disponible | HuggingFace |
| openai/whisper-large-v3 | no disponible | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- El adaptador se entrenó exclusivamente con el subconjunto de odia del corpus IndicVoices, por lo que el rendimiento puede degradarse en acentos, dialectos o dominios no representados.
- No se han publicado métricas de evaluación (WER, CER) en conjuntos de prueba estándar, por lo que la calidad real de la transcripción no está verificada de forma independiente.
- La pérdida de entrenamiento de ~0.10 es un indicador débil de rendimiento y no garantiza una baja tasa de error en producción.
- Como ocurre con los modelos Whisper, existe riesgo de alucinación en audio con ruido, silencios o habla no nativa, lo que puede producir texto inventado.
- El adaptador está diseñado para odia; si se usa con otros idiomas sin desactivarlo, puede interferir con el comportamiento multilingüe del modelo base.
- El repositorio solo contiene los pesos del adaptador (0.1 GB); es necesario descargar el modelo base de 809M, lo que aumenta los requisitos de almacenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se debe revisar la licencia del modelo base para asegurar el cumplimiento en proyectos de producción.
- El ejemplo de inferencia utiliza `language="bengali"` como guía de script, lo que puede resultar confuso; se recomienda seguir las instrucciones del autor para evitar errores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/G999n/whisper-large-v3-turbo-odia-lora
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Whisper large-v3: https://huggingface.co/openai/whisper-large-v3
- Dataset IndicVoices: https://huggingface.co/datasets/ai4bharat/IndicVoices
