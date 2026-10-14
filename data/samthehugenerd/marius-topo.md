# samthehugenerd/Marius-Topo

## Resumen

Marius-Topo es un paquete de inferencia para CoreML que empaqueta el sistema de texto a voz (TTS) Pocket TTS de Kyutai, concretamente sus pesos `english_2026-04`, para ejecutarse en el Neural Engine de un iPhone mediante la libreria FluidAudio. No es un modelo nuevo ni un finetune: es una conversion y un empaquetado de pesos ya existentes, con la voz `marius` incorporada. El autor lo publica bajo el usuario `samthehugenerd` con el objetivo de dar voz al asistente Topo en iOS.

El repositorio contiene cuatro modelos CoreML: un prefiltro que rellena la cache del transformer a partir de la voz y el texto, el propio transformer (que genera un frame por llamada), un decodificador de flujo que convierte ruido en un frame latente y un decodificador Mimi que transforma cada frame latente en 80 ms de audio a 24 kHz. La unica diferencia respecto al paquete ingles de FluidInference es que el decodificador de flujo ejecuta un unico paso de integracion por frame en lugar de ocho, lo que reduce el coste de calculo a costa de un decodificador distinto.

Su relevancia es practica: demuestra como llevar un TTS neuronal de Kyutai al hardware de Apple (Neural Engine) con un formato listo para produccion en aplicaciones moviles, reduciendo el numero de pasos de decodificacion. Al ser un artefacto de despliegue y no un modelo entrenado, no aporta pesos nuevos ni resultados de entrenamiento propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS en streaming: transformer (flowlm) con cache + decodificador de flujo (flow matching) + codec neuronal Mimi |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa texto y estado de voz de referencia; genera audio en frames de 80 ms) |
| Tipos de cuantizacion | fp16 (cond_prefill, flowlm_step, flow_decoder_fused) y fp32 (mimi_decoder) |
| Idiomas soportados | ingles (en) |
| Licencia | CC BY 4.0 (heredada de los pesos de Kyutai) |
| Formato de pesos | CoreML (`.mlmodelc`), mas `constants_bin/` con embeddings de texto, tokenizer y `marius.safetensors` |
| Tamano del repositorio | 0,4 GB |
| Frecuencia de muestreo de audio | 24 kHz |
| Tamano de frame | 80 ms |

## Arquitectura y entrenamiento

El sistema Pocket TTS de Kyutai se despliega aqui como cuatro modelos CoreML encadenados. `cond_prefill_ane` rellena la cache del transformer a partir de la voz de referencia y el texto de entrada. `flowlm_step_ane` es el transformer, que genera un frame por llamada. `flow_decoder_fused` convierte ruido en un frame latente mediante un decodificador de flujo (flow matching) con un unico paso de integracion. Finalmente, `mimi_decoder` transforma cada frame latente en 80 ms de audio a 24 kHz, en precision fp32. Los tres primeros modelos estan en fp16.

No hay informacion disponible sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO). Este repositorio en concreto no entrena nada: la model card indica explicitamente que "no es un modelo nuevo ni un finetune". Los pesos, el tokenizer y la voz proceden de `kyutai/pocket-tts-without-voice-cloning`, variante `languages/english_2026-04`. La conversion se hizo con el codigo de Kyutai en `kyutai-labs/pocket-tts@b94db17` y los scripts de FluidInference en `FluidInference/mobius@210d6b6` (rama `feat/pocket-tts-flowlm-ane`), usando `--num-steps 1` para el decodificador fusionado. La unica modificacion destacable respecto al paquete ingles de FluidInference es ese numero de pasos de integracion del decodificador de flujo: uno en lugar de ocho; el resto de pesos y constantes son identicos byte a byte.

## Capacidades

- Sintesis de voz (text-to-speech) en ingles a partir de texto.
- Generacion de audio en streaming, frame a frame, a 24 kHz.
- Reproduccion de una voz concreta, `marius`, donada por un voluntario en el proyecto Unmute Voice Donation Project de Kyutai.
- Ejecucion en el Neural Engine de Apple a traves de FluidAudio, con modelos optimizados para CoreML.
- Solo incluye los modelos de la ubicacion `.ane` y una unica voz; las demas ubicaciones y voces de FluidAudio no cargaran desde este paquete.
- No ofrece tool calling, function calling, razonamiento multi-paso, vision ni audio de entrada (no es un modelo de proposito general).

