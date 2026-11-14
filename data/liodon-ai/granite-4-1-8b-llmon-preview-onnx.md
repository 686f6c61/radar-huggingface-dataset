# liodon-ai/granite-4.1-8b-llmon-preview-ONNX

## Resumen

`liodon-ai/granite-4.1-8b-llmon-preview-ONNX` es una exportación al formato ONNX del modelo `ibm-granite/granite-4.1-8b-llmon-preview` de IBM, publicada por Liodon AI. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada a la ejecución con ONNX Runtime, lo que permite desplegar el modelo fuera del ecosistema PyTorch nativo (por ejemplo, en entornos con CPU, con proveedores de ejecución específicos o en infraestructura que prefiera grafos ONNX estáticos).

El modelo base pertenece a la familia Granite 4.1 de IBM, con 8 mil millones de parámetros según el nombre del checkpoint. La exportación se ha realizado con la herramienta `optimum` de Hugging Face, empleando la tarea `text-generation-with-past`, de modo que el grafo expone entradas y salidas de clave-valor (KV cache) para decodificación autorregresiva eficiente.

La relevancia de esta ficha radica en que documenta una variante de despliegue concreta: el repositorio ocupa 54,1 GB e incluye pesos en FP32 (35,17 GB) y FP16 (18,93 GB). No se dispone de información publicada sobre arquitectura interna, datos de entrenamiento ni resultados de benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Granite 4.1; transformer segun nomenclatura, sin detalle publicado) |
| Parametros totales | 8 mil millones (segun identificador del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (model.onnx, 35,17 GB) y FP16 (model_fp16.onnx, 18,93 GB); la model card menciona `model_quantized.onnx` en el ejemplo de uso, pero no figura en la tabla de ficheros |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; consultar terminos de IBM Granite) |
| Formato de pesos | ONNX (grafos con past-key-values) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo base `ibm-granite/granite-4.1-8b-llmon-preview` en la documentación disponible. Por el nombre del checkpoint se infiere un transformer de 8 mil millones de parámetros, pero no se confirman detalles como tipo de atención, número de capas, cabezas o si incorpora técnicas híbridas (MoE, SSM). Tampoco se dispone de datos sobre el corpus de entrenamiento, número de tokens, composición del dataset ni si se aplicaron fases de RLHF o DPO.

En cuanto a la exportación, Liodon AI ha utilizado `optimum.exporters.onnx.main_export` con la tarea `text-generation-with-past`. Esto implica que el grafo ONNX incluye entradas y salidas para la caché KV, lo que habilita decodificación autorregresiva con reutilización de estados y evita recalcular el prefijo en cada paso. El repositorio incluye dos variantes de precisión (FP32 y FP16) y la model card sugiere el uso de `ORTModelForCausalLM` de `optimum.onnxruntime` para gestionar automáticamente la contabilidad de la caché KV.

## Capacidades

- Generación de texto conversacional: la pipeline declarada es `text-generation` y los tags incluyen `conversational`.
- Ejecución mediante ONNX Runtime, con soporte de proveedores de ejecución (CPU, y potencialmente GPU según el proveedor instalado).
- Decodificación con caché KV (entradas/salidas `past_key_values.*.key` y `.value`), lo que permite generación incremental.
- Compatibilidad con el ecosistema `optimum` de Hugging Face para carga y ejecución.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Despliegue en entornos ONNX Runtime: el modelo puede ejecutarse a través de `onnxruntime.InferenceSession` o de `ORTModelForCausalLM`, lo que resulta útil en infraestructuras que estandarizan el serving sobre ONNX en lugar de PyTorch.
- Serving en CPU: la variante FP32 (35,17 GB) y la FP16 (18,93 GB) permiten ejecutar el modelo sin GPU, a costa de mayor latencia, en escenarios de baja concurrencia o procesamiento por lotes.
- Integración en pipelines con `optimum`: al seguir la convención de nombres y estructura de `optimum`, puede encajarse en flujos existentes de exportación, validación y despliegue de modelos ONNX.
- Prototipado de aplicaciones conversacionales: al ser un modelo de 8B con pipeline de generación de texto, sirve para construir asistentes de chat en entornos de desarrollo donde se prefiera un grafo ONNX autocontenido.
- Evaluación comparativa de backends: útil para medir diferencias de rendimiento entre ejecución ONNX y PyTorch nativo sobre el mismo modelo base.
- Distribución de artefactos portables: el formato ONNX facilita mover el modelo entre frameworks y plataformas sin depender de la versión de PyTorch instalada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 19 GB en FP16 y 35 GB en FP32 solo para los pesos; a ello hay que sumar la memoria de la caché KV, que depende de la longitud de contexto (no disponible).
- GPU recomendadas: para FP16, GPUs con 24 GB o más (RTX 3090, RTX 4090, A10, L4, A100 40/80 GB, H100). Para FP32, se requiere al menos una GPU de 40 GB (A100 40 GB) o mayor.
- Ejecución en consumer GPU: la variante FP16 puede caber en RTX 3090/4090 (24 GB) si se limita la longitud de contexto; la FP32 no cabe en GPUs de consumo actuales.
- Ejecución en CPU: viable con ONNX Runtime usando `CPUExecutionProvider`, pero con latencia alta y necesidad de RAM abundante (35 GB en FP32, 19 GB en FP16).
- Opciones de despliegue: ONNX Runtime (con `CPUExecutionProvider` u otros proveedores como CUDA o TensorRT, según disponibilidad), `optimum.onnxruntime.ORTModelForCausalLM`. No se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liodon-ai/granite-4.1-8b-llmon-preview-ONNX | 8B | no disponible | ONNX (FP32/FP16) | other | Hugging Face (18 descargas) |
| ibm-granite/granite-4.1-8b-llmon-preview | 8B | no disponible | safetensors (presumiblemente) | other | Hugging Face (modelo base) |
| Alternativas de 8B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos alternativos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni evaluación de alucinación del modelo base.
- No se especifican los idiomas soportados, por lo que el rendimiento multilingüe es incierto.
- La licencia es `other`; es imprescindible revisar los términos del modelo base de IBM (Granite) antes de cualquier uso comercial, ya que pueden imponer restricciones adicionales.
- El repositorio ocupa 54,1 GB, lo que implica requisitos de almacenamiento y ancho de banda considerables para su descarga.
- La model card menciona `model_quantized.onnx` en el ejemplo de código, pero dicho fichero no aparece en la tabla de ficheros publicada; conviene verificar su existencia real antes de usarlo.
- Al ser una exportación ONNX, el rendimiento y la compatibilidad dependen del proveedor de ejecución y de la versión de ONNX Runtime; no hay garantías de paridad numérica con el modelo PyTorch original.
- No hay información sobre latencia, throughput ni benchmarks, lo que dificulta estimar su idoneidad en producción.
- El modelo tiene pocas descargas (18) y cero likes, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/liodon-ai/granite-4.1-8b-llmon-preview-ONNX
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-8b-llmon-preview
- Perfil del autor: https://huggingface.co/liodon-ai
- Herramienta de exportación (optimum): https://github.com/huggingface/optimum
