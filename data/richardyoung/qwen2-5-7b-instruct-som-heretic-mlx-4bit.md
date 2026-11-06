# richardyoung/Qwen2.5-7B-Instruct-SOM-heretic-MLX-4bit

## Resumen

Qwen2.5-7B-Instruct-SOM-heretic-MLX-4bit es una conversión a 4 bits en formato MLX del modelo richardyoung/Qwen2.5-7B-Instruct-SOM-heretic, que a su vez es una versión de Qwen2.5-7B-Instruct de Alibaba a la que se le ha eliminado el comportamiento de rechazo mediante la técnica Heretic 2.0 (abliteration). El autor, richardyoung, publica esta variante cuantizada específicamente para ejecución en Apple Silicon a través de la librería mlx-lm, con el objetivo de que el modelo pueda correr en Macs con memoria unificada sin necesidad de GPUs dedicadas.

El modelo conserva la arquitectura transformer densa de Qwen2.5-7B-Instruct, con 7.615.616.512 parámetros totales y una ventana de contexto de 32.768 tokens (característica de la familia Qwen2.5, aunque no se explicita en la model card). La aportación principal de esta ficha no es arquitectónica sino práctica: reduce el peso del repositorio a 4,3 GB mediante cuantización afín de 4 bits con grupo de 64, lo que permite desplegarlo en equipos con 8-16 GB de memoria unificada.

Es relevante ahora porque forma parte de una línea de investigación sobre robustez de mecanismos de seguridad en modelos open-weight (el estudio "Is Abliteration Getting Harder? Directional vs. Optimization-Based Refusal Removal Across Generations of Open-Weight LLMs", de Young, 2026, en preparación). El modelo está pensado para investigación sobre safety y no para uso comercial en producción sin las cautelas oportunas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2.5), decodificador causal |
| Parámetros totales | 7.615.616.512 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (la familia Qwen2.5-7B-Instruct soporta 32.768 tokens, pero no se confirma en la model card) |
| Tipos de cuantización | 4 bits afín (affine), group size 64, generado con `mlx_lm.convert -q --q-bits 4 --q-group-size 64` (mlx-lm 0.32.2) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (no GGUF, no transformers estándar) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atención causal estándar, entrenado por Alibaba sobre un corpus multilingüe no detallado en la información disponible. Sobre ese modelo base, el autor aplicó Heretic 2.0, una técnica de eliminación de rechazo (refusal removal) que combina direcciones de abliteration con optimización, según se describe en el estudio de Young (2026, en preparación). El resultado es el checkpoint bf16 richardyoung/Qwen2.5-7B-Instruct-SOM-heretic, que es el modelo del que deriva esta conversión.

