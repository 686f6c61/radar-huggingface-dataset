# alphaedge-ai/whisper-large-v3-turbo-mlg-16384

## Resumen

Whisper large-v3-turbo-mlg-16384 es una variante "trimmed" (podada) del modelo de reconocimiento automatico del habla openai/whisper-large-v3-turbo, publicada por el usuario alphaedge-ai. La poda consiste en reducir el vocabulario del tokenizador de 51.865 a 16.384 tokens, conservando unicamente los tokens relevantes para el malgache (codigo ISO `mg`), idioma para el que se ha optimizado el modelo. El resultado es un modelo un 5,61% mas pequeno en parametros (763.461.120 frente a 808.878.080) y con una huella de memoria notablemente inferior, manteniendo la arquitectura original de Whisper.

El modelo conserva la arquitectura encoder-decoder transformer de Whisper large-v3-turbo, pero su vocabulario reducido implica que ha perdido buena parte de la cobertura multilingue del modelo original. Esta disenado especificamente para transcripcion de audio en malgache y no deberia emplearse para otros idiomas, ya que los tokens eliminados del vocabulario no pueden generarse. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

Su relevancia practica es acotada: se trata de un modelo de nicho para un idioma de bajos recursos, con solo 25 descargas y sin likes en el momento de la consulta, lo que sugiere una adopcion muy limitada. Resulta util para desarrolladores que necesiten transcripcion de malgache en entornos con restricciones de memoria, donde el ahorro de aproximadamente 45 millones de parametros y la reduccion del embedding de tokens pueden marcar diferencia en despliegues ajustados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | 763.461.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 segundos, propia de Whisper) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors) |
| Idiomas soportados | malgache (`mg`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-large-v3-turbo, un transformer encoder-decoder con atencion estandar disenado para reconocimiento automatico del habla sobre ventanas de audio de 30 segundos muestreadas a 16 kHz. La innovacion de esta variante no reside en el entrenamiento, sino en la poda del vocabulario: se redujo de 51.865 a 16.384 tokens (un 68,41% de reduccion) mediante la tecnica de trimming descrita en el blog de Hugging Face. La seleccion de tokens se realizo mediante mineria sobre 99.745 textos del dataset lbourdois/fineweb-2-trimming, correspondientes al malgache.

No se ha realizado un reentrenamiento completo del modelo tras la poda; el autor indica que el modelo podado "deberia comportarse de forma similar al original" para el idioma objetivo, pero advierte que puede rendir mal en otros idiomas. No se dispone de informacion sobre el proceso de entrenamiento original mas alla de la referencia al paper de Whisper (Radford et al., 2022), que empleo supervision debil a gran escala sobre datos de audio y texto. No se documenta en la informacion disponible si hubo RLHF, DPO ni ajuste fino adicional.

## Capacidades

- Transcripcion de audio a texto en malgache (`mg`), con tarea `transcribe` configurable.
- Reconocimiento automatico del habla sobre audio de hasta 30 segundos por ventana (caracteristica de Whisper).
- Soporte de la pipeline `automatic-speech-recognition` de transformers.
- Compatible con endpoints de inferencia (tag `endpoints_compatible`).
- No soporta tool calling ni function calling (no es una capacidad de Whisper).
- No soporta razonamiento multi-paso ni comportamiento agentico.
- Capacidad multilingue muy limitada: solo malgache de forma fiable; otros idiomas pierden tokens en el vocabulario podado.
- No dispone de modo "thinking", vision ni audio generativo; es exclusivamente ASR.

## Casos de uso

- Transcripcion de reuniones en malgache: el modelo convierte grabaciones de audio de hasta 30 segundos por segmento en texto, adecuado para actas y documentacion de reuniones en organizaciones malgaches.
- Subtitulado de contenido audiovisual: permite generar subtitulos en malgache para videos, podcasts o material educativo, con la ventaja de un modelo mas ligero que el original para procesar lotes grandes.
- Archivado y busqueda de audio historico: transcripcion de archivos de radio o entrevistas en malgache para indexacion y busqueda textual posterior.
- Asistentes de voz para atencion al ciudadano: integracion en sistemas de informacion publica que atiendan consultas habladas en malgache, con despliegue en infraestructura de bajos recursos gracias al menor footprint.
- Investigacion linguistica: generacion de corpus transcritos de malgache para estudios de linguistica computacional y entrenamiento de modelos de lenguaje en idiomas de bajos recursos.
- Despliegue en dispositivos con memoria limitada: al reducir el vocabulario y el tamano del modelo, es viable en entornos donde whisper-large-v3-turbo completo no cabria, como GPUs de gama media o instancias cloud economicas.
- Accesibilidad: transcripcion de audio a texto para personas con discapacidad auditiva en contenido en malgache.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo ocupa 1,5 GB en safetensors, por lo que en fp32 rondaria los 3 GB y en fp16 aproximadamente 1,5 GB.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, cabe en GPUs consumer como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU consumer: si, por el reducido numero de parametros (763 millones) y el tamano del repo.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), endpoints de Hugging Face (tag `endpoints_compatible`). No se documenta soporte explicito de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alphaedge-ai/whisper-large-v3-turbo-mlg-16384 | 763.461.120 | 16.384 | malgache | Apache 2.0 | Hugging Face |
| openai/whisper-large-v3-turbo (original) | 808.878.080 | 51.865 | multilingue | Apache 2.0 | Hugging Face |
| openai/whisper-large-v3 | no disponible en la informacion | no disponible | multilingue | Apache 2.0 | Hugging Face |

La comparativa se limita al modelo base y a la version large-v3 de la familia Whisper, dado que no se dispone de datos de rendimiento del modelo podado ni de alternativas especificas para malgache en la informacion proporcionada. El modelo podado ofrece aproximadamente un 5,61% menos de parametros y un 68,41% menos de vocabulario que el original, a costa de perder cobertura multilingue.

## Limitaciones y advertencias

- Solo soporta malgache de forma fiable; el vocabulario podado elimina tokens de otros idiomas, por lo que la transcripcion en otras lenguas puede fallar o producir resultados incorrectos.
- Riesgo de alucinacion: como todo modelo Whisper, puede generar texto plausible en silencios o audio ruidoso.
- Sesgos: hereda los sesgos del dataset de entrenamiento original de Whisper y de los 99.745 textos usados para la mineria de tokens, sin que se documente su composicion detallada.
- Limitacion de contexto de audio: ventana de 30 segundos por inferencia, propia de Whisper; audios mas largos requieren segmentacion.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias de rendimiento tras la poda.
- Adopcion muy baja (25 descargas, 0 likes) y sin benchmarks publicados; no se recomienda para produccion sin evaluacion previa en el dominio objetivo.
- No se documenta soporte de cuantizacion ni formatos GGUF, lo que limita opciones de despliegue en CPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-large-v3-turbo-mlg-16384
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset de mineria: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper de Whisper: https://arxiv.org/abs/2212.04356
