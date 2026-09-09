# mradermacher/OxCoder-9B-i1-GGUF

## Resumen

Esta ficha describe el repositorio `mradermacher/OxCoder-9B-i1-GGUF`, que contiene una serie de cuantizaciones GGUF del modelo base `OrionLLM/OxCoder-9B`. La versión cuantizada ha sido generada por el usuario `mradermacher` utilizando la técnica de importance matrix (imatrix), que pondera los pesos según la activación para preservar la calidad en niveles de compresión bajos. El modelo base tiene aproximadamente 8.953.803.264 parámetros (unos 9.000 millones) y se distribuye bajo licencia Apache-2.0.

El repositorio está pensado para facilitar la ejecución local del modelo en hardware de consumo, ofreciendo múltiples niveles de cuantización que van desde apenas 3 GB (IQ1_M) hasta 7,5 GB (Q6_K). En la model card del autor de la cuantización se indica que se trata de un modelo con capacidades de visión, aunque no se aportan detalles técnicos adicionales en la información disponible. El nombre "OxCoder" sugiere una orientación a tareas de código, pero esto no está confirmado en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 8.953.803.264 (aproximadamente 9.000 millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix: IQ1_M, IQ2_XXS, IQ2_XS, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, IQ4_NL, Q4_K_M, Q6_K |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF; el modelo base utiliza safetensors en OrionLLM/OxCoder-9B |

## Arquitectura y entrenamiento

El repositorio no contiene el modelo original, sino una colección de archivos GGUF generados a partir del modelo base `OrionLLM/OxCoder-9B`. La técnica de cuantización aplicada es la de "weighted imatrix", que utiliza la matriz de importancia calculada sobre un conjunto de datos de calibración para asignar una precision superior a los pesos más relevantes durante la compresión. En el repositorio se incluye un archivo `imatrix` (0,1 GB) que puede emplearse para crear nuevas cuantizaciones personalizadas.

No se dispone de información detallada sobre la arquitectura exacta del modelo base, su proceso de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El autor de la cuantización menciona que se trata de un modelo de visión, y el nombre "OxCoder" apunta a una posible orientación en tareas de generación y comprensión de código, pero no hay documentación en esta ficha que lo confirme. Para más detalles sobre el modelo base es necesario consultar el repositorio origina.

## Capacidades

- Ejecución local mediante motores compatibles con GGUF, como llama.cpp, Ollama y LM Studio.
- Modalidad de visión indicada en la model card del autor de la cuantización, aunque no se detallan los tipos de entrada ni las tareas específicas.
- Etiqueta "conversational" en Hugging Face, lo que sugiere aptitud para el diálogo multi-turno, aunque no se especifica el rendimiento en esa tarea.
- Idioma inglés como soporte declarado en las etiquetas del repositorio.
- No se ha confirmado soporte de tool calling, function calling, agentes autónomos ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Asistente de código en local: gracias a su tamaño de aproximadamente 9B y a la cuantización Q4_K_M (5,7 GB), puede ejecutarse en una GPU de consumo para autocompletar o explicar fragmentos de código en un entorno de desarrollo personal.
- Prototipado de aplicaciones de escritorio: con llama.cpp se puede integrar en una interfaz ligera para codewhisper o tareas de análisis estático en proyectos privados.
- Análisis de imágenes en entornos con pocos recursos: si se confirma la capacidad de visión, los quants de menor tamaño (alrededor de 3-4 GB) podrían usarse para OCR básico o clasificación de imágenes en dispositivos edge.
- Despliegue en servidores CPU ligeros: las versiones Q3_K_M (4,7 GB) y Q4_K_S (5,5 GB) pueden servirse en CPUs con 16-32 GB de RAM, aprovechando la cuantización para reducir latencia y memoria.
- Personalización de cuantizaciones: el archivo imatrix incluido permite generar nuevas cuantizaciones adaptadas a un dataset propio, lo que resulta útil en proyectos donde se necesita una compresión específica manteniendo la calidad en el dominio de interés.
- Experimentación docente: al estar bajo licencia Apache-2.0, puede utilizarse en cursos o talleres sobre LLMs cuantizados y despliegue local sin coste de licencia, siempre que se respeten los avisos de copyright.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M ocupa 5,7 GB, por lo que se recomienda una GPU con al menos 8 GB de VRAM para inferencia en GPU. Las versiones Q6_K (7,5 GB) necesitan entre 8 y 10 GB. Los quants Q3 e inferiores (3-4,5 GB) pueden ejecutarse en GPUs de 6 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 o cualquier GPU NVIDIA con al menos 8 GB de VRAM para el quant Q4_K_M. Alternativamente, puede ejecutarse en CPU si se dispone de suficiente RAM (16-32 GB).
- Ejecución en GPU de consumo: sí, especialmente las versiones Q3 y Q4 pueden utilizarse en hardware doméstico con riesgo de VRAM bajo control.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y las bindings de Python como llama-cpp-python. No se recomienda vLLM para archivos GGUF, ya que este motor espera pesos en safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. El repositorio no proporciona información comparativa con otros modelos de la misma categoría. Para una comparación adecuada sería necesario consultar los benchmarks del modelo base en el repositorio original de OrionLLM.

## Limitaciones y advertencias

- El idioma soportado es únicamente inglés; no es un modelo multilingüe.
- La model card no incluye información sobre sesgos, riesgos de alucinación ni comportamientos no deseados del modelo base.
- Las cuantizaciones extremadamente bajas como IQ1_M, IQ2_XXS, Q2_K_S y Q2_K degradan significativamente la calidad; el propio autor las califica de "desperate" o "very low quality". Para uso general se recomienda el quant Q4_K_M, marcado como "fast, recommended".
- Al ser una cuantización no oficial, no hay garantías de mantenimiento ni soporte por parte del creador del modelo original.
- La licencia Apache-2.0 permite uso comercial, pero es necesario verificar que la licencia del modelo base tenga los mismos términos y que se cumplan los requisitos de atribución.

## Enlaces

- Repositorio GGUF con imatrix: https://huggingface.co/mradermacher/OxCoder-9B-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/OxCoder-9B-GGUF
- Modelo base (referenciado): https://huggingface.co/OrionLLM/OxCoder-9B
