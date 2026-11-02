# heideng90/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive

## Resumen

Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive es una derivación "abliterada" (sin mecanismos de rechazo) del modelo multimodal Qwen/Qwen3.6-35B-A3B, publicada por el usuario heideng90 bajo el alias HauhauCS. El modelo base es un transformer híbrido de tipo Mixture of Experts (MoE) desarrollado por el equipo Qwen de Alibaba, con 34.660.610.688 parámetros totales (~35B) y aproximadamente 3B parámetros activos por token. Esta variante elimina las negativas de seguridad del modelo original y se distribuye exclusivamente en formato GGUF cuantizado, con el objetivo declarado de ofrecer "0/465 refusals" manteniendo intactas las capacidades del modelo base.

La relevancia de esta ficha radica en dos factores. Primero, el modelo base Qwen3.6-35B-A3B incorpora una arquitectura híbrida poco común que combina atención lineal con atención softmax completa en proporción 3:1, 256 expertos con 8 enrutados por token, 40 capas y una ventana de contexto nativa de 262K tokens, además de ser nativamente multimodal (texto, imagen y vídeo). Segundo, la variante uncensored plantea consideraciones importantes para producción: elimina las salvaguardas del modelo original, lo que la hace inadecuada para aplicaciones orientadas al público sin moderación externa, aunque útil para investigación sobre alineación, red teaming y generación de contenido creativo sin restricciones.

El repositorio ocupa 247,4 GB e incluye múltiples cuantizaciones GGUF (desde IQ2_M de 11 GB hasta Q8_K_P de 44 GB) generadas con importance matrix (imatrix) para preservar la calidad tras la abliteración, junto con un proyector multimodal `mmproj` en f16 de 899 MB necesario para el procesamiento de imágenes y vídeo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con atención lineal + softmax completa (ratio 3:1) |
| Parametros totales | 34.660.610.688 (~35B) |
| Parametros activos | ~3B por token (256 expertos, 8 enrutados por token) |
| Longitud de contexto | 262K tokens nativo |
| Tipos de cuantizacion | IQ2_M, Q2_K_P, IQ3_M, Q3_K_P, Q3_K_M, IQ4_XS, IQ4_NL, Q4_K_M, Q4_K_P, Q5_K_M, Q5_K_P, Q6_K, Q6_K_P, Q8_0, Q8_K_P; mmproj f16 |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); sin safetensors en el repo de esta variante |
| Capas | 40 |
| Modalidades | Texto, imagen, vídeo (image-text-to-text) |
| Modelo base | Qwen/Qwen3.6-35B-A3B |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.6-35B-A3B: un transformer de 40 capas que combina bloques de atención lineal con bloques de atención softmax completa en una proporción 3:1, lo que reduce el coste computacional en contextos largos manteniendo la capacidad de atención global. La capa MoE emplea 256 expertos con 8 enrutados por token, lo que resulta en ~3B parámetros activos sobre un total de ~35B. Esta configuración permite un throughput alto con un coste de memoria moderado para su tamaño. El modelo es nativamente multimodal, procesando texto, imagen y vídeo mediante el proyector `mmproj` incluido en el repositorio.

No se dispone de información detallada sobre la composición del dataset de entrenamiento, el número de tokens utilizados ni las etapas de RLHF/DPO aplicadas al modelo base en la información proporcionada. La variante uncensored se genera mediante técnicas de abliteración (abliteration) sobre los pesos del modelo original, sin cambios en datasets ni capacidades según el autor. Las cuantizaciones GGUF se han generado con importance matrix (imatrix) para preservar la calidad en los pesos abliterados, y las cuantizaciones K_P ("Perfect") aplican perfiles de cuantización optimizados por modelo que, según el autor, elevan la calidad efectiva 1-2 niveles con solo un 5-15% más de tamaño. No se documentan innovaciones adicionales como decodificación especulativa en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 262K tokens.
- Razonamiento con modo "thinking" (por defecto) y modo no-thinking, con parámetros de muestreo recomendados distintos para cada uno.
- Comprensión de imágenes y vídeo (image-text-to-text) mediante el proyector `mmproj` en f16.
- Capacidades multilingües, con soporte declarado de inglés, chino y otros idiomas.
- Generación de código y tareas de precisión (el autor recomienda temperatura 0.6 para coding).
- Sin mecanismos de rechazo: el autor declara "0/465 refusals" en su evaluación interna.
- Compatible con endpoints (tag `endpoints_compatible`) y con el flag `--jinja` de llama.cpp para el chat template.
- No se documenta explícitamente soporte de tool calling o function calling en la información disponible, aunque el modelo base Qwen3.6 probablemente lo herede; no confirmado.

## Casos de uso

