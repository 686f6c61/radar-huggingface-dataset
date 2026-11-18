# datacrunch/tolkio-models

## Resumen

Tolkio models es un repositorio agregado de modelos de IA orientados a la traduccion de voz offline en Android, publicado por datacrunch. No se trata de un unico modelo entrenado de forma monolotica, sino de una coleccion de componentes heterogeneos (reconocimiento de voz, traduccion automatica, sintesis de voz, deteccion de actividad vocal, diarizacion de hablantes y clasificacion de idioma) empaquetados en formato ONNX y GGUF para su ejecucion local en dispositivos moviles. El repositorio suma aproximadamente 1.942 millones de parametros en pesos safetensors y ocupa 10,3 GB en disco.

La propuesta de valor es la inferencia completamente offline: la aplicacion Tolkio descarga estos modelos para traducir conversaciones en tiempo real sin conexion de red, lo que resulta relevante para viajes, entornos con conectividad limitada y escenarios de privacidad donde el audio no debe salir del dispositivo. El repositorio combina modelos de terceros bajo licencias dispares (CC BY 4.0, Apache 2.0, MIT, OpenRAIL-M, CC BY-SA 4.0) y algunos han sido modificados por el autor (recuantizacion, fine-tuning con ruido, exportacion a ONNX).

El pipeline declarado es translation, aunque el contenido abarca multiples tareas del habla. La ausencia de una model card tecnica unificada, de benchmarks publicados y de una lista de idiomas soportados hace que la evaluacion detallada dependa de la documentacion de cada modelo componente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coleccion heterogenea: Conformer/TDT y CTC (Parakeet), transformer (Index-Translate 2B, TranslatePsy-AfriSLM), VITS (sintesis), Zipformer (X-ASR), CNN (Silero VAD, CAM++), Kokoro (TTS) |
| Parametros totales | 1.942.653.248 (pesos safetensors del repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MatMulNBits block 128), 2 bits empaquetado, 8 bits (GGUF), int8 (sherpa-onnx), 16 bits (pesos TTS y vocoder) |
| Idiomas soportados | no disponible (la model card menciona idiomas africanos, coreano, japones, chino-ingles y clasificador de 95 idiomas, pero no hay lista consolidada) |
| Licencia | Mixta (mixed): CC BY 4.0, Apache 2.0, MIT, OpenRAIL-M, CC BY-SA 4.0 segun componente |
| Formato de pesos | ONNX, GGUF, safetensors, sherpa-onnx |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura unica. Cada carpeta contiene un modelo independiente con su propio origen y proceso de entrenamiento. El componente ASR principal (asr2/) parte de NVIDIA Parakeet TDT 0.6B v3, un modelo Conformer con decodificacion TDT (Token-and-Duration Transducer), y fue reentrenado por Hohasha Studios para mejorar la robustez frente a ruido y distancia. Para ello se usaron como objetivos las transcripciones del propio modelo sobre habla limpia, y se aumentaron datos de FLEURS, VoxPopuli, Common Voice y Granary YouTube con ruido y reverberacion de sala. Sus capas matriciales se cuantizaron a 4 bits con MatMulNBits de ONNX Runtime.

La traduccion automatica se cubre con Index-Translate 2B del equipo bilibili Index, exportado a GGUF en 4 y 8 bits, y con TranslatePsy-AfriSLM 0.8B y 2B de QVAC para idiomas africanos. La sintesis de voz combina Supertonic 3 (con vocoder ONNX en 16 bits), Kokoro 82M v1.1-zh para chino y las voces VITS OpenBible. El resto de componentes son utilitarios: Silero VAD para deteccion de actividad vocal, CAM++ y pyannote 3.0 para diarizacion, TIGER, y Silero Language Classifier 95 para enrutar al reconocedor correcto. No se documentan detalles de RLHF, DPO ni composicion exacta de datasets para los modelos de traduccion.

## Capacidades

- Reconocimiento automatico de voz (ASR) offline en varios idiomas, con variantes optimizadas para entornos ruidosos y habla a distancia.
- Traduccion automatica de texto entre idiomas mediante modelos dedicados (Index-Translate 2B, TranslatePsy-AfriSLM 0.8B/2B).
- Sintesis de voz (TTS) multilingue con Supertonic 3, Kokoro 82M y voces VITS.
- Deteccion de actividad vocal (VAD) para segmentar audio y ahorrar computo.
- Clasificacion de idioma hablado (95 idiomas) para seleccionar el reconocedor adecuado.
- Diarizacion de hablantes (CAM++, pyannote 3.0, TIGER) para atribuir turnos en conversaciones.
- Reconocimiento de chino-ingles con puntuacion (X-ASR Zipformer) y de japones (Parakeet TDT-CTC 0.6B ja).
- Cobertura de idiomas africanos y coreano via Omnilingual ASR 300M de Meta.
- Ejecucion completamente offline sin dependencia de red.
- Soporte de importacion desde carpeta local en la app, ademas de descarga.

