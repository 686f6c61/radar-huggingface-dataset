# drinnird/qwen3-asr-0.6b-snapdragon-sm8850-v81

## Resumen

Este repositorio no es un modelo nuevo, sino una conversión experimental del modelo de reconocimiento automático de voz Qwen3-ASR-0.6B, publicada por el usuario drinnird bajo el identificador drinnird/qwen3-asr-0.6b-snapdragon-sm8850-v81. El objetivo es ejecutar la parte de codificación acústica en la NPU Hexagon V81 de un SoC Qualcomm Snapdragon SM8850 (familia Snapdragon 8 Elite de quinta generación), mientras que el decodificador permanece en CPU. Se distribuye como un artefacto híbrido: un contexto QNN nativo en FP16 para el encoder y grafos ONNX en FP32 para la inicialización y los pasos del decodificador. El autor lo etiqueta explícitamente como experimental y no oficial.

El modelo base, Qwen/Qwen3-ASR-0.6B, pertenece a la familia Qwen3-ASR de Alibaba y está construido sobre la base de comprensión de audio de Qwen3-Omni. Realiza identificación de idioma y transcripción para 52 idiomas y dialectos, con 0,6 mil millones de parámetros, lo que lo sitúa como la variante compacta y orientada a eficiencia de la familia (frente a la de 1,7B). Su relevancia radica en que permite reconocimiento de voz multilingüe en dispositivos con recursos limitados, algo estratégico para aplicaciones Android locales y sin conexión.

La aportación específica de este repositorio es el empaquetado para Qualcomm: incluye encoder-qnn-fp16.bin como contexto QNN nativo para HTP Hexagon V81, los sidecars .onnx.data del decodificador, embed_tokens.bin, config.json y tokenizer.json, además de un manifiesto con tamaños y hashes y un contrato de integración Android. El propio autor advierte que requiere bibliotecas HTP propietarias de Qualcomm suministradas aparte y que no constituye un despliegue Android validado ni un decodificador ejecutado íntegramente en NPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida de inferencia: encoder QNN FP16 nativo para Hexagon V81 mas decodificador ONNX FP32 en CPU. Modelo base ASR construido sobre la base de comprension de audio de Qwen3-Omni |
| Parametros totales | 0,6 mil millones (segun nombre del modelo base Qwen3-ASR-0.6B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Encoder en FP16 (contexto QNN); decodificador en FP32 (ONNX). No se documentan otros formatos de cuantizacion en el repositorio |
| Idiomas soportados | El repositorio no declara idiomas. El modelo base Qwen3-ASR-0.6B soporta 52 idiomas y dialectos (30 idiomas y 22 dialectos chinos) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafos .onnx con sidecars .onnx.data), contexto QNN nativo .bin (encoder-qnn-fp16.bin), embed_tokens.bin, config.json, tokenizer.json |

## Arquitectura y entrenamiento

El modelo base Qwen3-ASR-0.6B es un sistema de reconocimiento de voz que combina un componente de comprensión de audio derivado de Qwen3-Omni con un decodificador de tipo transformer. La familia Qwen3-ASR incluye las variantes 0.6B y 1.7B, y ambas realizan identificación de idioma y transcripción sobre 52 idiomas y dialectos. La documentacion de la familia indica que se apoya en datos de entrenamiento de voz a gran escala junto con la capacidad de entendimiento de audio del modelo fundacional Qwen3-Omni. No se detallan en la informacion disponible el numero exacto de tokens de audio, la composicion del dataset ni si hubo fases de RLHF o DPO.

En este repositorio concreto no se ha reentrenado nada: se trata de una conversion de pesos. El encoder se ha exportado y compilado como contexto QNN nativo en FP16, "proven" en un dispositivo SM8850 real segun el autor, mientras que el decodificador se mantiene como dos grafos ONNX FP32 (init y step) con ficheros .onnx.data externos. El paquete incluye model-manifest.json, que fija tamano y hash de cada fichero, android-integration-contract.json, que define los contratos de runtime, preprocesado y decodificacion, y dos ficheros golden sinteticos (golden-synthetic-pcm-12s-f32.raw y golden-synthetic-mel-12s-f32.raw) para una prueba determinista de equivalencia byte a byte del preprocesado en Android. El autor aclara que el binario QNN no es un grafo ONNX generico y que requiere bibliotecas HTP compatibles; tambien indica que la conversion ONNX procede del exportador andrewleech/qwen3-asr-onnx en un commit fijado en el manifiesto.

