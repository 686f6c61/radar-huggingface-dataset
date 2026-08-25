# OliviaRossi/Qwopus-KAT-Coder-35B-Merged

## Resumen

Qwopus-KAT-Coder-35B-Merged es un modelo de lenguaje de código abierto creado por OliviaRossi mediante la fusión de dos modelos de Mixture-of-Experts (MoE) especializados en programación: Jackrong/Qwopus3.6-35B-A3B-Coder y Kwaipilot/KAT-Coder-V2.5-Dev. El modelo resultante combina las capacidades de razonamiento multi-paso y síntesis lógica del primero con las habilidades de llamada a herramientas y flujos de trabajo de ingeniería de software autónoma del segundo. Está diseñado para tareas de codificación agéntica, donde el modelo debe leer archivos, elegir herramientas, editar código, ejecutar pruebas y reaccionar a errores de forma iterativa.

La arquitectura es un MoE híbrido y disperso con 68.164 millones de parámetros totales, aunque el nombre "35B" sugiere que los parámetros activos por token son considerablemente menores. Utiliza atención lineal híbrida GatedDeltaNet con atención estándar periódica, una combinación que busca equilibrar eficiencia computacional con calidad de razonamiento. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas, y está disponible en formato safetensors. Su relevancia actual radica en la tendencia hacia modelos de codificación agénticos que pueden ejecutarse localmente en GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido disperso (40 capas, 256 expertos enrutados, 8 activos por token + 1 experto compartido) con atención lineal GatedDeltaNet y atención estándar periódica |
| Parametros totales | 68.164.077.424 |
| Parametros activos | no disponible (el nombre "35B" sugiere ~35B, pero no se confirma) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato original safetensors; se esperan cuantizaciones GGUF/AWQ de la comunidad) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura combina un backbone MoE disperso con 40 capas, 256 expertos enrutados de los cuales 8 se activan por token junto con un experto compartido. La atención es híbrida: utiliza GatedDeltaNet, una variante de atención lineal, intercalada con atención estándar periódica. Esta combinación busca reducir el coste computacional del mecanismo de atención manteniendo la capacidad de modelar dependencias de largo alcance. La fusión se realizó mediante interpolación lineal esférica (SLERP) con alpha=0.5 sobre los pesos de atención y MoE de alta dimensión, y LERP para las capas de normalización y embeddings.

No se dispone de información sobre el proceso de entrenamiento del modelo fusionado, como el número de tokens, la composición del dataset o si se aplicaron técnicas de RLHF o DPO. Los modelos base sí tienen historial conocido: Qwopus3.6-35B-A3B-Coder es un fine-tuning de la serie Qwen3.6 centrado en razonamiento multi-paso y eficiencia en flujos agénticos, mientras que KAT-Coder-V2.5-Dev está especializado en llamada a herramientas a nivel de repositorio y flujos SWE autónomos. El merge busca heredar ambas capacidades sin necesidad de reentrenamiento.

## Capacidades

- Generación de código y razonamiento multi-paso: heredado de Qwopus3.6-35B-A3B-Coder, con énfasis en síntesis lógica y ejecución eficiente de pasos de razonamiento.
- Llamada a herramientas (tool calling) a nivel de repositorio: heredado de KAT-Coder-V2.5-Dev, permite al modelo interactuar con archivos, ejecutar comandos y gestionar flujos de trabajo de ingeniería de software.
- Flujos de codificación agéntica: el modelo está diseñado para ciclos iterativos de leer archivos, elegir herramientas, editar código, ejecutar pruebas y reaccionar a errores.
- Capacidades multimodales: el pipeline declarado es image-text-to-text, lo que sugiere que puede procesar imágenes además de texto, aunque no se detallan las capacidades específicas.
- Soporte de agentes: la combinación de razonamiento multi-paso y tool calling lo hace adecuado para tareas de agente autónomo.
- Multilingüismo: no disponible, aunque al derivar de la serie Qwen es probable que herede soporte multilingüe.

## Casos de uso

