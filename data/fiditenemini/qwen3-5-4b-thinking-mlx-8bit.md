# FiditeNemini/Qwen3.5-4B-thinking-mlx-8bit

## Resumen

Qwen3.5-4B-thinking-mlx-8bit es una conversión y ajuste fino del modelo Qwen/Qwen3.5-4B de Alibaba, publicada por el usuario FiditeNemini. Se distribuye en formato MLX cuantizado a 8 bits (afín, con tamaño de grupo 64) para su ejecución en Apple Silicon mediante la librería mlx-lm o mlx-vlm. El modelo base tiene 4.539.265.536 parámetros reales según los pesos en safetensors y se enmarca en la familia Qwen3.5, con pipeline declarado image-text-to-text, aunque el autor indica que la ruta de visión no se utiliza en su aplicación principal.

El modelo es un "thinking model": genera razonamiento explícito dentro de etiquetas `<think>…</think>` antes de la respuesta final. Está afinado específicamente para trabajo con agentes locales y es el modelo por defecto de MLX-Minions, una aplicación nativa de macOS que ejecuta agentes locales sobre un modelo MLX en proceso. La relevancia actual radica en que ofrece un checkpoint listo para usar en Mac con Apple Silicon, sin necesidad de GPUs dedicadas, con licencia Apache 2.0 heredada del modelo base.

La información disponible es limitada: la model card es breve, no se detallan idiomas soportados ni resultados de benchmarks, y el repositorio tiene 54 descargas y ningún "like" en el momento de la consulta. El tamaño del repositorio es de 5,2 GB, coherente con una cuantización de 8 bits de un modelo de ~4,5 mil millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles específicos no disponibles) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 8-bit afín, group size 64 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo deriva de Qwen/Qwen3.5-4B, un transformer de aproximadamente 4,5 mil millones de parámetros. La model card no especifica la arquitectura interna del modelo base (número de capas, dimensión oculta, mecanismo de atención) ni los datos de entrenamiento originales (número de tokens, composición del dataset, uso de RLHF o DPO). Tampoco se detalla el proceso de ajuste fino realizado por FiditeNemini más allá de indicar que está "tuned for local agent work", es decir, orientado a tareas de agente local.

La innovación técnica destacable es la cuantización a 8 bits en formato MLX con cuantización afín y tamaño de grupo 64, que reduce el peso del modelo a un repositorio de 5,2 GB y permite su ejecución eficiente en Apple Silicon. Además, el modelo incorpora un modo de razonamiento ("thinking") que produce cadenas de pensamiento en `<think>…</think>`. El autor señala que MLX-Minions carga únicamente la ruta de texto mediante mlx-swift-lm y que los pesos de visión quedan sin usar, pese a que el pipeline declarado sea image-text-to-text.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento explícito en modo "thinking": las respuestas comienzan con una cadena de razonamiento dentro de `<think>…</think>`.
- Trabajo con agentes locales: es el modelo por defecto de MLX-Minions, orientado a flujos de agente en macOS.
- Capacidad multimodal declarada (pipeline image-text-to-text), aunque el autor indica que la ruta de visión no se emplea en su aplicación principal.
- Ejecución local en Apple Silicon mediante mlx-lm y mlx-vlm.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Agentes locales en macOS: el modelo se integra como motor por defecto de MLX-Minions, ejecutándose en proceso sobre MLX y permitiendo flujos de agente sin conexión a servicios externos. Su tamaño de 4,5 mil millones de parámetros y su cuantización a 8 bits lo hacen viable en un portátil con Apple Silicon.
- Asistentes de razonamiento paso a paso: el modo thinking con `<think>…</think>` permite obtener trazas de razonamiento auditables, útil en tareas de depuración, análisis de problemas o generación de explicaciones.
- Automatización de tareas de desarrollo en local: al estar pensado para "local agent work", puede emplearse en pipelines de asistencia a la programación ejecutados íntegramente en la máquina del desarrollador, sin enviar código a terceros.
- Prototipado de aplicaciones conversacionales: la licencia Apache 2.0 y el formato MLX facilitan experimentar con un chatbot local en Mac antes de escalar a despliegues mayores.
- Evaluación de modelos Qwen3.5 en hardware de consumo: sirve como checkpoint de referencia para medir latencia y calidad de la cuantización 8-bit MLX frente a otras precisiones.
- Integración en herramientas de escritorio nativas: mediante mlx-swift-lm, el modelo puede embeberse en aplicaciones macOS que requieran inferencia local con verificación de integridad de archivos (el autor indica comprobación SHA-256 de cada fichero antes de cargarlo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio ocupa 5,2 GB en cuantización 8-bit; se recomienda al menos 8 GB de memoria unificada para cargar el modelo con margen para el contexto y el runtime.
- Hardware objetivo: Apple Silicon (series M1, M2, M3, M4 y posteriores), dado que el formato es MLX.
- GPU dedicadas (A100, H100, RTX 4090): no aplicable directamente; el checkpoint está en formato MLX y no en formatos CUDA habituales.
- ¿Cabe en GPU de consumo? Está diseñado para memoria unificada de Mac; no se proporcionan datos para GPUs de consumo tipo RTX.
- Opciones de despliegue: mlx-lm, mlx-vlm y mlx-swift-lm (usado por MLX-Minions). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-thinking-mlx-8bit (este) | 4.539.265.536 | no disponible | MLX 8-bit (group size 64) | Apache 2.0 | Hugging Face, formato MLX |
| Qwen/Qwen3.5-4B (base) | ~4,5 mil millones | no disponible | pesos originales | Apache 2.0 | Hugging Face |
| Otros checkpoints MLX de la familia Qwen3.5 | no disponible | no disponible | MLX (varias precisiones) | Apache 2.0 (heredada) | Hugging Face |

No se dispone de datos de rendimiento comparado ni de especificaciones de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La información publicada es muy escasa: no hay datos de benchmarks, idiomas, contexto ni composición del entrenamiento, lo que dificulta evaluar su calidad frente a alternativas.
- El ajuste fino es de un autor individual (FiditeNemini); no se documenta el dataset ni la metodología, por lo que el comportamiento puede desviarse del modelo base de formas no caracterizadas.
- Riesgo de alucinación inherente a los modelos generativos; el modo thinking no garantiza corrección factual.
- El pipeline declarado es image-text-to-text, pero el autor indica que la ruta de visión no se usa en MLX-Minions; el soporte multimodal efectivo no está verificado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen/Qwen3.5-4B por si imponen requisitos adicionales.
- El formato MLX limita su uso a Apple Silicon; no es directamente desplegable en infraestructura CUDA sin conversión.
- El repositorio tiene muy poca tracción (54 descargas, 0 likes) y fue creado y actualizado en un margen de menos de dos minutos, lo que sugiere una validación comunitaria mínima.

## Enlaces

- [Hugging Face: FiditeNemini/Qwen3.5-4B-thinking-mlx-8bit](https://huggingface.co/FiditeNemini/Qwen3.5-4B-thinking-mlx-8bit)
- [Modelo base: Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
- [mlx-lm (GitHub)](https://github.com/ml-explore/mlx-lm)
- No se han encontrado papers, blogs ni demos adicionales en la búsqueda web realizada.
