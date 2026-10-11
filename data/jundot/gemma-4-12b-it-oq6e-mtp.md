# Jundot/gemma-4-12B-it-oQ6e-mtp

## Resumen

gemma-4-12B-it-oQ6e-mtp es un checkpoint cuantizado en formato MLX del modelo google/gemma-4-12B-it, desarrollado por el usuario Jundot. Se trata de una version mixta de precision del modelo Gemma 4 de 11,95B parametros de la familia "Unified" de Google DeepMind, que integra vision, audio y texto en un unico transformer decoder-only, sin encoders separados. La cuantizacion se ha realizado con oQ (oMLX v0.7.1), aplicando una cuantizacion de precision mixta guiada por sensibilidad de capas, con un promedio efectivo de 7,043 bits por peso.

El checkpoint anade, ademas, una cabeza de prediccion multi-token (MTP) fusionada desde google/gemma-4-12B-it-assistant, lo que permite decodificacion especulativa y aceleracion de la generacion. El modelo conserva la ventana de contexto de 256.000 tokens del modelo original y mantiene el pipeline any-to-any.

Es relevante porque ofrece una via para ejecutar un modelo multimodal de 12B con contexto muy largo en hardware Apple Silicon mediante el ecosistema MLX, reduciendo el peso de almacenamiento a aproximadamente 10,15 GiB. La licencia Apache-2.0, heredada del modelo fuente, facilita su uso comercial, aunque conviene revisar los terminos especificos de la licencia de Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal unificada (gemma4_unified), modelo base Gemma 4 |
| Parametros totales | 12.382.587.188 (~12,38B) |
| Longitud de contexto | 256.000 tokens (256K) |
| Tipos de cuantizacion | Precision mixta: affine 6-bit grupo 64, affine 8-bit grupo 64 y BF16 (7,043 bits/peso efectivos) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (licencia Gemma 4) |
| Formato de pesos | safetensors (MLX) |
| Libreria | mlx |
| Pipeline | any-to-any (texto, imagen, audio) |
| Modelo base | google/gemma-4-12B-it |
| Tamano del repositorio | 10,9 GB |
| Almacenamiento de pesos | 10,153 GiB |
| Parametros de la cabeza MTP | 0,423B (0,788 GiB) |

## Arquitectura y entrenamiento

Se trata de un modelo multimodal unificado de tipo decoder-only. No dispone de encoders independientes: los parches de imagen y las formas de onda de audio se proyectan directamente al espacio de embeddings mediante capas lineales ligeras, y todas las modalidades se procesan a traves de un unico transformer con una ventana de contexto de 256.000 tokens. La proyeccion de vision ocupa 0,015B de parametros y la de audio 0,002B, mientras que el backbone de lenguaje concentra 11,943B. La cabeza de prediccion multi-token (MTP) aporta 0,423B de parametros adicionales.

Este checkpoint no ha sido entrenado por el autor, sino cuantizado a partir de google/gemma-4-12B-it. El proceso, realizado con oQ (oMLX v0.7.1) e Improved oQe Quantization, asigna bits por sensibilidad medida de cada capa y redondea cada grupo con una matriz de importancia (128 muestras x 512 tokens) y un reajuste por minimos cuadrados ponderados de la escala y el sesgo. La distribucion resultante es: 86,720% de los pesos logicos (10,738B) en affine 6-bit grupo 64, 9,574% (1,186B) en affine 8-bit grupo 64 y 3,705% (0,459B) en BF16. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento con un contexto de hasta 256.000 tokens.
- Procesamiento multimodal any-to-any: entrada de texto, imagen y audio en un unico modelo.
- Decodificacion especulativa mediante la cabeza de prediccion multi-token (MTP) fusionada desde google/gemma-4-12B-it-assistant.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales: proyeccion directa de imagen y audio al espacio de embeddings, sin encoders separados.

## Casos de uso

