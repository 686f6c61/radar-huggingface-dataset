# netprojects/SenseNova-Loop-9B-Preview-MLX-4bit

## Resumen

SenseNova-Loop-9B-Preview-MLX-4bit es una conversión a 4 bits en formato MLX del modelo SenseNova-Loop-9B-Preview, desarrollado originalmente por SenseNova/SenseTime y publicado el 30 de octubre de 2026. Esta versión concreta la distribuye NetProjects (Internet Projects Ltd), que no tiene relación con SenseTime, y está pensada para ejecutarse en Apple Silicon mediante la librería mlx-lm. El modelo base parte de Qwen3.5 e introduce dos modificaciones arquitectónicas: ejecución en bucle de capas con pesos compartidos y un mecanismo de dos flujos residuales denominado mHC.

El modelo tiene 8.956.949.376 parámetros y un tamaño de pesos de 5,1 GB en esta cuantización. La arquitectura es un transformer denso con bucle de capas: las capas 0-3 se ejecutan una vez, las capas 4-27 se ejecutan dos veces compartiendo pesos y las capas 28-31 una vez, lo que suma 56 pasadas de capa por token. Esto incrementa la profundidad efectiva sin aumentar el número de parámetros, a costa de mayor coste computacional por token.

La relevancia de esta ficha radica en que es la variante más pequeña y ligera del modelo, útil para prototipado y despliegue en equipos con memoria limitada, pero con una fidelidad menor respecto a la referencia en PyTorch: solo coincide en el token superior el 89,2 % de las posiciones frente al 97,6 % de la versión de 8 bits. Para producción donde la calidad sea prioritaria, el autor recomienda las versiones de 6 u 8 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3.5 con bucle de capas (looped transformer) y dos flujos residuales mHC |
| Parametros totales | 8.956.949.376 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín (affine), tamaño de grupo 64; los 96 tensores de los routers mHC permanecen en float32 sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx-lm) |

## Arquitectura y entrenamiento

El modelo es un transformer denso derivado de Qwen3.5 con dos añadidos. El primero es la ejecución en bucle: las capas 0-3 se ejecutan una vez, las capas 4-27 se ejecutan dos veces con pesos compartidos y las capas 28-31 una vez, totalizando 56 pasadas de capa por token. Cada pasada dispone de su propia ranura de caché: caché KV para la atención completa y estado convolucional y recurrente para Gated DeltaNet. El segundo añadido es el mecanismo mHC de dos flujos en las capas 4-27: el estado oculto se divide en dos flujos residuales enrutados por routers en float32 (compuertas pre y post y una matriz de mezcla Sinkhorn 2×2 con 20 iteraciones). Los 96 tensores de router se mantienen en float32 y nunca se cuantizan.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada. La model card solo indica que el modelo base fue publicado por SenseNova el 30 de octubre de 2026 y que esta conversión se realizó sobre la revisión `9937e91`. La implementación MLX se incluye en el repositorio como `sensenova_loop.py` y se carga mediante mlx-lm con `trust_remote_code=True`; el código fuente, el conversor y los scripts de paridad y benchmark están en el repositorio de GitHub del autor de la conversión.

## Capacidades

- Generación de texto conversacional y de propósito general, con plantilla de chat de Qwen.
- Modo de razonamiento (thinking mode) activable mediante `enable_thinking=True`.
- No incluye entrada de imagen en esta versión: el autor indica explícitamente que el modelo es solo de texto y que la entrada de imagen no forma parte de esta build.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Decodificación MTP (multi-token prediction): no disponible en esta versión Preview; sí está presente en la release final SenseNova-Loop-9B según el autor.

## Casos de uso

