# felerminoali/omniASR-CTC-1B-v2-emakhuwa-onnx

## Resumen

omniASR-CTC-1B-v2-emakhuwa-onnx es la exportacion a formato ONNX del modelo de reconocimiento automatico del habla (ASR) felerminoali/omniASR-CTC-1B-v2-emakhuwa, un ajuste fino sobre la arquitectura wav2vec2 de Meta (`omniASR_CTC_1B_v2`) especializado en emakhuwa, una lengua bantu hablada principalmente en el norte de Mozambique. Lo desarrolla felerminoali y se publica bajo licencia Apache 2.0. La version ONNX esta pensada para transcripcion en navegador mediante `onnxruntime-web` (transformers.js), concretamente para grabaciones etiquetadas como `vmw-MZ` en el proyecto CATfrica.

El modelo resuelve el problema de la transcripcion automatica de una lengua de bajos recursos practicamente ausente de los sistemas ASR comerciales. Frente al modelo original en fairseq2/PyTorch, esta version ofrece un artefacto cuantizado en int8 dinamico de aproximadamente 1 GB que puede ejecutarse en CPU o WebAssembly sin dependencias de GPU, lo que facilita su despliegue en entornos con recursos limitados o en el propio navegador.

La relevancia actual radica en dos factores: por un lado, la preservacion y digitalizacion de lenguas africanas de bajos recursos; por otro, la posibilidad de desplegar ASR multilingue ligero en el cliente sin infraestructura de servidor. El modelo toma audio mono a 16 kHz normalizado y emite logits CTC con un vocabulario de 10 288 piezas SentencePiece, con una trama cada 20 ms.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 con cabeza CTC (exportacion ONNX del modelo fairseq2 `omniASR_CTC_1B_v2`) |
| Parametros totales | 1B (aproximadamente, segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada variable; ventana no especificada) |
| Tipos de cuantizacion | int8 dinamico (pesos MatMul), opset 17; version fp32 de referencia |
| Idiomas soportados | emakhuwa (`vmw`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model_quantized.onnx`, ~1 GB), `vocab.json`, `config.json`, `preprocessor_config.json` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura wav2vec2 con cabeza de clasificacion CTC, derivada del modelo base `omniASR_CTC_1B_v2` de Meta y ajustada mediante fine-tuning supervisado sobre datos de emakhuwa. La exportacion ONNX reproduce la configuracion equivalente de `Wav2Vec2ForCTC`, con entrada `input_values` float32 de forma `[batch, samples]`, audio mono a 16 kHz con normalizacion de media cero y varianza unitaria, y salida `logits` de forma `[batch, frames, 10288]`, con una trama cada 20 ms.

La decodificacion es CTC voraz: se colapsan repeticiones y se elimina el token blank (id 0, `<s>`), y el prefijo `▁` o un espacio marcan el inicio de una nueva palabra. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de RLHF o DPO, ya que la model card no los detalla. La innovacion principal de esta version es la cuantizacion int8 dinamica de los pesos MatMul, que reduce el tamano a aproximadamente 1 GB y permite inferencia en CPU y WebAssembly, con una diferencia de CER del 0,66 % respecto al modelo fp32 en muestras de prueba.

## Capacidades

- Reconocimiento automatico del habla (ASR) para emakhuwa, con salida a nivel de caracter/pieza SentencePiece.
- Transcripcion en navegador mediante `onnxruntime-web` y transformers.js, sin servidor.
- Ejecucion en CPU y WebAssembly; el modelo int8 esta orientado a entornos sin GPU.
- Entrada de audio mono a 16 kHz con normalizacion de media cero y varianza unitaria.
- Decodificacion CTC voraz integrada en el flujo de inferencia.
- No se documentan capacidades de traduccion, diarizacion, puntuacion automatica, tool calling ni razonamiento multi-paso.

## Casos de uso

- Transcripcion en navegador de grabaciones `vmw-MZ`: el modelo puede cargarse con `onnxruntime-web` y transcribir audio directamente en el cliente, sin enviar datos a un servidor, lo que es adecuado para entornos con conectividad limitada o requisitos de privacidad.
- Digitalizacion de archivos orales en emakhuwa: permite convertir entrevistas, cuentos y grabaciones de campo en texto para archivos linguisticos y corpus, gracias a su soporte especifico de la lengua y su licencia permisiva.
- Subtitulado offline de material audiovisual: al ejecutarse en CPU/WASM, puede integrarse en herramientas de escritorio o web para generar subtitulos en emakhuwa sin infraestructura de GPU.
- Investigacion en linguistica computacional de lenguas bantu: sirve como linea base reproducible y cuantizada para comparar con otros sistemas ASR en `vmw`.
- Aplicaciones educativas en zonas con hardware modesto: el tamano de ~1 GB en int8 y la ejecucion en CPU permiten desplegar transcripcion en equipos de gama baja o en el navegador de un portatil.
- Prototipado rapido de pipelines ASR: la exportacion ONNX estandar facilita la integracion en flujos de transformers.js y en pruebas de concepto sin dependencias de PyTorch.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| WER | 15,21 % | Modelo original fairseq2, conjunto de test |
| CER | 2,50 % | Modelo original fairseq2, conjunto de test |
| Diferencia CER (ONNX int8 vs fp32) | 0,66 % | Muestras de habla de prueba |
| Diferencia maxima de logits (fp32 ONNX vs PyTorch) | 6e-4 | Verificacion de equivalencia |

No se han publicado resultados comparativos con otros modelos ASR en la informacion disponible. El autor advierte que el modelo int8 esta pensado para CPU/WebAssembly y que en wasm monohilo se espera una velocidad inferior al tiempo real.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso int8 orientado a CPU/WASM; la version fp32 requeriria aproximadamente 4 GB en GPU (estimacion por tamano de parametros, no confirmada en la model card).
- GPU recomendadas: no especificadas; el artefacto publicado esta orientado a CPU y WebAssembly.
- Cabe en GPU de consumo: la version int8 (~1 GB) es apta para CPU y equipos de gama baja; la fp32 podria caber en GPUs de consumo con suficiente memoria, aunque no se documenta.
- Opciones de despliegue: `onnxruntime-web` (navegador), `onnxruntime` en CPU; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo ASR de este tipo).
- Latencia y throughput: no disponibles; el autor indica que en wasm monohilo se espera mas lento que tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| omniASR-CTC-1B-v2-emakhuwa-onnx | ~1B | no disponible | emakhuwa | Apache 2.0 | ONNX int8 |
| felerminoali/omniASR-CTC-1B-v2-emakhuwa (base) | ~1B | no disponible | emakhuwa | Apache 2.0 | PyTorch/fairseq2 |
| Whisper (familia OpenAI) | 39M-1,55B | 30 s de audio | multilingue (sin emakhuwa garantizado) | MIT | safetensors, GGUF, ONNX |
| wav2vec2 base de Meta | 95M-317M | audio variable | multilingue (segun checkpoint) | Apache 2.0 / MIT segun version | PyTorch, ONNX |

La comparativa con Whisper y wav2vec2 es orientativa: no se dispone de resultados de benchmarks en emakhuwa para esos modelos en la informacion proporcionada, por lo que no puede afirmarse superioridad o inferioridad en WER/CER frente a ellos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre una lengua y probablemente un dominio limitado, el rendimiento puede degradarse fuera de ese dominio.
- Riesgo de alucinacion: en ASR CTC el riesgo se manifiesta como sustituciones, omisiones e inserciones; el WER del 15,21 % en test indica un margen de error relevante para produccion.
- Limitaciones de contexto o idioma: el modelo solo soporta emakhuwa (`vmw`); no se documenta cobertura de otras lenguas ni de variantes dialectales.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base de Meta y de los datos de entrenamiento originales.
- Caveat de produccion: el modelo int8 en wasm monohilo es mas lento que tiempo real; para aplicaciones interactivas puede requerir hilos, WebGPU o ejecucion nativa.
- No se documentan requisitos de normalizacion adicionales mas alla de la media cero y varianza unitaria; un preprocesado incorrecto puede degradar la transcripcion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felerminoali/omniASR-CTC-1B-v2-emakhuwa-onnx
- Modelo base (PyTorch): https://huggingface.co/felerminoali/omniASR-CTC-1B-v2-emakhuwa
- Repositorio de onnxruntime-web: https://github.com/microsoft/onnxruntime
- Transformers.js: https://github.com/huggingface/transformers.js
- Proyecto CATfrica: no disponible (mencionado en la model card sin enlace)
