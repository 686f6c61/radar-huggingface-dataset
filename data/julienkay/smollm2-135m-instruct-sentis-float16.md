# julienkay/SmolLM2-135M-Instruct-sentis-float16

## Resumen

SmolLM2-135M-Instruct-sentis-float16 es una conversión no oficial del modelo SmolLM2-135M-Instruct de Hugging Face al formato `.sentis` de Unity Inference Engine, publicada por el usuario julienkay. No se trata de un modelo nuevo ni de un fine-tuning: los pesos son los del modelo original de Hugging Face, transformados para poder cargarse directamente en el motor de inferencia de Unity sin pasos de conversión adicionales en tiempo de ejecución. El modelo base es un transformer decoder-only de 135 millones de parámetros entrenado por Hugging Face, ajustado para instrucciones y conversación.

La relevancia de esta conversión es práctica: permite ejecutar un modelo de lenguaje pequeño dentro de aplicaciones y juegos hechos con Unity, en GPU, con un fichero de pesos de 0,30 GiB (la mitad que la conversión a float32, 0,61 GiB). Está pensada para el paquete `tools.doji.transformers` y el componente `LlamaForCausalLM`, que ofrece una API en C# para tokenización y generación. El contexto, el tokenizador y los ficheros de configuración son los del modelo original.

