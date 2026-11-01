# HireTheRobots/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-MTP-MLX-3bit

## Resumen

Qwen3.8-27B Turbo-Brilliance 50X Reasoning-Instruct MTP MLX 3-bit es una conversión no oficial al formato MLX del modelo de razonamiento de 27.000 millones de parámetros publicado por DavidAU en formato GGUF. La desarrolla HireTheRobots, que se limita a convertir los pesos sin modificar el modelo original, con el objetivo de ofrecer una versión ejecutable en Apple Silicon mediante la librería mlx-vlm. Se trata de un fine-tune sobre la familia Qwen3.8 orientado a razonamiento extendido, con múltiples modos de inferencia (27 modos de razonamiento, 27 de instruct y 9 de tipo xhigh) controlados mediante etiquetas en el prompt.

El modelo conserva la torre de visión del Qwen3.8 original (pipeline image-text-to-text) y añade un cabezal MTP (multi-token prediction) extraído del GGUF original, empaquetado en bf16 como drafter independiente para decodificación especulativa. El repositorio ocupa 14,4 GB gracias a la cuantización afina de 3 bits con tamaño de grupo 64, manteniendo el `lm_head` en 8 bits para preservar la calidad de la capa de salida.

Es relevante porque permite ejecutar un modelo de 27B con capacidades de razonamiento y visión en equipos con 24 GB de memoria unificada, un umbral inalcanzable para las versiones de 4 bits o superiores del mismo modelo. No obstante, la cuantización agresiva introduce una degradación medible (perplejidad 3,08 frente a 2,15 del 8 bits) y el drafter MTP no aporta aceleración en este ancho de bits con la versión actual de mlx-vlm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.8) con cabezal MTP para decodificación especulativa; pesos en MLX |
| Parametros totales | 27.356.728.560 (27,36B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3-bit afina (group size 64) con `lm_head` en 8-bit; drafter MTP en bf16; torre de visión sin cuantizar |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), 14,4 GB en total |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.8, un transformer multimodal con torre de visión para entrada image-text-to-text. Sobre esa base, DavidAU aplica un fine-tune orientado a razonamiento que da lugar a los modos Turbo-Brilliance: 27 modos de razonamiento, 27 de instruct y 9 xhigh, seleccionables mediante etiquetas en el prompt y gestionados por la plantilla de chat. El modelo incorpora además un cabezal de predicción multi-token (MTP), presente en el GGUF original y reempaquetado aquí como drafter autónomo `qwen3_5_mtp` en bf16, que reutiliza los embeddings y la capa de salida del modelo principal.

La conversión de HireTheRobots no altera pesos ni plantilla: el `chat_template.jinja` es idéntico byte a byte al del GGUF, la torre de visión es bit a bit igual al `mmproj-BF16.gguf` y el tokenizador conserva vocabulario y merges. El script `conversion/gguf2mlx.py` se incluye para reproducir el proceso. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO en el fine-tune original.

## Capacidades

- Generación de texto y razonamiento extendido con modos conmutables (razonamiento, instruct y xhigh) mediante etiquetas en el prompt.
- Comprensión de imágenes: pipeline image-text-to-text con torre de visión sin cuantizar.
- Generación de código, con un modo `{REASON:coder}` documentado en los ejemplos de uso.
- Decodificación especulativa mediante drafter MTP propio, con tamaño de bloque configurable (3 en los ejemplos).
- Modo thinking activable con `--enable-thinking`.
- Sistema de ayuda interno accesible por prompt (`{REASON:help}`).
- Capacidades multilingües limitadas al inglés según la model card.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento asistido en local sobre Mac: el modelo permite ejecutar cadenas de razonamiento largas en un equipo de 24 GB de memoria unificada, seleccionando el modo xhigh para problemas que requieren profundidad y el modo instruct para respuestas directas.
- Generación de código en estación de trabajo Apple Silicon: con el modo `{REASON:coder}` se pueden resolver tareas como inversión de listas enlazadas o refactorizaciones, integrándolo en scripts de mlx-vlm sin depender de servicios en la nube.
- Análisis de imágenes con descripción textual: al conservar la torre de visión sin cuantizar, admite flujos de image-text-to-text como transcripción de diagramas o extracción de información de capturas.
- Prototipado de pipelines de decodificación especulativa: el repositorio incluye el drafter MTP separado y el script de conversión, lo que permite experimentar con bloques de borrador y medir aceptación cuando mlx-vlm añada soporte de verificación por lotes para 3 bits.
- Evaluación comparativa de cuantizaciones: al existir versiones de 3, 4, 5, 6 y 8 bits del mismo origen, sirve para estudiar el compromiso entre tamaño, perplejidad y velocidad en hardware Apple antes de fijar una configuración de producción.
- Investigación sobre fine-tunes de razonamiento: los 63 modos de comportamiento del modelo permiten estudiar cómo responde un mismo transformer a distintas instrucciones de sistema sin cambiar de pesos.
- Despliegue educativo o de demostración en portátiles: con 14,4 GB de pesos cabe en configuraciones de 24 GB y evita costes de GPU dedicada para pruebas de concepto.

## Benchmarks y rendimiento

