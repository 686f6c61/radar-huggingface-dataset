# Sanghyang00/ELARSpeech-OmniASR-1B-abz

## Resumen

ELARSpeech-OmniASR-1B-abz es un modelo de reconocimiento automatico del habla (ASR) especializado en abui, una lengua papu de la isla de Alor (Indonesia) con codigo ISO 639-3 `abz`. Lo publica el usuario Sanghyang00 como un ajuste fino (fine-tune) del checkpoint `aadel4/omniASR-CTC-1B-v2`, un modelo base de aproximadamente 1.000 millones de parametros, y esta disenado para transcribir audio en una unica lengua de bajos recursos, un escenario donde los sistemas ASR multilingues genericos suelen fallar por falta de datos de entrenamiento.

Tecnicamente es un `Wav2Vec2ForCTC` de 975.678.898 parametros (segun los pesos en safetensors), con cabeza de clasificacion CTC sobre el vocabulario de caracteres del abui. La entrada debe ser audio mono muestreado a 16 kHz. El modelo se distribuye en formato safetensors dentro de la libreria `transformers` y su repositorio ocupa 3,9 GB, lo que corresponde a pesos en precision de 32 bits.

Su relevancia es doble: por un lado, amplia la cobertura de lenguas minoritarias en el ecosistema open source, donde el abui apenas tiene recursos; por otro, sirve como ejemplo de destilacion de un modelo base grande hacia un idioma concreto. La model card del autor indica que el artefacto exportado ha superado una verificacion de transcripcion exacta (estado **PASS**) frente al checkpoint original sobre un conjunto fijo de evaluacion, aunque no se publican cifras de WER ni detalles del conjunto de validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2ForCTC (transformer convolucional + encoder con atencion) |
| Parametros totales | 975.678.898 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica en tokens; es un modelo CTC sobre forma de onda. La longitud de audio procesable depende de la memoria disponible |
| Tipos de cuantizacion | solo safetensors en el repositorio (aparentemente fp32). No se publican versiones GGUF, int8 ni cuantizadas |
| Idiomas soportados | abui (`abz`), unico idioma |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura `Wav2Vec2ForCTC`: un extractor de caracteristicas convolucional que convierte la forma de onda en bruto (16 kHz) en una secuencia de representaciones latentes, seguido de un encoder transformer con codificacion posicional relativa y una cabeza lineal que proyecta cada fotograma a las clases del vocabulario de salida. La decodificacion es CTC (greedy argmax en el ejemplo de uso proporcionado), lo que evita la necesidad de un decodificador de lenguaje externo y mantiene la inferencia sencilla.

El modelo es un ajuste fino del checkpoint `aadel4/omniASR-CTC-1B-v2`. No se especifica en la informacion disponible el numero de tokens de audio, la composicion del dataset de abui, ni si se aplicaron tecnicas de aumento de datos, regularizacion o decodificacion con modelo de lenguaje. Tampoco se documenta si hubo etapas de RLHF/DPO (no aplicables en un pipeline CTC puro) ni innovaciones tecnicas adicionales. La model card unicamente indica que la salida exportada fue verificada contra el checkpoint original de ELARSpeech sobre un conjunto fijo de evaluacion, con resultado de transcripcion exacta **PASS**.

## Capacidades

- Reconocimiento automatico del habla en abui a partir de audio mono a 16 kHz.
- Salida a nivel de caracteres/grafemas mediante decodificacion CTC.
- Transcripcion de audio de duracion variable, con la memoria como unico limite practico.
- Integracion directa con `transformers` (`AutoProcessor` + `Wav2Vec2ForCTC`) y con el ecosistema de endpoints compatibles de Hugging Face.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de modo agente ni de razonamiento multi-paso.
- No es multilingue: esta restringido a abui.
- No tiene capacidades de vision, audio comprensivo (speech-to-text-to-text) ni generacion de texto libre; es exclusivamente speech-to-text.

## Casos de uso

