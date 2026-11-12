# bambocher/Qwen3.5-0.8B-heretic-oQ4-mtp

## Resumen

Qwen3.5-0.8B-heretic-oQ4-mtp es una cuantización mixta de precisión del modelo Qwen/Qwen3.5-0.8B, publicada por el usuario bambocher en Hugging Face. El checkpoint original ha sido modificado mediante Heretic v2.0.0, una herramienta de "decensurado" que reduce los rechazos del modelo ante peticiones que el modelo base declinaría, manteniendo intacta la cabeza de predicción multi-token (MTP). La cuantización se ha realizado con oQ (oMLX v0.7.3), un esquema de precisión mixta que asigna distintos anchos de bit por tensor.

El modelo resultante tiene 873.438.784 parámetros reales según los safetensors, distribuidos en tres componentes: el modelo de lenguaje (0,752B), un codificador visual (0,101B) y una cabeza MTP (0,020B). El almacenamiento efectivo es de 0,623 GiB con una media de 6,123 bits por peso, lo que lo hace adecuado para inferencia en Apple Silicon mediante MLX. La licencia no está declarada en la información disponible, y tampoco se detallan los idiomas soportados.

Es relevante para desarrolladores que trabajan en el ecosistema MLX y necesitan un modelo pequeño, multimodal (visión incluida) y con comportamiento menos restrictivo, con un tamaño de repositorio de 1,4 GB que facilita su despliegue local. No obstante, la ausencia de licencia explícita y de datos de benchmarks limita su uso en producción sin una verificación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5) con cabeza de predicción multi-token (MTP) y codificador visual |
| Parametros totales | 873.438.784 (0,873B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta oQ: affine 4-bit (grupo 64), 5-bit, 6-bit, 8-bit y BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-0.8B, un transformer multimodal que incluye un codificador visual de 0,101B parámetros y una cabeza MTP de 0,020B parámetros que permite la predicción de múltiples tokens por paso. La modificación Heretic v2.0.0 aplica una ablación de rango arbitrario (ARA) sobre las capas 1 a 19, con pesos de preservación de comportamiento bueno de 0,8199, de dirección de comportamiento malo de 0,0001, de corrección relativa de 1,0547 y un recuento de vecinos de 14. El resultado declarado es de 0 rechazos en 100 frente a 97 rechazos en 100 del modelo original, con una divergencia KL de 0,1412 respecto al base.

La cuantización oQ distribuye la precisión de forma no uniforme: el 64,348% de los pesos lógicos se almacena en affine 4-bit (4,50 bits/peso efectivos), el 21,285% en 5-bit (5,50 bits/peso), el 2,549% en 6-bit (6,50 bits/peso), un 0,004% en 8-bit (8,50 bits/peso) y el 11,815% restante se mantiene en BF16 (16,00 bits/peso). El checkpoint se actualizó el 2026-11-12 con oMLX v0.7.3. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen3.5-0.8B.
- Procesamiento de visión: el checkpoint incluye un codificador visual de 0,101B parámetros, por lo que puede manejar entradas de imagen.
- Predicción multi-token (MTP): la cabeza MTP de 0,020B se mantiene intacta, lo que permite decodificación especulativa y generación de varios tokens por paso.
- Comportamiento menos restrictivo: según la model card, reduce los rechazos de 97/100 a 0/100 en la evaluación declarada.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: al estar en formato MLX y ocupar 0,623 GiB, se puede ejecutar en un Mac con memoria unificada mediante la librería mlx, sin necesidad de GPU dedicada.
- Prototipado de asistentes multimodales: el codificador visual integrado permite experimentar con tareas de imagen y texto en un entorno de desarrollo ligero antes de escalar a modelos mayores.
- Decodificación especulativa con MTP: la cabeza MTP intacta permite implementar generación multi-token en pipelines de inferencia para reducir la latencia por token en tareas de generación larga.
- Investigación sobre alineación y rechazos: el checkpoint Heretic permite estudiar el efecto de la ablación ARA sobre el comportamiento del modelo, comparando la tasa de rechazos (0/100) con la del base (97/100) y la divergencia KL (0,1412).
- Evaluación de cuantización mixta: sirve como caso de estudio para medir el impacto de la distribución de bits (4,50 a 16,00 bits/peso) en la calidad de un modelo pequeño multimodal.
- Despliegue en entornos con memoria limitada: con 1,4 GB de repositorio y 0,623 GiB de pesos, cabe en dispositivos con poca VRAM o memoria unificada para pruebas de concepto y demos.
- Filtrado y generación de contenido sin restricciones: para casos donde el modelo base rechazaría peticiones, este checkpoint ofrece respuestas sin declinar, útil en investigación sobre moderación.

## Benchmarks y rendimiento

| Métrica | Este modelo | Qwen/Qwen3.5-0.8B |
|---|---|---|
| Rechazos | 0/100 | 97/100 |
| Divergencia KL | 0,1412 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,623 GiB de pesos en el checkpoint cuantizado, más overhead de activaciones y contexto; el repositorio completo ocupa 1,4 GB.
- GPU recomendadas: no se especifican; el formato MLX está orientado a Apple Silicon (chips M1, M2, M3, M4 y posteriores) con memoria unificada.
- ¿Cabe en GPU consumer? Sí, por tamaño (menos de 1 GB de pesos), aunque la librería MLX limita la ejecución nativa a hardware Apple; en otras plataformas requeriría conversión.
- Opciones de despliegue: librería mlx (MLX); no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| bambocher/Qwen3.5-0.8B-heretic-oQ4-mtp | 0,873B | no disponible | no disponible | safetensors (MLX) | Cuantización mixta, decensurado, con MTP y visión |
| Qwen/Qwen3.5-0.8B | 0,8B (aprox.) | no disponible | no disponible | no disponible | Modelo base original, 97/100 rechazos |
| Otros modelos de ~0,8B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de alternativas comparables en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas de la misma categoría en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- La licencia no está declarada, lo que impide confirmar si se permite el uso comercial; es imprescindible verificar los términos antes de desplegarlo en producción.
- El proceso Heretic elimina los rechazos (0/100), lo que puede producir contenido inapropiado, sesgado o dañino sin filtro; no es adecuado para aplicaciones dirigidas al público sin moderación adicional.
- La divergencia KL de 0,1412 respecto al modelo base indica una alteración medible de la distribución de salida, con posible degradación de capacidades en tareas que dependían del comportamiento original.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual para este checkpoint.
- No se dispone de información sobre sesgos conocidos, idiomas soportados ni longitud de contexto, lo que limita la planificación de casos de uso multilingües o de contexto largo.
- El formato MLX restringe el despliegue a hardware Apple o a entornos con soporte de MLX; no hay evidencia de compatibilidad con otros runtimes.
- El modelo tiene solo 0,873B parámetros, por lo que su capacidad de razonamiento complejo y conocimiento factual es limitada en comparación con modelos de mayor tamaño.
- La cuantización mixta con media de 6,123 bits/peso puede introducir pérdidas de precisión no cuantificadas en los benchmarks disponibles.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/Qwen3.5-0.8B-heretic-oQ4-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Heretic: https://heretic-project.org
- oQ / oMLX: https://github.com/jundot/omlx
