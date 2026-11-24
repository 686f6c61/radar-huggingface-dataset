# julienkay/SmolLM2-1.7B-Instruct-sentis-float16

## Resumen

SmolLM2-1.7B-Instruct-sentis-float16 es una conversión no oficial de SmolLM2-1.7B-Instruct, el modelo de lenguaje instructivo de 1.700 millones de parámetros desarrollado por Hugging Face, al formato `.sentis` propietario de Unity Inference Engine (anteriormente conocido como Sentis). La conversión la firma julienkay, autor del paquete `tools.doji.transformers`, y su objetivo es permitir la ejecución del modelo dentro del motor de inferencia de Unity sin necesidad de exportaciones intermedias ni conversiones en tiempo de ejecución.

El modelo resuelve un problema muy concreto: llevar un LLM instructivo de tamano medio a aplicaciones y videojuegos construidos con Unity, donde el runtime de inferencia disponible es Inference Engine y no frameworks como PyTorch, vLLM o llama.cpp. Al estar los pesos en float16, el fichero `model.sentis` ocupa 3,38 GiB, la mitad que la conversión equivalente en float32 (6,75 GiB), lo que reduce de forma significativa el espacio en disco y el consumo de memoria en el dispositivo.

La relevancia de esta ficha es acotada: no se trata de un modelo nuevo ni de un fine-tune, sino de un artefacto de despliegue. Hereda íntegramente las capacidades, el entrenamiento y las limitaciones del SmolLM2-1.7B-Instruct original, y solo anade la capa de compatibilidad con Unity. La licencia Apache 2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, clase `LlamaForCausalLM`); detalles completos en la model card del modelo base |
| Parametros totales | 1.700 millones (1,7B), heredados del modelo base |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (consultar la model card de SmolLM2-1.7B-Instruct) |
| Tipos de cuantizacion | float16 (pesos); tensores de rango 1 como los pesos de normalizacion permanecen en float32; se castean a float32 por capa en el momento de la ejecucion |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | `.sentis` (Unity Inference Engine 2.6); fichero `model.sentis` de 3,38 GiB; tokenizer y configs del modelo original |
| Modelo base | HuggingFaceTB/SmolLM2-1.7B-Instruct |
| Tamano del repositorio | 3,6 GB |
| Runtime de destino | Unity Inference Engine (paquete `com.unity.ai.inference`) + `tools.doji.transformers` |
| Version de Inference Engine usada en la conversion | 2.6 |

## Arquitectura y entrenamiento

La arquitectura es la del SmolLM2-1.7B-Instruct original: un transformer decoder-only de la familia Llama, expuesto en Unity a través de la clase `LlamaForCausalLM` del paquete `tools.doji.transformers`. Esta ficha no aporta información sobre el número de tokens de entrenamiento, la composición del dataset ni las fases de alineación (RLHF/DPO) del modelo base; esos datos deben consultarse en la model card de HuggingFaceTB/SmolLM2-1.7B-Instruct.

La innovación técnica de esta conversión es puramente de despliegue. El punto de partida es la exportación ONNX de julienkay/SmolLM2-1.7B-Instruct-onnx, que ya contiene pesos en float16, de modo que los valores del fichero `.sentis` son idénticos. La conversión se realizó con `tools.doji.onnx-model-loader` mediante la llamada `OnnxModelLoader.Save(onnxPath, sentisPath, QuantizationType.Float16)`, que escribe los pesos del ONNX al `.sentis` uno a uno, sin mantener nunca todos los pesos en memoria. Los pesos de las capas MatMul, Gemm, Conv, ConvTranspose y Gather se almacenan en float16, mientras que los tensores de rango 1 (pesos de normalización) permanecen en float32. En el dispositivo, los pesos siguen en float16 y cada uno se castea a float32 justo antes de la capa que lo lee por primera vez, de forma que solo existen copias en float32 para las capas en ejecución.

La validación realizada por el autor consistió en comparar, en Unity con GPU y `LlamaForCausalLM`, la salida del modelo frente a la conversión float32 del mismo ONNX, con cuatro prompts de chat, decodificación greedy y 48 tokens nuevos: coincidencia del siguiente token en 4 de 4 casos, divergencia KL media de 0 y respuesta greedy idéntica en 4 de 4. El autor justifica la fidelidad del float16 indicando que SmolLM2 se entrenó en bfloat16, por lo que float16 representa sus pesos con precisión prácticamente exacta.

## Capacidades

