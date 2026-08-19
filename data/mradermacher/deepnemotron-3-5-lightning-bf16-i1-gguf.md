# mradermacher/DeepNemotron-3.5-Lightning-BF16-i1-GGUF

## Resumen

DeepNemotron-3.5-Lightning-BF16-i1-GGUF es una versión cuantizada en formato GGUF del modelo NVIDIA Nemotron 3.5 Lightning, un modelo de lenguaje de razonamiento y conversación desarrollado por NVIDIA. El repo original pertenece a vcruz305 y esta variante ha sido preparada por mradermacher, un cuantizador conocido en la comunidad, utilizando la técnica de imatrix para mejorar la calidad de la cuantización. El modelo emplea una arquitectura híbrida Latent Mixture-of-Experts (LatentMoE) que combina capas Mamba-2, capas MoE y capas de atención selectiva, activando solo 3 mil millones de sus 31,58 mil millones de parámetros por token, lo que permite un rendimiento de inferencia comparable a modelos densos mucho más grandes.

La relevancia de este modelo radica en su equilibrio entre capacidad de razonamiento y eficiencia computacional. Pre-entrenado con más de 20 billones de tokens, el modelo base destaca en tareas de razonamiento y generación de código, y esta versión GGUF lo hace accesible para despliegue en entornos con recursos limitados, como GPUs de consumo o CPUs, mediante motores como llama.cpp u Ollama. El repositorio incluye una amplia gama de cuantizaciones, desde Q2_K hasta Q6_K, lo que permite adaptar el modelo a diferentes requisitos de memoria y calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LatentMoE híbrida (Mamba-2 + MoE + atención selectiva) |
| Parametros totales | 31.577.940.288 (31,58 B) |
| Parametros activos | 3 B (por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | 6 (no especificados en la informacion disponible) |
| Licencia | openmdw-1.1 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base NVIDIA Nemotron 3.5 Lightning emplea una arquitectura híbrida LatentMoE que intercala capas Mamba-2 (modelos de espacio de estado) con capas de mezcla de expertos (MoE) y algunas capas de atención tradicionales. Esta combinación permite capturar dependencias de largo alcance de forma eficiente mientras se mantiene un coste computacional bajo gracias a la activación selectiva de solo 3 B de parámetros por token. El diseño está orientado a razonamiento y generación de código, con soporte para métodos de decodificación especulativa que aceleran la generación de texto.

El pre-entrenamiento se realizó con más de 20 billones de tokens, según la documentación de NVIDIA. Posteriormente, se aplicó un post-entrenamiento con datos curados y generados sintéticamente de alta calidad, incluyendo una pequeña porción de datos de pregunta-respuesta y de alineación para mejorar la precisión del modelo. No se especifica el uso de RLHF o DPO en la información disponible, aunque la mención de datos de alineación sugiere algún tipo de ajuste de preferencias.

## Capacidades

- Generación de texto conversacional con capacidad de razonamiento multi-paso.
- Generación de código y asistencia en tareas de programación.
- Soporte de decodificación especulativa para acelerar la inferencia (según documentación de NVIDIA).
- Capacidades multilingües en 6 idiomas (no especificados en la información disponible).
- Modelo text-only (solo texto, sin visión ni audio).
- No se menciona explícitamente soporte de tool calling o function calling en la información disponible, aunque por su naturaleza conversacional podría ser compatible mediante ajustes posteriores.

## Casos de uso

- Asistente de programación en entornos de desarrollo: el modelo puede generar fragmentos de código, explicar algoritmos o depurar errores. Su capacidad de razonamiento y su entrenamiento en código lo hacen adecuado para integrarse en IDEs o pipelines de CI/CD como ayuda a desarrolladores.
- Chatbot de soporte técnico especializado: gracias a su naturaleza conversacional y su bajo número de parámetros activos, puede desplegarse en servidores con GPUs modestas para atender consultas de usuarios en tiempo real, manteniendo respuestas coherentes en diálogos multi-turno.
- Generación de documentación técnica: puede redactar explicaciones, comentarios de código o manuales a partir de especificaciones, aprovechando su capacidad de razonamiento y comprensión de contextos largos (aunque la longitud exacta de contexto no está disponible).
- Análisis de logs y resolución de incidencias: con su capacidad de razonamiento, puede procesar registros de errores y sugerir causas probables o soluciones, integrándose en herramientas de observabilidad.
- Educación y tutoría en informática: puede actuar como tutor interactivo explicando conceptos de programación, matemáticas o ciencias, adaptándose al nivel del estudiante mediante conversación.
- Prototipado rápido de aplicaciones de lenguaje natural: al ser un modelo GGUF, puede ejecutarse localmente en portátiles con GPU de consumo (por ejemplo, RTX 3060 o superior) para desarrollar y probar aplicaciones de IA generativa sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentación de NVIDIA menciona que el modelo destaca en razonamiento y codificación, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros tests estandarizados. Se recomienda consultar la documentación oficial de NVIDIA para obtener métricas detalladas.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización elegida. Para el modelo completo en BF16 (~63 GB de pesos), se necesitaría una GPU con al menos 64 GB (por ejemplo, A100 80GB o H100). Con cuantizaciones GGUF, la memoria se reduce significativamente: Q4_K_M (~4,5 bits por peso) requeriría aproximadamente 18 GB de VRAM para los pesos, más overhead de contexto y activaciones, por lo que cabría en una RTX 4090 (24 GB) o similar.
- GPU recomendadas: para cuantizaciones bajas (Q2_K, Q3_K), una RTX 3060 (12 GB) o RTX 4060 (16 GB) podría ser suficiente; para cuantizaciones medias (Q4_K_M, Q5_K_M), se recomienda RTX 4080/4090 o A100. Para cuantizaciones altas (Q6_K, Q8_0), se necesitan GPUs de datacenter con 40 GB o más.
- Al ser un modelo MoE con solo 3 B de parámetros activos, la inferencia es significativamente más rápida que un modelo denso de 30 B, permitiendo mayor throughput en GPUs de gama media.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con soporte para GGUF a través de conversión), y cualquier motor compatible con el formato GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dependen de la cuantización, el hardware y la longitud de contexto.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa rigurosa con otros modelos de la misma categoría. El modelo base es comparable a otros MoE de ~30 B como Mixtral 8x7B (47 B totales, 13 B activos) o Qwen1.5-MoE-A2.7B (14 B totales, 2,7 B activos), pero no se han encontrado benchmarks públicos que permitan una comparación directa. La información disponible se limita al propio modelo y a su documentación oficial.

