# Huntfat/Qwen3.5-122B-A10B-Uncensored-HauhauCS-Aggressive-huntfat

## Resumen

El modelo `Huntfat/Qwen3.5-122B-A10B-Uncensored-HauhauCS-Aggressive-huntfat` es una variante sin censura del modelo base Qwen/Qwen3.5-122B-A10B, desarrollada por HauhauCS y redistribuida por Huntfat. Se trata de un modelo de lenguaje de gran tamaño con arquitectura de mezcla de expertos (MoE) y capacidades multimodales (texto, imagen y vídeo). La modificación principal consiste en la eliminación de los rechazos del modelo original: según la model card, logra 0/465 refusals en pruebas de prompts, manteniendo intactas las capacidades originales. La variante "Aggressive" es la más agresiva en cuanto a la eliminación de restricciones, reduciendo también los avisos legales que aparecían en versiones anteriores.

El modelo tiene 122 111 526 912 parámetros totales (122B) y aproximadamente 10B parámetros activos por paso, gracias a su arquitectura MoE con 256 expertos (8 enrutados + 1 compartido por token). Emplea una arquitectura híbrida que combina atención lineal Gated DeltaNet con atención softmax completa en una proporción 3:1, distribuida en 48 capas con un patrón de 12 bloques de 3 capas DeltaNet-MoE seguidas de 1 capa Attention-MoE. Su contexto nativo es de 262 144 tokens y soporta 201 idiomas con un vocabulario de 248 000 tokens. Se distribuye exclusivamente en formato GGUF con múltiples cuantizaciones personalizadas (K_P, K_M, IQ) y un proyector multimodal (mmproj) para visión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida: Gated DeltaNet (atención lineal) + atención softmax completa, ratio 3:1 |
| Parametros totales | 122 111 526 912 (122B) |
| Parametros activos | ~10B (8 expertos enrutados + 1 compartido por token, de 256 expertos) |
| Longitud de contexto | 262 144 tokens (nativo) |
| Tipos de cuantizacion | Q8_K_P, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, IQ3_XXS, IQ2_M, más mmproj f16 |
| Idiomas soportados | 201 idiomas (en, zh, multilingual) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con archivo mmproj para visión) |

## Arquitectura y entrenamiento

La arquitectura del modelo base Qwen3.5-122B-A10B es una mezcla de expertos con 256 expertos, de los cuales 8 se enrutan por token junto con un experto compartido. La capa de atención combina dos mecanismos: Gated DeltaNet, una forma de atención lineal eficiente en memoria, y atención softmax completa, en una proporción de 3 capas DeltaNet por cada capa de atención softmax. Este diseño híbrido reduce el coste computacional en contextos largos manteniendo la calidad de la atención completa. El modelo tiene 48 capas organizadas en 12 bloques repetidos de 4 capas (3 DeltaNet-MoE + 1 Attention-MoE).

El proceso de "uncensoring" realizado por HauhauCS no modifica los datos de entrenamiento ni las capacidades del modelo original; se trata de un ajuste de pesos que elimina los patrones de rechazo y reduce los avisos legales. No se especifican los datos de entrenamiento adicionales ni si se usaron técnicas como RLHF o DPO. La model card indica que el modelo conserva el 100% de las funcionalidades previstas por los autores originales, pero sin las respuestas de negativa.

## Capacidades

- Generación de texto y razonamiento complejo en 201 idiomas, con un vocabulario de 248 000 tokens.
- Procesamiento multimodal: entrada de texto, imagen y vídeo (requiere el archivo mmproj junto al GGUF).
- Modo "thinking" activado por defecto, que permite razonamiento encadenado antes de responder; se puede desactivar mediante parámetros de plantilla de chat.
- Soporte de contexto largo de hasta 262 144 tokens, adecuado para documentos extensos o conversaciones de múltiples turnos.
- Capacidad de seguir instrucciones y mantener coherencia en diálogos largos, gracias a la arquitectura híbrida de atención.
- Sin restricciones de rechazo: el modelo responde a prompts que el modelo base rechazaría, incluyendo contenido sensible o controvertido.
- Compatible con runtimes GGUF como llama.cpp, LM Studio, Jan y koboldcpp, con soporte de plantilla Jinja.

## Casos de uso

- Generación de contenido creativo sin filtros: escritura de ficción, guiones, poesía o narrativa con temáticas adultas o controvertidas, donde el modelo no impone bloqueos temáticos.
- Análisis y descripción de imágenes: gracias al proyector multimodal, puede procesar fotografías o capturas y generar descripciones detalladas, incluso en contextos donde el contenido pueda ser sensible.
- Asistencia en programación con razonamiento extendido: el modo thinking permite descomponer problemas complejos de código en pasos intermedios, útil para depuración o diseño de algoritmos.
- Procesamiento de documentos legales o técnicos extensos: con 262K de contexto, puede resumir o extraer información de contratos, informes o manuales de cientos de páginas.
- Chatbots de rol sin restricciones: para aplicaciones de entretenimiento o simulación de personajes donde se requiere libertad total de diálogo, sin rechazos por contenido explícito.
- Investigación en seguridad y alineación: estudiar el comportamiento de modelos sin guardas de seguridad, para analizar riesgos de sesgo o toxicidad en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El único dato de rendimiento mencionado es la tasa de rechazos (0/465), que no es un benchmark de calidad sino de comportamiento de seguridad.

