# NoobieToPro/NYXIS-30B-A3B-GGUF

## Resumen

NYXIS-30B-A3B es una distribución cuantizada en GGUF del modelo Qwen3-VL-30B-A3B-Instruct, publicada por el usuario NoobieToPro bajo el identificador `NoobieToPro/NYXIS-30B-A3B-GGUF`. Se trata de un modelo de lenguaje y visión de tipo Mixture-of-Experts (MoE) disperso, con 30.532.122.624 parámetros totales y aproximadamente 3.300 millones de parámetros activos por token, distribuidos en 128 expertos por capa con activación top-8. El modelo base es la variante instructiva multimodal de la familia Qwen3-VL, y esta publicación añade una capa de adaptación orientada a un harness de escritorio propio denominado NYXIS, con soporte para operaciones de ficheros, generación de diffs unificados y verificación visual de entidades.

La relevancia de esta ficha radica en su enfoque de despliegue: el autor documenta una configuración asimétrica GPU/CPU que permite ejecutar un modelo de 30B con visión sobre una GPU de portátil de 6 GB (RTX 4050), manteniendo un uso de VRAM dedicada de aproximadamente 2,66-2,73 GB mediante el reparto de 45 de las 48 capas MoE a CPU y solo 3 a GPU. Es un caso práctico de ingeniería de inferencia local más que una contribución de pesos originales, ya que los pesos derivan del checkpoint oficial de Qwen.

La licencia es CC BY-NC-SA 4.0, lo que restringe el uso comercial. El modelo está etiquetado únicamente para inglés y se distribuye en formato GGUF para llama.cpp y Ollama, con un tamaño de repositorio de 23,2 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso con torre de visión (ViT) y proyector multimodal; linaje Qwen3-VL-30B-A3B-Instruct |
| Parámetros totales | 30.532.122.624 |
| Parámetros activos | ~3.300 millones por token (128 expertos por capa, top-8 activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K (torre de texto, 11,3 GB); proyector de visión Q8_0 (712 MB); caché KV q4_0 para K y V |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-nc-sa-4.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama); el modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo es un Mixture-of-Experts multimodal que combina una torre de texto transformer con 48 capas MoE (128 expertos por capa, top-8 activos) y una torre de visión con proyector multimodal. Los pesos derivan del checkpoint Qwen3-VL-30B-A3B-Instruct, por lo que la arquitectura y el entrenamiento base corresponden a Qwen; esta publicación no aporta información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original.

La contribución específica del autor es una destilación SFT/QLoRA sobre 51 trayectorias agénticas de referencia ("gold-standard"), orientadas a operaciones de ficheros mediante etiquetas `<nx_tool>`, generación de diffs unificados `+X / -Y`, síntesis de aplicaciones HTML/CSS/JS en una sola pasada y verificación visual de entidades. Además, se incorpora un mecanismo de respaldo con JSON forzado por gramática: si una petición de operación de fichero no produce una etiqueta `<nx_tool>` ejecutable, se reintenta con una pasada restringida a la gramática `{"op","path","content","find","replace"}`. Para la verificación visual, los turnos de identificación incluyen una hoja de firmas de personajes y el modelo debe confirmar la coincidencia de píxeles o cerrar con una declaración explícita de no confirmación. No se documenta decodificación especulativa por defecto; el autor menciona `ngram-mod 12/3` como opción experimental con una aceleración de 2,35x en edición de código, pero no reproducida en la batería b96, por lo que el valor por defecto permanece en `none`.

## Capacidades

- Generación de texto conversacional y razonamiento de múltiples pasos.
- Comprensión de imágenes y visión-lenguaje: identificación de entidades visuales con verificación contra hoja de firmas.
- Generación y edición de código, incluyendo síntesis de aplicaciones HTML/CSS/JS de un solo fichero.
- Operaciones de ficheros en espacio de trabajo mediante etiquetas `<nx_tool>` y diffs unificados `+X / -Y`.
- Soporte de tool calling con respaldo forzado por gramática JSON para evitar llamadas roleplayed.
- Capacidades agénticas orientadas a un harness de escritorio (NYXIS), con prompts de sistema específicos.
- Multilingüismo limitado: solo inglés declarado.

## Casos de uso