- Prototipado rápido en Mac con Apple Silicon: el modelo cabe en 5,1 GB y se ejecuta con mlx-lm en un MacBook Pro M5 Max a unos 22 tokens/s, lo que permite iterar sobre prompts y plantillas de chat sin infraestructura GPU dedicada.
- Asistentes conversacionales locales: al ser un modelo de texto con plantilla de chat y modo thinking opcional, puede emplearse para construir un asistente de escritorio o CLI que funcione íntegramente en local, sin enviar datos a servicios externos.
- Evaluación de la arquitectura looped: investigadores que quieran estudiar el efecto del bucle de capas y del mecanismo mHC pueden usar esta build ligera para experimentos comparativos frente a la referencia en PyTorch, aceptando la menor fidelidad a cambio de velocidad de iteración.
- Generación de texto en pipelines de CI o scripts: con `mlx_lm.server` se puede levantar un endpoint HTTP local y consumirlo desde tests o herramientas internas para tareas de generación de texto de baja criticidad.
- Educación y demos: el tamaño reducido y la licencia Apache 2.0 permiten incluirlo en talleres, notebooks y demos sobre cuantización y arquitecturas experimentales sin coste de licencia.
- Filtrado y clasificación de texto ligera: para tareas de resumen corto, reescritura o generación de respuestas a partir de contexto moderado, siempre que se valide la calidad frente a la versión de 6 u 8 bits.
- Base para ajuste fino en local: al ser pesos MLX cuantizados a 4 bits, no es la opción ideal para fine-tuning; se recomendaría partir del bf16 o del modelo base original para entrenamiento.

## Benchmarks y rendimiento

Datos publicados por el autor de la conversión, medidos en un MacBook Pro M5 Max con 128 GB el 7 de noviembre de 2026.

Paridad con el código PyTorch de referencia de SenseNova (Transformers 5.18, bf16) sobre 16 prompts, en todas las posiciones:

| Metrica | 8-bit | 6-bit | 4-bit |
|---|---|---|---|
| Mismo token superior que la referencia | 97,6 % | 97,2 % | 89,2 % |
| Divergencia KL en el último token | 0,0011 | 0,0037 | 0,064 |
| Tamaño | 9,6 GB | 7,3 GB | 5,1 GB |

Benchmark público corto (mismo arnés para todas las builds; primeras 300 preguntas del test de ARC-Challenge con log-likelihood sobre las 4 opciones; primeras 50 preguntas del test de GSM8K, plantilla de chat, thinking desactivado, greedy):

| Metrica | bf16 | 8-bit | 6-bit | 4-bit |
|---|---|---|---|---|
| ARC-Challenge acc / acc_norm | 48,7 / 51,0 | 48,7 / 50,3 | 47,7 / 49,0 | 45,7 / 45,0 |
| GSM8K (50 preguntas) | no disponible | 94,0 | 88,0 | 92,0 |

El autor advierte que en GSM8K sobre 50 preguntas cada pregunta mueve 2 puntos porcentuales, por lo que la diferencia entre 88 y 92 no es estadísticamente significativa. Velocidad de decodificación de esta build: aproximadamente 22 tokens/s en el M5 Max en una ejecución corta; el bucle duplica el trabajo de las 24 capas centrales, por lo que es más lento que un modelo denso de 9B sin bucle.

## Requisitos de hardware

