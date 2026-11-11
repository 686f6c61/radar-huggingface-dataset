# ProtonPrat/anlp-a3-mamba

## Resumen

ANLP A3 cipher decryption: mamba es un modelo de investigación publicado en Hugging Face por el usuario ProtonPrat, desarrollado en el contexto de la asignatura ANLP Monsoon 2026 (Assignment 3). Se trata de un etiquetador causal a nivel de carácter (causal character tagger) entrenado para una tarea de descifrado de cifrados, construido sobre una arquitectura híbrida de tipo Mamba con patrón de capas `MMMMMMMM` (T = atención, M = Mamba, D = DeltaNet), anchura de modelo 256 y 3.527.963 parámetros.

El modelo no es un asistente conversacional ni un LLM de propósito general, sino un artefacto académico muy pequeño orientado a una tarea concreta de descifrado sobre el conjunto de datos `data_new` del mencionado assignment. Su relevancia es, por tanto, limitada al ámbito docente y a la experimentación con arquitecturas SSM (State Space Models) en tareas de etiquetado secuencial de caracteres.

Los resultados reportados en la model card son muy modestos: precisión de carácter en validación de 0,1875 y precisión de palabra de 0,0170. El modelo se carga mediante la función `src.part1.checkpoint.load_checkpoint` del repositorio del assignment, lo que implica una dependencia fuerte del código externo y no de una API estándar de transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida con patrón de capas `MMMMMMMM` (M = Mamba; T = atención, D = DeltaNet no usados en este checkpoint), anchura 256 |
| Parametros totales | 3.527.963 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de tipo Mamba (State Space Model) configurada con un patrón de capas `MMMMMMMM`, es decir, ocho capas consecutivas de tipo Mamba sin capas de atención ni DeltaNet en este checkpoint concreto. La anchura del modelo es 256 y el total de parámetros asciende a 3.527.963. Se trata de un etiquetador causal a nivel de carácter, por lo que opera sobre secuencias de caracteres y produce etiquetas por posición.

El entrenamiento se realizó sobre el conjunto `data_new` del Assignment 3 de ANLP Monsoon 2026, orientado a descifrado de cifrados. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco probables en un modelo de este tamaño y naturaleza). Tampoco se documentan innovaciones técnicas adicionales más allá del uso de capas Mamba en lugar de atención.

## Capacidades

- Etiquetado causal a nivel de carácter para tareas de descifrado de cifrados.
- Generación de etiquetas por posición sobre secuencias de caracteres (no generación de texto libre).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No se documentan capacidades especiales (thinking mode, visión, audio).

## Casos de uso

- Descifrado académico de cifrados: el modelo se emplea como etiquetador de caracteres para reconstruir texto cifrado en el contexto del assignment ANLP Monsoon 2026, cargándolo con `src.part1.checkpoint.load_checkpoint`.
- Experimentación con arquitecturas SSM: sirve como banco de pruebas para comparar capas Mamba frente a atención en tareas de etiquetado secuencial de caracteres con modelos de muy bajo parámetro.
- Reproducción de resultados docentes: permite reproducir las métricas reportadas (0,1875 de precisión de carácter y 0,0170 de precisión de palabra) en un entorno controlado con el repositorio del assignment.
- Estudio de fallos en modelos pequeños: su baja precisión lo convierte en un caso útil para analizar modos de error en etiquetadores causales de carácter.
- Base para ajuste fino en tareas de criptoanálisis didáctico: al ser un checkpoint pequeño (3,5 M de parámetros), puede reentrenarse o adaptarse rápidamente en una GPU de consumo.
- Docencia en NLP: ejemplo práctico de pipeline de carga, inferencia y evaluación con safetensors y PyTorch para estudiantes.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precisión de carácter (validación) | 0,1875 |
| Precisión de palabra (validación) | 0,0170 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (3,5 M de parámetros), por lo que cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) o incluso CPU para inferencia.
- Cabe en consumer GPU: sí, en todas las gamas actuales.
- Opciones de despliegue: PyTorch nativo con la función `src.part1.checkpoint.load_checkpoint` del repositorio del assignment; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (etiquetadores causales de carácter basados en Mamba para descifrado) con los que establecer una comparación rigurosa.

## Limitaciones y advertencias

- Precisión muy baja: 0,1875 de precisión de carácter y 0,0170 de precisión de palabra en validación, lo que limita seriamente su utilidad práctica.
- Dependencia del código del assignment: requiere `src.part1.checkpoint.load_checkpoint`, no una API estándar de transformers.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- Idiomas no documentados: se desconoce el alcance lingüístico del modelo.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en secuencias largas.
- Riesgo de sobreajuste al dataset `data_new` del assignment, con posible falta de generalización a otros cifrados.
- No apto para producción: es un artefacto académico sin pipeline, sin documentación de sesgos y sin garantías de robustez.
- Riesgo de alucinación no evaluado en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/ProtonPrat/anlp-a3-mamba
- Repositorio del assignment (referenciado en la model card, sin URL explícita): no disponible
- Paper, blog, demo o repositorio adicional: no disponible
