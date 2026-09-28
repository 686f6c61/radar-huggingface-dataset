# dopaemon/Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e-MTP

## Resumen

Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e-MTP es una build cuantizada a 4 bits en formato MLX de un modelo de código agéntico de tipo Mixture of Experts (MoE) con 35.951.822.704 parámetros totales. Parte de huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated (a su vez derivado de Ornith-1.5-35B-A3B) y ha sido requantizado con el cuantizador oQ4e de oMLX contra un corpus de calibración ponderado hacia ciberseguridad, incorporando la plantilla de chat Sharp y una cabeza de predicción multi-token (MTP) injertada para decodificación especulativa. El repositorio lo publica el usuario dopaemon con licencia MIT, ocupa 22,8 GB y se distribuye en safetensors para la librería mlx.

El modelo se posiciona en el nicho de "coder agéntico" sobre Apple Silicon: según el autor, resuelve tareas de coding agéntico entre 3 y 4 veces más rápido que modelos densos de 3,8-27B y aproximadamente un 70% más de problemas reales de programación que Ornith-1.5 y Qwen3.6-35B-A3B, todo ello con la capacidad de rechazo eliminada (abliterated). El pipeline declarado es image-text-to-text y las etiquetas incluyen visión, por lo que se trata de un modelo multimodal texto-imagen además de generador de código.

Su relevancia actual es doble: por un lado demuestra que un MoE de ~36B con ~3B activos y cuantización de 4 bits puede sostener cargas de trabajo agénticas reales en hardware de consumo de memoria unificada; por otro, ocupa el espacio de los modelos sin censura, lo que lo hace útil para investigación en seguridad ofensiva y evaluación de alineamiento, pero problemático para despliegues comerciales sensibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) denso en atención, linaje Qwen3.5 MoE (`qwen3_5_moe` / `qwen35moe`), con cabeza MTP injertada para decodificación especulativa |
| Parametros totales | 35.951.822.704 (~35,95 B) |
| Parametros activos | ~3 B (inferido de la nomenclatura A3B del modelo; no confirmado explícitamente en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (oQ4e de oMLX, con importance matrix sobre corpus cyber); el linaje incluye también un tier oQ6e y builds GGUF `UD-Q4_K_M` |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX, 4 bits), ~22,8 GB de repositorio |
| Modalidad | image-text-to-text (visión + texto) |
| Libreria de inferencia | mlx (runtime oMLX para soporte completo de MTP) |
| Modelo base | huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated (relación: quantized) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de tipo Mixture of Experts con enrutamiento disperso, heredado de la familia Qwen3.5 MoE (etiquetas `qwen3_5_moe`, `qwen35moe`). El nombre A3B indica que, de los ~35,95B parámetros totales, solo una fracción reducida (del orden de 3B) se activa por token, lo que explica que la build de 4 bits quepa en ~23 GB y mantenga velocidades de decodificación propias de un modelo mucho menor. Sobre esta base, el autor ha injertado una cabeza de predicción multi-token (MTP) como shard adicional más una bandera en la configuración que la activa: con MTP desactivado, la build es byte a byte idéntica a la oQ4e estándar, sin cambios en los pesos.

El proceso de construcción no incluye entrenamiento desde cero ni fine-tuning documentado: se trata de una requantización. Los pesos abliterated de huihui-ai se pasaron por el cuantizador oQ4e de oMLX aplicando una importance matrix (imatrix) calculada sobre un corpus de calibración ponderado hacia ciberseguridad, con esquema de cuantización dinámica tipo unsloth-dynamic. También se sustituye la plantilla de chat por Sharp, orientada a un comportamiento más directo y con menos "pensamiento" superfluo, lo que según el autor contribuye a la ventaja de velocidad. No hay información pública sobre composición del dataset original ni sobre etapas de RLHF/DPO en la información proporcionada. La abliteración (eliminación de la dirección de rechazo en el espacio de activaciones) es la innovación heredada más relevante, y la cabeza MTP es la aportación técnica propia de esta build.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Generación y edición de código en contexto agéntico: resolución autónoma de issues y bugs en repositorios grandes.
- Tool calling y function calling, orientado a pipelines de agentes con múltiples pasos.
- Razonamiento multi-step con plantilla Sharp, que reduce la verbosidad previa a la respuesta.
- Capacidades de visión: entrada de imagen junto con texto (pipeline image-text-to-text).
- Seguridad ofensiva: resuelve tareas de CTF sin guía (Cybench), sin rechazos en escenarios de doble uso.
- Decodificación especulativa mediante cabeza MTP en runtimes compatibles (oMLX, llama.cpp con GGUF).
- Modo sin censura: cero rechazos declarados en HarmBench (84/84 peticiones respondidas).

