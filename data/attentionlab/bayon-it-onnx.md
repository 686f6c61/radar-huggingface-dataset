# attentionlab/bayon-it-onnx

## Resumen

Bayon Instruct ONNX es la exportación a formato ONNX, con cuantización int8 dinámica, del modelo lingüístico khmer `attentionlab/bayon-it`. Se trata de un modelo decoder-only causal de aproximadamente 109 millones de parámetros (109.019.648 medidos), ajustado por instrucciones y desarrollado por attentionlab para dar soporte a la lengua jemer, un idioma de bajos recursos con escasa representación en los grandes modelos multilingües. La relevancia de esta variante reside en su empaquetado: un grafo ONNX opset 17 en fp32 y una versión int8 de tan solo 114 MB que se ejecuta en CPU con `CPUExecutionProvider` estándar, sin dependencias adicionales.

El modelo hereda la arquitectura y los pesos del checkpoint original `attentionlab/bayon-it`, del que esta ficha es una cuantización (relación `base_model_relation: quantized`). La exportación se realizó con Optimum mediante `optimum-cli export onnx --task text-generation`, y la cuantización con `onnxruntime.quantization.quantize_dynamic` en modo QInt8 por canal, cuantizando únicamente los pesos de las operaciones MatMul/Gemm mientras las activaciones permanecen en fp32.

