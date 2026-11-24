# KikoCis/Qwen3.8-27B-GGUF

## Resumen
Qwen3.8-27B-GGUF es una publicación de cuantizaciones GGUF del modelo base Qwen/Qwen3.8-27B, mantenida por el usuario KikoCis. No se trata de un modelo nuevo, sino de una build de pesos comprimidos con llama.cpp/Ollama para su uso en hardware de consumo. El repositorio destaca no tanto por los ficheros como por incluir una medición empírica del umbral de cuantización en el que el modelo deja de ser fiable para tareas agénticas (tool calling multi-paso).

El modelo base tiene 26.895.998.464 parámetros (aproximadamente 27B) y una arquitectura híbrida declarada de 65 bloques, de los cuales 48 son SSM/linear-attention, 16 son atención completa (cada cuarto bloque) y 1 es una cabeza MTP. Esa proporción reduce drásticamente el coste de caché KV: solo los 16 bloques de atención completa mantienen estado que crece con la longitud de secuencia, estimado en 64 KB por token frente a los ~256 KB/token de un modelo denso equivalente.

La relevancia actual del repositorio es doble: ofrece builds desde 1,94 hasta 4 bits por peso (de 6,46 GB a 16,81 GB) y documenta con rigor metodológico dónde está el punto de rotura para agentes, situado entre 2,66 y 2,23 bits por peso. La licencia del modelo base es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 65 bloques, 48 SSM/linear-attention, 16 de atención completa (cada 4º), 1 cabeza MTP |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | 262.144 tokens (ventana nativa declarada, no verificada con needle-in-a-haystack) |
| Tipos de cuantizacion | Q4_K_M, IQ4_XS, Q3_K_M, IQ2_M, IQ2_XS, IQ1_M-compact (y IQ1_M uniforme referenciada) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento
El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina capas de espacio de estados (SSM) o atención lineal con capas de atención completa intercaladas cada cuatro bloques. De los 65 bloques totales, 48 son SSM/linear-attention, 16 son de atención completa y uno es una cabeza MTP (multi-token prediction). Esta configuración reduce el estado KV a mantener durante la inferencia: solo los 16 bloques de atención completa generan caché que crece con la secuencia, con un coste calculado de 16 × 4 cabezas KV × (256 + 256) × 2 bytes = 64 KB por token, frente a los ~256 KB/token de un transformer denso de tamaño comparable.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base dentro de la información proporcionada. La model card del repositorio cuantizado no detalla el proceso de entrenamiento; se limita a describir la arquitectura y a documentar el comportamiento de las distintas cuantizaciones. La innovación técnica reseñable del lado del repositorio es la metodología de evaluación agéntica por nivel de cuantización, con tests pareados y control de ruido estadístico.

## Capacidades
- Generación de texto conversacional (pipeline declarado: text-generation, tag conversational).
- Razonamiento multi-paso y ejecución de tareas agénticas con tool calling, siempre que se use una cuantización igual o superior a IQ2_M (2,93 bits/peso).
- Tool calling objetivo: en el benchmark del autor, IQ2_M resuelve 79/80 tareas (98,8 %) y Q3_K_M resuelve 40/40 (100 %).
- Contexto largo: ventana nativa declarada de 262.144 tokens, con coste de KV reducido por la arquitectura híbrida.
- Capacidades multimodales del modelo base no disponibles en este repositorio: no se incluye fichero `mmproj`, por lo que las entradas de visión no funcionan.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.
- Compatibilidad con endpoints (tag `endpoints_compatible`).

## Casos de uso
- Agentes de tool calling en producción con presupuesto de VRAM ajustado: usar IQ2_M (10,00 GB) ofrece un 98,8 % de éxito en tareas agénticas con un 28 % menos de tamaño que la build de 3,40 bits/peso que puntúa 100 %, lo que permite desplegar agentes en GPUs de 12-16 GB.
- Automatización de tareas de desarrollo con ejecución verificable: el benchmark del autor comprueba el artefacto producido en lugar de usar un juez LLM, un patrón replicable para pipelines internos de CI que necesiten validar que el modelo emite llamadas a herramientas correctas.
- Procesamiento de documentos largos en local: la ventana declarada de 262.144 tokens y el coste de KV de 64 KB/token permiten mantener conversaciones o análisis de documentos extensos en hardware de consumo, aunque el prefill sea lento.
- Asistentes conversacionales multi-turno en estación de trabajo: con IQ2_M o Q3_K_M y `llama-cli` o `llama-server`, se puede montar un asistente local sin dependencia de API, aceptando que el reprocesamiento de contexto en cada turno penaliza la latencia.
- Inferencia en navegador con WebGPU: la build IQ1_M-compact (6,46 GB) se carga mediante Elffuss Engine en una sola pestaña sin instalación ni sharding, adecuada para demos de texto donde no se requiera tool calling.
- Experimentación académica sobre cuantización: el repositorio sirve como caso de estudio metodológico para medir el impacto de la compresión en capacidades agénticas, con datos de tests pareados y análisis de significación estadística.
- Despliegue en entornos con restricciones de almacenamiento: las builds de 9-13 GB permiten distribuir el modelo en imágenes de contenedor o dispositivos con disco limitado, a costa de perder fiabilidad agéntica por debajo de 2,66 bits/peso.