## Casos de uso

- Reparación automática de bugs en producción: el modelo está evaluado en SWE-bench-Live, que mide la capacidad de resolver issues reales en repositorios grandes con tests de regresión ocultos, exactamente el flujo de un agente de mantenimiento de código.
- Agente de refactorización en CI/CD: integrado vía tool calling, puede leer el árbol de ficheros, ejecutar tests, interpretar fallos y proponer parches dentro de un pipeline automatizado.
- Auditoría de seguridad ofensiva autorizada: con 15/43 flags en Cybench sin pistas, sirve para pentesting y ejercicios de red team en entornos sandbox controlados.
- Evaluación de alineamiento y robustez: como modelo abliterated, es un caso de estudio para medir qué comportamientos emergen al eliminar la dirección de rechazo, comparándolo con su variante censurada TielCoder.
- Asistente de programación local en portátil Apple Silicon: con ~23 GB de pesos en 4 bits, un MacBook Pro con 32-64 GB de memoria unificada puede ejecutarlo sin GPU dedicada.
- Descripción y razonamiento sobre capturas de pantalla o diagramas: al aceptar entrada de imagen, puede interpretar mockups, diagramas de arquitectura o capturas de error y traducirlos a código o a pasos de depuración.
- Generación de documentación técnica y pruebas unitarias a partir de código existente, aprovechando la ventana de contexto para procesar módulos completos.
- Análisis de tráfico, logs o artefactos en flujos de threat hunting, ámbito para el que el corpus de calibración fue ponderado.

## Benchmarks y rendimiento

Los datos publicados por el autor proceden del build GGUF en su tier `UD-Q4_K_M` (k-quants de llama.cpp), no de esta build MLX con cuantizador oQ4e. El propio autor advierte que cambiar de cuantizador altera los resultados, por lo que deben leerse como evidencia sobre el modelo subyacente y no como medición de este fichero.

| Benchmark | Resultado declarado | Notas |
|---|---|---|
| SWE-bench-Live | ~70% más de problemas reales resueltos que Ornith-1.5 y Qwen3.6-35B-A3B (sin cifra absoluta publicada) | Medido en el build GGUF `UD-Q4_K_M`; el autor indica que la mejora de dominio es ~7x mayor que el salto generacional de Qwen3.5 a Qwen3.6 |
| Cybench (unguided, agente CTF) | 15/43 flags capturadas (35%) | Sin pistas ni juez; medido en el build GGUF |
| HarmBench | 0 rechazos sobre 84 peticiones (0%) | Medido en el build GGUF |
| Velocidad agéntica | Resolución de tareas de código 3-4x más rápida que modelos densos de 3,8-27B | Comparación declarada por el autor, sin metodología detallada |

No se han publicado en la información disponible cifras absolutas de MMLU, HumanEval, GSM8K ni de otros benchmarks académicos estándar.

## Requisitos de hardware

