# liodon-ai/OLMo-2-0425-1B-ONNX

## Resumen

OLMo-2-0425-1B-ONNX es una exportación al formato ONNX del modelo de lenguaje OLMo-2-0425-1B, desarrollado por el Allen Institute for AI (AI2) y publicado por Liodon AI. El objetivo de esta conversión es facilitar la inferencia del modelo en entornos que usan ONNX Runtime, como aplicaciones en producción, dispositivos edge o plataformas que no soportan directamente PyTorch. El repositorio incluye tres variantes del mismo modelo: una en precisión FP32, otra en FP16 y una cuantizada dinámicamente a INT8, lo que permite elegir entre máxima precisión o menor uso de memoria y mayor velocidad.

El modelo base, OLMo-2-0425-1B, pertenece a la familia OLMo 2 de AI2, diseñada para investigación abierta y democratización del acceso a modelos de lenguaje. Con aproximadamente 1.000 millones de parámetros, es un modelo compacto pensado para tareas de generación de texto y para servir como base de fine-tuning. La exportación ONNX conserva la arquitectura original e incorpora soporte para caché de claves y valores (KV-cache) en la decodificación autorregresiva, lo que mejora la eficiencia en generación de secuencias largas.

Esta ficha se centra en la versión ONNX, pero las especificaciones técnicas del modelo base (arquitectura, contexto, idiomas, etc.) no están detalladas en la información proporcionada, por lo que se indicarán como no disponibles cuando corresponda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base OLMo-2-0425-1B de AI2) |
| Parametros totales | 1B (según nombre del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32, FP16, INT8 dinámico (weight-only, sin calibración) |
| Idiomas soportados | no disponible |
| Licencia | other (ver modelo base) |
| Formato de pesos | ONNX (archivos .onnx) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base OLMo-2-0425-1B. Se sabe que pertenece a la familia OLMo 2 de AI2, que son modelos transformer causales de código abierto, pero no se especifican el número de capas, dimensiones de atención ni otros hiperparámetros. El proceso de entrenamiento del modelo base tampoco está documentado en esta ficha; AI2 publica los detalles de datos y metodología en su repositorio oficial, pero no se han incluido aquí.

La exportación ONNX se realizó con la herramienta `optimum` de Hugging Face, utilizando la tarea `text-generation-with-past`. Esto significa que el grafo ONNX expone entradas y salidas para las claves y valores de atención (past-key-values), permitiendo la decodificación autorregresiva con caché. No se aplicó ninguna modificación adicional a los pesos; la cuantización INT8 es dinámica y solo afecta a los pesos, sin calibración previa.

## Capacidades

- Generación de texto: el modelo es capaz de producir texto coherente en tareas de lenguaje natural, aunque al ser un modelo base (no instruct) no está optimizado para seguir instrucciones conversacionales.
- Fine-tuning: al ser un modelo base, puede utilizarse como punto de partida para ajuste fino en tareas específicas como clasificación, generación de resúmenes o extracción de información.
- Inferencia eficiente: gracias a la exportación ONNX y a las variantes FP16 e INT8, puede ejecutarse en entornos con recursos limitados, como CPUs o GPUs de gama baja.
- Soporte de KV-cache: el grafo ONNX incluye entradas/salidas para past-key-values, lo que permite una decodificación más rápida en generación de secuencias largas.
- No se especifican capacidades adicionales como tool calling, agentes, visión o audio.

## Casos de uso

- Inferencia en producción con ONNX Runtime: el modelo puede integrarse en servicios que usan ONNX Runtime como motor de inferencia, aprovechando la optimización para CPUs y GPUs. La variante INT8 es adecuada para despliegues en CPU con baja latencia.
- Fine-tuning para tareas específicas: al ser un modelo base de 1B, puede ajustarse con datasets propios para tareas como análisis de sentimiento, clasificación de documentos o generación de respuestas en dominios concretos.
- Prototipado rápido en entornos sin GPU: la versión FP32 o INT8 puede ejecutarse en CPU, permitiendo a desarrolladores validar ideas sin necesidad de hardware especializado.
- Aplicaciones edge o embebidas: el tamaño reducido del modelo cuantizado (1.49 GB) lo hace viable para dispositivos con memoria limitada, como Raspberry Pi o sistemas de borde.
- Investigación académica: al ser un modelo abierto, puede usarse para estudiar el comportamiento de modelos pequeños, sesgos o técnicas de interpretabilidad.
- Generación de texto en aplicaciones de bajo coste: para tareas donde no se requiere una calidad de nivel GPT-4, el modelo ofrece un equilibrio entre rendimiento y consumo de recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo o su versión base.

## Requisitos de hardware

- VRAM estimada para inferencia: según el archivo ONNX, la versión FP32 requiere aproximadamente 6 GB de memoria (5.94 GB de pesos), la FP16 unos 3.1 GB y la INT8 unos 1.5 GB. A esto hay que sumar memoria para activaciones y KV-cache, por lo que se recomienda al menos 8 GB para FP32, 4 GB para FP16 y 2 GB para INT8 en GPU.
- GPUs recomendadas: para FP32, una GPU con 8 GB o más (por ejemplo, RTX 3060, RTX 2070, A10). Para FP16, GPUs con 4 GB o más (RTX 3050, GTX 1660 Ti). Para INT8, incluso GPUs integradas o CPUs pueden ser suficientes.
- En CPU: la versión INT8 puede ejecutarse en CPUs modernas con soporte AVX2, aunque la velocidad será menor que en GPU.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider, CUDAExecutionProvider, TensorRTExecutionProvider), así como la integración con `optimum.onnxruntime.ORTModelForCausalLM` de Hugging Face.
- Latencia y throughput: no se proporcionan datos específicos. En general, un modelo de 1B en FP16 en una GPU moderna puede generar decenas de tokens por segundo, pero depende del hardware y de la longitud de la secuencia.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría. El modelo base OLMo-2-0425-1B es un LLM de 1B parámetros, similar en tamaño a otros como TinyLlama-1.1B o Qwen2-0.5B, pero no se han encontrado datos de rendimiento comparativos en la información proporcionada. Se recomienda consultar el repositorio oficial de OLMo 2 para obtener benchmarks del modelo base.

