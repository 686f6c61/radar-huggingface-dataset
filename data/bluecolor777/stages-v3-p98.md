# bluecolor777/stages-v3-p98

## Resumen

El modelo `bluecolor777/stages-v3-p98` es un checkpoint intermedio de la serie Qwen3.6-35B-A3B, un modelo de lenguaje causal con encoder de visión desarrollado por Alibaba Qwen y publicado por el usuario bluecolor777 en Hugging Face. Se trata de un modelo multimodal (imagen-texto a texto) con arquitectura híbrida que combina atención lineal (Gated DeltaNet) con atención clásica (Gated Attention) y mezcla de expertos (MoE), con 35 mil millones de parámetros totales y 3 mil millones activos por token.

El modelo está diseñado para tareas de codificación agéntica, razonamiento sobre repositorios y flujos de trabajo de frontend, con una ventana de contexto nativa de 262 144 tokens extensible hasta 1 010 000. La versión publicada corresponde a un paso de entrenamiento intermedio (sufijo "p98"), lo que sugiere que es un artefacto de evaluación o desarrollo más que un lanzamiento final. Su relevancia radica en que representa la primera variante de pesos abiertos de Qwen3.6, orientada a estabilidad y utilidad práctica para desarrolladores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (atención lineal) + Gated Attention + MoE, con vision encoder |
| Parametros totales | 35 951 822 704 |
| Parametros activos | 3 000 000 000 (aprox.) |
| Longitud de contexto | 262 144 nativo, extensible hasta 1 010 000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura causal híbrida con 40 capas organizadas en 10 bloques, cada uno compuesto por 3 subcapas de Gated DeltaNet seguidas de MoE y 1 subcapa de Gated Attention seguida de MoE. La capa Gated DeltaNet utiliza 32 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128, mientras que la capa Gated Attention usa 16 cabezas para Q y 2 para KV con dimensión 256 y RoPE de dimensión 64. El bloque MoE contiene 256 expertos, de los cuales se activan 8 enrutados más 1 compartido, con dimensión intermedia de 512. La salida del LM tiene un vocabulario de 248 320 tokens (padding incluido).

El entrenamiento incluye una fase de pre-entrenamiento y otra de post-entrenamiento, con MTP (multi-token prediction) entrenado en múltiples pasos. La arquitectura con Gated DeltaNet permite una atención lineal eficiente para contextos muy largos, mientras que el vision encoder habilita la entrada de imágenes. No se dispone de información detallada sobre el dataset de entrenamiento ni sobre técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto con razonamiento avanzado, especialmente en tareas de codificación agéntica y resolución de problemas a nivel de repositorio.
- Procesamiento de imágenes (pipeline image-text-to-text), capaz de combinar entradas visuales y textuales.
- Razonamiento multi-paso y planificación de tareas complejas, con soporte para flujos de trabajo de frontend.
- Preservación del contexto de razonamiento en mensajes históricos, útil para desarrollo iterativo.
- Ventana de contexto muy amplia (262K nativa, hasta 1M con extensión), adecuada para documentos largos y repositorios completos.
- Capacidades multilingües no especificadas; se asume herencia de la familia Qwen, pero no está confirmado.

## Casos de uso

- Desarrollo de agentes de codificación autónomos: el modelo puede gestionar tareas de SWE-bench con una precisión del 73,4% en el conjunto Verified, lo que lo hace adecuado para resolver issues reales de GitHub de forma autónoma.
- Revisión de código y refactorización a nivel de repositorio: su contexto de 262K tokens permite analizar archivos completos y dependencias entre módulos.
- Generación de interfaces de usuario (frontend): el modelo muestra fluidez en flujos de trabajo de frontend, pudiendo generar componentes HTML/CSS/JS a partir de descripciones o capturas de pantalla.
- Asistente de programación multimodal: al aceptar imágenes, puede interpretar diagramas, capturas de pantalla o bocetos de UI para generar código.
- Análisis de documentación técnica extensa: con contexto ampliable hasta 1M tokens, puede resumir o extraer información de manuales y especificaciones largas.
- Automatización de tareas de terminal: con rendimiento en Terminal-Bench 2.0 (dato parcial), puede ejecutar comandos y scripts en entornos simulados.