- Generación de texto conversacional e instructiva, heredada del SmolLM2-1.7B-Instruct original.
- Razonamiento y respuesta a instrucciones en formato chat, con plantilla de tokenizer del modelo base.
- Capacidades de código y matemáticas en la medida en que las tenga el modelo base (no se detallan en la información disponible).
- Ejecución nativa dentro de Unity mediante el runtime de Inference Engine, con API en C# (`AutoTokenizer.FromPretrainedAsync`, `AutoModelForCausalLM.FromPretrainedAsync`).
- Decodificación greedy validada; otros esquemas de muestreo dependen de la implementación del paquete `tools.doji.transformers`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- NPCs conversacionales en videojuegos Unity: el modelo se carga con `AutoModelForCausalLM.FromPretrainedAsync` dentro del proyecto y genera diálogo en respuesta a las entradas del jugador, sin salir del runtime de Unity ni depender de un servicio externo.
- Asistentes embebidos en aplicaciones de escritorio o móviles hechas con Unity: al ocupar 3,38 GiB en float16, el modelo puede distribuirse junto con la aplicación y ejecutarse localmente en GPU, reduciendo la dependencia de APIs de terceros.
- Prototipado rápido de interfaces de chat en herramientas internas de Unity: la carga directa de `model.sentis` sin conversión previa permite iterar sobre la UX del chat sin montar infraestructura de servidor.
- Generación de texto contextual en experiencias de realidad aumentada o virtual: el modelo se integra en la escena de Unity y produce texto dinámico (descripciones, pistas, respuestas) a partir de estímulos del entorno.
- Evaluación comparativa de backends de inferencia: sirve como referencia float16 frente a la conversión float32 del mismo ONNX para medir fidelidad y consumo de memoria en Unity.
- Docencia y demostraciones de LLMs en entornos Unity: el tamaño de 1,7B parámetros y el fichero único de 3,38 GiB facilitan su uso en talleres donde se quiere mostrar inferencia local de un modelo instructivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la validación de fidelidad frente a la conversión float32: coincidencia del siguiente token en 4 de 4 prompts, divergencia KL media de 0 y respuesta greedy idéntica en 4 de 4 casos, con decodificación greedy y 48 tokens nuevos.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero de pesos ocupa 3,38 GiB en float16; a ello hay que sumar el coste de las copias float32 por capa que se crean durante la ejecución y el de la caché KV, por lo que el pico de memoria en GPU supera los 3,38 GiB. No se proporciona una cifra exacta de VRAM total.
- GPU recomendadas: no disponible en la información proporcionada. La validación se realizó en Unity con GPU, sin especificar el modelo.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; por el tamano del fichero (3,38 GiB) es plausible en GPUs con 8 GB o más de VRAM, pero el pico real depende de las copias float32 y de la caché KV.
- Opciones de despliegue: exclusivamente Unity Inference Engine 2.6 o posterior, a través del paquete `tools.doji.transformers` y del AI Model Hub de Doji. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.sentis` es propietario.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Runtime | Licencia | Contexto |
|---|---|---|---|---|---|
| julienkay/SmolLM2-1.7B-Instruct-sentis-float16 | 1,7B | `.sentis` float16 | Unity Inference Engine | Apache 2.0 | no disponible |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,7B | safetensors | PyTorch, transformers, vLLM, llama.cpp (via GGUF) | Apache 2.0 | no disponible en esta ficha |
| julienkay/SmolLM2-1.7B-Instruct-onnx | 1,7B | ONNX float16 | ONNX Runtime | Apache 2.0 | no disponible |

La comparación relevante es de formato y runtime, no de calidad: los tres artefactos contienen esencialmente los mismos pesos. La versión `.sentis` es la única que se ejecuta de forma nativa en Unity; la versión ONNX sirve para ONNX Runtime y la original para el ecosistema Python. No se dispone de datos de benchmarks para establecer diferencias de rendimiento entre ellas.

## Limitaciones y advertencias

- Es una conversión no oficial: el autor no es Hugging Face y no hay garantía de mantenimiento ni de soporte.
- El fichero se guardó con Inference Engine 2.6; una versión posterior del runtime puede requerir reconvertirlo desde el ONNX de origen.
- El formato `.sentis` es propietario de Unity, lo que ata el artefacto a ese ecosistema y limita su portabilidad.
- Hereda todos los sesgos, el riesgo de alucinación y las limitaciones de contexto e idioma del SmolLM2-1.7B-Instruct original, que no se detallan en la información disponible.
- La validación es reducida: cuatro prompts, decodificación greedy y 48 tokens nuevos; no cubre muestreo estocástico, contextos largos ni cargas prolongadas.
- El pico de memoria en GPU es superior al tamano del fichero por las copias float32 por capa y la caché KV; conviene medirlo en el hardware objetivo antes de producción.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base y del runtime de Unity por separado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción prácticamente nula y ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/julienkay/SmolLM2-1.7B-Instruct-sentis-float16
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Exportación ONNX de origen: https://huggingface.co/julienkay/SmolLM2-1.7B-Instruct-onnx
- Paquete `tools.doji.transformers`: https://github.com/julienkay/tools.doji.transformers
- Herramienta de conversión `tools.doji.onnx-model-loader`: https://github.com/julienkay/tools.doji.onnx-model-loader
- Documentación de Unity Inference Engine: https://docs.unity3d.com/Packages/com.unity.ai.inference@latest