- Transcripcion de documentacion linguistica de campo: los investigadores que graban hablantes de abui pueden transcribir horas de audio sin anotacion manual, obteniendo una primera pasada que acelera la anotacion experta.
- Digitalizacion de archivos orales en riesgo de desaparicion: cintas y grabaciones historicas en abui pueden pasarse a texto buscable, algo inasumible manualmente por la escasez de hablantes y transcriptores.
- Construccion de corpus paralelos abui-indonesio: las transcripciones automaticas sirven como base para alinear audio y texto en proyectos de traduccion asistida entre lenguas minoritarias.
- Subtitulado automatico de contenido audiovisual local: videos comunitarios o educativos en abui pueden subtitularse con una pasada ASR y posterior revision humana.
- Apoyo a la ensenanza de la lengua: materiales didacticos con transcripcion de pronunciacion que permitan a estudiantes y docentes verificar la correspondencia grafia-sonido.
- Investigacion en ASR de bajos recursos: sirve como punto de partida para experimentos de ajuste fino, comparacion con modelos multilingues y evaluacion de tecnicas de adaptacion a dominios con pocos datos.
- Preprocesado en pipelines de analisis conversacional: transcripcion previa para posteriores tareas de segmentacion, diarizacion o busqueda semantica sobre audio en abui.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta que la verificacion de transcripcion exacta contra el checkpoint ELARSpeech original obtuvo el estado **PASS** sobre un conjunto fijo de evaluacion, sin especificar el tamano del conjunto, el WER ni el CER resultantes.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 4 GB solo para pesos, mas activaciones; en la practica entre 5 y 8 GB segun la longitud del audio y el tamano de lote.
- VRAM estimada en fp16/bf16: aproximadamente 2 GB para pesos, mas activaciones; cabe holgadamente en GPUs de 6-8 GB.
- GPUs recomendadas para produccion: NVIDIA A10G, L4, A100 o H100 si se necesita alto throughput o lotes grandes; para desarrollo y despliegue ligero basta con una RTX 3060 (12 GB), RTX 4060 Ti o RTX 4090.
- Cabe en GPU de consumo: si, cualquier GPU con 6 GB o mas de VRAM en fp16 (por ejemplo GTX 1660 Super, RTX 2060, RTX 3060, RTX 4090).
- CPU: es viable en CPU para uso por lotes fuera de linea; la latencia sera mayor por la etapa convolucional y el encoder de 1B de parametros.
- Opciones de despliegue: `transformers` (referencia), Hugging Face Inference Endpoints (el repositorio esta etiquetado como `endpoints_compatible`), exportacion a ONNX Runtime o TorchScript. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, que no estan orientados a modelos `Wav2Vec2ForCTC`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ELARSpeech-OmniASR-1B-abz | 975.678.898 | abui (`abz`) | Wav2Vec2ForCTC | no disponible | Hugging Face |
| aadel4/omniASR-CTC-1B-v2 (modelo base) | aprox. 1.000 millones (segun nomenclatura del modelo) | no disponible | Wav2Vec2ForCTC | no disponible | Hugging Face |
| Alternativas ASR multilingues de la misma categoria (familias XLSR/MMS) | no disponible | multilingue | no disponible | no disponible | Hugging Face |

No se dispone de datos comparativos de WER/CER entre este modelo y alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo monoingue: solo cubre abui (`abz`); su uso en otras lenguas producira salidas sin sentido.
- La precision varia con las condiciones de grabacion (ruido, microfono, distancia), la poblacion de hablantes, la ortografia empleada y el dominio del audio; la propia model card lo advierte.
- Es obligatorio remuestrear la entrada a 16 kHz mono; un audio estereo o con otra frecuencia degradara el resultado.
- Riesgo de alucinacion en CTC: en fragmentos silenciosos o ininteligibles el modelo puede emitir caracteres espurios en lugar de una salida vacia.
- No se publica la licencia, ni la del modelo base con claridad en la informacion disponible, por lo que el uso comercial queda sin garantia juridica y requiere consultar el repositorio del modelo base y la documentacion del proyecto ELARSpeech.
- Ausencia total de benchmarks publicos (WER, CER): no es posible estimar la calidad real en produccion sin una evaluacion propia.
- El modelo no incluye normalizacion de texto, puntuacion ni capitalizacion mas alla de lo aprendido en el vocabulario CTC.
- No soporta tool calling, agentes ni procesamiento multimodal; cualquier aplicacion debe construirse sobre la salida de texto plano.
- Vocabulario y ortografia del abui potencialmente incompletos; puede fallar ante variantes dialectales o prestamos no vistos en entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sanghyang00/ELARSpeech-OmniASR-1B-abz
- Modelo base: https://huggingface.co/aadel4/omniASR-CTC-1B-v2
- Documentacion del ecosistema transformers (Wav2Vec2): https://huggingface.co/docs/transformers/model_doc/wav2vec2
- Paper de referencia de Wav2Vec2: https://arxiv.org/abs/2006.11477
- Paper de referencia de CTC: https://www.cs.toronto.edu/~graves/icml_2006.pdf
