# nace-ai/Qwen3.8-27B-MLX-KQuant

## Resumen

Qwen3.8-27B-MLX-KQuant es una cuantización de la familia Qwen3.5/3.8 (arquitectura `qwen3_5`) publicada por el usuario nace-ai para su ejecución en Apple Silicon mediante la librería MLX. El modelo base es Qwen/Qwen3.8-27B, un modelo multimodal de tipo image-text-to-text con 27.356.728.560 parámetros totales (unos 27,4 mil millones). El pack ofrece dos checkpoints cuantizados: Q4 uniforme de 4 bits (16,3 GB) y Q5 de precisión mixta 4/6/8 bits (~5,3 bits por peso, 20,7 GB).

El problema que resuelve es la brecha de calidad entre las cuantizaciones de 4 bits convencionales y el modelo original en BF16. Según la model card, el checkpoint Q4 de este pack queda un 1,5× más cerca del BF16 que el 4-bit de mlx-community (KL 0,035 frente a 0,054) con el mismo tamaño de pesos del modelo de lenguaje (15,13 GB). El Q5 reduce la divergencia a KL 0,022. Es relevante ahora porque permite ejecutar un modelo de 27B multimodal con razonamiento en Macs de 32 GB o 48 GB de RAM unificada, sin GPU dedicada.