- VRAM/memoria unificada estimada para inferencia: 5,1 GB de pesos más la caché KV y el estado recurrente de las 56 pasadas de capa; el autor ejecuta la build en un MacBook Pro M5 Max con 128 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (M-series) es el objetivo de esta build por el uso de MLX; no está pensada para CUDA.
- Cabe en GPU de consumo: sí, en términos de tamaño de pesos, pero requiere Apple Silicon y mlx-lm; para GPUs NVIDIA conviene usar las builds del modelo base en otros formatos (no disponibles en esta información).
- Opciones de despliegue: mlx-lm 0.32 o superior con Python 3.11 o superior; servidor mediante `mlx_lm.server --model netprojects/SenseNova-Loop-9B-Preview-MLX-4bit --trust-remote-code`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta build.
- Latencia y throughput: aproximadamente 22 tokens/s de decodificación en M5 Max (ejecución corta). No se dispone de datos de latencia de prefill ni de throughput en batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| netprojects/SenseNova-Loop-9B-Preview-MLX-4bit (esta ficha) | 8,96 B | no disponible | MLX safetensors 4-bit | Apache 2.0 | 5,1 GB, 89,2 % de coincidencia con la referencia, ~22 tok/s en M5 Max |
| netprojects/SenseNova-Loop-9B-Preview-MLX-6bit | 8,96 B | no disponible | MLX safetensors 6-bit | Apache 2.0 | 7,3 GB, 97,2 % de coincidencia, recomendada por el autor |
| netprojects/SenseNova-Loop-9B-Preview-MLX-8bit | 8,96 B | no disponible | MLX safetensors 8-bit | Apache 2.0 | 9,6 GB, 97,6 % de coincidencia |
| sensenova/SenseNova-Loop-9B-Preview (modelo base) | 8,96 B | no disponible | PyTorch/Transformers | Apache 2.0 | Referencia en bf16, ejecutable con Transformers 5.18 |
| netprojects/SenseNova-Loop-9B-MLX-6bit (release final) | no disponible | no disponible | MLX safetensors 6-bit | Apache 2.0 | Incluye entrada de imagen y decodificación MTP (~1,7× más rápido), según el autor |

No se dispone de comparativas con modelos de otras familias (por ejemplo, Llama o Mistral de tamaño similar) en la información proporcionada.

## Limitaciones y advertencias

- Fidelidad reducida: solo coincide con la referencia en PyTorch en el 89,2 % de las posiciones (token superior) y la divergencia KL en el último token es de 0,064, muy superior a la de 6 y 8 bits. El propio autor desaconseja esta build cuando la calidad es prioritaria.
- Sin entrada de imagen: esta build es solo de texto; la entrada de imagen no está incluida.
- Sin decodificación MTP: la versión Preview no incorpora la decodificación multi-token prediction que sí aparece en la release final, por lo que es más lenta.
- Idiomas soportados no documentados: no hay información sobre cobertura multilingüe en la model card.
- Longitud de contexto no documentada: no se indica la ventana de contexto máxima.
- Sesgos y alucinaciones: no hay información específica en la model card; como modelo generativo de texto, es susceptible de alucinación y de reproducir sesgos presentes en sus datos de entrenamiento, que no se detallan.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser una conversión de pesos de un modelo de terceros conviene revisar también la licencia del modelo base original.
- Dependencia de Apple Silicon: requiere mlx-lm 0.32 o superior y Python 3.11 o superior; el Python del sistema en macOS (3.9) solo obtiene una versión antigua de mlx-lm que no puede cargar el modelo.
- No afiliación: NetProjects no está afiliado a SenseTime/SenseNova; los resultados de paridad y benchmark los publica el autor de la conversión, no el equipo original.
- Modelo Preview: el propio nombre indica que es una versión preliminar; el autor remite a la release final SenseNova-Loop-9B para uso con imagen y MTP.

## Enlaces

- Hugging Face (esta build): https://huggingface.co/netprojects/SenseNova-Loop-9B-Preview-MLX-4bit
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview
- Release final del modelo: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Build 6-bit Preview: https://huggingface.co/netprojects/SenseNova-Loop-9B-Preview-MLX-6bit
- Build 8-bit Preview: https://huggingface.co/netprojects/SenseNova-Loop-9B-Preview-MLX-8bit
- Build 6-bit de la release final: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-6bit
- Build 8-bit de la release final: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-8bit
- Build 4-bit de la release final: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-4bit
- Build bf16 de la release final: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-bf16
- SenseNova 6.8 Code2Video MLX 6-bit: https://huggingface.co/netprojects/SenseNova-6.8-Code2Video-MLX-6bit
- Repositorio de código, conversor y scripts: https://github.com/internet-projects/sensenova-loop-mlx
- Colección de builds MLX de NetProjects: https://huggingface.co/collections/netprojects/netprojects-mlx-builds-6ae3b2683a59a1b4fc4c0c3a
- Todos los modelos de NetProjects: https://huggingface.co/netprojects
- Sitio del autor de la conversión: https://netprojects.com
