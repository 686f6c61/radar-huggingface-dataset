# julienkay/Qwen3.5-0.8B-sentis-float16

## Resumen

Qwen3.5-0.8B-sentis-float16 es una conversión no oficial del modelo de texto Qwen3.5-0.8B, desarrollado originalmente por el equipo Qwen (Alibaba), publicada por el usuario julienkay. El objetivo de esta conversión no es mejorar el modelo, sino hacerlo ejecutable dentro del motor de inferencia de Unity (Unity Inference Engine, anteriormente conocido como Sentis) mediante el paquete tools.doji.transformers. El resultado es un artefacto en formato `.sentis` con los pesos cuantizados a float16, pensado para integrar generación de texto en aplicaciones y videojuegos hechos con Unity.

El modelo base es un transformer de 0,8 mil millones de parámetros con una arquitectura híbrida que combina capas de atención completa con capas de atención lineal basadas en una regla delta con compuertas (GatedDeltaRule). Esta conversión incluye únicamente la torre de texto: el codificador de visión del modelo original no está presente, por lo que la entrada es solo textual. El repositorio ocupa 2,0 GB y el archivo de pesos `model.sentis` pesa 1,88 GiB.

La relevancia de esta ficha es acotada pero específica: para desarrolladores de Unity que necesitan un modelo pequeño, con licencia Apache 2.0 y ejecutable en el motor nativo de inferencia, esta conversión evita tener que exportar manualmente el modelo a ONNX y reimplementar las capas de atención lineal. No obstante, al tratarse de una conversión de terceros con cero descargas y cero likes en el momento de la consulta, su madurez y soporte son limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de atención completa y capas de atención lineal (GatedDeltaRule) |
| Parametros totales | 0,8 mil millones (modelo base Qwen3.5-0.8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | float16 (pesos de rango 2 o superior en MatMul/Gemm/Conv/ConvTranspose/Gather); resto en float32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.sentis` (Unity Inference Engine); exportado previamente a ONNX opset 17 |
| Tamano del archivo de pesos | 1,88 GiB (`model.sentis`) |
| Version de Inference Engine | 2.6.1 (guardado) |
| Entrada | Solo texto (vision encoder no incluido) |
| Revision del modelo base | `2fc06364715b967f1860aea9cf38778875588b17` |

## Arquitectura y entrenamiento

La arquitectura del modelo base Qwen3.5-0.8B es un transformer híbrido. Las capas de atención completa mantienen el mecanismo clásico de key/value, mientras que las capas de atención lineal emplean una regla delta con compuertas (GatedDeltaRule) que sustituye la atención cuadrática por una recurrencia lineal. En la conversión, cada capa de atención lineal se representa como un nodo personalizado del dominio `ai.doji` llamado `GatedDeltaRule`; el resto de nodos usan operadores estándar de ONNX. El modelo procesa el prompt y cada token nuevo de forma incremental, manteniendo estados de caché: `past_key_values.{i}.key/value` para las capas de atención completa, y `past_conv.{i}` y `past_recurrent.{i}` para las capas lineales (estado de la convolución causal y estado de la regla delta).

El proceso de conversión partió del modelo original en float32, exportado a ONNX opset 17 mediante `tools/causal_lm/make_models.py export` del repositorio tools.doji.transformers. Después se convirtió con tools.doji.onnx-model-loader usando `QuantizationType.Float16`. Los pesos float de rango 2 o superior que alimentan capas MatMul, Gemm, Conv, ConvTranspose y Gather se almacenan en float16; el resto permanece en float32. En el dispositivo, los pesos se mantienen en float16 y se convierten a float32 justo antes de la capa que los lee por primera vez, de modo que solo existen copias float32 de las capas en ejecución. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original dentro de la información proporcionada; la model card remite a la ficha del modelo base para esos detalles.

## Capacidades

- Generación de texto autoregresiva con decodificación incremental y caché de estados entre tokens.
- Conversación multiturno mediante plantilla de chat (`ApplyChatTemplate`), con soporte de un bloque de razonamiento o *thinking* que se activa con `enableThinking: true`.
- Generación por streaming token a token a través de `TextStreamer`.
- Ejecución dentro de Unity mediante el paquete tools.doji.transformers y el motor de inferencia nativo.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Visión: no incluida en esta conversión (el codificador de visión del modelo original no se ha exportado).
- Audio: no disponible.

## Casos de uso

- Diálogos dentro de un videojuego en Unity: el modelo puede gestionar conversaciones con NPCs generadas en tiempo de ejecución, ejecutándose en el propio motor de inferencia sin depender de servicios externos. Su tamaño de 0,8B y su peso de 1,88 GiB lo hacen viable en equipos de escritorio con GPU modesta.
- Asistentes conversacionales integrados en aplicaciones de escritorio hechas con Unity: la API `AutoModelForCausalLM` y el `TextStreamer` permiten mostrar respuestas token a token en la interfaz, con una latencia percibida baja.
- Prototipado rápido de funcionalidades de IA generativa en entornos Unity: al estar disponible en el AI Model Hub, se puede añadir al proyecto sin escribir un pipeline de exportación propio.
- Generación de texto contextual en herramientas de autoría (editores, utilidades internas) construidas sobre Unity, donde el modelo actúa como motor de texto local sin conexión.
- Pruebas de integración de modelos pequeños en pipelines de inferencia embebida: sirve como referencia para validar el soporte de capas de atención lineal en el motor de inferencia de Unity.
- Modo *thinking* para tareas de razonamiento breve en asistentes locales: la plantilla de chat permite abrir un bloque de razonamiento antes de la respuesta, útil para preguntas que requieren un paso intermedio de deliberación.
- Sustituto ligero en demostraciones y entornos educativos: al tener licencia Apache 2.0 y pesos de pequeño tamaño, se puede distribuir junto con la aplicación sin restricciones de uso comercial derivadas de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo de pesos ocupa 1,88 GiB; con estados de caché y copias float32 temporales de las capas activas, se recomienda al menos 3-4 GB de memoria de GPU para margen de seguridad (estimación, no dato oficial).
- GPU recomendadas: no especificadas en la información proporcionada. Por tamaño, debería caber en GPU de consumo con al menos 4 GB de VRAM; no se dispone de lista oficial de modelos compatibles.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del modelo, aunque no se confirma en la información disponible.
- Opciones de despliegue: Unity Inference Engine 2.6.1 (versión con la que se guardó el archivo), a través del paquete tools.doji.transformers y la dependencia tools.doji.sentis-utils. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato `.sentis`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-sentis-float16 | 0,8B | no disponible | `.sentis` (float16) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3.5-0.8B (original) | 0,8B | no disponible | safetensors (presumible) | Apache 2.0 | Hugging Face |
| Otros modelos de ~1B para Unity | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de alternativas comparables dentro de la información proporcionada. La comparación relevante es con el modelo base original: esta conversión pierde el codificador de visión y cambia el formato de pesos, pero conserva la arquitectura y los pesos del modelo de texto.

## Limitaciones y advertencias

- Conversión no oficial: no está mantenida por el equipo Qwen y puede quedar desactualizada respecto al modelo base.
- Dependencia estricta de Inference Engine 2.6.1: una versión posterior del motor puede requerir reconvertir el archivo.
- Requiere el paquete tools.doji.sentis-utils para cargar el nodo personalizado `GatedDeltaRule`; sin él, el modelo no se carga.
- Sin codificador de visión: no admite entradas de imagen, a diferencia del modelo original completo.
- Idiomas soportados no documentados en esta ficha; el comportamiento multilingüe depende del modelo base.
- Riesgo de alucinación inherente a un modelo de 0,8B: su capacidad de razonamiento y su fiabilidad factual son limitadas en comparación con modelos de mayor tamaño.
- Sesgos conocidos: no documentados en la información proporcionada; se remite a la ficha del modelo base.
- Longitud de contexto no disponible: no se puede garantizar el comportamiento en conversaciones largas sin consultar la ficha del modelo original.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial, pero los términos del modelo base deben respetarse igualmente.
- El repositorio ocupa 2,0 GB, lo que puede ser relevante para la distribución de la aplicación que lo integre.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/julienkay/Qwen3.5-0.8B-sentis-float16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio tools.doji.transformers: https://github.com/julienkay/tools.doji.transformers
- Repositorio tools.doji.sentis-utils: https://github.com/julienkay/tools.doji.sentis-utils
- Repositorio tools.doji.onnx-model-loader: https://github.com/julienkay/tools.doji.onnx-model-loader
- Documentación de Unity Inference Engine: https://docs.unity3d.com/Packages/com.unity.ai.inference@latest