El pack está pensado para el ecosistema MLX: se integra con mlx-lm, con LM Studio y con Kapitsa, el motor propio de Nace para modelos Qwen en macOS. La licencia es Apache 2.0, lo que facilita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (tag `qwen3_5`), familia Qwen3.5/3.8 |
| Parámetros totales | 27.356.728.560 (~27,4B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4 uniforme 4-bit; Q5 mixta 4/6/8-bit (~5,3 bits por peso, 5,8 contando escalas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con dos subcarpetas `Q4/` y `Q5/` |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-27B, identificado en los tags como arquitectura `qwen3_5` y con pipeline `image-text-to-text`, lo que implica un transformer multimodal capaz de procesar imágenes y texto. No se dispone de información sobre la composición del dataset de entrenamiento, el número de tokens, ni si se aplicaron fases de RLHF o DPO en el modelo base dentro de la información proporcionada.

La innovación destacable de este repositorio no está en el entrenamiento sino en la cuantización. El checkpoint Q4 es uniforme de 4 bits y ocupa 15,13 GB de pesos del modelo de lenguaje, idéntico al 4-bit de mlx-community, pero con menor divergencia respecto al BF16 (KL 0,035 frente a 0,054). El Q5 emplea precisión mixta por tensor (4, 6 y 8 bits) y alcanza KL 0,022. El pack está optimizado para Apple Silicon vía MLX, con soporte de decodificación con pensamiento activado por defecto y control de profundidad de razonamiento (`low`, `medium`, `xhigh`, `none`).

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo "thinking" activado por defecto, con profundidad configurable (`reasoning_effort`: `low`, `medium`, `xhigh`) y posibilidad de desactivarlo.
- Comprensión de imágenes (image-text-to-text): acepta imágenes como URL http(s) o data URL base64 en el formato `image_url` de OpenAI.
- Tool calling / function calling: verificado en el pack mediante `mlx_lm.server` y LM Studio.
- Matemáticas básicas y cálculo (el ejemplo de la model card usa 17 × 23).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Compatibilidad con APIs OpenAI, Anthropic y Ollama a través del motor Kapitsa.

## Casos de uso

- Asistente conversacional local en Mac: con 16,3 GB del checkpoint Q4 cabe en equipos de 32 GB de RAM unificada; se sirve con `kapitsa serve` o `mlx_lm.server` y ofrece una API compatible con OpenAI para integrarse en aplicaciones de escritorio.
- Análisis de imágenes en local: el modelo acepta imágenes por URL o base64 y responde preguntas sobre su contenido, útil para clasificación de capturas, extracción de información de documentos escaneados o accesibilidad, sin enviar datos a la nube.
- Automatización de agentes con tool calling: al colocar llamadas a herramientas de forma verificada en mlx-lm y LM Studio, puede integrarse en flujos de agente que consulten APIs externas o ejecuten acciones multi-paso.
- Razonamiento con coste controlado: el parámetro `reasoning_effort` permite usar `low` para respuestas rápidas en producción y `xhigh` para problemas complejos, ajustando latencia y calidad en el mismo despliegue.
- Desarrollo y prototipado en Apple Silicon: investigadores que trabajan en Mac pueden evaluar un modelo de 27B multimodal sin infraestructura GPU, usando Q4 en 32 GB o Q5 en 48 GB.
- Servicio de inferencia privado: `kapitsa serve --private` levanta un endpoint local en 127.0.0.1:8000, adecuado para entornos con requisitos de confidencialidad donde no se permite salida a internet.
- Generación de código y matemáticas asistidas: el modo thinking por defecto favorece tareas de razonamiento paso a paso, y puede desactivarse para autocompletado de baja latencia.

## Benchmarks y rendimiento

La model card no publica benchmarks estándar (MMLU, HumanEval, GSM8K). El único dato cuantitativo es la divergencia KL respecto al modelo BF16:

| Checkpoint | Bits | Tamaño descarga | KL a BF16 (menor es mejor) | RAM recomendada |
|---|---|---|---|---|
| Q4 | 4-bit uniforme | 16,3 GB | 0,035 | 32 GB+ |
| Q5 | 4/6/8-bit mixto (~5,3 bpw) | 20,7 GB | 0,022 | 48 GB+ |
| mlx-community 4-bit (referencia) | 4-bit | 15,13 GB (pesos LM) | 0,054 | no disponible |

No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM/RAM unificada: Q4 requiere 32 GB o más de RAM; Q5 requiere 48 GB o más. La cifra "Fits" de la model card es una regla heurística basada en que macOS asigna por defecto ~2/3 de la RAM a la GPU y se reservan 2 GB para la conversación.
- GPU: el pack está diseñado exclusivamente para Apple Silicon (MLX); no aplica a A100, H100 ni RTX 4090.
- Consumer GPU: no es compatible con GPUs NVIDIA o AMD; solo Macs con chip Apple (M-series).
- Despliegue: mlx-lm (`mlx_lm.generate`, `mlx_lm.server`), LM Studio, y Kapitsa (`brew install nace-ai/tap/kapitsa`). El comando `kapitsa doctor` comprueba si un Mac concreto puede ejecutar el modelo, y Kapitsa puede saltarse partes no usadas y caber en una talla menor de RAM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | KL a BF16 | Licencia | Plataforma |
|---|---|---|---|---|---|---|
| nace-ai/Qwen3.8-27B-MLX-KQuant Q4 | ~27,4B | no disponible | 4-bit | 0,035 | Apache 2.0 | Apple Silicon (MLX) |
| nace-ai/Qwen3.8-27B-MLX-KQuant Q5 | ~27,4B | no disponible | 4/6/8-bit mixto | 0,022 | Apache 2.0 | Apple Silicon (MLX) |
| mlx-community 4-bit (Qwen3.8-27B) | ~27,4B | no disponible | 4-bit | 0,054 | no disponible | Apple Silicon (MLX) |
| lmstudio-community 4-bit (Qwen3.8-27B) | ~27,4B | no disponible | 4-bit | no disponible | no disponible | Apple Silicon (MLX) |
| mlx-works oQ4e-mtp (Qwen3.8-27B) | ~27,4B | no disponible | 4-bit | no disponible | no disponible | Apple Silicon (MLX) |

Los tres packs rivales aparecen citados en la gráfica de la model card como alternativas públicas de MLX para el mismo modelo base. No se dispone de datos de rendimiento en tareas para ninguno de ellos.

## Limitaciones y advertencias

- Exclusivo de Apple Silicon: requiere MLX y un Mac con chip Apple; no es desplegable en GPUs NVIDIA, AMD ni en servidores x86 convencionales.
- Idiomas soportados no documentados: la model card no especifica la cobertura lingüística, por lo que no se puede garantizar calidad en castellano u otros idiomas sin evaluación propia.
- Longitud de contexto no disponible: no se indica la ventana de contexto del modelo base ni del pack, lo que impide planificar casos de uso con documentos largos.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad ni de tasas de alucinación.
- Sesgos: no se documentan sesgos conocidos ni medidas de mitigación en la información disponible.
- Verificación parcial: la model card indica que los ejemplos de inferencia se probaron originalmente en el pack de 9B; en este pack de 27B solo se verificaron chat y tool calling con mlx-lm 0.32.2 y LM Studio el 12 de noviembre de 2026.
- El modo thinking está activado por defecto, lo que incrementa el consumo de tokens y la latencia si no se configura `reasoning_effort: none`.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen/Qwen3.8-27B por si añaden restricciones adicionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Motor Kapitsa: https://github.com/nace-ai/kapitsa
- Instalación de Kapitsa vía Homebrew: `brew install nace-ai/tap/kapitsa`
- Documentación de mlx-lm: https://github.com/ml-explore/mlx-lm
- Imagen de ejemplo usada en la model card: https://upload.wikimedia.org/wikipedia/commons/3/3a/Cat03.jpg
