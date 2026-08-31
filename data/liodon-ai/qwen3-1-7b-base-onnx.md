# liodon-ai/Qwen3-1.7B-Base-ONNX

## Resumen

El modelo `liodon-ai/Qwen3-1.7B-Base-ONNX` es una exportación al formato ONNX del modelo base Qwen3-1.7B-Base, desarrollado originalmente por el equipo Qwen de Alibaba. La conversión ha sido realizada por Liodon AI utilizando la librería `optimum` de Hugging Face, con la tarea `text-generation-with-past`, lo que permite el uso de caché de claves y valores (KV-cache) para una decodificación autorregresiva eficiente.

Esta versión ONNX incluye tres variantes de precisión: FP32 (8,13 GB), FP16 (4,30 GB) e INT8 dinámico (2,03 GB), lo que facilita su despliegue en entornos donde no se dispone de PyTorch o donde se requiere una ejecución optimizada mediante ONNX Runtime, tanto en CPU como en GPU. Al tratarse de un modelo base (no instructivo), su uso principal es la generación de texto y el ajuste fino posterior para tareas específicas.

La relevancia de esta exportación radica en la interoperabilidad: permite integrar el modelo en aplicaciones que ya utilizan ONNX como formato estándar, con la posibilidad de elegir entre precisión completa o cuantización para reducir el uso de memoria. No se trata de un modelo reentrenado, sino de una conversión fiel del original, por lo que sus capacidades son las mismas que las de Qwen3-1.7B-Base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Qwen3) |
| Parametros totales | 1,7 mil millones (1.7B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32, FP16, INT8 dinamico (solo pesos) |
| Idiomas soportados | no disponible |
| Licencia | other (ver modelo base Qwen3) |
| Formato de pesos | ONNX (archivos .onnx) |

## Arquitectura y entrenamiento

El modelo es una conversión directa del checkpoint original `Qwen/Qwen3-1.7B-Base`, que emplea una arquitectura transformer densa con normalización de capas, atención multi-cabeza y alimentación hacia adelante. La exportación se realizó con `optimum.exporters.onnx.main_export` para la tarea `text-generation-with-past`, lo que implica que el grafo ONNX expone entradas y salidas de past-key-values para permitir el uso de caché KV durante la decodificación autoregresiva.

No se ha realizado ningún entrenamiento adicional; el proceso se limita a la conversión de pesos y a la cuantización dinámica INT8 (solo pesos, sin calibración) en una de las variantes. El modelo original Qwen3-1.7B-Base fue preentrenado por el equipo Qwen con un corpus masivo multilingüe y optimizado mediante técnicas de aprendizaje supervisado y refuerzo, aunque estos detalles no se especifican en la información de esta exportación.

## Capacidades

- Generación de texto general: al ser un modelo base, puede producir texto coherente y completar secuencias, aunque no está afinado para seguir instrucciones conversacionales.
- Razonamiento y comprensión del lenguaje: hereda las capacidades del modelo original Qwen3 de 1.7B, que incluyen razonamiento básico, matemáticas y comprensión lectora.
- Soporte multilingüe: el modelo base Qwen3 es multilingüe, pero esta exportación no detalla los idiomas específicos.
- Sin tool calling ni capacidades de agente: al no ser una versión instructiva, no incluye funciones de llamada a herramientas ni razonamiento multi-paso guiado.
- Sin modo de pensamiento (thinking mode): Qwen3-1.7B-Base no incorpora el modo de razonamiento explícito que sí tienen las versiones instructivas de Qwen3.
- Ejecución en múltiples plataformas: gracias al formato ONNX, puede ejecutarse en CPU, GPU y otros dispositivos que soporten ONNX Runtime, con las tres precisiones disponibles.

## Casos de uso

- Inferencia en entornos con restricciones de dependencias: al ser un archivo ONNX autocontenido, se puede integrar en aplicaciones que no desean instalar PyTorch, usando únicamente `onnxruntime` y `transformers` para el tokenizador.
- Despliegue en CPU con cuantización INT8: la variante de 2,03 GB permite ejecutar el modelo en servidores sin GPU, con una huella de memoria reducida, adecuada para pruebas o servicios de baja latencia.
- Prototipado rápido de generación de texto: desarrolladores pueden cargar el modelo con `ORTModelForCausalLM` de `optimum.onnxruntime` y obtener respuestas de texto sin necesidad de configurar un entorno complejo.
- Ajuste fino posterior: aunque esta exportación no está pensada para entrenamiento, sirve como referencia para validar que la conversión ONNX mantiene la fidelidad del modelo original antes de un fine-tuning en otro formato.
- Evaluación de calidad de cuantización: la comparación entre las versiones FP32, FP16 e INT8 permite medir el impacto de la cuantización en tareas específicas de generación.
- Integración en pipelines de ONNX Runtime: aplicaciones que ya usan ONNX para otros modelos pueden incorporar este generador de texto sin cambiar de framework, aprovechando la caché KV para acelerar la inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para esta exportación ONNX. Se recomienda consultar el modelo base original para conocer el rendimiento teórico de Qwen3-1.7B.

## Requisitos de hardware

- VRAM estimada para inferencia: según la precisión elegida, los pesos ocupan 8,13 GB (FP32), 4,30 GB (FP16) o 2,03 GB (INT8). Además hay que añadir memoria para activaciones y caché KV, por lo que se recomienda al menos 6 GB de VRAM para FP16 y 3 GB para INT8 en GPU.
- GPU recomendadas: para FP16, una GPU con 6-8 GB (por ejemplo, RTX 3060, RTX 4060, GTX 1660 Super) es suficiente. Para INT8, una GPU de 4 GB (GTX 1650, RTX 3050) puede bastar. En CPU, el modelo INT8 puede ejecutarse en sistemas con 4-8 GB de RAM.
- Compatibilidad con GPU de consumo: sí, las versiones FP16 e INT8 caben en GPUs de gama media actuales.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), `optimum.onnxruntime` como wrapper, y cualquier framework que acepte modelos ONNX (por ejemplo, Windows ML).
- Latencia y throughput: no se proporcionan datos medidos. La velocidad dependerá del hardware y de la precisión; la versión INT8 será más rápida que FP16 en CPU, y FP16 más rápida que FP32 en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Qwen3-1.7B-Base (original) | 1.7B | 32K (según documentación oficial) | Apache 2.0 | PyTorch |
| liodon-ai/Qwen3-1.7B-Base-ONNX | 1.7B | no disponible | other | ONNX |
| liodon-ai/Qwen3-1.7B-Base-FP8 | 1.7B | no disponible | other | ONNX FP8 |

