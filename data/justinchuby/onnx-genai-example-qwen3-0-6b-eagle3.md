# justinchuby/onnx-genai-example-qwen3-0-6b-eagle3

## Resumen

Este repositorio contiene un paquete de pesos reales en formato ONNX diseñado para decodificación especulativa encadenada, que combina el modelo base `Qwen/Qwen3-0.6B` con un modelo proposer `Nicolassuez/Qwen3-0.6B-eagle3`. El objetivo es acelerar la generación de texto mediante la técnica de decodificación especulativa, donde un modelo más pequeño (proposer) genera candidatos que luego son verificados por el modelo principal (target). El paquete incluye pesos fp16 tanto del target como del proposer, embeddings del target, mapeo exacto de vocabulario entre ambos, tokenizador y metadatos canónicos para su uso con el runtime `onnx-genai`. Está publicado bajo licencia Apache-2.0 y ocupa 2,1 GB.

La relevancia de este paquete radica en que demuestra un flujo de trabajo completo para desplegar decodificación especulativa con ONNX Runtime, un área de creciente interés para reducir la latencia en inferencia de modelos de lenguaje. El autor, justinchuby, mantiene el proyecto `onnx-genai`, un runtime prototipo para IA generativa sobre ONNX, y este repositorio sirve como ejemplo de integración con metadatos de inferencia. Aunque el modelo base tiene solo 0,6 mil millones de parámetros, la técnica de decodificación especulativa es aplicable a modelos más grandes, por lo que este paquete es un punto de partida útil para desarrolladores que buscan optimizar sus pipelines.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Qwen3-0.6B, transformer) |
| Parametros totales | no disponible (el modelo base tiene 0,6B; el proposer añade parametros adicionales no especificados) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-0.6B, no especificada en el repositorio) |
| Tipos de cuantizacion | fp16 (pesos reales), sin cuantizacion adicional documentada |
| Idiomas soportados | no disponible (no se indica en la informacion proporcionada) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX, safetensors |

## Arquitectura y entrenamiento

El paquete no es un modelo entrenado desde cero, sino una combinacion de dos modelos existentes para inferencia con decodificacion especulativa. El modelo target es `Qwen3-0.6B`, un transformer autoregresivo de 0,6 mil millones de parametros, y el proposer es `Qwen3-0.6B-eagle3`, un modelo auxiliar disenado para generar propuestas rapidas. La arquitectura de la decodificacion especulativa encadenada implica que el proposer genera una secuencia de tokens candidatos, que luego son verificados por el target en paralelo; si un token es rechazado, se corrige y se repite el proceso. El repositorio incluye los pesos en fp16, el mapeo de vocabulario entre ambos modelos, el tokenizador y metadatos de inferencia que permiten al runtime `onnx-genai` interpretar correctamente el flujo de proposicion y verificacion.

No se proporcionan detalles sobre el entrenamiento de los modelos originales, como el numero de tokens de entrenamiento o el uso de RLHF/DPO. La innovacion tecnica principal de este paquete es la integracion de la decodificacion especulativa en un formato ONNX estandarizado, con metadatos canonicos que facilitan su uso en entornos de produccion. La prueba de validacion incluida en el repositorio confirma que el runtime genera exactamente los mismos 12 tokens que una decodificacion greedy de referencia, aceptando 6 propuestas y rechazando 27, lo que demuestra la correcta implementacion del mecanismo.

## Capacidades

- Generacion de texto autoregresiva: al estar basado en Qwen3-0.6B, hereda las capacidades de generacion de texto del modelo original, aunque no se especifican detalles concretos en este repositorio.
- Decodificacion especulativa: el paquete esta disenado para acelerar la inferencia mediante la generacion de multiples tokens por paso, reduciendo potencialmente la latencia.
- Integracion con ONNX Runtime: compatible con el runtime `onnx-genai` y con la API de generacion de ONNX Runtime (GenAI), incluyendo gestion de KV cache y muestreo.
- Ejecucion en multiples backends: segun la documentacion de `onnx-genai`, se puede configurar la ejecucion en CPU, CUDA, WebGPU, Metal o CoreML mediante variables de entorno.
- Compatibilidad con metadatos de inferencia: utiliza el formato `inference_metadata.yaml` como contrato de decodificacion, lo que permite una integracion limpia con herramientas de orquestacion.

## Casos de uso