Datos de calidad y velocidad publicados por el autor de la conversión (Apple M5 Pro 48 GB, mlx-vlm 0.7.10, 512 tokens greedy, bloque MTP 3):

| Metrica | 3-bit (este repo) | 4-bit | 5-bit | 6-bit | 8-bit |
|---|---|---|---|---|---|
| Tamano | 14,4 GB | 17,6 GB | 20,8 GB | 24,0 GB | 30,4 GB |
| Perplejidad (mix EN/Python ~4,5k tokens) | 3,08 | 2,37 | 2,19 | 2,15 | 2,15 |
| KL vs 8-bit | 0,451 | 0,170 | 0,045 | 0,014 | referencia |
| Mismo token top-1 que 8-bit | 79,6% | 89,5% | 93,9% | 96,8% | referencia |
| tok/s sin MTP | 21,2 | 17,4 | 14,6 | 11,9 | 8,8 |
| tok/s con MTP | 17,7 | 29,8 | 20,7 | 10,4 | 18,1 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: 14,4 GB de pesos; el autor indica que encaja en un Mac de 24 GB para contextos cortos.
- GPU recomendadas: Apple Silicon; las mediciones se hicieron en un M5 Pro de 48 GB. No se documentan GPU NVIDIA ni AMD.
- Cabe en GPU de consumo: solo en equipos Apple con memoria unificada suficiente (24 GB o más); no se contempla ejecución en tarjetas discretas con este formato.
- Opciones de despliegue: mlx-vlm (CLI `mlx_vlm.generate` y API Python `mlx_vlm.stream_generate`); requiere descarga previa del repositorio porque el drafter está en subcarpeta.
- Throughput: 21,2 tok/s sin drafter y 17,7 tok/s con drafter en el hardware de referencia; el MTP no acelera a 3 bits porque el kernel de verificación por lotes de mlx-vlm solo soporta 4, 5 y 8 bits.
- Latencia: no disponible de forma absoluta; solo se publican tasas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (3-bit MLX) | 27,36B | no disponible | safetensors MLX | apache-2.0 | Perplejidad 3,08; 21,2 tok/s sin MTP |
| Qwen3.8-27B Turbo-Brilliance MLX 4-bit (HireTheRobots) | 27,36B | no disponible | safetensors MLX | apache-2.0 | Perplejidad 2,37; 29,8 tok/s con MTP; requiere 32 GB |
| Qwen3.8-27B Turbo-Brilliance MLX 8-bit (HireTheRobots) | 27,36B | no disponible | safetensors MLX | apache-2.0 | Referencia de calidad; 30,4 GB; requiere 48 GB |
| Qwen3.8-27B Turbo-Brilliance NEO-MAX MTP GGUF (DavidAU) | 27,36B | no disponible | GGUF | apache-2.0 | Modelo base original; multiplataforma vía llama.cpp |

## Limitaciones y advertencias

- Cuantización agresiva: la perplejidad sube de 2,15 (8 bits) a 3,08 y solo el 79,6% de las posiciones coincide en token top-1 con la versión de 8 bits, lo que puede degradar tareas sensibles a matices.
- El drafter MTP no aporta velocidad a 3 bits con mlx-vlm 0.7.10; usarlo sin soporte de kernel por lotes reduce el throughput (17,7 frente a 21,2 tok/s). Se recomienda omitir los flags `--draft-*`.
- Conversión no oficial: si DavidAU publica una versión MLX o safetensors oficial, debe preferirse esa.
- Idiomas: solo inglés declarado; no hay evidencia de calidad en castellano.
- Contexto: no se documenta la longitud máxima soportada, lo que impide planificar despliegues con ventanas largas.
- Plataforma: exclusivo de Apple Silicon; no hay pesos GGUF ni safetensors estándar en este repositorio para otras plataformas.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas; los modos de razonamiento extendido pueden producir cadenas largas con afirmaciones no verificadas.
- Licencia apache-2.0 permite uso comercial, pero la plantilla de chat conserva copyright de David Belton / DavidAU 2026; conviene revisar el encabezado del archivo antes de redistribuir.
- Adopción muy baja (92 descargas, 0 likes) y fecha de creación en 2026: no hay validación comunitaria independiente de los resultados publicados.

## Enlaces

- HuggingFace: https://huggingface.co/HireTheRobots/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-MTP-MLX-3bit
- Modelo base (GGUF de DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF
- Versión 4-bit: https://huggingface.co/HireTheRobots/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-MTP-MLX-4bit
- Versión 5-bit: https://huggingface.co/HireTheRobots/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-MTP-MLX-5bit
- Versión 6-bit: https://huggingface.co/HireTheRobots/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-MTP-MLX-6bit
- Versión 8-bit: https://huggingface.co/HireTheRobots/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-MTP-MLX-8bit
- Discusión sobre la petición de versión MLX (#4): https://huggingface.co/DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF/discussions/4
- Discusión sobre la petición de versión MLX (#22): https://huggingface.co/DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF/discussions/22
- Perfil del autor del modelo original: https://huggingface.co/DavidAU
- Apoyo al autor original: https://www.buymeacoffee.com/davidbelton
