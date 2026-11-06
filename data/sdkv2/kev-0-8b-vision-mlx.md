# sdkv2/kev-0.8b-vision-mlx

## Resumen

Kev-0.8B-vision-mlx es una exportación para Apple Silicon del modelo Kev-0.8B, un modelo de decisión construido por Jared Palmer mediante LoRA y una cabeza pointer sobre Qwen3.5-0.8B-Base. A diferencia de un modelo generativo convencional, Kev no produce texto: recibe un estado compuesto por cadenas y fotogramas de vídeo y devuelve una probabilidad por cada opción de respuesta, en una única pasada forward. Esta versión concreta, publicada por el usuario sdkv2, fusiona el LoRA de Kev en los pesos base y añade la torre de visión del Qwen3.5 original, todo en formato MLX.

El modelo resuelve el problema de la toma de decisiones visuales de baja latencia en hardware de consumo Apple: con 852.985.920 parámetros totales y una ventana de contexto no especificada en la información disponible, evalúa opciones discretas sobre fotogramas codificados por la torre de visión del modelo base. La relevancia actual radica en su enfoque: en lugar de generar una respuesta textual y parsearla, la cabeza pointer convierte una pasada forward en una distribución de probabilidad sobre las opciones, lo que reduce la latencia y evita errores de formato.

La exportación está pensada para `mlx-vlm` y requiere Apple Silicon con Metal para un rendimiento óptimo. Incluye además un módulo de streaming visual (`MLXStream`) que mantiene estado entre fotogramas mediante atención recortada a sinks y ventana, con archivado y recuperación de claves/valores por puntuación query-key.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con torre de visión y backbone de lenguaje Qwen3.5 (Gated DeltaNet según notas del autor); cabeza pointer para clasificación sobre opciones |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp32 (exacto), bfloat16 (pesos redondeados una vez al cargar), bf16 con torre de visión en fp32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con `kev_head.safetensors` y `kev_config.json` para la cabeza pointer |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B-Base, un transformer multimodal con torre de visión propia y posiciones multimodales de 3 ejes (M-RoPE). Sobre ese backbone, Kev-0.8B añade un LoRA que toca únicamente el modelo de lenguaje y una cabeza pointer que transforma la representación de la última posición en una probabilidad por opción de respuesta. La torre de visión permanece intacta respecto al base, ya que Kev fue entrenado solo con texto; en esta exportación los fotogramas se codifican con la torre del base y sus features ocupan las posiciones de tokens de imagen, con las posiciones M-RoPE del base.

La exportación fusiona el LoRA en los pesos base (W + B·A·α/r en fp32) y escribe el resultado en el layout de `mlx-vlm`, con pesos de normalización centrados en cero almacenados como 1 + w y calculados en fp32. La cabeza pointer se guarda por separado en fp32 con su temperatura (2.351) y tokens especiales. Según el autor, no se trata de un nuevo fine-tune: es el mismo modelo de Kev más la visión del base, sin otros adaptadores. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Clasificación de opciones discretas: devuelve una probabilidad por cada opción de respuesta mediante una única pasada forward, sin generación de texto.
- Percepción visual sobre fotogramas: codifica imágenes (por ejemplo, 512 x 256 píxeles, 128 tokens de imagen) con la torre de visión del Qwen3.5 base.
- Razonamiento multi-step sobre estado: acepta una secuencia ordenada de cadenas y fotogramas como estado, con tantos elementos como se deseen.
- Streaming visual: `MLXStream` mantiene estado entre fotogramas con atención recortada a sinks más ventana, archiva claves/valores desalojados y los recupera por puntuación query-key.
- Decisiones sobre vídeo: soporta decisiones con 1 o 4 fotogramas según las pruebas de paridad del autor.
- No soporta generación de texto libre, tool calling ni function calling según la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Inspección visual en líneas de clasificación: el modelo evalúa qué objeto hay delante de una compuerta a partir de un fotograma, devolviendo la probabilidad de cada opción; adecuado por su latencia de 0,223 s por decisión en bf16 sobre M4.
- Agentes con memoria visual en streaming: `MLXStream` permite procesar secuencias de fotogramas con ventana de 256 tokens, archivando y recuperando estados anteriores, útil para seguimiento de marcas o muestras a lo largo de un vídeo.
- Control de calidad en producción con hardware Apple: al ejecutarse en MLX sobre Apple Silicon, puede desplegarse en estaciones de trabajo Mac sin GPU dedicada, con 0,231 s por decisión usando torre de visión en fp32.
- Toma de decisiones sobre estados mixtos texto-imagen: cualquier escenario donde el estado sea una secuencia de cadenas y fotogramas y la salida sea una elección entre opciones cerradas, como selección de la siguiente acción en un agente.
- Evaluación de opciones con requisito de reproducibilidad: la configuración fp32 ofrece paridad exacta con la referencia PyTorch (max |Δp| de 2,7e-5 en percepción), adecuada para validación y auditoría.
- Prototipado rápido en local: la instalación vía `mlx-vlm` y `snapshot_download` permite integrar el modelo en scripts Python sin infraestructura de servidor, con la dependencia de PyTorch limitada a la cabeza pointer y el tokenizador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí reporta medidas de velocidad y paridad con la referencia PyTorch:

