# ggbetz/SmolLM3-3B-it-SFT

## Resumen

El modelo `ggbetz/SmolLM3-3B-it-SFT` es un espejo (mirror) del checkpoint `it-SFT` del modelo SmolLM3-3B desarrollado por Hugging Face. Este repositorio republica los pesos sin modificar en la rama `main` para facilitar su descarga con herramientas que resuelven identificadores de repositorio sin especificar revisión. El modelo original, SmolLM3-3B, es un modelo de lenguaje pequeño de 3 mil millones de parámetros, diseñado para ofrecer un rendimiento competitivo en tareas de razonamiento, código y generación de texto, superando según fuentes a alternativas como Llama-3.2-3B y Qwen2.5-3B, y compitiendo con modelos de 4B como Qwen3 y Gemma3.

Este checkpoint concreto corresponde a una etapa de fine-tuning supervisado (SFT) sobre el modelo base, lo que lo hace adecuado para tareas de instrucción y diálogo. Al ser un mirror, no introduce cambios técnicos respecto al original, pero facilita el acceso a los pesos en un formato estable. La licencia Apache-2.0 permite uso comercial y modificación sin restricciones significativas, lo que lo convierte en una opción atractiva para integraciones en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (no especificada en detalle) |
| Parametros totales | 3.075.098.624 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos originales en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base SmolLM3-3B es un transformer decoder-only, aunque la información proporcionada no detalla la arquitectura interna (número de capas, cabezas de atención, etc.). El checkpoint `it-SFT` se obtiene mediante fine-tuning supervisado sobre el modelo base, utilizando probablemente datasets de instrucciones y diálogo, aunque no se especifican los datos exactos ni el número de tokens de entrenamiento. El proceso de SFT se realiza con la técnica estándar de cross-entropy loss a nivel de token, como se describe en el curso oficial de Hugging Face. No se menciona el uso de RLHF o DPO en esta etapa.

Al ser un mirror, los pesos son idénticos a los del checkpoint oficial, por lo que no hay innovaciones técnicas adicionales en este repositorio. El modelo original, según el artículo de Zhihu, emplea un enfoque de entrenamiento con datos públicos y un framework propio de Hugging Face, pero los detalles específicos no están disponibles en la información recopilada.

## Capacidades

- Generación de texto: el modelo es capaz de producir texto coherente y contextualizado en tareas de instrucción y diálogo, gracias al fine-tuning SFT.
- Razonamiento y matemáticas: según el artículo de Zhihu, SmolLM3-3B supera a Llama-3.2-3B y Qwen2.5-3B en benchmarks generales, lo que sugiere capacidades sólidas en razonamiento y matemáticas, aunque no se proporcionan cifras concretas.
- Generación de código: se espera que el modelo maneje tareas de programación, aunque no hay datos específicos en la información disponible.
- Soporte multilingüe: no se especifican idiomas, pero al ser un modelo entrenado con datos públicos, probablemente cubre varios idiomas, sin confirmación.
- Tool calling y agentes: no se menciona soporte explícito para function calling o uso de herramientas en la información disponible.
- Modo de pensamiento (thinking mode): no se indica ninguna capacidad especial de razonamiento extendido.

## Casos de uso

- Asistentes conversacionales ligeros: al ser un modelo de 3B, puede desplegarse en entornos con recursos limitados, como chatbots en aplicaciones móviles o edge devices, gestionando conversaciones multi-turno con instrucciones claras.
- Generación de código en entornos de desarrollo: aunque no se confirma tool calling, el modelo puede usarse para autocompletar fragmentos de código o generar scripts simples, integrándose en IDEs o pipelines de CI/CD.
- Clasificación y extracción de información: mediante fine-tuning adicional, el modelo puede adaptarse a tareas de clasificación de texto, extracción de entidades o resumen, gracias a su tamaño manejable.
- Prototipado rápido de aplicaciones NLP: su licencia Apache-2.0 y su tamaño permiten experimentar sin costes elevados, ideal para validar ideas antes de escalar a modelos mayores.
- Educación y aprendizaje automático: sirve como modelo de referencia para estudiar técnicas de SFT y comparar rendimiento con otros modelos pequeños, como se hace en el curso de Hugging Face.
- Despliegue en entornos con restricciones de hardware: con cuantización (no incluida en el repo, pero posible con herramientas externas), puede ejecutarse en GPUs de consumo como RTX 3060 o incluso en CPU con llama.cpp, aunque no hay datos oficiales de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo de Zhihu menciona que SmolLM3-3B supera a Llama-3.2-3B y Qwen2.5-3B, y compite con Qwen3 y Gemma3 de 4B, pero no se proporcionan cifras concretas. Por tanto, no es posible presentar una tabla comparativa con datos verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 3B en FP16, se requieren aproximadamente 6 GB de VRAM (considerando pesos y overhead). Con cuantización de 4 bits, podría reducirse a unos 2-3 GB, aunque no se ofrecen cuantizaciones en el repositorio.
- GPU recomendadas: una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) es suficiente para FP16. Para cuantización, una GPU de 4-6 GB podría bastar.
- Compatibilidad con consumer GPU: sí, es viable en GPUs de consumo modernas, especialmente con cuantización.
- Opciones de despliegue: al ser un modelo estándar de Hugging Face, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. No se incluyen archivos GGUF en el repo.
- Latencia y throughput: no se dispone de datos medidos. En una GPU como RTX 4090, se espera una latencia de decenas de milisegundos por token, pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolLM3-3B (este) | 3.075M | no disponible | Apache-2.0 | Hugging Face, ModelScope |
| Llama-3.2-3B | 3.2B | 128K (según documentación oficial) | Llama 3.2 Community License | Hugging Face |
| Qwen2.5-3B | 3.1B | 32K (según documentación oficial) | Apache-2.0 | Hugging Face, ModelScope |

Según el artículo de Zhihu, SmolLM3-3B supera a Llama-3.2-3B y Qwen2.5-3B en rendimiento general, pero no se aportan métricas concretas. La comparativa se basa en información externa no verificada en este repositorio.

## Limitaciones y advertencias

- Al ser un modelo de 3B, puede presentar alucinaciones y errores en tareas complejas, especialmente en razonamiento de múltiples pasos.
- No se dispone de información sobre sesgos específicos, pero como todo modelo entrenado con datos web, puede reflejar sesgos presentes en esos datos.
- La longitud de contexto no está documentada en este repositorio; se recomienda consultar la documentación oficial del modelo base para conocer el límite real.
- El repositorio es un mirror, por lo que no incluye documentación adicional ni ejemplos de uso; se debe acudir al modelo original para obtener detalles técnicos.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que el modelo base no tenga restricciones adicionales (en este caso, el original también es Apache-2.0).
- No se proporcionan cuantizaciones ni formatos optimizados (GGUF, ONNX), por lo que el despliegue en entornos de producción requiere conversión manual.

## Enlaces

- Repositorio mirror: https://huggingface.co/ggbetz/SmolLM3-3B-it-SFT
- Modelo original: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Checkpoints originales (rama it-SFT): https://huggingface.co/HuggingFaceTB/SmolLM3-3B-checkpoints/tree/it-SFT
- Curso de SFT con SmolLM3: https://huggingface.co/learn/smol-course/unit1/3
- Artículo en Zhihu (chino): https://zhuanlan.zhihu.com/p/1926427378223150517
- ModelScope: https://www.modelscope.cn/models/HuggingFaceTB/SmolLM3-3B
