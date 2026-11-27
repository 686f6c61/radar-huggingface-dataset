# FP8Enjoyer/Raon-1-mini-IQ4_NL-GGUF

## Resumen

Raon-1-mini-IQ4_NL-GGUF es una cuantización en formato GGUF del modelo base KRAFTON/Raon-1-mini, publicada por el usuario FP8Enjoyer. El modelo original es un transformer de tipo mixture-of-experts (MoE) desarrollado por KRAFTON, con 28.780 millones de parámetros totales y una arquitectura propietaria denominada `raon1` que incorpora componentes poco habituales como mezcla residual, gating de atención, control recurrente, convolución y parámetros de direccionamiento del esfuerzo de razonamiento. Esta versión cuantizada emplea el tipo IQ4_NL con una cobertura del 98,725 % de los tensores, un tamaño de archivo de 15,598 GiB y un BPW efectivo de 4,655.

La relevancia de esta publicación es doble. Por un lado, permite ejecutar un modelo MoE de casi 29.000 millones de parámetros en hardware de consumo (el autor generó la cuantización en una RTX 5070 Ti Laptop), algo inviable con los pesos originales en MXFP8 o BF16. Por otro, es una de las primeras cuantizaciones públicas del modelo Raon-1-mini, lo que la convierte en una referencia temprana para quienes quieran evaluar el modelo sin disponer de infraestructura de centro de datos.