## Limitaciones y advertencias

- No se han documentado sesgos específicos en la información disponible, pero como todo modelo de lenguaje, puede reflejar sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinación: inherente a los modelos generativos; se recomienda validar las respuestas en aplicaciones críticas.
- Limitaciones de contexto: la longitud máxima de contexto no está especificada en la información proporcionada, lo que dificulta planificar su uso en tareas que requieran ventanas muy largas.
- Licencia openmdw-1.1: es una licencia de código abierto de NVIDIA, pero no se especifica si permite uso comercial sin restricciones. Se recomienda revisar los términos exactos antes de su uso en producción.
- El modelo es text-only; no soporta entrada multimodal (imagen, audio).
- Al ser una cuantización GGUF, puede haber una ligera degradación de calidad respecto al modelo original en BF16, especialmente en cuantizaciones muy bajas (Q2_K, IQ1_M).

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/mradermacher/DeepNemotron-3.5-Lightning-BF16-i1-GGUF
- Repositorio del modelo base (BF16): https://huggingface.co/vcruz305/DeepNemotron-3.5-Lightning-BF16
- Repositorio de la versión GGUF del modelo base (mradermacher): https://huggingface.co/mradermacher/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Base-BF16-GGUF
- Página del modelo en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/nvidia/models/nemotron-3.5-lightning
- Documentación de NVIDIA para empezar con Nemotron 3.5 Lightning: https://docs.nvidia.com/nim/large-language-models/latest/get-started/advanced/get-started-nemotron-3.5-lightning.html
- Model card en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
