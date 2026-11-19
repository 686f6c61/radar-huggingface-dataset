# mdcreativeagent/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive

## Resumen

Qwen3.5-9B-Uncensored-HauhauCS-Aggressive es una versión afinada (fine-tune) del modelo Qwen3.5-9B de Alibaba Qwen, publicada por el usuario mdcreativeagent bajo el alias de la familia de fine-tunes HauhauCS. El objetivo declarado es eliminar los rechazos (refusals) del modelo base sin degradar sus capacidades originales, manteniendo intactos los datasets y el comportamiento funcional del autor original. Se distribuye principalmente en formato GGUF con varias cuantizaciones y un codificador visual separado.

El modelo base es un transformer denso de 8.953.803.264 parámetros (aproximadamente 9B), 32 capas y una arquitectura híbrida que combina Gated DeltaNet (atención lineal) con atención softmax completa en proporción 3:1. Soporta 262K tokens de contexto nativo, extensible a 1M mediante YaRN, y es nativamente multimodal (texto, imagen y vídeo). Incorpora soporte de multi-token prediction (MTP) y un vocabulario de 248K tokens.

La relevancia de esta ficha radica en que se trata de un modelo de la generación Qwen3.5 (arquitectura publicada en marzo de 2026) adaptado para casos de uso donde el modelo base aplicaría rechazos, manteniendo la licencia Apache 2.0 y la compatibilidad con runtimes de inferencia locales como llama.cpp, LM Studio, Jan o koboldcpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: Gated DeltaNet (atención lineal) + atención softmax completa en ratio 3:1, 32 capas |
| Parámetros totales | 8.953.803.264 (≈9B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262K tokens nativo; extensible a 1M con YaRN |
| Tipos de cuantización | BF16, Q8_0, Q6_K, Q4_K_M (GGUF); codificador visual en BF16 (mmproj) |
| Idiomas soportados | Inglés (en), chino (zh), multilingüe; vocabulario de 248K tokens y 201 idiomas según el autor |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (BF16, Q8_0, Q6_K, Q4_K_M) + mmproj GGUF para visión; parámetros reales en safetensors según metadatos |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida que intercala capas de Gated DeltaNet (atención lineal con estado recurrente) y capas de atención softmax completa en una proporción 3:1, lo que reduce el coste computacional en contextos largos manteniendo la capacidad de atención global. Consta de 32 capas, un vocabulario de 248K tokens y soporte nativo para entradas multimodales (texto, imagen y vídeo) mediante un codificador visual separado distribuido como archivo mmproj. Incluye además soporte de multi-token prediction (MTP), técnica que permite predecir varios tokens por paso de decodificación para acelerar la generación.

El fine-tune de HauhauCS se presenta como "lossless" en cuanto a capacidades: el autor afirma no haber modificado los datasets ni las capacidades del modelo original, limitándose a eliminar los rechazos. La variante "Aggressive" aplica una eliminación de rechazos más agresiva que otras variantes (menciona una futura variante "Balanced"). No se especifican en la información disponible el número de tokens de entrenamiento del fine-tune, la composición del dataset de ajuste ni si se emplearon técnicas de RLHF o DPO; estos datos no están disponibles.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno con contexto de hasta 262K tokens (1M con YaRN).
- Modo "thinking" (razonamiento extendido) activado por defecto, con parámetros de muestreo recomendados distintos al modo sin razonamiento.
- Capacidades multimodales nativas: procesamiento de imagen y vídeo mediante el codificador visual (mmproj).
- Soporte multilingüe amplio (201 idiomas según el autor; etiquetado oficial en inglés, chino y multilingüe).
- Multi-token prediction (MTP) para acelerar la decodificación.
- Eliminación de rechazos: el autor declara 0/465 rechazos en sus pruebas; el modelo no rechaza peticiones.
- Compatibilidad con endpoints y runtimes de inferencia estándar (llama.cpp, LM Studio, Jan, koboldcpp; vLLM, SGLang y KTransformers para producción).
- No se documenta explícitamente soporte de tool calling o function calling en la información disponible; debe verificarse contra el modelo base.

## Casos de uso

- Investigación sobre alineación y rechazos: el modelo permite estudiar el comportamiento de un LLM sin mecanismos de rechazo, comparándolo con el modelo base para analizar qué información se filtra o se rehúsa en modelos alineados.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que aborde temas sensibles que el modelo base rechazaría, manteniendo la calidad del Qwen3.5-9B original.
- Análisis de contenido multimodal local: con el archivo mmproj se pueden procesar imágenes y vídeos en local (por ejemplo, descripción de escenas o extracción de información visual) sin depender de APIs externas.
- Procesamiento de documentos largos: con 262K tokens de contexto nativo se pueden resumir o analizar contratos, informes o expedientes extensos en una sola pasada, usando cuantizaciones Q4_K_M o Q6_K para reducir requisitos de memoria.
- Despliegue en estación de trabajo con GPU de consumo: las cuantizaciones Q4_K_M (5,3 GB) y Q6_K (6,9 GB) permiten ejecutar el modelo en GPUs de 8-12 GB de VRAM mediante llama.cpp o LM Studio, útil para prototipado y pruebas offline.
- Evaluación de sesgos y seguridad en pipelines propios: al no aplicar rechazos, sirve como banco de pruebas para medir cómo responden los sistemas de moderación externos ante contenido no filtrado.
- Asistente conversacional especializado en dominios donde el modelo base aplicaría disclaimers o rechazos (por ejemplo, consultas técnicas sobre seguridad ofensiva o temas médicos), siempre con supervisión humana y salvaguardas externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente declara una métrica interna de rechazos (0/465) sin detallar el conjunto de evaluación ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización GGUF):
  - BF16: ~17 GB de pesos; requiere al menos 20-24 GB de VRAM para contexto moderado.
  - Q8_0: ~8,9 GB de pesos; requiere ~12-16 GB de VRAM.
  - Q6_K: ~6,9 GB de pesos; requiere ~10-12 GB de VRAM.
  - Q4_K_M: ~5,3 GB de pesos; requiere ~8-10 GB de VRAM.
  - Codificador visual (mmproj BF16): ~880 MB adicionales si se usa multimodalidad.
