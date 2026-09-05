# OliviaRossi/QuadQwen-Q4_K_M-GGUF

## Resumen

QuadQwen es un modelo de lenguaje de texto puro de tipo causal, desarrollado por Olivia Rossi, que se presenta como una fusión experimental de modelos de la familia Qwen3, Qwen3.5 y Qwen3.6 mediante las técnicas DARE-TIES y SLERP. Con una arquitectura de mezcla de expertos (MoE) que combina atención híbrida y capas gated-deltanet, el modelo está diseñado para destacar en tareas de generación de código agéntica, razonamiento autónomo, interacción multi-turno con entornos y verificación multi-paso. El checkpoint original (OliviaRossi/QuadQwen) se ha cuantizado a formato GGUF Q4_K_M para su uso con llama.cpp, con un tamaño de archivo de 21.2 GB y aproximadamente 34.660 millones de parámetros en total. No se especifica la longitud de contexto en la información disponible, aunque el modelo se describe como un motor de razonamiento y codificación agéntica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido (atención híbrida + gated-deltanet), basado en fusión de Qwen3/3.5/3.6 |
| Parametros totales | 34.660.610.688 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (en este repo GGUF) |
| Idiomas soportados | inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

QuadQwen es un modelo de lenguaje causal de texto puro con arquitectura de mezcla de expertos (MoE). Según la descripción del autor, incorpora una combinación de atención híbrida y capas gated-deltanet, lo que sugiere un diseño orientado a optimizar el coste computacional manteniendo capacidades de razonamiento. El checkpoint es el resultado de una fusión de modelos de la familia Qwen3, Qwen3.5 y Qwen3.6, realizada mediante las técnicas DARE-TIES y SLERP. No se dispone de información detallada sobre los datos de entrenamiento, el número de tokens utilizados ni si se aplicaron procesos de RLHF o DPO; la información disponible solo describe el modelo como un motor agéntico de código y razonamiento que combina generación de código agéntica, trazas de razonamiento autónomas, interacción multi-turno con el entorno y verificación multi-paso.

## Capacidades

- Generación de código agéntica: diseñado para tareas de codificación en entornos interactivos.
- Razonamiento autónomo: produce trazas de razonamiento antes de responder.
- Interacción multi-turno: mantiene conversaciones y puede interactuar con entornos en varios pasos.
- Verificación multi-paso: incorpora mecanismos de verificación para tareas complejas.
- Tool calling / function calling: se menciona explícitamente en las etiquetas del modelo.
- Capacidades multilingües: soporta inglés y chino.
- Agentes: opera como un agente de codificación y razonamiento.

## Casos de uso

- Asistente de programación agéntico: el modelo puede resolver tareas de código en un entorno interactivo, ejecutando pruebas y verificando resultados paso a paso, lo que lo hace adecuado para flujos de desarrollo automatizados.
- Automatización de desarrollo de software: integración en pipelines de CI/CD para generar código, refactorizar o documentar, gracias a su soporte de tool calling y su capacidad de razonamiento.
- Agentes de soporte técnico con razonamiento: en entornos multi-turno, el modelo puede gestionar consultas complejas que requieren encadenar varios pasos, como diagnóstico de errores o resolución de incidencias técnicas.
- Análisis de código y revisión: puede razonar sobre fragmentos de código y detectar problemas de lógica, estilo o seguridad, aprovechando su capacidad de razonamiento autónomo.
- Traducción y generación de documentación técnica: al soportar inglés y chino, resulta útil para producir documentación bilingüe y traducir comentarios técnicos.
- Prototipado rápido de aplicaciones: mediante tool calling, puede orquestar llamadas a APIs y construir scripts o microservicios de forma incremental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa aproximadamente 21.2 GB, por lo que se estima que se necesitan al menos 24 GB de VRAM para la inferencia básica, y más si se utiliza una ventana de contexto larga. Esta es una estimación orientativa, no un dato oficial.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB), A100 40/80 GB, H100 80 GB.
- Compatibilidad con GPU de consumo: sí, en GPUs con 24 GB de VRAM como RTX 3090 o 4090, siempre que se ajuste la ventana de contexto.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (importando el GGUF), o cualquier framework que soporte GGUF. No se recomienda vLLM ni TGI para este formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada. El modelo es una fusión de la familia Qwen3/3.5/3.6, pero no se han publicado datos de comparación. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se han publicado análisis de sesgos específicos para este modelo. Como modelo de lenguaje generativo, puede reflejar sesgos presentes en los datos de entrenamiento de los modelos base.
- Riesgo de alucinación: al ser un modelo de texto generativo, existe riesgo de alucinación, especialmente en tareas de razonamiento complejo o cuando la información requerida no está en el contexto.
- Limitaciones de contexto o idioma: la longitud de contexto no se especifica en la información disponible. Solo se documentan dos idiomas: inglés y chino. El uso en otros idiomas no está garantizado.
- Restricciones de licencia para uso comercial: licencia Apache 2.0, que permite uso comercial con atribución y sin copyleft.
- Caveat importante: es un modelo experimental resultante de una fusión de varios checkpoints. Su comportamiento puede ser menos predecible que el de un modelo entrenado desde cero. No hay evidencia de validación externa ni benchmarks publicados, por lo que se recomienda probar exhaustivamente antes de usar en producción.

## Enlaces

- https://huggingface.co/OliviaRossi/QuadQwen-Q4_K_M-GGUF
- https://huggingface.co/OliviaRossi/QuadQwen
- https://huggingface.co/spaces/ggml-org/gguf-my-repo
