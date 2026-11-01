# JohnP1/d1a-e2b-it-qat-onnx

## Resumen

D1A-E2B-it QAT ONNX es una distribucion en formato ONNX Runtime del modelo D1A-E2B-it QAT v0.7, un modelo derivado de Gemma 4 E2B-it QAT de Google. Lo publica JohnP1 y su proposito es empaquetar en un unico grafo ONNX dos modos de funcionamiento: un modo de decision (clasificacion de intenciones y peticiones) y un modo de chat conversacional. El modelo base es un transformer denso de aproximadamente 2.000 millones de parametros, cuantizado con QAT a 4 bits en pesos (w4a16), y esta orientado a ejecucion en CPU de dispositivos Android mediante ONNX Runtime.

La relevancia de esta publicacion radica en su enfoque de despliegue: mantiene los pesos int4 de Google exactamente como `MatMulNBits` (bloque 32) y anade un adaptador LoRA con una cabeza de puntero para el modo de decision, de forma que un mismo conjunto de pesos sirve para clasificar y para conversar. El modo chat desactiva el adaptador mediante un LoRA de rango 0 con escala 0, recuperando el comportamiento nativo de Gemma 4 E2B-it QAT. Todo el conjunto pesa 3,1 GB en el repositorio.

El modelo es experimental y esta pensado para inferencia en el dispositivo, sin fotos, voz ni video. Soporta ingles y japones, se distribuye bajo licencia Apache-2.0 y esta medido sobre un Pixel 10 Pro (Tensor G5) con ONNX Runtime 1.22.0, donde alcanza aproximadamente 12,9 tokens/s en decodificacion de chat y unos 0,4 s por decision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4 E2B) con adaptador LoRA y cabeza de puntero para decisiones; exportado a ONNX |
| Parametros totales | aproximadamente 2.000 millones (modelo base E2B); no se detalla el desglose exacto |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible de forma explicita; las pruebas usan prefijos en cache de hasta 1,4k tokens |
| Tipos de cuantizacion | pesos int4 QAT (w4a16, `MatMulNBits` bloque 32); tablas de embedding 4-bit (`q4g64`); activaciones int8 con `accuracy_level` 4 o fp32 con `accuracy_level` 1 |
| Idiomas soportados | ingles (preguntas y documentos) y japones (documentos); segun la model card, preguntas en ingles y documentos en ingles o japones |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`.onnx` con datos externos `.data`), safetensors para las tablas de embedding, adaptadores `.onnx_adapter` |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 E2B-it QAT, un transformer denso de unos 2.000 millones de parametros cuantizado con Quantization-Aware Training a 4 bits en pesos y 16 bits en activaciones (w4a16). Sobre ese tronco, el autor entrena un adaptador LoRA junto con una cabeza de puntero que transforma el modelo en un clasificador de decisiones: dado un texto de entrada, produce una decision con una probabilidad asociada. El modo chat simplemente desactiva el adaptador (LoRA de rango 0 con escala 0), por lo que la conversacion es exactamente la de Gemma 4 E2B-it QAT.

La innovacion tecnica principal esta en la exportacion a ONNX: los 276 niveles lineales cuantizados se conservan byte a byte como `MatMulNBits` con bloque 32, la cabeza LM usa la tabla 4-bit del build MLX con un termino de correccion exacto en lugar de zero points en coma flotante (que en ORT 1.22 toman una ruta lenta), y las tablas de embedding se sirven mediante memory-mapping desde safetensors. El grafo incluye dos variantes (`accuracy_level` 1 con computo fp32 y `accuracy_level` 4 con activaciones int8) y un fichero de configuracion `d1a_onnx.json` con nombres de entradas y salidas, plantilla de chat, ids especiales y regla de K/V.

En cuanto a datos de entrenamiento del adaptador, la model card cita intenciones de MASSIVE 1.1 de Amazon (CC BY 4.0), datos de decision en japones derivados de JGLUE (CC BY-SA 4.0) y datos de pull requests de NousResearch/hermes-agent (MIT), con el conjunto etiquetado de PR privado. No se especifica el numero de tokens de entrenamiento ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Clasificacion de decisiones: el adaptador activo produce una decision con probabilidad, pensada para enrutar o clasificar peticiones.
- Generacion de texto conversacional: con el adaptador nulo, se comporta como Gemma 4 E2B-it QAT.
- Razonamiento basico y respuesta a preguntas en ingles.
- Procesamiento de documentos en ingles y japones.
- Cache de K/V del prefijo del sistema y de turnos previos para acelerar la decodificacion.
- Inferencia en CPU mediante ONNX Runtime, incluido Android.
- Dos niveles de precision: fp32 (`accuracy_level` 1) para paridad con el build MLX e int8 (`accuracy_level` 4) para velocidad.
- No soporta vision, audio ni video en este build.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta modo thinking ni razonamiento multi-paso explicito.

## Casos de uso