- Investigación sobre alineación y red teaming: el modelo permite estudiar el comportamiento de un LLM sin salvaguardas para analizar sesgos, riesgos y eficacia de mecanismos de moderación externos, comparándolo con el modelo base alineado.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que aborde temas sensibles sin las negativas del modelo original, manteniendo las capacidades del Qwen3.6-35B-A3B.
- Análisis de documentos largos con contexto de 262K tokens: procesamiento de contratos, informes técnicos o expedientes completos en una sola pasada, aprovechando la atención híbrida para mantener eficiencia.
- Procesamiento multimodal en local: descripción y análisis de imágenes y vídeo con el proyector `mmproj`, útil para catalogación de archivos multimedia o accesibilidad, ejecutable en hardware de consumo con cuantizaciones Q4.
- Asistente de código en pipelines de CI/CD: con temperatura 0.6 y modo thinking, para revisión de código, generación de tests y explicación de errores, siempre con moderación externa por la ausencia de salvaguardas.
- Chatbot de dominio cerrado con moderación propia: despliegue en llama.cpp u Ollama con un filtro de contenido externo (clasificador o lista de bloqueo) para entornos donde se requiere control total del comportamiento sin rechazos del modelo.
- Experimentación con cuantizaciones K_P: evaluación de la degradación de calidad de las cuantizaciones personalizadas frente a las estándar en tareas de razonamiento y visión, gracias a la disponibilidad de múltiples variantes en el repo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo declara "0/465 refusals" en su evaluación interna de rechazos, sin detallar la metodología ni los conjuntos de prompts utilizados. No se dispone de datos de MMLU, HumanEval, GSM8K ni de comparativas numéricas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): IQ2_M ~11 GB; Q3_K_P/IQ3_M ~15 GB; IQ4_XS ~19 GB; Q4_K_M ~21 GB; Q4_K_P ~23 GB; Q5_K_P ~28 GB; Q6_K_P ~31 GB; Q8_K_P ~44 GB. Añadir ~899 MB para el proyector `mmproj` si se usa visión.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M/IQ4_XS con contexto moderado; RTX 3090 (24 GB) similar; A100 40/80 GB o H100 para Q8 y contextos largos; configuraciones multi-GPU para 262K tokens completos.
- Cabe en GPU de consumo: sí, con cuantizaciones IQ2_M a Q4_K_M en GPUs de 16-24 GB (RTX 4060 Ti 16 GB, RTX 4080, RTX 4090). Para contexto de 262K completo se requiere offload a RAM o GPUs de mayor memoria.
- Opciones de despliegue: llama.cpp (recomendado, con flag `--jinja`), LM Studio, Ollama y cualquier runtime compatible con GGUF. No se menciona soporte de vLLM o TGI para esta variante GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. El ratio de ~3B parámetros activos por token sugiere un throughput notablemente superior al de un modelo denso de 35B, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive | ~35B (MoE) | ~3B | 262K | Texto, imagen, vídeo | apache-2.0 | GGUF |
| Qwen/Qwen3.6-35B-A3B (base) | ~35B (MoE) | ~3B | 262K | Texto, imagen, vídeo | apache-2.0 | safetensors, GGUF |
| Otras variantes uncensored de Qwen3.6 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa principal es con el modelo base Qwen3.6-35B-A3B: misma arquitectura, mismos parámetros y contexto, pero con salvaguardas de seguridad intactas y pesos en safetensors además de GGUF. La variante uncensored se diferencia únicamente por la abliteración y las cuantizaciones personalizadas. No se dispone de información sobre otras alternativas comparables de la misma categoría (MoE multimodal uncensored) en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de salvaguardas: la variante "Aggressive" está "fully unlocked" y no rechaza prompts; es inadecuada para aplicaciones orientadas al público sin moderación externa obligatoria.
- Riesgo de contenido dañino: puede generar contenido violento, sexual, ilegal o desinformación sin filtro, con implicaciones legales y reputacionales en producción.
- Sesgos heredados: al no modificarse los datos de entrenamiento, conserva los sesgos del modelo base Qwen3.6, que no se detallan en la información disponible.
- Alucinación: no se documentan evaluaciones de factualidad; el riesgo es el propio de un LLM de ~35B sin verificación externa.
- Contexto: aunque el contexto nativo es de 262K, el autor advierte mantener al menos 128K para preservar las capacidades de thinking; contextos menores pueden degradar el razonamiento.
- Idiomas: soporte declarado de inglés, chino y multilingual, pero sin evaluación específica de calidad en castellano; el rendimiento en español no está verificado.
- Licencia: apache-2.0 permite uso comercial, pero el despliegue de un modelo sin salvaguardas puede incumplir normativas de servicios digitales o de protección de menores según la jurisdicción.
- Formato: solo GGUF; no hay safetensors en el repo de esta variante, lo que limita el ajuste fino directo y el despliegue en vLLM/TGI sin conversión.
- Cuantizaciones K_P: pueden mostrarse como "?" en LM Studio (problema de visualización, no de funcionamiento); requieren runtimes GGUF actualizados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni reportes de calidad independientes.

## Enlaces

- HuggingFace (esta variante): https://huggingface.co/heideng90/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- HuggingFace (repo del autor HauhauCS): https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Discord del autor: https://discord.gg/SZ5vacTXYf
