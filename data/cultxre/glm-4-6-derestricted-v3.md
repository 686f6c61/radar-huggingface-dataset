# Cultxre/GLM-4.6-Derestricted-v3

## Resumen

GLM-4.6-Derestricted-v3 es una variante del modelo GLM-4.6 de Zhipu AI (zai-org) que ha sido sometida a una técnica de "derestricción" (eliminación de comportamientos de rechazo) mediante el método **Norm-Preserving Biprojected Abliteration**, desarrollado por Arli AI y aplicado por el usuario Cultxre en este repositorio. El objetivo es ofrecer un modelo que no se niegue a responder a peticiones controvertidas o explícitas, manteniendo al mismo tiempo las capacidades de razonamiento y codificación del modelo original. Esta versión se distribuye bajo licencia MIT, lo que permite su uso comercial sin restricciones adicionales.

El modelo base GLM-4.6 es un modelo de lenguaje de gran escala con arquitectura de mezcla de expertos (MoE) de aproximadamente 356 mil millones de parámetros totales, con una ventana de contexto ampliada a 200 000 tokens y un rendimiento destacado en tareas de razonamiento, generación de código y uso de herramientas. La versión derestringida conserva estas capacidades, aunque con la diferencia fundamental de que los mecanismos de rechazo y moderación han sido eliminados o atenuados.

