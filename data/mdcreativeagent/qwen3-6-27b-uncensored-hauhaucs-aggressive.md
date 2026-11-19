# mdcreativeagent/Qwen3.6-27B-Uncensored-HauhauCS-Aggressive

## Resumen

Qwen3.6-27B-Uncensored-HauhauCS-Aggressive es una versión modificada del modelo Qwen/Qwen3.6-27B de Alibaba, publicada por el usuario HauhauCS (redistribuida en el repositorio de mdcreativeagent) mediante técnicas de abliteration que eliminan los mecanismos de rechazo del modelo original. El resultado es un modelo denso de 27.000 millones de parámetros que conserva las capacidades del original (razonamiento, código, multimodalidad) pero responde sin negativas a peticiones que el modelo base rechazaría, con una tasa declarada de 0/465 rechazos en el benchmark interno del autor.

La arquitectura es un transformer híbrido con 64 capas que combina 48 capas de atención lineal mediante Gated DeltaNet con 16 capas de atención completa con gating. Soporta de forma nativa texto, imagen y vídeo (el repositorio incluye el proyector multimodal `mmproj` en f16), con una ventana de contexto nativa de 262.000 tokens extensible hasta aproximadamente 1 millón mediante YaRN. Los pesos se distribuyen exclusivamente en formato GGUF con cuantizaciones personalizadas K_P ("Perfect") generadas con importance matrix.

La relevancia de esta ficha radica en dos factores: por un lado, documenta una de las primeras adaptaciones no censuradas de la familia Qwen3.6 con capacidad multimodal; por otro, ilustra las cuantizaciones K_P del autor, que según sus propias mediciones elevan la calidad efectiva en uno o dos niveles respecto a la cuantización base con solo un 5-15% de incremento de tamaño. El modelo está pensado para entornos donde se requiere ausencia de rechazos (roleplay, escritura creativa sin restricciones, investigación sobre alineamiento), no como sustituto por defecto del modelo base en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (48 capas de atención lineal Gated DeltaNet + 16 capas de atención completa con gating) |
| Parámetros totales | 26.895.998.464 (aproximadamente 27B, denso) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible a ~1M con YaRN |
| Tipos de cuantización | GGUF: Q8_K_P, Q6_K_P, Q5_K_P, Q4_K_P, IQ4_XS, Q3_K_P, IQ3_M, IQ3_XS, Q2_K_P, IQ2_M; proyector multimodal mmproj f16 |
| Idiomas soportados | Inglés, chino, multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors solo como referencia de parámetros del modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-27B emplea una arquitectura híbrida poco habitual: de las 64 capas totales, 48 usan Gated DeltaNet (atención lineal con 48 cabezas V y 16 cabezas QK, dimensión de cabeza 128) y 16 usan atención completa con gating (24 cabezas Q, 4 cabezas KV, dimensión de cabeza 256, dimensión de RoPE 64). La dimensión oculta es 5120, la dimensión de la FFN es 17408 y el vocabulario alcanza 248.320 tokens. Esta combinación busca reducir el coste computacional de la atención en contextos largos manteniendo la calidad de recuperación de información de la atención completa en capas seleccionadas. El modelo es nativamente multimodal (texto, imagen y vídeo) mediante un proyector separado.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo base en la información proporcionada. Respecto a la modificación, el autor declara que no ha alterado datasets ni capacidades: la intervención consiste en abliteration sobre los pesos para eliminar las direcciones de activación asociadas al rechazo, manteniendo el resto del comportamiento intacto. Las cuantizaciones K_P se generan con importance matrix específica por modelo, con perfiles de cuantización optimizados para preservar la calidad en los pesos abliterados.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento (thinking mode) heredado del modelo base.
- Generación de código y soporte de tool calling / function calling, según las capacidades del Qwen3.6 original.
- Procesamiento multimodal nativo: entrada de imagen y vídeo junto con texto (pipeline image-text-to-text), mediante el proyector mmproj incluido en el repositorio.
- Conversación multi-turno con contexto largo de hasta 262.000 tokens nativos.
- Capacidades multilingües centradas en inglés y chino, con soporte declarado para otros idiomas.
- Ausencia de rechazos en prompts sensibles: el autor reporta 0/465 negativas en su benchmark interno, con respuesta directa sin preámbulo en la variante Aggressive.
- Compatibilidad con runtimes GGUF estándar (llama.cpp, LM Studio) sin necesidad de compilaciones especiales.

## Casos de uso

