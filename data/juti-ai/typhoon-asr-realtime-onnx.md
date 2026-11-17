# juti-ai/typhoon-asr-realtime-onnx

## Resumen

Typhoon ASR Real-Time ONNX es la conversión a formato ONNX con cuantización int8 del modelo de reconocimiento automático del habla en tailandés Typhoon ASR Real-Time, desarrollado originalmente por SCB 10X (Typhoon). Se trata de un FastConformer-Transducer de 115 millones de parámetros diseñado específicamente para transcribir voz en tailandés, y esta variante empaqueta el encoder, decoder y joiner en tres ficheros ONNX ejecutables con sherpa-onnx, junto con el vocabulario y un detector de actividad de voz Silero VAD.

El modelo resuelve un problema concreto: la transcripción de voz en tailandés en local, sin conexión a servicios en la nube. Al estar cuantizado a int8 y ocupar apenas 138 MB en total, resulta viable ejecutarlo en el propio ordenador del usuario, algo que la aplicación Juti aprovecha para transcribir audio en tailandés de forma offline. La conversión, realizada por Tree3 (Juti), no reentrena los pesos: solo transforma el `.nemo` original a ONNX y aplica cuantización dinámica QUInt8.

Su relevancia actual radica en que ofrece una vía práctica de despliegue de ASR tailandés de calidad (14,64 % de CER en FLEURS Thai, prácticamente idéntico al original) con un coste de recursos mínimo y bajo licencia CC BY 4.0, lo que permite uso comercial con atribución. Es una pieza útil para integrar dictado o subtitulado en tailandés dentro de aplicaciones de escritorio o entornos con requisitos de privacidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer-Transducer (encoder, decoder y joiner) |
| Parámetros totales | 115 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de streaming/ASR por fragmentos; el chunking se gestiona con Silero VAD) |
| Tipos de cuantización | int8 (QUInt8, cuantización dinámica con onnxruntime) |
| Idiomas soportados | tailandés (th) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (encoder.int8.onnx, decoder.int8.onnx, joiner.int8.onnx) |

## Arquitectura y entrenamiento

El modelo es un FastConformer-Transducer, una arquitectura de tipo Conformer con downsampling acelerado pensada para ASR eficiente, combinada con un decoder y un joiner propios de los modelos transducer (RNN-T). Se distribuye en tres grafos ONNX separados: encoder (131.113.689 bytes), decoder (4.611.223 bytes) y joiner (2.067.638 bytes), más `tokens.txt` y `silero_vad.onnx`. El conjunto ocupa aproximadamente 138 MB tras la cuantización int8.

Los pesos proceden del `.nemo` oficial de Typhoon ASR Real-Time (SHA-256 `d3b731545a0a5cc9841e6b0fcb54cc87a38feae30cb987bb279a57b6734cbce2`), exportado con las herramientas de exportación de transducers NeMo de sherpa-onnx (`encoder.export`, `decoder.export`, `joint.export`, con metadatos añadidos al encoder) y cuantizado con `quantize_dynamic` de onnxruntime en modo QUInt8. No hubo reentrenamiento ni ajuste fino: la model card no detalla la composición del dataset de entrenamiento original ni si se aplicaron técnicas como RLHF o DPO, por lo que esos datos no están disponibles en la información proporcionada. Las herramientas empleadas fueron NeMo 3.0.0, torch 2.15.0, onnxruntime 1.32.0 y sherpa-onnx 2.0.1.

## Capacidades

- Reconocimiento automático del habla en tailandés, con salida de texto a partir de audio mono a 16 kHz.
- Decodificación en streaming/tiempo real, adecuada para transcripción incremental.
- Segmentación de audio largo mediante Silero VAD incluido, que corta las grabaciones en las pausas.
- Ejecución completamente offline en el dispositivo del usuario (la app Juti la usa para transcribir en local).
- Integración nativa con sherpa-onnx mediante `OfflineRecognizer.from_transducer` y `model_type="nemo_transducer"`.
- Soporte de múltiples hilos de inferencia (`num_threads` configurable).
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada más allá de ASR ni modo de razonamiento.

## Casos de uso

