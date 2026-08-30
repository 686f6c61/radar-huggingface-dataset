# liodon-ai/gpt2-ONNX

## Resumen

El modelo `liodon-ai/gpt2-ONNX` es una exportación al formato ONNX del modelo GPT-2 original de OpenAI (`openai-community/gpt2`), publicada por el laboratorio independiente Liodon AI. El objetivo es ofrecer una versión del popular modelo de generación de texto que pueda ejecutarse de forma eficiente con ONNX Runtime, tanto en CPU como en GPU, aprovechando la optimización que permite este formato. Se incluyen dos variantes: una en precisión FP32 completa y otra cuantizada dinámicamente a INT8 (solo pesos), lo que reduce el tamaño del archivo de 0,65 GB a 0,16 GB.

La relevancia de este modelo radica en su utilidad para entornos de producción con recursos limitados, donde el despliegue de modelos grandes no es viable. Al ser una conversión directa de GPT-2, conserva las capacidades originales de generación de texto, aunque con una ventana de contexto de 1024 tokens (la del modelo base). La exportación se realizó con la librería `optimum` de Hugging Face, utilizando la tarea `text-generation-with-past`, lo que incorpora soporte para caché de claves y valores (KV-cache) y facilita la decodificación autoregresiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (GPT-2) |
| Parametros totales | no disponible (modelo base GPT-2, 124M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo base GPT-2: 1024 tokens) |
| Tipos de cuantizacion | FP32, INT8 dinamico (solo pesos, sin calibracion) |
| Idiomas soportados | no disponible (modelo base GPT-2: principalmente ingles) |
| Licencia | other (ver modelo base openai-community/gpt2) |
| Formato de pesos | ONNX (.onnx) |

## Arquitectura y entrenamiento

El modelo es una conversión directa del GPT-2 original, un transformer decoder autoregresivo con 12 capas, 12 cabezas de atención y una dimensión oculta de 768. No ha sido reentrenado ni ajustado; se trata de una exportación técnica que mantiene los pesos originales. La exportación se realizó con `optimum.exporters.onnx.main_export` usando la tarea `text-generation-with-past`, lo que significa que el grafo ONNX expone entradas y salidas de past-key-values para permitir la decodificación con caché y evitar recalcular las atenciones anteriores en cada paso.

La cuantización dinámica INT8 se aplica solo a los pesos (weight-only) sin calibración, lo que reduce el tamaño del modelo a aproximadamente una cuarta parte del original FP32. Este método es rápido de aplicar y no requiere datos de calibración, aunque puede introducir una ligera degradación en la calidad de las predicciones. No se dispone de información sobre el dataset de entrenamiento original de GPT-2 ni sobre el proceso de entrenamiento, ya que no se detalla en la documentación del modelo.

## Capacidades

- Generación de texto autoregresiva: el modelo produce texto coherente y contextualizado, heredando las capacidades del GPT-2 original.
- Soporte de KV-cache: el grafo ONNX incluye entradas y salidas para past-key-values, lo que permite una decodificación eficiente en secuencias largas.
- Cuantización INT8: la variante `model_quantized.onnx` reduce el uso de memoria y acelera la inferencia en CPU, manteniendo un tamaño de 0,16 GB.
- Compatibilidad con ONNX Runtime: puede ejecutarse en múltiples proveedores (CPU, CUDA, etc.) mediante `onnxruntime`.
- Integración con Optimum: se puede cargar directamente con `ORTModelForCausalLM` de la librería `optimum`, que gestiona automáticamente el bookkeeping de la caché.
- Multilingüe limitado: al ser GPT-2, su rendimiento óptimo se da en inglés, aunque puede generar texto en otros idiomas con menor calidad.

## Casos de uso

