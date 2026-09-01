# Openintelligent123/Muse-Glimmer-30B

## Resumen

Muse Glimmer es un modelo de lenguaje causal de 30.000 millones de parámetros desarrollado por Meta Superintelligence Lab, diseñado específicamente para tareas agénticas autónomas en hardware de consumo. Se distribuye bajo licencia Apache 2.0 y destaca por integrar razonamiento multi-paso, uso fiable de herramientas, comprensión multimodal (texto e imágenes) y recuperación ante fallos en un único sistema que puede ejecutarse localmente sin conexión a la nube. Su arquitectura combina un transformador denso con un encoder de percepción ViT-G/14 de aproximadamente 1.800 millones de parámetros, lo que le permite procesar entradas intercaladas de texto e imagen.

El modelo se presenta como una destilación de Muse Spark, orientado a entornos agénticos de extremo a extremo. Con una ventana de contexto de 131.072 tokens o más, soporta más de 100 idiomas y ha sido optimizado para ejecutarse en una única GPU de consumo mediante cuantización a 4 bits, manteniendo una degradación mínima en tareas agénticas. Incluye además un modelo auxiliar de decodificación especulativa basado en DFlash que acelera la generación de texto hasta 3,1 veces en hardware NVIDIA RTX 5090.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformador causal denso con encoder de percepción (ViT-G/14) |
| Parametros totales | 29.776.626.688 (aproximadamente 29,6B, incluye encoder de visión) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072+ tokens |
| Tipos de cuantizacion | Full precision (BF16), K-Quant-Dynamic (32GB VRAM), K-Quant-17GB (24GB VRAM) |
| Idiomas soportados | Más de 100 idiomas (entrenado con datos multilingües) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repositorio HuggingFace), GGUF (K-Quant, disponible en LM Studio) |

## Arquitectura y entrenamiento

Muse Glimmer emplea un transformador causal denso de 52 capas con dimensión oculta de 6.656 y atención con patrón repetitivo [Local, Local, Local, Global], donde las capas locales usan una ventana deslizante de 2.048 tokens y las globales permiten atención completa. La atención utiliza GQA con 32 cabezas de consulta y 2 de clave/valor (ratio 16:1), dimensión de cabeza de 128, y FFN tipo SwiGLU con dimensión intermedia de 19.968. La codificación posicional es RoPE con theta de 500.000, aplicada solo en capas locales. El vocabulario consta de 202.048 tokens (200.000 BPE más 2.048 especiales).

El encoder de percepción es un ViT-G/14 de 50 capas, ancho 1.536 y tamaño de parche 14, que genera hasta 4.096 tokens visuales por imagen. Los datos de entrenamiento incluyen contenido multimodal de fuentes públicas, datos de terceros y productos de Meta, con un corte de conocimiento en enero de 2026. No se especifica el número total de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO. La innovación principal es la decodificación especulativa con un modelo auxiliar DFlash de 5 capas que propone bloques de 16 tokens en una sola pasada, verificados en paralelo por el modelo principal.

## Capacidades

- Ejecución de tareas agénticas de extremo a extremo: resolución de peticiones multi-turno completas, incluyendo escritura y depuración de código dentro de scaffolds.
- Uso fiable de herramientas: invocación de funciones con esquemas precisos a lo largo de flujos de trabajo extendidos.
- Razonamiento multi-paso: encadenamiento de razonamiento sobre horizontes largos con planes coherentes.
- Recuperación ante fallos: diagnóstico de errores en llamadas a herramientas y reintento automático en lugar de detenerse.
- Comprensión multimodal: acepta texto e imágenes intercaladas, permitiendo interpretar capturas de pantalla, gráficos y documentos.
- Compatibilidad con scaffolds agénticos: funciona con OpenClaw, Hermes Agent y otros patrones de orquestación.
- Esfuerzo controlable: soporta diferentes niveles de razonamiento para equilibrar calidad y velocidad.
- Multilingüe: entrenado con datos de más de 100 idiomas.

## Casos de uso

- Asistente de atención al cliente automatizada: el modelo gestiona conversaciones multi-turno con contexto largo (131K tokens) y puede consultar bases de conocimiento mediante tool calling, manteniendo el historial completo de la interacción.
- Agente de automatización de tareas de oficina: interpreta capturas de pantalla de aplicaciones, extrae información de documentos y ejecuta acciones a través de APIs, con recuperación automática si una llamada falla.
- Generación y depuración de código en entornos CI/CD: integrado en pipelines, el modelo escribe código, ejecuta pruebas y corrige errores de forma autónoma, gracias a su capacidad de razonamiento multi-paso y uso de herramientas.
- Análisis de documentos técnicos con imágenes: procesa informes que combinan texto y figuras, extrayendo conclusiones y respondiendo preguntas sobre el contenido visual.
- Asistente de investigación local: con acceso a herramientas de búsqueda web y razonamiento encadenado, el modelo realiza búsquedas profundas (DeepSearch) y sintetiza respuestas con citas, funcionando sin conexión a la nube.
- Agente de soporte técnico en dispositivos edge: desplegado en una estación de trabajo con GPU de 24GB, el modelo diagnostica problemas, consulta manuales y guía al usuario paso a paso, manteniendo privacidad de datos al no enviar información a servidores externos.

