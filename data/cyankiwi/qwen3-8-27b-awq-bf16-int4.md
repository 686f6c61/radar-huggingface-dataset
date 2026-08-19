# cyankiwi/Qwen3.8-27B-AWQ-BF16-INT4

## Resumen

Qwen3.8-27B es un modelo de lenguaje multimodal de 27 000 millones de parametros desarrollado por el equipo Qwen de Alibaba, publicado en agosto de 2026 como parte de la generacion Qwen3.8. Se trata de un modelo denso con vision encoder nativo que comprende tanto imagenes como videos, disenado para tareas de codificacion, trabajo profesional, investigacion y ejecucion de agentes de larga duracion. La version aqui descrita, `cyankiwi/Qwen3.8-27B-AWQ-BF16-INT4`, es una cuantizacion AWQ con pesos mixtos BF16 e INT4, creada por el usuario cyankiwi, que reduce el tamano del modelo para facilitar su despliegue en hardware local sin sacrificar excesivamente la precision.

La arquitectura combina atencion lineal (Gated DeltaNet) con atencion clasica (Gated Attention) en un patron hibrido repetido 16 veces, lo que permite una ventana de contexto nativa de 262 144 tokens, extensible hasta 1 millon. El modelo incorpora un modo de razonamiento ("thinking") activado por defecto, controlable mediante `reasoning_effort` y `preserve_thinking`, asi como prediccion multi-token (MTP). Su licencia Apache 2.0 permite uso comercial sin restricciones, y los pesos estan disponibles en formato safetensors, compatibles con Transformers, vLLM, SGLang y TokenSpeed.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con Gated DeltaNet (atencion lineal) y Gated Attention (atencion clasica), con vision encoder |
| Parametros totales | 27 781 427 952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativo, extensible hasta 1 000 000 |
| Tipos de cuantizacion | AWQ mixta BF16/INT4 (compressed-tensors) |
| Idiomas soportados | EN, ZH, HI, AR, RU, JA, KO, NL, FR, ES |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con compressed-tensors) |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura causal de lenguaje con un vision encoder integrado. El bloque de lenguaje sigue un patron de capas repetido 16 veces: `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`. La Gated DeltaNet es un mecanismo de atencion lineal con 48 cabezas para V y 16 para QK, con dimension de cabeza 128, que reduce el coste computacional en contextos largos. La Gated Attention es una atencion clasica con 24 cabezas para Q y 4 para KV, dimension de cabeza 256 y RoPE de dimension 64. La capa FFN tiene una dimension intermedia de 17 408. El embedding de tokens es de 248 320 (padded) y la salida LM coincide.

El entrenamiento combina pre-training y post-training. La calibracion de la cuantizacion AWQ se realizo sobre datasets de STEM y tareas agénticas (segun la model card). Se incluye prediccion multi-token (MTP) entrenada con multiples pasos, lo que mejora la velocidad de decodificacion y la coherencia. El modelo soporta un modo de razonamiento flexible: activado por defecto, desactivable por peticion, con control de profundidad via `reasoning_effort` y retencion del contexto de razonamiento historico mediante `preserve_thinking`.

## Capacidades

- Generacion de texto y razonamiento complejo, con modo "thinking" opcional que permite cadenas de razonamiento extensas antes de responder.
- Comprension multimodal nativa: procesa imagenes (diagramas STEM, documentos, graficos) y videos de hasta una hora de duracion.
- Codificacion de software: generacion, revision y depuracion de codigo en multiples lenguajes, con soporte para tareas de programacion competitiva.
- Ejecucion agéntica: planificacion autonoma y manejo de feedback del entorno para completar tareas de multiples pasos de forma fiable.
- Tool calling y function calling: compatible con integraciones de herramientas externas (no detallado en la documentacion, pero comun en la serie Qwen3).
- Multilingue: soporte para 10 idiomas principales, incluyendo ingles, chino, hindi, arabe, ruso, japones, coreano, neerlandes, frances y español.
- Control de razonamiento ajustable: parametros `reasoning_effort` y `preserve_thinking` para equilibrar latencia y calidad.
- Compatibilidad con frameworks de inferencia populares: Transformers, vLLM, SGLang y TokenSpeed.

## Casos de uso

