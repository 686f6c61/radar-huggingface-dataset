# nace-ai/Qwen3.8-27B-MLX-Q4-KQuant

## Resumen

Qwen3.8-27B-MLX-Q4-KQuant es una cuantización de 4 bits del modelo multimodal Qwen3.8-27B de Alibaba Qwen, empaquetada específicamente para su ejecución en Apple Silicon mediante el framework MLX. El pack lo publica el usuario nace-ai y contiene pesos safetensors en formato MLX, con un total de 27.356.728.560 parámetros (unos 27,36 mil millones) y un tamaño de repositorio de 37 GB. El modelo base es de tipo image-text-to-text, es decir, acepta entradas de imagen y texto y genera texto, y se distribuye bajo licencia Apache 2.0.

La relevancia de esta ficha concreta no está en el modelo base, sino en el proceso de cuantización: el autor afirma que su variante Q4 queda un 1,5× más cerca del modelo original en BF16 que la cuantización de 4 bits de mlx-community, medida como divergencia KL (0,035 frente a 0,054) con el mismo tamaño de pesos del modelo de lenguaje (15,13 GB). El repositorio incluye dos checkpoints, Q4 (4 bits uniforme, 16,3 GB de descarga) y Q5 (precisión mixta 4/6/8 bits por tensor, unos 5,3 bits por peso, 20,7 GB), pensados para Macs con 32 GB y 48 GB de RAM respectivamente.

