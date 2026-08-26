# mradermacher/JonathanColetti-Qwen3.8-27B-Uncensored-GGUF

## Resumen

JonathanColetti-Qwen3.8-27B-Uncensored es un modelo de lenguaje de 27 000 millones de parámetros derivado de la serie Qwen 3.8, modificado mediante la técnica de abliteración para eliminar los rechazos y sesgos de seguridad presentes en el modelo original. Esta cuantización GGUF, publicada por mradermacher, ofrece el modelo en formato GGUF para su ejecución local eficiente con llama.cpp y herramientas compatibles, además de incluir los archivos multimodales (mmproj) que añaden capacidades de visión.

El modelo está pensado para desarrolladores e investigadores que necesitan un LLM de gran tamaño con respuestas sin filtros de seguridad, manteniendo capacidades como la predicción multi-token (MTP) y el soporte de visión. Su licencia Apache 2.0 permite uso comercial sin restricciones. Al estar cuantizado en distintos niveles (de Q2_K a Q8_0), es posible ejecutarlo en hardware de consumo, aunque el tamaño de 27 000 millones de parámetros exige al menos 16 GB de VRAM en las cuantizaciones más bajas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.8-27B, con predicción multi-token y módulo de visión) |
| Parametros totales | 27 320 697 856 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (se hereda de Qwen3.8, se recomienda consultar documentación del modelo base) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (incluye archivos .gguf para texto y .gguf para el proyector de visión) |

## Arquitectura y entrenamiento

La arquitectura se basa en el modelo Qwen3.8-27B original, que es un transformer denso con 27 000 millones de parámetros. La característica principal es la inclusión de MTP (multi-token prediction), que permite predecir varios tokens a la vez y acelera la generación mediante decodificación especulativa. Además, el modelo incorpora un módulo de visión (indicado por el tag "vision") que requiere los archivos mmproj para procesar imágenes.

El proceso de abliterado (uncensoring) elimina las capas de rechazo del modelo original, reduciendo la probabilidad de que el modelo se niegue a responder a peticiones que el modelo base consideraría inapropiadas. No se dispone de detalles exactos sobre el dataset de entrenamiento ni sobre el proceso de alineación (RLHF o DPO) del modelo base, pero se sabe que el modelo original fue publicado por jaromer y esta versión es una cuantización estática de mradermacher.

## Capacidades

- Generación de texto sin filtros de contenido, con respuestas directas a peticiones que modelos alineados suelen rechazar.
- Razonamiento y comprensión del lenguaje natural en inglés y chino.
- Capacidades de visión: procesamiento de imágenes mediante el archivo mmproj adjunto (requiere el uso de un runtime que soporte multimodal, como llama.cpp con mmproj).
- Predicción multi-token (MTP) para acelerar la inferencia mediante decodificación especulativa.
- Soporte de tool calling y function calling: aunque no se menciona explícitamente, el modelo base Qwen3.8 soporta estas funciones, por lo que se puede asumir que están disponibles (no confirmado en esta cuantización).
- No se especifica soporte para agentes multi-step, pero es probable que pueda utilizarse en entornos de agente.

## Casos de uso

- **Atención al cliente sin censura**: el modelo puede gestionar consultas complejas sin restricciones de contenido, útil para empresas que necesitan respuestas directas en dominios técnicos o legales.
- **Generación de código en producción**: gracias a su tamaño y a la capacidad de tool calling, puede integrarse en pipelines de CI/CD para generar y revisar código, aunque la falta de filtros puede requerir supervisión.
- **Análisis de documentos con visión**: combinando la parte de texto con el proyector de visión, se puede extraer información de imágenes, capturas de pantalla o documentos escaneados.
- **Creación de chatbots para comunidades técnicas**: al no rechazar preguntas sobre temas controvertidos (seguridad, hacking, etc.), puede servir en foros de investigación.
- **Traducción y procesamiento de lenguaje bilingüe**: con soporte para inglés y chino, puede realizar traducciones y análisis multilingüe.
- **Prototipado rápido de agentes conversacionales**: su tamaño permite ejecutarlo en servidores de gama media, lo que facilita el desarrollo de asistentes locales sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K. La única referencia es la gráfica de calidad de cuantización de ikawrakow que compara distintos tipos de quant, pero no es un benchmark estándar.

## Requisitos de hardware

