# nicolasembleton/Apodex-1.1-mini-MLX-5bit

## Resumen

Apodex-1.1-mini-MLX-5bit es una conversión a formato MLX (Apple Silicon) del modelo Apodex-1.1-mini, desarrollado por el equipo de Apodex. Este modelo pertenece a la familia Apodex 1.1, descrita como un "heavy-duty solver" diseñado para tareas de razonamiento complejo y agéntico, como investigación, finanzas, matemáticas, programación y búsqueda. La conversión ha sido realizada por nicolasembleton usando mlx-lm 0.31.3, con cuantización de 5 bits affine y un tamaño de 23.9 GB.

El modelo base es Apodex-1.1-mini, que según la documentación es una variante de Qwen3.5-35B-A3B, una arquitectura MoE con 36 mil millones de parámetros totales y 3 mil millones de parámetros activos por token. Aunque los safetensors cuantizados presentan 6.5B parámetros, la model card indica claramente la arquitectura completa. El modelo cuenta con 256 expertos (8 activos por token), 40 capas híbridas (atención lineal y completa) y una ventana de contexto de 262,144 tokens. La torre de visión ha sido eliminada en la conversión, quedando como modelo de solo texto.

La relevancia actual radica en que permite ejecutar localmente en hardware Apple Silicon un modelo de razonamiento avanzado con una cuantización compacta, manteniendo una ventana de contexto muy amplia y un coste computacional reducido gracias a la arquitectura MoE. El paper asociado, "Apodex 1.1: Scaling Agentic Intelligence for Complex Work", publicado en arXiv, reporta que el modelo alcanza un rendimiento líder en diversas tareas profesionales y científicas a pesar de ser significativamente más pequeño que otros sistemas frontier.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-35B-A3B (MoE) |
| Parametros totales | 36B (3B activos) según model card; safetensors cuantizados 5-bit: 6.5B |
| Parametros activos | 3B |
| Longitud de contexto | 262144 tokens (max position embeddings) |
| Tipos de cuantizacion | 5-bit affine (group size 64, bits por peso 5.442) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE (Mixture of Experts) basado en Qwen3.5-35B-A3B. Dispone de 256 expertos en total, de los cuales 8 se activan por cada token procesado, lo que reduce el coste computacional efectivo a 3B parámetros activos. El modelo tiene 40 capas con atención híbrida, combinando capas de atención lineal y capas de atención completa (full attention), un diseño que busca equilibrar eficiencia y capacidad de razonamiento a largo plazo. La ventana de contexto máxima es de 262,144 tokens.

El proceso de entrenamiento del modelo original no está detallado en la información proporcionada. El paper de Apodex 1.1 menciona una técnica denominada "environment scaling" y describe el sistema como "self-evolving", pero no se ofrecen datos concretos sobre el dataset, número de tokens o uso de RLHF/DPO. La conversión a MLX se realizó con mlx-lm 0.31.3, eliminando la torre de visión y dejando únicamente el componente de texto.

## Capacidades

- Generación de texto y razonamiento complejo, especialmente orientado a tareas de investigación y resolución de problemas de alta dificultad.
- Soporte para agentes y razonamiento multi-paso (multi-step reasoning), según la descripción del paper de Apodex 1.1.
- Capacidades de tool calling: no se especifica explícitamente en la documentación, aunque la arquitectura de agente sugiere soporte para integración con herramientas.
- Capacidades multilingües: no se indican idiomas soportados en la información disponible.
- No incluye capacidades de visión (torre de visión eliminada en la conversión).
- Modo de razonamiento extendido: el modelo está diseñado para tareas de investigación y trabajo complejo, con verificación de cada paso, lo que sugiere un modo de razonamiento profundo.

## Casos de uso