La única transformación adicional aplicada en este repositorio es la cuantización a 4 bits mediante mlx-lm 0.32.2, con cuantización afín y tamaño de grupo 64. No hay reentrenamiento, fine-tuning adicional ni cambios en los pesos más allá de la cuantización. Es importante señalar que las evaluaciones del paper se realizaron sobre el modelo fuente en bf16, no sobre esta versión de 4 bits, por lo que el impacto de la cuantización en las métricas de seguridad y calidad no está documentado en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-7B-Instruct.
- Razonamiento general, matemáticas y generación de código (capacidades propias del modelo base Qwen2.5-7B-Instruct, no verificadas específicamente en esta variante).
- Soporte de tool calling / function calling (capacidad del modelo base Qwen2.5-Instruct; no se confirma en la model card de esta conversión).
- Capacidades multilingües heredadas del modelo base (idiomas exactos no disponibles).
- Comportamiento de rechazo eliminado: el modelo puede cumplir solicitudes que el Qwen2.5-7B-Instruct original rechazaría.
- No se documentan capacidades de visión, audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Investigación sobre mecanismos de seguridad: el modelo sirve para estudiar la robustez de las salvaguardas de los LLM open-weight y evaluar hasta qué punto técnicas como Heretic 2.0 eliminan el comportamiento de rechazo, tal como plantea el estudio del autor.
- Evaluación de abliteration en Apple Silicon: al estar en formato MLX 4 bits, permite reproducir experimentos de safety en Macs sin GPU dedicada, con un peso de repositorio de 4,3 GB.
- Pruebas de red teaming controladas: útil para generar respuestas que el modelo original bloquearía y analizar patrones de cumplimiento en entornos de laboratorio aislados.
- Desarrollo de prototipos conversacionales en local: para equipos que trabajan en Mac y necesitan un modelo de 7B instructivo con contexto amplio sin depender de servicios en la nube.
- Benchmarking de cuantización: comparar el comportamiento del modelo bf16 fuente frente a esta versión 4 bits en tareas de generación y razonamiento, midiendo la degradación introducida por la cuantización afín de 4 bits.
- Estudio de sesgos y alucinaciones en modelos sin rechazo: analizar cómo varía la tasa de alucinación y la adherencia a instrucciones cuando se elimina el comportamiento de rechazo, en comparación con el Qwen2.5-7B-Instruct original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las evaluaciones del paper se ejecutaron sobre el modelo fuente en bf16 y no sobre esta conversión de 4 bits.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 4,3 GB, por lo que la inferencia en 4 bits requiere aproximadamente 5-6 GB de memoria unificada, incluyendo overhead de la librería MLX y del contexto.
- GPU recomendadas: Apple Silicon exclusivamente (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No es compatible con CUDA de forma nativa al estar en formato MLX.
- ¿Cabe en consumer GPU? No en GPUs NVIDIA/AMD convencionales sin conversión previa; sí en Macs con 8 GB o más de memoria unificada, aunque 16 GB es el mínimo recomendable para contextos largos.
- Opciones de despliegue: `mlx-lm` (CLI `mlx_lm.generate` y API Python), y servidores compatibles con MLX como `mlx_lm.server`. No es directamente compatible con vLLM, llama.cpp, Ollama ni TGI sin reconversión a otro formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| richardyoung/Qwen2.5-7B-Instruct-SOM-heretic-MLX-4bit | 7,6 B | No disponible | 4 bits MLX | Apache 2.0 | HuggingFace, formato MLX |
| richardyoung/Qwen2.5-7B-Instruct-SOM-heretic (fuente) | 7,6 B | No disponible | bf16 | Apache 2.0 | HuggingFace, safetensors |
| Qwen/Qwen2.5-7B-Instruct (original) | 7,6 B | 32.768 tokens (según documentación de Qwen) | bf16, GPTQ, AWQ, GGUF | Apache 2.0 | HuggingFace, múltiples formatos |
| Otras variantes abliterated de Qwen2.5-7B | ~7,6 B | Variable según conversión | Variable | Apache 2.0 en la mayoría | HuggingFace |

La comparación relevante es frente al modelo fuente en bf16 (misma capacidad, mayor precisión, mayor peso) y frente al Qwen2.5-7B-Instruct original (con salvaguardas intactas). No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo ha eliminado su comportamiento de rechazo y puede cumplir solicitudes dañinas; el autor lo libera exclusivamente para investigación sobre mecanismos de seguridad.
- No se han publicado evaluaciones de esta versión cuantizada a 4 bits: la degradación de calidad y de robustez frente al bf16 es desconocida.
- Riesgo de alucinación inherente a los modelos de 7B, no cuantificado en la información disponible.
- Idiomas soportados no documentados; la cobertura multilingüe puede diferir de la del Qwen2.5-7B-Instruct original.
- Licencia Apache 2.0 permite uso comercial según los términos de la licencia, pero el uso responsable recae en el usuario; el propio autor advierte de que el modelo puede violar políticas de contenido si se despliega sin filtros externos.
- Formato MLX limita el despliegue a Apple Silicon; no es portable a infraestructura CUDA sin reconversión.
- Sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- La fecha de creación indicada (2026-11-05) es posterior a la redacción de esta ficha y debe interpretarse como metadato del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-SOM-heretic-MLX-4bit
- Modelo fuente: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-SOM-heretic
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Librería MLX: https://github.com/ml-explore/mlx
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-lm
- Estudio de referencia: Young, "Is Abliteration Getting Harder? Directional vs. Optimization-Based Refusal Removal Across Generations of Open-Weight LLMs" (2026, en preparación; sin URL disponible)
