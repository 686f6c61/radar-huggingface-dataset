# malinali-app/whisper-small-wolof-onnx

## Resumen

whisper-small-wolof-onnx es un paquete de inferencia en formato ONNX del modelo de reconocimiento automatico del habla M9and2M/whisper-small-wolof, un ajuste fino de Whisper small especializado en wolof. Lo publica la organizacion malinali-app como parte del ecosistema Malinali, un proyecto de aplicaciones con inferencia en dispositivo, y su proposito es servir como motor de transcripcion local sin depender de APIs en la nube.

El repositorio contiene exclusivamente los grafos de sherpa-onnx (encoder.int8.onnx, decoder.int8.onnx y tokens.txt), es decir, una exportacion cuantizada a int8 de las matrices de multiplicacion, lista para ejecutarse en runtime sherpa-onnx. No incluye pesos en safetensors ni el modelo original en PyTorch: es un artefacto de despliegue, no un checkpoint de entrenamiento.

La relevancia de esta ficha esta en su nicho: el wolof es una lengua de bajos recursos con cobertura limitada en los sistemas ASR comerciales, y este paquete permite ejecutar transcripcion en hardware modesto, incluso sin GPU, dentro de una aplicacion movil o de escritorio. El modelo base pertenece a la familia Whisper small (arquitectura encoder-decoder transformer de unos 244 millones de parametros) y trabaja sobre ventanas de audio de 30 segundos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper small del modelo base; exportado como grafos ONNX) |
| Parametros totales | ~244 M (arquitectura Whisper small estandar; no confirmado explicitamente en la informacion proporcionada) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de audio de 30 s por segmento (limite propio de Whisper); no aplica contexto de tokens de un LLM |
| Tipos de cuantizacion | int8 (cuantizacion de las operaciones MatMul en encoder.int8.onnx y decoder.int8.onnx) |
| Idiomas soportados | Wolof (deducido del nombre y del modelo base); no declarado en los metadatos de HuggingFace |
| Licencia | MIT |
| Formato de pesos | ONNX (grafos sherpa-onnx; encoder.int8.onnx, decoder.int8.onnx, tokens.txt) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper small: un transformer encoder-decoder con atencion completa, disenado para ingerir espectrogramas de mel de 30 segundos y generar transcripciones de forma autorregresiva. Sobre el modelo base M9and2M/whisper-small-wolof, que es un ajuste fino de Whisper small para wolof, malinali-app aplico una exportacion con el script `scripts/whisper/export-onnx.py` de sherpa-onnx y activo la cuantizacion int8 en las multiplicaciones de matrices, con el objetivo de reducir el peso y acelerar la inferencia en CPU.

No se dispone de informacion sobre el volumen de datos de ajuste fino, la composicion del corpus en wolof, ni sobre si se aplicaron tecnicas de RLHF o DPO (Whisper se entrena tipicamente con aprendizaje supervisado sobre pares audio-texto y, en su version original, con supervision debil a gran escala, pero esos detalles no aparecen en la model card de este repositorio). Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal: el artefacto es una conversion de formato y precision, no una modificacion arquitectonica.

## Capacidades

- Reconocimiento automatico del habla (ASR) orientado a la transcripcion de audio en wolof.
- Procesamiento de segmentos de audio de hasta 30 segundos por ventana, con encadenamiento de ventanas para audio mas largo (comportamiento estandar de Whisper y del runtime sherpa-onnx).
- Inferencia en dispositivo (on-device), sin necesidad de conexion a servicios externos.
- Ejecucion en CPU gracias a la cuantizacion int8, lo que habilita su uso en moviles y sistemas embebidos.
- Capacidad multilingue teorica heredada de Whisper small, aunque el ajuste fino esta orientado a wolof y no se documenta el rendimiento en otros idiomas.
- Tool calling / function calling: no disponible (no es un modelo de lenguaje con soporte de herramientas).
- Soporte de agentes y razonamiento multi-paso: no disponible (modelo puramente ASR).
- Vision, audio generativo o thinking mode: no disponible.

## Casos de uso