No obstante, se trata de una publicación experimental: el propio autor advierte que la calidad de inferencia no ha sido verificada, que los pesos de los expertos enrutados se recuantizaron a partir de MXFP8 (no de los BF16 originales) y que se requiere un runtime compatible con la arquitectura `raon1`, disponible únicamente en el fork de llama.cpp mantenido por KRAFTON. La licencia es Apache 2.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (arquitectura `raon1`, según el autor) |
| Parametros totales | 28,78 mil millones (28.78B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_NL (esta publicación); el modelo base se distribuye en MXFP8/BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (IQ4_NL); el modelo base en safetensors MXFP8/BF16 |
| Tamano de archivo | 15,598 GiB |
| BPW efectivo | 4,655 |
| Cobertura de cuantizacion | 98,725 % |
| RMSE relativo de pesos | 0,075237 |
| Backend de cuantizacion | PyTorch CUDA personalizado |
| Hardware de conversion | NVIDIA RTX 5070 Ti Laptop GPU |
| Tiempo de conversion | 118,14 segundos |

## Arquitectura y entrenamiento

El modelo base Raon-1-mini es un transformer con mezcla de expertos (MoE) según la etiqueta `moe` de la model card. La arquitectura `raon1` incluye componentes que no son estándar en transformers convencionales: normalización, routing de expertos, mezcla residual (residual mixing), gating de atención, control recurrente, convolución y parámetros de direccionamiento del esfuerzo de razonamiento (*reasoning-effort steering*). El autor de la cuantización indica que todos estos componentes se preservan sin cuantizar, de modo que solo se cuantizan los pesos de las capas densas y de los expertos enrutados.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación. Tampoco se documenta en la información proporcionada ninguna innovación de decodificación (decodificación especulativa, atención lineal, etc.) más allá de los componentes arquitectónicos citados. La cuantización se generó con un cuantizador propio en PyTorch CUDA, partiendo del checkpoint público en MXFP8/BF16; los expertos enrutados se recuantizaron desde MXFP8, no desde los pesos BF16 originales, lo que puede introducir una degradación adicional respecto a una cuantización directa desde BF16.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`, por lo que el uso previsto es la generación autoregresiva de texto.
- Razonamiento: la arquitectura incluye parámetros de direccionamiento del esfuerzo de razonamiento (*reasoning-effort steering*), lo que sugiere soporte para modos de razonamiento con distinto nivel de esfuerzo, aunque no se detalla su funcionamiento.
- Mezcla de expertos: al ser un MoE, activa solo un subconjunto de parámetros por token, lo que reduce el coste computacional frente a un modelo denso del mismo tamaño.
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente, aunque el direccionamiento del esfuerzo de razonamiento apunta a ese tipo de uso.
- Visión, audio u otras modalidades: no disponible; el pipeline es exclusivamente de texto.
- Modo thinking: no confirmado en la información disponible.

## Casos de uso

- Evaluación local de modelos MoE de gran tamaño: la cuantización IQ4_NL de 15,6 GiB permite cargar un MoE de 28,78B en GPUs de consumo con 16-24 GB de VRAM, lo que facilita la experimentación sin infraestructura de centro de datos.
- Prototipado de aplicaciones de generación de texto: al ser un modelo de propósito general con pipeline `text-generation`, sirve para construir prototipos de asistentes conversacionales, resumen o redacción antes de migrar a los pesos completos.
- Investigación sobre cuantización: el paquete incluye métricas detalladas (cobertura del 98,725 %, BPW 4,655, RMSE 0,075237) que permiten estudiar el impacto de IQ4_NL sobre una arquitectura MoE con componentes no estándar.
- Pruebas de razonamiento con esfuerzo configurable: si el direccionamiento del esfuerzo de razonamiento funciona como se intuye, podría emplearse para comparar calidad y latencia en tareas de razonamiento con distintos niveles de esfuerzo.
- Despliegue en entornos con VRAM limitada: con 15,6 GiB de pesos, cabe en una RTX 4090 (24 GB) o en una RTX 5080/5070 Ti con margen para el contexto y la caché KV, siempre que el runtime `raon1` esté disponible.
- Validación de pipelines de cuantización: dado que el autor documenta verificación SHA256, contabilidad de tensores y verificación estructural GGUF, el artefacto puede usarse como caso de prueba para herramientas de cuantización y validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 15,6 GiB solo para los pesos en IQ4_NL; hay que sumar la caché KV y el overhead del runtime, por lo que en la práctica se recomienda un mínimo de 18-20 GB de VRAM para contextos moderados.
- GPU recomendadas: RTX 4090 (24 GB), RTX 5090 (32 GB), RTX 5080 (16 GB, al límite), RTX 5070 Ti (16 GB, al límite), A100 (40/80 GB), H100 (80 GB).
- Cabe en GPU de consumo: sí, en modelos con 16 GB o más de VRAM, aunque con margen ajustado en las de 16 GB; el autor generó la cuantización en una RTX 5070 Ti Laptop.
- Opciones de despliegue: llama.cpp, exclusivamente a través del fork de KRAFTON con soporte para la arquitectura `raon1` (rama `raon-1-mini`). No se garantiza compatibilidad con vLLM, TGI, Ollama u otros runtimes sin soporte explícito de `raon1`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Raon-1-mini-IQ4_NL (esta publicacion) | 28,78B (MoE) | no disponible | GGUF IQ4_NL, 15,598 GiB | Apache 2.0 | Hugging Face, requiere runtime `raon1` |
| KRAFTON/Raon-1-mini (modelo base) | 28,78B (MoE) | no disponible | MXFP8/BF16 | Apache 2.0 | Hugging Face, runtime `raon1` |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (MoE de ~29B) en la documentación proporcionada, por lo que la comparativa se limita al modelo base y a la ausencia de datos sobre alternativas.

## Limitaciones y advertencias

- Calidad de inferencia no verificada: el propio autor indica que la calidad no ha sido validada; es una publicación experimental.
- Recuantización desde MXFP8: los pesos de los expertos enrutados se obtuvieron de la versión MXFP8, no de los BF16 originales, lo que puede acumular error respecto a una cuantización directa desde BF16.
- RMSE relativo de 0,075237: indica una desviación no trivial en los pesos cuantizados; conviene validar la salida en tareas sensibles antes de usarla en producción.
- Dependencia de runtime no estándar: requiere un fork específico de llama.cpp con soporte para `raon1`; no funciona en herramientas estándar sin ese soporte.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingüe adecuado sin evaluación previa.
- Contexto no documentado: se desconoce la longitud máxima de contexto, lo que limita la planificación de aplicaciones con ventanas largas.
- Riesgo de alucinación: no evaluado; al no haber benchmarks ni validación de calidad, el riesgo es desconocido y debe asumirse como presente.
- Sesgos conocidos: no documentados.
- Licencia Apache 2.0: permite uso comercial, pero al derivar del modelo base de KRAFTON conviene revisar los términos del modelo original y atribuir correctamente.
- Sin descargas ni likes en el momento de la ficha: publicación muy reciente y sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face de la cuantización: https://huggingface.co/FP8Enjoyer/Raon-1-mini-IQ4_NL-GGUF
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini
- Fork de llama.cpp de KRAFTON con soporte `raon1`: https://github.com/krafton-ai/llama.cpp/tree/raon-1-mini