- GPUs recomendadas: A100 40/80 GB o H100 para BF16 y contextos largos de 128K-262K; RTX 4090 (24 GB) para Q8_0/BF16 con contexto moderado; RTX 3090/4080 (16-24 GB) para Q6_K/Q8_0.
- GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 con cuantizaciones Q4_K_M y Q6_K; también en GPUs de 8 GB con Q4_K_M y contexto reducido.
- Opciones de despliegue: llama.cpp, LM Studio, Jan, koboldcpp para local; vLLM, SGLang y KTransformers recomendados por el autor para producción y alto throughput.
- Latencia y throughput: no disponibles. El autor advierte que se requiere una build reciente de llama.cpp por tratarse de una arquitectura nueva (publicada el 2026-03-02).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.5-9B-Uncensored-HauhauCS-Aggressive | 8,95B (denso) | 262K (1M con YaRN) | Sí (texto, imagen, vídeo) | Apache 2.0 | GGUF + mmproj | Sin rechazos; fine-tune del Qwen3.5-9B |
| Qwen/Qwen3.5-9B (base) | 8,95B (denso) | 262K (1M con YaRN) | Sí | Apache 2.0 | safetensors / GGUF | Modelo original con rechazos y alineación estándar |
| Qwen3.5-4B-Uncensored-HauhauCS-Aggressive | ~4B (denso) | No disponible | No disponible | Apache 2.0 | GGUF | Variante menor de la misma familia de fine-tunes |
| Otros fine-tunes "uncensored" de la misma categoría | Variable | Variable | Variable | Variable | GGUF | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- Eliminación total de rechazos: el modelo generará contenido que el modelo base rechazaría, incluido material potencialmente dañino, ilegal o éticamente problemático. Requiere salvaguardas externas en cualquier despliegue público.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual del fine-tune; al no modificarse los datasets, se heredan los sesgos y errores del modelo base, pero sin los filtros de rechazo que podrían limitar ciertas respuestas.
- Disclaimers residuales: el autor advierte que el modelo puede añadir ocasionalmente avisos breves al final de las respuestas (por ejemplo, "esto es información general, no asesoramiento legal"), heredados del entrenamiento del modelo base; no son rechazos y el contenido se genera igualmente.
- Idiomas: aunque se declaran 201 idiomas, la etiqueta oficial solo garantiza inglés, chino y multilingüe; el rendimiento en castellano no está verificado.
- Contexto: el autor recomienda mantener al menos 128K tokens de contexto para preservar las capacidades de razonamiento (thinking mode); contextos menores pueden degradar el modo de pensamiento.
- Compatibilidad: arquitectura muy reciente (marzo de 2026); requiere builds actualizadas de llama.cpp y puede no estar soportada aún en todas las herramientas de inferencia.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado sin filtros puede incumplir normativas locales (por ejemplo, en materia de seguridad, salud o protección de menores); la responsabilidad recae en el desplegador.
- Datos de entrenamiento del fine-tune no disponibles: no se puede auditar qué datos o métodos se usaron para eliminar los rechazos, lo que dificulta evaluar sesgos introducidos.
- Repositorio sin descargas ni likes en el momento de la ficha: no hay evidencia de comunidad ni validación externa del modelo.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/mdcreativeagent/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante 4B de la familia: https://huggingface.co/HauhauCS/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive
- Repositorio de la familia HauhauCS: https://huggingface.co/HauhauCS
- Discord del autor: https://discord.gg/SZ5vacTXYf
