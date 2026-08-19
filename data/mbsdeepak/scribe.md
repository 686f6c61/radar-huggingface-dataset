# mbsdeepak/scribe

## Resumen

Scribe es un modelo de lenguaje pequeño (SLM) de aproximadamente 30 millones de parámetros, desarrollado desde cero en PyTorch por mbsdeepak. Se trata de un transformador decoder-only de la familia GPT-2, entrenado exclusivamente sobre el dataset TinyStories, que contiene cuentos infantiles sencillos en inglés. El proyecto tiene un enfoque pedagógico: su autor busca demostrar la comprensión completa de un LLM, desde la arquitectura y el entrenamiento hasta el despliegue en inferencia, sin depender de librerías de modelado como `transformers` o `nanoGPT`.

El modelo está diseñado para continuar historias infantiles coherentes a partir de un prompt, con una ventana de contexto de 256 tokens. Aunque no es apto para tareas de propósito general, sirve como base para experimentación educativa y para entender los fundamentos de los modelos generativos. Los pesos se distribuyen en formato safetensors (fp32) y son compatibles con el servidor de inferencia `ember`, también desarrollado por el mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer (familia GPT-2) |
| Parametros totales | 30.044.544 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | No disponible (pesos en fp32) |
| Idiomas soportados | Ingles (entrenado en TinyStories) |
| Licencia | MIT |
| Formato de pesos | Safetensors (fp32) |

## Arquitectura y entrenamiento

Scribe es un transformador decoder-only de 6 capas, 6 cabezas de atención y 384 dimensiones de embedding. Implementa atención causal multi-cabeza escrita a mano, bloques con pre-LayerNorm, MLP con activación GELU y cabezal de salida atado (tied embeddings). El tokenizador es el BPE de GPT-2 (`tiktoken`), con un vocabulario de 50.257 tokens. No incorpora innovaciones como RoPE, RMSNorm o SwiGLU; es una arquitectura GPT-2 vanilla.

El entrenamiento se realizó sobre el dataset TinyStories, que contiene alrededor de 2,1 millones de historias cortas en inglés simple. Se usó AdamW con warmup y programación de tasa de aprendizaje coseno. El proceso tomó aproximadamente 3,4 horas en una GPU Apple Silicon (MPS). La pérdida de validación final (cross-entropy) fue de 1,74. No se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto en inglés simple y coherente, especializado en cuentos infantiles.
- Continuación de historias a partir de un prompt inicial, con control de temperatura y top-k.
- Capacidad de generar secuencias de hasta 256 tokens de contexto.
- Compatible con el servidor de inferencia `ember`, que expone una API estilo OpenAI con streaming.
- Implementación ligera y portable: los pesos cargan directamente en código PyTorch sin dependencias de librerías de modelado.
- No soporta tool calling, razonamiento multi-paso, visión ni otros modos avanzados.

## Casos de uso

- **Educación en IA generativa**: Scribe es ideal para estudiantes y desarrolladores que quieren entender cómo funciona un LLM por dentro. Al ser un modelo pequeño y entrenado desde cero, permite inspeccionar cada componente (atención, MLP, embeddings) y modificar el código sin coste computacional elevado.
- **Prototipado de aplicaciones de narración**: Puede integrarse en demos o prototipos que generen cuentos infantiles personalizados, por ejemplo, en aplicaciones educativas para niños. Su salida es simple y adecuada para este dominio.
- **Pruebas de infraestructura de inferencia**: Al ser compatible con el servidor `ember`, sirve para validar pipelines de despliegue, streaming de respuestas y compatibilidad con APIs OpenAI sin consumir recursos de modelos grandes.
- **Investigación en modelos pequeños**: Para estudios sobre el comportamiento de SLM entrenados con datasets restringidos, Scribe ofrece una base reproducible con código abierto y datos de entrenamiento públicos.
- **Generación de datos sintéticos**: Puede utilizarse para crear variaciones de cuentos infantiles que alimenten otros modelos o datasets, siempre que se respete la licencia MIT y se indique la procedencia.
- **Benchmark de hardware**: Dado su tamaño reducido, es útil para medir el rendimiento de GPUs o CPUs en tareas de generación de texto, comparando latencias y throughput con modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El único dato de rendimiento reportado es la pérdida de validación de 1,74 (cross-entropy) sobre TinyStories, que no es comparable directamente con métricas de tareas downstream. Para evaluar su calidad, se recomienda realizar pruebas cualitativas de generación de historias.

## Requisitos de hardware

- **VRAM estimada**: Al tener 30 millones de parámetros en fp32, el modelo ocupa aproximadamente 120 MB en memoria (30M × 4 bytes). Cabe en cualquier GPU con al menos 1 GB de VRAM, incluso en integradas.
- **GPU recomendadas**: Cualquier GPU moderna, desde una NVIDIA GTX 1650 hasta una RTX 4090 o A100. También funciona en Apple Silicon (MPS) y en CPU.
- **Compatibilidad con GPU de consumo**: Sí, es totalmente viable en GPUs de consumo como la serie RTX 30/40 o incluso en Raspberry Pi con suficiente RAM.
- **Opciones de despliegue**: Se puede servir mediante el servidor `ember` (OpenAI-compatible), o bien integrarse en scripts Python con PyTorch. No hay soporte oficial para vLLM, llama.cpp u Ollama, pero al ser un modelo GPT-2 estándar, podría adaptarse fácilmente.
- **Latencia y throughput**: No se han publicado mediciones oficiales. Dado el tamaño, se espera una latencia de milisegundos por token en GPU moderna y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Scribe pertenece a la categoría de SLM entrenados en TinyStories, donde existen otros modelos como TinyStories-33M o GPT-Neo-125M, pero no se han reportado comparativas directas. Se recomienda consultar el repositorio de GitHub para posibles referencias adicionales.

## Limitaciones y advertencias

- **Alcance restringido**: Scribe solo genera texto en inglés simple y coherente dentro del dominio de cuentos infantiles. No es adecuado para tareas de propósito general, razonamiento complejo o generación de código.
- **Contexto limitado**: La ventana de 256 tokens restringe la coherencia en historias largas; el modelo puede perder el hilo argumental en generaciones extensas.
- **Sesgos y alucinaciones**: Al entrenarse exclusivamente en TinyStories, puede reflejar los sesgos presentes en ese dataset y producir contenido estereotipado o inexacto fuera de su dominio.
- **Arquitectura básica**: Al carecer de técnicas modernas como RoPE o RMSNorm, su rendimiento es inferior a modelos de tamaño similar que sí las incorporan.
- **Licencia**: Aunque la licencia MIT permite uso comercial, el autor declara que es un proyecto de aprendizaje y no un producto listo para producción. Se recomienda evaluar cuidadosamente su calidad antes de usarlo en entornos reales.
- **Soporte limitado**: No hay garantías de mantenimiento ni actualizaciones; el código y los pesos se publican tal cual.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/mbsdeepak/scribe)
- [Repositorio de código y entrenamiento (scribe)](https://github.com/mbsdeepak/scribe)
- [Servidor de inferencia ember](https://github.com/mbsdeepak/ember)
- [Dataset TinyStories](https://huggingface.co/datasets/roneneldan/TinyStories)
