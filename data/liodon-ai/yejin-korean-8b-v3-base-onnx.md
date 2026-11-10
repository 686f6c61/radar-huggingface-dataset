# liodon-ai/yejin-korean-8b-v3-base-ONNX

## Resumen

`liodon-ai/yejin-korean-8b-v3-base-ONNX` es la exportación a formato ONNX del modelo `cooler8/yejin-korean-8b-v3-base`, un modelo de lenguaje de 8.000 millones de parámetros orientado a la generación de texto en coreano. La conversión la publica Liodon AI mediante `optimum.exporters.onnx` con la tarea `text-generation-with-past`, de modo que el grafo expone entradas y salidas de clave-valor (KV-cache) para decodificación autorregresiva eficiente. El tag `qwen3` de Hugging Face sugiere que el modelo base deriva de la familia Qwen3, aunque la model card no lo confirma explícitamente.

El interés práctico de esta publicación no está en el modelo en sí, sino en el formato: los pesos se distribuyen como grafos ONNX ejecutables con ONNX Runtime, lo que permite desplegar el modelo fuera del ecosistema PyTorch, en entornos con aceleradores heterogéneos (CPU, GPU con CUDA/TensorRT, DirectML, etc.) y con soporte nativo de KV-cache en el grafo. El repositorio ocupa 46,1 GB e incluye dos ficheros: uno en FP32 de 30,02 GB y otro en FP16 de 16,08 GB.