Este tipo de modelos "uncensored" o "derestricted" son relevantes para desarrolladores que necesitan un asistente sin filtros para tareas de investigación, generación creativa sin restricciones o pruebas de robustez, aunque conllevan riesgos éticos y legales importantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), etiqueta `glm4_moe` |
| Parametros totales | 356 785 898 816 (≈356,8 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 200 000 tokens (heredado del modelo base GLM-4.6) |
| Tipos de cuantizacion | FP8, INT8 (W8A8), W4A16 (GPTQ) – según enlaces de la model card de Arli AI |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (también disponibles cuantizaciones FP8, INT8 y GPTQ en repositorios de Arli AI) |

## Arquitectura y entrenamiento

El modelo base GLM-4.6 es un modelo de lenguaje de gran escala con arquitectura de mezcla de expertos (MoE). La variante derestricción no altera la arquitectura base; solo modifica los pesos mediante la técnica de **Norm-Preserving Biprojected Abliteration**. Este método, descrito en el blog de Hugging Face por Jim Lai (grimjim), consiste en tres pasos: (1) bi-proyección del vector de rechazo para que sea ortogonal a direcciones "inofensivas", (2) descomposición de los pesos en magnitud y dirección, y (3) eliminación del componente de rechazo únicamente de la parte direccional, manteniendo las magnitudes originales. Esto evita la degradación típica de la abliteración convencional, que resta directamente el vector de rechazo y daña las normas de los pesos, causando pérdida de razonamiento o alucinaciones.

No se han publicado datos detallados sobre el entrenamiento adicional de esta variante, ni sobre el dataset utilizado para la abliteración. El modelo base GLM-4.6 fue entrenado con un enfoque en razonamiento, generación de código y uso de herramientas, con una ventana de contexto de 200k tokens. El proceso de derestricción no implica un entrenamiento adicional supervisado, sino una modificación de los pesos ya entrenados.

## Capacidades

- Generación de texto y conversación en formato de chat, con soporte para tareas de razonamiento complejo.
- Generación de código: hereda las capacidades de GLM-4.6, que supera a GLM-4.5 en benchmarks de código y tiene buen rendimiento en herramientas como Claude Code, Cline, Roo Code y Kilo Code.
- Razonamiento avanzado: el modelo base GLM-4.6 muestra mejoras significativas en tareas de razonamiento y puede usar herramientas durante la inferencia.
- Soporte de agentes y multi-step reasoning: diseñado para integrarse en frameworks de agentes, con uso de herramientas y búsqueda.
- Capacidades multilingües: no se especifican idiomas, pero el modelo base GLM-4.6 es principalmente entrenado para inglés y chino, aunque puede generalizar a otros idiomas.
- Capacidad especial: al ser "derestricted", no presenta comportamientos de rechazo ante peticiones explícitas o potencialmente peligrosas, lo que permite una generación sin censura (dentro de los límites del conocimiento del modelo).
- No se indican capacidades de visión ni audio; es un modelo de solo texto.

## Casos de uso

- **Investigación en IA sin restricciones**: para estudiar el comportamiento de modelos sin capas de seguridad, por ejemplo en investigación sobre sesgos o alineación.
- **Generación creativa explícita**: creación de narrativas, diálogos o contenido para adultos sin filtros, útil en proyectos de escritura creativa o juegos de rol.
- **Pruebas de robustez de sistemas**: para evaluar cómo un modelo responde ante prompts maliciosos o manipulativos, aunque esto debe hacerse en entornos controlados.
- **Desarrollo de herramientas de código**: dado su rendimiento en código, puede integrarse en editores de código o asistentes de programación, aunque hay que tener en cuenta que la eliminación de rechazos podría generar código inseguro si se pide explícitamente.
- **Simulación de agentes sin restricciones**: en entornos de investigación sobre agentes autónomos que requieren respuestas sin censura, por ejemplo, en juegos o simulaciones.
- **Generación de contenido para pruebas de moderación**: para entrenar o evaluar sistemas de moderación de contenido, generando ejemplos de texto que un sistema de filtrado debe detectar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la variante derestringida en la información disponible. El modelo base GLM-4.6 reporta mejoras sobre GLM-4.5 en ocho benchmarks públicos de agentes, razonamiento y código, y se compara favorablemente con DeepSeek-V3.1-Terminus y Claude Sonnet 4, pero no se proporcionan cifras concretas en la model card. Dado que el proceso de derestricción no modifica la arquitectura ni los pesos más allá de la eliminación del vector de rechazo, es probable que el rendimiento en tareas de razonamiento se mantenga o incluso mejore, según afirma el autor, pero no hay datos verificables en esta fuente.

## Requisitos de hardware

- El modelo tiene 356,8 mil millones de parámetros en fp16, lo que ocupa aproximadamente 713 GB en memoria (según el tamaño del repositorio).
- Para inferencia en fp16 se requieren múltiples GPUs de alta gama, como A100 (80 GB), H100 (80 GB) o A100 80GB en configuraciones de 8 o más GPUs.
- No cabe en GPUs de consumo (RTX 4090, 3090, etc.) en su formato completo. Con cuantización W4A16 (GPTQ) se podría reducir a aproximadamente 178 GB, lo que aún supera la memoria de una sola GPU de consumo; se necesitaría al menos 2-3 GPUs de 48 GB (como A6000 o RTX 6000 Ada).
- Opciones de despliegue: se puede usar con vLLM, llama.cpp (para cuantizaciones GGUF, si están disponibles), Ollama, TGI (Text Generation Inference) o Hugging Face Inference Endpoints, siempre que se disponga de suficiente memoria.
- Latencia y throughput: no se han publicado datos específicos. Para un modelo de este tamaño, se espera una latencia de varios segundos por token en configuraciones multi-GPU sin optimizaciones de batching.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| GLM-4.6-Derestricted-v3 | 356,8B | 200k | MIT | Derestringido, sin rechazo, basado en GLM-4.6 |
| GLM-4.6 (base) | 356,8B | 200k | MIT | Modelo original con rechazo y moderación |
| DeepSeek-V3.1-Terminus | no disponible | no disponible | no disponible | Mencionado como competidor en benchmarks de GLM-4.6 |
| Claude Sonnet 4 | no disponible | no disponible | no disponible | Competidor comercial, no open-source |

No se dispone de datos concretos de rendimiento comparativo entre estas opciones, ya que no se han publicado benchmarks de la variante derestringida. La comparación se basa en las afirmaciones de la model card de GLM-4.6.

## Limitaciones y advertencias

- El modelo es "derestricted": no tiene filtros de rechazo, por lo que puede generar contenido dañino, ilegal, violento o explícito si se le solicita. El usuario es responsable de su uso.
- La eliminación del vector de rechazo puede introducir inestabilidad en el comportamiento, aunque la técnica de bi-proyección pretende minimizarlo, no hay garantía de que el modelo no presente alucinaciones o respuestas incoherentes en temas sensibles.
- El modelo base GLM-4.6 tiene una licencia original que puede restringir su uso comercial; la variante derestringida está publicada bajo MIT, pero hay que verificar si la licencia del modelo base permite esa redistribución.
- No se especifican idiomas; es probable que tenga un rendimiento óptimo en inglés y chino, pero puede fallar en otros idiomas.
- Al ser una versión modificada sin entrenamiento adicional, puede no haber sido evaluada exhaustivamente para tareas de seguridad, por lo que su comportamiento en producción es impredecible.
- La memoria requerida es muy alta; para uso práctico se necesitan múltiples GPUs de nivel servidor, lo que limita su despliegue a entornos empresariales o de investigación.

## Enlaces

- Repositorio de Hugging Face del modelo: https://huggingface.co/Cultxre/GLM-4.6-Derestricted-v3
- Modelo base GLM-4.6 (cerebras): https://huggingface.co/cerebras/GLM-4.6
- Modelo original derestringido de Arli AI: https://huggingface.co/ArliAI/GLM-4.6-Derestricted
- Cuantización FP8: https://huggingface.co/ArliAI/GLM-4.6-Derestricted-FP8
- Cuantización INT8: https://huggingface.co/ArliAI/GLM-4.6-Derestricted-W8A8-INT8
- Cuantización W4A16: https://huggingface.co/ArliAI/GLM-4.6-Derestricted-GPTQ-W4A16
- Blog técnico de GLM-4.6: https://z.ai/blog/glm-4.6
- Reporte técnico de GLM-4.5 (arxiv): https://arxiv.org/abs/2508.06471
- Documentación de Zhipu AI: https://zhipu-ai.feishu.cn/wiki/Gv3swM0Yci7w7Zke9E0crhU7n7D
- Repositorio GitHub de GLM-4.5: https://github.com/zai-org/GLM-4.5
- Artículo sobre Norm-Preserving Biprojected Abliteration: https://huggingface.co/blog/grimjim/norm-preserving-biprojected-abliteration
- Página de ModelScope: https://www.modelscope.cn/models/ArliAI/GLM-4.6-Derestricted-v3
- API de FriendliAI: https://friendli.ai/models/tactBagel/GLM-4.6-Derestricted-v3
