# ProtonPrat/anlp-a3-hybrid

## Resumen

El modelo `ProtonPrat/anlp-a3-hybrid` es un modelo de investigación de tipo *character tagger* causal, desarrollado por el usuario ProtonPrat en el contexto de la asignatura ANLP (Monsoon 2026), Assignment 3. Se trata de un modelo híbrido que combina capas de atención con capas de estado recurrente (Mamba y DeltaNet) según el patrón de capas `MMDMMD`, con una anchura de 256 y un total de 3.490.715 parámetros. Su tarea es la "cifrado-descifrado" (*cipher decryption*), etiquetando carácter a carácter de forma causal.

El modelo es relevante únicamente como artefacto docente y de experimentación arquitectónica: demuestra cómo intercalar bloques de atención y bloques recurrentes lineales en un modelo de escala muy reducida. No es un modelo de propósito general ni está pensado para producción: sus métricas de validación son muy bajas (precisión por carácter 0,1874 y por palabra 0,0169), lo que refleja un entrenamiento limitado o un problema intrínsecamente difícil con esta configuración.

Por su tamaño (3,5 M de parámetros) y su naturaleza de *tagger* causal, no compite con los modelos de lenguaje convencionales. Su interés es exclusivamente académico: sirve para estudiar el comportamiento de arquitecturas híbridas Mamba/DeltaNet/atención en tareas de descifrado sobre datos sintéticos o de asignatura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido causal con patrón de capas `MMDMMD` (M = Mamba, D = DeltaNet, T = atención); anchura 256 |
| Parametros totales | 3.490.715 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

La arquitectura es un modelo causal de etiquetado por carácter (*character tagger*) con un patrón de seis capas `MMDMMD`, donde cada letra indica el tipo de bloque: M para Mamba, D para DeltaNet y T para atención. La anchura del modelo es 256 y el total de parámetros asciende a 3.490.715. Esta combinación de capas de estado (Mamba, DeltaNet) con capas de atención es un ejemplo de arquitectura híbrida orientada a reducir el coste cuadrático de la atención manteniendo capacidad de modelado secuencial.

El entrenamiento se realizó sobre el conjunto `data_new` de la Assignment 3 de ANLP Monsoon 2026, según indica la model card. No se especifican el número de tokens, la composición del dataset, ni si hubo etapas de RLHF o DPO. Las métricas reportadas por el autor son precisión por carácter de 0,1874 y precisión por palabra de 0,0169 en validación, lo que sugiere un ajuste limitado al problema de descifrado planteado. No se documentan innovaciones técnicas adicionales más allá del propio patrón híbrido de capas.

## Capacidades

- Etiquetado causal por carácter (*causal character tagging*) para tareas de descifrado de texto cifrado.
- Modelado de secuencias con mezcla de atención y capas de estado (Mamba, DeltaNet).
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No se documentan capacidades especiales (modo *thinking*, visión, audio).
- No se documenta generación de texto libre, código ni matemáticas.

## Casos de uso

- Experimentación académica en arquitecturas híbridas: el modelo sirve para estudiar cómo se comportan capas Mamba y DeltaNet intercaladas con atención en una tarea de etiquetado secuencial a pequeña escala.
- Docencia en procesamiento de lenguaje natural: reproducción del flujo de carga mediante `src.part1.checkpoint.load_checkpoint` del repositorio de la asignatura para analizar el efecto del patrón `MMDMMD`.
- Prueba de concepto de descifrado por carácter: útil para comparar variantes (atención pura frente a híbrida) dentro del mismo *assignment*, aunque con precisión por palabra muy baja (0,0169).
- Investigación sobre eficiencia de capas de estado: al tener solo 3,5 M de parámetros, permite iterar rápidamente en hardware modesto para medir coste y comportamiento de Mamba/DeltaNet.
- Referencia para ablaciones de arquitectura: sirve como línea base híbrida frente a modelos puramente transformer en el mismo conjunto `data_new`.
- Análisis de errores en tareas de descifrado: las métricas por carácter y por palabra permiten estudiar dónde falla el etiquetado causal en secuencias cifradas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precisión por carácter (validación) | 0,1874 |
| Precisión por palabra (validación) | 0,0169 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32, dado que el modelo tiene 3,49 M de parámetros (unos 14 MB en fp32 y unos 7 MB en fp16).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe holgadamente en GPU consumer (RTX 3060, RTX 4090, GTX 1650, etc.) e incluso en CPU.
- Opciones de despliegue: al ser un modelo PyTorch con safetensors y requerir `src.part1.checkpoint.load_checkpoint` del repositorio de la asignatura, el despliegue estándar es mediante el código del *assignment*; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ProtonPrat/anlp-a3-hybrid | 3.490.715 | no disponible | Descifrado por carácter (híbrido MMDMMD) | no disponible | Hugging Face |
| Modelos transformer puros del mismo assignment | no disponible | no disponible | Descifrado por carácter | no disponible | no disponible |
| Modelos híbridos Mamba/atención de escala media (p. ej. Jamba, Zamba) | cientos de millones a miles de millones | decenas de miles de tokens | Lenguaje general | variable | Hugging Face |

No se dispone de datos de rendimiento comparables publicados para alternativas directas en la misma tarea.

## Limitaciones y advertencias

- Métricas de validación muy bajas: precisión por carácter 0,1874 y por palabra 0,0169, lo que indica un rendimiento insuficiente para uso real.
- Modelo de investigación docente, no validado para producción ni para uso comercial.
- Licencia no especificada: no se puede asumir permiso de uso comercial.
- Idiomas soportados no documentados; no hay evidencia de capacidades multilingües.
- Longitud de contexto no documentada; el comportamiento fuera del rango de entrenamiento es desconocido.
- Requiere código específico del repositorio de la asignatura (`src.part1.checkpoint.load_checkpoint`), lo que limita su portabilidad.
- Riesgo de sesgos y alucinaciones no evaluado; al ser un *tagger* por carácter, el riesgo se manifiesta como etiquetado incorrecto más que como generación libre.
- Sin datos de benchmarks estándar que permitan comparar su calidad de forma objetiva.

## Enlaces

- Hugging Face: https://huggingface.co/ProtonPrat/anlp-a3-hybrid
- Repositorio de la asignatura (referenciado en la model card): no disponible como URL pública en la información proporcionada.
