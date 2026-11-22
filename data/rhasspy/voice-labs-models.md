# rhasspy/voice-labs-models

## Resumen

`rhasspy/voice-labs-models` no es un modelo único, sino un repositorio agregado que empaqueta los artefactos de inferencia que consume la aplicación [Voice Incubator](https://github.com/OHF-Voice/voice-incubator) del proyecto OHF-Voice (Rhasspy). El repositorio reúne modelos de reconocimiento automático del habla (ASR) de NVIDIA exportados a ONNX e int8, un extractor de entidades GLiNER 2.5 de fastino en ONNX y artefactos auxiliares de Kaldi y micro-wake-word para la verificación de palabras de activación. Su función es servir como bundle reproducible de dependencias para un asistente de voz local, no como un modelo entrenado por el autor.

El componente principal es Parakeet TDT-CTC 110M en inglés, un modelo transducer con rama CTC adicional que permite obtener, con un solo encoder, tanto las probabilidades CTC para el emparejamiento de comandos como la transcripción completa. Para el resto de idiomas (alemán, español, francés, italiano, neerlandés, polaco, ruso y ucraniano) se incluyen las variantes FastConformer Hybrid Transducer-CTC Large de NVIDIA, también con el encoder cuantizado dinámicamente a int8 y la cabeza CTC separada en `ctc_head.npz`.

La relevancia actual reside en que ofrece un paquete listo para desplegar en asistentes de voz domésticos (Home Assistant, Rhasspy) con licencias permisivas (CC-BY-4.0 para los componentes NVIDIA, Apache-2.0 para GLiNER) y formatos optimizados para CPU (ONNX int8), lo que permite ejecución sin GPU en dispositivos de borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transducer (RNN-T) + rama CTC híbrida; FastConformer (encoder) para los modelos grandes; GLiNER (encoder transformer) para NER |
| Parametros totales | 110M (Parakeet TDT-CTC en); no disponible para FastConformer Large y GLiNER 2.5 small |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinámica (onnxruntime) en pesos MatMul del encoder; GLiNER con encoder en 8 bits y embeddings en 4 bits (MatMulNBits, block 32) |
| Idiomas soportados | en, de, es, fr, it, nl, pl, ru, uk |
| Licencia | CC-BY-4.0 (componentes NVIDIA) + Apache-2.0 (GLiNER); licencia agregada `cc-by-4.0-and-apache-2.0` |
| Formato de pesos | ONNX (int8), TFLite, artefactos Kaldi (nnet3), micro-wake-word |

## Arquitectura y entrenamiento

El repositorio combina dos familias de arquitecturas ASR. Parakeet TDT-CTC 110M es un modelo transducer (RNN-T) con decodificación *token-and-duration* (TDT) y una rama CTC paralela que comparte el encoder; el export incluye `encoder`, `decoder`, `joiner`, `tokens.txt` y `ctc_head.npz`, de modo que un único encoder alimenta tanto la transcripción como el emparejamiento de comandos por log-probabilidades CTC. Los modelos FastConformer Hybrid Transducer-CTC Large siguen el mismo esquema híbrido sobre un encoder FastConformer (convoluciones depthwise y atención multi-cabeza), exportados con NeMo 2.3.3 y cuantizados dinámicamente a int8 en los pesos MatMul del encoder.

Los pesos proceden de los checkpoints publicados por NVIDIA en Hugging Face (Parakeet exportado por `csukuangfj/sherpa-onnx-nemo-parakeet_tdt_transducer_110m-en-36000` y `csukuangfj/sherpa-onnx-nemo-parakeet_tdt_ctc_110m-en-36000`). El autor no aporta información sobre el dataset de entrenamiento original, número de tokens ni procesos de RLHF/DPO; esos detalles deben consultarse en las model cards de NVIDIA. La innovación práctica del repositorio es el empaquetado: cuantización int8 de los MatMul del encoder, separación de la cabeza CTC y estructura de directorios homogénea entre idiomas para que la aplicación cargue el modelo del idioma activo sin lógica específica.

## Capacidades

- Reconocimiento automático del habla en inglés con Parakeet TDT-CTC 110M y en de, es, fr, it, nl, pl, ru y ucraniano con FastConformer Hybrid Large.
- Decodificación dual: transcripción completa (transducer) y log-probabilidades CTC para emparejamiento de comandos y gramáticas cerradas.
- Detección de entidades y clasificación de comandos mediante GLiNER 2.5 small como *fallback* cuando no hay coincidencia exacta con un comando.
- Verificación de palabra de activación con Kaldi (modelo acústico nnet3 en inglés estadounidense con léxico IPA) y micro-wake-word.
- Ejecución en CPU gracias a los formatos ONNX int8 y TFLite, sin requisito de GPU.
- Soporte multilingüe por selección de modelo según el idioma configurado en la aplicación.
- No incluye generación de texto libre, razonamiento, código, matemáticas, visión ni tool calling; es un bundle especializado en voz.

## Casos de uso

- Asistente de voz doméstico local: la aplicación carga Parakeet o el FastConformer del idioma configurado y transcribe comandos de voz en el dispositivo; el formato ONNX int8 permite ejecutarlo en una Raspberry Pi o mini-PC sin GPU.
- Emparejamiento de comandos por CTC: las log-probabilidades de la cabeza CTC se comparan contra plantillas de comandos, lo que permite reconocer frases fijas ("enciende la luz") con umbrales de confianza sin entrenar un clasificador adicional.
- Control de domótica en Home Assistant: el paquete está pensado para el ecosistema Rhasspy/OHF-Voice, de modo que se integra directamente con las intenciones y *slots* definidos en la configuración del asistente.
- Extracción de entidades en comandos abiertos: GLiNER 2.5 small actúa como *fallback* para identificar personas, lugares u objetos cuando el comando no coincide con ninguna plantilla, con encoder en 8 bits y embeddings en 4 bits para minimizar memoria.
- Verificación de palabra de activación: los artefactos de Kaldi y micro-wake-word permiten confirmar la *wake word* antes de activar el ASR completo, reduciendo falsos positivos y consumo.
- Despliegue multilingüe en un mismo producto: al incluir nueve idiomas con estructura idéntica, un fabricante puede distribuir la misma aplicación cambiando únicamente el directorio del modelo activo.
- Transcripción de audio de baja latencia en *edge*: el modelo de 110M parámetros en int8 ofrece un coste computacional bajo para dictado o subtitulado en tiempo real en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas de WER, latencia ni throughput; para datos de precisión deben consultarse las model cards originales de NVIDIA (`nvidia/parakeet-tdt_ctc-110m` y las variantes `nvidia/stt_*_fastconformer_hybrid_large_pc`).

## Requisitos de hardware

- VRAM estimada: no aplica en el caso habitual; los modelos están cuantizados a int8 para inferencia en CPU con ONNX Runtime.
- GPU recomendadas: no especificadas; al ser ONNX int8, cualquier GPU compatible con ONNX Runtime o CUDA puede acelerar la inferencia, pero el diseño apunta a CPU.
- Cabe en GPU de consumo: sí, con amplio margen; el modelo inglés tiene 110M parámetros y los FastConformer Large son mayores pero siguen siendo manejables en tarjetas de 8 GB o menos.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio), sherpa-onnx (los exports originales provienen de ese proyecto), TFLite para micro-wake-word y Kaldi para el verificador de *wake word*.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | Orientación |
|---|---|---|---|---|---|
| `rhasspy/voice-labs-models` (bundle) | 110M (en) + FastConformer Large (resto) | 9 | ONNX int8, TFLite, Kaldi | CC-BY-4.0 + Apache-2.0 | Asistente de voz local en CPU |
| `nvidia/parakeet-tdt_ctc-110m` | 110M | en | NeMo, safetensors | CC-BY-4.0 | ASR inglés de referencia |
| `nvidia/stt_es_fastconformer_hybrid_large_pc` | no disponible | es | NeMo | CC-BY-4.0 | ASR español de alta precisión |
| `fastino/gliner2.5-small-v1` | no disponible | multilingüe | safetensors, ONNX | Apache-2.0 | Extracción de entidades zero-shot |

