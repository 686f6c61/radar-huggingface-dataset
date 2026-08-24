# bgg1996/Melinoe-Qwen3-8-27B-VL-Q4_K_M-GGUF

## Resumen

Este repositorio contiene la conversión a formato GGUF con cuantización Q4_K_M del modelo **bgg1996/Melinoe-Qwen3-8-27B-VL**, una variante de la familia Qwen3.8-27B de Alibaba. Se trata de un modelo denso de 27 mil millones de parámetros orientado a tareas de visión y lenguaje (VLM), diseñado para ser compacto y desplegable en entornos de producción con requisitos moderados de memoria.

La conversión GGUF permite ejecutar el modelo con llama.cpp, llama-server y otras herramientas del ecosistema GGUF, lo que facilita su uso en CPU, GPU y dispositivos de borde. La cuantización Q4_K_M ofrece un equilibrio entre tamaño y calidad de salida, con un peso total de aproximadamente 16,8 GB. El modelo base hereda la arquitectura híbrida de atención de Qwen3.8-27B, que combina capas de atención completa con capas de atención lineal, y está optimizado para codificación, razonamiento profesional, investigación y tareas agénticas de largo horizonte.

La relevancia de esta publicación radica en que permite a desarrolladores e investigadores ejecutar un modelo de 27B con capacidades multimodales en hardware de consumo, sin necesidad de infraestructura especializada. No obstante, la documentación disponible en este repositorio es mínima: no se incluyen detalles sobre el dataset de entrenamiento, el proceso de fine-tuning ni los benchmarks del modelo original, por lo que gran parte de las especificaciones deben inferirse de la familia Qwen3.8.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (16 capas full attention + 48 capas linear attention) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (este repositorio); se desconoce si hay otras cuantizaciones |
| Idiomas soportados | no disponible (se presume multilingüe, pero no confirmado) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura del modelo base, Qwen3.8-27B, emplea un backbone de atención híbrida: de las 64 capas totales, solo 16 utilizan atención completa (con un intervalo de full attention de 4), mientras que las 48 restantes usan atención lineal con un estado recurrente constante. Esta configuración reduce el coste computacional en secuencias largas y mejora la eficiencia en inferencia, manteniendo la capacidad de capturar dependencias globales mediante las capas de atención completa.

No se dispone de información sobre el entrenamiento específico del modelo Melinoe-Qwen3-8-27B-VL: se desconoce el número de tokens de entrenamiento, la composición del dataset, si se aplicaron técnicas de RLHF, DPO o fine-tuning adicional sobre la base de Qwen3.8-27B. El repositorio GGUF no incluye detalles más allá de la conversión de formato, y la model card del modelo original no está disponible en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento: capacidades avanzadas en codificación, trabajo profesional, investigación y tareas que requieren razonamiento multi-paso.
- Visión y lenguaje: al ser un VLM, puede procesar imágenes y responder preguntas sobre ellas, aunque no se detalla el tipo de soporte visual en la documentación.
- Tareas agénticas: optimizado para planificación autónoma y manejo de feedback del entorno, mejorando la fiabilidad en tareas complejas de múltiples pasos.
- Decodificación especulativa: soporta MTP (multi-token prediction) para acelerar la inferencia cuando la VRAM lo permite.
- Integración con herramientas: compatible con el ecosistema llama.cpp y llama-server para despliegue local.
- Multilingüismo: no se especifican los idiomas soportados, pero se asume herencia de la familia Qwen, que incluye chino e inglés.

## Casos de uso

- **Asistentes de codificación en producción**: el modelo puede integrarse en pipelines de CI/CD para autocompletar código, revisar parches o generar documentación técnica, aprovechando su capacidad de razonamiento y su contexto largo.
- **Análisis de documentos con imágenes**: procesar capturas de pantalla, diagramas o formularios escaneados para extraer información estructurada, gracias a su naturaleza VLM.
- **Agentes autónomos para automatización**: ejecutar tareas de múltiples pasos en entornos simulados o reales, como la gestión de tickets, la actualización de bases de conocimiento o la coordinación de APIs.
- **Chatbots de atención al cliente**: desplegar en servidores llama.cpp con cuantización Q4_K_M para gestionar conversaciones multi-turno con contexto moderado, sin necesidad de GPUs de alta gama.
- **Investigación en visión-lenguaje**: evaluar el rendimiento del modelo en benchmarks propios de VQA, captioning o grounding visual, comparando con otras cuantizaciones.
- **Prototipado rápido en entornos locales**: usar llama-server para levantar una API REST compatible con OpenAI y probar el modelo en aplicaciones de desarrollo antes de escalar a infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio GGUF no incluye mediciones de rendimiento, y la model card del modelo original no es accesible. Se recomienda consultar la documentación de Qwen3.8-27B para conocer los resultados esperados en tareas de lenguaje y visión, pero no se pueden aportar cifras concretas sin datos verificables.