- Enrutado de peticiones en aplicaciones moviles: el modo decision clasifica la intencion del usuario (por ejemplo, consulta, queja o peticion de accion) con una probabilidad asociada, lo que permite dirigir la peticion al flujo adecuado sin salir del dispositivo.
- Asistente conversacional offline en Android: con el adaptador nulo, el modelo mantiene conversaciones multi-turno en ingles con cache de K/V, sin conexion de red y con un consumo de memoria de aproximadamente 1,75-1,87 GB PSS.
- Clasificacion de documentos en japones e ingles: el adaptador puede etiquetar documentos o tickets segun su intencion, aprovechando los datos de decision derivados de JGLUE.
- Triaje de pull requests y tareas de desarrollo: los datos de entrenamiento incluyen pull requests de hermes-agent, por lo que el modo decision puede usarse para clasificar o priorizar PR en herramientas internas.
- Preprocesado en pipelines de agentes: el modo decision actua como primer filtro barato (0,4 s por llamada) antes de invocar un modelo mayor en la nube, reduciendo coste y latencia.
- Chat de bajo consumo en dispositivos sin GPU: con ONNX Runtime y 4 hilos, el modelo ofrece unos 12,9 tokens/s en decodificacion y 0,56 s de prefill para 150 tokens, adecuado para asistentes integrados en apps.
- Verificacion y paridad de despliegue: los ficheros `goldens.txt` y `reference.py` permiten validar que una implementacion ONNX reproduce las decisiones esperadas, util para integracion en CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). La model card unicamente aporta mediciones de latencia y memoria sobre un Pixel 10 Pro (Tensor G5) con ONNX Runtime 1.22.0, 4 hilos y `accuracy_level` 4:

| Metrica | Valor medido |
|---|---|
| Decision (una llamada, ~150 tokens nuevos tras prefijo en cache) | ~0,4 s |
| Decodificacion de chat con past de 1,3k tokens | ~12,9 tokens/s (77 ms/paso) |
| Decodificacion de chat con past de 64 tokens | 56 ms/paso |
| Prefill de un turno de chat (150 tokens) | ~0,56 s |
| Memoria con decisiones + chat y cache de 1,4k tokens | ~1,75-1,87 GB PSS |

En cuanto a exactitud, con `accuracy_level` 1 las decisiones coinciden con los grafos ONNX anteriores dentro de 5e-10 y las respuestas greedy de chat son identicas al build MLX en 18 de 22 prompts. Con `accuracy_level` 4 las probabilidades de decision varian hasta ~0,1 y las respuestas greedy coinciden con `accuracy_level` 1 en 14 de 22 prompts.

## Requisitos de hardware

- VRAM: no aplica en el escenario objetivo (CPU). En memoria del sistema, el uso medido es de aproximadamente 1,75-1,87 GB PSS con decisiones y chat y una cache de 1,4k tokens.
- GPU recomendadas: no se documentan; el build esta orientado al execution provider de CPU de ONNX Runtime.
- GPU de consumo: no se indica compatibilidad con GPU de consumo; el modelo esta pensado para CPU.
- Despliegue: ONNX Runtime 1.22.0 (con `tokenizers` y `numpy`), execution provider de CPU; valido en Android y en cualquier CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~0,4 s por decision, ~12,9 tokens/s en decodificacion con past de 1,3k tokens y ~0,56 s de prefill para 150 tokens en Pixel 10 Pro (Tensor G5) con 4 hilos.
- Nota de integracion: en ORT 1.22 el IO binding descarta las entradas del adaptador activo, por lo que hay que usar buffers de salida preasignados (`run(inputs, requestedOutputs, pinnedOutputs, runOptions)`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| D1A-E2B-it QAT ONNX (este) | ~2.000 M | no disponible | ONNX (int4 QAT) | Apache-2.0 | Decision + chat en CPU/Android |
| D1A-E2B-it QAT MLX (v0.7) | ~2.000 M | no disponible | MLX (4-bit) | Apache-2.0 | Mismo modelo, con vision, voz y video; orientado a Apple Silicon |
| google/gemma-4-E2B-it-qat-w4a16-ct | ~2.000 M | no disponible | checkpoint QAT de Google | Apache-2.0 | Modelo base de chat, sin adaptador de decision |
| Gemma 4 E2B-it (sin QAT) | ~2.000 M | no disponible | safetensors | Apache-2.0 | Chat en precision completa; mayor huella de memoria |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de benchmarks frente a alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Solo texto: este build no procesa fotos, voz ni video; para esas modalidades hay que usar el build MLX.
- Las preguntas deben formularse en ingles; los documentos pueden estar en ingles o japones.
- La calidad del chat es la de Gemma 4 E2B-it QAT, no la del adaptador D1A, que se desactiva en modo chat.
- Con `accuracy_level` 4 (activaciones int8) las decisiones y el chat difieren del computo fp32 en empates cercanos; conviene confirmar las respuestas de baja confianza antes de actuar.
- La cabeza de puntero del adaptador nulo devuelve NaN, de modo que una ejecucion de decision sobre el adaptador nulo falla de forma segura (fail closed).
- La decodificacion es lenta para un modelo de 2B en CPU de telefono y empeora con prompts de sistema largos.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano; no se documentan evaluaciones de sesgo.
- El modelo es experimental y no se han publicado benchmarks estandar, por lo que su rendimiento frente a alternativas no esta cuantificado.
- La licencia es Apache-2.0, pero los datos de entrenamiento del adaptador incluyen JGLUE bajo CC BY-SA 4.0, lo que conviene revisar antes de un uso comercial del adaptador.
- El dataset etiquetado de pull requests es privado, lo que limita la reproducibilidad del entrenamiento del adaptador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JohnP1/d1a-e2b-it-qat-onnx
- Build MLX de referencia (v0.7): https://huggingface.co/JohnP1/d1a-e2b-it-qat-mlx-q4
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-w4a16-ct
- Codigo: https://github.com/jonpol01/d1a
- Kev (base del codigo): https://github.com/jaredpalmer/kev
- MASSIVE 1.1 (FitzGerald et al., 2022): https://huggingface.co/datasets/AmazonScience/massive
- JGLUE (Yahoo Japan Corporation y Waseda University): https://github.com/yahoojapan/JGLUE
- NousResearch/hermes-agent: https://github.com/NousResearch/hermes-agent