## Casos de uso

- Asistente de voz en iOS: dar sintesis de voz al asistente Topo en un iPhone, ejecutando los modelos CoreML en el Neural Engine sin depender de la nube.
- Lectura en voz alta dentro de una aplicacion movil: convertir texto dinamico (noticias, mensajes, articulos) en audio en tiempo casi real gracias a la generacion por frames.
- Accesibilidad: ofrecer salida de voz a usuarios con discapacidad visual dentro de una app nativa de Apple, con latencia baja al ejecutarse en el dispositivo.
- Interfaces conversacionales offline: integrar el paquete en un flujo de dialogo que requiera privacidad, ya que la inferencia ocurre localmente en el Neural Engine.
- Prototipado de voces para asistentes: usar la voz `marius` como voz base para demos de producto en iOS antes de entrenar o elegir una voz definitiva.
- Pruebas de rendimiento de TTS en hardware Apple: comparar la calidad y la latencia del decodificador de un paso frente a la variante de ocho pasos del paquete ingles de FluidInference.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (como MOS, WER o latencia medida) ni comparaciones cuantitativas con otros sistemas TTS.

## Requisitos de hardware

- Dispositivo Apple con Neural Engine; el paquete esta pensado para el despliegue `.ane` que carga FluidAudio.
- No requiere GPU de escritorio (no es un artefacto para CUDA ni para vLLM, llama.cpp, Ollama o TGI; es CoreML).
- Tamano del repositorio de 0,4 GB, que incluye los cuatro modelos CoreML y las constantes.
- Precisión: fp16 para los tres primeros modelos y fp32 para el decodificador Mimi.
- Latencia y throughput: no disponibles en la informacion proporcionada. La reduccion del decodificador de flujo de ocho pasos a uno sugiere un menor coste de calculo en esa etapa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Pasos del decodificador de flujo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| samthehugenerd/Marius-Topo | Paquete CoreML de Pocket TTS (voz `marius`) | en | 1 | CC BY 4.0 | HuggingFace |
| FluidInference/pocket-tts-coreml | Paquete CoreML de Pocket TTS (pack ingles) | en | 8 | no disponible en la informacion | HuggingFace |
| kyutai/pocket-tts | Modelo base TTS de Kyutai | en | no disponible | no disponible en la informacion | HuggingFace |
| kyutai/pocket-tts-without-voice-cloning | Pesos fuente usados en la conversion | en | no disponible | no disponible en la informacion | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo ni un finetune; es un empaquetado de pesos ya existentes. No debe presentarse como un modelo original.
- Solo soporta ingles.
- Solo incluye la voz `marius` y los modelos de la ubicacion `.ane`; otras voces y ubicaciones de FluidAudio no cargaran desde este paquete.
- Solo funciona en el ecosistema Apple (CoreML y Neural Engine); no es portable a CUDA ni a otros entornos de inferencia estandar.
- No hay datos publicos sobre benchmarks, calidad de sintesis ni latencia; conviene validar la calidad de audio en el dispositivo objetivo antes de usarlo en produccion.
- Riesgo de sesgos y de alucinacion acustica inherente a los sistemas TTS neuronales; no se documentan evaluaciones al respecto.
- La licencia es CC BY 4.0, que permite uso comercial con atribucion; el autor indica que se hereda de los pesos de Kyutai. Conviene revisar las condiciones de los componentes de terceros (scripts de FluidInference bajo Apache-2.0 y la voz donada bajo CC0) antes de un despliegue comercial.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/samthehugenerd/Marius-Topo
- Modelo base Pocket TTS de Kyutai: https://huggingface.co/kyutai/pocket-tts
- Pesos fuente de la conversion: https://huggingface.co/kyutai/pocket-tts-without-voice-cloning
- Paquete CoreML de referencia de FluidInference: https://huggingface.co/FluidInference/pocket-tts-coreml
- Voces de Kyutai: https://huggingface.co/kyutai/tts-voices
- Repositorio del asistente Topo: https://github.com/samdu/topo
- Libreria FluidAudio: https://github.com/FluidInference/FluidAudio
- Scripts de conversion de FluidInference (mobius): https://github.com/FluidInference/mobius
- Codigo de Kyutai (pocket-tts): https://github.com/kyutai-labs/pocket-tts
