# poof86/parakeet-tdt-0.6b-dutch-onnx

## Resumen

Parakeet-TDT-0.6B Dutch (ONNX, int8) es una conversion a formato ONNX del modelo `yuriyvnv/parakeet-tdt-0.6b-dutch`, un ajuste fino al neerlandes del Parakeet-TDT-0.6B de NVIDIA. El autor de esta version es el usuario poof86, que unicamente cambia el formato del checkpoint original (fichero `parakeet-tdt-cv_synth_nl-seed42.nemo`) sin reentrenar ni modificar los pesos. El objetivo es hacer el modelo consumible desde `onnx-asr`, una libreria de inferencia ligera pensada para ejecucion en CPU.

El modelo resuelve transcripcion automatica de voz (ASR) en neerlandes con una arquitectura NeMo Conformer-TDT de 600 millones de parametros. La cuantizacion aplicada es deliberadamente conservadora: solo los pesos de las operaciones MatMul se cuantizan a int8 (QInt8, per channel), mientras que el resto del grafo permanece en fp32. Segun el autor, cuantizar todas las operaciones disparaba el WER en neerlandes del 12,6% al 20,7%, por lo que la estrategia MatMul-only mantiene la precision casi identica al modelo fp32.

Es relevante porque ofrece una via de despliegue de ASR neerlandes de alta calidad sin GPU: sobre 4 vCPU Intel Xeon a 2,10 GHz alcanza 23,1x tiempo real con un pico de memoria de 2,5 GB, con una degradacion de WER de solo 0,1 puntos respecto al modelo fp32. La licencia es CC-BY-4.0, la misma que el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer-TDT (Token-and-Duration Transducer) |
| Parametros totales | 600 millones (0.6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de audio; la variante base v3 soporta hasta 24 minutos en atencion completa y 3 horas con atencion local, segun documentacion de NVIDIA) |
| Tipos de cuantizacion | int8 (QInt8, per channel, solo pesos MatMul); tambien disponible fp32 |
| Idiomas soportados | Neerlandes (nl) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`encoder-model`, `decoder_joint-model`), mas `vocab.txt` y `config.json` en el layout de onnx-asr |

## Arquitectura y entrenamiento

La arquitectura subyacente es un Conformer con decodificacion Token-and-Duration Transducer (TDT), la misma familia que NVIDIA emplea en la serie Parakeet. El encoder es de tipo FastConformer, disenado para alta velocidad de transcripcion, y el decodificador TDT predice de forma conjunta el token y su duracion, lo que permite generar marcas temporales precisas y acelerar la decodificacion frente a un transducer clasico. El modelo original de NVIDIA cuenta con 600 millones de parametros.

El ajuste fino al neerlandes se realizo sobre el checkpoint `parakeet-tdt-cv_synth_nl-seed42.nemo`, aunque no se detalla en la informacion disponible la composicion exacta del dataset de entrenamiento (el prefijo `cv_synth` sugiere una mezcla de Common Voice y datos sinteticos, pero no se confirma). Tampoco se especifican el numero de tokens de audio ni si hubo etapas de RLHF o DPO; en modelos ASR estos procedimientos no son habituales.

La innovacion tecnica de esta ficha no esta en el entrenamiento sino en la conversion y cuantizacion: el autor exporto el modelo con NeMo 3.0.0 a ONNX fp32 y aplico cuantizacion dinamica con onnxruntime 1.30.0 restringida exclusivamente a los pesos MatMul. Esta decision evita el `.onnx.data` externo, que onnxruntime rechaza a traves de la cache de Hugging Face, y preserva la precision del modelo fp32.

## Capacidades

- Transcripcion automatica de voz en neerlandes (unico idioma soportado).
- Generacion de marcas temporales precisas por token gracias al decodificador TDT.
- Integracion con deteccion de actividad de voz (VAD) mediante Silero VAD a traves de `onnx-asr`.
- Inferencia en CPU de alto rendimiento: 23,1x tiempo real en 4 vCPU.
- Ejecucion offline sin dependencia de GPU ni servicios en la nube.
- No soporta tool calling, function calling ni agentes: es un modelo puramente ASR.
- No tiene capacidades de vision, audio multimodal, traduccion ni generacion de texto.

## Casos de uso

- Transcripcion de reuniones en neerlandes: el modelo convierte audio de reunion a texto con marcas temporales, ejecutable en un servidor CPU sin GPU dedicada, lo que abarata el despliegue en entornos corporativos.
- Subtitulado automatico de video: las marcas temporales por token del decodificador TDT permiten generar subtitulos alineados temporalmente sin un paso de alineamiento posterior.
- Archivado y busqueda de contenido audiovisual: transcripcion masiva de archivos de audio neerlandes para indexacion y busqueda de texto completo, aprovechando el throughput de 23,1x tiempo real.
- Asistentes de voz en neerlandes para atencion al cliente: el modelo alimenta un pipeline ASR mas NLU, con inferencia local que evita enviar audio a terceros.
- Documentacion clinica o legal dictada: la precision de WER 12,7% en habla leida permite transcripcion asistida para revision humana en entornos donde la privacidad exige procesamiento local.
- Accesibilidad para personas con discapacidad auditiva: generacion de transcripciones en directo de conversaciones y eventos en neerlandes sobre hardware modesto.
- Investigacion en ASR neerlandes: al ser un modelo ONNX ligero y con licencia permisiva, sirve como base de comparacion o punto de partida para fine-tunes adicionales.
- Despliegue en dispositivos de borde o sistemas embebidos con CPU x86: el pico de 2,5 GB de memoria y la ausencia de requisitos de GPU lo hacen apto para mini-PC y servidores de gama baja.

