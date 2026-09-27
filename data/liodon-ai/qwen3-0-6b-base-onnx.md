# liodon-ai/Qwen3-0.6B-Base-ONNX

## Resumen

liodon-ai/Qwen3-0.6B-Base-ONNX es una exportación a formato ONNX del modelo denso Qwen/Qwen3-0.6B-Base, publicada por Liodon AI. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión de pesos orientada a ejecución con ONNX Runtime: el repositorio distribuye el mismo modelo en tres precisiones (FP32, FP16 e INT8 dinámico) junto con el grafo exportado mediante la librería `optimum` con la tarea `text-generation-with-past`, lo que expone entradas y salidas de past-key-value para decodificación autorregresiva con caché KV.

El modelo subyacente, Qwen3-0.6B-Base, pertenece a la familia Qwen3 de Alibaba y es la variante más pequeña de la serie. Es un transformer decoder-only denso de aproximadamente 0,6 mil millones de parámetros, pensado para tareas de generación de texto con un coste computacional muy bajo y capacidad de ejecución en CPU. El repositorio no incluye datos de benchmarks ni métricas de evaluación propias.

Su relevancia práctica reside en el formato: al estar exportado a ONNX, puede desplegarse sin depender de PyTorch, integrarse en runtimes ligeros, aprovechar aceleración por proveedores de ejecución (CPU, CUDA, DirectML) y consumirse desde `optimum.onnxruntime.ORTModelForCausalLM`. Esto lo hace útil para entornos embebidos, edge computing y pipelines donde el tamaño del runtime es un factor crítico. La model card no especifica idiomas soportados ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3) con Grouped Query Attention, exportado a ONNX (tarea `text-generation-with-past`) |
| Parametros totales | ~0,6 mil millones (modelo base Qwen3-0.6B-Base); no detallado en la model card del export |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen3-0.6B-Base trabaja con 32.768 tokens nativos según la documentación de la familia Qwen3 |
| Tipos de cuantizacion | FP32 (`model.onnx`, 3,01 GB), FP16 (`model_fp16.onnx`, 1,62 GB) e INT8 dinámico weight-only sin calibración (`model_quantized.onnx`, 0,75 GB) |
| Idiomas soportados | No disponible en la model card del export |
| Licencia | `other` (según los metadatos del repositorio); el modelo base Qwen/Qwen3-0.6B-Base se publica bajo Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`, `model_fp16.onnx`, `model_quantized.onnx`) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base Qwen3-0.6B-Base: un transformer decoder-only denso con atención causal y Grouped Query Attention (GQA). Sobre este modelo no se ha realizado ningún entrenamiento adicional; el repositorio documenta exclusivamente el proceso de exportación. Éste se llevó a cabo con `optimum.exporters.onnx.main_export` usando la tarea `text-generation-with-past`, de modo que el grafo ONNX resultante incluye entradas y salidas de past-key-value. Esto permite reutilizar la caché KV entre pasos de decodificación y evita recomputar el prefijo completo en cada token generado.

La cuantización INT8 aplicada en `model_quantized.onnx` es dinámica y weight-only, sin calibración con datos: los pesos se cuantizan a 8 bits y las activaciones se cuantizan en tiempo de ejecución. Esto reduce el tamaño del fichero de 3,01 GB (FP32) a 0,75 GB, a costa de una posible pérdida de precisión que el repositorio no cuantifica. No se documentan en la model card el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO; conviene consultar la documentación del modelo base Qwen/Qwen3-0.6B-Base para esos datos.

## Capacidades

- Generación de texto autorregresiva en modo `text-generation` (pipeline declarado en los metadatos).
- Decodificación con caché KV gracias a la exportación con `text-generation-with-past`, lo que acelera la generación token a token.
- Inferencia sin PyTorch: el modelo se ejecuta directamente sobre ONNX Runtime mediante distintos execution providers.
- Integración con la librería `transformers` para la tokenización (`AutoTokenizer`) y con `optimum` para el modelo (`ORTModelForCausalLM`).
- Ejecución en CPU y en GPU, según el fichero elegido (INT8 para CPU, FP16 para GPU).
- Al ser un modelo base (sufijo `-Base`) y no una variante instruct, no incorpora alineación conversacional por defecto; las capacidades de diálogo o tool calling no están documentadas en esta ficha y no deben asumirse.
- Capacidades multilingües: no disponibles en la información proporcionada para este export.

## Casos de uso

- Inferencia en dispositivos edge o embebidos: con `model_quantized.onnx` (0,75 GB) el modelo puede ejecutarse en CPU sin GPU dedicada, lo que permite desplegar generación de texto en Raspberry Pi, portátiles modestos o contenedores con memoria limitada.
- Prototipado rápido de aplicaciones de generación de texto: el wrapper `ORTModelForCausalLM` permite cargar el modelo con pocas líneas de código y validar ideas sin gestionar dependencias de PyTorch ni CUDA.
- Autocompletado y generación de texto en herramientas de escritorio: al integrarse vía ONNX Runtime, puede embeberse en aplicaciones nativas (Windows con DirectML, macOS, Linux) como componente de sugerencias de texto.
- Preprocesamiento y aumento de datos en pipelines de NLP: generar variaciones de texto, resúmenes preliminares o borradores sintéticos antes de pasarlos a un modelo mayor, aprovechando su bajo coste por token.
- Clasificación y extracción mediante prompting en modo base: usar el modelo como extractor de continuación de plantillas para tareas como etiquetado de texto, siempre que se construyan prompts adecuados al no tratarse de una variante instruct.
- Despliegue en entornos sin acceso a GPU o con restricciones de instalación: al no requerir los paquetes de PyTorch, encaja en imágenes de contenedor ligeras y en sistemas donde las dependencias pesadas no son viables.
- Evaluación comparativa de exportaciones ONNX: sirve como referencia para medir el impacto de la cuantización INT8 frente a FP32/FP16 en latencia, memoria y calidad de salida dentro de un mismo pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del export no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, ni comparaciones de latencia o throughput entre las tres precisiones ofrecidas. Cualquier cifra de rendimiento debería medirse directamente sobre los ficheros del repositorio.

## Requisitos de hardware

- VRAM/RAM estimada (solo pesos): `model_quantized.onnx` INT8 ~0,75 GB; `model_fp16.onnx` FP16 ~1,62 GB; `model.onnx` FP32 ~3,01 GB. A estas cifras hay que sumar la memoria de la caché KV y de las activaciones, que crece con la longitud de contexto.
- Ejecución en CPU: viable con el fichero INT8 en prácticamente cualquier equipo con ~2 GB de RAM libre; es el escenario principal de esta exportación.
- GPU consumer: el fichero FP16 (1,62 GB) cabe con holgura en tarjetas con 4-6 GB de VRAM o más, como RTX 3050, RTX 3060, RTX 4060 o superiores. El fichero FP32 (3,01 GB) cabe en GPUs con 6-8 GB o más.
- GPU de centro de datos: no es necesaria ninguna GPU de gama alta (A100, H100) para un modelo de este tamaño; sería un sobredimensionamiento salvo que se busque un throughput masivo con batching.
- Opciones de despliegue: ONNX Runtime (con execution providers CPU, CUDA, DirectML, entre otros), `optimum.onnxruntime.ORTModelForCausalLM`, y cápsulas de `transformers`. Compatible con ONNX Runtime GenAI si se adapta el grafo.
- Latencia y throughput: no disponibles. No se aportan mediciones en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| liodon-ai/Qwen3-0.6B-Base-ONNX | ~0,6 B | No disponible (base: 32.768 tokens) | ONNX (FP32/FP16/INT8) | `other` | Export del modelo base, sin datos de benchmarks |
| Qwen/Qwen3-0.6B-Base | ~0,6 B | 32.768 tokens (según documentación de Qwen3) | safetensors (PyTorch) | Apache 2.0 | Modelo original; requiere PyTorch para inferencia |
| SmolLM2-360M | 0,36 B | 8.192 tokens | safetensors, GGUF | Apache 2.0 | Alternativa de tamaño similar para edge, ecosistema llama.cpp |
| Llama 3.2 1B | ~1,2 B | 128.000 tokens | safetensors, GGUF | Llama 3.2 Community License | Mayor tamaño y contexto, con licencia de comunidad |

La comparativa se limita a características estructurales: no se dispone de resultados de benchmarks publicados en la información proporcionada que permitan comparar calidad de salida entre estos modelos.

## Limitaciones y advertencias

- Modelo base sin alineación instruct: no está ajustado para seguir instrucciones ni para mantener conversaciones; el uso como asistente requiere fine-tuning o prompting cuidadoso.
- Ausencia total de métricas: la model card no publica benchmarks, evaluación de sesgos ni análisis de calidad tras la cuantización INT8, por lo que no puede garantizarse que la versión cuantizada preserve el comportamiento del modelo original.
- La cuantización dinámica INT8 sin calibración puede degradar la precisión de forma no medida, especialmente en tareas sensibles a valores numéricos.
- Capacidades multilingües no especificadas: no se confirma qué idiomas cubre el modelo en este export.
- Longitud de contexto no declarada en el repositorio: debe verificarse en la documentación del modelo base antes de asumir ventanas largas.
- Riesgo de alucinación inherente a los modelos de lenguaje de esta escala, agravado por su reducido tamaño de parámetros.
- Licencia marcada como `other`: aunque el modelo base es Apache 2.0, conviene revisar los términos exactos aplicables a la exportación antes de un uso comercial.
- Cero descargas y cero valoraciones en el momento de la consulta: la exportación no cuenta con validación por parte de la comunidad.
- Requiere gestionar manualmente las entradas de past-key-value si se usa el grafo ONNX directamente, sin el wrapper de `optimum`.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/liodon-ai/Qwen3-0.6B-Base-ONNX
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Autor de la exportación: https://huggingface.co/liodon-ai
- Librería optimum (usada para la exportación): https://github.com/huggingface/optimum
- ONNX Runtime: https://github.com/microsoft/onnxruntime
