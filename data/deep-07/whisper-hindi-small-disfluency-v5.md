# Deep-07/whisper-hindi-small-disfluency-v5

## Resumen

Deep-07/whisper-hindi-small-disfluency-v5 es un modelo de reconocimiento automatico del habla (ASR) publicado en Hugging Face por el usuario Deep-07. El identificador y la etiqueta `whisper` indican que se trata de un ajuste fino de la familia Whisper de OpenAI, concretamente sobre la variante "small", y el sufijo "hindi-disfluency" sugiere una especializacion en transcripcion de hindi que preserva o gestiona las disfluencias del habla espontanea (repeticiones, titubeos, falsos arranques). El repositorio cuenta con 0 descargas y 0 likes, y la model card es la plantilla generica autogenerada por el Hub, sin informacion sustantiva del autor.

El modelo tiene 241.734.912 parametros en formato safetensors, lo que encaja con la arquitectura Whisper small (aproximadamente 244 millones de parametros en el checkpoint original). El repositorio ocupa 1,0 GB. No se dispone de informacion sobre el dataset de ajuste, hiperparametros, licencia ni idiomas declarados; la unica referencia tecnica es la cita generica al paper de Whisper (arXiv:1910.09700) que aparece en los tags, y que corresponde al articulo sobre el impacto ambiental del aprendizaje automatico citado en la plantilla, no a un paper propio del modelo.

Por tanto, esta ficha documenta un artefacto de investigacion de trazabilidad limitada: util como punto de partida para experimentacion con ASR en hindi y manejo de disfluencias, pero sin garantias de calidad, licencia ni evaluacion publicadas. Cualquier uso en produccion exige una validacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper, variante small) |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (Whisper small original: ventana de audio de 30 s) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion posible via herramientas externas) |
| Idiomas soportados | no disponible; el nombre sugiere hindi, sin confirmacion del autor |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a Whisper, un modelo transformer encoder-decoder disenado para reconocimiento automatico del habla multilingue y traduccion de voz. Whisper procesa audio en ventanas de 30 segundos convertidas a espectrogramas mel, y genera transcripciones de forma autorregresiva con tokens especiales de idioma y tarea. La variante small del checkpoint original tiene 12 capas de encoder y 12 de decoder, con una dimension de modelo de 768 y 12 cabezas de atencion, lo que suma aproximadamente 244 millones de parametros; el recuento real de safetensors (241.734.912) es coherente con esa configuracion.

No se dispone de informacion sobre el proceso de ajuste fino: ni volumen de datos, ni composicion del corpus en hindi, ni si se aplicaron tecnicas de aumento de datos, etiquetado de disfluencias o correccion de puntuacion. Tampoco hay datos sobre hiperparametros, regimen de precision (fp16, bf16) ni infraestructura de entrenamiento. El nombre "disfluency-v5" sugiere al menos cinco iteraciones de ajuste, pero el autor no documenta ninguna. No consta el uso de RLHF ni DPO, algo poco habitual en modelos ASR.

## Capacidades

- Transcripcion de voz a texto, presumiblemente en hindi, aunque el autor no lo confirma explicitamente.
- Gestion de disfluencias del habla espontanea segun el nombre del modelo: repeticiones, titubeos, falsos arranques y pausas.
- Reconocimiento de habla continua en ventanas de audio de hasta 30 segundos, heredado de la arquitectura Whisper.
- Posible capacidad multilingue residual del checkpoint base Whisper small, no verificada tras el ajuste.
- Compatibilidad con la libreria transformers y con endpoints compatibles (tag `endpoints_compatible`), lo que facilita su despliegue en Inference Endpoints.
- No consta soporte de tool calling, agentes, vision, audio generativo ni modo de razonamiento extendido; son capacidades ajenas a un modelo ASR.

## Casos de uso

