# Hebrish/Nemotron-Speech-Streaming-EN-0.6B-English-Hebrew-Codeswitching

## Resumen

Nemotron-Speech-Streaming-EN-0.6B-English-Hebrew-Codeswitching es un ajuste fino (fine-tune) del modelo de reconocimiento automatico del habla (ASR) en streaming de NVIDIA, `nvidia/nemotron-speech-streaming-en-0.6b`, realizado por el usuario Hebrish. El objetivo es dotar al modelo base, entrenado originalmente solo en ingles, de capacidad para transcribir conversaciones con alternancia de codigo (code-switching) entre ingles y hebreo, un fenomeno muy comun en comunidades bilingues. El modelo conserva la arquitectura FastConformer con decodificador RNNT del original y un tamano de aproximadamente 0,6 mil millones de parametros.

La relevancia de este modelo radica en que aborda un caso practico poco cubierto: el ASR multilingue en tiempo real para pares de idiomas con escrituras y fonetica muy distintas (alfabeto latino frente a alfabeto hebreo). Al partir de un modelo optimizado para streaming de baja latencia, el fine-tune mantiene la capacidad de transcripcion incremental, lo que lo hace adecuado para subtitulado en vivo, asistentes de voz y analisis de reuniones bilingues.

El repositorio esta publicado bajo la licencia NVIDIA Open Model License y tiene acceso restringido (gated), por lo que es necesario aceptar las condiciones en Hugging Face antes de descargarlo. El modelo base declara solo el idioma ingles en sus metadatos, aunque el fine-tune incorpora hebreo en la practica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador RNNT (transducer) |
| Parametros totales | aproximadamente 0,6 mil millones (heredado del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio en streaming; ventana dependiente de la configuracion de chunks) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles y hebreo (code-switching); metadatos declaran solo `en` |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | NeMo (`.nemo`); no se indica safetensors ni GGUF |
| Tamano del repositorio | 4,9 GB |
| Libreria | NeMo |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura FastConformer del modelo base de NVIDIA, un encoder convolucional-autoattention disenado para ASR de baja latencia, acoplado a un decodificador RNNT (Recurrent Neural Network Transducer). Esta combinacion permite transcripcion en streaming con emision incremental de tokens, lo que reduce la latencia frente a arquitecturas de atencion completa. El tamano de 0,6 B de parametros lo situa en la gama compacta, apta para despliegue en GPU de consumo o incluso CPU con optimizaciones.

El ajuste fino se realizo sobre el checkpoint `nvidia/nemotron-speech-streaming-en-0.6b` utilizando, segun los metadatos del repositorio, el dataset `danielrosehill/Read-Aloud-Voice-Sentences` y `openslr/librispeech_asr`. No se especifican en la informacion disponible el numero de horas de audio de entrenamiento, la composicion exacta del corpus bilingue ni si se aplicaron tecnicas de aumento de datos o regularizacion especificas. Tampoco se documentan detalles sobre el esquema de entrenamiento (learning rate, epocas, estrategia de congelacion de capas) ni sobre posibles etapas de alineacion o rescoring.

## Capacidades