- Dictado por voz en tailandés en aplicaciones de escritorio: el modelo transcribe audio del micrófono en local con sherpa-onnx, sin enviar datos a la nube, lo que encaja en herramientas de productividad con requisitos de privacidad.
- Subtitulado y transcripción de reuniones en tailandés: el VAD incluido permite trocear grabaciones largas en pausas y transcribir cada segmento, generando actas o subtítulos de forma offline.
- Atención al cliente con voz en tailandés: integrado en un pipeline de ASR previo a un LLM, permite convertir consultas habladas en texto para su procesamiento posterior en sistemas de soporte.
- Aplicaciones móviles o de escritorio con recursos limitados: los 138 MB del paquete int8 y los 115 M de parámetros permiten desplegarlo en equipos sin GPU dedicada, manteniendo la transcripción en el dispositivo.
- Investigación y evaluación de ASR tailandés: sirve como baseline ligero y reproducible para comparar CER en conjuntos como FLEURS Thai o TVSpeech.
- Indexación y búsqueda de archivos de audio en tailandés: la transcripción offline permite generar índices de texto sobre grabaciones archivadas sin depender de servicios externos.
- Accesibilidad: generación de transcripciones en tiempo real para personas con dificultades auditivas en contextos donde el tailandés es el idioma principal.

## Benchmarks y rendimiento

La model card proporciona una comparación de tasa de error de caracteres (CER) sobre 100 clips por conjunto de prueba, con espacios y puntuación eliminados y uniendo ํ + า en ำ antes de puntuar:

| Conjunto de prueba | `.nemo` original | Esta variante ONNX int8 |
|---|---:|---:|
| FLEURS Thai (test) | 14,57 % | 14,64 % |
| TVSpeech (conjunto in-the-wild de Typhoon) | — | 8,56 % |

La diferencia entre el original y la versión int8 es de apenas 0,07 puntos porcentuales en FLEURS Thai, lo que indica que la cuantización apenas degrada la precisión. No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el paquete int8 ocupa 138 MB, por lo que el consumo de memoria es muy bajo y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos unos pocos cientos de MB libres es suficiente (por ejemplo, RTX 3060, RTX 4090, A100 o H100). También puede ejecutarse en CPU.
- Cabe en GPU consumer: sí, con amplio margen, dado el reducido tamaño del modelo.
- Opciones de despliegue: sherpa-onnx (Python y otras bindings), con los ficheros ONNX y `tokens.txt`; el VAD Silero se usa para segmentar audio largo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Formato | CER FLEURS Thai |
|---|---|---|---|---|---|---|
| Typhoon ASR Real-Time ONNX int8 (este) | 115 M | no disponible | th | CC BY 4.0 | ONNX int8 | 14,64 % |
| Typhoon ASR Real-Time (`.nemo` original) | 115 M | no disponible | th | CC BY 4.0 | NeMo | 14,57 % |
| Otras alternativas ASR tailandés | no disponible | no disponible | th | no disponible | no disponible | no disponible |

La información proporcionada no incluye otros modelos ASR comparables con datos verificables, por lo que la comparativa se limita al original frente a su conversión ONNX.

## Limitaciones y advertencias

- Solo soporta tailandés; no es multilingüe.
- La model card advierte de que el modelo escribe ำ como ํ + า, por lo que es necesario normalizar la salida (`replace("ํา", "ำ")`) para obtener texto correcto.
- Las referencias de FLEURS escriben los números con dígitos mientras el modelo los escribe con palabras, lo que penaliza la métrica CER; conviene tenerlo en cuenta al evaluar.
- Riesgo de alucinación y errores de transcripción inherentes a los modelos ASR, especialmente en audio ruidoso o con acentos no representados en el entrenamiento; la model card no documenta sesgos específicos.
- La licencia CC BY 4.0 permite uso comercial siempre que se atribuya a SCB 10X (Typhoon) y se indique la conversión; hay que conservar la atribución y el aviso de licencia.
- El modelo no fue reentrenado en esta conversión: cualquier limitación del original se mantiene.
- El VAD Silero incluido tiene licencia MIT, distinta de la del modelo principal; conviene revisar sus términos por separado.
- No se documentan requisitos de contexto, latencia ni throughput, lo que dificulta planificar despliegues en producción sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juti-ai/typhoon-asr-realtime-onnx
- Modelo base original: https://huggingface.co/typhoon-ai/typhoon-asr-realtime
- Paper: *Typhoon ASR Real-time: FastConformer-Transducer for Thai Automatic Speech Recognition* — arXiv:2601.13044
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Silero VAD: https://github.com/snakers4/silero-vad