Su interés práctico es doble: por un lado, ofrece una vía de despliegue ligera y portable para generación de texto en jemer en entornos sin GPU; por otro, su reducido tamaño y su licencia Apache 2.0 lo convierten en una pieza accesible para validación, scoring por lotes y experimentación con modelos de bajos recursos. La limitación principal es la ausencia de caché KV en el grafo exportado, lo que penaliza la generación de secuencias largas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (exportado a ONNX opset 17) |
| Parametros totales | 109.019.648 (109,0 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp32 (`model.onnx`) e int8 dinámica por canal (`model-int8.onnx`, QInt8); GGUF `q8_0` y `q4_k_m` disponibles en la familia del repo fuente |
| Idiomas soportados | Jemer (km) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx` ≈447 MB, `model-int8.onnx` ≈114 MB); safetensors en el repo fuente |
| Vocabulario | BPE jemer de 5.000 tokens |
| Entradas del grafo | `input_ids`, `attention_mask` (int64) |
| Salida del grafo | `logits` de forma `[batch, seq, 5000]` |
| Cache KV en el grafo | No incluida |
| Tamano del repo | 0,6 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only causal de tipo denso, con 109 millones de parámetros y un tokenizador BPE específico de jemer de 5.000 tokens, un vocabulario deliberadamente compacto orientado a un único idioma. La información disponible no detalla el número de capas, la dimensionalidad del modelo, el número de cabezas de atención ni la longitud de contexto nativa; tampoco especifica el volumen de tokens de entrenamiento, la composición del corpus ni si se aplicaron fases de RLHF o DPO más allá del ajuste por instrucciones implícito en la denominación «Instruct».

La innovación técnica de esta ficha no está en el modelo sino en su empaquetado. La exportación con Optimum genera un grafo ONNX opset 17 en fp32 de aproximadamente 447 MB (4 bytes por parámetro), y la cuantización dinámica int8 reduce los pesos de MatMul/Gemm a cerca de 1 byte por parámetro más residuales y escalas en fp32, resultando en unos 114 MB. Al mantener las activaciones en fp32, la cuantización dinámica preserva en gran medida la calidad numérica sin requerir calibración con un dataset representativo. El grafo no incorpora caché KV, de modo que cada paso de decodificación recomputa la secuencia completa.

## Capacidades

- Generación de texto causal en jemer con decodificación autorregresiva (greedy o muestreo sobre `argmax`/distribución de logits).
- Ajuste por instrucciones: el modelo base está entrenado para seguir indicaciones en jemer.
- Modelado de lenguaje y scoring de secuencias: la salida de logits permite calcular verosimilitudes por token para evaluación o ranking.
- Inferencia en CPU sin GPU: el grafo int8 funciona con `CPUExecutionProvider` estándar de ONNX Runtime.
- Procesamiento por lotes: la forma `[batch, seq, 5000]` admite validación y scoring batcheado.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe: limitada al jemer según los metadatos del modelo.

## Casos de uso

- Generación de texto en jemer en entornos sin GPU: el grafo int8 de 114 MB se ejecuta en CPU con ONNX Runtime, lo que permite desplegar generación de texto jemer en servidores modestos, contenedores ligeros o dispositivos de borde.
- Scoring y evaluación de corpus jemer: la salida de logits por token permite calcular perplejidad y verosimilitudes para filtrar, rankear o validar textos en jemer dentro de pipelines de datos.
- Validación de pipelines de cuantización: sirve como referencia para comparar la calidad fp32 frente a int8 dinámica en un modelo pequeño y de un solo idioma, verificando la degradación introducida por la cuantización.
- Prototipado rápido de asistentes en jemer: al ser un modelo de 109 M ajustado por instrucciones, permite construir demos de chat o autocompletado en jemer con requisitos de infraestructura mínimos.
- Preprocesamiento y aumento de datos: generación de variantes o continuaciones de texto jemer para aumentar corpus de entrenamiento de otros sistemas, aprovechando el bajo coste de inferencia en CPU.
- Integración en aplicaciones ONNX nativas: al ser un grafo ONNX estándar, puede embeberse en runtimes ONNX (por ejemplo, en aplicaciones .NET, Java o C++ con ONNX Runtime) sin depender del ecosistema Python de transformers.
- Evaluación comparativa de modelos de bajos recursos: útil como línea base ligera frente a modelos multilingües mayores en tareas de jemer, con un coste computacional muy inferior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card enlaza a un blog del autor (`https://panha-ai.vercel.app/news/2026-07-02`) donde se describe el rendimiento de Bayon, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la variante int8, que está pensada para CPU; el grafo fp32 de 447 MB puede residir en memoria RAM o en GPU con muy poca VRAM (menos de 1 GB para los pesos, más el estado de activaciones).
- GPU recomendadas: no se especifican; cualquier GPU con soporte de ONNX Runtime (por ejemplo, proveedores CUDA o TensorRT) podría ejecutar el grafo, pero el modelo está optimizado para CPU.
- Cabe en cualquier GPU de consumo e incluso en CPU: el modelo int8 de 114 MB es trivial para hardware consumer.
- Opciones de despliegue: ONNX Runtime (`CPUExecutionProvider`); también existen builds GGUF (`q8_0`, `q4_k_m`) en la familia del repo fuente, lo que habilita llama.cpp u Ollama para esas variantes.
- Latencia y throughput: no disponibles. La ausencia de caché KV implica que la latencia crece de forma cuadrática con la longitud de la secuencia generada, por lo que el modelo es más adecuado para generaciones cortas o scoring que para diálogos largos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| attentionlab/bayon-it-onnx (esta ficha) | 109 M | No disponible | Jemer | Apache 2.0 | ONNX (fp32, int8) | Sin caché KV; orientado a CPU |
| attentionlab/bayon-it (modelo base) | 109 M | No disponible | Jemer | Apache 2.0 | Safetensors, GGUF | Pesos fuente; requiere transformers o llama.cpp |
| Modelos multilingües pequeños tipo Gemma/Qwen (no verificados en esta busqueda) | Variable | Variable | Multilingüe | Variable | Safetensors, GGUF, ONNX | No se dispone de datos comparativos verificados en la informacion proporcionada |

No se dispone de datos de rendimiento comparativos verificados en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre un corpus jemer, puede reflejar sesgos presentes en dichos datos.
- Riesgo de alucinación: inherente a un modelo causal de 109 M sin mecanismos de verificación; la generación puede producir contenido plausible pero incorrecto.
- Limitación de contexto: la longitud de contexto nativa no está documentada, y el grafo ONNX no incluye caché KV, por lo que la generación larga es costosa y poco práctica.
- Limitación de idioma: el modelo está orientado exclusivamente al jemer (código `km`); su rendimiento en otros idiomas no está garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero exige conservar los avisos de licencia y atribución correspondientes.
- Caveat de producción: el vocabulario de 5.000 tokens es muy reducido, lo que puede afectar a la cobertura léxica; además, la cuantización int8 dinámica puede introducir degradación de calidad respecto al fp32, no cuantificada en la información disponible.
- El modelo tiene un uso muy limitado (30 descargas, 0 likes) y no se han publicado benchmarks; debe validarse empíricamente antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/attentionlab/bayon-it-onnx
- Modelo base: https://huggingface.co/attentionlab/bayon-it
- Blog del autor sobre rendimiento: https://panha-ai.vercel.app/news/2026-07-02