- Asistencia tecnica en codificacion: un desarrollador puede integrar el modelo en su IDE para generar funciones, explicar fragmentos de codigo o sugerir refactorizaciones, aprovechando su contexto de 262K tokens para analizar repositorios completos.
- Analisis de documentos cientificos: el modelo extrae informacion de diagramas, tablas y graficos en papers, y genera resumenes o responde preguntas especificas sobre el contenido, gracias a su vision encoder y su capacidad de razonamiento.
- Automatizacion de oficina: procesa capturas de pantalla, PDFs escaneados o presentaciones, y genera resumenes, actas o borradores de correos, reduciendo tareas administrativas repetitivas.
- Agentes de soporte al cliente: con su modo thinking y su capacidad de tool calling, puede gestionar conversaciones multi-turno, consultar bases de conocimiento y escalar casos complejos a humanos, manteniendo el contexto durante sesiones largas.
- Analisis de video para vigilancia o revision de contenido: procesa videos de hasta una hora para detectar eventos, transcribir dialogos o generar descripciones temporales, util en seguridad o moderacion de contenido.
- Traduccion y localizacion: con soporte para 10 idiomas, puede traducir documentos largos manteniendo coherencia terminologica, y adaptar contenido culturalmente para mercados locales.
- Investigacion academica: asiste en la revision de literatura, generacion de hipotesis y analisis de datos experimentales, combinando razonamiento extenso con comprension de figuras y tablas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio incluye una tabla de benchmarks de texto y vision, pero los valores numericos no han sido proporcionados en los datos consultados. Se recomienda consultar la documentacion oficial de Qwen para obtener cifras comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion AWQ INT4, los pesos del modelo ocupan aproximadamente 14-15 GB (27B parametros × 4 bits ≈ 13,5 GB mas overhead). El tamano del repositorio es de 28,9 GB, lo que sugiere que los pesos en BF16/INT4 mixtos pueden requerir algo mas, pero la cuantizacion INT4 permite ejecucion en GPUs con 24 GB de VRAM.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100, H100, o cualquier GPU con al menos 24 GB de VRAM. Tambien es posible ejecutarlo en Macs con 24 GB de RAM unificada, segun la guia de modelfit.io.
- Compatibilidad con consumer GPU: si, en GPUs de 24 GB como la RTX 3090 o 4090, siempre que se use cuantizacion INT4 y se gestione la memoria con cuidado.
- Opciones de despliegue: compatible con vLLM, SGLang, TokenSpeed y Transformers. Tambien se puede ejecutar via Ollama con el comando `ollama run qwen3.8:27b` (segun la guia de modelfit.io).
- Latencia y throughput: no disponibles en la informacion consultada.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos comparativos con otros modelos en la informacion consultada. Qwen3.8-27B compite en la categoria de modelos densos multimodales de ~27B parametros, donde se situan alternativas como Llama 3.1 8B (menor tamano) o Qwen2.5 32B (generacion anterior), pero no se dispone de datos de rendimiento directos para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Sesgos y alucinaciones: como todo modelo de lenguaje, puede generar contenido falso o inconsistente, especialmente en tareas de razonamiento complejo o con informacion poco frecuente en sus datos de entrenamiento. No se han documentado sesgos especificos en la informacion disponible.
- Limitaciones de contexto: aunque el contexto nativo es de 262K tokens, el rendimiento en contextos muy largos puede degradarse si no se gestiona adecuadamente la memoria; la extension a 1M tokens requiere configuracion especifica.
- Limitaciones de idioma: aunque soporta 10 idiomas, el rendimiento puede ser inferior en idiomas menos representados en el entrenamiento (p. ej., arabe o hindi) en comparacion con ingles o chino.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificacion, pero no se mencionan restricciones adicionales sobre el uso de la cuantizacion especifica de cyankiwi; se recomienda revisar los terminos del repositorio original de Qwen.
- Riesgos en produccion: el modo thinking activado por defecto puede aumentar la latencia; se recomienda ajustar `reasoning_effort` para equilibrar velocidad y calidad. La integracion con herramientas externas requiere validacion rigurosa para evitar acciones no deseadas.
- Dependencia de hardware: para contextos muy largos (cercanos a 1M tokens) se requiere memoria adicional significativa, lo que puede limitar su uso en GPUs de 24 GB.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cyankiwi/Qwen3.8-27B-AWQ-BF16-INT4
- Repositorio oficial de Qwen3.8-27B en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
