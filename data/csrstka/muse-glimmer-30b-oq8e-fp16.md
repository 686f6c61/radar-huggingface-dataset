# csrstka/Muse-Glimmer-30B-oQ8e-fp16

## Resumen

El modelo `csrstka/Muse-Glimmer-30B-oQ8e-fp16` es una versión cuantizada en 8 bits del modelo `Muse-Glimmer-30B`, generada mediante la herramienta oQ (oMLX v0.6.0) para su uso en entornos MLX, la librería de aprendizaje automático de Apple para silicio propio. La cuantización utiliza un tamaño de grupo de 64 y produce pesos en formato MLX safetensors.

A pesar del nombre, los parámetros totales declarados en los archivos safetensors ascienden a 9.757.002.752 (~9,7 mil millones), lo que sugiere una posible discrepancia con la denominación "30B" o que se trate de un modelo con arquitectura de mezcla de expertos (MoE) donde solo una parte de los parámetros está activa por paso. No se dispone de información adicional sobre la arquitectura subyacente, el proceso de entrenamiento o las capacidades del modelo original.

La ficha se elabora con la información limitada disponible en la página de HuggingFace, ya que la model card del autor solo documenta los detalles de la cuantización, sin aportar datos sobre licencia, idiomas, benchmarks o casos de uso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | muse_glimmer (sin detalles adicionales) |
| Parametros totales | 9.757.002.752 (~9,7 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits, group size 64 (oQ / oMLX) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo original. El identificador `muse_glimmer` sugiere una familia de modelos de lenguaje, pero no se especifica si se trata de un transformer denso, un MoE o una arquitectura híbrida. El proceso de cuantización fue realizado con la herramienta oQ (oMLX v0.6.0), que aplica cuantización de precisión mixta, en este caso con 8 bits y un tamaño de grupo de 64.

No se dispone de datos sobre el entrenamiento del modelo base: número de tokens, composición del dataset, técnicas de alineación (RLHF, DPO, etc.) o innovaciones técnicas. La cuantización no modifica el número de parámetros, pero reduce el tamaño de los pesos para facilitar la inferencia en hardware compatible con MLX.

## Capacidades

No se han publicado en la información disponible detalles sobre las capacidades específicas del modelo. Al tratarse de un modelo de lenguaje, es razonable esperar generación de texto, razonamiento y posiblemente generación de código, pero no hay confirmación oficial. Tampoco se indica soporte para tool calling, agentes, visión o modos especiales de razonamiento.

## Casos de uso

Dado que no se dispone de información sobre las capacidades reales del modelo, no es posible recomendar casos de uso concretos con fundamento. Cualquier aplicación práctica requeriría primero evaluar el modelo original `Muse-Glimmer-30B` y verificar su comportamiento en tareas específicas. La versión cuantizada podría utilizarse en entornos Apple Silicon para pruebas de generación de texto, pero sin garantías de rendimiento o calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar, ni comparaciones con modelos similares.

## Requisitos de hardware

- El formato MLX safetensors está diseñado para ejecutarse en Apple Silicon (M1, M2, M3 y posteriores) mediante la librería MLX.
- Con ~9,7 mil millones de parámetros en 8 bits, el peso del modelo en memoria es de aproximadamente 9,7 GB, más overhead de activaciones y caché. Se recomienda un mínimo de 16 GB de memoria unificada para inferencia fluida.
- Para uso con ventanas de contexto largas o procesamiento por lotes, se recomiendan 32 GB o más.
- No se ha probado en GPUs NVIDIA o AMD; el formato MLX no es compatible directamente con CUDA o ROCm.
- Opciones de despliegue: la librería MLX (Python) y herramientas compatibles como `mlx-lm` (si está disponible). No se menciona soporte para vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No disponible. No se ha identificado información sobre modelos comparables en la misma categoría (tamaño, arquitectura o propósito) dentro de la documentación proporcionada.

## Limitaciones y advertencias

- La licencia del modelo no está especificada, por lo que no se puede garantizar su uso comercial o la redistribución.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas.
- La discrepancia entre el nombre "30B" y los parámetros reales (~9,7 B) genera incertidumbre sobre la arquitectura real del modelo; podría tratarse de un MoE con parámetros activos menores, pero no está confirmado.
- Al ser una cuantización de 8 bits, puede haber una ligera degradación en la calidad de las respuestas respecto al modelo original en precisión completa.
- El soporte está limitado a ecosistema MLX (Apple Silicon), lo que restringe su uso en clústeres de GPUs convencionales.
- No se han publicado evaluaciones independientes, por lo que el rendimiento real es desconocido.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/csrstka/Muse-Glimmer-30B-oQ8e-fp16)
- [Repositorio oQ / oMLX](https://github.com/jundot/omlx)
