# agentic-ptb/opus-high-v3.h054.sft-verified2.step_18

## Resumen

`opus-high-v3.h054.sft-verified2.step_18` es un checkpoint intermedio generado durante el experimento **opus-high-v3** del proyecto AgentPTB, un conjunto de ejecuciones de fine-tuning supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-9B-Base. El propio autor lo etiqueta como `intermediate` y `negative-results`, y advierte explícitamente en la model card que la ejecución no produjo ninguna mejora en los pesos entrenados y que no debe inferirse calidad a partir de su publicación.

Este checkpoint se conserva únicamente con fines de reproducibilidad y estudio cualitativo de por qué el entrenamiento falló. No es un modelo listo para uso práctico: tiene cero descargas y cero likes, y no se han publicado métricas de rendimiento, benchmarks ni evaluaciones de capacidades. Su interés radica en documentar un resultado negativo dentro de un pipeline de entrenamiento, algo poco habitual pero valioso para la investigación en IA.

Desde el punto de vista técnico, se trata de un modelo denso de aproximadamente 9,41 mil millones de parámetros, derivado de la arquitectura de Qwen3.5-9B-Base. El repositorio contiene únicamente pesos en formato safetensors (18,8 GB), lo que sugiere una precisión de 16 bits (fp16/bf16), aunque no se confirma oficialmente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3.5-9B-Base, un transformer denso de unos 9,4 mil millones de parámetros. No se han publicado detalles adicionales sobre la arquitectura interna (número de capas, dimensiones de atención, etc.) en la información disponible.

El entrenamiento consistió en un fine-tuning supervisado (SFT), según indica el nombre del checkpoint (`sft-verified2`). Sin embargo, no se proporcionan datos sobre el dataset utilizado, el número de tokens de entrenamiento ni el procedimiento exacto. El autor declara que la ejecución completa (etiquetada como `opus-high-v3`) no produjo ninguna mejora en los pesos respecto al modelo base, y que los cinco runs de SFT realizados en una ejecución anterior (`opus-high-v2`) también regresaron a los tensores del modelo base sin cambios. Este checkpoint se conserva como artefacto intermedio para reproducibilidad y análisis de fallos.

## Capacidades

No se han publicado capacidades específicas para este checkpoint. Al ser un resultado negativo sin mejora sobre el modelo base, sus capacidades teóricas serían las de Qwen3.5-9B-Base (generación de texto, razonamiento, posible soporte de tool calling, etc.), pero no existe ninguna evaluación que lo confirme. El autor desaconseja explícitamente inferir calidad a partir de su publicación.

- Generación de texto: no evaluada.
- Razonamiento y codigo: no evaluados.
- Tool calling / function calling: no evaluado.
- Soporte de agentes: no evaluado.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking): no disponibles.

## Casos de uso

No existen casos de uso prácticos recomendados para este checkpoint. Su única utilidad es como objeto de estudio en investigación:

- Reproducibilidad de experimentos: permite a otros investigadores replicar el pipeline de entrenamiento y verificar por qué no se produjo mejora en los pesos.
- Analisis de fallos en entrenamiento: sirve para estudiar qué condiciones llevan a un SFT que no converge o que regresa al modelo base.
- Estudio de artefactos intermedios: puede compararse con otros checkpoints de la misma ejecución para trazar la evolucion de los pesos a lo largo del entrenamiento.
- Documentacion de resultados negativos: contribuye a la literatura sobre experimentos fallidos, un area poco documentada pero necesaria para evitar repetir errores.
- Comparacion de pipelines: puede confrontarse con otros experimentos de AgentPTB (como `opus-high-v1` o `opus-high-v2`) para evaluar diferencias metodologicas.
- Validacion de metricas de seguimiento: permite probar herramientas de monitorizacion de entrenamiento sobre un caso conocido de regresion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica en la model card que la ejecucion no encontro ninguna mejora en los pesos entrenados, por lo que cualquier evaluacion de rendimiento seria equivalente a la del modelo base, pero no se aportan datos numericos.

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware para este checkpoint. Como estimacion basada en el tamano del modelo (9,4B parametros) y el peso del repositorio (18,8 GB, compatible con fp16/bf16):

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 19-20 GB, mas overhead de activaciones y KV cache.
- GPU recomendadas: RTX 4090 (24 GB), A100 40 GB, H100 80 GB.
- Cabe en GPU de consumo de gama alta (RTX 4090) con cuantizacion fp16; para cuantizaciones de 8 bits o 4 bits cabria en GPUs de 12-16 GB, pero no se proporcionan archivos cuantizados.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, aunque no se ha verificado su compatibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparativas publicadas. Al ser un checkpoint intermedio sin mejora sobre el modelo base, no tiene sentido compararlo con alternativas de la misma categoria. La unica referencia razonable seria el propio Qwen/Qwen3.5-9B-Base, pero no se han publicado metricas comparativas.

## Limitaciones y advertencias

- Checkpoint intermedio de una ejecucion fallida: el autor declara que no hubo mejora en los pesos entrenados. No debe utilizarse en produccion.
- Sin evaluacion de capacidades: no hay benchmarks, ni pruebas de sesgos, alucinacion o seguridad.
- Sin informacion sobre el dataset de entrenamiento: se desconoce la composicion de los datos de SFT, lo que impide valorar posibles sesgos introducidos.
- Riesgo de alucinacion: al ser un modelo sin validar, el riesgo es desconocido y potencialmente alto.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no ofrece valor practico por su falta de mejora.
- Advertencia del autor: la model card incluye una "interpretation warning" explicita que desaconseja inferir calidad a partir de la publicacion del checkpoint.
- Reputacion del repositorio: cero descargas y cero likes; no hay comunidad ni soporte asociado.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/agentic-ptb/opus-high-v3.h054.sft-verified2.step_18)
- [Dataset asociado a la ejecucion opus-high-v3](https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data)
- [Indice de experimentos AgentPTB](https://huggingface.co/datasets/agentic-ptb/INDEX)