## Capacidades

- Reconocimiento automatico de voz (ASR) multilingue e identificacion de idioma, heredados del modelo base Qwen3-ASR-0.6B.
- Transcripcion de voz limpia, canto y canciones, segun la descripcion del modelo base en la documentacion de Qwen3-ASR.
- Ejecucion local en dispositivo Android sobre NPU Hexagon V81 para el encoder, con el decodificador en CPU, orientada a escenarios sin conectividad.
- Prueba determinista de equivalencia de preprocesado en Android mediante los ficheros golden sinteticos incluidos (audio PCM y mel de 12 segundos en FP32).
- Verificacion de integridad de artefactos mediante model-manifest.json (tamano y hash por fichero).
- La familia base incluye, a traves de su toolkit oficial, alineacion forzada de voz no autorregresiva, aunque este repositorio concreto no documenta esa funcionalidad como parte del paquete.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio de salida ni modo de razonamiento extendido en este repositorio.

## Casos de uso

- Transcripcion offline en Android de alta privacidad: al ejecutarse localmente y requerir solo el runtime de Qualcomm, permite transcribir audio sin enviar datos a la nube, adecuado para aplicaciones de notas de voz donde la confidencialidad es prioritaria. Requiere validacion previa en el dispositivo objetivo, ya que el autor lo marca como experimental.
- Dictado en tiempo real en aplicaciones de mensajeria: el encoder FP16 en NPU reduce el coste energetico del tramo mas pesado, lo que resulta util para dictado continuo en movil. Debe verificarse la latencia de decodificacion en CPU FP32, que puede ser el cuello de botella.
- Subtitulado de video grabado en el propio dispositivo: el soporte multilingue del modelo base (52 idiomas y dialectos) permite generar subtitulos en varios idiomas sin conexion, integrable en una app de edicion de video Android.
- Asistentes de voz integrados en aplicaciones moviles: la identificacion de idioma automatica facilita la deteccion del idioma del usuario antes de procesar la orden, util para apps con publico internacional.
- Accesibilidad para personas con discapacidad auditiva: transcripcion local de conversaciones presenciales a texto en el telefono, con la ventaja de no depender de red y de mantener el audio en el dispositivo.
- Investigacion sobre despliegue heterogeneo NPU+CPU: el repositorio sirve como caso de estudio reproducible (manifiesto, contrato de integracion y ficheros golden) para quienes estudian particionado de cargas entre acelerador y CPU en SoC Snapdragon.
- Evaluacion comparativa de backends de inferencia en movil: junto con variantes como la de SM8650, permite medir tolerancia FP16, paridad de tokens y limpieza de salida entre distintos objetivos Hexagon, siempre dentro de un marco experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Para este repositorio en concreto no hay metricas de WER, latencia ni throughput. La documentacion de la familia Qwen3-ASR afirma que la variante de 1,7B alcanza rendimiento de vanguardia entre los modelos ASR de codigo abierto, pero no se aportan cifras numericas en la informacion recopilada, por lo que no se reproducen valores concretos.

## Requisitos de hardware

