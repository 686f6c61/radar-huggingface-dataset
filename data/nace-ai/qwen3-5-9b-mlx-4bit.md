# nace-ai/Qwen3.5-9B-MLX-4bit

## Resumen

Qwen3.5-9B-MLX-4bit es una cuantización de 4 bits en formato MLX del modelo Qwen/Qwen3.5-9B, publicada por el usuario nace-ai. El modelo base es un transformer multimodal de la familia Qwen3.5 desarrollado por Alibaba Qwen, con aproximadamente 9.400 millones de parámetros totales (9.409.813.744 según los safetensors del repositorio) y capacidad de entrada imagen-texto según el pipeline declarado (image-text-to-text). Esta versión concreta no es un modelo nuevo, sino un empaquetado optimizado para Apple Silicon mediante la librería MLX.

La relevancia de este repositorio radica en su enfoque en la fidelidad respecto al modelo original en BF16. El autor publica métricas de divergencia KL y de acuerdo de token superior frente a otros empaquetados públicos de 4 bits, situando su pack en un KL de 0,036619 con un 92,41% de acuerdo de token superior, frente a los 0,080555 y 88,51% de los packs de lmstudio-community y mlx-community. Además, se distribuye con licencia Apache 2.0 y está pensado para ejecutarse en Macs con Apple Silicon mediante el motor de inferencia local Kapitsa de Nace.AI o mediante mlx-lm.

El modelo está orientado a inferencia local en hardware de Apple, con un tamaño de repositorio de 6,0 GB y una carga auditada del modelo de lenguaje de aproximadamente 5,04 GB excluyendo visión y MTP. La ficha del autor no proporciona información sobre la longitud de contexto, los idiomas soportados ni los datos de entrenamiento del modelo base, por lo que estos puntos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles de la arquitectura interna no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits en formato MLX (pack único de 4 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx) |

## Arquitectura y entrenamiento

El repositorio es una cuantización del modelo Qwen/Qwen3.5-9B, no un entrenamiento propio. La model card no describe la arquitectura interna del modelo base más allá de su carácter multimodal (pipeline image-text-to-text) y de la existencia de componentes de visión y MTP (multi-token prediction) que el autor excluye explícitamente del cómputo del payload auditado del modelo de lenguaje. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original.

La innovación técnica destacable de este repositorio es el proceso de cuantización y su evaluación. El autor mide la divergencia KL respecto a BF16 y el acuerdo de token superior sobre ventanas de 512 tokens, con 64 ventanas de evaluación, usando 40 ventanas de wikitext2, 12 de gsm8k_train_chat y 12 de humaneval, con remuestreo bootstrap de 4000 réplicas y semilla 469. Las mediciones se realizaron el 2026-11-11 con MLX CUDA sobre una GPU L40S, no sobre Metal de Apple. El pack de Nace ocupa 5,950 GB de archivos de pesos (incluyendo pesos auxiliares) y mantiene un payload auditado del modelo de lenguaje de 5,038 GB, idéntico al de los packs de lmstudio-community y mlx-community, pero con menor divergencia KL.

## Capacidades

- Generación de texto conversacional, según el ejemplo de quickstart con mlx-lm y plantilla de chat.
- Procesamiento de entrada imagen-texto, según el pipeline declarado (image-text-to-text); la model card no detalla las capacidades de visión.
- Modo thinking y modo no-thinking, configurables mediante la plantilla de chat (enable_thinking).
- Generación de código: el autor incluye recomendaciones de muestreo específicas para código preciso en modo thinking y evalúa sobre humaneval.
- Razonamiento matemático: se evalúa sobre gsm8k_train_chat, lo que sugiere capacidad para tareas aritméticas y de razonamiento.
- Inferencia local en Apple Silicon mediante MLX y el motor Kapitsa.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede servirse con `kapitsa serve --model nace-ai/Qwen3.5-9B-MLX-4bit --private` y abrirse en la dirección local que imprime el servidor, lo que permite conversaciones multi-turno sin enviar datos a la nube; es adecuado por su licencia Apache 2.0 y su tamaño de 6,0 GB, manejable en Apple Silicon.
- Generación de código en el editor: con el preset de modo thinking para código preciso (temperatura 0,6, top_p 0,95, penalización de presencia 0) y la evaluación sobre humaneval, el modelo puede integrarse en flujos de autocompletado y revisión de código en local.
- Resolución de problemas matemáticos y aritméticos: la evaluación sobre gsm8k_train_chat respalda su uso en asistentes de cálculo paso a paso, con el modo thinking general (temperatura 1, top_p 0,95, penalización de presencia 1,5).
- Procesamiento de documentos con imágenes: al ser un modelo image-text-to-text, puede emplearse para extraer y describir información de capturas, diagramas o documentos escaneados; la model card no detalla la resolución ni el formato de imagen admitido.
- Prototipado e investigación en cuantización: el repositorio incluye datos reproducibles de KL y acuerdo de token, lo que lo convierte en una referencia útil para comparar técnicas de cuantización de 4 bits sobre el mismo modelo base.
- Despliegue de un asistente privado en estación de trabajo: la opción `--private` de Kapitsa y la ejecución totalmente local permiten usar el modelo en entornos con requisitos de confidencialidad, sin depender de APIs externas.
- Evaluación comparativa de empaquetados MLX: los datos de la model card permiten seleccionar entre packs de 4 bits según el compromiso entre tamaño (5,038 GB a 8,081 GB) y fidelidad (KL de 0,026 a 0,081).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí incluye métricas de fidelidad de cuantización frente a BF16, que se recogen a continuación.

