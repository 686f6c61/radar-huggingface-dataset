# RemySkye/rwkv7-g1i-1.5B-i1-GGUF

## Resumen

El modelo `RemySkye/rwkv7-g1i-1.5B-i1-GGUF` es una cuantización en formato GGUF del modelo base `BlinkDL/rwkv7-g1`, un modelo de lenguaje de 1.527.799.808 parámetros (~1.5B) desarrollado originalmente por BlinkDL. La cuantización ha sido realizada por RemySkye utilizando la librería llama.cpp, con calibración mediante imatrix sobre el dataset `lemon07r/bartowski-imatrix-v5-semantic`. El objetivo de esta publicación es ofrecer versiones optimizadas del modelo para su ejecución en entornos con recursos limitados, como CPU o GPUs de baja capacidad, mediante el formato GGUF ampliamente soportado por herramientas como llama.cpp, Ollama o LM Studio.

El modelo base pertenece a la familia RWKV-7, conocida por su arquitectura híbrida que combina características de redes recurrentes y transformers, aunque en la información proporcionada no se detallan las especificaciones técnicas del modelo original. La cuantización GGUF permite reducir el tamaño del modelo y acelerar la inferencia, manteniendo un equilibrio entre calidad y rendimiento. Aunque la ficha no incluye datos de rendimiento ni benchmarks, la disponibilidad de múltiples niveles de cuantización (Q3, Q4, Q5) ofrece flexibilidad para diferentes requisitos de memoria y velocidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: RWKV-7, sin detalles) |
| Parametros totales | 1.527.799.808 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 16384 (inferido del nombre del archivo fuente `rwkv7-g1i-1.5b-20260805-ctx16384.pth`) |
| Tipos de cuantizacion | Q3_K_L/M/S, Q4_K_M, Q5_K_M/S (según la model card; puede haber más) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo original) |

## Arquitectura y entrenamiento

La información proporcionada no incluye detalles sobre la arquitectura interna del modelo base `BlinkDL/rwkv7-g1` ni sobre su proceso de entrenamiento (datos, número de tokens, técnicas de alineación, etc.). Se sabe que es un modelo de 1.5B parámetros con una longitud de contexto de 16384 tokens, según el nombre del archivo fuente. La cuantización GGUF fue generada con llama.cpp (revisión `c92e806d1c81091c9035edce99c35374da1b465e`) y el convertidor de RWKV (revisión `ebfb744281c31a07aad5606ec7473f79f837e92a`). Se utilizó calibración imatrix con contexto de 512 tokens sobre el dataset `lemon07r/bartowski-imatrix-v5-semantic`. Para algunas cuantizaciones (Q3_K_L/M/S, Q4_K_M, Q5_K_M/S) se emplearon mapas de tensores personalizados específicos de RWKV.

## Capacidades

No se especifican capacidades concretas en la información disponible. Al ser un modelo de generación de texto, se espera que pueda realizar tareas típicas de un LLM (generación de texto, completado, chat, etc.), pero no se detallan características como tool calling, razonamiento multi-paso, soporte multilingüe o capacidades multimodales. La ficha se limita a indicar que el pipeline es `text-generation`.

## Casos de uso

No se proporcionan casos de uso específicos en la información disponible. Dado que se trata de un modelo de 1.5B parámetros cuantizado a GGUF, podría emplearse en entornos con recursos limitados (por ejemplo, inferencia local en CPU o GPU de baja gama), pero no hay ejemplos concretos documentados por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se proporcionan requisitos de hardware específicos en la información disponible. Como referencia general, un modelo de 1.5B parámetros cuantizado a 4 bits ocupa aproximadamente 1 GB de memoria, lo que permitiría su ejecución en GPUs con 2-4 GB de VRAM o incluso en CPU con suficiente RAM, pero estos valores son estimaciones orientativas y no están confirmados por el autor.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se puede establecer una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- No se especifican limitaciones concretas en la model card.
- Al ser una cuantización, es probable que exista una ligera degradación en la calidad de las respuestas respecto al modelo original en BF16, especialmente en cuantizaciones más agresivas (Q3).
- La licencia Apache-2.0 permite uso comercial y modificación, pero se recomienda revisar los términos completos.
- No se documentan sesgos, riesgos de alucinación o restricciones idiomáticas.
- Para uso en producción, se recomienda validar el comportamiento del modelo en el dominio específico antes de desplegarlo.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/RemySkye/rwkv7-g1i-1.5B-i1-GGUF
- Modelo base (BlinkDL/rwkv7-g1): https://huggingface.co/BlinkDL/rwkv7-g1
- Dataset de calibración: https://huggingface.co/datasets/lemon07r/bartowski-imatrix-v5-semantic