- Asistentes multimodales en local: al integrar texto, imagen y audio en un unico transformer, el modelo puede gestionar conversaciones que combinen capturas de pantalla, fotos y voz sin pipeline adicional, ejecutandose en equipos Apple Silicon.
- Analisis de documentos largos: la ventana de 256.000 tokens permite procesar contratos, informes tecnicos o bases de codigo extensas en una sola pasada, manteniendo coherencia a lo largo de todo el contexto.
- Transcripcion y comprension de audio: la proyeccion de audio integrada permite resumir reuniones, generar actas o extraer acciones a partir de grabaciones, siempre que se confirme el soporte de idioma.
- Descripcion y razonamiento sobre imagenes: util para accesibilidad (descripcion automatica de contenido visual), moderacion de imagenes o extraccion de informacion de documentos escaneados.
- Generacion de codigo asistida en local: para equipos que necesitan privacidad y no pueden enviar codigo a la nube, el modelo puede integrarse en editores sobre MLX, aprovechando la decodificacion especulativa del MTP para reducir latencia.
- Prototipado de investigacion en multimodalidad: dado su caracter unificado, sirve como banco de pruebas para estudiar transferencia entre modalidades dentro de un mismo transformer.
- Inferencia en entornos sin GPU NVIDIA: al ser un checkpoint MLX, encaja en flujos de trabajo sobre Apple Silicon donde no se dispone de CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El checkpoint ocupa 10,153 GiB en disco (10,9 GB de repositorio); se recomienda disponer de al menos 12-14 GB de memoria unificada libre para la inferencia, mas el margen para el cache KV.
- Esta disenado para MLX, por lo que el hardware objetivo son equipos Apple Silicon (series M1, M2, M3, M4 y posteriores) con memoria unificada suficiente.
- En Macs con 16 GB de memoria unificada el modelo puede cargarse, aunque el margen para contexto largo sera limitado; con 24, 32 o 64 GB el contexto de 256.000 tokens resulta mas viable.
- GPU NVIDIA (A100, H100, RTX 4090): no disponible en la informacion proporcionada, ya que el formato es MLX y no CUDA.
- Opciones de despliegue: ecosistema MLX (mlx-lm, mlx-swift). Otros runtime como vLLM, llama.cpp, Ollama o TGI requeririan conversion previa, no disponible en la informacion proporcionada.
- Latencia y throughput estimados: no disponible en la informacion proporcionada. La cabeza MTP esta pensada para acelerar la generacion mediante decodificacion especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Jundot/gemma-4-12B-it-oQ6e-mtp | 12,38B | 256K | MLX safetensors (7,043 bits/peso) | Apache-2.0 | Cuantizacion mixta con cabeza MTP |
| google/gemma-4-12B-it | 11,95B (segun model card) | 256K | safetensors | Apache-2.0 | Modelo base sin cuantizar |
| google/gemma-4-12B-it-assistant | no disponible | no disponible | no disponible | no disponible | Origen de la cabeza MTP fusionada |

No se dispone de datos de rendimiento comparado ni de otras alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Al ser una cuantizacion, puede producirse una degradacion de calidad respecto al modelo base, especialmente en las capas cuantizadas a 6 bits, aunque el proceso se guia por sensibilidad para minimizarla.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se aportan evaluaciones de fidelidad en la informacion disponible.
- Idiomas soportados: no disponible, por lo que no puede confirmarse el comportamiento multilingue.
- El modelo esta en formato MLX; su uso queda ligado al ecosistema Apple, y no se documentan rutas de despliegue en CUDA.
- Uso comercial permitido bajo Apache-2.0, pero sujeto a la licencia especifica de Gemma 4, que conviene revisar antes de produccion.
- Estado de adopcion muy bajo: 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria.
- No se documentan limites de contexto efectivos, precision en tool calling ni comportamiento en tareas de agente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jundot/gemma-4-12B-it-oQ6e-mtp
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Modelo assistant (origen de la cabeza MTP): https://huggingface.co/google/gemma-4-12B-it-assistant
- Repositorio oMLX: https://github.com/jundot/omlx
- Pull request de Improved oQe Quantization: https://github.com/jundot/omlx/pull/4385
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
