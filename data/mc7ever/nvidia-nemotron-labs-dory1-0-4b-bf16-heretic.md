# MC7ever/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16-heretic

## Resumen
NVIDIA-Nemotron-Labs-Dory1.0-4B es un modelo de lenguaje de 4.000 millones de parámetros desarrollado por NVIDIA Labs, publicado en octubre de 2026 bajo la licencia OpenMDW-1.1. La versión aquí analizada es una modificación "abliterated" (decensored) creada por el usuario MC7ever mediante la herramienta Heretic v2.1.0, que elimina parcialmente el comportamiento de rechazo del modelo original aplicando una ablación de rango arbitrario (ARA) sobre las capas 16 a 35.

La innovación técnica principal del modelo base es su arquitectura de tipo "looped" o latent-recurrent: una pila de capas dividida en bloques de entrada (8 capas), recurrentes (20 capas) y salida (8 capas), donde el bloque recurrente se aplica repetidamente entre los bloques de entrada y salida, reinyectando la entrada en cada iteración. Esto permite un presupuesto de cómputo elástico en inferencia: un único checkpoint puede ejecutarse con 1, 2, 4 o más bucles, intercambiando cómputo por precisión sin reentrenamiento ni cambio de pesos.

El modelo está pensado para razonamiento general con huella reducida, soporta contextos de hasta 256.000 tokens, está entrenado nativamente en NVFP4 antes de continuar en BF16, y está disponible también en MXFP8 y GGUF Q5_K_M. La versión heretic reduce los rechazos de 100/100 a 8/100 con una divergencia KL de 0,0664 respecto al original, y es reproducible mediante los scripts incluidos en el directorio `reproduce`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT normalizado (nGPT) con bucle latente-recurrente e intercalado de atención de ventana deslizante (SWA) y atención completa |
| Parámetros totales | 3.975.229.440 (~4B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 256.000 tokens |
| Tipos de cuantización | BF16 (este repo), MXFP8, NVFP4, GGUF Q5_K_M (formatos oficiales del modelo base) |
| Idiomas soportados | Inglés |
| Licencia | OpenMDW-1.1 (heredada del modelo base) |
| Formato de pesos | safetensors (BF16) |
| Librería | transformers |
| Tamaño del repo | 8,0 GB |
| Fecha de publicación (base) | 16 de octubre de 2026 |
| Modelo base | nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16 |

## Arquitectura y entrenamiento
Dory1.0-4B utiliza una arquitectura nGPT (normalized GPT) con atención híbrida: capas de atención de ventana deslizante intercaladas con capas de atención completa. La pila se organiza en tres grupos: bloque de entrada (8 capas), bloque recurrente compartido (20 capas) y bloque de salida (8 capas). El bloque recurrente se aplica N veces (bucles) entre entrada y salida, y la representación de entrada se reinyecta en cada bucle. Esto permite escalar el cómputo por token sin aumentar el número de parámetros, y en la práctica el modelo necesita menos tokens generados para resolver una tarea porque el cómputo adicional se dedica a "pensar" en espacio latente.

El modelo fue preentrenado nativamente en NVFP4 (formato de coma flotante de 4 bits de NVIDIA) y posteriormente continuado en BF16. Los datos de preentrenamiento tienen fecha de corte en septiembre de 2025; los de postentrenamiento, en mayo de 2026, usando los datasets `nvidia/nemotron-pre-training-datasets` y `nvidia/nemotron-post-training-v3`. No se especifica en la información disponible el número exacto de tokens de entrenamiento ni la composición detallada del dataset. Una innovación relevante es el "last-loop KV caching": en lugar de almacenar una caché KV por cada bucle, Dory mantiene una única caché por capa de atención recurrente, eliminando el sobrecoste de memoria asociado al bucle independientemente del número de iteraciones.

La modificación heretic aplica una ablación de rango arbitrario (ARA) con los parámetros: capas 16 a 35, peso de preservación de buen comportamiento 0,9327, peso de dirección de mal comportamiento 0,0021, peso relativo de sobrecorrección 0,7339 y vecinos 3.

## Capacidades
- Generación de texto en inglés con razonamiento general y presupuesto de cómputo ajustable en inferencia (1, 2, 4 o más bucles).
- Razonamiento en espacio latente con eficiencia de tokens: menos tokens de salida para tareas complejas.
- Contexto largo de hasta 256.000 tokens, apto para documentos extensos y conversaciones multi-turno.
- Comportamiento de rechazo reducido tras la ablación heretic (8/100 frentes a 100/100 del original), orientado a usos que requieren respuestas sin negativa.
- Inferencia elástica: mismo checkpoint sirve distintos presupuestos de cómputo sin reentrenamiento.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.
- Multilingüe limitado: solo inglés declarado.
- Reproducibilidad: scripts en `reproduce/README.md` para regenerar la ablación.

## Casos de uso
- Razonamiento general con huella reducida: desplegar el modelo con 1 bucle para tareas simples y con 2-4 bucles para tareas que exigen más precisión, usando el mismo checkpoint en ambos casos.
- Análise de documentos largos: con 256K tokens de contexto, el modelo puede procesar informes, contratos o expedientes completos en una sola pasada sin truncamiento.
- Generación de texto sin rechazos: escenarios de escritura creativa, ficción o contenido editorial donde el comportamiento de rechazo del modelo original resulta limitante.
- Investigación sobre alineación y decensoring: la ablación reproducible con parámetros ARA documentados permite estudiar experimentalmente el efecto de la eliminación de rechazos sobre la calidad del modelo (KL 0,0664).
- Asistentes conversacionales en inglés con presupuesto de latencia ajustable: reducir bucles en producción de baja latencia y aumentarlos en tareas batch de mayor exigencia.
- Evaluación comparativa de arquitecturas looped frente a transformers convencionais: útil en investigación para medir la relación entre cómputo por token y precisión.
- Prototipado en hardware consumer: 4B parámetros en BF16 (8 GB de repo) permiten ejecución en GPUs de gama alta de consumo con cuantización adicional.

## Benchmarks y rendimiento

La model card del modelo original incluye una tabla de benchmarks con resultados para Dory1.0-4B en 1, 2 y 4 bucles comparado con Qwen3.5-4B, Qwen3.5-9B, Gemma 4 26B A4B y Qwen3.6-35B-A3B. En la información proporcionada solo se ha recuperado la cabecera de la tabla (tareas de "Coding & Agentic") sin los valores numéricos de las filas, que aparecen truncados. Por tanto, no se dispone de cifras concretas que reproducir.

| Métrica (versión heretic) | Este modelo | Modelo original |
|---|---|---|
| Rechazos (de 100) | 8 | 100 |
| Divergencia KL | 0,0664 | 0 (por definición) |

No se han publicado en la información disponible resultados numéricos de MMLU, HumanEval, GSM8K u otras tareas para esta versión ni para el modelo base.

## Requisitos de hardware
- VRAM para BF16: aproximadamente 8 GB solo para pesos (3.975 millones de parámetros × 2 bytes), más caché KV y activaciones; estimación práctica de 10-12 GB para contexto moderado.
- VRAM para cuantización Q5_K_M (GGUF): aproximadamente 3-4 GB de pesos, apto para GPUs de 8 GB.
- VRAM para NVFP4/MXFP8: formatos de 4 y 8 bits oficiales del modelo base, con huellas inferiores a BF16; no se dispone de cifras exactas en la información proporcionada.
- GPU recomendadas: A100, H100, L40S para BF16 en producción; RTX 4090 (24 GB) y RTX 3090 (24 GB) para BF16 con contexto amplio; GPUs de 8-12 GB (RTX 4060 Ti 16 GB, RTX 4070) para Q5_K_M.
- Cabe en GPU consumer: sí, en BF16 con GPUs de 16-24 GB y en Q5_K_M con 8 GB.
- Opciones de despliegue: transformers (formato nativo del repo), llama.cpp/Ollama (vía GGUF Q5_K_M del modelo base), vLLM y TGI (compatibilidad no verificada en la información disponible), endpoints compatibles según los tags del repo.
- Latencia y throughput: no disponibles. La arquitectura permite ajustar el número de bucles para intercambiar latencia por precisión; el ahorro de caché KV con last-loop caching elimina el sobrecoste de memoria por bucle.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Dory1.0-4B (este, heretic) | ~4B | 256K | OpenMDW-1.1 | Hugging Face (repo MC7ever) | Looped nGPT, ablación heretic, solo inglés |
| nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16 | ~4B | 256K | OpenMDW-1.1 | Hugging Face (NVIDIA) | Original sin ablación, rechazos 100/100 |
| Qwen3.5-4B | ~4B | no disponible en la info | no disponible en la info | Hugging Face | Referencia de la model card; resultados comparativos truncados |
| Qwen3.5-9B | ~9B | no disponible en la info | no disponible en la info | Hugging Face | Referencia de la model card |
| Gemma 4 26B A4B | ~26B (A4B MoE) | no disponible en la info | no disponible en la info | Hugging Face | Referencia de la model card |
| Qwen3.6-35B-A3B | ~35B (A3B MoE) | no disponible en la info | no disponible en la info | Hugging Face | Referencia de la model card |

Los valores de benchmarks comparativos no están disponibles en la información recuperada; la comparativa se limita a parámetros, contexto declarado y licencia.

## Limitaciones y advertencias
- Solo inglés: no se declara soporte multilingüe; el uso en castellano no está garantizado.
- La ablación heretic elimina rechazos, lo que implica que el modelo puede generar contenido que el original rechazaría; requiere filtrado y moderación externos en producción.
- Riesgo de alucinación inherente a modelos de 4B con contexto largo; no hay benchmarks disponibles para cuantificar la fiabilidad.
- La divergencia KL de 0,0664 indica una alteración medible de la distribución respecto al original; puede afectar la calidad en tareas sensibles.
- Licencia OpenMDW-1.1: permite uso comercial según el modelo base, pero deben revisarse los términos exactos en el enlace de licencia; el repo usa `license: other` con `license_name: openmdw-1.1`.
- Repo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.
- No se documenta soporte de tool calling, agentes, visión ni audio; no asumir estas capacidades.
- El sobrecoste de cómputo por bucle puede incrementar la latencia si se configuran múltiples bucles; debe medirse por caso de uso.
- Formatos oficiales del modelo base (MXFP8, NVFP4, GGUF) pueden no estar disponibles directamente en este repo heretic, que solo distribuye safetensors BF16.

## Enlaces
- Repo Hugging Face de esta versión: https://huggingface.co/MC7ever/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16-heretic
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Texto de la licencia: https://raw.githubusercontent.com/OpenMDW/OpenMDW/refs/heads/main/1.1/LICENSE.OpenMDW-1.1
- Heretic (herramienta de decensoring): https://heretic-project.org
- Página de desarrolladores Nemotron: https://developer.nvidia.com/nemotron
- Discord NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Dataset de postentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-post-training-v3
- Dataset de preentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-pre-training-datasets