## Benchmarks y rendimiento

La model card menciona evaluaciones en DeepSearch QA, MCP-Atlas, τ3-Bench y SWE-Bench, pero no se proporcionan resultados numéricos específicos en la información disponible. Sí se incluyen datos de degradación por cuantización y velocidades de generación con decodificación especulativa:

| Configuracion | Degradacion media* | Hardware objetivo |
|---|---|---|
| Full precision | - | 64GB VRAM |
| K-Quant-Dynamic | 0,2% | 32GB VRAM |
| K-Quant-17GB | 1,0% | 24GB VRAM |

*Degradación medida como promedio de métricas de precisión en 15 benchmarks comunes.

| GPU | Velocidad sin especulacion (tok/s) | Velocidad media con DFlash (tok/s) | Aceleracion |
|---|---|---|---|
| NVIDIA RTX 5090 | 74,9 | 233,4 | 3,1x |
| Apple M4 Max | 23,7 | 37,8 | 1,5x |
| Apple M5 Max | 26,6 | 50,2 | 1,8x |

Mediciones con batch size 1 y decodificación greedy. No se han publicado resultados detallados de los benchmarks de tareas agénticas en la información disponible.

## Requisitos de hardware

- VRAM estimada: 64GB para full precision, 32GB para K-Quant-Dynamic, 24GB para K-Quant-17GB (incluyendo KV cache, encoder de percepción y drafter).
- GPU recomendadas: NVIDIA RTX 5090 (verificada), Apple M4 Max y M5 Max (verificadas); compatible con otras GPUs de 24GB o más.
- Cabe en GPU de consumo: sí, con cuantización K-Quant-17GB en tarjetas de 24GB como RTX 4090 o RTX 5090.
- Opciones de despliegue: compatible con transformers (safetensors) y formatos GGUF para llama.cpp, Ollama o LM Studio; también disponible en NVIDIA NIM.
- Latencia y throughput: 233,4 tok/s en RTX 5090 con DFlash, 37,8 tok/s en M4 Max y 50,2 tok/s en M5 Max, medidos con batch size 1.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de la misma categoría en los datos proporcionados. El modelo se posiciona como una alternativa abierta de 30B para agentes locales, pero no se han publicado comparaciones directas con otros modelos como Llama 3.1 30B o Qwen 2.5 32B en la documentación disponible.

## Limitaciones y advertencias

- No se documentan sesgos específicos en la model card, pero al ser un modelo entrenado con datos públicos y de terceros, puede heredar sesgos presentes en esos datos.
- Riesgo de alucinación inherente a los modelos generativos; la recuperación ante fallos mitiga errores en flujos agénticos, pero no elimina la posibilidad de respuestas incorrectas.
- La ventana de contexto de 131K tokens es amplia, pero el rendimiento puede degradarse en secuencias muy largas si no se gestiona adecuadamente la memoria.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero los datos de entrenamiento pueden incluir contenido con derechos de autor; se recomienda revisar las políticas de uso de Meta.
- La cuantización K-Quant-17GB introduce una degradación del 1,0% en benchmarks, que puede ser relevante en aplicaciones de alta precisión.
- El modelo requiere hardware con al menos 24GB de VRAM para un funcionamiento fluido; en equipos con menos memoria, la experiencia puede verse limitada.

## Enlaces

- HuggingFace: https://huggingface.co/Openintelligent123/Muse-Glimmer-30B
- Página oficial de Meta: https://developer.meta.com/ai/models/muse-glimmer/
- Blog de investigación de Meta: https://research.meta.ai/blog/introducing-muse-glimmer-open-agentic-model
- NVIDIA NIM: https://build.nvidia.com/meta/muse-glimmer-30b/modelcard
- LM Studio: https://lmstudio.ai/models/meta/muse-glimmer
- Guía en Analytics Insight: https://www.analyticsinsight.net/artificial-intelligence/muse-glimmer-complete-guide-to-metas-open-agentic-ai-model
- Paper del encoder de percepción (ViT-G/14): https://arxiv.org/abs/2504.13181
- Paper de DFlash (decodificación especulativa): https://arxiv.org/abs/2602.06036
