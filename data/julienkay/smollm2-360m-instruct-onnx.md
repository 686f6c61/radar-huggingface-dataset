# julienkay/SmolLM2-360M-Instruct-onnx

## Resumen

SmolLM2-360M-Instruct-onnx es la exportacion a ONNX plano del modelo SmolLM2-360M-Instruct de HuggingFaceTB, publicada por el desarrollador julienkay. El modelo original es un transformer decoder-only de 360 millones de parametros entrenado por Hugging Face, disenado para ejecutarse en entornos con recursos limitados manteniendo capacidades de instruccion y conversacion. Esta version concreta resuelve un problema de compatibilidad: la exportacion oficial de ONNX emplea operadores contrib de Microsoft (GroupQueryAttention, RotaryEmbedding, SkipSimplifiedLayerNormalization) que el motor de inferencia de Unity no puede importar.

La aportacion de este repositorio es reexportar el modelo utilizando exclusivamente operadores estandar de ONNX (opset 17, precision float32), de modo que pueda cargarse en Unity Inference Engine a traves del paquete tools.doji.transformers. El resultado es un unico grafo que procesa tanto el prompt como cada token nuevo, con las mismas entradas y salidas que las exportaciones de optimum: input_ids, attention_mask, position_ids y la cache KV por capa.

Es relevante para desarrolladores que quieran integrar un modelo de lenguaje pequeno directamente en aplicaciones Unity sin depender de servidores externos ni de runtimes con soporte para operadores propietarios. El repositorio ocupa 1,6 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura SmolLM2) |
| Parametros totales | 360 millones (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | float32 (unica variante publicada en este repo) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17, operadores estandar, float32) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo original SmolLM2-360M-Instruct: un transformer decoder-only con atencion causal, entrenado por Hugging Face. Esta ficha no dispone de los detalles de composicion del dataset, numero de tokens de entrenamiento ni del proceso de alineacion (RLHF/DPO) del modelo base; esa informacion debe consultarse en la model card original de HuggingFaceTB/SmolLM2-360M-Instruct.

La innovacion tecnica de esta publicacion es exclusivamente de formato y compatibilidad. La exportacion oficial de ONNX utiliza operadores contrib de Microsoft que Unity Inference Engine no reconoce. julienkay reexporta el modelo con operadores estandar de ONNX en opset 17 y precision float32, manteniendo la interfaz de optimum: un unico modelo ejecuta tanto el prefill del prompt como la generacion token a token, recibiendo input_ids, attention_mask, position_ids y las claves/valores de cache pasadas (past_key_values.{i}.key/value) y devolviendo logits y las claves/valores actualizadas (present.{i}.key/value). La exportacion se genero con el script tools/causal_lm/make_models.py del repositorio del paquete tools.doji.transformers.

## Capacidades

- Generacion de texto e instruccion: al derivar de SmolLM2-360M-Instruct, conserva el comportamiento de modelo ajustado para seguir instrucciones y mantener conversaciones.
- Razonamiento basico y respuesta a preguntas: adecuado para tareas sencillas de comprension y generacion de texto corto.
- Generacion de codigo: capacidad limitada por el tamano del modelo; util para fragmentos simples, no para tareas complejas.
- Inferencia local en Unity: pensado para ejecutarse dentro de Unity Inference Engine mediante el paquete tools.doji.transformers.
- Ejecucion en dispositivo: al ser ONNX float32 con operadores estandar, puede desplegarse en runtimes ONNX compatibles sin dependencias de operadores contrib.
- Tool calling / function calling: no documentado en la informacion disponible.
- Modo thinking o razonamiento multi-paso explicito: no documentado en la informacion disponible.
- Vision o audio: no soportado (modelo exclusivamente de texto).
- Capacidades multilingues: no documentadas en la informacion disponible para esta exportacion.

## Casos de uso

- Integracion de un chatbot ligero en videojuegos Unity: el modelo puede cargarse con Unity Inference Engine y gestionar dialogos con NPCs en tiempo de ejecucion, sin conexion a servidores externos, gracias a su formato ONNX con operadores estandar.
- Prototipado de asistentes conversacionales en el editor: util para iterar rapidamente sobre prompts y flujos de dialogo dentro de Unity usando el paquete tools.doji.transformers antes de decidir si se necesita un modelo mayor.
- Aplicaciones de escritorio o moviles con inferencia ONNX: al no requerir operadores contrib de Microsoft, puede ejecutarse en runtimes ONNX Runtime estandar en plataformas donde los operadores propietarios no estan disponibles.
- Generacion de texto contextual en herramientas internas: resumenes cortos, respuestas a preguntas frecuentes o reescritura de textos sencillos en aplicaciones con recursos de computo limitados.
- Educacion y experimentacion: modelo de 360M parametros en float32 (1,6 GB) que permite estudiar el pipeline completo de exportacion, carga y generacion token a token con cache KV en un entorno controlado.
- Filtrado y clasificacion de texto ligera: generacion de etiquetas o respuestas breves en pipelines donde el coste por inferencia debe ser minimo y la latencia baja.
- Base para fine-tuning y reexportacion: al partir de un grafo ONNX limpio, sirve como punto de partida para experimentos de cuantizacion o adaptacion posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 1,6 GB en float32; la carga en memoria del grafo y los pesos ronda esa cifra, mas el espacio para la cache KV segun la longitud de contexto utilizada (no disponible).
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de memoria libre para la variante float32; no se especifican modelos concretos en la informacion disponible.
- GPU de consumo: cabe en GPUs de gama media y en muchas integradas con suficiente memoria compartida, al tratarse de un modelo de 360M parametros.
- Opciones de despliegue: Unity Inference Engine mediante tools.doji.transformers; ONNX Runtime estandar al usar solo operadores de opset 17; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| SmolLM2-360M-Instruct-onnx (este repo) | 360M | no disponible | ONNX float32, opset 17, ops estandar | Apache 2.0 | Compatible con Unity Inference Engine |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360M | no disponible | safetensors (formato original) | Apache 2.0 | Modelo base; requiere conversion para ONNX |
| Exportacion ONNX oficial de SmolLM2 | 360M | no disponible | ONNX con operadores contrib de Microsoft | Apache 2.0 | No importable en Unity Inference Engine |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de 360M parametros: capacidad de razonamiento, conocimiento factual y calidad de codigo muy por debajo de modelos de mayor tamano; propenso a errores en tareas complejas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala, especialmente en preguntas factuales y generacion larga.
- Sesgos: no documentados en la informacion disponible; deben asumirse los del modelo base SmolLM2-360M-Instruct.
- Idiomas: no se especifica que idiomas soporta esta exportacion; conviene verificar el comportamiento en castellano antes de usarla en produccion.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar la model card del modelo base para condiciones adicionales.
- Formato float32: el repositorio de 1,6 GB no incluye variantes cuantizadas; para entornos con memoria muy limitada habria que cuantizar y reexportar por cuenta propia.
- Dependencia de Unity Inference Engine y del paquete tools.doji.transformers: la compatibilidad con otros runtimes ONNX no esta verificada en la informacion disponible.
- Sin datos de benchmarks ni de latencia: no es posible estimar el rendimiento en produccion a partir de la informacion proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/julienkay/SmolLM2-360M-Instruct-onnx
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Paquete tools.doji.transformers: https://github.com/julienkay/tools.doji.transformers
