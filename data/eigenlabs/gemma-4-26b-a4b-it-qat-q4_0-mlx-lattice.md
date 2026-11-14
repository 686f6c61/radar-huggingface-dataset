# EigenLabs/gemma-4-26B-A4B-it-qat-q4_0-MLX-lattice

## Resumen

Gemma 4 26B A4B it es un modelo multimodal de Google (familia Gemma 4) con arquitectura Mixture of Experts (MoE), 25.805.936.206 parametros totales y aproximadamente 4.000 millones de parametros activos por token, según indica el sufijo "A4B". Esta ficha concreta es una conversion comunitaria publicada por EigenLabs bajo el nombre `gemma-4-26B-A4B-it-qat-q4_0-MLX-lattice`, pensada para ejecucion en Apple Silicon mediante la libreria MLX.

El punto diferencial de esta build no es el modelo en si, sino el proceso de cuantizacion. Google distribuye el checkpoint QAT ya ajustado a una retícula simetrica int4 (codigos -8 a 7, un paso de escala por cada 32 entradas). La build anterior de MLX recuantizaba con min-max affine a grupo 64, lo que desplazaba la mayoria de los pesos de los expertos fuera de la retícula original (relRMSE de pesos en torno al 8 %). Esta version recupera el paso de retícula y almacena los 128 x 30 expertos en 4 bits con grupo 32, reduciendo el relRMSE de pesos al 0,21 %.