## Casos de uso

- Traduccion de conversaciones en viajes: el pipeline ASR + MT + TTS permite mantener dialogos cara a cara sin conexion, usando el VAD para segmentar turnos y el clasificador de idioma para elegir el reconocedor correcto.
- Atencion al publico en entornos con mala conectividad: oficinas de extranjeria, turismo rural o asistencia humanitaria donde no hay red fiable y se requiere traduccion local.
- Privacidad en ambito sanitario o legal: al ejecutarse integramente en el dispositivo, el audio y las transcripciones no salen del telefono, lo que facilita el cumplimiento de normativas de datos.
- Subtitulado en directo de reuniones presenciales: el ASR reentrenado para ruido y distancia resulta adecuado para salas con varios hablantes, y la diarizacion atribuye las intervenciones.
- Accesibilidad para personas con discapacidad auditiva: transcripcion y traduccion en tiempo real de conversaciones presenciales en el propio movil.
- Aplicaciones de aprendizaje de idiomas: uso del TTS multilingue y del ASR para practicar pronunciacion y recibir transcripciones sin enviar datos a la nube.
- Despliegue en dispositivos de gama media: las cuantizaciones a 4, 2 e int8 bits y el formato ONNX permiten ejecutar el conjunto en telefonos Android sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repo completo ocupa 10,3 GB, pero no todos los componentes se cargan simultaneamente; el ASR de 0,6B en 4 bits ronda los 0,4-0,6 GB, el MT de 2B en 4 bits alrededor de 1,2-1,5 GB y el TTS es ligero (Kokoro 82M, VITS).
- GPU recomendadas: no disponible; el diseno apunta a CPU movil mediante ONNX Runtime y sherpa-onnx.
- Cabe en GPU consumer: si, los componentes individuales caben en GPUs de 8 GB o menos; no se documenta un requisito agregado.
- Opciones de despliegue: ONNX Runtime (MatMulNBits), sherpa-onnx, llama.cpp/Ollama para los GGUF de traduccion; vLLM y TGI no estan documentados para estos formatos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Tolkio models (este repo) | 1.942 M agregados | no disponible | Mixta | Suite offline para Android |
| Whisper large-v3 | ~1.550 M | 30 s de audio | MIT | ASR multilingue |
| NLLB-200 | hasta 54.500 M | 512 tokens | CC BY-NC 4.0 | Traduccion |
| SeamlessM4T v2 | ~2.300 M | no disponible | CC BY-NC 4.0 | Speech-to-speech |

La comparativa es orientativa: Tolkio no es un modelo unico sino una integracion de componentes, por lo que la comparacion directa con modelos monoloticos no es homogenea.

## Limitaciones y advertencias

- Licencia mixta: cada componente tiene su propia licencia; Supertonic 3 usa OpenRAIL-M con restricciones de uso, y las voces VITS estan bajo CC BY-SA 4.0 (copyleft). Verificar cada subcarpeta antes de uso comercial.
- No hay lista consolidada de idiomas soportados ni model card tecnica unificada.
- Ausencia de benchmarks publicados que permitan validar calidad de ASR, MT o TTS.
- Riesgo de alucinacion y errores de traduccion inherente a los modelos de lenguaje componentes, especialmente en dominios especializados.
- El reentrenamiento del ASR con pseudoetiquetas del propio modelo puede propagar sesgos y errores del modelo base.
- Varios componentes estan recuantizados a 4 o 2 bits, lo que puede degradar la precision frente a los originales.
- Dependencia del ecosistema ONNX Runtime y sherpa-onnx para el despliegue movil.
- Fecha de creacion futura (2026) en los metadatos; conviene verificar la vigencia y el estado de mantenimiento del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/datacrunch/tolkio-models
- NVIDIA Parakeet TDT 0.6B v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- NVIDIA Parakeet TDT-CTC 0.6B ja: https://huggingface.co/nvidia/parakeet-tdt_ctc-0.6b-ja
- Meta Omnilingual ASR: https://huggingface.co/facebook/omniasr-300m
- Silero VAD: https://github.com/snakers4/silero-vad
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Kokoro 82M: https://huggingface.co/hexgrad/Kokoro-82M
- X-ASR: https://huggingface.co/Gilgamesh-J/X-ASR
