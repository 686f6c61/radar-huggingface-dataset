# laewr/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-MLX-4bit

## Resumen

`laewr/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-MLX-4bit` es una conversión a formato MLX y cuantización a 4 bits del checkpoint `xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic`, pensada para ejecución local en Apple Silicon. No se trata de un modelo nuevo: los pesos, el proceso de destilación y la abliteración son idénticos a los del checkpoint original; lo que cambia es el contenedor (safetensors MLX en un único fichero), la precisión (BF16 a 4 bits afines con group size 64) y la eliminación de la torre de visión.

El linaje arranca en `Qwen/Qwen3.5-9B-Base`, pasa por el fine-tune de razonamiento `Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B` (destilado de salidas de DeepSeek-V4-Pro en modo "Max Effect", con unos 250 000 ejemplos de matemáticas y STEM, SFT y una etapa ligera de RL con GSPO) y llega al checkpoint "heretic", decensurado mediante Heretic v2 con ablación de rango arbitrario sobre las capas 9 a 24. Esta conversión añade la capa final de cuantización para MLX.

Su relevancia es doble: por un lado, ofrece un modelo denso de 9B con contexto nativo de 262 144 tokens en un paquete de 5,04 GB que cabe en memoria unificada de un Mac; por otro, es la única build MLX de este checkpoint abliterado concreto, ya que los paquetes de `mlx-community` derivan del modelo base no abliterado. El autor reporta 105,6 tok/s sin drafter y 179,3 tok/s con un drafter DFlash sobre un M5 Max.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (`qwen3_5`), transformer híbrido: 3 capas de `linear_attention` + 1 de `full_attention` por cada 4 capas, 32 capas en total |
| Parametros totales | 8 953 803 264 (8,95 B); la model card indica 9,41 B para el modelo completo, diferencia atribuible a la eliminación de la torre de visión y a los tensores no cuantizados |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (M-RoPE nativo, sin necesidad de YaRN) |
| Tipos de cuantizacion | 4 bits afines, `group_size: 64` (≈4,5 bits efectivos); el repo upstream ofrece BF16, y el autor documenta reconversiones a 6 y 8 bits con `mlx_vlm.convert` |
| Idiomas soportados | en, zh, ja, ko, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors MLX (1 fichero), 927 tensores; tokenizer en `vocab.json`, `added_tokens.json` y `special_tokens_map.json` |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso híbrido de 32 capas que alterna atención lineal y atención completa en una proporción de 3 a 1, lo que reduce el coste de atención en contextos largos manteniendo capacidad de recuperación global cada cuatro capas. Usa RoPE multidimensional (M-RoPE) nativo, lo que permite alcanzar 262 144 tokens de contexto sin extrapolación tipo YaRN. El vocabulario del tokenizer es de 248 320 entradas y la plantilla de chat soporta XML de tool-calling y el flag `enable_thinking`.

El entrenamiento se hereda íntegramente del linaje upstream: destilación de aproximadamente 250 000 muestras de matemáticas y STEM generadas por DeepSeek-V4-Pro en modo Max Effect, seguidas de SFT y una etapa ligera de RL con GSPO. No se incluyeron datos de código en el entrenamiento. Posteriormente se aplicó Heretic v2 (Arbitrary-Rank Ablation) sobre las capas 9 a 24, reduciendo las negativas de 100/100 a 3/100 con una divergencia KL de 0,0422 respecto al modelo original. Esta conversión MLX no reentrena ni vuelve a fusionar pesos: solo cuantiza y elimina `model.visual.*` (333 tensores, 0,456 B de parámetros). El checkpoint heretic tampoco incluye la cabeza MTP que sí tenía el modelo base.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo "thinking" activable mediante `enable_thinking` en la plantilla de chat.
- Razonamiento matemático y resolución de problemas STEM, eje central del entrenamiento por destilación.
- Tool calling / function calling mediante XML estructurado en la plantilla de chat.
- Capacidades multilingües en inglés, chino, japonés, coreano, español y ruso.
- Comportamiento "uncensored": las negativas se reducen drásticamente respecto al modelo base según la métrica reportada por el autor.
- Sin capacidades de visión: la torre de imagen fue eliminada en la conversión.
- Sin cabeza MTP, por lo que no dispone de decodificación especulativa nativa; el autor la suple con drafters externos DFlash.

## Casos de uso

- Razonamiento matemático local en estaciones de trabajo Apple Silicon: un Mac con memoria unificada suficiente puede ejecutar el modelo a más de 100 tok/s para resolver problemas de cálculo, álgebra o demostraciones, sin depender de API externa.
- Asistente de investigación en STEM con contexto largo: los 262 144 tokens permiten cargar artículos completos, apéndices y notas de laboratorio en una sola ventana para extraer relaciones y resumir resultados.
- Procesamiento por lotes de documentación técnica multilingüe: al cubrir seis idiomas, puede normalizar, traducir o resumir corpus en inglés, chino, japonés, coreano, español y ruso en un mismo pipeline.
- Generación de contenido sin filtros para investigación sobre alineación y seguridad: útil para estudiar comportamientos de modelos abliterados y comparar distribuciones de respuesta frente al checkpoint original.
- Desarrollo de agentes con tool calling en local: la plantilla soporta XML de llamadas a herramientas, lo que permite orquestar flujos multi-paso con herramientas externas sin salir del dispositivo.
- Prototipado rápido en portátiles: el paquete de 5,04 GB se carga en `mlx-lm` o MLX-Serve y permite iterar sobre prompts y evaluaciones sin infraestructura GPU dedicada.
- Servicio de inferencia interno de baja latencia: con un drafter DFlash acoplado se alcanzan 179,3 tok/s en M5 Max, suficiente para asistentes interactivos en equipos de desarrollo.