- Objetivo principal: SoC Qualcomm Snapdragon SM8850 (Hexagon V81). El encoder requiere bibliotecas HTP compatibles suministradas por separado y no funciona como grafo ONNX generico.
- El decodificador se ejecuta en CPU en FP32 mediante ONNX; no se documenta una ruta de ejecucion completa en NPU.
- No esta pensado para GPU de escritorio: este paquete concreto no es desplegable en CUDA, ROCm ni Metal, ya que el encoder esta compilado como contexto QNN para Hexagon.
- VRAM estimada para inferencia: no disponible para este artefacto. Como referencia orientativa, el modelo base de 0,6B en FP16 ocupa aproximadamente 1,2 GB de pesos, pero el repositorio completo pesa 5,8 GB por los sidecars FP32 y los artefactos auxiliares; no se dispone de cifras oficiales de consumo en dispositivo.
- Si cabe en GPU de consumo: no es la ruta de despliegue de este repositorio. Para ejecutar el modelo base en GPU habria que usar los pesos originales de Qwen, no esta conversion.
- Opciones de despliegue: runtime QNN/QAIRT de Qualcomm para el encoder y ONNX Runtime en CPU para el decodificador; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput estimados: no disponibles.
- Almacenamiento: aproximadamente 5,8 GB para el repositorio completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Destino | Licencia | Notas |
|---|---|---|---|---|---|
| drinnird/qwen3-asr-0.6b-snapdragon-sm8850-v81 | 0,6B | No disponible | Snapdragon SM8850 (Hexagon V81) | Apache-2.0 | Encoder QNN FP16 en NPU, decodificador ONNX FP32 en CPU; experimental, no validado |
| luyii/Qwen3-ASR-0.6B-QNN-FP16-SM8650 | 0,6B | No disponible | Snapdragon 8 Gen 3 (SM8650, HTP V75) | No disponible en la informacion recopilada | Contextos QNN FP16 y runner Android independiente; probado con QAIRT 2.51.40.260930 en Samsung SM-F741U con Android 14 |
| drinnird/parakeet-tdt-0.6b-v3-sm8850-v81-fp16 | 0,6B | No disponible | Snapdragon SM8850 (Hexagon V81) | No disponible en la informacion recopilada | Conversion FP16 del modelo Parakeet TDT, misma autoria y mismo SoC objetivo |
| Qwen/Qwen3-ASR-0.6B (modelo base) | 0,6B | No disponible | CPU/GPU generica | Apache-2.0 | Modelo original sin conversion para NPU; soporta 52 idiomas y dialectos |

## Limitaciones y advertencias

- El autor declara explicitamente que no es un lanzamiento oficial de Qwen ni de Qualcomm y que no es un despliegue Android validado.
- El binario QNN es un contexto nativo para SM8850/Hexagon V81 y no un grafo ONNX generico; requiere bibliotecas HTP propietarias de Qualcomm no incluidas en el repositorio.
- El decodificador no se ejecuta en NPU: permanece en CPU en FP32, lo que limita la ganancia de rendimiento global y puede penalizar la latencia.
- Criterio de cualificacion del propio autor: una ventana de audio real de 12 segundos con relleno/recorte debe superar una ejecucion HTP verificada, tolerancia FP16 del encoder, paridad exacta de tokens con el encoder FP32 y el mismo decodificador CPU, y una limpieza verificada en telefono antes de crear una release experimental. Esto no establece precision clinica ni la carga de EPContext de ONNX Runtime en WhisperRecorder.
- Se recomienda no seleccionar este backend como listo para produccion hasta que exista una verificacion Android S26 independiente.
- Los ficheros golden son sinteticos y artificiales: validan equivalencia byte a byte de preprocesado, no calidad de transcripcion sobre audio real.
- No se empaquetan audio privado, transcripciones, credenciales en cache, binarios ADB ni bibliotecas propietarias del runtime de Qualcomm, por lo que el usuario debe aportar el runtime.
- No se documentan sesgos especificos de esta conversion; para limitaciones de sesgo linguistico y de acentos habria que remitirse a la documentacion del modelo base Qwen3-ASR-0.6B, que no se detalla en la informacion recopilada.
- Riesgo de alucinacion en la transcripcion: no se aportan datos de WER ni evaluaciones sobre audio ruidoso para este artefacto.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar la atribucion del modelo original y los avisos aplicables de las partes anteriores.
- Fecha de publicacion y actualizacion indicadas en el repositorio: 11 de octubre de 2026. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/drinnird/qwen3-asr-0.6b-snapdragon-sm8850-v81
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Exportador ONNX referenciado (andrewleech/qwen3-asr-onnx): https://github.com/andrewleech/qwen3-asr-onnx
- Repositorio oficial de la familia Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- Toolkit oficial de Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR-Toolkit
- Ficha de Qwen3-ASR 0.6B en OpenASR: https://openasr.org/models/qwen3-asr-0.6b/
- Conversion comparable para Snapdragon SM8650 (luyii): https://huggingface.co/luyii/Qwen3-ASR-0.6B-QNN-FP16-SM8650
- Conversion relacionada del mismo autor para SM8850 (Parakeet TDT): https://huggingface.co/drinnird/parakeet-tdt-0.6b-v3-sm8850-v81-fp16
