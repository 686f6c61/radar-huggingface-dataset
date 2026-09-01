# mradermacher/Aureth-4B-Qwen3.5-Heretic-i1-GGUF

## Resumen

El repositorio `mradermacher/Aureth-4B-Qwen3.5-Heretic-i1-GGUF` contiene cuantizaciones en formato GGUF del modelo `Auguments/Aureth-4B-Qwen3.5-Heretic`, un modelo de lenguaje de aproximadamente 4 mil millones de parámetros basado en la arquitectura Qwen3.5. El autor, mradermacher, se dedica a generar versiones cuantizadas (GGUF) de modelos open source para facilitar su ejecución en entornos con recursos limitados. Este repositorio en particular ofrece un archivo de matriz de importancia (imatrix) para que los usuarios puedan crear sus propias cuantizaciones personalizadas, mientras que las cuantizaciones estáticas se encuentran en un repositorio hermano. No se dispone de información detallada sobre el modelo base, sus capacidades o su proceso de entrenamiento, más allá de que está orientado al idioma inglés y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere Qwen3.5 por el nombre, sin confirmar) |
| Parametros totales | no disponible (el nombre sugiere 4B; el dato de safetensors es 897.272 sin unidad clara) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en este repo (solo archivo imatrix; el repo estatico incluye Q2_K, IQ3_M, Q4_K_S, etc.) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna, el proceso de entrenamiento, el dataset utilizado ni las tecnicas de optimizacion del modelo base `Auguments/Aureth-4B-Qwen3.5-Heretic`. El nombre sugiere que se trata de un fine-tuning de un modelo Qwen3.5 de 4B, pero no hay documentacion que lo confirme. El repositorio actual solo contiene un archivo de matriz de importancia (imatrix) generado por mradermacher, que se emplea para mejorar la calidad de las cuantizaciones posteriores.

## Capacidades

No se dispone de informacion especifica sobre las capacidades del modelo. Al tratarse de un modelo de lenguaje basado en Qwen3.5, es probable que pueda realizar generacion de texto, razonamiento y otras tareas tipicas de LLMs, pero no hay datos confirmados. Tampoco se conocen capacidades especiales como tool calling, vision o modo thinking.

## Casos de uso

No se dispone de informacion concreta sobre casos de uso especificos. Dado que el repositorio ofrece un archivo imatrix, su utilidad principal es la creacion de cuantizaciones personalizadas con herramientas como llama.cpp o MLX. Para aplicaciones de inferencia, habria que utilizar las cuantizaciones del repositorio estatico, pero no se documentan escenarios de uso recomendados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No se dispone de datos oficiales sobre requisitos de hardware. Como referencia general, un modelo de 4B cuantizado a 4 bits suele requerir entre 2 y 3 GB de VRAM, por lo que podria ejecutarse en GPUs consumer como la RTX 3060 o superiores. Sin embargo, al no haber especificaciones confirmadas, se recomienda consultar el repositorio estatico o probar con herramientas como llama.cpp u Ollama.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables con informacion suficiente en los datos proporcionados.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de contexto del modelo base.
- Al ser una cuantizacion, puede haber una ligera perdida de calidad respecto al modelo original en precision completa.
- El repositorio actual solo contiene el archivo imatrix; para uso practico es necesario descargar las cuantizaciones del repositorio estatico.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base cumpla con los mismos terminos.
- No hay garantias de soporte o mantenimiento por parte del autor.

## Enlaces

- Repositorio actual: https://huggingface.co/mradermacher/Aureth-4B-Qwen3.5-Heretic-i1-GGUF
- Repositorio estatico (cuantizaciones): https://huggingface.co/mradermacher/Aureth-4B-Qwen3.5-Heretic-GGUF
- Modelo base: https://huggingface.co/Auguments/Aureth-4B-Qwen3.5-Heretic
- Repositorio de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
