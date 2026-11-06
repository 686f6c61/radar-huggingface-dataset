# johnlockejrr/unsloth-Qwen3.8-Flash-Next-HGN

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje causal con codificador de visión desarrollado por el equipo Qwen (Alibaba). Se presenta como una vista previa experimental de la arquitectura que sustentará la próxima generación Qwen4, y su primer lanzamiento con pesos abiertos bajo este diseño. El modelo combina atención híbrida con Qwen Sparse Attention (QSA), Gated Residual y embeddings de n-gramas, con el objetivo de mejorar la eficiencia en contextos largos y cargas de trabajo agénticas sin renunciar a la calidad.

La arquitectura es de tipo Mixture-of-Experts (MoE) con 125.000 millones de parámetros totales y 6.000 millones activos, a los que se suman 51.000 millones en embeddings de n-gramas y 4.000 millones en módulos MTP (Multi-Token Prediction). Consta de 48 capas con una disposición híbrida que intercala bloques de Gated DeltaNet y Qwen Sparse Attention, ambos seguidos de capas MoE. Esta ficha describe la versión publicada por el usuario johnlockejrr, una cuantización GGUF generada con Unsloth Dynamic v3.1 a partir del modelo base Qwen/Qwen3.8-Flash-Next.

La relevancia de este lanzamiento radica en su enfoque en eficiencia arquitectónica más que en escalado bruto de parámetros: la atención dispersa a nivel de micro-bloque reduce la latencia en contextos largos, y los embeddings de n-gramas permiten escalar parámetros con menor coste computacional y posibilidad de offloading. El repositorio ocupa 118,8 GB y está pensado para ejecutarse con llama.cpp o la aplicación Unsloth Desktop.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM con codificador de visión; híbrida Gated DeltaNet + Qwen Sparse Attention (QSA) con capas MoE, Gated Residual y embeddings de n-gramas |
| Parametros totales | 125B (más 51B en embeddings de n-gramas y 4B en MTP) |
| Parametros activos | 6B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (Unsloth Dynamic v3.1); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (repo de 118,8 GB); safetensors no disponible en este repositorio |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida de 48 capas con una disposición de 12 bloques repetidos, cada uno compuesto por tres pares de (Gated DeltaNet → MoE) seguidos de un par (Qwen Sparse Attention → MoE). La dimensión oculta es de 2560, con 48 cabezas de atención lineal para V y 16 para QK en Gated DeltaNet (dimensión de cabeza 128), y 24 cabezas de consulta y 2 de clave-valor en QSA (dimensión de cabeza 256, dimensión RoPE 64). El vocabulario tiene 248.320 tokens (con padding) y los embeddings de n-gramas indexan 20 millones de bigramas y trigramas en la capa 2.

La innovación principal es Qwen Sparse Attention (QSA), que opera a nivel de micro-bloque en lugar de seleccionar tokens individuales, reduciendo la latencia en contextos largos. Gated Residual modula el flujo de información mediante una compuerta de lectura dependiente de datos y una compuerta escalar de escritura por rama, preservando la estabilidad del entrenamiento. Los embeddings de n-gramas permiten escalar parámetros con menor cómputo y facilitan el offloading en aceleradores con memoria limitada. El recetario de entrenamiento aplica Muon y AdamW a categorías específicas de pesos, elimina los warmups tradicionales de batch-size y arranca directamente con el tamaño de batch objetivo. El modelo pasa por pre-entrenamiento y post-entrenamiento; no se detalla en la información disponible si se empleó RLHF o DPO, ni el número de tokens de entrenamiento.

## Capacidades

