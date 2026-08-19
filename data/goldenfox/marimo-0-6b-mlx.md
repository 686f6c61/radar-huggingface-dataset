# goldenfox/marimo-0.6b-mlx

## Resumen

Marimo 0.6B es un modelo de investigación desarrollado por goldenfox que retroadapta el modelo Qwen/Qwen3-0.6B (Apache-2.0) a una arquitectura híbrida que combina generación autoregresiva con difusión discreta de texto (estilo MDLM). El modelo introduce dos mecanismos novedosos: bloques de pensamiento adaptativos, donde la región oculta de razonamiento se genera como una cadena de bloques denoizados en paralelo con tamaños controlados por tokens especiales, y una memoria tipo "ledger" que comprime el historial conversacional en notas de hechos clave, manteniendo el prompt de tamaño casi constante independientemente de la longitud de la conversación.

Con aproximadamente 596 millones de parámetros y una ventana de contexto de 2048 tokens, el modelo está orientado a tareas de toma de notas conversacionales y asistentes de registro. Se distribuye en formato MLX para Apple Silicon, con pesos en fp16 (~1,2 GB). El autor lo presenta explícitamente como un estudio de mecanismos, no como un asistente generalista, y advierte de sus limitaciones fuera del registro de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida autoregresiva + difusión discreta (MDLM-style) con bloques de pensamiento adaptativos y memoria ledger |
| Parametros totales | 596.049.920 (~0,6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | fp16 (única disponible) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte de los pesos de Qwen3-0.6B y los extiende con dos mecanismos entrenados conjuntamente. El primero, bloques de pensamiento adaptativos, divide el razonamiento oculto en bloques de tamaño variable (32, 64 o 128 tokens) que el modelo selecciona mediante tokens de tamaño (`<sz32>`, `<sz64>`, `<sz128>`). Cada bloque se denoiza en paralelo con 16 pasos de difusión discreta, y el proceso se repite hasta que el modelo emite el token de respuesta. La respuesta visible se decodifica autoregresivamente.

El segundo mecanismo, memoria ledger, mantiene solo los últimos 4 mensajes en contexto. Los bloques de pensamiento de cada turno se condensan en notas; cuando un turno sale de la ventana, sus notas se fusionan en un ledger de hechos clave (`Known so far:`) que se incorpora al prompt de sistema. Esto permite que el tamaño del prompt se mantenga casi constante en conversaciones largas.

El entrenamiento consistió en continued pretraining seguido de SFT sobre un corpus sintético de aproximadamente 15.000 diálogos con trazas de pensamiento, supervisión de tokens de tamaño y anotaciones de notas. Se realizó en una única RTX 3090. El port MLX se valida contra la referencia torch: los logits forzados por profesor coinciden en top-1 para el 99,97% de 13.156 filas probadas (KL media ≈ 4,6e-6), y los forwards con y sin caché concuerdan dentro de 1,6e-4.

## Capacidades

- Generación de texto y chat multi-turno con razonamiento interno visible (bloques de pensamiento denoizados).
- Memoria a largo plazo mediante ledger: mantiene hechos clave de conversaciones largas sin crecer el contexto.
- Toma de notas conversacional: el registro por defecto es el de asistente de captura de información.
- Control de tamaño de pensamiento mediante tokens especiales (32, 64, 128 tokens por bloque).
- Decodificación autoregresiva para la respuesta final, con denoising paralelo para el razonamiento.
- Soporte de parámetros de muestreo (temperatura, top-p) y configuración de ventana de mensajes.
- Solo inglés; sin capacidades multimodales ni tool calling explícito.

## Casos de uso

- Asistente de toma de notas en entrevistas o reuniones: el modelo puede mantener un registro estructurado de hechos mencionados a lo largo de una conversación larga, gracias al ledger que comprime la información en notas clave.
- Atención al cliente con historial extenso: la memoria ledger permite retener datos del usuario (preferencias, pedidos, incidencias) sin agotar la ventana de contexto de 2048 tokens.
- Extracción de hechos en diálogos simulados: el modo de pensamiento visible (`--show-thinking`) permite auditar cómo el modelo decide qué información registrar.
- Prototipado de sistemas de diálogo con memoria comprimida: investigadores pueden estudiar el comportamiento del ledger frente a la memoria completa en tareas de recuerdo de hechos.
- Evaluación de arquitecturas híbridas autoregresivas + difusión: útil como banco de pruebas para comparar mecanismos de denoising de pensamiento en modelos pequeños.
- Generación de resúmenes conversacionales: dado un diálogo, el modelo puede producir un resumen de hechos clave en formato de notas, aprovechando su entrenamiento en registro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor incluye una evaluación interna de "ledger needle": en una prueba de 40 turnos con 10 hechos plantados que deben recordarse al final, Marimo 0.6B recordó 6/10 con un prompt constante de ~500 tokens, mientras que Qwen3-0.6B base con el transcript completo en contexto recordó 1/10 (degenerando en eco repetitivo). El propio autor advierte que es una prueba de una sola semilla y que la comparación mezcla mecanismo y datos de entrenamiento, por lo que debe leerse como dirección, no como resultado de benchmark.

## Requisitos de hardware

- Requiere macOS en Apple Silicon (MLX); no hay soporte para CUDA o CPU en este port.
- VRAM estimada: ~1,2 GB para los pesos fp16, más overhead de activaciones y KV cache; cabe en cualquier Mac con al menos 8 GB de memoria unificada.
- GPU recomendada: Apple Silicon M1 o superior (probado en M1 Pro).
- Rendimiento medido en M1 Pro: turnos completos ~2,2–4,2 s; decodificación autoregresiva ~15–24 tok/s con prefijo de 500 tokens.
- Opciones de despliegue: exclusivamente mediante el REPL `chat.py` incluido; no compatible con vLLM, llama.cpp, Ollama o TGI.
- La longitud máxima de secuencia es 2048 tokens; el REPL rechaza turnos que la excedan.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Marimo 0.6B (MLX) | 0,6B | 2048 | Híbrida AR + difusión discreta con ledger | Apache-2.0 | MLX (Apple Silicon) |
| Qwen3-0.6B (base) | 0,6B | 32K (original) | Transformer autoregresivo estándar | Apache-2.0 | PyTorch, MLX, GGUF, etc. |
| SmolLM2-0.6B | 0,6B | 2048 | Transformer autoregresivo | Apache-2.0 | PyTorch, GGUF, etc. |

La comparativa directa con Qwen3-0.6B es la más relevante, ya que Marimo deriva de él. La principal diferencia es el mecanismo de memoria ledger y el pensamiento por difusión, que en la prueba interna mejora el recuerdo de hechos en conversaciones largas, pero reduce la versatilidad general. No hay datos de benchmarks estándar para comparar rendimiento bruto.

## Limitaciones y advertencias

- Modelo de 0,6B: es un estudio de mecanismos, no un asistente general. Es probable que cometa errores factuales y sea frágil fuera del registro de toma de notas conversacional para el que fue afinado.
- Solo entrenado con datos en inglés; no soporta otros idiomas.
- Contexto limitado a 2048 tokens; documentos largos no caben.
- El ledger solo registra lo que el modelo decide anotar durante el pensamiento; los hechos que no se anotan se pierden cuando el turno sale de la ventana.
- La licencia Apache-2.0 permite uso comercial, pero los pesos derivan de Qwen3-0.6B (también Apache-2.0); no hay restricciones adicionales conocidas.
- El port MLX solo funciona en Apple Silicon; no hay versiones para GPU NVIDIA o CPU estándar.
- La evaluación interna es de una sola semilla y no constituye un benchmark riguroso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/goldenfox/marimo-0.6b-mlx
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
