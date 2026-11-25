# hif1000/Qwen3.8-27B-SHI2-GGUF

## Resumen

Qwen3.8-27B-SHI2-GGUF es una cuantización del modelo Qwen3.8-27B publicada por el usuario hif1000 bajo el esquema denominado Shifter, un formato de cuantización entera nativa descrito en el artículo arXiv:2611.33080. El modelo base, Qwen3.8-27B, es un modelo denso de la familia Qwen (Alibaba) con 27 mil millones de parámetros nominales, arquitectura híbrida de atención lineal (Gated DeltaNet) y atención con compuerta (Gated Attention), y capacidad nativa de visión y lenguaje. Esta release empaqueta esos pesos en un único fichero GGUF (`Qwen3.8-27B-SHI2.gguf`) pensado para ejecutarse con el runtime Shifter sobre Linux con CUDA.

La relevancia de esta ficha es doble. Por un lado, documenta una de las primeras cuantizaciones comunitarias del Qwen3.8-27B en un formato distinto del GGUF convencional (llama.cpp), lo que afecta directamente a las opciones de despliegue. Por otro, conviene advertir de una discrepancia importante: los metadatos de safetensors del repositorio declaran 10.658.625.834 parámetros reales, muy por debajo de los 27B que anuncia la model card del modelo base. El tamaño del repositorio (11,1 GB) es coherente con esa cifra menor, no con un modelo denso de 27B en precisión reducida. Cualquier evaluación de producción debe partir de esa incertidumbre.

El checkpoint se distribuye con licencia Apache 2.0, pipeline de text-generation y sin métricas de adopción (0 descargas, 0 likes en el momento de la consulta). No se han publicado idiomas soportados ni resultados de benchmarks propios de esta cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con encoder de visión: 16 bloques de (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)); atención lineal Gated DeltaNet + atención con compuerta |
| Parametros totales | 27B según la model card del modelo base; 10.658.625.834 según los metadatos de safetensors del repositorio |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | Shifter (SHI2), cuantización entera nativa; no se documentan otros niveles |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero único `Qwen3.8-27B-SHI2.gguf`) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura híbrida poco habitual: 64 capas organizadas en 16 bloques que combinan tres subcapas de Gated DeltaNet (atención lineal con 48 cabezas para V y 16 para QK, dimensión de cabeza 128) seguidas de una subcapa de Gated Attention (24 cabezas Q, 4 cabezas KV, dimensión de cabeza 256, RoPE de 64 dimensiones). La dimensión oculta es 5120, la dimensión intermedia de la FFN es 17.408 y el vocabulario está padding a 248.320 tokens. Incluye un encoder de visión para comprensión nativa de imágenes y vídeo, y se entrenó con Multi-Token Prediction (MTP) en varios pasos, lo que habilita decodificación especulativa.

El entrenamiento del modelo base combina preentrenamiento y postentrenamiento (la model card indica "Pre-training & Post-training" sin detallar número de tokens ni composición del dataset). Dispone de control flexible de razonamiento: modo thinking activado por defecto, desactivable por petición, con parámetros `reasoning_effort` y `preserve_thinking`. La cuantización SHI2 aplicada por hif1000 transforma los pesos a representaciones enteras compactas para cómputo entero nativo, según el artículo de Shifter; no se documentan en esta ficha los detalles del algoritmo de cuantización, el número de bits efectivos ni las métricas de degradación.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo thinking controlable por petición.
- Comprensión nativa de imágenes y vídeo (diagramas STEM, documentos, vídeos de hasta una hora según la model card).
- Programación y tareas de trabajo profesional y research, con mejoras declaradas frente a Qwen3.5 y Qwen3.6.
- Ejecución agéntica: planificación autónoma y manejo de feedback del entorno para completar tareas de extremo a extremo.
- Control de profundidad de razonamiento mediante `reasoning_effort` y retención de contexto de razonamiento histórico mediante `preserve_thinking`.
- Multi-Token Prediction entrenado, que permite decodificación especulativa.
- Soporte multilingüe: no disponible en la información proporcionada.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.

## Casos de uso

