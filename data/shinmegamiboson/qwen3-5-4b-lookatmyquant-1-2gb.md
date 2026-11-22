# shinmegamiboson/Qwen3.5-4B-LookAtMyQuant-1.2GB

## Resumen

Qwen3.5-4B-LookAtMyQuant-1.2GB es una cuantización extrema del modelo Qwen3.5-4B de Alibaba Qwen, publicada por el usuario independiente shinmegamiboson bajo el método de compresión LookAtMyQuant 2. El resultado empaqueta los pesos del modelo original en un único fichero `weights.bin` de 1,23 GB, lo que equivale a aproximadamente 2,3 bits por peso, una ratio de compresión muy agresiva para un transformer denso de 4.000 millones de parámetros.

El modelo no es un modelo nuevo: es el mismo Qwen3.5-4B con los pesos cuantizados en un formato propietario llamado `opgraph-packed-1`, que solo puede leerse mediante el runtime `runtime_mlx/fast_q35.py` del repositorio LookAtMyQuant. No se distribuye en GGUF, safetensors ni ningún formato estándar, por lo que su uso queda restringido al ecosistema MLX sobre Apple Silicon.

Su relevancia es acotada pero interesante para investigación en cuantización: demuestra que es posible mantener un rendimiento razonable (330 de 540 problemas matemáticos con respuesta exacta, según el autor) con una divergencia KL de 0,45 nats respecto al modelo original en texto retenido, a un coste de memoria muy inferior al de las cuantizaciones convencionales de 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3.5-4B); pesos empaquetados en formato `opgraph-packed-1` |
| Parametros totales | 4.000 millones (modelo base Qwen3.5-4B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Cuantizacion LookAtMyQuant 2 a ~2,3 bits por peso (unica variante publicada) |
| Idiomas soportados | en (segun la model card y los tags) |
| Licencia | no disponible |
| Formato de pesos | `weights.bin` + `artifact.json` (formato propietario `opgraph-packed-1`); tokenizer y config en JSON/Jinja estandar |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3.5-4B original, un transformer denso de aproximadamente 4.000 millones de parámetros desarrollado por Alibaba Qwen. Esta publicación no entrena ni afina el modelo: únicamente aplica una receta de compresión de pesos denominada LookAtMyQuant 2, que empaqueta las matrices en un grafo de operaciones (`opgraph-packed-1`) y guarda en `recovery.json` el registro del empaquetador para cada matriz, generado por `runtime_mlx/pack_dense.py`.

El detalle técnico diferencial es la ratio de compresión: 2,3 bits por peso, lo que reduce el modelo a 1,23 GB. El autor reporta dos métricas de calidad: 330 de 540 problemas matemáticos con respuesta exacta y una divergencia KL de 0,45 nats frente al original en texto retenido. No se especifican en la información disponible los datos de entrenamiento del modelo base, ni si hubo RLHF/DPO, ni la composición del dataset. El runtime incluye soporte de decodificación especulativa mediante un drafter separado (Qwen3.5-4B-LookAtMyQuant-1.2GB-drafter), que según el autor acelera la generación entre 1,5 y 2 veces manteniendo el mismo texto de salida.

## Capacidades

- Generación de texto conversacional, con plantilla de chat propia de Qwen3.5-4B (`chat_template.jinja`).
- Razonamiento matemático de varios pasos, con modo thinking activable o desactivable (`enable_thinking` en la plantilla de chat).
- Resolución de problemas aritméticos y de respuesta exacta, con una tasa reportada de 330/540 en el conjunto de evaluación del autor.
- Generación de código y texto general, heredada del modelo base (no se detalla en la información disponible).
- Capacidades multilingües: limitadas a inglés según los metadatos del repositorio.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Decodificación especulativa con drafter dedicado para acelerar la inferencia.

## Casos de uso

- Experimentación en cuantización extrema sobre Apple Silicon: el modelo sirve como banco de pruebas para medir la degradación de calidad a 2,3 bits por peso frente al Qwen3.5-4B original, usando la métrica de divergencia KL y el conjunto de 540 problemas matemáticos del autor.
- Inferencia local en Macs con memoria unificada limitada: con 1,23 GB de pesos, el modelo cabe holgadamente en cualquier Mac con Apple Silicon de 8 GB o más, permitiendo ejecutar un modelo de 4B en equipos donde una cuantización de 4 bits (unos 2,3 GB) dejaría menos margen para el contexto y el sistema.
- Evaluación de decodificación especulativa: el par modelo + drafter permite reproducir el benchmark `bench_drafted.py` y medir la aceleración de 1,5 a 2 veces reportada, útil para investigar técnicas de inferencia acelerada en MLX.
- Prototipado de asistentes conversacionales en inglés sobre macOS: la plantilla de chat y el modo thinking permiten montar un chatbot local de razonamiento sin depender de servicios en la nube, siempre que el caso de uso tolere la pérdida de precisión inherente a la compresión.
- Reproducción de investigación en compresión de pesos: el repositorio LookAtMyQuant incluye la receta y las herramientas (`pack_dense.py`, `fast_q35.py`), lo que permite aplicar el mismo método a otros modelos densos y comparar resultados.
- Docencia y demostraciones de cuantización: el tamaño reducido y el formato empaquetado facilitan explicar en un portátil cómo se degrada un modelo con la compresión y cómo funciona un runtime de decodificación especulativa.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| Problemas matematicos con respuesta exacta | 330 de 540 | Conjunto de evaluacion del autor (LookAtMyQuant 2) |
| Divergencia KL respecto al original | 0,45 nats | Texto retenido (held-out) |
| Aceleracion con drafter | 1,5 a 2 veces | Mismo texto de salida, segun el autor |
| MMLU, HumanEval, GSM8K | no disponible | No publicados en la informacion proporcionada |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos son las métricas internas del autor, que no son directamente comparables con evaluaciones convencionales.

## Requisitos de hardware

- VRAM/memoria estimada: 1,23 GB solo para los pesos; hay que sumar la caché KV y el overhead del runtime MLX, por lo que en la práctica se recomienda un mínimo de 4-8 GB de memoria unificada.
- GPU recomendadas: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX; no hay soporte para GPU NVIDIA ni AMD en la información disponible.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon; no aplica a GPUs discretas convencionales (RTX 4090, etc.) porque el formato `opgraph-packed-1` solo lo lee el runtime MLX del repositorio.
- Opciones de despliegue: `mlx` + `mlx_lm` con `runtime_mlx/fast_q35.py`; no compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma absoluta; el autor reporta una aceleración relativa de 1,5 a 2 veces al usar el drafter.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-LookAtMyQuant-1.2GB | 4B | no disponible | `opgraph-packed-1` (MLX) | no disponible | 32 descargas, solo Apple Silicon |
| Qwen3.5-4B (original) | 4B | no disponible | safetensors | no disponible | Modelo base oficial de Alibaba Qwen |
| Cuantizaciones GGUF de 4 bits de modelos 4B | 4B | depende del modelo | GGUF | depende del modelo | Amplia, compatible con llama.cpp/Ollama |
| Cuantizaciones MLX de 4 bits de modelos 4B | 4B | depende del modelo | safetensors MLX | depende del modelo | Ecosistema MLX estandar |

La comparación directa con cuantizaciones convencionales es difícil porque este modelo usa un formato propietario y un runtime específico. Frente a una cuantización MLX de 4 bits típica (unos 2,3 GB para 4B), este modelo ocupa aproximadamente la mitad, a costa de un formato no estándar y de una degradación mayor (0,45 nats de KL).

## Limitaciones y advertencias

- Formato propietario: los pesos solo se pueden cargar con el runtime `runtime_mlx/fast_q35.py` del repositorio LookAtMyQuant; no funcionan con llama.cpp, Ollama, vLLM ni transformers estándar.
- Plataforma restringida: requiere macOS con Apple Silicon y las librerías `mlx` y `mlx_lm`; no hay soporte para Linux, Windows ni GPUs NVIDIA.
- Licencia no disponible: no se especifica la licencia del modelo ni la del modelo base en la información proporcionada, lo que impide confirmar si el uso comercial está permitido. Verificar antes de cualquier despliegue en producción.
- Idiomas: solo inglés según los metadatos; el rendimiento en castellano no está evaluado y probablemente sea deficiente.
- Degradación de calidad: 0,45 nats de KL y 330/540 en matemáticas indican una pérdida medible frente al modelo original; no es adecuado para tareas que exijan precisión alta sin validación adicional.
- Riesgo de alucinación: inherente a los modelos de 4B y acentuado por la compresión extrema a 2,3 bits; requiere verificación de salidas en producción.
- Sesgos: no documentados en la información disponible; se heredan los del modelo base Qwen3.5-4B, no analizados aquí.
- Contexto: la longitud de contexto no se especifica en la información disponible; el formato empaquetado podría imponer límites adicionales no documentados.
- Madurez: repositorio con 32 descargas, 0 likes y mantenido por un autor individual; sin garantías de soporte ni mantenimiento a largo plazo.
- Dependencia del drafter: la aceleración reportada requiere descargar un segundo modelo (el drafter de 4 bits) y usar el script `bench_drafted.py`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shinmegamiboson/Qwen3.5-4B-LookAtMyQuant-1.2GB
- Drafter asociado: https://huggingface.co/shinmegamiboson/Qwen3.5-4B-LookAtMyQuant-1.2GB-drafter
- Repositorio LookAtMyQuant: https://github.com/ShinMegamiBoson/lookatmyquant
- Página de la receta y resultados: https://lookatmyquant.pages.dev/2/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
