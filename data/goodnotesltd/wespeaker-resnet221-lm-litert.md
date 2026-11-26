# GoodnotesLtd/wespeaker-resnet221-lm-litert

## Resumen

`GoodnotesLtd/wespeaker-resnet221-lm-litert` es una conversión de primera parte a formato LiteRT (TFLite) del checkpoint de reconocimiento de hablante `Wespeaker/wespeaker-voxceleb-resnet221-LM`. Lo publica GoodnotesLtd como parte de su producto Goodmeet, y su función no es generar texto ni razonar, sino extraer embeddings de identidad de voz de 256 dimensiones que permiten segmentar y atribuir turnos de palabra en una conversación (speaker diarization). El modelo base procede del proyecto WeSpeaker (wenet-e2e), una implementación de referencia en PyTorch para tareas de speaker verification y diarization entrenada sobre VoxCeleb.

La relevancia de esta ficha es acotada y muy específica: no se trata de un LLM ni de un modelo multimodal, sino de un extractor de features de audio optimizado para ejecución en CPU mediante XNNPACK dentro de LiteRT 2.1.6, con la intención de integrarse en pipelines de reuniones (Goodmeet) que necesitan identificar quién habla en tiempo real o en postproceso. El repositorio ocupa aproximadamente 0,1 GB y se distribuye con licencia Apache-2.0, heredando los términos y atribuciones del modelo original.

Es importante señalar desde el principio que la model card del autor indica explícitamente que el candidato no ha superado la matriz L1 dinámica de ONNX ni la suite completa L3 de cualificación, por lo que se trata de una publicación aprobada por separado de las puertas de validación. Cualquier evaluación de producción debe tener en cuenta ese caveat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet221 (red convolucional residual para embeddings de hablante) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 998 frames (máximo 10 segundos por llamada) |
| Tipos de cuantizacion | FP32 (única variante publicada) |
| Idiomas soportados | no disponible (modelo de hablante, independiente del idioma en teoría) |
| Licencia | Apache-2.0 |
| Formato de pesos | LiteRT / TFLite (conversión desde checkpoint PyTorch de WeSpeaker) |

## Arquitectura y entrenamiento

El modelo es una ResNet221, es decir, una CNN residual profunda de 221 capas orientada a la extracción de representaciones de identidad de hablante, no un transformer ni un modelo generativo. La salida es un embedding de 256 dimensiones por ventana de audio. La conversión a LiteRT fija la entrada en 998 frames, aplica sustracción de la media de fbank de Kaldi de forma compartida y rellena con ceros hasta completar la ventana; el límite operativo es de diez segundos por llamada, y la evidencia de identidad en Android debe contener al menos nueve segundos para ser considerada válida.

El checkpoint de origen es `Wespeaker/wespeaker-voxceleb-resnet221-LM` en el commit `26732f43821f238bfb258c5ef54924a798e62118`, y la implementación de referencia está en el repositorio wenet-e2e/wespeaker en el commit `9fecd6cb4f47475d01761d87c826298dff4ef18c`. No se detallan en la información disponible el número de tokens de audio, la composición exacta del dataset de entrenamiento ni si hubo etapas de fine-tuning adicionales más allá de lo que aporta el modelo base; el nombre "LM" en el checkpoint sugiere un componente de language model asociado en el pipeline original de WeSpeaker, pero su naturaleza exacta no se especifica. La conversión en sí no introduce entrenamiento nuevo: es una transformación de formato con requisitos de runtime concretos (LiteRT 2.1.6, XNNPACK CPU, runners inyectados con ABI 6 de asr-cpp-node).

## Capacidades

- Extracción de embeddings de hablante de 256 dimensiones a partir de audio fbank.
- Speaker diarization: segmentación y atribución de turnos de palabra en reuniones y conversaciones.
- Speaker verification: comparación de embeddings para decidir si dos fragmentos corresponden al mismo hablante.
- Ejecución en CPU mediante XNNPACK, sin necesidad de GPU.
- Integración en pipelines Android y en runners de asr-cpp-node (ABI 6).
- Entrada de audio de hasta diez segundos por llamada, con ventana fija de 998 frames.
- No soporta generación de texto, tool calling, agentes, visión, audio generativo ni razonamiento multi-step.

## Casos de uso

