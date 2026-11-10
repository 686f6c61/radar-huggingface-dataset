# orbbit-AI-026/Dev-Dynamic-AI

## Resumen

Dev-Dynamic-AI es un modelo de lenguaje publicado por orbbit-AI-026 en Hugging Face, identificado internamente como un modelo de la familia Qwen 3.5 (tag `qwen3_5` en el repositorio). Con 27.781.427.952 parámetros totales (aproximadamente 27,8 mil millones) y un tamaño de repositorio de 55,6 GB en formato safetensors, se posiciona en la franja de modelos densos de gran tamaño orientados a tareas de programación y razonamiento. La model card lo describe como un "programador de Hi Code en Dynamic 3" para "Hi Chat", con capacidades de escritura y corrección de código y razonamiento graduable.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales más allá de las obligaciones de atribución propias de dicha licencia. El repositorio incluye un fichero `NOTICE` con avisos de autoría del modelo de origen, lo que sugiere que se trata de un modelo derivado o ajustado a partir de una base preexistente (probablemente un Qwen 3.5).

La información pública disponible es muy limitada: el repositorio no registra descargas ni interacciones, no declara idiomas soportados, no especifica la longitud de contexto y no incluye resultados de benchmarks. Esta ficha refleja exclusivamente los datos verificables del repositorio y marca explícitamente como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, segun tag del repositorio); detalles no disponibles |
| Parametros totales | 27.781.427.952 (~27,8 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El tag `qwen3_5` del repositorio indica que el modelo pertenece a la familia Qwen 3.5, lo que implica una arquitectura transformer con los componentes habituales de dicha familia (atención con RoPE, normalización RMSNorm y capas MLP con activación tipo SwiGLU, si bien los detalles concretos no se han publicado en la información disponible). El recuento de parámetros de 27,8 mil millones es coherente con un modelo denso de tamaño medio-grande; no hay indicios de que sea un modelo de mezcla de expertos (MoE), ya que no se declaran parámetros activos.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF, DPO o ajuste por preferencias, ni sobre innovaciones técnicas específicas como decodificación especulativa o atención lineal. La model card únicamente menciona que el modelo está orientado a programación ("escribe y arregla código") con "razonamiento graduable", lo que sugiere algún mecanismo de control del esfuerzo de razonamiento, pero no se detalla su funcionamiento. Tampoco se especifica qué modelo base exacto se utilizó ni el proceso de ajuste aplicado.

## Capacidades

- Generación de código: escritura y corrección de código, según la descripción de la model card.
- Razonamiento graduable: la model card menciona un control del nivel de razonamiento, aunque no se documenta el mecanismo.
- Generación de texto general: implícita en la familia Qwen 3.5, pero no confirmada explícitamente en la información disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Asistente de programación en IDE: el modelo puede integrarse como backend de autocompletado y generación de funciones, dado su enfoque declarado en escritura y corrección de código. Es adecuado para tareas de refactorización y generación de tests dentro de editores.
- Corrección automática de errores en pipelines de integración continua: puede analizar fragmentos de código y proponer parches ante fallos de compilación o tests, siempre que se valide la salida antes de aplicarla.
- Chat de soporte técnico para desarrolladores: con un tamaño de 27,8 mil millones de parámetros, puede mantener conversaciones multi-turno sobre APIs y documentación, aunque la longitud de contexto no está confirmada.
- Generación de documentación técnica: a partir de código fuente, el modelo puede redactar docstrings y guías de uso, una tarea alineada con su orientación a programación.
- Revisión de código en pull requests: puede señalar problemas de estilo o posibles bugs en diffs, como paso previo a la revisión humana.
- Prototipado de scripts y automatizaciones: útil para generar scripts de un solo uso o utilidades de línea de comandos en entornos de desarrollo.
- Ajuste fino sobre dominios específicos: al estar bajo Apache 2.0 y en safetensors, puede reentrenarse o adaptarse con LoRA para lenguajes o frameworks concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 55-56 GB solo para los pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 64-80 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 28-30 GB, viable en GPUs de 32 GB o superiores.
- VRAM estimada en cuantización de 4 bits: en torno a 15-18 GB, lo que permitiría ejecución en GPUs consumer de gama alta.
- GPU recomendadas: A100 80 GB, H100 80 GB o múltiples GPUs de 24 GB (por ejemplo, 2-4 RTX 4090) para FP16.
- GPUs consumer: posible en RTX 4090 (24 GB) únicamente con cuantización de 4 bits; en FP16 no cabe en una sola GPU consumer.
- Opciones de despliegue: vLLM, TGI o llama.cpp (previa conversión a GGUF, no publicada), así como transformers con accelerate para sharding multi-GPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Dev-Dynamic-AI | ~27,8 mil millones | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen 2.5 32B | 32,5 mil millones | 128K (segun documentacion publica de la familia) | Apache 2.0 (variantes base) | Amplia en Hugging Face |
| Gemma 2 27B | 27 mil millones | 8K | Gemma license | Amplia en Hugging Face |
| Mistral Small 24B | 24 mil millones | 128K | Apache 2.0 | Amplia en Hugging Face |

La comparación se limita a parámetros y licencia, ya que no hay datos de rendimiento publicados para Dev-Dynamic-AI. El contexto y los benchmarks de los modelos alternativos provienen de sus documentaciones públicas y deben verificarse en cada caso.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al no publicarse la composición del dataset, no es posible evaluar sesgos de género, idioma o dominio.
- Riesgo de alucinación: inherente a los modelos generativos; en tareas de código puede producir APIs inexistentes o fragmentos que compilan pero son incorrectos, por lo que requiere validación automática (tests, linters).
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están declarados, lo que impide garantizar su comportamiento en conversaciones largas o en castellano.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe conservarse el fichero `NOTICE` con las atribuciones del modelo de origen.
- Caveats para producción: el repositorio no tiene descargas ni validación comunitaria, no hay benchmarks ni documentación de entrenamiento, y la fecha de creación (2026-11-10) y la escasez de metadatos sugieren un modelo recién publicado y sin verificación independiente. No se recomienda su uso en producción sin una evaluación propia exhaustiva.
- Trazabilidad: al ser un modelo derivado de Qwen 3.5, conviene revisar la licencia y condiciones del modelo base original además de la licencia declarada en este repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/orbbit-AI-026/Dev-Dynamic-AI
