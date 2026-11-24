# julienkay/Phi-3-mini-4k-instruct-sentis-float16

## Resumen

Phi-3-mini-4k-instruct-sentis-float16 es una conversión no oficial del modelo Phi-3-mini-4k-instruct de Microsoft, publicada por el usuario julienkay, orientada al motor de inferencia de Unity (Unity Inference Engine, anteriormente conocido como Sentis) y al paquete tools.doji.transformers. El modelo original es un transformer decoder-only de 3.800 millones de parámetros con una ventana de contexto de 4.096 tokens, entrenado por Microsoft para instrucciones y conversación. Esta versión traslada los pesos al formato propietario `.sentis` con cuantización float16, de modo que puedan cargarse directamente en proyectos de Unity sin conversión adicional.

La relevancia de esta ficha es acotada pero concreta: permite ejecutar un LLM de tamaño medio dentro del ecosistema Unity, lo que habilita prototipos de NPCs conversacionales, asistentes embebidos en juegos o herramientas de edición que requieren generación de texto local. No es un modelo nuevo ni un fine-tune: es un artefacto de despliegue. El autor advierte que el archivo `model.sentis` ocupa 7,12 GiB y que, con esa huella, no se ejecuta en GPUs de 12 GB, por lo que recomienda la variante uint8 para ese rango de hardware.

Al tratarse de una conversión, las capacidades, limitaciones y comportamiento lingüístico son los del Phi-3-mini-4k-instruct original; esta ficha los recoge, pero la información disponible sobre benchmarks, idiomas o composición del dataset de entrenamiento no está incluida en la model card de esta conversión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-3-mini), según modelo base; no detallada en la model card de esta conversión |
| Parámetros totales | 3.800 millones (modelo base Phi-3-mini) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | float16 (pesos de rango ≥2 en MatMul, Gemm, Conv, ConvTranspose y Gather en float16; resto en float32); existe variante uint8 |
| Idiomas soportados | no disponible en la model card de esta conversión |
| Licencia | MIT |
| Formato de pesos | `.sentis` (Unity Inference Engine); también existe exportación ONNX en repositorio separado |

## Arquitectura y entrenamiento

Esta publicación no entrena ni modifica el modelo: parte de la exportación ONNX de julienkay/Phi-3-mini-4k-instruct-onnx y la convierte con tools.doji.onnx-model-loader mediante `OnnxModelLoader.Save(onnxPath, sentisPath, QuantizationType.Float16)`. Como los pesos ONNX ya estaban en float16, los valores del archivo `.sentis` son idénticos. La conversión aplica float16 a los pesos de rango 2 o superior que actúan como entrada de peso en capas MatMul, Gemm, Conv, ConvTranspose y Gather; el resto permanece en float32. En el dispositivo, los pesos se mantienen en float16 y se convierten a float32 justo antes de la capa que los lee por primera vez, de modo que solo existen copias float32 de las capas en ejecución.

El archivo se guardó con Inference Engine 2.6.1, y el autor advierte que una versión posterior del motor podría requerir reconvertir desde el ONNX. Los archivos de configuración y tokenizer son los del modelo original, sin cambios. La arquitectura interna, el volumen de tokens de entrenamiento, la composición del dataset y las fases de alineación (RLHF/DPO) corresponden al Phi-3-mini-4k-instruct de Microsoft y no se detallan en esta model card; se remite a la card original.

## Capacidades

- Generación de texto y conversación multi-turno, con plantilla de chat aplicable mediante `ApplyChatTemplate` del tokenizer.
- Generación en streaming token a token mediante `TextStreamer`, útil para interfaces de usuario en tiempo real dentro de Unity.
- Razonamiento e instrucciones: el modelo base está ajustado para seguir instrucciones, aunque esta ficha no incluye datos específicos de evaluación.
- Integración nativa con Unity: carga directa de `model.sentis` por el motor de inferencia y por AI Model Hub, sin paso de conversión.
- API en C# a través de tools.doji.transformers (`AutoTokenizer`, `AutoModelForCausalLM`, `GenerationConfig`).
- Tool calling, function calling, modo thinking, visión y audio: no disponibles en esta conversión.
- Capacidades multilingües: no disponibles como dato verificado en la información proporcionada.

## Casos de uso

