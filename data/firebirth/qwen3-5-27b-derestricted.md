# Firebirth/Qwen3.5-27B-Derestricted

## Resumen

Qwen3.5-27B-Derestricted es una versión modificada del modelo Qwen3.5-27B de Alibaba, creada por Arli AI y publicada en el repositorio de Firebirth. El objetivo es eliminar los comportamientos de rechazo (refusals) del modelo original mediante una técnica refinada de abliteración denominada "Norm-Preserving Biprojected Abliteration", desarrollada por Jim Lai (grimjim). A diferencia de la abliteración estándar, que resta directamente un vector de rechazo de los pesos y degrada las capacidades del modelo, esta técnica descompone los pesos en magnitud y dirección, elimina el componente de rechazo solo de la dirección y recombina con las magnitudes originales, preservando así la estructura de importancia de la red neuronal.

El modelo base Qwen3.5-27B es un modelo de lenguaje causal con codificador de visión, de 27 mil millones de parámetros, que emplea una arquitectura híbrida eficiente que combina Gated Delta Networks (una variante de atención lineal) con atención clásica y redes feed-forward, además de un mecanismo de mezcla de expertos dispersa. Soporta entrada multimodal (imagen y texto) y razonamiento híbrido. La versión derestricted mantiene todas estas capacidades, pero sin los mecanismos de rechazo, lo que la hace adecuada para usos creativos, roleplay y escritura abierta, aunque también conserva el rendimiento técnico del original.

El repositorio actual tiene 0 descargas y 0 likes, y fue creado el 29 de agosto de 2026. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas. Existe además una versión en formato GGUF publicada por mradermacher, lo que facilita su ejecución en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (atención lineal) + Gated Attention + FFN, con vision encoder y mezcla de expertos dispersa |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (la arquitectura MoE no especifica el número de expertos activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio original; existe versión GGUF (mradermacher) con cuantizaciones típicas (Q4_K_M, Q5_K_M, Q8_0, etc.) |
| Idiomas soportados | 201 idiomas y dialectos (según la model card original de Qwen3.5) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio original); GGUF disponible en repositorio de mradermacher |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-27B presenta una arquitectura híbrida que combina tres tipos de capas: Gated DeltaNet (una forma de atención lineal con estado recurrente), Gated Attention (atención clásica con cabezas Q y KV) y redes feed-forward. La configuración interna incluye 64 capas, dimensión oculta de 5120, 48 cabezas de atención lineal para V y 16 para QK en el bloque DeltaNet, y 24 cabezas Q y 4 KV en el bloque de atención clásica, con dimensión de cabeza de 256 y RoPE de 64 dimensiones. El modelo fue preentrenado y post-entrenado con un enfoque de fusión temprana de tokens multimodales, y se escaló el aprendizaje por refuerzo en entornos con millones de agentes.

La modificación derestricted se aplicó mediante la técnica Norm-Preserving Biprojected Abliteration, que consta de tres pasos: biproyección para refinar la dirección de rechazo y hacerla ortogonal a direcciones "inofensivas", descomposición de los pesos en magnitud y dirección, y preservación de la norma al eliminar el componente de rechazo solo de la dirección. Según la model card, esta técnica evita la "tasa de seguridad" (safety tax) y podría incluso mejorar las capacidades de razonamiento al no gastar recursos en suprimir salidas. No se especifican los datos de entrenamiento adicionales ni el proceso de fine-tuning más allá de la modificación de pesos.

## Capacidades

- Generación de texto y razonamiento: mantiene las capacidades de razonamiento del Qwen3.5-27B original, incluyendo matemáticas, lógica y resolución de problemas.
- Entrada multimodal: acepta imágenes y texto (image-text-to-text), con codificador de visión integrado.
- Razonamiento híbrido: combina atención lineal y atención clásica para alta eficiencia y bajo coste de inferencia.
- Sin rechazos: el modelo no muestra comportamientos de rechazo ante solicitudes que el modelo original censuraría, lo que permite respuestas abiertas en temas sensibles.
- Soporte de tool calling y agentes: el modelo base Qwen3.5 está diseñado para integración con herramientas y entornos de agentes, aunque no se especifica explícitamente en la model card derestricted.
- Multilingüismo: soporta 201 idiomas y dialectos, con comprensión cultural y regional.
- Capacidad de escritura creativa y roleplay: al eliminar los rechazos, es adecuado para narrativa, diálogos de personajes y contenido expresivo.

## Casos de uso