## Requisitos de hardware

- **VRAM estimada**: para una cuantización Q4_K_M de 27B parámetros, se necesitan aproximadamente 16-18 GB de VRAM para inferencia completa en GPU, y algo menos si se descarga el modelo en CPU con offload parcial.
- **GPU recomendadas**: tarjetas con 24 GB de VRAM (RTX 3090, RTX 4090) son ideales para ejecutar el modelo completo en GPU. También puede funcionar en GPUs de 16 GB con offload a CPU o con cuantizaciones más agresivas (no incluidas en este repo).
- **Compatibilidad con consumer GPU**: sí, cabe en GPUs de gama alta como la RTX 4090, pero no en tarjetas de 8 GB.
- **Opciones de despliegue**: llama.cpp (CLI y servidor), llama-server, y cualquier herramienta compatible con GGUF como Ollama o LM Studio.
- **Latencia y throughput**: no disponible. Dependerá del hardware, del tamaño de la secuencia y del uso de técnicas como MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Melinoe-Qwen3-8-27B-VL (GGUF Q4_K_M) | 27,3B | no disponible | Apache-2.0 | GGUF | VLM, atención híbrida |
| Qwen3.8-27B (base) | 27B | no disponible | Apache-2.0 | safetensors | Modelo original de Alibaba |
| Qwen2.5-32B | 32B | 128K | Apache-2.0 | safetensors/GGUF | Alternativa densa sin visión |

No se dispone de benchmarks comparativos entre estas opciones. La elección dependerá de las necesidades de visión, el presupuesto de memoria y la disponibilidad de cuantizaciones.

## Limitaciones y advertencias

- **Falta de documentación**: no hay información sobre el proceso de entrenamiento del modelo Melinoe, su dataset específico ni las modificaciones respecto al base Qwen3.8-27B.
- **Alucinación y sesgos**: como todo modelo de lenguaje, puede generar contenido plausible pero incorrecto, especialmente en contextos largos o con imágenes ambiguas. No se han publicado estudios de sesgo.
- **Limitaciones de contexto**: la longitud de contexto no se especifica, por lo que se recomienda probar con secuencias cortas (p. ej., 2048 tokens) en el servidor llama.cpp.
- **Riesgo en producción**: al ser una cuantización Q4_K_M, puede haber degradación en tareas que requieren alta precisión numérica (p. ej., matemáticas complejas). Evaluar antes de desplegar.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero se debe verificar el cumplimiento de la licencia del modelo base Qwen3.8-27B.
- **Soporte de visión**: la cuantización GGUF puede no incluir el proyector de visión (mmproj) necesario para procesar imágenes. Se recomienda comprobar si se necesita el archivo separado.

## Enlaces

- Repositorio del modelo: [bgg1996/Melinoe-Qwen3-8-27B-VL-Q4_K_M-GGUF](https://huggingface.co/bgg1996/Melinoe-Qwen3-8-27B-VL-Q4_K_M-GGUF)
- Modelo base: [bgg1996/Melinoe-Qwen3-8-27B-VL](https://huggingface.co/bgg1996/Melinoe-Qwen3-8-27B-VL)
- Modelo original de Qwen: [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- Página en LM Studio: [qwen3.8-27b](https://lmstudio.ai/models/qwen/qwen3.8-27b)
- Página en Ollama: [smtek/Qwen3.8-27B](https://ollama.com/smtek/Qwen3.8-27B)
- Recetas vLLM: [Qwen/Qwen3.8-27B](https://recipes.vllm.ai/Qwen/Qwen3.8-27B)