El modelo está orientado a inferencia local en Apple Silicon, con soporte de modo de razonamiento (thinking), tool calling, entrada de imágenes y APIs compatibles con OpenAI, Anthropic y Ollama a través del motor Kapitsa del propio autor, además de mlx-lm y LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); familia Qwen3.5 según el tag `qwen3_5`; detalles internos no disponibles |
| Parametros totales | 27.356.728.560 (≈27,36 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4 (4 bits uniforme) y Q5 (precisión mixta 4/6/8 bits por tensor, ≈5,3 bits por peso, 5,8 contando escalas); formato MLX |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería `mlx`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen3.8-27B en la documentación proporcionada: no se detalla si es un transformer denso, híbrido o MoE, ni el número de tokens de entrenamiento, la composición del dataset o si hubo fases de RLHF/DPO. Los tags del repositorio apuntan a la familia `qwen3_5` y a la pipeline `image-text-to-text`, lo que confirma capacidad multimodal de entrada (imagen y texto), pero no se especifican los detalles del codificador visual ni del proyector multimodal.

La innovación documentada de este pack es exclusivamente la cuantización. El checkpoint Q4 aplica 4 bits uniformes y ocupa 15,13 GB de pesos del modelo de lenguaje, con una divergencia KL frente a BF16 de 0,035. El checkpoint Q5 usa precisión mixta por tensor (4, 6 y 8 bits según el tensor), lo que resulta en unos 5,3 bits por peso y una KL de 0,022. El autor publica una comparativa gráfica de KL frente a tamaño de archivo incluyendo packs de lmstudio-community, mlx-community y mlx-works, situando sus dos variantes por debajo en divergencia para tamaños comparables. No se documentan técnicas adicionales como decodificación especulativa, atención lineal ni destilación.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento explícito en modo thinking, activado por defecto; la salida de razonamiento se devuelve en el campo `reasoning_content` en la API de Kapitsa.
- Control de profundidad de razonamiento mediante `reasoning_effort` con los valores `low`, `medium` y `xhigh`, y desactivación del thinking con `reasoning_effort: "none"` o `enable_thinking: false`.
- Tool calling / function calling: verificado por el autor el 12 de noviembre de 2026 tanto en `mlx_lm.server` como en LM Studio.
- Comprensión de imágenes: entrada mediante partes `image_url` de OpenAI, con URL http(s) o data URL en base64; verificado en LM Studio (lectura de imagen).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Servido mediante APIs compatibles con OpenAI, Anthropic y Ollama a través de Kapitsa.
- Ajuste de muestreo documentado: temperatura 1,0 / top_p 0,95 / top_k 20 / presence_penalty 0,0 con thinking; temperatura 0,7 / top_p 0,8 / top_k 20 / presence_penalty 1,5 sin thinking.

## Casos de uso

- Asistente conversacional local en Mac: con 16,3 GB de descarga, el pack Q4 encaja en equipos de 32 GB de RAM o más y permite mantener conversaciones multi-turno sin conexión a servicios en la nube, usando Kapitsa o `mlx_lm.server` como backend compatible con OpenAI.
- Automatización de agentes con tool calling: el modelo puede invocar funciones a través de la API compatible con OpenAI, lo que permite integrarlo en flujos de agentes que consulten APIs externas, bases de datos o sistemas de ficheros locales desde un Mac.
- Análisis de imágenes en local: la entrada multimodal `image_url` permite tareas como descripción de imágenes, extracción de información de capturas o clasificación visual sin enviar los datos a terceros, útil en entornos con requisitos de privacidad.
- Razonamiento matemático con control de coste: el modo thinking con `reasoning_effort` ajustable permite usar razonamiento profundo para problemas complejos y desactivarlo para consultas simples, reduciendo latencia y consumo en el mismo despliegue.
- Prototipado e investigación en Apple Silicon: investigadores que necesiten evaluar el comportamiento de un modelo de 27B multimodal en MLX pueden usar este pack como referencia de cuantización de alta fidelidad (KL 0,035 frente a BF16) sin disponer de GPUs dedicadas.
- Sustitución de API en desarrollo de aplicaciones: al exponer endpoints compatibles con OpenAI, Anthropic y Ollama, el modelo sirve como reemplazo local en fases de desarrollo y pruebas de aplicaciones que posteriormente usarán APIs en la nube, evitando costes de tokens durante la iteración.
- Despliegue de chat privado en equipo de trabajo: `kapitsa serve --model 27b:q4 --private` levanta una página de chat y API en `127.0.0.1:8000`, adecuado para uso interno en una estación de trabajo con datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento publicado es la fidelidad de la cuantización respecto al modelo en BF16:

| Checkpoint | Bits | Tamano de descarga | Pesos del modelo de lenguaje | KL frente a BF16 (menor es mejor) | RAM recomendada |
|---|---|---|---|---|---|
| Q4 | 4 bits uniforme | 16,3 GB | 15,13 GB | 0,035 | 32 GB+ |
| Q5 | 4/6/8 bits mixto (≈5,3 bits/peso) | 20,7 GB | no disponible | 0,022 | 48 GB+ |
| mlx-community 4-bit (referencia) | 4 bits | no disponible | 15,13 GB | 0,054 | no disponible |

## Requisitos de hardware

- VRAM/RAM unificada: el pack Q4 requiere 32 GB o más de RAM en Mac (regla aproximada del autor: dos tercios de la RAM disponibles para GPU, más 2 GB para la conversación); el Q5 requiere 48 GB o más.
- GPU: exclusivamente Apple Silicon (MLX); no está pensado para GPUs NVIDIA o AMD.
- Cabe en equipos de consumo Apple: sí, en Macs con memoria unificada de 32 GB (Q4) o 48 GB (Q5); el autor indica que Kapitsa puede encajar en una talla menos al omitir partes no usadas, y `kapitsa doctor` verifica el equipo concreto.
- Opciones de despliegue: Kapitsa (motor propio del autor, instalable con `brew install nace-ai/tap/kapitsa`), `mlx-lm` 0.32.2 (CLI, Python y servidor OpenAI en el puerto 8080), LM Studio y cualquier runtime compatible con packs MLX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | KL frente a BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| nace-ai/Qwen3.8-27B-MLX Q4 | ≈27,36 B | no disponible | 4 bits MLX | 0,035 | Apache 2.0 | Hugging Face |
| nace-ai/Qwen3.8-27B-MLX Q5 | ≈27,36 B | no disponible | 4/6/8 bits MLX | 0,022 | Apache 2.0 | Hugging Face |
| mlx-community 4-bit (Qwen3.8-27B) | ≈27,36 B (mismo base) | no disponible | 4 bits MLX | 0,054 | Apache 2.0 (heredada) | Hugging Face |
| lmstudio-community 4-bit (Qwen3.8-27B) | ≈27,36 B (mismo base) | no disponible | 4 bits MLX | no disponible | Apache 2.0 (heredada) | Hugging Face |
| mlx-works oQ4e-mtp (Qwen3.8-27B) | ≈27,36 B (mismo base) | no disponible | 4 bits MLX | no disponible | Apache 2.0 (heredada) | Hugging Face |

Todos los comparables son cuantizaciones del mismo modelo base Qwen3.8-27B, por lo que las diferencias se limitan a la fidelidad de la cuantización y al tamaño de archivo.

## Limitaciones y advertencias

- Solo compatible con Apple Silicon y el framework MLX; no es desplegable en GPUs NVIDIA, AMD ni en CPU convencional sin conversión adicional.
- La comparativa de KL la publica el propio autor del pack; no se ha verificado de forma independiente en la información disponible.
- La regla de "Fits" es una aproximación del autor, no una medición; el consumo real depende del modelo concreto de Mac y del uso concurrente de memoria.
- El modo thinking está activado por defecto, lo que incrementa la latencia y el consumo de tokens si no se ajusta `reasoning_effort` o `enable_thinking`.
- Varias de las pruebas de inferencia citadas en la model card se realizaron originalmente sobre el pack de 9B y solo algunas se verificaron sobre este pack de 27B (chat y tool calling en mlx-lm y LM Studio); el resto de ejemplos no está verificado en este tamaño.
- No se dispone de información sobre sesgos, tasas de alucinación ni rendimiento en idiomas distintos del inglés; la ficha del modelo base no se incluye en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base Qwen3.8-27B y conviene verificar las condiciones del repositorio original.
- El repositorio tiene 2.163 descargas y 2 likes en el momento de la consulta, lo que indica una adopción limitada y poca validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-Q4-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Motor Kapitsa: https://github.com/nace-ai/kapitsa
- Instalación de Kapitsa vía Homebrew: `brew install nace-ai/tap/kapitsa`
- mlx-lm: https://github.com/ml-explore/mlx-lm
- Gráfica comparativa de KL (assets del repo): https://huggingface.co/nace-ai/Qwen3.8-27B-MLX/resolve/main/assets/nace-dark.svg
