# namkiett/phowhisper-qwen-asr

## Resumen

PhoWhisper-Qwen ASR es un modelo de reconocimiento automático del habla (ASR) en vietnamita construido con una arquitectura Speech-LLM end-to-end. Lo desarrolla el usuario de Hugging Face namkiett y combina un codificador de audio basado en vinai/PhoWhisper-medium con un decodificador de lenguaje Qwen/Qwen2.5-0.5B-Instruct, unidos mediante un módulo adaptador específico. El modelo resuelve la transcripción de audio a texto en vietnamita aprovechando las capacidades lingüísticas de un LLM pequeño para generar la salida.

El modelo se ha entrenado sobre el conjunto de datos linhtran92/viet_bud500 y se distribuye con licencia Apache 2.0. Su tamaño total es de aproximadamente 10,2 millones de parámetros según los pesos en safetensors, con un repositorio de 0,1 GB. Es relevante como ejemplo de integración encoder-LLM para ASR de bajo coste en un idioma con menos recursos que el inglés, aunque su adopción es todavía muy limitada (0 descargas y 0 likes en el momento de la consulta).

La propuesta técnica se apoya en tres piezas: el encoder PhoWhisper-medium extrae representaciones acústicas, un adaptador con dos capas Conv1D y un proyector MLP las alinea con el espacio del LLM, y Qwen2.5-0.5B-Instruct genera la transcripción. El contexto y los detalles de entrenamiento no están documentados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Speech-LLM (encoder PhoWhisper-medium + adaptador Conv1D/MLP + decoder Qwen2.5-0.5B-Instruct) |
| Parametros totales | 10.230.400 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code, requiere trust_remote_code) |

## Arquitectura y entrenamiento

El modelo sigue un esquema Speech-LLM en el que un encoder acústico preentrenado (vinai/PhoWhisper-medium) procesa el audio y un adaptador específico transforma sus salidas para que sean consumidas por un LLM decoder (Qwen/Qwen2.5-0.5B-Instruct). El adaptador consta de dos capas Conv1D que aplican un downsampling 4x sobre la secuencia temporal, seguidas de un proyector MLP que mapea de 1024 a 896 dimensiones, la dimensión de entrada esperada por el LLM.

El entrenamiento se realizó sobre el dataset linhtran92/viet_bud500. No se especifican en la información disponible el número de tokens, la composición detallada del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado más allá del entrenamiento del adaptador. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Reconocimiento automático del habla (ASR) en vietnamita, con salida de texto a partir de archivos de audio o arrays numpy.
- Transcripción end-to-end mediante una única llamada `model.transcribe(...)`.
- Integración de un LLM pequeño como decoder, lo que permite aprovechar conocimiento lingüístico del modelo Qwen2.5-0.5B-Instruct.
- Soporte de audio como entrada a través del encoder PhoWhisper-medium.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de salida ni modo thinking.
- Capacidad multilingüe limitada al vietnamita según la metadata del modelo.

## Casos de uso

- Transcripción de reuniones y entrevistas en vietnamita: el modelo puede convertir grabaciones de audio en texto para actas o resúmenes, aprovechando el decoder LLM para producir salidas lingüísticamente coherentes.
- Subtitulado automático de vídeo en vietnamita: integrado en un pipeline de procesado de audio, permite generar subtítulos para contenido audiovisual en ese idioma.
- Atención al cliente basada en voz: la transcripción de llamadas o mensajes de voz en vietnamita puede alimentar un sistema posterior de análisis o enrutamiento.
- Generación de notas clínicas o administrativas dictadas: útil en entornos donde el personal dicta informes en vietnamita y se requiere texto para su revisión.
- Indexación y búsqueda de archivos de audio: transcribir un corpus de audio permite construir índices de texto y habilitar búsqueda por contenido.
- Investigación en ASR de bajo recurso: sirve como punto de partida para experimentos de adaptación encoder-LLM en vietnamita, dado su tamaño reducido y licencia permisiva.
- Prototipado rápido en aplicaciones de voz: su reducido tamaño (0,1 GB) y su API simple permiten desplegarlo en entornos de desarrollo con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del repositorio (0,1 GB) y los 10,2 M de parámetros reportados, el modelo es muy ligero, aunque el encoder PhoWhisper-medium y el decoder Qwen2.5-0.5B-Instruct añaden parámetros no reflejados en ese recuento.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería ser suficiente, pero no hay datos oficiales.
- ¿Cabe en GPU consumer? Sí, previsiblemente en la mayoría de GPU consumer actuales, aunque no se dispone de cifras verificadas.
- Opciones de despliegue: la model card solo documenta uso con `transformers` y `trust_remote_code=True`, junto con `accelerate`, `librosa`, `soundfile` y `torch`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| namkiett/phowhisper-qwen-asr | 10.230.400 (safetensors) | no disponible | vi | Apache 2.0 | Speech-LLM encoder PhoWhisper + Qwen2.5-0.5B |
| vinai/PhoWhisper-medium | no disponible | no disponible | vi | no disponible en la informacion | Encoder ASR vietnamita usado como base |
| Qwen/Qwen2.5-0.5B-Instruct | no disponible | no disponible | multilingue | no disponible en la informacion | LLM decoder usado en este modelo |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo está entrenado y declarado para vietnamita; no se garantiza su funcionamiento en otros idiomas.
- No se documentan sesgos conocidos, pero al entrenarse sobre un único dataset (viet_bud500) puede heredar sus sesgos de dominio y acento.
- Riesgo de alucinación inherente al uso de un LLM como decoder: puede generar texto plausible no presente en el audio, especialmente con audio ruidoso o fuera de dominio.
- No se especifican limitaciones de longitud de audio ni de contexto; se desconoce el comportamiento con grabaciones largas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar el código antes de usarlo en producción.
- La licencia Apache 2.0 permite uso comercial, pero al incorporar componentes de terceros (PhoWhisper y Qwen2.5) deben revisarse las licencias de esos modelos base.
- El modelo tiene 0 descargas y 0 likes, sin validación comunitaria ni benchmarks publicados; su madurez para producción es baja.
- El recuento de parámetros en safetensors (10,2 M) parece no incluir el encoder y el decoder completos, por lo que las estimaciones de recursos basadas solo en ese dato pueden ser engañosas.

## Enlaces

- Hugging Face: https://huggingface.co/namkiett/phowhisper-qwen-asr
- Encoder base: https://huggingface.co/vinai/PhoWhisper-medium
- LLM decoder: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/linhtran92/viet_bud500
