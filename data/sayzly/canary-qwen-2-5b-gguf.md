# sayzly/canary-qwen-2.5b-gguf

## Resumen

Canary-Qwen 2.5B (GGUF) es una conversión al formato GGUF del modelo `nvidia/canary-qwen-2.5b`, publicada por el usuario `sayzly` bajo licencia CC BY 4.0. El modelo original es un sistema de reconocimiento automático del habla (ASR) desarrollado por NVIDIA que combina el encoder de audio de la familia Canary con el decoder de lenguaje de Qwen, dando lugar a un modelo de 2.533.757.456 parámetros (aproximadamente 2,5 mil millones) que transcribe audio a texto.

El repositorio contiene únicamente los pesos convertidos a GGUF (el archivo principal es `canary-qwen-2.5b-Q8_0.gguf`, con un tamaño de repo de 2,8 GB). No se trata de un modelo nuevo ni de un fine-tuning: el autor declara explícitamente que los pesos no se han modificado más allá de la conversión de formato. Su relevancia radica en que facilita la ejecución del modelo ASR de NVIDIA en entornos con `llama.cpp` u otros runtimes compatibles con GGUF, sin necesidad de depender del stack original de PyTorch/NeMo.

La información publicada en el repositorio es muy escasa: no se detallan idiomas soportados, composición del dataset de entrenamiento, benchmarks ni instrucciones de uso específicas para la variante GGUF. Cualquier dato técnico adicional debe consultarse en la model card del modelo original de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: nvidia/canary-qwen-2.5b, ASR encoder-decoder) |
| Parametros totales | 2.533.757.456 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (único archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | CC BY 4.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura en el repositorio de esta conversión. Por el nombre del modelo base (`nvidia/canary-qwen-2.5b`) se infiere que combina un encoder de audio de la familia Canary con un decoder basado en Qwen, pero la model card de esta conversión no aporta detalles sobre capas, atención, dimensionalidad ni tipo de decoder. Tampoco se especifican datos de entrenamiento (número de tokens, composición del dataset, horas de audio), ni si hubo etapas de RLHF, DPO o ajuste supervisado.

La única innovación técnica documentada en este repositorio es la propia conversión a GGUF, que permite ejecutar el modelo en runtimes de inferencia ligeros. El autor indica que los pesos no se han modificado más allá de la conversión de formato.

## Capacidades

- Reconocimiento automático del habla (ASR): transcripción de audio a texto, según el `pipeline_tag` del repositorio.
- Conversacional: el tag `conversational` sugiere uso en interacciones de diálogo, aunque no se detalla el mecanismo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Capacidades especiales (modo thinking, visión, audio de entrada): la entrada es audio (ASR); no se documentan otras modalidades.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo puede convertir audio de reuniones en texto plano para actas y resúmenes, aprovechando su naturaleza ASR y su tamaño contenido (2,5 B de parámetros) para ejecución en local.
- Subtitulado automático de vídeo: integración en pipelines de postproducción para generar subtítulos a partir de pistas de audio, con la ventaja de poder desplegarse en infraestructura propia gracias al formato GGUF.
- Dictado por voz en aplicaciones de escritorio: al ejecutarse con runtimes GGUF, puede integrarse en aplicaciones de escritorio o herramientas de productividad que requieran transcripción sin conexión a servicios en la nube.
- Accesibilidad: generación de transcripciones en tiempo real para personas con discapacidad auditiva en entornos donde no se permite enviar audio a terceros.
- Análisis de llamadas de atención al cliente: transcripción de grabaciones para su posterior análisis de sentimiento o extracción de entidades, con el modelo ejecutándose en servidores propios.
- Archivado y búsqueda de audio: conversión masiva de archivos de audio a texto indexable para motores de búsqueda internos o sistemas de gestión documental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q8_0 ocupa aproximadamente 2,8 GB, por lo que se necesita al menos esa cantidad de memoria (GPU o RAM) para cargar los pesos, más el overhead del runtime y del procesamiento de audio.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría en GPUs consumer con 4-6 GB de VRAM o más (por ejemplo, RTX 3060, RTX 4060, RTX 4090), aunque no se confirma compatibilidad ni rendimiento.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 4 GB de VRAM, dado el tamaño del archivo Q8_0.
- Opciones de despliegue: `llama.cpp` y runtimes compatibles con GGUF (Ollama, entre otros). No se documentan opciones como vLLM o TGI para esta conversión.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Canary-Qwen 2.5B (GGUF, esta conversión) | 2,53 B | no disponible | GGUF (Q8_0) | CC BY 4.0 | Hugging Face (sayzly) |
| nvidia/canary-qwen-2.5b (original) | 2,53 B | no disponible | safetensors (presumiblemente) | CC BY 4.0 | Hugging Face (NVIDIA) |
| Whisper large-v3 | no disponible en la información | no disponible | múltiples | MIT (según el modelo original de OpenAI) | Hugging Face / OpenAI |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no documenta sesgos conocidos del modelo; deben consultarse en la model card del modelo original de NVIDIA.
- Riesgo de alucinación: no evaluado en esta conversión; los modelos ASR pueden generar transcripciones plausibles pero incorrectas en audio con ruido o acentos no representados en el entrenamiento.
- Idiomas soportados no especificados: no se puede garantizar cobertura multilingüe sin consultar el modelo original.
- Licencia CC BY 4.0: permite uso comercial con atribución; es obligatorio acreditar a los autores originales (NVIDIA) y al conversor (sayzly) según los términos de la licencia.
- Solo se publica una cuantización (Q8_0); no hay variantes Q4, Q5 u otras que reduzcan aún más el uso de memoria.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- La conversión no ha sido validada por NVIDIA; posibles diferencias de comportamiento respecto al modelo original no están documentadas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/sayzly/canary-qwen-2.5b-gguf
- Modelo original: https://huggingface.co/nvidia/canary-qwen-2.5b
