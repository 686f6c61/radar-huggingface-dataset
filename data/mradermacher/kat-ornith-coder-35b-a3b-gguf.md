# mradermacher/KAT-Ornith-Coder-35B-A3B-GGUF

## Resumen

KAT-Ornith-Coder-35B-A3B-GGUF es la versión cuantizada en formato GGUF del modelo KAT-Ornith-Coder-35B-A3B, un modelo de lenguaje de arquitectura Mixture of Experts (MoE) orientado a programación agéntica, publicado originalmente por OliviaRossi. Esta variante la distribuye mradermacher, un conocido cuantizador de la comunidad de Hugging Face, y su propósito es facilitar la ejecución local del modelo en hardware de consumo mediante el formato GGUF y la librería llama.cpp.

El modelo cuenta con 34.660.610.688 parámetros totales (aproximadamente 34,7 mil millones) y, según las etiquetas de su model card, emplea una arquitectura híbrida de atención con componentes tipo DeltaNet, además de estar construido como un merge mediante la técnica DARE-TIES. Las etiquetas también lo vinculan a las familias Qwen 3.5 y Qwen 3.6, lo que sugiere que su linaje parte de modelos base de esa familia, aunque la model card no detalla la composición exacta del merge.

Su relevancia actual radica en que combina un tamaño de parámetros moderado (apto para GPUs de gama alta de consumo en cuantizaciones bajas) con un enfoque específico en tareas de agente de código y SWE-bench, un nicho de creciente interés para pipelines de desarrollo automatizado. La licencia Apache 2.0 facilita su uso comercial, y la disponibilidad de cuantizaciones desde Q2_K hasta Q8_0 amplía el rango de hardware capaz de ejecutarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida (etiqueta "hybrid-attention", componente "deltanet" según tags); merge DARE-TIES |
| Parametros totales | 34.660.610.688 (≈34,7 B) |
| Parametros activos | no disponible (el nombre indica A3B, es decir, ≈3 B activos, pero no se confirma en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en, zh, code |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La información disponible indica que se trata de un modelo MoE con atención híbrida, etiquetado con los términos "hybrid-attention" y "deltanet". DeltaNet es una variante de atención lineal basada en reglas de actualización delta, habitualmente combinada con capas de atención completa en arquitecturas híbridas para reducir el coste computacional en contextos largos. El modelo se ha construido mediante un merge con la técnica DARE-TIES, que combina los pesos de varios modelos especializados podando deltas redundantes y resolviendo conflictos de signo entre tensores. Las etiquetas "qwen3.5" y "qwen3.6" apuntan a que los modelos de origen pertenecen a esas familias, si bien la model card no especifica qué modelos concretos se fusionaron ni con qué proporciones.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases de RLHF o DPO tras el merge. Tampoco se detalla la innovación técnica concreta más allá de las etiquetas mencionadas. Todo lo relativo al proceso de entrenamiento y a la receta del merge debe considerarse no disponible en la información proporcionada.

## Capacidades

- Generación de código: el modelo está etiquetado como "agentic-coding" y "coding-agent", lo que indica un ajuste orientado a tareas de programación dentro de flujos agénticos.
- Razonamiento multi-paso para agentes: la etiqueta "swe-bench" sugiere capacidades orientadas a resolver incidencias de software en repositorios, típicamente mediante iteraciones de exploración, edición y verificación.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información proporcionada.
- Capacidades multilingües: inglés, chino y código, según el campo `language` de la model card.
- Conversación: la etiqueta "conversational" y el pipeline de endpoints compatibles indican uso en diálogo multi-turno.
- No se ha confirmado soporte de visión, audio ni modo de razonamiento explícito (thinking mode) en la información disponible.

## Casos de uso

- Resolución automática de incidencias en repositorios (estilo SWE-bench): el modelo puede recibir un issue, explorar el código, proponer un parche y validarlo; su etiqueta "swe-bench" lo orienta específicamente a este escenario.
- Asistente de programación en IDE con ejecución local: gracias a las cuantizaciones Q4_K_M (21,3 GB) o IQ4_XS (19,0 GB), puede desplegarse en una estación de trabajo con GPU de 24 GB y ofrecer autocompletado y explicación de código sin enviar datos a la nube.
- Agente de CI/CD para revisión de pull requests: integrado mediante llama.cpp o un servidor compatible con la API de OpenAI, puede analizar diffs, señalar riesgos y sugerir cambios antes de la fusión.
- Generación de tests unitarios a partir de código existente: el modelo puede leer funciones y producir casos de prueba en el lenguaje del proyecto, aprovechando su entrenamiento en código y su capacidad conversacional para iterar sobre los resultados.
- Migración y refactorización de bases de código: con un contexto suficientemente amplio (no confirmado), puede procesar varios ficheros y proponer transformaciones coherentes, útil en tareas de actualización de dependencias o cambios de API.
- Documentación técnica automatizada: generar docstrings, README y comentarios a partir del código fuente, con soporte para inglés y chino en la documentación resultante.
- Agente de soporte para desarrolladores internos: desplegado sobre el código propietario de una empresa, puede responder preguntas sobre la arquitectura del repositorio manteniendo los datos en infraestructura propia gracias a la licencia Apache 2.0 y al formato GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de fichero GGUF, más overhead de contexto y caché KV):
  - Q2_K: ≈13,0 GB
  - Q3_K_M: ≈16,9 GB
  - IQ4_XS: ≈19,0 GB
  - Q4_K_M: ≈21,3 GB
  - Q5_K_M: ≈24,8 GB
  - Q6_K: ≈28,6 GB
  - Q8_0: ≈37,0 GB