- Investigación y análisis de documentos complejos: el modelo puede procesar contextos de hasta 262k tokens, permitiendo el análisis de documentos extensos (informes, artículos científicos, contratos) con razonamiento multi-paso.
- Asistente de programación en producción: su arquitectura MoE con 8 expertos activos por token ofrece una latencia razonable para integrarse en pipelines de CI/CD, generación de código y revisión de pull requests.
- Análisis financiero y de mercado: el modelo está diseñado para tareas de razonamiento complejo y puede procesar series de datos, informes y noticias para generar insights en el sector financiero.
- Automatización de atención al cliente técnica: con 262k tokens de contexto, puede gestionar conversaciones multi-turno de alta complejidad, manteniendo el historial completo de la interacción.
- Generación de contenido científico-técnico: útil para redactar informes, resúmenes y síntesis de literatura científica, aprovechando su capacidad de razonamiento verificable.
- Desarrollo de agentes autónomos: su soporte para razonamiento multi-paso lo hace adecuado para construir agentes que planifiquen y ejecuten tareas en entornos simulados o con herramientas externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper "Apodex 1.1: Scaling Agentic Intelligence for Complex Work" (arXiv:2608.23283v1) menciona que el modelo alcanza la banda de rendimiento líder en tareas profesionales complejas, finanzas, investigación científica, matemáticas, programación y búsqueda, pero no se proporcionan cifras concretas en la documentación accesible.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado a 5-bit ocupa 23.9 GB en disco. Para inferencia, se recomienda al menos 48 GB de memoria unificada en Apple Silicon para manejar contextos largos sin OOM.
- GPU recomendadas: el formato MLX está optimizado para Apple Silicon (M1, M2, M3, M4). No se proporciona soporte para CUDA o ROCm.
- Si cabe en consumer GPU: en hardware Apple con 48 GB de RAM unificada (por ejemplo, Mac Studio o MacBook Pro con chip M3 Max/Ultra) es viable. Con 32 GB de RAM unificada puede funcionar con contextos inferiores a 32k tokens.
- Opciones de despliegue: se puede usar con mlx-lm, que permite generación desde línea de comandos o Python. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que el formato es específico de MLX.
- Latencia y throughput: no se proporcionan datos concretos. La arquitectura MoE con 3B activos debería ofrecer una velocidad de generación aceptable en hardware Apple Silicon, pero no hay mediciones disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| apodex/Apodex-1.1-mini | 36B (3B activos) | 262144 | Original (BF16) | Apache 2.0 | safetensors |
| nicolasembleton/Apodex-1.1-mini-MLX-5bit | 36B (3B activos) | 262144 | 5-bit affine | Apache 2.0 | MLX (safetensors) |
| abenzerps/Apodex-1.1-mini-MLX-4bit | 36B (3B activos) | 262144 | 4-bit | Apache 2.0 | MLX (safetensors) |

La comparativa se limita a las versiones del mismo modelo base, ya que no se dispone de datos de modelos competidores en la información proporcionada. La principal diferencia entre las versiones MLX es el nivel de cuantización (4-bit vs 5-bit), que afecta al tamaño y la precisión. La versión original sin cuantizar requiere más recursos de almacenamiento y memoria.

## Limitaciones y advertencias

- OOM (Out of Memory) en Metal durante prefill de contexto largo: la documentación advierte que con menos de 48 GB de memoria unificada, el prefill de contextos largos puede provocar OOM. Se recomienda mantener el contexto por debajo de 32k tokens en hardware con menos memoria.
- Sin soporte de visión: la torre de visión fue eliminada en la conversión, por lo que el modelo solo procesa texto.
- Sesgos y alucinaciones: no se han documentado sesgos específicos, pero como todo modelo de lenguaje, existe riesgo de alucinación y generación de información incorrecta, especialmente en tareas de razonamiento complejo.
- Idiomas: no se especifican idiomas soportados, por lo que el rendimiento multilingüe no está garantizado.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero se recomienda revisar los términos del modelo original Apodex-1.1-mini.
- Formato MLX: el modelo está limitado al ecosistema de Apple Silicon; no se puede ejecutar directamente en GPUs NVIDIA o AMD sin conversión adicional.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/nicolasembleton/Apodex-1.1-mini-MLX-5bit
- Modelo base (original): https://huggingface.co/apodex/Apodex-1.1-mini
- Otra cuantización MLX 4-bit: https://huggingface.co/abenzerps/Apodex-1.1-mini-MLX-4bit
- Paper (arXiv): https://arxiv.org/abs/2608.23283v1
- Sitio web de Apodex: https://www.apodex.com/ y https://www.apodex.ai/
