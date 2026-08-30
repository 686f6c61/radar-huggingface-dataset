# liodon-ai/Qwen2.5-7B-Instruct-ONNX

## Resumen

El modelo `liodon-ai/Qwen2.5-7B-Instruct-ONNX` es una exportación al formato ONNX del modelo Qwen2.5-7B-Instruct, publicada por Liodon AI. Esta conversión permite ejecutar el modelo con ONNX Runtime, lo que facilita su integración en aplicaciones que requieren inferencia optimizada en entornos heterogéneos (CPU, GPU, NPU) y en plataformas que no soportan directamente PyTorch o Transformers. El repositorio incluye dos versiones del grafo: una en FP32 (30,46 GB) y otra en FP16 (15,95 GB), ambas con soporte de caché de claves y valores (KV-cache) para decodificación autorregresiva.

El modelo base, Qwen2.5-7B-Instruct, es un modelo de lenguaje de 7 mil millones de parámetros desarrollado por Alibaba, entrenado con hasta 18 billones de tokens y con soporte de contexto de hasta 128K tokens. Está optimizado para instrucciones, razonamiento, código y matemáticas, y ofrece capacidades multilingües en más de 29 idiomas. Esta exportación ONNX no introduce cambios en los pesos, por lo que conserva las capacidades del modelo original, aunque su rendimiento puede variar según el proveedor de ejecución (execution provider) utilizado.

La relevancia de esta ficha radica en que permite a desarrolladores e investigadores evaluar rápidamente si esta versión ONNX es adecuada para sus pipelines de producción, especialmente cuando se requiere despliegue en entornos con ONNX Runtime, como aplicaciones embebidas, servidores de inferencia o dispositivos con aceleración específica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5) - exportación ONNX con KV-cache |
| Parametros totales | 7.000 millones (del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K tokens (del modelo base) |
| Tipos de cuantizacion | FP32 y FP16 (archivos `model.onnx` y `model_fp16.onnx`) |
| Idiomas soportados | Multilingüe: más de 29 idiomas, incluyendo chino e inglés (del modelo base) |
| Licencia | other (según la model card; el modelo base Qwen2.5 usa Apache 2.0, pero esta exportación declara "other") |
| Formato de pesos | ONNX (`.onnx`) |

## Arquitectura y entrenamiento

La exportación se realizó con `optimum.exporters.onnx.main_export` usando la tarea `text-generation-with-past`, lo que significa que el grafo expone entradas y salidas de `past_key_values` para decodificación autorregresiva con caché. Esto es esencial para un rendimiento eficiente en generación de texto, ya que evita recalcular las atenciones de tokens anteriores. El modelo base Qwen2.5-7B-Instruct es un transformer denso con atención de múltiples cabezas, entrenado con un dataset masivo de 18 billones de tokens. El entrenamiento incluyó fases de preentrenamiento y ajuste fino supervisado (SFT), seguido de optimización por preferencias humanas (RLHF). No se han publicado detalles adicionales sobre el proceso de entrenamiento específico de esta exportación, ya que es una conversión de formato y no un reentrenamiento.

## Capacidades

- Generación de texto conversacional y de instrucciones, con seguimiento de instrucciones complejas.
- Razonamiento lógico y matemático, con mejoras significativas en tareas de código y matemáticas respecto a Qwen2.
- Soporte de contexto largo (hasta 128K tokens), útil para documentos extensos o conversaciones multi-turno.
- Capacidades multilingües en más de 29 idiomas, incluyendo español, chino, inglés, francés, alemán, etc.
- No se ha confirmado soporte de tool calling o function calling en esta exportación específica, aunque el modelo base sí lo tiene; se recomienda verificar con la documentación de ONNX Runtime.
- No incluye capacidades de visión ni audio; es exclusivamente texto.

## Casos de uso

- Despliegue en entornos con ONNX Runtime: ideal para aplicaciones que ya usan ONNX Runtime como motor de inferencia, por ejemplo en servidores Windows o Linux con CPU o GPU, sin necesidad de instalar PyTorch.
- Inferencia en dispositivos embebidos o edge: la versión FP16 reduce el uso de memoria y puede ejecutarse en GPUs con menor VRAM, como Jetson o tarjetas integradas.
- Integración con pipelines de Python que requieren interoperabilidad entre frameworks: ONNX permite usar el modelo con otros runtimes como TensorRT, OpenVINO o Windows ML.
- Generación de respuestas en aplicaciones de atención al cliente: el contexto de 128K permite manejar historiales largos de conversación.
- Asistente de programación: el modelo base tiene buenas capacidades de código, y la exportación ONNX puede integrarse en IDEs o herramientas de autocompletado que usen ONNX Runtime.
- Procesamiento de documentos largos: resumir o extraer información de textos extensos gracias a la ventana de contexto amplia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta exportación ONNX en la información disponible. Los benchmarks del modelo base Qwen2.5-7B-Instruct (como MMLU, HumanEval, GSM8K) están disponibles en la documentación oficial de Qwen, pero no se han replicado aquí para la versión ONNX. Se recomienda consultar la página del modelo base para obtener métricas de rendimiento académico.

## Requisitos de hardware

- VRAM estimada: para FP32 (30,46 GB) se necesitan al menos 32 GB de VRAM; para FP16 (15,95 GB) se necesitan al menos 16 GB de VRAM, aunque se recomienda 24 GB para margen.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, RTX 4090 (24 GB) para FP16; para FP32 se requieren GPUs con más de 30 GB, como A100 40GB o H100.
- En consumer GPU: la versión FP16 puede caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB), pero no en GPUs de 8-12 GB.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), también compatible con TensorRT, OpenVINO y Windows ML mediante los execution providers correspondientes.
- Latencia y throughput: no disponibles; dependen del hardware y del execution provider. En general, FP16 en GPU ofrece un rendimiento significativamente mejor que FP32 en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liodon-ai/Qwen2.5-7B-Instruct-ONNX | 7B | 128K | ONNX (FP32/FP16) | other | Hugging Face |
| Qwen/Qwen2.5-7B-Instruct (original) | 7B | 128K | PyTorch (safetensors) | Apache 2.0 | Hugging Face |
| llmware/qwen2.5-7b-instruct-onnx-qnn | 7B | 128K | ONNX (INT4) | Apache 2.0 | Hugging Face |
| Qwen2.5-7B-Instruct-GGUF | 7B | 128K | GGUF | Apache 2.0 | ModelScope |