- Generación de texto y razonamiento en un modelo causal con decodificación autoregresiva.
- Procesamiento de imagen y texto (pipeline image-text-to-text), gracias al codificador de visión integrado.
- Capacidades de código y matemáticas implícitas en un modelo de frontera, aunque no se detallan evaluaciones específicas en la información disponible.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información proporcionada.
- Razonamiento multi-paso y flujos agénticos: la arquitectura está optimizada para cargas agénticas según el autor, con atención dispersa que reduce latencia en contextos largos.
- Decodificación especulativa mediante MTP (Multi-Token Prediction), con aceleración de inferencia de 1,3 a 1,7 veces según Unsloth.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de pensamiento (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Agentes autónomos de larga duración: la atención dispersa a nivel de micro-bloque y el contexto largo implícito en el diseño reducen la latencia en bucles agénticos con muchas iteraciones, lo que lo hace adecuado para tareas de planificación y ejecución multi-paso.
- Asistentes con entrada visual: al ser un modelo image-text-to-text, puede procesar capturas de pantalla, diagramas o documentos escaneados junto con instrucciones textuales para tareas de soporte técnico o extracción de información.
- Generación de código asistida en pipelines: con 6B parámetros activos y decodificación MTP acelerada, es viable integrarlo en entornos de CI/CD o IDE para autocompletado y revisión de código con latencia contenida.
- Procesamiento de documentos extensos: los embeddings de n-gramas y la atención híbrida permiten manejar entradas largas con menor coste de memoria, útil para resumen y extracción de contratos o informes.
- Despliegue en hardware con memoria limitada: el diseño de embeddings de n-gramas facilita el offloading, lo que permite ejecutar el modelo en aceleradores con VRAM restringida usando cuantizaciones GGUF de Unsloth Dynamic v3.1.
- Investigación en arquitecturas eficientes: al ser una vista previa experimental de la arquitectura Qwen4, sirve para estudiar el comportamiento de QSA, Gated Residual y embeddings de n-gramas en cargas reales.
- Evaluación comparativa de cuantizaciones: la versión Dynamic v3.1 de Unsloth está pensada para medir la pérdida de precisión frente a otros cuantizadores en benchmarks como Terminal Bench y DeepSWE.

## Benchmarks y rendimiento

La información disponible menciona que Unsloth Dynamic v3.1 logra un 15 % más de precisión que otros cuantizadores de frontera y obtiene las puntuaciones más altas en Terminal Bench y DeepSWE, pero no se proporcionan cifras numéricas concretas de benchmarks del modelo base ni de la cuantización.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio GGUF ocupa 118,8 GB, por lo que la cuantización completa requiere al menos esa cantidad de memoria (o menos si se emplean variantes más agresivas no detalladas en la información). Con 6B parámetros activos, el cómputo por token es contenido, pero los pesos totales deben residir en memoria o en offloading.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del repo, se requieren configuraciones multi-GPU o GPUs con memoria amplia (A100/H100 de 80 GB en adelante) para la cuantización completa.
- GPU de consumo: no se confirma que quepa en GPUs de consumo (RTX 4090 de 24 GB) sin offloading o cuantizaciones adicionales no documentadas.
- Opciones de despliegue: llama.cpp y Unsloth Desktop según la model card; vLLM, TGI y Ollama no se mencionan en la información disponible.
- Latencia y throughput: se reporta una aceleración de 1,3 a 1,7 veces con MTP en Unsloth, pero sin cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (esta ficha, GGUF Unsloth) | 125B / 6B (+51B n-gram, +4B MTP) | no disponible | qwen-community-1.0 | GGUF | Vista previa experimental de la arquitectura Qwen4 |
| Qwen/Qwen3.8-Flash-Next (base) | 125B / 6B | no disponible | qwen-community-1.0 | no disponible | Modelo original sin cuantizar |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría (MoE de ~125B con visión) en términos de rendimiento o contexto.

## Limitaciones y advertencias

- Es una vista previa experimental ("experimental preview") de la arquitectura Qwen4; no debe tratarse como un modelo de producción estable.
- El repositorio tiene 0 descargas y 0 likes, y fue creado por un usuario particular (johnlockejrr) a partir del modelo base; no es una publicación oficial de Qwen.
- Licencia qwen-community-1.0: es necesario revisar los términos del archivo LICENSE para uso comercial, ya que la licencia se etiqueta como "other" y puede imponer restricciones.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fiabilidad en la información disponible.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento multilingüe equilibrado.
- Longitud de contexto: no disponible; aunque la arquitectura está optimizada para contextos largos, no se especifica la ventana máxima.
- La cuantización GGUF Dynamic v3.1 introduce pérdida de precisión respecto al modelo base, aunque Unsloth afirme que es menor que en otros cuantizadores.
- El tamaño del repo (118,8 GB) limita el despliegue a entornos con almacenamiento y memoria abundantes.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/johnlockejrr/unsloth-Qwen3.8-Flash-Next-HGN
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Guía de Unsloth para ejecutar Qwen3.8-Flash-Next: https://unsloth.ai/docs/models/qwen3.8-next
- Actualización Dynamic v3.1: https://unsloth.ai/docs/models/qwen3.8-next#dynamic-v3.1-update-november-2nd-2026
- Guía de MTP: https://unsloth.ai/docs/models/qwen3.8-next#mtp-guide
- Documentación de Unsloth Dynamic 3.0 GGUF: https://unsloth.ai/docs/basics/dynamic-3.0-ggufs
- Aplicación Unsloth Desktop: https://unsloth.ai/docs/desktop
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth/
- Blog de Qwen3.8-Flash-Next: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe técnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Discord de Unsloth: https://discord.gg/unsloth