- Análisis de documentos técnicos largos: con 262.144 tokens de contexto nativo, el modelo puede ingerir manuales, papers o expedientes completos y responder preguntas cruzadas sin troceado, siempre que el runtime Shifter gestione correctamente la ventana extendida.
- Comprensión de diagramas y documentación visual: el encoder de visión permite extraer información de esquemas de arquitectura, gráficas y capturas de pantalla, útil en herramientas de soporte técnico o revisión de diseño.
- Procesamiento de vídeo de larga duración: la model card declara soporte de vídeos de hasta una hora, aplicable a resumen de reuniones, análisis de material docente o revisión de grabaciones de incidencias.
- Automatización agéntica de tareas de desarrollo: la planificación autónoma y el manejo de feedback del entorno lo hacen adecuado para pipelines que ejecutan pasos múltiples con verificación intermedia, aunque la integración con harnesses concretos debe validarse.
- Asistencia a investigación: síntesis de literatura, extracción estructurada de resultados y generación de borradores técnicos aprovechando el contexto largo y el modo thinking para tareas de razonamiento profundo.
- Despliegue en infraestructura con CUDA y Linux: al requerir el runtime Shifter compilado desde fuente, encaja en entornos controlados donde el equipo puede construir y mantener el stack, no en despliegues estándar de llama.cpp u Ollama.
- Prototipado de razonamiento con coste controlado: el modo thinking desactivable por petición permite alternar entre respuestas rápidas y razonamiento profundo según la carga, útil en servicios con presupuesto de latencia variable.

## Benchmarks y rendimiento

La model card del modelo base incluye una tabla de rendimiento en texto, pero en la información proporcionada solo aparece la cabecera de la tabla, sin valores numéricos. No se han publicado resultados de benchmarks en la información disponible para esta cuantización SHI2.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión. El repositorio pesa 11,1 GB, lo que sugiere que el fichero GGUF cabe en GPUs de 16 GB o más, pero esa cifra es incompatible con un modelo denso de 27B y coherente con los 10,66B parámetros de los metadatos; debe verificarse antes de dimensionar.
- GPU recomendadas: no disponibles en la información proporcionada. El runtime Shifter requiere Linux con soporte CUDA; no se especifican versiones mínimas de CUDA ni arquitecturas soportadas.
- Cabe en GPU de consumo: probablemente sí en el rango de 16-24 GB si se confirma el tamaño real de 10,66B parámetros, pero no hay confirmación oficial.
- Opciones de despliegue: exclusivamente el runtime Shifter (compilado desde el repositorio `yufenghuang/shifter`), mediante `shifter serve -m hif1000/Qwen3.8-27B-SHI2-GGUF`. No se declara compatibilidad con llama.cpp, Ollama, vLLM, TGI ni SGLang para este fichero SHI2; el modelo base sí es compatible con Transformers, vLLM, SGLang y TokenSpeed en su formato original.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| Qwen3.8-27B-SHI2-GGUF (esta ficha) | 27B nominales / 10,66B en safetensors | 262.144 (hasta 1M) | Sí | Apache 2.0 | GGUF SHI2 / Shifter |
| Qwen3.8-27B (modelo base) | 27B | 262.144 (hasta 1M) | Sí | Apache 2.0 | Safetensors / Transformers, vLLM, SGLang, TokenSpeed |
| Cuantizaciones GGUF convencionales de Qwen3.8-27B | 27B | 262.144 | Sí | Apache 2.0 | GGUF / llama.cpp, Ollama |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Discrepancia crítica de parámetros: los metadatos de safetensors declaran 10.658.625.834 parámetros frente a los 27B de la model card del base. Verificar el contenido real del GGUF antes de cualquier uso en producción.
- Runtime único: el fichero SHI2 solo se ejecuta con Shifter, compilado desde fuente en Linux con CUDA. No hay soporte declarado para llama.cpp, Ollama, vLLM ni TGI, lo que limita la portabilidad y añade coste de mantenimiento.
- Madurez del ecosistema: el artículo de Shifter (arXiv:2611.33080) y el repositorio del runtime son recientes; no se documentan métricas de degradación de calidad de la cuantización SHI2 frente al modelo original.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria ni informes independientes.
- Idiomas soportados no declarados: no se puede garantizar el comportamiento multilingüe sin evaluación propia.
- Riesgo de alucinación: inherente a los modelos generativos; el modo thinking activado por defecto puede aumentar la latencia y no elimina el riesgo en tareas factuales.
- Sesgos: no documentados en la información disponible; se heredan los del modelo base y su dataset de entrenamiento, no especificado.
- Licencia Apache 2.0 permite uso comercial, pero la licencia del runtime Shifter y sus dependencias debe revisarse por separado.
- Sin benchmarks publicados para esta cuantización: cualquier decisión de despliegue debe apoyarse en una evaluación propia sobre el dominio objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hif1000/Qwen3.8-27B-SHI2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Artículo de Shifter Quantization: https://arxiv.org/abs/2611.33080
- Repositorio del runtime Shifter: https://github.com/yufenghuang/shifter
- Model card del base (revisión citada): https://huggingface.co/Qwen/Qwen3.8-27B/blob/37561816e66b5b9153b1b64c10968c18c1e6f4a0/README.md
- Servicio gestionado Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