- **VRAM estimada**: para la cuantización Q4_K_M (~17 GB), se necesita al menos 20 GB de VRAM si se carga en GPU. Las versiones Q8_0 (~29 GB) requieren más de 32 GB.
- **GPU recomendadas**: RTX 3090, RTX 4090 (24 GB) para Q4_K_M; A100 o H100 para Q8_0. También puede ejecutarse en CPU con suficiente RAM (por ejemplo, 32 GB para Q4_K_M).
- **Consumer GPU**: sí, una RTX 3090 o 4090 puede ejecutar las cuantizaciones Q4_K_S y Q4_K_M sin problemas.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, text-generation-webui (con backend llama.cpp), vLLM (si se convierte a formato compatible).
- **Latencia y throughput**: no disponible, depende de la GPU y de la cuantización. Con MTP, la generación puede ser más rápida que en modelos sin ella.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|--------|------------|----------|----------|-------|
| JonathanColetti-Qwen3.8-27B-Uncensored (GGUF) | 27B | no disp. | Apache 2.0 | Abliterado, visión, MTP |
| Qwen2.5-27B (original) | 27B | 32K (típico) | Apache 2.0 | Sin abliterado, sin visión |
| Llama-3.1-8B | 8B | 128K | Llama 3.1 | Menor tamaño, sin visión |

No se dispone de más modelos comparables de la misma categoría (27B abliterado con visión). La comparativa es orientativa.

## Limitaciones y advertencias

- **Sesgos y contenido ofensivo**: al eliminar el rechazo, el modelo puede generar contenido dañino, discriminatorio o ilegal. Debe usarse con responsabilidad.
- **Riesgo de alucinación**: como todos los LLM, puede inventar información, especialmente en contextos largos o técnicos.
- **Idiomas**: solo soporta inglés y chino, no cubre otros idiomas de forma fiable.
- **Licencia**: Apache 2.0 permite uso comercial, pero hay que tener en cuenta que el modelo base (Qwen3.8) tiene sus propias restricciones, aunque esta versión parece heredar la licencia Apache.
- **Cuantizaciones**: las versiones de menor precisión (Q2_K, Q3_K) pueden degradar significativamente la calidad de la generación.
- **Compatibilidad**: los archivos mmproj son necesarios para visión; si no se cargan, el modelo no podrá procesar imágenes.
- **Producción**: no se recomienda su uso en producción sin evaluación exhaustiva de calidad y seguridad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/JonathanColetti-Qwen3.8-27B-Uncensored-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/jaromer/JonathanColetti-Qwen3.8-27B-Uncensored
- Página de descargas y overview: https://hf.tst.eu/model#JonathanColetti-Qwen3.8-27B-Uncensored-GGUF
- Blog sobre el modelo (orcarouter.ai): https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Repositorio GitHub de uso (no oficial): https://github.com/unburdened-jackinthebox365/qwen38-uncensored

Nota: La información sobre el modelo base y la arquitectura es limitada. Para obtener detalles completos sobre el contexto, el entrenamiento y los benchmarks, se recomienda consultar la documentación oficial de Qwen3.8.</think>## Resumen

JonathanColetti-Qwen3.8-27B-Uncensored es un modelo de lenguaje de 27 320 millones de parámetros derivado de la familia Qwen3.8, modificado mediante la técnica de abliteración para eliminar los comportamientos de rechazo del modelo original. Esta versión GGUF, publicada por mradermacher, ofrece cuantizaciones en formato GGUF para su ejecución local eficiente con llama.cpp y otras herramientas compatibles, además de incluir los archivos multimodales (mmproj) para capacidades de visión.

El modelo está orientado a desarrolladores e investigadores que necesitan un LLM de gran tamaño con respuestas sin filtros de seguridad, manteniendo características como la predicción multi-token (MTP) y el soporte de visión. Su licencia Apache 2.0 permite uso comercial sin restricciones. Al estar disponible en múltiples niveles de cuantización (desde Q2_K hasta Q8_0), puede ejecutarse en hardware de consumo, aunque los 27 000 millones de parámetros exigen al menos 16 GB de memoria en las cuantizaciones más ligeras.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.8-27B, con MTP y módulo de visión) |
| Parametros totales | 27 320 697 856 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (se hereda del modelo base Qwen3.8) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivos .gguf para texto y .gguf para el proyector de visión) |

## Arquitectura y entrenamiento

La arquitectura se basa en el modelo Qwen3.8-27B, un transformer denso de 27 000 millones de parámetros. La característica principal es la predicción multi-token (MTP), que permite predecir varios tokens a la vez, mejorando la velocidad de generación mediante decodificación especulativa. El modelo también incluye un componente de visión, evidenciado por los archivos mmproj que se proporcionan junto con las cuantizaciones.

El proceso de abliteración (uncensoring) elimina las capas de rechazo del modelo original, reduciendo la probabilidad de que el modelo se niegue a responder a peticiones que el modelo alineado consideraría inapropiadas. No se han publicado detalles sobre el dataset de entrenamiento ni el proceso de alineación del modelo base. Esta versión GGUF es una cuantización estática realizada por mradermacher, sin reentrenamiento adicional.

## Capacidades

