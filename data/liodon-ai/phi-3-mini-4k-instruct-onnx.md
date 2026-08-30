# liodon-ai/Phi-3-mini-4k-instruct-ONNX

## Resumen

El modelo `liodon-ai/Phi-3-mini-4k-instruct-ONNX` es una exportación al formato ONNX del modelo `microsoft/Phi-3-mini-4k-instruct`, realizada por Liodon AI mediante la librería `optimum` de Hugging Face. El modelo original es un transformer decoder-only de 3.800 millones de parámetros, desarrollado por Microsoft, entrenado con datos sintéticos y filtrados de sitios web públicos, con un enfoque especial en razonamiento denso y calidad de los datos. Esta versión ONNX está pensada para facilitar el despliegue en entornos que usan ONNX Runtime, como aplicaciones en Python, C# u otros lenguajes compatibles, y para aprovechar la optimización que ofrece este runtime en CPU y GPU.

La relevancia de esta ficha radica en que ONNX es un formato interoperable ampliamente adoptado en producción, lo que permite ejecutar un modelo de razonamiento compacto (3,8B) en infraestructuras variadas sin depender exclusivamente de PyTorch. El repositorio incluye dos archivos: `model.onnx` en FP32 (15,29 GB) y `model_fp16.onnx` en FP16 (8,25 GB), ambos con soporte para caché de claves y valores (KV-cache) para decodificación autorregresiva eficiente. El modelo base tiene una longitud de contexto de 4096 tokens y está orientado a tareas de instrucción, generación de texto y razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-3) |
| Parametros totales | 3,8 mil millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | FP32 (model.onnx) y FP16 (model_fp16.onnx); no se incluyen cuantizaciones enteras en este repositorio |
| Idiomas soportados | No disponible (el modelo base está entrenado principalmente en inglés; otros idiomas con rendimiento limitado) |
| Licencia | other (hereda la licencia del modelo base de Microsoft, que es MIT, pero el repositorio la declara como "other") |
| Formato de pesos | ONNX (archivos .onnx) |

## Arquitectura y entrenamiento

El modelo base `Phi-3-mini-4k-instruct` es un transformer decoder-only con 3,8 mil millones de parámetros, perteneciente a la familia Phi-3 de Microsoft. Su arquitectura es similar a la de otros LLM modernos, con atención por ventanas deslizantes y una capa de embedding compartida. El entrenamiento se realizó con una combinación de datos sintéticos generados por modelos más grandes y datos filtrados de sitios web públicos, priorizando ejemplos con alto contenido de razonamiento. El ajuste fino instructivo se llevó a cabo con técnicas de supervisión y alineación (posiblemente con RLHF o DPO, aunque los detalles exactos no se especifican en la información disponible). El modelo está optimizado para tareas de razonamiento matemático, lógico y de comprensión de instrucciones.

La exportación a ONNX se realizó con `optimum.exporters.onnx.main_export` utilizando la tarea `text-generation-with-past`, lo que significa que el grafo expone entradas y salidas de past-key-values para permitir la decodificación autorregresiva con caché. Esto es clave para reducir la latencia en generación de texto, ya que evita recalcular las atenciones previas en cada paso.

## Capacidades

- Generación de texto en lenguaje natural, incluyendo respuestas conversacionales y completado de texto.
- Razonamiento matemático y lógico, con buen desempeño en problemas de aritmética y álgebra (según las capacidades del modelo base).
- Ejecución de instrucciones con formato de chat, gracias al ajuste instructivo del modelo base.
- Soporte de múltiples turnos conversacionales (contexto de 4096 tokens para mantener historial).
- Capacidades multilingües limitadas; el modelo está principalmente entrenado en inglés, aunque puede producir texto en otros idiomas con menor calidad.
- No se indica soporte explícito para tool calling, agentes, visión ni audio en la documentación disponible.

## Casos de uso

