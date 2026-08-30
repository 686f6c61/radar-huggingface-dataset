# liodon-ai/Qwen2.5-Coder-7B-Instruct-ONNX

## Resumen

El modelo `liodon-ai/Qwen2.5-Coder-7B-Instruct-ONNX` es una exportación al formato ONNX del modelo original `Qwen/Qwen2.5-Coder-7B-Instruct`, realizada por Liodon AI. Su propósito es facilitar la ejecución del modelo en entornos que utilizan ONNX Runtime, como aplicaciones de servidor, edge computing o sistemas con restricciones de librerías. Al ser una conversión de formato, conserva las capacidades del modelo base, orientado a tareas de generación, razonamiento y corrección de código, así como conversaciones multi-turno.

La exportación se realizó con la herramienta `optimum` de Hugging Face, utilizando la tarea `text-generation-with-past`, lo que significa que el grafo expone entradas y salidas de past-key-values para decodificación autorregresiva con caché de KV. El repositorio incluye dos archivos: `model.onnx` en precisión FP32 (30,46 GB) y `model_fp16.onnx` en FP16 (15,95 GB), lo que permite elegir entre mayor precisión o menor uso de memoria. El modelo tiene 7 mil millones de parámetros y está basado en la arquitectura Qwen2.5, aunque no se especifican detalles adicionales sobre el contexto o el entrenamiento en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 7 mil millones (7B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo FP32 y FP16) |
| Idiomas soportados | no disponible |
| Licencia | other (ver modelo base) |
| Formato de pesos | ONNX (`.onnx`) |

## Arquitectura y entrenamiento

El modelo es una conversión directa del checkpoint `Qwen/Qwen2.5-Coder-7B-Instruct` al formato ONNX, sin modificación de los pesos. La arquitectura subyacente es un transformer decoder-only con atención causal, que incorpora mejoras como RoPE (rotary position embeddings) y normalización RMSNorm, típicas de la familia Qwen2.5. El modelo original fue entrenado con un enfoque de instrucción y ajuste fino para tareas de código, incluyendo generación, razonamiento y corrección de errores, aunque no se dispone de detalles específicos sobre el dataset o el proceso de entrenamiento en la información proporcionada.

La exportación se realizó con `optimum.exporters.onnx.main_export` y la tarea `text-generation-with-past`, lo que implica que el grafo ONNX incluye entradas y salidas para las claves y valores de la caché de atención, permitiendo una decodificación autorregresiva eficiente. No se mencionan innovaciones técnicas adicionales más allá de la conversión de formato.

## Capacidades

- Generación de código en múltiples lenguajes de programación, gracias a su entrenamiento específico en tareas de programación.
- Razonamiento sobre código, incluyendo la capacidad de predecir entradas y salidas de fragmentos de código.
- Corrección de errores y depuración de código en conversaciones multi-turno.
- Soporte de instrucciones y diálogo, al ser una variante "Instruct" ajustada para seguir órdenes del usuario.
- Capacidad de conversación y generación de texto en general, aunque su especialización principal es el código.
- No se especifican capacidades de tool calling, agentes, visión o audio en la información disponible.

## Casos de uso

- Despliegue en entornos que requieren ONNX Runtime: al estar en formato ONNX, el modelo puede integrarse en aplicaciones que usan exclusivamente ONNX Runtime, como servicios en contenedores ligeros o sistemas embebidos, sin depender de PyTorch.
- Inferencia en CPU: el archivo FP32 puede ejecutarse en CPU con ONNX Runtime, útil para entornos sin GPU o con restricciones de hardware.
- Aplicaciones de generación de código en producción: el modelo puede utilizarse para autocompletar código, generar funciones o documentar fragmentos, integrándose en IDEs o pipelines de desarrollo.
- Asistentes de programación conversacionales: al ser una variante Instruct, puede mantener diálogos multi-turno para ayudar a depurar o explicar código.
- Migración de modelos PyTorch a ONNX: sirve como referencia para desarrolladores que necesitan convertir modelos similares y desplegarlos en infraestructura ONNX.
- Evaluación de rendimiento de ONNX Runtime: permite comparar la velocidad y el uso de memoria de la inferencia ONNX frente a otras librerías, en tareas de generación de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo es una conversión de formato, por lo que su rendimiento debería ser equivalente al del modelo base `Qwen/Qwen2.5-Coder-7B-Instruct`, pero no se proporcionan métricas específicas (MMLU, HumanEval, GSM8K, etc.) en la documentación consultada.

## Requisitos de hardware

- El archivo FP16 (`model_fp16.onnx`) ocupa aproximadamente 15,95 GB, por lo que se recomienda una GPU con al menos 16 GB de VRAM para cargarlo en memoria, como una NVIDIA RTX 4090, A100 o similar.
- El archivo FP32 (`model.onnx`) ocupa 30,46 GB, lo que requiere una GPU con más de 32 GB de VRAM o ejecución en CPU con suficiente RAM.
- Para inferencia en CPU, se necesitaría al menos 32 GB de RAM para el modelo FP32, aunque el rendimiento sería significativamente más lento que con GPU.
- El modelo puede desplegarse con ONNX Runtime, ya sea mediante la API de Python (`onnxruntime`) o con el wrapper `ORTModelForCausalLM` de `optimum`, que gestiona automáticamente la caché de KV.
- No se proporcionan datos de latencia o throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-Coder-7B-Instruct (original) | 7B | 32k (según documentación del modelo base) | PyTorch | Apache 2.0 (según modelo base) | Hugging Face |
| liodon-ai/Qwen2.5-Coder-7B-Instruct-ONNX | 7B | no disponible | ONNX | other | Hugging Face |
| CodeLlama-7B-Instruct | 7B | 16k | PyTorch | Llama 2 license | Hugging Face |

La comparativa se basa en el modelo base y alternativas conocidas, pero no se dispone de datos de rendimiento para establecer una comparación cuantitativa. La principal diferencia del modelo ONNX es su formato, que facilita el despliegue en entornos ONNX Runtime, mientras que el resto de modelos requieren PyTorch u otras librerías.

## Limitaciones y advertencias

- Al ser una conversión de formato, no se han realizado ajustes adicionales; cualquier limitación del modelo base (sesgos, alucinaciones, errores en código) se mantiene.
- La licencia se indica como "other", por lo que es necesario revisar la licencia del modelo base `Qwen/Qwen2.5-Coder-7B-Instruct` para conocer las restricciones de uso comercial.
- No se especifican los idiomas soportados, aunque el modelo base de Qwen2.5 es multilingüe; se recomienda verificar la documentación original.
- El tamaño del repositorio es de 46,4 GB, lo que puede suponer un problema de almacenamiento y descarga en entornos con recursos limitados.
- La ejecución en CPU con el archivo FP32 puede ser muy lenta para tareas de generación de código en tiempo real, por lo que se recomienda usar FP16 en GPU si es posible.
- No se proporciona información sobre la compatibilidad con versiones específicas de ONNX Runtime o `optimum`, por lo que puede haber problemas de integración con versiones antiguas.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/liodon-ai/Qwen2.5-Coder-7B-Instruct-ONNX)
- [Modelo base Qwen/Qwen2.5-Coder-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct)
- [Repositorio GGUF del mismo autor](https://huggingface.co/liodon-ai/Qwen2.5-Coder-7B-Instruct-imatrix-GGUF)
- [Página del modelo en Benchable](https://benchable.ai/models/qwen/qwen2.5-coder-7b-instruct)
- [Página del modelo en Ollama](https://ollama.com/library/qwen2.5-coder:7b-instruct)
