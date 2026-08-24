# mradermacher/Qwen3.8-20B-Minitron-i1-GGUF

## Resumen

El modelo Qwen3.8-20B-Minitron-i1-GGUF es una versión cuantizada en formato GGUF del modelo podado Qwen3.8-20B-Minitron, desarrollado por el equipo de exnivo y cuantizado por mradermacher. Este modelo surge de aplicar técnicas de poda estructurada y destilación de conocimiento a la serie Qwen3.8 de Alibaba, reduciendo el tamaño original de la familia Qwen3.8 a 20 mil millones de parámetros, con el objetivo de obtener un modelo más eficiente en memoria y cómputo sin sacrificar demasiado rendimiento.

El interés de este modelo radica en su licencia Apache 2.0, que permite uso comercial sin restricciones, y en que su cuantización GGUF facilita su despliegue en entornos locales con recursos limitados, como portátiles o servidores con GPUs de consumo. Al ser una versión imatrix (importancia matrix), la calidad de las cuantizaciones está optimizada para minimizar la pérdida de precisión. Aunque no se han publicado datos oficiales de arquitectura o entrenamiento, se sabe que hereda las capacidades de razonamiento y generación de texto de la familia Qwen3.8.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.8, con poda estructurada y destilación) |
| Parametros totales | 19.285.624.544 (~19.3 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF con imatrix: Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, IQ1, IQ2, IQ3, IQ4, etc. (ver listado en el repositorio) |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-20B-Minitron es un transformer de la familia Qwen3.8, que fue podado mediante técnicas de poda estructurada (structured pruning) para reducir su tamaño desde una versión más grande (posiblemente 32B o más) hasta 20B parámetros. Posteriormente se aplicó destilación de conocimiento para recuperar parte del rendimiento perdido. El repositorio de cuantización no proporciona detalles adicionales sobre la arquitectura interna (número de capas, dimensiones de atención, etc.), ni sobre el dataset de entrenamiento o el proceso de fine-tuning.

La cuantización fue realizada por mradermacher usando el algoritmo imatrix (importance matrix) que asigna más precisión a los pesos más importantes, mejorando la calidad de las cuantizaciones de baja precisión. Los archivos GGUF resultantes son compatibles con llama.cpp y otros motores que soporten este formato.

## Capacidades

- Generación de texto en inglés: capaz de producir respuestas coherentes y contextualizadas.
- Razonamiento y resolución de problemas: heredado de la familia Qwen3.8, aunque la poda puede reducir la precisión en tareas complejas.
- Soporte de tool calling / function calling: no confirmado en la información disponible; es probable que lo tenga si el modelo base lo implementa, pero no se puede asegurar.
- Soporte de agentes y multi-step reasoning: no disponible en la documentación del repositorio.
- Capacidades multilingües: solo inglés declarado en la model card, aunque Qwen3.8 soporta múltiples idiomas; en esta versión podada no se especifica.
- Capacidades de visión: la model card menciona que es un "vision model" y que los archivos mmproj están en el repositorio estático, lo que sugiere que el modelo puede procesar imágenes, aunque no se detalla su funcionamiento.

## Casos de uso

- Despliegue local en equipos sin GPU dedicada: gracias a las cuantizaciones GGUF, se puede ejecutar en CPU con llama.cpp o en GPUs con 8-12 GB de VRAM (para Q4_K_M). Es adecuado para aplicaciones de chat o asistencia personal sin conexión.
- Prototipado rápido en investigación: al ser un modelo de 20B con licencia Apache 2.0, permite experimentar con técnicas de prompting, fine-tuning o integración en aplicaciones de NLP sin costes de licencia.
- Generación de contenido en inglés: escribir borradores, resumir textos, traducir (aunque solo declarado para inglés), o generar documentación técnica en entornos de producción.
- Asistente de código en entornos con recursos limitados: si el modelo conserva habilidades de programación de Qwen3.8, puede usarse para autocompletado o generación de código en IDEs locales, especialmente con cuantizaciones Q5 o Q6.
- Chat de atención al cliente en inglés: con una ventana de contexto adecuada (no confirmada), puede gestionar conversaciones multi-turno. Requiere verificar el contexto real del modelo.
- Evaluación de modelos podados: sirve como referencia para estudiar el impacto de la poda y destilación en la calidad del modelo, comparando con la versión no podada de Qwen3.8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para este modelo específico. La ausencia de datos oficiales impide comparar su rendimiento con otros modelos de forma objetiva.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~7-8 GB (puede caber en GPUs con 8 GB)
  - Q4_K_M: ~12-13 GB (recomendado para RTX 3060 12GB o superior)
  - Q6_K: ~18 GB (para RTX 3090 o A5000)
  - Q8_0: ~21 GB (para A100 o RTX 4090)
- GPU recomendadas: RTX 3060 (12 GB) para Q4, RTX 3090/4090 para Q5/Q6, A100/H100 para uso en servidor.
- Si cabe en consumer GPU: sí, las cuantizaciones Q2 y Q3 pueden ejecutarse en GPUs de 8 GB (como RTX 2060), aunque con menor calidad.
- Opciones de despliegue: llama.cpp (CPU y GPU), Ollama (con contenedores), TGI (si se convierte a safetensors), vLLM (solo con pesos no GGUF, pero se puede convertir). También se puede usar con llama-cpp-python para integración en Python.
- Latencia y throughput: no disponible. Se estima que en una RTX 4090 con Q4_K_M se pueden generar unos 20-30 tokens/s, pero no hay datos confirmados.

## Comparativa con modelos similares

No hay información suficiente para comparar con otros modelos de la misma categoría. El único punto de referencia es el modelo original Qwen3.8-20B-Minitron (sin cuantizar), que probablemente ofrece mejor calidad pero requiere más VRAM (39.6 GB según LLM Explorer). No se dispone de datos de otros modelos podados de 20B similares en el mercado.

## Limitaciones y advertencias

- Idioma: la model card indica solo inglés, por lo que el rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en temas poco representados en su entrenamiento.
- Sesgos: al ser un modelo de la familia Qwen, puede heredar sesgos de los datos de entrenamiento originales (sesgos culturales, de género, etc.).
- Limitaciones de contexto: no se conoce la longitud máxima de contexto; si es menor que la de Qwen3.8 original, podría fallar en tareas de razonamiento de larga distancia.
- Calidad de la poda: la compresión puede degradar el rendimiento en tareas complejas como matemáticas o razonamiento lógico en comparación con el modelo sin podar.
- Uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones, pero es recomendable revisar los términos de la licencia del modelo base (Qwen3.8) por si hay condiciones adicionales.
- Dependencia de GGUF: para usar el modelo se necesita un motor que soporte GGUF (llama.cpp, Ollama, etc.), y no es directamente compatible con frameworks como PyTorch sin conversión.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/mradermacher/Qwen3.8-20B-Minitron-i1-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/exnivo/Qwen3.8-20B-Minitron
- Repositorio de quants estáticos: https://huggingface.co/mradermacher/Qwen3.8-20B-Minitron-GGUF
- GitHub oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Página del proyecto Qwen3.8 en OpenLM.ai: https://openlm.ai/qwen3.8/