- Despliegue en entornos de producción con ONNX Runtime en CPU: el archivo FP32 permite ejecutar el modelo en servidores sin GPU, aunque con mayor latencia; es adecuado para tareas de generación de texto batch o asíncronas donde la velocidad no sea crítica.
- Integración en aplicaciones .NET o C#: al ser ONNX, se puede cargar directamente con `Microsoft.ML.OnnxRuntime` desde aplicaciones de escritorio o servicios web, sin necesidad de un servidor Python.
- Prototipado rápido en Python con `optimum.onnxruntime.ORTModelForCausalLM`: el wrapper de Hugging Face simplifica la gestión de la caché y permite probar el modelo con pocas líneas de código.
- Chatbots de soporte técnico en inglés: con 4096 tokens de contexto, puede manejar conversaciones de varios turnos y responder consultas sobre documentación o procedimientos.
- Generación de código en entornos con restricciones de dependencias: al usar ONNX Runtime, se evita la instalación de PyTorch completo, reduciendo el tamaño de la imagen de despliegue.
- Automatización de tareas de razonamiento en pipelines de datos: el modelo puede procesar textos, extraer conclusiones lógicas o clasificar contenido en inglés, integrándose en flujos con otros servicios ONNX.
- Inferencia en GPU con FP16: el archivo `model_fp16.onnx` reduce el uso de memoria a 8,25 GB, lo que permite ejecutarlo en GPUs de consumo como la RTX 3080 (10 GB) o la RTX 4070 (12 GB), con menor latencia que en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta versión ONNX. Los benchmarks del modelo base `Phi-3-mini-4k-instruct` (como MMLU, HumanEval o GSM8K) están documentados en la ficha del modelo original de Microsoft, pero no se han reproducido aquí para esta exportación. Se recomienda consultar la documentación oficial del modelo base para conocer métricas de referencia.

## Requisitos de hardware

- Para el archivo FP32 (`model.onnx`, 15,29 GB): se recomienda al menos 24 GB de VRAM en GPU para inferencia sin swapping, o 32 GB de RAM si se ejecuta en CPU con ONNX Runtime.
- Para el archivo FP16 (`model_fp16.onnx`, 8,25 GB): se necesita al menos 12 GB de VRAM en GPU; es compatible con GPUs de consumo como RTX 3080, RTX 4070 o superiores.
- En CPU, el modelo se puede ejecutar con `CPUExecutionProvider` de ONNX Runtime, pero la velocidad será baja (del orden de varios segundos por token); es viable solo para pruebas o procesamiento batch no interactivo.
- Opciones de despliegue: ONNX Runtime (Python, C#, C++), `optimum.onnxruntime.ORTModelForCausalLM`, y cualquier framework que soporte el formato ONNX.
- No se dispone de datos de latencia o throughput específicos para esta exportación; dependerán del hardware y del número de tokens generados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| liodon-ai/Phi-3-mini-4k-instruct-ONNX | 3,8B | 4096 | ONNX (FP32/FP16) | other | Exportación ONNX del modelo base |
| microsoft/Phi-3-mini-4k-instruct | 3,8B | 4096 | PyTorch | MIT | Modelo original, incluye pesos en safetensors |
| Llama-3.2-3B | 3,2B | 128K | PyTorch | Llama 3.2 Community License | Alternativa de Meta con mayor contexto, pero sin versión ONNX oficial de este repositorio |
| Qwen-2.5-3B | 3,1B | 32K | PyTorch | Apache 2.0 | Alternativa open source con buen rendimiento multilingüe |

Esta comparativa se basa en las características generales de los modelos; no se han ejecutado benchmarks en esta ficha.

## Limitaciones y advertencias

- El modelo base tiene sesgos inherentes a los datos de entrenamiento, que pueden reflejarse en las respuestas; no se ha realizado una evaluación de sesgos específica para esta exportación.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en temas fuera de su distribución de entrenamiento.
- La longitud de contexto está limitada a 4096 tokens, lo que puede ser insuficiente para documentos largos o conversaciones muy extensas.
- El soporte multilingüe es limitado; el modelo está optimizado para inglés y puede producir respuestas de baja calidad en otros idiomas.
- La licencia se declara como "other" en el repositorio, aunque el modelo base original tiene licencia MIT; se recomienda verificar los términos exactos antes de un uso comercial.
- El archivo FP32 es pesado (15,29 GB) y puede no caber en GPUs de consumo; para despliegues en GPU se recomienda usar el archivo FP16.
- No se incluyen cuantizaciones de 8 bits o 4 bits en este repositorio, lo que limita el despliegue en hardware muy restringido; para ello habría que buscar otras exportaciones cuantizadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/liodon-ai/Phi-3-mini-4k-instruct-ONNX
- Modelo base original: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Repositorio GitHub del modelo base (no oficial): https://github.com/ttlmtang123/Phi-3-mini-4k-instruct
- Documentación de optimum para exportación ONNX: https://huggingface.co/docs/optimum/onnxruntime/usage_guides/export_model
- Página de ONNX Runtime: https://onnxruntime.ai/
