# rzrmayur/sherpa-onnx-transcribepsy-250m-eu-sub-int8

## Resumen

TranscribePsy-250M-EU-sub INT8 es una exportación ONNX cuantizada del modelo de reconocimiento automático del habla qvac/TranscribePsy-250M-EU-sub, desarrollado por QVAC (Tether Data, S.A. de C.V.). Se trata de un modelo FastConformer-TDT de 254 millones de parámetros, destilado a partir de NVIDIA Parakeet TDT 0.6B V3, empaquetado específicamente para el motor de inferencia sherpa-onnx en su variante de transductor NeMo offline. La exportación la firma el usuario rzrmayur y no cuenta con el respaldo oficial de QVAC, Tether ni NVIDIA.

El problema que resuelve es la transcripción de voz multilingüe en dispositivo (on-device), sin depender de servicios en la nube. Al estar cuantizado a INT8 y dividido en tres ficheros ONNX (encoder, decoder y joiner), el paquete completo ocupa unos 0,3 GB, lo que lo hace viable en dispositivos móviles y equipos sin GPU dedicada. Soporta ocho idiomas europeos (inglés, alemán, francés, español, italiano, neerlandés, polaco y portugués) y produce texto con puntuación y mayúsculas.

Su relevancia actual radica en la combinación de un tamaño contenido, latencia baja (factor de tiempo real de 0,044 a 0,053 en un servidor x86 de cuatro núcleos) y una licencia Apache-2.0 permisiva, lo que facilita su integración en aplicaciones de notas de voz, subtitulado o asistentes locales. La model card indica que fue creado para la aplicación Android SessionNote, aunque puede emplearse en cualquier aplicación basada en sherpa-onnx.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-TDT (transductor con decoder de duración token-a-token) |
| Parametros totales | 254 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de ASR por segmentos; entrada de audio a 16 kHz mono) |
| Tipos de cuantizacion | INT8 dinámica (QUInt8) mediante onnxruntime |
| Idiomas soportados | en, de, fr, es, it, nl, pl, pt |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (encoder.int8.onnx, decoder.int8.onnx, joiner.int8.onnx) + tokens.txt |

## Arquitectura y entrenamiento

El modelo original es un FastConformer-TDT, una variante de Conformer con submuestreo agresivo (factor 8) y un decoder de transductor TDT que predice tanto tokens como duraciones. Consta de 254 millones de parámetros y fue destilado desde NVIDIA Parakeet TDT 0.6B V3, según indica la model card. El vocabulario (tokens.txt) es idéntico al de Parakeet TDT 0.6B V3, con 93.939 bytes de lista de tokens. La entrada es audio mono a 16 kHz y el modelo genera texto con puntuación y mayúsculas.

La exportación se realizó con las funciones nativas de NeMo 3.0 (`encoder/decoder/joint.export()`), añadiendo después los metadatos que sherpa-onnx espera para un transductor NeMo: tipo de normalización vacío (el preprocesador original no usa normalización), una capa en la red de predicción, submuestreo 8, 128 características mel y una URL que contiene "tdt" para que sherpa-onnx lea las cinco salidas de duración. Posteriormente se aplicó cuantización dinámica INT8 con onnxruntime. No se detallan en la información disponible los volúmenes de datos de entrenamiento ni si hubo RLHF o DPO; la model card remite a ATTRIBUTIONS.md para las fuentes de datos, cada una bajo su propia licencia.

## Capacidades

- Transcripción de voz a texto multilingüe en ocho idiomas europeos: inglés, alemán, francés, español, italiano, neerlandés, polaco y portugués.
- Generación de puntuación y mayúsculas en la salida.
- Reconocimiento offline y on-device, sin conexión a servicios externos.
- Inferencia eficiente en CPU gracias a la cuantización INT8 y a la arquitectura de transductor.
- Integración con el ecosistema sherpa-onnx mediante `OfflineRecognizer.from_transducer` con `model_type="nemo_transducer"`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.

## Casos de uso

