# KoljaB/TurnEndDetection-multilingual

## Resumen

TurnEndDetection-multilingual es un clasificador de audio disenado especificamente para detectar el final de turno (end-of-turn, EOT) en asistentes de voz conversacionales. Lo desarrolla KoljaB y se distribuye bajo licencia Apache 2.0 en Hugging Face, aunque con acceso restringido que requiere aceptar condiciones. El modelo resuelve un problema concreto de los sistemas de voz: determinar cuando el usuario ha terminado de hablar para que el asistente pueda responder sin cortar la conversacion ni esperar en exceso.

Tecnicamente se construye sobre jhu-clsp/mmBERT-base como modelo de clasificacion de texto y emplea openai/whisper-tiny en el pipeline de procesamiento de audio. Se distribuye en formato ONNX optimizado para onnxruntime, con un tamano de repositorio de 0,4 GB, lo que lo hace ligero y adecuado para despliegue en entornos de baja latencia. Soporta siete idiomas: ingles, aleman, espanol, frances, italiano, portugues y chino.

Su relevancia actual radica en que la deteccion fiable del final de turno es un cuello de botella critico en asistentes de voz de baja latencia, y la mayoria de soluciones comerciales no son abiertas ni multilingues. Este modelo ofrece una alternativa empaquetada en ONNX, con licencia permisiva y cobertura de idiomas, orientada a integracion directa en pipelines de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador basado en transformer (mmBERT-base) con componentes de audio (whisper-tiny), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el tag indica base_model:quantized:jhu-clsp/mmBERT-base) |
| Idiomas soportados | en, de, es, fr, it, pt, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (ejecutable con onnxruntime) |

## Arquitectura y entrenamiento

El modelo se presenta como un clasificador de audio para deteccion de final de turno, construido sobre jhu-clsp/mmBERT-base como backbone de clasificacion y con openai/whisper-tiny en el pipeline de audio. La exportacion a ONNX y su ejecucion mediante onnxruntime indican un diseno orientado a inferencia ligera y de baja latencia, adecuado para integrarse en sistemas de voz en tiempo real. El tag `base_model:quantized:jhu-clsp/mmBERT-base` sugiere que el backbone ha sido cuantizado, aunque no se especifica el esquema de cuantizacion ni los detalles del proceso.

No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). Tampoco se detalla el procedimiento de fusion entre el componente de audio (whisper-tiny) y el clasificador de texto (mmBERT-base).

## Capacidades

- Clasificacion de audio orientada a deteccion de final de turno en conversaciones habladas.
- Deteccion de end-of-turn (EOT) para asistentes de voz y sistemas conversacionales.
- Soporte multilingue en siete idiomas: ingles, aleman, espanol, frances, italiano, portugues y chino.
- Ejecucion via onnxruntime, lo que facilita el despliegue en entornos con requisitos de latencia estrictos.
- Integracion en pipelines de voz como componente de decision (clasificacion binaria o por clases de turno).
- No se documentan capacidades de generacion de texto, tool calling, agentes, vision ni audio generativo; se trata de un modelo de clasificacion, no de un LLM generativo.

## Casos de uso

- Asistentes de voz en tiempo real: el clasificador permite decidir cuando el usuario ha terminado de hablar, evitando que el asistente interrumpa o espere innecesariamente. Su formato ONNX y su tamano reducido (0,4 GB) lo hacen apto para inferencia de baja latencia en el bucle de captura de audio.
- Sistemas de atencion al cliente telefonica: integrado en un pipeline de ASR mas clasificador, permite gestionar turnos en llamadas automatizadas multilingues (espanol, ingles, aleman, etc.) sin depender de temporizadores fijos.
- Voicebots para dispositivos embebidos: al ejecutarse con onnxruntime y tener un tamano contenido, puede desplegarse en entornos con recursos limitados donde no cabe un LLM completo.
- Transcripcion y diarizacion de reuniones: la deteccion de final de turno ayuda a segmentar intervenciones de hablantes en grabaciones multilingues antes de pasar el texto a un modelo de resumen.
- Moderacion y analisis de conversaciones: permite marcar limites de turno en audios grabados para analitica posterior (tiempos de respuesta, solapamientos, etc.).
- Investigacion en interaccion humano-maquina: sirve como componente reproducible y abierto para experimentos sobre turn-taking en distintos idiomas, al estar disponible bajo Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio ocupa 0,4 GB, por lo que la huella en memoria es reducida y compatible con GPUs de gama baja o incluso CPU.
- GPU recomendadas: no se especifican; por tamano, cabria en GPUs consumer (RTX 3060, RTX 4090) e incluso en inference en CPU mediante onnxruntime.
- Cabe en GPU consumer: si, dado el tamano del repositorio (0,4 GB).
- Opciones de despliegue: onnxruntime (libreria declarada); no se documentan otras integraciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La comparativa con alternativas de deteccion de final de turno (por ejemplo, clasificadores EOT comerciales o modelos de voz especificos) no esta disponible.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| TurnEndDetection-multilingual | no disponible | no disponible | 7 idiomas | Apache 2.0 | ONNX |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de descargar el modelo, lo que anade un paso al despliegue automatizado.
- No se documentan sesgos conocidos, pero al ser un clasificador multilingue entrenado sobre datos no especificados, puede presentar sesgos idiomaticos o de acento no caracterizados.
- Riesgo de alucinacion: no aplica en sentido generativo, pero si existe riesgo de falsos positivos/negativos en la deteccion de final de turno, especialmente en habla con pausas largas, ruido o acentos no representados.
- Limitaciones de contexto e idioma: solo cubre siete idiomas; no se especifica el rendimiento en cada uno ni la cobertura de variedades dialectales.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el acceso gated puede imponer condiciones adicionales que deben revisarse antes de produccion.
- Caveat de produccion: no se publican metricas de latencia, precision ni recall, por lo que es necesario evaluar el modelo en el dominio concreto antes de integrarlo en un sistema en vivo.

## Enlaces

- Hugging Face: https://huggingface.co/KoljaB/TurnEndDetection-multilingual
- Modelo base de clasificacion: https://huggingface.co/jhu-clsp/mmBERT-base
- Modelo de audio base: https://huggingface.co/openai/whisper-tiny
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
