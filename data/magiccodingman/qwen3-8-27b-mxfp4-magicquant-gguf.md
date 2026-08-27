# magiccodingman/Qwen3.8-27B-MXFP4-MagicQuant-GGUF

## Resumen

Este repositorio ofrece un conjunto de cuantizaciones GGUF adaptadas a partir del checkpoint oficial `amd/Qwen3.8-27B-Quark-AWQ-MXFP4`, que a su vez es una versión cuantizada por AMD del modelo multimodal Qwen3.8-27B de Alibaba. El autor, magiccodingman, ha reempaquetado el checkpoint nativo MXFP4 en formato GGUF y ha aplicado configuraciones de tensores híbridas procedentes de su sistema MagicQuant y de Unsloth, con una política estricta de no aumentar nunca la precisión de almacenamiento de ningún tensor respecto al original de AMD. El resultado son once cuantizaciones (diez distribuidas y una descartada por no superar el umbral de calidad) que cubren desde el nativo MXFP4 de 18,89 GB hasta una versión IQ2 de 8,22 GB.

El modelo base Qwen3.8-27B es un modelo multimodal denso de 27.320 millones de parámetros, entrenado por Alibaba, que destaca en tareas de codificación, flujos de trabajo agénticos y automatización de oficina. Su licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Esta versión cuantizada conserva las capacidades multimodales (imagen-texto) y el soporte de multi-token prediction (MTP) del original, aunque la calidad de las cuantizaciones más agresivas se degrada, como muestran las métricas de divergencia KL (KLD) frente al nativo.

La relevancia de este repositorio radica en que permite ejecutar un modelo de 27B multimodal en hardware de consumo, con tamaños que van desde los 18,89 GB hasta los 8,22 GB, y proporciona un análisis detallado de la pérdida de calidad de cada cuantización mediante KLD y perplejidad (PPL). Es una opción útil para desarrolladores que necesitan desplegar un modelo multimodal de alta capacidad en entornos con VRAM limitada, siempre que acepten el trade-off entre tamaño y fidelidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basado en Qwen3.8-27B de Alibaba) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No disponible (no se especifica si es MoE) |
| Longitud de contexto | No disponible (no se indica en la informacion proporcionada) |
| Tipos de cuantizacion | MXFP4 nativo, IQ4_XS, IQ2_M, Q4_K_S, IQ3_S, IQ2_M_2, Q2_K_XL, IQ3_XXS, IQ2_XXS_1 (ademas de IQ4_XS, Q3_K_XL, etc.) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con safetensors como base) |

## Arquitectura y entrenamiento

El modelo es una adaptación de cuantización, no un entrenamiento nuevo. El checkpoint original es `amd/Qwen3.8-27B-Quark-AWQ-MXFP4`, que es la versión de AMD del Qwen3.8-27B, cuantizada con el framework Quark (AWQ + MXFP4). Sobre este checkpoint se ha realizado un repack GGUF y se han aplicado configuraciones de tensores provenientes de las recetas MagicQuant y Unsloth. La política de adaptación es estrictamente descendente: no se aumenta la precisión de ningún tensor respecto al original, por lo que las cuantizaciones resultantes son siempre menores o iguales en tamaño que el nativo.

El proceso incluye el uso de imatrix (matriz de importancia) para seleccionar los bloques que se cuantizan con menor precisión, y se mantienen los projectores de visión (vision projectors) para preservar la capacidad multimodal. El modelo soporta MTP (multi-token prediction), lo que puede acelerar la decodificación especulativa en entornos que lo permitan. Se evaluaron once configuraciones, de las cuales diez superaron el umbral de calidad (KLD < 1.0) y una fue descartada por tener una divergencia de 1.172122 y una perplejidad de 17.87418 frente al nativo (5.801511).

No se proporcionan datos sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, etc.), solo se detalla el proceso de cuantización.

## Capacidades