La licencia figura como `other`, sin que la model card detalle los términos, y no se declaran idiomas soportados ni se publican resultados de benchmarks. La información disponible sobre arquitectura, datos de entrenamiento y capacidades del modelo base es muy limitada, por lo que varias filas de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3 segun tag; no confirmado en la model card) |
| Parametros totales | 8 000 millones (8B, segun el nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (`model.onnx`, 30,02 GB) y FP16 (`model_fp16.onnx`, 16,08 GB); la model card menciona `model_quantized.onnx` en el ejemplo pero no lo lista entre los ficheros |
| Idiomas soportados | no disponible (el nombre indica orientacion al coreano) |
| Licencia | other |
| Formato de pesos | ONNX (grafo `text-generation-with-past` con KV-cache) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base. El tag `qwen3` apunta a un transformer decoder-only de la familia Qwen3, pero no hay confirmación textual ni detalles sobre número de capas, dimensión oculta, mecanismo de atención o tipo de normalización. Tampoco se documentan los datos de entrenamiento: no se indica el volumen de tokens, la composición del corpus, ni si hubo fases de ajuste supervisado, RLHF o DPO.

La innovación técnica documentada es la del propio proceso de exportación: se usa `optimum.exporters.onnx` con la tarea `text-generation-with-past`, lo que genera un grafo ONNX que incluye entradas y salidas `past_key_values.*.key` y `past_key_values.*.value`. Esto permite que ONNX Runtime gestione el KV-cache entre pasos de decodificación sin recalcular la atención sobre todo el prefijo en cada token. El autor recomienda usar `ORTModelForCausalLM` de `optimum.onnxruntime` como envoltorio para gestionar automáticamente la contabilidad del KV-cache.

## Capacidades

- Generación de texto autorregresiva con soporte de KV-cache en el grafo ONNX.
- Conversación multi-turno (tag `conversational`).
- Orientación al coreano por el nombre del modelo; el alcance multilingüe real no está documentado.
- Ejecución con ONNX Runtime en múltiples execution providers (CPU, CUDA, TensorRT, DirectML, etc.).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Despliegue en infraestructura sin PyTorch: el formato ONNX permite servir el modelo con ONNX Runtime en entornos donde instalar el stack de PyTorch no es viable (contenedores mínimos, dispositivos edge con DirectML), usando `model_fp16.onnx` para GPU o `model.onnx` para CPU.
- Integración en aplicaciones .NET o C#: ONNX Runtime tiene bindings nativos para el ecosistema .NET, lo que permite incorporar generación de texto en coreano en aplicaciones de escritorio o servicios empresariales sin depender de Python en producción.
- Servicio de generación de texto en coreano con latencia controlada: al exponer el grafo el KV-cache, se puede implementar decodificación incremental token a token sin recalcular el prefijo, adecuado para asistentes conversacionales con respuestas en streaming.
- Optimización con TensorRT: el fichero FP16 de 16,08 GB puede compilarse con el execution provider de TensorRT de ONNX Runtime para acelerar la inferencia en GPU NVIDIA, útil en pipelines de generación de contenido a escala.
- Prototipado de chatbots conversacionales en coreano: el tag `conversational` y el pipeline `text-generation` permiten montar un prototipo rápido con `ORTModelForCausalLM` y el tokenizador del repositorio, sin necesidad de convertir pesos.
- Evaluación comparativa de backends: al disponer de FP32 y FP16 en el mismo repositorio, sirve para medir diferencias de latencia y precisión entre execution providers (CPU frente a CUDA frente a TensorRT) sobre un mismo modelo de 8B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para FP16: en torno a 16 GB solo para los pesos, más el espacio del KV-cache, que depende de la longitud de contexto (no documentada). En la práctica se necesitan 20-24 GB para contextos moderados.
- VRAM estimada para FP32: unos 30 GB solo para los pesos; requiere GPU de 40 GB o más (A100 40GB, A100 80GB, H100) o ejecución en CPU.
- GPU recomendadas: A100 40GB/80GB o H100 para FP32; RTX 4090 (24 GB), RTX A6000 (48 GB) o L40S para FP16.
- GPU de consumo: FP16 cabe en RTX 4090 (24 GB) con margen limitado para el KV-cache; en RTX 3090 (24 GB) el margen es aún más ajustado. FP32 no cabe en ninguna GPU de consumo actual.
- Despliegue: ONNX Runtime con `ORTModelForCausalLM` de `optimum.onnxruntime`; execution providers CPU, CUDA, TensorRT o DirectML. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no consumen grafos ONNX de forma nativa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| yejin-korean-8b-v3-base-ONNX (este) | 8B | no disponible | ONNX (FP32/FP16) | other | Export de un modelo coreano; sin benchmarks publicados |
| cooler8/yejin-korean-8b-v3-base | 8B | no disponible | safetensors (presumiblemente) | other | Modelo original del que deriva esta exportacion |
| Qwen3-8B | 8B | no disponible en esta ficha | safetensors, GGUF | Apache 2.0 (segun familia Qwen) | Alternativa de referencia si se confirma la base Qwen3; licencia mas permisiva |
| Llama 3.1 8B | 8B | 128K | safetensors, GGUF | Llama 3.1 Community License | Alternativa generalista de 8B con contexto largo documentado |

La comparativa con Qwen3-8B y Llama 3.1 8B es orientativa: no se dispone de datos de rendimiento del modelo yejin que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- La model card no documenta sesgos, por lo que se desconoce el comportamiento del modelo en dominios sensibles.
- Riesgo de alucinación no cuantificado: no hay benchmarks ni evaluaciones publicadas.
- La licencia `other` no especifica términos de uso comercial; es necesario contactar con el autor o consultar el modelo base antes de usarlo en producción.
- La model card menciona `model_quantized.onnx` en el ejemplo de código pero no lo incluye en la tabla de ficheros; el usuario debe verificar qué ficheros existen realmente antes de desplegar.
- El tag `qwen3` no está confirmado por el autor; la arquitectura real del modelo base no está documentada.
- El contexto máximo no está documentado, lo que impide dimensionar el KV-cache con precisión.
- El repositorio ocupa 46,1 GB, lo que exige espacio en disco considerable y descargas largas.
- Al ser una exportación ONNX, no es compatible de forma directa con herramientas que esperan safetensors o GGUF (vLLM, llama.cpp, Ollama); requiere ONNX Runtime u `optimum`.
- El modelo está orientado al coreano; su rendimiento en castellano u otros idiomas no está documentado y probablemente sea limitado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/liodon-ai/yejin-korean-8b-v3-base-ONNX
- Modelo base: https://huggingface.co/cooler8/yejin-korean-8b-v3-base
- Perfil del autor: https://huggingface.co/liodon-ai
- Optimum (herramienta de exportación): https://github.com/huggingface/optimum
- ONNX Runtime: https://onnxruntime.ai/
