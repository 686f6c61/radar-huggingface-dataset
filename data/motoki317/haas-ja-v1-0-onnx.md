# motoki317/Haas-ja-v1.0-onnx

## Resumen

`motoki317/Haas-ja-v1.0-onnx` es una conversion a ONNX del modelo de reconocimiento automatico del habla (ASR) en japones `third-intelligence/Haas-ja-v1.0`, publicada por el desarrollador motoki317. El objetivo no es otro que permitir la inferencia en CPU sin dependencias de PyTorch ni de NeMo: el autor lo utiliza en su proyecto `vrc-tsuyaku`, una herramienta de traduccion en tiempo real para VRChat. El repositorio contiene unicamente los grafos ONNX y el vocabulario, no los pesos originales en formato NeMo.

La arquitectura subyacente es un modelo FastConformer con decodificacion TDT (Token-and-Duration Transducer), exportado en cuatro grafos independientes: extractor de caracteristicas, encoder, paso de decodificacion y red conjunta. El encoder se cuantiza a int8 mediante cuantizacion dinamica per-channel de ONNX Runtime, lo que reduce el peso del repositorio hasta los 0,7 GB. El modelo trabaja exclusivamente con japones y hereda la licencia Apache-2.0 del checkpoint original.

Su relevancia practica radica en que ofrece una via de despliegue ligera y sin framework para ASR japones en entornos con CPU, algo poco habitual en modelos de esta familia, habitualmente atados a entornos NeMo con GPU. No obstante, la informacion publicada es muy escasa: no hay datos de benchmarks, ni de composicion del dataset de entrenamiento, ni de latencia o throughput medidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificacion TDT (Token-and-Duration Transducer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (cuantizacion dinamica per-channel de ONNX Runtime en el encoder) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`features.onnx`, `encoder.int8.onnx`, `decoder_step.onnx`, `joint.onnx`) + `vocab.txt` |
| Entrada de audio | 16 kHz mono float32, features log-mel de 128 bins |
| Vocabulario | SentencePiece, con token blank TDT anadido como `<blk> 3072` |
| Tamano del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

El modelo original es un FastConformer, una variante del encoder Conformer con atencion submuestreada que reduce la longitud de la secuencia antes de las capas de auto-atencion. Sobre ese encoder se aplica un decodificador TDT (Token-and-Duration Transducer), que emite conjuntamente un token y una duracion de salto, lo que permite decodificacion greedy no autoregresiva por pasos y reduce el coste frente a un RNN-T clasico. La conversion separa el pipeline en cuatro grafos ONNX: `features.onnx` (audio a log-mel de 128 bins), `encoder.int8.onnx` (encoder cuantizado a int8), `decoder_step.onnx` (un paso de prediccion con estados explicitos de convolucion y recurrencia) y `joint.onnx` (una trama de encoder y la salida de prediccion a logits de token y duracion). El vocabulario se exporta en `vocab.txt` con el token blank TDT anadido.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO; la model card del repositorio no los detalla. El checkpoint de origen es `Haas-ja-v1.0.nemo` en la revision `660728d39019e5e065046154beca44ac9a66a540`, con SHA-256 `c6ed38698300a371a86eadab4b56d5458f47623f7fc4a5f1e938b5adbe8458aa`. Los scripts de exportacion, el padding de audio, el bucle de decodificacion greedy TDT y la regla de detokenizacion se encuentran en `tools/haas-export` del repositorio `vrc-tsuyaku`.

## Capacidades

- Reconocimiento automatico del habla en japones a partir de audio de 16 kHz mono.
- Decodificacion TDT greedy con emision conjunta de token y duracion.
- Inferencia en CPU mediante ONNX Runtime, sin PyTorch ni NeMo.
- Ejecucion por grafos separados, lo que permite orquestar el bucle de decodificacion desde el codigo de aplicacion.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multimodales (vision, audio mas alla de la transcripcion, etc.).
- Multilingue: no; unicamente japones.

## Casos de uso