## Limitaciones y advertencias

- Al ser un modelo de 1B, su capacidad de razonamiento y conocimiento es limitada en comparación con modelos más grandes. Puede producir respuestas incoherentes o incorrectas en tareas complejas.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en temas especializados.
- Sesgos: el modelo puede reflejar sesgos presentes en sus datos de entrenamiento, aunque no se han documentado estudios específicos para esta versión.
- Licencia "other": la licencia no es una licencia estándar como Apache 2.0 o MIT. Se debe revisar la licencia del modelo base (allenai/OLMo-2-0425-1B) para conocer las restricciones de uso comercial y redistribución.
- La cuantización INT8 dinámica puede degradar ligeramente la calidad de las predicciones en comparación con FP32, aunque no se han cuantificado las diferencias.
- No se garantiza soporte para todos los idiomas; la información sobre idiomas no está disponible.
- Para uso en producción, se recomienda validar el modelo con datos propios y considerar la posibilidad de usar la versión instruct (OLMo-2-0425-1B-Instruct) si se necesita seguir instrucciones.

## Enlaces

- Repositorio HuggingFace del modelo ONNX: https://huggingface.co/liodon-ai/OLMo-2-0425-1B-ONNX
- Modelo base en HuggingFace: https://huggingface.co/allenai/OLMo-2-0425-1B
- Modelo instruct en HuggingFace: https://huggingface.co/allenai/OLMo-2-0425-1B-Instruct
- Repositorio GitHub de OLMo: https://github.com/allenai/OLMo
- Página oficial de OLMo 2: https://allenai.org/olmo2
