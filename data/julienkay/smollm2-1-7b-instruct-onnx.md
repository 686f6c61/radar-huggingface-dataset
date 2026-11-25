# julienkay/SmolLM2-1.7B-Instruct-onnx

## Resumen

SmolLM2-1.7B-Instruct-onnx es una exportación no oficial a formato ONNX del modelo SmolLM2-1.7B-Instruct desarrollado por Hugging Face. La conversión la ha realizado el desarrollador julienkay con el objetivo de hacerlo compatible con Unity Inference Engine (anteriormente conocido como Sentis) y con el paquete de Unity `tools.doji.transformers`. No se trata, por tanto, de un modelo nuevo, sino de una redistribución del mismo con un formato de pesos distinto y operadores estándar.

El modelo base SmolLM2-1.7B-Instruct es un transformer decoder-only de 1.700 millones de parámetros, diseñado para generación de texto e instrucciones. Esta exportación concreta usa pesos en float16 y operadores ONNX estándar (opset 17), eliminando los operadores contrib de Microsoft (GroupQueryAttention, RotaryEmbedding, SkipSimplifiedLayerNormalization) que Unity Inference Engine no puede importar. El repositorio ocupa 3,6 GB y los pesos se almacenan en un único fichero externo `model.onnx_data` de 3,38 GiB.

Su relevancia es acotada pero clara: permite ejecutar un modelo de 1.7B en el motor de inferencia de Unity dentro de aplicaciones y videojuegos, sin depender de runtimes externos como ONNX Runtime o llama.cpp. La licencia Apache 2.0 del modelo original se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama), exportado a ONNX |
| Parametros totales | 1.700 millones (1.7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | float16 (unica variante publicada en este repo) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17) con datos externos en `model.onnx_data`, float16 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del SmolLM2-1.7B-Instruct de Hugging Face: un transformer decoder-only con atención causal, del que esta exportación conserva pesos, tokenizer y configuración originales. El proceso de exportación se realizó con el script `tools/causal_lm/make_models.py export HuggingFaceTB/SmolLM2-1.7B-Instruct --dtype float16` del repositorio `tools.doji.transformers`. El resultado es un único grafo ONNX que ejecuta el prompt y cada token nuevo, con las entradas y salidas típicas de las exportaciones de optimum: `input_ids`, `attention_mask`, `position_ids` y `past_key_values.{i}.key/value` como entradas, y `logits` y `present.{i}.key/value` como salidas.

La innovación técnica de esta ficha no está en el entrenamiento (que es el del modelo original de Hugging Face y no se detalla en la información disponible), sino en la exportación: se sustituyen los operadores contrib de Microsoft por operadores estándar de ONNX para que Unity Inference Engine pueda importar el grafo. Pesos, caché KV y logits se mantienen en float16. No se aportan datos sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, heredadas del modelo Instruct original.
- Razonamiento básico y respuesta a preguntas en formato chat mediante plantilla de conversación (`ApplyChatTemplate`).
- Generación de código y matemáticas a nivel de modelo pequeño (capacidad no verificada con benchmarks en esta información).
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en esta exportación.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; es un modelo exclusivamente de texto.
- Inferencia en Unity mediante el paquete `tools.doji.transformers`, con streaming de tokens a través de `TextStreamer`.

## Casos de uso