- VRAM/memoria unificada para esta build: ~22,8 GB de pesos en 4 bits; se recomienda un mínimo de 32 GB de memoria unificada para dejar margen a la caché KV y a la cabeza MTP.
- Equivalente GGUF: ~20,7 GB en `UD-Q4_K_M`, según el catálogo de terceros.
- Compatibilidad de plataforma: esta build es MLX, por lo que solo se ejecuta en Apple Silicon (familia M). No hay soporte CUDA ni ROCm para el formato MLX.
- GPU recomendadas: Apple M-series con 32 GB o más (M2 Pro/Max, M3 Pro/Max, M4 Pro/Max, M-Ultra). Para GPUs NVIDIA (RTX 4090, A100, H100) hay que usar el build GGUF con llama.cpp, no este repositorio.
- ¿Cabe en GPU de consumo? En el ecosistema Apple sí, en equipos con 32 GB o más de memoria unificada. Un Mac de 16 GB queda por debajo del requisito. En NVIDIA, la versión GGUF de 20,7 GB encaja ajustadamente en una RTX 4090 de 24 GB a 4 bits.
- Opciones de despliegue: oMLX (soporte completo, incluida la cabeza MTP; es el runtime recomendado), llama.cpp con el build GGUF (gestiona correctamente la cabeza MTP), LM Studio solo con el build GGUF o con la build MLX no-MTP (las builds MLX `-MTP` producen salida corrupta en el motor MLX de LM Studio). No se documenta soporte de vLLM, TGI ni Ollama para este repositorio.
- Latencia y throughput: no se publican cifras absolutas de tokens por segundo. La afirmación cualitativa del autor es una ventaja de 3-4x frente a densos de 3,8-27B en tareas de código agéntico, atribuida sobre todo a la convergencia más rápida en la solución correcta y a la reducción de tokens de "pensamiento".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e-MTP | ~35,95 B totales, ~3 B activos | no disponible | MoE abliterated, código agéntico, visión, MTP | MIT | MLX 4 bits (este repo), GGUF, MLX 6 bits |
| TielCoder (Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e) | ~35,95 B totales, ~3 B activos | no disponible | Mismo linaje, versión censurada (con rechazos) | MIT | MLX y GGUF |
| Ornith-1.5-35B-A3B | ~35 B totales, ~3 B activos | no disponible | MoE base sin ajuste cyber | no disponible | HF (ornith-ai) |
| Qwen3.6-35B-A3B | ~35 B totales, ~3 B activos | no disponible | MoE generalista de referencia | no disponible | HF (Qwen) |

## Limitaciones y advertencias

- Modelo abliterated: la dirección de rechazo ha sido eliminada. Puede generar contenido dañino, ilegal o peligroso, y no hay salvaguardas de alineamiento efectivas. El propio autor traslada la responsabilidad legal y ética íntegramente al usuario.
- Riesgo de alucinación: no se han publicado métricas de fidelidad factual ni de tasa de alucinación; en tareas de código, los parches propuestos deben validarse siempre con tests.
- Corrupción en LM Studio: cualquier build MLX `-MTP` de esta familia emite tokens basura desde el primer token en el motor MLX de LM Studio. No es un problema de plantilla ni de configuración y ningún ajuste lo corrige. Requiere oMLX o el build GGUF.
- Discrepancia de medición: los benchmarks publicados corresponden al build GGUF `UD-Q4_K_M`, con k-quants de llama.cpp, no a esta build MLX con cuantizador oQ4e. El autor lo advierte explícitamente.
- Idiomas: solo inglés y chino declarados. El rendimiento en castellano no está documentado y probablemente sea inferior.
- Contexto: no se especifica la longitud de contexto soportada, lo que impide planificar cargas con documentos largos.
- Licencia MIT: permite uso comercial y modificación, pero no exime de responsabilidad por el contenido generado ni de las obligaciones legales aplicables (por ejemplo, en ciberseguridad ofensiva o en jurisdicciones con restricciones sobre contenido).
- Uso en producción sensible: dado el comportamiento sin rechazos, no es adecuado para atención al cliente, educación, sanidad ni ningún canal de cara al público sin moderación externa obligatoria.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria de la build ni historial de incidencias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dopaemon/Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e-MTP
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Ornith-1.5-35B-A3B (modelo raíz): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Build GGUF de referencia: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF
- Build MLX oQ6e con MTP: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP
- Build MLX oQ4e sin MTP: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e
- Variante censurada TielCoder: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ4e
- Plantillas de chat Sharp: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Ficha de terceros del build GGUF-MTP: https://www.aimodels.fyi/models/huggingFace/cyber-tiel-coder-35b-a3b-gguf-mtp-peculiar-ragdoll
- Ficha de terceros con estimación de VRAM: https://llm-explorer.com/model/peculiar-ragdoll%2FCyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP,1WsHt7152Um2hWQXFXtqxc
- Catálogo de terceros del GGUF: https://local-ai-zone.github.io/models/cyber-tiel-coder-35b-a3b-gguf-mtp.html