- Transcripcion offline en aplicaciones moviles: el paquete se integra en una app Android o iOS mediante sherpa-onnx y transcribe dictado o notas de voz en wolof sin enviar el audio a un servidor, lo que reduce costes y preserva la privacidad.
- Asistentes de voz en dispositivo para hablantes de wolof: al ser un modelo pequeno cuantizado, puede cargarse en memoria junto al resto de la aplicacion (el pack ocupa unos 0,4 GB en el repositorio) y responder a comandos de voz locales.
- Subtitulado de contenido audiovisual en wolof: se puede procesar la pista de audio de videos o programas de radio por ventanas de 30 segundos y generar subtitulos en formato SRT, util para medios de comunicacion en Senegal, Gambia y Mauritania.
- Servicios publicos y atencion ciudadana: transcripcion de llamadas o mensajes de voz en wolof para su posterior indexacion o traduccion por un sistema aparte, en entornos con conectividad limitada.
- Investigacion linguistica y construccion de corpus: generar transcripciones automaticas de grabaciones de campo en wolof que despues se corrigen manualmente, acelerando la creacion de datos etiquetados para lenguas de bajos recursos.
- Digitalizacion de archivos sonoros: procesar colecciones de audio historico o radiofonico en wolof por lotes en una maquina con CPU, sin necesidad de GPU dedicada.
- Despliegue en hardware embebido: integracion en dispositivos tipo Raspberry Pi o similar para transcripcion continua en kioscos, grabadoras inteligentes o sistemas de accesibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas de WER (word error rate), CER ni comparaciones cuantitativas con otros sistemas ASR, y tampoco se aportan mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, Whisper small en precision completa ocupa alrededor de 1 GB de pesos, y la version int8 de este pack reduce ese valor aproximadamente a una cuarta parte; conviene verificar el consumo real en el runtime sherpa-onnx.
- Memoria RAM: el repositorio ocupa 0,4 GB, por lo que se recomienda disponer de al menos 1 GB de RAM libre para cargar los grafos y los buffers de audio.
- GPU recomendadas: no requiere GPU. Es ejecutable en CPU x86-64 y ARM. Si se desea aceleracion, cabe en cualquier GPU consumer (por ejemplo, RTX 3060, RTX 4090) e incluso en GPUs de gama baja.
- Cabe en GPU consumer: si, en todas las GPU con al menos 1-2 GB de memoria, aunque su diseno esta pensado para CPU.
- Opciones de despliegue: sherpa-onnx (runtime objetivo), ONNX Runtime en general, y de forma indirecta cualquier framework capaz de consumir grafos ONNX.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Formato | Licencia | Orientacion |
|---|---|---|---|---|---|
| malinali-app/whisper-small-wolof-onnx | ~244 M (estimado, Whisper small) | Ventanas de 30 s | ONNX int8 (sherpa-onnx) | MIT | Wolof, on-device |
| M9and2M/whisper-small-wolof | ~244 M (estimado, Whisper small) | Ventanas de 30 s | Checkpoint de transformacion (no confirmado) | no disponible | Wolof, modelo base del anterior |
| malinali-app/whisper-swahili-small-ggml | ~244 M (estimado, Whisper small) | Ventanas de 30 s | GGML q8_0 (whisper.cpp) | no disponible | Suajili, on-device |
| onnx-community/whisper-small | ~244 M | Ventanas de 30 s | ONNX | no disponible | Multilingue general |

La comparacion cuantitativa de rendimiento (WER) entre estas alternativas no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Es un artefacto de despliegue, no un modelo entrenable: no permite ajuste fino directo en este formato.
- Idiomas soportados no declarados oficialmente en HuggingFace; la especializacion en wolof se deduce del nombre y del modelo base, no de documentacion explicita.
- No se documenta si el modelo realiza traduccion a ingles (tarea de Whisper `translate`) o solo transcripcion.
- Exposicion a sesgos y errores del corpus de ajuste fino del modelo base, cuyo contenido no se describe.
- Riesgo de alucinacion en ASR: Whisper puede generar texto plausible en segmentos con ruido, silencios o audio poco inteligible, especialmente en lenguas de bajos recursos.
- Limitacion intrinseca de ventana: 30 segundos por segmento, con posible perdida de coherencia en los cortes de audio largo.
- Sin datos publicos de WER ni evaluacion independiente, lo que dificulta estimar su calidad en produccion.
- Licencia MIT declarada en este repositorio; conviene confirmar la licencia del modelo base M9and2M/whisper-small-wolof antes de un uso comercial, ya que no aparece en la informacion proporcionada.
- Repositorio sin descargas ni likes en el momento de la consulta: ecosistema muy reciente y sin validacion comunitaria amplia.
- Fecha de publicacion registrada como 2026-10-09, dato inusual que conviene verificar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malinali-app/whisper-small-wolof-onnx
- Modelo base: https://huggingface.co/M9and2M/whisper-small-wolof
- Proyecto Malinali: https://github.com/malinali-app/malinali-app
- Paquete relacionado (suajili, GGML): https://huggingface.co/malinali-app/whisper-swahili-small-ggml
- Whisper small en ONNX (referencia de la comunidad): https://huggingface.co/onnx-community/whisper-small
- Catalogo de modelos de ONNX Runtime: https://onnxruntime.ai/models
- Documentacion de ONNX Runtime para modelos generativos en Windows ML: https://learn.microsoft.com/en-us/windows/ai/new-windows-ml/run-genai-onnx-models
- Guia de obtencion de modelos ONNX en Windows ML: https://learn.microsoft.com/en-us/windows/ai/windows-ml/get-onnx-model