- Diálogos dentro de videojuegos en Unity: el modelo se integra en el motor de inferencia de Unity y permite generar respuestas de NPC en tiempo de ejecución sin salir del entorno del juego, usando la API `AutoModelForCausalLM.FromPretrainedAsync`.
- Asistentes conversacionales embebidos en aplicaciones Unity de escritorio o móvil de gama alta: al pesar 3,38 GiB en float16, puede desplegarse en equipos con suficiente memoria y ofrecer respuestas locales sin conexión.
- Prototipado rápido de chatbots en entornos Unity: la plantilla de chat y el `TextStreamer` permiten montar una demo funcional con pocas líneas de C#.
- Generación de texto contextual en herramientas de autor (editores, sandbox de creación): el modelo puede redactar descripciones, diálogos o texto de relleno dentro del propio editor de Unity.
- Evaluación de pipelines de inferencia ONNX en Unity: sirve como banco de pruebas para medir latencia y consumo de memoria del motor de inferencia con un modelo de 1.7B en float16.
- Sustitución de la variante `.sentis` cuando se prefiere controlar la conversión: el autor indica que AI Model Hub convierte el `.onnx` a `.sentis` al importarlo, de modo que este repo es útil si se quiere inspeccionar o modificar el grafo ONNX antes de la conversión.
- Experimentación académica con modelos pequeños en entornos de juego: permite estudiar comportamiento conversacional de un LLM de 1.7B dentro de una aplicación interactiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en float16 ocupan 3,38 GiB, por lo que se necesita al menos esa cantidad de memoria más el espacio para la caché KV y los logits; una estimación conservadora sitúa el mínimo en torno a 4-5 GB de memoria dedicada.
- GPU recomendadas: no especificadas por el autor. Por tamaño, encaja en GPUs de consumo con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 3070, RTX 4070) y en GPUs de datacenter (A100, H100) sin problema.
- ¿Cabe en GPU de consumo? Sí, en modelos con 8 GB o más de VRAM en float16; en GPUs con menos memoria habría que recurrir a otras variantes cuantizadas del modelo base, no publicadas en este repo.
- Opciones de despliegue: Unity Inference Engine (Sentis) mediante `tools.doji.transformers`; también puede cargarse con ONNX Runtime al ser un grafo ONNX estándar, aunque el autor no lo documenta.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM2-1.7B-Instruct-onnx (este) | 1.7B | no disponible | ONNX float16 | Apache 2.0 | Hugging Face (66 descargas) |
| SmolLM2-1.7B-Instruct (original) | 1.7B | no disponible en esta informacion | safetensors / ONNX oficial | Apache 2.0 | Hugging Face (modelo base oficial) |
| SmolLM2-1.7B-Instruct-sentis-float16 | 1.7B | no disponible | `.sentis` float16 | Apache 2.0 | Hugging Face (mismo autor) |
| Exportación ONNX oficial de Hugging Face | 1.7B | no disponible | ONNX con operadores contrib | Apache 2.0 | Hugging Face (repo del modelo base) |

La diferencia principal frente al ONNX oficial es la compatibilidad con Unity Inference Engine: este export usa solo operadores estándar de opset 17, mientras que el oficial depende de operadores contrib de Microsoft. Frente a la variante `.sentis`, este repo permite inspeccionar y modificar el grafo ONNX antes de la conversión.

## Limitaciones y advertencias

- Exportación no oficial: el autor la publica como conversión propia, sin respaldo de Hugging Face; la responsabilidad sobre el grafo recae en julienkay.
- Solo variante float16: no hay cuantizaciones int8 o int4 en este repo, lo que limita el despliegue en hardware con poca memoria.
- Modelo pequeño: con 1.7B parámetros, la calidad en razonamiento complejo, matemáticas avanzadas y código de producción es inferior a la de modelos de mayor tamaño; el riesgo de alucinación es relevante.
- Idiomas y contexto no documentados en esta información: no se puede confirmar el soporte multilingüe ni la ventana de contexto efectiva sin consultar la ficha del modelo base.
- Dependencia de Unity: el flujo de uso documentado está atado a Unity Inference Engine y al paquete `tools.doji.transformers`; fuera de ese entorno no hay instrucciones oficiales.
- Tool calling y agentes no documentados: no se puede asumir soporte de function calling en esta exportación.
- Licencia Apache 2.0: permite uso comercial y modificación, pero exige mantener el aviso de licencia y no ofrece garantías.
- Repositorio con pocas descargas (66) y sin likes: menor validación comunitaria y menor probabilidad de que los problemas de integración estén resueltos en issues.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/julienkay/SmolLM2-1.7B-Instruct-onnx
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Variante Sentis float16: https://huggingface.co/julienkay/SmolLM2-1.7B-Instruct-sentis-float16
- Paquete `tools.doji.transformers`: https://github.com/julienkay/tools.doji.transformers
- Documentación de Unity Inference Engine: https://docs.unity3d.com/Packages/com.unity.ai.inference@latest
