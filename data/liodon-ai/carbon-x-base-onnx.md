# liodon-ai/Carbon-X-Base-ONNX

## Resumen

Carbon-X-Base-ONNX es la exportación al formato ONNX del modelo de generación de texto HuggingFaceBio/Carbon-X-Base, publicada por Liodon AI. El repositorio no contiene un modelo entrenado desde cero, sino una conversión del checkpoint original a grafos ONNX ejecutables con ONNXRuntime, lo que permite desplegar el modelo fuera del ecosistema PyTorch nativo y aprovechar aceleradores de inferencia específicos por hardware.

La exportación se realizó con la librería `optimum` de Hugging Face, empleando la tarea `text-generation-with-past`, de modo que el grafo expone entradas y salidas de past-key-value para decodificación autorregresiva con caché KV. El repositorio ocupa 91 GB e incluye un archivo FP16 de 31,74 GB, lo que sitúa al modelo base en el rango de decenas de miles de millones de parámetros, aunque el número exacto no se especifica en la información disponible.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa de despliegue ONNX para un modelo del que no hay model card pública detallada; por otro, advierte de las lagunas de información (arquitectura, contexto, licencia real) que un equipo técnico debe resolver antes de llevarlo a producción. Las etiquetas del repositorio mencionan `qwen3`, lo que sugiere una arquitectura de la familia Qwen 3, pero este dato no está confirmado por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (etiqueta `qwen3` en el repositorio, sin confirmar) |
| Parámetros totales | No disponible (el archivo FP16 de 31,74 GB sugiere decenas de miles de millones) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | FP32 y FP16 documentados; la model card menciona `model_quantized.onnx` en el ejemplo de uso, pero no figura en la tabla de archivos |
| Idiomas soportados | No disponible |
| Licencia | `other` (sin texto de licencia publicado) |
| Formato de pesos | ONNX (`model.onnx` FP32, `model_fp16.onnx` FP16) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base. El repositorio de exportación indica únicamente la tarea `text-generation-with-past`, propia de modelos transformer causales con caché KV, y la etiqueta `qwen3` apunta a una posible arquitectura de la familia Qwen 3, sin confirmación oficial por parte del autor. No se especifican número de capas, dimensión oculta, mecanismo de atención (completa, lineal o híbrida) ni si se trata de un modelo denso o de mezcla de expertos.

Tampoco hay datos sobre el proceso de entrenamiento: número de tokens, composición del dataset, uso de RLHF, DPO u otras técnicas de alineación. La model card se limita a documentar el proceso de exportación con `optimum.exporters.onnx.main_export`, que genera un grafo ONNX con entradas y salidas de past-key-value para decodificación con caché. Esta es la única innovación técnica documentada: la exposición explícita de la caché KV en el grafo, que permite reutilizar estados entre pasos y reducir el coste computacional de la generación token a token.

## Capacidades

- Generación de texto autoregresiva con caché KV, tal como indica la tarea `text-generation-with-past`.
- Ejecución mediante ONNXRuntime con distintos execution providers (CPU, GPU), lo que permite desplegar en hardware no cubierto por PyTorch nativo.
- Compatibilidad con el wrapper `ORTModelForCausalLM` de `optimum`, que gestiona automáticamente la contabilidad de la caché KV.
- Capacidades específicas de razonamiento, código, matemáticas, tool calling, agentes o multimodalidad: no disponibles en la información proporcionada.
- Soporte multilingüe: no disponible.

## Casos de uso

- Despliegue en infraestructura ONNXRuntime: el modelo se puede servir con `onnxruntime` y `ORTModelForCausalLM` en entornos donde PyTorch no está disponible o no es la opción preferida, aprovechando execution providers específicos por hardware.
- Inferencia en GPU con FP16: el archivo `model_fp16.onnx` de 31,74 GB está pensado para execution providers de GPU, lo que permite reducir el uso de memoria frente a FP32 y acelerar la generación en servidores con suficiente VRAM.
- Integración en pipelines de generación de texto existentes: al mantener la interfaz de `transformers` a través de `optimum`, el modelo puede sustituir a otros modelos causales en aplicaciones de completado, resumen o redacción sin reescribir el código de orquestación.
- Evaluación comparativa de backends de inferencia: útil para equipos que quieran medir latencia y throughput de ONNXRuntime frente a vLLM o llama.cpp sobre el mismo checkpoint.
- Prototipado de servicios de texto con caché KV explícita: la exposición de past-key-value permite implementar decodificación por lotes o reutilización de prefijos en aplicaciones con prompts repetidos.
- Archivado y portabilidad del modelo: la conversión a ONNX facilita la distribución del checkpoint en formatos independientes del framework de entrenamiento original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el archivo FP16 ocupa 31,74 GB, por lo que la inferencia en GPU requiere al menos ~32 GB de VRAM solo para los pesos, más memoria adicional para la caché KV y activaciones.
- GPU recomendadas: A100 40 GB o 80 GB, H100, y en general GPUs profesionales con 40 GB o más. Una RTX 4090 de 24 GB no puede alojar el archivo FP16 completo sin cuantización adicional.
- GPU de consumo: no cabe en GPUs de consumo con 24 GB o menos en FP16; se necesitaría una versión cuantizada (INT8/INT4) no documentada en la tabla de archivos del repositorio.
- Opciones de despliegue: ONNXRuntime con `optimum` (`ORTModelForCausalLM`), execution providers de CPU y GPU. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Carbon-X-Base-ONNX | No disponible | No disponible | ONNX (FP32, FP16) | `other` | Hugging Face, 380 descargas |
| Carbon-X-ONNX (liodon-ai) | No disponible | No disponible | ONNX | No disponible | Hugging Face |
| HuggingFaceBio/Carbon-X-Base | No disponible | No disponible | Pesos originales | `other` | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta la arquitectura, el tamaño exacto de parámetros, la longitud de contexto ni los idiomas soportados; estos datos deben obtenerse del modelo base antes de cualquier uso en producción.
- La licencia es `other` sin texto publicado, lo que impide determinar si el uso comercial está permitido. Es imprescindible contactar con el autor o revisar el repositorio del modelo base.
- La tabla de archivos de la model card lista solo `model.onnx` (0,00 GB, lo que sugiere un error o un archivo vacío) y `model_fp16.onnx`; el ejemplo de código referencia `model_quantized.onnx`, que no aparece en la tabla. Hay una inconsistencia documental que conviene verificar antes de descargar.
- El repositorio ocupa 91 GB, un tamaño considerable que puede dificultar la descarga y el almacenamiento en entornos con recursos limitados.
- No hay información sobre sesgos, riesgo de alucinación ni evaluación de seguridad del modelo base.
- Al ser una exportación ONNX, cualquier limitación del modelo original se hereda; la conversión no añade capacidades nuevas.
- No se documenta soporte para tool calling, agentes ni modos de razonamiento extendido; no debe asumirse su disponibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/liodon-ai/Carbon-X-Base-ONNX
- Modelo base: https://huggingface.co/HuggingFaceBio/Carbon-X-Base
- Exportación relacionada: https://huggingface.co/liodon-ai/Carbon-X-ONNX
- Librería optimum: https://github.com/huggingface/optimum