- Escritura creativa y roleplay sin restricciones: la variante Aggressive entrega respuestas directas sin preámbulos ni advertencias en prompts intensos, lo que la hace adecuada para narrativa adulta, guiones y personajes con contenido sensible donde el modelo base interrumpiría la generación.
- Investigación sobre alineamiento y seguridad: permite estudiar el comportamiento de un modelo con los mecanismos de rechazo ablacionados frente al original, comparando respuestas y midiendo el efecto de la abliteration sobre distintas categorías de prompts.
- Generación de código en local: con cuantizaciones Q4_K_P o Q5_K_P (18 y 21 GB) cabe en GPUs de consumo alto y estaciones de trabajo, permitiendo integrar el modelo en flujos de autocompletado y revisión de código sin depender de APIs externas.
- Asistentes con análisis de imágenes: el proyector multimodal permite describir capturas, extraer texto de documentos escaneados o analizar fotogramas de vídeo en pipelines locales, con la ventana de 262K tokens para adjuntar múltiples imágenes en una misma conversación.
- Procesamiento de documentos largos: la combinación de contexto de 262K tokens y atención lineal Gated DeltaNet reduce el coste de procesar contratos, informes o transcripciones extensas en una sola pasada.
- Agentes autónomos y tool use: el soporte de function calling del modelo base, junto con la ausencia de rechazos en tareas de automatización, permite construir agentes que ejecutan acciones sin bloqueos por filtros de contenido en entornos controlados.
- Despliegue en hardware modesto: las cuantizaciones IQ2_M (10 GB) e IQ3_XS (12 GB) permiten ejecutar un modelo de 27B en GPUs de 12-16 GB de VRAM, útil para prototipado y pruebas en portátiles con GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de evaluación proporcionado por el autor es la tasa de rechazos de su benchmark interno (0/465 para ambas variantes, Balanced y Aggressive), que mide comportamiento ante prompts sensibles, no capacidad general del modelo. No se dispone de resultados de MMLU, HumanEval, GSM8K ni de comparativas numéricas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: IQ2_M ~10 GB, Q2_K_P ~12 GB, IQ3_XS ~12 GB, IQ3_M ~13 GB, Q3_K_P ~14 GB, IQ4_XS ~15 GB, Q4_K_P ~18 GB, Q5_K_P ~21 GB, Q6_K_P ~23 GB, Q8_K_P ~32 GB; añadir ~928 MB para el proyector multimodal f16 y el espacio del contexto KV cache.
- GPUs recomendadas: RTX 4090 (24 GB) para Q5_K_P y Q6_K_P; RTX 3090 o RTX 4080 (16-24 GB) para Q4_K_P e IQ4_XS; A100 40/80 GB o H100 para Q8_K_P con contexto largo y despliegue concurrente.
- Cabe en GPU de consumo: sí, desde GPUs de 12 GB con IQ2_M o IQ3_XS hasta 24 GB con Q6_K_P; las cuantizaciones Q8_K_P requieren GPU profesional o partición en CPU.
- Opciones de despliegue: llama.cpp y LM Studio son los runtimes de referencia para GGUF; también es compatible cualquier runtime que soporte GGUF (por ejemplo, Ollama o servidores basados en llama.cpp). El autor advierte que LM Studio puede mostrar "?" en la columna de cuantización para los formatos K_P, un problema únicamente de visualización.
- Latencia y throughput: no disponibles en la información proporcionada. La atención lineal en 48 de las 64 capas debería reducir el coste en contextos largos frente a un transformer de atención completa equivalente, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.6-27B-Uncensored-HauhauCS-Aggressive (este) | 27B denso | 262K (ext. ~1M YaRN) | Texto, imagen, vídeo | Apache 2.0 | GGUF | Sin rechazos (0/465), cuantizaciones K_P |
| Qwen3.6-27B-Uncensored-HauhauCS-Balanced | 27B denso | 262K (ext. ~1M YaRN) | Texto, imagen, vídeo | Apache 2.0 | GGUF | Misma tasa 0/465, respuestas con razonamiento previo; recomendado por el autor como opción por defecto |
| Qwen/Qwen3.6-27B (base) | 27B denso | 262K (ext. ~1M YaRN) | Texto, imagen, vídeo | Apache 2.0 | Safetensors (y GGUF de terceros) | Modelo original con alineamiento y rechazos intactos; referencia de capacidades |
| Alternativas no censuradas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- La abliteration elimina los rechazos pero no garantiza la corrección factual: el modelo puede generar contenido dañino, ilegal o sexualmente explícito sin filtro, lo que traslada toda la responsabilidad de moderación al integrador.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de fidelidad factual ni comparativas con el modelo base en tareas de conocimiento.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas locales (por ejemplo, en la UE respecto a material de abuso infantil o contenido ilícito); el despliegue público exige filtros externos.
- Sesgos: no se documentan evaluaciones de sesgo; la eliminación de rechazos puede amplificar estereotipos en respuestas sobre temas sensibles.
- Cobertura idiomática limitada: el modelo está centrado en inglés y chino; el rendimiento en castellano no está verificado y probablemente sea inferior al de modelos con entrenamiento específico.
- Cuantizaciones de 2-3 bits (IQ2_M, Q2_K_P, IQ3_XS) degradan la calidad de forma notable; el propio autor recomienda Q4 o superior para uso serio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, y los pesos se redistribuyen desde el repositorio de HauhauCS: conviene verificar la integridad de los archivos antes de usarlos en producción.
- La variante Aggressive omite preámbulos y advertencias; para agentes y código el autor recomienda explícitamente la variante Balanced por su mayor estabilidad de muestreo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mdcreativeagent/Qwen3.6-27B-Uncensored-HauhauCS-Aggressive
- Repositorio original del autor (HauhauCS): https://huggingface.co/HauhauCS/Qwen3.6-27B-Uncensored-HauhauCS-Aggressive
- Variante Balanced: https://huggingface.co/HauhauCS/Qwen3.6-27B-Uncensored-HauhauCS-Balanced
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Discord del autor: https://discord.gg/SZ5vacTXYf