- Optimizacion de inferencia en produccion: el paquete permite reducir la latencia de generacion en servicios que utilizan Qwen3-0.6B, especialmente en entornos con alta concurrencia donde cada milisegundo cuenta. Se puede integrar en un servidor de inferencia basado en ONNX Runtime para servir peticiones de chat o completado de texto.
- Prototipado de decodificacion especulativa: desarrolladores que investigan tecnicas de aceleracion pueden usar este paquete como referencia para implementar su propio flujo de proposicion y verificacion, ya que incluye metadatos y codigo de prueba.
- Despliegue en entornos con recursos limitados: al ser un modelo de 0,6B con pesos fp16, cabe en GPUs de consumo medio (por ejemplo, RTX 3060 o similar) y puede ejecutarse en CPU, lo que lo hace util para pruebas en laptops o servidores sin GPU.
- Evaluacion de calidad vs. velocidad: el paquete permite comparar la salida de la decodificacion especulativa con la decodificacion greedy estandar (la prueba incluida genera los mismos tokens), lo que facilita validar que la aceleracion no degrada la calidad.
- Integracion en pipelines de ONNX: al estar en formato ONNX, puede combinarse con otros modelos o pre/post-procesadores dentro de un grafo de inferencia, por ejemplo, para tareas de clasificacion o extraccion de informacion.
- Educacion y experimentacion: sirve como ejemplo didactico de como estructurar un paquete de modelos con decodificacion especulativa, con metadatos claros y un test reproducible, util para cursos o talleres sobre inferencia eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El repositorio incluye una prueba de validacion que reporta que el runtime genero exactamente los mismos 12 tokens que una decodificacion greedy de referencia, aceptando 6 propuestas y rechazando 27. Este dato indica que la decodificacion especulativa funciona correctamente, pero no proporciona metricas de velocidad o rendimiento comparativo. Se recomienda ejecutar pruebas propias para medir la aceleracion en el hardware objetivo.

## Requisitos de hardware

- VRAM estimada: no especificada. Con pesos fp16 de 0,6B (aproximadamente 1,2 GB solo para el target) y el proposer adicional, se estima un consumo de memoria de entre 2 y 4 GB, dependiendo de la longitud de contexto y el tamano del batch.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, A10). Tambien puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con consumer GPU: si, modelos como RTX 3060 o superiores son suficientes para inferencia.
- Opciones de despliegue: requiere el runtime `onnx-genai` (prototipo) o la API de ONNX Runtime GenAI. No se menciona compatibilidad con vLLM, llama.cpp u Ollama en la informacion proporcionada.
- Latencia y throughput: no se proporcionan datos. La decodificacion especulativa suele reducir la latencia entre 1,5 y 3 veces en comparacion con la decodificacion autoregresiva estandar, pero depende del hardware y del modelo proposer.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con modelos similares. El paquete es un ejemplo de integracion de decodificacion especulativa sobre Qwen3-0.6B, y no se han publicado datos de rendimiento frente a otras alternativas como el propio Qwen3-0.6B sin decodificacion especulativa, o paquetes equivalentes para otros modelos. Se recomienda consultar el repositorio de `onnx-genai` para mas ejemplos y futuras actualizaciones.

## Limitaciones y advertencias

- El paquete es un ejemplo de demostracion, no un modelo optimizado para produccion. El runtime `onnx-genai` es un prototipo y puede tener limitaciones de estabilidad o rendimiento en entornos reales.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de idioma del modelo base Qwen3-0.6B. Se recomienda consultar la documentacion oficial de Qwen para conocer estas advertencias.
- La decodificacion especulativa no siempre ofrece aceleracion; en algunos casos (por ejemplo, con secuencias cortas o hardware lento) puede ser mas lenta que la decodificacion estandar. Es necesario validar el rendimiento en el caso de uso concreto.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que los modelos base (Qwen3-0.6B y Qwen3-0.6B-eagle3) tambien tienen licencia Apache-2.0, como se indica en la model card.
- El repositorio no incluye informacion sobre la longitud de contexto soportada, lo que puede limitar su uso en aplicaciones que requieran contextos largos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/justinchuby/onnx-genai-example-qwen3-0-6b-eagle3
- Proyecto onnx-genai en GitHub: https://github.com/justinchuby/onnx-genai
- Ejemplos de onnx-genai: https://github.com/justinchuby/onnx-genai/tree/main/examples
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo proposer Qwen3-0.6B-eagle3: https://huggingface.co/Nicolassuez/Qwen3-0.6B-eagle3
- Documentacion de ONNX Runtime GenAI: https://onnxruntime.ai/docs/genai/