- Generación de texto y conversación multimodal: el modelo puede procesar entradas de imagen y texto y generar respuestas textuales, manteniendo las capacidades del Qwen3.8-27B original.
- Soporte de multi-token prediction (MTP): el checkpoint incluye el soporte para MTP, lo que permite acelerar la inferencia con decodificación especulativa.
- Cuantizaciones escalables: se ofrecen once niveles de cuantización que van desde 18,89 GB hasta 8,22 GB, permitiendo elegir entre fidelidad y consumo de memoria.
- Compatibilidad con GGUF: todos los archivos están en formato GGUF, por lo que se pueden usar con llama.cpp, Ollama, vLLM y otros motores compatibles.
- Uso de imatrix: las cuantizaciones con imatrix (matriz de importancia) mejoran la calidad en comparación con cuantizaciones estándar, especialmente en los niveles bajos.
- Projectores de visión incluidos: se conservan los componentes de visión del modelo base, por lo que la funcionalidad imagen-texto está disponible.

## Casos de uso

- **Despliegue local de un asistente multimodal**: gracias a la cuantización de 8,22 GB (MQ-IQ2_XXS_1) se puede ejecutar en una GPU de 12 GB, permitiendo un asistente que analice imágenes y responda en texto en un entorno local sin conexión.
- **Automatización de oficina**: el modelo base Qwen3.8-27B está optimizado para tareas de oficina como generación de resúmenes, redacción de correos y extracción de información de documentos. Con la cuantización MXFP4 nativa (18.89 GB) se puede desplegar en un servidor con una GPU de 24 GB para mantener la máxima calidad.
- **Análisis de imágenes médicas o técnicas**: al ser multimodal, puede describir o responder preguntas sobre imágenes de diagnóstico, diagramas técnicos o capturas de pantalla. La cuantización IQ4_XS (14.98 GB) ofrece un buen equilibrio entre calidad y tamaño para este tipo de tareas.
- **Agentes conversacionales con contexto largo**: si se dispone de VRAM suficiente (24 GB o más), la cuantización nativa o UD-Q4_K_S (14.55 GB) permite manejar conversaciones con un contexto largo, aunque no se ha especificado la longitud de contexto máxima.
- **Generación de código en entornos con recursos limitados**: para tareas de codificación, la cuantización UD-Q3_K_XL (13.03 GB) puede ejecutarse en una GPU de 16 GB y ofrece una buena relación calidad/tamaño para completar código y asistencia en desarrollo.
- **Evaluación de calidad de cuantizaciones**: este repositorio es útil para investigadores que estudien el impacto de diferentes estrategias de cuantización, ya que incluye métricas de KLD y PPL para cada variante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (como MMLU, HumanEval, GSM8K) en la información proporcionada. La tabla del repositorio solo incluye métricas de divergencia KL (KLD) y perplejidad (PPL) frente al nativo MXFP4, que son medidas de la pérdida de calidad intrínseca de la cuantización, no de rendimiento en tareas específicas. Se recomienda al usuario consultar los benchmarks del modelo base Qwen3.8-27B en el repositorio oficial de Alibaba para conocer el rendimiento en tareas estándar.

## Requisitos de hardware

- **VRAM estimada**: el archivo nativo MXFP4 (18.89 GB) requiere al menos 24 GB de VRAM para inferencia sin descargar pesos a CPU. Los quants más pequeños (8.22 GB) pueden ejecutarse en GPU con 12 GB de VRAM, siempre que el contexto no exceda la memoria adicional. Para cuantizaciones intermedias (14-16 GB) se recomiendan GPU de 16-20 GB.
- **GPU recomendadas**: para los quants de 8-10 GB, una RTX 3060 12 GB o RTX 4070 12 GB son suficientes. Para los de 13-15 GB, una RTX 4080 16 GB o A4500 20 GB. Para el nativo (18.89 GB) se necesitan GPUs como RTX 4090 24 GB, A100 40 GB o H100.
- **Compatibilidad con consumer GPU**: sí, todas las cuantizaciones pueden ejecutarse en GPU de consumo con al menos 12 GB de VRAM, aunque las de mayor tamaño requieren 24 GB.
- **Opciones de despliegue**: los archivos GGUF se pueden usar con llama.cpp, Ollama, vLLM (con soporte GGUF), LM Studio, etc. La elección del motor dependerá de si se necesita decodificación especulativa o soporte multimodal.
- **Latencia y throughput**: no se han publicado datos específicos de latencia o throughput en la información proporcionada. Dependerá de la GPU, el tamaño de la cuantización y la implementación del motor.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. El modelo base Qwen3.8-27B es comparable a otros modelos de 27B como Llama 3.1 8B (no comparable por tamaño) o Mixtral 8x22B, pero no se han proporcionado benchmarks comparativos. Se recomienda consultar los resultados oficiales de Qwen3.8-27B en el repositorio de Alibaba para una comparación con otros modelos de su categoría.