No se dispone de datos de rendimiento comparativos. La principal diferencia entre estas variantes es el formato y la precisión; el modelo original en PyTorch es el punto de referencia, mientras que las exportaciones ONNX ofrecen ventajas de despliegue a costa de posibles pequeñas pérdidas de precisión en las versiones cuantizadas.

## Limitaciones y advertencias

- La licencia se indica como "other" en la model card; es necesario revisar la licencia del modelo base Qwen3 para determinar si permite uso comercial y en qué condiciones.
- Al ser una exportación ONNX, puede haber ligeras diferencias numéricas respecto al modelo original, especialmente en la versión INT8 dinámica, que no utiliza calibración y puede degradar la calidad en tareas sensibles.
- No se especifica la longitud de contexto soportada en esta exportación; es posible que la conversión no haya preservado el límite original de 32K tokens del modelo Qwen3-1.7B, por lo que se recomienda probar con secuencias largas antes de usarla en producción.
- No se proporcionan idiomas soportados; aunque el modelo base es multilingüe, esta exportación no detalla qué idiomas están cubiertos.
- El modelo es una versión base, no instructiva, por lo que no debe usarse directamente para tareas de chat o seguimiento de instrucciones sin un fine-tuning previo.
- Riesgo de alucinación y sesgos: como todo modelo de lenguaje, puede generar contenido falso o sesgado; al ser una versión base, no se han aplicado los mecanismos de seguridad de las versiones instructivas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/liodon-ai/Qwen3-1.7B-Base-ONNX
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Sitio web de Liodon AI: https://liodon.ai/
- Página del modelo en Ollama: https://ollama.com/library/qwen3:1.7b