## Benchmarks y rendimiento

Los resultados publicados en la model card comparan el modelo con alternativas de tamaño similar. Se muestran los datos disponibles:

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B (este modelo) |
|---|---|---|---|---|---|
| SWE-bench Verified | 75.0 | 52.0 | 70.0 | 17.4 | 73.4 |
| SWE-bench Multilingual | 69.3 | 51.7 | 60.3 | 17.3 | 67.2 |
| SWE-bench Pro | 51.2 | 35.7 | 44.6 | 13.8 | 49.5 |
| Terminal-Bench 2.0 | no disponible | no disponible | no disponible | no disponible | parcial (incompleto) |

El modelo supera a Gemma4-31B y Gemma4-26BA4B en todos los benchmarks de codificación, y queda ligeramente por detrás de Qwen3.5-27B en SWE-bench Verified y Multilingual, aunque con mejor resultado en SWE-bench Pro. No se han publicado resultados para tareas de lenguaje general (MMLU, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 71,9 GB, por lo que se necesita una GPU con al menos 80 GB (A100, H100) para cargar el modelo completo sin cuantización.
- Con cuantización de 4 bits (no confirmada para este checkpoint, pero típica en la familia Qwen), la VRAM necesaria se reduciría a unos 18-20 GB, permitiendo ejecución en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- GPU recomendadas: A100 80GB, H100 80GB para BF16; RTX 4090 o similar para cuantización ligera.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y KTransformers, según la model card. También está disponible en FriendliAI como endpoint gestionado.
- Latencia y throughput: al ser un modelo MoE con solo 3B parámetros activos, la latencia por token es significativamente menor que en un modelo denso de 35B, aunque depende del hardware y la implementación. No se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | SWE-bench Verified |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (este) | 35B | 3B | 262K (1M ext.) | Apache 2.0 | 73.4 |
| Qwen3.5-27B | 27B | 27B (denso) | no disponible | Apache 2.0 | 75.0 |
| Gemma4-31B | 31B | 31B (denso) | no disponible | Gemma License | 52.0 |
| Qwen3.5-35B-A3B | 35B | 3B | no disponible | Apache 2.0 | 70.0 |

El modelo ofrece el mejor equilibrio entre rendimiento en codificación agéntica y eficiencia computacional gracias a su arquitectura MoE con 3B activos, superando a Gemma4-31B por un margen amplio y acercándose a Qwen3.5-27B, que es un modelo denso más costoso de ejecutar. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Limitaciones y advertencias

- Al ser un checkpoint intermedio (p98), puede presentar inestabilidades o comportamientos no pulidos en comparación con un lanzamiento final.
- No se dispone de información sobre sesgos o alucinaciones específicas; se recomienda evaluar en el dominio de aplicación antes de usar en producción.
- La información sobre idiomas soportados no está disponible; aunque la familia Qwen suele ser multilingüe, no se puede confirmar para esta variante.
- El tamaño del repositorio (71,9 GB) implica que la descarga y el despliegue requieren infraestructura con suficiente almacenamiento y ancho de banda.
- No se han publicado resultados de benchmarks de lenguaje general (MMLU, GSM8K, etc.), por lo que su rendimiento fuera de tareas de codificación es desconocido.
- La extensión de contexto hasta 1M tokens no está garantizada en todos los frameworks; puede requerir configuraciones específicas de RoPE y memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bluecolor777/stages-v3-p98
- Repo relacionado del mismo autor: https://huggingface.co/bluecolor777/stages-v3
- Repo v3 del mismo autor: https://huggingface.co/bluecolor777/v3
- Blog oficial de Qwen sobre Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/bluecolor777/stages-v3