## Limitaciones y advertencias

- **Pérdida de calidad por cuantización**: las cuantizaciones más agresivas (IQ2_M_2, Q2_K_XL, IQ2_XXS_1) muestran un KLD superior a 0.1, lo que indica una desviación notable de los logits originales. Esto puede afectar a la coherencia y precisión del modelo en tareas complejas.
- **Adaptación no oficial**: este repositorio es una adaptación de un checkpoint cuantizado por AMD, no es un modelo de Alibaba. El autor ha aplicado su propia metodología de cuantización, por lo que la calidad puede diferir de las cuantizaciones oficiales.
- **Sesgos y alucinación**: como cualquier modelo de lenguaje, Qwen3.8-27B puede generar contenido sesgado o alucinar información. La cuantización no corrige estos problemas y puede acentuarlos en niveles de baja precisión.
- **Restricciones de licencia**: la licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos de la licencia del modelo base original (Qwen3.8-27B) para asegurar que no hay restricciones adicionales.
- **Falta de documentación**: no se han proporcionado detalles sobre la longitud de contexto, idiomas soportados o arquitectura exacta, lo que puede dificultar la evaluación completa del modelo.

## Enlaces

- [Repositorio Hugging Face de este modelo](https://huggingface.co/magiccodingman/Qwen3.8-27B-MXFP4-MagicQuant-GGUF)
- [Repositorio Hugging Face del modelo base AMD](https://huggingface.co/amd/Qwen3.8-27B-Quark-AWQ-MXFP4)
- [Repositorio GitHub de MagicQuant Wiki](https://github.com/magiccodingman/MagicQuant-Wiki)
- [Repositorio GitHub de Qwen3.8-27B (Alibaba)](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Repositorio GitHub de la serie Qwen3.8 (QwenLM)](https://github.com/QwenLM/Qwen3.8)
- [Blog de referencia sobre cómo ejecutar Qwen 3.8 27B localmente](https://locallyuncensored.com/blog/how-to-run-qwen-3-8-27b-locally.html)</think>## Resumen

Este repositorio contiene un conjunto de cuantizaciones GGUF adaptadas a partir del checkpoint `amd/Qwen3.8-27B-Quark-AWQ-MXFP4`, una versión cuantizada por AMD del modelo multimodal Qwen3.8-27B de Alibaba. El autor, magiccodingman, ha reempaquetado el checkpoint nativo MXFP4 en formato GGUF y ha aplicado configuraciones de tensores híbridas procedentes de su sistema MagicQuant y de Unsloth, siguiendo una política estricta de no aumentar nunca la precisión de almacenamiento de ningún tensor respecto al original. El resultado son once cuantizaciones (diez distribuidas y una descartada por no superar el umbral de calidad) que cubren desde el nativo MXFP4 de 18,89 GB hasta una versión de 8,22 GB.

El modelo base es un modelo multimodal de 27.320 millones de parámetros, desarrollado por Alibaba, que destaca en tareas de codificación, flujos de trabajo agénticos y automatización de oficina. Su licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales. Este repositorio conserva las capacidades multimodales (imagen-texto) y el soporte de multi-token prediction (MTP) del original, aunque la calidad de las cuantizaciones más agresivas se degrada, como muestran las métricas de divergencia KLD frente al nativo.

La relevancia de este repositorio radica en su capacidad para ejecutar un modelo de 27B multimodal en hardware de consumo, con opciones desde 18,89 GB hasta 8,22 GB, y en su documentación detallada de la pérdida de calidad de cada cuantización mediante KLD y perplejidad (PPL). Es una herramienta útil para desarrolladores que necesitan desplegar un modelo multimodal de alta capacidad en entornos con VRAM limitada, aceptando el compromiso entre tamaño y fidelidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basado en Qwen3.8-27B, no se especifica detalle) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No disponible (no se indica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MXFP4 nativo, IQ4_XS, IQ2_M, Q4_K_S, IQ3_K_XL, IQ2_M_2, Q2_K_XL, IQ3_XXS, IQ2_XXS_1 (ver tabla completa en Arquitectura) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (el checkpoint base está en safetensors) |

## Arquitectura y entrenamiento

El modelo es una adaptación de cuantización, no un entrenamiento nuevo. El checkpoint original es `amd/Qwen3.8-27B-Quark-AWQ-MXFP4`, que es la versión de AMD del Qwen3.8-27B, cuantizada con el framework Quark (AWQ + MXFP4). Sobre este checkpoint se ha realizado un repack GGUF y se han aplicado configuraciones de tensores híbridas (MagicQuant y Unsloth). La política de adaptación es estrictamente descendente: ningún tensor aumenta su precisión de almacenamiento respecto al original, por lo que las cuantizaciones resultantes siempre son menores o iguales en tamaño.

El proceso incluye el uso de matrices de importancia (imatrix) para optimizar la asignación de bits, y se mantienen los projectores de visión para conservar la capacidad multimodal. Se evaluaron once configuraciones, de las cuales diez superaron el umbral de calidad (KLD < 1.5) y una fue descartada (UD-IQ2_XXS) por tener una KLD de 1.172122 y una PPL de 17.87418 frente a la nativa de 5.801511. La cuantización `MQ-IQ2_XXS_1` es notablemente mejor (KLD 0.321797) y más pequeña (8.22 GB) que la descartada.

No se dispone de datos sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO, etc.), ni sobre innovaciones técnicas en la arquitectura.

## Capacidades

- Generación multimodal: procesa entradas de imagen y texto y genera respuestas textuales, manteniendo las capacidades del Qwen3.8-27B original.
- Multi-token prediction (MTP): soporte para decodificación especulativa, lo que puede acelerar la inferencia en entornos compatibles.
- Conversación multi-turno: orientado a diálogos con un estilo conversacional.
- Cuantizaciones escalonadas: once niveles de cuantización que permiten ajustar el equilibrio entre tamaño y calidad.
- Compatibilidad GGUF: se puede usar con llama.cpp, Ollama, vLLM, TGI y otros motores que soporten este formato.
- Proyectores de visión: se conservan los componentes de visión, por lo que la funcionalidad imagen-texto está disponible.

## Casos de uso

- **Despliegue local de un asistente multimodal**: la cuantización `MQ-IQ2_XXS_1` (8.22 GB) puede ejecutarse en una GPU con 12 GB de VRAM, permitiendo un asistente que vea imágenes y responda en texto en un entorno sin conexión.
- **Automatización de oficina**: el modelo base está optimizado para tareas de redacción, resumen y extracción de información. La cuantización nativa (18.89 GB) o `MQ-IQ4_XS_1` (14.98 GB) ofrecen la máxima calidad para estos casos en servidores con GPU de 24 GB.
- **Análisis de imágenes técnicas**: puede describir diagramas, capturas de pantalla o imágenes de diagnóstico. La cuantización `UD-Q4_K_S` (14.55 GB) es adecuada para entornos con GPU de 16 GB.
- **Generación de código en entornos de desarrollo**: el modelo base destaca en código. La cuantización `UD-Q3_K_XL` (13.03 GB) puede ejecutarse en una GPU de 16 GB y proporciona una buena relación calidad-tamaño para completar código y asistencia en desarrollo.
- **Agentes conversacionales**: gracias a su capacidad multimodal y conversacional, se puede integrar en sistemas de atención al cliente que reciban imágenes y texto, con la cuantización `UD-IQ4_XS` (13.89 GB) como equilibrio entre tamaño y tamaño.
- **Investigación sobre cuantización**: este repositorio es útil para estudiar el impacto de diferentes estrategias de cuantización en un modelo multimodal, ya que incluye métricas de KLD y PPL para cada variante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información proporcionada. El repositorio solo incluye métricas de pérdida intrínseca (KLD y PPL) de cada cuantización respecto al nativo, no resultados en tareas como MMLU, HumanEval o GSM8K. Para conocer el rendimiento del modelo base en tareas estándar, se recomienda consultar los benchmarks oficiales de Qwen3.8-27B en el repositorio de Alibaba.

## Requisitos de hardware

- **VRAM estimada**: el nativo MXFP4 (18.89 GB) requiere al menos 24 GB de VRAM. Las cuantizaciones de 13-15 GB necesitan 16-20 GB. Las de 8-10 GB pueden funcionar en GPU con 12 GB, siempre que el contexto no exceda la memoria disponible.
- **GPU recomendadas**: para las variantes de 8-10 GB, una RTX 3060 12 GB o RTX 4070 12 GB son suficientes. Para las de 13-15 GB, una RTX 4080 16 GB o A100 20 GB. Para el nativo, RTX 4090 24 GB, A100 40 GB o H100.
- **Compatibilidad con consumer GPU**: todas las variantes se pueden ejecutar en GPU de consumo con al menos 12 GB de VRAM, aunque las más grandes requieren 24 GB.
- **Opciones de despliegue**: los archivos GGUF son compatibles con llama.cpp, Ollama, vLLM (con soporte GGUF), TGI, etc. La elección dependerá de si se requiere decodificación especulativa (MTP) o soporte multimodal.
- **Latencia y throughput**: no se han publicado datos específicos en la información disponible.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la información proporcionada. El modelo base Qwen3.8-27B es comparable a otros modelos de ~27B como Llama 3.1 27B o Mixtral 8x22B, pero no se han proporcionado benchmarks para comparar. Se recomienda consultar los resultados oficiales de Qwen3.8-27B para una comparativa con modelos de su categoría.

## Limitaciones y advertencias

- **Pérdida de calidad por cuantización**: las variantes más agresivas (IQ2_M_2, Q2_K_XL, IQ2_XXS_1) muestran KLD superior a 0.1, lo que puede causar incoherencias o errores en tareas complejas.
- **Adaptación no oficial**: el modelo es una adaptación de un checkpoint cuantizado por AMD, no una versión oficial de Alibaba. La metodología de cuantización es del autor, por lo que la calidad puede diferir de las cuantizaciones oficiales.
- **Sesgos y alucinación**: como cualquier LLM, puede generar contenido sesgado o falso. La cuantización no corrige estos problemas y puede acentuarlos en niveles bajos.
- **Restricciones de licencia**: la licencia Apache-2.0 permite uso comercial, pero se debe verificar que el modelo base Qwen3.8-27B cumple con los términos de su licencia original.
- **Falta de información**: no se ha especificado la longitud de contexto, idiomas soportados o detalles de la arquitectura, lo que puede dificultar la evaluación de adecuación para ciertos casos.

## Enlaces

- [Repositorio Hugging Face de este modelo](https://huggingface.co/magiccodingman/Qwen3.8-27B-MXFP4-MagicQuant-GGUF)
- [Repositorio Hugging Face del checkpoint AMD](https://huggingface.co/amd/Qwen3.8-27B-Quark-AWQ-MXFP4)
- [MagicQuant Wiki](https://github.com/magiccodingman/MagicQuant-Wiki)
- [Repositorio GitHub de Qwen3.8-27B (Alibaba)](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Repositorio GitHub de la serie Qwen3.8 (QwenLM)](https://github.com/QwenLM/Qwen3.8)
- [Blog: How to Run Qwen 3.8 27B Locally](https://locallyuncensored.com/blog/how-to-run-qwen-3-8-27b-locally.html)