## Benchmarks y rendimiento

Resultados medidos sobre 100 fragmentos del conjunto de test FLEURS en neerlandes (2.273 palabras), en 4 vCPU Intel Xeon a 2,10 GHz, con onnx-asr 0.12.0 y Silero VAD. El WER se calcula sobre texto en minusculas y sin puntuacion.

| Modelo | WER | Velocidad (x tiempo real) | Memoria pico |
|---|---|---|---|
| Este modelo (int8, solo MatMul) | 12,7% | 23,1x | 2,5 GB |
| Mismo modelo en fp32 | 12,6% | 15,2x | 3,5 GB |
| Parakeet-TDT-0.6B v3 int8 (multilingue) | 14,2% | 12,6x | 1,9 GB |
| Canary-1B-v2 int8, language=nl | 10,3% | 5,9x | 2,6 GB |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K y similares) porque no aplican a un modelo de reconocimiento de voz. El autor advierte que FLEURS es habla leida, por lo que el habla espontanea obtendra un WER peor.

## Requisitos de hardware

- VRAM estimada: no aplica en la configuracion por defecto, el modelo esta pensado para CPU. Pico de memoria RAM de 2,5 GB en int8 y 3,5 GB en fp32.
- GPU recomendadas: no especificadas por el autor; el modelo se distribuye como conversion ONNX para CPU a traves de onnx-asr. Cualquier GPU con soporte de ejecucion ONNX podria usarse, pero no se documentan resultados en GPU.
- Cabe en GPU de consumo: si, al tratarse de 0,6B de parametros, aunque no es el caso de uso objetivo; tambien cabe sobradamente en cualquier equipo con 4 GB de RAM libre.
- Opciones de despliegue: onnx-asr (libreria oficial de consumo), onnxruntime, y cualquier runtime compatible con ONNX. No esta orientado a vLLM, llama.cpp, Ollama ni TGI, que son entornos de LLM.
- Latencia y throughput estimados: 23,1x tiempo real en int8 sobre 4 vCPU Intel Xeon a 2,10 GHz (es decir, unos 0,043 segundos de computo por segundo de audio). En fp32 baja a 15,2x tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | WER (FLEURS nl) | Velocidad | Licencia | Formato |
|---|---|---|---|---|---|---|
| Este modelo (int8, MatMul only) | 0,6B | Neerlandes | 12,7% | 23,1x | CC-BY-4.0 | ONNX |
| yuriyvnv/parakeet-tdt-0.6b-dutch (base) | 0,6B | Neerlandes | No disponible | No disponible | CC-BY-4.0 | NeMo |
| nvidia/parakeet-tdt-0.6b-v3 (int8) | 0,6B | 25 idiomas europeos | 14,2% | 12,6x | No disponible en la informacion | ONNX |
| nvidia/canary-1b-v2 (int8, nl) | 1B | Multilingue | 10,3% | 5,9x | No disponible en la informacion | No disponible |

El modelo ofrece mejor WER y mayor velocidad que la variante multilingue de Parakeet v3 en neerlandes, a costa de perder cobertura de idiomas. Frente a Canary-1B-v2 pierde 2,4 puntos de WER pero es casi cuatro veces mas rapido y consume menos memoria.

## Limitaciones y advertencias

- Solo soporta neerlandes; no transcribe otros idiomas ni detecta el idioma automaticamente.
- Riesgo de alucinacion y de errores en habla espontanea, acentos marcados, ruido de fondo, solapamiento de voces y terminologia especializada; el WER de 12,7% se midio sobre habla leida de FLEURS.
- No se documentan sesgos especificos, pero al derivar de un ajuste fino sobre un dataset presumiblemente mixto (Common Voice y datos sinteticos), puede heredar los sesgos de dichos corpus.
- Limitacion de contexto/duracion: no se especifica la duracion maxima de audio para esta variante; en la base v3 se citan 24 minutos en atencion completa, pero no se confirma para este ajuste.
- La cuantizacion int8 MatMul-only preserva la precision, pero cuantizar todas las operaciones eleva el WER al 20,7%; debe respetarse la configuracion publicada.
- Licencia CC-BY-4.0: permite uso comercial con atribucion al autor original y a los autores del modelo base. Es responsabilidad del usuario verificar que la cadena de licencias (NVIDIA Parakeet, ajuste neerlandes, conversion ONNX) es compatible con su caso de uso.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: la conversion no cuenta con validacion de la comunidad y el autor declara explicitamente que todo el merito del modelo corresponde a sus autores originales.
- No incluye VAD propio; para un uso correcto se recomienda combinarlo con Silero VAD como en el ejemplo de la model card.

## Enlaces

- Repositorio HuggingFace de la conversion: https://huggingface.co/poof86/parakeet-tdt-0.6b-dutch-onnx
- Modelo base (ajuste neerlandes): https://huggingface.co/yuriyvnv/parakeet-tdt-0.6b-dutch
- Libreria onnx-asr: https://github.com/istupakov/onnx-asr
- Modelo original multilingue de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Conversion ONNX de la variante multilingue (referencia): https://inferix.co/models/istupakov/parakeet-tdt-0.6b-v3-onnx
- Conversion CoreML int8 del modelo neerlandes (referencia): https://huggingface.co/OpenVoiceOS/parakeet-tdt-0.6b-dutch-coreml-int8
- Ficha tecnica de Parakeet-TDT 0.6B v3: https://theaibench.ai/models/parakeet-tdt/
- Descripcion de Parakeet TDT 0.6B v3: https://openvoxai.com/models/parakeet-tdt-0-6b-v3
