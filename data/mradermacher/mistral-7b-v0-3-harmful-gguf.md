# mradermacher/Mistral-7B-v0.3-Harmful-GGUF

## Resumen

Este repositorio contiene una cuantización en formato GGUF del modelo `sayandasscientistcoder/Mistral-7B-v0.3-Harmful`, realizada por el usuario `mradermacher`. El modelo base es un ajuste fino de Mistral-7B-v0.3, aunque no se proporcionan detalles sobre el proceso de ajuste ni sobre la naturaleza del término "Harmful" en su nombre. La cuantización estática incluye doce variantes de precisión, desde Q2_K hasta f16, lo que permite ejecutar el modelo en una amplia gama de hardware, desde equipos con pocos recursos hasta servidores de gama alta. El repositorio no incluye información sobre el entrenamiento, capacidades específicas ni benchmarks, por lo que esta ficha se limita a los datos disponibles en la model card y en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Mistral-7B-v0.3, sin confirmar) |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base ni sobre su proceso de entrenamiento. El nombre del repositorio indica que se trata de una cuantizacion de `Mistral-7B-v0.3-Harmful`, que a su vez se basa en Mistral-7B-v0.3, un modelo transformer decoder-only con atencion por ventana deslizante y atencion por grupos de consultas, pero estos datos no estan confirmados en la documentacion proporcionada. La cuantizacion fue realizada por `mradermacher` mediante un proceso estatico, sin uso de imatrix ni pesos ponderados, segun se indica en la model card.

## Capacidades

No se han publicado capacidades especificas en la informacion disponible. Al tratarse de un modelo de lenguaje, se espera que pueda realizar tareas de generacion de texto, pero no hay datos concretos sobre razonamiento, codigo, tool calling, agentes o capacidades multilingues. Se recomienda consultar el repositorio del modelo base para obtener mas detalles.

## Casos de uso

No se dispone de informacion sobre casos de uso concretos en la documentacion proporcionada. Dado que es una cuantizacion de un modelo de lenguaje, podria emplearse en tareas genericas de procesamiento de lenguaje natural, pero no hay ejemplos validados. Se sugiere revisar el modelo base `sayandasscientistcoder/Mistral-7B-v0.3-Harmful` para conocer sus aplicaciones previstas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Los requisitos de hardware dependen de la cuantizacion elegida. Segun los tamanos de archivo listados en la model card:

- Q2_K (2.8 GB): puede ejecutarse en GPUs con 4 GB de VRAM o menos, aunque con calidad reducida.
- Q4_K_M (4.5 GB): recomendado para GPUs con 6-8 GB de VRAM, como RTX 3060 o RTX 4060.
- Q5_K_M (5.2 GB): requiere al menos 8 GB de VRAM.
- Q6_K (6.0 GB) y Q8_0 (7.8 GB): necesitan 10-12 GB de VRAM, como RTX 3080/3090 o A10.
- f16 (14.6 GB): requiere 16 GB o mas de VRAM, como A100 o RTX 4090.

No se proporcionan datos oficiales de latencia ni throughput. Para inferencia, se pueden usar herramientas compatibles con GGUF como llama.cpp, Ollama o LM Studio. En entornos de produccion, vLLM o TGI tambien soportan GGUF, aunque suelen preferir formatos como safetensors.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Al ser una cuantizacion de Mistral-7B-v0.3, podria compararse con otras cuantizaciones del mismo modelo base, pero no hay datos de rendimiento ni de licencia para establecer una comparativa objetiva.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos, alucinaciones o limitaciones de contexto.
- El nombre del modelo incluye el termino "Harmful", lo que sugiere que podria estar entrenado para generar contenido danino o no seguro. Se recomienda extremar la precaucion antes de usarlo en cualquier aplicacion, especialmente en produccion.
- La licencia no esta especificada, por lo que se desconoce si permite uso comercial o modificacion.
- No se dispone de datos sobre el rendimiento en tareas especificas, por lo que no se puede garantizar su idoneidad para casos de uso concretos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Mistral-7B-v0.3-Harmful-GGUF
- Modelo base: https://huggingface.co/sayandasscientistcoder/Mistral-7B-v0.3-Harmful
- Pagina de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