- Escritura creativa sin restricciones: el modelo puede generar narrativa, poesía, guiones y contenido literario con libertad temática, sin los filtros de seguridad del modelo original. Es adecuado para autores que necesitan explorar temas controvertidos o maduros.
- Roleplay y diálogo de personajes: gracias a la ausencia de rechazos y a su capacidad de generar texto coherente y expresivo, puede usarse en juegos de rol, chatbots de personajes y simulación de conversaciones.
- Asistencia técnica y generación de código: conserva las capacidades de razonamiento y generación de código del Qwen3.5-27B, por lo que puede integrarse en pipelines de desarrollo, revisión de código y documentación técnica.
- Análisis de documentos con imágenes: al ser multimodal, puede procesar capturas de pantalla, diagramas y documentos escaneados para extraer información o responder preguntas sobre ellos.
- Investigación académica sobre alineación y seguridad: el modelo sirve como caso de estudio para evaluar los efectos de la abliteración con preservación de normas en el rendimiento y la seguridad.
- Prototipado de agentes conversacionales: su soporte para tool calling y razonamiento multi-paso permite construir asistentes que interactúan con APIs y ejecutan tareas complejas, aunque se debe validar su fiabilidad en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la versión derestricted en la información disponible. La model card menciona que "los benchmarks sugieren que este método evita la tasa de seguridad y potencialmente mejora las capacidades de razonamiento", pero no proporciona cifras concretas. Los benchmarks del modelo base Qwen3.5-27B están disponibles en el blog oficial de Qwen, pero no se incluyen en la documentación del repositorio derestricted. No se dispone de datos comparativos verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,78 B parámetros, en FP16 se necesitan aproximadamente 55,6 GB de VRAM (más overhead de activaciones). En cuantización de 8 bits, alrededor de 28 GB; en 4 bits, unos 14 GB.
- GPU recomendadas: para FP16, se requieren GPUs de datacenter como A100 (80 GB) o H100 (80 GB). Para cuantización 8 bits, una RTX 4090 (24 GB) puede ser insuficiente; se necesitaría una A6000 (48 GB) o similar. Para 4 bits, una RTX 4090 o RTX 3090 (24 GB) podría funcionar con limitaciones de contexto.
- Si cabe en consumer GPU: solo con cuantización de 4 bits y contexto reducido, en GPUs de 24 GB como RTX 3090/4090. Para uso cómodo, se recomienda al menos 32 GB de VRAM.
- Opciones de despliegue: vLLM, SGLang, KTransformers (según la model card original), llama.cpp para GGUF, Ollama (si se convierte a GGUF), y Transformers de Hugging Face.
- Latencia y throughput: no disponibles. Dependen de la cuantización, el hardware y la longitud de contexto. La arquitectura híbrida con Gated DeltaNet está diseñada para alta eficiencia, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-27B (original) | 27,78 B | no disponible | Sí | Apache 2.0 | Modelo base con rechazos de seguridad |
| Qwen3.5-27B-Derestricted | 27,78 B | no disponible | Sí | Apache 2.0 | Versión sin rechazos, misma arquitectura |
| Llama 3.1 8B Instruct (abliterated) | 8 B | 128 K | No | Llama 3.1 | Tamaño menor, sin multimodalidad, abliteración estándar |

No se dispone de datos de rendimiento comparativos entre estos modelos. La comparativa se limita a características arquitectónicas y de licencia. Existen otros modelos derestricted de Qwen3.5-27B, como "Qwen3.5-27B-Queen-Derestricted" (mencionado en Bitcoin.com AI), pero no se dispone de especificaciones detalladas.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una modificación de un modelo preentrenado, puede heredar sesgos sociales, culturales y de género presentes en los datos de entrenamiento originales. La eliminación de rechazos no elimina estos sesgos.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en temas especializados. La model card sugiere que la técnica de abliteración preserva las capacidades, pero no garantiza una reducción de alucinaciones.
- Limitaciones de contexto: no se especifica la longitud de contexto máxima; se recomienda verificar la configuración del modelo base Qwen3.5-27B.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, pero no se proporciona una garantía de seguridad o cumplimiento normativo. El uso en aplicaciones sensibles debe evaluarse con cuidado.
- Caveat para producción: al eliminar los rechazos, el modelo puede generar contenido inapropiado, ofensivo o peligroso. No es adecuado para aplicaciones orientadas al público general sin moderación adicional. La ausencia de benchmarks públicos dificulta la evaluación objetiva de su rendimiento en tareas estándar.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad. Se recomienda probar el modelo en un entorno controlado antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Firebirth/Qwen3.5-27B-Derestricted
- Repositorio de Arli AI (pesos completos): https://huggingface.co/ArliAI/Qwen3.5-27B-Derestricted
- Blog técnico sobre Norm-Preserving Biprojected Abliteration: https://huggingface.co/blog/grimjim/norm-preserving-biprojected-abliteration
- Modelo base Qwen3.5-27B: https://huggingface.co/Qwen/Qwen3.5-27B
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Versión GGUF (mradermacher): https://huggingface.co/mradermacher/Qwen-3.5-27B-Derestricted-GGUF
- Página del modelo en NanoGPT: https://nano-gpt.com/models/text/Qwen3.5-27B-Derestricted