## Benchmarks y rendimiento
Datos publicados por el autor en la model card, medidos sobre un benchmark objetivo de 40 tareas de tool use verificadas por ejecución del artefacto, con perfil de muestreo temp 1 / top_p 0.95 / top_k 20:

| bits/peso | Fichero | Tareas agénticas | Veredicto |
|---|---|---|---|
| 3,40 | Q3_K_M | 40/40 (100 %) | funciona |
| 2,93 | IQ2_M | 79/80 (98,8 %) | mejor relación calidad/tamaño |
| 2,66 | IQ2_XS | 72/80 (90,0 %) | peor, apenas ahorra tamaño |
| 2,23 | IQ1_M (uniforme) | 60/160 (37,5 %) | roto para agentes |
| 1,94 | IQ1_M-compact | 49/160 (30,6 %) | roto para agentes |

Notas metodológicas del autor: una sola ejecución no es fiable (cuatro pasadas del mismo build dan 17, 12, 16 y 15 sobre 40, una dispersión de cinco tareas); la fidelidad no predice capacidad (Q3_K_M discrepa del BF16 original en el argmax del siguiente token en el 9,5 % de posiciones y aun así logra 40/40); y los números dependen del backend (IQ1_M-compact obtiene 19/40 con `llama-server` frente a 49/160 con Ollama). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: 6,46 GB (IQ1_M-compact), 9,09 GB (IQ2_XS), 10,00 GB (IQ2_M), 13,50 GB (Q3_K_M), 15,31 GB (IQ4_XS), 16,81 GB (Q4_K_M), más overhead de contexto y runtime.
- Caché KV: 64 KB por token según el cálculo del autor (16 capas × 4 cabezas KV × 512 × 2 bytes); a 32.768 tokens supone aproximadamente 2 GB adicionales.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, IQ2_M encaja en GPUs de 12-16 GB y Q4_K_M requiere 24 GB o más.
- Cabe en GPU de consumo: sí, las builds de 1,94 a 3,40 bits/peso caben en tarjetas de 8-16 GB; Q4_K_M e IQ4_XS requieren 16-24 GB.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (backend usado en las mediciones), Elffuss Engine para WebGPU en navegador.
- Latencia y throughput: no disponibles cifras concretas. El autor advierte que el prefill es lento en llama.cpp por la arquitectura híbrida, y que en bucles agénticos multi-turno el reprocesamiento del contexto penaliza fuertemente el tiempo total frente a un modelo denso del mismo tamaño.
- Nota de uso: el autor indica `-no-cnv` en `llama-cli` para evitar el modo conversacional por defecto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-GGUF (este repo) | ~27B | 262.144 (declarado) | Cuantizaciones GGUF con evaluación agéntica por nivel | Apache-2.0 | Hugging Face, 6.595 descargas |
| Qwen3.6-27B-GGUF (KikoCis) | ~27B (no confirmado) | no disponible | Cuantizaciones con tabla de fidelidad por tier frente a BF16 | no disponible | Hugging Face |
| Otras builds GGUF de Qwen3.8-27B | ~27B | 262.144 | Cuantizaciones sin benchmark agéntico publicado | Apache-2.0 (heredada) | Hugging Face |

La comparación con modelos de otra familia no está disponible en la información proporcionada. La diferencia diferencial de este repositorio frente a otras builds GGUF del mismo modelo es la medición del umbral agéntico y la advertencia explícita sobre la dependencia del backend.

## Limitaciones y advertencias
- El contexto de 262.144 tokens es la ventana nativa declarada por el modelo, no verificada: el autor no completó ninguna prueba de needle-in-a-haystack.
- Sin soporte de visión: el modelo base es multimodal, pero este repositorio no incluye `mmproj`, por lo que las entradas de imagen no funcionan.
- Por debajo de 2,23 bits/peso el modelo deja de emitir llamadas a herramientas de forma fiable; el fallo dominante no es una respuesta incorrecta sino la ausencia de tool call.
- Los resultados de benchmarks dependen del backend: las mismas tareas y el mismo fichero dan 30,6 % en Ollama y 47,5 % en `llama-server` para IQ1_M-compact. No se deben comparar cifras medidas en runtimes distintos.
- El ruido de medición es alto: cuatro ejecuciones del mismo build varían en cinco tareas sobre 40, lo que supera muchas diferencias entre cuantizaciones.
- La fidelidad respecto al BF16 (perplejidad, KL-divergencia, coincidencia de argmax) no predice la capacidad agéntica.
- Prefill lento en llama.cpp por la arquitectura híbrida; en bucles agénticos multi-turno el coste temporal es superior al de un modelo denso equivalente.
- Licencia Apache-2.0 en el modelo base, permisiva para uso comercial; conviene verificar los términos del modelo base original y las condiciones de las herramientas de cuantización empleadas.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; aplican los del modelo base.
- Idiomas soportados no declarados en este repositorio.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/KikoCis/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio con tabla de fidelidad por tier: https://huggingface.co/KikoCis/Qwen3.6-27B-GGUF
- Elffuss Engine (Apache-2.0): https://github.com/KikoCis/elffuss-engine
- Demo en navegador Elffuss Claw: https://claw.elffuss.com
- Documento de cálculo de contexto: CONTEXT.md dentro del repositorio de Hugging Face