- Generación de texto sin filtros de rechazo, con respuestas directas a peticiones sensibles o controvertidas.
- Razonamiento y comprensión del lenguaje natural en inglés y chino.
- Capacidades de visión: procesamiento de imágenes mediante el archivo mmproj (requiere un runtime que soporte multimodales, como llama.cpp con mmproj).
- Predicción multi-token (MTP) que acelera la generación mediante decodificación especulativa.
- Soporte de tool calling y function calling: aunque no se menciona explícitamente, el modelo base Qwen3.8 lo soporta, por lo que se puede asumir su disponibilidad.
- Soporte de agentes y multi-step reasoning: no confirmado explícitamente, pero probablemente funcione con herramientas adecuadas.

## Casos de uso

- **Atención al cliente automatizada sin censura**: el modelo puede gestionar conversaciones multi-turno sobre temas técnicos o legales sin restricciones de contenido, lo que permite respuestas directas en casos de reclamaciones o consultas complejas.
- **Generación de código en producción**: con soporte de tool calling, puede integrarse en pipelines de CI/CD para generar, revisar o parchear código, aunque requiere supervisión por su falta de alineación.
- **Análisis de documentos con imágenes**: combinando la parte de texto con el proyector de visión, se puede extraer información de capturas de pantalla, diagramas o documentos escaneados.
- **Investigación en seguridad informática**: al no rechazar preguntas sobre vulnerabilidades, exploits o técnicas de hacking, es útil para investigadores que necesitan respuestas técnicas sin restricciones.
- **Traducción y procesamiento multilingüe**: con soporte para inglés y chino, puede realizar traducciones y análisis de contenido en esos idiomas.
- **Prototipado de asistentes conversacionales**: su tamaño grande y su capacidad de ejecución local lo hacen adecuado para prototipos de chatbots en entornos de desarrollo sin necesidad de conexión a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K. La única referencia es una gráfica de ikawrakow que compara la calidad de diferentes cuantizaciones, pero no es un benchmark estándar.

## Requisitos de hardware

- **VRAM estimada**: para Q4_K_M (16.9 GB), se necesita al menos 20 GB de VRAM si se usa en GPU. Para Q8_0 (29.1 GB), se requieren 32 GB o más.
- **GPU recomendadas**: RTX 3090 o RTX 4090 (24 GB) para cuantizaciones Q4_K_S y Q4_K_M; A100 o H100 para Q8_0. También puede ejecutarse en CPU con suficiente RAM (por ejemplo, 32 GB para Q4_K_M).
- **Consumer GPU**: sí, las cuantizaciones Q4_K_S y Q4_K_M caben en GPUs de 24 GB (RTX 3090/4090).
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (si se convierte a formato compatible).
- **Latencia y throughput**: no disponible, pero la predicción multi-token (MTP) puede mejorar la velocidad de generación en comparación con modelos sin MTP.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Visión | Abliterado |
|--------|------------|----------|----------|--------|------------|
| JonathanColetti-Qwen3.8-27B-Uncensored (GGUF) | 27.3B | no disp. | Apache 2.0 | Sí | Sí |
| Qwen3.5-27B (original) | 27B | 32K (típico) | Apache 2.0 | Sí (depende de la versión) | No |
| Llama 3.1-70B | 70B | 128K | Llama 3.0 | No | No |

No se dispone de datos de rendimiento comparativos. La comparativa se basa en características técnicas generales.

## Limitaciones y advertencias

- **Sesgos y contenido**: al eliminar la censura, el modelo puede generar contenido ofensivo, discriminatorio, ilegal o peligroso. Debe usarse con responsabilidad y no en aplicaciones de producción sin medidas de control.
- **Riesgo de alucinación**: como todos los modelos, puede inventar información, especialmente en contextos largos o ambiguos.
- **Idiomas**: solo soporta inglés y chino, no cubre otros idiomas de forma fiable.
- **Licencia**: Apache 2.0 permite uso comercial, pero hay que verificar las restricciones del modelo base Qwen3.5 (que también es Apache 2.0, así que no hay conflicto).
- **Cuantizaciones**: las versiones de baja precisión (Q2_K, Q3_K) pueden degradar la calidad de la generación y aumentar la alucinación.
- **Compatibilidad**: los archivos mmproj son necesarios para la funcionalidad de visión; si no se cargan, el modelo no podrá procesar imágenes.
- **Producción**: no se recomienda su uso en producción sin un sistema de moderación de contenido externo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/martarmacher/JonathanColetti-Qwen3.8-27B-Uncensored-GGUF
- Modelo base (no cuantizado): https://huggingface.co/jaromer/JonathanColetti-Qwen3.8-27B-Uncensored
- Página de descargas y consultas: https://hf.tst.eu/model#JonathanColetti-Qwen3.8-27B-Uncensored-GGUF
- Blog de referencia (orcarouter.ai): https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Repositorio de uso (no oficial): https://github.com/unburdened-jackinbox365/qwen38-uncensored

Nota: La información sobre la arquitectura y el entrenamiento es limitada. Para detalles sobre el contexto, el entrenamiento y los benchmarks, se recomienda consultar la documentación oficial de Qwen3.8.