## Requisitos de hardware

- VRAM estimada según cuantización: el archivo Q4_K_M ocupa 74 GB, por lo que se necesita al menos 80 GB de VRAM para cargarlo completo en GPU (por ejemplo, una A100 80GB o 2x RTX 4090 24GB con reparto de capas).
- Cuantizaciones más ligeras: IQ2_M (40 GB) o IQ3_XXS (47 GB) podrían caber en una sola GPU de 48 GB (como A6000 o L40S), pero con pérdida de calidad.
- No cabe en GPUs de consumo de 24 GB (RTX 3090/4090) ni siquiera con la cuantización más baja, salvo usando offloading a CPU o múltiples GPUs.
- Opciones de despliegue: llama.cpp, LM Studio, Jan, koboldcpp y cualquier runtime compatible con GGUF. Se recomienda usar el flag `--jinja` para la plantilla de chat y `--mmproj` para visión.
- Latencia y throughput: no disponibles. Dependen del hardware y de la cuantización; al ser un modelo MoE con ~10B activos, la velocidad de generación es superior a la de un modelo denso de 122B, pero sigue requiriendo GPUs de alta gama.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-122B-A10B (base) | 122B | ~10B | 262K | Apache-2.0 | safetensors |
| Qwen3.5-122B-A10B-Uncensored (este) | 122B | ~10B | 262K | Apache-2.0 | GGUF |
| Qwen3.5-35B-A3B-Uncensored (HauhauCS) | 35B | ~3B | no disponible | Apache-2.0 | GGUF |
| Qwen3.5-27B-Uncensored (HauhauCS) | 27B | 27B (denso) | no disponible | Apache-2.0 | GGUF |

La comparativa se limita a modelos de la misma familia y del mismo autor, ya que no se dispone de datos de rendimiento para comparar con alternativas externas. La principal diferencia entre el modelo base y el uncensored es la eliminación de rechazos, mientras que las capacidades técnicas permanecen idénticas. Los modelos más pequeños de HauhauCS ofrecen una alternativa con menores requisitos de hardware, aunque con menos capacidad.

## Limitaciones y advertencias

- Al ser una variante "uncensored" y "aggressive", el modelo puede generar contenido ofensivo, ilegal, peligroso o éticamente cuestionable. No debe desplegarse en producción sin supervisión humana y sin políticas de uso claras.
- No se han publicado evaluaciones de sesgos ni de toxicidad. Es probable que herede los sesgos del modelo base, amplificados por la eliminación de guardas.
- Riesgo de alucinación: no se ha evaluado específicamente, pero es inherente a los modelos de lenguaje. En contextos largos (262K) la coherencia puede degradarse en las últimas partes de la secuencia.
- La licencia Apache-2.0 permite uso comercial, pero el contenido generado puede violar leyes locales (difamación, incitación al odio, etc.). El responsable del despliegue asume la responsabilidad legal.
- El modelo requiere el archivo mmproj para funciones de visión; sin él, solo funciona en modo texto.
- La cuantización K_P puede mostrarse como "?" en LM Studio, aunque es un problema de visualización y no afecta al funcionamiento.
- No se garantiza la estabilidad del comportamiento "uncensored" en todos los prompts; algunos pueden seguir generando respuestas evasivas o disclaimers residuales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Huntfat/Qwen3.5-122B-A10B-Uncensored-HauhauCS-Aggressive-huntfat
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Modelo original de HauhauCS: https://huggingface.co/HauhauCS/Qwen3.5-122B-A10B-Uncensored-HauhauCS-Aggressive
- Otros modelos de HauhauCS: https://huggingface.co/HauhauCS/Qwen3.5-35B-A3B-Uncensored-HauhauCS-Aggressive, https://huggingface.co/HauhauCS/Qwen3.5-27B-Uncensored-HauhauCS-Aggressive, https://huggingface.co/HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive, https://huggingface.co/HauhauCS/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive
- Guía de la serie Qwen3.5 (2026): https://explore.n1n.ai/blog/qwen3-5-model-series-2026-guide-2026-02-25
- Artículo sobre el modelo uncensored: https://www.localainews.co/news/llm/qwen3-5-122b-a10b-uncensored-hauhaucs-aggressive-defies-limits/
- Ficha en thinkllm.dev: https://thinkllm.dev/models/qwen3-5-122b-a10b-uncensored-hauhaucs-aggressive