- Notas de voz en aplicaciones móviles: el modelo puede transcribir grabaciones de forma local en Android, como en SessionNote, sin enviar audio a la nube y con un consumo de almacenamiento de unos 0,3 GB.
- Subtitulado de reuniones y clases: al procesar audio a 16 kHz mono con puntuación automática, resulta adecuado para generar actas o subtítulos en entornos con varios idiomas europeos.
- Asistentes de voz para atención al cliente en dispositivos sin GPU: la baja latencia (RTF de 0,044 a 0,053 en CPU x86 de cuatro núcleos) permite respuestas casi en tiempo real.
- Transcripción de entrevistas y periodismo de campo: la independencia de la nube y el soporte de ocho idiomas facilitan el trabajo en ubicaciones con conectividad limitada.
- Accesibilidad y dictado: integración en aplicaciones de escritorio o web mediante sherpa-onnx para dictado por voz en español, francés, alemán, etc.
- Procesamiento por lotes de archivos de audio en servidores modestos: el bajo factor de tiempo real permite transcribir grandes volúmenes con CPU, sin necesidad de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente comprobaciones cualitativas: con búsqueda voraz y dos hilos de CPU, el texto coincide con la transcripción de NeMo del checkpoint original en inglés, alemán y francés; en español difiere una palabra, siendo la del export la correcta. El factor de tiempo real medido es de 0,044 a 0,053 en un servidor x86 de cuatro núcleos, aproximadamente 1,9 veces más rápido que Parakeet TDT 0.6B V3 INT8 en los mismos clips. Se remite a la model card de QVAC para una evaluación completa de precisión.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está pensado para CPU y no requiere GPU.
- GPU recomendadas: no aplica; puede ejecutarse en CPU. En caso de usar GPU, no se documentan requisitos.
- Cabe en GPU de consumo: no es necesario; el paquete de 0,3 GB cabe en cualquier dispositivo con almacenamiento suficiente, incluidos móviles.
- Opciones de despliegue: sherpa-onnx (librería principal), con soporte para Python, Android, iOS y otras plataformas del ecosistema sherpa-onnx. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no están orientados a este tipo de modelo.
- Latencia y throughput: factor de tiempo real de 0,044 a 0,053 en un servidor x86 de cuatro núcleos con dos hilos de CPU, según la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| rzrmayur/sherpa-onnx-transcribepsy-250m-eu-sub-int8 | 254 M | 8 (en, de, fr, es, it, nl, pl, pt) | ONNX INT8 | Apache-2.0 | Export no oficial para sherpa-onnx; RTF 0,044-0,053 en CPU x86 de 4 núcleos |
| qvac/TranscribePsy-250M-EU-sub | 254 M | 8 (en, de, fr, es, it, nl, pl, pt) | NeMo (.nemo) | Apache-2.0 | Modelo base original; requiere NeMo para inferencia |
| nvidia/parakeet-tdt-0.6b-v3 | 600 M | no disponible en la información | NeMo | CC-BY-4.0 | Modelo del que se destila el original; aproximadamente 1,9 veces más lento que este export en los mismos clips según la model card |

## Limitaciones y advertencias

- Export no oficial: no está respaldado por QVAC, Tether ni NVIDIA; la model card lo indica explícitamente.
- No es un benchmark completo: las comprobaciones realizadas son cualitativas sobre clips de prueba, no una evaluación exhaustiva de precisión.
- Riesgo de alucinación y errores de transcripción: como todo modelo ASR, puede producir palabras incorrectas, especialmente en audio ruidoso o con acentos no representados en el entrenamiento.
- Sesgos: no se documentan sesgos específicos, pero al derivar de Parakeet TDT 0.6B V3 y de los datasets listados en ATTRIBUTIONS.md, puede heredar sus sesgos lingüísticos y demográficos.
- Limitaciones de idioma: solo cubre ocho idiomas europeos; no se documenta soporte para otras lenguas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo original se destiló de Parakeet TDT 0.6B V3 (CC-BY-4.0) y se entrenó con datasets con licencias propias; conviene revisar ATTRIBUTIONS.md antes de un uso comercial.
- Uso no recomendado para decisiones críticas: QVAC declara que el modelo no es para aplicaciones de seguridad crítica ni decisiones automatizadas de alto riesgo.
- Dependencia de sherpa-onnx: requiere metadatos y una versión de sherpa-onnx compatible con transductores NeMo con salidas TDT.

## Enlaces

- [Hugging Face: rzrmayur/sherpa-onnx-transcribepsy-250m-eu-sub-int8](https://huggingface.co/rzrmayur/sherpa-onnx-transcribepsy-250m-eu-sub-int8)
- [Modelo base: qvac/TranscribePsy-250M-EU-sub](https://huggingface.co/qvac/TranscribePsy-250M-EU-sub)
- [NVIDIA Parakeet TDT 0.6B V3](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3)
- [Repositorio sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx)