- Reconocimiento automatico del habla (ASR) en streaming con emision incremental de transcripciones.
- Transcripcion con alternancia de codigo (code-switching) entre ingles y hebreo dentro de una misma frase o turno de habla.
- Manejo de audio en tiempo real gracias a la arquitectura FastConformer orientada a baja latencia.
- Salida de transcripcion en texto con marcas temporales segun la configuracion del decodificador RNNT.
- Capacidad multilingue limitada a los dos idiomas del fine-tune (ingles y hebreo); no se documentan otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio generation ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Subtitulado en vivo para reuniones bilingues ingles-hebreo: el modelo puede transcribir de forma incremental intervenciones que mezclan ambos idiomas, aprovechando la naturaleza streaming de FastConformer para emitir texto con latencia reducida.
- Asistentes de voz para comunidades bilingues: integracion en pipelines de reconocimiento de comandos donde el usuario alterna ingles y hebreo, manteniendo una sola llamada al modelo en lugar de encadenar dos ASR monolingues.
- Transcripcion de clases y seminarios en entornos academicos israelies o angloparlantes con estudiantes hebreoparlantes, donde la alternancia de codigo es frecuente.
- Analisis de llamadas de atencion al cliente: procesamiento por lotes o en tiempo real de grabaciones donde el agente habla ingles y el cliente hebreo, generando transcripciones unificadas para control de calidad.
- Accesibilidad para personas con discapacidad auditiva en entornos bilingues: generacion de subtitulos en directo para eventos y retransmisiones que combinan ambos idiomas.
- Investigacion en linguistica computacional sobre code-switching: el modelo sirve como linea base para estudiar el rendimiento de ASR en pares de idiomas con escrituras distintas y para comparar estrategias de fine-tune frente a modelos multilingues genericos.
- Prototipado de aplicaciones de voz en dispositivos con recursos limitados: su tamano de 0,6 B permite desplegarlo en GPU de consumo o entornos edge, facilitando pruebas de concepto sin infraestructura de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano de 0,6 B de parametros, una estimacion razonable en FP16 ronda los 1,2-1,5 GB de pesos mas overhead de runtime, aunque no se confirma en la documentacion.
- GPU recomendadas: no especificadas; por tamano, cabria en GPUs de consumo como RTX 3060, RTX 4060 o superiores, asi como en A100/H100 para despliegues de alta concurrencia.
- Compatibilidad con GPU de consumo: probable por el tamano del modelo, aunque no confirmada oficialmente.
- Opciones de despliegue: NeMo (libreria nativa), con posibilidad de exportacion a ONNX o TensorRT segun el ecosistema NVIDIA; no se documenta soporte directo en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hebrish/Nemotron-Speech-Streaming-EN-0.6B-English-Hebrew-Codeswitching | ~0,6 B | en, he (code-switching) | no disponible | NVIDIA Open Model License | gated en Hugging Face |
| nvidia/nemotron-speech-streaming-en-0.6b | ~0,6 B | en | no disponible | NVIDIA Open Model License | publico en Hugging Face |
| Whisper (OpenAI) | 0,039 B a 1,55 B | multilingue (99 idiomas) | 30 s de audio | MIT | publico |
| SeamlessM4T (Meta) | ~2,3 B | multilingue | no disponible | CC-BY-NC 4.0 | publico |

El modelo se distingue de Whisper por su enfoque streaming nativo y su especializacion en un par de idiomas concreto, mientras que Whisper ofrece cobertura multilingue amplia pero no esta optimizado para baja latencia. Frente al modelo base de NVIDIA, la diferencia clave es la incorporacion del hebreo y la capacidad de code-switching.

## Limitaciones y advertencias

- El fine-tune se ha realizado sobre un corpus limitado (`Read-Aloud-Voice-Sentences` y `LibriSpeech`), lo que puede provocar sobreajuste al dominio de lectura y un rendimiento inferior en habla espontanea o con ruido.
- El modelo base esta entrenado solo en ingles; la incorporacion del hebreo mediante fine-tune puede presentar sesgos y una calidad desigual entre ambos idiomas, especialmente en hebreo.
- Riesgo de alucinacion y errores de transcripcion en segmentos con code-switching denso o en acentos no representados en el corpus de entrenamiento.
- Los metadatos declaran unicamente el idioma `en`, lo que puede inducir a error a herramientas que filtren por idioma.
- La licencia NVIDIA Open Model License impone condiciones especificas para uso comercial; es necesario revisar sus terminos antes de desplegar en produccion.
- El acceso es restringido (gated): requiere aceptar condiciones en Hugging Face y no puede descargarse de forma anonima.
- No se documentan cuantizaciones oficiales ni formatos alternativos (GGUF, ONNX), lo que limita su uso fuera del ecosistema NeMo.
- El modelo tiene 0 likes y 120 descargas en el momento de la consulta, lo que sugiere una validacion comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hebrish/Nemotron-Speech-Streaming-EN-0.6B-English-Hebrew-Codeswitching
- Modelo base: https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b
- Dataset Read-Aloud-Voice-Sentences: https://huggingface.co/datasets/danielrosehill/Read-Aloud-Voice-Sentences
- Dataset LibriSpeech ASR (OpenSLR): https://huggingface.co/datasets/openslr/librispeech_asr
- DOI del modelo: https://doi.org/10.57967/hf/11107
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Documentacion de NeMo: https://docs.nvidia.com/nemo-framework/