- Transcripcion de entrevistas y grupos focales en hindi: el modelo esta disenado para preservar disfluencias, lo que resulta util cuando el analisis cualitativo requiere reflejar el habla real de los participantes en lugar de una version editada.
- Generacion de subtitulos para contenido audiovisual informal: podcasts, videos de YouTube o directos donde los hablantes improvisan y producen titubeos que un ASR estandar tiende a eliminar o a transcribir erroneamente.
- Investigacion linguistica sobre el hindi hablado: la preservacion de disfluencias permite estudiar patrones de reformulacion, pausas y marcadores discursivos en corpus orales.
- Prototipado rapido de asistentes de voz en hindi: al ser un modelo de 242 M de parametros, se puede desplegar en una unica GPU consumer para pruebas de concepto antes de invertir en modelos mayores.
- Transcripcion de llamadas de atencion al cliente: permite conservar el habla literal del usuario para auditoria de calidad, aunque requiere validacion previa por la falta de evaluacion publicada.
- Pipeline de anotacion semiautomatica de corpus: el modelo puede generar transcripciones iniciales que anotadores humanos corrigen, reduciendo el coste frente a la transcripcion manual, siempre que la calidad se valide en el dominio concreto.
- Experimentacion academica en ASR: sirve como punto de comparacion frente a Whisper small original en tareas de hindi con disfluencias, aunque el autor no publique metricas de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card es la plantilla autogenerada por Hugging Face y no incluye evaluacion alguna (ni WER, ni CER, ni comparaciones). Tampoco consta evaluacion en datasets publicos de hindi como Common Voice, FLEURS o IndicSUPERB.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1 GB para los pesos (242 M de parametros x 4 bytes), mas overhead de activaciones y espectrogramas; en la practica, 2-3 GB son suficientes para audio de 30 segundos.
- VRAM estimada en fp16/bf16: aproximadamente 0,5 GB de pesos, con un total practico de 1-2 GB.
- Cuantizacion a int8: alrededor de 0,25 GB de pesos; cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, incluidas RTX 3050, RTX 3060, RTX 4060, RTX 4090, A10, A100 y H100. Tambien puede ejecutarse en CPU para lotes pequenos.
- Despliegue: transformers (pipeline `automatic-speech-recognition`), vLLM no aplica de forma nativa a Whisper en todas sus versiones, faster-whisper y whisper.cpp requieren conversion previa de pesos, Ollama no soporta ASR de forma estandar, TGI ofrece soporte limitado. La via mas directa es transformers o un Inference Endpoint.
- Latencia y throughput: no disponibles. Como referencia de la arquitectura, Whisper small procesa audio en tiempo real o mas rapido en GPUs modernas, pero no hay mediciones publicadas para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Deep-07/whisper-hindi-small-disfluency-v5 | 241,7 M | 30 s (heredado) | no disponible (presumiblemente hindi) | no disponible | Hugging Face, 0 descargas |
| openai/whisper-small | ~244 M | 30 s | multilingue (99 idiomas) | MIT | Hugging Face, ampliamente usado |
| openai/whisper-small.en | ~244 M | 30 s | ingles | MIT | Hugging Face |
| Modelos IndicASR especializados en hindi (p. ej. variantes de IndicWhisper) | variable | variable | hindi e idiomas indios | variable | Hugging Face, con evaluacion publicada en algunos casos |

La comparacion directa con Whisper small original es la mas relevante: comparten arquitectura y tamano, pero el modelo de Deep-07 no documenta licencia ni evaluacion, mientras que el original de OpenAI se distribuye bajo licencia MIT y cuenta con benchmarks publicos. Para produccion, el checkpoint original o variantes comunitarias bien documentadas ofrecen mayores garantias.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla autogenerada, sin descripcion de datos, entrenamiento, evaluacion ni uso previsto.
- Licencia no declarada: no se puede asumir uso comercial permitido; en ausencia de licencia explicita, los derechos de uso quedan en un limbo legal que desaconseja su integracion en productos.
- Idiomas no confirmados: el nombre sugiere hindi, pero el autor no lo declara; el ajuste podria haber degradado el rendimiento multilingue del checkpoint base.
- Sin evaluacion publicada: no hay WER ni CER, por lo que la calidad real es desconocida y debe medirse en el dominio de uso.
- Riesgo de alucinacion: como todo modelo Whisper, puede generar texto plausible en silencios o segmentos ruidosos, especialmente en audio de baja calidad.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no se pueden evaluar sesgos de genero, dialecto, caste o registro del hindi.
- Contexto limitado a 30 segundos por ventana: requiere segmentacion previa para audios largos, con riesgo de errores en las fronteras.
- Repositorio sin traccion (0 descargas, 0 likes): no ha sido validado por la comunidad, lo que aumenta el riesgo de artefactos defectuosos o pesos incompletos.
- Fecha de creacion futura en los metadatos (2026-11-28): inconsistencia que sugiere posible carga automatizada o error del autor; conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Deep-07/whisper-hindi-small-disfluency-v5
- Paper de referencia de Whisper (arquitectura base): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper de OpenAI: https://github.com/openai/whisper
- Paper citado en los tags (impacto ambiental, no especifico del modelo): https://arxiv.org/abs/1910.09700
- Checkpoint base de referencia: https://huggingface.co/openai/whisper-small
- Documentacion de transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
