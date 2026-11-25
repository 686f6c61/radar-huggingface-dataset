# pipenetwork/Inkling-2-Mini-MLX-4bit

## Resumen

Inkling-2-Mini-MLX-4bit es una conversión a formato MLX del modelo thinkingmachines/Inkling-2-Mini, publicada por el usuario pipenetwork. Se trata de una cuantización de 4 bits orientada a la inferencia en hardware Apple Silicon mediante la librería MLX, no de un modelo entrenado desde cero. El checkpoint conserva la arquitectura Mixture-of-Experts (MoE) del modelo original, con los expertos enrutados en formato nativo NVFP4 y las capas de atención, embeddings y densas cuantizadas a 4 bits afines con tamaño de grupo 64.

El modelo es multimodal (pipeline image-text-to-text) y está pensado para generación conversacional con entrada de imagen y texto. Cuenta con aproximadamente 26.400 millones de parámetros totales, según los pesos en safetensors, y el repositorio ocupa 17,3 GB. La licencia es Apache 2.0, heredada del modelo base.

Su relevancia es práctica: permite ejecutar en Mac con memoria unificada un modelo MoE multimodal de tamaño medio-alto sin necesidad de GPUs dedicadas. La conversión depende de una pull request aún no fusionada en mlx-lm (ml-explore/mlx-lm#2086), por lo que las versiones publicadas hasta 0.32.2 no cargan el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal, transformer; tag `inkling2_loop` |
| Parametros totales | 26.388.559.360 (~26,4 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (afín, grupo 64) en atención, embeddings y capas densas; expertos enrutados en NVFP4 nativo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea una arquitectura Mixture-of-Experts con un componente multimodal (torre de visión más modelo de lenguaje), tal como indica el pipeline image-text-to-text y la etiqueta `moe`. El tag `inkling2_loop` sugiere el uso de capas recurrentes o de bucle en la arquitectura, aunque la información disponible no detalla su funcionamiento interno.

Esta variante no incluye entrenamiento propio: es una conversión de pesos. Los expertos enrutados mantienen los pesos NVFP4 del checkpoint original, mientras que las capas de atención, embeddings y densas se recuantizan a 4 bits afines con grupo de 64. La conversión se realizó con mlx-lm a partir de la pull request ml-explore/mlx-lm#2086. No se dispone de datos sobre tokens de entrenamiento, composición del dataset ni fases de alineación (RLHF/DPO) del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de entrada imagen-texto (image-text-to-text); la torre de visión no fue probada en esta conversión según el autor.
- Razonamiento y generación de código: no confirmado explícitamente en la información disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado local en Mac: ejecutar un MoE multimodal de ~26 mil millones de parámetros en Apple Silicon con memoria unificada mediante MLX, útil para desarrolladores que quieren validar flujos multimodales sin GPU dedicada.
- Asistentes conversacionales de escritorio: integrar el modelo en aplicaciones macOS nativas usando mlx-lm para conversaciones multi-turno con entrada de imagen, aprovechando el formato optimizado para Metal.
- Experimentación académica con cuantización: estudiar el impacto de recuantizar capas de atención y densas a 4 bits manteniendo expertos en NVFP4, comparando calidad frente al checkpoint original.
- Evaluación de pipelines imagen-texto: probar flujos de descripción de imágenes o VQA en local, con la advertencia de que la torre de visión no fue validada por el autor.
- Pruebas de integración continua de MLX: usar el modelo como caso de prueba para la pull request mlx-lm#2086 y validar compatibilidad de futuras versiones de la librería.
- Demos y talleres offline: desplegar una demo de modelo multimodal sin conexión ni infraestructura cloud, dado el tamaño manejable del repositorio (17,3 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 17,3 GB en 4 bits; se recomienda al menos 24 GB de memoria unificada para cargar pesos y trabajar con margen, y 32 GB o más para contextos largos.
- Hardware objetivo: Apple Silicon (M1/M2/M3/M4 y variantes Pro/Max/Ultra) con Metal; no está pensado para CUDA.
- GPU dedicadas (A100, H100, RTX 4090): no aplicable, al ser un formato MLX.
- Despliegue: mlx-lm (requiere instalar desde la pull request ml-explore/mlx-lm#2086); no compatible con vLLM, TGI ni llama.cpp en este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-MLX-4bit | ~26,4 mil millones | no disponible | MLX safetensors 4 bits | Apache 2.0 | Conversion comunitaria, vision no probada |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | safetensors original | Apache 2.0 | Modelo base oficial |
| Alternativas MoE multimodales de tamano similar | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada |

## Limitaciones y advertencias

- La torre de visión no fue probada por el autor; el soporte imagen-texto no está validado en esta conversión.
- Requiere una versión de mlx-lm instalada desde una pull request no fusionada; las versiones publicadas hasta 0.32.2 no cargan el modelo.
- Solo funciona en hardware Apple Silicon con MLX; no es portable a CUDA ni a otros runtimes sin reconversión.
- La cuantización a 4 bits de atención, embeddings y capas densas puede degradar la calidad frente al checkpoint original; no se han publicado evaluaciones comparativas.
- No hay información sobre sesgos, riesgo de alucinación, idiomas soportados ni longitud de contexto.
- El número de parámetros activos del MoE no está disponible, lo que impide estimar con precisión el coste computacional por token.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base antes de un uso comercial en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pipenetwork/Inkling-2-Mini-MLX-4bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Pull request de mlx-lm: https://github.com/ml-explore/mlx-lm/pull/2086
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-lm