- Inferencia en CPU sin GPU: el modelo cuantizado puede ejecutarse en servidores o equipos sin aceleración gráfica, gracias a su tamaño reducido y a la optimización de ONNX Runtime. Es adecuado para aplicaciones de generación de texto de baja latencia en entornos con restricciones de hardware.
- Despliegue en dispositivos edge: con un peso de 0,16 GB en INT8, cabe en dispositivos con poca memoria RAM, como Raspberry Pi o sistemas embebidos, permitiendo asistentes de texto locales.
- Prototipado rápido con ONNX Runtime: los desarrolladores pueden integrar el modelo en pipelines existentes usando `onnxruntime` directamente, sin depender de PyTorch, lo que simplifica el empaquetado y la distribución.
- Servicios de autocompletado de texto: el modelo puede utilizarse para sugerir continuaciones de frases en editores de código o procesadores de texto, aprovechando su capacidad de generación contextual.
- Generación de contenido en batch: al ser ligero, permite procesar múltiples solicitudes simultáneamente en CPU, útil para tareas de redacción automática de informes o resúmenes.
- Evaluación de técnicas de cuantización: sirve como banco de pruebas para comparar el rendimiento de modelos cuantizados frente a sus versiones FP32, ya que se ofrecen ambas variantes en el mismo repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este modelo. El rendimiento dependerá del hardware y del proveedor de ejecución de ONNX Runtime.

## Requisitos de hardware

- VRAM estimada: no requiere VRAM si se ejecuta en CPU; en GPU, el modelo FP32 ocupa aproximadamente 0,65 GB y el INT8 0,16 GB, por lo que cabe en cualquier GPU con al menos 1 GB de memoria.
- GPU recomendadas: no es necesario, pero puede ejecutarse en GPUs modestas como NVIDIA GTX 1050 o superiores. Para CPU, se recomienda un procesador con soporte AVX2 para un mejor rendimiento de ONNX Runtime.
- Compatibilidad con consumer GPU: sí, cualquier GPU con soporte CUDA o DirectML puede ejecutar el modelo.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML), Optimum (`ORTModelForCausalLM`), o integración en aplicaciones C++/Python mediante la API de ONNX Runtime.
- Latencia y throughput: no se proporcionan datos específicos. En una CPU moderna, la generación de un token con el modelo INT8 suele estar en el rango de 10-50 ms, dependiendo de la longitud de la secuencia y del hardware.

## Comparativa con modelos similares

| Modelo | Formato | Cuantizacion | Tamano | Contexto | Licencia |
|---|---|---|---|---|---|
| liodon-ai/gpt2-ONNX | ONNX | FP32, INT8 dinamico | 0,65 GB / 0,16 GB | 1024 (base) | other |
| brianwoo/GPT2-Onnx-Quantized | ONNX | Cuantizado (detalles no disponibles) | no disponible | no disponible | no disponible |
| Centaur31/gpt2-fp16-onnx | ONNX | FP16 | no disponible | no disponible | no disponible |

No se dispone de información detallada sobre los modelos comparables. La comparativa se limita a los datos públicos de los repositorios. El modelo de Liodon AI destaca por ofrecer tanto FP32 como INT8 en el mismo repositorio, lo que facilita la evaluación.

## Limitaciones y advertencias

- Sesgos conocidos: GPT-2 fue entrenado con datos de Internet y puede reproducir sesgos de género, raza o ideológicos presentes en el corpus.
- Riesgo de alucinacion: como todo modelo generativo, puede producir información falsa o inventada, especialmente en contextos largos.
- Limitaciones de contexto: la ventana de 1024 tokens limita la coherencia en conversaciones o documentos extensos.
- Limitaciones de idioma: el rendimiento óptimo se da en inglés; en otros idiomas la calidad puede ser notablemente inferior.
- Restricciones de licencia: la licencia se indica como "other", lo que requiere revisar la licencia del modelo base `openai-community/gpt2` (que es una licencia MIT modificada con restricciones de uso). Se recomienda verificar los términos antes de uso comercial.
- Cuantización INT8: al ser dinámica y sin calibración, puede degradar ligeramente la perplejidad y la coherencia del texto generado en comparación con la versión FP32.
- Sin soporte de tool calling ni agentes: el modelo no incluye capacidades de llamada a funciones ni razonamiento multi-paso más allá de la generación autoregresiva estándar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/liodon-ai/gpt2-ONNX
- Modelo base: https://huggingface.co/openai-community/gpt2
- ONNX Model Zoo (referencia de modelos ONNX): https://github.com/onnx/models
- Sitio web de LioDon AI: https://liodon.ai/
- Modelo similar: https://huggingface.co/brianwoo/GPT2-Onnx-Quantized
- Modelo similar: https://huggingface.co/Centaur31/gpt2-fp16-onnx