Al ser una conversión de formato y no un modelo reentrenado, sus capacidades, sesgos y limitaciones son las del SmolLM2-135M-Instruct original; esta ficha describe la conversión y remite al modelo base para todo lo relativo a entrenamiento y evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, exportado como ONNX y convertido a `.sentis`) |
| Parametros totales | 135 millones (modelo base SmolLM2-135M-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | float16 para pesos de capas MatMul, Gemm, Conv, ConvTranspose y Gather; float32 para tensores de rango 1 (pesos de normalizacion) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | `.sentis` (Unity Inference Engine 2.6); origen ONNX en julienkay/SmolLM2-135M-Instruct-onnx |
| Tamano del repositorio | 0,3 GB |
| Tamano del fichero de pesos | 0,30 GiB (float16) frente a 0,61 GiB (float32) |
| Version de Inference Engine | 2.6 (una version posterior puede requerir reconversion desde ONNX) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base SmolLM2-135M-Instruct: un transformer decoder-only de tipo Llama con 135 millones de parametros, entrenado originalmente por Hugging Face y ajustado para seguir instrucciones en formato conversacional. Esta publicacion no aporta informacion nueva sobre el entrenamiento: no se detallan el numero de tokens, la composicion del dataset ni las tecnicas de alineacion (RLHF/DPO) empleadas, que corresponden al modelo original.

La innovacion tecnica de esta ficha es el proceso de conversion. El punto de partida es una exportacion ONNX (julienkay/SmolLM2-135M-Instruct-onnx), que se convierte con `tools.doji.onnx-model-loader` mediante `OnnxModelLoader.Save(onnxPath, sentisPath, QuantizationType.Float16)`. El conversor escribe los pesos del fichero ONNX al `.sentis` uno a uno, de modo que nunca mantiene todos los pesos en memoria a la vez. Los pesos permanecen en float16 en el dispositivo y se convierten a float32 justo antes de la capa que los lee por primera vez, de forma que solo existen copias float32 de las capas en ejecucion. Segun el autor, SmolLM2 se entreno en bfloat16, por lo que float16 representa sus pesos casi exactamente.

La validacion reportada por el autor, en Unity con `LlamaForCausalLM` sobre GPU, compara esta conversion float16 con la conversion float32 del mismo ONNX: con cuatro prompts de chat y decodificacion greedy de 48 tokens nuevos, se obtiene el mismo siguiente token en 4 de 4 casos, una divergencia KL media de las distribuciones del siguiente token de 1,01E-11 y la misma respuesta greedy en 4 de 4 casos.

## Capacidades

- Generacion de texto autoregresiva y conversacion multi-turno en formato de chat, heredadas del ajuste de instrucciones del modelo base.
- Razonamiento basico y respuesta a instrucciones simples, limitado por el tamano de 135 millones de parametros.
- Generacion de codigo y matematicas: capacidad presente en el modelo base pero muy limitada por escala; no se aportan evaluaciones especificas en esta conversion.
- Sin soporte documentado de tool calling ni function calling en la informacion proporcionada.
- Sin soporte documentado de agentes o razonamiento multi-paso en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Sin modo thinking, vision ni audio.
- Integracion nativa con Unity: carga directa de `model.sentis` mediante `AutoModelForCausalLM.FromPretrainedAsync` y `AutoTokenizer.FromPretrainedAsync` del paquete `tools.doji.transformers`.

## Casos de uso

- Dialogos con NPC en videojuegos Unity: el modelo puede generar respuestas conversacionales dentro de la propia aplicacion, en GPU, con un fichero de 0,30 GiB que se carga directamente sin conversion, lo que simplifica el pipeline de build.
- Prototipado rapido de interfaces conversacionales en Unity: util para validar UX de chat y flujos de dialogo antes de invertir en modelos mayores, gracias a la API C# de `tools.doji.transformers`.
- Asistentes embebidos de bajo coste en aplicaciones de escritorio o moviles hechas con Unity: el peso reducido (135M parametros en float16) permite distribuir el modelo junto con la aplicacion.
- Generacion de texto de relleno o variaciones de contenido (descripciones, mensajes, textos cortos) en herramientas internas de authoring dentro del editor de Unity.
- Educacion y demos de inferencia en dispositivo: sirve para mostrar como funciona un LLM en un motor de juego, con validacion numerica frente a la version float32.
- Pruebas de regresion de pipelines de conversion ONNX a `.sentis`: el modelo y su validacion (KL de 1,01E-11, coincidencia 4 de 4) sirven como caso de referencia para verificar el conversor `tools.doji.onnx-model-loader`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion reportada es la comparacion float16 frente a float32 descrita en la seccion de arquitectura:

| Prueba | Resultado |
|---|---|
| Mismo siguiente token tras cada prompt (4 prompts) | 4 de 4 |
| Divergencia KL media de la distribucion del siguiente token | 1,01E-11 |
| Misma respuesta greedy (48 tokens nuevos) | 4 de 4 |

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero de pesos ocupa 0,30 GiB en float16; el consumo total depende del runtime de Unity Inference Engine y de las copias float32 transitorias de las capas en ejecucion.
- GPU recomendadas: no se especifican modelos concretos en la informacion proporcionada; la validacion se realizo en Unity sobre GPU.
- Compatibilidad con GPU de consumo: por el tamano del modelo (135M parametros, 0,30 GiB de pesos) es razonable esperar que quepa en GPU de consumo, pero no se aporta una lista verificada.
- Opciones de despliegue: Unity Inference Engine 2.6 con el paquete `tools.doji.transformers` (componente `LlamaForCausalLM`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Entorno de ejecucion | Notas |
|---|---|---|---|---|---|
| SmolLM2-135M-Instruct-sentis-float16 (esta ficha) | 135M | `.sentis` float16 | Apache 2.0 | Unity Inference Engine 2.6 | Conversion no oficial; 0,30 GiB de pesos |
| SmolLM2-135M-Instruct (Hugging Face) | 135M | safetensors (formato original) | Apache 2.0 | Transformers, vLLM, llama.cpp, etc. | Modelo base oficial; referencia para entrenamiento y limitaciones |
| julienkay/SmolLM2-135M-Instruct-onnx | 135M | ONNX | Apache 2.0 | ONNX Runtime | Origen de la conversion a `.sentis` |
| Conversion float32 del mismo ONNX | 135M | `.sentis` float32 | Apache 2.0 | Unity Inference Engine | 0,61 GiB de pesos; referencia de validacion numerica |

## Limitaciones y advertencias

- Es una conversion no oficial: el autor no es Hugging Face y no hay garantia de mantenimiento ni de soporte.
- El fichero se guardo con Inference Engine 2.6; una version posterior del motor puede requerir reconvertirlo desde el ONNX.
- Al heredar el modelo base de 135M parametros, la calidad de razonamiento, codigo y matematicas es limitada en comparacion con modelos de mayor escala; el riesgo de alucinacion es alto en tareas que exijan conocimiento factual.
- Sesgos conocidos: no se documentan en la informacion proporcionada; deben consultarse en la model card del SmolLM2-135M-Instruct original.
- Idiomas soportados y comportamiento multilingue: no disponibles en la informacion proporcionada.
- Longitud de contexto: no disponible en la informacion proporcionada; debe consultarse en el modelo base.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar los terminos del modelo base y de las dependencias (`tools.doji.transformers`, `tools.doji.onnx-model-loader`, Unity Inference Engine), que pueden tener sus propias condiciones.
- La validacion reportada es muy reducida (4 prompts, 48 tokens, decodificacion greedy) y no cubre muestreo, contextos largos ni cargas concurrentes.

## Enlaces

- Hugging Face (esta conversion): https://huggingface.co/julienkay/SmolLM2-135M-Instruct-sentis-float16
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Exportacion ONNX de origen: https://huggingface.co/julienkay/SmolLM2-135M-Instruct-onnx
- Paquete Unity `tools.doji.transformers`: https://github.com/julienkay/tools.doji.transformers
- Conversor `tools.doji.onnx-model-loader`: https://github.com/julienkay/tools.doji.onnx-model-loader
- Documentacion de Unity Inference Engine: https://docs.unity3d.com/Packages/com.unity.ai.inference@latest