La principal diferencia con el modelo original es el formato: ONNX permite ejecución con ONNX Runtime, mientras que el original requiere PyTorch. La versión QNN de llmware está optimizada para NPU de Qualcomm, mientras que esta exportación es genérica. La versión GGUF está pensada para llama.cpp y dispositivos con recursos limitados.

## Limitaciones y advertencias

- La licencia declarada es "other", lo que puede implicar restricciones de uso comercial; se recomienda revisar los términos exactos de la licencia del modelo base (Apache 2.0) y de esta exportación antes de usarla en producción.
- No se han publicado benchmarks específicos para esta exportación, por lo que el rendimiento real puede variar respecto al modelo original.
- La exportación no incluye cuantización adicional (solo FP32 y FP16), por lo que el uso de memoria es alto en comparación con versiones cuantizadas a INT8 o INT4.
- El modelo base puede presentar sesgos y alucinaciones, especialmente en temas sensibles o de actualidad; se recomienda validar las salidas en aplicaciones críticas.
- El soporte de tool calling y function calling no está confirmado en esta exportación; si se necesita, se debe probar con el execution provider adecuado.
- El contexto de 128K es teórico; en la práctica, el uso de memoria y la latencia aumentan considerablemente con secuencias largas, y puede ser necesario truncar o usar técnicas de atención eficiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/liodon-ai/Qwen2.5-7B-Instruct-ONNX
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Exportación ONNX QNN (alternativa): https://huggingface.co/llmware/qwen2.5-7b-instruct-onnx-qnn
- Página de Ollama para Qwen2.5: https://ollama.com/library/qwen2.5:7b-instruct
- Versión GGUF en ModelScope: https://www.modelscope.cn/models/qwen/Qwen2.5-7B-Instruct-GGUF
- Contenedor NVIDIA NIM: https://catalog.ngc.nvidia.com/orgs/nim/teams/qwen/containers/qwen-2.5-7b-instruct