- Asistencia de programación en local con GPU de gama baja: el modelo puede generar y editar código a ~20 tok/s de decodificación en una RTX 4050 de 6 GB, gracias al reparto asimétrico de capas MoE entre CPU y GPU, adecuado para desarrolladores sin acceso a GPUs de datacenter.
- Edición de ficheros en un espacio de trabajo: mediante las etiquetas `<nx_tool>` y los diffs unificados, se puede integrar en un editor o IDE para aplicar cambios concretos sobre ficheros de proyecto, con una precisión declarada del 100% en la suite de 50 pruebas automatizadas del autor.
- Síntesis de aplicaciones web de un solo fichero: el modelo puede producir HTML/CSS/JS completo en una pasada, útil para prototipado rápido o generación de demos sin infraestructura de build.
- Verificación visual de entidades: con una hoja de firmas de personajes, puede identificar personajes en imágenes de referencia (100% declarado en una foto de prueba de 4000 px), aplicable a catalogación de imágenes o control de calidad visual.
- Agente de escritorio con herramientas: el respaldo JSON forzado por gramática permite construir pipelines donde las operaciones de fichero son deterministas y no dependen de que el modelo "roleplay" la llamada, reduciendo fallos en producción.
- Procesamiento multimodal en local con presupuesto de VRAM ajustado: al mantener el proyector de visión en GPU (Q8_0, 712 MB) y la caché KV en q4_0, se puede ejecutar visión-lenguaje en equipos con 6 GB de VRAM dedicada y 16 GB de RAM, manteniendo aplicaciones como juegos abiertas en paralelo.

## Benchmarks y rendimiento

Los datos disponibles son mediciones del autor en hardware concreto (RTX 4050 6 GB, i5-13420H, 16 GB RAM), no benchmarks académicos estándar. No se han publicado resultados de MMLU, HumanEval, GSM8K ni similares en la información disponible.

| Métrica | Valor medido |
|---|---|
| VRAM dedicada en reposo / activa | 2.663 MB / 2.735 MB |
| Conjunto de trabajo CPU del motor (límite 6 GB) | 5.722 MB estable |
| TTFT en chat caliente / saludo | 424 ms / 1,3-2,9 s |
| Decodificación en generación de código | 19,5-20,6 tok/s |
| Decodificación en edición de código (`ngram-mod 12/3`, opcional) | 48,4 tok/s (2,35x), no reproducido en b96 |
| Identificación visual de entidades (foto 4000 px) | 100% |
| Precisión en operaciones de fichero y diffs | 100% (50/50) |
| Primera pasada de visión en frío | ~20-35 s (limitado por prefill en CPU) |

## Requisitos de hardware

- VRAM estimada para inferencia: ~2,7 GB de VRAM dedicada en la configuración documentada (Q2_K con 45 capas MoE en CPU y 3 en GPU, caché KV q4_0, proyector Q8_0 en GPU).
- GPU recomendadas: RTX 4050 Laptop 6 GB (configuración medida); no se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en una RTX 4050 de 6 GB con 16 GB de RAM de sistema; el modelo completo en Q2_K ocupa 11,3 GB, por lo que requiere el reparto a CPU.
- Opciones de despliegue: llama.cpp (`llama-server`) y Ollama; el autor menciona endpoints compatibles.
- Latencia y throughput estimados: TTFT de 424 ms en chat caliente, ~20 tok/s de decodificación de texto, 14,4-20,0 tok/s en decodificación con visión, y primera pasada visual de 20-35 s por prefill en CPU.

## Comparativa con modelos similares

La información proporcionada incluye una comparación empírica del autor entre tres contendientes en el mismo equipo, pero la tabla está truncada en el texto disponible. Los datos completos de los contendientes B y C no están disponibles.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NYXIS-30B-A3B (este) | 30,5B totales / ~3,3B activos | no disponible | CC BY-NC-SA 4.0 | GGUF | Visión + texto, harness NYXIS |
| Qwen3-VL-30B-A3B-Instruct (base) | 30,5B totales / ~3,3B activos | no disponible | no disponible en la información | safetensors | Modelo base oficial de Qwen |
| nyxis-30b-abliterated (contendiente B) | no disponible | no disponible | no disponible | GGUF Q2_K (10,7 GB) | Solo texto, vía Ollama |
| nyxis-student 4B (contendiente C) | ~4B | no disponible | no disponible | GGUF Q4 | Densidad, vía Ollama |

## Limitaciones y advertencias

- Licencia CC BY-NC-SA 4.0: prohíbe el uso comercial y exige compartir bajo la misma licencia las obras derivadas.
- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está documentado.
- Los pesos derivan de Qwen3-VL-30B-A3B-Instruct; los sesgos del modelo base no se detallan en la información disponible.
- Riesgo de alucinación no cuantificado; el autor mitiga las llamadas de herramienta con un respaldo JSON forzado por gramática, pero no documenta tasas de alucinación en texto libre.
- La precisión del 100% en identificación visual y operaciones de fichero corresponde a pruebas del propio autor (50 casos), no a evaluaciones independientes.
- El rendimiento medido depende de una configuración muy específica (RTX 4050, i5-13420H, 16 GB RAM, límite de working set de 6 GB); no es extrapolable a otros equipos.
- La decodificación especulativa `ngram-mod` no se reprodujo en la batería b96 y permanece desactivada por defecto.
- La primera pasada de visión en frío puede tardar 20-35 s por el prefill en capas MoE en CPU, lo que limita su uso interactivo en visión.
- No se dispone de información sobre longitud de contexto, por lo que no se puede garantizar el comportamiento en conversaciones largas.

## Enlaces

- Hugging Face: https://huggingface.co/NoobieToPro/NYXIS-30B-A3B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Instruct