El resultado es un checkpoint de 17,1 GB que conserva el tokenizer, la plantilla de chat, el processor y los ficheros de generacion byte a byte respecto a la build anterior, y que se carga con mlx-lm >= 0.32 y mlx-swift-lm. La licencia declarada es Apache 2.0. No hay informacion publicada sobre benchmarks en la documentacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), multimodal image-text-to-text |
| Parametros totales | 25.805.936.206 |
| Parametros activos | ~4B (según denominacion "A4B"; no disponible el desglose exacto) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit grupo 32 (expertos MoE, retícula exacta), 4-bit grupo 64 (atencion, embed_tokens, embed_vision), 8-bit grupo 64 (MLP denso, router), bf16 (normas, escalares, vision tower) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX, cuantizacion por modulo en `config.json`) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-26B-A4B-it-qat-q4_0-unquantized`, un checkpoint de Google con Quantization-Aware Training (QAT) sobre una arquitectura MoE multimodal. La nomenclatura "switch_glu" en los tensores de los expertos sugiere un mecanismo de enrutamiento por experto con activacion GLU, con 128 expertos por capa y 30 capas afectadas (128 x 30 expertos), sumando 22,8 mil millones de parametros solo en los expertos. El modelo incorpora ademas un vision tower (`embed_vision`) y un cabezal de salida atado a `embed_tokens`.

La innovacion tecnica de esta conversion es la preservacion de la retícula de cuantizacion original de Google. En lugar de recuantizar con min-max affine a grupo 64, el conversor `greq_convert.py` (receta D, determinista y sin calibracion, sobre MLX 0.32.4) recupera el paso de retícula de cada bloque de 32 entradas y lo aplica como escala con bias `-8 * step`, manteniendo los codigos int4 intactos. El resto de modulos se mantiene byte-identico a la build previa. El borrador especulativo (MTP drafting) reutiliza el asistente QAT `mlx-community/gemma-4-26B-A4B-it-qat-assistant-4bit`. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las fases de RLHF/DPO del modelo base.

## Capacidades

- Generacion de texto conversacional (pipeline `conversational`), con plantilla de chat incluida.
- Procesamiento de imagen y texto combinados (`image-text-to-text`), gracias al vision tower en bf16.
- Razonamiento y generacion de codigo: capacidades esperadas de la familia Gemma 4, si bien no se detallan en la model card.
- Decodificacion especulativa mediante borrador MTP (asistente QAT de 4 bits), orientada a reducir latencia en Apple Silicon.
- Cuantizacion por modulo que permite cargar el modelo en memoria unificada de equipos Apple con 17,1 GB de pesos.
- Soporte de tool calling, agentes, modo thinking o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el checkpoint esta disenado para mlx-lm y mlx-swift-lm, de modo que un Mac Studio o MacBook Pro con memoria unificada suficiente puede ejecutar un MoE de 26B totales con ~4B activos, manteniendo los expertos en 4 bits para reducir el ancho de banda de memoria.
- Asistentes conversacionales con entrada de imagen: el pipeline image-text-to-text y el vision tower permiten construir un asistente que reciba capturas, diagramas o fotos y responda en lenguaje natural, integrado en una app macOS o iOS via mlx-swift-lm.
- Prototipado de agentes con decodificacion especulativa: el uso del asistente MTP permite acelerar la generacion en flujos multi-turno donde la latencia percibida es critica, como asistentes de escritorio o herramientas de productividad.
- Evaluacion de tecnicas de cuantizacion: la build sirve como referencia para estudiar el impacto de preservar la reticula QAT frente a recuantizar, ya que el autor documenta el relRMSE de pesos (0,21 % frente a ~8 %) y permite comparaciones controladas con la build anterior.
- Desarrollo offline y privacidad: al ejecutarse localmente sin llamadas a API, es adecuado para procesar documentos o imagenes sensibles en entornos sin conectividad.
- Investigacion en eficiencia MoE: con 22,8B de parametros en expertos y ~4B activos, el modelo permite medir el coste real de enrutamiento y el ahorro energetico en hardware Apple frente a GPUs dedicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es el error relativo de pesos (relRMSE) de la cuantizacion: 0,21 % en los expertos MoE de esta build, frente a ~8 % en la build MLX anterior con min-max affine a grupo 64.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 17,1 GB de pesos en disco; se recomienda al menos 24 GB de memoria unificada para dejar margen a KV cache y overhead de runtime, y 32 GB o mas para contextos largos.
- GPU compatibles: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro, Max y Ultra) mediante MLX. No es un checkpoint para CUDA.
- Cabe en GPU de consumo: si, en equipos Apple con memoria unificada suficiente (MacBook Pro M-series con 24 GB o mas, Mac Studio, Mac mini con 24 GB o superior).
- Opciones de despliegue: mlx-lm >= 0.32 y mlx-swift-lm. No se mencionan vLLM, llama.cpp, Ollama ni TGI; el formato MLX con cuantizacion por modulo no es directamente compatible con esos runtimes.
- Latencia y throughput: no disponibles. La build incluye soporte de decodificacion especulativa con asistente MTP de 4 bits, que deberia reducir la latencia frente a generacion autoregresiva pura, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Cuantizacion | Licencia | Runtime |
|---|---|---|---|---|---|---|
| EigenLabs/gemma-4-26B-A4B-it-qat-q4_0-MLX-lattice | 25,8B | ~4B | no disponible | 4-bit/8-bit mixta, reticula exacta | apache-2.0 | MLX (Apple Silicon) |
| Build MLX previa (min-max affine g64) | 25,8B | ~4B | no disponible | 4-bit g64 | apache-2.0 | MLX (Apple Silicon) |
| google/gemma-4-26B-A4B-it-qat-q4_0-unquantized | 25,8B | ~4B | no disponible | QAT int4 sin empaquetar | apache-2.0 | Ecosistema Google/transformers |
| mlx-community/gemma-4-26B-A4B-it-qat-assistant-4bit | no disponible (asistente MTP) | no disponible | no disponible | 4-bit | no disponible | MLX (borrador especulativo) |

La comparativa se limita a variantes del mismo modelo base porque no se dispone de datos de rendimiento ni de contexto que permitan contrastarlo con otras familias. La diferencia medible entre las dos builds MLX es el relRMSE de pesos en los expertos: 0,21 % frente a ~8 %.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, toxicidad o alucinacion para esta build; el proceso de cuantizacion no corrige sesgos del modelo base.
- El riesgo de alucinacion del modelo base persiste; la cuantizacion a 4 bits puede degradar ligeramente tareas sensibles a precision numerica, aunque el autor reporta un error de pesos muy bajo en los expertos.
- La longitud de contexto no esta documentada en la informacion disponible, lo que impide planificar cargas de trabajo con ventanas largas sin verificar el `config.json`.
- El checkpoint esta atado a MLX y Apple Silicon; no es portable a CUDA ni a runtimes como vLLM o llama.cpp sin conversion adicional.
- La licencia Apache 2.0 se declara en la model card, pero conviene verificar los terminos de uso del modelo base de Google antes de un despliegue comercial, ya que la ficha no detalla condiciones adicionales de la familia Gemma.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria del comportamiento en produccion.
- Los idiomas soportados no estan documentados; no se puede asumir cobertura multilingue sin pruebas.

## Enlaces

- Hugging Face: https://huggingface.co/EigenLabs/gemma-4-26B-A4B-it-qat-q4_0-MLX-lattice
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- Asistente MTP para decodificacion especulativa: https://huggingface.co/mlx-community/gemma-4-26B-A4B-it-qat-assistant-4bit
- Libreria MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
- mlx-swift-lm: https://github.com/ml-explore/mlx-swift-lm