- NPCs conversacionales en videojuegos: el modelo se carga en el motor de Unity y genera respuestas en streaming dentro del bucle del juego, con una ventana de 4.096 tokens suficiente para el historial de una conversación corta y el contexto de la escena.
- Asistentes embebidos en herramientas de editor: un plugin de Unity puede usar el modelo para generar descripciones de assets, textos de ayuda o resúmenes de documentación sin salir del editor ni depender de una API externa.
- Prototipado rápido de mecánicas de diálogo: al cargarse con `AutoModelForCausalLM.FromPretrainedAsync` y una plantilla de chat, permite validar sistemas de diálogo ramificado antes de invertir en un modelo mayor o en servicios en la nube.
- Generación de texto contextual en juegos serios y simulaciones: descripciones de objetos, respuestas de tutores virtuales o variaciones de texto generadas en tiempo de ejecución a partir del estado del juego.
- Evaluación comparativa de backends de inferencia: sirve como referencia para medir latencia y consumo de memoria del motor de Unity frente a la variante uint8 o a la exportación ONNX del mismo modelo.
- Despliegue en estaciones de trabajo con GPU de gama alta para demos y ferias: al ocupar 7,12 GiB, encaja en equipos con más de 12 GB de VRAM, donde puede mostrar generación local sin conexión.
- Integración en pipelines de pruebas automatizadas de UI: el streaming de tokens permite verificar el comportamiento de componentes de texto en Unity ante respuestas de longitud variable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta conversión no incluye métricas de MMLU, HumanEval, GSM8K ni de latencia o throughput, y remite a la card del modelo original para cualquier dato de rendimiento.

## Requisitos de hardware

- VRAM estimada: el archivo `model.sentis` ocupa 7,12 GiB y los pesos consumen la mayor parte de una GPU de 12 GB; según el autor, el modelo no se ejecuta en GPUs de 12 GB y debe usarse la variante uint8 en ese caso.
- GPU recomendadas: no especificadas en la model card; por la huella indicada, se requiere una GPU con más de 12 GB de VRAM.
- GPU de consumo: no cabe en GPUs de 12 GB según la advertencia del autor; no hay datos sobre modelos concretos (RTX 4090, etc.) en la información disponible.
- Despliegue: exclusivamente mediante Unity Inference Engine 2.6.1 (o versión compatible) y el paquete tools.doji.transformers; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phi-3-mini-4k-instruct-sentis-float16 (esta ficha) | 3.800 M | 4.096 | `.sentis` (float16) | MIT | Hugging Face, 0 descargas |
| Phi-3-mini-4k-instruct-sentis-uint8 | 3.800 M | 4.096 | `.sentis` (uint8) | MIT | Hugging Face, mismo autor |
| Phi-3-mini-4k-instruct-onnx | 3.800 M | 4.096 | ONNX (float16) | MIT | Hugging Face, mismo autor |
| microsoft/Phi-3-mini-4k-instruct | 3.800 M | 4.096 | safetensors | MIT | Hugging Face, modelo base oficial |

Las tres variantes comparten arquitectura, parámetros y contexto; difieren en el formato de pesos, la huella en disco/VRAM y el motor de inferencia compatible. No se dispone de datos de rendimiento comparativo entre ellas en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión no oficial: el autor no es Microsoft y no hay garantía de soporte ni de actualizaciones.
- El archivo depende de Inference Engine 2.6.1; una versión posterior del motor puede exigir reconvertir desde el ONNX.
- Huella de 7,12 GiB: no se ejecuta en GPUs de 12 GB; el autor recomienda la variante uint8 para ese hardware.
- Solo cubre el contexto de 4.096 tokens del modelo base; conversaciones o documentos más largos requieren truncado o resumen.
- El rendimiento lingüístico, los sesgos y el riesgo de alucinación son los del Phi-3-mini-4k-instruct original; esta model card no aporta evaluaciones propias ni datos sobre idiomas.
- La licencia MIT se hereda del modelo base, pero conviene verificar los términos del modelo original de Microsoft antes de un uso comercial.
- No hay datos publicados de latencia, throughput ni consumo energético en Unity, por lo que la viabilidad en producción debe medirse en el hardware objetivo.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/julienkay/Phi-3-mini-4k-instruct-sentis-float16
- Modelo base: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Variante ONNX: https://huggingface.co/julienkay/Phi-3-mini-4k-instruct-onnx
- Variante Sentis uint8: https://huggingface.co/julienkay/Phi-3-mini-4k-instruct-sentis-uint8
- Documentación de Unity Inference Engine: https://docs.unity3d.com/Packages/com.unity.ai.inference@latest
- Paquete tools.doji.transformers: https://github.com/julienkay/tools.doji.transformers
- Herramienta de conversión tools.doji.onnx-model-loader: https://github.com/julienkay/tools.doji.onnx-model-loader