- Asistente de codificación en IDE: el modelo puede integrarse en editores como VS Code para sugerir código, refactorizar funciones y explicar fragmentos complejos, aprovechando su razonamiento multi-paso y su capacidad para manejar contexto de archivos completos.
- Agente de resolución de incidencias (issue resolution): dado un repositorio y una descripción de bug, el modelo puede localizar el archivo relevante, proponer un parche y ejecutar pruebas para verificar la solución, gracias a su tool calling a nivel de repositorio.
- Generación de código en pipelines CI/CD: puede integrarse en flujos de integración continua para generar tests unitarios, documentación o incluso código de producción a partir de especificaciones, con supervisión humana.
- Automatización de tareas de mantenimiento de código: el modelo puede encargarse de tareas repetitivas como actualizar dependencias, migrar APIs obsoletas o aplicar cambios de estilo de código en un repositorio completo.
- Chatbot técnico especializado en programación: puede usarse como backend de un asistente conversacional que responda preguntas sobre APIs, algoritmos o mejores prácticas, manteniendo contexto largo de la conversación.
- Prototipado rápido de aplicaciones: un desarrollador puede describir una funcionalidad en lenguaje natural y el modelo genera el código inicial, iterando sobre los errores de compilación o ejecución hasta obtener una versión funcional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los modelos base tienen métricas conocidas (KAT-Coder-V2.5-Dev reporta estado del arte en conocimiento, matemáticas y codificación entre modelos no-thinking), pero no hay datos específicos para el modelo fusionado.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Con 68B parámetros totales y arquitectura MoE, la VRAM necesaria depende de los parámetros activos y la cuantización. Si los activos son ~35B, una cuantización de 4 bits requeriría aproximadamente 20-24 GB de VRAM, lo que cabría en una RTX 3090/4090. Sin cuantizar, se necesitarían más de 100 GB.
- GPU recomendadas: para inferencia local con cuantización, RTX 3090, RTX 4090, A100 40GB o superiores. Para despliegue en producción, A100 80GB o H100.
- Compatibilidad con GPU de consumo: sí, si se usa cuantización GGUF/AWQ y los parámetros activos son ~35B. Con cuantización de 4 bits, una RTX 4090 de 24 GB podría ser suficiente.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, todos compatibles con modelos MoE y safetensors. Para GGUF, se requiere conversión previa.
- Latencia y throughput: no disponible. Depende del hardware, cuantización y número de expertos activos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| Qwopus-KAT-Coder-35B-Merged | 68B totales (activos ~35B) | no disponible | Codificación agéntica, tool calling | Apache 2.0 |
| KAT-Coder-V2.5-Dev | 32B activos, 1T totales | no disponible | Codificación, SWE autónomo | no disponible |
| Qwopus3.6-35B-A3B-Coder | 35B (MoE) | no disponible | Razonamiento multi-paso, codificación | no disponible |
| DeepSeek-Coder-V2-Lite | 16B totales (2.4B activos) | 128K | Codificación, matemáticas | DeepSeek License |

La comparativa se basa en datos públicos de los modelos base. El modelo fusionado busca combinar las fortalezas de los dos primeros, pero no hay benchmarks propios que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible, pero al derivar de modelos de codificación, puede tener sesgos hacia estilos de programación predominantes en sus datos de entrenamiento.
- Riesgo de alucinación: presente en todos los modelos de lenguaje, especialmente en generación de código donde puede producir APIs inexistentes o lógica incorrecta. Se recomienda verificación humana.
- Limitaciones de contexto: la longitud de contexto no está documentada, lo que dificulta planificar su uso en tareas que requieran ventanas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero los modelos base pueden tener licencias diferentes. Se debe verificar la licencia de los modelos base para evitar conflictos.
- Caveat de producción: al ser un merge sin fine-tuning posterior, puede haber inconsistencias en el comportamiento entre las capacidades heredadas. Se recomienda evaluación exhaustiva antes de desplegar en producción.
- Soporte de visión: aunque el pipeline es image-text-to-text, no se detallan las capacidades multimodales reales. Puede que el merge no preserve completamente esta funcionalidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OliviaRossi/Qwopus-KAT-Coder-35B-Merged
- Modelo base Qwopus3.6-35B-A3B-Coder: https://huggingface.co/Jackrong/Qwopus3.6-35B-A3B-Coder
- Modelo base KAT-Coder-V2.5-Dev: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Página del proyecto KAT-Coder: https://kwaipilot.github.io/KAT-Coder/
- Repositorio del agente Qwopus: https://github.com/codespermuted/qwopus
- Cuantización GGUF de Qwopus3.6-35B-A3B-Coder: https://huggingface.co/Jackrong/Qwopus3.6-35B-A3B-Coder-MTP-GGUF
- Perfil de Jackrong en HuggingFace: https://huggingface.co/Jackrong/collections
- Vídeo sobre KAT-Coder V2.5: https://www.youtube.com/watch?v=cbb4KffkmMc
