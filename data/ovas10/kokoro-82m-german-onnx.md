# ovas10/kokoro-82m-german-onnx

## Resumen

Kokoro-82M German ONNX es una exportación a ONNX del ajuste fino en alemán del modelo de síntesis de voz Kokoro-82M, desarrollado originalmente por hexgrad y adaptado al alemán por Software Mansion. La conversión la ha realizado ovas10 (S3P Studios) para su uso en el navegador mediante ONNX Runtime Web, con soporte tanto de WebGPU como de WASM/CPU. El modelo está pensado para aplicaciones de text-to-speech (TTS) que necesitan ejecutarse íntegramente en el cliente, sin backend, como la extensión de Chrome Mark to Read.

Con 82 millones de parámetros, Kokoro es un modelo TTS compacto basado en una arquitectura de estilo StyleTTS2 con decoder generativo, que convierte fonemas IPA en waveform de audio a 24 kHz. Esta versión incluye una voz femenina en alemán ("Anna") y una interfaz compatible con los modelos ONNX oficiales de Kokoro: entradas `input_ids`, `style` y `speed`, y salida `waveform` más `duration`.

La relevancia actual radica en que permite TTS de calidad en el navegador con un peso de 93 MB en cuantización uint8, lo que habilita casos de uso de accesibilidad, lectura en voz alta y asistentes locales sin depender de servicios en la nube. La licencia Apache-2.0 facilita su integración comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro-82M (basada en StyleTTS2 con decoder generativo; inferencia ONNX, batch size 1) |
| Parametros totales | 82 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; entrada por fonemas, sin ventana de contexto definida) |
| Tipos de cuantizacion | fp32 (326 MB) y uint8 dinámica por canal (93 MB) |
| Idiomas soportados | alemán (`de`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx` fp32, `model_quantized.onnx` uint8) y voz en `.bin` float32 `[510, 256]` |
| Frecuencia de muestreo | 24 kHz mono |
| Runtime | ONNX Runtime Web (WebGPU para fp32, WASM/CPU para cuantizado) |
| Opset | 17 |
| Tamano del repo | 0,4 GB |

## Arquitectura y entrenamiento

El modelo subyacente es Kokoro-82M, un TTS de 82 millones de parámetros que sigue el linaje de StyleTTS2: un encoder de fonemas, un módulo de estilo que condiciona la prosodia y un decoder generativo que produce la waveform. La inferencia se realiza con batch size 1 y la entrada son fonemas en notación IPA de Kokoro, junto con un vector de estilo de 256 dimensiones seleccionado por fila según el número de fonemas (`voice[phoneme_count - 1]`) y un factor de velocidad.

El ajuste fino en alemán proviene de Software Mansion (`kokoro_german_converted.pth`, revisión `3744b57964eab7df6e8c48f0b84badb29e14df07`). La conversión a ONNX se realizó con `kokoro` 0.9.4 (`disable_complex=True`), PyTorch 2.5.1 y opset 17, aplicando tres simplificaciones exactas para batch size 1: eliminación de secuencias empaquetadas, InstanceNorm reescrita como media/varianza y eliminación de máscaras todo-falso y copias de zero-padding identidad. Sin estas simplificaciones, el backend WebGPU de ONNX Runtime produce duraciones incorrectas y audio distorsionado. También se remapearon las capas weight-norm del formato `parametrizations.weight.original0/1` a `weight_g/weight_v` para que todos los pesos se carguen correctamente. La cuantización se hizo con `quantize_dynamic` (QUInt8 por canal) sobre MatMul, Gemm, Conv, ConvTranspose y LSTM. No se dispone de información sobre el dataset de entrenamiento del ajuste fino ni sobre el uso de RLHF/DPO.

## Capacidades

- Síntesis de voz (text-to-speech) en alemán a partir de fonemas IPA en notación Kokoro.
- Generación de waveform mono a 24 kHz con duración de audio devuelta como salida.
- Control de velocidad de habla mediante el parámetro `speed`.
- Condicionamiento de estilo de voz mediante vectores de estilo precalculados (voz "Anna", femenina).
- Ejecución en navegador con WebGPU (fp32) o WASM/CPU (cuantizado).
- Integración con Transformers.js y ONNX Runtime Web.
- No soporta tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso; es exclusivamente un modelo TTS.
- El preprocesado de texto a fonemas (G2P) para alemán debe hacerse externamente, por ejemplo con Phonemis (MIT).

## Casos de uso

- Lectura en voz alta en el navegador: integrado en extensiones como Mark to Read, el modelo convierte el texto de una página en audio alemán sin enviar datos a un servidor, usando el modelo cuantizado de 93 MB sobre WASM.
- Accesibilidad web: síntesis de voz local para usuarios con discapacidad visual o dificultades de lectura, con latencia baja al ejecutarse en el propio dispositivo y sin coste por petición.
- Aplicaciones educativas de idiomas: generación de pronunciación alemana a partir de transcripciones IPA, útil para ejercicios de fonética y vocabulario.
- Asistentes de voz offline en aplicaciones de escritorio o PWA: al no requerir backend, el modelo puede empaquetarse en una aplicación Electron o web progresiva para dar respuesta hablada en alemán.
- Prototipado rápido de interfaces de voz: con ONNX Runtime Web y Transformers.js, un desarrollador puede validar una UX de TTS en horas sin infraestructura de GPU.
- Contenido multimedia automatizado: generación de narración en alemán para vídeos cortos o podcasts a partir de guiones de texto, con control de velocidad para ajustar la duración.
- Privacidad y cumplimiento: al ejecutarse en el cliente, evita el envío de texto a servicios externos, relevante para aplicaciones sanitarias o legales con requisitos de RGPD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente validación por correlación de log-espectrograma:

| Prueba | Resultado |
|---|---|
| fp32 en CPU frente a exportación independiente Kokoro KMP | duraciones idénticas, similitud 0,996–0,998 |
| fp32 en WebGPU (ONNX Runtime Web 1.22) | duraciones idénticas, similitud 0,985 |
| Cuantizado en CPU frente a fp32 | similitud media 0,97 |
| Referencia: modelo oficial inglés q8 | similitud ~0,96 con el mismo método |

## Requisitos de hardware

- VRAM estimada: no aplica en el caso principal (ejecución en navegador); en servidor, el modelo fp32 de 326 MB cabe holgadamente en cualquier GPU con 1 GB o más.
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte WebGPU para la versión fp32; la versión cuantizada funciona en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU; el modelo cuantizado de 93 MB funciona en CPU sin GPU.
- Opciones de despliegue: ONNX Runtime Web (WebGPU/WASM), Transformers.js, ONNX Runtime nativo; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| ovas10/kokoro-82m-german-onnx | 82 M | no aplica | alemán | Apache-2.0 | ONNX | Optimizado para navegador (WebGPU/WASM) |
| hexgrad/Kokoro-82M | 82 M | no aplica | inglés y otros | Apache-2.0 | PyTorch, ONNX | Modelo base original |
| software-mansion/react-native-executorch-kokoro | 82 M | no aplica | alemán | Apache-2.0 | PyTorch, ExecuTorch | Ajuste fino alemán para móvil |
| Shusek00/kokoro-kmp-models | 82 M | no aplica | alemán | no disponible | ONNX/KMP | Exportación independiente usada como referencia de validación |

## Limitaciones y advertencias

- Solo soporta alemán; no es multilingüe.
- Una única voz disponible ("Anna", femenina); no hay variedad de hablantes en este repo.
- Requiere un paso externo de G2P (texto a fonemas IPA) para alemán; el modelo no acepta texto plano directamente.
- El modelo cuantizado introduce una pérdida de calidad medible (similitud media 0,97 frente a fp32), aceptable para muchas aplicaciones pero no para producción de audio de alta fidelidad.
- La exportación está optimizada para batch size 1; no se garantiza comportamiento correcto con lotes mayores.
- Riesgo de alucinación acústica: pronunciaciones incorrectas o artefactos ante fonemas fuera de distribución o entradas mal formateadas.
- Sesgos de voz: al ser una única voz sintética, puede no representar adecuadamente variedades dialectales del alemán.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar la atribución a hexgrad, Software Mansion y S3P Studios.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin comunidad de validación independiente más allá de las pruebas del autor.
- No se documentan límites de longitud de entrada; entradas muy largas pueden degradar la estabilidad de la prosodia.

## Enlaces

- [Hugging Face: ovas10/kokoro-82m-german-onnx](https://huggingface.co/ovas10/kokoro-82m-german-onnx)
- [Modelo base: hexgrad/Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M)
- [Ajuste fino alemán: software-mansion/react-native-executorch-kokoro](https://huggingface.co/software-mansion/react-native-executorch-kokoro)
- [Exportación de referencia: Shusek00/kokoro-kmp-models](https://huggingface.co/Shusek00/kokoro-kmp-models)
- [G2P alemán: Phonemis](https://github.com/IgorSwat/Phonemis)
- [Extensión Mark to Read](https://marktoread.s3p-studios.com)
