# nchapman/Qwen3.5-4B-d3-mini-LoRA

## Resumen

Qwen3.5-4B-d3-mini-LoRA es un adaptador PEFT de rango 128 acompañado de una cabeza de decisión de 255 vías denominada `CodeReadout`, extraído del modelo `vllm-sr/d3-mini` y aplicado sobre el modelo base `Qwen/Qwen3.5-4B`. Lo publica el usuario nchapman en Hugging Face bajo licencia Apache 2.0. No es un modelo completo, sino un artefacto de ajuste fino que requiere cargar el modelo base Qwen3.5-4B para funcionar.

El modelo pertenece a la categoría de "decision-model" o "system-one" según las etiquetas del autor, lo que sugiere un uso orientado a tomar decisiones rápidas de clasificación o enrutamiento más que a generación abierta de texto. La cabeza `CodeReadout` de 255 vías apunta a una tarea de clasificación discreta sobre un vocabulario cerrado de decisiones o códigos.

Su relevancia es limitada y muy específica: reproduce casi exactamente el rendimiento del modelo completo `vllm-sr/d3-mini` en la evaluación pública JevBench (190/231 aciertos, 82,25%) con un artefacto de solo 0,5 GB, lo que facilita el despliegue. Sin embargo, se trata de un modelo recién publicado (noviembre de 2026), sin descargas ni validación externa, y con documentación muy escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-4B, con cabeza de clasificación `CodeReadout` de 255 vías |
| Parametros totales | No disponible (adaptador LoRA de rango 128; el modelo base Qwen3.5-4B tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-4B, no especificada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 128 obtenido mediante una técnica que el autor denomina "Teacher-ASVD + 4-NormFold", junto con una cabeza `CodeReadout` de 255 salidas. La nomenclatura sugiere una destilación desde el modelo profesor `vllm-sr/d3-mini` hacia el modelo base Qwen3.5-4B mediante descomposición de valores singulares (ASVD) y plegado de normalizaciones (NormFold), aunque el autor no detalla el procedimiento.

No se especifican datos de entrenamiento: ni número de tokens, ni composición del dataset, ni si hubo RLHF o DPO. El autor solo reporta la evaluación en JevBench, un conjunto de 231 casos (48 fácil, 72 original, 111 difícil). No hay información sobre innovaciones técnicas adicionales más allá de la propia extracción del adaptador y la cabeza de decisión.

## Capacidades

- Clasificación de decisiones sobre un espacio cerrado de 255 vías mediante la cabeza `CodeReadout`.
- Generación de texto heredada del modelo base Qwen3.5-4B (pipeline `text-generation`).
- Enrutamiento o toma de decisiones rápidas ("system-one", "decision-model" según etiquetas del autor).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No se documentan capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Clasificación de decisiones en pipelines de enrutamiento: la cabeza `CodeReadout` de 255 vías permite mapear entradas a un conjunto cerrado de códigos de decisión, adecuado para orquestadores que necesitan elegir entre un número acotado de acciones.
- Sustitución de un modelo mayor en producción: al igualar el rendimiento de `vllm-sr/d3-mini` (190/231 en JevBench) con un artefacto de 0,5 GB, permite reducir huella de memoria y coste de despliegue.
- Evaluación comparativa interna: sirve como referencia para medir cuánto rendimiento se conserva al extraer un adaptador LoRA de un modelo profesor.
- Investigación sobre destilación y extracción de conocimiento: el enfoque Teacher-ASVD + NormFold es un caso de estudio para quienes trabajan en compresión de modelos.
- Prototipado rápido de clasificadores de decisión: el adaptador se carga sobre Qwen3.5-4B mediante PEFT, lo que facilita experimentar sin reentrenar.
- Despliegue con vLLM: la etiqueta `vllm-sr` indica compatibilidad con el servidor vLLM, útil para servir el adaptador en entornos de inferencia de alto rendimiento.

## Benchmarks y rendimiento

Evaluación pública JevBench (231 casos: 48 fácil / 72 original / 111 difícil):

| Modelo | Precisión global | Fácil (48) | Original (72) | Difícil (111) | NLL (menor mejor) | Brier (menor mejor) |
|---|---|---|---|---|---|---|
| Base Qwen/Qwen3.5-4B | 181/231 (78,35%) | 48/48 | 64/72 | 69/111 | 0,5966 | 0,3075 |
| **Qwen3.5-4B-d3-mini-LoRA (r=128)** | **190/231 (82,25%)** | **48/48** | **72/72** | **70/111** | **0,4097** | **0,2375** |
| Full vllm-sr/d3-mini | 190/231 (82,25%) | 48/48 | 72/72 | 70/111 | 0,4177 | 0,2415 |

El adaptador supera al modelo base en 9 aciertos y mejora NLL y Brier, igualando al modelo completo `vllm-sr/d3-mini` en precisión y superándolo ligeramente en calibración (NLL 0,4097 frente a 0,4177).

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el adaptador pesa 0,5 GB, pero requiere cargar el modelo base Qwen3.5-4B (aproximadamente 8 GB en fp16, menos con cuantización).
- GPU recomendadas: no especificadas por el autor; por tamaño del modelo base, cabría en GPUs de consumo con suficiente VRAM.
- Compatibilidad con GPU de consumo: probable para el modelo base en cuantización, pero no confirmado por el autor.
- Opciones de despliegue: PEFT (librería declarada) y vLLM (etiqueta `vllm-sr`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | JevBench (global) | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-4B-d3-mini-LoRA | LoRA + cabeza de decisión | Adaptador (base 4B) | No disponible | 82,25% | Apache 2.0 |
| vllm-sr/d3-mini | Modelo completo | No disponible | No disponible | 82,25% | No disponible |
| Qwen/Qwen3.5-4B (base) | Transformer | 4B | No disponible | 78,35% | No disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (decision-models o clasificadores de decisión de 255 vías).

## Limitaciones y advertencias

- No es un modelo autónomo: requiere cargar el modelo base `Qwen/Qwen3.5-4B` para funcionar.
- Documentación muy escasa: sin detalles de entrenamiento, idiomas, contexto ni cuantizaciones.
- Sin validación externa: 0 descargas y 0 likes en el momento de la ficha; el benchmark JevBench lo reporta el propio autor.
- Riesgo de alucinación: inherente al modelo base en tareas de generación abierta; la cabeza `CodeReadout` está limitada a 255 clases y puede fallar fuera de distribución.
- Sesgos: no documentados por el autor.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.5-4B y del profesor `vllm-sr/d3-mini`.
- El nombre del repositorio menciona "d3-mini" y etiquetas como "qwen3.8" y "warp-34" sin explicación, lo que dificulta interpretar su alcance real.

## Enlaces

- Hugging Face: https://huggingface.co/nchapman/Qwen3.5-4B-d3-mini-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo profesor: https://huggingface.co/vllm-sr/d3-mini