| Pack | GB | KL (IC 95%) | Acuerdo de token superior |
|---|---:|---|---:|
| AtomicChat MLX-4bit | 5,038 | 0,080555 [0,073764, 0,087457] | 88,51% |
| Brooooooklyn UD-Q4_K_XL-mlx | 8,081 | 0,026063 [0,023768, 0,028317] | 93,56% |
| Nace (este repo) | 5,950 | 0,036619 [0,033267, 0,040221] | 92,41% |
| lmstudio-community MLX-4bit | 5,950 | 0,080555 [0,073764, 0,087457] | 88,51% |
| mlx-community 4bit | 5,950 | 0,081409 [0,074333, 0,088666] | 88,42% |
| mlx-community MLX-4bit | 5,950 | 0,081409 [0,074333, 0,088666] | 88,42% |
| mlx-community OptiQ-4bit | 8,013 | 0,029220 [0,026377, 0,032296] | 93,39% |
| mlx-works oQ4e-mtp | 6,231 | 0,042674 [0,038978, 0,046532] | 91,03% |

Condiciones de medición: 2026-11-11, MLX CUDA sobre L40S (no Apple Metal), 64 ventanas de 512 tokens, 4000 réplicas bootstrap, semilla 469. Menor KL y mayor acuerdo de token indican mayor cercanía al modelo BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 6,0 GB y los archivos de pesos descargados suman 5,950 GB, por lo que se necesita al menos ese espacio en memoria unificada, más overhead del motor.
- GPU recomendadas: el pack está diseñado para Apple Silicon (MLX). Las mediciones de la model card se realizaron sobre una NVIDIA L40S con MLX CUDA, lo que indica compatibilidad con GPU NVIDIA en ese entorno, aunque el uso previsto es Apple Silicon.
- Cabe en GPU de consumo: sí, en Macs con Apple Silicon con memoria unificada suficiente para alojar los ~6 GB del pack; no se especifican modelos concretos de Mac ni cantidades mínimas de memoria unificada.
- Opciones de despliegue: mlx-lm (versión 0.32.2 en el ejemplo) y Kapitsa (`kapitsa serve`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nace-ai/Qwen3.5-9B-MLX-4bit | 9.409.813.744 | no disponible | MLX 4 bits, 5,950 GB | Apache 2.0 | Hugging Face |
| lmstudio-community/Qwen3.5-9B-MLX-4bit | mismo modelo base | no disponible | MLX 4 bits, 5,950 GB | Apache 2.0 (heredada) | Hugging Face |
| mlx-community/Qwen3.5-9B-4bit | mismo modelo base | no disponible | MLX 4 bits, 5,950 GB | Apache 2.0 (heredada) | Hugging Face |
| Brooooooklyn/Qwen3.5-9B-UD-Q4_K_XL-mlx | mismo modelo base | no disponible | MLX 4 bits (UD-Q4_K_XL), 8,081 GB | Apache 2.0 (heredada) | Hugging Face |

En fidelidad frente a BF16, el pack de Nace (KL 0,036619) mejora a lmstudio-community y mlx-community (KL ~0,081) con el mismo tamaño de 5,950 GB, y queda por detrás de Brooooooklyn UD-Q4_K_XL (KL 0,026063) y mlx-community OptiQ-4bit (KL 0,029220), ambos de mayor tamaño (8,081 y 8,013 GB).

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada; al ser una cuantización, hereda los sesgos del modelo base Qwen3.5-9B, que no se documentan en esta ficha.
- Riesgo de alucinación: no cuantificado en la model card; la cuantización a 4 bits introduce divergencia respecto a BF16 (KL 0,036619, acuerdo de token 92,41%), lo que puede afectar a la fidelidad en generaciones largas.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están disponibles; no se debe asumir un contexto largo sin verificarlo en la ficha del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia y las condiciones del modelo base Qwen/Qwen3.5-9B, de la que este pack hereda obligaciones.
- El ejemplo de quickstart con mlx-lm ejecuta generación de texto no-thinking, no entrada de imagen; la CLI de mlx-lm no expone penalizaciones de presencia ni de repetición, por lo que los presets recomendados no se aplican por completo en esa ruta.
- Las métricas de KL y acuerdo de token se midieron con MLX CUDA sobre L40S, no sobre Metal de Apple; el rendimiento en Apple Silicon puede diferir.
- El autor recomienda un pack más reciente (nace-ai/Qwen3.5-9B-MLX, 5,29 GB, más cercano al original) frente a este de 4 bits.
- Los parámetros de muestreo recomendados proceden de las directrices del modelo base, no de mediciones nuevas de Nace.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Mejores prácticas del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B#best-practices
- Pack más reciente del autor: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX
- Otros tamaños del autor: https://huggingface.co/nace-ai/Qwen3.5-4B-MLX, https://huggingface.co/nace-ai/Qwen3.8-27B-MLX, https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX, https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX
- Motor Kapitsa: https://github.com/nace-ai/kapitsa
- Instalación de Kapitsa: https://github.com/nace-ai/kapitsa#install
- Nace.AI: https://www.nace.ai/
- mlx-lm: https://github.com/ml-explore/mlx-lm
- Instalación de uv: https://docs.astral.sh/uv/getting-started/installation/
- Packs comparados: https://huggingface.co/AtomicChat/Qwen3.5-9B-MLX-4bit, https://huggingface.co/Brooooooklyn/Qwen3.5-9B-UD-Q4_K_XL-mlx, https://huggingface.co/lmstudio-community/Qwen3.5-9B-MLX-4bit, https://huggingface.co/mlx-community (packs 4bit, MLX-4bit y OptiQ-4bit), https://huggingface.co/mlx-works (pack oQ4e-mtp)