La diferencia clave frente a los checkpoints originales de NVIDIA es el empaquetado: cuantización int8, cabeza CTC separada y estructura uniforme multi-idioma, a cambio de perder la integración directa con NeMo y de no incluir métricas propias.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: los pesos son exports de NVIDIA y fastino; cualquier sesgo o limitación de precisión proviene de los modelos originales.
- El repositorio no documenta WER, cobertura de acentos ni dominios de entrenamiento; no debe asumirse calidad homogénea entre los nueve idiomas.
- El modelo inglés es de 110M parámetros, sustancialmente menor que los FastConformer Large del resto de idiomas, por lo que la precisión puede diferir entre configuraciones.
- La cuantización int8 dinámica puede degradar ligeramente la precisión respecto a los pesos originales en fp32/fp16; no se publican comparativas.
- La licencia agregada `cc-by-4.0-and-apache-2.0` obliga a mantener la atribución a NVIDIA Corporation (CC-BY-4.0) y a cumplir Apache-2.0 para GLiNER; conviene revisar `LICENSE.md` antes de uso comercial.
- El uso previsto es ASR y verificación de *wake word* en asistentes de voz; no es adecuado para generación de texto, razonamiento ni tareas multimodales.
- El verificador Kaldi incluido cubre únicamente inglés estadounidense (`en_US-rhasspy.tar.gz`), lo que limita la verificación de *wake word* en otros idiomas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rhasspy/voice-labs-models
- Aplicación Voice Incubator: https://github.com/OHF-Voice/voice-incubator
- Parakeet TDT-CTC 110M (NVIDIA): https://huggingface.co/nvidia/parakeet-tdt_ctc-110m
- Export sherpa-onnx transducer: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet_tdt_transducer_110m-en-36000
- Export sherpa-onnx CTC: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet_tdt_ctc_110m-en-36000
- FastConformer alemán: https://huggingface.co/nvidia/stt_de_fastconformer_hybrid_large_pc
- FastConformer español: https://huggingface.co/nvidia/stt_es_fastconformer_hybrid_large_pc
- FastConformer francés: https://huggingface.co/nvidia/stt_fr_fastconformer_hybrid_large_pc
- FastConformer italiano: https://huggingface.co/nvidia/stt_it_fastconformer_hybrid_large_pc
- FastConformer neerlandés: https://huggingface.co/nvidia/stt_nl_fastconformer_hybrid_large_pc
- FastConformer polaco: https://huggingface.co/nvidia/stt_pl_fastconformer_hybrid_large_pc
- FastConformer ruso: https://huggingface.co/nvidia/stt_ru_fastconformer_hybrid_large_pc
- FastConformer ucraniano: https://huggingface.co/nvidia/stt_ua_fastconformer_hybrid_large_pc
- GLiNER 2.5 small (fastino): https://huggingface.co/fastino/gliner2.5-small-v1
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