## Benchmarks y rendimiento

El autor publica mediciones de velocidad de decodificación, no de calidad. Se reproducen a continuación:

| Build | Decodificación, prompt corto | Decodificación, prompt de 5K | Contexto | Especulación |
|---|---|---|---|---|
| GGUF Q4_K_M upstream con `--mlx-gguf` | 87,7 tok/s | no disponible | 132 096 (limitado automáticamente) | ninguna posible |
| Este paquete sin drafter | 105,6 tok/s | no disponible | 262 144 | solo PLD |
| Este paquete + `z-lab/Qwen3.5-9B-DFlash` | 172,6 tok/s | ~250 tok/s | 262 144 | DFlash, `spec_exact: true` |
| Este paquete + `guglxni/Qwen3.5-9B-abliterated-DFlash` | 179,3 tok/s | ~281 tok/s | 262 144 | DFlash, `spec_exact: true` |

Medido en Apple M5 Max con 128 GB de memoria unificada, MLX-Serve 26.11.2 (mlx 0.32.5), mismo prompt matemático, temperatura 0, mediana de 3 ejecuciones con descarga y recarga entre brazos. El autor también reporta el efecto del tamaño de bloque del drafter: 16 → 185,6 tok/s, 8 → 185, 4 → 162, 2 → 104 tok/s.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada: 5,04 GB de pesos en 4 bits; con overhead de runtime, se recomienda al menos 8 GB de memoria unificada para contexto corto y bastante más para explotar los 262 144 tokens.
- GPU recomendadas: exclusivamente Apple Silicon (M1, M2, M3, M4, M5 y variantes Pro/Max/Ultra). El formato MLX no se ejecuta en GPU NVIDIA ni AMD.
- Cabe en cualquier Mac con memoria unificada de 8 GB o superior en cuantización 4 bits; para contextos largos y drafter conviene 32 GB o más.
- Opciones de despliegue: `mlx-lm`, MLX-Serve (versión 26.11.2 o superior según el autor). No es compatible con vLLM, TGI ni llama.cpp en su forma actual; para llama.cpp existen builds GGUF hermanas del mismo checkpoint.
- Latencia y throughput: 105,6 tok/s sin drafter y 179,3 tok/s con `guglxni/Qwen3.5-9B-abliterated-DFlash` en M5 Max; ~281 tok/s con prompt de 5K en la misma configuración. El autor advierte que el bloque 2 del drafter es más lento que no usar drafter.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este paquete (MLX 4-bit) | 8,95 B | 262 144 | safetensors MLX | Apache 2.0 | Solo texto, sin visión ni MTP |
| `xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic` | 9,41 B | 262 144 | safetensors BF16 | Apache 2.0 | Incluye torre de visión, 18,85 GB |
| `mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF` | 9 B aprox. | no disponible | GGUF | Apache 2.0 | Para llama.cpp y motores GGUF |
| `mlx-community/DeepSeek-V4-Pro-Qwen3.5-9B-*` | 9 B aprox. | no disponible | safetensors MLX | Apache 2.0 | Conversión del base no abliterado, pesos distintos |

## Limitaciones y advertencias

- La cuantización a 4 bits es con pérdida: el autor indica explícitamente que se degrada la precisión respecto a BF16.
- Se ha eliminado la torre de visión; el modelo no acepta imágenes ni vídeo.
- No incluye cabeza MTP, por lo que la decodificación especulativa requiere drafters externos.
- El proceso de abliteración reduce negativas a 3/100 según el autor, lo que implica que puede generar contenido que otros modelos rechazarían; requiere filtros y políticas de uso en producción.
- Riesgo de alucinación no cuantificado: no hay benchmarks de calidad publicados en la información disponible.
- El entrenamiento se centró en matemáticas y STEM y excluyó datos de código, por lo que el rendimiento en programación no está respaldado por el diseño del modelo.
- Solo se ejecuta en Apple Silicon; no hay soporte para CUDA, ROCm ni aceleradores de otros fabricantes.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de filtros de seguridad hace necesario evaluar el cumplimiento normativo antes de desplegarlo en aplicaciones de cara al usuario.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha; no hay validación independiente de su comportamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/laewr/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-MLX-4bit
- Modelo base: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo original destilado: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Build GGUF: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Drafter DFlash: https://huggingface.co/z-lab/Qwen3.5-9B-DFlash
- Drafter DFlash abliterado: https://huggingface.co/guglxni/Qwen3.5-9B-abliterated-DFlash