| Configuración | s / decisión (Apple M4, 16 GB, 8-core GPU) |
|---|---|
| `dtype="bfloat16"` | 0,223 |
| `dtype="bfloat16", vision_dtype="float32"` | 0,231 |
| `dtype="float32"` | 0,282 |
| Streaming, bf16 (un paso de fotograma + pregunta) | 0,188 |
| PyTorch fp32 en CPU del M4 | 2,448 |

Paridad con la referencia PyTorch fp32 en CPU:

| Configuración | Llamadas | max \|Δp\| | mean \|Δp\| | Flips |
|---|---|---|---|---|
| fp32, percepción | 160 | 2,7e-5 | 4,1e-6 | 0 |
| fp32, decisiones de agente | 20 | 1,8e-5 | 5,3e-6 | 0 |
| fp32, streaming | 24 | 2,1e-5 | 7,7e-6 | 0 |
| bf16 + visión fp32, percepción | 160 | 0,025 | 0,0047 | 0 |
| bf16 + visión fp32, decisiones de agente | 20 | 0,0057 | 0,0030 | 0 |
| bf16, percepción | 160 | 0,073 | 0,0091 | 4 (márgenes de referencia 0,0045 a 0,10) |
| bf16, streaming | 24 | 0,039 | 0,0092 | 0 |

## Requisitos de hardware

- VRAM/unified memory estimada: el repo ocupa 3,4 GB en fp32; en bf16 los pesos se reducen aproximadamente a la mitad, aunque la información no detalla el consumo exacto en memoria.
- Hardware probado: Apple M4 con 16 GB de memoria unificada y GPU de 8 núcleos, macOS 27.0, mlx 0.32.4 y mlx-vlm 0.7.11.
- Cabe en hardware de consumo Apple Silicon; no se proporcionan datos para GPUs NVIDIA (A100, H100, RTX 4090) porque MLX está orientado a Apple Silicon.
- En Linux, MLX se ejecuta solo en CPU, sin Metal y sin kernel bf16 rápido, por lo que el rendimiento será muy inferior.
- Despliegue: `mlx-vlm` (versión 0.7.11), MLX 0.32.4, transformers 5.17.0, torch 2.8.0, torchvision, pillow y huggingface_hub; la dependencia de PyTorch se limita a la cabeza pointer y el tokenizador.
- Latencia: 0,188 a 0,282 s por decisión según configuración; throughput no disponible más allá de estas cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kev-0.8B-vision-mlx (este) | 852.985.920 | no disponible | Decisión por pointer head sobre opciones, visión MLX | Apache 2.0 | Hugging Face, MLX |
| jaredpalmer/kev-0.8b | no disponible | no disponible | Decisión por pointer head, solo texto | no disponible | Hugging Face |
| Qwen/Qwen3.5-0.8B-Base | no disponible | no disponible | Generación multimodal texto-imagen | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, solo probabilidades sobre opciones; no sirve para chat, tool calling ni generación de código.
- La torre de visión no fue entrenada por Kev, sino que proviene del base; en bf16 la torre concentra la mayor parte del error sobre fotogramas, con 4 flips en 160 llamadas de percepción y max |Δp| de 0,073.
- En streaming bf16, el ranking de recuperación más allá del primer fotograma archivado no es estable; se recomienda rankear en fp32 cuando el orden importe.
- En Linux, MLX solo corre en CPU sin Metal ni kernel bf16 rápido, lo que degrada gravemente la latencia.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la cabeza pointer puede asignar alta probabilidad a opciones incorrectas si el estado visual es ambiguo; los márgenes de referencia en los flips bf16 van de 0,0045 a 0,10.
- Idiomas soportados: no disponible.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B-Base y el Kev original deben verificarse por separado; la información no detalla restricciones adicionales.
- Dependencia de versiones muy concretas (`mlx-vlm==0.7.11`, `transformers==5.17.0`, `torch==2.8.0`) que pueden romper la reproducibilidad en el futuro.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sdkv2/kev-0.8b-vision-mlx
- Modelo base Kev-0.8B: https://huggingface.co/jaredpalmer/kev-0.8b
- Modelo base Qwen3.5-0.8B-Base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Repositorio kev (commit referenciado): https://github.com/jaredpalmer/kev