- Subtitulado en tiempo real de conversaciones en japones: el modelo esta pensado para transcripcion de audio en streaming; el proyecto `vrc-tsuyaku` lo usa para traducir voz en VRChat ejecutandose en CPU.
- Transcripcion de reuniones o clases en japones en servidores sin GPU: al ejecutarse con ONNX Runtime en CPU, encaja en entornos donde no hay acelerador disponible.
- Integracion en aplicaciones de escritorio: los cuatro grafos ONNX permiten embeber el pipeline en un binario o en un runtime ligero sin arrastrar el ecosistema NeMo.
- Preprocesado de audio para pipelines de NLP en japones: la salida de transcripcion puede alimentar posteriores etapas de analisis o traduccion automatica.
- Prototipado de ASR japones en entornos con recursos limitados: el repositorio de 0,7 GB y la cuantizacion int8 facilitan el despliegue en maquinas modestas.
- Investigacion comparativa de cuantizacion: sirve para evaluar el impacto de la cuantizacion dinamica int8 per-channel en un encoder FastConformer frente a la version sin cuantizar (`oboroge0/Haas-ja-v1.0-onnx`) o a la version int4/int8 de Kizuna Intelligence.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica en el caso de uso previsto; el modelo esta disenado para inferencia en CPU.
- Memoria RAM estimada: no disponible; el repositorio pesa 0,7 GB, lo que da una cota inferior orientativa del espacio en disco.
- GPU recomendadas: no disponibles; el autor no documenta ejecucion en GPU para esta conversion.
- Compatibilidad con GPU de consumo: no documentada.
- Opciones de despliegue: ONNX Runtime (CPU), con los cuatro grafos y el bucle de decodificacion implementado en la aplicacion; el autor referencia `tools/haas-export` en `vrc-tsuyaku`. No se documenta soporte directo en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Cuantizacion | Runtime | Idiomas | Licencia |
|---|---|---|---|---|---|
| `motoki317/Haas-ja-v1.0-onnx` | ONNX (4 grafos) | int8 dinamica per-channel | ONNX Runtime (CPU) | ja | Apache-2.0 |
| `oboroge0/Haas-ja-v1.0-onnx` | ONNX | sin cuantizar | sherpa-onnx sin modificar | ja | Apache-2.0 |
| `kizuna-intelligence/Haas-ja-v1.0-OneCompression-ONNX` | ONNX | int4/int8 | onnxruntime (CPU) | ja | Apache-2.0 |

Los tres modelos derivan del mismo checkpoint `third-intelligence/Haas-ja-v1.0` y comparten arquitectura e idioma; las diferencias estan en el esquema de cuantizacion, el tamano del repositorio y el runtime de destino. No se dispone de datos de rendimiento comparativo entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo reconoce japones; no hay soporte multilingue.
- No se han publicado benchmarks ni evaluaciones de calidad; no es posible estimar la tasa de error (CER/WER) a partir de la informacion disponible.
- La cuantizacion int8 del encoder puede degradar la precision frente al checkpoint original; no se documenta el impacto.
- No se detalla la composicion del dataset de entrenamiento, por lo que no se pueden evaluar sesgos conocidos.
- El modelo transcribe; no traduce ni razona, por lo que no debe usarse para tareas generativas.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del checkpoint original y conviene verificar los terminos del modelo base.
- El repositorio no incluye los pesos originales en NeMo; para reproducir la conversion hay que partir del checkpoint de origen.
- La orquestacion del bucle de decodificacion TDT corre a cargo de la aplicacion; no es un pipeline de un solo paso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/motoki317/Haas-ja-v1.0-onnx
- Modelo base: https://huggingface.co/third-intelligence/Haas-ja-v1.0/tree/660728d39019e5e065046154beca44ac9a66a540
- Proyecto `vrc-tsuyaku`: https://github.com/motoki317/vrc-tsuyaku
- Scripts de exportacion: https://github.com/motoki317/vrc-tsuyaku/tree/main/tools/haas-export
- Conversion ONNX sin cuantizar: https://huggingface.co/oboroge0/Haas-ja-v1.0-onnx
- Conversion OneCompression int4/int8: https://huggingface.co/kizuna-intelligence/Haas-ja-v1.0-OneCompression-ONNX/tree/main