- Diarización de reuniones en Goodmeet: el modelo extrae embeddings por ventana de audio y permite etiquetar quién habla en cada turno, aprovechando la ventana de hasta diez segundos por llamada para cubrir intervenciones típicas.
- Identificación de participantes en Android: con al menos nueve segundos de evidencia de voz, el modelo genera el embedding necesario para verificar la identidad del hablante en el dispositivo, sin depender de la nube.
- Transcripción enriquecida con hablantes: combinado con un ASR, permite asociar cada segmento transcrito a un hablante concreto en pipelines de actas automáticas.
- Verificación de identidad en llamadas de soporte: comparación de embeddings entre una muestra de referencia y el audio de la llamada para confirmar que el interlocutor es quien dice ser.
- Análisis forense de audio: agrupación de fragmentos por hablante en grabaciones largas procesadas por lotes con ventanas de diez segundos.
- Control de calidad de grabaciones: detección de cambios de hablante para segmentar y validar la calidad de la captura en entornos de reunión.
- Procesamiento en dispositivos de bajos recursos: al ejecutarse en CPU vía XNNPACK y ocupar un repositorio de 0,1 GB, es viable en entornos sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona documentos internos de diagnóstico (`docs/benchmarks/2026-11-26-speaker-litert-diagnosis.md` y `2026-11-26-speaker-litert-long-evidence.md`) y afirma que el candidato no ha pasado la matriz L1 dinámica de ONNX ni la suite completa L3, pero no se incluyen cifras de EER, DER ni latencia en la información proporcionada.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para ejecución en CPU mediante XNNPACK.
- GPU recomendadas: no aplica; no se documenta soporte GPU para esta conversión.
- Compatibilidad con GPU de consumo: irrelevante para el caso de uso previsto, que es CPU.
- Runtime obligatorio: LiteRT 2.1.6 con XNNPACK CPU y runners inyectados con ABI 6 de asr-cpp-node.
- Opciones de despliegue: LiteRT/TFLite en Android y en pipelines asr-cpp-node; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.
- Tamaño del repositorio: aproximadamente 0,1 GB.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GoodnotesLtd/wespeaker-resnet221-lm-litert | ResNet221 para speaker embedding | no disponible | 998 frames (máx. 10 s) | LiteRT/TFLite | Apache-2.0 | Hugging Face |
| Wespeaker/wespeaker-voxceleb-resnet221-LM | ResNet221 para speaker embedding | no disponible | no disponible en esta ficha | PyTorch (checkpoint original) | ver licencia upstream | Hugging Face |
| Otros modelos de speaker diarization de WeSpeaker | ResNet34/ResNet221 y variantes | no disponible | no disponible | PyTorch/ONNX | Apache-2.0 (según upstream) | Hugging Face / GitHub |

La comparativa se limita al ecosistema WeSpeaker porque la información proporcionada no incluye datos de modelos alternativos de otros proveedores (por ejemplo, pyannote) que permitan una comparación numérica rigurosa. No se dispone de cifras de EER o DER para establecer diferencias de rendimiento.

## Limitaciones y advertencias

- El autor indica explícitamente que el candidato no ha superado la matriz L1 dinámica de ONNX ni la suite completa L3 de cualificación; la publicación se aprobó por separado de esas puertas.
- La entrada está fijada a 998 frames con un máximo de diez segundos por llamada; no es adecuado para audio continuo largo sin segmentación previa.
- La evidencia de identidad en Android debe contener al menos nueve segundos, lo que limita su uso en intervenciones muy cortas.
- Solo se publica la variante FP32; no hay cuantizaciones INT8 ni otras variantes en la información disponible.
- No se documentan sesgos conocidos ni tasas de error por idioma, género o acento; la ausencia de benchmarks públicos impide evaluar su robustez fuera del dominio de VoxCeleb.
- Riesgo de confusión entre hablantes con voces similares o en condiciones de ruido; no se aportan métricas de EER que permitan cuantificarlo.
- Aunque la licencia es Apache-2.0, los términos y atribuciones del modelo original de WeSpeaker siguen siendo aplicables y deben preservarse.
- El runtime es estricto: LiteRT 2.1.6, XNNPACK CPU y ABI 6 de asr-cpp-node; versiones distintas pueden no ser compatibles.
- No es un modelo generativo: no puede usarse para transcripción, razonamiento ni tareas de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GoodnotesLtd/wespeaker-resnet221-lm-litert
- Modelo base: https://huggingface.co/Wespeaker/wespeaker-voxceleb-resnet221-LM
- Checkpoint de origen (commit): https://huggingface.co/Wespeaker/wespeaker-voxceleb-resnet221-LM/tree/26732f43821f238bfb258c5ef54924a798e62118
- Implementación de referencia (WeSpeaker): https://github.com/wenet-e2e/wespeaker/tree/9fecd6cb4f47475d01761d87c826298dff4ef18c