- GPU recomendadas:
  - Q4_K_M o IQ4_XS: RTX 3090 / RTX 4090 (24 GB) con margen ajustado para contexto.
  - Q5_K_M y Q6_K: A6000 (48 GB), RTX 5090 (32 GB, solo Q5) o A100 40 GB.
  - Q8_0: A100 80 GB o H100.
- ¿Cabe en GPU de consumo? Sí: las cuantizaciones Q2_K a Q4_K_M caben en GPUs de 16-24 GB; Q2_K y Q3_K_S podrían ejecutarse incluso en tarjetas de 16 GB con contexto reducido.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, servidores compatibles con la API de OpenAI basados en llama.cpp (p. ej., llama-server). vLLM y TGI no son opciones directas para GGUF en la mayoría de configuraciones; para esos motores habría que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles. Al ser un MoE con aproximadamente 3 B de parámetros activos (según el nombre), se espera un throughput superior al de un modelo denso de 35 B, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| KAT-Ornith-Coder-35B-A3B (este) | 34,7 B totales (≈3 B activos, según nombre) | no disponible | Apache 2.0 | GGUF / safetensors | Merge DARE-TIES, enfoque agéntico de código |
| Qwen2.5-Coder-32B | 32,5 B densos | 128 K (versión base) | Apache 2.0 | safetensors, GGUF | Referencia consolidada en código; denso, mayor coste por token |
| DeepSeek-Coder-V2-Lite | 15,7 B totales (2,4 B activos) | 128 K | DeepSeek License (con restricciones) | safetensors, GGUF | MoE de código más pequeño; licencia no plenamente permisiva |
| CodeLlama-34B | 34 B densos | 16 K | Llama 2 Community License | safetensors, GGUF | Referencia antigua; contexto corto y licencia restrictiva |

La comparación se basa en categoría y tamaño; no se dispone de resultados de benchmarks del modelo para contrastar rendimiento real frente a estas alternativas.

## Limitaciones y advertencias

- Al ser un merge DARE-TIES, el comportamiento puede ser menos predecible que el de un modelo entrenado de forma monolítica; los merges pueden heredar sesgos o inconsistencias de los modelos de origen.
- Riesgo de alucinación en código: como todo modelo generativo, puede producir APIs inexistentes, imports erróneos o parches que compilan pero no resuelven el problema; se requiere verificación automática (tests, linters) en producción.
- Idiomas limitados a inglés, chino y código: el rendimiento en castellano no está garantizado ni documentado.
- Longitud de contexto no documentada: planificar el despliegue sin asumir una ventana concreta; verificar en la model card del modelo base.
- No se han publicado evaluaciones de sesgo, toxicidad ni robustez para esta variante cuantizada.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad; para uso en producción se recomienda Q4_K_M o superior.
- Aunque la licencia es Apache 2.0, conviene revisar las licencias de los modelos de origen del merge por si imponen condiciones adicionales no reflejadas en esta ficha.
- El repositorio tiene 0 likes y 283 descargas en el momento de la consulta: es un modelo de nicho con poca validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/KAT-Ornith-Coder-35B-A3B-GGUF
- Modelo base: https://huggingface.co/OliviaRossi/KAT-Ornith-Coder-35B-A3B
- Página de descargas del cuantizador: https://hf.tst.eu/model#KAT-Ornith-Coder-35B-A3B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
