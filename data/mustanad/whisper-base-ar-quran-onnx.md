# Mustanad/whisper-base-ar-quran-onnx

## Resumen

`Mustanad/whisper-base-ar-quran-onnx` es una conversion a formato ONNX con cuantizacion dinamica de 8 bits del modelo `tarteel-ai/whisper-base-ar-quran`, un sistema de reconocimiento automatico del habla (ASR) especializado en recitacion del Coran en arabe. Lo publica el usuario Mustanad y esta pensado para ejecutarse en el navegador y en telefonos moviles mediante Transformers.js, sin necesidad de servidor ni de GPU dedicada. Los pesos originales no se han reentrenado: solo cambia el formato y la precision numerica.

El modelo base es un Whisper base de OpenAI (arquitectura transformer encoder-decoder, aproximadamente 74 millones de parametros) afinado por Tarteel para transcripcion de recitacion coranica. La contribucion de este repositorio es practica: exportacion con `optimum-cli` y cuantizacion dinamica QUInt8 del encoder y del decoder fusionado, reduciendo el peso total a unos 102 MB (23 MB el encoder y 79 MB el decoder), lo que lo hace viable en entornos con recursos muy limitados.

Es relevante para desarrolladores que quieran integrar verificacion de recitacion o transcripcion coranica en aplicaciones web o moviles sin infraestructura de inferencia propia. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su uso esta acotado a un dominio muy especifico: arabe coranico, no arabe general ni otros idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper base) |
| Parametros totales | no disponible (modelo base Whisper base, ~74 M segun la arquitectura; no confirmado en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio tipica de Whisper de 30 s; no confirmado en la informacion) |
| Tipos de cuantizacion | 8 bits dinamica (QUInt8) sobre encoder y decoder fusionado |
| Idiomas soportados | arabe (ar), orientado a recitacion coranica |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_merged_quantized.onnx`) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper base: un encoder que procesa espectrogramas de audio y un decoder autorregresivo que genera tokens de texto, ambos basados en transformers con atencion multi-cabeza. El modelo original fue afinado por Tarteel sobre `openai/whisper-base` para el dominio de recitacion coranica; la model card de este repositorio no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si hubo tecnicas de RLHF o DPO. No se ha reentrenado ningun peso en esta conversion.

La innovacion tecnica de este repositorio es la cadena de exportacion y cuantizacion: exportacion con `optimum-cli export onnx --task automatic-speech-recognition-with-past`, seguida de cuantizacion dinamica con `onnxruntime.quantization.quantize_dynamic` en modo QUInt8 y con `EnableSubgraph` activado para que los subgrafos del decoder tambien se cuantizen. Sin esa opcion, el decoder fusionado se queda en unos 315 MB; con ella baja a 79 MB. El resultado son dos ficheros ONNX que suman aproximadamente 102 MB, disenados para ejecutarse con el backend WebAssembly de ONNX Runtime a traves de Transformers.js.

## Capacidades

- Reconocimiento automatico del habla en arabe, especificamente recitacion del Coran.
- Transcripcion palabra por palabra, segun el caso de uso declarado por el autor (verificacion de recitacion memorizada).
- Ejecucion en navegador y en movil mediante Transformers.js con backend WebAssembly (`device: "wasm"`).
- Soporte de hilos de WebAssembly en paginas con aislamiento cross-origin, lo que acelera la inferencia.
- Entrada de audio en `Float32Array` a 16 kHz mono.
- No soporta tool calling, function calling, agentes, vision, audio de salida ni modo thinking.
- No es multilingue: la model card del original no lo marca como multilingue, por lo que no debe pasarse la opcion `language` ni `task`.
- No funciona correctamente en WebGPU con la cuantizacion de 8 bits; el autor indica explicitamente usar WebAssembly.

## Casos de uso

- Verificacion de recitacion memorizada en movil: el modelo transcribe la recitacion del usuario y permite comparar palabra por palabra con el texto esperado; es el caso de uso declarado por el autor y encaja por su tamano reducido y su ejecucion local en el telefono.
- Aplicaciones web de aprendizaje del Coran: integracion mediante Transformers.js en una pagina con aislamiento cross-origin para aprovechar los hilos de WebAssembly, con latencias de menos de 1 s por versiculo de 11 s en un portatil reciente.
- Herramientas offline de transcripcion coranica: al ejecutarse en el navegador o en el dispositivo, no requiere enviar audio a un servidor, lo que simplifica el cumplimiento de privacidad.
- Prototipos de bajo coste: con unos 102 MB de pesos, se puede desplegar en entornos con almacenamiento y memoria muy limitados, sin GPU.
- Investigacion sobre ASR de dominio especifico: sirve como referencia para comparar el rendimiento de un Whisper base afinado frente al Whisper base generico en arabe coranico.
- Demos educativas de Transformers.js: ejemplo funcional de pipeline ASR con cuantizacion de 8 bits y backend WebAssembly para talleres y documentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de rendimiento aportada por el autor es de latencia: un versiculo de 11 segundos tarda aproximadamente 3 segundos en un iPhone 16 Pro Max y menos de 1 segundo en un portatil reciente, con hilos de WebAssembly activados.

## Requisitos de hardware

- VRAM estimada: no aplica en el escenario previsto (WebAssembly en CPU); no se proporcionan cifras de memoria para GPU.
- GPU recomendadas: no disponible; el autor desaconseja WebGPU para esta version cuantizada.
- Cabe en GPU de consumo: no es el objetivo; el modelo esta disenado para CPU via WebAssembly en navegador y movil.
- Opciones de despliegue: Transformers.js con `device: "wasm"` y `dtype: "q8"`; tambien puede ejecutarse con ONNX Runtime en otros entornos, aunque no se documenta en la model card.
- Latencia estimada: aproximadamente 3 s por versiculo de 11 s en iPhone 16 Pro Max y menos de 1 s en portatil reciente, con hilos de WebAssembly.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Mustanad/whisper-base-ar-quran-onnx | no disponible (~74 M segun arquitectura) | no disponible | arabe (coranico) | Apache-2.0 | ONNX 8 bits | Conversion para Transformers.js, ~102 MB |
| YunusZJ/whisper-base-ar-quran-ONNX | no disponible | no disponible | arabe (coranico) | no disponible en la informacion | ONNX | Conversion automatica del mismo modelo base |
| tarteel-ai/whisper-base-ar-quran | no disponible (~74 M segun arquitectura) | no disponible | arabe (coranico) | Apache-2.0 | safetensors (formato original) | Modelo base original de Tarteel |

## Limitaciones y advertencias

- Dominio muy restringido: esta afinado para recitacion coranica; el rendimiento en arabe conversacional general o en otros idiomas no esta documentado y probablemente sea deficiente.
- No es multilingue segun la model card del original; no debe pasarse la opcion `language` ni `task` al pipeline.
- La cuantizacion de 8 bits produce salidas incorrectas en WebGPU; hay que usar el backend WebAssembly.
- Riesgo de alucinacion en pasajes de audio ruidoso, con solapamiento de voces o con recitacion no coranica; no se han publicado evaluaciones de tasa de error.
- Sesgos: no se documentan sesgos especificos, pero el corpus de entrenamiento esta limitado a recitacion coranica y a las voces presentes en el.
- Licencia Apache-2.0, que permite uso comercial; aun asi, el autor declara que el repositorio no esta afiliado a Tarteel y que todo el credito del modelo y su entrenamiento corresponde a Tarteel.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad ni mantenimiento conocido.
- El autor no detalla el proceso de evaluacion de la cuantizacion, por lo que la perdida de precision frente al modelo original no esta cuantificada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Mustanad/whisper-base-ar-quran-onnx
- Modelo base original: https://huggingface.co/tarteel-ai/whisper-base-ar-quran
- Conversion ONNX alternativa: https://huggingface.co/YunusZJ/whisper-base-ar-quran-ONNX
- Transformers.js: https://github.com/huggingface/transformers.js
